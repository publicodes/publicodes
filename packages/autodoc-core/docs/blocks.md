# The blocks

A rule's page is not a component. It is a set of blocks, each exported, and a default page
that arranges them.

## Why blocks

The rule carries more than one thing a reader wants, and hosts want different subsets of it.
A host that renders rule documentation inside its own article wants the computation and
nothing else. A host building a reference wants the parameters and the reverse references. A
host whose models write `question` into their `meta` bag wants a block for it — and the
library cannot write that block, because it does not know the key.

So every part of the page is a separate exported component, and the page is a composition of
them that a host can rebuild.

## What makes a block

1. It reads only what a rule carries, or what is derivable from the whole model.
2. It renders on its own. No block depends on a sibling having rendered first.
3. It can be omitted, reordered or replaced without the page becoming untrue.
4. It carries one documented class name, which is its override surface.

A block that needs a fact no rule carries does not exist. That is the whole discipline: the
page cannot say more than the model does.

Two blocks were removed after the first build, and both removals were the same fault — a
block restating what another block already said.

## The inventory

Eight blocks.

### Of this rule

| Block | Reads | Renders |
|---|---|---|
| `RuleHeader` | `title`, the dotted name | the rule's name and its address |
| `RuleComputation` | `value_mechanism`, `chained_mechanisms`, the trace | the notation, opening on the rule's own value as the head of the computation |
| `RuleParameters` | the evaluation's needed set, the trace, and which rules it did not resolve | the values the computation used, keyed by the rule each answers. |
| `RuleDescription` | `description` | the author's explanation of the rule |
| `RuleProvenance` | `position`, `id` | the file and line where the rule is written |

**The rule's value is printed once, at the head of `RuleComputation`.** There is no separate
result block: a result block plus a computation that also prints the total prints the same
number twice in the first viewport, and a reader cannot tell which one is the answer.

**`RuleParameters` is the context, and it is the same block at both fill levels.** With a
trace it shows the value each rule contributed. Without one it shows the same rules with no
values — the inputs the computation would need. There is no separate "context" block: the
context *is* the supplied parameters, and rendering both duplicated every one of them.

**The fill level is stated once, before the computation.** The computation opens with one
line saying which context produced these figures and how many values it supplied, or that no
context was supplied at all. Without it a reader cannot tell whose situation they are looking
at — PRODUCT.md's premise is two arrivals, from a simulator carrying a live context and cold
at a documentation URL, and the rest of the page is identical for both.

The context's **name** is the host's, never the library's: no rule carries one, so a host that
has one passes it in and a host that does not gets the counts alone. The line must not
enumerate the values — that is `RuleParameters`' job.

`note` is not rendered. It is the model author's working space, and in the same model it
holds both a figure's provenance and a list of things to add in a future version. A reader
must not be handed the second.

### Of the rule's place in the model

| Block | Reads | Renders |
|---|---|---|
| `RuleUsedBy` | the whole model, scanning for references to this rule | the rules that consume this one — for a parameter, the levers it moves |

### The frame

| Block | Reads | Renders |
|---|---|---|
| `RuleNavigation` | the model's rules and their paths | where the reader stands, and what else there is |

## The unfold

A row of the computation shows its term and its value. Behind the term is whatever explains
the value: the referenced rule's own computation, or the mechanism's operands. Opening puts it
under the line — the same rows, placed inside the sheet that line opens: from the sheet's edge,
and one sheet inset further in, so a fiche's content never straddles its own frame. The line
does not move, so a reader who unfolds keeps their place.

Navigation is not the computation's job: the index and the used-by list carry blue links. A row
carries none of its own — the whole line is its target, and the underline of its name under the
pointer is its only affordance — except when the rule it names has a page, and a small blue mark
then waits next to that name, whether the fiche is open or not: it leads elsewhere rather than
opening anything. Four rules govern the unfold:

- **It changes the line's name and its sheet, not its layout.** The sheet is a layer behind the
  block, starting where the name column does and ending at the row's right edge. It cannot be the
  block's own background: that would widen the line's containing block and shift its value. The
  name goes to semi-bold, and nothing else about the line changes.
- **A sheet that prints one line opens it.** There is nothing to choose between one line and
  two, so opening a row opens the single line its sheet prints — and so on down the chain,
  while each sheet prints one line. The chain follows lines that print lines of their own: a
  fiche that holds nothing is left for the reader to ask for, and says so in a sentence
  rather than opening empty. It seeds the state rather than deriving the view: the reader can
  close any of those lines again. A page whose own computation prints one line comes open the
  same way, the chain under it included.
- **A sheet is a block; a line that opens nothing is not.** The block exists for the sheet a
  line opens, and it is the only element that carries a paper: a host styles lines and sheets,
  and never a block that draws nothing.
- **A line is a control only where it has something to open.** A reference always has: the
  rule says what it is whether or not it computes. A mechanism opens only where it prints
  lines, so a figure on its own is plain text — its value is the whole of it.
- **A mechanism's sheet is projected like a reference's: one level in.** The papers therefore
  alternate at every depth, and a fiche reads at the same distance from the page whatever
  opened it, a rule or a mechanism.
- **It is a disclosure, not a hover.** It carries `aria-expanded`, is reachable by keyboard,
  and is announced. PRODUCT.md leaves the accessibility requirement open and names the risk: a
  computation tree whose meaning lives behind hover is unusable by keyboard and screen reader.
  Quietly choosing a tooltip would decide that requirement by accident.

## The default page

```tsx
<RuleHeader />
<RuleDescription />
<RuleComputation />
```

Four exported blocks are not in this composition for now: `RuleNavigation`, `RuleParameters`,
`RuleUsedBy`, `RuleProvenance`.

`RuleDescription` précède `RuleComputation` : deux phrases sur ce dont on parle avant de rendre
le nombre.

## What the library does not provide

- **Anything read from `meta`.** Its keys are the model author's; the library does not
  interpret the bag, so it ships no block that reads it. A host that wants a `question` block
  writes one — that is the intended extension point, and it is why the bag's opacity is not a
  limitation.
- **`note` anywhere.** The projection folds it into the rule, and no block renders it.
- **Charts, tables of many rules, editing the context, translation.**

## What a block may not do

- **Restate another block.** If two blocks can print the same fact, the boundary is wrong.
- **Show a value twice.** A value appears at the rule's head and on each operand, and a level
  prints its own result only because it is a part of the level above it.
- **Invent a heading that asserts something.** Headings are the frame and stay plain; they
  carry no information about the computation.

## The override surface

Each block carries exactly one class name, `publicodes-<block>`. Mechanisms keep the class
names the notation gives them. Custom properties carry surface values.

A host restyling a block writes CSS against that one class. It never reaches into a block's
internals, and no block's appearance depends on descendant selectors matching its children.

The table a `contexte` mechanism prints in its sheet is `publicodes-context`, and the page's own
context block prints the same one: restyling the context styles both.

The default theme is `@publicodes/autodoc-core/styles/autodoc.css`, which the React entry
imports: a host that wants none of it overrides the custom properties after that import, and a
host that wants none of the classes writes its own sheet against them.
