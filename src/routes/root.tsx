import { Box, Button, List, ListItem, Menu, MenuItem, Stack, Tab, Tabs, Typography, styled } from '@mui/material';
import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { InputForm } from './InputForm';
import { reset } from '../db';
import { seed } from '../dbSeed';

export const Root = () => {
    const [value, setValue] = useState(0);
    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
	return (
		<StyledBox>
			<Tabs value={value} onChange={handleChange} aria-label="Main User Tabs">
				<Tab label="Home" />
				<Tab label="Devices" />
				<Tab label="Settings" />
                <Tab label={"Sounds"}/>
			</Tabs>
			<tabContext.Provider value={{ value, setValue }}>
				<InputForm value={0} />
			</tabContext.Provider>
            <Stack direction="row" spacing={2}>
                <Button onClick={() => reset()}>Reset</Button>
                <Button onClick={() => seed()}>Seed</Button>
            </Stack>
		</StyledBox>
	);
};
const tabContext = createContext({
    value: 0,
    setValue: (_newValue: number) => {}
})

export const useTabContext = () => {
    return useContext(tabContext);
}

const StyledBox = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    height: "100vh",

})