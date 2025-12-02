import React from 'react';
import { connect } from 'react-redux';
import { LeavePage, Loader } from 'components';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { ConfirmDeleteModal } from 'components';
import { ViewExpenseDetails } from './sections';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import * as ExpenseDetailsAction from './actions';
import * as ExpenseActions from '../../actions';
import { CommonActions } from 'services/global';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import * as ExpenseCreateActions from '../create/actions';
import { TextareaAutosize } from '@material-ui/core';
import moment from 'moment';
import './style.scss';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { Checkbox } from '@material-ui/core';
import Switch from "react-switch";

const SortExpenseCategory = (list) => {
	if (list.length !== 0) {
		const COAList = ['Admin Expense', 'Current Asset', 'COGS', 'Fixed Asset', 'Other Current Asset', 
			'Other Current Liability', 'Other Expense', 'Other Liability'];
		let expenseCategory = [];
		COAList.map(transactionCategoryDescription => {
			let expenseSubCategoryList = [];
			let sub_Cat = list.filter((subCat) => subCat.transactionCategoryDescription === transactionCategoryDescription);
			expenseSubCategoryList = selectOptionsFactory.renderOptions('transactionCategoryName', 'transactionCategoryId', sub_Cat, 'Expense Category',);
			expenseSubCategoryList = expenseSubCategoryList.filter((obj) => obj.label !== 'Select Expense Category');
			let expenseSubCategory = { label: transactionCategoryDescription, options: expenseSubCategoryList };
			expenseCategory.push(expenseSubCategory);
		})
		return expenseCategory;
	} else {
		return list;
	}
};

