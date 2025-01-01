import type { Tool, ToolName } from './Tool';
import type { FSMRenderer } from '$lib/FSMRenderer.svelte';
import type { FSM } from '$lib/states/FSM';

export class DeleteTool implements Tool {
	name: ToolName = 'Delete';

	onActivate(_renderer: FSMRenderer) {}

	onDeactivate(_renderer: FSMRenderer) {}

	onMouseDown(_event: MouseEvent, _renderer: FSMRenderer, _fsm: FSM) {}

	onMouseMove(_event: MouseEvent, _renderer: FSMRenderer) {}

	onMouseUp(event: MouseEvent, renderer: FSMRenderer, fsm: FSM) {
		const { x, y } = this.getCanvasCoordinates(event, renderer);
		const state = renderer.getStateAtPosition({ x, y });
		if (state === null) return;
		fsm.removeState(state);
		renderer.draw();
	}

	private getCanvasCoordinates(event: MouseEvent, renderer: FSMRenderer) {
		const rect = renderer.canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * window.devicePixelRatio,
			y: (event.clientY - rect.top) * window.devicePixelRatio
		};
	}
}
