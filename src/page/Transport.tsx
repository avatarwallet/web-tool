import { useEffect } from 'react';
import { getHashObject } from '../util';

function Transport() {
	useEffect(() => {
		const hashObject = getHashObject();
		const time = +new Date();
		const message = {
			data: { jwt: hashObject?.id_token },
		};
		window.opener.postMessage(message, '*');
		if (window.opener) {
			window.close();
		}
	}, []);
	return <div className=""></div>;
}

export default Transport;
