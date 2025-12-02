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
	ButtonGroup,
} from 'reactstrap';
import { selectOptionsFactory } from 'utils';
import Select from 'react-select';
// import { ToastContainer, toast } from 'react-toastify'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Loader, ConfirmDeleteModal } from 'components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { CommonActions } from 'services/global';
import * as PaymentActions from './actions';
import moment from 'moment';
import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		payment_list: state.payment.payment_list,
		supplier_list: state.payment.supplier_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		paymentActions: bindActionCreators(PaymentActions, dispatch),
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
class Payment extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			selectedRows: [],
			dialog: null,
			contactType: 1,
			filterData: {
				supplierId: '',
				paymentDate: '',
				invoiceAmount: '',
			},
			csvData: [],
			view: false,
			language: window['localStorage'].getItem('language'),
			currentPage: 1,
		};

		this.options = {
			//onRowClick: this.goToDetail,
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
			//mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};
		this.csvLink = React.createRef();
	}

	componentDidMount = () => {
		this.props.paymentActions.getSupplierContactList(this.state.contactType);
		this.initializeData();
	};

	initializeData = (search) => {
		let { filterData, currentPage} = this.state;
		const paginationData = {
			pageNo: currentPage - 1,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };

		this.props.paymentActions
			.getPaymentList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ loading: false });
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	goToDetail = (row) => {
		this.props.history.push('/admin/expense/payment/detail', {
			id: row.paymentId,
		});
	};

	bulkDeletePayments = () => {
		let { selectedRows } = this.state;
		const message1 =
			<text>
			<b>Delete Payments?</b>
			</text>
			const message = 'This Payments will be deleted permanently and cannot be recovered. ';
		if (selectedRows.length > 0) {
			this.setState({
				dialog: (
					<ConfirmDeleteModal
						isOpen={true}
						okHandler={this.removeBulkPayments}
						cancelHandler={this.removeDialog}
						message={message}
						message1={message1}
					/>
				),
			});
		} else {
			this.props.commonActions.tostifyAlert(
				'info',
				'Please select the rows of the table and try again.',
			);
		}
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	removeBulkPayments = () => {
		this.removeDialog();
		let { selectedRows } = this.state;
		let obj = {
			ids: selectedRows,
		};
		const { payment_list } = this.props;
		this.props.paymentActions
			.removeBulkPayments(obj)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					'Payment Receipt Deleted Successfully',
				);
				this.initializeData();
				if (payment_list.length > 0) {
					this.setState({
						selectedRows: [],
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

	onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.paymentId);
		} else {
			this.state.selectedRows.map((item) => {
				if (item !== row.paymentId) {
					tempList.push(item);
				}
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};
	onSelectAll = (isSelected, rows) => {
		let tempList = [];
		if (isSelected) {
			rows.map((item) => {
				tempList.push(item.paymentId);
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	renderDate = (cell, rows) => {
		return rows['paymentDate'] !== null
			? moment(rows['paymentDate']).format('DD-MM-YYYY')
			: '';
	};

	renderAmount = (cell, row) => {
	return row.invoiceAmount ? row.currencyIsoCode +" "+ row.invoiceAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '';
	};

	handleChange = (val, name) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: val,
			}),
		});
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
	handleSearch = () => {
		this.setState({ currentPage: 1 }, () => {
   		this.initializeData();
 		});
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

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.paymentActions.getPaymentList(obj).then((res) => {
				if (res.status === 200) {
					this.setState({ csvData: res.data.data, view: true }, () => {
						setTimeout(() => {
							this.csvLink.current.link.click();
						}, 0);
					});
				}
			});
		} else {
			this.csvLink.current.link.click();
		}
	};

	clearAll = () => {
		this.setState(
			{
				filterData: {
					supplierId: '',
					paymentDate: '',
					invoiceAmount: '',
				},
				currentPage: 1
			},
			() => {
				this.initializeData();
			},
		);
	};

	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			dialog,
			filterData,
			selectedRows,
			csvData,
			view,
		} = this.state;
		const { payment_list, supplier_list } = this.props;
		// const containerStyle = {
		//   zIndex: 1999
		// }

		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})

		return (
			loading ==true? <Loader/> :
<div>
			<div className="payment-screen">
				<div className="animated fadeIn">
					{dialog}
					{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fas fa-receipt" />
										<span className="ml-2">{strings.Purchasereceipts}</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
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
												{/* <Button
													color="primary"
													className="btn-square mr-1"
													onClick={() => this.getCsvData()}
												>
													<i className="fa glyphicon glyphicon-export fa-download mr-1" />
													Export To CSV
												</Button>
												{view && (
													<CSVLink
														data={csvData}
														filename={'Payment.csv'}
														className="hidden"
														ref={this.csvLink}
														target="_blank"
													/>
												)} */}
												{/* <Button
													color="primary"
													className="btn-square mr-1"
													onClick={this.bulkDeletePayments}
													disabled={selectedRows.length === 0}
												>
													<i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
													Bulk Delete
												</Button> */}
											</ButtonGroup>
										</div>
										<div className="py-3">
											<h5>{strings.Filter}: </h5>
											<Row>
												<Col lg={3} className="mb-1">
													<Select
														styles={customStyles}
														className="select-default-width"
														placeholder={strings.Select+strings.Supplier}  
														id="supplier"
														name="supplier"
														options={
															tmpSupplier_list
																? selectOptionsFactory.renderOptions(
																		'label',
																		'value',
																		tmpSupplier_list,
																		'Supplier Name',
																  )
																: []
														}
														value={filterData.supplierId}
														onChange={(option) => {
															if (option && option.value) {
																this.handleChange(option, 'supplierId');
															} else {
																this.handleChange('', 'supplierId');
															}
														}}
													/>
												</Col>
												<Col lg={2} className="mb-1">
													<DatePicker
														className="form-control"
														id="date"
														name="paymentDate"
														placeholderText={strings.PaymentDate}  
														selected={filterData.paymentDate}
														showMonthDropdown
														showYearDropdown
														autoComplete="off"
														dateFormat="dd-MM-yyyy"
														dropdownMode="select"
														value={filterData.paymentDate}
														onChange={(value) => {
															this.handleChange(value, 'paymentDate');
														}}
													/>
												</Col>
												{/* <Col lg={2} className="mb-1">
													<Input
														type="number"
														min="0"
														placeholder={strings.InvoiceAmount}  
														value={filterData.invoiceAmount}
														onChange={(e) =>
															this.handleChange(e.target.value, 'invoiceAmount')
														}
													/>
												</Col> */}
												<Col lg={3} className="pl-0 pr-0">
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
										{/* <Row>
										<div style={{ width: "1650px" }}>
											<Button
												color="primary"
												style={{ marginBottom: '10px' }}
												className="btn-square pull-right mb-2"
												onClick={() =>
													this.props.history.push(`/admin/expense/payment/create`)
												}
											>
												<i className="fas fa-plus mr-1" />
												{strings.AddNewReceipt}
											</Button>	
										</div>
										</Row>	 */}
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												data={
													payment_list && payment_list.data
														? payment_list.data
														: []
												}
												version="4"
												hover
												keyField="paymentId"
												pagination={
													payment_list &&
													payment_list.data &&
													payment_list.data.length > 0
														? true
														: false
												}
												remote
												fetchInfo={{
													dataTotalSize: payment_list.count
														? payment_list.count
														: 0,
												}}
												options={{
													...this.options,
													page: this.state.currentPage,
													onPageChange: (page) => {
													this.setState({ currentPage: page }, () => {
														this.initializeData();
													});
													},
												}}
												className="payment-table"
												trClassName="cursor-pointer"
												csvFileName="payment_list.csv"
												ref={(node) => {
													this.table = node;
												}}
											>
												<TableHeaderColumn
													dataField="paymentId"
													dataSort
													className="table-header-bg"
												>
													{strings.RECEIPTNUMBER}
												</TableHeaderColumn>
												<TableHeaderColumn 
												dataField="supplierName" 
												dataSort 
												className="table-header-bg"
												>
												{strings.SUPPLIERNAME}
												</TableHeaderColumn>	
												<TableHeaderColumn
													dataField="invoiceNumber"
													dataSort
												    className="table-header-bg"
												>
													{strings.INVOICENUMBER}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="receiptDate"
													dataSort
													dataFormat={this.renderDate}
													className="table-header-bg"
												>
													{strings.PAYMENTDATE}
												</TableHeaderColumn>
												
												{/* <TableHeaderColumn 
												width="10%"
												dataField="currencyIsoCode" 
												dataSort 
												className="table-header-bg" 
												dataFormat={this.renderCurrency}
												>
													{strings.CURRENCY}
												</TableHeaderColumn> */}
												<TableHeaderColumn
												width="10%"
													dataAlign="right"
													dataField="invoiceAmount"
													dataSort
													dataFormat={this.renderAmount}
													className="table-header-bg"
												>
													{strings.AMOUNT}
												</TableHeaderColumn>
											</BootstrapTable>
										</div>
									</Col>
								</Row>
							)}
						</CardBody>
					</Card>
				</div>
			</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Payment);
