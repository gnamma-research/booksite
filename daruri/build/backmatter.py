"""Render the complete scholarly historical lexicon without altering its text.

``render_lexicon(full_data, backmatter_notes)`` returns an HTML fragment. The
caller supplies the surrounding document, page rules, fonts and main-text
anchors (``section-N``). Include ``LEXICON_CSS`` in that document's stylesheet.

The source data is the full 153-dossier / 157-article headword release, not the
separate abbreviated website dictionary. Articles shared by several terms are
printed at their first occurrence in Arabic alphabetical order. Every Arabic
and English paragraph is emitted exactly once and without textual changes.
"""

from collections import Counter, defaultdict
from html import escape
import re
import unicodedata


LEXICON_CSS = r"""
/* Structural rules only; the enclosing scholarly edition provides fonts. */
.lexicon { direction: ltr; }
.lexicon h2, .lexicon h3, .lexicon h4, .lexicon h5 {
  break-after: avoid; page-break-after: avoid;
}
.lexicon .lex-introduction,
.lexicon .lex-term-dossiers,
.lexicon .lex-sources,
.lexicon .lex-relations {
  break-before: page; page-break-before: always;
}
.lexicon .lex-kicker {
  font-size: .78em; letter-spacing: .08em; text-transform: uppercase;
  margin: 0 0 .5em;
}
.lexicon .lex-summary { font-size: 1.04em; margin: .5em 0 1em; }
.lexicon .lex-explanation { font-size: .88em; line-height: 1.45; }
.lexicon .lex-navigation { font-size: .8em; margin: .7em 0; }
.lexicon .lex-directory-list {
  columns: 2; column-gap: 8mm; list-style: none; padding: 0; margin: .8em 0;
  font-size: .85em;
}
.lexicon .lex-directory-list li {
  break-inside: avoid; page-break-inside: avoid; margin: 0 0 .1em;
}
.lexicon .lex-directory-link { display: block; text-decoration: none; }
.lexicon .lex-directory-link::after {
  content: leader(" ") target-counter(attr(href), page);
}
.lexicon .lex-term { margin: 1.2em 0; }
.lexicon .lex-term-heading { margin: .8em 0 .4em; font-size: 1.1em; }
.lexicon .lex-term-ar, .lexicon .lex-headword-ar,
.lexicon .lex-inline-ar { direction: rtl; unicode-bidi: embed; }
.lexicon .lex-term-ar { margin-left: .6em; }
.lexicon .lex-definition { margin: .25em 0; font-size: .92em; }
.lexicon .lex-coverage, .lexicon .lex-section-links {
  margin: .35em 0; font-size: .85em;
}
.lexicon .lex-article { margin: .8em 0 1em; }
.lexicon .lex-article-heading { font-size: 1.02em; margin: .7em 0 .25em; }
.lexicon .lex-source-line {
  font-size: .8em; margin: .2em 0 .5em;
  break-after: avoid; page-break-after: avoid;
}
.lexicon .lex-shared-article { margin: .65em 0; font-size: .88em; }
.lexicon .lex-bilingual {
  width: 100%; table-layout: fixed; border-collapse: collapse; direction: ltr;
  margin: .3em 0; border: 0;
}
.lexicon .lex-bilingual tr { break-inside: avoid; page-break-inside: avoid; }
.lexicon .lex-bilingual td {
  width: 50%; vertical-align: top; border: 0; padding: .28em 0;
}
.lexicon .lex-bilingual td:first-child { padding-right: 3.5mm; }
.lexicon .lex-bilingual td:last-child { padding-left: 3.5mm; }
.lexicon .lex-paragraph { margin: 0; white-space: pre-wrap; }
.lexicon .lex-ar { direction: rtl; text-align: right; font-size: 1.18em; line-height: 1.6; }
.lexicon .lex-en { direction: ltr; text-align: left; line-height: 1.42; }
.lexicon .lex-editorial-note {
  font-size: .84em; line-height: 1.4; margin: .55em 0; white-space: pre-wrap;
}
.lexicon .lex-source-notes { margin: .8em 0; padding-top: .3em; border-top: .4pt solid #aaa; }
.lexicon .lex-source-notes h5 { margin: .25em 0 .5em; font-size: .88em; }
.lexicon .lex-source-note { margin: .5em 0 .75em; font-size: .83em; line-height: 1.42; }
.lexicon .lex-source-note p { margin: .2em 0; }
.lexicon .lex-note-anchor { font-style: italic; }
.lexicon .lex-note-ar { direction: rtl; text-align: right; font-size: 1.18em; }
.lexicon .lex-number-group {
  display: inline-block; direction: ltr; unicode-bidi: isolate; white-space: nowrap;
}
.lexicon .lex-online-witnesses { font-size: .88em; }
.lexicon .lex-source-record { margin: 1em 0; }
.lexicon .lex-source-record h3 { font-size: 1.04em; margin: .5em 0 .3em; }
.lexicon .lex-source-record p { margin: .35em 0; }
.lexicon .lex-source-work { font-size: 1em; }
.lexicon .lex-source-date, .lexicon .lex-source-status,
.lexicon .lex-bibliography { font-size: .88em; line-height: 1.42; }
.lexicon .lex-relation-table {
  width: 100%; border-collapse: collapse; font-size: .82em; table-layout: fixed;
}
.lexicon .lex-relation-table thead { display: table-header-group; }
.lexicon .lex-relation-table tr { break-inside: avoid; page-break-inside: avoid; }
.lexicon .lex-relation-table th, .lexicon .lex-relation-table td {
  text-align: left; vertical-align: top; padding: .36em .45em;
  border-bottom: .35pt solid #ddd;
}
.lexicon .lex-relation-table th:first-child,
.lexicon .lex-relation-table td:first-child { width: 25%; }
.lexicon .lex-relation-table p { margin: 0 0 .35em; }
.lexicon .lex-relation-table p:last-child { margin-bottom: 0; }
"""


