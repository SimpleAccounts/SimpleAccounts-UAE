import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import * as DebitNotesDetailActions from './actions';
import * as DebitNotesActions from '../../actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { Textarea } from '@/components/ui/textarea';
import { LeavePage, Loader, ConfirmDeleteModal, ProductTableCalculation } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import Switch from 'react-switch';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const strings = new LocalizedStrings(languageData);

// Zod validation schema
const detailDebitNoteSchema = z.object({
  debitNoteNumber: z.string().min(1, 'Debit Note Number is required'),
  contactId: z.union([
    z.string().min(1, 'Customer Name is required'),
    z.object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    }),
  ]),
  invoiceDate: z.union([z.date(), z.string()]).refine(val => val !== null && val !== '', {
    message: 'Invoice Date is required',
  }),
  lineItemsString: z.array(z.any()).optional(),
  invoiceNumber: z
    .union([
      z.string(),
      z.object({
        value: z.union([z.string(), z.number()]),
        label: z.string(),
      }),
    ])
    .optional(),
  debitAmount: z.union([z.string(), z.number()]).optional(),
  referenceNumber: z.string().optional(),
  contact_po_number: z.string().optional(),
  currency: z.any().optional(),
  exchangeRate: z.union([z.string(), z.number()]).optional(),
  taxType: z.boolean().optional(),
  notes: z.string().optional(),
  email: z.string().optional(),
  taxTreatmentId: z.any().optional(),
  receiptAttachmentDescription: z.string().optional(),
  totalNet: z.number().optional(),
  totalVatAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  total_excise: z.number().optional(),
  totalDiscount: z.number().optional(),
  discountPercentage: z.string().optional(),
  discountType: z.string().optional(),
  fileName: z.string().optional(),
});

