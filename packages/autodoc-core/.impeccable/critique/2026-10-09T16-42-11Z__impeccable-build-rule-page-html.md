---
target: the built rule page
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/var/home/johan/Projets/publicodes/packages/autodoc-core/.impeccable/build/rule-page.html"
target_fingerprint: "sha256:41fe582f03c1d1dfc7b1d14c291eef77752452a3b59e83a9d25edb8752db51d8"
target_path: /var/home/johan/Projets/publicodes/packages/autodoc-core/.impeccable/build/rule-page.html
timestamp: 2026-10-09T16-42-11Z
slug: impeccable-build-rule-page-html
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Current position is marked, but nothing states which context produced these figures |
| 2 | Match System / Real World | 3 | Only one mechanism keyword appears (`somme`, plain French) and labels are the author's own titles |
| 3 | User Control and Freedom | 3 | Peek closes on Escape and click-away, but has no visible close affordance |
| 4 | Consistency and Standards | 3 | Notation, unit placement and the three parameter states are consistent |
| 5 | Error Prevention | 3 | Absence states prevent the main misreading: unanswered is not zero |
| 6 | Recognition Rather Than Recall | 2 | A rule's explanation sits behind an overlay, so it must be remembered after closing |
| 7 | Flexibility and Efficiency | 1 | No expand-all, no keyboard accelerator, and the masthead search is decoration |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and single-accent, but the mechanism keyword is the least visible element on its own line |
| 9 | Error Recovery | 2 | Three inputs are shown unanswered and the page offers no path to resolve them |
| 10 | Help and Documentation | 2 | The rule is explained, the notation is not, and the peek has no accessible name |
| **Total** | | **24/40** | **Acceptable — 60%** |

## Design Specificity Verdict

**Specific where it matters, generic by commitment.**

The frame — masthead, rail, measure, one functional blue, 1px rules — is government-documentation convention, pinned deliberately by the user. It could belong to any French public-service page, and that is the brief working, not failing.

The notation cannot be lifted to another product. The compose/modify distinction, units riding their numbers so `km` under `kgCO2e/km` cancels into `kgCO2e`, mechanism keywords shown as the language's own tokens, and applied-versus-dormant marks are all derived from Publicodes rules and nothing else. That is the authored part.

**Missed opportunity**: the mechanism keyword is the notation's identity and is styled as chrome — 12.5px grey against a 29px value. The one thing that makes this a language rather than a table is the least visible thing on the line.

## Overall Impression

The arithmetic is finally legible and honest, and the constraint has paid for itself twice — the model's own titles are more accurate than my paraphrases. The biggest opportunity is that the page does not say whose situation it is showing, and that a referenced rule's explanation is reachable only through an unlabelled overlay.

## What's Working

- **Units riding their numbers.** `11 000 000 km` above `0,231 kgCO2e/km` cancels to `2 541 000 kgCO2e` by reading down a column. This is a proof of correctness a reader can perform, and it survived the removal of the unit column.
- **The three parameter states.** Supplied, defaulted and unanswered are visibly different, and `valeur par défaut du modèle` names the mechanism that produced the figure. The ekofest model's 61 `par défaut` and 39 `plancher` are the reason this matters.
- **The value outweighs its label.** Names at weight 500, figures at 700 with tabular numerals. A reader scanning the column finds numbers, not words.

## Priority Issues

**[P1] Nothing states which context produced these figures** — `mentionsContext: false`. The page shows `2 792 542 kgCO2e` and never says whose situation it is. PRODUCT.md's premise is two arrivals: from a simulator carrying a live context, and cold at a documentation URL. The page is identical for both. This is the direct cost of removing the context summary as duplication — the duplication was real, but the *statement* was load-bearing. **Fix:** one line stating the context and its provenance, or an explicit "no context supplied" state, without re-listing every value. **Suggested command:** `$impeccable clarify`

**[P1] The peek is unreachable by meaning** — three `<button>Détails</button>` with no `aria-label`, no `aria-controls`, no `aria-describedby`. A screen reader announces three identical controls with no indication of what each reveals, and nothing relates a trigger to its panel. PRODUCT.md records the accessibility requirement as open. **Fix:** name each trigger for the rule it belongs to and relate it to its panel. **Suggested command:** `$impeccable audit`

**[P1] The masthead search is a non-interactive `<span>`** — it looks exactly like a search input and does nothing. A control that advertises itself and fails is worse than no control. (The masthead is nominally host chrome, but it is authored here.) **Fix:** make it work or remove it. **Suggested command:** `$impeccable harden`

**[P2] Heading order regresses: two H2s precede the H1** — "Dans ce poste" and "Les six postes" come before "Transport" in the DOM, so heading navigation starts at level 2 above the page's own title. **Fix:** demote the nav labels or lift the page title. **Suggested command:** `$impeccable audit`

**[P2] The mechanism keyword is styled as chrome** — `somme` at 12.5px grey beside a 29px value. **Fix:** promote it to a legible label weight; it is the notation's grammar. **Suggested command:** `$impeccable typeset`

**[P3] The parameters table has no caption.** **Suggested command:** `$impeccable audit`

**[P3] All 20 links are `href="#"`.** Navigation is therefore untestable in this artifact and no claim about wayfinding is verified. **Fix:** wire a real path-navigation target. **Suggested command:** `$impeccable harden`

## Persona Red Flags

**Jordan (First-Timer)** — the primary user; PRODUCT.md says a non-developer consulting a figure. Lands on the page and sees `2 792 542 kgCO2e` with **no indication of whose situation produced it**, so cannot tell whether this is their own figure or a default scenario. Encounters `Détails` beside three rule names, clicks one, reads it, closes it, and must remember it. Never learns what `somme` means, because the page deliberately refuses to explain the notation.

**Sam (Accessibility-Dependent)** — tabbing reaches three buttons all announced "Détails, collapsed", with no relationship to the panels they open. Heading navigation opens on "Dans ce poste" at level 2, above the page's own H1. The parameters table has no caption, so its purpose is unstated. Three states of input are partly conveyed by colour (red for unanswered), though the text also states it, so this is not colour-alone.

**Casey (Distracted Mobile)** — at 390px the rail moves below the whole article, so navigation sits after all of the content. The computation stacks values under names, which holds, but a reader returning mid-page has no persistent indication of position. Long rule titles in the rail wrap to three lines.

## Minor Observations

- Every rule name displayed matches the model's own `titre`, or its last dotted segment where none exists. This was wrong in four of eleven cases before reconciliation — one of them factually, having dropped *organisateurs* from a rule titled "Nombre d'organisateurs et bénévoles".
- `Détails` appears on three of nine references. The rule is sound (only where something is behind it) but the rule is invisible to a reader, who sees arbitrary inconsistency.
- `valeur par défaut du modèle` is library-authored French, which the constraint otherwise forbids. It names a mechanism rather than describing data, so it is arguably in the same class as the state names — but it deserves an explicit ruling.
- The rail's two lists ("Dans ce poste", "Les six postes") are not distinguished as "this page" versus "elsewhere".

## Questions to Consider

- If the page cannot say whose context it is showing, what is the reader actually verifying?
- Should a mechanism keyword be chrome, or is it the most important word on its line?
- What would a confident version of the peek look like — one that a reader could find, name and dismiss without instruction?
- Is `par défaut` on a rule nobody answered a *value* or a *state*? The page currently treats it as a value with a state label.