def _text(value):
    """Escape markup, retaining the supplied Unicode text and whitespace."""
    return escape(str(value), quote=False)


def _attr(value):
    return escape(str(value), quote=True)


def _link(url, label, **attributes):
    attrs = ''.join(f' {key.replace("_", "-")}="{_attr(value)}"'
                    for key, value in attributes.items())
    return f'<a href="{_attr(url)}"{attrs}>{_text(label)}</a>'


def _normal_space(value):
    return ' '.join(str(value).split())


def _arabic_sort_key(term):
    value = ''.join(char for char in unicodedata.normalize('NFD', term['ar'])
                    if not unicodedata.combining(char))
    value = value.translate(str.maketrans('أإآٱؤئىة', 'ااااوييه'))
    value = re.sub(r'[^\u0621-\u063a\u0641-\u064a]', '', value)
    return value, str(term['original_id'])


def _term_id(term):
    return f'dict-term-{term["original_id"]}'


def _article_id(article):
    return f'article-{article["id"]}'


def _validate_data(full_data):
    terms = full_data['terms']
    articles = full_data['articles']
    sources = full_data['sources']
    article_by_id = {article['id']: article for article in articles}
    if len(article_by_id) != len(articles):
        raise ValueError('Full dictionary data contains duplicate article IDs.')
    if len({term['original_id'] for term in terms}) != len(terms):
        raise ValueError('Full dictionary data contains duplicate term IDs.')
    associated = set()
    for term in terms:
        for association in term['articles']:
            article_id = association['id']
            if article_id not in article_by_id:
                raise ValueError(f'Unknown article {article_id!r} in term {term["term"]!r}.')
            associated.add(article_id)
    unassociated = set(article_by_id) - associated
    if unassociated:
        raise ValueError(f'Full articles have no term dossier: {sorted(unassociated)!r}.')
    for article in articles:
        if article['source'] not in sources:
            raise ValueError(f'Unknown dictionary source for article {article["id"]!r}.')
        for paragraph in article['paragraphs']:
            if not isinstance(paragraph['ar'], str) or not isinstance(paragraph['en'], str):
                raise TypeError(f'Non-text paragraph in article {article["id"]!r}.')
    return article_by_id


