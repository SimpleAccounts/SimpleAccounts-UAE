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
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as CustomerInvoiceCreateActions from './actions';
import * as CustomerInvoiceActions from '../../actions';
import * as ProductActions from '../../../product/actions';
import { CustomerModal, ProductModal } from 'screens/customer_invoice/sections';
import { LeavePage, Loader, CurrencyExchangeRate, ProductTable, ProductTableCalculation, InvoiceAdditionaNotesInformation, TotalCalculation, TermDateInput } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { renderList, selectOptionsFactory, InputValidation, DropdownLists, Lists } from 'utils';
import Switch from "react-switch";
import './style.scss';
import moment from 'moment';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { AddressComponent } from 'screens/contact/sections';

const mapStateToProps = (state) => {
	const contact_list = state.customer_invoice.customer_list;
	const currencyList = state.common.currency_convert_list;
	return {
		currency_list: state.customer_invoice.currency_list,
		currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
		vat_list: state.customer_invoice.vat_list,
		product_list: state.common.product_list,
		customer_list: contact_list,
		excise_list: state.customer_invoice.excise_list,
		country_list: state.customer_invoice.country_list,
		product_category_list: state.product.product_category_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.common.currency_convert_list,
		customer_list_dropdown: DropdownLists.getContactDropDownList(contact_list),
		companyDetails: state.common.company_details,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		customerInvoiceActions: bindActionCreators(
			CustomerInvoiceActions,
			dispatch,
		),
		customerInvoiceCreateActions: bindActionCreators(
			CustomerInvoiceCreateActions,
			dispatch,
		),
		productActions: bindActionCreators(ProductActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
let strings = new LocalizedStrings(data);

class CreateCustomerInvoice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			customer_currency_symbol: '',
			loading: true,
			disabled: false,
			discountOptions: [
				{ value: 'FIXED', label: 'FIXED' },
				{ value: 'PERCENTAGE', label: '%' },
			],
			exciseTypeOption: [
				{ value: 'Inclusive', label: 'Inclusive' },
				{ value: 'Exclusive', label: 'Exclusive' },
			],
			disabledDate: true,
			data: [
				{
					id: 0,
					description: '',
					quantity: 1,
					unitPrice: '',
					vatCategoryId: '',
					exciseTaxId: '',
					discountType: 'FIXED',
					exciseAmount: 0,
					discount: 0,
					subTotal: 0,
					vatAmount: 0,
					productId: '',
					isExciseTaxExclusive: '',
					unitType: '',
				},
			],
			discountEnabled: false,
			idCount: 0,
			initValue: {
				receiptAttachmentDescription: '',
				receiptNumber: '',
				contact_po_number: '',
				currencyCode: '',
				invoiceDueDate: '',
				invoiceDate: new Date(),
				contactId: '',
				placeOfSupplyId: '',
				term: '',
				exchangeRate: 1,
				changeShippingAddress: false,
				shippingAddress: Lists.Address,
				lineItemsString: [
					{
						id: 0,
						description: '',
						quantity: 1,
						unitPrice: '',
						vatCategoryId: '',
						productId: '',
					},
				],
				invoice_number: '',
				totalNet: 0,
				totalVatAmount: 0,
				totalAmount: 0,
				notes: '',
				discount: 0,
				discountPercentage: '',
				discountType: "FIXED",
				totalExciseAmount: 0,
				currencyName: '',
			},
			taxType: false,
			// excisetype: { value: 'Inclusive', label: 'Inclusive' },
			currentData: {},
			contactType: 2,
			openCustomerModal: false,
			openProductModal: false,
			openInvoiceNumberModel: false,
			selectedContact: '',
			createMore: false,
			fileName: '',
			term: '',
			enablePlaceOfSupply: false,
			discountPercentage: '',
			discountAmount: 0,
			exist: false,
			prefix: '',
			income: true,
			purchaseCategory: [],
			salesCategory: [],
			exchangeRate: 1,
			basecurrency: [],
			inventoryList: [],
			param: false,
			date: '',
			contactId: '',
			isDesignatedZone: false,
			isRegisteredVat: false,
			companyVATRegistrationDate: new Date(),
			invoiceBeforeVatRegistration: false,
			producttype: [],
			isQuotationSelected: false,
			loadingMsg: "Loading...",
			disableLeavePage: false,
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

		this.regEx = /^[0-9\d]+$/;
		this.regExFax = /^[0-9]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExInvNum = /[a-zA-Z0-9-/]+$/;
		this.regExTelephone = /^[0-9-]+$/;
		this.regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		this.regDec1 = /^\d{1,2}\.\d{1,2}$|^\d{1,2}$/;
		this.regDecimalP = /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
	}

	setDate = (props, value) => {
		const { term } = this.state;
		const val = term ? term.value.split('_') : '';
		const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];

		const values = value
			? value
			: moment(props.values.invoiceDate, 'DD-MM-YYYY').toDate();
		if (temp && values) {
			this.setState({
				date: moment(values).add(temp, 'days'),
			});
			const date1 = moment(values)
				.add(temp, 'days')
				.format('DD-MM-YYYY')
			props.handleChange('invoiceDate1')(value);
			props.setFieldValue('invoiceDueDate', date1, true);
		}
	};

	setCurrency = (value, exchangeRate) => {
		const { currency_convert_list } = this.props;
		if (currency_convert_list) {
			let result = currency_convert_list.find((obj) => obj.currencyCode === value);
			if (result) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{
							currencyCode: result.currencyCode,
							currencyName: result.currencyName,
							currencyIsoCode: result.currencyIsoCode,
							exchangeRate: result.exchangeRate,
						},
					},
				}, () => {
					this.formRef.current.setFieldValue('currencyCode', result.currencyCode, true);
					this.formRef.current.setFieldValue('exchangeRate', result.exchangeRate, true);
					this.formRef.current.setFieldValue('currencyName', result.currencyName, true);
					this.resetProductTableValues(result.exchangeRate, exchangeRate);
				});
			}
		}
	};


	validationCheck = (value) => {
		const data = {
			moduleType: 6,
			name: value,
		};
		this.props.customerInvoiceCreateActions
			.checkValidation(data)
			.then((response) => {
				if (response.data === 'Invoice Number Already Exists') {
					this.setState(
						{
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
	getQuotationDetails = async (quotationId) => {
		this.props.customerInvoiceCreateActions.getQuotationById(quotationId).then((res) => {
			if (res.status === 200) {
				const invoiceDate = renderList.mapInvoiceListFromQuotation(res.data);
				this.populateData(invoiceDate);
			}
		})
	}
	populateData = (inivoiceData) => {
		delete inivoiceData.initValue.invoiceNumber;
		this.setState({
			...this.state,
			...inivoiceData.state,
			initValue: {
				...this.state.initValue,
				...inivoiceData.initValue,
			},
			loading: false,
		}, () => {
			Object.entries(inivoiceData.initValue).forEach(([name, value]) => {
				this.formRef.current.setFieldValue(name, value, true);
			});
			const data = this.state.data;
			this.getVatListForProducts(renderList.addRow(data, inivoiceData.state.idCount));
		});
	}

	getParentInvoiceDetails = (parentInvoiceId) => {
		this.props.customerInvoiceCreateActions
			.getInvoiceById(parentInvoiceId)
			.then((res) => {
				if (res.status === 200) {
					const invoiceDate = renderList.mapInvoiceList(res.data);
					this.populateData(invoiceDate);
				}
			});
	}
	componentDidMount = () => {
		this.getInitialData();
	};

	getDefaultNotes = () => {
		this.props.commonActions.getNoteSettingsInfo().then((res) => {
			if (res.status === 200) {
				this.formRef.current.setFieldValue('notes', res.data.defaultNotes, true);
				this.formRef.current.setFieldValue('footNote', res.data.defaultFootNotes, true);
			}
		})
	}
	getInitialData = async () => {
		this.getInvoiceNo();
		await this.props.customerInvoiceActions.getCustomerList(this.state.contactType);
		await this.props.customerInvoiceActions.getCountryList();
		await this.props.customerInvoiceActions.getExciseList();
		await this.props.commonActions.getProductList();
		await this.props.productActions.getProductCategoryList();
		await this.props.customerInvoiceActions.getInvoicePrefix().then((response) => {
			this.setState({
				prefixData: response.data

			});
		});
		await this.props.customerInvoiceActions
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
		await this.props.customerInvoiceActions.getVatList();

		const { companyDetails } = this.props;
		if (companyDetails) {
			const { currencyCode, isRegisteredVat, isDesignatedZone, vatRegistrationDate } = companyDetails;
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						currencyCode: currencyCode,
					},
				},
				companyVATRegistrationDate: new Date(moment(vatRegistrationDate)),
				isDesignatedZone: isDesignatedZone,
				isRegisteredVat: isRegisteredVat,
				loading: false,
			});
			this.formRef?.current && this.formRef.current.setFieldValue('currencyCode', currencyCode);
		}
		if (this.props.location.state && this.props.location.state.quotationId)
			this.getQuotationDetails(this.props.location.state.quotationId);

		if (this.props.location.state && this.props.location.state.parentInvoiceId)
			this.getParentInvoiceDetails(this.props.location.state.parentInvoiceId);
		this.getDefaultNotes()
	};

	discountType = (row) => {
		return this.state.discountOptions &&
			selectOptionsFactory
				.renderOptions('label', 'value', this.state.discountOptions, 'discount')
				.find((option) => option.value === +row.discountType)
	}
	getContactShippingAddress = (cutomerID, taxID, props) => {
		const { enablePlaceOfSupply } = this.state;
		const { placeList } = Lists;
		if (enablePlaceOfSupply) {
			this.props.customerInvoiceCreateActions.getCustomerShippingAddressbyID(cutomerID).then((res) => {
				if (res.status === 200) {
					var PlaceofSupply = placeList && placeList.find((option) => option.label.toUpperCase() === res.data.shippingStateName.toUpperCase())
					if (PlaceofSupply) {
						this.setState({ placeOfSupplyId: PlaceofSupply });
						this.formRef.current.setFieldValue('placeOfSupplyId', PlaceofSupply.value, true);
					}
				}
			});
		}
	};
	
	getTaxTreatment = (e) => {

		let taxTreatmentId = "";
		taxTreatmentId = e.taxTreatment;
		this.setState({
			initValue: {
				...this.state.initValue,
				...{
					taxTreatmentId: taxTreatmentId,
				},
			},
			taxTreatmentId: taxTreatmentId,
			
			enablePlaceOfSupply: !!(taxTreatmentId !== 'GCC VAT REGISTERED' && taxTreatmentId !== 'GCC NON-VAT REGISTERED' && taxTreatmentId !== 'NON GCC'),
		})
		this.formRef.current.setFieldValue('taxTreatmentId', taxTreatmentId, true);
		
		this.getContactShippingAddress(e.id, taxTreatmentId)
		return taxTreatmentId;
	}

	getProductType = (id) => {
		const { taxTreatmentId, isRegisteredVat, isDesignatedZone, invoiceBeforeVatRegistration } = this.state;
		if (taxTreatmentId) {
			const { product_list } = this.props;
			const product = product_list.find(obj => obj.id === id);
			if (product) {
				var { vat_list } = this.props;
				var vt = [];
				if (isRegisteredVat && !invoiceBeforeVatRegistration) {
					if (isDesignatedZone) {
						if (product.productType === "GOODS") {
							if (taxTreatmentId === 'UAE VAT REGISTERED' || taxTreatmentId === 'UAE VAT REGISTERED FREEZONE' || taxTreatmentId === 'UAE NON-VAT REGISTERED FREEZONE' || taxTreatmentId === 'GCC VAT REGISTERED' || taxTreatmentId === 'GCC NON-VAT REGISTERED' || taxTreatmentId === 'NON GCC') {
								vat_list.map(element => {
									if (element.name == 'OUT OF SCOPE') {
										vt.push(element);
									}
								});
							}
							if (taxTreatmentId === 'UAE NON-VAT REGISTERED') {
								vt = vat_list;
							}
						}
						else if (product.productType === "SERVICE") {
							if (taxTreatmentId === 'UAE VAT REGISTERED' || taxTreatmentId === 'UAE NON-VAT REGISTERED' || taxTreatmentId === 'UAE VAT REGISTERED FREEZONE' || taxTreatmentId === 'UAE NON-VAT REGISTERED FREEZONE') {
								vt = vat_list;
							}
							if (taxTreatmentId === 'GCC VAT REGISTERED' || taxTreatmentId === 'GCC NON-VAT REGISTERED' || taxTreatmentId === 'NON GCC') {
								vat_list.map(element => {
									if (element.name == 'ZERO RATED TAX (0%)') {
										vt.push(element);
									}
								});

							}
						}
					} else {
						if (taxTreatmentId === 'UAE VAT REGISTERED' || taxTreatmentId === 'UAE NON-VAT REGISTERED' || taxTreatmentId === 'UAE VAT REGISTERED FREEZONE' || taxTreatmentId === 'UAE NON-VAT REGISTERED FREEZONE') {
							vt = vat_list;
						}
						if (taxTreatmentId === 'GCC VAT REGISTERED' || taxTreatmentId === 'GCC NON-VAT REGISTERED' || taxTreatmentId === 'NON GCC') {
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

				return vt;
			}

		}
	};

	resetProductTableValues = (exchangeRate, preExchangeRate) => {
		const { product_list } = this.props;
		const { data } = this.state;

		const newData = [];
		data.map((obj) => {
			const result = product_list.find((item) => item.id === obj.productId);
			if (obj.productId && result) {
				const vat_list = this.getProductType(obj.productId);
				obj.vat_list = vat_list;
				if (preExchangeRate && exchangeRate !== preExchangeRate) {
					obj.unitPrice = result ? (parseFloat(result.unitPrice) * (1 / exchangeRate)).toFixed(2) : 0
				}
				obj.vatCategoryId = this.getVatCategoryId(obj.vatCategoryId, vat_list);
			}
			newData.push(obj);
			return obj;
		})
		this.formRef.current.setFieldValue('lineItemsString', newData, true);
		this.updateAmount(newData);
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
	updateAmount = (data) => {
		const { taxType } = this.state;
		const { vat_list } = this.props;
		const list = ProductTableCalculation.updateAmount(data, vat_list, taxType);
		this.setState(
			{
				data: list.data ? list.data : [],
				initValue: {
					...this.state.initValue,
					...{
						totalNet: list.totalNet ? list.totalNet : 0,
						totalVatAmount: list.totalVatAmount ? list.totalVatAmount : 0,
						discount: list.discount ? list.discount : 0,
						totalAmount: list.totalAmount ? list.totalAmount : 0,
						totalExciseAmount: list.totalExciseAmount ? list.totalExciseAmount : 0
					},
				},
			}
		);
	};

	getVatListForProducts = (data) => {
		if (data && data.length > 0) {
			let newData = [];
			data.map((obj) => {
				if (obj.productId) {
					const vat_list = this.getProductType(obj.productId);
					obj.vat_list = vat_list;
					obj.vatCategoryId = this.getVatCategoryId(obj.vatCategoryId, vat_list);
				}
				newData.push(obj);
				return obj;
			})
			this.formRef.current.setFieldValue('lineItemsString', newData, true);
			this.updateAmount(newData);
		}
	}

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

	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		const {
			receiptAttachmentDescription,
			receiptNumber,
			contact_po_number,
			currencyCode,
			exchangeRate,
			invoiceDueDate,
			invoiceDate,
			contactId,
			placeOfSupplyId,
			invoice_number,
			shippingAddress,
			notes,
			changeShippingAddress,
			footNote
		} = data;
		const { term, quotationId } = this.state;
		const formData = new FormData();
		formData.append('taxType', this.state.taxType)
		formData.append('quotationId', quotationId ?? '')
		formData.append('referenceNumber', invoice_number !== null ? this.state.prefix + invoice_number : '');
		formData.append('invoiceDueDate', invoiceDueDate ? invoiceDueDate : null);
		formData.append('invoiceDate', invoiceDate ? invoiceDate : null,);
		formData.append('receiptNumber', receiptNumber !== null ? receiptNumber : '');
		formData.append('receiptAttachmentDescription', receiptAttachmentDescription !== null ? receiptAttachmentDescription : '',);
		formData.append('exchangeRate', exchangeRate !== null ? exchangeRate : '');
		formData.append('contactPoNumber', contact_po_number !== null ? contact_po_number : '');
		if (changeShippingAddress && changeShippingAddress === true) {
			formData.append('changeShippingAddress', changeShippingAddress !== null ? changeShippingAddress : '');
			formData.append('shippingAddress', shippingAddress.address ?? '');
			formData.append('shippingCountry', shippingAddress.countryId ?? '');
			formData.append('shippingState', shippingAddress.stateId ?? '');
			formData.append('shippingCity', shippingAddress.city ?? '');
			formData.append('shippingPostZipCode', shippingAddress.postZipCode ?? '');
			formData.append('shippingTelephone', shippingAddress.telephone ?? '');
			formData.append('shippingFax', shippingAddress.fax ?? '');
		}
		formData.append('notes', notes !== null ? notes : '');
		formData.append('footNote', footNote ? footNote : '')
		formData.append('type', 2);
		const local = this.state.data.map(({ taxtreatment, vat_list, ...rest }) => rest);
		formData.append('lineItemsString', JSON.stringify(local));
		formData.append('totalVatAmount', this.state.initValue.totalVatAmount);
		formData.append('totalAmount', this.state.initValue.totalAmount);
		formData.append('totalExciseAmount', this.state.initValue.totalExciseAmount);
		formData.append('discount', this.state.initValue.discount);
		formData.append('term', term ? term.value ?? term : '');
		formData.append('contactId', contactId ? contactId.value ?? contactId : '');
		formData.append('placeOfSupplyId', placeOfSupplyId ? placeOfSupplyId.value ?? placeOfSupplyId : '');
		formData.append('currencyCode', currencyCode ? currencyCode.value ?? currencyCode : '');
		if (this.uploadFile && this.uploadFile.files && this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		this.setState({ loading: true, disableLeavePage: true, loadingMsg: "Creating Invoice..." });
		this.props.customerInvoiceCreateActions
			.createInvoice(formData)
			.then((res) => {
				this.setState({ disabled: false });
				this.setState({ loading: false });
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? strings.InvoiceCreatedSuccessfully : res.data.message,
				);
				if (this.state.createMore) {
					this.setState(
						{
							createMore: false,
							selectedContact: '',
							exchangeRate: '',
							disableLeavePage: false,
							producttype: [],
							data: [
								{
									id: 0,
									description: '',
									quantity: 1,
									unitPrice: '',
									vatCategoryId: '',
									taxtreatment: '',
									subTotal: 0,
									discount: 0,
									discountType: 'FIXED',
									vatAmount: 0,
									productId: '',
								},
							],
							initValue: {
								...this.state.initValue,
								...{
									totalNet: 0,
									totalVatAmount: 0,
									totalAmount: 0,
									discountType: 'FIXED',
									discount: 0,
									discountPercentage: '',
									totalExciseAmount: 0,
								},
							},
						},
						() => {
							resetForm(this.state.initValue);
							this.setState({
								contactId: '',
								placeOfSupplyId: '',
								customer_currency: null,
								currencyCode: '',
								initValue: {
									...this.state.initValue,
									...{
										totalNet: 0,
										totalVatAmount: 0,
										totalAmount: 0,
										discountType: 'FIXED',
										discount: 0,
										discountPercentage: '',
										changeShippingAddress: false
									},
								}
							});
							this.getInvoiceNo();
							this.formRef.current.setFieldValue(
								'lineItemsString',
								this.state.data,
								false,
							);
							this.formRef.current.setFieldValue('contactId', '', true);
							this.formRef.current.setFieldValue('placeOfSupplyId', '', true);
							this.formRef.current.setFieldValue('currencyCode', null, true);
							this.formRef.current.setFieldValue('taxTreatmentId', '', true);
							this.formRef.current.setFieldValue('term', '', true);
						},
					);
				} else {
					this.props.history.push('/admin/income/customer-invoice');
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });

				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Invoice Created Unsuccessfully!',
				);
			});
	};
	openInvoiceNumberModel = (props) => {
		this.setState({ openInvoiceNumberModel: true });
	};
	openCustomerModal = (props) => {
		this.setState({ openCustomerModal: true });
	};
	openProductModal = (props) => {
		this.setState({ openProductModal: true });
	};
	openInvoicePreviewModal = (props) => {
		this.setState({ openInvoicePreviewModal: true });
	};

	getVatCategoryId = (vatId, vat_list) => {
		const { invoiceBeforeVatRegistration, isRegisteredVat } = this.state;
		if (!isRegisteredVat || invoiceBeforeVatRegistration) {
			return 10;
		}
		const vatCategory = vat_list && vat_list.find(vat => vat.id === vatId);
		if (vatCategory)
			return vatCategory.id;
		else
			return (vat_list && vat_list.length > 0 ? vat_list[0]?.id : '');
	}

	getCurrentProduct = (newProduct) => {
		if (newProduct) {
			debugger
			const { data, idCount } = this.state;
			let exchangeRate = this.formRef.current?.state?.values?.exchangeRate || 1;
			const vat_list = this.getProductType(newProduct.id);
			data.map(obj => {
				debugger
				if (!obj.productId) {
					obj['unitPrice'] = (parseFloat(newProduct.unitPrice) * (1 / exchangeRate)).toFixed(2)
					obj['exciseTaxId'] = newProduct.exciseTaxId;
					obj['description'] = newProduct.description;
					obj['discountType'] = newProduct.discountType;
					obj['transactionCategoryId'] = newProduct.transactionCategoryId;
					obj['transactionCategoryLabel'] = newProduct.transactionCategoryLabel;
					obj['isExciseTaxExclusive'] = newProduct.isExciseTaxExclusive;
					obj['unitType'] = newProduct.unitType;
					obj['unitTypeId'] = newProduct.unitTypeId;
					obj['productId'] = newProduct.id;
					obj['quantity'] = '1';
					obj.vat_list = vat_list;
					obj['vatCategoryId'] = this.getVatCategoryId(parseInt(newProduct.vatCategoryId), vat_list);
				}
				return obj;
			})
			this.setState(
				{
					data: data,
					idCount: idCount + 1,
				},
				() => {
					debugger
					const { data } = this.state;
					this.updateAmount(renderList.addRow(data, idCount));
					this.formRef.current.setFieldValue('lineItemsString', data, true);
				},
			);
		}
	};

	closeCustomerModal = (res) => {
		this.setState({ openCustomerModal: false });
	};
	closeInvoiceNumberModel = (res) => {
		this.setState({ openInvoiceNumberModel: false });
	};
	closeProductModal = (res) => {
		this.setState({ openProductModal: false });
	};

	closeInvoicePreviewModal = (res) => {
		this.setState({ openInvoicePreviewModal: false });
	};

	getInvoiceNo = () => {
		this.props.customerInvoiceCreateActions.getInvoiceNo().then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{ invoice_number: res.data },
					},
				});
				if (res && res.data && this.formRef.current)
					this.formRef.current.setFieldValue('invoice_number', res.data, true, this.validationCheck(res.data));
			}
		});
	};

	setContactDetails = (customerID) => {
		this.formRef.current.setFieldValue('contactId', customerID, true);
		const { customer_list } = this.props;
		if (customer_list) {
			const customer = customer_list.find(obj => obj.value === customerID)
			if (customer) {
				const currencyCode = customer.label.currency.currencyCode;
				const taxTreatment = customer.label.taxTreatment.taxTreatment;
				this.setState({
					contactId: customerID,
					initValue: {
						...this.state.initValue,
						...{
							taxTreatmentId: taxTreatment,
						},
					},
					taxTreatmentId: taxTreatment,
					enablePlaceOfSupply: !!(taxTreatment !== 'GCC VAT REGISTERED' && taxTreatment !== 'GCC NON-VAT REGISTERED' && taxTreatment !== 'NON GCC'),
				}, () => {
					this.formRef.current.setFieldValue('taxTreatmentId', taxTreatment, true);
					this.setCurrency(currencyCode);
					this.getContactShippingAddress(customerID, taxTreatment)
				});
			} else {
				this.formRef.current.setFieldValue('taxTreatmentId', '', true);
			}
		}
	}

	render() {
		strings.setLanguage(this.state.language);
		const { loading, loadingMsg, isRegisteredVat, idCount, discountEnabled, quotationId, quotationDate, parentInvoiceId, } = this.state
		const { data, enablePlaceOfSupply, initValue, exist, param, companyVATRegistrationDate, taxTreatmentList, term, invoiceBeforeVatRegistration } = this.state;
		const {
			country_list,
			universal_currency_list,
			product_list,
			excise_list,
			vat_list,
			customer_list_dropdown,
			currency_list_dropdown,
		} = this.props;
		const { termList, placeList } = Lists;
		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div>
					<div className="create-customer-invoice-screen">
						<div className="animated fadeIn">
							<Row>
								<Col lg={12} className="mx-auto">
									<Card>
										<CardHeader>
											<Row>
												<Col lg={12}>
													<div className="h4 mb-0 d-flex align-items-center">
														<i className="fas fa-file-invoice" />
														<span className="ml-2">{strings.CreateInvoice}</span>
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
															validate={(values) => {

																let errors = {};
																if (exist === true) {
																	errors.invoice_number =
																		'Invoice number already exists';
																}
																if (values.invoice_number === '') {
																	errors.invoice_number = strings.InvoiceNumberRequired
																}
																if (param === true) {
																	errors.discount =
																		'Discount amount cannot be greater than invoice total amount';
																}

																if (enablePlaceOfSupply && !values.placeOfSupplyId) {
																	errors.placeOfSupplyId = 'Place of supply is required';
																}
																if (values.term && values.term.label && values.term.label === "Select Terms") {
																	errors.term =
																		'Term is required';
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
																	'Invoice number is required',
																),
																contactId: Yup.string().required(
																	strings.Customer_Name_Is_Required

																),
																// placeOfSupplyId: Yup.string().required('Place of supply is required'),
																term: Yup.string().required(strings.TermIsRequired),
																currencyCode: Yup.string().required(
																	strings.CurrencyIsRequired
																),
																invoiceDate: Yup.string().required(
																	'Invoice date is ',
																),

																lineItemsString: Yup.array()
																	.required(
																		'Atleast one invoice sub detail is mandatory',
																	)
																	.of(
																		Yup.object().shape({
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
																				strings.VATIsRequired
																			),
																			productId: Yup.string().required(
																				strings.Product_Is_Required
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
																					value={props.values.invoice_number}
																					onBlur={props.handleBlur('invoice_number')}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExInvNum.test(
																								option.target.value,
																							)
																						) {
																							props.handleChange('invoice_number')(
																								option,
																							);
																						}
																						this.validationCheck(
																							option.target.value
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
																	<hr />
																	<Row>
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="contactId">
																					<span className="text-danger">* </span>
																					{strings.CustomerName}
																				</Label>
																				<Select
																					isDisabled={this.state.isQuotationSelected}
																					id="contactId"
																					name="contactId"
																					placeholder={strings.Select + strings.CustomerName}
																					options={customer_list_dropdown}
																					value={props.values.contactId?.value ? props.values.contactId : customer_list_dropdown.find((option) => option.value == props.values.contactId)}
																					onChange={(option) => {
																						this.setContactDetails(option.value);
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
																		{quotationId ? "" : <Col lg={3}>
																			<Label
																				htmlFor="contactId"
																				style={{ display: 'block' }}
																			>
																				{strings.AddNewCustomer}
																			</Label>
																			<Button
																				type="button"
																				color="primary"
																				className="btn-square mr-3 mb-3"
																				onClick={(e, props) => {
																					this.openCustomerModal()
																					// this.props.history.push(`/admin/master/contact/create`,{gotoParentURL:"/admin/income/customer-invoice/create"})
																				}}
																			>
																				<i className="fa fa-plus"></i> {strings.AddACustomer}
																			</Button>
																		</Col>}
																		{isRegisteredVat &&
																			<Col lg={3}>
																				<FormGroup className="mb-3">
																					<Label htmlFor="taxTreatmentId">
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
																						id="taxTreatmentId"
																						name="taxTreatmentId"
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
																										props.values.taxTreatmentId,
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
																		<Col lg={3}>
																			{enablePlaceOfSupply &&
																				(<FormGroup className="mb-3">
																					<Label htmlFor="placeOfSupplyId">
																						<span className="text-danger">* </span>
																						{strings.PlaceofSupply}
																					</Label>
																					<Select
																						isDisabled={this.state.isQuotationSelected}
																						id="placeOfSupplyId"
																						name="placeOfSupplyId"
																						placeholder={strings.Select + strings.PlaceofSupply}
																						options={placeList}
																						value={props.values.placeOfSupplyId?.value ? props.values.placeOfSupplyId : placeList.find((option) => option.value == props.values.placeOfSupplyId)}

																						className={
																							props.errors.placeOfSupplyId &&
																								props.touched.placeOfSupplyId
																								? 'is-invalid'
																								: ''
																						}
																						onChange={(option) => {
																							props.handleChange('placeOfSupplyId')(
																								option.value,
																							)
																							this.setState({
																								placeOfSupplyId: option.value
																							})
																						}}
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
																		<TermDateInput
																			fields={{
																				'term': { values: term ?? '', errors: props.errors.term, touched: props.touched.term, label: strings.Terms, required: true, disabled: false, name: 'term', placeholder: strings.Terms },
																				'invoiceDate': { values: props.values.invoiceDate, errors: props.errors.invoiceDate, touched: props.touched.invoiceDate, label: strings.InvoiceDate, required: true, disabled: false, name: 'invoiceDate', placeholder: strings.Select + strings.InvoiceDate, minDate: quotationDate },
																				'invoiceDueDate': { values: props.values.invoiceDueDate, errors: props.errors.invoiceDueDate, touched: props.touched.invoiceDueDate, label: strings.InvoiceDueDate, required: true, disabled: true, name: 'invoiceDueDate', placeholder: strings.InvoiceDueDate },
																			}}
																			onChange={(field, value) => {
																				if (field === 'term')
																					this.setState({ term: value, });
																				else if (field === 'invoiceDate') {
																					if (moment(value).isBefore(moment(companyVATRegistrationDate))) {
																						this.setState({ invoiceBeforeVatRegistration: true }, () => { this.resetProductTableValues(); });
																					} else {
																						this.setState({ invoiceBeforeVatRegistration: false }, () => { this.resetProductTableValues(); });
																					}
																				}
																				props.handleChange(field)(value);
																			}}
																		/>
																		<Col lg={3}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="currencyCode">
																					<span className="text-danger">* </span>
																					{strings.Currency}
																				</Label>
																				<Select
																					// styles={customStyles}
																					placeholder={strings.Select + strings.Currency}
																					options={currency_list_dropdown}
																					id="currencyCode"
																					name="currencyCode"
																					value={props.values.currencyCode?.values ? props.values.currencyCode : currency_list_dropdown.find((option) => option.value === props.values.currencyCode,)}
																					className={
																						props.errors.currencyCode &&
																							props.touched.currencyCode
																							? 'is-invalid'
																							: ''
																					}
																					onChange={(option) => {
																						props.handleChange('currencyCode')(option);
																						this.setCurrency(option.value, props.values.exchangeRate)
																					}}

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
																	<CurrencyExchangeRate
																		strings={strings}
																		currencyName={props.values.currencyName}
																		exchangeRate={props.values.exchangeRate}
																		onChange={(value) => {
																			this.resetProductTableValues(value, props.values.exchangeRate)
																			props.handleChange('exchangeRate')(value,);
																		}}
																	/>
																	<Row className="mb-3">
																		<Col lg={8} className="mb-3">

																			{quotationId ? "" : <Button
																				color="primary"
																				className="btn-square mr-3"
																				onClick={(e, props) => {
																					this.openProductModal()
																					// this.props.history.push(`/admin/master/product/create`,{gotoParentURL:"/admin/income/customer-invoice/create"})
																				}}
																			>
																				<i className="fa fa-plus"></i> {strings.Addproduct}
																			</Button>}
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
																			<ProductTable
																				data={data}
																				initValue={initValue}
																				isRegisteredVat={isRegisteredVat}
																				universal_currency_list={universal_currency_list}
																				setData={(data) => {
																					this.setState({ data: data })
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
																				}}
																				setIdCount={(idCount) => {
																					this.setState({ idCount: idCount })
																				}}
																				props={props}
																				strings={strings}
																				vat_list={vat_list}
																				product_list={product_list}
																				excise_list={excise_list}
																				discountEnabled={discountEnabled}
																				idCount={idCount}
																				updateAmount={(data) => {
																					this.updateAmount(data);
																				}}
																				enableAccount={false}
																				exchangeRate={props.values.exchangeRate}
																				disableVat={invoiceBeforeVatRegistration || !isRegisteredVat}
																				getProductType={(id) => {
																					const vat_list = this.getProductType(id);
																					return vat_list;
																				}}
																			/>
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
																	<Row>
																		<Col lg={8}>
																			<InvoiceAdditionaNotesInformation
																				notesValue={props.values.notes}
																				notesLabel={strings.Notes}
																				notesPlaceholder={strings.DeliveryNotes}
																				onChange={(field, value) => {
																					props.handleChange(field)(value)
																				}}
																				referenceNumberLabel={strings.ReferenceNumber}
																				referenceNumberPlaceholder={strings.ReceiptNumber}
																				referenceNumberValue={props.values.receiptNumber}
																				referenceNumber={true}
																				notes={true}
																				footNotePlaceholder={strings.PaymentDetails}
																				footNoteLabel={strings.Footnote}
																				footNoteValue={props.values.footNote}
																				footNote={true}
																			/>
																		</Col>
																		<Col lg={4}>
																			<TotalCalculation
																				initValue={initValue}
																				currency_symbol={initValue.currencyIsoCode}
																				isRegisteredVat={isRegisteredVat}
																				strings={strings}
																				discountEnabled={this.state.discountEnabled}
																			/>
																		</Col>
																	</Row>
																	<Row>
																		<Col
																			lg={12}
																			className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
																		>
																			<FormGroup className="text-right w-100">
																				<Button
																					type="button"
																					color="primary"
																					className="btn-square mr-3"
																					disabled={this.state.disabled}
																					onClick={() => {
																						console.log(props.errors)
																						if (this.state.data.length === 1) {
																							//	added validation popup	msg
																							props.handleBlur();
																							if (props.errors && Object.keys(props.errors).length != 0) {
																								this.props.commonActions.fillManDatoryDetails();
																							}
																						}
																						else {
																							let newData = []
																							const data = this.state.data;
																							newData = data.filter((obj) => obj.productId !== "");
																							props.setFieldValue('lineItemsString', newData, true);
																							this.updateAmount(newData, true);
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
																				{quotationId || parentInvoiceId ? "" : (<Button
																					type="button"
																					color="primary"
																					className="btn-square mr-3"
																					disabled={this.state.disabled}
																					onClick={() => {

																						if (this.state.data.length === 1) {
																							console.log(props.errors, "ERRORs")
																							//  added validation popup  msg
																							props.handleBlur();
																							if (props.errors && Object.keys(props.errors).length != 0)
																								this.props.commonActions.fillManDatoryDetails();
																						}
																						else {
																							let newData = []
																							const data = this.state.data;
																							newData = data.filter((obj) => obj.productId !== "");
																							props.setFieldValue('lineItemsString', newData, true);
																							this.updateAmount(newData, true);
																							// props.handleBlur();
																							// if(props.errors &&  Object.keys(props.errors).length != 0)
																							// 	this.props.commonActions.fillManDatoryDetails();
																						}
																						this.setState(
																							{
																								createMore: true,
																							},
																							() => {
																								props.handleSubmit();
																							},
																						);
																					}}
																				>
																					<i className="fa fa-refresh mr-1"></i>
																					{this.state.disabled
																						? 'Creating...'
																						: strings.CreateandMore}
																				</Button>)}
																				<Button
																					color="secondary"
																					className="btn-square"
																					onClick={() => {
																						if (this.props?.location?.state?.renderURL) {
																							this.props.history.push(`${this.props?.location?.state?.renderURL}`, { id: this.props?.location?.state?.renderID },);
																						} else
																							this.props.history.push(
																								'/admin/income/customer-invoice',
																							);
																					}}
																				>
																					<i className="fa fa-ban mr-1"></i>{strings.Cancel}
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
							getCurrentUser={(e) => {
								this.props.customerInvoiceActions.getCustomerList(this.state.contactType);
								this.setContactDetails(e.value ?? e.id);
								this.getTaxTreatment(e);
							}}
							contactType={{ label: "Customer", value: 2 }}
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
							vat_list={this.props.vat_list}
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
)(CreateCustomerInvoice);
