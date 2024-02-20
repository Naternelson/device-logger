import { useFormContext } from "react-hook-form";
import { DeviceInput } from "../types";
import { TextField } from "@mui/material";
import { db } from "../../../db";
import { DBErrors } from "../../../dbErrors";

export const UdiField = ({ required, triggerSubmit }: { required?: boolean; triggerSubmit: () => {} }) => {
	const {
		register,
		formState: { errors },
	} = useFormContext<DeviceInput>();
	const hasError = !!errors.udi;
	const errorMessage = errors.udi?.message?.toString();
	const uniqueValidator = async (value: string) => {
		if (value === '') return true;
		const result = await db.findDeviceByUdi(value);
		return result === undefined || DBErrors.DeviceUDIAlreadyExists
	};
	return (
		<TextField
			id="udi-input"
			{...register('udi', {
				required: {
					value: !!required,
					message: 'UDI is required',
				},
				minLength: {
					value: 9,
					message: 'UDI must be 9 characters',
				},
				maxLength: {
					value: 9,
					message: 'UDI must be 9 characters',
				},
				pattern: {
					value: /^\d{9}$/,
					message: 'UDI must be 9 digits',
				},
				validate: {
					unique: uniqueValidator,
				},
			})}
			label="UDI"
			fullWidth
			helperText={errorMessage}
			error={hasError}
			disabled={!required}
			onBlur={() => {
				triggerSubmit();
			}}
		/>
	);
};
