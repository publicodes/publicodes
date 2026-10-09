---
target: the page specification
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/var/home/johan/Projets/publicodes/packages/autodoc-core/docs/page-spec.md"
target_fingerprint: "sha256:ec27e4b25cb49a8a339ddc7203e3ab7e68981afd41d71f9f52e9bfa6a1b4b7ca"
target_path: /var/home/johan/Projets/publicodes/packages/autodoc-core/docs/page-spec.md
timestamp: 2026-10-09T16-56-19Z
slug: docs-page-spec-md
---
## Design Health Score

Scores assess the design the specification describes, not a built surface.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Fill level and context counts are now stated; no loading or pending state is specified |
| 2 | Match System / Real World | 3 | Labels are the author's titles and keywords the language's tokens; `variations` and `plancher` stay unexplained by design |
| 3 | User Control and Freedom | 3 | I2 and I4 reversible, I3 closable three ways; navigation undo is left to the host without saying so |
| 4 | Consistency and Standards | 4 | One equation form for every composing mechanism; one state vocabulary for every input |
| 5 | Error Prevention | 3 | Absence states keep unanswered distinct from zero; but the equation's empty state is unspecified |
| 6 | Recognition Rather Than Recall | 3 | The fiche keeps explanation at hand; expanded state is not specified as persisted or announced |
| 7 | Flexibility and Efficiency | 2 | Four interactions, no accelerators, keyboard behaviour implied but never specified |
| 8 | Aesthetic and Minimalist Design | 3 | Content-first and free of ornament; but two controls can land on one reference and the value's placement is ambiguous |
| 9 | Error Recovery | 2 | Unanswered inputs are shown and not actionable, which is scoped out but leaves the reader at a dead end |
| 10 | Help and Documentation | 2 | The notation is deliberately unexplained; the fiche carries the author's words and nothing else |
| **Total** | | **28/40** | **Good — 70%** |

## Design Specificity Verdict

**The specification is specific where the built page finally became specific, and vague where the built page was vague.**

The equation rule is the spec's authored core: operands, the operator between the operands it joins, a rule, the result. It is derived from how arithmetic is written by hand and from the model's own operator order, and it cannot be lifted to another product. The compose/modify split and the closed state vocabulary are equally authored.

What is not specific: the value's placement (position 2 versus the equation's result), the coexistence of two controls on one reference, the depth of in-place expansion, and the empty state of an equation. Each of those is exactly where the last two builds went wrong, so the spec has preserved the defects as ambiguities rather than resolving them.

**Deterministic scan:** `detect --json docs/page-spec.md` returned `[]`, exit 0. For a markdown specification this means there was nothing scannable — the detector reads HTML and CSS. It is not evidence about the design.

**Browser visualization:** not applicable; the target is not a viewable surface.

## Overall Impression

A content-first specification that finally says what a page shows and in what order, and that carries its own evidence in §8. Its single biggest risk is that a builder reading §2 and §4 independently will print the rule's value twice — the defect the previous round existed to remove.

## What's Working

- **The equation rule.** It names the failure precisely — a column of operators never says which operands belong together — and fixes it with a form a reader already knows from paper arithmetic.
- **The context unification.** One block for what was three, with three states and the actionable ones first, and no scenario name the model does not carry.
- **§8, the prototyping log as rules.** Four-of-eleven wrong labels, 61 `par défaut`, the detector's blindness: the spec's constraints are each traceable to something that actually happened.

## Priority Issues

**[P1] The value's placement contradicts the no-duplication rule.** §2 position 2 shows "la valeur, avec son unité". §4 says the outermost equation's result line carries the rule's value. §7 forbids showing a value twice. Three statements, two readings. The previous build resolved this by folding the answer into the computation's head; the spec dropped the resolution. **Fix:** state that position 2 *is* the outermost equation's result line, and delete the separate value entry from §2. **Suggested command:** `$impeccable clarify`

**[P1] The absence vocabulary vanished.** PRODUCT.md principle 4 and `notation.md` both carry four states — non défini, non applicable, no computation of its own, unanswered. The page spec shows `non applicable` once in an example and never specifies what a `not_defined` rule renders as. 44 of 138 rules in the reference model are `not_defined`. **Fix:** restore the four states to §4 with their renderings. **Suggested command:** `$impeccable clarify`

**[P1] A reference can carry two controls and the spec never says how they coexist.** I2 triggers on the operand line, I3 on the name; a referenced rule that computes and has a description gets both. The last critique flagged controls appearing on some references and not others as arbitrary; the spec recreates it with two controls instead of one. **Fix:** one control per reference, whose contents are the fiche and whose expansion is I2 — or an explicit rule for when each appears. **Suggested command:** `$impeccable shape`

**[P2] In-place expansion depth is unspecified.** Whether I2 nests, and to what depth, decides whether six levels are usable or a wall. The spec says "insère son équation" and "repliable" and nothing else. **Suggested command:** `$impeccable shape`

**[P2] Operand lists longer than four are unaddressed.** `alimentation` sums six; the cognitive-load reference caps a visible group at four. The equation form has no grouping or folding rule. **Suggested command:** `$impeccable layout`

**[P2] `public` and `type` are carried and never displayed.** §1 lists both; §2's order has no place for either. They are dead information in the spec's own inventory. **Suggested command:** `$impeccable clarify`

**[P3] The fiche truncates the description ("premières lignes") with no rule** for how many lines, how the cut is marked, or how to reach the rest. **Suggested command:** `$impeccable clarify`

## Persona Red Flags

**Jordan (First-Timer)** — meets a conditional as "2 branches cachées" behind a control whose wording the spec never names, and meets `plancher` with no explanation anywhere on the page. The spec's refusal to explain the notation is principled, but it leaves Jordan's first conditional unreadable.

**Sam (Accessibility-Dependent)** — I3 is an overlay with three dismissal paths and **no focus management**: where focus goes on open and returns on close is unspecified, which is the most common screen-reader failure for overlays. I2 inserts an equation with no specified announcement, so Sam cannot tell the tree grew.

**Riley (Stress Tester)** — opens the generic fill level and finds the equation's result line unspecified: §6 says "the same equations, without values" but an equation whose result is absent has no stated rendering. Riley will also expand six levels deep and find no depth rule.

## Minor Observations

- §8 is the spec's evidence base and sits last; it should open, because every constraint above it cites it.
- The worked examples use invented quantities (`200 000` déplacements) without the label the HTML carried; a spec whose examples are partly fictional should say which parts.
- §3's counts line restates what the table shows; harmless, but it is the one place the spec repeats itself.

## Questions to Consider

- If the value is the equation's result, is position 2 a separate thing at all — or is the computation's head the page's answer?
- What does an equation's result line show when nothing was computed: an empty rule, a dash, or the absence state?
- Two controls on one reference, or one control with two contents?
- Is a hidden untaken branch a kindness to the reader or a concealment from them?
