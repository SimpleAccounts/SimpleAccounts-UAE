import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, CardBody, ModalHeader } from 'reactstrap';
import dayjs from '@/utils/date';
import { Loader } from 'components';
import { DataTable } from '@/components/ui/data-table';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions';
import * as CreatePayrollActions from '../actions';
import { data as languageData } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { UserCircle, CheckCheck, Ban } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const AddEmployeesModal = ({ openModal, closeModal, id, tableApiCallsOnStatus }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  const { payroll_employee_list } = useSelector(state => ({
    payroll_employee_list: state.payrollEmployee.payroll_employee_list,
  }));

  const language = window['localStorage'].getItem('language');
  strings.setLanguage(language);

  const fetchEmployees = () => {
    setLoading(true);
    const postData = {
      name: '',
      email: '',
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    dispatch(PayrollEmployeeActions.getPayrollEmployeeList2(postData))
      .then(() => setLoading(false))
      .catch(err => {
        setLoading(false);
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
  };

  useEffect(() => {
    if (openModal) {
      fetchEmployees();
    }
  }, [openModal, pagination, sorting]);

  const addEmployees = () => {
    const selectedIds = Object.keys(selectedRows).filter(key => selectedRows[key]);
    if (selectedIds.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    setLoading(true);
    dispatch(CreatePayrollActions.addMultipleEmployees(id, selectedIds))
      .then(res => {
        setLoading(false);
        if (res.status === 200) {
          toast.success('Employees added Successfully');
          if (tableApiCallsOnStatus) tableApiCallsOnStatus();
          closeModal(false);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
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
        cell: ({ row }) => (
          <label
            className="mb-0 label-bank cursor-pointer text-primary"
            onClick={() =>
              navigate('/admin/payroll/employee/viewEmployee', { state: { id: row.original.id } })
            }
          >
            {row.original.fullName}
          </label>
        ),
      },
      {
        accessorKey: 'mobileNumber',
        header: strings.MobileNumber,
      },
      {
        accessorKey: 'dob',
        header: strings.DateOfBirth,
        cell: ({ getValue }) => (getValue() ? dayjs(getValue()).format('DD/MM/YYYY') : ''),
      },
      {
        accessorKey: 'isActive',
        header: strings.Status,
        cell: ({ getValue }) => (
          <span
            className={`badge ${getValue() ? 'label-success' : 'label-due'} mb-0`}
            style={{ color: 'white' }}
          >
            {getValue() ? 'Active' : 'InActive'}
          </span>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openModal} className="modal-success contact-modal" size="lg">
        <ModalHeader toggle={() => closeModal(false)}>
          <div className="h4 mb-0 d-flex align-items-center">
            <UserCircle className="h-4 w-4" />
            <span>Select Employees</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-0">
          <CardBody>
            {loading ? (
              <Loader />
            ) : (
              <DataTable
                columns={columns}
                data={payroll_employee_list?.data || []}
                pageCount={
                  payroll_employee_list?.totalPages ||
                  Math.ceil((payroll_employee_list?.count || 0) / pagination.pageSize)
                }
                manualPagination={true}
                manualSorting={true}
                onPaginationChange={setPagination}
                onSortingChange={setSorting}
                enableRowSelection={true}
                rowSelection={selectedRows}
                onRowSelectionChange={setSelectedRows}
                getRowId={row => row.id}
              />
            )}
          </CardBody>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className="btn-square" onClick={addEmployees} disabled={loading}>
            <CheckCheck className="h-4 w-4" /> Add employees
          </Button>
          <Button color="secondary" className="btn-square" onClick={() => closeModal(false)}>
            <Ban className="h-4 w-4" /> {strings.Cancel}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AddEmployeesModal;
