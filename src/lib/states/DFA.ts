import { FSM } from './FSM';

export class DFA extends FSM {
	constructor(initialState: string) {
		super(initialState);
	}

	run(input: string[]): boolean {
		let currentState = this.currentState;

		for (const symbol of input) {
			const state = this.states.get(currentState);
			if (state) {
				const nextState = (state.getNextStates(symbol) ?? [])[0];
				if (!nextState) return false;
				currentState = nextState;
			}
		}

		const finalState = this.states.get(currentState);
		return finalState?.isAccepting ?? false;
	}
}
