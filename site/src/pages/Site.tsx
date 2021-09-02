import { get_score, names, namesKeys, rounders, suffix } from 'metrics';
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
		<div class="container grid gap-10 mx-auto p-3 lg:p-0 lg:pt-6">
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
}> = ({ site, device, p }) => {
	const [data, loadMore] = useByPathname(site);

	if (!data?.length) return null;

	const pageData = data.map((item) => item[device]!);

	return (
		<div class="flex gap-3 flex-col">
			<h3 class="text-md font-semibold">Paths</h3>

			<div class="flex gap-3 flex-col">
				{pageData.map((block) => (
					<>
						{block.map((item) => (
							<div
								key={item.pathname}
								class="p-4 rounded-xl border border-gray-100 bg-white"
							>
								<div class="grid grid-cols-6 justify-items-end items-center">
									<span class="justify-self-start font-mono rounded py-1 px-2 bg-gray-100">
										{item.pathname}
									</span>

									{namesKeys.map((name) => {
										const values = item[name];

										const has_data =
											Array.isArray(values) &&
											values.length > 0;

										const score_value = has_data
											? values[0][p]
											: null;
										const score_label = has_data
											? rounders[name](score_value!)
											: '—';

										return (
											<div
												key={name}
												class="flex flex-col"
											>
												<span>{name}</span>
												<span>
													{score_label}
													{suffix[name]}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</>
				))}
			</div>

			<button onClick={loadMore}>load more</button>
		</div>
	);
};
