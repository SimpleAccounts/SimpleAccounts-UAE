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
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import * as DebitNotesRefundActions from './actions';
import * as DebiteNoteActions from '../../actions';
import { Loader, LeavePage } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Textarea } from '@/components/ui/textarea';

const mapStateToProps = state => {
  return {
    customer_list: state.common.customer_list,
    deposit_list: state.customer_invoice.deposit_list,
    pay_mode: state.common.pay_mode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    debiteNoteActions: bindActionCreators(DebiteNoteActions, dispatch),
    debitNotesRefundActions: bindActionCreators(DebitNotesRefundActions, dispatch),
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

// File validation constants
const FILE_SIZE = 1024000;
const SUPPORTED_FORMATS = [
  'image/png',
  'image/jpeg',
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Zod validation schema
const debitNoteRefundSchema = z.object({
  receiptNo: z.string().optional(),
  contactId: z.union([z.string(), z.number()]),
  amount: z.union([z.string(), z.number()]).refine(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return !isNaN(num) && num > 0;
  }, 'Amount cannot be zero'),
  payMode: z.union([
    z.string().min(1, 'Payment mode is required'),
    z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .refine(val => val.value !== '', { message: 'Payment mode is required' }),
  ]),
  paymentDate: z.union([z.date(), z.string()]).refine(val => val !== null && val !== '', {
    message: 'Payment Date is required',
  }),
  notes: z.string().optional(),
  depositeTo: z.union([
    z.string().min(1, 'Deposit to is required'),
    z
      .object({
        value: z.union([z.string(), z.number()]),
        label: z.string(),
      })
      .refine(val => val.value !== '' && val.value !== null && val.value !== undefined, {
        message: 'Deposit to is required',
      }),
  ]),
  referenceCode: z.string().optional(),
  attachmentFile: z
    .any()
    .refine(file => {
      if (!file) return true;
      return SUPPORTED_FORMATS.includes(file.type);
    }, '*Unsupported File Format')
    .refine(file => {
      if (!file) return true;
      return file.size <= FILE_SIZE;
    }, '*File Size is too large')
    .optional(),
  receiptNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  debitNoteDate: z.union([z.date(), z.string()]).optional(),
  receiptAttachmentDescription: z.string().optional(),
});

const DebitNoteRefund = props => {
  const {
    history,
    location,
    debiteNoteActions,
    debitNotesRefundActions,
    commonActions,
    customer_list,
    deposit_list,
    pay_mode,
  } = props;

  // State
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [amount] = useState(location.state.id.dueAmount);
  const [invoiceId] = useState(location.state.id.id);
  const [isCNWithoutProduct] = useState(location.state.id.isCNWithoutProduct);
  const [contactType] = useState(1);
  const [fileName, setFileName] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  const uploadFileRef = useRef(null);
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields },
    trigger,
  } = useForm({
    resolver: zodResolver(debitNoteRefundSchema),
    mode: 'onChange',
    defaultValues: {
      receiptNo: '',
      contactId: location.state.id.contactId,
      amount: location.state.id.dueAmount,
      payMode: { label: 'CASH', value: 'CASH' },
      paymentDate: new Date(location.state.id.creditNoteDate),
      notes: '',
      depositeTo: { label: 'Petty Cash', value: 47 },
      referenceCode: '',
      attachmentFile: '',
      receiptNumber: location.state.id.creditNoteNumber ? location.state.id.creditNoteNumber : '',
      invoiceNumber: location.state.id.invNumber ? location.state.id.invNumber : '',
      debitNoteDate: location.state.id.creditNoteDate
        ? new Date(dayjs(location.state.id.creditNoteDate, 'DD-MM-YYYY').format())
        : '',
      receiptAttachmentDescription: '',
    },
  });

  const watchedAmount = watch('amount');

  // Additional validation for amount
  useEffect(() => {
    if (watchedAmount && amount < parseFloat(watchedAmount)) {
      // This will be shown via custom error handling
    }
  }, [watchedAmount, amount]);

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    debiteNoteActions.getDepositList();
    commonActions.getPaymentMode();
    commonActions.getCustomerList(contactType);
  };

  const handleFileChange = e => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
      setValue('attachmentFile', file, { shouldValidate: true });
      setFileName(file.name);
    }
  };

  const onSubmit = data => {
    // Additional validation for amount
    if (!data.amount || data.amount == 0) {
      commonActions.tostifyAlert('error', strings.AmountCannotBeZero);
      return;
    }
    if (amount < parseFloat(data.amount)) {
      commonActions.tostifyAlert('error', strings.AmountCannotBeGreaterThanDebitAmount);
      return;
    }

    setDisabled(true);
    setDisableLeavePage(true);

    const { paymentDate, contactId, amount: amountValue, depositeTo, payMode, notes } = data;

    let formData = new FormData();

    if (isCNWithoutProduct == true) {
      formData.append('creditNoteId', location.state.id.id);
      formData.append('amountReceived', amountValue !== null ? amountValue : '');
      formData.append('notes', notes !== null ? notes : '');
      formData.append('type', '13');
      formData.append('depositeTo', depositeTo !== null ? depositeTo.value || depositeTo : '');
      formData.append('payMode', payMode !== null ? payMode.value || payMode : '');
      if (contactId) {
        formData.append('contactId', contactId);
      }
      formData.append(
        'paymentDate',
        typeof paymentDate === 'string' ? dayjs(paymentDate, 'DD/MM/YYYY').toDate() : paymentDate
      );
      setLoading(true);
      setLoadingMsg('Credit Refunding...');

      debitNotesRefundActions
        .refundPaymentCNWithoutInvoice(formData)
        .then(res => {
          commonActions.tostifyAlert('success', strings.RefundRecordedSuccessfully);
          history.push('/admin/expense/debit-notes');
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          setLoadingMsg('');
          setDisabled(false);
          setDisableLeavePage(false);
          commonActions.tostifyAlert('error', strings.RefundRecordedUnsuccessfully);
        });
    } else {
      formData.append('isCNWithoutProduct', false);
      formData.append('creditNoteId', location.state.id.id);
      formData.append('amountReceived', amountValue !== null ? amountValue : '');
      formData.append('notes', notes !== null ? notes : '');
      formData.append('type', '13');
      formData.append('invoiceId', invoiceId);
      formData.append('depositTo', depositeTo !== null ? depositeTo.value || depositeTo : '');
      formData.append('payMode', payMode !== null ? payMode.value || payMode : '');
      if (contactId) {
        formData.append('contactId', contactId);
      }
      formData.append(
        'paymentDate',
        typeof paymentDate === 'string' ? dayjs(paymentDate, 'DD/MM/YYYY').toDate() : paymentDate
      );
      if (uploadFileRef.current?.files?.[0]) {
        formData.append('attachmentFile', uploadFileRef.current.files[0]);
      }
      setLoading(true);
      setLoadingMsg('Payment Refunding...');

      debitNotesRefundActions
        .refundPaymentCNWithInvoice(formData)
        .then(res => {
          commonActions.tostifyAlert('success', strings.RefundRecordedSuccessfully);
          history.push('/admin/expense/debit-notes');
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          setLoadingMsg('');
          setDisabled(false);
          setDisableLeavePage(false);
          commonActions.tostifyAlert('error', strings.RefundRecordedUnsuccessfully);
        });
    }
  };

  strings.setLanguage(language);

  let tmpcustomer_list = [];
  customer_list.map(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpcustomer_list.push(obj);
  });

  return loading == true ? (
    <Loader loadingMsg={loadingMsg} />
  ) : (
    <div className="detail-customer-invoice-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <Card>
              <CardHeader>
                <Row>
                  <Col lg={12}>
                    <div className="h4 mb-0 d-flex align-items-center">
                      <i className="fa fa-credit-card" />
                      <span className="ml-2">{strings.RecordRefundOnDebitNote}</span>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <Loader />
                ) : (
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="contactId">
                                <span className="text-danger">* </span>
                                {strings.SupplierName}
                              </Label>
                              <Controller
                                name="contactId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={customStyles}
                                    id="contactId"
                                    isDisabled
                                    value={
                                      tmpcustomer_list &&
                                      tmpcustomer_list.find(
                                        option => option.value === +location.state.id.contactId
                                      )
                                    }
                                    className={
                                      errors.contactId && touchedFields.contactId
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.contactId && touchedFields.contactId && (
                                <div className="invalid-feedback">{errors.contactId.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="amount">
                                <span className="text-danger">* </span> {strings.AmountReceived}
                              </Label>
                              <Controller
                                name="amount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    min={0}
                                    maxLength="14,2"
                                    max={amount}
                                    id="amount"
                                    onChange={e => {
                                      if (
                                        (e.target.value === '' ||
                                          regDecimal.test(e.target.value)) &&
                                        parseFloat(e.target.value) !== 0
                                      ) {
                                        field.onChange(e.target.value);
                                      }
                                    }}
                                    placeholder={strings.AmountReceived}
                                    className={
                                      errors.amount && touchedFields.amount ? 'is-invalid' : ''
                                    }
                                  />
                                )}
                              />
                              {errors.amount && touchedFields.amount && (
                                <div className="invalid-feedback">{errors.amount.message}</div>
                              )}
                              {watchedAmount && amount < parseFloat(watchedAmount) && (
                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                  {strings.AmountCannotBeGreaterThanDebitAmount}
                                </div>
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
                                render={({ field }) => (
                                  <DatePicker
                                    {...field}
                                    id="paymentDate"
                                    placeholderText={strings.PaymentDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    minDate={new Date(field.value)}
                                    maxDate={null}
                                    dropdownMode="select"
                                    selected={field.value}
                                    onChange={value => {
                                      field.onChange(value);
                                    }}
                                    className={`form-control ${
                                      errors.paymentDate && touchedFields.paymentDate
                                        ? 'is-invalid'
                                        : ''
                                    }`}
                                  />
                                )}
                              />
                              {errors.paymentDate && touchedFields.paymentDate && (
                                <div className="invalid-feedback">{errors.paymentDate.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="payMode">
                                <span className="text-danger">* </span> {strings.PaymentMode}
                              </Label>
                              <Controller
                                name="payMode"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={
                                      pay_mode
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            pay_mode,
                                            'Mode'
                                          )
                                        : []
                                    }
                                    onChange={option => {
                                      field.onChange(option || '');
                                    }}
                                    placeholder={strings.Select + strings.PaymentMode}
                                    id="payMode"
                                    className={
                                      errors.payMode && touchedFields.payMode ? 'is-invalid' : ''
                                    }
                                  />
                                )}
                              />
                              {errors.payMode && touchedFields.payMode && (
                                <div className="invalid-feedback">{errors.payMode.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="depositeTo">
                                <span className="text-danger">* </span> {strings.ReceivedThrough}
                              </Label>
                              <Controller
                                name="depositeTo"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={deposit_list}
                                    onChange={option => {
                                      field.onChange(option || '');
                                    }}
                                    placeholder={strings.Select + strings.ReceivedThrough}
                                    id="depositeTo"
                                    className={
                                      errors.depositeTo && touchedFields.depositeTo
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                )}
                              />
                              {errors.depositeTo && touchedFields.depositeTo && (
                                <div className="invalid-feedback">{errors.depositeTo.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />

                        <Row>
                          <Col lg={4}>
                            <FormGroup className="py-2">
                              <Label htmlFor="notes">{strings.RefundNotes}</Label>
                              <br />
                              <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                  <Textarea
                                    {...field}
                                    className="form-control"
                                    maxLength="255"
                                    id="notes"
                                    rows={2}
                                    placeholder={strings.Enter + strings.Notes}
                                    onChange={e => {
                                      if ((!field.value && e.target.value !== ' ') || field.value) {
                                        field.onChange(e.target.value);
                                      }
                                    }}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="receiptAttachmentDescription">
                                {strings.AttachmentDescription}
                              </Label>
                              <br />
                              <Controller
                                name="receiptAttachmentDescription"
                                control={control}
                                render={({ field }) => (
                                  <Textarea
                                    {...field}
                                    className="form-control"
                                    maxLength="255"
                                    id="receiptAttachmentDescription"
                                    rows={2}
                                    placeholder={strings.ReceiptAttachmentDescription}
                                    onChange={e => {
                                      if ((!field.value && e.target.value !== ' ') || field.value) {
                                        field.onChange(e.target.value);
                                      }
                                    }}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label>{strings.ReceiptAttachment}</Label> <br />
                              <input
                                id="fileInput"
                                ref={uploadFileRef}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                              />
                              <Button
                                color="primary"
                                onClick={() => {
                                  document.getElementById('fileInput').click();
                                }}
                                className="btn-square mr-3"
                              >
                                <i className="fa fa-upload"></i> {strings.upload}
                              </Button>
                              {fileName && (
                                <div>
                                  <i className="fa fa-close" onClick={() => setFileName('')}></i>{' '}
                                  {fileName}
                                </div>
                              )}
                              {errors.attachmentFile && touchedFields.attachmentFile && (
                                <div className="invalid-file">{errors.attachmentFile.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="receiptNumber">{strings.ReferenceNumber}</Label>
                              <Controller
                                name="receiptNumber"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    maxLength="20"
                                    id="receiptNumber"
                                    placeholder={strings.ReceiptNumber}
                                    className={
                                      errors.receiptNumber && touchedFields.receiptNumber
                                        ? 'is-invalid'
                                        : ' '
                                    }
                                  />
                                )}
                              />
                              {errors.receiptNumber && touchedFields.receiptNumber && (
                                <div className="invalid-feedback">
                                  {errors.receiptNumber.message}
                                </div>
                              )}
                            </FormGroup>
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
                                onClick={async () => {
                                  const isValid = await trigger();
                                  if (!isValid) {
                                    commonActions.fillManDatoryDetails();
                                  }
                                }}
                              >
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Refunding...' : strings.RefundPayment}
                              </Button>
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  if (location?.state?.id.renderURL) {
                                    history.push(`${location?.state?.id.renderURL}`, {
                                      id: location?.state?.id.renderID,
                                      isCNWithoutProduct: location.state.id.isCNWithoutProduct,
                                    });
                                  } else {
                                    history.push('/admin/expense/debit-notes');
                                  }
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
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DebitNoteRefund);
