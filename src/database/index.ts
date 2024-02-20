import Dexie from "dexie";
import { Device, Meta, Order, Product } from "./types";
import { onInitate } from "./tables/meta";

export class AppDb extends Dexie{
    devices: Dexie.Table<Device, string> 
    orders: Dexie.Table<Order, string>
    products: Dexie.Table<Product, string>
    meta: Dexie.Table<Meta, string>
    constructor(){
        super('AppDb');
        this.version(1).stores({
            devices: 'deviceId, udi, [orderId+caseId], createdOn',
            orders: 'orderId, productId, dueOn, orderedOn, quantity, createdOn, deletedOn',
            products: 'productId, name, deviceIdLength, color, udiLength, hasUdi, caseSize, createdOn, deletedOn',
            meta: 'id'
        })
        this.devices = this.table("devices")
        this.orders = this.table("orders")
        this.products = this.table("products")
        this.meta = this.table("meta")
        onInitate(this)
    }
}

export const db = new AppDb()

export * from './tables'
export * from './types'
export * from './errors'