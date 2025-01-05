import { writable } from 'svelte/store';

export type ContextMenuState = {
	visible: boolean;
	position: { x: number; y: number };
	options: { label: string; action: () => void }[];
};

export const contextMenuState = writable<ContextMenuState>({
	visible: false,
	position: { x: 0, y: 0 },
	options: []
});
