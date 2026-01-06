import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Users, Edit } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader } from 'components';

import * as ContactActions from './actions';
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
 * Modern Contact List Screen
 * Uses functional components with Neumorphic design
 */
function Contact() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const contact_list = useSelector(state => state.contact.contact_list);
  const contact_type_list = useSelector(state => state.contact.contact_type_list);

  // Actions
  const contactActions = useMemo(() => bindActionCreators(ContactActions, dispatch), [dispatch]);
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
    name: '',
    email: '',
    contactType: '',
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  const initializeData = useCallback(() => {
    const paginationData = {
      pageNo: pagination.pageIndex ?? 0,
      pageSize: pagination.pageSize ?? 10,
    };

    // Only include sorting if we have sorting data
    const sortingData = {};
    if (sorting && sorting.length > 0 && sorting[0]?.id) {
      sortingData.order = sorting[0].desc ? 'desc' : 'asc';
      sortingData.sortingCol = sorting[0].id;
    }

    // Build filter data, omitting empty strings
    const cleanFilterData = {};
    if (filterData.name && filterData.name.trim()) {
      cleanFilterData.name = filterData.name.trim();
    }
    if (filterData.email && filterData.email.trim()) {
      cleanFilterData.email = filterData.email.trim();
    }
    if (filterData.contactType) {
      cleanFilterData.contactType = filterData.contactType;
    }

    const postData = { ...cleanFilterData, ...paginationData, ...sortingData };

    contactActions
      .getContactList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [contactActions, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    contactActions.getContactTypeList();
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Navigate to detail
  const goToDetail = useCallback(
    row => {
      navigate('/admin/master/contact/detail', { state: { id: row.id } });
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
      name: '',
      email: '',
      contactType: '',
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: strings.CONTACTORGANIZATIONTNAME,
        cell: ({ row }) => {
          const { fullName, organization } = row.original;
          if (!organization) {
            return (
              <span className="font-semibold" style={{ color: theme.textPrimary }}>
                {fullName || '-'}
              </span>
            );
          }
          return (
            <span className="font-semibold" style={{ color: theme.textPrimary }}>
              {fullName} <span style={{ color: theme.textMuted }}>({organization})</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'contactTypeString',
        header: strings.CONTACTTYPE,
        cell: ({ row }) => (
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              background: '#eff6ff',
              color: theme.primary,
            }}
          >
            {row.original.contactTypeString}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: strings.Email,
        cell: ({ row }) => <span style={{ color: theme.textSecondary }}>{row.original.email}</span>,
      },
      {
        accessorKey: 'mobileNumber',
        header: strings.MOBILENUMBER,
        cell: ({ row }) => {
          const mobile = row.original.mobileNumber;
          return <span style={{ color: theme.textSecondary }}>{mobile ? `+${mobile}` : ''}</span>;
        },
      },
      {
        accessorKey: 'isActive',
        header: strings.STATUS,
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                background: isActive ? '#ecfdf5' : '#fef2f2',
                color: isActive ? theme.secondary : theme.danger,
              }}
            >
              {isActive ? 'Active' : 'InActive'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const contact = row.original;
          const actions = [
            {
              label: strings.Edit,
              icon: Edit,
              onClick: () =>
                navigate('/admin/master/contact/detail', {
                  state: { id: contact.id },
                }),
            },
          ];

          return <DataTableRowActions row={row} actions={actions} />;
        },
      },
    ],
    [navigate]
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!contact_list?.data) return [];
    return contact_list.data.map(contact => ({
      id: contact.id,
      fullName: contact.fullName || '',
      organization: contact.organization || '',
      contactTypeString: contact.contactTypeString || '',
      email: contact.email || '',
      mobileNumber: contact.mobileNumber || '',
      isActive: contact.isActive,
    }));
  }, [contact_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="contact-screen" style={{ background: theme.bg, minHeight: '100%' }}>
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
              style={{
                background: '#eff6ff',
              }}
            >
              <Users className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <h1 className="text-xl font-bold m-0" style={{ color: theme.textPrimary }}>
                {strings.Contact}
              </h1>
              <p className="text-sm m-0" style={{ color: theme.textMuted }}>
                Manage your contacts
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <button
            onClick={() => navigate('/admin/master/contact/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
            style={{
              background: theme.primary,
            }}
          >
            <Plus className="w-4 h-4" />
            {strings.Addnewcontact}
          </button>
        </div>
      </div>

      {/* Filters & Table Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: theme.bgWhite,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Filters Section */}
        <div className="p-6 border-b" style={{ borderColor: theme.border }}>
          <h5 className="text-sm font-semibold mb-4" style={{ color: theme.textPrimary }}>
            {strings.Filter}:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              value={filterData.name}
              placeholder={`${strings.Enter} ${strings.Name}`}
              className="px-4 py-2.5 rounded-lg outline-none w-full transition-all duration-200"
              style={{
                background: theme.bgWhite,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
              onFocus={e => (e.target.style.borderColor = theme.primary)}
              onBlur={e => (e.target.style.borderColor = theme.border)}
              onChange={e => handleFilterChange('name', e.target.value)}
            />
            <input
              value={filterData.email}
              placeholder={`${strings.Enter} ${strings.Email}`}
              className="px-4 py-2.5 rounded-lg outline-none w-full transition-all duration-200"
              style={{
                background: theme.bgWhite,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
              onFocus={e => (e.target.style.borderColor = theme.primary)}
              onBlur={e => (e.target.style.borderColor = theme.border)}
              onChange={e => handleFilterChange('email', e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-90"
                style={{
                  background: theme.primary,
                }}
              >
                <Search className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={clearAll}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-50"
                style={{
                  background: theme.bgWhite,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <RefreshCw className="w-4 h-4" style={{ color: theme.textSecondary }} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          <DataTable
            columns={columns}
            data={tableData}
            manualPagination
            pageCount={Math.ceil((contact_list?.count || 0) / pagination.pageSize)}
            onPaginationChange={setPagination}
            pagination={pagination}
            manualSorting
            onSortingChange={setSorting}
            sorting={sorting}
            onRowClick={goToDetail}
            totalCount={contact_list?.count || 0}
          />
        </div>
      </div>
    </div>
  );
}

export default Contact;
