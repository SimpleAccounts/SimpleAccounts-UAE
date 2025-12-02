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
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Loader, ConfirmDeleteModal ,SentInvoice} from 'components';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import EmailModal from './sections/email_template';
import * as CreditNotesActions from './actions';
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
		//   currency: true,
		ignoreDecimal: false,
		ignoreZeroCurrency: false,
		doNotAddOnly: false,
	}
});
const mapStateToProps = (state) => {
	return {
		customer_invoice_list: state.customer_invoice.customer_invoice_list,
		customer_list: state.customer_invoice.customer_list,
		status_list: state.customer_invoice.status_list,
		universal_currency_list: state.common.universal_currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		creditNotesActions: bindActionCreators(
			CreditNotesActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

const invoiceimage = require('assets/images/invoice/invoice.png');
const overWeekly = require('assets/images/invoice/week1.png');
const overduemonthly = require('assets/images/invoice/month.png');
const overdue = require('assets/images/invoice/due1.png');

let strings = new LocalizedStrings(data);
class CreditNotes extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			dialog: false,
			openEmailModal: false,
			actionButtons: {},
			filterData: {
				customerId: '',
				referenceNumber: '',
				invoiceDate: '',
				invoiceDueDate: '',
				amount: '',
				status: '',
				contactType: 2,
			},
			selectedRows: [],
			selectedId: '',
			openInvoicePreviewModal: false,
			csvData: [],
			view: false,
			overDueAmountDetails: {
				overDueAmount: '',
				overDueAmountWeekly: '',
				overDueAmountMonthly: '',
			},
			rowId: '',
			loadingMsg: "Loading...",
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
		this.props.creditNotesActions.getStatusList();
		this.props.creditNotesActions.getCustomerList(filterData.contactType);
		this.initializeData();
		this.getOverdue();
	};

	getOverdue = () => {
		let { filterData } = this.state;
		this.props.creditNotesActions
			.getOverdueAmountDetails(filterData.contactType)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ overDueAmountDetails: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ loading: false });
			});
	};

	sendMail = (row, markAsSent, sendAgain) => {
		const { invoiceAmount, currencyName,isCNWithoutProduct, totalVatAmount, id } = row;
		this.setState({
			dialog: (
				<SentInvoice
					invoiceAmount={invoiceAmount || 0}
					id={id}
					currencyName={currencyName || 'UAE'}
					vatAmount={totalVatAmount || 0}
					markAsSent={markAsSent}
					postingRefType={"CREDIT_NOTE"}
					setState={(value) => {
						this.setState({ sentInvoice: value, unSent: false, sendAgain: false })
						this.removeDialog();
					}}
					initializeData={() => {
						this.initializeData();
					}}
					documentTitle={strings.TaxCreditNote}
					unSent={false}
					sendAgain={sendAgain}
					mailPopupCard={!markAsSent || sendAgain}
					zatcaConfirmation={true}
					isCNWithoutProduct={isCNWithoutProduct}
				/>
			)
		})


	}
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
		this.props.creditNotesActions
			.getCreditNoteList(postData)
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
				this.setState({ loading: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
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

	creditNoteposting = (row, markAsSent) => {
		const postingRequestModel = {
			amount: row.invoiceAmount,
			postingRefId: row.id,
			postingRefType: 'CREDIT_NOTE',
			isCNWithoutProduct: row.isCNWithoutProduct == true ? true : false,
			amountInWords: upperCase(row.currencyName + " " + (toWords.convert(row.invoiceAmount)) + " ONLY").replace("POINT", "AND"),
			vatInWords: row.totalVatAmount ? upperCase(row.currencyName + " " + (toWords.convert(row.totalVatAmount)) + " ONLY").replace("POINT", "AND") : "-",
			markAsSent: markAsSent
		};
		this.setState({ loading: true, loadingMsg: "Posting Credit Note..." });
		this.props.creditNotesActions
			.creditNoteposting(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data = 'Credit Note Posted Successfully'
					);
					this.setState({
						loading: false,
					});
					this.initializeData();
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Credit Note Posted Unsuccessfully'
				);
				this.setState({
					loading: false,
				});
			});
	};



	unPostInvoice = (row) => {
		this.setState({
			loading: true,
		});
		const postingRequestModel = {
			amount: row.invoiceAmount,
			postingRefId: row.id,
			postingRefType: 'CREDIT_NOTE',
			isCNWithoutProduct: row.isCNWithoutProduct == true ? true : false,
			amountInWords: upperCase(row.currencyName + " " + (toWords.convert(row.invoiceAmount)) + " ONLY").replace("POINT", "AND"),
			vatInWords: row.totalVatAmount ? upperCase(row.currencyName + " " + (toWords.convert(row.totalVatAmount)) + " ONLY").replace("POINT", "AND") : "-",
			markAsSent: false
		};

		this.props.creditNotesActions
			.unPostInvoice(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						"Credit Note Moved To Draft Successfully "
					);
					this.setState({
						loading: false,
					});
					this.getOverdue();
					this.initializeData();
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Invoice Unposted Unsuccessfully'
				);
				this.setState({
					loading: false,
				});
			});
	};

	renderInvoiceNumber = (cell, row) => {
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
				{row.status === 'Partially Paid' ? 'Partially Credited' : row.status}
			</span>
		);
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

	renderInvoiceAmount = (cell, row, extraData) => {
		return (
			<div>
				<div>
					<label className="font-weight-bold mr-2 ">{strings.Amount}: </label>
					<label>
						{row.invoiceAmount === 0 ? row.currencyName + " " + row.invoiceAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.currencyName + " " + row.invoiceAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</label>
				</div>
				<div>
					<label className="font-weight-bold mr-2 ">{strings.RemainingBalance}: </label>
					<label>
						{row.dueAmount === 0 ? row.currencyName + " " + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.currencyName + " " + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</label>
				</div>


				{/* <div style={{display: row.dueAmount === 0 ? 'none' : ''}}>
					<label className="font-weight-bold mr-2">Due Amount : </label>
					<label>{row.dueAmount === 0  ? row.currencySymbol + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) : row.currencySymbol + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })}</label>
				</div> */}

			</div>);
	};
	renderCurrency = (cell, row) => {
		if (row.currencyName) {
			return (
				<label className="badge label-currency mb-0">{row.currencyName}</label>
			);
		} else {
			return <label className="badge badge-danger mb-0">No Specified</label>;
		}
	};
	invoiceDueDate = (cell, row) => {
		return row.invoiceDueDate ? row.invoiceDueDate : '';
	};
	invoiceDate = (cell, row) => {
		return row.invoiceDate ? moment(row.invoiceDate).format('DD-MM-YYYY') : '';
	};

	renderVatAmount = (cell, row, extraData) => {
		// return row.totalVatAmount === 0 ? (
		// 	<Currency
		// 		value={row.totalVatAmount}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	<Currency
		// 		value={row.totalVatAmount}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// );
		return row.totalVatAmount === 0 ? row.currencyName + " " + row.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.currencyName + " " + row.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	};

	renderDueAmount = (cell, row, extraData) => {
		return row.dueAmount === 0 ? row.currencyName + " " + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.currencyName + " " + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
								this.unPostInvoice(row)
							}
						>
							<i className="fas fa-file" />  {strings.Draft}
						</DropdownItem>}
						{row.statusEnum !== 'Closed' && row.statusEnum !== 'Open' && row.statusEnum !== 'Partially Paid' && (
							<DropdownItem>
								<div
									onClick={() => {
										this.props.history.push(
											'/admin/income/credit-notes/detail',
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
									this.sendMail(row, true, false);
								}}
							>
								<i className="far fa-arrow-alt-circle-right"></i>Mark As Sent
							</DropdownItem>
						)}
						{row.statusEnum !== 'Closed' && row.statusEnum !== 'Open' && row.statusEnum !== 'Partially Paid' && (
							<DropdownItem
								onClick={() => {
									this.sendMail(row, false, false);
								}}
							>
								<i className="fas fa-send" />  {strings.Send}
							</DropdownItem>
						)}

						{row.statusEnum !== 'Closed' && row.statusEnum !== 'Draft' && (
							<DropdownItem
								onClick={() =>
									this.props.history.push(
										'/admin/income/credit-notes/refund',
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
											'/admin/income/credit-notes/applyToInvoice',
											{
												contactId: row.contactId, creditNoteId: row.id,
												creditNoteNumber: row.creditNoteNumber,
												referenceNumber: row.invoiceNumber,
												creditAmount: row.dueAmount,
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
								this.props.history.push('/admin/income/credit-notes/view', {
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

	openInvoicePreviewModal = (id) => {
		this.setState(
			{
				selectedId: id,
			},
			() => {
				this.setState({
					openInvoicePreviewModal: true,
				});
			},
		);
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

	sendCustomEmail = (id) => {
		this.setState({ openEmailModal: true, rowId: id });
	};

	closeEmailModal = (res) => {
		this.setState({ openEmailModal: false });
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

	closeInvoicePreviewModal = (res) => {
		this.setState({ openInvoicePreviewModal: false });
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
					invoiceDate: '',
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

	render() {
		strings.setLanguage(this.state.language);
		const {
			loading, loadingMsg,
			filterData,
			dialog,
			selectedRows,
			csvData,
			view,
		} = this.state;
		const {
			status_list,
			customer_list,
			customer_invoice_list,
			universal_currency_list,
		} = this.props;
		const customer_invoice_data =
			this.props.customer_invoice_list.data
				? this.props.customer_invoice_list.data.map((customer) => ({
					id: customer.id,
					status: customer.status,
					statusEnum: customer.statusEnum,
					customerName: customer.customerName,
					dueAmount: customer.dueAmount ? customer.dueAmount : 0,
					contactId: customer.contactId,
					invoiceNumber: customer.invNumber,
					creditNoteNumber: customer.creditNoteNumber,
					invoiceDate: customer.creditNoteDate ? customer.creditNoteDate : '',
					invoiceDueDate: customer.invoiceDueDate
						? customer.invoiceDueDate
						: '',
					currencyName: customer.currencyName ? customer.currencyName : '',
					currencySymbol: customer.currencySymbol ? customer.currencySymbol : '',
					invoiceAmount: customer.totalAmount ? customer.totalAmount : 0,
					totalVatAmount: customer.totalVatAmount,
					cnCreatedOnPaidInvoice: customer.cnCreatedOnPaidInvoice,
					isCNWithoutProduct: customer.isCNWithoutProduct,
				}))
				: '';

		let tmpCustomer_list = []

		customer_list.map(item => {
			let obj = { label: item.label.contactName, value: item.value }
			tmpCustomer_list.push(obj)
		})

		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div>
					<div className="customer-invoice-screen">
						<div className="animated fadeIn">
							{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="nav-icon fas fa-donate" />

												{/* <img
											alt="invoiceimage"
											src={invoiceimage}
											style={{ width: '40px' }}
										/> */}
												<span className="ml-2"> {strings.CreditNotes}</span>
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
											{/* <div className="mb-4 status-panel p-3">
										<Row className="align-items-center justify-content-around">
											<div className="h4 mb-0 d-flex align-items-center ">
												<img
													alt="overdue"
													src={overdue}
													style={{ width: '60px' }}
												/>
												<div>
													<h5 className="ml-3">Overdue</h5>
													<h3 className="invoice-detail ml-3">
														{universal_currency_list[0] &&
														this.state.overDueAmountDetails.overDueAmount ? (
															<Currency
																value={
																	this.state.overDueAmountDetails.overDueAmount
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														) : (
															<Currency
																value={
																	this.state.overDueAmountDetails.overDueAmount
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														)}
													</h3>
												</div>
											</div>
											<div className="h4 mb-0 d-flex align-items-center">
												<img
													alt="overWeekly"
													src={overWeekly}
													style={{ width: '60px' }}
												/>
												<div>
													<h5 className="ml-3">Due Within This Week</h5>
													<h3 className="invoice-detail ml-3">
														{universal_currency_list[0] &&
														this.state.overDueAmountDetails
															.overDueAmountWeekly ? (
															<Currency
																value={
																	this.state.overDueAmountDetails
																		.overDueAmountWeekly
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														) : (
															<Currency
																value={
																	this.state.overDueAmountDetails
																		.overDueAmountWeekly
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														)}
													</h3>
												</div>
											</div>
											<div className="h4 mb-0 d-flex align-items-center">
												<img
													alt="overduemonthly"
													src={overduemonthly}
													style={{ width: '60px' }}
												/>
												<div>
													<h5 className="ml-3">Due Within 30 Days</h5>
													<h3 className="invoice-detail ml-3">
														{universal_currency_list[0] &&
														this.state.overDueAmountDetails
															.overDueAmountMonthly ? (
															<Currency
																value={
																	this.state.overDueAmountDetails
																		.overDueAmountMonthly
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														) : (
															<Currency
																value={
																	this.state.overDueAmountDetails
																		.overDueAmountMonthly
																}
																currencySymbol={
																	universal_currency_list[0]
																		? universal_currency_list[0].currencyIsoCode
																		: 'USD'
																}
															/>
														)}
													</h3>
												</div>
											</div>
										</Row>
									</div> */}
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
													filename={'CustomerInvoice.csv'}
													className="hidden"
													ref={this.csvLink}
													target="_blank"
												/>
											)} */}
													{/* <Button
												color="primary"
												className="btn-square "
												onClick={this.bulkDelete}
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
													<Col lg={2} className="mb-1">
														<Select
															className="select-default-width"
															placeholder={strings.Select + strings.Customer}
															id="customer"
															name="customer"
															options={
																tmpCustomer_list
																	? selectOptionsFactory.renderOptions(
																		'label',
																		'value',
																		tmpCustomer_list,
																		'Customer',
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
													{/* <Col lg={2} className="mb-1">
												<DatePicker
													className="form-control"
													id="date"
													name="invoiceDate"
													placeholderText={strings.CreditNoteDate}
													selected={filterData.invoiceDate}
													autoComplete="off"
													showMonthDropdown
													showYearDropdown
													dateFormat="dd-MM-yyyy"
													dropdownMode="select"
													value={filterData.invoiceDate}
													onChange={(value) => {
														this.handleChange(value, 'invoiceDate');
													}}
												/>
											</Col> */}

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
													{/* <Col lg={2} className="mb-1">
												<Select
													className=""
													options={
														status_list
															? selectOptionsFactory.renderOptions(
																	'label',
																	'value',
																	status_list,
																	'Status',
															  )
															: []
													}
													value={filterData.status}
													onChange={(option) => {
														if (option && option.value) {
															this.handleChange(option, 'status');
														} else {
															this.handleChange('', 'status');
														}
													}}
													placeholder={strings.Status}
												/>
											</Col> */}
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
																`/admin/income/credit-notes/create`,
															)
														}
													>
														<i className="fas fa-plus mr-1" />
														{strings.AddCreditNote}
													</Button></div></Row>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												data={customer_invoice_data ? customer_invoice_data.sort((a, b) => new Date(a.creditNoteDate) - new Date(b.creditNoteDate)) : []}
												version="4"
												hover
												responsive
												currencyList
												keyField="id"
												remote
												pagination={customer_invoice_data &&
															customer_invoice_data.length > 0
														}
												fetchInfo={{
													dataTotalSize: customer_invoice_list.count
														? customer_invoice_list.count
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
													// dataFormat={this.renderInvoiceNumber}
													dataSort
													//	width="7%"
													className="table-header-bg"
												>

													{strings.CREDITNOTE}
												</TableHeaderColumn>
												<TableHeaderColumn
													//width="22%"
													dataField="customerName"
													dataSort 
													className="table-header-bg"
												>
													{strings.CUSTOMERNAME}
												</TableHeaderColumn>

												<TableHeaderColumn
													dataField="invoiceNumber"
													// dataFormat={this.renderInvoiceNumber}
													dataSort
													//	width="7%"
													className="table-header-bg"
												>
													{strings.INVOICENUMBER}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="invoiceDate"
													dataSort
													//width="6%"
													dataFormat={this.invoiceDate}
													className="table-header-bg"
												>
													{strings.DATE}
												</TableHeaderColumn>

												<TableHeaderColumn
													//width="9%"
													dataField="status"
													dataFormat={this.renderInvoiceStatus}
													dataSort
													className="table-header-bg"
												>
													{strings.STATUS}
												</TableHeaderColumn>
												{/* <TableHeaderColumn
												dataField="regferenceNumber"
												// dataFormat={this.renderInvoiceNumber}
												dataSort
											//	width="7%"
												className="table-header-bg"
											>
													
											Reference Number 
											</TableHeaderColumn> */}
												{/* <TableHeaderColumn
												dataField="invoiceDueDate"
												dataSort
												//width="6%"
												dataFormat={this.invoiceDueDate}
												className="table-header-bg"
											>
												Due Date
											</TableHeaderColumn> */}

												{/* <TableHeaderColumn
												dataField="totalVatAmount"
												dataSort
												width="5%"
												dataFormat={this.renderVatAmount}
												formatExtraData={universal_currency_list}
												className="table-header-bg"
											>
												VAT Amount
											</TableHeaderColumn> */}
												<TableHeaderColumn
													dataAlign="right"
													dataField="totalAmount"
													dataSort
													width="22%"
													dataFormat={this.renderInvoiceAmount}
													formatExtraData={universal_currency_list}
													className="table-header-bg"
												>
													{strings.AMOUNT}
												</TableHeaderColumn>
												{/* <TableHeaderColumn
												dataField="dueamount"
												dataSort
												width="5%"
												dataFormat={this.renderDueAmount}
												formatExtraData={universal_currency_list}
												className="table-header-bg"
											>
												Due Amount
											</TableHeaderColumn> */}
												<TableHeaderColumn
													className="text-right table-header-bg"
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

export default connect(mapStateToProps, mapDispatchToProps)(CreditNotes);
