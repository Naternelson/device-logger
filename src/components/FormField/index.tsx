import { Controller, FieldPath, FieldValues, RegisterOptions, useForm, useFormContext } from 'react-hook-form';
import { useSound } from '../../sounds';
import {
	Checkbox,
	CheckboxProps,
	FormControl,
	FormControlLabel,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	SelectProps,
	TextField,
	TextFieldProps,
} from '@mui/material';
import { DateField, DateFieldProps } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { useEffect } from 'react';

export type FormFieldProps<FormFields extends FieldValues> = {
	name: FieldPath<FormFields>;
	label?: string;
	type?: 'string' | 'number' | 'checkbox' | 'date' | 'select';
	items?: { id: string; label: string }[];
	options?: RegisterOptions<FormFields, FieldPath<FormFields>>;
	TextFieldProps?: TextFieldProps;
	CheckboxProps?: CheckboxProps;
	DateFieldProps?: DateFieldProps<Dayjs>;
	SelectFieldProps?: SelectProps;
};
export const FormField = <FormFields extends FieldValues>(props: FormFieldProps<FormFields>) => {
	const { type } = props;
	switch (type) {
		case 'checkbox':
			return <CheckboxField {...props} />;
		case 'number':
			return <NumberField {...props} />;
		case 'date':
			return <DateTimeField {...props} />;
		case 'select':
			return <SelectField {...props} />;
		default:
			return <StringField {...props} />;
	}
};

const CheckboxField = <FormFields extends FieldValues = FieldValues>(props: FormFieldProps<FormFields>) => {
	const { name, label, options, CheckboxProps } = props;
	const {
		control,
		formState: { errors },
	} = useFormContext<FormFields>();
	const { navForwardSelectionMinimal, navBackwardSelectionMinimal } = useSound();
	const onTrueSound = navForwardSelectionMinimal();
	const onFalseSound = navBackwardSelectionMinimal();
	const hasError = !!errors[name];
	return (
		<Controller
			name={name}
			control={control}
			rules={options}
			render={({ field: { onChange, value } }) => (
				<FormControlLabel
					className={hasError ? 'errorWiggle' : ''}
					control={
						<Checkbox
							checked={!!value}
							onChange={(_e, value) => {
								!!value ? onTrueSound.play() : onFalseSound.play();
								onChange(value);
							}}
							{...CheckboxProps}
						/>
					}
					label={label}
				/>
			)}
		/>
	);
};

const NumberField = <FormFields extends FieldValues = FieldValues>(props: FormFieldProps<FormFields>) => {
	const { name, label, options, TextFieldProps } = props;
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
					className={hasError ? 'errorWiggle' : ''}
					type="number"
					inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
					size="small"
					label={label}
					fullWidth
					error={hasError}
					helperText={errorMessage}
					variant="standard"
					margin="none"
					{...TextFieldProps}
				/>
			)}
		/>
	);
};

const DateTimeField = <FormFields extends FieldValues = FieldValues>(props: FormFieldProps<FormFields>) => {
	const { name, label, options, DateFieldProps } = props;
	const {
		control,
		formState: { errors },
	} = useFormContext<FormFields>();
	const { uiTapVariant04 } = useSound();
	const playSound = uiTapVariant04();
	const hasError = !!errors[name];
	const errorMessage = errors[name]?.message?.toString();
	useEffect(() => {
		if (!errorMessage) return;
		console.log(errorMessage);
	}, [errorMessage]);
	return (
		<Controller
			name={name}
			control={control}
			rules={options}
			render={({ field }) => (
				<DateField
					{...field}
					onFocus={() => {
						playSound.play();
					}}
					slotProps={{
						textField: {
							helperText: errorMessage,
						},
					}}
					color={hasError ? 'error' : 'primary'}
					className={hasError ? 'errorWiggle' : ''}
					size="small"
					label={label}
					fullWidth
					variant="standard"
					margin="none"
					formatDensity="spacious"
					format="MM/DD/YYYY"
					{...DateFieldProps}
				/>
			)}
		/>
	);
};

const SelectField = <FormFields extends FieldValues = FieldValues>(props: FormFieldProps<FormFields>) => {
	const { name, label, items, options, SelectFieldProps } = props;
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
				<FormControl
					className={hasError ? 'errorWiggle' : ''}
					fullWidth
					error={hasError}
					variant="standard"
					margin="none">
					<InputLabel>{label}</InputLabel>
					<Select
						{...field}
						onFocus={() => {
							playSound.play();
						}}
						{...SelectFieldProps}>
						{items?.map((item) => (
							<MenuItem onMouseOver={() => {
                                playSound.play();
                            }} dense key={item.id} value={item.id}>
								{item.label}
							</MenuItem>
						))}
					</Select>
					<FormHelperText error={hasError}>{errorMessage}</FormHelperText>
				</FormControl>
			)}
		/>
	);
};

const StringField = <FormFields extends FieldValues = FieldValues>(props: FormFieldProps<FormFields>) => {
	const { name, label, options, TextFieldProps } = props;
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
					{...TextFieldProps}
				/>
			)}
		/>
	);
};
