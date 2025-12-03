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
import Select from 'react-select';

import { Formik } from 'formik';
import * as Yup from 'yup';

import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import { toast } from 'react-toastify';
 
import PhoneInput  from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);
class SupplierModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			showDetails : false,
			loading: false,
			initValue: {
				contactType: 1,
				billingEmail: '',
				city: '',
				contractPoNumber: '',
				countryId: '',
				currencyCode: '',
				email: '',
				firstName: '',
				addressLine1: '',
				addressLine2: '',
				addressLine3: '',
				// language(Language, optional),
				lastName: '',
				middleName: '',
				mobileNumber: '',
				organizationName: '',
				poBoxNumber: '',
				postZipCode: '',
				stateId: '',
				telephone: '',
				vatRegistrationNumber: '',
				disabled: false,
			},
			state_list: [],
			checkmobileNumberParam:false,
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
	handleSubmit = (data, resetForm, setSubmitting) => {
		this.setState({ disabled: true });
		const postData = this.getData(data);
		this.props
			.createSupplier(postData)
			.then((res) => {
				this.setState({ disabled: false });
				let resConfig = JSON.parse(res.config.data);
				
				if (res.status === 200) {
					resetForm();
					this.props.closeSupplierModal(true);

					let tmpData = res.data;
					tmpData.currencyCode = resConfig.currencyCode;

					this.props.getCurrentUser(tmpData);
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.displayMsg(err);
				this.formikRef.current.setSubmitting(false);
			});
	};

	displayMsg = (err) => {
		toast.error(`${err.data.message}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};
	_showDetails = (bool) => {
		this.setState({
		  showDetails: bool
		});
	  }

	getStateList = (countryCode) => {
		if (countryCode) {
			this.props.getStateList(countryCode).then((res) => {
				if (res.status === 200) {
					this.setState({
						state_list: res.data,
					});
				}
			});
		} else {
			this.setState({
				state_list: [],
			});
		}
	};

	render() {
		strings.setLanguage(this.state.language);
		const {
			openSupplierModal,
			closeSupplierModal,
			currency_list,
			country_list,
		} = this.props;
		const { initValue, state_list, checkmobileNumberParam} = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openSupplierModal}
					className="modal-success contact-modal"
				>
					<Formik
						ref={this.formikRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm, setSubmitting }) => {
							this.handleSubmit(values, resetForm);
						}}
						
validate={(values) => {   let errors = {};
if (checkmobileNumberParam === true) {
errors.mobileNumber =
'Invalid mobile number';
 }
 // if (param === true) {
// errors.discount =
// 'Discount amount Cannot be greater than Invoice Total Amount';
// }
 return errors;
  }}

						validationSchema={Yup.object().shape({
							firstName: Yup.string().required('First name is required'),
							lastName: Yup.string().required('Last name is required'),
							vatRegistrationNumber: Yup.string().required('	Tax registration number is required'),
							// lastName: Yup.string().required('Last name is required'),
							// middleName: Yup.string().required('Middle name is required'),
							// contactType: Yup.string()
							// .required("Please Select Contact Type"),
							//       organization: Yup.string()
							//       .required("Organization name is required"),
							//     poBoxNumber: Yup.number()
							//       .required("PO Box Number is required"),
							email: Yup.string()
								.required('Email is required')
								.email('Invalid Email'),
							//telephone: Yup.number().required('Telephone Number is required'),
							mobileNumber: Yup.string()
								.required('Mobile number is required'),
								addressLine1: Yup.string()
								.required("Address line 1 is required"),
								 addressLine2: Yup.string()
								.required("Address line 2 is required"),
								 addressLine3: Yup.string()
								.required("Address line 3 is required"),
								 countryId: Yup.string()
								.required("Country is required"),
								stateId: Yup.string()
								.required("State region is required"),
								//  city: Yup.string()
								// .required("City is required"),
							//     addressLine1: Yup.string()
							//       .required("Address is required"),
							// countryId: Yup.string()
							// 	.required('Country is required')
							// 	.nullable(),
							// stateId: Yup.string().when('countryId', {
							// 	is: (val) => (val ? true : false),
							// 	then: Yup.string().required('State is required'),
							// }),
							//     city: Yup.string()
							//       .required("City is required"),
							//postZipCode: Yup.string().required('Postal Code is required'),
							//     billingEmail: Yup.string()
							//       .required("Billing Email is required")
							//       .email('Invalid Email'),
							//     contractPoNumber: Yup.number()
							//       .required("Contract PoNumber is required"),
							// vatRegistrationNumber: Yup.string().required(
							// 	'Tax Registration Number is required',
							// ),
							currencyCode: Yup.string().required('Please Select Currency'),
							//       .nullable(),
						})}
					>
						{(props) => {
							const { isSubmitting } = props;
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
													<span className="ml-2">{strings.CreateSupplier}</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<ModalBody>
									<h4 className="mb-3 mt-3">{strings.ContactDetails}</h4>
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="firstName">
														<span className="text-danger">* </span>{strings.FirstName}
													</Label>
													<Input
														type="text"
														maxLength="100"
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
														placeholder={strings.Enter+strings.FirstName}
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
													<Label htmlFor="middleName">{strings.MiddleName}</Label>
													<Input
														type="text"
														maxLength="100"
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
														placeholder={strings.Enter+strings.MiddleName}
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
													<Label htmlFor="lastName"><span className="text-danger">* </span>{strings.LastName}</Label>
													<Input
														type="text"
														maxLength="100"
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
														placeholder={strings.Enter+strings.LastName}
													/>
													{props.errors.lastName && props.touched.lastName && (
														<div className="invalid-feedback">
															{props.errors.lastName}
														</div>
													)}
												</FormGroup>
											</Col>
										</Row>
										<Row>
										<Col md="4">
												<FormGroup>
													<Label htmlFor="email">
														<span className="text-danger">* </span>{strings.Email}
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
														placeholder={strings.Enter+strings.Email}
													/>
													{props.errors.email && props.touched.email && (
														<div className="invalid-feedback">
															{props.errors.email}
														</div>
													)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="mobileNumber">
														{' '}
														<span className="text-danger">* </span>{strings.MobileNumber}
													</Label>
													<PhoneInput
														country={"ae"}
														enableSearch={true}
														international
														value={props.values.mobileNumber}
														onChange={(option) => {
															props.handleChange('mobileNumber')(option);
															option.length!=12 ? this.setState({checkmobileNumberParam:true}) :this.setState({checkmobileNumberParam:false});
														}}
														className={
															props.errors.mobileNumber &&
															props.touched.mobileNumber
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.mobileNumber &&
														props.touched.mobileNumber && (
															<div style={{color:"red"}}>
																{props.errors.mobileNumber}
															</div>
														)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="organizationName">{strings.OrganizationName}</Label>
													<Input
														type="text"
														maxLength="100"
														id="organizationName "
														name="organizationName "
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAlpha.test(option.target.value)
															) {
																props.handleChange('organizationName')(option);
															}
														}}
														value={props.values.organizationName}
														className={
															props.errors.organizationName&&
															props.touched.organizationName
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.OrganizationName}
													/>
													{props.errors.organizationName &&
														props.touched.organizationName && (
															<div className="invalid-feedback">
																{props.errors.organizationName}
															</div>
														)}
												</FormGroup>
											</Col>
											
										</Row>
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="vatRegistrationNumber">
													<span className="text-danger">* </span>
														{strings.TaxRegistrationNumber}
													</Label>
													<Input
														type="text"
														maxLength="15"
														id="vatRegistrationNumber"
														name="vatRegistrationNumber"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regEx.test(option.target.value)
															) {
																props.handleChange('vatRegistrationNumber')(
																	option,
																);
															}
														}}
														value={props.values.vatRegistrationNumber}
														className={
															props.errors.vatRegistrationNumber &&
															props.touched.vatRegistrationNumber
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.TaxRegistrationNumber}
													/>
													{props.errors.vatRegistrationNumber &&
														props.touched.vatRegistrationNumber && (
															<div className="invalid-feedback">
																{props.errors.vatRegistrationNumber}
															</div>
														)}
														<div className="VerifyTRN">
																		<br/>
																		<b>	<a target="_blank" href="https://tax.gov.ae/en/default.aspx" style={{ color: '#2266d8' }}  >{strings.VerifyTRN}</a></b>
														</div>
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="currencyCode">
													<span className="text-danger">* </span>{strings.Currency}
													</Label>
													<Select
														options={
															currency_list
																? selectCurrencyFactory.renderOptions(
																		'currencyName',
																		'currencyCode',
																		currency_list,
																		'Currency',
																  )
																: []
														}
														value={
															currency_list &&
															selectCurrencyFactory
																.renderOptions(
																	'currencyName',
																	'currencyCode',
																	currency_list,
																	'Currency',
																)
																.find(
																	(option) =>
																		option.value === +props.values.currencyCode,
																)
														}
														onChange={(option) => {
															if (option && option.value) {
																props.handleChange('currencyCode')(option);
															} else {
																props.handleChange('currencyCode')('');
															}
														}}
														placeholder={strings.Select+strings.Currency}
														id="currencyCode"
														name="currencyCode"
														className={
															props.errors.currencyCode &&
															props.touched.currencyCode
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.currencyCode &&
														props.touched.currencyCode && (
															<div className="invalid-feedback">
																{props.errors.currencyCode}
															</div>
														)}
												</FormGroup>
											</Col>
										</Row>
										<Row> 
											<Button
											className="mb-3 ml-2"
											 onClick={this._showDetails.bind(null, true)}
											 disabled={
												this._showDetails === true
											}
										 >	{strings.MoreDetails}
											 </Button>
											 </Row> 	
											 {this.state.showDetails &&
										(<div id="moreDetails">
										<Row className="row-wrapper">
										
											<Col md="4">
												<FormGroup>
													<Label htmlFor="select">{strings.POBoxNumber}</Label>
													<Input
														type="text"
														maxLength="50"
														id="poBoxNumber"
														name="poBoxNumber"
														onChange={(value) => {
															props.handleChange('poBoxNumber')(value);
														}}
														value={props.values.poBoxNumber}
														className={
															props.errors.poBoxNumber &&
															props.touched.poBoxNumber
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.POBoxNumber}
													/>
													{props.errors.poBoxNumber &&
														props.touched.poBoxNumber && (
															<div className="invalid-feedback">
																{props.errors.poBoxNumber}
															</div>
														)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="telephone">{strings.Telephone}</Label>
													<Input
													maxLength="15"
														type="text"
														id="telephone"
														name="telephone"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regEx.test(option.target.value)
															) {
																props.handleChange('telephone')(option);
															}
														}}
														value={props.values.telephone}
														className={
															props.errors.telephone && props.touched.telephone
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.TelephoneNumber}
													/>
													{props.errors.telephone &&
														props.touched.telephone && (
															<div className="invalid-feedback">
																{props.errors.telephone}
															</div>
														)}
												</FormGroup>
											</Col>

											<Col md="4">
												<FormGroup>
													<Label htmlFor="postZipCode">{strings.PostZipCode}</Label>
													<Input
														type="text"
														maxLength="10"
														id="postZipCode"
														name="postZipCode"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExBoth.test(option.target.value)
															) {
																props.handleChange('postZipCode')(option);
															}
														}}
														value={props.values.postZipCode}
														className={
															props.errors.postZipCode &&
															props.touched.postZipCode
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.PostZipCode}
													/>
													{props.errors.postZipCode &&
														props.touched.postZipCode && (
															<div className="invalid-feedback">
																{props.errors.postZipCode}
															</div>
														)}
												</FormGroup>
											</Col>
											
										</Row>
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="addressLine1"><span className="text-danger">* </span>{strings.AddressLine1}</Label>
													<Input
														type="text"
														maxLength="100"
														id="addressLine1"
														name="addressLine1"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAddress.test(option.target.value)
															) {
																props.handleChange('addressLine1')(option);
															}
														}}
														value={props.values.addressLine1}
														className={
															props.errors.addressLine1 &&
															props.touched.addressLine1
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.AddressLine1}
													/>
													{props.errors.addressLine1 &&
														props.touched.addressLine1 && (
															<div className="invalid-feedback">
																{props.errors.addressLine1}
															</div>
														)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="addressLine2"><span className="text-danger">* </span>{strings.AddressLine2}</Label>
													<Input
														type="text"
														maxLength="100"
														id="addressLine2"
														name="addressLine2"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAddress.test(option.target.value)
															) {
																props.handleChange('addressLine2')(option);
															}
														}}
														value={props.values.addressLine2}
														className={
															props.errors.addressLine2 &&
															props.touched.addressLine2
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.AddressLine2}
													/>
													{props.errors.addressLine2 &&
														props.touched.addressLine2 && (
															<div className="invalid-feedback">
																{props.errors.addressLine2}
															</div>
														)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="addressLine3"><span className="text-danger">* </span>{strings.AddressLine3}</Label>
													<Input
														type="text"
														maxLength="100"
														id="addressLine3"
														name="addressLine3"
														onChange={(option) => {
															if (
																option.target.value === '' ||
																this.regExAddress.test(option.target.value)
															) {
																props.handleChange('addressLine3')(option);
															}
														}}
														value={props.values.addressLine3}
														className={
															props.errors.addressLine3 &&
															props.touched.addressLine3
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.AddressLine3}
													/>
													{props.errors.addressLine3 &&
														props.touched.addressLine3 && (
															<div className="invalid-feedback">
																{props.errors.addressLine3}
															</div>
														)}

												</FormGroup>
											</Col>
										</Row>
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="countryId"><span className="text-danger">* </span>{strings.Country}</Label>
													<Select
														options={
															country_list
																? selectOptionsFactory.renderOptions(
																		'countryName',
																		'countryCode',
																		country_list,
																		'Country',
																  )
																: []
														}
														value={props.values.countryId}
														onChange={(option) => {
															if (option && option.value) {
																props.handleChange('countryId')(option);
																this.getStateList(option.value);
															} else {
																props.handleChange('countryId')('');
																this.getStateList(option.value);
															}
															props.handleChange('stateId')('');
														}}
														placeholder={strings.Select+strings.Country}
														id="countryId"
														name="countryId"
														className={
															props.errors.countryId && props.touched.countryId
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.countryId &&
														props.touched.countryId && (
															<div className="invalid-feedback">
																{props.errors.countryId}
															</div>
														)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="stateId"><span className="text-danger">* </span>{strings.StateRegion}</Label>
													<Select
														options={
															state_list
																? selectOptionsFactory.renderOptions(
																		'label',
																		'value',
																		state_list,
																		'State',
																  )
																: []
														}
														value={props.values.stateId}
														onChange={(option) => {
															if (option && option.value) {
																props.handleChange('stateId')(option);
															} else {
																props.handleChange('stateId')('');
															}
														}}
														placeholder={strings.Select+strings.StateRegion}
														id="stateId"
														name="stateId"
														className={
															props.errors.stateId && props.touched.stateId
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.stateId && props.touched.stateId && (
														<div className="invalid-feedback">
															{props.errors.stateId}
														</div>
													)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="city"><span className="text-danger"></span>{strings.City}</Label>
													<Input
														// options={city ? selectOptionsFactory.renderOptions('cityName', 'cityCode', cityRegion) : ''}
														value={props.values.city}
														onChange={(option) =>
															props.handleChange('city')(option)
														}
														placeholder={strings.Location}
														id="city"
														name="city"
														type="text"
														maxLength="100"
														className={
															props.errors.city && props.touched.city
																? 'is-invalid'
																: ''
														}
													/>
													{props.errors.city && props.touched.city && (
														<div className="invalid-feedback">
															{props.errors.city}
														</div>
													)}
												</FormGroup>
											</Col>
										</Row>
									

										<hr />
										<h4 className="mb-3 mt-3">{strings.InvoicingDetails}</h4>
										<Row className="row-wrapper">
											<Col md="4">
												<FormGroup>
													<Label htmlFor="billingEmail">{strings.BillingEmail}</Label>
													<Input
														type="text"
														maxLength="80"
														id="billingEmail"
														name="billingEmail"
														onChange={(value) => {
															props.handleChange('billingEmail')(value);
														}}
														value={props.values.billingEmail}
														className={
															props.errors.billingEmail &&
															props.touched.billingEmail
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.BillingEmail}
													/>
													{props.billingEmail && props.touched.billingEmail && (
														<div className="invalid-feedback">
															{props.errors.billingEmail}
														</div>
													)}
												</FormGroup>
											</Col>
											<Col md="4">
												<FormGroup>
													<Label htmlFor="contractPoNumber">
													{strings.ContractPONumber}
													</Label>
													<Input
														type="text"
														maxLength="10"
														id="contractPoNumber"
														name="contractPoNumber"
														onChange={(value) => {
															props.handleChange('contractPoNumber')(value);
														}}
														value={props.values.contractPoNumber}
														className={
															props.errors.contractPoNumber &&
															props.touched.contractPoNumber
																? 'is-invalid'
																: ''
														}
														placeholder={strings.Enter+strings.ContractPONumber}
													/>
													{props.errors.contractPoNumber &&
														props.touched.contractPoNumber && (
															<div className="invalid-feedback">
																{props.errors.contractPoNumber}
															</div>
														)}
												</FormGroup>
											</Col>
										</Row>
										<Row>
										<IconButton 
										aria-label="delete"
										size="medium" 
										 onClick={this._showDetails.bind(null, false)}>
          									<ArrowUpwardIcon fontSize="inherit" />
       										 </IconButton>
										 </Row>
										</div>
											)}
									</ModalBody>
									<ModalFooter>
										<Button
											color="primary"
											type="submit"
											className="btn-square"
											disabled={this.state.disabled}
											disabled={isSubmitting}
										>
											<i className="fa fa-dot-circle-o"></i> 	{this.state.disabled
																			? 'Creating...'
																			: strings.Create }
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												closeSupplierModal(false);
											}}
										>
											<i className="fa fa-ban"></i> {strings.Cancel}
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

export default SupplierModal;
