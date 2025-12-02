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
import DatePicker from 'react-datepicker';
import { Loader, ConfirmDeleteModal, SentInvoice } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import EmailModal from './sections/email_template';
import * as CustomerInvoiceDetailActions from './screens/detail/actions'
import * as CustomerInvoiceActions from './actions';
import * as CreditNotesActions from '../creditNotes/screens/create/actions'
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import { data } from '../Language/index'
import LocalizedStrings from 'react-localization';
import './style.scss';
import { CreateCreditNoteModal } from './sections';
import moment from 'moment';
import { upperCase } from 'lodash';
import config from 'constants/config';

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
		customerInvoiceActions: bindActionCreators(
			CustomerInvoiceActions,
			dispatch,
		),
		customerInvoiceDetailActions: bindActionCreators(
			CustomerInvoiceDetailActions,
			dispatch,
		),
		creditNotesActions: bindActionCreators(
			CreditNotesActions,
			dispatch,
		),

		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);

const invoiceimage = require('assets/images/invoice/invoice.png');
const overWeekly = require('assets/images/invoice/week1.png');
const overduemonthly = require('assets/images/invoice/month.png');
const overdue = require('assets/images/invoice/due1.png');

class CustomerInvoice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openModal: false,
			loading: true,
			dialog: false,
			openEmailModal: false,
			prefixData: '',
			selectedData: {},
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
			language: window['localStorage'].getItem('language'),
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
		this.props.customerInvoiceActions.getStatusList();
		this.props.customerInvoiceActions.getCustomerList(filterData.contactType);
		this.initializeData();
		this.getOverdue();
	};

	getOverdue = () => {
		let { filterData } = this.state;
		this.props.customerInvoiceActions
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
	closeModal = (res) => {
		this.setState({ openModal: false });
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
		this.props.customerInvoiceActions
			.getCustomerInvoiceList(postData)
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


	stockInHandTestForProduct = (row, markAsSent) => {
		this.postInvoice(row, markAsSent);
		// this.props.customerInvoiceActions
		// 	.stockInHandTestForProduct(row.id)
		// 	.then((res) => {
		// 	 if (res.status == 200)
		// 		this.postInvoice(row,markAsSent);
		// 	})
		// 	.catch((error)=>{
		// 		if (error.status == 417)
		// 		{
		// 			this.props.commonActions.tostifyAlert(
		// 				'error',
		// 				'Invoice Can\'t Posted Because Some Products are Out Of Stock ',
		// 			);
		// 		}
		// 	})		
	}



	postInvoice = (row, markAsSent) => {

		const postingRequestModel = {
			amount: row.invoiceAmount,
			postingRefId: row.id,
			postingRefType: 'INVOICE',
			amountInWords: upperCase(row.currencyName + " " + (toWords.convert(row.invoiceAmount)) + " ONLY").replace("POINT", "AND"),
			vatInWords: row.vatAmount ? upperCase(row.currencyName + " " + (toWords.convert(row.vatAmount)) + " ONLY").replace("POINT", "AND") : "-",
			markAsSent: markAsSent
		};
		this.setState({ loading: true, loadingMsg: "Customer Invoice Posting..." });
		this.props.customerInvoiceActions
			.postInvoice(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					if (markAsSent === true) {
						this.props.commonActions.tostifyAlert(
							'success',
						    strings.InvoiceStatusChangedSuccessfully
						);	
					} else {
					this.props.commonActions.tostifyAlert(
						'success',
						strings.InvoiceSentSuccessfully
					)};
					this.setState({
						loading: false,
					});
					this.getOverdue();
					this.initializeData();
					this.setState({ loading: false, });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					'Customer Invoice Posted Unsuccessfully'
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
			postingRefType: 'INVOICE',
		};
		this.props.customerInvoiceActions
			.unPostInvoice(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						strings.InvoiceMovedToDraftSuccessfully
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
					'Invoice Moved To Draft Unsuccessfully!'
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
		if (row.status === 'Paid') {
			classname = 'label-success';
		} else if (row.status === 'Draft') {
			classname = 'label-currency';
		} else if (row.status === 'Partially Paid') {
			classname = 'label-PartiallyPaid';
		} else if (row.status === 'Due Today') {
			classname = 'label-due';
		} else {
			classname = 'label-overdue';
		}
		return (<>
			<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
				{row.status}
			</span>
			{
				row.cnCreatedOnPaidInvoice == true && (row.status == "Paid" || row.status == "Partially Paid") && (
					<><br />{strings.Credit_Note_Created}</>
				)
			}
		</>
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
	updateParentAmount = (totalAmount, totalVatAmount, totalexcise) => {
		this.setState({ totalAmount: totalAmount, totalVatAmount: totalVatAmount, totalExciseAmount: totalexcise })
	};
	updateParentSelelectedData = (data) => {
		this.setState({ selectedData: data })
	};
	renderInvoiceAmount = (cell, row, extraData) => {
		return (
			<div>
				<div>
					<label className="font-weight-bold mr-2 ">{strings.InvoiceAmount}: </label>
					<label>
						{row.invoiceAmount === 0 ? row.currencySymbol + " " + row.invoiceAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.currencySymbol + " " + row.invoiceAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

					</label>
				</div>
				<div style={{ display: row.vatAmount === 0 ? 'none' : '' }}>
					<label className="font-weight-bold mr-2">{strings.VatAmount}: </label>
					<label>{row.vatAmount === 0 ? row.currencySymbol + " " + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.currencySymbol + " " + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</label>
				</div>
				<div style={{ display: row.dueAmount === 0 ? 'none' : '' }}>
					<label className="font-weight-bold mr-2">{strings.DueAmount}: </label>
					<label>{row.dueAmount === 0 ? row.currencySymbol + " " + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.currencySymbol + " " + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</label>
				</div>

			</div>);
	};
	renderCurrency = (cell, row) => {
		if (row.currencySymbol) {
			return (
				<label className="badge label-currency mb-0">{row.currencySymbol}</label>
			);
		} else {
			return <label className="badge badge-danger mb-0">No Specified</label>;
		}
	};
	invoiceDueDate = (cell, row) => {
		return row.invoiceDueDate ? row.invoiceDueDate : '';
	};
	invoiceDate = (cell, row) => {
		return row.invoiceDate ? row.invoiceDate : '';
	};

	sendMail = (row, markAsSent, sendAgain) => {
		console.log(row)
		const { invoiceAmount, currencySymbol, vatAmount, id } = row;
		this.setState({
			dialog: (
				<SentInvoice
					invoiceAmount={invoiceAmount || 0}
					id={id}
					currencyName={currencySymbol || 'SAR'}
					vatAmount={vatAmount || 0}
					markAsSent={markAsSent}
					postingRefType={"INVOICE"}
					setState={(value) => {
						this.setState({ sentInvoice: value, unSent: false, sendAgain: false })
						this.removeDialog();
					}}
					initializeData={() => {
						this.initializeData();
					}}
					documentTitle={strings.CustomerInvoice}
					unSent={false}
					sendAgain={sendAgain}
					mailPopupCard={!markAsSent || sendAgain}
					zatcaConfirmation={false}
				/>
			)
		})


	}

	renderVatAmount = (cell, row, extraData) => {
		// return row.vatAmount === 0 ? (
		// 	<Currency
		// 		value={row.vatAmount}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	<Currency
		// 		value={row.vatAmount}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// );
		return row.vatAmount === 0 ? row.currencySymbol + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.currencySymbol + row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	};

	renderDueAmount = (cell, row, extraData) => {
		return row.dueAmount === 0 ? row.currencySymbol + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.currencySymbol + row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
						{row.statusEnum !== 'Paid' && row.statusEnum !== 'Sent' && row.statusEnum !== 'Partially Paid' && (
							<DropdownItem>
								<div
									onClick={() => {
										if (row.editFlag)
											this.props.history.push(
												'/admin/income/customer-invoice/detail',
												{ id: row.id },
											);
										else this.props.commonActions.tostifyAlert(
											'error',
											'You cannot edit transactions for which VAT is recorded'
										);
									}}
								>
									<i className="fas fa-edit" /> {strings.Edit}
								</div>
							</DropdownItem>
						)}
						{row.statusEnum !== 'Sent' && row.statusEnum !== 'Paid' && row.statusEnum !== 'Partially Paid' && (
							<DropdownItem
								onClick={() => {
									this.stockInHandTestForProduct(row, true);
								}}
							>
								<i className="far fa-arrow-alt-circle-right"></i>{strings.Mark_As_Sent}
							</DropdownItem>
						)}
						{row.statusEnum !== 'Sent' && row.statusEnum !== 'Paid' && row.statusEnum !== 'Partially Paid' && (
							<DropdownItem
								onClick={() => {
									this.sendMail(row, false, false);
								}}
							>
								<i className="fas fa-send" /> {strings.Send}
							</DropdownItem>
						)}
						{/* <DropdownItem onClick={() => { this.openInvoicePreviewModal(row.id) }}>
              <i className="fas fa-eye" /> View
            </DropdownItem> */}

						{row.statusEnum === 'Sent' && (
							<DropdownItem
								onClick={() => {
									if (row.editFlag)
										this.unPostInvoice(row);
									else this.props.commonActions.tostifyAlert(
										'error',
										'You cannot edit transactions for which VAT is recorded'
									);
								}}
							>
								<i className="fas fa-file" /> {strings.Draft}
							</DropdownItem>
						)}
						{row.statusEnum !== 'Draft' && row.statusEnum !== 'Paid' && row.exchangeRate == 1 && (
							<DropdownItem
								onClick={() =>
									this.props.history.push(
										'/admin/income/customer-invoice/record-payment',
										{ id: row },
									)
								}
							>
								<i className="fas fa-university" /> {strings.RecordPayment}
							</DropdownItem>
						)}
						<DropdownItem

							onClick={() =>
								this.props.history.push('/admin/income/customer-invoice/create', { parentInvoiceId: row.id })
							}
						>
							<i className="fas fa-copy" /> {strings.CreateADuplicate}
						</DropdownItem>
						{/* {row.statusEnum !== 'Paid' && row.statusEnum !== 'Sent' && (
							<DropdownItem
								onClick={() => {
									this.closeInvoice(row.id, row.status);
								}}
							>
								<i className="fa fa-trash-o" /> Delete
							</DropdownItem>
						)} */}
						{/* {row.statusEnum !== 'Paid' && row.statusEnum !== 'Sent' && (
							<DropdownItem
								onClick={() => {
									this.sendCustomEmail(row.id);
								}}
							>
								<i className="fa fa-send" /> Send Custom Email
							</DropdownItem>
						)} */}
						{(!row.cnCreatedOnPaidInvoice && row.statusEnum === 'Paid' && row.remainingInvoiceAmount !== true && config.INCOME_TCN) && (
							<DropdownItem
								onClick={() => {
									this.props.history.push('/admin/income/credit-notes/create', {
										invoiceID: row.id
									})
								}}
							>
								<i className="fas fa-plus" /> {strings.Create + " " + strings.CreditNote}
							</DropdownItem>
						)}
						<DropdownItem

							onClick={() =>

								this.props.history.push('/admin/income/customer-invoice/view', {
									id: row.id, status: row.status, contactId: row.contactId
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
				<b>{strings.DeleteCustomerInvoice}</b>
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
					<b>{strings.DeleteCustomerInvoice}</b>
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
					res.data ? res.data.message : 'Customer Invoice Deleted Successfully'
				);
				this.initializeData();
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Customer Invoice Deleted Unsuccessfully'
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
			this.props.customer_invoice_list && this.props.customer_invoice_list.data
				? this.props.customer_invoice_list.data.map((customer) => ({
					id: customer.id,
					status: customer.status,
					statusEnum: customer.statusEnum,
					customerName: customer.name,
					dueAmount: customer.dueAmount,
					contactId: customer.contactId,
					invoiceNumber: customer.referenceNumber,
					invoiceDate: customer.invoiceDate ? customer.invoiceDate : '',
					invoiceDueDate: customer.invoiceDueDate
						? customer.invoiceDueDate
						: '',
					currencyName: customer.currencyName ? customer.currencyName : '',
					currencySymbol: customer.currencySymbol ? customer.currencySymbol : '',
					invoiceAmount: customer.totalAmount,
					vatAmount: customer.totalVatAmount,
					cnCreatedOnPaidInvoice: customer.cnCreatedOnPaidInvoice,
					editFlag: customer.editFlag,
					exchangeRate: customer.exchangeRate,
				}))
				: '';

		let tmpCustomer_list = []

		customer_list.map(item => {
			let obj = { label: item.label.contactName, value: item.value }
			tmpCustomer_list.push(obj)
		})

		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div> <div className="customer-invoice-screen">
					<div className="animated fadeIn">
						{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
						<Card>
							<CardHeader>
								<Row>
									<Col lg={12}>
										<div className="h4 mb-0 d-flex align-items-center">
											<i className="fas fa-file-invoice" />
											<span className="ml-2">{strings.CustomerInvoices}</span>
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
													<h5 className="ml-3">{strings.Overdue}</h5>
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
													<h5 className="ml-3">{strings.DueWithinThisWeek}</h5>
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
													<h5 className="ml-3">{strings.DueWithinThisMonth}</h5>
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
												<Col lg={2} className="mb-1">
													<DatePicker
														className="form-control"
														id="date"
														name="invoiceDate"
														placeholderText={strings.Select + strings.InvoiceDate}
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
												</Col>
												<Col lg={2} className="mb-1">
													<DatePicker
														className="form-control"
														id="date"
														name="invoiceDueDate"
														placeholderText={strings.Select + strings.InvoiceDueDate}
														showMonthDropdown
														minDate={this.state.filterData.invoiceDate}
														maxDate={null}
														showYearDropdown
														dropdownMode="select"
														dateFormat="dd-MM-yyyy"
														autoComplete="off"
														selected={filterData.invoiceDueDate}
														onChange={(value) => {
															this.handleChange(value, 'invoiceDueDate');
														}}
													/>
												</Col>
												<Col lg={2} className="mb-1">
													<Input
														type="number"
														maxLength="14,2"
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
											<div style={{ width: "1560px"}}>
												<Button
													color="primary"
													className="btn-square pull-right"
													style={{ marginBottom: '10px' }}
													onClick={() =>
														this.props.history.push(
															`/admin/income/customer-invoice/create`,
														)
													}
												>
													<i className="fas fa-plus mr-1" />
													{strings.AddNewInvoice}
												</Button>
											</div>
										</Row>

										<BootstrapTable
											selectRow={this.selectRowProp}
											search={false}
											data={customer_invoice_data ? customer_invoice_data : []}
											version="4"
											hover
											responsive
											currencyList
											keyField="id"
											remote
											pagination={
												customer_invoice_data &&
													customer_invoice_data.length > 0
													? true
													: false
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
												dataField="invoiceNumber"
												// dataFormat={this.renderInvoiceNumber}
												dataSort
												//width="20%"
												className="table-header-bg"
											>
												{strings.INVOICENUMBER}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="customerName"
												tdStyle={{ whiteSpace: 'normal' }}
												dataSort 
												className="table-header-bg"
											>
												{strings.CUSTOMERNAME}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="invoiceDate"
												dataSort
												// width="8%"
												dataFormat={this.invoiceDate}
												className="table-header-bg"
											>
												{strings.INVOICEDATE}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="invoiceDueDate"
												dataSort
												// width="8%"
												dataFormat={this.invoiceDueDate}
												className="table-header-bg"
											>
												{strings.DUEDATE}
											</TableHeaderColumn>
											<TableHeaderColumn
												// width="7%"
												dataField="status"
												dataFormat={this.renderInvoiceStatus}
												dataSort
												className="table-header-bg"
											>
												{strings.STATUS}
											</TableHeaderColumn>

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
												{strings.INVOICEAMOUNT}
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
												width="5%"
												dataFormat={this.renderActions}

											>
											</TableHeaderColumn>
										</BootstrapTable>
									</Col>
								</Row>
							</CardBody>
						</Card>
					</div>
				<CreateCreditNoteModal
						openModal={this.state.openModal}
						closeModal={(e) => {
							this.closeModal(e);
							this.initializeData();
						}}
						updateParentAmount={
							(e, e1, e2) => {
								this.updateParentAmount(e, e1, e2);
							}}
						updateParentSelelectedData={
							(e) => {
								this.updateParentSelelectedData(e);
							}}
						invoiceNumber={this.state.invoiceNumber}
						id={this.state.rowId}
						selectedData={this.state.selectedData}

						prefixData={this.state.prefixData}

						createCreditNote={this.props.creditNotesActions.createCreditNote}
						totalAmount={this.state.totalAmount}
						totalVatAmount={this.state.totalVatAmount}
						totalExciseAmount={this.state.totalExciseAmount}
					/>
					
				</div>
				</div>

		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerInvoice);
