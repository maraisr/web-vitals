import type { Signal } from "signal";
import { call as callSupabase } from "supabase";

export const save_to_supabase = async (site: string, signal: Signal) => (
	await callSupabase("POST", "/metrics", { site, ...signal })
).text();
