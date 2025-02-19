---
'@publicodes/forms': minor
---

Change form state manipulation function signature

Instead of mixing named parameters and classic parameters, we now use a single object parameter. This makes the function easier to use and understand.

```diff
- function currentPage(formState, { engine }) {
+ function setFormValue({ formState, engine }) {
```
