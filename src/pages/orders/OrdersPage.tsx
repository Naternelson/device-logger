import { Box, Grid } from "@mui/material"
import { Outlet } from "react-router-dom"

export const OrdersPage = ()=> {
    return (<Box>
        <Grid container>
            <Grid item xs={12}>
                <h1>Orders</h1>
                
            </Grid>
        </Grid>
        <Outlet />
    </Box>)
}