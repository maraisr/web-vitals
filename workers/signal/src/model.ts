import type { KV } from "worktop/kv";
import { Signal } from "signal";

declare const METRICS: KV.Namespace;

const ns = (str: string) => `site::${str}`;
const makeKey = (...args: string[]) => args.join("::");

export const save_to_supabase = async (site: string, signal: Signal) => (
	await callSupabase("POST", "/metrics", { site, ...signal })
).text();

export const get = async (site: string, name: string) => {

	return (await callSupabase("POST", "/rpc/get_report", {
		lower_bound: "06:25:51",
		upper_bound: "07:11:12",
	})).json();
};
