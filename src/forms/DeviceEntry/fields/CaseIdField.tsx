import { ArrowDropDown, Refresh } from '@mui/icons-material';
import {
	Box,
	ButtonBase,
	FormControl,
	MenuItem,
	Menu,
	Stack,
	Tooltip,
	Typography,
	ListItemText,
	FormHelperText,
	IconButton,
	Divider,
	Paper,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import { DeviceInput } from '../types';
import { OrderInformationCard } from './OrderInformationCard';
import { useActiveCaseSubscription } from '../../../db/tables';

export const CaseSelectField = () => {
	const {
		register,
		setValue: setFormValue,
		watch,
		formState: { errors },
	} = useFormContext<DeviceInput>();
	const orderId = watch('orderId');
	const activeCase = useActiveCaseSubscription(orderId)
	const cases = useLiveQuery(() => {
		if (orderId === undefined) return [];
		return db.cases.where('orderId').equalsIgnoreCase(orderId).toArray();
	}, [orderId]);
	const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
	const ref = useRef<HTMLButtonElement>(null);
	const [value, setValue] = useState(activeCase || '');
	const handleChange = useCallback(
		(value: string) => {
			console.log('Setting case ID', value);
			setValue(value);
			setFormValue('caseId', value);
			handleClose();
		},
		[setFormValue],
	);
	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleOpen: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		e.stopPropagation();
		e.preventDefault();
		setAnchorEl(ref.current);
	};

	const errorMessage = errors.caseId?.message?.toString();
	const refreshCaseId = useCallback(() => {
		if (!orderId) return;
		db.nextCaseId(orderId).then(handleChange).catch(console.error);
	}, [orderId, handleChange]);
	useEffect(() => {
		if (cases && cases.length > 0) {
			handleChange(cases[0].caseId);
		}
		if ((!cases || cases.length === 0) && !!orderId) {
			refreshCaseId();
		}
	}, [cases, handleChange, orderId]);

	useEffect(() => {
		console.log({orderId, activeCase})
	},[orderId, activeCase])
	return (
		<FormControl fullWidth error={errorMessage !== undefined}>
			<Paper elevation={10} sx={{ padding: '1rem' }}>
				<Box
					sx={{
						color: 'rgb(150,150,150)',
						'&:hover': {
							'& .select': {
								color: 'rgb(255,255,255)',
							},
						},
						'& .select': {
							transition: 'color 0.2s',
							color: 'rgb(150,150,150)',
						},
					}}>
					<Stack direction={'column'} spacing={1} divider={<Divider />}>
						<Typography variant="h2">Case</Typography>
						<Stack direction={'row'} spacing={1} alignItems={'center'}>
							<Typography className="select">{value || 'No Case Selected'}</Typography>

							<Tooltip title={'Refresh Case ID'} arrow>
								<IconButton onClick={refreshCaseId} className="select">
									<Refresh fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title={'Choose an Case'} arrow>
								<IconButton onClick={handleOpen} className="select">
									<ArrowDropDown />
								</IconButton>
							</Tooltip>
						</Stack>
					</Stack>
					{errorMessage !== undefined && (
						<FormHelperText error={errorMessage !== undefined}>{errorMessage}</FormHelperText>
					)}
				</Box>
			</Paper>
			<Menu
				MenuListProps={{ dense: true }}
				open={!!anchorEl}
				onClose={handleClose}
				anchorEl={anchorEl}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
				{cases?.map((order) => {
					return (
						<MenuItem key={order.id} onClick={() => handleChange(order.caseId)}>
							<ListItemText>{order.id}</ListItemText>
						</MenuItem>
					);
				})}
				{!!cases && cases.length === 0 && <MenuItem disabled>No Cases</MenuItem>}
			</Menu>
			<input {...register('caseId', { required: 'Must have a valid case ID' })} hidden value={value} />
		</FormControl>
	);
};

const CaseIdField = () => {
	const {formState: {errors}, register} = useFormContext<DeviceInput>();
	const errorMessage= errors.caseId?.message?.toString();
	return <OrderInformationCard title="Case" errorMessage={errorMessage}>

		<CaseIdInputField value={''} />
	</OrderInformationCard>
}

const CaseIdInputField = ({value}: {value:string}) => {
	const {register} = useFormContext<DeviceInput>();
	return <input {...register('caseId', {required: 'Must have a valid case ID'})} value={value} />
}