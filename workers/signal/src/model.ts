import type { Metric } from 'metrics';
import { MetricNames, namesKeys } from 'metrics';
import type { Signal } from 'signal';
import { call as callSupabase } from 'supabase';
import type { DeviceTypes } from 'utils/device';
import { deviceTypes } from 'utils/device';
import { makeKey } from 'utils/kv';
import type { KV } from 'worktop/kv';
import { paginate, read } from 'worktop/kv';

declare const METRICS: KV.Namespace;

export type ReportData = {
	[device in DeviceTypes]: {
		name: DeviceTypes;
		vitals: Partial<
			Record<
				MetricNames,
				{
					name: string;
					values: Metric[];
				}
			>
		>;
	};
};

export const valid_site = async (site: string) => {
	const keys = await paginate(METRICS, {
		prefix: makeKey('site', site, 'config'),
	});

	return keys.length;
};

export const save = async (site: string, signal: Signal) =>
	(await callSupabase('POST', '/metrics', { site, ...signal })).text();

export const get = async (site: string) => {
	const keys = await paginate(METRICS, {
		limit: 19, // 60min windows @ 1440mins per day — 1440/60 = 19 ~ so 1 day of data
		prefix: makeKey('site', site, 'agg'),
	});

	const values = (
		await Promise.all(keys.map((key) => read<Metric[]>(METRICS, key)))
	).flat() as Metric[];

	// @ts-ignore
	const final: ReportData = {};

	for (const device of deviceTypes) {
		const { vitals } = (final[device] = {
			name: device,
			vitals: {},
		});

		for (const name of namesKeys) {
			// @ts-ignore
			vitals[name] = {
				name,
				values: values
					.filter((i) => i.device === device && i.name === name)
					.map((item) => ({
						p75: item.p75,
						p95: item.p95,
						p98: item.p98,
						time: item.end_time,
					})),
			};
		}
	}

	return final;
};
