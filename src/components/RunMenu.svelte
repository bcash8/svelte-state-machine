<script lang="ts">
	import type { Component } from 'svelte';
	import Play from 'phosphor-svelte/lib/Play';
	import Pause from 'phosphor-svelte/lib/Pause';
	import { ArrowCounterClockwise } from 'phosphor-svelte';

	let { onRun }: { onRun: () => void } = $props();
</script>

{#snippet Button(props: { name: string; icon: Component; onClick?: () => void })}
	<button class="button" title={props.name} onclick={props.onClick}>
		<props.icon />
	</button>
{/snippet}

<div class="toolbar">
	{@render Button({ name: 'Run', icon: Play, onClick: onRun })}
	{@render Button({ name: 'Pause', icon: Pause })}
	{@render Button({ name: 'Reset', icon: ArrowCounterClockwise })}
</div>

<style>
	.toolbar {
		position: absolute;
		top: 10px;
		right: 10px;
		width: fit-content;
		background-color: #0000005b;
		border-radius: 0.25rem;
		overflow: hidden;
		z-index: 1;

		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.button {
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

	.button:hover {
		opacity: 1;
	}
</style>
