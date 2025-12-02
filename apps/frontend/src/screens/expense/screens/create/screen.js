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
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';
import * as ExpenseActions from '../../actions';
import * as ExpenseCreateActions from './actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { Checkbox } from '@material-ui/core';
import Switch from "react-switch";
import { TextareaAutosize } from '@material-ui/core';
import { getCustomerInvoicesCountForDelete } from 'screens/customer_invoice/actions';

const SortExpenseCategory = (list) => {
	if (list.length !== 0) {
		const COAList = ['Admin Expense', 'Current Asset', 'COGS', 'Fixed Asset', 'Other Current Asset', 'Other Current Liability', 'Other Expense', 'Other Liability'];
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
		currency_list: state.expense.currency_list,
		project_list: state.expense.project_list,
		employee_list: state.expense.employee_list,
		vat_list: state.expense.vat_list,
		expense_categories_list_Sorted: expenseCategoryList,
		expense_categories_list: state.expense.expense_categories_list,
		bank_list: state.expense.bank_list,
		pay_mode_list: state.expense.pay_mode_list,
		user_list: state.expense.user_list,
		profile: state.auth.profile,
		currency_convert_list: state.common.currency_convert_list,
		pay_to_list: state.expense.pay_to_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		expenseActions: bindActionCreators(ExpenseActions, dispatch),
		expenseCreateActions: bindActionCreators(ExpenseCreateActions, dispatch),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class CreateExpense extends React.Component {
	_isMounted = false;
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			disableLeavePage: false,
			createMore: false,
			disabled: false,
			initValue: {
				payee: { label: 'Company Expense', value: 'Company Expense' },
				placeOfSupplyId: '',
				expenseDate: new Date(),
				currencyCode: 150,
				project: '',
				exchangeRate: 1,
				expenseCategory: '',
				expenseAmount: '',
				expenseDescription: '',
				receiptNumber: '',
				attachmentFile: '',
				employee: '',
				receiptAttachmentDescription: '',
				notes: '',
				vatCategoryId: '',
				payMode: { label: 'Petty Cash', value: 'CASH' },
				bankAccountId: '',
				exclusiveVat: true,
				exist: false,
				taxTreatmentId: '',
				expenseType: false,
			},
			count: 0,
			expenseType: false,
			isVatClaimable: true,
			taxTreatmentId: '',
			isReverseChargeEnabled: false,
			currentData: {},
			fileName: '',
			payMode: '',
			expenseDateForVatValidation: new Date(),
			isRegisteredVat: false,
			companyVATRegistrationDate: new Date(),
			basecurrency: [],
			// disabled: false,
			language: window['localStorage'].getItem('language'),
			taxTreatmentList: [],
			placelist: [
				{ label: 'Abu Dhabi', value: '1' },
				{ label: 'Dubai', value: '2' },
				{ label: 'Sharjah', value: '3' },
				{ label: 'Ajman', value: '4' },
				{ label: 'Umm Al Quwain', value: '5' },
				{ label: 'Ras Al-Khaimah', value: '6' },
				{ label: 'Fujairah', value: '7' },
			],
			showPlacelist: false,
			lockPlacelist: false,
			loadingMsg: "Loading...",
			userStateName: ''
		};
		this.formRef = React.createRef();
		this.options = {
			paginationPosition: 'top',
		};

		this.regEx = /^[0-9\b]+$/;
		this.regExInvNum = /[a-zA-Z0-9-/]+$/;
		this.regExAlpha = /^[a-zA-Z0-9!@#$&()-\\`.+,/\"]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		this.file_size = 1024000;
		this.supported_format = [
			'image/png',
			'image/jpeg',
			'text/plain',
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];

		this.payMode = [
			{ label: 'CASH', value: 'CASH' },
			{ label: 'BANK', value: 'BANK' },
		];

	}
	getParentExpenseDetails = (parentId) => {
		this.props.expenseCreateActions
			.getExpenseDetail(parentId)
			.then((res) => {
				if (res.status === 200) {
					this.getCompanyCurrency();
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
								) : ""
					this.setState(
						{

							loading: false,
							current_expense_id: this.props.location.state.expenseId,
							initValue: {
								expenseNumber: res.data.expenseNumber,
								payee: res.data.payee ? res.data.payee : '',
								expenseDate: res.data.expenseDate ? res.data.expenseDate : '',
								currencyCode: res.data.currencyCode ? res.data.currencyCode : '',
								currencyCode: res.data.currencyCode ? res.data.currencyCode : '',
								currencyName: res.data.currencyName ? res.data.currencyName : '',
								expenseCategory: res.data.expenseCategory
									? res.data.expenseCategory
									: '',
								expenseAmount: res.data.expenseAmount,
								vatCategoryId: vatCategoryId ? vatCategoryId : '',
								payMode: res.data.payMode ? res.data.payMode : '',
								bankAccountId: res.data.bankAccountId
									? res.data.bankAccountId
									: '',
								exclusiveVat: res.data.exclusiveVat && res.data.exclusiveVat != null ? res.data.exclusiveVat : '',
								exchangeRate: res.data.exchangeRate ? res.data.exchangeRate : '',
								expenseDescription: res.data.expenseDescription,
								receiptNumber: res.data.receiptNumber,
								attachmentFile: res.data.attachmentFile,
								receiptAttachmentDescription:
									res.data.receiptAttachmentDescription,
								fileName: res.data.fileName ? res.data.fileName : '',
								filePath: res.data.receiptAttachmentPath
									? res.data.receiptAttachmentPath
									: '',
								isReverseChargeEnabled: res.data.isReverseChargeEnabled ? res.data.isReverseChargeEnabled : false,
								placeOfSupplyId: res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '',
								taxTreatmentId: res.data.taxTreatmentId ? res.data.taxTreatmentId : '',
								notes: res.data.notes
									? res.data.notes
									: '',

							},
							payee: res.data.payee ? res.data.payee : '',
							expenseType: res.data.expenseType ? true : false,
							isVatClaimable: res.data.isVatClaimable ? res.data.isVatClaimable : false,
							showPlacelist: res.data.taxTreatmentId !== 8 ? true : false,
							lockPlacelist: res.data.taxTreatmentId === 7 ? true : false,
							taxTreatmentId: res.data.taxTreatmentId ? res.data.taxTreatmentId : '',
							isReverseChargeEnabled: res.data.isReverseChargeEnabled ? res.data.isReverseChargeEnabled : false,
							exclusiveVat: res.data.exclusiveVat == true ? true : false,
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

							let tax = selectOptionsFactory.renderOptions('name', 'id', this.state.taxTreatmentList, 'Tax Treatment',).find((option) => option.value == res.data.taxTreatmentId)
							this.formRef.current.setFieldValue('taxTreatmentId', tax, true);

							this.placelistSetting(tax, undefined)
							let placelist = [
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
							let placeofSupply = placelist.find((option) => option.value == res.data.placeOfSupplyId,)
							this.formRef.current.setFieldValue('placeOfSupplyId', placeofSupply, true);

							let expenseCategory = selectOptionsFactory.renderOptions('transactionCategoryName', 'transactionCategoryId', this.props.expense_categories_list, 'Expense Category',)
								.find((option) => option.value == res.data.expenseCategory);
							this.formRef.current.setFieldValue('expenseCategory', expenseCategory, true);
							this.formRef.current.setFieldValue('expenseDate', new Date(res.data.expenseDate), true);
							this.formRef.current.setFieldValue('currencyCode', res.data.currencyCode ?? '', true);
							this.formRef.current.setFieldValue('exchangeRate', res.data.exchangeRate ?? '', true);
							this.formRef.current.setFieldValue('currencyName', res.data.currencyName ?? '', true);
							let payMode = selectOptionsFactory.renderOptions('label', 'value', this.props.pay_mode_list, '',)
								.find((option) => option.value == res.data.payMode)
							this.formRef.current.setFieldValue('payMode', payMode, true);
							this.formRef.current.setFieldValue('expenseAmount', res.data.expenseAmount, true);
							let vat = selectOptionsFactory.renderOptions(
								'name',
								'id',
								this.props.vat_list,
								'VAT',
							).find((option) => option.value == res.data.vatCategoryId)
							if (res.data.vatCategoryId === 10) {
								vat = {};
								vat.label = "N/A";
								vat.value = "10";
							}
							this.formRef.current.setFieldValue('vatCategoryId', vat, true);
							this.formRef.current.setFieldValue('expenseDescription', res.data.expenseDescription, true);
							this.formRef.current.setFieldValue('receiptNumber', res.data.receiptNumber, true);
							// this.formRef.current.setFieldValue('receiptAttachmentDescription', res.data.receiptAttachmentDescription, true);
							// this.formRef.current.setFieldValue('notes',  res.data.notes, true);

							let payee = selectOptionsFactory.renderOptions('label', 'value', this.props.pay_to_list, 'Payee',)
								.find((option) => option.label == res.data.payee)
							this.formRef.current.setFieldValue('payee', payee, true);
						},
					);
					this.ReverseChargeSetting(res.data.taxTreatmentId, "")
				}

			})
			.catch((err) => {
				this.setState({ loading: false });
			});
	}


	componentDidMount = () => {
		this._isMounted = true;
		this.initializeData();
		this.getExpenseNumber();
		// this.savestate()
		if (this.props.location.state && this.props.location.state.parentId)
			this.getParentExpenseDetails(this.props.location.state.parentId);
		this.getDefaultNotes()
	};
	getDefaultNotes = () => {
		this.props.commonActions.getNoteSettingsInfo().then((res) => {
			if (res.status === 200) {
				this.formRef.current.setFieldValue('notes', res.data.defaultNotes, true);
				this.formRef.current.setFieldValue('footNote', res.data.defaultFootNotes, true);

			}
		})
	}
	initializeData = () => {
		this.props.expenseCreateActions.getPaytoList();
		this.props.expenseActions.getVatList();
		this.props.expenseActions.getExpenseCategoriesList();
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
		this.props.expenseActions.getBankList();
		this.props.expenseActions.getPaymentMode();
		this.props.expenseActions.getUserForDropdown();
		this.getCompanyCurrency();
		this.getTaxTreatmentList();
		this.getcurentCompanyUser()
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

		});
	}
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
	handleSubmit = (data, resetForm) => {
		this.setState({
			disabled: true,
			disableLeavePage: true
		});
		const {
			expenseNumber,
			payee,
			placeOfSupplyId,
			expenseDate,
			currencyCode,
			project,
			expenseCategory,
			expenseAmount,
			exchangeRate,
			employee,
			expenseDescription,
			receiptNumber,
			// attachmentFile,
			receiptAttachmentDescription,
			vatCategoryId,
			payMode,
			bankAccountId,
			exclusiveVat,
			taxTreatmentId,
			expenseType,
			notes,
			footNote
		} = data;
		let formData = new FormData();

		formData.append('isVatClaimable', this.state.isVatClaimable);

		formData.append('delivaryNotes', notes);
		formData.append('footNote', footNote ? footNote : '')
		formData.append('expenseNumber', expenseNumber ? expenseNumber : '');
		if (payee)
			formData.append('payee', payee.value ? payee.value : '');
		formData.append('expenseDate', expenseDate !== null ? expenseDate : '');
		formData.append('expenseDescription', expenseDescription);
		formData.append('receiptNumber', receiptNumber);
		formData.append('receiptAttachmentDescription', receiptAttachmentDescription,);
		formData.append('expenseAmount', expenseAmount);
		formData.append('payMode', payee?.value === 'Company Expense' || payee === 'Company Expense' ? payMode?.value ? payMode.value : payMode : '');
		if (expenseCategory && expenseCategory.value) {
			formData.append('expenseCategory', expenseCategory.value);
		}
		if (employee && employee.value) {
			formData.append('employeeId', employee.value);
		}
		if (placeOfSupplyId) {
			formData.append('placeOfSupplyId', placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId);
		}
		if (!this.state.isRegisteredVat) {
			formData.append('taxTreatmentId', '');
			formData.append('vatCategoryId', 10);
			// formData.append("isReverseChargeEnabled",'')
			// formData.append('expenseType', '' );
			formData.append("isReverseChargeEnabled", false)
			formData.append('expenseType', false);
		}
		else {
			if (this.state.isRegisteredVat && taxTreatmentId) {
				formData.append('taxTreatmentId', taxTreatmentId.value ? taxTreatmentId.value : taxTreatmentId);
			}
			if (vatCategoryId) {
				formData.append('vatCategoryId', vatCategoryId.value ? vatCategoryId.value : vatCategoryId);
				if (this.state.exclusiveVat !== undefined) {
					formData.append('exclusiveVat', this.state.exclusiveVat);
				}
			}
			formData.append("isReverseChargeEnabled", this.state.isReverseChargeEnabled)
			formData.append('expenseType', this.state.expenseType);

		}
		if (exchangeRate) {
			formData.append('exchangeRate', exchangeRate);
		}
		formData.append('currencyCode', currencyCode ? currencyCode.value ?? currencyCode : '');

		if (bankAccountId && bankAccountId.value && payMode.value === 'BANK') {
			formData.append('bankAccountId', bankAccountId.value);
		}
		if (project && project.value) {
			formData.append('projectId', project.value);
		}
		if (this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		this.setState({ loading: true, loadingMsg: "Creating Expense..." });
		this.props.expenseCreateActions
			.createExpense(formData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Expense Created Successfully'
					);
					if (this.state.createMore) {
						resetForm(this.state.initValue);
						this.setState({
							createMore: false,
							loading: false,
							disableLeavePage: false,
							expenseDateForVatValidation: new Date(),
							disabled: false,
						});
						this.getExpenseNumber()
					} else {
						this.props.history.push('/admin/expense/expense');
						this.setState({ disabled: false, loading: false, });
					}
				}
			})
			.catch((err) => {
				this.setState({ disabled: false, loading: false, });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Expense Created Unsuccessfully'
				);
			});
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
	setExchange = (value) => {
		if (this.props.currency_convert_list) {
			let result = this.props.currency_convert_list.filter((obj) => {
				return obj.currencyCode === value;
			});
			if (result && result[0] && result[0].exchangeRate)
				this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);
		}
	};

	setCurrency = (value) => {
		if (this.props.currency_convert_list) {
			let result = this.props.currency_convert_list.filter((obj) => {
				return obj.currencyCode === value;
			});
			if (result[0] && result[0].currencyName) {
				this.formRef.current.setFieldValue('currencyName', result[0].currencyName, true);
			}
		}
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
	getExpenseNumber = () => {

		this.props.expenseCreateActions.getExpenseNumber().then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{ expenseNumber: res.data },
					},
				});

				if (res.data && res.data != null) {
					this.formRef.current.setFieldValue('expenseNumber', res.data, true, true);
					this.expenseValidationCheck(res.data);
				}
				// this.validationCheck(res.data)

			}
		});

	}


	expenseValidationCheck = (value) => {
		const data = {
			moduleType: 18,
			name: value,
		};
		this.props.expenseCreateActions
			.checkExpenseCodeValidation(data)
			.then((response) => {
				if (response.data === 'Expense Number Already Exists') {
					this.setState({
						exist: true,
					},

						() => { },
					);
				} else {
					this.setState({
						exist: false,
					});
				}
			});
	};
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
							// { label: 'KUWAIT', value: '11' },
							// { label: 'QATAR', value: '12' },
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
						let placeOfSupplyId = this.state.placelist.find(
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
									// { label: 'BAHRAIN', value: '8' },
									// { label: 'SAUDI ARABIA', value: '9' },
									// { label: 'OMAN', value: '10' },
									// { label: 'KUWAIT', value: '11' },
									// { label: 'QATAR', value: '12' },
								]
						})

	}

	ReverseChargeSetting = (option, props) => {
		if (this.state.isDesignatedZone == true) {
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
		// switch(option){

		// 	case 1: 
		// 	case 2: 
		// 	case 3: 
		// 	case 4: 
		// 	case 8: 
		// 	this.setState({
		// 		showReverseCharge:false,
		// 	})
		// 	break;

		// 	case 5: 
		// 	case 6: 
		// 	case 7: 
		// 	this.setState({
		// 		showReverseCharge:true,
		// 	})
		// 	break;


		// }
		else {
			//Not Designated Zone		
			if (this.state.isDesignatedZone == false) {
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
				// switch(option.value){

				// 	case 1: 
				// 	case 2: 
				// 	case 4: 
				// 	case 5: 
				// 	case 6: 
				// 	case 7: 
				// 	this.setState({
				// 		showReverseCharge:true,
				// 	})
				// 			break;

				// 	case 3: 
				// 	case 8: 
				// 	this.setState({
				// 		showReverseCharge:false,
				// 	})
				// 			break;
			}
		}

	}

	renderVat = (props) => {
		let vat_list = []
		let vatIds = []
		if (this.state.isRegisteredVat && (this.state.expenseDateForVatValidation > this.state.companyVATRegistrationDate)) {
			if (this.state.isDesignatedZone && this.state.isDesignatedZone != null && this.state.isDesignatedZone == true) {
				switch (props.values.taxTreatmentId && props.values.taxTreatmentId.value ? props.values.taxTreatmentId.value : '') {

					case 1:
					case 3:
						if (this.state.isReverseChargeEnabled == false)
							vatIds = [1, 2, 3]

						break;

					case 2:
					case 4:
					case 8:
						if (this.state.isReverseChargeEnabled == false)
							vatIds = [4]

						break;

					case 5:
					case 6:
					case 7:
						if (this.state.isReverseChargeEnabled == false)
							vatIds = [3]
						else if (this.state.isReverseChargeEnabled == true)
							vatIds = [1, 2]
						break;

					case 8:
						if (this.state.isReverseChargeEnabled == false)
							vatIds = [4]

						break;
				}
			}
			else
				//Not Designated Zone		
				if (this.state.isDesignatedZone == false)
					switch (props.values.taxTreatmentId && props.values.taxTreatmentId.value ? props.values.taxTreatmentId.value : '') {

						case 1:
							if (this.state.isReverseChargeEnabled == false)
								vatIds = [1, 2, 3]
							else if (this.state.isReverseChargeEnabled == true)
								vatIds = [1, 2]
							break;

						case 3:
							if (this.state.isReverseChargeEnabled == false)
								vatIds = [1, 2, 3]

							break;

						case 2:
						case 4:
						case 5:
						case 6:
						case 7:
							if (this.state.isReverseChargeEnabled == false)
								vatIds = [3]
							else if (this.state.isReverseChargeEnabled == true)
								vatIds = [1, 2]
							break;

						case 8:
							if (this.state.isReverseChargeEnabled == false)
								vatIds = [4]

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
					<Label htmlFor="vatCategoryId"><span className="text-danger">* </span>{strings.VAT}</Label>
					<Select
						// styles={customStyles}
						// className="select-default-width"

						options={
							vat_list
								? selectOptionsFactory.renderOptions(
									'name',
									'id',
									vat_list,
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

	//added by mudassar to unmount the asyn call 
	componentWillUnmount() {
		this._isMounted = false;
	}

	render() {
		strings.setLanguage(this.state.language);
		const { initValue, payMode, exist, taxTreatmentList, placelist, vat_list, loading, loadingMsg } = this.state;
		const {
			// currency_list,
			expense_categories_list,
			expense_categories_list_Sorted,
			// vat_list,
			// profile,
			// user_list,
			pay_mode_list,
			bank_list,
			currency_convert_list,
			pay_to_list,
		} = this.props;
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
		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div>
					<div className="create-expense-screen">
						<div className="animated fadeIn">
							<Row>
								<Col lg={12} className="mx-auto">
									<Card>
										<CardHeader>
											<Row>
												<Col lg={12}>
													<div className="h4 mb-0 d-flex align-items-center">
														<i className="fab fa-stack-exchange" />
														<span className="ml-2">{strings.CreateExpense}  </span>
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

																// this.setState({
																//   selectedCurrency: null,
																//   selectedProject: null,
																//   selectedBankAccount: null,
																//   selectedCustomer: null

																// })
															}}
															validate={(values) => {
																let errors = {};
																// if (
																// 	values.payMode.value === 'BANK' &&
																// 	!values.bankAccountId
																// ) {
																// 	errors.bankAccountId = 'Bank account is required';
																// }
																if (values.payee.value === 'Company Expense') {
																	if (values.payMode.value != "CASH") {
																		errors.payMode = 'Pay through is required'
																	}

																}
																// if(values.payMode.value === "CASH"){
																// 	errors.payMode = 'Pay through is required'
																// }

																if (values.expenseNumber && exist === true) {
																	errors.expenseNumber = 'Expense number already exists'
																}
																if (this.state.isRegisteredVat && !values.vatCategoryId &&
																	values.expenseCategory && values.expenseCategory.value !== 34) {
																	errors.vatCategoryId = strings.VATIsRequired;
																}
																if (this.state.isRegisteredVat && !values.taxTreatmentId &&
																	values.expenseCategory && values.expenseCategory.value !== 34) {
																	errors.taxTreatmentId = strings.TaxTreatmentRequired;
																}
																if (!values.placeOfSupplyId && values.taxTreatmentId.value !== 8 && this.state.showPlacelist == true) {
																	errors.placeOfSupplyId = 'Place of supply is required';
																}
																return errors;
															}}
															validationSchema={Yup.object().shape({
																expenseNumber: Yup.string().required(
																	strings.Expense_Number_Required
																),
																expenseCategory: Yup.string().required(
																	strings.Expense_Category_Required
																),
																expenseDate: Yup.date().required(
																	'Expense date is required',
																),
																currencyCode: Yup.string().required(
																	strings.CurrencyIsRequired
																),
																payee: Yup.string().required(
																	strings.PaidByRequired
																),
																expenseAmount: Yup.string().required(
																	strings.AmountIsRequired
																)
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

																payMode: Yup.string().required(
																	strings.PayThroughIsRequired
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
																					this.supported_format.includes(value.type))
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
																					{/* <i
																				id="ProductCodeTooltip"
																				className="fa fa-question-circle ml-1"
																			></i>
																			<UncontrolledTooltip
																				placement="right"
																				target="ProductCodeTooltip"
																			>
																				Product Code - Unique identifier code
																				for the product
																			</UncontrolledTooltip> */}
																				</Label>
																				<Input
																					type="text"
																					maxLength="50"
																					id="expenseNumber"
																					name="expenseNumber"
																					placeholder={strings.Enter + " Expense Number"}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExInvNum.test(
																								option.target.value,
																							)
																						) {
																							props.handleChange('expenseNumber')(
																								option,
																							);
																						}
																						this.expenseValidationCheck(
																							option.target.value,
																						);
																					}}
																					// onBlur={handleBlur}
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
																			<FormGroup className="mb-3">
																				<Label htmlFor="expenseCategoryId">
																					<span className="text-danger">* </span>
																					{strings.ExpenseCategory}
																				</Label>
																				<Select
																					options={
																						expense_categories_list && expense_categories_list_Sorted
																							? expense_categories_list_Sorted
																							: []
																					}
																					value={props.values.expenseCategory}
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
																					placeholder={strings.Select + strings.ExpenseCategory}
																					id="expenseCategory"
																					name="expenseCategory"

																					className={
																						props.errors.expenseCategory &&
																							props.touched.expenseCategory
																							? 'is-invalid'
																							: ''
																					}
																				// onChange={(option) =>
																				// 	props.handleChange('expenseCategory')(
																				// 		option,
																				// 	)
																				// }
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
																					selected={props.values.expenseDate}
																					value={props.values.expenseDate}
																					showMonthDropdown
																					showYearDropdown
																					dropdownMode="select"
																					dateFormat="dd-MM-yyyy"
																					//minDate={new Date()}
																					onChange={(value) => {
																						if ((this.state.expenseDateForVatValidation < this.state.companyVATRegistrationDate && value > this.state.companyVATRegistrationDate) || (value < this.state.companyVATRegistrationDate && this.state.expenseDateForVatValidation > this.state.companyVATRegistrationDate)) {
																							props.handleChange('vatCategoryId')('');
																						}
																						this.setState({ expenseDateForVatValidation: value });
																						props.handleChange('expenseDate')(value);
																					}}
																				/>
																				{props.errors.expenseDate &&
																					props.touched.expenseDate && (
																						<div className="invalid-feedback">
																							{props.errors.expenseDate.includes("final value was:") ? strings.ExpenseDateRequired : props.errors.expenseDate}
																						</div>
																					)}
																			</FormGroup>
																		</Col>

																	</Row>
																	<Row>
																		{this.state.isRegisteredVat && props.values.expenseCategory && (props.values?.expenseCategory?.value ? props.values?.expenseCategory?.value !== 34 : props.values?.expenseCategory !== 34) && (
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
																						value={props.values.taxTreatmentId}
																						onChange={(option) => {
																							// this.setState({
																							//   selectedVatCategory: option.value
																							// })
																							if (option && option.value) {

																								props.handleChange('taxTreatmentId')(
																									option,
																								);
																								props.handleChange('placeOfSupplyId')('');
																								// for resetting Vat
																								props.handleChange('vatCategoryId')('');
																								//placelist Setup
																								this.placelistSetting(option, props)
																								// ReverseCharge setup
																								this.ReverseChargeSetting(option.value, props)
																								this.setState({ isReverseChargeEnabled: false, exclusiveVat: true })
																								this.setState({ taxTreatmentId: option.value })
																							} else {
																								props.handleChange('taxTreatmentId')(
																									'',
																								);
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
																		{this.state.showPlacelist == true && props.values.expenseCategory && (props.values?.expenseCategory?.value ? props.values?.expenseCategory?.value !== 34 : props.values?.expenseCategory !== 34) && (<Col lg={3}>
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
																								'Place Of Supply',

																							)
																							: []
																					}
																					value={props.values.placeOfSupplyId}
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
																		{this.state.isRegisteredVat && props.values.expenseCategory && (props.values?.expenseCategory?.value ? props.values?.expenseCategory?.value !== 34 : props.values?.expenseCategory !== 34) && (
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
																				<Label htmlFor="payee">
																					<span className="text-danger">* </span>{strings.PaidBy}
																				</Label>
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
																					value={props.values.payee}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('payee')(option,);
																							this.setState({ payee: option ? option : option.value })
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
																					<span className="text-danger">* </span>{strings.Amount}
																				</Label>
																				<Input
																					type="text"
																					min="0"
																					maxLength="14,2"
																					name="expenseAmount"
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
																					placeholder={"Enter" + " " + strings.Amount}
																				/>
																				{props.errors.expenseAmount &&
																					props.touched.expenseAmount && (
																						<div className="invalid-feedback">
																							{props.errors.expenseAmount}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		{this.state.isRegisteredVat && props.values.expenseCategory && (props.values?.expenseCategory?.value ? props.values?.expenseCategory?.value !== 34 : props.values?.expenseCategory !== 34) &&
																			(this.renderVat(props))
																		}
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="currencyCode">
																					<span className="text-danger">* </span>
																					{strings.Currency}
																				</Label>
																				<Select
																					id="currencyCode"
																					name="currencyCode"
																					// styles={customStyles}
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
																					value={props.values.currencyCode?.value ? props.values.currencyCode :
																						currency_convert_list
																						&& selectCurrencyFactory.renderOptions(
																							'currencyName',
																							'currencyCode',
																							currency_convert_list,
																							'Currency',
																						).find(obj => obj.value === props.values.currencyCode)
																					}
																					onChange={(option) => {
																						if (option.value != "") {
																							props.handleChange('currencyCode')(option);
																							this.setExchange(option.value);
																							this.setCurrency(option.value);
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
																		{(props.values?.payee?.value === 'Company Expense' || props.values?.payee === 'Company Expense') &&
																			<Col lg={3}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="payMode"><span className="text-danger">* </span> {strings.PayThrough}</Label>
																					<Select
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
																						value={props.values.payMode}
																						onChange={(option) => {
																							if (option && option.value) {
																								props.handleChange('payMode')(option,);
																							} else {
																								props.handleChange('payMode')('');
																							}
																						}}
																						placeholder={strings.Select + strings.PayThrough}
																						id="payMode"
																						name="payMode"
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
															
																	{props.values.vatCategoryId !== '' && props.values.vatCategoryId.label !== 'Select VAT' && props.values.expenseCategory && (props.values?.expenseCategory?.value ? props.values?.expenseCategory?.value !== 34 : props.values?.expenseCategory !== 34) &&
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
																							className="react-switch "
																						/>
																						<span className='ml-4'>{strings.InclusiveVAT}</span>

																					</FormGroup>
																				</Col>
																				<Col></Col>
																				<Col></Col></Row>
																		)
																	}
																	<Row>
																		{(this.state.isRegisteredVat && props.values.expenseCategory && (props.values?.expenseCategory?.value ? props.values?.expenseCategory?.value !== 34 : props.values?.expenseCategory !== 34)) && (((this.state.isDesignatedZone && (this.state.taxTreatmentId === 5 || this.state.taxTreatmentId === 6 || this.state.taxTreatmentId === 7))
																			|| (!this.state.isDesignatedZone && (this.state.taxTreatmentId !== 3 && this.state.taxTreatmentId !== 8))
																		)) && (
																				<Col>
																					
																					<Checkbox
																						id="isReverseChargeEnabled"
																						checked={this.state.isReverseChargeEnabled}
																						onChange={(option) => {
																							this.setState({ isReverseChargeEnabled: !this.state.isReverseChargeEnabled, exclusiveVat: true })
																							// for resetting Vat
																							props.handleChange('vatCategoryId')('');
																						}}
																					/>
																					<Label>{strings.IsReverseCharge}</Label>
																				</Col>)}
																	</Row>
																	<hr />
																	<Row style={{ display: props.values.exchangeRate === 1 ? 'none' : '' }}>
																		<Col>
																			<Label>
																				{strings.CurrencyExchangeRate}
																			</Label>
																		</Col>
																	</Row>
																	<Row style={{ display: props.values.exchangeRate === 1 ? 'none' : '' }}>
																		<Col lg={1}>
																			<Input
																				disabled
																				id="1"
																				name="1"
																				value={
																					1}

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
																						id="currencyName"
																						name="currencyName"

																						value={props.values.currencyName}
																						onChange={(value) => {
																							props.handleChange('currencyName')(
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
																						type="number"
																						min="0"
																						className="form-control"
																						id="exchangeRate"
																						name="exchangeRate"
																						maxLength="20"
																						value={props.values.exchangeRate}
																						onChange={(value) => {
																							props.handleChange('exchangeRate')(
																								value,
																							);
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
																				value={
																					this.state.basecurrency.currencyName}

																			/>
																		</Col>
																	</Row>
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
																					placeholder={"Enter" + " " + strings.Description}
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
																	<hr />
																	<Row>
																		<Col lg={8}>
																			{/* <FormGroup className="py-2">
																		<Label htmlFor="notes">{strings.Notes}</Label><br/>
																		<TextareaAutosize
																			type="textarea"
																			style={{width: "870px"}}
																			className="textarea form-control"
																			maxLength="255"
																			name="notes"
																			id="notes"
																			minRows={2}
																			placeholder={strings.DeliveryNotes}
																			onChange={(option) =>
																				props.handleChange('notes')(option)
																			}
																			value={props.values.notes}
																		/>
																	</FormGroup> */}
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
																				{/* <Col lg={6}>
																			<FormGroup className="mb-3">
																				<Field
																					name="attachmentFile"
																					render={({ field, form }) => (
																						<div>
																							<Label>{strings.ReceiptAttachment}</Label>{' '}
																							<br />
																							<Button
																								color="primary"
																								onClick={() => {
																									document
																										.getElementById('fileInput')
																										.click();
																								}}
																								className="btn-square mr-3"
																							>
																								<i className="fa fa-upload"></i>{' '}
																								{strings.upload}
																							</Button>
																							<input
																								id="fileInput"
																								ref={(ref) => {
																									this.uploadFile = ref;
																								}}
																								type="file"
																								style={{ display: 'none' }}
																								onChange={(e) => {
																									this.handleFileChange(
																										e,
																										props,
																									);
																								}}
																							/>
																							{this.state.fileName && (
																								<div>
																									<i
																										className="fa fa-close"
																										onClick={() =>
																											this.setState({
																												fileName: '',
																											})
																										}
																									></i>{' '}
																									{this.state.fileName}
																								</div>
																							)}
																						</div>
																					)}
																				/>
																				{props.errors.attachmentFile &&
																					props.touched.attachmentFile && (
																						<div className="invalid-file">
																							{props.errors.attachmentFile}
																						</div>
																					)}
																			</FormGroup>
																		</Col> */}
																			</Row>
																			{/* <FormGroup className="mb-3">
																		<Label htmlFor="receiptAttachmentDescription">
																			{strings.AttachmentDescription}
																		</Label><br/>
																		<TextareaAutosize
																			type="textarea"
																			className="textarea form-control"
																			maxLength="250"
																			style={{width: "870px"}}
																			name="receiptAttachmentDescription"
																			id="receiptAttachmentDescription"
																			minRows={2}
																			placeholder={strings.ReceiptAttachmentDescription}
																			onChange={(option) =>
																				props.handleChange(
																					'receiptAttachmentDescription',
																				)(option)
																			}
																			value={
																				props.values
																					.receiptAttachmentDescription
																			}
																		/>
																	</FormGroup> */}
																		</Col>
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
																						//  added validation popup	msg
																						console.log(props.errors, this.state.exist, "ERRORS");
																						props.handleBlur();
																						if (props.errors && Object.keys(props.errors).length != 0) {
																							if (props.errors.expenseNumber && this.state.exist === true)
																								this.props.commonActions.fillManDatoryDetails();
																						}
																						this.setState(
																							{ createMore: false },
																							() => {
																								props.handleSubmit();
																							},
																						);
																					}}
																				>
																					<i className="fa fa-dot-circle-o"></i>{' '}
																					{this.state.disabled
																						? 'Creating...'
																						: strings.Create}
																				</Button>
																				{this.props.location.state && this.props.location.state.parentId ? "" : <Button
																					name="button"
																					color="primary"
																					className="btn-square mr-3"
																					disabled={this.state.disabled}
																					onClick={() => {
																						//	added validation popup	msg
																						console.log(props.errors, this.state.exist, "ERRORS");
																						props.handleBlur();
																						if (props.errors && Object.keys(props.errors).length != 0) {
																							if (props.errors.expenseNumber && this.state.exist === true)
																								this.props.commonActions.fillManDatoryDetails();
																						}

																						this.setState(
																							{ createMore: true },
																							() => {
																								props.handleSubmit();
																							},
																						);
																					}}
																				>
																					<i className="fa fa-refresh"></i> 	{this.state.disabled
																						? 'Creating...'
																						: strings.CreateandMore}
																				</Button>}
																				<Button
																					color="secondary"
																					className="btn-square"
																					onClick={() => {
																						if (this.props?.location?.state?.renderURL) {
																							this.props.history.push(
																								`${this.props?.location?.state?.renderURL}`, 
																								{expenseId: this.props?.location?.state?.renderID },);
																						} else
																							this.props.history.push(
																								'/admin/expense/expense',
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
					{this.state.disableLeavePage ? "" : <LeavePage />}
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateExpense);
