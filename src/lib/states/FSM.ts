import type { State } from './State';

export abstract class FSM {
	states: Map<string, State>;
	private nextStateNumber = 0;
	initialState: string | null;

	constructor() {
		this.states = new Map();
		this.initialState = null;
	}

	addState(state: State) {
		this.states.set(state.name, state);
	}

	removeState(stateName: string) {
		for (const state of this.states.values()) {
			state.removeTransition(stateName);
		}
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

	getNextStateNumber() {
		return this.nextStateNumber++;
	}

	setInitialState(stateName: string | null) {
		this.initialState = stateName;
	}

	abstract run(input: string[]): boolean;
}
