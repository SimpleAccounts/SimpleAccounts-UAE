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
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as CTReportActions from '../../actions';
import { Loader, LeavePage } from 'components';
import { CommonActions } from 'services/global';
import moment from 'moment';
import { data } from '../../../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		contact_list: state.customer_invoice.contact_list,
		//customer_list: state.customer_invoice.customer_list,
		pay_mode: state.customer_invoice.pay_mode,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		ctReportActions: bindActionCreators(CTReportActions, dispatch,),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
let strings = new LocalizedStrings(data);
class CorporateTaxPaymentRecord extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			dialog: false,
			discount_option: '',
			data: [],
			headerValue: this.props.location.state.taxPeriod ? this.props.location.state.taxPeriod : '',
			initValue: {
				receiptNo: '',
				paymentDate: this.props.location.state && this.props.location.state.taxFiledOn ? new Date(this.props.location.state.taxFiledOn) : '',
				reportId: this.props.location.state && this.props.location.state.id ? this.props.location.state.id : '',
				amountPaid: '',
				totalAmount: this.props.location.state && this.props.location.state.totalAmount ? this.props.location.state.totalAmount : 0.00,
				notes: '',
				paidThrough: {value: 47, label: 'Petty Cash'},
				referenceNumber: '',
				attachmentFile: '',
				paidInvoiceListStr: [],
				balanceDue: this.props.location.state && this.props.location.state.balanceDue ? this.props.location.state.balanceDue : '',
			},
			reportId: this.props.location.state && this.props.location.state.id ? this.props.location.state.id : '',
			contactType: 2,
			openCustomerModal: false,
			selectedContact: '',
			term: '',
			selectedType: '',
			discountPercentage: '',
			discountAmount: 0,
			fileName: '',
			disabled: false,
			reportfilledOn: this.props.location.state && this.props.location.state.taxFiledOn ? new Date(this.props.location.state.taxFiledOn) : '',
			loadingMsg: "Loading...",
			disableLeavePage: false,
		};
		this.formRef = React.createRef();
		this.regEx = /^[0-9\b]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
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
		this.props.ctReportActions.getDepositList().then((res) => {
			this.setState({ deposit_list: res });
		})
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
		console.log(data);
		this.setState({ disabled: true });
		const {
			paymentDate,
			reportId,
			amountPaid,
			paidThrough,
			totalAmount,
			referenceNumber,
		} = data;
		const postData={
			paymentDate: paymentDate ? moment(paymentDate).format('DD/MM/YYYY') : '',
			amountPaid:amountPaid !== null ? parseFloat(amountPaid) : '',
			refereNumber:referenceNumber !== null ? referenceNumber : '',
			depositToTransactionCategoryId: paidThrough !== null ? paidThrough.value : '',
			corporateTaxFilingId: reportId,
			totalAmount:totalAmount?parseFloat(totalAmount):'',
		}

		// let formData = new FormData();
		// //formData.append('paymentDate', typeof paymentDate === 'string' ? moment(paymentDate, 'DD-MM-YYYY').toDate() : paymentDate,);
		// formData.append('paymentDate', moment(paymentDate, 'DD-MM-YYYY'));
		// formData.append('amountPaid', amountPaid !== null ? amountPaid : '');
		// formData.append('totalAmount', totalAmount !== null ? totalAmount : 0);
		// formData.append('notes', notes !== null ? notes : '');
		// formData.append('referenceNumber', referenceNumber !== null ? referenceNumber : '',);
		// formData.append('depositToTransactionCategoryId', paidThrough !== null ? paidThrough.value : '');
		// if (reportId) {
		// 	formData.append('corporateTaxFilingId', reportId);
		// 	formData.append('vatFiledNumber', reportId);
		// }

		this.setState({ loading: true, disableLeavePage: true, loadingMsg: "Tax Claim Recording..." });
		this.props.ctReportActions.recordCTPayment(postData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Payment Recorded Successfully!',
					);

					this.props.history.push('/admin/report/corporate-tax');
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Payment Recorded Unsuccessfully!',
				);
				this.setState({ loading: false, });
			});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { initValue, loading, dialog, headerValue, deposit_list, loadingMsg } = this.state;
		const { pay_mode } = this.props;

		// let tmpcustomer_list = []
		// customer_list.map(item => {
		// 	let obj = { label: item.label.contactName, value: item.value }
		// 	tmpcustomer_list.push(obj)
		// })

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
															{strings.RecordPaymentTaxPeriod}  ({headerValue})
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
																if (values.amountPaid < 1) {
																	errors.amountPaid = 'Amount cannot be less Than 1';
																}
																//  if (values.amountPaid==0 ) {
																// 	errors.amount ='Amount cannot be less Than 0';
																//  }
																if (!values.amountPaid) {
																	errors.amountPaid = 'Amount is required';
																}
																if (!values.paymentDate) {
																	errors.paymentDate = 'Payment date is required';
																}

																if (parseFloat(values.amountPaid) > values.balanceDue) {
																	errors.amountPaid = "Amount Cannot Be greater than Balance amount"
																}

																return errors
															}}
															validationSchema={Yup.object().shape({
																paidThrough: Yup.string().required(
																	'Paid through is required',
																),
																amountPaid: Yup.mixed()
																	.test(
																		'amountPaid',
																		'Amount cannot be greater than total tax payable amount',
																		(value) => {
																			if (
																				!value ||
																				(value <= this.props.location.state.totalAmount)
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
																				<Label htmlFor="totalAmount">
																					<span className="text-danger">* </span> {strings.TotalCorporateTaxAmount}
																				</Label>
																				<Input
																					type="number"
																					disabled
																					id="totalAmount"
																					name="totalAmount"
																					value={props.values.totalAmount}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regDecimal.test(option.target.value),
																							props.handleChange('totalAmount')(option)
																						) {
																							props.handleChange('totalAmount')(option);
																						}
																					}}
																					className={
																						props.errors.totalAmount &&
																							props.touched.totalAmount
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.totalAmount &&
																					props.touched.totalAmount && (
																						<div className="invalid-feedback">
																							{props.errors.totalAmount}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="project">
																					<span className="text-danger">* </span>{' '}
																					Balance Due
																				</Label>
																				<Input
																					disabled
																					type="number"
																					placeholder='Enter Balance Amount'
																					id="balanceDue"
																					name="balanceDue"
																					value={props.values.balanceDue}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regDecimal.test(option.target.value),
																							props.handleChange('balanceDue')(option)
																						) {
																							props.handleChange('balanceDue')(option);
																						}
																					}}
																					className={
																						props.errors.balanceDue &&
																							props.touched.balanceDue
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.balanceDue &&
																					props.touched.balanceDue && (
																						<div className="invalid-feedback">
																							{props.errors.balanceDue}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="amountPaid">
																					<span className="text-danger">* </span>{' '}
																					Amount Paid
																				</Label>
																				<Input
																					type="text"
																					min="0"
																					placeholder='Enter Amount Paid'
																					id="amountPaid"
																					name="amountPaid"
																					value={props.values.amountPaid}
																					onChange={(option) => {
																						if (option.target.value === '' || this.regDecimal.test(option.target.value)) {
																							props.handleChange('amountPaid')(option);
																						}
																					}}
																					className={
																						props.errors.amountPaid &&
																							props.touched.amountPaid
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.amountPaid &&
																					props.touched.amountPaid && (
																						<div className="invalid-feedback">
																							{props.errors.amountPaid}
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
																					placeholderText={'Select ' + strings.PaymentDate}
																					showMonthDropdown
																					showYearDropdown
																					dateFormat="dd-MM-yyyy"
																					dropdownMode="select"
																					value={props.values.paymentDate ? props.values.paymentDate : this.state.reportfilledOn}
																					selected={props.values.paymentDate ? props.values.paymentDate : this.state.reportfilledOn}
																					minDate={this.state.reportfilledOn}
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
																		<Col lg={4}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="paidThrough">
																					<span className="text-danger">* </span>{' '}
																					{strings.PaidThrough}
																				</Label>
																				<Select
																					// styles={customStyles}
																					options={deposit_list}
																					value={props.values.paidThrough}
																					onChange={(option) => {
																						console.log(option)
																						if (option && option.value) {
																							props.handleChange('paidThrough')(
																								option,
																							);
																						} else {
																							props.handleChange('paidThrough')('');
																						}
																					}}
																					placeholder={strings.Select + strings.PaidThrough}
																					id="paidThrough"
																					name="paidThrough"
																					className={
																						props.errors.paidThrough &&
																							props.touched.paidThrough
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				{props.errors.paidThrough &&
																					props.touched.paidThrough && (
																						<div className="invalid-feedback">
																							{props.errors.paidThrough}
																						</div>
																					)}
																			</FormGroup>
																		</Col>{' '}
																	</Row>
																	<Row>

																	</Row>
																	<hr />
																	<Row>
																		<Col lg={8}>
																			<Row>
																				<Col lg={6}>
																					<FormGroup className="mb-3">
																						<Label htmlFor="referenceNumber">
																							{strings.ReferenceNo}
																						</Label>
																						<Input
																							type="text"
																							id="referenceNumber"
																							name="referenceNumber"
																							placeholder="e.g. Receipt Number"
																							maxLength={'20'}
																							onChange={(option) => {
																								// if (
																								// 	option.target.value === '' ||
																								// 	this.regExBoth.test(
																								// 		option.target.value,
																								// 	)
																								// ) {
																									props.handleChange(
																										'referenceNumber',
																									)(option);
																								// }
																							}}
																							value={props.values.referenceNumber}
																						/>
																					</FormGroup>
																				</Col>
																			</Row>
																			{/* <Row>
																		<Col lg={12}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="notes">{strings.Notes}</Label>
																				<Input
																					type="textarea"
																					name="notes"
																					id="notes"
																					rows="5"
																					placeholder={strings.Notes}
																					onChange={(option) =>
																						props.handleChange('notes')(option)
																					}
																					defaultValue={props.values.notes}
																				/>
																			</FormGroup>
																		</Col>
																	</Row> */}
																		</Col>
																		{/* <Col lg={4}>
																	<Row>
																		<Col lg={12}>
																			<FormGroup className="mb-3">
																				<Field
																					name="attachmentFile"
																					render={({ field, form }) => (
																						<div>
																							<Label>{strings.Attachment}</Label> <br />
																							<div className="file-upload-cont">
																								<Button
																									color="primary"
																									onClick={() => {
																										document
																											.getElementById(
																												'fileInput',
																											)
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
																								/> */}
																		{/* {this.state.fileName && (
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
																								)} */}
																		{/* {this.state.fileName ? (
																									this.state.fileName
																								) : (
																									<NavLink
																										// href={`${API_ROOT_URL.API_ROOT_URL}${initValue.filePath}`}
																										download={
																											this.state.initValue
																												.fileName
																										}
																										style={{
																											fontSize: '0.875rem',
																										}}
																										target="_blank"
																									>
																										{
																											this.state.initValue
																												.fileName
																										}
																									</NavLink>
																								)}
																							</div>
																						</div>
																					)}
																				/>
																				{props.errors.attachmentFile && (
																					<div className="invalid-file">
																						{props.errors.attachmentFile}
																					</div>
																				)}
																			</FormGroup>
																		</Col>
																	</Row>
																</Col> */}
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
																						console.log(props.errors)
																						props.handleBlur();
																						if (props.errors && Object.keys(props.errors).length != 0)
																							this.props.commonActions.fillManDatoryDetails();

																					}}
																				>
																					<i className="fa fa-dot-circle-o"></i>{' '}
																					{/* {strings.RecordPayment} */}
																					{this.state.disabled
																						? 'Recording...'
																						: strings.RecordPayment}
																				</Button>
																				<Button
																					color="secondary"
																					className="btn-square"
																					onClick={() => {
																						this.props.history.push(
																							'/admin/report/corporate-tax',
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
)(CorporateTaxPaymentRecord);
