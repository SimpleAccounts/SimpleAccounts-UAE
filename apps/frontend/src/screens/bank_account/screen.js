/* eslint-disable no-duplicate-case */
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
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Loader, ConfirmDeleteModal, } from 'components';
import { CommonActions } from 'services/global';
import * as BankAccountActions from './actions';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		is_authed: state.auth.is_authed,
		account_type_list: state.bank_account.account_type_list,
		currency_list: state.bank_account.currency_list,
		bank_account_list: state.bank_account.bank_account_list,
		universal_currency_list: state.common.universal_currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		bankAccountActions: bindActionCreators(BankAccountActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class BankAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dialog: null,
			actionButtons: {},
			selected_id_list: [],
			filterData: {
				bankName: '',
				bankAccountTypeId: '',
				bankAccountName: '',
				transactionDate: '',
				accountNumber: '',
				currencyCode: '',
			},
			csvData: [],
			view: false,
			language: window['localStorage'].getItem('language'),
		};

		this.options = {
			paginationPosition: 'bottom',
			page: 1,
			sizePerPage: 10,
			sortName: '',
			sortOrder: '',
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			onSortChange: this.sortColumn,
		};

		this.selectRowProp = {
			// mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};
		this.csvLink = React.createRef();
	}

	componentDidMount = () => {
		this.props.bankAccountActions.getAccountTypeList();
		this.props.bankAccountActions.getCurrencyList();
		this.initializeData();
	};

	initializeData = () => {
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

		this.props.bankAccountActions
			.getBankAccountList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						loading: false,
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

	inputHandler = (name, val) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: val,
			}),
		});
	};

	handleSearch = () => {
		this.initializeData();
	};

	// filterBankAccountList (bank_account_list) {
	//   let data = []
	//   const {
	//     filter_bank,
	//     filter_account_type,
	//     filter_account_name,
	//     filter_account_number,
	//     filter_currency
	//   } = this.state

	//   data = filterFactory.filterDataList(filter_bank, 'bankName', 'contain', bank_account_list)
	//   let data_temp = []
	//   data.map((item) => {
	//     let flag = true
	//     flag = filterFactory.compareString(
	//       filter_account_type ? filter_account_type.value : '',
	//       item.bankAccountTypeName && item.bankAccountTypeName.id ? item.bankAccountTypeName.id : '',
	//       'match'
	//     )
	//     if (flag) {
	//       let temp = Object.assign({}, item)
	//       data_temp.push(temp)
	//     }
	//   })
	//   data = filterFactory.filterDataList(filter_account_name, 'bankAccountName', 'contain', data_temp)
	//   data_temp = filterFactory.filterDataList(filter_account_number, 'accountNumber', 'contain', data)
	//   data = []
	//   data_temp.map((item) => {
	//     let flag = true
	//     flag = filterFactory.compareString(
	//       filter_currency ? filter_currency.value : '',
	//       item.bankAccountCurrency && item.bankAccountCurrency.currencyCode ? item.bankAccountCurrency.currencyCode : '',
	//       'match'
	//     )
	//     if (flag) {
	//       let temp = Object.assign({}, item)
	//       data.push(temp)
	//     }
	//   })
	//   return data
	// }

	renderAccountType = (cell, row) => {
		if (row.bankAccountTypeName) {
			let data = null;
			switch (row.bankAccountTypeName) {
				case 'Saving':
				case 'saving':
					data = (
						<label className="badge label-currency text-white mb-0">
							{row.bankAccountTypeName}
						</label>
					);
					break;
				case 'Current':
				case 'current':
					data = (
						<label className="badge label-currency text-white mb-0">
							{row.bankAccountTypeName}
						</label>
					);
					break;
				case 'Checking':
				case 'checking':
					data = (
						<label className="badge label-currency text-white mb-0">
							{row.bankAccountTypeName}
						</label>
					);
					break;
				case 'Credit Card':
				case 'credit card':
					data = (
						<label className="badge label-currency text-white mb-0">
							{row.bankAccountTypeName}
						</label>
					);
					break;
				case 'Others':
				case 'others':
					data = (
						<label className="badge label-currency text-white mb-0">
							{row.bankAccountTypeName}
						</label>
					);
					break;
				case 'Paypal':
				case 'paypal':
					data = (
						<label className="badge label-currency text-white mb-0">
							{row.bankAccountTypeName}
						</label>
					);
					break;
				case 'Cash':
				case 'Cash':
					data = (
						<label className="badge label-currency text-white mb-0">
							{row.bankAccountTypeName}
						</label>
					);
					break;
				default:
					data = (
						<label className="badge label-danger mb-0">No Specified</label>
					);
					break;
			}
			return data;
		} else {
			return <label className="badge label-danger mb-0">No Specified</label>;
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

	renderAccountNumber = (cell, row) => {
		return (
			<label
				className="mb-0 label-bank"
				style={{
					cursor: 'pointer',
					}}
				onClick={() =>
					this.props.history.push('/admin/banking/bank-account/transaction', {
						bankAccountId: row.bankAccountId,
						closingBalance: row.closingBalance,
						openingBalance: row.openingBalance,
						accounName: row.accounName,
						currency:row.curruncySymbol
					})
				}
			>
				{row.bankAccountNo}
			</label>
		);
	};

	renderCurrency = (cell, row) => {
		if (row.currancyName) {
			return (
				<label className="badge label-currency mb-0">{row.currancyName}</label>
			);
		} else {
			return <label className="badge badge-danger mb-0">No Specified</label>;
		}
	};

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	renderBalance(cell, row, extraData) {
		// return row.openingBalance === 0 ? (
		// 	<Currency
		// 		value={row.openingBalance}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// ) : (
		// 	<Currency
		// 		value={row.openingBalance}
		// 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
		// 	/>
		// );

		return row.openingBalance ? row.currancyName+" " + row.openingBalance.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) : row.currancyName+" " + row.openingBalance.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 });
	};
	renderActions = (cell, row) => {
		return (
			<div>
				<ButtonDropdown
					isOpen={this.state.actionButtons[row.bankAccountId]}
					toggle={(e) => {
						e.preventDefault();
						this.toggleActionButton(row.bankAccountId);
					}}
				>
					<DropdownToggle size="sm" color="primary" className="btn-brand icon">
						{this.state.actionButtons[row.bankAccountId] === true ? (
							<i className="fas fa-chevron-up" />
						) : (
							<i className="fas fa-chevron-down" />
						)}
					</DropdownToggle>
					<DropdownMenu right>
					{row.name !== 'PettyCash' &&(
						<DropdownItem
						onClick={() =>this.props.history.push('/admin/banking/bank-account/transaction/create',
						{bankAccountId: row.bankAccountId,
							currency:row.curruncySymbol})}
						
					>
				<i className="fas fa-plus" />{strings.AddnewTransaction}
					</DropdownItem>
					)		}				
					
					{row.bankAccountId != 10000 && row.transactionCount === 0 ? 
						<DropdownItem
						onClick={() =>
							this.props.history.push('/admin/banking/bank-account/detail', {
								bankAccountId: row.bankAccountId,
								currency:row.curruncySymbol

							})
						}

					>
							<i className="fa fa-edit" /> Edit
						</DropdownItem> : ''}
						<DropdownItem
							onClick={() => {
								this.props.history.push(
									'/admin/banking/bank-account/transaction',
									{
										bankAccountId: row.bankAccountId,
										closingBalance: row.closingBalance,
										openingBalance: row.openingBalance,
										accounName: row.accounName,
										currency:row.curruncySymbol
									},
								);
							}}
						>
							<i className="fas fa-eye" />  {strings.ViewTransactions}
						</DropdownItem>
						{row.bankAccountId != 10000 && row.transactionCount === 0 ? 
						<DropdownItem
							onClick={() => this.closeBankAccount(row.bankAccountId)}
						>
							<i className="fa fa-trash" /> Delete
						</DropdownItem> : ''}
					</DropdownMenu>
				</ButtonDropdown>
			</div>
		);
	};

	closeBankAccount = (_id) => {
		this.props.bankAccountActions
			.getExplainCount(_id)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to unexplain all the transaction to delete this bank',
					);
				} else {
					const message1 =
					<text>
					<b>Delete Bank Account?</b>
					</text>
					const message ='This Bank Account will be deleted permanently and cannot be recovered.';
					this.setState({
						dialog: (
							<ConfirmDeleteModal
								isOpen={true}
								okHandler={() => this.removeBankAccount(_id)}
								cancelHandler={this.removeDialog}
								message1={message1}
								message={message}
							/>
						),
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

	removeBankAccount = (_id) => {
		this.removeDialog();
		this.props.bankAccountActions
			.removeBankAccountByID(_id)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					res.data? res.data.message: 'Bank account Deleted Successfully  ',
				);
				this.initializeData();
				let tempList = [];
				this.state.selected_id_list.map((item) => {
					if (item !== _id) {
						tempList.push(item);
					}
					return item;
				});
				this.setState({
					selected_id_list: tempList,
				});
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Bank Account Deleted Unsuccessfully',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	renderLastReconciled = (cell, row, extraData) => {
		return (
			<div>
				<div>
					<label className="font-weight-bold ">{strings.Reconciled} <br />{strings.Balance} : </label>
					<label className="badge label-bank ">
						{/* <Currency
							value={row.closingBalance}
							currencySymbol={
								extraData[0] ? extraData[0].currencyIsoCode : 'USD'
							}
						/> */}
						{row.closingBalance ? row.currancyName+" " + row.closingBalance.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 }) : row.currancyName+" " + row.closingBalance.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })}
					</label>
				</div>
				<div>
					<label className="font-weight-bold mr-2">{strings.Date} : </label>
					<label>{row.reconcileDate}</label>
				</div>
			</div>
		);
	};

	onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.selected_id_list);
			tempList.push(row.bankAccountId);
		} else {
			this.state.selected_id_list.map((item) => {
				if (item !== row.bankAccountId) {
					tempList.push(item);
				}
				return item;
			});
		}
		this.setState({
			selected_id_list: tempList,
		});
	};

	onSelectAll = (isSelected, rows) => {
		let tempList = [];
		if (isSelected) {
			rows.map((item) => {
				tempList.push(item.bankAccountId);
				return item;
			});
		}
		this.setState({
			selected_id_list: tempList,
		});
	};

	bulkDeleteBankAccount = () => {
		let { selected_id_list } = this.state;
		const message1 =
					<text>
					<b>Delete Bank Account?</b>
					</text>
					const message ='This Bank Account will be deleted permanently and cannot be recovered.';
		if (selected_id_list.length > 0) {
			this.setState({
				dialog: (
					<ConfirmDeleteModal
						isOpen={true}
						okHandler={this.removeBulkBankAccount}
						cancelHandler={this.removeDialog}
						message1={message1}
						message={message}
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

	removeBulkBankAccount = () => {
		this.removeDialog();
		let { selected_id_list } = this.state;
		let obj = {
			ids: selected_id_list,
		};
		this.props.bankAccountActions
			.removeBulkBankAccount(obj)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Bank Account Deleted Successfully',
				);
				this.initializeData();
				this.setState({
					selected_id_list: [],
				});
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Bank Account Deleted Unsuccessfully',
				);
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

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.bankAccountActions.getBankAccountList(obj).then((res) => {
				if (res.status === 200) {
					var result = res.data.data.map((o) => ({
						'Bank Name': o.name,
						'Account Number': o.bankAccountNo,
						'Account Name': o.accounName,
						'Bank Account Type': o.bankAccountTypeName,
						'Closing Balance': o.closingBalance,
						'Opening Balance': o.openingBalance,
						'Reconciled Date': o.reconcileDate,
						currency: o.currancyName,
					}));
					this.setState({ csvData: result, view: true }, () => {
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
					bankName: '',
					bankAccountTypeId: '',
					bankAccountName: '',
					transactionDate: '',
					accountNumber: '',
					currencyCode: '',
				},
			},
			() => {
				this.initializeData();
			},
		);
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading, dialog, csvData, view } = this.state;
		const { universal_currency_list, bank_account_list } = this.props;

		return (
			loading ==true? <Loader/> :
<div>
			<div className="bank-account-screen">
				<div className="animated fadeIn">
					{dialog}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={8}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fas fa-university" />
										<span className="ml-2">{strings.BankAccounts} </span>
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
										{/* <div className="d-flex justify-content-end">
											<ButtonGroup size="sm">
												<Button
													color="primary"
													className="btn-square"
													onClick={() => this.getCsvData()}
												>
													<i className="fa glyphicon glyphicon-export fa-download mr-1" />
													Export To CSV
												</Button>
												{view && (
													<CSVLink
														data={csvData}
														filename={'BankAccount.csv'}
														className="hidden"
														ref={this.csvLink}
														target="_blank"
													/>
												)}
											</ButtonGroup>
										</div> */}
										{/* <div className="py-3">
											<h5>Filter : </h5>
											<Row>
												<Col lg={2} className="mb-1">
													<Input
														type="text"
														placeholder="Bank"
														value={filterData.bankName}
														onChange={(e) =>
															this.inputHandler('bankName', e.target.value)
														}
													/>
												</Col>
												<Col lg={2} className="mb-1">
													<Select
														className=""
														options={
															account_type_list
																? selectOptionsFactory.renderOptions(
																		'name',
																		'id',
																		account_type_list,
																		'Account Type',
																  )
																: []
														}
														value={filterData.bankAccountTypeId}
														onChange={(option) =>
															this.inputHandler('bankAccountTypeId', option)
														}
														placeholder="Account Type"
													/>
												</Col>
												<Col lg={2} className="mb-1">
													<Input
														type="text"
														placeholder="Account Name"
														value={filterData.bankAccountName}
														onChange={(e) =>
															this.inputHandler(
																'bankAccountName',
																e.target.value,
															)
														}
													/>
												</Col>
												<Col lg={2} className="mb-1">
													<Input
														type="text"
														placeholder="Account Number"
														value={filterData.accountNumber}
														onChange={(e) =>
															this.inputHandler('accountNumber', e.target.value)
														}
													/>
												</Col>
												<Col lg={2} className="mb-1">
													<Select
														className=""
														options={
															currency_list
																? selectCurrencyFactory.renderOptions(
																		'currencyName',
																		'currencyCode',
																		currency_list,
																		'Currency',
																  )
																: []
														}
														value={filterData.currencyCode}
														onChange={(option) =>
															this.inputHandler('currencyCode', option)
														}
														placeholder="Currency"
													/>
												</Col>
												<Col lg={1} className="pl-0 pr-0">
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
										<Row>
											<div style={{width:"1560px"}}>
										<Button
											color="primary"
											className="btn-square mr-1 pull-right mb-2"
											style={{ marginBottom: '10px' }}
											onClick={() =>
												this.props.history.push(
													`/admin/banking/bank-account/create`,
												)
											}
										>
											<i className="fas fa-plus mr-1" />
											{strings.AddNewAccount}
										</Button>
										</div>
										</Row>
											<BootstrapTable
										//	width="100%"
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												data={
													bank_account_list && bank_account_list.data
														? bank_account_list.data
														: []
												}
												version="4"
												hover
												// totalSize={bank_account_list ? bank_account_list.length : 0}
												pagination={
													bank_account_list &&
													bank_account_list.data &&
													bank_account_list.data.length > 0
														? true
														: false
												}
												remote
												keyField="bankAccountId"
												multiColumnSort
												fetchInfo={{
													dataTotalSize:
														bank_account_list && bank_account_list.count
															? bank_account_list.count
															: 0,
												}}
												className="bank-account-table"
												csvFileName="bank_account_list.csv"
												ref={(node) => {
													this.table = node;
												}}
											>
												
												<TableHeaderColumn
													tdStyle={{ whiteSpace: 'normal' }}
													dataField="name"
													dataSort
													width="8%"
													className="table-header-bg"
												>
													{strings.BANKNAME}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="accounName"
													dataSort
													width="10%"
													className="table-header-bg"
												>
													{strings.ACCOUNTNAME}
												</TableHeaderColumn>
												<TableHeaderColumn
													tdStyle={{ whiteSpace: 'normal' }}
													dataField="bankAccountNo"
													dataFormat={this.renderAccountNumber}
													dataSort
													width="10%"
													className="table-header-bg"
												>
													{strings.ACCOUNTNUMBER}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataFormat={this.renderAccountType}
													dataField="bankAccountTypeName"
													dataSort
													width="7%"
													className="table-header-bg"
												>
													{strings.ACCOUNTTYPE}
												</TableHeaderColumn>
												
												<TableHeaderColumn
													// dataAlign="right"
													dataField="openingBalance"
													dataSort
													width="10%"													
													dataFormat={this.renderBalance}
													formatExtraData={universal_currency_list}
													className="table-header-bg"
												>
													{strings.BANKBALANCE}
												</TableHeaderColumn> 
												<TableHeaderColumn
													
													dataField="swift_code"
													export={false}
													dataSort={false}
													dataFormat={this.renderLastReconciled}
													formatExtraData={universal_currency_list}
													width="10%"
													className="table-header-bg"
												>
													{strings.LASTRECONCILED}
												</TableHeaderColumn>
												<TableHeaderColumn
													
													columnClassName="text-right"
													width="3%"
													dataSort={false}
													export={false}
													dataFormat={this.renderActions}
													className="table-header-bg text-right"
												>
												</TableHeaderColumn>
											</BootstrapTable>
										
									</Col>
								</Row>
							)}
						</CardBody>
					</Card>
				</div>
			</div></div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(BankAccount);
