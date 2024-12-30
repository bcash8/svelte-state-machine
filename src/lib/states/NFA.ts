import { FSM } from './FSM';

export class NFA extends FSM {
	constructor(initialState: string) {
		super(initialState);
	}

	run(input: string[]): boolean {
		let currentStates = [this.currentState];

		for (const symbol of input) {
			const nextStates: string[] = [];

			for (const stateName of currentStates) {
				const state = this.states.get(stateName);
				if (state) {
					const nextStates = state.getNextStates(symbol);
					if (nextStates) {
						for (const nextState of nextStates) {
							if (!nextStates?.includes(nextState)) {
								nextStates?.push(nextState);
							}
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
