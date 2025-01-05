<script lang="ts">
	import { clickOutside } from '$lib/util/clickOutside';
	import { contextMenuState, type ContextMenuState } from '../lib/contextMenuState.svelte';

	let menu;
	let state: ContextMenuState = { visible: false, position: { x: 0, y: 0 }, options: [] };

	contextMenuState.subscribe((value) => {
		state = value;
	});

	function handleClickOutside() {
		contextMenuState.set({ ...state, visible: false });
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions-->
<div
	bind:this={menu}
	class="context-menu"
	style={`top: ${state.position.y}px; left: ${state.position.x}px; display: ${state.visible ? 'block' : 'none'}`}
	on:click|stopPropagation
	use:clickOutside
	on:outclick={handleClickOutside}
>
	{#each state.options as option}
		<div class="menu-item" on:click={option.action}>
			{option.label}
		</div>
	{/each}
</div>

<style>
	.context-menu {
		position: absolute;
		background-color: #0a0a0a;
		color: white;
		border-radius: 0.25rem;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		overflow: hidden;
	}
	.menu-item {
		padding: 8px 16px;
		cursor: pointer;
	}
	.menu-item:hover {
		background: black;
	}
</style>
