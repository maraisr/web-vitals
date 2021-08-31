import { namesKeys } from 'metrics';
import type { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import type { DeviceTypes } from 'utils/device';
import { deviceLabel, deviceTypes } from 'utils/device';
import type { OverviewResults } from 'worker-signal/types';
import { MetricDisplay } from '../components/MetricDisplay';
import { useOverviewData } from '../data/useApi';

export const Site: FunctionComponent<{ params: { site: string } }> = ({
	params,
}) => {
	const data = useOverviewData(params.site);

	if (!data) return <p>loading...</p>;

	return <Overview data={data} />;
};

const Overview: FunctionComponent<{ data: OverviewResults }> = ({ data }) => {
	const [device, setDevice] = useState<DeviceTypes>('desktop');
	const [p, setP] = useState<'p75' | 'p95' | 'p98'>('p75');

	return (
		<div class="container mx-auto p-3 md:p0">
			<div class="flex gap-4 py-4">
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
		</div>
	);
};
