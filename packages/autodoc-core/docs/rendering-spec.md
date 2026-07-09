# Autodoc — Visual Rendering Specification

## 1. Color System

### 1.1 Per-category accent colors

Each mechanism kind belongs to one category with a distinct accent color.
The accent color manifests as a **3px vertical bar on the left border** of the mechanism container.

| Category | Mechanisms | Accent |
|---|---|---|
| Expression | `expr` | Blue |
| Math | `sum`, `product` | Violet |
| Logic | `all_of`, `one_of` | Teal |
| Comparison | `min_of`, `max_of` | Cyan |
| Applicable (positive) | `applicable_if`, `is_applicable` | Green |
| Applicable (negative) | `not_applicable_if`, `is_not_applicable` | Amber |
| Variations | `variations` | Fuchsia |
| Context | `context` | Orange |
| Modifiers | `ceiling`, `floor`, `round_*`, `default` | Yellow |
| Not defined | `not_defined` | Red |
| Value (nesting) | `value` | Gray |
| Type annotation | `type_def` | Violet (lighter) |

### 1.2 Dark mode

All colors have a counterpart for dark backgrounds, activated via `prefers-color-scheme: dark`.

### 1.3 All colors are CSS custom properties

No hardcoded color values. Users override by redefining properties.

---

## 2. Typography

| Element | Font |
|---|---|
| All text | System sans-serif (configurable: `--adc-font-sans`) |
| Expressions, operators | Monospace (configurable: `--adc-font-mono`) |
| Labels | Smaller size than body text |

Reference expressions (rule names) are colored as links and underlined on hover.

---

## 3. Label (Flag) System

### 3.1 Unified capsules

All labels — mechanism labels (`par défaut`, `avec le contexte`, `s'applique seulement si`, etc.) and variation labels (`si`, `alors`, `sinon`) — share the **same capsule style**:

- **Border** in the accent color
- **No left border** (the capsule is flush against the vertical accent bar)
- **Right side rounded**, left side square
- **Background** slightly tinted with the accent color
- **Text** in normal body color, not italic, not bold, not uppercase
- **No colon** on any label

### 3.2 Attachment (flag mode)

The label is always **flush against the left border** of its mechanism container, like a flag attached to a pole. No gap between the border and the label.

### 3.3 Full height

When the label is above the content (column mode), the label spans the **full height** of its mechanism block.

### 3.4 Single line

When the content is a **simple expression without chained mechanisms or lists**, the label and the expression sit on the **same line**, baseline-aligned, label first. The label does not stretch to full height in this case.

---

## 4. Layout Modes

### 4.1 Row (inline) mode

**Condition**: mechanism has a label AND its content is a single expression with no chained mechanisms and no lists.

→ Label and expression on the same line, baseline-aligned, label flush against left border.

### 4.2 Column (stack) mode

**Condition**: mechanism has a label AND its content contains a list or chained mechanisms.

→ Label spans full height on the left. Content stacked below (or next to, depending on label). 

`avec le contexte` is **always** column mode.

### 4.3 Inline expression mode

**Condition**: mechanism kind is `expr`.

→ No border, no indent, no padding. Flows inline with surrounding text. Monospace font.

### 4.4 Block mode

**Condition**: mechanism has no label.

→ Standard block container with vertical accent bar on the left. Padding around content.

---

## 5. Nesting and Indentation

Each nested mechanism is indented **16px** from its parent's left edge. The vertical accent bar of a nested mechanism is offset 16px to the right, creating a visual tree structure.

---

## 6. Lists

### 6.1 Mechanism list (all_of, one_of, min_of, max_of, context)

Items are stacked vertically with a small gap between them.

Each item has a **key = value** layout where the key is bold and the value follows inline.

### 6.2 Sum / Product

Items displayed as a **2-column grid**:

- Column 1: operator (`+` or `×`), centered
- Column 2: the value
- The **first item has no operator** and its value starts in column 2 (aligned with subsequent values)
- Operator uses monospace font, bold weight, neutral text color

---

## 7. Variations

Displayed as a **2-column grid**:

- Column 1: the variation label (`si`, `alors`, `sinon`)
- Column 2: the value or condition
- Each **condition row** has two sub-rows: `si` + condition, then `alors` + consequence
- The **else row** has a separator line above it
- All labels are the same capsules as mechanism labels

---

## 8. Expressions (Inline)

- Monospace font
- Reference names are colored as links, underlined on hover, cursor pointer
- Constant values use normal text color
- Operators use neutral text color, bold weight
- Parentheses are automatically added based on operator precedence

---

## 9. Type Tooltip

- Appears on hover over a mechanism that has a type annotation
- Small rounded popup positioned above the mechanism
- Shows the inferred type label (nombre, oui/non, texte, date) or the unit (€, %, etc.)
- Light background with border and shadow

---

## 10. Hover Feedback

The **outermost** mechanism container gets a subtle background highlight on hover. Nested mechanisms inside do not trigger their own hover when the outer one is already highlighted.

---

## 11. No User-Agent Stylesheet Interference

All lists use `<div>` with ARIA roles (`role="list"`, `role="listitem"`). No `<ul>`, `<ol>`, or `<li>` elements are used, to prevent browser default styles from interfering.

---

## 12. Configurable Fonts

Both the sans-serif and monospace font families are CSS custom properties with system-UI fallbacks. Users override by redefining the property after the CSS import.
