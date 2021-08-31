import * as Model from 'model';
import { AggByPathname_raw } from 'model';

export const collect_by_pathname = async (
	lower_bound: string,
	upper_bound: string,
	_run_at: number,
) => {
	const data = await Model.get_by_pathname_raw(lower_bound, upper_bound);

	const sites: Record<string, AggByPathname_raw[]> = {};

	data.forEach((row) => {
		const site = (sites[row.site] = sites[row.site] || []);

		site.push(row);

		sites[row.site] = site;
	});

	let reqs = [];
	for (const [site, items] of Object.entries(sites)) {
		for (const pathname of items) {
			reqs.push(
				Model.get_pathname_item(site, pathname.pathname_hash).then(
					(i) => ({
						site,
						pathnameObject: pathname,
						item: i,
					}),
				),
			);
		}
	}

	const pathnameResolved = await Promise.all(reqs);

	reqs = [];
	for (const item of pathnameResolved) {
		if (!item.item)
			item.item = {
				pathname: item.pathnameObject.pathname,
				pathname_hash: item.pathnameObject.pathname_hash,
				values: [],
			};

		item.item.values.push(item.pathnameObject);

		if (item.item.values.length > 24) item.item.values.shift();

		reqs.push(Model.write_by_pathname(item.site, item.item));
	}

	return Promise.all(reqs);
};
