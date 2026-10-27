import { beforeEach, describe, expect, it } from "vitest";

import { NumericTextAlignment, TransitionDirection } from "../enums";
import {
	createNumericTextSpec,
	type NumericTextSpec,
	slotKey,
	type TypesetLine,
} from "../records";
import { computeSlots, splitUnits } from "./GlyphSlots";
import type { GlyphState } from "./GlyphState";
import { GlyphTransitionEngine } from "./GlyphTransitionEngine";
import type { GlyphTypesetter } from "./GlyphTypesetter";

const ADVANCE = 10;
const HEIGHT = 20;

/** Lays every unit out at a fixed advance, so positions are predictable. */
const fixedWidthTypesetter = (key = "fixed"): GlyphTypesetter => {
	const typesetter = {
		key,
		equals: (other: GlyphTypesetter) => other.key === key,
		typeset: (
			text: string,
			decimalSeparator: string,
			leftAnchored: boolean,
		): TypesetLine => {
			const units = splitUnits(text);
			const slots = computeSlots(units, decimalSeparator, leftAnchored);
			return {
				placements: units.map((unit, index) => ({
					unit: unit.text,
					slot: slots[index],
					x: index * ADVANCE,
					advance: ADVANCE,
				})),
				width: units.length * ADVANCE,
				height: HEIGHT,
			};
		},
	};
	return typesetter as unknown as GlyphTypesetter;
};

const spec = (
	text: string,
	overrides: Partial<NumericTextSpec> = {},
): NumericTextSpec => ({ ...createNumericTextSpec(), text, ...overrides });

const settle = (engine: GlyphTransitionEngine): number => {
	let frames = 0;
	while (engine.tick(1 / 60)) {
		frames++;
		if (frames > 1000) throw new Error("engine never settled");
	}
	return frames;
};

/** The glyphs that remain once leaving glyphs are discounted, in reading order. */
const visibleText = (engine: GlyphTransitionEngine): string =>
	engine.glyphs
		.filter((glyph) => !glyph.disappearing)
		.sort((lhs, rhs) => lhs.x.target - rhs.x.target)
		.map((glyph) => glyph.unit)
		.join("");

const byUnit = (engine: GlyphTransitionEngine, unit: string): GlyphState[] =>
	engine.glyphs.filter((glyph) => glyph.unit === unit);

