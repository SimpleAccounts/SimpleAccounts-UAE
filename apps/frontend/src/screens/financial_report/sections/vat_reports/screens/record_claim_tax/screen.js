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
import * as VatreportActions from '../../actions';
import { Loader } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import './style.scss';
import moment from 'moment';
import {data}  from '../../../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		contact_list: state.customer_invoice.contact_list,
		customer_list: state.customer_invoice.customer_list,
		pay_mode: state.customer_invoice.pay_mode,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		vatreportActions: bindActionCreators(
			VatreportActions,
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
class RecordTaxClaim extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			dialog: false,
			data: [],
			headerValue: this.props.location.state.taxReturns ?this.props.location.state.taxReturns :'',
			initValue: {
				receiptNo: '',
				vatPaymentDate: new Date(),
				reportId: this.props.location.state.id ?this.props.location.state.id :'',
				amount: '',
				totalTaxReclaimable:this.props.location.state.totalTaxReclaimable ?this.props.location.state.totalTaxReclaimable :0.00,
				payMode: '',
				notes: '',
				depositeTo: '',
				referenceCode: '',
				attachmentFile: '',
			},
			contactType: 2,
			fileName: '',
			disabled: false,
			deposit_list:[],
			loadingMsg:"Loading..."
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
	this.props.vatreportActions.getDepositList().then((res)=>{	
		this.setState({deposit_list:res})
	})
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

	handleSubmit = (data) => {
		this.setState({ disabled: true });
		const { invoiceId } = this.state;
		const {
			vatPaymentDate,
			reportId,
			amount,
			depositeTo,
			payMode,
			notes,
			referenceCode,
		} = data;

		let formData = new FormData();
		formData.append(
			'vatPaymentDate',
			typeof vatPaymentDate === 'string'
				? moment(vatPaymentDate, 'DD-MM-YYYY').toDate()
				: vatPaymentDate,
		);

		formData.append('amount', amount !== null ? amount : '');
		formData.append('notes', notes !== null ? notes : '');
		formData.append(
			'referenceCode',
			referenceCode !== null ? referenceCode : '',
		);
		formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
		//  formData.append('payMode', payMode !== null &&payMode.value ? payMode.value : 'CASH' );
		if (reportId) {
			formData.append('id', reportId);
			formData.append('vatFiledNumber', reportId);
		}
		formData.append('isVatReclaimed', true);
		if (this.uploadFile?.files?.[0]) {
			formData.append('attachmentFile', this.uploadFile?.files?.[0]);
		}
		this.setState({ loading:true, loadingMsg:"Tax Claim Recording..."});
		this.props.vatreportActions.recordVatPayment(formData)
			.then((res) => {
				
				this.props.commonActions.tostifyAlert(
					'success',
					 'Tax Claim Recorded Successfully',
				);
				this.props.history.push('/admin/report/vatreports');
				this.setState({ loading:false,});
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert( 
					'error',
					err && err.data ? err.data.message : 'Payment Recorded Unsuccessfully',
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
		const { initValue, loading, dialog ,headerValue,deposit_list,loadingMsg} = this.state;
		const { pay_mode, customer_list,  } = this.props;

		let tmpcustomer_list = []

		customer_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpcustomer_list.push(obj)
		})

		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
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
											Record VAT Claim For {headerValue}
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
														 if (values.amount < 1) {
														  errors.amount ='Amount cannot be Less Than 1';
													 }
													 return errors
													}}
													validationSchema={Yup.object().shape({
														depositeTo: Yup.string().required(
															'Deposit to is required',
														),
														// payMode: Yup.string().required(
														// 	'Payment mode is required',
														// ),
														amount: Yup.mixed().required("Amount is required")
														.test(
															'amount',
															'Amount should be equal to total tax reclaimable amount',
															(value) => {
																if (
																	!value 
																	 ||	(value  == this.props.location.state.totalTaxReclaimable)
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
																		<Label htmlFor="totalTaxReclaimable">
																			<span className="text-danger">* </span>{' '}
																		Total VAT Reclaimable
																		</Label>
																		<Input
																			type="number"
																			disabled
																			id="totalTaxReclaimable"
																			name="totalTaxReclaimable"
																			value={props.values.totalTaxReclaimable}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal.test(option.target.value),
																					props.handleChange('totalTaxReclaimable')(option)
																				) {
																					props.handleChange('totalTaxReclaimable')(option);
																				}
																			}}
																			className={
																				props.errors.totalTaxReclaimable &&
																				props.touched.amount
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.totalTaxReclaimable &&
																			props.touched.totalTaxReclaimable && (
																				<div className="invalid-feedback">
																					{props.errors.totalTaxReclaimable}
																				</div>
																			)}
																	</FormGroup>
																</Col>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="project">
																			<span className="text-danger">* </span>{' '}
																			Amount Reclaimed
																		</Label>
																		<Input
																			type="text"
																			placeholder='Enter Amount Reclaimed'
																			id="amount"
																			name="amount"
																			value={props.values.amount}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regDecimal.test(option.target.value),
																					props.handleChange('amount')(option)
																				) {
																					props.handleChange('amount')(option);
																				}
																			}}
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
																			id="vatPaymentDate"
																			name="vatPaymentDate"
																			placeholderText={strings.PaymentDate}
																			showMonthDropdown
																			showYearDropdown
																			dateFormat="dd-MM-yyyy"
																			dropdownMode="select"
																			value={props.values.vatPaymentDate}
																			selected={props.values.vatPaymentDate}
																			onChange={(value) => {
																				props.handleChange('vatPaymentDate')(
																					value,
																				);
																			}}
																			className={`form-control ${
																				props.errors.vatPaymentDate &&
																				props.touched.vatPaymentDate
																					? 'is-invalid'
																					: ''
																			}`}
																		/>
																		{props.errors.vatPaymentDate &&
																			props.touched.vatPaymentDate && (
																				<div className="invalid-feedback">
																					{props.errors.vatPaymentDate}
																				</div>
																			)}
																	</FormGroup>
																</Col>
																<Col lg={4}>
																	<FormGroup className="mb-3">
																		<Label htmlFor="depositeTo">
																			<span className="text-danger">* </span>{' '}
																			{strings.DepositTo}
																		</Label>
																		<Select
																			styles={customStyles}
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
																			placeholder={strings.Select+strings.DepositTo}
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
															<Row>
															
															</Row>
															<hr />
															<Row>
																<Col lg={8}>
																	<Row>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="referenceCode">
																					{strings.ReferenceNo}
																				</Label>
																				<Input
																					type="text"
																					id="referenceCode"
																					name="referenceCode"
																					placeholder="e.g. Receipt Number"
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExBoth.test(
																								option.target.value,
																							)
																						) {
																							props.handleChange(
																								'referenceCode',
																							)(option);
																						}
																					}}
																					value={props.values.referenceCode}
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
																					placeholder={strings.DeliveryNotes}
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
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();

																		}}
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			 {/* {strings.RecordPayment} */}
																			 {this.state.disabled
																			? 'Recording...'
																			: strings.RecordPayment }
																		</Button>
																		<Button
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				this.props.history.push(
																					'/admin/report/vatreports',
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
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(RecordTaxClaim);
