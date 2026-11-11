"""Regression checks for bounded, read-only continuation; no real project writes."""

import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


TOOL = Path(__file__).resolve().parents[1] / "resume-current.py"
SPEC = importlib.util.spec_from_file_location("resume_current", TOOL)
RESUME = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RESUME)


class ResumeCurrentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.audits = self.root / "audits"
        self.audits.mkdir()
        self.state = {
            "preservation": {"branch": "nihayat-active", "contentCommit": "1a967009e52f36923362b3a96e67574491314942"},
            "current": {
                "pairedUnitsByBook": {"muzaffar-al-mantiq": 40, "bidayat-al-hikma": 1, "nihayat-al-hikma": 3},
                "combinedUnits": 44,
                "nihayaExternalComparisonRecords": 1,
                "nihayaExternalComparisonsIntegrated": 1,
                "nihayaExternalComparisonsRemaining": 2,
            },
            "nextWork": {"firstNewExternalComparison": "N-I-02", "remainingExternalUnitIds": ["N-I-02", "N-I-03"]},
            "published": {"stage": 8, "pdfCount": 9},
        }
        self.register = {
            "summary": {"total": 3, "compared": 1, "incorporated": 1, "remaining": 2},
            "units": [{"unitID": f"N-I-{i:02d}", "comparisonComplete": i == 1, "findingsIncorporated": i == 1,
                       "currentArabicSha256": hashlib.sha256("عربي".encode()).hexdigest(),
                       "currentEnglishSha256": hashlib.sha256("English".encode()).hexdigest()} for i in range(1, 4)],
        }
        self.save()

    def save(self):
        (self.audits / "nihayat4-current-state.json").write_text(json.dumps(self.state), encoding="utf-8")
        (self.audits / "nihaya-external-comparison-register.json").write_text(json.dumps(self.register), encoding="utf-8")

    def check(self, check_text=False):
        return RESUME.inspect_checkpoint(self.root, check_text=check_text)

    def assert_blocked(self, part):
        result, code = self.check()
        self.assertEqual(2, code)
        self.assertIsNone(result["nextTask"])
        self.assertIn(part, " ".join(result["problems"]))
        self.assertLess(len(json.dumps(result).encode()), 3000)

    def write_books(self):
        books = {
            "muzaffar-al-mantiq": [f"M-V-{i:02d}" for i in range(1, 41)],
            "bidayat-al-hikma": ["B-I-01"],
            "nihayat-al-hikma": [f"N-I-{i:02d}" for i in range(1, 4)],
        }
        for slug, identifiers in books.items():
            path = self.root / slug / "data/book.json"
            path.parent.mkdir(parents=True)
            path.write_text(json.dumps({"units": [{"id": i, "arabic": "عربي", "english": "English"} for i in identifiers]}), encoding="utf-8")

    def snapshot(self):
        return {str(p.relative_to(self.root)): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}

    def test_default_succeeds_without_source_books_and_is_bounded(self):
        before = self.snapshot()
        result, code = self.check()
        self.assertEqual(0, code)
        self.assertEqual("N-I-02", result["nextTask"]["unit"])
        self.assertLess(len(json.dumps(result).encode()), 3000)
        self.assertEqual(before, self.snapshot())

    def test_duplicate_queue_refused(self):
        self.state["nextWork"]["remainingExternalUnitIds"].append("N-I-02")
        self.save()
        self.assert_blocked("duplicate IDs")

    def test_saved_comparison_incorporation_precedes_new_comparison(self):
        self.register["units"][0]["findingsIncorporated"] = False
        self.register["summary"]["incorporated"] = 0
        self.state["current"]["nihayaExternalComparisonsIntegrated"] = 0
        self.save()
        before = self.snapshot()
        result, code = self.check()
        self.assertEqual(0, code, result)
        self.assertEqual("incorporate_saved_comparison", result["nextTask"]["kind"])
        self.assertEqual("N-I-01", result["nextTask"]["unit"])
        self.assertEqual("N-I-02", result["firstNewComparison"])
        self.assertEqual(1, result["nihaya"]["awaitingIncorporation"])
        self.assertEqual(2, result["nihaya"]["remaining"])
        self.assertLess(len(json.dumps(result, indent=2).encode()), 3000)
        self.assertEqual(before, self.snapshot())

    def test_reordered_queue_refused(self):
        self.state["nextWork"]["remainingExternalUnitIds"].reverse()
        self.save()
        self.assert_blocked("ordered pending")

    def test_wrong_first_unit_refused(self):
        self.state["nextWork"]["firstNewExternalComparison"] = "N-I-03"
        self.save()
        self.assert_blocked("firstNewExternalComparison")

    def test_stale_counts_refused(self):
        self.state["current"]["nihayaExternalComparisonsIntegrated"] = 0
        self.save()
        self.assert_blocked("Stale current-state count")

    def test_wrong_combined_count_refused(self):
        self.state["current"]["combinedUnits"] = 43
        self.save()
        self.assert_blocked("combinedUnits")

    def test_null_content_checkpoint_refused(self):
        self.state["preservation"]["contentCommit"] = None
        self.save()
        self.assert_blocked("contentCommit")

    def test_stale_branch_refused(self):
        self.state["preservation"]["branch"] = "nihayat4-recovery-20261110"
        self.save()
        self.assert_blocked("Stale continuation branch")

    def test_missing_sparse_file_refused_without_traceback(self):
        (self.audits / "nihaya-external-comparison-register.json").unlink()
        self.assert_blocked("Cannot read nihaya-external-comparison-register.json")

    def test_duplicate_register_id_refused(self):
        self.register["units"][2]["unitID"] = "N-I-02"
        self.save()
        self.assert_blocked("duplicate unit IDs")

    def test_incorporation_without_comparison_refused(self):
        self.register["units"][1]["findingsIncorporated"] = True
        self.save()
        self.assert_blocked("no completed external comparison")

    def test_malformed_json_refused(self):
        (self.audits / "nihayat4-current-state.json").write_text("{broken", encoding="utf-8")
        self.assert_blocked("Cannot read nihayat4-current-state.json")

    def test_optional_text_check_preserves_all_files(self):
        self.write_books()
        before = self.snapshot()
        result, code = self.check(check_text=True)
        self.assertEqual(0, code, result)
        self.assertEqual(before, self.snapshot())

    def test_default_ignores_changed_body_optional_check_refuses_it(self):
        self.write_books()
        path = self.root / "nihayat-al-hikma/data/book.json"
        book = json.loads(path.read_text())
        book["units"][0]["english"] = "Newer unrecorded text: preserve it"
        path.write_text(json.dumps(book), encoding="utf-8")
        before = self.snapshot()
        self.assertEqual(0, self.check()[1])
        result, code = self.check(check_text=True)
        self.assertEqual(2, code)
        self.assertIn("Integrated english hash differs", " ".join(result["problems"]))
        self.assertEqual(before, self.snapshot())


if __name__ == "__main__":
    unittest.main()
