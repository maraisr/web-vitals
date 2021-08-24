import type { KV } from 'worktop/kv';
import type { Device } from 'utils/device';
import * as DB from 'worktop/kv';

declare const METRICS: KV.Namespace;

export interface SignalMessage {
	site: string;
	id: string; // <= 30
	href: string;
	name: string; // in the allowed values
	value: string; // <= 99999999999999
}

export interface Signal extends Omit<SignalMessage, 'site'>, Device {
	country: string;
	timestamp: number;
}

const ns = (str: string) => `site::${str}`;
const makeKey = (...args: string[]) => args.join('::');

export const save = async (site: string, signal: Signal) => {
	const prefix = ns(site);
	const key = makeKey(
		prefix,
		signal.name,
		signal.timestamp.toString(),
		signal.id,
	);
	await DB.write(METRICS, key, signal, {
		expirationTtl: 7890000, // only store for 3 months
	});
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
