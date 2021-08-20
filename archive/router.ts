import { parse } from 'regexparam';
import { isCacheable } from 'worktop/cache';
import { body } from './utils';

export function Router() {
	const $ = {} as {
		add: (method: string, path: string, handler: any) => typeof $;
		run: ModuleWorker.FetchHandler;
	};

	const dict = {} as any;

	$.add = (method, path, handler) => {
		let d = dict[method];

		if (d === void 0) d = dict[method] = new Map();

		const { keys, pattern } = parse(path);
		d.set(pattern, { keys, handler });

		return $;
	};

	$.run = async (req, env, ctx) => {
		let isHEAD = typeof req !== 'string' && req.method === 'HEAD';
		const isGET = typeof req === 'string' || req.method === 'GET';

		if (isHEAD) req = new Request(req, { method: 'GET' });

		let res = await caches.default.match(req);

		if (isHEAD && res) return new Response(null, res);

		if (res) return res;

		let handle;
		if ((handle = dict[req.method])) {
			const { pathname } = new URL(req.url);
			for (let [rgx, { handler }] of handle) {
				if (rgx.test(pathname)) {
					const reqObj = {
						raw: req,
						body: body.bind(
							0,
							req,
							req.headers.get('content-type'),
						),
					};
					res = await handler(reqObj, env, ctx);
					//if (isGET && isCacheable(res!)) ctx.waitUntil(caches.default.put(req, res!.clone()))
					return res;
				}
			}
		}

		return new Response('Not Found', {
			status: 404,
		});
	};

	return $;
}
