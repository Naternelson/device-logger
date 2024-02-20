import { useFormContext } from 'react-hook-form';
import { DeviceInput } from '../types';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	Box,
	Divider,
	FormControl,
	FormHelperText,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import { activateOrder, useActiveOrderSubscription, useOrderListSubscription } from '../../../db/tables';
import { useNavigate } from 'react-router-dom';

export const OrderSelectField = () => {
	const nav = useNavigate();
	const activeOrder = useActiveOrderSubscription();
	const orders = useOrderListSubscription();
	const {
		register,
		setValue: setFormValue,
		formState: { errors },
	} = useFormContext<DeviceInput>();
	const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement>(null);
	const ref = useRef<HTMLDivElement>(null);
	const handleChange = useCallback(
		(value: string) => {
			activateOrder(value);
			setFormValue('orderId', value);
			handleClose();
		},
		[setFormValue],
	);
	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleOpen: React.MouseEventHandler<SVGSVGElement> = (e) => {
		e.stopPropagation();
		e.preventDefault();
		setAnchorEl(ref.current);
	};
	const navToOrder = () => {
		if (!activeOrder?.orderId) return;
		nav(`/orders/${activeOrder?.orderId}`);
	};
	const errorMessage = errors.orderId?.message?.toString();
	useEffect(() => {
		if (activeOrder) {
			setFormValue('orderId', activeOrder.orderId);
		}
	},[activeOrder?.orderId, setFormValue])
	return (
		<FormControl fullWidth error={!!errorMessage}>
			<Paper elevation={10} sx={{padding: "1rem"}}>
				<Box
					sx={{
						color: 'rgb(150,150,150)',
						'&:hover': {
							'& .select': {
								color: 'rgb(255,255,255)',
							},
							"& .invisible": {
								opacity: 1,
							}
						},
						'& .select': {
							transition: 'color 0.2s',
							pointer: 'cursor',
						},
						"& .invisible": {
							opacity: 0,
							transition: 'opacity 0.2s',
						}
					}}>
					<Stack direction={'column'} spacing={1} divider={<Divider />}>
						<Typography variant="h2">Order</Typography>
						<Box onClick={navToOrder}>
							<Stack direction={'row'} spacing={1} alignItems={'center'}>
								<Typography className="select" sx={{ cursor: 'pointer' }}>
									{activeOrder?.orderId}
								</Typography>
								<Tooltip title={'Choose an order'} placement="top-end" arrow>
									<Box ref={ref} display="flex" sx={{ cursor: 'pointer' }}>
										<ArrowDropDown className="select invisible" onClick={handleOpen} />{' '}
									</Box>
								</Tooltip>
							</Stack>
						</Box>
					</Stack>

					{errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
				</Box>
			</Paper>
			<Menu
				MenuListProps={{ dense: true }}
				open={!!anchorEl}
				onClose={handleClose}
				anchorEl={anchorEl}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
				{orders?.map((order) => {
					return (
						<MenuItem key={order.id} onClick={() => handleChange(order.orderId)}>
							<ListItemText>{order.orderId}</ListItemText>
						</MenuItem>
					);
				})}
				{!!orders && orders.length === 0 && <MenuItem disabled>No Orders</MenuItem>}
			</Menu>
			<input {...register('orderId', { required: 'Select an Order' })} hidden value={activeOrder?.orderId} />
		</FormControl>
	);
};
