import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Users, Download } from 'lucide-react';
import { CSVLink } from '@/components/ui/csv-link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';

import { Loader, ConfirmDeleteModal } from 'components';

import * as EmployeeActions from './actions';
import { CommonActions } from 'services/global';

import './style.scss';

/**
 * Modern Employee Screen
 * Uses functional components, shadcn/ui, and TanStack Table
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
        cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'dateOfJoining',
        header: 'Date of Joining',
      },
      {
        accessorKey: 'department',
        header: 'Department',
      },
      {
        accessorKey: 'designation',
        header: 'Designation',
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
    <div className="employee-screen">
      <div className="space-y-6">
        {dialog}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Employees</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/admin/master/employee/create')}
                  className="transition-all duration-200 hover:scale-[1.02]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Employee
                </Button>
                <Button onClick={getCsvData} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
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
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">Filter:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  type="text"
                  placeholder="Enter Employee Name"
                  value={filterData.name}
                  onChange={e => handleFilterChange('name', e.target.value)}
                  className="input-transition"
                />
                <Input
                  type="text"
                  placeholder="Enter Email"
                  value={filterData.email}
                  onChange={e => handleFilterChange('email', e.target.value)}
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
              pageCount={Math.ceil((employee_list?.count || 0) / pagination.pageSize)}
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

export default Employee;
