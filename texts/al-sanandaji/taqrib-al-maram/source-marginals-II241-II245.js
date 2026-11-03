/* Stage23: two genuine source-image lower-register units, individually attributed to no historical author. */
(()=>{'use strict';const b=window.GNAMMA_BOOK;if(!b||b.id!=='taqrib')return;for(const n of [
  {
    "id": "G.II.241.23.01",
    "page": 241,
    "pdf": 536,
    "title": "Disembodiment versus immateriality in itself",
    "arabic": "(قوله من التجرد) أي تجردها عن أبدانها وإلا فهي مجردة في ذاتها مطلقا عند الفلاسفة",
    "english": "‘Concerning his expression “from disembodiment”’: that is, the souls' being separated from their bodies; otherwise, according to the philosophers, they are immaterial in their own reality in any case.",
    "citation": "Original Taqrīb vol.II:241, physical PDF 536, first lower-register note beginning (قوله من التجرد), ending before the following (قوله على بعض الأقوال). Source image read 3 November 2026.",
    "kind": "Bounded individual lower-register note, first-pass complete in its printed span; historical author UNASSIGNED, no independent second proof."
  },
  {
    "id": "G.II.245.23.01",
    "page": 245,
    "pdf": 540,
    "title": "First occurrence and a later return",
    "arabic": "(قوله واقع أولا) أي في المرة الأولى",
    "english": "‘Concerning his words “it occurs first”’: that is, in the first occurrence.",
    "citation": "Original Taqrīb vol.II:245, source PDF 540, lower small-print register after second dividing rule; selected opening phrase directly read 3 November 2026.",
    "kind": "Short selected phrase from a much longer individual-source-uncertain marginal objection; author UNASSIGNED; full lower note remains untranslated."
  }
]){const p=b.units.find(u=>u.id==='P2.'+String(n.page).padStart(3,'0'));if(!p)continue;p.layers=p.layers||{};p.layers.margins=p.layers.margins||[];if(!p.layers.margins.some(x=>x.id===n.id))p.layers.margins.push(n);}})();