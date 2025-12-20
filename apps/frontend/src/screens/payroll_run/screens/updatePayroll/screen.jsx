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
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { ConfirmDeleteModal, LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import * as EmployeeActions from '../../actions';
import * as CreatePayrollActions from './actions';
import * as CreatePayrollEmployeeActions from '../../../payrollemp/screens/create/actions';
import * as PayrollEmployeeActions from '../../../payrollemp/actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import dayjs from '@/utils/date';
import { DateRangePicker } from 'react-dates';
import { toast } from 'react-toastify';

const mapStateToProps = (state) => {
	return {
		employees_for_dropdown: state.payrollRun.employees_for_dropdown,
		approver_dropdown_list: state.payrollRun.approver_dropdown_list,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		employeeActions: bindActionCreators(EmployeeActions, dispatch),
		createPayrollActions: bindActionCreators(CreatePayrollActions, dispatch),
		createPayrollEmployeeActions: bindActionCreators(
			CreatePayrollEmployeeActions,
			dispatch
		),
		payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
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

const strings = new LocalizedStrings(data);

// Zod validation schema
const updatePayrollSchema = z.object({
	payrollSubject: z.string().optional(),
	payrollDate: z.date({ required_error: 'Payroll date is required' }),
	payrollApprover: z
		.object({
			value: z.number(),
			label: z.string(),
		})
		.nullable()
		.optional(),
	startDate: z.any().optional(),
	endDate: z.any().optional(),
});

const UpdatePayroll = ({
	commonActions,
	employeeActions,
	createPayrollActions,
	createPayrollEmployeeActions,
	payrollEmployeeActions,
	approver_dropdown_list,
	employee_list,
	location,
	history,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [loading, setLoading] = useState(false);
	const [loadingMsg, setLoadingMsg] = useState('Loading...');
	const [selectedRows, setSelectedRows] = useState([]);
	const [selectedRows1, setSelectedRows1] = useState([]);
	const [allPayrollEmployee, setAllPayrollEmployee] = useState([]);
	const [apiSelector, setApiSelector] = useState('');
	const [submitButton, setSubmitButton] = useState(true);
	const [paidDays, setPaidDays] = useState(30);
	const [focusedInput, setFocusedInput] = useState(null);
	const [currencyIsoCode, setCurrencyIsoCode] = useState('AED');
	const [disableLeavePage, setDisableLeavePage] = useState(false);
	const [isPayrollSubjectNameExist, setIsPayrollSubjectNameExist] = useState(false);
	const [payrollApproverRequired, setPayrollApproverRequired] = useState(false);
	const [subjectRequired, setSubjectRequired] = useState(false);
	const [dialog, setDialog] = useState(null);
	const [count, setCount] = useState(0);
	const [checkForLopSetting, setCheckForLopSetting] = useState(false);
	const [payrollId, setPayrollId] = useState(null);
	const [status, setStatus] = useState('');
	const [selected, setSelected] = useState([]);
	const [userId, setUserId] = useState('');
	const [payrollApproverValue, setPayrollApproverValue] = useState('');
	const [comment, setComment] = useState('');

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		trigger,
		setError,
		clearErrors,
	} = useForm({
		resolver: zodResolver(updatePayrollSchema),
		defaultValues: {
			payrollSubject: '',
			payrollDate: new Date(),
			payrollApprover: null,
			startDate: '',
			endDate: '',
		},
	});

	const startDate = watch('startDate');
	const endDate = watch('endDate');
	const payrollSubject = watch('payrollSubject');
	const payrollApprover = watch('payrollApprover');

	const options = {
		paginationPosition: 'bottom',
		page: 1,
		sizePerPage: 10,
	};

	useEffect(() => {
		createPayrollActions.getApproversForDropdown();
		let payroll_id =
			location.state === undefined ? '' : location.state.id;
		if (payroll_id) {
			setPayrollId(payroll_id);
			proceed(payroll_id);
		}
	}, []);

	useEffect(() => {
		if (isPayrollSubjectNameExist) {
			setError('payrollSubject', {
				type: 'manual',
				message: 'Payroll Subject Already Exists',
			});
		} else {
			clearErrors('payrollSubject');
		}
	}, [isPayrollSubjectNameExist]);

	useEffect(() => {
		if (payrollApproverRequired && !payrollApproverValue) {
			setError('payrollApprover', {
				type: 'manual',
				message: 'Payroll Approver is required',
			});
		} else {
			clearErrors('payrollApprover');
		}
	}, [payrollApproverRequired, payrollApproverValue]);

	useEffect(() => {
		if (subjectRequired && !payrollSubject) {
			setError('payrollSubject', {
				type: 'manual',
				message: 'Payroll subject is required',
			});
		}
	}, [subjectRequired, payrollSubject]);

	useEffect(() => {
		if (!startDate && !endDate) {
			setError('startDate', {
				type: 'manual',
				message: 'Start and end date is required',
			});
		} else if (!startDate) {
			setError('startDate', {
				type: 'manual',
				message: 'Start date is required',
			});
		} else if (!endDate) {
			setError('startDate', {
				type: 'manual',
				message: 'End date is required',
			});
		} else {
			clearErrors('startDate');
		}
	}, [startDate, endDate]);

	const proceed = (payroll_id) => {
		createPayrollActions.getPayrollById(payroll_id).then((res) => {
			if (res.status === 200) {
				let payPeriodString = res.data.payPeriod;
				let dateArray = payPeriodString.split('-');

				setValue('payrollSubject', res.data.payrollSubject || '');
				setValue('payrollDate', res.data.payrollDate ? new Date(res.data.payrollDate) : '');
				setValue('startDate', dayjs(dateArray[0], 'DD/MM/YYYY'));
				setValue('endDate', dayjs(dateArray[1], 'DD/MM/YYYY'));

				setStatus(res.data.status || '');
				setComment(res.data.comment || '');
				setPayrollApproverValue(res.data.payrollApprover || '');
				setSubmitButton(res.data.payrollApprover === null ? true : false);
				setCurrencyIsoCode(res.data.currencyIsoCode || 'AED');
				setSelected(res.data.existEmpList || []);

				tableApiCallsOnStatus();
				calculatePayperiod(
					dayjs(dateArray[0], 'DD/MM/YYYY'),
					dayjs(dateArray[1], 'DD/MM/YYYY')
				);
			}
		});
	};

	const calculatePayperiod = (startDate, endDate) => {
		let month = dayjs(startDate).format('MMMM');
		const diffTime = Math.abs(startDate - endDate);
		let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
		diffDays = diffDays > 30 ? 30 : month == 'February' ? 30 : diffDays;
		setPaidDays(diffDays);
		getAllPayrollEmployee(startDate);
	};

	const tableApiCallsOnStatus = () => {
		getAllPayrollEmployee();
	};

	const validatePayrollSubjectName = (value) => {
		const data = {
			moduleType: 27,
			name: value,
		};
		commonActions.checkValidation(data).then((response) => {
			if (response.data === 'Payroll Subject already exists') {
				setIsPayrollSubjectNameExist(true);
			} else {
				setIsPayrollSubjectNameExist(false);
			}
		});
	};

	const getAllPayrollEmployee = (startDate) => {
		if (payrollId) {
			var activeEmployee = [];
			var employeePayPeriodlList = [];
			employeeActions.getEmployeeListWithDetails().then((response) => {
				if (response.status === 200) {
					employeePayPeriodlList = response.data;
					let date = startDate ? startDate : watch('startDate');
					let month = dayjs(date).format('MMMM');
					createPayrollActions
						.getAllPayrollEmployee2(payrollId, dayjs(date).format('DD/MM/YYYY'))
						.then((res) => {
							if (res.status === 200) {
								if (res.data.length === 0) {
									createPayrollActions
										.getAllPayrollEmployee(payrollId, date)
										.then((res) => {
											if (res.status === 200) {
												setAllPayrollEmployee(res.data);
											}
										});
								} else {
									setAllPayrollEmployee(res.data);
								}
								let newData = [...allPayrollEmployee];
								newData = newData.map((data) => {
									let tmpPaidDay =
										paidDays > 30 ? 30 : month == 'February' ? 30 : paidDays;
									if (checkForLopSetting === true) data.noOfDays = tmpPaidDay;

									data.originalDeduction = data.deduction;
									data.deduction = (
										(data.originalDeduction / 30) *
										data.noOfDays
									).toFixed(2);
									data.originalNoOfDays = tmpPaidDay;
									data.originalGrossPay = data.grossPay;
									data.perDaySal = data.originalGrossPay / 30;

									if (checkForLopSetting === true) data.lopDay = 0;
									data.grossPay = Number(
										data.perDaySal * data.noOfDays
									).toFixed(2);
									data.netPay =
										Number(data.perDaySal * data.noOfDays).toFixed(2) -
										(data.deduction || 0);

									const empList = employeePayPeriodlList.filter(
										(obj) => obj.employeeId === data.id
									);
									if (empList && empList?.length > 0) {
										let flag = true;
										empList.map((obj) => {
											if (obj.payPeriod.includes(dayjs(date).format('DD/MM/YYYY'))) {
												flag = false;
											}
										});
										if (flag) {
											activeEmployee.push(data);
										}
									} else {
										activeEmployee.push(data);
									}

									return data;
								});
								setAllPayrollEmployee(activeEmployee);

								if (status && status === 'Submitted') {
									createPayrollActions
										.getAllPayrollEmployeeForApprover(payrollId)
										.then((res) => {
											if (res.status === 200) {
												setAllPayrollEmployee(res.data);
											}
										});
								}
							}
						});
				}
			});
		}
	};

	const onFormSubmit = (data) => {
		setDisableLeavePage(true);
		const { payrollSubject, payrollDate, payrollApprover, startDate, endDate } = data;
		let employeeListIds = selectedRows ? selectedRows : '';
		let diff = Math.abs(parseInt((startDate - endDate) / (1000 * 60 * 60 * 24), 10)) + 1;
		let string = dayjs(startDate).format('DD/MM/YYYY') + '-' + dayjs(endDate).format('DD/MM/YYYY');

		const formData = new FormData();
		formData.append('payrollId', payrollId || '');
		formData.append('payPeriod', string);
		formData.append('employeeListIds', employeeListIds);
		formData.append('payrollSubject', payrollSubject || '');

		if (payrollApproverValue !== '') {
			formData.append('approverId', payrollApproverValue || null);
		} else if (payrollApprover && payrollApprover.value) {
			formData.append('approverId', parseInt(payrollApprover.value));
		}

		formData.append('generatePayrollString', JSON.stringify(selectedRows1));
		formData.append('salaryDate', payrollDate);

		let totalAmountPayroll = 0;
		selectedRows1.map((row) => {
			totalAmountPayroll += parseFloat(row.netPay);
		});
		formData.append('totalAmountPayroll', totalAmountPayroll);

		if (apiSelector === 'createPayroll') {
			setLoading(true);
			setLoadingMsg('Updating Payroll...');
			createPayrollActions
				.updatePayroll(formData)
				.then((res) => {
					if (res.status === 200) {
						commonActions.tostifyAlert('success', 'Payroll updated Successfully');
						history.push(`/admin/payroll/payrollrun`);
						setLoading(false);
					}
				})
				.catch((err) => {
					commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong'
					);
					setLoading(false);
				});
		} else {
			if (apiSelector === 'createAndSubmitPayroll') {
				setLoading(true);
				setLoadingMsg('Submitting Payroll...');
				createPayrollActions
					.updateAndSubmitPayroll(formData)
					.then((res) => {
						if (res.status === 200) {
							commonActions.tostifyAlert(
								'success',
								'Payroll updated And Submitted Successfully'
							);
							history.push(`/admin/payroll/payrollrun`);
							setLoading(false);
						}
					})
					.catch((err) => {
						commonActions.tostifyAlert(
							'error',
							err && err.data ? err.data.message : 'Something Went Wrong'
						);
						setLoading(false);
					});
			}
		}
	};

	const updateAmounts = (row, value) => {
		if (value > 30) {
			value = 30;
		}
		let tmpPaidDay = paidDays;
		let newData = [...allPayrollEmployee];
		newData = newData.map((data) => {
			if (row.id === data.id) {
				data.lopDay = value;
				data.noOfDays = parseFloat(tmpPaidDay) - value;

				data.deduction = ((data.originalDeduction / 30) * data.noOfDays).toFixed(2);
				let deduction = data.noOfDays == 0 ? 0 : data.deduction;

				data.grossPay = Number(data.perDaySal * data.noOfDays).toFixed(2);
				data.netPay = Number(data.perDaySal * data.noOfDays).toFixed(2) - (deduction || 0);
			}
			return data;
		});
		setAllPayrollEmployee(newData);

		let tempList1 = [];
		allPayrollEmployee.map((row) => {
			for (let i = 0; i < selected.length; i++) {
				if (row.empId == selected[i]) {
					tempList1.push(row);
				}
			}
		});
		setSelectedRows1(tempList1);
	};

	const defaultSelect = () => {
		if (count === 0 && allPayrollEmployee) {
			let tempList1 = [];
			allPayrollEmployee.map((row) => {
				for (let i = 0; i < selected.length; i++) {
					if (row.empId == selected[i]) {
						tempList1.push(row);
					}
				}
			});
			setSelectedRows(selected);
			setSelectedRows1(tempList1);
			setCount(1);
		}
		let data = allPayrollEmployee || [];
		return data;
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

	const disable = () => {
		if (status === '') {
			return true;
		} else if (
			status === 'Submitted' ||
			status === 'Approved' ||
			status === 'Partially Paid' ||
			status === 'Paid' ||
			status === 'Voided'
		) {
			return true;
		} else {
			return false;
		}
	};

	const disableForAddButton = () => {
		if (
			status === 'Submitted' ||
			status === 'Approved' ||
			status === 'Partially Paid' ||
			status === 'Paid' ||
			status === 'Voided'
		) {
			return true;
		} else {
			return false;
		}
	};

	const getPayrollEmployeeList = () => {
		const selectRowProp = {
			mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			selected: selected,
			clickToSelect: false,
			onSelect: onRowSelect,
			onSelectAll: onSelectAll,
		};

		const cols = [
			{
				label: 'Employee No',
				width: '',
				key: 'empCode',
			},
			{
				label: 'Employee Name',
				width: '',
				key: 'empName',
			},
			{
				label: 'LOP',
				width: '8%',
				key: 'lopDay',
			},
			{
				label: 'Paid Days',
				width: '12%',
				key: 'noOfDays',
			},
			{
				label: 'Gross Pay',
				width: '',
				key: 'grossPay',
			},
			{
				label: 'Deductions',
				width: '',
				key: 'deduction',
			},
			{
				label: 'Net Pay',
				width: '12%',
				key: 'netPay',
			},
		];

		return (
			<React.Fragment>
				<Row></Row>
				<div>
					<BootstrapTable
						selectRow={selectRowProp}
						search={false}
						options={options}
						data={defaultSelect()}
						version="4"
						hover
						keyField="empId"
						remote
						trClassName="cursor-pointer"
						csvFileName="payroll_employee_list.csv"
					>
						{cols.map((col, index) => {
							const format = (cell, row) => {
								if (col.key === 'lopDay') {
									return (
										<Input
											type="number"
											min={0}
											step="0.5"
											max={paidDays - 1}
											id="lopDay"
											name="lopDay"
											value={cell || 0}
											disabled={disableForAddButton() ? true : false}
											onChange={(evt) => {
												let value = parseFloat(
													evt.target.value === '' ? '0' : evt.target.value
												);

												if (value >= paidDays || value < 0 || value === paidDays) {
													return;
												}

												updateAmounts(row, value);
											}}
										/>
									);
								} else if (col.key === 'grossPay') {
									let grossPay = parseFloat(cell);
									return (
										<div>
											{currencyIsoCode ? currencyIsoCode : 'AED'}
											{' ' +
												grossPay.toLocaleString(navigator.language, {
													minimumFractionDigits: 2,
												})}
										</div>
									);
								} else if (col.key === 'netPay') {
									return (
										<div>
											{currencyIsoCode ? currencyIsoCode : 'AED'}
											{' ' +
												cell.toLocaleString(navigator.language, {
													minimumFractionDigits: 2,
												})}
										</div>
									);
								} else if (col.key === 'deduction') {
									return (
										<div>
											{currencyIsoCode ? currencyIsoCode : 'AED'}
											{' ' +
												cell.toLocaleString(navigator.language, {
													minimumFractionDigits: 2,
												})}
										</div>
									);
								} else {
									return <div>{cell}</div>;
								}
							};

							if (col.key === 'netPay' || col.key === 'deduction' || col.key === 'grossPay') {
								return (
									<TableHeaderColumn
										key={index}
										dataFormat={format}
										dataField={col.key}
										dataAlign="right"
										className="table-header-bg"
										dataSort={col.dataSort}
										width={col.width}
									>
										{col.label}
									</TableHeaderColumn>
								);
							} else {
								return (
									<TableHeaderColumn
										key={index}
										dataFormat={format}
										dataField={col.key}
										dataAlign="center"
										className="table-header-bg"
										dataSort={col.dataSort}
										width={col.width}
									>
										{col.label}
									</TableHeaderColumn>
								);
							}
						})}
					</BootstrapTable>
				</div>
			</React.Fragment>
		);
	};

	const onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		let tempList1 = [];
		if (isSelected) {
			tempList = Object.assign([], selectedRows);
			tempList1 = Object.assign([], selectedRows1);
			tempList.push(row.empId);
			tempList1.push(row);
			setSelected([...selected, row.empId]);
		} else {
			selectedRows1.map((item) => {
				if (item.empId !== row.empId) {
					tempList.push(item.empId);
					tempList1.push(item);
				}
				setSelected(selected.filter((x) => x !== row.empId));
				return item;
			});
		}

		setSelectedRows(tempList);
		setSelectedRows1(tempList1);
	};

	const onSelectAll = (isSelected, rows) => {
		let tempList = [];
		let tempList1 = [];
		if (isSelected) {
			rows.map((item) => {
				tempList.push(item.empId);
				tempList1.push(item);
				return item;
			});
			setSelected(tempList);
		} else {
			setSelected([]);
		}
		setSelectedRows(tempList);
		setSelectedRows1(tempList1);
	};

	const deletePayroll = () => {
		const message1 = (
			<text>
				<b>Delete Payroll?</b>
			</text>
		);
		const message = 'This Payroll will be deleted permanently and cannot be recovered. ';
		setDialog(
			<ConfirmDeleteModal
				isOpen={true}
				okHandler={removePayroll}
				cancelHandler={removeDialog}
				message={message}
				message1={message1}
			/>
		);
	};

	const removePayroll = () => {
		setDisableLeavePage(true);
		createPayrollActions
			.deletePayroll(payrollId ? payrollId : 0)
			.then((res) => {
				if (res.status === 200) {
					commonActions.tostifyAlert('success', 'Payroll Deleted Successfully');
					history.push(`/admin/payroll/payrollrun`);
				}
			})
			.catch((err) => {
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong'
				);
			});
	};

	const removeDialog = () => {
		setDialog(null);
	};

	const handleDatesChange = ({ startDate, endDate }) => {
		setValue('startDate', startDate);
		setValue('endDate', endDate);
		setCheckForLopSetting(true);
		calculatePayperiod(startDate, endDate);
	};

	const handleFocusChange = (focusedInput) => setFocusedInput(focusedInput);

	strings.setLanguage(language);

	var today = new Date();

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
												<span className="ml-2">Update Payroll</span>
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
																<FormGroup>
																	<Label htmlFor="payrollSubject">
																		<span className="text-danger">* </span>
																		{strings.payroll_subject}
																	</Label>
																	<Controller
																		name="payrollSubject"
																		control={control}
																		render={({ field }) => (
																			<Input
																				{...field}
																				type="text"
																				id="payrollSubject"
																				maxLength="100"
																				disabled={
																					disableForAddButton() ? true : false
																				}
																				placeholder={
																					strings.Enter + ' Payroll Subject'
																				}
																				onChange={(value) => {
																					field.onChange(value.target.value);
																					validatePayrollSubjectName(
																						value.target.value
																					);
																				}}
																				className={
																					errors.payrollSubject
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.payrollSubject && (
																		<div className="invalid-feedback">
																			{errors.payrollSubject.message}
																		</div>
																	)}
																</FormGroup>
															</Col>
															<Col>
																<FormGroup>
																	<Label htmlFor="date">
																		<span className="text-danger">* </span>
																		{strings.payroll_date}
																	</Label>
																	<Controller
																		name="payrollDate"
																		control={control}
																		render={({ field }) => (
																			<DatePicker
																				{...field}
																				id="payrollDate"
																				placeholderText="Select Payroll Date"
																				showMonthDropdown
																				showYearDropdown
																				dateFormat="dd-MM-yyyy"
																				dropdownMode="select"
																				selected={field.value}
																				onChange={(value) => {
																					field.onChange(value);
																				}}
																				disabled={
																					disableForAddButton() ? true : false
																				}
																				className={`form-control ${
																					errors.payrollDate ? 'is-invalid' : ''
																				}`}
																			/>
																		)}
																	/>
																	{errors.payrollDate && (
																		<div className="invalid-feedback">
																			{errors.payrollDate.message}
																		</div>
																	)}
																</FormGroup>
															</Col>

															<Col>
																<Label htmlFor="date">
																	<span className="text-danger">* </span>
																	{strings.pay_period}
																</Label>
																<div style={{ display: 'flex' }}>
																	<FormGroup>
																		<DateRangePicker
																			displayFormat="DD-MM-YYYY"
																			startDate={startDate}
																			startDateId="tata-start-date"
																			endDate={endDate}
																			endDateId="tata-end-date"
																			onDatesChange={handleDatesChange}
																			focusedInput={focusedInput}
																			disabled={
																				disableForAddButton() ? true : false
																			}
																			onFocusChange={(option) => {
																				setFocusedInput(option);
																			}}
																			isOutsideRange={() => null}
																		/>

																		{errors.startDate && (
																			<div className="invalid-feedback">
																				{errors.startDate.message}
																			</div>
																		)}
																	</FormGroup>
																</div>
															</Col>

															<Col>
																<FormGroup>
																	<Label htmlFor="payrollApprover">
																		<span className="text-danger">* </span>
																		{strings.payroll_approver}
																	</Label>
																	<i
																		id="payrollApprovertip"
																		className="fa fa-question-circle ml-1"
																	></i>
																	<UncontrolledTooltip
																		placement="right"
																		target="payrollApprovertip"
																	>
																		It is mandatory to have an approver for payroll
																		submission. Otherwise, it is not mandatory.
																	</UncontrolledTooltip>
																	<Controller
																		name="payrollApprover"
																		control={control}
																		render={({ field }) => (
																			<Select
																				{...field}
																				isDisabled={disable() ? true : false}
																				id="payrollApprover"
																				value={
																					approver_dropdown_list.data &&
																					selectOptionsFactory
																						.renderOptions(
																							'name',
																							'userId',
																							approver_dropdown_list.data,
																							'Approver'
																						)
																						.find(
																							(option) =>
																								option.value ===
																								payrollApproverValue
																						)
																				}
																				placeholder={strings.select_approver}
																				options={
																					approver_dropdown_list.data
																						? selectOptionsFactory
																								.renderOptions(
																									'name',
																									'userId',
																									approver_dropdown_list.data,
																									'Approver'
																								)
																								.slice(1)
																						: []
																				}
																				onChange={(option) => {
																					if (option && option.value) {
																						setPayrollApproverRequired(false);
																						setUserId(option.value);
																						setPayrollApproverValue(
																							option.value
																						);
																						setSubmitButton(false);
																					} else {
																						setPayrollApproverRequired(false);
																						setUserId('');
																						setPayrollApproverValue('');
																						setSubmitButton(true);
																					}

																					field.onChange(option);
																				}}
																				className={
																					errors.payrollApprover
																						? 'is-invalid'
																						: ''
																				}
																			/>
																		)}
																	/>
																	{errors.payrollApprover && (
																		<div className="invalid-feedback">
																			{errors.payrollApprover.message}
																		</div>
																	)}
																</FormGroup>
															</Col>
														</Row>
														<Row>
															<Col>
																<Label>
																	{' '}
																	Status:{' '}
																	<span style={{ fontSize: 'larger' }}>
																		{' '}
																		{renderStatus(status)}
																	</span>
																</Label>
															</Col>
														</Row>
														<hr />
														<Row>
															<FormGroup className="pull-left mt-3"></FormGroup>

															<Col></Col>
															<Col></Col>
															<Col lg={3} className="pull-right mt-3"></Col>
														</Row>

														{getPayrollEmployeeList()}
														<Row>
															<Col>
																{selectedRows && (
																	<div className="text-danger">
																		{errors.selectedRows}
																	</div>
																)}
															</Col>
														</Row>
														<Row>
															{status &&
															(status === 'Rejected' || status === 'Voided') ? (
																<div className="ml-3" style={{ width: '50%' }}>
																	<Label htmlFor="payrollSubject">
																		{status == 'Approved' || status == 'Voided'
																			? 'Reason for voiding the payroll'
																			: 'Reason for  rejecting the payroll'}
																	</Label>
																	<Input
																		id="comment"
																		name="comment"
																		value={comment}
																		disabled={true}
																		placeholder={strings.Enter + ' reason '}
																		onChange={(event) => {
																			setComment(event.target.value);
																		}}
																	/>
																</div>
															) : (
																''
															)}
														</Row>
														<Row className="mt-4 ">
															<Col>
																{status &&
																(status === 'Submitted' ||
																	status === 'Approved' ||
																	status == 'Partially Paid' ||
																	status === 'Paid' ||
																	status === 'Voided') ? (
																	''
																) : (
																	<>
																		<Button
																			type="button"
																			color="danger"
																			className="btn-square"
																			onClick={deletePayroll}
																		>
																			<i className="fa fa-trash"></i>{' '}
																			{strings.Delete}
																		</Button>
																	</>
																)}

																<Button
																	color="secondary"
																	className="btn-square pull-right"
																	onClick={() => {
																		history.push('/admin/payroll/payrollrun');
																	}}
																>
																	<i className="fa fa-ban"></i> {strings.Cancel}
																</Button>
																{status &&
																(status === 'Submitted' ||
																	status === 'Approved' ||
																	status === 'Partially Paid' ||
																	status === 'Paid' ||
																	status === 'Voided') ? (
																	''
																) : (
																	<>
																		<Button
																			color="primary"
																			className="btn-square pull-right"
																			onClick={async () => {
																				setPayrollApproverRequired(true);
																				setSubjectRequired(true);
																				const isValid = await trigger();
																				if (
																					selectedRows &&
																					selectedRows.length != 0
																				) {
																					setApiSelector('createAndSubmitPayroll');
																					handleSubmit(onFormSubmit)();
																				} else {
																					toast.error(
																						`Please select at least one employee for payroll update !`
																					);
																				}
																			}}
																			title={
																				submitButton
																					? `Please select approver for payroll submission!`
																					: ''
																			}
																		>
																			<i className="fas fa-check-double  mr-1"></i>
																			Update and Submit
																		</Button>
																		<Button
																			type="button"
																			color="primary"
																			className="btn-square pull-right "
																			onClick={async () => {
																				setPayrollApproverRequired(false);
																				setSubjectRequired(true);
																				if (
																					selectedRows &&
																					selectedRows.length != 0
																				) {
																					setApiSelector('createPayroll');
																					handleSubmit(onFormSubmit)();
																				} else {
																					toast.error(
																						`Please select at least one employee for payroll update !`
																					);
																				}
																			}}
																			title={
																				selectedRows && selectedRows.length != 0
																					? ''
																					: `Please select at least one employee for payroll update !`
																			}
																		>
																			<i className="fa fa-dot-circle-o  mr-1"></i>{' '}
																			Update
																		</Button>
																	</>
																)}
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

export default connect(mapStateToProps, mapDispatchToProps)(UpdatePayroll);
