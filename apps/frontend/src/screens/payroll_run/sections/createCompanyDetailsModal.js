import React from 'react';
import { connect } from 'react-redux';
import logo from 'assets/images/brand/datainnLogo.png';
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
import { toInteger, upperCase, upperFirst } from 'lodash';
import { Formik, Field } from 'formik';
import Select from 'react-select';
import * as Yup from 'yup';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import { selectOptionsFactory } from 'utils';
import DatePicker from 'react-datepicker';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';

import { toast } from 'react-toastify';
import { data } from '../../Language/index'
import LocalizedStrings from 'react-localization';

import '../style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import ReactToPrint from 'react-to-print';
import { Loader } from 'components';
import * as PayrollRun from '../actions';
import { Checkbox } from '@material-ui/core';

const mapStateToProps = (state) => {

	return {
		contact_list: state.request_for_quotation.contact_list,
		payroll_employee_list: state.payrollEmployee.payroll_employee_list,
	};

};


const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		payrollRun: bindActionCreators(PayrollRun, dispatch),
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
class CreateCompanyDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			selectedRows: [],
			actionButtons: {},
			initValue: {
				companyBankCode: '',
				companyNumber: '',
			},
	
			dialog: null,
			filterData: {
				name: '',
				email: ''
			},
			reporting_period_list: [{ label: "Custom", value: 1 }],
			view: false
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
		let formdata= new FormData()
		formdata.append("companyBankCode",data.companyBankCode)
		formdata.append("companyNumber",data.companyNumber)
		this.props.payrollRun
		.updateCompany(formdata)
		.then((res) => {
			if (res.status === 200) {
				this.props.commonActions.tostifyAlert(
					'success',
					'Company Details Saved Successfully',
				);
				this.props.closeModal(false);				
			}
		})
		.catch((err) => {
			this.props.commonActions.tostifyAlert(
				'error',
				err && err.data ? err.data.message : 'Something Went Wrong',
			);
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
		this.props.payrollRun.getCompanyDetails().then((res)=>{			
			if(res.status==200){
			this.setState({initValue:{companyNumber:res.data.companyNumber?res.data.companyNumber:"",
			companyBankCode:res.data.companyBankCode?res.data.companyBankCode:"",
		}})}
		});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { openModal, closeModal ,current_report_id} = this.props;
		const { initValue, loading, reporting_period_list } = this.state;

		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openModal} className="modal-success contact-modal">
					<ModalHeader>
						<Row>
							<Col lg={12}>
								<div className="h4 mb-0 d-flex align-items-center">
									<i className="nav-icon fas fa-user-tie" />
									<span className="ml-2">{strings.company_details}</span>
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
							if(values.companyBankCode.length <9 && values.companyBankCode.length !=0)
							errors.companyBankCode="Company bank code should be 9 digits numeric ";	
							
							if(values.companyNumber.length <13 && values.companyNumber.length !=0)
							errors.companyNumber="Company number should be 13 digits numeric ";	
							
							if(this.state.invalidCompanyBankCode && this.state.invalidCompanyBankCode==true)
							errors.companyBankCode="Company bank code should be numeric ";	

							if(this.state.invalidCompanyNumber && this.state.invalidCompanyNumber==true)
							errors.companyNumber="Company number should be numeric ";	

							return errors;
						}}
						validationSchema={Yup.object().shape({
							companyBankCode: Yup.string().required('Company bank code is required'),
							companyNumber: Yup.string().required('Company number is required'),
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
																<Label htmlFor="companyNumber">{strings.company_num}
																<i
																			id="cnoTooltip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="cnoTooltip"
																		>
																			Company Number is 13 digit Numeric
																		</UncontrolledTooltip>
																</Label>
																<Input
																	type="text"
																	name="companyNumber"
																	id="companyNumber"
																	maxLength="13"
																	minLength="13"
																	
																	placeholder={"Enter Company Number"}
																	onChange={(option) =>
																		{																			
																			if (option.target.value === '' ||this.regEx.test(option.target.value,))
																			 {
																			     props.handleChange('companyNumber',)(option.target.value);
																				 this.setState({invalidCompanyNumber:false})
																		    }else{
																			props.handleChange('companyNumber',)("");
																			this.setState({invalidCompanyNumber:true})
																		}
																			
																	}
																	}
																	className={
																		props.errors.companyNumber &&
																		props.touched.companyNumber
																			? 'is-invalid'
																			: ''
																	}
																	defaultValue={props.values.companyNumber}
																/>
																{props.errors.companyNumber &&												
																(
																		<div className='text-danger' >
																			{props.errors.companyNumber}
																		</div>
																	)}
															</FormGroup>
														</Col>
														<Col lg={4}>
															<FormGroup className="mb-3"><span className="text-danger">* </span>
																<Label htmlFor="companyBankCode">{strings.com_code}
																<i
																			id="cbcodeTooltip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="cbcodeTooltip"
																		>
																			Company Bank Code is 9 digit Numeric
																		</UncontrolledTooltip>
																</Label>
																<Input
																	type="text"
																	name="companyBankCode"
																	id="companyBankCode"
																	maxLength="9"
																	minLength="9"
																	placeholder={"Enter Company Bank Code"}
																	onChange={(option) =>	{
																		if (option.target.value === '' ||this.regEx.test(option.target.value))
																		 {
																			 props.handleChange('companyBankCode')(option.target.value);
																			 this.setState({invalidCompanyBankCode:false})
																		 }
																		 else{
																		 props.handleChange('companyBankCode')("");
																		 this.setState({invalidCompanyBankCode:true})
																		}
																	  }
																	}
																	className={
																		props.errors.companyBankCode &&
																		props.touched.companyBankCode
																			? 'is-invalid'
																			: ''
																	}
																	defaultValue={props.values.companyBankCode}
																/>
																{props.errors.companyBankCode &&												
																(
																		<div className='text-danger' >
																			{props.errors.companyBankCode}
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
											disabled={this.state.disabled}
											disabled={isSubmitting}
											onClick={() => {
												//  added validation popup  msg                                                                
												props.handleBlur();
												if(props.errors &&  Object.keys(props.errors).length != 0)
												this.props.commonActions.fillManDatoryDetails();
												}}
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
)(CreateCompanyDetails);