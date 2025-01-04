export class State {
	name: string;
	isAccepting: boolean;
	transitions: Map<string, string[]>;

	constructor({ name, isAccepting = false }: { name: string; isAccepting?: boolean }) {
		this.name = name;
		this.isAccepting = isAccepting;
		this.transitions = new Map();
	}

	addTransition(input: string, next: string) {
		const transition = this.transitions.get(input) || [];
		if (!transition.includes(next)) {
			transition.push(next);
			this.transitions.set(input, transition);
		}
	}

	removeTransition(toStateName: string, input?: string) {
		for (const transition of this.transitions) {
			if (transition[1].includes(toStateName) && (!input || transition[0] === input)) {
				const stateIndex = transition[1].findIndex((state) => state === toStateName);
				transition[1].splice(stateIndex, 1);
			}
		}
	}

	getNextStates(input: string): string[] | undefined {
		return this.transitions.get(input);
	}
}
