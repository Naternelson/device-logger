import React, { forwardRef, useEffect, useState } from 'react';
import { Box, Divider, Stack, SxProps, Typography, styled } from '@mui/material';
import { datamatrix } from 'bwip-js/browser';
// Import a function that generates a barcode image URL

export type CaseLabel = {
	caseId: string;
	productId: string;
	count: number;
	productName: string;
	caseBarcodeUrl?: string;
	productIdBarcodeUrl?: string;
	countBarcodeUrl?: string;
	deviceIdsBarcodeUrl?: string;
	show?: boolean;
};

const randChar = (length: number) => {
    const result = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
}

export const CaseLabel = forwardRef<HTMLDivElement, CaseLabel>((props, ref) => {
	const {
		productName,
		caseBarcodeUrl,
		productIdBarcodeUrl,
		countBarcodeUrl,
		show,
	} = props;
	const sx: SxProps = {
		position: show ? 'relative' : 'fixed',
		left: show ? '0' : '-9999px',
	};
	const [data, setData] = useState('');
	useEffect(() => {
		const c = document.createElement('canvas');
		document.body.appendChild(c);
		const text = Array(24)
			.fill(0)
			.map((_v, i) =>randChar(6))
			.join(',');
        console.log({text, length: text.length, count: text.split(',').length})
		datamatrix(c, {
			bcid: "datamatrix",
			text: text,
			includetext: false,
			textxalign: 'center',
		});
		c.toDataURL('image/png');
		setData(c.toDataURL('image/png'));
		document.body.removeChild(c);
	}, []);

	return (
		<StyledStack aria-label={'Case Label'} direction={'row'} justifyContent={'space-evenly'} sx={sx} ref={ref}>
			<Stack direction={'column'} justifyContent={'center'} spacing={2}>
				<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} spacing={1}>
					<StyledText>CASE ID:</StyledText>
					{caseBarcodeUrl && <BarcodeImage src={caseBarcodeUrl} alt="Case Barcode" />}
				</Stack>
				<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} spacing={1}>
					<StyledText>SKU:</StyledText>
					{productIdBarcodeUrl && (
						<Stack flex={1} justifyContent={'center'} alignItems={'center'}>
							<BarcodeImage src={productIdBarcodeUrl} alt="Product ID Barcode" />
						</Stack>
					)}
				</Stack>
				<Stack direction={'row'} spacing={1} justifyContent={'space-between'} alignItems={'center'}>
					<StyledText>COUNT:</StyledText>
					{countBarcodeUrl && (
						<Stack flex={1} justifyContent={'center'} alignItems={'center'}>
							<BarcodeImage src={countBarcodeUrl} alt="Case Count Barcode" />
						</Stack>
					)}
				</Stack>
			</Stack>

			<Stack direction={'column'} justifyContent={'center'} alignItems={'center'} >
				<Typography variant="overline">Devices</Typography>
				{data && <DataMatrix src={data} alt="Device IDs Barcode" />}
				<Typography variant="overline">{productName}</Typography>
			</Stack>
		</StyledStack>
	);
});

const StyledStack = styled(Stack)({
	width: '4in',
	gap: '3pt',
	height: '2in',
	background: 'white',
	padding: '2%',
	color: 'black',
	overflow: 'hidden',
});

const BarcodeImage = styled('img')({
	objectFit: 'contain',
	height: '.35in',
});

const StyledText = styled(Typography)({
	fontSize: '8pt',
	fontFamily: 'Arial',
	margin: 0,
	lineHeight: '8pt',
	width: '0.75in',
	textAlign: 'right',
});

const DataMatrix = styled('img')({
	objectFit: 'contain',
	height: "1in",
	width: '1in',
});
