import { dialog } from '@tauri-apps/api';
import { AppDb, DatabaseError, Device } from '..';
import { cleanString, useLiveData } from '../util';
import { writeFile } from '@tauri-apps/api/fs';

const sanitizeDevice = (device: Device): Device => {
	const { deviceId, udi, orderId, caseId, createdOn, updatedOn, deletedOn } = device;
	return {
		deviceId: cleanString(deviceId).toUpperCase(),
		udi: cleanString(udi).toUpperCase(),
		orderId: cleanString(orderId),
		caseId: cleanString(caseId),
		createdOn,
		updatedOn,
		deletedOn,
	};
};

export const validateDeviceUniqueness = async (db: AppDb, deviceId: string, udi?: string, ignoreUnique?: boolean) => {
	const device = await db.devices
		.where('deviceId')
		.equals(deviceId)
		.filter((d) => !d.deletedOn)
		.first();
	if (device && !ignoreUnique) {
		throw new Error(DatabaseError.DEVICE_ALREADY_EXISTS);
	}
	if (udi && udi.length > 0) {
		const device = await db.devices
			.where('udi')
			.equals(udi)
			.filter((d) => !d.deletedOn)
			.first();
		if (device && device.deviceId !== deviceId && !ignoreUnique) {
			throw new Error(DatabaseError.UDI_ALREADY_EXISTS);
		}
	}
};

const validateTypes = (device: Device) => {
	/**
	 * Device ID should be a string, no more than 255 characters
	 * UDI should be a string, no more than 255 characters
	 * Order ID should be a string, no more than 255 characters
	 * Case ID should be a string, no more than 255 characters, and should follow the format "YYYYMMDD###"
	 *
	 */
	const { deviceId, udi, orderId, caseId } = device;
	if (typeof deviceId !== 'string' || deviceId.length > 255) {
		throw new Error(DatabaseError.INVALID_DEVICE_ID);
	}
	if (udi && (typeof udi !== 'string' || udi.length > 255)) {
		throw new Error(DatabaseError.INVALID_UDI);
	}
	if (typeof orderId !== 'string' || orderId.length > 255) {
		throw new Error(DatabaseError.INVALID_ORDER_ID);
	}
	if (typeof caseId !== 'string' || caseId.length > 255 || !/^\d{8}\d{3}$/.test(caseId)) {
		throw new Error(DatabaseError.INVALID_CASE_ID);
	}
};

const validateDeviceOrder = async (db: AppDb, device: Device) => {
	const { orderId } = device;
	const order = await db.orders.where('orderId').equals(orderId).first();
	if (!order) {
		throw new Error(DatabaseError.ORDER_NOT_FOUND);
	}
	return order;
};

const validateProductDevice = async (db: AppDb, device: Device) => {
	const order = await validateDeviceOrder(db, device);
	const product = await db.products.where('productId').equals(order.productId).first();
	if (!product) {
		throw new Error(DatabaseError.PRODUCT_NOT_FOUND);
	}
	return product;
};

const validateDeviceSpecs = async (db: AppDb, device: Device) => {
	const product = await validateProductDevice(db, device);
	const { deviceId, udi } = device;
	if (product.hasUdi && (!udi || udi.length !== product.udiLength)) {
		throw new Error(DatabaseError.INVALID_UDI);
	}
	if (deviceId.length !== product.deviceIdLength) {
		throw new Error(DatabaseError.INVALID_DEVICE_ID_LENGTH);
	}
};

export const validateDevice = async (db: AppDb, device: Device, ignoreUnique?: boolean) => {
	validateTypes(device);
	await validateDeviceSpecs(db, device);
	if (!!ignoreUnique) return;
	await validateDeviceUniqueness(db, device.deviceId, device.udi);
};
export const isDeviceValid = async (db: AppDb, device: Device) => {
	try {
		await validateDevice(db, device);
		return true;
	} catch (_e) {
		return false;
	}
};

export const exceedsOrderSize = async (db: AppDb, orderId: string) => {
	const order = await db.orders.where('orderId').equals(orderId).first();
	if (!order) {
		throw new Error(DatabaseError.ORDER_NOT_FOUND);
	}
	const count = await db.devices.where('orderId').equals(orderId).count();
	return count >= order.quantity;
};

export const exceedsCaseSize = async (db: AppDb, orderId: string, caseId: string) => {
	const order = await db.orders.where('orderId').equals(orderId).first();
	if (!order) {
		throw new Error(DatabaseError.ORDER_NOT_FOUND);
	}
	const product = await db.products.where('productId').equals(order.productId).first();
	if (!product) {
		throw new Error(DatabaseError.PRODUCT_NOT_FOUND);
	}
	const count = await db.devices
		.where('[orderId+caseId]')
		.equals([orderId, caseId])
		.filter((d) => !d.deletedOn)
		.count();
	return count >= product.caseSize;
};

