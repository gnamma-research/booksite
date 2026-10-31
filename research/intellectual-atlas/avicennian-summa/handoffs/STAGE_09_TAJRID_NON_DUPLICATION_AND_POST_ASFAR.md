# Stage 09 — Tajrīd comparison and post-*Asfār* distinctive research

**1 November 2026 · cumulative scholarly handoff · GNAMMA staging reader**

**Primary directive:** The separate *Tajrīd* project already owns its thirty questions, 837 Ṭūsī units and heterogeneous source extracts. Late Avicennism must not reconstruct the same *matn–sharḥ–ḥāshiya* material a second time. Preserve and link the canonical Tajrīd sourcebook; focus on independently attested developments of later philosophy **after Ṭūsī and especially in the tradition following Ṣadrā's *Asfār***. The corpus must be read as an extended argumentative text, not a random sentence correlated by a title keyword.

## 1. Where the two projects now meet

- **Canonical [Tajrīd reader](../../tajrid/):** thirty question units; source-graded Arabic quotations and English translations; Ṭūsī, Ḥillī, Iṣfahānī, Jurjānī, Qūshjī, Dawwānī, Dashtakī, Lāhījī and the transmission branches where verified. These sources remain owned by that project.
- **[Thirty-question crosswalk](../../avicennism/TAJRID_NON_DUPLICATION_CROSSWALK.json):** all Q01–Q30, direct Tajrīd reader links, the Late Avicennism *distinctive question*, actual later evidence and unfilled primary gaps. This is a **question-level** division of research responsibilities.
- **[Earlier exact overlap audit](../../avicennism/TAJRID_DEDUP_AND_POST_ASFAR_SCOPE.json):** printed-page and source-ID audit, e.g. identical *Shawāriq* I:90–91 and *Sharḥ al-Maqāṣid* p.79, and the distinction between Astarābādī volume I and volume II. This is the **witness/page-level** duplication check, not a second thirty-question map.
- **[Twelve post-*Asfār* dossiers](../../avicennism/POST_ASFAR_DISTINCTIVE_DOSSIERS.json):** later philosophical modifications, their actual local arguments and gaps. Two have newly opened direct post-Ṣadrian source passages.
- **[Context apparatus](../../avicennism/argument-context.json)** and [explicit debate edges](../../avicennism/argument-links.json): source heading, exact locus, prior claim, objection, reply, continuation, speaker and source grade. Never use keyword-selected snippets.

## 2. New primary dossiers added this stage

### A. Narāqī, *Jāmiʿ al-afkār wa-nāqid al-anẓār* II, pp.25–27

[New context-first English dossier](../POST_ASFAR_01_NARAQI_PRESENTIAL_KNOWLEDGE_CONTEXT_25_27.md).

**Book position:** vol. II, chapter on divine knowledge (*al-faṣl al-thānī fī ʿilmihi taʿālā*), first inquiry, third proof, first preliminary. The issue is an argument about **knowledge by presence**, directly accessible self-awareness and its implications for the soul's faculties and the possibility of divine knowledge—not merely a definition of *wujūd dhihnī*.

