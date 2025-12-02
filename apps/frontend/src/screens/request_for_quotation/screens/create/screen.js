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
	UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import * as RequestForQuotationCreateAction from './actions'
import * as RequestForQuotationAction from '../../actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { SupplierModal } from '../../../supplier_invoice/sections/index';
import { ProductModal } from '../../../customer_invoice/sections';
import { TextareaAutosize } from '@material-ui/core';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { optionFactory, selectCurrencyFactory,selectOptionsFactory } from 'utils';
import './style.scss';
import Switch from "react-switch";
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import moment from 'moment';

const mapStateToProps = (state) => {
	return {
		contact_list: state.request_for_quotation.contact_list,
		currency_list: state.request_for_quotation.currency_list,
		vat_list: state.request_for_quotation.vat_list,
		product_list: state.request_for_quotation.product_list,
		supplier_list: state.request_for_quotation.supplier_list,
		excise_list: state.request_for_quotation.excise_list,
		country_list: state.request_for_quotation.country_list,
		product_category_list: state.product.product_category_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.currencyConvert.currency_convert_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		requestForQuotationAction: bindActionCreators(
			RequestForQuotationAction,
			dispatch,
		),
		
		ProductActions: bindActionCreators(ProductActions, dispatch),
		requestForQuotationCreateAction: bindActionCreators(RequestForQuotationCreateAction,dispatch),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
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

const invoiceimage = require('assets/images/invoice/invoice.png');

let strings = new LocalizedStrings(data);
class CreateRequestForQuotation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			supplier_currency_symbol:'',
			loading: false,
			discountOptions: [
				{ value: 'FIXED', label: 'Fixed' },
				{ value: 'PERCENTAGE', label: 'Percentage' },
			],
			discount_option: '',
			disabled: false,
			data: [
				{
					id: 0,
					description: '',
					quantity: 1,
					unitPrice: '',
					vatCategoryId: '',
					exciseTaxId:'',
					exciseAmount:'',
					subTotal: 0,
					vatAmount:0,
					productId: ''
				},
			],
			discountEnabled: false,
			idCount: 0,
			date1:new Date().setMonth(new Date().getMonth() + 1),
			checked:false,
			initValue: {
				receiptNumber: '',
				total_excise: 0,
				contact_po_number: '',
				currencyCode: '',
				rfqReceiveDate: new Date(),
				//rfqExpiryDate: new Date(new Date().setMonth(new Date().getMonth()+1)),
				rfqExpiryDate: new Date(),
				supplierId: '',
				placeOfSupplyId: '',
				project: '',
				exchangeRate:'',
				lineItemsString: [
					{
						id: 0,
						description: '',
						quantity: 1,
						unitPrice: '',
						vatCategoryId: '',
						subTotal: 0,
						productId: '',
						isExciseTaxExclusive: '',
						unitType:'',
						unitTypeId:''	,				
						discountType: 'FIXED',
					},
				],
				rfq_number: '',
				total_net: 0,
				invoiceVATAmount: 0,
				totalVatAmount: 0,
				term: '',
				totalAmount: 0,
				notes: '',
				discount: 0,
				discountPercentage: 0,
				receiptAttachmentDescription:'',
				// discountType: { value: 'FIXED', label: 'Fixed' },
			},
			taxType: false,
			currentData: {},
			contactType: 1,
			openSupplierModal: false,
			openProductModal: false,
			openInvoiceNumberModel: false,
			selectedContact: '',
			createMore: false,
			fileName: '',
			prefix: '',
			selectedType: { value: 'FIXED', label: 'Fixed' },
			discountPercentage: '',
			discountAmount: 0,
			purchaseCategory: [],
			exist: false,
			language: window['localStorage'].getItem('language'),	
			loadingMsg:"Loading...",
			disableLeavePage:false, 
			vat_list:[
				{
					"id": 1,
					"vat": 5,
					"name": "STANDARD RATED TAX (5%) "
				},
				{
					"id": 2,
					"vat": 0,
					"name": "ZERO RATED TAX (0%)"
				},
				{
					"id": 3,
					"vat": 0,
					"name": "EXEMPT"
				},
				{
					"id": 4,
					"vat": 0,
					"name": "OUT OF SCOPE"
				},
				{
					"id": 10,
					"vat": 0,
					"name": "N/A"
				}
			]
	
		};

		this.formRef = React.createRef();
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
		// this.options = {
		//   paginationPosition: 'top'
		// }
		this.termList = [
			{ label: 'Net 7 Days', value: 'NET_7' },
			{ label: 'Net 10 Days', value: 'NET_10' },
			{ label: 'Net 30 Days', value: 'NET_30' },
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
		this.regExInvNum = /[a-zA-Z0-9-/]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}
	

	renderProductName = (cell, row) => {
		return (
			<div className="d-flex align-items-center">
				<Input type="hidden" className="mr-1"></Input>
			</div>
		);
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
						isDisabled={row.exciseTaxId === 0 || row.exciseTaxId === null }
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
						placeholder={"Select Excise"}
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
						}}
					}
						className={`${
							props.errors.lineItemsString &&
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
						maxLength="250"
						value={row['description'] !== '' ? row['description'] : ''}
						onChange={(e) => {
							this.selectItem(
								e.target.value,
								row,
								'description',
								form,
								field,
								props,
							);
						}}
						placeholder={strings.Description}
						className={`form-control 
            ${
							props.errors.lineItemsString &&
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
						<div className="input-group">
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
										props
									);
								}
							} }
							placeholder={strings.Quantity}
							className={`form-control w-50 
							${
								props.errors.lineItemsString &&
									props.errors.lineItemsString[parseInt(idx, 10)] &&
									props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
									Object.keys(props.touched).length > 0 &&
									props.touched.lineItemsString &&
									props.touched.lineItemsString[parseInt(idx, 10)] &&
									props.touched.lineItemsString[parseInt(idx, 10)].quantity
									? 'is-invalid'
									: ''}`} />
									{row['productId'] != '' ? 
									<Input value={row['unitType'] }  disabled/> : ''}
									</div>
						{props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].quantity && (
								<div className="invalid-feedback" style={{display:"block", whiteSpace: "normal"}}>
									{props.errors.lineItemsString[parseInt(idx, 10)].quantity}
								</div>
							)}

					</div>

				)} />
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
					min="0"
						maxLength="14,2"
						value={row['unitPrice'] !== 0 ? row['unitPrice'] : 0}
						onChange={(e) => {
							if (e.target.value === '' || this.regDecimal.test(e.target.value)) {
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
            ${
							props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].unitPrice &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].unitPrice
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
			   <div  className="input-group">
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
					   placeholder={strings.discount}
					   className={`form-control 
		   ${
						   props.errors.lineItemsString &&
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

		<div 	style={{width:'100px'}}>
		<Select


																						   options={discountOptions}
																						   id="discountType"
																						   name="discountType"
																						   value={
																						discountOptions &&
																							selectOptionsFactory
																								.renderOptions('label', 'value', discountOptions, 'discount')
																								.find((option) => option.value == row.discountType)
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

	renderSubTotal = (cell, row, extraData) => {
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
		return row.subTotal === 0 ? this.state.supplier_currency_symbol +" "+ row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 }) : this.state.supplier_currency_symbol +" "+ row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 });

		// return row.subTotal === 0 ?  row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) :  row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 });
 
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
		let value =  row.vatAmount && row.vatAmount != 0 ?  row.vatAmount:0
		return value === 0 ? this.state.supplier_currency_symbol +" "+ value.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 }) : this.state.supplier_currency_symbol +" "+ value.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 });
	};

	getParentRfqDetails=(parentId)=>{
		this.props.requestForQuotationCreateAction
				.getRFQeById(parentId)
				.then((res) => {
					if (res.status === 200) {
						this.getCompanyCurrency();
						this.purchaseCategory();
						this.setState(
							{
								parentId: this.props.location.state.id,
								initValue: {
									rfqReceiveDate: res.data.rfqReceiveDate
										? moment(res.data.rfqReceiveDate).format('DD-MM-YYYY')
										: '',
									rfqReceiveDate1: res.data.rfqReceiveDate
										? res.data.rfqReceiveDate
										: '',
									rfqExpiryDate: res.data.rfqExpiryDate
										? moment(res.data.rfqExpiryDate).format('DD-MM-YYYY')
										: '',
									rfqExpiryDate1: res.data.rfqExpiryDate
										?  res.data.rfqExpiryDate
										: '',
									supplierId: res.data.supplierId ? res.data.supplierId : '',
									rfqNumber: res.data.rfqNumber
										? res.data.rfqNumber
										: '',
									totalVatAmount: res.data.totalVatAmount
										? res.data.totalVatAmount
										: 0,
									totalAmount: res.data.totalAmount ? res.data.totalAmount : 0,
										total_net: 0,
									notes: res.data.notes ? res.data.notes : '',
									lineItemsString: res.data.poQuatationLineItemRequestModelList
										? res.data.poQuatationLineItemRequestModelList
										: [],
									fileName: res.data.fileName ? res.data.fileName : '',
									placeOfSupplyId: res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '',
									total_excise: res.data.totalExciseAmount ? res.data.totalExciseAmount : 0,
									taxType : res.data.taxType ? true : false,
									receiptNumber:res.data.rfqNumber ?res.data.rfqNumber:'',	
									receiptAttachmentDescription: res.data.receiptAttachmentDescription? res.data.receiptAttachmentDescription : '',
								},
										rfqExpiryDateNoChange: res.data.rfqExpiryDate
										?  moment(res.data.rfqExpiryDate)
										: '',
										rfqReceiveDateNoChange: res.data.rfqReceiveDate
										? moment(res.data.rfqReceiveDate)
										: '',
										rfqReceiveDate: res.data.rfqReceiveDate
										? res.data.rfqReceiveDate
										: '',	
										rfqExpiryDate: res.data.rfqExpiryDate
										? res.data.rfqExpiryDate
										: '',
										receiptNumber: res.data.receiptNumber
										? res.data.receiptNumber
										: '',
										taxType : res.data.taxType ? true : false,
								customer_taxTreatment_des : res.data.taxtreatment ? res.data.taxtreatment : '',
								placeOfSupplyId: res.data.placeOfSupplyId ? res.data.placeOfSupplyId : '',
								total_excise: res.data.totalExciseAmount ? res.data.totalExciseAmount : '',
								contactId:res.data.supplierId ? res.data.supplierId : '',
								data: res.data.poQuatationLineItemRequestModelList
									? res.data.poQuatationLineItemRequestModelList
									: [],
								selectedContact: res.data.supplierId ? res.data.supplierId : '',
							
								loading: false,
							},
							() => {
								if (this.state.data.length > 0) {
									this.updateAmount(this.state.data);
									const { data } = this.state;
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
									
									let tmpSupplier_list = []
							           this.props.supplier_list.map(item => {
										let obj = {label: item.label.contactName, value: item.value}
										tmpSupplier_list.push(obj)
									})
								let supplier=	tmpSupplier_list && selectOptionsFactory.renderOptions('label','value',tmpSupplier_list,strings.CustomerName,).find((option) => option.value ==res.data.supplierId)
									this.formRef.current.setFieldValue('supplierId', supplier, true);
									this.formRef.current.setFieldValue('placeOfSupplyId', res.data.placeOfSupplyId, true);
									this.formRef.current.setFieldValue('currency', this.getCurrency(res.data.supplierId), true);
									this.formRef.current.setFieldValue('taxTreatmentid', this.getTaxTreatment(res.data.supplierId), true);
									// this.formRef.current.setFieldValue('receiptNumber', res.data.receiptNumber, true);
									// this.formRef.current.setFieldValue('notes',  res.data.notes, true);
									this.addRow();
								} else {
									this.setState({
										idCount: 0,
									});
								}
							},
						);
						this.getCurrency(res.data.supplierId)	
			}
		});
	}
	getDefaultNotes=()=>{
		this.props.commonActions.getNoteSettingsInfo().then((res)=>{
			if(res.status===200){
				this.formRef.current.setFieldValue('notes',res.data.defaultTermsAndConditions, true);
				this.formRef.current.setFieldValue('footNote',  res.data.defaultFootNotes, true);
			}
		})
	}
	componentDidMount = () => {
		this.getDefaultNotes()
		this.props.requestForQuotationAction.getVatList();
		this.getInitialData();
		// if(this.props.location.state &&this.props.location.state.contactData)
		// 		this.getCurrentUser(this.props.location.state.contactData);
		if(this.props.location.state && this.props.location.state.parentId )
				this.getParentRfqDetails(this.props.location.state.parentId);		
		
	};

	getInitialData = () => {
		this.props.requestForQuotationAction.getVatList().then((res)=>{
			if(res.status==200 && res.data)
			this.setState({vat_list:res.data})
		});
		this.getInvoiceNo();
		this.props.requestForQuotationAction.getSupplierList(this.state.contactType);
		this.props.currencyConvertActions.getCurrencyConversionList().then((response) => {
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						currencyCode: response.data
							? parseInt(response.data[0].currencyCode)
							: '',
					},
				},
			});
			// this.formRef.current.setFieldValue(
			// 	'currency',
			// 	response.data[0].currencyCode,
			// 	true,
			// );
		});
		this.props.requestForQuotationAction.getInvoicePrefix().then((response) => {
			this.setState({prefixData:response.data
		});
		});
		this.props.requestForQuotationAction.getExciseList();
		this.props.requestForQuotationAction.getVatList();
		this.props.requestForQuotationAction.getCountryList();
		this.props.requestForQuotationAction.getProductList();
		this.props.ProductActions.getProductCategoryList();
		this.purchaseCategory();
		this.salesCategory();
		this.getCompanyCurrency();
	};

	salesCategory = () => {
		try {
			this.props.ProductActions.getTransactionCategoryListForSalesProduct(
				'2',
			).then((res) => {
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

	purchaseCategory = () => {
		try {
			this.props.ProductActions.getTransactionCategoryListForPurchaseProduct(
				'10',
			).then((res) => {
				if (res.status === 200) {
					this.setState(
						{
							purchaseCategory: res.data,
						},
						() => {},
					);
				}
			});
		} catch (err) {
			console.log(err);
		}
	};

	addRow = () => {
		const data = [...this.state.data];
		this.setState(
			{
				data: data.concat({
					id: this.state.idCount + 1,
					description: '',
					quantity: 1,
					unitPrice: '',
					vatCategoryId: '',
					subTotal: 0,
					exciseTaxId:'',
					exciseAmount:'',
					discountType:'FIXED',
					vatAmount:0,
					 discount: 0,
					productId: '',
					unitType:'',
					unitTypeId:''
				}),
				idCount: this.state.idCount + 1,
			},
			() => {
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
			name === 'quantity'||
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
							vat_list &&
							selectOptionsFactory
								.renderOptions('name', 'id', vat_list, 'VAT')
								.find((option) => option.value === +row.vatCategoryId)
						}
						id="vatCategoryId"
						placeholder={strings.Select+strings.VAT}
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
						}}
					}
						className={`${
							props.errors.lineItemsString &&
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

	prductValue = (e, row, name, form, field, props) => {
		const { product_list } = this.props;
		let data = this.state.data;
		const result = product_list.find((item) => item.id === parseInt(e));
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				obj['unitPrice'] = result.unitPrice;
				obj['vatCategoryId'] = result.vatCategoryId;
				obj['exciseTaxId'] = result.exciseTaxId;
				obj['description'] = result.description;
				obj['discountType'] = result.discountType;
				obj['isExciseTaxExclusive'] = result.isExciseTaxExclusive;
				obj['unitType']=result.unitType;
				obj['unitTypeId']=result.unitTypeId;				
				idx = index;
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
			`lineItemsString.${idx}.exciseTaxId`,
			result.exciseTaxId,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.description`,
			result.description,
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
		const { product_list } = this.props;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});
		// if (product_list.length > 0) {
		return (
			<Field
				name={`lineItemsString.${idx}.productId`}
				render={({ field, form }) => (
				<>
					<Select
						options={
							product_list
								? optionFactory.renderOptions(
										'name',
										'id',
										product_list,
										'Product',
								  )
								: []
						}
						id="productId"
						placeholder={strings.Select+strings.Product}
						onChange={(e) => {
							if (e && e.label !== 'Select Product') {
								this.selectItem(e.value, row, 'productId', form, field, props);
								this.prductValue(e.value, row, 'productId', form, field, props);
								if(this.checkedRow()==false)
								this.addRow();
								// this.formRef.current.props.handleChange(field.name)(e.value)
							} else {
								form.setFieldValue(
									`lineItemsString.${idx}.productId`,
									e.value,
									true,
								);
								this.setState({
									data: [
										{
											id: 0,
											description: '',
											quantity: 1,
											unitPrice: '',
											vatCategoryId: '',
											subTotal: 0,
											productId: '',
										},
									],
								});
							}
						}}
						value={
							product_list && row.productId
								? selectOptionsFactory
										.renderOptions('name', 'id', product_list, 'Product')
										.find((option) => option.value === +row.productId)
								: []
						}
						className={`${
							props.errors.lineItemsString &&
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
						   <Input
						type="text"
						maxLength="250"
						value={row['description'] !== '' && row['description'] !== null ? row['description'] : ''}
						onChange={(e) => {
							this.selectItem(e.target.value, row, 'description', form, field);
						}}
						placeholder={strings.Description}
						className={`form-control ${
							props.errors.lineItemsString &&
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
		// } else {
		// 	return (
		// 		<Button
		// 			type="button"
		// 			color="primary"
		// 			className="btn-square mr-3 mb-3"
		// 			onClick={(e, props) => {
		// 				this.openProductModal(props);
		// 			}}
		// 		>
		// 			<i className="fa fa-plus"></i> Add a Product
		// 		</Button>
		// 	);
		// }
	};
	// selectCategory = (options, row, name, form, field, props) => {
	// 	let data = this.state.data;
	// 	let idx;
	// 	data.map((obj, index) => {
	// 		if (obj.id === row.id) {
	// 			obj['transactiomCategoryId'] = options;
	// 			idx = index;
	// 		}
	// 		return obj;
	// 	});
	// 	console.log(data);
	// 	form.setFieldValue(
	// 		`lineItemsString.${idx}.transactiomCategoryId`,
	// 		options,
	// 		true,
	// 	);
	// };


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
			</Button>: ''
	};

	checkedRow = () => {
		if (this.state.data.length > 0) {
			let length = this.state.data.length - 1;
			let temp = Object.values(this.state.data[`${length}`]).indexOf('');
			if (temp > -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	// setDate = (props, value) => {
	// 	const { term } = this.state;
	// 	const val = term ? term.value.split('_') : '';
	// 	const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];
	// 	const values = value
	// 		? value
	// 		: moment(props.values.invoiceDate, 'DD-MM-YYYY').toDate();
	// 	if (temp && values) {
	// 		const date = moment(values)
	// 			.add(temp - 1, 'days')
	// 			.format('DD-MM-YYYY');
	// 		props.setFieldValue('invoiceDueDate', date, true);
	// 	}
	// };

	setExchange = (value) => {
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === value;
		});
		if(result &&result[0]&&  result[0].exchangeRate)
		this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);
		};

	setCurrency = (value) => {
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === value;
		});
		
	    this.formRef.current.setFieldValue('curreancyname', result[0].currencyName, true);
	};
	updateAmount = (data, props) => {
		const { vat_list , excise_list} = this.props;
		const { discountPercentage, discountAmount } = this.state;
		let total_net = 0;
		let total_excise = 0;
		let total = 0;
		let total_vat = 0;
		let net_value = 0; 
		let discount_total = 0;
		data.map((obj) => {
			const index =
				obj.vatCategoryId !== ''
					? vat_list.findIndex((item) => item.id === +obj.vatCategoryId)
					: '';
			const vat = index !== '' ? vat_list[`${index}`].vat : 0;

			//Exclusive case
			if(this.state.taxType === false){
				if (obj.discountType === 'PERCENTAGE') {	
					 net_value =
						((+obj.unitPrice -
							(+((obj.unitPrice * obj.discount)) / 100)) * obj.quantity);
					var discount =  (obj.unitPrice* obj.quantity) - net_value
				if(obj.exciseTaxId !=  0){
					if(obj.exciseTaxId === 1){
						const value = +(net_value) / 2 ;
							net_value = parseFloat(net_value) + parseFloat(value) ;
							obj.exciseAmount = parseFloat(value);
						}else if (obj.exciseTaxId === 2){
							const value = net_value;
							net_value = parseFloat(net_value) +  parseFloat(value) ;
							obj.exciseAmount = parseFloat(value);
						}
					
				}
				else{
					obj.exciseAmount = 0
				}
					var vat_amount =
					((+net_value  * vat ) / 100);
				}else{
					 net_value =
						((obj.unitPrice * obj.quantity) )
					var discount =  (obj.unitPrice* obj.quantity) - net_value
						if(obj.exciseTaxId !=  0){
							if(obj.exciseTaxId === 1){
								const value = +(net_value) / 2 ;
									net_value = parseFloat(net_value) + parseFloat(value) ;
									obj.exciseAmount = parseFloat(value);
								}else if (obj.exciseTaxId === 2){
									const value = net_value;
									net_value = parseFloat(net_value) +  parseFloat(value) ;
									obj.exciseAmount = parseFloat(value);
								}
								
						}
						else{
							obj.exciseAmount = 0
						}
						var vat_amount =
						((+net_value  * vat ) / 100);
			}

			}
			//Inclusive case
			else
			{			
				if (obj.discountType === 'PERCENTAGE') {	

					//net value after removing discount
					 net_value =
					((+obj.unitPrice -
						(+((obj.unitPrice * obj.discount)) / 100)) * obj.quantity);

				//discount amount
				var discount =  (obj.unitPrice* obj.quantity) - net_value

				//vat amount
				var vat_amount =
				(+net_value  * (vat/ (100 + vat)*100)) / 100; 

				//net value after removing vat for inclusive
				net_value = net_value - vat_amount

				//excise calculation
				if(obj.exciseTaxId !=  0){
				if(obj.exciseTaxId === 1){
					const value = net_value / 3
					net_value = net_value 
					obj.exciseAmount = parseFloat(value);
					}
				else if (obj.exciseTaxId === 2){
					const value = net_value / 2
					obj.exciseAmount = parseFloat(value);
				net_value = net_value}
			
						}
						else{
							obj.exciseAmount = 0
						}
					}

				else // fixed discount
						{
				//net value after removing discount
				 net_value =
				((obj.unitPrice * obj.quantity))


				//discount amount
				var discount =  (obj.unitPrice * obj.quantity) - net_value
						
				//vat amount
				var vat_amount =
				(+net_value  * (vat/ (100 + vat)*100)) / 100; ;

				//net value after removing vat for inclusive
				net_value = net_value - vat_amount

				//excise calculation
				if(obj.exciseTaxId !=  0){
					if(obj.exciseTaxId === 1){
						const value = net_value / 3
						net_value = net_value 
						obj.exciseAmount = parseFloat(value);
						}
					else if (obj.exciseTaxId === 2){
						const value = net_value / 2
						obj.exciseAmount = parseFloat(value);
					net_value = net_value}
				
							}
							else{
								obj.exciseAmount = 0
							}
					}

			}
			
			
			obj.vatAmount = vat_amount
			obj.subTotal =
			net_value && obj.vatCategoryId ? parseFloat(net_value) + parseFloat(vat_amount) : 0;

			discount_total = +discount_total +discount
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
						total_net:  total_net -total_excise,
						totalVatAmount: total_vat,
						discount:  discount_total ? discount_total : 0,
						totalAmount:  total ,
						total_excise: total_excise
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
			reader.onloadend = () => {};
			reader.readAsDataURL(file);
			props.setFieldValue('attachmentFile', file, true);
		}
	};

	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		const {
			contact_po_number,
			currency,
			rfqExpiryDate,
			rfqReceiveDate,
			receiptNumber,
			supplierId,
			project,
			rfq_number,
			notes,
			placeOfSupplyId
		} = data;
		const { term } = this.state;

		let formData = new FormData();
		formData.append('taxType', this.state.taxType)
		formData.append(
			'rfqNumber',
			rfq_number !== null ? this.state.prefix + rfq_number : '',
		);
		formData.append('rfqReceiveDate', rfqReceiveDate ? rfqReceiveDate : '');
		formData.append(
			'rfqExpiryDate',
			rfqExpiryDate ? rfqExpiryDate : '',
		);
		formData.append(
			'receiptNumber',
			receiptNumber !== null ? receiptNumber : '',
		);
		formData.append('notes', notes ? notes : '');
		formData.append('type', 3);
		formData.append('totalExciseAmount', this.state.initValue.total_excise);
		formData.append('exciseType', this.state.checked);
		if (placeOfSupplyId ) {
			formData.append('placeOfSupplyId', placeOfSupplyId.value ?placeOfSupplyId.value:placeOfSupplyId);
		}
		formData.append('lineItemsString', JSON.stringify(this.state.data));
		formData.append('totalVatAmount', this.state.initValue.totalVatAmount);
		formData.append('totalAmount', this.state.initValue.totalAmount);
		if (supplierId && supplierId.value) {
			formData.append('supplierId', supplierId.value);
		}
		if (this.uploadFile && this.uploadFile.files && this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		if (currency !== null && currency) {
			formData.append('currencyCode', this.state.supplier_currency);
		}
		formData.append('receiptAttachmentDescription' , data.receiptAttachmentDescription ? data.receiptAttachmentDescription : '');
		this.setState({ loading:true, disableLeavePage:true, loadingMsg:"Creating Request For Quotation..."});
		this.props.requestForQuotationCreateAction
			.createRFQ(formData)
			.then((res) => {
				this.setState({ disabled: false });
				// this.setState({ loading:false});
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Request For Quotation Created Successfully.',
				);
				if (this.state.createMore) {
					this.setState(
						{
							createMore: false,
							selectedContact: '',
							term: '',
							exchangeRate:'',
							data: [
								{
									id: 0,
									description: '',
									quantity: 1,
									unitPrice: '',
									vatCategoryId: '',
									exciseTaxId:'',
									discountType: 'FIXED',
									exciseAmount:'',
									discount: 0,
									subTotal: 0,
									vatAmount:0,
									productId: '',
									isExciseTaxExclusive: '',
									unitType:'',
									unitTypeId:''
								},
							],
							initValue: {
								...this.state.initValue,
								...{
									total_net: 0,
									invoiceVATAmount: 0,
									totalVatAmount: 0,
									totalAmount: 0,
									discountType: '',
									discount: 0,
									discountPercentage: '',
								},
							},
						},
						() => {
							resetForm(this.state.initValue);
							this.setState({data: [
								{
									id: 0,
									description: '',
									quantity: 1,
									unitPrice: '',
									vatCategoryId: '',
									exciseTaxId:'',
									discountType: 'FIXED',
									exciseAmount:'',
									discount: 0,
									subTotal: 0,
									vatAmount:0,
									productId: '',
									isExciseTaxExclusive: '',
									unitType:'',
									unitTypeId:''
								},
							],
						loading:false
						})
							this.getInvoiceNo();
							if(	this.formRef.current && this.state.data)
							this.formRef.current.setFieldValue(
								'lineItemsString',
								this.state.data,
								false,
							);
						},
					);
				} else {
					this.props.history.push('/admin/expense/request-for-quotation');
					this.setState({ loading:false,});
				
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Request For Quotation Created Unsuccessfully.',
				);
			});
	};
	openInvoiceNumberModel = (props) => {
		this.setState({ openInvoiceNumberModel : true });
	};

	openSupplierModal = (e) => {
		this.setState({ openSupplierModal: true });
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

		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === data.currencyCode;
		});
		
		this.setState({
			supplier_currency: data.currencyCode,
			supplier_currency_des: result[0]  && result[0].currencyName ? result[0].currencyName:"AED",
			supplier_currency_symbol:data.currencyIso ?data.currencyIso:"AED",
			customer_taxTreatment_des:data.taxTreatment?data.taxTreatment:""
		});

		this.formRef.current.setFieldValue('contactId', option, true);
		this.formRef.current.setFieldValue('supplierId', option, true);

		if(result[0] && result[0].currencyCode)
		this.formRef.current.setFieldValue('currency',result[0].currencyCode, true);

		this.formRef.current.setFieldValue('taxTreatmentid', data.taxTreatmentId, true);

		if( result[0] &&  result[0].exchangeRate)
		this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);
	};

	closeSupplierModal = (res) => {
		if (res) {
			this.props.requestForQuotationAction.getSupplierList(this.state.contactType);
			this.getInvoiceNo();
		}
		this.setState({ openSupplierModal: false });
	};

	closeProductModal = (res) => {
		this.setState({ openProductModal: false });
	};
	closeInvoiceNumberModel = (res) => {
		this.setState({ openInvoiceNumberModel: false });
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
	getCurrentProduct = () => {
		this.props.requestForQuotationAction.getProductList().then((res) => {
			let newData=[]
				const data = this.state.data;
				newData = data.filter((obj) => obj.productId !== "");
				// props.setFieldValue('lineItemsString', newData, true);
				// this.updateAmount(newData, props);
			this.setState(
				{
					data: newData.concat({
						id: this.state.idCount + 1,
							description: res.data[0].description,
							quantity: 1,
							unitPrice: res.data[0].unitPrice,
							vatCategoryId: res.data[0].vatCategoryId,
							exciseTaxId: res.data[0].exciseTaxId,
							subTotal: res.data[0].unitPrice,
							productId: res.data[0].id,
							unitType:res.data[0].unitType,
							unitTypeId:res.data[0].unitTypeId,
							discount:0,
							vatAmount:res.data[0].vatAmount ?res.data[0].vatAmount:0,
							discountType: res.data[0].discountType,
						}),
					idCount: this.state.idCount + 1,
					
				},
				() => {
					const values = {
						values: this.state.initValue,
					};
					this.updateAmount(this.state.data, values);
				},
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.unitPrice`,
				res.data[0].unitPrice,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.unitType`,
				res.data[0].unitType,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.quantity`,
				1,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.vatCategoryId`,
				res.data[0].vatCategoryId,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.exciseTaxId`,
				1,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.productId`,
				res.data[0].id,
				true,
			);
		});
	};
	getCurrentNumber = (data) => {
		this.getInvoiceNo();
	};

	getInvoiceNo = () => {
		this.props.requestForQuotationCreateAction.getInvoiceNo().then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{
							rfq_number: res.data,
						},
					},
				});
				if( res &&  res.data &&this.formRef.current)
				this.formRef.current.setFieldValue('rfq_number', res.data, true,this.validationCheck(res.data));
			}
		});
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 11,
			name: value,
		};
		this.props.requestForQuotationCreateAction
			.checkValidation(data)
			.then((response) => {
				if (response.data === 'RFQ Number Already Exists') {
					this.setState(
						{
							exist: true,
						},
						() => {
							console.log(this.state.exist);
						},
					);
				} else {
					this.setState({
						exist: false,
					});
				}
			});
	};

	getCurrency = (opt) => {
		let supplier_currencyCode = 0;

		this.props.supplier_list.map(item => {
			if(item.label.contactId == opt) {
				this.setState({
					supplier_currency: item.label.currency.currencyCode,
					supplier_currency_des: item.label.currency.currencyName,
					supplier_currency_symbol: item.label.currency.currencyIsoCode
				});

				supplier_currencyCode = item.label.currency.currencyCode;
			}
		})

		return supplier_currencyCode;
	}
	getTaxTreatment= (opt) => {
		
		let customer_taxTreatmentId = 0;
		let customer_item_taxTreatment = ''
		this.props.supplier_list.map(item => {
			if(item.label.contactId == opt) {
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
	render() {
		strings.setLanguage(this.state.language);
		const { data, discountOptions, initValue, prefix,tax_treatment_list, param,loading,loadingMsg,data1 } = this.state;

		const {
			currency_list,
			supplier_list,
			universal_currency_list,
			currency_convert_list,
		} = this.props;

		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})
		this.handleChanger=(event)	=>{

		}
		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
			<div>
			<div className="create-supplier-invoice-screen">
				<div className=" fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<img
													alt="invoiceimage"
													src={invoiceimage}
													style={{ width: '40px' }}
												/>
												<span className="ml-2">{strings.CreateRequestForQuotation}</span>
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
												validate={(values) => 
													{
													let errors = {};
													if (this.state.exist === true) {
														errors.rfq_number =
															'RFQ number already exists';
													}
													// if(this.state.customer_taxTreatment_des=="VAT REGISTERED" 
													// ||this.state.customer_taxTreatment_des=="VAT REGISTERED DESIGNATED ZONE" 
													// ||this.state.customer_taxTreatment_des=="GCC VAT REGISTERED" )
													if(this.state.customer_taxTreatment_des!="NON GCC")
													{
														if (!values.placeOfSupplyId) 
															errors.placeOfSupplyId ='Place of supply is required';
														if (values.placeOfSupplyId && (values.placeOfSupplyId=="" || (values.placeOfSupplyId.label && values.placeOfSupplyId.label === "Select Place of Supply"))) 
															errors.placeOfSupplyId ='Place of supply is required';
													}
													// if(this.state.customer_taxTreatment_des!="Non GCC")
													// 	{
													// 	if (values.placeOfSupplyId && values.placeOfSupplyId.label && values.placeOfSupplyId.label === "Select Place of Supply") {
													// 		errors.placeOfSupplyId = 'Place of supply is required';
													// 	}}
													if (values.rfq_number==='') {
														errors.rfq_number = 'RFQ number is required';
													}
													if(values.rfqReceiveDate && values.rfqExpiryDate && (values.rfqReceiveDate > values.rfqExpiryDate)){
														errors.rfqExpiryDate='Expiry date should be later than the issue date';
														errors.rfqReceiveDate='Issue date should be earlier than the expiration date';
													}
													return errors;
												}}
												validationSchema={Yup.object().shape(
													{
													rfq_number: Yup.string().required(
														'Invoice number is required',
													),
													supplierId: Yup.string().required(
														'Supplier is required',
													),
													// placeOfSupplyId: Yup.string().required(
													// 	'Place of Supply is required'
													// ),
													
													rfqReceiveDate: Yup.string().required(
														'Issue date is required',
													),
													rfqExpiryDate: Yup.string().required(
														'Expiry date is required'
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
											
													lineItemsString: Yup.array()
														.required(
															'Atleast one invoice sub detail is mandatory',
														)
														.of(
															Yup.object().shape({
																quantity: Yup.string()
																	.required('Value is required')
																	.test(
																		'quantity',
																		'Quantity should be greater than 0',
																		(value) => {
																			if (value > 0) {
																				return true;
																			} else {
																				return false;
																			}
																		},
																	),
																unitPrice: Yup.string()
																	.required('Value is required')
																	.test(
																		'Unit Price',
																		'Unit Price Should be Greater than 1',
																		(value) => {
																			if (value > 0) {
																				return true;
																			} else {
																				return false;
																			}
																		},
																	),
																vatCategoryId: Yup.string().required(
																	'VAT is required',
																),
																productId: Yup.string().required(
																	'Product is required',
																),
															}),
														),
												}
												)
												
											}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>
														<Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="rfq_number">
																		<span className="text-danger">* </span>
																		{strings.RFQNUMBER} 
																	</Label>
																	<Input
																		type="text"
																		maxLength="50"
																		id="rfq_number"
																		name="rfq_number"
																		placeholder={strings.InvoiceNumber}
																		value={props.values.rfq_number}
																		onBlur={props.handleBlur('rfq_number')}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExInvNum.test(
																					option.target.value,
																				)
																			) {
																			props.handleChange('rfq_number')(
																				option,
																			);
																		}
																			this.validationCheck(option.target.value);
																		}}
																		className={
																			props.errors.rfq_number &&
																			props.touched.rfq_number
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.rfq_number &&
																		props.touched.rfq_number && (
																			<div className="invalid-feedback">
																				{props.errors.rfq_number}
																			</div>
																		)}
																</FormGroup>
															</Col>
															</Row>
															<Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="supplierId">
																		<span className="text-danger">* </span>
																		{strings.SupplierName}
																	</Label>
																	<Select
																		id="supplierId"
																		name="supplierId"
																		placeholder={strings.Select+strings.SupplierName}
																		options={
																			tmpSupplier_list
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						tmpSupplier_list,
																						'Supplier Name',
																				  )
																				: []
																		}
																		value={ props.values.supplierId }
																		// onChange={(option) => {
																		// 	if (option && option.value) {
																		// 		props.handleChange('supplierId')(option);
																		// 	} else {

																		// 		props.handleChange('supplierId')('');
																		// 	}
																		// }}
																		onChange={(option) => {
																			if (option && option.value) {
																				this.formRef.current.setFieldValue('currency', this.getCurrency(option.value), true);
																				this.formRef.current.setFieldValue('taxTreatmentid', this.getTaxTreatment(option.value), true);
																				this.setExchange( this.getCurrency(option.value) );
																				props.handleChange('supplierId')(option);
																			} else {

																				props.handleChange('supplierId')('');
																			}
																		}}
																		className={
																			props.errors.supplierId &&
																			props.touched.supplierId
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.supplierId &&
																		props.touched.supplierId && (
																			<div className="invalid-feedback">
																				{props.errors.supplierId}
																			</div>
																		)}
																</FormGroup>
															</Col>
														
															<Col>
															<Label
																	htmlFor="contactId"
																	style={{ display: 'block' }}
																>
																	{strings.AddNewSupplier} 
																</Label>
															<Button
                                                                color="primary"
                                                                className="btn-square"
                                                                // style={{ marginBottom: '40px' }}
                                                                onClick={() =>
																	this.openSupplierModal()
																	//  this.props.history.push(`/admin/payroll/employee/create`,{goto:"Expense"})
																// this.props.history.push(`/admin/master/contact/create`,{gotoParentURL:"/admin/expense/request-for-quotation/create"})
																	}

                                                            >
                                                                <i className="fas fa-plus mr-1" />
                                         {strings.AddASupplier}
									</Button>
									</Col>
									{this.state.customer_taxTreatment_des ? 
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="taxTreatmentid">
																	{strings.TaxTreatment}
																	</Label>
																	<Input
																	disabled
																		styles={customStyles}
																		id="taxTreatmentid"
																		name="taxTreatmentid"
																		value={
																		this.state.customer_taxTreatment_des
																	 	
																		}
																		className={
																			props.errors.taxTreatmentid &&
																			props.touched.taxTreatmentid
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) => {
																		props.handleChange('taxTreatmentid')(option);
																		
																	    }}

																	/>
																	{props.errors.taxTreatmentid &&
																		props.touched.taxTreatmentid && (
																			<div className="invalid-feedback">
																				{props.errors.taxTreatmentid}
																			</div>
																		)}
																</FormGroup>
															</Col>: ''}
															<Col lg={3}>
															{this.state.customer_taxTreatment_des!="NON GCC" &&(		
																	<FormGroup className="mb-3">
																	<Label htmlFor="placeOfSupplyId">
																		{/* <span className="text-danger">* </span> */}
																		{/* {this.state.customer_taxTreatment_des &&
																		(this.state.customer_taxTreatment_des=="VAT REGISTERED" 
																		||this.state.customer_taxTreatment_des=="VAT REGISTERED DESIGNATED ZONE" 
																		||this.state.customer_taxTreatment_des=="GCC VAT REGISTERED") && ( */}
																			<span className="text-danger">* </span>
																		{/* )} */}
																		{strings.PlaceofSupply}
																	</Label>
																	<Select
																		id="placeOfSupplyId"
																		name="placeOfSupplyId"
																		placeholder={strings.Select+strings.PlaceofSupply}
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
																		// value={props.values.placeOfSupplyId}
																		value={
																			this.placelist &&
																			selectOptionsFactory.renderOptions(
																				'label',
																				'value',
																				this.placelist,
																				'Place of Supply',
																		  ).find(
																					(option) =>
																					option.value ==
																					(this.state.parentId ? this.state.placeOfSupplyId:props.values.placeOfSupplyId.toString())
																				)
																			}						
																		className={
																			props.errors.placeOfSupplyId &&
																			props.touched.placeOfSupplyId
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) =>
																			props.handleChange('placeOfSupplyId')(
																				option,
																			)
																		}
																	/>
																	{props.errors.placeOfSupplyId &&
																		props.touched.placeOfSupplyId && (
																			<div className="invalid-feedback">
																				{props.errors.placeOfSupplyId}
																			</div>
																		)}
																</FormGroup>
																)}
															</Col>
														</Row>
													
														<Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="date">
																		<span className="text-danger">* </span>
																		{strings.IssueDate}
																	</Label>
																	<DatePicker
																		id="date"
																		name="rfqReceiveDate"
																		className={`form-control ${
																			props.errors.rfqReceiveDate &&
																			props.touched.rfqReceiveDate
																				? 'is-invalid'
																				: ''
																		}`}
																		placeholderText={strings.IssueDate}
																		selected={props.values.rfqReceiveDate ?new Date(props.values.rfqReceiveDate):props.values.rfqReceiveDate} 
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd-MM-yyyy"
																		onChange={(value) => {
																			props.handleChange('rfqReceiveDate')(value);
																		
																		}}
																	/>
																	{props.errors.rfqReceiveDate &&
																		props.touched.rfqReceiveDate && (
																			<div className="invalid-feedback">
																				{props.errors.rfqReceiveDate.includes("nullable()") ? "Issue date is required" :props.errors.rfqReceiveDate}		

																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="due_date">
																	<span className="text-danger">* </span>
																	{strings.ExpiryDate}
																	</Label>
																	<DatePicker
																		id="date"
																		name="rfqExpiryDate"
																		className={`form-control ${
																			props.errors.rfqExpiryDate &&
																			props.touched.rfqExpiryDate
																				? 'is-invalid'
																				: ''
																		}`}
																		placeholderText={strings.ExpiryDate}
																		selected={props.values.rfqExpiryDate ?new Date(props.values.rfqExpiryDate):props.values.rfqExpiryDate} 
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd-MM-yyyy"
																		minDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('rfqExpiryDate')(value);
																		}}
																	/>
																	{props.errors.rfqExpiryDate &&
																		props.touched.rfqExpiryDate && (
																			<div className="invalid-feedback">
																				{props.errors.rfqExpiryDate.includes("nullable()") ? "Expiry date is required" :props.errors.rfqExpiryDate}
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
																	placeholder={strings.Select+strings.Currency}
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
																		id="currency"
																		name="currency"
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
																						this.state.supplier_currency,
																				)
																		}
																		onChange={(option) => {
																			props.handleChange('currency')(option);
																			this.setExchange(option.value);
																			this.setCurrency(option.value)
																		   }}
																		className={`${
																			props.errors.currency &&
																			props.touched.currency
																				? 'is-invalid'
																				: ''
																		}`}
																	/>
																	{props.errors.currency &&
																		props.touched.currency && (
																			<div className="invalid-feedback">
																				{props.errors.currency}
																			</div>
																		)}
																</FormGroup>
															</Col>
														</Row>
														<hr />
														<Row>
															<Col lg={8} className="mb-3">
																{/* <Button
																	color="primary"
																	className={`btn-square mr-3 ${
																		this.checkedRow() ? `disabled-cursor` : ``
																	} `}
																	onClick={this.addRow}
																	title={
																		this.checkedRow()
																			? `Please add detail to add more`
																			: ''
																	}
																	disabled={this.checkedRow() ? true : false}
																>
																	<i className="fa fa-plus"></i> {strings.Addmore} 
																</Button> */}
																<Button
																	color="primary"
																	className= "btn-square mr-3"
																	onClick={(e, props) => {
																		this.openProductModal()
																		// this.props.history.push(`/admin/master/product/create`,{gotoParentURL:"/admin/expense/request-for-quotation/create"})
																		}}
																>
																	<i className="fa fa-plus"></i> {strings.Addproduct} 
																</Button>
													           </Col>
															   <Col  >
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
															<Col lg={12}>
																{props.errors.lineItemsString &&
																	props.errors.lineItemsString === 'string' && (
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
																<BootstrapTable
																	options={this.options}
																	data={data}
																	version="4"
																	hover
																	keyField="id"
																	className="invoice-create-table"
																>
																	<TableHeaderColumn
																		width="4%"
																		dataAlign="center"
																		dataFormat={(cell, rows) =>
																			this.renderActions(cell, rows, props)
																		}
																	></TableHeaderColumn>
																	<TableHeaderColumn
																	width="17%"
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
																			this.renderDescription(cell, rows, props)
																		}
																	>
																		{strings.DESCRIPTION}
																	</TableHeaderColumn> */}
																	<TableHeaderColumn
																		dataField="quantity"
																		width="13%"
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
																 className="fa fa-question-circle"
															 /> <UncontrolledTooltip
																 placement="right"
																 target="unitTooltip"
															 >
																Units / Measurements</UncontrolledTooltip>
																</TableHeaderColumn> */}
																<TableHeaderColumn
																		dataField="unitPrice"
																		dataFormat={(cell, rows) =>
																			this.renderUnitPrice(cell, rows, props)
																		}
																	>
																		{strings.UNITPRICE} 
																		<i
																			id="UnitPriceToolTip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="UnitPriceToolTip"
																		>
																			Unit Price – Price of a single product or
																			service
																		</UncontrolledTooltip>
																	</TableHeaderColumn>
																	{initValue.total_excise != 0 &&
																	<TableHeaderColumn
																	width="10%"
																		dataField="exciseTaxId"
																		dataFormat={(cell, rows) =>
																			this.renderExcise(cell, rows, props)
																		}
																	>
																	Excise
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
																	{this.state.discountEnabled == true &&
																	<TableHeaderColumn
																	width="12%"
																	dataField="discount"
																	dataFormat={(cell, rows) =>
																		this.renderDiscount(cell, rows, props)
																	}
																	>
																{strings.DisCount}
																</TableHeaderColumn>}
																	<TableHeaderColumn
																	width="13%"
																		dataField="vat"
																		dataFormat={(cell, rows) =>
																			this.renderVat(cell, rows, props)
																		}
																	>
																	{strings.VAT}
																	</TableHeaderColumn>
																	<TableHeaderColumn
																	width="10%"
																	dataField="sub_total"
																	dataFormat={this.renderVatAmount}
																	className="text-right"
																	columnClassName="text-right"
																	formatExtraData={universal_currency_list}
																	>
																	{strings.VATAMOUNT}
																	</TableHeaderColumn>
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
														{/* <Row className="ml-4 ">
														<Col className=" ml-4">
															<FormGroup className='pull-right'>
															<Input
																type="checkbox"
																id="discountEnabled"
																checked={this.state.discountEnabled}
																onChange={(option) => {
																	if(initValue.discount > 0){
																		this.setState({ discountEnabled: true })
																	}else{
																	this.setState({ discountEnabled: !this.state.discountEnabled })}
																}}
															/>
															<Label>Apply Line Item Discount</Label>
															</FormGroup>
														</Col>
													</Row> */}
													
														{this.state.data.length > 0 ? (
															<Row>
																<Col lg={8}>
																<FormGroup className="py-2">
																		<Label htmlFor="notes">{strings.TermsAndConditions}</Label><br/>
																		<TextareaAutosize
																			type="textarea"
																			style={{width: "700px"}}
																			className="textarea form-control"
																			maxLength="255"
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
																					className={props.errors.receiptNumber && props.touched.receiptNumber ? "is-invalid" : ""}
																				/>
																				{props.errors.receiptNumber && props.touched.receiptNumber && (
																					<div className="invalid-feedback">{props.errors.receiptNumber}</div>
																				)}
																			</FormGroup>
																		</Col>
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
																		</Label><br/>
																		<TextareaAutosize
																			type="textarea"
																			className="textarea form-control"
																			maxLength="255"
																			style={{width: "700px"}}
																			name="receiptAttachmentDescription"
																			id="receiptAttachmentDescription"
																			rows="2"
																			placeholder={strings.ReceiptAttachmentDescription}
																			onChange={(option) =>{
																				props.handleChange(
																					'receiptAttachmentDescription',
																				)(option)
																			
																				this.handleChanger(option)
																			}
																			}
																			value={
																				this.state.receiptAttachmentDescription
																			}
																		/>
																	</FormGroup>
														</Col>
																		<Col lg={4}>
																
																	<div className="">
																	{initValue.total_excise > 0 ?	
																<div className="total-item p-2" >
																<Row>
																	<Col lg={6}>
																		<h5 className="mb-0 text-right">
																	{strings.Total_Excise}
																		</h5>
																	</Col>
																	<Col lg={6} className="text-right">
																		<label className="mb-0">

																			{this.state.supplier_currency_symbol} &nbsp;
																			{/* {this.rendertotalexcise()} */}
																			{initValue.total_excise.toLocaleString(navigator.language, {minimumFractionDigits: 2,maximumFractionDigits: 2})}
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
																						{/* {universal_currency_list[0] && (
																							<Currency
																								value={initValue.total_net.toFixed(
																									2,
																								)}
																								currencySymbol={
																									universal_currency_list[0]
																										? universal_currency_list[0]
																												.currencyIsoCode
																										: 'USD'
																								}
																							/>
																						)} */}
																						{this.state.customer_currency_symbol} &nbsp;
																						{initValue.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 })}
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
																						{/* {universal_currency_list[0] && (
																							<Currency
																								value={initValue.total_net.toFixed(
																									2,
																								)}
																								currencySymbol={
																									universal_currency_list[0]
																										? universal_currency_list[0]
																												.currencyIsoCode
																										: 'USD'
																								}
																							/>
																						)} */}
																						{this.state.supplier_currency_symbol} &nbsp;
																						{initValue.total_net.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 })}
																					</label>
																				</Col>
																			</Row>
																		</div>
																		<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																					{strings.TotalVat} 
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">
																						{/* {universal_currency_list[0] && (
																							<Currency
																								value={initValue.invoiceVATAmount.toFixed(
																									2,
																								)}
																								currencySymbol={
																									universal_currency_list[0]
																										? universal_currency_list[0]
																												.currencyIsoCode
																										: 'USD'
																								}
																							/>
																						)} */}
																						{this.state.supplier_currency_symbol} &nbsp;
																						{initValue.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 })}
																					</label>
																				</Col>
																			</Row>
																		</div>
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
																								value={initValue.totalAmount.toFixed(
																									2,
																								)}
																								currencySymbol={
																									universal_currency_list[0]
																										? universal_currency_list[0]
																												.currencyIsoCode
																										: 'USD'
																								}
																							/>
																						)} */}
																						{this.state.supplier_currency_symbol} &nbsp;
																						{initValue.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 })}
																					</label>
																				</Col>
																			</Row>
																		</div>
																	</div>
																</Col>
															
															</Row>
														) : null}
														<Row>
															<Col lg={12} className="mt-5">
																<FormGroup className="text-right">
																<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			if(this.state.data.length === 1)
																			{
																				//	added validation popup	msg
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();
																			}
																			else
																			{ 
																				let newData=[]
																				const data = this.state.data;
																				newData = data.filter((obj) => obj.productId !== "");
																				props.setFieldValue('lineItemsString', newData, true);
																				this.updateAmount(newData, props);
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
																		{	
																			this.state.disabled
																			? 'Creating...'
																			: strings.Create 
																		}
																	</Button>
																	{this.props.location.state &&	this.props.location.state.parentId ?"":<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			if(this.state.data.length === 1)
																			{
																				//	added validation popup	msg
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();
																			}
																			else
																			{ let newData=[]
																			const data = this.state.data;
																			newData = data.filter((obj) => obj.productId !== "");
																			props.setFieldValue('lineItemsString', newData, true);
																			this.updateAmount(newData, props);
																			}
																			this.setState(
																				{ createMore: true },
																				() => {
																					props.handleSubmit();

																				},
																			);
																		}}
																	>
																		<i className="fa fa-repeat mr-1"></i>
																		{this.state.disabled
																			? 'Creating...'
																			: strings.CreateandMore }
																	</Button>}
																	<Button
																		type="button"
																		color="secondary"
																		className="btn-square"
																		onClick={() => {
																			this.props.history.push(
																				'/admin/expense/request-for-quotation',
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
				<SupplierModal
					openSupplierModal={this.state.openSupplierModal}
					closeSupplierModal={(e) => {
						this.closeSupplierModal(e);
					}}
					getCurrentUser={(e) =>
						{		
							this.props.requestForQuotationAction.getSupplierList(this.state.contactType);
							this.getCurrentUser(e);
						}
						}
					createSupplier={this.props.requestForQuotationAction.createSupplier}
					getStateList={this.props.requestForQuotationAction.getStateList}
					currency_list={this.props.currency_convert_list}
					country_list={this.props.country_list}
				/>
				<ProductModal
					openProductModal={this.state.openProductModal}
					closeProductModal={(e) => {
						this.closeProductModal(e);
					}}
					getCurrentProduct={(e) =>{ 
						this.props.requestForQuotationAction.getProductList();
						this.getCurrentProduct(e);
					}}
					createProduct={this.props.ProductActions.createAndSaveProduct}
					vat_list={this.props.vat_list}
					product_category_list={this.props.product_category_list}
					salesCategory={this.state.salesCategory}
					purchaseCategory={this.state.purchaseCategory}
				/>
					{/* <InvoiceNumberModel
					openInvoiceNumberModel={this.state.openInvoiceNumberModel}
					closeInvoiceNumberModel={(e) => {
						this.closeInvoiceNumberModel(e);
					}}
					getCurrentNumber={(e) => this.getCurrentNumber(e)}
					prefix ={this.state.prefixData}
					updatePrefix={this.props.customerInvoiceActions.updateInvoicePrefix}
					
				/> */}
			</div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CreateRequestForQuotation);
