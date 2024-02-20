export type Device = {
    deviceId: string;
    udi: string;
    orderId: string;
    caseId: string; 
    createdOn: Date; 
    updatedOn: Date; 
    deletedOn: Date | false;
}

export type Order = {
    orderId: string, 
    productId: string,
    dueOn: Date | null, 
    orderedOn: Date, 
    quantity: number, 
    createdOn: Date,
    updatedOn: Date, 
    deletedOn: Date | false
    complete: boolean
}

export type Product = {
    productId: string, 
    name: string,
    deviceLabelHeader: string,
    deviceIdLength: number,
    color: string, 
    udiLength: number, 
    hasUdi: boolean,
    caseSize: number, 
    palletSize: number, 
    createdOn: Date, 
    updatedOn: Date,
    deletedOn: Date | false,
    viewed?: boolean
}

export type DefaultProductSettings = Meta & {
    deviceIdLength: number,
    udiLength: number, 
    hasUdi: boolean,
    caseSize: number,
    palletSize: number
}

export type ActiveCase = Meta &{
    id: string, 
    activeOrder: string, 
    activeCase: string
}

export type TableSettings = Meta & {
    id: string, 
    productExp: number, 
    deviceExp: number, 
    orderExp: number
}

export type UserSettings = Meta & {
	id: "userSettings";
	deviceIdPrinter: string;
	udiPrinter: string;
	volumn: number;
	autoPrintDeviceId: boolean;
	autoPrintUdi: boolean;
    printers: string[]
};

export type Meta = {
    id: string, 
    [key: string]: any
}