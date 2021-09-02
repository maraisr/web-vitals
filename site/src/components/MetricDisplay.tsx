import type { MetricNames } from 'metrics';
import { get_score, guage, names, rounders, suffix } from 'metrics';
import type { FunctionComponent } from 'preact';
import type { VitalItem } from 'worker-api/types';
import { Spline } from './Spline';

const score_to_class_text = (score: ReturnType<typeof get_score>) => {
	if (score === 'pass') return 'text-[#4caf50]';
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

export const MetricDisplay: FunctionComponent<{
	name: MetricNames;
	values?: VitalItem[];
	p: 'p75' | 'p95' | 'p98';
}> = ({ name, values, p }) => {
	const has_data = Array.isArray(values) && values.length > 0;

	const score_value = has_data ? values[0][p] : null;
	const score_label = has_data ? rounders[name](score_value!) : '—';

	const score = has_data ? get_score(name, score_value!) : 'unknown';

	const guage_min_max = guage[name];

	return (
		<section class="p-6 rounded-xl border border-gray-100 bg-white">
			<header>
				<h2 class="font-semibold mb-3">{names[name]}</h2>
				<span class={`${score_to_class_text(score)} text-2xl`}>
					{score_label}
					<span class="pl-2 text-gray-400 text-xs font-light">
						{suffix[name]}
					</span>
				</span>
			</header>
			<main class={`${score_to_class_text(score)} mt-5`}>
				{has_data ? (
					<Spline
						points={values.map((i) => ({ point: i[p], info: i }))}
						max={guage_min_max[1]}
						min={guage_min_max[0]}
					/>
				) : null}
			</main>
		</section>
	);
};
