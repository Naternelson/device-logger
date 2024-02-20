import { AppDb, DatabaseError, Product, getProductSettings } from "..";
import { cleanString, useLiveData } from "../util";


const sanitizeProduct = (product: Product) => {
	const { name, productId, deviceIdLength, color, udiLength, hasUdi, caseSize, ...rest } = product;
	return {
		name: cleanString(name),
		productId: cleanString(productId),
		deviceIdLength,
		color: cleanString(color),
		udiLength,
		hasUdi,
		caseSize,
		...rest,
	};
};


export const validateProductIdUniqueness = async (db:AppDb, productId: string) => {
    const product = await db.products.where('productId').equals(productId).first()
    if(product){
        throw new Error(DatabaseError.PRODUCT_ALREADY_EXISTS)
    }
}

export const validateTypes = (product: Product) => {
    /**
     * Product name should be string, no more the 255 characters
     * Product ID should be string, no more than 255 characters
     * Device ID length should be a positive integer
     * Color should be a string, no more than 255 characters
     * UDI length should be a positive integer
     * Has UDI should be a boolean
     * Case size should be a positive integer
     * 
     */
    const {name, productId, deviceIdLength, color, udiLength, hasUdi, caseSize} = product
    if(typeof name !== 'string' || name.length > 255){
        throw new Error(DatabaseError.INVALID_PRODUCT_NAME)
    }
    if(typeof productId !== 'string' || productId.length > 255){
        throw new Error(DatabaseError.INVALID_PRODUCT_ID)
    }
    if(typeof deviceIdLength !== 'number' || deviceIdLength < 1){
        throw new Error(DatabaseError.INVALID_DEVICE_ID_LENGTH)
    }
    if(typeof color !== 'string' || color.length > 255){
        throw new Error(DatabaseError.INVALID_COLOR)
    }
    if(typeof udiLength !== 'number' || udiLength < 1){
        throw new Error(DatabaseError.INVALID_UDI_LENGTH)
    }
    if(typeof hasUdi !== 'boolean'){
        throw new Error(DatabaseError.INVALID_HAS_UDI)
    }
    if(typeof caseSize !== 'number' || caseSize < 1){
        throw new Error(DatabaseError.INVALID_CASE_SIZE)
    }
}

export const validateProduct = async (db:AppDb, product: Product, ignoreUnique?:boolean) => {
    validateTypes(product)
    if(!!ignoreUnique) return 
    await validateProductIdUniqueness(db, product.productId)
}
export const isProductValid = async (db:AppDb, product: Product) => {
    try {
        await validateProduct(db, product)
        return true
    } catch (error) {
        return false
    }
}

export type ProductCreation = Omit<Partial<Product>, "createdOn" | "updatedOn" | "deletedOn" | "productId" | "name" > & {productId: string, name: string}

export const createProduct = async (db:AppDb, product:ProductCreation) => {
    return db.transaction('rw', db.products, db.meta, async () => {
        const defaultProductSettings = await getProductSettings(db)
        let p:Product = {

            palletSize: defaultProductSettings.palletSize,
            caseSize: defaultProductSettings.caseSize,
            deviceIdLength: defaultProductSettings.deviceIdLength,
            udiLength: defaultProductSettings.udiLength,
            hasUdi: defaultProductSettings.hasUdi,
            color: product.color || '',
            deviceLabelHeader: product.deviceLabelHeader || '',
            ...product, createdOn: new Date(), updatedOn: new Date(), deletedOn: false}
        p = sanitizeProduct(p)
        await validateProduct(db, p)
        return await db.products.put(p)
    })
    
}

export const deleteProduct = async (db:AppDb, productId: string, options?:{permanent?: boolean}) => {
    const {permanent} = options || {}
    if(permanent){
        return db.products.where('productId').equals(productId).delete()
    }
    return db.products.where('productId').equals(productId).modify({deletedOn: new Date()})
}

export const restoreProduct = async (db:AppDb, productId: string) => {
    return db.products.where('productId').equals(productId).modify({deletedOn: null}).catch((_error) => {
        throw new Error(DatabaseError.PRODUCT_NOT_FOUND)
    })
}

export const getProduct = async (db: AppDb, productId: string) => {
	return await db.products.where("productId").equals(productId).filter((p) => p.productId === productId && !p.deletedOn).first();
};

export const getAllProducts = async (db: AppDb) => {
	return await db.products.filter((p) => !p.deletedOn).sortBy("createdOn");
};

export const useAllProductsSub = (db:AppDb) =>{
    return useLiveData(() => getAllProducts(db))
}


export const modifyProduct = async (db: AppDb, productId: string, product: ProductCreation) => {
    return db.transaction('rw', db.products, db.meta, async () => {
        const existingProduct = await db.products.where('productId').equals(productId).first()
        if(!existingProduct){
            throw new Error(DatabaseError.PRODUCT_NOT_FOUND)
        }
        let p:Product = {
            ...existingProduct,
            ...product, 
            updatedOn: new Date()}
        p = sanitizeProduct(p)
        await validateProduct(db, p, true)
        return db.products.where('productId').equals(productId).modify(p)
    })
}

export const viewProduct = async (db: AppDb, productId: string) => {
    return db.products.where('productId').equals(productId).modify({viewed: true})
}