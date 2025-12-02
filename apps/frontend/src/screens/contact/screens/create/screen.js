import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
} from 'reactstrap';
import Select from 'react-select';
import { LeavePage, Loader } from 'components';
import { upperFirst } from 'lodash-es';
import { selectOptionsFactory, InputValidation, DropdownLists, Lists } from 'utils';
import './style.scss';
import { data } from '../../../Language/index';
import { AddressComponent } from 'screens/contact/sections';
import LocalizedStrings from 'react-localization';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { CommonActions } from 'services/global';
import * as ContactActions from '../../actions';
import * as CreateContactActions from './actions';
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'

const mapStateToProps = (state) => {
	const currencyList = state.common.currency_convert_list;
	console.log(state.common.currency_convert_list, "currencyList")
	return {
		country_list: state.contact.country_list,
		currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
		contact_type_list: state.contact.contact_type_list,
		companyDetails: state.common.company_details,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		contactActions: bindActionCreators(ContactActions, dispatch),
		createContactActions: bindActionCreators(CreateContactActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class CreateContact extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			initValue: {
				shippingAddress: Lists.Address,
				billingAddress: {
					email: '',
					city: '',
					countryId: '',
					address: '',
					postZipCode: '',
					stateId: '',
					telephone: '',
					fax: '',
				},
				contactType: this.props.contactType ? this.props.contactType : '',
				currencyCode: 150,
				email: '',
				firstName: '',
				addressLine3: '',
				lastName: '',
				middleName: '',
				mobileNumber: '',
				organization: '',
				telephone: '',
				vatRegistrationNumber: '',
				disabled: false,
				taxTreatmentId: '',
			},
			country_list: [],
			createMore: false,
			checkmobileNumberParam: false,
			selectedStatus: true,
			isActive: true,
			isRegisteredForVat: false,
			isSame: false,
			disableLeavePage: false,
		};

		this.regEx = /^[0-9\d]+$/;
		this.regExTelephone = /^[0-9-]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;
		this.formRef = React.createRef();
	}

	componentDidMount = () => {
		this.initializeData();
		this.props.createContactActions
			.getTaxTreatment()
			.then((res) => {
				if (res.status === 200) {
					let array = []
					res.data.map((row) => {
						if (row.id !== 8)
							array.push(row);
					})
					this.setState({ taxTreatmentList: array });
				}
			})
			.catch((err) => {

				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'ERROR',
				);
			});
	};

	initializeData = () => {
		this.props.commonActions.getCurrencyConversionList();
		this.props.contactActions.getContactTypeList();
		this.props.contactActions.getCountryList();
		const { companyDetails } = this.props;
		if (companyDetails) {
			const { currencyCode, isRegisteredVat } = companyDetails;
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						currencyCode: currencyCode,
					},
				},
				isRegisteredVat: isRegisteredVat,
			});
			this.formRef.current.setFieldValue('currencyCode', currencyCode);
		}
	};
	getData = (data) => {
		let temp = {};
		const { isSame, isActive } = this.state;
		for (let item in data) {
			if (typeof data[`${item}`] !== 'object') {
				temp[`${item}`] = data[`${item}`];
			} else {
				temp[`${item}`] = data[`${item}`].value;
			}
		}
		const billingcountryId = data[`billingAddress`].countryId;
		const shippingCountryId = data[`shippingAddress`].countryId;

		temp[`isActive`] = isActive;
		temp[`isBillingAndShippingAddressSame`] = isSame;
		temp[`addressLine1`] = data[`billingAddress`].address;
		temp[`countryId`] = billingcountryId;
		temp[`stateId`] = data[`billingAddress`].stateId;
		temp[`postZipCode`] = data[`billingAddress`].postZipCode;
		temp[`city`] = data[`billingAddress`].city;
		temp[`fax`] = data[`billingAddress`].fax;
		temp[`billingTelephone`] = data[`billingAddress`].telephone;
		temp[`addressLine2`] = data[`shippingAddress`].address;
		temp[`poBoxNumber`] = data[`billingAddress`].postZipCode;

		const billingAdress = {
			billingAddress: data[`billingAddress`].address,
			billingCity: data[`billingAddress`].city,
			billingEmail: data[`billingAddress`].email,
			billingFax: data[`billingAddress`].fax,
			billingPoBoxNumber: billingcountryId === 229 ? data[`billingAddress`].postZipCode : '',
			billingPostZipCode: billingcountryId !== 229 ? data[`billingAddress`].postZipCode : '',
			billingStateProvince: data[`billingAddress`].stateId,
			billingcountryId: data[`billingAddress`].countryId,
		}

		const shippingAddress = {
			shippingAddress: data[`shippingAddress`].address,
			shippingCity: data[`shippingAddress`].city,
			billingEmail: data[`shippingAddress`].email,
			shippingFax: data[`shippingAddress`].fax,
			shippingTelephone: data[`shippingAddress`].telephone,
			shippingPoBoxNumber: shippingCountryId === 229 ? data[`shippingAddress`].postZipCode : '',
			shippingPostZipCode: shippingCountryId !== 229 ? data[`shippingAddress`].postZipCode : '',
			shippingStateId: data[`shippingAddress`].stateId,
			shippingCountryId: data[`shippingAddress`].countryId,
		}
		temp = { ...temp, ...billingAdress, ...shippingAddress }
		return temp;
	};

	handleSubmit = (data, resetForm) => {
		this.setState({ loading: true, disableLeavePage: true, loadingMsg: "Creating Contact..." });
		this.setState({ disabled: true });
		const postData = this.getData(data);
		console.log(postData)
		this.props.createContactActions
			.createContact(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.setState({ loading: false });
					this.props.commonActions.tostifyAlert(
						'success',
						"Contact Created Successfully"
					);
					if (this.state.createMore) {
						resetForm(this.state.initValue);
						this.setState({ createMore: false, disableLeavePage: false });
					} else {
						if (this.props.isParentComponentPresent && this.props.isParentComponentPresent === true) {
							this.props.getCurrentContactData(res.data);
							this.props.closeModal(true);
						}
						else
							this.props.history.push('/admin/master/contact');
						this.setState({ loading: false, });

					}
				}
			})
			.catch((err) => {
				console.log(err);
				this.setState({ disabled: false, loading: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Contact Created Unsuccessfully',
				);
			});
	};
	resetCountryList = (taxtid, props) => {
		const { country_list } = this.props;
		let list = [];
		if (taxtid === 7 || taxtid === 5 || taxtid === 6) {
			country_list.map((obj) => {
				if ((taxtid === 6 || taxtid === 5) && (obj.countryCode === 229 || obj.countryCode === 191 || obj.countryCode === 178 ||
					obj.countryCode === 165 || obj.countryCode === 117 || obj.countryCode === 17)) {
					list.push(obj);
				}
				if ((taxtid === 7) && (obj.countryCode !== 229 && obj.countryCode !== 191 && obj.countryCode !== 178 &&
					obj.countryCode !== 165 && obj.countryCode !== 117 && obj.countryCode !== 17)) {
					list.push(obj);
				}
			});
			props.handleChange(`shippingAddress.countryId`)('');
			props.handleChange(`billingAddress.countryId`)('');
			props.handleChange(`shippingAddress.stateId`)('');
			props.handleChange(`billingAddress.stateId`)('');
			this.setState({ isSame: false, });
		}
		else {
			list = country_list;
			const country = country_list.find((option) => option.countryCode === 229);
			props.handleChange(`shippingAddress.countryId`)(country.countryCode);
			props.handleChange(`billingAddress.countryId`)(country.countryCode);
			props.handleChange(`shippingAddress.stateId`)('');
			props.handleChange(`billingAddress.stateId`)('');
			this.setState({ isSame: false, });
		}
		list = list ? selectOptionsFactory.renderOptions(
			'countryName',
			'countryCode',
			list,
			'Country',
		) : []
		this.setState({ country_list: list });
	};
	validationCheck = (value) => {
		const data = {
			moduleType: 21,
			name: value,
		};
		this.props.contactActions.checkValidation(data).then((response) => {
			if (response.data === 'Tax Registration Number Already Exists') {
				this.setState({
					trnExist: true,
				});
			} else {
				this.setState({
					trnExist: false,
				});
			}
		});
	};
	emailvalidationCheck = (value) => {
		const data = {
			moduleType: 22,
			name: value,
		};
		this.props.contactActions.checkValidation(data).then((response) => {
			if (response.data === 'Email Already Exists') {
				this.setState({
					emailExist: true,
				});
			} else {
				this.setState({
					emailExist: false,
				});
			}
		});
	};

	render() {
		strings.setLanguage(this.state.language);
		const {
			currency_list_dropdown,
			contact_type_list,
		} = this.props;
		const { initValue, checkmobileNumberParam, taxTreatmentList, isSame, disableCountry } = this.state;
		const { loading, loadingMsg, country_list } = this.state;

		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div>
					<div className="create-contact-screen">
						<div className="animated fadeIn">
							<Row>
								<Col lg={12} className="mx-auto">
									<Card>
										<CardHeader>
											<Row>
												<Col lg={12}>
													<div className="h4 mb-0 d-flex align-items-center">
														<i className="nav-icon fas fa-id-card-alt" />
														<span className="ml-2">{strings.CreateContact}</span>
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
															initialValues={initValue}
															ref={this.formRef}
															onSubmit={(values, { resetForm }) => {
																this.handleSubmit(values, resetForm);
															}}
															validate={(values) => {
																let errors = {};
																if (!(this.props.isParentComponentPresent && this.props.isParentComponentPresent == true)) {
																	if (checkmobileNumberParam === true) {
																		errors.mobileNumber =
																			'Invalid mobile number';
																	}
																}
																if (this.state.isRegisteredForVat == true) {
																	if (values.vatRegistrationNumber == "")
																		errors.vatRegistrationNumber = 'Tax registration number is required';
																	if (values.vatRegistrationNumber.length != 15) {
																		errors.vatRegistrationNumber = "Please enter 15 digit Tax registration number"
																	}
																}
																if (this.state.trnExist == true) {
																	errors.vatRegistrationNumber = 'Tax registration number already exists';
																}
																if (this.state.emailExist == true) {
																	errors.email = 'Email already exists';
																}
																const shippingAddressError = InputValidation.addressValidation(values.shippingAddress)
																if (shippingAddressError && Object.values(shippingAddressError).length > 0) {
																	errors.shippingAddress = shippingAddressError;
																}
																const billingAddressError = InputValidation.addressValidation(values.billingAddress)
																if (billingAddressError && Object.values(billingAddressError).length > 0) {
																	errors.billingAddress = billingAddressError;
																}
																return errors;

															}}
															validationSchema={Yup.object().shape({
																firstName: Yup.string().required(
																	strings.FirstNameRequired
																),
																lastName: Yup.string().required(
																	strings.LastNameRequired
																),
																currencyCode: Yup.string().required(
																	'Currency is required',
																),
																contactType: Yup.string().required(
																	'Contact type is required',
																),
																taxTreatmentId: Yup.string().required(
																	strings.TaxTreatmentRequired
																),
																email: Yup.string()
																	.required(strings.EmailIsRequired)
																	.email('Invalid Email'),
															})}
														>
															{(props) => (
																<Form onSubmit={props.handleSubmit}>
																	<Row>
																		<Col >
																			{this.props.isParentComponentPresent && this.props.isParentComponentPresent == true ? "" : (<FormGroup className="mb-3">
																				<Label htmlFor="active"><span className="text-danger">* </span>{strings.Status}</Label>
																				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
																				<FormGroup check inline>
																					<div className="custom-radio custom-control">
																						<input
																							className="custom-control-input"
																							type="radio"
																							id="inline-radio1"
																							name="active"
																							checked={
																								this.state.selectedStatus
																							}
																							value={true}
																							onChange={(e) => {
																								if (
																									e.target.value === 'true'
																								) {
																									this.setState({
																										selectedStatus: true,
																										isActive: true
																									});
																								}
																							}}
																						/>
																						<label
																							className="custom-control-label"
																							htmlFor="inline-radio1"
																						>
																							{strings.Active}
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
																							checked={
																								!this.state.selectedStatus
																							}
																							onChange={(e) => {
																								if (
																									e.target.value === 'false'
																								) {
																									this.setState({
																										selectedStatus: false,
																										isActive: false
																									});
																								}
																							}}
																						/>
																						<label
																							className="custom-control-label"
																							htmlFor="inline-radio2"
																						>
																							{strings.Inactive}
																						</label>
																					</div>
																				</FormGroup>

																			</FormGroup>)}
																		</Col>
																	</Row>
																	<h4 className="mb-4">{strings.ContactName}</h4>


																	<Row className="row-wrapper">
																		<Col md="4">
																			<FormGroup>
																				<Label htmlFor="select">
																					<span className="text-danger">* </span>{strings.FirstName}
																				</Label>
																				<Input
																					type="text"
																					maxLength="100"
																					id="firstName"
																					name="firstName"
																					autoComplete="Off"
																					placeholder={strings.Enter + strings.FirstName}
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
																					value={props.values.firstName}
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
																		<Col md="4">
																			<FormGroup>
																				<Label htmlFor="middleName ">
																					{strings.MiddleName}
																				</Label>
																				<Input
																					type="text"
																					maxLength="100"
																					id="middleName "
																					name="middleName "
																					autoComplete="Off"
																					placeholder={strings.Enter + strings.MiddleName}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExAlpha.test(
																								option.target.value,
																							)
																						) {
																							option = upperFirst(option.target.value)
																							props.handleChange('middleName')(
																								option,
																							);
																						}
																					}}
																					value={props.values.middleName}
																					className={
																						props.errors.middleName &&
																							props.touched.middleName
																							? 'is-invalid'
																							: ''
																					}
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
																					autoComplete="Off"
																					placeholder={strings.Enter + strings.LastName}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExAlpha.test(
																								option.target.value,
																							)
																						) {
																							option = upperFirst(option.target.value)
																							props.handleChange('lastName')(option);
																						}
																					}}
																					value={props.values.lastName}
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
																	</Row>
																	<hr />
																	<h4 className="mb-4">{strings.ContactDetails}</h4>

																	<Row className="row-wrapper">
																		<Col md="4">
																			<FormGroup>
																				<Label htmlFor="contactType">
																					<span className="text-danger">* </span>
																					{strings.ContactType}
																					<i
																						id="Contacttyprtip"
																						className="fa fa-question-circle ml-1"
																					></i>
																					<UncontrolledTooltip
																						placement="right"
																						target="Contacttyprtip"
																					>
																						The contact type cannot be changed once a document has been created for this contact.
																					</UncontrolledTooltip>
																				</Label>
																				<Select
																					options={
																						contact_type_list
																							? selectOptionsFactory.renderOptions(
																								'label',
																								'value',
																								contact_type_list,
																								'Contact ',
																							)
																							: []
																					}
																					isDisabled={this.props.contactType ? true : false}
																					value={props.values.contactType}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('contactType')(
																								option,
																							);
																						} else {
																							props.handleChange('contactType')('');
																						}
																					}}
																					placeholder={strings.Select + strings.ContactType}
																					id="contactType"
																					name="contactType"
																					className={
																						props.errors.contactType &&
																							props.touched.contactType
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.contactType &&
																					props.touched.contactType && (
																						<div className="invalid-feedback">
																							{props.errors.contactType}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col md="4">
																			<FormGroup>
																				<Label htmlFor="organization ">
																					{strings.OrganizationName}
																				</Label>
																				<Input
																					type="text"
																					maxLength="100"
																					id="organization"
																					name="organization"
																					autoComplete="Off"
																					placeholder={strings.Enter + strings.OrganizationName}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExAddress.test(
																								option.target.value,
																							)
																						) {
																							option = upperFirst(option.target.value)
																							props.handleChange('organization')(
																								option,
																							);
																						}
																					}}
																					value={props.values.organization}
																					className={
																						props.errors.organization &&
																							props.touched.organization
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.organization &&
																					props.touched.organization && (
																						<div className="invalid-feedback">
																							{props.errors.organization}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
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
																					autoComplete="Off"
																					placeholder={strings.Enter + strings.EmailAddres}
																					onChange={(option) => {
																						props.handleChange('email')(option);
																						this.emailvalidationCheck(option.target.value)
																					}}
																					value={props.values.email}
																					className={
																						props.errors.email && props.touched.email
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
																	<Row className="row-wrapper">
																		<Col md="4">
																			<FormGroup>
																				<Label htmlFor="currencyCode">
																					<span className="text-danger">* </span>
																					{strings.Currency}
																					<i
																						id="Currencytip"
																						className="fa fa-question-circle ml-1"
																					></i>
																					<UncontrolledTooltip
																						placement="right"
																						target="Currencytip"
																					>
																						You cannot change the currency once a document is created for this contact.
																					</UncontrolledTooltip>
																				</Label>
																				<Select
																					options={currency_list_dropdown}
																					value={props.values.currencyCode?.value ? props.values.currencyCode : currency_list_dropdown.find((option) => option.value === props.values.currencyCode,)}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('currencyCode')(
																								option,
																							);
																						} else {
																							props.handleChange('currencyCode')('');
																						}
																					}}
																					placeholder={strings.Select + strings.Currency}
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
																		<Col md="4">
																			<FormGroup>
																				<Label htmlFor="telephone">{strings.Telephone}</Label>
																				<Input
																					maxLength="15"
																					type="text"
																					id="telephone"
																					name="telephone"
																					autoComplete="Off"
																					placeholder={strings.Enter + strings.TelephoneNumber}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExTelephone.test(option.target.value)
																						) {
																							props.handleChange('telephone')(option);
																						}
																					}}
																					value={props.values.telephone}
																					className={
																						props.errors.telephone &&
																							props.touched.telephone
																							? 'is-invalid'
																							: ''
																					}
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
																				<Label htmlFor="mobileNumber">
																					<span className="text-danger"> </span>
																					{strings.MobileNumber}
																				</Label>
																				<div className={
																					props.errors.mobileNumber &&
																						props.touched.mobileNumber
																						? ' is-invalidMobile '
																						: ''
																				}>
																					<PhoneInput
																						enableSearch={true}
																						id="mobileNumber"
																						name="mobileNumber"
																						country={"ae"}
																						value={props.values.mobileNumber}
																						placeholder={strings.Enter + strings.MobileNumber}
																						onBlur={props.handleBlur('mobileNumber')}
																						onChange={(option) => {
																							props.handleChange('mobileNumber')(
																								option,
																							);

																							option.length !== 12 ? this.setState({ checkmobileNumberParam: true }) : this.setState({ checkmobileNumberParam: false });
																						}}
																						isValid
																					/>
																				</div>
																				{props.errors.mobileNumber &&
																					props.touched.mobileNumber && (
																						<div className="invalid-feedback">
																							{props.errors.mobileNumber}
																						</div>
																					)}
																			</FormGroup>
																		</Col>

																		<Col md="4">
																			<FormGroup>
																				<Label htmlFor="select">
																					{strings.Website}
																				</Label>
																				<Input
																					type="text"
																					id="website"
																					name="website"
																					maxLength="100"
																					autoComplete="Off"
																					placeholder={strings.Enter + strings.Website}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExAddress.test(
																								option.target.value,
																							)
																						) {
																							props.handleChange('website')(
																								option,
																							);
																						}
																					}}
																					value={props.values.website}
																					className={
																						props.errors.website &&
																							props.touched.website
																							? 'is-invalid'
																							: ''
																					}
																				/>

																			</FormGroup>
																		</Col>
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="taxTreatmentId">
																					<span className="text-danger">* </span>{strings.TaxTreatment}
																					<i
																						id="TaxTreatmenttip"
																						className="fa fa-question-circle ml-1"
																					></i>
																					<UncontrolledTooltip
																						placement="right"
																						target="TaxTreatmenttip"
																					>
																						Once any document has been created for this contact, you cannot change the Tax treatment.
																					</UncontrolledTooltip>
																				</Label>
																				<Select
																					options={
																						taxTreatmentList
																							? selectOptionsFactory.renderOptions(
																								'name',
																								'id',
																								taxTreatmentList,
																								'VAT',
																							)
																							: []
																					}
																					isDisabled={this.state.childRecordsPresent}
																					id="taxTreatmentId"
																					name="taxTreatmentId"
																					placeholder={strings.Select + strings.TaxTreatment}
																					value={props.values.taxTreatmentId}
																					onChange={(option) => {
																						// this.setState({
																						//   selectedVatCategory: option.value
																						// })
																						this.resetCountryList(option.value, props);
																						if (option && option.value) {
																							props.handleChange('taxTreatmentId')(option,);
																							if (option.value === 1 || option.value === 3 || option.value === 5)
																								this.setState({ isRegisteredForVat: true })
																							else
																								this.setState({ isRegisteredForVat: false })
																							if (option.value === 1 || option.value === 2 || option.value === 3 || option.value === 4)
																								this.setState({ disableCountry: true })
																							else
																								this.setState({ disableCountry: false })
																						} else {
																							props.handleChange('taxTreatmentId')(false,);
																							this.setState({ disableCountry: false })
																						}
																						props.handleChange('vatRegistrationNumber');

																					}}
																					className={
																						props.errors.taxTreatmentId &&
																							props.touched.taxTreatmentId
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.taxTreatmentId &&
																					props.touched.taxTreatmentId && (
																						<div className="invalid-feedback">
																							{props.errors.taxTreatmentId}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		{props.values.taxTreatmentId && props.values.taxTreatmentId.value && (
																			<Col md="4" style={{ display: props.values.taxTreatmentId.value === 1 || props.values.taxTreatmentId.value === 3 || props.values.taxTreatmentId.value === 5 ? '' : 'none' }}>
																				<FormGroup>
																					<Label htmlFor="vatRegistrationNumber"><span className="text-danger">* </span>
																						{strings.TaxRegistrationNumber}
																					</Label>
																					<Input
																						type="text"
																						minLength="15"
																						maxLength="15"
																						id="vatRegistrationNumber"
																						name="vatRegistrationNumber"
																						autoComplete="Off"
																						
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regEx.test(option.target.value)
																							) {
																								props.handleChange(
																									'vatRegistrationNumber',
																								)(option);
																								this.validationCheck(option.target.value)
																							}
																						}}
																						placeholder={strings.Enter + strings.TaxRegistrationNumber}
																						value={props.values.vatRegistrationNumber}
																						className={
																							props.errors.vatRegistrationNumber &&
																								props.touched.vatRegistrationNumber
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.vatRegistrationNumber &&
																						props.touched.vatRegistrationNumber && (
																							<div className="invalid-feedback">
																								{props.errors.vatRegistrationNumber}
																							</div>
																						)}
																					<div className="VerifyTRN">
																						<br />
																						<b>	<a target="_blank" rel="noopener noreferrer" href="https://tax.gov.ae/en/default.aspx" style={{ color: '#2266d8' }}  >{strings.VerifyTRN}</a></b>
																					</div>
																				</FormGroup>
																			</Col>)}
																	</Row>
																	<hr />
																	<h2 className="mb-3 mt-3">{strings.ContactAddressDetails}</h2>
																	<h5 className="mb-3 mt-3">{strings.BillingDetails}</h5>
																	<Row className="row-wrapper">
																		<AddressComponent
																			values={props.values.billingAddress}
																			errors={props.errors.billingAddress}
																			touched={props.touched.billingAddress || props.touched.shippingAddress}
																			onChange={(field, value) => {
																				props.handleChange(`billingAddress.${field}`)(value);
																				this.setState({ isSame: false, });
																			}}
																			country_list={country_list}
																			addressType={strings.Billing}
																			disabled={{ email: false, city: false, countryId: disableCountry, address: false, postZipCode: false, stateId: false, telephone: false, fax: false, }}
																		/>
																	</Row>
																	<hr />
																	<h5 className="mb-3 mt-3">{strings.ShippingDetails}</h5>
																	<Row>
																		<Col lg={12}>
																			<FormGroup check inline className="mb-3">
																				<div>
																					<Input
																						// className="custom-control-input"
																						onChange={() => {
																							if (isSame == false) {
																								props.handleChange(`shippingAddress`)(props.values.billingAddress);
																							} else {
																								props.handleChange(`shippingAddress`)(Lists.Address);
																								if (disableCountry) {
																									props.handleChange(`shippingAddress.countryId`)(229);
																								}
																							}
																							this.setState({ isSame: !isSame, });
																						}}
																						type="checkbox"
																						id="inline-radio1"
																						name="SMTP-auth"
																						checked={isSame}

																					/>
																					<label >
																						{strings.ShippingAddressIsSameAsBillingAddress}
																					</label>
																				</div>
																			</FormGroup>
																		</Col>
																	</Row>
																	<Row className="row-wrapper">
																		<AddressComponent
																			values={props.values.shippingAddress || {}}
																			errors={props.errors.shippingAddress || {}}
																			touched={props.touched.shippingAddress}
																			onChange={(field, value) => {
																				props.handleChange(`shippingAddress.${field}`)(value);
																				this.setState({ isSame: false, });
																			}}
																			country_list={country_list}
																			addressType={strings.Shipping}
																			disabled={{ email: false, city: false, countryId: disableCountry, address: false, postZipCode: false, stateId: false, telephone: false, fax: false, }}
																		/>
																	</Row>

																	<Row>
																		<Col lg={12} className="mt-5">
																			<FormGroup className="text-right">
																				<Button
																					type="button"
																					color="primary"
																					className="btn-square mr-3"
																					disabled={this.state.disabled}
																					onClick={() => {
																						console.log(props.errors, "ERROR");
																						//  added validation popup  msg                                                                
																						props.handleBlur();
																						if (props.errors && Object.keys(props.errors).length != 0)
																							this.props.commonActions.fillManDatoryDetails();
																						this.setState(
																							{ createMore: false },
																							() => {
																								props.handleSubmit();
																							},
																						);
																					}}
																				>
																					<i className="fa fa-dot-circle-o"></i>	{this.state.disabled
																						? 'Creating...'
																						: strings.Create}
																				</Button>
																				{this.props.isParentComponentPresent && this.props.isParentComponentPresent == true ? "" : (<Button
																					name="button"
																					color="primary"
																					className="btn-square mr-3"
																					disabled={this.state.disabled}
																					onClick={() => {
																						//  added validation popup  msg                                                                
																						props.handleBlur();
																						if (props.errors && Object.keys(props.errors).length != 0)
																							this.props.commonActions.fillManDatoryDetails();
																						this.setState(
																							{ createMore: true, isSame: false },
																							() => {
																								props.handleSubmit();
																							},
																						);
																					}}
																				>
																					<i className="fa fa-refresh"></i> 	{this.state.disabled
																						? 'Creating...'
																						: strings.CreateandMore}
																				</Button>)}
																				<Button
																					color="secondary"
																					className="btn-square"
																					onClick={() => {
																						// if(this.props.location
																						// 	&& this.props.location.state
																						// 	&& this.props.location.state.gotoParentURL
																						// )
																						// 	this.props.history.push(this.props.location.state.gotoParentURL)																		
																						if (this.props.isParentComponentPresent && this.props.isParentComponentPresent == true){
																							this.props.confirmCancel(true);
																						}
																						else
																							this.props.history.push('/admin/master/contact');


																					}}
																				>
																					<i className="fa fa-ban mr-1"></i> {strings.Cancel}
																				</Button>
																			</FormGroup>
																		</Col>
																	</Row>
																</Form>
															)}
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
					{this.state.disableLeavePage ? "" : <LeavePage />}
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateContact);
