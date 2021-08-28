export const p = (percentile: number, values: number[]) =>
	values[Math.floor(values.length * (percentile / 100))];
