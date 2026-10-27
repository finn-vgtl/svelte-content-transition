<script lang="ts">
	import { resolve } from "$app/paths";

	import CodeBlock from "../../site/CodeBlock.svelte";
	import ExternalLink from "../../site/ExternalLink.svelte";
	import InstallCommand from "../../site/InstallCommand.svelte";
	import PropTable, { type PropRow } from "../../site/PropTable.svelte";
	import Seo from "../../site/Seo.svelte";
	import {
		ATTRIBUTES_EXAMPLE,
		COUNTDOWN_EXAMPLE,
		FORMATTING_EXAMPLE,
		QUICK_START,
		STATIC_EXAMPLE,
		TUNING_EXAMPLE,
		TYPOGRAPHY_EXAMPLE,
	} from "../../site/snippets";

	const contentProps: PropRow[] = [
		{
			name: "value",
			type: "string | number",
			description:
				"The text to display. Required. Measuring, diffing and animating all happen per glyph.",
		},
		{
			name: "alignment",
			type: '"start" | "center" | "end"',
			default: '"start"',
			description:
				"Horizontal alignment of the line inside the component's bounds.",
		},
		{
			name: "decimalSeparator",
			type: "string",
			default: '"."',
			description:
				"The character separating the whole and fractional parts. Glyphs are aligned around it, so `123.45 → 123.46` only animates the final digit. Only the first character is used.",
		},
		{
			name: "monospacedDigits",
			type: "boolean",
			default: "false",
			description:
				"Adds `font-variant-numeric: tabular-nums` so unchanged digits don't shift sideways when a neighbour changes. Unset, `font-variant-numeric` is inherited.",
		},
	];

	const transitionProps: PropRow[] = [
		{
			name: "direction",
			type: '"auto" | "up" | "down"',
			default: '"auto"',
			description:
				"Which way glyphs travel. `auto` rolls up when the numeric value grows and down when it shrinks.",
		},
		{
			name: "duration",
			type: "number",
			default: "420",
			description:
				"Nominal transition duration in milliseconds. Scales every internal spring, so the character of the motion is preserved.",
		},
		{
			name: "bounce",
			type: "number",
			default: "0.46",
			description:
				"How far the vertical roll overshoots before settling. Clamped to `0`–`0.95`; `0` arrives dead straight.",
		},
		{
			name: "enterScale",
			type: "number",
			default: "0.4",
			description:
				"Size a glyph starts at when arriving and shrinks to when leaving. Clamped to `0`–`2`; `1` disables scaling.",
		},
		{
			name: "travel",
			type: "number",
			default: "0.333",
			description:
				"How far a glyph rolls, as a fraction of the line height. Clamped to `0`–`3`; `0` leaves only scale and fade.",
		},
		{
			name: "blurIntensity",
			type: "number",
			default: "1",
			description:
				"Blurs each glyph in proportion to how far through its transition it is, multiplying radii derived from the line height. Clamped to `0`–`8`; `0` turns blur off.",
		},
		{
			name: "maxBlurRadius",
			type: "number",
			default: "unbounded",
			description:
				"Ceiling on the blur radius in CSS pixels. Caps the cost of a transition when many glyphs change at once.",
		},
		{
			name: "clip",
			type: "boolean",
			default: "true",
			description:
				"Clips each glyph to the measured line box with a feathered edge, so rolling glyphs don't overlap surrounding content.",
		},
		{
			name: "animated",
			type: "boolean",
			default: "true",
			description:
				"Set to `false` to apply values instantly. Also treated as `false` while `prefers-reduced-motion` is enabled.",
		},
	];

	const TYPES_EXAMPLE = `import type {
	NumericTextProps,
	NumericTextTransitionProps,
	NumericTextAlignment, // "start" | "center" | "end"
	NumericTextDirection, // "auto" | "up" | "down"
} from "svelte-content-transition";`;
</script>

