import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Plus, Coins, Download, X } from 'lucide-react';
import Select from 'react-select';

import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';

import { Loader } from 'components';

import * as currenciesActions from './actions';

import './style.scss';

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

// Custom select styles for neumorphic theme
const neuSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    background: theme.bg,
    boxShadow: shadows.pressed.sm,
    border: 'none',
    borderRadius: '12px',
    padding: '2px 4px',
    minHeight: '42px',
    '&:hover': {
      border: 'none',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? `${theme.primary}15` : 'transparent',
    color: state.isSelected ? theme.primary : theme.textSecondary,
    '&:hover': {
      background: `${theme.primary}10`,
    },
  }),
  menu: provided => ({
    ...provided,
    background: theme.bg,
    boxShadow: shadows.raised.lg,
    borderRadius: '12px',
    overflow: 'hidden',
  }),
  singleValue: provided => ({
    ...provided,
    color: theme.textPrimary,
  }),
  placeholder: provided => ({
    ...provided,
    color: theme.textMuted,
  }),
};

/**
 * Modern Currency Screen
 * Uses functional components with Neumorphic design
 */
function Currency() {
  const dispatch = useDispatch();

  // Redux state
  const currency_list = useSelector(state => state.currency.currency_list);

  // Actions
  const actions = useMemo(() => bindActionCreators(currenciesActions, dispatch), [dispatch]);

  // Local state
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [formData, setFormData] = useState({
    currencyCode: '',
    currencyName: '',
    currencySymbol: '',
  });

  // Initialize data
  useEffect(() => {
    actions.getCurrencyList().then(res => {
      if (res.status === 200) {
        setLoading(false);
      }
    });
  }, [actions]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Currency Name',
        cell: ({ row }) => (
          <span className="font-semibold" style={{ color: theme.textPrimary }}>
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ row }) => (
          <span style={{ color: theme.textSecondary }}>{row.original.symbol}</span>
        ),
      },
    ],
    []
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!currency_list || currency_list.length === 0) return [];
    return currency_list.map(item => ({
      id: item.id || item.currencyCode,
      name: item.currencyName || '',
      symbol: item.currencySymbol || '',
    }));
  }, [currency_list]);

  // Handle row click
  const handleRowClick = () => {
    setOpenModal(true);
  };

  // Handle form change
  const handleFormChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle save
  const handleSave = () => {
    // Save logic would go here
    setOpenModal(false);
    setFormData({
      currencyCode: '',
      currencyName: '',
      currencySymbol: '',
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="currency-screen" style={{ background: theme.bg, minHeight: '100%' }}>
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
              <Coins className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <h1 className="text-xl font-bold m-0" style={{ color: theme.textPrimary }}>
                Currencies
              </h1>
              <p className="text-sm m-0" style={{ color: theme.textMuted }}>
                Manage currency rates
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex gap-3 flex-wrap">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: theme.bg,
                boxShadow: shadows.raised.sm,
                color: theme.textSecondary,
              }}
            >
              <Download className="w-4 h-4" style={{ color: theme.primary }} />
              Export to CSV
            </button>
            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})`,
                boxShadow: shadows.raised.sm,
              }}
            >
              <Plus className="w-4 h-4" />
              New Currency
            </button>
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: theme.bg,
          boxShadow: shadows.raised.lg,
        }}
      >
        <div className="p-6">
          <DataTable
            columns={columns}
            data={tableData}
            onRowClick={handleRowClick}
            neumorphicPagination
          />
        </div>
      </div>

      {/* Currency Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setOpenModal(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md mx-4"
            style={{
              background: theme.bg,
              boxShadow: shadows.raised.lg,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold m-0" style={{ color: theme.textPrimary }}>
                  Create & Update Currency
                </h2>
                <p className="text-sm m-0" style={{ color: theme.textMuted }}>
                  Add or update currency information
                </p>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: theme.bg,
                  boxShadow: shadows.raised.xs,
                }}
              >
                <X className="w-4 h-4" style={{ color: theme.textMuted }} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label style={{ color: theme.textPrimary }}>Currency Code</Label>
                <Select
                  styles={neuSelectStyles}
                  placeholder="Select Currency Code"
                  options={[]}
                  onChange={option => handleFormChange('currencyCode', option?.value || '')}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: theme.textPrimary }}>
                  <span style={{ color: theme.danger }}>* </span>Currency Name
                </Label>
                <input
                  placeholder="Enter Name"
                  value={formData.currencyName}
                  onChange={e => handleFormChange('currencyName', e.target.value)}
                  className="px-4 py-2 rounded-xl border-0 outline-none w-full"
                  style={{
                    background: theme.bg,
                    boxShadow: shadows.pressed.sm,
                    color: theme.textPrimary,
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: theme.textPrimary }}>
                  <span style={{ color: theme.danger }}>* </span>Symbol
                </Label>
                <input
                  placeholder="Enter Symbol"
                  value={formData.currencySymbol}
                  onChange={e => handleFormChange('currencySymbol', e.target.value)}
                  className="px-4 py-2 rounded-xl border-0 outline-none w-full"
                  style={{
                    background: theme.bg,
                    boxShadow: shadows.pressed.sm,
                    color: theme.textPrimary,
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})`,
                  boxShadow: shadows.raised.sm,
                }}
              >
                Save
              </button>
              <button
                onClick={() => setOpenModal(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: theme.bg,
                  boxShadow: shadows.raised.sm,
                  color: theme.textSecondary,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Currency;
