<script lang="ts">
	import { resolve } from "$app/paths";

	import CodeBlock from "../site/CodeBlock.svelte";
	import ExternalLink from "../site/ExternalLink.svelte";
	import Clock from "../site/examples/Clock.svelte";
	import Countdown from "../site/examples/Countdown.svelte";
	import Counter from "../site/examples/Counter.svelte";
	import Inline from "../site/examples/Inline.svelte";
	import PriceTicker from "../site/examples/PriceTicker.svelte";
	import Status from "../site/examples/Status.svelte";
	import InstallCommand from "../site/InstallCommand.svelte";
	import Playground from "../site/Playground.svelte";
	import Seo from "../site/Seo.svelte";
	import { NPM_URL, pageUrl, REPOSITORY_URL, SITE_NAME } from "../site/site";
	import {
		CLOCK_EXAMPLE,
		COUNTDOWN_EXAMPLE,
		INLINE_EXAMPLE,
		PRICE_EXAMPLE,
		QUICK_START,
		STATUS_EXAMPLE,
	} from "../site/snippets";

	const features = [
		{
			title: "Per-glyph diffing",
			body: "Only the characters that change move. Values are aligned around the decimal separator, so 123.45 → 123.46 animates a single digit.",
		},
		{
			title: "Spring-driven motion",
			body: "Roll, scale, fade and blur run on springs. Tune duration, bounce and travel; the character of the motion stays intact.",
		},
		{
			title: "Accessible by default",
			body: "Screen readers get the plain value. prefers-reduced-motion disables animation automatically.",
		},
		{
			title: "SSR friendly",
			body: "The value renders as plain text on the server and before hydration, so there is no layout shift or empty box.",
		},
	];

	const examples = [
		{
			id: "price",
			title: "Price ticker",
			file: "PriceTicker.svelte",
			description:
				"Format with Intl.NumberFormat and fade the colour as the price moves, in step with the glyphs. Direction follows the value.",
			demo: PriceTicker,
			code: PRICE_EXAMPLE,
		},
		{
			id: "clock",
			title: "Clock",
			file: "Clock.svelte",
			description:
				"A time string is not a number, so the direction is pinned to always roll up.",
			demo: Clock,
			code: CLOCK_EXAMPLE,
		},
		{
			id: "countdown",
			title: "Countdown",
			file: "Countdown.svelte",
			description:
				"No bounce, no scale and a full line of travel give a mechanical, flip-counter feel.",
			demo: Countdown,
			code: COUNTDOWN_EXAMPLE,
		},
		{
			id: "status",
			title: "Status label",
			file: "Status.svelte",
			description:
				'Any string works, not just numbers. Plain text is matched from the start, so the shared "Sav" stays put and only the ending rolls.',
			demo: Status,
			code: STATUS_EXAMPLE,
		},
		{
			id: "inline",
			title: "Inline in a sentence",
			file: "Inline.svelte",
			description:
				"NumericText renders inline, inherits the surrounding font and sits on the text baseline. When the value gains a digit, the width animates and the rest of the line follows.",
			demo: Inline,
			code: INLINE_EXAMPLE,
		},
	];

	const description =
		"A Svelte 5 component that animates numbers and text glyph by glyph with spring physics, blur and clipping. Built for prices, counters, clocks and scores.";

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "SoftwareSourceCode",
		name: SITE_NAME,
		description,
		url: pageUrl("/"),
		codeRepository: REPOSITORY_URL,
		sameAs: [NPM_URL],
		programmingLanguage: ["TypeScript", "Svelte"],
		runtimePlatform: "Svelte 5",
		license: "https://opensource.org/licenses/MIT",
		author: { "@type": "Person", name: "Finn Voigtländer" },
	};
</script>

<Seo title="svelte-content-transition · Animated number transitions for Svelte 5" {description} path="/" />

