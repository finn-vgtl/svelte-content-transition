import { describe, expect, it } from "vitest";

import { Spring } from "./Spring";
import { SpringValue } from "./SpringValue";

const FRAME = 1 / 60;

/** Steps the value at 60 fps and records every position it passes through. */
const simulate = (
	spring: Spring,
	from: number,
	to: number,
	seconds: number,
): number[] => {
	const value = new SpringValue(spring, from, 1e-6);
	value.retarget(to);
	const trace: number[] = [];
	for (let time = 0; time < seconds; time += FRAME) {
		spring.advance(value, FRAME);
		trace.push(value.value);
	}
	return trace;
};

describe("Spring", () => {
	it.each([
		["underdamped", 0.5],
		["critically damped", 1],
		["overdamped", 2],
	])("brings a %s value to rest at its target", (_, damping) => {
		const trace = simulate(new Spring(0.3, damping), 0, 10, 4);
		expect(trace.at(-1)).toBeCloseTo(10, 4);
	});

	it("overshoots the target when underdamped", () => {
		const trace = simulate(new Spring(0.3, 0.3), 0, 10, 2);
		expect(Math.max(...trace)).toBeGreaterThan(10);
	});

	it.each([
		["critically damped", 1],
		["overdamped", 3],
	])("never overshoots when %s", (_, damping) => {
		const trace = simulate(new Spring(0.3, damping), 0, 10, 2);
		expect(Math.max(...trace)).toBeLessThanOrEqual(10 + 1e-9);
	});

	it("settles faster with a shorter response", () => {
		const fast = simulate(new Spring(0.1, 1), 0, 1, 0.2).at(-1) ?? 0;
		const slow = simulate(new Spring(1, 1), 0, 1, 0.2).at(-1) ?? 0;
		expect(fast).toBeGreaterThan(slow);
	});

	it("does not move a value at rest on its target", () => {
		const spring = new Spring(0.3, 0.5);
		const value = new SpringValue(spring, 4, 1e-6);
		spring.advance(value, FRAME);
		expect(value.value).toBe(4);
		expect(value.velocity).toBe(0);
	});

	it("carries existing velocity forward", () => {
		const spring = new Spring(0.3, 1);
		const value = new SpringValue(spring, 0, 1e-6);
		value.write(0, 50);
		spring.advance(value, FRAME);
		expect(value.value).toBeGreaterThan(0);
	});

	it("stays finite for degenerate parameters", () => {
		for (const spring of [
			new Spring(0, 0),
			new Spring(-1, -1),
			new Spring(1, 1e6),
		]) {
			const trace = simulate(spring, 0, 1, 0.5);
			expect(trace.every(Number.isFinite)).toBe(true);
		}
	});
});
