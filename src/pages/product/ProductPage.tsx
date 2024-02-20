import {
	Box,
	Button,
	ClickAwayListener,
	Collapse,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { Product, db, getProductSettings, useAllProductsSub, viewProduct } from '../../database';
import { useEffect, useState } from 'react';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useSound } from '../../sounds';
import { NewProductDialogForm } from './NewProductForm';
import { useNavigate } from 'react-router-dom';

export const ProductPage = () => {
	return (
		<Box>
			<Container sx={{ marginTop: '2rem' }}>
				<Stack direction={'column'} spacing={2}>
					<Typography variant="h2">Products</Typography>
					<Stack direction={'row'} spacing={2}>
						<NewProductButton />
					</Stack>
					<Divider />
					<ProductsTable />
				</Stack>
			</Container>
		</Box>
	);
};

const NewProductButton = () => {
	const [open, setOpen] = useState(false);
	const onToggle = () => setOpen((p) => !p);
	return (
		<>
			<Button variant="contained" color="primary" onClick={onToggle}>
				New Product
			</Button>
			<NewProductDialogForm open={open} onClose={onToggle} />
		</>
	);
};

const ProductsTable = () => {
	const productsQuery = useAllProductsSub(db);
	// Sort from newest to oldest
	const products = productsQuery.data?.sort((a, b) => (b.createdOn > a.createdOn ? 1 : -1)) || [];
	return (
		<TableContainer component={Paper}>
			<Table stickyHeader size="small">
				<TableHead>
					<TableRow>
						<TableCell padding="checkbox"></TableCell>
						<TableCell sx={{ width: '18%' }}>Product ID</TableCell>
						<TableCell sx={{ width: '22%' }}>Name</TableCell>
						<TableCell sx={{ width: '20%' }}>Color</TableCell>
						<TableCell sx={{ width: '15%' }}>Has UDI</TableCell>
						<TableCell>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{products.map((product) => (
						<BodyRow key={product.productId} product={product} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

const BodyRow = ({ product }: { product: Product }) => {
	
	const [open, setOpen] = useState(false);
	const { navForwardSelectionMinimal, navBackwardSelectionMinimal } = useSound();
	const playOpenSound = navForwardSelectionMinimal();
	const playCloseSound = navBackwardSelectionMinimal();
	const onClose = () => setOpen(false);
	const toggle = () => {
		setOpen((p) => {
			!p ? playOpenSound.play() : playCloseSound.play();
			return !p;
		});
	};
	useEffect(() => {
		if(product.viewed) return 
		const to = setTimeout(() => {
			viewProduct(db, product.productId)
		},600)
		return () => clearTimeout(to)
	},[product.viewed])
	return (
		<>
			<ClickAwayListener onClickAway={onClose}>
				<TableRow
					className={product.viewed ? "" : "glow-on"}
					selected={open}
					onClick={toggle}
					hover
					tabIndex={1}
					sx={{ '& > *': { borderBottom: 'unset' } }}>
					<TableCell>
						{open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
					</TableCell>
					<TableCell component="th" scope="row">
						{product.productId}
					</TableCell>
					<TableCell align="left">{product.name}</TableCell>
					<TableCell align="left">{product.color}</TableCell>
					<TableCell align="left">{product.hasUdi ? 'True' : 'False'}</TableCell>

					<TableCell align="left">
						<Stack direction={'row'} spacing={1}>
							<CreateOrderButton {...product} />
							<DeleteButton {...product} />
						</Stack>
					</TableCell>
				</TableRow>
			</ClickAwayListener>
			<TableRow>
				<TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<Box sx={{ margin: 1 }}>Hello World</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
};

const DeleteButton = (props: Product) => {
	const [open, setOpen] = useState(false);
	const { navTransitionRight, navTransitionLeft } = useSound();
	const opensound = navTransitionRight();
	const closesound = navTransitionLeft();
	const toggle = () => {
		setOpen((p) => {
			!p ? opensound.play() : closesound.play();
			return !p;
		});
	};
	return (
		<>
			<Button
				tabIndex={0}
				color={'primary'}
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					toggle();
				}}>
				Delete
			</Button>
			<Dialog open={open} onClose={toggle}>
				<DialogTitle>
					<Typography>Are you sure you want to delete this product?</Typography>
				</DialogTitle>
				<DialogContent dividers>
					<DialogContentText>
						<Typography>Product ID: {props.productId}</Typography>
						<Typography>Name: {props.name}</Typography>
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							db.products.delete(props.productId);
							closesound.play();
							toggle();
						}}>
						Confirm
					</Button>
					<Button
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							toggle();
						}}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

const CreateOrderButton = (props: Product) => {
	const nav = useNavigate();
	const navToOrder = () => {
		nav(`/orders/new/?productId=${props.productId}`);
	};
	return (
		<Button variant={"contained"} onClick={navToOrder} size="small">
			Create Order
		</Button>
	);
};
