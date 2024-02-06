import { context, Context, Env, ChainId } from '@avatarwallet/config';
import { ethers } from 'ethers';

export const env = Env.development;

export const chainId = ChainId.BSCTEST;

export const configContext = context[env];

export const chainContext = configContext[chainId];

export const provider = new ethers.JsonRpcProvider(
	chainContext.networks.rpcUrl[0]
);
