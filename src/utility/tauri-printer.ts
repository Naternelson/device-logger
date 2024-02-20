import { useEffect, useRef, useState } from "react";
import { Jobs, PrintData, PrintOptions, Printer } from "tauri-plugin-printer/dist/lib/types";
import { job, jobs, print, printers } from "tauri-plugin-printer";
import { db, updateUserSettings, useUserSettingsSub } from "../database";

export const usePrinting = () => { 
    const [appPrinters, setAppPrinters] = useState<Printer[]>([])
    const settings = useUserSettingsSub(db)
    const {data} = settings
    const load = useRef(false);
    const p = data?.printers || []
    const devicePrinter = data?.deviceIdPrinter || 'Default Printer'
    const udiPrinter = data?.udiPrinter || 'Default Printer'
    const autoPrintDeviceId = data?.autoPrintDeviceId || false
    const autoPrintUdi = data?.autoPrintUdi || false

    const updatePrinters = async () => {
        const p = await printers()
        setAppPrinters(p)
        await updateUserSettings(db, {printers:  [{name: "Default Printer"}, ...p].map((p) => p.name)})
    }

    useEffect(() => {
        if(load.current) return 
        updatePrinters()
        load.current = true
    },[load.current])

    const printDeviceId = async (data: PrintData[], options: PrintOptions) => {
        let o:PrintOptions = {...options, name: devicePrinter}
        await print(data, o)
        const j=  await jobs(devicePrinter)
        const currentJob = j.pop()
        return currentJob
    }

    const printUdi = async (data: PrintData[], options: PrintOptions) => {
        let o: PrintOptions = { ...options, name: udiPrinter };
		await print(data, o);
		const j = await jobs(udiPrinter);
		const currentJob = j.pop();
		return currentJob;
    }
    return {
        loading: settings.state === "pending",
		appPrinters,
		printers: p,
		devicePrinter,
		udiPrinter,
		updatePrinters,
		printDeviceId,
		printUdi,
		autoPrintDeviceId,
        autoPrintUdi,
        volumn: data?.volumn || 50
	};
}

