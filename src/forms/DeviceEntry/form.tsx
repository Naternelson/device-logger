import { FormProvider, SubmitHandler, UseFormReturn, useForm, useFormContext } from 'react-hook-form';
import { Device, db } from '../../db';
import { DBErrors } from '../../dbErrors';
import { DeviceInput } from './types';
import { Box, Divider, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { DeviceIdField } from './fields/DeviceIdField';
import { OrderSelectField } from './fields/OrderIdField';
import { CaseSelectField } from './fields/CaseIdField';
import { UdiField } from './fields/UdiField';
import { useCaseDevices } from '../../dbHooks';
import { Check } from '@mui/icons-material';
import { useEffect } from 'react';

export const DeviceEntryForm = () => {
	const frm = useForm<DeviceInput>({ mode: 'onBlur' });
	const submitHandler = useSubmitHandler(frm);
	const onSubmit = frm.handleSubmit(submitHandler);
	useEffect(()=>{
		if(Object.keys(frm.formState.errors).length > 0) console.log(frm.formState.errors)
	},[frm.formState.errors])
	return (
		<FormProvider {...frm}>
			<form onSubmit={onSubmit} style={{ flex: 1, display: 'flex' }}>
				<Stack
					direction="row"
					spacing={2}
					flex={1}
					divider={<Divider flexItem orientation="vertical" />}
					paddingX={'5rem'}
					paddingY={'3rem'}>
					<Paper elevation={3} sx={{ padding: '1rem', flex: 1 }}>
						<Stack direction={'column'} spacing={2} flex={1} minWidth={"100px"}>
							<Typography variant="h6">Device Entry</Typography>
							<DeviceIdField hasUdi triggerSubmit={() => onSubmit()} />
							<UdiField required triggerSubmit={() => onSubmit()} />
							<Tooltip title={'Submit'} placement="top-end" arrow>
								<IconButton type="submit" sx={{ alignSelf: 'flex-end' }}>
									<Check color="success" />
								</IconButton>
							</Tooltip>
						</Stack>
					</Paper>
					<Paper elevation={3} sx={{ padding: '1rem', flex: 1, maxWidth: "500px" }}>
						<Stack direction={'column'} spacing={2} flex={1}>
							<Typography variant="h6">Order Information</Typography>
							<OrderSelectField />
							<CaseSelectField />
						</Stack>
					</Paper>
					<Paper elevation={3} sx={{ padding: '1rem' }}>
						<CasesDisplay />
					</Paper>
				</Stack>
			</form>
		</FormProvider>
	);
};

const useSubmitHandler = ({
	setFocus,
	reset,
	setError,
}: UseFormReturn<DeviceInput, any, undefined>): SubmitHandler<DeviceInput> => {
	return async (data) => {

		try {
			const result = await db.addDevice({
				...data,
				deviceId: data.deviceId.toUpperCase(),
				udi: data.udi.toUpperCase(),
				timestamp: new Date(),
			});
			reset();
			// Trigger a notification to the user
			alert('Device added');
			console.log(result);
		} catch (error) {
			if (!(error instanceof Error)) {
				console.log(error);
				return;
			}

			switch (error.message) {
				case DBErrors.DeviceAlreadyExists:
					setError('deviceId', { type: 'manual', message: 'Device already exists' });
					setFocus('deviceId');
					break;
				case DBErrors.DeviceUDIAlreadyExists:
					setError('udi', { type: 'manual', message: 'UDI already exists' });
					setFocus('udi');
					break;
				default:
					console.log(error);
					break;
			}
		}
	};
};

const CasesDisplay = () => {
	const { watch } = useFormContext<DeviceInput>();
	const caseId =  watch('caseId');
	const orderId =  watch('orderId');
	const devices:Device[] = [] || useCaseDevices(caseId, orderId);

	
	return (
		<Stack direction={'column'} spacing={1} height={"100%"}>
			<Typography variant="h6">Cases</Typography>
			{devices.map((d, i) => (
				<Typography key={i}>{d?.deviceId}</Typography>
			))}

			<Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<Typography variant="overline" sx={{ color: 'rgb(150,150,150)' }}>
					No Devices To Display
				</Typography>
			</Box>
		</Stack>
	);
};
