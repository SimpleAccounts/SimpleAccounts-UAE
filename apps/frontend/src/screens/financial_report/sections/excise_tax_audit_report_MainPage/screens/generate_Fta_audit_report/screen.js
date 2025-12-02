import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
	CardBody,
	Table,
	Card,
	ButtonGroup,
	ModalHeader,
} from 'reactstrap';

import { AuthActions, CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss';
import * as VatreportAction from './actions';

import logo from 'assets/images/brand/logo.png';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import * as FinancialReportActions from '../../../../actions';import { Formik, Field } from 'formik';

import * as Yup from 'yup';

import DatePicker from 'react-datepicker';
import moment from 'moment';

import { toast } from 'react-toastify';
import { data } from '../../../../../Language/index'
import LocalizedStrings from 'react-localization';
import { Currency } from 'components';
const mapStateToProps = (state) => {
	return {
		version: state.common.version,
		company_profile: state.reports.company_profile,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		vatreport: bindActionCreators(VatreportAction, dispatch),
		financialReportActions: bindActionCreators(
			FinancialReportActions,
			dispatch,
		),
	};
};


let strings = new LocalizedStrings(data);
class GenerateAuditFile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {},
			loading: false,
			fileName: '',
			disabled: false,
			productName: '',
			version: '',
			type: '',
			upload: false,
			file_data_list: [],
			openModal: false,
			vatReportDataList: 
				[
					{
					taxReturns:"Sept 2021",dateOfFiling:"1st Jan 2022",amountPaid:3600,amountReclaimed:"---"
					},
					{
					taxReturns:"Oct 2021",dateOfFiling:"1st Jan 2022",amountPaid:"---",amountReclaimed:7300},
					{
					taxReturns:"Nov 2021",dateOfFiling:"1st Jan 2022",amountPaid:"---",amountReclaimed:3500},
					{
					taxReturns:"Dec 2021",dateOfFiling:"1st Jan 2022",amountPaid:5000,amountReclaimed:"---"
					}
				],
				paginationPageSize:10,
			
		};
	}
    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.gridApi.paginationSetPageSize(Number(value));
      };
    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
      };
      
    onBtnExport = () => {
        this.gridApi.exportDataAsCsv();
      };

    onBtnExportexcel= () => {
        this.gridApi.exportDataAsExcel();
      };
	componentDidMount = () => {
		this.getInitialData();
		this.props.financialReportActions.getCompany();
	};

	getInitialData = () => {
		this.props.vatreport
			.getVatPaymentHistoryList()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ vatReportDataList: res.data }) // comment for dummy
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};


	renderDate = (cell, row) => {
		return cell ? moment(cell)
			// .format('DD-MM-YYYY') 
			.format('LL')
			: '-';
	};
	renderAmount = (amount, params) => {
		if (amount != null && amount != 0)
			return (
				<>
					<Currency
						value={amount}
						currencySymbol={params.data.currency}
					/>
				</>
			)
		else
			return ("---")
	}
	renderTaxReturns = (cell, row) => {
		let dateArr = cell ? cell.split(" ") : [];

		let startDate = moment(dateArr[0]).format('DD/MM/YYYY')
		let endDate = moment(dateArr[1]).format('DD/MM/YYYY')

		return (<>{dateArr[0]}</>);
	};

	render() {
		const { vatReportDataList,initValue } = this.state;
		const { company_profile} = this.props;
		return (
			<div className="import-bank-statement-screen">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>


									<div
										className="h4 mb-0 d-flex align-items-center"
										style={{ justifyContent: 'space-between' }}
									>
										<div>
											<h5
											
											>
												<i className="fa fa-history mr-2"></i>FTA VAT AUDIT REPORT
											</h5>
										</div>
										<div className="d-flex">



											<Button
												className="mr-2 print-btn-cont"
												onClick={() => {
													this.props.history.push('/admin/report/ftaAuditReports');
												}}
												style={{cursor: 'pointer'}}
											>
												<span>X</span>
											</Button>

										</div>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
						<Formik
						ref={this.formikRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm, setSubmitting }) => {
							this.handleSubmit(values, resetForm);
						}}
						validate={(values) => {
							let errors = {};
							 
							if (this.state.isTANMandetory === true &&( values.taxAgencyNumber=="" ||values.taxAgencyNumber==undefined)) 
							{
								errors.taxAgencyNumber ='TAN is required';
							}													
																			
							return errors;
						}}
						validationSchema={Yup.object().shape({
							taxAgentName: Yup.string().required('Tax agent name is required'),
							taxablePersonNameInEnglish: Yup.string().required('Taxable person name in english is required'),
							taxablePersonNameInArabic: Yup.string().required('Taxable person name in arabic is required'),
							taxAgentApprovalNumber: Yup.string().required('Tax agent approval number is required'),
							vatRegistrationNumber: Yup.string().required('Tax registration number is required'),
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
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3"><span className="text-danger">* </span>
																<Label htmlFor="taxablePersonNameInEnglish">Taxable Person Name (English)</Label>
																<Input
																	type="text"
																	name="taxablePersonNameInEnglish"
																	id="taxablePersonNameInEnglish"
																	placeholder={"Enter Taxable Person Name (English)"}
																	onChange={(option) =>{
																		props.handleChange('taxablePersonNameInEnglish')(option)
																		}
																	}
																	defaultValue={props.values.taxablePersonNameInEnglish}
																/>
																{props.errors.taxablePersonNameInEnglish &&												
																(
																		<div className='text-danger' >
																			{props.errors.taxablePersonNameInEnglish}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3"><span className="text-danger">* </span>
																<Label htmlFor="taxablePersonNameInArabic">Taxable Person Name (Arabic)</Label>
																<Input
																	type="text"
																	name="taxablePersonNameInArabic"
																	id="taxablePersonNameInArabic"
																	placeholder={"Enter Taxable Person Name (Arabic)"}
																	onChange={(option) =>
																		props.handleChange('taxablePersonNameInArabic')(option)
																	}
																	defaultValue={props.values.taxablePersonNameInArabic}
																/>
																{props.errors.taxablePersonNameInArabic &&												
																(
																		<div className='text-danger' >
																			{props.errors.taxablePersonNameInArabic}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3"><span className="text-danger">* </span>
																<Label htmlFor="taxAgentName">Tax Agent Name</Label>
																<Input
																	type="text"
																	name="taxAgentName"
																	id="taxAgentName"
																	placeholder={"Enter Agenct Name"}
																	onChange={(option) =>
																		props.handleChange('taxAgentName')(option)
																	}
																	defaultValue={props.values.taxAgentName}
																/>
																
													{props.errors.taxAgentName &&												
																(
																		<div className='text-danger' >
																			{props.errors.taxAgentName}
																		</div>
																	)}
															</FormGroup>
														</Col>
													</Row>

													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="taxAgencyName">Tax Agency Name </Label>
																<Input
																	type="text"
																	name="taxAgencyName"
																	id="taxAgencyName"
																	placeholder={"Enter Tax Agency Name"}
																	onChange={(option) =>{
																		props.handleChange('taxAgencyName')(option)
																
																			if(option.target.value !=""){
																				this.setState({isTANMandetory:true})
																			}
																			else{
																			    this.setState({isTANMandetory:false})
																			}
																		}
																	}
																	defaultValue={props.values.taxAgencyName}
																/>
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3">
													{this.state.isTANMandetory === true &&(<span className="text-danger">* </span> )}
																<Label htmlFor="taxAgencyNumber">Tax Agency Number (TAN)</Label>
																<Input
																	type="text"
																	name="taxAgencyNumber"
																	id="taxAgencyNumber"
																	maxLength={10}
																	autoComplete='off'
																	placeholder={"Enter Tax Agency Number (TAN)"}
																	onChange={(option) =>
																		{
																		if (option.target.value === '' ||
																				this.regExBoth.test(option.target.value)
																			) {
																				props.handleChange('taxAgencyNumber')(option)
																			}
																		}
																		
																	}
																	value={props.values.taxAgencyNumber}
																/>
																	{props.errors.taxAgencyNumber &&												
																(
																		<div className='text-danger' >
																			{props.errors.taxAgencyNumber}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3"><span className="text-danger">* </span>
																<Label htmlFor="taxAgentApprovalNumber">Tax Agent Approval Number (TAAN) </Label>
																<Input
																	type="text"
																	name="taxAgentApprovalNumber"
																	id="taxAgentApprovalNumber"
																	maxLength={8}
																	placeholder={"Enter Agenct Approval Number"}
															
																	onChange={(option) => {
																		
																		if (
																			option.target.value === '' ||
																			this.regExTelephone.test(option.target.value)
																		) {
																			props.handleChange('taxAgentApprovalNumber')(option);
																		}
																	}}
																	defaultValue={props.values.taxAgentApprovalNumber}
																/>
																{props.errors.taxAgentApprovalNumber &&												
																		(
																				<div className='text-danger' >
																					{props.errors.taxAgentApprovalNumber}
																				</div>
																			)}
															</FormGroup>
														</Col>

													</Row>
													<Row>
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
																			props.handleChange(
																				'vatRegistrationNumber',
																			)(option);
																		}
																	}}
																	value={props.values.vatRegistrationNumber}
																	className={
																		props.errors.vatRegistrationNumber &&
																			props.touched.vatRegistrationNumber
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.vatRegistrationNumber &&
																	props.touched.vatRegistrationNumber && (
																		<div className="invalid-feedback">
																			{props.errors.vatRegistrationNumber}
																		</div>
																	)}
																<div className="VerifyTRN">
																	<br />
																	<b>	<a target="_blank" rel="noopener noreferrer" href="https://tax.gov.ae/en/default.aspx" style={{ color: '#2266d8' }}  >{strings.VerifyTRN}</a></b>
																</div>
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3"><span className="text-danger">* </span>
																<Label htmlFor="taxFiledOn">Date Of Filling</Label>
																<DatePicker
																		id="taxFiledOn"
																		name="taxFiledOn"
																		placeholderText={"Tax Filed On"}
																		showMonthDropdown
																		showYearDropdown
																		autoComplete='off'
																		dateFormat="dd-MM-yyyy"
																		dropdownMode="select"
																		// minDate={this.dateLimit()}
																		value={props.values.taxFiledOn}
																		selected={props.values.taxFiledOn}
																		onChange={(value) => {																			
																			props.handleChange('taxFiledOn')(value);
																		}}
																		className={`form-control ${
																			props.errors.taxFiledOn &&
																			props.touched.taxFiledOn
																				? 'is-invalid'
																				: ''
																		}`}
																	/>
																	{props.errors.taxFiledOn &&
																   (
																		<div className='text-danger'>
																			{props.errors.taxFiledOn}
																		</div>
																	)}
															</FormGroup>
														</Col>
													</Row>
													<Row>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="startDate">{strings.StartDate}</Label>
																<DatePicker
																	id="date"
																	name="startDate"
																	className={`form-control`}
																	placeholderText="From"
																	showMonthDropdown
																	showYearDropdown
																	autoComplete="off"
																	minDate={new Date("01-01-2018")}
																	// maxDate={firstdayoflastmonth.setMonth(firstdayoflastmonth.getMonth()-1)}
																	value={moment(props.values.startDate).format(
																		'DD-MM-YYYY',
																	)}
																	dropdownMode="select"
																	dateFormat="dd-MM-yyyy"
																	// onChange={(value) => {
																	// 	props.handleChange('startDate')(value);
																	// 	if (moment(value).isBefore(props.values.startDate)) {
																	// 		props.setFieldValue(
																	// 			'startDate',
																	// 			moment(value).add(1, 'M'),
																	// 		);
																	// 	}
																	// }}

																	onChange={(value) => {
																		props.handleChange('startDate')(value);
																		this.setState({...this.state.initValue,initValue: {startDate: value,endDate:this.state.initValue.endDate} })
																	}}
																/>
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3">
																<Label htmlFor="endDate">{strings.EndDate}</Label>
																<DatePicker
																	id="date"
																	name="endDate"
																	className={`form-control`}
																	autoComplete="off"
																	// maxDate={lastdayoflastmonth.setMonth(lastdayoflastmonth.getMonth(), 0)}
																	placeholderText="From"
																	showMonthDropdown
																	showYearDropdown
																	value={moment(props.values.endDate).format(
																		'DD-MM-YYYY',
																	)}
																	dropdownMode="select"
																	dateFormat="dd-MM-yyyy"
																	onChange={(value) => {
																		props.handleChange('endDate')(value);
																		this.setState({...this.state.initValue,initValue: {endDate: value,startDate:this.state.initValue.startDate} })
																	}}
																/>
															</FormGroup>
														</Col>
													</Row>
									</ModalBody>
									<ModalFooter>
										<Button
											color="primary"
											type="submit"
											className="btn-square"
											disabled={this.state.disabled}
											disabled={isSubmitting}
										>
											<i className="fa fa-dot-circle-o"></i> 	{this.state.disabled
																			? 'Saving...'
																			: strings.Save }
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {											
												this.setState({isTANMandetory:false})
												// closeModal(false);
											}}
										>
											<i className="fa fa-ban"></i> {strings.Cancel}
										</Button>
									</ModalFooter>
								</Form>
							);
						}}
					</Formik>

						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(GenerateAuditFile);
