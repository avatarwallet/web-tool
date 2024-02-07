import { Base64 } from 'js-base64';

export function getHashObject() {
	const hash = window.location.hash.substr(1);

	// Split into an array
	const hashArray = hash.split('&');

	// Convert to object using .reduce()
	const hashObject = hashArray.reduce((acc: any, cur) => {
		const [key, value] = cur.split('=');
		acc[key] = value;
		return acc;
	}, {});

	return hashObject;
}

export function getWindowFeature(): string {
	let windowSize: [number, number];
	let windowPos: [number, number];

	windowSize = [450, 700];
	windowPos = [
		Math.abs(window.screenX + window.innerWidth / 2 - windowSize[0] / 2),
		Math.abs(window.screenY + window.innerHeight / 2 - windowSize[1] / 2),
	];

	const windowFeatures =
		`toolbar=0,location=0,menubar=0,scrollbars=yes,status=yes` +
		`,width=${windowSize[0]},height=${windowSize[1]}` +
		`,left=${windowPos[0]},top=${windowPos[1]}`;
	return windowFeatures;
}

export const getJwtObject = (jwt: string): { [key: string]: string } => {
	const [headerBase64, payloadBase64] = jwt.split('.');
	const headerJson = Base64.decode(headerBase64);
	const header = JSON.parse(headerJson);
	const payloadJson = Base64.decode(payloadBase64);
	const payload = JSON.parse(payloadJson);

	const jwtObject = { ...header, ...payload };

	return jwtObject;
};
