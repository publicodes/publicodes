---
'@publicodes/react-ui': patch
---

Multiple improvement on accessibility :

* Change level of title inside accordion
* Increase constrate on Copy button
* Implement Aria Dialog pattern on mobile menu
* Use proper ul/li imbrication on menu
* Use title instead of aria label to specify that link open in a new window

Note that the markup of the navigation menu is modified, which can lead to break its style if it was overridden manually by CSS from the application.

