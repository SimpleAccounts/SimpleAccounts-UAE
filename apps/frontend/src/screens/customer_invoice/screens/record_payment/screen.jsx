import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import * as CustomerRecordPaymentActions from './actions';
import * as CustomerInvoiceActions from '../../actions';
import { CustomerModal } from '../../sections';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Textarea } from '@/components/ui/textarea';
import { BookUser, Upload, X, CircleDot, Ban } from 'lucide-react';
import { toast } from 'sonner';

const mapStateToProps = state => {
  return {
    contact_list: state.customer_invoice.contact_list,
    customer_list: state.customer_invoice.customer_list,
    deposit_list: state.customer_invoice.deposit_list,
    pay_mode: state.customer_invoice.pay_mode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    customerInvoiceActions: bindActionCreators(CustomerInvoiceActions, dispatch),
    CustomerRecordPaymentActions: bindActionCreators(CustomerRecordPaymentActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

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

const strings = new LocalizedStrings(data);

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
const recordPaymentSchema = z.object({
  receiptNo: z.union([z.string(), z.number()]).optional(),
  receiptDate: z
    .union([z.string(), z.date()])
    .refine(val => val != null && val !== '', { message: 'Payment date is required' }),
  contactId: z
    .union([z.string(), z.number()])
    .refine(val => val != null && val !== '' && (typeof val !== 'number' || val > 0), {
      message: 'Customer is required',
    }),
  amount: z.union([z.string(), z.number()]).refine(
    val => {
      const numVal = typeof val === 'string' ? parseFloat(String(val).replace(/,/g, '')) : val;
      return numVal != null && !Number.isNaN(numVal) && numVal > 0;
    },
    { message: 'Amount cannot be empty or 0' }
  ),
  payMode: z.any().refine(
    val => val != null && (val?.value != null || val?.value === 0) && val?.value !== '',
    { message: 'Payment mode is required' }
  ),
  depositeTo: z.any().refine(
    val => val != null && (val?.value != null || val?.value === 0) && val?.value !== '',
    { message: 'Received through is required' }
  ),
  notes: z.union([z.string(), z.number()]).optional(),
  referenceCode: z.union([z.string(), z.number()]).optional(),
  attachmentFile: z
    .any()
    .refine(
      file => {
        if (!file) return true;
        return supported_format.includes(file.type);
      },
      { message: '*Unsupported File Format' }
    )
    .refine(
      file => {
        if (!file) return true;
        return file.size <= file_size;
      },
      { message: '*File size is too large' }
    ),
  paidInvoiceListStr: z.array(z.any()),
});

const RecordCustomerPayment = props => {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceData = location?.state?.id ?? null;

  const [language] = useState(window.localStorage.getItem('language'));
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [data, setData] = useState([]);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [contactType] = useState(2);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  const uploadFile = useRef(null);
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  // Normalize invoice data (with safe fallbacks when null - required for Rules of Hooks)
  const inv = invoiceData
    ? {
        id: invoiceData.id,
        invoiceNumber: invoiceData.invoiceNumber ?? invoiceData.referenceNumber,
        invoiceDate: invoiceData.invoiceDate,
        invoiceDueDate: invoiceData.invoiceDueDate,
        invoiceAmount: invoiceData.invoiceAmount ?? invoiceData.totalAmount,
        dueAmount:
          invoiceData.dueAmount ??
          invoiceData.remainingInvoiceAmount ??
          invoiceData.invoiceAmount ??
          invoiceData.totalAmount,
        contactId:
          invoiceData.contactId ??
          invoiceData.contact?.contactId ??
          invoiceData.contact?.contact_id ??
          invoiceData.contact?.id,
        renderURL: invoiceData.renderURL,
        renderID: invoiceData.renderID ?? invoiceData.id,
      }
    : { id: null, invoiceNumber: '', invoiceDate: '', invoiceDueDate: '', invoiceAmount: 0, dueAmount: 0, contactId: null, renderURL: '', renderID: null };

  const invoiceId = inv.id;

  // Parse date - support DD-MM-YYYY, YYYY-MM-DD, and ISO
  const parseInvoiceDate = str => {
    const s = String(str || '').trim();
    if (!s || s.length < 8) return new Date();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      return new Date(s);
    }
    if (/^\d{2}-\d{2}-\d{4}/.test(s)) {
      const [d, m, y] = s.split('-');
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    }
    return new Date(s) || new Date();
  };
  const invoiceDate = parseInvoiceDate(inv.invoiceDate);

  const dueAmount = inv.dueAmount ?? 0;
  const { deposit_list, pay_mode, customer_list } = props;

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      receiptNo: '',
      receiptDate: invoiceDate,
      contactId: inv.contactId ?? '',
      amount: dueAmount,
      payMode: { label: 'CASH', value: 'CASH' },
      notes: '',
      depositeTo: { label: 'Petty Cash', value: 47 },
      referenceCode: '',
      attachmentFile: '',
      paidInvoiceListStr: [
        {
          id: inv.id,
          date: parseInvoiceDate(inv.invoiceDate),
          dueDate: parseInvoiceDate(inv.invoiceDueDate),
          paidAmount: inv.invoiceAmount ?? inv.dueAmount ?? 0,
          dueAmount,
          referenceNo: inv.invoiceNumber ?? '',
          totalAount: inv.invoiceAmount ?? inv.dueAmount ?? 0,
        },
      ],
    },
  });

  const amountValue = watch('amount');

  useEffect(() => {
    if (!invoiceData) {
      props.commonActions.tostifyAlert('error', 'Invoice data is missing. Please select an invoice and try again.');
      navigate('/admin/income/customer-invoice');
    }
  }, [invoiceData, navigate, props.commonActions]);

  useEffect(() => {
    if (invoiceData && invoiceId) {
      props.customerInvoiceActions.getDepositList();
      props.customerInvoiceActions.getPaymentMode();
      props.customerInvoiceActions.getCustomerList(contactType);
      props.CustomerRecordPaymentActions.getReceiptNo(invoiceId).then(res => {
        if (res?.status === 200) setValue('receiptNo', res.data, true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceData, invoiceId]);

  useEffect(() => {
    if (inv.contactId != null && inv.contactId !== '') {
      setValue('contactId', inv.contactId, { shouldValidate: false });
    }
  }, [inv.contactId, setValue]);

  useEffect(() => {
    const list = Array.isArray(deposit_list) ? deposit_list : deposit_list?.data ?? [];
    if (list.length > 0) {
      let firstOpt = null;
      for (const group of list) {
        const opts = group?.options ?? (Array.isArray(group) ? group : []);
        if (opts && opts.length > 0) {
          firstOpt = opts[0];
          break;
        }
      }
      if (firstOpt && (firstOpt.value != null || firstOpt.label)) {
        const opt = {
          value: firstOpt.value ?? firstOpt.id ?? firstOpt.label,
          label: firstOpt.label ?? String(firstOpt.value ?? firstOpt.id ?? ''),
        };
        setValue('depositeTo', opt, { shouldValidate: false });
      }
    }
  }, [deposit_list, setValue]);

  if (!invoiceData) {
    return <Loader />;
  }

  const handleFileChange = e => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
      setValue('attachmentFile', file, true);
      setFileName(file.name);
    }
  };

  const onSubmit = formData => {
    setDisabled(true);
    setDisableLeavePage(true);

    const { receiptNo, receiptDate, contactId, amount, depositeTo, payMode, notes, referenceCode } =
      formData;

    const contactIdVal =
      typeof contactId === 'object' && contactId != null && 'value' in contactId
        ? contactId.value
        : contactId;

    const receiptDateVal =
      typeof receiptDate === 'string'
        ? dayjs(receiptDate, 'DD-MM-YYYY').toDate()
        : receiptDate;
    const receiptDateStr =
      receiptDateVal instanceof Date
        ? dayjs(receiptDateVal).format('DD-MM-YYYY')
        : String(receiptDateVal);

    let submitData = new FormData();
    submitData.append(
      'receiptNo',
      receiptNo != null && receiptNo !== '' ? String(receiptNo) : `RCP-${Date.now()}`
    );
    submitData.append('receiptDate', receiptDateStr);
    submitData.append('paidInvoiceListStr', JSON.stringify(formData.paidInvoiceListStr));
    submitData.append(
      'invoiceNumber',
      inv.invoiceNumber ? inv.invoiceNumber : 'Invoice-00000'
    );
    submitData.append(
      'invoiceAmount',
      inv.invoiceAmount != null ? inv.invoiceAmount : '00000'
    );
    const amountStr =
      amount != null && amount !== ''
        ? String(amount).replace(/,/g, '')
        : '';
    submitData.append('amount', amountStr);
    submitData.append('notes', notes !== null ? notes : '');
    submitData.append('referenceCode', referenceCode !== null ? referenceCode : '');
    submitData.append(
      'depositeTo',
      depositeTo != null && typeof depositeTo === 'object' ? depositeTo.value : depositeTo ?? ''
    );
    submitData.append(
      'payMode',
      payMode != null && typeof payMode === 'object' ? payMode.value : payMode ?? 'CASH'
    );
    if (contactIdVal != null && contactIdVal !== '') {
      submitData.append('contactId', contactIdVal);
    }
    if (uploadFile.current?.files?.[0]) {
      submitData.append('attachmentFile', uploadFile.current.files[0]);
    }
    setLoading(true);
    setLoadingMsg('Payment Recording...');
    props.CustomerRecordPaymentActions.recordPayment(submitData)
      .then(res => {
        const msg = res?.data?.message ?? strings.PaymentRecordedSuccessfully ?? 'Payment recorded successfully';
        toast.success(msg, { duration: 4000 });
        props.commonActions.tostifyAlert('success', msg);
        navigate('/admin/income/customer-invoice');
        setLoading(false);
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        const errMsg = err?.data?.message ?? err?.response?.data?.message ?? 'Payment could not be recorded';
        toast.error(errMsg, { duration: 5000 });
        props.commonActions.tostifyAlert('error', errMsg);
      });
  };

  const openCustomerModalHandler = e => {
    e.preventDefault();
    setOpenCustomerModal(true);
  };

  const getCurrentUser = data => {
    let option;
    if (data.label || data.value) {
      option = data;
    } else {
      option = {
        label: `${data.fullName}`,
        value: data.id,
      };
    }
    setValue('contactId', option.value, true);
  };

  const closeCustomerModal = res => {
    if (res) {
      props.customerInvoiceActions.getCustomerList(contactType);
    }
    setOpenCustomerModal(false);
  };

  const deleteInvoice = () => {
    const message1 = (
      <text>
        <b>{strings.DeleteCustomerInvoice}</b>
      </text>
    );
    const message = 'This customer invoice will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeInvoice}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeInvoice = () => {
    props.customerInvoiceDetailActions
      .deleteInvoice(currentCustomerId)
      .then(res => {
        if (res.status === 200) {
          props.commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Invoice Deleted Successfully'
          );
          navigate('/admin/income/customer-invoice');
        }
      })
      .catch(err => {
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Invoice Deleted Unsuccessfully'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  strings.setLanguage(language);

  let tmpcustomer_list = [];
  (customer_list || []).forEach(item => {
    const label = item?.label?.contactName ?? item?.label ?? (item?.value != null ? String(item.value) : '');
    if (item?.value != null) {
      tmpcustomer_list.push({ label, value: item.value });
    }
  });

  // Custom validation for amount
  const isAmountValid = () => {
    const numAmount = typeof amountValue === 'string' ? parseFloat(amountValue) : amountValue;
    return numAmount <= dueAmount;
  };

  return loading === true ? (
    <Loader loadingMsg={loadingMsg} />
  ) : (
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
                        <span className="ml-2">{strings.PaymentforCustomerInvoice}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  {loading ? (
                    <Loader />
                  ) : (
                    <Row>
                      <Col lg={12}>
                        <Form
                          noValidate
                          onSubmit={handleSubmit(onSubmit, errors => {
                            const firstError =
                              errors && Object.keys(errors).length > 0
                                ? Object.values(errors)[0]?.message || 'Please fill all mandatory fields'
                                : 'Please fill all mandatory fields';
                            toast.error(firstError, { duration: 5000 });
                            props.commonActions.tostifyAlert('error', firstError);
                          })}
                        >
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="contactId">
                                  <span className="text-danger">* </span>
                                  {strings.CustomerName}
                                </Label>
                                <Controller
                                  name="contactId"
                                  control={control}
                                  render={({ field }) => {
                                    const option =
                                      tmpcustomer_list?.find(o => String(o.value) === String(field.value)) ||
                                      (field.value != null && field.value !== ''
                                        ? { value: field.value, label: String(field.value) }
                                        : null);
                                    return (
                                    <Select
                                      ref={field.ref}
                                      value={option}
                                      onChange={e => field.onChange(e?.value ?? e)}
                                      onBlur={field.onBlur}
                                      options={tmpcustomer_list || []}
                                      styles={customStyles}
                                      id="contactId"
                                      isDisabled
                                      className={
                                        errors.contactId && touchedFields.contactId
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                    );
                                  }}
                                />
                                {errors.contactId && touchedFields.contactId && (
                                  <div className="invalid-feedback">{errors.contactId.message}</div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <hr />
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
                                      id="amount"
                                      value={
                                        typeof field.value === 'number'
                                          ? field.value.toLocaleString('en-US', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })
                                          : field.value
                                      }
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regDecimal.test(e.target.value)
                                        ) {
                                          field.onChange(e.target.value);
                                        }
                                      }}
                                      placeholder={strings.AmountReceived}
                                      className={
                                        (errors.amount && touchedFields.amount) || !isAmountValid()
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.amount && touchedFields.amount && (
                                  <div className="invalid-feedback d-block">
                                    {errors.amount.message}
                                  </div>
                                )}
                                {!isAmountValid() && (
                                  <div className="invalid-feedback d-block">
                                    Amount cannot be greater than invoice amount
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <hr />
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="receiptDate">
                                  <span className="text-danger">* </span>
                                  {strings.PAYMENTDATE}
                                </Label>
                                <Controller
                                  name="receiptDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      {...field}
                                      id="receiptDate"
                                      placeholderText={strings.PaymentDate}
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd-MM-yyyy"
                                      dropdownMode="select"
                                      minDate={invoiceDate}
                                      selected={field.value}
                                      onChange={date => field.onChange(date)}
                                      className={`form-control ${
                                        errors.receiptDate && touchedFields.receiptDate
                                          ? 'is-invalid'
                                          : ''
                                      }`}
                                    />
                                  )}
                                />
                                {errors.receiptDate && touchedFields.receiptDate && (
                                  <div className="invalid-feedback d-block">
                                    {errors.receiptDate.message}
                                  </div>
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
                                      placeholder={strings.Select + strings.PaymentMode}
                                      id="payMode"
                                      className={
                                        errors.payMode && touchedFields.payMode ? 'is-invalid' : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.payMode && touchedFields.payMode && (
                                  <div className="invalid-feedback d-block">
                                    {errors.payMode.message}
                                  </div>
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
                                  <div className="invalid-feedback d-block">
                                    {errors.depositeTo.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <hr />
                          <Row>
                            <Col lg={8}>
                              <FormGroup className="py-2">
                                <Label htmlFor="notes">{strings.Notes}</Label>
                                <br />
                                <Controller
                                  name="notes"
                                  control={control}
                                  render={({ field }) => (
                                    <Textarea
                                      {...field}
                                      style={{ width: '870px' }}
                                      maxLength={255}
                                      id="notes"
                                      rows={2}
                                      placeholder={strings.DeliveryNotes}
                                    />
                                  )}
                                />
                              </FormGroup>
                              <Row>
                                <Col lg={6}>
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
                                <Col lg={6}>
                                  <FormGroup className="mb-3">
                                    <Label>{strings.ReceiptAttachment}</Label> <br />
                                    <Button
                                      color="primary"
                                      onClick={() => {
                                        document.getElementById('fileInput').click();
                                      }}
                                      className="btn-square mr-3"
                                    >
                                      <Upload className="h-4 w-4" /> {strings.upload}
                                    </Button>
                                    <input
                                      id="fileInput"
                                      ref={uploadFile}
                                      type="file"
                                      style={{ display: 'none' }}
                                      onChange={handleFileChange}
                                    />
                                    {fileName && (
                                      <div>
                                        <X
                                          className="h-4 w-4 cursor-pointer"
                                          onClick={() => setFileName('')}
                                        />{' '}
                                        {fileName}
                                      </div>
                                    )}
                                    {errors.attachmentFile && touchedFields.attachmentFile && (
                                      <div className="invalid-file">
                                        {errors.attachmentFile.message}
                                      </div>
                                    )}
                                  </FormGroup>
                                </Col>
                              </Row>
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
                                      maxLength={250}
                                      style={{ width: '870px' }}
                                      id="receiptAttachmentDescription"
                                      rows={2}
                                      placeholder={strings.ReceiptAttachmentDescription}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          {Object.keys(errors).length > 0 && (
                            <Row>
                              <Col lg={12}>
                                <div
                                  className="alert alert-danger mb-3"
                                  role="alert"
                                >
                                  <strong>Please fix the following:</strong>
                                  <ul className="mb-0 mt-2">
                                    {Object.entries(errors).map(([key, err]) => (
                                      <li key={key}>{err?.message}</li>
                                    ))}
                                  </ul>
                                </div>
                              </Col>
                            </Row>
                          )}
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
                                    if (inv?.renderURL) {
                                      navigate(inv.renderURL, {
                                        state: { id: inv.renderID },
                                      });
                                    } else {
                                      navigate('/admin/income/customer-invoice');
                                    }
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
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
        <CustomerModal
          openCustomerModal={openCustomerModal}
          closeCustomerModal={e => {
            closeCustomerModal(e);
          }}
          getCurrentUser={e => getCurrentUser(e)}
          createCustomer={props.customerInvoiceActions.createCustomer}
          currency_list={props.currency_list}
          country_list={props.country_list}
          getStateList={props.customerInvoiceActions.getStateList}
        />
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(RecordCustomerPayment);