**What was directly read:** online edited Arabic [p.25](https://najafdesertlibrary.com/book/جامع-الأفكار-وناقد-الأنظار/v/2/p/25), [p.26](https://najafdesertlibrary.com/book/جامع-الأفكار-وناقد-الأنظار/v/2/p/26), [p.27](https://najafdesertlibrary.com/book/جامع-الأفكار-وناقد-الأنظار/v/2/p/27). The connected material includes objections to a separate immaterial intellectual faculty, the challenge that strengthened imagination might apprehend universals, Narāqī's replies, direct self-awareness and the regress of added representative forms, and examples of pain and one’s own bodily instruments. The full divine-knowledge proof continues after p.27.

**Distinctive against Tajrīd:** Q07 and Q24 are the conceptual background, not the text to duplicate. The later debate asks whether representational forms are the fundamental mode of knowing; it does not settle by merely distinguishing mental and external existence. No claim of a completed proof of God's knowledge of particulars or complete textual comparison with Ṣadrā.

### B. Sabzavārī, *Sharḥ al-Manẓūma*, natural philosophy ghurar #111

[New layered English dossier](../POST_ASFAR_02_SABZAVARI_MOTION_SUBJECT_301_305.md).

**Book position:** fourth part, natural philosophy, **section ghurar no.111**, on determining the **subject of substantial motion** and rebutting arguments that a motion cannot have a persisting subject. Its predecessor no.110 concerns the categories of motion; its successor no.112 concerns unity and rest.

**What was read:** edited/annotated Arabic volume IV [p.301](https://najafdesertlibrary.com/book/شرح-المنظومة/v/4/p/301), [p.302](https://najafdesertlibrary.com/book/شرح-المنظومة/v/4/p/302) and [p.305](https://najafdesertlibrary.com/book/شرح-المنظومة/v/4/p/305). **Pp.303–304 are not independently accessible in this pass**. Sabzavārī opens with verses on matter, flowing form and persistence; the printed text cites Avicenna *Shifāʾ* Physics II.3's **two-branch dilemma** (persistent species implies accidental, not substantial, change; lost species implies a succession of new substances). The later printed reply treats **a flowing substantial existence** as the actual subject without demanding a separate stationary form.

**Critical source-layer limitation:** The modern print interleaves explanatory notes by **Ḥasan Ḥasanzāda Āmulī**, marked `(ح.ح)`. The authorship of every response and the intervening pages require separation from a pre-annotation edition. This is not a fully collated whole ghurar or definitive attribution of the printed authorial prose.

**Distinctive against Tajrīd:** Q17–18 provide matter, substantial form, motion, potency/act background. They do **not** themselves answer the later objection that a continuously moving substance has no numerically stable subject. The response belongs to the post-*Asfār* debate, but its success must not be inferred from a slogan.

## 3. Reader and delivery status

**Reader revision:** historical-source records now 24 (6 earlier foundational, 17 later, 1 mediated Indian); 10 comparative analysis chapters; 12 contextual debate sequences; 20 domain evidence maps; 16 interlinked historical transmission streams; **30 canonical Tajrīd questions linked without copying**.

The sourcebook interface has three distinct paths:
- **Full source:** displays the complete currently edited argument (not clipped to a short paragraph), prior claim, objection, reply, continuation, source quality.
- **After *Asfār*:** the twelve *later transformation* questions with direct source evidence and unresolved comparisons.
- **Tajrīd questions / overlap:** the full thirty-question division of labour plus exact shared printed pages.

The standalone file is rebuilt from modular assets with the guarded `build_standalone.py`; the portable ZIP includes the new question crosswalk. Browser test coverage must include all three routes and the two new historical source dossiers.

## 4. What remains uncompleted

- Narāqī's whole first inquiry and third proof from *Jāmiʿ al-afkār*, and the direct reply of Ṣadrā's *Asfār* to which it may be compared.
- The **unread pp.303–304** of the Sabzavārī printed edition; separating Ḥasanzāda's notes, checking exact Arabic line sequence, and the directly cited *Physics* II.3 original.
- Other primary post-Ṣadrian authors: Āqā ʿAlī Zunūzī, Jilwa, the Khwānsārīs, Sabzavārī's larger metaphysics/psychology, the Ottoman Hidāya supergloss chain, and full Indian *al-Hadiyya*.
- Whole-tradition manuscript/edition collation, direct parallel bilingual original texts, and a verified NAMA repository/host. **The connected site is GNAMMA; the portable NAMA handoff does not deploy NAMA.**

**Never mark the entire later Avicennian tradition as translated or a historical source as independently collated when it was only read in a modern commentator.**

## 5. Cumulative handoff

[Stage 07](STAGE_07_POST_ASFAR_DISTINCT_AND_TAJRID_DEDUP.md) → **Stage 09** → [HANDOFF_CURRENT](../HANDOFF_CURRENT.md) → [Reader](../../avicennism/).

