import { parse } from '@lukeed/ms';
import type { Metric } from 'metrics';
import { makeKey } from 'utils/kv';
import type { KV } from 'worktop/kv';
import { paginate, read, write } from 'worktop/kv';

export { save_signal } from 'supabase';

declare const METRICS: KV.Namespace;

export type Aggregation = Metric[];
export type AggregationItem = Aggregation[number];

export type ByPathname = (Metric & {
	pathname: string;
	pathnameHash: string;
})[];
export type ByPathnameItem = ByPathname[number];

export type CronReportStatus = { lastRan: number };

export type SiteConfig = { host: string };

const CRON_REPORT_STATUS_KEY = makeKey('cron', 'report', 'status');
export const get_cron_status = () =>
	read<CronReportStatus>(METRICS, CRON_REPORT_STATUS_KEY, {
		type: 'json',
		cacheTtl: 0,
	});
export const update_cron_stats = (updated: CronReportStatus) =>
	write(METRICS, CRON_REPORT_STATUS_KEY, updated);

/**
 * Get's you a sites config object
 */
export const get_site_config = (site: string) =>
	read<SiteConfig>(METRICS, makeKey('site', site, 'config'), {
		cacheTtl: parse('1 hours')!,
		type: 'json',
	});

/**
 * Checks if a site is valid
 */
export const valid_site = async (site: string) => {
	const siteObject = await get_site_config(site);

	return siteObject ? siteObject : null;
};

/**
 * Get's the sites aggregation of stats
 */
export const get_aggregation = async (site: string, limit = 10) => {
	const keys = await paginate(METRICS, {
		limit,
		prefix: makeKey('site', site, 'agg'),
	});

	return (
		await Promise.all(
			keys.map((key) =>
				read<Aggregation>(METRICS, key, {
					cacheTtl: parse('15 min')!,
					type: 'json',
				}),
			),
		)
	)
		.flat()
		.filter(Boolean) as Aggregation;
};

/**
 * Get's a sites aggregation by grouped by pathname
 */
export const get_by_pathname = async (site: string, limit = 10, page = 0) => {
	const keys = await paginate(METRICS, {
		limit,
		page,
		prefix: makeKey('site', site, 'pathnames'),
	});

	return (
		await Promise.all(
			keys.map((key) =>
				read<ByPathname>(METRICS, key, {
					cacheTtl: parse('15 min')!,
					type: 'json',
				}),
			),
		)
	)
		.flat()
		.filter(Boolean) as ByPathname;
};
