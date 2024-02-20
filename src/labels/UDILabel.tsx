import React, { forwardRef } from 'react';
import { Box, Stack, SxProps, Typography, styled } from '@mui/material';

// Import a function that generates a barcode image URL

export type UDILableProps = {
	udi: string;
	barcodeUrl?: string;
	show?: boolean;
};

export const UDILabel = forwardRef<HTMLDivElement, UDILableProps>((props, ref) => {
	const { udi, barcodeUrl, show } = props;
	const sx: SxProps = {
		position: show ? 'relative' : 'absolute',
		left: show ? '0' : '-9999px',
	};
	/** UDI should be in this format 'XXX-XXX-XXX */
	const renderValue = 'UDI: ' + [udi.slice(0, 3), udi.slice(3, 6), udi.slice(6)].join('-');
	return (
		<StyledStack
			id={'udi-label'}
			aria-label={'UDI Label'}
			direction={'column'}
			justifyContent={'center'}
			sx={sx}
			ref={ref}>
			{barcodeUrl && <img src={barcodeUrl} alt="UDI Barcode" />}

			<StyledText>{renderValue}</StyledText>
		</StyledStack>
	);
});

const StyledStack = styled(Stack)({
	width: '2in',
	gap: '5pt',
	height: '1in',
	background: 'white',
	padding: '0 8pt',
	color: 'black',
	overflow: 'hidden',
});

const StyledText = styled(Typography)({
	fontSize: '14pt',
	fontFamily: 'Arial',
	margin: 0,
	textAlign: 'center',
	lineHeight: '14pt',
});
