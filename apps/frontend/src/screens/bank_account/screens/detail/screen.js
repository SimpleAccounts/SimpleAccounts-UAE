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
import _ from 'lodash';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Loader, ConfirmDeleteModal ,LeavePage} from 'components';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import { CommonActions } from 'services/global';
import * as detailBankAccountActions from './actions';
import * as BankAccountActions from '../../actions';
import './style.scss';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		account_type_list: state.bank_account.account_type_list,
		currency_list: state.bank_account.currency_list,
		country_list: state.bank_account.country_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		bankAccountActions: bindActionCreators(BankAccountActions, dispatch),
		detailBankAccountActions: bindActionCreators(
			detailBankAccountActions,
			dispatch,
		),
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

let strings = new LocalizedStrings(data);
class DetailBankAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading:false,
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
			dialog: null,
			disabled: false,
			disabledDate: true,
			disabled1: false,
			current_bank_account_id: null,
			current_bank_account: null,
			exist: false,
			initialVals: null,
			currentData: {},
			loadingMsg:"Loading...",
			disableLeavePage:false, 
			bankList:[]
		};

		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9_ ]+$/;
		this.ifscCode = /[a-zA-Z0-9]+$/;
		this.swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

		this.account_for = [
			{ label: 'Personal', value: 'P' },
			{ label: 'Corporate', value: 'C' },
		];
	}

	componentDidMount = () => {
		if (this.props.location.state && this.props.location.state.bankAccountId) {
			this.initializeData();
			// this.checkvalid();
			this.props.detailBankAccountActions.getTransactionsCountByBankId(this.props.location.state.bankAccountId)
				.then((res) => {
				
					if(res.status===200){
						if (res.data === 0) {
							this.setState({ disabledDate: false })
						}
					}
				})
			this.updateOpeningBalance(this.props.location.state.bankAccountId);

			this.setState(
				{
					current_bank_account_id: this.props.location.state.bankAccountId,
				},
				() => {
					this.props.detailBankAccountActions
						.getBankAccountByID(this.state.current_bank_account_id)
						.then((res) => {
							this.setState({
								current_bank_account: res,
								newBankName: '',
								initialVals: {
									account_name: res.bankAccountName,
									currency: res.bankAccountCurrency
										? res.bankAccountCurrency
										: '',
									opening_balance: res.openingBalance,
									account_type: res.bankAccountType ? res.bankAccountType : '',
									bank_name: res.bankName,
									account_number: res.accountNumber,
									ifsc_code: res.ifscCode,
									swift_code: res.swiftCode,
									countryId: res.bankCountry ? res.bankCountry : '',
									account_is_for: res.personalCorporateAccountInd
										? res.personalCorporateAccountInd
										: '',
									openingDate: moment(res.openingDate).format('DD-MM-YYYY'),
									transactionCount: res.transactionCount,
								},
							});
						})
						.catch((err) => {
							this.props.commonActions.tostifyAlert(
								'error',
								err && err.data ? err.data.message : 'Something Went Wrong',
							);
							this.props.history.push('/admin/banking/bank-account');
						});
				},
			);
		} else {
			this.props.history.push('/admin/banking/bank-account');
		}
	};


	initializeData = () => {
		this.props.detailBankAccountActions.getAccountTypeList();
		this.props.detailBankAccountActions.getCurrencyList();
		this.props.detailBankAccountActions.getCountryList();
		this.props.detailBankAccountActions.getBankList()
        .then((response) => {
            this.setState({bankList:response.data
        });
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

	handleSubmit = (data) => {
		this.setState({ disabled: true });
		let obj = {
			bankAccountId: this.state.current_bank_account_id,
			bankAccountName: data.account_name,
			bankAccountCurrency: data.currency,
			personalCorporateAccountInd: data.account_is_for,
			// bankName: data.bank_name,
			bankName:data.bank_name && data.bank_name.label ?data.bank_name.label :data.bank_name,
			accountNumber: data.account_number,
			ifscCode: data.ifsc_code,
			swiftCode: data.swift_code,
			openingBalance: data.opening_balance,
			//openingDate: data.openingDate,
			bankCountry: data.countryId,
			bankAccountType: data.account_type,
			newBankName: data.newBankName,
		};
		this.setState({ loading:true, disableLeavePage:true,loadingMsg:"Updating Bank Account Details..."});
		this.props.detailBankAccountActions
			.updateBankAccount(obj)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Bank Account Details Updated Successfully',
					);
					this.props.history.push('/admin/banking/bank-account');
					this.setState({ loading:false,});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Bank Account Details Updated Unsuccessfully',
				);
			});
	};

	closeBankAccount = (current_bank_account_id) => {
		this.props.bankAccountActions
			.getExplainCount(current_bank_account_id)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to unexplain all the transaction to delete this bank',
					);
				} else {
					const message1 =
						<text>
							<b>Delete Bank Account?</b>
						</text>
					const message = 'This Bank Account will be deleted permanently and cannot be recovered.';
					this.setState({
						dialog: (
							<ConfirmDeleteModal
								isOpen={true}
								okHandler={() => this.removeBankAccount(current_bank_account_id)}
								cancelHandler={this.removeDialog}
								message1={message1}
								message={message}
							/>
						),
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	removeBankAccount = () => {
		this.setState({ disabled1: true });
		let { current_bank_account_id } = this.state;
		this.removeDialog();
		this.setState({ loading:true, loadingMsg:"Deleting Bank Account ..."});
		this.props.detailBankAccountActions
			.removeBankAccountByID(current_bank_account_id)
			.then((res) => {
				this.setState({ disabled1: false });
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Bank Account Deleted Successfully',
				);
				this.props.history.push('/admin/banking/bank-account');
				this.setState({ loading:false,});
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Bank Account Deleted Unsuccessfully',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};
	validationCheck = (value) => {
		const data = {
			moduleType: 17,
			name: value,
			checkId:this.state.current_bank_account_id,
		};
		this.props.detailBankAccountActions
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
	updateOpeningBalance = (_id) => {
		this.props.bankAccountActions
			.getExplainCount(_id)
			.then((res) => {				
				this.setState({ transactionCount: res.data });
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { account_type_list, currency_list, country_list } = this.props;

		const { initialVals, current_bank_account, dialog, current_bank_account_id ,bankList,loading,loadingMsg} = this.state;

		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
			<div>
			<div className="detail-bank-account-screen">
				<div className="animated fadeIn">
					{dialog}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fas fa-university" />
										<span className="ml-2">
											{strings.UpdateBankAccount}{' '}
											{current_bank_account
												? ` - ${current_bank_account.bankAccountName}`
												: ''}
										</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
						{dialog}
									{loading ? (
										<Loader />
									) : (
							<Row>
								<Col lg={12}>
									{initialVals ? (
										<Formik
											initialValues={initialVals}
											onSubmit={(values, { resetForm }) => {
												this.handleSubmit(values);
											}}
											validate={(values) => {
												let errors = {};
												if (this.state.exist === true) {
													errors.account_number =
														'Account number already exists';
												}
												if(values.bank_name === 'Others' && (values.newBankName === null || values.newBankName === '')){
													errors.newBankName = 'Bank Name is Required';
												}
												return errors;
											}}
											validationSchema={Yup.object().shape({
												account_name: Yup.string()
													.required('Account name is required')
													.min(2, 'Account name is too short!')
													.max(30, 'Account name is too long!'),
												opening_balance: Yup.string().required(
													'Opening balance is required',
												),
												currency: Yup.string().required('Currency is required'),
												account_type: Yup.string().required(
													'Account type is required',
												),
												// bank_name: Yup.string()
												// 	.required('Bank Name is Required')
												// 	.min(2, 'Bank Name Is Too Short!')
												// 	.max(50, 'Bank Name Is Too Long!'),
												bank_name: Yup.string().required('Bank name is required') ,
												account_number: Yup.string()
													.required('Account number is required')
													.min(2, 'Account number is too short!')
													.max(25, 'Account number is too long!'),
												account_is_for: Yup.string().required(
													'Account for is required',
												),
											})}
										>
											{(props) => (
												<Form onSubmit={props.handleSubmit}>
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="account_name">
																	<span className="text-danger">* </span>{strings.AccountName}
																</Label>
																<Input
																    disabled
																	type="text"
																	maxLength="100"
																	id="account_name"
																	autoComplete="Off"
																	name="account_name"
																	placeholder={strings.Enter + strings.AccountName}
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
																	<span className="text-danger">* </span>{strings.Currency}
																</Label>
																<Select
																	id="currency"
																	name="currency"
																	isDisabled
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
																	<span className="text-danger">* </span>{strings.OpeningBalance}
																</Label>
																<Input
																	type="text"
																	maxLength="14,2"
																	id="opening_balance"
																	name="opening_balance"
																	// readOnly={
																	// 	this.state.transactionCount > 0
																	// 		? true
																	// 		: false
																	// }
																	placeholder={strings.Enter + strings.OpeningBalance}
																	value={props.values.opening_balance}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regEx.test(option.target.value)
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
																<Label htmlFor="opening_date">
																	<span className="text-danger">* </span>
																	{strings.OpeningDate}
																</Label>
															

																<DatePicker
																	id="date"
																	name="openingDate"
																	className={`form-control ${props.errors.openingDate &&
																			props.touched.openingDate
																			? 'is-invalid'
																			: ''
																		}`}
																	
																	value={props.values.openingDate}
																	showMonthDropdown
																	showYearDropdown
																	disabled={this.state.disabledDate}
																	dropdownMode="select"
																	dateFormat="dd-MM-yyyy"
																	 //maxDate={new Date()}
																	// onChange={(value) => {
																	
																	// 	props.handleChange('openingDate')(value);
																	// }}

																	onChange={(value) => {
																		props.handleChange('openingDate')(
																			moment(value).format('DD-M-/YYYY'),
																		);
																	
																	}}
																/>
																{props.errors.openingDate &&
																	props.touched.openingDate && (
																		<div className="invalid-feedback">
																			{props.errors.openingDate}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="">
																<Label htmlFor="account_type">
																	<span className="text-danger">* </span>
																	{strings.AccountType}
																</Label>
																<Select
																	id="account_type"
																	name="account_type"
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
																					props.values.account_type,
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
                                                                                                        // value={props.values.bank_name}
                                                                                                        value={bankList &&
                                                                                                            selectOptionsFactory
                                                                                                                .renderOptions(
                                                                                                                    'bankName',
                                                                                                                    'bankId',
                                                                                                                    bankList,
                                                                                                                    'Bank',
                                                                                                                )
                                                                                                                .find(
                                                                                                                    (option) =>
                                                                                                                        option.label ===
                                                                                                                        props.values.bank_name,
                                                                                                                )}
                                                                                                        onChange={(option) => {
                                                                                                            if (option && option.value) {
                                                                                                                props.handleChange('bank_name')(option);
                                                                                                            } else {
                                                                                                                props.handleChange('bank_name')('');
                                                                                                            }
                                                                                                        }}
                                                                                                        placeholder={strings.Select+strings.BankName}
                                                                                                        id="bank_name"
                                                                                                        name="bank_name"
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
                                                                                            </Col>
														{/* <Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="bank_name">
																	<span className="text-danger">* </span>{strings.BankName}
																</Label>
																<Input
																	type="text"
																	id="bank_name"
																	name="bank_name"
																	placeholder={strings.Enter + strings.BankName}
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
																	<span className="text-danger">* </span>{strings.AccountNumber}
																</Label>
																<Input
																    disabled
																	type="text"
																	maxLength="25"
																	id="account_number"
																	autoComplete="Off"
																	name="account_number"
																	placeholder={strings.Enter + strings.AccountNumber}
																	value={props.values.account_number}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regEx.test(option.target.value)
																		) {
																			props.handleChange('account_number')(
																				option,
																			);
																		} else if (
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
														<Col md="4">
															<FormGroup className="mb-3">
																<Label htmlFor="countryId">
																	{strings.Country}
																</Label>
																<Select
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
																					+props.values.countryId,
																			)
																	}
																	onChange={(option) => {
																		if (option && option.value) {
																			props.handleChange('countryId')(
																				option.value,
																			);
																		} else {
																			props.handleChange('countryId')('');
																		}
																	}}
																	placeholder={strings.Select + strings.Country}
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
													</Row>
													<Row>
														{/* <Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="ifsc_code">IFSC Code</Label>
																<Input
																	type="text"
																	id="ifsc_code"
																	name="ifsc_code"
																	placeholder="Enter IFSC Code"
																	value={props.values.ifsc_code || ''}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.ifscCode.test(option.target.value)
																		) {
																			props.handleChange('ifsc_code')(
																				option.target.value.toUpperCase(),
																			);
																		} else {
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
																<Label htmlFor="swift_code">Swift Code</Label>
																<Input
																	type="text"
																	id="swift_code"
																	maxLength="11"
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
														{props.values.bank_name.value === 999 && (
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
																	<span className="text-danger">* </span>{strings.Accountisfor}
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
																				'Type',
																			)
																			: []
																	}
																	value={
																		this.account_for &&
																		this.account_for.find(
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
																			props.handleChange('account_is_for')('');
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
														<Col
															lg={12}
															className="d-flex align-items-center justify-content-between flex-wrap mt-5"
														>
															<FormGroup>
																{this.state.initialVals.transactionCount > 0 || current_bank_account_id === 10000 ? (
																	'' 
																) : (
																	<Button
																		type="button"
																		name="button"
																		color="danger"
																		className="btn-square"
																		disabled={this.state.disabled1}
																		onClick={() => this.closeBankAccount(current_bank_account_id)}
																	>
																		<i className="fa fa-trash"></i>{' '}{this.state.disabled1 ? 'Deleting...' : strings.Delete}
																	</Button>
																)}
															</FormGroup>
															<FormGroup className="text-right">
																<Button
																	type="submit"
																	name="submit"
																	color="primary"
																	className="btn-square mr-3"
																	disabled={this.state.disabled}
																>
																	<i className="fa fa-dot-circle-o"></i> {this.state.disabled
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
																			'/admin/banking/bank-account',
																		);
																	}}
																>
																	<i className="fa fa-ban"></i>{' '}{this.state.disabled1
																		? 'Deleting...'
																		: strings.Cancel}
																</Button>
															</FormGroup>
														</Col>
													</Row>
												</Form>
											)}
										</Formik>
									) : (
										<Loader />
									)}
								</Col>
							</Row>
									)}
						</CardBody>
					</Card>
				</div>
			</div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailBankAccount);
