---
'@publicodes/cli': patch
---

Fix - infer a unitless value when multiplying a percentage by a unitless value (`5% * 200` now evaluates to `10` instead of `1000 %`)
