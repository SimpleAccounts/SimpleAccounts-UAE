import React, { useState, useEffect, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { LeavePage, Loader, ProductTableCalculation } from 'components';
import * as DebitNoteCreateActions from './actions';
import * as DebitNoteActions from '../../actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import { TextField } from '@material-ui/core';

import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import Switch from "react-switch";
import { Checkbox } from '@material-ui/core';
import invoiceimage from 'assets/images/invoice/invoice.png';

const mapStateToProps = (state) => {
	return {
		currency_list: state.debit_notes.currency_list,
		invoice_list: state.debit_notes.invoice_list,
		tax_treatment_list: state.common.tax_treatment_list,
		vat_list: state.common.vat_list,
		customer_list: state.common.customer_list,
		excise_list: state.common.excise_list,
		country_list: state.debit_notes.country_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.common.currency_convert_list,
		product_list: state.common.product_list,
		company_details: state.common.company_details,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		debitNoteActions: bindActionCreators(DebitNoteActions, dispatch,),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
		debitNoteCreateActions: bindActionCreators(DebitNoteCreateActions, dispatch,),
		productActions: bindActionCreators(ProductActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);

// Zod validation schema
const createDebitNoteSchema = z.object({
	debitNoteNumber: z.string().min(1, 'Debit Note Number is required'),
	contactId: z.union([
		z.string().min(1, 'Supplier Name is required'),
		z.object({
			value: z.union([z.string(), z.number()]),
			label: z.string(),
		}),
	]),
	debitNoteDate: z.union([z.date(), z.string()]).refine((val) => val !== null && val !== '', {
		message: 'Debit Note Date is required',
	}),
	invoiceNumber: z.union([
		z.string(),
		z.object({
			value: z.union([z.string(), z.number()]),
			label: z.string(),
		}),
	]).optional(),
	lineItemsString: z.array(
		z.object({
			quantity: z.union([z.string(), z.number()]).refine((val) => {
				const num = typeof val === 'string' ? parseFloat(val) : val;
				return !isNaN(num) && num > 0;
			}, 'Quantity must be greater than 0'),
		})
	).optional(),
	debitAmount: z.union([z.string(), z.number()]).optional(),
	referenceNumber: z.string().optional(),
	contact_po_number: z.string().optional(),
	currency: z.union([z.string(), z.object({ value: z.string(), label: z.string() })]).optional(),
	exchangeRate: z.union([z.string(), z.number()]).optional(),
	taxType: z.boolean().optional(),
	totalNet: z.number().optional(),
	invoiceVATAmount: z.number().optional(),
	totalVatAmount: z.number().optional(),
	totalAmount: z.number().optional(),
	isReverseChargeEnabled: z.boolean().optional(),
	notes: z.string().optional(),
	email: z.string().optional(),
	totalDiscount: z.number().optional(),
	discountPercentage: z.string().optional(),
	discountType: z.string().optional(),
	total_excise: z.number().optional(),
	customer_currency_symbol: z.string().optional(),
	taxTreatmentId: z.union([z.string(), z.object({ value: z.union([z.string(), z.number()]), label: z.string() })]).optional(),
	receiptAttachmentDescription: z.string().optional(),
}).refine((data) => {
	// Custom validation logic will be handled in the component
	return true;
}, {
	message: 'Validation error',
});

const CreateDebitNote = (props) => {
	const {
		currency_list,
		invoice_list,
		tax_treatment_list,
		vat_list,
		customer_list,
		excise_list,
		country_list,
		universal_currency_list,
		currency_convert_list,
		product_list,
		company_details,
		debitNoteActions,
		currencyConvertActions,
		debitNoteCreateActions,
		productActions,
		commonActions,
		history,
		location,
	} = props;

	const [language, setLanguage] = useState(window['localStorage'].getItem('language'));
	const [loading, setLoading] = useState(false);
	const [customer_currency_symbol, setCustomerCurrencySymbol] = useState('');
	const [disabled, setDisabled] = useState(false);
	const [disabled1, setDisabled1] = useState(false);
	const [discountOptions] = useState([
		{ value: 'FIXED', label: 'Fixed' },
		{ value: 'PERCENTAGE', label: '%' },
	]);
	const [exciseTypeOption] = useState([
		{ value: 'Inclusive', label: 'Inclusive' },
		{ value: 'Exclusive', label: 'Exclusive' },
	]);
	const [disabledDate, setDisabledDate] = useState(true);
	const [data, setData] = useState([
		{
			id: 0,
			description: '',
			quantity: 1,
			unitPrice: '',
			vatCategoryId: '',
			exciseTaxId: '',
			exciseAmount: '',
			subTotal: 0,
			vatAmount: 0,
			productId: '',
			isExciseTaxExclusive: '',
			discountType: 'FIXED',
			discount: 0,
			unitType: '',
			unitTypeId: ''
		},
	]);
	const [idCount, setIdCount] = useState(0);
	const [contactType] = useState(1);
	const [selectedContact, setSelectedContact] = useState('');
	const [createMore, setCreateMore] = useState(false);
	const [fileName, setFileName] = useState('');
	const [selectedType, setSelectedType] = useState({ value: 'FIXED', label: '₹' });
	const [discountPercentage, setDiscountPercentage] = useState('');
	const [discountAmount, setDiscountAmount] = useState(0);
	const [debitNoteExist, setDebitNoteExist] = useState(false);
	const [prefix, setPrefix] = useState('');
	const [purchaseCategory, setPurchaseCategory] = useState([]);
	const [remainingInvoiceAmount, setRemainingInvoiceAmount] = useState('');
	const [invoiceSelected, setInvoiceSelected] = useState(false);
	const [isDNWIWithoutProduct, setIsDNWIWithoutProduct] = useState(false);
	const [quantityExceeded, setQuantityExceeded] = useState('');
	const [isCreatedWithoutInvoice, setIsCreatedWithoutInvoice] = useState(false);
	const [shippingCharges, setShippingCharges] = useState(0);
	const [lockInvoiceDetail, setLockInvoiceDetail] = useState(false);
	const [disableLeavePage, setDisableLeavePage] = useState(false);
	const [receiptDate, setReceiptDate] = useState('');
	const [taxType, setTaxType] = useState(false);
	const [isReverseChargeEnabled, setIsReverseChargeEnabled] = useState(false);
	const [currentRow, setCurrentRow] = useState(null);

	const uploadFile = useRef(null);

	const file_size = 1024000;
	const supported_format = [
		'image/png',
		'image/jpeg',
		'text/plain',
		'application/pdf',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	];

	const regEx = /^[0-9\b]+$/;
	const regExBoth = /[a-zA-Z0-9]+$/;
	const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	const regExDNNum = /[a-zA-Z0-9-/]+$/;
	const regDecimalP = /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/;

	const form = useForm({
		resolver: zodResolver(createDebitNoteSchema),
		defaultValues: {
			invoiceNumber: '',
			receiptAttachmentDescription: '',
			referenceNumber: '',
			contact_po_number: '',
			currency: '',
			debitNoteDate: new Date(),
			contactId: '',
			exchangeRate: 1,
			lineItemsString: [
				{
					id: 0,
					description: '',
					quantity: 1,
					exciseAmount: 0,
					discount: 0,
					unitPrice: '',
					vatCategoryId: '',
					productId: '',
					subTotal: 0,
				},
			],
			taxType: false,
			debitNoteNumber: '',
			totalNet: 0,
			invoiceVATAmount: 0,
			totalVatAmount: 0,
			totalAmount: 0,
			isReverseChargeEnabled: false,
			notes: '',
			email: '',
			totalDiscount: 0,
			discountPercentage: '',
			discountType: 'FIXED',
			debitAmount: '',
			total_excise: 0,
			customer_currency_symbol: '',
			taxTreatmentId: '',
		},
		mode: 'onChange',
	});

	const {
		control,
		handleSubmit,
		formState: { errors, touchedFields },
		setValue,
		getValues,
		setError: setFormError,
		clearErrors,
		trigger,
	} = form;

	useEffect(() => {
		strings.setLanguage(language);
	}, [language]);

	useEffect(() => {
		getInitialData();
	}, []);

	const getInitialData = () => {
		getInvoiceNo();
		commonActions.getTaxTreatmentList();
		debitNoteActions.getInvoiceListForDropdown();
		commonActions.getCustomerList(contactType);
		debitNoteActions.getCountryList();
		productActions.getProductCategoryList();
		purchaseCategoryFetch();
		commonActions.getVatList();
		commonActions.getProductList();
		commonActions.getExciseList();
		if (location?.state?.invoiceID) {
			getInvoiceDetails(location?.state?.invoiceID)
			setValue('invoiceNumber', location?.state?.invoiceID, { shouldValidate: true });
			setValue('referenceNumber', location?.state?.invoiceNumber, { shouldValidate: true });
			setInvoiceSelected(true);
			setLockInvoiceDetail(true);
		}
	};

	const renderQuantity = (cell, row, formProps) => {
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<div>
				<Input
					type="text"
					min="0"
					maxLength="10"
					value={row['quantity'] !== 0 ? row['quantity'] : 0}
					onChange={(e) => {
						if (e.target.value === '' || regEx.test(e.target.value)) {
							selectItem(
								e.target.value,
								row,
								'quantity',
							);
							setCurrentRow(row);
						}
					}}
					placeholder={strings.Quantity}
					className={`form-control  ${errors.lineItemsString &&
						errors.lineItemsString[parseInt(idx, 10)] &&
						errors.lineItemsString[parseInt(idx, 10)].quantity &&
						touchedFields.lineItemsString &&
						touchedFields.lineItemsString[parseInt(idx, 10)] &&
						touchedFields.lineItemsString[parseInt(idx, 10)].quantity
						? 'is-invalid'
						: ''
						}`}
				/>
				{errors.lineItemsString &&
					errors.lineItemsString[parseInt(idx, 10)] &&
					errors.lineItemsString[parseInt(idx, 10)].quantity &&
					touchedFields.lineItemsString &&
					touchedFields.lineItemsString[parseInt(idx, 10)] &&
					touchedFields.lineItemsString[parseInt(idx, 10)].quantity && (
						<div className="invalid-feedback">
							{errors.lineItemsString[parseInt(idx, 10)].quantity}
						</div>
					)}
			</div>
		);
	};

	const renderUnitPrice = (cell, row, formProps) => {
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Input
				disabled
				type="text"
				min="0"
				maxLength="14,2"
				value={row['unitPrice'] !== 0 ? row['unitPrice'] : 0}
				onChange={(e) => {
					if (
						e.target.value === '' ||
						regDecimal.test(e.target.value)
					) {
						selectItem(
							e.target.value,
							row,
							'unitPrice',
						);
					}
				}}
				placeholder={strings.UnitPrice}
				className={`form-control ${errors.lineItemsString &&
					errors.lineItemsString[parseInt(idx, 10)] &&
					errors.lineItemsString[parseInt(idx, 10)].unitPrice &&
					touchedFields.lineItemsString &&
					touchedFields.lineItemsString[parseInt(idx, 10)] &&
					touchedFields.lineItemsString[parseInt(idx, 10)].unitPrice
					? 'is-invalid'
					: ''
					}`}
			/>
		);
	};

	const renderSubTotal = (cell, row, extraData) => {
		return row.subTotal === 0 ? customer_currency_symbol + " " + row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : customer_currency_symbol + " " + row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 });
	}

	const renderVatAmount = (cell, row, extraData) => {
		return row.vatAmount != 0 ? customer_currency_symbol + " " + row.vatAmount?.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : customer_currency_symbol + " " + "0.00";
	}

	const renderDiscount = (cell, row, formProps) => {
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<div>
				<div className="input-group">
					<Input
						disabled
						type="text"
						min="0"
						maxLength="14,2"
						value={row['discount'] !== 0 ? row['discount'] : 0}
						onChange={(e) => {
							if (e.target.value === '' || regDecimal.test(e.target.value)) {
								selectItem(
									e.target.value,
									row,
									'discount',
								);
							}
							updateAmountHandler(data);
						}}
						placeholder={strings.discount}
						className={`form-control
   									${errors.lineItemsString &&
							errors.lineItemsString[parseInt(idx, 10)] &&
							errors.lineItemsString[parseInt(idx, 10)].discount &&
							touchedFields.lineItemsString &&
							touchedFields.lineItemsString[parseInt(idx, 10)] &&
							touchedFields.lineItemsString[parseInt(idx, 10)].discount
							? 'is-invalid'
							: ''
							}`}
					/>
					<div className="dropdown open input-group-append">
						<div style={{ width: '100px' }}>
							<Select
								isDisabled={true}
								options={discountOptions}
								id="discountType"
								name="discountType"
								value={
									discountOptions && discountOptions.find((option) => option.value == row.discountType)
								}
								onChange={(e) => {
									selectItem(
										e.value,
										row,
										'discountType',
									);
									updateAmountHandler(data);
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const discountType = (row) => {
		return discountOptions &&
			selectOptionsFactory
				.renderOptions('label', 'value', discountOptions, 'discount')
				.find((option) => option.value === +row.discountType)
	}

	const validationCheck = (value) => {
		const data = {
			moduleType: 28,
			name: value ? value : '',
		};
		debitNoteCreateActions
			.checkValidation(data)
			.then((response) => {
				if (response.data === 'Credit Note Number does not exists') {
					setDebitNoteExist(false);
				} else {
					setDebitNoteExist(true);
				}
			});
	};

	const renderExcise = (cell, row, formProps) => {
		let idx;
		data.find((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Select
				styles={selectStyles}
				isDisabled={true}
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
				value={row.exciseTaxId ? excise_list && selectOptionsFactory
					.renderOptions('name', 'id', excise_list, 'Excise')
					.find((option) => option.value === +row.exciseTaxId)
					: ''
				}
				id="exciseTaxId"
				placeholder={strings.Select + strings.Excises}
				onChange={(e) => {
					selectItem(
						e.value,
						row,
						'exciseTaxId',
					);
					updateAmountHandler(data);
				}}
				className={`${errors.lineItemsString &&
					errors.lineItemsString[parseInt(idx, 10)] &&
					errors.lineItemsString[parseInt(idx, 10)].exciseTaxId &&
					touchedFields.lineItemsString &&
					touchedFields.lineItemsString[parseInt(idx, 10)] &&
					touchedFields.lineItemsString[parseInt(idx, 10)].exciseTaxId
					? 'is-invalid'
					: ''
					}`}
			/>
		);
	};

	const selectItem = (e, row, name) => {
		let newData = data;
		let idx;
		newData.map((obj, index) => {
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
			setValue(
				`lineItemsString.${idx}.${name}`,
				newData[parseInt(idx, 10)][`${name}`],
				{ shouldValidate: true }
			);
			updateAmountHandler(newData);
		} else {
			setData(newData);
			setValue(
				`lineItemsString.${idx}.${name}`,
				newData[parseInt(idx, 10)][`${name}`],
				{ shouldValidate: true }
			);
		}
	};

	const renderVat = (cell, row, formProps) => {
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Select
				isDisabled
				styles={selectStyles}
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
					selectItem(
						e.value,
						row,
						'vatCategoryId',
					);
				}}
				className={`${errors.lineItemsString &&
					errors.lineItemsString[parseInt(idx, 10)] &&
					errors.lineItemsString[parseInt(idx, 10)].vatCategoryId &&
					touchedFields.lineItemsString &&
					touchedFields.lineItemsString[parseInt(idx, 10)] &&
					touchedFields.lineItemsString[parseInt(idx, 10)].vatCategoryId
					? 'is-invalid'
					: ''
					}`}
			/>
		);
	};

	const prductValue = (e, row, name) => {
		let newData = data;
		const result = product_list.find((item) => item.id === parseInt(e));
		let idx;
		newData.map((obj, index) => {
			if (obj.id === row.id) {
				obj['unitPrice'] = result.unitPrice;
				obj['description'] = result.description;
				obj['discountType'] = result.discountType;
				obj['hsnOrSac'] = result.hsnOrSac;
				obj['taxPercentage'] = result.interStateTaxSlab ? result.interStateTaxSlab.taxPercentage :
					result.intraStateTaxSlab ? result.intraStateTaxSlab.taxPercentage : "0";
				obj['taxSlab'] = result.interStateTaxSlab ? result.interStateTaxSlab.interStateTaxSlab :
					result.intraStateTaxSlab ? result.intraStateTaxSlab.intraStateTaxSlab : "N/A";
				idx = index;
			}
			return obj;
		});
		setValue(
			`lineItemsString.${idx}.vatCategoryId`,
			result.vatCategoryId,
			{ shouldValidate: true }
		);
		setValue(
			`lineItemsString.${idx}.unitPrice`,
			result.unitPrice,
			{ shouldValidate: true }
		);
		setValue(
			`lineItemsString.${idx}.exciseTaxId`,
			result.exciseTaxId,
			{ shouldValidate: true }
		);
		setValue(
			`lineItemsString.${idx}.description`,
			result.description,
			{ shouldValidate: true }
		);
		setValue(
			`lineItemsString.${idx}.discountType`,
			result.discountType,
			{ shouldValidate: true }
		);
		updateAmountHandler(newData);
	};

	const renderProduct = (cell, row, formProps) => {
		let idx;
		data.find((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<>
				<Select
					isDisabled
					styles={selectStyles}
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
					id="productId"
					placeholder={strings.Select + strings.Product}
					onChange={(e) => {
						if (e && e.label !== 'Select Product') {
							selectItem(e.value, row, 'productId');
							prductValue(e.value, row, 'productId');
						} else {
							setValue(`lineItemsString.${idx}.productId`, e.value, { shouldValidate: true });
							setData([
								{
									id: 0,
									description: '',
									quantity: 1,
									unitPrice: '',
									vatCategoryId: '',
									subTotal: 0,
									productId: '',
								},
							]);
						}
					}}
					value={
						product_list && row.productId
							? selectOptionsFactory
								.renderOptions('name', 'id', product_list, 'Product')
								.find((option) => option.value === +row.productId)
							: ''
					}
					className={`${errors.lineItemsString &&
						errors.lineItemsString[parseInt(idx, 10)] &&
						errors.lineItemsString[parseInt(idx, 10)].productId &&
						touchedFields.lineItemsString &&
						touchedFields.lineItemsString[parseInt(idx, 10)] &&
						touchedFields.lineItemsString[parseInt(idx, 10)].productId
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
							selectItem(e.target.value, row, 'description');
						}}
						placeholder={strings.Description}
						className={`textarea ${errors.lineItemsString &&
							errors.lineItemsString[parseInt(idx, 10)] &&
							errors.lineItemsString[parseInt(idx, 10)].description &&
							touchedFields.lineItemsString &&
							touchedFields.lineItemsString[parseInt(idx, 10)] &&
							touchedFields.lineItemsString[parseInt(idx, 10)].description
							? 'is-invalid'
							: ''
							}`}
					/>
				</div>
			</>
		);
	};

	const purchaseCategoryFetch = () => {
		try {
			productActions.getTransactionCategoryListForPurchaseProduct(
				'10',
			).then((res) => {
				if (res.status === 200) {
					setPurchaseCategory(res.data);
				}
			});
		} catch (err) {
			console.log(err);
		}
	};

	const renderAccount = (cell, row, formProps) => {
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});
		const transactionCatory = purchaseCategory && row.transactionCategoryLabel ? purchaseCategory.find((item) => item.label === row.transactionCategoryLabel) : '';

		return (
			<Select
				styles={{
					menu: (provided) => ({ ...provided, zIndex: 9999 }),
				}}
				options={purchaseCategory ? purchaseCategory : []}
				id="transactionCategoryId"
				onChange={(e) => {
					selectItem(
						e.value,
						row,
						'transactionCategoryId',
					);
				}}
				value={
					purchaseCategory && row.transactionCategoryLabel && transactionCatory
						? transactionCatory.options.find(
							(item) => item.value === +row.transactionCategoryId,
						)
						: { value: row.transactionCategoryId, label: row.transactionCategoryLabel }
				}
				isDisabled={true}
				placeholder={strings.Select + strings.Account}
				className={`${errors.lineItemsString &&
					errors.lineItemsString[parseInt(idx, 10)] &&
					errors.lineItemsString[parseInt(idx, 10)]
						.transactionCategoryId &&
					touchedFields.lineItemsString &&
					touchedFields.lineItemsString[parseInt(idx, 10)] &&
					touchedFields.lineItemsString[parseInt(idx, 10)]
						.transactionCategoryId
					? 'is-invalid'
					: ''
					}`}
			/>
		);
	};

	const deleteRow = (e, row) => {
		const id = row['id'];
		let newData = [];
		e.preventDefault();
		const currentData = data;
		newData = currentData.filter((obj) => obj.id !== id);
		setValue('lineItemsString', newData, { shouldValidate: true });
		updateAmountHandler(newData);
	};

	const renderActions = (cell, rows, formProps) => {
		return (
			<Button
				size="sm"
				className="btn-twitter btn-brand icon mt-1"
				disabled={data.length === 1 ? true : false}
				onClick={(e) => {
					deleteRow(e, rows);
				}}
			>
				<i className="fas fa-trash"></i>
			</Button>
		);
	};

	const updateAmountHandler = (currentData) => {
		const list = ProductTableCalculation.updateAmount(currentData ? currentData : [], vat_list, taxType);
		setData(list.data);
		setValue('totalNet', list.totalNet ? list.totalNet : 0);
		setValue('totalVatAmount', list.totalVatAmount ? list.totalVatAmount : 0);
		setValue('totalAmount', list.totalAmount ? list.totalAmount : 0);
		setValue('total_excise', list.total_excise ? list.total_excise : 0);
		setValue('totalDiscount', list.discount ? list.discount : 0);
	};

	const handleFileChange = (e) => {
		e.preventDefault();
		let reader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			reader.onloadend = () => { };
			reader.readAsDataURL(file);
			setValue('attachmentFile', file, { shouldValidate: true });
		}
	};

	const onSubmit = (formData) => {
		setDisableLeavePage(true);
		if (createMore === true) {
			setDisabled1(true);
		} else {
			setDisabled(true);
		}

		const {
			debitNoteNumber,
			email,
			debitNoteDate,
			referenceNumber,
			contact_po_number,
			receiptAttachmentDescription,
			notes,
			debitAmount,
			invoiceNumber,
			currency,
			contactId,
			exchangeRate,
		} = formData;

		const postData = new FormData();
		postData.append('isCreatedWithoutInvoice', isCreatedWithoutInvoice);
		postData.append('isCreatedWIWP', isDNWIWithoutProduct);
		postData.append('creditNoteNumber', debitNoteNumber ? debitNoteNumber : '',);
		postData.append('email', email ? email : '',);
		postData.append('creditNoteDate', debitNoteDate ? dayjs(debitNoteDate, 'DD-MM-YYYY').toDate() : null,);
		postData.append('referenceNo', referenceNumber !== null ? referenceNumber : '',);
		postData.append('exchangeRate', exchangeRate ? exchangeRate : 1);
		postData.append('contactPoNumber', contact_po_number !== null ? contact_po_number : '',);
		postData.append('receiptAttachmentDescription', receiptAttachmentDescription !== null ? receiptAttachmentDescription : '',);
		postData.append('notes', notes !== null ? notes : '');
		postData.append('type', 13);
		postData.append('isReverseChargeEnabled', isReverseChargeEnabled);
		if (isDNWIWithoutProduct === true)
			postData.append('totalAmount', debitAmount);

		postData.append('vatCategoryId', 2);
		postData.append('taxType', taxType ? taxType : false);

		if (invoiceNumber) {
			postData.append('invoiceId', invoiceNumber.value ? invoiceNumber.value : invoiceNumber);
			postData.append('cnCreatedOnPaidInvoice', '1');
		}
		if (!isDNWIWithoutProduct) {
			postData.append('lineItemsString', JSON.stringify(data));
			postData.append('totalVatAmount', getValues('totalVatAmount'));
			postData.append('totalAmount', getValues('totalAmount'));
			postData.append('discount', getValues('totalDiscount'));
			postData.append('totalExciseTaxAmount', getValues('total_excise'));
		}
		if (contactId) {
			postData.append('contactId', contactId.value ? contactId.value : contactId);
		}
		if (currency) {
			postData.append('currency', currency.value ? currency.value : currency);
		}
		if (uploadFile && uploadFile.current && uploadFile.current.files && uploadFile.current.files[0]) {
			postData.append('attachmentFile', uploadFile.current.files[0]);
		}
		debitNoteCreateActions
			.createDebitNote(postData)
			.then((res) => {
				setDisabled(false);
				setDisabled1(false);
				setLoading(false);
				commonActions.tostifyAlert('success', strings.DebitNoteCreatedSuccessfully);
				if (createMore) {
					debitNoteActions.getInvoiceListForDropdown();
					setRemainingInvoiceAmount('');
					setDisableLeavePage(false);
					setCreateMore(false);
					setSelectedContact('');
					setLockInvoiceDetail(false);
					setData([{
						id: 0,
						description: '',
						quantity: 1,
						unitPrice: '',
						subTotal: 0,
						productId: '',
						vatCategoryId: '',
						exciseTaxId: '',
						exciseAmount: '',
						vatAmount: 0,
						isExciseTaxExclusive: '',
						discountType: 'FIXED',
						discount: 0,
						unitType: '',
						unitTypeId: ''
					}]);
					form.reset({
						invoiceNumber: '',
						receiptAttachmentDescription: '',
						referenceNumber: '',
						contact_po_number: '',
						currency: '',
						debitNoteDate: new Date(),
						contactId: '',
						exchangeRate: 1,
						lineItemsString: data,
						taxType: false,
						debitNoteNumber: '',
						totalNet: 0,
						invoiceVATAmount: 0,
						totalVatAmount: 0,
						totalAmount: 0,
						isReverseChargeEnabled: false,
						notes: '',
						email: '',
						totalDiscount: 0,
						discountPercentage: '',
						discountType: 'FIXED',
						debitAmount: '',
						total_excise: 0,
						customer_currency_symbol: '',
						taxTreatmentId: '',
					});
					getInvoiceNo();
				} else {
					history.push('/admin/expense/debit-notes');
				}
			})
			.catch((err) => {
				setDisableLeavePage(false);
				setDisabled(false);
				setDisabled1(false);
				setLoading(false);
				commonActions.tostifyAlert(
					'error', strings.DebitNoteCreatedUnSuccessfully,
				);
			});
	};

	const getInvoiceNo = () => {
		debitNoteCreateActions.getInvoiceNo().then((res) => {
			if (res.status === 200) {
				setValue('debitNoteNumber', res.data, { shouldValidate: true });
				validationCheck(res.data);
			}
		});
	};

	const getCurrency = (opt) => {
		let currency;
		customer_list.map(item => {
			if (item.label.contactId == opt) {
				currency = item.label.currency.currencyCode;
				setValue('currency', currency, { shouldValidate: true });
				setValue('customer_currency_symbol', item.label.currency.currencyIsoCode, { shouldValidate: true });
				setCustomerCurrencySymbol(item.label.currency.currencyIsoCode);
			}
		})
		return currency;
	}

	const getTaxTreatment = (opt) => {
		customer_list.map(item => {
			if (item.label.contactId == opt) {
				setValue('taxTreatmentId', { label: item.label.taxTreatment.taxTreatment, value: item.label.taxTreatment.id }, { shouldValidate: true });
			}
		});
	}

	const getInvoiceDetails = (value) => {
		if (value) {
			debitNoteActions
				.getInvoiceById(value).then((response) => {
					if (response.status = 200) {
						const custmerName = {
							label: response.data.organisationName === '' ? response.data.name : response.data.organisationName,
							value: response.data.contactId,
						}
						const date = response.data.receiptDate ? new Date(dayjs(response.data.receiptDate, 'YYYY-MM-DD').format()) : new Date();
						setReceiptDate(date);
						setData(response.data.invoiceLineItems ? response.data.invoiceLineItems : []);
						setTaxType(response.data.taxType ? response.data.taxType : false);
						setRemainingInvoiceAmount(response.data.remainingInvoiceAmount);
						setShippingCharges(response.data.shippingCharges ? response.data.shippingCharges : 0);
						setCustomerCurrencySymbol(response.data.currencyIsoCode ? response.data.currencyIsoCode : '');
						setIsReverseChargeEnabled(response.data.isReverseChargeEnabled);

						setValue('currency', response.data.currencyCode ? response.data.currencyCode : '');
						setValue('lineItemsString', response.data.invoiceLineItems ? response.data.invoiceLineItems : []);
						setValue('totalAmount', response.data.totalAmount);
						setValue('totalDiscount', response.data.discount);
						setValue('taxTreatmentId', response.data.taxTreatment ? response.data.taxTreatment : '');
						setValue('exchangeRate', response.data.exchangeRate ? response.data.exchangeRate : 1);
						setValue('contactId', custmerName, { shouldValidate: true });
						setValue('remainingInvoiceAmount', response.data.remainingInvoiceAmount, { shouldValidate: true });

						updateAmountHandler(response.data.invoiceLineItems ? response.data.invoiceLineItems : []);
						getTaxTreatment(custmerName.value);
						getCurrency(custmerName.value);
					}
				});
		}
	}

	const { isRegisteredVat, isDesignatedZone } = company_details;
	let tmpCustomer_list = []
	customer_list.map(item => {
		let obj = { label: item.label.contactName, value: item.value }
		tmpCustomer_list.push(obj)
	})

	// Custom validation for dynamic fields
	const validateForm = (values) => {
		const customErrors = {};

		if (values.debitNoteNumber && debitNoteExist) {
			customErrors.debitNoteNumber = strings.DebitNoteNumberAlreadyExists;
		}

		if (!isCreatedWithoutInvoice && !values.invoiceNumber) {
			customErrors.invoiceNumber = 'Invoice number is required';
		}

		if ((isDNWIWithoutProduct || isCreatedWithoutInvoice) && !values.debitAmount)
			customErrors.debitAmount = 'Debit Amount is Required';

		if (invoiceSelected && (parseFloat(getValues('totalAmount')) > parseFloat(remainingInvoiceAmount))) {
			customErrors.totalAmount = 'Invoice Total Amount Cannot be greater than  Remaining Invoice Amount';
		}
		if (invoiceSelected && isDNWIWithoutProduct && values.debitAmount && parseFloat(values.debitAmount) > parseFloat(remainingInvoiceAmount)) {
			customErrors.debitAmount = strings.AmountCannotBeGreaterThanTheInvoiceamount;
		}

		// Set custom errors
		Object.keys(customErrors).forEach((key) => {
			setFormError(key, { type: 'manual', message: customErrors[key] });
		});

		return Object.keys(customErrors).length === 0;
	};

	const handleFormSubmit = (data) => {
		if (validateForm(data)) {
			onSubmit(data);
		}
	};

	return (
		<div className="create-customer-invoice-screen" >
			<div className="animated fadeIn">
				<Row>
					<Col lg={12} className="mx-auto">
						<Card>
							<CardHeader>
								<Row>
									<Col lg={12}>
										<div className="h4 mb-0 d-flex align-items-center">
											<i className="fa fa-credit-card" />
											<span className="ml-2">{strings.CreateDebitNote}</span>
										</div>
									</Col>
								</Row>
							</CardHeader>
							<CardBody>
								<Row>
									<Col lg={12}>
										<Form onSubmit={handleSubmit(handleFormSubmit)}>
											{!isCreatedWithoutInvoice && (<Row>
												<Col lg={3}>
													<FormGroup className="mb-3">
														<Label htmlFor="invoiceNumber"><span className="text-danger">* </span>
															{strings.InvoiceNumber}
														</Label>
														<Controller
															name="invoiceNumber"
															control={control}
															render={({ field }) => (
																<Select
																	{...field}
																	isDisabled={lockInvoiceDetail}
																	id="invoiceNumber"
																	placeholder={strings.Select + strings.InvoiceNumber}
																	options={
																		invoice_list ? selectOptionsFactory.renderOptions(
																			'label',
																			'value',
																			invoice_list,
																			'Invoice Number',
																		) : []
																	}
																	value={field.value?.value ? field.value : invoice_list && selectOptionsFactory.renderOptions(
																		'label',
																		'value',
																		invoice_list,
																		'Invoice Number',).find(obj => obj.value === field.value)
																	}
																	onChange={(option) => {
																		if (option && option.value) {
																			setInvoiceSelected(true);
																			field.onChange(option);
																			setValue('referenceNumber', option.label);
																			getInvoiceDetails(option.value);
																		} else {
																			setInvoiceSelected(false);
																			field.onChange('');
																			setValue('referenceNumber', '');
																		}
																	}}
																	className={
																		errors.invoiceNumber && touchedFields.invoiceNumber
																			? 'is-invalid'
																			: ''
																	}
																	styles={selectStyles}
																/>
															)}
														/>
														{errors.invoiceNumber &&
															touchedFields.invoiceNumber && (
																<div className="invalid-feedback">
																	{errors.invoiceNumber.message}
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
														<Controller
															name="debitNoteNumber"
															control={control}
															render={({ field }) => (
																<Input
																	{...field}
																	maxLength="50"
																	type="text"
																	id="debitNoteNumber"
																	placeholder={strings.DebitNoteNumber}
																	onChange={(e) => {
																		const option = e.target.value;
																		if (option === '') {
																			setDebitNoteExist(false);
																			field.onChange('');
																		} else if (regExDNNum.test(option)) {
																			field.onChange(option);
																			setDebitNoteExist(false);
																			validationCheck(option);
																		}
																	}}
																	className={
																		errors.debitNoteNumber &&
																			touchedFields.debitNoteNumber
																			? 'is-invalid'
																			: ''
																	}
																/>
															)}
														/>
														{errors.debitNoteNumber &&
															touchedFields.debitNoteNumber && (
																<div className="invalid-feedback">
																	{errors.debitNoteNumber.message}
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
														<Controller
															name="contactId"
															control={control}
															render={({ field }) => (
																<Select
																	{...field}
																	id="contactId"
																	placeholder={strings.Select + strings.SupplierName}
																	options={
																		tmpCustomer_list
																			? selectOptionsFactory.renderOptions(
																				'label',
																				'value',
																				tmpCustomer_list,
																				'Supplier',
																			)
																			: []
																	}
																	isDisabled={invoiceSelected}
																	onChange={(option) => {
																		if (option && option.value) {
																			setValue('currency', getCurrency(option.value), { shouldValidate: true });
																			getTaxTreatment(option.value);
																			field.onChange(option);
																		} else {
																			field.onChange('');
																		}
																	}}
																	className={
																		errors.contactId &&
																			touchedFields.contactId
																			? 'is-invalid'
																			: ''
																	}
																	styles={selectStyles}
																/>
															)}
														/>
														{errors.contactId &&
															touchedFields.contactId && (
																<div className="invalid-feedback">
																	{errors.contactId.message}
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
															<Controller
																name="taxTreatmentId"
																control={control}
																render={({ field }) => (
																	<Select
																		{...field}
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
																		placeholder={strings.Select + strings.TaxTreatment}
																		value={field.value?.value ? field.value :
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
																						option.label === field.value,
																				)
																		}
																		className={
																			errors.taxTreatmentId &&
																				touchedFields.taxTreatmentId
																				? 'is-invalid'
																				: ''
																		}
																		styles={selectStyles}
																	/>
																)}
															/>
															{errors.taxTreatmentId &&
																touchedFields.taxTreatmentId && (
																	<div className="invalid-feedback">
																		{errors.taxTreatmentId.message}
																	</div>
																)}
														</FormGroup>
													</Col>
												}
											</Row>
											<Row>
												<Col lg={3}>
													<FormGroup className="mb-3">
														<Label htmlFor="date">
															<span className="text-danger">* </span>
															Debit Note Date
														</Label>
														<Controller
															name="debitNoteDate"
															control={control}
															render={({ field }) => (
																<DatePicker
																	{...field}
																	id="debitNoteDate"
																	placeholderText={strings.Enter + strings.DebitNote + strings.Date}
																	showMonthDropdown
																	showYearDropdown
																	dateFormat="dd-MM-yyyy"
																	dropdownMode="select"
																	minDate={receiptDate}
																	selected={field.value}
																	onChange={(value) => {
																		field.onChange(value);
																	}}
																	className={`form-control ${errors.debitNoteDate &&
																		touchedFields.debitNoteDate
																		? 'is-invalid'
																		: ''
																		}`}
																/>
															)}
														/>
														{errors.debitNoteDate &&
															touchedFields.debitNoteDate && (
																<div className="invalid-feedback">
																	{errors.debitNoteDate.message?.includes("nullable()") ? strings.Debit_Note_Date_Is_Required : errors.debitNoteDate.message}
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
														<Controller
															name="currency"
															control={control}
															render={({ field }) => (
																<Select
																	{...field}
																	isDisabled={true}
																	styles={selectStyles}
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
																	value={field.value?.value ? field.value :
																		currency_convert_list && selectCurrencyFactory.renderOptions(
																			'currencyName',
																			'currencyCode',
																			currency_convert_list,
																			'Currency',
																		).find((option) => option.value === field.value)
																	}
																	className={
																		errors.currency &&
																			touchedFields.currency
																			? 'is-invalid'
																			: ''
																	}
																/>
															)}
														/>
														{errors.currency &&
															touchedFields.currency && (
																<div className="invalid-feedback">
																	{errors.currency.message}
																</div>
															)}
													</FormGroup>
												</Col>

												{(isDNWIWithoutProduct === false || invoiceSelected == true) && (<Col lg={3}>
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
															value={remainingInvoiceAmount}
														/>
														{errors.remainingInvoiceAmount &&
															(
																<div className="text-danger">
																	{errors.remainingInvoiceAmount.message}
																</div>
															)}
													</FormGroup>
												</Col>)}

												{isDNWIWithoutProduct === true && (
													<Col lg={3}>
														<FormGroup className="mb-3">
															<Label htmlFor="debitAmount"><span className="text-danger">* </span>
																Debit Amount
															</Label>
															<Controller
																name="debitAmount"
																control={control}
																render={({ field }) => (
																	<Input
																		{...field}
																		type="text"
																		id="debitAmount"
																		placeholder={strings.Enter + " Debit Amount"}
																		onChange={(e) => {
																			const value = e.target.value;
																			if ((value === '' || regDecimal.test(value))
																				&& parseFloat(value) !== 0)
																				field.onChange(value);
																		}}
																		className={
																			errors.debitAmount &&
																				touchedFields.debitAmount
																				? 'is-invalid'
																				: ''
																		}
																	/>
																)}
															/>
															{errors.debitAmount &&
																touchedFields.debitAmount &&
																(<div className="invalid-feedback">
																	{errors.debitAmount.message}
																</div>)}
														</FormGroup>
													</Col>
												)}
											</Row>
											<hr />
											{!isCreatedWithoutInvoice && !isDNWIWithoutProduct && (
												<Row>
													<Col lg={8} className="mb-3">
													</Col>
													<Col>
														{taxType === false ?
															<span style={{ color: "#0069d9" }} className='mr-4'><b>{strings.Exclusive}</b></span> :
															<span className='mr-4'>{strings.Exclusive}</span>}
														<Switch
															value={taxType}
															checked={taxType}
															disabled
															onChange={(newTaxType) => {
																setTaxType(newTaxType);
																updateAmountHandler(data);
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
														{taxType === true ?
															<span style={{ color: "#0069d9" }} className='ml-4'><b>{strings.Inclusive}</b></span>
															: <span className='ml-4'>{strings.Inclusive}</span>
														}
													</Col>
												</Row>)}

											{isDNWIWithoutProduct === false && data && data.length > 0 && (<Row>
												{errors.lineItemsString &&
													typeof errors.lineItemsString ===
													'string' && (
														<div
															className={
																errors.lineItemsString
																	? 'is-invalid'
																	: ''
															}
														>
															<div className="invalid-feedback">
																{errors.lineItemsString.message}
															</div>
														</div>
													)}
												<Col lg={12}>
													<BootstrapTable
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
																renderActions(cell, rows)
															}
														></TableHeaderColumn>
														<TableHeaderColumn
															width="20%"
															dataField="product"
															dataFormat={(cell, rows) =>
																renderProduct(cell, rows)
															}
														>
															{strings.PRODUCT}
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="account"
															dataFormat={(cell, rows) =>
																renderAccount(cell, rows)
															}
														>
															{strings.Account}
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="quantity"
															dataFormat={(cell, rows) =>
																renderQuantity(cell, rows)
															}
														>
															{strings.QUANTITY}
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="unitPrice"
															dataFormat={(cell, rows) =>
																renderUnitPrice(cell, rows)
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
														{getValues('totalDiscount') != 0 &&
															<TableHeaderColumn
																dataField="discount"
																dataFormat={(cell, rows) =>
																	renderDiscount(cell, rows)
																}
															>
																Discount Type
															</TableHeaderColumn>
														}
														{getValues('total_excise') != 0 &&
															<TableHeaderColumn
																width="10%"
																dataField="exciseTaxId"
																dataFormat={(cell, rows) =>
																	renderExcise(cell, rows)
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
																width={"250px"}
																dataField="vat"
																dataFormat={(cell, rows) =>
																	renderVat(cell, rows)
																}
															>
																{strings.VAT}
															</TableHeaderColumn>
														}
														{isRegisteredVat &&
															<TableHeaderColumn
																dataField="vat_amount"
																dataFormat={renderVatAmount}
																className="text-right"
																columnClassName="text-right"
																formatExtraData={universal_currency_list}
															>
																{strings.VATAMOUNT}
															</TableHeaderColumn>
														}
														<TableHeaderColumn
															dataField="sub_total"
															dataFormat={renderSubTotal}
															className="text-right"
															columnClassName="text-right"
															formatExtraData={universal_currency_list}
														>
															{strings.SUBTOTAL}
														</TableHeaderColumn>
													</BootstrapTable>
												</Col>
											</Row>)}
											{isDNWIWithoutProduct === false && data && data.length > 0 && isRegisteredVat && <Row>
												<Col className="ml-4">
													{isReverseChargeEnabled === true
														? <FormGroup className="mb-3">
															<Input
																type="checkbox"
																id="isReverseChargeEnabled"
																checked={isReverseChargeEnabled}
																value={isReverseChargeEnabled}
																onChange={(e) => {
																	setIsReverseChargeEnabled(isReverseChargeEnabled);
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
															<Controller
																name="referenceNumber"
																control={control}
																render={({ field }) => (
																	<Input
																		{...field}
																		type="text"
																		maxLength="20"
																		id="referenceNumber"
																		placeholder={strings.ReceiptNumber}
																		className={errors.referenceNumber && touchedFields.referenceNumber ? "is-invalid" : " "}
																	/>
																)}
															/>
															{errors.referenceNumber && touchedFields.referenceNumber && (
																<div className="invalid-feedback">{errors.referenceNumber.message}</div>
															)}
														</FormGroup>}
														<FormGroup className="py-2">
															<Label htmlFor="notes">
																{strings.Notes}
															</Label><br />
															<Controller
																name="notes"
																control={control}
																render={({ field }) => (
																	<TextField
																		{...field}
																		type="textarea"
																		multiline
																		style={{ width: "500px" }}
																		className="textarea"
																		inputProps={{ maxLength: 255 }}
																		id="notes"
																		maxRows={4}
																		placeholder={strings.DeliveryNotes}
																	/>
																)}
															/>
														</FormGroup>
													</Col>
												</Col>
												{isDNWIWithoutProduct === false && (<Col lg={5}>
													<div className="">
														{getValues('total_excise') == 0 ? null : (
															<div className="total-item p-2" >
																<Row>
																	<Col lg={6}>
																		<h5 className="mb-0 text-right">
																			{strings.TotalExcise}
																		</h5>
																	</Col>
																	<Col lg={6} className="text-right">
																		<label className="mb-0">
																			{customer_currency_symbol} &nbsp;
																			{getValues('total_excise').toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																		</label>
																	</Col>
																</Row>
															</div>
														)}
														{getValues('totalDiscount') == 0 ? null : (
															<div className="total-item p-2">
																<Row>
																	<Col lg={6}>
																		<h5 className="mb-0 text-right">
																			{strings.Discount}
																		</h5>
																	</Col>
																	<Col lg={6} className="text-right">
																		<label className="mb-0">
																			{customer_currency_symbol} &nbsp;
																			{getValues('totalDiscount').toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
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
																		{customer_currency_symbol} &nbsp;
																		{getValues('totalNet').toLocaleString(navigator.language, { minimumFractionDigits: 2 })}

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
																			{customer_currency_symbol} &nbsp;
																			{getValues('totalVatAmount').toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
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
																		{customer_currency_symbol} &nbsp;
																		{getValues('totalAmount').toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																	</label>
																</Col>
																{errors.totalAmount &&
																	touchedFields.totalAmount &&
																	<Col className="invalid-feedback d-block text-right">
																		{errors.totalAmount.message}
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
													<FormGroup className="text-right w-100">
														<Button
															type="button"
															color="primary"
															className="btn-square mr-3"
															disabled={disabled}
															onClick={() => {
																console.log(errors);
																setCreateMore(false);
																handleSubmit(handleFormSubmit)();
															}}
														>
															<i className="fa fa-dot-circle-o"></i>{' '}
															{disabled
																? 'Creating...'
																: strings.Create}
														</Button>
														{!location?.state?.invoiceID && <Button
															type="button"
															color="primary"
															className="btn-square mr-3"
															disabled={disabled1}
															onClick={() => {
																setCreateMore(true);
																handleSubmit(handleFormSubmit)();
															}}
														>
															<i className="fa fa-refresh"></i>{' '}
															{disabled1
																? 'Creating...'
																: strings.CreateandMore}
														</Button>}
														<Button
															color="secondary"
															className="btn-square"
															onClick={() => {
																if (location?.state?.invoiceID)
																	history.push(
																		'/admin/expense/supplier-invoice',
																	);
																else
																	history.push(
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
									</Col>
								</Row>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
			{disableLeavePage ? "" : <LeavePage />}
		</div>
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CreateDebitNote);
