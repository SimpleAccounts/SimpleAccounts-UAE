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
import * as CTReportActions from '../actions';
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
		ctReportActions: bindActionCreators(CTReportActions, dispatch),
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
class FileCtReportModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			selectedRows: [],
			actionButtons: {},
			initValue: {
				taxFiledOn: '',
				corporateTaxFiling: '',
			},
			dialog: null,
			filterData: {
				name: '',
				email: ''
			},
			reporting_period_list: [{ label: "Custom", value: 1 }],
			view: false,
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
		const { openModal, closeModal } = this.props;
		this.setState({ disabled: true });
		let formData = new FormData();
		const postData = {
			taxFiledOn: moment(data.taxFiledOn ? data.taxFiledOn : this.props.endDate).format('DD/MM/YYYY'),
			id: data.corporateTaxFiling ? data.corporateTaxFiling : this.props.current_report_id ,
		};
		formData.append('taxFiledOn', moment(data.taxFiledOn).format('DD/MM/YYYY'))
		formData.append('id', data.corporateTaxFiling)
		this.props.ctReportActions
			.fileCTReport(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						'Report Filed Successfully!',
					);
				}
				closeModal(false);
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
		this.props.ctReportActions.getCompanyDetails().then((res) => {
			if (res.status == 200) {
				// this.setState({initValue:{vatRegistrationNumber:res.data.vatRegistrationNumber?res.data.vatRegistrationNumber:""}})
			}
		});
	};
	initializeData = () => {
		const { initValue } = this.state;
		let query = new URLSearchParams(document.location.search)
		const idofvat = query.get('id')
		if (!idofvat) this.props.history.push('/admin/report/corporate-tax')
		this.props.vatreport
			.getCTReportList()
			.then((res) => {

				if (res.status === 200) {
					this.setState({ vatReportData: res?.data?.data?.find((i) => i.id == idofvat) }) // comment for dummy
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});

		const postData = {
			startDate: this.props?.location?.state?.startDate,
			endDate: this.props?.location?.state?.endDate,
		};
		this.setState(
			{
				initValue: {
					startDate: this.props?.location?.state?.startDate,
					endDate: this.props?.location?.state?.endDate,
				},
				loading: true,
			},
			() => {
				// this.initializeData();
			},
		);
		this.props.financialReportActions
			.getVatReturnsReport(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						data: res.data,
						loading: false,
					});
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
	};
	render() {
		strings.setLanguage(this.state.language);
		const { openModal, closeModal, current_report_id, taxReturns,endDate,dueDate } = this.props;
		const { initValue, loading, reporting_period_list, } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openModal} className="modal-success contact-modal">
					<ModalHeader>
						<Row>
							<Col lg={12}>
								<div className="h4 mb-0 d-flex align-items-center">
									<i className="nav-icon fas fa-user-tie" />
									<span className="ml-2">File The Report For Tax Period ( {taxReturns} )</span>
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
							if (values.corporateTaxFiling && !values.taxFiledOn)
								errors.taxFiledOn = 'Date of filling is required';
							return errors;
						}}
						validationSchema={Yup.object().shape({
							//taxFiledOn: Yup.string().required('Date of filling is required'),
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
										<Row className='mb-4'><Col><h4>Transactions for the tax period cannot be edited after the tax report has been filed.</h4></Col></Row>
										<br></br>
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
														autoComplete="off"
														dateFormat="dd-MM-yyyy"
														dropdownMode="select"
														minDate={endDate}
														maxDate={dueDate}
														value={props.values.taxFiledOn || props.values.corporateTaxFiling ? props.values.taxFiledOn : endDate}
														selected={props.values.taxFiledOn || props.values.corporateTaxFiling ? props.values.taxFiledOn : endDate}
														onChange={(value) => {
															props.handleChange('taxFiledOn')(value);
															props.handleChange('corporateTaxFiling')(current_report_id);
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
												// this.setState({isTANMandetory:false})
												// this.setState({isTAANMandetory:false})
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
)(FileCtReportModal);