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
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { selectOptionsFactory } from 'utils';
import { Loader, ConfirmDeleteModal, Currency } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { CommonActions } from 'services/global';
import * as ReceiptActions from './actions';
import moment from 'moment';
import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		receipt_list: state.receipt.receipt_list,
		invoice_list: state.receipt.invoice_list,
		contact_list: state.receipt.contact_list,
		universal_currency_list: state.common.universal_currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		receiptActions: bindActionCreators(ReceiptActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
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

class Receipt extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			selectedRows: [],
			dialog: false,
			filterData: {
				contactId: '',
				invoiceId: '',
				receiptReferenceCode: '',
				receiptDate: '',
				contactType: 2,
			},
			csvData: [],
			view: false,
			language: window['localStorage'].getItem('language'),
			currentPage: 1,
		};

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
		this.props.receiptActions.getContactList(filterData.contactType);
		this.props.receiptActions.getInvoiceList();
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

		this.props.receiptActions
			.getReceiptList(postData)
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
		this.props.history.push('/admin/income/viewCustomerInvoice/detail', {
			id: row.receiptId,
		});
	};

	renderMode = (cell, row) => {
		return <span className="badge badge-success mb-0">Cash</span>;
	};

	renderDate = (cell, rows) => {
		return rows['receiptDate'] !== null
			? moment(rows['receiptDate']).format('DD-MM-YYYY')
			: '';
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
		return row.amount ? row.currencyIsoCode +" "+ row.amount.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : '';
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
		if (isSelected) {
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.receiptId);
		} else {
			this.state.selectedRows.map((item) => {
				if (item !== row.receiptId) {
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
			rows.map((item) => tempList.push(item.receiptId));
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	bulkDelete = () => {
		const { selectedRows } = this.state;
		const message1 =
        <text>
        <b>Delete Income Receipt?</b>
        </text>
        const message = 'This Income Receipt will be deleted permanently and cannot be recovered. ';
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
		let { selectedRows } = this.state;
		const { receipt_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.removeDialog();
		this.props.receiptActions
			.removeBulk(obj)
			.then((res) => {
				this.initializeData();
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Deleted Successfully'
				);
				if (receipt_list && receipt_list.length > 0) {
					this.setState({
						selectedRows: [],
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Deleted Unsuccessfully'
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

	clearAll = () => {
		this.setState(
			{
				filterData: {
					contactId: '',
					invoiceId: '',
					receiptReferenceCode: '',
					receiptDate: '',
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
		} = this.state;
		const {
			receipt_list,
			contact_list,
		} = this.props;
		
		let tmpContact_list = []

		contact_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpContact_list.push(obj)
		})

		return (
			loading ==true? <Loader/> :
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
										<i className="fas fa-receipt" />
										<span className="ml-2">{strings.Receipts}</span>
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
														filename={'Receipt.csv'}
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
												{/* <Col lg={2} className="mb-1">
													<Input
														type="text"
														placeholder="Reference Number"
														value={filterData.receiptReferenceCode}
														onChange={(e) => {
															this.handleChange(
																e.target.value,
																'receiptReferenceCode',
															);
														}}
													/>
												</Col> */}
												{/* <Col lg={2} className="mb-1">
													<Select
														styles={customStyles}
														options={
															invoice_list
																? selectOptionsFactory.renderOptions(
																		'label',
																		'value',
																		invoice_list,
																		'Invoice Number',
																  )
																: []
														}
														className="select-default-width"
														placeholder={strings.InvoiceNumber}
														value={filterData.invoiceId}
														onChange={(option) => {
															if (option && option.value) {
																this.handleChange(option, 'invoiceId');
															} else {
																this.handleChange('', 'invoiceId');
															}
														}}
													/>
												</Col> */}
												<Col lg={3} className="mb-1">
													<Select
														styles={customStyles}
														options={
															tmpContact_list
																? selectOptionsFactory.renderOptions(
																		'label',
																		'value',
																		tmpContact_list,
																		'Customer',
																  )
																: []
														}
														className="select-default-width"
														placeholder={strings.Select+" "+strings.Customer}
														value={filterData.contactId}
														onChange={(option) => {
															if (option && option.value) {
																this.handleChange(option, 'contactId');
															} else {
																this.handleChange('', 'contactId');
															}
														}}
													/>
												</Col>
												<Col lg={2} className="mb-1">
													<DatePicker
														className="form-control"
														id="date"
														name="receiptDate"
														placeholderText={strings.Select + strings.ReceiptDate}
														selected={filterData.receiptDate}
														autoComplete="off"
														showMonthDropdown
														showYearDropdown
														dateFormat="dd-MM-yyyy"
														dropdownMode="select"
														onChange={(value) => {
															this.handleChange(value, 'receiptDate');
														}}
													/>
												</Col>
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
													this.props.history.push(`/admin/income/receipt/create`)
												}
										>
											<i className="fas fa-plus mr-1" />
											{strings.AddNewReceipt}
										</Button>
										</div>
										</Row> */}
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												data={
													receipt_list && receipt_list.data
														? receipt_list.data
														: []
												}
												version="4"
												keyField="receiptId"
												hover
												pagination={
													receipt_list &&
													receipt_list.data &&
													receipt_list.data.length > 0
														? true
														: false
												}
												remote
												fetchInfo={{
													dataTotalSize: receipt_list.count
														? receipt_list.count
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
												className="receipt-table"
												trClassName="cursor-pointer"
												csvFileName="Receipt.csv"
												ref={(node) => (this.table = node)}
											>

												<TableHeaderColumn
													dataField="receiptDate"
													dataSort
													dataFormat={this.renderDate}
													className="table-header-bg"
													
												>
													{strings.ReceivedDate}
												</TableHeaderColumn>
												
												<TableHeaderColumn
													dataField="invoiceNumber"
													dataSort
												    className="table-header-bg"
												>
													{strings.InvoiceNumber}
												</TableHeaderColumn>
												
												<TableHeaderColumn 
													dataField="customerName" 
													dataSort
													className="table-header-bg"
												>
													{strings.CustomerName}
												</TableHeaderColumn>
												
												<TableHeaderColumn 
												dataField="receiptId" 
												dataSort
												className="table-header-bg"
												>
													{strings.RECEIPTNUMBER}
												</TableHeaderColumn>

												<TableHeaderColumn
													width="10%"
													dataAlign="right"
													dataField="amount"
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

export default connect(mapStateToProps, mapDispatchToProps)(Receipt);
