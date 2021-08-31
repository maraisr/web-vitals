import * as Model from 'model';
import { AggByPathname_raw } from 'model';

export const collect_by_pathname = async (
	lower_bound: string,
	upper_bound: string,
	run_at: number,
) => {
	const data = await Model.get_by_pathname_raw(lower_bound, upper_bound);

	const sites: Record<string, AggByPathname_raw[]> = {};

	data.forEach((row) => {
		const site = (sites[row.site] = sites[row.site] || []);

		site.push(row);

		sites[row.site] = site;
	});

	return Promise.all(
		Object.entries(sites).map(([site, values]) =>
			Model.write_by_pathname(site, values, run_at),
		),
	);
};
