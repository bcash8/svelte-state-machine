import type { Tool, ToolName } from './Tool';
import type { FSMRenderer } from '$lib/FSMRenderer.svelte';
import type { FSM } from '$lib/states/FSM';

export class TransitionTool implements Tool {
	name: ToolName = 'Transition';
	private fromState: string | null = null;
	private openDialog: () => void;
	private pendingTransiton: { from: string; to: string } | null = null;

	constructor(openDialog: () => void) {
		this.openDialog = openDialog;
	}

	onActivate(_renderer: FSMRenderer) {}

	onDeactivate(renderer: FSMRenderer) {
		this.fromState = null;
		renderer.tempArrow = null;
		renderer.selectedStateName = null;
		renderer.clearHighlightedStates();
		renderer.draw();
	}

	onMouseDown(event: MouseEvent, renderer: FSMRenderer) {
		const { x, y } = this.getCanvasCoordinates(event, renderer);
		this.fromState = renderer.getStateAtPosition({ x, y });
		if (this.fromState) {
			renderer.selectedStateName = this.fromState;
		}
	}

	onMouseMove(event: MouseEvent, renderer: FSMRenderer) {
		if (this.fromState) {
			const { x, y } = this.getCanvasCoordinates(event, renderer);
			const hoverState = renderer.getStateAtPosition({ x, y });
			if (hoverState) renderer.addHighlightedState(hoverState);
			else renderer.clearHighlightedStates();

			const fromPosition = renderer.getStatePosition(this.fromState);
			renderer.tempArrow = { from: fromPosition, to: { x, y } };
			renderer.draw();
		}
	}

	onMouseUp(event: MouseEvent, renderer: FSMRenderer, _fsm: FSM) {
		const { x, y } = this.getCanvasCoordinates(event, renderer);
		const toState = renderer.getStateAtPosition({ x, y });

		if (this.fromState && toState) {
			const fromState = this.fromState;
			this.pendingTransiton = { from: fromState, to: toState };
			this.openDialog();
		}

		this.fromState = null;
		renderer.selectedStateName = null;
		renderer.clearHighlightedStates();
		renderer.tempArrow = null;
		renderer.draw();
	}

	onDialogConfirm(input: string, renderer: FSMRenderer, fsm: FSM) {
		if (this.pendingTransiton) {
			const state = fsm.getState(this.pendingTransiton.from);
			state?.addTransition(input, this.pendingTransiton.to);
			this.pendingTransiton = null;
			renderer.draw();
		}
	}

	private getCanvasCoordinates(event: MouseEvent, renderer: FSMRenderer) {
		const rect = renderer.canvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * window.devicePixelRatio,
			y: (event.clientY - rect.top) * window.devicePixelRatio
		};
	}
}

export function toolIsTransitionTool(tool: Tool): tool is TransitionTool {
	return tool.name === 'Transition';
}
