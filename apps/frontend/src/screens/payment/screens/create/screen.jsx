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
	NavLink,
} from 'reactstrap';
import Select from 'react-select';
import _ from 'lodash';
import { selectOptionsFactory, selectStyles } from 'utils';
import DatePicker from 'react-datepicker';
import dayjs from '@/utils/date';
import API_ROOT_URL from '../../../../constants/config';
import 'react-datepicker/dist/react-datepicker.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import * as PaymentActions from '../../actions';
import * as CreatePaymentActions from './actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { CommonActions } from 'services/global';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { LeavePage, Loader } from 'components';

const strings = new LocalizedStrings(data);

// Zod validation schema
const createPaymentSchema = z.object({
	contactId: z
		.object({
			label: z.string(),
			value: z.number(),
		})
		.nullable()
		.refine((val) => val !== null, 'Supplier is required'),
	amount: z
		.string()
		.min(1, 'Amount is required')
		.regex(/^[0-9]+([,.][0-9]+)?$/, 'Please enter valid amount.'),
	paymentNo: z.number().optional(),
	paymentDate: z.date({ required_error: 'Payment date is required' }),
	payMode: z
		.object({
			label: z.string(),
			value: z.number(),
		})
		.nullable()
		.refine((val) => val !== null, 'Payment mode is required'),
	notes: z.string().optional(),
	depositeTo: z
		.object({
			label: z.string(),
			value: z.number(),
		})
		.nullable()
		.refine((val) => val !== null, 'Deposit to is required'),
	paidInvoiceListStr: z.array(z.any()).min(1, 'Please select atleast one invoice'),
	deleteFlag: z.boolean().optional(),
	referenceCode: z.string().optional(),
});

