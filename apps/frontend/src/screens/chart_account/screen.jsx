import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Printer, BarChart3, Lock, LockOpen, Edit } from 'lucide-react';
import { CSVLink } from '@/components/ui/csv-link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, ConfirmDeleteModal } from 'components';

import * as ChartAccountActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Chart of Accounts Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function ChartAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const csvLink = useRef(null);

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
  }, [pagination, sorting]);

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
        header: strings.ACCOUNTCODE,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.transactionCategoryCode}</span>
        ),
      },
      {
        accessorKey: 'transactionCategoryName',
        header: strings.ACCOUNTNAME,
        cell: ({ row }) => (
          <span className={`${row.original.editableFlag ? 'text-primary cursor-pointer' : ''}`}>
            {row.original.transactionCategoryName}
          </span>
        ),
      },
      {
        accessorKey: 'transactionTypeName',
        header: strings.ACCOUNTTYPE,
      },
      ...(!hideForPrint
        ? [
            {
              accessorKey: 'editableFlag',
              header: strings.ACCOUNT,
              cell: ({ row }) => {
                const isEditable = row.original.editableFlag;
                return isEditable ? (
                  <LockOpen className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                );
              },
            },
            {
              id: 'actions',
              header: '',
              cell: ({ row }) => {
                const account = row.original;
                if (!account.editableFlag) return null;

                const actions = [
                  {
                    label: strings.Edit,
                    icon: Edit,
                    onClick: () =>
                      navigate('/admin/master/chart-account/detail', {
                        state: { id: account.transactionCategoryId },
                      }),
                  },
                ];

                return <DataTableRowActions row={row} actions={actions} />;
              },
            },
          ]
        : []),
    ],
    [navigate, hideForPrint]
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="chart-account-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.ChartofAccounts}</CardTitle>
              </div>
              {!hideForPrint && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate('/admin/master/chart-account/create')}
                    className="transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {strings.AddNewAccount}
                  </Button>
                  <Button onClick={getCsvData} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    {strings.export_csv}
                  </Button>
                  {view && (
                    <CSVLink
                      data={csvData}
                      filename="ChartOfAccount.csv"
                      className="hidden"
                      ref={csvLink}
                      target="_blank"
                    />
                  )}
                  <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    {strings.print_csv}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
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
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ChartAccount;
