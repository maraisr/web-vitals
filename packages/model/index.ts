import { parse } from '@lukeed/ms';
import type { Metric } from 'metrics';
import { makeKey } from 'utils/kv';
import type { KV } from 'worktop/kv';
import { paginate, read, write } from 'worktop/kv';

export {
	save_signal,
	get_agg_by_pathname as get_by_pathname_raw,
	get_agg_overview as get_aggregation_raw,
} from 'supabase';

export type {
	OverviewRow as OverviewRow_raw,
	AggByPathname as AggByPathname_raw,
} from 'supabase/types';

declare const METRICS: KV.Namespace;

export type Aggregation = Metric[];
export type AggregationItem = Aggregation[number];

export interface ByPathnameItem {
	pathname: string;
	pathname_hash: string;
	values: Metric[];
}
export type ByPathname = ByPathnameItem[];

export type CronReportStatus = { lastRan: number };

export type SiteConfig = { host: string };

const CRON_REPORT_STATUS_KEY = makeKey('cron', 'report', 'status');
export const get_cron_status = () =>
	read<CronReportStatus>(METRICS, CRON_REPORT_STATUS_KEY);
export const update_cron_status = (updated: CronReportStatus) =>
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
 * Writes an aggregation to the store
 */
export const write_aggregation = async (
	site: string,
	value: Aggregation,
	run_at: number,
) => {
	const key = makeKey('site', site, 'agg', run_at.toString());

	return write(METRICS, key, value, {
		expirationTtl: parse('1 month')!,
	});
};

/**
 * Get's a sites aggregation by grouped by pathname
 */
export const get_by_pathname = async (site: string, page = 1, limit = 10) => {
	const keys = await paginate(METRICS, {
		limit,
		page,
		prefix: makeKey('site', site, 'pathnames'),
	});

	return (
		await Promise.all(keys.map((key) => read<ByPathnameItem>(METRICS, key)))
	)
		.flat()
		.filter(Boolean) as ByPathname;
};

/**
 * Get's an by pathname individual item
 */
export const get_pathname_item = async (
	site: string,
	pathname_hash: string,
) => {
	const key = makeKey('site', site, 'pathnames', pathname_hash);
	return read<ByPathnameItem>(METRICS, key);
};

/**
 * Writes an updated sites pathname slice to the store
 */
export const write_by_pathname = async (
	site: string,
	value: ByPathnameItem,
) => {
	const key = makeKey('site', site, 'pathnames', value.pathname_hash);

	return write(METRICS, key, value, {
		expirationTtl: parse('1 month')!,
	});
};
