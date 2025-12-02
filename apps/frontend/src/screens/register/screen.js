import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Card,
	CardBody,
	CardGroup,
	Col,
	Container,
	Form,
	Input,
	Row,
	FormGroup,
	Label,
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { Loader } from 'components';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthActions, CommonActions } from 'services/global';
import { ToastContainer, toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from "react-phone-input-2";
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import { data } from '../Language/index'
import LocalizedStrings from 'react-localization';
import { upperFirst } from 'lodash-es';
import PasswordChecklist from "react-password-checklist";
import configData from '../../constants/config';
import { version } from 'core-js';


const mapStateToProps = (state) => {
	return {
		country_list: state.common.country_list,
		state_list: state.common.state_list,
		version: state.common.version,
		universal_currency_list: state.common.universal_currency_list,
		company_type_list: state.common.company_type_list,
	};
};
const eye = require('assets/images/settings/eye.png');
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
const options = [
	{ value: 'chocolate', label: 'Chocolate' },
	{ value: 'strawberry', label: 'Strawberry' },
	{ value: 'vanilla', label: 'Vanilla' },
];


let strings = new LocalizedStrings(data);
class Register extends React.Component {
	constructor(props) {
		super(props);
		//alert("version", this.state.version);
		this.state = {
			isPasswordShown: false,
			sabackend: '',
			alert: null,
			currencyList: [],
			country_list: [
				{
					countryCode: 229,
					countryDescription: '',
					countryFullName: "United Arab Emirates - (null)",
					countryName: "United Arab Emirates",
					createdBy: '',
					createdDate: '',
					currencyCode: '',
					defaltFlag: "Y",
					deleteFlag: false,
					isoAlpha3Code: '',
					lastUpdateBy: '',
					lastUpdateDate: '',
					orderSequence: '',
					versionNumber: 1,
				}
			],
			success: false,
			initValue: {
				companyName: '',
				currencyCode: 150,
				companyTypeCode: '',
				industryTypeCode: '',
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				confirmPassword: '',
				timeZone: { label: "Asia/Dubai", value: "Asia/Dubai" },
				countryId: 229,
				stateId: '',
				IsDesignatedZone: '',
				IsRegistered: '',
				TaxRegistrationNumber: '',
				vatRegistrationDate: '',
				companyAddress1: '',
				phoneNumber: '',
				password: "",
				confirmPassword: '',

			},
			userDetail: false,
			show: false,
			togglePassword: '***********',
			loading: false,
			checkphoneNumberParam: false,
			loadingMsg: "Loading...",
			isDesignatedZone: false,
			// timeZone: "Asia/Dubai",
			// timezone: {	label: "Asia/Dubai",value: "Asia/Dubai"	},
		};

		this.regEx = /^[0-9\d]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
	}



	componentDidMount = () => {
		this.getInitialData();
		this.getBackendRelease();
	};
	getBackendRelease = () => {
		return new Promise((resolve, reject) => {
			this.props.authActions
				.getSimpleAccountsreleasenumber()
				.then((backendVersion) => {
					const backendRelease = backendVersion.simpleVatRelease;
					this.setState({ sabackend: backendRelease }); // Set the value in the component state
					resolve(backendRelease);
				})
				.catch((error) => {
					reject(error);
				});
		});
	};
	getStateList = (countryCode) => {
		this.props.commonActions.getStateList(229);
	};
	getInitialData = () => {
		this.props.authActions.getTimeZoneList().then((response) => {
			let output = response.data.map(function (value) {
				return { label: value, value: value };
			});
			this.setState({ timezone: output });
		});

		this.props.commonActions.getStateList();
		// this.props.commonActions.getCountryList();
		this.props.commonActions.getCompanyTypeListRegister();


		this.props.authActions.getCurrencyList();
		this.props.authActions.getCompanyCount().then((response) => {
			if (response.data > 0) {
				this.props.history.push('/login');
			}
		});
	};

	// togglePasswordVisiblity = () => {
	// 	this.setState({
	// 		passwordShown: !this.state.passwordShown,
	// 	});
	// };
	// togglePasswordVisiblity = () => {
	// 	const { isPasswordShown } = this.state;
	// 	this.setState({ isPasswordShown: !isPasswordShown });
	//   };
	handleChange = (key, val) => {
		this.setState({
			[key]: val,
		});
	};

	registerStrapiUser = (datauser) => {
		this.setState({})
		const {
			userName,
			email,
			password,
			first_name,
			lastName,
			MobileNumber
		} = datauser;
	}



	handleSubmit = (data, resetForm) => {

		//below code to get backend release number 
		const { sabackend } = this.state;
		//end of code block
		this.setState({ loading: true });
		const {
			companyName,
			currencyCode,
			countryCode,
			companyTypeCode,
			industryTypeCode,
			firstName,
			lastName,
			email,
			password,
			timeZone,
			countryId,
			stateId,
			IsDesignatedZone,
			IsRegistered,
			TaxRegistrationNumber,
			phoneNumber,
			vatRegistrationDate,
			companyAddress1,
			companyAddress2,
			domainName,
			companyURL,
			frontend,
			backend,
			status,
			createdAt,
			updatedAt,
			id,
			userName,
			provider,
			confirmed,
			blocked,
			nickname,
			activePlan


		} = data;

		let companyStrapiObj = {
			CompanyName: companyName,
			currency: currencyCode ? currencyCode : '',
			companyType: companyTypeCode,
			industryTypeCode: industryTypeCode,
			// countryCode: countryCode ? countryCode : '',
			country: "UAE",
			stateId: stateId.value,
			IsDesignatedZone: this.state.isDesignatedZone ? this.state.isDesignatedZone : false,
			IsRegisteredVat: IsRegistered ? IsRegistered : false,
			TaxRegistrationNumber: TaxRegistrationNumber,
			vatRegistrationDate: vatRegistrationDate,
			domainName: configData.API_ROOT_URL,
			companyURL: companyName,
			frontend: configData.FRONTEND_RELEASE,
			backend: sabackend,
			status: "nosub",
			createdAt: new Date(),
			updatedAt: new Date(),
			TimeZonePrefrence: "Asia/Dubai",
			Emirate: stateId.label,
			MobileNumber: phoneNumber,
			IsVatRegistered: IsRegistered ? IsRegistered : false,
			CompanyLocatedAt: "Dubai",
			Currency: "UAE Dirham - AED",
			CompanyAddressLine1: companyAddress1,
			CompanyAddressLine2: companyAddress2,
			// id: null,
			user: {
				id: '6',
				username: email,
				email: email,
				provider: "local",
				confirmed: true,
				blocked: false,
				nickname: null,
				firstname: firstName,
				lastname: lastName,
				createdAt: '2023-02-16T01:31:47.856Z',
				updatedAt: '2023-02-16T02:32:18.563Z'
			},
			activePlan: null,
			isPasswordShown: false,

		};
		let formData = new FormData();
		// for (var key in this.state.initValue) {
		// 	formData.append(key, data[key]);
		// }
		formData.append('companyName', companyName ? companyName : '')
		formData.append('currencyCode', currencyCode ? currencyCode : '')
		formData.append('firstName', firstName ? firstName : '')
		formData.append('lastName', lastName ? lastName : '')
		formData.append('email', email ? email : '')
		formData.append('timeZone', 'Asia/Dubai')
		// formData.append('countryCode',	countryCode ? countryCode.value : '');
		formData.append('countryId', countryId ? countryId : '229')
		formData.append('stateId', stateId ? stateId.value : '')
		formData.append('phoneNumber', phoneNumber ? phoneNumber : '')
		formData.append('IsDesignatedZone', this.state.isDesignatedZone ? this.state.isDesignatedZone : false);
		if (IsRegistered) {
			formData.append('IsRegisteredVat', IsRegistered);
		}
		if (TaxRegistrationNumber) {
			formData.append('TaxRegistrationNumber', TaxRegistrationNumber);
		}
		if (vatRegistrationDate) {
			formData.append('vatRegistrationDate', vatRegistrationDate);
		}
		formData.append('companyTypeCode', companyTypeCode ? companyTypeCode : '');
		formData.append('companyAddressLine1', companyAddress1 ? companyAddress1 : '')
		formData.append('companyAddressLine2', companyAddress2 ? companyAddress2 : '')
		formData.append('loginUrl', window.location.origin);
		formData.append('password', password)

		toast.success('Please wait till we setup your account', {
			position: toast.POSITION.TOP_RIGHT,
			autoClose: 40000,
		});

		{
			this.setState({
				loading: true,
				loadingMsg: "Registering Company,",
				NextloadingMsg: "Please wait till we setup your account"
			})
		}

		// this.props.authActions
		// 	.registerStrapy(obj)
		let strapiUserObj = {
			username: email,
			email: email,
			password: password,
			first_name: firstName,
			last_name: lastName,
			MobileNumber: phoneNumber
		};

		this.props.authActions
			.registerStrapiUser(strapiUserObj, companyStrapiObj)
		this.props.authActions
			.register(formData)
			.then((res) => {
				this.setState({ loading: true });

				this.setState({
					userDetail: true,
					userName: email,
					password: password,
				});
				toast.success('Password created successfully', {
					position: toast.POSITION.TOP_RIGHT,
				});
				// setTimeout(() => {
				// 	this.props.history.push('/login');
				// }, 3000);
				{ this.setState({ loading: false, }) }
			})
			.catch((err) => {
				this.setState({ loading: true });
				toast.error(
					err && err.data
						? 'Login Failed. Please Try Again'
						: 'Something Went Wrong',
					{
						position: toast.POSITION.TOP_RIGHT,
					},
				);
			});
	};

	togglePasswordVisiblity = () => {
		const { isPasswordShown } = this.state;
		this.setState({ isPasswordShown: !isPasswordShown });
	};

	render() {
		const { isPasswordShown, companyTypeList, checkphoneNumberParam } = this.state;
		const customStyles = {
			control: (base, state) => ({
				...base,
				flex: '1 1 auto',
				borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
				boxShadow: state.isFocused ? null : null,
				'&:hover': {
					borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
				},
			}),
		};

		const { initValue, currencyList, userDetail, country_list, timezone, loading, loadingMsg, NextloadingMsg } = this.state;
		const { universal_currency_list, state_list, company_type_list, version } = this.props;
		//console.log(company_type_list)


		return (
			loading == true ? <Loader loadingMsg={loadingMsg} NextloadingMsg={NextloadingMsg} /> :
				<div>
					<div className="log-in-screen">
						<ToastContainer
							autoClose={1700}
							closeOnClick
							draggable
						/>
						<div className="animated fadeIn">
							<div className="app flex-row ">
								<Container >
									{userDetail === false && (
										<Row className="justify-content-center">
											<Col lg={10} className="mx-auto">
												<CardGroup>

													<Card m className="p-4">
														{loading ? (
															<Row>
																<Col lg={12}>
																	<Loader />
																</Col>
															</Row>
														) : (
															<CardBody>

																<div className="logo-container">
																	<img
																		src={logo}
																		alt="logo"
																		style={{ width: '300px' }}
																	/>
																</div>

																<Formik
																	initialValues={initValue}
																	onSubmit={(values, { resetForm }) => {
																		this.handleSubmit(values, resetForm);
																	}}
																	validate={(values) => {
																		let errors = {};
																		if (!values.phoneNumber) {
																			errors.phoneNumber =
																				'Mobile number is required';
																		}

																		if (values.phoneNumber && checkphoneNumberParam == true) {
																			errors.phoneNumber =
																				'Invalid mobile number';
																		}
																		if (values.IsRegistered === true && !values.vatRegistrationDate) {
																			errors.vatRegistrationDate = "VAT registration date is required";
																		}
																		return errors;
																	}}

																	validationSchema={Yup.object().shape({
																		password: Yup.string()
																			.required("Password is required")
																			// .min(8, "Password Too Short")
																			.matches(
																				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
																				"Must contain minimum 8 characters, must contain maximum 255 characters, one uppercase, one lowercase, one number and one special case character"
																			),
																		confirmPassword: Yup.string()
																			.required('Confirm password is required')
																			.oneOf([Yup.ref("password"), null], "Passwords must match"),
																		companyName: Yup.string().required(
																			'Company name is required',
																		),
																		currencyCode: Yup.string().required(
																			'Currency is required',
																		),
																		companyTypeCode: Yup.string().required(
																			'Company / business type is required',
																		),
																		companyAddress1: Yup.string().required(
																			'Company address line 1 is required',
																		),
																		countryId: Yup.string().required(
																			'Country is required',
																		),
																		stateId: Yup.string().required(
																			'Emirate is required',
																		),
																		firstName: Yup.string().required(
																			'First name is required',
																		),
																		lastName: Yup.string().required(
																			'Last name is required',
																		),
																		email: Yup.string()
																			.required('Email is required')
																			.email('Invalid Email'),
																		timeZone: Yup.string().required(
																			'Time zone is required',
																		),
																		// phoneNumber: Yup.string().required(
																		// 	'Mobile number is required',
																		// ),
																		TaxRegistrationNumber: Yup.string().when(
																			'IsRegistered',
																			{
																				is: (value) => value === true,
																				then: Yup.string().required(
																					'Tax registration number is required',
																				)
																					.test(
																						'TaxRegistrationNumber',
																						'Invalid TRN',
																						(value) => {
																							if (value > 15) {
																								return true;
																							} else {
																								return false;
																							}
																						},
																					),
																				otherwise: Yup.string(),
																			},
																		),
																		vatRegistrationDate: Yup.string().when(
																			'IsRegistered',
																			{
																				is: (value) => value === true,
																				then: Yup.string().required(
																					'VAT registration date is required',
																				),
																				otherwise: Yup.string(),
																			},
																		)

																	})}
																>
																	{(props) => {

																		return (
																			<Form onSubmit={props.handleSubmit}>
																				{/* <h1>Log In</h1> */}
																				<div className="registerScreen">
																					<h2 className="">{strings.Register}</h2>
																					<p>Enter Your Details Below To Register</p>
																				</div>
																				<div>
																					<h4 className="">{strings.CompanyDetails}</h4>
																				</div>
																				<Row className="mt-2">
																					<Col lg={4}>
																						<FormGroup className="mb-3">

																							<Label htmlFor="select"><span className="text-danger">* </span>{strings.CompanyName}</Label>
																							<Input
																								type="text"
																								maxLength="100"
																								id="companyName"
																								name="companyName"
																								placeholder="Enter Company Name"
																								value={props.values.account_name}
																								onChange={(option) => {
																									props.handleChange('companyName')(
																										option,
																									);
																								}}
																								className={
																									props.errors.companyName &&
																										props.touched.companyName
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.companyName &&
																								props.touched.companyName && (
																									<div className="invalid-feedback">
																										{props.errors.companyName}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="currencyCode">
																								{strings.Currency}
																							</Label>
																							<Select
																								isDisabled
																								styles={customStyles}
																								id="currencyCode"
																								name="currencyCode"
																								// placeholder="Select Currency"
																								options={
																									universal_currency_list
																										? selectCurrencyFactory.renderOptions(
																											'currencyName',
																											'currencyCode',
																											universal_currency_list,
																											'Currency',
																										)
																										: []
																								}
																								value={
																									universal_currency_list &&
																									selectCurrencyFactory
																										.renderOptions(
																											'currencyName',
																											'currencyCode',
																											universal_currency_list,
																											'Currency',
																										)
																										.find(
																											(option) =>
																												option.value ===
																												+props.values.currencyCode,
																										)
																								}
																								onChange={(option) => {
																									if (option && option.value) {
																										props.handleChange(
																											'currencyCode',
																										)(option.value);
																									} else {
																										props.handleChange(
																											'currencyCode',
																										)('');
																									}
																								}}
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
																					<Col lg={4}>
																						<FormGroup>
																							<Label htmlFor="companyId">
																								<span className="text-danger">* </span>
																								{strings.CompanyBusinessType}
																							</Label>
																							<Select
																								options={
																									company_type_list
																										? selectOptionsFactory.renderOptions(
																											'label',
																											'value',
																											company_type_list,
																											'Company Type Code',
																										)
																										: []
																								}
																								value={
																									company_type_list &&
																									company_type_list.find(
																										(option) =>
																											option.value ===
																											+props.values
																												.companyTypeCode,
																									)
																								}
																								onChange={(option) => {
																									if (option && option.value) {
																										props.handleChange(
																											'companyTypeCode',
																										)(option.value);
																									} else {
																										props.handleChange(
																											'companyTypeCode',
																										)('');
																									}
																								}}
																								placeholder={strings.Select + strings.CompanyBusinessType}
																								id="companyTypeCode"
																								name="companyTypeCode"
																								className={
																									props.errors.companyTypeCode &&
																										props.touched.companyTypeCode
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.companyTypeCode &&
																								props.touched.companyTypeCode && (
																									<div className="invalid-feedback">
																										{props.errors.companyTypeCode}
																									</div>
																								)}
																						</FormGroup>
																					</Col>

																				</Row>
																				<Row className="row-wrapper">
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="select"><span className="text-danger">* </span>{strings.CompanyAddressLine1}</Label>
																							<Input
																								type="text"
																								maxLength="250"
																								id="companyAddress1"
																								name="companyAddress1"
																								placeholder="Enter Company Address"
																								value={props.values.account_name}
																								onChange={(option) => {
																									props.handleChange('companyAddress1')(
																										option,
																									);
																								}}
																								className={
																									props.errors.companyAddress1 &&
																										props.touched.companyAddress1
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.companyAddress1 &&
																								props.touched.companyAddress1 && (
																									<div className="invalid-feedback">
																										{props.errors.companyAddress1}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="companyAddress2">{strings.CompanyAddressLine2}</Label>
																							<Input
																								type="text"
																								maxLength="250"
																								id="companyAddress2"
																								name="companyAddress2"
																								placeholder="Enter Company Address"
																								value={props.values.account_name}
																								onChange={(option) => {
																									props.handleChange('companyAddress2')(
																										option,
																									);
																								}}
																								className={
																									props.errors.CompanyAddressLine2 &&
																										props.touched.CompanyAddressLine2
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.companyAddress2 &&
																								props.touched.companyAddress2 && (
																									<div className="invalid-feedback">
																										{props.errors.CompanyAddressLine2}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="timeZone">
																								{strings.TimeZonePreference}
																							</Label>
																							<Select
																								isDisabled
																								styles={customStyles}
																								id="timeZone"
																								name="timeZone"
																								options={timezone ? timezone : []}
																								value={props.values.timeZone}
																								onChange={(option) => {
																									if (option && option.value) {
																										props.handleChange('timeZone')(
																											option.value,
																										);
																									} else {
																										props.handleChange('timeZone')(
																											'',
																										);
																									}
																								}}
																								className={
																									props.errors.timeZone &&
																										props.touched.timeZone
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.timeZone &&
																								props.touched.timeZone && (
																									<div className="invalid-feedback">
																										{props.errors.timeZone}
																									</div>
																								)}
																						</FormGroup>
																					</Col>

																				</Row>
																				<Row className="row-wrapper">
																					<Col lg={4}>
																						<FormGroup>
																							<Label htmlFor="countryId">{strings.Country}</Label>
																							<Select
																								isDisabled
																								styles={customStyles}
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
																								// value={props.values.countryId}
																								value={
																									country_list &&
																									selectOptionsFactory.renderOptions(
																										'countryName',
																										'countryCode',
																										country_list,
																										'Country',
																									)
																										.find(
																											(option) =>
																												option.value ===
																												+props.values.countryId,
																										)
																								}
																								onChange={(option) => {
																									if (option && option.value) {
																										props.handleChange('countryId')(option);
																										this.getStateList(option.value);
																									} else {
																										props.handleChange('countryId')('');
																										this.getStateList('');
																									}
																									props.handleChange('stateId')({
																										label: 'Select State',
																										value: '',
																									});
																								}}
																								// placeholder={strings.Select+strings.Country}
																								id="countryId"
																								name="countryId"
																								className={
																									props.errors.countryId &&
																										props.touched.countryId
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
																					<Col lg={4}>
																						<FormGroup>
																							<Label htmlFor="select"><span className="text-danger">* </span>{strings.Emirate}</Label>
																							<Select
																								// styles={customStyles}
																								options={
																									state_list
																										? selectOptionsFactory.renderOptions(
																											'label',
																											'value',
																											state_list,
																											'Emirate',
																										)
																										: []
																								}
																								// value={props.values.stateId}
																								value={
																									state_list &&
																									state_list.find(
																										(option) =>
																											option.value ===
																											+props.values
																												.stateId,
																									)
																								}
																								onChange={(option) => {
																									if (option && option.value) {
																										props.handleChange('stateId')(option);
																									} else {
																										props.handleChange('stateId')('');
																									}
																								}}
																								// placeholder={strings.Select+strings.StateRegion}
																								id="stateId"
																								name="stateId"
																								placeholder="Select Emirate"
																								className={
																									props.errors.stateId &&
																										props.touched.stateId
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.stateId &&
																								props.touched.stateId && (
																									<div className="invalid-feedback">
																										{props.errors.stateId}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3 ">
																							<Label htmlFor="phoneNumber">
																								<span className="text-danger">* </span> {strings.MobileNumber}
																							</Label>
																							<div className={
																								props.errors.phoneNumber &&
																									props.touched.phoneNumber
																									? ' is-invalidMobile '
																									: ''
																							}>
																								<PhoneInput
																									country={"ae"}
																									enableSearch={true}
																									international
																									// style={{width:"260px "}}
																									value={props.values.phoneNumber}
																									placeholder={strings.Enter + strings.MobileNumber}
																									onChange={(option) => {
																										props.handleChange('phoneNumber',)(option);
																										option.length !== 12 ? this.setState({ checkphoneNumberParam: true }) : this.setState({ checkphoneNumberParam: false });
																									}}
																									isValid
																								// className={
																								// 	props.errors.phoneNumber &&
																								// 		props.touched.phoneNumber
																								// 		? ' invalid-feedback is-invalid is-invalidMobile '
																								// 		: ''
																								// }
																								/></div>
																							{props.errors.phoneNumber &&
																								props.touched.phoneNumber && (
																									<div className="invalid-feedback">
																										{props.errors.phoneNumber}
																									</div>
																								)}
																						</FormGroup>
																					</Col>

																				</Row>
																				{/* style={{display:props.values.countryId.value === 229 ? '' : 'none'}} */}
																				<Row >
																					<Col lg={5} >
																						{/* <FormGroup check inline className="mt-1">
																		<Label
																			className="form-check-label mt-3"
																			check
																			htmlFor="Zone"
																		>
																			<Input
																				type="checkbox"
																				id="IsDesignatedZone"
																				name="IsDesignatedZone"
																				checked={props.values.IsDesignatedZone}
																				onChange={(value) => {
																					if(value != null){
																					props.handleChange('IsDesignatedZone')(
																						value,
																					);
																					}else{
																						props.handleChange('IsDesignatedZone')(
																							'',
																						);
																					}
																				}}
																				className={
																					props.errors.IsDesignatedZone &&
																					props.touched.IsDesignatedZone
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			Company located in Designated Zone?
																			{props.errors.IsDesignatedZone &&
																				props.touched.IsDesignatedZone && (
																					<div className="invalid-feedback">
																						{props.errors.IsDesignatedZone}
																					</div>
																				)}
																		</Label>
																	</FormGroup> */}
																						<Row>
																							<Col xs={12}>
																								<Label>Where Is The Company Located?</Label>
																							</Col>
																							<Col>
																								<FormGroup className="mb-3">
																									<FormGroup check inline>
																										<div className="custom-radio custom-control">
																											<input
																												className="custom-control-input"
																												type="radio"
																												id="inline-radio1"
																												name="active"
																												checked={!this.state.isDesignatedZone}
																												value={true}
																												onChange={(value) => {
																													this.setState({ isDesignatedZone: !this.state.isDesignatedZone })
																												}}
																											/>
																											<label
																												className="custom-control-label"
																												htmlFor="inline-radio1"
																											>
																												{strings.Mainland}
																											</label>
																										</div>
																									</FormGroup>
																									<FormGroup check inline>
																										<div className="custom-radio custom-control">
																											<input
																												className="custom-control-input"
																												type="radio"
																												id="inline-radio2"
																												name="active"
																												value={false}
																												checked={this.state.isDesignatedZone}
																												onChange={(value) => {
																													this.setState({ isDesignatedZone: !this.state.isDesignatedZone })
																												}}
																											/>
																											<label
																												className="custom-control-label"
																												htmlFor="inline-radio2"
																											>
																												{strings.Freezone}
																											</label>
																										</div>
																									</FormGroup>

																								</FormGroup>
																							</Col>
																						</Row>

																					</Col>
																				</Row>
																				{/* style={{display:props.values.countryId.value === 229 ? '' : 'none'}}  */}
																				<Row className="mb-4" >
																					<Col lg={5}>
																						<FormGroup check inline className="mt-1">
																							<Label
																								className="form-check-label mt-3"
																								check
																								htmlFor="vat"
																							>
																								<Input
																									type="checkbox"
																									id="IsRegistered"
																									name="IsRegistered"
																									checked={props.values.IsRegistered}
																									value={true}
																									onChange={(value) => {
																										if (value != null) {
																											props.handleChange('IsRegistered')(
																												value,
																											);
																										} else {
																											props.handleChange('IsRegistered')(
																												'',
																											);
																										}

																									}}
																									className={
																										props.errors.IsRegistered &&
																											props.touched.IsRegistered
																											? 'is-invalid'
																											: ''
																									}
																								/>
																								Is VAT Registered?
																								{props.errors.IsRegistered &&
																									props.touched.IsRegistered && (
																										<div className="invalid-feedback">
																											{props.errors.IsRegistered}
																										</div>
																									)}
																							</Label>
																						</FormGroup>
																					</Col>
																				</Row>
																				<Row className="row-wrapper" style={{ display: props.values.IsRegistered === true ? '' : 'none' }}>
																					<Col lg={4}>
																						<FormGroup >
																							<Label htmlFor="TaxRegistrationNumber"><span className="text-danger">* </span>
																								{strings.TaxRegistrationNumber}
																								<div className="tooltip-icon nav-icon fas fa-question-circle ml-1">
																									<span className="tooltiptext">Please note that the TRN cannot be updated <br></br>once a document has been created.</span></div>
																							</Label>
																							<Input
																								type="text"
																								minLength="15"
																								maxLength="15"
																								placeholder="Enter Tax Registration Number"
																								id="TaxRegistrationNumber"
																								name="TaxRegistrationNumber"
																								// placeholder={strings.Enter+strings.TaxRegistrationNumber}
																								onChange={(option) => {
																									if (
																										option.target.value === '' ||
																										this.regEx.test(option.target.value)
																									) {
																										props.handleChange(
																											'TaxRegistrationNumber',
																										)(option);
																									}
																								}}
																								value={props.values.TaxRegistrationNumber}
																								className={
																									props.errors.TaxRegistrationNumber &&
																										props.touched.TaxRegistrationNumber
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.TaxRegistrationNumber &&
																								props.touched.TaxRegistrationNumber && (
																									<div className="invalid-feedback">
																										{props.errors.TaxRegistrationNumber}
																									</div>
																								)}
																							<div className="VerifyTRN">
																								<br />
																								<b>	<a target="_blank" rel="noopener noreferrer" href="https://tax.gov.ae/en/default.aspx" style={{ color: '#2266d8' }}  >{strings.VerifyTRN}</a></b>
																							</div>
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup>
																							<Label htmlFor="date"><span className="text-danger">* </span>
																								VAT Registered On
																								<div className="tooltip-icon nav-icon fas fa-question-circle ml-1">
																									<span className="tooltiptext">Please note that you cannot update <br></br> this detail once you have created a document.</span></div>
																							</Label>
																							<DatePicker
																								autoComplete="off"
																								id="vatRegistrationDate"
																								minDate={new Date("01/01/2018")}
																								name="vatRegistrationDate"
																								placeholderText="Select VAT Registered Date"
																								maxDate={new Date()}
																								showMonthDropdown
																								showYearDropdown
																								dateFormat="dd-MM-yyyy"
																								dropdownMode="select"
																								value={props.values.vatRegistrationDate}
																								selected={props.values.vatRegistrationDate}
																								onBlur={props.handleBlur('vatRegistrationDate')}
																								onChange={(value) => {
																									props.handleChange('vatRegistrationDate')(
																										value,
																									);
																								}}
																								className={`form-control ${props.errors.vatRegistrationDate &&
																										props.touched.vatRegistrationDate
																										? 'is-invalid'
																										: ''
																									}`}
																							/>
																							{props.errors.vatRegistrationDate &&
																								props.touched.vatRegistrationDate && (
																									<div className="invalid-feedback">
																										{props.errors.vatRegistrationDate}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																				</Row>
																				<hr />
																				<div>
																					<h4>Super Admin</h4>
																				</div>

																				<Row>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="firstName">
																								<span className="text-danger">* </span>{strings.FirstName}</Label>
																							<Input
																								type="text"
																								maxLength="100"
																								id="firstName"
																								name="firstName"
																								placeholder="Enter First Name"
																								value={props.values.firstName}
																								onChange={(option) => {
																									if (
																										option.target.value === '' ||
																										this.regExAlpha.test(
																											option.target.value,
																										)
																									) {

																										let option1 = upperFirst(option.target.value)
																										props.handleChange('firstName')(option1);
																									}
																								}}
																								// onChange={(option) => {
																								// 	props.handleChange('firstName')(
																								// 		option,
																								// 	);
																								// }}
																								className={
																									props.errors.firstName &&
																										props.touched.firstName
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.firstName &&
																								props.touched.firstName && (
																									<div className="invalid-feedback">
																										{props.errors.firstName}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="lastName">
																								<span className="text-danger">* </span>{strings.LastName}</Label>
																							<Input
																								type="text"
																								maxLength="100"
																								id="lastName"
																								name="lastName"
																								placeholder="Enter Last Name"
																								value={props.values.lastName}
																								onChange={(option) => {
																									if (
																										option.target.value === '' ||
																										this.regExAlpha.test(
																											option.target.value,
																										)
																									) {

																										let option1 = upperFirst(option.target.value)
																										props.handleChange('lastName')(option1);
																									}
																								}}
																								// onChange={(option) => {
																								// 	props.handleChange('lastName')(
																								// 		option,
																								// 	);
																								// }}
																								className={
																									props.errors.lastName &&
																										props.touched.lastName
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.lastName &&
																								props.touched.lastName && (
																									<div className="invalid-feedback">
																										{props.errors.lastName}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3">
																							<Label htmlFor="email">
																								<span className="text-danger">* </span>{strings.EmailAddress}</Label>
																							<Input
																								type="email"
																								maxLength="80"
																								id="email"
																								name="email"
																								placeholder="Enter Email Address"
																								value={props.values.email}
																								onChange={(option) => {
																									props.handleChange('email')(option);
																								}}
																								className={
																									props.errors.email &&
																										props.touched.email
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.email &&
																								props.touched.email && (
																									<div className="invalid-feedback">
																										{props.errors.email}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																				</Row>
																				<Row>
																					<Col lg={6}>
																						<FormGroup>
																							<Label htmlFor="select">
																								<span className="text-danger">* </span>
																								Password
																							</Label>
																							<div>
																								<Input
																									onPaste={(e) => {
																										e.preventDefault()
																										return false;
																									}} onCopy={(e) => {
																										e.preventDefault()
																										return false;
																									}}
																									type={
																										this.state.isPasswordShown
																											? 'text'
																											: 'password'
																									}
																									autoComplete="off"
																									id="password"
																									name="password"
																									placeholder=" Enter Password"
																									value={props.values.password}
																									onChange={(option) => {
																										if (option.target.value != "") {
																											props.handleChange('password')(
																												option,
																											);
																											this.setState({ displayRules: true })
																										}
																										else {
																											props.handleChange('password')(
																												option,
																											);
																											this.setState({ displayRules: false })
																										}
																									}}
																									className={
																										props.errors.password &&
																											props.touched.password
																											? 'is-invalid'
																											: ''
																									}
																								/>
																								<i className={`fa ${isPasswordShown ? "fa-eye" : "fa-eye-slash"} password-icon fa-lg`}
																									onClick={this.togglePasswordVisiblity}
																								>
																								</i>
																							</div>
																							{props.errors.password &&
																								props.touched.password && (
																									<div className="invalid-feedback">
																										{props.errors.password}
																									</div>
																								)}
																							{this.state.displayRules == true && (<PasswordChecklist
																								rules={["maxLength", "minLength", "specialChar", "number", "capital"]}
																								minLength={8}
																								maxLength={255}
																								value={props.values.password}
																								valueAgain={props.values.confirmPassword}
																							/>)}
																						</FormGroup>
																					</Col>
																					<Col lg={6}>
																						<FormGroup>
																							<Label htmlFor="select">
																								<span className="text-danger">* </span>
																								Confirm Password
																							</Label>
																							<Input
																								onPaste={(e) => {
																									e.preventDefault()
																									return false;
																								}} onCopy={(e) => {
																									e.preventDefault()
																									return false;
																								}}
																								// autoComplete="off"
																								type="password"
																								id="confirmPassword"
																								name="confirmPassword"
																								value={props.values.confirmPassword}
																								placeholder="Confirm Password"
																								onChange={(value) => {
																									props.handleChange('confirmPassword')(
																										value,
																									);
																								}}
																								className={
																									props.errors.confirmPassword &&
																										props.touched.confirmPassword
																										? 'is-invalid'
																										: ''
																								}
																							/>
																							{props.errors.confirmPassword &&
																								props.touched.confirmPassword && (
																									<div className="invalid-feedback">
																										{props.errors.confirmPassword}
																									</div>
																								)}
																							{this.state.displayRules == true && (<PasswordChecklist
																								rules={["match"]}
																								minLength={8}
																								value={props.values.password}
																								valueAgain={props.values.confirmPassword}
																							/>)}
																						</FormGroup>
																					</Col>
																				</Row>
																				<>Note:<b> Super Admin</b> Details Cannot Be Altered After Registration</>
																				<Row>
																					<Col className="text-center">
																						<Button
																							type="submit"
																							name="submit"
																							color="primary"
																							disabled={this.state.loading}

																							className="btn-square mr-3 mt-3 "
																							style={{ width: '200px' }}
																						>
																							<i className="fa fa-dot-circle-o"></i>{' '}
																							{this.state.loading
																								? 'Creating...'
																								: 'Register'}
																						</Button>
																					</Col>
																				</Row>
																				<label><a href="https://www.simpleaccounts.io/privacy-policy/" target="_blank">Privacy Policy</a></label>
																			</Form>
																		);
																	}}
																</Formik>

															</CardBody>
														)}

													</Card>

												</CardGroup>
											</Col>
										</Row>
									)}
									{userDetail === true &&
										this.props.history.push('/login')}
								</Container>
							</div>
						</div>
					</div>
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
