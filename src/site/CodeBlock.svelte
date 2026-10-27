<script lang="ts">
	import CopyButton from "./CopyButton.svelte";

	let { code, title }: { code: string; title?: string } = $props();
</script>

<figure class="code-block">
	<figcaption>
		<span>{title ?? ""}</span>
		<CopyButton text={code} label="Copy code" />
	</figcaption>
	<pre><code>{code}</code></pre>
</figure>

<style>
	.code-block {
		margin: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--code-bg);
		overflow: hidden;
		min-width: 0;
	}

	figcaption {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.4rem 0.5rem 0.4rem 1rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.8rem;
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	pre {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		tab-size: 2;
		font-size: 0.85rem;
		line-height: 1.6;
	}
</style>
