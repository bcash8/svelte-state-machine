import type { FSM } from './states/FSM';
import type { State } from './states/State';

type Position = { x: number; y: number };
type Arrow = {
	from: Position;
	to: Position;
	text?: string;
	radius?: number;
};

export class FSMRenderer {
	public canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private statePosition: Map<string, Position>;
	private fsm: FSM;
	#scale: number = 100;
	#tempArrow: Arrow | null = null;
	#selectedStateName: string | null = null;
	#highlightedStates: Set<string> = new Set();

	constructor(canvas: HTMLCanvasElement, fsm: FSM) {
		this.canvas = canvas;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Failed to get 2D context');

		this.ctx = ctx;
		this.statePosition = new Map();
		const devicePixelRatio = window.devicePixelRatio || 1;
		ctx.scale(devicePixelRatio, devicePixelRatio);
		this.fsm = fsm;

		this.scale = Number(localStorage.getItem('scale')) || 100;
	}

	setStatePosition(stateName: string, position: Position) {
		this.statePosition.set(stateName, position);
	}

	getStateAtPosition({ x, y }: Position): string | null {
		for (const [stateName, position] of this.statePosition.entries()) {
			const dx = x - position.x;
			const dy = y - position.y;
			if (Math.sqrt(dx * dx + dy * dy) <= this.stateRadius) {
				return stateName;
			}
		}
		return null;
	}

	getStatePosition(stateName: string): Position {
		const position = this.statePosition.get(stateName);
		if (!position) throw new Error(`Position for state ${stateName} not set`);
		return position;
	}

	set scale(value: number) {
		if (value > 0 && value <= 200) {
			this.#scale = value;
			localStorage.setItem('scale', value.toString());
		}
	}

	get scale() {
		return this.#scale;
	}

	get stateRadius() {
		return config.defaultStateRaidus * (this.scale / 100);
	}

	get arrowThickness() {
		return config.defaultArrowThickness * (this.scale / 100);
	}

	get arrowLength() {
		return config.defaultArrowLength * (this.scale / 100);
	}

	get transitionTextOffset() {
		return config.defaultTransitionTextOffset * (this.scale / 100);
	}

	get fontSize() {
		return config.defaultFontSize * (this.scale / 100);
	}

	set selectedStateName(state: string | null) {
		this.#selectedStateName = state;
	}

	set highlightedStates(states: Set<string>) {
		this.#highlightedStates = states;
	}

	addHighlightedState(state: string) {
		this.#highlightedStates.add(state);
	}

	removeHighlightedState(state: string) {
		this.#highlightedStates.delete(state);
	}

	clearHighlightedStates() {
		this.#highlightedStates = new Set();
	}

	set tempArrow(arrow: Arrow | null) {
		this.#tempArrow = arrow;
	}

