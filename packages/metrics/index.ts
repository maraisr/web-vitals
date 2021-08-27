export const names = {
	CLS: "Cumulative Layout Shift",
	FCP: "First Contentful Paint",
	FID: "First Input Delay",
	LCP: "Largest Contentful Paint",
	TTFB: "Time To First Byte",
} as const;

const thresholds = {
	CLS: [0.1, 0.25],
	FCP: [1800, 3000],
	FID: [100, 300],
	//FID: [4, 10],
	LCP: [2500, 4000],
	//LCP: [1100, 2000],
};

export const namesKeys = Object.keys(names);

export const getScore = (metric: keyof typeof thresholds, p75: number) => {
	if (p75 <= thresholds[metric][0]) return "good";
	if (p75 <= thresholds[metric][1]) return "ni";
	if (p75 > thresholds[metric][1]) return "poor";

	return "unknown";
};
/*
const p95 = p(95, metric.values);
    const p98 = p(98, metric.values);

    switch (name) {
      case 'LCP':
        maxValue = Math.max(Math.ceil(p98 / 1000) * 1000, 3000);

        bucketSize = 100;
        if (maxValue > 5000) {
          bucketSize = 200;
        }
        if (maxValue > 10000) {
          bucketSize = 500;
        }
        break;
      case 'FID':
        maxValue = Math.max(Math.ceil(p95 / 50) * 50, 50);
        bucketSize = 1;
        if (maxValue > 100) {
          bucketSize = 2;
        }
        if (maxValue > 300) {
          bucketSize = 5;
        }
        if (maxValue > 1000) {
          bucketSize = 10;
        }
        break;
      case 'CLS':
        maxValue = Math.max(Math.ceil(p95 * 10) / 10, 0.1);
        bucketSize = 0.01;
        if (maxValue > 0.3) {
          bucketSize = 0.05;
        }
        if (maxValue > 1) {
          bucketSize = 0.1;
        }
        break;
    }
 */