def _notes_by_article(backmatter_notes, article_by_id):
    """Resolve only affirmative dictionary notes; application notes stay separate."""
    result = defaultdict(list)
    if not backmatter_notes:
        return result
    groups = backmatter_notes.get('notes_by_dictionary_article', {})
    seen_note_ids = set()
    for group in groups.values():
        for note in group.get('notes', []):
            if not note.get('apply', True):
                continue
            article_id = note.get('source_article_id') or group.get('source_article_id')
            if not article_id:
                matches = [article['id'] for article in article_by_id.values()
                           if _normal_space(note['anchor_en']) in _normal_space(
                               ' '.join(p['en'] for p in article['paragraphs']))]
                if len(matches) != 1:
                    raise ValueError(f'Cannot uniquely place source note {note["id"]!r}.')
                article_id = matches[0]
            if article_id not in article_by_id:
                raise ValueError(f'Unknown source article {article_id!r} for note {note["id"]!r}.')
            body = _normal_space(' '.join(p['en'] for p in article_by_id[article_id]['paragraphs']))
            if _normal_space(note['anchor_en']) not in body:
                raise ValueError(f'Quotation anchor is absent for source note {note["id"]!r}.')
            if note['id'] in seen_note_ids:
                raise ValueError(f'Duplicate dictionary source note {note["id"]!r}.')
            seen_note_ids.add(note['id'])
            result[article_id].append(note)
    return result


def _render_source_notes(notes):
    if not notes:
        return ''
    parts = ['<aside class="lex-source-notes" aria-label="Scriptural source notes">',
             '<h5>Source notes</h5>']
    for note in notes:
        audit_ids = ' '.join(note.get('audit_ids', []))
        parts.append(f'<div class="lex-source-note" id="{_attr(note["id"])}" '
                     f'data-audit-ids="{_attr(audit_ids)}">')
        parts.append(f'<p class="lex-note-anchor">“{_text(note["anchor_en"])}”</p>')
        parts.append(f'<p class="lex-note-text">{_text(note["text"])}</p>')
        if note.get('note_ar'):
            # Keep Western sūra/verse ranges in their literal reading order
            # inside the Arabic editorial note, without changing its text.
            note_ar = re.sub(r'[0-9]+:[0-9]+(?:[–-][0-9]+)?',
                             lambda match: '<span class="lex-number-group" dir="ltr">'
                             + match.group(0) + '</span>', _text(note['note_ar']))
            parts.append(f'<p class="lex-note-ar" lang="ar" dir="rtl">{note_ar}</p>')
        references = note.get('source_references', [])
        if references:
            links = [_link(reference['url'], str(i), title=reference['reference'],
                           aria_label=reference['reference'])
                     for i, reference in enumerate(references, 1)]
            label = 'Online witness: ' if len(links) == 1 else 'Online witnesses: '
            parts.append(f'<p class="lex-online-witnesses">{label}{" · ".join(links)}</p>')
        parts.append('</div>')
    parts.append('</aside>')
    return ''.join(parts)


