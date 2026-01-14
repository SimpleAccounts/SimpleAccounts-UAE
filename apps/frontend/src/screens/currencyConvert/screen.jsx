import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Banknote, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable } from '@/components/ui/data-table';
import { Loader } from 'components';
import * as CurrencyConvertActions from './actions';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import config from 'constants/config';

const strings = new LocalizedStrings(languageData);

// Corporate theme constants
const theme = {
  bg: '#f8f9fa',
  bgWhite: '#ffffff',
  primary: '#2064d8',
  primaryHover: '#1a56b8',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderHover: '#d1d5db',
};

const CurrencyConvert = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currency_converstion_list } = useSelector(state => ({
    currency_converstion_list: state.currencyConvert.currency_converstion_list,
  }));

  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData] = useState({
    currencyCode: '',
    currencyCodeConvertedTo: '',
    exchangeRate: '',
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  const initializeData = useCallback(() => {
    setLoading(true);
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    dispatch(CurrencyConvertActions.getCurrencyConversion(postData))
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
  }, [dispatch, pagination, sorting, filterData]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  const goToDetail = row => {
    if (!config.ADD_CURRENCY) return;
    if (row.currencyConversionId === 10000) {
      toast.error('Cannot Edit Base Currency');
    } else {
      navigate('/admin/master/currencyConvert/detail', { state: { id: row.currencyConversionId } });
    }
  };

  const renderCurrency = value => {
    if (value) {
      return (
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ background: '#eff6ff', color: theme.primary }}
        >
          {value}
        </span>
      );
    } else {
      return (
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ background: '#fef2f2', color: theme.danger }}
        >
          No Specified
        </span>
      );
    }
  };

  const renderStatus = isActive => {
    if (isActive === true) {
      return (
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ background: '#ecfdf5', color: theme.secondary }}
        >
          Active
        </span>
      );
    } else {
      return (
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ background: '#fef3c7', color: theme.warning }}
        >
          Inactive
        </span>
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'currencyName',
        header: strings.CURRENCYNAME || 'Currency Name',
        cell: ({ getValue }) => renderCurrency(getValue()),
      },
      {
        accessorKey: 'description',
        header: strings.CURRENCYNAMECONVERTEDTO || 'Converted To',
        cell: ({ getValue }) => renderCurrency(getValue()),
      },
      {
        accessorKey: 'exchangeRate',
        header: strings.EXCHANGERATE || 'Exchange Rate',
        cell: ({ row }) => (
          <span style={{ color: theme.textSecondary }}>{row.original.exchangeRate}</span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: strings.Status || 'Status',
        cell: ({ getValue }) => renderStatus(getValue()),
      },
    ],
    []
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="currency-convert-screen" style={{ background: theme.bg, minHeight: '100%' }}>
      {/* Page Header Card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: theme.bgWhite,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: '#eff6ff' }}
            >
              <Banknote className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <h1 className="text-xl font-bold m-0" style={{ color: theme.textPrimary }}>
                {strings.CurrencyRate || 'Currency Rate'}
              </h1>
              <p className="text-sm m-0" style={{ color: theme.textMuted }}>
                Manage currency exchange rates
              </p>
            </div>
          </div>

          {/* Actions Section */}
          {config.ADD_CURRENCY && (
            <button
              onClick={() => navigate('/admin/master/CurrencyConvert/create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
              style={{ background: theme.primary }}
            >
              <Plus className="w-4 h-4" />
              {strings.AddNewCurrencyConversion || 'Add New Currency'}
            </button>
          )}
        </div>
      </div>

      {/* Data Table Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: theme.bgWhite,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="p-6">
          <DataTable
            data={currency_converstion_list?.data || []}
            columns={columns}
            manualPagination={true}
            pageCount={
              currency_converstion_list?.count
                ? Math.ceil(currency_converstion_list.count / pagination.pageSize)
                : 0
            }
            onPaginationChange={setPagination}
            pagination={pagination}
            manualSorting={true}
            onSortingChange={setSorting}
            sorting={sorting}
            onRowClick={goToDetail}
            totalCount={currency_converstion_list?.count || 0}
          />
        </div>
      </div>
    </div>
  );
};

export default CurrencyConvert;
