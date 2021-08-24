import { getDevice } from 'utils/device';
import { validate } from 'utils/validate';
import type { Handler } from 'worktop';
import { namesKeys } from './conts';
import * as Model from './model';
import { Signal, SignalMessage } from './model';

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
				site: (val) => val.length === 16 && val[0] === 's',
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
			id,
			href,
			name,
			value,
			country: req.cf.country ?? 'unknown',
			...getDevice(req.headers.get('User-Agent') || 'unknown'),
			timestamp: Date.now(),
		};
	}

	// ~ store

	const m = Model.forSite(siteKey);
	req.extend(m.save(final));

	return res.send(200, 'OK');
};
/*

export const get: Handler = async (_req, res) => {
	const m = Model.forSite(site);

	let i = [];
	for await (let item of await m.get("FID")) {
		i.push(item.keys);
	}

	return res.send(200, i);
};
*/
