import React from 'react';
import { connect } from 'react-redux';
import 'react-datepicker/dist/react-datepicker.css';
import { SalaryComponentScreen } from '../../sections';
import './style.scss';

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

const DetailSalaryComponent = (props) => {
  return (
    <SalaryComponentScreen
      props={props}
      history={props.history}
      isCreated={true}
      componentID={props.location.state.id}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailSalaryComponent);
