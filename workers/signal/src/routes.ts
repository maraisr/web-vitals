import { namesKeys } from 'metrics';
import type { Signal, SignalMessage } from 'signal';
import { getDevice } from 'utils/device';
import { validate } from 'utils/validate';
import type { Handler } from 'worktop';
import * as Model from './model';

const site_validator = (val: string) => val.length === 16 && val[0] === 's';

export const put: Handler = async (req, res) => {
	try {
		var body = await req.body<SignalMessage>();
	} catch (e) {
		return new Response('Error parsing input', {
			status: 400,
		});
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

		if (invalid) console.error(JSON.stringify(errors));

		if (invalid)
			// Always say OK — lets not leak our logic
			return res.send(200, 'OK');

		var final: Signal = {
			event_id: id,
			href,
			name,
			value,
			country: req.cf.country ?? 'unknown',
			...getDevice(req.headers.get('User-Agent') || 'unknown'),
		};
	}

	req.extend(Model.save_to_supabase(siteKey, final));

	return res.send(200, 'OK');
};

export const get: Handler<{ site: string }> = async (req, res) => {
	if (!(req.params.site && site_validator(req.params.site)))
		return res.send(433, 'Sorry');

	const { site } = req.params;

	const data = await Model.get(site);

	return res.send(200, { data }, { 'cache-control': 'public,max-age=60' });
};
