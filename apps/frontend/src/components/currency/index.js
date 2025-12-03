import React from 'react';

class Currency extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const { value, currencySymbol } = this.props;
		if (currencySymbol) {
			var currencyCode = currencySymbol.slice(0, currencySymbol.length - 1);
			var currencySymbolMain = currencySymbol;
		} else {
			var currencyCode = 'AED';
			var currencySymbolMain = 'AED';
		}

		return new Intl.NumberFormat('en', {
			style: 'currency',
			// minimumFractionDigits:6,
			currency: currencySymbolMain,
		}).format(value ? value : 0);
	}
}

export default Currency;
