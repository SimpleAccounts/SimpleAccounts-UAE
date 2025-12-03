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
import * as DebitNotesRefundActions from './actions';
import * as DebiteNoteActions from '../../actions';
import { Loader, LeavePage } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import moment from 'moment';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { TextareaAutosize } from '@material-ui/core';

const mapStateToProps = (state) => {
	return {
		customer_list: state.common.customer_list,
		deposit_list: state.customer_invoice.deposit_list,
		pay_mode: state.common.pay_mode,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		debiteNoteActions: bindActionCreators(DebiteNoteActions, dispatch,),
		debitNotesRefundActions: bindActionCreators(
			DebitNotesRefundActions,
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
class DebitNoteRefund extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			dialog: false,
			initValue: {
				receiptNo: '',
				contactId: this.props.location.state.id.contactId,
				amount: this.props.location.state.id.dueAmount,
				payMode: { label: 'CASH', value: 'CASH' },
				paymentDate: new Date(this.props.location.state.id.creditNoteDate),
				notes: '',
				depositeTo: { label: 'Petty Cash', value: 47 },
				referenceCode: '',
				attachmentFile: '',
				receiptNumber: this.props.location.state.id.creditNoteNumber ? this.props.location.state.id.creditNoteNumber : '',
				invoiceNumber: this.props.location.state.id.invNumber ? this.props.location.state.id.invNumber : '',
				debitNoteDate: this.props.location.state.id.creditNoteDate ? new Date(moment(this.props.location.state.id.creditNoteDate,'DD-MM-YYYY').format()) : '',
			},
			amount: this.props.location.state.id.dueAmount,
			invoiceId: this.props.location.state.id.id,
			isCNWithoutProduct: this.props.location.state.id.isCNWithoutProduct,
			contactType: 1,
			fileName: '',
			disabled: false,
			loadingMsg: "Loading...",
			disableLeavePage: false,

		};
		this.formRef = React.createRef();
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
		this.props.debiteNoteActions.getDepositList();
		this.props.commonActions.getPaymentMode();
		this.props.commonActions.getCustomerList(this.state.contactType);
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
		this.setState({ disabled: true, disableLeavePage: true });
		const { invoiceId } = this.state;
		const {
			receiptNo,
			paymentDate,
			contactId,
			amount,
			depositeTo,
			payMode,
			notes,
			referenceCode,
		} = data;

		let formData = new FormData();
		if (this.state.isCNWithoutProduct == true) {
			// formData.append('isCNWithoutProduct', this.state.isCNWithoutProduct);
			formData.append('creditNoteId', this.props.location.state.id.id);
			formData.append('amountReceived', amount !== null ? amount : '');
			formData.append('notes', notes !== null ? notes : '');
			formData.append('type', '13');
			formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
			formData.append('payMode', payMode !== null ? payMode.value : '');
			if (contactId) {
				formData.append('contactId', contactId);
			}
			formData.append(
				'paymentDate',
				typeof paymentDate === 'string'
					? moment(paymentDate, 'DD/MM/YYYY').toDate()
					: paymentDate,
			);
			this.setState({ loading: true, loadingMsg: "Credit Refunding..." });
			this.props.debitNotesRefundActions.refundPaymentCNWithoutInvoice(formData)
				.then((res) => {
					this.props.commonActions.tostifyAlert(
						'success',strings.RefundRecordedSuccessfully
					);
					this.props.history.push('/admin/expense/debit-notes');
					this.setState({ loading: false, });
				})
				.catch((err) => {
					this.setState({ loading: false, loadingMsg: "", disabled: false, disableLeavePage: false });
					this.props.commonActions.tostifyAlert(
						'error', strings.RefundRecordedUnsuccessfully,
					);
				});
		}//
		else {
			formData.append('isCNWithoutProduct', false);
			formData.append('creditNoteId', this.props.location.state.id.id);
			formData.append('amountReceived', amount !== null ? amount : '');
			formData.append('notes', notes !== null ? notes : '');
			formData.append('type', '13');
			formData.append('invoiceId', this.state.invoiceId)
			formData.append('depositTo', depositeTo !== null ? depositeTo.value : '');
			formData.append('payMode', payMode !== null ? payMode.value : '');
			if (contactId) {
				formData.append('contactId', contactId);
			}
			formData.append(
				'paymentDate',
				typeof paymentDate === 'string'
					? moment(paymentDate, 'DD/MM/YYYY').toDate()
					: paymentDate,
			);
			formData.append('payMode', payMode !== null ? payMode.value : '');
			if (contactId) {
				formData.append('contactId', contactId);
			}
			if (this.uploadFile?.files?.[0]) {
				formData.append('attachmentFile', this.uploadFile?.files?.[0]);
			}
			this.setState({ loading: true, loadingMsg: " Payment Refunding..." });
			this.props.debitNotesRefundActions.refundPaymentCNWithInvoice(formData)
				.then((res) => {
					this.props.commonActions.tostifyAlert(
						'success', strings.RefundRecordedSuccessfully,
					);
					this.props.history.push('/admin/expense/debit-notes');
					this.setState({ loading: false, });
				})
				.catch((err) => {
					this.setState({ loading: false, loadingMsg: "", disabled: false, disableLeavePage: false });
					this.props.commonActions.tostifyAlert(
						'error', strings.RefundRecordedUnsuccessfully,
					);
				});
		}//
	};

	render() {

		strings.setLanguage(this.state.language);
		const { initValue, loading, dialog, loadingMsg } = this.state;
		const { pay_mode, customer_list, deposit_list } = this.props;

		let tmpcustomer_list = []

		customer_list.map(item => {
			let obj = { label: item.label.contactName, value: item.value }
			tmpcustomer_list.push(obj)
		})

		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> : <div className="detail-customer-invoice-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa fa-credit-card" />
												<span className="ml-2">
													{strings.RecordRefundOnDebitNote}
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
														if (!values.amount || values.amount == 0) {
															errors.amount = strings.AmountCannotBeZero;
														} else if (this.state.amount < parseFloat(values.amount)) {
															errors.amount = strings.AmountCannotBeGreaterThanDebitAmount;
														}
														if (!values.paymentDate) {
															errors.paymentDate = strings.PaymentDateIsRequired;
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
																			{strings.SupplierName}
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
															</Row>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="amount">
																			<span className="text-danger">* </span>{' '}
																			{strings.AmountReceived}
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
																				if ((option.target.value === '' || this.regDecimal.test(option.target.value))
																					&& parseFloat(option.target.value) !== 0) {
																					props.handleChange('amount')(option);
																				}
																			}}
																			placeholder={strings.AmountReceived}
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
																	{console.log(this.props.location.state.id,props.values.debitNoteDate)}
																	<FormGroup className="mb-3">
																		<Label htmlFor="paymentDate">
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
																			minDate={new Date(props.values.paymentDate)}
																			maxDate={null}
																			dropdownMode="select"
																			value={props.values.paymentDate}
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
																			<span className="text-danger">* </span>{' '}
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
																			{strings.ReceivedThrough}
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
																			placeholder={strings.Select + strings.ReceivedThrough}
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
																<Col lg={4}>
																	<FormGroup className="py-2">
																		<Label htmlFor="notes">{strings.RefundNotes}</Label><br />
																		<TextareaAutosize
																			type="textarea"
																			className="textarea form-control"
																			maxLength="255"
																			name="notes"
																			id="notes"
																			minRows="2"
																			placeholder={strings.Enter + strings.Notes}
																			onChange={(option) => {
																				if ((!props.values.notes && option.target.value !== ' ') || props.values.notes)
																					props.handleChange('notes')(option)
																			}}
																			value={props.values.notes}
																		/>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="receiptAttachmentDescription">
																			{strings.AttachmentDescription}
																		</Label><br />
																		<TextareaAutosize
																			type="textarea"
																			className="textarea form-control"
																			maxLength="255"
																			name="receiptAttachmentDescription"
																			id="receiptAttachmentDescription"
																			minRows="2"
																			placeholder={strings.ReceiptAttachmentDescription}
																			onChange={(option) => {
																				if ((!props.values.receiptAttachmentDescription && option.target.value !== ' ') || props.values.receiptAttachmentDescription)
																					props.handleChange(
																						'receiptAttachmentDescription',
																					)(option)
																			}}
																			value={
																				props.values
																					.receiptAttachmentDescription
																			}
																		/>
																	</FormGroup>
																</Col>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Field
																			name="attachmentFile"
																			render={({ field, form }) => (
																				<div>
																					<Label>{strings.ReceiptAttachment}</Label>{' '}
																					<br />

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

															<Row>
																<Col lg={4}>
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
																				? 'Refunding...'
																				: strings.RefundPayment}
																		</Button>
																		<Button
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				if (this.props?.location?.state?.id.renderURL) {
																					this.props.history.push(
																						`${this.props?.location?.state?.id.renderURL}`, 
																						{ id: this.props?.location?.state?.id.renderID, 
																						isCNWithoutProduct: this.props.location.state.id.isCNWithoutProduct }
																						);
																				} else
																					this.props.history.push(
																					'/admin/expense/debit-notes',
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
				{this.state.disableLeavePage ? "" : <LeavePage />}
			</div >
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(DebitNoteRefund);
