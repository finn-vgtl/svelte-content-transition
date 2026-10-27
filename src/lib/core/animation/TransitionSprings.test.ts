import { describe, expect, it } from "vitest";

import { TransitionSprings } from "./TransitionSprings";

describe("TransitionSprings", () => {
	it("scales linearly with duration", () => {
		const springs = new TransitionSprings(
			TransitionSprings.REFERENCE_DURATION * 2,
			0,
		);
		expect(springs.scale).toBeCloseTo(2);
	});

	it.each([
		[0, 0.1],
		[-5, 0.1],
		[1000, 10],
	])("clamps the scale for duration %s to %s", (duration, scale) => {
		expect(new TransitionSprings(duration, 0).scale).toBe(scale);
	});

	it.each([
		[-1, 0],
		[0.5, 0.5],
		[2, 0.95],
	])("clamps bounce %s to %s", (bounce, clamped) => {
		expect(new TransitionSprings(0.42, bounce).bounce).toBe(clamped);
	});

	it("scales the stagger window with duration", () => {
		const reference = new TransitionSprings(0.42, 0);
		const doubled = new TransitionSprings(0.84, 0);
		expect(reference.staggerWindow).toBeCloseTo(0.2);
		expect(doubled.staggerWindow).toBeCloseTo(0.4);
	});

	it("compares equal by scale and bounce", () => {
		const springs = new TransitionSprings(0.42, 0.3);
		expect(springs.equals(new TransitionSprings(0.42, 0.3))).toBe(true);
		expect(springs.equals(new TransitionSprings(0.5, 0.3))).toBe(false);
		expect(springs.equals(new TransitionSprings(0.42, 0.4))).toBe(false);
	});
});
