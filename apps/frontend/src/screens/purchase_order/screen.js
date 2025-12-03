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
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';
import Select from 'react-select';
// import { ToastContainer, toast } from 'react-toastify'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Loader, ConfirmDeleteModal } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import * as PurchaseOrderAction from '../purchase_order/actions';
import * as PurchaseOrderDetailsAction from './screens/detail/actions';
import * as GoodsReceivedNoteCreateAction from '../goods_received_note/screens/create/actions'
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import CreateGoodsReceivedNote from './sections/createGRN';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';
import { upperCase } from 'lodash';

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
		supplier_list: state.purchase_order.supplier_list,
		status_list: state.supplier_invoice.status_list,
		universal_currency_list: state.common.universal_currency_list,
		purchase_order_list: state.purchase_order.purchase_order_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		purchaseOrderAction: bindActionCreators(
			PurchaseOrderAction,
			dispatch,
		),

		commonActions: bindActionCreators(CommonActions, dispatch),
		purchaseOrderDetailsAction: bindActionCreators(PurchaseOrderDetailsAction,dispatch,),
		goodsReceivedNoteCreateAction: bindActionCreators(GoodsReceivedNoteCreateAction,dispatch,),
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

const invoiceimage = require('assets/images/invoice/invoice.png');
const overWeekly = require('assets/images/invoice/week1.png');
const overduemonthly = require('assets/images/invoice/month.png');
const overdue = require('assets/images/invoice/due1.png');

