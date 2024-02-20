import {
	Box,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogProps,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	Stack,
	Typography,
    styled,
    useTheme,
} from '@mui/material';
import { Order, OrderStatus } from '../../../db';
import { Close } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';

export const OrderDialog = (props: DialogProps) => {
	const activeOrder: Order = {
		orderId: 'WO123',
		productId: 'P123',
		timestamp: new Date(),
		status: OrderStatus.Active,
		quantity: 1000,
	};
	const [value, setValue] = useState(30);
	const max = 30;
	return (
		<Dialog {...props}>
			<Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'space-between'}>
				<DialogTitle>Order Information</DialogTitle>
				<IconButton onClick={() => props.onClose?.({}, 'backdropClick')}>
					<Close fontSize="small" />
				</IconButton>
			</Stack>
			<Divider />
			<DialogContent>
				<Box sx={{ position: 'relative', display: 'inline-flex' }}>
					<AnimateProgress value={value}/>
					<Box
						sx={{
							top: 0,
							left: 0,
							bottom: 0,
							right: 0,
							position: 'absolute',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
						<AnimatePercentage value={value}/>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions></DialogActions>
		</Dialog>
	);
};

type PercentageProps = {
	value: number;
};
const AnimatePercentage = (props: PercentageProps) => {
	const { value } = props;
    const theme = useTheme();
    const currentValue = useEasing(value, { duration: 1500, delay: theme.transitions.duration.enteringScreen, easingFn: (x) => 1 - Math.pow(1 - x, 3) });
    return (
		<Typography variant="caption" component="div" color="text.secondary">{`${Math.round(
			currentValue || 0,
		)}%`}</Typography>
	);
};

const AnimateProgress = (props: PercentageProps) => {
    const { value } = props;
    const theme = useTheme();
    const currentValue = useEasing(value, { delay: theme.transitions.duration.enteringScreen, duration: 1500, easingFn: (x) => 1 - Math.pow(1 - x, 3) });
    
    useEffect(() => {
        console.log(currentValue);
    }, [currentValue]);
    return <StyledProgress variant={'determinate'} value={currentValue || 0} size={50} color="success" />;
}
const StyledProgress = styled(CircularProgress)({
    "& .MuiCircularProgress-circle": {
        transition: "none"
    }
})


const useEasing = (target: number, options?: {
    duration: number, 
    easingFn: (x: number) => number
    startValue?: number,
    delay?: number
}) => {
    const { duration, easingFn, startValue, delay } = options || { duration: 1000, easingFn: (x) => x, startValue: 0, delay: 0 };
    const [currentValue, setCurrentValue] = useState(startValue);
    useEffect(() => {
        let startTime: number | undefined;
        let requestId: number;
        const updateValue = (timestamp: number) => {
            if (!startTime) {
                startTime = timestamp;
            }
            const elapsedTime = timestamp - startTime;
            if (elapsedTime < duration) {
                const progress = elapsedTime / duration;
                const easedProgress = easingFn(progress);
                const newValue = target * easedProgress;
                setCurrentValue(newValue);
                requestId = requestAnimationFrame(updateValue);
            } else {
                setCurrentValue(target);
            }
        };
        const to = setTimeout(() => {
            startTime = undefined;
            requestId = requestAnimationFrame(updateValue);
        }, delay);
        return () => {
            clearTimeout(to);
            cancelAnimationFrame(requestId);
        };
    }, [target, duration]);
    return currentValue;
}