export type DeviceCreation = Partial<Device> & { deviceId: string; orderId: string; caseId: string };
export const createDevice = async (db: AppDb, device: DeviceCreation) => {
	const newDevice = sanitizeDevice({
		udi: '',
		...device,
		createdOn: new Date(),
		updatedOn: new Date(),
		deletedOn: false,
	});
	await validateDevice(db, newDevice);
	return db.devices.put(newDevice);
};

export const modifyDevice = async (db: AppDb, deviceId: string, device: Partial<Device>) => {
	return db.transaction('rw', db.devices, async () => {
		const existingDevice = await db.devices.where('deviceId').equals(deviceId).first();
		if (!existingDevice) {
			throw new Error(DatabaseError.DEVICE_NOT_FOUND);
		}
		const updatedDevice = sanitizeDevice({
			...existingDevice,
			...device,
			updatedOn: new Date(),
		});
		await validateDevice(db, updatedDevice, true);
		return db.devices.update(deviceId, updatedDevice);
	});
};

export const deleteDevice = async (db: AppDb, deviceId: string, options?: { permanent?: boolean }) => {
	const { permanent } = options || {};
	if (permanent) {
		return db.devices.where('deviceId').equals(deviceId).delete();
	}
	return db.devices.where('deviceId').equals(deviceId).modify({ deletedOn: new Date() });
};

export const restoreDevice = async (db: AppDb, deviceId: string) => {
	return db.devices
		.where('deviceId')
		.equals(deviceId)
		.modify({ deletedOn: false })
		.catch((_error) => {
			throw new Error(DatabaseError.DEVICE_NOT_FOUND);
		});
};

export const searchDevices = async (db: AppDb, query: string) => {
	/** Return devices that have a partial match for any of this list: [deviceId, udi, orderId, caseId] */
	return await db.devices
		.filter((d) => {
			return (
				d.deviceId.includes(query) ||
				d.udi.includes(query) ||
				d.orderId.includes(query) ||
				d.caseId.includes(query)
			);
		})
		.sortBy('createdOn');
};

export const getDevice = async (db: AppDb, deviceId: string) => {
	return await db.devices
		.where('deviceId')
		.equals(deviceId)
		.filter((d) => !d.deletedOn)
		.first();
};

export const getOrderDevices = async (db: AppDb, orderId: string) => {
	return await db.devices
		.where('orderId')
		.equals(orderId)
		.filter((d) => !d.deletedOn)
		.sortBy('createdOn');
};

export const getCaseDevices = async (db: AppDb, orderId: string, caseId: string) => {
	return await db.devices
		.where('[orderId+caseId]')
		.equals([orderId, caseId])
		.filter((d) => !d.deletedOn)
		.sortBy('createdOn');
};
export const useCaseDevicesSub = (db: AppDb, orderId: string, caseId: string) => {
	return useLiveData(() => getCaseDevices(db, orderId, caseId), [db.name, orderId, caseId], 'useCaseDevicesSub');
};

const getCaseCount = async (db: AppDb, orderId: string, caseId: string) => {
	return await db.devices
		.where('[orderId+caseId]')
		.equals([orderId, caseId])
		.filter((d) => !d.deletedOn)
		.count();
};

export const useCaseCountSub = (db: AppDb, orderId: string, caseId: string) => {
	return useLiveData(() => getCaseCount(db, orderId, caseId), [db.name, orderId, caseId], 'useCaseCountSub');
};

export const nextCaseId = async (db: AppDb, orderId: string) => {
	/**
	 * Case IDs are the following format: "YYYYMMDD###"
	 * Should get the largest caseId for the order, and if its the same day as today, increment the number otherwise start at 001
	 */
	const today = new Date();
	const year = today.getFullYear();
	const month = (today.getMonth() + 1).toString().padStart(2, '0');
	const day = today.getDate().toString().padStart(2, '0');
	const todayString = `${year}${month}${day}`;
	const devices = await db.devices
		.where('orderId')
		.equals(orderId)
		.filter((d) => d.caseId.startsWith(todayString) && !d.deletedOn)
		.sortBy('caseId');
	if (devices.length === 0) {
		return `${todayString}001`;
	}
	const lastCase = devices[devices.length - 1];
	const lastNumber = parseInt(lastCase.caseId.slice(-3));
	return `${todayString}${(lastNumber + 1).toString().padStart(3, '0')}`;
};

export const createOrderDevices = async (db: AppDb, orderId: string) => {
	/**
	 * Return a CSV string of the devices for the order
	 */
	const devices = await getOrderDevices(db, orderId);
	const order = await db.orders.where('orderId').equals(orderId).first();
	if (!order) {
		throw new Error(DatabaseError.ORDER_NOT_FOUND);
	}
	const product = await db.products.where('productId').equals(order.productId).first();
	if (!product) {
		throw new Error(DatabaseError.PRODUCT_NOT_FOUND);
	}
	const header = `Device ID,UDI,Order ID,Case ID,Timestamp\n`;
	const rows = devices
		.map((d) => `${d.deviceId},${d.udi},${d.orderId},${d.caseId},${d.createdOn.toISOString()}\n`)
		.join('');
	return {
		orderId: order.orderId,
		productId: order.productId,
		data: header + rows,
	};
};

