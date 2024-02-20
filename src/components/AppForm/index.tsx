import { PropsWithChildren, createContext, useContext } from 'react';
import {
	FieldValues,
	FormProvider,
	SubmitHandler,
	UseFormProps,
	useForm,
} from 'react-hook-form';

export type AppFormProviderProps<TFieldValues extends FieldValues = FieldValues, TContext = any> = PropsWithChildren<
	UseFormProps<TFieldValues, TContext>
> & {
	onSubmit: SubmitHandler<TFieldValues>;
};

export const AppFormProvider = <TFieldValues extends FieldValues = FieldValues, TContext = any>({
	children,
	onSubmit,
	...rest
}: AppFormProviderProps<TFieldValues, TContext>) => {
	const frm = useForm<TFieldValues, TContext>(rest);
	const handleSubmit = frm.handleSubmit(onSubmit);
	const Context = SubmitHandlerContext<TFieldValues>();
	return (
		<FormProvider {...frm}>
			<Context.Provider value={onSubmit}>
				<form onSubmit={handleSubmit}>{children}</form>
			</Context.Provider>
		</FormProvider>
	);
};

const SubmitHandlerContext = <TFieldValues extends FieldValues>() =>
	createContext<SubmitHandler<TFieldValues> | undefined>(undefined);

export const useOnSubmit = <TFieldValues extends FieldValues>() => {
    return useContext(SubmitHandlerContext<TFieldValues>());
};