import { Device } from 'utils/device';

export interface SignalMessage {
	site: string;
	id: string; // <= 30
	href: string;
	name: string; // in the allowed values
	value: string; // <= 99999999999999
}

export interface Signal extends Omit<SignalMessage, 'site' | 'id'>, Device {
	event_id: string;
	country: string;
}
