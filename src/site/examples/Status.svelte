<script lang="ts">
	import { NumericText } from "#lib";

	const steps = ["Save", "Saving…", "Saved"];

	let index = $state(0);

	$effect(() => {
		const id = setInterval(() => {
			index = (index + 1) % steps.length;
		}, 1400);
		return () => clearInterval(id);
	});
</script>

<NumericText value={steps[index]} direction="up" style="font-size: 40px; font-weight: 600" />
