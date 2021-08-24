export const names = {
	FCP: 'First Contentful Paint',
	LCP: 'Largest Contentful Paint',
	FID: 'First Input Delay',
	CLS: 'Cumulative Layout Shift',
	TTFB: 'Time To First Byte',
} as const;

export const namesKeys = Object.keys(names);
