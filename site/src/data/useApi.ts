import useSWR from 'swr';

const base = 'https://vitals.htm.io';

const fetcher = (url: string) => fetch(base + url).then((res) => res.json());

export const useApi = <T>(uri: string) =>
	useSWR<T>(uri, fetcher, {
		refreshInterval: 60e3,
	});
