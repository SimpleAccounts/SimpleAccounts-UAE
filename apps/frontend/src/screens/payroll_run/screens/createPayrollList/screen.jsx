import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  ButtonGroup,
  Form,
  FormGroup,
  Input,
  Label,
  UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { LeavePage, Loader, EmployeeModal } from 'components';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import * as EmployeeActions from '../../actions';
import * as CreatePayrollActions from './actions';
import * as CreatePayrollEmployeeActions from '../../../payrollemp/screens/create/actions';
import * as PayrollEmployeeActions from '../../../payrollemp/actions';
import { DataTable } from '@/components/ui/data-table';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import dayjs from '@/utils/date';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const strings = new LocalizedStrings(languageData);

const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    },
  }),
};

// Zod validation schema
const createPayrollSchema = z.object({
  payrollSubject: z.string().min(1, 'Payroll subject is required'),
  payrollDate: z.date({ required_error: 'Payroll date is required' }),
  payrollApprover: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .optional(),
  startDate: z.any().refine(val => val !== null && val !== '', {
    message: 'Start date is required',
  }),
  endDate: z.any().refine(val => val !== null && val !== '', {
    message: 'End date is required',
  }),
});

const CreatePayrollList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [selectedRows, setSelectedRows] = useState({});
  // selectedRows1 was storing the actual row objects. We can derive this.
  const [allPayrollEmployee, setAllPayrollEmployee] = useState([]);
  const [apiSelector, setApiSelector] = useState('');
  const [submitButton, setSubmitButton] = useState(true);
  const [paidDays, setPaidDays] = useState(30);
  const [focusedInput, setFocusedInput] = useState(null);
  const [currencyIsoCode, setCurrencyIsoCode] = useState('AED');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [isPayrollSubjectNameExist, setIsPayrollSubjectNameExist] = useState(false);
  const [payrollApproverRequired, setPayrollApproverRequired] = useState(false);
  const [payrollSubjectRequired, setPayrollSubjectRequired] = useState(false);
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);

  const {
    currency_list,
    country_list,
    state_list,
    employees_for_dropdown,
    approver_dropdown_list,
    employee_list,
  } = useSelector(state => ({
    currency_list: state.employee.currency_list,
    country_list: state.contact.country_list,
    state_list: state.contact.state_list,
    employees_for_dropdown: state.payrollRun.employees_for_dropdown,
    approver_dropdown_list: state.payrollRun.approver_dropdown_list,
    employee_list: state.payrollEmployee.employee_list_dropdown,
  }));

  var date = new Date();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(createPayrollSchema),
    defaultValues: {
      payrollSubject: '',
      payrollDate: new Date(),
      payrollApprover: null,
      startDate: dayjs(new Date(date.getFullYear(), date.getMonth(), 1)),
      endDate: dayjs(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const payrollSubject = watch('payrollSubject');
  const payrollApprover = watch('payrollApprover');

  const regExAlphaNumeric = /^[a-zA-Z0-9\s]+$/;

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language]);

  useEffect(() => {
    if (startDate && endDate) {
      calculatePayperiod(startDate, endDate);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (isPayrollSubjectNameExist) {
      setError('payrollSubject', {
        type: 'manual',
        message: 'Payroll Subject Already Exists',
      });
    } else {
      clearErrors('payrollSubject');
    }
  }, [isPayrollSubjectNameExist]);

  useEffect(() => {
    if (payrollApproverRequired && !payrollApprover) {
      setError('payrollApprover', {
        type: 'manual',
        message: 'Payroll approver is required',
      });
    } else {
      clearErrors('payrollApprover');
    }
  }, [payrollApproverRequired, payrollApprover]);

  useEffect(() => {
    if (payrollSubjectRequired && !payrollSubject) {
      setError('payrollSubject', {
        type: 'manual',
        message: 'Payroll subject is required',
      });
    }
  }, [payrollSubjectRequired, payrollSubject]);

  const initializeData = () => {
    dispatch(CreatePayrollActions.getEmployeesForDropdown());
    dispatch(CreatePayrollActions.getApproversForDropdown());
    const initialStartDate = dayjs(new Date(date.getFullYear(), date.getMonth(), 1));
    const initialEndDate = dayjs(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    calculatePayperiod(initialStartDate, initialEndDate);
  };

  const calculatePayperiod = (startDate, endDate) => {
    let month = dayjs(startDate).format('MMMM');
    const diffTime = Math.abs(startDate - endDate);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    diffDays = diffDays > 30 ? 30 : month == 'February' ? 30 : diffDays;
    setPaidDays(diffDays);
    getAllPayrollEmployee(startDate, endDate);
  };

  const validatePayrollSubjectName = value => {
    const data = {
      moduleType: 27,
      name: value,
    };
    dispatch(CommonActions.checkValidation(data)).then(response => {
      if (response.data === 'Payroll Subject already exists') {
        setIsPayrollSubjectNameExist(true);
      } else {
        setIsPayrollSubjectNameExist(false);
      }
    });
  };

  const getAllPayrollEmployee = (startDate, endDate) => {
    var employeePayPeriodlList = [];
    var activeEmployee = [];
    dispatch(EmployeeActions.getEmployeeListWithDetails()).then(response => {
      if (response.status === 200) {
        employeePayPeriodlList = response.data;
        let date = startDate;
        endDate = endDate;
        let month = dayjs(date).format('MMMM');
        dispatch(CreatePayrollActions.getAllPayrollEmployee(dayjs(date).format('DD/MM/YYYY'))).then(
          res => {
            if (res.status === 200) {
              let newData = [...res.data];
              newData = newData.map(data => {
                let tmpPaidDay = paidDays > 30 ? 30 : month == 'February' ? 30 : paidDays;
                data.noOfDays = tmpPaidDay;
                data.originalNoOfDays = tmpPaidDay;
                data.originalGrossPay = data.grossPay;
                data.originalDeduction = data.deduction;
                data.deduction = ((data.originalDeduction / 30) * data.noOfDays).toFixed(2);
                data.perDaySal = data.originalGrossPay / 30;

                data.lopDay = 0;
                data.grossPay = Number(data.perDaySal * data.noOfDays).toFixed(2);
                data.netPay =
                  Number(data.perDaySal * data.noOfDays).toFixed(2) - (data.deduction || 0);

                const empList = employeePayPeriodlList.filter(obj => obj.employeeId === data.id);
                if (empList && empList?.length > 0) {
                  let flag = true;
                  empList.map(obj => {
                    let payStartDate = dayjs(
                      dayjs(obj.payPeriod.split('-')[0].replaceAll('/', '-'), 'DD-MM-YYYY').toDate()
                    );
                    let payEndDate = dayjs(
                      dayjs(obj.payPeriod.split('-')[1].replaceAll('/', '-'), 'DD-MM-YYYY').toDate()
                    );
                    let startDateCheck = dayjs(date);
                    let endDateCheck = dayjs(endDate);
                    if (
                      (startDateCheck.isBefore(payEndDate) &&
                        startDateCheck.isAfter(payStartDate)) ||
                      startDateCheck.isSame(payStartDate) ||
                      startDateCheck.isSame(payEndDate)
                    ) {
                      flag = false;
                    } else if (
                      (endDateCheck.isBefore(payEndDate) && endDateCheck.isAfter(payStartDate)) ||
                      endDateCheck.isSame(payStartDate) ||
                      endDateCheck.isSame(payEndDate)
                    ) {
                      flag = false;
                    } else if (
                      (payStartDate.isBefore(endDateCheck) &&
                        payStartDate.isAfter(startDateCheck)) ||
                      payStartDate.isSame(startDateCheck) ||
                      payStartDate.isSame(endDateCheck)
                    ) {
                      flag = false;
                    } else if (
                      (payEndDate.isBefore(endDateCheck) && payEndDate.isAfter(startDateCheck)) ||
                      payEndDate.isSame(startDateCheck) ||
                      payEndDate.isSame(endDateCheck)
                    ) {
                      flag = false;
                    }
                  });
                  if (flag) {
                    activeEmployee.push(data);
                  }
                } else {
                  activeEmployee.push(data);
                }
                return data;
              });
              setAllPayrollEmployee(activeEmployee);
            }
          }
        );
      }
    });
  };

  const onFormSubmit = data => {
    setDisableLeavePage(true);
    const { payrollSubject, payrollDate, payrollApprover, startDate, endDate } = data;

    // Derive selected employee IDs
    const selectedIds = Object.keys(selectedRows).filter(k => selectedRows[k]);
    let employeeListIds = selectedIds.length
      ? selectedIds.map(id => allPayrollEmployee.find(emp => emp.id === parseInt(id))?.empId)
      : ''; // Mapping local ID to empId? Wait, previous code used empId.
    // Original: tempList.push(row.empId);

    // Let's verify mapping. DataTable keys are row.id (if getRowId returns row.id).
    // I will use getRowId={(row) => row.id} for DataTable.
    // So keys are row.id.
    // Original onRowSelect pushed row.empId to selectedRows.
    // And selectedRows1 pushed row object.

    // So I need to map selected IDs (from row.id) to empIds.
    const selectedEmployeeObjects = allPayrollEmployee.filter(emp =>
      selectedIds.includes(String(emp.id))
    );
    const selectedEmpIds = selectedEmployeeObjects.map(emp => emp.empId);

    let diff = Math.abs(parseInt((startDate - endDate) / (1000 * 60 * 60 * 24), 10)) + 1;

    let string = dayjs(startDate).format('DD/MM/YYYY') + '-' + dayjs(endDate).format('DD/MM/YYYY');

    const formData = new FormData();
    formData.append('payrollSubject', payrollSubject || '');
    formData.append('payPeriod', string);
    formData.append('employeeListIds', selectedEmpIds);

    if (payrollApprover && payrollApprover.value) {
      formData.append('approverId', parseInt(payrollApprover.value));
    }

    const payrollEmployees = selectedEmployeeObjects.map(i => {
      const { joiningDate, ...rest } = i;
      return rest;
    });
    formData.append('generatePayrollString', JSON.stringify(payrollEmployees));
    formData.append('salaryDate', payrollDate);

    let totalAmountPayroll = 0;
    selectedEmployeeObjects.map(row => {
      totalAmountPayroll += parseFloat(row.netPay);
    });
    formData.append('totalAmountPayroll', totalAmountPayroll);

    if (apiSelector === 'createPayroll') {
      setLoading(true);
      setLoadingMsg('Creating Payroll...');
      dispatch(CreatePayrollActions.createPayroll(formData))
        .then(res => {
          if (res.status === 200) {
            toast.success('Payroll created Successfully');
            navigate(`/admin/payroll/payrollrun`);
            setLoading(false);
          }
        })
        .catch(err => {
          toast.error(err?.data?.message || 'Something Went Wrong');
          setLoading(false);
        });
    } else {
      if (apiSelector === 'createAndSubmitPayroll') {
        setLoading(true);
        setLoadingMsg('Submitting Payroll...');
        dispatch(CreatePayrollActions.createAndSubmitPayroll(formData))
          .then(res => {
            if (res.status === 200) {
              toast.success('Payroll created And Submitted Successfully');
              navigate(`/admin/payroll/payrollrun`);
              setLoading(false);
            }
          })
          .catch(err => {
            toast.error(err?.data?.message || 'Something Went Wrong');
            setLoading(false);
          });
      }
    }
  };

  const updateAmounts = (row, value) => {
    if (value > 30) {
      value = 30;
    }
    let tmpPaidDay = paidDays;
    let newData = [...allPayrollEmployee];
    newData = newData.map(data => {
      if (row.id === data.id) {
        data.lopDay = value;
        data.noOfDays = parseFloat(tmpPaidDay) - value;
        data.deduction = ((data.originalDeduction / 30) * data.noOfDays).toFixed(2);
        let deduction = data.noOfDays == 0 ? 0 : data.deduction;

        data.grossPay = Number(data.perDaySal * data.noOfDays).toFixed(2);
        data.netPay = Number(data.perDaySal * data.noOfDays).toFixed(2) - (deduction || 0);
      }
      return data;
    });
    setAllPayrollEmployee(newData);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'empCode',
        header: 'Employee No',
      },
      {
        accessorKey: 'empName',
        header: 'Employee Name',
      },
      {
        accessorKey: 'lopDay',
        header: 'LOP',
        width: '8%',
        cell: ({ row, getValue }) => (
          <Input
            className="spinboxDisable"
            type="number"
            min={0}
            step="0.5"
            max={paidDays - 1}
            id="lopDay"
            name="lopDay"
            value={getValue() || 0}
            onChange={evt => {
              let value = parseFloat(evt.target.value === '' ? '0' : evt.target.value);

              if (value > paidDays || value < 0 || value === paidDays) {
                return;
              }
              updateAmounts(row.original, value);
            }}
          />
        ),
      },
      {
        accessorKey: 'noOfDays',
        header: 'Paid Days',
        width: '12%',
      },
      {
        accessorKey: 'grossPay',
        header: 'Gross Pay',
        cell: ({ getValue }) => (
          <div>
            {currencyIsoCode ? currencyIsoCode : 'AED'}
            {' ' +
              parseFloat(getValue()).toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
              })}
          </div>
        ),
      },
      {
        accessorKey: 'deduction',
        header: 'Deductions',
        cell: ({ getValue }) => (
          <div>
            {currencyIsoCode ? currencyIsoCode : 'AED'}
            {' ' +
              parseFloat(getValue()).toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
              })}
          </div>
        ),
      },
      {
        accessorKey: 'netPay',
        header: 'Net Pay',
        width: '12%',
        cell: ({ getValue }) => (
          <div>
            {currencyIsoCode ? currencyIsoCode : 'AED'}
            {' ' +
              parseFloat(getValue()).toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
              })}
          </div>
        ),
      },
    ],
    [paidDays, currencyIsoCode]
  );

  const handleDatesChange = ({ startDate, endDate }) => {
    setValue('startDate', startDate);
    setValue('endDate', endDate);
  };

  const handleFocusChange = focusedInput => setFocusedInput(focusedInput);

  return loading ? (
    <Loader loadingMsg={loadingMsg} />
  ) : (
    <div>
      <div className="create-employee-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="nav-icon fas fa-money-check-alt" />
                        <span className="ml-2">{strings.create_payroll}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Row>
                      <Col lg={12}>
                        <Loader />
                      </Col>
                    </Row>
                  ) : (
                    <Row>
                      <Col lg={12}>
                        <div className="d-flex justify-content-end">
                          <ButtonGroup size="sm"></ButtonGroup>
                        </div>

                        <div>
                          <Form onSubmit={handleSubmit(onFormSubmit)}>
                            <Row>
                              <Col>
                                <FormGroup>
                                  <Label htmlFor="payrollSubject">
                                    <span className="text-danger">* </span>
                                    {strings.payroll_subject}
                                  </Label>
                                  <Controller
                                    name="payrollSubject"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        id="payrollSubject"
                                        maxLength="100"
                                        placeholder={strings.Enter + strings.pay_subject}
                                        onChange={option => {
                                          if (
                                            option.target.value === '' ||
                                            regExAlphaNumeric.test(option.target.value)
                                          ) {
                                            field.onChange(option.target.value);
                                            validatePayrollSubjectName(option.target.value);
                                          }
                                        }}
                                        className={errors.payrollSubject ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.payrollSubject && (
                                    <div className="invalid-feedback">
                                      {errors.payrollSubject.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="date">
                                    <span className="text-danger">* </span>
                                    {strings.payroll_date}
                                  </Label>
                                  <Controller
                                    name="payrollDate"
                                    control={control}
                                    render={({ field }) => (
                                      <DatePicker
                                        {...field}
                                        id="payrollDate"
                                        placeholderText="Select Payroll Date"
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="dd-MM-yyyy"
                                        dropdownMode="select"
                                        selected={field.value}
                                        onChange={value => {
                                          field.onChange(value);
                                        }}
                                        className={`form-control ${
                                          errors.payrollDate ? 'is-invalid' : ''
                                        }`}
                                      />
                                    )}
                                  />
                                  {errors.payrollDate && (
                                    <div className="invalid-feedback">
                                      {errors.payrollDate.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>

                              <Col>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="startDate">
                                    <span className="text-danger">* </span>
                                    {strings.pay_period}
                                  </Label>
                                  <div className={errors.startDate ? 'startError' : ''}>
                                    <DateRangePicker
                                      displayFormat="DD-MM-YYYY"
                                      endDate={endDate}
                                      endDateId="endDate"
                                      focusedInput={focusedInput}
                                      isOutsideRange={() => null}
                                      onDatesChange={handleDatesChange}
                                      onFocusChange={handleFocusChange}
                                      startDate={startDate}
                                      startDateId="startDate"
                                    />
                                  </div>
                                  {errors.startDate && (
                                    <div className="invalid-feedback">
                                      {errors.startDate.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>

                              <Col>
                                <FormGroup>
                                  <Label htmlFor="payrollApprover">
                                    <span className="text-danger">* </span>
                                    {strings.payroll_approver}
                                    <i
                                      id="payrollApprovertip"
                                      className="fa fa-question-circle ml-1"
                                    ></i>
                                    <UncontrolledTooltip
                                      placement="right"
                                      target="payrollApprovertip"
                                    >
                                      It is mandatory to have an approver for payroll submission.
                                      Otherwise, it is not mandatory.
                                    </UncontrolledTooltip>
                                  </Label>
                                  <Controller
                                    name="payrollApprover"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        id="payrollApprover"
                                        placeholder={strings.select_approver}
                                        options={
                                          approver_dropdown_list.data
                                            ? selectOptionsFactory.renderOptions(
                                                'name',
                                                'userId',
                                                approver_dropdown_list.data,
                                                'Approver'
                                              )
                                            : []
                                        }
                                        onChange={option => {
                                          setPayrollApproverRequired(false);
                                          field.onChange(option);
                                          if (option && option.value) {
                                            setSubmitButton(false);
                                          } else {
                                            setSubmitButton(true);
                                          }
                                        }}
                                        className={errors.payrollApprover ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.payrollApprover && (
                                    <div className="invalid-feedback">
                                      {errors.payrollApprover.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                            <hr />
                            <Row></Row>
                            <Row>
                              <FormGroup className="pull-left mt-3"></FormGroup>

                              <Col></Col>
                              <Col></Col>
                              <Col lg={3} className="pull-right mt-3"></Col>
                            </Row>

                            {/* Employee Table */}
                            <React.Fragment>
                              <Row>
                                <Button
                                  color="primary"
                                  className="btn-square mr-3 mb-3"
                                  onClick={e => {
                                    setOpenEmployeeModal(true);
                                  }}
                                >
                                  <i className="fa fa-plus"></i> {strings.AddEmployee}
                                </Button>
                              </Row>
                              <div>
                                <DataTable
                                  data={allPayrollEmployee || []}
                                  columns={columns}
                                  enableRowSelection={true}
                                  rowSelection={selectedRows}
                                  onRowSelectionChange={setSelectedRows}
                                  getRowId={row => row.id}
                                  manualPagination={false}
                                />
                              </div>
                            </React.Fragment>

                            <Row>
                              <Col>
                                {selectedRows && Object.keys(selectedRows).length === 0 && (
                                  <div className="text-danger">{/* {errors.selectedRows} */}</div>
                                )}
                              </Col>
                            </Row>

                            <Row>
                              <Col></Col>
                              <Col></Col>
                            </Row>

                            <Row className="mt-4 ">
                              <Col>
                                <Button
                                  color="secondary"
                                  className="btn-square pull-right"
                                  onClick={() => {
                                    navigate('/admin/payroll/payrollrun');
                                  }}
                                >
                                  <i className="fa fa-ban"></i> {strings.Cancel}
                                </Button>
                                <Button
                                  color="primary"
                                  className="btn-square pull-right"
                                  onClick={async () => {
                                    setPayrollApproverRequired(true);
                                    setPayrollSubjectRequired(true);
                                    const isValid = await trigger();
                                    if (!isValid || Object.keys(errors).length != 0) {
                                      dispatch(CommonActions.fillManDatoryDetails());
                                    }

                                    const hasSelectedRows =
                                      Object.keys(selectedRows).filter(k => selectedRows[k])
                                        .length > 0;

                                    if (!submitButton && hasSelectedRows) {
                                      setApiSelector('createAndSubmitPayroll');
                                      handleSubmit(onFormSubmit)();
                                    } else if (submitButton) {
                                      toast.error(
                                        `Please select approver for payroll submission !`
                                      );
                                    } else if (!hasSelectedRows) {
                                      toast.error(
                                        `Please select at least one employee for payroll creation !`
                                      );
                                    }
                                  }}
                                  title={
                                    submitButton
                                      ? `Please select approver for payroll submission !`
                                      : ''
                                  }
                                >
                                  <i className="fas fa-check-double  mr-1"></i>{' '}
                                  {strings.create_submit}
                                </Button>
                                <Button
                                  type="button"
                                  color="primary"
                                  className="btn-square pull-right "
                                  onClick={async () => {
                                    setPayrollApproverRequired(false);
                                    setPayrollSubjectRequired(true);
                                    const isValid = await trigger();
                                    const hasSelectedRows =
                                      Object.keys(selectedRows).filter(k => selectedRows[k])
                                        .length > 0;

                                    if (hasSelectedRows) {
                                      setApiSelector('createPayroll');
                                      handleSubmit(onFormSubmit)();
                                    } else {
                                      toast.error(
                                        `Please select at least one employee for payroll creation !`
                                      );
                                    }
                                  }}
                                  title={
                                    Object.keys(selectedRows).filter(k => selectedRows[k]).length >
                                    0
                                      ? ''
                                      : `Please select at least one employee for payroll creation !`
                                  }
                                >
                                  <i className="fa fa-dot-circle-o  mr-1"></i> {strings.create}
                                </Button>
                              </Col>
                            </Row>
                          </Form>
                        </div>
                      </Col>
                    </Row>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
        {openEmployeeModal && (
          <EmployeeModal
            openModal={openEmployeeModal}
            closeModal={e => {
              setOpenEmployeeModal(!openEmployeeModal);
              initializeData();
            }}
          />
        )}
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default CreatePayrollList;
