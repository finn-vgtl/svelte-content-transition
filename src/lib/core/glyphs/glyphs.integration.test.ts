import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createRollingNumberSpec, type RollingNumberSpec } from "../records";
import { GlyphTransitionEngine } from "./GlyphTransitionEngine";
import { GlyphTypesetter } from "./GlyphTypesetter";

/** The engine driven by real text measurement instead of a fixed-width stand-in. */
describe("GlyphTransitionEngine with GlyphTypesetter", () => {
	let host: HTMLElement;
	let engine: GlyphTransitionEngine;

	const typesetter = (style = "font: 24px monospace") => {
		host.setAttribute("style", style);
		return GlyphTypesetter.inheritingFrom(host);
	};

	const spec = (text: string, overrides: Partial<RollingNumberSpec> = {}) => ({
		...createRollingNumberSpec(),
		text,
		...overrides,
	});

	const settle = () => {
		let frames = 0;
		while (engine.tick(1 / 60)) {
			if (++frames > 1000) throw new Error("engine never settled");
		}
	};

	beforeEach(() => {
		host = document.createElement("span");
		document.body.appendChild(host);
		engine = new GlyphTransitionEngine();
	});

	afterEach(() => {
		host.remove();
	});

	it("sizes the content to the measured line", () => {
		const measured = typesetter();
		engine.apply(spec("1,234.56"), measured);
		const line = measured.typeset("1,234.56", ".", false);
		expect(engine.contentSize).toEqual({
			width: line.width,
			height: line.height,
		});
		expect(engine.glyphs.map((glyph) => glyph.x.value)).toEqual(
			line.placements.map((placement) => placement.x),
		);
	});

	it("animates between two measured values and settles on the new layout", () => {
		const measured = typesetter();
		engine.apply(spec("9.99"), measured);
		engine.apply(spec("10.00"), measured);
		expect(engine.glyphs.some((glyph) => glyph.disappearing)).toBe(true);

		settle();
		const line = measured.typeset("10.00", ".", false);
		expect(engine.glyphs.map((glyph) => glyph.unit)).toEqual(
			expect.arrayContaining(["1", "0", ".", "0", "0"]),
		);
		expect(engine.glyphs).toHaveLength(5);
		expect(
			engine.glyphs.map((glyph) => glyph.x.value).sort((a, b) => a - b),
		).toEqual(line.placements.map((placement) => placement.x));
	});

	it("rebuilds without animation when the font size changes", () => {
		engine.apply(spec("12"), typesetter("font: 24px monospace"));
		const before = engine.contentSize;

		engine.apply(spec("13"), typesetter("font: 48px monospace"));
		expect(engine.glyphs.every((glyph) => !glyph.isAnimating)).toBe(true);
		expect(engine.contentSize.width).toBeGreaterThan(before.width * 1.5);
	});

	it("keeps unchanged glyphs in place with proportional figures", () => {
		const measured = typesetter("font: 24px serif");
		engine.apply(spec("1.11"), measured);
		const [one] = engine.glyphs;

		engine.apply(spec("8.11"), measured);
		settle();
		const reusedPoint = engine.glyphs.find((glyph) => glyph.unit === ".");
		expect(reusedPoint).toBeDefined();
		expect(engine.glyphs).not.toContain(one);
		const line = measured.typeset("8.11", ".", false);
		expect(reusedPoint?.x.value).toBeCloseTo(line.placements[1].x, 5);
	});
});
