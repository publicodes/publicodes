This library export utilities to create interactive forms and simulators from publicodes rules.

This library is framework-agnostic and can be used with any state management system:

- React useState
- Redux
- Svelte stores
- Vue reactive system
- etc.

```typescript
// Initialize form state
const formState = initFormState({ engine }, 'target . rule')

// Get current page UI elements
const pageElements = currentPage(formState, { engine })

// Handle user input
const newState = handleInputChange(formState, 'rule . name', value, { engine })

// Navigate pages
const nextState = goToNextPage(formState)
const prevState = goToPreviousPage(formState)
```

## Getting started

```sh
npm install publicodes publicodes-form
```

Then follow the [guide](https://publi.codes/docs/tutoriel#documentation-interactive) to create a simple page.
