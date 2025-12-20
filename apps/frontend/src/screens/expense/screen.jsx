import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import Select from 'react-select';
import { DataTable } from '@/components/ui/data-table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Loader, ConfirmDeleteModal } from 'components';
import { selectOptionsFactory } from 'utils';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { CommonActions } from 'services/global';
import * as ExpenseActions from './actions';
import dayjs from '@/utils/date';
import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';
import { MoreVertical } from 'lucide-react';

const mapStateToProps = (state) => {
	return {
		expense_list: state.expense.expense_list,
		expense_categories_list: state.expense.expense_categories_list,
		universal_currency_list: state.common.universal_currency_list,
		user_list: state.expense.user_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		expenseActions: bindActionCreators(ExpenseActions, dispatch),
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
class Expense extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dialog: null,
			selectedRows: [],
			actionButtons: {},
			filterData: {
				expenseDate: '',
				transactionCategoryId: '',
				payee: '',
			},
			sorting: [],
			pagination: {
				pageIndex: 0,
				pageSize: 10,
			},
			csvData: [],
			view: false,
			language: window['localStorage'].getItem('language'),
			loadingMsg:"Loading...",
		};
	}

	componentDidMount = () => {
		this.props.expenseActions.getExpenseCategoriesList();
		this.initializeData();
		this.props.expenseActions.getVatList();
	};

	initializeData = () => {
		let { filterData, pagination, sorting} = this.state;
		const paginationData = {
			pageNo: pagination.pageIndex,
			pageSize: pagination.pageSize,
		};

		const sortingData = sorting.length > 0 ? {
			order: sorting[0].desc ? 'desc' : 'asc',
			sortingCol: sorting[0].id,
		} : {
			order: '',
			sortingCol: '',
		};

		const postData = { ...filterData, ...paginationData, ...sortingData };

		this.props.expenseActions
			.getExpenseList(postData)
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

			this.props.expenseActions.getVatList();
			this.props.expenseActions.getExpenseCategoriesList();
			this.props.expenseActions.getBankList();
			this.props.expenseActions.getPaymentMode();
			this.props.expenseActions.getUserForDropdown();
	};

	componentWillUnmount = () => {
		this.setState({
			selectedRows: [],
		});
	};

	goToDetail = (row) => {
		this.props.history.push('/admin/expense/expense/detail', {
			expenseId: row['expenseId'],
		});
	};

	handlePaginationChange = (newPagination) => {
		this.setState({ pagination: newPagination }, () => {
			this.initializeData();
		});
	};

	handleSortingChange = (newSorting) => {
		this.setState({ sorting: newSorting }, () => {
			this.initializeData();
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
		this.setState({
			pagination: { ...this.state.pagination, pageIndex: 0 }
		}, () => {
   		this.initializeData();
 		});
	};

	postExpense = (row) => {
		this.setState({
			loading: true,
		});
		const postingRequestModel = {
			amount: row.expenseAmount,
			postingRefId: row.expenseId,
			postingRefType: 'EXPENSE',
			postingChartOfAccountId: row.chartOfAccountId,
		};
		this.setState({ loading:true, loadingMsg:"Expense Posting..."});
		this.props.expenseActions
			.postExpense(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						"Expense Posted Successfully"
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
					'Expense Posted Unsuccessfully'
				);
				this.setState({
					loading: false,
				});
			});
	};

	unPostExpense = (row) => {
		this.setState({
			loading: true,
		});
		const postingRequestModel = {
			amount: row.expenseAmount,
			postingRefId: row.expenseId,
			postingRefType: 'EXPENSE',
			postingChartOfAccountId: row.chartOfAccountId,
		};
		this.props.expenseActions
			.unPostExpense(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						"Expense Moved To Draft Successfully"
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
					'Expense Moved To Draft Unsuccessfully'
				);
				this.setState({
					loading: false,
				});
			});
	};

	clearAll = () => {
		this.setState(
			{
				filterData: {
					expenseDate: '',
					transactionCategoryId: '',
					payee: '',
				},
				pagination: { pageIndex: 0, pageSize: 10 }
			},
			() => {
				this.initializeData();
			},
		);
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	getColumns = () => {
		const columns = [
			{
				accessorKey: 'expenseNumber',
				header: strings.Expense + " " + strings.No + ".",
				cell: ({ row }) => {
					return <div className="text-left">{row.original.expenseNumber || "-"}</div>;
				},
				size: 150,
			},
			{
				accessorKey: 'payee',
				header: strings.PAYEE,
			},
			{
				accessorKey: 'expenseDate',
				header: strings.EXPENSEDATE,
				cell: ({ row }) => {
					return dayjs(row.original.expenseDate).format('DD-MM-YYYY');
				},
			},
			{
				accessorKey: 'transactionCategoryName',
				header: strings.EXPENSECATEGORY,
			},
			{
				accessorKey: 'expenseStatus',
				header: strings.STATUS,
				cell: ({ row }) => {
					const status = row.original.expenseStatus;
					let classname = '';
					if (status === 'Posted') {
						classname = 'label-posted';
					} else if (status === 'Draft') {
						classname = 'label-draft';
					} else if (status === 'Pending') {
						classname = 'label-danger';
					} else {
						classname = 'label-info';
					}
					return (
						<div className='d-flex justify-content-center flex-column align-items-center'>
							<span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
								{status}
							</span>
							{row.original.bankGenerated ? "( Bank Generated )" : ""}
						</div>
					);
				},
			},
			{
				accessorKey: 'expenseAmount',
				header: strings.EXPENSEAMOUNT,
				cell: ({ row }) => {
					const r = row.original;
					return (
						<div>
							<div>
								<label className="font-weight-bold mr-2 ">
									{strings.ActualExpenseAmount}:
								</label>
								<label>
									{!r.exclusiveVat ?
										r.currencyName + " " + (r.expenseAmount - r.expenseVatAmount).toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2})
										:
										r.currencyName + " " + (r.expenseAmount).toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</label>
							</div>
							{r.expenseVatAmount != null && (
								<div style={{ display: r.expenseVatAmount === 0 ? 'none' : '' }}>
									<label className="font-weight-bold mr-2">
										{strings.VatAmount}:
									</label>
									<label>
										{r.expenseVatAmount === 0 ?
											r.currencyName + " " + r.expenseVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2})
											:
											r.currencyName + " " + r.expenseVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2})}
									</label>
								</div>
							)}
							<div style={{ display: r.expenseAmount === 0 ? 'none' : '' }}>
								<label className="font-weight-bold mr-2">
									{strings.ExpenseAmount}:
								</label>
								<label>
									{!r.exclusiveVat ?
										r.currencyName + " " + (r.expenseAmount).toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2})
										:
										r.currencyName + " " + (r.expenseAmount + r.expenseVatAmount).toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</label>
							</div>
							{r.baseCurrencyAmount != null && (
								<div style={{ display: r.baseCurrencyAmount === 0 ? 'none' : '' }}>
									<label className="font-weight-bold mr-2">
										{strings.BaseCurrencyExpenseAmount}:
									</label>
									<label>
										{r.baseCurrencyAmount === 0 ?
											"AED" + " " + r.baseCurrencyAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
											:
											"AED" + " " + r.baseCurrencyAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</label>
								</div>
							)}
						</div>
					);
				},
				size: 250,
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => {
					const expense = row.original;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{expense.expenseStatus !== 'Posted' && (
									<DropdownMenuItem
										onClick={() => {
											if(expense.editFlag)
												this.props.history.push('/admin/expense/expense/detail', {
													expenseId: expense.expenseId,
												})
											else this.props.commonActions.tostifyAlert(
												'error',
												'You cannot edit transactions for which VAT is recorded'
											);
										}}
									>
										<i className="fas fa-edit mr-2" /> {strings.Edit}
									</DropdownMenuItem>
								)}
								{!expense.bankGenerated && (
									<DropdownMenuItem
										onClick={() =>
											this.props.history.push(`/admin/expense/expense/create`,{parentId: expense.expenseId})
										}
									>
										<i className="fas fa-copy mr-2" /> {strings.CreateADuplicate}
									</DropdownMenuItem>
								)}
								{expense.expenseStatus !== 'Posted' && (
									<DropdownMenuItem
										onClick={() => {
											if(expense.bankGenerated){
												this.props.commonActions.tostifyAlert(
													'error',
													'In order to post this expense, please select the tax treatment and pay-through options.'
												);
											} else this.postExpense(expense);
										}}
									>
										<i className="fas fa-send mr-2" /> {strings.Post}
									</DropdownMenuItem>
								)}
								{expense.expenseStatus === 'Posted' && expense.bankAccountId === null && (
									<DropdownMenuItem
										onClick={() => {
											if(expense.editFlag)
												this.unPostExpense(expense);
											else this.props.commonActions.tostifyAlert(
												'error',
												'You cannot edit transactions for which VAT is recorded'
											);
										}}
									>
										<i className="fas fa-file mr-2" />  {strings.Draft}
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									onClick={() => {
										this.props.history.push('/admin/expense/expense/view', {
											expenseId: expense.expenseId,
										});
									}}
								>
									<i className="fas fa-eye mr-2" /> {strings.View}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
				size: 50,
				enableSorting: false,
			},
		];
		return columns;
	};

	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,loadingMsg,
			dialog,
			filterData,
			pagination,
			sorting,
		} = this.state;
		const {
			expense_list,
			expense_categories_list,
			user_list,
		} = this.props;

		const pageCount = expense_list && expense_list.count
			? Math.ceil(expense_list.count / pagination.pageSize)
			: 0;

		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
