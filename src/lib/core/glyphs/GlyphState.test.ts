import { beforeEach, describe, expect, it } from "vitest";

import { TransitionSprings } from "../animation/TransitionSprings";
import { SlotRole } from "../enums";
import {
	type GlyphPlacement,
	TRANSITION_SHAPE_DEFAULTS,
	type TransitionShape,
	type TypesetLine,
} from "../records";
import { GlyphBlur } from "./GlyphBlur";
import { GlyphState } from "./GlyphState";

const springs = new TransitionSprings(0.42, 0.46);

const placement: GlyphPlacement = {
	unit: "7",
	slot: { role: SlotRole.Core, index: -1 },
	x: 0,
	advance: 10,
};

const line: TypesetLine = { placements: [placement], width: 10, height: 20 };

const shape = (overrides: Partial<TransitionShape> = {}): TransitionShape => ({
	...TRANSITION_SHAPE_DEFAULTS,
	...overrides,
});

const settle = (glyph: GlyphState): number => {
	let frames = 0;
	while (glyph.tick(1 / 60)) {
		frames++;
		if (frames > 1000) throw new Error("glyph never settled");
	}
	return frames;
};

describe("GlyphState", () => {
	let glyph: GlyphState;

	beforeEach(() => {
		glyph = new GlyphState(1, "7", springs);
		glyph.updateMetrics(placement, line, shape());
	});

	describe("updateMetrics", () => {
		/** The widest the exit blur gets, read back from the glyph rather than restated. */
		const exitBlur = (target: GlyphState) => {
			target.beginDisappear(false, true);
			return target.blur.target;
		};

		it("pads the clip window so the exit blur is never cut off", () => {
			// A Gaussian blur visibly reaches about three sigmas out from the glyph.
			const reach = 3 * GlyphBlur.sigma(exitBlur(glyph));
			expect(glyph.padX).toBeGreaterThanOrEqual(reach);
			expect(glyph.viewportWidth).toBeGreaterThanOrEqual(
				glyph.advance + 2 * glyph.padX,
			);
		});

		it("leaves room above and below the line for the feathered edge", () => {
			expect(glyph.feather).toBeGreaterThan(0);
			expect(glyph.padY).toBeGreaterThanOrEqual(glyph.feather);
			expect(glyph.viewportHeight).toBeGreaterThanOrEqual(
				glyph.lineHeight + 2 * glyph.padY,
			);
		});

		it("keeps some horizontal overhang without blur", () => {
			const blurred = glyph.padX;
			glyph.updateMetrics(placement, line, shape({ blurIntensity: 0 }));
			expect(glyph.padX).toBeGreaterThan(0);
			expect(glyph.padX).toBeLessThan(blurred);
		});

		it("caps the blur and its padding at maxBlurRadius", () => {
			const uncapped = glyph.padX;
			glyph.updateMetrics(placement, line, shape({ maxBlurRadius: 2 }));
			expect(exitBlur(glyph)).toBe(2);
			expect(glyph.padX).toBeLessThan(uncapped);
		});

		it("scales travel with the travel ratio", () => {
			glyph.updateMetrics(placement, line, shape({ travelRatio: 1 }));
			expect(glyph.travel).toBe(20);
		});

		it("keeps the viewport at least one pixel", () => {
			const empty: TypesetLine = { placements: [], width: 0, height: 0 };
			glyph.updateMetrics({ ...placement, advance: 0 }, empty, shape());
			expect(glyph.viewportWidth).toBe(1);
			expect(glyph.viewportHeight).toBe(1);
		});
	});

	describe("beginAppear", () => {
		it("starts below and shrunk when counting up", () => {
			glyph.beginAppear(false, true);
			expect(glyph.offset.value).toBe(1);
			expect(glyph.offset.target).toBe(0);
			expect(glyph.scale.value).toBe(TRANSITION_SHAPE_DEFAULTS.enterScale);
			expect(glyph.alpha.value).toBe(0);
			expect(glyph.blur.value).toBeGreaterThan(0);
			expect(glyph.blur.target).toBe(0);
			expect(glyph.disappearing).toBe(false);
			expect(glyph.isDisplaced).toBe(true);
			expect(glyph.isAnimating).toBe(true);
		});

		it("starts above when counting down", () => {
			glyph.beginAppear(true, true);
			expect(glyph.offset.value).toBe(-1);
		});

		it("starts sharp without blur", () => {
			glyph.beginAppear(false, false);
			expect(glyph.blur.value).toBe(0);
		});

		it("uses the configured enter scale", () => {
			glyph.updateMetrics(placement, line, shape({ enterScale: 1.5 }));
			glyph.beginAppear(false, true);
			expect(glyph.scale.value).toBe(1.5);
		});

		it("settles fully visible", () => {
			glyph.beginAppear(false, true);
			settle(glyph);
			expect(glyph.offset.value).toBe(0);
			expect(glyph.scale.value).toBe(1);
			expect(glyph.alpha.value).toBe(1);
			expect(glyph.blur.value).toBe(0);
			expect(glyph.isDisplaced).toBe(false);
			expect(glyph.isAnimating).toBe(false);
		});
	});

	describe("beginDisappear", () => {
		it("leaves upwards when counting up", () => {
			glyph.beginDisappear(false, true);
			expect(glyph.offset.target).toBe(-1);
			expect(glyph.scale.target).toBe(TRANSITION_SHAPE_DEFAULTS.enterScale);
			expect(glyph.alpha.target).toBe(0);
			expect(glyph.blur.target).toBeGreaterThan(0);
			expect(glyph.disappearing).toBe(true);
		});

		it("leaves downwards when counting down", () => {
			glyph.beginDisappear(true, true);
			expect(glyph.offset.target).toBe(1);
		});

		it("does not blur without blur", () => {
			glyph.beginDisappear(false, false);
			expect(glyph.blur.target).toBe(0);
		});

		it("stays visible until its opacity reaches zero", () => {
			glyph.beginDisappear(false, true);
			expect(glyph.isVisible).toBe(true);
			settle(glyph);
			expect(glyph.alpha.value).toBe(0);
			expect(glyph.isVisible).toBe(false);
		});
	});

	it("turns back to visible mid-exit", () => {
		glyph.beginDisappear(false, true);
		glyph.tick(0.05);
		glyph.returnToVisible();
		expect(glyph.disappearing).toBe(false);
		expect(glyph.alpha.target).toBe(1);
		settle(glyph);
		expect(glyph.alpha.value).toBe(1);
		expect(glyph.offset.value).toBe(0);
	});

	it("snaps to visible immediately", () => {
		glyph.beginDisappear(false, true);
		glyph.delay = 0.1;
		glyph.tick(0.05);
		glyph.snapToVisible();
		expect(glyph.alpha.value).toBe(1);
		expect(glyph.blur.value).toBe(0);
		expect(glyph.delay).toBe(0);
		expect(glyph.disappearing).toBe(false);
		expect(glyph.isAnimating).toBe(false);
	});

	it("is animating while delayed", () => {
		glyph.delay = 0.1;
		expect(glyph.isAnimating).toBe(true);
	});

	it("is animating while only moving sideways", () => {
		glyph.x.retarget(30);
		expect(glyph.isDisplaced).toBe(false);
		expect(glyph.isAnimating).toBe(true);
		settle(glyph);
		expect(glyph.x.value).toBe(30);
	});

	describe("adoptSprings", () => {
		const slower = new TransitionSprings(2, 0);

		it("swaps every channel to the new springs", () => {
			glyph.adoptSprings(slower);
			expect(glyph.x.spring).toBe(slower.position);
			expect(glyph.offset.spring).toBe(slower.offset);
			expect(glyph.scale.spring).toBe(slower.glyphScale);
			expect(glyph.alpha.spring).toBe(slower.opacity);
			expect(glyph.blur.spring).toBe(slower.blurIn);
		});

		it("keeps the exit blur spring while disappearing", () => {
			glyph.beginDisappear(false, true);
			glyph.adoptSprings(slower);
			expect(glyph.blur.spring).toBe(slower.blurOut);
		});
	});
});
