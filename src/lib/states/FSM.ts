import type { State } from './State';

export abstract class FSM {
	states: Map<string, State>;
	initialState: string;
	currentState: string;

	constructor(initialState: string) {
		this.states = new Map();
		this.initialState = initialState;
		this.currentState = initialState;
	}

	addState(state: State) {
		this.states.set(state.name, state);
	}

	reset() {
		this.currentState = this.initialState;
	}

	getVisualizationData() {
		const states = Array.from(this.states.values());
		const transitions = [];
		for (const state of states) {
			for (const [input, nextStates] of state.transitions) {
				for (const nextState of nextStates) {
					transitions.push({ from: state.name, to: nextState, input });
				}
			}
		}

		return { states, transitions };
	}

	abstract run(input: string[]): boolean;
}
