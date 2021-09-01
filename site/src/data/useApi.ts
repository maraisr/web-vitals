import { useCallback, useMemo } from 'preact/compat';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { ByPathnameResults, OverviewResults } from 'worker-api/types';

const base = 'https://vitals.htm.io';

const fetcher = (url: string) => fetch(base + url).then((res) => res.json());

export const useOverviewData = (site: string) =>
	useSWR<{ data: OverviewResults }>(`/overview/${site}`, fetcher, {
		refreshInterval: 60e3,
	}).data?.data;

export const useByPathname = (site: string) => {
	const getKey = useMemo(
		() =>
			(
				pageIndex: number,
				previousPageData: { data: ByPathnameResults } | null,
			) => {
				if (
					previousPageData &&
					!Object.keys(previousPageData.data).length
				)
					return null;
				return `/by_pathname/${site}?page=${pageIndex + 1}`;
			},
		[site],
	);

	const { data, setSize, size } = useSWRInfinite<{ data: ByPathnameResults }>(
		getKey,
		fetcher,
	);

	const loadMore = useCallback(() => {
		setSize(size + 1);
	}, [size, setSize]);

	return [data?.map((item) => item.data) || [], loadMore] as const;
};
