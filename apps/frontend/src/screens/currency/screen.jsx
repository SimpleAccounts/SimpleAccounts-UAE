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

// Custom select styles for corporate theme
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    background: '#ffffff',
    border: state.isFocused ? '1px solid #2064d8' : '1px solid #e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(32, 100, 216, 0.1)' : 'none',
    borderRadius: '8px',
    padding: '2px 4px',
    minHeight: '42px',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#d1d5db',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? '#eff6ff' : state.isFocused ? '#f8f9fa' : 'transparent',
    color: state.isSelected ? '#2064d8' : '#4b5563',
    '&:hover': {
      background: '#f8f9fa',
    },
  }),
  menu: provided => ({
    ...provided,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
  }),
  singleValue: provided => ({
    ...provided,
    color: '#111827',
  }),
  placeholder: provided => ({
    ...provided,
    color: '#9ca3af',
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
                background: '#fef3c7',
              }}
            >
              <Coins className="w-6 h-6" style={{ color: '#f59e0b' }} />
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50"
              style={{
                background: theme.bgWhite,
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
              }}
            >
              <Download className="w-4 h-4" style={{ color: theme.primary }} />
              Export to CSV
            </button>
            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
              style={{
                background: theme.primary,
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
        className="rounded-xl overflow-hidden"
        style={{
          background: theme.bgWhite,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="p-6">
          <DataTable columns={columns} data={tableData} onRowClick={handleRowClick} />
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
            className="rounded-xl p-6 w-full max-w-md mx-4"
            style={{
              background: theme.bgWhite,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-100"
                style={{
                  background: theme.bg,
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
                  styles={selectStyles}
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
                  className="px-4 py-2.5 rounded-lg outline-none w-full transition-all duration-200"
                  style={{
                    background: theme.bgWhite,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                  }}
                  onFocus={e => (e.target.style.borderColor = theme.primary)}
                  onBlur={e => (e.target.style.borderColor = theme.border)}
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
                  className="px-4 py-2.5 rounded-lg outline-none w-full transition-all duration-200"
                  style={{
                    background: theme.bgWhite,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                  }}
                  onFocus={e => (e.target.style.borderColor = theme.primary)}
                  onBlur={e => (e.target.style.borderColor = theme.border)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
                style={{
                  background: theme.primary,
                }}
              >
                Save
              </button>
              <button
                onClick={() => setOpenModal(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50"
                style={{
                  background: theme.bgWhite,
                  border: `1px solid ${theme.border}`,
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
