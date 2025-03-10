This library exports utilities to create interactive forms and simulators from publicodes rules.

This library is framework-agnostic and can be used with any state management system:

- React useState
- Redux
- Svelte stores
- Vue reactive system
- etc.

## Usage

```typescript
// Create a form builder
const engine = new Engine(rules)
const formBuilder = new FormBuilder({ engine })

// Initialize form state
let state = FormBuilder.newState()
state = formBuilder.start(state, 'target . rule')

// Get current page UI elements
const formElements = formBuilder.currentPage(state)

// Handle user input
state = formBuilder.handleInputChange(state, 'rule . name', 'new value')

// Navigate pages
state = formBuilder.goToNextPage(state)
state = formBuilder.goToPreviousPage(state)

// Get pagination information
const { current, pageCount, hasNextPage, hasPreviousPage } =
    formBuilder.pagination(state)
```

## Getting started

```sh
npm install publicodes publicodes-form
```

Then follow the [guide](https://publi.codes/docs/tutoriel#documentation-interactive) to create a simple page.
