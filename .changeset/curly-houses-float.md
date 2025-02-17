---
'publicodes': patch
---

⚡ Performance improvements for parsing rules

Rework parser implementation from Nearley to a hand-written recursive descent parser.

- 3.25x faster parsing of modele-social rules / 5.2x faster parsing of nosgestesclimat rules
- Zero dependencies for publicodes
- Improved error messages for parsing errors
- Added tests for the new parser

Thanks @bjlaa, @Clemog, @EmileRolley, @JalilArfaoui, @johangirod!
