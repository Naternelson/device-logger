import { useFormContext } from 'react-hook-form';
import { DeviceInput } from '../types';
import { db } from '../../../db';
import { TextField } from '@mui/material';
import { DBErrors } from '../../../dbErrors';

export const DeviceIdField = ({ hasUdi, triggerSubmit }: { hasUdi?: boolean; triggerSubmit: () => {} }) => {
	const {
		register,
		formState: { errors },
	} = useFormContext<DeviceInput>();
	const hasError = !!errors.deviceId;
	const errorMessage = errors.deviceId?.message?.toString();
	const uniqueValidator = async (value: string) => {
		if (value === '') return true;
		try {
			const result = await db.findDevice(value)
			return result === undefined || DBErrors.DeviceAlreadyExists;
		} catch (e) {
			return false;
		}
	};
	return (
		<TextField
			size="small"
			id="device-id-input"
			{...register('deviceId', {
				required: {
					value: true,
					message: 'Device ID is required',
				},
				minLength: {
					value: 6,
					message: 'Device ID must be 6 characters',
				},
				maxLength: {
					value: 6,
					message: 'Device ID must be 6 characters',
				},
				pattern: {
					value: /^\d{6}$/,
					message: 'Device ID must be 6 digits',
				},
				validate: {
					unique: uniqueValidator,
				},
			})}
			label="Device ID"
			fullWidth
			error={hasError}
			helperText={errorMessage}
			onBlur={() => {
				if (hasUdi) return;
				triggerSubmit();
			}}
		/>
	);
};
