import { describe, expect, it } from "vitest";

import { NumericTextAlignment, TransitionDirection } from "../enums";
import {
	createNumericTextSpec,
	effectiveShape,
	isBlurActive,
	isDigitUnit,
	type NumericTextSpec,
	specsEqual,
	TRANSITION_SHAPE_DEFAULTS,
} from ".";

describe("isDigitUnit", () => {
	it.each(["0", "5", "9"])("accepts %s", (unit) => {
		expect(isDigitUnit(unit)).toBe(true);
	});

	it.each(["", "a", ".", "10", "٣", "５", "-"])("rejects %s", (unit) => {
		expect(isDigitUnit(unit)).toBe(false);
	});
});

describe("createNumericTextSpec", () => {
	it("does not share the shape between specs", () => {
		const spec = createNumericTextSpec();
		spec.shape.enterScale = 2;
		expect(createNumericTextSpec().shape.enterScale).toBe(
			TRANSITION_SHAPE_DEFAULTS.enterScale,
		);
	});
});

describe("isBlurActive / effectiveShape", () => {
	const spec = (
		blurEnabled: boolean,
		blurIntensity: number,
	): NumericTextSpec => {
		const base = createNumericTextSpec();
		return { ...base, blurEnabled, shape: { ...base.shape, blurIntensity } };
	};

	it("is active when enabled with a positive intensity", () => {
		expect(isBlurActive(spec(true, 1))).toBe(true);
		expect(effectiveShape(spec(true, 2)).blurIntensity).toBe(2);
	});

	it("is inactive when disabled, whatever the intensity", () => {
		expect(isBlurActive(spec(false, 3))).toBe(false);
		expect(effectiveShape(spec(false, 3)).blurIntensity).toBe(0);
	});

	it("is inactive at zero intensity", () => {
		expect(isBlurActive(spec(true, 0))).toBe(false);
	});

	it("keeps the rest of the shape and does not mutate the spec", () => {
		const disabled = spec(false, 3);
		const shape = effectiveShape(disabled);
		expect(shape).toEqual({ ...disabled.shape, blurIntensity: 0 });
		expect(disabled.shape.blurIntensity).toBe(3);
	});
});

describe("specsEqual", () => {
	it("is true for structurally equal specs", () => {
		expect(specsEqual(createNumericTextSpec(), createNumericTextSpec())).toBe(
			true,
		);
	});

	const changes: [string, (spec: NumericTextSpec) => void][] = [
		["text", (spec) => (spec.text = "1")],
		["alignment", (spec) => (spec.alignment = NumericTextAlignment.Center)],
		["direction", (spec) => (spec.direction = TransitionDirection.Down)],
		["decimalSeparator", (spec) => (spec.decimalSeparator = ",")],
		["blurEnabled", (spec) => (spec.blurEnabled = false)],
		["clipEnabled", (spec) => (spec.clipEnabled = false)],
		["animationsEnabled", (spec) => (spec.animationsEnabled = false)],
		["duration", (spec) => (spec.duration = 1)],
		["bounce", (spec) => (spec.bounce = 0)],
		["shape.blurIntensity", (spec) => (spec.shape.blurIntensity = 2)],
		["shape.maxBlurRadius", (spec) => (spec.shape.maxBlurRadius = 4)],
		["shape.enterScale", (spec) => (spec.shape.enterScale = 1)],
		["shape.travelRatio", (spec) => (spec.shape.travelRatio = 1)],
	];

	// A field that specsEqual skips makes NumericTextLabel ignore updates to it.
	it("covers every field of the spec", () => {
		const { shape, ...rest } = createNumericTextSpec();
		const fields = [
			...Object.keys(rest),
			...Object.keys(shape).map((key) => `shape.${key}`),
		];
		expect(changes.map(([field]) => field).sort()).toEqual(fields.sort());
	});

	it.each(changes)("detects a change to %s", (_, change) => {
		const changed = createNumericTextSpec();
		change(changed);
		expect(specsEqual(createNumericTextSpec(), changed)).toBe(false);
		expect(specsEqual(changed, createNumericTextSpec())).toBe(false);
	});
});
