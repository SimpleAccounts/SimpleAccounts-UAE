import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { AuthActions, CommonActions } from 'services/global';
import { ToastContainer, toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from "react-phone-input-2";
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { upperFirst } from 'lodash-es';
import PasswordChecklist from "react-password-checklist";
import configData from '../../constants/config';
import { withNavigation } from 'utils/withNavigation';

let strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
	strings.setLanguage('en');
} else {
	strings.setLanguage(localStorage.getItem('language'));
}

// Regular expressions
const regEx = /^[0-9]+$/; // Fixed: removed redundant \d (0-9 already covers digits)
const regExAlpha = /^[a-zA-Z ]+$/;

// Zod validation schema with conditional VAT validation
const registerSchema = z
	.object({
		companyName: z.string().min(1, 'Company name is required'),
		currencyCode: z.union([z.string(), z.number()]).refine((val) => {
			const numVal = typeof val === 'string' ? parseInt(val, 10) : val;
			return numVal !== undefined && numVal !== null && !isNaN(numVal);
		}, 'Currency is required'),
		companyTypeCode: z.string().min(1, 'Company / business type is required'),
		companyAddress1: z.string().min(1, 'Company address line 1 is required'),
		companyAddress2: z.string().optional(),
		countryId: z.union([z.string(), z.number(), z.object({ value: z.union([z.string(), z.number()]) })]).refine((val) => {
			if (typeof val === 'object' && val !== null && 'value' in val) {
				return val.value !== undefined && val.value !== null && val.value !== '';
			}
			return val !== undefined && val !== null && val !== '';
		}, 'Country is required'),
		stateId: z.union([
			z.string(),
			z.number(),
			z.object({ value: z.union([z.string(), z.number()]), label: z.string().optional() })
		]).refine((val) => {
			if (!val) return false;
			if (typeof val === 'object' && val !== null) {
				return val.value !== undefined && val.value !== null && val.value !== '';
			}
			return val !== '';
		}, 'Emirate is required'),
		phoneNumber: z.string().min(1, 'Mobile number is required'),
		timeZone: z.string().min(1, 'Time zone is required'),
		firstName: z.string().min(1, 'First name is required'),
		lastName: z.string().min(1, 'Last name is required'),
		email: z.string().min(1, 'Email is required').email('Invalid Email'),
		password: z
			.string()
			.min(1, 'Password is required')
			.regex(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
				'Must contain minimum 8 characters, must contain maximum 255 characters, one uppercase, one lowercase, one number and one special case character'
			),
		confirmPassword: z.string().min(1, 'Confirm password is required'),
		IsDesignatedZone: z.boolean().default(false),
		IsRegistered: z.boolean().default(false),
		TaxRegistrationNumber: z.string().optional(),
		vatRegistrationDate: z.union([z.date(), z.string(), z.null()]).optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords must match",
		path: ['confirmPassword'],
	})
	.refine(
		(data) => {
			// VAT fields required when IsRegistered is true
			if (data.IsRegistered === true) {
				if (!data.TaxRegistrationNumber) {
					return false;
				}
			}
			return true;
		},
		{
			message: 'Tax registration number is required',
			path: ['TaxRegistrationNumber'],
		}
	)
	.refine(
		(data) => {
			// TRN must be 15 digits when IsRegistered is true
			if (data.IsRegistered === true && data.TaxRegistrationNumber) {
				if (data.TaxRegistrationNumber.length < 15) {
					return false;
				}
			}
			return true;
		},
		{
			message: 'Invalid TRN',
			path: ['TaxRegistrationNumber'],
		}
	)
	.refine(
		(data) => {
			// VAT registration date required when IsRegistered is true
			if (data.IsRegistered === true && !data.vatRegistrationDate) {
				return false;
			}
			return true;
		},
		{
			message: 'VAT registration date is required',
			path: ['vatRegistrationDate'],
		}
	);

