import { describe, expect, it } from "vitest";

import { RollingNumberAlignment, TransitionDirection } from "../enums";
import {
	createRollingNumberSpec,
	isBlurActive,
	isDigitUnit,
	type RollingNumberSpec,
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

describe("createRollingNumberSpec", () => {
	it("does not share the shape between specs", () => {
		const spec = createRollingNumberSpec();
		spec.shape.enterScale = 2;
		expect(createRollingNumberSpec().shape.enterScale).toBe(
			TRANSITION_SHAPE_DEFAULTS.enterScale,
		);
	});
});

describe("isBlurActive", () => {
	const spec = (blurIntensity: number): RollingNumberSpec => {
		const base = createRollingNumberSpec();
		return { ...base, shape: { ...base.shape, blurIntensity } };
	};

	it("is active with a positive intensity", () => {
		expect(isBlurActive(spec(1))).toBe(true);
	});

	it("is inactive at zero intensity", () => {
		expect(isBlurActive(spec(0))).toBe(false);
	});
});

describe("specsEqual", () => {
	it("is true for structurally equal specs", () => {
		expect(
			specsEqual(createRollingNumberSpec(), createRollingNumberSpec()),
		).toBe(true);
	});

	const changes: [string, (spec: RollingNumberSpec) => void][] = [
		["text", (spec) => (spec.text = "1")],
		["alignment", (spec) => (spec.alignment = RollingNumberAlignment.Center)],
		["direction", (spec) => (spec.direction = TransitionDirection.Down)],
		["decimalSeparator", (spec) => (spec.decimalSeparator = ",")],
		["clipEnabled", (spec) => (spec.clipEnabled = false)],
		["animationsEnabled", (spec) => (spec.animationsEnabled = false)],
		["duration", (spec) => (spec.duration = 1)],
		["bounce", (spec) => (spec.bounce = 0)],
		["shape.blurIntensity", (spec) => (spec.shape.blurIntensity = 2)],
		["shape.maxBlurRadius", (spec) => (spec.shape.maxBlurRadius = 4)],
		["shape.enterScale", (spec) => (spec.shape.enterScale = 1)],
		["shape.travelRatio", (spec) => (spec.shape.travelRatio = 1)],
	];

	// A field that specsEqual skips makes RollingNumberLabel ignore updates to it.
	it("covers every field of the spec", () => {
		const { shape, ...rest } = createRollingNumberSpec();
		const fields = [
			...Object.keys(rest),
			...Object.keys(shape).map((key) => `shape.${key}`),
		];
		expect(changes.map(([field]) => field).sort()).toEqual(fields.sort());
	});

	it.each(changes)("detects a change to %s", (_, change) => {
		const changed = createRollingNumberSpec();
		change(changed);
		expect(specsEqual(createRollingNumberSpec(), changed)).toBe(false);
		expect(specsEqual(changed, createRollingNumberSpec())).toBe(false);
	});
});
