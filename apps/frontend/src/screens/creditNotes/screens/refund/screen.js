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
import * as CustomerRecordPaymentActions from './actions';
import * as CnActions from '../../actions';
import { CustomerModal } from '../../sections';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import moment from 'moment';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { TextareaAutosize } from '@material-ui/core';

const mapStateToProps = (state) => {
	return {
		contact_list: state.customer_invoice.contact_list,
		customer_list: state.customer_invoice.customer_list,
		deposit_list: state.customer_invoice.deposit_list,
		pay_mode: state.customer_invoice.pay_mode,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		cnActions: bindActionCreators(
			CnActions,
			dispatch,
		),
		CustomerRecordPaymentActions: bindActionCreators(
			CustomerRecordPaymentActions,
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
class Refund extends React.Component {
	constructor(props) {

		super(props);
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
				receiptNo: '',
				receiptDate: new Date(),
				contactId: this.props.location.state.id.contactId,
				amount: this.props.location.state.id.dueAmount,
				payMode: { label: 'CASH', value: 'CASH' },
				notes: '',
				depositeTo: { label: 'Petty Cash', value: 47 },
				referenceCode: '',
				attachmentFile: '',
				paidInvoiceListStr: [],
			},
			amount: this.props.location.state.id.dueAmount,
			invoiceId: this.props.location.state.id.id,
			isCNWithoutProduct: this.props.location.state.id.isCNWithoutProduct,
			contactType: 2,
			openCustomerModal: false,
			selectedContact: '',
			term: '',
			selectedType: '',
			discountPercentage: '',
			discountAmount: 0,
			fileName: '',
			disabled: false,
			invoiceNumber:"-",
			showInvoiceNumber:false,
			receiptNumber:'',
			loadingMsg:"Loading...",
			creditNoteDate: this.props.location.state.id.invoiceDate,
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
			this.props.cnActions.getDepositList(),
			this.props.cnActions.getPaymentMode(),
			this.props.cnActions.getCustomerList(this.state.contactType),
		]);
		this.getReceiptNo();
		//INV number & cn number
		this.props.cnActions
			.getInvoicesForCNById(this.props.location.state.id.id)
			.then((res) => {
				
				if (res.status === 200) {
					if(res.data.length && res.data.length !=0 )
					this.setState(
						{
							invoiceNumber: res.data[0].invoiceNumber,
							receiptNumber:res.data[0].creditNoteNumber,
							showInvoiceNumber:true
						},
						() => {	},
					);
				}
			})
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
			reader.onloadend = () => {};
			reader.readAsDataURL(file);
			props.setFieldValue('attachmentFile', file, true);
		}
	};
	showInvoiceNumber=()=>{

		return(
			this.state.showInvoiceNumber &&(
			<Col lg={4}>
				<FormGroup className="mb-3">
				<Label htmlFor="project">{strings.InvoiceNumber}</Label>
					<Input
						disabled
						id="invoiceNumber"
						name="invoiceNumber"
						value={this.state.invoiceNumber}
			/>
				</FormGroup>
			</Col>)
		)
	}
	
	handleSubmit = (data) => {
		this.setState({ disabled: true });
		const { invoiceId } = this.state;
		const {
			receiptNo,
			receiptDate,
			contactId,
			amount,
			depositeTo,
			payMode,
			notes,
			referenceCode,
		} = data;

		let formData = new FormData();
	if(this.state.isCNWithoutProduct ==true)
	{	
		// formData.append('isCNWithoutProduct', this.state.isCNWithoutProduct);
		formData.append('creditNoteId', this.props.location.state.id.id);
		formData.append('amountReceived', amount !== null ? amount : '');
		formData.append('notes', notes !== null ? notes : '');

		formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
		formData.append('payMode', payMode !== null ? payMode.value : '');
		if (contactId) {
			formData.append('contactId', contactId);
		}
		formData.append('type', '7');
		formData.append(
			'paymentDate',
			typeof receiptDate === 'string'
				? moment(receiptDate, 'DD/MM/YYYY').toDate()
				: receiptDate,
		);
		this.setState({ loading:true, loadingMsg:"Credit Refunding..."});
		this.props.CustomerRecordPaymentActions.recordPaymentCNWithoutInvoice(formData)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Refund Recorded successfully',
				);
				this.props.history.push('/admin/income/credit-notes');
				this.setState({ loading:false,});
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Credit Refund Unsuccessfully.',
				);
			});
		}//
	else
	{
		formData.append('isCNWithoutProduct',false);
		formData.append('creditNoteId', this.props.location.state.id.id);
		formData.append('amountReceived', amount !== null ? amount : '');
		formData.append('notes', notes !== null ? notes : '');
		formData.append('type', '7');
		formData.append('invoiceId',this.state.invoiceId)
		formData.append('depositTo', depositeTo !== null ? depositeTo.value : '');
		formData.append('payMode', payMode !== null ? payMode.value : '');
		if (contactId) {
			formData.append('contactId', contactId);
		}
		formData.append(
			'paymentDate',
			typeof receiptDate === 'string'
				? moment(receiptDate, 'DD/MM/YYYY').toDate()
				: receiptDate,
		);		
			formData.append('payMode', payMode !== null ? payMode.value : '');
		if (contactId) {
			formData.append('contactId', contactId);
		}
		if (this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		this.setState({ loading:true, loadingMsg:" Payment Refunding..."});
		this.props.CustomerRecordPaymentActions.recordPayment(formData)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? 'Refund Recorded Successfully!' : res.data.message ,
				);
				this.props.history.push('/admin/income/credit-notes');
				this.setState({ loading:false,});
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Credit Refund Unsuccessfully.',
				);
			});
		}//
	};

	openCustomerModal = (e) => {
		e.preventDefault();
		this.setState({ openCustomerModal: true });
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
			this.props.cnActions.getCustomerList(this.state.contactType);
		}
		this.setState({ openCustomerModal: false });
	};

	deleteInvoice = () => {
		const message1 =
		<text>
		<b>Delete Customer Invoice?</b>
		</text>
		const message = 'This Customer Invoice will be deleted permanently and cannot be recovered. ';
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
		this.setState({ loading:true, loadingMsg:"Deleting Invoice..."});
		this.props.customerInvoiceDetailActions
			.deleteInvoice(current_customer_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message :'Invoice Deleted Successfully',
					);
					this.props.history.push('/admin/income/credit-notes');
					this.setState({ loading:false,});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Invoice Deleted Unsuccessfully',
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
		const { initValue, loading, dialog ,loadingMsg} = this.state;
		const { pay_mode, customer_list, deposit_list } = this.props;

		let tmpcustomer_list = []

		customer_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpcustomer_list.push(obj)
		})

		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
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
												 {strings.RefundForCreditNote}
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
														 if (values.amount == 0) {
														  errors.amount =
														'Amount cannot be empty or 0';
													 }else if(this.state.amount<parseFloat(values.amount)){ 
														errors.amount =
														'Amount cannot More than the Credit Amount';
													 }
													 if(!values.receiptDate){
														errors.receiptDate='Payment date is required';
													 }
													 return errors
													 }}
													validationSchema={Yup.object().shape({
														depositeTo: Yup.string().required(
															'Deposit to is required',
														),
														payMode: Yup.string().required(
															'Payment mode is required',
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
																			 {strings.CustomerName}
																		</Label>
																		<Select
																			styles={customStyles}
																			id="contactId"
																			name="contactId"
																			isDisabled
																			value={
																				tmpcustomer_list &&
																				tmpcustomer_list.find(
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
																{
																this.state.isCNWithoutProduct !=true &&
																(this.showInvoiceNumber())}
																{/* <Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="project">
																			<span className="text-danger">* </span>{' '}
																			Payment
																		</Label>
																		<Input
																			type="text"
																			id="receiptNo"
																			name="receiptNo"
																			placeholder=""
																			disabled
																			value={props.values.receiptNo}
																			onChange={(value) => {
																				props.handleChange('receiptNo')(value);
																			}}
																			className={
																				props.errors.receiptNo &&
																				props.touched.receiptNo
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.receiptNo &&
																			props.touched.receiptNo && (
																				<div className="invalid-feedback">
																					{props.errors.receiptNo}
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
																			 {strings.AmountRefund}
																		</Label>
																		<Input
																			type="text"
																			min={0}
																			maxLength="14,2"
																			max={this.state.amount}
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
																			placeholder={strings.AmounttoRefund}
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
																			{strings.RefundDate}
																		</Label>
																		<DatePicker
																			id="receiptDate"
																			name="receiptDate"
																			placeholderText={strings.RefundDate}
																			showMonthDropdown
																			showYearDropdown
																			dateFormat="dd-MM-yyyy"
																			dropdownMode="select"
																			minDate={new Date(moment(this.state.creditNoteDate,'YYYY-MM-DD').format())}																										
																			value={props.values.receiptDate}
																			selected={props.values.receiptDate}
																			onChange={(value) => {
																				props.handleChange('receiptDate')(
																					value,
																				);
																			}}
																			className={`form-control ${
																				props.errors.receiptDate &&
																				props.touched.receiptDate
																					? 'is-invalid'
																					: ''
																			}`}
																		/>
																		{props.errors.receiptDate &&
																			props.touched.receiptDate && (
																				<div className="invalid-feedback">
																					{props.errors.receiptDate}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="payMode">
																			<span className="text-danger">* </span>{' '}
																			 {strings.RefundMode}
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
																			placeholder={strings.Select+strings.RefundMode}
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
																		      {strings.RefundFrom}
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
																			placeholder={strings.Select+strings.RefundFrom}
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
																		<Label htmlFor="notes">{strings.RefundNotes}</Label><br/>
																		<TextareaAutosize
																			type="textarea"
																			style={{width: "870px"}}
																			className="textarea form-control"
																			maxLength="255"
																			name="notes"
																			id="notes"
																			rows="2"
																			placeholder={strings.RefundNotes}
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
																					value={this.state.receiptNumber}
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
																		</Label><br/>
																		<TextareaAutosize
																			type="textarea"
																			className="textarea form-control"
																			maxLength="250"
																			style={{width: "870px"}}
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
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();

																			}}
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			{this.state.disabled
																			? 'Refunding...'
																			: strings.RefundPayment}
																		</Button>
																		<Button
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				if (this.props?.location?.state?.id?.renderURL) {
																					this.props.history.push(
																						`${this.props?.location?.state?.id?.renderURL}`, 
																						{ id: this.props?.location?.state?.id?.renderID, 
																						isCNWithoutProduct: this.props?.location?.state?.id?.isCNWithoutProduct }
																						);
																				} else
																					this.props.history.push(
																						'/admin/income/credit-notes',
																					);
																			}}
																		>
																			<i className="fa fa-ban"></i>  {strings.Cancel}
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
					createCustomer={this.props.cnActions.createCustomer}
					currency_list={this.props.currency_list}
					country_list={this.props.country_list}
					getStateList={this.props.cnActions.getStateList}
				/>
				{this.state.disableLeavePage ? "" : <LeavePage />}
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Refund);
