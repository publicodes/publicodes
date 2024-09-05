---
'publicodes': patch
---

Fix arrondi mecanism error

For certain case, the value returned by the `arrondi` mecanism was not correct. For instance :

```yaml
arrondi:
  valeur: 4.55
  arrondi: 1 décimales
```

The value returned was `4.5` instead of `4.6`. This is now fixed.
