import React from 'react';
import { connect } from 'react-redux';

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
	UncontrolledTooltip,
} from 'reactstrap';
import { Formik, Field } from 'formik';
import Select from 'react-select';
import * as Yup from 'yup';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import { selectOptionsFactory } from 'utils';
import DatePicker from 'react-datepicker';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import * as RequestForQuotationDetailsAction from '../screens/detail/actions';
import { bindActionCreators } from 'redux';
import * as RequestForQuotationAction from '../screens/detail/actions';
import { CommonActions } from 'services/global';
import * as CurrencyConvertActions from '../../currencyConvert/actions';
import { toast } from 'react-toastify';
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';


const mapStateToProps = (state) => {

	return {
		project_list: state.request_for_quotation.project_list,
		contact_list: state.request_for_quotation.contact_list,
		currency_list: state.request_for_quotation.currency_list,
		vat_list: state.request_for_quotation.vat_list,
		product_list: state.customer_invoice.product_list,
		supplier_list: state.request_for_quotation.supplier_list,
		country_list: state.request_for_quotation.country_list,
		product_category_list: state.product.product_category_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.currencyConvert.currency_convert_list,
		rfqReceiveDate: state.rfqReceiveDate,
		excise_list: state.request_for_quotation.excise_list,
	};
	
};


