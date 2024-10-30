---
'publicodes': patch
---

Fix bug with contexte

v1.3.2 introduced a bug when using contexte :
- If a contexte was evaluated before and after `setSituation` with `keepPreviousSituation` on, the returned value would be the one of the first evaluation (before setSituation)
- If a contexte was used within a `inversion numérique`, the returned value would be `undefined`

This fixes it.