const mapStateToProps = (state) => {
	return {
		supplier_list: state.payment.supplier_list,
		invoice_list: state.payment.invoice_list,
		deposit_list: state.supplier_invoice.deposit_list,
		pay_mode: state.supplier_invoice.pay_mode,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		SupplierInvoiceActions: bindActionCreators(
			SupplierInvoiceActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
		createPaymentActions: bindActionCreators(CreatePaymentActions, dispatch),
		paymentActions: bindActionCreators(PaymentActions, dispatch),
	};
};

const CreatePayment = ({
	supplier_list,
	deposit_list,
	pay_mode,
	SupplierInvoiceActions,
	commonActions,
	createPaymentActions,
	paymentActions,
	history,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [loading, setLoading] = useState(false);
	const [loadingMsg, setLoadingMsg] = useState('Loading...');
	const [data1, setData1] = useState([]);
	const [paidInvoiceListStr, setPaidInvoiceListStr] = useState([]);
	const [currentData, setCurrentData] = useState({});
	const [openSupplierModal, setOpenSupplierModal] = useState(false);
	const [contactType] = useState(1);
	const [disableLeavePage, setDisableLeavePage] = useState(false);
	const [createMore, setCreateMore] = useState(false);
	const [fileName, setFileName] = useState('');
	const uploadFile = useRef(null);

	const form = useForm({
		resolver: zodResolver(createPaymentSchema),
		defaultValues: {
			contactId: null,
			amount: '',
			paymentNo: 1,
			paymentDate: new Date(),
			payMode: null,
			notes: '',
			depositeTo: null,
			paidInvoiceListStr: [],
			deleteFlag: true,
			referenceCode: '',
		},
		mode: 'onChange',
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
		trigger,
	} = form;

	const contactId = watch('contactId');

	const regEx = /^[0-9\d]+$/;
	const regExBoth = /^[a-zA-Z0-9]+$/;

	const selectRowProp = {
		mode: 'checkbox',
		bgColor: 'rgba(0,0,0, 0.05)',
		clickToSelect: false,
		onSelect: onRowSelect,
	};

	const options = {
		paginationPosition: 'bottom',
		page: 1,
		sizePerPage: 10,
	};

	useEffect(() => {
		strings.setLanguage(language);
		initializeData();
	}, []);

	const initializeData = () => {
		paymentActions.getSupplierContactList(contactType);
		paymentActions.getSupplierInvoiceList();
		SupplierInvoiceActions.getDepositList();
		SupplierInvoiceActions.getPaymentMode();
	};

	function onRowSelect(row, isSelected, e) {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], paidInvoiceListStr);
			tempList.push(row);
		} else {
			paidInvoiceListStr.forEach((item) => {
				if (item !== row) {
					tempList.push(item);
				}
			});
		}

		const totalAmount = tempList.reduce((acc, val) => acc + val.totalAount, 0);

		setPaidInvoiceListStr(tempList);
		setValue('paidInvoiceListStr', tempList, { shouldValidate: true });
		setValue('amount', totalAmount.toString(), { shouldValidate: true });
	}

	const getList = (id) => {
		createPaymentActions
			.getList(id)
			.then((res) => {
				if (res.status === 200) {
					const totalAmount = res.data.reduce((acc, val) => acc + val.totalAount, 0);
					setData1(res.data);
					setValue('amount', totalAmount.toString(), { shouldValidate: true });
				}
			})
			.catch((err) => {
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	const handleChange = (e, name) => {
		setCurrentData(
			_.set(
				{ ...currentData },
				e.target.name && e.target.name !== '' ? e.target.name : name,
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
			),
		);
	};

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setFileName(e.target.files[0].name);
		}
	};

	const onSubmit = (data) => {
		const {
			paymentNo,
			paymentDate,
			contactId,
			amount,
			depositeTo,
			payMode,
			notes,
			referenceCode,
			deleteFlag,
		} = data;

		let formData = new FormData();
		formData.append('paymentNo', paymentNo !== null ? paymentNo : '');
		formData.append(
			'paymentDate',
			typeof paymentDate === 'string'
				? dayjs(paymentDate, 'DD-MM-YYYY').toDate()
				: paymentDate,
		);
		formData.append('amount', amount !== null ? amount : '');
		formData.append('deleteFlag', deleteFlag !== null ? deleteFlag : '');
		formData.append('notes', notes !== null ? notes : '');
		formData.append(
			'referenceCode',
			referenceCode !== null ? referenceCode : '',
		);
		formData.append(
			'paidInvoiceListStr',
			JSON.stringify(paidInvoiceListStr),
		);
		formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
		if (payMode) {
			formData.append('payMode', payMode !== null ? payMode.value : '');
		}
		if (contactId) {
			formData.append('contactId', contactId.value);
		}
		if (uploadFile?.current?.files?.[0]) {
			formData.append('attachmentFile', uploadFile?.current?.files?.[0]);
		}

		createPaymentActions
			.createPayment(formData)
			.then((res) => {
				commonActions.tostifyAlert(
					'success',
					'Payment Created Successfully.',
				);
				if (createMore) {
					setCreateMore(false);
					reset({
						contactId: null,
						amount: '',
						paymentNo: 1,
						paymentDate: new Date(),
						payMode: null,
						notes: '',
						depositeTo: null,
						paidInvoiceListStr: [],
						deleteFlag: true,
						referenceCode: '',
					});
					setData1([]);
					setPaidInvoiceListStr([]);
					setFileName('');
				} else {
					history.push('/admin/expense/payment');
				}
			})
			.catch((err) => {
				setDisableLeavePage(true);
				setLoading(false);
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	const date = (cell, rows) => {
		return <div>{dayjs.utc(rows.date).format('DD-MM-YYYY')}</div>;
	};

	const renderAmount = (cell, rows) => {
		return (
			<Input
				type="number"
				min="0"
				readOnly
				value={rows.totalAount}
				placeholder={strings.Amount}
				className="form-control"
			/>
		);
	};

	strings.setLanguage(language);

	let tmpSupplier_list = [];

	supplier_list.forEach((item) => {
		let obj = { label: item.label.contactName, value: item.value };
		tmpSupplier_list.push(obj);
	});

	if (loading) {
		return <Loader loadingMsg={loadingMsg} />;
	}

	return (
		<div className="create-payment-screen">
			<div className="animated fadeIn">
				<Row>
					<Col lg={12} className="mx-auto">
						<Card>
							<CardHeader>
								<Row>
									<Col lg={12}>
										<div className="h4 mb-0 d-flex align-items-center">
											<i className="fas fa-money-check" />
											<span className="ml-2">{strings.CreatePurchaseReceipt} </span>
										</div>
									</Col>
								</Row>
							</CardHeader>
							<CardBody>
								<Form onSubmit={handleSubmit(onSubmit)}>
									<Row>
										<Col lg={4}>
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
															styles={selectStyles}
															id="contactId"
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
															onChange={(option) => {
																field.onChange(option);
																if (option && option.value) {
																	getList(option.value);
																}
															}}
															className={
																errors.contactId ? 'is-invalid' : ''
															}
														/>
													)}
												/>
												{errors.contactId && (
													<div className="invalid-feedback d-block">
														{errors.contactId.message}
													</div>
												)}
											</FormGroup>
										</Col>
									</Row>
									<hr />
									{contactId && (
										<div>
											{data1.length > 0 ? (
												<div>
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="amount">
																	<span className="text-danger">* </span>
																	{strings.AmountPaid}
																</Label>
																<Controller
																	name="amount"
																	control={control}
																	render={({ field }) => (
																		<Input
																			{...field}
																			type="number"
																			min="0"
																			id="amount"
																			placeholder={strings.Amount}
																			onChange={(e) => {
																				if (
																					e.target.value === '' ||
																					regEx.test(e.target.value)
																				) {
																					field.onChange(e);
																				}
																			}}
																			className={
																				errors.amount ? 'is-invalid' : ''
																			}
																		/>
																	)}
																/>
																{errors.amount && (
																	<div className="invalid-feedback">
																		{errors.amount.message}
																	</div>
																)}
															</FormGroup>
														</Col>
													</Row>
													<hr />
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="paymentDate">
																	<span className="text-danger">* </span>
																	{strings.PaymentDate}
																</Label>
																<Controller
																	name="paymentDate"
																	control={control}
																	render={({ field }) => (
																		<DatePicker
																			id="paymentDate"
																			placeholderText={strings.PaymentDate}
																			showMonthDropdown
																			showYearDropdown
																			dateFormat="dd-MM-yyyy"
																			dropdownMode="select"
																			selected={field.value}
																			onChange={(date) => field.onChange(date)}
																			className={`form-control ${
																				errors.paymentDate ? 'is-invalid' : ''
																			}`}
																		/>
																	)}
																/>
																{errors.paymentDate && (
																	<div className="invalid-feedback">
																		{errors.paymentDate.message}
																	</div>
																)}
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label>
																	<span className="text-danger">* </span>{' '}
																	{strings.PaymentMode}
																</Label>
																<Controller
																	name="payMode"
																	control={control}
																	render={({ field }) => (
																		<Select
																			{...field}
																			styles={selectStyles}
																			options={
																				pay_mode
																					? selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							pay_mode,
																							'Mode',
																					  )
																					: []
																			}
																			placeholder={strings.Select + strings.PaymentMode}
																			id="payMode"
																			className={
																				errors.payMode ? 'is-invalid' : ''
																			}
																		/>
																	)}
																/>
																{errors.payMode && (
																	<div className="invalid-feedback d-block">
																		{errors.payMode.message}
																	</div>
																)}
															</FormGroup>
														</Col>{' '}
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="depositeTo">
																	<span className="text-danger">* </span>{' '}
																	{strings.DepositTo}
																</Label>
																<Controller
																	name="depositeTo"
																	control={control}
																	render={({ field }) => (
																		<Select
																			{...field}
																			styles={selectStyles}
																			options={deposit_list}
																			placeholder={strings.Select + strings.DepositTo}
																			id="depositeTo"
																			className={
																				errors.depositeTo ? 'is-invalid' : ''
																			}
																		/>
																	)}
																/>
																{errors.depositeTo && (
																	<div className="invalid-feedback d-block">
																		{errors.depositeTo.message}
																	</div>
																)}
															</FormGroup>
														</Col>{' '}
													</Row>
													<hr />
													<Row>
														<Col lg={8}>
															<Row>
																<Col lg={6}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="referenceCode">
																			{strings.ReferenceNumber}
																		</Label>
																		<Controller
																			name="referenceCode"
																			control={control}
																			render={({ field }) => (
																				<Input
																					{...field}
																					type="text"
																					maxLength="20"
																					id="referenceCode"
																					placeholder={
																						strings.Enter + strings.ReceiptNumber
																					}
																					onChange={(e) => {
																						if (
																							e.target.value === '' ||
																							regExBoth.test(e.target.value)
																						) {
																							field.onChange(e);
																						}
																					}}
																				/>
																			)}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={12}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="notes">{strings.Notes}</Label>
																		<Controller
																			name="notes"
																			control={control}
																			render={({ field }) => (
																				<Input
																					{...field}
																					type="textarea"
																					id="notes"
																					rows="5"
																					placeholder={strings.DeliveryNotes}
																				/>
																			)}
																		/>
																	</FormGroup>
																</Col>
															</Row>
														</Col>
														<Col lg={4}>
															<Row>
																<Col lg={12}>
																	<FormGroup className="mb-3">
																		<Label>{strings.Attachment}</Label> <br />
																		<div className="file-upload-cont">
																			<Button
																				color="primary"
																				onClick={() => {
																					document.getElementById('fileInput').click();
																				}}
																				className="btn-square mr-3"
																			>
																				<i className="fa fa-upload"></i>{' '}
																				{strings.Attachment}
																			</Button>
																			<input
																				id="fileInput"
																				ref={uploadFile}
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
																		</div>
																	</FormGroup>
																</Col>
															</Row>
														</Col>
													</Row>
													<Row>
														<div
															className={
																errors.paidInvoiceListStr ? 'is-invalid' : ''
															}
														></div>
														{errors.paidInvoiceListStr && (
															<div
																className="invalid-feedback"
																style={{ fontSize: '20px' }}
															>
																{errors.paidInvoiceListStr.message}
															</div>
														)}
													</Row>
													<Row>
														<BootstrapTable
															selectRow={selectRowProp}
															search={false}
															options={options}
															data={data1}
															version="4"
															hover
															responsive
															keyField="id"
															pagination={true}
															remote
														>
															<TableHeaderColumn dataField="referenceNo">
																{strings.InvoiceNumber}
															</TableHeaderColumn>

															<TableHeaderColumn
																dataField="date"
																dataFormat={(cell, rows) => date(cell, rows)}
															>
																{strings.Date}
															</TableHeaderColumn>

															<TableHeaderColumn dataField="totalAount">
																{strings.InvoiceAmount}
															</TableHeaderColumn>

															<TableHeaderColumn dataField="dueAmount">
																{strings.AmountDue}
															</TableHeaderColumn>

															<TableHeaderColumn
																dataField="paidAmount"
																dataFormat={(cell, rows) => renderAmount(cell, rows)}
															>
																{strings.Payment}
															</TableHeaderColumn>
														</BootstrapTable>
													</Row>
													<Row>
														<Col lg={12} className="mt-5">
															<FormGroup className="text-right">
																<Button
																	type="button"
																	color="primary"
																	className="btn-square mr-3"
																	onClick={() => {
																		setCreateMore(false);
																		handleSubmit(onSubmit)();
																	}}
																>
																	<i className="fa fa-dot-circle-o"></i>{' '}
																	{strings.Create}
																</Button>
																<Button
																	type="button"
																	color="primary"
																	className="btn-square mr-3"
																	onClick={() => {
																		setCreateMore(true);
																		handleSubmit(onSubmit)();
																	}}
																>
																	<i className="fa fa-repeat"></i>{' '}
																	{strings.CreateandMore}
																</Button>
																<Button
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		history.push('/admin/expense/payment');
																	}}
																>
																	<i className="fa fa-ban"></i> {strings.Cancel}
																</Button>
															</FormGroup>
														</Col>
													</Row>
												</div>
											) : (
												<div>
													There are no pending invoices for selected supplier.
													Please select different supplier or create a new invoice
													to proceed further.
												</div>
											)}
										</div>
									)}
								</Form>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
			{!disableLeavePage && <LeavePage />}
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatePayment);
