import { createSubscriber } from "svelte/reactivity";

/** Counts finished font loads, so typesetters re-measure once a web font swaps in. */
class FontRevision {
	#revision = 0;

	#subscribe = createSubscriber((update) => {
		const fonts = typeof document !== "undefined" ? document.fonts : undefined;
		if (!fonts) return;

		const bump = () => {
			this.#revision++;
			update();
		};
		fonts.addEventListener("loadingdone", bump);
		return () => fonts.removeEventListener("loadingdone", bump);
	});

	get current(): number {
		this.#subscribe();
		return this.#revision;
	}
}

const fontRevision = new FontRevision();

export { fontRevision };
