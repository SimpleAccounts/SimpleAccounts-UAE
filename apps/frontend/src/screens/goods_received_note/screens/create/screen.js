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
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { Formik, Field } from 'formik';
import { LeavePage, Loader } from 'components';
import * as Yup from 'yup';
import * as SupplierInvoiceCreateActions from './actions';
import * as GoodsReceivedNoteCreateAction from './actions'
import * as GoodsReceivedNoteAction from '../../actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions'
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import * as CustomerInvoiceActions from '../../../customer_invoice/actions';
import * as PurchaseOrderDetailsAction from '../../../purchase_order/screens/detail/actions'
import { SupplierModal } from '../../../supplier_invoice/sections/index';
import { ProductModal } from '../../../customer_invoice/sections';
import { TextareaAutosize } from '@material-ui/core';
import * as PurchaseOrderAction from '../../../purchase_order/actions'
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { optionFactory, selectCurrencyFactory, selectOptionsFactory } from 'utils';
import './style.scss';
import moment from 'moment';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		contact_list: state.goods_received_note.contact_list,
		currency_list: state.goods_received_note.currency_list,
		vat_list: state.goods_received_note.vat_list,
		product_list: state.goods_received_note.product_list,
		supplier_list: state.goods_received_note.supplier_list,
		country_list: state.goods_received_note.country_list,
		product_category_list: state.product.product_category_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.currencyConvert.currency_convert_list,
		po_list: state.goods_received_note.po_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		goodsReceivedNoteAction: bindActionCreators(
			GoodsReceivedNoteAction,
			dispatch,
		),
		supplierInvoiceActions : bindActionCreators(
			SupplierInvoiceActions,dispatch,
		),
		customerInvoiceActions: bindActionCreators(
			CustomerInvoiceActions,
			dispatch,
		),
		ProductActions: bindActionCreators(ProductActions, dispatch),
		supplierInvoiceCreateActions: bindActionCreators(
			SupplierInvoiceCreateActions,
			dispatch,
		),
		goodsReceivedNoteCreateAction: bindActionCreators(GoodsReceivedNoteCreateAction,dispatch),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		purchaseOrderDetailsAction: bindActionCreators(
            PurchaseOrderDetailsAction,
            dispatch,
        ),
		purchaseOrderAction: bindActionCreators(
            PurchaseOrderAction,
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

const invoiceimage = require('assets/images/invoice/invoice.png');

let strings = new LocalizedStrings(data);
class CreateGoodsReceivedNote extends React.Component {
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
						grnReceivedQuantity: "",
						vatCategoryId: '',
						exciseTaxId:'',
						exciseAmount:'',
						// discountType:'FIXED',
						// discount:0,
						subTotal: 0,
						vatAmount:0,
						productId: '',
						isExciseTaxExclusive:'',
						unitType:'',
						unitTypeId:''
				},
			],
			idCount: 0,
			initValue: {
				contact_po_number: '',
				currencyCode: '',
				grnReceiveDate: new Date(),
				rfqExpiryDate: new Date(),
				supplierId: '',
				placeOfSupplyId: '',
				project: '',
				exchangeRate:'',
				poNumber:'',
				lineItemsString: [
					{
						id: 0,
						description: '',
                        quantity: '',
                        poQuantity: '',
                        productId: '',
                        subTotal:0,
					
					},
				],
				grn_Number: '',
				total_net: 0,
				totalAmount: 0,			
				invoiceVATAmount: 0,
				term: '',
				grnRemarks: '',
				discount: 0,
				discountPercentage: 0,
				discountType: { value: 'FIXED', label: 'Fixed' },
			},
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
			// grnReceivedQuantityError:"Please Enter Quantity",
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
	renderPoQuantity = (cell, row, props) => {
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
						disabled
							type="number"
							min="0"
							maxLength="100"
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
							className={`form-control w-50${ 
							props.errors.lineItemsString &&
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
						<Input value={row['unitType'] }  disabled/> : ''}
						</div>
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
	renderGRNQuantity = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.grnReceivedQuantity`}
				render={({ field, form }) => (
					<div>
							<div className="input-group">
							<Input
							type="text"
							min="0"
							// type="number"
							maxLength="10"
							value={row['grnReceivedQuantity'] !== 0 ? row['grnReceivedQuantity'] : 0}
							onChange={(e) => {
								if (e.target.value === '' || this.regEx.test(e.target.value)) {
									this.selectItem(
										e.target.value,
										row,
										'grnReceivedQuantity',
										form,
										field,
										props,
									);
									let val=parseInt(e.target.value);
								
									// if( val<= 0)
									// {
									// 	this.setState({grnReceivedQuantityError:"Please Enter Quantity"});
									// }
									// else{
									// 	this.setState({grnReceivedQuantityError:""});
									// }
								}
							}}
							placeholder={strings.ReceivedQuantity}
							className={`form-control 
							w-50
            ${
							props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].grnReceivedQuantity &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].grnReceivedQuantity
								? 'is-invalid'
								: ''
						}`}
						/>
						 {row['productId'] != '' ? 
						<Input value={row['unitType'] }  disabled/> : ''}
						</div>
						{/* {props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].grnReceivedQuantity &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].grnReceivedQuantity && (
								<div className="invalid-feedback">
									{props.errors.lineItemsString[parseInt(idx, 10)].grnReceivedQuantity}
								</div>
							)} */}
								{/* <div  className="text-danger">
									{this.state.grnReceivedQuantityError}
								</div> */}
								{row['grnReceivedQuantity'] <= 0 && (
								<div  className="invalid-feedback">
									Please Enter Quantity
								</div>
								)
							}
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
					type="number"
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
				)}
			/>
		);
	};

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
		return row.subTotal === 0 ? this.state.supplier_currency_symbol +" "+ row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 }) : this.state.supplier_currency_symbol +" "+  row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 });
	};

	getParentGrnDetails=(parentId)=>{
		this.props.goodsReceivedNoteCreateAction
				.getGRNById(parentId)
				.then((res) => {
					if (res.status === 200) {
						this.getCompanyCurrency();
						this.purchaseCategory();
						this.setState(
							{
								current_grn_id: this.props.location.state.id,
								initValue: {
									grnReceiveDate: res.data.grnReceiveDate
										? moment(res.data.grnReceiveDate).format('DD-MM-YYYY')
										: '',
										grnReceiveDate1: res.data.grnReceiveDate
										? res.data.grnReceiveDate
										: '',
										supplierId: res.data.supplierId ? res.data.supplierId : '',
										grnNumber: res.data.grnNumber
										? res.data.grnNumber
										: '',
									totalVatAmount: res.data.totalVatAmount
										? res.data.totalVatAmount
										: 0,
										total_excise: res.data.totalExciseAmount ? res.data.totalExciseAmount : 0,
										totalAmount: res.data.totalAmount ? res.data.totalAmount : 0,
										total_net: 0,
									grnRemarks: res.data.grnRemarks ? res.data.grnRemarks : '',
									lineItemsString: res.data.poQuatationLineItemRequestModelList
										? res.data.poQuatationLineItemRequestModelList
										: [],
										supplierReferenceNumber: res.data.supplierReferenceNumber ?
										res.data.supplierReferenceNumber :'',
										poNumber: res.data.poNumber ? res.data.poNumber : '',
								
								},
								poNumber : res.data.poNumber ? res.data.poNumber : '',
								grnReceiveDateNotChanged: res.data.grnReceiveDate
										? moment(res.data.grnReceiveDate)
										: '',
								grnReceiveDate: res.data.grnReceiveDate
										? res.data.grnReceiveDate
										: '',
								data: res.data.poQuatationLineItemRequestModelList
									? res.data.poQuatationLineItemRequestModelList
									: [],
								selectedContact: res.data.supplierId ? res.data.supplierId : '',
							
								loading: false,
							},
							() => {
								if (this.state.data.length > 0) {
									
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
									this.formRef.current.setFieldValue('currency', this.getCurrency(res.data.supplierId), true);
									this.formRef.current.setFieldValue('grnRemarks',  res.data.grnRemarks, true);
								let po=	selectOptionsFactory.renderOptions('label','value',this.props.po_list,'PO Number', )
								                         	.find((option) => option.label == res.data.poNumber)
									this.formRef.current.setFieldValue('poNumber', po, true);
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

	componentDidMount = () => {
		this.props.goodsReceivedNoteAction.getVatList();

      // PO to GRN Shortcut
		if(this.props.location.state && this.props.location.state.poId)
		{
			this.props.goodsReceivedNoteAction.getPurchaseOrderListForDropdown();
			let option={value:this.props.location.state.poId,label:this.props.location.state.poNumber}
			this.getPoDetails(option, option.value, undefined)
		}
		this.getInitialData();
		if(this.props.location.state &&this.props.location.state.contactData)
				this.getCurrentUser(this.props.location.state.contactData);

		// make a duplicate		
		if(this.props.location.state && this.props.location.state.parentId )
				this.getParentGrnDetails(this.props.location.state.parentId);
	};

	getInitialData = () => {
		// this.props.goodsReceivedNoteAction.getVatList().then((res)=>{
		// 	if(res.status==200 && res.data)
		// 	 this.setState({vat_list:res.data})
		// });
		this.getInvoiceNo();
		this.props.goodsReceivedNoteAction.getSupplierList(this.state.contactType);
		this.props.goodsReceivedNoteAction.getPurchaseOrderListForDropdown();
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
		this.props.goodsReceivedNoteAction.getInvoicePrefix().then((response) => {
			this.setState({prefixData:response.data
		});
		});
		this.props.goodsReceivedNoteAction.getVatList();
		this.props.goodsReceivedNoteAction.getCountryList();
		this.props.goodsReceivedNoteAction.getProductList();
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
                    grnReceivedQuantity: "",
                    poQuantity:1,
					unitPrice: '',
					vatCategoryId: '',
					subTotal: 0,
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


    rfqValue = (e, row, name, form, field, props) => {
		const { rfq_list } = this.props;
		let data = this.state.data;
		const result = rfq_list.find((item) => item.id === parseInt(e));
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				console.log(result);
				obj['unitPrice'] = result.unitPrice;
				obj['vatCategoryId'] = result.vatCategoryId;
				obj['description'] = result.description;
				idx = index;
			}
			return obj;
		});

		this.updateAmount(data, props);
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
            name === 'poQuantity'||
			name === 'grnReceivedQuantity'
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
						styles={customStyles}
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
				obj['description'] = result.description;
				obj['exciseTaxId'] = result.exciseTaxId;
				obj['isExciseTaxExclusive'] = result.isExciseTaxExclusive;
				obj['unitType']=result.unitType;
				obj['unitTypeId']=result.unitTypeId;
				obj['grnReceivedQuantity']=1;
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
											quantity: '',
                                            grnReceivedQuantity: 1,
                                            poQuantity:'',
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
				// disabled={this.state.data.length === 1 ? true : false}
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
		let discount = 0;
		data.map((obj) => {
			const index =
				obj.vatCategoryId !== ''
					? vat_list.findIndex((item) => item.id === +obj.vatCategoryId)
					: '';
			const vat = index !== '' ? vat_list[`${index}`].vat : 0;

			//Excise calculation
			if(obj.exciseTaxId !=  0){
			if(obj.isExciseTaxExclusive === true){
				if(obj.exciseTaxId === 1){
				const value = +(obj.unitPrice) / 2 ;
					net_value = parseFloat(obj.unitPrice) + parseFloat(value) ;
					obj.exciseAmount = parseFloat(value) * obj.grnReceivedQuantity;
				}else if (obj.exciseTaxId === 2){
					const value = obj.unitPrice;
					net_value = parseFloat(obj.unitPrice) +  parseFloat(value) ;
					obj.exciseAmount = parseFloat(value) * obj.grnReceivedQuantity;
				}
				else{
					net_value = obj.unitPrice
				}
			}	else{
				if(obj.exciseTaxId === 1){
					const value = obj.unitPrice / 3
					obj.exciseAmount = parseFloat(value) * obj.grnReceivedQuantity;
				net_value = obj.unitPrice}
				else if (obj.exciseTaxId === 2){
					const value = obj.unitPrice / 2
					obj.exciseAmount = parseFloat(value) * obj.grnReceivedQuantity;
				net_value = obj.unitPrice}
				else{
					net_value = obj.unitPrice
				}
			}
		}else{
			net_value = obj.unitPrice;
			obj.exciseAmount = 0
		}
			//vat calculation
			if (obj.discountType === 'PERCENTAGE') {
				var val =
				((+net_value -
				 (+((net_value * obj.discount)) / 100)) *
					vat *
					obj.grnReceivedQuantity) /
				100;
				var val1 =
				((+net_value -
				 (+((net_value * obj.discount)) / 100)) * obj.grnReceivedQuantity ) ;
			} else if (obj.discountType === 'FIXED') {
				var val =
						 (net_value * obj.grnReceivedQuantity - obj.discount ) *
					(vat / 100);

					var val1 =
					((net_value * obj.grnReceivedQuantity )- obj.discount )

			} else {
				var val = (+net_value * vat * obj.grnReceivedQuantity) / 100;
				var val1 = net_value * obj.grnReceivedQuantity
			}
			console.log('value '+val)
			//discount calculation
			discount = +(discount +(net_value * obj.grnReceivedQuantity)) - parseFloat(val1)
			total_net = +(total_net + net_value * obj.grnReceivedQuantity);
			total_vat = +(total_vat + val);
			obj.vatAmount = val
			obj.subTotal =
			net_value && obj.vatCategoryId ? parseFloat(val1) + parseFloat(val) : 0;
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
						total_net: discount ? total_net - discount : total_net,
						totalVatAmount: total_vat,
						discount:  discount ? discount : 0,
						totalAmount: total_net > discount ? total - discount : total - discount,
						total_excise: total_excise
					},

				},
			},

		);
	};

	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		const {
			contact_po_number,
			currency,
			rfqExpiryDate,
			grnReceiveDate,
			supplierId,
			grn_Number,
			grnRemarks,
			supplierReferenceNumber,
			poNumber
		} = data;
		const { term } = this.state;

		let formData = new FormData();
		formData.append(
			'grnNumber',
			grn_Number !== null ? this.state.prefix + grn_Number : '',
		);
		formData.append('grnReceiveDate', grnReceiveDate ? grnReceiveDate : '');
		// formData.append(
		// 	'rfqExpiryDate',
		// 	rfqExpiryDate ? rfqExpiryDate : '',
		// );
		formData.append('grnRemarks', grnRemarks ? grnRemarks : '');
        formData.append('type', 5);
        formData.append('lineItemsString', JSON.stringify(this.state.data));
		formData.append('totalExciseAmount', this.state.initValue.total_excise);
        formData.append('totalVatAmount', this.state.initValue.totalVatAmount);
		formData.append('totalAmount', this.state.initValue.totalAmount);
		if (supplierId && supplierId.value) {
			formData.append('supplierId', supplierId.value);
		}
		if (this.uploadFile && this.uploadFile.files && this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		if (poNumber && poNumber.value) {
			formData.append('poId', poNumber.value);
		}
	
			formData.append('currencyCode', this.state.supplier_currency);

		formData.append('supplierReferenceNumber', supplierReferenceNumber ? supplierReferenceNumber : '');
		this.setState({ loading:true, disableLeavePage:true, loadingMsg:"Creating Goods Received Note..."});
		this.props.goodsReceivedNoteCreateAction
			.createGNR(formData)
			.then((res) => {
				this.setState({ disabled: false });
				// this.setState({ loading:false});
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Goods Received Note Created Successfully'
				);
				if (this.state.createMore) {
					resetForm(this.state.initValue);
					this.setState(
						{
							createMore: false,
							selectedContact: '',
							supplier_currency:'',
							term: '',
							data: [
								{
										id: 0,
										description: '',
										quantity: 1,
										unitPrice: '',
										grnReceivedQuantity: 1,
										vatCategoryId: '',
										exciseTaxId:'',
										exciseAmount:'',
										// discountType:'FIXED',
										// discount:0,
										subTotal: 0,
										vatAmount:0,
										productId: '',
										isExciseTaxExclusive:'',
										unitType:'',
										unitTypeId:''
								},
							],
							initValue: {
								...this.state.initValue,
								...{
									grnReceiveDate: new Date(),
			                    	rfqExpiryDate: new Date(),
									total_net: 0,
									invoiceVATAmount: 0,
									totalAmount: 0,
									discountType: '',
									discount: 0,
									currencyCode: '',
									discountPercentage: '',
									
								},
							},
						},
						() => {
							this.setState({data: [
								{
										id: 0,
										description: '',
										quantity: 1,
										unitPrice: '',
										grnReceivedQuantity: 1,
										vatCategoryId: '',
										exciseTaxId:'',
										exciseAmount:'',
										// discountType:'FIXED',
										// discount:0,
										subTotal: 0,
										vatAmount:0,
										productId: '',
										isExciseTaxExclusive:'',
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
					this.props.history.push('/admin/expense/goods-received-note');
					this.setState({ loading:false,});
				
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Goods Received Note Created Unsuccessfully',
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
			this.props.goodsReceivedNoteAction.getSupplierList(this.state.contactType);
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
		this.props.goodsReceivedNoteAction.getProductList().then((res) => {
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
                            grnReceivedQuantity: 1,
                            poQuantity:1,
							unitPrice: res.data[0].unitPrice,
							vatCategoryId: res.data[0].vatCategoryId,
						    exciseTaxId: res.data[0].exciseTaxId,
							subTotal: res.data[0].unitPrice,
							productId: res.data[0].id,
							discount:0,
							vatAmount:res.data[0].vatAmount ?res.data[0].vatAmount:0,
							discountType: res.data[0].discountType,
							unitType:res.data[0].unitType,
							unitTypeId:res.data[0].unitTypeId,
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
				`lineItemsString.${0}.grnReceivedQuantity`,
				1,
				true,
            );
            // this.formRef.current.setFieldValue(
			// 	`lineItemsString.${0}.poQuantity`,
			// 	1,
			// 	true,
			// );
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.vatCategoryId`,
				res.data[0].vatCategoryId,
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
		this.props.goodsReceivedNoteCreateAction.getInvoiceNo().then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{
							grn_Number: res.data,
						},
					},
				});
				if( res &&  res.data &&this.formRef.current)
			this.formRef.current.setFieldValue('grn_Number', res.data, true,this.validationCheck(res.data));
			}
		});
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 13,
			name: value,
		};
		this.props.goodsReceivedNoteCreateAction
			.checkValidation(data)
			.then((response) => {
				if (response.data === 'GRN Number Already Exists') {
					this.setState(
						{
							exist: true,
						},
						() => {
							
						},
					);
				} else {
					this.setState({
						exist: false,
					});
				}
			});
	};

    poValue = (e, row, name, form, field, props) => {
		const { po_list } = this.props;
		let data = this.state.data;
		const result = po_list.find((item) => item.id === parseInt(e));
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				console.log(result,'result');
				obj['unitPrice'] = result.unitPrice;
				obj['vatCategoryId'] = result.vatCategoryId;
				obj['description'] = result.description;
				obj['exciseTaxId'] = result.exciseTaxId;
				idx = index;
			}
			return obj;
		});
		// form.setFieldValue(
		// 	`lineItemsString.${idx}.vatCategoryId`,
		// 	result.vatCategoryId,
		// 	true,
		// );
		// form.setFieldValue(
		// 	`lineItemsString.${idx}.unitPrice`,
		// 	result.unitPrice,
		// 	true,
		// );
		// form.setFieldValue(
		// 	`lineItemsString.${idx}.description`,
		// 	result.description,
		// 	true,
		// );
		this.updateAmount(data, props);
	};

	getPoDetails = (e, row, props,form,field) => {
		let option;
		const { po_list,selectedData } = this.props;
			let idx;
			this.state.data.map((obj, index) => {
				if (obj.id === row.id) {
					idx = index;
				}
				return obj;
			});
		if (e && e.label !== 'Select RFQ') {
		 
			this.poValue(
				e.value,
				row,
				'poNumber',
				form,
				field,
				props,
			);
			this.props.purchaseOrderDetailsAction
				.getPOById(e.value).then((response) => {
				this.setState(
					{
						option : {
							label: response.data.supplierName,
							value: response.data.supplierId,
						},
					grnRemarks:response.data.poNumber,	
					data:response.data.poQuatationLineItemRequestModelList ,
					supplierReferenceNumber: response.data.supplierReferenceNumber,
					supplier_currency:response.data.currencyCode,
					supplier_currency_symbol:response.data.currencySymbol
					
				//	data1:response.data.supplierId,
				},() => {
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
				// () => {
				// 	this.formRef.current.setFieldValue('supplierId',
				// 	this.state.option.value,
				// 	true,)
				// },
				  
				);
				this.formRef.current.setFieldValue('supplierId', this.state.option, true);
				this.formRef.current.setFieldValue('currencyCode', this.state.supplier_currency, true);
				this.formRef.current.setFieldValue('supplierReferenceNumber', this.state.supplierReferenceNumber, true);
				this.formRef.current.setFieldValue('grnRemarks', this.state.grnRemarks, true);
			});
		}
	}

	render() {
		strings.setLanguage(this.state.language);
		const { data, discountOptions, initValue, prefix,tax_treatment_list, param,loading,loadingMsg } = this.state;

		const {
			currency_list,
			supplier_list,
			universal_currency_list,
			currency_convert_list,
			po_list,
		} = this.props;
console.log(this.state.data)
		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})
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
												<span className="ml-2">{strings.CreateGoodsReceivedNote}</span>
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
													if(this.state.grnReceivedQuantityError!="Please Enter Quantity"){
														this.handleSubmit(values, resetForm);
													}
												
												}}
												validate={(values) => 
													{
													let errors = {};
													if (this.state.exist === true) {
														errors.grn_Number =
															'GRN number already axists';
													}
													if (values.grn_Number==='') {
														errors.grn_Number = 'GRN number is required';
													}
													return errors;
												}}
												validationSchema={Yup.object().shape(
													{
													grn_Number: Yup.string().required(
														'Invoice number is required',
													),
													supplierId: Yup.string().required(
														'Supplier is required',
													),
													// placeOfSupplyId: Yup.string().required('Place of supply is required'),
													
													grnReceiveDate: Yup.string().required(
														'Order date is required',
													),
													rfqExpiryDate: Yup.string().required(
														'Order due date is required'
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
																grnReceivedQuantity: Yup.string()
																	.required('Value is required')
																	.test(
																		'grnReceivedQuantity',
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
																		'Unit price should be greater than 1',
																		(value) => {
																			if (value > 0) {
																				return true;
																			} else {
																				return false;
																			}
																		},
																	),
																vatCategoryId: Yup.string().required(
																	'Value is required',
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
																	<Label htmlFor="poNumber">
																		
																	{strings.PONumber}
																	</Label>
																	<Select
																	    isDisabled={this.props.location.state && this.props.location.state.poId ?true:false}
																		styles={customStyles}
																		id="poNumber"
																		name="poNumber"
																		placeholder={strings.Select+strings.PONumber}
																		options={
																			po_list
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						po_list,
																						'PO Number',
																				  )
																				: []
																		}
																		value={
																			po_list &&this.props.location.state &&	this.props.location.state.poId ?
																			selectOptionsFactory.renderOptions(
																				'label',
																				'value',
																				po_list,
																				'PO Number',
																		  )
																			.find((option) => option.value == this.props.location.state.poId):
																			props.values.poNumber
																		}

																		onChange={(option) => {
																			if (option && option.value) {
																				this.getPoDetails(option, option.value, props)
																				 props.handleChange('poNumber')(option);

																			} else {

																				props.handleChange('poNumber')('');
																			}

																				// if(!this.state.data1){
																				// 	this.state.supplierList = this.state.data1
																				// }else{
																				// 	this.state.supplierList =	props.values.supplierId
																				// }

																		}}
                                                                        // onChange={() => {
                                                                        //     this.getrfqDetails
                                                                        // }}
																		className={
																			props.errors.poNumber &&
																			props.touched.poNumber
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.poNumber &&
																		props.touched.poNumber && (
																			<div className="invalid-feedback">
																				{props.errors.poNumber}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="grn_Number">
																		<span className="text-danger">* </span>
																		{strings.GRNNUMBER}
																	</Label>
																	<Input
																		type="text"
																		maxLength="50"
																		id="grn_Number"
																		name="grn_Number"
																		placeholder={strings.InvoiceNumber}
																		value={props.values.grn_Number}
																		onBlur={props.handleBlur('grn_Number')}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regExInvNum.test(
																					option.target.value,
																				)
																			) {
																			props.handleChange('grn_Number')(
																				option,
																			);
																		}
																			this.validationCheck(option.target.value);
																		}}
																		className={
																			props.errors.grn_Number &&
																			props.touched.grn_Number
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.grn_Number &&
																		props.touched.grn_Number && (
																			<div className="invalid-feedback">
																				{props.errors.grn_Number}
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

																		value={
																		// 	this.state.quotationId ?

																		// 	tmpSupplier_list &&
																		//    selectOptionsFactory.renderOptions(
																		// 	   'label',
																		// 	   'value',
																		// 	   tmpSupplier_list,
																		// 	   strings.CustomerName,
																		//  ).find((option) => option.value == this.state.contactId)
																		   
																		//  :
																		 
																		 props.values.supplierId
																		   }
																		   isDisabled={this.props.location.state &&	this.props.location.state.poId ?true:false}
																		onChange={(option) => {
																			if (option && option.value) {
																				this.formRef.current.setFieldValue('currency', this.getCurrency(option.value), true);
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
													
															{this.props.location.state &&	this.props.location.state.poId ?"":<Col lg={3}>
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
																	// this.props.history.push(`/admin/master/contact/create`,{gotoParentURL:"/admin/expense/goods-received-note/create"})
																	}

                                                            >
                                                                <i className="fas fa-plus mr-1" />
                                         {strings.AddASupplier}
									</Button></Col>}
															
														
														</Row>
														<Row>	<Col lg={3}>
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
															</Col></Row>
														<hr />
														<Row>
															
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="date">
																		<span className="text-danger">* </span>
																		{strings.ReceivedDate}
																	</Label>
																	<DatePicker
																		id="date"
																		name="grnReceiveDate"
																		className={`form-control ${
																			props.errors.grnReceiveDate &&
																			props.touched.grnReceiveDate
																				? 'is-invalid'
																				: ''
																		}`}
																		placeholderText={strings.OrderDate}
																		selected={props.values.grnReceiveDate ?props.values.grnReceiveDate :new Date()} 
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd-MM-yyyy"
																		minDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('grnReceiveDate')(value);
																		}}
																	/>
																	{props.errors.grnReceiveDate &&
																		props.touched.grnReceiveDate && (
																			<div className="invalid-feedback">
																				{props.errors.grnReceiveDate.includes("nullable()") ? "Order date is required" :props.errors.grnReceiveDate}

																			</div>
																		)}
																</FormGroup>
															</Col>
															{/* <Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="due_date">
																	<span className="text-danger">* </span>
																		Expiry Date
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
																		placeholderText="Order Due date"
																		selected={props.values.rfqExpiryDate}
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd-MM-yyyy"
																		maxDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('rfqExpiryDate')(value);
																		}}
																	/>
																	{props.errors.rfqExpiryDate &&
																		props.touched.rfqExpiryDate && (
																			<div className="invalid-feedback">
																				{props.errors.rfqExpiryDate}
																			</div>
																		)}
																	
																</FormGroup>
															</Col> */}

							{props.values.supplierReferenceNumber ? (				
					  	<Col lg={3} >
						  <FormGroup className="mb-3">
							  <Label htmlFor="supplierReferenceNumber">
							  {strings.SupplierReferenceNumber}
							  </Label>
							  <Input
								  type="text"
								  maxLength="20"
								  disabled={true}
								  id="supplierReferenceNumber"
								  name="supplierReferenceNumber"
								  placeholder={strings.Select+strings.ReferenceNumber}
								  value={props.values.supplierReferenceNumber}
								  onBlur={props.handleBlur('supplierReferenceNumber')}
								  onChange={(value) => {
									  props.handleChange('supplierReferenceNumber')(
										  value,
									  );
								  }}
								  className={
									  props.errors.supplierReferenceNumber &&
									  props.touched.supplierReferenceNumber
										  ? 'is-invalid'
										  : ''
								  }
							  />
							  {props.errors.supplierReferenceNumber &&
								  props.touched.supplierReferenceNumber && (
									  <div className="invalid-feedback">
										  {props.errors.supplierReferenceNumber}
									  </div>
								  )}
						  </FormGroup>
					  </Col>
					):(" ")}	
															
														
														</Row>
													
														<Row>
															<Col lg={12} className="mb-3">
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
																	disabled={this.checkedRow() ? true : false ||
																		props.values.poNumber ? true : false}
																>
																	<i className="fa fa-plus"></i>&nbsp;{strings.Addmore}
																</Button> */}
																{this.props.location.state &&	this.props.location.state.poId ?"":<Button
																	color="primary"
																	className="btn-square mr-3"
																	onClick={(e, props) => {
																		this.openProductModal()
																		// this.props.history.push(`/admin/master/product/create`,{gotoParentURL:"/admin/expense/goods-received-note/create"})
																		}}
																	disabled={props.values.poNumber ? true : false}	
																	>
																	<i className="fa fa-plus"></i>&nbsp;{strings.Addproduct}
																</Button>}
															</Col>
														</Row>
														<Row>
															<Col lg={8}>
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
																		width="5%"
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
																		width='10%'
																	>
																		{strings.DESCRIPTION}
																	</TableHeaderColumn> */}

																	<TableHeaderColumn
																		dataField="poQuantity"
																		width="13%"
																		dataFormat={(cell, rows) =>
																			this.renderGRNQuantity(cell, rows, props)
																		}
																	>
																		{strings.RECEIVEDQUANTITY}
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
																		dataField="quantity"
																		width="10%"
																		dataFormat={(cell, rows) =>
																			this.renderPoQuantity(cell, rows, props)
																		}
																	>
																		{strings.POQUANTITY}
																	</TableHeaderColumn>
																	{/* <TableHeaderColumn
																		dataField="receivedquantity"
																		width="10%"
																		dataFormat={(cell, rows) =>
																			this.renderReceivedQuantity(cell, rows, props)
																		}
																	>
																		Received Quantity
																	</TableHeaderColumn> */}
																	{/* <TableHeaderColumn
																	width="12%"
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
																	<TableHeaderColumn
																	width="12%"
																		dataField="vat"
																		dataFormat={(cell, rows) =>
																			this.renderVat(cell, rows, props)
																		}
																	>
																		{strings.VAT}
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="sub_total"
																		dataFormat={this.renderSubTotal}
																		className="text-right"
																		columnClassName="text-right"
																		formatExtraData={universal_currency_list}
																	>
																		{strings.SUBTOTAL}
																	</TableHeaderColumn> */}
																</BootstrapTable>
															</Col>
														</Row>
														<hr />
														{this.state.data.length > 0 ? (
															<Row>
																<Col lg={8}>
																{/* <FormGroup className="py-2">
																		<Label htmlFor="notes">{strings.Notes}</Label><br/>
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
																	</FormGroup> */}
																	<Row>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="grnRemarks">
																					{strings.GRNREMARKS}
																				</Label>
																				<Input
																					type="text"
																					maxLength="100"
																					id="grnRemarks"
																					name="grnRemarks"
																					value={props.values.grnRemarks}
																					placeholder={strings.GRNREMARKS}
																					onChange={(value) => {
																						props.handleChange('grnRemarks')(value);

																					}}
																					className={props.errors.grnRemarks && props.touched.grnRemarks ? "is-invalid" : ""}
																				/>
																				{props.errors.grnRemarks && props.touched.grnRemarks && (
																					<div className="invalid-feedback">{props.errors.grnRemarks}</div>
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
																			maxLength="250"
																			style={{width: "700px"}}
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
																	</Col>

															</Row>
														) : null}
														<Row>
															<Col lg={8} className="mt-5">
																<FormGroup className="text-right">
																<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			console.log(props.errors,"ERRORs")
																			if(this.state.data.length === 1)
																			{
																			console.log(props.errors,"ERRORs")
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
																	{this.props.location.state &&	this.props.location.state.parentId ?"":<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			console.log(props.errors,"ERRORs")
																			if(this.state.data.length === 1)
																			{
																			console.log(props.errors,"ERRORs")
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
																			: strings.CreateandMore}
																	</Button>}
																	<Button
																		type="button"
																		color="secondary"
																		className="btn-square"
																		onClick={() => {
																			this.props.history.push(
																				'/admin/expense/goods-received-note',
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
							this.props.goodsReceivedNoteAction.getSupplierList(this.state.contactType);
							this.getCurrentUser(e);
						}
						}
					createSupplier={this.props.goodsReceivedNoteAction.createSupplier}
					getStateList={this.props.goodsReceivedNoteAction.getStateList}
					currency_list={this.props.currency_convert_list}
					country_list={this.props.country_list}
				/>
				<ProductModal
					openProductModal={this.state.openProductModal}
					closeProductModal={(e) => {
						this.closeProductModal(e);
					}}
					getCurrentProduct={(e) =>{ 
						this.props.supplierInvoiceActions.getProductList();
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
)(CreateGoodsReceivedNote);
