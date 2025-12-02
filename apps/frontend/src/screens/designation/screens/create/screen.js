import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  UncontrolledTooltip,
} from 'reactstrap'
import { Formik } from 'formik';
import * as Yup from "yup";
import Select from 'react-select';
import { LeavePage } from 'components';
import { selectOptionsFactory } from 'utils';
import { CommonActions } from 'services/global'
import * as SalaryRoleActions from '../../actions';
import * as EmployeeDesignationCreateActions from './actions';
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
  return ({
    currency_list: state.employee.currency_list,
    designationType_list: state.employeeDesignation.designationType_list
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    salaryRoleActions: bindActionCreators(SalaryRoleActions, dispatch),
    employeeDesignationCreateAction: bindActionCreators(EmployeeDesignationCreateActions, dispatch)

  })
}
const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    },
  }),
};

let strings = new LocalizedStrings(data);
class CreateDesignation extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      language: window['localStorage'].getItem('language'),
      loading: false,
      createMore: false,
      disableLeavePage: false,
      initValue: {
        designationName: '',
        designationId: '',
        designationType: '',
      },
      idExist: false,
      nameExist: false
    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;


  }

  componentDidMount = () => {
    this.initializeData();
  };

  initializeData = () => {
    this.props.salaryRoleActions.getParentDesignationList();

  };
  designationNamevalidationCheck = (value) => {
    const data = {
      moduleType: 26,
      name: value,
    };
    this.props.commonActions.checkValidation(data).then((response) => {
      if (response.data === 'Designation name already exists') {
        this.setState({
          nameExist: true,
        });
      } else {
        this.setState({
          nameExist: false,
        });
      }
    });
  };
  designationIdvalidationCheck = (value) => {
    const data = {
      moduleType: 25,
      name: value,
    };
    this.props.commonActions.checkValidation(data).then((response) => {
      if (response.data === 'Designation ID already exists') {
        this.setState({
          idExist: true,
        });
      } else {
        this.setState({
          idExist: false,
        });
      }
    });
  };

  handleSubmit = (data, resetForm) => {
    this.setState({ disabled: true, disableLeavePage: true });
    const {
      designationName,
      designationId,
      designationType
    } = data;

    const formData = new FormData();

    // if(!this.state.idExist && !this.state.nameExist){
    formData.append('designationId', designationId != null ? designationId : '',)
    formData.append('designationName', designationName != null ? designationName : '',);
    formData.append('parentId', designationType ? designationType.value ? designationType.value : designationType : '');

    this.props.employeeDesignationCreateAction
      .createEmployeeDesignation(formData)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            'success',
            'New Employee Designation Created Successfully')
          if (this.state.createMore) {
            this.setState({
              createMore: false
            })
            resetForm(this.state.initValue)
          } else {
            this.props.history.push('/admin/payroll/config', { tabNo: '3' })
          }
        }
      }).catch((err) => {
        this.setState({ disabled: false, disableLeavePage: false });
        this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
      })
  }

  render() {
    strings.setLanguage(this.state.language);
    const { currency_list, state_list, designationType_list } = this.props


    return (
      <div className="create-employee-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="nav-icon fas fa-user-tie" />
                        <span className="ml-2">{strings.CreateDesignation}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Formik
                        initialValues={this.state.initValue}
                        onSubmit={(values, { resetForm }) => {
                          this.handleSubmit(values, resetForm)
                          // resetForm(this.state.initValue)

                          //   // this.setState({
                          //   //   selectedContactCurrency: null,
                          //   //   selectedCurrency: null,
                          //   //   selectedInvoiceLanguage: null
                          //   // })
                        }}
                        validate={(values) => {
                          let errors = {};
                          if (parseInt(values.designationId) === 0) {
                            errors.designationId =
                              "Enter valid designation ID";
                          } else if (this.state.idExist === true || parseInt(values.designationId) === 1 || parseInt(values.designationId) === 2 || parseInt(values.designationId) === 3 || parseInt(values.designationId) === 4) {
                            errors.designationId =
                              "Designation ID already exist";
                          }

                          if (this.state.nameExist === true) {
                            errors.designationName =
                              "Designation name already exist";
                          }
                          // return errors;

                          return errors;
                        }}

                        validationSchema={Yup.object().shape({
                          designationName: Yup.string()
                            .required("Designation name is required").test('is new',
                              "Designation Name already exist",
                              () => !this.state.nameExist),
                          designationType: Yup.string()
                            .required(strings.DesignationTypeIsRequired),
                          designationId: Yup.string()
                            .required("Designation id is required").test('is new',
                              "Designation ID already exist",
                              () => !this.state.idExist)
                        })}
                      >
                        {(props) => (

                          <Form onSubmit={props.handleSubmit}>

                            <Row>

                              <Col lg={10}>
                                <Row className="row-wrapper">
                                  <Col lg={4}>
                                    <FormGroup>
                                      <Label htmlFor="select"><span className="text-danger">* </span>{strings.DESIGNATIONID}</Label>
                                      <Input
                                        type="text"
                                        id="designationId"
                                        name="designationId"
                                        maxLength="9"
                                        value={props.values.designationId}
                                        placeholder={strings.Enter + strings.DESIGNATIONID}
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regEx.test(option.target.value)) {
                                            props.handleChange('designationId')(option)
                                            this.designationIdvalidationCheck(option.target.value)
                                          }
                                        }}
                                        className={props.errors.designationId && props.touched.designationId ? "is-invalid" : ""}
                                      />
                                      {props.errors.designationId && props.touched.designationId && (
                                        <div className="invalid-feedback">{props.errors.designationId}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={4}>
                                    <FormGroup>
                                      <Label htmlFor="select"><span className="text-danger">* </span>{strings.DesignationName}</Label>
                                      <Input
                                        type="text"
                                        id="designationName"
                                        name="designationName"
                                        maxLength="30"
                                        value={props.values.designationName}
                                        placeholder={strings.Enter + strings.DesignationName}
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExAlpha.test(option.target.value)) {
                                            props.handleChange('designationName')(option)
                                            this.designationNamevalidationCheck(option.target.value)
                                          }
                                        }}
                                        className={props.errors.designationName && props.touched.designationName ? "is-invalid" : ""}
                                      />
                                      {props.errors.designationName && props.touched.designationName && (
                                        <div className="invalid-feedback">{props.errors.designationName}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="designationType">
                                        <span className="text-danger">* </span>
                                        {strings.DesignationType}
                                        <i
                                          id="designationTypeTooltip"
                                          className="fa fa-question-circle ml-1"
                                        ></i>
                                        <UncontrolledTooltip
                                          placement="right"
                                          target="designationTypeTooltip"
                                        >
                                          Based on the designation type selected, the chart of accounts will be created for the employee. This field will be locked once the designation has been assigned to an employee.
                                        </UncontrolledTooltip>
                                      </Label>
                                      <Select
                                        options={
                                          designationType_list
                                            ? selectOptionsFactory.renderOptions(
                                              'label',
                                              'value',
                                              designationType_list,
                                              strings.DesignationType,
                                            )
                                            : []
                                        }
                                        value={props.values.designationType?.value ? props.values.designationType :
                                          designationType_list && selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            designationType_list,
                                            strings.DesignationType,
                                          ).find(obj => obj.value === props.values.designationType)
                                        }
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            props.handleChange('designationType')(
                                              option,
                                            );
                                          } else {
                                            props.handleChange('designationType')('');
                                          }
                                        }}

                                        placeholder={strings.Select + strings.DesignationType}
                                        id="designationType"
                                        name="designationType"
                                        className={
                                          props.errors.designationType &&
                                            props.touched.designationType
                                            ? 'is-invalid'
                                            : ''
                                        }
                                      />
                                      {props.errors.designationType &&
                                        props.touched.designationType && (
                                          <div className="invalid-feedback">
                                            {props.errors.designationType}
                                          </div>
                                        )}

                                    </FormGroup>
                                  </Col>

                                </Row>

                                <hr />
                                <Row>
                                  <Col>
                                    <p><strong>Note:</strong> If the designation is assigned to an employee, it cannot be deleted.</p>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                            <Row>
                              <Col lg={12} className="mt-5">
                                <FormGroup className="text-right">
                                  <Button type="button" color="primary" className="btn-square mr-3" onClick={() => {
                                    //  added validation popup  msg                                                                
                                    props.handleBlur();
                                    if (props.errors && Object.keys(props.errors).length != 0)
                                      this.props.commonActions.fillManDatoryDetails();
                                    this.setState({ createMore: false }, () => {
                                      props.handleSubmit()
                                    })
                                  }}>
                                    <i className="fa fa-dot-circle-o"></i>  {strings.Create}
                                  </Button>
                                  <Button name="button" color="primary" className="btn-square mr-3"
                                    onClick={() => {
                                      //  added validation popup  msg                                                                
                                      props.handleBlur();
                                      if (props.errors && Object.keys(props.errors).length != 0)
                                        this.props.commonActions.fillManDatoryDetails();
                                      this.setState({ createMore: true }, () => {
                                        props.handleSubmit()
                                      })
                                    }}>
                                    <i className="fa fa-refresh"></i>  {strings.CreateandMore}
                                  </Button>
                                  <Button color="secondary" className="btn-square"
                                    onClick={() => { this.props.history.push('/admin/payroll/config', { tabNo: '3' }) }}>
                                    <i className="fa fa-ban"></i>  {strings.Cancel}
                                  </Button>
                                </FormGroup>
                              </Col>
                            </Row>
                          </Form>
                        )
                        }
                      </Formik>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
        {this.state.disableLeavePage ? "" : <LeavePage />}
      </div>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CreateDesignation)

