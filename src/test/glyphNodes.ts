import { expect, vi } from "vitest";

/**
 * Helpers for reading back what RollingNumberLabel rendered. They live outside src/lib so that
 * svelte-package does not ship them.
 */

interface GlyphNode {
	window: HTMLElement;
	content: HTMLElement;
	x: number;
	y: number;
}

/** The hidden layer the label mounts inside its host. */
const glyphLayer = (host: HTMLElement): HTMLElement | null =>
	host.querySelector(":scope > div[aria-hidden='true']");

/** The glyph windows the label rendered, in reading order. The probe's clip comes first. */
const glyphNodes = (host: HTMLElement): GlyphNode[] =>
	([...(glyphLayer(host)?.children ?? [])] as HTMLElement[])
		.slice(1)
		.map((window) => {
			const [, x, y] =
				/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(
					window.style.transform,
				) ?? [];
			return {
				window,
				content: window.firstElementChild as HTMLElement,
				x: Number(x),
				y: Number(y),
			};
		})
		.sort((lhs, rhs) => lhs.x - rhs.x);

const renderedText = (host: HTMLElement): string =>
	glyphNodes(host)
		.map((node) => node.content.textContent)
		.join("");

/** Every glyph is at rest: unmoved, unscaled, sharp and fully opaque. */
const isSettled = (host: HTMLElement): boolean =>
	glyphNodes(host).every(
		(node) =>
			node.content.style.transform === "none" &&
			node.content.style.filter === "none" &&
			node.window.style.opacity === "",
	);

/** Waits until the transition has finished and only the glyphs of `text` remain. */
const waitForText = (host: HTMLElement, text: string) =>
	vi.waitFor(
		() => {
			expect(renderedText(host)).toBe(text);
			expect(isSettled(host)).toBe(true);
		},
		{ timeout: 3000 },
	);

export type { GlyphNode };
export { glyphLayer, glyphNodes, isSettled, renderedText, waitForText };
