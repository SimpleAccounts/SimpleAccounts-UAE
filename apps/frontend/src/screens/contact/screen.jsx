import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Users, Edit } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';

import { Loader, ConfirmDeleteModal } from 'components';

import * as ContactActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Contact List Screen
 * Uses functional components, shadcn/ui, and TanStack Table
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
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting[0]?.desc ? 'desc' : sorting[0]?.id ? 'asc' : '',
      sortingCol: sorting[0]?.id || '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

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
            return <span className="font-medium">{fullName || '-'}</span>;
          }
          return (
            <span className="font-medium">
              {fullName} <span className="text-muted-foreground">({organization})</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'contactTypeString',
        header: strings.CONTACTTYPE,
        cell: ({ row }) => <Badge variant="secondary">{row.original.contactTypeString}</Badge>,
      },
      {
        accessorKey: 'email',
        header: strings.Email,
      },
      {
        accessorKey: 'mobileNumber',
        header: strings.MOBILENUMBER,
        cell: ({ row }) => {
          const mobile = row.original.mobileNumber;
          return mobile ? `+${mobile}` : '';
        },
      },
      {
        accessorKey: 'isActive',
        header: strings.STATUS,
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <Badge variant={isActive ? 'success' : 'destructive'}>
              {isActive ? 'Active' : 'InActive'}
            </Badge>
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
    <div className="contact-screen">
      <div className="space-y-6">
        {dialog}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.Contact}</CardTitle>
              </div>
              <Button
                onClick={() => navigate('/admin/master/contact/create')}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {strings.Addnewcontact}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">{strings.Filter}:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  value={filterData.name}
                  placeholder={`${strings.Enter} ${strings.Name}`}
                  className="input-transition"
                  onChange={e => handleFilterChange('name', e.target.value)}
                />
                <Input
                  value={filterData.email}
                  placeholder={`${strings.Enter} ${strings.Email}`}
                  className="input-transition"
                  onChange={e => handleFilterChange('email', e.target.value)}
                />
                <div className="flex gap-2">
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
              pageCount={Math.ceil((contact_list?.count || 0) / pagination.pageSize)}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
              onRowClick={goToDetail}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Contact;
