import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Printer, BarChart3, Edit, Trash2, Search, Lock } from 'lucide-react';
import { CSVLink } from '@/components/ui/csv-link';

import { DataTable } from '@/components/ui/data-table';
import { Loader, ConfirmDeleteModal } from 'components';

import * as ChartAccountActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

// Neumorphic theme constants
const theme = {
  bg: '#e8eef5',
  primary: '#1e6eff',
  primaryDark: '#0052cc',
  secondary: '#00c896',
  warning: '#f59e0b',
  danger: '#ff4d6a',
  textPrimary: '#1e3a5f',
  textSecondary: '#3d5a80',
  textMuted: '#98afc2',
  shadowDark: '#c4c9cf',
  shadowLight: '#ffffff',
};

const shadows = {
  raised: {
    sm: `3px 3px 6px ${theme.shadowDark}, -3px -3px 6px ${theme.shadowLight}`,
    md: `4px 4px 8px ${theme.shadowDark}, -4px -4px 8px ${theme.shadowLight}`,
    lg: `6px 6px 12px ${theme.shadowDark}, -6px -6px 12px ${theme.shadowLight}`,
    xs: `2px 2px 4px ${theme.shadowDark}, -2px -2px 4px ${theme.shadowLight}`,
  },
  pressed: {
    sm: `inset 2px 2px 4px ${theme.shadowDark}, inset -2px -2px 4px ${theme.shadowLight}`,
    md: `inset 3px 3px 6px ${theme.shadowDark}, inset -3px -3px 6px ${theme.shadowLight}`,
  },
};

/**
 * Modern Chart of Accounts Screen
 * Uses functional components with Neumorphic design
 */
function ChartAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const csvLink = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Redux state
  const transaction_category_list = useSelector(
    state => state.chart_account.transaction_category_list
  );
  const transaction_type_list = useSelector(state => state.chart_account.transaction_type_list);

  // Actions
  const chartOfAccountActions = useMemo(
    () => bindActionCreators(ChartAccountActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [view, setView] = useState(false);
  const [hideForPrint, setHideForPrint] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('');

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  // Filter state
  const [filterData, setFilterData] = useState({
    transactionCategoryCode: '',
    transactionCategoryName: '',
    chartOfAccountId: '',
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  const initializeData = useCallback(
    (pageSize = pagination.pageSize) => {
      const paginationData = {
        pageNo: pagination.pageIndex,
        pageSize: pageSize,
      };
      const sortingData = {
        order: sorting[0]?.desc ? 'desc' : sorting[0]?.id ? 'asc' : '',
        sortingCol: sorting[0]?.id || '',
      };
      const postData = { ...filterData, ...paginationData, ...sortingData };

      chartOfAccountActions
        .getTransactionCategoryList(postData)
        .then(res => {
          if (res.status === 200) {
            setLoading(false);
          }
        })
        .catch(err => {
          commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
          setLoading(false);
        });
    },
    [chartOfAccountActions, commonActions, filterData, pagination, sorting]
  );

  useEffect(() => {
    chartOfAccountActions.getTransactionTypes();
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting, filterData]);

  // Handle search with debounce
  const handleSearch = useCallback(value => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
      setFilterData(prev => ({
        ...prev,
        transactionCategoryName: value,
        transactionCategoryCode: value,
      }));
    }, 500);
  }, []);

  // Handle account type filter
  const handleAccountTypeFilter = useCallback(value => {
    setSelectedAccountType(value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setFilterData(prev => ({
      ...prev,
      chartOfAccountId: value,
    }));
  }, []);

  // Navigate to detail
  const goToDetailPage = useCallback(
    row => {
      if (row.editableFlag) {
        navigate('/admin/master/chart-account/detail', {
          state: { id: row.transactionCategoryId },
        });
      }
    },
    [navigate]
  );

  // Handle delete
  const handleDelete = useCallback(
    account => {
      setDialog(
        <ConfirmDeleteModal
          isOpen={true}
          okHandler={() => {
            chartOfAccountActions
              .deleteTransactionCategory(account.transactionCategoryId)
              .then(res => {
                if (res.status === 200) {
                  commonActions.tostifyAlert('success', 'Account deleted successfully');
                  initializeData();
                }
              })
              .catch(err => {
                commonActions.tostifyAlert(
                  'error',
                  err?.data?.message || 'Failed to delete account'
                );
              });
            setDialog(null);
          }}
          cancelHandler={() => setDialog(null)}
          message="Are you sure you want to delete this account?"
        />
      );
    },
    [chartOfAccountActions, commonActions, initializeData]
  );

  // CSV export
  const getCsvData = useCallback(() => {
    if (csvData.length === 0) {
      const obj = { paginationDisable: true };
      chartOfAccountActions.getTransactionCategoryExportList(obj).then(res => {
        if (res.status === 200) {
          setCsvData(res.data);
          setView(true);
          setTimeout(() => {
            csvLink.current?.link?.click();
          }, 0);
        }
      });
    } else {
      csvLink.current?.link?.click();
    }
  }, [chartOfAccountActions, csvData]);

  // Print handler
  const handlePrint = useCallback(() => {
    const paginationData = {
      pageNo: 0,
      pageSize: 1000,
    };
    const sortingData = {
      order: sorting[0]?.desc ? 'desc' : sorting[0]?.id ? 'asc' : '',
      sortingCol: sorting[0]?.id || '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    setHideForPrint(true);
    chartOfAccountActions
      .getTransactionCategoryList(postData)
      .then(res => {
        if (res.status === 200) {
          window.print();
          setHideForPrint(false);
          initializeData();
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setHideForPrint(false);
      });
  }, [chartOfAccountActions, commonActions, filterData, sorting, initializeData]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionCategoryCode',
        header: 'ACCOUNT CODE',
        cell: ({ row }) => (
          <span className="font-medium" style={{ color: theme.textPrimary }}>
            {row.original.transactionCategoryCode}
          </span>
        ),
      },
      {
        accessorKey: 'transactionCategoryName',
        header: 'ACCOUNT NAME',
        enableSorting: true,
        cell: ({ row }) => (
          <span
            style={{
              color: theme.textSecondary,
              fontWeight: 400,
            }}
          >
            {row.original.transactionCategoryName}
          </span>
        ),
      },
      {
        accessorKey: 'transactionTypeName',
        header: 'ACCOUNT TYPE',
        enableSorting: true,
        cell: ({ row }) => (
          <span style={{ color: theme.textSecondary }}>{row.original.transactionTypeName}</span>
        ),
      },
      ...(!hideForPrint
        ? [
            {
              id: 'actions',
              header: 'ACTION',
              cell: ({ row }) => {
                const account = row.original;
                const isEditable = account.editableFlag;

                return (
                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (isEditable) {
                          navigate('/admin/master/chart-account/detail', {
                            state: { id: account.transactionCategoryId },
                          });
                        }
                      }}
                      disabled={!isEditable}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        background: theme.bg,
                        boxShadow: isEditable ? shadows.raised.xs : 'none',
                        opacity: isEditable ? 1 : 0.5,
                        cursor: isEditable ? 'pointer' : 'not-allowed',
                      }}
                      title={isEditable ? 'Edit' : 'System Account - Cannot Edit'}
                    >
                      <Edit
                        className="w-4 h-4"
                        style={{ color: isEditable ? theme.primary : theme.textMuted }}
                      />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (isEditable) {
                          handleDelete(account);
                        }
                      }}
                      disabled={!isEditable}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        background: theme.bg,
                        boxShadow: isEditable ? shadows.raised.xs : 'none',
                        opacity: isEditable ? 1 : 0.5,
                        cursor: isEditable ? 'pointer' : 'not-allowed',
                      }}
                      title={isEditable ? 'Delete' : 'System Account - Cannot Delete'}
                    >
                      <Trash2
                        className="w-4 h-4"
                        style={{ color: isEditable ? theme.danger : theme.textMuted }}
                      />
                    </button>

                    {/* Lock icon for System Accounts */}
                    {!isEditable && (
                      <Lock
                        className="w-4 h-4 ml-1"
                        style={{ color: theme.textMuted }}
                        title="System Account"
                      />
                    )}
                  </div>
                );
              },
            },
          ]
        : []),
    ],
    [navigate, hideForPrint, handleDelete]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!transaction_category_list?.data) return [];
    return transaction_category_list.data.map(item => ({
      transactionCategoryId: item.transactionCategoryId,
      transactionCategoryCode: item.transactionCategoryCode || '',
      transactionCategoryName: item.transactionCategoryName || '',
      transactionTypeName: item.transactionTypeName || '',
      editableFlag: item.editableFlag,
    }));
  }, [transaction_category_list]);

  // Input styles
  const inputStyle = {
    background: theme.bg,
    boxShadow: shadows.pressed.sm,
    border: 'none',
    borderRadius: '12px',
    padding: '10px 16px',
    paddingLeft: '40px',
    fontSize: '14px',
    color: theme.textPrimary,
    outline: 'none',
    width: '280px',
  };

  const selectStyle = {
    background: theme.bg,
    boxShadow: shadows.pressed.sm,
    border: 'none',
    borderRadius: '12px',
    padding: '10px 16px',
    paddingRight: '36px',
    fontSize: '14px',
    color: theme.textSecondary,
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    minWidth: '180px',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233d5a80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="chart-account-screen" style={{ background: theme.bg, minHeight: '100%' }}>
      {dialog}

      {/* Main Card */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: theme.bg,
          boxShadow: shadows.raised.lg,
        }}
      >
        {/* Header Row with Title, Search, Filter, and Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: theme.bg,
                boxShadow: shadows.raised.sm,
              }}
            >
              <BarChart3 className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <h2 className="text-lg font-bold m-0" style={{ color: theme.textPrimary }}>
                Chart of Accounts
              </h2>
              <p className="text-sm m-0" style={{ color: theme.textMuted }}>
                Manage your chart of accounts
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          {!hideForPrint && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Input */}
              <div className="relative">
                <Search
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: theme.textMuted }}
                />
                <input
                  type="text"
                  placeholder="Search by Account Name or Code"
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Account Type Filter */}
              <select
                value={selectedAccountType}
                onChange={e => handleAccountTypeFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="">Filter by Account Type</option>
                {transaction_type_list?.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.transactionTypeName}
                  </option>
                ))}
              </select>

              {/* Action Buttons */}
              <button
                onClick={() => navigate('/admin/master/chart-account/create')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})`,
                  boxShadow: shadows.raised.sm,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Account
              </button>

              <button
                onClick={getCsvData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: theme.bg,
                  boxShadow: shadows.raised.sm,
                  color: theme.textSecondary,
                }}
              >
                <Download className="w-4 h-4" style={{ color: theme.primary }} />
                Export To CSV
              </button>
              {view && (
                <CSVLink
                  data={csvData}
                  filename="ChartOfAccount.csv"
                  className="hidden"
                  ref={csvLink}
                  target="_blank"
                />
              )}

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: theme.bg,
                  boxShadow: shadows.raised.sm,
                  color: theme.textSecondary,
                }}
              >
                <Printer className="w-4 h-4" style={{ color: theme.primary }} />
                Print
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div id="section-to-print">
          <DataTable
            columns={columns}
            data={tableData}
            manualPagination={!hideForPrint}
            pageCount={
              hideForPrint
                ? 1
                : Math.ceil((transaction_category_list?.count || 0) / pagination.pageSize)
            }
            onPaginationChange={setPagination}
            pagination={pagination}
            manualSorting
            onSortingChange={setSorting}
            sorting={sorting}
            onRowClick={goToDetailPage}
            neumorphicPagination
            totalCount={transaction_category_list?.count || 0}
            showPaginationTop={!hideForPrint}
            showPaginationBottom={!hideForPrint}
          />
        </div>
      </div>
    </div>
  );
}

export default ChartAccount;
