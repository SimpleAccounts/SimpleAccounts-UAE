import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  CardHeader,
  ButtonGroup,
  UncontrolledTooltip,
} from 'reactstrap';
import dayjs from '@/utils/date';
import { Loader } from 'components';
import { DataTable } from '@/components/ui/data-table';
import * as PayRollActions from './actions';
import { CommonActions } from 'services/global';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { toast } from 'sonner';
import { CreateCompanyDetails } from './sections';
import { useNavigate } from 'react-router-dom';

const strings = new LocalizedStrings(languageData);

const PayrollRun = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [disableCreatePayroll, setDisableCreatePayrollState] = useState(false);
  const [sifEnabled, setSifEnabled] = useState(true);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData, setFilterData] = useState({
    contactId: '',
    invoiceId: '',
    receiptReferenceCode: '',
    receiptDate: '',
    contactType: 2,
  });

  // Selectors
  const { user_approver_generater_dropdown_list, payroll_employee_list } = useSelector(state => ({
    user_approver_generater_dropdown_list:
      state.payrollRun.user_approver_generater_dropdown_list.data,
    payroll_employee_list: state.payrollRun.payroll_list,
  }));

  // Initial Setup
  useEffect(() => {
    strings.setLanguage(language);
    dispatch(PayRollActions.getUserAndRole());
    checkCreatePayrollPermission();
  }, [language, dispatch]);

  // Data Fetching
  useEffect(() => {
    fetchData();
  }, [pagination, sorting, filterData]);

  const fetchData = () => {
    setLoading(true);
    const postData = {
      ...filterData,
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };

    dispatch(PayRollActions.getPayrollList(postData))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  const checkCreatePayrollPermission = () => {
    dispatch(PayRollActions.getCompanyDetails()).then(res => {
      if (res.status === 200) {
        const sif = res.data.generateSif;
        const companyNumber = res.data.companyNumber || '';
        const companyBankCode = res.data.companyBankCode || '';
        setDisableCreatePayrollState(companyNumber === '' || companyBankCode === '');
        setSifEnabled(sif);
      }
    });
  };

  const goToDetail = row => {
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
      toast.error('Access Denied! This payroll is created by another user.');
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'payrollDate',
        header: strings.pay_date,
        cell: ({ getValue }) => (getValue() ? dayjs(getValue()).format('DD-MM-YYYY') : '-'),
      },
      {
        accessorKey: 'payrollSubject',
        header: strings.pay_subject,
        cell: ({ row, getValue }) => (
          <label className="mb-0 label-bank cursor-pointer">{getValue()}</label>
        ),
      },
      {
        accessorKey: 'payPeriod',
        header: strings.pay_period,
        cell: ({ getValue }) => {
          const dateArr = getValue() ? getValue().split('-') : [];
          const startDate = dateArr[0]?.replaceAll('/', '-');
          const endDate = dateArr[1]?.replaceAll('/', '-');
          return (
            <div>
              <Row>
                <Col className="pull-right">
                  <b>Start-Date</b>
                </Col>
                <Col>: {startDate}</Col>
              </Row>
              <Row>
                <Col className="pull-right">
                  <b>End-Date</b>
                </Col>
                <Col>: {endDate}</Col>
              </Row>
            </div>
          );
        },
      },
      {
        accessorKey: 'employeeCount',
        header: strings.emp_count,
        cell: ({ getValue }) => <div className="text-center">{getValue() || '-'}</div>,
      },
      {
        accessorKey: 'generatedBy',
        header: strings.generated_by,
        cell: ({ row }) => row.original.generatedByName || '-',
      },
      {
        accessorKey: 'payrollApprover',
        header: strings.approver,
        cell: ({ row }) => row.original.payrollApproverName || '-',
      },
      {
        accessorKey: 'status',
        header: strings.STATUS,
        cell: ({ getValue }) => {
          const status = getValue();
          let classname = 'label-overdue';
          if (status === 'Approved') classname = 'label-success';
          else if (status === 'Paid')
            classname = 'label-sent'; // Assuming Paid is sent logic from original
          else if (status === 'UnPaid') classname = 'label-closed';
          else if (status === 'Draft') classname = 'label-currency';
          else if (status === 'Rejected') classname = 'label-due';
          else if (status === 'Submitted') classname = 'label-sent';
          else if (status === 'Partially Paid') classname = 'label-PartiallyPaid';
          else if (status === 'Voided') classname = 'label-closed';

          return (
            <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'runDate',
        header: strings.run_date,
        cell: ({ getValue }) => (getValue() ? dayjs(getValue()).format('DD-MM-YYYY') : '-'),
      },
      {
        accessorKey: 'totalAmountPayroll',
        header: strings.am,
        cell: ({ row }) => (
          <div className="text-right">
            <div>
              <label className="font-weight-bold mr-2">
                {strings.Payroll + ' ' + strings.Amount}:{' '}
              </label>
              <label>
                {row.original.totalAmountPayroll === 0
                  ? 'AED ' +
                    row.original.totalAmountPayroll.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                    })
                  : 'AED ' +
                    row.original.totalAmountPayroll.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                    })}
              </label>
            </div>
            {row.original.dueAmountPayroll != null && (
              <div style={{ display: row.original.dueAmountPayroll === 0 ? 'none' : '' }}>
                <label className="font-weight-bold mr-2">{strings.DueAmount} : </label>
                <label>
                  {row.original.dueAmountPayroll === 0
                    ? row.original.dueAmountPayroll +
                      ' ' +
                      row.original.dueAmountPayroll.toLocaleString(navigator.language, {
                        minimumFractionDigits: 2,
                      })
                    : 'AED ' +
                      row.original.dueAmountPayroll.toLocaleString(navigator.language, {
                        minimumFractionDigits: 2,
                      })}
                </label>
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'comment',
        header: strings.reason,
        cell: ({ getValue }) =>
          getValue() ? (
            <label className="mb-0 label-bank cursor-pointer" title={getValue()}>
              Read Here..
            </label>
          ) : (
            '-'
          ),
      },
    ],
    [navigate, user_approver_generater_dropdown_list]
  );

  const userForCheckApprover = user_approver_generater_dropdown_list?.[0]?.label;

  return (
    <div className="receipt-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <Row>
              <Col lg={12}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <i className="fas fa-money-check-alt"></i>
                  <span className="ml-2">{strings.payrolls}</span>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <div className="employee-screen">
              {loading ? (
                <Loader />
              ) : (
                <div>
                  <Row className="mb-4 ">
                    {userForCheckApprover !== 'Payroll Approver' &&
                      userForCheckApprover !== 'Accountant' && (
                        <Col>
                          <Button
                            color="primary"
                            title={
                              disableCreatePayroll && sifEnabled
                                ? 'Please Create Company Details'
                                : ''
                            }
                            className="btn-square mt-2 pull-right"
                            style={{ padding: '5px', margin: '1px' }}
                            onClick={() => {
                              if (disableCreatePayroll && sifEnabled) {
                                toast.success('Please Create Company Details From Payroll-config');
                                navigate('/admin/payroll/config', { state: { tabNo: '4' } });
                              } else {
                                navigate('/admin/payroll/payrollrun/createPayrollList');
                              }
                            }}
                          >
                            <i className="fas fa-plus mr-1" />
                            {strings.Addpayroll}
                          </Button>
                        </Col>
                      )}
                  </Row>
                  <DataTable
                    data={payroll_employee_list?.data || []}
                    columns={columns}
                    manualPagination={true}
                    manualSorting={true}
                    pageCount={
                      payroll_employee_list?.totalPages ||
                      Math.ceil((payroll_employee_list?.count || 0) / pagination.pageSize)
                    }
                    onPaginationChange={setPagination}
                    onSortingChange={setSorting}
                    onRowClick={goToDetail}
                  />
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
      <CreateCompanyDetails
        openModal={openModal}
        closeModal={() => {
          setOpenModal(false);
          checkCreatePayrollPermission();
        }}
      />
    </div>
  );
};

export default PayrollRun;
