import { useEffect, useState } from 'react';
import './App.css';
import {
	AwtWebSDK,
	Env,
	AwtAccount,
	createRandom,
	recoverWallet,
	getUserAddressByLocal,
	signTxByLocal,
	AwtTransaction,
	WalletCrypto,
} from '@avatarwallet/web-sdk';
import { ethers, Wallet } from 'ethers';
import {
	context,
	Env as ContextEnv,
	RelayerConfig,
} from '@avatarwallet/config';
import { parseError } from '@avatarwallet/cross-platform-tools';

const awtWeb: AwtWebSDK = new AwtWebSDK({ env: Env.local });

let tgWallet: Wallet;

const KEY = 'demo-key';
const PASSWORD = '123456';
const chainId = 11155111;
const provider = new ethers.JsonRpcProvider(
	'https://ethereum-sepolia.blockpi.network/v1/rpc/public'
);
const devContext = context[ContextEnv.development];
const sepoliaConfig: RelayerConfig = devContext[chainId];

const salt =
	'0xb25165d8d83d96960019512ded4c12a03b27696c5c911eb9ae92049d1c2bc5b8';

const param: WalletCrypto = { storageKey: KEY, password: PASSWORD, provider };

const testTxs: AwtTransaction[] = [
	{
		callType: '0',
		revertOnError: false,
		gasLimit: '0',
		target: '0xd69065448EE1A17886846d48Be67e36701a573Ad',
		value: '10000',
		data: '0x',
	},
];

