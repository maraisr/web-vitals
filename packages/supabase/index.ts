import type { Signal } from 'signal';

declare const SUPABASE_KEY: string;

export const call = (method: string, query: string, body?: any) =>
	fetch(`https://hazsbhjshrlvqnwgvttd.supabase.in/rest/v1${query}`, {
		method,
		body: body ? JSON.stringify(body) : undefined,
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			apikey: SUPABASE_KEY,
			Authorization: `Nearer ${SUPABASE_KEY}`,
		},
	});

/**
 * Saves the signal into the database
 */
export const save_signal = async (site: string, signal: Signal) =>
	(await call('POST', '/metrics', { site, ...signal })).text();
