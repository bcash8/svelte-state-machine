<script lang="ts">
	import { FSMRenderer } from '$lib/FSMRenderer';
	import { NFA } from '$lib/states/NFA';
	import { onMount } from 'svelte';
	import Toolbar from '../components/Toolbar.svelte';
	import { SelectTool } from '$lib/tools/SelectTool';
	import { StateTool } from '$lib/tools/StateTool';
	import { toolIsTransitionTool, TransitionTool } from '$lib/tools/TransitionTool';
	import type { Tool, ToolName } from '$lib/tools/Tool';
	import Dialog from '../components/Dialog.svelte';
	import Slider from '../components/Slider.svelte';

	let canvas: HTMLCanvasElement;
	let renderer: FSMRenderer;
	let nfa: NFA;
	let dialogVisible = $state(false);

	const tools: Record<ToolName, Tool> = {
		Select: new SelectTool(),
		State: new StateTool(),
		Transition: new TransitionTool(onOpenDialog)
	};

	function onOpenDialog() {
		dialogVisible = true;
	}

	function onConfirm(input: string) {
		if (toolIsTransitionTool(tools.Transition)) {
			tools.Transition.onDialogConfirm(input, renderer, nfa);
		}
		dialogVisible = false;
	}

	function onCancel() {
		dialogVisible = false;
	}

	let selectedTool = $state<Tool>(tools['Select']);

	function setSelectedTool(toolName: ToolName) {
		selectedTool.onDeactivate(renderer);
		selectedTool = tools[toolName];
		selectedTool.onActivate(renderer);
	}

	function onSizeSliderChange(value: number) {
		renderer.scale = value;
		renderer.draw();
	}

	onMount(() => {
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
<Dialog visible={dialogVisible} {onConfirm} {onCancel} />
<div class="slider-container">
	<Slider onChange={onSizeSliderChange} />
</div>

<style>
	canvas {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 0;
	}
	.slider-container {
		position: absolute;
		bottom: 10px;
		right: 10px;
		width: 150px;
	}
</style>
