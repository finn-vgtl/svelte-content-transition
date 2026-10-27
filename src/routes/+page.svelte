<script lang="ts">
	import { NumericText } from "#lib";

	let count = $state(1234.5);
</script>

<main>
	<h1>svelte-content-transition</h1>

	<NumericText value={count.toFixed(2)} fontSize={48} fontWeight="600" monospacedDigits />

	<div class="controls">
		<button onclick={() => (count -= Math.round(Math.random() * 100))}>Decrease</button>
		<button onclick={() => (count += Math.round(Math.random() * 100))}>Increase</button>
	</div>
</main>

<style>
	main {
		font-family: system-ui, sans-serif;
		padding: 2rem;
	}

	.controls {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}
</style>
