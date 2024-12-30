<script lang="ts">
	import HandPointing from 'phosphor-svelte/lib/HandPointing';
	import Circle from 'phosphor-svelte/lib/Circle';
	import type { Component } from 'svelte';

	let selectedTool = $state<string | null>('Select');
</script>

{#snippet Tool(props: { label: string; value: string; icon: Component })}
	<button
		class="tool {selectedTool === props.value ? 'selected' : ''}"
		onclick={() => (selectedTool = props.value)}
	>
		<props.icon />
	</button>
{/snippet}

<div class="toolbar">
	{@render Tool({ label: 'Select', value: 'Select', icon: HandPointing })}
	{@render Tool({ label: 'State', value: 'State', icon: Circle })}
</div>

<style>
	.toolbar {
		position: absolute;
		top: 10px;
		left: 10px;
		width: 300px;
		background-color: #0000005b;
		border-radius: 0.25rem;
		overflow: hidden;
		z-index: 1;

		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.tool {
		display: flex;
		justify-content: center;
		align-items: center;
		width: fit-content;
		padding: 0.5rem;
		aspect-ratio: 1 / 1;
		background-color: #00000000;
		cursor: pointer;
	}

	.tool.selected {
		background-color: var(--primary-color);
	}
</style>
