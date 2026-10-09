# Product

<!-- impeccable:product-schema 1 -->

**Scope.** This repository is the Publicodes monorepo. The product described here is one
feature within it: **the autodoc** — rendering a rule's computation and evaluation trace for
a human reader. It is delivered as `@publicodes/autodoc-core` (headless) and
`@publicodes/autodoc-react` (components), demonstrated through `examples/autodoc-playground`,
and consumed by hosts such as mon-entreprise. This file does not describe the compiler,
`@publicodes/core`, forms, or the CLI.

## Platform

web

## Users

**Primary: a non-developer consulting a computation they have already been shown.** Someone
looking at a number a simulator produced for them — their cotisations, their revenu net, a
rate they will pay — who wants to see where it came from. They are technically capable but
their ceiling is a spreadsheet: they reason about formulas, cells, and references, not about
evaluation strategies. They arrive by two different routes, and both matter: from a simulator,
carrying a live situation; and cold, at a documentation URL, with no situation at all.

**Explicitly not primary: rule authors and model writers.** They need to trace a rule during
development, and their tooling is the LSP and, eventually, a dedicated editor. They may find
the renderer useful; it is not designed for them.

**Secondary but load-bearing: the integrator.** A developer embedding the components in a host
site and restyling them to that site's design system. They are not a user of the documentation
— they are the reason the override surface must be small, documented, and incapable of
destroying meaning.

## Product Purpose

Show a reader how a value was obtained, in the situation they are actually in, and let them
move between rules without losing their place. Success is a reader who stops wondering and
either accepts the number or finds the input they would have to change.

## Positioning

The autodoc is the only renderer that can show the path a computation *took*, because the
Publicodes v2 compiler emits a per-node evaluation trace resolved per context stack. The
predecessor rendered the static AST, so every conditional branch was always drawn and the
computation on screen did not correspond to the number the reader had. A neighbouring renderer
cannot copy this without the trace.

Second, it surfaces the model author's own words. The compiler declares `title`, `description`,
`note` and `public` on a rule, and the library renders those four and no others. It also
carries a `meta` bag whose keys and value shapes are the author's alone — existing French
models happen to put `question`, `résumé` and `références` there, but that is a convention of
those models, not a vocabulary the language defines, so **the library does not read the bag at
all**. A host that wants what it holds renders it with its own block. The predecessor rendered
almost none of the four fields it did own.

## Operating Context

- Embedded inside host sites. mon-entreprise is the reference host and today runs the v1
  renderer; migration to v2 is expected but is not this work.
- Reached two ways with different needs: from a simulator with a live situation (verify *this*
  number), and directly at a documentation URL with none (understand the rule in general).
- Some hosts embed under partner terms that restrict which external references may be shown,
  so reference display is not purely a rendering concern.
- The v2 migration of the models is incomplete. `inversion numérique`, `barème`, `grille`,
  `taux progressif`, `durée`, `logarithme`, `une possibilité`, and
  `résoudre la référence circulaire` are accepted by the parser but not implemented, and
  compile to `not_defined`. Readers will encounter rules in that state and the renderer must
  be honest about it.
- The model surface is uneven: an authored explanation exists for some rules and not others,
  and the reader cannot tell the difference between "no explanation written" and "nothing to
  explain".

## Capabilities and Constraints

**Everything reader-facing derives from the rules, and only from the rules.** The renderer's
entire vocabulary is what a Publicodes rule carries: thirty mechanism kinds, fifteen binary
operators, one unary, four constants, references, a type, a unit, a source position, and
whatever the model author wrote — `title`, `description`, `note`, `public`, and a `meta` bag
whose keys and value shapes are the author's and are not known in advance, so a key is read
only when present and of the expected shape. This holds whatever the domain is: carbon,
income, or anything else a model describes. Mechanism names are the language's own tokens as
the author typed them. No
borrowed metaphor, no external reference figure, no invented label, and no prose the library
makes up: a rule without an authored explanation says so rather than being explained.

