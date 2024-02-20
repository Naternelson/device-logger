import { Button, Card, CardHeader, Container, Grid, Typography } from "@mui/material"
import { useSound } from "../../sounds"

export const Sounds = () => {
    const {sounds, play} = useSound()
    const allSounds = {...sounds.HeroSounds, ...sounds.AlertsAndNotifications, ...sounds.PrimarySystemSounds, ...sounds.SecondarySystemSounds}
    return (
		<Container>
			<Typography variant="h1">Sounds</Typography>
            <Grid container spacing={2}>
			{Object.entries(allSounds).map(([name, Sound], i) => (
				<Grid item key={i} xs={3}>
					<Card>
						<CardHeader title={name} />
						<Button onClick={() => play(Sound)}>Play</Button>
					</Card>
				</Grid>
			))}
            </Grid>
		</Container>
	);
}