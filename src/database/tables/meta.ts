// Import statements for necessary dependencies and type definitions.
import { AppDb } from '..';
import { DatabaseError } from '../errors';
import { ActiveCase, DefaultProductSettings, Meta, TableSettings, UserSettings } from '../types';
import { useLiveData } from '../util';

/**
 * Initializes the 'meta' table in the Dexie database with default entries for product settings and the active case.
 * Ensures that default settings for products and an initial active case record are available upon application start.
 * @param {AppDb} db - The AppDb instance representing the application's Dexie database.
 */
export const onInitate = (db: AppDb) => {
	// Attempt to find and set default product settings if not already set.
	db.meta
		.where('id')
		.equals('defaultProductSettings')
		.first()
		.then((settings) => {
			if (!settings) {
				db.meta.add({
					id: 'defaultProductSettings',
					caseSize: 24,
					palletSize: 1008,
					deviceIdLength: 6,
					udiLength: 9,
					hasUdi: false,
				});
			}
		});

	// Attempt to find and set the active case if not already set.
	db.meta
		.where('id')
		.equals('activeCase')
		.first()
		.then((settings) => {
			if (!settings) {
				db.meta.add({ id: 'activeCase', activeOrder: '', activeCase: '' });
			}
		});

	db.meta
		.where('id')
		.equals('tableSettings')
		.first()
		.then((settings) => {
			if (!settings) {
				db.meta.add({ id: 'tableSettings', productExp: 2, deviceExp: 2, orderExp: 2 });
			}
		});
	db.meta
		.where('id')
		.equals('userSettings')
		.first()
		.then((settings) => {
			if (!settings) {
				db.meta.add({
					id: 'userSettings',
					deviceIdPrinter: 'Default Printer',
					udiPrinter: 'Default Printer',
					volumn: 50,
					autoPrintDeviceId: true,
					autoPrintUdi: true,
					printers: [],
				});
			}
		});
};

/**
 * Retrieves the default product settings from the 'meta' table.
 * Throws an error if the settings cannot be found, indicating a potential issue with database initialization.
 * @param {AppDb} db - The AppDb instance.
 * @returns {Promise<DefaultProductSettings>} A promise that resolves to the default product settings.
 */
export const getProductSettings = async (db: AppDb): Promise<DefaultProductSettings> => {
	const settings = await db.meta.where('id').equals('defaultProductSettings').first();
	if (isProductSettings(settings)) {
		return settings;
	}
	throw new Error(DatabaseError.DEFAULT_PRODUCT_SETTINGS_NOT_FOUND);
};

/**
 * Updates the default product settings in the 'meta' table.
 * Allows partial updates to the settings object.
 * @param {AppDb} db - The AppDb instance.
 * @param {Partial<Omit<DefaultProductSettings, "id">>} settings - The settings to update.
 */
export const updateProductSettings = async (db: AppDb, settings: Partial<Omit<DefaultProductSettings, 'id'>>) => {
	await db.meta.where('id').equals('defaultProductSettings').modify(settings);
};

// Utility function to validate if a given object conforms to the DefaultProductSettings interface.
const isProductSettings = (value: any): value is DefaultProductSettings => {
	return (
		value?.caseSize !== undefined &&
		value?.deviceIdLength !== undefined &&
		value?.udiLength !== undefined &&
		value?.hasUdi !== undefined
	);
};

// Utility function to validate if a given object conforms to the ActiveCase interface.
export const isActiveCase = (value: any): value is ActiveCase => {
	return value?.activeOrder !== undefined && value?.activeCase !== undefined && value?.id !== undefined;
};

/**
 * Updates the active case in the 'meta' table.
 * Allows updating the active order and case fields, excluding the id.
 * @param {AppDb} db - The AppDb instance.
 * @param {Omit<ActiveCase, "id">} options - The new values for the active case.
 */
export const updateActiveCase = async (db: AppDb, options: Omit<ActiveCase, 'id'>) => {
	const { activeOrder, activeCase } = options;
	await db.meta.where('id').equals('activeCase').modify({ activeOrder, activeCase });
};

/**
 * Retrieves the active case from the 'meta' table.
 * Throws an error if the active case cannot be found, indicating a potential issue with database records.
 * @param {AppDb} db - The AppDb instance.
 * @returns {Promise<ActiveCase>} A promise that resolves to the active case.
 */
export const getActiveCase = async (db: AppDb) => {
	const activeCase = await db.meta.where('id').equals('activeCase').first();
	if (isActiveCase(activeCase?.value)) {
		return activeCase.value;
	}
	throw new Error(DatabaseError.ACTIVE_CASE_NOT_FOUND);
};

/**
 * Utilizes the Dexie-react-hooks library to create a live subscription to the active case.
 * This hook will re-run whenever the specified dependencies change, keeping the UI in sync with the database state.
 * @param {AppDb} db - The AppDb instance.
 * @returns The current active case from the 'meta' table, updating live as changes occur.
 */
export const useActiveCaseSub = (db: AppDb) => {
	return useLiveData(() => getActiveCase(db), [db.meta]);
};

export const getTableSettings = async (db: AppDb) => {
	const settings = await db.meta.where('id').equals('tableSettings').first();
	if (isTableSettings(settings)) {
		return settings;
	}
	throw new Error(DatabaseError.TABLE_SETTINGS_NOT_FOUND);
};

const isTableSettings = (value: any): value is TableSettings => {
	return value?.productExp !== undefined && value?.deviceExp !== undefined && value?.orderExp !== undefined;
};

export const getUserSettings = async (db: AppDb) => {
	const settings = await db.meta.where('id').equals('userSettings').first();
	if (isUserSettings(settings)) {
		return settings;
	}
	throw new Error(DatabaseError.USER_SETTINGS_NOT_FOUND);
};

const isUserSettings = (value: any): value is UserSettings => {
	return (
		value?.deviceIdPrinter !== undefined &&
		value?.udiPrinter !== undefined &&
		value?.volumn !== undefined &&
		value?.autoPrintDeviceId !== undefined &&
		value?.autoPrintUdi !== undefined
	);
};

export const useUserSettingsSub = (db: AppDb) => {
	return useLiveData(() => getUserSettings(db), [db.meta]);
};

export const updateUserSettings = async (db: AppDb, settings: Partial<Omit<UserSettings, 'id'>>) => {
	return db.meta
		.where('id')
		.equals('userSettings')
		.modify(settings)
		.then(() => {
			return db.meta.where('id').equals('userSettings').first();
		});
};
