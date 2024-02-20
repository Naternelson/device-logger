import { Box, keyframes, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import { easeOutBack, easeOutExpo } from '.';

export type ProgressBarProps = {
    /**
     * The current progress of the bar, out of 100. If suplied, it will override the amount and total
     */
	progress?: number;
    /**
     * The total amount of progress, compared to the amount
     */
	total?: number;
    /**
     * The amount of progress, out of the total
     */
	amount?: number;
    
};

export const ProgressBar = (props: ProgressBarProps) => {
	return <ProgressBarBase {...props} />;
};

export const ProgressBarBase = (props: ProgressBarProps) => {
	const { progress, total, amount } = props;
	const percent = (progress ? progress : amount && total ? amount / total : 0) * 100;

	return <PBar data-complete={percent === 100} data-percent={percent} />;
};

const glow = keyframes({
	'0%': {
		boxShadow: '0 0 3px 1px rgba(255, 255, 255, 0.5)',
	},

	'50%': {
		boxShadow: '0 0 5px 3px rgba(255, 255, 255, 0.5)',
	},

	'100%': {
		boxShadow: '0 0 0px 1px rgba(255, 255, 255, 0.5)',
	},
});

import { BoxProps } from '@mui/material';

const wipeOnComplete = keyframes({
	'0%': {
		width: '0%',
	},

	'100%': {
		width: '100%',
	},
});

const animateGlow = (percent: number, complete: boolean) => {
	if (percent <= 0) return 'none';
	if (complete) return `${glow} 5s 1 alternate both`;
	else return `${glow} 5s infinite alternate both`;
};

const PBar = styled(Box)<BoxProps & { ['data-percent']: number; ['data-complete']: boolean }>(
	({ theme, 'data-percent': dataPercent, 'data-complete': complete }) => ({
		position: 'relative',
		width: '100%',
		height: '.3rem',
		borderRadius: '20px',
		border: '0.5px solid rgb(150,150,150)',
		minWidth: '100px',
		boxSizing: 'border-box',
		'&:before': {
			borderRadius: '20px',
			position: 'absolute',
			transition: `width 300ms ${easeOutExpo}`,
			content: "''",
			backgroundColor: 'rgb(200,200,200)',
			width: `${dataPercent}%`,
			left: 0,
			height: '100%',
			animation: `${animateGlow(dataPercent, complete)}`,
		},
		'&:after': {
			position: 'absolute',
			content: "''",
			backgroundColor: theme.palette.success.main,
			width: '0%',
			height: '150%',
			left: 0,
			top: '-25%',
			animation: `${complete ? `${wipeOnComplete} 1500ms ease-out both` : ''}`,
			borderRadius: '20px',
		},
	}),
);
