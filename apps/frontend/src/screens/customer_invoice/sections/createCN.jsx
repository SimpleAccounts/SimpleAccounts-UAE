import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import { EditorState } from 'draft-js';
import { selectOptionsFactory } from 'utils';
import DatePicker from 'react-datepicker';
import dayjs from '@/utils/date';
import * as RequestForQuotationDetailsAction from '../screens/detail/actions';
import { bindActionCreators } from 'redux';
import * as RequestForQuotationAction from '../screens/detail/actions';
import { CommonActions } from 'services/global';
import * as CurrencyConvertActions from '../../currencyConvert/actions';
import { toast } from 'sonner';
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/ui/data-table';

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
		currency_convert_list: state.common.currency_convert_list,
		rfqReceiveDate: state.rfqReceiveDate,
		excise_list: state.customer_invoice.excise_list,
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

// Zod validation schema
const createCreditNoteSchema = z.object({
	creditNoteDate: z.date({
		required_error: 'Tax credit note date is required',
		invalid_type_error: 'Tax credit note date is required',
	}),
	invoiceNumber: z.string().optional(),
	creditNoteNumber: z.string().optional(),
	contactId: z.union([z.string(), z.number()]).optional(),
	receiptAttachmentDescription: z.string().optional(),
	receiptNumber: z.string().optional(),
	contact_po_number: z.string().optional(),
	currency: z.string().optional(),
	invoiceLineItems: z.array(
		z.object({
			quantity: z.union([z.string(), z.number()]),
			unitPrice: z.union([z.string(), z.number()]),
			vatCategoryId: z.union([z.string(), z.number()]),
			productId: z.union([z.string(), z.number()]),
		})
	),
	notes: z.string().optional(),
	email: z.string().optional(),
	attachmentFile: z.any().optional(),
});

