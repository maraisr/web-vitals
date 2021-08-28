import tinydate from 'tinydate';

const time = tinydate('{HH}:{mm}:{ss}');


/*

export const get = async (site: string, name: string) => {

	return (await callSupabase("POST", "/rpc/get_report", {
		lower_bound: "06:25:51",
		upper_bound: "07:11:12",
	})).json();
};
*/

addEventListener("scheduled", (event) => {
	const lastRan = new Date('KV TIME'); // GET FROM KV

	const lowerBound = time(lastRan);
	const upperBound = time(new Date(event.scheduledTime));

	// store in KV event.scheduledTime

	// call supabase
});
