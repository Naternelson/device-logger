import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import { FormFields } from './Provider';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import { useSound } from '../../../sounds';

export type FormFieldProps = {
	name: keyof FormFields;
	label: string;
	type?: 'string' | 'number' | 'checkbox';
	options?: RegisterOptions<FormFields, keyof FormFields>;
};
export const FormField = (props: FormFieldProps) => {
	const { type } = props;
	switch (type) {
		case 'checkbox':
			return <CheckboxField {...props} />;
		case 'number':
			return <NumberField {...props} />;
		default:
			return <StringField {...props} />;
	}
};

const CheckboxField = (props: FormFieldProps) => {
	const { name, label, options } = props;
	const { control } = useFormContext<FormFields>();
	const { navForwardSelectionMinimal, navBackwardSelectionMinimal } = useSound();
	const onTrueSound = navForwardSelectionMinimal();
	const onFalseSound = navBackwardSelectionMinimal();

	return (
		<Controller
			name={name}
			control={control}
			rules={options}
			render={({ field: { onChange, value } }) => (
				<FormControlLabel
					control={
						<Checkbox
							checked={!!value}
							onChange={(_e, value) => {
								!!value ? onTrueSound.play() : onFalseSound.play();
								onChange(value);
							}}
						/>
					}
					label={label}
				/>
			)}
		/>
	);
};

const StringField = (props: FormFieldProps) => {
	const { name, label, options } = props;
	const {
		control,
		formState: { errors },
	} = useFormContext<FormFields>();
	const { uiTapVariant04 } = useSound();
	const playSound = uiTapVariant04();
	const hasError = !!errors[name];
	const errorMessage = errors[name]?.message?.toString();
	return (
		<Controller
			name={name}
			control={control}
			rules={options}
			render={({ field }) => (
				<TextField
					{...field}
					onFocus={() => {
						playSound.play();
					}}
					className={hasError ? 'errorWiggle' : ''}
					size="small"
					label={label}
					fullWidth
					error={hasError}
					helperText={errorMessage}
					variant="standard"
					margin="none"
				/>
			)}
		/>
	);
};

const NumberField = (props: FormFieldProps) => {
	const { name, label, options } = props;
	const {
		control,
		formState: { errors },
	} = useFormContext<FormFields>();
	const { uiTapVariant04 } = useSound();
	const playSound = uiTapVariant04();
	const hasError = !!errors[name];
	const errorMessage = errors[name]?.message?.toString();
	return (
		<Controller
			name={name}
			control={control}
			rules={{
				...options,
			}}
			render={({ field: { onChange, ...rest } }) => (
				<TextField
					{...rest}
					onFocus={() => {
						playSound.play();
					}}
					onChange={(e) => {
						playSound.play();
						onChange(e.target.value);
					}}
					className={hasError ? "errorWiggle" : ""}
					type="number"
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
					size="small"
					label={label}
					fullWidth
					error={hasError}
					helperText={errorMessage}
					variant="standard"
					margin="none"
				/>
			)}
		/>
	);
};
