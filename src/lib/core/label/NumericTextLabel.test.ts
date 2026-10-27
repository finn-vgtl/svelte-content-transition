import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	glyphLayer,
	glyphNodes,
	isSettled,
	renderedText,
} from "../../../test/glyphNodes";
import { NumericTextAlignment } from "../enums";
import type { ContentSize } from "../glyphs";
import { createNumericTextSpec, type NumericTextSpec } from "../records";
import { NumericTextLabel } from "./NumericTextLabel";

const waitForSettle = (host: HTMLElement) =>
	vi.waitFor(() => expect(isSettled(host)).toBe(true), { timeout: 3000 });

// Short enough that every transition settles within a few frames of polling.
const FAST = { duration: 0.05 };

const spec = (
	text: string,
	overrides: Partial<NumericTextSpec> = {},
): NumericTextSpec => ({
	...createNumericTextSpec(),
	...FAST,
	text,
	...overrides,
});

describe("NumericTextLabel", () => {
	let host: HTMLElement;
	let label: NumericTextLabel;
	let sizes: ContentSize[];

	beforeEach(() => {
		host = document.createElement("span");
		host.setAttribute(
			"style",
			"display: inline-block; position: relative; font: 20px monospace",
		);
		document.body.appendChild(host);
		label = new NumericTextLabel(host);
		sizes = [];
		label.onContentSizeChange = (size) => sizes.push(size);
	});

	afterEach(() => {
		label.destroy();
		host.remove();
	});

	it("mounts a hidden, non-interactive layer inside the host", () => {
		const root = glyphLayer(host);
		expect(root).not.toBeNull();
		expect(root?.style.position).toBe("absolute");
		expect(root?.style.pointerEvents).toBe("none");
		expect(root?.style.direction).toBe("ltr");
	});

	it("renders one node per glyph", () => {
		label.update(spec("1,234"));
		expect(glyphNodes(host)).toHaveLength(5);
		expect(renderedText(host)).toBe("1,234");
	});

	it("renders the first value settled", () => {
		label.update(spec("42"));
		expect(isSettled(host)).toBe(true);
		for (const { window } of glyphNodes(host)) {
			expect(window.style.getPropertyValue("mask-image")).toBe("none");
		}
	});

	it("reports the rounded content size", () => {
		label.update(spec("123"));
		expect(sizes).toHaveLength(1);
		const [size] = sizes;
		expect(Number.isInteger(size.width)).toBe(true);
		expect(Number.isInteger(size.height)).toBe(true);
		expect(size.width).toBeGreaterThan(0);
		expect(size.height).toBeGreaterThan(0);
	});

	it("only reports the size when it changes", () => {
		const instant = { animationsEnabled: false };
		label.update(spec("123", instant));
		label.update(spec("456", instant));
		expect(sizes).toHaveLength(1);
		label.update(spec("4567", instant));
		expect(sizes).toHaveLength(2);
		expect(sizes[1].width).toBeGreaterThan(sizes[0].width);
	});

	it("grows the reported width over several frames", async () => {
		label.update(spec("12", { duration: 0.3 }));
		label.update(spec("1234", { duration: 0.3 }));
		const [start] = sizes;
		await waitForSettle(host);
		await vi.waitFor(() =>
			expect(sizes.at(-1)?.width).toBeGreaterThan(start.width * 1.5),
		);

		const widths = sizes.map((size) => size.width);
		const end = widths[widths.length - 1];
		const between = widths.filter(
			(width) => width > start.width && width < end,
		);
		expect(between.length).toBeGreaterThan(1);
		expect(Number.isInteger(end)).toBe(true);
	});

	it("ignores an update that changes nothing", () => {
		label.update(spec("12"));
		const before = glyphNodes(host).map((node) => node.window);
		label.update(spec("12"));
		expect(glyphNodes(host).map((node) => node.window)).toEqual(before);
	});

	describe("animated change", () => {
		it("crossfades the changed glyph and settles on the new value", async () => {
			label.update(spec("12"));
			label.update(spec("13"));
			expect(glyphNodes(host)).toHaveLength(3);
			expect(isSettled(host)).toBe(false);

			await waitForSettle(host);
			await vi.waitFor(() => expect(glyphNodes(host)).toHaveLength(2));
			expect(renderedText(host)).toBe("13");
		});

		it("keeps the node of an unchanged glyph", async () => {
			label.update(spec("12"));
			const [one] = glyphNodes(host);
			label.update(spec("13"));
			await waitForSettle(host);
			expect(glyphNodes(host)[0].window).toBe(one.window);
		});

		it("clips moving glyphs with a feathered mask", async () => {
			// Slow enough that the leaving glyph is still on screen between polls.
			label.update(spec("1", { duration: 1 }));
			label.update(spec("2", { duration: 1 }));
			const maskOf = (unit: string) =>
				glyphNodes(host)
					.find((node) => node.content.textContent === unit)
					?.window.style.getPropertyValue("mask-image");
			// Transparent at both ends, so the glyph fades out at the edges of its line box.
			expect(maskOf("2")).toMatch(
				/^linear-gradient\(rgba\(0, 0, 0, 0\) .*rgba\(0, 0, 0, 0\) [\d.]+px\)$/,
			);
			// The leaving glyph only becomes displaced once it starts to move.
			await vi.waitFor(() => expect(maskOf("1")).toMatch(/^linear-gradient/));
		});

		it("blurs the arriving glyph", () => {
			label.update(spec("1"));
			label.update(spec("2"));
			const filters = glyphNodes(host).map((node) => node.content.style.filter);
			expect(filters.some((filter) => filter.startsWith("blur("))).toBe(true);
		});

		it("moves and scales the arriving glyph", () => {
			label.update(spec("1"));
			label.update(spec("2"));
			const arriving = glyphNodes(host).find(
				(node) => node.content.textContent === "2",
			);
			expect(arriving?.content.style.transform).toMatch(
				/^translate3d\(0px, [\d.]+px, 0px\) scale\(0\.4\)$/,
			);
			expect(arriving?.window.style.opacity).toBe("0");
		});

		it("follows a value that changes again mid-transition", async () => {
			label.update(spec("1", { duration: 0.3 }));
			label.update(spec("2", { duration: 0.3 }));
			await new Promise((resolve) => requestAnimationFrame(resolve));
			label.update(spec("3", { duration: 0.3 }));
			await waitForSettle(host);
			await vi.waitFor(() => expect(renderedText(host)).toBe("3"));
		});
	});

	it("applies a value instantly with animation off", () => {
		label.update(spec("12"));
		label.update(spec("13", { animationsEnabled: false }));
		expect(glyphNodes(host)).toHaveLength(2);
		expect(renderedText(host)).toBe("13");
		expect(isSettled(host)).toBe(true);
	});

	it.each([
		[NumericTextAlignment.Leading, 0],
		[NumericTextAlignment.Center, 100],
		[NumericTextAlignment.Trailing, 200],
	])("aligns a %s line inside wider bounds", async (alignment, anchor) => {
		label.update(spec("1", { alignment }));
		host.style.width = "200px";

		// The label learns its bounds from a ResizeObserver, which reports after the next layout.
		await vi.waitFor(() => {
			const [{ window, content }] = glyphNodes(host);
			const left = Number.parseFloat(content.style.left);
			const glyphLeft = window.getBoundingClientRect().left + left;
			const hostLeft = host.getBoundingClientRect().left;
			const width = Number.parseFloat(content.style.width);
			const expected =
				alignment === NumericTextAlignment.Leading
					? anchor
					: alignment === NumericTextAlignment.Center
						? anchor - width / 2
						: anchor - width;
			expect(glyphLeft - hostLeft).toBeCloseTo(expected, 0);
		});
	});

	it("centres the line vertically inside taller bounds", async () => {
		label.update(spec("1"));
		const [short] = glyphNodes(host);

		host.style.height = "200px";
		await vi.waitFor(() => {
			const [tall] = glyphNodes(host);
			expect(tall.y).toBeGreaterThan(short.y + 50);
		});
	});

	it("re-lays-out when the inherited typography changes", async () => {
		label.update(spec("123"));
		const [before] = sizes;

		host.style.fontSize = "40px";
		await vi.waitFor(() => expect(sizes).toHaveLength(2));
		expect(sizes[1].width).toBeGreaterThan(before.width * 1.5);
		expect(sizes[1].height).toBeGreaterThan(before.height * 1.5);
		expect(isSettled(host)).toBe(true);
	});

	it("removes its layer and stops reporting on destroy", async () => {
		label.update(spec("1"));
		label.update(spec("2"));
		label.destroy();

		expect(glyphLayer(host)).toBeNull();
		host.style.fontSize = "40px";
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(sizes).toHaveLength(1);
	});
});
