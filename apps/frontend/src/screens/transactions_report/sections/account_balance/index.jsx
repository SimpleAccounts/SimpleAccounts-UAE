import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import Select from 'react-select';
import { DateRangePicker2, Currency } from 'components';
import dayjs from '@/utils/date';
import DatePicker from 'react-datepicker';
import * as accountBalanceData from '../../actions';
import { selectOptionsFactory } from 'utils';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import './style.scss';

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

const ranges = {
  'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
  'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
  'This Week': [dayjs().startOf('week'), dayjs().endOf('week')],
  'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
  'Last Month': [
    dayjs().subtract(1, 'month').startOf('month'),
    dayjs().subtract(1, 'month').endOf('month'),
  ],
};

function AccountBalances() {
  const dispatch = useDispatch();
  const tableRef = useRef();

  // Redux state
  const account_balance_report = useSelector(
    (state) => state.transaction_data.account_balance_report
  );
  const account_type_list = useSelector((state) => state.transaction_data.account_type_list);
  const universal_currency_list = useSelector((state) => state.common.universal_currency_list);

  // Actions
  const accountBalanceDataActions = useMemo(
    () => bindActionCreators(accountBalanceData, dispatch),
    [dispatch]
  );

  // Local state
  const [filterData, setFilterData] = useState({
    filter_type: '',
    filter_category: '',
    filter_account: '',
    startDate: '',
    endDate: '',
  });
  const [initValue] = useState({
    startDate: dayjs().startOf('month').format('DD-MM-YYYY'),
    endDate: dayjs().endOf('month').format('DD-MM-YYYY'),
  });

  useEffect(() => {
    getAccountBalanceData();
  }, []);

  const getAccountBalanceData = useCallback(() => {
    const postData = {
      startDate: initValue.startDate,
      endDate: initValue.endDate,
    };
    accountBalanceDataActions.getAccountBalanceReport(postData);
    accountBalanceDataActions.getAccountTypeList();
  }, [accountBalanceDataActions, initValue]);

  const getSelectedData = useCallback(() => {
    const postObj = {
      filter_type: filterData.filter_type !== '' ? filterData.filter_type : '',
      filter_category: filterData.filter_category !== '' ? filterData.filter_category : '',
      filter_account: filterData.filter_account !== '' ? filterData.filter_account : '',
      startDate:
        filterData.startDate !== '' ? dayjs(filterData.startDate).format('DD-MM-YYYY') : '',
      endDate: filterData.endDate !== '' ? dayjs(filterData.endDate).format('DD-MM-YYYY') : '',
    };
    accountBalanceDataActions.getAccountBalanceReport(postObj);
  }, [filterData, accountBalanceDataActions]);

  const handleChange = useCallback((val, name) => {
    setFilterData((prev) => ({
      ...prev,
      [name]: val,
    }));
  }, []);

  const handleSearch = useCallback(() => {
    getSelectedData();
  }, [getSelectedData]);

  const clearAll = useCallback(() => {
    setFilterData({
      filter_type: '',
      filter_category: '',
      filter_account: '',
      startDate: '',
      endDate: '',
    });
    getAccountBalanceData();
  }, [getAccountBalanceData]);

  // Transform data for table
  const tableData = useMemo(() => {
    return account_balance_report
      ? account_balance_report.map((account) => ({
          account: account.bankAccount,
          transactionType: account.transactionType,
          transactionDescription: account.transactionDescription,
          transactionCategory: account.transactionCategory,
          transactionAmount: account.transactionAmount,
          transactionDate: dayjs(account.transactionDate).format('DD-MM-YYYY'),
          transactionId: account.transactionId,
        }))
      : [];
  }, [account_balance_report]);

  // Column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionDate',
        header: 'Transaction Date',
        enableSorting: true,
      },
      {
        accessorKey: 'account',
        header: 'Account',
        enableSorting: true,
      },
      {
        accessorKey: 'transactionType',
        header: 'Transaction Type',
        enableSorting: true,
      },
      {
        accessorKey: 'transactionCategory',
        header: 'Transaction Category',
        enableSorting: true,
      },
      {
        accessorKey: 'transactionDescription',
        header: 'Transaction Description',
        enableSorting: true,
      },
      {
        accessorKey: 'transactionAmount',
        header: 'Transaction Amount',
        enableSorting: true,
        cell: ({ row }) => {
          const amount = row.original.transactionAmount;
          const currencyIsoCode = universal_currency_list[0]
            ? universal_currency_list[0].currencyIsoCode
            : 'USD';
          return amount ? <Currency value={amount} currencySymbol={currencyIsoCode} /> : '';
        },
      },
    ],
    [universal_currency_list]
  );

  return (
    <div className="transaction-report-section">
      <div className="animated fadeIn">
        <div className="grid grid-cols-12 gap-4">
          <div lg={12}>
            <div className="flex-wrap d-flex align-items-start justify-content-between">
              <div className="info-block">
                <h4>
                  <small></small>
                </h4>
              </div>
              <form onSubmit={(e) => e.preventDefault()} name="simpleForm">
                <div className="flex-wrap d-flex align-items-center">
                  <div>
                    <div className="inline-flex rounded-md mr-3" role="group">
                      <Button
                        variant="default"
                        className="btn-square"
                        onClick={() => {
                          // Export functionality would go here
                          console.log('Export to CSV');
                        }}
                      >
                        <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                        Export to CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="py-3">
              <h5>Filter : </h5>
              <div className="grid grid-cols-12 gap-4">
                <div lg={2} className="mb-1">
                  <DatePicker
                    className="form-control"
                    id="startDate"
                    name="startDate"
                    placeholderText="Start Date"
                    showMonthDropdown
                    showYearDropdown
                    autoComplete="off"
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                    selected={filterData.startDate}
                    onChange={(value) => {
                      handleChange(value, 'startDate');
                    }}
                  />
                </div>
                <div lg={2} className="mb-1">
                  <DatePicker
                    id="endDate"
                    name="endDate"
                    className="form-control"
                    placeholderText="End Date"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                    selected={filterData.endDate}
                    onChange={(value) => {
                      handleChange(value, 'endDate');
                    }}
                  />
                </div>

                <div lg={2} className="mb-1">
                  <Select
                    styles={customStyles}
                    className=""
                    options={
                      account_type_list
                        ? selectOptionsFactory.renderOptions(
                            'name',
                            'id',
                            account_type_list,
                            'Account'
                          )
                        : []
                    }
                    placeholder="Account"
                    value={filterData.filter_account}
                    onChange={(option) => {
                      if (option && option.value) {
                        handleChange(option, 'filter_account');
                      } else {
                        handleChange('', 'filter_account');
                      }
                    }}
                  />
                </div>
                <div lg={3} className="mb-1">
                  <Button
                    type="button"
                    variant="default"
                    className="btn-square mr-1"
                    onClick={handleSearch}
                  >
                    <i className="fa fa-search"></i>
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    className="btn-square"
                    onClick={clearAll}
                  >
                    <i className="fa fa-refresh"></i>
                  </Button>
                </div>
              </div>
            </div>
            <div className="table-wrapper">
              <DataTable
                columns={columns}
                data={tableData}
                enableExport={true}
                exportFileName="account_balance_table"
                emptyMessage="No transactions found"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountBalances;
