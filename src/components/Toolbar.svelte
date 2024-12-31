<script lang="ts">
	import HandPointing from 'phosphor-svelte/lib/HandPointing';
	import Circle from 'phosphor-svelte/lib/Circle';
	import ArrowArcRight from 'phosphor-svelte/lib/ArrowArcRight';
	import type { Component } from 'svelte';
	import type { Tool, ToolName } from '$lib/tools/Tool';
	let {
		selectedTool,
		setSelectedTool
	}: { selectedTool: Tool; setSelectedTool: (toolName: ToolName) => void } = $props();
</script>

{#snippet Tool(props: { name: ToolName; icon: Component })}
	<button
		class="tool {selectedTool.name === props.name ? 'selected' : ''}"
		onclick={() => setSelectedTool(props.name)}
		title={props.name}
	>
		<props.icon />
	</button>
{/snippet}

<div class="toolbar">
	{@render Tool({ name: 'Select', icon: HandPointing })}
	{@render Tool({ name: 'State', icon: Circle })}
	{@render Tool({ name: 'Transition', icon: ArrowArcRight })}
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
		opacity: 0.7;
		transition: 0.2s ease-in-out;
	}

	.tool:hover {
		opacity: 1;
	}

	.tool.selected {
		opacity: 1;
		background-color: var(--primary-color);
	}
</style>
