import {
	ButtonBase,
	ClickAwayListener,
	FilledInput,
	Input,
	InputAdornment,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	keyframes,
	styled,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FormProvider, RegisterOptions, useForm, useFormContext } from 'react-hook-form';
import { DeviceInput } from './types';
import { Device } from '../../db';
import { Search } from '@mui/icons-material';
import { dialog } from '@tauri-apps/api';


export const DevicesTable = (props: { rows: Device["deviceId"][]; data: Record<Device["deviceId"], Device>, onDelete: (deviceId: string) => void }) => {
	const onClick = async () => {
		const result = await dialog.ask("How are you today?",{
			title: "Hello",
			"type":"error"
		});
		console.log(result);
	}
	return (
		<Stack direction="column" sx={{ flexGrow: 1, overflow: 'auto'}}>
			<TableContainer component={Paper}>
				<Stack direction={'row'} justifyContent={'space-between'} padding={1}>
                    <Typography>Case Data</Typography>
					<ButtonBase onClick={onClick}>Import</ButtonBase>
					<FilledInput
						size="small"
						placeholder="Search"
                        startAdornment={<InputAdornment position="start"><Search fontSize='small' sx={{color: "rgb(200,200,200)"}}/></InputAdornment>}
						sx={{ fontSize: '.75rem', padding: 0, ' & .MuiFilledInput-input': { padding: '.25rem 0' } }}
					/>
				</Stack>
				<Table size="small" stickyHeader sx={{overflow: "hidden"}}>
					<TableHead>
						<TableRow>
							<TableCell style={{ width: '15%' }}>Device ID</TableCell>
							<TableCell style={{ width: '15%' }}>UDI</TableCell>
							<TableCell style={{ width: '15%' }}>Order ID</TableCell>
							<TableCell style={{ width: '15%' }}>Case ID</TableCell>
							<TableCell style={{ width: '20%' }}>Timestamp</TableCell>
							<TableCell style={{ width: '20%' }}>Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{props.rows.map((row) => (
							<DeviceRow key={row} row={props.data[row]} onDelete={props.onDelete} />
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
const fadeout = keyframes`
    from {
        background-color: white;
    }
    to {
        background-color: transparent;
    }
    `;

const StyledRow = styled(TableRow)({
	position: 'relative',
	'&::after': {
		content: '""',
		position: 'absolute',
		width: '100%',
		height: '100%',
		top: 0,
		left: 0,
		zIndex: 1,
		backgroundColor: 'white',
		pointerEvents: 'none',
		animation: `${fadeout} 0.5s ease-in-out forwards`,
	},
	'& .MuiTableCell-root, & .MuiInputBase-root': {
		fontSize: '0.8rem',
	},
});

type TableRowProps = {
	row: Device;
	onDelete: (deviceId: string) => void;
};
const DeviceRow = (props: TableRowProps) => {
	const { row } = props;
	const frm = useForm<DeviceInput>({
		defaultValues: {
			deviceId: row.deviceId,
			udi: row.udi,
			orderId: row.orderId,
			caseId: row.caseId,
			timestamp: row.timestamp.toDateString(),
		} as DeviceInput,
	});
	return (
		<FormProvider {...frm}>
			<StyledRow key={row.deviceId}>
				<TableCellField value={row.deviceId} name="deviceId" required={'Must have a device ID'} />
				<TableCellField value={row.udi} name="udi" />
				<TableCellField value={row.orderId} name="orderId" />
				<TableCellField value={row.caseId} name="caseId" />
				<TableCellField disabled value={row.timestamp.toDateString()} name="timestamp" />
				<TableCell>
					<Stack direction={'row'} spacing={1}>
						<ButtonBase color="primary" onClick={() => props.onDelete(row.deviceId)}>
							Delete
						</ButtonBase>
						<ButtonBase onClick={() => console.log(row)}>Print</ButtonBase>
					</Stack>
				</TableCell>
			</StyledRow>
		</FormProvider>
	);
};

const TableCellField = (props: { name: keyof DeviceInput; value: string } & RegisterOptions<DeviceInput>) => {
	const {
		register,
		setFocus,
		formState: { errors },
	} = useFormContext<DeviceInput>();
	const [open, setOpen] = useState(false);
	const onClose = () => setOpen(false);
	const onOpen = () => {
		if (props.disabled) return;
		setOpen(true);
	};
	const { name, ...options } = props;
	const field = register(name, options);
	useEffect(() => {
		if (open) {
			setFocus(name);
		}
	}, [open]);
	const errorMessage = errors[name]?.message?.toString();
	return (
		<ClickAwayListener onClickAway={onClose}>
			<TableCell
				onClick={onOpen}
				sx={{ cursor: props.disabled ? 'default' : 'pointer', color: 'rgb(200,200,200)' }}>
				{open && (
					<TextField
						helperText={errorMessage}
						error={errorMessage !== undefined}
						{...field}
						variant="standard"
					/>
				)}
				{!open && props.value}
			</TableCell>
		</ClickAwayListener>
	);
};
