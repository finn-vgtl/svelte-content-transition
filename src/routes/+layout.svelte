<script lang="ts">
	import "../app.css";

	import { onNavigate } from "$app/navigation";
	import { asset, resolve } from "$app/paths";
	import { page } from "$app/state";

	import ExternalLink from "../site/ExternalLink.svelte";
	import { NPM_URL, REPOSITORY_URL } from "../site/site";

	let { children } = $props();

	const isDocs = $derived(page.route.id?.startsWith("/docs") ?? false);

	// Smooth scrolling is meant for in-page links. When the route changes, SvelteKit resets or
	// restores the scroll position itself, and that should jump instead of gliding across the page.
	onNavigate(({ from, to }) => {
		if (from?.url.pathname === to?.url.pathname) return;
		const root = document.documentElement;
		root.style.scrollBehavior = "auto";
		return () => root.style.removeProperty("scroll-behavior");
	});
</script>

<a class="skip-link" href="#content">Skip to content</a>

<header class="site-header">
	<div class="container inner">
		<a class="brand" href={resolve("/")}>
			<img src={asset("favicon.svg")} alt="" width="18" height="22" />
			<span>svelte-content-transition</span>
		</a>
		<nav aria-label="Main">
			<a href={resolve("/docs")} aria-current={isDocs ? "page" : undefined}>Docs</a>
			<a href={resolve("/#examples")}>Examples</a>
			<ExternalLink href={NPM_URL}>npm</ExternalLink>
			<ExternalLink href={REPOSITORY_URL}>GitHub</ExternalLink>
		</nav>
	</div>
</header>

<div id="content">
	{@render children()}
</div>

<footer class="site-footer">
	<div class="container inner">
		<p>
			MIT licensed. Based on
			<ExternalLink href="https://github.com/rit3zh/expo-content-transition"
				>expo-content-transition</ExternalLink
			>.
		</p>
		<nav aria-label="Footer">
			<a href={resolve("/docs")}>Docs</a>
			<ExternalLink href={NPM_URL}>npm</ExternalLink>
			<ExternalLink href={REPOSITORY_URL}>GitHub</ExternalLink>
		</nav>
	</div>
</footer>

<style>
	.skip-link {
		position: absolute;
		left: 1rem;
		top: -3rem;
		z-index: 20;
		padding: 0.5rem 0.75rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
	}

	.skip-link:focus {
		top: 0.5rem;
	}

	/*
		Fills the space between header and footer, keeping the footer at the bottom on short pages.
		As a flex column, it lets a page grow into that space too.
	*/
	#content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.site-header {
		position: sticky;
		top: 0;
		z-index: 10;
		height: var(--header-height);
		background: color-mix(in srgb, var(--bg) 85%, transparent);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border);
	}

	.inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		height: 100%;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.95rem;
		min-width: 0;
	}

	.brand span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	nav {
		display: flex;
		gap: 1.25rem;
		flex-shrink: 0;
	}

	nav :global(a) {
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.9rem;
	}

	nav :global(a:hover),
	nav a[aria-current="page"] {
		color: var(--text);
	}

	@media (max-width: 480px) {
		.brand span {
			display: none;
		}
	}

	.site-footer {
		border-top: 1px solid var(--border);
		padding: 1.5rem 0;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.site-footer .inner {
		flex-wrap: wrap;
	}

	.site-footer p {
		margin: 0;
	}

	.site-footer :global(a) {
		color: var(--text-muted);
	}
</style>
