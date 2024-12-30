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

	getNextStates(input: string): string[] | undefined {
		return this.transitions.get(input);
	}
}
