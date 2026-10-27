<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let {
		href,
		children,
		...rest
	}: HTMLAnchorAttributes & { href: string; children: Snippet } = $props();
</script>

<!--
	Opens in a new tab and says so: the arrow for sighted users, hidden text for screen readers.
	The word joiner keeps the arrow on the same line as the last word; it sits inside the hidden
	span so it stays out of the accessible name.
-->
<a {...rest} {href} target="_blank" rel="external noopener"
	>{@render children()}<span aria-hidden="true"
		>&#8288;<svg class="icon" width="10" height="10" viewBox="0 0 10 10"
			><path
				d="M3 1.5h5.5V7M8.5 1.5 1.5 8.5"
				fill="none"
				stroke="currentColor"
				stroke-width="1.4"
			/></svg
		></span
	><span class="visually-hidden"> (opens in a new tab)</span></a
>

<style>
	.icon {
		width: 0.6em;
		height: 0.6em;
		margin-left: 0.2em;
		vertical-align: 0.15em;
	}
</style>
