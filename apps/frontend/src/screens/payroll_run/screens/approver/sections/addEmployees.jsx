import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Button, Row, Col, Modal, ModalBody, ModalFooter, CardBody, ModalHeader } from 'reactstrap';
import dayjs from '@/utils/date';
import { CommonActions } from 'services/global';
import { Loader } from 'components';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions';
import { data as languageData } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import '../style.scss';
import { UserCircle, CheckCheck, Ban } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

function AddEmployeesModal({ openModal, closeModal, employee_list }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const payroll_employee_list = useSelector(state => state.payrollEmployee.payroll_employee_list);

  // Actions
  const payrollEmployeeActions = useMemo(
    () => bindActionCreators(PayrollEmployeeActions, dispatch),
    [dispatch]
  );

  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData, setFilterData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    if (openModal) {
      initializeData();
    }
  }, [openModal, pagination, sorting]);

  const initializeData = () => {
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    payrollEmployeeActions
      .getPayrollEmployeeList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const renderDOB = value => {
    return dayjs(value).format('DD/MM/YYYY');
  };

  const fullnameRenderer = row => {
    return (
      <label
        className="mb-0 label-bank cursor-pointer text-primary hover:underline"
        onClick={() => {
          navigate('/admin/payroll/employee/viewEmployee', { state: { id: row.id } });
        }}
      >
        {row.fullName}
      </label>
    );
  };

  const renderStatus = isActive => {
    let classname = isActive === true ? 'label-success' : 'label-due';
    return (
      <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
        {isActive === true ? 'Active' : 'InActive'}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'employeeCode',
        header: strings.EmployeeCode,
      },
      {
        accessorKey: 'fullName',
        header: strings.FullName,
        cell: ({ row }) => fullnameRenderer(row.original),
      },
      {
        accessorKey: 'mobileNumber',
        header: strings.MobileNumber,
      },
      {
        accessorKey: 'dob',
        header: strings.DateOfBirth,
        cell: ({ getValue }) => renderDOB(getValue()),
      },
      {
        accessorKey: 'isActive',
        header: strings.Status,
        cell: ({ getValue }) => renderStatus(getValue()),
      },
    ],
    [navigate]
  );

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openModal} className="modal-success contact-modal">
        <ModalHeader toggle={() => closeModal(false)}>
          <div className="h4 mb-0 d-flex align-items-center">
            <UserCircle className="h-4 w-4" />
            <span className="ml-2">Select Employees</span>
          </div>
        </ModalHeader>
        <ModalBody style={{ padding: '15px 0px 0px 0px' }}>
          <CardBody>
            {loading ? (
              <Loader />
            ) : (
              <DataTable
                data={payroll_employee_list?.data || []}
                columns={columns}
                manualPagination={true}
                pageCount={
                  payroll_employee_list?.count
                    ? Math.ceil(payroll_employee_list.count / pagination.pageSize)
                    : 0
                }
                onPaginationChange={setPagination}
                pagination={pagination}
                manualSorting={true}
                onSortingChange={setSorting}
                sorting={sorting}
                rowSelection={true}
                onRowSelectionChange={rows => setSelectedRows(rows.map(r => r.id))}
              />
            )}
          </CardBody>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className="btn-square" disabled={selectedRows.length === 0}>
            <CheckCheck className="h-4 w-4" />
            Add employees
          </Button>
          <Button color="secondary" className="btn-square" onClick={() => closeModal(false)}>
            <Ban className="h-4 w-4" /> {strings.Cancel}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default AddEmployeesModal;
