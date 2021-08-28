import type { Metric } from 'metrics';
import { call as callSupabase } from 'supabase';
import type { KV } from 'worktop/kv';
import { read, write } from 'worktop/kv';

declare const METRICS: KV.Namespace;

interface CronReportStatus {
	lastRan: number;
}

interface ReportRow extends Metric {
	key: string;
}

const CRON_REPORT_STATUS_KEY = 'cron::report::status' as const;

const handleEvent = async (event: ScheduledEvent) => {
	let cronTracker = await read<CronReportStatus>(
		METRICS,
		CRON_REPORT_STATUS_KEY,
	);
	if (!cronTracker) cronTracker = { lastRan: 0 };

	const lastRan = new Date(cronTracker.lastRan);

	const lower_bound = lastRan.toUTCString();
	const upper_bound = new Date(event.scheduledTime).toUTCString();

	try {
		const data = (await (
			await callSupabase('POST', '/rpc/get_report', {
				lower_bound,
				upper_bound,
			})
		).json()) as ReportRow[];

		data.forEach(({ key, ...payload }) => {
			event.waitUntil(
				write(METRICS, `site::${key}`, payload, {
					expirationTtl: 2630000, // 1 month
				}),
			);
		});

		cronTracker.lastRan = event.scheduledTime;
		event.waitUntil(write(METRICS, CRON_REPORT_STATUS_KEY, cronTracker));
	} catch (e) {
		console.error(e);
		throw e;
	}
};

addEventListener('scheduled', (event) => {
	event.waitUntil(handleEvent(event));
});
