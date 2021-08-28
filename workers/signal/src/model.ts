import type { Metric } from 'metrics';
import { MetricNames, names, namesKeys } from 'metrics';
import type { Signal } from 'signal';
import { call as callSupabase } from 'supabase';
import type { DeviceTypes } from 'utils/device';
import { deviceTypes } from 'utils/device';
import { makeKey } from 'utils/kv';
import type { KV } from 'worktop/kv';
import { paginate, read } from 'worktop/kv';

declare const METRICS: KV.Namespace;

type ReportData = {
	[device in DeviceTypes]: {
		name: string;
		vitals: Partial<
			Record<
				MetricNames,
				{
					name: string;
					title: string;
					values: Metric[];
				}
			>
		>;
	};
};

export const save_to_supabase = async (site: string, signal: Signal) =>
	(await callSupabase('POST', '/metrics', { site, ...signal })).text();

export const get = async (site: string) => {
	const raw_data: Promise<Metric | null>[] = [];

	for (const device of deviceTypes) {
		const keys = await paginate(METRICS, {
			limit: 30,
			prefix: makeKey('site', site, device),
		});

		keys.forEach((key) => {
			raw_data.push(read<Metric>(METRICS, key));
		});
	}

	const results = (await Promise.all(raw_data)).filter(Boolean) as Metric[];
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
				title: names[name],
				values: results
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
