# svelte-rolling-number

Rolling number and text animation for Svelte 5, like SwiftUI's `.contentTransition(.numericText())`.

`RollingNumber` renders a line of text and, whenever its value changes, animates each glyph that changed: departing glyphs roll out, scale down, blur and fade; arriving glyphs do the reverse. Unchanged glyphs slide into their new positions.

The effect is inspired by SwiftUI's [`ContentTransition.numericText(value:)`](<https://developer.apple.com/documentation/swiftui/contenttransition/numerictext(value:)>), brought to the web. The implementation is based on the web renderer from [expo-content-transition](https://github.com/rit3zh/expo-content-transition), with a Svelte-native API.

**[Documentation and live examples →](https://finn-vgtl.github.io/svelte-rolling-number)**

## Installation

Install the [package from npm](https://www.npmjs.com/package/svelte-rolling-number):

```sh
npm install svelte-rolling-number
```

Requires Svelte `^5.7.0`.

## Usage

```svelte
<script lang="ts">
	import { RollingNumber } from "svelte-rolling-number";

	let count = $state(0);
</script>

<RollingNumber value={count} style="font-size: 48px" monospacedDigits />

<button onclick={() => count++}>Increment</button>
```

The first value renders without animation; every later change to `value` triggers a transition.

- **Formatting** — the component animates whatever string it receives, so format with `Intl.NumberFormat`, `toFixed` or anything else first. Glyphs are aligned around the decimal separator, so `123.45 → 123.46` only animates the final digit.
- **Text** — any string works, not just numbers. Plain text is matched from the start, so `Saving… → Saved` only rolls the ending, and an emoji rolls as one glyph. Matching is by position, so adding or removing glyphs before the end rolls everything after them.
- **Typography** — there are no font props. Font, size, weight, letter spacing and colour are inherited from the surrounding CSS like any inline text.
- **Direction** — `auto` rolls up when the number grows and down when it shrinks. Pin `"up"` or `"down"` for content that isn't a number, such as a clock.
- **Accessibility** — the current value is real text in the host, hidden visually behind the glyphs, so screen readers read it in line with the surrounding content, and find in page and copy work. Animation is disabled while `prefers-reduced-motion` is enabled.
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
| `blurIntensity`    | `number`                       | `1`       | Blurs glyphs in proportion to their transition progress, `0`–`8`. `0` turns blur off.    |
| `maxBlurRadius`    | `number`                       | unbounded | Ceiling on the blur radius in CSS pixels. Caps the cost when many glyphs change at once. |
| `clip`             | `boolean`                      | `true`    | Clips glyphs to the line box with a feathered edge so they don't overlap nearby content. |
| `animated`         | `boolean`                      | `true`    | Set to `false` to apply values instantly.                                                |

All other attributes (`class`, `style`, `id`, `data-*`, event handlers) are forwarded to the host `<span>`. Prop types are exported as `RollingNumberProps`, `RollingNumberTransitionProps`, `RollingNumberAlignment` and `RollingNumberDirection`.

See the [documentation](https://finn-vgtl.github.io/svelte-rolling-number/docs) for guides and examples.

## Development

```sh
pnpm install
pnpm dev       # docs site with live examples
pnpm test      # browser tests via Vitest and Playwright
pnpm check     # type-check
pnpm lint      # Biome
pnpm package   # build the library into dist/
pnpm check:svelte-floor # check dist/ against the lowest supported Svelte
pnpm changelog # draft the next version's changelog entries
```

See [CHANGELOG.md](CHANGELOG.md) for what changed in each release, including migration notes for breaking changes.

## License

MIT. Includes code adapted from expo-content-transition. Its docs on the transition behavior largely apply here, but the component API differs, so use `RollingNumberProps` for props and usage. See [LICENSE](LICENSE).
