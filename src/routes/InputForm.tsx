import {
	Box,
	Button,
	ButtonBase,
	Divider,
	FormControl,
	List,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	TextField,
	Tooltip,
	Typography,
	styled,
} from '@mui/material';
import { useTabContext } from './root';
import { ArrowDropDown, Refresh } from '@mui/icons-material';
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OrderStatus, db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { DeviceEntryForm } from '../forms/DeviceEntry/form';

type DeviceInput = {
	deviceId: string;
	udi: string;
	orderId: string;
	caseId: string;
};

export const InputForm = (props: { value: number }) => {
	const tabContext = useTabContext();

	const ctx = useForm<DeviceInput>({
        defaultValues: {
            deviceId: '',
            udi: '',
            orderId: '',
            caseId: ''
        },
        mode: "onBlur"
    });
	

    const handleSumbit: SubmitHandler<DeviceInput> = async (data) => {
        const result = await db.addDevice({
			...data,
			deviceId: data.deviceId.trim(),
			udi: data.udi.trim(),
			timestamp: new Date(),
		});
		const row = await db.devices.get(result);
        console.log(row);
    }
    const onSubmit = ctx.handleSubmit(handleSumbit);

	return (
		<ContentBox hidden={props.value !== tabContext.value}>
			<DeviceEntryForm/>
			{/* <FormProvider {...ctx}>
				<form onSubmit={onSubmit}>
					<Stack direction={'column'} spacing={2}>
						<Typography variant="h1"> Input Form</Typography>
						<Divider />
						<Stack direction={'row'} spacing={2}>
							<Stack direction={'column'} spacing={2} flex={1}>
								<DeviceIdField triggerSubmit={onSubmit}/>
								<UdiField triggerSubmit={onSubmit}/>
								<Stack direction={'row'} justifyContent={'flex-start'}>
									<Button size="small" variant={'contained'} type="submit">
										Submit
									</Button>
								</Stack>
							</Stack>
							<Stack direction={'column'} spacing={2} flex={1}>
								<List disablePadding dense>
									<OrderSelectField />
									<CaseSelectField />
								</List>

								<input hidden type={'text'} name={'caseId'} />
							</Stack>
						</Stack>
					</Stack>
				</form>
			</FormProvider> */}
		</ContentBox>
	);
};

const ContentBox = styled(Box)({
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	// margin: 'auto',
	

});
