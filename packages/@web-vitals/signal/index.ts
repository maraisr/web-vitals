import type { Metric } from "web-vitals";
import { getCLS, getFCP, getFID, getLCP, getTTFB } from "web-vitals";

// No point deferring this — the web-vitals methods all have their numbers tracking since page
// start.
const href = location.href;

// Largely inspired by;
// https://github.com/vercel/next.js/blob/92d5fc4964581b5622504048ed322cdcb9e1fb8e/packages/next/client/performance-relayer.ts#L15
const report = (siteKey: string, signalHref: string, metric: Metric) => {
	const send =
		navigator.sendBeacon &&
		navigator.sendBeacon.bind(navigator);

	const body = {
		site: siteKey,
		id: metric.id,
		href: href,
		name: metric.name,
		value: metric.value.toString(),
	};

	const blob = new Blob([new URLSearchParams(body).toString()], {
		type: "application/x-www-form-urlencoded",
	});

	const fallback = () => {
		fetch(signalHref, {
			body: blob,
			method: "POST",
			credentials: "omit",
			keepalive: true,
		}).catch(console.error);
	};

	try {
		send(signalHref, blob) || fallback();
	} catch (e) {
		fallback();
	}
};

export const signal = (siteKey: string, signalHref: string = "https://htm.io/signal") => {
	const reporter = report.bind(0, siteKey, signalHref);
	getCLS(reporter);
	getFID(reporter);
	getLCP(reporter);
	getFCP(reporter);
	getTTFB(reporter);
};
