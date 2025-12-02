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
  Label
} from 'reactstrap'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import { Formik } from 'formik';
import * as Yup from "yup";
import moment from 'moment'

import { Loader, ConfirmDeleteModal } from 'components'

import {
  CommonActions
} from 'services/global'
import {selectCurrencyFactory, selectOptionsFactory} from 'utils'
import * as EmployeeActions from '../../actions';
import * as EmployeeDetailActions from './actions';

import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'

const mapStateToProps = (state) => {
  return ({
    currency_list: state.employee.currency_list
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    employeeDetailActions: bindActionCreators(EmployeeDetailActions, dispatch)
  })
}

class DetailEmployeePayroll extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      initValue: {},
      current_employee_id: null,
      dialog: false,
    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;
  }

  componentDidMount = () => {
    this.initializeData();
  }

  initializeData = () => {
    if (this.props.location.state && this.props.location.state.id) {
      this.props.employeeActions.getCurrencyList()
      this.props.employeeDetailActions.getEmployeeDetail(this.props.location.state.id).then((res) => {
        if (res.status === 200) {
          this.setState({
            current_employee_id: this.props.location.state.id,
            initValue: {
              id: res.data.id !== '' ? res.data.id : '',
              firstName: res.data.firstName !== '' ? res.data.firstName : '',
              middleName: res.data.middleName !== '' ? res.data.middleName : '',
              lastName: res.data.lastName !== '' ? res.data.lastName : '',
              email: res.data.email !== '' ? res.data.email : '',
              password: res.data.password !== '' ? res.data.passowrd : '',
              dob: res.data.dob !== '' ? res.data.dob : '',
              referenceCode: res.data.referenceCode !== '' ? res.data.referenceCode : '',
              title: res.data.title !== '' ? res.data.title : '',
              billingEmail: res.data.billingEmail !== '' ? res.data.billingEmail : '',
              vatRegestationNo: res.data.vatRegestationNo !== '' ? res.data.vatRegestationNo : '',
              currencyCode: res.data.currencyCode !== '' ? res.data.currencyCode : '',
              poBoxNumber: res.data.poBoxNumber !== '' ? res.data.poBoxNumber : '',
            },
            loading: false,
          })

        }
      }).catch((err) => {
        this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
      })
    } else {
      this.props.history.push('/admin/master/employee')
    }
  }

  handleSubmit = (data) => {
    const postData = Object.assign({},data)
    if(typeof postData.currencyCode === 'object') {
      postData.currencyCode = data.currencyCode.value
    }
    this.props.employeeDetailActions.updateEmployee(postData).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert(
          'success',
           res.data ? res.data.message :'Employee Updated Successfully'
           )
        this.props.history.push('/admin/master/employee')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert(
        'error',
         err.data.message ? err.data.message :'Created Unsuccessfully'
         )
    })
  }

  deleteEmployee = () => {
    const message1 =
    <text>
    <b>Delete Employee?</b>
    </text>
    const message = 'This Employee will be deleted permanently and cannot be recovered. ';
    this.setState({
      dialog: <ConfirmDeleteModal
        isOpen={true}
        okHandler={this.removeEmployee}
        cancelHandler={this.removeDialog}
        message={message}
        message1={message1}
      />
    })
  }

  removeEmployee = () => {
    const { current_employee_id } = this.state;
    this.props.employeeDetailActions.deleteEmployee(current_employee_id).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert(
          'success',
           res.data ? res.data.message :'Employee Deleted Successfully'
           )
        this.props.history.push('/admin/master/employee')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert(
        'error',
         err.data.message ? err.data.message :'Employee Deleted Unsuccessfully'
         )
    })
  }

  removeDialog = () => {
    this.setState({
      dialog: null
    })
  }

  render() {

    const { currency_list } = this.props
    const { dialog, loading, initValue } = this.state
    return (
      loading ==true? <Loader/> :
<div>
      <div className="detail-employee-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="nav-icon fas fa-user-tie" />
                        <span className="ml-2">Update Employee</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  {loading ?
                    (
                      <Loader />
                    )
                    :
                    (
                      <Row>
                        <Col lg={12}>
                          <Formik
                            initialValues={initValue}
                            onSubmit={(values, { resetForm }) => {
                              this.handleSubmit(values)
                              // resetForm(this.state.initValue)
                            }}
                            validationSchema={Yup.object().shape({
                              firstName: Yup.string()
                                .required("First name is required"),
                              lastName: Yup.string()
                                .required("Last name is required"),
                              middleName: Yup.string()
                                .required("Middle name is required"),
                              password: Yup.string()
                                // .required("Password is required")
                                // .min(8,"Password Too Short")
                                .matches(
                                  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                                  "Must contain 8 characters, one uppercase, one lowercase, one number and one special case character"
                                ),
                              confirmPassword: Yup.string()
                                // .required('Confirm Password is required')
                                .oneOf([Yup.ref("password"), null], "Passwords must match"),
                              dob: Yup.date()
                                .required('DOB is required')
                            })}
                          >
                            {(props) => (
                              <Form onSubmit={props.handleSubmit}>
                                <h4 className="mb-4">Contact Name</h4>
                                <Row>
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="select">Reference Code</Label>
                                      <Input
                                        type="text"
                                        id="referenceCode"
                                        name="referenceCode"
                                        value={props.values.referenceCode}
                                        placeholder="Enter Reference Code"
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('referenceCode')(option)}
                                        }}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="select">Title</Label>
                                      <Input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={props.values.title}
                                        placeholder="Enter Title"
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExAlpha.test(option.target.value)){ props.handleChange('title')(option)}
                                        }}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="select"><span className="text-danger">* </span>Email</Label>
                                      <Input
                                        type="email"
                                        maxLength="80"
                                        id="email"
                                        name="email"
                                        placeholder="Enter Email Address"
                                        value={props.values.email}
                                        onChange={(value) => { props.handleChange('email')(value) }}
                                      />
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row className="row-wrapper">
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="select"><span className="text-danger">* </span>First Name</Label>
                                      <Input
                                        type="text"
                                        id="firstName"
                                        maxLength="100"
                                        name="firstName"
                                        value={props.values.firstName}
                                        placeholder="Enter First Name"
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('firstName')(option) }
                                        }}
                                        className={props.errors.firstName && props.touched.firstName ? "is-invalid" : ""}
                                      />
                                      {props.errors.firstName && props.touched.firstName && (
                                        <div className="invalid-feedback">{props.errors.firstName}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="select"><span className="text-danger">* </span>Middle Name</Label>
                                      <Input
                                        type="text"
                                        maxLength="100"
                                        id="middleName"
                                        name="middleName"
                                        value={props.values.middleName}
                                        placeholder="Enter Middle Name"
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('middleName')(option) }
                                        }}
                                        className={props.errors.middleName && props.touched.middleName ? "is-invalid" : ""}
                                      />
                                      {props.errors.middleName && props.touched.middleName && (
                                        <div className="invalid-feedback">{props.errors.middleName}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="select"><span className="text-danger">* </span>Last Name</Label>
                                      <Input
                                        type="text"
                                        maxLength="100"
                                        id="lastName"
                                        name="lastName"
                                        value={props.values.lastName}
                                        placeholder="Enter Last Name"
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('lastName')(option) }
                                        }}
                                        className={props.errors.lastName && props.touched.lastName ? "is-invalid" : ""}
                                      />
                                      {props.errors.lastName && props.touched.lastName && (
                                        <div className="invalid-feedback">{props.errors.lastName}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row className="row-wrapper">
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="select">Password</Label>
                                      <Input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Enter Password"
                                        value={props.values.password}
                                        onChange={(value) => { props.handleChange('password')(value) }}
                                        className={props.errors.password && props.touched.password ? "is-invalid" : ""}
                                      />
                                      {props.errors.password && props.touched.password ? (
                                        <div className="invalid-feedback">{props.errors.password}</div>
                                      ) : (<span className="password-msg">Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character.</span>)}
                                    </FormGroup>
                                  </Col>
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="select">Confirm Password</Label>
                                      <Input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={props.values.confirmPassword}
                                        placeholder="Enter Confirm Password"
                                        onChange={(value) => { props.handleChange('confirmPassword')(value) }}
                                        className={props.errors.confirmPassword && props.touched.confirmPassword ? "is-invalid" : ""}
                                      />
                                      {props.errors.confirmPassword && props.touched.confirmPassword && (
                                        <div className="invalid-feedback">{props.errors.confirmPassword}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="4">
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="date">Date Of Birth</Label>
                                      <DatePicker
                                        className={`form-control ${props.errors.dob && props.touched.dob ? "is-invalid" : ""}`}
                                        id="dob"
                                        name="dob"
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="dd-MM-yyyy"
                                        dropdownMode="select"
                                        placeholderText="Select Date of Birth"
                                        value={moment(props.values.dob).format('DD-MM-YYYY')}
                                        maxDate={new Date()}
                                        onChange={(value) => {
                                          props.handleChange("dob")(value)
                                        }}
                                      />
                                      {props.errors.dob && props.touched.dob && (
                                        <div className="invalid-feedback">{props.errors.dob}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <hr />
                                <h4 className="mb-3 mt-3">Invoicing Details</h4>
                                <Row className="row-wrapper">
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="billingEmail">Billing Email</Label>
                                      <Input
                                        type="text"
                                        maxLength="80"
                                        id="billingEmail"
                                        name="billingEmail"
                                        value={props.values.billingEmail}
                                        placeholder="Enter Billing Email Address"
                                        onChange={(value) => { props.handleChange("billingEmail")(value) }}
                                        className={
                                          props.errors.billingEmail && props.touched.billingEmail
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.billingEmail && props.touched.billingEmail && (
                                        <div className="invalid-feedback">{props.errors.billingEmail}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="poBoxNumber">Contract PO Number</Label>
                                      <Input
                                        type="text"
                                        maxLength="8"
                                        id="poBoxNumber"
                                        name="poBoxNumber"
                                        placeholder="Enter Contract PO Number"
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('poBoxNumber')(option)}
                                        }}
                                        value={props.values.poBoxNumber}
                                        className={
                                          props.errors.poBoxNumber && props.touched.poBoxNumber
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.poBoxNumber && props.touched.poBoxNumber && (
                                        <div className="invalid-feedback">{props.errors.poBoxNumber}</div>
                                      )}

                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row className="row-wrapper">
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="vatRegestationNo">Tax Registration Number</Label>
                                      <Input
                                        type="text"
                                        maxLength="15"
                                        id="vatRegestationNo"
                                        name="vatRegestationNo"
                                        placeholder="Enter Tax Registration Number"
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('vatRegestationNo')(option)}
                                        }}
                                        value={props.values.vatRegestationNo}
                                        className={
                                          props.errors.vatRegestationNo && props.touched.vatRegestationNo
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.vatRegestationNo && props.touched.vatRegestationNo && (
                                        <div className="invalid-feedback">{props.errors.vatRegestationNo}</div>
                                      )}

                                    </FormGroup>
                                  </Col>
                                  <Col md="4">
                                    <FormGroup>
                                      <Label htmlFor="currencyCode">Currency Code</Label>
                                      <Select
                                        options={currency_list ? selectCurrencyFactory.renderOptions('currencyName', 'currencyCode', currency_list, 'Currency') : []}
                                        value={currency_list && selectCurrencyFactory.renderOptions('currencyName', 'currencyCode', currency_list, 'Currency').find((option) => option.value === +props.values.currencyCode)}
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            props.handleChange('currencyCode')(option)
                                          } else {
                                            props.handleChange('currencyCode')('')
                                          }
                                        }}
                                        placeholder="Select Currency"
                                        id="currencyCode"
                                        name="currencyCode"
                                        className={
                                          props.errors.currencyCode && props.touched.currencyCode
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.currencyCode && props.touched.currencyCode && (
                                        <div className="invalid-feedback">{props.errors.currencyCode}</div>
                                      )}

                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col lg={12} className="d-flex align-items-center justify-content-between flex-wrap mt-5">
                                    <FormGroup>
                                      <Button type="button" name="button" color="danger" className="btn-square"
                                        onClick={this.deleteEmployee}
                                      >
                                        <i className="fa fa-trash"></i> Delete
                                    </Button>
                                    </FormGroup>
                                    <FormGroup className="text-right">
                                      <Button type="submit" name="submit" color="primary" className="btn-square mr-3">
                                        <i className="fa fa-dot-circle-o"></i> Update
                                    </Button>
                                      <Button type="button" color="secondary" className="btn-square"
                                        onClick={() => { this.props.history.push('/admin/master/employee') }}>
                                        <i className="fa fa-ban"></i> Cancel
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
                    )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      </div>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(DetailEmployeePayroll)

