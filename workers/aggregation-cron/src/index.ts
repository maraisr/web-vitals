import * as Model from 'model';
import { collect_overview } from './collect_for_overview';
import { collect_by_pathname } from './collect_for_pathname';

const inception = new Date('Mon, 25 Aug 2021').getTime();

const handleEvent = async (event: ScheduledEvent) => {
	let cronTracker = await Model.get_cron_status();
	if (!cronTracker) cronTracker = { lastRan: inception };

	const lastRan = new Date(cronTracker.lastRan);

	const lower_bound = lastRan.toUTCString();
	const upper_bound = new Date(event.scheduledTime).toUTCString();

	try {
		await Promise.all([
			collect_overview(lower_bound, upper_bound, event.scheduledTime),
			collect_by_pathname(lower_bound, upper_bound, event.scheduledTime),
		]);

		cronTracker.lastRan = event.scheduledTime;
		event.waitUntil(Model.update_cron_status(cronTracker));
	} catch (e) {
		console.log(e);
		throw e;
	}
};

addEventListener('scheduled', (event) => {
	event.waitUntil(handleEvent(event));
});
