import navaid from 'navaid';
import type { VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Site } from '../pages/Site';

export const App = () => {
	const [Route, setRoute] = useState<VNode | null>(null);

	useEffect(() => {
		const router = navaid('/', () => {
			setRoute(<p>Not found</p>);
		});

		router.on<{ site: string }>('/:site', (params) => {
			if (!params?.site) return;

			setRoute(<Site params={params} />);
		});

		router.listen();
	}, []);

	return Route || null;
};
