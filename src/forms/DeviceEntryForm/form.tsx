import { FormProvider, useForm } from 'react-hook-form';
import { DeviceInput } from './types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Device } from '../../db';
import { ButtonBase, Card, Divider, Stack, Typography, colors, easing, styled } from '@mui/material';
import { DeviceInputField, SubmitField, UDIInputField } from './fields';
import { DevicesTable } from './table';
import { OrderDialog } from './Dialogs/Order';
import PrimaryClick from '../../sounds/click-primary.mp3';
import { Howl } from 'howler';
import { Order, db, useActiveOrderSub } from '../../database';
import { DeviceIDLabel } from '../../labels/DeviceIDLabel';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { dialog } from '@tauri-apps/api';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { useBarcode } from '../../utility/generateBarcode';
import { UDILabel } from '../../labels/UDILabel';
import { CaseLabel } from '../../labels/CaseLabel';

const randomChars = (length: number) => {
	const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const dummy = '123456';
export const MainEntryForm = () => {
	const frm = useForm<DeviceInput>({ mode: 'onBlur' });
	const [rows, setRows] = useState<Device['deviceId'][]>([]);
	const [data, setData] = useState<Record<Device['deviceId'], Device>>({});
	const onSubmit = async (data: DeviceInput) => {
		const device: Device = {
			deviceId: data.deviceId.toUpperCase(),
			udi: data.udi.toUpperCase(),
			timestamp: new Date(),
			orderId: 'WO123',
			caseId: '20240205001',
		};
		setRows((el) => {
			if (el.includes(device.deviceId)) return el;
			return [device.deviceId, ...el];
		});

		setData((el) => {
			if (el[device.deviceId]) return el;
			return { ...el, [device.deviceId]: device };
		});

		const sound = new Howl({ src: [PrimaryClick], volume: 0.1 });
		sound.play();
		frm.setFocus('deviceId');
		frm.reset();
	};
	const onDelete = (deviceId: string) => {
		setRows((el) => el.filter((e) => e !== deviceId));
		setData((el) => {
			const copy = { ...el };
			delete copy[deviceId];
			return copy;
		});
	};
	const ref = useRef<HTMLDivElement>(null);
	const barcodeImage = useBarcode(dummy);
	const barcodeImage2 = useBarcode('123456789', { height: 15 });
	const caseBarcode = useBarcode('20240205001', {
		height: 8,
		bcid: 'code128',
		includetext: true,
		textsize: 8,
	});
	const productIdBarcode = useBarcode('123456', {
		height: 8,
		bcid: 'code128',
		includetext: true,
		textsize: 8,
	});
	const countBarcode = useBarcode('24', {
		height: 8,
		bcid: 'code128',
		includetext: true,
		textsize: 8,
		scaleX: 2,
		scaleY: 2,
		"paddingwidth": 10,
	});
	/**
	 * 
	 * devices Barcode should be a datamatix barcode
	 */
	const deviceList = useMemo(() => Array(24).fill(0).map(() => randomChars(6)).join('.'), []);
	const deviceBarcode = useBarcode(deviceList, {
		// height: 3,
		// scale: 10,
		bcid: 'qrcode',
		
	});
	const onPrintClick = async () => {
		if (!ref.current) return;
		if (!barcodeImage) return;
		const input = ref.current;
		const canvas = await html2canvas(input, {
			scale: 2,
			useCORS: true,
		});
		const imgData = canvas.toDataURL('image/png');

		const pdf = new jsPDF({
			orientation: 'landscape',
			unit: 'in',
			format: [2, 1],
		});

		pdf.addImage(imgData, 'PNG', 0, 0, 2, 1);

		const savePath = await dialog.save({
			defaultPath: 'DeviceLabel.pdf',
			filters: [
				{
					name: 'PDF',
					extensions: ['pdf'],
				},
			],
		});
		if (!savePath) return;
		window.print();
		await writeBinaryFile(savePath, pdf.output('arraybuffer'));
	};
	return (
		<Stack
			direction="column"
			height={'100vh'}
			spacing={2}
			sx={{ boxSizing: 'border-box', maxWidth: '1000px', margin: 'auto', paddingY: '2rem' }}>
			<FormProvider {...frm}>
				<form onSubmit={frm.handleSubmit(onSubmit)}>
					<Stack direction={'column'} spacing={2} position={'relative'}>
						<Stack direction={'row'} spacing={2} position={'relative'}>
							<OrderCard />
							<CaseCard count={rows.length} />
						</Stack>
						<Card elevation={10} sx={{ padding: '1rem', width: '100%', height: '100%' }}>
							<Stack direction={'column'} spacing={1} flex={1} minWidth={'100px'} divider={<Divider />}>
								<Typography variant="h6">Device Entry</Typography>
								<Stack direction="row" spacing={2} position="relative">
									<DeviceInputField />
									<UDIInputField />
									<SubmitField onSubmit={onSubmit} />
								</Stack>
							</Stack>
						</Card>
					</Stack>
				</form>
			</FormProvider>
			<ButtonBase onClick={onPrintClick}>Print</ButtonBase>
			<Stack direction={'row'} spacing={2}>
				<DeviceIDLabel
					barcodeUrl={barcodeImage}
					deviceId={dummy}
					displayLine={'BelleX Model Y Supper Sonic'}
					color={'Black'}
					show
				/>
				<UDILabel barcodeUrl={barcodeImage2} udi={'123456789'} show />
				<CaseLabel count={24} productName='Belle X AT&T' caseBarcodeUrl={caseBarcode} caseId={'20240205001'}productIdBarcodeUrl={productIdBarcode} countBarcodeUrl={countBarcode} deviceIdsBarcodeUrl={deviceBarcode} productId={'123456'} show />
			</Stack>
			<DevicesTable rows={rows} data={data} onDelete={onDelete} />
		</Stack>
	);
};

const OrderCard = () => {
	const { order, count } = useActiveOrderSub(db);
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	return (
		<Card elevation={3} sx={{ padding: '1rem', width: '150px', height: '150px' }}>
			<Stack direction={'column'} height={'100%'} spacing={1}>
				<Typography variant="h6" textAlign={'center'}>
					Order Information
				</Typography>
				<Divider flexItem />
				{order ? (
					<CardContent
						order={order}
						count={count || 0}
						handleOpen={handleOpen}
						handleClose={handleClose}
						open={open}
					/>
				) : (
					<Stack direction={'column'} flexGrow={1} justifyContent={'center'}>
						<ButtonBase onClick={handleOpen}>
							<Typography textAlign={'center'} variant="caption" sx={{ color: 'rgb(150,150,150)' }}>
								No Active Order
							</Typography>
						</ButtonBase>
						<OrderDialog open={open} onClose={handleClose} />
					</Stack>
				)}
			</Stack>
		</Card>
	);
};

const CardContent = (props: {
	order: Order;
	count: number;
	handleOpen: () => void;
	handleClose: () => void;
	open: boolean;
}) => {
	const { order, handleOpen, handleClose, open, count } = props;
	return (
		<Stack direction={'column'}>
			<ButtonBase onClick={handleOpen}>
				<Typography textAlign={'center'}>{`WO123`}</Typography>
			</ButtonBase>
			<OrderDialog open={open} onClose={handleClose} />
			<ProgressBar
				direction={'row'}
				spacing={1}
				alignItems={'center'}
				data-percentage={(count / order.quantity) * 100}>
				<span>{`${count} / ${order.quantity}`}</span>
				<Typography variant="subtitle1" fontStyle={'oblique'} color={'white'}>{`${Math.floor(
					(count / order.quantity) * 100,
				)}%`}</Typography>
			</ProgressBar>
			<Typography sx={{ fontSize: '.75rem', textAlign: 'center', color: 'rgb(150,150,150)' }}>
				{order.productId}
			</Typography>
		</Stack>
	);
};

const ProgressBar = styled(Stack)<{ 'data-percentage': number; 'data-color'?: string }>`
	position: relative;
	padding: 0.25rem;
	justify-content: flex-end;
	width: 100%;
	font-size: 0.75rem;
	color: rgb(200, 200, 200);
	border-radius: 5px;
	background: rgba(10, 10, 10, 0.4);
	overflow: hidden;
	z-index: 1;
	&:before {
		position: absolute;
		content: '';
		fontstyle: oblique;
		left: 0;
		width: ${(props) => props['data-percentage']}%;
		height: 75%;
		filter: drop-shadow(3px 3px 8px rgba(20, 20, 20, 0.3));
		background-color: ${(props) => props['data-color'] || 'rgba(25, 140, 0, 0.5)'};
		transition-property: width;
		transition-duration: 0.5s;
		transition-timing-function: ${easing.easeInOut};
		border-radius: 0 5px 5px 0;
		z-index: -1;
	}
`;

const CaseCard = (props: { count: number }) => {
	const c = colors.lightBlue[900];
	const size = 24;
	return (
		<Card
			elevation={3}
			sx={{ padding: '1rem', width: '150px', height: '150px', position: 'relative', overflow: 'visible' }}>
			<Stack direction={'column'} height={'100%'} flex={1} spacing={1}>
				<Typography variant="h6" textAlign={'center'}>
					Case Information
				</Typography>
				<Divider flexItem />
				<Stack direction={'column'} flex={1} justifyContent={'center'}>
					<Typography textAlign={'center'} margin={0} sx={{ cursor: 'pointer' }}>{`20240205001`}</Typography>
					<ProgressBar
						data-color={c}
						direction={'row'}
						spacing={1}
						alignItems={'center'}
						data-percentage={(props.count / size) * 100}>
						<span>{`${props.count} / ${size}`}</span>
						<Typography variant="subtitle1" fontStyle={'oblique'} color={'white'}>{`${Math.floor(
							(props.count / size) * 100,
						)}%`}</Typography>
					</ProgressBar>
				</Stack>
			</Stack>
		</Card>
	);
};
