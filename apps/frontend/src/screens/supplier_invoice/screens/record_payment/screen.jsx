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
import * as SupplierRecordPaymentActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import { Textarea } from '@/components/ui/textarea';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { BookUser, Upload, X, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    contact_list: state.customer_invoice.contact_list,
    supplier_list: state.supplier_invoice.supplier_list,
    deposit_list: state.supplier_invoice.deposit_list,
    pay_mode: state.supplier_invoice.pay_mode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    SupplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    SupplierRecordPaymentActions: bindActionCreators(SupplierRecordPaymentActions, dispatch),
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
  paymentNo: z.union([z.string(), z.number()]).optional(),
  paymentDate: z
    .union([z.string(), z.date()])
    .refine(val => val !== '', { message: 'Payment date is required' }),
  contactId: z.union([z.string(), z.number()]),
  amount: z.union([z.string(), z.number()]).refine(
    val => {
      const numVal = typeof val === 'string' ? parseFloat(val) : val;
      return numVal > 0;
    },
    { message: 'Amount cannot be Less than 0' }
  ),
  payMode: z
    .object({ value: z.string(), label: z.string() })
    .refine(val => val.value !== '', { message: 'Payment mode is required' }),
  depositeTo: z
    .object({ value: z.union([z.string(), z.number()]), label: z.string() })
    .refine(val => val.value !== '', { message: 'Paid through is required' }),
  notes: z.string().optional(),
  referenceCode: z.string().optional(),
  deleteFlag: z.boolean().optional(),
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
      { message: '*File Size is too large' }
    ),
  paidInvoiceListStr: z.array(z.any()),
});

