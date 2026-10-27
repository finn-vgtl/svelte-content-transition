<script lang="ts">
	import { prefersReducedMotion } from "svelte/motion";

	import { TransitionSprings } from "./core/animation/TransitionSprings";
	import { alignmentFromProp, directionFromProp } from "./core/enums";
	import { fontRevision } from "./core/fontRevision";
	import { type ContentSize, GlyphTypesetter } from "./core/glyphs";
	import { NumericTextLabel } from "./core/label/NumericTextLabel";
	import {
		type NumericTextSpec,
		TRANSITION_SHAPE_DEFAULTS,
	} from "./core/records";
	import type { NumericTextProps } from "./types";

	const DEFAULT_FONT_SIZE = 17;
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
		blur,
		blurIntensity,
		maxBlurRadius,
		clip,
		animated,
		color,
		fontFamily,
		fontSize,
		fontWeight,
		fontStyle,
		letterSpacing,
		monospacedDigits,
		style,
		...rest
	}: NumericTextProps = $props();

	let host = $state<HTMLSpanElement>();
	let label = $state.raw<NumericTextLabel | null>(null);
	let contentSize = $state.raw<ContentSize | null>(null);

	const text = $derived(typeof value === "number" ? String(value) : value);

	const typesetter = $derived.by(() => {
		// Re-measure once a web font finishes loading.
		void fontRevision.current;
		return new GlyphTypesetter({
			fontFamily,
			fontSize: fontSize ?? DEFAULT_FONT_SIZE,
			fontWeight,
			fontStyle,
			letterSpacing: letterSpacing ?? 0,
			monospacedDigits: monospacedDigits ?? false,
		});
	});

	const spec: NumericTextSpec = $derived({
		text,
		alignment: alignmentFromProp(alignment),
		direction: directionFromProp(direction),
		decimalSeparator:
			(decimalSeparator && Array.from(decimalSeparator)[0]) || ".",
		blurEnabled: blur ?? true,
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

		const instance = new NumericTextLabel(host);
		instance.onContentSizeChange = (size) => (contentSize = size);
		label = instance;

		return () => {
			instance.destroy();
			label = null;
		};
	});

	$effect(() => {
		label?.update(spec, typesetter, color ?? null);
	});
</script>

<span
	{...rest}
	bind:this={host}
	role="img"
	aria-label={text}
	style="display: inline-block; position: relative; {sizeStyle} {style ?? ''}"
></span>
