import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Download, Trash2, Search, RefreshCw } from 'lucide-react';
import { CSVLink } from 'react-csv';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';

import { Loader, ConfirmDeleteModal } from 'components';

import * as ProjectActions from './actions';
import { CommonActions } from 'services/global';

import './style.scss';

/**
 * Modern Project Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function Project() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const csvLink = useRef(null);

  // Redux state
  const project_list = useSelector((state) => state.project.project_list);

  // Actions
  const projectActions = useMemo(() => bindActionCreators(ProjectActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [view, setView] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  // Filter state
  const [filterData, setFilterData] = useState({
    projectName: '',
    vatRegistrationNumber: '',
    expenseBudget: '',
    revenueBudget: '',
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

    projectActions
      .getProjectList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [projectActions, commonActions, filterData, pagination, sorting]);

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
      projectName: '',
      vatRegistrationNumber: '',
      expenseBudget: '',
      revenueBudget: '',
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setTimeout(() => initializeData(), 0);
  };

  // Bulk delete
  const bulkDelete = () => {
    if (selectedRows.length === 0) {
      commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.');
      return;
    }

    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeBulk}
        cancelHandler={() => setDialog(null)}
        message="This Project will be deleted permanently and cannot be recovered."
        message1={<b>Delete Project?</b>}
      />
    );
  };

  const removeBulk = () => {
    setDialog(null);
    const obj = { ids: selectedRows };

    projectActions
      .removeBulk(obj)
      .then((res) => {
        initializeData();
        commonActions.tostifyAlert('success', 'Projects Deleted Successfully');
        setSelectedRows([]);
      })
      .catch((err) => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // CSV export
  const getCsvData = () => {
    if (csvData.length === 0) {
      const obj = { paginationDisable: true };
      projectActions.getProjectList(obj).then((res) => {
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
  const handleRowClick = (row) => {
    navigate('/admin/master/project/detail', { state: { id: row.projectId } });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'projectName',
        header: 'Project Name',
        cell: ({ row }) => <span className="font-medium">{row.original.projectName}</span>,
      },
      {
        accessorKey: 'vatRegistrationNumber',
        header: 'VAT Registration Number',
      },
      {
        accessorKey: 'contactName',
        header: 'Contact',
      },
      {
        accessorKey: 'currencyName',
        header: 'Currency',
      },
      {
        accessorKey: 'expenseBudget',
        header: 'Expense Budget',
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.expenseBudget?.toLocaleString() || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'revenueBudget',
        header: 'Revenue Budget',
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.revenueBudget?.toLocaleString() || '-'}
          </div>
        ),
      },
    ],
    []
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!project_list?.data) return [];
    return project_list.data.map((item) => ({
      projectId: item.projectId,
      projectName: item.projectName || '',
      vatRegistrationNumber: item.vatRegistrationNumber || '',
      contactName: item.contact?.firstName || '',
      currencyName: item.currency?.currencyName || '',
      expenseBudget: item.expenseBudget || 0,
      revenueBudget: item.revenueBudget || 0,
    }));
  }, [project_list]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="project-screen">
      <div className="space-y-6">
        {dialog}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderKanban className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Projects</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={getCsvData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export To CSV
                </Button>
                {view && (
                  <CSVLink
                    data={csvData}
                    filename="Projects.csv"
                    className="hidden"
                    ref={csvLink}
                    target="_blank"
                  />
                )}
                <Button
                  variant="outline"
                  onClick={bulkDelete}
                  disabled={selectedRows.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Bulk Delete
                </Button>
                <Button onClick={() => navigate('/admin/master/project/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Project
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-3">Filter:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  type="text"
                  placeholder="Project Name"
                  value={filterData.projectName}
                  onChange={(e) => handleFilterChange('projectName', e.target.value)}
                  className="input-transition"
                />
                <Input
                  type="text"
                  placeholder="VAT Registration Number"
                  value={filterData.vatRegistrationNumber}
                  onChange={(e) => handleFilterChange('vatRegistrationNumber', e.target.value)}
                  className="input-transition"
                />
                <Input
                  type="text"
                  placeholder="Expense Budget"
                  value={filterData.expenseBudget}
                  onChange={(e) => handleFilterChange('expenseBudget', e.target.value)}
                  className="input-transition"
                />
                <Input
                  type="text"
                  placeholder="Revenue Budget"
                  value={filterData.revenueBudget}
                  onChange={(e) => handleFilterChange('revenueBudget', e.target.value)}
                  className="input-transition"
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
              pageCount={Math.ceil((project_list?.count || 0) / pagination.pageSize)}
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

export default Project;
