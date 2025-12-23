import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
  Form,
  FormGroup,
  Input,
  Label,
} from 'components/migration';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import * as CTReportActions from '../../actions';
import { Loader, LeavePage } from 'components';
import { CommonActions } from 'services/global';
import dayjs from '@/utils/date';
import { data } from '../../../../../Language/index';
import LocalizedStrings from 'react-localization';
import { BookUser, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    contact_list: state.customer_invoice.contact_list,
    pay_mode: state.customer_invoice.pay_mode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ctReportActions: bindActionCreators(CTReportActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

const file_size = 1024000;
const supported_format = [
  'image/png',
  'image/jpeg',
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Zod validation schema
const createPaymentRecordSchema = (totalAmount, balanceDue) =>
  z.object({
    receiptNo: z.string().optional(),
    paymentDate: z
      .union([z.string(), z.date()])
      .refine(val => val !== null && val !== '', 'Payment date is required'),
    reportId: z.union([z.string(), z.number()]),
    amountPaid: z
      .string()
      .min(1, 'Amount is required')
      .refine(val => {
        const num = parseFloat(val);
        return num >= 1;
      }, 'Amount cannot be less than 1')
      .refine(val => {
        const num = parseFloat(val);
        return num <= totalAmount;
      }, 'Amount cannot be greater than total tax payable amount')
      .refine(val => {
        const num = parseFloat(val);
        return num <= balanceDue;
      }, 'Amount Cannot Be greater than Balance amount'),
    totalAmount: z.union([z.string(), z.number()]),
    balanceDue: z.union([z.string(), z.number()]),
    notes: z.string().optional(),
    paidThrough: z
      .object({
        value: z.union([z.string(), z.number()]),
        label: z.string(),
      })
      .nullable()
      .refine(val => val !== null, 'Paid through is required'),
    referenceNumber: z.string().optional(),
    attachmentFile: z
      .custom(
        value => value instanceof File || value === undefined || value === null || value === '',
        {
          message: 'Invalid file',
        }
      )
      .refine(value => {
        if (!value) return true;
        return supported_format.includes(value.type);
      }, 'Unsupported File Format')
      .refine(value => {
        if (!value) return true;
        return value.size <= file_size;
      }, 'File Size is too large'),
    paidInvoiceListStr: z.array(z.any()).optional(),
  });

const CorporateTaxPaymentRecord = props => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [depositList, setDepositList] = useState([]);
  const [fileName, setFileName] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  const locationState = props.location?.state || {};
  const headerValue = locationState.taxPeriod || '';
  const reportId = locationState.id || '';
  const reportFilledOn = locationState.taxFiledOn ? new Date(locationState.taxFiledOn) : new Date();
  const totalAmount = locationState.totalAmount || 0.0;
  const balanceDue = locationState.balanceDue || 0;

  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$/;

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createPaymentRecordSchema(totalAmount, balanceDue)),
    defaultValues: {
      receiptNo: '',
      paymentDate: locationState.taxFiledOn ? new Date(locationState.taxFiledOn) : '',
      reportId: reportId,
      amountPaid: '',
      totalAmount: totalAmount,
      notes: '',
      paidThrough: { value: 47, label: 'Petty Cash' },
      referenceNumber: '',
      attachmentFile: '',
      paidInvoiceListStr: [],
      balanceDue: balanceDue,
    },
  });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    props.ctReportActions.getDepositList().then(res => {
      setDepositList(res);
    });
  };

  const handleFileChange = (e, onChange) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
      setFileName(file.name);
      onChange(file);
    }
  };

  const handleFormSubmit = data => {
    console.log(data);
    setDisabled(true);
    const { paymentDate, reportId, amountPaid, paidThrough, totalAmount, referenceNumber } = data;

    const postData = {
      paymentDate: paymentDate ? dayjs(paymentDate).format('DD/MM/YYYY') : '',
      amountPaid: amountPaid !== null ? parseFloat(amountPaid) : '',
      refereNumber: referenceNumber !== null ? referenceNumber : '',
      depositToTransactionCategoryId: paidThrough !== null ? paidThrough.value : '',
      corporateTaxFilingId: reportId,
      totalAmount: totalAmount ? parseFloat(totalAmount) : '',
    };

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Tax Claim Recording...');

    props.ctReportActions
      .recordCTPayment(postData)
      .then(res => {
        if (res.status === 200) {
          props.commonActions.tostifyAlert('success', 'Payment Recorded Successfully!');
          props.history.push('/admin/report/corporate-tax');
          setLoading(false);
        }
      })
      .catch(err => {
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Payment Recorded Unsuccessfully!'
        );
        setLoading(false);
        setDisabled(false);
      });
  };

  const onSubmit = data => {
    if (Object.keys(errors).length !== 0) {
      props.commonActions.fillManDatoryDetails();
      return;
    }
    handleFormSubmit(data);
  };

  strings.setLanguage(language);

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="detail-customer-invoice-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <BookUser className="h-4 w-4" />
                        <span className="ml-2">
                          {strings.RecordPaymentTaxPeriod} ({headerValue})
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={rhfHandleSubmit(onSubmit)}>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="totalAmount">
                                <span className="text-danger">* </span>{' '}
                                {strings.TotalCorporateTaxAmount}
                              </Label>
                              <Controller
                                name="totalAmount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    disabled
                                    id="totalAmount"
                                    className={errors.totalAmount ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.totalAmount && (
                                <div className="invalid-feedback">{errors.totalAmount.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="balanceDue">
                                <span className="text-danger">* </span> Balance Due
                              </Label>
                              <Controller
                                name="balanceDue"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    disabled
                                    type="number"
                                    placeholder="Enter Balance Amount"
                                    id="balanceDue"
                                    className={errors.balanceDue ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.balanceDue && (
                                <div className="invalid-feedback">{errors.balanceDue.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="amountPaid">
                                <span className="text-danger">* </span> Amount Paid
                              </Label>
                              <Controller
                                name="amountPaid"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                  <Input
                                    type="text"
                                    min="0"
                                    placeholder="Enter Amount Paid"
                                    id="amountPaid"
                                    value={value}
                                    onChange={e => {
                                      if (
                                        e.target.value === '' ||
                                        regDecimal.test(e.target.value)
                                      ) {
                                        onChange(e.target.value);
                                      }
                                    }}
                                    className={errors.amountPaid ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.amountPaid && (
                                <div className="invalid-feedback">{errors.amountPaid.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="paymentDate">
                                <span className="text-danger">* </span>
                                {strings.PaymentDate}
                              </Label>
                              <Controller
                                name="paymentDate"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                  <DatePicker
                                    id="paymentDate"
                                    placeholderText={'Select ' + strings.PaymentDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={
                                      value
                                        ? typeof value === 'string'
                                          ? new Date(value)
                                          : value
                                        : reportFilledOn
                                    }
                                    minDate={reportFilledOn}
                                    onChange={date => onChange(date)}
                                    className={`form-control ${errors.paymentDate ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.paymentDate && (
                                <div className="invalid-feedback">{errors.paymentDate.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="paidThrough">
                                <span className="text-danger">* </span> {strings.PaidThrough}
                              </Label>
                              <Controller
                                name="paidThrough"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                  <Select
                                    options={depositList}
                                    value={value}
                                    onChange={option => {
                                      if (option && option.value) {
                                        onChange(option);
                                      } else {
                                        onChange(null);
                                      }
                                    }}
                                    placeholder={strings.Select + strings.PaidThrough}
                                    id="paidThrough"
                                    className={errors.paidThrough ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.paidThrough && (
                                <div className="invalid-feedback">{errors.paidThrough.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={8}>
                            <Row>
                              <Col lg={6}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="referenceNumber">{strings.ReferenceNo}</Label>
                                  <Controller
                                    name="referenceNumber"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        type="text"
                                        id="referenceNumber"
                                        placeholder="e.g. Receipt Number"
                                        maxLength={'20'}
                                      />
                                    )}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        <Row>
                          <Col
                            lg={12}
                            className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                          >
                            <FormGroup className="text-right w-100">
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                              >
                                <CircleDot className="h-4 w-4" />{' '}
                                {disabled ? 'Recording...' : strings.RecordPayment}
                              </Button>
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  props.history.push('/admin/report/corporate-tax');
                                }}
                              >
                                <Ban className="h-4 w-4" /> {strings.Cancel}
                              </Button>
                            </FormGroup>
                          </Col>
                        </Row>
                      </Form>
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

export default connect(mapStateToProps, mapDispatchToProps)(CorporateTaxPaymentRecord);
