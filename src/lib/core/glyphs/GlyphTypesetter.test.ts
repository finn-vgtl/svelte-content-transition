import { afterEach, describe, expect, it } from "vitest";

import { slotKey } from "../records";
import { GlyphTypesetter } from "./GlyphTypesetter";

const hosts: HTMLElement[] = [];

/** An element in the document with the given inline typography. */
const styled = (style: string): HTMLElement => {
	const element = document.createElement("span");
	element.setAttribute("style", style);
	document.body.appendChild(element);
	hosts.push(element);
	return element;
};

const typesetterFor = (style: string): GlyphTypesetter =>
	GlyphTypesetter.inheritingFrom(styled(style));

afterEach(() => {
	for (const host of hosts.splice(0)) host.remove();
});

describe("GlyphTypesetter", () => {
	describe("inheritingFrom", () => {
		it("reads the computed typography of the source", () => {
			const typesetter = typesetterFor(
				"font: italic 700 24px monospace; letter-spacing: 2px; text-transform: uppercase",
			);
			expect(typesetter.fontStyle["font-size"]).toBe("24px");
			expect(typesetter.fontStyle["font-weight"]).toBe("700");
			expect(typesetter.fontStyle["font-style"]).toBe("italic");
			expect(typesetter.fontStyle["letter-spacing"]).toBe("2px");
			expect(typesetter.fontStyle["text-transform"]).toBe("uppercase");
		});

		it("inherits typography through the cascade", () => {
			const parent = styled(
				"font-size: 31px; font-variant-numeric: tabular-nums",
			);
			const child = document.createElement("span");
			parent.appendChild(child);

			const typesetter = GlyphTypesetter.inheritingFrom(child);
			expect(typesetter.fontStyle["font-size"]).toBe("31px");
			expect(typesetter.fontStyle["font-variant-numeric"]).toBe("tabular-nums");
		});
	});

	describe("equals", () => {
		it("is equal for the same typography", () => {
			const style = "font: 20px monospace";
			expect(typesetterFor(style).equals(typesetterFor(style))).toBe(true);
		});

		it.each([
			"font: 21px monospace",
			"font: bold 20px monospace",
			"font: 20px serif",
			"font: 20px monospace; letter-spacing: 1px",
		])("differs from 20px monospace for %s", (style) => {
			expect(
				typesetterFor("font: 20px monospace").equals(typesetterFor(style)),
			).toBe(false);
		});

		it("keys on the rendered probe size", () => {
			const typesetter = typesetterFor("font: 20px monospace");
			expect(typesetter.key).toMatch(/\|\d+\.\d{3}x\d+\.\d{3}$/);
		});
	});

	describe("typeset", () => {
		const monospace = () => typesetterFor("font: 20px monospace");

		it("measures an empty line as one line tall and zero wide", () => {
			const line = monospace().typeset("", ".", false);
			expect(line.placements).toEqual([]);
			expect(line.width).toBe(0);
			expect(line.height).toBeGreaterThan(0);
		});

		it("places every unit left to right", () => {
			const line = monospace().typeset("1234", ".", false);
			expect(line.placements.map((placement) => placement.unit)).toEqual([
				"1",
				"2",
				"3",
				"4",
			]);
			const xs = line.placements.map((placement) => placement.x);
			expect(xs[0]).toBe(0);
			for (let index = 1; index < xs.length; index++) {
				expect(xs[index]).toBeGreaterThan(xs[index - 1]);
			}
		});

		it("measures glyph advances that add up to the line width", () => {
			const line = monospace().typeset("12.50", ".", false);
			const total = line.placements.reduce(
				(sum, placement) => sum + placement.advance,
				0,
			);
			// Chromium snaps each range to 1/64 px layout units, so the sum drifts by a fraction of a pixel.
			expect(Math.abs(total - line.width)).toBeLessThan(0.5);
		});

		it("includes letter spacing in the advances", () => {
			const plain = typesetterFor("font: 20px monospace").typeset(
				"11",
				".",
				false,
			);
			const spaced = typesetterFor(
				"font: 20px monospace; letter-spacing: 10px",
			).typeset("11", ".", false);
			expect(spaced.placements[1].x - plain.placements[1].x).toBeCloseTo(10, 0);
		});

		it("assigns slots around the decimal separator", () => {
			const line = monospace().typeset("$1,5", ",", false);
			expect(
				line.placements.map((placement) => slotKey(placement.slot)),
			).toEqual(["prefix:0", "core:-1", "core:0", "core:1"]);
		});

		it("anchors text at its start when asked", () => {
			const line = monospace().typeset("ab", ".", true);
			expect(
				line.placements.map((placement) => slotKey(placement.slot)),
			).toEqual(["core:0", "core:1"]);
		});

		it("places a grapheme cluster as a single unit", () => {
			const line = monospace().typeset("👍🏽1", ".", false);
			expect(line.placements.map((placement) => placement.unit)).toEqual([
				"👍🏽",
				"1",
			]);
			expect(line.placements[1].x).toBeGreaterThan(0);
		});

		it("keeps spaces in the layout", () => {
			const line = monospace().typeset("1 2", ".", false);
			expect(line.placements[1].unit).toBe(" ");
			expect(line.placements[1].advance).toBeGreaterThan(0);
		});
	});

	it("shares one hidden measuring element", () => {
		typesetterFor("font: 20px monospace").typeset("1", ".", false);
		typesetterFor("font: 30px serif").typeset("2", ".", false);
		const measuring = [...document.body.children].filter(
			(child) =>
				child.getAttribute("aria-hidden") === "true" &&
				child.tagName === "SPAN",
		);
		expect(measuring).toHaveLength(1);
		expect((measuring[0] as HTMLElement).style.visibility).toBe("hidden");
	});
});
