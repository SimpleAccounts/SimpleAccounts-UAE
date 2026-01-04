import { useState, useEffect, useRef, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
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
import { selectOptionsFactory, selectStyles } from 'utils';
import DatePicker from 'react-datepicker';
import dayjs from '@/utils/date';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import * as PaymentActions from '../../actions';
import * as CreatePaymentActions from './actions';
import * as SupplierInvoiceActions from '../../../supplier_invoice/actions';
import { CommonActions } from 'services/global';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { LeavePage, Loader } from 'components';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { Wallet } from '@/components/icons';

const strings = new LocalizedStrings(languageData);

// Zod validation schema
const createPaymentSchema = z.object({
  contactId: z
    .object({
      label: z.string(),
      value: z.number(),
    })
    .nullable()
    .refine(val => val !== null, 'Supplier is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^[0-9]+([,.][0-9]+)?$/, 'Please enter valid amount.'),
  paymentNo: z.number().optional(),
  paymentDate: z.date({ required_error: 'Payment date is required' }),
  payMode: z
    .object({
      label: z.string(),
      value: z.number(),
    })
    .nullable()
    .refine(val => val !== null, 'Payment mode is required'),
  notes: z.string().optional(),
  depositeTo: z
    .object({
      label: z.string(),
      value: z.number(),
    })
    .nullable()
    .refine(val => val !== null, 'Deposit to is required'),
  paidInvoiceListStr: z.array(z.any()).min(1, 'Please select atleast one invoice'),
  deleteFlag: z.boolean().optional(),
  referenceCode: z.string().optional(),
});

const CreatePayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { supplier_list, invoice_list, deposit_list, pay_mode } = useSelector(state => ({
    supplier_list: state.payment.supplier_list,
    invoice_list: state.payment.invoice_list,
    deposit_list: state.supplier_invoice.deposit_list,
    pay_mode: state.supplier_invoice.pay_mode,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [data1, setData1] = useState([]);
  const [paidInvoiceListStr, setPaidInvoiceListStr] = useState([]);
  const [contactType] = useState(1);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [fileName, setFileName] = useState('');
  const uploadFile = useRef(null);

  const form = useForm({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      contactId: null,
      amount: '',
      paymentNo: 1,
      paymentDate: new Date(),
      payMode: null,
      notes: '',
      depositeTo: null,
      paidInvoiceListStr: [],
      deleteFlag: true,
      referenceCode: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const contactId = watch('contactId');

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language]);

  const initializeData = () => {
    dispatch(PaymentActions.getSupplierContactList(contactType));
    dispatch(PaymentActions.getSupplierInvoiceList());
    dispatch(SupplierInvoiceActions.getDepositList());
    dispatch(SupplierInvoiceActions.getPaymentMode());
  };

  const handleRowSelectionChange = rows => {
    const tempList = rows;
    const totalAmount = tempList.reduce((acc, val) => acc + (val.totalAount || 0), 0);

    setPaidInvoiceListStr(tempList);
    setValue('paidInvoiceListStr', tempList, { shouldValidate: true });
    setValue('amount', totalAmount.toString(), { shouldValidate: true });
  };

  const getList = id => {
    dispatch(CreatePaymentActions.getList(id))
      .then(res => {
        if (res.status === 200) {
          const totalAmount = res.data.reduce((acc, val) => acc + (val.totalAount || 0), 0);
          setData1(res.data);
          setValue('amount', totalAmount.toString(), { shouldValidate: true });
        }
      })
      .catch(err => {
        dispatch(
          CommonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          )
        );
      });
  };

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const onSubmit = data => {
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
    } = data;

    let formData = new FormData();
    formData.append('paymentNo', paymentNo !== null ? paymentNo : '');
    formData.append('paymentDate', paymentDate);
    formData.append('amount', amount !== null ? amount : '');
    formData.append('deleteFlag', deleteFlag !== null ? deleteFlag : '');
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
    if (uploadFile?.current?.files?.[0]) {
      formData.append('attachmentFile', uploadFile?.current?.files?.[0]);
    }

    dispatch(CreatePaymentActions.createPayment(formData))
      .then(res => {
        dispatch(CommonActions.tostifyAlert('success', 'Payment Created Successfully.'));
        if (createMore) {
          setCreateMore(false);
          reset();
          setData1([]);
          setPaidInvoiceListStr([]);
          setFileName('');
        } else {
          navigate('/admin/expense/payment');
        }
      })
      .catch(err => {
        setDisableLeavePage(true);
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

  let tmpSupplier_list = [];
  supplier_list.forEach(item => {
    let obj = { label: item.label.contactName, value: item.value };
    tmpSupplier_list.push(obj);
  });

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="create-payment-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <Card>
              <CardHeader>
                <div className="h4 mb-0 d-flex align-items-center">
                  <Wallet className="h-4 w-4" />
                  <span className="ml-2">{strings.CreatePurchaseReceipt} </span>
                </div>
              </CardHeader>
              <CardBody>
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
                              styles={selectStyles}
                              id="contactId"
                              options={
                                tmpSupplier_list
                                  ? selectOptionsFactory.renderOptions(
                                      'label',
                                      'value',
                                      tmpSupplier_list,
                                      'Supplier Name'
                                    )
                                  : []
                              }
                              onChange={option => {
                                field.onChange(option);
                                if (option && option.value) {
                                  getList(option.value);
                                }
                              }}
                              className={errors.contactId ? 'is-invalid' : ''}
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
                                  {strings.AmountPaid}
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
                                <Label htmlFor="paymentDate">
                                  <span className="text-danger">* </span>
                                  {strings.PaymentDate}
                                </Label>
                                <Controller
                                  name="paymentDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      id="paymentDate"
                                      selected={field.value}
                                      onChange={field.onChange}
                                      dateFormat="dd-MM-yyyy"
                                      className={`form-control ${errors.paymentDate ? 'is-invalid' : ''}`}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label>
                                  <span className="text-danger">* </span> {strings.PaymentMode}
                                </Label>
                                <Controller
                                  name="payMode"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      styles={selectStyles}
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
                                      id="payMode"
                                      className={errors.payMode ? 'is-invalid' : ''}
                                    />
                                  )}
                                />
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
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      styles={selectStyles}
                                      options={deposit_list}
                                      id="depositeTo"
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
                              <Button type="submit" color="primary" className="btn-square mr-3">
                                {strings.Create}
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => navigate('/admin/expense/payment')}
                              >
                                {strings.Cancel}
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          There are no pending invoices for selected supplier.
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
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect()(CreatePayment);
