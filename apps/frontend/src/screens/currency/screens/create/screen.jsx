import React from 'react';
import { connect } from 'react-redux';

import './style.scss';

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

const CreateCurrency = () => {
  return (
    <div className="create-currency-screen">
      <div className="animated fadeIn"></div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateCurrency);
