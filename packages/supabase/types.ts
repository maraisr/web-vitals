import type { Metric } from 'metrics';

export type OverviewRow = Metric;

export interface AggByPathname extends OverviewRow {
	pathname: string;
	pathname_hash: string;
}
