import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	ButtonGroup,
	Form,
	FormGroup,
	Input,
	Label,
	UncontrolledTooltip,
} from 'reactstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker'
import { Formik } from 'formik';
import * as Yup from "yup";
import { ConfirmDeleteModal, LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global'
import * as CreatePayrollActions from './actions';
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';
import moment from 'moment';
import download from 'downloadjs';
import { toast } from 'react-toastify';
import Currency from 'components/currency';


const mapStateToProps = (state) => {

	return ({
		company_details: state.common.company_details,
	})
}
const mapDispatchToProps = (dispatch) => {
	return ({
		commonActions: bindActionCreators(CommonActions, dispatch),
		createPayrollActions: bindActionCreators(CreatePayrollActions, dispatch),
	})
}

let strings = new LocalizedStrings(data);
class PayrollApproverScreen extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			createMore: false,
			dialog: false,
			initValue: {},
			payrollId: this.props.location.state.id,
			selectedEmployeesIdsList: [],
			selectedRows: [],
			selectRowProp: {
				mode: 'checkbox',
				bgColor: 'rgba(0,0,0, 0.05)',
				clickToSelect: false,
				onSelect: this.onRowSelect,
				onSelectAll: this.onSelectAll,
			},
			currencyIsoCode: "AED",
			disableLeavePage: false,
			currentTime: ''
		}

		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;

		this.options = {
			// onRowClick: this.goToDetail,
			paginationPosition: 'bottom',
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
			comment: '',
		}

	}

	componentDidMount = () => {
		this.initializeData();
	};
	initializeData = () => {
		const { payrollId } = this.state;
		this.props.createPayrollActions.getPayrollById(payrollId).then((res) => {
			if (res.status === 200) {
				//pay period date format 
				let dateArr = res.data.payPeriod.split("-");
				let payPeriodString = dateArr[0].replaceAll('/', '-') + " - " + dateArr[1].replaceAll('/', '-')

				this.setState({
					loading: false,
					id: res.data.id ? res.data.id : '',
					approvedBy: res.data.approvedBy ? res.data.approvedBy : '',
					comment: res.data.comment ? res.data.comment : '',
					deleteFlag: res.data.deleteFlag ? res.data.deleteFlag : '',
					employeeCount: res.data.employeeCount ? res.data.employeeCount : '',
					generatedBy: res.data.generatedBy ? res.data.generatedBy : '',

					isActive: res.data.isActive ? res.data.isActive : '',
					payPeriod: payPeriodString,
					payrollApprover: res.data.payrollApprover ? res.data.payrollApprover : '',
					payrollDate: res.data.payrollDate
						? moment(res.data.payrollDate).format('DD-MM-YYYY')
						: '',
					payrollSubject: res.data.payrollSubject ? res.data.payrollSubject : '',
					runDate: res.data.runDate ? res.data.runDate : '',
					status: res.data.status ? res.data.status : '',
					currencyIsoCode: res.data.currencyIsoCode ? res.data.currencyIsoCode : "AED",
					existEmpList: res.data.existEmpList ? res.data.existEmpList : []
				})
				this.getAllPayrollEmployee(payrollId)
			}
		}).catch((err) => {
			this.setState({ loading: false })
		})
	};

	approveAndRunPayroll = () => {
		const { selectedEmployeesIdsList } = this.state;
		this.setState({ disableLeavePage: true })
		let payPeriod = this.state.payPeriod
		const [startDateString, endDateString] = payPeriod.split(" - ");
		const startDate = startDateString.trim();
		const endDate = endDateString.trim();
		const postData = {
			payrollId: this.state.payrollId,
			startDate: startDate,
			endDate: endDate,
			payrollEmployeesIdsListToSendMail: selectedEmployeesIdsList,
		};
		this.props.createPayrollActions
			.approveAndRunPayroll(postData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert('success', 'Payroll Approved Successfully. Payslip sent to employees Successfully')
					this.getAllPayrollEmployee()
					this.props.history.push('/admin/payroll/payrollrun')
				}
			}).catch((err) => {
				this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
			})

	}
	renderStatus = (status) => {
		let classname = '';

		if (status === 'Approved') {
			classname = 'label-success';
		} if (status === 'Paid') {
			classname = 'label-sent';
		} else
			if (status === 'UnPaid') {
				classname = 'label-closed';
			} else if (status === 'Draft') {
				classname = 'label-currency';
			} else if (status === 'Paid') {
				classname = 'label-approved';
			} else if (status === 'Rejected') {
				classname = 'label-due';
			} if (status === 'Submitted') {
				classname = 'label-sent';
			} else if (status === 'Partially Paid') {
				classname = 'label-PartiallyPaid';
			} else if (status === "Voided") {
				classname = 'label-closed';
			}
		// else {
		// 	classname = 'label-overdue';
		// }
		return (
			<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
				{status}
			</span>
		);
	};
	generateSifFile = () => {
		const now = new Date();
		const hours = now.getHours();
		const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		const seconds = now.getSeconds().toString().padStart(2, '0');
		const currentTimeNow = `${formattedHours}:${minutes}:${seconds}`;
		this.props.createPayrollActions
			.generateSifFile(this.state.payrollId, this.state.existEmpList, currentTimeNow)
			.then((res) => {
				if (res.status === 200) {
					const blob = new Blob([res.data[1]], { type: 'application/sif' });
					download(blob, res.data[0] ? res.data[0] + '.SIF' : "payroll.SIF")
					this.props.commonActions.tostifyAlert('success', 'SIF File Downloaded Successfully')
				}
			}).catch((err) => {
				this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'File Already Opened please close file')
			})
	}
	voidPayrollApi = () => {
		this.setState({ disableLeavePage: true, loading: true, loadingMsg: "Voiding..." });
		let formData = {
			postingRefId: this.state.payrollId,
			postingRefType: "PAYROLL",
			comment: this.state.comment
		}
		this.props.createPayrollActions.voidPayroll(formData).then((res) => {
			if (res.status === 200) {
				toast.success("Payroll Voided Successfully");
				this.props.history.push('/admin/payroll/payrollrun')
				this.setState({ loading:false, })
			}
		}).catch((err) => {
			toast.error("Payroll Voided UnSuccessfully")
		})
	}
	handleSubmit = () => {
		this.setState({ disabled: true, disableLeavePage: true });
		const { status } = this.state;
		const { user } = this.props.location.state;
		if (status === "Approved" && user !== 'Generator') {
			this.voidPayroll()
		}
		else if (status === "Submitted" && user !== 'Generator') {
			this.rejectPayrollConfirmation()
		}
	}
	getAllPayrollEmployee = () => {
		this.props.createPayrollActions.getAllPayrollEmployee(this.state.payrollId).then((res) => {
			if (res.status === 200) {
				const payrollEmployee = res.data;
				const allIds = payrollEmployee.map(row => row.id);
				const allEmployeeIds = payrollEmployee.map(row => row.empId);
				this.setState({
					allPayrollEmployee: payrollEmployee,
					selectedRows: allIds,
					selectedEmployeesIdsList: allEmployeeIds,
				})
			}
		})
	}

	renderPayrollEmployeeList = () => {
		const { generateSif } = this.props.company_details;
		const { allPayrollEmployee, status, selectedRows } = this.state;
		const selectRowProp = {
			mode: 'checkbox',
			// bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
			selected: selectedRows,
			hideSelectColumn: status === "Submitted" ? false : true,
		};
		return (
			<><Row>

				<Col lg={6}>
					<Label> Status : <span style={{ fontSize: "larger" }}>  {this.renderStatus(status)}</span></Label>
				</Col>
				<Col lg={6}>
					{generateSif && status && (status === "Approved" || status === "Paid" || status === "Partially Paid") && (
						<Button
							type="button"
							color="primary"
							className="btn-square mb-3 pull-right "
							onClick={() => {
								// this.exportExcelFile()
								this.generateSifFile()
							}
							}
						>
							<i className="fas fa-file-invoice-dollar"></i>
							{"  "}Download SIF file
						</Button>
					)}

				</Col>
				{status === "Submitted" &&
					<Col lg={12}>
						<hr />
						<div className='mb-2' style={{ marginLeft: '2.2rem' }}>
							{strings.SendPayslip}
							<i
								id="sendMAilTip"
								className="fa fa-question-circle ml-1"
							></i>
							<UncontrolledTooltip
								placement="right"
								target="sendMAilTip"
							>
								{strings.APaySlipWillBeMailedToTheSelectedEmployees}
							</UncontrolledTooltip>
						</div>
					</Col>
				}
				<Col lg={12} className='payroll-List'>
					<BootstrapTable
						selectRow={selectRowProp}
						search={false}
						options={this.options}
						data={allPayrollEmployee || []}
						version="4"
						hover
						keyField="id"
						remote
						trClassName="cursor-pointer"
						csvFileName="payroll_employee_list.csv"
						ref={(node) => this.table = node}
					>
						<TableHeaderColumn
							dataField="empCode"
							dataSort
							className="table-header-bg"
						>
							Employee No
						</TableHeaderColumn>
						<TableHeaderColumn
							// isKey
							dataField="empName"
							dataSort
							className="table-header-bg"
						>
							Employee Name
						</TableHeaderColumn>
						<TableHeaderColumn
							width='8%'
							dataField="lopDay"
							dataSort
							className="table-header-bg"
						>
							LOP
						</TableHeaderColumn>
						<TableHeaderColumn
							width='12%'
							dataField="noOfDays"
							dataSort
							className="table-header-bg"
						>
							Paid Days
						</TableHeaderColumn>
						<TableHeaderColumn
							dataField="grossPay"
							dataSort
							dataFormat={this.renderGrossPay}
							className="table-header-bg"
						>
							Gross Pay
						</TableHeaderColumn>
						<TableHeaderColumn
							dataField="deduction"
							dataSort
							dataFormat={this.renderDeductions}
							className="table-header-bg"
						>
							Deductions
						</TableHeaderColumn>
						<TableHeaderColumn
							width='12%'
							dataField="netPay"
							dataFormat={this.renderNetPay}
							dataSort
							className="table-header-bg"
						>
							Net Pay
						</TableHeaderColumn>
					</BootstrapTable>
				</Col>
			</Row >
			</>
		)
	}
	renderGrossPay = (cell) => {
		const { currencyIsoCode } = this.state;
		return (
			<Currency
				value={cell}
				currencySymbol={currencyIsoCode}
			/>
		);
	}
	renderDeductions = (cell) => {
		const { currencyIsoCode } = this.state;
		return (
			<Currency
				value={cell}
				currencySymbol={currencyIsoCode}
			/>
		);
	}
	renderNetPay = (cell) => {
		const { currencyIsoCode } = this.state;
		return (
			<Currency
				value={cell}
				currencySymbol={currencyIsoCode}
			/>
		);
	}


	generate = () => {



		this.props.createPayrollActions
			.generatePayroll(this.state.payrollId, JSON.stringify(this.state.allPayrollEmployee), this.state.payrollDate)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert('success', 'genrated payroll Successfully')
					this.getAllPayrollEmployee()
					// resetForm(this.state.initValue)
				}
			}).catch((err) => {
				this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
			})

	}

	onRowSelect = (row, isSelected, e) => {
		const { selectedEmployeesIdsList, selectedRows } = this.state;
		let selectedEmpIdsList = Object.assign([], selectedEmployeesIdsList);
		let selectedRowsList = Object.assign([], selectedRows);
		if (isSelected) {
			selectedEmpIdsList.push(row.empId);
			selectedRowsList.push(row.id);
		} else {
			selectedEmpIdsList = selectedEmpIdsList.filter(obj => parseInt(obj) !== parseInt(row.empId))
			selectedRowsList = selectedRowsList.filter(obj => parseInt(obj) !== parseInt(row.id))
		}
		this.setState({
			selectedEmployeesIdsList: selectedEmpIdsList,
			selectedRows: selectedRowsList,
		});
	};
	onSelectAll = (isSelected, rows) => {
		let selectedEmpIdsList = [];
		let selectedRowsList = [];
		if (isSelected) {
			rows.map((item) => {
				selectedEmpIdsList.push(item.empId);
				selectedRowsList.push(item.id);
				return item;
			});
		}
		this.setState({
			selectedEmployeesIdsList: selectedEmpIdsList,
			selectedRows: selectedRowsList,
		});
	};
	rejectPayroll = () => {
		this.setState({ disableLeavePage: true });
		this.props.createPayrollActions
			.rejectPayroll(this.state.payrollId, this.state.comment)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert('success', 'Payroll Rejected Successfully')
					this.getAllPayrollEmployee()
					this.props.history.push('/admin/payroll/payrollrun')
					// resetForm(this.state.initValue)
				}
			}).catch((err) => {
				this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
			})

	}
	rejectPayrollConfirmation = () => {
		this.setState({ disableLeavePage: true });
		const message1 =
			<text>
				<b>Would you like to reject this payroll ?</b>
			</text>
		const message = 'This Payroll will be Rejected. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.rejectPayroll}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});


	};
	voidPayroll = () => {
		const message1 =
			<text>
				<b>Would you like to void this payroll ?</b>
			</text>
		const message = 'This Payroll will be Voided. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.voidPayrollApi}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});


	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};
	render() {
		strings.setLanguage(this.state.language);
		const { loading, dialog } = this.state
		return (
			loading == true ? <Loader /> :
				<div>
					<div className="create-employee-screen">
						<div className="animated fadeIn">
							<Row>
								<Col lg={12} className="mx-auto">
									<Card>
										<CardHeader>
											<Row>
												<Col lg={12}>
													<div className="h4 mb-0 d-flex align-items-center">
														<i className="nav-icon fas fa-user-tie" />
														<span className="ml-2"> Approve Payroll</span>
													</div>
												</Col>
											</Row>
										</CardHeader>
										<CardBody>
											{dialog}
											{loading ? (
												<Row>
													<Col lg={12}>
														<Loader />
													</Col>
												</Row>
											) : (
												<Row>
													<Col lg={12}>
														<div className="d-flex justify-content-end">
															<ButtonGroup size="sm">

															</ButtonGroup>
														</div>

														<div>
															<Formik

																initialValues={this.state}
																onSubmit={() => {
																	this.handleSubmit();

																}}
																validationSchema={Yup.object().shape({
																	comment: Yup.string()
																		.required("Reason is required"),
																})}
																validate={(values) => {
																	let errors = {};
																	if (this.state.comment && !values.comment) {
																		errors.comment = 'Reason is required';
																	}
																	return errors;
																}}
															>
																{(props) => (


																	<Form onSubmit={props.handleSubmit}>
																		<Row>
																			<Col >
																				<FormGroup className="mb-3">
																					<Label htmlFor="date">

																						Payroll Date
																					</Label>
																					<DatePicker
																						id="payrollDate"
																						name="payrollDate"
																						disabled={true}
																						placeholderText={strings.payrollDate}
																						showMonthDropdown
																						showYearDropdown
																						dateFormat="dd-MM-yyyy"
																						dropdownMode="select"
																						value={this.state.payrollDate}
																						onChange={(value) => {
																							props.handleChange('payrollDate')(
																								moment(value).format('DD-MM-YYYY'),
																							);
																						}}
																						className={`form-control ${props.errors.payrollDate &&
																							props.touched.payrollDate
																							? 'is-invalid'
																							: ''
																							}`}
																					/>
																					{props.errors.payrollDate &&
																						props.touched.payrollDate && (
																							<div className="invalid-feedback">
																								{props.errors.payrollDate}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																			<Col>
																				<FormGroup>
																					<Label htmlFor="payrollSubject"> Payroll Subject</Label>
																					<Input
																						type="text"
																						id="payrollSubject"
																						name="payrollSubject"
																						disabled={true}
																						maxLength="100"
																						value={this.state.payrollSubject}
																						placeholder={strings.Enter + " Payroll Subject"}
																						onChange={(value) => {
																							props.handleChange('payrollSubject')(value);

																						}}
																						className={props.errors.payrollSubject && props.touched.payrollSubject ? "is-invalid" : ""}
																					/>
																					{props.errors.payrollSubject && props.touched.payrollSubject && (
																						<div className="invalid-feedback">
																							{props.errors.payrollSubject}
																						</div>
																					)}

																				</FormGroup>
																			</Col>
																			<Col>
																				<FormGroup>
																					<Label htmlFor="payPeriod">  {strings.pay_period}</Label>
																					<Input
																						type="text"
																						id="payPeriod"
																						name="payPeriod"
																						value={this.state.payPeriod}
																						placeholder={strings.Enter + " Pay period"}
																						onChange={(value) => {
																							props.handleChange('payPeriod')(value);

																						}}
																						disabled={true}
																						className={props.errors.payPeriod && props.touched.payPeriod ? "is-invalid" : ""}
																					/>
																					{props.errors.payPeriod && props.touched.payPeriod && (
																						<div className="invalid-feedback">
																							{props.errors.payPeriod}
																						</div>
																					)}

																				</FormGroup>
																			</Col>
																		</Row>
																		{this.renderPayrollEmployeeList()}
																		<Row className="mb-4 ">
																			<Col>
																				<FormGroup>
																					{this.state.status && (this.state.status === "Partially Paid" || this.state.status === "Paid" || this.state.status === "Draft") ?
																						'' : (
																							this.state.status && (this.state.status === "Voided" || this.state.status === "Submitted" || this.state.status === "Rejected" || this.state.status === "Approved") &&
																							(((this.state.status === "Submitted" || this.state.status === "Rejected" || this.state.status === "Approved") && this.props.location?.state?.user === "Generator") ? '' :
																								<div>
																									<Label htmlFor="payrollSubject">
																										{this.state.status == "Approved" || this.state.status == "Voided" ?
																											"Reason for voiding the payroll" :
																											"Reason for rejecting the payroll"}
																									</Label>
																									<Input
																										// className="mt-4 pull-right"
																										type="text"
																										maxLength="250"
																										id="comment"
																										name="comment"
																										value={this.state.comment}
																										disabled={this.state.status == "Voided" || this.state.status === "Rejected" ? true : false}
																										placeholder={strings.Enter + "reason"}
																										onChange={(event) => {
																											props.handleChange('comment')(event.target.value);
																											this.setState({
																												comment: event.target.value
																											})

																										}}
																										className={props.errors.comment ? "is-invalid" : ''}
																									/>
																									{props.errors.comment && (
																										<div className="invalid-feedback">
																											{props.errors.comment}
																										</div>
																									)}
																								</div>
																							)
																						)
																					}

																					{this.state.status && this.state.status === "Submitted" && this.props.location?.state?.user !== 'Generator' &&
																						<Button
																							color="primary"
																							type="submit"
																							className="btn-square mt-4 "
																							onClick={() => {

																								if (this.state.comment == "") {
																									this.props.commonActions.fillManDatoryDetails();
																								}

																							}}
																						>
																							<i className="fas fa-user-times mr-1"></i>

																							Reject Payroll
																						</Button>
																					}

																					{this.state.status === "Approved" && this.props.location?.state?.user !== 'Generator' && (

																						<Button

																							color="primary"
																							className="btn-square mt-4 "
																							type="submit"
																							onClick={() => {
																								if (this.state.comment == "") {
																									this.props.commonActions.fillManDatoryDetails();
																								}
																							}}
																						>
																							<i className="fas fa-user-times mr-1"></i>

																							Void This Payroll
																						</Button>)}

																				</FormGroup>


																			</Col>

																			<Col>
																				<ButtonGroup className="mt-5 pull-right ">
																					{this.state.status && this.state.status === "Submitted" && this.props.location?.state?.user !== 'Generator' &&
																						<Button
																							type="button"
																							color="primary"
																							className="btn-square mt-5 pull-right "
																							onClick={() =>
																								this.approveAndRunPayroll()
																							}
																						>
																							<i className="fas fa-bullseye mr-1"></i>
																							Approve & Run Payroll
																						</Button>
																					}
																					<Button
																						color="secondary"
																						className="btn-square  pull-right   mt-5"
																						onClick={() => {
																							if (this.props.location && this.props.location.state && this.props.location.state.gotoReports) {
																								this.props.history.push(this.props.location.state.gotoReports)
																							}else{
																								this.props.history.push('/admin/payroll/payrollrun')
																						}}}
																					>
																						<i className="fa fa-ban"></i> {strings.Cancel}
																					</Button>
																				</ButtonGroup>



																			</Col>
																		</Row>

																	</Form>
																)}
															</Formik>
														</div>
														
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
		)
	}
}


export default connect(mapStateToProps, mapDispatchToProps)(PayrollApproverScreen)

