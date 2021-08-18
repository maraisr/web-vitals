import {Router} from 'worktop';
import {listen} from 'worktop/cache';

import {getDevice, validate} from './utils';

interface Signal {
    id: string,
    href: string,
    name: string,
    value: string,
}

const required = (val: string) => val.length > 0 || 'Required';

function toError(res: ServerResponse, status: number, reason: string) {
	return res.send(status, { status, reason });
}

const API = new Router();

API.add('POST', '/signal', async (req, res) => {
    try {
        var body = await req.body<Signal>();
    } catch(e) {
        return toError(res, 400, 'Error parsing input');
    }

    let { id, href, name, value } = body || {};
	id = String(id||'').trim();
	href = String(href||'').trim();
	name = String(name||'').trim();
    value = String(value||'').trim();

    let { errors, invalid } = validate({
		id, href, name, value
	}, {
		id: required,
        href: required,
        name: required,
        value: required
	});

	if (invalid) return res.send(422, errors);

    const final = {
        id, href, name, value,
        country: req.cf.country,
        ...getDevice(req.headers.get("User-Agent") || "unknown"),
        timestamp: Date.now()
    }

    console.log(JSON.stringify(final, null, 4));

    res.send(200, 'yay');
});

const worker_module = {
    // @ts-ignore
    fetch(req, env, ctx) {
        let event = { ...ctx, request: req } as FetchEvent;
        for (let key in env) {
            // @ts-ignore
            globalThis[key] != null || Object.assign(globalThis, env);
            break;
        }

        return API.run(event);
    }
}

export default worker_module;