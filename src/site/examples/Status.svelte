<script lang="ts">
	import { RollingNumber } from "#lib";

	const steps = ["Save", "Saving…", "Saved"];

	let index = $state(0);

	$effect(() => {
		const id = setInterval(() => {
			index = (index + 1) % steps.length;
		}, 1400);
		return () => clearInterval(id);
	});
</script>

<RollingNumber value={steps[index]} direction="up" style="font-size: 40px; font-weight: 600" />
