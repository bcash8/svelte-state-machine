import type { Tool, ToolName } from './Tool';
import { FSMRenderer } from '$lib/FSMRenderer.svelte';
import type { FSM } from '$lib/states/FSM';

export class DeleteTool implements Tool {
	name: ToolName = 'Delete';

	onActivate(_renderer: FSMRenderer) {}

	onDeactivate(_renderer: FSMRenderer) {}

	onMouseDown(_event: MouseEvent, _renderer: FSMRenderer, _fsm: FSM) {}

	onMouseMove(_event: MouseEvent, _renderer: FSMRenderer) {}

	onMouseUp(event: MouseEvent, renderer: FSMRenderer, fsm: FSM) {
		// Delete State
		const { x, y } = this.getCanvasCoordinates(event, renderer);
		const state = renderer.getStateAtPosition({ x, y });
		if (state !== null) {
			fsm.removeState(state);
			renderer.removeStatePosition(state);
			renderer.draw();
			return;
		}

		// Delete Transition
		for (const fromState of fsm.states.values()) {
			const fromStatePos = renderer.getStatePosition(fromState.name);
			for (const toStateNames of fromState.transitions.values()) {
				for (const toStateName of toStateNames) {
					const toStatePos = renderer.getStatePosition(toStateName);
					if (renderer.isPointNearTransitionCurve({ x, y }, fromStatePos, toStatePos, 10)) {
						fromState.removeTransition(toStateName);
						renderer.draw();
						return;
					}
				}
			}
		}
	}

	onContextMenu(_event: MouseEvent, _renderer: FSMRenderer, _fsm: FSM) {}

	private getCanvasCoordinates(event: MouseEvent, renderer: FSMRenderer) {
		const rect = renderer.canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * window.devicePixelRatio,
			y: (event.clientY - rect.top) * window.devicePixelRatio
		};
	}
}
