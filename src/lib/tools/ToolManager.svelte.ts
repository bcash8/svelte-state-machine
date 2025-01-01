import type { FSMRenderer } from '$lib/FSMRenderer.svelte';
import type { FSM } from '$lib/states/FSM';
import type { Tool, ToolName } from './Tool';
import type { ToolFactory } from './toolFactory';

export class ToolManager {
	currentTool: Tool | undefined = $state();
	private toolFactory: ToolFactory;
	private renderer: FSMRenderer;
	private fsm: FSM;

	constructor(toolFactory: ToolFactory, renderer: FSMRenderer, fsm: FSM) {
		this.toolFactory = toolFactory;
		this.renderer = renderer;
		this.fsm = fsm;
	}

	setCurrentTool(toolName: ToolName) {
		const tool = this.toolFactory[toolName]();
		this.currentTool = tool;
		this.currentTool?.onDeactivate?.(this.renderer);
		this.currentTool = tool;
		this.currentTool?.onActivate(this.renderer);
	}

	handleMouseDown(event: MouseEvent): void {
		this.currentTool?.onMouseDown?.(event, this.renderer, this.fsm);
	}

	handleMouseMove(event: MouseEvent): void {
		this.currentTool?.onMouseMove?.(event, this.renderer, this.fsm);
	}

	handleMouseUp(event: MouseEvent): void {
		this.currentTool?.onMouseUp?.(event, this.renderer, this.fsm);
	}
}