const RecordSupplierPayment = props => {
  const [language] = useState(window.localStorage.getItem('language'));
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [contactType] = useState(1);
  const [fileName, setFileName] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  const uploadFile = useRef(null);
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  const invoiceDate = new Date(
    props.location.state.id.invoiceDate.substring(6),
    props.location.state.id.invoiceDate.substring(3, 5) - 1,
    props.location.state.id.invoiceDate.substring(0, 2)
  );

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      paymentNo: 1,
      paymentDate: invoiceDate,
      contactId: props.location.state.id.contactId,
      amount: props.location.state.id.dueAmount,
      payMode: { label: 'CASH', value: 'CASH' },
      notes: '',
      depositeTo: { label: 'Petty Cash', value: 47 },
      referenceCode: '',
      attachmentFile: '',
      paidInvoiceListStr: [
        {
          id: props.location.state.id.id,
          date: dayjs(props.location.state.id.invoiceDate, 'DD-MM-YYYY').toDate(),
          dueDate: dayjs(props.location.state.id.invoiceDueDate, 'DD-MM-YYYY').toDate(),
          paidAmount: props.location.state.id.invoiceAmount,
          dueAmount: props.location.state.id.dueAmount,
          referenceNo: props.location.state.id.invoiceNumber,
          totalAount: props.location.state.id.invoiceAmount,
        },
      ],
      deleteFlag: true,
    },
  });

  const amountValue = watch('amount');
  const dueAmount = props.location.state.id.dueAmount;

  useEffect(() => {
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeData = () => {
    Promise.all([
      props.SupplierInvoiceActions.getDepositList(),
      props.SupplierInvoiceActions.getPaymentMode(),
      props.SupplierInvoiceActions.getSupplierList(contactType),
    ]);
  };

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

    const {
      paymentNo,
      paymentDate,
      contactId,
      amount,
      depositeTo,
      payMode,
      notes,
      referenceCode,
      deleteFlag,
    } = formData;

    let submitData = new FormData();
    submitData.append('paymentNo', paymentNo !== null ? paymentNo : '');
    submitData.append('paymentDate', paymentDate ? paymentDate : null);
    submitData.append('paidInvoiceListStr', JSON.stringify(formData.paidInvoiceListStr));
    submitData.append('amount', amount !== null ? amount : '');
    submitData.append('notes', notes !== null ? notes : '');
    submitData.append('referenceNo', referenceCode !== null ? referenceCode : '');
    submitData.append('deleteFlag', deleteFlag !== null ? deleteFlag : '');
    submitData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
    submitData.append('payMode', payMode !== null ? payMode.value : '');
    if (contactId) {
      submitData.append('contactId', contactId);
    }
    if (uploadFile.current?.files?.[0]) {
      submitData.append('attachmentFile', uploadFile.current.files[0]);
    }
    submitData.append(
      'invoiceNumber',
      props.location.state.id.invoiceNumber
        ? props.location.state.id.invoiceNumber
        : 'Invoice-00000'
    );
    submitData.append(
      'invoiceAmount',
      props.location.state.id.invoiceAmount ? props.location.state.id.invoiceAmount : '00000'
    );

    setLoading(true);
    setLoadingMsg('Payment Recording...');
    props.SupplierRecordPaymentActions.recordPayment(submitData)
      .then(res => {
        props.commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : strings.PaymentRecordedSuccessfully
        );
        props.history.push('/admin/expense/supplier-invoice');
        setLoading(false);
      })
      .catch(err => {
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Payment Recorded Unsuccessfully.'
        );
        setDisabled(false);
        setLoading(false);
      });
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

  const deleteInvoice = () => {
    const message1 = (
      <text>
        <b>Delete Supplier Invoice?</b>
      </text>
    );
    const message = 'This Supplier Invoice will be deleted permanently and cannot be recovered. ';
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
            res.data ? res.data.message : 'Supplier Invoice Deleted Successfully'
          );
          props.history.push('/admin/revenue/customer-invoice');
        }
      })
      .catch(err => {
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Supplier Invoice Deleted Unsuccessfully'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  strings.setLanguage(language);
  const { pay_mode, supplier_list, deposit_list } = props;

  let tmpSupplier_list = [];
  supplier_list.map(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpSupplier_list.push(obj);
    return obj;
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
                        <span className="ml-2">{strings.PaymentForSupplierInvoice}</span>
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
                                        tmpSupplier_list &&
                                        tmpSupplier_list.find(
                                          option =>
                                            option.value === +props.location.state.id.contactId
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
                          <hr />
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="amount">
                                  <span className="text-danger">* </span> {strings.AmountPaid}
                                </Label>
                                <Controller
                                  name="amount"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="text"
                                      min="0.01"
                                      maxLength="14,2"
                                      id="amount"
                                      onChange={e => {
                                        if (
                                          e.target.value === '' ||
                                          regDecimal.test(e.target.value)
                                        ) {
                                          field.onChange(e.target.value);
                                        }
                                      }}
                                      placeholder={strings.AmountPaid}
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
                                      dropdownMode="select"
                                      minDate={invoiceDate}
                                      selected={field.value}
                                      onChange={date => field.onChange(date)}
                                      className={`form-control ${
                                        errors.paymentDate && touchedFields.paymentDate
                                          ? 'is-invalid'
                                          : ''
                                      }`}
                                    />
                                  )}
                                />
                                {errors.paymentDate && touchedFields.paymentDate && (
                                  <div className="invalid-feedback d-block">
                                    {errors.paymentDate.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="payMode">
                                  <span className="text-danger">* </span>
                                  {strings.PaymentMode}
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
                                  <span className="text-danger">* </span> {strings.PaidThrough}
                                </Label>
                                <Controller
                                  name="depositeTo"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      options={deposit_list}
                                      placeholder={strings.Select + strings.PaidThrough}
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
                                      className="textarea form-control"
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
                                      className="textarea form-control"
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
                                    if (errors && Object.keys(errors).length !== 0)
                                      props.commonActions.fillManDatoryDetails();
                                  }}
                                >
                                  <CircleDot className="h-4 w-4" />{' '}
                                  {disabled ? 'Recording...' : strings.RecordPayment}
                                </Button>
                                <Button
                                  color="secondary"
                                  className="btn-square"
                                  onClick={() => {
                                    if (props?.location?.state?.id.renderURL) {
                                      props.history.push(
                                        `${props?.location?.state?.id?.renderURL}`,
                                        { id: props?.location?.state?.id?.renderID }
                                      );
                                    } else props.history.push('/admin/expense/supplier-invoice');
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
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(RecordSupplierPayment);
