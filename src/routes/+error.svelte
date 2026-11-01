<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? "Page not found" : "Error"} · svelte-rolling-number</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="container error">
	<p class="status">{page.status}</p>
	<h1>{notFound ? "Page not found" : "Something went wrong"}</h1>
	<p>
		{notFound ? "There is nothing at this address." : page.error?.message}
	</p>
	<a class="button primary" href={resolve("/")}>Back to the home page</a>
</section>

<style>
	.error {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-block: 4rem;
		text-align: center;
	}

	.status {
		margin: 0;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		color: var(--accent-text);
	}

	h1 {
		margin: 0.5rem 0;
		font-size: 2rem;
		letter-spacing: -0.02em;
	}

	p {
		margin: 0 0 1.5rem;
		color: var(--text-muted);
	}
</style>
