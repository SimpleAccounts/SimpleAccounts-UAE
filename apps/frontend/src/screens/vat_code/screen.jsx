import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';

import { Loader, ConfirmDeleteModal } from 'components';

import * as VatActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

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

/**
 * Modern VAT Code Screen
 * Uses functional components with Corporate design
 */
function VatCode() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const vat_list = useSelector(state => state.vat.vat_list);

  // Actions
  const vatActions = useMemo(() => bindActionCreators(VatActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Get company details
  useEffect(() => {
    vatActions
      .getCompanyDetails()
      .then(res => {
        if (res.status === 200) {
          setCompanyDetails(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [vatActions, commonActions]);

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
    const postData = { ...paginationData, ...sortingData };

    vatActions
      .getVatList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [vatActions, commonActions, pagination, sorting]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Bulk delete
  const bulkDelete = () => {
    if (selectedRows.length === 0) {
      commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.');
      return;
    }

    vatActions.getVatCount(selectedRows).then(res => {
      if (res.data > 0) {
        commonActions.tostifyAlert(
          'error',
          'You need to delete invoices to delete the VAT category'
        );
      } else {
        setDialog(
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={removeBulk}
            cancelHandler={() => setDialog(null)}
            message="This VAT Category will be deleted permanently and cannot be recovered."
            message1={<b>Delete VAT Category?</b>}
          />
        );
      }
    });
  };

  const removeBulk = () => {
    setDialog(null);
    const obj = { ids: selectedRows };

    vatActions
      .deleteVat(obj)
      .then(res => {
        initializeData();
        commonActions.tostifyAlert('success', res.data.message);
        setSelectedRows([]);
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Delete failed');
      });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: strings.VATNAME || 'VAT Name',
        cell: ({ row }) => (
          <span className="font-semibold" style={{ color: theme.textPrimary }}>
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'vat',
        header: strings.VATPERCENTAGE || 'VAT Percentage',
        cell: ({ row }) => <span style={{ color: theme.textSecondary }}>{row.original.vat} %</span>,
      },
    ],
    []
  );

  // Transform data for table (filter out specific IDs)
  const tableData = useMemo(() => {
    if (!vat_list?.data) return [];
    return vat_list.data
      .filter(item => ![3, 4, 10].includes(item.id))
      .map(item => ({
        id: item.id,
        name: item.name || '',
        vat: item.vat || 0,
      }));
  }, [vat_list]);

  // Row click handler
  const handleRowClick = row => {
    navigate('/admin/master/vat-category/detail', { state: { id: row.id } });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="vat-code-screen" style={{ background: theme.bg, minHeight: '100%' }}>
      {dialog}

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
              <Receipt className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <h1 className="text-xl font-bold m-0" style={{ color: theme.textPrimary }}>
                {strings.VATCategory || 'VAT Category'}
              </h1>
              <p className="text-sm m-0" style={{ color: theme.textMuted }}>
                Manage VAT categories
              </p>
            </div>
          </div>

          {/* Actions Section */}
          {companyDetails && companyDetails.isRegisteredVat !== true && (
            <button
              onClick={() => navigate('/admin/master/vat-category/create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
              style={{ background: theme.primary }}
            >
              <Plus className="w-4 h-4" />
              {strings.AddNewVat || 'Add New VAT'}
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
            columns={columns}
            data={tableData}
            manualPagination
            pageCount={Math.ceil((vat_list?.count || 0) / pagination.pageSize)}
            onPaginationChange={setPagination}
            pagination={pagination}
            manualSorting
            onSortingChange={setSorting}
            sorting={sorting}
            onRowClick={handleRowClick}
            totalCount={vat_list?.count || 0}
          />
        </div>
      </div>
    </div>
  );
}

export default VatCode;
