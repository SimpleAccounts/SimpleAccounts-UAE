import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { CommonActions } from 'services/global';
import { selectOptionsFactory, selectStyles } from 'utils';
import * as ReceiptActions from '../../actions';
import * as ReceiptCreateActions from './actions';
import * as CustomerInvoiceActions from '../../../customer_invoice/actions';
import 'react-datepicker/dist/react-datepicker.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { LeavePage, Loader } from 'components';

const mapStateToProps = state => {
  return {
    contact_list: state.receipt.contact_list,
    invoice_list: state.receipt.invoice_list,
    deposit_list: state.customer_invoice.deposit_list,
    pay_mode: state.customer_invoice.pay_mode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    customerInvoiceActions: bindActionCreators(CustomerInvoiceActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    receiptCreateActions: bindActionCreators(ReceiptCreateActions, dispatch),
    receiptActions: bindActionCreators(ReceiptActions, dispatch),
  };
};

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

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
const createReceiptSchema = z.object({
  receiptDate: z.date({
    required_error: 'Receipt date is required',
    invalid_type_error: 'Receipt date is required',
  }),
  contactId: z
    .object({
      value: z.union([z.number(), z.string()]),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, 'Customer is required'),
  depositeTo: z
    .object({
      value: z.union([z.number(), z.string()]),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, 'Deposit to is required'),
  payMode: z
    .object({
      value: z.union([z.number(), z.string()]),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, 'Payment mode is required'),
  paidInvoiceListStr: z
    .array(z.any())
    .min(1, 'Please select atleast one invoice'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^[0-9]+([,.][0-9]+)?$/, 'Please enter valid amount.'),
  receiptNo: z.union([z.number(), z.string()]).optional(),
  fileName: z.string().optional(),
  notes: z.string().optional(),
  referenceCode: z.string().optional(),
  attachmentFile: z.any().optional(),
}).refine((data) => {
  if (data.attachmentFile && data.attachmentFile instanceof File) {
    if (!supported_format.includes(data.attachmentFile.type)) {
      return false;
    }
    if (data.attachmentFile.size > file_size) {
      return false;
    }
  }
  return true;
}, {
  message: 'Invalid file format or size',
  path: ['attachmentFile'],
});

const regEx = /^[0-9\d]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;

const CreateReceipt = ({
  contact_list,
  deposit_list,
  pay_mode,
  customerInvoiceActions,
  commonActions,
  receiptCreateActions,
  receiptActions,
  history,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [data1, setData1] = useState([]);
  const [paidInvoiceListStr, setPaidInvoiceListStr] = useState([]);
  const [fileName, setFileName] = useState('');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const uploadFile = useRef(null);

  const form = useForm({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: {
      receiptNo: 1,
      receiptDate: new Date(),
      contactId: null,
      amount: '',
      fileName: '',
      payMode: null,
      notes: '',
      depositeTo: null,
      referenceCode: '',
      attachmentFile: '',
      paidInvoiceListStr: [],
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const contactId = watch('contactId');

  const selectRowProp = {
    mode: 'checkbox',
    bgColor: 'rgba(0,0,0, 0.05)',
    clickToSelect: false,
    onSelect: onRowSelect,
  };

  const options = {
    paginationPosition: 'bottom',
    page: 1,
    sizePerPage: 10,
  };

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    receiptActions.getContactList(2);
    customerInvoiceActions.getDepositList();
    customerInvoiceActions.getPaymentMode();
  };

  function onRowSelect(row, isSelected, e) {
    let tempList = [];
    if (isSelected) {
      tempList = [...paidInvoiceListStr];
      tempList.push(row);
    } else {
      tempList = paidInvoiceListStr.filter(item => item !== row);
    }

    const totalAmount = tempList.reduce((acc, val) => acc + val.totalAount, 0);

    setPaidInvoiceListStr(tempList);
    setValue('paidInvoiceListStr', tempList, { shouldValidate: true });
    setValue('amount', totalAmount.toString(), { shouldValidate: true });
  }

  const handleFileChange = (e, onChange) => {
    e.preventDefault();
    let file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };

  const onSubmit = (data) => {
    setDisabled(true);
    setDisableLeavePage(true);

    const { receiptNo, receiptDate, contactId, amount, depositeTo, payMode, notes, referenceCode } =
      data;

    let formData = new FormData();
    formData.append('receiptNo', receiptNo !== null ? receiptNo : '');
    formData.append(
      'receiptDate',
      typeof receiptDate === 'string' ? dayjs(receiptDate, 'DD-MM-YYYY').toDate() : receiptDate
    );
    formData.append('amount', amount !== null ? amount : '');
    formData.append('notes', notes !== null ? notes : '');
    formData.append('referenceCode', referenceCode !== null ? referenceCode : '');
    formData.append('paidInvoiceListStr', JSON.stringify(paidInvoiceListStr));
    formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
    if (payMode) {
      formData.append('payMode', payMode !== null ? payMode.value : '');
    }
    if (contactId) {
      formData.append('contactId', contactId.value);
    }
    if (uploadFile.current?.files?.[0]) {
      formData.append('attachmentFile', uploadFile.current?.files?.[0]);
    }

    receiptCreateActions
      .createReceipt(formData)
      .then(res => {
        commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'Payment Recorded Successfully'
        );
        history.push('/admin/income/receipt');
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Payment Recorded Unsuccessfully'
        );
      });
  };

  const getList = (id) => {
    receiptCreateActions
      .getList(id)
      .then(res => {
        if (res.status === 200) {
          const totalAmount = res.data.reduce((acc, val) => acc + val.totalAount, 0);
          setData1(res.data);
          setValue('amount', totalAmount.toString(), { shouldValidate: true });
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const renderAmount = (cell, rows) => {
    return (
      <Input
        type="number"
        min="0"
        readOnly
        value={rows.totalAount}
        placeholder={strings.Amount}
        className="form-control"
      />
    );
  };

  const date = (cell, rows) => {
    return <div>{dayjs.utc(rows.date).format('DD-MM-YYYY')}</div>;
  };

  let tmpContact_list = [];
  contact_list.map(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpContact_list.push(obj);
  });

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="create-receipt-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <Card>
              <CardHeader>
                <Row>
                  <Col lg={12}>
                    <div className="h4 mb-0 d-flex align-items-center">
                      <i className="fa fa-file-o" />
                      <span className="ml-2">{strings.CreateIncomeReciept}</span>
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
                            <Label htmlFor="customer_name">
                              <span className="text-danger">* </span>
                              {strings.CustomerName}
                            </Label>
                            <Controller
                              name="contactId"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  styles={selectStyles}
                                  options={
                                    tmpContact_list
                                      ? selectOptionsFactory.renderOptions(
                                          'label',
                                          'value',
                                          tmpContact_list,
                                          'Customer Name'
                                        )
                                      : []
                                  }
                                  placeholder={strings.CustomerName}
                                  onChange={(option) => {
                                    field.onChange(option);
                                    if (option && option.value) {
                                      getList(option.value);
                                    }
                                  }}
                                  className={errors.contactId ? 'is-invalid' : ''}
                                  isClearable
                                />
                              )}
                            />
                            {errors.contactId && (
                              <div className="invalid-feedback d-block">{errors.contactId.message}</div>
                            )}
                          </FormGroup>
                        </Col>
                      </Row>
                      <hr />
                      {contactId && (
                        <div>
                          {data1.length > 0 ? (
                            <div>
                              <Row>
                                <Col lg={4}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="amount">
                                      <span className="text-danger">* </span>
                                      {strings.AmountReceived}
                                    </Label>
                                    <Controller
                                      name="amount"
                                      control={control}
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          type="number"
                                          min="0"
                                          id="amount"
                                          placeholder={strings.Amount}
                                          onChange={(e) => {
                                            if (
                                              e.target.value === '' ||
                                              regEx.test(e.target.value)
                                            ) {
                                              field.onChange(e);
                                            }
                                          }}
                                          className={`form-control ${
                                            errors.amount ? 'is-invalid' : ''
                                          }`}
                                        />
                                      )}
                                    />
                                    {errors.amount && (
                                      <div className="invalid-feedback">
                                        {errors.amount.message}
                                      </div>
                                    )}
                                  </FormGroup>
                                </Col>
                              </Row>
                              <hr />
                              <Row>
                                <Col lg={4}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="receipt_date">
                                      <span className="text-danger">* </span>
                                      {strings.PaymentDate}
                                    </Label>
                                    <Controller
                                      name="receiptDate"
                                      control={control}
                                      render={({ field }) => (
                                        <DatePicker
                                          {...field}
                                          id="date"
                                          placeholderText={strings.ReceiptDate}
                                          selected={field.value}
                                          showMonthDropdown
                                          showYearDropdown
                                          dateFormat="dd-MM-yyyy"
                                          dropdownMode="select"
                                          onChange={(date) => field.onChange(date)}
                                          className={`form-control ${
                                            errors.receiptDate ? 'is-invalid' : ''
                                          }`}
                                        />
                                      )}
                                    />
                                    {errors.receiptDate && (
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
                                      <span className="text-danger">* </span>{' '}
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
                                          styles={selectStyles}
                                          className={errors.payMode ? 'is-invalid' : ''}
                                          isClearable
                                        />
                                      )}
                                    />
                                    {errors.payMode && (
                                      <div className="invalid-feedback d-block">
                                        {errors.payMode.message}
                                      </div>
                                    )}
                                  </FormGroup>
                                </Col>
                                <Col lg={4}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="depositeTo">
                                      <span className="text-danger">* </span>{' '}
                                      {strings.ReceivedThrough}
                                    </Label>
                                    <Controller
                                      name="depositeTo"
                                      control={control}
                                      render={({ field }) => (
                                        <Select
                                          {...field}
                                          styles={selectStyles}
                                          options={deposit_list}
                                          placeholder={strings.Select + strings.ReceivedThrough}
                                          id="depositeTo"
                                          className={errors.depositeTo ? 'is-invalid' : ''}
                                          isClearable
                                        />
                                      )}
                                    />
                                    {errors.depositeTo && (
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
                                  <Row>
                                    <Col lg={6}>
                                      <FormGroup className="mb-3">
                                        <Label htmlFor="referenceCode">
                                          {strings.ReferenceNumber}
                                        </Label>
                                        <Controller
                                          name="referenceCode"
                                          control={control}
                                          render={({ field }) => (
                                            <Input
                                              {...field}
                                              type="text"
                                              id="referenceCode"
                                              placeholder={strings.ReceiptNumber}
                                              onChange={(e) => {
                                                if (
                                                  e.target.value === '' ||
                                                  regExBoth.test(e.target.value)
                                                ) {
                                                  field.onChange(e);
                                                }
                                              }}
                                            />
                                          )}
                                        />
                                      </FormGroup>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col lg={12}>
                                      <FormGroup className="mb-3">
                                        <Label htmlFor="notes">{strings.Notes}</Label>
                                        <Controller
                                          name="notes"
                                          control={control}
                                          render={({ field }) => (
                                            <Input
                                              {...field}
                                              type="textarea"
                                              id="notes"
                                              rows="5"
                                              placeholder={strings.DeliveryNotes}
                                            />
                                          )}
                                        />
                                      </FormGroup>
                                    </Col>
                                  </Row>
                                </Col>
                                <Col lg={4}>
                                  <Row>
                                    <Col lg={12}>
                                      <FormGroup className="mb-3">
                                        <Controller
                                          name="attachmentFile"
                                          control={control}
                                          render={({ field }) => (
                                            <div>
                                              <Label>{strings.ReceiptAttachment}</Label>{' '}
                                              <br />
                                              <Button
                                                color="primary"
                                                onClick={() => {
                                                  document
                                                    .getElementById('fileInput')
                                                    .click();
                                                }}
                                                className="btn-square mr-3"
                                              >
                                                <i className="fa fa-upload"></i>{' '}
                                                {strings.Attachment}
                                              </Button>
                                              <input
                                                id="fileInput"
                                                ref={uploadFile}
                                                type="file"
                                                style={{
                                                  display: 'none',
                                                }}
                                                onChange={(e) => {
                                                  handleFileChange(e, field.onChange);
                                                }}
                                              />
                                            </div>
                                          )}
                                        />
                                        {fileName && (
                                          <div>
                                            <i
                                              className="fa fa-close"
                                              onClick={() =>
                                                setFileName('')
                                              }
                                            ></i>{' '}
                                            {fileName}
                                          </div>
                                        )}
                                        {errors.attachmentFile && (
                                          <div className="invalid-file">
                                            {errors.attachmentFile.message}
                                          </div>
                                        )}
                                      </FormGroup>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                              <Row>
                                {errors.paidInvoiceListStr && (
                                  <div
                                    className="invalid-feedback d-block"
                                    style={{ fontSize: '20px', marginLeft: '15px' }}
                                  >
                                    {errors.paidInvoiceListStr.message}
                                  </div>
                                )}
                              </Row>
                              <Row>
                                <BootstrapTable
                                  selectRow={selectRowProp}
                                  search={false}
                                  options={options}
                                  data={data1}
                                  version="4"
                                  hover
                                  responsive
                                  keyField="id"
                                  pagination={true}
                                  remote
                                >
                                  <TableHeaderColumn dataField="referenceNo">
                                    {strings.InvoiceNumber}
                                  </TableHeaderColumn>

                                  <TableHeaderColumn
                                    dataField="date"
                                    dataFormat={date}
                                  >
                                    {strings.Date}
                                  </TableHeaderColumn>

                                  <TableHeaderColumn dataField="totalAount">
                                    {strings.InvoiceAmount}
                                  </TableHeaderColumn>
                                  <TableHeaderColumn dataField="dueAmount">
                                    {strings.AmountDue}
                                  </TableHeaderColumn>

                                  <TableHeaderColumn
                                    dataField="paidAmount"
                                    dataFormat={renderAmount}
                                  >
                                    {strings.Payment}
                                  </TableHeaderColumn>
                                </BootstrapTable>
                              </Row>
                              <Row>
                                <Col lg={12} className="mt-5">
                                  <FormGroup className="text-right">
                                    <Button
                                      type="submit"
                                      color="primary"
                                      className="btn-square mr-3"
                                      disabled={disabled}
                                    >
                                      <i className="fa fa-dot-circle-o"></i> {strings.Create}
                                    </Button>
                                    <Button
                                      type="button"
                                      color="secondary"
                                      className="btn-square"
                                      onClick={() => {
                                        history.push('/admin/income/receipt');
                                      }}
                                    >
                                      <i className="fa fa-ban"></i> {strings.Cancel}
                                    </Button>
                                  </FormGroup>
                                </Col>
                              </Row>
                            </div>
                          ) : (
                            <div>
                              There are no pending invoices for selected customer. Please
                              select different customer or create a new invoice to proceed
                              further.
                            </div>
                          )}
                        </div>
                      )}
                    </Form>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateReceipt);
