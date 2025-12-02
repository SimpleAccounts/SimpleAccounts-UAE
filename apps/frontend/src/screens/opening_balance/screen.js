import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	ButtonGroup,
	Row,
	Col,
	Input,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { CommonActions } from 'services/global';
import { Loader, Currency} from 'components';
import * as OpeningBalanceActions from './actions';
import './style.scss';
import moment from 'moment';
import Select from 'react-select';
import { selectOptionsFactory } from 'utils';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		transaction_category_list: state.opening_balance.transaction_category_list,
		profile: state.auth.profile,
		universal_currency_list: state.common.universal_currency_list,
		opening_balance_list: state.opening_balance.opening_balance_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		openingBalanceActions: bindActionCreators(OpeningBalanceActions, dispatch),
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
class OpeningBalance extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			
			idCount: 0,
			data: [],
			create: false,
			edit: false,
			tempArr: [],
			error: [],
			submitBtnClick: false,
			language: window['localStorage'].getItem('language'),
		};
		this.regEx = /^[0-9\d]+$/;
		this.options = {
		//	onRowClick: this.goToDetail,
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		};
	}

	componentDidMount = () => {
		this.props.openingBalanceActions.getTransactionCategoryList();
		this.initializeData();
	};

	initializeData = () => {
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...paginationData, ...sortingData };
		console.log('postData', postData)
		this.props.openingBalanceActions.getOpeningBalanceList(postData)
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
		this.props.history.push(`/admin/accountant/opening-balance/detail`, {
			id: row.transactionCategoryBalanceId,
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
		console.log("sort", sortName, sortOrder)
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	renderTransactionCategory = (cell, row) => {
		const { transaction_category_list } = this.props;
		const { submitBtnClick } = this.state;
		let value =
			typeof row.transactionCategory === 'string'
				? row.transactionCategory
				: row.transactionCategory.value;
		return (
			<Select
				id="chart_of_account"
				name="chart_of_account_list"
				options={
					transaction_category_list
						? selectOptionsFactory.renderOptions(
								'transactionCategoryName',
								'transactionCategoryId',
								transaction_category_list,
								'Chart of Account',
						  )
						: []
				}
				value={row.transactionCategory}
				isDisabled={row['disabled']}
				menuPosition="fixed"
				maxMenuHeight="250px"
				className={`${value === '' && submitBtnClick ? 'is-invalid' : ''} ${
					row.disabled ? 'selectField' : ''
				}`}
				isOptionDisabled={(option) => this.checkCategory(option.value)}
				onChange={(option) => {
					this.selectItem(option, row, 'transactionCategory');
				}}
			/>
		);
	};

	renderOpeningBalance = (cell, row) => {
		const { submitBtnClick } = this.state;
		return (
			<div>
				{!row['disabled'] ? (
					<Input
						type="text"
						value={row['openingBalance'] !== '' ? row['openingBalance'] : ''}
						disabled={row['disabled']}
						onChange={(e) => {
							if (e.target.value === '' || this.regEx.test(e.target.value)) {
								this.selectItem(e, row, 'openingBalance');
							}
						}}
						placeholder={strings.OpeningBalance}
						className={`form-control ${
							row.openingBalance === '' && submitBtnClick ? 'is-invalid' : ''
						}`}
					/>
				) : (
					<div>
						{new Intl.NumberFormat('ar', {
							style: 'currency',
							currency:
								this.props.profile &&
								this.props.profile.company &&
								this.props.profile.company.currencyCode.currencyIsoCode
									? this.props.profile.company.currencyCode.currencyIsoCode
									: 'AED',
						}).format(row['openingBalance'])}
					</div>
				)}
			</div>
		);
	};

	renderCurrency = (cell, rows) => {

		if (this.props.profile &&
			this.props.profile.company &&
			this.props.profile.company.currencyCode.currencyIsoCode) {
			return (
				<label className="badge label-currency mb-0">{this.props.profile &&
					this.props.profile.company &&
					this.props.profile.company.currencyCode.currencyIsoCode}</label>
			);
		} else {
			return <label className="badge badge-danger mb-0">No Specified</label>;
		}
		// return this.props.profile &&
		// 	this.props.profile.company &&
		// 	this.props.profile.company.currencyCode.currencyIsoCode
		// 	? this.props.profile.company.currencyCode.currencyIsoCode
		// 	: '';
	};

	addMore = () => {
		let tempArr = [...this.state.tempArr];
		tempArr = JSON.parse(JSON.stringify(tempArr));
		this.setState(
			{
				data: tempArr,
			},
			() => {
				const datas = [...this.state.data];
				this.setState({
					data: [
						{
							id: 0,
							transactionCategory: '',
							openingBalance: '',
							effectiveDate: new Date(),
							create: true,
						},
					].concat(datas),
					idCount: 0,
					submitBtnClick: false,
				});
			},
		);
	};

	selectItem = (e, row, name) => {
		const data = [...this.state.data];
		data.map((obj, index) => {
			if (obj.id === row.id) {
				obj[`${name}`] =
					name === 'effectiveDate'
						? e
						: name === 'transactionCategory'
						? e
						: e.target.value;
			}
			return obj;
		});
		this.setState({
			data,
		});
	};

	renderEdit = (cell, row) => {
		return (
			<div>
				{row['disabled'] ? (
					<Button
						type="button"
						color="primary"
						className="btn-square mr-1"
						onClick={(e) => {
							this.enableEdit(row);
						}}
					>
						<i className={`fa fa-edit`}></i>
					</Button>
				) : (
					<Button
						type="button"
						color="primary"
						className="btn-square mr-1"
						onClick={(e) => {
							this.handleSave(row);
						}}
					>
						<i className={`fa fa-save`}></i>
					</Button>
				)}
				{!row['disabled'] && !row['create'] ? (
					<Button
						type="button"
						color="secondary"
						className="btn-square mr-1"
						onClick={() => {
							this.refreshRow(row);
						}}
					>
						<i className="fa fa-refresh"></i>
					</Button>
				) : null}
			</div>
		);
	};

	enableEdit = (row) => {
		let tempArr = [...this.state.tempArr];
		tempArr = JSON.parse(JSON.stringify(tempArr));
		this.setState(
			{
				data: tempArr,
			},
			() => {
				const data = this.state.data;
				data.map((obj, index) => {
					if (obj.id === row.id) {
						obj[`disabled`] = false;
					}
					return obj;
				});
				this.setState({
					data,
				});
			},
		);
	};

	validateRow = (row) => {
		let temp = Object.values(row).indexOf('');
		this.setState({
			submitBtnClick: true,
		});
		if (temp > -1) {
			return false;
		} else {
			return true;
		}
	};

	handleSave = (row) => {
		let save = true;
		if (this.validateRow(row)) {
			const postData = {
				transactionCategoryId: row.transactionCategory.value,
				openingBalance: row.openingBalance,
				effectiveDate:
					typeof row.effectiveDate === 'string'
						? row.effectiveDate
						: moment(
								moment(row.effectiveDate).format('DD-MM-YYYY'),
								'DD-MM-YYYY',
						  ).toDate(),
			};
			console.log(postData);
			if (row.transactionCategoryBalanceId) {
				save = false;
				postData['transactionCategoryBalanceId'] =
					row.transactionCategoryBalanceId;
			}
			this.props.openingBalanceActions
				.addOpeningBalance(postData, save)
				.then((res) => {
					if (res.status === 200) {
						let text = save ? 'added' : 'updated';
						this.props.commonActions.tostifyAlert(
							'success',
							res.data? res.data.message: `Opening Balance ${text} Successfully.`,
						);
						this.initializeData();
						this.setState({
							submitBtnClick: false,
						});
					}
				});
		}
	};

	refreshRow = (row) => {
		let tempArr = [...this.state.tempArr];
		tempArr = JSON.parse(JSON.stringify(tempArr));
		let data = this.state.data;
		let idx, temp;
		tempArr.map((obj, index) => {
			if (obj.id === row.id) {
				temp = obj;
				idx = index;
			}
			return obj;
		});
		data[`${idx}`] = temp;
		this.setState({
			data,
		});
	};

	

	renderAmount = (cell, row, extraData) => {
			return row.openingBalance === 0 ? (
			<Currency
				value={row.openingBalance}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		) : (
			<Currency
				value={row.openingBalance}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		);
		//return row.openingBalance ? row.openingBalance.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : row.openingBalance.toLocaleString(navigator.language, { minimumFractionDigits: 2 });
	};
	renderDate = (cell, row) => {
		return typeof row['effectiveDate'] === 'string'
		? moment(row['effectiveDate'], 'DD-MM-YYYY').format('DD-MM-YYYY')
		: moment(row['effectiveDate']).format('DD-MM-YYYY');
	};
	// renderDate = (cell, row) => {
	// 	return (
	// 		<DatePicker
	// 			id={row['id']}
	// 			name="endDate"
	// 			className={`form-control`}
	// 			placeholderText="Select Date"
	// 			showMonthDropdown
	// 			autoComplete="off"
	// 			disabled={row['disabled']}
	// 			showYearDropdown
	// 			value={
	// 				typeof row['effectiveDate'] === 'string'
	// 					? moment(row['effectiveDate'], 'DD-MM-YYYY').format('DD-MM-YYYY')
	// 					: moment(row['effectiveDate']).format('DD-MM-YYYY')
	// 			}
	// 			dropdownMode="select"
	// 			dateFormat="dd-MM-yyyy"
	// 			onChange={(val) => {
	// 				this.selectItem(val, row, 'effectiveDate');
	// 			}}
	// 		/>
	// 	);
	// };
	customName(cell, row) {
		if (row.transactionCategoryName) {
			return `${cell}`;
		}
	}
	checkCategory = (id) => {
		const { data } = this.state;
		let temp = data.filter((item) => item.transactionCategory.value === id);
		if (temp.length > 0) {
			return true;
		} else {
			return false;
		}
	};

	
	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			dialog,
		} = this.state;
		const {
			opening_balance_list,
			universal_currency_list,
		} = this.props;
		
		
		let opening_balance_list1=	Object.assign({},opening_balance_list)
	
		return (
			loading ==true? <Loader/> :
<div>
			<div className="expense-screen">
				<div className="animated fadeIn">
					{dialog}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fas fa-balance-scale" />
										<span className="ml-2">{strings.OpeningBalance}</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
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
													filename={'Expense.csv'}
													className="hidden"
													ref={this.csvLink}
													target="_blank"
												/>
											)} */}
											{/* <Button
												color="primary"
												className="btn-square mr-1"
												onClick={this.bulkDeleteExpenses}
												disabled={selectedRows.length === 0}
											>
												<i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
												Bulk Delete
											</Button> */}
										</ButtonGroup>
									</div>
									<Button
										color="primary pull-right"
										style={{ marginBottom: '10px' }}
										className="btn-square"
										onClick={() =>
											this.props.history.push(`/admin/accountant/opening-balance/create`)
										}
									>
										<i className="fas fa-plus mr-1" />
										{strings.AddOpeningBalance}
									</Button>
									<div>
									
									<BootstrapTable
											selectRow={this.selectRowProp}
											search={false}
											options={this.options}
											data={opening_balance_list ? opening_balance_list.data : []}
											version="4"
											hover
											keyField="transactionCategoryBalanceId"
											pagination={
											true
											}
											remote
											// fetchInfo={{
											// 	dataTotalSize: opening_balance_list1.length
											// 		? opening_balance_list1.length
											// 		: 0,
											// }}
											fetchInfo={{
												dataTotalSize: opening_balance_list && opening_balance_list && opening_balance_list.data && opening_balance_list.count
													? opening_balance_list.count
													: 0,
											}}
											className="supplier-invoice-table"
											ref={(node) => (this.table = node)}
										>
											<TableHeaderColumn
												dataField="transactionCategoryName"
												width="30%"
												className="table-header-bg"
											>
												{strings.TRANSACTIONCATEGORYNAME}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="chartOfAccount"
												width="30%"
												className="table-header-bg"
											>
												{strings.Chart_of_Account}
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="effectiveDate"
												dataFormat={this.renderDate}
												className="table-header-bg"
												width="10%"
											>
												{strings.EFFECTIVEDATE}
											</TableHeaderColumn>
											<TableHeaderColumn
												width="20%"
												dataAlign="right"
												dataField="openingBalance"
												dataFormat={this.renderAmount}
												formatExtraData={universal_currency_list}
												className="table-header-bg"
											>
												{strings.OPENINGBALANCE}
											</TableHeaderColumn>
											{/* <TableHeaderColumn
										dataAlign="right"
											dataField="currency"
											width="15%"
											dataFormat={this.renderCurrency}
											formatExtraData={universal_currency_list}
											className="table-header-bg"
										>{strings.CURRENCY}
										</TableHeaderColumn> */}
										<TableHeaderColumn
												className="table-header-bg text-right"
												columnClassName="text-right"
												dataFormat={this.renderActions}
											></TableHeaderColumn>
										</BootstrapTable>
									</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(OpeningBalance);
