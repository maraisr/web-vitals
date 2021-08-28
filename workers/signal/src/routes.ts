import { namesKeys } from 'metrics';
import type { Signal, SignalMessage } from 'signal';
import { getDevice } from 'utils/device';
import { validate } from 'utils/validate';
import type { Handler } from 'worktop';
import type { ServerResponse } from 'worktop/response';
import * as Model from './model';

const site_validator = (val: string) => val.length === 16 && val[0] === 's';

const conveniently_fail = (res: ServerResponse, code: number, body: any) => {
	console.log({ code, body });

	// Always say OK — lets not leak our logic
	return res.send(200, 'OK', { 'cache-control': 'private,max-age=10' });
};

export const put: Handler = async (req, res) => {
	try {
		var body = await req.body<SignalMessage>();
	} catch (e) {
		return conveniently_fail(res, 400, 'Error parsing input');
	}

	let siteKey;

	{
		let { id, href, name, value, site } = body || {};
		site = siteKey = String(site || '').trim();
		id = String(id || '').trim();
		href = String(href || '').trim();
		name = String(name || '').trim();
		value = String(value || '').trim();

		let { errors, invalid } = validate(
			{
				site,
				id,
				href,
				name,
				value,
			},
			{
				site: site_validator,
				id: (val) => val.length <= 30 && val.length > 2,
				href: (val) => val.length > 0,
				name: (val) => namesKeys.includes(val),
				value: (val) => parseFloat(val) <= 9999,
			},
		);

		if (invalid) return conveniently_fail(res, 422, { errors });

		let siteObject = await Model.valid_site(site);
		if (siteObject === null)
			return conveniently_fail(res, 404, {
				errors: [`site ${site} not found`],
			});

		const { pathname, hostname } = new URL(href);

		if (siteObject.host !== hostname)
			return conveniently_fail(res, 422, {
				errors: [
					{
						site,
						expected: siteObject.host,
						got: hostname,
					},
				],
			});

		var final: Signal = {
			event_id: id,
			hostname,
			pathname,
			name,
			value,
			country: req.cf.country ?? 'unknown',
			...getDevice(req.headers.get('User-Agent') || 'unknown'),
		};
	}

	req.extend(Model.save(siteKey, final));

	return res.send(200, 'OK');
};

export const get: Handler<{ site: string }> = async (req, res) => {
	if (!(req.params.site && site_validator(req.params.site)))
		return res.send(
			200,
			{ data: {} },
			{ 'cache-control': 'public,max-age=300' },
		);

	const { site } = req.params;

	const data = await Model.get(site);

	return res.send(200, { data }, { 'cache-control': 'public,max-age=30' });
};
