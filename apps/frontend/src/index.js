import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'polyfill';

import React from 'react';
import { createRoot } from 'react-dom/client';

import 'assets/css/global.scss';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

import App from 'app';
import * as serviceWorker from 'serviceWorker';

const theme = createTheme({
	palette: {
		primary: {
			main: '#2064d8',
		},
		secondary: {
			main: '#2064d8',
		},
	},
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
	<MuiThemeProvider theme={theme}>
		<App />
	</MuiThemeProvider>
);

serviceWorker.unregister();
