import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { ConfirmDeleteModal, LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global';
import * as CreatePayrollActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';
import dayjs from '@/utils/date';
import download from 'downloadjs';
import { toast } from 'react-toastify';
import Currency from 'components/currency';

const mapStateToProps = (state) => {
	return {
		company_details: state.common.company_details,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		createPayrollActions: bindActionCreators(CreatePayrollActions, dispatch),
	};
};

const strings = new LocalizedStrings(data);

// Zod validation schema
const approverSchema = z.object({
	comment: z.string().min(1, 'Reason is required'),
});

const PayrollApproverScreen = ({
	commonActions,
	createPayrollActions,
	company_details,
	location,
	history,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [loading, setLoading] = useState(false);
	const [loadingMsg, setLoadingMsg] = useState('Loading...');
	const [dialog, setDialog] = useState(null);
	const [payrollId] = useState(location.state.id);
	const [selectedEmployeesIdsList, setSelectedEmployeesIdsList] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [currencyIsoCode, setCurrencyIsoCode] = useState('AED');
	const [disableLeavePage, setDisableLeavePage] = useState(false);
	const [allPayrollEmployee, setAllPayrollEmployee] = useState([]);
	const [payrollData, setPayrollData] = useState({});
	const [existEmpList, setExistEmpList] = useState([]);

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm({
		resolver: zodResolver(approverSchema),
		defaultValues: {
			comment: '',
		},
	});

	const commentValue = watch('comment');

	const options = {
		paginationPosition: 'bottom',
		page: 1,
		sizePerPage: 10,
	};

	useEffect(() => {
		initializeData();
	}, []);

	const initializeData = () => {
		setLoading(true);
		createPayrollActions
			.getPayrollById(payrollId)
			.then((res) => {
				if (res.status === 200) {
					let dateArr = res.data.payPeriod.split('-');
					let payPeriodString =
						dateArr[0].replaceAll('/', '-') + ' - ' + dateArr[1].replaceAll('/', '-');

					setPayrollData({
						id: res.data.id || '',
						approvedBy: res.data.approvedBy || '',
						comment: res.data.comment || '',
						deleteFlag: res.data.deleteFlag || '',
						employeeCount: res.data.employeeCount || '',
						generatedBy: res.data.generatedBy || '',
						isActive: res.data.isActive || '',
						payPeriod: payPeriodString,
						payrollApprover: res.data.payrollApprover || '',
						payrollDate: res.data.payrollDate
							? dayjs(res.data.payrollDate).format('DD-MM-YYYY')
							: '',
						payrollSubject: res.data.payrollSubject || '',
						runDate: res.data.runDate || '',
						status: res.data.status || '',
					});

					setCurrencyIsoCode(res.data.currencyIsoCode || 'AED');
					setExistEmpList(res.data.existEmpList || []);
					setValue('comment', res.data.comment || '');
					getAllPayrollEmployee(payrollId);
				}
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
			});
	};

	const approveAndRunPayroll = () => {
		setDisableLeavePage(true);
		let payPeriod = payrollData.payPeriod;
		const [startDateString, endDateString] = payPeriod.split(' - ');
		const startDate = startDateString.trim();
		const endDate = endDateString.trim();
		const postData = {
			payrollId: payrollId,
			startDate: startDate,
			endDate: endDate,
			payrollEmployeesIdsListToSendMail: selectedEmployeesIdsList,
		};
		createPayrollActions
			.approveAndRunPayroll(postData)
			.then((res) => {
				if (res.status === 200) {
					commonActions.tostifyAlert(
						'success',
						'Payroll Approved Successfully. Payslip sent to employees Successfully'
					);
					history.push('/admin/payroll/payrollrun');
				}
			})
			.catch((err) => {
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong'
				);
			});
	};

	const renderStatus = (status) => {
		let classname = '';

		if (status === 'Approved') {
			classname = 'label-success';
		}
		if (status === 'Paid') {
			classname = 'label-sent';
		} else if (status === 'UnPaid') {
			classname = 'label-closed';
		} else if (status === 'Draft') {
			classname = 'label-currency';
		} else if (status === 'Rejected') {
			classname = 'label-due';
		}
		if (status === 'Submitted') {
			classname = 'label-sent';
		} else if (status === 'Partially Paid') {
			classname = 'label-PartiallyPaid';
		} else if (status === 'Voided') {
			classname = 'label-closed';
		}

		return (
			<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
				{status}
			</span>
		);
	};

	const generateSifFile = () => {
		const now = new Date();
		const hours = now.getHours();
		const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		const seconds = now.getSeconds().toString().padStart(2, '0');
		const currentTimeNow = `${formattedHours}:${minutes}:${seconds}`;
		createPayrollActions
			.generateSifFile(payrollId, existEmpList, currentTimeNow)
			.then((res) => {
				if (res.status === 200) {
					const blob = new Blob([res.data[1]], { type: 'application/sif' });
					download(blob, res.data[0] ? res.data[0] + '.SIF' : 'payroll.SIF');
					commonActions.tostifyAlert('success', 'SIF File Downloaded Successfully');
				}
			})
			.catch((err) => {
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'File Already Opened please close file'
				);
			});
	};

	const voidPayrollApi = () => {
		setDisableLeavePage(true);
		setLoading(true);
		setLoadingMsg('Voiding...');
		let formData = {
			postingRefId: payrollId,
			postingRefType: 'PAYROLL',
			comment: commentValue,
		};
		createPayrollActions
			.voidPayroll(formData)
			.then((res) => {
				if (res.status === 200) {
					toast.success('Payroll Voided Successfully');
					history.push('/admin/payroll/payrollrun');
					setLoading(false);
				}
			})
			.catch((err) => {
				toast.error('Payroll Voided UnSuccessfully');
				setLoading(false);
			});
	};

	const onFormSubmit = (data) => {
		setDisableLeavePage(true);
		const { status } = payrollData;
		const user = location?.state?.user;
		if (status === 'Approved' && user !== 'Generator') {
			voidPayroll();
		} else if (status === 'Submitted' && user !== 'Generator') {
			rejectPayrollConfirmation();
		}
	};

	const getAllPayrollEmployee = (payrollId) => {
		createPayrollActions.getAllPayrollEmployee(payrollId).then((res) => {
			if (res.status === 200) {
				const payrollEmployee = res.data;
				const allIds = payrollEmployee.map((row) => row.id);
				const allEmployeeIds = payrollEmployee.map((row) => row.empId);
				setAllPayrollEmployee(payrollEmployee);
				setSelectedRows(allIds);
				setSelectedEmployeesIdsList(allEmployeeIds);
			}
		});
	};

	const renderGrossPay = (cell) => {
		return <Currency value={cell} currencySymbol={currencyIsoCode} />;
	};

	const renderDeductions = (cell) => {
		return <Currency value={cell} currencySymbol={currencyIsoCode} />;
	};

	const renderNetPay = (cell) => {
		return <Currency value={cell} currencySymbol={currencyIsoCode} />;
	};

	const renderPayrollEmployeeList = () => {
		const { generateSif } = company_details;
		const { status } = payrollData;
		const selectRowProp = {
			mode: 'checkbox',
			clickToSelect: false,
			onSelect: onRowSelect,
			onSelectAll: onSelectAll,
			selected: selectedRows,
			hideSelectColumn: status === 'Submitted' ? false : true,
		};

		return (
			<>
				<Row>
					<Col lg={6}>
						<Label>
							{' '}
							Status : <span style={{ fontSize: 'larger' }}> {renderStatus(status)}</span>
						</Label>
					</Col>
					<Col lg={6}>
						{generateSif &&
							status &&
							(status === 'Approved' || status === 'Paid' || status === 'Partially Paid') && (
								<Button
									type="button"
									color="primary"
									className="btn-square mb-3 pull-right "
									onClick={() => {
										generateSifFile();
									}}
								>
									<i className="fas fa-file-invoice-dollar"></i>
									{'  '}Download SIF file
								</Button>
							)}
					</Col>
					{status === 'Submitted' && (
						<Col lg={12}>
							<hr />
							<div className="mb-2" style={{ marginLeft: '2.2rem' }}>
								{strings.SendPayslip}
								<i id="sendMAilTip" className="fa fa-question-circle ml-1"></i>
								<UncontrolledTooltip placement="right" target="sendMAilTip">
									{strings.APaySlipWillBeMailedToTheSelectedEmployees}
								</UncontrolledTooltip>
							</div>
						</Col>
					)}
					<Col lg={12} className="payroll-List">
						<BootstrapTable
							selectRow={selectRowProp}
							search={false}
							options={options}
							data={allPayrollEmployee || []}
							version="4"
							hover
							keyField="id"
							remote
							trClassName="cursor-pointer"
							csvFileName="payroll_employee_list.csv"
						>
							<TableHeaderColumn
								dataField="empCode"
								dataSort
								className="table-header-bg"
							>
								Employee No
							</TableHeaderColumn>
							<TableHeaderColumn dataField="empName" dataSort className="table-header-bg">
								Employee Name
							</TableHeaderColumn>
							<TableHeaderColumn
								width="8%"
								dataField="lopDay"
								dataSort
								className="table-header-bg"
							>
								LOP
							</TableHeaderColumn>
							<TableHeaderColumn
								width="12%"
								dataField="noOfDays"
								dataSort
								className="table-header-bg"
							>
								Paid Days
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField="grossPay"
								dataSort
								dataFormat={renderGrossPay}
								className="table-header-bg"
							>
								Gross Pay
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField="deduction"
								dataSort
								dataFormat={renderDeductions}
								className="table-header-bg"
							>
								Deductions
							</TableHeaderColumn>
							<TableHeaderColumn
								width="12%"
								dataField="netPay"
								dataFormat={renderNetPay}
								dataSort
								className="table-header-bg"
							>
								Net Pay
							</TableHeaderColumn>
						</BootstrapTable>
					</Col>
				</Row>
			</>
		);
	};

	const onRowSelect = (row, isSelected, e) => {
		let selectedEmpIdsList = Object.assign([], selectedEmployeesIdsList);
		let selectedRowsList = Object.assign([], selectedRows);
		if (isSelected) {
			selectedEmpIdsList.push(row.empId);
			selectedRowsList.push(row.id);
		} else {
			selectedEmpIdsList = selectedEmpIdsList.filter(
				(obj) => parseInt(obj) !== parseInt(row.empId)
			);
			selectedRowsList = selectedRowsList.filter((obj) => parseInt(obj) !== parseInt(row.id));
		}
		setSelectedEmployeesIdsList(selectedEmpIdsList);
		setSelectedRows(selectedRowsList);
	};

	const onSelectAll = (isSelected, rows) => {
		let selectedEmpIdsList = [];
		let selectedRowsList = [];
		if (isSelected) {
			rows.map((item) => {
				selectedEmpIdsList.push(item.empId);
				selectedRowsList.push(item.id);
				return item;
			});
		}
		setSelectedEmployeesIdsList(selectedEmpIdsList);
		setSelectedRows(selectedRowsList);
	};

	const rejectPayroll = () => {
		setDisableLeavePage(true);
		createPayrollActions
			.rejectPayroll(payrollId, commentValue)
			.then((res) => {
				if (res.status === 200) {
					commonActions.tostifyAlert('success', 'Payroll Rejected Successfully');
					history.push('/admin/payroll/payrollrun');
				}
			})
			.catch((err) => {
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong'
				);
			});
	};

	const rejectPayrollConfirmation = () => {
		setDisableLeavePage(true);
		const message1 = (
			<text>
				<b>Would you like to reject this payroll ?</b>
			</text>
		);
		const message = 'This Payroll will be Rejected. ';
		setDialog(
			<ConfirmDeleteModal
				isOpen={true}
				okHandler={rejectPayroll}
				cancelHandler={removeDialog}
				message={message}
				message1={message1}
			/>
		);
	};

	const voidPayroll = () => {
		const message1 = (
			<text>
				<b>Would you like to void this payroll ?</b>
			</text>
		);
		const message = 'This Payroll will be Voided. ';
		setDialog(
			<ConfirmDeleteModal
				isOpen={true}
				okHandler={voidPayrollApi}
				cancelHandler={removeDialog}
				message={message}
				message1={message1}
			/>
		);
	};

	const removeDialog = () => {
		setDialog(null);
	};

	strings.setLanguage(language);

	return loading ? (
		<Loader loadingMsg={loadingMsg} />
	) : (
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
													<ButtonGroup size="sm"></ButtonGroup>
												</div>

												<div>
													<Form onSubmit={handleSubmit(onFormSubmit)}>
														<Row>
															<Col>
																<FormGroup className="mb-3">
																	<Label htmlFor="date">Payroll Date</Label>
																	<Input
																		type="text"
																		id="payrollDate"
																		name="payrollDate"
																		disabled={true}
																		value={payrollData.payrollDate}
																		className="form-control"
																	/>
																</FormGroup>
															</Col>
															<Col>
																<FormGroup>
																	<Label htmlFor="payrollSubject">
																		{' '}
																		Payroll Subject
																	</Label>
																	<Input
																		type="text"
																		id="payrollSubject"
																		name="payrollSubject"
																		disabled={true}
																		maxLength="100"
																		value={payrollData.payrollSubject}
																		placeholder={strings.Enter + ' Payroll Subject'}
																	/>
																</FormGroup>
															</Col>
															<Col>
																<FormGroup>
																	<Label htmlFor="payPeriod">
																		{strings.pay_period}
																	</Label>
																	<Input
																		type="text"
																		id="payPeriod"
																		name="payPeriod"
																		value={payrollData.payPeriod}
																		placeholder={strings.Enter + ' Pay period'}
																		disabled={true}
																	/>
																</FormGroup>
															</Col>
														</Row>
														{renderPayrollEmployeeList()}
														<Row className="mb-4 ">
															<Col>
																<FormGroup>
																	{payrollData.status &&
																	(payrollData.status === 'Partially Paid' ||
																		payrollData.status === 'Paid' ||
																		payrollData.status === 'Draft') ? (
																		''
																	) : payrollData.status &&
																	  (payrollData.status === 'Voided' ||
																			payrollData.status === 'Submitted' ||
																			payrollData.status === 'Rejected' ||
																			payrollData.status === 'Approved') &&
																	  ((payrollData.status === 'Submitted' ||
																			payrollData.status === 'Rejected' ||
																			payrollData.status === 'Approved') &&
																	  location?.state?.user === 'Generator') ? (
																		''
																	) : (
																		<div>
																			<Label htmlFor="payrollSubject">
																				{payrollData.status == 'Approved' ||
																				payrollData.status == 'Voided'
																					? 'Reason for voiding the payroll'
																					: 'Reason for rejecting the payroll'}
																			</Label>
																			<Controller
																				name="comment"
																				control={control}
																				render={({ field }) => (
																					<Input
																						{...field}
																						type="text"
																						maxLength="250"
																						id="comment"
																						disabled={
																							payrollData.status == 'Voided' ||
																							payrollData.status === 'Rejected'
																								? true
																								: false
																						}
																						placeholder={strings.Enter + 'reason'}
																						className={
																							errors.comment ? 'is-invalid' : ''
																						}
																					/>
																				)}
																			/>
																			{errors.comment && (
																				<div className="invalid-feedback">
																					{errors.comment.message}
																				</div>
																			)}
																		</div>
																	)}

																	{payrollData.status &&
																		payrollData.status === 'Submitted' &&
																		location?.state?.user !== 'Generator' && (
																			<Button
																				color="primary"
																				type="submit"
																				className="btn-square mt-4 "
																				onClick={() => {
																					if (!commentValue) {
																						commonActions.fillManDatoryDetails();
																					}
																				}}
																			>
																				<i className="fas fa-user-times mr-1"></i>
																				Reject Payroll
																			</Button>
																		)}

																	{payrollData.status === 'Approved' &&
																		location?.state?.user !== 'Generator' && (
																			<Button
																				color="primary"
																				className="btn-square mt-4 "
																				type="submit"
																				onClick={() => {
																					if (!commentValue) {
																						commonActions.fillManDatoryDetails();
																					}
																				}}
																			>
																				<i className="fas fa-user-times mr-1"></i>
																				Void This Payroll
																			</Button>
																		)}
																</FormGroup>
															</Col>

															<Col>
																<ButtonGroup className="mt-5 pull-right ">
																	{payrollData.status &&
																		payrollData.status === 'Submitted' &&
																		location?.state?.user !== 'Generator' && (
																			<Button
																				type="button"
																				color="primary"
																				className="btn-square mt-5 pull-right "
																				onClick={() => approveAndRunPayroll()}
																			>
																				<i className="fas fa-bullseye mr-1"></i>
																				Approve & Run Payroll
																			</Button>
																		)}
																	<Button
																		color="secondary"
																		className="btn-square  pull-right   mt-5"
																		onClick={() => {
																			if (
																				location &&
																				location.state &&
																				location.state.gotoReports
																			) {
																				history.push(location.state.gotoReports);
																			} else {
																				history.push('/admin/payroll/payrollrun');
																			}
																		}}
																	>
																		<i className="fa fa-ban"></i> {strings.Cancel}
																	</Button>
																</ButtonGroup>
															</Col>
														</Row>
													</Form>
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
			{disableLeavePage ? '' : <LeavePage />}
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(PayrollApproverScreen);
