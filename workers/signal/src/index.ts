import { Router } from 'worktop';
import { listen } from 'worktop/cache';
import { preflight } from 'worktop/cors';
import * as Routes from './routes';

const API = new Router();

API.prepare = preflight({
	maxage: 3600,
});

API.add('GET', '/overview/:site', Routes.get_overview);
API.add('POST', '/signal', Routes.save_signal);

listen(API.run);
