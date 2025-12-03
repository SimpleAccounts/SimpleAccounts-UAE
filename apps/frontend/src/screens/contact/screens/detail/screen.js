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
import { selectOptionsFactory, InputValidation, DropdownLists, Lists } from 'utils';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import { toast } from 'react-toastify';
import './style.scss';
import { AddressComponent } from 'screens/contact/sections';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { CommonActions } from 'services/global';
import * as ContactActions from '../../actions';
import * as DetailContactActions from './actions';
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	const currencyList = state.common.currency_convert_list;
	return {
		country_list: state.contact.country_list,
		currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
		contact_type_list: state.contact.contact_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		contactActions: bindActionCreators(ContactActions, dispatch),
		detailContactActions: bindActionCreators(DetailContactActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
let strings = new LocalizedStrings(data);
class DetailContact extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			initValue: {
				contactType: '',
				currencyCode: '',
				email: '',
				firstName: '',
				lastName: '',
				middleName: '',
				mobileNumber: '',
				organization: '',
				vatRegistrationNumber: '',
				disabled: false,
				taxTreatmentId: '',
			},
			country_list: [],
			currentData: {},
			dialog: null,
			current_contact_id: null,
			disabled: false,
			disabled1: false,
			checkmobileNumberParam: false,
			selectedStatus: false,
			isActive: false,
			loadingMsg: "Loading",
			disableLeavePage: false,
			childRecordsPresent: false
		};

		this.regEx = /^[0-9\d]+$/;
		this.regExTelephone = /^[0-9-]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;
	}

	componentDidMount = () => {
		this.initializeData();
		this.props.detailContactActions
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
		if (this.props.location.state && this.props.location.state.id) {
			this.props.contactActions.getContactTypeList();
			this.props.contactActions.getCountryList();
			this.props.detailContactActions
				.getContactById(this.props.location.state.id)
				.then((res) => {
					this.setState(
						{
							current_contact_id: this.props.location.state.id,
							loading: false,
							isActive: res.data ? res.data.isActive : '',
							selectedStatus: res.data ? res.data.isActive : '',
							initValue: {
								billingAddress: {
									email: res.data.billingEmail ?? '',
									city: res.data.city ?? '',
									countryId: res.data.countryId ?? '',
									address: res.data.addressLine1 ?? '',
									postZipCode: res.data.postZipCode ?? '',
									stateId: res.data.stateId ?? '',
									telephone: res.data.billingTelephone ?? '',
									fax: res.data.fax ?? '',
								},
								shippingAddress: {
									city: res.data.shippingCity ?? '',
									countryId: res.data.shippingCountryId ?? '',
									address: res.data.addressLine2 ?? '',
									postZipCode: res.data.shippingPostZipCode || res.data.shippingPoBoxNumber,
									stateId: res.data.shippingStateId ?? '',
									telephone: res.data.shippingTelephone ?? '',
									fax: res.data.shippingFax ?? '',
								},
								contactType: res.data.contactType ? res.data.contactType : '',
								contractPoNumber:
									res.data.contractPoNumber && res.data.contractPoNumber
										? res.data.contractPoNumber
										: '',
								currencyCode: res.data.currencyCode ?? '',
								email:
									res.data.email && res.data.email !== null
										? res.data.email
										: '',
								firstName:
									res.data.firstName && res.data.firstName !== null
										? res.data.firstName
										: '',
								lastName:
									res.data.lastName && res.data.lastName !== null
										? res.data.lastName
										: '',
								middleName:
									res.data.middleName && res.data.middleName !== null
										? res.data.middleName
										: '',
								website:
									res.data.website && res.data.website !== null
										? res.data.website
										: '',
								mobileNumber:
									res.data.mobileNumber && res.data.mobileNumber !== null
										? res.data.mobileNumber
										: '',
								organization:
									res.data.organization && res.data.organization !== null
										? res.data.organization
										: '',
								telephone:
									res.data.telephone && res.data.telephone !== null
										? res.data.telephone
										: '',
								vatRegistrationNumber:
									res.data.vatRegistrationNumber &&
										res.data.vatRegistrationNumber !== null
										? res.data.vatRegistrationNumber
										: '',
								isActive: res.data ? res.data.isActive : '',
								selectedStatus: res.data ? res.data.isActive : '',
								taxTreatmentId: res.data.taxTreatmentId ? res.data.taxTreatmentId : '',

							},
							existingEmail: res.data.email && res.data.email !== null
								? res.data.email
								: '',
							existingTrn:
								res.data.vatRegistrationNumber &&
									res.data.vatRegistrationNumber !== null
									? res.data.vatRegistrationNumber
									: '',
							showTaxTreatment: res.data.isRegisteredForVat ? res.data.isRegisteredForVat : false,
							taxTreatmentId: res.data.taxTreatmentId ? res.data.taxTreatmentId : '',
							isSame: res.data.isBillingAndShippingAddressSame
						},
						() => {
							const { initValue, current_contact_id } = this.state;
							if (initValue.taxTreatmentId)
								if (initValue.taxTreatmentId === 1 || initValue.taxTreatmentId === 2 || initValue.taxTreatmentId === 3 || initValue.taxTreatmentId === 4)
									this.setState({ disableCountry: true })
							this.checkChildActivitiesForContactId(current_contact_id);
							if (initValue.taxTreatmentId === 1 || initValue.taxTreatmentId === 3 || initValue.taxTreatmentId === 5)
								this.setState({ isRegisteredForVat: true })
							else
								this.setState({ isRegisteredForVat: false })
						},
					);

				})
				.catch((err) => {
					this.setState({ loading: false });
					this.props.commonActions.tostifyAlert(
						'error',
						err
					);
				});


		} else {
			this.props.history.push('/admin/master/contact');
		}
	};

	getData = (data) => {
		let temp = {};
		const { isSame,isActive } = this.state;
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
		this.setState({ disabled: true });
		const { current_contact_id } = this.state;
		let postData = this.getData(data);

		postData = { ...postData, ...{ contactId: current_contact_id } };
		this.setState({ loading: true, disableLeavePage: true, loadingMsg: "Updating Contact..." });
		this.props.detailContactActions
			.updateContact(postData)
			.then((res) => {
				if (res.status === 200) {
					console.log("SUCessss");
					this.setState({ disabled: false });
					resetForm();
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Contact Updated Successfully',
					);
					this.props.history.push('/admin/master/contact');
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				console.log(err);
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Contact Updated Unsuccessfully'
				);
				this.setState({ loading: false, });
				// this.props.history.push('/admin/master/contact');
			});
	};
	success = (msg) => {
		toast.success(msg, {
			autoClose: 80000,
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	checkChildActivitiesForContactId = (id) => {
		this.props.contactActions
			.getInvoicesCountContact(this.state.current_contact_id)
			.then((res) => {
				if (res.data > 0) {
					this.setState({ childRecordsPresent: true })
				} else {
					this.setState({ childRecordsPresent: false })
				}
			});
	};

	deleteContact = () => {
		const { current_contact_id } = this.state;
		this.props.contactActions
			.getInvoicesCountContact(current_contact_id)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to delete invoices to delete the contact',
					);
				} else {
					const message1 =
						<text>
							<b>Delete Contact?</b>
						</text>
					const message = 'This Contact will be deleted permanently and cannot be recovered. ';
					this.setState({
						dialog: (
							<ConfirmDeleteModal
								isOpen={true}
								okHandler={this.removeContact}
								cancelHandler={this.removeDialog}
								message1={message1}
								message={message}
							/>
						),

					});

				}
			});
	};

	removeContact = () => {
		this.setState({ disabled1: true });
		const { current_contact_id } = this.state;
		this.setState({ loading: true, loadingMsg: "Deleting Contact..." });
		this.props.detailContactActions
			.deleteContact(current_contact_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Contact Deleted Successfully',
					);

					this.props.history.push('/admin/master/contact');
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Contact Deleted Unsuccessfully',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
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
		}
		else {
			list = country_list;
		}
		this.setState({ isSame: false, });
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

		const { initValue, loading, dialog, country_list, taxTreatmentList, isSame, disableCountry } = this.state;
		const { loadingMsg } = this.state;

		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div>
					<div className="create-contact-screen">
						<div className="animated fadeIn">
							{dialog}
							{loading ? (
								<Loader></Loader>
							) : (
								<Row>
									<Col lg={12} className="mx-auto">
										<Card>
											<CardHeader>
												<Row>
													<Col lg={12}>
														<div className="h4 mb-0 d-flex align-items-center">
															<i className="nav-icon fas fa-id-card-alt" />
															<span className="ml-2"> {strings.UpdateContact} </span>
														</div>
													</Col>
												</Row>

											</CardHeader>
											<CardBody>
												{loading ? (
													<Loader />
												) : (
													<Row>

														<Col lg={12}>
															<Formik
																initialValues={initValue}
																onSubmit={(values, { resetForm }) => {
																	this.handleSubmit(values, resetForm);
																}}

																validate={(values) => {
																	let errors = {};
																	if (this.state.isRegisteredForVat == true) {
																		if (values.vatRegistrationNumber == "")
																			errors.vatRegistrationNumber = 'Tax Registration Number is Required';

																		if (values.vatRegistrationNumber.length != 15) {
																			errors.vatRegistrationNumber = "Please enter 15 digit Tax Registration Number"
																		}
																	}
																	if (this.state.trnExist == true) {
																		errors.vatRegistrationNumber = 'Tax registration number already exists';
																	}

																	if (this.state.emailExist == true) {
																		errors.email = 'Email Already Exists';
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
																		'First Name is Required',
																	),
																	lastName: Yup.string().required(
																		'Last Name is Required',
																	),
																	currencyCode: Yup.string().required(
																		'Currency is Required',
																	),
																	contactType: Yup.string().required(
																		'Contact Type is Required',
																	),
																	taxTreatmentId: Yup.string().required(
																		'Tax Treatment is Required',
																	),

																	email: Yup.string()
																		.required('Email is Required')
																		.email('Invalid Email')
																	,
																})}
															>
																{(props) => (
																	<Form onSubmit={props.handleSubmit}>

																		<Row>
																			<Col >
																				<FormGroup className="mb-3">
																					<Label htmlFor="active"><span className="text-danger">* </span>{strings.Status}</Label>
																					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
																					<FormGroup check inline>
																						<div className="custom-radio custom-control">
																							<input
																								// disabled={this.state.childRecordsPresent}
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
																								// disabled={this.state.childRecordsPresent}
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

																				</FormGroup>
																			</Col></Row>
																		<h4 className="mb-4">{strings.ContactName}</h4>
																		<Row className="row-wrapper">
																			<Col md="4">
																				<FormGroup>
																					<Label htmlFor="select">
																						<span className="text-danger">* </span>
																						{strings.FirstName}
																					</Label>
																					<Input
																						type="text"
																						id="firstName"
																						name="firstName"
																						maxLength="100"
																						placeholder={strings.Enter + strings.FirstName}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regExAlpha.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange('firstName')(
																									option,
																								);
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
																					<Label htmlFor="middleName">
																						{strings.MiddleName}
																					</Label>
																					<Input
																						type="text"
																						id="middleName"
																						name="middleName"
																						maxLength="100"
																						placeholder={strings.Enter + strings.MiddleName}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regExAlpha.test(
																									option.target.value,
																								)
																							) {
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
																					<Label htmlFor="lastName">	<span className="text-danger">* </span>{strings.LastName}</Label>
																					<Input
																						type="text"
																						id="lastName"
																						name="lastName"
																						maxLength="100"
																						placeholder={strings.Enter + strings.LastName}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regExAlpha.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange('lastName')(
																									option,
																								);
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
																		<Row>
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
																						value={
																							contact_type_list &&
																							contact_type_list.find(
																								(option) =>
																									option.value ===
																									+props.values.contactType,
																							)
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange('contactType')(
																									option.value,
																								);
																							} else {
																								props.handleChange('contactType')('');
																							}
																						}}
																						isDisabled={this.state.childRecordsPresent}
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
																						id="organization"
																						name="organization"
																						maxLength="100"
																						placeholder={strings.Enter + strings.OrganizationName}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regExAddress.test(
																									option.target.value,
																								)
																							) {
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
																						<span className="text-danger">* </span>
																						{strings.Email}
																					</Label>
																					<Input
																						type="email"
																						id="email"
																						name="email"
																						placeholder={strings.Enter + strings.EmailAddres}
																						onChange={(option) => {
																							props.handleChange('email')(option);
																							// this.emailvalidationCheck(option.target.value)
																						}}
																						value={props.values.email}
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
																			<Col md="4">
																				<FormGroup>
																					<Label htmlFor="currencyCode">
																						<span className="text-danger">* </span>
																						{strings.CurrencyCode}
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
																						value={currency_list_dropdown.find((option) => option.value === +props.values.currencyCode,)}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange('currencyCode')(
																									option,
																								);
																							} else {
																								props.handleChange('currencyCode')(
																									'',
																								);
																							}
																						}}
																						isDisabled={this.state.childRecordsPresent}
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
																						placeholder={strings.Enter + strings.TelephoneNumber}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regEx.test(option.target.value)
																							) {
																								props.handleChange('telephone')(
																									option,
																								);
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
																							id="mobileNumber"
																							name="mobileNumber"
																							country={"ae"}
																							enableSearch={true}
																							value={props.values.mobileNumber}
																							placeholder={strings.Enter + strings.MobileNumber}
																							onBlur={props.handleBlur('mobileNumber')}
																							onChange={(option) => {
																								props.handleChange('mobileNumber')(
																									option,
																								);
																								// option.length !== 12 ? this.setState({ checkmobileNumberParam: true }) : this.setState({ checkmobileNumberParam: false });
																							}}
																						// isValid
																						// className={
																						// 	props.errors.mobileNumber &&
																						// 	props.touched.mobileNumber
																						// 		? 'is-invalid'
																						// 		: ''
																						// }
																						/></div>
																					{props.errors.mobileNumber &&
																						props.touched.mobileNumber && (
																							<div style={{ color: "red" }}>
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

																			{/* Hidden by Shoaib for Multi-country */}
																			<Col lg={4}>
																				<FormGroup className="mb-3 hideTRN">
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
																						isDisabled={props.values.taxTreatmentId === 1 || props.values.taxTreatmentId === 3 || props.values.taxTreatmentId === 5}
																						id="taxTreatmentId"
																						name="taxTreatmentId"
																						placeholder={strings.Select + strings.TaxTreatment}
																						value={
																							taxTreatmentList &&
																							selectOptionsFactory.renderOptions(
																								'name',
																								'id',
																								taxTreatmentList,
																								'TaxTreatment',
																							)
																								.find(
																									(option) =>
																										option.value ===
																										+props.values.taxTreatmentId,
																								)
																						}
																						onChange={(option) => {
																							props.handleChange(`shippingAddress.countryId`)('');
																							props.handleChange(`billingAddress.countryId`)('');
																							props.handleChange(`shippingAddress.stateId`)('');
																							props.handleChange(`billingAddress.stateId`)('');
																							this.resetCountryList(option.value, props);
																							if (option && option.value) {
																								props.handleChange('taxTreatmentId')(option.value,);
																								if (option.value === 1 || option.value === 3 || option.value === 5)
																									this.setState({ isRegisteredForVat: true })
																								else
																									this.setState({ isRegisteredForVat: false })
																								if (option.value === 1 || option.value === 2 || option.value === 3 || option.value === 4) {
																									this.setState({ disableCountry: true })
																									props.handleChange(`shippingAddress.countryId`)(229);
																									props.handleChange(`billingAddress.countryId`)(229);
																								}
																								else
																									this.setState({ disableCountry: false })
																							} else {
																								props.handleChange('taxTreatmentId')('');
																								this.setState({ disableCountry: false })
																							}
																							props.handleChange('vatRegistrationNumber')('',);
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

																			{props.values.taxTreatmentId && props.values.taxTreatmentId && (<Col md="4" style={{ display: props.values.taxTreatmentId === 1 || props.values.taxTreatmentId === 3 || props.values.taxTreatmentId === 5 ? '' : 'none' }}>
																				<FormGroup>
																					<Label htmlFor="vatRegistrationNumber"><span className="text-danger">* </span>
																						{strings.TaxRegistrationNumber}
																					</Label>
																					<Input
																						type="text"
																						maxLength="15"
																						id="vatRegistrationNumber"
																						name="vatRegistrationNumber"
																						placeholder={strings.Enter + strings.TaxRegistrationNumber}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regEx.test(option.target.value)
																							) {
																								props.handleChange(
																									'vatRegistrationNumber',
																								)(option);
																								// if (this.state.existingTrn != option.target.value)
																									this.validationCheck(option.target.value)
																							}
																						}}
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
																				touched={props.touched.billingAddress}
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
																							type="checkbox"
																							id="inline-radio1"
																							name="SMTP-auth"
																							checked={isSame}
																							onChange={(option) => {


																								if (isSame === false) {
																									props.handleChange(`shippingAddress`)(props.values.billingAddress);
																								} else {
																									props.handleChange(`shippingAddress`)(Lists.Address);
																									if (disableCountry) {
																										props.handleChange(`shippingAddress.countryId`)(229);
																									}
																								}
																								this.setState({ isSame: !isSame, });
																							}}
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
																			<Col
																				lg={12}
																				className="d-flex align-items-center justify-content-between flex-wrap mt-5"
																			>
																				<FormGroup>
																					<Button
																						type="button"
																						name="button"
																						color="danger"
																						className="btn-square"
																						disabled1={this.state.disabled1}
																						onClick={this.deleteContact}
																					>
																						<i className="fa fa-trash"></i> {this.state.disabled1
																							? 'Deleting...'
																							: strings.Delete}
																					</Button>
																				</FormGroup>
																				<FormGroup className="text-right">
																					<Button
																						type="submit"
																						name="submit"
																						color="primary"
																						className="btn-square mr-3"
																						disabled={this.state.disabled}
																						onClick={() => {
																							//	added validation popup	msg
																							props.handleBlur();
																							if (props.errors && Object.keys(props.errors).length != 0)
																								this.props.commonActions.fillManDatoryDetails();
																						}}
																					>
																						<i className="fa fa-dot-circle-o"></i>{' '}
																						{this.state.disabled
																							? 'Updating...'
																							: strings.Update}
																					</Button>
																					<Button
																						type="button"
																						name="button"
																						color="secondary"
																						className="btn-square"
																						onClick={() => {
																							this.props.history.push(
																								'/admin/master/contact',
																							);
																						}}
																					>
																						<i className="fa fa-ban"></i> {this.state.disabled1
																							? 'Deleting...'
																							: strings.Cancel}
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
							)}
						</div>
					</div>
					{this.state.disableLeavePage ? "" : <LeavePage />}
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailContact);
