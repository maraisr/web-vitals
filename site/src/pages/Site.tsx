import {
	get_score,
	guage,
	MetricNames,
	names,
	namesKeys,
	rounders,
	suffix,
} from 'metrics';
import type { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import type { DeviceTypes } from 'utils/device';
import { deviceLabel, deviceTypes } from 'utils/device';
import type {
	OverviewResults,
	OverviewResultsVitalItem,
} from 'worker-signal/types';
import { Spline } from '../components/Spline';
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

const score_to_class_text = (score: ReturnType<typeof get_score>) => {
	if (score === 'pass') return 'text-[#43a047]';
	if (score === 'average') return 'text-yellow-500';
	if (score === 'unknown') return '';

	return 'text-red-500';
};

const score_to_class_background = (score: ReturnType<typeof get_score>) => {
	if (score === 'pass') return 'bg-green-100';
	if (score === 'average') return 'bg-yellow-100';
	if (score === 'unknown') return '';

	return 'bg-red-100';
};

const MetricDisplay: FunctionComponent<{
	name: MetricNames;
	values?: OverviewResultsVitalItem[];
	p: 'p75' | 'p95' | 'p98';
}> = ({ name, values, p }) => {
	const has_data = Array.isArray(values) && values.length > 0;

	const score_value = has_data ? values[0][p] : null;
	const score_label = has_data ? rounders[name](score_value!) : '—';

	const score = has_data ? get_score(name, score_value!) : 'unknown';

	const guage_min_max = guage[name];

	return (
		<section class="p-6 rounded border border-gray-100 shadow-sm bg-white">
			<header>
				<h2 class="font-semibold mb-3">{names[name]}</h2>
				<span class={`${score_to_class_text(score)} text-2xl`}>
					{score_label}
					<span class="pl-2 text-gray-400 text-xs font-light">
						{suffix[name]}
					</span>
				</span>
			</header>
			<main
				class={`${score_to_class_text(
					score,
				)} ${score_to_class_background(score)} mt-5`}
			>
				{has_data ? (
					<Spline
						stepping
						points={values.map((i) => ({ point: i[p], info: i }))}
						max={guage_min_max[1]}
						min={guage_min_max[0]}
					/>
				) : null}
			</main>
		</section>
	);
};
