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
	NavLink,
	UncontrolledTooltip
} from 'reactstrap';
import { Checkbox } from '@material-ui/core';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import * as Yup from 'yup';
import { Formik, Field } from 'formik';
import * as DebitNotesDetailActions from './actions';
import * as DebitNotesActions from '../../actions';
import * as SupplierInvoiceDetailActions from './actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { TextField } from '@material-ui/core';

import { LeavePage, Loader, ConfirmDeleteModal, ProductTableCalculation } from 'components';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory, renderList } from 'utils';

import './style.scss';
import moment from 'moment';
import Switch from "react-switch";
import API_ROOT_URL from '../../../../constants/config';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';


const mapStateToProps = (state) => {
	return {
		tax_treatment_list: state.common.tax_treatment_list,
		contact_list: state.customer_invoice.contact_list,
		currency_list: state.customer_invoice.currency_list,
		vat_list: state.common.vat_list,
		product_list: state.common.product_list,
		excise_list: state.common.excise_list,
		customer_list: state.common.customer_list,
		country_list: state.customer_invoice.country_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.common.currency_convert_list,
		company_details: state.common.company_details,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
		debitNotesActions: bindActionCreators(DebitNotesActions, dispatch,),
		debitNotesDetailActions: bindActionCreators(DebitNotesDetailActions, dispatch,),
		commonActions: bindActionCreators(CommonActions, dispatch),

		ProductActions: bindActionCreators(ProductActions, dispatch),
		supplierInvoiceDetailActions: bindActionCreators(
			SupplierInvoiceDetailActions,
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
class DetailDebitNote extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			dialog: false,
			disabled: false,
			disabled1: false,
			customer_currency_symbol: '',
			discountOptions: [
				{ value: 'FIXED', label: 'Fixed' },
				{ value: 'PERCENTAGE', label: '%' },
			],
			exciseTypeOption: [
				{ value: 'Inclusive', label: 'Inclusive' },
				{ value: 'Exclusive', label: 'Exclusive' },
			],
			discount_option: '',
			data: [],
			debitNoteId: '',
			initValue: {
				total_excise: 0,
				totalNet: 0,
				totalVatAmount: 0,
				totalAmount: 0,
				totalDiscount: 0,
			},
			contactType: 1,
			openCustomerModal: false,
			openProductModal: false,
			invoiceSelected: false,
			term: '',
			placeOfSupplyId: '',
			selectedType: '',
			discountPercentage: '',
			discountAmount: 0,
			fileName: '',
			purchaseCategory: [],
			basecurrency: [],
			customer_currency: '',
			loadingMsg: "Loading",
			showInvoiceNumber: false,
			taxType: false,
			disableLeavePage: false,
			isCreatedWithoutInvoice: false,
			isReverseChargeEnabled: false,
			receiptDate: '',
		};
		this.formRef = React.createRef();
		this.regEx = /^[0-9\b]+$/;
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
	}

	componentDidMount = () => {
		this.initializeData();
		this.props.commonActions.getVatList();
		this.props.commonActions.getCustomerList(this.state.contactType,).then(response => {
			if (response.status === 200)
				this.getCurrency(response.data.contactId)
		});
		this.props.commonActions.getExciseList();
		this.props.debitNotesActions.getCountryList();
		this.props.commonActions.getProductList();
	};
	initializeData = () => {
		this.props.commonActions.getTaxTreatmentList();
		if (this.props.location.state && this.props.location.state.id) {
			this.props.debitNotesActions
				.getDebitNoteById(this.props.location.state.id,
					this.props.location.state.isCNWithoutProduct ? this.props.location.state.isCNWithoutProduct : false)
				.then((res) => {
					if (res.status === 200) {
						this.setState(
							{
								taxType: res.data.taxType ? res.data.taxType : false,
								isCreatedWithoutInvoice: res.data.invoiceId ? false : true,
								debitNoteId: this.props.location.state.id,
								isReverseChargeEnabled: res.data.isReverseChargeEnabled,
								initValue: {
									invoiceNumber: res.data.invoiceId ? { value: res.data.invoiceId, label: res.data.invoiceNumber } : '',
									receiptAttachmentDescription: res.data
										.receiptAttachmentDescription
										? res.data.receiptAttachmentDescription
										: '',
									referenceNumber: res.data.referenceNo
										? res.data.referenceNo
										: '',
									contact_po_number: res.data.contactPoNumber
										? res.data.contactPoNumber
										: '',
									currency: res.data.currencyCode ? res.data.currencyCode : '',
									exchangeRate: res.data.exchangeRate ? res.data.exchangeRate : '',
									currencyName: res.data.currencyName ? res.data.currencyName : '',
									invoiceDate: res.data.creditNoteDate
										? new Date(res.data.creditNoteDate)
										: '',
									contactId: res.data.contactId ? res.data.contactId : '',
									debitNoteNumber: res.data.creditNoteNumber
										? res.data.creditNoteNumber
										: '',

									totalAmount: res.data.totalAmount ? res.data.totalAmount : 0,
									debitAmount: res.data.totalAmount ? res.data.totalAmount : 0,
									notes: res.data.notes ? res.data.notes : '',
									lineItemsString: res.data.invoiceLineItems
										? res.data.invoiceLineItems
										: [],
									discount: res.data.discount ? res.data.discount : 0,
									discountPercentage: res.data.discountPercentage
										? res.data.discountPercentage
										: '',
									discountType: res.data.discountType
										? res.data.discountType
										: '',

									fileName: res.data.fileName ? res.data.fileName : '',
									// filePath: res.data.filePath ? res.data.filePath : '',
									total_excise: res.data.totalExciseTaxAmount ? res.data.totalExciseTaxAmount : 0,
								},
								isDNWIWithoutProduct: res.data.invoiceLineItems ? false : true,
								discountPercentage: res.data.discountPercentage
									? res.data.discountPercentage
									: '',
								data: res.data.invoiceLineItems
									? res.data.invoiceLineItems
									: [],
								invoiceSelected: res.data.invoiceId ? true : false,
								remainingInvoiceAmount: res.data.remainingInvoiceAmount,
								loading: false,
							},
							() => {
								const { data } = this.state;

								if (data.length > 0) {
									this.updateAmount(data);
									const idCount =
										data.length > 0
											? Math.max.apply(
												Math,
												data.map((item) => {
													return item.id;
												}),
											)
											: 0;
									this.setState({
										idCount,
									});
									this.formRef.current.setFieldValue(
										'lineItemsString',
										data,
										true,
									);
									this.formRef.current.setFieldTouched(
										`lineItemsString[${data.length - 1}]`,
										false,
										true,
									);
								} else {
									this.setState({
										idCount: 0,
									});
								}
							},
						);
						this.getCurrency(res.data.contactId ? res.data.contactId : '')
						this.formRef.current.setFieldValue('taxTreatmentId', res.data.taxTreatment ? res.data.taxTreatment : '', true);
						this.formRef.current.setFieldValue('contactId', res.data.contactId ? res.data.contactId : '', true);
						this.formRef.current.setFieldValue('remainingInvoiceAmount', res.data.remainingInvoiceAmount, true);
						this.formRef.current.setFieldValue('currency', res.data.currencyCode ? res.data.currencyCode : '', true);
						this.formRef.current.setFieldValue('invoiceNumber', res.data.invoiceId ? res.data.invoiceId : '', true);
						this.getInvoiceDetails(this.state.initValue.invoiceNumber.value)
						this.purchaseCategory();

					}
				});
		} else {
			this.props.history.push('/admin/expense/debit-notes');
		}
	};

	purchaseCategory = () => {
		try {
			this.props.ProductActions.getTransactionCategoryListForPurchaseProduct(
				'10',
			).then((res) => {
				if (res.status === 200) {
					this.setState(
						{
							purchaseCategory: res.data,
							purchaseCategoryOptions: renderList.getTransactionCategoryList(res.data),
						},
						() => {
							console.log(this.state.purchaseCategory);
						},
					);
				}
			});
		} catch (err) {
			console.log(err);
		}
	};

	renderExcise = (cell, row, props) => {
		const { excise_list } = this.props;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.exciseTaxId`}
				render={({ field, form }) => (
					<Select
						styles={customStyles}
						isDisabled
						options={
							excise_list
								? selectOptionsFactory.renderOptions(
									'name',
									'id',
									excise_list,
									'Excise',
								)
								: []
						}
						value={row.exciseTaxId ? excise_list &&
							selectOptionsFactory
								.renderOptions('name', 'id', excise_list, 'Excise')
								.find((option) => option.value === +row.exciseTaxId)
							: ''
						}
						id="exciseTaxId"
						placeholder={strings.Select + strings.Excises}
						onChange={(e) => {

							this.selectItem(
								e.value,
								row,
								'exciseTaxId',
								form,
								field,
								props,
							);

							this.updateAmount(
								this.state.data,
								props,
							);
						}}
						className={`${props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].exciseTaxId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].exciseTaxId
							? 'is-invalid'
							: ''
							}`}
					/>
				)}
			/>
		);
	};

	renderQuantity = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.quantity`}
				render={({ field, form }) => (
					<div>
						<Input
							type="text"
							min="0"
							maxLength="10"
							value={row['quantity'] !== 0 ? row['quantity'] : 0}
							onChange={(e) => {
								if (e.target.value === '' || this.regDecimal.test(e.target.value)) {
									this.selectItem(
										e.target.value,
										row,
										'quantity',
										form,
										field,
										props,
									);
								}
							}}
							placeholder={strings.Quantity}
							className={`form-control 
           						${props.errors.lineItemsString &&
									props.errors.lineItemsString[parseInt(idx, 10)] &&
									props.errors.lineItemsString[parseInt(idx, 10)]
										.quantity &&
									Object.keys(props.touched).length > 0 &&
									props.touched.lineItemsString &&
									props.touched.lineItemsString[parseInt(idx, 10)] &&
									props.touched.lineItemsString[parseInt(idx, 10)]
										.quantity
									? 'is-invalid'
									: ''
								}`}
						/>
						{props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].quantity && (
								<div className="invalid-feedback">
									{props.errors.lineItemsString[parseInt(idx, 10)].quantity}
								</div>
							)}
					</div>
				)}
			/>
		);
	};

	renderUnitPrice = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.unitPrice`}
				render={({ field, form }) => (
					<Input
						type="text"
						disabled
						value={row['unitPrice'] !== 0 ? row['unitPrice'] : 0}
						onChange={(e) => {
							if (
								e.target.value === '' ||
								this.regDecimal.test(e.target.value)
							) {
								this.selectItem(
									e.target.value,
									row,
									'unitPrice',
									form,
									field,
									props,
								);
							}
						}}
						placeholder={strings.UnitPrice}
						className={`form-control 
                       ${props.errors.lineItemsString &&
								props.errors.lineItemsString[parseInt(idx, 10)] &&
								props.errors.lineItemsString[parseInt(idx, 10)]
									.unitPrice &&
								Object.keys(props.touched).length > 0 &&
								props.touched.lineItemsString &&
								props.touched.lineItemsString[parseInt(idx, 10)] &&
								props.touched.lineItemsString[parseInt(idx, 10)]
									.unitPrice
								? 'is-invalid'
								: ''
							}`}
					/>
				)}
			/>
		);
	};

	renderSubTotal = (cell, row, extraData) => {
		return row.subTotal === 0 ? this.state.customer_currency_symbol + " " + row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : this.state.customer_currency_symbol + " " + row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 });
	};

	renderVatAmount = (cell, row, extraData) => {
		return row.vatAmount === 0 ? this.state.customer_currency_symbol + " " + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : this.state.customer_currency_symbol + " " + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 });
	};
	selectItem = (e, row, name, form, field, props) => {
		//e.preventDefault();
		let data = this.state.data;
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				obj[`${name}`] = e;
				idx = index;
			}
			return obj;
		});
		if (
			name === 'unitPrice' ||
			name === 'vatCategoryId' ||
			name === 'quantity'
		) {
			form.setFieldValue(
				field.name,
				this.state.data[parseInt(idx, 10)][`${name}`],
				true,
			);
			this.updateAmount(data, props);
		} else {
			this.setState({ data }, () => {
				form.setFieldValue(
					field.name,
					this.state.data[parseInt(idx, 10)][`${name}`],
					true,
				);
			});
		}
	};

	renderVat = (cell, row, props) => {
		const { vat_list } = this.props;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.vatCategoryId`}
				render={({ field, form }) => (
					<Select
						isDisabled
						styles={customStyles}
						options={
							vat_list
								? selectOptionsFactory.renderOptions(
									'name',
									'id',
									vat_list,
									'Vat',
								)
								: []
						}
						value={
							vat_list &&
							selectOptionsFactory
								.renderOptions('name', 'id', vat_list, 'Vat')
								.find((option) => option.value === +row.vatCategoryId)
						}
						id="vatCategoryId"
						placeholder={strings.Select + strings.Vat}
						onChange={(e) => {
							this.selectItem(
								e.value,
								row,
								'vatCategoryId',
								form,
								field,
								props,
							);
						}}
						className={`${props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].vatCategoryId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].vatCategoryId
							? 'is-invalid'
							: ''
							}`}
					/>
				)}
			/>
		);
	};

	renderDiscount = (cell, row, props) => {
		const { discountOptions } = this.state;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.discountType`}
				render={({ field, form }) => (
					<div>
						<div className="input-group">
							<Input
								disabled
								type="text"
								min="0"
								maxLength="14,2"
								value={row['discount'] !== 0 ? row['discount'] : 0}
								onChange={(e) => {
									if (e.target.value === '' || this.regDecimal.test(e.target.value)) {
										this.selectItem(
											e.target.value,
											row,
											'discount',
											form,
											field,
											props,
										);
									}

									this.updateAmount(
										this.state.data,
										props,
									);

								}}
								placeholder={strings.discount}
								className={`form-control 
		   								${props.errors.lineItemsString &&
										props.errors.lineItemsString[parseInt(idx, 10)] &&
										props.errors.lineItemsString[parseInt(idx, 10)].discount &&
										Object.keys(props.touched).length > 0 &&
										props.touched.lineItemsString &&
										props.touched.lineItemsString[parseInt(idx, 10)] &&
										props.touched.lineItemsString[parseInt(idx, 10)].discount
										? 'is-invalid'
										: ''
									}`}
							/>
							<div className="dropdown open input-group-append">
								<div style={{ width: '100%' }}>
									<Select
										isDisabled
										options={discountOptions}
										id="discountType"
										name="discountType"
										value={
											discountOptions &&
											discountOptions.find((option) => option.value == row.discountType)
										}
										onChange={(e) => {
											this.selectItem(
												e.value,
												row,
												'discountType',
												form,
												field,
												props,
											);
											this.updateAmount(
												this.state.data,
												props,
											);
										}}
									/>
								</div>
							</div>
						</div>
					</div>

				)}

			/>
		);
	}

	discountType = (row) => {
		return this.state.discountOptions &&
			selectOptionsFactory
				.renderOptions('label', 'value', this.state.discountOptions, 'discount')
				.find((option) => option.value === +row.discountType)
	}

	prductValue = (e, row, name, form, field, props) => {
		const { product_list } = this.props;
		let data = this.state.data;
		const result = product_list.find((item) => item.id === parseInt(e));
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				obj['unitPrice'] = parseInt(result.unitPrice);
				// obj['vatCategoryId'] = result.vatCategoryId;
				obj['description'] = result.description;
				// obj['exciseTaxId'] = result.exciseTaxId;
				// obj['isExciseTaxExclusive'] = result.isExciseTaxExclusive;
				idx = index;
			}
			return obj;
		});
		// form.setFieldValue(
		// 	`lineItemsString.${idx}.vatCategoryId`,
		// 	result.vatCategoryId,
		// 	true,
		// );
		form.setFieldValue(
			`lineItemsString.${idx}.unitPrice`,
			result.unitPrice,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.description`,
			result.description,
			true,
		);
		// form.setFieldValue(
		// 	`lineItemsString.${idx}.exciseTaxId`,
		// 	result.exciseTaxId,
		// 	true,
		// );
		this.updateAmount(data, props);
	};
	renderProduct = (cell, row, props) => {
		const { product_list } = this.props;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.productId`}
				render={({ field, form }) => (
					<>
						<Select
							styles={customStyles}
							isDisabled
							options={
								product_list
									? selectOptionsFactory.renderOptions(
										'name',
										'id',
										product_list,
										'Product',
									)
									: []
							}
							value={
								product_list &&
								selectOptionsFactory
									.renderOptions('name', 'id', product_list, 'Product')
									.find((option) => option.value === +row.productId)
							}
							id="productId"
							onChange={(e) => {
								if (e && e.label !== 'Select Product') {
									this.selectItem(e.value, row, 'productId', form, field, props);
									this.prductValue(e.value, row, 'productId', form, field, props);
								}
							}}
							className={`${props.errors.lineItemsString &&
								props.errors.lineItemsString[parseInt(idx, 10)] &&
								props.errors.lineItemsString[parseInt(idx, 10)].productId &&
								Object.keys(props.touched).length > 0 &&
								props.touched.lineItemsString &&
								props.touched.lineItemsString[parseInt(idx, 10)] &&
								props.touched.lineItemsString[parseInt(idx, 10)].productId
								? 'is-invalid'
								: ''
								}`}
						/>
						<div className='mt-1'>
							<TextField
								disabled
								type="textarea"
								inputProps={{ maxLength: 2000 }}
								multiline
								minRows={1}
								maxRows={4}
								value={row['description'] ? row['description'] : ''}
								onChange={(e) => {
									this.selectItem(e.target.value, row, 'description', form, field);
								}}
								placeholder={strings.Description}
								className={`textarea ${props.errors.lineItemsString &&
									props.errors.lineItemsString[parseInt(idx, 10)] &&
									props.errors.lineItemsString[parseInt(idx, 10)].description &&
									Object.keys(props.touched).length > 0 &&
									props.touched.lineItemsString &&
									props.touched.lineItemsString[parseInt(idx, 10)] &&
									props.touched.lineItemsString[parseInt(idx, 10)].description
									? 'is-invalid'
									: ''
									}`}
							/>
						</div>
					</>
				)}
			/>
		);
	};

	renderAccount = (cell, row, props) => {
		const { purchaseCategory, purchaseCategoryOptions } = this.state;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.transactionCategoryId`}
				render={({ field, form }) => (
					<Select
						styles={{
							menu: (provided) => ({ ...provided, zIndex: 9999 }),
						}}
						options={purchaseCategory ? purchaseCategory : []}
						id="transactionCategoryId"
						onChange={(e) => {
							this.selectItem(
								e.value,
								row,
								'transactionCategoryId',
								form,
								field,
								props,
							);
						}}
						isDisabled={true}
						value={purchaseCategoryOptions ? purchaseCategoryOptions.find((obj) => obj.value === row.transactionCategoryId) : ''}
						placeholder={strings.Select + strings.Account}
						className={`${props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)]
								.transactionCategoryId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)]
								.transactionCategoryId
							? 'is-invalid'
							: ''
							}`}
					/>
				)}
			/>
		);
	};

	deleteRow = (e, row, props) => {
		const id = row['id'];
		let newData = [];
		e.preventDefault();
		const data = this.state.data;
		newData = data.filter((obj) => obj.id !== id);
		props.setFieldValue('lineItemsString', newData, true);
		this.updateAmount(newData, props);
	};

	renderActions = (cell, rows, props) => {
		return (
			<Button
				size="sm"
				className="btn-twitter btn-brand icon"
				disabled={this.state.data.length === 1 ? true : false}
				onClick={(e) => {
					this.deleteRow(e, rows, props);
				}}
			>
				<i className="fas fa-trash"></i>
			</Button>
		);
	};

	updateAmount = (data, props) => {
		const { vat_list } = this.props;
		const { taxType } = this.state;
		const list = ProductTableCalculation.updateAmount(data ? data : [], vat_list, taxType);
		this.setState(
			{
				data: list.data,
				initValue: {
					...this.state.initValue,
					...{
						totalNet: list.totalNet ? list.totalNet : 0,
						totalVatAmount: list.totalVatAmount ? list.totalVatAmount : 0,
						totalAmount: list.totalAmount ? list.totalAmount : 0,
						total_excise: list.total_excise ? list.total_excise : 0,
						totalDiscount: list.discount ? list.discount : 0,
					},

				},
			},

		);

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

	handleSubmit = (data) => {
		this.setState({ disabled: true, disableLeavePage: true });
		const { debitNoteId } = this.state;
		const {
			debitNoteNumber,
			email,
			invoiceDate,
			referenceNumber,
			contact_po_number,
			receiptAttachmentDescription,
			notes,
			debitAmount,
			invoiceNumber,
			currency,
			contactId,
			exchangeRate,
		} = data;

		let formData = new FormData();
		formData.append('creditNoteId', debitNoteId);
		formData.append('isCreatedWithoutInvoice', this.state.isCreatedWithoutInvoice);
		formData.append('isCreatedWIWP', this.state.isDNWIWithoutProduct);
		formData.append('creditNoteNumber', debitNoteNumber ? debitNoteNumber : '',);
		formData.append('email', email ? email : '',);
		formData.append('creditNoteDate', invoiceDate ? moment(invoiceDate) : new Date());
		formData.append('referenceNo', referenceNumber !== null ? referenceNumber : '',);
		formData.append('exchangeRate', exchangeRate ? exchangeRate : 1);
		formData.append('contactPoNumber', contact_po_number !== null ? contact_po_number : '',);
		formData.append('receiptAttachmentDescription', receiptAttachmentDescription !== null ? receiptAttachmentDescription : '',);
		formData.append('notes', notes !== null ? notes : '');
		formData.append('type', 13);
		if (this.state.isDNWIWithoutProduct === true)
			formData.append('totalAmount', debitAmount);

		formData.append('vatCategoryId', 2);
		formData.append('taxType', this.state.taxType ? this.state.taxType : false);

		if (invoiceNumber) {
			formData.append('invoiceId', invoiceNumber.value ? invoiceNumber.value : invoiceNumber);
			formData.append('cnCreatedOnPaidInvoice', '1');
		}
		if (!this.state.isDNWIWithoutProduct) {
			formData.append('lineItemsString', JSON.stringify(this.state.data));
			formData.append('totalVatAmount', this.state.initValue.totalVatAmount);
			formData.append('totalAmount', this.state.initValue.totalAmount);
			formData.append('discount', this.state.initValue.totalDiscount);
			formData.append('totalExciseTaxAmount', this.state.initValue.total_excise);
			formData.append('isReverseChargeEnabled', this.state.isReverseChargeEnabled);
		}
		if (contactId) {
			formData.append('contactId', contactId.value ? contactId.value : contactId);
		}
		if (currency) {
			formData.append('currency', currency.value ? currency.value : currency);
		}
		if (this.uploadFile && this.uploadFile.files && this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		this.setState({ loading: true, loadingMsg: "Updating Credit Note..." });
		this.props.debitNotesDetailActions
			.updateDebitNote(formData)
			.then((res) => {
				this.setState({ disabled: false, loading: false });
				this.props.commonActions.tostifyAlert('success', strings.DebitNoteUpdatedSuccessfully);
				this.props.history.push('/admin/expense/debit-notes');
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert('error', strings.DebitNoteUpdatedUnsuccessfully);
				this.setState({ disabled: false, loading: false, disableLeavePage: false });
				this.initializeData();
			});
	};

	deleteDebitNote = () => {
		const message1 =
			<text>
				<b>Delete Debit Note?</b>
			</text>
		const message = 'This Debit Note  will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeDebitNote}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};

	removeDebitNote = () => {
		this.setState({ disabled1: true, disableLeavePage: true });
		const { debitNoteId } = this.state;
		this.props.debitNotesDetailActions
			.deleteDebitNote(debitNoteId)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert('success', strings.DebitNoteDeletedSuccessfully);
					this.props.history.push('/admin/expense/debit-notes');
				}
			})
			.catch((err) => {
				this.setState({ disabled1: false, disableLeavePage: false });
				this.props.commonActions.tostifyAlert('error', strings.DebitNoteDeletedUnsuccessfully);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	getCurrency = (opt) => {
		let currency;
		this.props.customer_list.map(item => {
			if (item.label.contactId == opt) {
				currency = item.label.currency.currencyCode;
				this.formRef.current.setFieldValue('currency', currency, true,);
				this.formRef.current.setFieldValue('customer_currency_symbol', item.label.currency.currencyIsoCode, true,);
				this.setState({ customer_currency_symbol: item.label.currency.currencyIsoCode })
			}
		})
		return currency;
	}
	getTaxTreatment = (opt) => {
		this.props.customer_list.map(item => {
			if (item.label.contactId == opt) {
				this.formRef.current.setFieldValue('taxTreatmentId', item.label.taxTreatment.taxTreatment, true);
			}
		});
	}
	getInvoiceDetails = (value) => {
		if (value) {
			this.props.debitNotesActions
				.getInvoiceById(value).then((response) => {
					if (response.status = 200) {
						const custmerName = {
							label: response.data.organisationName === '' ? response.data.name : response.data.organisationName,
							value: response.data.contactId,
						}
						this.setState({
							receiptDate: response.data.receiptDate ? new Date(moment(response.data.receiptDate, 'YYYY-MM-DD').format()) : new Date(),
							option: custmerName,
							isReverseChargeEnabled: response.data.isReverseChargeEnabled,
							data: response.data.invoiceLineItems ? response.data.invoiceLineItems : [],
							taxType: response.data.taxType ? response.data.taxType : false,
							totalAmount: response.data.totalAmount,
							remainingInvoiceAmount: response.data.remainingInvoiceAmount,
							shippingCharges: response.data.shippingCharges ? response.data.shippingCharges : 0,
							customer_currency_symbol: response.data.currencyIsoCode ? response.data.currencyIsoCode : '',
							initValue: {
								...this.state.initValue,
								...{
									currency: response.data.currencyCode ? response.data.currencyCode : '',
									lineItemsString: response.data.invoiceLineItems ? response.data.invoiceLineItems : [],
									totalAmount: response.data.totalAmount,
									totalDiscount: response.data.discount,
									taxTreatmentId: response.data.taxTreatment ? response.data.taxTreatment : '',
									exchangeRate: response.data.exchangeRate ? response.data.exchangeRate : 1,
								},
							},

						}, () => {
							this.formRef.current.setFieldValue(
								'lineItemsString',
								this.state.data,
								true,
							);
							this.formRef.current.setFieldTouched(
								`lineItemsString[${this.state.data.length - 1}]`,
								false,
								true,
							);
						},);
						this.updateAmount(this.state.data)
						this.formRef.current.setFieldValue('contactId', custmerName, true);
						this.formRef.current.setFieldValue('remainingInvoiceAmount', this.state.remainingInvoiceAmount, true);
						this.formRef.current.setFieldValue('currency', this.state.customer_currency, true);
						this.formRef.current.setFieldValue('taxTreatmentId', response.data.taxTreatment ? response.data.taxTreatment : '', true);
						this.formRef.current.setFieldValue('exchangeRate', response.data.exchangeRate ? response.data.exchangeRate : '', true);
						this.formRef.current.setFieldValue('currency', response.data.currencyCode ? response.data.currencyCode : '', true);
						this.getTaxTreatment(custmerName.value)
						this.getCurrency(custmerName.value)
					}
				});
		}
	}
	render() {
		strings.setLanguage(this.state.language);
		const { data, loadingMsg, initValue, loading, dialog, isCreatedWithoutInvoice, isReverseChargeEnabled } = this.state;

		const { tax_treatment_list, invoice_list, currency_convert_list, customer_list, universal_currency_list, company_details } = this.props;
		let tmpCustomer_list = []
		const { isRegisteredVat, isDesignatedZone } = company_details;

		customer_list.map(item => {
			let obj = { label: item.label.contactName, value: item.value }
			tmpCustomer_list.push(obj)
		})

		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> : <div>
				<div className="detail-customer-invoice-screen">
					<div className="animated fadeIn">
						<Row>
							<Col lg={12} className="mx-auto">
								<Card>
									<CardHeader>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="fa fa-credit-card" />
													<span className="ml-2">Update Debit Note</span>
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
														initialValues={this.state.initValue}
														ref={this.formRef}
														onSubmit={(values, { resetForm }) => {
															this.handleSubmit(values);
														}}
														validate={(values) => {
															let errors = {};

															if (!isCreatedWithoutInvoice && !values.invoiceNumber) {
																errors.invoiceNumber = 'Invoice number is Required';
															}

															if (isCreatedWithoutInvoice == true && !values.debitAmount)
																errors.debitAmount = 'Credit Amount is Required';

															if (this.state.invoiceSelected && (parseFloat(initValue.totalAmount) > parseFloat(this.state.remainingInvoiceAmount))) {
																errors.totalAmount = 'Invoice Total Amount Cannot be greater than  Remaining Invoice Amount';
															}
															if (this.state.invoiceSelected && this.state.isDNWIWithoutProduct && values.debitAmount && parseFloat(values.debitAmount) > parseFloat(this.state.remainingInvoiceAmount)) {
																errors.debitAmount = strings.AmountCannotBeGreaterThanTheInvoiceamount;
															}
															return errors;
														}}
														validationSchema={Yup.object().shape({

															debitNoteNumber: Yup.string().required(strings.Debit_Note_Number_Is_Required,),
															contactId: Yup.string().required('Customer Name is Required',),
															invoiceDate: Yup.string().required(strings.invoiceDateIsRequired,),
															lineItemsString: Yup.array().of(
																Yup.object().shape({
																	quantity: Yup.string().test(
																		'quantity',
																		strings.QuantityGreaterThan0,
																		(value) => {
																			if (value > 0) {
																				return true;
																			} else {
																				return false;
																			}
																		},
																	).required(strings.QuatityIsRequired),
																}),
															),
														})}
													>
														{(props) => (
															<Form onSubmit={props.handleSubmit}>
																{!isCreatedWithoutInvoice && (<Row>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="invoiceNumber"><span className="text-danger">* </span>
																				{strings.InvoiceNumber}
																			</Label>
																			<Select
																				isDisabled
																				id="invoiceNumber"
																				name="invoiceNumber"
																				placeholder={strings.Select + strings.InvoiceNumber}
																				options={
																					invoice_list ? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						invoice_list,
																						'Invoice Number',
																					) : []
																				}
																				value={props.values.invoiceNumber?.value ? props.values.invoiceNumber : invoice_list && selectOptionsFactory.renderOptions(
																					'label',
																					'value',
																					invoice_list,
																					'Invoice Number',).find(obj => obj.value === props.values.invoiceNumber)
																				}
																				onChange={(option) => {
																					if (option && option.value) {
																						this.setState({ invoiceSelected: true }, () => {
																							props.handleChange('invoiceNumber')(option);
																							props.handleChange('referenceNumber')(option.label);
																							this.getInvoiceDetails(option.value)
																						})
																					} else {
																						this.setState({ invoiceSelected: false }, () => {
																							props.handleChange('invoiceNumber')('');
																							props.handleChange('referenceNumber')('');
																						})
																					}
																				}}
																				className={
																					props.errors.invoiceNumber &&
																						props.touched.invoiceNumber
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.invoiceNumber &&
																				props.touched.invoiceNumber && (
																					<div className="invalid-feedback">
																						{props.errors.invoiceNumber}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																</Row>)}
																<Row>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="debitNoteNumber">
																				<span className="text-danger">* </span>
																				{strings.DebitNoteNumber}
																			</Label>
																			<Input
																				disabled
																				maxLength="50"
																				type="text"
																				id="debitNoteNumber"
																				name="debitNoteNumber"
																				placeholder={strings.DebitNoteNumber}
																				value={props.values.debitNoteNumber}
																				//onBlur={props.handleBlur('debitNoteNumber')}
																				onChange={(option) => {
																					if (option?.target?.value === '')
																						props.handleChange('debitNoteNumber')('');
																					else if (this.regExDNNum.test(option?.target?.value)) {
																						props.handleChange('debitNoteNumber')(option?.target?.value);
																					}
																				}}
																				className={
																					props.errors.debitNoteNumber &&
																						props.touched.debitNoteNumber
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.debitNoteNumber &&
																				props.touched.debitNoteNumber && (
																					<div className="invalid-feedback">
																						{props.errors.debitNoteNumber}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="contactId">
																				<span className="text-danger">* </span>
																				{strings.SupplierName}
																			</Label>
																			<Select
																				id="contactId"
																				name="contactId"
																				placeholder={strings.Select + strings.SupplierName}
																				options={tmpCustomer_list ? tmpCustomer_list : []}
																				value={props.values.contactId?.values ? props.values.contactId : tmpCustomer_list && tmpCustomer_list.find(obj => obj.value === props.values.contactId)}

																				isDisabled={this.state.invoiceSelected}
																				onChange={(option) => {
																					if (option && option.value) {
																						this.formRef.current.setFieldValue('currency', this.getCurrency(option.value), true);
																						this.getTaxTreatment(option.value);
																						props.handleChange('contactId')(option);
																					} else {
																						props.handleChange('contactId')('');
																					}
																				}}
																				className={
																					props.errors.contactId &&
																						props.touched.contactId
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.contactId &&
																				props.touched.contactId && (
																					<div className="invalid-feedback">
																						{props.errors.contactId}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	{isRegisteredVat &&
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="taxTreatmentId">
																					{strings.TaxTreatment}
																				</Label>
																				<Select
																					options={
																						tax_treatment_list
																							? selectOptionsFactory.renderOptions(
																								'name',
																								'id',
																								tax_treatment_list,
																								'Tax Treatment',
																							)
																							: []
																					}
																					isDisabled={true}
																					id="taxTreatmentId"
																					name="taxTreatmentId"
																					placeholder={strings.Select + strings.TaxTreatment}
																					value={props.values.taxTreatmentId?.value ? props.values.taxTreatmentId :
																						tax_treatment_list &&
																						selectOptionsFactory
																							.renderOptions(
																								'name',
																								'id',
																								tax_treatment_list,
																								'Tax Treatment',
																							)
																							.find(
																								(option) =>
																									option.label === props.values.taxTreatmentId,
																							)
																					}
																					onChange={(option) => {
																						props.handleChange('taxTreatmentId')(
																							option,
																						);
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
																	}
																</Row>
																<Row>

																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="invoiceDate">
																				<span className="text-danger">* </span>
																				Debit Note Date
																			</Label>
																			<DatePicker
																				id="invoiceDate"
																				name="invoiceDate"
																				placeholderText={strings.Enter + strings.DebitNote + strings.Date}
																				showMonthDropdown
																				showYearDropdown
																				dateFormat="dd-MM-yyyy"
																				dropdownMode="select"
																				// value={moment(props.values.invoiceDate).format('DD-MM-YYYY')}
																				minDate={this.state.receiptDate}
																				selected={props.values.invoiceDate}
																				onChange={(value) => {
																					props.handleChange('invoiceDate')(value);
																				}}
																				className={`form-control ${props.errors.invoiceDate &&
																					props.touched.invoiceDate
																					? 'is-invalid'
																					: ''
																					}`}
																			/>
																			{props.errors.invoiceDate &&
																				props.touched.invoiceDate && (
																					<div className="invalid-feedback">
																						{props.errors.invoiceDate.includes("nullable()") ? strings.Debit_Note_Date_Is_Required : props.errors.invoiceDate}
																					</div>
																				)}
																		</FormGroup>
																	</Col>

																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="currency">
																				<span className="text-danger">* </span>
																				{strings.Currency}
																			</Label>
																			<Select
																				isDisabled={true}
																				styles={customStyles}
																				placeholder={strings.Select + strings.Currency}
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
																				id="currency"
																				name="currency"
																				value={props.values.currency?.value ? props.values.currency :
																					currency_convert_list && selectCurrencyFactory.renderOptions(
																						'currencyName',
																						'currencyCode',
																						currency_convert_list,
																						'Currency',
																					).find((option) => option.value === props.values.currency)
																				}
																				className={
																					props.errors.currency &&
																						props.touched.currency
																						? 'is-invalid'
																						: ''
																				}
																				onChange={(option) => {
																					props.handleChange('currency')(option);
																				}}

																			/>
																			{props.errors.currency &&
																				props.touched.currency && (
																					<div className="invalid-feedback">
																						{props.errors.currency}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	{(this.state.invoiceSelected) && (<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="remainingInvoiceAmount">
																				Remaining Invoice Amount
																			</Label>
																			<Input
																				type="text"
																				id="remainingInvoiceAmount"
																				name="remainingInvoiceAmount"
																				placeholder='Remaining invoice Amount'
																				disabled={true}
																				value={this.state.remainingInvoiceAmount}
																			/>
																			{props.errors.remainingInvoiceAmount &&
																				(
																					<div className="text-danger">
																						{props.errors.remainingInvoiceAmount}
																					</div>
																				)}
																		</FormGroup>
																	</Col>)}

																	{this.state.isDNWIWithoutProduct === true && (
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="debitAmount"><span className="text-danger">* </span>
																					Debit Amount
																				</Label>
																				<Input
																					type="text"
																					id="debitAmount"
																					name="debitAmount"
																					placeholder={strings.Enter + " Debit Amount"}
																					value={props.values.debitAmount}
																					onChange={(value) => {
																						if ((value.target.value === '' || this.regDecimal.test(value.target.value))
																							&& parseFloat(value.target.value) !== 0)
																							props.handleChange('debitAmount')(value,);
																					}}
																					className={
																						props.errors.debitAmount &&
																							props.touched.debitAmount
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.debitAmount &&
																					props.touched.debitAmount &&
																					(<div className="invalid-feedback">
																						{props.errors.debitAmount}
																					</div>)}
																			</FormGroup>
																		</Col>
																	)}

																</Row>
																<hr />
																{!isCreatedWithoutInvoice && !this.state.isDNWIWithoutProduct && (
																	<Row>
																		<Col lg={8} className="mb-3">
																		</Col>
																		<Col>
																			{this.state.taxType === false ?
																				<span style={{ color: "#0069d9" }} className='mr-4'><b>{strings.Exclusive}</b></span> :
																				<span className='mr-4'>{strings.Exclusive}</span>}
																			<Switch
																				value={props.values.taxType}
																				checked={this.state.taxType}
																				disabled
																				onChange={(taxType) => {
																					props.handleChange('taxType')(taxType);
																					this.setState({ taxType }, () => {
																						this.updateAmount(
																							this.state.data,
																							props
																						)
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
																			{this.state.taxType === true ?
																				<span style={{ color: "#0069d9" }} className='ml-4'><b>{strings.Inclusive}</b></span>
																				: <span className='ml-4'>{strings.Inclusive}</span>
																			}
																		</Col>
																	</Row>)}
																{this.state.isDNWIWithoutProduct === false && data && data.length > 0 && (<Row>
																	{props.errors.lineItemsString &&
																		typeof props.errors.lineItemsString ===
																		'string' && (
																			<div
																				className={
																					props.errors.lineItemsString
																						? 'is-invalid'
																						: ''
																				}
																			>
																				<div className="invalid-feedback">
																					{props.errors.lineItemsString}
																				</div>
																			</div>
																		)}
																	<Col lg={12}>
																		<BootstrapTable
																			options={this.options}
																			data={data}
																			version="4"
																			hover
																			keyField="id"
																			className="invoice-create-table"
																		>
																			<TableHeaderColumn
																				width="3%"
																				dataAlign="center"
																				dataFormat={(cell, rows) =>
																					this.renderActions(cell, rows, props)
																				}
																			></TableHeaderColumn>
																			<TableHeaderColumn
																				//width="20%"
																				dataField="product"
																				dataFormat={(cell, rows) =>
																					this.renderProduct(cell, rows, props)
																				}
																			>
																				{strings.PRODUCT}
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				width="11%"
																				dataField="account"
																				dataFormat={(cell, rows) =>
																					this.renderAccount(cell, rows, props)
																				}
																			>
																				{strings.Account}
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				dataField="quantity"
																				dataFormat={(cell, rows) =>
																					this.renderQuantity(cell, rows, props)
																				}
																			>
																				{strings.QUANTITY}
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				dataField="unitPrice"
																				dataFormat={(cell, rows) =>
																					this.renderUnitPrice(cell, rows, props)
																				}
																			>
																				{strings.UNITPRICE}
																				<i
																					id="UnitPriceTooltip"
																					className="fa fa-question-circle ml-1"
																				></i>
																				<UncontrolledTooltip
																					placement="right"
																					target="UnitPriceTooltip"
																				>
																					Unit Price – Price of a single product or
																					service
																				</UncontrolledTooltip>
																			</TableHeaderColumn>
																			{initValue.totalDiscount != 0 &&
																				<TableHeaderColumn
																					dataField="discount"
																					dataFormat={(cell, rows) =>
																						this.renderDiscount(cell, rows, props)
																					}
																				>
																					Discount Type
																				</TableHeaderColumn>
																			}
																			{initValue.total_excise != 0 &&
																				<TableHeaderColumn
																					//	width="10%"
																					dataField="exciseTaxId"
																					dataFormat={(cell, rows) =>
																						this.renderExcise(cell, rows, props)
																					}
																				>
																					{strings.Excises}
																					<i
																						id="ExiseTooltip"
																						className="fa fa-question-circle ml-1"
																					></i>
																					<UncontrolledTooltip
																						placement="right"
																						target="ExiseTooltip"
																					>
																						Excise dropdown will be enabled only for the excise products
																					</UncontrolledTooltip>
																				</TableHeaderColumn>
																			}
																			{isRegisteredVat &&
																				<TableHeaderColumn
																			     	// width={ "250px" }
																					dataField="vat"
																					dataFormat={(cell, rows) =>
																						this.renderVat(cell, rows, props)
																					}
																				>
																					{strings.VAT}
																				</TableHeaderColumn>
																			}
																			{isRegisteredVat &&
																				<TableHeaderColumn
																					dataField="vat_amount"
																					dataFormat={this.renderVatAmount}
																					className="text-right"
																					columnClassName="text-right"
																					formatExtraData={universal_currency_list}
																				>
																					{strings.VATAMOUNT}
																				</TableHeaderColumn>
																			}
																			<TableHeaderColumn
																				dataField="sub_total"
																				dataFormat={this.renderSubTotal}
																				className="text-right"
																				columnClassName="text-right"
																				formatExtraData={universal_currency_list}
																			>
																				{strings.SUBTOTAL}
																			</TableHeaderColumn>
																		</BootstrapTable>
																	</Col>
																</Row>)}
																{this.state.isDNWIWithoutProduct === false && data && data.length > 0 && isRegisteredVat && <Row>
																	<Col className="ml-4">
																		{this.state.isReverseChargeEnabled === true
																			// && (isDesignatedZone && props.values.taxTreatmentId !== 'UAE NON-VAT REGISTERED' && props.values.taxTreatmentId !== 'UAE NON-VAT REGISTERED FREEZONE' && props.values.taxTreatmentId !== 'UAE VAT REGISTERED' && props.values.taxTreatmentId !== 'UAE VAT REGISTERED FREEZONE')
																			// || (!isDesignatedZone && props.values.taxTreatmentId !== 'UAE VAT REGISTERED FREEZONE')
																			? <FormGroup className="mb-3">
																				<Input
																					type="checkbox"
																					id="isReverseChargeEnabled"
																					checked={this.state.isReverseChargeEnabled}
																					value={this.state.isReverseChargeEnabled}
																					onChange={(e) => {
																						this.setState({
																							isReverseChargeEnabled: isReverseChargeEnabled,
																						})
																					}}
																				/>
																				<Label>{strings.IsReverseCharge}</Label>
																			</FormGroup> : ''}
																	</Col>
																</Row>}
																<Row>
																	<Col lg={7}>
																		<Col lg={6}>
																			{!isCreatedWithoutInvoice && <FormGroup className="mb-3">
																				<Label htmlFor="referenceNumber">
																					{strings.ReferenceNumber}
																				</Label>
																				<Input
																					type="text"
																					maxLength="20"
																					id="referenceNumber"
																					name="referenceNumber"
																					value={props.values.referenceNumber}
																					placeholder={strings.ReceiptNumber}
																					onChange={(value) => {
																						props.handleChange('referenceNumber')(value);

																					}}
																					className={props.errors.referenceNumber && props.touched.referenceNumber ? "is-invalid" : " "}
																				/>
																				{props.errors.referenceNumber && props.touched.referenceNumber && (
																					<div className="invalid-feedback">{props.errors.referenceNumber}</div>
																				)}
																			</FormGroup>}
																			<FormGroup className="py-2">
																				<Label htmlFor="notes">
																					{strings.Notes}
																				</Label><br />
																				<TextField
																					type="textarea"
																					multiline
																					style={{ width: "500px" }}
																					className="textarea"
																					inputProps={{ maxLength: 255 }}
																					name="notes"
																					id="notes"
																					maxRows={4}
																					placeholder={strings.DeliveryNotes}
																					onChange={(option) =>
																						props.handleChange('notes')(option)
																					}
																					value={props.values.notes}
																				/>
																			</FormGroup>
																		</Col>
																	</Col>
																	{this.state.isDNWIWithoutProduct === false && (<Col lg={5}>
																		<div className="">
																			{initValue.total_excise != 0 && (
																				<div className="total-item p-2" >
																					<Row>
																						<Col lg={6}>
																							<h5 className="mb-0 text-right">
																								{strings.TotalExcise}
																							</h5>
																						</Col>
																						<Col lg={6} className="text-right">
																							<label className="mb-0">
																								{this.state.customer_currency_symbol} &nbsp;
																								{initValue.total_excise.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																							</label>
																						</Col>
																					</Row>
																				</div>
																			)}
																			{initValue.totalDiscount != 0 && (
																				<div className="total-item p-2">
																					<Row>
																						<Col lg={6}>
																							<h5 className="mb-0 text-right">
																								{strings.Discount}
																							</h5>
																						</Col>
																						<Col lg={6} className="text-right">
																							<label className="mb-0">
																								{this.state.customer_currency_symbol} &nbsp;
																								{initValue.totalDiscount ? initValue.totalDiscount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '0.00'}
																							</label>
																						</Col>
																					</Row>
																				</div>
																			)}
																			<div className="total-item p-2">
																				<Row>
																					<Col lg={6}>
																						<h5 className="mb-0 text-right">
																							{strings.TotalNet}
																						</h5>
																					</Col>
																					<Col lg={6} className="text-right">
																						<label className="mb-0">
																							{this.state.customer_currency_symbol} &nbsp;
																							{initValue.totalNet ? initValue.totalNet.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '0.00'}

																						</label>
																					</Col>
																				</Row>
																			</div>
																			{isRegisteredVat &&
																				<div className="total-item p-2">
																					<Row>
																						<Col lg={6}>
																							<h5 className="mb-0 text-right">
																								{strings.TotalVat}
																							</h5>
																						</Col>
																						<Col lg={6} className="text-right">
																							<label className="mb-0">
																								{this.state.customer_currency_symbol} &nbsp;
																								{initValue.totalVatAmount ? initValue.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '0.00'}
																							</label>
																						</Col>
																					</Row>
																				</div>
																			}
																			<div className="total-item p-2">
																				<Row>
																					<Col lg={6}>
																						<h5 className="mb-0 text-right">
																							{strings.Total}
																						</h5>
																					</Col>
																					<Col lg={6} className="text-right">
																						<label className="mb-0">
																							{this.state.customer_currency_symbol} &nbsp;
																							{initValue.totalAmount ? initValue.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '0.00'}
																						</label>
																					</Col>
																					{props.errors.totalAmount &&
																						props.touched.totalAmount &&
																						<Col className="invalid-feedback d-block text-right">
																							{props.errors.totalAmount}
																						</Col>}
																				</Row>
																			</div>
																		</div>
																	</Col>)}
																</Row>
																<Row>
																	<Col
																		lg={12}
																		className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
																	>
																		<FormGroup>
																			<Button
																				type="button"
																				color="danger"
																				className="btn-square"
																				disabled1={this.state.disabled1}
																				onClick={this.deleteDebitNote}
																			>
																				<i className="fa fa-trash"></i> {' '} {this.state.disabled1
																					? 'Deleting...'
																					: strings.Delete}
																			</Button>
																		</FormGroup>
																		<FormGroup className="text-right">
																			<Button
																				type="submit"
																				color="primary"
																				className="btn-square mr-3"
																				disabled={this.state.disabled}
																				onClick={() => {
																					//	added validation popup	msg
																					console.log(props.errors, "ERROR")
																					props.handleBlur();
																					if (props.errors && Object.keys(props.errors).length != 0)
																						this.props.commonActions.fillManDatoryDetails();
																				}}
																			>
																				<i className="fa fa-dot-circle-o"></i> {this.state.disabled
																					? 'Updating...'
																					: strings.Update}
																				{/* { {this.state.disabled }
																				? 'Updating...'
																				{ : 'Update'} } */}
																			</Button>
																			<Button
																				color="secondary"
																				className="btn-square"
																				onClick={() => {
																					if (this.props?.location?.state?.renderURL) {
																						this.props.history.push(
																							`${this.props?.location?.state?.renderURL}`, 
																							{ id: this.props?.location?.state?.renderID,
																							isCNWithoutProduct: this.props?.location?.state?.isCNWithoutProduct,
																							},);
																					} else
																						this.props.history.push(
																							'/admin/expense/debit-notes',
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

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(DetailDebitNote);
