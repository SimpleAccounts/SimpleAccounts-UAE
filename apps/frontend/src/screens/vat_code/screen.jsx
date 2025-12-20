import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Download, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

import { Loader, ConfirmDeleteModal } from 'components';

import * as VatActions from './actions';
import { CommonActions } from 'services/global';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern VAT Code Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function VatCode() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const vat_list = useSelector(state => state.vat.vat_list);

  // Actions
  const vatActions = useMemo(() => bindActionCreators(VatActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Get company details
  useEffect(() => {
    vatActions
      .getCompanyDetails()
      .then(res => {
        if (res.status === 200) {
          setCompanyDetails(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [vatActions, commonActions]);

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
    const postData = { ...paginationData, ...sortingData };

    vatActions
      .getVatList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  }, [vatActions, commonActions, pagination, sorting]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Bulk delete
  const bulkDelete = () => {
    if (selectedRows.length === 0) {
      commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.');
      return;
    }

    vatActions.getVatCount(selectedRows).then(res => {
      if (res.data > 0) {
        commonActions.tostifyAlert(
          'error',
          'You need to delete invoices to delete the VAT category'
        );
      } else {
        setDialog(
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={removeBulk}
            cancelHandler={() => setDialog(null)}
            message="This VAT Category will be deleted permanently and cannot be recovered."
            message1={<b>Delete VAT Category?</b>}
          />
        );
      }
    });
  };

  const removeBulk = () => {
    setDialog(null);
    const obj = { ids: selectedRows };

    vatActions
      .deleteVat(obj)
      .then(res => {
        initializeData();
        commonActions.tostifyAlert('success', res.data.message);
        setSelectedRows([]);
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Delete failed');
      });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: strings.VATNAME || 'VAT Name',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'vat',
        header: strings.VATPERCENTAGE || 'VAT Percentage',
        cell: ({ row }) => `${row.original.vat} %`,
      },
    ],
    []
  );

  // Transform data for table (filter out specific IDs)
  const tableData = useMemo(() => {
    if (!vat_list?.data) return [];
    // Filter out IDs 3, 4, and 10
    return vat_list.data
      .filter(item => ![3, 4, 10].includes(item.id))
      .map(item => ({
        id: item.id,
        name: item.name || '',
        vat: item.vat || 0,
      }));
  }, [vat_list]);

  // Row click handler
  const handleRowClick = row => {
    navigate('/admin/master/vat-category/detail', { state: { id: row.id } });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="vat-code-screen">
      <div className="space-y-6">
        {dialog}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">VAT Category</CardTitle>
              </div>
              <div className="flex gap-2">
                {companyDetails && companyDetails.isRegisteredVat !== true && (
                  <Button onClick={() => navigate('/admin/master/vat-category/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    {strings.AddNewVat || 'Add New VAT'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={tableData} onRowClick={handleRowClick} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default VatCode;
