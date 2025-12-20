import React from 'react';
import { connect } from 'react-redux';
import { SalaryComponentScreen } from '../../sections';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

const CreateSalaryComponent = (props) => {
  return (
    <SalaryComponentScreen
      props={props}
      history={props.history}
      isCreated={false}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateSalaryComponent);
