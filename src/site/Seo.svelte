<script lang="ts">
	import { pageUrl, SITE_NAME, type SitePath } from "./site";

	let {
		title,
		description,
		path,
	}: { title: string; description: string; path: SitePath } = $props();

	const url = $derived(pageUrl(path));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:locale" content="en_US" />
	<meta name="twitter:card" content="summary" />
</svelte:head>
