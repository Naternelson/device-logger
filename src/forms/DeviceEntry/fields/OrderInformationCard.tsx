import { Collapse, FormControl, Paper, Stack, Typography, styled } from "@mui/material"
import { PropsWithChildren } from "react"

export type OrderInformationCardProps = PropsWithChildren<{
    errorMessage?: string | undefined,
    title: string,
}>

export const OrderInformationCard = (props: OrderInformationCardProps) => {
    return (
        <FormControl fullWidth error={props.errorMessage !== undefined}>
            <StyledCard elevation={10}>
                <Stack direction="column" spacing={1}>
                    <Typography variant="h2">{props.title}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                    </Stack>
                </Stack>
                {props.children}
                <Collapse in={!!props.errorMessage}>
                    <Typography color="error">{props.errorMessage}</Typography>
                </Collapse>
            </StyledCard>
        </FormControl>)
}

const StyledCard = styled(Paper)(() => ({
    padding: "1rem",
    color: "rgb(150,150,150)",
    "&:hover": {
        "& .select": {
            color: "rgb(0,0,0)"
        },
        "& .invisible": {
            opacity: 1
        }
    },
    "& .select": {
        transition: "color 0.2s",
        pointer: "cursor"
    },
    "& .invisible": {
        opacity: 0,
        transition: "opacity 0.2s"
    }
}))