<svelte:head>
	<!-- Escape "<" so a value can never close the script element early. -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData).replaceAll("<", "\\u003c")}</script>`}
</svelte:head>

<section class="hero">
	<div class="container hero-grid">
		<div class="hero-copy">
			<p class="eyebrow">Svelte 5 component</p>
			<h1>Numbers that roll, not jump.</h1>
			<p class="lead">
				<code>NumericText</code> animates every changed glyph with springs, blur and clipping.
				Drop it in wherever a value changes: prices, counters, clocks, scores.
			</p>
			<div class="actions">
				<a class="button primary" href={resolve("/docs")}>Read the docs</a>
				<a class="button" href="#examples">See examples</a>
			</div>
			<InstallCommand />
		</div>
		<div class="hero-demo">
			<Counter />
		</div>
	</div>
</section>

<section class="section" aria-labelledby="features-title">
	<div class="container">
		<h2 id="features-title" class="visually-hidden">Features</h2>
		<ul class="features">
			{#each features as feature (feature.title)}
				<li>
					<h3>{feature.title}</h3>
					<p>{feature.body}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="section" id="usage" aria-labelledby="usage-title">
	<div class="container usage">
		<div>
			<h2 id="usage-title">Usage</h2>
			<p>
				Import <code>NumericText</code> and pass it a <code>value</code>. Strings and numbers both
				work. Whenever the value changes, the component diffs the old and new text per glyph and
				animates only what changed.
			</p>
			<ol class="steps">
				<li>
					Install the <ExternalLink href={NPM_URL}>package from npm</ExternalLink>. It needs Svelte
					<code>^5.7.0</code>.
				</li>
				<li>Render <code>&lt;NumericText value=&#123;…&#125; /&gt;</code>.</li>
				<li>
					Style it with plain CSS, which it inherits like any text, and tune the motion with
					props such as <code>duration</code> and <code>bounce</code>.
				</li>
			</ol>
			<a href={resolve("/docs")}>Full documentation →</a>
		</div>
		<CodeBlock code={QUICK_START} title="Counter.svelte" />
	</div>
</section>

<section class="section" id="examples" aria-labelledby="examples-title">
	<div class="container">
		<h2 id="examples-title">Examples</h2>
		<p class="section-lead">Each demo below runs the code next to it.</p>

		<div class="examples">
			{#each examples as example (example.id)}
				<article class="example" aria-labelledby="example-{example.id}">
					<div class="example-demo">
						<example.demo />
					</div>
					<div class="example-body">
						<h3 id="example-{example.id}">{example.title}</h3>
						<p>{example.description}</p>
						<CodeBlock code={example.code} title={example.file} />
					</div>
				</article>
			{/each}
		</div>

		<h3 class="playground-title">Playground</h3>
		<p class="section-lead">Type any value, or step it with the buttons, then tune the transition props. The code below updates as you go.</p>
		<Playground />
	</div>
</section>

<section class="section cta">
	<div class="container">
		<h2>Ready to make your numbers move?</h2>
		<p>Every prop, type and default is covered in the docs.</p>
		<a class="button primary" href={resolve("/docs")}>Read the docs</a>
	</div>
</section>

<style>
	.hero {
		padding: 4rem 0 3rem;
		border-bottom: 1px solid var(--border);
	}

	.hero-grid {
		display: grid;
		gap: 3rem;
		align-items: center;
		grid-template-columns: minmax(0, 1fr);
	}

	@media (min-width: 900px) {
		.hero {
			padding: 6rem 0 5rem;
		}

		.hero-grid {
			grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		}
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent-text);
	}

	h1 {
		margin: 0;
		font-size: clamp(2.25rem, 6vw, 3.75rem);
		line-height: 1.05;
		letter-spacing: -0.03em;
	}

	.lead {
		margin: 1.25rem 0 1.75rem;
		font-size: 1.125rem;
		color: var(--text-muted);
		max-width: 34rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1.75rem;
	}

	.hero-demo {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 16rem;
		padding: 2rem 1rem;
		border: 1px solid var(--border);
		border-radius: 16px;
		background:
			radial-gradient(
				circle at 50% 0%,
				color-mix(in srgb, var(--accent) 12%, transparent),
				transparent 70%
			),
			var(--surface-muted);
	}

	.section {
		padding: 4rem 0;
	}

	.section + .section {
		border-top: 1px solid var(--border);
	}

	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.75rem;
		letter-spacing: -0.02em;
	}

	.section-lead {
		margin: 0 0 2rem;
		color: var(--text-muted);
	}

	.features {
		display: grid;
		gap: 1.5rem 2rem;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.features h3 {
		margin: 0 0 0.35rem;
		font-size: 1rem;
	}

	.features p {
		margin: 0;
		font-size: 0.925rem;
		color: var(--text-muted);
	}

	.usage {
		display: grid;
		gap: 2rem;
		grid-template-columns: minmax(0, 1fr);
		align-items: start;
	}

	@media (min-width: 900px) {
		.usage {
			grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
			gap: 3rem;
		}
	}

	.usage p {
		color: var(--text-muted);
	}

	.steps {
		padding-left: 1.25rem;
		margin: 0 0 1.25rem;
	}

	.steps li {
		margin-bottom: 0.4rem;
	}

	.examples {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 4rem;
	}

	.example {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		border: 1px solid var(--border);
		border-radius: 16px;
		overflow: hidden;
	}

	@media (min-width: 900px) {
		.example {
			grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		}
	}

	.example-demo {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 12rem;
		padding: 2rem 1rem;
		background: var(--surface-muted);
	}

	.example-body {
		padding: 1.5rem;
		min-width: 0;
	}

	.example-body h3 {
		margin: 0 0 0.25rem;
		font-size: 1.1rem;
	}

	.example-body p {
		margin: 0 0 1rem;
		color: var(--text-muted);
		font-size: 0.925rem;
	}

	.playground-title {
		margin: 0 0 0.5rem;
		font-size: 1.35rem;
	}

	.cta {
		text-align: center;
	}

	.cta p {
		color: var(--text-muted);
		margin: 0 0 1.5rem;
	}
</style>
