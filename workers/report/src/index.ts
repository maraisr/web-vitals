import type { Metric } from 'metrics';
import { call as callSupabase } from 'supabase';
import { makeKey } from 'utils/kv';
import type { KV } from 'worktop/kv';
import { read, write } from 'worktop/kv';

declare const METRICS: KV.Namespace;

interface CronReportStatus {
	lastRan: number;
}

interface OverviewRow extends Metric {}

interface AggByPathname extends OverviewRow {
	pathname: string;
	pathname_hash: string;
}

const CRON_REPORT_STATUS_KEY = 'cron::report::status' as const;

const collect_overview = async (
	lower_bound: string,
	upper_bound: string,
	run_at: number,
) => {
	const data = (await (
		await callSupabase('POST', '/rpc/get_agg_overview', {
			lower_bound,
			upper_bound,
		})
	).json()) as OverviewRow[];

	const sites: Record<string, OverviewRow[]> = {};

	data.forEach((row) => {
		const site = (sites[row.site] = sites[row.site] || []);

		site.push(row);

		sites[row.site] = site;
	});

	return Promise.all(
		Object.entries(sites).map(([site, values]) => {
			const key = makeKey('site', site, 'agg', run_at.toString());

			return write(METRICS, key, values, {
				expirationTtl: 2630000, // 1 month
			});
		}),
	);
};

const collect_by_pathname = async (
	lower_bound: string,
	upper_bound: string,
	run_at: number,
) => {
	const data = (await (
		await callSupabase('POST', '/rpc/get_agg_by_pagename', {
			lower_bound,
			upper_bound,
		})
	).json()) as AggByPathname[];

	const sites: Record<string, AggByPathname[]> = {};

	data.forEach((row) => {
		const site = (sites[row.site] = sites[row.site] || []);

		site.push(row);

		sites[row.site] = site;
	});

	return Promise.all(
		Object.entries(sites).map(([site, values]) => {
			const key = makeKey('site', site, 'pathnames', run_at.toString());

			return write(METRICS, key, values, {
				expirationTtl: 604800, // 1 week
			});
		}),
	);
};

const handleEvent = async (event: ScheduledEvent) => {
	let cronTracker = await read<CronReportStatus>(
		METRICS,
		CRON_REPORT_STATUS_KEY,
	);
	if (!cronTracker)
		cronTracker = { lastRan: new Date('Mon, 25 Aug 2021').getTime() };

	const lastRan = new Date(cronTracker.lastRan);

	const lower_bound = lastRan.toUTCString();
	const upper_bound = new Date(event.scheduledTime).toUTCString();

	try {
		await Promise.all([
			collect_overview(lower_bound, upper_bound, event.scheduledTime),
			collect_by_pathname(lower_bound, upper_bound, event.scheduledTime),
		]);

		cronTracker.lastRan = event.scheduledTime;
		event.waitUntil(write(METRICS, CRON_REPORT_STATUS_KEY, cronTracker));
	} catch (e) {
		console.log(e);
		throw e;
	}
};

addEventListener('scheduled', (event) => {
	event.waitUntil(handleEvent(event));
});

addEventListener('fetch', (event) => {
	event.scheduledTime = Date.now();
	event.waitUntil(handleEvent(event));
	event.respondWith(new Response('test'));
});
