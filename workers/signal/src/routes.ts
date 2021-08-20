import { getDevice } from 'utils/device';
import type { Handler } from 'worktop';
import * as Model from './model';

const site = 'test';

export const put: Handler = async (req, res) => {
	const m = Model.forSite(site);

	await m.save({
		id: 'v2-test-id',
		name: 'FID',
		value: '83',
		href: 'http://localhost:8080',
		timestamp: Date.now(),
	});

	return res.send(200, getDevice(req.headers.get('User-Agent') || 'unknown'));
};

export const get: Handler = async (req, res) => {
	const m = Model.forSite(site);

	let i = [];
	for await (let item of await m.get('FID')) {
		i.push(item.keys);
	}

	return res.send(200, i);
};
