import React, { useState, useEffect } from 'react';
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
const createRecordTaxClaimSchema = totalTaxReclaimable =>
  z.object({
    receiptNo: z.string().optional(),
    vatPaymentDate: z.union([z.string(), z.date()]),
    reportId: z.union([z.string(), z.number()]),
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine(val => {
        const num = parseFloat(val);
        return num >= 1;
      }, 'Amount cannot be Less Than 1')
      .refine(val => {
        const num = parseFloat(val);
        return num == totalTaxReclaimable;
      }, 'Amount should be equal to total tax reclaimable amount'),
    totalTaxReclaimable: z.union([z.string(), z.number()]),
    payMode: z.string().optional(),
    notes: z.string().optional(),
    depositeTo: z
      .object({
        value: z.union([z.string(), z.number()]),
        label: z.string(),
      })
      .nullable()
      .refine(val => val !== null, 'Deposit to is required'),
    referenceCode: z.string().optional(),
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
  });

const RecordTaxClaim = props => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [depositList, setDepositList] = useState([]);
  const [fileName, setFileName] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');

  const locationState = props.location?.state || {};
  const headerValue = locationState.taxReturns || '';
  const reportId = locationState.id || '';
  const totalTaxReclaimable = locationState.totalTaxReclaimable || 0.0;

  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$/;
  const regExBoth = /[a-zA-Z0-9]+$/;

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(createRecordTaxClaimSchema(totalTaxReclaimable)),
    defaultValues: {
      receiptNo: '',
      vatPaymentDate: new Date(),
      reportId: reportId,
      amount: '',
      totalTaxReclaimable: totalTaxReclaimable,
      payMode: '',
      notes: '',
      depositeTo: '',
      referenceCode: '',
      attachmentFile: '',
    },
  });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    props.vatreportActions.getDepositList().then(res => {
      setDepositList(res);
    });
  };

  const handleFormSubmit = data => {
    setDisabled(true);
    const {
      vatPaymentDate,
      reportId,
      amount,
      depositeTo,
      payMode,
      notes,
      referenceCode,
      attachmentFile,
    } = data;

    let formData = new FormData();
    formData.append(
      'vatPaymentDate',
      typeof vatPaymentDate === 'string'
        ? dayjs(vatPaymentDate, 'DD-MM-YYYY').toDate()
        : vatPaymentDate
    );

    formData.append('amount', amount !== null ? amount : '');
    formData.append('notes', notes !== null ? notes : '');
    formData.append('referenceCode', referenceCode !== null ? referenceCode : '');
    formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');

    if (reportId) {
      formData.append('id', reportId);
      formData.append('vatFiledNumber', reportId);
    }
    formData.append('isVatReclaimed', true);

    if (attachmentFile && attachmentFile instanceof File) {
      formData.append('attachmentFile', attachmentFile);
    }

    setLoading(true);
    setLoadingMsg('Tax Claim Recording...');

    props.vatreportActions
      .recordVatPayment(formData)
      .then(res => {
        props.commonActions.tostifyAlert('success', 'Tax Claim Recorded Successfully');
        props.history.push('/admin/report/vatreports');
        setLoading(false);
      })
      .catch(err => {
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Payment Recorded Unsuccessfully'
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
                        <i className="fas fa-address-book" />
                        <span className="ml-2">Record VAT Claim For {headerValue}</span>
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
                              <Label htmlFor="totalTaxReclaimable">
                                <span className="text-danger">* </span> Total VAT Reclaimable
                              </Label>
                              <Controller
                                name="totalTaxReclaimable"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    disabled
                                    id="totalTaxReclaimable"
                                    className={errors.totalTaxReclaimable ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.totalTaxReclaimable && (
                                <div className="invalid-feedback">
                                  {errors.totalTaxReclaimable.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="amount">
                                <span className="text-danger">* </span> Amount Reclaimed
                              </Label>
                              <Controller
                                name="amount"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                  <Input
                                    type="text"
                                    placeholder="Enter Amount Reclaimed"
                                    id="amount"
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
                                    placeholderText={strings.PaymentDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={value}
                                    onChange={date => onChange(date)}
                                    className={`form-control ${errors.vatPaymentDate ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.vatPaymentDate && (
                                <div className="invalid-feedback">
                                  {errors.vatPaymentDate.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="depositeTo">
                                <span className="text-danger">* </span> {strings.DepositTo}
                              </Label>
                              <Controller
                                name="depositeTo"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                  <Select
                                    styles={customStyles}
                                    options={depositList}
                                    value={value}
                                    onChange={option => {
                                      if (option && option.value) {
                                        onChange(option);
                                      } else {
                                        onChange(null);
                                      }
                                    }}
                                    placeholder={strings.Select + strings.DepositTo}
                                    id="depositeTo"
                                    className={errors.depositeTo ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.depositeTo && (
                                <div className="invalid-feedback">{errors.depositeTo.message}</div>
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
                                        placeholder="e.g. Receipt Number"
                                        value={value}
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
                              >
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Recording...' : strings.RecordPayment}
                              </Button>
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  props.history.push('/admin/report/vatreports');
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

export default connect(mapStateToProps, mapDispatchToProps)(RecordTaxClaim);
