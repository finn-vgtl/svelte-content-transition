<script lang="ts">
	import { RollingNumber } from "#lib";

	// Shared by the glyphs and the colour, so both settle together.
	const duration = 420;

	let price = $state(184.32);
	let previous = $state(184.32);

	$effect(() => {
		const id = setInterval(() => {
			previous = price;
			price = Math.max(1, price + (Math.random() - 0.5) * 4);
		}, 1600);
		return () => clearInterval(id);
	});

	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	});
</script>

<RollingNumber
	value={formatter.format(price)}
	{duration}
	style="font-size: 40px; font-weight: 600; color: {price >= previous ? '#16a34a' : '#dc2626'}; transition: color {duration}ms"
	monospacedDigits
/>
