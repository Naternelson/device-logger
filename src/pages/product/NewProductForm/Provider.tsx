import { PropsWithChildren, createContext, useContext, useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form';
import { createProduct, db } from '../../../database';
import { useSound } from '../../../sounds';

export type FormFields = {
	productId: string;
	name: string;
	hasUdi: boolean;
	color: string;
	udiLength: number;
	deviceIdLength: number;
	caseSize: number;
	palletSize: number;
};

export const NewProductProvider = ({ data, children }: PropsWithChildren<{ data?: Partial<FormFields> }>) => {
	const { navSelectionCompleteCelebration, alertError02 } = useSound();
	const successSound = navSelectionCompleteCelebration();
	const errorSound = alertError02();
	const frm = useForm<FormFields>({
		mode: 'onTouched',
		defaultValues: {
			productId: '',
			name: '',
			hasUdi: !!data?.hasUdi,
			color: '',
			udiLength: data?.udiLength || 0,
			deviceIdLength: data?.deviceIdLength || 0,
			caseSize: data?.caseSize || 0,
			palletSize: data?.palletSize || 0,
		},
	});
	const onSubmit = async (data: FormFields) => {
		try {
			await createProduct(db, data).catch(console.error);
			successSound.play();
			frm.reset();
		} catch (error) {
			console.error(error);
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
	return (
		<FormProvider {...frm}>
			<FormContext.Provider value={onSubmit}>
				<form onSubmit={frm.handleSubmit(onSubmit)}>{children}</form>
			</FormContext.Provider>
		</FormProvider>
	);
};

const FormContext = createContext<SubmitHandler<FormFields> | undefined>(undefined);

export const useNewProductSubmit = () => {
    const {trigger, getValues} = useFormContext<FormFields>();
	const onSubmit =  useContext(FormContext);
    return async () => {
        const isValid = await trigger();
        console.log("isValid", isValid)
        if (isValid) {
            const data = getValues();
            onSubmit?.(data);
        }
        return isValid;
    }
};
