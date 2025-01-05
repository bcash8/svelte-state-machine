import type { FSMRenderer } from '$lib/FSMRenderer.svelte';
import type { FSM } from '$lib/states/FSM';

export type ToolName = 'Select' | 'State' | 'Transition' | 'Delete';

export interface Tool {
	name: ToolName;

	onActivate(renderer: FSMRenderer): void;
	onDeactivate(renderer: FSMRenderer): void;

	onMouseDown(event: MouseEvent, renderer: FSMRenderer, fsm: FSM): void;
	onMouseMove(event: MouseEvent, renderer: FSMRenderer, fsm: FSM): void;
	onMouseUp(event: MouseEvent, renderer: FSMRenderer, fsm: FSM): void;
	onContextMenu(event: MouseEvent, renderer: FSMRenderer, fsm: FSM): void;
}
