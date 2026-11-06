---
'@publicodes/cli': patch
---

Fix - infer a unitless value when multiplying a percentage by a unitless value (`5% * 200` now evaluates to `10` instead of `1000 %`)

Fix percentage handling in the `produit` mechanism so it matches multiplication expressions.

Reject sums that mix percentages with unitless values as incompatible units.
