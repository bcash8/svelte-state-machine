import type { State } from './State';

export abstract class FSM {
	states: Map<string, State>;

	constructor() {
		this.states = new Map();
	}

	addState(state: State) {
		this.states.set(state.name, state);
	}

	removeState(stateName: string) {
		this.states.delete(stateName);
	}

	getState(name: string) {
		return this.states.get(name);
	}

	reset() {}

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

	getNumberOfStates() {
		return this.states.size;
	}

	abstract run(input: string[]): boolean;
}
