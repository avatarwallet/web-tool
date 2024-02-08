import { useEffect, useState } from 'react';
import {
	getChainContext,
	getConfigContext,
	getRPCProvider,
	getActiveChain,
	setRPCProvider,
} from '../chain.config';
import {
	PrepareTxs,
	initWallet,
	encodeNonce,
	genOAuthURI,
	getNonceHash,
	requestOAuth,
} from '../util';
import { Erc20__factory } from '@avatarwallet/contract';
import { ethers } from 'ethers';
import { useStore } from '../store';
import { Env, context } from '@avatarwallet/config';
import { parseError } from '@avatarwallet/cross-platform-tools';

type TokenType = 'native' | 'erc20';

function Home() {
	const [account, setAccount] = useState<any>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [txId, setTxId] = useState<string>('');
	const [tokenAddress, setTokenAddress] = useState<string>('');
	const [tokenAmount, setTokenAmount] = useState<string>('');
	const [receiveAddress, setReceiveAddress] = useState<string>('');
	const [tokenType, setTokenType] = useState<TokenType>('native');

	const [chainId, setChainId, env, setEnv] = useStore((state) => [
		state.chainId,
		state.setChainId,
		state.env,
		state.setEnv,
	]);
	const connect = async () => {
		try {
			const ac = await requestOAuth('login');
			if (ac) {
				setAccount(ac);
			}
		} catch (error) {
			console.log('connect error', error);
		}
	};
	const disconnect = async () => {
		try {
			setAccount(null);
		} catch (error) {
			console.log('disconnect error', error);
		}
	};
	const sendTx = async () => {
		try {
			if (isLoading) return;
			setIsLoading(true);
			const isSendNativeToken = tokenType === 'native';
			if (
				!ethers.isAddress(receiveAddress) ||
				(!isSendNativeToken && !ethers.isAddress(tokenAddress))
			) {
				alert('Please enter the ETH address');
				return;
			}
			const address = account?.address as string;
			const sub = account?.sub as string;
			const iss = account?.iss as string;
			const path = account?.path as string;

			const walletStatu = await initWallet(address as string);
			let calldata, target, value;

			if (isSendNativeToken) {
				calldata = '0x';
				target = receiveAddress;
				value = ethers.parseEther(tokenAmount);
			} else {
				const erc20Contract = Erc20__factory.connect(
					tokenAddress,
					getRPCProvider() as any
				);
				const decimals = await erc20Contract.decimals();
				calldata = Erc20__factory.createInterface().encodeFunctionData(
					'transfer',
					[
						receiveAddress,
						String(Number(tokenAmount) * 10 ** Number(decimals)),
					]
				);
				target = tokenAddress;
				value = '0';
			}

			const txs = [
				{
					callType: '0',
					revertOnError: false,
					gasLimit: '0',
					target,
					value,
					data: calldata,
				},
			];

			const [nonceHash, metaHash] = getNonceHash(
				address,
				txs,
				0,
				walletStatu.nonce,
				chainId
			);
			const res = await requestOAuth('sign', nonceHash);
			if (
				res.address.toLowerCase() !==
				(account?.address || '').toLowerCase()
			) {
				throw new Error('Google account mismatch!');
			}
			const contracts = getChainContext().contracts;
			const txParams = await PrepareTxs(
				contracts.baseWalletImpl,
				contracts.avatarFactory,
				sub,
				iss,
				path,
				txs,
				res.signature as any,
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
			console.log(tx);
			setTxId(tx.hash);
		} catch (error: any) {
			let errReason;
			const errorData = error?.data;
			if (typeof errorData === 'string' && errorData.startsWith('0x')) {
				const _error = parseError(errorData);
				errReason =
					typeof _error === 'string'
						? _error
						: _error?._reason || _error?.errName;
			} else {
				errReason = error?.message;
			}
			errReason && alert(errReason);
		}
		setIsLoading(false);
	};
	useEffect(() => {
		env && setRPCProvider(getActiveChain());
	}, [env]);
	return (
		<>
			<div className="">
				<div>
					<h1>Avatarwallet Web Tool</h1>
					<h3 className="">Current env:{env}</h3>
					<h3 className="">Current selected chainId:{chainId}</h3>

					<br />
					<label htmlFor="env-select">Choose a env:</label>

					<select
						name="pets"
						id="env-select"
						value={env}
						onChange={(e) => {
							setEnv(e.target.value as Env);
							disconnect();
						}}
					>
						<option value={Env.development}>
							{Env.development}
						</option>
						<option value={Env.production}>{Env.production}</option>
					</select>
					<br />
					<label htmlFor="pet-select">Choose a chain:</label>

					<select
						name="pets"
						id="pet-select"
						value={chainId}
						onChange={(e) => {
							setChainId(Number(e.target.value));
						}}
					>
						{getActiveChain().map((network) => {
							return (
								<option
									value={network}
									key={network}
								>{`${context[env][network]?.networks?.name} `}</option>
							);
						})}
					</select>

					<br />
					<h3 className="">
						AvatarWalletAddress :{account?.address} <br />
						<br />
					</h3>
					{account ? (
						<button onClick={disconnect}>
							Disconnect AvatarWallet
						</button>
					) : (
						<button onClick={connect}>
							Connect AvatarWallet with Google{' '}
						</button>
					)}
					<br />
					<br />
					<label htmlFor="token-select">
						Choose the type of tokens sent:
					</label>
					<select
						name="pets"
						id="token-select"
						value={tokenType}
						onChange={(e) =>
							setTokenType(e.target.value as TokenType)
						}
					>
						<option value="native"> Native token</option>
						<option value="erc20"> ERC20 token</option>
					</select>
					<br />
					{tokenType === 'erc20' && (
						<>
							<br />
							<input
								type="text"
								style={{ width: '500px' }}
								placeholder="ERC20 Token address"
								value={tokenAddress}
								onChange={(e) =>
									setTokenAddress(e.target.value)
								}
							/>
						</>
					)}
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
					<button onClick={sendTx}>
						Send token with MetaMask {isLoading && '...'}{' '}
					</button>
					<br />
					{txId && (
						<span>
							txId:
							<br />
							<a
								href={`${context[env][chainId]?.networks?.blockBrowseUrl}/tx/${txId}`}
								target="_blank"
							>
								{txId}
							</a>
						</span>
					)}
				</div>
			</div>
		</>
	);
}

export default Home;
