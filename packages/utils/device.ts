import type { IDevice } from 'ua-parser-js';
import { UAParser } from 'ua-parser-js';

export type Device = {
	device: string;
	browser: string;
	os: string;
};

export const deviceTypes = ['mobile', 'tablet', 'desktop'] as const;
export const deviceLabel: Record<DeviceTypes, string> = {
	mobile: 'Mobile',
	tablet: 'Tablet',
	desktop: 'Desktop',
};

export type DeviceTypes = typeof deviceTypes[number];

const getType = (device: IDevice) => {
	const { type } = device;

	switch (type) {
		case 'mobile':
		case 'wearable':
		case 'embedded':
			return 'mobile';

		case 'tablet':
			return 'tablet';

		case 'console':
		case 'smarttv':
		default:
			return 'desktop';
	}
};

export const getDevice = (ua: string): Device => {
	const { getBrowser, getOS, getDevice } = new UAParser(ua);

	return {
		device: getType(getDevice()),
		browser: getBrowser().name ?? 'unknown',
		os: getOS().name ?? 'unknown',
	};
};