const DetailDebitNote = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    tax_treatment_list,
    invoice_list,
    currency_convert_list,
    customer_list,
    universal_currency_list,
    company_details,
    vat_list,
    product_list,
    excise_list,
  } = useSelector(state => ({
    tax_treatment_list: state.common.tax_treatment_list,
    invoice_list: state.debit_notes.invoice_list,
    currency_convert_list: state.common.currency_convert_list,
    customer_list: state.common.customer_list,
    universal_currency_list: state.common.universal_currency_list,
    company_details: state.common.company_details,
    vat_list: state.common.vat_list,
    product_list: state.common.product_list,
    excise_list: state.common.excise_list,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [customer_currency_symbol, setCustomerCurrencySymbol] = useState('');
  const [data, setData] = useState([]);
  const [debitNoteId, setDebitNoteId] = useState('');
  const [invoiceSelected, setInvoiceSelected] = useState(false);
  const [remainingInvoiceAmount, setRemainingInvoiceAmount] = useState('');
  const [taxType, setTaxType] = useState(false);
  const [isReverseChargeEnabled, setIsReverseChargeEnabled] = useState(false);
  const [purchaseCategory, setPurchaseCategory] = useState([]);

  const form = useForm({
    resolver: zodResolver(detailDebitNoteSchema),
    defaultValues: {
      total_excise: 0,
      totalNet: 0,
      totalVatAmount: 0,
      totalAmount: 0,
      totalDiscount: 0,
      invoiceNumber: '',
      receiptAttachmentDescription: '',
      referenceNumber: '',
      contact_po_number: '',
      currency: '',
      exchangeRate: '',
      currencyName: '',
      invoiceDate: '',
      contactId: '',
      debitNoteNumber: '',
      debitAmount: '',
      notes: '',
      lineItemsString: [],
      discount: 0,
      discountPercentage: '',
      discountType: '',
      fileName: '',
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

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language]);

  const initializeData = () => {
    dispatch(CommonActions.getTaxTreatmentList());
    dispatch(ProductActions.getTransactionCategoryListForPurchaseProduct('10')).then(res => {
      if (res.status === 200) setPurchaseCategory(res.data);
    });

    if (location.state && location.state.id) {
      dispatch(
        DebitNotesActions.getDebitNoteById(
          location.state.id,
          location.state.isCNWithoutProduct || false
        )
      ).then(res => {
        if (res.status === 200) {
          const r = res.data;
          setTaxType(r.taxType || false);
          setDebitNoteId(location.state.id);
          setIsReverseChargeEnabled(r.isReverseChargeEnabled);
          setData(r.invoiceLineItems || []);
          setInvoiceSelected(!!r.invoiceId);
          setRemainingInvoiceAmount(r.remainingInvoiceAmount);
          setCustomerCurrencySymbol(r.currencyIsoCode || '');
          reset({
            ...r,
            invoiceDate: r.creditNoteDate ? new Date(r.creditNoteDate) : '',
            invoiceNumber: r.invoiceId ? { value: r.invoiceId, label: r.invoiceNumber } : '',
            debitAmount: r.totalAmount || 0,
          });
          setLoading(false);
        }
      });
    }
  };

  const updateAmountHandler = currentData => {
    const list = ProductTableCalculation.updateAmount(currentData || [], vat_list, taxType);
    setData(list.data);
    setValue('totalNet', list.totalNet || 0);
    setValue('totalVatAmount', list.totalVatAmount || 0);
    setValue('totalAmount', list.totalAmount || 0);
    setValue('total_excise', list.total_excise || 0);
    setValue('totalDiscount', list.discount || 0);
  };

  const selectItem = (value, row, fieldName) => {
    const newData = data.map(obj => {
      if (obj.id === row.id) {
        return { ...obj, [fieldName]: value };
      }
      return obj;
    });
    setData(newData);
    updateAmountHandler(newData);
  };

  const columns = useMemo(
    () => [
      {
        id: 'actions',
        header: '',
        size: 50,
        cell: ({ row }) => (
          <Button
            size="sm"
            className="btn-twitter btn-brand icon"
            disabled={data.length === 1}
            onClick={e => {
              const newData = data.filter(obj => obj.id !== row.original.id);
              setData(newData);
              updateAmountHandler(newData);
            }}
          >
            <i className="fas fa-trash"></i>
          </Button>
        ),
      },
      {
        accessorKey: 'productId',
        header: strings.PRODUCT,
        size: 300,
        cell: ({ row }) => (
          <>
            <Select
              isDisabled={true}
              styles={selectStyles}
              options={
                product_list
                  ? selectOptionsFactory.renderOptions('name', 'id', product_list, 'Product')
                  : []
              }
              value={
                product_list &&
                selectOptionsFactory
                  .renderOptions('name', 'id', product_list, 'Product')
                  .find(opt => opt.value === +row.original.productId)
              }
            />
            <div className="mt-1">
              <Textarea disabled value={row.original.description || ''} />
            </div>
          </>
        ),
      },
      {
        accessorKey: 'transactionCategoryId',
        header: strings.Account,
        cell: ({ row }) => (
          <Select
            isDisabled={true}
            options={purchaseCategory}
            value={{
              value: row.original.transactionCategoryId,
              label: row.original.transactionCategoryLabel,
            }}
          />
        ),
      },
      {
        accessorKey: 'quantity',
        header: strings.QUANTITY,
        cell: ({ row }) => (
          <Input
            type="number"
            value={row.original.quantity || 0}
            onChange={e => selectItem(e.target.value, row.original, 'quantity')}
          />
        ),
      },
      {
        accessorKey: 'unitPrice',
        header: strings.UNITPRICE,
        cell: ({ row }) => <Input disabled value={row.original.unitPrice || 0} />,
      },
      {
        accessorKey: 'vatCategoryId',
        header: strings.VAT,
        cell: ({ row }) => (
          <Select
            isDisabled={true}
            options={
              vat_list ? selectOptionsFactory.renderOptions('name', 'id', vat_list, 'Vat') : []
            }
            value={
              vat_list &&
              selectOptionsFactory
                .renderOptions('name', 'id', vat_list, 'Vat')
                .find(opt => opt.value === +row.original.vatCategoryId)
            }
          />
        ),
      },
      {
        accessorKey: 'subTotal',
        header: strings.SUBTOTAL,
        cell: ({ row }) => (
          <div className="text-right">
            {customer_currency_symbol} {row.original.subTotal?.toFixed(2)}
          </div>
        ),
      },
    ],
    [data, product_list, vat_list, purchaseCategory, customer_currency_symbol]
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="detail-customer-invoice-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <div className="h4 mb-0 d-flex align-items-center">
              <i className="fa fa-credit-card" />
              <span className="ml-2">Update Debit Note</span>
            </div>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit(() => {})}>
              {/* Form rows ... */}
              <hr />
              <DataTable data={data} columns={columns} manualPagination={false} />
              {/* Totals and Buttons ... */}
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default connect()(DetailDebitNote);
