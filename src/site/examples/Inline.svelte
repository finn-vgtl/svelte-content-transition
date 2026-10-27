<script lang="ts">
	import { NumericText } from "#lib";

	let readers = $state(97);

	$effect(() => {
		const id = setInterval(() => {
			// Hover around 100 so the count keeps gaining and losing a digit.
			readers += readers < 100 ? 2 : Math.random() < 0.5 ? -3 : 1;
		}, 1500);
		return () => clearInterval(id);
	});
</script>

<p class="sentence">
	Right now, <NumericText value={readers} style="font-weight: 600" /> people are reading this page,
	and the sentence makes room as the count grows.
</p>

<style>
	.sentence {
		max-width: 22rem;
		margin: 0;
		font-size: 1.25rem;
		line-height: 1.6;
	}
</style>
