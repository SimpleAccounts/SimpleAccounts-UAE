import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Banknote } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';

import { Loader } from 'components';
import dayjs from '@/utils/date';

import * as PayRollActions from './actions';
import { CommonActions } from 'services/global';

import { CreateCompanyDetails } from './sections';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Get status badge variant
 */
function getStatusBadge(status) {
  switch (status) {
    case 'Approved':
      return { variant: 'success', label: status };
    case 'Paid':
      return { variant: 'success', label: status };
    case 'UnPaid':
      return { variant: 'outline', label: status };
    case 'Draft':
      return { variant: 'secondary', label: status };
    case 'Rejected':
      return { variant: 'destructive', label: status };
    case 'Submitted':
      return { variant: 'default', label: status };
    case 'Partially Paid':
      return { variant: 'warning', label: status };
    case 'Voided':
      return { variant: 'outline', label: status };
    default:
      return { variant: 'default', label: status };
  }
}

/**
 * Modern Payroll Run Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function PayrollRun() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const user_approver_generater_dropdown_list = useSelector(
    (state) => state.payrollRun.user_approver_generater_dropdown_list?.data
  );
  const payroll_employee_list = useSelector((state) => state.payrollRun.payroll_list);

  // Actions
  const payRollActions = useMemo(() => bindActionCreators(PayRollActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [disableCreatePayroll, setDisableCreatePayroll] = useState(false);
  const [sifEnabled, setSifEnabled] = useState(true);
  const [payrollList, setPayrollList] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    if (payroll_employee_list) {
      setPayrollList(payroll_employee_list);
    }
  }, [payroll_employee_list]);

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

    payRollActions
      .getPayrollList(postData)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }, [payRollActions, pagination, sorting]);

  // Check if payroll creation is disabled
  const checkDisableCreatePayroll = useCallback(() => {
    payRollActions.getCompanyDetails().then((res) => {
      if (res.status === 200) {
        const companyNumber = res.data.companyNumber || '';
        const companyBankCode = res.data.companyBankCode || '';
        setSifEnabled(res.data.generateSif);
        setDisableCreatePayroll(companyNumber === '' || companyBankCode === '');
      }
    });
  }, [payRollActions]);

  useEffect(() => {
    payRollActions.getUserAndRole();
    initializeData();
    checkDisableCreatePayroll();
  }, []);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  // Row click handler
  const handleRowClick = (row) => {
    const userValue = user_approver_generater_dropdown_list?.length
      ? user_approver_generater_dropdown_list[0].value
      : '';
    const userLabel = user_approver_generater_dropdown_list?.length
      ? user_approver_generater_dropdown_list[0].label
      : '';

    if (
      userLabel === 'Payroll Generator' &&
      userValue === parseInt(row.generatedBy) &&
      row.status !== 'Draft' &&
      row.status !== 'Rejected'
    ) {
      navigate('/admin/payroll/ViewPayroll', { state: { id: row.id, user: 'Generator' } });
    } else if (
      userLabel === 'Payroll Generator' &&
      userValue === parseInt(row.generatedBy) &&
      (row.status === 'Draft' || row.status === 'Rejected')
    ) {
      navigate('/admin/payroll/payrollrun/updatePayroll', { state: { id: row.id } });
    } else if (
      userValue === row.payrollApprover &&
      userLabel === 'Payroll Approver' &&
      row.status !== 'Draft'
    ) {
      navigate('/admin/payroll/ViewPayroll', { state: { id: row.id } });
    } else if (
      userValue === row.payrollApprover &&
      userLabel === 'Accountant' &&
      row.status !== 'Draft' &&
      row.status !== 'Rejected'
    ) {
      navigate('/admin/payroll/ViewPayroll', { state: { id: row.id } });
    } else if (userLabel === 'Admin' && row.status !== 'Draft' && row.status !== 'Rejected') {
      navigate('/admin/payroll/payrollApproverScreen', { state: { id: row.id } });
    } else if (userLabel === 'Admin' && (row.status === 'Draft' || row.status === 'Rejected')) {
      navigate('/admin/payroll/payrollrun/updatePayroll', { state: { id: row.id } });
    } else {
      commonActions.tostifyAlert('success', 'Access Denied! This payroll is created by another user.');
    }
  };

  // Close modal
  const closeModal = () => {
    setOpenModal(false);
    initializeData();
    checkDisableCreatePayroll();
  };

  // Handle create payroll
  const handleCreatePayroll = () => {
    if (disableCreatePayroll && sifEnabled) {
      commonActions.tostifyAlert('success', 'Please Create Company Details From Payroll-config');
      navigate('/admin/payroll/config', { state: { tabNo: '4' } });
    } else {
      navigate('/admin/payroll/payrollrun/createPayrollList');
    }
  };

  // User check for approver
  const userForCheckApprover = user_approver_generater_dropdown_list?.length
    ? user_approver_generater_dropdown_list[0].label
    : '';

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'payrollDate',
        header: strings.pay_date,
        cell: ({ row }) =>
          row.original.payrollDate
            ? dayjs(row.original.payrollDate).format('DD-MM-YYYY')
            : '-',
      },
      {
        accessorKey: 'payrollSubject',
        header: strings.pay_subject,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.payrollSubject}</span>
        ),
      },
      {
        accessorKey: 'payPeriod',
        header: strings.pay_period,
        cell: ({ row }) => {
          const dateArr = row.original.payPeriod ? row.original.payPeriod.split('-') : [];
          const startDate = dateArr[0]?.replaceAll('/', '-') || '';
          const endDate = dateArr[1]?.replaceAll('/', '-') || '';
          return (
            <div className="text-sm">
              <div><strong>Start:</strong> {startDate}</div>
              <div><strong>End:</strong> {endDate}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'employeeCount',
        header: strings.emp_count,
        cell: ({ row }) => (
          <div className="text-center">{row.original.employeeCount || '-'}</div>
        ),
      },
      {
        accessorKey: 'generatedByName',
        header: strings.generated_by,
        cell: ({ row }) => row.original.generatedByName || '-',
      },
      {
        accessorKey: 'payrollApproverName',
        header: strings.approver,
        cell: ({ row }) => row.original.payrollApproverName || '-',
      },
      {
        accessorKey: 'status',
        header: strings.STATUS,
        cell: ({ row }) => {
          const { variant, label } = getStatusBadge(row.original.status);
          return <Badge variant={variant}>{label}</Badge>;
        },
      },
      {
        accessorKey: 'runDate',
        header: strings.run_date,
        cell: ({ row }) =>
          row.original.runDate
            ? dayjs(row.original.runDate).format('DD-MM-YYYY')
            : '-',
      },
      {
        accessorKey: 'totalAmountPayroll',
        header: strings.am,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right">
              <div>
                <span className="font-medium mr-1">{strings.Payroll} {strings.Amount}:</span>
                <span>
                  AED{' '}
                  {item.totalAmountPayroll?.toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                  }) || '0.00'}
                </span>
              </div>
              {item.dueAmountPayroll != null && item.dueAmountPayroll !== 0 && (
                <div className="text-muted-foreground text-sm">
                  <span className="mr-1">{strings.DueAmount}:</span>
                  <span>
                    AED{' '}
                    {item.dueAmountPayroll?.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                    }) || '0.00'}
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'comment',
        header: strings.reason,
        cell: ({ row }) => (row.original.comment ? 'Read Here..' : '-'),
      },
    ],
    []
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!payrollList?.data) return [];
    return payrollList.data.map((item) => ({
      id: item.id,
      employeeId: item.employeeId,
      payrollDate: item.payrollDate || '',
      payrollSubject: item.payrollSubject || '',
      payPeriod: item.payPeriod || '',
      employeeCount: item.employeeCount || 0,
      generatedBy: item.generatedBy,
      generatedByName: item.generatedByName || '',
      payrollApprover: item.payrollApprover,
      payrollApproverName: item.payrollApproverName || '',
      status: item.status || '',
      runDate: item.runDate || '',
      totalAmountPayroll: item.totalAmountPayroll || 0,
      dueAmountPayroll: item.dueAmountPayroll,
      comment: item.comment || '',
    }));
  }, [payrollList]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="payroll-run-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Banknote className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{strings.payrolls}</CardTitle>
              </div>
              {userForCheckApprover !== 'Payroll Approver' &&
                userForCheckApprover !== 'Accountant' && (
                  <Button
                    onClick={handleCreatePayroll}
                    title={
                      disableCreatePayroll && sifEnabled
                        ? 'Please Create Company Details'
                        : ''
                    }
                    className="transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {strings.Addpayroll}
                  </Button>
                )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Data Table */}
            <DataTable
              columns={columns}
              data={tableData}
              manualPagination
              pageCount={Math.ceil((payrollList?.count || 0) / pagination.pageSize)}
              onPaginationChange={setPagination}
              pagination={pagination}
              manualSorting
              onSortingChange={setSorting}
              sorting={sorting}
              onRowClick={handleRowClick}
            />
          </CardContent>
        </Card>

        <CreateCompanyDetails openModal={openModal} closeModal={closeModal} />
      </div>
    </div>
  );
}

export default PayrollRun;
