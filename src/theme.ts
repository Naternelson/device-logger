import { createTheme } from '@mui/material/styles';

const theme = createTheme({

	typography: {
		fontFamily: 'Inter, Avenir, Helvetica, Arial, sans-serif',
		// fontSize: 12,
		// htmlFontSize: 16,
		fontWeightLight: 400,
		h1: {
			fontSize: '2rem',
			fontWeight: 500,
			lineHeight: '2.5rem',
		},
		h2: {
			fontSize: '1.5rem',
			fontWeight: 500,
			lineHeight: '2rem',
		},
		h3: {
			fontSize: '1.2rem',
			fontWeight: 500,
			lineHeight: '1.6rem',
		},
		h4: {
			fontSize: '1rem',
			fontWeight: 500,
			lineHeight: '1.4rem',
		},
		h5: {
			fontSize: '0.875rem',
			fontWeight: 500,
			lineHeight: '1.2rem',
		},
		h6: {
			fontSize: '0.75rem',
			fontWeight: 500,
			lineHeight: '1rem',
		},
		body1: {
			fontSize: '1rem',
			fontWeight: 400,
			lineHeight: '1.5rem',
		},
		body2: {
			fontSize: '0.875rem',
			fontWeight: 400,
			lineHeight: '1.25rem',
		},
		// Define typography styles for other elements as needed
	},
	palette: {
        mode: "dark"
	},
    components: {
        MuiTextField: {
            defaultProps: {
                size: "small"
            }
        }
    }
});

export default theme;
