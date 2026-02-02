import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import Select from 'react-select';
import { DataTable } from '@/components/ui/data-table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Loader } from 'components';
import { selectOptionsFactory } from 'utils';
import { CommonActions } from 'services/global';
import * as ExpenseActions from './actions';
import dayjs from '@/utils/date';
import './style.scss';
import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { ArrowUpDown, Eye, MoreVertical, Pencil, Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#1e6eff' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#1e6eff' : '#c7c7c7',
    },
  }),
};

let strings = new LocalizedStrings(data);

const Expense = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const expense_list = useSelector(state => state.expense.expense_list);
  const expense_categories_list = useSelector(state => state.expense.expense_categories_list);
  const user_list = useSelector(state => state.expense.user_list);

  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [filterData, setFilterData] = useState({
    expenseDate: '',
    transactionCategoryId: '',
    payee: '',
  });
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [language] = useState(window['localStorage'].getItem('language'));

  const initializeData = () => {
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };

    const sortingData =
      sorting.length > 0
        ? {
            order: sorting[0].desc ? 'desc' : 'asc',
            sortingCol: sorting[0].id,
          }
        : {
            order: '',
            sortingCol: '',
          };

    const postData = { ...filterData, ...paginationData, ...sortingData };

    dispatch(ExpenseActions.getExpenseList(postData))
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        dispatch(
          CommonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          )
        );
      });

    dispatch(ExpenseActions.getVatList());
    dispatch(ExpenseActions.getExpenseCategoriesList());
    dispatch(ExpenseActions.getBankList());
    dispatch(ExpenseActions.getPaymentMode());
    dispatch(ExpenseActions.getUserForDropdown());
  };

  useEffect(() => {
    initializeData();
  }, [
    pagination,
    sorting,
    filterData.expenseDate,
    filterData.transactionCategoryId,
    filterData.payee,
  ]);

  const goToDetail = row => {
    navigate('/admin/expense/expense/detail', {
      state: { expenseId: row['expenseId'] },
    });
  };

  const handlePaginationChange = newPagination => {
    setPagination(newPagination);
  };

  const handleSortingChange = newSorting => {
    setSorting(newSorting);
  };

  const handleChange = (val, name) => {
    setFilterData(prev => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    initializeData();
  };

  const postExpense = row => {
    setLoading(true);
    setLoadingMsg('Expense Posting...');
    const postingRequestModel = {
      amount: row.expenseAmount,
      postingRefId: row.expenseId,
      postingRefType: 'EXPENSE',
      postingChartOfAccountId: row.chartOfAccountId,
    };
    dispatch(ExpenseActions.postExpense(postingRequestModel))
      .then(res => {
        if (res.status === 200) {
          dispatch(CommonActions.tostifyAlert('success', 'Expense Posted Successfully'));
          setLoading(false);
          initializeData();
        }
      })
      .catch(err => {
        dispatch(CommonActions.tostifyAlert('error', 'Expense Posted Unsuccessfully'));
        setLoading(false);
      });
  };

  const unPostExpense = row => {
    setLoading(true);
    const postingRequestModel = {
      amount: row.expenseAmount,
      postingRefId: row.expenseId,
      postingRefType: 'EXPENSE',
      postingChartOfAccountId: row.chartOfAccountId,
    };
    dispatch(ExpenseActions.unPostExpense(postingRequestModel))
      .then(res => {
        if (res.status === 200) {
          dispatch(CommonActions.tostifyAlert('success', 'Expense Moved To Draft Successfully'));
          setLoading(false);
          initializeData();
        }
      })
      .catch(err => {
        dispatch(CommonActions.tostifyAlert('error', 'Expense Moved To Draft Unsuccessfully'));
        setLoading(false);
      });
  };

  const clearAll = () => {
    setFilterData({
      expenseDate: '',
      transactionCategoryId: '',
      payee: '',
    });
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

  const getColumns = () => [
    {
      accessorKey: 'expenseNumber',
      header: strings.Expense + ' ' + strings.No + '.',
      cell: ({ row }) => <div className="text-left">{row.original.expenseNumber || '-'}</div>,
      size: 150,
    },
    {
      accessorKey: 'payee',
      header: strings.PAYEE,
    },
    {
      accessorKey: 'expenseDate',
      header: strings.EXPENSEDATE,
      cell: ({ row }) => dayjs(row.original.expenseDate).format('DD-MM-YYYY'),
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
        if (status === 'Posted') classname = 'label-posted';
        else if (status === 'Draft') classname = 'label-draft';
        else if (status === 'Pending') classname = 'label-danger';
        else classname = 'label-info';
        return (
          <div className="d-flex justify-content-center flex-column align-items-center">
            <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
              {status}
            </span>
            {row.original.bankGenerated ? '( Bank Generated )' : ''}
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
              <label className="font-weight-bold mr-2 ">{strings.ActualExpenseAmount}:</label>
              <label>
                {!r.exclusiveVat
                  ? r.currencyName +
                    ' ' +
                    (r.expenseAmount - r.expenseVatAmount).toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : r.currencyName +
                    ' ' +
                    r.expenseAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </label>
            </div>
            {r.expenseVatAmount != null && (
              <div style={{ display: r.expenseVatAmount === 0 ? 'none' : '' }}>
                <label className="font-weight-bold mr-2">{strings.VatAmount}:</label>
                <label>
                  {r.expenseVatAmount.toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </label>
              </div>
            )}
            <div style={{ display: r.expenseAmount === 0 ? 'none' : '' }}>
              <label className="font-weight-bold mr-2">{strings.ExpenseAmount}:</label>
              <label>
                {!r.exclusiveVat
                  ? r.currencyName +
                    ' ' +
                    r.expenseAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : r.currencyName +
                    ' ' +
                    (r.expenseAmount + r.expenseVatAmount).toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </label>
            </div>
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
                    if (expense.editFlag)
                      navigate('/admin/expense/expense/detail', {
                        state: { expenseId: expense.expenseId },
                      });
                    else
                      dispatch(
                        CommonActions.tostifyAlert(
                          'error',
                          'You cannot edit transactions for which VAT is recorded'
                        )
                      );
                  }}
                >
                  <Pencil className="h-4 w-4" /> {strings.Edit}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  navigate('/admin/expense/expense/view', {
                    state: { expenseId: expense.expenseId },
                  })
                }
              >
                <Eye className="h-4 w-4" /> {strings.View}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
      enableSorting: false,
    },
  ];

  strings.setLanguage(language);

  const tableData = Array.isArray(expense_list) ? expense_list : expense_list?.data || [];
  const totalCount = expense_list?.count ?? (Array.isArray(expense_list) ? expense_list.count : 0);
  const pageCount = totalCount ? Math.ceil(totalCount / pagination.pageSize) : 0;

  if (loading) return <Loader loadingMsg={loadingMsg} />;

  return (
    <div className="w-full">
      <div className="expense-screen w-full">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <div className="grid grid-cols-12 gap-4 w-full">
                <div className="col-span-12">
                  <div className="h4 mb-0 d-flex align-items-center">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="ml-2">{strings.Expenses}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="w-full">
              <div className="grid grid-cols-12 gap-4 w-full">
                <div className="col-span-12">
                  <div className="py-3">
                    <h5>{strings.Filter}: </h5>
                    <div className="grid grid-cols-12 gap-4 w-full">
                      <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 mb-1">
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
                                  'Payee'
                                )
                              : []
                          }
                          onChange={option => handleChange(option || '', 'payee')}
                          placeholder={strings.Select + strings.Payee}
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2 mb-1">
                        <DatePicker
                          className="form-control w-full"
                          id="date"
                          name="expenseDate"
                          placeholderText={strings.Select + strings.ExpenseDate}
                          selected={filterData.expenseDate}
                          showMonthDropdown
                          showYearDropdown
                          dateFormat="dd-MM-yyyy"
                          dropdownMode="select"
                          onChange={value => handleChange(value, 'expenseDate')}
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 mb-1">
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
                                  'Expense Category'
                                )
                              : []
                          }
                          onChange={option => handleChange(option || '', 'transactionCategoryId')}
                          placeholder={strings.ExpenseCategory}
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 pl-0 pr-0">
                        <Button
                          type="button"
                          variant="default"
                          className="btn-square mr-1"
                          onClick={handleSearch}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          className="btn-square"
                          onClick={clearAll}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="default"
                      style={{ marginBottom: '10px' }}
                      className="btn-square pull-right"
                      onClick={() => navigate(`/admin/expense/expense/create`)}
                    >
                      <Plus className="h-4 w-4" />
                      {strings.AddNewExpense}
                    </Button>
                  </div>
                  <div>
                    <DataTable
                      columns={getColumns()}
                      data={tableData}
                      manualPagination
                      pageCount={pageCount}
                      pagination={pagination}
                      onPaginationChange={handlePaginationChange}
                      manualSorting
                      sorting={sorting}
                      onSortingChange={handleSortingChange}
                      onRowClick={row => goToDetail(row)}
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
};

export default Expense;
