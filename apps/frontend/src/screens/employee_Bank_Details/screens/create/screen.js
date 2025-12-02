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
import * as EmployeeCreateActions from './actions';

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
    employeeCreateActions: bindActionCreators(EmployeeCreateActions, dispatch)

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
class CreateEmployeeFinancial extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      createMore: false,
      initValue: {
      accountHolderName:'',
      routingCode:'',
       contractType:'',
       accountNumber:'',
       swiftCode:'',
       ibanNumber:'',
       branch:'',
       bankName:'',

      },
     
    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;

    this.gender = [
			{ label: 'Male', value: 'Male' },
			{ label: 'Female', value: 'Female' }
		];

    this.bloodGroup = [
			{ label: 'O+', value: 'O+' },
			{ label: 'O-', value: 'O-' },
      { label: 'A+', value: 'A+' },
			{ label: 'A-', value: 'A-' },
      { label: 'B+', value: 'B+' },
			{ label: 'B-', value: 'B-' },
      { label: 'AB+', value: 'AB+' },
			{ label: 'AB-', value: 'AB-' },
    
		];
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
      accountHolderName,
       dateOfJoining,
       contractType,
       labourCard,
       availableLeaves,
       leaveAvailed,
       passportNumber,
       passportExpiryDate,
       visaNumber,
       visaExpiryDate,
		} = data;

		const { gender } = this.state;
    const { bloodGroup } = this.state;
		const formData = new FormData();

   	formData.append(
			'accountHolderName',
			accountHolderName !== null ? accountHolderName : '',
		);
    formData.append(
			'dateOfJoining',
			dateOfJoining !== null ? dateOfJoining : '',
		);
    formData.append(
			'contractType',
			contractType !== null ? contractType : '',
		);
    // formData.append(
    //   'mobileNumber',
    //   mobileNumber != null ? mobileNumber : '',
    // );
    // formData.append(
    //   'email',
    //   email != null ? email : '',
    // )
    // formData.append(
    //   'presentAddress',
    //   presentAddress != null ? presentAddress : '',
    // )
    // formData.append(
    //   'countryId',
    //   countryId != null ? countryId :'',
    // )
    // formData.append(
    //   'stateId',
    //   stateId != null ? stateId :'',
    // )
    // formData.append(
    //   'city',
    //   city != null ? city : '',
    // )
    // formData.append(
    //   'pincode',
    //   pincode != null ? pincode : '',
    // )
    // if (gender && gender.value) {
		// 	formData.append('gender', gender.value);
		// }
    // if (bloodGroup && bloodGroup.value) {
		// 	formData.append('bloodGroup', bloodGroup.value);
		// }
    
    this.props.employeeCreateActions
    .createEmployee(formData)
    .then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert(
          'success', 
          res.data ? res.data.message : 'New Employee Created Successfully'
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
      this.props.commonActions.tostifyAlert('error', 
      err && err.data ? err.data.message : 'Employee Created Unsuccessfully'
      )
    })
  }

  getStateList = (countryCode) => {
		this.props.employeeActions.getStateList(countryCode);
	};

  render() {

    const { currency_list,country_list,state_list } = this.props

    console.log(country_list)
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
                        <span className="ml-2">Create Financial</span>
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
                            <h4 className="mb-4">Finacial Details</h4>
                       <Row>
                         
                           <Col lg={10}>
                      
                          
                            <Row  >
                            <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="select">Account Holder Name </Label>
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="accountHolderName"
                                    name="accountHolderName"
                                    value={props.values.accountHolderName}
                                    placeholder="Enter accountHolderName"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)){ props.handleChange('accountHolderName')(option)}
                                    }}
                                    className={props.errors.accountHolderName && props.touched.accountHolderName ? "is-invalid" : ""}
                                  />
                                  {props.errors.accountHolderName && props.touched.accountHolderName && (
                                    <div className="invalid-feedback">{props.errors.accountHolderName}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="select">Account Number</Label>
                                  <Input
                                    type="text"
                                    maxLength="23"
                                    id="accountNumber"
                                    name="accountNumber"
                                    value={props.values.accountNumber}
                                    placeholder="Enter account Number"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)){ props.handleChange('accountNumber')(option)}
                                    }}
                                    className={props.errors.accountNumber && props.touched.accountNumber ? "is-invalid" : ""}
                                  />
                                  {props.errors.accountNumber && props.touched.accountNumber && (
                                    <div className="invalid-feedback">{props.errors.accountNumber}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                     
                            <Row className="row-wrapper">
                            <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="select">IBAN Number</Label>
                                  <Input 
                                    type="text"
                                    maxLength="23"
                                    id="ibanNumber"
                                    name="ibanNumber"
                                    value={props.values.ibanNumber}
                                    placeholder="Enter IBAN Number"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)){ props.handleChange('ibanNumber')(option)}
                                    }}
                                    className={props.errors.ibanNumber && props.touched.ibanNumber ? "is-invalid" : ""}
                                  />
                                  {props.errors.employeeCode && props.touched.employeeCode && (
                                    <div className="invalid-feedback">{props.errors.ibanNumber}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="labourCard">Bank Name</Label>
                                  <Input
                                    type="text"
                                    maxLength="100"
                                    id="bankName"
                                    name="bankName"
                                    value={props.values.bankName}
                                    placeholder="Enter bank Name"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('bankName')(option) }
                                    }}
                                    className={props.errors.bankName && props.touched.bankName ? "is-invalid" : ""}
                                  />
																	{props.errors.bankName && props.touched.bankName && (
																		<div className="invalid-feedback">
																			{props.errors.bankName}
																		</div>
																	)}

                                </FormGroup>
                              </Col>
                            </Row>
                            <Row  className="row-wrapper">
                              
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select">Branch</Label>
                                  <Input 
                                    type="text"
                                    maxLength="100"
                                    id="branch"
                                    name="branch"
                                    value={props.values.branch}
                                    placeholder="Enter branch"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('branch')(option) }
                                    }}
                                    className={props.errors.branch && props.touched.branch ? "is-invalid" : ""}
                                  />
                                  {props.errors.branch && props.touched.branch && (
                                    <div className="invalid-feedback">{props.errors.branch}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select">Swift Code</Label>
                                  <Input 
                                    type="text"
                                    minLength='8'
                                    maxLength="11"
                                    id="swiftCode"
                                    name="swiftCode"
                                    value={props.values.swiftCode}
                                    placeholder="Enter swift Code"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('swiftCode')(option) }
                                    }}
                                    className={props.errors.swiftCode && props.touched.swiftCode ? "is-invalid" : ""}
                                  />
                                  {props.errors.swiftCode && props.touched.swiftCode && (
                                    <div className="invalid-feedback">{props.errors.swiftCode}</div>
                                  )}
                                </FormGroup>
                              </Col>
                             
                            </Row>
                            
                     
                            <Row className="row-wrapper">
                              <Col md="4">
                                <FormGroup>
                                  <Label htmlFor="gender">Routing Code </Label>
                                  <Input 
                                    type="text"
                                    id="routingCode"
                                    name="routingCode"
                                    placeholder="Enter Present Address "
                                    onChange={(value) => { props.handleChange("routingCode")(value) }}
                                    value={props.values.routingCode}
                                    className={
                                      props.errors.routingCode && props.touched.routingCode
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.routingCode && props.touched.routingCode && (
                                    <div className="invalid-feedback">{props.errors.routingCode}</div>
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
                                    placeholderText="Select passportExpiryDate"
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
                                    maxLength="16"
                                    id="visaNumber"
                                    name="visaNumber"
                                    placeholder="Enter Present Address "
                                    onChange={(value) => { props.handleChange("visaNumber")(value) }}
                                    value={props.values.presentAddress}
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
                                  <Label htmlFor="date"><span className="text-danger">* </span>\Visa ExpiryDate</Label>
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
                                      props.handleChange("dateOfJoining")(value)
                                    }}
                                  />
                                  {props.errors.dob && props.touched.visaExpiryDate && (
                                    <div className="invalid-feedback">{props.errors.visaExpiryDate}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                           
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
                                    onClick={() => { this.props.history.push('/admin/payroll/employee') }}>
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


export default connect(mapStateToProps, mapDispatchToProps)(CreateEmployeeFinancial)




