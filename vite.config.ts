import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
			},

			// Deployed to GitHub Pages as a static site. The workflow sets BASE_PATH to the repository
			// path (e.g. /svelte-rolling-number); locally the site is served from the root.
			adapter: adapter({ fallback: "404.html" }),
			paths: {
				base: (process.env.BASE_PATH ?? "") as "" | `/${string}`,
			},
		}),
	],
	test: {
		include: ["src/**/*.test.ts"],
		// Glyph layout depends on real text measurement, which simulated DOMs do not do.
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [{ browser: "chromium" }],
		},
		coverage: {
			provider: "v8",
			include: ["src/lib/**"],
		},
	},
});
