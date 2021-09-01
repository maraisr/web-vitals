import { namesKeys } from 'metrics';
import type { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import type { DeviceTypes } from 'utils/device';
import { deviceLabel, deviceTypes } from 'utils/device';
import type { OverviewResults } from 'worker-api/types';
import { MetricDisplay } from '../components/MetricDisplay';
import { useByPathname, useOverviewData } from '../data/useApi';

type PNames = 'p75' | 'p95' | 'p98';

export const Site: FunctionComponent<{ params: { site: string } }> = ({
	params,
}) => {
	const [device, setDevice] = useState<DeviceTypes>('desktop');
	const [p, setP] = useState<PNames>('p75');

	const data = useOverviewData(params.site);

	if (!data) return null;

	return (
		<div class="container grid gap-4 mx-auto p-3 lg:p-0 lg:pt-6">
			<div class="flex gap-4">
				<select
					class="border border-gray-200 rounded p-2"
					value={device}
					onInput={(e: any) => setDevice(e.target.value)}
				>
					{deviceTypes.map((name, i) => (
						<option key={i} value={name}>
							{deviceLabel[name]}
						</option>
					))}
				</select>
				<select
					class="border border-gray-200 rounded p-2"
					value={p}
					onInput={(e: any) => setP(e.target.value)}
				>
					<option value="p75">P75</option>
					<option value="p95">P95</option>
					<option value="p98">P98</option>
				</select>
			</div>
			<Overview data={data} device={device} p={p} />
			<Pathanmes site={params.site} device={device} p={p} />
		</div>
	);
};

const Overview: FunctionComponent<{
	data: OverviewResults;
	device: DeviceTypes;
	p: PNames;
}> = ({ data, device, p }) => (
	<div class="w-full grid gap-5 grid-cols-autoFit">
		{namesKeys.map((item) => (
			<MetricDisplay
				key={item}
				name={item}
				values={data[device]?.[item]}
				p={p}
			/>
		))}
	</div>
);

const Pathanmes: FunctionComponent<{
	site: string;
	device: DeviceTypes;
	p: 'p75' | 'p95' | 'p98';
}> = ({ site, device }) => {
	const [data, loadMore] = useByPathname(site);

	if (!data?.length) return null;

	const pageData = data.map((item) => item[device]!);

	return (
		<div>
			{pageData.map((block) => (
				<>
					{block.map((item) => (
						<div key={item.pathname} class="">
							<p>{item.pathname}</p>
						</div>
					))}
				</>
			))}

			<button onClick={loadMore}>load more</button>
		</div>
	);
};
