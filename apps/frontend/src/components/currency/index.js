import React from 'react';

class Currency extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { value, currencySymbol } = this.props;
    let currencyCode;
    let currencySymbolMain;
    if (currencySymbol) {
      currencyCode = currencySymbol.slice(0, currencySymbol.length - 1);
      currencySymbolMain = currencySymbol;
    } else {
      currencyCode = 'AED';
      currencySymbolMain = 'AED';
    }

    return new Intl.NumberFormat('en', {
      style: 'currency',
      // minimumFractionDigits:6,
      currency: currencySymbolMain,
    }).format(value ? value : 0);
  }
}

export default Currency;
