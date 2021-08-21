import { UAParser } from 'ua-parser-js';

export const getDevice = (ua: string) => {
	const { getBrowser, getOS, getDevice } = new UAParser(ua);

	return {
		device: getDevice().type,
		browser: getBrowser().name,
		os: getOS().name,
	};
};
