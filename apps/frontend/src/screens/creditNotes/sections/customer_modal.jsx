import React, { useState, useEffect } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Button as ShadButton } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

// Validation schema
const customerSchema = z.object({
	contactType: z.number().default(2),
	billingEmail: z.string().optional(),
	city: z.string().optional(),
	contractPoNumber: z.string().optional(),
	countryId: z.string().min(1, 'Country is Required'),
	currencyCode: z.string().min(1, 'Please Select Currency'),
	email: z.string().min(1, 'Email is Required').email('Invalid Email'),
	firstName: z.string().min(1, 'First Name is Required'),
	addressLine1: z.string().min(1, 'Address Line 1 is Required'),
	addressLine2: z.string().min(1, 'Address Line 2 is Required'),
	addressLine3: z.string().min(1, 'Address Line 3 is Required'),
	lastName: z.string().min(1, 'Last Name is Required'),
	middleName: z.string().optional(),
	mobileNumber: z.string().min(1, 'Mobile Number is Required'),
	organizationName: z.string().optional(),
	poBoxNumber: z.string().optional(),
	postZipCode: z.string().optional(),
	stateId: z.string().min(1, 'State Region is Required'),
	telephone: z.string().optional(),
	vatRegistrationNumber: z.string().min(1, 'Tax Registration Number is Required'),
	disabled: z.boolean().default(false),
});

