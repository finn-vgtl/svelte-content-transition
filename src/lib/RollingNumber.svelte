<!--
@component
Renders a line of text and animates each glyph that changes when `value` changes: departing glyphs
roll out, scale down, blur and fade, arriving glyphs do the reverse, and unchanged glyphs slide into
place. The first value renders without animation.

Works with any string, not just numbers. Font, size, weight and colour are inherited from the
surrounding CSS.

@example
```svelte
<RollingNumber value={count} style="font-size: 48px" monospacedDigits />
```

@see https://finn-vgtl.github.io/svelte-rolling-number
-->

<script lang="ts">
	import { prefersReducedMotion } from "svelte/motion";

	import { TransitionSprings } from "./core/animation/TransitionSprings";
	import { alignmentFromProp, directionFromProp } from "./core/enums";
	import type { ContentSize } from "./core/glyphs";
	import { RollingNumberLabel } from "./core/label/RollingNumberLabel";
	import {
		type RollingNumberSpec,
		TRANSITION_SHAPE_DEFAULTS,
	} from "./core/records";
	import type { RollingNumberProps } from "./types";

	const MAX_BLUR_INTENSITY = 8;
	const MAX_ENTER_SCALE = 2;
	const MAX_TRAVEL_RATIO = 3;
	const MAX_BOUNCE = 0.95;
	const MILLISECONDS_PER_SECOND = 1000;

	const clamp = (value: number, min: number, max: number): number =>
		Math.min(Math.max(value, min), max);

	let {
		value,
		alignment,
		decimalSeparator,
		direction,
		duration,
		bounce,
		enterScale,
		travel,
		blurIntensity,
		maxBlurRadius,
		clip,
		animated,
		monospacedDigits,
		style,
		...rest
	}: RollingNumberProps = $props();

	let host = $state<HTMLSpanElement>();
	let label = $state.raw<RollingNumberLabel | null>(null);
	let contentSize = $state.raw<ContentSize | null>(null);

	const text = $derived(typeof value === "number" ? String(value) : value);

	const spec: RollingNumberSpec = $derived({
		text,
		alignment: alignmentFromProp(alignment),
		direction: directionFromProp(direction),
		decimalSeparator:
			(decimalSeparator && Array.from(decimalSeparator)[0]) || ".",
		shape: {
			blurIntensity: clamp(
				blurIntensity ?? TRANSITION_SHAPE_DEFAULTS.blurIntensity,
				0,
				MAX_BLUR_INTENSITY,
			),
			maxBlurRadius:
				maxBlurRadius == null
					? TRANSITION_SHAPE_DEFAULTS.maxBlurRadius
					: Math.max(maxBlurRadius, 0),
			enterScale: clamp(
				enterScale ?? TRANSITION_SHAPE_DEFAULTS.enterScale,
				0,
				MAX_ENTER_SCALE,
			),
			travelRatio: clamp(
				travel ?? TRANSITION_SHAPE_DEFAULTS.travelRatio,
				0,
				MAX_TRAVEL_RATIO,
			),
		},
		clipEnabled: clip ?? true,
		animationsEnabled: (animated ?? true) && !prefersReducedMotion.current,
		duration:
			duration == null
				? TransitionSprings.REFERENCE_DURATION
				: duration / MILLISECONDS_PER_SECOND,
		bounce: clamp(bounce ?? TransitionSprings.DEFAULT_BOUNCE, 0, MAX_BOUNCE),
	});

	const sizeStyle = $derived(
		contentSize
			? `width: ${contentSize.width}px; height: ${contentSize.height}px;`
			: "",
	);

	$effect(() => {
		if (!host) return;

		const instance = new RollingNumberLabel(host);
		instance.onContentSizeChange = (size) => (contentSize = size);
		label = instance;

		return () => {
			instance.destroy();
			label = null;
		};
	});

	$effect(() => {
		label?.update(spec);
	});
</script>

<span
	{...rest}
	bind:this={host}
	style="display: inline-block; position: relative; {sizeStyle} {style ?? ''}"
	style:font-variant-numeric={monospacedDigits ? "tabular-nums" : undefined}
>
	<!--
		Plain copy of the value in the inherited typography, laid out like the typesetter's measuring
		element. It sizes the host and shows the value before the glyphs mount (SSR, no JS), then stays
		in flow so the host keeps a text baseline when it sits inline. Once the glyphs show, it turns
		transparent rather than hidden, so it remains the text that screen readers, find in page and
		copy see.
	-->
	<span
		style:display="block"
		style:opacity={contentSize ? "0" : null}
		style:white-space="pre"
		style:line-height="normal"
		style:direction="ltr">{text}</span
	>
</span>
