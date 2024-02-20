import { Container, Stack, Typography, styled } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { ProgressBar } from '../../components';
import { db, useActiveCaseSub, useCaseCountSub, useOrderSub } from '../../database';
import { useEffect } from 'react';

export type ActiveCasePageProps = {
	orderId: string;
	caseId: string;
};
type MainEntryFormData = {
    deviceId: string;
    udi: string;
    orderId: string;
    caseId: string;

}
export const ActiveCasePage = (props: ActiveCasePageProps) => {
    const orderQuery = useOrderSub(db, props.orderId)
    const caseQuery = useCaseCountSub(db, props.orderId, props.caseId)
    const {orderId, caseId} = props
    const frm = useForm({
        defaultValues: {
            deviceId: "",
            udi: "",
            orderId,
            caseId,
        }
    })
    const onSubmit = (data: MainEntryFormData) => {
        console.log(data)
    }



	return (
		<StyledPage>
			<Typography variant="h1">Active Case</Typography>
			<Container>
				<ProgressBar amount={30} total={100} />
			</Container>
			<Typography variant="h2">Order: {orderId}</Typography>
			<Typography variant="h2">Case: {caseId}</Typography>
			<FormProvider {...frm}>
				<form onSubmit={frm.handleSubmit(onSubmit)}>
					<button type="submit">Submit</button>
				</form>
			</FormProvider>
		</StyledPage>
	);
};

const StyledPage = styled(Stack)({
    flexDirection: "column",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
    padding: "20px",
    alignItems: "center",

});
