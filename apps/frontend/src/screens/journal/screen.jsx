import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, FileText, Eye, Edit } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { CSVLink } from '@/components/ui/csv-link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, Currency } from 'components';

import * as JournalActions from './actions';
import { CommonActions } from 'services/global';

import dayjs from '@/utils/date';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Journal Entries List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function Journal() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const journal_list = useSelector(state => state.journal.journal_list);
  const universal_currency_list = useSelector(state => state.common.universal_currency_list);
  const page_num = useSelector(state => state.journal.page_num);
  const cancel_flag = useSelector(state => state.journal.cancel_flag);

  // Actions
  const journalActions = useMemo(() => bindActionCreators(JournalActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [view, setView] = useState(false);
  const csvLink = useRef(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  // Filter state
  const [filterData, setFilterData] = useState({
    journalDate: '',
    journalReferenceNo: '',
    description: '',
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  const initializeData = useCallback(() => {
    let pageNo = pagination.pageIndex;
    if (cancel_flag) {
      pageNo = page_num - 1;
    }

    const paginationData = {
      pageNo: pageNo,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting[0]?.desc ? 'desc' : sorting[0]?.id ? 'asc' : '',
      sortingCol: sorting[0]?.id || '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    journalActions
      .getJournalList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });

    journalActions.setCancelFlag(false);
  }, [journalActions, commonActions, filterData, pagination, sorting, cancel_flag, page_num]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Navigate to detail
  const goToDetail = useCallback(
    row => {
      if (row.postingReferenceType === 'MANUAL') {
        navigate('/admin/accountant/journal/detail', {
          state: { id: row.journalId, postingReferenceType: 'MANUAL' },
        });
      } else {
        navigate('/admin/accountant/journal/view', {
          state: { id: row.journalId },
        });
      }
    },
    [navigate]
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
      journalDate: '',
      journalReferenceNo: '',
      description: '',
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // CSV export
  const getCsvData = useCallback(() => {
    if (csvData.length === 0) {
      const obj = { paginationDisable: true };
      journalActions.getJournalList(obj).then(res => {
        if (res.status === 200) {
          setCsvData(res.data.data);
          setView(true);
          setTimeout(() => {
            csvLink.current?.link?.click();
          }, 0);
        }
      });
    } else {
      csvLink.current?.link?.click();
    }
  }, [journalActions, csvData]);

  // Get currency symbol
  const getCurrencySymbol = useMemo(() => {
    return universal_currency_list?.[0]?.currencyIsoCode || 'USD';
  }, [universal_currency_list]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'journalReferenceNo',
        header: strings.JOURNALREFERENCENO,
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.journalReferenceNo}</span>
        ),
      },
      {
        accessorKey: 'postingReferenceTypeDisplayName',
        header: strings.TRANSACTIONTYPE,
      },
      {
        accessorKey: 'journalDate',
        header: strings.POSTDATE,
        cell: ({ row }) => {
          const date = row.original.journalDate;
          return date ? dayjs(date).format('DD-MM-YYYY') : '';
        },
      },
      {
        accessorKey: 'description',
        header: strings.NOTES,
        cell: ({ row }) => <span className="line-clamp-2">{row.original.description}</span>,
      },
      {
        accessorKey: 'accounts',
        header: strings.ACCOUNT,
        cell: ({ row }) => {
          const items = row.original.journalLineItems || [];
          return (
            <ul className="list-none p-0 m-0 space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-sm">
                  {item.transactionCategoryName}
                </li>
              ))}
            </ul>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'debitAmount',
        header: strings.DEBITAMOUNT,
        cell: ({ row }) => {
          const items = row.original.journalLineItems || [];
          return (
            <ul className="list-none p-0 m-0 space-y-1 text-right">
              {items.map((item, index) => (
                <li key={index} className="text-sm">
                  <Currency
                    value={item.debitAmount?.toFixed(6) || 0}
                    currencySymbol={getCurrencySymbol}
                  />
                </li>
              ))}
            </ul>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'creditAmount',
        header: strings.CREDITAMOUNT,
        cell: ({ row }) => {
          const items = row.original.journalLineItems || [];
          return (
            <ul className="list-none p-0 m-0 space-y-1 text-right">
              {items.map((item, index) => (
                <li key={index} className="text-sm">
                  <Currency
                    value={item.creditAmount?.toFixed(6) || 0}
                    currencySymbol={getCurrencySymbol}
                  />
                </li>
              ))}
            </ul>
          );
        },
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const journal = row.original;
          const actions =
            journal.postingReferenceType === 'MANUAL'
              ? [
                  {
                    label: strings.Edit,
                    icon: Edit,
                    onClick: () =>
                      navigate('/admin/accountant/journal/detail', {
                        state: { id: journal.journalId, postingReferenceType: 'MANUAL' },
                      }),
                  },
                ]
              : [
                  {
                    label: strings.View,
                    icon: Eye,
                    onClick: () =>
                      navigate('/admin/accountant/journal/view', {
                        state: { id: journal.journalId },
                      }),
                  },
                ];

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate, getCurrencySymbol]
  );

  // Transform data for table (API returns { data: [...], count } or reducer may store array)
  const tableData = useMemo(() => {
    const list = Array.isArray(journal_list)
      ? journal_list
      : Array.isArray(journal_list?.data)
        ? journal_list.data
        : [];
    return list.map(item => ({
      journalId: item.journalId,
      journalReferenceNo: item.journalReferenceNo || '',
      postingReferenceTypeDisplayName: item.postingReferenceTypeDisplayName || '',
      postingReferenceType: item.postingReferenceType || '',
      journalDate: item.journalDate || '',
      description: item.description || '',
      journalLineItems: item.journalLineItems || [],
      createdByName: item.createdByName || '',
    }));
  }, [journal_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="journal-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.Journal}</CardTitle>
              </div>
              <Button
                onClick={() => {
                  journalActions.getSavedPageNum(1);
                  navigate('/admin/accountant/journal/create');
                }}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewJournal}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">{strings.Filter}:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DatePicker
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background input-transition"
                  id="date"
                  name="journalDate"
                  placeholderText={`${strings.Enter} ${strings.PostDate}`}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  autoComplete="off"
                  selected={filterData.journalDate}
                  onChange={value => handleFilterChange('journalDate', value)}
                />
                <Input
                  maxLength={20}
                  value={filterData.journalReferenceNo}
                  placeholder={`${strings.Enter} ${strings.ReferenceNumber}`}
                  className="input-transition"
                  onChange={e => handleFilterChange('journalReferenceNo', e.target.value)}
                />
                <Input
                  maxLength={30}
                  value={filterData.description}
                  placeholder={`${strings.Enter} ${strings.Notes}`}
                  className="input-transition"
                  onChange={e => handleFilterChange('description', e.target.value)}
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

            {/* CSV Export (hidden) */}
            {view && (
              <CSVLink
                data={csvData}
                filename="Journal.csv"
                className="hidden"
                ref={csvLink}
                target="_blank"
              />
            )}

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={tableData}
              manualPagination
              pageCount={
                Math.ceil(
                  (journal_list?.count ?? journal_list?.data?.count ?? 0) / pagination.pageSize
                ) || 1
              }
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
              onRowClick={goToDetail}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Journal;
