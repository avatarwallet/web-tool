import { ChainId, Env } from '@avatarwallet/config';
import { create } from 'zustand';

export const useStore = create<{
	chainId: ChainId;
	env: Env;
	setChainId: (chainId: ChainId) => void;
	setEnv: (env: Env) => void;
}>((set) => ({
	chainId: ChainId.POLYGON,
	env: Env.development,
	setChainId: (chainId: ChainId) => set(() => ({ chainId })),
	setEnv: (env: Env) => set(() => ({ env, chainId: ChainId.POLYGON })),
}));

export const getStore = () => useStore.getState();
