export const p = (percentile: number, values: number[]) => values[Math.floor((values.length) * (percentile / 100))];

/*
    P75 – The real experience of the majority of your users
    P90 – The real experience of the slowest 10% of your users
    P95 – The real experience of the slowest 5% of your users
    P99 – The real experience of the slowest 1% of your users
 */
