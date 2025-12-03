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
	UncontrolledTooltip
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import * as CustomerInvoiceDetailActions from './actions';
import * as ProductActions from '../../../product/actions';
import * as CustomerInvoiceActions from '../../actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { CustomerModal, ProductModal } from '../../sections';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { optionFactory, selectCurrencyFactory, selectOptionsFactory, InputValidation, DropdownLists, Lists } from 'utils';
import './style.scss';
import { AddressComponent } from 'screens/contact/sections';
import moment from 'moment';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import Switch from "react-switch";
import { TextField } from '@material-ui/core';

const mapStateToProps = (state) => {
	return {
		project_list: state.customer_invoice.project_list,
		contact_list: state.customer_invoice.contact_list,
		currency_list: state.customer_invoice.currency_list,
		// vat_list: state.customer_invoice.vat_list,
		excise_list: state.customer_invoice.excise_list,
		product_list: state.customer_invoice.product_list,
		customer_list: state.customer_invoice.customer_list,
		country_list: state.customer_invoice.country_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.common.currency_convert_list,
		product_category_list: state.product.product_category_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
		customerInvoiceActions: bindActionCreators(
			CustomerInvoiceActions,
			dispatch,
		),
		customerInvoiceDetailActions: bindActionCreators(
			CustomerInvoiceDetailActions,
			dispatch,
		),
		productActions: bindActionCreators(ProductActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
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

class DetailCustomerInvoice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dialog: false,
			disabled: false,
			disabled1: false,
			discountOptions: [
				{ value: 'FIXED', label: 'FIXED' },
				{ value: 'PERCENTAGE', label: '%' },
			],
			exciseTypeOption: [
				{ value: 'Inclusive', label: 'Inclusive' },
				{ value: 'Exclusive', label: 'Exclusive' },
			],
			discount_option: '',
			data: [],
			current_customer_id: null,
			initValue: {
				invoiceDate: new Date(),
			},
			contactType: 2,
			openCustomerModal: false,
			openProductModal: false,
			selectedContact: '',
			term: '',
			placeOfSupplyId: '',
			selectedType: '',
			discountPercentage: '',
			discountAmount: 0,
			fileName: '',
			basecurrency: [],
			income: true,
			customer_currency: '',
			state_list_for_shipping: [],
			language: window['localStorage'].getItem('language'),
			param: false,
			date: '',
			isDesignatedZone: false,
			isRegisteredVat: false,
			invoiceDateForVatValidation: new Date(),
			producttype: [],
			changeShippingAddress: false,
			shippingAddress: Lists.Address,
			loadingMsg: "Loading",
			disableLeavePage: false,
			datesChanged: false,
			customer_currency_symbol: '',
		};

		// this.options = {
		//   paginationPosition: 'top'
		// }
		this.formRef = React.createRef();
		this.termList = [
			{ label: 'Net 7 Days', value: 'NET_7' },
			{ label: 'Net 10 Days', value: 'NET_10' },
			{ label: 'Net 15 Days', value: 'NET_15' },
			{ label: 'Net 30 Days', value: 'NET_30' },
			{ label: 'Net 45 Days', value: 'NET_45' },
			{ label: 'Net 60 Days', value: 'NET_60' },
			{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
		];
		this.placelist = [
			{ label: 'Abu Dhabi', value: '1' },
			{ label: 'Dubai', value: '2' },
			{ label: 'Sharjah', value: '3' },
			{ label: 'Ajman', value: '4' },
			{ label: 'Umm Al Quwain', value: '5' },
			{ label: 'Ras al-Khaimah', value: '6' },
			{ label: 'Fujairah', value: '7' },
		];
		this.regEx = /^[0-9\b]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		this.regDec1 = /^\d{1,2}\.\d{1,2}$|^\d{1,2}$/;
		this.regExAlpha = /^[a-zA-Z0-9!@#$&()-\\`.+,/\"]+$/;
		this.regExTelephone = /^[0-9-]+$/;
		this.regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;
		this.regExCity = /^[a-zA-Z ]+$/;

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
		this.props.customerInvoiceActions.getProductList();
		this.props.customerInvoiceActions
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
		this.props.customerInvoiceActions.getVatList().then((res) => {
			if (res.status == 200)
				this.setState({ vat_list: res.data })
		});
		this.initializeData();
		this.getCompanyType();
	};
	salesCategory = () => {
		try {
			this.props.productActions
				.getTransactionCategoryListForSalesProduct('2')
				.then((res) => {
					if (res.status === 200) {
						this.setState(
							{
								salesCategory: res.data,
							},
							() => {
								console.log(this.state.salesCategory);
							},
						);
					}
				});
		} catch (err) {
			console.log(err);
		}
	};


	initializeData = () => {
		if (this.props.location.state && this.props.location.state.id) {
			this.props.customerInvoiceDetailActions
				.getInvoiceById(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						this.getCompanyCurrency();
						// this.state.customerInvoiceActions.getVatList();
						this.props.customerInvoiceActions.getCustomerList(
							this.state.contactType,
						);
						this.props.customerInvoiceActions.getExciseList();
						this.props.customerInvoiceActions.getCountryList();
						this.props.productActions.getProductCategoryList();
						this.setState(
							{
								current_customer_id: this.props.location.state.id,
								initValue: {
									receiptAttachmentDescription: res.data.receiptAttachmentDescription
										? res.data.receiptAttachmentDescription
										: '',
									receiptNumber: res.data.receiptNumber
										? res.data.receiptNumber
										: '',
									contact_po_number: res.data.contactPoNumber
										? res.data.contactPoNumber
										: '',
									currencyCode: res.data.currencyCode ? res.data.currencyCode : '',
									exchangeRate: res.data.exchangeRate ? res.data.exchangeRate : '',
									currencyName: res.data.currencyName ? res.data.currencyName : '',
									invoiceDueDate: res.data.invoiceDueDate
										? moment(res.data.invoiceDueDate).format('DD-MM-YYYY')
										: '',
									invoiceDate: res.data.invoiceDate
										? moment(res.data.invoiceDate).format('DD-MM-YYYY')
										: '',
									invoiceDate1: res.data.invoiceDate
										? res.data.invoiceDate
										: '',
									contactId: res.data.contactId ? res.data.contactId : '',
									project: res.data.projectId ? res.data.projectId : '',
									invoice_number: res.data.referenceNumber
										? res.data.referenceNumber
										: '',
									total_net: 0,
									invoiceVATAmount: res.data.totalVatAmount
										? res.data.totalVatAmount
										: 0,
									totalAmount: res.data.totalAmount ? res.data.totalAmount : 0,
									notes: res.data.notes ? res.data.notes : '',
									changeShippingAddress: res.data.changeShippingAddress ? res.data.changeShippingAddress : '',
									shippingAddress: {
										city: res.data.shippingCity ?? '',
										countryId: res.data.shippingCountry ?? '',
										address: res.data.shippingAddress ?? '',
										postZipCode: res.data.shippingPostZipCode ?? '',
										stateId: res.data.shippingState ?? '',
										telephone: res.data.shippingTelephone ?? '',
										fax: res.data.shippingFax ?? '',
									},
									lineItemsString: res.data.invoiceLineItems
										? res.data.invoiceLineItems
										: [],
									discount: res.data.discount ? res.data.discount : 0,


									term: res.data.term ? res.data.term : '',
									placeOfSupplyId: res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '',
									fileName: res.data.fileName ? res.data.fileName : '',
									filePath: res.data.filePath ? res.data.filePath : '',
									total_excise: res.data.totalExciseAmount ? res.data.totalExciseAmount : 0,
									taxType: res.data.taxType ? true : false,
									footNote: res.data.footNote ? res.data.footNote : ''
								},
								discountEnabled: res.data.discount > 0 ? true : false,
								customer_taxTreatment_des: res.data.taxTreatment ? res.data.taxTreatment : '',
								invoiceDateNoChange: res.data.invoiceDate
									? moment(res.data.invoiceDate)
									: '',
								taxType: res.data.taxType ? true : false,
								invoiceDueDateNoChange: res.data.invoiceDueDate ?
									moment(res.data.invoiceDueDate) : '',
								invoiceDate: res.data.invoiceDate
									? res.data.invoiceDate
									: '',
								invoiceDueDate: res.data.invoiceDueDate
									? res.data.invoiceDueDate
									: '',
								invoiceDateForVatValidation: res.data.invoiceDate
									? new Date(res.data.invoiceDate)
									: '',
								discountAmount: res.data.discount ? res.data.discount : 0,
								discountPercentage: res.data.discountPercentage
									? res.data.discountPercentage
									: '',
								data: res.data.invoiceLineItems
									? res.data.invoiceLineItems
									: [],
								selectedContact: res.data.contactId ? res.data.contactId : '',
								term: res.data.term ? res.data.term : '',
								placeOfSupplyId: res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '',
								loading: false,
								customer_currency: res.data.currencyCode ? res.data.currencyCode : '',
								customer_currency_des: res.data.currencyName ? res.data.currencyName : '',
								customer_currency_symbol: res.data.currencyIsoCode ? res.data.currencyIsoCode : '',
								customer_currencyCode: res.data.currencyCode ? res.data.currencyCode : '',
							},
							() => {
								const { initValue, data } = this.state
								if (initValue && initValue.changeShippingAddress) {
									this.formRef.current.setFieldValue('shippingAddress', initValue.shippingAddress, true);
								}
								if (this.state.data.length > 0) {
									this.updateAmount(this.state.data);
									const { data } = this.state;
									const idCount =
										data.length > 0
											? Math.max.apply(
												Math,
												data.map((item) => {
													if (item['productId'])
														this.getProductType(item['productId'])
													return item.id;
												}),
											)
											: 0;
									this.setState({
										idCount,
									});
									this.addRow()
								} else {
									this.setState({
										idCount: 0,
									});
								}
							},
						);
						//this.getCurrency(res.data.contactId)
					}
				});
		} else {
			this.props.history.push('/admin/income/customer-invoice');
		}
	};

	calTotalNet = (data) => {
		let total_net = 0;
		data.map((obj) => {
			if (obj.isExciseTaxExclusive === false) {

				total_net = +(total_net + +obj.unitPrice * obj.quantity);

			} else {

				total_net = +(total_net + +(obj.unitPrice + obj.exciseAmount) * obj.quantity);

			}
			return obj;

		});
		total_net = total_net - this.state.discountAmount
		this.setState({
			initValue: Object.assign(this.state.initValue, { total_net }),
		});
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
						isDisabled={row.exciseTaxId === 0 || row.exciseTaxId === null}
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
						value={
							excise_list &&
							selectOptionsFactory
								.renderOptions('name', 'id', excise_list, 'Excise')
								.find((option) => row.exciseTaxId ? option.value === +row.exciseTaxId : "Select Exise")
						}
						id="exciseTaxId"
						placeholder={strings.Select_Excise}
						onChange={(e) => {
							if (e.value === '') {
								props.setFieldValue(
									'exciseTaxId',
									'',
								);
							} else {
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
							}
						}
						}
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
								placeholder={strings.Discount}
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

								<div style={{ width: '100px' }}>
									<Select


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

	renderDescription = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.description`}
				render={({ field, form }) => (
					<Input
						type="text"
						value={row['description'] !== '' ? row['description'] : ''}
						onChange={(e) => {
							this.selectItem(e.target.value, row, 'description', form, field);
						}}
						placeholder={strings.Description}
						className={`form-control 
            ${props.errors.lineItemsString &&
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
				)}
			/>
		);
	};
	checkAmount = (discount) => {
		const { initValue } = this.state;
		if (discount >= initValue.totalAmount) {
			this.setState({
				param: true
			});
		}
		else {
			this.setState({
				param: false
			});
		}

	}
	renderQuantity = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});
		var { product_list } = this.props;
		const product = product_list.find((i) => row['productId'] === i.id)
		let addedproducts = []
		if (product)
			addedproducts = props.values.lineItemsString.filter((i) => (i.productId === product.id && row.id !== i.id))
		let totalquantityleft = addedproducts.length > 0 && product?.stockOnHand !== null ? product?.stockOnHand - addedproducts.reduce((a, c) => a + parseInt(c.quantity === "" ? 0 : c.quantity), 0) : product?.stockOnHand
		totalquantityleft = totalquantityleft - parseInt(row.quantity)

		return (
			<Field
				name={`lineItemsString.${idx}.quantity`}
				render={({ field, form }) => (
					<div>
						<div className="input-group">
							<Input
								type="text"
								maxLength="10"
								min="0"
								value={row['quantity'] !== 0 ? row['quantity'] : 0}
								onChange={(e) => {
									if (e.target.value === '' || this.regEx.test(e.target.value)) {
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
								className={`form-control w-50
							${props.errors.lineItemsString &&
										props.errors.lineItemsString[parseInt(idx, 10)] &&
										props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
										Object.keys(props.touched).length > 0 &&
										props.touched.lineItemsString &&
										props.touched.lineItemsString[parseInt(idx, 10)] &&
										props.touched.lineItemsString[parseInt(idx, 10)].quantity
										? 'is-invalid'
										: ''
									}`}

							/>
							{row['productId'] != '' ?
								<Input value={row['unitType']} disabled /> : ''}
						</div>
						{(totalquantityleft < 0 && product?.stockOnHand) && <div style={{ color: 'red', fontSize: '0.8rem' }} >
							Stock in Hand:{product?.stockOnHand}
						</div>}
						{props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].quantity && (
								<div className="invalid-feedback" style={{ display: "block", whiteSpace: "normal" }}>
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
					<>
						<Input
							type="text"
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
						{props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].unitPrice &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].unitPrice &&
							(
								<div className='invalid-feedback'>
									{props.errors.lineItemsString[parseInt(idx, 10)].unitPrice}
								</div>
							)}
					</>
				)}
			/>
		);
	};

	renderSubTotal = (cell, row, extraData) => {
		// return row.subTotal ? (
		// 	<Currency
		// 		value={row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	''
		// );
		return row.subTotal === 0 ? this.state.customer_currency_symbol + " " + row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : this.state.customer_currency_symbol + " " + row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	};
	renderVatAmount = (cell, row, extraData) => {
		// return row.subTotal === 0 ? (
		// 	<Currency
		// 		value={row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	<Currency
		// 		value={row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// );
		return row.vatAmount === 0 ? this.state.customer_currency_symbol + " " + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : this.state.customer_currency_symbol + " " + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	};
	addRow = () => {
		const data = [...this.state.data];
		const idCount = this.state.idCount ? this.state.idCount :
			data.length > 0
				? Math.max.apply(
					Math,
					data.map((item) => {
						return item.id;
					}),
				)
				: 0;
		this.setState(
			{
				data: data.concat({
					id: idCount + 1,
					description: '',
					quantity: 1,
					unitPrice: '',
					vatCategoryId: '',
					subTotal: 0,
					exciseTaxId: '',
					discountType: 'FIXED',
					vatAmount: 0,
					discount: 0,
					productId: '',
				}),
				idCount: this.state.idCount + 1,
			},
			() => {
				this.formRef.current.setFieldValue(
					'lineItemsString',
					this.state.data,
					true,
				);
			},
		);
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
			name === 'quantity' ||
			name === 'exciseTaxId'
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
	getCustomerShippingAddress = (cutomerID, taxID, props) => {
		if (taxID !== 5 && taxID !== 6 && taxID !== 7) {
			this.props.customerInvoiceDetailActions.getCustomerShippingAddressbyID(cutomerID).then((res) => {
				if (res.status === 200) {
					var PlaceofSupply = this.placelist &&
						selectOptionsFactory.renderOptions(
							'label',
							'value',
							this.placelist,
							'Place of Supply',).
							find((option) => option.label.toUpperCase() === res.data.shippingStateName.toUpperCase())
					if (PlaceofSupply) {
						props.handleChange('placeOfSupplyId')(PlaceofSupply,);
						this.setState({ placeOfSupplyId: PlaceofSupply });
						this.formRef.current.setFieldValue('placeOfSupplyId', PlaceofSupply.value, true);
					}
				}
			});
		}
	};
	getCompanyType = () => {
		this.props.customerInvoiceDetailActions
			.getCompanyById()
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						isDesignatedZone: res.data.isDesignatedZone,
						companyVATRegistrationDate: new Date(moment(res.data.vatRegistrationDate).format('MM DD YYYY')),
					});
					this.setState({
						isRegisteredVat: res.data.isRegisteredVat,
					});
				}
			})
			.catch((err) => {
				console.log(err, "Get Company Type Error");
			});
	};
	getProductType = (id) => {
		if (this.state.customer_taxTreatment_des) {
			const { product_list } = this.props;
			const product = product_list.find(obj => obj.id === id);
			if (product) {
				var { vat_list } = this.state;
				let pt = {};
				var vt = [];
				pt.id = product.id;
				pt.type = product.productType
				if (this.state.isRegisteredVat && (this.state.invoiceDateForVatValidation > this.state.companyVATRegistrationDate)) {
					if (this.state.isDesignatedZone) {
						if (product.productType === "GOODS") {
							if (this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED FREEZONE' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED FREEZONE' || this.state.customer_taxTreatment_des === 'GCC VAT REGISTERED' || this.state.customer_taxTreatment_des === 'GCC NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'NON GCC') {
								vat_list.map(element => {
									if (element.name == 'OUT OF SCOPE') {
										vt.push(element);
									}
								});
							}
							if (this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED') {
								vt = vat_list;
							}
						}
						else if (product.productType === "SERVICE") {
							if (this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED FREEZONE' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED FREEZONE') {
								vt = vat_list;
							}
							if (this.state.customer_taxTreatment_des === 'GCC VAT REGISTERED' || this.state.customer_taxTreatment_des === 'GCC NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'NON GCC') {
								vat_list.map(element => {
									if (element.name == 'ZERO RATED TAX (0%)') {
										vt.push(element);
									}
								});

							}
						}
					} else {
						if (this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED FREEZONE' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED FREEZONE') {
							vt = vat_list;
						}
						if (this.state.customer_taxTreatment_des === 'GCC VAT REGISTERED' || this.state.customer_taxTreatment_des === 'GCC NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'NON GCC') {
							vat_list.map(element => {
								if (element.name == 'ZERO RATED TAX (0%)') {
									vt.push(element);
								}
							});

						}
					}
				} else {
					vt = [{
						"id": 10,
						"vat": 0,
						"name": "N/A"
					}];
				}
				pt.vat_list = vt;
				this.setState(prevState => ({
					producttype: [...prevState.producttype, pt]
				}));
				return pt;
			}
		}

	};
	resetVatId = (props) => {
		this.setState({
			producttype: [],
		}, () => {
			let newData = [];
			const { data, isRegisteredVat } = this.state;
			data.map((obj, index) => {
				if (isRegisteredVat)
					obj['vatCategoryId'] = '';
				else
					obj['vatCategoryId'] = 10;
				newData.push(obj);
				if (obj['productId'])
					this.getProductType(obj['productId'])
				return obj;
			})
			props.setFieldValue('lineItemsString', newData, true);
			this.updateAmount(newData, props);
		});
	};
	renderVat = (cell, row, props) => {
		let idx;
		let vat_list = [];
		const product = this.state.producttype.find(element => element.id === row.productId);
		if (product) {
			vat_list = product.vat_list;
		}
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
					<>
						<Select
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
							value={
								vat_list ?
									selectOptionsFactory
										.renderOptions('name', 'id', vat_list, 'VAT')
										.find((option) => option.value == row.vatCategoryId) : ''
							}
							id="vatCategoryId"
							placeholder={strings.Select + strings.VAT}
							// onChange={(e) => {
							// 	this.selectItem(
							// 		e.value,
							// 		row,
							// 		'vatCategoryId',
							// 		form,
							// 		field,
							// 		props,
							// 	);
							// }}
							onChange={(e) => {
								if (e.value === '') {
									props.setFieldValue(
										'vatCategoryId',
										'',
									);
								} else {
									this.selectItem(
										e.value,
										row,
										'vatCategoryId',
										form,
										field,
										props,
									);
									this.updateAmount(
										this.state.data,
										props,
									);
								}
							}
							}

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
						{props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].vatCategoryId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].vatCategoryId &&
							(
								<div className='invalid-feedback'>
									{props.errors.lineItemsString[parseInt(idx, 10)].vatCategoryId}
								</div>
							)}
					</>
				)}
			/>
		);
	};

	exchangeRaterevalidate = (exc) => {
		let local = [...this.state.data]
		var { product_list } = this.props;

		let local2 = local.map((obj, index) => {

			const result = product_list.find((item) => item.id === obj.productId);
			return {
				...obj, unitPrice: result ?
					(parseFloat(result.unitPrice) * (1 / exc)).toFixed(2) : 0
			}

		});

		this.setState({ data: local2 }, () => {
			this.updateAmount(local2);
		})
	}

	prductValue = (e, row, name, form, field, props) => {
		const { product_list } = this.props;
		let data = this.state.data;
		const result = product_list.find((item) => item.id === parseInt(e));
		const producttype = this.getProductType(parseInt(e))
		let idx;
		let exchangeRate = this.formRef.current?.state?.values?.exchangeRate > 0
			&& this.formRef.current?.state?.values?.exchangeRate !== "" ?
			this.formRef.current?.state?.values?.exchangeRate : 1
		data.map((obj, index) => {
			if (obj.id === row.id) {
				obj['unitPrice'] = (parseInt(result.unitPrice) * (1 / exchangeRate)).toFixed(2);
				obj['vatCategoryId'] = result.vatCategoryId;
				obj['description'] = result.description;
				obj['exciseTaxId'] = result.exciseTaxId;
				obj['isExciseTaxExclusive'] = result.isExciseTaxExclusive;
				obj['unitType'] = result.unitType;
				obj['unitTypeId'] = result.unitTypeId;
				idx = index;
				if (this.state.isRegisteredVat) {
					if (producttype) {
						if (producttype.id === parseInt(e)) {
							obj['vatCategoryId'] = result.vatCategoryId;
						}
						else {
							obj['vatCategoryId'] = '';
						}
					}
				} else {
					obj['vatCategoryId'] = 10;
				}
			}
			return obj;
		});
		form.setFieldValue(
			`lineItemsString.${idx}.vatCategoryId`,
			result.vatCategoryId,
			true,
		);
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
		form.setFieldValue(
			`lineItemsString.${idx}.exciseTaxId`,
			parseInt(result.exciseTaxId),
			true,
		);
		this.updateAmount(data, props);
	};
	renderAddProduct = (cell, rows, props) => {
		return (
			<Button
				color="primary"
				className="btn-twitter btn-brand icon"
				onClick={(e, props) => {
					this.openProductModal(props);
				}}
			>
				<i className="fas fa-plus"></i>
			</Button>
		);
	};
	renderProduct = (cell, row, props) => {
		var { product_list } = this.props;
		var { data } = this.state;
		var product_list1 = product_list.filter((obj) => obj.stockOnHand != 0)
		product_list = product_list.filter((row) => row.stockOnHand != 0);
		// if(product_list.length>0){
		// 	if(product_list.length > this.state.producttype.length){
		// 		product_list.map(element => {
		// 			this.getProductType(element.id);
		// 		});
		// 	}
		// }
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		// let product_list2=[]

		// product_list1.map(function (o1) {
		// 	 data.map(function (o2) {
		// 		if( o1.id !== o2.productId)
		// 		{	
		// 			 
		// 			product_list2.push(o1)
		// 	 // return the ones with equal id.
		// 		}
		// });
		// 	});

		return (
			<Field
				name={`lineItemsString.${idx}.productId`}
				render={({ field, form }) => (
					<>
						<Select
							options={
								product_list1
									? optionFactory.renderOptions(
										'name',
										'id',
										product_list1,
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
									if (this.checkedRow())
										this.addRow();
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
						{props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].productId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].productId &&
							(
								<div className='invalid-feedback'>
									{props.errors.lineItemsString[parseInt(idx, 10)].productId}
								</div>
							)}
						{row['productId'] != '' ?
							<div className='mt-1'>
								<TextField
									type="textarea"
									inputProps={{ maxLength: 2000 }}
									multiline
									minRows={1}
									maxRows={4}
									value={row['description'] !== '' ? row['description'] : ''}
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
							</div> : ''}
					</>
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
		return rows['productId'] != '' ?
			<Button
				size="sm"
				className="btn-twitter btn-brand icon mt-1"
				disabled={this.state.data.length === 1 ? true : false}
				onClick={(e) => {
					this.deleteRow(e, rows, props);
				}}
			>
				<i className="fas fa-trash"></i>
			</Button> : ''

	};

	checkedRow = () => {
		if (this.state.data.length > 0) {
			let length = this.state.data.length - 1;
			let temp = this.state.data?.[length].productId !== "" ?
				this.state.data?.[length].productId : -2;
			if (temp > -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};
	updateAmount = (data, props) => {
		const { vat_list } = this.state;
		let total_net = 0;
		let total_excise = 0;
		let total = 0;
		let total_vat = 0;
		let net_value = 0;
		let discount_total = 0;
		let exchangeRate = this.formRef.current?.state?.values?.exchangeRate > 0
			&& this.formRef.current?.state?.values?.exchangeRate !== "" ?
			this.formRef.current?.state?.values?.exchangeRate : 1
		data.map((obj) => {
			let unitprice = obj.unitPrice
			const index =
				obj.vatCategoryId !== '' && vat_list
					? vat_list.findIndex((item) => item.id === +obj.vatCategoryId)
					: '';
			const vat = index !== '' && index >= 0 ? vat_list[`${index}`].vat : 0;

			//Exclusive case
			if (this.state.taxType === false) {
				if (obj.discountType === 'PERCENTAGE') {
					net_value =
						((+unitprice -
							(+((unitprice * obj.discount)) / 100)) * obj.quantity);
					var discount = (unitprice * obj.quantity) - net_value
					if (obj.exciseTaxId != 0) {
						if (obj.exciseTaxId === 1) {
							const value = +(net_value) / 2;
							net_value = parseFloat(net_value) + parseFloat(value);
							obj.exciseAmount = parseFloat(value);
						} else if (obj.exciseTaxId === 2) {
							const value = net_value;
							net_value = parseFloat(net_value) + parseFloat(value);
							obj.exciseAmount = parseFloat(value);
						}
					}
					else {
						obj.exciseAmount = 0
					}
					var vat_amount =
						vat === 0 ? 0 :
							((+net_value * vat) / 100);
				} else {
					net_value =
						((unitprice * obj.quantity) - obj.discount)
					var discount = (unitprice * obj.quantity) - net_value
					if (obj.exciseTaxId != 0) {
						if (obj.exciseTaxId === 1) {
							const value = +(net_value) / 2;
							net_value = parseFloat(net_value) + parseFloat(value);
							obj.exciseAmount = parseFloat(value);
						} else if (obj.exciseTaxId === 2) {
							const value = net_value;
							net_value = parseFloat(net_value) + parseFloat(value);
							obj.exciseAmount = parseFloat(value);
						}
					}
					else {
						obj.exciseAmount = 0
					}
					var vat_amount =
						vat === 0 ? 0 :
							((+net_value * vat) / 100);
				}

			}
			//Inclusive case
			else {
				if (obj.discountType === 'PERCENTAGE') {

					//net value after removing discount
					net_value =
						((+unitprice -
							(+((unitprice * obj.discount)) / 100)) * obj.quantity);

					//discount amount
					var discount = (unitprice * obj.quantity) - net_value

					//vat amount
					var vat_amount =
						(vat === 0 ? 0 :
							((+net_value * (vat / (100 + vat) * 100)) / 100));

					//net value after removing vat for inclusive
					net_value = net_value - vat_amount

					//excise calculation
					if (obj.exciseTaxId != 0) {
						if (obj.exciseTaxId === 1) {
							const value = net_value / 3
							net_value = net_value
							obj.exciseAmount = parseFloat(value);
						}
						else if (obj.exciseTaxId === 2) {
							const value = net_value / 2
							obj.exciseAmount = parseFloat(value);
							net_value = net_value
						}

					}
					else {
						obj.exciseAmount = 0
					}
				}

				else // fixed discount
				{
					//net value after removing discount
					net_value =
						((unitprice * obj.quantity) - obj.discount)

					//discount amount
					var discount = (unitprice * obj.quantity) - net_value

					//vat amount
					var vat_amount =
						(vat === 0 ? 0 :
							((+net_value * (vat / (100 + vat) * 100)) / 100));

					//net value after removing vat for inclusive
					net_value = net_value - vat_amount

					//excise calculation
					if (obj.exciseTaxId != 0) {
						if (obj.exciseTaxId === 1) {
							const value = net_value / 3
							net_value = net_value
							obj.exciseAmount = parseFloat(value);
						}
						else if (obj.exciseTaxId === 2) {
							const value = net_value / 2
							obj.exciseAmount = parseFloat(value);
							net_value = net_value
						}
					}
					else {
						obj.exciseAmount = 0
					}
				}
			}
			obj.unitPrice = unitprice
			obj.vatAmount = vat_amount
			obj.subTotal =
				net_value ? parseFloat(net_value) + parseFloat(vat_amount) : 0;
			discount_total = +discount_total + discount
			total_net = +(total_net + parseFloat(net_value));
			total_vat = +(total_vat + vat_amount);
			total_excise = +(total_excise + obj.exciseAmount)
			total = total_vat + total_net;
			return obj;
		});

		// const discount =
		// 	props.values.discountType.value === 'PERCENTAGE'
		// 		? +((total_net * discountPercentage) / 100)
		// 		: discountAmount;
		this.setState(
			{
				data,
				initValue: {
					...this.state.initValue,
					...{
						total_net: total_net - total_excise,
						invoiceVATAmount: total_vat,
						discount: discount_total ? discount_total : 0,
						totalAmount: total,
						total_excise: total_excise
					},

				},
			},

		);
	};
	setDate = (props, value) => {
		this.setState({
			datesChanged: true,
		});
		const { term } = this.state;
		const val = term.split('_');
		const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];

		const values = value
			? value
			: props.values.invoiceDate1
		if (temp && values) {
			this.setState({
				invoiceDueDate: moment(values).add(temp, 'days'),
				invoiceDate: moment(values),
			});
			const date = moment(values)
				.add(temp, 'days')
				.format('DD-MM-YYYY');
			props.setFieldValue('invoiceDueDate', date, true);
			props.setFieldValue('invoiceDate1', values, true);
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

	handleSubmit = (data) => {
		this.setState({ disabled: true });
		const { current_customer_id, term } = this.state;
		const {
			receiptAttachmentDescription,
			receiptNumber,
			contact_po_number,
			currencyCode,
			invoiceDueDate,
			invoiceDate,
			contactId,
			project,
			placeOfSupplyId,
			exchangeRate,
			invoice_number,
			notes,
			changeShippingAddress,
			shippingAddress,
			footNote
		} = data;

		let formData = new FormData();
		formData.append('type', 2);
		formData.append('taxType', this.state.taxType)
		formData.append('invoiceId', current_customer_id);
		formData.append('referenceNumber', invoice_number !== null ? invoice_number : '',);
		if (changeShippingAddress && changeShippingAddress == true) {
			formData.append('changeShippingAddress', changeShippingAddress !== null ? changeShippingAddress : '');
			formData.append('shippingAddress', shippingAddress.address ?? '');
			formData.append('shippingCountry', shippingAddress.countryId ?? '');
			formData.append('shippingState', shippingAddress.stateId ?? '');
			formData.append('shippingCity', shippingAddress.city ?? '');
			formData.append('shippingPostZipCode', shippingAddress.postZipCode ?? '');
			formData.append('shippingTelephone', shippingAddress.telephone ?? '');
			formData.append('shippingFax', shippingAddress.fax ?? '');
		}//

		if (this.state.datesChanged === true) {
			formData.append(
				'invoiceDate',
				typeof invoiceDate === 'string'
					? this.state.invoiceDate
					: invoiceDate,
			);
			formData.append(
				'invoiceDueDate',
				typeof invoiceDueDate === 'string'
					? this.state.invoiceDueDate
					: invoiceDueDate,
			);
		} else {
			formData.append(
				'invoiceDate',
				typeof invoiceDate === 'string'
					? this.state.invoiceDateNoChange
					: '',
			);
			formData.append(
				'invoiceDueDate',
				typeof invoiceDueDate === 'string'
					? this.state.invoiceDueDateNoChange
					: '',
			);
		}
		formData.append('exchangeRate', exchangeRate !== null ? exchangeRate : '',);

		formData.append(
			'receiptNumber',
			receiptNumber !== null ? receiptNumber : '',
		);
		formData.append(
			'contactPoNumber',
			contact_po_number !== null ? contact_po_number : '',
		);
		formData.append(
			'receiptAttachmentDescription',
			receiptAttachmentDescription !== null ? receiptAttachmentDescription : '',
		);
		formData.append('notes', notes !== null ? notes : '');
		formData.append('footNote', footNote ? footNote : '');
		formData.append('lineItemsString', JSON.stringify(this.state.data));
		formData.append('totalVatAmount', this.state.initValue.invoiceVATAmount);
		formData.append('totalAmount', this.state.initValue.totalAmount);
		formData.append('discount', this.state.initValue.discount);
		formData.append('totalExciseAmount', this.state.initValue.total_excise);
		// formData.append('exciseType', this.state.checked);
		formData.append('term', term);
		//formData.append('placeOfSupplyId',placeOfSupplyId.value);

		if (contactId) {
			formData.append('contactId', contactId);
		}
		if (currencyCode) {
			formData.append('currencyCode', currencyCode);
		}

		if (placeOfSupplyId) {
			formData.append('placeOfSupplyId', placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId);
		}
		if (project) {
			formData.append('projectId', project);
		}
		if (this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		this.setState({ loading: true, disableLeavePage: true, loadingMsg: "Updating Invoice..." });
		this.props.customerInvoiceDetailActions
			.updateInvoice(formData)
			.then((res) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? strings.InvoiceUpdatedSuccessfully : res.data.message,
				);
				this.props.history.push('/admin/income/customer-invoice');
				this.setState({ loading: false, });
			})
			.catch((err) => {
				this.setState({ disabled: false, createDisabled: false, loading: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Invoice Updated Unsuccessfully!'
				);
			});
	};

	openCustomerModal = (e) => {
		e.preventDefault();
		this.setState({ openCustomerModal: true });
	};
	openProductModal = (props) => {
		this.setState({ openProductModal: true });
	};

	getCurrentUser = (data) => {
		let option;
		if (data.label || data.value) {
			option = data;
		} else {
			option = {
				label: `${data.fullName}`,
				value: data.id,
			};
		}
		// this.setState({
		//   selectedContact: option
		// })
		this.formRef.current.setFieldValue('contactId', option.value, true);
	};

	closeCustomerModal = (res) => {
		if (res) {
			this.props.customerInvoiceActions.getCustomerList(this.state.contactType);
		}
		this.setState({ openCustomerModal: false });
	};

	closeProductModal = (res) => {
		this.setState({ openProductModal: false });
	};

	getCurrentProduct = (newProduct) => {
		if (newProduct) {
			let newData = []
			const { data, isRegisteredVat } = this.state;
			newData = data.filter((obj) => obj.productId !== "");
			let exchangeRate = this.formRef.current?.state?.values?.exchangeRate > 0
				&& this.formRef.current?.state?.values?.exchangeRate !== "" ?
				this.formRef.current?.state?.values?.exchangeRate : 1
			// props.setFieldValue('lineItemsString', newData, true);
			// this.updateAmount(newData, props);
			this.setState(
				{
					data: [...newData, {
						id: this.state.idCount + 1,
						description: newProduct.description,
						quantity: 1,
						discount: 0,
						unitPrice: (parseFloat(newProduct.unitPrice) * (1 / exchangeRate)).toFixed(2),
						vatCategoryId: isRegisteredVat ? '' : 10,
						exciseTaxId: newProduct.exciseTaxId,
						vatAmount: newProduct.vatAmount ? newProduct.vatAmount : 0,
						subTotal: newProduct.unitPrice,
						productId: newProduct.id,
						discountType: newProduct.discountType,
						unitType: newProduct.unitType,
						unitTypeId: newProduct.unitTypeId,
					},

					],
					idCount: this.state.idCount + 1,

				},
				() => {
					const values = {
						values: this.state.initValue,
					};
					this.updateAmount(this.state.data, values);
					this.addRow();
					this.getProductType(newProduct.id);
				},
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.unitPrice`,
				newProduct.unitPrice,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.unitType`,
				newProduct.unitType,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.quantity`,
				1,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.discount`,
				1,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.discountType`,
				1,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.vatCategoryId`,
				newProduct.vatCategoryId,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.exciseTaxId`,
				1,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.productId`,
				newProduct.id,
				true,
			);
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

	setExchange = (value, props) => {
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === value;
		});
		if (result[0]) {
			this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);
			//props.handleChange('exchangeRate')(result[0].exchangeRate,);
			this.exchangeRaterevalidate(result[0].exchangeRate)
		}
		else {
			this.formRef.current.setFieldValue('exchangeRate', '', true);
			//props.handleChange('exchangeRate')(result[0].exchangeRate,);
			this.exchangeRaterevalidate('')
		}
	};
	setCurrency = (value) => {
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === value;
		});
		this.setState({ customer_currency_des: result[0].currencyName })
		this.formRef.current.setFieldValue('curreancyname', result[0].currencyName, true);
		this.setState({ customer_currency_symbol: result[0].currencyIsoCode })
	};

	deleteInvoice = () => {
		const message1 =
			<text>
				<b>Delete Customer Invoice?</b>
			</text>
		const message = 'This customer invoice will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeInvoice}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};

	removeInvoice = () => {
		this.setState({ disabled1: true });
		const { current_customer_id } = this.state;
		this.setState({ loading: true, loadingMsg: "Deleting Invoice..." });
		this.props.customerInvoiceDetailActions
			.deleteInvoice(current_customer_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? strings.InvoiceDeletedSuccessfully : res.data.message,
					);
					this.props.history.push('/admin/income/customer-invoice');
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Invoice Deleted Unsuccessfully!'
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	getCurrency = (opt) => {
		let customer_currencyCode = 0;
		let customer_item_currency = ''
		this.props.customer_list.map(item => {
			if (item.label.contactId == opt) {
				this.setState({
					customer_currency: item.label.currency.currencyCode,
					customer_currency_des: item.label.currency.currencyName,
					customer_currency_symbol: item.label.currency.currencyIsoCode,
				});

				customer_currencyCode = item.label.currency.currencyCode;
				customer_item_currency = item.label.currency
			}
		})
		return customer_currencyCode;
	}
	getTaxTreatment = (opt) => {

		let customer_taxTreatmentId = 0;
		let customer_item_taxTreatment = ''
		this.props.customer_list.map(item => {
			if (item.label.contactId == opt) {
				this.setState({
					customer_taxTreatment: item.label.taxTreatment.id,
					customer_taxTreatment_des: item.label.taxTreatment.taxTreatment,
					// customer_currency_symbol: item.label.currency.currencyIsoCode,
				});

				customer_taxTreatmentId = item.label.taxTreatment.id;
				customer_item_taxTreatment = item.label.currency
			}
		})

		return customer_taxTreatmentId;
	}

	rendertotalexcise = () => {
		const { initValue } = this.state

		let val = initValue.total_excise.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

		return parseFloat(val).toFixed(2)
	}

	getStateList = (countryCode) => {
		this.props.customerInvoiceActions.getStateList(countryCode);
	};
	getStateListForShippingAddress = (countryCode) => {
		this.props.customerInvoiceActions.getStateListForShippingAddress(countryCode)
			.then((res) => {
				this.setState({ state_list_for_shipping: res })
			});
	};

	render() {
		strings.setLanguage(this.state.language);

		const { data, isRegisteredVat, initValue, loading, dialog, param, state_list_for_shipping, taxTreatmentList } = this.state;

		const { project_list, currency_list, currency_convert_list, customer_list, universal_currency_list, country_list, } = this.props;

		let tmpCustomer_list = []
		const { loadingMsg } = this.state
		customer_list.map(item => {
			let obj = { label: item.label.contactName, value: item.value }
			tmpCustomer_list.push(obj)
		})

		let hasExciseTax = false;

		if (initValue) {
			hasExciseTax = data.some(row => (row.exciseTaxId !== null && row.exciseTaxId !== '' && row.exciseTaxId !== 0));
		}

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
													<i className="fas fa-file-invoice" />
													<span className="ml-2">{strings.UpdateInvoice}</span>
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
															// if (exist === true) {
															// 	errors.invoice_number =
															// 		'Invoice Number Already Exists';
															// }
															if (param === true) {
																errors.discount =
																	'Discount amount Cannot be greater than invoice total amount';
															}

															if (this.state.customer_taxTreatment_des != "NON GCC" && this.state.customer_taxTreatment_des != "GCC NON-VAT REGISTERED" && this.state.customer_taxTreatment_des != "GCC VAT REGISTERED") {
																if (!values.placeOfSupplyId)
																	errors.placeOfSupplyId = 'Place of supply is required';
																if (values.placeOfSupplyId && (values.placeOfSupplyId == "" || (values.placeOfSupplyId.label && values.placeOfSupplyId.label === "Select Place of Supply")))
																	errors.placeOfSupplyId = 'Place of supply is required';
															}

															if (values.changeShippingAddress === true) {
																const shippingAddressError = InputValidation.addressValidation(values.shippingAddress)
																if (shippingAddressError && Object.values(shippingAddressError).length > 0) {
																	errors.shippingAddress = shippingAddressError;
																}
															}
															let isoutoftock = 0


															values.lineItemsString.map((c, i) => {
																if (c.quantity > 0 && c.productId !== "") {

																	let product = this.props.product_list.find((o) => c.productId === o.id)
																	let stockinhand = product.stockOnHand - values.lineItemsString.reduce((a, c) => {
																		return c.productId === product.id ? a + parseInt(c.quantity) : a + 0
																	}, 0)

																	if (product.stockOnHand !== null && stockinhand < 0)
																		isoutoftock = isoutoftock + 1
																	else isoutoftock = isoutoftock + 0

																} else
																	isoutoftock = isoutoftock + 0

															})

															if (isoutoftock > 0) {
																errors.outofstock = "Some Prod"
															}

															return errors;
														}}
														validationSchema={Yup.object().shape({
															invoice_number: Yup.string().required(
																' number is required',
															),
															contactId: Yup.string().required(
																'Customer name is required',
															),
															term: Yup.string().required('Terms is required'),
															// placeOfSupplyId: Yup.string().required(
															// 	'Place of supply is required',
															// ),
															invoiceDate: Yup.string().required(
																'Invoice date is required',
															),
															invoiceDueDate: Yup.string().required(
																'Invoice due date is required',
															),
															currencyCode: Yup.string().required(
																'Currency is required',
															),
															lineItemsString: Yup.array()
																.required(
																	'Atleast one invoice sub detail is mandatory',
																)
																.of(
																	Yup.object().shape({
																		// description: Yup.string().required(
																		// 	'Value is required',
																		// ),
																		quantity: Yup.string()
																			.test(
																				'quantity',
																				strings.QuantityGreaterThan0,
																				(value) => {
																					if (value > 0) {
																						return true;
																					} else {
																						return false;
																					}
																				},
																			).required('Quantity is required'),
																		unitPrice: Yup.string()
																			.test(
																				'Unit Price',
																				strings.UnitPriceGreaterThan1,
																				(value) => {
																					if (value > 0) {
																						return true;
																					} else {
																						return false;
																					}
																				},
																			).required('Unit price is required'),
																		vatCategoryId: Yup.string().required(
																			'VAT is required',
																		),
																		productId: Yup.string().required(
																			'Product is required',
																		),
																	}),
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
																	'*File size is too large',
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
																			<Label htmlFor="invoice_number">
																				<span className="text-danger">* </span>
																				{strings.InvoiceNumber}
																			</Label>
																			<Input
																				type="text"
																				maxLength='50'
																				id="invoice_number"
																				name="invoice_number"
																				placeholder={strings.InvoiceNumber}
																				disabled
																				value={props.values.invoice_number}
																				onChange={(value) => {
																					props.handleChange('invoice_number')(
																						value,
																					);
																				}}
																				className={
																					props.errors.invoice_number &&
																						props.touched.invoice_number
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.invoice_number &&
																				props.touched.invoice_number && (
																					<div className="invalid-feedback">
																						{props.errors.invoice_number}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																</Row>
																<Row>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="contactId">
																				<span className="text-danger">* </span>
																				{strings.CustomerName}
																			</Label>
																			<Select
																				id="contactId"
																				name="contactId"

																				options={
																					tmpCustomer_list
																						? selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							tmpCustomer_list,
																							'Customer Name',
																						)
																						: []
																				}

																				value={
																					tmpCustomer_list &&
																					tmpCustomer_list.find(
																						(option) =>
																							option.value ===
																							+props.values.contactId,
																					)
																				}
																				onChange={(option) => {
																					this.resetVatId(props);
																					if (option && option.value) {
																						this.formRef.current.setFieldValue('currencyCode', this.getCurrency(option.value), true);
																						this.formRef.current.setFieldValue('taxTreatmentid', this.getTaxTreatment(option.value), true);
																						this.setExchange(this.getCurrency(option.value), props);
																						props.handleChange('contactId')(
																							option.value,
																						);
																					} else {
																						props.handleChange('contactId')('');
																					}
																					this.getCustomerShippingAddress(option.value, this.getTaxTreatment(option.value), props);

																					// this.getCurrentUser(option)
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
																				<Label htmlFor="taxTreatmentid">
																					{strings.TaxTreatment}
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
																					isDisabled={true}
																					id="taxTreatmentid"
																					name="taxTreatmentid"
																					placeholder={strings.Select + strings.TaxTreatment}
																					value={
																						taxTreatmentList &&
																						selectOptionsFactory
																							.renderOptions(
																								'name',
																								'id',
																								taxTreatmentList,
																								'VAT',
																							)
																							.find(
																								(option) =>
																									option.label ===
																									this.state.customer_taxTreatment_des,
																							)
																					}
																					onChange={(option) => {
																						props.handleChange('taxTreatmentid')(
																							option,
																						);
																					}}
																					className={
																						props.errors.taxTreatmentid &&
																							props.touched.taxTreatmentid
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.taxTreatmentid &&
																					props.touched.taxTreatmentid && (
																						<div className="invalid-feedback">
																							{props.errors.taxTreatmentid}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																	}
																	{/* <Col>
																	<Label
																		htmlFor="contactId"
																		style={{ display: 'block' }}
																	>
																		Add New Customer
																	</Label>
																	<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3 mb-3"
																		onClick={this.openCustomerModal}
																	>
																		<i className="fa fa-plus"></i> Add a
																		Customer
																	</Button>
																</Col> */}
																	<Col lg={3}>
																		{this.state.customer_taxTreatment_des !== "NON GCC" && this.state.customer_taxTreatment_des !== "GCC VAT REGISTERED" && this.state.customer_taxTreatment_des !== "GCC NON-VAT REGISTERED" &&
																			(<FormGroup className="mb-3">
																				<Label htmlFor="placeOfSupplyId">
																					<span className="text-danger">* </span>
																					{/* {this.state.customer_taxTreatment_des &&
																		(this.state.customer_taxTreatment_des=="VAT REGISTERED" 
																		||this.state.customer_taxTreatment_des=="VAT REGISTERED DESIGNATED ZONE" 
																		||this.state.customer_taxTreatment_des=="GCC VAT REGISTERED") && (
																			<span className="text-danger">* </span>
																		)} */}
																					{strings.PlaceofSupply}
																				</Label>
																				<Select
																					options={
																						this.placelist
																							? selectOptionsFactory.renderOptions(
																								'label',
																								'value',
																								this.placelist,
																								'Place of Supply',
																							)
																							: []
																					}
																					id="placeOfSupplyId"
																					name="placeOfSupplyId"
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
																					onChange={(options) => {
																						if (options && options.value) {
																							props.handleChange(
																								'placeOfSupplyId',
																							)(options.value);
																						} else {
																							props.handleChange(
																								'placeOfSupplyId',
																							)('');
																						}
																					}}
																					className={`${props.errors.placeOfSupplyId &&
																						props.touched.placeOfSupplyId
																						? 'is-invalid'
																						: ''
																						}`}
																				/>
																				{props.errors.placeOfSupplyId &&
																					props.touched.placeOfSupplyId && (
																						<div className="invalid-feedback">
																							{props.errors.placeOfSupplyId}
																						</div>
																					)}
																			</FormGroup>)}
																	</Col>
																</Row>
																<hr />
																<Row>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="term">
																				<span className="text-danger">* </span>
																				{strings.Terms}{' '}
																				<i
																					id="UncontrolledTooltipExample"
																					className="fa fa-question-circle ml-1"
																				></i>
																				<UncontrolledTooltip
																					placement="right"
																					target="UncontrolledTooltipExample"
																				>
																					<p>
																						{' '}
																						Terms- The duration given to a buyer for
																						payment.
																					</p>

																					<p>
																						Net 7 – payment due in 7 days from
																						invoice date{' '}
																					</p>

																					<p>
																						{' '}
																						Net 10 – payment due in 10 days from
																						invoice date{' '}
																					</p>

																					<p>
																						{' '}
																						Net 30 – payment due in 30 days from
																						invoice date{' '}
																					</p>
																				</UncontrolledTooltip>
																			</Label>
																			<Select
																				options={
																					this.termList
																						? selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							this.termList,
																							'Terms',
																						)
																						: []
																				}
																				id="term"
																				name="term"
																				placeholder={strings.Select + strings.Terms}
																				value={
																					this.termList &&
																					this.termList.find(
																						(option) =>
																							option.value === props.values.term,
																					)
																				}
																				onChange={(e) => {
																					if (e.value === '') {

																						props.setFieldValue(
																							'term',
																							'',
																						);
																					} else {
																						this.setState(
																							{
																								term: e.value,
																							},
																							() => {
																								this.setDate(props, '');
																							},
																						);
																						props.handleChange('term')(
																							e.value,
																						);
																					}
																				}}
																				className={`${props.errors.term && props.touched.term
																					? 'is-invalid'
																					: ''
																					}`}
																			/>
																			{props.errors.term &&
																				props.touched.term && (
																					<div className="invalid-feedback">
																						{props.errors.term}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="date">
																				<span className="text-danger">* </span>
																				{strings.InvoiceDate}
																			</Label>
																			<DatePicker
																				id="invoiceDate"
																				name="invoiceDate"
																				placeholderText={strings.InvoiceDate}
																				showMonthDropdown
																				showYearDropdown
																				dateFormat="dd-MM-yyyy"
																				//minDate={new Date()}
																				dropdownMode="select"
																				value={props.values.invoiceDate}
																				selected={new Date(props.values.invoiceDate1)}

																				onChange={(value) => {
																					if ((this.state.invoiceDateForVatValidation < this.state.companyVATRegistrationDate && value > this.state.companyVATRegistrationDate) || (value < this.state.companyVATRegistrationDate && this.state.invoiceDateForVatValidation > this.state.companyVATRegistrationDate)) {
																						this.resetVatId(props);
																					}
																					this.setState({ invoiceDateForVatValidation: value });
																					props.handleChange('invoiceDate')(
																						value
																					);
																					this.setDate(props, value);
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
																						{props.errors.invoiceDate.includes("nullable()") ? "Invoice date is required" : props.errors.invoiceDate}																				</div>
																				)}
																		</FormGroup>
																	</Col>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="due_date">
																				{strings.InvoiceDueDate}
																			</Label>
																			<div>
																				<DatePicker
																					id="invoiceDueDate"
																					name="invoiceDueDate"
																					placeholderText={strings.InvoiceDueDate}
																					showMonthDropdown
																					showYearDropdown
																					disabled
																					dateFormat="dd-MM-yyyy"
																					dropdownMode="select"
																					value={props.values.invoiceDueDate}
																					onChange={(value) => {
																						props.handleChange('invoiceDueDate')(
																							value,
																						);
																					}}
																					className={`form-control ${props.errors.invoiceDueDate &&
																						props.touched.invoiceDueDate
																						? 'is-invalid'
																						: ''
																						}`}
																				/>
																				{props.errors.invoiceDueDate &&
																					props.touched.invoiceDueDate && (
																						<div className="invalid-feedback">
																							{props.errors.invoiceDueDate}
																							{/* {props.errors.invoiceDate.includes("nullable()") ? "Invoice date is required" :props.errors.invoiceDate} */}
																						</div>
																					)}
																			</div>
																		</FormGroup>
																	</Col>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="currencyCode">
																				<span className="text-danger">* </span>
																				{strings.Currency}
																			</Label>
																			<Select

																				styles={customStyles}
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
																				id="currencyCode"
																				name="currencyCode"
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
																								(this.state.customer_currency ? +this.state.customer_currency : +props.values.currencyCode),
																						)
																				}
																				onChange={(option) => {
																					props.handleChange('currencyCode')(option.value)
																					this.setExchange(option.value)
																					this.setCurrency(option.value)
																					this.setState({ customer_currency: option.value })

																				}}
																				className={`${props.errors.currencyCode &&
																					props.touched.currency
																					? 'is-invalid'
																					: ''
																					}`}
																			/>
																			{props.errors.currencyCode &&
																				props.touched.currencyCode && (
																					<div className="invalid-feedback">
																						{props.errors.currencyCode}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																</Row>
																<hr />
																<Row>
																	<Col>
																		<FormGroup check inline className="mb-3">
																			<div>
																				<Input
																					// className="custom-control-input"
																					type="checkbox"
																					id="inline-radio1"
																					name="SMTP-auth"
																					checked={props.values.changeShippingAddress}
																					onChange={(value) => {
																						if (value !== null) {
																							props.handleChange('changeShippingAddress')(
																								value,
																							);
																						} else {
																							props.handleChange('changeShippingAddress')(
																								'',
																							);
																						}
																					}}
																				/>
																				<label htmlFor="inline-radio1">
																					{strings.noteforchangeaddress}
																				</label>
																			</div>
																		</FormGroup>

																	</Col>
																</Row>

																<Row style={{ display: props.values.changeShippingAddress === true ? '' : 'none' }}>
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
																		disabled={{ email: false, city: false, countryId: false, address: false, postZipCode: false, stateId: false, telephone: false, fax: false, }}
																	/>
																</Row>
																<hr />

																<Row style={{ display: props.values.exchangeRate === 1 ? 'none' : '' }}>
																	<Col>
																		<Label htmlFor="currency">
																			{strings.CurrencyExchangeRate}
																		</Label>
																	</Col>
																</Row>

																<Row
																	style={{ display: props.values.exchangeRate === 1 ? 'none' : '' }}
																>
																	<Col md={1}>
																		<Input
																			disabled
																			id="1"
																			name="1"
																			value={
																				1}

																		/>
																	</Col>
																	<Col md={2}>
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
																					placeholder='Select Currency'
																					value={this.state.customer_currency_des ? this.state.customer_currency_des : props.values.currencyName}
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
																					//min="0"
																					maxLength="14,2"
																					className="form-control"
																					id="exchangeRate"
																					name="exchangeRate"
																					value={props.values.exchangeRate}
																					onChange={(value) => {
																						props.handleChange('exchangeRate')(
																							value,
																						);
																						this.exchangeRaterevalidate(parseFloat(value.target.value))
																					}}
																				/>
																			</div>
																		</FormGroup>
																	</Col>

																	<Col md={2}>
																		<Input
																			disabled
																			id="currencyName"
																			name="currencyName"
																			value={
																				this.state.basecurrency.currencyName}
																		/>
																	</Col>

																	<hr />
																</Row>

																<hr style={{ display: props.values.exchangeRate === 1 ? 'none' : '' }} />
																<Row className="mb-1">
																	<Col lg={8}>
																		<Button
																			color="primary"
																			className="btn-square mr-3"
																			onClick={(e, props) => {
																				this.openProductModal()
																			}}
																		>
																			<i className="fa fa-plus"></i> {strings.Addproduct}
																		</Button>
																	</Col>
																	<Col>

																		{this.state.taxType === false ?
																			<span style={{ color: "#0069d9" }} className='mr-4'><b>{strings.Exclusive}</b></span> :
																			<span className='mr-4'>{strings.Exclusive}</span>}
																		<Switch
																			value={props.values.taxType}
																			checked={this.state.taxType}
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
																</Row>


																<Row>
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
																				//	width="17%"
																				dataField="product"
																				dataFormat={(cell, rows) =>
																					this.renderProduct(cell, rows, props)
																				}
																			>
																				{strings.PRODUCT}
																			</TableHeaderColumn>
																			{/* <TableHeaderColumn
																		width="55"
																		dataAlign="center"
																		dataFormat={(cell, rows) =>
																			this.renderAddProduct(cell, rows, props)
																		}
																	></TableHeaderColumn> */}
																			{/* <TableHeaderColumn
																			dataField="description"
																			dataFormat={(cell, rows) =>
																				this.renderDescription(
																					cell,
																					rows,
																					props,
																				)
																			}
																		>
																			{strings.DESCRIPTION}
																		</TableHeaderColumn> */}
																			<TableHeaderColumn
																				dataField="quantity"
																				//width="13%"
																				dataFormat={(cell, rows) =>
																					this.renderQuantity(cell, rows, props)
																				}
																			>
																				{strings.QUANTITY}
																			</TableHeaderColumn>
																			{/* <TableHeaderColumn
																			width="5%"
																			dataField="unitType"
																     	>{strings.Unit}	<i
																		 id="unitTooltip"
																		 className="fa fa-question-circle ml-1"
																	 ></i>
																	 
																	 <UncontrolledTooltip
																		 placement="right"
																		 target="unitTooltip"
																	 >
																		Units / Measurements
																	 </UncontrolledTooltip>
																 </TableHeaderColumn>  */}
																			<TableHeaderColumn
																				dataField="unitPrice"
																				dataFormat={(cell, rows) =>
																					this.renderUnitPrice(cell, rows, props)
																				}
																			>
																				{strings.UNITPRICE}
																			</TableHeaderColumn>
																			{this.state.discountEnabled == true &&
																				<TableHeaderColumn
																					//width="12%"
																					dataField="discount"
																					dataFormat={(cell, rows) =>
																						this.renderDiscount(cell, rows, props)
																					}
																				>
																					{strings.Discount}
																				</TableHeaderColumn>}
																			{hasExciseTax &&
																				<TableHeaderColumn
																					//width="10%"
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
																				</TableHeaderColumn>}
																			{isRegisteredVat &&
																				<TableHeaderColumn
																					width={"250px"}
																					dataField="vat"
																					dataFormat={(cell, rows) =>
																						this.renderVat(cell, rows, props)
																					}
																				//width="13%"
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
																</Row>
																<Row className="ml-4 ">
																	<Col className=" ml-4">
																		<FormGroup className='pull-right'>
																			<Input
																				type="checkbox"
																				id="discountEnabled"
																				checked={this.state.discountEnabled}
																				onChange={(option) => {
																					if (initValue.discount > 0) {
																						this.setState({ discountEnabled: true })
																					} else {
																						this.setState({ discountEnabled: !this.state.discountEnabled })
																					}
																				}}
																			/>
																			<Label>{strings.ApplyLineItemDiscount}</Label>
																		</FormGroup>
																	</Col>
																</Row>
																{data.length > 0 && (
																	<Row>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="receiptNumber">
																					{strings.ReferenceNumber}
																				</Label>
																				<Input
																					type="text"
																					maxLength="20"
																					style={{ width: "500px" }}
																					id="receiptNumber"
																					name="receiptNumber"
																					value={props.values.receiptNumber}
																					placeholder={strings.ReceiptNumber}
																					onChange={(value) => {
																						props.handleChange('receiptNumber')(value);

																					}}
																					className={props.errors.receiptNumber && props.touched.receiptNumber ? "is-invalid" : ""}
																				/>
																				{props.errors.receiptNumber && props.touched.receiptNumber && (
																					<div className="invalid-feedback">{props.errors.receiptNumber}</div>
																				)}
																			</FormGroup>
																		</Col>
																		<Col lg={8}>
																			<FormGroup className="py-2">
																				<Label htmlFor="notes">{strings.Notes}</Label><br />
																				<TextField
																					type="textarea"
																					className="textarea form-control"
																					maxLength="255"
																					style={{ width: "500px" }}
																					name="notes"
																					id="notes"
																					rows="2"
																					placeholder={strings.DeliveryNotes}
																					onChange={(option) =>
																						props.handleChange('notes')(option)
																					}
																					value={props.values.notes}
																				/>
																			</FormGroup>
																			<Row>

																				<Col lg={6}>
																					<FormGroup className="mb-3 hideAttachment">
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
																				</Col>
																			</Row>
																			<FormGroup className="mb-3 hideAttachment">
																				<Label htmlFor="receiptAttachmentDescription">
																					{strings.AttachmentDescription}
																				</Label>
																				<br />
																				<TextField
																					type="textarea"
																					className="textarea form-control"
																					maxLength="255"
																					style={{ width: "500px" }}
																					name="receiptAttachmentDescription"
																					id="receiptAttachmentDescription"
																					rows="2"
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
																			</FormGroup>
																			<FormGroup className="mb-3">
																				<Label htmlFor="footNote">
																					{strings.Footnote}
																				</Label>
																				<br />
																				<TextField
																					type="textarea"
																					className="textarea form-control"
																					maxLength="255"
																					style={{ width: "500px" }}
																					name="footNote"
																					id="footNote"
																					rows="2"
																					placeholder={strings.PaymentDetails}
																					onChange={(option) =>
																						props.handleChange(
																							'footNote',
																						)(option)
																					}
																					value={
																						props.values.footNote
																					}
																				/>
																			</FormGroup>
																		</Col>
																		<Col lg={4}>
																			<div className="">
																				{hasExciseTax  ?
																					<div className="total-item p-2" >
																						<Row>
																							<Col lg={6}>
																								<h5 className="mb-0 text-right">
																									{strings.Total_Excise}
																								</h5>
																							</Col>
																							<Col lg={6} className="text-right">
																								<label className="mb-0">

																									{this.state.customer_currency_symbol} &nbsp;
																									{/* {this.rendertotalexcise()} */}
																									{initValue.total_excise.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
																								</label>
																							</Col>
																						</Row>
																					</div> : ''}
																				{this.state.discountEnabled == true ?
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
																									{initValue.discount ? initValue.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : initValue.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
																								</label>
																							</Col>
																						</Row>
																					</div> : ''}
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
																								{initValue.total_net.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
																									{initValue.invoiceVATAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
																								{/* {universal_currency_list[0] && (
																						<Currency
																						value=	{initValue.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						currencySymbol={
																							universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)} */}
																								{this.state.customer_currency_symbol} &nbsp;
																								{initValue.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
																							</label>
																						</Col>
																					</Row>
																				</div>
																			</div>
																		</Col>
																	</Row>
																)}
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
																				onClick={this.deleteInvoice}
																			>
																				<i className="fa fa-trash"></i>{' '} {this.state.disabled1
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
																					if (this.state.data.length === 1) {
																						console.log(props.errors, "ERRORs")
																						//	added validation popup	msg
																						props.handleBlur();
																						if (props.errors && Object.keys(props.errors).length != 0)
																							this.props.commonActions.fillManDatoryDetails();
																					}
																					else {
																						let newData = []
																						const data = this.state.data;
																						newData = data.filter((obj) => obj.productId !== "");
																						props.setFieldValue('lineItemsString', newData, true);
																						this.updateAmount(newData, props);

																						props.handleBlur();
																						const errors = { ...props.errors }
																						delete errors.lineItemsString
																						if (errors && Object.keys(errors).length != 0) {
																							this.props.commonActions.fillManDatoryDetails();
																						}
																					}
																				}
																				}
																			>
																				<i className="fa fa-dot-circle-o"></i>{' '}
																				{this.state.disabled
																					? 'Updating...'
																					: strings.Update}
																			</Button>
																			<Button
																				color="secondary"
																				className="btn-square"
																				onClick={() => {
																					if (this.props?.location?.state?.renderURL) {
																						this.props.history.push(
																							`${this.props?.location?.state?.renderURL}`, 
																							{ id: this.props?.location?.state?.renderID },);
																					} else
																						this.props.history.push(
																							'/admin/income/customer-invoice',
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
					</div>
					<CustomerModal
						openCustomerModal={this.state.openCustomerModal}
						closeCustomerModal={(e) => {
							this.closeCustomerModal(e);
						}}
						getCurrentUser={(e) => this.getCurrentUser(e)}
						createCustomer={this.props.customerInvoiceActions.createCustomer}
						currency_list={this.props.currency_list}
						country_list={this.props.country_list}
						getStateList={this.props.customerInvoiceActions.getStateList}
					/>
					<ProductModal
						openProductModal={this.state.openProductModal}
						closeProductModal={(e) => {
							this.closeProductModal(e);
						}}
						getCurrentProduct={(e) => {
							this.props.customerInvoiceActions.getProductList().then(res => {
								if (res.status === 200)
									this.getCurrentProduct(res.data[0])
							})
						}}
						income={this.state.income}
						createProduct={this.props.productActions.createAndSaveProduct}
						// vat_list={this.props.vat_list}
						vat_list={this.state.vat_list}
						product_category_list={this.props.product_category_list}
						salesCategory={this.state.salesCategory}
						purchaseCategory={this.state.purchaseCategory}
					/>
				</div>
				{this.state.disableLeavePage ? "" : <LeavePage />}
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(DetailCustomerInvoice);