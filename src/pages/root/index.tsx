import { AppBar, Box, Fade, Snackbar, Tab, Typography, styled } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContext, useToastProvider } from './ToastProvider';
import { NavContext, useNavProvider } from './NavProvider';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
export const RootLayout = () => {
	const { addMessage, removeMessage, open, onClose, onExited, activeMessage } = useToastProvider();
	const navInfo = useNavProvider();
	const location = useLocation();
    const fullUrl = `${"app.ogdencustomsolutions.com"}${location.pathname}${location.search}`;

	return (
		<Main component={'main'}>
			<NavContext.Provider value={navInfo}>
				<ToastContext.Provider value={{ addMessage, removeMessage }}>
					<AppBar
						enableColorOnDark
						position="static"
						sx={{
							flexDirection: 'row',
							gap: '1rem',
							padding: '.1rem 1rem',
							backgroundColor: (theme) => theme.palette.primary.dark,
						}}>
						<Typography
							variant="subtitle2"
							sx={{
								fontWeight: '600',
								color: (theme) => theme.palette.primary.contrastText,
								fontStyle: 'italic',
							}}>
							Ogden Custom Solutions
						</Typography>
						<Typography
							variant="subtitle2"
							sx={{
								fontWeight: '600',
								color: (theme) => theme.palette.primary.contrastText,
								fontStyle: 'italic',
							}}>
							{fullUrl}
						</Typography>
					</AppBar>
					<TabContext value={navInfo.active}>
						<Box component={'nav'} sx={{ borderBottom: 1, borderColor: 'divider' }}>
							<TabList onChange={(_e, value) => navInfo.setActive(value)}>
								{navInfo.tabs.map((tab) => (
									<Tab key={tab} label={tab} value={tab} />
								))}
							</TabList>
						</Box>
						<Outlet />
						<Snackbar
							TransitionComponent={Fade}
							sx={{ padding: 0 }}
							ContentProps={{ sx: { padding: 0 } }}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							key={activeMessage?.id}
							open={open}
							onClose={onClose}
							TransitionProps={{ onExited }}
							autoHideDuration={activeMessage?.timeout}>
							<Box>{activeMessage?.content}</Box>
						</Snackbar>
					</TabContext>
				</ToastContext.Provider>
			</NavContext.Provider>
		</Main>
	);
};

export const Main = styled(Box)({
	display: 'flex',
	flexDirection: 'column',
	height: '100vh',
	boxSizing: 'border-box',
});

export { useToast } from './ToastProvider';
