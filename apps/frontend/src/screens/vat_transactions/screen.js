import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	FormGroup,
	Form,
	ButtonGroup,
	Input,
} from 'reactstrap';

import Select from 'react-select';
import { DateRangePicker2, Currency } from 'components';
import moment from 'moment';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as VatTransactionActions from './actions';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { CommonActions } from 'services/global';
import './style.scss';
import DatePicker from 'react-datepicker';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';


const mapStateToProps = (state) => {
	return {
		vat_transaction_list: state.vat_transactions.vat_transaction_list,
		universal_currency_list: state.common.universal_currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		vatTransactionActions: bindActionCreators(VatTransactionActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

const vatOptions = [
	{ value: 'input', label: 'Input' },
	{ value: 'output', label: 'Output' },
	{ value: 'all', label: 'All' },
];
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

const tempdata = [
	{
		transactionDate: '10/15/2019',
		transactionCategoryId: 2,
		transactionCategoryCode: 2,
		transactionCategoryName: 'temp',
		transactionCategoryDescription: 'temp',
		parentTransactionCategory: 'Loream Ipsume',
		transactionType: 'TEMP',
	},
	{
		transactionDate: '10/15/2019',
		transactionCategoryId: 1,
		transactionCategoryCode: 4,
		transactionCategoryName: 'temp',
		transactionCategoryDescription: 'temp',
		parentTransactionCategory: 'Loream Ipsume',
		transactionType: 'TEMP',
	},
	{
		transactionDate: '10/15/2019',
		transactionCategoryId: 1,
		transactionCategoryCode: 4,
		transactionCategoryName: 'temp',
		transactionCategoryDescription: 'temp',
		parentTransactionCategory: 'Loream Ipsume',
		transactionType: 'TEMP',
	},
	{
		transactionDate: '10/15/2019',
		transactionCategoryId: 1,
		transactionCategoryCode: 4,
		transactionCategoryName: 'temp',
		transactionCategoryDescription: 'temp',
		parentTransactionCategory: 'Loream Ipsume',
		transactionType: 'TEMP',
	},
	{
		transactionDate: '10/15/2019',
		transactionCategoryId: 1,
		transactionCategoryCode: 4,
		transactionCategoryName: 'temp',
		transactionCategoryDescription: 'temp',
		parentTransactionCategory: 'Loream Ipsume',
		transactionType: 'TEMP',
	},
	{
		transactionDate: '10/15/2019',
		transactionCategoryId: 1,
		transactionCategoryCode: 4,
		transactionCategoryName: 'temp',
		transactionCategoryDescription: 'temp',
		parentTransactionCategory: 'Loream Ipsume',
		transactionType: 'TEMP',
	},
	{
		transactionDate: '10/15/2019',
		transactionCategoryId: 1,
		transactionCategoryCode: 4,
		transactionCategoryName: 'temp',
		transactionCategoryDescription: 'temp',
		parentTransactionCategory: 'Loream Ipsume',
		transactionType: 'TEMP',
	},
];

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

let strings = new LocalizedStrings(data);
class VatTransactions extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			selectedVat: '',
			selectedStatus: '',
			filterData: {
				vat_type: '',
				reference_type: '',
				date: '',
			},
		};
		this.options = {
			paginationPosition: 'bottom',
			page: '',
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		};

		// this.selectRowProp = {
		// 	mode: 'checkbox',
		// 	bgColor: 'rgba(0,0,0, 0.05)',
		// 	clickToSelect: false,
		// 	onSelect: this.onRowSelect,
		// 	onSelectAll: this.onSelectAll,
		// };
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = (search) => {
		const { filterData } = this.state;
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };
		this.props.vatTransactionActions
			.vatTransactionList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ loading: false }, () => {
						if (this.props.location.state && this.props.location.state.id) {
							this.openInvoicePreviewModal(this.props.location.state.id);
						}
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	changeVat = (selectedVat) => {
		this.setState({ selectedVat });
	};

	changeStatus = (selectedStatus) => {
		this.setState({ selectedStatus });
	};

	getAction = (cell, row) => {
		return <button className="btn">Detail</button>;
	};

	renderAmount(cell, row, extraData) {
		// return row.amount ? (
		// 	<Currency
		// 		value={row.amount}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	row.amount
		// );
		return row.amount === 0 ? (
			<Currency
				value={row.amount}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		) : (
			<Currency
				value={row.amount}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		);
	}

	renderVatAmount(cell, row, extraData) {
		// return row.vatAmount ? (
		// 	<Currency
		// 		value={row.vatAmount}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	row.vatAmount
		// );
		return row.vatAmount === 0 ? (
			<Currency
				value={row.vatAmount}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		) : (
			<Currency
				value={row.vatAmount}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		);
	}
	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
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

	handleChange = (val, name) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: val,
			}),
		});
	};
	renderDate = (cell, row) => {
		return typeof row['effectiveDate'] === 'string'
		? moment(row['effectiveDate'], 'DD-MM-YYYY').format('DD-MM-YYYY')
		: moment(row['effectiveDate']).format('DD-MM-YYYY');
	};

	render() {
		strings.setLanguage(this.state.language);
		// const vat_transaction_data =
		// 	this.props.vat_transaction_list && this.props.vat_transaction_list.data
		// 		? this.props.vat_transaction_list.data.map((data) => ({
		// 				id: data.id,
		// 				amount: data.amount,
		// 				date: data.date ? moment(data.date).format('DD-MM-YYYY') : '',
		// 				referenceType: data.referenceType,
		// 				vatAmount: data.vatAmount,
		// 				vatType: data.vatType,
		// 		  }))
		// 		: '';
		const { universal_currency_list,vat_transaction_list } = this.props;
		const { filterData } = this.state;
		return (
			<div className="vat-transactions-screen ">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fas fa-exchange-alt" />
										<span className="ml-2">{strings.VAT+" "+strings.Transaction}</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							<Form onSubmit={this.handleSubmit} name="simpleForm">
								<div className="flex-wrap d-flex justify-content-end">
									<FormGroup>
										<ButtonGroup className="mr-3">
											<Button
												color="primary"
												className="btn-square"
												onClick={() => this.table.handleExportCSV()}
											>
												<i className="fa glyphicon glyphicon-export fa-download mr-1" />
												{strings.Export}
											</Button>
										</ButtonGroup>
									</FormGroup>
									
								</div>
							</Form>
							{/* <div className="py-3">
								<h5>Filter : </h5>
								<Row>
									<Col lg={2} className="mb-1">
										<DatePicker
											className="form-control"
											id="date"
											name="date"
											placeholderText="Date"
											showMonthDropdown
											showYearDropdown
											autoComplete="off"
											dropdownMode="select"
											dateFormat="dd-MM-yyyy"
											selected={filterData.date}
											onChange={(value) => {
												this.handleChange(value, 'date');
											}}
										/>
									</Col>
									<Col lg={2} className="mb-1">
										<Select
											styles={customStyles}
											className=""
											options={vatOptions}
											value={filterData.vat_type}
											placeholder="VAT Type"
											onChange={(option) => {
												if (option && option.value) {
													this.handleChange(option, 'vat_type');
												} else {
													this.handleChange('', 'vat_type');
												}
											}}
										/>
									</Col>
									<Col lg={2} className="mb-1">
										<Select
											styles={customStyles}
											className=""
											options={vatOptions}
											value={filterData.reference_type}
											value={this.state.selectedType}
											placeholder="Reference Type"
											onChange={(option) => {
												if (option && option.value) {
													this.handleChange(option, 'reference_type');
												} else {
													this.handleChange('', 'reference_type');
												}
											}}
										/>
									</Col>
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
							</div> */}
							<div className="table-wrapper">
								{/* <BootstrapTable
									data={
										vat_transaction_list &&
										vat_transaction_list.data
											? vat_transaction_list.data
											: []
									}
									hover
									remote
									keyField="id"
									pagination={
										vat_transaction_list &&
										vat_transaction_list.data &&
										vat_transaction_list.data.length
											? true
											: false
									}
									fetchInfo={{
										dataTotalSize: vat_transaction_list.count
											? vat_transaction_list.count
											: 0,
									}}
									csvFileName="VatTransactionReport.csv"
									ref={(node) => {
										this.table = node;
									}}
								> */}
									<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												data={
													vat_transaction_list &&
													vat_transaction_list.data
														? vat_transaction_list.data
														: []
												}
												version="4"
												hover
												keyField="journalId"
												pagination={
													vat_transaction_list &&
													vat_transaction_list.data &&
													vat_transaction_list.data.length > 0
														? true
														: false
												}
												remote
												fetchInfo={{
													dataTotalSize: vat_transaction_list.count
														? vat_transaction_list.count
														: 0,
												}}
												className="journal-table"
												trClassName="cursor-pointer"
												csvFileName="VatAuditReport.csv"
												ref={(node) => {
													this.table = node;
												}}
											>
									{/* <TableHeaderColumn 
									dataField="date" 
									className="table-header-bg"
									dataSort
									>
										Date
									</TableHeaderColumn> */}
									<TableHeaderColumn 
									dataSort
									dataField='customerName' 
									className="table-header-bg"
									>{strings.CustomerName}
									</TableHeaderColumn>
									<TableHeaderColumn
									dataField='countryName'
									dataSort
									className="table-header-bg"
									>{strings.Country}
									</TableHeaderColumn>
									<TableHeaderColumn
									dataSort
									 dataField='invoiceDate'
									 className="table-header-bg"
									 >{strings.InvoiceDate}
									 </TableHeaderColumn>
									 <TableHeaderColumn
									dataSort
									 dataField='invoiceNumber' 
									 className="table-header-bg"
									 >{strings.InvoiceNumber}
									 </TableHeaderColumn>
									 <TableHeaderColumn
									dataSort
									 dataField='taxRegistrationNo' 
									 className="table-header-bg"
									 >{strings.TaxRegistrationNumber}
									 </TableHeaderColumn>
									<TableHeaderColumn 
									dataSort
									dataField="referenceType" 
									className="table-header-bg">
									{strings.Reference+" "+strings.Type} 
									</TableHeaderColumn>
									<TableHeaderColumn 
									dataField="vatType" 
									className="table-header-bg"
									>
										{strings.VAT+" "+strings.Type}
									</TableHeaderColumn>
									<TableHeaderColumn
									dataSort
										dataField="amount"
										dataFormat={this.renderAmount}
										formatExtraData={universal_currency_list}
										className="table-header-bg"
									>
										{strings.Amount}
									</TableHeaderColumn>
									<TableHeaderColumn
									dataSort
										dataField="vatAmount"
										dataFormat={this.renderVatAmount}
										formatExtraData={universal_currency_list}
										className="table-header-bg"
									>
									   {strings.VatAmount }
									</TableHeaderColumn>
								</BootstrapTable>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(VatTransactions);
