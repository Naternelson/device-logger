import { Stack, styled } from "@mui/material";

export type DeviceInput = {
	deviceId: string;
	udi: string;
	orderId: string;
	caseId: string;
	timestamp: string;
};

export const StyledStack = styled(Stack)({
	flexDirection: 'column',
	color: 'rgb(150,150,150)',
	transition: 'color 0.3s',
	'&:hover,&:focus-within': {
		color: 'rgb(255,255,255)',
	},
	'&:hover.disabled': {
		color: 'rgb(150,150,150)',
	},
	'& input.hidden-field': {
		position: 'absolute',
		top: '-1000px',
	},
});
