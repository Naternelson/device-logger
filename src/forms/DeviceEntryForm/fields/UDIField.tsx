import { useFormContext } from "react-hook-form";
import { DeviceInput, StyledStack } from "../types";
import { Collapse, FormControl, Input, Typography } from "@mui/material";

export const UDIInputField = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<DeviceInput>();
	const errorMessage = errors.udi?.message?.toString();
	return (
		<FormControl error={errorMessage !== undefined}>
			<StyledStack>
				<Typography variant="caption" color={errorMessage !== undefined ? 'error' : 'inherit'}>
					UDI
				</Typography>
				<Input {...register('udi')} margin="none" />
				<Collapse in={errorMessage !== undefined}>
					<Typography variant="caption" color="error">
						{errorMessage}
					</Typography>
				</Collapse>
			</StyledStack>
		</FormControl>
	);
};
