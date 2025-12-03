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
} from 'reactstrap'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import { Formik } from 'formik';
import * as Yup from "yup";
import { LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global' 
import {selectCurrencyFactory} from 'utils'
import * as EmployeeActions from '../../actions';
import * as EmployeeCreateActions from './actions';
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
    employeeCreateActions: bindActionCreators(EmployeeCreateActions, dispatch)

  })
}

class CreateEmployee extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      createMore: false,
      initValue: {
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: '',
        referenceCode: '',
        title: '',
        billingEmail: '',
        vatRegestationNo: '',
        currencyCode: '',
        poBoxNumber: '',
        loadingMsg:"Loading...",
        disableLeavePage:false
      },
    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;
  }

  componentDidMount = () => {
    this.props.employeeActions.getCurrencyList()
  }

  handleSubmit = (data, resetForm) => {
    let postData = Object.assign({},data)
    if(postData.currencyCode.value) {
      postData = {...postData,...{currencyCode: postData.currencyCode.value}}
    }
    this.setState({ loading:true, disableLeavePage:true, loadingMsg:"Creating New Employee..."});
    this.props.employeeCreateActions.createEmployee(postData).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert(
          'success',
          res.data? res.data.message: 'New Employee Created Successfully')
        if (this.state.createMore) {
          this.setState({
            createMore: false
          })
          resetForm(this.state.initValue)
        } else {
          this.props.history.push('/admin/master/employee')
          this.setState({ loading:false,});
        }
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert(
        'error', 
        err && err.data ? err.data.message : 'New Employee Created Unsuccessfully')
    })
  }

  render() {

    const { currency_list } = this.props
    const { loading, loadingMsg } = this.state
    return (
      loading ==true? <Loader loadingMsg={loadingMsg}/> :
      <div>
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
                        <span className="ml-2">Create Employee</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                {loading ? (
										<Row>
											<Col lg={12}>
												<Loader />
											</Col>
										</Row>
									) : (
                  <Row>
                    <Col lg={12}>
                      <Formik
                        initialValues={this.state.initValue}
                        onSubmit={(values, { resetForm }) => {
                          this.handleSubmit(values, resetForm)
                          // resetForm(this.state.initValue)

                          // this.setState({
                          //   selectedContactCurrency: null,
                          //   selectedCurrency: null,
                          //   selectedInvoiceLanguage: null
                          // })
                        }}
                        validationSchema={Yup.object().shape({
                          firstName: Yup.string()
                            .required("First name is required"),
                          lastName: Yup.string()
                            .required("Last name is required"),
                          middleName: Yup.string()
                            .required("Middle name is required"),
                          email: Yup.string().email("Valid email is required"),
                          billingEmail: Yup.string().email("Valid email is required"),
                          password: Yup.string()
                            .required("Password is required")
                            // .min(8, "Password Too Short")
                            .matches(
                              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                              "Must contain 8 characters, one uppercase, one lowercase, one number and one special case character"
                            ),
                          confirmPassword: Yup.string()
                            .required('Confirm password is required')
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
                                    maxLength='80'
                                    id="email"
                                    name="email"
                                    value={props.values.email}
                                    placeholder="Enter Email Address"
                                    onChange={(value) => { props.handleChange('email')(value) }}
                                    className={props.errors.email && props.touched.email ? "is-invalid" : ""}
                                  />
                                  {props.errors.email && props.touched.email && (
                                    <div className="invalid-feedback">{props.errors.email}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row className="row-wrapper">
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="select"><span className="text-danger">* </span>First Name</Label>
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="firstName"
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
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)){ props.handleChange('middleName')(option)}
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
                                  <Label htmlFor="select"><span className="text-danger">* </span>Password</Label>
                                  <Input
                                    type="password"
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    value={props.values.password}
                                    placeholder="Enter Password"
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
                                  <Label htmlFor="select"><span className="text-danger">* </span>Confirm Password</Label>
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
                                  <Label htmlFor="date"><span className="text-danger">* </span>Date Of Birth</Label>
                                  <DatePicker
                                    className={`form-control ${props.errors.dob && props.touched.dob ? "is-invalid" : ""}`}
                                    id="dob"
                                    name="dob"
                                    placeholderText="Select Date of Birth"
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={props.values.dob}
                                    maxDate={new Date()}
                                    value={props.values.dob}
                                    onChange={(value) => {
                                      props.handleChange("dob")(value)
                                    }}
                                  />
                                  {props.errors.dob &&
                                     props.touched.dob && (
                                    <div className="invalid-feedback">
                                      {props.errors.dob.includes("nullable()") ? "DOB is required" :props.errors.dob}
                                    </div>
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
                                    placeholder="Enter Billing Email Address"
                                    onChange={(value) => { props.handleChange("billingEmail")(value) }}
                                    value={props.values.billingEmail}
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
                                    value={props.values.currencyCode}
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
                              <Col lg={12} className="mt-5">
                                <FormGroup className="text-right">
                                  <Button type="button" color="primary" className="btn-square mr-3" onClick={() => {
                                    this.setState({ createMore: false }, () => {
                                      props.handleSubmit()
                                    })
                                  }}>
                                    <i className="fa fa-dot-circle-o"></i> Create
                                      </Button>
                                  <Button name="button" color="primary" className="btn-square mr-3"
                                    onClick={() => {
                                      this.setState({ createMore: true }, () => {
                                        props.handleSubmit()
                                      })
                                    }}>
                                    <i className="fa fa-refresh"></i> Create and More
                                      </Button>
                                  <Button color="secondary" className="btn-square"
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
			{this.state.disableLeavePage ?"":<LeavePage/>}
      </div>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CreateEmployee)

