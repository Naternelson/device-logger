import {
	Box,
	Button,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	SelectChangeEvent,
	Stack,
	Typography,
    styled,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActiveCase as ActiveCaseType, Order, db, getAllOrders, useActiveCaseSub } from '../../database';
import { fadeup } from '../../utility/keyframes';
import { ActiveCasePage } from './ActiveCasePage';

const dummyData:ActiveCaseType = {
    id: "activ",
    activeOrder: "WO123",
    activeCase: "20240205001",
}
export const HomePage = () => {
	let activeData = useActiveCaseSub(db);
    
    activeData = {state: "fulfilled", data: dummyData}
	const nav = useNavigate();
	useEffect(() => {
		if (activeData.state === 'pending') return;
		if (activeData.state === 'rejected') return console.error(activeData.error);
		const { activeCase, activeOrder } = activeData.data || {};

		if (activeCase && activeOrder) {
			nav(`?orderId=${activeOrder}&caseId=${activeCase}`);
		}
	}, [activeData.state, activeData.data?.activeCase, activeData.data?.activeOrder]);
    const {state} = activeData
    if(state == "fulfilled") return <ActiveCasePage orderId={activeData.data?.activeOrder || ""} caseId={activeData.data?.activeCase || ""} />
    if(state == "rejected") return <NoActiveCase />
    return null 
};

const NoActiveCase = () => {
	const nav = useNavigate();
	const [orderList, setOrderList] = useState<Order[]>([]);
	const [value, setValue] = useState<string>('');
	useEffect(() => {
		getAllOrders(db).then((orders) => {
			setOrderList(orders);
			if (orders.length > 0) setValue(orders[0].orderId);
			else setValue('No Orders Available');
		});
	}, []);
	const handleChange = (event: SelectChangeEvent) => {
		setValue(event.target.value as string);
	};

	return (
		<Stack flexGrow={1} justifyContent={'center'} alignItems={'center'}>
			<Stack
				gap={3}
				direction={'column'}
				justifyContent={'center'}
				alignItems={'center'}
				width={400}
				divider={<Divider flexItem />}>
				<Typography variant="h1">No Active Order</Typography>
				<Paper elevation={2} sx={{ padding: 3 }}>
					<Typography variant="subtitle1" fontStyle={'italic'} textAlign={'center'}>
						Select or create an order to begin
					</Typography>
					<Stack
						direction={'row'}
						marginTop={1}
						gap={3}
						width={'400px'}
						justifyContent={'space-between'}
						divider={<Divider flexItem orientation="vertical" />}>
						<StyledFormControl variant="standard" sx={{ minWidth: 175, animationDelay: "0.3s" }}>
							<InputLabel id="order-select-label">Select Order</InputLabel>
							<Select
								placeholder="Select an order"
								variant="standard"
								labelId="order-select-label"
								value={value !== '' ? value : undefined}
								onChange={handleChange}
								label="Select Order">
								<MenuItem disabled value={''}>
									{orderList.length > 0 ? 'Select an order' : 'No orders available'}
								</MenuItem>
								{orderList.map((order) => (
									<MenuItem key={order.orderId} value={order.orderId}>
										{order.orderId}
									</MenuItem>
								))}
							</Select>
						</StyledFormControl>
						<StyledButton
							variant="text"
							size="small"
							onClick={() => nav('/orders/new')}>
							Create New Order
						</StyledButton>
					</Stack>
				</Paper>
				<Box />
			</Stack>
		</Stack>
	);
};

const StyledFormControl = styled(FormControl)({
    minWidth: 175,
    animation: `${fadeup} 0.4s 0.3s ease-out both`
});

const StyledButton = styled(Button)({
    minWidth: 175,
    marginTop: "1rem",
    animation: `${fadeup} 0.4s 0.4s ease-out both`
});
