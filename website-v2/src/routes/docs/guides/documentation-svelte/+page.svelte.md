---
sidebar_position: 3
title: Svelte
---

Vous pouvez même afficher la documentation dans une application qui n’est pas développée en React, en “montant” React seulement pour la partie documentation.

```html
<script>
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { createElement } from 'react'
	import { render } from 'react-dom'
	import { RulePage } from 'publicodes/react-ui'

	let domElement

	// A Link React component that calls SvelteKit `goto` on click
	function Link({ to, children }) {
		const onClick = (evt) => {
			evt.preventDefault()
			goto(to)
		}
		return createElement('a', { onClick }, children)
	}

	const props = {
		renderers: { Link },
		// other props left as an exercice to the reader
	}

	onMount(() => {
		render(createElement(RulePage, props), domElement)
	})
</script>

<div bind:this="{domElement}" />
```