describe("GlyphTransitionEngine", () => {
	let engine: GlyphTransitionEngine;
	const typesetter = fixedWidthTypesetter();

	beforeEach(() => {
		engine = new GlyphTransitionEngine();
	});

	describe("first value", () => {
		it("shows the value immediately", () => {
			engine.apply(spec("123"), typesetter);
			expect(engine.glyphs.map((glyph) => glyph.unit)).toEqual(["1", "2", "3"]);
			expect(engine.glyphs.every((glyph) => !glyph.isAnimating)).toBe(true);
			expect(engine.glyphs.map((glyph) => glyph.x.value)).toEqual([0, 10, 20]);
			expect(engine.tick(1 / 60)).toBe(false);
		});

		it("handles empty text", () => {
			engine.apply(spec(""), typesetter);
			expect(engine.glyphs).toEqual([]);
			expect(engine.contentSize.width).toBe(0);
		});
	});

	describe("changing value", () => {
		it("keeps unchanged glyphs and replaces changed ones", () => {
			engine.apply(spec("123"), typesetter);
			const [one, two, three] = engine.glyphs;

			engine.apply(spec("124"), typesetter);
			expect(engine.glyphs).toContain(one);
			expect(engine.glyphs).toContain(two);
			expect(three.disappearing).toBe(true);
			expect(byUnit(engine, "4")).toHaveLength(1);
			expect(byUnit(engine, "4")[0].alpha.value).toBe(0);
			expect(visibleText(engine)).toBe("124");
		});

		it("only animates the changed decimal digit", () => {
			engine.apply(spec("123.45"), typesetter);
			const before = [...engine.glyphs];

			engine.apply(spec("123.46"), typesetter);
			const animating = engine.glyphs.filter((glyph) => glyph.isAnimating);
			expect(animating.map((glyph) => glyph.unit).sort()).toEqual(["5", "6"]);
			expect(
				before.slice(0, 5).every((glyph) => engine.glyphs.includes(glyph)),
			).toBe(true);
		});

		it("removes leaving glyphs once they fade out", () => {
			engine.apply(spec("123"), typesetter);
			engine.apply(spec("9"), typesetter);
			expect(engine.glyphs.length).toBeGreaterThan(1);

			settle(engine);
			expect(engine.glyphs.map((glyph) => glyph.unit)).toEqual(["9"]);
			expect(engine.glyphs[0].presence).toBe(1);
			expect(engine.contentSize.width).toBe(ADVANCE);
		});

		it("slides kept glyphs to their new positions", () => {
			engine.apply(spec("1.5"), typesetter);
			const [one] = engine.glyphs;

			engine.apply(spec("11.5"), typesetter);
			expect(one.x.value).toBe(0);
			expect(one.x.target).toBe(10);
			settle(engine);
			expect(one.x.value).toBe(10);
		});

		it("does not animate an unchanged value", () => {
			engine.apply(spec("42"), typesetter);
			const glyphs = [...engine.glyphs];
			engine.apply(spec("42"), typesetter);
			expect(engine.glyphs).toEqual(glyphs);
			expect(engine.tick(1 / 60)).toBe(false);
		});

		it("brings a leaving glyph back when the value reverts mid-transition", () => {
			engine.apply(spec("1"), typesetter);
			const [one] = engine.glyphs;

			engine.apply(spec("2"), typesetter);
			engine.tick(0.05);
			engine.tick(0.05);
			engine.tick(0.05);
			engine.apply(spec("1"), typesetter);

			expect(one.disappearing).toBe(false);
			expect(byUnit(engine, "1")).toEqual([one]);
			expect(byUnit(engine, "2")[0].disappearing).toBe(true);
			settle(engine);
			expect(engine.glyphs).toEqual([one]);
		});

		it("shares a slot's presence between the glyphs crossing in it", () => {
			engine.apply(spec("1"), typesetter);
			engine.apply(spec("2"), typesetter);
			for (let frame = 0; frame < 30; frame++) {
				engine.tick(1 / 60);
				const total = engine.glyphs.reduce(
					(sum, glyph) => sum + glyph.presence,
					0,
				);
				expect(total).toBeLessThanOrEqual(1 + 1e-9);
			}
		});

		it("slides a new glyph in from its slot's predecessor", () => {
			engine.apply(spec("1.5"), typesetter);
			engine.apply(spec("11.6"), typesetter);
			const [six] = byUnit(engine, "6");
			expect(six.x.value).toBe(20);
			expect(six.x.target).toBe(30);
		});

		it("places a glyph in a new slot directly at its target", () => {
			engine.apply(spec("1"), typesetter);
			engine.apply(spec("21"), typesetter);
			const [two] = byUnit(engine, "2");
			expect(two.x.value).toBe(0);
			expect(two.x.target).toBe(0);
		});
	});

	describe("stagger", () => {
		it("delays arriving glyphs one after another across the stagger window", () => {
			engine.apply(spec("111"), typesetter);
			engine.apply(spec("222"), typesetter);

			const delays = byUnit(engine, "2").map((glyph) => glyph.delay);
			expect(delays[0]).toBe(0);
			expect(delays[1]).toBeCloseTo(0.2 / 3);
			expect(delays[2]).toBeCloseTo(0.4 / 3);
		});

		it("delays leaving glyphs from left to right", () => {
			engine.apply(spec("111"), typesetter);
			engine.apply(spec("222"), typesetter);

			const leaving = byUnit(engine, "1").sort(
				(lhs, rhs) => lhs.x.value - rhs.x.value,
			);
			expect(leaving.map((glyph) => glyph.delay)).toEqual(
				byUnit(engine, "2").map((glyph) => glyph.delay),
			);
		});

		it("does not restart the delay of a glyph that is already moving", () => {
			engine.apply(spec("11"), typesetter);
			engine.apply(spec("22"), typesetter);
			engine.tick(0.01);
			const [first, second] = byUnit(engine, "2");
			const pending = second.delay;
			expect(pending).toBeGreaterThan(0);

			engine.apply(spec("33"), typesetter);
			expect(first.delay).toBe(0);
			expect(second.delay).toBe(pending);
		});

		it("holds a delayed glyph still until its delay runs out", () => {
			engine.apply(spec("11"), typesetter);
			engine.apply(spec("22"), typesetter);
			const late = byUnit(engine, "2")[1];
			const start = late.offset.value;

			engine.tick(0.01);
			expect(late.offset.value).toBe(start);
			expect(late.delay).toBeGreaterThan(0);

			settle(engine);
			expect(late.offset.value).toBe(0);
		});
	});

	describe("direction", () => {
		const arrivalOffset = (
			from: string,
			to: string,
			overrides = {},
		): number => {
			engine.apply(spec(from, overrides), typesetter);
			engine.apply(spec(to, overrides), typesetter);
			const arrived = engine.glyphs.find(
				(glyph) => !glyph.disappearing && glyph.alpha.value === 0,
			);
			if (!arrived) throw new Error("no arriving glyph");
			return arrived.offset.value;
		};

		it("rolls up when the number grows", () => {
			expect(arrivalOffset("1", "2")).toBe(1);
		});

		it("rolls down when the number shrinks", () => {
			expect(arrivalOffset("2", "1")).toBe(-1);
		});

		it("compares numeric values, not text", () => {
			expect(arrivalOffset("9", "10")).toBe(1);
			engine = new GlyphTransitionEngine();
			expect(arrivalOffset("-1", "-2")).toBe(-1);
		});

		it("reads values with the configured decimal separator", () => {
			expect(arrivalOffset("1,5", "1,25", { decimalSeparator: "," })).toBe(-1);
		});

		it("keeps the last direction when the text is not a number", () => {
			engine.apply(spec("2"), typesetter);
			engine.apply(spec("1"), typesetter);
			engine.apply(spec("abc"), typesetter);
			const [a] = byUnit(engine, "a");
			expect(a.offset.value).toBe(-1);
		});

		it("can be forced up", () => {
			expect(
				arrivalOffset("2", "1", { direction: TransitionDirection.Up }),
			).toBe(1);
		});

		it("can be forced down", () => {
			expect(
				arrivalOffset("1", "2", { direction: TransitionDirection.Down }),
			).toBe(-1);
		});

		it("sends leaving glyphs the opposite way", () => {
			engine.apply(spec("1"), typesetter);
			engine.apply(spec("2"), typesetter);
			expect(byUnit(engine, "1")[0].offset.target).toBe(-1);
		});
	});

	describe("anchoring", () => {
		it("anchors text without numbers at its start", () => {
			engine.apply(spec("ab"), typesetter);
			const [a, b] = engine.glyphs;
			engine.apply(spec("abc"), typesetter);
			expect(engine.glyphs.slice(0, 2)).toEqual([a, b]);
		});

		it("anchors numbers at their end", () => {
			engine.apply(spec("12"), typesetter);
			const [, two] = engine.glyphs;
			engine.apply(spec("312"), typesetter);
			expect(engine.glyphs).toContain(two);
			expect(
				byUnit(engine, "1").filter((glyph) => !glyph.disappearing),
			).toHaveLength(1);
		});

		it("anchors at the end when switching from a number to text", () => {
			engine.apply(spec("1"), typesetter);
			engine.apply(spec("ab"), typesetter);
			const slots = engine.glyphs
				.filter((glyph) => !glyph.disappearing)
				.map((glyph) => glyph.slot && slotKey(glyph.slot));
			expect(slots).toEqual(["core:-2", "core:-1"]);
		});
	});

	describe("alignment", () => {
		it.each([
			[NumericTextAlignment.Leading, [0, 10], 0],
			[NumericTextAlignment.Center, [-10, 0], 50],
			[NumericTextAlignment.Trailing, [-20, -10], 100],
		])("positions %s glyphs relative to the anchor", (alignment, xs, base) => {
			engine.apply(spec("12", { alignment }), typesetter);
			expect(engine.glyphs.map((glyph) => glyph.x.value)).toEqual(xs);
			expect(engine.anchorBase(100)).toBe(base);
		});
	});

	describe("disabled animation", () => {
		it("replaces every glyph instantly", () => {
			engine.apply(spec("12"), typesetter);
			const before = [...engine.glyphs];
			engine.apply(spec("13", { animationsEnabled: false }), typesetter);

			expect(engine.glyphs.map((glyph) => glyph.unit)).toEqual(["1", "3"]);
			expect(engine.glyphs.some((glyph) => before.includes(glyph))).toBe(false);
			expect(engine.glyphs.every((glyph) => !glyph.isAnimating)).toBe(true);
		});

		it("rebuilds when the typography changes", () => {
			engine.apply(spec("12"), typesetter);
			engine.apply(spec("13"), fixedWidthTypesetter("bold"));
			expect(engine.glyphs.map((glyph) => glyph.unit)).toEqual(["1", "3"]);
			expect(engine.glyphs.every((glyph) => !glyph.isAnimating)).toBe(true);
		});

		it("animates again after a typography change", () => {
			const bold = fixedWidthTypesetter("bold");
			engine.apply(spec("12"), typesetter);
			engine.apply(spec("13"), bold);
			engine.apply(spec("14"), bold);
			expect(engine.glyphs.some((glyph) => glyph.isAnimating)).toBe(true);
		});
	});

	describe("blur", () => {
		it("starts arriving glyphs blurred", () => {
			engine.apply(spec("1"), typesetter);
			engine.apply(spec("2"), typesetter);
			expect(engine.blurActive).toBe(true);
			expect(byUnit(engine, "2")[0].blur.value).toBeGreaterThan(0);
		});

		it.each([
			["disabled", { blurEnabled: false }],
			[
				"at zero intensity",
				{
					shape: { ...createNumericTextSpec().shape, blurIntensity: 0 },
				},
			],
		])("never blurs when %s", (_, overrides) => {
			engine.apply(spec("1", overrides), typesetter);
			engine.apply(spec("2", overrides), typesetter);
			expect(engine.blurActive).toBe(false);
			for (let frame = 0; frame < 20; frame++) {
				engine.tick(1 / 60);
				expect(engine.glyphs.every((glyph) => glyph.blur.value === 0)).toBe(
					true,
				);
			}
		});

		it("clears blur mid-transition when it is turned off", () => {
			engine.apply(spec("1"), typesetter);
			engine.apply(spec("2"), typesetter);
			engine.apply(spec("2", { blurEnabled: false }), typesetter);
			expect(engine.glyphs.every((glyph) => glyph.blur.value === 0)).toBe(true);
		});
	});

	it("moves running glyphs onto new springs when the timing changes", () => {
		engine.apply(spec("1"), typesetter);
		engine.apply(spec("2"), typesetter);
		const [two] = byUnit(engine, "2");
		const previous = two.alpha.spring;

		engine.apply(spec("2", { duration: 1 }), typesetter);
		expect(two.alpha.spring).not.toBe(previous);
	});

	it("takes longer to settle with a longer duration", () => {
		const fast = new GlyphTransitionEngine();
		fast.apply(spec("1", { duration: 0.2 }), typesetter);
		fast.apply(spec("2", { duration: 0.2 }), typesetter);

		engine.apply(spec("1", { duration: 1 }), typesetter);
		engine.apply(spec("2", { duration: 1 }), typesetter);
		expect(settle(engine)).toBeGreaterThan(settle(fast));
	});
});
