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

	removeStatePosition(stateName: string) {
		this.statePosition.delete(stateName);
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

		if (state.isAccepting) {
			this.ctx.strokeStyle = 'black';
			this.ctx.lineWidth = 2;
			this.ctx.beginPath();
			this.ctx.arc(x, y, this.stateRadius - 5, 0, 2 * Math.PI);
			this.ctx.stroke();
		}

		if (this.fsm.initialState === state.name) {
			const arrowPoint = {
				x: x - this.stateRadius,
				y: y
			};

			this.ctx.fillStyle =
				isCurrent || this.#highlightedStates.has(state.name)
					? getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color')
					: 'white';
			this.ctx.beginPath();
			this.ctx.moveTo(arrowPoint.x, arrowPoint.y);
			this.ctx.lineTo(arrowPoint.x - this.stateRadius / 2, arrowPoint.y - this.stateRadius / 2);
			this.ctx.lineTo(arrowPoint.x - this.stateRadius / 2, arrowPoint.y + this.stateRadius / 2);
			this.ctx.fill();
		}

		this.ctx.fillStyle = 'black';
		this.ctx.font = `${this.fontSize}px Arial`;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText(state.name, x, y);
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
		if (from.x === to.x && from.y === to.y) {
			const angle = Math.PI / 6;
			const start = {
				x: from.x + Math.cos(5 * angle) * radius,
				y: from.y - Math.sin(angle) * radius
			};

			const end = {
				x: from.x + Math.cos(angle) * radius,
				y: from.y - Math.sin(angle) * radius
			};

			const dx = start.x - end.x;
			const dy = start.y - end.y;
			const length = Math.sqrt(dx * dx + dy * dy);

			const controlPoint = {
				x: from.x,
				y: from.y - (radius + 60)
			};

			let t = 1 - this.arrowLength / length;
			const endPoint = this.pointOnQuadraticBeizerCurve(start, end, controlPoint, t);

			this.ctx.beginPath();
			this.ctx.strokeStyle = getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color');
			this.ctx.lineWidth = this.arrowThickness;
			this.ctx.moveTo(start.x, start.y);
			this.ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
			this.ctx.stroke();

			this.drawArrowHead(endPoint, controlPoint);

			const direction = { x: dx / length, y: dy / length };

			const perpendicular = { x: -direction.y, y: direction.x };

			if (text) {
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
		} else {
			const start = from;
			const end = to;
			const dx = start.x - end.x;
			const dy = start.y - end.y;
			const length = Math.sqrt(dx * dx + dy * dy);

			const direction = { x: dx / length, y: dy / length };

			const perpendicular = { x: -direction.y, y: direction.x };

			const controlPoint = this.getControlPoint(from, to, radius);

			// Compute the visible endpoint by projecting the curve towards the circle
			let t = 1 - (radius + this.arrowLength) / length; // Parametric position near the end of the curve
			const visibleEnd = this.pointOnQuadraticBeizerCurve(start, end, controlPoint, t);

			// Compute the visible startpoint by projecting the curve towards the circle
			t = radius / length; // Parametric position near the beginning of the curve
			const visibleStart = this.pointOnQuadraticBeizerCurve(start, end, controlPoint, t);

			this.ctx.beginPath();
			this.ctx.moveTo(visibleStart.x, visibleStart.y);
			this.ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, visibleEnd.x, visibleEnd.y);

			this.ctx.strokeStyle = getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color');
			this.ctx.lineWidth = this.arrowThickness;
			this.ctx.stroke();

			// Draw arrow
			this.drawArrowHead(visibleEnd, controlPoint);

			// Draw Text
			if (text) {
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
		}
	}

	drawArrowHead(end: Position, controlPoint: Position) {
		const arrowLength = this.arrowLength; // Length of the arrowhead

		// Calculate the angle of the tangent at the endpoint
		const dx = end.x - controlPoint.x;
		const dy = end.y - controlPoint.y;
		const angle = Math.atan2(dy, dx);
		const length = Math.sqrt(dx ** 2 + dy ** 2);

		const ux = dx / length;
		const uy = dy / length;

		const arrowTip = {
			x: end.x + ux * arrowLength,
			y: end.y + uy * arrowLength
		};

		// Calculate the points for the arrowhead triangle
		const point1 = {
			x: arrowTip.x - arrowLength * Math.cos(angle - Math.PI / 7),
			y: arrowTip.y - arrowLength * Math.sin(angle - Math.PI / 7)
		};

		const point2 = {
			x: arrowTip.x - arrowLength * Math.cos(angle + Math.PI / 7),
			y: arrowTip.y - arrowLength * Math.sin(angle + Math.PI / 7)
		};

		// Draw the arrowhead
		this.ctx.fillStyle = getComputedStyle(this.ctx.canvas).getPropertyValue('--primary-color');
		this.ctx.beginPath();
		this.ctx.moveTo(arrowTip.x, arrowTip.y);
		this.ctx.lineTo(point1.x, point1.y);
		this.ctx.lineTo(point2.x, point2.y);
		this.ctx.closePath();
		this.ctx.fill();
	}

	getControlPoint(from: Position, to: Position, radius: number): Position {
		let dx = from.x - to.x;
		let dy = from.y - to.y;
		let length = Math.sqrt(dx * dx + dy * dy);
		let peakHeight = (length / 15) * (this.scale / 100);
		let start = from;
		let end = to;
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

		const midpoint = {
			x: (from.x + to.x) / 2,
			y: (from.y + to.y) / 2
		};

		const perpendicular = { x: -dy / length, y: dx / length };

		return {
			x: midpoint.x + perpendicular.x * peakHeight,
			y: midpoint.y + perpendicular.y * peakHeight
		};
	}

	pointOnQuadraticBeizerCurve(from: Position, to: Position, controlPoint: Position, t: number) {
		return {
			x: Math.pow(1 - t, 2) * from.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * to.x,
			y: Math.pow(1 - t, 2) * from.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * to.y
		};
	}

	getTransitionCurvePoint(from: Position, to: Position, radius: number, t: number) {
		if (from.x === to.x && from.y === to.y) {
			const angle = Math.PI / 6;
			const start = {
				x: from.x + Math.cos(5 * angle) * radius,
				y: from.y - Math.sin(angle) * radius
			};

			const end = {
				x: from.x + Math.cos(angle) * radius,
				y: from.y - Math.sin(angle) * radius
			};

			const controlPoint = {
				x: from.x,
				y: from.y - (radius + 60)
			};

			return this.pointOnQuadraticBeizerCurve(start, end, controlPoint, t);
		} else {
			const start = from;
			const end = to;
			const dx = start.x - end.x;
			const dy = start.y - end.y;
			const length = Math.sqrt(dx * dx + dy * dy);

			const controlPoint = this.getControlPoint(from, to, radius);

			// Compute the visible endpoint by projecting the curve towards the circle
			let t2 = 1 - (radius + this.arrowLength) / length; // Parametric position near the end of the curve
			const visibleEnd = this.pointOnQuadraticBeizerCurve(start, end, controlPoint, t2);

			// Compute the visible startpoint by projecting the curve towards the circle
			t2 = radius / length; // Parametric position near the beginning of the curve
			const visibleStart = this.pointOnQuadraticBeizerCurve(start, end, controlPoint, t2);

			return this.pointOnQuadraticBeizerCurve(visibleStart, visibleEnd, controlPoint, t);
		}
	}

	isPointNearTransitionCurve(point: Position, start: Position, end: Position, threshold: number) {
		const BREAKS = 100; // Number of points to sample on the curve
		for (let i = 0; i <= BREAKS; i++) {
			const t = i / BREAKS;
			const pointAtT = this.getTransitionCurvePoint(start, end, this.stateRadius, t);

			const distance = Math.sqrt((pointAtT.x - point.x) ** 2 + (pointAtT.y - point.y) ** 2);
			if (distance < threshold) {
				return true; // The point is close enough to the curve
			}
		}
		return false;
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
	defaultStateRaidus: 30,
	defaultArrowThickness: 4,
	defaultArrowLength: 15,
	defaultFontSize: 19,
	defaultTransitionTextOffset: 15
};
