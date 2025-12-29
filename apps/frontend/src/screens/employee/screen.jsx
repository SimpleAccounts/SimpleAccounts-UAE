import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Users, Download } from 'lucide-react';
import { CSVLink } from '@/components/ui/csv-link';

import { DataTable } from '@/components/ui/data-table';

import { Loader, ConfirmDeleteModal } from 'components';

import * as EmployeeActions from './actions';
import { CommonActions } from 'services/global';

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

/**
 * Modern Employee Screen
 * Uses functional components with Neumorphic design
 */
function Employee() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const csvLink = useRef(null);

  // Redux state
  const employee_list = useSelector(state => state.employee.employee_list);

  // Actions
  const employeeActions = useMemo(() => bindActionCreators(EmployeeActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [view, setView] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

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
  });

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
    const postData = { ...filterData, ...paginationData, ...sortingData };

    employeeActions
      .getEmployeeList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [employeeActions, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

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
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Bulk delete
  const bulkDelete = () => {
    if (selectedRows.length > 0) {
      setDialog(
        <ConfirmDeleteModal
          isOpen={true}
          okHandler={removeBulk}
          cancelHandler={() => setDialog(null)}
          message="This Employee will be deleted permanently and cannot be recovered."
          message1={<b>Delete Employee?</b>}
        />
      );
    } else {
      commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.');
    }
  };

  const removeBulk = () => {
    setDialog(null);
    const obj = { ids: selectedRows };
    employeeActions
      .removeBulkEmployee(obj)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data?.message || 'Employees Deleted Successfully'
          );
          initializeData();
          setSelectedRows([]);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err?.data?.message || 'Employees Deleted unsuccessfully'
        );
      });
  };

  // CSV export
  const getCsvData = () => {
    if (csvData.length === 0) {
      const obj = { paginationDisable: true };
      employeeActions.getEmployeeList(obj).then(res => {
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
  };

  // Row click handler
  const handleRowClick = row => {
    navigate('/admin/master/employee/detail', { state: { id: row.id } });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Employee Name',
        cell: ({ row }) => (
          <span className="font-semibold" style={{ color: theme.textPrimary }}>
            {row.original.fullName}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span style={{ color: theme.textSecondary }}>{row.original.email}</span>,
      },
      {
        accessorKey: 'dateOfJoining',
        header: 'Date of Joining',
        cell: ({ row }) => (
          <span style={{ color: theme.textSecondary }}>{row.original.dateOfJoining}</span>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
          <span
            className="px-2 py-1 rounded-lg text-xs font-medium"
            style={{
              background: `${theme.primary}15`,
              color: theme.primary,
            }}
          >
            {row.original.department || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'designation',
        header: 'Designation',
        cell: ({ row }) => (
          <span style={{ color: theme.textSecondary }}>{row.original.designation}</span>
        ),
      },
    ],
    []
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!employee_list?.data) return [];
    return employee_list.data.map(item => ({
      id: item.id,
      fullName: item.fullName || '',
      email: item.email || '',
      dateOfJoining: item.dateOfJoining || '',
      department: item.department || '',
      designation: item.designation || '',
    }));
  }, [employee_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="employee-screen" style={{ background: theme.bg, minHeight: '100%' }}>
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
                Employees
              </h1>
              <p className="text-sm m-0" style={{ color: theme.textMuted }}>
                Manage your employees
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate('/admin/master/employee/create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})`,
                boxShadow: shadows.raised.sm,
              }}
            >
              <Plus className="w-4 h-4" />
              Add New Employee
            </button>
            <button
              onClick={getCsvData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: theme.bg,
                boxShadow: shadows.raised.sm,
                color: theme.textSecondary,
              }}
            >
              <Download className="w-4 h-4" style={{ color: theme.primary }} />
              Export CSV
            </button>
            {view && (
              <CSVLink
                data={csvData}
                filename="Employees.csv"
                className="hidden"
                ref={csvLink}
                target="_blank"
              />
            )}
          </div>
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
            Filter:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Enter Employee Name"
              value={filterData.name}
              onChange={e => handleFilterChange('name', e.target.value)}
              className="px-4 py-2 rounded-xl border-0 outline-none w-full"
              style={{
                background: theme.bg,
                boxShadow: shadows.pressed.sm,
                color: theme.textPrimary,
              }}
            />
            <input
              type="text"
              placeholder="Enter Email"
              value={filterData.email}
              onChange={e => handleFilterChange('email', e.target.value)}
              className="px-4 py-2 rounded-xl border-0 outline-none w-full"
              style={{
                background: theme.bg,
                boxShadow: shadows.pressed.sm,
                color: theme.textPrimary,
              }}
            />
            <div className="flex gap-2 lg:col-start-4">
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
            pageCount={Math.ceil((employee_list?.count || 0) / pagination.pageSize)}
            onPaginationChange={setPagination}
            pagination={pagination}
            manualSorting
            onSortingChange={setSorting}
            sorting={sorting}
            onRowClick={handleRowClick}
            neumorphicPagination
            totalCount={employee_list?.count || 0}
          />
        </div>
      </div>
    </div>
  );
}

export default Employee;
