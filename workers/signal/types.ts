import type { MetricNames } from 'metrics';
import type { AggregationItem } from 'model';
import type { DeviceTypes } from 'utils/device';

export type OverviewResultsVitalItem = Omit<
	AggregationItem,
	'site' | 'end_time' | 'name' | 'device'
> & { time: AggregationItem['end_time'] };

export type OverviewResults = Partial<
	Record<
		DeviceTypes,
		Partial<Record<MetricNames, OverviewResultsVitalItem[]>>
	>
>;
