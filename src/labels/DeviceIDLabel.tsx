import React, { forwardRef } from 'react';
import { Box, Stack, SxProps, Typography, styled } from '@mui/material';

// Import a function that generates a barcode image URL

export type DeviceIDLabelProps = {
	deviceId: string;
	displayLine: string;
	color: string;
	barcodeUrl?: string;
	show?: boolean;
};

export const DeviceIDLabel = forwardRef<HTMLDivElement, DeviceIDLabelProps>((props, ref) => {
	const { deviceId, displayLine, color, barcodeUrl, show } = props;
	const sx: SxProps = {
		position: show ? 'relative' : 'absolute',
		left: show ? '0' : '-9999px',
	}
	return (
		<StyledStack
			id={'device-label'}
			aria-label={'Device Label'}
			direction={'column'}
			justifyContent={'center'}
			sx={sx}
			ref={ref}>
			<StyledText>{displayLine}</StyledText>
			<StyledText>{color}</StyledText>
			<StyledText>{deviceId}</StyledText>

			{barcodeUrl && <img src={barcodeUrl} alt="Device Barcode" />}
		</StyledStack>
	);
});

const StyledStack = styled(Stack)({
	width: '2in',
	gap: '2pt',
	height: '1in',
	background: 'white',
	padding: '0 8pt',
	color: 'black',
	overflow: 'hidden',
});

const StyledText = styled(Typography)({
	fontSize: '8pt',

	fontFamily: 'Arial',
	margin: 0,
	lineHeight: '8pt',
});
