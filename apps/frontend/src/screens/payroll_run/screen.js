import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,

	CardBody,
	Row,
	Col,

	Button,
	CardHeader,
	ButtonGroup,

	UncontrolledTooltip,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';


import { Loader, } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { CommonActions } from 'services/global';


import * as PayRollActions from './actions';
import moment from 'moment';

import './style.scss';
import { data } from '../Language/index'
import LocalizedStrings from 'react-localization';

import { toast } from 'react-toastify';
import { Table } from '@material-ui/core';
import { CreateCompanyDetails } from './sections';
const mapStateToProps = (state) => {

	return {
		user_approver_generater_dropdown_list: state.payrollRun.user_approver_generater_dropdown_list.data,
		payroll_employee_list: state.payrollRun.payroll_list,
		// payroll_employee_list: state.payrollEmployee.payroll_employee_list.resultSalaryPerMonthList,
		incompleteEmployeeList: state.payrollRun.incompleteEmployeeList,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		payRollActions: bindActionCreators(PayRollActions, dispatch),
		commonactions: bindActionCreators(CommonActions, dispatch),
	};
};
// const customStyles = {
// 	control: (base, state) => ({
// 		...base,
// 		borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
// 		boxShadow: state.isFocused ? null : null,
// 		'&:hover': {
// 			borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
// 		},
// 	}),
// };