const mapStateToProps = (state) => {
	const expenseCategoryList = SortExpenseCategory(state?.expense?.expense_categories_list);
	return {
		expense_detail: state.expense.expense_detail,
		currency_list: state.expense.currency_list,
		vat_list: state.expense.vat_list,
		expense_categories_list_Sorted: expenseCategoryList,
		expense_categories_list: state.expense.expense_categories_list,
		bank_list: state.expense.bank_list,
		pay_mode_list: state.expense.pay_mode_list,
		user_list: state.expense.user_list,
		currency_convert_list: state.common.currency_convert_list,
		pay_to_list: state.expense.pay_to_list,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		expenseDetailActions: bindActionCreators(ExpenseDetailsAction, dispatch),
		expenseCreateActions: bindActionCreators(ExpenseCreateActions, dispatch),
		expenseActions: bindActionCreators(ExpenseActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class DetailExpense extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			initValue: {
				curreancyname: '',
			},
			current_expense_id: null,
			fileName: '',
			payMode: '',
			view: false,
			basecurrency: [],
			disabled: false,
			disabled1: false,
			exclusiveVat: true,
			expenseType: true,
			isVatClaimable: false,
			isReverseChargeEnabled: false,
			taxTreatmentId: 1,
			showReverseCharge: false,
			lockPlacelist: false,
			isDesignatedZone: true,
			curreancyname: '',
			expenseDateForVatValidation: new Date(),
			isRegisteredVat: false,
			companyVATRegistrationDate: new Date(),
			exchangeRate: '',
			taxTreatmentList: [],
			count: 0,
			placelist: [
				{ label: 'Abu Dhabi', value: '1' },
				{ label: 'Dubai', value: '2' },
				{ label: 'Sharjah', value: '3' },
				{ label: 'Ajman', value: '4' },
				{ label: 'Umm Al Quwain', value: '5' },
				{ label: 'Ras Al-Khaimah', value: '6' },
				{ label: 'Fujairah', value: '7' },

			],
			loadingMsg: "Loading...",
			disableLeavePage: false
		};
		this.placelist = [
			{ label: 'Abu Dhabi', value: '1' },
			{ label: 'Dubai', value: '2' },
			{ label: 'Sharjah', value: '3' },
			{ label: 'Ajman', value: '4' },
			{ label: 'Umm Al Quwain', value: '5' },
			{ label: 'Ras Al-Khaimah', value: '6' },
			{ label: 'Fujairah', value: '7' },
		];
		this.file_size = 1024000;
		this.regEx = /^[0-9\b]+$/;
		this.regExAlpha = /^[a-zA-Z]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

		this.supported_format = [
			'image/png',
			'image/jpeg',
			'text/plain',
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];
	}

	componentDidMount = () => {
		this.getcurentCompanyUser();
		this.getTaxTreatmentList();
		this.initializeData();
	};
	getTaxTreatmentList = () => {
		this.props.expenseActions
			.getTaxTreatment()
			.then((res) => {

				if (res.status === 200) {
					this.setState({ taxTreatmentList: res.data });
				}
			})
			.catch((err) => {

				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'ERROR',
				);
			});
	}
	initializeData = () => {
		if (this.props.location.state && this.props.location.state.expenseId) {
			this.props.expenseActions.getVatList();
			this.props.expenseDetailActions
				.getExpenseDetail(this.props.location.state.expenseId)
				.then((res) => {
					if (res.status === 200) {
						this.getCompanyCurrency();
						this.props.expenseActions.getExpenseCategoriesList();
						this.props.expenseActions.getBankList();
						this.props.expenseActions.getPaymentMode();
						this.props.expenseActions.getUserForDropdown();
						this.props.expenseCreateActions.getPaytoList();

						const { vat_list } = this.props
						let vatCategoryId =
							vat_list ?
								selectOptionsFactory
									.renderOptions(
										'name',
										'id',
										vat_list,
										'Tax',
									)
									.find(
										(option) =>
											option.value ===
											+res.data.vatCategoryId,
									) : ''
						if (res.data.vatCategoryId === 10 || !res.data.vatCategoryId) {
							vatCategoryId = {};
							vatCategoryId.label = "N/A";
							vatCategoryId.value = "10";
						}
						this.setState(
							{
								loading: false,
								current_expense_id: this.props.location.state.expenseId,
								initValue: {
									expenseNumber: res.data.expenseNumber,
									payee: res.data.payee ? res.data.payee : '',
									expenseDate: res.data.expenseDate ? res.data.expenseDate : '',
									currency: res.data.currencyCode ? res.data.currencyCode : '',
									currencyName: res.data.currencyName ? res.data.currencyName : '',
									expenseCategory: res.data.expenseCategory
										? res.data.expenseCategory
										: '',
									expenseAmount: res.data.expenseAmount,
									vatCategoryId: vatCategoryId,
									payMode: res.data.payMode ? res.data.payMode : '',
									bankAccountId: res.data.bankAccountId
										? res.data.bankAccountId
										: '',
									exclusiveVat:
										res.data.exclusiveVat && res.data.exclusiveVat != null ? res.data.exclusiveVat : '',
									exchangeRate: res.data.exchangeRate ? res.data.exchangeRate : '',
									expenseDescription: res.data.expenseDescription,
									receiptNumber: res.data.receiptNumber,
									attachmentFile: res.data.attachmentFile,
									receiptAttachmentDescription: res.data.receiptAttachmentDescription,
									fileName: res.data.fileName ? res.data.fileName : '',
									filePath: res.data.receiptAttachmentPath
										? res.data.receiptAttachmentPath
										: '',
									isReverseChargeEnabled: res.data.isReverseChargeEnabled ? res.data.isReverseChargeEnabled : false,
									placeOfSupplyId: res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '',
									taxTreatmentId: res.data.taxTreatmentId ? res.data.taxTreatmentId : '',
									notes: res.data.delivaryNotes,
								},
								exchangeRate: res?.data?.exchangeRate ? res.data.exchangeRate : '',
								payee: res.data.payee ? res.data.payee : '',
								expenseType: res.data.expenseType ? true : false,
								isVatClaimable: res.data.expenseType ? res.data.expenseType : false,
								showPlacelist: res.data.taxTreatmentId && res.data.taxTreatmentId !== 8 ? true : false,
								lockPlacelist: res.data.taxTreatmentId === 7 ? true : false,
								taxTreatmentId: res.data.taxTreatmentId ? res.data.taxTreatmentId : '',
								isReverseChargeEnabled: res.data.isReverseChargeEnabled ? res.data.isReverseChargeEnabled : false,
								exclusiveVat: res.data.exclusiveVat === true ? true : false,
								expenseDateForVatValidation: new Date(res.data.expenseDate),

								view:
									this.props.location.state && this.props.location.state.view
										? true
										: false,
							},
							() => {
								if (
									this.props.location.state &&
									this.props.location.state.view
								) {
									this.setState({ loading: false });
								} else {
									this.setState({ loading: false });
								}
								let currency = selectCurrencyFactory.renderOptions('currencyName', 'currencyCode', 
									this.props.currency_convert_list, 'Currency',)
									.find((option) => option.value === res.data.currencyCode,)
								this.setExchange(currency && currency.value);
								this.setCurrency(currency && currency.value);
							},
						);
					}

				})
				.catch((err) => {
					this.setState({ loading: false });
				});
		} else {
			this.props.history.push('/admin/expense/expense');
		}
	};

	handleSubmit = (data, resetValue) => {
		this.setState({ disabled: true, disableLeavePage: true });
		const { current_expense_id } = this.state;
		const {
			expenseNumber,
			payee,
			expenseDate,
			currency,
			expenseCategory,
			expenseAmount,
			expenseDescription,
			exchangeRate,
			receiptNumber,
			receiptAttachmentDescription,
			DeliveryNotes,
			vatCategoryId,
			payMode,
			bankAccountId,
			placeOfSupplyId,
			taxTreatmentId,
			notes
		} = data;
		let formData = new FormData();
		formData.append('expenseType', this.state.expenseType);
		formData.append('isVatClaimable', this.state.isVatClaimable);
		formData.append('delivaryNotes', notes);
		formData.append('expenseNumber', expenseNumber);
		formData.append('expenseId', current_expense_id);
		formData.append('payee', payee ? payee.value : '');
		formData.append('expenseDate', expenseDate !== null ? moment(expenseDate) : '');
		formData.append('expenseDescription', expenseDescription);
		formData.append('receiptNumber', receiptNumber);
		formData.append('receiptAttachmentDescription', receiptAttachmentDescription,);
		formData.append('delieryNote', DeliveryNotes,);
		formData.append('expenseAmount', expenseAmount);
		formData.append('payMode', payee?.value === 'Company Expense' || payee === 'Company Expense' ? payMode?.value ? payMode.value : payMode : '');
		if (expenseCategory && expenseCategory.value) {
			formData.append('expenseCategory', expenseCategory.value);
		}
		if (exchangeRate) {
			formData.append('exchangeRate', exchangeRate);
		}
		if (currency && currency.value) {
			formData.append('currencyCode', currency.value);
		}
		if (vatCategoryId) {
			formData.append('vatCategoryId', vatCategoryId.value ? vatCategoryId.value : vatCategoryId);

			if (this.state.exclusiveVat !== undefined) {
				formData.append('exclusiveVat', this.state.exclusiveVat);
			}
		}
		if (bankAccountId && bankAccountId.value && payMode === 'BANK') {
			formData.append('bankAccountId', bankAccountId.value);
		}
		if (this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		if (placeOfSupplyId) {
			formData.append('placeOfSupplyId', placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId);
		}

		if (taxTreatmentId) {
			formData.append('taxTreatmentId', taxTreatmentId.value ? taxTreatmentId.value : taxTreatmentId);
		}
		formData.append("isReverseChargeEnabled", this.state.isReverseChargeEnabled)
		this.setState({ loading: true, loadingMsg: "Updating Expense..." });
		this.props.expenseDetailActions
			.updateExpense(formData)
			.then((res) => {
				this.setState({ disabled: false });
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Expense Updated Successfully'
					);
					this.props.history.push('/admin/expense/expense');
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Expense Updated Unsuccessfully'
				);
			});
	};

	deleteExpense = () => {
		const message1 = (
			<text>
				<b>Delete Expense?</b>
			</text>
		);
		const message =
			'This Expense will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeExpense}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};
	setExchange = (value, props) => {
		if (this.props.currency_convert_list) {
			let result = this.props.currency_convert_list.filter((obj) => {
				return obj.currencyCode === value;
			});
			if (result && result[0] && result[0].exchangeRate) {
				if (props) {
					props.handleChange('exchangeRate')(result[0].exchangeRate,);
				}
				this.setState({ exchangeRate: result[0].exchangeRate });
			}
		}
	};

	setCurrency = (value, props) => {
		if (this.props.currency_convert_list) {
			let result = this.props.currency_convert_list.filter((obj) => {
				return obj.currencyCode === value;
			});
			if (result[0] && result[0].currencyName) {
				if (props) {
					props.handleChange('curreancyname')(
						result[0].currencyName,
					);
				}
				this.setState({ curreancyname: result[0].currencyName });

			}
		}
	};

	getCompanyCurrency = (basecurrency) => {
		this.props.currencyConvertActions
			.getCompanyCurrency()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ basecurrency: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ loading: false });
			});
	};
	removeExpense = () => {
		this.setState({ disabled1: true });
		const { current_expense_id } = this.state;
		this.setState({ loading: true, loadingMsg: "Deleting Expense..." });
		this.props.expenseDetailActions
			.deleteExpense(current_expense_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Expense Deleted Successfully'
					);
					this.props.history.push('/admin/expense/expense');
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Expense Deleted Unsuccessfully'
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	editDetails = () => {
		this.setState({
			view: false,
		});
	};

	handleFileChange = (e, props) => {
		e.preventDefault();
		let reader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			reader.onloadend = () => { };
			reader.readAsDataURL(file);
			props.setFieldValue('attachmentFile', file, true);
		}
	};
	getcurentCompanyUser = () => {
		this.props.expenseCreateActions.checkAuthStatus().then((response) => {

			let userStateName = response.data.company.companyStateCode.stateName ? response.data.company.companyStateCode.stateName : '';
			let isDesignatedZone = response.data.company.isDesignatedZone ? response.data.company.isDesignatedZone : false;
			this.setState({
				userStateName: userStateName,
				isDesignatedZone: isDesignatedZone,
				isRegisteredVat: response.data.company.isRegisteredVat,
				companyVATRegistrationDate: new Date(response.data.company.vatRegistrationDate),
			})

		})
			.catch((err) => {
				console.log(err);
			});
	}
	placelistSetting = (option, props) => {

		this.setState({ showPlacelist: true, lockPlacelist: false })
		if (option?.value === 6)
			this.setState({
				placelist:
					[
						{ label: 'Abu Dhabi', value: '1' },
						{ label: 'Dubai', value: '2' },
						{ label: 'Sharjah', value: '3' },
						{ label: 'Ajman', value: '4' },
						{ label: 'Umm Al Quwain', value: '5' },
						{ label: 'Ras Al-Khaimah', value: '6' },
						{ label: 'Fujairah', value: '7' },
						{ label: 'BAHRAIN', value: '8' },
						{ label: 'SAUDI ARABIA', value: '9' },
						{ label: 'OMAN', value: '10' },
						{ label: 'KUWAIT', value: '11' },
						{ label: 'QATAR', value: '12' },
					]
			})
		else
			if (option?.value === 5)
				this.setState({
					placelist:
						[
							{ label: 'Abu Dhabi', value: '1' },
							{ label: 'Dubai', value: '2' },
							{ label: 'Sharjah', value: '3' },
							{ label: 'Ajman', value: '4' },
							{ label: 'Umm Al Quwain', value: '5' },
							{ label: 'Ras Al-Khaimah', value: '6' },
							{ label: 'Fujairah', value: '7' },
							{ label: 'BAHRAIN', value: '8' },
							{ label: 'SAUDI ARABIA', value: '9' },
							{ label: 'OMAN', value: '10' },
						]
				})
			else
				if (option?.value === 8) {
					if (props)
						props.handleChange('placeOfSupplyId')('')
					else
						this.formRef.current.setFieldValue('placeOfSupplyId', "", true);
					this.setState({ showPlacelist: false })
				} else
					if (option?.value === 7) {
						let placeOfSupplyId = this.placelist.find(
							(option) =>
								option.label === this.state.userStateName,
						);
						if (props)
							props.handleChange('placeOfSupplyId')(placeOfSupplyId)
						else
							this.formRef.current.setFieldValue('placeOfSupplyId', placeOfSupplyId, true);
						this.setState({ lockPlacelist: true })
					}
					else
						this.setState({
							placelist:
								[
									{ label: 'Abu Dhabi', value: '1' },
									{ label: 'Dubai', value: '2' },
									{ label: 'Sharjah', value: '3' },
									{ label: 'Ajman', value: '4' },
									{ label: 'Umm Al Quwain', value: '5' },
									{ label: 'Ras Al-Khaimah', value: '6' },
									{ label: 'Fujairah', value: '7' },
								]
						})

	}

	ReverseChargeSetting = (option, props) => {
		if (this.state.isDesignatedZone === true) {
			if ((option >= 1 && option <= 4) || option === 8) {
				this.setState({
					showReverseCharge: false,
				})
			}
			else {
				this.setState({
					showReverseCharge: true,
				})
			}
		}
		else {
			//Not Designated Zone		
			if (this.state.isDesignatedZone === false) {
				if (option === 3 || option === 8) {
					this.setState({
						showReverseCharge: false,
					})
				}
				else {
					this.setState({
						showReverseCharge: true,
					})
				}
			}
		}

	}

	renderVat = (props) => {
		let vat_list = []
		let vatIds = []
		if (this.state.isRegisteredVat && (this.state.expenseDateForVatValidation > this.state.companyVATRegistrationDate)) {
			if (this.state.isDesignatedZone && this.state.isDesignatedZone != null && this.state.isDesignatedZone === true) {
				switch (props.values.taxTreatmentId && props.values.taxTreatmentId.value ? props.values.taxTreatmentId.value : '') {

					case 1:
					case 3:
						if (this.state.isReverseChargeEnabled === false)
							vatIds = [1, 2, 3]

						break;

					case 2:
					case 4:
					case 8:
						if (this.state.isReverseChargeEnabled === false)
							vatIds = [4]

						break;

					case 5:
					case 6:
					case 7:
						if (this.state.isReverseChargeEnabled === false)
							vatIds = [3]
						else if (this.state.isReverseChargeEnabled === true)
							vatIds = [1, 2]
						break;

					default:
						break;
				}
			}
			else
				//Not Designated Zone		
				if (this.state.isDesignatedZone === false)
					switch (props.values.taxTreatmentId && props.values.taxTreatmentId.value ? props.values.taxTreatmentId.value : '') {

						case 1:
							if (this.state.isReverseChargeEnabled === false)
								vatIds = [1, 2, 3]
							else if (this.state.isReverseChargeEnabled === true)
								vatIds = [1, 2]
							break;

						case 3:
							if (this.state.isReverseChargeEnabled === false)
								vatIds = [1, 2, 3]

							break;

						case 2:
						case 4:
						case 5:
						case 6:
						case 7:
							if (this.state.isReverseChargeEnabled === false)
								vatIds = [3]
							else if (this.state.isReverseChargeEnabled === true)
								vatIds = [1, 2]
							break;

						case 8:
							if (this.state.isReverseChargeEnabled === false)
								vatIds = [4]
							break;

						default:
							break;
					}
		} else {
			vatIds = [10]
		}

		vat_list = this.getVatListByIds(vatIds)
		//vat column
		return (
			<Col lg={3}>
				<FormGroup className="mb-3">
					<Label htmlFor="vatCategoryId">
						<span className="text-danger">* </span>{strings.VAT}
					</Label>
					<Select
						options={
							vat_list
								? selectOptionsFactory.renderOptions(
									'name',
									'id',
									this.props.vat_list,
									'VAT',
								)
								: []
						}
						value={props.values.vatCategoryId}
						onChange={(option) => {
							if (option && option.value) {
								props.handleChange('vatCategoryId')(
									option,
								);
							} else {
								props.handleChange('vatCategoryId')('');
							}
						}}

						placeholder={strings.Select + strings.VAT}
						id="vatCategoryId"
						name="vatCategoryId"
						className={
							props.errors.vatCategoryId &&
								props.touched.vatCategoryId
								? 'is-invalid'
								: ''
						}
					/>
					{props.errors.vatCategoryId &&
						props.touched.vatCategoryId && (
							<div className="invalid-feedback">
								{props.errors.vatCategoryId}
							</div>
						)}
				</FormGroup>
			</Col>
		)
	}

	getVatListByIds = (vatIds) => {
		const { vat_list } = this.props

		let array = []

		vat_list.map((row) => {
			vatIds.map((id) => {
				if (row.id === id) {
					array.push(row)
				}
			})
		})
		if (vatIds[0] === 10) {
			array.push({
				"id": 10,
				"vat": 0,
				"name": "N/A"
			})
		}

		return array;
	}

	render() {
		strings.setLanguage(this.state.language);
		const {
			expense_categories_list,
			expense_categories_list_Sorted,
			pay_mode_list,
			pay_to_list,
			currency_convert_list,
		} = this.props;
		const { initValue, dialog, taxTreatmentList, placelist, loadingMsg, loading } = this.state;

		return (
			loading === true ? <Loader loadingMsg={loadingMsg} /> : <div>
				<div className="detail-expense-screen">
					<div className="animated fadeIn">
						{dialog}
						{loading ? (
							<Loader />
						) : this.state.view ? (
							<ViewExpenseDetails
								initialVals={initValue}
								editDetails={() => {
									this.editDetails();
								}}
							/>
						) : (
							<Row>
								<Col lg={12} className="mx-auto">
									<Card>
										<CardHeader>
											<Row>
												<Col lg={12}>
													<div className="h4 mb-0 d-flex align-items-center">
														<i className="fab fa-stack-exchange" />
														<span className="ml-2">{strings.UpdateExpense} </span>
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
														<Formik
															initialValues={initValue}
															onSubmit={(values, { resetForm }) => {
																this.handleSubmit(values);
															}}
															validate={(values) => {
																let errors = {};
																if (
																	values.payMode.value === 'BANK' &&
																	!values.bankAccountId
																) {
																	errors.bankAccountId = 'Bank account is required';
																}
																if (this.state.isRegisteredVat && !values.vatCategoryId &&
																	values.expenseCategory && values.expenseCategory.value !== 34) {
																	errors.vatCategoryId = strings.VATIsRequired;
																}
																if (this.state.showPlacelist === true && (values.placeOfSupplyId === ''
																	|| values.placeOfSupplyId.value === '') &&
																	values.expenseCategory && values.expenseCategory.value !== 34) {
																	errors.placeOfSupplyId = "Place of supply is required"
																}
																if (this.state.isRegisteredVat && !values.taxTreatmentId &&
																	((values.expenseCategory && values.expenseCategory !== 34) &&
																		(values.expenseCategory.value && values.expenseCategory.value !== 34))) {
																	errors.taxTreatmentId = strings.TaxTreatmentRequired;
																}
																if (
																	this.state.payee === 'Company Expense' &&
																	!values.payMode
																) {
																	errors.payMode = 'Pay Through is required';
																}
																return errors;
															}}
															validationSchema={Yup.object().shape({
																expenseNumber: Yup.string().required(
																	'Expense number is required',
																),
																expenseCategory: Yup.string().required(
																	'Expense category is required',
																),
																expenseDate: Yup.date().required(
																	'Expense date is required',
																),
																currency: Yup.string().required(
																	'Currency is required',
																),
																payee: Yup.string().required(
																	'Paid by is required',
																),
																expenseAmount: Yup.string()
																	.required('Amount is required')
																	.matches(
																		/^[0-9][0-9]*[.]?[0-9]{0,2}$$/,
																		'Enter a valid amount',
																	)
																	.test(
																		'Expense Amount',
																		'Expense amount should be greater than 1',
																		(value) => {
																			if (value > 0) {
																				return true;
																			} else {
																				return false;
																			}
																		},
																	),
																attachmentFile: Yup.mixed()
																	.test(
																		'fileType',
																		'*Unsupported File Format',
																		(value) => {
																			value &&
																				this.setState({
																					fileName: value.name,
																				});
																			if (
																				!value ||
																				(value &&
																					this.supported_format.includes(
																						value.type,
																					))
																			) {
																				return true;
																			} else {
																				return false;
																			}
																		},
																	)
																	.test(
																		'fileSize',
																		'*File Size is too large',
																		(value) => {
																			if (
																				!value ||
																				(value && value.size <= this.file_size)
																			) {
																				return true;
																			} else {
																				return false;
																			}
																		},
																	),
															})}
														>
															{(props) => (
																<Form onSubmit={props.handleSubmit}>
																	<Row>
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="expenseNumber">
																					<span className="text-danger">* </span>
																					{strings.ExpenseNumber}
																				</Label>
																				<Input
																					type="text"
																					maxLength="100"
																					id="expenseNumber"
																					name="expenseNumber"
																					placeholder={strings.Enter + " Expense Number"}
																					disabled
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExBoth.test(
																								option.target.value,
																							)
																						) {
																							props.handleChange('expenseNumber')(
																								option,
																							);
																						}
																					}}
																					value={props.values.expenseNumber}
																					className={
																						props.errors.expenseNumber &&
																							props.touched.expenseNumber
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.expenseNumber &&
																					props.touched.expenseNumber && (
																						<div className="invalid-feedback">
																							{props.errors.expenseNumber}
																						</div>
																					)}
																			</FormGroup>
																		</Col>

																		<Col lg={3}>
																			<FormGroup className="mb-3" >
																				<Label htmlFor="expenseCategoryId">
																					<span className="text-danger">* </span>
																					{strings.ExpenseCategory}
																				</Label>
																				<Select
																					id="expenseCategory"
																					name="expenseCategory"
																					options={
																						expense_categories_list && expense_categories_list_Sorted
																							? expense_categories_list_Sorted
																							: []
																					}
																					value={
																						expense_categories_list &&
																						selectOptionsFactory
																							.renderOptions(
																								'transactionCategoryName',
																								'transactionCategoryId',
																								expense_categories_list,
																								'Expense Category',
																							)
																							.find(
																								(option) =>
																									option.value ===
																									+props.values.expenseCategory,
																							)
																					}
																					className={
																						props.errors.expenseCategory &&
																							props.touched.expenseCategory
																							? 'is-invalid'
																							: ''
																					}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('expenseCategory')(option,);
																							if (option.value === 34) {
																								props.handleChange('payee')({ label: 'Company Expense', value: 'Company Expense' });
																								props.handleChange('taxTreatmentId')('');
																								props.handleChange('vatCategoryId')('');
																								props.handleChange('placeOfSupplyId')('');
																								this.setState({ showPlacelist: false })
																							}
																						} else {
																							props.handleChange('expenseCategory')('');
																						}
																					}}
																				/>
																				{props.errors.expenseCategory &&
																					props.touched.expenseCategory && (
																						<div className="invalid-feedback">
																							{props.errors.expenseCategory}
																						</div>
																					)}
																			</FormGroup>
																		</Col>

																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="expense_date">
																					<span className="text-danger">* </span>
																					{strings.ExpenseDate}
																				</Label>
																				<DatePicker
																					id="date"
																					name="expenseDate"
																					className={`form-control ${props.errors.expenseDate &&
																						props.touched.expenseDate
																						? 'is-invalid'
																						: ''
																						}`}
																					placeholderText={strings.ExpenseDate}
																					value={props.values.expenseDate ? moment(props.values.expenseDate,).format('DD-MM-YYYY') : ''}
																					selected={props.values.expenseDate ? new Date(moment(props.values.expenseDate).format('MM DD YYYY')) : ''}
																					showMonthDropdown
																					showYearDropdown
																					dropdownMode="select"
																					dateFormat="dd-MM-yyyy"
																					onChange={(value) => {
																						if ((this.state.expenseDateForVatValidation < this.state.companyVATRegistrationDate && 
																							value > this.state.companyVATRegistrationDate) || 
																							(value < this.state.companyVATRegistrationDate 
																								&& this.state.expenseDateForVatValidation > this.state.companyVATRegistrationDate)) {
																							props.handleChange('vatCategoryId')('');
																						}
																						this.setState({ expenseDateForVatValidation: value });
																						props.handleChange('expenseDate')(value);
																					}}
																				/>
																				{props.errors.expenseDate &&
																					props.touched.expenseDate && (
																						<div className="invalid-feedback">
																							{props.errors.expenseDate.includes("final value was:") ? "Expense date is required" : props.errors.expenseDate}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																	</Row>
																	<Row>
																		{this.state.isRegisteredVat && 
																		(props.values?.expenseCategory?.value ? 
																			props.values?.expenseCategory?.value !== 34 : props.values?.expenseCategory !== 34) && (
																			<Col lg={3}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="taxTreatmentId">
																						<span className="text-danger">* </span>{strings.TaxTreatment}
																					</Label>
																					<Select
																						options={
																							taxTreatmentList
																								? selectOptionsFactory.renderOptions(
																									'name',
																									'id',
																									taxTreatmentList,
																									'Tax Treatment',
																								)
																								: []
																						}
																						id="taxTreatmentId"
																						name="taxTreatmentId"
																						placeholder={strings.Select + strings.TaxTreatment}
																						value={
																							taxTreatmentList &&
																							selectOptionsFactory.renderOptions(
																								'name',
																								'id',
																								taxTreatmentList,
																								'Tax Treatment',
																							)
																								.find(
																									(option) =>
																										option.value ===
																										+props.values.taxTreatmentId,
																								)
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange('taxTreatmentId')(
																									option,
																								);
																								props.handleChange('placeOfSupplyId')('');
																								// for resetting VAT
																								props.handleChange('vatCategoryId')('');
																								//placelist Setup
																								this.placelistSetting(option, props)
																								this.setState({ isReverseChargeEnabled: false, exclusiveVat: true })
																								this.setState({ taxTreatmentId: option.value })
																							} else {
																								props.handleChange('taxTreatmentId')(
																									'',
																								);
																								this.setState({ taxTreatmentId: '' })
																							}
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
																			</Col>)}
																		{this.state.showPlacelist === true && 
																		props.values.expenseCategory && 
																		(props.values?.expenseCategory?.value ? 
																			props.values?.expenseCategory?.value !== 34 : props.values?.expenseCategory !== 34) && (
																			<Col lg={3}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="placeOfSupplyId">
																						<span className="text-danger">*</span>
																						{strings.PlaceofSupply}
																					</Label>
																					<Select
																						isDisabled={this.state.lockPlacelist}
																						id="placeOfSupplyId"
																						name="placeOfSupplyId"
																						placeholder={strings.Select + strings.PlaceofSupply}
																						options={
																							placelist
																								? selectOptionsFactory.renderOptions(
																									'label',
																									'value',
																									placelist,
																									'Place of Supply',
																								)
																								: []
																						}
																						value={
																							this.placelist &&
																							selectOptionsFactory.renderOptions(
																								'label',
																								'value',
																								this.placelist,
																								'Place of Supply',
																							).find(
																								(option) =>
																									option.value ===
																									props.values
																										.placeOfSupplyId.toString(),
																							)
																						}
																						className={
																							props.errors.placeOfSupplyId &&
																								props.touched.placeOfSupplyId
																								? 'is-invalid'
																								: ''
																						}
																						onChange={(option) => {
																							if (option.value != '')
																								props.handleChange('placeOfSupplyId')(option);
																							else
																								props.handleChange('placeOfSupplyId')('');
																						}
																						}
																					/>
																					{props.errors.placeOfSupplyId &&
																						props.touched.placeOfSupplyId && (
																							<div className="invalid-feedback">
																								{props.errors.placeOfSupplyId}
																							</div>
																						)}
																				</FormGroup>
																			</Col>)}
																		{this.state.isRegisteredVat && 
																		props.values.expenseCategory && 
																		(props.values?.expenseCategory?.value ? 
																			props.values?.expenseCategory?.value !== 34 : props.values?.expenseCategory !== 34) && (
																			<Col className='mb-2' lg={3}>
																				<Label htmlFor="inline-radio3"><span className="text-danger">* </span>{strings.ExpenseType}</Label>
																				<div style={{ display: "flex" }}>
																					{this.state.isVatClaimable === false ?
																						<span style={{ color: "#0069d9" }} className='mr-4'><b>{strings.NonClaimable}</b></span> :
																						<span className='mr-4'>{strings.NonClaimable}</span>}

																					<Switch
																						checked={this.state.isVatClaimable}
																						onChange={(expenseType) => {
																							props.handleChange('expenseType')(expenseType);

																							this.setState({ expenseType, }, () => { },);
																							if (this.state.isVatClaimable === true) {
																								this.setState({ isVatClaimable: false });
																							}
																							else {
																								this.setState({ isVatClaimable: true });
																							}
																							// if (this.state.expenseType == true)
																							// 	this.setState({ expenseType: true })
																						}}
																						onColor="#2064d8"
																						onHandleColor="#2693e6"
																						handleDiameter={25}
																						uncheckedIcon={false}
																						checkedIcon={false}
																						boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
																						activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
																						height={20}
																						width={48}
																						className="react-switch"
																					/>

																					{this.state.isVatClaimable === true ?
																						<span style={{ color: "#0069d9" }} className='ml-4'><b>{strings.Claimable}</b></span> :
																						<span className='ml-4'>{strings.Claimable}</span>
																					}
																				</div>
																			</Col>)}
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="payee">	<span className="text-danger">* </span>{strings.PaidBy}</Label>
																				<Select
																					isDisabled={props.values?.expenseCategory?.value === 34 || props.values?.expenseCategory === 34}
																					options={
																						pay_to_list
																							? selectOptionsFactory.renderOptions(
																								'label',
																								'value',
																								pay_to_list,
																								'Payee',
																							)
																							: []
																					}
																					// value={props.values.payee}
																					value={props.values.payee?.value ? props.values.payee :
																						pay_to_list &&
																						selectOptionsFactory
																							.renderOptions(
																								'label',
																								'value',
																								pay_to_list,
																								'Payee',
																							)
																							.find(
																								(option) =>
																									option.label ===
																									props.values.payee,
																							)
																					}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('payee')(option);
																							if (option.value === 'Company Expense')
																								props.handleChange('payMode')({ label: 'Petty Cash', value: 'CASH' });
																						} else {
																							props.handleChange('payee')('');
																						}
																					}}
																					placeholder={strings.Select + strings.Payee}
																					id="payee"
																					name="payee"
																					className={
																						props.errors.payee &&
																							props.touched.payee
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.payee &&
																					props.touched.payee && (
																						<div className="invalid-feedback">
																							{props.errors.payee}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																	</Row>
																	<Row>
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="expenseAmount">
																					<span className="text-danger">* </span>
																					{strings.Amount}
																				</Label>
																				<Input
																					type="text"
																					min="0"
																					name="expenseAmount"
																					maxLength="14,2"
																					id="expenseAmount"
																					rows="5"
																					className={
																						props.errors.expenseAmount &&
																							props.touched.expenseAmount
																							? 'is-invalid'
																							: ''
																					}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regDecimal.test(
																								option.target.value,
																							)
																						) {
																							props.handleChange('expenseAmount')(
																								option,
																							);
																						}
																					}}
																					value={props.values.expenseAmount}
																					placeholder={strings.Amount}
																				/>
																				{props.errors.expenseAmount &&
																					props.touched.expenseAmount && (
																						<div className="invalid-feedback">
																							{props.errors.expenseAmount}
																						</div>
																					)}
																			</FormGroup>
																		</Col>

																		{this.state.isRegisteredVat && 
																			(props.values?.expenseCategory?.value ? 
																			props.values?.expenseCategory?.value !== 34 : 
																			props.values?.expenseCategory !== 34) && 
																			(this.renderVat(props))}
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="currency">
																					<span className="text-danger">* </span>
																					{strings.Currency}
																				</Label>
																				<Select
																					id="currency"
																					name="currency"
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
																					placeholder={strings.Select + strings.Currency}
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
																						if (option.value != "") {
																							props.handleChange('currency')(option);
																							this.setExchange(option.value, props);
																							this.setCurrency(option.value, props);
																						}
																						else {
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
																		{(props.values?.payee?.value === 'Company Expense' || props.values?.payee === 'Company Expense') &&
																			<Col lg={3}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="payMode"><span className="text-danger">* </span>
																						{strings.PayThrough}
																					</Label>
																					<Select
																						id="payMode"
																						name="payMode"
																						placeholder={strings.Select + strings.PayThrough}
																						options={
																							pay_mode_list
																								? selectOptionsFactory.renderOptions(
																									'label',
																									'value',
																									pay_mode_list,
																									'Pay Through',
																								)
																								: []
																						}
																						value={
																							pay_mode_list &&
																							pay_mode_list.find(
																								(option) =>
																									option.value ===
																									props.values.payMode,
																							)
																						}
																						onChange={(option) => {
																							props.handleChange('payMode')(
																								option.value,
																							);
																							if (option && option.value) {
																								this.setState({
																									payMode: option.value,
																								});
																							} else {
																								this.setState({ payMode: '' });
																							}
																						}}
																						className={
																							props.errors.payMode &&
																								props.touched.payMode
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.payMode &&
																						props.touched.payMode && (
																							<div className="invalid-feedback">
																								{props.errors.payMode}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																		}
																	</Row>
																	{props.values.vatCategoryId !== '' && 
																		props.values.vatCategoryId.label !== 'Select VAT' && 
																		props.values.expenseCategory && 
																		(props.values?.expenseCategory?.value ? 
																		props.values?.expenseCategory?.value !== 34 : 
																		props.values?.expenseCategory !== 34) &&
																		props.values.vatCategoryId.value === 1 &&
																		(
																			<Row>
																				<Col></Col>
																				<Col >
																					<FormGroup>
																						<span className='mr-4'>{strings.ExclusiveVAT}</span>
																						<Switch
																							checked={!this.state.exclusiveVat}
																							onChange={(checked) => {
																								this.setState({
																									exclusiveVat: !checked
																								});
																							}}
																							onColor="#2064d8"
																							onHandleColor="#2693e6"
																							handleDiameter={25}
																							uncheckedIcon={false}
																							checkedIcon={false}
																							boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
																							activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
																							height={20}
																							width={48}
																							className="react-switch " />
																						<span className='ml-4'>{strings.InclusiveVAT}</span>
																					</FormGroup>
																				</Col>
																				<Col></Col>
																				<Col></Col>
																			</Row>
																		)}
																	<Row>
																		{(this.state.isRegisteredVat && 
																		(this.state.taxTreatmentId) && 
																		(props.values?.expenseCategory?.value ? 
																			props.values?.expenseCategory?.value !== 34 : 
																			props.values?.expenseCategory !== 34)) && 
																			(((this.state.isDesignatedZone && 
																				(this.state.taxTreatmentId === 5 || 
																					this.state.taxTreatmentId === 6 || 
																					this.state.taxTreatmentId === 7)) || 
																					(!this.state.isDesignatedZone && 
																						(this.state.taxTreatmentId !== 3 
																							&& this.state.taxTreatmentId !== 8))
																		)) && (
																				<Col>
																					<Checkbox
																						id="isReverseChargeEnabled"
																						checked={this.state.isReverseChargeEnabled}
																						onChange={(option) => {
																							this.setState({ isReverseChargeEnabled: !this.state.isReverseChargeEnabled, exclusiveVat: true })
																							// for resetting VAT
																							props.handleChange('vatCategoryId')('');
																						}}
																					/>
																					<Label>{strings.IsReverseCharge}</Label>
																				</Col>)}
																	</Row>
																	<hr/>
																	{props.values.exchangeRate !== 1 && (<Row>
																		<Col>
																			<Label htmlFor="currency">
																				{strings.CurrencyExchangeRate}
																			</Label>
																		</Col>
																	</Row>)}
																	{props.values.exchangeRate !== 1 && (<Row>
																		<Col lg={1}>
																			<Input
																				disabled
																				id="1"
																				name="1"
																				value={1}
																			/>
																		</Col>
																		<Col lg={2}>
																			<FormGroup className="mb-3">
																				{/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
																				<div>
																					<Input
																						disabled
																						className="form-control"
																						id="curreancyname"
																						name="curreancyname"
																						value={props.values.curreancyname ? props.values.curreancyname : this.state.curreancyname}
																						onChange={(value) => {
																							props.handleChange('curreancyname')(
																								value,
																							);
																						}}
																					/>
																				</div>
																			</FormGroup>
																		</Col>
																		<FormGroup className="mt-2"><label><b>=</b></label>	</FormGroup>
																		<Col lg={2}>
																			<FormGroup className="mb-3">
																				{/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
																				<div>
																					<Input
																						type="text"
																						className="form-control"
																						id="exchangeRate"
																						name="exchangeRate"
																						maxLength='20'
																						value={props.values.exchangeRate}
																						onChange={(option) => {
																							if (
																								option.target.value === '' ||
																								this.regDecimal.test(
																									option.target.value,
																								)
																							) {
																								props.handleChange('exchangeRate')(
																									option,
																								);
																							}
																						}}
																					/>
																				</div>
																			</FormGroup>
																		</Col>

																		<Col lg={2}>
																			<Input
																				disabled
																				id="currencyName"
																				name="currencyName"
																				value={this.state.basecurrency.currencyName}
																			/>
																		</Col>
																	</Row>)}
																	<Row>
																		<Col lg={8}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="expenseDescription">
																					{strings.Description}
																				</Label>
																				<Input
																					type="textarea"
																					maxLength="250"
																					name="expenseDescription"
																					id="expenseDescription"
																					rows="5"
																					placeholder={strings.Expense + " " + strings.Description}
																					onChange={(option) =>
																						props.handleChange('expenseDescription')(
																							option,
																						)
																					}
																					value={props.values.expenseDescription}
																				/>
																			</FormGroup>
																		</Col>
																	</Row>
																	<Row>
																		<Col lg={8}>
																			<Row>
																				<Col lg={6}>
																					<FormGroup className="mb-3">
																						<Label htmlFor="receiptNumber">
																							{strings.ReferenceNumber}
																						</Label>
																						<Input
																							type="text"
																							maxLength="20"
																							id="receiptNumber"
																							name="receiptNumber"
																							value={props.values.receiptNumber}
																							placeholder={strings.ReceiptNumber}
																							onChange={(value) => {
																								props.handleChange('receiptNumber')(value);

																							}}
																							className={props.errors.receiptNumber && props.touched.receiptNumber ? "is-invalid" : " "}
																						/>
																						{props.errors.receiptNumber && props.touched.receiptNumber && (
																							<div className="invalid-feedback">{props.errors.receiptNumber}</div>
																						)}

																					</FormGroup>
																				</Col>
																			</Row>
																		</Col>
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
																					onClick={this.deleteExpense}
																				>
																					<i className="fa fa-trash"></i>{' '}{this.state.disabled1
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
																						console.log(props.errors)
																						//	added validation popup	msg
																						props.handleBlur();
																						if (props.errors && Object.keys(props.errors).length != 0)
																							this.props.commonActions.fillManDatoryDetails()
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
																						if (this.props?.location?.state?.renderURL) {
																							this.props.history.push(
																								`${this.props?.location?.state?.renderURL}`,
																								{ expenseId: this.props?.location?.state?.expenseId },);
																						} else
																							this.props.history.push(
																								'/admin/expense/expense',
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailExpense);