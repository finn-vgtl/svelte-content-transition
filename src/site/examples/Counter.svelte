<script lang="ts">
	import { RollingNumber } from "#lib";

	let count = $state(1234);
</script>

<div class="demo">
	<RollingNumber value={count} style="font-size: 56px; font-weight: 600" monospacedDigits />
	<div class="controls">
		<button class="button" type="button" aria-label="Decrement" onclick={() => (count -= 1)}>−</button>
		<button class="button" type="button" aria-label="Increment" onclick={() => (count += 1)}>+</button>
	</div>
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.controls {
		display: flex;
		gap: 0.5rem;
	}

	.controls .button {
		width: 2.75rem;
		font-size: 1.1rem;
	}
</style>
