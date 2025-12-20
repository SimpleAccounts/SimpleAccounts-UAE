import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as VatreportActions from '../../actions';
import { Loader } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../../../Language/index';
import LocalizedStrings from 'react-localization';

const mapStateToProps = state => {
  return {
    contact_list: state.customer_invoice.contact_list,
    customer_list: state.customer_invoice.customer_list,
    pay_mode: state.customer_invoice.pay_mode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    vatreportActions: bindActionCreators(VatreportActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

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

let strings = new LocalizedStrings(data);

const regEx = /^[0-9\b]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;
const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
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

const RecordVatPayment = props => {
  const { vatreportActions, commonActions, history, location, pay_mode, customer_list } = props;

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disabled, setDisabled] = useState(false);
  const [deposit_list, setDeposit_list] = useState([]);
  const [reportfilledOn, setReportfilledOn] = useState(new Date());
  const [fileName, setFileName] = useState('');

  const uploadFileRef = useRef(null);

  const headerValue = location.state?.taxReturns || '';
  const totalTaxPayable = location.state?.totalTaxPayable || 0.0;
  const balanceDue = location.state?.balanceDue || '';
  const reportId = location.state?.id || '';

  strings.setLanguage(language);

  const createValidationSchema = () => {
    return z.object({
      vatPaymentDate: z.date({ required_error: 'Payment date is required' }),
      amount: z
        .string()
        .min(1, 'Amount is required')
        .refine(val => parseFloat(val) >= 1, { message: 'Amount cannot be less than 1' })
        .refine(val => parseFloat(val) <= balanceDue, {
          message: 'Amount cannot be greater than due amount',
        })
        .refine(val => parseFloat(val) <= totalTaxPayable, {
          message: 'Amount cannot be greater than total tax payable amount',
        }),
      paidThrough: z.object(
        { value: z.number(), label: z.string() },
        { required_error: 'Paid through is required' }
      ),
      referenceCode: z.string().optional(),
      notes: z.string().optional(),
      attachmentFile: z
        .any()
        .optional()
        .refine(file => !file || supported_format.includes(file?.type), '*Unsupported File Format')
        .refine(file => !file || file?.size <= file_size, '*File Size is too large'),
    });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createValidationSchema()),
    defaultValues: {
      vatPaymentDate: new Date(),
      amount: '',
      paidThrough: { value: 47, label: 'Petty Cash' },
      referenceCode: '',
      notes: '',
      attachmentFile: null,
    },
  });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    vatreportActions
      .getVatReportList()
      .then(res => {
        if (res.status === 200) {
          const data = res.data?.data || [];
          const reportInfoById = data.find(obj => obj.id === location.state?.id);
          if (reportInfoById) {
            setReportfilledOn(new Date(reportInfoById.filedOn));
          }
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });

    vatreportActions.getDepositList().then(res => {
      setDeposit_list(res);
    });
  };

  const handleFileChange = e => {
    e.preventDefault();
    let file = e.target.files[0];
    if (file) {
      setValue('attachmentFile', file, { shouldValidate: true });
      setFileName(file.name);
    }
  };

  const onSubmit = data => {
    setDisabled(true);
    const { vatPaymentDate, amount, paidThrough, notes, referenceCode } = data;

    let formData = new FormData();
    formData.append('vatPaymentDate', vatPaymentDate ?? '');
    formData.append('amount', amount !== null ? amount : '');
    formData.append('notes', notes !== null ? notes : '');
    formData.append('referenceCode', referenceCode !== null ? referenceCode : '');
    formData.append('depositeTo', paidThrough !== null ? paidThrough.value : '');

    if (reportId) {
      formData.append('id', reportId);
      formData.append('vatFiledNumber', reportId);
    }
    if (uploadFileRef.current?.files?.[0]) {
      formData.append('attachmentFile', uploadFileRef.current?.files?.[0]);
    }
    formData.append('isVatReclaimed', false);

    setLoading(true);
    setLoadingMsg('Tax Claim Recording...');

    vatreportActions
      .recordVatPayment(formData)
      .then(res => {
        commonActions.tostifyAlert('success', 'Tax Payment Recorded Successfully');
        history.push('/admin/report/vatreports');
        setLoading(false);
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Payment Recorded Unsuccessfully'
        );
        setDisabled(false);
        setLoading(false);
      });
  };

  let tmpcustomer_list = [];
  customer_list?.map(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpcustomer_list.push(obj);
  });

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
                        <i className="fas fa-address-book" />
                        <span className="ml-2">Record VAT Payment For {headerValue}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="totalTaxPayable">
                                <span className="text-danger">* </span> Total VAT Payable
                              </Label>
                              <Input
                                type="number"
                                disabled
                                id="totalTaxPayable"
                                name="totalTaxPayable"
                                value={totalTaxPayable}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="balanceDue">
                                <span className="text-danger">* </span> {strings.DueAmount}
                              </Label>
                              <Input
                                disabled
                                type="number"
                                placeholder="Enter Due Amount"
                                id="balanceDue"
                                name="balanceDue"
                                value={balanceDue}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="amount">
                                <span className="text-danger">* </span> Amount Paid
                              </Label>
                              <Controller
                                name="amount"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                  <Input
                                    type="text"
                                    min="0"
                                    placeholder="Enter Amount Paid"
                                    id="amount"
                                    name="amount"
                                    value={value}
                                    onChange={e => {
                                      if (
                                        e.target.value === '' ||
                                        regDecimal.test(e.target.value)
                                      ) {
                                        onChange(e.target.value);
                                      }
                                    }}
                                    className={errors.amount ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.amount && (
                                <div className="invalid-feedback">{errors.amount.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="vatPaymentDate">
                                <span className="text-danger">* </span>
                                {strings.PaymentDate}
                              </Label>
                              <Controller
                                name="vatPaymentDate"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                  <DatePicker
                                    id="vatPaymentDate"
                                    name="vatPaymentDate"
                                    placeholderText={'Select ' + strings.PaymentDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={value}
                                    minDate={reportfilledOn}
                                    onChange={onChange}
                                    className={`form-control ${
                                      errors.vatPaymentDate ? 'is-invalid' : ''
                                    }`}
                                  />
                                )}
                              />
                              {errors.vatPaymentDate && (
                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                  {errors.vatPaymentDate.message}
                                </div>
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
                                    options={deposit_list}
                                    value={value}
                                    onChange={option => {
                                      onChange(option || null);
                                    }}
                                    placeholder={strings.Select + strings.PaidThrough}
                                    id="paidThrough"
                                    name="paidThrough"
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
                                  <Label htmlFor="referenceCode">{strings.ReferenceNo}</Label>
                                  <Controller
                                    name="referenceCode"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                      <Input
                                        type="text"
                                        id="referenceCode"
                                        name="referenceCode"
                                        placeholder="e.g. Receipt Number"
                                        value={value || ''}
                                        onChange={e => {
                                          if (
                                            e.target.value === '' ||
                                            regExBoth.test(e.target.value)
                                          ) {
                                            onChange(e.target.value);
                                          }
                                        }}
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
                                onClick={() => {
                                  if (errors && Object.keys(errors).length !== 0) {
                                    commonActions.fillManDatoryDetails();
                                  }
                                }}
                              >
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Recording...' : strings.RecordPayment}
                              </Button>
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/report/vatreports');
                                }}
                              >
                                <i className="fa fa-ban"></i> {strings.Cancel}
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
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(RecordVatPayment);