const CreateCreditNoteModal = (props) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [discountOptions] = useState([
		{ value: 'FIXED', label: 'Fixed' },
		{ value: 'PERCENTAGE', label: 'Percentage' },
	]);
    // State initialization simplifed for DataTable integration
	const [prefixData, setPrefixData] = useState('');
	const [selectedData, setSelectedData] = useState({});
	const [totalAmount, setTotalAmount] = useState(0);
	const [totalVatAmount, setTotalVatAmount] = useState(0);
	const [total_net, setTotalNet] = useState(0);
	const [totalExciseAmount, setTotalExciseAmount] = useState(0);
	const [invoiceNumber, setInvoiceNumber] = useState('');
	const [id, setId] = useState('');
	const [disabled, setDisabled] = useState(false);
    const [fileName, setFileName] = useState('');

	const uploadFileRef = useRef(null);
	const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	const regEx = /^[0-9\d]+$/;

	const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm({
		resolver: zodResolver(createCreditNoteSchema),
		defaultValues: {
			creditNoteDate: new Date(),
			poReceiveDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
			supplierId: '',
			invoiceNumber:'',
			receiptAttachmentDescription: '',
			receiptNumber: '',
			contact_po_number: '',
			currency: '',
			contactId: '',
			invoiceLineItems: [],
			creditNoteNumber: '',
			total_net: 0,
			invoiceVATAmount: 0,
			totalVatAmount: 0,
			term: '',
			totalAmount: 0,
			notes: '',
			type: 4,
			discount: 0,
			discountPercentage: '',
			discountType: 'FIXED',
			creditAmount:0,
			total_excise: 0,
		},
	});

	useEffect(() => {
		if (props.selectedData !== selectedData || props.totalAmount !== totalAmount ||
			props.totalVatAmount !== totalVatAmount) {
			let netVal = 0;
			let totalvat = 0;
			let totalexcise = 0;

			if (props.selectedData && props.selectedData.invoiceLineItems) {
				props.selectedData.invoiceLineItems.map((item) => {
					totalvat += item.vatAmount;
					totalexcise += item.exciseAmount;
					return netVal += item.subTotal;
				});
			}

			setPrefixData(props.prefixData);
			setSelectedData(props.selectedData);
			setTotalAmount(netVal);
			setTotalExciseAmount(props.totalExciseAmount);
			setTotalVatAmount(props.totalVatAmount);
			setInvoiceNumber(props.invoiceNumber);
			setId(props.id);
			setTotalNet(netVal - parseFloat(totalvat) - parseFloat(totalexcise));
		}
	}, [props.selectedData, props.totalAmount, props.totalVatAmount, props.prefixData, props.invoiceNumber, props.id, props.totalExciseAmount]);

	const selectItem = (e, row, name) => {
		let currentData = selectedData.invoiceLineItems;
		let idx;
		currentData.map((obj, index) => {
			if (obj.id === row.id) {
				obj[`${name}`] = e;
				idx = index;
			}
			return obj;
		});

		if (name === 'unitPrice' || name === 'vatCategoryId' || name === 'quantity') {
			setValue(`invoiceLineItems.${idx}.${name}`, e);
			updateAmount(currentData);
		} else {
			const newSelectedData = {...selectedData, invoiceLineItems: currentData};
			setSelectedData(newSelectedData);
			setValue(`invoiceLineItems.${idx}.${name}`, e);
			updateAmount(currentData);
		}
	};

    const updateAmount = (dataItems) => {
		const { vat_list } = props;
		let total_net_calc = 0;
		let total_excise_calc = 0;
		let total_calc = 0;
		let total_vat_calc = 0;
		let discount_calc = 0;

		const totalnetamount = (a) => {
			total_net_calc = total_net_calc + a;
		};
		const totalexcise = (a) => {
			total_excise_calc = total_excise_calc + a;
		};
		const totalvat = (a) => {
			total_vat_calc = total_vat_calc + a;
		};
		const totalamount = (a) => {
			total_calc = total_calc + a;
		};
		const discountamount = (a) => {
			discount_calc = discount_calc + a;
		};

		dataItems.map((obj) => {
			const index = obj.vatCategoryId !== ''
				? vat_list.findIndex((item) => item.id === +obj.vatCategoryId)
				: '';
			const vat = index !== '' ? vat_list[`${index}`].vat : 0;

			if (obj.taxType) {
				const totalwithouttax = parseFloat(obj.unitPrice) * parseInt(obj.quantity);
				const discounvalue = obj.discountType === 'PERCENTAGE'
					? (totalwithouttax * obj.discount) / 100
					: obj.discountType === 'FIXED' && obj.discount;
				const totalAfterdiscount = totalwithouttax - discounvalue;

				const excisevalue = obj.exciseTaxId === 1
					? totalAfterdiscount / 2
					: obj.exciseTaxId === 2
						? totalAfterdiscount
						: 0;
				const totalwithexcise = excisevalue + totalAfterdiscount;
				const vatvalue = (totalwithexcise * vat) / 100;

				const finaltotalamount = totalwithexcise + vatvalue;
				totalnetamount(totalwithouttax);
				totalexcise(excisevalue);
				totalvat(vatvalue);
				totalamount(finaltotalamount);
				discountamount(discounvalue);
				obj.subTotal = totalwithouttax + vatvalue + excisevalue - discounvalue;
				obj.vatAmount = vatvalue;
				obj.exciseAmount = excisevalue;
			} else {
				const totalwithtaxandexcise = parseFloat(obj.unitPrice) * parseInt(obj.quantity);
				const discounvalue = obj.discountType === 'PERCENTAGE'
					? (totalwithtaxandexcise * obj.discount) / 100
					: obj.discountType === 'FIXED' && obj.discount;
				const totalwitoutdiscount = totalwithtaxandexcise - discounvalue;
				const vatvalue = (totalwitoutdiscount * vat) / (100 + vat);
				const totalwithoutvat = totalwitoutdiscount - vatvalue;
				const excisevalue = obj.exciseTaxId === 1
					? totalwithoutvat / 3
					: obj.exciseTaxId === 2
						? totalwithoutvat / 2
						: 0;
				const finaltotalamount = totalwithoutvat - excisevalue;
				totalnetamount(totalwithtaxandexcise - (discounvalue + excisevalue + vatvalue));

				totalexcise(excisevalue);
				totalvat(vatvalue);
				totalamount(totalwitoutdiscount);
				discountamount(discounvalue);
				obj.subTotal = totalwitoutdiscount;
				obj.vatAmount = vatvalue;
				obj.exciseAmount = excisevalue;
			}

			return obj;
		});

		// setSelectedData({...selectedData, invoiceLineItems: dataItems}); // This causes loop if not careful?
        // updateAmount is called by selectItem which updates selectedData first.
        // But here we need to update state with calculations.
        const newSelectedData = {...selectedData, invoiceLineItems: dataItems};
        if (JSON.stringify(newSelectedData) !== JSON.stringify(selectedData)) {
             setSelectedData(newSelectedData);
        }
        
		setTotalNet(total_net_calc);
		setTotalVatAmount(total_vat_calc);
		setTotalAmount(total_calc);
		setTotalExciseAmount(total_excise_calc);

		props.updateParentAmount(total_net_calc, total_vat_calc, total_excise_calc);
	};

    const deleteRow = (e, row) => {
		const rowId = row['id'];
		let newData = [];
		e.preventDefault();
		const currentData = selectedData.invoiceLineItems;
		newData = currentData.filter((obj) => obj.id !== rowId);
		let updatedSelectedData = {...selectedData};
		updatedSelectedData.invoiceLineItems = newData;
		setSelectedData(updatedSelectedData);
		props.updateParentSelelectedData(updatedSelectedData);
		setValue('invoiceLineItems', newData);
		updateAmount(newData);
	};

	const prductValue = (e, row, name) => {
		const { product_list } = props;
		let currentData = selectedData.invoiceLineItems;
		const result = product_list.find((item) => item.id === parseInt(e));
		let idx;
		currentData.map((obj, index) => {
			if (obj.id === row.id) {
				obj['unitPrice'] = result.unitPrice;
				obj['vatCategoryId'] = result.vatCategoryId;
				obj['description'] = result.description;
				idx = index;
			}
			return obj;
		});

		setValue(`invoiceLineItems.${idx}.vatCategoryId`, result.vatCategoryId);
		setValue(`invoiceLineItems.${idx}.unitPrice`, result.unitPrice);
		setValue(`invoiceLineItems.${idx}.description`, result.description);
		updateAmount(currentData);
	};

    const columns = useMemo(() => {
        if (!selectedData.invoiceLineItems) return [];
        return [
            {
                accessorKey: 'action',
                header: '',
                size: 50,
                cell: ({ row }) => row.original['productId'] != '' ? (
                    <Button
                        size="sm"
                        className="btn-twitter btn-brand icon"
                        disabled={selectedData.invoiceLineItems.length === 1}
                        onClick={(e) => deleteRow(e, row.original)}
                    >
                        <i className="fas fa-trash"></i>
                    </Button>
                ) : null
            },
            {
                accessorKey: 'productId',
                header: strings.PRODUCT,
                size: 200,
                cell: ({ row }) => {
                    const idx = row.index;
                    return (
                        <>
                            <Select
                                isDisabled={true}
                                styles={customStyles}
                                options={props.product_list ? selectOptionsFactory.renderOptions('name', 'id', props.product_list, 'Product') : []}
                                value={props.product_list && selectOptionsFactory.renderOptions('name', 'id', props.product_list, 'Product').find((option) => option.value === +row.original.productId)}
                                onChange={(e) => {
                                    if (e && e.label !== 'Select Product') {
                                        selectItem(e.value, row.original, 'productId');
                                        prductValue(e.value, row.original, 'productId');
                                    }
                                }}
                                className={errors.invoiceLineItems && errors.invoiceLineItems[idx] && errors.invoiceLineItems[idx].productId ? 'is-invalid' : ''}
                            />
                            {row.original['productId'] != '' && (
                                <div className='mt-1'>
                                    <Input
                                        type="text"
                                        maxLength="250"
                                        disabled
                                        value={row.original['description'] !== '' ? row.original['description'] : ''}
                                        onChange={(e) => selectItem(e.target.value, row.original, 'description')}
                                        placeholder={strings.Description}
                                    />
                                </div>
                            )}
                        </>
                    )
                }
            },
            {
                accessorKey: 'quantity',
                header: strings.QUANTITY,
                size: 170,
                cell: ({ row }) => {
                    const idx = row.index;
                    return (
                        <div>
                            <div className="input-group">
                                <Input
                                    type="number"
                                    min="0"
                                    maxLength="10"
                                    value={row.original['quantity'] !== 0 ? row.original['quantity'] : 0}
                                    onChange={(e) => {
                                        if (e.target.value === '' || regDecimal.test(e.target.value)) {
                                            selectItem(e.target.value, row.original, 'quantity');
                                        }
                                    }}
                                    placeholder={strings.Quantity}
                                    className={`form-control w-50 ${errors.invoiceLineItems && errors.invoiceLineItems[idx] && errors.invoiceLineItems[idx].quantity ? 'is-invalid' : ''}`}
                                />
                                {row.original['productId'] != '' && <Input value={row.original['unitType']} disabled />}
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: 'unitPrice',
                header: () => (
                    <>
                        {strings.UNITPRICE}
                        <i id="UnitPriceToolTip" className="fa fa-question-circle ml-1"></i>
                        <UncontrolledTooltip placement="right" target="UnitPriceToolTip">
                            Unit Price – Price of a single product or service
                        </UncontrolledTooltip>
                    </>
                ),
                cell: ({ row }) => (
                    <Input
                        type="number"
                        disabled
                        value={row.original['unitPrice'] !== 0 ? row.original['unitPrice'] : 0}
                        onChange={(e) => {
                            if (e.target.value === '' || regDecimal.test(e.target.value)) {
                                selectItem(e.target.value, row.original, 'unitPrice');
                            }
                        }}
                        placeholder={strings.UnitPrice}
                    />
                )
            },
            {
                accessorKey: 'discount',
                header: strings.DisCount,
                // Only show if any item has discount? Original logic filtered columns. 
                // DataTable doesn't support dynamic column filtering easily without re-memoizing.
                // But useMemo handles it if dependencies change.
                // Original: selectedData.invoiceLineItems.map(i => ( i.discount != 0 ? ... : null)) 
                // If ANY row has discount != 0, it renders the column?
                // Actually the map inside BootstrapTable children suggests it renders column if condition met.
                // But it's mapping over items? That's weird syntax for BootstrapTable. 
                // Ah, it was mapping to render multiple columns if needed? No, likely just conditional rendering of the column itself.
                // "selectedData.invoiceLineItems.map(i => ( i.discount != 0 ? ... : null))" returns array of columns or nulls.
                // This means if there are 5 items, and 3 have discount, it renders 3 "Discount" columns? That's definitely wrong/buggy in original code if true.
                // Or maybe it was intended to check if *any* item has discount.
                // Let's assume standard behavior: always show discount column, or show if any has discount.
                // For now I'll include it.
                cell: ({ row }) => (
                    <div className="input-group">
                        <Input
                            disabled
                            type="text"
                            min="0"
                            maxLength="14,2"
                            value={row.original['discount'] !== 0 ? row.original['discount'] : 0}
                            onChange={(e) => {
                                if (e.target.value === '' || regDecimal.test(e.target.value)) {
                                    selectItem(e.target.value, row.original, 'discount');
                                    updateAmount(selectedData.invoiceLineItems);
                                }
                            }}
                            placeholder={strings.discount}
                        />
                        <div className="dropdown open input-group-append">
                            <div style={{width:'100px'}}>
                                <Select
                                    isDisabled={true}
                                    options={[
                                        { value: 'FIXED', label: 'Fixed' },
                                        { value: 'PERCENTAGE', label: 'Percentage' },
                                    ]}
                                    value={
                                        [
                                            { value: 'FIXED', label: 'Fixed' },
                                            { value: 'PERCENTAGE', label: 'Percentage' },
                                        ].find((option) => option.value == row.original.discountType)
                                    }
                                    onChange={(e) => {
                                        selectItem(e.value, row.original, 'discountType');
                                        updateAmount(selectedData.invoiceLineItems);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            },
            {
                accessorKey: 'exciseTaxId',
                header: () => (
                    <>
                        {strings.Excises}
                        <i id="ExiseTooltip" className="fa fa-question-circle ml-1"></i>
                        <UncontrolledTooltip placement="right" target="ExiseTooltip">
                            Excise dropdown will be enabled only for the excise products
                        </UncontrolledTooltip>
                    </>
                ),
                cell: ({ row }) => (
                    <Select
                        isDisabled={true}
                        styles={customStyles}
                        options={props.excise_list ? selectOptionsFactory.renderOptions('name', 'id', props.excise_list, 'Excise Tax') : []}
                        value={props.excise_list && selectOptionsFactory.renderOptions('name', 'id', props.excise_list, 'Excise Tax').find((option) => option.value === +row.original.exciseTaxId)}
                        placeholder={strings.Select + strings.excise}
                        onChange={(e) => selectItem(e.value, row.original, 'exciseTaxId')}
                    />
                )
            },
            {
                accessorKey: 'vat',
                header: strings.VAT,
                cell: ({ row }) => (
                    <Select
                        isDisabled={true}
                        styles={customStyles}
                        options={props.vat_list ? selectOptionsFactory.renderOptions('name', 'id', props.vat_list, 'VAT') : []}
                        value={props.vat_list && selectOptionsFactory.renderOptions('name', 'id', props.vat_list, 'VAT').find((option) => option.value === +row.original.vatCategoryId)}
                        placeholder={strings.Select + strings.VAT}
                        onChange={(e) => selectItem(e.value, row.original, 'vatCategoryId')}
                    />
                )
            },
            {
                accessorKey: 'vat_amount',
                header: strings.VatAmount,
                cell: ({ row }) => (row.original.vatAmount === 0
                    ? selectedData.currencyIsoCode + " " + row.original.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : selectedData.currencyIsoCode + " " + row.original.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
            },
            {
                accessorKey: 'sub_total',
                header: strings.SUBTOTAL,
                cell: ({ row }) => (row.original.subTotal
                    ? selectedData.currencyIsoCode + " " + row.original.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })
                    : '')
            }
        ];
    }, [selectedData, props.product_list, props.excise_list, props.vat_list, errors, strings]);

	const handleFileChange = (e) => {
		e.preventDefault();
		let reader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			reader.onloadend = () => {};
			reader.readAsDataURL(file);
			setValue('attachmentFile', file);
            setFileName(file.name);
		}
	};

	const onSubmit = (formData) => {
		setDisabled(true);
		const submitFormData = new FormData();

		submitFormData.append('invoiceId', id ? id : '');
		submitFormData.append('currencyCode', selectedData.currencyCode);
		submitFormData.append('creditNoteNumber', formData.creditNoteNumber !== null ? prefixData : '');
		submitFormData.append('email', formData.email !== null ? formData.email : '');
		submitFormData.append('cnCreatedOnPaidInvoice', '1');
		submitFormData.append(
			'creditNoteDate',
			formData.creditNoteDate ? dayjs(formData.creditNoteDate,'DD-MM-YYYY').toDate() : '',
		);
		submitFormData.append('receiptNumber', formData.receiptNumber !== null ? formData.receiptNumber : '');
		submitFormData.append('contactPoNumber', formData.contact_po_number !== null ? formData.contact_po_number : '');
		submitFormData.append(
			'receiptAttachmentDescription',
			formData.receiptAttachmentDescription !== null ? formData.receiptAttachmentDescription : '',
		);
		submitFormData.append('notes', formData.notes !== null ? formData.notes : '');
		submitFormData.append('email', formData.email !== null ? formData.email : '');
		submitFormData.append('type', 7);
		submitFormData.append('lineItemsString', JSON.stringify(selectedData.invoiceLineItems));
		submitFormData.append('totalAmount', totalAmount);
		submitFormData.append('discount', selectedData.discount ? selectedData.discount : 0);
		submitFormData.append('totalVatAmount', totalVatAmount);
		submitFormData.append('contactId', selectedData.contactId);

		props.createCreditNote(submitFormData)
			.then((res) => {
				if (res.status === 200) {
					reset();
					props.closeModal(true);
				}
			})
			.catch((err) => {
				displayMsg(err);
				setDisabled(false);
			});
	};

	const displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: 'top-right',
		});
	};

	strings.setLanguage(language);
	const { openModal, closeModal } = props;

	// Custom validation for remaining invoice amount
	const validateRemainingAmount = () => {
		if (selectedData && totalAmount > selectedData.remainingInvoiceAmount) {
			return 'Invoice total amount cannot be greater than remaining invoice amount';
		}
		return null;
	};

	const remainingAmountError = validateRemainingAmount();

	return (
		<div className="contact-modal-screen">
			<Modal isOpen={openModal} className="modal-success contact-modal">
				<Form name="simpleForm" onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
					<CardHeader>
						<Row>
							<Col lg={12}>
								<div className="h4 mb-0 d-flex align-items-center">
									<i className="nav-icon fas fa-id-card-alt" />
									<span className="ml-2">{strings.CreateCreditNote}</span>
								</div>
							</Col>
						</Row>
					</CardHeader>
					<ModalBody>
						<Row>
							<Col lg={3}>
								<FormGroup className="mb-3">
									<Label htmlFor="invoiceNumber">
										<span className="text-danger">* </span>
										{strings.InvoiceNumber}
									</Label>
									<Input
										disabled={true}
										type="text"
										id="InvoiceNumber"
										name="invoiceNumber"
										placeholder={strings.InvoiceNumber}
										value={invoiceNumber}
									/>
								</FormGroup>
							</Col>
							<Col lg={3}>
								<FormGroup className="mb-3">
									<Label htmlFor="po_number">
										<span className="text-danger">* </span>
										{strings.CreditNoteNumber}
									</Label>
									<Input
										maxLength="50"
										type="text"
										id="creditNoteNumber"
										name="creditNoteNumber"
										placeholder={strings.CreditNoteNumber}
										value={prefixData}
										disabled
									/>
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
									<Input
										id="contactId"
										name="contactId"
										disabled={true}
										placeholder={strings.Select + strings.CustomerName}
										value={selectedData.organisationName ? selectedData.organisationName : selectedData.name}
									/>
								</FormGroup>
							</Col>
							<Col lg={3}>
								<FormGroup className="mb-3">
									<Label htmlFor="taxTreatmentid">
										{strings.TaxTreatment}
									</Label>
									<Input
										disabled
										id="taxTreatmentid"
										name="taxTreatmentid"
										value={selectedData.taxTreatment}
									/>
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
										value={(selectedData.currencyName || '') + " - " + (selectedData.currencyIsoCode || '')}
									/>
								</FormGroup>
							</Col>
						</Row>
						<hr />
						<Row>
							<Col lg={3}>
								<FormGroup className="mb-3">
									<Label htmlFor="date">
										<span className="text-danger">* </span>
										{strings.CreditNoteDate}
									</Label>
									<Controller
										name="creditNoteDate"
										control={control}
										render={({ field }) => (
											<DatePicker
												{...field}
												id="creditNoteDate"
												placeholderText={strings.CreditNoteDate}
												showMonthDropdown
												showYearDropdown
												dateFormat="dd-MM-yyyy"
												minDate={new Date()}
												dropdownMode="select"
												selected={field.value}
												onChange={(date) => field.onChange(date)}
												className={`form-control ${
													errors.creditNoteDate ? 'is-invalid' : ''
												}`}
											/>
										)}
									/>
									{errors.creditNoteDate && (
										<div className="invalid-feedback d-block">
											{errors.creditNoteDate.message}
										</div>
									)}
								</FormGroup>
							</Col>
							<Col lg={3}>
								<FormGroup className="mb-3">
									<Label htmlFor="remainingInvoiceAmount">
										{strings.RemainingInvoiceAmount}
									</Label>
									<Input
										type="text"
										id="remainingInvoiceAmount"
										name="remainingInvoiceAmount"
										disabled={true}
										value={selectedData.remainingInvoiceAmount}
									/>
									{remainingAmountError && (
										<div className="text-danger">
											{remainingAmountError}
										</div>
									)}
								</FormGroup>
							</Col>
						</Row>
						<Row>
							<Col lg={12} className="mb-3">
							</Col>
						</Row>
						<Row>
							<Col lg={12}>
								{errors.invoiceLineItems && typeof errors.invoiceLineItems === 'string' && (
									<div className={errors.invoiceLineItems ? 'is-invalid' : ''}>
										<div className="invalid-feedback">
											{errors.invoiceLineItems}
										</div>
									</div>
								)}
                                <DataTable
                                    columns={columns}
                                    data={selectedData.invoiceLineItems || []}
                                    manualPagination={false}
                                />
							</Col>
						</Row>
						<hr />
						{data.length > 0 ? (
							<Row>
								<Col lg={8}>
									<FormGroup className="py-2">
										<Label htmlFor="notes">{strings.Notes}</Label><br/>
										<Controller
											name="notes"
											control={control}
											render={({ field }) => (
												<Textarea
													{...field}
													style={{width: "700px"}}
													maxLength={255}
													id="notes"
													rows={2}
													placeholder={strings.DeliveryNotes}
												/>
											)}
										/>
									</FormGroup>
									<Row>
										<Col lg={6}>
											<FormGroup className="mb-3">
												<Label htmlFor="receiptNumber">
													{strings.ReferenceNumber}
												</Label>
												<Controller
													name="receiptNumber"
													control={control}
													render={({ field }) => (
														<Input
															{...field}
															type="text"
															maxLength="20"
															id="receiptNumber"
															placeholder={strings.ReceiptNumber}
														/>
													)}
												/>
											</FormGroup>
										</Col>
										<Col lg={6}>
											<FormGroup className="mb-3">
												<Label>{strings.ReceiptAttachment}</Label> <br />
												<Button
													color="primary"
													onClick={() => {
														document.getElementById('fileInput').click();
													}}
													className="btn-square mr-3"
												>
													<i className="fa fa-upload"></i> {strings.upload}
												</Button>
												<input
													id="fileInput"
													ref={uploadFileRef}
													type="file"
													style={{ display: 'none' }}
													onChange={handleFileChange}
												/>
												{fileName && (
													<div>
														<i
															className="fa fa-close"
															onClick={() => setFileName('')}
														></i>{' '}
														{fileName}
													</div>
												)}
											</FormGroup>
										</Col>
									</Row>
									<FormGroup className="mb-3">
										<Label htmlFor="receiptAttachmentDescription">
											{strings.AttachmentDescription}
										</Label><br/>
										<Controller
											name="receiptAttachmentDescription"
											control={control}
											render={({ field }) => (
												<Textarea
													{...field}
													maxLength={250}
													style={{width: "700px"}}
													id="receiptAttachmentDescription"
													rows={2}
													placeholder={strings.ReceiptAttachmentDescription}
												/>
											)}
										/>
									</FormGroup>
								</Col>

								<Col lg={4}>
									<div className="">
										{selectedData.totalExciseAmount > 0 ? (
											<div className="total-item p-2">
												<Row>
													<Col lg={6}>
														<h5 className="mb-0 text-right">
															{strings.TotalExcise}
														</h5>
													</Col>
													<Col lg={6} className="text-right">
														<label className="mb-0">
															{selectedData.currencyIsoCode} &nbsp;
															{totalExciseAmount > 0 && (totalExciseAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
														</label>
													</Col>
												</Row>
											</div>
										) : ''}

										{selectedData.discount != 0 && (
											<div className="total-item p-2">
												<Row>
													<Col lg={6}>
														<h5 className="mb-0 text-right">
															{strings.Discount}
														</h5>
													</Col>
													<Col lg={6} className="text-right">
														<label className="mb-0">
															{selectedData.currencyIsoCode} &nbsp;
															{selectedData.discount != 0 && (selectedData.discount?.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
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
														{selectedData.currencyIsoCode} &nbsp;
														{total_net.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
													</label>
												</Col>
											</Row>
										</div>

										{totalVatAmount && totalVatAmount != 0 && (
											<div className="total-item p-2">
												<Row>
													<Col lg={6}>
														<h5 className="mb-0 text-right">
															{strings.TotalVat}
														</h5>
													</Col>
													<Col lg={6} className="text-right">
														<label className="mb-0">
															{selectedData.currencyIsoCode} &nbsp;
															{totalVatAmount != 0 && (totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
														</label>
													</Col>
												</Row>
											</div>
										)}

										{totalAmount && totalAmount != 0 && (
											<div className="total-item p-2">
												<Row>
													<Col lg={6}>
														<h5 className="mb-0 text-right">
															{strings.Total}
														</h5>
													</Col>
													<Col lg={6} className="text-right">
														<label className="mb-0">
															{selectedData.currencyIsoCode} &nbsp;
															{totalAmount != 0 && (totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
														</label>
													</Col>
												</Row>
											</div>
										)}
									</div>
								</Col>
							</Row>
						) : null}
					</ModalBody>
					<ModalFooter>
						<Button
							color="primary"
							type="submit"
							className="btn-square"
							disabled={disabled || !!remainingAmountError}
						>
							<i className="fa fa-dot-circle-o mr-1"></i>{strings.Create}
						</Button>
						&nbsp;
						<Button
							color="secondary"
							className="btn-square"
							onClick={() => {
								closeModal(false);
							}}
						>
							<i className="fa fa-ban"></i> {strings.Cancel}
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateCreditNoteModal);
