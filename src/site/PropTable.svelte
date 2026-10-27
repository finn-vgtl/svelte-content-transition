<script lang="ts" module>
	interface PropRow {
		name: string;
		type: string;
		default?: string;
		/** Text between backticks renders as inline code. */
		description: string;
	}

	export type { PropRow };
</script>

<script lang="ts">
	let { rows }: { rows: PropRow[] } = $props();

	const segments = (text: string) => text.split("`");
</script>

{#snippet inline(text: string)}
	{#each segments(text) as segment, index (index)}
		{#if index % 2 === 1}<code>{segment}</code>{:else}{segment}{/if}
	{/each}
{/snippet}

<div class="props">
	{#each rows as row (row.name)}
		<div class="prop">
			<div class="signature">
				<code class="name">{row.name}</code>
				<code class="type">{row.type}</code>
			</div>
			<p>{@render inline(row.description)}</p>
			{#if row.default}
				<p class="default">Default: <code>{row.default}</code></p>
			{/if}
		</div>
	{/each}
</div>

<style>
	.props {
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.prop {
		padding: 1rem 1.25rem;
	}

	.prop + .prop {
		border-top: 1px solid var(--border);
	}

	.signature {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}

	.signature code {
		border: none;
		background: none;
		padding: 0;
	}

	.name {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.type {
		font-size: 0.8rem;
		color: var(--accent-text);
		overflow-wrap: anywhere;
	}

	p {
		margin: 0;
		font-size: 0.925rem;
		color: var(--text-muted);
	}

	.default {
		margin-top: 0.4rem;
		font-size: 0.85rem;
	}
</style>