<Seo
	title="Documentation · svelte-content-transition"
	description="Install svelte-content-transition and learn the NumericText component: formatting, direction, motion tuning, accessibility, server rendering and the full prop reference."
	path="/docs"
/>

<h1>Documentation</h1>
<p class="lead">
	Everything you need to use <code>NumericText</code>, from installation to the full prop reference.
</p>

<p class="group">Getting started</p>

<section>
	<h2 id="introduction">Introduction</h2>
	<p>
		<code>svelte-content-transition</code> provides a single Svelte 5 component,
		<code>NumericText</code>. It renders a line of text and, whenever its value changes, animates
		each glyph that changed: departing glyphs roll out, scale down, blur and fade; arriving glyphs do
		the reverse. Unchanged glyphs slide into their new positions.
	</p>
	<p>
		It is based on the web renderer from
		<ExternalLink href="https://github.com/rit3zh/expo-content-transition"
			>expo-content-transition</ExternalLink
		>, with a Svelte-native API. The effect is inspired by SwiftUI's
		<ExternalLink
			href="https://developer.apple.com/documentation/swiftui/contenttransition/numerictext(value:)"
			><code>ContentTransition.numericText(value:)</code></ExternalLink
		>.
	</p>
</section>

<section>
	<h2 id="installation">Installation</h2>
	<p>Install the package with your package manager of choice. It requires Svelte <code>^5.7.0</code>.</p>
	<InstallCommand />
</section>

<section>
	<h2 id="quick-start">Quick start</h2>
	<p>
		Import the component and pass it a <code>value</code>. Every other prop is optional.
	</p>
	<CodeBlock code={QUICK_START} title="Counter.svelte" />
	<p>
		The first value renders without animation. Every later change to <code>value</code> triggers a
		transition.
	</p>
</section>

<p class="group">Guides</p>

<section>
	<h2 id="formatting">Formatting values</h2>
	<p>
		<code>NumericText</code> does not format numbers itself. It animates whatever string it receives,
		so format with <code>Intl.NumberFormat</code>, <code>toFixed</code> or anything else before
		passing the value in. Passing a number is the same as passing <code>String(value)</code>.
	</p>
	<p>
		Glyphs are aligned around the decimal separator, so a change in the fractional part never shifts
		the whole part. For locales that use a comma, set <code>decimalSeparator</code>:
	</p>
	<CodeBlock code={FORMATTING_EXAMPLE} title="Price.svelte" />
	<p>
		Add <code>monospacedDigits</code> whenever the value is a number. Without it, a narrow
		<code>1</code> turning into a wide <code>8</code> pushes every following glyph sideways.
	</p>
</section>

<section>
	<h2 id="direction">Direction</h2>
	<p>
		With the default <code>direction="auto"</code>, the component parses the old and new values as
		numbers and rolls glyphs up when the value grows and down when it shrinks.
	</p>
	<p>
		Content that does not read as a number, such as a clock, a date or a status label, should pin
		the direction with <code>"up"</code> or <code>"down"</code>. So should a countdown that must
		always tick one way:
	</p>
	<CodeBlock code={COUNTDOWN_EXAMPLE} title="Countdown.svelte" />
</section>

<section>
	<h2 id="tuning-motion">Tuning the motion</h2>
	<p>These props shape the transition. They combine freely:</p>
	<ul>
		<li><code>duration</code> scales every spring, keeping the feel of the motion intact.</li>
		<li><code>bounce</code> controls overshoot of the roll. Opacity and position never bounce.</li>
		<li><code>travel</code> sets how far glyphs roll, relative to the line height.</li>
		<li><code>enterScale</code> sets the size glyphs arrive at and leave with.</li>
		<li>
			<code>blurIntensity</code> and <code>maxBlurRadius</code> control the motion blur.
		</li>
	</ul>
	<CodeBlock code={TUNING_EXAMPLE} title="Tuned.svelte" />
	<p>
		Blur is the most expensive part of a transition. When many glyphs change at once, or when you
		raise <code>blurIntensity</code> on large text, set <code>maxBlurRadius</code> to cap the cost.
		The <a href={resolve("/#examples")}>playground on the home page</a> lets you try every value live.
	</p>
