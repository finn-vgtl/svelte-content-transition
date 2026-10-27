<script lang="ts">
	import { NumericText, type NumericTextDirection } from "#lib";

	import CodeBlock from "./CodeBlock.svelte";

	// The library's own defaults, so the generated code only lists what was changed.
	const DEFAULTS = {
		direction: "auto" as NumericTextDirection,
		duration: 420,
		bounce: 0.46,
		enterScale: 0.4,
		travel: 1 / 3,
		blur: true,
		blurIntensity: 1,
		clip: true,
		monospacedDigits: false,
	};

	const INITIAL_VALUE = "2,048";
	const STEP = 137;

	const format = (number: number) => number.toLocaleString("en-US");

	let value = $state(INITIAL_VALUE);
	let direction = $state(DEFAULTS.direction);
	let duration = $state(DEFAULTS.duration);
	let bounce = $state(DEFAULTS.bounce);
	let enterScale = $state(DEFAULTS.enterScale);
	let travel = $state(DEFAULTS.travel);
	let blur = $state(DEFAULTS.blur);
	let blurIntensity = $state(DEFAULTS.blurIntensity);
	let clip = $state(DEFAULTS.clip);
	// On by default here, since the demo values are numbers; the library leaves it off.
	let monospacedDigits = $state(true);

	const directions: NumericTextDirection[] = ["auto", "up", "down"];

	// The value is free text. Stepping only works while it reads as an en-US number.
	const numeric = $derived.by(() => {
		const trimmed = value.trim().replaceAll(",", "");
		return trimmed === "" ? Number.NaN : Number(trimmed);
	});
	const canStep = $derived(Number.isFinite(numeric));

	function step(delta: number) {
		const decimals = value.split(".")[1]?.length ?? 0;
		value = (numeric + delta).toLocaleString("en-US", {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		});
	}

	function randomize() {
		value = format(Math.round(Math.random() * 99_999));
	}

	// The range input snaps the 1/3 default to its 0.01 step, so compare at that precision.
	const travelIsDefault = $derived(Math.abs(travel - DEFAULTS.travel) < 0.005);

	const isDefault = $derived(
		value === INITIAL_VALUE &&
			direction === DEFAULTS.direction &&
			duration === DEFAULTS.duration &&
			bounce === DEFAULTS.bounce &&
			enterScale === DEFAULTS.enterScale &&
			travelIsDefault &&
			blur === DEFAULTS.blur &&
			blurIntensity === DEFAULTS.blurIntensity &&
			clip === DEFAULTS.clip &&
			monospacedDigits,
	);

	function reset() {
		value = INITIAL_VALUE;
		({
			direction,
			duration,
			bounce,
			enterScale,
			travel,
			blur,
			blurIntensity,
			clip,
		} = DEFAULTS);
		monospacedDigits = true;
	}

	const round = (number: number) => Math.round(number * 100) / 100;

	const code = $derived(
		[
			"<NumericText",
			`\tvalue=${JSON.stringify(value)}`,
			direction !== DEFAULTS.direction && `\tdirection="${direction}"`,
			duration !== DEFAULTS.duration && `\tduration={${duration}}`,
			bounce !== DEFAULTS.bounce && `\tbounce={${bounce}}`,
			enterScale !== DEFAULTS.enterScale && `\tenterScale={${enterScale}}`,
			!travelIsDefault && `\ttravel={${round(travel)}}`,
			!blur && "\tblur={false}",
			blur &&
				blurIntensity !== DEFAULTS.blurIntensity &&
				`\tblurIntensity={${blurIntensity}}`,
			!clip && "\tclip={false}",
			monospacedDigits && "\tmonospacedDigits",
			"/>",
		]
			.filter(Boolean)
			.join("\n"),
	);
</script>

