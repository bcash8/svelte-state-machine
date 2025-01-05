import type { FSMRenderer } from '$lib/FSMRenderer.svelte';
import type { FSM } from '$lib/states/FSM';
import type { Tool, ToolName } from './Tool';
import { contextMenuState } from '$lib/contextMenuState.svelte';

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

	onContextMenu(event: MouseEvent, renderer: FSMRenderer, fsm: FSM) {
		const { x, y } = this.getCanvasCoordinates(event, renderer);
		const clickedStateName = renderer.getStateAtPosition({ x, y });
		if (!clickedStateName) return;
		const clickedState = fsm.getState(clickedStateName);
		if (!clickedState) return;

		event.preventDefault();
		event.stopPropagation();

		const menuOptions = [
			{
				label: 'Initial',
				action: () => {
					fsm.setInitialState(clickedStateName);
					renderer.draw();

					contextMenuState.set({
						visible: false,
						position: { x: event.clientX, y: event.clientY },
						options: []
					});
				}
			},
			{
				label: 'Accepting',
				action: () => {
					clickedState.isAccepting = true;
					renderer.draw();

					contextMenuState.set({
						visible: false,
						position: { x: event.clientX, y: event.clientY },
						options: []
					});
				}
			}
		];

		contextMenuState.set({
			visible: true,
			position: { x: event.clientX, y: event.clientY },
			options: menuOptions
		});
	}

	private getCanvasCoordinates(event: MouseEvent, renderer: FSMRenderer) {
		const rect = renderer.canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * window.devicePixelRatio,
			y: (event.clientY - rect.top) * window.devicePixelRatio
		};
	}
}
