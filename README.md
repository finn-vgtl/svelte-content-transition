# svelte-content-transition

Animated per-glyph content transitions for Svelte 5.

`NumericText` renders a line of text and, whenever its value changes, animates each glyph that changed: departing glyphs roll out, scale down, blur and fade; arriving glyphs do the reverse. Unchanged glyphs slide into their new positions.

It is based on the web renderer from [expo-content-transition](https://github.com/rit3zh/expo-content-transition), with a Svelte-native API. The effect is inspired by SwiftUI's [`ContentTransition.numericText(value:)`](<https://developer.apple.com/documentation/swiftui/contenttransition/numerictext(value:)>).

**[Documentation and live examples →](https://finn-vgtl.github.io/svelte-content-transition)**

## Installation

```sh
npm install svelte-content-transition
```

Requires Svelte `^5.7.0`.

## Usage

```svelte
<script lang="ts">
	import { NumericText } from "svelte-content-transition";

	let count = $state(0);
</script>

<NumericText value={count} style="font-size: 48px" monospacedDigits />

<button onclick={() => count++}>Increment</button>
```

The first value renders without animation; every later change to `value` triggers a transition.

- **Formatting** — the component animates whatever string it receives, so format with `Intl.NumberFormat`, `toFixed` or anything else first. Glyphs are aligned around the decimal separator, so `123.45 → 123.46` only animates the final digit.
- **Typography** — there are no font props. Font, size, weight, letter spacing and colour are inherited from the surrounding CSS like any inline text.
- **Direction** — `auto` rolls up when the number grows and down when it shrinks. Pin `"up"` or `"down"` for content that isn't a number, such as a clock.
- **Accessibility** — the host has `role="img"` and an `aria-label` with the current value. Animation is disabled while `prefers-reduced-motion` is enabled.
- **SSR** — the value renders as plain text on the server and before hydration, with no layout shift.

## Props

| Prop               | Type                           | Default   | Description                                                                              |
| ------------------ | ------------------------------ | --------- | ---------------------------------------------------------------------------------------- |
| `value`            | `string \| number`             | —         | The text to display. Required.                                                           |
| `alignment`        | `"start" \| "center" \| "end"` | `"start"` | Horizontal alignment of the line inside the component's bounds.                          |
| `decimalSeparator` | `string`                       | `"."`     | Character glyphs are aligned around. Use `","` for locales that use a decimal comma.     |
| `monospacedDigits` | `boolean`                      | `false`   | Adds `font-variant-numeric: tabular-nums` so unchanged digits don't shift sideways.      |
| `direction`        | `"auto" \| "up" \| "down"`     | `"auto"`  | Which way glyphs travel.                                                                 |
| `duration`         | `number`                       | `420`     | Nominal transition duration in milliseconds. Scales every internal spring.               |
| `bounce`           | `number`                       | `0.46`    | Overshoot of the vertical roll, `0`–`0.95`.                                              |
| `enterScale`       | `number`                       | `0.4`     | Size glyphs arrive at and leave with, `0`–`2`. `1` disables scaling.                     |
| `travel`           | `number`                       | `0.333`   | How far glyphs roll, as a fraction of the line height, `0`–`3`.                          |
| `blur`             | `boolean`                      | `true`    | Blurs glyphs in proportion to their transition progress.                                 |
| `blurIntensity`    | `number`                       | `1`       | Multiplies the blur radii, `0`–`8`.                                                      |
| `maxBlurRadius`    | `number`                       | unbounded | Ceiling on the blur radius in CSS pixels. Caps the cost when many glyphs change at once. |
| `clip`             | `boolean`                      | `true`    | Clips glyphs to the line box with a feathered edge so they don't overlap nearby content. |
| `animated`         | `boolean`                      | `true`    | Set to `false` to apply values instantly.                                                |

All other attributes (`class`, `style`, `id`, `data-*`, event handlers) are forwarded to the host `<span>`. Prop types are exported as `NumericTextProps`, `NumericTextTransitionProps`, `NumericTextAlignment` and `NumericTextDirection`.

See the [documentation](https://finn-vgtl.github.io/svelte-content-transition/docs) for guides and examples.

## Development

```sh
pnpm install
pnpm dev       # docs site with live examples
pnpm test      # browser tests via Vitest and Playwright
pnpm check     # type-check
pnpm lint      # Biome
pnpm package   # build the library into dist/
```

## License

MIT. Includes code adapted from expo-content-transition. Its docs on the transition behavior largely apply here, but the component API differs, so use `NumericTextProps` for props and usage. See [LICENSE](LICENSE).
