import tinydate from 'tinydate';

const time = tinydate('{HH}:{mm}:{ss}');

addEventListener("scheduled", (event) => {
	const lastRan = new Date('KV TIME'); // GET FROM KV

	const lowerBound = time(lastRan);
	const upperBound = time(new Date(event.scheduledTime));

	// store in KV event.scheduledTime

	// call supabase
});
