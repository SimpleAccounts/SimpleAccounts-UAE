import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  Landmark,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  List,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, ConfirmDeleteModal } from 'components';

import * as BankAccountActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Bank Account List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function BankAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const account_type_list = useSelector(state => state.bank_account.account_type_list);
  const currency_list = useSelector(state => state.bank_account.currency_list);
  const bank_account_list = useSelector(state => state.bank_account.bank_account_list);
  const universal_currency_list = useSelector(state => state.common.universal_currency_list);

  // Actions
  const bankAccountActions = useMemo(
    () => bindActionCreators(BankAccountActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  // Filter state
  const [filterData, setFilterData] = useState({
    bankName: '',
    bankAccountTypeId: '',
    bankAccountName: '',
    accountNumber: '',
    currencyCode: '',
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  const initializeData = useCallback(() => {
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting[0]?.desc ? 'desc' : sorting[0]?.id ? 'asc' : '',
      sortingCol: sorting[0]?.id || '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    bankAccountActions
      .getBankAccountList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [bankAccountActions, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    bankAccountActions.getAccountTypeList();
    bankAccountActions.getCurrencyList();
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Delete handler
  const deleteBankAccount = useCallback(
    id => {
      setDialog(
        <ConfirmDeleteModal
          isOpen={true}
          okHandler={() => {
            setDialog(null);
            setLoading(true);
            bankAccountActions
              .deleteBankAccount(id)
              .then(res => {
                commonActions.tostifyAlert(
                  'success',
                  res.data?.message || 'Bank Account Deleted Successfully'
                );
                initializeData();
              })
              .catch(err => {
                commonActions.tostifyAlert(
                  'error',
                  err?.data?.message || 'Bank Account Deleted Unsuccessfully'
                );
                setLoading(false);
              });
          }}
          cancelHandler={() => setDialog(null)}
          message="This Bank Account will be deleted permanently and cannot be recovered."
          message1={<b>{strings.DeleteBankAccount}</b>}
        />
      );
    },
    [bankAccountActions, commonActions, initializeData]
  );

  // Filter handlers
  const handleFilterChange = (name, value) => {
    setFilterData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    initializeData();
  };

  const clearAll = () => {
    setFilterData({
      bankName: '',
      bankAccountTypeId: '',
      bankAccountName: '',
      accountNumber: '',
      currencyCode: '',
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'bankName',
        header: strings.BANKNAME,
        cell: ({ row }) => <span className="font-medium">{row.original.bankName}</span>,
      },
      {
        accessorKey: 'bankAccountName',
        header: strings.ACCOUNTNAME,
      },
      {
        accessorKey: 'accountNumber',
        header: strings.ACCOUNTNUMBER,
      },
      {
        accessorKey: 'accountTypeName',
        header: strings.ACCOUNTTYPE,
        cell: ({ row }) => <Badge variant="secondary">{row.original.accountTypeName}</Badge>,
      },
      {
        accessorKey: 'openingBalance',
        header: strings.OPENINGBALANCE,
        cell: ({ row }) => {
          const { openingBalance, currencySymbol } = row.original;
          return (
            <div className="text-right">
              {currencySymbol}{' '}
              {(openingBalance || 0).toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
      {
        accessorKey: 'balance',
        header: strings.CURRENTBALANCE,
        cell: ({ row }) => {
          const { balance, currencySymbol } = row.original;
          return (
            <div className="text-right font-semibold">
              {currencySymbol}{' '}
              {(balance || 0).toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const account = row.original;
          const actions = [
            {
              label: strings.Edit,
              icon: Edit,
              onClick: () =>
                navigate('/admin/banking/bank-account/detail', {
                  state: { bankAccountId: account.id },
                }),
            },
            {
              label: strings.View,
              icon: Eye,
              onClick: () =>
                navigate('/admin/banking/bank-account/detail', {
                  state: { bankAccountId: account.id },
                }),
            },
            {
              label: strings.ViewTransactions || 'View Transactions',
              icon: List,
              onClick: () =>
                navigate('/admin/banking/bank-account/transaction', {
                  state: { bankAccountId: account.id },
                }),
            },
            {
              label: strings.AddnewTransaction || 'Add Transaction',
              icon: CreditCard,
              onClick: () =>
                navigate(`/admin/banking/bank-account/transaction/create?bankId=${account.id}`, {
                  state: { bankAccountId: account.id },
                }),
            },
            { separator: true },
            {
              label: strings.Delete,
              icon: Trash2,
              onClick: () => deleteBankAccount(account.id),
              variant: 'destructive',
            },
          ];

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, deleteBankAccount]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!bank_account_list?.data) return [];
    return bank_account_list.data.map(account => ({
      id: account.bankAccountId,
      bankName: account.name || '', // Backend uses 'name' not 'bankName'
      bankAccountName: account.accounName || '', // Backend typo: 'accounName' not 'bankAccountName'
      accountNumber: account.bankAccountNo || '', // Backend uses 'bankAccountNo' not 'accountNumber'
      accountTypeName: account.bankAccountTypeName || '',
      currencySymbol: account.curruncySymbol || '', // Backend typo: 'curruncySymbol' not 'currencySymbol'
      openingBalance: account.openingBalance || 0, // Note: backend sets this to currentBalance
      balance: account.openingBalance || 0, // Use openingBalance (which is actually currentBalance) for balance display
    }));
  }, [bank_account_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bank-account-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Landmark className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.BankAccounts}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/banking/bank-account/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewBankAccount}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">{strings.Filter}:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  value={filterData.bankName}
                  placeholder={`${strings.Enter} ${strings.BankName}`}
                  className="input-transition"
                  onChange={e => handleFilterChange('bankName', e.target.value)}
                />
                <Input
                  value={filterData.bankAccountName}
                  placeholder={`${strings.Enter} ${strings.AccountName}`}
                  className="input-transition"
                  onChange={e => handleFilterChange('bankAccountName', e.target.value)}
                />
                <Input
                  value={filterData.accountNumber}
                  placeholder={`${strings.Enter} ${strings.AccountNumber}`}
                  className="input-transition"
                  onChange={e => handleFilterChange('accountNumber', e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSearch} variant="default" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={tableData}
              manualPagination
              pageCount={Math.ceil((bank_account_list?.count || 0) / pagination.pageSize)}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BankAccount;
