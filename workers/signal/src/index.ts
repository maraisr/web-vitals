import { listen, Router } from 'worktop';
import * as Routes from './routes';

const API = new Router();

API.add('POST', '/signal', Routes.put);

listen(API.run);
