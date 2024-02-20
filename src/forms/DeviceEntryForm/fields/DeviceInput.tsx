import { useFormContext } from "react-hook-form";
import { DeviceInput, StyledStack } from "../types";
import { useEffect } from "react";
import { Collapse, FormControl, Input, Typography } from "@mui/material";

export const DeviceInputField = () => {
	const {
		register,
		formState: { errors },
		setFocus,
	} = useFormContext<DeviceInput>();
	const errorMessage = errors.deviceId?.message?.toString();

	useEffect(() => {
		setFocus('deviceId');
	}, [setFocus]);
	return (
		<FormControl error={errorMessage !== undefined}>
			<StyledStack>
				<Typography variant="caption" color={errorMessage !== undefined ? 'error' : 'inherit'}>
					Device ID
				</Typography>
				<Input {...register('deviceId', { required: 'Device is required' })} margin="none" />
				<Collapse in={errorMessage !== undefined}>
					<Typography variant="caption" color="error">
						{errorMessage}
					</Typography>
				</Collapse>
			</StyledStack>
		</FormControl>
	);
};

