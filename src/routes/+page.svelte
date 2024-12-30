<script lang="ts">
	import { updated } from '$app/state';
	import { FSMRenderer } from '$lib/FSMRenderer';
	import { NFA } from '$lib/states/NFA';
	import { State } from '$lib/states/State';
	import { onMount } from 'svelte';
	import Toolbar from '../components/Toolbar.svelte';

	let canvas: HTMLCanvasElement;
	let renderer: FSMRenderer;
	let width: number;
	let height: number;
	let nfa: NFA;
	let selectedState: string | null = null;
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };

	function updateDimensions() {
		if (renderer && nfa) {
			renderer.resizeCanvas();
			renderer.clearCanvas();
			const { states, transitions } = nfa.getVisualizationData();
			states.forEach((state) => renderer.drawState(state));
			transitions.forEach((transition) => renderer.drawTransition(transition));
		}
	}

	function onMouseDown(event: MouseEvent) {
		const { x, y } = getCanvasCoordinates(event);
		selectedState = renderer.getStateAtPosition({ x, y });
		if (selectedState) {
			renderer.selectedState = selectedState;
			isDragging = true;
			const statePosition = renderer.getStatePosition(selectedState);
			dragOffset = { x: x - statePosition.x, y: y - statePosition.y };
		}
	}

	function onMouseUp() {
		isDragging = false;
		selectedState = null;
		renderer.selectedState = null;
		renderer.draw();
	}

	function onMouseMove(event: MouseEvent) {
		if (isDragging && selectedState) {
			const { x, y } = getCanvasCoordinates(event);
			const newPosition = { x: x - dragOffset.x, y: y - dragOffset.y };
			renderer.setStatePosition(selectedState, newPosition);
			renderer.draw();
		}
	}

	function getCanvasCoordinates(event: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * window.devicePixelRatio,
			y: (event.clientY - rect.top) * window.devicePixelRatio
		};
	}

	onMount(() => {
		nfa = new NFA('q0');
		renderer = new FSMRenderer(canvas, nfa);
		renderer.setStatePosition('q0', { x: 100, y: 300 });
		renderer.resizeCanvas();

		const q0 = new State({ name: 'q0', isAccepting: false });
		nfa.addState(q0);
		const q1 = new State({ name: 'q1', isAccepting: true });
		nfa.addState(q1);
		renderer.setStatePosition('q1', { x: 500, y: 300 });

		q1.addTransition('a', 'q0');
		q0.addTransition('b', 'q1');

		renderer.draw();
		window.addEventListener('resize', updateDimensions);
		canvas.addEventListener('mousedown', onMouseDown);
		canvas.addEventListener('mousemove', onMouseMove);
		canvas.addEventListener('mouseup', onMouseUp);

		return () => window.removeEventListener('resize', updateDimensions);
	});
</script>

<Toolbar />
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