</section>

<section>
	<h2 id="typography">Typography</h2>
	<p>
		There are no typography props. Like any inline text, the component inherits font, size,
		weight, style, letter spacing, colour and font features from the surrounding CSS, and glyphs
		are measured in exactly that typography.
	</p>
	<CodeBlock code={TYPOGRAPHY_EXAMPLE} title="Distance.svelte" />
	<p>
		To style one instance directly, pass <code>class</code> or <code>style</code>; both land on the
		host element. When the inherited typography changes later, from a theme switch, a media query
		or a web font finishing loading, glyphs are re-measured and laid out again without animating.
	</p>
</section>

<section>
	<h2 id="disabling-animation">Disabling animation</h2>
	<p>
		Set <code>animated={"{false}"}</code> to apply changes instantly. The prop is reactive, so you can
		turn animation on only when it is meaningful, for example after the first user interaction:
	</p>
	<CodeBlock code={STATIC_EXAMPLE} />
</section>

<section>
	<h2 id="accessibility">Accessibility</h2>
	<ul>
		<li>
			The current value is real text inside the host, transparent behind the animated glyphs.
			Screen readers read it once, in line with the surrounding content, instead of glyph by
			glyph, and find in page, translation and copy see the value too.
		</li>
		<li>
			When the user has <code>prefers-reduced-motion</code> enabled, animation is turned off
			regardless of the <code>animated</code> prop.
		</li>
		<li>
			Value changes are not announced automatically. If an update matters to the user, pass
			<code>role="status"</code> to make the component a polite live region, or wrap it in an
			element with <code>aria-live="polite"</code>.
		</li>
	</ul>
</section>

<section>
	<h2 id="ssr">Server rendering</h2>
	<p>
		During server rendering and before hydration, the component renders the value as plain text
		in the inherited typography. When the glyph layer mounts, that copy stays in the layout,
		hidden, so the host keeps its size and text baseline when it sits inline. There is no layout
		shift and no empty box.
	</p>
</section>

<p class="group">API reference</p>

<section>
	<h2 id="props-content">Content props</h2>
	<PropTable rows={contentProps} />
</section>

<section>
	<h2 id="props-transition">Transition props</h2>
	<PropTable rows={transitionProps} />
</section>

<section>
	<h2 id="html-attributes">HTML attributes</h2>
	<p>
		Every other attribute is forwarded to the host <code>&lt;span&gt;</code>, including
		<code>class</code>, <code>style</code>, <code>id</code>, <code>data-*</code> and event handlers.
		<code>role</code> and <code>children</code> are reserved by the component, and
		<code>aria-label</code> is always set to the current value.
	</p>
	<CodeBlock code={ATTRIBUTES_EXAMPLE} />
	<p>
		The host is an <code>inline-block</code> with an explicit width and height that follow the
		content, so it can sit inside running text or a flex layout.
	</p>
</section>

<section>
	<h2 id="types">Types</h2>
	<p>All prop types are exported for use in wrapper components:</p>
	<CodeBlock code={TYPES_EXAMPLE} title="types.ts" />
</section>

<style>
	h1 {
		margin: 0 0 0.5rem;
		font-size: 2.25rem;
		letter-spacing: -0.02em;
	}

	.lead {
		margin: 0 0 1rem;
		font-size: 1.1rem;
		color: var(--text-muted);
	}

	.group {
		margin: 3.5rem 0 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--accent-text);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 2.5rem;
	}

	h2 {
		margin: 0;
		font-size: 1.4rem;
		letter-spacing: -0.01em;
	}

	section p,
	section ul {
		margin: 0;
	}

	section ul {
		padding-left: 1.25rem;
	}

	section li + li {
		margin-top: 0.4rem;
	}
</style>