<div class="playground">
	<div class="stage">
		<NumericText
			{value}
			{direction}
			{duration}
			{bounce}
			{enterScale}
			{travel}
			{blur}
			{blurIntensity}
			{clip}
			{monospacedDigits}
			style="font-size: clamp(36px, 10vw, 64px); font-weight: 700"
		/>
		<div class="stage-controls">
			<button class="button" type="button" onclick={() => step(-STEP)} disabled={!canStep}
				>−{STEP}</button
			>
			<button class="button primary" type="button" onclick={randomize}>Randomize</button>
			<button class="button" type="button" onclick={() => step(STEP)} disabled={!canStep}
				>+{STEP}</button
			>
		</div>
	</div>

	<form class="controls" onsubmit={(event) => event.preventDefault()}>
		<label class="text">
			<span>value</span>
			<input type="text" bind:value maxlength="24" spellcheck="false" autocomplete="off" />
		</label>

		<fieldset class="segmented">
			<legend>direction</legend>
			{#each directions as option (option)}
				<label>
					<input type="radio" name="direction" value={option} bind:group={direction} />
					<span>{option}</span>
				</label>
			{/each}
		</fieldset>

		<label class="range">
			<span>duration <output>{duration}ms</output></span>
			<input type="range" min="100" max="1500" step="10" bind:value={duration} />
		</label>
		<label class="range">
			<span>bounce <output>{bounce}</output></span>
			<input type="range" min="0" max="0.95" step="0.01" bind:value={bounce} />
		</label>
		<label class="range">
			<span>enterScale <output>{enterScale}</output></span>
			<input type="range" min="0" max="2" step="0.05" bind:value={enterScale} />
		</label>
		<label class="range">
			<span>travel <output>{round(travel)}</output></span>
			<input type="range" min="0" max="3" step="0.01" bind:value={travel} />
		</label>
		<label class="range">
			<span>blurIntensity <output>{blurIntensity}</output></span>
			<input
				type="range"
				min="0"
				max="8"
				step="0.1"
				bind:value={blurIntensity}
				disabled={!blur}
			/>
		</label>
		<div class="checkboxes">
			<label class="checkbox">
				<input type="checkbox" bind:checked={blur} />
				<span>blur</span>
			</label>
			<label class="checkbox">
				<input type="checkbox" bind:checked={clip} />
				<span>clip</span>
			</label>
			<label class="checkbox">
				<input type="checkbox" bind:checked={monospacedDigits} />
				<span>monospacedDigits</span>
			</label>
		</div>
		<button class="button reset" type="button" onclick={reset} disabled={isDefault}>Reset</button>
	</form>

	<div class="code">
		<CodeBlock {code} title="Props" />
	</div>
</div>

<style>
	.playground {
		display: grid;
		gap: 1rem;
		grid-template-columns: minmax(0, 1fr);
	}

	@media (min-width: 860px) {
		.playground {
			grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		}

		.code {
			grid-column: 1 / -1;
		}
	}

	.stage {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		min-height: 18rem;
		padding: 2rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface-muted);
		overflow: hidden;
	}

	.stage-controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: 0.85rem;
		font-family: var(--font-mono);
	}

	.segmented {
		display: flex;
		margin: 0;
		padding: 0;
		border: none;
		gap: 0.25rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.segmented legend {
		float: left;
		margin-right: 0.75rem;
		color: var(--text-muted);
	}

	.segmented label {
		position: relative;
	}

	.segmented input {
		position: absolute;
		opacity: 0;
		inset: 0;
		margin: 0;
		cursor: pointer;
	}

	.segmented span {
		display: block;
		padding: 0.25rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: 6px;
	}

	.segmented input:checked + span {
		background: var(--text);
		border-color: var(--text);
		color: var(--bg);
	}

	.segmented input:focus-visible + span {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.range {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.range span {
		display: flex;
		justify-content: space-between;
		color: var(--text-muted);
	}

	.range output {
		color: var(--text);
	}

	.range input {
		width: 100%;
		accent-color: var(--accent);
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		color: var(--text-muted);
	}

	.text input {
		font: inherit;
		color: var(--text);
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
	}

	.text input:hover {
		border-color: var(--border-strong);
	}

	.checkboxes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
	}

	.checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.checkbox input {
		accent-color: var(--accent);
	}

	.reset {
		align-self: flex-start;
		font-family: var(--font-sans);
	}
</style>
