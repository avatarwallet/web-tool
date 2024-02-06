import { useEffect, useState } from 'react';
import './App.css';
import {
	AwtWebSDK,
	AwtAccount,
	WalletConfig,
	getNonceHashByTxs,
	encodeNonce,
} from '@avatarwallet/web-sdk';
import { env, chainId, chainContext, provider } from './chain.config';
import { PrepareTxs, initWallet } from './util';
import { Erc20__factory } from '@avatarwallet/contract';
import { ethers } from 'ethers';

const awtWeb: AwtWebSDK = new AwtWebSDK({
	env: env,
	defaultNetworkId: chainId,
});

function App() {
	const [account, setAccount] = useState<AwtAccount | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [txId, setTxId] = useState<string>('');
	const [tokenAddress, setTokenAddress] = useState<string>('');
	const [tokenAmount, setTokenAmount] = useState<string>('');
	const [receiveAddress, setReceiveAddress] = useState<string>('');

	const connect = async () => {
		try {
			const ac = await awtWeb.connect({
				logo: '',
				name: 'demo',
			});
			ac;
			if (ac) {
				setAccount(ac);
			}

			console.log('account', ac);
		} catch (error) {
			console.log('connect error', error);
		}
	};
	const disconnect = async () => {
		try {
			awtWeb.disconnect();
			setAccount(null);
		} catch (error) {
			console.log('disconnect error', error);
		}
	};

	const sendTx = async () => {
		try {
			if (isLoading) return;
			setIsLoading(true);
			if (
				!ethers.isAddress(receiveAddress) ||
				!ethers.isAddress(tokenAddress)
			) {
				alert('Please enter the ETH address');
				return;
			}
			const address = account?.address as string;
			const sub = account?.sub as string;
			const iss = account?.iss as string;
			const path = account?.walletPath as string;

			const walletStatu = await initWallet(address as string);

			const erc20Contract = Erc20__factory.connect(
				tokenAddress,
				provider as any
			);
			const decimals = await erc20Contract.decimals();
			const calldata =
				Erc20__factory.createInterface().encodeFunctionData(
					'transfer',
					[
						receiveAddress,
						Number(tokenAmount) * 10 ** Number(decimals),
					]
				);

			const txs = [
				{
					callType: '0',
					revertOnError: false,
					gasLimit: '0',
					target: tokenAddress,
					value: '0',
					data: calldata,
				},
			];
			const [nonceHash, metaHash] = getNonceHashByTxs({
				address: address,
				txs: txs,
				spaceNumber: 0,
				spaceNonce: walletStatu.nonce,
				chainId,
			});
			const signature = await awtWeb.signTransaction(nonceHash);

			const txParams = await PrepareTxs(
				chainContext.contracts.baseWalletImpl,
				chainContext.contracts.avatarFactory,
				sub,
				iss,
				path,
				txs,
				signature,
				encodeNonce(0, walletStatu.nonce),
				address,
				walletStatu.isDeployed
			);
			const ethereum = new ethers.BrowserProvider(window.ethereum);
			const signer = await ethereum.getSigner();
			const network = await ethereum.getNetwork();
			if (Number(network.chainId) !== chainId) {
				await ethereum.send('wallet_switchEthereumChain', [
					{ chainId: `0x${chainId.toString(16)}` },
				]);
			}
			const tx = await signer.sendTransaction({
				to: txParams.to,
				data: txParams.data,
			});
			setTxId(tx.hash);
		} catch (error) {
			console.log('sendTx error', error);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		const _isConnected = awtWeb.isConnected();
		setIsConnected(_isConnected);
	}, [account]);

	useEffect(() => {
		const _account = awtWeb.getAccount();
		setAccount(_account || null);
	}, []);

	return (
		<>
			<div className="">
				<div>
					<h1>Avatarwallet Web Tool</h1>
					<div className="">isConnected :{String(isConnected)}</div>
					<div className="">
						Address :{account?.address} <br />
						Avatar wallet chainId :
						{awtWeb.getWalletConfig().defaultNetworkId} <br />
					</div>
					<br />
					<br />
					{isConnected ? (
						<button onClick={disconnect}>disconnect</button>
					) : (
						<button onClick={connect}>connect wallet</button>
					)}
					<br />
					<br />
					<input
						type="text"
						style={{ width: '500px' }}
						placeholder="Token address"
						value={tokenAddress}
						onChange={(e) => setTokenAddress(e.target.value)}
					/>
					<br />
					<br />
					<input
						type="text"
						style={{ width: '500px' }}
						placeholder="Token amount"
						value={tokenAmount}
						onChange={(e) => setTokenAmount(e.target.value)}
					/>
					<br />
					<br />
					<input
						type="text"
						style={{ width: '500px' }}
						placeholder="ReceiveAddress"
						value={receiveAddress}
						onChange={(e) => setReceiveAddress(e.target.value)}
					/>
					<br />
					<button onClick={sendTx}>Send{isLoading && '...'} </button>
					<br />
					{txId && (
						<span>
							txId:
							<br />
							{txId}
						</span>
					)}
				</div>
			</div>
		</>
	);
}

export default App;