**Override contract.** Public surface is documented semantic class names for structure plus a
small set of `--publicodes-*` custom properties for surface values. No JavaScript theming, no
CSS-in-JS, no styled-components. Structural facts live on a mechanism's own class, never on
descendant selectors or `:has()` matching against children, because a host must be able to
restructure without the layout collapsing.

**The default theme may not encode information in anything a host is likely to replace.** A
host swapping the palette must not silently falsify the documentation. Meaning rides on
typography, indentation, alignment, and notation. A per-mechanism-family colour taxonomy — the
current proposal of twelve accent colours keyed to mechanism kind — is ruled out by this
constraint: it forces a host either to adopt our taxonomy or to destroy it.

**Composition over configuration.** The page is a set of separately exported blocks and a
default arrangement of them; a host rebuilds the default page from its blocks in a few lines,
or omits, reorders and replaces whichever it wants. This is also the extension point for
everything the library refuses to interpret — the author's `meta` bag most of all. A host
wanting a question block writes one; the library ships none, because it does not know the key.
React-level slots remain available where a host must supply its own component, as with link
rendering and the head.

**Navigation is state.** References expose a link callback plus the context they were resolved
in; routing belongs to the host. Deep-link behaviour of rule URLs is preserved. No drop-in
compatibility with the v1 renderer's DOM or class contract is required.

**One layout, two fill levels.** Evaluated (situation supplied) and generic (no situation) use
the same structure; the generic case omits values rather than presenting a second, degraded
layout.

**Reader-facing copy is French**, in the models and in the library's own sentences for
mechanisms. Mechanism names are already French in Publicodes. Translation is a separate
concern and is not a constraint on this design.

**Browser baseline.** `:has()` and `color-mix()` are acceptable. Anchor positioning
(`position-anchor`, `anchorName`) is not.

## Brand Commitments

There is no logo or palette attached to the autodoc, and the default theme stays plain rather
than branded — hosts supply their identity. The name "Publicodes" and the French register of
the copy are the only fixed points.

**The document convention is committed.** Chosen deliberately over a rolled visual identity,
and recorded here as a standing preference: French-state and GOV.UK documentation discipline —
plain-language headings, one idea per block, colour doing functional work only, generous
vertical rhythm, readable at 320px. It is a convention rather than an identity, so a host can
replace its surface without the documentation losing meaning. The craft bar is the strictest
of: French state documentation, the GOV.UK Design System, the reference documentation of a
notation, and the incumbent `@publicodes/react-ui` rendering it replaces.

## Evidence on Hand

- Real models with compiled ASTs: `auto-entrepreneur` (138 rules, 24 with authored
  descriptions, 60 leaves, deepest reference chain six) and `simple-TJM` (10 rules).
- Real evaluation traces from those models, produced with a fixed situation.
- `examples/autodoc-playground`: a harness rendering every mechanism kind plus the two models,
  with a hand-rolled navigation shell and no design system.
- The v1 renderer (`@publicodes/react-ui`) as the incumbent, and mon-entreprise's integration
  with it as the record of what a real host has to override.
- Absences to respect: there is no design system, no PRODUCT/DESIGN documentation, no ADR
  covering the autodoc, no test coverage of the library's real behaviour, and no
  accessibility audit.

## Product Principles

1. **Verification first.** Show the computation that produced this reader's number, not the
   union of every computation the rule permits.
2. **The model's words before the library's.** Use what the model author wrote; invent text
   only where nothing was written, and keep it in a place a translator can find.
3. **Meaning survives restyling.** If a host cannot change the palette without changing what
   the documentation says, the design has failed.
4. **Be honest about absence.** An unimplemented mechanism, an unwritten explanation, and a
   genuinely undefined rule are three different states and must not look alike.
5. **Navigation must not cost context.** A reader descending into a term keeps the
   computation they came from.

## Accessibility & Inclusion

Not yet established. No accessibility requirement was agreed in the interview, and no audit
exists. The known risk is structural: a deeply nested, disclosure-driven view of a computation
tree is difficult to navigate by keyboard and to announce by screen reader, and the incumbent's
rendering makes no provision for either. Treat the requirement as open and settle it before
the components are considered done rather than after.