export const exportOrderDevices = async (db: AppDb, orderId: string) => {
	const csvInfo = await createOrderDevices(db, orderId);
	try {
		const saveFile = await dialog.save({
			defaultPath: `${csvInfo.orderId}_devices.csv`,
			filters: [{ name: 'CSV', extensions: ['csv'] }],
		});
		if (saveFile) {
			await writeFile(saveFile, csvInfo.data);
		}
	} catch {
		throw new Error(DatabaseError.EXPORT_FAILED);
	}
};

export const createCaseDevices = async (db: AppDb, orderId: string) => {
	const devices = await getOrderDevices(db, orderId);
	const order = await db.orders.where('orderId').equals(orderId).first();
	if (!order) {
		throw new Error(DatabaseError.ORDER_NOT_FOUND);
	}
	const product = await db.products.where('productId').equals(order.productId).first();
	if (!product) {
		throw new Error(DatabaseError.PRODUCT_NOT_FOUND);
	}

	// Group devices by caseId
	const cases = devices.reduce((acc, d) => {
		if (!acc[d.caseId]) {
			acc[d.caseId] = [];
		}
		acc[d.caseId].push(d);
		return acc;
	}, {} as Record<string, Device[]>);

	const header = `Case ID,OrderId,Devices,Timestamp\n`;
	const rows = Object.entries(cases)
		.map(([caseId, devices]) => {
			// Find the earliest createdOn date for the devices in the case
			const timestamp = devices
				.reduce((acc, d) => (d.createdOn < acc ? d.createdOn : acc), new Date())
				.toISOString();
			// Join device IDs with commas and enclose in double quotes to ensure it's treated as one field
			const deviceIds = `"${devices.map((d) => d.deviceId).join(',')}"`;
			// Return the CSV row for this case
			return `${caseId},${deviceIds},"${timestamp}"\n`; // Enclosing timestamp for consistency, remove if not needed
		})
		.join('');

	return {
		orderId: order.orderId,
		productId: order.productId,
		data: header + rows,
	};
};

export const exportCaseDevices = async (db: AppDb, orderId: string) => {
	const csvInfo = await createCaseDevices(db, orderId);
	try {
		const saveFile = await dialog.save({
			defaultPath: `${csvInfo.orderId}_cases.csv`,
			filters: [{ name: 'CSV', extensions: ['csv'] }],
		});
		if (saveFile) {
			await writeFile(saveFile, csvInfo.data);
		}
	} catch {
		throw new Error(DatabaseError.EXPORT_FAILED);
	}
};

export const createPalletDevices = async (db: AppDb, orderId: string) => {
	const devices = await getOrderDevices(db, orderId);
	const order = await db.orders.where('orderId').equals(orderId).first();
	if (!order) {
		throw new Error(DatabaseError.ORDER_NOT_FOUND);
	}
	const product = await db.products.where('productId').equals(order.productId).first();
	if (!product) {
		throw new Error(DatabaseError.PRODUCT_NOT_FOUND);
	}

	const palletSize = product.palletSize;
	const maxCharsPerGroup = 1008;
	// Adjusted header to include Order ID and Count
	let csvString = 'Pallet,Order ID,Count,Group 1,Group 2,Group 3,Group 4,Timestamp\n';

	// Helper function to create device groupings within a pallet
	const createGroupings = (devices: Device[]) => {
		let groupings = ['', '', '', ''];
		let groupIndex = 0;
		devices.forEach((device) => {
			// Check if adding this device exceeds the character limit for the current grouping
			if (groupings[groupIndex].length + device.deviceId.length + 1 > maxCharsPerGroup) {
				groupIndex = groupIndex < 3 ? groupIndex + 1 : 0; // Move to next grouping, reset if exceeds 4
			}
			groupings[groupIndex] += (groupings[groupIndex] ? ',' : '') + device.deviceId;
		});
		return groupings;
	};

	// Split devices into pallets based on palletSize
	for (let i = 0; i < devices.length; i += palletSize) {
		const palletDevices = devices.slice(i, i + palletSize);
		const groupings = createGroupings(palletDevices);
		// Assuming timestamp is the earliest createdOn date from the devices in the pallet
		const timestamp = palletDevices
			.reduce((acc, d) => (d.createdOn < acc ? d.createdOn : acc), new Date())
			.toISOString();
		const count = palletDevices.length;
		// Including Order ID and device count in the CSV row
		csvString += `${Math.ceil((i + 1) / palletSize)},${orderId},${count},${groupings.join(',')},${timestamp}\n`;
	}

	return csvString;
};

export const exportPalletDevices = async (db: AppDb, orderId: string) => {
	const csvString = await createPalletDevices(db, orderId);
	try {
		const saveFile = await dialog.save({
			defaultPath: `${orderId}_pallets.csv`,
			filters: [{ name: 'CSV', extensions: ['csv'] }],
		});
		if (saveFile) {
			await writeFile(saveFile, csvString);
		}
	} catch {
		throw new Error(DatabaseError.EXPORT_FAILED);
	}
};
