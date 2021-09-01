import useSWR from 'swr';
import { OverviewResults } from 'worker-api/types';

const base = 'https://vitals.htm.io';

const fetcher = (url: string) => fetch(base + url).then((res) => res.json());

export const useApi = <T>(uri: string) =>
	useSWR<T>(uri, fetcher, {
		refreshInterval: 60e3,
	});

export const useOverviewData = (site: string) =>
	useApi<{ data: OverviewResults }>(`/overview/${site}`).data?.data;
