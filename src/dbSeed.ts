import { Order, OrderStatus, Product, db } from './db';

export const seed = async () => {
	console.log('Seeding...');

	const products: Product[] = Array(3).fill(0).map((_, i) => {
		return {
			productId: `product${i}`,
			name: `Product ${i}`,
			requiresUdi: Math.random() > 0.5,
			timestamp: new Date(),
		};
	});
	const orders: Order[] = Array(3).fill(0).map((_, i) => ({
		orderId: `order${i}`,
		status: OrderStatus.Active,
		quantity: Math.floor(Math.random() * 100),
		created: new Date(),
		productId: products[i].productId,
		timestamp: new Date(),
	}));
    
	await db.transaction('rw', db.products, db.orders, async () => {
		await Promise.all(
			products.map(async (product) => {
				return db.products.add(product);
			}),
		);
		await Promise.all(
			orders.map(async (order) => {
				return db.orders.add(order);
			}),
		);
		// await db.products.bulkAdd(products);
	});
};
