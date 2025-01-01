import { DeleteTool } from './DeleteTool';
import { SelectTool } from './SelectTool';
import { StateTool } from './StateTool';
import type { Tool, ToolName } from './Tool';
import { TransitionTool } from './TransitionTool';

export type ToolFactory = Record<ToolName, () => Tool>;

type ToolFactoryDependencies = {
	onOpenDialog: () => void;
};

export function createToolFactory({ onOpenDialog }: ToolFactoryDependencies): ToolFactory {
	return {
		Select: () => new SelectTool(),
		State: () => new StateTool(),
		Transition: () => new TransitionTool(onOpenDialog),
		Delete: () => new DeleteTool()
	};
}
