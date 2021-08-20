import { Router } from './router';
import { getDevice, validate } from './utils';

export { Metrics } from './objects';

const API = Router();

interface Signal {
	id: string;
	href: string;
	name: string;
	value: string;
}

const required = (val: string) => val.length > 0 || 'Required';

API.add('GET', '/test', async (_, env) => {
	const metrics = env.METRICS as DurableObjectNamespace;

	const id = metrics.idFromName('localhost');
	const obj = metrics.get(id);

	return obj.fetch('/list');
});

API.add('POST', '/signal', async ({ raw: req, body: bodyFn }, env, ctx) => {
	const metrics = env.METRICS as DurableObjectNamespace;
	try {
		var body = await bodyFn<Signal>();
	} catch (e) {
		return new Response('Error parsing input', {
			status: 400,
		});
	}

	{
		let { id, href, name, value } = body || {};
		id = String(id || '').trim();
		href = String(href || '').trim();
		name = String(name || '').trim();
		value = String(value || '').trim();

		let { errors, invalid } = validate(
			{
				id,
				href,
				name,
				value,
			},
			{
				id: required,
				href: required,
				name: required,
				value: required,
			},
		);

		if (invalid)
			return new Response(JSON.stringify(errors), {
				status: 422,
				headers: {
					'content-type': 'application/json',
				},
			});

		var final = {
			id,
			href,
			name,
			value,
			country: req.cf.country,
			...getDevice(req.headers.get('User-Agent') || 'unknown'),
			timestamp: Date.now(),
		};
	}

	// ~ store

	const url = new URL(final.href);

	const id = metrics.idFromName(url.hostname);
	const obj = metrics.get(id);

	return obj.fetch('/put_metric', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(final),
	});

	//ctx.waitUntil();

	return new Response('yay', {
		status: 200,
	});
});

export default {
	fetch: API.run,
} as ModuleWorker<{ METRICS: DurableObjectNamespace }>;
