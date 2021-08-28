export interface Metric {
	site: string;
	device: string;
	name: string;
	end_time: string;
	p75: number;
	p95: number;
	p98: number;
}

export const names = {
	CLS: 'Cumulative Layout Shift',
	FCP: 'First Contentful Paint',
	FID: 'First Input Delay',
	LCP: 'Largest Contentful Paint',
	TTFB: 'Time To First Byte',
} as const;

export const thresholds = {
	CLS: [0.1, 0.25],
	FCP: [1800, 3000],
	FID: [100, 300],
	LCP: [2500, 4000],
	TTFB: [200, 500],
};

export const guage: Record<MetricNames, [min: number, max: number]> = {
	FCP: [0, 3000],
	LCP: [0, 4000],
	CLS: [0, 0.1],
	FID: [0, 300],
	TTFB: [10, 500],
};

export type MetricNames = keyof typeof names;
export const namesKeys = Object.keys(names) as MetricNames[];

export const get_score = (metric: keyof typeof thresholds, p75: number) => {
	if (!thresholds[metric]) return 'unknown';

	if (p75 <= thresholds[metric][0]) return 'pass';
	if (p75 <= thresholds[metric][1]) return 'average';
	//if (p75 > thresholds[metric][1]) return "fail";

	return 'fail';
};

export const rounders: Record<
	keyof typeof thresholds,
	(val: number) => string
> = {
	CLS: (val: number) => val.toFixed(1),
	FCP: (val: number) => (val / 1000).toFixed(2),
	FID: (val: number) => val.toFixed(0),
	LCP: (val: number) => (val / 1000).toFixed(2),
	TTFB: (val: number) => val.toFixed(0),
};

export const suffix: Record<keyof typeof thresholds, string> = {
	CLS: '',
	FID: 'ms',
	LCP: 's',
	FCP: 's',
	TTFB: 'ms',
};
