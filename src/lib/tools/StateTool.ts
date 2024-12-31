import type { Tool, ToolName } from './Tool';
import type { FSMRenderer } from '$lib/FSMRenderer';
import type { FSM } from '$lib/states/FSM';
import { State } from '$lib/states/State';

export class StateTool implements Tool {
	name: ToolName = 'State';

	onActivate(_renderer: FSMRenderer) {}

	onDeactivate(_renderer: FSMRenderer) {}

	onMouseDown(event: MouseEvent, renderer: FSMRenderer, fsm: FSM) {
		const { x, y } = this.getCanvasCoordinates(event, renderer);
		const newState = new State({ name: `q${fsm.getNumberOfStates()}` });
		fsm.addState(newState);
		renderer.setStatePosition(newState.name, { x, y });
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