<div>
			<div className="expense-screen">
				<div className="animated fadeIn">
					{dialog}
					<Card>
						<CardHeader>
							<div className="grid grid-cols-12 gap-4">
								<div lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fab fa-stack-exchange" />
										<span className="ml-2">{strings.Expenses}</span>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{loading && (
								<div className="grid grid-cols-12 gap-4">
									<div lg={12} className="rounded-loader">
										<Loader />
									</div>
								</div>
							)}
							<div className="grid grid-cols-12 gap-4">
								<div lg={12}>
									<div className="py-3">
										<h5>{strings.Filter}: </h5>
										<div className="grid grid-cols-12 gap-4">
											<div lg={2} className="mb-1">
												<div className="mb-3">
													<Select
														styles={customStyles}
														className="select-default-width"
														id="payee"
														name="payee"
														value={filterData.payee}
														options={
															user_list
																? selectOptionsFactory.renderOptions(
																		'label',
																		'value',
																		user_list,
																		'Payee',
																  )
																: []
														}
														onChange={(option) => {
															if (option && option.value) {
																this.handleChange(option, 'payee');
															} else {
																this.handleChange('', 'payee');
															}
														}}
														placeholder={strings.Select+strings.Payee}
													/>
												</div>
											</div>
											<div lg={2} className="mb-1">
												<DatePicker
													className="form-control"
													id="date"
													name="expenseDate"
													placeholderText={strings.Select + strings.ExpenseDate}
													selected={filterData.expenseDate}
													showMonthDropdown
													showYearDropdown
													dateFormat="dd-MM-yyyy"
													dropdownMode="select"
													value={filterData.expenseDate}
													onChange={(value) => {
														this.handleChange(value, 'expenseDate');
													}}
												/>
											</div>

											<div lg={3} className="mb-1">
												<div className="mb-3">
													<Select
														styles={customStyles}
														className="select-default-width"
														id="expenseCategoryId"
														name="expenseCategoryId"
														value={filterData.transactionCategoryId}
														options={
															expense_categories_list
																? selectOptionsFactory.renderOptions(
																		'transactionCategoryName',
																		'transactionCategoryId',
																		expense_categories_list,
																		'Expense Category',
																  )
																: []
														}
														onChange={(option) => {
															if (option && option.value) {
																this.handleChange(
																	option,
																	'transactionCategoryId',
																);
															} else {
																this.handleChange('', 'transactionCategoryId');
															}
														}}
														placeholder={strings.ExpenseCategory}
													/>
												</div>
											</div>
											<div lg={3} className="pl-0 pr-0">
												<Button
													type="button"
													variant="default"
													className="btn-square mr-1"
													onClick={this.handleSearch}
												>
													<i className="fa fa-search"></i>
												</Button>
												<Button
													type="button"
													variant="default"
													className="btn-square"
													onClick={this.clearAll}
												>
													<i className="fa fa-refresh"></i>
												</Button>
											</div>
										</div>
									</div>
									<div>
									<Button
										variant="default"
										style={{ marginBottom: '10px' }}
										className="btn-square pull-right"
										onClick={() =>
											this.props.history.push(`/admin/expense/expense/create`)
										}

									>
										<i className="fas fa-plus mr-1" />
										{strings.AddNewExpense}
									</Button>
									</div>
									<div>
										<DataTable
											columns={this.getColumns()}
											data={
												expense_list && expense_list.data
													? expense_list.data
													: []
											}
											manualPagination
											pageCount={pageCount}
											pagination={pagination}
											onPaginationChange={this.handlePaginationChange}
											manualSorting
											sorting={sorting}
											onSortingChange={this.handleSortingChange}
											onRowClick={(row) => this.goToDetail(row)}
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Expense);
