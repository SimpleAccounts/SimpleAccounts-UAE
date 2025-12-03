import React from 'react';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
} from 'reactstrap';

import DatePicker from 'react-datepicker'
import { Formik } from 'formik';
import * as Yup from 'yup';


import { toast } from 'react-toastify';
 
import moment from 'moment';


class EmployeeModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showDetails : false,
			loading: false,
			initValue: {
			firstName: '',
			lastName: '',
			middleName: '',
			email: '',
			dob: new Date(),
			},
			state_list: [],
		};
		this.formikRef = React.createRef();
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExAddress = /^[a-zA-Z0-9\s,'-]+$/;
	}


	getData = (data) => {
		let temp = {};
		for (let item in data) {
			if (typeof data[`${item}`] !== 'object') {
				temp[`${item}`] = data[`${item}`];
			} else {
				temp[`${item}`] = data[`${item}`].value;
			}
		}
		return temp;
	};

	// Create or Contact
	// handleSubmit = (data, resetForm) => {


	// 	this.setState({ disabled: true });
	// 	// const employeeId = data['employeeId'];
	// 	const firstName = data['firstName'];
	// 	const lastName = data['lastName'];
	// 	const middleName = data['middleName'];
	
	// 	const email = data['email'];
	// 	const dob = data['dob'];

	// 	const dataNew = {
	// 		firstName,
	// 		lastName,
	// 		middleName,
	// 		email,
	// 		dob,
	// 	};
	// 	const postData = this.getData(dataNew);
	// 	this.props
	// 		.createEmployee(postData)
	// 		.then((res) => {
				
	// 			if (res.status === 200) {
	// 				resetForm();
	// 				this.props.closeEmployeeModal(true);
	// 				this.props.getCurrentUser(res);
	// 			}
	// 		})
	// 		.catch((err) => {
	// 			this.displayMsg(err);
	// 			this.formikRef.current.setSubmitting(false);
	// 		});
	// };
	handleSubmit = (data, resetForm) => {

		const {
			firstName,
			lastName,
			middleName,
			email,
			dob,
		} = data;
		let formData = new FormData();
		formData.append('firstName', firstName ? firstName : '');
		formData.append('lastName', lastName ? lastName : '');
		formData.append('middleName', middleName ? middleName : '');
		formData.append('email', email ? email : '');
		formData.append('dob', dob ? dob : '');
		// const postData = {
		// 	firstName: data.firstName,
		// 	lastName: data.lastName,
		// 	middleName: data.middleName,
		// 	email: data.email,
		// 	dob: moment(data.dob, 'DD-MM-YYYY').toDate(),
		// }
		this.props
			.createEmployee(formData)
			.then((res) => {
				//  let resConfig = JSON.parse(res.config.data);
				
				if (res.status === 200) {
				
					resetForm();
				
					this.props.closeEmployeeModal(true);
					this.props.getCurrentUser(res.formData);
				
				}
			})
			.catch((err) => {
				this.displayMsg(err);
				this.formikRef.current.setSubmitting(false);
			});
	};
		
	

	displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};
	_showDetails = (bool) => {
		this.setState({
		  showDetails: bool
		});
	  }

	// getStateList = (countryCode) => {
	// 	if (countryCode) {
	// 		this.props.getStateList(countryCode).then((res) => {
	// 			if (res.status === 200) {
	// 				this.setState({
	// 					state_list: res.data,
	// 				});
	// 			}
	// 		});
	// 	} else {
	// 		this.setState({
	// 			state_list: [],
	// 		});
	// 	}
	// };
	// .contact-modal {
	// 	max-width: 70% !important;
	// }
	render() {
		const {
			openEmployeeModal,
			closeEmployeeModal,
			// currency_list,
			// country_list,
		} = this.props;
		const { initValue} = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openEmployeeModal}
					className="modal-success contact-modal"
				>
					<Formik
						ref={this.formikRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm, setSubmitting }) => {
							this.handleSubmit(values, resetForm);
						}}
						validationSchema={Yup.object().shape({
						//	firstName: Yup.string().required('First Name is Required'),
						
							//currrencyCode: Yup.string().required('Currency is Required'),
							// contactType: Yup.string()
							// .required("Please Select Contact Type"),
							//       organization: Yup.string()
							//       .required("Organization Name is Required"),
							//     poBoxNumber: Yup.number()
							//       .required("PO Box Number is Required"),
							// email: Yup.string()
							// 	.required('Email is Required')
							// 	.email('Invalid Email'),
							// mobileNumber: Yup.string()
							// 	.required('Mobile Number is required')
							// 	.test('quantity', 'Invalid Mobile Number', (value) => {
							// 		if (isValidPhoneNumber(value)) {
							// 			return true;
							// 		} else {
							// 			return false;
							// 		}
							// 	}),
							//     addressLine1: Yup.string()
							//       .required("Address is required"),
							//     city: Yup.string()
							//       .required("City is Required"),
							//     billingEmail: Yup.string()
							//       .required("Billing Email is Required")
							//       .email('Invalid Email'),
							//     contractPoNumber: Yup.number()
							//       .required("Contract PoNumber is Required"),
							
							//       currencyCode: Yup.string()
							//       .required("Please Select Currency")
							//       .nullable(),
							// currencyCode: Yup.string().required('Please Select Currency'),
						})}
					>
						{(props) => {
							const { handleBlur } = props;
							return (
								<Form
									name="simpleForm"
									onSubmit={props.handleSubmit}
									className="create-contact-screen"
								>
									<CardHeader toggle={this.toggleDanger}>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="nav-icon fas fa-id-card-alt" />
													<span className="ml-2">Create Employee</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<ModalBody>
									<h4 className="mb-3 mt-3">Employee Details</h4>
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="firstName">
														<span className="text-danger">* </span>First Name
													</Label>
													<Input
														type="text"
														maxLength="26"
														id="firstName"
														name="firstName"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAlpha.test(option.target.value)
															) {
																props.handleChange('firstName')(option);
															}
														}}
														value={props.values.firstName}
														className={
															props.errors.firstName && props.touched.firstName
																? 'is-invalid'
																: ''
														}
														placeholder="Enter First Name"
													/>
													{props.errors.firstName &&
														props.touched.firstName && (
															<div className="invalid-feedback">
																{props.errors.firstName}
															</div>
														)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="middleName">Middle Name</Label>
													<Input
														type="text"
														maxLength="26"
														id="middleName "
														name="middleName "
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAlpha.test(option.target.value)
															) {
																props.handleChange('middleName')(option);
															}
														}}
														value={props.values.middleName}
														className={
															props.errors.middleName &&
															props.touched.middleName
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Middle Name"
													/>
													{props.errors.middleName &&
														props.touched.middleName && (
															<div className="invalid-feedback">
																{props.errors.middleName}
															</div>
														)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="lastName">Last Name</Label>
													<Input
														type="text"
														maxLength="26"
														id="lastName"
														name="lastName"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAlpha.test(option.target.value)
															) {
																props.handleChange('lastName')(option);
															}
														}}
														value={props.values.lastName}
														className={
															props.errors.lastName && props.touched.lastName
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Last Name"
													/>
													{props.errors.lastName && props.touched.lastName && (
														<div className="invalid-feedback">
															{props.errors.lastName}
														</div>
													)}
												</FormGroup>
											</Col>
										</Row>
										<Row className="row-wrapper">
										<Col md="4">
												<FormGroup>
													<Label htmlFor="email">
														<span className="text-danger">* </span>Email
													</Label>
													<Input
														type="email"
														maxLength="80"
														id="email"
														name="email"
														onChange={(value) => {
															props.handleChange('email')(value);
														}}
														value={props.values.email}
														className={
															props.errors.email && props.touched.email
																? 'is-invalid'
																: ''
														}
														placeholder="Enter Email"
													/>
													{props.errors.email && props.touched.email && (
														<div className="invalid-feedback">
															{props.errors.email}
														</div>
													)}
												</FormGroup>
											</Col>

											<Col md="4">
                                <FormGroup className="mb-3">
                                  <Label htmlFor="date"><span className="text-danger">* </span>Date Of Birth</Label>
								  <DatePicker
																				id="dob"
																				name="dob"
																				showMonthDropdown
																				showYearDropdown
																				dateFormat="dd-MM-yyyy"
																				dropdownMode="select"
																				placeholderText="Enter Date of Birth"
																				maxDate={new Date()}
																				selected={props.values.dob}
																				//value={props.values.dob}
																				onChange={(value) => {
																					props.handleChange('dob')(value);

																				}}
																				className={`form-control ${props.errors.dob && props.touched.dob
																						? 'is-invalid'
																						: ''
																					}`}
																			/>
                                  {props.errors.dob && props.touched.dob && (
                                    <div className="invalid-feedback">{props.errors.dob}</div>
                                  )}
                                </FormGroup>
                              </Col>
										</Row>		
									</ModalBody>
									<ModalFooter>
									<Button
											type="button"
											color="primary"
											className="btn-square mr-3"
											onClick={() => {
												this.setState( () => {
													props.handleSubmit();
												});
											}}
										>
											<i className="fa fa-dot-circle-o"></i> Create
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												closeEmployeeModal(false);
											}}
										>
											<i className="fa fa-ban"></i> Cancel
										</Button>
									</ModalFooter>
								</Form>
							);
						}}
					</Formik>
				</Modal>
				
			</div>
		);
	}
}

export default EmployeeModal ;
