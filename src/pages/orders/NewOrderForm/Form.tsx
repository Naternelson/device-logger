import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';
import { db, getAllProducts, validateOrderIdUniqueness } from '../../../database';

import { FormFields, NewOrderProvider, useNewOrderSubmit } from './Provider';
import { useEffect, useState } from 'react';
import { FormField, FormFieldProps } from '../../../components';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useForm, useFormContext } from 'react-hook-form';

export const NewOrderDialogForm = () => {
	const nav = useNavigate();
	const onClose = () => nav('../');
	return (
		<Dialog open={true} onClose={onClose}>
			<NewOrderProvider>
				<DialogTitle sx={{textAlign: "center", fontStyle: "italic"}}>
					New Order
				</DialogTitle>
				<Divider />
				<DialogContent>
					<Stack direction={'column'} spacing={1} minWidth={'300px'}>
						<OrderIdField />
						<ProductIdField />
						<QuantityField />
						<Stack direction={'row'} spacing={2}>
							<OrderedOnField />
							<DueOnField />
						</Stack>
					</Stack>
				</DialogContent>
				<Divider />
				<DialogActions>
					<SubmitButton onClose={onClose} />
					<Button onClick={onClose}>Cancel</Button>
				</DialogActions>
			</NewOrderProvider>
		</Dialog>
	);
};

const SubmitButton = (props: { onClose: () => void }) => {
	const { onClose } = props;
	const submit = useNewOrderSubmit();
	return (
		<Button
			type={'submit'}
			onClick={async (e) => {
				e.preventDefault();
				await submit();
				console.log("submitting")
				onClose();
			}}>
			Save
		</Button>
	);
};
export const OrderIdField = () => {
	const orderIdFieldProps: FormFieldProps<FormFields> = {
		name: 'orderId',
		label: 'Order ID',
		options: {
			required: 'Order ID is required',
			validate: {
				isUnique: async (value) => {
					if (typeof value !== 'string') return 'Order ID is invalid';
					return validateOrderIdUniqueness(db, value)
						.then(() => true)
						.catch(() => 'Order ID already exists');
				},
			},
		},
	};
	return <FormField {...orderIdFieldProps} />;
};

export const ProductIdField = () => {
	const [products, setProducts] = useState<{ id: string; label: string }[]>([]);
	useEffect(() => {
		getAllProducts(db).then((p) => {
			setProducts(p.map((p) => ({ id: p.productId, label: `${p.name}: ${p.productId}` })));
		});
	}, []);
	const productIdFieldProps: FormFieldProps<FormFields> = {
		name: 'productId',
		label: 'Product',
		type: 'select',
		items: products,
	};
	return <FormField {...productIdFieldProps} />;
};
export const QuantityField = () => {
	const quantityFieldProps: FormFieldProps<FormFields> = {
		name: 'quantity',
		label: 'Quantity',
		type: 'number',
		options: {
			required: 'Quantity is required',
			validate: {
				positive: (value) => {
					if(typeof Number(value) !== 'number') return 'Quantity is invalid';
					return Number(value) > 0 || 'Quantity must be greater than 0';
				},
			},
		
		}
	};
	return <FormField {...quantityFieldProps} />;
};

export const OrderedOnField = () => {
	const dueOnDate = useFormContext<FormFields>().watch('dueOn');	
	const orderOnFieldProps: FormFieldProps<FormFields> = {
		name: 'orderedOn',
		label: 'Ordered On',
		type: 'date',
		options: {
			validate: {
				beforeDueOn: (value, { dueOn }) => {
					if (!value || !dueOn) return true;
					if (!isDayjs(value)) return true;
					const dayjsValue = dayjs(value);
					const dayjsDueOn = dayjs(dueOn);
					return dayjsValue.isBefore(dayjsDueOn) || 'Order date must be before due date';
				},
			},
		},
		DateFieldProps: {
			maxDate: dueOnDate
		}
	};
	return <FormField {...orderOnFieldProps} />;
};

export const DueOnField = () => {
	
	const orderedOn = useFormContext<FormFields>().watch('orderedOn');
	const dueOnFieldProps: FormFieldProps<FormFields> = {
		name: 'dueOn',
		label: 'Due On',
		type: 'date',
		options: {
			validate: {
				afterOrderedOn: (value, { orderedOn }) => {
					if (!value || !orderedOn) return true;
					if (!isDayjs(value)) return true;

					const dayjsValue = dayjs(value);
					const dayjsOrderedOn = dayjs(orderedOn);
					return dayjsValue.isAfter(dayjsOrderedOn) || 'Due date must be after order date';
				},
			},
		},
		DateFieldProps: {
			minDate: orderedOn
		}
	};
	return <FormField {...dueOnFieldProps} />;
};
const isDayjs = (d: any): d is Dayjs => {
	return d instanceof dayjs;
};
