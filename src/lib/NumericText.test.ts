import { afterEach, describe, expect, it, vi } from "vitest";
import { cdp } from "vitest/browser";
import { render } from "vitest-browser-svelte";

import {
	glyphLayer,
	glyphNodes,
	isSettled,
	renderedText,
	waitForText,
} from "../test/glyphNodes";
import NumericText from "./NumericText.svelte";
import type { NumericTextProps } from "./types";

// Short enough that every transition settles within a few frames of polling.
const FAST = { duration: 50 };

const mount = async (props: NumericTextProps) => {
	const screen = await render(NumericText, { props: { ...FAST, ...props } });
	const host = screen.container.firstElementChild as HTMLElement | null;
	if (!host) throw new Error("NumericText rendered no host");
	// The glyph layer is attached by an effect after the first render.
	await vi.waitFor(() => expect(glyphLayer(host)).not.toBeNull());
	return { ...screen, host };
};

/** The plain-text copy of the value that sizes the host and carries its accessible text. */
const fallbackOf = (host: HTMLElement): HTMLElement =>
	host.querySelector(":scope > span") as HTMLElement;

describe("NumericText", () => {
	describe("accessibility", () => {
		it("exposes the value as plain text, not an image", async () => {
			const { host } = await mount({ value: "1,234" });
			expect(host.hasAttribute("role")).toBe(false);
			expect(host.hasAttribute("aria-label")).toBe(false);
			expect(fallbackOf(host).textContent).toBe("1,234");
			expect(fallbackOf(host).hasAttribute("aria-hidden")).toBe(false);
		});

		it("writes a number value in its string form", async () => {
			const { host } = await mount({ value: 12.5 });
			expect(fallbackOf(host).textContent).toBe("12.5");
			expect(renderedText(host)).toBe("12.5");
		});

		it("hides the glyphs from assistive technology", async () => {
			const { host } = await mount({ value: 7 });
			expect(glyphLayer(host)?.getAttribute("aria-hidden")).toBe("true");
		});

		it("keeps the fallback text accessible once the glyphs show", async () => {
			const { host } = await mount({ value: 7 });
			const fallback = fallbackOf(host);
			await vi.waitFor(() => expect(fallback.style.opacity).toBe("0"));
			expect(getComputedStyle(fallback).visibility).toBe("visible");
		});

		it("updates the text with the value", async () => {
			const { host, rerender } = await mount({ value: 1 });
			await rerender({ value: 2 });
			expect(fallbackOf(host).textContent).toBe("2");
		});

		it("accepts a role, such as status for announced updates", async () => {
			const { host } = await mount({ value: 1, role: "status" });
			expect(host.getAttribute("role")).toBe("status");
		});

		it("copies the value once, without the glyphs", async () => {
			const { host } = await mount({ value: "42" });
			await waitForText(host, "42");
			getSelection()?.selectAllChildren(host);
			expect(getSelection()?.toString()).toBe("42");
		});
	});

	describe("rendering", () => {
		it("shows the first value without animating", async () => {
			const { host } = await mount({ value: "42" });
			expect(renderedText(host)).toBe("42");
			expect(isSettled(host)).toBe(true);
		});

		it("makes the fallback text transparent once the glyphs are measured", async () => {
			const { host } = await mount({ value: "42" });
			const fallback = fallbackOf(host);
			expect(fallback.textContent).toBe("42");
			await vi.waitFor(() => expect(fallback.style.opacity).toBe("0"));
		});

		it("sizes the host to the measured content", async () => {
			const { host } = await mount({
				value: "123",
				style: "font: 20px monospace",
			});
			await vi.waitFor(() => {
				expect(host.style.width).toMatch(/^\d+px$/);
				expect(host.style.height).toMatch(/^\d+px$/);
			});
			const fallback = fallbackOf(host).getBoundingClientRect();
			expect(Number.parseFloat(host.style.width)).toBeCloseTo(
				fallback.width,
				-1,
			);
		});

		it("renders an empty value", async () => {
			const { host } = await mount({ value: "" });
			expect(glyphNodes(host)).toEqual([]);
			expect(fallbackOf(host).textContent).toBe("");
		});

		it("keeps the visible text left to right in right-to-left content", async () => {
			const { host } = await mount({ value: "12", dir: "rtl" });
			const [one, two] = glyphNodes(host);
			expect(one.content.textContent).toBe("1");
			expect(two.content.textContent).toBe("2");
		});
	});

	describe("value changes", () => {
		it("animates to a new value", async () => {
			const { host, rerender } = await mount({ value: 100 });
			await rerender({ value: 101 });
			expect(isSettled(host)).toBe(false);
			await waitForText(host, "101");
		});

		it("follows rapid changes to the last value", async () => {
			const { host, rerender } = await mount({ value: 1 });
			for (let value = 2; value <= 6; value++) await rerender({ value });
			await waitForText(host, "6");
		});

		it("applies changes instantly with animated off", async () => {
			const { host, rerender } = await mount({ value: 100, animated: false });
			await rerender({ value: 205 });
			expect(renderedText(host)).toBe("205");
			expect(isSettled(host)).toBe(true);
		});

		it("can switch animation on later", async () => {
			const { host, rerender } = await mount({ value: 1, animated: false });
			await rerender({ value: 2, animated: true });
			expect(isSettled(host)).toBe(false);
			await waitForText(host, "2");
		});

		it("aligns digits around the decimal separator", async () => {
			const { host, rerender } = await mount({
				value: "1,5",
				decimalSeparator: ",",
			});
			await rerender({ value: "1,55" });
			// Only the new hundredths digit arrives; nothing leaves.
			expect(glyphNodes(host)).toHaveLength(4);
			await waitForText(host, "1,55");
		});

		it("realigns everything without the matching separator", async () => {
			const { host, rerender } = await mount({ value: "1,5" });
			await rerender({ value: "1,55" });
			expect(glyphNodes(host).length).toBeGreaterThan(4);
			await waitForText(host, "1,55");
		});

		it("uses only the first character of a longer separator", async () => {
			const { host, rerender } = await mount({
				value: "1,5",
				decimalSeparator: ",x",
			});
			await rerender({ value: "1,55" });
			expect(glyphNodes(host)).toHaveLength(4);
		});

		it("does not blur with blur off", async () => {
			const { host, rerender } = await mount({ value: 1, blur: false });
			await rerender({ value: 2 });
			for (const { content } of glyphNodes(host)) {
				expect(content.style.filter).toBe("none");
			}
		});

		it("does not blur at zero intensity", async () => {
			const { host, rerender } = await mount({ value: 1, blurIntensity: 0 });
			await rerender({ value: 2 });
			for (const { content } of glyphNodes(host)) {
				expect(content.style.filter).toBe("none");
			}
		});

		it("caps the blur at maxBlurRadius", async () => {
			const { host, rerender } = await mount({
				value: 1,
				style: "font-size: 80px",
				blurIntensity: 8,
				maxBlurRadius: 1,
			});
			await rerender({ value: 2 });
			const filters = glyphNodes(host).map((node) => node.content.style.filter);
			for (const filter of filters) {
				const radius = Number(/blur\(([\d.]+)px\)/.exec(filter)?.[1] ?? 0);
				// sigma(1px) = 1 * 0.57735 + 0.5
				expect(radius).toBeLessThanOrEqual(1.078);
			}
		});

		it("does not clip with clip off", async () => {
			const { host, rerender } = await mount({ value: 1, clip: false });
			await rerender({ value: 2 });
			for (const { window } of glyphNodes(host)) {
				expect(window.style.getPropertyValue("mask-image")).toBe("none");
			}
		});

		it("starts arriving glyphs at the configured enter scale", async () => {
			const { host, rerender } = await mount({ value: 1, enterScale: 0.7 });
			await rerender({ value: 2 });
			const arriving = glyphNodes(host).find(
				(node) => node.content.textContent === "2",
			);
			expect(arriving?.content.style.transform).toMatch(/scale\(0\.7\)$/);
		});

		it.each([
			["up", 2, 1, ""],
			["down", 1, 2, "-"],
		] as const)(
			"can force the direction %s",
			async (direction, from, to, sign) => {
				const { host, rerender } = await mount({
					value: from,
					direction,
					travel: 1,
				});
				await rerender({ value: to });
				const arriving = glyphNodes(host).find(
					(node) => node.content.textContent === String(to),
				);
				expect(arriving?.content.style.transform).toMatch(
					new RegExp(`^translate3d\\(0px, ${sign}\\d`),
				);
			},
		);
	});

	describe("attributes", () => {
		it("forwards HTML attributes to the host", async () => {
			const { host } = await mount({
				value: 1,
				id: "score",
				class: "score",
				title: "Score",
				"data-testid": "score",
			});
			expect(host.id).toBe("score");
			expect(host.className).toContain("score");
			expect(host.title).toBe("Score");
			expect(host.dataset.testid).toBe("score");
		});

		it("appends a custom style to its own", async () => {
			const { host } = await mount({
				value: 1,
				style: "vertical-align: middle; color: red",
			});
			expect(host.style.verticalAlign).toBe("middle");
			expect(host.style.color).toBe("red");
			expect(host.style.position).toBe("relative");
			expect(host.style.display).toBe("inline-block");
		});

		it("adds tabular figures with monospacedDigits", async () => {
			const { host, rerender } = await mount({
				value: 1,
				monospacedDigits: true,
			});
			expect(host.style.fontVariantNumeric).toBe("tabular-nums");
			await rerender({ monospacedDigits: false });
			expect(host.style.fontVariantNumeric).toBe("");
		});
	});

	describe("typography", () => {
		it("inherits the font size from its context", async () => {
			const small = await mount({ value: "88", style: "font-size: 16px" });
			const large = await mount({ value: "88", style: "font-size: 48px" });
			await vi.waitFor(() =>
				expect(Number.parseFloat(large.host.style.width)).toBeGreaterThan(
					Number.parseFloat(small.host.style.width) * 2.5,
				),
			);
		});

		it("re-lays-out when the inherited font changes", async () => {
			const { host, container } = await mount({ value: "88" });
			container.style.fontSize = "16px";
			await vi.waitFor(() => expect(host.style.width).not.toBe(""));
			const before = Number.parseFloat(host.style.width);

			container.style.fontSize = "48px";
			await vi.waitFor(() =>
				expect(Number.parseFloat(host.style.width)).toBeGreaterThan(
					before * 2.5,
				),
			);
			expect(isSettled(host)).toBe(true);
		});
	});

	describe("prefers-reduced-motion", () => {
		const emulate = (value: "reduce" | "no-preference") =>
			cdp().send("Emulation.setEmulatedMedia", {
				features: [{ name: "prefers-reduced-motion", value }],
			});

		afterEach(async () => {
			await emulate("no-preference");
		});

		it("applies changes instantly while reduced motion is preferred", async () => {
			await emulate("reduce");
			await vi.waitFor(() =>
				expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(
					true,
				),
			);

			const { host, rerender } = await mount({ value: 1 });
			await rerender({ value: 2 });
			expect(renderedText(host)).toBe("2");
			expect(isSettled(host)).toBe(true);
		});
	});

	it("removes its glyphs on unmount", async () => {
		const { host, rerender, unmount } = await mount({ value: 1 });
		await rerender({ value: 2 });
		await unmount();
		expect(host.isConnected).toBe(false);
		expect(glyphLayer(host)).toBeNull();
	});
});
