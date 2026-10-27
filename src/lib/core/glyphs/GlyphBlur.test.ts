import { describe, expect, it } from "vitest";

import { GlyphBlur } from "./GlyphBlur";

describe("GlyphBlur.filter", () => {
	it.each([0, 0.2, 0.374, -1, Number.NaN])(
		"returns no filter for radius %s",
		(radius) => {
			expect(GlyphBlur.filter(radius)).toBe(GlyphBlur.NO_FILTER);
		},
	);

	it("returns a CSS blur at the minimum radius", () => {
		expect(GlyphBlur.filter(0.375)).toBe(
			`blur(${GlyphBlur.sigma(0.375).toFixed(3)}px)`,
		);
	});

	it("quantises radii to an eighth of a pixel", () => {
		expect(GlyphBlur.filter(2)).toBe(GlyphBlur.filter(2.05));
		expect(GlyphBlur.filter(2)).not.toBe(GlyphBlur.filter(2.1));
		expect(GlyphBlur.filter(2.05)).toBe(
			`blur(${GlyphBlur.sigma(2).toFixed(3)}px)`,
		);
	});

	it("keeps working past the cache limit", () => {
		for (let radius = 1; radius < 200; radius += 0.125) {
			GlyphBlur.filter(radius);
		}
		expect(GlyphBlur.filter(1)).toBe(
			`blur(${GlyphBlur.sigma(1).toFixed(3)}px)`,
		);
	});
});
