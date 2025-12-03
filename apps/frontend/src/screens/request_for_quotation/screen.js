import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { AgGridReact, AgGridColumn } from 'ag-grid-react/lib/agGridReact';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
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
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import CreatePurchaseOrder from './sections/createPo'
import { Loader, ConfirmDeleteModal } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import * as RequestForQuotationDetailsAction from './screens/detail/actions';
import * as RequestForQuotationCreateAction from './screens/create/actions';
import * as RequestForQuotationAction from '../request_for_quotation/actions';
import * as PurchaseOrderCreateAction from '../purchase_order/screens/create/actions';
import * as PurchaseOrderAction from '../purchase_order/actions'
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';
import moment from 'moment';
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
		supplier_list: state.request_for_quotation.supplier_list,
		status_list: state.request_for_quotation.status_list,
		universal_currency_list: state.common.universal_currency_list,
		request_for_quotation_list: state.request_for_quotation.request_for_quotation_list,
		rfqReceiveDate: state.rfqReceiveDate
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		requestForQuotationAction: bindActionCreators(
			RequestForQuotationAction,
			dispatch,
		),
		requestForQuotationDetailsAction: bindActionCreators(
			RequestForQuotationDetailsAction,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
		purchaseOrderCreateAction: bindActionCreators(PurchaseOrderCreateAction,dispatch),
		purchaseOrderAction: bindActionCreators(PurchaseOrderAction,dispatch,),
		requestForQuotationCreateAction: bindActionCreators(RequestForQuotationCreateAction,dispatch,),
		
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
class RequestForQuotation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dialog: false,
			openPurchaseOrder: false,
			selectedData:{},
			prefixData:'',
			actionButtons: {},
			initValue: {},
			filterData: {
				supplierId: '',
				referenceNumber: '',
				invoiceDate: '',
				invoiceDueDate: '',
				amount: '',
				status: '',
				contactType: 1,
				// paginationPageSize:10,
			},
			rfqReceiveDate:'',
						rfqExpiryDate:'',
						supplierId:'',
						rfqNumber:'',
						totalVatAmount:'',
						totalAmount:'',
						total_net:'',
					notes:'',
					lineItemsString:[],
			selectedRows: [],
			contactType: 1,
			openInvoicePreviewModal: false,
			selectedId: '',
			csvData: [],
			view: false,
			rowId: '',
			language: window['localStorage'].getItem('language'),
			loadingMsg:"Loading..."
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

	// onPageSizeChanged = (newPageSize) => {

    //     var value = document.getElementById('page-size').value;

    //     this.gridApi.paginationSetPageSize(Number(value));

    // };

    // onGridReady = (params) => {

    //     this.gridApi = params.api;

    //     this.gridColumnApi = params.columnApi;

	// 	this.gridApi.resetRowHeights();
    // };



    // onBtnExport = () => {

    //     this.gridApi.exportDataAsCsv();

    // };



    // onBtnExportexcel = () => {

    //     this.gridApi.exportDataAsExcel();

    // };

	componentDidMount = () => {
		let { filterData } = this.state;
		this.props.requestForQuotationAction.getStatusList();
		this.props.requestForQuotationAction.getSupplierList(filterData.contactType);
		this.props.purchaseOrderCreateAction.getPoNo().then((response) => {
		this.setState({prefixData:response.data	});
		});
		// this.props.purchaseOrderAction.getNextInvoiceNo().then((response) => {
		// 	console.log('getPoPrefix ',response.data.invoiceNo)
		// this.setState({prefixData:response.data	});
		// console.log('state prefixData ',this.state.prefixData)
		// });
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
		this.props.requestForQuotationAction
			.getRFQList(postData)
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

	renderRFQStatus = (cell, row) => {
		let classname = '';
		if (row.status === 'Closed') {
			classname = 'label-closed';
		}else if (row.status === 'Approved') {
			classname = 'label-success';
		} else if (row.status === 'Draft') {
			classname = 'label-draft';
		} else if (row.status === 'Sent') {
			classname = 'label-sent';
		} else if(row.status === 'Approved'){
			classname = 'label-success'
		} else if(row.status === 'Rejected'){
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
	// getActionButtons = (row) => {
	// 	return (
	// <>
	// {/* BUTTON ACTIONS */}
	// 		{/* View */}
	// 		<Button
	// 			className="Ag-gridActionButtons btn-sm"
	// 			title='view'
	// 			color="secondary"
	// 			onClick={() =>
	// 			{
	// 				this.props.history.push(
	// 					'/admin/expense/request-for-quotation/view',
	// 					{ id: row.id },
	// 				)}
	// 			}
			
	// 		>	<i className="fas fa-eye" /> </Button>&nbsp;&nbsp;
	// 		{row.status !== 'Sent' && row.status !== "Closed" && (
	// 		<Button
	// 			className="Ag-gridActionButtons btn-sm"
	// 			title='Edit'
	// 			color="secondary"
	// 			onClick={() =>
	// 			{
	// 				this.props.history.push(
	// 					'/admin/expense/request-for-quotation/detail',
	// 					{ id: row.id },
	// 				)}
	// 			}

	// 		>		<i className="fas fa-edit"/> </Button>)}
	// 			{row.status !== 'Sent' && row.status !== "Closed"  ? (<>&nbsp;&nbsp;</>) : ''}
	// 			{ row.status !== "Closed"  && (
	// 		<Button
	// 			className="Ag-gridActionButtons btn-sm"
	// 			title='send'
	// 			color="secondary"
	// 			onClick={() => {this.sendMail(row);}}
			
	// 		>		<i className="fas fa-send"/> </Button>)}&nbsp;&nbsp;
	// 			{row.status === 'Sent' && (
	// 		<Button
	// 			className="Ag-gridActionButtons btn-sm"
	// 			title='creat purchase order'
	// 			color="secondary"
	// 			onClick={() => {this.renderActionForState(row.id);}}
			
	// 		>		<i className="fas fa-plus"/> </Button>)}

	// </>
	// 	)
	// }

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	renderrfqAmount = (cell, row, extraData) => {
		return(
			<div>
								<div>
						<label className="font-weight-bold mr-2 ">{strings.RFQAmount}: </label>
						<label>
							{row.totalAmount  === 0 ? row.currencyCode +" "+ row.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) :  row.currencyCode +" "+ row.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })}
						</label>
					</div>
					<div style={{display: row.totalVatAmount === 0 ? 'none' : ''}}>
					<label className="font-weight-bold mr-2">{strings.VatAmount} : </label>
					<label>{row.totalVatAmount === 0  ?   row.currencyCode +" "+ row.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) :   row.currencyCode +" "+ row.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })}</label>
					</div>
					
					
			</div>);
		};
	renderpoList = (row) => {
		return row.poList[0] ? row.poList[0] : '';

	};


	renderDueAmount =(cell,row,extraData) => {
		return row.dueAmount === 0  ? row.currencySymbol+" "+row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) : row.currencySymbol+" "+row.dueAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 });
	}

	renderVatAmount = (cell, row, extraData) => {
		return row.vatAmount === 0 ? row.currencySymbol +" "+row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) : row.currencySymbol+" "+row.vatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 });
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

	rfqDueDate = (cell, row) => {
		return row.rfqExpiryDate ? row.rfqExpiryDate: '';
	};
	orderDate = (cell, row) => {
		return row.rfqReceiveDate ? row.rfqReceiveDate: '';
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
	// renderAmount =  (amount, params) => {
	// 	let {universal_currency_list}=this.props;
	// 	if (amount != null && amount != 0)
	// 		return (
	// 			<>
	// 				<Currency
	// 					value={amount}
	// 					currencySymbol={universal_currency_list[0] ? universal_currency_list[0].currencyIsoCode : 'AED'}					/>
	// 			</>

	// 		)
	// 	else
	// 		return ("---")
	// };			

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
					{row.status !== 'Sent' && row.status !== "Closed"&& row.status !== "Approved"&&row.status !== "Rejected" && row.status !== "Invoiced"    && (
							<DropdownItem
								onClick={() =>
									this.props.history.push(
										'/admin/expense/request-for-quotation/detail',
										{ id: row.id },
									)
								}
							>
								<i className="fas fa-edit" /> {strings.Edit}
							</DropdownItem>
					)}
				{row.status != 'Draft' && row.status != 'Sent' && row.status != 'Rejected' && row.status != 'Closed' && row.status != 'Invoiced' &&(
							<DropdownItem
							onClick={() =>
								this.props.history.push(
									'/admin/expense/purchase-order/create',
									{ rfqId: row.id,rfqNumber:row.rfqNumber},
								)
							}
						>
								<i className="fas fa-plus" /> {strings.CreatePO}
							</DropdownItem>
							)}
								{row.status === 'Approved' && (
							<DropdownItem
							onClick={() =>
								this.props.history.push(
									'/admin/expense/supplier-invoice/create',
									{ rfqId: row.id },
								)
							}>
								<i className="fas fa-plus" />{strings.CreateSupplierInvoice}
							</DropdownItem>
							)}
							{ row.status !== "Closed" && row.status !== "Approved" &&row.status !== "Rejected"  && row.status !== "Invoiced"   && (
							<DropdownItem
								onClick={() => {
									this.sendMail(row);
								}}
							>
								<i className="fas fa-send" /> {strings.Send}
							</DropdownItem>
							)}
						{row.status === 'Draft' && (
                            <DropdownItem
								onClick={() => {
									this.changeStatus(row.id,"Sent");
								}}
							>
							<i className="far fa-arrow-alt-circle-right"></i>Mark As Sent
							</DropdownItem>)}
                          {row.status != 'Draft' && 
							row.status != 'Approved' && 
							row.status != 'Closed' && 
							row.status != "Invoiced" && 
							(
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
							
							{(row.status === 'Sent'|| row.status === "Approved"|| row.status === "Rejected" ||  row.status === "Invoiced"  ) && (
							<DropdownItem
							onClick={() => {
							this.changeStatus(row.id,row.statusEnum);
							}}
							>
								<i className="far fa-times-circle" /> {strings. Close}
							</DropdownItem>
							)}
							<DropdownItem					
								onClick={() =>
									this.props.history.push(`/admin/expense/request-for-quotation/create`,{parentId: row.id})
								}
							>
								<i className="fas fa-copy" /> {strings.CreateADuplicate}
							</DropdownItem>
						<DropdownItem
							onClick={() =>
								this.props.history.push(
									'/admin/expense/request-for-quotation/view',
									{ id: row.id ,status:row.status},
								)
							}
						>
							<i className="fas fa-eye" /> {strings. View}
						</DropdownItem>
						{/* {row.statusEnum === 'Sent' && (
							<DropdownItem
								onClick={() => {
									this.unPostInvoice(row);
								}}
							>
								<i className="fas fa-file" /> Draft
							</DropdownItem>
						)} */}
				
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
				this.props.requestForQuotationAction
				.changeStatus(id,status)
				.then((res) => {
					if (res.status === 200) {
						this.props.commonActions.tostifyAlert(
							'success',
							res.data ? res.data.message : 'Status Changed Successfully'
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
				err.data ? err.data.message : 'Status Changed Unsuccessfully'
			);
		});

	}

	renderActionForState = (id) => {
		this.props.purchaseOrderAction.getVatList();
		this.props.purchaseOrderAction.getProductList();
		this.props.requestForQuotationDetailsAction.getRFQeById(id).then((res) => {
			this.setState({		
				// current_rfq_id: this.props.location.state.id,
				openPurchaseOrder : true, rowId : id,
				    selectedData:res.data,
					rfqReceiveDate: res.data.rfqReceiveDate
						? moment(res.data.rfqReceiveDate).format('DD-MM-YYYY')
						: '',
						rfqExpiryDate: res.data.rfqExpiryDate
						? moment(res.data.rfqExpiryDate).format('DD-MM-YYYY')
						: '',
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



	closePurchaseOrder = (res) => {
		this.setState({ openPurchaseOrder: false });
	};
	updateParentAmount = (totalAmount,totalVatAmount) => {
		this.setState({totalAmount:totalAmount,totalVatAmount:totalVatAmount})
		console.log(totalAmount,"00000000")
		console.log(totalVatAmount,"00000000")
	};
		
	// sendMail = (id) => {
	// 	this.props.requestForQuotationAction
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
		this.props.requestForQuotationAction
			.removeBulk(obj)
			.then((res) => {
				this.initializeData(filterData);
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Request For Quotation Deleted Successfully'
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
					err.data ? err.data.message : 'Request For Quotation Deleted Unsuccessfully'
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
		this.setState({ loading:true, loadingMsg:"Sent Request For Quotation..."});
		this.props.requestForQuotationAction
			.sendMail(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Request For Quotation Posted Successfully'
					);
					this.setState({
						loading: false,
					});
					this.initializeData();
					this.setState({ loading:false,});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Request For Quotation Posted Unsuccessfully'
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
		this.props.requestForQuotationAction
			.unPostInvoice(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Request For Quotation Unposted Successfully'
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
					err.data ? err.data.message : 'Request For Quotation Unosted Unsuccessfully'
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
		this.props.requestForQuotationAction
			.deleteInvoice(id)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Request For Quotation Deleted Successfully'
				);
				this.initializeData();
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Request For Quotation Deleted Unsuccessfully'
				);
			});
	};

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.requestForQuotationAction
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
			loading,loadingMsg,
			filterData,
			dialog,
			selectedRows,
			csvData,
			view,
		} = this.state;
		const {
			status_list,
			supplier_list,
			request_for_quotation_list,
			universal_currency_list
		} = this.props;
		console.log(this.state.openPurchaseOrder)
		console.log(request_for_quotation_list.data)

		const request_for_quotation_data =
		request_for_quotation_list && request_for_quotation_list.data
				? this.props.request_for_quotation_list.data.data.map((supplier) => ({
						id: supplier.id,
						status: supplier.status,
						supplierName: supplier.supplierName,
						rfqNumber: supplier.rfqNumber,
						rfqReceiveDate: supplier.rfqReceiveDate ? supplier.rfqReceiveDate : '',
						rfqExpiryDate: supplier.rfqExpiryDate
							? supplier.rfqExpiryDate
							: '',
						totalAmount: supplier.totalAmount,
						totalVatAmount: supplier.totalVatAmount,
						currencyCode: supplier.currencyCode,
						currencyName:supplier.currencyName,
						statusEnum:supplier.statusEnum
					
				  }))
				: '';

		
		let tmpSupplier_list = []

		supplier_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpSupplier_list.push(obj)
		})		

		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
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
										<span className="ml-2">{strings.RequestForQuotation}</span>
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
												`/admin/expense/request-for-quotation/create`,
											)
										}
									>
										<i className="fas fa-plus mr-1" />
										{strings.AddNewRequest}
									</Button>
									</div>
									</Row> 
{/* 								
						<div className="ag-theme-alpine mb-3" style={{ height: 550, width: "100%" }}>

							<AgGridReact

									rowData={
										request_for_quotation_data
											? request_for_quotation_data
											: []}
									pagination={true}
									rowSelection="multiple"
									paginationPageSize={this.state.paginationPageSize}
									floatingFilter={true}
									defaultColDef={{
										resizable: true,
										flex: 1,
										sortable: true
									}}
									sideBar="columns"
									onGridReady={this.onGridReady}
									
								>	
									<AgGridColumn 
												field="rfqNumber" 
												headerName=	{strings.RFQNUMBER}
												sortable={ true } 
												filter={ true } 
												enablePivot={ true } 
												// cellRendererFramework={(params) => params.data.request_for_quotation_list === "" || params.data.request_for_quotation_list === null ?
												// 	params.data.request_for_quotation_list
												// 	:
												// 	params.data.grnNumber}
												cellRendererFramework={(params) => <label
													className="mb-0 label-bank"
													style={{
														cursor: 'pointer',
														}}               
										>
										{params.value}
										</label>
								}
											></AgGridColumn>

									<AgGridColumn 
										field="supplierName"
										headerName={strings.SUPPLIERNAME}
										sortable={true}
										filter={true}
										enablePivot={true}

										// cellRendererFramework={(params) =>
										// 	<>
										// 		{this.renderTaxReturns(params.value, params)}
										// 	</>
										// }
									></AgGridColumn>

									<AgGridColumn 
										field="renderRFQStatus"
										headerName={strings.STATUS}
										sortable={true}
										filter={true}
										enablePivot={true}

										cellRendererFramework={(params) => <label
											className="mb-0 label-bank"
											style={{
												cursor: 'pointer',
												}}               
												>
												{this.renderRFQStatus(params.value, params.data,request_for_quotation_list)}
												</label>
												}
									></AgGridColumn>

									<AgGridColumn 
										field="rfqReceiveDate"
										headerName={strings.RFQDATE}
										sortable={true}
										filter={true}
										enablePivot={true}

										// cellRendererFramework={(params) =>
										// 	<>
										// 		{this.renderTaxReturns(params.value, params)}
										// 	</>
										// }
									></AgGridColumn>
									
									<AgGridColumn 
										field="rfqExpiryDate"
										headerName={strings.RFQDUEDATE}
										sortable={true}
										filter={true}
										enablePivot={true}

										// cellRendererFramework={(params) =>
										// 	<>
										// 		{this.renderTaxReturns(params.value, params)}
										// 	</>
										// }
									></AgGridColumn>

									<AgGridColumn 
										field="totalAmount"
										headerName={strings.AMOUNT}
										sortable={true}
										filter={true}
										enablePivot={true}

										cellRendererFramework={(params) =>
											<>
												{this.renderAmount(params.value, params.data,request_for_quotation_list)}
											</>
										}
									></AgGridColumn>

									<AgGridColumn 
										field="action"
										// className="Ag-gridActionButtons"
										headerName="ACTIONS"
										cellRendererFramework={(params) =>
											<div
											 className="Ag-gridActionButtons"
											 >
												{this.getActionButtons(params.data)}
											</div>

										}
									></AgGridColumn>

							</AgGridReact>
								
							<div className="example-header mt-1">
												Page Size:
												<select onChange={() => this.onPageSizeChanged()} id="page-size">
												<option value="10" selected={true}>10</option>
												<option value="100">100</option>
												<option value="500">500</option>
												<option value="1000">1000</option>
												</select>
											</div>
						</div> */}

										<BootstrapTable
											selectRow={this.selectRowProp}
											search={false}
											options={this.options}
											data={request_for_quotation_data ? request_for_quotation_data : []}
											version="4"
											hover
											keyField="id"
											pagination={
												true
											}
											remote
											fetchInfo={{
												dataTotalSize: request_for_quotation_list && request_for_quotation_list && request_for_quotation_list.data && request_for_quotation_list.data.count
													? request_for_quotation_list.data.count
													: 0,
											}}
											className="supplier-invoice-table"
											ref={(node) => (this.table = node)}
										
										>
											<TableHeaderColumn
												dataField="rfqNumber"
												// dataFormat={this.renderInvoiceNumber}
												dataSort
											//	width="10%"
												className="table-header-bg"
											>
											{strings.RFQNUMBER}
											</TableHeaderColumn>
											
											<TableHeaderColumn
												tdStyle={{ whiteSpace: 'normal' }}
												dataField="supplierName"
												dataSort
											//	width="12%"
												className="table-header-bg"
											>
												{strings.SUPPLIERNAME}
											</TableHeaderColumn>
											
											<TableHeaderColumn
												dataField="rfqReceiveDate"
												dataSort
											//	width="7%"
												dataFormat={this.orderDate}
												className="table-header-bg"
											>
												{strings.RFQDATE}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="rfqExpiryDate"
												dataSort
											//	width="7%"
												dataFormat={this.rfqDueDate}
												className="table-header-bg"
											>
												{strings.RFQDUEDATE}
											</TableHeaderColumn>
											<TableHeaderColumn
											//	width="10%"
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
												width="20%"
												dataFormat={this.renderrfqAmount}
												className="table-header-bg"
												formatExtraData={universal_currency_list}
											>
												 {strings.AMOUNT}
											</TableHeaderColumn>
											
											<TableHeaderColumn
												className="text-right"
												columnClassName="text-right"
												//width="5%"
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
				<CreatePurchaseOrder
					openPurchaseOrder={this.state.openPurchaseOrder}
					closePurchaseOrder={(e) => {
						this.closePurchaseOrder(e);
					}}
					updateParentAmount={
						(e,e1) => {
							this.updateParentAmount(e,e1);
					}}
					id={this.state.rowId}
                    selectedData={this.state.selectedData}
				//getRfqbyid={this.props.requestForQuotationDetailsAction.getRFQeById}
				//	 getState={this.props.requestForQuotationDetailsAction.renderActionForState}
				//	getInvoice={this.props.purchaseOrderCreateAction.getPoNo()}
					prefixData={this.state.prefixData}
				//	nextprefixData={this.state.nextprefixData}
				//	getVat={this.props.purchaseOrderAction.getVatList()}
				//	getProductList={this.props.purchaseOrderAction.getProductList()}
					createPO={this.props.purchaseOrderCreateAction.createPO}
                    totalAmount={this.state.totalAmount}
					getNextTemplateNo={()=>{
						this.props.purchaseOrderCreateAction.getPoNo().then((response) => {
							this.setState({prefixData:response.data	});
							});}}
					totalVatAmount={this.state.totalVatAmount}
				/>
			</div>
			</div>
		); 
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(RequestForQuotation);
