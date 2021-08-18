import {UAParser} from 'ua-parser-js';

type ErrorMessages<R> = { [K in keyof R]?: string };
type Validator<T> = (value: any, input: T) => string | boolean;
type Validity<R> = { invalid: boolean; errors: ErrorMessages<R> };
export function validate<
	T extends Record<string, any>,
	R extends Record<string, Validator<T>>,
>(input: T, rules: R): Validity<R> {
	let tmp, invalid = false;
	let errors: ErrorMessages<R> = {};
	for (let key in rules) {
		tmp = rules[key](input[key], input);
		if (tmp !== true) {
			errors[key] = tmp || 'Required';
			invalid = true;
		}
	}
	return { invalid, errors };
}

export const getDevice = (ua: string) => {
	const {getBrowser, getOS, getDevice} = new UAParser(ua);
	
	return {
		device: getDevice().type,
		browser: getBrowser().name,
		os: getOS().name
	}
};