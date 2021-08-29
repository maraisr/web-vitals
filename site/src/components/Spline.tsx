import type { FunctionComponent } from 'preact';

type CoordTuple = [x: number, y: number];
type CurveFunc = (point: CoordTuple, i: number, points: CoordTuple[]) => string;

const WIDTH = 120;
const HEIGHT = 14;
const STROKE_WIDTH = 1;
const SMOOTHING = 0.2;

const LINES_COUNT = 6;

// Line smoothing taken from @see https://codepen.io/francoisromain/pen/dzoZZj

const line = (pointA: CoordTuple, pointB: CoordTuple) => {
	const lengthX = pointB[0] - pointA[0];
	const lengthY = pointB[1] - pointA[1];
	return {
		length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
		angle: Math.atan2(lengthY, lengthX),
	};
};

const controlPoint = (
	current: CoordTuple,
	previous: CoordTuple,
	next: CoordTuple,
	reverse: boolean = false,
) => {
	const p = previous || current;
	const n = next || current;

	const o = line(p, n);

	const angle = o.angle + (reverse ? Math.PI : 0);
	const length = o.length * SMOOTHING;

	const x = current[0] + Math.cos(angle) * length;
	const y = current[1] + Math.sin(angle) * length;
	return [x, y];
};

// ~Curve Funcs
const bezier = (point: CoordTuple, i: number, points: CoordTuple[]) => {
	const cps = controlPoint(points[i - 1], points[i - 2], point);
	const cpe = controlPoint(point, points[i - 1], points[i + 1], true);
	return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
};

const stepped = (point: CoordTuple, i: number, points: CoordTuple[]) => {
	const last_point = points[i - 1];

	let mid_point = last_point[0] + (point[0] - last_point[0]) / 2;
	if (i === points.length - 1) mid_point = point[0];

	return `L ${mid_point} ${last_point[1]} L ${mid_point} ${point[1]}`;
};

const svgPath = (points: CoordTuple[], curveFunc: CurveFunc) => {
	let i = 0,
		output = '';
	for (; i < points.length; i++) {
		const point = points[i];
		if (i === 0) {
			output = `M ${point[0]},${point[1]}`;
			continue;
		}

		output += curveFunc(point, i, points);
	}

	return output;
};

const percent = (input: number, min: number, max: number) =>
	((input - min) * 100) / (max - min);
const value_of = (percent: number, min: number, max: number) =>
	(percent * (max - min)) / 100 + min;

export const Spline: FunctionComponent<{
	points: { point: number; info: any }[];
	guides?: boolean;
	markers?: boolean;
	stepping?: boolean;
	max: number; // top
	min: number; // bottom
}> = ({ points, guides, markers, stepping }) => {
	const pointsValue = points.map((i) => i.point);
	const max = 1;
	const min = Math.max(...pointsValue);
	const interval = WIDTH / (pointsValue.length - 1);

	const coords: CoordTuple[] = pointsValue.map((v, i) => [
		interval * i,
		value_of(percent(v, max, min), 1, HEIGHT),
	]);

	const lines_coors = new Array(LINES_COUNT)
		.fill(0)
		.map((_, i) => HEIGHT * (i / (LINES_COUNT - 1)));

	return (
		<svg
			viewBox={`-3 -3 ${WIDTH + 6} ${HEIGHT + 6}`}
			preserveAspectRatio="xMinYMin meet"
		>
			<g
				pointer-events="none"
				strokeWidth="0.5"
				shape-rendering="crispEdges"
			>
				{guides
					? lines_coors.map((y, i) => (
							<line
								key={i}
								x1="-3"
								y1={y}
								x2={WIDTH + 3}
								y2={y}
								fill="transparent"
								stroke="#000"
								strokeOpacity="0.1"
							/>
					  ))
					: null}
			</g>
			<path
				fill="none"
				stroke="currentColor"
				strokeWidth={STROKE_WIDTH}
				strokeLinejoin="round"
				strokeLinecap="round"
				d={svgPath(coords, stepping ? stepped : bezier)}
			/>
			{markers ? (
				<g>
					{coords.map((v, i) => (
						<circle
							key={i}
							cx={v[0]}
							cy={v[1]}
							r="2"
							stroke="white"
							strokeWidth="1"
							fill="currentColor"
						/>
					))}
				</g>
			) : null}
		</svg>
	);
};
