import type { Tool, ToolName } from './Tool';
import type { FSMRenderer } from '$lib/FSMRenderer';
import type { FSM } from '$lib/states/FSM';

export class DeleteTool implements Tool {
	name: ToolName = 'Delete';

	onActivate(_renderer: FSMRenderer) {}

	onDeactivate(_renderer: FSMRenderer) {}

	onMouseDown(event: MouseEvent, renderer: FSMRenderer, fsm: FSM) {
		const { x, y } = this.getCanvasCoordinates(event, renderer);
		const state = renderer.getStateAtPosition({ x, y });
		if (state === null) return;
		fsm.removeState(state);
		renderer.draw();
	}

	onMouseMove(_event: MouseEvent, _renderer: FSMRenderer) {}

	onMouseUp(_event: MouseEvent, _renderer: FSMRenderer) {}

	private getCanvasCoordinates(event: MouseEvent, renderer: FSMRenderer) {
		const rect = renderer.canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * window.devicePixelRatio,
			y: (event.clientY - rect.top) * window.devicePixelRatio
		};
	}
}
