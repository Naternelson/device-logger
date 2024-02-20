import { PropsWithChildren, createContext, useContext, useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import { createOrder, db } from '../../../database';
import { useSound } from '../../../sounds';
import { useSearchParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export type FormFields = {
	orderId: string;
	productId: string;
	quantity: number;
	dueOn: Dayjs;
	orderedOn: Dayjs;
};

export const NewOrderProvider = ({ data, children }: PropsWithChildren<{ data?: Partial<FormFields> }>) => {
	const { navSelectionCompleteCelebration, alertError02 } = useSound();
	const [searchParams, setSearchParams] = useSearchParams();
	const producId = searchParams.get('productId');

	const successSound = navSelectionCompleteCelebration();
	const errorSound = alertError02();
	const frm = useForm<FormFields>({
		mode: 'onTouched',
		defaultValues: {
			productId: producId || '',
			orderId: '',
			quantity: 1,
			orderedOn: dayjs(new Date()),
			dueOn: dayjs(new Date()),
			...data,
		},
	});
	const currentProductId = frm.watch('productId');
	const onSubmit = async (data: FormFields) => {
		try {
			const order = {
				...data,
				dueOn: data.dueOn.toDate(),
				orderedOn: data.orderedOn.toDate(),
			};

			await createOrder(db, order)
			successSound.play();
			frm.reset();
		} catch (error) {
			console.error(error);
			throw error; 
		}
	};
	useEffect(() => {
		if (Object.keys(frm.formState.errors).length === 0) return;
		errorSound.play();
	}, [
		Object.keys(frm.formState.errors)
			.map((k) => frm.formState.errors[k as keyof FormFields]?.message)
			.join(''),
	]);

	useEffect(() => {
		if (currentProductId === producId) return;
		if (currentProductId) {
			setSearchParams({ productId: currentProductId });
		}
	}, [currentProductId]);
	return (
		<FormProvider {...frm}>
			<FormContext.Provider value={onSubmit}>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<form onSubmit={frm.handleSubmit(onSubmit)}>{children}</form>
				</LocalizationProvider>
			</FormContext.Provider>
		</FormProvider>
	);
};

const FormContext = createContext<SubmitHandler<FormFields> | undefined>(undefined);

export const useNewOrderSubmit = () => {
	const { trigger, getValues } = useFormContext<FormFields>();
	const onSubmit = useContext(FormContext);
	return async () => {
		const isValid = await trigger();
		if (isValid) {
			const data = getValues();
			onSubmit?.(data);
		}
	};
};