function App() {
	const [account, setAccount] = useState<AwtAccount | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [tgAddress, setTgAddress] = useState<string>('');
	const [eoaAddress, setEoaAddress] = useState<string>('');
	const connect = async () => {
		try {
			const ac = await awtWeb.connect({
				logo: '',
				name: 'demo',
			});
			if (ac) {
				setAccount(ac);
			}
			console.log('account', ac);
		} catch (error) {
			console.log('connect error', error);
		}
	};
	const signMessage = async () => {
		try {
			console.log(awtWeb.getAccount());
			const sign = await awtWeb.signMessage('123');
			console.log('sign', sign);
		} catch (error) {
			console.log('signMessage error', error);
		}
	};
	const sendTx = async () => {
		try {
			const sign = await awtWeb.sendTransaction([
				{
					callType: '0',
					revertOnError: false,
					gasLimit: '0',
					target: '0xd69065448EE1A17886846d48Be67e36701a573Ad',
					value: '0',
					data: '0x',
				},
			]);
			console.log('sendTx', sign);
		} catch (error) {
			console.log('sendTx error', error);
		}
	};

	// 	const add = () => {
	// 		const divHTML = document.createElement('div');

	// 		let innerHtml = `
	// <div class="awt-allow-pop"
	// 	style="
	// 		box-sizing: border-box;
	// 		position: fixed;
	// 		width: 330px;
	// 		height: 208px;
	// 		right: 20px;
	// 		top: 87px;
	// 		z-index: 99999;
	// 		padding: 10px;
	// 		background: linear-gradient(
	// 			247.74deg,
	// 			#1e1f51 1.32%,
	// 			#25262f 58.76%,
	// 			#3d2e4f 98.06%
	// 		);
	// 		border-radius: 8px;"
	// >
	// <div class="awt-logo"
	// 	style="
	// 	width: 100px;
	// 	height: 22px;"
	// >
	// 	<img
	// 		style="
	// 		width: 100%;
	// 		height: 100%;"
	// 		src="https://www.avatarwallet.io/assets/logo@2x-e974e361.png"
	// 		alt="awt"
	// 	/>
	// </div>
	// <div class="awt-content"
	// 	style="
	// 		padding: 6px 17px;
	// 		line-height: 20px;
	// 		font-size: 14px;
	// 		color: #e7eaf2;
	// 		text-align: center;"
	// >
	// 	<div class="awt-content-title"
	// 		style="
	// 		font-weight: 600;"
	// 	>Request Pop-up</div>
	// 	<div class="awt-content-body"
	// 		style="
	// 			margin: 8px 0 14px 0;
	// 			font-weight: 400;
	// 			color: #bfc2ca;"
	// 	>
	// 		Tap "Approve" to launch the wallet and complete the
	// 		transaction.
	// 	</div>
	// 	<div class="awt-allow-button"
	// 		style="
	// 			width: 100%;
	// 			text-align: center;
	// 			height: 36px;
	// 			line-height: 36px;
	// 			background: linear-gradient(
	// 				91.36deg,
	// 				#eb5eaa 1.09%,
	// 				#6456ff 60.55%,
	// 				#386cfc 103.98%
	// 			);
	// 			font-weight: 400;
	// 			border-radius: 49px;
	// 			color: #ffffff;
	// 			cursor: pointer;"
	// 	>Approve</div>
	// 	<a
	// 		class="awt-desc"
	// 		href="https://docs.avatarwallet.io/docs/faq/Allow-automatic-wallet-pop-up"
	// 		target="_blank"
	// 		style="
	// 			margin-top: 14px;
	// 			display: block;
	// 			height: 20px;
	// 			background: linear-gradient(
	// 				91.36deg,
	// 				#eb5eaa 1.09%,
	// 				#a95ddc 47.39%,
	// 				#386cfc 100%
	// 			);
	// 			-webkit-background-clip: text;
	// 			-webkit-text-fill-color: transparent;
	// 			background-clip: text;
	// 			text-fill-color: transparent;"
	// 	>
	// 		Allow automatic wallet pop-up
	// 	</a>
	// </div>
	// </div>
	// `;
	// 		divHTML.innerHTML = innerHtml;
	// 		document.body.appendChild(divHTML);
	// 	};
	const tgWalletSendTx = async () => {
		try {
			const sign = await fetch('/rpc/minimal/relayer/feeOptions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					chainId,
					address: eoaAddress,
					salt,
					txs: testTxs,
					spaceNum: '0',
					data: '',
				}),
			});
			const body = await sign.json();
			const feeData = body?.data;
			const message = body?.message;
			if (!feeData && message && message.startsWith('0x')) {
				let _error = parseError(message);
				_error =
					typeof _error === 'string'
						? _error
						: _error?._reason || _error?.errName;
				console.log('_error', _error);
				return;
			}
			const value = feeData?.list[0]?.value.mid;
			const { spaceNum, nonce } = feeData?.nonceInfo || {};
			const txs: AwtTransaction[] = [
				{
					callType: '0',
					revertOnError: true,
					gasLimit: '0',
					target: sepoliaConfig.contracts.refundAddress,
					value: value,
					data: '0x',
				},
				...testTxs,
			];
			console.log('txs', txs, spaceNum, nonce, tgWallet, chainId);
			const tgWalletLocalSign = await signTxByLocal({
				space: Number(spaceNum),
				nonce: Number(nonce),
				signer: tgWallet,
				txs,
				chainId,
				walletAddress: tgAddress,
			});
			console.log('tgWalletLocalSign', tgWalletLocalSign);
			const txResultJson = await fetch('/rpc/minimal/relayer/invoke', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					nonce,
					spaceNum,
					address: eoaAddress,
					salt,
					signature: tgWalletLocalSign,
					txs,
					chainId,
					speedRate: 1.3,
				}),
			});
			const txResult = await txResultJson.json();

			const _message = txResult.message;

			console.log('txResult', _message);
		} catch (error) {
			console.log('tgWalletSendTx error', error);
		}
	};
	const initTgWallet = async () => {
		try {
			let wallet = recoverWallet(param);
			if (!wallet) {
				wallet = createRandom(param) as Wallet;
			}
			tgWallet = wallet as Wallet;
			const _eoaAddress = wallet?.address as string;
			console.log('_eoaAddress', _eoaAddress);
			const _tgAddress = getUserAddressByLocal(
				_eoaAddress,
				salt,
				sepoliaConfig.contracts.erc2470Factory,
				sepoliaConfig.contracts.tgBaseWalletImpl
			);
			setEoaAddress(_eoaAddress);
			setTgAddress(_tgAddress);
		} catch (error) {
			console.log('initTgWallet', error);
		}
	};
	useEffect(() => {
		const isCon = awtWeb.isConnected();
		setIsConnected(isCon);
		initTgWallet();
	}, [account]);
	return (
		<>
			<div className="">
				<div>
					<h1>web sdk</h1>
					<div className="">isConnected :{String(isConnected)}</div>
					<div className="">
						address :{account?.address} <br />
						email :{account?.email} <br />
						loginType :{account?.loginType} <br />
					</div>
					<br />
					<br />
					<div className="" onClick={connect}>
						connect
					</div>
					<div className="" onClick={signMessage}>
						signMessage
					</div>
					<div className="" onClick={sendTx}>
						sendTx
					</div>
				</div>
				<h2>tg wallet function</h2>
				<h5>tgEoaAddress:{eoaAddress}</h5>
				<h5>tgWalletAddress:{tgAddress}</h5>
				<h5 onClick={tgWalletSendTx}>Send tg Tx</h5>
			</div>
		</>
	);
}

export default App;
