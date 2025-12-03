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
import { ImageUploader } from 'components';
import {
  CommonActions
} from 'services/global'
import {selectCurrencyFactory, selectOptionsFactory} from 'utils'
import * as EmployeeActions from '../../actions';
import * as EmploymentCreateActions from './actions';

import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'
  

const mapStateToProps = (state) => {
  return ({
    currency_list: state.employee.currency_list,
    country_list: state.contact.country_list,
    state_list: state.contact.state_list,
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    employmentCreateActions: bindActionCreators(EmploymentCreateActions, dispatch)

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
class CreateEmployment extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      createMore: false,
      initValue: {
       department:'',
       dateOfJoining:'',
       contractType:'',
       labourCard:'',
       availedLeaves:'',
       leavesAvailed:'',
       passportNumber:'',
       passportExpiryDate:'',
       visaNumber:'',
       visaExpiryDate:'',
       grossSalary:'',
      },
     
    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;

  }

  componentDidMount = () => {
    this.initializeData();
  };

  initializeData = () => {
    // this.props.employeeActions.getCountryList();
  };

  handleSubmit = (data, resetForm) => {
    this.setState({ disabled: true });
		const {
      department,
       dateOfJoining,
       contractType,
       labourCard,
       availedLeaves,
       leavesAvailed,
       passportNumber,
       passportExpiryDate,
       visaNumber,
       visaExpiryDate,
       grossSalary,
		} = data;

		const { gender } = this.state;
    const { bloodGroup } = this.state;
		const formData = new FormData();

   	formData.append(
			'department',
			department !== null ? department : '',
		);
    formData.append(
			'dateOfJoining',
			dateOfJoining !== null ? dateOfJoining : '',
		);
    formData.append(
			'contractType',
			contractType !== null ? contractType : '',
		);
    formData.append(
      'labourCard',
      labourCard != null ? labourCard : '',
    );
    formData.append(
      'availedLeaves',
      availedLeaves != null ? availedLeaves : '',
    )
    formData.append(
      'leavesAvailed',
      leavesAvailed != null ? leavesAvailed : '',
    )
    formData.append(
      'passportNumber',
      passportNumber != null ? passportNumber :'',
    )
    formData.append(
      'passportExpiryDate',
      passportExpiryDate != null ? passportExpiryDate :'',
    )
    formData.append(
      'visaNumber',
      visaNumber != null ? visaNumber : '',
    )
    formData.append(
      'visaExpiryDate',
      visaExpiryDate != null ? visaExpiryDate : '',
    )
    formData.append(
      'grossSalary',
      grossSalary != null ? grossSalary : '',
    )
    
    this.props.employmentCreateActions
    .createEmployment(formData)
    .then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert(
          'success', 
          res.data ? res.data.message :'Created Successfully'
          )
        if (this.state.createMore) {
          this.setState({
            createMore: false
          })
          resetForm(this.state.initValue)
        } else {
          this.props.history.push('/admin/master/employee')
        }
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert(
        'error',
         err.data.message ? err.data.message :'Created Unsuccessfully'
         )
    })
  }


  render() {

    const { currency_list,country_list,state_list } = this.props
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
                        <span className="ml-2">Create Employment</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Formik
                        // initialValues={this.state.initValue}
                        // onSubmit={(values, { resetForm }) => {
                        //   this.handleSubmit(values, resetForm)
                        //   // resetForm(this.state.initValue)

                        //   // this.setState({
                        //   //   selectedContactCurrency: null,
                        //   //   selectedCurrency: null,
                        //   //   selectedInvoiceLanguage: null
                        //   // })
                        // }}
                        // validationSchema={Yup.object().shape({
                        //   firstName: Yup.string()
                        //     .required("First Name is Required"),
                        //   lastName: Yup.string()
                        //     .required("Last Name is Required"),
                        //   middleName: Yup.string()
                        //     .required("Middle Name is Required"),
                        //   email: Yup.string().email("Valid Email Required"),
                        //   billingEmail: Yup.string().email("Valid Email Required"),
                        //   password: Yup.string()
                        //     .required("Password is Required")
                        //     // .min(8, "Password Too Short")
                        //     .matches(
                        //       /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                        //       "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
                        //     ),
                        //   confirmPassword: Yup.string()
                        //     .required('Confirm Password is Required')
                        //     .oneOf([Yup.ref("password"), null], "Passwords must match"),
                        //   dob: Yup.date()
                        //     .required('DOB is Required')
                        // })}
                      >
                        {(props) => (

                          <Form onSubmit={props.handleSubmit}>
                            <h4 className="mb-4">Employment</h4>
                       <Row>
                         
                           <Col lg={10}>
                            <Row  >
                            <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="select">Department </Label>
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="department"
                                    name="department"
                                    value={props.values.department}
                                    placeholder="Enter department"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)){ props.handleChange('department')(option)}
                                    }}
                                    className={props.errors.department && props.touched.department ? "is-invalid" : ""}
                                  />
                                  {props.errors.department && props.touched.department && (
                                    <div className="invalid-feedback">{props.errors.department}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="4">
                                <FormGroup className="mb-3">
                                  <Label htmlFor="dateOfJoining"><span className="text-danger">* </span>Date Of Joining</Label>
                                  <DatePicker
                                    className={`form-control ${props.errors.dateOfJoining && props.touched.dateOfJoining ? "is-invalid" : ""}`}
                                    id="dateOfJoining"
                                    name="dateOfJoining"
                                    placeholderText="Select Date Of Joining"
                                    showMonthDropdown
                                    showYearDropdown 
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={props.values.dateOfJoining}
                                    value={props.values.dateOfJoining}
                                    onChange={(value) => {
                                      props.handleChange("dateOfJoining")(value)
                                    }}
                                  />
                                  {props.errors.dob && props.touched.dateOfJoining && (
                                    <div className="invalid-feedback">{props.errors.dateOfJoining}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>

                            <Row className="row-wrapper">
                            <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="select">Employee Code </Label>
                                  <Input 
                                    type="text"
                                    maxLength="50"
                                    id="employeeCode"
                                    name="employeeCode"
                                    value={props.values.employeeRole}
                                    placeholder="Enter Employee Code"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)){ props.handleChange('employeeCode')(option)}
                                    }}
                                    className={props.errors.employeeCode && props.touched.employeeCode ? "is-invalid" : ""}
                                  />
                                  {props.errors.employeeCode && props.touched.employeeCode && (
                                    <div className="invalid-feedback">{props.errors.employeeCode}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="labourCard">Labour Card</Label>
                                  <Input
                                    type="text"
                                    id="labourCard"
                                    name="labourCard"
                                    value={props.values.labourCard}
                                    placeholder="Enter Labour Card"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('labourCard')(option) }
                                    }}
                                    className={props.errors.firstName && props.touched.firstName ? "is-invalid" : ""}
                                  />
																	{props.errors.labourCard && props.touched.labourCard && (
																		<div className="invalid-feedback">
																			{props.errors.labourCard}
																		</div>
																	)}

                                </FormGroup>
                              </Col>
                            </Row>
                            <Row  className="row-wrapper">
                              
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select">Available Leaves</Label>
                                  <Input 
                                    type="text"
                                    id="availedLeaves"
                                    name="availedLeaves"
                                    value={props.values.availedLeaves}
                                    placeholder="Enter Available Leaves"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('availedLeaves')(option) }
                                    }}
                                    className={props.errors.availedLeaves && props.touched.availedLeaves ? "is-invalid" : ""}
                                  />
                                  {props.errors.availedLeaves && props.touched.availedLeaves && (
                                    <div className="invalid-feedback">{props.errors.availedLeaves}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select">Leaves Availed</Label>
                                  <Input 
                                    type="text"
                                    id="leavesAvailed"
                                    name="leavesAvailed"
                                    value={props.values.leavesAvailed}
                                    placeholder="Enter Leaves Availed"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('leavesAvailed')(option) }
                                    }}
                                    className={props.errors.leavesAvailed && props.touched.leavesAvailed ? "is-invalid" : ""}
                                  />
                                  {props.errors.leavesAvailed && props.touched.leavesAvailed && (
                                    <div className="invalid-feedback">{props.errors.leavesAvailed}</div>
                                  )}
                                </FormGroup>
                              </Col>
                             
                            </Row>
                            
                     
                            <Row className="row-wrapper">
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="gender">Passport Number </Label>
                                  <Input 
                                    type="text"
                                    maxLength="9"
                                    id="passportNumber"
                                    name="passportNumber"
                                    placeholder="Enter Present Address "
                                    onChange={(value) => { props.handleChange("passportNumber")(value) }}
                                    value={props.values.presentAddress}
                                    className={
                                      props.errors.passportNumber && props.touched.passportNumber
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.passportNumber && props.touched.passportNumber && (
                                    <div className="invalid-feedback">{props.errors.passportNumber}</div>
                                  )}
                                </FormGroup>
                              </Col> 
                              <Col md="4">
                                <FormGroup className="mb-3">
                                  <Label htmlFor="passportExpiryDate"><span className="text-danger">* </span>Passport expiry Date</Label>
                                  <DatePicker
                                    className={`form-control ${props.errors.dateOfJoining && props.touched.dateOfJoining ? "is-invalid" : ""}`}
                                    id="passportExpiryDate"
                                    name="passportExpiryDate"
                                    placeholderText="Select passport Expiry Date"
                                    showMonthDropdown
                                    showYearDropdown 
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={props.values.passportExpiryDate}
                                    value={props.values.passportExpiryDate}
                                    onChange={(value) => {
                                      props.handleChange("passportExpiryDate")(value)
                                    }}
                                  />
                                  {props.errors.dob && props.touched.passportExpiryDate && (
                                    <div className="invalid-feedback">{props.errors.passportExpiryDate}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row className="row-wrapper">
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="gender">Visa Number </Label>
                                  <Input 
                                    type="text" 
                                    maxLength="9"
                                    id="visaNumber"
                                    name="visaNumber"
                                    placeholder="Enter Present Address "
                                    onChange={(value) => { props.handleChange("visaNumber")(value) }}
                                    value={props.values.visaNumber}
                                    className={
                                      props.errors.visaNumber && props.touched.visaNumber
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.visaNumber && props.touched.visaNumber && (
                                    <div className="invalid-feedback">{props.errors.visaNumber}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="4">
                                <FormGroup className="mb-3">
                                  <Label htmlFor="visaExpiryDate"><span className="text-danger">* </span>Visa ExpiryDate</Label>
                                  <DatePicker 
                                    className={`form-control ${props.errors.visaExpiryDate && props.touched.visaExpiryDate ? "is-invalid" : ""}`}
                                    id="visaExpiryDate"
                                    name="visaExpiryDate"
                                    placeholderText="Select visa Expiry Date"
                                    showMonthDropdown
                                    showYearDropdown 
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={props.values.visaExpiryDate}
                                    value={props.values.visaExpiryDate}
                                    onChange={(value) => {
                                      props.handleChange("visaExpiryDate")(value)
                                    }}
                                  />
                                  {props.errors.dob && props.touched.visaExpiryDate && (
                                    <div className="invalid-feedback">{props.errors.visaExpiryDate}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                           <Row> <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="gender">Gross Salary </Label>
                                  <Input  
                                    type="text"
                                    maxLength="14,2"
                                    id="grossSalary"
                                    name="grossSalary"
                                    placeholder="Enter  grossSalary "
                                    onChange={(value) => { props.handleChange("grossSalary")(value) }}
                                    value={props.values.grossSalary}
                                    className={
                                      props.errors.grossSalary && props.touched.grossSalary
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.grossSalary && props.touched.grossSalary && (
                                    <div className="invalid-feedback">{props.errors.visaNumber}</div>
                                  )}
                                </FormGroup>
                              </Col></Row>
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
                                    onClick={() => { this.props.history.push('/admin/payroll/employment') }}>
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
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CreateEmployment)




