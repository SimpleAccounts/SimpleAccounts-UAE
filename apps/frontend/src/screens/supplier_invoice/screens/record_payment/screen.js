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
import DatePicker from 'react-datepicker';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import * as SupplierRecordPaymentActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import { TextField } from '@material-ui/core';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import moment from 'moment';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		contact_list: state.customer_invoice.contact_list,
		supplier_list: state.supplier_invoice.supplier_list,
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
		SupplierRecordPaymentActions: bindActionCreators(
			SupplierRecordPaymentActions,
			dispatch,
		),
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
class RecordSupplierPayment extends React.Component {
	constructor(props) {
		super(props);
		console.log(props, "PROPS");
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			dialog: false,
			discountOptions: [
				{ value: 'FIXED', label: 'Fixed' },
				{ value: 'PERCENTAGE', label: 'Percentage' },
			],
			discount_option: '',
			data: [],
			current_customer_id: null,
			initValue: {
				paymentNo: 1,
				paymentDate: new Date(
                    this.props.location.state.id.invoiceDate.substring(6), 
                    this.props.location.state.id.invoiceDate.substring(3, 5) - 1,  
                    this.props.location.state.id.invoiceDate.substring(0, 2)  
                  ),
				contactId: this.props.location.state.id.contactId,
				amount: this.props.location.state.id.dueAmount,
				payMode: { label: 'CASH', value: 'CASH' },
				notes: '',
				depositeTo: { label: 'Petty Cash', value: 47 },
				referenceCode: '',
				attachmentFile: '',
				paidInvoiceListStr: [],
				deleteFlag: true,
			},
			invoiceId: this.props.location.state.id.id,
			contactType: 1,
			selectedContact: '',
			term: '',
			selectedType: '',
			discountPercentage: '',
			discountAmount: 0,
			fileName: '',
			disabled: false,
			loadingMsg: "Loading...",
			disableLeavePage: false
		};

