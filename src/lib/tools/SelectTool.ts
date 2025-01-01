import type { FSMRenderer } from '$lib/FSMRenderer.svelte';
import type { Tool, ToolName } from './Tool';

export class SelectTool implements Tool {
	name: ToolName = 'Select';
	private isDragging = false;
	private selectedState: string | null = null;
	private dragOffset = { x: 0, y: 0 };

	onActivate(renderer: FSMRenderer) {
		renderer.selectedStateName = null;
	}

	onDeactivate(renderer: FSMRenderer) {
		this.isDragging = false;
		this.selectedState = null;
		renderer.selectedStateName = null;
		renderer.clearHighlightedStates();
		renderer.draw();
	}

	onMouseDown(event: MouseEvent, renderer: FSMRenderer) {
		const { x, y } = this.getCanvasCoordinates(event, renderer);
		this.selectedState = renderer.getStateAtPosition({ x, y });
		if (this.selectedState) {
			this.isDragging = true;
			renderer.selectedStateName = this.selectedState;
			const statePosition = renderer.getStatePosition(this.selectedState);
			this.dragOffset = { x: x - statePosition.x, y: y - statePosition.y };
			renderer.draw();
		}
	}

	onMouseMove(event: MouseEvent, renderer: FSMRenderer) {
		if (this.isDragging && this.selectedState) {
			const { x, y } = this.getCanvasCoordinates(event, renderer);
			const newPosition = { x: x - this.dragOffset.x, y: y - this.dragOffset.y };
			renderer.setStatePosition(this.selectedState, newPosition);
			renderer.draw();
		}
	}

	onMouseUp(event: MouseEvent, renderer: FSMRenderer) {
		this.isDragging = false;
		this.selectedState = null;
		renderer.selectedStateName = null;
	}

	private getCanvasCoordinates(event: MouseEvent, renderer: FSMRenderer) {
		const rect = renderer.canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * window.devicePixelRatio,
			y: (event.clientY - rect.top) * window.devicePixelRatio
		};
	}
}
