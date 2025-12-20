import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Row, Col } from 'reactstrap';
import { Loader, LeavePage } from 'components';
import { CommonActions } from 'services/global';
import * as DetailSalaryComponentAction from './actions';
import * as CreatePayrollEmployeeActions from '../create/actions';
import { SalaryComponent } from 'screens/payrollemp/sections';
import { data } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailSalaryComponentAction: bindActionCreators(DetailSalaryComponentAction, dispatch),
    createPayrollEmployeeActions: bindActionCreators(CreatePayrollEmployeeActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

const UpdateSalaryComponent = ({
  commonActions,
  detailSalaryComponentAction,
  createPayrollEmployeeActions,
  location,
  history,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading....');
  const [disabled, setDisabled] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [language] = useState(window['localStorage'].getItem('language'));
  const currentEmployeeId = location.state?.id;
  const ctcTypeOption = location.state?.ctcTypeOption || { label: 'MONTHLY', value: 2 };
  const ctcType = location.state?.ctcTypeOption ? location.state.ctcTypeOption.label : 'MONTHLY';

  // Create or Edit Employee Salary
  const handleSubmit = data => {
    const {
      totalMonthlyEarnings,
      totalNetPayMontly,
      totalNetPayYearly,
      list,
      totalYearlyEarnings,
      ctcType,
      ctcTypeOption,
    } = data;

    setDisabled(true);
    setDisableLeavePage(true);

    const salaryComponentStringList = list.filter(obj => obj.id !== '');
    let formData = new FormData();
    formData.append('employee', currentEmployeeId);
    formData.append('employeeId', currentEmployeeId ?? '');

    if (ctcType === 'ANNUALLY') {
      formData.append('grossSalary', totalYearlyEarnings);
      formData.append('totalNetPay', totalNetPayYearly);
    } else {
      formData.append('grossSalary', totalMonthlyEarnings);
      formData.append('totalNetPay', totalNetPayMontly);
    }

    formData.append('ctcType', ctcTypeOption.label ? ctcTypeOption.label : 'ANNUALLY');
    formData.append('salaryComponentString', JSON.stringify(salaryComponentStringList));

    setLoading(true);
    setLoadingMsg('Updating Salary Details ...');

    detailSalaryComponentAction
      .updateEmployeeBank(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Employee Updated Successfully.');
          history.push('/admin/master/employee/viewEmployee', {
            id: currentEmployeeId,
            tabNo: '2',
          });
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err.data?.message || 'Employee Updated Unsuccessfully');
        setLoading(false);
        setDisabled(false);
        setDisableLeavePage(false);
      });
  };

  strings.setLanguage(language);

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="detail-vat-code-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon icon-briefcase" />
                    <span className="ml-2"> {strings.Update + ' ' + strings.SalaryDetails}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <SalaryComponent
                    employeeId={currentEmployeeId}
                    ctcType={ctcType}
                    ctcTypeOption={ctcTypeOption}
                    handleSubmit={values => {
                      handleSubmit(values);
                    }}
                    history={history}
                    updateComponent={true}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateSalaryComponent);
