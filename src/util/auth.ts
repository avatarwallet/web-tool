import { WALLET_DEFAULT_PATH, getGoogleClient } from '../client.config';
import { getChainContext } from '../chain.config';
import buffer from 'buffer';
import { getCreate2Address, keccak256, solidityPacked, AbiCoder } from 'ethers';
import { Base64 } from 'js-base64';
import { getJwtObject, getWindowFeature } from '../util';
import { ChainId } from '@avatarwallet/config';

export const genOAuthURI = ({
	nonce,
	operate,
}: {
	nonce: string;
	operate: 'login' | 'sign';
}): string => {
	const isLogin = operate === 'login';
	const { clientId, endPoint, redirectUri } = getGoogleClient();

	const params: Record<string, string> = {
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'id_token',
		state: operate,
		nonce,
		scope: isLogin ? 'email' : 'openid',
		prompt: isLogin ? 'select_account' : '',
	};

	let oauth2Endpoint: string = endPoint + '?';
	let p = '';
	for (const i in params) {
		p += `${i}=${params[i]}&`;
	}
	oauth2Endpoint += p;

	return oauth2Endpoint;
};

function allowPop(callback: () => void = () => {}) {
	const divEle = document.createElement('div');
	const divJson = `
		<div class="awt-allow-pop" 
			style="
				box-sizing: border-box;
				position: fixed;
				width: 330px;
				height: 208px;
				right: 20px;
				top: 87px;
				z-index: 99999;
				padding: 10px;
				background: linear-gradient(
					247.74deg,
					#1e1f51 1.32%,
					#25262f 58.76%,
					#3d2e4f 98.06%
				);
				border-radius: 8px;"
		>
		<div class="awt-logo"
			style="
			width: 100px;
			height: 22px;"
		>
			<img
				style="
				width: 100%;
				height: 100%;"
				src="https://app.avatarwallet.io/assets/logo@2x-e974e361.png"
				alt="awt"
			/>
		</div>
		<div class="awt-content"
			style="
				padding: 6px 17px;
				line-height: 20px;
				font-size: 14px;
				color: #e7eaf2;
				text-align: center;"
		>
			<div class="awt-content-title"
				style="
				font-weight: 600;"
			>Request Pop-up</div>
			<div class="awt-content-body"
				style="
					margin: 8px 0 14px 0;
					font-weight: 400;
					color: #bfc2ca;"
			>
				Tap "Approve" to launch the wallet and complete the
				transaction.
			</div>
			<div class="awt-allow-button"
				style="
					width: 100%;
					text-align: center;
					height: 36px;
					line-height: 36px;
					background: linear-gradient(
						91.36deg,
						#eb5eaa 1.09%,
						#6456ff 60.55%,
						#386cfc 103.98%
					);
					font-weight: 400;
					border-radius: 49px;
					color: #ffffff;
					cursor: pointer;"
			>Approve</div>
			<a
				class="awt-desc"
				href="https://docs.avatarwallet.io/docs/faq/Allow-automatic-wallet-pop-up"
				target="_blank"
				style="
					margin-top: 14px;
					display: block;
					height: 20px;
					background: linear-gradient(
						91.36deg,
						#eb5eaa 1.09%,
						#a95ddc 47.39%,
						#386cfc 100%
					);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
					text-fill-color: transparent;"
			>
				Allow automatic wallet pop-up
			</a>
		</div>
		</div>
		`;
	divEle.innerHTML = divJson;
	document.body.appendChild(divEle);
	const allowButton =
		document.querySelector<HTMLDivElement>('.awt-allow-button');
	return new Promise((resolve) => {
		allowButton?.addEventListener(
			'click',
			function () {
				document.body.removeChild(divEle);
				resolve(callback());
			},
			false
		);
	});
}

export function openWindow(url: string): Promise<string> {
	return new Promise(async (resolve, reject) => {
		const eventHander = (event: MessageEvent) => {
			const { jwt } = event?.data?.data || {};
			if (!jwt) {
				return;
			}
			resolve(jwt);
			closeWindow();
		};

		const authPopup = window.open(url, 'OAuth_window', getWindowFeature());

		if (!authPopup) {
			const callback = () => openWindow(url);
			return await allowPop(callback);
		}

		window.addEventListener('message', eventHander);

		const inter = window.setInterval(() => {
			if (authPopup && authPopup.closed) {
				window.clearInterval(inter);
				setTimeout(() => reject('User reject'), 333);
			}
		}, 666);

		const closeWindow = () => {
			window.removeEventListener('message', eventHander);
			if (authPopup && !authPopup.closed) {
				authPopup.close();
			}
		};
	});
}