const mapStateToProps = (state) => {
	return {
		country_list: state.common.country_list,
		state_list: state.common.state_list,
		version: state.common.version,
		universal_currency_list: state.common.universal_currency_list,
		company_type_list: state.common.company_type_list,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

const Register = ({
	authActions,
	commonActions,
	history,
	country_list,
	state_list,
	universal_currency_list,
	company_type_list,
}) => {
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const [loading, setLoading] = useState(false);
	const [userDetail, setUserDetail] = useState(false);
	const [checkphoneNumberParam, setCheckphoneNumberParam] = useState(false);
	const [loadingMsg, setLoadingMsg] = useState('Loading...');
	const [NextloadingMsg, setNextloadingMsg] = useState('');
	const [isDesignatedZone, setIsDesignatedZone] = useState(false);
	const [timezone, setTimezone] = useState([]);
	const [sabackend, setSabackend] = useState('');
	const [displayRules, setDisplayRules] = useState(false);

	const form = useForm({
		resolver: zodResolver(registerSchema),
		mode: 'onBlur', // Validate on blur for better UX
		defaultValues: {
			companyName: '',
			currencyCode: 150,
			companyTypeCode: '',
			industryTypeCode: '',
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
			timeZone: 'Asia/Dubai',
			countryId: 229,
			stateId: '',
			IsDesignatedZone: false,
			IsRegistered: false,
			TaxRegistrationNumber: '',
			vatRegistrationDate: null,
			companyAddress1: '',
			companyAddress2: '',
			phoneNumber: '',
		},
	});

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

	useEffect(() => {
		getInitialData();
		getBackendRelease();
	}, []);

	const getBackendRelease = () => {
		return new Promise((resolve, reject) => {
			authActions
				.getSimpleAccountsreleasenumber()
				.then((backendVersion) => {
					const backendRelease = backendVersion.simpleAccountsRelease;
					setSabackend(backendRelease);
					resolve(backendRelease);
				})
				.catch((error) => {
					reject(error);
				});
		});
	};

	const getStateList = (countryCode) => {
		commonActions.getStateList(229);
	};

	const getInitialData = () => {
		authActions.getTimeZoneList().then((response) => {
			if (response && response.data && Array.isArray(response.data)) {
				let output = response.data.map(function (value) {
					return { label: value, value: value };
				});
				setTimezone(output);
			}
		}).catch((err) => {
			setTimezone([]);
		});

		commonActions.getStateList().catch(() => {
			// Silently handle errors
		});
		commonActions.getCompanyTypeListRegister().catch(() => {
			// Silently handle errors
		});

		authActions.getCurrencyList().catch(() => {
			// Silently handle errors
		});
	};

	const togglePasswordVisiblity = () => {
		setIsPasswordShown(!isPasswordShown);
	};

	const handleSubmit = async (data) => {
		// Removed password from console.log for security - only log non-sensitive fields
		const { password: userPassword, confirmPassword, ...safeData } = data;
		console.log('handleSubmit called - registration started for:', {
			companyName: safeData.companyName,
			email: safeData.email,
			firstName: safeData.firstName,
			lastName: safeData.lastName
		});

		// Note: Email duplicate check will be handled by backend response
		// Backend returns "Company Already Exist" if email/company exists

		setLoading(true);
		setLoadingMsg('Registering Company,');
		setNextloadingMsg('Please wait till we setup your account');

		const {
			companyName,
			currencyCode,
			companyTypeCode,
			industryTypeCode,
			firstName,
			lastName,
			email,
			password: formPassword,
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
		} = data;

		// Handle countryId - can be object or number/string
		let countryIdValue = '';
		if (countryId) {
			if (typeof countryId === 'object' && countryId.value !== undefined) {
				countryIdValue = countryId.value;
			} else if (typeof countryId === 'string' || typeof countryId === 'number') {
				countryIdValue = countryId;
			}
		}

		// Handle stateId - can be object (from Select) or string/number
		let stateIdValue = '';
		let stateIdLabel = '';
		if (stateId) {
			if (typeof stateId === 'object' && stateId.value !== undefined) {
				stateIdValue = stateId.value;
				stateIdLabel = stateId.label || '';
			} else if (typeof stateId === 'string' || typeof stateId === 'number') {
				stateIdValue = stateId;
			}
		}

		let companyStrapiObj = {
			CompanyName: companyName,
			currency: currencyCode ? currencyCode : '',
			companyType: companyTypeCode,
			industryTypeCode: industryTypeCode,
			country: "UAE",
			stateId: stateIdValue,
			IsDesignatedZone: isDesignatedZone ? isDesignatedZone : false,
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
			Emirate: stateIdLabel,
			MobileNumber: phoneNumber,
			IsVatRegistered: IsRegistered ? IsRegistered : false,
			CompanyLocatedAt: "Dubai",
			Currency: "UAE Dirham - AED",
			CompanyAddressLine1: companyAddress1,
			CompanyAddressLine2: companyAddress2 || '',
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
		formData.append('companyName', companyName ? companyName : '');
		formData.append('currencyCode', currencyCode ? currencyCode : '');
		formData.append('firstName', firstName ? firstName : '');
		formData.append('lastName', lastName ? lastName : '');
		formData.append('email', email ? email : '');
		formData.append('timeZone', 'Asia/Dubai');
		formData.append('countryId', countryIdValue ? countryIdValue : '229');
		formData.append('stateId', stateIdValue);
		formData.append('phoneNumber', phoneNumber ? phoneNumber : '');
		formData.append('IsDesignatedZone', isDesignatedZone ? isDesignatedZone : false);
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
		formData.append('companyAddressLine1', companyAddress1 ? companyAddress1 : '');
		formData.append('companyAddressLine2', companyAddress2 ? companyAddress2 : '');
		formData.append('loginUrl', window.location.origin);
		formData.append('password', formPassword);

		toast.success('Please wait till we setup your account', {
			position: 'top-right',
			autoClose: 40000,
		});

		let strapiUserObj = {
			username: email,
			email: email,
			password: formPassword,
			first_name: firstName,
			last_name: lastName,
			MobileNumber: phoneNumber
		};

		authActions
			.registerStrapiUser(strapiUserObj, companyStrapiObj)
			.catch((strapiErr) => {
				console.warn('Strapi registration failed (non-critical):', strapiErr);
			});

		authActions
			.register(formData)
			.then((action) => {
				console.log('Registration action:', action);
				if (action && action.type && action.type.includes('fulfilled')) {
					setLoading(false);
					setUserDetail(true);
					toast.success('Password created successfully', {
						position: 'top-right',
					});
					setTimeout(() => {
						history.push('/login');
					}, 2000);
				} else {
					setLoading(false);
					const errorMessage = action?.payload?.message || action?.payload || 'Registration failed';
					toast.error(errorMessage, {
						position: 'top-right',
					});
				}
			})
			.catch((action) => {
				console.error('Registration error action:', action);
				setLoading(false);
				let errorMessage = 'Registration Failed. Please Try Again';
				if (action?.payload) {
					if (typeof action.payload === 'string') {
						errorMessage = action.payload;
					} else if (action.payload.message) {
						errorMessage = action.payload.message;
					} else if (action.payload.error) {
						errorMessage = action.payload.error;
					}
				} else if (action?.error?.message) {
					errorMessage = action.error.message;
				}
				console.error('Registration failed with error:', errorMessage);
				toast.error(errorMessage, {
					position: 'top-right',
					autoClose: 5000,
				});
			});
	};

	// Handle phone number validation
	const handlePhoneChange = (value, country, e, formattedValue, isValid) => {
		form.setValue('phoneNumber', value);
		// PhoneInput provides isValid parameter - use it for validation
		// For UAE (+971), valid numbers should be 9 digits after country code
		// PhoneInput stores numbers as: 971XXXXXXXXX (12 digits total for UAE)
		if (value && value.length > 0) {
			// Remove country code to check local number length
			const localNumber = value.startsWith('971') ? value.substring(3) : value;
			// UAE local numbers should be exactly 9 digits
			if (localNumber.length === 9 && /^[0-9]+$/.test(localNumber)) {
				// Valid UAE number
				setCheckphoneNumberParam(false);
			} else if (value.length === 12 && value.startsWith('971') && /^[0-9]+$/.test(value)) {
				// Full number with country code (971XXXXXXXXX = 12 digits) - also valid
				setCheckphoneNumberParam(false);
			} else if (value.length < 9) {
				// Number too short - only show error if user has typed something
				setCheckphoneNumberParam(value.length > 0);
			} else {
				// Number format might be invalid - clear error and let PhoneInput handle it
				setCheckphoneNumberParam(false);
			}
		} else {
			// Empty value - no error
			setCheckphoneNumberParam(false);
		}
	};

	// Handle country change - reset stateId
	const handleCountryChange = (option) => {
		if (option && option.value) {
			form.setValue('countryId', option.value);
			getStateList(option.value);
			form.setValue('stateId', { label: 'Select State', value: '' });
		} else {
			form.setValue('countryId', '');
			getStateList('');
			form.setValue('stateId', { label: 'Select State', value: '' });
		}
	};

	// Handle state change
	const handleStateChange = (option) => {
		if (option && option.value) {
			form.setValue('stateId', option);
		} else {
			form.setValue('stateId', '');
		}
	};

	// Handle VAT registration checkbox change
	const handleIsRegisteredChange = (e) => {
		const checked = e.target.checked;
		form.setValue('IsRegistered', checked);
		if (!checked) {
			form.setValue('TaxRegistrationNumber', '');
			form.setValue('vatRegistrationDate', null);
		}
	};

	// Handle password change - show/hide password rules
	const handlePasswordChange = (e) => {
		const value = e.target.value;
		form.setValue('password', value);
		if (value !== "") {
			setDisplayRules(true);
		} else {
			setDisplayRules(false);
		}
	};

	// Note: handleNameChange was removed as it's not used - name fields are handled directly via Controller

	// Handle TRN change with numeric validation
	const handleTRNChange = (e) => {
		const value = e.target.value;
		if (value === '' || regEx.test(value)) {
			form.setValue('TaxRegistrationNumber', value);
		}
	};

	if (loading === true) {
		return <Loader loadingMsg={loadingMsg} NextloadingMsg={NextloadingMsg} />;
	}

	return (
		<div>
			<div className="log-in-screen">
				<ToastContainer
					autoClose={1700}
					closeOnClick
					draggable
				/>
				<div className="animated fadeIn">
					<div className="app flex-row ">
						<Container>
							{userDetail === false && (
								<Row className="justify-content-center">
									<Col lg={10} className="mx-auto">
										<CardGroup>
											<Card className="p-4">
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

														<Form onSubmit={form.handleSubmit(handleSubmit)}>
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
																		<Label htmlFor="companyName">
																			<span className="text-danger">* </span>{strings.CompanyName}
																		</Label>
																		<Controller
																			name="companyName"
																			control={form.control}
																			render={({ field, fieldState }) => (
																				<Input
																					type="text"
																					maxLength="100"
																					id="companyName"
																					name="companyName"
																					placeholder="Enter Company Name"
																					{...field}
																					invalid={!!fieldState.error}
																				/>
																			)}
																		/>
																		{form.formState.errors.companyName && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.companyName.message}
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
																							+form.watch('currencyCode'),
																					)
																			}
																			onChange={(option) => {
																				if (option && option.value) {
																					form.setValue('currencyCode', option.value);
																				} else {
																					form.setValue('currencyCode', '');
																				}
																			}}
																			className={
																				form.formState.errors.currencyCode
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{form.formState.errors.currencyCode && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.currencyCode.message}
																			</div>
																		)}
																	</FormGroup>
																</Col>
																<Col lg={4}>
																	<FormGroup>
																		<Label htmlFor="companyTypeCode">
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
																					(option) => {
																						const watchedValue = form.watch('companyTypeCode');
																						return option.value === +watchedValue || String(option.value) === String(watchedValue);
																					}
																				)
																			}
																			onChange={(option) => {
																				if (option && option.value) {
																					form.setValue('companyTypeCode', String(option.value), { shouldValidate: true, shouldTouch: true });
																				} else {
																					form.setValue('companyTypeCode', '', { shouldValidate: true, shouldTouch: true });
																				}
																			}}
																			onBlur={() => form.trigger('companyTypeCode')}
																			placeholder={strings.Select + strings.CompanyBusinessType}
																			id="companyTypeCode"
																			name="companyTypeCode"
																			className={
																				form.formState.errors.companyTypeCode
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{form.formState.errors.companyTypeCode && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.companyTypeCode.message}
																			</div>
																		)}
																	</FormGroup>
																</Col>
															</Row>
															<Row className="row-wrapper">
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="companyAddress1">
																			<span className="text-danger">* </span>{strings.CompanyAddressLine1}
																		</Label>
																		<Controller
																			name="companyAddress1"
																			control={form.control}
																			render={({ field, fieldState }) => (
																				<Input
																					type="text"
																					maxLength="250"
																					id="companyAddress1"
																					name="companyAddress1"
																					placeholder="Enter Company Address"
																					{...field}
																					invalid={!!fieldState.error}
																				/>
																			)}
																		/>
																		{form.formState.errors.companyAddress1 && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.companyAddress1.message}
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
																			{...form.register('companyAddress2')}
																			invalid={!!form.formState.errors.companyAddress2}
																		/>
																		{form.formState.errors.companyAddress2 && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.companyAddress2.message}
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
																			value={
																				timezone && form.watch('timeZone')
																					? timezone.find(
																						(option) =>
																							option.value === form.watch('timeZone'),
																					)
																					: null
																			}
																			onChange={(option) => {
																				if (option && option.value) {
																					form.setValue('timeZone', option.value);
																				} else {
																					form.setValue('timeZone', '');
																				}
																			}}
																			className={
																				form.formState.errors.timeZone
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{form.formState.errors.timeZone && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.timeZone.message}
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
																							+form.watch('countryId'),
																					)
																			}
																			onChange={handleCountryChange}
																			id="countryId"
																			name="countryId"
																			className={
																				form.formState.errors.countryId
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{form.formState.errors.countryId && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.countryId.message}
																			</div>
																		)}
																	</FormGroup>
																</Col>
																<Col lg={4}>
																	<FormGroup>
																		<Label htmlFor="stateId">
																			<span className="text-danger">* </span>{strings.Emirate}
																		</Label>
																		<Select
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
																			value={
																				state_list &&
																				state_list.find(
																					(option) => {
																						const stateIdValue = form.watch('stateId');
																						if (typeof stateIdValue === 'object' && stateIdValue !== null) {
																							return option.value === +stateIdValue.value;
																						}
																						return option.value === +stateIdValue;
																					}
																				)
																			}
																			onChange={(option) => {
																				handleStateChange(option);
																				form.trigger('stateId');
																			}}
																			onBlur={() => form.trigger('stateId')}
																			id="stateId"
																			name="stateId"
																			placeholder="Select Emirate"
																			className={
																				form.formState.errors.stateId
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{form.formState.errors.stateId && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.stateId.message}
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
																			form.formState.errors.phoneNumber || checkphoneNumberParam
																				? ' is-invalidMobile '
																				: ''
																		}>
																			<PhoneInput
																				country={"ae"}
																				enableSearch={true}
																				international
																				value={form.watch('phoneNumber')}
																				placeholder={strings.Enter + strings.MobileNumber}
																				onChange={handlePhoneChange}
																				isValid={(value, country) => {
																					// UAE phone validation: 9 digits after country code
																					if (country && country.dialCode === '971') {
																						const localNumber = value.replace(/^971/, '');
																						return localNumber.length === 9 && /^[0-9]+$/.test(localNumber);
																					}
																					return true; // Let PhoneInput handle other countries
																				}}
																			/>
																		</div>
																		{(form.formState.errors.phoneNumber || checkphoneNumberParam) && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.phoneNumber
																					? form.formState.errors.phoneNumber.message
																					: checkphoneNumberParam
																						? 'Invalid mobile number'
																						: ''}
																			</div>
																		)}
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={5}>
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
																							checked={!isDesignatedZone}
																							value={true}
																							onChange={() => setIsDesignatedZone(false)}
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
																							checked={isDesignatedZone}
																							onChange={() => setIsDesignatedZone(true)}
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
															<Row className="mb-4">
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
																				checked={form.watch('IsRegistered')}
																				value={true}
																				onChange={handleIsRegisteredChange}
																				className={
																					form.formState.errors.IsRegistered
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			Is VAT Registered?
																			{form.formState.errors.IsRegistered && (
																				<div className="invalid-feedback d-block">
																					{form.formState.errors.IsRegistered.message}
																				</div>
																			)}
																		</Label>
																	</FormGroup>
																</Col>
															</Row>
															<Row className="row-wrapper" style={{ display: form.watch('IsRegistered') === true ? '' : 'none' }}>
																<Col lg={4}>
																	<FormGroup>
																		<Label htmlFor="TaxRegistrationNumber">
																			<span className="text-danger">* </span>
																			{strings.TaxRegistrationNumber}
																			<div className="tooltip-icon nav-icon fas fa-question-circle ml-1">
																				<span className="tooltiptext">Please note that the TRN cannot be updated <br></br>once a document has been created.</span>
																			</div>
																		</Label>
																		<Input
																			type="text"
																			minLength="15"
																			maxLength="15"
																			placeholder="Enter Tax Registration Number"
																			id="TaxRegistrationNumber"
																			name="TaxRegistrationNumber"
																			{...form.register('TaxRegistrationNumber')}
																			onChange={(e) => {
																				handleTRNChange(e);
																				form.trigger('TaxRegistrationNumber');
																			}}
																			invalid={!!form.formState.errors.TaxRegistrationNumber}
																		/>
																		{form.formState.errors.TaxRegistrationNumber && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.TaxRegistrationNumber.message}
																			</div>
																		)}
																		<div className="VerifyTRN">
																			<br />
																			<b>
																				<a target="_blank" rel="noopener noreferrer" href="https://tax.gov.ae/en/default.aspx" style={{ color: '#2266d8' }}>
																					{strings.VerifyTRN}
																				</a>
																			</b>
																		</div>
																	</FormGroup>
																</Col>
																<Col lg={4}>
																	<FormGroup>
																		<Label htmlFor="vatRegistrationDate">
																			<span className="text-danger">* </span>
																			VAT Registered On
																			<div className="tooltip-icon nav-icon fas fa-question-circle ml-1">
																				<span className="tooltiptext">Please note that you cannot update <br></br> this detail once you have created a document.</span>
																			</div>
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
																			selected={form.watch('vatRegistrationDate')}
																			onChange={(date) => form.setValue('vatRegistrationDate', date)}
																			onBlur={() => form.trigger('vatRegistrationDate')}
																			className={`form-control ${form.formState.errors.vatRegistrationDate
																				? 'is-invalid'
																				: ''
																			}`}
																		/>
																		{form.formState.errors.vatRegistrationDate && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.vatRegistrationDate.message}
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
																			<span className="text-danger">* </span>{strings.FirstName}
																		</Label>
																		<Controller
																			name="firstName"
																			control={form.control}
																			render={({ field, fieldState }) => (
																				<Input
																					type="text"
																					maxLength="100"
																					id="firstName"
																					name="firstName"
																					placeholder="Enter First Name"
																					{...field}
																					onChange={(e) => {
																						const value = e.target.value;
																						if (value === '' || regExAlpha.test(value)) {
																							const upperValue = upperFirst(value);
																							field.onChange(upperValue);
																						}
																					}}
																					invalid={!!fieldState.error}
																				/>
																			)}
																		/>
																		{form.formState.errors.firstName && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.firstName.message}
																			</div>
																		)}
																	</FormGroup>
																</Col>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="lastName">
																			<span className="text-danger">* </span>{strings.LastName}
																		</Label>
																		<Controller
																			name="lastName"
																			control={form.control}
																			render={({ field, fieldState }) => (
																				<Input
																					type="text"
																					maxLength="100"
																					id="lastName"
																					name="lastName"
																					placeholder="Enter Last Name"
																					{...field}
																					onChange={(e) => {
																						const value = e.target.value;
																						if (value === '' || regExAlpha.test(value)) {
																							const upperValue = upperFirst(value);
																							field.onChange(upperValue);
																						}
																					}}
																					invalid={!!fieldState.error}
																				/>
																			)}
																		/>
																		{form.formState.errors.lastName && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.lastName.message}
																			</div>
																		)}
																	</FormGroup>
																</Col>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="email">
																			<span className="text-danger">* </span>{strings.EmailAddress}
																		</Label>
																		<Controller
																			name="email"
																			control={form.control}
																			render={({ field, fieldState }) => (
																				<Input
																					type="email"
																					maxLength="80"
																					id="email"
																					name="email"
																					autoComplete="username"
																					data-lpignore="true"
																					data-form-type="other"
																					placeholder="Enter Email Address"
																					{...field}
																					invalid={!!fieldState.error}
																				/>
																			)}
																		/>
																		{form.formState.errors.email && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.email.message}
																			</div>
																		)}
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={6}>
																	<FormGroup>
																		<Label htmlFor="password">
																			<span className="text-danger">* </span>
																			Password
																		</Label>
																		<div>
																			<Controller
																				name="password"
																				control={form.control}
																				render={({ field, fieldState }) => (
																					<Input
																						onPaste={(e) => {
																							e.preventDefault();
																							return false;
																						}}
																						onCopy={(e) => {
																							e.preventDefault();
																							return false;
																						}}
																						type={isPasswordShown ? 'text' : 'password'}
																						autoComplete="off"
																						id="password"
																						name="password"
																						placeholder=" Enter Password"
																						{...field}
																						onChange={(e) => {
																							field.onChange(e.target.value);
																							handlePasswordChange(e);
																							// Trigger validation on confirmPassword when password changes
																							form.trigger('confirmPassword');
																						}}
																						invalid={!!fieldState.error}
																					/>
																				)}
																			/>
																			<i
																				className={`fa ${isPasswordShown ? "fa-eye" : "fa-eye-slash"} password-icon fa-lg`}
																				onClick={togglePasswordVisiblity}
																				style={{ cursor: 'pointer' }}
																			>
																			</i>
																		</div>
																		{form.formState.errors.password && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.password.message}
																			</div>
																		)}
																		{displayRules === true && (
																			<PasswordChecklist
																				rules={["maxLength", "minLength", "specialChar", "number", "capital"]}
																				minLength={8}
																				maxLength={255}
																				value={form.watch('password')}
																				valueAgain={form.watch('confirmPassword')}
																			/>
																		)}
																	</FormGroup>
																</Col>
																<Col lg={6}>
																	<FormGroup>
																		<Label htmlFor="confirmPassword">
																			<span className="text-danger">* </span>
																			Confirm Password
																		</Label>
																		<Controller
																			name="confirmPassword"
																			control={form.control}
																			render={({ field, fieldState }) => (
																				<Input
																					onPaste={(e) => {
																						e.preventDefault();
																						return false;
																					}}
																					onCopy={(e) => {
																						e.preventDefault();
																						return false;
																					}}
																					type="password"
																					id="confirmPassword"
																					name="confirmPassword"
																					placeholder="Confirm Password"
																					{...field}
																					invalid={!!fieldState.error}
																				/>
																			)}
																		/>
																		{form.formState.errors.confirmPassword && (
																			<div className="invalid-feedback d-block">
																				{form.formState.errors.confirmPassword.message}
																			</div>
																		)}
																		{displayRules === true && (
																			<PasswordChecklist
																				rules={["match"]}
																				minLength={8}
																				value={form.watch('password')}
																				valueAgain={form.watch('confirmPassword')}
																			/>
																		)}
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
																		disabled={loading}
																		className="btn-square mr-3 mt-3"
																		style={{
																			width: '200px',
																			opacity: (!form.formState.isValid && Object.keys(form.formState.touchedFields).length > 0) ? 0.6 : 1
																		}}
																		title={!form.formState.isValid ? `Please fill all required fields. Errors: ${Object.keys(form.formState.errors).length}` : ''}
																	>
																		<i className="fa fa-dot-circle-o"></i>{' '}
																		{loading ? 'Creating...' : 'Register'}
																	</Button>
																</Col>
															</Row>
															<label>
																<a href="https://www.simpleaccounts.io/privacy-policy/" target="_blank" rel="noopener noreferrer">
																	Privacy Policy
																</a>
															</label>
														</Form>
													</CardBody>
												)}
											</Card>
										</CardGroup>
									</Col>
								</Row>
							)}
						</Container>
					</div>
				</div>
			</div>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Register));

