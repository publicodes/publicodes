## Direction contract

**THESIS.** The autodoc is the model's own text, set as a document, assembled from
separately exported blocks. It refuses the category's invention — no mechanism badges, no
colour taxonomy, no borrowed metaphor — because every reader-facing mark is a token the
model author typed: a mechanism keyword, an authored sentence, a unit, a source position.
The reader is verifying a number, not learning a notation, and the page claims nothing the
model does not support.

**OWN-WORLD.** French-state documentation discipline: white ground, near-black text, one
functional blue for links and current position, one red for error and deprecation, and no
other colour. System sans at 16px on a 60–75 character measure, tabular figures, 1px and
3px rules, no shadow, no gradient, no radius beyond 2px. Monospace is for dotted names,
units and values, never running text or headings.

**STORY.** A reader has a number and wants to know where it came from. They read the rule's
name, the answer, the computation, then how to change it, then the author's words, then
where the rule is written. They leave able to check the figure themselves, or knowing which
input to change.

**FIRST VIEWPORT.** `RuleHeader` top-left: the title with the dotted name beneath it, and
the unit as plain text rather than a badge. Then `RuleResult` at display scale. Then
`RuleComputation` opening on the outermost mechanism with one level of operands visible. A
left rail carries `RuleNavigation` at desktop; the same document is the whole page at 390px.
The composition must hold when a rule carries no prose and no extra blocks: `description`
and `note` are optional, and the author's `meta` bag is never read, so the first viewport
depends only on the header, the result and the computation.

**FORM.** The canonical documentation structure — a rail, a calm reading column, a quiet
margin — chosen because the user pinned government-web convention rather than taking a
rolled direction. Recorded as a standing preference, not a roll outcome.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish
review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
