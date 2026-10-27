import type { TypesetLine } from "../records";
import { computeSlots, splitUnits } from "./GlyphSlots";

/** Inherited properties that change how glyphs are shaped or spaced, as kebab-case CSS names. */
const TYPOGRAPHY_PROPERTIES = [
	"font-family",
	"font-size",
	"font-weight",
	"font-style",
	"font-stretch",
	"font-kerning",
	"font-optical-sizing",
	"font-synthesis",
	"font-variant-caps",
	"font-variant-east-asian",
	"font-variant-ligatures",
	"font-variant-numeric",
	"font-variant-position",
	"font-feature-settings",
	"font-variation-settings",
	"letter-spacing",
	"word-spacing",
	"text-transform",
] as const;

type GlyphFontStyle = Record<(typeof TYPOGRAPHY_PROPERTIES)[number], string>;

const FINGERPRINT_PROBE = "0123456789 Hxg";

let measureElement: HTMLSpanElement | null = null;

const acquireMeasureElement = (): HTMLSpanElement | null => {
	if (typeof document === "undefined" || !document.body) return null;
	if (measureElement?.isConnected) return measureElement;

	const element = document.createElement("span");
	element.setAttribute("aria-hidden", "true");
	Object.assign(element.style, {
		position: "fixed",
		left: "0",
		top: "0",
		margin: "0",
		padding: "0",
		border: "0",
		width: "max-content",
		visibility: "hidden",
		pointerEvents: "none",
		whiteSpace: "pre",
		lineHeight: "normal",
		direction: "ltr",
	} satisfies Partial<CSSStyleDeclaration>);
	document.body.appendChild(element);
	measureElement = element;
	return element;
};

class GlyphTypesetter {
	readonly fontStyle: GlyphFontStyle;
	private readonly styleKey: string;
	private fingerprint: string | null = null;

	/** Typesets in whatever typography `source` resolves to through the cascade. */
	static inheritingFrom(source: Element): GlyphTypesetter {
		const computed = getComputedStyle(source);
		const fontStyle = {} as GlyphFontStyle;
		for (const property of TYPOGRAPHY_PROPERTIES) {
			fontStyle[property] = computed.getPropertyValue(property);
		}
		return new GlyphTypesetter(fontStyle);
	}

	constructor(fontStyle: GlyphFontStyle) {
		this.fontStyle = fontStyle;
		this.styleKey = Object.values(fontStyle).join("|");
	}

	get key(): string {
		if (this.fingerprint === null) {
			const element = this.prepare();
			if (!element) return this.styleKey;

			element.textContent = FINGERPRINT_PROBE;
			const { width, height } = element.getBoundingClientRect();
			this.fingerprint = `${width.toFixed(3)}x${height.toFixed(3)}`;
		}

		return `${this.styleKey}|${this.fingerprint}`;
	}

	equals(other: GlyphTypesetter): boolean {
		return this === other || this.key === other.key;
	}

	typeset(
		text: string,
		decimalSeparator: string,
		leftAnchored: boolean,
	): TypesetLine {
		const units = splitUnits(text);
		const element = this.prepare();
		if (!element) return { placements: [], width: 0, height: 0 };

		if (units.length === 0) {
			element.textContent = "0";
			return {
				placements: [],
				width: 0,
				height: element.getBoundingClientRect().height,
			};
		}

		element.textContent = text;
		const bounds = element.getBoundingClientRect();
		const node = element.firstChild as Text;
		const range = document.createRange();
		const slots = computeSlots(units, decimalSeparator, leftAnchored);

		let cursor = 0;
		const placements = units.map((unit, index) => {
			range.setStart(node, unit.utf16Offset);
			range.setEnd(node, unit.utf16Offset + unit.text.length);
			const box = range.getBoundingClientRect();
			const measured = box.width > 0 || box.height > 0;
			const x = measured ? box.left - bounds.left : cursor;
			const advance = measured ? box.width : 0;
			cursor = x + advance;
			return { unit: unit.text, slot: slots[index], x, advance };
		});

		return { placements, width: bounds.width, height: bounds.height };
	}

	private prepare(): HTMLSpanElement | null {
		const element = acquireMeasureElement();
		if (element) {
			for (const property of TYPOGRAPHY_PROPERTIES) {
				element.style.setProperty(property, this.fontStyle[property]);
			}
		}
		return element;
	}
}

export type { GlyphFontStyle };
export { FINGERPRINT_PROBE, GlyphTypesetter };