		// this.options = {
		//   paginationPosition: 'top'
		// }
		this.formRef = React.createRef();
		this.termList = [
			{ label: 'Net 7', value: 'NET_7' },
			{ label: 'Net 10', value: 'NET_10' },
			{ label: 'Net 30', value: 'NET_30' },
			{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
		];
		this.regEx = /^[0-9\b]+$/;
		this.regExBoth = /^[a-zA-Z0-9\s\D,'-/]+$/;
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
	};

	initializeData = () => {
		console.log(this.props.location.state.id);
		this.setState({
			initValue: {
				paidInvoiceListStr: [
					{
						id: this.props.location.state.id.id,
						date: moment(
							this.props.location.state.id.invoiceDate,
							'DD-MM-YYYY',
						).toDate(),
						dueDate: moment(
							this.props.location.state.id.invoiceDueDate,
							'DD-MM-YYYY',
						).toDate(),
						paidAmount: this.props.location.state.id.invoiceAmount,
						dueAmount: this.props.location.state.id.dueAmount,
						referenceNo: this.props.location.state.id.invoiceNumber,
						totalAount: this.props.location.state.id.invoiceAmount,
					},
				],
			},
		});
		Promise.all([
			this.props.SupplierInvoiceActions.getDepositList(),
			this.props.SupplierInvoiceActions.getPaymentMode(),
			this.props.SupplierInvoiceActions.getSupplierList(this.state.contactType),
		]);
		//this.getReceiptNo();
	};

	getReceiptNo = () => {
		this.props.CustomerRecordPaymentActions.getReceiptNo(
			this.props.location.state.id.id,
		).then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{ receiptNo: res.data },
					},
				});
				this.formRef.current.setFieldValue('receiptNo', res.data, true);
			}
		});
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
		this.setState({ disabled: true, disableLeavePage: true, });
		const { invoiceId } = this.state;
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
		debugger
		console.log(typeof(paymentDate))
		formData.append('paymentNo', paymentNo !== null ? paymentNo : '');
		formData.append('paymentDate', paymentDate ? paymentDate : null,);
		formData.append(
			'paidInvoiceListStr',
			JSON.stringify(this.state.initValue.paidInvoiceListStr),
		);
		formData.append('amount', amount !== null ? amount : '');
		formData.append('notes', notes !== null ? notes : '');
		formData.append('referenceNo', referenceCode !== null ? referenceCode : '');
		formData.append('deleteFlag', deleteFlag !== null ? deleteFlag : '');
		formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
		formData.append('payMode', payMode !== null ? payMode.value : '');
		if (contactId) {
			formData.append('contactId', contactId);
		}
		if (this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		formData.append(
			'invoiceNumber',
			this.props.location.state.id.invoiceNumber ? this.props.location.state.id.invoiceNumber : "Invoice-00000",
		);
		formData.append(
			'invoiceAmount',
			this.props.location.state.id.invoiceAmount ? this.props.location.state.id.invoiceAmount : "00000",
		);

		this.setState({ loading: true, loadingMsg: "Payment Recording..." });
		this.props.SupplierRecordPaymentActions.recordPayment(formData)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : strings.PaymentRecordedSuccessfully,
				);
				this.props.history.push('/admin/expense/supplier-invoice');
				this.setState({ loading: false, });
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Payment Recorded Unsuccessfully.',
				);
			});
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
	deleteInvoice = () => {
		const message1 =
			<text>
				<b>Delete Supplier Invoice?</b>
			</text>
		const message = 'This Supplier Invoice will be deleted permanently and cannot be recovered. ';
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
		const { current_customer_id } = this.state;
		this.props.customerInvoiceDetailActions
			.deleteInvoice(current_customer_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Supplier Invoice Deleted Successfully',
					);
					this.props.history.push('/admin/revenue/customer-invoice');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Supplier Invoice Deleted Unsuccessfully',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { initValue, loading, dialog, loadingMsg } = this.state;
		const { pay_mode, supplier_list, deposit_list } = this.props;
		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = { label: item.label.contactName, value: item.value }
			tmpSupplier_list.push(obj)
		})

		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div>
					<div className="detail-customer-invoice-screen">
						<div className="animated fadeIn">
							<Row>
								<Col lg={12} className="mx-auto">
									<Card>
										<CardHeader>
											<Row>
												<Col lg={12}>
													<div className="h4 mb-0 d-flex align-items-center">
														<i className="fas fa-address-book" />
														<span className="ml-2">
															{strings.PaymentForSupplierInvoice}
														</span>
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
															initialValues={initValue}
															ref={this.formRef}
															onSubmit={(values, { resetForm }) => {
																this.handleSubmit(values);
															}}
															validate={(values) => {
																let errors = {};
																if (values.amount <= 0) {
																	errors.amount = 'Amount cannot be Less than 0';
																}
																if (!values.paymentDate) {
																	errors.paymentDate = 'Payment date is required';
																}
																return errors
															}}
															validationSchema={Yup.object().shape({
																depositeTo: Yup.string().required(
																	'Paid through is required',
																),
																payMode: Yup.string().required(
																	'Payment mode is required',
																),
																amount: Yup.mixed()
																	.test(
																		'amount',
																		'Amount cannot be greater than invoice amount',
																		(value) => {
																			if (
																				!value ||
																				(value <= this.props.location.state.id.dueAmount)
																			) {
																				return true;
																			} else {
																				return false;
																			}
																		},
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
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="contactId">
																					<span className="text-danger">* </span>
																					{strings.SupplierName}
																				</Label>
																				<Select
																					styles={customStyles}
																					id="contactId"
																					name="contactId"
																					isDisabled
																					value={
																						tmpSupplier_list &&
																						tmpSupplier_list.find(
																							(option) =>
																								option.value ===
																								+this.props.location.state.id
																									.contactId,
																						)
																					}
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
																		{/* <Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="project">
																			<span className="text-danger">* </span>{' '}
																			Payment
																		</Label>
																		<Input
																			type="text"
																			id="paymentNo"
																			name="paymentNo"
																			placeholder=""
																			disabled
																			value={props.values.paymentNo}
																			onChange={(value) => {
																				props.handleChange('paymentNo')(value);
																			}}
																			className={
																				props.errors.paymentNo &&
																				props.touched.paymentNo
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.paymentNo &&
																			props.touched.paymentNo && (
																				<div className="invalid-feedback">
																					{props.errors.paymentNo}
																				</div>
																			)}
																	</FormGroup>
																</Col> */}
																	</Row>
																	<hr />
																	<Row>
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="project">
																					<span className="text-danger">* </span>{' '}
																					{strings.AmountPaid}
																				</Label>
																				<Input
																					type="text"
																					min="0.01"
																					maxLength="14,2"
																					id="amount"
																					name="amount"
																					value={props.values.amount}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regDecimal.test(option.target.value)
																						) {
																							props.handleChange('amount')(option);
																						}
																					}}
																					placeholder={strings.AmountPaid}
																					className={
																						props.errors.amount &&
																							props.touched.amount
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.amount &&
																					props.touched.amount && (
																						<div className="invalid-feedback">
																							{props.errors.amount}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																	</Row>
																	<hr />
																	<Row>
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="date">
																					<span className="text-danger">* </span>
																					{strings.PaymentDate}
																				</Label>
																				<DatePicker
																					id="paymentDate"
																					name="paymentDate"
																					placeholderText={strings.PaymentDate}
																					showMonthDropdown
																					showYearDropdown
																					dateFormat="dd-MM-yyyy"
																					dropdownMode="select"
																					minDate={new Date(
																						this.props.location.state.id.invoiceDate.substring(6), 
																						this.props.location.state.id.invoiceDate.substring(3, 5) - 1,  
																						this.props.location.state.id.invoiceDate.substring(0, 2)  
																					  )}
                                                                                    // maxDate={null}
																					// value={props.values.paymentDate}
																					selected={props.values.paymentDate}
																					onChange={(value) => {
																						props.handleChange('paymentDate')(
																							value,
																						);
																					}}
																					className={`form-control ${props.errors.paymentDate &&
																							props.touched.paymentDate
																							? 'is-invalid'
																							: ''
																						}`}
																				/>
																				{props.errors.paymentDate &&
																					props.touched.paymentDate && (
																						<div className="invalid-feedback">
																							{props.errors.paymentDate}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																	</Row>
																	<Row>
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="payMode">
																					<span className="text-danger">* </span>
																					{strings.PaymentMode}
																				</Label>
																				<Select
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
																					value={props.values.payMode}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('payMode')(option);
																						} else {
																							props.handleChange('payMode')('');
																						}
																					}}
																					placeholder={strings.Select + strings.PaymentMode}
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
																		</Col>{' '}
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="depositeTo">
																					<span className="text-danger">* </span>{' '}
																					{strings.PaidThrough}
																				</Label>
																				<Select
																					options={deposit_list}
																					value={props.values.depositeTo}
																					onChange={(option) => {
																						if (option && option.value) {
																							props.handleChange('depositeTo')(
																								option,
																							);
																						} else {
																							props.handleChange('depositeTo')('');
																						}
																					}}
																					placeholder={strings.Select + strings.PaidThrough}
																					id="depositeTo"
																					name="depositeTo"
																					className={
																						props.errors.depositeTo &&
																							props.touched.depositeTo
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.depositeTo &&
																					props.touched.depositeTo && (
																						<div className="invalid-feedback">
																							{props.errors.depositeTo}
																						</div>
																					)}
																			</FormGroup>
																		</Col>{' '}
																	</Row>
																	<hr />

																	<Row>
																		<Col lg={8}>
																			<FormGroup className="py-2">
																				<Label htmlFor="notes">{strings.Notes}</Label><br />
																				<TextField
																					type="textarea"
																					style={{ width: "870px" }}
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
																							className={props.errors.receiptNumber && props.touched.receiptNumber ? "is-invalid" : " "}
																						/>
																						{props.errors.receiptNumber && props.touched.receiptNumber && (
																							<div className="invalid-feedback">{props.errors.receiptNumber}</div>
																						)}

																					</FormGroup>
																				</Col>
																				<Col lg={6}>
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
																				</Col>
																			</Row>
																			<FormGroup className="mb-3">
																				<Label htmlFor="receiptAttachmentDescription">
																					{strings.AttachmentDescription}
																				</Label><br />
																				<TextField
																					type="textarea"
																					className="textarea form-control"
																					maxLength="250"
																					style={{ width: "870px" }}
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
																	<Row>
																		<Col
																			lg={12}
																			className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
																		>
																			<FormGroup className="text-right w-100">
																				<Button
																					type="submit"
																					color="primary"
																					className="btn-square mr-3"
																					disabled={this.state.disabled}
																					onClick={() => {
																						//	added validation popup	msg
																						props.handleBlur();
																						if (props.errors && Object.keys(props.errors).length != 0)
																							this.props.commonActions.fillManDatoryDetails();

																					}}
																				>
																					<i className="fa fa-dot-circle-o"></i>{' '}
																					{this.state.disabled
																						? 'Recording...'
																						: strings.RecordPayment}
																				</Button>
																				<Button
																					color="secondary"
																					className="btn-square"
																					onClick={() => {
																						if (this.props?.location?.state?.id.renderURL) {
																							this.props.history.push(
																								`${this.props?.location?.state?.id?.renderURL}`, 
																								{ id: this.props?.location?.state?.id?.renderID },);
																						} else
																							this.props.history.push(
																								'/admin/expense/supplier-invoice',
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
)(RecordSupplierPayment);
