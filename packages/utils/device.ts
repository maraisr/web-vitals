import { UAParser } from "ua-parser-js";

export type Device = {
	device: string
	browser: string;
	os: string;
}

export const getDevice = (ua: string): Device => {
	const { getBrowser, getOS, getDevice } = new UAParser(ua);

	return {
		device: getDevice().type ?? 'unknown',
		browser: getBrowser().name ?? 'unknown',
		os: getOS().name ?? 'unknown',
	};
};
