/-!
  Tahdhīb: independently checked core temporal proof certificates.

  Scope: *arbitrary individuals and instants*, NOT the full post-Avicennan
  necessity/possibility semantics. The 46 historically typed modal results
  in Stage97 are NOT proved by these temporal consequences.

  Sources: al-Kātibī, al-Shamsiyyah §§95–104; Street (2024);
  Stage101_DOMAIN_INDEPENDENT_PROOF_BOUNDARIES.md.

  This file uses only Lean 4's Init (no mathlib and no unchecked axioms).
-/
import Init

namespace Tahdhib

universe u v
variable {D : Type u} {T : Type v}

def Actual (A : D → T → Prop) (x : D) : Prop :=
  ∃ t, A x t

def Excludes (A B : D → T → Prop) (x : D) : Prop :=
  ∀ t, A x t → ¬ B x t

/-- A particular special negative temporal *consequence*: same individual
    actualizes both subject and predicate at different instants; the two
    never overlap. This is NOT a full medieval modal definition. -/
def SpecialNegative (A B : D → T → Prop) (x : D) : Prop :=
  Actual A x ∧ Excludes A B x ∧ Actual B x

/-- Particular affirmative description bridge, not arbitrary instantaneous I. -/
def DescriptionAffirmative (A B : D → T → Prop) (x : D) : Prop :=
  Actual A x ∧ ∀ t, A x t → B x t

/-- Universal special negative, quantified for every actually titled subject. -/
def UniversalSpecial (A B : D → T → Prop) : Prop :=
  ∀ x, Actual A x → Excludes A B x ∧ Actual B x

/-- Special negative conversion: a theorem for all D and T with no
    nonemptiness or finiteness assumptions. -/
theorem convert_special
    {A B : D → T → Prop} {x : D}
    (h : SpecialNegative A B x) : SpecialNegative B A x :=
  ⟨h.2.2,
    (fun t htB htA => h.2.1 t htA htB),
    h.1⟩

/-- Sixth fourth-figure mood: O(M,S) special and A(P,M) universal
    entails ordinary O(S,P), using the same particular witness. -/
theorem sixth_temporal
    {S M P : D → T → Prop}
    (hO : ∃ x, SpecialNegative M S x)
    (hA : ∀ x t, P x t → M x t) :
    ∃ x, ∃ t, S x t ∧ ¬ P x t :=
  Exists.elim hO (fun x hx =>
    Exists.elim hx.2.2 (fun t htS =>
      ⟨x, t, htS,
        (fun htP => hx.2.1 t (hA x t htP) htS)⟩))

/-- Seventh fourth-figure mood: O(P,M) special and A(M,S) universal
    entails ordinary O(S,P) by the third-figure bridge. -/
theorem seventh_temporal
    {S M P : D → T → Prop}
    (hO : ∃ x, SpecialNegative P M x)
    (hA : ∀ x t, M x t → S x t) :
    ∃ x, ∃ t, S x t ∧ ¬ P x t :=
  Exists.elim hO (fun x hx =>
    Exists.elim hx.2.2 (fun t htM =>
      ⟨x, t, hA x t htM,
        (fun htP => hx.2.1 t htP htM)⟩))

/-- Eighth mood: the universal special E(M,S) minor and a
    PARTICULAR but description-persistent I(P,M) major yield a
    special O(S,P) temporal consequence, via first figure and conversion.
    The result's specific historical AD2 necessity/type is NOT proved here. -/
theorem eighth_temporal
    {S M P : D → T → Prop}
    (hE : UniversalSpecial M S)
    (hI : ∃ x, DescriptionAffirmative P M x) :
    ∃ x, SpecialNegative S P x :=
  Exists.elim hI (fun x hx =>
    Exists.elim hx.1 (fun t0 htP =>
      let hM : Actual M x := ⟨t0, hx.2 t0 htP⟩
      let hMS : Excludes M S x ∧ Actual S x := hE x hM
      let hPS : SpecialNegative P S x :=
        ⟨⟨t0, htP⟩,
          (fun t hPt hSt => hMS.1 t (hx.2 t hPt) hSt),
          hMS.2⟩
      ⟨x, convert_special hPS⟩))

/-- Special-negative conclusions entail ordinary negative particulars.
    Again: this loses the richer original modal type, on purpose. -/
theorem special_implies_particular
    {A B : D → T → Prop} {x : D}
    (h : SpecialNegative A B x) :
    ∃ t, A x t ∧ ¬ B x t :=
  Exists.elim h.1 (fun t htA =>
    ⟨t, htA, h.2.1 t htA⟩)

end Tahdhib
