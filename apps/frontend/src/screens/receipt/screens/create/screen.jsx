import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
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
import { CommonActions } from 'services/global';
import { selectOptionsFactory, selectStyles } from 'utils';
import * as ReceiptActions from '../../actions';
import * as ReceiptCreateActions from './actions';
import * as CustomerInvoiceActions from '../../../customer_invoice/actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import dayjs from '@/utils/date';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { LeavePage, Loader } from 'components';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { File } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

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
    .refine(val => val !== null, 'Customer is required'),
  depositeTo: z
    .object({
      value: z.union([z.number(), z.string()]),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Deposit to is required'),
  payMode: z
    .object({
      value: z.union([z.number(), z.string()]),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null, 'Payment mode is required'),
  paidInvoiceListStr: z.array(z.any()).min(1, 'Please select atleast one invoice'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^[0-9]+([,.][0-9]+)?$/, 'Please enter valid amount.'),
  receiptNo: z.union([z.number(), z.string()]).optional(),
  fileName: z.string().optional(),
  notes: z.string().optional(),
  referenceCode: z.string().optional(),
  attachmentFile: z.any().optional(),
});

const CreateReceipt = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { contact_list, deposit_list, pay_mode } = useSelector(state => ({
    contact_list: state.receipt.contact_list,
    deposit_list: state.customer_invoice.deposit_list,
    pay_mode: state.customer_invoice.pay_mode,
  }));

  const [language] = useState(window['localStorage'].getItem('language') || 'en');
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
    reset,
  } = form;

  const contactId = watch('contactId');

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language]);

  const initializeData = () => {
    dispatch(ReceiptActions.getContactList(2));
    dispatch(CustomerInvoiceActions.getDepositList());
    dispatch(CustomerInvoiceActions.getPaymentMode());
  };

  const handleRowSelectionChange = rows => {
    const tempList = rows;
    const totalAmount = tempList.reduce((acc, val) => acc + (val.totalAount || 0), 0);

    setPaidInvoiceListStr(tempList);
    setValue('paidInvoiceListStr', tempList, { shouldValidate: true });
    setValue('amount', totalAmount.toString(), { shouldValidate: true });
  };

  const getList = id => {
    dispatch(ReceiptCreateActions.getList(id))
      .then(res => {
        if (res.status === 200) {
          const totalAmount = res.data.reduce((acc, val) => acc + (val.totalAount || 0), 0);
          setData1(res.data);
          setValue('amount', totalAmount.toString(), { shouldValidate: true });
        }
      })
      .catch(() => {
        toast.error('Something Went Wrong');
      });
  };

  const handleFileChange = (e, onChange) => {
    e.preventDefault();
    let file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };

  const onSubmit = data => {
    setDisabled(true);
    setDisableLeavePage(true);

    const { receiptNo, receiptDate, contactId, amount, depositeTo, payMode, notes, referenceCode } =
      data;

    let formData = new FormData();
    formData.append('receiptNo', receiptNo !== null ? receiptNo : '');
    formData.append('receiptDate', receiptDate);
    formData.append('amount', amount !== null ? amount : '');
    formData.append('notes', notes !== null ? notes : '');
    formData.append('referenceCode', referenceCode !== null ? referenceCode : '');
    formData.append('paidInvoiceListStr', JSON.stringify(paidInvoiceListStr));
    formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
    if (payMode) {
      formData.append('payMode', payMode.value);
    }
    if (contactId) {
      formData.append('contactId', contactId.value);
    }
    if (uploadFile.current?.files?.[0]) {
      formData.append('attachmentFile', uploadFile.current?.files?.[0]);
    }

    dispatch(ReceiptCreateActions.createReceipt(formData))
      .then(() => {
        toast.success('Payment Recorded Successfully');
        navigate('/admin/income/receipt');
      })
      .catch(() => {
        setDisabled(false);
        setLoading(false);
      });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'referenceNo',
        header: strings.InvoiceNumber,
      },
      {
        accessorKey: 'date',
        header: strings.Date,
        cell: ({ getValue }) => dayjs(getValue()).format('DD-MM-YYYY'),
      },
      {
        accessorKey: 'totalAount',
        header: strings.InvoiceAmount,
      },
      {
        accessorKey: 'dueAmount',
        header: strings.AmountDue,
      },
      {
        accessorKey: 'paidAmount',
        header: strings.Payment,
        cell: ({ row }) => (
          <Input
            type="number"
            min="0"
            readOnly
            value={row.original.totalAount}
            className="form-control"
          />
        ),
      },
    ],
    []
  );

  let tmpContact_list = [];
  contact_list.forEach(item => {
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
                <div className="h4 mb-0 d-flex align-items-center">
                  <File className="h-4 w-4" />
                  <span className="ml-2">{strings.CreateIncomeReciept}</span>
                </div>
              </CardHeader>
              <CardBody>
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
                              onChange={option => {
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
                                      id="amount"
                                      placeholder={strings.Amount}
                                      className={errors.amount ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
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
                                      id="date"
                                      selected={field.value}
                                      onChange={field.onChange}
                                      dateFormat="dd-MM-yyyy"
                                      className={`form-control ${errors.receiptDate ? 'is-invalid' : ''}`}
                                    />
                                  )}
                                />
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
                                      styles={selectStyles}
                                      className={errors.payMode ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
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
                                      styles={selectStyles}
                                      options={deposit_list}
                                      className={errors.depositeTo ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <hr />

                          <DataTable
                            data={data1 || []}
                            columns={columns}
                            manualPagination={false}
                            rowSelection={true}
                            onRowSelectionChange={handleRowSelectionChange}
                          />

                          <Row className="mt-5">
                            <Col lg={12} className="text-right">
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                              >
                                {strings.Create}
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => navigate('/admin/income/receipt')}
                              >
                                {strings.Cancel}
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          There are no pending invoices for selected customer.
                        </div>
                      )}
                    </div>
                  )}
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default connect()(CreateReceipt);
