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
	UncontrolledTooltip
} from 'reactstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import { Formik } from 'formik';
import * as Yup from "yup";
import { ConfirmDeleteModal, LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global'
import { selectOptionsFactory } from 'utils'
import * as EmployeeActions from '../../actions';
import * as CreatePayrollActions from './actions';
import * as CreatePayrollEmployeeActions from '../../../payrollemp/screens/create/actions';
import * as PayrollEmployeeActions from '../../../payrollemp/actions'
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import moment from 'moment';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import { toast } from 'react-toastify';

const mapStateToProps = (state) => {

	return ({
		// currency_list: state.employee.currency_list,
		// country_list: state.contact.country_list,
		// state_list: state.contact.state_list,
		employees_for_dropdown: state.payrollRun.employees_for_dropdown,
		approver_dropdown_list: state.payrollRun.approver_dropdown_list,
		// employee_list:state.payrollEmployee.payroll_employee_list,
		// employee_list: state.payrollEmployee.employee_list_dropdown,

	})
}
const mapDispatchToProps = (dispatch) => {
	return ({
		commonActions: bindActionCreators(CommonActions, dispatch),
		employeeActions: bindActionCreators(EmployeeActions, dispatch),
		createPayrollActions: bindActionCreators(CreatePayrollActions, dispatch),
		createPayrollEmployeeActions: bindActionCreators(CreatePayrollEmployeeActions, dispatch),
		payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),

	})
}
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
class UpdatePayroll extends React.Component {

