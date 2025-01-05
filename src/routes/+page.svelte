<script lang="ts">
	import { FSMRenderer } from '$lib/FSMRenderer.svelte';
	import { NFA } from '$lib/states/NFA';
	import { onMount } from 'svelte';
	import Toolbar from '../components/Toolbar.svelte';
	import { SelectTool } from '$lib/tools/SelectTool';
	import { StateTool } from '$lib/tools/StateTool';
	import { toolIsTransitionTool, TransitionTool } from '$lib/tools/TransitionTool';
	import type { Tool, ToolName } from '$lib/tools/Tool';
	import Dialog from '../components/Dialog.svelte';
	import Slider from '../components/Slider.svelte';
	import RunMenu from '../components/RunMenu.svelte';
	import { DeleteTool } from '$lib/tools/DeleteTool';
	import { createToolFactory } from '$lib/tools/toolFactory';
	import { ToolManager } from '$lib/tools/ToolManager.svelte';
	import InputList from '../components/InputList.svelte';
	import ContextMenu from '../components/ContextMenu.svelte';

	let canvas: HTMLCanvasElement;
	let renderer: FSMRenderer | undefined = $state();
	let toolManager: ToolManager | undefined = $state();
	let nfa: NFA;
	let dialogVisible = $state(false);
	let inputsToTest = $state<string[]>([]);

	function onRun() {
		const input = inputsToTest[0];
		if (input) {
			const success = nfa.run(Array.from(input));
			console.log(success);
		}
	}

	function setInputsToTest(inputs: string[]) {
		inputsToTest = inputs;
	}

	function onOpenDialog() {
		dialogVisible = true;
	}

	function onConfirm(input: string) {
		if (renderer && toolManager?.currentTool && toolIsTransitionTool(toolManager.currentTool)) {
			toolManager.currentTool.onDialogConfirm(input, renderer, nfa);
		}
		dialogVisible = false;
	}

	function onCancel() {
		dialogVisible = false;
	}

	function onSizeSliderChange(value: number) {
		if (!renderer) return;
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

		const toolFactory = createToolFactory({ onOpenDialog });
		toolManager = new ToolManager(toolFactory, renderer, nfa);

		window.addEventListener('resize', renderer.resizeCanvas);
		const mouseDownHandler = (event: MouseEvent) => toolManager?.handleMouseDown(event);
		const mouseMoveHandler = (event: MouseEvent) => toolManager?.handleMouseMove(event);
		const mouseUpHandler = (event: MouseEvent) => toolManager?.handleMouseUp(event);
		const onContextMenuHandler = (event: MouseEvent) => toolManager?.handleContextMenu(event);
		canvas.addEventListener('mousedown', mouseDownHandler);
		canvas.addEventListener('mousemove', mouseMoveHandler);
		canvas.addEventListener('mouseup', mouseUpHandler);
		canvas.addEventListener('contextmenu', onContextMenuHandler);

		return () => {
			if (renderer) window.removeEventListener('resize', renderer.resizeCanvas);
			canvas.removeEventListener('mousedown', mouseDownHandler);
			canvas.removeEventListener('mousemove', mouseMoveHandler);
			canvas.removeEventListener('mouseup', mouseUpHandler);
		};
	});
</script>

<Toolbar
	selectedTool={toolManager?.currentTool}
	setSelectedTool={(toolName: ToolName) => toolManager?.setCurrentTool(toolName)}
/>
<RunMenu {onRun} />
<InputList {inputsToTest} {setInputsToTest} />
<canvas bind:this={canvas}></canvas>
<Dialog visible={dialogVisible} {onConfirm} {onCancel} />
<div class="slider-container">
	<Slider onChange={onSizeSliderChange} value={renderer?.scale ?? 100} />
</div>
<ContextMenu />

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