let strings = new LocalizedStrings(data);
class PayrollRun extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			payRollList: {},
			actionButtons: {},
			loading: true,
			selectedRows: [],
			dialog: false,
			salaryDate: moment().startOf('month').format('DD-MM-YYYY'),
			filterData: {
				contactId: '',
				invoiceId: '',
				receiptReferenceCode: '',
				receiptDate: '',
				contactType: 2,
			},
			initValue: {
				presentdate: moment().local().format('DD-MM-YYYY'),
			},
			activeTab: new Array(4).fill('1'),
			csvData: [],
			view: false,
			openModal: false,
			selectedData: '',
			current_employee: '',
			lop: '',
			disableCreating: true,
			disableCreatePayroll: false,
			sifEnabled: true,
		};

		this.options = {
			onRowClick: this.goToDetail,
			paginationPosition: 'bottom',
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		};

		this.selectRowProp = {
			//	mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};
		this.csvLink = React.createRef();
	}

	componentWillReceiveProps = (nextProps) => {
		this.setState({ payroll_employee_list1: nextProps.payroll_employee_list })
	}
	componentDidMount = () => {
		this.props.payRollActions.getUserAndRole();
		this.initializeData();
		this.disableCreatePayroll()
	};
	toggle = (tabPane, tab) => {
		const newArray = this.state.activeTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		this.setState({
			activeTab: newArray,
		});
	};

	initializeData = (search) => {

		let { filterData } = this.state;
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };

		this.props.payRollActions
			.getPayrollList(postData)
			.then((res) => {
				if (res.status === 200) {

					this.setState({
						loading: false,
					})
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});



	};

	goToDetail = (row) => {
		// this.renderActionForState(row.employeeId);
		const { user_approver_generater_dropdown_list } = this.props;
		var userValue = user_approver_generater_dropdown_list.length ? user_approver_generater_dropdown_list[0].value : '';
		var userLabel = user_approver_generater_dropdown_list.length ? user_approver_generater_dropdown_list[0].label : '';
		console.log(userLabel, userValue, parseInt(row.payrollApprover))
		if ((userLabel === "Payroll Generator" && userValue === parseInt(row.generatedBy)) && (row.status !== "Draft" && row.status !== "Rejected")) {
			this.props.history.push('/admin/payroll/ViewPayroll', { id: row.id, user: 'Generator' })
		} else if ((userLabel === "Payroll Generator" && userValue === parseInt(row.generatedBy)) && (row.status === "Draft" || row.status === "Rejected")) {
			this.props.history.push('/admin/payroll/payrollrun/updatePayroll', { id: row.id })
		} else if ((userValue === row.payrollApprover && userLabel === "Payroll Approver") && (row.status !== "Draft")) {
			this.props.history.push('/admin/payroll/ViewPayroll', { id: row.id })
		} else if (userValue === row.payrollApprover && userLabel === "Accountant" && (row.status !== "Draft" && row.status !== "Rejected")) {
			this.props.history.push('/admin/payroll/ViewPayroll', { id: row.id })
		} else if (userLabel === "Admin" && (row.status !== "Draft" && row.status !== "Rejected")) {
			this.props.history.push('/admin/payroll/payrollApproverScreen', { id: row.id })
		} else if (userLabel === "Admin" && (row.status === "Draft" || row.status === "Rejected")) {
			this.props.history.push('/admin/payroll/payrollrun/updatePayroll', { id: row.id })
		} else {
			let list = [...this.state.payroll_employee_list1.data];
			list = list.map((data) => {
				if (data.id === row.id) {
					data.hover = true;
				}
				return data;
			});
			this.setState({
				payroll_employee_list1: {
					...this.state.payroll_employee_list1, ...{
						data: list
					}
				}
			})

			toast.success("Access Denied! This payroll is created by another user.")
		}

	};

	renderMode = (cell, row) => {
		return <span className="badge badge-success mb-0">Cash</span>;
	};

	renderDate = (cell, rows) => {
		return rows.payrollDate ? moment(rows.payrollDate).format('DD-MM-YYYY') : '-';
	};

	renderAmount = (cell, row, extraData) => {
		// return row.amount ? (
		// 	<Currency
		// 		value={row.amount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	''
		// );
		return row.amount ? row.currencySymbol + row.amount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '';
	};

	renderCurrency = (cell, row) => {
		if (row.currencyIsoCode) {
			return (
				<label className="badge label-currency mb-0">{row.currencyIsoCode}</label>
			);
		} else {
			return <label className="badge badge-danger mb-0">No Specified</label>;
		}
	};
	renderUnusedAmount = (cell, row) => {
		return row.unusedAmount ? row.unusedAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '';
	};

	onSizePerPageList = (sizePerPage) => {
		if (this.options.sizePerPage !== sizePerPage) {
			this.options.sizePerPage = sizePerPage;
			this.initializeData();
		}
	};

	onPageChange = (page, sizePerPage) => {
		if (this.options.page !== page) {
			this.options.page = page;
			this.initializeData();
		}
	};

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	onRowSelect = (row, isSelected, e) => {
		let tempList = [];

		if (isSelected && row.status === "Draft") {
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.employeeId);
		} else {
			// if(isSelected==true) {	this.props.commonactions.tostifyAlert(
			// 	'success',"Salary for \""+row.employeeName+'\" has ALREADY GENERATED',
			// );}


			this.state.selectedRows.map((item) => {
				if (item !== row.employeeId) {
					tempList.push(item);
				}
				return item;
			});
		}

		this.setState({
			selectedRows: tempList,
		});
	};
	renderRunDate = (cell, row) => {
		return row.runDate ? moment(row.runDate).format('DD-MM-YYYY') : '-';
	};
	renderPayrolltotalAmount = (cell, row) => {
		return (
			<div>
			 <div>
			 <label className="font-weight-bold mr-2 ">{strings.Payroll + " " + strings.Amount}: </label>
			<label>
				{row.totalAmountPayroll === 0 ? "AED " + row.totalAmountPayroll.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : "AED " + row.totalAmountPayroll.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}

			</label>
				</div>
				{row.dueAmountPayroll != null && (<div style={{ display: row.dueAmountPayroll === 0 ? 'none' : '' }}>
					<label className="font-weight-bold mr-2">{strings.DueAmount} : </label>
					<label>{row.dueAmountPayroll === 0 ? row.dueAmountPayroll + " " + row.dueAmountPayroll.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : "AED " + row.dueAmountPayroll.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}</label>
				</div>)}
                </div>);
	};
	renderEmployeeCount = (cell, row) => {
		let employeeCount = row.employeeCount ? row.employeeCount : '-'
		return (<div className="text-center">{employeeCount}</div>);
	};
	renderPayperiod = (cell, row) => {
		let dateArr = row.payPeriod ? row.payPeriod.split("-") : [];

		let startDate = dateArr[0].replaceAll('/','-');
		let endDate = dateArr[1].replaceAll('/','-');

		return (<Table>
			<Row><Col className="pull-right"><b>Start-Date</b></Col><Col>: {startDate}</Col></Row>
			<Row><Col className="pull-right"><b>End-Date</b></Col><Col>: {endDate}</Col></Row>
		</Table>
		);
	};
	renderPayrollApprover = (cell, row) => {
		return row.payrollApproverName ? row.payrollApproverName : '-';
	};
	renderGeneratedBy = (cell, row) => {
		return row.generatedByName ? row.generatedByName : '-';
	};
	renderComment = (cell, row) => {

		if (row.comment !== null) {
			return (<label
				className="mb-0 label-bank"
				id="UnitPriceTooltip1"
				style={{
					cursor: 'pointer',
					// backgroundColor: "yellow !important"
				}}
			>
				{/* <UncontrolledTooltip
				placement="right"
				target="UnitPriceTooltip1"
				key={row.id}
			>
				{row.comment ? row.comment:''}
			</UncontrolledTooltip> */}
				Read Here..
			</label>);
		}
		else {
			return ("-");
		}
	};
	onSelectAll = (isSelected, rows) => {

		let tempList = [];
		// let paidList = [];
		// let EmployeeNames = "";
		if (isSelected) {
			rows.map((item) => {
				if (item.status === 'Draft') {
					tempList.push(item.employeeId)
				}
			});
		}
		// this.props.commonactions.tostifyAlert(
		// 	'info',"Salary for below Employees has already generated  : "+EmployeeNames,
		// );
		// paidList.map((e)=>{

		// })
		this.setState({
			selectedRows: tempList,
		});
	};

	renderStatus = (cell, row) => {
		let classname = '';

		if (row.status === 'Approved') {
			classname = 'label-success';
		} if (row.status === 'Paid') {
			classname = 'label-sent';
		} else
			if (row.status === 'UnPaid') {
				classname = 'label-closed';
			} else if (row.status === 'Draft') {
				classname = 'label-currency';
			} else if (row.status === 'Paid') {
				classname = 'label-approved';
			} else if (row.status === 'Rejected') {
				classname = 'label-due';
			} if (row.status === 'Submitted') {
				classname = 'label-sent';
			} else if (row.status === 'Partially Paid') {
				classname = 'label-PartiallyPaid';
			} else if (row.status === "Voided") {
				classname = 'label-closed';
			}
		// else {
		// 	classname = 'label-overdue';
		// }
		return (
			<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
				{row.status}
			</span>
		);
	};

	// bulkDelete = () => {
	// 	const { selectedRows } = this.state;

	// 			if (selectedRows.length > 0) {
	// 		this.setState({
	// 			dialog: (
	// 				<ConfirmDeleteModal
	// 					isOpen={true}
	// 					okHandler={this.removeBulk}
	// 					cancelHandler={this.removeDialog}
	// 					message={message}
	// 					message1={message1}
	// 				/>
	// 			),
	// 		});
	// 	} else {
	// 		this.props.commonactions.tostifyAlert(
	// 			'info',
	// 			'Please select the rows of the table and try again.',
	// 		);
	// 	}
	// };

	generateSalary = () => {
		//let { selectedRows,salaryDate } = this.state;
		const { payroll_employee_list } = this.props;
		// let obj = {
		// 	employeeListIds: selectedRows,
		//     salaryDate : salaryDate

		// };

		const {
			employeeListIds,
			salaryDate
		} = data;


		const formData = new FormData();
		formData.append('employeeListIds', (this.state.selectedRows))
		formData.append('salaryDate', this.state.salaryDate)

		this.props.payRollActions
			.generateSalary(formData)
			.then((res) => {
				if (res.status === 200) {
					this.initializeData();
					this.props.commonactions.tostifyAlert(
						'success',
						'Salary Generated Successfully',
					);
					if (payroll_employee_list && payroll_employee_list.length > 0) {
						this.setState({
							selectedRows: [],
						});
					}
				}
			})
			.catch((err) => {
				this.props.commonactions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	// removeDialog = () => {
	// 	this.setState({
	// 		dialog: null,
	// 	});
	// };

	handleChange = (val, name) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: val,
			}),
		});
	};

	handleSearch = () => {
		this.initializeData();
	};

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.receiptActions.getReceiptList(obj).then((res) => {
				if (res.status === 200) {
					this.setState({ csvData: res.data.data, view: true }, () => {
						setTimeout(() => {
							this.csvLink.current.link.click();
							this.initializeData();
						}, 0);
					});
				}
			});
		} else {
			this.csvLink.current.link.click();
		}
	};
	updateParentLop = (lop, noOfDays) => {
		this.setState({ lop: lop, noOfDays })
	};
	renderActionForState = (employeeId) => {
		this.props.payRollActions.getSalaryDetailByEmployeeIdNoOfDays(employeeId).then((res) => {
			this.setState({
				current_employee: employeeId,
				openModal: true, rowId: employeeId,
				selectedData: res.data,
				employeename: res.data.employeeName,
				netPay: res.data.netPay,
				noOfDays: res.data.noOfDays,
				lop: 30 - res.data.noOfDays,
				salaryDetailAsNoOfDaysMap: res.data.salaryDetailAsNoOfDaysMap,
				loading: false,
			})
		});
	}


	clearAll = () => {
		this.setState(
			{
				filterData: {
					contactId: '',
					invoiceId: '',
					receiptReferenceCode: '',
					receiptDate: '',
				},
			},
			() => {
				this.initializeData();
			},
		);
	};
	columnHover = (cell, row, enumObject, rowIndex) => {

		return cell
	}
	toggleActionButton = (index) => {
		let temp = Object.assign({}, this.state.actionButtons);
		if (temp[parseInt(index, 10)]) {
			temp[parseInt(index, 10)] = false;
		} else {
			temp[parseInt(index, 10)] = true;
		}
		this.setState({
			actionButtons: temp,
		});
	};
	renderSubject = (cell, row) => {
		if (row.hover) {

			return (

				<label
					className="mb-0 label-bank"
					id="UnitPriceTooltip"
					style={{
						cursor: 'pointer',
						backgroundColor: "yellow !important"
					}}
				>
					<UncontrolledTooltip
						placement="right"
						target="UnitPriceTooltip"
					>
						This is created by another user , So you can'nt able to Open it !
					</UncontrolledTooltip>
					{row.payrollSubject}
				</label>
			);
		}
		else {
			return (
				<label
					className="mb-0 label-bank"
					style={{
						cursor: 'pointer',
					}}
				>
					{row.payrollSubject}
				</label>
			);
		}


	};
	renderActions = (cell, row) => {
		return (
			<div>

				<Button
					onClick={() =>
						this.props.history.push(
							'/admin/payroll/employee/viewEmployee',
							{ id: row.employeeId },
						)
					}
				>
					<i className="fas fa-edit" />
				</Button>
				&nbsp;&nbsp;&nbsp;	{row.employeeName}

			</div>
		);
	};

	openModal = (props) => {
		this.setState({ openModal: true });
	};
	closeModal = (res) => {
		this.setState({ openModal: false });
		this.initializeData();
		this.disableCreatePayroll();
	};

	grossSalary = (cell, row, extraData) => {
		return row.grossSalary ? row.grossSalary.toLocaleString() : row.grossSalary.toLocaleString();
	}

	deductions = (cell, row, extraData) => {
		return row.deductions ? row.deductions.toLocaleString() : row.deductions.toLocaleString();
	}

	earnings = (cell, row, extraData) => {
		return row.earnings ? row.earnings.toLocaleString() : row.earnings.toLocaleString();
	}

	disableCreatePayroll = () => {
		this.props.payRollActions.getCompanyDetails().then((res) => {
			if (res.status == 200) {
				let sifEnabled = res.data.generateSif;
				let companyNumber = res.data.companyNumber ? res.data.companyNumber : "";
				let companyBankCode = res.data.companyBankCode ? res.data.companyBankCode : "";
				this.setState({ disableCreatePayroll: companyNumber == "" || companyBankCode == "" ? true : false, sifEnabled: sifEnabled });
			}
		});


	}

	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			dialog,
			selectedRows,
			filterData,
			csvData,
			view,
			sifEnabled,
		} = this.state;
		const {
			payroll_employee_list,
			user_approver_generater_dropdown_list,
			incompleteEmployeeList,
			invoice_list,
			contact_list,
			universal_currency_list,
		} = this.props;

		const userForCheckApprover = user_approver_generater_dropdown_list && user_approver_generater_dropdown_list.length !== 0 ? user_approver_generater_dropdown_list[0].label : '';
		return (
			loading == true ? <Loader /> :
				<div>
					<div className="receipt-screen">
						<div className="animated fadeIn">
							{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
							{dialog}
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fas fa-money-check-alt"></i>
												<span className="ml-2">{strings.payrolls}</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>


									<div className="employee-screen">
										<div className="animated fadeIn">
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
														<Row className="mb-4 ">

															{userForCheckApprover === "Payroll Approver" || userForCheckApprover === "Accountant" ? ""
																: <Col>

																	<Button
																		color="primary"
																		title={this.state.disableCreatePayroll == true && sifEnabled ? "Please Create Company Details" : ""}
																		className="btn-square mt-2 pull-right"
																		style={{ padding : '5px' , margin : "1px"}}
																		onClick={() => {
																			if (this.state.disableCreatePayroll && sifEnabled) {
																				toast.success("Please Create Company Details From Payroll-config");
																				this.props.history.push('/admin/payroll/config', { tabNo: "4" })
																			}
																			else
																				this.props.history.push('/admin/payroll/payrollrun/createPayrollList')
																		}}
																	>
																		<i className="fas fa-plus mr-1" />

																		{strings.Addpayroll}
																	</Button>
																	{/* <Button
																color="primary"
																className="btn-square mt-2 pull-right"
																// onClick={}
																onClick={() =>
																	{
																		this.setState({openModal:true,disableCreating:false})
																	}
																}
															
															>
																<i className="fas fa-plus mr-1" />

																{strings.create_company_details}
															</Button> */}
																</Col>
															}

														</Row>
														<div >
															<BootstrapTable

																//  selectRow={this.selectRowProp}
																search={false}
																options={this.options}
																data={this.state.payroll_employee_list1 &&
																	this.state.payroll_employee_list1.data ? this.state.payroll_employee_list1.data : []}
																version="4"
																hover
																keyField="employeeId"
																remote
																pagination={
																	this.state.payroll_employee_list1 &&
																		this.state.payroll_employee_list1.data &&
																		this.state.payroll_employee_list1.data.length > 0
																		? true
																		: false
																}
																fetchInfo={{
																	dataTotalSize: this.state.payroll_employee_list1 &&
																		this.state.payroll_employee_list1.count ? this.state.payroll_employee_list1.count : 0
																}}
																// className="employee-table mt-4"
																trClassName="cursor-pointer"
																csvFileName="payroll_employee_list.csv"
																ref={(node) => this.table = node}
															>
																<TableHeaderColumn
																	className="table-header-bg"
																	dataField="payrollDate"
																	dataFormat={this.renderDate}
																	dataSort
																	width="10%"
																	tdStyle={{ whiteSpace: "normal" }}
																	thStyle={{ whiteSpace: "normal" }}
																>
																	{strings.pay_date}
																</TableHeaderColumn>
																<TableHeaderColumn
																	className="table-header-bg"
																	dataField="payrollSubject"
																	dataFormat={this.renderSubject}
																	dataSort
																	tdStyle={{ whiteSpace: "normal" }}
																	thStyle={{ whiteSpace: "normal" }}
																>
																	{strings.pay_subject}
																</TableHeaderColumn>
																<TableHeaderColumn
																	className="table-header-bg"
																	dataField="payPeriod"
																	dataFormat={this.renderPayperiod}
																	width='15%'
																	dataSort
																	// tdStyle={{whiteSpace:"normal"}}
																	thStyle={{ whiteSpace: "normal" }}
																>
																	{strings.pay_period}
																</TableHeaderColumn>
																<TableHeaderColumn
																	className="table-header-bg"
																	dataField="employeeCount"
																	dataSort
																	dataFormat={this.renderEmployeeCount}
																	tdStyle={{ whiteSpace: "normal" }}
																	thStyle={{ whiteSpace: "normal" }}
																>
																	{strings.emp_count}
																</TableHeaderColumn>
																<TableHeaderColumn
																	className="table-header-bg"
																	dataField="generatedBy"
																	dataSort
																	dataFormat={this.renderGeneratedBy}
																	tdStyle={{ whiteSpace: "normal" }}
																	thStyle={{ whiteSpace: "normal" }}
																>
																	{strings.generated_by}
																</TableHeaderColumn>
																<TableHeaderColumn
																	className="table-header-bg"
																	dataField="payrollApprover"
																	dataSort
																	dataFormat={this.renderPayrollApprover}
																	tdStyle={{ whiteSpace: "normal" }}
																	thStyle={{ whiteSpace: "normal" }}
																>
																	{strings.approver}
																</TableHeaderColumn>
																<TableHeaderColumn
																	className="table-header-bg"
																	dataField="status"
																	dataSort
																	dataFormat={this.renderStatus}
																>
																	{strings.STATUS}
																</TableHeaderColumn>
																<TableHeaderColumn
																	className="table-header-bg"
																	dataField="runDate"
																	dataSort
																	width="10%"
																	dataFormat={this.renderRunDate}
																	tdStyle={{ whiteSpace: "normal" }}
																	thStyle={{ whiteSpace: "normal" }}
																>
																	{strings.run_date}
																</TableHeaderColumn>
																<TableHeaderColumn
																	dataAlign="right"
																	className="table-header-bg"
																	dataField="totalAmountPayroll"
																	dataSort
																	width="15%"
																	dataFormat={this.renderPayrolltotalAmount}
																	tdStyle={{ whiteSpace: "normal" }}
																	thStyle={{ whiteSpace: "normal" }}
																>
																	{strings.am}
																</TableHeaderColumn>
																<TableHeaderColumn
																	className="table-header-bg"
																	dataField="comment"
																	dataSort
																	columnTitle={this.columnHover}
																	dataFormat={this.renderComment}

																>
																	{strings.reason}
																</TableHeaderColumn>


															</BootstrapTable>
														</div>

													</Col>

												</Row>
											)}

										</div>
									</div>
								</CardBody>
							</Card>
						</div>
						{/* <PayrollModal
					openPayrollModal={this.state.openPayrollModal}
					closePayrollModal={(e) => {
						this.closePayrollModal(e);
					}}
					updateParentLop={
						(e, e1) => {
							this.updateParentLop(e, e1);
						}}
					selectedData={this.state.selectedData}
					employeename={this.state.selectedData.employeeName}
					netPay={this.state.selectedData.netPay}
					noOfDays={this.state.noOfDays}
					current_employee={this.state.current_employee}
					lop={this.state.lop}
					updateEmployeeSalary={this.props.payRollActions.updateSalaryComponentAsNoOfDays}


				/> */}
						<CreateCompanyDetails
							openModal={this.state.openModal}
							closeModal={(e) => {
								this.closeModal(e);
							}}
						/>
					</div>
				</div>
		);
	}
}


export default connect(mapStateToProps, mapDispatchToProps)(PayrollRun);
