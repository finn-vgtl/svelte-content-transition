<script lang="ts">
	import { RollingNumber } from "#lib";

	const forecast = ["☀️ Sunny", "⛅ Cloudy", "🌧️ Rainy", "❄️ Snowy"];

	let index = $state(0);

	$effect(() => {
		const id = setInterval(() => {
			index = (index + 1) % forecast.length;
		}, 1600);
		return () => clearInterval(id);
	});
</script>

<RollingNumber value={forecast[index]} direction="up" style="font-size: 40px; font-weight: 600" />