let strings = new LocalizedStrings(data);
class PurchaseOrder extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dialog: false,
			openEmailModal: false,
			openGoodsReceivedNotes: false,
			actionButtons: {},
			selectedData:{},
			filterData: {
				supplierId: '',
				referenceNumber: '',
				invoiceDate: '',
				invoiceDueDate: '',
				amount: '',
				status: '',
				contactType: 1,
			},
			selectedRows: [],
			contactType: 1,
			openInvoicePreviewModal: false,
			selectedId: '',
			csvData: [],
			view: false,
			overDueAmountDetails: {
				overDueAmount: '',
				overDueAmountWeekly: '',
				overDueAmountMonthly: '',
			},
			language: window['localStorage'].getItem('language'),
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
		this.props.purchaseOrderAction.getStatusList();
		this.props.goodsReceivedNoteCreateAction.getInvoiceNo().then((response) => {
			this.setState({prefixData:response.data	});
			});
 		this.initializeData();
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
		this.props.purchaseOrderAction
			.getpoList(postData)
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
				this.setState({ loading: false });
			});
	};
	componentWillUnmount = () => {
		this.setState({
			selectedRows: [],
		});
	};

	closeGoodsReceivedNotes = (res) => {
		this.setState({ openGoodsReceivedNotes: false });
	};

	renderInvoiceNumber = (cell, row) => {
		return (
			<label
				className="mb-0 my-link"
				onClick={() =>
					this.props.history.push('/admin/expense/supplier-invoice/detail')
				}
			>
				{row.transactionCategoryName}
			</label>
		);
	};

	close = (id,status) => {
		this.props.purchaseOrderAction
			.changeStatus(id,status)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data? res.data.message: 'Status Changed Successfully'
					);
					this.setState({
						loading: false,
					});
					this.initializeData();
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data? err.data.message: ' Status Changed Unsuccessfully '
				);
			});
	};

	renderRFQStatus = (cell, row) => {
		let classname = '';
		if (row.status === 'Approved') {
			classname = 'label-success';
		} else if (row.status === 'Draft') {
			classname = 'label-draft';
		} else if (row.status === 'Closed') {
			classname = 'label-closed';
		}else if (row.status === 'Sent') {
			classname = 'label-sent';
		}else if(row.status === 'Rejected'){
			classname = 'label-due'
		}else if(row.status === 'Invoiced'){
			classname = 'label-primary'
		}else {
			classname = 'label-overdue';
		}
		return (
			<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
				{row.status}
			</span>
		);
	};

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	renderrfqAmount = (cell, row, extraData) => {
		return(
			<div>
								<div>
						<label className="font-weight-bold mr-2" dataAlign="right">{strings.PurchaseOrder+" "+strings.Amount}: </label>
						<label dataAlign="right">
							{row.totalAmount  === 0 ? row.currencyCode +" "+ row.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) : row.currencyCode +" "+ row.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })}
						</label>
					</div>
					<div style={{display: row.totalVatAmount === 0 ? 'none' : ''}}>
					<label className="font-weight-bold mr-2" dataAlign="right">{strings.VatAmount}: </label>
					<label dataAlign="right">{row.totalVatAmount === 0  ? row.currencyCode +" "+ row.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) : row.currencyCode +" "+ row.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })}</label>
					</div>
					
					
			</div>);
		};

	renderDueAmount =(cell,row,extraData) => {
		return row.dueAmount === 0  ? row.currencySymbol +" "+row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) : row.currencySymbol +" "+row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 });
	}

	renderVatAmount = (cell, row, extraData) => {
		return row.vatAmount === 0 ? row.currencySymbol +" "+row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) : row.currencySymbol +" "+row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 });
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
	sendCustomEmail = (id) => {
		this.setState({ openEmailModal: true });
	};

	closeEmailModal = (res) => {
		this.setState({ openEmailModal: false });
	};

	rfqDueDate = (cell, row) => {
		return row.poReceiveDate ? row.poReceiveDate : '';
	};
	pODate = (cell, row) => {
		return row.poApproveDate ? row.poApproveDate : '';
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
					{row.status === 'Draft' &&  (
							<DropdownItem
								onClick={() =>
									this.props.history.push(
										'/admin/expense/purchase-order/detail',
										{ id: row.id },
									)
								}
							>
								<i className="fas fa-edit" /> {strings.Edit}
							</DropdownItem>
					)}
					{row.status === "Approved" && (
							<DropdownItem
							onClick={() =>
								this.props.history.push(
									'/admin/expense/goods-received-note/create',
									{ poId: row.id ,poNumber:row.poNumber},
								)
							}
						>
								<i className="fas fa-plus" />   {strings.CreateGRN}
							</DropdownItem>
							)}
							{row.status === 'Approved' && (
							<DropdownItem
							onClick={() =>
								this.props.history.push(
									'/admin/expense/supplier-invoice/create',
									{ poId: row.id },
								)
							}>
								<i className="fas fa-plus" />{strings.CreateSupplierInvoice}
							</DropdownItem>
							)}
							{row.status === "Draft" && (
							<DropdownItem
								onClick={() => {
									this.sendMail(row);
								}}
							>
								<i className="fas fa-send" /> {strings.Send}
							</DropdownItem>)}
							{row.status === 'Draft' && (
                            <DropdownItem
								onClick={() => {
									this.changeStatus(row.id,"Sent");
								}}
							>
							<i className="far fa-arrow-alt-circle-right"></i>Mark As Sent
							</DropdownItem>)}
					
						
							{/* {row.status !== 'Approved' && (
								<DropdownItem
							onClick={() => {
							this.changeStatus(row.id,"Approved");
							}}
							>
								<i className="fas fa-send" />  {strings.Approve}
							</DropdownItem>
							)} */}
							
							{row.status === 'Sent' && (
							<DropdownItem
							onClick={() => {
								this.sendMail(row);
							}}
							>
								<i className="fas fa-send" />{strings.SendAgain}
							</DropdownItem>
							)}

							{row.status != 'Draft' && row.status != 'Approved' && row.status != 'Closed' && row.status != "Invoiced" && (
							<DropdownItem
							onClick={() => {
								this.changeStatus(row.id,"Approved");
							}}
							>
								<i className="fa fa-check-circle-o" />{strings.MarkAsApproved}
							</DropdownItem>
							)}

							{row.status != 'Draft' && row.status != 'Rejected' && row.status != 'Closed' && row.status != 'Invoiced' &&(
							<DropdownItem
							onClick={() => {
								this.changeStatus(row.id,"Rejected");
							}}
							>
								<i className="fa fa-ban" />{strings.MarkAsRejected}
							</DropdownItem>
							)}
							<DropdownItem					
								onClick={() =>
									this.props.history.push(`/admin/expense/purchase-order/create`,{parentId: row.id})
								}
							>
								<i className="fas fa-copy" /> {strings.CreateADuplicate}
							</DropdownItem>
					<DropdownItem
							onClick={() =>
								this.props.history.push(
									'/admin/expense/purchase-order/view',
									{ id: row.id ,status:row.status},
								)
							}
						>
							<i className="fas fa-eye" />  {strings.View}
						</DropdownItem>
						{(row.status === 'Approved'||row.status === 'Sent'||row.status === 'Rejected'|| row.status === "Invoiced" )	 &&(
								<DropdownItem
							onClick={() => {
							this.close(row.id,"Closed");
							}}
							>
							<i className="far fa-times-circle" />  {strings.Close}
							</DropdownItem>
							)}
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
					</DropdownMenu>
				</ButtonDropdown>
			</div>
		);
	};

	changeStatus = (id,status) => {
				this.props.purchaseOrderAction
				.changeStatus(id,status)
				.then((res) => {
					 
					if (res.status === 200) {
						this.props.commonActions.tostifyAlert(
							'success',
							res.data? res.data.message: 'Status Changed Successfully'

						);
						this.setState({
							loading: false,
						});
					}
					this.initializeData();
				})
		.catch((err) => {
			this.props.commonActions.tostifyAlert(
				'error',
				err.data? err.data.message: ' Status Changed Unsuccessfully '
			);
		});
	
	}
	renderActionForState = (id) => {
		this.props.purchaseOrderDetailsAction.getPOById(id).then((res) => {
			this.setState({		
				// current_rfq_id: this.props.location.state.id,
				openGoodsReceivedNotes : true, rowId : id,
				    selectedData:res.data,
				
						supplierId: res.data.supplierId ? res.data.supplierId : '',
						rfqNumber: res.data.rfqNumber
						? res.data.rfqNumber
						: '',
					totalVatAmount: res.data.totalVatAmount
						? res.data.totalVatAmount
						: 0,
						totalAmount: res.data.totalAmount ? res.data.totalAmount : 0,
						total_net: 0,
					notes: res.data.notes ? res.data.notes : '',
					lineItemsString: res.data.poQuatationLineItemRequestModelList
						? res.data.poQuatationLineItemRequestModelList
						: [],
								
				data: res.data.poQuatationLineItemRequestModelList
					? res.data.poQuatationLineItemRequestModelList
					: [],
				selectedContact: res.data.supplierId ? res.data.supplierId : '',
			
				loading: false,
			})
			console.log(this.state.rfqReceiveDate)
			console.log('selecteddata ',this.state.selectedData)
		});
	}
	// sendMail = (id,status) => {
	// 	this.props.purchaseOrderAction
	// 		.sendMail(id)
	// 		.then((res) => {
	// 			if (res.status === 200) {
	// 				this.props.commonActions.tostifyAlert(
	// 					'success',
	// 					res.data ? res.data.message : 'Email Send Successfully'
	// 				);
	// 				this.setState({
	// 					loading: false,
	// 				});
	// 				this.initializeData();
	// 			}
	// 		})
	// 		.catch((err) => {
	// 			this.props.commonActions.tostifyAlert(
	// 				'error',
	// 				err.data ? err.data.message : 'Email Send Unsuccessfully'
	// 			);
	// 		});
	// };

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
				<b>Delete Supplier Invoice?</b>
			</text>
		);
		const message =
			'This Supplier Invoice will be deleted permanently and cannot be recovered. ';
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
		let { selectedRows, filterData } = this.state;
		const { supplier_invoice_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.props.purchaseOrderAction
			.removeBulk(obj)
			.then((res) => {
				this.initializeData(filterData);
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Purchase Order Deleted Successfully'
				);
				if (supplier_invoice_list && supplier_invoice_list.length > 0) {
					this.setState({
						selectedRows: [],
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Purchase Order Deleted Unsuccessfully'
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
		this.initializeData();
	};

	sendMail = (row) => {
		this.setState({
			loading: true,
		});
		const postingRequestModel = {
		
			postingRefId: row.id,
		
			amountInWords:upperCase(row.currencyName + " " +(toWords.convert(row.totalAmount)) ).replace("POINT","AND"),
			vatInWords:row.totalVatAmount ? upperCase(row.currencyName + " " +(toWords.convert(row.totalVatAmount)) ).replace("POINT","AND") :"-"
		};
		this.props.purchaseOrderAction
			.sendMail(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Purchase Order Posted Successfully'
					);
					this.setState({
						loading: false,
					});
					this.initializeData();
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Purchase Order Posted Unsuccessfully'
				);
				this.setState({
					loading: false,
				});
				this.initializeData();
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
		this.props.purchaseOrderAction
			.unPostInvoice(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Purchase Order Unposted Successfully'

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
					err.data ? err.data.message : 'Purchase Order Unposted Unsuccessfully'
				);
				this.setState({
					loading: false,
				});
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

	closeInvoicePreviewModal = (res) => {
		this.setState({ openInvoicePreviewModal: false });
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

	closeInvoice = (id, status) => {
		if (status === 'Paid') {
			this.props.commonActions.tostifyAlert(
				'error',
				'Please delete the receipt first to delete the invoice',
			);
		} else {
			const message1 = (
				<text>
					<b>Delete Supplier Invoice?</b>
				</text>
			);
			const message =
				'This Supplier Invoice will be deleted permanently and cannot be recovered. ';
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
		this.props.purchaseOrderAction
			.deleteInvoice(id)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Purchase Order Deleted Successfully'
				);
				this.initializeData();
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Purchase Order Deleted Unsuccessfully'
				);
			});
	};

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.purchaseOrderAction
				.getSupplierInvoiceList(obj)
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
					supplierId: '',
					referenceNumber: '',
					invoiceDate: '',
					invoiceDueDate: '',
					amount: '',
					status: '',
					statusEnum: '',
					contactType: 1,
					contactId: '',
				},
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
			filterData,
			dialog,
			selectedRows,
			csvData,
			view,
		} = this.state;
		const {
			status_list,
			supplier_list,
			purchase_order_list,
			universal_currency_list
		} = this.props;
		console.log(purchase_order_list.data,"purchase_order_list.data")


		const PO_data =
		purchase_order_list && purchase_order_list.data
				? this.props.purchase_order_list.data.data.map((supplier) => ({
						id: supplier.id,
						status: supplier.status,
						supplierName: supplier.supplierName,
						poNumber: supplier.poNumber,
						poApproveDate: supplier.poApproveDate ? supplier.poApproveDate : '',
						poReceiveDate: supplier.poReceiveDate
							? supplier.poReceiveDate
							: '',
						totalAmount: supplier.totalAmount,
						totalVatAmount: supplier.totalVatAmount,
						currencyCode: supplier.currencyCode,
						currencyName:supplier.currencyName,
						statusEnum:supplier.statusEnum
				  }))
				: '';

		// console.log(PO_data)
		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})		

		return (
			loading ==true? <Loader/> :
<div>
			<div className="supplier-invoice-screen">
				<div className="animated fadeIn">
					{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<img
											alt="invoiceimage"
											src={invoiceimage}
											style={{ width: '40px' }}
										/>
										<span className="ml-2">{strings.PurchaseOrder}</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							{dialog}
							{loading && (
								<Row>
									<Col lg={12} className="rounded-loader">
										<Loader />
									</Col>
								</Row>
							)}

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
													filename={'SupplierInvoice.csv'}
													className="hidden"
													ref={this.csvLink}
													target="_blank"
												/>
											)} */}
											{/* <Button
												color="primary"
												className="btn-square mr-1"
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
											{/* <Col lg={2} className="mb-1">
												<DatePicker
													className="form-control"
													id="date"
													name="invoiceDate"
													placeholderText="Invoice Date"
													showMonthDropdown
													showYearDropdown
													autoComplete="off"
													dropdownMode="select"
													dateFormat="dd-MM-yyyy"
													selected={filterData.invoiceDate}
													// value={filterData.invoiceDate}
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
													placeholderText="Invoice Due Date"
													showMonthDropdown
													showYearDropdown
													autoComplete="off"
													dropdownMode="select"
													dateFormat="dd-MM-yyyy"
													selected={filterData.invoiceDueDate}
													onChange={(value) => {
														this.handleChange(value, 'invoiceDueDate');
													}}
												/>
											</Col> */}
										
											{/* <Col lg={2} className="mb-1">
												<Select
													styles={customStyles}
													className=""
													// options={status_list ? status_list.map((item) => {
													//   return { label: item, value: item }
													// }) : ''}
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
													placeholder="Status"
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
									<div style={{width:"1650px"}}>
									<Button
										color="primary"
										style={{ marginBottom: '10px' }}
										className="btn-square pull-right"
										onClick={() =>
											this.props.history.push(
												`/admin/expense/purchase-order/create`,
											)
										}
									>
										<i className="fas fa-plus mr-1" />
										{strings.AddNewPurchaseOrder}
									</Button>
									</div>
									</Row> 
										<BootstrapTable
											selectRow={this.selectRowProp}
											search={false}
											options={this.options}
											data={PO_data ? PO_data : []}
											version="4"
											hover
											keyField="id"
											pagination={
												true
											}
											remote
											fetchInfo={{
												dataTotalSize: purchase_order_list
													? purchase_order_list.count
													: 0,

													dataTotalSize: purchase_order_list && purchase_order_list && purchase_order_list.data && purchase_order_list.data.count
													? purchase_order_list.data.count
													: 0,
											}}
											className="supplier-invoice-table"
											ref={(node) => (this.table = node)}
										>
											<TableHeaderColumn
												dataField="poNumber"
												
												dataSort
												width="10%"
												className="table-header-bg"
											>
												{strings.PONUMBER} 
											</TableHeaderColumn>
											<TableHeaderColumn
												tdStyle={{ whiteSpace: 'normal' }}
												dataField="supplierName"
												// dataSort
												width="15%"
												className="table-header-bg"
											>
												{strings.SUPPLIERNAME} 
											</TableHeaderColumn>
											
											<TableHeaderColumn
												dataField="poApproveDate"
												dataSort
												width="10%"
												dataFormat={this.pODate}
												className="table-header-bg"
											>
												{strings.PODATE}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="poReceiveDate"
												dataSort
												width="10%"
												dataFormat={this.rfqDueDate}
												className="table-header-bg"
											>
												{strings.POEXPIRYDATE}
											</TableHeaderColumn>
											<TableHeaderColumn
												width="10%"
												dataField="status"
												dataFormat={this.renderRFQStatus}
												dataSort
												className="table-header-bg"
											>
												{strings.STATUS} 
											</TableHeaderColumn>
											<TableHeaderColumn
												dataAlign="right"
												dataField="totalAmount"
												dataSort
												width="25%"
												dataFormat={this.renderrfqAmount}
												className="table-header-bg"
												formatExtraData={universal_currency_list}
											>
												 {strings.AMOUNT} 
											</TableHeaderColumn>
											{/* <TableHeaderColumn
												dataField="dueAmount"
												dataSort
												width="5%"
												dataFormat={this.renderDueAmount}
												className="table-header-bg"
											>
												Due Amount
											</TableHeaderColumn> */}
											<TableHeaderColumn
												className="text-right"
												columnClassName="text-right"
												width="5%"
												dataFormat={this.renderActions}
												className="table-header-bg"
											></TableHeaderColumn>
										</BootstrapTable>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</div>
				{/* <PreviewInvoiceModal
          openInvoicePreviewModal={this.state.openInvoicePreviewModal}
          closeInvoicePreviewModal={(e) => { this.closeInvoicePreviewModal(e) }}
          getInvoiceById={this.props.supplierInvoiceActions.getInvoiceById}
          id={this.state.selectedId}
          currency_list={this.props.currency_list}
          history={this.props.history}
        /> */}
				{/* <EmailModal
					openEmailModal={this.state.openEmailModal}
					closeEmailModal={(e) => {
						this.closeEmailModal(e);
					}}
				/> */}
				<CreateGoodsReceivedNote
					openGoodsReceivedNotes={this.state.openGoodsReceivedNotes}
					closeGoodsReceivedNotes={(e) => {
						this.closeGoodsReceivedNotes(e);
					}}
					id={this.state.rowId}
                    selectedData={this.state.selectedData}
				//getRfqbyid={this.props.requestForQuotationDetailsAction.getRFQeById}
				//	getState={this.props.requestForQuotationDetailsAction.renderActionForState}
				//	getInvoice={this.props.purchaseOrderCreateAction.getPoNo()}
					prefixData={this.state.prefixData}
				//	nextprefixData={this.state.nextprefixData}
					getVat={this.props.purchaseOrderAction.getVatList()}
					getProductList={this.props.purchaseOrderAction.getProductList()}
					getNextGrnNo={()=>{
						this.props.goodsReceivedNoteCreateAction.getInvoiceNo().then((response) => {
						this.setState({prefixData:response.data	});
						});}}
					createGRN={this.props.goodsReceivedNoteCreateAction.createGNR}

				/>
			</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseOrder);
