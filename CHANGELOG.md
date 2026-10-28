# Changelog

All notable changes to `svelte-content-transition` are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While the major version is `0`, a breaking change bumps the minor version.

## [Unreleased]

## [0.4.0] - 2026-10-28

### Breaking changes

- The `blur` prop is removed. Replace `blur={false}` with `blurIntensity={0}`, and drop `blur={true}`, since blur is on by default.

## [0.3.0] - 2026-10-27

### Breaking changes

- The value is now real text inside the host instead of an image label. The host no longer has `role="img"` and `aria-label`, so tests or styles that select it by those (e.g. `getByRole("img")`) need to query the text instead.

### Added

- `role` is passed through to the host, so `role="status"` announces value changes to screen readers.

### Changed

- Screen readers read the value in line with the surrounding content, and find in page, translation and copy see it.

## [0.2.1] - 2026-10-27

### Fixed

- The value is laid out again once a web font finishes loading. Before, it could keep the metrics of the fallback font.
- The host's width follows the glyphs when the value changes length, so a centred value no longer jumps sideways mid-transition.

## [0.2.0] - 2026-10-27

### Breaking changes

- Typography is inherited from CSS. The `fontSize`, `fontWeight`, `fontStyle`, `fontFamily`, `letterSpacing` and `color` props are removed, along with the `NumericTextTypographyProps`, `NumericTextFontStyle` and `NumericTextFontWeight` types. Style the component or its parent instead, e.g. replace `fontSize={48} color="tomato"` with `style="font-size: 48px; color: tomato"`. `monospacedDigits` remains.

### Added

- The value is laid out again when inherited typography changes or a web font finishes loading.

### Fixed

- The value renders as text during SSR and before hydration.

## [0.1.0] - 2026-10-27

### Added

- `NumericText`, a Svelte 5 port of the web renderer from [expo-content-transition](https://github.com/rit3zh/expo-content-transition): per-glyph, spring-animated transitions for changing numbers and text.

[Unreleased]: https://github.com/finn-vgtl/svelte-content-transition/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/finn-vgtl/svelte-content-transition/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/finn-vgtl/svelte-content-transition/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/finn-vgtl/svelte-content-transition/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/finn-vgtl/svelte-content-transition/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/finn-vgtl/svelte-content-transition/releases/tag/v0.1.0
