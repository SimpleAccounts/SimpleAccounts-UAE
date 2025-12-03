import React from 'react';
import { connect } from 'react-redux';
import {
	Card,
	CardBody,
	Row,
	Col,
	NavItem,
	Nav,
	TabContent,
	NavLink,
	TabPane,
	CardGroup,
	Table,
	Button,
	UncontrolledTooltip,
	FormGroup,
} from 'reactstrap';
import * as EmployeeViewActions from "./actions"
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { ConfirmDeleteModal, Currency } from 'components';
import 'react-toastify/dist/ReactToastify.css';
// import 'react-select/dist/react-select.css'
import './style.scss';
import { bindActionCreators } from 'redux';
import { upperFirst } from 'lodash-es';
import moment from 'moment';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { ViewPaySlip } from './sections';
import {
	CommonActions
} from 'services/global'
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { toast } from 'react-toastify';
import { amountFormat } from 'screens/bank_account/screens/transactions/screens/create/helpers/amountformater';
const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
		company_details: state.common.company_details,
	};
};


const mapDispatchToProps = (dispatch) => {
	return {
		employeeViewActions: bindActionCreators(EmployeeViewActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

const avatar = require('assets/images/avatars/default-avatar.jpg');
let strings = new LocalizedStrings(data);
class ViewEmployee extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			openModal: false,
			selectedData: {},
			activeTab: new Array(4).fill('1'),
			EmployeeDetails: '',
			userPhoto: [],
			salarySlipList: [],
			Fixed: [],
			Deduction: [],
			Variable: [],
			FixedAllowance: [],
			CTC: '',
			current_employee_id: '',
			transactionList: [],
			dialog: null,
			isEmployeeDeletable: true,
		};


		this.columnHeader1 = [
			{ label: 'Component Name', value: 'Component Name', sort: false },
			{ label: 'Monthly', value: 'Monthly', sort: false },
			{ label: 'Annually', value: 'Annually', sort: false },
		];
	}

	toggle = (tabPane, tab) => {
		const newArray = this.state.activeTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		this.setState({
			activeTab: newArray,
		});
	};
	componentDidMount = () => {
		this.initializeData();
	};
	renderActionsForTds = (cell, row) => {
		return (
			<div>
				<Button
					onClick={() =>
						this.props.history.push(
							'/admin/payroll/employee/salarySlip',
							{ id: row.id },
						)
					}
				>
					<i className="fas fa-eye" /> {strings.View}
				</Button>

			</div>
		);
	};
	viewPaySlip = (data) => {
		//getSalarySlip
		// this.props.employeeViewActions
		// 	.getSalarySlip(data)
		// 	.then((res) => {
		//         if (res.status === 200) {
		// 		// this.initializeData();


		// 			this.setState({

		// 			});

		//     }})
		// 	.catch((err) => {
		// 		this.props.commonActions.tostifyAlert(
		// 			'error',
		// 			err && err.data ? err.data.message : 'Something Went Wrong',
		// 		);
		// 	});
		this.setState({
			openModal: true
		})

	}

	disable = () => {
		if (this.state.EmployeeDetails.employmentId === null) {
			return true;
		} else {
			return false;
		}
	};
	renderActions = (cell, row) => {
		return (
			<div>
				<Button
					className="btn-sm"
					style={{ padding: '0px' }}
					color="link"
					onClick={() => {
						const postData = {
							id: this.props.location.state.id,
							salaryDate: moment(row.salaryDate).format('DD/MM/YYYY'),
							sendMail: false,
							startDate: '',
							endDate: '',
						};
						this.props.employeeViewActions
							.getSalarySlip(postData)
							.then((res) => {
								if (res.status === 200) {
									// this.initializeData();
									// let v ="Fixed Allowance"
									res.data.netPay = res.data.earnings - res.data.deductions;
									this.setState({
										salaryDate: row.salaryDate,
										employeename: res.data.employeename,
										selectedData: res.data,
										Fixed: res.data.salarySlipResult.Fixed,
										FixedAllowance: res.data.salarySlipResult.Fixed_Allowance ? res.data.salarySlipResult.Fixed_Allowance : res.data.salarySlipResult["Fixed Allowance"],
										Variable: res.data.salarySlipResult.Variable,
										Deduction: res.data.salarySlipResult.Deduction,
									});
								}
								let payPeriod = this.state.selectedData.payPeriod
								const [startDateString, endDateString] = payPeriod.split("-");
								const startDate = startDateString.trim();
								const endDate = endDateString.trim();
								const postData = {
									employeeId: this.props.location.state.id,
									startDate: moment(startDate).format('DD/MM/YYYY'),
									endDate: moment(endDate).format('DD/MM/YYYY'),
								};
								this.props.employeeViewActions
									.getEmployeeTransactions(postData)
									.then((res) => {
										if (res.status === 200) {
											this.setState({
												transactionList: res.data,
											});
										}
									})
									.catch((err) => {
										this.props.commonActions.tostifyAlert(
											'error',
											err && err.data ? err.data.message : 'Something Went Wrong',
										);
									})
							})
							.catch((err) => {
								this.props.commonActions.tostifyAlert(
									'error',
									err && err.data ? err.data.message : 'Something Went Wrong',
								);
							});

						this.viewPaySlip({ id: this.props.location.state.id, salaryDate: moment(Date(row.salaryDate)).format('DD/MM/YYYY') });
					}

					}
				>
					<i className="fas fa-eye" />  {strings.View}
				</Button>

				<Button
					className="btn-sm ml-3"
					style={{ padding: '0px' }}
					color="link"
					onClick={() => {
						let payPeriod = row.payPeriod
						const [startDateString, endDateString] = payPeriod.split("-");
						const startDate = startDateString.trim();
						const endDate = endDateString.trim();
						const postData = {
							id: this.props.location.state.id,
							salaryDate: moment(row.salaryDate).format('DD/MM/YYYY'),
							sendMail: true,
							startDate: moment(startDate, "DD/MM/YYYY").format('DD-MM-YYYY'),
							endDate: moment(endDate, "DD/MM/YYYY").format('DD-MM-YYYY'),
						};
						this.props.employeeViewActions
							.getSalarySlip(postData)
							.then((res) => {
								if (res.status === 200) {
									// let payPeriod = res.data.payPeriod
									// const [startDateString, endDateString] = payPeriod.split("-");
									// const startDate = startDateString.trim();
									// const endDate = endDateString.trim();
									// const postData = {
									// 	employeeId: this.props.location.state.id,
									// 	startDate: moment(startDate).format('DD/MM/YYYY'),
									// 	endDate: moment(endDate).format('DD/MM/YYYY'),
									// };
									toast.success("Payslip Sent Successfully")
								}
							})
					}}
				>
					<i className="fas fa-send" /> {strings.Send}
				</Button>
			</div>
		);
	};

	closeModal = (res) => {
		this.setState({ openModal: false });
		this.initializeData();
	};

	initializeData = () => {
		if (this.props.location.state && this.props.location.state.tabNo) {
			this.toggle(0, this.props.location.state.tabNo)
		} else
			this.toggle(0, this.state.activeTab[0])
		if (this.props.location.state && this.props.location.state.id) {
			this.props.employeeViewActions
				.getEmployeeById(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						this.setState(
							{
								current_employee_id: this.props.location.state.id,
								EmployeeDetails: res.data,
								userPhoto: res.data.profileImageBinary
									? this.state.userPhoto.concat(res.data.profileImageBinary)
									: [],
								loading: false,
								isEmployeeDeletable: res.data.isEmployeeDeletable,
							},
							() => {

							},
						);
					}
				})

			this.props.employeeViewActions
				.getSalarySlipList(this.props.location.state.id)
				.then((res) => {

					if (res.status === 200) {
						this.setState(
							{
								current_employee_id: this.props.location.state.id,
								salarySlipList: res.data.resultSalarySlipList,
								loading: false,
							},
							() => {

							},
						);
					}
				})

			this.props.employeeViewActions
				.getSalaryComponentByEmployeeId(this.props.location.state.id)
				.then((res) => {

					if (res.status === 200) {
						this.setState(
							{
								current_employee_id: this.props.location.state.id,
								Fixed: res.data.salaryComponentResult.Fixed,
								Variable: res.data.salaryComponentResult.Variable,
								Deduction: res.data.salaryComponentResult.Deduction,
								FixedAllowance: res.data.salaryComponentResult.Fixed_Allowance,
								CTC: res.data.ctc,
								loading: false,
							},
							() => {
								const { Fixed, Deduction } = this.state;
								const totalEarnings = this.totalEarning(Fixed);
								const totalDeductions = this.totalEarning(Deduction);
								const totalMonthlyEarnings = totalEarnings.monthly;
								const totalYearlyEarnings = totalEarnings.yearly;
								const totalMonthlyDeductions = totalDeductions.monthly;
								const totalYearlyDeductions = totalDeductions.yearly;
								const totalNetPayMontly = parseFloat(totalMonthlyEarnings) - parseFloat(totalMonthlyDeductions);
								const totalNetPayYearly = parseFloat(totalYearlyEarnings) - parseFloat(totalYearlyDeductions);
								this.setState({
									totalMonthlyEarnings: totalMonthlyEarnings,
									totalYearlyEarnings: totalEarnings.yearly,
									totalMonthlyDeductions: totalDeductions.monthly,
									totalYearlyDeductions: totalDeductions.yearly,
									totalNetPayMontly: totalNetPayMontly,
									totalNetPayYearly: totalNetPayYearly,
								})
							},
						);
					}
				})


		} else {
			// this.props.history.push('/admin/payroll/employee');
			this.props.history.push('/admin/master/employee');
		}
	};
	totalEarning = (data) => {
		let monthly = 0;
		let yearly = 0;
		if (data && data.length > 0) {
			data = data.filter(obj => obj.id !== '')
			data.map((item) => {
				if (item.monthlyAmount) {
					monthly += parseFloat(item.monthlyAmount);
				} if (item.yearlyAmount) {
					yearly += parseFloat(item.yearlyAmount);
				}
			});
		}
		return { yearly: yearly, monthly: monthly };
	}
	deleteEmployee = () => {
		const { current_employee_id } = this.state;
		const message1 =
			<text>
				<b>Delete Employee?</b>
			</text>
		const message = 'This Employee will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeEmployee}
					cancelHandler={this.removeDialog}
					message1={message1}
					message={message}
				/>
			),

		});
	};
	removeEmployee = () => {
		this.setState({ disabled1: true });
		const { current_employee_id } = this.state;
		this.setState({ loading: true, loadingMsg: "Deleting Employee..." });
		this.props.employeeViewActions
			.deleteEmployee(current_employee_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Employee Deleted Successfully!',
					);

					this.props.history.push('/admin/master/employee');
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Employee Deleted Unsuccessfully',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};
	getPhoto = () => {
		// let image ="data:image/png;base64, "+ this.state.userPhoto[0];
		let image = this.state.userPhoto.length !== 0
			? "data:image/png;base64, " +
			this.state.userPhoto[0]
			: avatar;

		return image;
	}
	renderSalaryDate = (cell, row) => {
		let salaryDateString = moment(row.salaryDate).format('DD-MM-YYYY')
		return salaryDateString
	}
	getEmployeeInviteEmail = () => {
		this.props.employeeViewActions
			.getEmployeeInviteEmail(this.props.location.state.id)
			.then((res) => {
				if (res.status === 200) {
					toast.success("Mail Sent Successfully")
				}
			})
	}
	render() {
		strings.setLanguage(this.state.language);
		const { profile } = this.props;
		const { generateSif } = this.props.company_details;
		const { dialog, isEmployeeDeletable, totalNetPayYearly, totalNetPayMontly } = this.state;
		return (
			<div className="financial-report-screen">
				<div className="animated fadeIn">
					{dialog}
					<Card>
						<CardBody>
							<Row>
								<Col>
									<div className="h6 mb-4 d-flex align-items-center">

										<h3>{upperFirst(this.state.EmployeeDetails.fullName)}</h3>
									</div>
								</Col>
								<Col>
									<div className='pull-right'>
										<Button
											type="submit"
											color="primary"
											className="btn-square mr-3"
											onClick={() => { this.getEmployeeInviteEmail() }}
										><i className="fas fa-envelope"></i>{' '}
											Resend Invite
										</Button>
										<Button
											onClick={() => { this.props.history.push('/admin/master/employee') }}
										> X </Button>

									</div>
								</Col>
							</Row>
							<Nav tabs pills>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '1'}
										onClick={() => {
											this.toggle(0, '1');
										}}
									>
										{strings.OverView}
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '2'}
										onClick={() => {
											this.toggle(0, '2');
										}}
									>
										{strings.SalaryDetails}
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '3'}
										onClick={() => {
											this.toggle(0, '3');
										}}
									>
										{strings.Payslips}
									</NavLink>
								</NavItem>

							</Nav>
							<TabContent activeTab={this.state.activeTab[0]}>
								<TabPane tabId="1">
									<div className="table-wrapper">
										<CardGroup>
											<Card style={{ height: '621px' }}>
												<div >
													<CardBody className='m-4'>
														{generateSif && <Row>
															<Col>
																<label> <b>{strings.EmployementDetails} </b></label>
															</Col>
															<Col>
																<Button
																	color="primary"
																	className="btn-square pull-right mb-2"
																	style={{ marginBottom: '10px' }}
																	onClick={() =>
																		this.props.history.push(`/admin/master/employee/updateEmployeeEmployment`,
																			{ id: this.state.current_employee_id })

																	}
																>
																	<i className="far fa-edit"></i>
																</Button>
															</Col>
														</Row>}

														<div className='text-center'>

															<img
																src={this.getPhoto()}
																className="img-avatar mr-2"
																style={{ width: '200px', height: '200px' }}
																alt=""
															/>


														</div>
														<div className='text-center mt-4' >
															<h3>{upperFirst(this.state.EmployeeDetails.fullName)} {' '}
																({this.state.EmployeeDetails.employeeCode ? this.state.EmployeeDetails.employeeCode : '-'}{ })</h3>

															<h4>
																{upperFirst(this.state.EmployeeDetails.employeeDsignationName)}
															</h4>
														</div>
														<hr style={{ width: '90%' }}></hr>

														<div>
															<label > {strings.BasicInformation}</label>
															<hr style={{ width: '50%' }}></hr>
															<div style={{ fontSize: '16px' }}>
																<div className='mt-2 mb-2'><span id="mail"> <i className="far fa-envelope"></i>
																	<UncontrolledTooltip
																		placement="left"
																		target="mail"
																	>
																		E-mail
																	</UncontrolledTooltip>&nbsp;{this.state.EmployeeDetails.email ? this.state.EmployeeDetails.email : '-'}</span></div>
																<div className='mt-2 mb-2' ><span id="Gender"><i className="far fa-user"></i>
																	<UncontrolledTooltip
																		placement="left"
																		target="Gender"
																	>
																		Gender
																	</UncontrolledTooltip>&nbsp;{this.state.EmployeeDetails.gender ? this.state.EmployeeDetails.gender : '-'}</span></div>
																<div className='mt-2 mb-2'  ><span id="dojTooltip"><i className="far fa-calendar-minus"></i>
																	<UncontrolledTooltip
																		placement="left"
																		target="dojTooltip"
																	>
																		Date of Joining
																	</UncontrolledTooltip>  &nbsp;{this.state.EmployeeDetails.dateOfJoining ? this.state.EmployeeDetails.dateOfJoining : '-'}</span></div>
																{generateSif &&
																	<div className='mt-2 mb-2' >
																		<UncontrolledTooltip
																			placement="left"
																			target="department"
																		>
																			Department
																		</UncontrolledTooltip>
																		<span id="department"> <i className="fas fa-network-wired"></i> &nbsp;{this.state.EmployeeDetails.department ? this.state.EmployeeDetails.department : '-'}</span>
																	</div>
																}
															</div>
														</div>
														<hr></hr>
														<div>

														</div>
													</CardBody>
												</div>
											</Card>
											<div style={{ width: '60%' }} className='ml-4'>
												<Card style={{ width: '650px' }}>
													<div>
														<CardBody className='m-4' style={{ height: '250px', width: '600px' }}>
															<div>
																<Row>
																	<Col>
																		<label> <b>{strings.PersonalInformation} </b></label>
																	</Col>
																	<Col>
																		<Button
																			color="primary"
																			className="btn-square pull-right mb-2"
																			style={{ marginBottom: '10px' }}
																			onClick={() =>
																				// this.props.history.push(`/admin/payroll/employee/updateEmployeePersonal`,
																				// { id: this.state.current_employee_id })
																				this.props.history.push(`/admin/master/employee/updateEmployeePersonal`,
																					{ id: this.state.current_employee_id })
																			}
																		>
																			<i className="far fa-edit"></i>
																		</Button>
																	</Col>
																</Row>
																<Row> <Col className='mt-2 mb-2'>{strings.MiddleName} </Col>
																	<Col className='mt-2 mb-2'>: &nbsp;{this.state.EmployeeDetails.middleName && this.state.EmployeeDetails.lastName ?
																		this.state.EmployeeDetails.middleName + " " + this.state.EmployeeDetails.lastName : ('-')}</Col></Row>

																<Row> <Col className='mt-2 mb-2'>{strings.DateOfBirth} </Col><Col className='mt-2 mb-2'>: &nbsp;{this.state.EmployeeDetails.dob ? moment(this.state.EmployeeDetails.dob).format('DD-MM-YYYY') : ('-')}</Col></Row>

																{/* <Row> <Col className='mt-2 mb-2'>Personal Email  </Col><Col className='mt-2 mb-2'>: &nbsp;{this.state.EmployeeDetails.email ? this.state.EmployeeDetails.email : ('-')}</Col></Row>				 */}

																<Row> <Col className='mt-2 mb-2'>{strings.MobileNumber} </Col><Col className='mt-2 mb-2'>: &nbsp;{this.state.EmployeeDetails.mobileNumber ? this.state.EmployeeDetails.mobileNumber : ('-')}</Col></Row>

																<Row> <Col className='mt-2 mb-2'>{strings.Address} </Col><Col className='mt-2 mb-2'>: &nbsp;{(this.state.EmployeeDetails.presentAddress ? this.state.EmployeeDetails.presentAddress : "") + (this.state.EmployeeDetails.city ? this.state.EmployeeDetails.city + ' , ' : '') +
																	(this.state.EmployeeDetails.stateName ? this.state.EmployeeDetails.stateName + ' , ' : '') + (this.state.EmployeeDetails.countryName ? this.state.EmployeeDetails.countryName : '') + (this.state.EmployeeDetails.pincode ? this.state.EmployeeDetails.pincode + ' , ' : '')}</Col></Row>

															</div>
														</CardBody>
													</div>
												</Card>

												{generateSif && <Card style={{ width: '650px' }}>
													<div>
														<CardBody className='m-4' style={{ height: '250px', width: '600px' }}>
															<div>
																<Row>
																	<Col>
																		<label><b> {strings.BankInformation} </b></label>
																	</Col>
																	<Col>
																		<Button
																			color="primary"
																			className="btn-square pull-right mb-2"
																			style={{ marginBottom: '10px' }}
																			onClick={() =>
																				//  this.props.history.push(`/admin/payroll/employee/updateEmployeeBank`,
																				// { id: this.state.current_employee_id })
																				this.props.history.push(`/admin/master/employee/updateEmployeeBank`,
																					{ id: this.state.current_employee_id })
																			}
																		>
																			<i className="far fa-edit"></i>
																		</Button>
																	</Col>
																</Row>
																<Row> <Col className='mt-2 mb-2'>{strings.BankHolderName} </Col><Col className='mt-2 mb-2'>: &nbsp;{this.state.EmployeeDetails.accountHolderName ?
																	this.state.EmployeeDetails.accountHolderName : ('-')}</Col></Row>


																<Row> <Col className='mt-2 mb-2'>{strings.AccountNumber} </Col><Col className='mt-2 mb-2'>: &nbsp;{this.state.EmployeeDetails.accountNumber ? this.state.EmployeeDetails.accountNumber : ('-')}</Col></Row>

																<Row> <Col className='mt-2 mb-2'>{strings.BankName}</Col><Col className='mt-2 mb-2'>: &nbsp;{this.state.EmployeeDetails.bankName ? this.state.EmployeeDetails.bankName : ('-')}</Col></Row>

																<Row> <Col className='mt-2 mb-2'>{strings.Branch}</Col><Col className='mt-2 mb-2'>: &nbsp;{this.state.EmployeeDetails.branch ? this.state.EmployeeDetails.branch : ('-')}</Col></Row>

																<Row> <Col className='mt-2 mb-2'>{strings.IBAN} </Col><Col className='mt-2 mb-2'>: &nbsp;{this.state.EmployeeDetails.iban ? this.state.EmployeeDetails.iban : ('-')}</Col></Row>

															</div>
														</CardBody>
													</div>
												</Card>}
											</div>
										</CardGroup>
									</div>
								</TabPane>


								{/* salary EDIT */}
								<TabPane tabId="2">
									<div className="table-wrapper">
										<Row>
											<Col>
												<div className='m-4'>
													<Row style={{ width: '63%' }}>
														<Col><h5> {strings.AnnualCTC} </h5>
															<div><h3>  {this.state.CTC ?
																this.state.EmployeeDetails.ctcType == "ANNUALLY" ?
																	amountFormat(this.state.CTC, 'AED')
																	:
																	amountFormat(parseFloat(this.state.CTC) * 12, 'AED')
																: amountFormat(0.00, 'AED')}</h3></div></Col>
														<Col><h5> {strings.MonthlyIncome} </h5>
															<div> <h3>{this.state.CTC ?
																this.state.EmployeeDetails.ctcType == "ANNUALLY" ?
																	amountFormat(this.state.CTC / 12, 'AED')
																	:
																	amountFormat(this.state.CTC, 'AED')
																: amountFormat(0.00, 'AED')}</h3></div></Col>
														<Col>
															<Button
																className={`btn-square pull-right mb-2 mr-3 ${this.disable() ? `disabled-cursor` : ``
																	} `}
																disabled={this.disable() ? true : false}
																color="primary"

																style={{ marginBottom: '10px' }}
																onClick={() => this.props.history.push(`/admin/master/employee/updateSalaryComponent`,
																	{
																		id: this.state.current_employee_id, ctcTypeOption: this.state.EmployeeDetails.ctcType != null ?
																			(this.state.EmployeeDetails.ctcType == "ANNUALLY" ?
																				{ label: this.state.EmployeeDetails.ctcType, value: 1 }
																				: { label: this.state.EmployeeDetails.ctcType, value: 2 })
																			: { label: "ANNUALLY", value: 1 }
																	})}

																title={
																	this.disable()
																		? `Please fill the Employement Details before salary setup`
																		: ''
																}
															>
																<i className="far fa-edit">{strings.Edit}</i>
															</Button>
														</Col>
													</Row>
												</div>
												<Card style={{ height: 'auto', width: '65%' }} >
													<div>
														<CardBody>
															<Table className="text-center">
																<thead style={{ border: "3px solid #c8ced3" }}>
																	<tr style={{ border: "3px solid #c8ced3", background: '#dfe9f7', color: "Black" }}>
																		{this.columnHeader1.map((column, index) => {
																			return (
																				<th>
																					{column.label}
																				</th>
																			);
																		})}
																	</tr>
																</thead>
																<tbody>
																	{this.state.Fixed ? (
																		Object.values(
																			this.state.Fixed
																		).map((item) => (
																			<tr className="p-1">
																				<td className="text-left" style={{ border: "3px solid #dfe9f7" }} >{item.description}<div className=''>
																					{/* {item.description === 'Basic SALARY' ? '% of CTC' : '% of Baisc'} */}
																				</div></td>
																				<td className="text-right" style={{ border: "3px solid #dfe9f7" }} > {item.monthlyAmount ? amountFormat(item.monthlyAmount, 'AED') : '0.00'}</td>
																				<td className="text-right" style={{ border: "3px solid #dfe9f7" }} > {item.yearlyAmount ? amountFormat(item.yearlyAmount, 'AED') : '0.00'}</td>
																			</tr>

																		))) : (<tr></tr>)}


																	{this.state.Variable ? (
																		Object.values(
																			this.state.Variable
																		).map((item) => (
																			<tr>
																				<td className="text-left" style={{ border: "3px solid #dfe9f7" }} >{item.description}</td>
																				<td className="text-right" style={{ border: "3px solid #dfe9f7" }} >{item.monthlyAmount ? amountFormat(item.monthlyAmount, 'AED') : ''}</td>
																				<td className="text-right" style={{ border: "3px solid #dfe9f7" }} >{item.yearlyAmount ? amountFormat(item.yearlyAmount, 'AED') : ''}</td>
																			</tr>
																		))) : (<tr></tr>)}


																	{this.state.Deduction ? (
																		Object.values(
																			this.state.Deduction
																		).map((item) => (
																			<tr>
																				<td className="text-left" style={{ border: "3px solid #dfe9f7" }} >{item.description}</td>
																				<td className="text-right" style={{ border: "3px solid #dfe9f7" }} >{item.monthlyAmount ? amountFormat(item.monthlyAmount, "AED") : ''}</td>
																				<td className="text-right" style={{ border: "3px solid #dfe9f7" }} >{item.yearlyAmount ? amountFormat(item.yearlyAmount, "AED") : ''}</td>
																			</tr>
																		))) : (<tr></tr>)}
																</tbody>
																<tfoot>
																	<tr style={{ border: "3px solid #dfe9f7" }}>
																		<td className="text-left"><h5><b> {strings.CosttoCompany}</b></h5></td>
																		<td className="text-right"><h5>
																			<Currency
																				value={totalNetPayMontly}
																			/>
																		</h5></td>
																		<td className="text-right"><h5>
																			<Currency
																				value={totalNetPayYearly}
																			/>
																		</h5></td>
																	</tr>
																</tfoot>
															</Table>
														</CardBody>
													</div>
												</Card>
											</Col>

										</Row>
									</div>
								</TabPane>


								<TabPane tabId="3">
									<div style={{ width: "50%" }} className="table-wrapper">

										<BootstrapTable
											selectRow={this.selectRowProp}
											search={false}
											options={this.options}
											data={this.state.salarySlipList &&
												this.state.salarySlipList ? this.state.salarySlipList : []}
											version="4"
											hover

											keyField="id"
											remote

											className="employee-table"
											trClassName="cursor-pointer"

											ref={(node) => this.table = node}
										>
											<TableHeaderColumn
												className="table-header-bg"
												dataField="salaryDate"
												width="15%"
												dataFormat={this.renderSalaryDate}
											>
												{strings.SalaryDate}
											</TableHeaderColumn>
											<TableHeaderColumn
												width="15%"
												className="table-header-bg"
												dataField="monthYear"
											>
												{strings.MonthYear}
											</TableHeaderColumn>
											<TableHeaderColumn
												width="15%"
												className="table-header-bg"
												dataFormat={this.renderActions}
											>
												{strings.Payslips}
											</TableHeaderColumn>

										</BootstrapTable>




									</div>
								</TabPane>

							</TabContent>
							<Row>
								<Col>
									<p><b>Note:</b> Employees cannot be deleted once a transaction has been created for them</p>
								</Col>
							</Row>
							<Row>
								<Col>
									{isEmployeeDeletable && <FormGroup>
										<Button
											type="button"
											name="button"
											color="danger"
											className="btn-square"
											disabled1={this.state.disabled1}
											onClick={this.deleteEmployee}
										>
											<i className="fa fa-trash"></i> {this.state.disabled1
												? 'Deleting...'
												: strings.Delete}
										</Button>
									</FormGroup>}
								</Col>
							</Row>
						</CardBody>
					</Card>
				</div>
				<ViewPaySlip
					openModal={this.state.openModal}
					closeModal={(e) => {
						this.closeModal(e);
					}}
					bankDetails={this.state.EmployeeDetails}
					employeename={this.state.employeename}
					// id={this.state.rowId}
					Fixed={this.state.Fixed}
					FixedAllowance={this.state.FixedAllowance}
					selectedData={this.state.selectedData}
					Deduction={this.state.Deduction}
					Variable={this.state.Variable}
					companyData={profile}
					salaryDate={this.state.salaryDate}
					empData={this.state.EmployeeDetails}
					transactionList={this.state.transactionList}
				/>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewEmployee);
