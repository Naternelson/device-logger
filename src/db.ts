import Dexie from "dexie";
import { DBErrors } from "./dbErrors";

export interface Settings {
	caseSize: number; 
}

export interface Device {
    id?: number;
    deviceId: string;
    udi: string;
    orderId: string;
    caseId: string;
    timestamp: Date;
}
export interface Case {
    id?: number;
    caseId: string;
    orderId: string;
    timestamp: Date;
}
export enum OrderStatus {
	Queued = "Queued",
    Active = "Active",
    Completed = "Completed",
    Cancelled = "Cancelled"
}
export interface Order {
	id?: number;
	status: OrderStatus;
	orderId: string;
	productId: string;
	quantity: number;
	timestamp: Date;
}
export interface Product {
    id?: number;
    productId: string;
    name: string;
	requiresUdi: boolean;
    timestamp: Date;
}


class MainDB extends Dexie {
	devices: Dexie.Table<Device, number>;
	cases: Dexie.Table<Case, number>;
	orders: Dexie.Table<Order, number>;
	products: Dexie.Table<Product, number>;
	settings: Dexie.Table<Settings, number>;

	constructor() {
		super('MainDB');
		this.version(1).stores({
			settings: '++id, caseSize',
			devices: '++id, &deviceId, udi,[orderId+caseId], timestamp',
			cases: '++id, &[orderId+caseId], timestamp',
			orders: '++id,  &orderId, productId, quantity, timestamp, status',
			products: '++id, &productId, name, timestamp',
		});
		this.devices = this.table('devices');
		this.cases = this.table('cases');
		this.orders = this.table('orders');
		this.products = this.table('products');
		this.settings = this.table('settings');
		this.settings.count().then((count) => {
			if(count ===0) this.settings.add({caseSize: 24});
		})
	}
	async getSettings() {	
		return this.settings.get(1);
	}
	async updateSettings(settings: Partial<Settings>) {
		return this.settings.update(1, settings);
	}
	async validateDevice(device: Device){
		// Check if the order exists
		const order = await this.orders
			.where('orderId')
			.equals(device.orderId)
			.first();
		if (!order) {
			throw new Error(DBErrors.OrderNotFound);
		}
		// Check if the product exists
		const product = await this.products
			.where('productId')
			.equals(order.productId)
			.first();
		if (!product) {
			throw new Error(DBErrors.ProductNotFound);
		}
		const settings = await this.getSettings();
		if (!settings) {
			console.log("Settings not found", settings)
			throw new Error(DBErrors.SettingsNotFound);
		}

		// Check if the case is full
		const count = await this.countCase(device.caseId, device.orderId);
		if (count >= settings.caseSize) {
			throw new Error(DBErrors.CaseFull);
		}

		const countOrder = await this.countOrder(device.orderId);
		if (countOrder >= order.quantity) {
			throw new Error(DBErrors.OrderCompleted);
		}
		// Check if the device already exists
		const existingDeviceId = await this.findDevice(device.deviceId);
		if (existingDeviceId) {
			throw new Error(DBErrors.DeviceAlreadyExists);
		}
		const existingDeviceUdi = await this.findDeviceByUdi(device.udi);
		if (existingDeviceUdi) {
			throw new Error(DBErrors.DeviceUDIAlreadyExists);
		}

		return true;
	}
	async addDevice(device: Device) {
		await this.validateDevice(device);
		const d =  await this.devices.add(device);
		const orderCount = await this.countOrder(device.orderId);
		const caseCount = await this.countCase(device.caseId, device.orderId);
		return {
			id: d,
			device: device,
			orderCount,
			caseCount
		}
	}
	async findDevice(deviceId: string) {
		return this.devices
			.where('deviceId')
			.equalsIgnoreCase(deviceId)
			.first();
	}
	async findDeviceByUdi(udi: string) {
		return this.devices
			.where('udi')
			.equalsIgnoreCase(udi)
			.first();
	}
	async getLastCase(orderId: string){
		// Get the biggest caseId for the order
		return this.cases
			.where('orderId')
			.equals(orderId)
			.last();
	}
	async getDevicesByCase(caseId: string, orderId: string){
		return await this.devices
			.where('[orderId+caseId]')
			.equals([orderId, caseId])
			.toArray();
	}
	async joinDeviceIds(devices: Device[]){
		return devices.map((device) => {
			return device.deviceId
		}).join(",")
	}
	async getDevicesByOrder(orderId: string){
		return this.devices
			.where('orderId')
			.equals(orderId)
			.toArray();
	}
	async getDeviceByDate(beginningDate: Date, endDate: Date){
		return this.devices
			.where('timestamp')
			.between(beginningDate, endDate)
			.toArray();
	}
	async validateCase(caseData: Case){
		// Check if the Case is correct format
		const caseIdPattern = /^\d{11}$/;
		if (!caseIdPattern.test(caseData.caseId)) {
			throw new Error(DBErrors.InvalidCaseFormat);
		}
		// Check if the order exists
		const order = await this.orders
			.where('orderId')
			.equals(caseData.orderId)
			.first();
		if (!order) {
			throw new Error(DBErrors.OrderNotFound);
		}
		// Check if the case already exists
		const existingCase = await this.cases
			.where('[orderId+caseId]')
			.equals([caseData.orderId, caseData.caseId])
			.first();
		if (existingCase) {
			throw new Error(DBErrors.CaseAlreadyExists);
		}
		
		return true;
	}
	async nextCaseId(orderId: string){
		const date = new Date();
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const today = `${year}${month}${day}001`;

		const lastCase = await this.getLastCase(orderId);
		if (!lastCase){
			return today
		}
		const lastCaseId = parseInt(lastCase.caseId);
		const nextCaseId = lastCaseId < parseInt(today) ? parseInt(today) : lastCaseId + 1;
		return nextCaseId.toString().padStart(11, '0');
	}
	async nextCase(orderId: string){
		const caseId = await this.nextCaseId(orderId);
		this.addCase({caseId, orderId, timestamp: new Date()});
		return caseId;
	}
	async addCase(caseData: Case) {
		await this.validateCase(caseData);
		return this.cases.add(caseData);
	}
	async countCase(caseId: string, orderId:string){
		return this.devices
			.where('[orderId+caseId]')
			.equals([orderId, caseId])
			.count();
	}
	async countOrder(orderId: string){
		return this.devices
			.where('orderId')
			.equals(orderId)
			.count();
	}
	async completeOrder(orderId: string){
		return this.orders
			.where('orderId')
			.equals(orderId)
			.modify({status: OrderStatus.Completed});
	}
	async cancelOrder(orderId: string){
		return this.orders
			.where('orderId')
			.equals(orderId)
			.modify({status: OrderStatus.Cancelled});
	}
	async validateOrder(order: Order){
		// Check if the product exists
		const product = await this.products
			.where('productId')
			.equals(order.productId)
			.first();
		if (!product) {
			throw new Error(DBErrors.ProductNotFound);
		}
		// Check if the order already exists
		const existingOrder = await this.orders
			.where('orderId')
			.equals(order.orderId)
			.first();
		if (existingOrder) {
			throw new Error(DBErrors.OrderAlreadyExists);
		}
		// Check if the order status is valid
		if (order.status !== OrderStatus.Active) {
			throw new Error(DBErrors.InvalidOrderStatus);
		}
		return true;
	}
	async addOrder(order: Order) {
		await this.validateOrder(order);
		return this.orders.add(order);
	}
	async validateProduct(product: Product){
		// Check if the product already exists
		const existingProduct = await this.products
			.where('productId')
			.equals(product.productId)
			.first();
		if (existingProduct) {
			throw new Error(DBErrors.ProductAlreadyExists);
		}
		return true;
	}
	async addProduct(product: Product) {
		await this.validateProduct(product);
		return this.products.add(product);
	}
	async deleteProduct(productId: string, cascade: boolean = false){
		await this.products
			.where('productId')
			.equals(productId)
			.delete();
		if (cascade){
			const orders = await this.orders.where('productId').equals(productId).toArray();
			for (const order of orders){
				await this.deleteOrder(order.orderId, true);
			}
		}
	}
	async deleteCase(caseId: string, orderId: string, cascade: boolean = false){
		await this.cases
			.where('[orderId+caseId]')
			.equals([orderId, caseId])
			.delete();
		if (cascade){
			await this.devices
				.where('[orderId+caseId]')
				.equals([orderId, caseId])
				.delete();
		}
	}
	async deleteOrder(orderId: string, caseCascade: boolean = false){
		await this.orders
			.where('orderId')
			.equals(orderId)
			.delete();
		if (caseCascade){
			const cases = await this.cases.where('orderId').equals(orderId).toArray();
			for (const caseData of cases){
				await this.deleteCase(caseData.caseId, caseData.orderId, true);
			}
		}
	}

}

export const db = new MainDB();

export const reset = async ()=> {
    await db.delete();
    await db.open();
	console.log("Database reset")
}