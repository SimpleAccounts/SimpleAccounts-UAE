import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Users } from 'lucide-react';
import Select from 'react-select';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';

import { Loader } from 'components';
import dayjs from '@/utils/date';

import * as UserActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

// Custom styles for react-select to match shadcn/ui
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
    backgroundColor: 'hsl(var(--background))',
    boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
    '&:hover': {
      borderColor: 'hsl(var(--ring))',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'hsl(var(--primary))'
      : state.isFocused
      ? 'hsl(var(--accent))'
      : 'transparent',
    color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
  }),
  input: (base) => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
};

const statusOptions = [
  { label: 'Select Status', value: '' },
  { label: 'Active', value: '1' },
  { label: 'InActive', value: '0' },
];

/**
 * Modern User Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function User() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const user_list = useSelector((state) => state.user.user_list);
  const role_list = useSelector((state) => state.user.role_list);

  // Actions
  const userActions = useMemo(() => bindActionCreators(UserActions, dispatch), [dispatch]);
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
    dob: '',
    active: '',
    roleId: '',
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

    userActions
      .getUserList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [userActions, commonActions, filterData, pagination, sorting]);

  useEffect(() => {
    userActions.getRoleList();
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
      dob: '',
      active: '',
      roleId: '',
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: strings.UserName,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.fullName}</span>
        ),
      },
      {
        accessorKey: 'dob',
        header: strings.DOB,
        cell: ({ row }) =>
          row.original.dob
            ? dayjs(row.original.dob, 'DD-MM-YYYY').format('DD-MM-YYYY')
            : '',
      },
      {
        accessorKey: 'roleName',
        header: strings.RoleName,
      },
      {
        accessorKey: 'active',
        header: strings.Status,
        cell: ({ row }) => {
          const isActive = row.original.active === true;
          return (
            <Badge variant={isActive ? 'success' : 'destructive'}>
              {isActive ? 'Active' : 'InActive'}
            </Badge>
          );
        },
      },
    ],
    []
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!user_list?.data) return [];
    return user_list.data.map((item) => ({
      id: item.id,
      fullName: item.fullName || '',
      dob: item.dob || '',
      roleName: item.roleName || (item.role?.roleName) || '',
      active: item.active,
    }));
  }, [user_list]);

  // Row click handler
  const handleRowClick = (row) => {
    navigate('/admin/settings/user/detail', { state: { id: row.id } });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="user-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.User}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/settings/user/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.AddNewUsers}
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
                  placeholder={`${strings.Enter}${strings.UserName}`}
                  value={filterData.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="input-transition"
                />
                <Select
                  styles={selectStyles}
                  className="input-transition"
                  placeholder={`${strings.Select}${strings.Status}`}
                  isClearable
                  options={statusOptions}
                  value={
                    filterData.active
                      ? statusOptions.find((opt) => opt.value === filterData.active?.value)
                      : null
                  }
                  onChange={(option) => {
                    handleFilterChange('active', option || '');
                  }}
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
              pageCount={Math.ceil((user_list?.count || 0) / pagination.pageSize)}
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

export default User;
