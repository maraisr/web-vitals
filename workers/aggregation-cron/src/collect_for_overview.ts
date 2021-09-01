import type { OverviewRow_raw } from 'model';
import * as Model from 'model';
import { write_aggregation } from 'model';

export const collect_overview = async (
	lower_bound: string,
	upper_bound: string,
	run_at: number,
) => {
	const data = await Model.get_aggregation_raw(lower_bound, upper_bound);

	const sites: Record<string, OverviewRow_raw[]> = {};

	data.forEach((row) => {
		const site = (sites[row.site] = sites[row.site] || []);

		site.push(row);

		sites[row.site] = site;
	});

	return Promise.all(
		Object.entries(sites).map(([site, values]) =>
			write_aggregation(site, values, run_at),
		),
	);
};
