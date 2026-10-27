import type { HTMLAttributes } from "svelte/elements";

type NumericTextAlignment = "start" | "center" | "end";
type NumericTextDirection = "auto" | "up" | "down";

interface NumericTextTransitionProps {
	/**
	 * Which way glyphs travel.
	 *
	 * `auto` compares the old and new numeric values and rolls up when the number grows, down when
	 * it shrinks. Force a direction for content that does not read as a number — a clock, a status
	 * label — or for a countdown that should always tick one way.
	 *
	 * @default 'auto'
	 */
	direction?: NumericTextDirection;
	/**
	 * Nominal transition duration in milliseconds. Scales every internal spring, so the character of
	 * the motion is preserved.
	 *
	 * @default 420
	 */
	duration?: number;
	/**
	 * How far the vertical roll overshoots before settling, from `0` to `0.95`. `0` arrives dead
	 * straight. Only the roll bounces — a wobbling opacity or position would just look broken.
	 *
	 * @default 0.46
	 */
	bounce?: number;
	/**
	 * Size a glyph starts at when arriving, and shrinks to when leaving. `1` disables the scale
	 * entirely and leaves a pure roll.
	 *
	 * @default 0.4
	 */
	enterScale?: number;
	/**
	 * How far a glyph rolls, as a fraction of the line height. Larger values read as a faster-moving
	 * ticker; `0` removes the vertical movement and leaves a scale and fade.
	 *
	 * @default 0.333
	 */
	travel?: number;
	/**
	 * Blurs each glyph in proportion to how far through its own transition it is.
	 *
	 * @default true
	 */
	blur?: boolean;
	/**
	 * Scales the blur. The radii are derived from the line height — a glyph leaving blurs harder
	 * than one arriving — and this multiplies both. `0` is equivalent to `blur={false}`.
	 *
	 * Clamped to `0`–`8`. Pair a high intensity with `maxBlurRadius` when many glyphs change at
	 * once, since blur is the costly part of the transition.
	 *
	 * @default 1
	 */
	blurIntensity?: number;
	/**
	 * Ceiling on the blur radius, in CSS pixels. Lets `blurIntensity` be pushed for small text
	 * without large text turning to soup, and caps what a single transition can cost.
	 *
	 * @default unbounded
	 */
	maxBlurRadius?: number;
	/**
	 * Clips each glyph to its own viewport, derived from the measured line box, so a glyph rolling
	 * in or out is cut off at the edge of the line instead of overlapping whatever sits above or
	 * below. The edge is feathered rather than cut, so blurred glyphs never end on a hard line.
	 *
	 * @default true
	 */
	clip?: boolean;
	/**
	 * Set to `false` to apply values instantly. The first value is never animated either way, so a
	 * freshly mounted component shows its content immediately. Also treated as `false` while the
	 * user has `prefers-reduced-motion` enabled.
	 *
	 * @default true
	 */
	animated?: boolean;
}

interface NumericTextProps
	extends NumericTextTransitionProps,
		Omit<HTMLAttributes<HTMLSpanElement>, "children" | "color"> {
	/** The text to display. Measuring, diffing and animating all happen per glyph. */
	value: string | number;
	/**
	 * Horizontal alignment of the line inside the component's bounds.
	 *
	 * @default 'start'
	 */
	alignment?: NumericTextAlignment;
	/**
	 * The character separating the whole and fractional parts. Characters are aligned around it, so
	 * `123.45 → 123.46` only animates the final digit.
	 *
	 * @default '.'
	 */
	decimalSeparator?: string;
	/**
	 * Renders digits at a uniform width by adding `font-variant-numeric: tabular-nums`. Stops
	 * unchanged digits from shifting sideways when a neighbour changes, at the cost of the font's
	 * natural figure spacing. Leave it unset to inherit `font-variant-numeric` from the context.
	 *
	 * Everything else about the typography — font, size, weight, letter spacing, colour — is
	 * inherited from the surrounding CSS, like any other inline text.
	 *
	 * @default false
	 */
	monospacedDigits?: boolean;
}

export type {
	NumericTextAlignment,
	NumericTextDirection,
	NumericTextProps,
	NumericTextTransitionProps,
};
