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
} from 'components/migration';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import * as EmployeeActions from '../../actions';
import * as CreatePayrollActions from './actions';
import { DataTable } from '@/components/ui/data-table';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import dayjs from '@/utils/date';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ban, CheckCheck, CircleDot, HelpCircle, Trash2, UserCircle } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#1e6eff' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#1e6eff' : '#c7c7c7',
    },
  }),
};

// Zod validation schema
const updatePayrollSchema = z.object({
  payrollSubject: z.string().optional(),
  payrollDate: z.date({ required_error: 'Payroll date is required' }),
  payrollApprover: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .optional(),
  startDate: z.any().optional(),
  endDate: z.any().optional(),
});

const UpdatePayroll = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [selectedRows, setSelectedRows] = useState({});
  const [allPayrollEmployee, setAllPayrollEmployee] = useState([]);
  const [apiSelector, setApiSelector] = useState('');
  const [submitButton, setSubmitButton] = useState(true);
  const [paidDays, setPaidDays] = useState(30);
  const [currencyIsoCode, setCurrencyIsoCode] = useState('AED');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [isPayrollSubjectNameExist, setIsPayrollSubjectNameExist] = useState(false);
  const [payrollApproverRequired, setPayrollApproverRequired] = useState(false);
  const [subjectRequired, setSubjectRequired] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [count, setCount] = useState(0);
  const [checkForLopSetting, setCheckForLopSetting] = useState(false);
  const [payrollId, setPayrollId] = useState(null);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [userId, setUserId] = useState('');
  const [payrollApproverValue, setPayrollApproverValue] = useState('');
  const [comment, setComment] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);

  const { employees_for_dropdown, approver_dropdown_list } = useSelector(state => ({
    employees_for_dropdown: state.payrollRun.employees_for_dropdown,
    approver_dropdown_list: state.payrollRun.approver_dropdown_list,
  }));

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
    resolver: zodResolver(updatePayrollSchema),
    defaultValues: {
      payrollSubject: '',
      payrollDate: new Date(),
      payrollApprover: null,
      startDate: '',
      endDate: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const payrollSubject = watch('payrollSubject');
  const payrollApprover = watch('payrollApprover');

  useEffect(() => {
    strings.setLanguage(language);
    dispatch(CreatePayrollActions.getApproversForDropdown());
    let payroll_id = location.state?.id;
    if (payroll_id) {
      setPayrollId(payroll_id);
      proceed(payroll_id);
    } else {
      // navigate('/admin/payroll/payrollrun');
    }
  }, [language]);

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
    if (payrollApproverRequired && !payrollApproverValue) {
      setError('payrollApprover', {
        type: 'manual',
        message: 'Payroll Approver is required',
      });
    } else {
      clearErrors('payrollApprover');
    }
  }, [payrollApproverRequired, payrollApproverValue]);

  useEffect(() => {
    if (subjectRequired && !payrollSubject) {
      setError('payrollSubject', {
        type: 'manual',
        message: 'Payroll subject is required',
      });
    }
  }, [subjectRequired, payrollSubject]);

  useEffect(() => {
    if (!startDate && !endDate) {
      setError('startDate', {
        type: 'manual',
        message: 'Start and end date is required',
      });
    } else if (!startDate) {
      setError('startDate', {
        type: 'manual',
        message: 'Start date is required',
      });
    } else if (!endDate) {
      setError('startDate', {
        type: 'manual',
        message: 'End date is required',
      });
    } else {
      clearErrors('startDate');
    }
  }, [startDate, endDate]);

  const proceed = payroll_id => {
    dispatch(CreatePayrollActions.getPayrollById(payroll_id)).then(res => {
      if (res.status === 200) {
        let payPeriodString = res.data.payPeriod;
        let dateArray = payPeriodString.split('-');

        setValue('payrollSubject', res.data.payrollSubject || '');
        setValue('payrollDate', res.data.payrollDate ? new Date(res.data.payrollDate) : '');
        setValue('startDate', dayjs(dateArray[0], 'DD/MM/YYYY'));
        setValue('endDate', dayjs(dateArray[1], 'DD/MM/YYYY'));

        setStatus(res.data.status || '');
        setComment(res.data.comment || '');
        setPayrollApproverValue(res.data.payrollApprover || '');
        setSubmitButton(res.data.payrollApprover === null ? true : false);
        setCurrencyIsoCode(res.data.currencyIsoCode || 'AED');
        setSelected(res.data.existEmpList || []);

        // Initialize selection
        const initialSelection = {};
        (res.data.existEmpList || []).forEach(empId => {
          // We need to find the row ID corresponding to this empId.
          // But we don't have rows yet. We'll do this in getAllPayrollEmployee.
        });

        getAllPayrollEmployee(
          dayjs(dateArray[0], 'DD/MM/YYYY'),
          res.data.status,
          res.data.existEmpList
        );
        calculatePayperiod(dayjs(dateArray[0], 'DD/MM/YYYY'), dayjs(dateArray[1], 'DD/MM/YYYY'));
      }
    });
  };

  const calculatePayperiod = (startDate, endDate) => {
    let month = dayjs(startDate).format('MMMM');
    const diffTime = Math.abs(startDate - endDate);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    diffDays = diffDays > 30 ? 30 : month == 'February' ? 30 : diffDays;
    setPaidDays(diffDays);
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

  const getAllPayrollEmployee = (startDate, currentStatus, existingEmployees) => {
    const pid = payrollId || location.state?.id;
    if (pid) {
      var activeEmployee = [];
      var employeePayPeriodlList = [];
      dispatch(EmployeeActions.getEmployeeListWithDetails()).then(response => {
        if (response.status === 200) {
          employeePayPeriodlList = response.data;
          let date = startDate ? startDate : watch('startDate');
          dispatch(
            CreatePayrollActions.getAllPayrollEmployee2(pid, dayjs(date).format('DD/MM/YYYY'))
          ).then(res => {
            if (res.status === 200) {
              let dataToProcess = res.data;
              if (res.data.length === 0) {
                dispatch(CreatePayrollActions.getAllPayrollEmployee(pid, date)).then(res2 => {
                  if (res2.status === 200) {
                    processData(
                      res2.data,
                      employeePayPeriodlList,
                      date,
                      currentStatus,
                      existingEmployees
                    );
                  }
                });
              } else {
                processData(
                  res.data,
                  employeePayPeriodlList,
                  date,
                  currentStatus,
                  existingEmployees
                );
              }
            }
          });
        }
      });
    }
  };

  const processData = (rawData, employeePayPeriodlList, date, currentStatus, existingEmployees) => {
    let activeEmployee = [];
    let newData = [...rawData];
    newData = newData.map(data => {
      let tmpPaidDay =
        paidDays > 30 ? 30 : dayjs(date).format('MMMM') == 'February' ? 30 : paidDays;
      if (checkForLopSetting === true) data.noOfDays = tmpPaidDay;

      data.originalDeduction = data.deduction;
      data.deduction = ((data.originalDeduction / 30) * data.noOfDays).toFixed(2);
      data.originalNoOfDays = tmpPaidDay;
      data.originalGrossPay = data.grossPay;
      data.perDaySal = data.originalGrossPay / 30;

      if (checkForLopSetting === true) data.lopDay = 0;
      data.grossPay = Number(data.perDaySal * data.noOfDays).toFixed(2);
      data.netPay = Number(data.perDaySal * data.noOfDays).toFixed(2) - (data.deduction || 0);

      const empList = employeePayPeriodlList.filter(obj => obj.employeeId === data.id);
      if (empList && empList?.length > 0) {
        let flag = true;
        empList.map(obj => {
          if (obj.payPeriod.includes(dayjs(date).format('DD/MM/YYYY'))) {
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

    let finalData = activeEmployee;

    if (currentStatus && currentStatus === 'Submitted') {
      dispatch(CreatePayrollActions.getAllPayrollEmployeeForApprover(payrollId)).then(res => {
        if (res.status === 200) {
          finalData = res.data;
          setAllPayrollEmployee(finalData);
          syncSelection(finalData, existingEmployees);
        }
      });
    } else {
      setAllPayrollEmployee(finalData);
      syncSelection(finalData, existingEmployees);
    }
  };

  const syncSelection = (data, existingEmployees) => {
    // console.log('Syncing Selection', existingEmployees);
    const newSelection = {};
    const emps = existingEmployees || selected;
    if (emps && emps.length > 0) {
      data.forEach(row => {
        if (emps.includes(row.empId)) {
          newSelection[row.id] = true;
        }
      });
    }
    setSelectedRows(newSelection);
    setCount(1);
  };

  const onFormSubmit = data => {
    setDisableLeavePage(true);
    const { payrollSubject, payrollDate, payrollApprover, startDate, endDate } = data;

    // Derive selected employees
    const selectedIds = Object.keys(selectedRows).filter(k => selectedRows[k]);
    const selectedEmployeeObjects = allPayrollEmployee.filter(emp =>
      selectedIds.includes(String(emp.id))
    );
    const selectedEmpIds = selectedEmployeeObjects.map(emp => emp.empId);

    let employeeListIds = selectedEmpIds.length ? selectedEmpIds : '';
    let diff = Math.abs(parseInt((startDate - endDate) / (1000 * 60 * 60 * 24), 10)) + 1;
    let string = dayjs(startDate).format('DD/MM/YYYY') + '-' + dayjs(endDate).format('DD/MM/YYYY');

    const formData = new FormData();
    formData.append('payrollId', payrollId || '');
    formData.append('payPeriod', string);
    formData.append('employeeListIds', employeeListIds);
    formData.append('payrollSubject', payrollSubject || '');

    if (payrollApproverValue !== '') {
      formData.append('approverId', payrollApproverValue || null);
    } else if (payrollApprover && payrollApprover.value) {
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
      setLoadingMsg('Updating Payroll...');
      dispatch(CreatePayrollActions.updatePayroll(formData))
        .then(res => {
          if (res.status === 200) {
            toast.success('Payroll updated Successfully');
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
        dispatch(CreatePayrollActions.updateAndSubmitPayroll(formData))
          .then(res => {
            if (res.status === 200) {
              toast.success('Payroll updated And Submitted Successfully');
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

  const renderStatus = status => {
    let classname = '';
    if (status === 'Approved') classname = 'label-success';
    if (status === 'Paid') classname = 'label-sent';
    else if (status === 'UnPaid') classname = 'label-closed';
    else if (status === 'Draft') classname = 'label-currency';
    else if (status === 'Rejected') classname = 'label-due';
    if (status === 'Submitted') classname = 'label-sent';
    else if (status === 'Partially Paid') classname = 'label-PartiallyPaid';
    else if (status === 'Voided') classname = 'label-closed';

    return (
      <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
        {status}
      </span>
    );
  };

  const disable = () => {
    if (status === '') {
      return true;
    } else if (
      status === 'Submitted' ||
      status === 'Approved' ||
      status === 'Partially Paid' ||
      status === 'Paid' ||
      status === 'Voided'
    ) {
      return true;
    } else {
      return false;
    }
  };

  const disableForAddButton = () => {
    if (
      status === 'Submitted' ||
      status === 'Approved' ||
      status === 'Partially Paid' ||
      status === 'Paid' ||
      status === 'Voided'
    ) {
      return true;
    } else {
      return false;
    }
  };

  const deletePayroll = () => {
    const message1 = (
      <text>
        <b>Delete Payroll?</b>
      </text>
    );
    const message = 'This Payroll will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removePayroll}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removePayroll = () => {
    setDisableLeavePage(true);
    dispatch(CreatePayrollActions.deletePayroll(payrollId ? payrollId : 0))
      .then(res => {
        if (res.status === 200) {
          toast.success('Payroll Deleted Successfully');
          navigate(`/admin/payroll/payrollrun`);
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const handleDateRangeChange = dates => {
    const [start, end] = dates;
    const startDayjs = start ? dayjs(start) : null;
    const endDayjs = end ? dayjs(end) : null;
    setValue('startDate', startDayjs);
    setValue('endDate', endDayjs);
    setCheckForLopSetting(true);
    if (startDayjs && endDayjs) {
      calculatePayperiod(startDayjs, endDayjs);
    }
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
            type="number"
            min={0}
            step="0.5"
            max={paidDays - 1}
            id="lopDay"
            name="lopDay"
            value={getValue() || 0}
            disabled={disableForAddButton()}
            onChange={evt => {
              let value = parseFloat(evt.target.value === '' ? '0' : evt.target.value);

              if (value >= paidDays || value < 0 || value === paidDays) {
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
    [paidDays, currencyIsoCode, status]
  );

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
                        <UserCircle className="h-4 w-4" />
                        <span className="ml-2">Update Payroll</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
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
                                      disabled={disableForAddButton() ? true : false}
                                      placeholder={strings.Enter + ' Payroll Subject'}
                                      onChange={value => {
                                        field.onChange(value.target.value);
                                        validatePayrollSubjectName(value.target.value);
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
                                      disabled={disableForAddButton() ? true : false}
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
                              <Label htmlFor="date">
                                <span className="text-danger">* </span>
                                {strings.pay_period}
                              </Label>
                              <div style={{ display: 'flex' }}>
                                <FormGroup>
                                  <DatePicker
                                    selectsRange
                                    startDate={startDate ? startDate.toDate() : null}
                                    endDate={endDate ? endDate.toDate() : null}
                                    onChange={handleDateRangeChange}
                                    dateFormat="dd-MM-yyyy"
                                    className="form-control"
                                    placeholderText="Select date range"
                                    disabled={disableForAddButton()}
                                  />

                                  {errors.startDate && (
                                    <div className="invalid-feedback">
                                      {errors.startDate.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </div>
                            </Col>

                            <Col>
                              <FormGroup>
                                <Label htmlFor="payrollApprover">
                                  <span className="text-danger">* </span>
                                  {strings.payroll_approver}
                                </Label>
                                <HelpCircle id="payrollApprovertip" className="h-4 w-4 inline" />
                                <UncontrolledTooltip placement="right" target="payrollApprovertip">
                                  It is mandatory to have an approver for payroll submission.
                                  Otherwise, it is not mandatory.
                                </UncontrolledTooltip>
                                <Controller
                                  name="payrollApprover"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      isDisabled={disable() ? true : false}
                                      id="payrollApprover"
                                      value={
                                        approver_dropdown_list.data &&
                                        selectOptionsFactory
                                          .renderOptions(
                                            'name',
                                            'userId',
                                            approver_dropdown_list.data,
                                            'Approver'
                                          )
                                          .find(option => option.value === payrollApproverValue)
                                      }
                                      placeholder={strings.select_approver}
                                      options={
                                        approver_dropdown_list.data
                                          ? selectOptionsFactory
                                              .renderOptions(
                                                'name',
                                                'userId',
                                                approver_dropdown_list.data,
                                                'Approver'
                                              )
                                              .slice(1)
                                          : []
                                      }
                                      onChange={option => {
                                        if (option && option.value) {
                                          setPayrollApproverRequired(false);
                                          setUserId(option.value);
                                          setPayrollApproverValue(option.value);
                                          setSubmitButton(false);
                                        } else {
                                          setPayrollApproverRequired(false);
                                          setUserId('');
                                          setPayrollApproverValue('');
                                          setSubmitButton(true);
                                        }

                                        field.onChange(option);
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
                          <Row>
                            <Col>
                              <Label>
                                {' '}
                                Status:{' '}
                                <span style={{ fontSize: 'larger' }}> {renderStatus(status)}</span>
                              </Label>
                            </Col>
                          </Row>
                          <hr />

                          {/* Data Table */}
                          <React.Fragment>
                            <Row></Row>
                            <div>
                              <DataTable
                                data={allPayrollEmployee || []}
                                columns={columns}
                                manualPagination={false}
                                enableRowSelection={true}
                                rowSelection={selectedRows}
                                onRowSelectionChange={setSelectedRows}
                                getRowId={row => row.id}
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
                            {status && (status === 'Rejected' || status === 'Voided') ? (
                              <div className="ml-3" style={{ width: '50%' }}>
                                <Label htmlFor="payrollSubject">
                                  {status == 'Approved' || status == 'Voided'
                                    ? 'Reason for voiding the payroll'
                                    : 'Reason for  rejecting the payroll'}
                                </Label>
                                <Input
                                  id="comment"
                                  name="comment"
                                  value={comment}
                                  disabled={true}
                                  placeholder={strings.Enter + ' reason '}
                                  onChange={event => {
                                    setComment(event.target.value);
                                  }}
                                />
                              </div>
                            ) : (
                              ''
                            )}
                          </Row>
                          <Row className="mt-4 ">
                            <Col>
                              {status &&
                              (status === 'Submitted' ||
                                status === 'Approved' ||
                                status == 'Partially Paid' ||
                                status === 'Paid' ||
                                status === 'Voided') ? (
                                ''
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    color="danger"
                                    className="btn-square"
                                    onClick={deletePayroll}
                                  >
                                    <Trash2 className="h-4 w-4" /> {strings.Delete}
                                  </Button>
                                </>
                              )}

                              <Button
                                color="secondary"
                                className="btn-square pull-right"
                                onClick={() => {
                                  navigate('/admin/payroll/payrollrun');
                                }}
                              >
                                <Ban className="h-4 w-4" /> {strings.Cancel}
                              </Button>
                              {status &&
                              (status === 'Submitted' ||
                                status === 'Approved' ||
                                status === 'Partially Paid' ||
                                status === 'Paid' ||
                                status === 'Voided') ? (
                                ''
                              ) : (
                                <>
                                  <Button
                                    color="primary"
                                    className="btn-square pull-right"
                                    onClick={async () => {
                                      setPayrollApproverRequired(true);
                                      setSubjectRequired(true);
                                      const isValid = await trigger();
                                      const hasSelectedRows =
                                        Object.keys(selectedRows).filter(k => selectedRows[k])
                                          .length > 0;

                                      if (hasSelectedRows) {
                                        setApiSelector('createAndSubmitPayroll');
                                        handleSubmit(onFormSubmit)();
                                      } else {
                                        toast.error(
                                          `Please select at least one employee for payroll update !`
                                        );
                                      }
                                    }}
                                    title={
                                      submitButton
                                        ? `Please select approver for payroll submission!`
                                        : ''
                                    }
                                  >
                                    <CheckCheck className="h-4 w-4" />
                                    Update and Submit
                                  </Button>
                                  <Button
                                    type="button"
                                    color="primary"
                                    className="btn-square pull-right "
                                    onClick={async () => {
                                      setPayrollApproverRequired(false);
                                      setSubjectRequired(true);
                                      const hasSelectedRows =
                                        Object.keys(selectedRows).filter(k => selectedRows[k])
                                          .length > 0;

                                      if (hasSelectedRows) {
                                        setApiSelector('createPayroll');
                                        handleSubmit(onFormSubmit)();
                                      } else {
                                        toast.error(
                                          `Please select at least one employee for payroll update !`
                                        );
                                      }
                                    }}
                                    title={
                                      Object.keys(selectedRows).filter(k => selectedRows[k])
                                        .length > 0
                                        ? ''
                                        : `Please select at least one employee for payroll update !`
                                    }
                                  >
                                    <CircleDot className="h-4 w-4" /> Update
                                  </Button>
                                </>
                              )}
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default UpdatePayroll;
