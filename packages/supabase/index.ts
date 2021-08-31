import type { Signal } from 'signal';
import type { AggByPathname, OverviewRow } from './types';

declare const SUPABASE_KEY: string;

const call = (method: string, query: string, body?: any) =>
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

export const save_signal = async (site: string, signal: Signal) =>
	(await call('POST', '/metrics', { site, ...signal })).text();

export const get_agg_overview = async (
	lower_bound: string,
	upper_bound: string,
) =>
	(await (
		await call('POST', '/rpc/get_agg_overview', {
			lower_bound,
			upper_bound,
		})
	).json()) as OverviewRow[];

export const get_agg_by_pathname = async (
	lower_bound: string,
	upper_bound: string,
) =>
	(await (
		await call('POST', '/rpc/get_agg_by_pagename', {
			lower_bound,
			upper_bound,
		})
	).json()) as AggByPathname[];
