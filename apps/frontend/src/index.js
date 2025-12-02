import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import 'assets/css/global.scss';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

import App from 'app';
import * as serviceWorker from 'serviceWorker';
const theme = createTheme({
	palette: {
		primary: {
			main: '#2064d8', // This is an orange looking color
		},
		secondary: {
			main: '#2064d8', //Another orange-ish color
		},
	},
});
ReactDOM.render(
	<MuiThemeProvider theme={theme}>
		<App />
	</MuiThemeProvider>,
	document.getElementById('root'),

	// document.onkeydown = function(e) {
	// 	if(Event.keyCode == 123) {
	// 	return false;
	// 	}
	// 	if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){
	// 	return false;
	// 	}
	// 	if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){
	// 	return false;
	// 	}
	// 	if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){
	// 	return false;
	// 	}
	// 	}
);

serviceWorker.unregister();
