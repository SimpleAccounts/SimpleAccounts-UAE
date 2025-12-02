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
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { CSVLink } from 'react-csv';

import { Loader, ConfirmDeleteModal, Currency } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'bootstrap-daterangepicker/daterangepicker.css';

import * as JournalActions from './actions';
import { CommonActions } from 'services/global';

import moment from 'moment';

import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	console.log('state', state.journal.cancel_flag)
	return {
		journal_list: state.journal.journal_list,
		universal_currency_list: state.common.universal_currency_list,
		page_num: state.journal.page_num,
		cancel_flag: state.journal.cancel_flag
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		journalActions: bindActionCreators(JournalActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class Journal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			actionButtons: {},
			dialog: null,
			selectedRows: [],
			filterData: {
				journalDate: '',
				journalReferenceNo: '',
				description: '',
			},
			csvData: [],
			view: false,
			language: window['localStorage'].getItem('language'),
		};

		this.options = {
			onRowClick: this.goToDetail,
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
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
		this.initializeData();
	};

	componentWillUnmount = () => {
		this.setState({
			selectedRows: [],
		});
	};

	initializeData = (search) => {
		const { filterData } = this.state;
		if(this.props.cancel_flag)
		this.options.page = this.props.page_num
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };
		this.props.journalActions
			.getJournalList(postData)
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
		this.props.journalActions.setCancelFlag(false)
	};

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	// renderStatus (cell, row) {
	//   let label = ''
	//   let class_name = ''
	//   if (row.transactionCategoryCode === 4) {
	//     label = 'New'
	//     class_name = 'badge-danger'
	//   } else {
	//     label = 'Posted'
	//     class_name = 'badge-success'
	//   }
	//   return (
	//     <span className={`badge ${class_name} mb-0`}>{ label }</span>
	//   )
	// }

	// renderJournalNumber (cell, row) {
	//   return (
	//     <label
	//       className="mb-0 my-link"
	//       onClick={() => this.props.history.push('/admin/accountant/journal/detail')}
	//     >
	//       { row.transactionCategoryCode }3443543
	//     </label>
	//   )
	// }

	// renderActions (cell, row) {
	//   return (
	//     <div>
	//       <ButtonDropdown
	//         isOpen={this.state.actionButtons[row.transactionCategoryCode]}
	//         toggle={() => this.toggleActionButton(row.transactionCategoryCode)}
	//       >
	//         <DropdownToggle size="sm" color="primary" className="btn-brand icon">
	//           {
	//             this.state.actionButtons[row.transactionCategoryCode] === true ?
	//               <i className="fas fa-chevron-up" />
	//             :
	//               <i className="fas fa-chevron-down" />
	//           }
	//         </DropdownToggle>
	//         <DropdownMenu right>
	//           <DropdownItem onClick={() => this.props.history.push('/admin/accountant/journal/detail')}>
	//             <i className="fas fa-edit" /> Edit
	//           </DropdownItem>
	//           <DropdownItem>
	//             <i className="fas fa-file" /> Post
	//           </DropdownItem>
	//           <DropdownItem>
	//             <i className="fa fa-trash" /> Cancel
	//           </DropdownItem>
	//         </DropdownMenu>
	//       </ButtonDropdown>
	//     </div>
	//   )
	// }

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

	goToDetail = (row) => {
		if (row.postingReferenceType === "MANUAL")
			this.props.history.push('/admin/accountant/journal/detail', {
				id: row['journalId'], postingReferenceType: 'MANUAL'
			});
		else
			this.props.history.push('/admin/accountant/journal/view', {
				id: row['journalId'],
			});
	};

	onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.journalId);
		} else {
			this.state.selectedRows.map((item) => {
				if (item !== row.journalId) {
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
				tempList.push(item.journalId);
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	renderDate = (cell, rows) => {
		return rows.journalDate
			? moment(rows.journalDate).format('DD-MM-YYYY')
			: '';
	};

	renderAccount = (cell, rows) => {
		const temp =
			rows && rows.journalLineItems
				? rows.journalLineItems.map((item) => {
						return item['transactionCategoryName'];
				  })
				: [];
		const listItems = temp.map((number, index) => (
			<li key={index} style={{ listStyleType: 'none', paddingBottom: '5px' }}>
				{index === 0
					? number
					: number}
			</li>
		));
		return <ul style={{ padding: '0', marginBottom: '0px' }}>{listItems}</ul>;
	};

	renderCreditAmount = (cell, rows, extraData) => {
		const temp =
			rows && rows.journalLineItems
				? rows.journalLineItems.map((item) => {
						return item['creditAmount'];
				  })
				: [];
		const listItems = temp.map((number, index) => (
			<li key={index} style={{ listStyleType: 'none', paddingBottom: '5px' }}>
				<Currency
					value={number.toFixed(6)}
					currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
				/>
			</li>
		));
		return <ul style={{ padding: '0', marginBottom: '0px' }}>{listItems}</ul>;
	};

	renderDebitAmount = (cell, rows, extraData) => {
		const temp =
			rows && rows.journalLineItems
				? rows.journalLineItems.map((item) => {
						return item['debitAmount'];
				  })
				: [];
		const listItems = temp.map((number, index) => (
			<li key={index} style={{ listStyleType: 'none', paddingBottom: '5px' }}>
				<Currency
					value={number.toFixed(6)}
					currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
				/>
			</li>
		));
		return <ul style={{ padding: '0', marginBottom: '0px' }}>{listItems}</ul>;
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

	bulkDeleteJournal = () => {
		const { selectedRows } = this.state;
		const message1 =
			<text>
			<b>Delete Journal?</b>
			</text>
			const message = 'This Journal will be deleted permanently and cannot be recovered. ';
		if (selectedRows.length > 0) {
			this.setState({
				dialog: (
					<ConfirmDeleteModal
						isOpen={true}
						okHandler={this.removeBulkJournal}
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

	removeBulkJournal = () => {
		this.removeDialog();
		let { selectedRows } = this.state;
		const { journal_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.props.journalActions
			.removeBulkJournal(obj)
			.then((res) => {
				if (res.status === 200) {
					this.initializeData();
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message :'Journal Deleted Successfully',
					);
					if (journal_list && journal_list.length > 0) {
						this.setState({
							selectedRows: [],
						});
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Journal Deleted Unsuccessfully',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	onSizePerPageList = (sizePerPage) => {
		if (this.options.sizePerPage !== sizePerPage) {
			this.options.sizePerPage = sizePerPage;
			this.initializeData();
		}
	};

	onPageChange = (page, sizePerPage) => {
		// this.props.journalActions.getSavedPageNum(page)
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
			this.props.journalActions.getJournalList(obj).then((res) => {
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
					journalDate: '',
					journalReferenceNo: '',
					description: '',
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
			dialog,
			filterData,
			selectedRows,
			csvData,
			view,
		} = this.state;
		const { journal_list, universal_currency_list, page_num } = this.props;
		console.log(journal_list.data,"journal_list")
		const journal_list_data =
		journal_list && journal_list.data
				? this.props.journal_list.data.data.map((item) => ({
						
						journalDate: item.journalDate
							? item.journalDate
							: '',
							createdByName: item.createdByName,
							description: item.description,
							journalDate: item.journalDate,
							journalLineItems: item.journalLineItems,
							journalTransactionCategoryLabel: item.journalTransactionCategoryLabel,
							postingReferenceTypeDisplayName: item.postingReferenceTypeDisplayName,
							journalReferenceNo: item.journalReferenceNo,
							postingReferenceType: item.postingReferenceType,
							subTotalCreditAmount: item.subTotalCreditAmount,
							subTotalDebitAmount: item.subTotalDebitAmount,
							totalCreditAmount: item.totalCreditAmount,
							totalDebitAmount: item.totalDebitAmount,
							journalId:item.journalId,				
				  }))
				: '';
		
console.log(journal_list_data,"journal_list_data")
		return (
			loading ==true? <Loader/> :
<div>
			<div className="journal-screen">
				<div className="animated fadeIn">
					{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
					{dialog}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fa fa-diamond" />
										<span className="ml-2">{strings.Journal}</span>
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
														filename={'Journal.csv'}
														className="hidden"
														ref={this.csvLink}
														target="_blank"
													/>
												)} */}
												
												{/* <Button
                            color="primary"
                            className="btn-square mr-1"
                            onClick={this.bulkDeleteJournal}
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
													<DatePicker
														className="form-control"
														id="date"
														name="journalDate"
														placeholderText={strings.Enter + strings.PostDate}
														showMonthDropdown
														showYearDropdown
														dropdownMode="select"
														// dateFormat="dd-MM-yyyy"
														dateFormat="dd-MM-yyyy"
														autoComplete="off"
														selected={filterData.journalDate}
														onChange={(value) => {
															this.handleChange(value, 'journalDate');
														}}
													/>
												</Col>
												<Col lg={2} className="mb-1">
													<Input
														maxLength="20"
														type="text"
														placeholder={strings.Enter + strings.ReferenceNumber}
														value={filterData.journalReferenceNo}
														onChange={(e) => {
															this.handleChange(
																e.target.value,
																'journalReferenceNo',
															);
														}}
													/>
												</Col>
												<Col lg={2} className="mb-1">
													<Input
													maxLength="30"
														type="text"
														placeholder={strings.Enter + strings.Notes}
														value={filterData.description}
														onChange={(e) => {
															this.handleChange(e.target.value, 'description');
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
											<Button 
													color="primary"
													className="btn-square mr-1 pull-right mb-2"
													onClick={() => {
														this.props.journalActions.getSavedPageNum(1);
														this.props.history.push(
															`/admin/accountant/journal/create`,
														)}
													}
											>
													<i className="fas fa-plus mr-1" />
															{strings.AddNewJournal}  
												</Button>
										</div>
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												data={
													journal_list_data 
														? journal_list_data
														: []
												}
												version="4"
												hover
												keyField="journalId"
												pagination={
														true
												}
												remote
										
												fetchInfo={{
													dataTotalSize: journal_list && journal_list && journal_list.data && journal_list.data.count
														? journal_list.data.count
														: 0,
												}}
												className="supplier-invoice-table"
												trClassName="cursor-pointer"
												csvFileName="Journal.csv"
												ref={(node) => {
													this.table = node;
												}}
											>
												<TableHeaderColumn
													dataField="journalReferenceNo"
													dataSort={true}
													width="18%"
													className="table-header-bg"
												>
													{strings.JOURNALREFERENCENO}  
												</TableHeaderColumn>
												
												<TableHeaderColumn
													dataField="postingReferenceTypeDisplayName"
													dataSort
													width="13%"
													tdStyle={{ whiteSpace: 'unset' }}
													className="table-header-bg"
												>
													{strings.TRANSACTIONTYPE}  
												</TableHeaderColumn>

												<TableHeaderColumn
													dataField="journalDate"
													dataSort
													dataFormat={this.renderDate}
													width="10%"
													className="table-header-bg"
												>
													{strings.POSTDATE}
												</TableHeaderColumn>
												
												<TableHeaderColumn
													dataField="description"
													dataSort
													width="10%"
													className="table-header-bg"
													tdStyle={{whiteSpace:"normal"}}
												>
													{strings.NOTES}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="journalLineItems"
													dataFormat={this.renderAccount}
													width="20%"
													dataAlign="left"
													className="table-header-bg"
												>
													{strings.ACCOUNT}  
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="journalLineItems"
													dataFormat={this.renderDebitAmount}
													formatExtraData={universal_currency_list}
													dataAlign="right"
													width="13%"
													className="table-header-bg"
												>
													{strings.DEBITAMOUNT}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="journalLineItems"
													dataFormat={this.renderCreditAmount}
													dataAlign="right"
													width="14%"
													formatExtraData={universal_currency_list}
													className="table-header-bg"
												>
													{strings.CREDITAMOUNT}
												</TableHeaderColumn>
							{/* <TableHeaderColumn
                            className="text-right"
                            columnClassName="text-right"
                            width="55"
                            dataFormat={this.renderActions}
                          >
                          </TableHeaderColumn> */}
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

export default connect(mapStateToProps, mapDispatchToProps)(Journal);
