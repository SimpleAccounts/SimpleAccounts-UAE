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

// Neumorphic theme constants
const theme = {
  bg: '#e8eef5',
  primary: '#2064d8',
  primaryDark: '#1a4fa8',
  secondary: '#21d8aa',
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
            className="px-2 py-1 rounded-lg text-xs font-medium"
            style={{
              background: `${theme.primary}15`,
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
              className="px-2 py-1 rounded-lg text-xs font-medium"
              style={{
                background: isActive ? `${theme.secondary}15` : `${theme.danger}15`,
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
        className="rounded-2xl p-6 mb-6"
        style={{
          background: theme.bg,
          boxShadow: shadows.raised.lg,
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: theme.bg,
                boxShadow: shadows.raised.sm,
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})`,
              boxShadow: shadows.raised.sm,
            }}
          >
            <Plus className="w-4 h-4" />
            {strings.Addnewcontact}
          </button>
        </div>
      </div>

      {/* Filters & Table Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: theme.bg,
          boxShadow: shadows.raised.lg,
        }}
      >
        {/* Filters Section */}
        <div className="p-6 border-b" style={{ borderColor: `${theme.shadowDark}40` }}>
          <h5 className="text-sm font-semibold mb-4" style={{ color: theme.textPrimary }}>
            {strings.Filter}:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              value={filterData.name}
              placeholder={`${strings.Enter} ${strings.Name}`}
              className="px-4 py-2 rounded-xl border-0 outline-none w-full"
              style={{
                background: theme.bg,
                boxShadow: shadows.pressed.sm,
                color: theme.textPrimary,
              }}
              onChange={e => handleFilterChange('name', e.target.value)}
            />
            <input
              value={filterData.email}
              placeholder={`${strings.Enter} ${strings.Email}`}
              className="px-4 py-2 rounded-xl border-0 outline-none w-full"
              style={{
                background: theme.bg,
                boxShadow: shadows.pressed.sm,
                color: theme.textPrimary,
              }}
              onChange={e => handleFilterChange('email', e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})`,
                  boxShadow: shadows.raised.sm,
                }}
              >
                <Search className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={clearAll}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: theme.bg,
                  boxShadow: shadows.raised.sm,
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
            neumorphicPagination
            totalCount={contact_list?.count || 0}
          />
        </div>
      </div>
    </div>
  );
}

export default Contact;
