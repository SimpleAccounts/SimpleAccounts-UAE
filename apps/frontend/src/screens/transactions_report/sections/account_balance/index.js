import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Row,
	Col,
	FormGroup,
	Form,
	Input,
	ButtonGroup,
} from 'reactstrap';

import Select from 'react-select';
import { DateRangePicker2, Currency } from 'components';
import moment from 'moment';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';

import * as accountBalanceData from '../../actions';
import { selectOptionsFactory } from 'utils';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
// import 'react-select/dist/react-select.css'
import 'bootstrap-daterangepicker/daterangepicker.css';
import './style.scss';

const mapStateToProps = (state) => {
	return {
		account_balance_report: state.transaction_data.account_balance_report,
		transaction_type_list: state.transaction_data.transaction_type_list,
		transaction_category_list: state.transaction_data.transaction_category_list,
		account_type_list: state.transaction_data.account_type_list,
		universal_currency_list: state.common.universal_currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		accountBalanceData: bindActionCreators(accountBalanceData, dispatch),
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

// const colourOptions = [
//   { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
//   { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
//   { value: 'purple', label: 'Purple', color: '#5243AA' },
//   { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
//   { value: 'orange', label: 'Orange', color: '#FF8B00' },
//   { value: 'yellow', label: 'Yellow', color: '#FFC400' },
//   { value: 'green', label: 'Green', color: '#36B37E' },
//   { value: 'forest', label: 'Forestasd fsad fas fsad fsad fsa', color: '#00875A' },
//   { value: 'slate', label: 'Slate', color: '#253858' },
//   { value: 'silver', label: 'Silver', color: '#666666' },
// ]

const ranges = {
	'Last 7 Days': [moment().subtract(6, 'days'), moment()],
	'Last 30 Days': [moment().subtract(29, 'days'), moment()],
	'This Week': [moment().startOf('week'), moment().endOf('week')],
	'This Month': [moment().startOf('month'), moment().endOf('month')],
	'Last Month': [
		moment().subtract(1, 'month').startOf('month'),
		moment().subtract(1, 'month').endOf('month'),
	],
};

class AccountBalances extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedType: '',
			selectedCategory: '',
			filter_type: '',
			filter_category: '',
			filter_account: '',
			startDate: '',
			endDate: '',
			universal_currency_list: this.props.universal_currency_list,
			filterData: {
				filter_type: '',
				filter_category: '',
				filter_account: '',
				startDate: '',
				endDate: '',
			},
			initValue: {
				startDate: moment().startOf('month').format('DD-MM-YYYY'),
				endDate: moment().endOf('month').format('DD-MM-YYYY'),
			},
		};
	}

	componentDidMount = () => {
		this.getAccountBalanceData();
	};
	getAccountBalanceData = () => {
		const { initValue } = this.state;
		const postData = {
			startDate: initValue.startDate,
			endDate: initValue.endDate,
		};
		this.props.accountBalanceData.getAccountBalanceReport(postData);
		this.props.accountBalanceData.getAccountTypeList();
	};

	changeType = (selectedType) => {
		this.setState({ selectedType });
	};

	changeCategory = (selectedCategory) => {
		this.setState({ selectedCategory });
	};

	getSelectedData = () => {
		const postObj = {
			filter_type:
				this.state.filterData.filter_type !== ''
					? this.state.filterData.filter_type
					: '',
			filter_category:
				this.state.filterData.filter_category !== ''
					? this.state.filterData.filter_category
					: '',
			filter_account:
				this.state.filterData.filter_account !== ''
					? this.state.filterData.filter_account
					: '',
			startDate:
				this.state.filterData.startDate !== ''
					? moment(this.state.filterData.startDate).format('DD-MM-YYYY')
					: '',
			endDate:
				this.state.filterData.endDate !== ''
					? moment(this.state.filterData.endDate).format('DD-MM-YYYY')
					: '',
		};
		this.props.accountBalanceData.getAccountBalanceReport(postObj);
	};

	handleChange = (val, name) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: val,
			}),
		});
	};
	transactionAmount(cell, row, extraData) {
		return row.transactionAmount ? (
			<Currency
				value={row.transactionAmount}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		) : (
			row.transactionAmount
		);
	}
	render() {
		const account_balance_table = this.props.account_balance_report
			? this.props.account_balance_report.map((account) => ({
					account: account.bankAccount,
					transactionType: account.transactionType,
					transactionDescription: account.transactionDescription,
					transactionCategory: account.transactionCategory,
					transactionAmount: account.transactionAmount,
					transactionDate: moment(account.transactionDate).format('DD-MM-YYYY'),
					transactionId: account.transactionId,
			  }))
			: '';

		const { account_type_list, universal_currency_list } = this.props;
		const { filterData } = this.state;

		return (
			<div className="transaction-report-section">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<div className="flex-wrap d-flex align-items-start justify-content-between">
								<div className="info-block">
									<h4>
										{/* Company Name -{' '} */}
										<small>{/* <i>Transactions</i> */}</small>
									</h4>
								</div>
								<Form onSubmit={this.handleSubmit} name="simpleForm">
									<div className="flex-wrap d-flex align-items-center">
										<FormGroup>
											<ButtonGroup className="mr-3">
												<Button
													color="primary"
													className="btn-square"
													onClick={() => this.table.handleExportCSV()}
												>
													<i className="fa glyphicon glyphicon-export fa-download mr-1" />
													Export to CSV
												</Button>
											</ButtonGroup>
										</FormGroup>
										{/* <FormGroup>
											<div className="date-range">
												<DateRangePicker2 ranges={ranges} opens={'left'} />
											</div>
										</FormGroup> */}
									</div>
								</Form>
							</div>
							<div className="py-3">
								<h5>Filter : </h5>
								<Row>
									<Col lg={2} className="mb-1">
										<DatePicker
											className="form-control"
											id="startDate"
											name="startDate"
											placeholderText="Start Date"
											showMonthDropdown
											showYearDropdown
											autoComplete="off"
											dropdownMode="select"
											dateFormat="dd-MM-yyyy"
											selected={filterData.startDate}
											onChange={(value) => {
												this.handleChange(value, 'startDate');
											}}
										/>
									</Col>
									<Col lg={2} className="mb-1">
										<DatePicker
											id="endDate"
											name="endDate"
											className="form-control"
											placeholderText="End Date"
											showMonthDropdown
											showYearDropdown
											dropdownMode="select"
											dateFormat="dd-MM-yyyy"
											selected={filterData.endDate}
											onChange={(value) => {
												this.handleChange(value, 'endDate');
											}}
										/>
									</Col>

									<Col lg={2} className="mb-1">
										<Select
											styles={customStyles}
											className=""
											options={
												account_type_list
													? selectOptionsFactory.renderOptions(
															'name',
															'id',
															account_type_list,
															'Account',
													  )
													: []
											}
											// options={colourOptions}
											placeholder="Account"
											value={filterData.filter_account}
											onChange={(option) => {
												if (option && option.value) {
													this.handleChange(option, 'filter_account');
												} else {
													this.handleChange('', 'filter_account');
												}
											}}
										/>
									</Col>
									{/* <Col lg={2} className="mb-1">
										<Select
											className=""
											// options={colourOptions}
											options={
												transaction_type_list
													? selectOptionsFactory.renderOptions(
															'transactionTypeName',
															'transactionTypeCode',
															transaction_type_list,
													  )
													: []
											}
											value={this.state.filter_type}
											placeholder="Transaction Type"
											onChange={(option) =>
												this.setState({
													filter_type: option,
												})
											}
										/>
									</Col>
									<Col lg={2} className="mb-1">
										<Select
											className=""
											options={
												transaction_category_list
													? selectOptionsFactory.renderOptions(
															'transactionCategoryName',
															'transactionCategoryId',
															transaction_category_list,
													  )
													: []
											}
											// options={colourOptions}
											value={this.state.filter_category}
											placeholder="Transaction Category"
											onChange={(option) =>
												this.setState({
													filter_category: option,
												})
											}
											// onChange={this.changeType}
										/>
									</Col> */}
									<Col lg={3} className="mb-1">
										<Button
											type="button"
											color="primary"
											className="btn-square mr-1"
											onClick={this.handleSearch}
										>
											<i className="fa fa-search"></i>
										</Button>
										<Button
														type="button"
														color="primary"
														className="btn-square"
														onClick={this.clearAll}
													>
														<i className="fa fa-refresh"></i>
													</Button>
									</Col>
								</Row>
							</div>
							<div className="table-wrapper">
								<BootstrapTable
									data={account_balance_table}
									hover
									pagination={
										account_balance_table && account_balance_table.length > 0
											? true
											: false
									}
									fetchInfo={{
										dataTotalSize: account_balance_table.count
											? account_balance_table.count
											: 0,
									}}
									keyField="transactionId"
									csvFileName="account_balance_table.csv"
									ref={(node) => {
										this.table = node;
									}}
									version="4"
								>
									<TableHeaderColumn thStyle={{ whiteSpace: 'normal' }} dataField="transactionDate" dataSort>
										Transaction Date
									</TableHeaderColumn>
									<TableHeaderColumn thStyle={{ whiteSpace: 'normal' }} dataField="account" dataSort>
										Account
									</TableHeaderColumn>
									<TableHeaderColumn thStyle={{ whiteSpace: 'normal' }} dataField="transactionType" dataSort>
										Transaction Type
									</TableHeaderColumn>
									<TableHeaderColumn thStyle={{ whiteSpace: 'normal' }}dataField="transactionCategory" dataSort>
										Transaction Category
									</TableHeaderColumn>
									<TableHeaderColumn
									thStyle={{ whiteSpace: 'normal' }}
										dataField="transactionDescription"
										dataSort
									>
										Transaction Description
									</TableHeaderColumn>
									<TableHeaderColumn
									thStyle={{ whiteSpace: 'normal' }}
										dataField="transactionAmount"
										dataSort
										dataFormat={this.transactionAmount}
										formatExtraData={universal_currency_list}
									>
										Transaction Amount
									</TableHeaderColumn>
								</BootstrapTable>
							</div>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountBalances);
