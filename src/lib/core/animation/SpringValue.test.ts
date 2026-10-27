import { describe, expect, it } from "vitest";

import { Spring } from "./Spring";
import { SpringValue } from "./SpringValue";

const spring = new Spring(0.2, 1);

describe("SpringValue", () => {
	it("moves the target without moving the value on retarget", () => {
		const value = new SpringValue(spring, 0, 0.01);
		value.retarget(5);
		expect(value.value).toBe(0);
		expect(value.target).toBe(5);
		expect(value.isSettled).toBe(false);
	});

	it("keeps velocity on retarget", () => {
		const value = new SpringValue(spring, 0, 0.01);
		value.write(0, 7);
		value.retarget(5);
		expect(value.velocity).toBe(7);
	});

	it("is not settled while velocity is above its threshold", () => {
		const value = new SpringValue(spring, 0, 0.01);
		value.write(0, 0.1);
		expect(value.isSettled).toBe(false);
		value.write(0, 0.07);
		expect(value.isSettled).toBe(true);
	});

	it("reports progress from tick until it settles exactly on target", () => {
		const value = new SpringValue(spring, 0, 0.01);
		value.retarget(1);

		let frames = 0;
		while (value.tick(1 / 60)) {
			frames++;
			expect(frames).toBeLessThan(600);
		}

		expect(frames).toBeGreaterThan(0);
		expect(value.value).toBe(1);
		expect(value.velocity).toBe(0);
	});

	it("does nothing on tick once settled", () => {
		const value = new SpringValue(spring, 2, 0.01);
		expect(value.tick(1 / 60)).toBe(false);
		expect(value.value).toBe(2);
	});

	it("follows a swapped spring", () => {
		const slow = new SpringValue(new Spring(2, 1), 0, 0.001);
		const fast = new SpringValue(new Spring(2, 1), 0, 0.001);
		fast.spring = new Spring(0.1, 1);
		slow.retarget(1);
		fast.retarget(1);
		slow.tick(0.05);
		fast.tick(0.05);
		expect(fast.value).toBeGreaterThan(slow.value);
	});
});
