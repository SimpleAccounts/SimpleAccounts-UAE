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
	Input,
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Loader, ConfirmDeleteModal, Currency } from 'components';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import * as DebitNotesActions from './actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import { data } from '../Language/index'
import LocalizedStrings from 'react-localization';
import { upperCase } from 'lodash';
import moment from 'moment';

const { ToWords } = require('to-words');
const toWords = new ToWords({
	localeCode: 'en-IN',
	converterOptions: {
		ignoreDecimal: false,
		ignoreZeroCurrency: false,
		doNotAddOnly: false,
	}
});
const mapStateToProps = (state) => {
	return {
		debit_note_list: state.debit_notes.debit_note_list,
		customer_list: state.common.customer_list,
		status_list: state.debit_notes.status_list,
		universal_currency_list: state.common.universal_currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		debitNotesActions: bindActionCreators(DebitNotesActions, dispatch,),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class DebitNotes extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			dialog: false,
			actionButtons: {},
			filterData: {
				customerId: '',
				referenceNumber: '',
				debitNoteDate: '',
				invoiceDueDate: '',
				amount: '',
				status: '',
				contactType: 1,
			},
			selectedRows: [],
			selectedId: '',
			csvData: [],
			view: false,
			overDueAmountDetails: {
				overDueAmount: '',
				overDueAmountWeekly: '',
				overDueAmountMonthly: '',
			},
			debit_note_list: [],
			rowId: '',
			currentPage: 1,
		};

		this.options = {
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

	componentDidMount = () => {
		let { filterData } = this.state;
		this.props.debitNotesActions.getStatusList();
		this.props.commonActions.getCustomerList(filterData.contactType);
		this.initializeData();
		this.getOverdue();
	};

	getOverdue = () => {
		let { filterData } = this.state;
		this.props.debitNotesActions
			.getOverdueAmountDetails(filterData.contactType)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ overDueAmountDetails: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',strings.SomethingWentWrong,
				);
				this.setState({ loading: false });
			});
	};

	initializeData = (search) => {
		let { filterData, currentPage } = this.state;
		const paginationData = {
			pageNo: currentPage - 1,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };
		this.props.debitNotesActions
			.getdebitNotesList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ loading: false });
				}
			})
			.catch((err) => {
				this.setState({ loading: false })
				this.props.commonActions.tostifyAlert(
					'error',strings.SomethingWentWrong,
				);
			});
	};

	componentWillUnmount = () => {
		this.setState({
			selectedRows: [],
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

	debitNoteposting = (row, markAsSent) => {
		const postingRequestModel = {
			amount: row.invoiceAmount,
			postingRefId: row.id,
			postingRefType: 'DEBIT_NOTE',
			isCNWithoutProduct: row.isCNWithoutProduct == true ? true : false,
			amountInWords: upperCase(row.currencyName + " " + (toWords.convert(row.totalAmount)) + " ONLY").replace("POINT", "AND"),
			vatInWords: row.totalVatAmount && parseFloat(row.totalVatAmount) > 0 ? upperCase(row.currencyName + " " + (toWords.convert(row.totalVatAmount)) + " ONLY").replace("POINT", "AND") : "-",
			markAsSent: markAsSent
		};
		this.setState({ loading: true, loadingMsg: strings.PostingDebitNote___ });
		this.props.debitNotesActions
			.debitNoteposting(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',strings.DebitNoteStatusChangedSuccessfully
					);
					this.setState({
						loading: false,
					});
					this.initializeData();
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert('error', strings.DebitNoteStatusChangedUnsuccessfully);
				this.setState({ loading: false, });
			});
	};

	unPostDebitNote = (row) => {
		const postingRequestModel = {
			amount: row.invoiceAmount,
			postingRefId: row.id,
			postingRefType: 'DEBIT_NOTE',
			isCNWithoutProduct: row.isCNWithoutProduct == true ? true : false,
			amountInWords: upperCase(row.currencyName + " " + (toWords.convert(row.totalAmount)) + " ONLY").replace("POINT", "AND"),
			vatInWords: row.totalVatAmount && parseFloat(row.totalVatAmount) > 0 ? upperCase(row.currencyName + " " + (toWords.convert(row.totalVatAmount)) + " ONLY").replace("POINT", "AND") : "-",
			markAsSent: false
		};
		this.setState({ loading: true, loadingMsg: strings.UnpostingDebitNote___ });

		this.props.debitNotesActions
			.unPostDebitNote(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert('success',strings.DebitNoteMovedToDraftSuccessfully);
					this.setState({
						loading: false,
					});
					this.getOverdue();
					this.initializeData();
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',strings.DebitNoteMovedToDraftUnsuccessfully
				);
				this.setState({
					loading: false,
				});
			});
	};

	rendercreditNoteNumber = (cell, row) => {
		return (
			<label
				className="mb-0 my-link"
				onClick={() =>
					this.props.history.push('/admin/income/customer-invoice/detail')
				}
			>
				{row.transactionCategoryName}
			</label>
		);
	};


	renderInvoiceStatus = (cell, row) => {
		let classname = '';
		if (row.status) {
			if (row.status === 'Closed') {
				classname = 'label-closed';
			} else if (row.status === 'Draft') {
				classname = 'label-draft';
			} else if (row.status === 'Partially Paid') {
				classname = 'label-PartiallyPaid';
			} else if (row.status === 'Open') {
				classname = 'label-posted';
			} else {
				classname = 'label-overdue';
			}
			return (
				<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
					{row.status === 'Partially Paid' ? 'Partially Debited' : row.status}
				</span>
			);
		}
	};

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

	renderamount = (cell, row, extraData) => {
		return (
			<div>
				<div>
					<label className="font-weight-bold mr-2 ">{strings.Amount}: </label>
					<label>
						{row.totalAmount ? row.currencyName + " " + row.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '0.00'}
					</label>
				</div>
				<div>
					<label className="font-weight-bold mr-2 ">Remaining Balance: </label>
					<label>
						{row.dueAmount ? row.currencyName + " " + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '0.00'}
					</label>
				</div>
			</div>);
	};
	renderCurrency = (cell, row) => {
		if (row.currencyCode) {
			return (
				<label className="badge label-currency mb-0">{row.currencyCode}</label>
			);
		} else {
			return <label className="badge badge-danger mb-0">No Specified</label>;
		}
	};
	invoiceDueDate = (cell, row) => {
		return row.invoiceDueDate ? row.invoiceDueDate : '';
	};
	debitNoteDate = (cell, row) => {
		return row.creditNoteDate ? moment(row.creditNoteDate).format('DD-MM-YYYY') : '';
	};
	renderDueAmount = (cell, row, extraData) => {
		return row.dueAmount === 0 ? row.currencyCode + " " + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : row.currencyCode + " " + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 });
	}
	renderActions = (cell, row) => {
		return (
			<div>
				<ButtonDropdown
					isOpen={this.state.actionButtons[row.id]}
					toggle={() => this.toggleActionButton(row.id)}
				>

					<DropdownToggle size="sm" color="primary" className="btn-brand icon">
						{this.state.actionButtons[row.id] === true ? (
							<i className="fas fa-chevron-up" />
						) : (
							<i className="fas fa-chevron-down" />
						)}
					</DropdownToggle>
					<DropdownMenu right>
						{row.statusEnum === 'Open' && <DropdownItem
							onClick={() =>
								this.unPostDebitNote(row)
							}
						>
							<i className="fas fa-file" />  {strings.Draft}
						</DropdownItem>}
						{row.statusEnum !== 'Closed' && row.statusEnum !== 'Open' && row.statusEnum !== 'Partially Paid' && (
							<DropdownItem>
								<div
									onClick={() => {
										this.props.history.push(
											'/admin/expense/debit-notes/update',
											{ id: row.id, isCNWithoutProduct: row.isCNWithoutProduct },
										);
									}}
								>
									<i className="fas fa-edit" /> {strings.Edit}
								</div>
							</DropdownItem>
						)}
						{row.statusEnum == 'Draft' && (
							<DropdownItem
								onClick={() => {
									this.debitNoteposting(row, true);
								}}
							>
								<i className="far fa-arrow-alt-circle-right"></i>{strings.MarkAsOpen}
							</DropdownItem>
						)}

						{row.statusEnum !== 'Closed' && row.statusEnum !== 'Draft' && (
							<DropdownItem
								onClick={() =>
									this.props.history.push(
										'/admin/expense/debit-notes/refund',
										{ id: row },
									)
								}
							>
								<i className="fas fa-university" /> {strings.RefundPayment}
							</DropdownItem>
						)}

						{row.statusEnum !== 'Closed' && row.statusEnum !== 'Draft' && row.cnCreatedOnPaidInvoice !== true && (
							<DropdownItem>
								<div
									onClick={() => {

										this.props.history.push(
											'/admin/expense/debit-notes/applyToInvoice',
											{
												contactId: row.contactId, creditNoteId: row.id,
												debitNoteNumber: row.creditNoteNumber,
												referenceNumber: row.invoiceNumber,
												debitAmount: row.dueAmount,
												currency:row.currencyName,
											},
										);
									}}
								>
									<i className="fas fa-file-invoice"></i>{strings.ApplyToInvoice}
								</div>
							</DropdownItem>
						)}

						<DropdownItem
							onClick={() =>
								this.props.history.push('/admin/expense/debit-notes/view', {
									id: row.id, status: row.status, isCNWithoutProduct: row.isCNWithoutProduct
								})
							}
						>
							<i className="fas fa-eye" />  {strings.View}
						</DropdownItem>

					</DropdownMenu>
				</ButtonDropdown>
			</div>
		);
	};

	sendMail = (id) => {
		this.props.customerInvoiceActions
			.sendMail(id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Email Send Successfully',
					);
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Email Send Unsuccessfully',
				);
			});
	};

	onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.id);
		} else {
			this.state.selectedRows.map((item) => {
				if (item !== row.id) {
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
				tempList.push(item.id);
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	bulkDelete = () => {
		const { selectedRows } = this.state;
		const message1 = (
			<text>
				<b>Delete Customer Invoice?</b>
			</text>
		);
		const message =
			'This Customer Invoice will be deleted permanently and cannot be recovered. ';
		if (selectedRows.length > 0) {
			this.setState({
				dialog: (
					<ConfirmDeleteModal
						isOpen={true}
						okHandler={this.removeBulk}
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

	removeBulk = () => {
		this.removeDialog();
		let { selectedRows } = this.state;
		const { customer_invoice_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.props.customerInvoiceActions
			.removeBulk(obj)
			.then((res) => {
				if (res.status === 200) {
					this.initializeData();
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Customer Invoice Deleted Successfully'
					);
					if (customer_invoice_list && customer_invoice_list.length > 0) {
						this.setState({
							selectedRows: [],
						});
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Customer Invoice Deleted Unsuccessfully'
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	handleChange = (val, name) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: val,
			}),
		});
	};

	handleSearch = () => {
		this.setState({ currentPage: 1 }, () => {
   		this.initializeData();
 		});
	};
	closeInvoice = (id, status) => {
		if (status === 'Paid') {
			this.props.commonActions.tostifyAlert(
				'error',
				'Please delete the receipt first to delete the invoice',
			);
		} else {
			const message1 = (
				<text>
					<b>Delete Customer Invoice?</b>
				</text>
			);
			const message =
				'This Customer Invoice will be deleted permanently and cannot be recovered. ';
			this.setState({
				dialog: (
					<ConfirmDeleteModal
						isOpen={true}
						okHandler={() => this.removeInvoice(id)}
						cancelHandler={this.removeDialog}
						message={message}
						message1={message1}
					/>
				),
			});
		}
	};

	removeInvoice = (id) => {
		this.removeDialog();
		this.props.customerInvoiceActions
			.deleteInvoice(id)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Invoice Deleted Successfully'
				);
				this.initializeData();
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Invoice Deleted Unsuccessfully'
				);
			});
	};

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.customerInvoiceActions
				.getCustomerInvoiceList(obj)
				.then((res) => {
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
					customerId: '',
					referenceNumber: '',
					debitNoteDate: '',
					invoiceDueDate: '',
					amount: '',
					status: '',
					contactType: 2,
				},
				currentPage: 1
			},
			() => {
				this.initializeData();
			},
		);
	};

	renderInvoiceNumber = (cell, row) => {
		return (
			<>
				{row.invNumber}
			</>
		);
	};

	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			filterData,
			dialog,
			selectedRows,
			csvData,
			view,
		} = this.state;
		const {
			debit_note_list,
			universal_currency_list,
			customer_list,
		} = this.props;
		let tmpCustomer_list = []

		customer_list.map(item => {
			let obj = { label: item.label.contactName, value: item.value }
			tmpCustomer_list.push(obj)
		})
		return (
			loading == true ? <Loader /> :
				<div>
					<div className="customer-invoice-screen">
						<div className="animated fadeIn">
							{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="fa fa-credit-card" />
												<span className="ml-2"> Debit Notes</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									{dialog}
									{loading && (
										<Row>
											<Col lg={12} className="rounded-loader">
												<div>
													<Loader />
												</div>
											</Col>
										</Row>
									)}
									<Row>
										<Col lg={12}>

											<div className="d-flex justify-content-end">
												<ButtonGroup size="sm">

												</ButtonGroup>
											</div>
											<div className="py-3">
												<h5>{strings.Filter} : </h5>
												<Row>

												<Col lg={2} className="mb-1">
														<Select
															className="select-default-width"
															placeholder={strings.Select + strings.Supplier}
															id="customer"
															name="customer"
															options={
																tmpCustomer_list
																	? selectOptionsFactory.renderOptions(
																		'label',
																		'value',
																		tmpCustomer_list,
																		'Supplier',
																	)
																	: []
															}
															value={filterData.customerId}
															onChange={(option) => {
																if (option && option.value) {
																	this.handleChange(option, 'customerId');
																} else {
																	this.handleChange('', 'customerId');
																}
															}}
														/>
													</Col>

													<Col lg={2} className="mb-1">
														<Input
															maxLength="14,2"
															type="number"
															min="0"
															value={filterData.amount}
															placeholder={strings.Enter + strings.Amount}
															onChange={(e) => {
																this.handleChange(e.target.value, 'amount');
															}}
														/>
													</Col>

													<Col lg={2} className="pl-0 pr-0">
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
											<Row>
												<div style={{ width: "1560px" }}>
													<Button
														color="primary"
														className="btn-square pull-right mb-2"
														style={{ marginBottom: '10px' }}
														onClick={() =>
															this.props.history.push(
																'/admin/expense/debit-notes/create',
															)
														}
													>
														<i className="fas fa-plus mr-1" />
														{strings.AddNewDebitNote}
													</Button></div></Row>

											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												data={debit_note_list ? debit_note_list.data : []}
												version="4"
												hover
												responsive
												currencyList
												keyField="id"
												remote
												pagination={
													debit_note_list &&
														debit_note_list.count > 0
														? true
														: false
												}
												fetchInfo={{
													dataTotalSize: debit_note_list && debit_note_list.count
														? debit_note_list.count
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
												className="customer-invoice-table"
												csvFileName="Customer_Invoice.csv"
												ref={(node) => {
													this.table = node;
												}}
											>
												<TableHeaderColumn
													dataField="creditNoteNumber"
													dataSort
													className="table-header-bg"
												>

													Debit Note Number
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="customerName"
													className="table-header-bg"
													dataSort 
												>
													{strings.SUPPLIERNAME}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="invoiceNumber"
													dataFormat={this.renderInvoiceNumber}
													dataSort
													className="table-header-bg"
												>
													{strings.InvoiceNumber}
												</TableHeaderColumn>
												<TableHeaderColumn
												    dataField="invoiceDate"
													dataSort
													dataFormat={this.debitNoteDate}
													className="table-header-bg"
												>
													{strings.DATE}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="status"
													dataFormat={this.renderInvoiceStatus}
													dataSort
													className="table-header-bg"
												>
													{strings.STATUS}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataAlign="right"
													dataField="totalAmount"
													width="22%"
													dataSort
													dataFormat={this.renderamount}
													formatExtraData={universal_currency_list}
													className="table-header-bg"
												>
													{strings.AMOUNT}
												</TableHeaderColumn>

												<TableHeaderColumn
													className="table-header-bg text-right"
													columnClassName="text-right"
													width="50px"
													dataFormat={this.renderActions}
												></TableHeaderColumn>
											</BootstrapTable>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</div>
					</div>
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DebitNotes);
