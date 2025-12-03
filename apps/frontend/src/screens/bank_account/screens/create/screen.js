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
} from 'reactstrap';
import Select from 'react-select';
import { LeavePage, Loader } from 'components';
import _ from 'lodash';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import { CommonActions } from 'services/global';
import * as createBankAccountActions from './actions';
import DatePicker from 'react-datepicker';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import './style.scss';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		account_type_list: state.bank_account.account_type_list,
		currency_list: state.bank_account.currency_list,
		country_list: state.bank_account.country_list,
		currency_convert_list: state.common.currency_convert_list,
	};
};
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

const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
		createBankAccountActions: bindActionCreators(
			createBankAccountActions,
			dispatch,
		),
	};
};

let strings = new LocalizedStrings(data)
class CreateBankAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// country_list: [
			// 	{
			// 		countryCode: 229,
			// 		countryDescription: null,
			// 		countryFullName: 'United Arab Emirates - (null)',
			// 		countryName: 'United Arab Emirates',
			// 		createdBy: 0,
			// 		createdDate: '2020-03-21T05:55:16.000+0000',
			// 		currencyCode: null,
			// 		defaltFlag: 'Y',
			// 		deleteFlag: false,
			// 		isoAlpha3Code: null,
			// 		lastUpdateBy: null,
			// 		lastUpdateDate: null,
			// 		orderSequence: null,
			// 		versionNumber: 1,
			// 	},
			// 	{
			// 		countryCode: 101,
			// 		countryDescription: null,
			// 		countryFullName: 'India  - (null)',
			// 		countryName: 'India',
			// 		createdBy: 0,
			// 		createdDate: '2020-03-21T05:55:16.000+0000',
			// 		currencyCode: null,
			// 		defaltFlag: 'Y',
			// 		deleteFlag: false,
			// 		isoAlpha3Code: null,
			// 		lastUpdateBy: null,
			// 		lastUpdateDate: null,
			// 		orderSequence: null,
			// 		versionNumber: 1,
			// 	},
			// ],
			loading: false,
			createMore: false,
			disabled: false,
			initialVals: {
				account_name: '',
				currency: 150,
				opening_balance: '',
				account_type: 2,
				bank_name: '',
				account_number: '',
				ifsc_code: '',
				swift_code: '',
				countrycode: 229,
				openingDate: new Date(),
				account_is_for: '',
				bankId:'',
				newBankName:''
			},
			BankList: [],
			currentData: {},
			language: window['localStorage'].getItem('language'),
			loadingMsg:"Loading...",
			disableLeavePage:false, 
		};
		this.formRef = React.createRef();
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9_ ]+$/;
		this.ifscCode = /[a-zA-Z0-9]+$/;
		this.swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		this.account_for = [
			{ label: 'Personal', value: 'Personal' },
			{ label: 'Corporate', value: 'Corporate' },
		];
	}

	componentDidMount = () => {
		this.initializeData();
		this.props.createBankAccountActions.getBankList()
            .then((response) => {
            	this.setState({bankList:response.data
            });
          });
	};

	initializeData = () => {
		this.props.createBankAccountActions.getAccountTypeList();
		this.props.commonActions.getCurrencyConversionList().then((response) => {
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						currency: response.data
							? parseInt(response.data[0].currencyCode)
							: '',
					},
				},
			});
		});
		this.props.createBankAccountActions.getCurrencyList().then((response) => {
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						currency: response.data
							? parseInt(response.data[0].currencyCode)
							: '',
					},
					...{
						account_is_for: 'Corporate',
					},
				},
			});
		
			this.formRef.current.setFieldValue('account_is_for', 'Corporate', true);
		});
		this.props.createBankAccountActions.getCountryList();
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 5,
			name: value,
		};
		this.props.createBankAccountActions
			.checkValidation(data)
			.then((response) => {
				if (response.data === 'Bank Account Already Exists') {
					this.setState({
						exist: true,
					});
				} else {
					this.setState({
						exist: false,
					});
				}
			});
	};

	handleChange = (e, name) => {
		this.setState({
			currentData: _.set(
				{ ...this.state.currentData },
				e.target.name && e.target.name !== '' ? e.target.name : name,
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
			),
		});
	};

	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		const {
			account_name,
			currency,
			opening_balance,
			account_type,
			bank_name,
			account_number,
			ifsc_code,
			swift_code,
			countrycode,
			account_is_for,
			openingDate,
			bankId,
			newBankName
		} = data;
		let obj = {
			bankAccountName: account_name,
			bankAccountCurrency: currency ? currency : '',
			openingBalance: opening_balance,
			openingDate: openingDate ? openingDate : null,
			bankAccountType: account_type ? account_type : '',
			bankName: bankId && bankId.label ? bankId.label : "",
			accountNumber: account_number,
			ifscCode: ifsc_code,
			swiftCode: swift_code,
			bankCountry: countrycode ? countrycode : '',
			personalCorporateAccountInd: account_is_for ? account_is_for : '',
			newBankName: newBankName,
			// bankId:bankId ? bankId : "",
		};
		this.setState({ loading:true, disableLeavePage:true, loadingMsg:"Creating New Bank Account..."});
		this.props.createBankAccountActions
			.createBankAccount(obj)
			.then((res) => {
				this.setState({ disabled: false });
				this.setState({ loading:false});
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'New Bank Account Created Successfully.',
				);
				if (this.state.createMore) {
					this.setState({
						createMore: false,
						disableLeavePage:false,
					});
					this.initializeData();
					resetForm(this.state.initialVals);
				} else {
					this.props.history.push('/admin/banking/bank-account');
					this.setState({ loading:false,});
					
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data? err.data.message: 'New Bank Account Created Unsuccessfully'
				);
			});
	};


	render() {
		strings.setLanguage(this.state.language);
		const { account_type_list, currency_list,currency_convert_list, country_list } = this.props;

		const { initialVals ,bankList,loading,loadingMsg} = this.state;
		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
			<div>
			<div className="create-bank-account-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fas fa-university" />
												<span className="ml-2">{strings.CreateBankAccount}</span>
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
												initialValues={initialVals}
												ref={this.formRef}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validate={(values) => {
													let errors = {};
													if (this.state.exist === true) {
														errors.account_number =
															'Account number already exists';
													}
													if(!values.openingDate){
														errors.openingDate='Opening date is required';
													}
													if(values.bankId.value === 999 && (values.newBankName === null || values.newBankName === '')){
														errors.newBankName = 'Bank Name is Required';
													}
													return errors;
												}}
												validationSchema={Yup.object().shape({
													account_name: Yup.string()
														.required('Account name is required')
														.min(2, 'Account name is too short!'),
														// .max(, 'Account Name Is Too Long!'),
													opening_balance: Yup.string().required(
														'Opening balance is required',
													),
													openingDate: Yup.date().required(
														'Opening date is required',
													),
													currency: Yup.string().required(
														'Currency is required',
													),
													account_type: Yup.string().required(
														'Account type is required',
													),
													// bank_name: Yup.string()
													// 	.required('Bank Name is Required')
													// 	.min(2, 'Bank Name Is Too Short!')
													// 	.max(30, 'Bank Name Is Too Long!'),
													bankId: Yup.string().required('Bank name is required') ,
													account_number: Yup.string()
														.required('Account number is required')
														.min(2, 'Account number is too short!')
														.max(30, 'Account number is too long!'),
													account_is_for: Yup.string().required(
														'Account for is required',
													),
													// swift_code: Yup.string().required(
													// 	'Please Enter Valid Swift Code',
													// ),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>
														<Row>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="account_name">
																		<span className="text-danger">* </span>
																		{strings.AccountName}
																	</Label>
																	<Input
																		type="text"
																		maxLength="100"
																		id="account_name"
																		autoComplete="off"
																		name="account_name"
																		placeholder={strings.Enter+strings.AccountName}
																		value={props.values.account_name}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExAlpha.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('account_name')(
																					option,
																				);
																			}
																		}}
																		className={
																			props.errors.account_name &&
																			props.touched.account_name
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.account_name &&
																		props.touched.account_name && (
																			<div className="invalid-feedback">
																				{props.errors.account_name}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="currency">
																		<span className="text-danger">* </span>
																		{strings.Currency}
																	</Label>
																	<Select
																		id="currency"
																		name="currency"
																		placeholder={strings.Select+strings.Currency}
																		options={
																			currency_convert_list
																				? selectCurrencyFactory.renderOptions(
																						'currencyName',
																						'currencyCode',
																						currency_convert_list,
																						'Currency',
																				  )
																				: []
																		}
																		value={
																			currency_convert_list &&
																			selectCurrencyFactory
																				.renderOptions(
																					'currencyName',
																					'currencyCode',
																					currency_convert_list,
																					'Currency',
																				)
																				.find(
																					(option) =>
																						option.value ===
																						+props.values.currency,
																				)
																		}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('currency')(
																					option.value,
																				);
																			} else {
																				props.handleChange('currency')('');
																			}
																		}}
																		className={
																			props.errors.currency &&
																			props.touched.currency
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.currency &&
																		props.touched.currency && (
																			<div className="invalid-feedback">
																				{props.errors.currency}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="opening_balance">
																		<span className="text-danger">* </span>
																		{strings.OpeningBalance}
																	</Label>
																	<Input
																		type="type"
																		maxLength="14,2"
																		id="opening_balance"
																		autoComplete="off"
																		name="opening_balance"
																		placeholder={strings.Enter+strings.OpeningBalance}
																		value={props.values.opening_balance}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regDecimal.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('opening_balance')(
																					option,
																				);
																			}
																		}}
																		className={
																			props.errors.opening_balance &&
																			props.touched.opening_balance
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.opening_balance &&
																		props.touched.opening_balance && (
																			<div className="invalid-feedback">
																				{props.errors.opening_balance}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<Row>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="expense_date">
																		<span className="text-danger">* </span>
																		{strings.OpeningDate}
																	</Label>
																	<DatePicker
																		id="date"
																		name="openingDate"
																		autoComplete="off"
																		className={`form-control ${
																			props.errors.openingDate &&
																			props.touched.openingDate
																				? 'is-invalid'
																				: ''
																		}`}
																		popperPlacement="bottom-start"
																		popperModifiers={{
																			flip: {
																				behavior: ['bottom'],
																			},
																			preventOverflow: {
																				enabled: false,
																			},
																			hide: {
																				enabled: false,
																			},
																		}}
																		placeholderText={strings.Select+strings.OpeningDate}
																		selected={props.values.openingDate}
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd-MM-yyyy"
																		maxDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('openingDate')(value);
																		}}
																	/>
																	{props.errors.openingDate &&
																		props.touched.openingDate && (
																			<div className="invalid-feedback">
																				{props.errors.openingDate.includes("nullable()") ? "Opening date is required" :props.errors.openingDate}

																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="account_type">
																		<span className="text-danger">* </span>
																		{strings.AccountType}
																	</Label>
																	<Select
																		id="account_type"
																		name="account_type"
																		autoComplete="off"
																		options={
																			account_type_list
																				? selectOptionsFactory.renderOptions(
																						'name',
																						'id',
																						account_type_list,
																						'Account Type',
																				  )
																				: []
																		}
																		value={
																			account_type_list &&
																			selectOptionsFactory
																				.renderOptions(
																					'name',
																					'id',
																					account_type_list,
																					'Account Type',
																				)
																				.find(
																					(option) =>
																						option.value ===
																						+props.values.account_type,
																				)
																		}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('account_type')(
																					option.value,
																				);
																			} else {
																				props.handleChange('account_type')('');
																			}
																		}}
																		className={
																			props.errors.account_type &&
																			props.touched.account_type
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.account_type &&
																		props.touched.account_type && (
																			<div className="invalid-feedback">
																				{props.errors.account_type}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<hr />
														<Row>
														<Col md="4">
                                                                                                <FormGroup>
                                                                                                <Label htmlFor="select"><span className="text-danger">* </span> {strings.BankName} </Label>
                                                                                                    <Select

                                                                                                        options={
                                                                                                            bankList
                                                                                                                ? selectOptionsFactory.renderOptions(
                                                                                                                    'bankName',
                                                                                                                    'bankId',
                                                                                                                    bankList,
                                                                                                                    'Bank',
                                                                                                                )
                                                                                                                : []
                                                                                                        }
                                                                                                        value={props.values.bankId}
                                                                                                        onChange={(option) => {
                                                                                                            if (option && option.value) {
                                                                                                                props.handleChange('bankId')(option);
                                                                                                            } else {
                                                                                                                props.handleChange('bankId')('');
                                                                                                            }
                                                                                                        }}
                                                                                                        placeholder={strings.Select+strings.BankName}
                                                                                                        id="bankId"
                                                                                                        name="bankId"
																										autoComplete="off"
                                                                                                        className={
                                                                                                            props.errors.bankId &&
                                                                                                                props.touched.bankId
                                                                                                                ? 'is-invalid'
                                                                                                                : ''
                                                                                                        }
                                                                                                    />
                                                                                                    {props.errors.bankId &&
                                                                                                        props.touched.bankId && (
                                                                                                            <div className="invalid-feedback">
                                                                                                                {props.errors.bankId}
                                                                                                            </div>
                                                                                                        )}
                                                                                                </FormGroup>
                                                                                            </Col>
															{/* <Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="bank_name">
																		<span className="text-danger">* </span>{strings.BankName}
																	</Label>
																	<Input
																		type="text"
																		maxLength="100"
																		id="bank_name"
																		name="bank_name"
																		placeholder={strings.Enter+strings.BankName}
																		value={props.values.bank_name}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExBoth.test(option.target.value)
																			) {
																				props.handleChange('bank_name')(option);
																			}
																		}}
																		className={
																			props.errors.bank_name &&
																			props.touched.bank_name
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.bank_name &&
																		props.touched.bank_name && (
																			<div className="invalid-feedback">
																				{props.errors.bank_name}
																			</div>
																		)}
																</FormGroup>
															</Col> */}
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="account_number">
																		<span className="text-danger">* </span>
																		{strings.AccountNumber}
																	</Label>
																	<Input
																		type="text"
																		maxLength="25"
																		id="account_number"
																		autoComplete="Off"
																		name="account_number"
																		placeholder={strings.Enter+strings.AccountNumber}
																		value={props.values.account_number}
																	    //onBlur={props.handleBlur('account_number')}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regEx.test(option.target.value)
																			) {
																				props.handleChange('account_number')(
																					option,
																				);
																			}
																			this.validationCheck(option.target.value);
																		}}
																		className={
																			props.errors.account_number &&
																			props.touched.account_number
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.account_number &&
																		props.touched.account_number && (
																			<div className="invalid-feedback">
																				{props.errors.account_number}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="countrycode">{strings.Country}</Label>
																	<Select
																		styles={customStyles}
																		id="countrycode"
																		name="countrycode"
																		placeholder={strings.Select+strings.Country}
																		// getOptionValue={(option) =>
																		// 	option.countrycode
																		// }
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
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('countrycode')(
																					option.value,
																				);
																			} else {
																				props.handleChange('countrycode')('');
																			}
																		}}
																		value={
																			country_list &&
																			selectOptionsFactory
																				.renderOptions(
																					'countryName',
																					'countryCode',
																					country_list,
																					'Country',
																				)
																				.find(
																					(option) =>
																						option.value ===
																						+props.values.countrycode,
																				)
																		}
																		className={
																			props.errors.countrycode &&
																			props.touched.countrycode
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.countrycode &&
																		props.touched.countrycode && (
																			<div className="invalid-feedback">
																				{props.errors.countrycode}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<Row>
															{/* <Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="ifsc_code">
																		IFSC Code
																		<i
																			id="IFSCcodeToolTip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="IFSCcodeToolTip"
																		>
																			<p>
																				{' '}
																				IFSC code – 11-digit unique bank branch
																				identifier code And Should be in capital
																				and numbers{' '}
																			</p>
																		</UncontrolledTooltip>
																	</Label>
																	<Input
																		type="text"
																		maxLength="11"
																		id="ifsc_code"
																		name="ifsc_code"
																		placeholder="Enter IFSC Code"
																		value={props.values.ifsc_code}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.ifscCode.test(option.target.value)
																			) {
																				props.handleChange('ifsc_code')(
																					option.target.value.toUpperCase(),
																				);
																			}
																		}}
																		className={
																			props.errors.ifsc_code &&
																			props.touched.ifsc_code
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.ifsc_code &&
																		props.touched.ifsc_code && (
																			<div className="invalid-feedback">
																				{props.errors.ifsc_code}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="swift_code">
																		{/* <span className="text-danger">* </span> */}
															{/* 	Swift Code
																		<i
																			id="SwiftCodeToolTip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="SwiftCodeToolTip"
																		>
																			<p> Swift Code - Bank identifier code </p>
																		</UncontrolledTooltip>
																	</Label>
																	<Input
																		type="text"
																		maxLength="11"
																		id="swift_code"
																		name="swift_code"
																		placeholder="Enter Swift Code"
																		value={props.values.swift_code}
																		onChange={props.handleChange}
																		className={
																			props.errors.swift_code &&
																			props.touched.swift_code
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.swift_code &&
																		props.touched.swift_code && (
																			<div className="invalid-feedback">
																				{props.errors.swift_code}
																			</div>
																		)}
																</FormGroup>
															</Col> */}
														</Row>
														<Row>
															{props.values.bankId.value === 999 && (
																<Col lg={4}>
																	<FormGroup className="mb-3">
																	<Label>
																		<span className="text-danger">* </span>
																		{strings.AddNewBank}
																	</Label>
																	<Input
																		type="text"
																		maxLength="25"
																		id="newBankName"
																		name="newBankName"
																		placeholder={`${strings.Enter} ${strings.New} ${strings.BankName}`}
																		value={props.values.AddNewBank}
																		onChange={props.handleChange('newBankName')}
																		className={
																		props.errors.newBankName && props.touched.newBankName ? 'is-invalid' : ''
																		}
																	/>
																	{props.errors.newBankName && props.touched.newBankName && (
																		<div className="invalid-feedback">
																		{props.errors.newBankName}
																		</div>
																	)}
																	</FormGroup>
																</Col>
															)}
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="account_is_for">
																		<span className="text-danger">* </span>
																		{strings.Accountisfor}
																	</Label>
																	<Select
																		id="account_is_for"
																		name="account_is_for"
																		options={
																			this.account_for
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						this.account_for,
																						'Account is for',
																				  )
																				: []
																		}
																		value={
																			this.account_for &&
																			selectOptionsFactory
																				.renderOptions(
																					'label',
																					'value',
																					this.account_for,
																					'Account is for',
																				)
																				.find(
																					(option) =>
																						option.value ===
																						props.values.account_is_for,
																				)
																		}
																		onChange={(option) => {
																			if (option && option.value) {
																				props.handleChange('account_is_for')(
																					option.value,
																				);
																			} else {
																				props.handleChange('account_is_for')(
																					'',
																				);
																			}
																		}}
																		className={
																			props.errors.account_is_for &&
																			props.touched.account_is_for
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.account_is_for &&
																		props.touched.account_is_for && (
																			<div className="invalid-feedback">
																				{props.errors.account_is_for}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<Row>
															<Col lg={12}>
																<FormGroup className="text-right mt-5 form-action-btn">
																	<Button
																		type="submit"
																		name="submit"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			//  added validation popup  msg                                                                
																			props.handleBlur();
																			if(props.errors &&  Object.keys(props.errors).length != 0)
																			this.props.commonActions.fillManDatoryDetails();
																		}}
																	>
																		<i className="fa fa-dot-circle-o"></i>{' '}
																		{this.state.disabled
																			? 'Creating...'
																			: strings.Create}
																	</Button>
																	<Button
																		type="button"
																		name="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => { 
																			//  added validation popup  msg                                                                
																			props.handleBlur();
																			if(props.errors &&  Object.keys(props.errors).length != 0)
																			this.props.commonActions.fillManDatoryDetails();
																			this.setState(
																				{ createMore: true },
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-refresh"></i>
																		{this.state.disabled
																			? ' Creating...'
																			: strings.CreateandMore}
																	</Button>
																	<Button
																		type="button"
																		name="button"
																		color="secondary"
																		className="btn-square"
																		onClick={() => {
																			this.props.history.push(
																				'/admin/banking/bank-account',
																			);
																		}}
																	>
																		<i className="fa fa-ban"></i> {strings.Cancel}
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
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateBankAccount);
