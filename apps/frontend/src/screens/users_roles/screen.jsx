import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';

import { Loader } from 'components';
import config from '../../constants/config';

import * as RolesActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern User Roles Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function UsersRoles() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const role_list = useSelector((state) => state.user.role_list);

  // Actions
  const rolesActions = useMemo(() => bindActionCreators(RolesActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(false);

  // Sorting state
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  const initializeData = useCallback(() => {
    const sortingData = {
      order: sorting[0]?.desc ? 'desc' : sorting[0]?.id ? 'asc' : '',
      sortingCol: sorting[0]?.id || '',
    };
    rolesActions.getRoleList(sortingData);
  }, [rolesActions, sorting]);

  useEffect(() => {
    initializeData();
  }, [sorting]);

  // Row click handler - restricted roles
  const handleRowClick = (row) => {
    const restrictedRoles = [1, 2, 3, 104, 105];
    if (restrictedRoles.includes(row.roleCode)) {
      commonActions.tostifyAlert('error', `You Cannot Edit ${row.roleName} Role`);
    } else {
      navigate('/admin/settings/user-role/update', {
        state: { id: row.roleCode },
      });
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'roleName',
        header: strings.UserDetail,
        cell: ({ row }) => (
          <div className="flex items-center">
            <span className="font-medium">{row.original.roleName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'roleNameDisplay',
        header: strings.Role,
        cell: ({ row }) => row.original.roleName,
      },
      {
        accessorKey: 'isActive',
        header: strings.Status,
        cell: ({ row }) => {
          const isActive = row.original.isActive === true;
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
    if (!role_list) return [];
    return role_list.map((item) => ({
      roleCode: item.roleCode,
      roleName: item.roleName || '',
      isActive: item.isActive,
    }));
  }, [role_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="users-roles-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.Role}</CardTitle>
              </div>
              {config.ADD_ROLES && (
                <Button
                  onClick={() => navigate('/admin/settings/user-role/create')}
                  className="transition-all duration-200 hover:scale-[1.02]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {strings.AddNewRole}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Data Table */}
            <DataTable
              columns={columns}
              data={tableData}
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

export default UsersRoles;
