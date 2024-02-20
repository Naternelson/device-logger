import { useLiveQuery } from "dexie-react-hooks"
import { OrderStatus, db } from "./db"

export const useCaseDevices = (caseId?: string, orderId?: string) => {
    if(caseId === "" || orderId === "") return [];
    if(!caseId || !orderId)return []
    const devices = useLiveQuery(()=> db.devices.where("[caseId+orderId]").equals([caseId, orderId]).toArray(), [caseId, orderId]);
    return devices || [];
}

export const useOrderCases = (orderId: string) => { 
    const cases = useLiveQuery(()=> db.cases.where('orderId').equals(orderId).toArray(), [orderId]);
    return cases || [];
}
export const useOrderDevices = (orderId: string) => {
    const devices = useLiveQuery(()=> db.devices.where('orderId').equals(orderId).toArray(), [orderId]);
    return devices || [];
}

export const useRetrieveOrders = (orderStatus?: OrderStatus[]) => {
    const orders = useLiveQuery(() => db.orders.where('status').anyOf(orderStatus || [OrderStatus.Active]).toArray(), [orderStatus]);
    return orders || [];
}