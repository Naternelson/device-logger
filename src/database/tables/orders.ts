import { AppDb, DatabaseError, Order, getActiveCase, useActiveCaseSub } from '..';
import { cleanString, useLiveData } from '../util';

const sanitizeOrder = (order: Order): Order => {
	return {
		...order,
		orderId: cleanString(order.orderId),
		productId: cleanString(order.productId),
	};
};

const validateTypes = (order: Order) => {
	/**
	 * Order ID should be a string, no more than 255 characters
	 * Product ID should be a string, no more than 255 characters
	 * Due on should be a date or null
	 * If Due on is a date, it should be after the ordered on date
	 * Ordered on should be a date
	 * Quantity should be a positive integer
	 **/
	const { orderId, productId, dueOn, orderedOn, quantity } = order;
	if (typeof orderId !== 'string' || orderId.length > 255) {
		throw new Error(DatabaseError.INVALID_ORDER_ID);
	}
	if (typeof productId !== 'string' || productId.length > 255) {
		throw new Error(DatabaseError.INVALID_PRODUCT_ID);
	}
	if (dueOn && !(dueOn instanceof Date)) {
		throw new Error(DatabaseError.INVALID_DUE_ON);
	}
	if (dueOn && !(dueOn > orderedOn)) {
		throw new Error(DatabaseError.INVALID_DUE_ON);
	}
	if (!(orderedOn instanceof Date)) {
		throw new Error(DatabaseError.INVALID_ORDERED_ON);
	}
	if (typeof quantity !== 'number' || quantity < 1) {
		throw new Error(DatabaseError.INVALID_QUANTITY);
	}
};

export const validateOrderIdUniqueness = async (db: AppDb, orderId: string) => {
	const order = await db.orders.where('orderId').equals(orderId).first();
	if (order) {
		throw new Error(DatabaseError.ORDER_ALREADY_EXISTS);
	}
};

export const validateOrder = async (db: AppDb, order: Order, ignoreUnique?: boolean) => {
	validateTypes(order);
	if (ignoreUnique) return;
	await validateOrderIdUniqueness(db, order.orderId);
};

export const isOrderValid = async (db: AppDb, order: Order) => {
	try {
		await validateOrder(db, order);
		return true;
	} catch (_e) {
		return false;
	}
};

export type OrderCreation = Partial<Order> & { orderId: string; productId: string; quantity: number; orderedOn: Date };

export const createOrder = async (db: AppDb, order: OrderCreation) => {
	const newOrder = sanitizeOrder({
		dueOn: null,
		complete: false,
		...order,
		createdOn: new Date(),
		updatedOn: new Date(),
		deletedOn: false,
	});
	await validateOrder(db, newOrder);
	return db.orders.put(newOrder);
};

export const modifyOrder = async (db: AppDb, orderId: string, order: Partial<Order>) => {
	return db.transaction('rw', db.orders, async () => {
		const existingOrder = await db.orders.where('orderId').equals(orderId).first();
		if (!existingOrder) {
			throw new Error(DatabaseError.ORDER_NOT_FOUND);
		}
		const updatedOrder = sanitizeOrder({
			...existingOrder,
			...order,
			updatedOn: new Date(),
		});
		await validateOrder(db, updatedOrder, true);
		return db.orders.where('orderId').equals(orderId).modify(updatedOrder);
	});
};

export const deleteOrder = async (db: AppDb, orderId: string, options?: { permanent?: boolean }) => {
	const { permanent } = options || {};
	if (permanent) {
		return db.orders.where('orderId').equals(orderId).delete();
	}
	return db.orders.where('orderId').equals(orderId).modify({ deletedOn: new Date() });
};

export const restoreOrder = async (db: AppDb, orderId: string) => {
	return db.orders
		.where('orderId')
		.equals(orderId)
		.modify({ deletedOn: null })
		.catch((_error) => {
			throw new Error(DatabaseError.ORDER_NOT_FOUND);
		});
};

export const getOrder = async (db: AppDb, orderId: string) => {
	return await db.orders
		.where('orderId')
		.equals(orderId)
		.filter((o) => !o.deletedOn)
		.first();
};

export const getAllOrders = async (db: AppDb) => {
	return await db.orders.filter((o) => !o.deletedOn && !o.complete).sortBy('orderedOn');
};
export const getCompletedOrders = async (db: AppDb) => {
	return await db.orders.filter((o) => !o.deletedOn && o.complete).sortBy('orderedOn');
};

export const completeOrder = async (db: AppDb, orderId: string) => {
	return db.orders
		.where('orderId')
		.equals(orderId)
		.filter((o) => !o.deletedOn)
		.modify({ complete: true });
};

export type OrderReturn = {
	order: Order;
	count: number;
	case?: string;
};
const getOrderCount = async (db: AppDb, orderId: string) => {
	return db.devices
		.where('orderId')
		.equals(orderId)
		.filter((d) => !d.deletedOn)
		.count();
};
export const useOrderSub = (db: AppDb, orderId: string) => {
	return useLiveData(
		async () => {
			const order = await getOrder(db, orderId);
			const count = await getOrderCount(db, orderId);

			return { order, count };
		},
		[db.name, orderId],
		'useOrderSub',
	);
};

export const useActiveOrderSub = (db: AppDb) => {
	return useLiveData(
		async () => {
			const activeCase = await getActiveCase(db);
			if (!activeCase?.activeOrder) return { order: undefined, count: 0, case: undefined };
			const order = await getOrder(db, activeCase.activeOrder);
			const count = await getOrderCount(db, activeCase.activeOrder);
			return { order, count, case: activeCase.activeCase };
		},
		[db.name],
		'useActiveOrderSub',
	);
};

export const useOrderCount = (db: AppDb, orderId: string) => {
	return useLiveData(async () => getOrderCount(db, orderId), [db.name, orderId], 'useOrderCount');
};
