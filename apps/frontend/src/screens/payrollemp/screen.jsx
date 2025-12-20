import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  ButtonGroup,
  Input,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { Loader, ConfirmDeleteModal } from 'components';
import { DataTable } from '@/components/ui/data-table';
import * as PayrollEmployeeActions from './actions';
import * as EmployeeActions from '../user/actions';
import { CommonActions } from 'services/global';
import './style.scss';
import dayjs from '@/utils/date';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const strings = new LocalizedStrings(languageData);

const PayrollEmployee = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState({});
  const [dialog, setDialog] = useState(null);
  const [filterData, setFilterData] = useState({
    name: '',
    email: '',
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [actionButtons, setActionButtons] = useState({});

  const { payroll_employee_list } = useSelector(state => ({
    payroll_employee_list: state.payrollEmployee.payroll_employee_list,
  }));

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language, pagination, sorting, filterData]);

  const initializeData = () => {
    setLoading(true);
    const postData = {
      ...filterData,
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    dispatch(PayrollEmployeeActions.getPayrollEmployeeList(postData))
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
  };

  const toggleActionButton = (index) => {
    setActionButtons(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const deleteEmployee = () => {
    const selectedIds = Object.keys(selectedRows).filter(k => selectedRows[k]);
    if (selectedIds.length > 0) {
      const message1 = (
        <text>
          <b>Delete Employee?</b>
        </text>
      );
      const message = 'This Employee will be deleted permanently and cannot be recovered. ';
      setDialog(
        <ConfirmDeleteModal
          isOpen={true}
          okHandler={() => removeBulk(selectedIds)}
          cancelHandler={() => setDialog(null)}
          message={message}
          message1={message1}
        />
      );
    } else {
      toast.info('Please select the rows of the table and try again.');
    }
  };

  const removeBulk = (ids) => {
    setDialog(null);
    let obj = {
      ids: ids,
    };
    dispatch(EmployeeActions.removeBulkEmployee(obj))
      .then(res => {
        if (res.status === 200) {
          toast.success('Employees Deleted Successfully');
          initializeData();
          setSelectedRows({});
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'employeeCode',
      header: strings.EmployeeCode,
    },
    {
      accessorKey: 'fullName',
      header: strings.FullName,
      cell: ({ row }) => (
        <label
          className="mb-0 label-bank cursor-pointer text-primary"
          onClick={() => navigate('/admin/master/employee/viewEmployee', { state: { id: row.original.id } })}
        >
          {row.original.fullName}
        </label>
      ),
    },
    {
      accessorKey: 'email',
      header: strings.Email,
    },
    {
      accessorKey: 'mobileNumber',
      header: strings.MobileNumber,
      cell: ({ getValue }) => (getValue() ? '+' + getValue() : ''),
    },
    {
      accessorKey: 'dob',
      header: strings.DateOfBirth,
      cell: ({ getValue }) => (getValue() ? dayjs(getValue()).format('DD-MM-YYYY') : ''),
    },
    {
      accessorKey: 'isActive',
      header: strings.Status,
      cell: ({ getValue }) => (
        <span className={`badge ${getValue() ? 'label-success' : 'label-due'} mb-0`} style={{ color: 'white' }}>
          {getValue() ? 'Active' : 'InActive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div>
        <ButtonDropdown
          isOpen={actionButtons[row.original.id]}
          toggle={() => toggleActionButton(row.original.id)}
        >
          <DropdownToggle size="sm" color="primary" className="btn-brand icon">
            {actionButtons[row.original.id] === true ? (
              <i className="fas fa-chevron-up" />
            ) : (
              <i className="fas fa-chevron-down" />
            )}
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem
              onClick={() =>
                navigate('/admin/payroll/employee/detail', { state: { id: row.original.id } })
              }
            >
              <i className="fas fa-edit" /> {strings.Edit}
            </DropdownItem>

            <DropdownItem
              onClick={() =>
                navigate('/admin/payroll/employee/salarySlip', {
                  state: {
                    id: row.original.id,
                    monthNo: 4,
                  }
                })
              }
            >
              <i className="fas fa-eye" /> {strings.SalarySlip}
            </DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      </div>
      )
    }
  ], [navigate, actionButtons]);

  return loading ? (
    <Loader />
  ) : (
    <div>
      <div className="employee-screen">
        <div className="animated fadeIn">
          {dialog}
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="fnav-icon fas fa-user-plus" />
                    <span className="ml-2"> {strings.Employees} </span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <div className="d-flex justify-content-end">
                    <ButtonGroup size="sm">
                      <Row>
                        <div style={{ width: '1650px' }}>
                          <Button
                            color="primary"
                            className="btn-square pull-right mb-2 mr-4"
                            style={{ marginBottom: '10px' }}
                            // onClick={onBtnExport} // TODO: Implement export
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                            {strings.export_csv}
                          </Button>
                          <Button
                            color="primary"
                            className="btn-square pull-right mb-2 mr-4"
                            style={{ marginBottom: '10px' }}
                            onClick={() => navigate(`/admin/master/employee/create`)}
                          >
                            <i className="fas fa-plus mr-1" />
                            {strings.NewEmployee}
                          </Button>
                        </div>
                      </Row>
                    </ButtonGroup>
                  </div>
                  <div>
                    <DataTable
                      data={payroll_employee_list?.data || []}
                      columns={columns}
                      manualPagination={true}
                      manualSorting={true}
                      pageCount={payroll_employee_list?.totalPages || Math.ceil((payroll_employee_list?.count || 0) / pagination.pageSize)}
                      onPaginationChange={setPagination}
                      onSortingChange={setSorting}
                      enableRowSelection={true}
                      rowSelection={selectedRows}
                      onRowSelectionChange={setSelectedRows}
                      getRowId={(row) => row.id}
                    />
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PayrollEmployee;
