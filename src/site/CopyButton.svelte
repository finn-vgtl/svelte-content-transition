<script lang="ts">
	let { text, label = "Copy" }: { text: string; label?: string } = $props();

	let copied = $state(false);
	let timeout: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timeout);
		timeout = setTimeout(() => (copied = false), 1500);
	}

	$effect(() => () => clearTimeout(timeout));
</script>

<button type="button" class="copy" onclick={copy} aria-label={label}>
	{copied ? "Copied" : "Copy"}
</button>
<span class="visually-hidden" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

<style>
	.copy {
		font: inherit;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.6rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-muted);
		cursor: pointer;
		min-width: 4.25rem;
	}

	.copy:hover {
		color: var(--text);
		border-color: var(--border-strong);
	}
</style>
