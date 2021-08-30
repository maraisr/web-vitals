import { Router } from 'worktop';
import { listen } from 'worktop/cache';
import { preflight } from 'worktop/cors';
import * as Routes from './routes';

const API = new Router();

API.prepare = preflight({
	maxage: 3600,
});

/*API.add('GET', '/clear', async (req, res) => {
	const items = await list(METRICS, {
		limit: 1000,
	});

	for await (const { keys } of items) {
		keys.forEach(key => {
			req.extend(remove(METRICS, key));
		})
	}

	res.send(200, 'yay');
});*/

/*API.add("GET", "/signal", async (req, res) => {
	res.send(200, await (await call("POST", "/rpc/get_agg_by_pagename", {
		lower_bound: new Date("Mon, 25 Aug 2021").getTime(),
		upper_bound: new Date().getTime(),
	})).json());
});*/

API.add('GET', '/overview/:site', Routes.get);
API.add('POST', '/signal', Routes.put);

listen(API.run);
