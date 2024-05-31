<script>
	import { onMount } from 'svelte';

	let animate = false;
	// add class to animate pages on mount
	onMount(() => {
		animate = true;
	});
</script>

<svg xmlns="http://www.w3.org/2000/svg" width="190" height="135.1" viewBox="0 0 41.1 35.7">
	<path
		id="cover"
		class:animate
		class="cover"
		d="M21.1 7 0 2.9v28.7l21 4.2"
		fill="#2975d1"
		fill-rule="evenodd"
	/>
	<path
		class:animate
		class="page-1"
		d="m21 35.6 20-4.2L41 3l-20 4z"
		fill="#2975d1"
		fill-rule="evenodd"
	/>
	<path
		class:animate
		class="page-2"
		d="m21 35.7 17.3-5.5V1.8L21.1 7.2z"
		fill="#2d5ea7"
		fill-rule="evenodd"
	/>
	<path
		class:animate
		class="page-3"
		d="m20.9 35.6 13.7-7V0L21 7z"
		fill="#333350"
		fill-rule="evenodd"
	/>

	<g class:animate class="page-3 text">
		<path
			class="st0"
			fill="none"
			stroke="#fff"
			stroke-width="2"
			stroke-miterlimit="10"
			d="m520.3 623.8 13-2.5M535.3 620.9l5-.9M542.3 619.6l2-.4M546.3 618.8l2-.3M520.3 638.8l12-2.3M534.3 636.1l2-.4M538.3 635.4l2-.4M520.3 633.8l10-1.9M532.3 631.5l12-2.3M537.3 625.6l4-.8M520.3 628.8l15-2.9M543.3 624.4l15-2.8M539.3 640.2l-19 3.6"
			transform="matrix(.28052 -.05048 0 .42413 -123.3 -217.2)"
		/>
		<text
			transform="matrix(.3113 -.1022 0 .38219 -63.4 -310.1)"
			y="930.8"
			x="276.6"
			style="line-height:0%"
			xml:space="preserve"
			font-weight="400"
			font-size="20.8"
			font-family="sans-serif"
			letter-spacing="0"
			word-spacing="0"
			stroke="#fff"
			><tspan style="line-height:1.25" y="930.8" x="276.6" font-size="21.7" fill="#fff">&gt;</tspan
			></text
		>
	</g>
	<g class:animate class="cover">
		<g fill="#fff" stroke="#fff" stroke-width=".3">
			<path
				d="M481 585.5h.9v1.5h-1zM467.9 601.2v1h22.3v-1h-1.6v-1h-19.1v1z"
				transform="matrix(.37003 .07807 -.00592 .37118 -163 -245.3)"
			/>
			<path
				d="M485.7 594.2h2v-1.7l-8.5-3V587h.8v-1.5h-.8v-.4h-.4v4.4l-8.6 3v1.7h13.2zM472.2 594.5h2.2v5.3h-2.2zM476 594.5h2.2v5.3h-2.3zM479.7 594.5h2.2v5.3h-2.2zM483.4 594.5h2.3v5.3h-2.3z"
				transform="matrix(.37003 .07807 -.00592 .37118 -163 -245.3)"
			/>
		</g>
		<g fill="none" stroke="#fff" stroke-width=".8">
			<path
				d="M582.7 269.9h39.7M582.7 267.7h39.7M582.6 265.6h39.7M582.6 263.4h39.8M582.5 255.4h39.7M582.2 257.6H622"
				transform="matrix(.36108 .06767 0 .5104 -207.1 -151.4)"
			/>
		</g>
	</g>
</svg>

<style>
	@keyframes rotatePage {
		0% {
		}
		100% {
			transform: rotateX(-20deg) rotateY(0);
		}
	}
	@keyframes fadein {
		0% {
			opacity: 0;
			transform: translateY(-3px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.cover {
		transform: rotateY(-45deg) translateZ(-5px);
		transform-origin: 10%;
	}
	.page-1,
	.page-2,
	.page-3 {
		transform: rotateY(45deg) translateZ(5px);
		transform-origin: 10%;
	}
	.animate {
		animation: rotatePage 1s forwards;
	}
	.text {
		opacity: 0;
		transform: translateY(-5px);
	}
	.text.animate {
		animation: fadein 1s forwards;
		animation-delay: 0.5s;
	}
	/* 
	.animate.page2 {
		animation-delay: 0.1s;
	}

	.animate.page3 {
		animation-delay: 0.2s;
	} */
</style>
