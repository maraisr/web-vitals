import { Device } from 'utils/device';

export interface SignalMessage {
	site: string;
	id: string;
	href: string;
	name: string;
	value: string;
}

export interface Signal
	extends Omit<SignalMessage, 'site' | 'id' | 'href'>,
		Device {
	hostname: string;
	pathname: string;
	event_id: string;
	country: string;
}
