import { FSM } from './FSM';

export class NFA extends FSM {
	initialState: string | null;
	constructor() {
		super();
		this.initialState = null;
	}

	run(input: string[]): boolean {
		if (this.initialState === null) return false;
		let currentStates = [this.initialState];

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
