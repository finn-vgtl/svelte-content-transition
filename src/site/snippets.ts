const PACKAGE = "svelte-rolling-number";

const INSTALL_COMMANDS = {
	npm: `npm install ${PACKAGE}`,
	pnpm: `pnpm add ${PACKAGE}`,
	yarn: `yarn add ${PACKAGE}`,
	bun: `bun add ${PACKAGE}`,
} as const;

type PackageManager = keyof typeof INSTALL_COMMANDS;

const QUICK_START = `<script lang="ts">
	import { RollingNumber } from "svelte-rolling-number";

	let count = $state(0);
</script>

<RollingNumber value={count} style="font-size: 48px" monospacedDigits />

<button onclick={() => count++}>Increment</button>`;

const COUNTER_EXAMPLE = `<script lang="ts">
	import { RollingNumber } from "svelte-rolling-number";

	let count = $state(1234);
</script>

<RollingNumber value={count} style="font-size: 56px; font-weight: 600" monospacedDigits />

<button onclick={() => (count -= 1)}>−</button>
<button onclick={() => (count += 1)}>+</button>`;

const PRICE_EXAMPLE = `<script lang="ts">
	import { RollingNumber } from "svelte-rolling-number";

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
/>`;

const CLOCK_EXAMPLE = `<script lang="ts">
	import { RollingNumber } from "svelte-rolling-number";

	const format = (date: Date) =>
		date.toLocaleTimeString("en-GB", { hour12: false });

	let time = $state(format(new Date()));

	$effect(() => {
		const id = setInterval(() => (time = format(new Date())), 1000);
		return () => clearInterval(id);
	});
</script>

<!-- A clock is not a number, so pin the direction. -->
<RollingNumber value={time} direction="up" style="font-size: 40px" monospacedDigits />`;

const COUNTDOWN_EXAMPLE = `<script lang="ts">
	import { RollingNumber } from "svelte-rolling-number";

	let seconds = $state(10);

	$effect(() => {
		const id = setInterval(() => {
			seconds = seconds === 0 ? 10 : seconds - 1;
		}, 1000);
		return () => clearInterval(id);
	});
</script>

<RollingNumber
	value={seconds}
	direction="down"
	bounce={0}
	travel={1}
	enterScale={1}
	style="font-size: 56px; font-weight: 700"
	monospacedDigits
/>`;

const STATUS_EXAMPLE = `<script lang="ts">
	import { RollingNumber } from "svelte-rolling-number";

	const steps = ["Save", "Saving…", "Saved"];

	let index = $state(0);

	$effect(() => {
		const id = setInterval(() => {
			index = (index + 1) % steps.length;
		}, 1400);
		return () => clearInterval(id);
	});
</script>

<!-- Text has no numeric order, so pin the direction. -->
<RollingNumber value={steps[index]} direction="up" style="font-size: 40px; font-weight: 600" />`;

const INLINE_EXAMPLE = `<script lang="ts">
	import { RollingNumber } from "svelte-rolling-number";

	let readers = $state(97);

	$effect(() => {
		const id = setInterval(() => {
			// Hover around 100 so the count keeps gaining and losing a digit.
			readers += readers < 100 ? 2 : Math.random() < 0.5 ? -3 : 1;
		}, 1500);
		return () => clearInterval(id);
	});
</script>

<!-- Inherits the paragraph's font and sits on its baseline. -->
<p>
	Right now, <RollingNumber value={readers} style="font-weight: 600" /> people are reading this page,
	and the sentence makes room as the count grows.
</p>`;

const TUNING_EXAMPLE = `<RollingNumber
	value={value}
	duration={700}
	bounce={0.7}
	travel={0.6}
	enterScale={0.2}
	blurIntensity={3}
	maxBlurRadius={12}
/>`;

const TYPOGRAPHY_EXAMPLE = `<p class="distance">
	<RollingNumber value="42,195 km" />
</p>

<style>
	.distance {
		font: italic 700 32px Georgia, serif;
		letter-spacing: -0.5px;
		color: rebeccapurple;
	}
</style>`;

const FORMATTING_EXAMPLE = `<script lang="ts">
	const euro = new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
	});

	let amount = $state(1299.5);
</script>

<!-- "1.299,50 €": align around the comma, not the dot. -->
<RollingNumber value={euro.format(amount)} decimalSeparator="," monospacedDigits />`;

const ATTRIBUTES_EXAMPLE = `<RollingNumber
	value={score}
	class="score"
	style="vertical-align: middle"
	data-testid="score"
/>`;

const STATIC_EXAMPLE = `<!-- Only animate after the user interacts. -->
<RollingNumber value={total} animated={hasInteracted} />`;

export type { PackageManager };
export {
	ATTRIBUTES_EXAMPLE,
	CLOCK_EXAMPLE,
	COUNTDOWN_EXAMPLE,
	COUNTER_EXAMPLE,
	FORMATTING_EXAMPLE,
	INLINE_EXAMPLE,
	INSTALL_COMMANDS,
	PACKAGE,
	PRICE_EXAMPLE,
	QUICK_START,
	STATIC_EXAMPLE,
	STATUS_EXAMPLE,
	TUNING_EXAMPLE,
	TYPOGRAPHY_EXAMPLE,
};