	draw() {
		this.clearCanvas();
		const { states, transitions } = this.fsm.getVisualizationData();
		states.forEach((state) => this.drawState(state, this.#selectedStateName === state.name));
		transitions.forEach((transition) => this.drawTransition(transition));

		if (this.#tempArrow) {
			this.drawArrow(this.#tempArrow);
		}
	}

	drawState(state: State, isCurrent: boolean = false) {
		const position = this.statePosition.get(state.name);
		if (!position) throw new Error(`Position for state ${state.name} not set`);

		const { x, y } = position;

		this.ctx.strokeStyle = 'white';
		this.ctx.fillStyle = 'white';

		this.ctx.beginPath();
		this.ctx.arc(x, y, this.stateRadius, 0, 2 * Math.PI);
		this.ctx.fillStyle =
			isCurrent || this.#highlightedStates.has(state.name)
				? getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color')
				: 'white';
		this.ctx.fill();

		this.ctx.fillStyle = 'black';
		this.ctx.font = `${this.fontSize}px Arial`;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText(state.name, x, y);

		if (state.isAccepting) {
			this.ctx.strokeStyle = 'black';

			this.ctx.beginPath();
			this.ctx.arc(x, y, this.stateRadius - 5, 0, 2 * Math.PI);
			this.ctx.stroke();
		}
	}

	drawTransition(transition: { from: string; to: string; input: string }) {
		const fromPosition = this.statePosition.get(transition.from);
		const toPosition = this.statePosition.get(transition.to);
		if (!fromPosition || !toPosition) {
			throw new Error(`Positions for states ${transition.from} or ${transition.to} not set`);
		}

		this.drawArrow({
			from: fromPosition,
			to: toPosition,
			text: transition.input,
			radius: this.stateRadius
		});
	}

	drawArrow({ from, to, text = '', radius = 0 }: Arrow) {
		let start = from;
		let end = to;
		let dx = start.x - end.x;
		let dy = start.y - end.y;
		let length = Math.sqrt(dx * dx + dy * dy);
		let peakHeight = (length / 10) * (this.scale / 100);
		if (length === 0) {
			start = {
				x: from.x + Math.cos((5 * Math.PI) / 6) * radius,
				y: from.y - Math.sin((5 * Math.PI) / 6) * radius
			};

			end = {
				x: from.x + Math.cos(Math.PI / 6) * radius,
				y: from.y - Math.sin(Math.PI / 6) * radius
			};

			dx = start.x - end.x;
			dy = start.y - end.y;
			length = Math.sqrt(dx * dx + dy * dy);
			peakHeight = length;
			radius = 0;
		}

		const direction = { x: dx / length, y: dy / length };

		const midpoint = {
			x: (start.x + end.x) / 2,
			y: (start.y + end.y) / 2
		};

		const perpendicular = { x: -direction.y, y: direction.x };

		const controlPoint = {
			x: midpoint.x + perpendicular.x * peakHeight,
			y: midpoint.y + perpendicular.y * peakHeight
		};

		// Compute the visible endpoint by projecting the curve towards the circle
		let t = 1 - (radius + this.arrowLength) / length; // Parametric position near the end of the curve
		const visibleEnd = {
			x: Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * end.x,
			y: Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * end.y
		};

		// Compute the visible startpoint by projecting the curve towards the circle
		t = radius / length; // Parametric position near the beginning of the curve
		const visibleStart = {
			x: Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * end.x,
			y: Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * end.y
		};

		this.ctx.beginPath();
		this.ctx.moveTo(visibleStart.x, visibleStart.y);
		this.ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, visibleEnd.x, visibleEnd.y);

		this.ctx.strokeStyle = getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color');
		this.ctx.lineWidth = this.arrowThickness;
		this.ctx.stroke();

		// Draw arrow

		// Calculate the tangent of the curve at the visible endpoint
		t = 1 - radius / length;
		const tangent = {
			x: 2 * (1 - t) * (controlPoint.x - start.x) + 2 * t * (end.x - controlPoint.x),
			y: 2 * (1 - t) * (controlPoint.y - start.y) + 2 * t * (end.y - controlPoint.y)
		};

		const tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
		const normalizedTangent = {
			x: tangent.x / tangentLength,
			y: tangent.y / tangentLength
		};

		const arrowEnd = {
			x: visibleEnd.x + normalizedTangent.x * this.arrowLength,
			y: visibleEnd.y + normalizedTangent.y * this.arrowLength
		};

		const arrowAngle = Math.PI / 6;
		const leftWing = {
			x:
				arrowEnd.x -
				Math.cos(arrowAngle) * this.arrowLength * normalizedTangent.x +
				Math.sin(arrowAngle) * this.arrowLength * normalizedTangent.y,
			y:
				arrowEnd.y -
				Math.sin(arrowAngle) * this.arrowLength * normalizedTangent.x -
				Math.cos(arrowAngle) * this.arrowLength * normalizedTangent.y
		};

		const rightWing = {
			x:
				arrowEnd.x -
				Math.cos(-arrowAngle) * this.arrowLength * normalizedTangent.x +
				Math.sin(-arrowAngle) * this.arrowLength * normalizedTangent.y,
			y:
				arrowEnd.y -
				Math.sin(-arrowAngle) * this.arrowLength * normalizedTangent.x -
				Math.cos(-arrowAngle) * this.arrowLength * normalizedTangent.y
		};

		this.ctx.fillStyle = getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color');

		this.ctx.beginPath();
		this.ctx.moveTo(arrowEnd.x, arrowEnd.y);
		this.ctx.lineTo(leftWing.x, leftWing.y);
		this.ctx.lineTo(rightWing.x, rightWing.y);
		this.ctx.fill();

		t = 0.5;
		const textPosition = {
			x:
				Math.pow(1 - t, 2) * start.x +
				2 * (1 - t) * t * controlPoint.x +
				Math.pow(t, 2) * end.x +
				perpendicular.x * this.transitionTextOffset,
			y:
				Math.pow(1 - t, 2) * start.y +
				2 * (1 - t) * t * controlPoint.y +
				Math.pow(t, 2) * end.y +
				perpendicular.y * this.transitionTextOffset
		};

		this.ctx.fillStyle = 'white';
		this.ctx.font = `${this.fontSize}px Arial`;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText(text, textPosition.x, textPosition.y);
	}

	clearCanvas() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	}

	resizeCanvas() {
		if (!this.canvas) return;
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.canvas.width = width * devicePixelRatio;
		this.canvas.height = height * devicePixelRatio;
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;
	}
}

const config = {
	defaultStateRaidus: 20,
	defaultArrowThickness: 2,
	defaultArrowLength: 15,
	defaultFontSize: 16,
	defaultTransitionTextOffset: 15
};
