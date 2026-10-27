import { describe, expect, it } from "vitest";
import { type GlyphSlot, slotKey } from "../records";
import {
	computeSlots,
	containsNumber,
	numericValue,
	splitUnits,
} from "./GlyphSlots";

const keys = (slots: GlyphSlot[]): string[] => slots.map(slotKey);

const slotsFor = (
	text: string,
	decimalSeparator = ".",
	leftAnchored = false,
): string[] =>
	keys(computeSlots(splitUnits(text), decimalSeparator, leftAnchored));

describe("splitUnits", () => {
	it("returns nothing for empty text", () => {
		expect(splitUnits("")).toEqual([]);
	});

	it("splits plain text into characters with offsets", () => {
		expect(splitUnits("1.5")).toEqual([
			{ text: "1", utf16Offset: 0 },
			{ text: ".", utf16Offset: 1 },
			{ text: "5", utf16Offset: 2 },
		]);
	});

	it("keeps grapheme clusters together and tracks UTF-16 offsets", () => {
		const units = splitUnits("👍🏽1é€");
		expect(units.map((unit) => unit.text)).toEqual(["👍🏽", "1", "é", "€"]);
		expect(units.map((unit) => unit.utf16Offset)).toEqual([0, 4, 5, 7]);
	});
});

describe("containsNumber", () => {
	it.each(["1", "abc 2", "½", "٣", "Ⅻ"])("finds a number in %s", (text) => {
		expect(containsNumber(text)).toBe(true);
	});

	it.each(["", "abc", "€ ,.-"])("finds no number in %s", (text) => {
		expect(containsNumber(text)).toBe(false);
	});
});

describe("computeSlots", () => {
	it("indexes text without digits from the start when left-anchored", () => {
		expect(slotsFor("abc", ".", true)).toEqual(["core:0", "core:1", "core:2"]);
	});

	it("indexes text without digits from the end otherwise", () => {
		expect(slotsFor("abc", ".", false)).toEqual([
			"core:-3",
			"core:-2",
			"core:-1",
		]);
	});

	it("anchors an integer at its last digit", () => {
		expect(slotsFor("123")).toEqual(["core:-3", "core:-2", "core:-1"]);
	});

	it("keeps the ones digit in the same slot as a number grows", () => {
		expect(slotsFor("99").at(-1)).toBe(slotsFor("100").at(-1));
	});

	it("anchors a decimal at its separator", () => {
		expect(slotsFor("12.34")).toEqual([
			"core:-2",
			"core:-1",
			"core:0",
			"core:1",
			"core:2",
		]);
	});

	it("aligns fractional digits across different integer widths", () => {
		const short = slotsFor("9.50");
		const long = slotsFor("10.50");
		expect(long.slice(-3)).toEqual(short.slice(-3));
	});

	it("uses the given decimal separator", () => {
		expect(slotsFor("1,5", ",")).toEqual(["core:-1", "core:0", "core:1"]);
		expect(slotsFor("1,5", ".")).toEqual(["core:-3", "core:-2", "core:-1"]);
	});

	it("anchors on the last separator between digits", () => {
		expect(slotsFor("1.000.5")).toEqual([
			"core:-5",
			"core:-4",
			"core:-3",
			"core:-2",
			"core:-1",
			"core:0",
			"core:1",
		]);
	});

	it("ignores a separator outside the digits", () => {
		expect(slotsFor("12.")).toEqual(["core:-2", "core:-1", "suffix:0"]);
	});

	it("splits prefix and suffix around the digits", () => {
		expect(slotsFor("$ 1.5 USD")).toEqual([
			"prefix:0",
			"prefix:1",
			"core:-1",
			"core:0",
			"core:1",
			"suffix:3",
			"suffix:2",
			"suffix:1",
			"suffix:0",
		]);
	});

	it("only treats ASCII digits as the numeric core", () => {
		expect(slotsFor("٣4")).toEqual(["prefix:0", "core:-1"]);
	});

	it("produces unique slots", () => {
		for (const text of ["$1,234.56", "1.000.5", "abc", "12:30:45"]) {
			const slots = slotsFor(text);
			expect(new Set(slots).size).toBe(slots.length);
		}
	});
});

describe("numericValue", () => {
	it.each([
		["123", ".", 123],
		["12.5", ".", 12.5],
		["1,234.56", ".", 1234.56],
		["1.234,56", ",", 1234.56],
		["$ 99.99 USD", ".", 99.99],
		["-5", ".", -5],
		["−5", ".", -5],
		["- 5", ".", -5],
		["12:30", ".", 1230],
		["1.2.3", ".", 1.23],
		["007", ".", 7],
	])("reads %s with separator %s as %s", (text, separator, value) => {
		expect(numericValue(text, separator)).toBe(value);
	});

	it("ignores a separator before the first digit", () => {
		expect(numericValue(".5", ".")).toBe(5);
	});

	it("ignores a minus after the first digit", () => {
		expect(numericValue("5-3", ".")).toBe(53);
	});

	it.each(["", "abc", "-", "."])(
		"returns null without digits in %s",
		(text) => {
			expect(numericValue(text, ".")).toBeNull();
		},
	);
});
