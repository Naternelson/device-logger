import {
	Autocomplete,
	Checkbox,
	Container,
	Divider,
	FormControlLabel,
	Grid,
	Paper,
	Slider,
	Stack,
	TextField,
	Typography,
	colors,
	styled,
} from '@mui/material';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { UserSettings, db, updateUserSettings } from '../../database';
import { printers as appPrinters } from 'tauri-plugin-printer';
import { useLoaderData } from 'react-router-dom';
import { VolumeDown, VolumeUp } from '@mui/icons-material';
import { Howl } from 'howler';
import materialSounds from '../../sounds/material-sounds';
import { debounce } from '../../utility';
import { useEffect, useRef } from 'react';
import { useSound } from '../../sounds';

type FormFields = {
	deviceIdPrinter: string;
	udiPrinter: string;
	volumn: number;
	autoPrintDeviceId: boolean;
	autoPrintUdi: boolean;
};

const onSubmit = debounce((data: Partial<FormFields>) => {
	updateUserSettings(db, data).catch(console.error);
}, 200);

export const SettingsPage = () => {
	const loaded = useRef(false);
	const data = useLoaderData() as UserSettings;
	const frm = useForm<FormFields>({
		defaultValues: data,
	});

	const submitHandler = frm.handleSubmit(onSubmit);
	const { printers, devicePrinter, udiPrinter, loading, autoPrintDeviceId, autoPrintUdi, volumn } = data;

	useEffect(() => {
		if (loaded.current) return;
		appPrinters().then((p) => {
			updateUserSettings(db, { printers: [{ name: 'Default Printer' }, ...p].map((p) => p.name) }).catch(
				console.error,
			);
		});
		loaded.current = true;
	}, []);

	return (
		<Container sx={{ py: 2 }}>
			<Typography variant="h1" py={2}>
				Settings
			</Typography>
			<Divider />
			<Divider />
			<Paper elevation={3} sx={{ padding: 5, my: 2 }}>
				<FormProvider {...frm}>
					<form onSubmit={submitHandler}>
						<StyledGridContainer container spacing={2}>
							<Grid item xs={12}>
								<Divider />
								<Typography variant="h3" sx={{ color: colors.grey[500], fontStyle: 'italic', p: 2 }}>
									Printer Settings
								</Typography>
								<Divider />
							</Grid>
							<Grid item xs={12} sm={2}>
								<Typography variant="h4">Device ID Printer</Typography>
							</Grid>
							<Grid item xs={12} sm={2}>
								<AutoPrintControl
									name="autoPrintDeviceId"
									defaultValue={autoPrintDeviceId}
									onSubmit={onSubmit}
								/>
							</Grid>
							<Grid item xs={12} sm={8}>
								<PrinterSelectField
									printers={printers}
									name="deviceIdPrinter"
									defaultValue={devicePrinter}
									onSubmit={onSubmit}
									loading={loading}
								/>
							</Grid>

							<Grid item xs={12} sm={2}>
								<Typography variant="h4">UDI Printer</Typography>
							</Grid>
							<Grid item xs={12} sm={2}>
								<AutoPrintControl name="autoPrintUdi" defaultValue={autoPrintUdi} onSubmit={onSubmit} />
							</Grid>
							<Grid item xs={12} sm={8}>
								<PrinterSelectField
									printers={printers}
									name="udiPrinter"
									defaultValue={udiPrinter}
									onSubmit={onSubmit}
									loading={loading}
								/>
							</Grid>
							<Grid item xs={12} py={2}>
								<Divider />
								<Typography variant="h3" sx={{ color: colors.grey[500], fontStyle: 'italic', p: 2 }}>
									User Settings
								</Typography>
								<Divider />
							</Grid>
							<Grid item xs={12} sm={2}>
								<Typography variant="h4">System Volumn</Typography>
							</Grid>
							<Grid item xs={12} sm={10} alignSelf={'center'}>
								<VolumnControl defaultValue={volumn} onSubmit={onSubmit} />
							</Grid>
						</StyledGridContainer>
					</form>
				</FormProvider>
			</Paper>
		</Container>
	);
};

const StyledGridContainer = styled(Grid)({
	'& .MuiGrid-item': {
		alignSelf: 'center',
	},
});

const PrinterSelectField = ({
	name,
	defaultValue,
	printers,
	loading,
	onSubmit,
}: {
	name: 'deviceIdPrinter' | 'udiPrinter';
	defaultValue: string;
	onSubmit: (data: Partial<FormFields>) => void;
	printers: string[];
	loading: boolean;
}) => {
	const { control } = useFormContext<FormFields>();
	const { navHoverTap, uiTapVariant03 } = useSound();
	const playHoverSound = navHoverTap();
	const playSelectSound = uiTapVariant03();
	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			render={({ field: { onChange, value } }) => (
				<Autocomplete
					loading={loading}
					sx={{ maxWidth: 400, minWidth: 300 }}
					options={printers}
					value={value}
					onHighlightChange={() => {
						playHoverSound.stop();
						playHoverSound.play();
					}}
					onChange={(_e, value) => {
						onChange(value);
						onSubmit({ [name]: value });
						playSelectSound.stop();
						playSelectSound.play();
					}}
					renderInput={(params) => <TextField {...params} variant="standard" />}
				/>
			)}
		/>
	);
};

const AutoPrintControl = ({
	name,
	defaultValue,
	onSubmit,
}: {
	name: 'autoPrintDeviceId' | 'autoPrintUdi';
	defaultValue: boolean;
	onSubmit: (data: Partial<FormFields>) => void;
}) => {
	const { control } = useFormContext<FormFields>();
	const { navForwardSelectionMinimal, navBackwardSelectionMinimal } = useSound();
	const playTrueSound = navForwardSelectionMinimal();
	const playFalseSound = navBackwardSelectionMinimal();
	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			render={({ field: { onChange, value } }) => (
				<FormControlLabel
					control={
						<Checkbox
							checked={value}
							onChange={(_e, value) => {
								value ? playTrueSound.play() : playFalseSound.play();
								onChange(value);
								onSubmit({ [name]: value });
							}}
						/>
					}
					label={'Auto Print'}
				/>
			)}
		/>
	);
};

const VolumnControl = ({
	defaultValue,
	onSubmit,
}: {
	defaultValue: number;
	onSubmit: (data: Partial<FormFields>) => void;
}) => {
	const { control } = useFormContext<FormFields>();
	return (
		<Stack direction={'row'} gap={2} alignItems={'center'} sx={{ maxWidth: 200, minWidth: 100 }}>
			<VolumeDown fontSize="small" />
			<Controller
				name="volumn"
				control={control}
				defaultValue={defaultValue}
				render={({ field: { onChange, value } }) => (
					<Slider
						value={value}
						onChange={(_e, value) => {
							onSubmit({ volumn: value as number });
							onChange(value);
							const sound = new Howl({
								src: [materialSounds.PrimarySystemSounds.UiTapVariant01],
								volume: (value as number) / 100,
							});
							sound.play();
						}}
						size="small"
						min={0}
						max={100}
						step={10}
						valueLabelDisplay="auto"
					/>
				)}
			/>
			<VolumeUp fontSize="small" />
		</Stack>
	);
};
