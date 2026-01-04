import { useState, useEffect, useMemo } from 'react';
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
import dayjs from '@/utils/date';
import download from 'downloadjs';
import { toast } from 'sonner';
import { Loader, LeavePage, ConfirmDeleteModal, Currency } from 'components';
import { CommonActions } from 'services/global';
import * as CreatePayrollActions from './actions';
import { DataTable } from '@/components/ui/data-table';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data as languageData } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserCircle, HelpCircle, UserX, Ban, FileText, Target } from '@/components/icons';

const strings = new LocalizedStrings(languageData);

// Zod validation schema
const approverSchema = z.object({
  comment: z.string().min(1, 'Reason is required'),
});

const PayrollApproverScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [dialog, setDialog] = useState(null);
  const [payrollId] = useState(location.state?.id);
  const [selectedEmployeesIdsList, setSelectedEmployeesIdsList] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [currencyIsoCode, setCurrencyIsoCode] = useState('AED');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [allPayrollEmployee, setAllPayrollEmployee] = useState([]);
  const [payrollData, setPayrollData] = useState({});
  const [existEmpList, setExistEmpList] = useState([]);

  const { company_details } = useSelector(state => ({
    company_details: state.common.company_details,
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(approverSchema),
    defaultValues: {
      comment: '',
    },
  });

  const commentValue = watch('comment');

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language]);

  const initializeData = () => {
    if (!payrollId) return;
    setLoading(true);
    dispatch(CreatePayrollActions.getPayrollById(payrollId))
      .then(res => {
        if (res.status === 200) {
          let dateArr = res.data.payPeriod.split('-');
          let payPeriodString =
            dateArr[0].replaceAll('/', '-') + ' - ' + dateArr[1].replaceAll('/', '-');

          setPayrollData({
            id: res.data.id || '',
            approvedBy: res.data.approvedBy || '',
            comment: res.data.comment || '',
            deleteFlag: res.data.deleteFlag || '',
            employeeCount: res.data.employeeCount || '',
            generatedBy: res.data.generatedBy || '',
            isActive: res.data.isActive || '',
            payPeriod: payPeriodString,
            payrollApprover: res.data.payrollApprover || '',
            payrollDate: res.data.payrollDate
              ? dayjs(res.data.payrollDate).format('DD-MM-YYYY')
              : '',
            payrollSubject: res.data.payrollSubject || '',
            runDate: res.data.runDate || '',
            status: res.data.status || '',
          });

          setCurrencyIsoCode(res.data.currencyIsoCode || 'AED');
          setExistEmpList(res.data.existEmpList || []);
          setValue('comment', res.data.comment || '');
          getAllPayrollEmployee(payrollId);
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const getAllPayrollEmployee = payrollId => {
    dispatch(CreatePayrollActions.getAllPayrollEmployee(payrollId)).then(res => {
      if (res.status === 200) {
        const payrollEmployee = res.data;
        setAllPayrollEmployee(payrollEmployee);

        // Set all rows selected by default
        const initialSelection = {};
        payrollEmployee.forEach(row => {
          initialSelection[row.id] = true;
        });
        setSelectedRows(initialSelection);

        // Sync employee list
        const allEmployeeIds = payrollEmployee.map(row => row.empId);
        setSelectedEmployeesIdsList(allEmployeeIds);
      }
    });
  };

  // Sync selectedEmployeesIdsList with selectedRows
  useEffect(() => {
    if (allPayrollEmployee.length > 0) {
      const selectedIds = Object.keys(selectedRows).filter(k => selectedRows[k]);
      const selectedEmps = allPayrollEmployee
        .filter(emp => selectedIds.includes(String(emp.id))) // IDs from keys are strings
        .map(emp => emp.empId);
      setSelectedEmployeesIdsList(selectedEmps);
    }
  }, [selectedRows, allPayrollEmployee]);

  const approveAndRunPayroll = () => {
    setDisableLeavePage(true);
    let payPeriod = payrollData.payPeriod;
    const [startDateString, endDateString] = payPeriod.split(' - ');
    const startDate = startDateString.trim();
    const endDate = endDateString.trim();
    const postData = {
      payrollId: payrollId,
      startDate: startDate,
      endDate: endDate,
      payrollEmployeesIdsListToSendMail: selectedEmployeesIdsList,
    };
    dispatch(CreatePayrollActions.approveAndRunPayroll(postData))
      .then(res => {
        if (res.status === 200) {
          toast.success('Payroll Approved Successfully. Payslip sent to employees Successfully');
          navigate('/admin/payroll/payrollrun');
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
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

  const generateSifFile = () => {
    const now = new Date();
    const hours = now.getHours();
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const currentTimeNow = `${formattedHours}:${minutes}:${seconds}`;
    dispatch(CreatePayrollActions.generateSifFile(payrollId, existEmpList, currentTimeNow))
      .then(res => {
        if (res.status === 200) {
          const blob = new Blob([res.data[1]], { type: 'application/sif' });
          download(blob, res.data[0] ? res.data[0] + '.SIF' : 'payroll.SIF');
          toast.success('SIF File Downloaded Successfully');
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'File Already Opened please close file');
      });
  };

  const voidPayrollApi = () => {
    setDisableLeavePage(true);
    setLoading(true);
    setLoadingMsg('Voiding...');
    let formData = {
      postingRefId: payrollId,
      postingRefType: 'PAYROLL',
      comment: commentValue,
    };
    dispatch(CreatePayrollActions.voidPayroll(formData))
      .then(res => {
        if (res.status === 200) {
          toast.success('Payroll Voided Successfully');
          navigate('/admin/payroll/payrollrun');
          setLoading(false);
        }
      })
      .catch(err => {
        toast.error('Payroll Voided UnSuccessfully');
        setLoading(false);
      });
  };

  const onFormSubmit = data => {
    setDisableLeavePage(true);
    const { status } = payrollData;
    const user = location?.state?.user;
    if (status === 'Approved' && user !== 'Generator') {
      voidPayroll();
    } else if (status === 'Submitted' && user !== 'Generator') {
      rejectPayrollConfirmation();
    }
  };

  const rejectPayroll = () => {
    setDisableLeavePage(true);
    dispatch(CreatePayrollActions.rejectPayroll(payrollId, commentValue))
      .then(res => {
        if (res.status === 200) {
          toast.success('Payroll Rejected Successfully');
          navigate('/admin/payroll/payrollrun');
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'Something Went Wrong');
      });
  };

  const rejectPayrollConfirmation = () => {
    setDisableLeavePage(true);
    const message1 = (
      <text>
        <b>Would you like to reject this payroll ?</b>
      </text>
    );
    const message = 'This Payroll will be Rejected. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={rejectPayroll}
        cancelHandler={() => setDialog(null)}
        message={message}
        message1={message1}
      />
    );
  };

  const voidPayroll = () => {
    const message1 = (
      <text>
        <b>Would you like to void this payroll ?</b>
      </text>
    );
    const message = 'This Payroll will be Voided. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={voidPayrollApi}
        cancelHandler={() => setDialog(null)}
        message={message}
        message1={message1}
      />
    );
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
      },
      {
        accessorKey: 'noOfDays',
        header: 'Paid Days',
      },
      {
        accessorKey: 'grossPay',
        header: 'Gross Pay',
        cell: ({ getValue }) => <Currency value={getValue()} currencySymbol={currencyIsoCode} />,
      },
      {
        accessorKey: 'deduction',
        header: 'Deductions',
        cell: ({ getValue }) => <Currency value={getValue()} currencySymbol={currencyIsoCode} />,
      },
      {
        accessorKey: 'netPay',
        header: 'Net Pay',
        cell: ({ getValue }) => <Currency value={getValue()} currencySymbol={currencyIsoCode} />,
      },
    ],
    [currencyIsoCode]
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
                        <span className="ml-2"> Approve Payroll</span>
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
                              <FormGroup className="mb-3">
                                <Label htmlFor="date">Payroll Date</Label>
                                <Input
                                  type="text"
                                  id="payrollDate"
                                  name="payrollDate"
                                  disabled={true}
                                  value={payrollData.payrollDate}
                                  className="form-control"
                                />
                              </FormGroup>
                            </Col>
                            <Col>
                              <FormGroup>
                                <Label htmlFor="payrollSubject"> Payroll Subject</Label>
                                <Input
                                  type="text"
                                  id="payrollSubject"
                                  name="payrollSubject"
                                  disabled={true}
                                  maxLength="100"
                                  value={payrollData.payrollSubject}
                                  placeholder={strings.Enter + ' Payroll Subject'}
                                />
                              </FormGroup>
                            </Col>
                            <Col>
                              <FormGroup>
                                <Label htmlFor="payPeriod">{strings.pay_period}</Label>
                                <Input
                                  type="text"
                                  id="payPeriod"
                                  name="payPeriod"
                                  value={payrollData.payPeriod}
                                  placeholder={strings.Enter + ' Pay period'}
                                  disabled={true}
                                />
                              </FormGroup>
                            </Col>
                          </Row>

                          {/* Payroll Employee List */}
                          <Row>
                            <Col lg={6}>
                              <Label>
                                {' '}
                                Status :{' '}
                                <span style={{ fontSize: 'larger' }}>
                                  {' '}
                                  {renderStatus(payrollData.status)}
                                </span>
                              </Label>
                            </Col>
                            <Col lg={6}>
                              {company_details?.generateSif &&
                                payrollData.status &&
                                (payrollData.status === 'Approved' ||
                                  payrollData.status === 'Paid' ||
                                  payrollData.status === 'Partially Paid') && (
                                  <Button
                                    type="button"
                                    color="primary"
                                    className="btn-square mb-3 pull-right "
                                    onClick={() => {
                                      generateSifFile();
                                    }}
                                  >
                                    <FileText className="h-4 w-4" />
                                    {'  '}Download SIF file
                                  </Button>
                                )}
                            </Col>
                            {payrollData.status === 'Submitted' && (
                              <Col lg={12}>
                                <hr />
                                <div className="mb-2" style={{ marginLeft: '2.2rem' }}>
                                  {strings.SendPayslip}
                                  <HelpCircle id="sendMAilTip" className="h-4 w-4 ml-1 inline" />
                                  <UncontrolledTooltip placement="right" target="sendMAilTip">
                                    {strings.APaySlipWillBeMailedToTheSelectedEmployees}
                                  </UncontrolledTooltip>
                                </div>
                              </Col>
                            )}
                            <Col lg={12} className="payroll-List">
                              <DataTable
                                data={allPayrollEmployee || []}
                                columns={columns}
                                enableRowSelection={payrollData.status === 'Submitted'}
                                rowSelection={selectedRows}
                                onRowSelectionChange={setSelectedRows}
                                getRowId={row => row.id}
                              />
                            </Col>
                          </Row>

                          <Row className="mb-4 ">
                            <Col>
                              <FormGroup>
                                {payrollData.status &&
                                (payrollData.status === 'Partially Paid' ||
                                  payrollData.status === 'Paid' ||
                                  payrollData.status === 'Draft') ? (
                                  ''
                                ) : payrollData.status &&
                                  (payrollData.status === 'Voided' ||
                                    payrollData.status === 'Submitted' ||
                                    payrollData.status === 'Rejected' ||
                                    payrollData.status === 'Approved') &&
                                  (payrollData.status === 'Submitted' ||
                                    payrollData.status === 'Rejected' ||
                                    payrollData.status === 'Approved') &&
                                  location?.state?.user === 'Generator' ? (
                                  ''
                                ) : (
                                  <div>
                                    <Label htmlFor="payrollSubject">
                                      {payrollData.status == 'Approved' ||
                                      payrollData.status == 'Voided'
                                        ? 'Reason for voiding the payroll'
                                        : 'Reason for rejecting the payroll'}
                                    </Label>
                                    <Controller
                                      name="comment"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="text"
                                          maxLength="250"
                                          id="comment"
                                          disabled={
                                            payrollData.status == 'Voided' ||
                                            payrollData.status === 'Rejected'
                                              ? true
                                              : false
                                          }
                                          placeholder={strings.Enter + 'reason'}
                                          className={errors.comment ? 'is-invalid' : ''}
                                        />
                                      )}
                                    />
                                    {errors.comment && (
                                      <div className="invalid-feedback">
                                        {errors.comment.message}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {payrollData.status &&
                                  payrollData.status === 'Submitted' &&
                                  location?.state?.user !== 'Generator' && (
                                    <Button
                                      color="primary"
                                      type="submit"
                                      className="btn-square mt-4 "
                                      onClick={() => {
                                        if (!commentValue) {
                                          dispatch(CommonActions.fillManDatoryDetails());
                                        }
                                      }}
                                    >
                                      <UserX className="h-4 w-4" />
                                      Reject Payroll
                                    </Button>
                                  )}

                                {payrollData.status === 'Approved' &&
                                  location?.state?.user !== 'Generator' && (
                                    <Button
                                      color="primary"
                                      className="btn-square mt-4 "
                                      type="submit"
                                      onClick={() => {
                                        if (!commentValue) {
                                          dispatch(CommonActions.fillManDatoryDetails());
                                        }
                                      }}
                                    >
                                      <UserX className="h-4 w-4" />
                                      Void This Payroll
                                    </Button>
                                  )}
                              </FormGroup>
                            </Col>

                            <Col>
                              <ButtonGroup className="mt-5 pull-right ">
                                {payrollData.status &&
                                  payrollData.status === 'Submitted' &&
                                  location?.state?.user !== 'Generator' && (
                                    <Button
                                      type="button"
                                      color="primary"
                                      className="btn-square mt-5 pull-right "
                                      onClick={() => approveAndRunPayroll()}
                                    >
                                      <Target className="h-4 w-4 mr-1" />
                                      Approve & Run Payroll
                                    </Button>
                                  )}
                                <Button
                                  color="secondary"
                                  className="btn-square  pull-right   mt-5"
                                  onClick={() => {
                                    if (location && location.state && location.state.gotoReports) {
                                      navigate(location.state.gotoReports);
                                    } else {
                                      navigate('/admin/payroll/payrollrun');
                                    }
                                  }}
                                >
                                  <Ban className="h-4 w-4" /> {strings.Cancel}
                                </Button>
                              </ButtonGroup>
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

export default PayrollApproverScreen;
