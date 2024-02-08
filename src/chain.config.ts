import { context, Context, Env, ChainId } from '@avatarwallet/config';
import { ethers } from 'ethers';
import { getStore } from './store';

export const getConfigContext = () => context[getStore().env];

export const getChainContext = () => getConfigContext()[getStore().chainId];

const providers: {
	[key: string]: ethers.JsonRpcProvider;
} = {};

export const setRPCProvider = async (chainIds: ChainId[]) => {
	chainIds.forEach((chainId) => {
		const rpc = getConfigContext()[chainId].networks.rpcUrl.find(
			(v) =>
				!/((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g.test(
					v
				)
		);
		if (rpc) {
			const currentProvider = new ethers.JsonRpcProvider(rpc);
			providers[chainId] = currentProvider;
		}
	});
};

export const getRPCProvider = (chainId?: ChainId) => {
	const _chainId = chainId || (getStore().chainId as ChainId);
	return providers[_chainId];
};

export const getActiveChain = () =>
	Object.keys(getConfigContext())
		.map((k) => Number(k))
		.filter((key) => {
			if (
				key > 0 &&
				!getConfigContext()[key as ChainId]?.disabled &&
				key !== ChainId.CYOU
			) {
				return true;
			}
		}) as ChainId[];