def _render_article(article, source, notes):
    parts = [f'<article class="lex-article" id="{_attr(_article_id(article))}" '
             f'data-article-id="{_attr(article["id"])}" data-source="{_attr(article["source"])}" '
             f'data-ar-sha256="{_attr(article.get("sha256_ar", ""))}" '
             f'data-completeness="{_attr(article.get("completeness", ""))}">']
    parts.append(f'<h4 class="lex-article-heading">{_text(article["transliteration"])} · '
                 f'<span class="lex-headword-ar" lang="ar" dir="rtl">{_text(article["headword"])}</span></h4>')
    source_label = f'{source["author"]} [{source["chronology"]}]'
    parts.append('<p class="lex-source-line">' +
                 _link(f'#lex-source-{article["source"]}', source_label) + ' · ' +
                 f'<cite>{_text(source["work"])}</cite> · {_text(article["pages"])}. ' +
                 _link(article['url'], 'Source ↗') + '</p>')
    parts.append('<table class="lex-bilingual" role="presentation"><colgroup><col/><col/></colgroup><tbody>')
    for index, paragraph in enumerate(article['paragraphs']):
        key = f'{article["id"]}:{index}'
        parts.append(f'<tr data-paragraph-pair="{_attr(key)}">')
        for language, side in [('ar', 'rtl'), ('en', 'ltr')]:
            parts.append(f'<td class="lex-{language}" lang="{language}" dir="{side}">'
                         f'<p class="lex-paragraph" data-source-paragraph="{_attr(key)}" '
                         f'data-language="{language}">{_text(paragraph[language])}</p></td>')
        parts.append('</tr>')
    parts.append('</tbody></table>')
    if article.get('note'):
        parts.append('<p class="lex-editorial-note"><strong>Editorial note. </strong>'
                     f'<span data-original-article-note="{_attr(article["id"])}">{_text(article["note"])}</span></p>')
    parts.append(_render_source_notes(notes))
    parts.append('</article>')
    return ''.join(parts)


def _render_sources(full_data):
    counts = Counter(article['source'] for article in full_data['articles'])
    # Match the chronological sequence of the complete scholarly appendix.
    order = [key for key in ('R', 'U', 'L', 'F', 'J', 'S', 'M', 'K') if key in full_data['sources']]
    order += [key for key in full_data['sources'] if key not in order]
    parts = ['<section class="lex-sources" id="lexicon-sources">',
             '<p class="lex-kicker">Provenance and editorial limits</p>',
             '<h2>Dictionary sources</h2>']
    for key in order:
        source = full_data['sources'][key]
        count = counts[key]
        noun = 'article' if count == 1 else 'articles'
        parts.append(f'<section class="lex-source-record" id="lex-source-{_attr(key)}" data-source-key="{_attr(key)}">')
        parts.append(f'<h3>{_text(source["author"])} [{_text(source["chronology"])}]</h3>')
        parts.append(f'<p class="lex-source-work"><cite>{_text(source["work"])}</cite> · '
                     f'<span class="lex-inline-ar" lang="ar" dir="rtl">{_text(source["arabic_work"])}</span></p>')
        parts.append(f'<p class="lex-source-date">{_text(source["date"])} · {count} selected complete {noun}.</p>')
        parts.append(f'<p class="lex-bibliography" data-source-bibliography="{_attr(key)}">{_text(source["bibliography"])}</p>')
        parts.append(f'<p class="lex-source-status" data-source-status="{_attr(key)}">{_text(source["source_status"])}</p>')
        links = [_link(source['url'], 'Source ↗')]
        if source.get('digital_source'):
            links.append(_link(source['digital_source'], 'Digital witness ↗'))
        parts.append(f'<p class="lex-navigation">{" · ".join(links)}</p></section>')
    parts.extend([
        '<h3>Text and translation</h3>',
        '<p class="lex-explanation">The running Darūrī text and notes are retained from the preceding scholarly reading edition: the al-ʿAlawī 1994 base, compared with Bou Akl’s printed 2015 edition, French translation and apparatus. The Escorial codex has not been independently inspected. The authorial completion in 552 AH and copyist’s notice of 606 AH are distinct.</p>',
        '<p class="lex-explanation">The historical authors’ definitions, examples and doctrinal positions are translated as evidence, not endorsed as universally accepted accounts. A Ḥanafī distinction is not silently generalized to every school. Multiple senses and apparently extraneous examples remain where part of the selected article.</p>',
        '<p class="lex-explanation">Modern website labels, menus, editorial bibliographical footnotes and translations into other European languages are not attributed to the historical authors.</p>',
        '<p class="lex-explanation">Scope remains selected-source coverage, not an exhaustive concordance of every relevant lexicon. In particular, this release does not supply a complete Tāj al-ʿArūs article set, nor all Kashshāf or Lisān articles for all 153 terms. Some compounds have only clearly marked related-headword evidence. The audit below records those relations so that numerical coverage cannot conceal them.</p>',
        '</section>',
    ])
    return ''.join(parts)