const mapDispatchToProps = (dispatch) => {
	return {
		requestForQuotationDetailsAction : bindActionCreators(
			RequestForQuotationDetailsAction,
			dispatch,
		),
		requestForQuotationAction : bindActionCreators(
			RequestForQuotationAction,
			dispatch,
		),
		
		commonActions: bindActionCreators(CommonActions, dispatch),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
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
class CreatePurchaseOrder extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
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
			initValue: {
				total_excise: 0,
				poApproveDate: new Date(),
				poReceiveDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
				supplierId: '',
				poQuatationLineItemRequestModelList: [
					{
						id: 0,
						description: '',
						quantity: 1,
						unitPrice: 1,
						vatCategoryId: '',
						subTotal: 0,
						productId: '',
					
					},
				],
			
				total_net: 0,
				term: '',
				totalAmount: 0,
				notes: '',
				type: 4,

			},
			prefixData:'',
			state_list: [],
			editorState: EditorState.createEmpty(),
			// selectedData:{
			// 	total_net: 0,
			
			// 	totalVatAmount:0,
			// 	totalAmount: 0,
			// },
			contentState: {},
			viewEditor: false,
			message: '',
			productId:'',
			fileName: '',

		};
	
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		
		this.formikRef = React.createRef();
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.content = {
			entityMap: {},
			blocks: [
				{
					key: '637gr',
					text: this.state.message,
					type: 'unstyled',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
					data: {},
				},
			],
		};
	}
 


    checkedRow = () => {
		if (this.state.selectedData.poQuatationLineItemRequestModelList.length > 0) {
			let length = this.state.selectedData.poQuatationLineItemRequestModelList.length - 1;
			let temp = Object.values(this.state.selectedData.poQuatationLineItemRequestModelList[`${length}`]).indexOf('');
			if (temp > -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	
    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.selectedData !== nextProps.selectedData || prevState.totalAmount !== nextProps.totalAmount ||
			prevState.totalVatAmount != nextProps.totalVatAmount  ) {
			console.log('getDerivedStateFromProps state changed',nextProps.selectedData.poQuatationLineItemRequestModelList);
		
		 return { prefixData : nextProps.prefixData,
		 	selectedData :nextProps.selectedData,
			 totalAmount :nextProps.totalAmount,
			 totalVatAmount :nextProps.totalVatAmount,
			 totalExciseAmount:nextProps.totalExciseAmount
		};
        }
		// else if(prevState.totalAmount !== nextProps.totalAmount)
		// {
		// 	console.log('+++++++++++++++++',nextProps.totalAmount)
		// 	return { prefixData : nextProps.prefixData,
		// 		totalAmount :nextProps.totalAmount };
		// }
		// else if(prevState.totalVatAmount != nextProps.totalVatAmount)
		// {
		// 	console.log('---------',nextProps.totalVatAmount)
		// 	return{
		// 		prefixData : nextProps.prefixData,
		// 		totalVatAmount :nextProps.totalVatAmount
		// 	};
		// }
    }


	renderDescription = (cell, row, props) => {
		let idx;
		this.state.selectedData.poQuatationLineItemRequestModelList.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`poQuatationLineItemRequestModelList.${idx}.description`}
				render={({ field, form }) => (
					<Input
					type="text"
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
							props.errors.poQuatationLineItemRequestModelList &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)].description &&
							Object.keys(props.touched).length > 0 &&
							props.touched.poQuatationLineItemRequestModelList &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)].description
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	}

	selectItem = (e, row, name, form, field, props) => {
		//e.preventDefault();
		let data = this.state.selectedData.poQuatationLineItemRequestModelList;
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
				this.state.selectedData.poQuatationLineItemRequestModelList[parseInt(idx, 10)][`${name}`],
				true,
			);
			this.updateAmount(data, props);
		} else {
			this.setState({ data }, () => {
				form.setFieldValue(
					field.name,
					this.state.selectedData.poQuatationLineItemRequestModelList[parseInt(idx, 10)][`${name}`],
					true,
				);
				this.updateAmount(data, props);
			});
		}
	};

	renderQuantity = (cell, row, props) => {
		let idx;
		this.state.selectedData.poQuatationLineItemRequestModelList.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`poQuatationLineItemRequestModelList.${idx}.quantity`}
				render={({ field, form }) => (
					<div>
						<Input
							type="text"
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
							className={`form-control 
           						${
												props.errors.poQuatationLineItemRequestModelList &&
												props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
												props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)]
													.quantity &&
												Object.keys(props.touched).length > 0 &&
												props.touched.poQuatationLineItemRequestModelList &&
												props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
												props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)]
													.quantity
													? 'is-invalid'
													: ''
											}`}
						/>
						{props.errors.poQuatationLineItemRequestModelList &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)].quantity &&
							Object.keys(props.touched).length > 0 &&
							props.touched.poQuatationLineItemRequestModelList &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)].quantity && (
								<div className="invalid-feedback">
									{props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)].quantity}
								</div>
							)}
					</div>
				)}
			/>
		);
	}

	renderUnitPrice = (cell, row, props) => {
		let idx;
		this.state.selectedData.poQuatationLineItemRequestModelList.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`poQuatationLineItemRequestModelList.${idx}.unitPrice`}
				render={({ field, form }) => (
					<Input
					type="number"
min="0"
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
                       ${
													props.errors.poQuatationLineItemRequestModelList &&
													props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
													props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)]
														.unitPrice &&
													Object.keys(props.touched).length > 0 &&
													props.touched.poQuatationLineItemRequestModelList &&
													props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
													props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)]
														.unitPrice
														? 'is-invalid'
														: ''
												}`}
					/>
				)}
			/>
		);
	}

	renderExcise = (cell, row, props) => {
		const { excise_list } = this.props;

		let idx;
		this.state.selectedData.poQuatationLineItemRequestModelList.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`poQuatationLineItemRequestModelList.${idx}.exciseTaxId`}
				render={({ field, form }) => (
					<Select
					isDisabled={true}
						styles={customStyles}
						options={
							excise_list
								? selectOptionsFactory.renderOptions(
										'name',
										'id',
										excise_list,
										'Excise Tax',
								  )
								: []
						}
						value={
							excise_list &&
							selectOptionsFactory
								.renderOptions('name', 'id', excise_list, 'Excise Tax')
								.find((option) => option.value ==row.exciseTaxId)
						}
						id="exciseTaxId"
						placeholder={strings.Select+strings.VAT}
						onChange={(e) => {
							this.selectItem(
								e.value,
								row,
								'exciseTaxId',
								form,
								field,
								props,
							);
						}}
						className={`${
							props.errors.poQuatationLineItemRequestModelList &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)].exciseTaxId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.poQuatationLineItemRequestModelList &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)].exciseTaxId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	}

	renderVatAmount = (cell, row, extraData) => {
		return row.vatAmount === 0 ? this.state.selectedData.currencyIsoCode +" "+ row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : this.state.selectedData.currencyIsoCode +" "+ row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 });
	};


	renderVat = (cell, row, props) => {
		const { vat_list } = this.props;
		let vatList = vat_list.length
			? [{ id: '', vat: 'Select VAT' }, ...vat_list]
			: vat_list;
		let idx;
		this.state.selectedData.poQuatationLineItemRequestModelList.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`poQuatationLineItemRequestModelList.${idx}.vatCategoryId`}
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
							props.errors.poQuatationLineItemRequestModelList &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)].vatCategoryId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.poQuatationLineItemRequestModelList &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)].vatCategoryId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	}

	renderSubTotal = (cell, row,extraData) => {
		// return row.subTotal ? (
		// 	<Currency
		// 		value={row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	''
		// );

		return row.subTotal ? row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '';
	}
	
	renderProduct = (cell, row, props) => {
		const { product_list } = this.props;
		let productList = product_list.length
			? [{ id: '', name: 'Select Product' }, ...product_list]
			: product_list;
		let idx;
		this.state.selectedData.poQuatationLineItemRequestModelList.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`poQuatationLineItemRequestModelList.${idx}.productId`}
				render={({ field, form }) => (
					<Select
						styles={customStyles}
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
						className={`${
							props.errors.poQuatationLineItemRequestModelList &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.errors.poQuatationLineItemRequestModelList[parseInt(idx, 10)].productId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.poQuatationLineItemRequestModelList &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)] &&
							props.touched.poQuatationLineItemRequestModelList[parseInt(idx, 10)].productId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	}
	prductValue = (e, row, name, form, field, props) => {
		const { product_list } = this.props;
		let data = this.state.selectedData.poQuatationLineItemRequestModelList;
		const result = product_list.find((item) => item.id === parseInt(e));
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				obj['unitPrice'] = result.unitPrice;
				obj['vatCategoryId'] = result.vatCategoryId;
				obj['description'] = result.description;
				
				idx = index;
			}
			return obj;
		});
		form.setFieldValue(
			`poQuatationLineItemRequestModelList.${idx}.vatCategoryId`,
			result.vatCategoryId,
			true,
		);
		form.setFieldValue(
			`poQuatationLineItemRequestModelList.${idx}.unitPrice`,
			result.unitPrice,
			true,
		);
		form.setFieldValue(
			`poQuatationLineItemRequestModelList.${idx}.description`,
			result.description,
			true,
		);
		this.updateAmount(data, props);
	};

		renderSubTotal = (cell, row,extraData) => {
			// return row.subTotal ? (
			// 	<Currency
			// 		value={row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
			// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			// 	/>
			// ) : (
			// 	''
			// );

		// this.setState({
		// 	sub_total:sub_total+newSubtotal
		// })
		return row.subTotal ? this.state.selectedData.currencyIsoCode+" " +row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '';
		}

	onContentStateChange = (contentState) => {
		this.setState(
			{
				contentState,
			},
			() => {
				this.setState({
					message: this.state.contentState.blocks[0].text,
				});
			},
		);
	};
	renderActions = (cell, rows, props) => {
		return (
			<Button
				size="sm"
				className="btn-twitter btn-brand icon"
				disabled={this.state.selectedData.poQuatationLineItemRequestModelList.length === 1 ? true : false}
				onClick={(e) => {
					this.deleteRow(e, rows, props);
				}}
			>
				<i className="fas fa-trash"></i>
			</Button>
		);
	};
	deleteRow = (e, row, props) => {
		const id = row['id'];
		let newData = [];
		e.preventDefault();
		const data = this.state.selectedData.poQuatationLineItemRequestModelList;
		newData = data.filter((obj) => obj.id !== id);
		props.setFieldValue('poQuatationLineItemRequestModelList', newData, true);
		this.updateAmount(newData, props);
	};

	updateAmount = (data, props) => {
		const { vat_list } = this.props;
		let total_net = 0;
		let total = 0;
		let total_vat = 0;
		let total_excise = 0;
		const { discountPercentage, discountAmount } = this.state;

		data.map((obj) => {
			const index =
				obj.vatCategoryId !== ''
					? vat_list.findIndex((item) => item.id === +obj.vatCategoryId)
					: '';
			const vat = index !== '' ? vat_list[`${index}`].vat : 0;
			// let val = (((+obj.unitPrice) * vat) / 100)
			if (props.values.discountType === 'PERCENTAGE') {
				var val =
					((+obj.unitPrice -
						+((obj.unitPrice * discountPercentage) / 100).toLocaleString(navigator.language, { minimumFractionDigits: 2 })) *
						vat *
						obj.quantity) /
					100;
			} else if (props.values.discountType === 'FIXED') {
				var val =
					(obj.unitPrice * obj.quantity - discountAmount / data.length) *
					(vat / 100);
			} else {
				var val = (+obj.unitPrice * vat * obj.quantity) / 100;
			}
			obj.subTotal =
				obj.unitPrice && obj.vatCategoryId ? +obj.unitPrice * obj.quantity : 0;
			total_net = +(total_net + +obj.unitPrice * obj.quantity);
			total_vat = +(total_vat + val);
			total = total_vat + total_net;
			total_excise = +(total_excise + obj.exciseAmount)
			return obj;
		});
		console.log(total_net,"total_net")
		console.log(total_vat,"total_vat")
		console.log(total,"total")
		const discount =
			props.values.discountType === 'PERCENTAGE'
				? +((total_net * discountPercentage) / 100).toLocaleString(navigator.language, { minimumFractionDigits: 2 })
				: discountAmount;
		this.setState(
			{
				data,
				initValue: {
					...this.state.initValue,
					...{
						total_net: discount ? total_net - discount : total_net,
						totalVatAmount: total_vat,
						discount: total_net > discount ? discount : 0,
						totalAmount: total_net > discount ? total - discount : total,
						total_excise: total_excise
					},
				},
				
			},
					() => {
				if (props.values.discountType === 'PERCENTAGE') {
					this.formRef.current.setFieldValue('discount', discount);
					
				}
			},
		);
	
	this.props.updateParentAmount(total,total_vat)
	console.log("selectData total_vat ***",total_vat)
	console.log("selectDa tatotal ***",total)
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
					productId: '',
				}),
				idCount: this.state.idCount + 1,
			},
			() => {
				this.setFieldValue(
					'lineItemsString',
					this.state.data,
					true,
				);
				this.setFieldTouched(
					`lineItemsString[${this.state.data.length - 1}]`,
					false,
					true,
				);
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

	getData = (data) => {
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

	// Create
	handleSubmit = (data, resetForm, setSubmitting) => {
		this.setState({ disabled: true });
		const {
			id,
			poReceiveDate,
			poApproveDate,
			supplierId,
            rfqNumber,
			po_number,
			notes,
			supplierReferenceNumber,
		} = data;


		if(!this.state.prefixData||!poReceiveDate || !poApproveDate) {
			this.setState({ disabled: false });

			return ;

		}


		this.setState({
			isSubmitting:true
		})



		const postData = this.getData(data);
		
		let formData = new FormData();
        formData.append(
			'rfqId',
			id !== null ?this.state.selectedData.id : '',
		);
		formData.append(
			'poNumber',
			po_number !== null ? this.state.prefixData : '',
		);
		formData.append('poApproveDate', poApproveDate ? poApproveDate : '');
		formData.append(
			'poReceiveDate',
			poReceiveDate ? poReceiveDate : '',
		);
		formData.append('notes', notes ? notes : '');
		formData.append('type', 4);
		formData.append('lineItemsString', JSON.stringify(this.state.selectedData.poQuatationLineItemRequestModelList));
		formData.append('totalAmount', this.state.totalAmount );
        formData.append('totalVatAmount',this.state.totalVatAmount );
	    formData.append('supplierId', this.state.selectedData.supplierId);
		formData.append('supplierReferenceNumber',supplierReferenceNumber ? supplierReferenceNumber : '');
		formData.append('totalExciseAmount',this.state.selectedData.totalExciseAmount);
		formData.append('currencyCode', this.state.selectedData.currencyCode);
        if (rfqNumber && rfqNumber.value) {
			formData.append('rfqNumber', rfqNumber.value);
		}
		if (this.uploadFile && this.uploadFile.files && this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		this.props.createPO(formData)
			.then((res) => {				
				if (res.status === 200) {
					resetForm();
					this.props.getNextTemplateNo();
					this.setState({isSubmitting:false})
					this.props.closePurchaseOrder(true);

					
				}
			})
			.catch((err) => {
				this.setState({
					isSubmitting:false
				})
		
				this.displayMsg(err);
				this.formikRef.current.setSubmitting(false);
			});

	};
	displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};
	_showDetails = (bool) => {
		this.setState({
		  showDetails: bool
		});
	  }

	  getTotalNet = () => {

		let data =[];

		let value = 0

		if(this.state.selectedData && this.state.selectedData.poQuatationLineItemRequestModelList && Array.isArray(this.state.selectedData.poQuatationLineItemRequestModelList)) {

			data = this.state.selectedData.poQuatationLineItemRequestModelList

		}

		data.forEach((d)=>{
			value = value+d.subTotal
		})

		return value-this.state.totalVatAmount;



	  }



	render() {
		strings.setLanguage(this.state.language);
		const { openPurchaseOrder, closePurchaseOrder, id, supplier_list,rfqReceiveDate,universal_currency_list } = this.props;
		const { initValue, contentState,data,supplierId } = this.state;
 
		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})

		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openPurchaseOrder} className="modal-success contact-modal">
					<Formik
						ref={this.formikRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm }) => {
							this.handleSubmit(values, resetForm);
						}}
						validationSchema={Yup.object().shape(
							{
							// po_number: Yup.string().required(
							// 	'Invoice Number is Required',
							// ),
							// supplierId: Yup.string().required(
							// 	'Supplier is Required',
							// ),
							
							// poApproveDate: Yup.string().required(
							// 	'Order Date is Required',
							// ),
							// poReceiveDate: Yup.string().required(
							// 	'Order Due Date is Required'
							// ),
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
							poQuatationLineItemRequestModelList: Yup.array()
								.required(
									'Atleast one invoice sub detail is mandatory',
								)
								.of(
									Yup.object().shape({
										quantity: Yup.string()
											.required('Value is Required')
											.test(
												'quantity',
												'Quantity Should be Greater than 0',
												(value) => {
													if (value > 0) {
														return true;
													} else {
														return false;
													}
												},
											),
										unitPrice: Yup.string()
											.required('Value is Required')
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
								
									
									}),
								),
						}
						)
					}
					>
						{(props) => {
							const { isSubmitting } = props;
							return (
								
								<Form
									name="simpleForm"
									onSubmit={props.handleSubmit}
									className="create-contact-screen"
								>
									<CardHeader toggle={this.toggleDanger}>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="nav-icon fas fa-id-card-alt" />
													<span className="ml-2">Create Purchase Order </span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<ModalBody>
								

						
            {/* {console.log("in modal ",this.state.selectedData)} */}
           
            
									<Row>
                                                              <Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="rfqNumber">
																		<span className="text-danger">* </span>
																		 {strings.RFQNumber}
																	</Label>
																	<Input
                                                                    disabled={true}
																		type="text"
																		id="rfqNumber"
																		name="rfqNumber"
																		placeholder={strings.InvoiceNumber}
																		value={this.state.selectedData.rfqNumber}
																		onBlur={props.handleBlur('rfqNumber')}
																		onChange={(value) => {
																			props.handleChange('rfqNumber')(
																				value,
																			);
																		}}
																		className={
																			props.errors.rfqNumber &&
																			props.touched.rfqNumber
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.rfqNumber &&
																		props.touched.rfqNumber && (
																			<div className="invalid-feedback">
																				{props.errors.rfqNumber}
																			</div>
																		)}
																</FormGroup>
															</Col>
                                                            <Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="po_number">
																		<span className="text-danger">* </span>
																		 {strings.PONumber}
																	</Label>
																	<Input
																		disabled={true}
																		type="text"
																		id="po_number"
																		name="po_number"
																		placeholder={strings.InvoiceNumber}
																		value={this.state.prefixData}
																		onBlur={props.handleBlur('po_number')}
																		onChange={(evt) => {
																			// props.handleChange('po_number')(
																			// 	value,
																			// );
																			this.setState({

																				prefixData:evt.target.value


																			})
																		}}
																		className={
																			props.errors.po_number &&
																			props.touched.po_number
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{
																		!this.state.prefixData && (
																			<div  className="text-danger">
																				{"Please enter PO Number"}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="currencyCode">
																	<span className="text-danger">* </span>
																		{strings.Currency}
																	</Label>
																	<Input
																		type="text"
																		id="currencyCode"
																		name="currencyCode"
																		disabled={true}
																		value={this.state.selectedData.currencyName}
																		// onBlur={props.handleBlur('currencyCode')}
																		// onChange={(value) => {
																		// 	props.handleChange('currencyCode')(
																		// 		value,
																		// 	);
																		// }}
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
                                                            </Row>
                                                            <Row>

															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="supplierName">
																		<span className="text-danger">* </span>
																		 {strings.SupplierName}
																	</Label>
                                                                    <Input
																		type="text"
                                                                        disabled={true}
																		id="supplierName"
																		name="supplierName"
																		// placeholder="Invoice Number"
																		value={this.state.selectedData.supplierName}
																		onBlur={props.handleBlur('po_number')}
																		// onChange={(value) => {
																		// 	props.handleChange('po_number')(
																		// 		value,
																		// 	);
																		// }}
																		className={
																			props.errors.po_number &&
																			props.touched.po_number
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{/* <Select
																		styles={customStyles}
																		id="supplierId"
																		name="supplierId"
																		placeholder={this.state.selectedData.supplierName}
																		// options={
																		// 	tmpSupplier_list
																		// 		? selectOptionsFactory.renderOptions(
																		// 				'label',
																		// 				'value',
																		// 				tmpSupplier_list,
																		// 				'Supplier Name',
																		// 		  )
																		// 		: []
																		// }
																		value={this.state.selectedData.supplierName}
																		// onChange={(option) => {
																		// 	if (option && option.value) {
																		// 		props.handleChange('supplierId')(option);
																		// 	} else {

																		// 		props.handleChange('supplierId')('');
																		// 	}
																		// }}
																		// className={
																		// 	props.errors.supplierId &&
																		// 	props.touched.supplierId
																		// 		? 'is-invalid'
																		// 		: ''
																		// }
																	/> */}
																	{/* {this.state.selectedData.supplierId &&
																		this.state.selectedData.supplierId && (
																			<div className="invalid-feedback">
																				{this.state.selectedData.supplierId}
																			</div>
																		)} */}
																</FormGroup>
															</Col>
															{/* <Col>
																<Label
																	htmlFor="supplierId"
																	style={{ display: 'block' }}
																>
																	Add New Supplier
																</Label>
																<Button
																	type="button"
																	color="primary"
																	className="btn-square"
																	onClick={this.openSupplierModal}
																>
																	<i className="fa fa-plus"></i> Add a Supplier
																</Button>
															</Col> */}
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="taxTreatmentid">
																		Tax Treatment
																	</Label>
																	<Input
																	disabled
																		styles={customStyles}
																		id="taxTreatmentid"
																		name="taxTreatmentid"
																		value={
																		this.state.selectedData.taxtreatment
																	 	
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
															</Col>
                                                             <Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="supplierReferenceNumber">
																	
																		{strings.SupplierReferenceNumber}
																	</Label>
																	<Input
																		type="text"
																		id="supplierReferenceNumber"
																		name="supplierReferenceNumber"
																		placeholder={strings.SupplierReferenceNumber}
																		value={this.state.selectedData.supplierReferenceNumber}
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

														</Row>
														<hr />
														<Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="date">
																		<span className="text-danger">* </span>
																		{strings.PODate}
																	</Label>
																	<DatePicker
																		id="date"
																		name="poApproveDate"
																		className={`form-control ${
																			props.errors.poApproveDate &&
																			props.touched.poApproveDate
																				? 'is-invalid'
																				: ''
																		}`}
																		placeholderText={strings.OrderDate}
																		selected={props.values.poApproveDate}
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd-MM-yyyy"
																		minDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('poApproveDate')(value);
																		}}
																	/>
																	{
																		!props.values.poApproveDate && (
																			<div className="text-danger">
																				{"Please Select PO Date"}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="due_date">
																	<span className="text-danger">* </span>
																		 {strings.PODueDate}
																	</Label>
																	<DatePicker
																		id="date"
																		name="poReceiveDate"
																		className={`form-control ${
																			props.errors.poReceiveDate &&
																			props.touched.poReceiveDate
																				? 'is-invalid'
																				: ''
																		}`}
																		placeholderText={strings.OrderDueDate}
																		selected={props.values.poReceiveDate}
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd-MM-yyyy"
																		minDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('poReceiveDate')(value);
																		}}
																	/>
																																		{
																		!props.values.poReceiveDate && (
																			<div className="text-danger">
																				{"Please Select PO Due Date"}
																			</div>
																		)}

																	
																</FormGroup>
															</Col>
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
																	disabled={this.checkedRow() ? true : false}
																>
																	<i className="fa fa-plus"></i> {strings.Addmore}
																</Button> */}
															</Col>
														</Row>
														<Row>
															<Col lg={12}>
																{props.errors.poQuatationLineItemRequestModelList &&
																	props.errors.poQuatationLineItemRequestModelList === 'string' && (
																		<div
																			className={
																				props.errors.poQuatationLineItemRequestModelList
																					? 'is-invalid'
																					: ''
																			}
																		>
																			<div className="invalid-feedback">
																				{props.errors.poQuatationLineItemRequestModelList}
																			</div>
																		</div>
																	)}
																<BootstrapTable
																	options={this.options}
																	data={this.state.selectedData.poQuatationLineItemRequestModelList}
																	version="4"
																	hover
																	keyField="id"
																	className="invoice-create-table"
																>
																	<TableHeaderColumn
																		width="5%"
																		dataAlign="center"
																		dataFormat={(cell, rows) =>
																			this.renderActions(cell, rows, props)
																		}
																	></TableHeaderColumn>
																	<TableHeaderColumn
																	width="15%"
																		dataField="product"
																		dataFormat={(cell, rows) =>
																			this.renderProduct(cell, rows, props)
																		}
																	>
																		 {strings.PRODUCT}
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="description"
																		dataFormat={(cell, rows) =>
																			this.renderDescription(cell, rows, props)
																		}
																	>
																		{strings.DESCRIPTION}
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="quantity"
																		width="100"
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
																	</TableHeaderColumn> 
																	<TableHeaderColumn
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
																	columnClassName="text-right"																	>
																	VAT amount
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="sub_total"
																		dataFormat={this.renderSubTotal}
																		className="text-right"
																		columnClassName="text-right"
																	
																	>
																		{strings.SUBTOTAL}
																	</TableHeaderColumn>
																</BootstrapTable>
															</Col>
														</Row>
														<hr />
													
														{this.state.selectedData.poQuatationLineItemRequestModelList.length > 0 && (
																<Row>
																		<Col lg={8}>
																	<FormGroup className="py-2">
																		<Label htmlFor="notes">{strings.Notes}</Label>
																		<Input
																			type="textarea"
																			maxLength="255"
																			name="notes"
																			id="notes"
																			rows="6"
																			placeholder={strings.DeliveryNotes}
																			onChange={(option) =>
																				props.handleChange('notes')(option)
																			}
																			value={props.values.notes}
																		/>
																	</FormGroup>
																
																</Col>
																	<Col lg={4}>
																		<div className="">
																	<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																					{strings.Total_Excise}
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">

																						{this.state.selectedData.currencyIsoCode} &nbsp;
																						{this.state.selectedData.totalExciseAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 })}
																					</label>
																				</Col>
																			</Row>
																		</div>
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
																						value=	{initValue.total_net.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)} */}
																							{/* {this.getTotalNet()} */}
																							{this.state.selectedData.currencyIsoCode}  &nbsp;
																								{this.getTotalNet().toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 })}
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
																						value=	{initValue.invoiceVATAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)} */}
																							{/* {this.state.totalVatAmount	} */}
																							{this.state.selectedData.currencyIsoCode}  &nbsp;
																							{this.state.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 })}
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
																						value=	{initValue.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)} */}
																							{/* {this.state.totalAmount} */}
																							{this.state.selectedData.currencyIsoCode} &nbsp;
																							{this.state.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2,maximumFractionDigits: 2 })}
																						</label>
																					</Col>
																				</Row>
																			</div>
																		</div>
																	</Col>
																</Row>
															)}
									</ModalBody>
									<ModalFooter>
										<Button
											color="primary"
											type="submit"
											className="btn-square"
											disabled={this.state.isSubmitting}
											
										>
											<i className="fa fa-dot-circle-o mr-1"></i>{strings.Create}
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {

												let initValue = {...this.state.initValue}
												initValue.total_net = 0;
												this.setState({
													initValue:initValue
												})
												closePurchaseOrder(false);
											}}
										>
											<i className="fa fa-ban"></i> {strings.Cancel}
										</Button>
									</ModalFooter>
								</Form>
							);
						}}

					</Formik>
				</Modal>
				
			</div>
		);
	}
}


export default connect(
	mapStateToProps
	
)(CreatePurchaseOrder);