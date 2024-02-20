import { SubmitHandler, useFormContext } from "react-hook-form";
import { DeviceInput } from "../types";

export const SubmitField = ({ onSubmit }: { onSubmit: SubmitHandler<DeviceInput> }) => {
	const { trigger, handleSubmit } = useFormContext<DeviceInput>();
	return (
		<input
			name="submit-field"
			className="hidden-field"
			style={{ position: 'absolute', left: '-10000px' }}
			onFocus={async () => {
				await trigger();
                await handleSubmit(onSubmit)();
			}}
		/>
	);
};
