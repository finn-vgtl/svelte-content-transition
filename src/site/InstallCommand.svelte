<script lang="ts">
	import CopyButton from "./CopyButton.svelte";
	import { INSTALL_COMMANDS, type PackageManager } from "./snippets";

	const managers = Object.keys(INSTALL_COMMANDS) as PackageManager[];

	let selected = $state<PackageManager>("npm");
	const command = $derived(INSTALL_COMMANDS[selected]);
</script>

<div class="install">
	<div class="tabs" role="tablist" aria-label="Package manager">
		{#each managers as manager (manager)}
			<button
				type="button"
				role="tab"
				aria-selected={selected === manager}
				class:active={selected === manager}
				onclick={() => (selected = manager)}
			>
				{manager}
			</button>
		{/each}
	</div>
	<div class="command" role="tabpanel">
		<code><span class="prompt" aria-hidden="true">$</span> {command}</code>
		<CopyButton text={command} label="Copy install command" />
	</div>
</div>

<style>
	.install {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--code-bg);
		overflow: hidden;
		width: 100%;
		max-width: 32rem;
	}

	.tabs {
		display: flex;
		border-bottom: 1px solid var(--border);
	}

	.tabs button {
		font: inherit;
		font-size: 0.8rem;
		font-family: var(--font-mono);
		padding: 0.5rem 0.9rem;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-muted);
		cursor: pointer;
	}

	.tabs button:hover {
		color: var(--text);
	}

	.tabs button.active {
		color: var(--text);
		border-bottom-color: var(--accent);
	}

	.command {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 0.75rem 0.75rem 1rem;
	}

	code {
		font-size: 0.9rem;
		overflow-x: auto;
		white-space: nowrap;
	}

	.prompt {
		color: var(--text-muted);
		user-select: none;
	}
</style>
