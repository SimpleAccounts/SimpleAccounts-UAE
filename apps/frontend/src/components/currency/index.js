import React from 'react';

class Currency extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { value, currencySymbol } = this.props;
    let currencySymbolMain;
    if (currencySymbol) {
      currencySymbolMain = currencySymbol;
    } else {
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