export async function requestOAuth(operate: 'login' | 'sign', nonce?: string) {
	const uri = genOAuthURI({ nonce: nonce || 'random', operate });

	const jwt = await openWindow(uri);
	const jwtRecord = getJwtObject(jwt);
	const sub = `"sub":"${jwtRecord?.sub}"`;
	const iss = `"iss":"${jwtRecord?.iss}"`;
	const signature = parseSignFromJWT(jwt, WALLET_DEFAULT_PATH);
	const contracts = getChainContext().contracts;
	const address = getUserAddress({
		sub,
		iss,
		path: WALLET_DEFAULT_PATH,
		erc2470Factory: contracts.erc2470Factory,
		baseWalletImpl: contracts.baseWalletImpl,
	});
	return {
		signature,
		address,
		sub,
		iss,
		email: jwtRecord?.email,
		path: WALLET_DEFAULT_PATH,
	};
}

export const getUserAddress = ({
	sub,
	iss,
	path,
	erc2470Factory,
	baseWalletImpl,
}: {
	sub: string;
	iss: string;
	path: string;
	erc2470Factory: string;
	baseWalletImpl: string;
}): string => {
	const _salt = keccak256(
		solidityPacked(['string', 'string', 'bytes32'], [iss, sub, path])
	);
	const createCode = buffer.Buffer.from(
		'603a600e3d39601a805130553df3363d3d373d3d3d363d30545af43d82803e903d91601857fd5bf3',
		'hex'
	);
	const codeHash = keccak256(
		solidityPacked(['bytes', 'uint256'], [createCode, baseWalletImpl])
	);
	return getCreate2Address(erc2470Factory, _salt, codeHash);
};

export const parseSignFromJWT = (jwt: string, path: string) => {
	if (!jwt) {
		return;
	}
	const [headerBase64, payloadBase64, signatureBase64] = jwt.split('.');
	const header = buffer.Buffer.from(headerBase64, 'base64').toString();
	const headerJson = JSON.parse(header);
	const payloadJson = Base64.decode(payloadBase64);
	const sig = buffer.Buffer.from(
		buffer.Buffer.from(signatureBase64, 'base64').toString('hex'),
		'hex'
	);
	const sigLen = sig.length;
	const payload = JSON.parse(payloadJson);
	const audStart = payloadJson.indexOf('"aud":"');
	const audLen = payload.aud.length;
	const issStart = payloadJson.indexOf('"iss":"');
	const issLen = payload.iss.length;
	const nonceStart = payloadJson.indexOf('"nonce":"');
	const subStart = payloadJson.indexOf('"sub":"');
	const subLen = payload.sub.length;
	const tuple = [
		'uint16',
		'string',
		'uint16',
		'bytes',
		'uint16',
		'string',
		'uint16',
		'uint16',
		'uint16',
		'uint16',
		'uint16',
		'uint16',
		'uint16',
		'uint16',
		'uint16',
		'bytes32',
	];

	const parameter = [
		payloadBase64.length,
		payloadBase64,
		sigLen,
		sig,
		headerBase64.length,
		headerBase64,
		header.indexOf('"kid"'),
		headerJson.kid.length + 8,
		issStart,
		issLen + 8,
		audStart,
		audLen + 8,
		subStart,
		subLen + 8,
		nonceStart,
		path,
	];

	let userSig = solidityPacked(tuple, parameter);
	userSig = solidityPacked(['uint8', 'bytes', 'bytes'], [1, userSig, '0xff']);

	return userSig;
};

export function subDigest(
	hash: string,
	chainId: number,
	userWalletAddress: string,
	sigVersion: number
): string {
	const mid = solidityPacked(
		['bytes2', 'uint256', 'address', 'uint32', 'bytes'],
		['0x1901', chainId, userWalletAddress, sigVersion, hash]
	);
	return keccak256(mid);
}

export function encodeNonce(space: number, nonce: number): number {
	return Number(nonce) + Number(space) * 2 ** 96;
}

export function hashNonceOrder(
	address: string,
	txs: any[],
	rawNonce: number,
	chainId: ChainId
): string {
	const MetaTransactionsType = `tuple(
    bool delegateCall,
    bool revertOnError,
    uint256 gasLimit,
    address target,
    uint256 value,
    bytes data
  )[]`;
	let orderBytes = AbiCoder.defaultAbiCoder().encode(
		[MetaTransactionsType, 'uint256'],
		[txs, rawNonce]
	);
	let orderHash = keccak256(orderBytes);
	return subDigest(orderHash, chainId, address, 1);
}

export function getNonceHash(
	address: string,
	txs: any,
	spaceNumber = 0,
	spaceNonce = 0,
	chainId: ChainId
) {
	const rawNonce = encodeNonce(spaceNumber, spaceNonce);

	const metaHash: string = hashNonceOrder(address, txs, rawNonce, chainId);

	const hexNonce = buffer.Buffer.from(metaHash.slice(2), 'hex');
	let nonceHash: string = Base64.fromUint8Array(hexNonce, true);
	if (nonceHash.slice(-1) === '=') {
		nonceHash = nonceHash.slice(0, -1);
	}
	if (nonceHash.slice(-1) === '==') {
		nonceHash = nonceHash.slice(0, -2);
	}
	return [nonceHash, metaHash];
}
