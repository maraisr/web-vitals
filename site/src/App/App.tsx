import navaid from 'navaid';
import type { VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Site } from '../pages/Site';

export const App = () => {
	const [Route, setRoute] = useState<VNode | null>(null);

	useEffect(() => {
		const router = navaid();

		router.on<{ site: string }>('/:site', (params) => {
			if (!params?.site) return;

			setRoute(<Site params={params} />);
		});

		router.listen();
	}, []);

	return Route ?? <p>Not found</p>;
};
