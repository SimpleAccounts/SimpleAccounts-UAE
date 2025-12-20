import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Users, Edit, Eye } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader } from 'components';
import dayjs from '@/utils/date';

import * as PayrollEmployeeActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Payroll Employee Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function PayrollEmployee() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const payroll_employee_list = useSelector(
    (state) => state.payrollEmployee.payroll_employee_list
  );

  // Actions
  const payrollEmployeeActions = useMemo(
    () => bindActionCreators(PayrollEmployeeActions, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

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

    payrollEmployeeActions
      .getPayrollEmployeeList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [payrollEmployeeActions, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Filter handlers
  const handleFilterChange = (name, value) => {
    setFilterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    initializeData();
  };

  const clearAll = () => {
    setFilterData({
      name: '',
      email: '',
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Row click handler
  const handleRowClick = (row) => {
    navigate('/admin/payroll/employee/viewEmployee', { state: { id: row.id } });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: strings.EmployeeName,
        cell: ({ row }) => (
          <span className="font-medium text-primary cursor-pointer">
            {row.original.fullName}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: strings.Email,
      },
      {
        accessorKey: 'dateOfJoining',
        header: strings.DateOfJoining,
        cell: ({ row }) =>
          row.original.dateOfJoining
            ? dayjs(row.original.dateOfJoining).format('DD-MM-YYYY')
            : '-',
      },
      {
        accessorKey: 'department',
        header: strings.Department,
      },
      {
        accessorKey: 'designation',
        header: strings.Designation,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const emp = row.original;
          const actions = [
            {
              label: strings.Edit,
              icon: Edit,
              onClick: () =>
                navigate('/admin/payroll/employee/detail', {
                  state: { id: emp.id },
                }),
            },
            {
              label: strings.SalarySlip,
              icon: Eye,
              onClick: () =>
                navigate('/admin/payroll/employee/salarySlip', {
                  state: { id: emp.id, monthNo: 4 },
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
    if (!payroll_employee_list?.data) return [];
    return payroll_employee_list.data.map((item) => ({
      id: item.id,
      fullName: item.fullName || '',
      email: item.email || '',
      dateOfJoining: item.dateOfJoining || '',
      department: item.department || '',
      designation: item.designation || '',
    }));
  }, [payroll_employee_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="payroll-employee-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.PayrollEmployees}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/payroll/employee/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewEmployee}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">{strings.Filter}:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  type="text"
                  placeholder={`${strings.Enter} ${strings.EmployeeName}`}
                  value={filterData.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="input-transition"
                />
                <Input
                  type="text"
                  placeholder={`${strings.Enter} ${strings.Email}`}
                  value={filterData.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="input-transition"
                />
                <div className="flex gap-2 lg:col-start-4">
                  <Button onClick={handleSearch} variant="default" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={tableData}
              manualPagination
              pageCount={Math.ceil(
                (payroll_employee_list?.count || 0) / pagination.pageSize
              )}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
              onRowClick={handleRowClick}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PayrollEmployee;
