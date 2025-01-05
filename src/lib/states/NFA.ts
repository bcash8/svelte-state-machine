import { FSM } from './FSM';

export class NFA extends FSM {
	constructor() {
		super();
	}

	run(input: string[]): boolean {
		if (!this.initialState) return false;

		let currentStates = [this.initialState];
		console.log('Input:', input, 'Initial State:', this.initialState);

		for (const symbol of input) {
			console.log('Processing symbol:', symbol);

			const nextStates: string[] = [];
			for (const stateName of currentStates) {
				const state = this.states.get(stateName);
				if (state) {
					const statesToTransitionTo = state.getNextStates(symbol) || [];
					for (const nextState of statesToTransitionTo) {
						if (!nextStates.includes(nextState)) {
							nextStates.push(nextState);
						}
					}
				}
			}

			if (nextStates.length === 0) return false;
			currentStates = nextStates;
		}

		return currentStates.some((stateName) => this.states.get(stateName)?.isAccepting);
	}
}
