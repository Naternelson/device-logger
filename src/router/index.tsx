import { createBrowserRouter } from 'react-router-dom';
import { HomePage, OrdersPage, ProductPage, RootLayout, SettingsPage } from '../pages';
import { db, getProductSettings, getUserSettings } from '../database';
import { Sounds } from '../pages/sounds';
import { NewOrderDialogForm } from '../pages/orders/NewOrderForm';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: "orders",
				element: <OrdersPage />,
				children: [{
					path: "new",
					element: <NewOrderDialogForm />
				
				}]
			},
			{
				path: 'settings',
				element: <SettingsPage />,
				"loader": async () => {
					return await getUserSettings(db);
				}
			},
			{
				path: "products",
				element: <ProductPage/>,
				loader: async () => {
					return getProductSettings(db)
				}
			},
			{
				path: "dev",
				element: <Sounds/>
			},
			{
				path: '*',
				element: <div>Not Found</div>,
			},
			{},
		],
		// errorElement: (
		// 	<div>
		// 		<button onClick={() => reset()}>Reset</button>
		// 		<button onClick={() => window.location.reload()}>Reload</button>
		// 	</div>
		// ),
	},
]);
