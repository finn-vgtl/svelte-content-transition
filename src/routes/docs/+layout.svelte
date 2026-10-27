<script lang="ts">
	import { page } from "$app/state";

	import { DOC_SECTIONS } from "./sections";

	let { children } = $props();

	let active = $state("");
	let menuOpen = $state(false);

	const activeTitle = $derived(
		DOC_SECTIONS.flatMap((group) => group.items).find(
			(item) => item.id === active,
		)?.title ?? "On this page",
	);

	$effect(() => {
		void page.url.pathname;

		const headings = DOC_SECTIONS.flatMap((group) => group.items)
			.map((item) => document.getElementById(item.id))
			.filter((element): element is HTMLElement => element !== null);

		const visible = new Set<string>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) visible.add(entry.target.id);
					else visible.delete(entry.target.id);
				}
				const first = headings.find((heading) => visible.has(heading.id));
				if (first) active = first.id;
			},
			{ rootMargin: "-64px 0px -60% 0px" },
		);

		for (const heading of headings) observer.observe(heading);
		return () => observer.disconnect();
	});
</script>

<div class="container docs">
	<aside class="sidebar">
		<button
			type="button"
			class="menu-toggle"
			aria-expanded={menuOpen}
			aria-controls="docs-nav"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span>{activeTitle}</span>
			<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
				<path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" />
			</svg>
		</button>
		<nav id="docs-nav" aria-label="Documentation" class:open={menuOpen}>
			{#each DOC_SECTIONS as group (group.title)}
				<p class="group-title">{group.title}</p>
				<ul>
					{#each group.items as item (item.id)}
						<li>
							<a
								href="#{item.id}"
								aria-current={active === item.id ? "location" : undefined}
								onclick={() => (menuOpen = false)}>{item.title}</a
							>
						</li>
					{/each}
				</ul>
			{/each}
		</nav>
	</aside>

	<article class="content">
		{@render children()}
	</article>
</div>

<style>
	.docs {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.sidebar {
		position: sticky;
		top: var(--header-height);
		z-index: 5;
		margin: 0 -1rem;
		padding: 0 1rem;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
	}

	.menu-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.75rem 0;
		font: inherit;
		font-size: 0.9rem;
		font-weight: 500;
		background: none;
		border: none;
		color: var(--text);
		cursor: pointer;
	}

	.menu-toggle[aria-expanded="true"] svg {
		transform: rotate(180deg);
	}

	nav {
		display: none;
		padding-bottom: 1rem;
		max-height: calc(100dvh - var(--header-height) - 3rem);
		overflow-y: auto;
	}

	nav.open {
		display: block;
	}

	@media (min-width: 900px) {
		.docs {
			grid-template-columns: 14rem minmax(0, 1fr);
			gap: 3rem;
		}

		.sidebar {
			align-self: start;
			margin: 0;
			padding: 2.5rem 0 2rem;
			border-bottom: none;
			background: none;
		}

		.menu-toggle {
			display: none;
		}

		nav {
			display: block;
			max-height: calc(100dvh - var(--header-height) - 4.5rem);
			padding-bottom: 0;
		}
	}

	.group-title {
		margin: 1.25rem 0 0.4rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.group-title:first-child {
		margin-top: 0;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	nav a {
		display: block;
		padding: 0.3rem 0.75rem;
		border-left: 2px solid var(--border);
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.9rem;
	}

	nav a:hover {
		color: var(--text);
	}

	nav a[aria-current="location"] {
		color: var(--text);
		border-left-color: var(--accent);
		font-weight: 500;
	}

	.content {
		min-width: 0;
		padding: 2.5rem 0 4rem;
		max-width: 46rem;
	}
</style>