	constructor(props) {
		super(props)
		var date = new Date();
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			createMore: false,
			loading: false,
			initValue: {},
			employeeListIds: [],
			openModal: false,
			selectedRows: [],
			selectedRows1: [],
			// selectRowProp: {
			// 	mode: 'checkbox',
			// 	bgColor: 'rgba(0,0,0, 0.05)',
			// 	clickToSelect: true,
			// 	onSelect: this.onRowSelect,
			// 	onSelectAll: this.onSelectAll,
			// },
			payrollDate: new Date(),
			payrollSubject: undefined,
			//  startDate: new Date(date.getFullYear(), date.getMonth(), 1),
			//  endDate:  new Date(date.getFullYear(), date.getMonth() + 1, 0),
			startDate: '',
			endDate: '',
			payPeriod: '',
			apiSelector: '',
			focusedInput: null,
			submitButton: true,
			payrollApprover: '',
			dialog: null,
			currencyIsoCode: "AED",
			count: 0,
			paidDays: 30,
			checkForLopSetting: false,
			disableLeavePage: false,
			payrollApproverRequired: false,
			isPayrollSubjectNameExist: false,
			//payrollSubjectRequired:false,
			subjectRequired:false,
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

		}

	}

	componentDidMount = () => {

		// let search = window.location.search;
		// let params = new URLSearchParams(search);
		// let payroll_id = params.get('payroll_id');
		// this.props.createPayrollActions.getEmployeesForDropdown();
		// this.props.createPayrollEmployeeActions.getEmployeesForDropdown();
		this.props.createPayrollActions.getApproversForDropdown();
		let payroll_id = this.props.location.state === undefined ? '' : this.props.location.state.id;
		if (payroll_id) {
			this.setState({
				payroll_id: payroll_id
			})
			this.proceed(payroll_id);
		}
		this.tableApiCallsOnStatus();
		this.calculatePayperioad(this.state.startDate, this.state.endDate);

	};
	calculatePayperioad = (startDate, endDate) => {
		let month = moment(startDate).format("MMMM");
		// let diffDays=	Math.abs(parseInt((this.state.startDate - this.state.endDate) / (1000 * 60 * 60 * 24), 10))+1
		const diffTime = Math.abs(startDate - endDate);
		let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
		diffDays = diffDays > 30 ? 30 : month == "February" ? 30 : diffDays;
		this.setState({ paidDays: diffDays });
		this.getAllPayrollEmployee(startDate);
	}
	proceed = (payroll_id) => {

		this.props.createPayrollActions.getPayrollById(payroll_id).then((res) => {
			if (res.status === 200) {
				//	 
				let payPeriodString = res.data.payPeriod;
				let dateArray = payPeriodString.split('-')
				this.setState({
					loading: false,

					payrollId: res.data.id ? res.data.id : '',
					approvedBy: res.data.approvedBy ? res.data.approvedBy : '',
					comment: res.data.comment ? res.data.comment : '',
					deleteFlag: res.data.deleteFlag ? res.data.deleteFlag : '',
					employeeCount: res.data.employeeCount ? res.data.employeeCount : '',
					generatedBy: res.data.generatedBy ? res.data.generatedBy : '',

					isActive: res.data.isActive ? res.data.isActive : '',
					payPeriod: res.data.payPeriod ? res.data.payPeriod : '',
					payrollApprover: res.data.payrollApprover ? res.data.payrollApprover : '',
					submitButton: res.data.payrollApprover === null ? true : false,
					payrollDate: res.data.payrollDate
						? new Date(res.data.payrollDate)
						: '',
					payrollSubject: res.data.payrollSubject ? res.data.payrollSubject : '',
					runDate: res.data.runDate ? res.data.runDate : '',
					status: res.data.status ? res.data.status : '',
					currencyIsoCode: res.data.currencyIsoCode ? res.data.currencyIsoCode : 'AED',
					selected: res.data.existEmpList ? res.data.existEmpList : [],
					// selectRowProp: {
					// 	mode: 'checkbox',
					//     selected:res.data.existEmpList ?res.data.existEmpList :[],
					// 	bgColor: 'rgba(0,0,0, 0.05)',
					// 	clickToSelect: true,
					// 	onSelect: this.onRowSelect,
					// 	onSelectAll: this.onSelectAll,
					// },
					startDate: moment(dateArray[0], 'DD/MM/YYYY'),
					endDate: moment(dateArray[1], 'DD/MM/YYYY')

				}
				)
				this.tableApiCallsOnStatus();
				this.calculatePayperioad(this.state.startDate, this.state.endDate);

			}
		}).catch((err) => {
			this.setState({ loading: false })

		})
	}



	tableApiCallsOnStatus = () => {
		// this.proceed(this.state.payroll_id);
		// if(this.state.status==="Draft"){
		// 	this.getAllPayrollEmployee2()
		// }else{
		this.getAllPayrollEmployee()

	}
	closeModal = (res) => {
		this.setState({ openModal: false });
	};
	initializeData = () => {

		// this.props.createPayrollActions.getEmployeesForDropdown();
		const { filterData } = this.state
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage
		}
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : ''
		}
		const postData = { ...filterData, ...paginationData, ...sortingData }
		// this.props.payrollEmployeeActions.getPayrollEmployeeList(postData).then((res) => {
		// 	if (res.status === 200) {

		// 		this.setState({ loading: false })
		// 	}
		// }).catch((err) => {
		// 	this.setState({ loading: false })
		// 	this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
		// })
	};

	employeeListIds = (option) => {
		this.setState(
			{
				initValue: {
					...this.state.initValue,
					...{
						employeeListIds: option,
					},
				},
			},
			() => { },
		);
		// this.formRef.current.setFieldValue('employeeListIds', option, true);
	};

	disable = () => {

		if (this.state.status === '') {
			return true;
		}
		else
			if (this.state.status === "Submitted" || this.state.status === "Approved" || this.state.status === "Partially Paid" || this.state.status === "Paid" || this.state.status === "Voided") {
				return true;
			} else {
				return false;
			}
	};
	disableForGenerateButtun = () => {

		if (this.state.allPayrollEmployee && this.state.allPayrollEmployee.length === 0) {
			return true;
		}
		else
			if (this.state.status === "Submitted") {
				return true;
			} else {
				return false;
			}
	};
	disableForAddButton = () => {
		if (this.state.status === "Submitted" || this.state.status === "Approved" || this.state.status === "Partially Paid" || this.state.status === "Paid" || this.state.status === "Voided") {
			return true;
		} else {
			return false;
		}
	};

	addEmployee = (data, resetForm) => {

		this.setState({ disabled: true });
		const { employeeIds } = data;


		let employeeList = [];
		Object.keys(employeeIds).forEach(key => {
			employeeList.push(employeeIds[key].value)
		});


		this.props.createPayrollActions
			.addMultipleEmployees(this.state.payroll_id, employeeList)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert('success', 'Employees added Successfully')
					this.tableApiCallsOnStatus()
					// resetForm(this.state.initValue)
				}
			}).catch((err) => {
				this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
			})
	}
	handleSubmit = (data, resetForm) => {

		this.setState({ disabled: true, disableLeavePage: true });
		const {
			payrollSubject,
			payrollDate,
			payrollApprover,
			startDate,
			endDate
		} = data;
		let employeeListIds = this.state.selectedRows ? this.state.selectedRows : '';
		let diff = Math.abs(parseInt((startDate - endDate) / (1000 * 60 * 60 * 24), 10)) + 1
		let string = moment(this.state.startDate).format('DD/MM/YYYY') + '-' + moment(this.state.endDate).format('DD/MM/YYYY')
		// this.setState({payPeriod:diff});
		this.setState({ payPeriod: string });
		const formData = new FormData();

		formData.append('payrollId', this.state.payrollId ? this.state.payrollId : '')

		formData.append('payPeriod', this.state.payPeriod)
		formData.append('employeeListIds', employeeListIds)
		if (payrollSubject === undefined) { formData.append('payrollSubject', this.state.payrollSubject ? this.state.payrollSubject : null) }
		else { formData.append('payrollSubject', payrollSubject) }

		if (this.state.payrollApprover !== "") {
			formData.append('approverId', this.state.payrollApprover ? this.state.payrollApprover : null)
		}
		else if (payrollApprover !== "") { formData.append('approverId', parseInt(payrollApprover)) }

		formData.append('generatePayrollString', JSON.stringify(this.state.selectedRows1));
		formData.append('salaryDate', this.state.payrollDate)

		//Payroll total  amount
		let totalAmountPayroll = 0;
		this.state.selectedRows1.map((row) => { totalAmountPayroll += parseFloat(row.netPay) })
		formData.append('totalAmountPayroll', totalAmountPayroll);

		if (this.state.apiSelector === "createPayroll") {
			this.setState({ loading: true, loadingMsg: "Updating Payroll..." });
			this.props.createPayrollActions
				.updatePayroll(formData)
				// .createPayroll(JSON.stringify(employeeListIds),payrollSubject,this.state.payPeriod,JSON.stringify(this.state.allPayrollEmployee),payrollDate)
				.then((res) => {
					if (res.status === 200) {
						this.props.commonActions.tostifyAlert('success', 'Payroll updated Successfully')
						this.tableApiCallsOnStatus()
						this.props.history.push(`/admin/payroll/payrollrun`);
						// resetForm(this.state.initValue)
						this.setState({ loading: false, });
					}
				}).catch((err) => {
					this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
				})
		} else {
			if (this.state.apiSelector === "createAndSubmitPayroll") {
				this.setState({ loading: true, loadingMsg: "Submitting Payroll..." });
				this.props.createPayrollActions
					.updateAndSubmitPayroll(formData)
					// .createPayroll(JSON.stringify(employeeListIds),payrollSubject,this.state.payPeriod,JSON.stringify(this.state.allPayrollEmployee),payrollDate)
					.then((res) => {
						if (res.status === 200) {
							this.props.commonActions.tostifyAlert('success', 'Payroll updated And Submitted Successfully')
							this.tableApiCallsOnStatus()
							this.props.history.push(`/admin/payroll/payrollrun`);
							// resetForm(this.state.initValue)
							this.setState({ loading: false, });
						}
					}).catch((err) => {
						this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
					})
			}
		}
	}
	handleDatesChange = ({ startDate, endDate }) => {
		this.setState({ startDate: startDate, endDate: endDate, checkForLopSetting: true })
		this.calculatePayperioad(startDate, endDate)
	};
	setDate = (props, value) => {
		const { term } = this.state;
		const val = term ? term.value.split('_') : '';
		const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];
		const values = value
			? value
			: moment(props.values.payrollDate, 'DD-MM-YYYY').toDate();
	};

	getAllPayrollEmployee2 = () => {
		this.props.createPayrollActions.getAllPayrollEmployee2(this.state.payroll_id).then((res) => {

			if (res.status === 200) {
				this.setState({
					allPayrollEmployee: res.data
				})
			}
		})
	}


	validatePayrollSubjectName = (value) => {
		const data = {
			moduleType: 27,
			name: value,
		};
		this.props.commonActions.checkValidation(data).then((response) => {
			if (response.data === 'Payroll Subject already exists') {
				this.setState({
					isPayrollSubjectNameExist: true,

				})
			} else {
				this.setState({
					isPayrollSubjectNameExist: false,
				});
			}
		});
	}

	updateAmounts = (row, value) => {
		if (value > 30) {
			value = 30;
		}
		let tmpPaidDay = this.state.paidDays;
		let newData = [...this.state.allPayrollEmployee]
		newData = newData.map((data) => {
			if (row.id === data.id) {
				data.lopDay = value;
				data.noOfDays = parseFloat(tmpPaidDay) - value

				data.deduction = ((data.originalDeduction / 30) * data.noOfDays).toFixed(2)
				let deduction = data.noOfDays == 0 ? 0 : data.deduction;

				data.grossPay = Number((data.perDaySal * (data.noOfDays))).toFixed(2)
				data.netPay = Number((data.perDaySal * (data.noOfDays))).toFixed(2) - (deduction || 0)

			}
			data.payrollId = this.state.payroll_id
			data.salaryDate = this.state.payrollDate
			return data

		})
		this.setState({
			allPayrollEmployee: newData
		})

		let tempList1 = [];

		this.state.allPayrollEmployee.map((row) => {

			for (let i = 0; i < this.state.selected.length; i++) {
				if (row.empId == this.state.selected[i]) {
					tempList1.push(row);
				}//if
			}
		})

		//
		this.setState({

			selectedRows1: tempList1,

		});
	}

	getAllPayrollEmployee = (startDate) => {
		if (this.state.payrollId) {
			var activeEmployee = [];
			var employeePayPeriodlList = [];
			this.props.employeeActions.getEmployeeListWithDetails().then((response) => {
				if (response.status === 200) {
					employeePayPeriodlList = response.data;
					let date = startDate ? startDate : this.state.startDate;
					let month = moment(date).format("MMMM");
					this.props.createPayrollActions.getAllPayrollEmployee2(this.state.payrollId, moment(date).format("DD/MM/YYYY")).then((res) => {
						if (res.status === 200) {
							if (res.data.length === 0) {
								this.props.createPayrollActions.getAllPayrollEmployee(this.state.payrollId, date).then((res) => {
									if (res.status === 200) {

										this.setState({
											allPayrollEmployee: res.data
										})

									}
								})
							} else {
								this.setState({
									allPayrollEmployee: res.data
								})
							}
							let newData = [...this.state.allPayrollEmployee]
							newData = newData.map((data) => {
								// data.noOfDays =this.state.paidDays
								// data.originalGrossPay=data.grossPay		
								// data.perDaySal=data.originalGrossPay / data.noOfDays			
								let tmpPaidDay = this.state.paidDays > 30 ? 30 :
									(month == "February" ? 30 : this.state.paidDays)
								if (this.state.checkForLopSetting === true) data.noOfDays = tmpPaidDay

								data.originalDeduction = data.deduction
								data.deduction = ((data.originalDeduction / 30) * data.noOfDays).toFixed(2)
								data.originalNoOfDays = tmpPaidDay
								data.originalGrossPay = data.grossPay
								data.perDaySal = data.originalGrossPay / 30

								if (this.state.checkForLopSetting === true) data.lopDay = 0;
								data.grossPay = Number((data.perDaySal * (data.noOfDays))).toFixed(2)
								data.netPay = Number((data.perDaySal * (data.noOfDays))).toFixed(2) - (data.deduction || 0)

								const empList = employeePayPeriodlList.filter(obj => obj.employeeId === data.id)
								if (empList && empList?.length > 0) {
									let flag = true;
									empList.map(obj => {
										if (obj.payPeriod.includes(moment(date).format("DD/MM/YYYY"))) {
											flag = false;
										}
									})
									if (flag) {
										activeEmployee.push(data)
									}
								} else {
									activeEmployee.push(data)
								}


								return data
							})
							this.setState({
								allPayrollEmployee: activeEmployee
							})

							if (this.state.status && this.state.status === "Submitted") {

								this.props.createPayrollActions.getAllPayrollEmployeeForApprover(this.state.payrollId).then((res) => {
									if (res.status === 200) {

										this.setState({
											allPayrollEmployee: res.data
										})

									}
								})
							}
						}
					})
				}
			})
		}
	}
	defaultSelect = () => {
		if (this.state.count === 0 && this.state.allPayrollEmployee) {
			let tempList = [];
			let tempList1 = [];

			this.state.allPayrollEmployee.map((row) => {

				for (let i = 0; i < this.state.selected.length; i++) {
					if (row.empId == this.state.selected[i]) {
						tempList1.push(row);
					}//if
				}
			})

			//
			this.setState({
				selectedRows: this.state.selected,
				selectedRows1: tempList1,
				count: 1
			});
		}
		let data = this.state.allPayrollEmployee || []
		return data

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
	getPayrollEmployeeList = () => {
		const selectRowProp = {
			mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			selected: this.state.selected,
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		}


		const cols = [
			{
				label: 'Employee No',
				width: '',
				key: 'empCode'
			},
			{
				label: 'Employee Name',
				width: '',
				key: 'empName'

			},
			{
				label: 'LOP',
				width: '8%',
				key: 'lopDay'
			},
			{
				label: 'Paid Days',
				width: '12%',
				key: 'noOfDays'
			},
			{
				label: 'Gross Pay',
				width: '',
				key: 'grossPay'
			},

			{
				label: 'Deductions',
				width: '',
				key: 'deduction'
			},
			{
				label: 'Net Pay',
				width: '12%',
				key: 'netPay'

			}
		]

		return (
			<React.Fragment>
				<Row>


				</Row>
				<div >
					<BootstrapTable
						selectRow={selectRowProp}
						search={false}
						options={this.options}
						// data={this.state.allPayrollEmployee || []}
						data={this.defaultSelect()}
						version="4"
						hover
						keyField="empId"
						remote
						trClassName="cursor-pointer"
						csvFileName="payroll_employee_list.csv"
						ref={(node) => this.table = node}
					>
						{
							cols.map((col, index) => {

								const format = (cell, row) => {

									if (col.key === 'lopDay') {
										return (
											<Input
												type="number"
												min={0}
												step="0.5"
												max={this.state.paidDays - 1}
												id="lopDay"
												name="lopDay"
												value={cell || 0}
												disabled={this.disableForAddButton() ? true : false}
												onChange={(evt) => {

													let value = parseFloat(evt.target.value === "" ? "0" : evt.target.value);

													if (value >= this.state.paidDays || value < 0 || value === this.state.paidDays) {
														return;
													}

													this.updateAmounts(row, value)

												}}
											/>

										);

									} else if (col.key === 'grossPay') {
										let grossPay = parseFloat(cell)
										return (<div>{this.state.currencyIsoCode ? this.state.currencyIsoCode : "AED"}{" " + grossPay.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}</div>)
									}
									else
										if (col.key === 'netPay') {
											return (<div>{this.state.currencyIsoCode ? this.state.currencyIsoCode : "AED"}{" " + cell.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}</div>);
										}

										else if (col.key === 'deduction') {
											return (<div>{this.state.currencyIsoCode ? this.state.currencyIsoCode : "AED"}{" " + cell.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}</div>);
										} else {
											return (
												<div>{cell}</div>
											)
										}
								}

								if (col.key === 'netPay' || col.key === 'deduction' || col.key === 'grossPay') {
									return (
										<TableHeaderColumn
											key={index}
											dataFormat={format}
											dataField={col.key}
											dataAlign="right"
											className="table-header-bg"
											dataSort={col.dataSort}
											width={col.width}>
											{col.label}
										</TableHeaderColumn>

									)
								}
								else {
									return (
										<TableHeaderColumn
											key={index}
											dataFormat={format}
											dataField={col.key}
											dataAlign="center"
											className="table-header-bg"
											dataSort={col.dataSort}
											width={col.width}>
											{col.label}
										</TableHeaderColumn>

									)
								}
							})
						}


					</BootstrapTable>
				</div>
			</React.Fragment>
		)
	}

	removeEmployee = () => {
		let ids = this.state.selectedRows;
		if (ids && ids.length) {

			let employeeList = [];
			Object.keys(this.state.selectedRows).forEach(key => {
				employeeList.push(this.state.selectedRows[key])
			});

			this.props.createPayrollActions.removeEmployee(employeeList).then((res) => {


				let newselectRowProp = { ...this.state.selectedRowprop }
				newselectRowProp.selected = []

				this.setState({
					selectRow: [],
					selectedRowprop: newselectRowProp
				});

				if (res.status == 200) {

					this.props.commonActions.tostifyAlert('success', 'Employee(s) deleted Successfully')
					this.tableApiCallsOnStatus()
				}

				if (res.status == 204) {

					this.props.commonActions.tostifyAlert('success', 'Employee(s) deleted Successfully')
					this.tableApiCallsOnStatus()
				}
			}).catch((err) => {

				this.props.commonActions.tostifyAlert('error', 'Error...')

			})

		}
		this.tableApiCallsOnStatus()
	}

	onSubmiitedStatus = () => {
		if (this.state.status === "Submmited") {
			return true;
		}
		else {
			return false;
		}
	}

	onRowSelect = (row, isSelected, e) => {

		let tempList = [];
		let tempList1 = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.selectedRows);
			tempList1 = Object.assign([], this.state.selectedRows1);
			tempList.push(row.empId);
			tempList1.push(row);
			this.setState(() => ({
				selected: [...this.state.selected, row.empId]
			}));
		} else {
			this.state.selectedRows1.map((item) => {
				if (item.empId !== row.empId) {
					tempList.push(item.empId);
					tempList1.push(item);
				}
				this.setState(() => ({
					selected: this.state.selected.filter(x => x !== row.empId)
				}));
				return item;
			});
		}


		this.setState({
			selectedRows: tempList,
			selectedRows1: tempList1,
		});
	};
	onSelectAll = (isSelected, rows) => {

		let tempList = [];
		let tempList1 = [];
		if (isSelected) {
			rows.map((item) => {
				tempList.push(item.empId);
				tempList1.push(item);
				return item;
			});
			this.setState(() => ({
				selected: tempList
			}));
		} else {
			this.setState(() => ({
				selected: []
			}));
		}
		this.setState({
			selectedRows: tempList,
			selectedRows1: tempList1,
		});
	};

	deletePayroll = () => {
		const message1 = (
			<text>
				<b>Delete Payroll?</b>
			</text>
		);
		const message =
			'This Payroll will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removePayroll}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};

	removePayroll = () => {
		this.setState({ disabled1: true, disableLeavePage: true });
		const { current_user_id } = this.state;
		this.props.createPayrollActions
			.deletePayroll(this.state.payrollId ? this.state.payrollId : 0)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Payroll Deleted Successfully',
					);
					this.props.history.push(`/admin/payroll/payrollrun`);
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	render() {
		strings.setLanguage(this.state.language);

		const { employee_list, approver_dropdown_list } = this.props
		const { loading, initValue, dialog } = this.state
		const selectRowProp = {
			mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			selected: this.state.selected,
			clickToSelect: true,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		}
		console.log(this.state.payPeriod)
		var today = new Date();
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
															<ButtonGroup size="sm">

															</ButtonGroup>
														</div>

														<div>
															<Formik

																initialValues={this.state}
																onSubmit={(values, { resetForm }) => {
																	if (this.state.selectedRows) {
																		this.handleSubmit(values)
																	}

																}}
																validationSchema={Yup.object().shape({
																	// payrollSubject: Yup.string()
																	//   .required("Payroll Subject is required"),
																	payrollDate: Yup.string()
																		.required("Payroll date is required"),

																	// selectedRows: Yup.string()
																	//     .required("At least selection of one employee is required for create payroll"),
																})}
																validate={(values) => {

																	let errors = {};
																	if (this.state.payrollApproverRequired && !this.state.payrollApprover) {
																		errors.payrollApprover = 'Payroll Approver is required';
																	}
																	if (this.state.subjectRequired && !this.state.payrollSubject) {
																		errors.payrollSubject = 'Payroll subject is required';
																	}
																	// if (this.state.payrollSubjectRequired && !values.payrollSubject) {
																	// 	errors.payrollSubject = "Payroll subject is required";
																	// }
																	if (!values.payrollDate) {
																		errors.payrollDate = 'Payroll date is required';
																	}
																	if (this.state.isPayrollSubjectNameExist === true) {
																		errors.payrollSubject = "Payroll Subject Already Exists"
																	}

																	//   if(this.state.selectedRows && this.state.selectedRows.length===0)
																	//   {
																	// 	  errors.selectedRows = 'At least selection of one employee is required for create payroll';
																	//   }
																	if (!this.state.startDate && !this.state.endDate) {
																		errors.startDate = 'Start and end date is required';
																	} else
																		if (!this.state.startDate) {
																			errors.startDate = 'Start date is required';
																		} else
																			if (!this.state.endDate) {
																				errors.startDate = 'End date is required';
																			}

																	return errors;
																}}
															>
																{(props) => (


																	<Form onSubmit={props.handleSubmit}>
																		<Row>
																			<Col >
																				<FormGroup>
																					<Label htmlFor="payrollSubject">
																						<span className="text-danger">* </span>
																						{strings.payroll_subject}
																					</Label>
																					<Input
																						type="text"
																						id="payrollSubject"
																						name="payrollSubject"
																						value={this.state.payrollSubject}
																						maxLength="100"
																						disabled={this.disableForAddButton() ? true : false}
																						placeholder={strings.Enter + " Payroll Subject"}
																						onChange={(value) => {
																							props.handleChange('payrollSubject')(value);
																							this.validatePayrollSubjectName(value.target.value)
																							this.setState({ payrollSubject: value.target.value })
																						}}
																						className={props.errors.payrollSubject ? "is-invalid" : ""}
																					/>
																					{props.errors.payrollSubject && (
																						<div className="invalid-feedback">
																							{props.errors.payrollSubject}
																						</div>
																					)}

																				</FormGroup>
																			</Col>
																			<Col >
																				<FormGroup>
																					<Label htmlFor="date">
																						<span className="text-danger">* </span>
																						{strings.payroll_date}
																					</Label>
																					<DatePicker
																						id="payrollDate"
																						name="payrollDate"
																						placeholderText="Select Payroll Date"
																						showMonthDropdown
																						showYearDropdown
																						dateFormat="dd-MM-yyyy"
																						dropdownMode="select"
																						selected={this.state.payrollDate}
																						onChange={(value) => {
																							props.handleChange('payrollDate')(value);
																							this.setState({ payrollDate: value })
																						}}
																						disabled={this.disableForAddButton() ? true : false}
																						className={`form-control ${props.errors.payrollDate
																							? 'is-invalid'
																							: ''
																							}`}
																					/>
																					{props.errors.payrollDate && (
																						<div className="invalid-feedback">
																							{props.errors.payrollDate}
																						</div>
																					)}
																				</FormGroup>
																			</Col>


																			<Col  >
																				<Label htmlFor="date">
																					<span className="text-danger">* </span>
																					{strings.pay_period}
																				</Label>
																				<div style={{ display: "flex" }}>
																					{/* <FormGroup className="mt-2"><i className="far fa-calendar-alt mt-1"></i>&nbsp;</FormGroup> */}
																					<FormGroup >
																						<DateRangePicker
																							displayFormat="DD-MM-YYYY"
																							startDate={this.state.startDate}
																							startDateId="tata-start-date"
																							endDate={this.state.endDate}
																							endDateId="tata-end-date"
																							onDatesChange={this.handleDatesChange}
																							focusedInput={this.state.focusedInput}
																							disabled={this.disableForAddButton() ? true : false}
																							onFocusChange={(option) => { this.setState({ focusedInput: option }) }}
																							isOutsideRange={
																								() => null
																								// day => isInclusivelyBeforeDay(day, moment(new Date(today.getFullYear(), today.getMonth(),0)))
																							}
																						/>

																						{props.errors.startDate && (
																							<div className="invalid-feedback">
																								{props.errors.startDate}
																							</div>
																						)}
																					</FormGroup>

																				</div>

																			</Col>

																			<Col >

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
																						It is mandatory to have an approver for payroll submission. Otherwise, it is not mandatory.
																					</UncontrolledTooltip>
																					<Select
																						isDisabled={this.disable() ? true : false}
																						// styles={customStyles}
																						id="payrollApprover"
																						name="payrollApprover"
																						value={
																							approver_dropdown_list.data &&
																							selectOptionsFactory
																								.renderOptions(
																									'name',
																									'userId',
																									approver_dropdown_list.data,
																									'Approver',
																								)
																								.find(
																									(option) =>
																										option.value ===
																										this.state.payrollApprover,
																								)
																						}
																						placeholder={strings.select_approver}
																						options={
																							approver_dropdown_list.data
																								? selectOptionsFactory.renderOptions(
																									'name',
																									'userId',
																									approver_dropdown_list.data,
																									'Approver',
																								).slice(1)
																								: []
																						}
																						onChange={(option) => {
																							if (option && option.value) {
																								this.setState({ payrollApproverRequired: false, userId: option.value, payrollApprover: option.value, submitButton: false })
																							} else
																								this.setState({ payrollApproverRequired: false, userId: "", payrollApprover: "", submitButton: true })

																							props.handleChange('payrollApprover')(option);
																						}}
																						className={
																							props.errors.payrollApprover &&
																								props.touched.payrollApprover
																								? 'is-invalid'
																								: ''
																						}
																					/>
																					{props.errors.payrollApprover &&
																						props.touched.payrollApprover && (
																							<div className="invalid-feedback">
																								{props.errors.payrollApprover}
																							</div>
																						)}
																				</FormGroup>
																			</Col>
																		</Row>
																		<Row>
																			<Col>
																				<Label> Status : <span style={{ fontSize: "larger" }}>  {this.renderStatus(this.state.status)}</span></Label>
																			</Col>
																		</Row>
																		<hr />
																		<Row>

																			<FormGroup className="pull-left mt-3">
																				{/* add and remove */}
																				{/* <Button type="button" color="primary" className="btn-square ml-3 mr-1 "
																			// disabled={this.disableForAddButton() ? true : false}
																			onClick={() => {
																				// this.setState(() => {
																				// 	props.handleSubmit()
																				// })
																				// this.setState({
																				// 	openModal: true
																				// })
																				this.props.createPayrollActions.getAllPayrollEmployee(this.state.payrollId).then((res) => {
																					if (res.status === 200) {
																						
																							this.setState({
																								allPayrollEmployee: res.data
																							})
																						
																					}
																				})	
																			}}>
																			<i className="fa fa-dot-circle-o"></i> Add All Employees
																		</Button> */}
																				{/* <Button
																			color="primary"
																			className="btn-square ml-3 "
																			onClick={() => {
																				this.removeEmployee()
																			}}

																			disabled={this.state.selectedRows.length === 0}
																		>
																			<i className="far fa-trash-alt mr-1"></i>
																			Remove Employees
																		</Button> */}
																			</FormGroup>

																			<Col></Col>
																			<Col></Col>
																			<Col lg={3} className="pull-right mt-3">

																			</Col>
																		</Row>


																		{this.getPayrollEmployeeList()}
																		<Row><Col>
																			{this.state.selectedRows && (
																				<div className="text-danger">
																					{props.errors.selectedRows}
																				</div>
																			)}
																		</Col></Row>
																		<Row>
																			{this.state.status && (this.state.status === "Rejected" || this.state.status === "Voided") ?
																				(
																					<div className='ml-3' style={{ width: "50%" }}>

																						<Label htmlFor="payrollSubject">
																							{this.state.status == "Approved" || this.state.status == "Voided" ?
																								"Reason for voiding the payroll" :
																								"Reason for  rejecting the payroll"}
																						</Label>
																						<Input
																							id="comment"
																							name="comment"
																							value={this.state.comment}
																							disabled={true}
																							placeholder={strings.Enter + " reason "}
																							onChange={(event) => { this.setState({ comment: event.target.value }); }}
																						/>
																					</div>

																				) : ""
																			}
																		</Row>
																		<Row className="mt-4 ">


																			<Col>
																				{this.state.status && (this.state.status === "Submitted" || this.state.status === "Approved" || this.state.status == "Partially Paid" || this.state.status === "Paid" || this.state.status === "Voided") ? ("") : (<>
																					<Button
																						type="button"
																						color="danger"
																						className="btn-square"
																						disabled1={this.state.disabled1}
																						onClick={this.deletePayroll}
																					>
																						<i className="fa fa-trash"></i> {this.state.disabled1
																							? 'Deleting...'
																							: strings.Delete}
																					</Button>
																				</>)}


																				<Button
																					color="secondary"
																					className="btn-square pull-right"
																					onClick={() => {
																						this.props.history.push('/admin/payroll/payrollrun')
																					}}
																				>
																					<i className="fa fa-ban"></i> {strings.Cancel}
																				</Button>
																				{this.state.status && (this.state.status === "Submitted" || this.state.status === "Approved" || this.state.status === "Partially Paid" || this.state.status === "Paid" || this.state.status === "Voided") ? ("") :
																					(<>

																						<Button
																							color="primary"
																							className="btn-square pull-right"
																							// onClick={}
																							onClick={() => {
																								this.setState({ payrollApproverRequired: true,subjectRequired:true  }, () => {
																									// if (this.state.submitButton)
																									// 	toast.error(`Please select approver for payroll submission!`)
																									// else
																									if (this.state.selectedRows && this.state.selectedRows.length != 0) {
																										this.setState({ apiSelector: "createAndSubmitPayroll" })
																										props.handleSubmit()
																									}
																									else
																										toast.error(`Please select at least one employee for payroll update !`)
																								})
																							}}
																							// disabled={!this.state.submitButton && this.state.selectedRows && this.state.selectedRows.length !=0 ? false :true}
																							title={
																								this.state.submitButton
																									? `Please select approver for payroll submission!`
																									: ''
																							}

																						>

																							<i className="fas fa-check-double  mr-1"></i>Update and Submit


																						</Button>
																						<Button type="button" color="primary" className="btn-square pull-right "

																							onClick={() => {
																								this.setState({ payrollApproverRequired: false,subjectRequired:true }, () => {
																									if (this.state.selectedRows && this.state.selectedRows.length != 0) {
																										this.setState({ apiSelector: "createPayroll" })
																										props.handleSubmit()
																									}
																									else
																										toast.error(`Please select at least one employee for payroll update !`)
																								})
																							}}
																							// disabled={this.state.selectedRows && this.state.selectedRows.length !=0 ? false :true}
																							title={
																								this.state.selectedRows && this.state.selectedRows.length != 0
																									? ''
																									: `Please select at least one employee for payroll update !`
																							}
																						>
																							<i className="fa fa-dot-circle-o  mr-1"></i> Update
																						</Button>
																					</>


																					)
																				}

																			</Col>
																		</Row>
																	</Form>
																)
																}
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
						{/* <AddEmployeesModal
					openModal={this.state.openModal}
					closeModal={(e) => {
						this.closeModal(e);
					}}

				// employee_list={employee_list.data}				
				/> */}
					</div>
					{this.state.disableLeavePage ? "" : <LeavePage />}
				</div>
		)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdatePayroll)

