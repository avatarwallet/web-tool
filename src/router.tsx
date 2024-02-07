import { createBrowserRouter } from 'react-router-dom';
import Home from './page/Home';
import Transport from './page/Transport';

export const router = createBrowserRouter([
	{
		path: '/',

		children: [
			{
				path: '',
				element: <Home />,
			},
			{
				path: 'transport',
				element: <Transport />,
			},
		],
	},
]);
