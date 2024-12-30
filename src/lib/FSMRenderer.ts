import type { FSM } from './states/FSM';
import type { State } from './states/State';

type Position = { x: number; y: number };
export class FSMRenderer {
	private ctx: CanvasRenderingContext2D;
	private statePosition: Map<string, Position>;
	private stateRadius: number = 30;
	private fsm: FSM;
	#selectedState: string | null = null;

	constructor(canvas: HTMLCanvasElement, fsm: FSM) {
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Failed to get 2D context');
		this.ctx = ctx;
		this.statePosition = new Map();
		const devicePixelRatio = window.devicePixelRatio || 1;
		ctx.scale(devicePixelRatio, devicePixelRatio);

		this.fsm = fsm;
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

	set selectedState(state: string | null) {
		this.#selectedState = state;
	}

	draw() {
		this.clearCanvas();

		const { states, transitions } = this.fsm.getVisualizationData();
		states.forEach((state) => this.drawState(state, this.#selectedState === state.name));
		transitions.forEach((transition) => this.drawTransition(transition));
	}

	drawState(state: State, isCurrent: boolean = false) {
		const position = this.statePosition.get(state.name);
		if (!position) throw new Error(`Position for state ${state.name} not set`);

		const { x, y } = position;

		this.ctx.strokeStyle = 'white';
		this.ctx.fillStyle = 'white';

		this.ctx.beginPath();
		this.ctx.arc(x, y, this.stateRadius, 0, 2 * Math.PI);
		this.ctx.fillStyle = isCurrent
			? getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color')
			: 'white';
		this.ctx.fill();

		this.ctx.fillStyle = 'black';
		this.ctx.font = '16px Arial';
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

		this.drawArrow(fromPosition, toPosition, transition.input);
	}

	private drawArrow(from: Position, to: Position, text: string) {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const length = Math.sqrt(dx * dx + dy * dy);
		const peakHeight = length / 5;
		const arrowLength = 15;

		if (length <= this.stateRadius) {
			throw new Error('Distance between points must be greater than the radius.');
		}

		const direction = { x: dx / length, y: dy / length };

		const midpoint = {
			x: (from.x + to.x) / 2,
			y: (from.y + to.y) / 2
		};

		const perpendicular = { x: -direction.y, y: direction.x };

		const controlPoint = {
			x: midpoint.x + perpendicular.x * peakHeight,
			y: midpoint.y + perpendicular.y * peakHeight
		};

		// Compute the visible endpoint by projecting the curve towards the circle
		let t = 1 - (this.stateRadius + arrowLength) / length; // Parametric position near the end of the curve
		const visibleEnd = {
			x: Math.pow(1 - t, 2) * from.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * to.x,
			y: Math.pow(1 - t, 2) * from.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * to.y
		};

		// Compute the visible startpoint by projecting the curve towards the circle
		t = this.stateRadius / length; // Parametric position near the beginning of the curve
		const visibleStart = {
			x: Math.pow(1 - t, 2) * from.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * to.x,
			y: Math.pow(1 - t, 2) * from.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * to.y
		};

		this.ctx.beginPath();
		this.ctx.moveTo(visibleStart.x, visibleStart.y);
		this.ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, visibleEnd.x, visibleEnd.y);

		this.ctx.strokeStyle = getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color');
		this.ctx.lineWidth = 2;
		this.ctx.stroke();

		// Draw arrow

		// Calculate the tangent of the curve at the visible endpoint
		t = 1 - this.stateRadius / length;
		const tangent = {
			x: 2 * (1 - t) * (controlPoint.x - from.x) + 2 * t * (to.x - controlPoint.x),
			y: 2 * (1 - t) * (controlPoint.y - from.y) + 2 * t * (to.y - controlPoint.y)
		};

		const tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
		const normalizedTangent = {
			x: tangent.x / tangentLength,
			y: tangent.y / tangentLength
		};

		const arrowEnd = {
			x: visibleEnd.x + normalizedTangent.x * arrowLength,
			y: visibleEnd.y + normalizedTangent.y * arrowLength
		};

		const arrowAngle = Math.PI / 6;
		const leftWing = {
			x:
				arrowEnd.x -
				Math.cos(arrowAngle) * arrowLength * normalizedTangent.x +
				Math.sin(arrowAngle) * arrowLength * normalizedTangent.y,
			y:
				arrowEnd.y -
				Math.sin(arrowAngle) * arrowLength * normalizedTangent.x -
				Math.cos(arrowAngle) * arrowLength * normalizedTangent.y
		};

		const rightWing = {
			x:
				arrowEnd.x -
				Math.cos(-arrowAngle) * arrowLength * normalizedTangent.x +
				Math.sin(-arrowAngle) * arrowLength * normalizedTangent.y,
			y:
				arrowEnd.y -
				Math.sin(-arrowAngle) * arrowLength * normalizedTangent.x -
				Math.cos(-arrowAngle) * arrowLength * normalizedTangent.y
		};

		this.ctx.fillStyle = getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color');

		this.ctx.beginPath();
		this.ctx.moveTo(arrowEnd.x, arrowEnd.y);
		this.ctx.lineTo(leftWing.x, leftWing.y);
		this.ctx.lineTo(rightWing.x, rightWing.y);
		this.ctx.fill();

		t = 0.5;
		const textPosition = {
			x: Math.pow(1 - t, 2) * from.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * to.x,
			y: Math.pow(1 - t, 2) * from.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * to.y
		};
		this.ctx.fillStyle = 'white';
		this.ctx.font = '16px Arial';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText(
			text,
			textPosition.x + perpendicular.x * 30,
			textPosition.y + perpendicular.y * 30
		);
	}

	clearCanvas() {
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	}

	resizeCanvas() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const canvas = this.ctx.canvas;
		canvas.width = width * devicePixelRatio;
		canvas.height = height * devicePixelRatio;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
	}
}
