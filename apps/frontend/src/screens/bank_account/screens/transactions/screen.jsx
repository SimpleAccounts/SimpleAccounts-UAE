import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronUp, Landmark, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Loader, ConfirmDeleteModal } from 'components';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as TransactionsActions from './actions';
import { CommonActions } from 'services/global';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import * as transactionDetailActions from '../transactions/screens/detail/actions';

const ZERO = 0.0;
let strings = new LocalizedStrings(data);

function BankTransactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const bank_transaction_list = useSelector(state => state.bank_account.bank_transaction_list);
  const transaction_type_list = useSelector(state => state.bank_account.transaction_type_list);
  const universal_currency_list = useSelector(state => state.common.universal_currency_list);

  // Actions
  const transactionsActions = useMemo(
    () => bindActionCreators(TransactionsActions, dispatch),
    [dispatch]
  );
  const detailBankAccountActions = useMemo(
    () => bindActionCreators(detailBankAccountActions, dispatch),
    [dispatch]
  );
  const transactionDetailActionsObj = useMemo(
    () => bindActionCreators(transactionDetailActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [actionButtons, setActionButtons] = useState({});
  const [filterData, setFilterData] = useState({
    transactionDate: '',
    chartOfAccountId: '',
  });
  const [bankAccountCurrencySymbol, setBankAccountCurrencySymbol] = useState('');
  const [bankAccountCurrencyIsoCode, setBankAccountCurrencyIsoCode] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [accounName, setAccountName] = useState('');
  const [transactionCount, setTransactionCount] = useState(0);
  const [activeTab, setActiveTab] = useState(['all', '', '']);
  const [transactionType, setTransactionType] = useState('all');
  const [nonexpand, setNonexpand] = useState([]);
  const [selectedIdList, setSelectedIdList] = useState([]);
  const [transationData, setTransationData] = useState('');
  const [expanded, setExpanded] = useState([]);
  const [showExpandedRow, setShowExpandedRow] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  const getnewbackdetails = useCallback(() => {
    if (location.state && location.state.bankAccountId) {
      detailBankAccountActions
        .getBankAccountByID(location.state.bankAccountId)
        .then(res => {
          setBankAccountCurrencySymbol(res.bankAccountCurrencySymbol);
          setBankAccountCurrencyIsoCode(res.bankAccountCurrencyIsoCode);
          setCurrentBalance(res.currentBalance);
          setClosingBalance(res.closingBalance);
          setOpeningBalance(res.openingBalance);
          setAccountName(res.bankAccountName);
          setTransactionCount(res.transactionCount);
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
          navigate('/admin/banking/bank-account');
        });
      toggle(0, 'all');
      transactionsActions.getTransactionTypeList();
      initializeData();
    }
  }, [location.state]);

  const initializeData = useCallback(() => {
    const data = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    if (location.state && location.state.bankAccountId) {
      const postData = {
        ...filterData,
        ...data,
        id: location.state.bankAccountId,
        transactionType: transactionType,
      };
      transactionsActions
        .getTransactionList(postData)
        .then(res => {
          const array = [];
          if (res.status === 200) {
            setLoading(false);
            setTransationData(res.data.data);
            res.data.data.forEach(item => {
              if (item.creationMode === 'POTENTIAL_DUPLICATE') {
                array.push(item.id);
              }
            });
            setNonexpand(array);
          }
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
          setLoading(false);
        });
    } else {
      navigate('/admin/banking/bank-account');
    }
  }, [
    filterData,
    location.state,
    pagination,
    transactionType,
    transactionsActions,
    commonActions,
    navigate,
  ]);

  useEffect(() => {
    if (location.state && location.state.bankAccountId) {
      detailBankAccountActions
        .getBankAccountByID(location.state.bankAccountId)
        .then(res => {
          setBankAccountCurrencySymbol(res.bankAccountCurrencySymbol);
          setBankAccountCurrencyIsoCode(res.bankAccountCurrencyIsoCode);
          setCurrentBalance(res.currentBalance);
          setClosingBalance(res.closingBalance);
          setOpeningBalance(res.openingBalance);
          setAccountName(res.bankAccountName);
          setTransactionCount(res.transactionCount);
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
          navigate('/admin/banking/bank-account');
        });
      toggle(0, 'all');
      commonActions.getCompanyDetails().then(action => {
        if (action && action.type && action.type.includes('fulfilled')) {
          const isRegisteredVat = action.payload.isRegisteredVat;
          // Update location state
        }
      });
      transactionsActions.getTransactionTypeList();
      initializeData();
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination]);

  const toggleActionButton = useCallback(row => {
    setActionButtons(prev => ({
      ...prev,
      [row]: !prev[row],
    }));
  }, []);

  const toggle = useCallback(
    (tabPane, tab) => {
      const newArray = [...activeTab];
      newArray[tabPane] = tab;
      setActiveTab(newArray);
      setTransactionType(tab);
      // Reset pagination when changing tabs
      setPagination({ pageIndex: 0, pageSize: 10 });
    },
    [activeTab]
  );

  const handleChange = useCallback((val, name) => {
    setFilterData(prev => ({
      ...prev,
      [name]: val,
    }));
  }, []);

  const handleSearch = useCallback(() => {
    initializeData();
  }, [initializeData]);

  const closeTransaction = useCallback(id => {
    const message1 = (
      <text>
        <b>Delete Transaction?</b>
      </text>
    );
    const message = 'This Transaction will be deleted permanently and cannot be recovered.';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={() => removeTransaction(id)}
        cancelHandler={removeDialog}
        message1={message1}
        message={message}
      />
    );
  }, []);

  const removeTransaction = useCallback(
    id => {
      removeDialog();
      transactionsActions
        .deleteTransactionById(id)
        .then(res => {
          commonActions.tostifyAlert('success', 'Transaction Deleted Successfully');
          initializeData();
        })
        .catch(err => {
          commonActions.tostifyAlert('error', err && err.data ? err.data.message : null);
        });
    },
    [transactionsActions, commonActions, initializeData]
  );

  const removeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  const clearAll = useCallback(() => {
    setFilterData({
      transactionDate: '',
      chartOfAccountId: '',
    });
    setPagination({ pageIndex: 0, pageSize: 10 });
  }, []);

  const onRowSelect = useCallback(
    row => {
      const tempList = [...selectedIdList, row];
      setSelectedIdList(tempList);

      const obj = {
        ids: tempList,
      };
      transactionsActions
        .changeTransaction(obj)
        .then(() => {
          commonActions.tostifyAlert('success', 'Transaction status changed successfully');
          initializeData();
          setSelectedIdList([]);
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
        });
    },
    [selectedIdList, transactionsActions, commonActions, initializeData]
  );

  // Column definitions for DataTable
  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionDate',
        header: 'Date',
        enableSorting: true,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        enableSorting: true,
      },
      {
        accessorKey: 'depositeAmount',
        header: 'Deposit Amount',
        enableSorting: true,
        cell: ({ row }) => {
          const amount = row.original.depositeAmount;
          const currency = row.original.currencyIsoCode;
          return amount >= 0
            ? `${currency} ${amount.toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '';
        },
      },
      {
        accessorKey: 'withdrawalAmount',
        header: 'Withdrawal Amount',
        enableSorting: true,
        cell: ({ row }) => {
          const amount = row.original.withdrawalAmount;
          const currency = row.original.currencyIsoCode;
          return amount >= 0
            ? `${currency} ${amount.toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '';
        },
      },
      {
        accessorKey: 'dueAmount',
        header: 'Due Amount',
        enableSorting: true,
        cell: ({ row }) => {
          const amount = row.original.dueAmount;
          const currency = row.original.currencyIsoCode;
          return amount >= 0
            ? `${currency} ${amount.toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '';
        },
      },
      {
        accessorKey: 'explinationStatusEnum',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.explinationStatusEnum;
          const creationMode = row.original.creationMode;

          if (status === 'FULL') {
            return <Badge className="label-info">Explained</Badge>;
          } else if (status === 'RECONCILED') {
            return <Badge className="label-success">Reconciled</Badge>;
          } else if (status === 'PARTIAL') {
            return <Badge className="label-PartiallyPaid">Partially Explained</Badge>;
          } else if (status === 'NOT_EXPLAIN' && creationMode !== 'POTENTIAL_DUPLICATE') {
            return <Badge variant="destructive">Not Explained</Badge>;
          } else if (creationMode === 'POTENTIAL_DUPLICATE') {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {actionButtons[row.original.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      onRowSelect(row.original.id);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Not a duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      closeTransaction(row.original.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          return null;
        },
      },
    ],
    [actionButtons, onRowSelect, closeTransaction]
  );

  const handlePaginationChange = useCallback(newPagination => {
    setPagination(newPagination);
  }, []);

  return (
    <div className="bank-transaction-screen transaction">
      <div className="animated fadeIn">
        <Card className={''}>
          <CardHeader>
            <div className="grid grid-cols-12 gap-4">
              <div>
                <div className="h4 mb-0 d-flex align-items-center">
                  <Landmark className="h-4 w-4" />
                  <span className="ml-2">{strings.BankTransactions}</span>
                </div>
              </div>
              <div>
                <Button
                  title="Back"
                  onClick={() => {
                    navigate('/admin/banking/bank-account');
                  }}
                  className=" pull-right"
                >
                  X
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dialog}
            {loading ? (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <Loader />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <div className="mb-4 status-panel p-3">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3">
                        <h5>{strings.AccountName}</h5>
                        <h3>{accounName}</h3>
                      </div>
                      <div className="col-span-3">
                        <h5>{strings.CurrentBankBalance}</h5>
                        <h3>
                          {bankAccountCurrencyIsoCode} &nbsp;
                          {currentBalance
                            ? currentBalance.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : ' ' +
                              ZERO.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                              })}
                        </h3>
                      </div>
                      <div className="col-span-3">
                        <h5>{strings.LedgerBalance}</h5>
                        <h3>
                          {bankAccountCurrencyIsoCode} &nbsp;
                          {closingBalance
                            ? closingBalance.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : ' ' +
                              ZERO.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                              })}
                        </h3>
                      </div>
                      <div className="col-span-3">
                        <h5>{strings.OpeningBalance}</h5>
                        <h3>
                          {bankAccountCurrencyIsoCode} &nbsp;
                          {openingBalance
                            ? openingBalance.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : ' ' +
                              ZERO.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                              })}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    {location.state && location.state.bankAccountId !== 1001 && (
                      <div className="inline-flex rounded-md" role="group">
                        <Button
                          color="info"
                          className="btn-square mr-1"
                          onClick={() =>
                            navigate('/admin/banking/upload-statement', {
                              bankAccountId:
                                location.state && location.state.bankAccountId
                                  ? location.state.bankAccountId
                                  : '',
                            })
                          }
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          {strings.ImportStatement}
                        </Button>
                        &nbsp; &nbsp; &nbsp;
                        {transactionCount > 0 ? (
                          ''
                        ) : (
                          <Button
                            variant="default"
                            className="btn-square mr-1"
                            onClick={() =>
                              navigate('/admin/banking/bank-account/detail', {
                                bankAccountId:
                                  location.state && location.state.bankAccountId
                                    ? location.state.bankAccountId
                                    : '',
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                            {strings.EditAccount}
                          </Button>
                        )}
                        &nbsp;&nbsp;&nbsp;
                        <Button
                          color="info"
                          className="btn-square mr-1"
                          onClick={() =>
                            navigate('/admin/banking/bank-account/transaction/reconcile', {
                              bankAccountId:
                                location.state && location.state.bankAccountId
                                  ? location.state.bankAccountId
                                  : '',
                            })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          {strings.reconcile}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="py-3">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3 mb-1"></div>
                      <div className="col-span-2 pl-0 pr-0"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <Tabs value={activeTab[0]} onValueChange={value => toggle(0, value)}>
                      <TabsList>
                        <TabsTrigger value="all">{strings.All}</TabsTrigger>
                        <TabsTrigger value="not_explain">{strings.NotExplained}</TabsTrigger>
                        <TabsTrigger value="potential_duplicate">
                          {strings.PotentialDuplicate}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <Button
                      variant="default"
                      className="btn-square"
                      onClick={() =>
                        navigate('/admin/banking/bank-account/transaction/create', {
                          bankAccountId:
                            location.state && location.state.bankAccountId
                              ? location.state.bankAccountId
                              : '',
                          currency: location.state.currency,
                          isRegisteredVat: location.state.isRegisteredVat,
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      {strings.AddnewTransaction}
                    </Button>
                  </div>
                  <div>
                    <DataTable
                      columns={columns}
                      data={bank_transaction_list.data || []}
                      manualPagination={true}
                      pageCount={Math.ceil(
                        (bank_transaction_list.count || 0) / pagination.pageSize
                      )}
                      totalRows={bank_transaction_list.count || 0}
                      pagination={pagination}
                      onPaginationChange={handlePaginationChange}
                      loading={loading}
                      emptyMessage="There are no records to display."
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="overlay"></div>
      </div>
    </div>
  );
}

export default BankTransactions;
