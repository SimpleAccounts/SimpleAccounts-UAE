import React, { useState, useEffect, useCallback } from 'react';
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
import './style.scss';
import { bindActionCreators } from 'redux';
import { upperFirst } from 'lodash-es';
import dayjs from '@/utils/date';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { ViewPaySlip } from './sections';
import {
	CommonActions
} from 'services/global'
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { toast } from 'react-toastify';
import { amountFormat } from 'screens/bank_account/screens/transactions/screens/create/helpers/amountformater';
import avatar from 'assets/images/avatars/default-avatar.jpg';

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

let strings = new LocalizedStrings(data);

const ViewEmployee = ({
	employeeViewActions,
	commonActions,
	profile,
	company_details,
	location,
	history
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [openModal, setOpenModal] = useState(false);
	const [selectedData, setSelectedData] = useState({});
	const [activeTab, setActiveTab] = useState(new Array(4).fill('1'));
	const [employeeDetails, setEmployeeDetails] = useState('');
	const [userPhoto, setUserPhoto] = useState([]);
	const [salarySlipList, setSalarySlipList] = useState([]);
	const [fixed, setFixed] = useState([]);
	const [deduction, setDeduction] = useState([]);
	const [variable, setVariable] = useState([]);
	const [fixedAllowance, setFixedAllowance] = useState([]);
	const [ctc, setCtc] = useState('');
	const [currentEmployeeId, setCurrentEmployeeId] = useState('');
	const [transactionList, setTransactionList] = useState([]);
	const [dialog, setDialog] = useState(null);
	const [isEmployeeDeletable, setIsEmployeeDeletable] = useState(true);
	const [salaryDate, setSalaryDate] = useState('');
	const [employeename, setEmployeename] = useState('');
	const [totalMonthlyEarnings, setTotalMonthlyEarnings] = useState(0);
	const [totalYearlyEarnings, setTotalYearlyEarnings] = useState(0);
	const [totalMonthlyDeductions, setTotalMonthlyDeductions] = useState(0);
	const [totalYearlyDeductions, setTotalYearlyDeductions] = useState(0);
	const [totalNetPayMontly, setTotalNetPayMontly] = useState(0);
	const [totalNetPayYearly, setTotalNetPayYearly] = useState(0);
	const [disabled1, setDisabled1] = useState(false);

	const columnHeader1 = [
		{ label: 'Component Name', value: 'Component Name', sort: false },
		{ label: 'Monthly', value: 'Monthly', sort: false },
		{ label: 'Annually', value: 'Annually', sort: false },
	];

	const toggle = (tabPane, tab) => {
		const newArray = activeTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		setActiveTab(newArray);
	};

	const totalEarning = (data) => {
		let monthly = 0;
		let yearly = 0;
		if (data && data.length > 0) {
			const filteredData = data.filter(obj => obj.id !== '');
			filteredData.forEach((item) => {
				if (item.monthlyAmount) {
					monthly += parseFloat(item.monthlyAmount);
				}
				if (item.yearlyAmount) {
					yearly += parseFloat(item.yearlyAmount);
				}
			});
		}
		return { yearly, monthly };
	};

	const initializeData = useCallback(() => {
		if (location.state?.tabNo) {
			toggle(0, location.state.tabNo);
		} else {
			toggle(0, activeTab[0]);
		}

		if (location.state?.id) {
			employeeViewActions
				.getEmployeeById(location.state.id)
				.then((res) => {
					if (res.status === 200) {
						setCurrentEmployeeId(location.state.id);
						setEmployeeDetails(res.data);
						setUserPhoto(res.data.profileImageBinary ? [res.data.profileImageBinary] : []);
						setIsEmployeeDeletable(res.data.isEmployeeDeletable);
					}
				});

			employeeViewActions
				.getSalarySlipList(location.state.id)
				.then((res) => {
					if (res.status === 200) {
						setCurrentEmployeeId(location.state.id);
						setSalarySlipList(res.data.resultSalarySlipList);
					}
				});

			employeeViewActions
				.getSalaryComponentByEmployeeId(location.state.id)
				.then((res) => {
					if (res.status === 200) {
						setCurrentEmployeeId(location.state.id);
						setFixed(res.data.salaryComponentResult.Fixed);
						setVariable(res.data.salaryComponentResult.Variable);
						setDeduction(res.data.salaryComponentResult.Deduction);
						setFixedAllowance(res.data.salaryComponentResult.Fixed_Allowance);
						setCtc(res.data.ctc);

						const totalEarnings = totalEarning(res.data.salaryComponentResult.Fixed);
						const totalDeductions = totalEarning(res.data.salaryComponentResult.Deduction);
						const monthlyEarnings = totalEarnings.monthly;
						const yearlyEarnings = totalEarnings.yearly;
						const monthlyDeductions = totalDeductions.monthly;
						const yearlyDeductions = totalDeductions.yearly;
						const netPayMonthly = parseFloat(monthlyEarnings) - parseFloat(monthlyDeductions);
						const netPayYearly = parseFloat(yearlyEarnings) - parseFloat(yearlyDeductions);

						setTotalMonthlyEarnings(monthlyEarnings);
						setTotalYearlyEarnings(yearlyEarnings);
						setTotalMonthlyDeductions(monthlyDeductions);
						setTotalYearlyDeductions(yearlyDeductions);
						setTotalNetPayMontly(netPayMonthly);
						setTotalNetPayYearly(netPayYearly);
					}
				});
		} else {
			history.push('/admin/master/employee');
		}
	}, [location.state, employeeViewActions, history]);

	useEffect(() => {
		initializeData();
	}, [initializeData]);

	const renderActionsForTds = (cell, row) => {
		return (
			<div>
				<Button
					onClick={() =>
						history.push(
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

	const viewPaySlip = () => {
		setOpenModal(true);
	}

	const disable = () => {
		if (employeeDetails.employmentId === null) {
			return true;
		} else {
			return false;
		}
	};

	const renderActions = (cell, row) => {
		return (
			<div>
				<Button
					className="btn-sm"
					style={{ padding: '0px' }}
					color="link"
					onClick={() => {
						const postData = {
							id: location.state.id,
							salaryDate: dayjs(row.salaryDate).format('DD/MM/YYYY'),
							sendMail: false,
							startDate: '',
							endDate: '',
						};
						employeeViewActions
							.getSalarySlip(postData)
							.then((res) => {
								if (res.status === 200) {
									res.data.netPay = res.data.earnings - res.data.deductions;
									setSalaryDate(row.salaryDate);
									setEmployeename(res.data.employeename);
									setSelectedData(res.data);
									setFixed(res.data.salarySlipResult.Fixed);
									setFixedAllowance(res.data.salarySlipResult.Fixed_Allowance || res.data.salarySlipResult["Fixed Allowance"]);
									setVariable(res.data.salarySlipResult.Variable);
									setDeduction(res.data.salarySlipResult.Deduction);
								}

								const payPeriod = res.data.payPeriod;
								const [startDateString, endDateString] = payPeriod.split("-");
								const startDate = startDateString.trim();
								const endDate = endDateString.trim();
								const transactionPostData = {
									employeeId: location.state.id,
									startDate: dayjs(startDate).format('DD/MM/YYYY'),
									endDate: dayjs(endDate).format('DD/MM/YYYY'),
								};
								employeeViewActions
									.getEmployeeTransactions(transactionPostData)
									.then((transRes) => {
										if (transRes.status === 200) {
											setTransactionList(transRes.data);
										}
									})
									.catch((err) => {
										commonActions.tostifyAlert(
											'error',
											err?.data?.message || 'Something Went Wrong',
										);
									});
							})
							.catch((err) => {
								commonActions.tostifyAlert(
									'error',
									err?.data?.message || 'Something Went Wrong',
								);
							});

						viewPaySlip();
					}}
				>
					<i className="fas fa-eye" />  {strings.View}
				</Button>

				<Button
					className="btn-sm ml-3"
					style={{ padding: '0px' }}
					color="link"
					onClick={() => {
						const payPeriod = row.payPeriod;
						const [startDateString, endDateString] = payPeriod.split("-");
						const startDate = startDateString.trim();
						const endDate = endDateString.trim();
						const postData = {
							id: location.state.id,
							salaryDate: dayjs(row.salaryDate).format('DD/MM/YYYY'),
							sendMail: true,
							startDate: dayjs(startDate, "DD/MM/YYYY").format('DD-MM-YYYY'),
							endDate: dayjs(endDate, "DD/MM/YYYY").format('DD-MM-YYYY'),
						};
						employeeViewActions
							.getSalarySlip(postData)
							.then((res) => {
								if (res.status === 200) {
									toast.success("Payslip Sent Successfully");
								}
							});
					}}
				>
					<i className="fas fa-send" /> {strings.Send}
				</Button>
			</div>
		);
	};

	const closeModal = () => {
		setOpenModal(false);
		initializeData();
	};

	const deleteEmployee = () => {
		const message1 = (
			<text>
				<b>Delete Employee?</b>
			</text>
		);
		const message = 'This Employee will be deleted permanently and cannot be recovered. ';
		setDialog(
			<ConfirmDeleteModal
				isOpen={true}
				okHandler={removeEmployee}
				cancelHandler={removeDialog}
				message1={message1}
				message={message}
			/>
		);
	};

	const removeEmployee = () => {
		setDisabled1(true);
		employeeViewActions
			.deleteEmployee(currentEmployeeId)
			.then((res) => {
				if (res.status === 200) {
					commonActions.tostifyAlert(
						'success',
						res.data?.message || 'Employee Deleted Successfully!',
					);
					history.push('/admin/master/employee');
				}
			})
			.catch((err) => {
				commonActions.tostifyAlert(
					'error',
					err.data?.message || 'Employee Deleted Unsuccessfully',
				);
				setDisabled1(false);
			});
	};

	const removeDialog = () => {
		setDialog(null);
	};

	const getPhoto = () => {
		const image = userPhoto.length !== 0
			? "data:image/png;base64, " + userPhoto[0]
			: avatar;
		return image;
	}

	const renderSalaryDate = (cell, row) => {
		const salaryDateString = dayjs(row.salaryDate).format('DD-MM-YYYY');
		return salaryDateString;
	}

	const getEmployeeInviteEmail = () => {
		employeeViewActions
			.getEmployeeInviteEmail(location.state.id)
			.then((res) => {
				if (res.status === 200) {
					toast.success("Mail Sent Successfully");
				}
			});
	}

	strings.setLanguage(language);
	const { generateSif } = company_details;

	return (
		<div className="financial-report-screen">
			<div className="animated fadeIn">
				{dialog}
				<Card>
					<CardBody>
						<Row>
							<Col>
								<div className="h6 mb-4 d-flex align-items-center">
									<h3>{upperFirst(employeeDetails.fullName)}</h3>
								</div>
							</Col>
							<Col>
								<div className='pull-right'>
									<Button
										type="submit"
										color="primary"
										className="btn-square mr-3"
										onClick={() => { getEmployeeInviteEmail() }}
									><i className="fas fa-envelope"></i>{' '}
										Resend Invite
									</Button>
									<Button
										onClick={() => { history.push('/admin/master/employee') }}
									> X </Button>
								</div>
							</Col>
						</Row>
						<Nav tabs pills>
							<NavItem>
								<NavLink
									active={activeTab[0] === '1'}
									onClick={() => {
										toggle(0, '1');
									}}
								>
									{strings.OverView}
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									active={activeTab[0] === '2'}
									onClick={() => {
										toggle(0, '2');
									}}
								>
									{strings.SalaryDetails}
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									active={activeTab[0] === '3'}
									onClick={() => {
										toggle(0, '3');
									}}
								>
									{strings.Payslips}
								</NavLink>
							</NavItem>
						</Nav>
						<TabContent activeTab={activeTab[0]}>
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
																	history.push(`/admin/master/employee/updateEmployeeEmployment`,
																		{ id: currentEmployeeId })
																}
															>
																<i className="far fa-edit"></i>
															</Button>
														</Col>
													</Row>}

													<div className='text-center'>
														<img
															src={getPhoto()}
															className="img-avatar mr-2"
															style={{ width: '200px', height: '200px' }}
															alt=""
														/>
													</div>
													<div className='text-center mt-4' >
														<h3>{upperFirst(employeeDetails.fullName)} {' '}
															({employeeDetails.employeeCode ? employeeDetails.employeeCode : '-'}{ })</h3>

														<h4>
															{upperFirst(employeeDetails.employeeDsignationName)}
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
																</UncontrolledTooltip>&nbsp;{employeeDetails.email ? employeeDetails.email : '-'}</span></div>
															<div className='mt-2 mb-2' ><span id="Gender"><i className="far fa-user"></i>
																<UncontrolledTooltip
																	placement="left"
																	target="Gender"
																>
																	Gender
																</UncontrolledTooltip>&nbsp;{employeeDetails.gender ? employeeDetails.gender : '-'}</span></div>
															<div className='mt-2 mb-2'  ><span id="dojTooltip"><i className="far fa-calendar-minus"></i>
																<UncontrolledTooltip
																	placement="left"
																	target="dojTooltip"
																>
																	Date of Joining
																</UncontrolledTooltip>  &nbsp;{employeeDetails.dateOfJoining ? employeeDetails.dateOfJoining : '-'}</span></div>
															{generateSif &&
																<div className='mt-2 mb-2' >
																	<UncontrolledTooltip
																		placement="left"
																		target="department"
																	>
																		Department
																	</UncontrolledTooltip>
																	<span id="department"> <i className="fas fa-network-wired"></i> &nbsp;{employeeDetails.department ? employeeDetails.department : '-'}</span>
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
																			history.push(`/admin/master/employee/updateEmployeePersonal`,
																				{ id: currentEmployeeId })
																		}
																	>
																		<i className="far fa-edit"></i>
																	</Button>
																</Col>
															</Row>
															<Row> <Col className='mt-2 mb-2'>{strings.MiddleName} </Col>
																<Col className='mt-2 mb-2'>: &nbsp;{employeeDetails.middleName && employeeDetails.lastName ?
																	employeeDetails.middleName + " " + employeeDetails.lastName : ('-')}</Col></Row>

															<Row> <Col className='mt-2 mb-2'>{strings.DateOfBirth} </Col><Col className='mt-2 mb-2'>: &nbsp;{employeeDetails.dob ? dayjs(employeeDetails.dob).format('DD-MM-YYYY') : ('-')}</Col></Row>

															<Row> <Col className='mt-2 mb-2'>{strings.MobileNumber} </Col><Col className='mt-2 mb-2'>: &nbsp;{employeeDetails.mobileNumber ? employeeDetails.mobileNumber : ('-')}</Col></Row>

															<Row> <Col className='mt-2 mb-2'>{strings.Address} </Col><Col className='mt-2 mb-2'>: &nbsp;{(employeeDetails.presentAddress ? employeeDetails.presentAddress : "") + (employeeDetails.city ? employeeDetails.city + ' , ' : '') +
																(employeeDetails.stateName ? employeeDetails.stateName + ' , ' : '') + (employeeDetails.countryName ? employeeDetails.countryName : '') + (employeeDetails.pincode ? employeeDetails.pincode + ' , ' : '')}</Col></Row>

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
																			history.push(`/admin/master/employee/updateEmployeeBank`,
																				{ id: currentEmployeeId })
																		}
																	>
																		<i className="far fa-edit"></i>
																	</Button>
																</Col>
															</Row>
															<Row> <Col className='mt-2 mb-2'>{strings.BankHolderName} </Col><Col className='mt-2 mb-2'>: &nbsp;{employeeDetails.accountHolderName ?
																employeeDetails.accountHolderName : ('-')}</Col></Row>

															<Row> <Col className='mt-2 mb-2'>{strings.AccountNumber} </Col><Col className='mt-2 mb-2'>: &nbsp;{employeeDetails.accountNumber ? employeeDetails.accountNumber : ('-')}</Col></Row>

															<Row> <Col className='mt-2 mb-2'>{strings.BankName}</Col><Col className='mt-2 mb-2'>: &nbsp;{employeeDetails.bankName ? employeeDetails.bankName : ('-')}</Col></Row>

															<Row> <Col className='mt-2 mb-2'>{strings.Branch}</Col><Col className='mt-2 mb-2'>: &nbsp;{employeeDetails.branch ? employeeDetails.branch : ('-')}</Col></Row>

															<Row> <Col className='mt-2 mb-2'>{strings.IBAN} </Col><Col className='mt-2 mb-2'>: &nbsp;{employeeDetails.iban ? employeeDetails.iban : ('-')}</Col></Row>

														</div>
													</CardBody>
												</div>
											</Card>}
										</div>
									</CardGroup>
								</div>
							</TabPane>

							<TabPane tabId="2">
								<div className="table-wrapper">
									<Row>
										<Col>
											<div className='m-4'>
												<Row style={{ width: '63%' }}>
													<Col><h5> {strings.AnnualCTC} </h5>
														<div><h3>  {ctc ?
															employeeDetails.ctcType === "ANNUALLY" ?
																amountFormat(ctc, 'AED')
																:
																amountFormat(parseFloat(ctc) * 12, 'AED')
															: amountFormat(0.00, 'AED')}</h3></div></Col>
													<Col><h5> {strings.MonthlyIncome} </h5>
														<div> <h3>{ctc ?
															employeeDetails.ctcType === "ANNUALLY" ?
																amountFormat(ctc / 12, 'AED')
																:
																amountFormat(ctc, 'AED')
															: amountFormat(0.00, 'AED')}</h3></div></Col>
													<Col>
														<Button
															className={`btn-square pull-right mb-2 mr-3 ${disable() ? `disabled-cursor` : ``
																} `}
															disabled={disable() ? true : false}
															color="primary"
															style={{ marginBottom: '10px' }}
															onClick={() => history.push(`/admin/master/employee/updateSalaryComponent`,
																{
																	id: currentEmployeeId, ctcTypeOption: employeeDetails.ctcType != null ?
																		(employeeDetails.ctcType === "ANNUALLY" ?
																			{ label: employeeDetails.ctcType, value: 1 }
																			: { label: employeeDetails.ctcType, value: 2 })
																		: { label: "ANNUALLY", value: 1 }
																})}
															title={
																disable()
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
																	{columnHeader1.map((column, index) => {
																		return (
																			<th key={index}>
																				{column.label}
																			</th>
																		);
																	})}
																</tr>
															</thead>
															<tbody>
																{fixed ? (
																	Object.values(fixed).map((item, idx) => (
																		<tr key={`fixed-${idx}`} className="p-1">
																			<td className="text-left" style={{ border: "3px solid #dfe9f7" }} >{item.description}<div className=''>
																			</div></td>
																			<td className="text-right" style={{ border: "3px solid #dfe9f7" }} > {item.monthlyAmount ? amountFormat(item.monthlyAmount, 'AED') : '0.00'}</td>
																			<td className="text-right" style={{ border: "3px solid #dfe9f7" }} > {item.yearlyAmount ? amountFormat(item.yearlyAmount, 'AED') : '0.00'}</td>
																		</tr>
																	))) : (<tr></tr>)}

																{variable ? (
																	Object.values(variable).map((item, idx) => (
																		<tr key={`variable-${idx}`}>
																			<td className="text-left" style={{ border: "3px solid #dfe9f7" }} >{item.description}</td>
																			<td className="text-right" style={{ border: "3px solid #dfe9f7" }} >{item.monthlyAmount ? amountFormat(item.monthlyAmount, 'AED') : ''}</td>
																			<td className="text-right" style={{ border: "3px solid #dfe9f7" }} >{item.yearlyAmount ? amountFormat(item.yearlyAmount, 'AED') : ''}</td>
																		</tr>
																	))) : (<tr></tr>)}

																{deduction ? (
																	Object.values(deduction).map((item, idx) => (
																		<tr key={`deduction-${idx}`}>
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
										search={false}
										data={salarySlipList || []}
										version="4"
										hover
										keyField="id"
										remote
										className="employee-table"
										trClassName="cursor-pointer"
									>
										<TableHeaderColumn
											className="table-header-bg"
											dataField="salaryDate"
											width="15%"
											dataFormat={renderSalaryDate}
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
											dataFormat={renderActions}
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
										disabled={disabled1}
										onClick={deleteEmployee}
									>
										<i className="fa fa-trash"></i> {disabled1
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
				openModal={openModal}
				closeModal={closeModal}
				bankDetails={employeeDetails}
				employeename={employeename}
				Fixed={fixed}
				FixedAllowance={fixedAllowance}
				selectedData={selectedData}
				Deduction={deduction}
				Variable={variable}
				companyData={profile}
				salaryDate={salaryDate}
				empData={employeeDetails}
				transactionList={transactionList}
			/>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewEmployee);
