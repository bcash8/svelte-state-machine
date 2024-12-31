<script lang="ts">
	import { FSMRenderer } from '$lib/FSMRenderer';
	import { NFA } from '$lib/states/NFA';
	import { onMount } from 'svelte';
	import Toolbar from '../components/Toolbar.svelte';
	import { SelectTool } from '$lib/tools/SelectTool';
	import { StateTool } from '$lib/tools/StateTool';
	import { TransitionTool } from '$lib/tools/TransitionTool';
	import type { Tool, ToolName } from '$lib/tools/Tool';

	let canvas: HTMLCanvasElement;
	let renderer: FSMRenderer;
	let nfa: NFA;

	const tools: Record<ToolName, Tool> = {
		Select: new SelectTool(),
		State: new StateTool(),
		Transition: new TransitionTool()
	};

	let selectedTool = $state<Tool>(tools['Select']);

	function setSelectedTool(toolName: ToolName) {
		selectedTool.onDeactivate(renderer);
		selectedTool = tools[toolName];
		selectedTool.onActivate(renderer);
	}

	onMount(() => {
		console.log('mount');
		if (!canvas) {
			console.error('Missing Canvas');
			return;
		}
		nfa = new NFA();
		renderer = new FSMRenderer(canvas, nfa);
		renderer.resizeCanvas();

		window.addEventListener('resize', renderer.resizeCanvas);
		const mouseDownHandler = (event: MouseEvent) => selectedTool.onMouseDown(event, renderer, nfa);
		const mouseMoveHandler = (event: MouseEvent) => selectedTool.onMouseMove(event, renderer, nfa);
		const mouseUpHandler = (event: MouseEvent) => selectedTool.onMouseUp(event, renderer, nfa);
		canvas.addEventListener('mousedown', mouseDownHandler);
		canvas.addEventListener('mousemove', mouseMoveHandler);
		canvas.addEventListener('mouseup', mouseUpHandler);

		return () => {
			window.removeEventListener('resize', renderer.resizeCanvas);
			canvas.removeEventListener('mousedown', mouseDownHandler);
			canvas.removeEventListener('mousemove', mouseMoveHandler);
			canvas.removeEventListener('mouseup', mouseUpHandler);
		};
	});
</script>

<Toolbar {selectedTool} {setSelectedTool} />
<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 0;
	}
</style>