def _render_relations(terms, article_by_id):
    parts = ['<section class="lex-relations" id="lexicon-relations">',
             '<h2>Headword-relation audit</h2>',
             f'<p class="lex-explanation">The {len(terms)} dossiers are listed in Arabic alphabetical order. “Exact” refers to the source headword, not to an assertion that all of its senses occur in Ibn Rushd. Any other relation is stated explicitly. Full texts are printed once; links may legitimately point to an article elsewhere in the appendix.</p>',
             '<table class="lex-relation-table"><thead><tr><th scope="col">Glossary term</th><th scope="col">Complete articles and relation</th></tr></thead><tbody>']
    for term in terms:
        parts.append(f'<tr data-relation-term="{_attr(term["original_id"])}"><td>' +
                     _link(f'#{_term_id(term)}', term['term']) + '</td><td>')
        for association in term['articles']:
            article = article_by_id[association['id']]
            label = f'{article["id"]} · {article["transliteration"]}'
            parts.append('<p>' + _link(f'#{_article_id(article)}', label) + ': ' +
                         f'<span data-relation-article="{_attr(article["id"])}">{_text(association["relation"])}</span></p>')
        parts.append('</td></tr>')
    parts.append('</tbody></table></section>')
    return ''.join(parts)


def render_lexicon(full_data, backmatter_notes=None):
    """Return the scholarly lexicon, provenance and relation audit as HTML.

    ``full_data`` is the parsed complete-headword JSON. ``backmatter_notes`` is
    the parsed additive-note JSON. Its application notes are intentionally left
    for the caller's Bidāya application renderer. Invalid or unmatched source
    notes raise an error instead of silently disappearing from the publication.
    """
    article_by_id = _validate_data(full_data)
    terms = sorted(full_data['terms'], key=_arabic_sort_key)
    source_notes = _notes_by_article(backmatter_notes, article_by_id)
    term_count = len(terms)
    article_count = len(article_by_id)
    paragraph_count = sum(len(article['paragraphs']) for article in full_data['articles'])
    source_count = len(full_data['sources'])
    note_count = sum(len(notes) for notes in source_notes.values())
    parts = [
        f'<section class="lexicon" id="lexicon" data-term-count="{term_count}" '
        f'data-article-count="{article_count}" data-paragraph-pair-count="{paragraph_count}" '
        f'data-source-count="{source_count}" data-source-note-count="{note_count}" '
        f'data-source-version="{_attr(full_data.get("version", ""))}">',
        '<section class="lex-introduction" id="lexicon-introduction">',
        '<p class="lex-kicker">Arabic–English reference backmatter</p>',
        '<h2>Historical dictionary articles</h2>',
        f'<p class="lex-summary">Complete selected entries · {term_count} glossary terms · {article_count} source articles</p>',
        '<p>This appendix replaces the earlier excerpt register and nine-entry pilot. Each source article is reproduced with a full working English translation. Arabic is on the physical left; English is on the right. Shared articles are printed once and linked from each relevant term.</p>',
        f'<p class="lex-explanation"><strong>What “complete” means.</strong> It means the whole selected headword or root article in the identified digital witness—not all articles in every dictionary. The links distinguish exact headwords, derived forms, internal discussions and related lexical evidence. A root article is not mislabelled as a technical definition of a compound. All {term_count} glossary terms have a dossier; that is not a claim of {term_count} exact-headword matches.</p>',
        '<p class="lex-explanation"><strong>Chronology.</strong> E = earlier than Ibn Rushd’s 552 AH composition; L = later historical witness. Later evidence illuminates terminology but does not prove Ibn Rushd’s usage. Source transcriptions and the new translations are not independently manuscript-collated. Unresolved readings are identified beside the affected articles.</p>',
        '<p class="lex-explanation"><strong>Navigation.</strong> Select a term below. Its section references lead back to the main text in the integrated edition. The subject index and R/BA concordance are retained after this appendix. R and BA refer to printed editorial numbering systems, not two manuscripts.</p>',
        '<p class="lex-navigation">' + _link('#lexicon-sources', 'Sources and editorial limits') + ' · ' +
        _link('#lexicon-relations', 'Headword-relation audit') + '</p>',
        '<nav id="lexicon-directory" aria-label="Arabic alphabetical term directory"><h3>Term directory</h3><ol class="lex-directory-list">',
    ]
    for term in terms:
        parts.append(f'<li><a class="lex-directory-link" href="#{_attr(_term_id(term))}">'
                     f'{_text(term["term"])} <span class="lex-inline-ar" lang="ar" dir="rtl">{_text(term["ar"])}</span></a></li>')
    parts.extend(['</ol></nav></section>', '<div class="lex-term-dossiers">'])
    first_term_for_article = {}
    for number, term in enumerate(terms, 1):
        parts.append(f'<section class="lex-term" id="{_attr(_term_id(term))}" '
                     f'data-original-term-id="{_attr(term["original_id"])}" data-directory-number="{number}">')
        parts.append(f'<h3 class="lex-term-heading">{number}. {_text(term["term"])} '
                     f'<span class="lex-term-ar" lang="ar" dir="rtl">{_text(term["ar"])}</span></h3>')
        parts.append('<p class="lex-definition"><strong>In the Darūrī: </strong>'
                     f'<span data-term-definition="{_attr(term["original_id"])}">{_text(term["definition"])}</span></p>')
        if term.get('coverage_note'):
            parts.append('<p class="lex-coverage"><strong>Coverage. </strong>'
                         f'<span data-term-coverage="{_attr(term["original_id"])}">{_text(term["coverage_note"])}</span></p>')
        if term['sections']:
            links = [_link(f'#section-{section}', f'§{section}') for section in term['sections']]
            parts.append(f'<p class="lex-section-links">Text: {" · ".join(links)}</p>')
        for association in term['articles']:
            article = article_by_id[association['id']]
            if article['id'] in first_term_for_article:
                earlier_term = first_term_for_article[article['id']]
                parts.append('<div class="lex-shared-article">' +
                             _link(f'#{_article_id(article)}', f'{article["transliteration"]} · {article["headword"]}') +
                             '. Complete article printed under ' +
                             _link(f'#{_term_id(earlier_term)}', earlier_term['term']) + '. ' +
                             f'<span>{_text(association["relation"])}</span>.</div>')
            else:
                first_term_for_article[article['id']] = term
                parts.append(_render_article(article, full_data['sources'][article['source']],
                                             source_notes.get(article['id'], [])))
        parts.append('<p class="lex-navigation">' + _link('#lexicon-directory', '↑ Term directory') + ' · ' +
                     _link('#lexicon-sources', 'Sources') + ' · ' + _link('#lexicon-relations', 'Headword relations') + '</p>')
        parts.append('</section>')
    if len(first_term_for_article) != article_count:
        raise ValueError('Rendering did not cover every complete dictionary article.')
    parts.append('</div>')
    parts.append(_render_sources(full_data))
    parts.append(_render_relations(terms, article_by_id))
    parts.append('</section>')
    return '\n'.join(parts)
