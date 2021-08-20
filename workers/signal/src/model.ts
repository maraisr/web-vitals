import type { KV } from 'worktop/kv';
import * as DB from 'worktop/kv';

declare const METRICS: KV.Namespace;

export interface Signal {
	id: string;
	href: string;
	name: string;
	value: string;
	timestamp: number;
}

const ns = (str: string) => `site::${str}`;
const makeKey = (...args: string[]) => args.join('::');

/**
 * Force saves a signal for a site
 */
export const save = async (site: string, signal: Signal) => {
	const prefix = ns(site);
	const key = makeKey(
		prefix,
		signal.name,
		signal.timestamp.toString(),
		signal.id,
	);
	await DB.write(METRICS, key, signal);
};

export const get = async (site: string, name: string) => {
	const prefix = ns(site);

	return DB.list(METRICS, {
		prefix: makeKey(prefix, name),
	});
};

export const forSite = (site: string) => ({
	save: save.bind(0, site),
	get: get.bind(0, site),
});
