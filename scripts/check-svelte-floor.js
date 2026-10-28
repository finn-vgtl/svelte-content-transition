// Checks the library against the lowest Svelte version in its peer range.
//
// svelte-package ships components as source, so every consumer compiles them with their own Svelte.
// This installs the floor of the peer range into a temporary directory, compiles each component in
// dist/ with it, and checks that every name the package imports from svelte exists there.
// Run `pnpm package` first.

import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
const dist = join(root, "dist");

const range = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
	.peerDependencies.svelte;
const floor = /^\^(\d+\.\d+\.\d+)$/.exec(range)?.[1];
if (!floor) {
	throw new Error(
		`Expected a peer range like ^5.7.0 for svelte, found ${range}`,
	);
}

if (!existsSync(dist)) {
	throw new Error("dist/ doesn't exist; run `pnpm package` first");
}
// The files the package ships; tests are excluded through `files` in package.json.
const sources = readdirSync(dist, { recursive: true })
	.filter(
		(file) =>
			/\.(svelte|js|d\.ts)$/.test(file) && !/\.(test|spec)\./.test(file),
	)
	.map((file) => ({
		file: relative(root, join(dist, file)),
		code: readFileSync(join(dist, file), "utf8"),
	}));

const prefix = mkdtempSync(join(tmpdir(), "svelte-floor-"));
const errors = [];

try {
	execFileSync(
		"npm",
		[
			"install",
			"--prefix",
			prefix,
			"--no-save",
			"--no-package-lock",
			"--ignore-scripts",
			`svelte@${floor}`,
		],
		{ stdio: "ignore" },
	);
	const require = createRequire(join(prefix, "noop.js"));
	const svelteRoot = dirname(require.resolve("svelte/package.json"));
	const pkg = JSON.parse(
		readFileSync(join(svelteRoot, "package.json"), "utf8"),
	);
	// The CommonJS build bundles the compiler's dependencies as released. The ESM build resolves them
	// from a fresh install, and a newer esrap breaks TypeScript in Svelte before 5.14.3.
	const { compile } = require("svelte/compiler");

	for (const { file, code } of sources.filter(({ file }) =>
		file.endsWith(".svelte"),
	)) {
		for (const generate of ["client", "server"]) {
			try {
				compile(code, { filename: file, generate });
			} catch (error) {
				errors.push(`${file} (${generate}): ${error.message}`);
			}
		}
	}

	for (const { file, code } of sources) {
		for (const statement of code.matchAll(
			/import\s+([^;]*?)\s+from\s+["'](svelte(?:\/[\w-]+)?)["']/g,
		)) {
			const [, clause, specifier] = statement;
			const named = /^(?:type\s+)?\{([^}]*)\}$/.exec(clause.trim());
			if (!named) {
				errors.push(
					`${file}: can't check "import ${clause} from '${specifier}'", use named imports`,
				);
				continue;
			}
			const exported = exportsOf(svelteRoot, pkg, specifier);
			if (!exported) {
				errors.push(`${file}: '${specifier}' doesn't exist in svelte@${floor}`);
				continue;
			}
			for (const name of named[1].split(",")) {
				const imported = name
					.replace(/^\s*type\s+/, "")
					.split(/\s+as\s+/)[0]
					.trim();
				if (imported && !exported.has(imported)) {
					errors.push(
						`${file}: '${specifier}' has no export '${imported}' in svelte@${floor}`,
					);
				}
			}
		}
	}
} finally {
	rmSync(prefix, { recursive: true, force: true });
}

if (errors.length > 0) {
	console.error(
		`Not compatible with svelte@${floor}, the floor of the peer range ${range}:`,
	);
	for (const error of errors) console.error(`- ${error}`);
	console.error(
		"Avoid the newer API, or raise the floor of the svelte peer range.",
	);
	process.exit(1);
}
console.log(
	`Compatible with svelte@${floor}, the floor of the peer range ${range}.`,
);

/** The names a svelte entry point exports, read from its type declarations. */
function exportsOf(svelteRoot, pkg, specifier) {
	const entry = pkg.exports[specifier.replace(/^svelte/, ".")];
	if (!entry?.types) return undefined;
	let declarations = readFileSync(join(svelteRoot, entry.types), "utf8");
	// Bundled declarations hold one `declare module` block per entry point.
	const start = declarations.indexOf(`declare module '${specifier}' {`);
	if (start !== -1) {
		const end = declarations.indexOf("\n}\n", start);
		declarations = declarations.slice(start, end === -1 ? undefined : end);
	}
	const names = new Set();
	for (const [, name] of declarations.matchAll(
		/export\s+(?:declare\s+)?(?:abstract\s+)?(?:function|const|let|var|class|interface|type|enum|namespace)\s+([\w$]+)/g,
	)) {
		names.add(name);
	}
	for (const [, list] of declarations.matchAll(
		/export\s+(?:type\s+)?\{([^}]*)\}/g,
	)) {
		for (const item of list.split(",")) {
			const name = item
				.trim()
				.split(/\s+as\s+/)
				.at(-1);
			if (name) names.add(name);
		}
	}
	return names;
}
