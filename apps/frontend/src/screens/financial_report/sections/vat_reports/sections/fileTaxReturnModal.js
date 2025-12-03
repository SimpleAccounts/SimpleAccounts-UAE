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
	ModalBody,
	ModalFooter,
	ModalHeader,
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import { toast } from 'react-toastify';
import { data } from '../../../../Language/index'
import LocalizedStrings from 'react-localization';
import '../style.scss';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions'
import * as VatreportActions from '../actions';
import moment from 'moment';

const mapStateToProps = (state) => {

	return {
		contact_list: state.request_for_quotation.contact_list,
		payroll_employee_list: state.payrollEmployee.payroll_employee_list,
	};

};

const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
		vatreportActions: bindActionCreators(VatreportActions, dispatch),
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
class FileTaxReturnModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			selectedRows: [],
			actionButtons: {},
			initValue: {
				taxablePersonNameInEnglish: '',
				taxFiledOn: new Date(),
				vatReportFiling: '',
				vatRegistrationNumber: '',
				taxAgentApprovalNumber: '',
				taxAgencyNumber: '',
				taxAgencyName: '',
				taxAgentName: '',
				taxablePersonNameInArabic: '',
			},
			isTANMandetory: false,
			isTAANMandetory: false,
			isTaxAgentName: false,
			dialog: null,
			filterData: {
				name: '',
				email: ''
			},
			reporting_period_list: [{ label: "Custom", value: 1 }],
			view: false,
			FTAExciseTaxAuditFile: false,
			FTAVatAuditFile: false,
		};
		this.regEx = /^[0-9\d]+$/;
		// this.regEx = /[a-zA-Z0-9]+$/;
		this.regExTelephone = /^[0-9-]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;

		this.formikRef = React.createRef();
	}


	handleSubmit = (data, resetForm, setSubmitting) => {
		const { current_report_id, vatreportActions, commonActions, closeModal } = this.props;
		this.setState({ disabled: true });
		data.vatReportFiling = current_report_id;
		let formData = new FormData();
		for (var key in data) {
			formData.append(key, data[key]);
		}
		vatreportActions
			.fileVatReport(formData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					commonActions.tostifyAlert(
						'success',
						res.data.message ? res.data.message : 'VAT Report Filed Successfully',
					);
					resetForm();
					this.setState({ isTANMandetory: false })
					this.setState({ isTAANMandetory: false })
					closeModal(true);
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				// this.displayMsg(err);
				this.formikRef.current.setSubmitting(false);
			});
	};

	displayMsg = (err) => {
		toast.error(`${err.data.message}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};
	_showDetails = (bool) => {
		this.setState({
			showDetails: bool
		});
	}


	componentDidMount = () => {
		this.props.vatreportActions.getCompanyDetails().then((res) => {
			if (res.status == 200) {
				this.setState({ initValue: { vatRegistrationNumber: res.data.vatRegistrationNumber ? res.data.vatRegistrationNumber : "" } })
			}
		});
	};
	dateLimit = () => {
		const { taxReturns } = this.props;

		if (taxReturns) {
			var datearray = taxReturns.split("-")[0].split("/");
			const day = parseInt(datearray[0]);
			const month = parseInt(datearray[1]) - 1;
			const year = parseInt(datearray[2]);
			const selectedDate = new Date(year, month, day);
			const nextMonth = new Date(year, month + 1, 1);
 
			return nextMonth;
		}
	}
	render() {
		strings.setLanguage(this.state.language);
		const { openModal, closeModal, taxReturns } = this.props;
		const { initValue, } = this.state;

		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openModal} className="modal-success contact-modal">
					<ModalHeader>
						<Row>
							<Col lg={12}>
								<div className="h4 mb-0 d-flex align-items-center">
									<i className="nav-icon fas fa-user-tie" />
									<span className="ml-2">File The Report For VAT Return ( {taxReturns} )</span>
								</div>
							</Col>
						</Row>
					</ModalHeader>

					<Formik
						ref={this.formikRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm, setSubmitting }) => {
							this.handleSubmit(values, resetForm);
						}}
						validate={(values) => {
							let errors = {};
							if (this.state.FTAExciseTaxAuditFile === true || this.state.FTAVatAuditFile === true) {
								if (!values.taxablePersonNameInEnglish)
									errors.taxablePersonNameInEnglish = "Taxable person name in english is required";
								if (values.taxablePersonNameInEnglish && this.regExAlpha.test(values.taxablePersonNameInEnglish) != true)
									errors.taxablePersonNameInEnglish = "A taxable person's name must contain only alphabets";
								if (values.taxablePersonNameInArabic && this.regExAlpha.test(values.taxablePersonNameInArabic) != true)
									errors.taxablePersonNameInArabic = "A taxable person's name must contain only alphabets";
								if (values.taxAgentName && this.regExAlpha.test(values.taxAgentName) != true)
									errors.taxAgentName = "Tax agent name must contain only alphabets";
								if (values.taxAgencyName && this.regExAlpha.test(values.taxAgencyName) != true)
									errors.taxAgencyName = "Tax agency name must contain only alphabets";
								if (values.taxAgentApprovalNumber && !this.regEx.test(values.taxAgentApprovalNumber))
									errors.taxAgentApprovalNumber = "The TAAN must consist of an 8-digit number";
								if (this.state.isTANMandetory === true && (values.taxAgencyNumber == "" || values.taxAgencyNumber == undefined))
									errors.taxAgencyNumber = 'TAN is required';
								if (!values.taxAgentName)
									errors.taxAgentName = 'Tax agent name is required';
								if (!values.taxAgentApprovalNumber)
									errors.taxAgentApprovalNumber = 'TAAN is required';
							}
							if (!values.taxFiledOn)
								errors.taxFiledOn = 'Date of filling is required';
							return errors;
						}}
						validationSchema={Yup.object().shape({
							// taxablePersonNameInEnglish: Yup.string().required('Taxable person name in english is required'),
							// // taxablePersonNameInArabic: Yup.string().required('Taxable Person Name In Arabic is required'),
							// taxAgentName: Yup.string().required('Tax Agent Name is required'),
							// taxAgentApprovalNumber: Yup.string().required('TAAN is required'),
							// vatRegistrationNumber: Yup.string().required('Tax registration number is required'),
							taxFiledOn: Yup.string().required(
								'Date of filling is required',
							),
						})}
					>
						{(props) => {
							const { isSubmitting } = props;
							return (
								<Form
									name="simpleForm"
									onSubmit={props.handleSubmit}
									className="create-contact-screen"
								>

									<ModalBody>
										<Row className='mb-4'><Col>
											<h4>Once report is filed, you won't be able to edit any transactions for this tax period.</h4></Col></Row>
										<Row>
											<Col lg={4}>
												<FormGroup className="mb-3"><span className="text-danger">* </span>
													<Label htmlFor="taxFiledOn">Date Of Filling</Label>
													<DatePicker
														id="taxFiledOn"
														name="taxFiledOn"
														placeholderText={"Tax Filed On"}
														showMonthDropdown
														showYearDropdown
														dateFormat="dd-MM-yyyy"
														dropdownMode="select"
														minDate={this.dateLimit()}
														//maxDate={new Date()}
														value={props.values.taxFiledOn}
														selected={props.values.taxFiledOn}
														onChange={(value) => {
															props.handleChange('taxFiledOn')(value);
														}}
														className={`form-control ${props.errors.taxFiledOn
															? 'is-invalid'
															: ''
															}`}
													/>
													{props.errors.taxFiledOn && (
														<div className="invalid-feedback">
															{props.errors.taxFiledOn}
														</div>
													)}
												</FormGroup>
											</Col>
										</Row>
										{/* <Row className='mb-4'><Col><h4>Would you also like to generate the following reports for this period?</h4></Col></Row>
										<Row>
											<Col lg={4}>
												<FormGroup check inline className="mb-3">
														<Label
															className="form-check-label"
															check
															htmlFor="FTAVatAuditFile"
														>
															<Input
																type="checkbox"
																id="FTAVatAuditFile"
																name="FTAVatAuditFile"
																onChange={(event) => {
																	this.setState({FTAVatAuditFile: !this.state.FTAVatAuditFile})
																}}
																checked={this.state.FTAVatAuditFile}
															/>
														FTA VAT Audit File
														</Label>										
												</FormGroup>
											</Col>

											<Col lg={4}>
												<FormGroup check inline className="mb-3">
														<Label
															className="form-check-label"
															check
															htmlFor="FTAExciseTaxAuditFile"
														>
															<Input
																type="checkbox"
																id="FTAExciseTaxAuditFile"
																name="FTAExciseTaxAuditFile"
																onChange={(event) => {
																	this.setState({FTAExciseTaxAuditFile: !this.state.FTAExciseTaxAuditFile})
																}}
																checked={this.state.FTAExciseTaxAuditFile}
															/>
														FTA Excise TAX Audit File
														</Label>										
												</FormGroup>
											</Col>
										</Row> */}
										{(this.state.FTAExciseTaxAuditFile === true || this.state.FTAVatAuditFile === true) && (
											<Row>
												<Col lg={4}>
													<FormGroup className="mb-3"><span className="text-danger">* </span>
														<Label htmlFor="taxablePersonNameInEnglish">Taxable Person Name (English)</Label>
														<Input
															type="text"
															name="taxablePersonNameInEnglish"
															id="taxablePersonNameInEnglish"
															maxLength="100"
															placeholder={"Enter Taxable Person Name (English)"}
															onChange={(option) => {
																option.target.value === '' ||
																	this.regExAlpha.test(
																		option.target.value,
																	)
																props.handleChange('taxablePersonNameInEnglish')(option)
															}
															}
															defaultValue={props.values.taxablePersonNameInEnglish}
															className={
																props.errors.taxablePersonNameInEnglish
																	? 'is-invalid'
																	: ''
															}
														/>
														{props.errors.taxablePersonNameInEnglish && (
															<div className="invalid-feedback">
																{props.errors.taxablePersonNameInEnglish}
															</div>
														)}
													</FormGroup>
												</Col>
												<Col lg={4}>
													<FormGroup className="mb-3"><span className="text-danger"> </span>
														<Label htmlFor="taxablePersonNameInArabic">Taxable Person Name (Arabic)</Label>
														<Input
															type="text"
															name="taxablePersonNameInArabic"
															id="taxablePersonNameInArabic"
															maxLength="100"
															placeholder={"Enter Taxable Person Name (Arabic)"}
															onChange={(option) =>
																props.handleChange('taxablePersonNameInArabic')(option)
															}
															defaultValue={props.values.taxablePersonNameInArabic}
															className={
																props.errors.taxablePersonNameInArabic
																	? 'is-invalid'
																	: ''
															}
														/>
														{props.errors.taxablePersonNameInArabic && (
															<div className="invalid-feedback">
																{props.errors.taxablePersonNameInArabic}
															</div>
														)}
													</FormGroup>
												</Col>
												<Col lg="4" >
													<FormGroup>
														<Label htmlFor="vatRegistrationNumber"><span className="text-danger">* </span>
															{strings.TaxRegistrationNumber}
														</Label>
														<Input
															disabled
															type="text"
															maxLength="15"
															id="vatRegistrationNumber"
															name="vatRegistrationNumber"
															placeholder={strings.Enter + strings.TaxRegistrationNumber}
															onChange={(option) => {
																if (
																	option.target.value === '' ||
																	this.regEx.test(option.target.value)
																) {
																	props.handleChange('vatRegistrationNumber')(option);
																}

															}}
															value={props.values.vatRegistrationNumber}
															className={
																props.errors.vatRegistrationNumber
																	? 'is-invalid'
																	: ''
															}
														/>
														{props.errors.vatRegistrationNumber && (
															<div className="invalid-feedback">
																{props.errors.vatRegistrationNumber}
															</div>
														)}
														{/* <div className="VerifyTRN">
														<br />
														<b>	<a target="_blank" rel="noopener noreferrer" href="https://tax.gov.ae/en/default.aspx" style={{ color: '#2266d8' }}  >{strings.VerifyTRN}</a></b>
													</div> */}
													</FormGroup>
												</Col>
												<Col lg={4}>
													<FormGroup className="mb-3">
														{this.state.isTANMandetory === true && (<span className="text-danger"> </span>)}
														<Label htmlFor="taxAgencyName">Tax Agency Name </Label>
														<Input
															type="text"
															name="taxAgencyName"
															id="taxAgencyName"
															maxLength="100"
															placeholder={"Enter Tax Agency Name"}
															onChange={(option) => {
																props.handleChange('taxAgencyName')(option)
																if (option.target.value != "") {
																	this.setState({ isTANMandetory: true })
																}
																else {
																	this.setState({ isTANMandetory: false })
																}
															}}
															defaultValue={props.values.taxAgencyName}
															className={
																props.errors.taxAgencyName
																	? 'is-invalid'
																	: ''
															}
														/>
														{props.errors.taxAgencyName && (
															<div className="invalid-feedback">
																{props.errors.taxAgencyName}
															</div>
														)}
													</FormGroup>
												</Col>

												<Col lg={4}>
													<FormGroup className="mb-3">
														{this.state.isTANMandetory === true && (<span className="text-danger">* </span>)}
														<Label htmlFor="taxAgencyNumber">Tax Agency Number (TAN)</Label>
														<Input
															type="text"
															name="taxAgencyNumber"
															id="taxAgencyNumber"
															maxLength="10"
															autoComplete='off'
															placeholder={"Enter Tax Agency Number (TAN)"}
															value={props.values.taxAgencyNumber}

															onChange={(option) => {
																if (option.target.value !== '') {
																	props.handleChange('taxAgencyNumber')(option,)
																}
																else {
																	props.handleChange('taxAgencyNumber')('')
																}
															}}
															className={
																props.errors.taxAgencyNumber
																	? 'is-invalid'
																	: ''
															}
														/>
														{props.errors.taxAgencyNumber && (
															<div className="invalid-feedback">
																{props.errors.taxAgencyNumber}
															</div>
														)}
													</FormGroup>
												</Col>
												<Col lg={4}></Col>
												<Col lg={4}>
													<FormGroup className="mb-3">
														<span className="text-danger">* </span>
														<Label htmlFor="taxAgentName">Tax Agent Name</Label>
														<Input
															type="text"
															name="taxAgentName"
															id="taxAgentName"
															maxLength="100"
															placeholder={"Enter Agenct Name"}
															onChange={(option) => {
																props.handleChange('taxAgentName')(option)
																if (option.target.value != "") {
																	this.setState({ isTAANMandetory: true })
																} else {
																	this.setState({ isTAANMandetory: false })
																}
															}}
															defaultValue={props.values.taxAgentName}
															className={
																props.errors.taxAgentName
																	? 'is-invalid'
																	: ''
															}
														/>
														{props.errors.taxAgentName && (
															<div className="invalid-feedback">
																{props.errors.taxAgentName}
															</div>
														)}
													</FormGroup>
												</Col>
												<Col lg={4}>
													<FormGroup className="mb-3">
														<span className="text-danger">* </span>
														<Label htmlFor="taxAgentApprovalNumber">Tax Agent Approval Number (TAAN) </Label>
														<Input
															type="text"
															name="taxAgentApprovalNumber"
															id="taxAgentApprovalNumber"
															maxLength="8"
															autoComplete='off'
															placeholder={"Enter Tax Agent Approval Number (TAAN)"}
															onChange={(option) => {
																if (option.target.value === '' || this.regEx.test(option.target.value)) {
																	props.handleChange('taxAgentApprovalNumber')(option,)
																}
																else {
																	props.handleChange('taxAgentApprovalNumber')(option,)
																}
															}}
															className={
																props.errors.taxAgentApprovalNumber
																	? 'is-invalid'
																	: ''
															}
															value={props.values.taxAgentApprovalNumber}
														/>
														{props.errors.taxAgentApprovalNumber && (
															<div className="invalid-feedback">
																{props.errors.taxAgentApprovalNumber}
															</div>
														)}
													</FormGroup>
												</Col>
											</Row>)}
									</ModalBody>
									<ModalFooter>
										<Button
											color="primary"
											type="submit"
											className="btn-square"
											disabled={this.state.disabled}
											onClick={() => {
												//	added validation popup	msg
												console.log(props.errors, "ERROR");
												props.handleBlur();
												if (props.errors && Object.keys(props.errors).length != 0)
													this.props.commonActions.fillManDatoryDetails();

											}}
										>
											<i className="fa fa-dot-circle-o"></i> 	{this.state.disabled
												? 'Saving...'
												: "File"}
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												this.setState({ isTANMandetory: false })
												this.setState({ isTAANMandetory: false })
												closeModal(false);
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
	, mapDispatchToProps
)(FileTaxReturnModal);