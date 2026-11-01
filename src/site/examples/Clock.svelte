<script lang="ts">
	import { RollingNumber } from "#lib";

	const format = (date: Date) =>
		date.toLocaleTimeString("en-GB", { hour12: false });

	let time = $state(format(new Date()));

	$effect(() => {
		const id = setInterval(() => (time = format(new Date())), 1000);
		return () => clearInterval(id);
	});
</script>

<RollingNumber value={time} direction="up" style="font-size: 40px" monospacedDigits />
