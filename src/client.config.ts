import { Env } from '@avatarwallet/config';
import { getStore } from './store';

const googleConfig = {
	[Env.development]: {
		clientId:
			'113902308729-9d9orh662fa22qpivtr40b0vllpkupti.apps.googleusercontent.com',
		endPoint: 'https://accounts.google.com/o/oauth2/v2/auth',
		redirectUri: 'http://localhost:5173/transport',
	},
	[Env.production]: {
		clientId:
			'153691426161-pnoadbk6hq1n5ff6seuo10160kqc2anb.apps.googleusercontent.com',
		endPoint: 'https://accounts.google.com/o/oauth2/v2/auth',
		redirectUri: 'http://localhost:5173/transport',
	},
};

export const getGoogleClient = () => googleConfig[getStore().env];

export const WALLET_DEFAULT_PATH =
	'0x0000000000000000000000000000000000000000000000000000000000000000';
