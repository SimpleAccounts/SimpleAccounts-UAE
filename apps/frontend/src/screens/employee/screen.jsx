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
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              background: '#eff6ff',
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
                background: '#dbeafe',
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
              style={{
                background: theme.primary,
              }}
            >
              <Plus className="w-4 h-4" />
              Add New Employee
            </button>
            <button
              onClick={getCsvData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50"
              style={{
                background: theme.bgWhite,
                border: `1px solid ${theme.border}`,
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
            Filter:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Enter Employee Name"
              value={filterData.name}
              onChange={e => handleFilterChange('name', e.target.value)}
              className="px-4 py-2.5 rounded-lg outline-none w-full transition-all duration-200"
              style={{
                background: theme.bgWhite,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
              onFocus={e => (e.target.style.borderColor = theme.primary)}
              onBlur={e => (e.target.style.borderColor = theme.border)}
            />
            <input
              type="text"
              placeholder="Enter Email"
              value={filterData.email}
              onChange={e => handleFilterChange('email', e.target.value)}
              className="px-4 py-2.5 rounded-lg outline-none w-full transition-all duration-200"
              style={{
                background: theme.bgWhite,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
              onFocus={e => (e.target.style.borderColor = theme.primary)}
              onBlur={e => (e.target.style.borderColor = theme.border)}
            />
            <div className="flex gap-2 lg:col-start-4">
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
            pageCount={Math.ceil((employee_list?.count || 0) / pagination.pageSize)}
            onPaginationChange={setPagination}
            pagination={pagination}
            manualSorting
            onSortingChange={setSorting}
            sorting={sorting}
            onRowClick={handleRowClick}
            totalCount={employee_list?.count || 0}
          />
        </div>
      </div>
    </div>
  );
}

export default Employee;
