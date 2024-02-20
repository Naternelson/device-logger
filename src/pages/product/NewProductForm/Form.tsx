import {
	Button,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Stack,
	Typography,
} from '@mui/material';
import { DefaultProductSettings, db, validateProductIdUniqueness } from '../../../database';
import { FormField } from './FormField';
import { NewProductProvider, useNewProductSubmit } from './Provider';
import { useState } from 'react';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useLoaderData } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';

export const NewProductDialogForm = (props: { open: boolean; onClose: () => void }) => {
	const { open, onClose } = props;
	const defaultSettings = useLoaderData() as DefaultProductSettings;
	const [collapseOpen, setCollapseOpen] = useState(false);
	const toggleCollapse = () => setCollapseOpen((p) => !p);
	const endIcon = collapseOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />;
	return (
		<Dialog open={open} onClose={onClose}>
			<NewProductProvider data={defaultSettings}>
				<DialogTitle>
					<Typography textAlign={'center'}>New Product</Typography>
				</DialogTitle>
				<Divider />
				<DialogContent>
					<Stack direction={'column'} spacing={0} minWidth={'300px'}>
						<ProductIdField />
						<NameField />
						<ColorField />
						<HasUdiField />
						<Button type="button" onClick={toggleCollapse} endIcon={endIcon}>
							More Settings
						</Button>
						<Collapse in={collapseOpen}>
							<Stack direction={'column'} spacing={1}>
								<Divider />
								<UdiLengthField />
								<DeviceIdLengthField />
								<CaseSizeField />
								<PalletSizeField />
							</Stack>
						</Collapse>
					</Stack>
				</DialogContent>
				<Divider />
				<DialogActions>
					<SubmitButton onClose={onClose} />
					<Button onClick={onClose}>Cancel</Button>
				</DialogActions>
			</NewProductProvider>
		</Dialog>
	);
};

const SubmitButton = (props: { onClose: () => void }) => {
	const { onClose } = props;
	const submit = useNewProductSubmit();
	return (
		<Button
			type={'submit'}
			onClick={async (e) => {
				e.preventDefault();
				await submit();
				onClose();
			}}>
			Save
		</Button>
	);
};
export const ProductIdField = () => {
	return (
		<FormField
			name={'productId'}
			label={'Product ID'}
			options={{
				required: 'Product ID is required',
				validate: {
					isUnique: async (value) => {
						if (typeof value !== 'string') return 'Product ID is invalid';
						return validateProductIdUniqueness(db, value)
							.then(() => true)
							.catch(() => 'Product ID already exists');
					},
				},
			}}
		/>
	);
};

export const NameField = () => {
	return <FormField name={'name'} label={'Name'} />;
};
export const ColorField = () => {
	return <FormField name={'color'} label={'Color'} />;
};

export const HasUdiField = () => {
	return <FormField name={'hasUdi'} label={'Has UDI'} type={'checkbox'} />;
};

export const DeviceIdLengthField = () => {
	return <FormField name={'deviceIdLength'} label={'Device ID Length'} type={'number'} />;
};

export const UdiLengthField = () => {
	return <FormField name={'udiLength'} label={'UDI Length'} type={'number'} />;
};

export const CaseSizeField = () => {
	return <FormField name={'caseSize'} label={'Case Size'} type={'number'} />;
};

export const PalletSizeField = () => {
	return <FormField name={'palletSize'} label={'Pallet Size'} type={'number'} />;
};
