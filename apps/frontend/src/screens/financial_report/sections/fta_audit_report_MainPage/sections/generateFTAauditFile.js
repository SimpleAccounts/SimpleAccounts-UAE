import { Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap"
import React from 'react'
import * as Yup from 'yup';
import { useState } from "react"
import { Formik } from "formik";
import LocalizedStrings from 'react-localization';
import { data } from '../../../../Language/index'
import DatePicker from 'react-datepicker';
import { useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CommonActions } from "services/global";

const mapStateToProps = (state) => {

	return {
		contact_list: state.request_for_quotation.contact_list,
		payroll_employee_list: state.payrollEmployee.payroll_employee_list,
	};

};

const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		
	};
};

const GenerateFTAreport=({openModal,closeModal,...props})=>{
    let strings = new LocalizedStrings(data);
    const [state,setState]=useState({
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
        isTANMandetory:false,
        isTAANMandetory:false,
        isTaxAgentName:false,
        dialog: null,
        filterData: {
            name: '',
            email: ''
        },
        reporting_period_list: [{ label: "Custom", value: 1 }],
        view: false
    })
const formikRef=useRef()
const regEx = /^[0-9\d]+$/;
const regExTelephone = /^[0-9-]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;
const regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;

    return(<>
    <Modal isOpen={openModal} className="modal-success contact-modal">
        <ModalHeader>
        <Row>
							<Col lg={12}>
								<div className="h4 mb-0 d-flex align-items-center">
									<i className="nav-icon fas fa-user-tie" />
									<span className="ml-2">Create FTA VAT Audit File 
									
										</span>
								</div>
							</Col>
						</Row>
     
        </ModalHeader>
        <Formik
						ref={formikRef}
						initialValues={state.initValue}
						onSubmit={(values, { resetForm, setSubmitting ,handleSubmit}) => {
							handleSubmit(values, resetForm);
						}}
						validate={(values) => {
							let errors = {};
							if(values.taxablePersonNameInEnglish && regExAlpha.test(values.taxablePersonNameInEnglish)!=true)
							errors.taxablePersonNameInEnglish="A taxable person's name must contain only alphabets";
							if(values.taxablePersonNameInArabic && regExAlpha.test(values.taxablePersonNameInArabic)!=true)
							errors.taxablePersonNameInArabic="A taxable person's name must contain only alphabets";
							if(values.taxAgentName && regExAlpha.test(values.taxAgentName)!=true)
							errors.taxAgentName="Tax agent name must contain only alphabets";
							if(values.taxAgencyName && regExAlpha.test(values.taxAgencyName)!=true)
							errors.taxAgencyName="Tax agency name must contain only alphabets";
							if(values.taxAgentApprovalNumber && regExTelephone.test(values.taxAgentApprovalNumber)!=true)
							errors.taxAgentApprovalNumber="Tax agent approval number must contain only numbers";
							
							if (state.isTANMandetory === true &&( values.taxAgencyNumber=="" ||values.taxAgencyNumber==undefined)) 
							{
								errors.taxAgencyNumber ='TAN is required';
								if (values.taxAgentApprovalNumber=="" || values.taxAgentApprovalNumber==undefined)
								{
									errors.taxAgentApprovalNumber = 'TAAN is required';
								}
								if (values.taxAgentName=="" || values.tax==undefined)
								{
									errors.taxAgentName = 'Tax agent name is required';
								}
							} 
							if (state.isTAANMandetory === true && (values.taxAgentApprovalNumber=="" || values.taxAgentApprovalNumber==undefined))
							{
								errors.taxAgentApprovalNumber = 'TAAN is required';
							}									
							return errors;
						}}
						validationSchema={Yup.object().shape({
							taxablePersonNameInEnglish: Yup.string().required('Taxable person name in english is required'),
							// taxablePersonNameInArabic: Yup.string().required('Taxable Person Name In Arabic is required'),
							taxAgentName: Yup.string().required('Tax Agent Name is required'),
							taxAgentApprovalNumber: Yup.string().required('TAAN is required'),
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
								<Row className='mb-4'><Col><h4>Once report is filed, you won't be able to edit any transactions for this tax period.</h4></Col></Row>
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
																			regExAlpha.test(
																				option.target.value,
																			)
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
																/>
																	{props.errors.taxablePersonNameInArabic &&												
																(
																		<div className='text-danger' >
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
																			regEx.test(option.target.value)
																		) {
																			props.handleChange('vatRegistrationNumber')(option);
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
																{/* <div className="VerifyTRN">
																	<br />
																	<b>	<a target="_blank" rel="noopener noreferrer" href="https://tax.gov.ae/en/default.aspx" style={{ color: '#2266d8' }}  >{strings.VerifyTRN}</a></b>
																</div> */}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3">
															{state.isTANMandetory === true &&(<span className="text-danger"> </span>)}
																<Label htmlFor="taxAgencyName">Tax Agency Name </Label>
																<Input
																	type="text"
																	name="taxAgencyName"
																	id="taxAgencyName"
																	maxLength="100"
																	placeholder={"Enter Tax Agency Name"}
																	onChange={(option) =>{
																		props.handleChange('taxAgencyName')(option)
																			if(option.target.value !=""){
																				setState({isTANMandetory:true})
																			}
																			else{
																			    setState({isTANMandetory:false})
																			}
																		}}
																	defaultValue={props.values.taxAgencyName}
																/>
																{props.errors.taxAgencyName &&												
																(
																		<div className='text-danger' >
																			{props.errors.taxAgencyName}
																		</div>
																	)}
															</FormGroup>
														</Col>
														
														<Col lg={4}>
															<FormGroup className="mb-3">
													{state.isTANMandetory === true &&(<span className="text-danger">* </span> )}
																<Label htmlFor="taxAgencyNumber">Tax Agency Number (TAN)</Label>
																<Input
																	type="text"
																	name="taxAgencyNumber"
																	id="taxAgencyNumber"
																	maxLength="10"
																	autoComplete='off'
																	placeholder={"Enter Tax Agency Number (TAN)"}
																	onChange={(option) =>
																		{
																		if (option.target.value === '' ||
																				regExBoth.test(option.target.value)
																			) {																				
																				props.handleChange('taxAgencyNumber')(option)
																			}
																		}}
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
													</Row>

													<Row>
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
																	onChange={(option) =>{
																		props.handleChange('taxAgentName')(option)
																		if(option.target.value !=""){
																			setState({isTAANMandetory:true})
																		}else{
																			setState({isTAANMandetory:false})
																		}
																	}}
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
														<Col lg={4}>
															<FormGroup className="mb-3">	
																{(state.isTANMandetory === true || state.isTAANMandetory) &&(<span className="text-danger">* </span>)}
															<Label htmlFor="taxAgentApprovalNumber">Tax Agent Approval Number (TAAN) </Label>
																<Input
																	type="text"
																	name="taxAgentApprovalNumber"
																	id="taxAgentApprovalNumber"
																	maxLength="8"
																	autoComplete='off'
																	placeholder={"Enter Tax Agent Approval Number (TAAN)"}
																	onChange={(option) => 
																		{
																		if (
																			option.target.value === '' ||
																			regExTelephone.test(option.target.value)
																		) {
																			props.handleChange('taxAgentApprovalNumber')(option)
																		}
																	}}
																	value={props.values.taxAgentApprovalNumber}
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
														
														<Col lg={4}>
															<FormGroup className="mb-3"><span className="text-danger">* </span>
																<Label htmlFor="taxFiledOn">Start Date</Label>
																<DatePicker
																		id="taxFiledOn"
																		name="taxFiledOn"
																		placeholderText={"Tax Filed On"}
																		showMonthDropdown
																		showYearDropdown
																		dateFormat="dd-MM-yyyy"
																		dropdownMode="select"
																		
																		maxDate={new Date()}
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

                                                        <Col lg={4}>
															<FormGroup className="mb-3"><span className="text-danger">* </span>
																<Label htmlFor="taxFiledOn">End Date</Label>
																<DatePicker
																		id="taxFiledOn"
																		name="taxFiledOn"
																		placeholderText={"Tax Filed On"}
																		showMonthDropdown
																		showYearDropdown
																		dateFormat="dd-MM-yyyy"
																		dropdownMode="select"
																		
																		maxDate={new Date()}
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
												
															
													
									</ModalBody>
                                    <ModalFooter>
										<Button
											color="primary"
											type="submit"
											className="btn-square"
											disabled={state.disabled}
											onClick={() => {
												//	added validation popup	msg
												props.handleBlur();
												if(props.errors &&  Object.keys(props.errors).length != 0)
												props.commonActions.fillManDatoryDetails();

										}}
										>
											<i className="fa fa-dot-circle-o"></i> 	{state.disabled
																			? 'Saving...'
																			: strings.Save }
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {											
												setState({isTANMandetory:false})
												setState({isTAANMandetory:false})
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
    </>)
}
export default connect(
	mapStateToProps
	, mapDispatchToProps
)(GenerateFTAreport);
