import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { AwtWebSDK, Env, AwtAccount } from '@avatarwallet/web-sdk';

const awtWeb: AwtWebSDK = new AwtWebSDK({ env: Env.local });

function App() {
	const [account, setAccount] = useState<AwtAccount | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const connect = async () => {
		try {
			const ac = await awtWeb.connect({
				appLogo: '',
				appName: 'demo',
				appWebsite: window.location.origin,
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
			const sign = await awtWeb.signMessage('123');
			console.log('sign', sign);
		} catch (error) {
			console.log('signMessage error', error);
		}
	};
	const sendTx = async () => {
		try {
			const sign = await awtWeb.sendTx({
				callType: '0',
				revertOnError: false,
				gasLimit: '0',
				target: account,
				value: '0',
				data: calldata,
			});
			console.log('sendTx', sign);
		} catch (error) {
			console.log('sendTx error', error);
		}
	};
	useEffect(() => {
		const isCon = awtWeb.isConnected();
		setIsConnected(isCon);
		console.log('isConnected', isCon);
	}, [account]);
	return (
		<>
			<div>
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
			<h1>Vite + React</h1>
		</>
	);
}

export default App;
