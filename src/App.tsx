import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import "./App.css"


function App() {
  return (
		<ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme/>
			<RouterProvider router={router} />
		</ThemeProvider>
  );
}

export default App;