const CustomerModal = ({
	openCustomerModal,
	closeCustomerModal,
	currency_list,
	country_list,
	createCustomer,
	getCurrentUser,
	getStateList,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [showDetails, setShowDetails] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const [stateList, setStateList] = useState([]);
	const [mobileNumberError, setMobileNumberError] = useState(false);

	const regEx = /^[0-9\d]+$/;
	const regExBoth = /[a-zA-Z0-9]+$/;
	const regExAlpha = /^[a-zA-Z ]+$/;
	const regExAddress = /^[a-zA-Z0-9\s,'-]+$/;

	strings.setLanguage(language);

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			contactType: 2,
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
	});

	const countryId = watch('countryId');

	useEffect(() => {
		if (countryId) {
			handleGetStateList(countryId);
		} else {
			setStateList([]);
		}
	}, [countryId]);

	const getData = (data) => {
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

	const handleGetStateList = (countryCode) => {
		if (countryCode) {
			getStateList(countryCode).then((res) => {
				if (res.status === 200) {
					setStateList(res.data);
				}
			});
		} else {
			setStateList([]);
		}
	};

	const onSubmit = (data) => {
		if (mobileNumberError) {
			return;
		}

		setDisabled(true);
		const postData = getData(data);
		createCustomer(postData)
			.then((res) => {
				let resConfig = JSON.parse(res.config.data);

				if (res.status === 200) {
					setDisabled(false);
					reset();
					closeCustomerModal(true);

					let tmpData = res.data;
					tmpData.currencyCode = resConfig.currencyCode;

					getCurrentUser(tmpData);
				}
			})
			.catch((err) => {
				setDisabled(false);
				displayMsg(err);
			});
	};

	const displayMsg = (err) => {
		toast.error(`${err.data.message}`, {
			position: 'top-right',
		});
	};

	const handleShowDetails = (bool) => {
		setShowDetails(bool);
	};

	return (
		<div className="contact-modal-screen">
			<Modal isOpen={openCustomerModal} className="modal-success contact-modal">
				<Form name="simpleForm" onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
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
					<ModalBody>
						<h4 className="mb-3 mt-3">{strings.ContactDetails}</h4>
						<Row className="row-wrapper">
							<Col md="4">
								<FormGroup>
									<Label htmlFor="firstName">
										<span className="text-danger">* </span> {strings.FirstName}
									</Label>
									<Controller
										name="firstName"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="text"
												maxLength="26"
												id="firstName"
												onChange={(e) => {
													if (e.target.value === '' || regExAlpha.test(e.target.value)) {
														field.onChange(e);
													}
												}}
												className={errors.firstName ? 'is-invalid' : ''}
												placeholder={strings.Enter + strings.FirstName}
											/>
										)}
									/>
									{errors.firstName && (
										<div className="invalid-feedback">{errors.firstName.message}</div>
									)}
								</FormGroup>
							</Col>
							<Col md="4">
								<FormGroup>
									<Label htmlFor="middleName">{strings.MiddleName}</Label>
									<Controller
										name="middleName"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="text"
												maxLength="26"
												id="middleName"
												onChange={(e) => {
													if (e.target.value === '' || regExAlpha.test(e.target.value)) {
														field.onChange(e);
													}
												}}
												className={errors.middleName ? 'is-invalid' : ''}
												placeholder={strings.Enter + strings.MiddleName}
											/>
										)}
									/>
									{errors.middleName && (
										<div className="invalid-feedback">{errors.middleName.message}</div>
									)}
								</FormGroup>
							</Col>
							<Col md="4">
								<FormGroup>
									<Label htmlFor="lastName">
										<span className="text-danger">* </span>
										{strings.LastName}
									</Label>
									<Controller
										name="lastName"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="text"
												maxLength="26"
												id="lastName"
												onChange={(e) => {
													if (e.target.value === '' || regExAlpha.test(e.target.value)) {
														field.onChange(e);
													}
												}}
												className={errors.lastName ? 'is-invalid' : ''}
												placeholder={strings.Enter + strings.LastName}
											/>
										)}
									/>
									{errors.lastName && (
										<div className="invalid-feedback">{errors.lastName.message}</div>
									)}
								</FormGroup>
							</Col>
						</Row>
						<Row className="row-wrapper">
							<Col md="4">
								<FormGroup>
									<Label htmlFor="email">
										<span className="text-danger">* </span>
										{strings.Email}
									</Label>
									<Controller
										name="email"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="email"
												maxLength="80"
												id="email"
												className={errors.email ? 'is-invalid' : ''}
												placeholder={strings.Enter + strings.Email}
											/>
										)}
									/>
									{errors.email && (
										<div className="invalid-feedback">{errors.email.message}</div>
									)}
								</FormGroup>
							</Col>
							<Col md="4">
								<FormGroup>
									<Label htmlFor="mobileNumber">
										<span className="text-danger">* </span>
										{strings.MobileNumber}
									</Label>
									<Controller
										name="mobileNumber"
										control={control}
										render={({ field }) => (
											<PhoneInput
												enableSearch={true}
												country={'ae'}
												international
												value={field.value}
												onChange={(value) => {
													field.onChange(value);
													setMobileNumberError(value.length !== 12);
												}}
												className={errors.mobileNumber || mobileNumberError ? 'is-invalid' : ''}
											/>
										)}
									/>
									{(errors.mobileNumber || mobileNumberError) && (
										<div style={{ color: 'red' }}>
											{errors.mobileNumber?.message || 'Invalid mobile number'}
										</div>
									)}
								</FormGroup>
							</Col>
							<Col md="4">
								<FormGroup>
									<Label htmlFor="organizationName">{strings.OrganizationName}</Label>
									<Controller
										name="organizationName"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="text"
												maxLength="26"
												id="organizationName"
												onChange={(e) => {
													if (e.target.value === '' || regExAlpha.test(e.target.value)) {
														field.onChange(e);
													}
												}}
												className={errors.organizationName ? 'is-invalid' : ''}
												placeholder={strings.Enter + strings.OrganizationName}
											/>
										)}
									/>
									{errors.organizationName && (
										<div className="invalid-feedback">{errors.organizationName.message}</div>
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
									<Controller
										name="vatRegistrationNumber"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="text"
												maxLength="15"
												id="vatRegistrationNumber"
												onChange={(e) => {
													if (e.target.value === '' || regEx.test(e.target.value)) {
														field.onChange(e);
													}
												}}
												className={errors.vatRegistrationNumber ? 'is-invalid' : ''}
												placeholder={strings.Enter + strings.TaxRegistrationNumber}
											/>
										)}
									/>
									{errors.vatRegistrationNumber && (
										<div className="invalid-feedback">{errors.vatRegistrationNumber.message}</div>
									)}
									<div className="VerifyTRN">
										<br />
										<b>
											<a
												target="_blank"
												href="https://tax.gov.ae/en/default.aspx"
												style={{ color: '#2266d8' }}
											>
												{strings.VerifyTRN}
											</a>
										</b>
									</div>
								</FormGroup>
							</Col>
							<Col md="4">
								<FormGroup>
									<Label htmlFor="currencyCode">
										<span className="text-danger">* </span>
										{strings.Currency}
									</Label>
									<Controller
										name="currencyCode"
										control={control}
										render={({ field }) => (
											<Select
												options={
													currency_list
														? selectCurrencyFactory.renderOptions(
																'currencyName',
																'currencyCode',
																currency_list,
																'Currency'
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
															'Currency'
														)
														.find((option) => option.value === +field.value)
												}
												onChange={(option) => {
													if (option && option.value) {
														field.onChange(option.value);
													} else {
														field.onChange('');
													}
												}}
												placeholder={strings.Select + strings.Currency}
												id="currencyCode"
												className={errors.currencyCode ? 'is-invalid' : ''}
											/>
										)}
									/>
									{errors.currencyCode && (
										<div className="invalid-feedback">{errors.currencyCode.message}</div>
									)}
								</FormGroup>
							</Col>
						</Row>
						<Row>
							<Button
								className="mb-3 ml-2"
								onClick={() => handleShowDetails(true)}
								disabled={showDetails}
							>
								{strings.MoreDetails}
							</Button>
						</Row>
						{showDetails && (
							<div id="moreDetails">
								<Row className="row-wrapper">
									<Col md="4">
										<FormGroup>
											<Label htmlFor="poBoxNumber">{strings.POBoxNumber}</Label>
											<Controller
												name="poBoxNumber"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														type="text"
														maxLength="10"
														id="poBoxNumber"
														onChange={(e) => {
															if (e.target.value === '' || regExBoth.test(e.target.value)) {
																field.onChange(e);
															}
														}}
														className={errors.poBoxNumber ? 'is-invalid' : ''}
														placeholder={strings.Enter + strings.POBoxNumber}
													/>
												)}
											/>
											{errors.poBoxNumber && (
												<div className="invalid-feedback">{errors.poBoxNumber.message}</div>
											)}
										</FormGroup>
									</Col>
									<Col md="4">
										<FormGroup>
											<Label htmlFor="telephone">{strings.Telephone}</Label>
											<Controller
												name="telephone"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														maxLength="15"
														type="text"
														id="telephone"
														onChange={(e) => {
															if (e.target.value === '' || regEx.test(e.target.value)) {
																field.onChange(e);
															}
														}}
														className={errors.telephone ? 'is-invalid' : ''}
														placeholder={strings.Enter + strings.TelephoneNumber}
													/>
												)}
											/>
											{errors.telephone && (
												<div className="invalid-feedback">{errors.telephone.message}</div>
											)}
										</FormGroup>
									</Col>
									<Col md="4">
										<FormGroup>
											<Label htmlFor="postZipCode">{strings.PostZipCode}</Label>
											<Controller
												name="postZipCode"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														type="text"
														maxLength="10"
														id="postZipCode"
														onChange={(e) => {
															if (e.target.value === '' || regExBoth.test(e.target.value)) {
																field.onChange(e);
															}
														}}
														className={errors.postZipCode ? 'is-invalid' : ''}
														placeholder={strings.Enter + strings.PostZipCode}
													/>
												)}
											/>
											{errors.postZipCode && (
												<div className="invalid-feedback">{errors.postZipCode.message}</div>
											)}
										</FormGroup>
									</Col>
								</Row>
								<Row className="row-wrapper">
									<Col md="4">
										<FormGroup>
											<Label htmlFor="addressLine1">
												<span className="text-danger">* </span>
												{strings.AddressLine1}
											</Label>
											<Controller
												name="addressLine1"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														type="text"
														maxLength="200"
														id="addressLine1"
														onChange={(e) => {
															if (e.target.value === '' || regExAddress.test(e.target.value)) {
																field.onChange(e);
															}
														}}
														className={errors.addressLine1 ? 'is-invalid' : ''}
														placeholder={strings.Enter + strings.AddressLine1}
													/>
												)}
											/>
											{errors.addressLine1 && (
												<div className="invalid-feedback">{errors.addressLine1.message}</div>
											)}
										</FormGroup>
									</Col>
									<Col md="4">
										<FormGroup>
											<Label htmlFor="addressLine2">
												<span className="text-danger">* </span>
												{strings.AddressLine2}
											</Label>
											<Controller
												name="addressLine2"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														type="text"
														maxLength="200"
														id="addressLine2"
														onChange={(e) => {
															if (e.target.value === '' || regExAddress.test(e.target.value)) {
																field.onChange(e);
															}
														}}
														className={errors.addressLine2 ? 'is-invalid' : ''}
														placeholder={strings.Enter + strings.AddressLine2}
													/>
												)}
											/>
											{errors.addressLine2 && (
												<div className="invalid-feedback">{errors.addressLine2.message}</div>
											)}
										</FormGroup>
									</Col>
									<Col md="4">
										<FormGroup>
											<Label htmlFor="addressLine3">
												<span className="text-danger">* </span>
												{strings.AddressLine3}
											</Label>
											<Controller
												name="addressLine3"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														type="text"
														maxLength="200"
														id="addressLine3"
														onChange={(e) => {
															if (e.target.value === '' || regExAddress.test(e.target.value)) {
																field.onChange(e);
															}
														}}
														className={errors.addressLine3 ? 'is-invalid' : ''}
														placeholder={strings.Enter + strings.AddressLine3}
													/>
												)}
											/>
											{errors.addressLine3 && (
												<div className="invalid-feedback">{errors.addressLine3.message}</div>
											)}
										</FormGroup>
									</Col>
								</Row>
								<Row className="row-wrapper">
									<Col md="4">
										<FormGroup>
											<Label htmlFor="countryId">
												<span className="text-danger">* </span>
												{strings.Country}
											</Label>
											<Controller
												name="countryId"
												control={control}
												render={({ field }) => (
													<Select
														options={
															country_list
																? selectOptionsFactory.renderOptions(
																		'countryName',
																		'countryCode',
																		country_list,
																		'Country'
																  )
																: []
														}
														value={
															country_list &&
															selectOptionsFactory
																.renderOptions(
																	'countryName',
																	'countryCode',
																	country_list,
																	'Country'
																)
																.find((option) => option.value === field.value)
														}
														onChange={(option) => {
															if (option && option.value) {
																field.onChange(option.value);
															} else {
																field.onChange('');
															}
															setValue('stateId', '');
														}}
														placeholder={strings.Select + strings.Country}
														id="countryId"
														className={errors.countryId ? 'is-invalid' : ''}
													/>
												)}
											/>
											{errors.countryId && (
												<div className="invalid-feedback">{errors.countryId.message}</div>
											)}
										</FormGroup>
									</Col>
									<Col md="4">
										<FormGroup>
											<Label htmlFor="stateId">
												<span className="text-danger">* </span>
												{strings.StateRegion}
											</Label>
											<Controller
												name="stateId"
												control={control}
												render={({ field }) => (
													<Select
														options={
															stateList
																? selectOptionsFactory.renderOptions(
																		'label',
																		'value',
																		stateList,
																		'State'
																  )
																: []
														}
														value={
															stateList &&
															selectOptionsFactory
																.renderOptions('label', 'value', stateList, 'State')
																.find((option) => option.value === field.value)
														}
														onChange={(option) => {
															if (option && option.value) {
																field.onChange(option.value);
															} else {
																field.onChange('');
															}
														}}
														placeholder={strings.Select + strings.StateRegion}
														id="stateId"
														className={errors.stateId ? 'is-invalid' : ''}
													/>
												)}
											/>
											{errors.stateId && (
												<div className="invalid-feedback">{errors.stateId.message}</div>
											)}
										</FormGroup>
									</Col>
									<Col md="4">
										<FormGroup>
											<Label htmlFor="city">
												<span className="text-danger"></span>
												{strings.City}
											</Label>
											<Controller
												name="city"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														value={field.value}
														onChange={(e) => {
															if (e.target.value === '' || regExAlpha.test(e.target.value)) {
																field.onChange(e);
															}
														}}
														placeholder={strings.Location}
														id="city"
														type="text"
														maxLength="20"
														className={errors.city ? 'is-invalid' : ''}
													/>
												)}
											/>
											{errors.city && (
												<div className="invalid-feedback">{errors.city.message}</div>
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
											<Controller
												name="billingEmail"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														type="text"
														maxLength="80"
														id="billingEmail"
														className={errors.billingEmail ? 'is-invalid' : ''}
														placeholder={strings.Enter + strings.BillingEmail}
													/>
												)}
											/>
											{errors.billingEmail && (
												<div className="invalid-feedback">{errors.billingEmail.message}</div>
											)}
										</FormGroup>
									</Col>
									<Col md="4">
										<FormGroup>
											<Label htmlFor="contractPoNumber">{strings.ContractPONumber}</Label>
											<Controller
												name="contractPoNumber"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														type="text"
														maxLength="10"
														id="contractPoNumber"
														onChange={(e) => {
															if (e.target.value === '' || regEx.test(e.target.value)) {
																field.onChange(e);
															}
														}}
														className={errors.contractPoNumber ? 'is-invalid' : ''}
														placeholder={strings.Enter + strings.ContractPONumber}
													/>
												)}
											/>
											{errors.contractPoNumber && (
												<div className="invalid-feedback">
													{errors.contractPoNumber.message}
												</div>
											)}
										</FormGroup>
									</Col>
								</Row>
								<Row>
									<ShadButton
										variant="ghost"
										size="icon"
										onClick={() => handleShowDetails(false)}
										type="button"
									>
										<ChevronUp className="h-4 w-4" />
									</ShadButton>
								</Row>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button
							color="primary"
							type="submit"
							className="btn-square"
							disabled={disabled || isSubmitting}
						>
							<i className="fa fa-dot-circle-o"></i>{' '}
							{disabled ? 'Creating...' : strings.Create}
						</Button>
						&nbsp;
						<Button
							color="secondary"
							className="btn-square"
							onClick={() => {
								closeCustomerModal(false);
							}}
						>
							<i className="fa fa-ban"></i> {strings.Cancel}
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</div>
	);
};

export default CustomerModal;
