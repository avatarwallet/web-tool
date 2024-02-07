import _ from 'lodash';
import { BytesLike, ethers, BigNumberish } from 'ethers';
import { ContractFactory } from '@avatarwallet/contract';
import { getChainContext, getRPCProvider } from '../chain.config';
import { JsonRpcProvider } from 'ethers';

export async function initWallet(
	address: string
): Promise<{ isDeployed: boolean; nonce: number }> {
	let isDeployed = false,
		nonce = 0;
	try {
		const result = await getRPCProvider().getCode(address);
		isDeployed = result.toLocaleLowerCase() != '0x';
		const userWalletContract = ContractFactory.userWalletContract({
			contractAddress: address,
			signerOrProvider: getRPCProvider() as any,
		});
		nonce = isDeployed ? Number(await userWalletContract.readNonce(0)) : 0;
	} catch (error) {
		console.log('error', error);
	}

	return { isDeployed, nonce: nonce };
}

export async function PrepareTxs(
	baseWalletImpl: string,
	awtFactoryContratc: string,
	sub: string,
	iss: string,
	path: string,
	txs: any[],
	signature: BytesLike,
	rawNonce: BigNumberish,
	walletAddress: string,
	deloyed: boolean
): Promise<{
	data: string;
	to: string;
	txNonce: bigint;
}> {
	let to, data;
	signature = signature ? signature : '0x';
	to = walletAddress;
	const userWalletContract = ContractFactory.userWalletContract({
		contractAddress: walletAddress,
		signerOrProvider: getRPCProvider() as any,
	});
	const txNonce = deloyed ? await userWalletContract.readNonce(0) : BigInt(0);
	data = _.get(
		await userWalletContract.invoke.populateTransaction(
			txs,
			rawNonce,
			signature
		),
		'data'
	) as string;
	if (!deloyed) {
		to = awtFactoryContratc;
		const awtFacContract = ContractFactory.AvatarFactoryContract({
			contractAddress: to,
			signerOrProvider: getRPCProvider() as any,
		});
		data = _.get(
			await awtFacContract.multiCall.populateTransaction([
				{
					callType: 0,
					revertOnError: true,
					gasLimit: 0,
					target: to,
					value: 0,
					data: _.get(
						await awtFacContract.createWallet.populateTransaction(
							iss,
							sub,
							path,
							baseWalletImpl
						),
						'data'
					) as string,
				},
				{
					callType: 0,
					revertOnError: true,
					gasLimit: 0,
					target: walletAddress,
					value: 0,
					data,
				},
			]),
			'data'
		) as string;
	}

	return { data: data, to: to, txNonce: txNonce };
}
