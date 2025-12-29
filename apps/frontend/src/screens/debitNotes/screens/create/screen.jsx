import { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardBody, Button, Form, Input } from 'components/migration';
import Select from 'react-select';
import { LeavePage, Loader, ProductTableCalculation } from 'components';
import * as DebitNoteCreateActions from './actions';
import * as DebitNoteActions from '../../actions';
import * as ProductActions from '../../../product/actions';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import { Textarea } from '@/components/ui/textarea';
import './style.scss';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trash2, CreditCard } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

// Zod validation schema (same as original)
const createDebitNoteSchema = z.object({
  debitNoteNumber: z.string().min(1, 'Debit Note Number is required'),
  contactId: z.union([
    z.string().min(1, 'Supplier Name is required'),
    z.object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    }),
  ]),
  debitNoteDate: z.union([z.date(), z.string()]).refine(val => val !== null && val !== '', {
    message: 'Debit Note Date is required',
  }),
  invoiceNumber: z
    .union([
      z.string(),
      z.object({
        value: z.union([z.string(), z.number()]),
        label: z.string(),
      }),
    ])
    .optional(),
  lineItemsString: z.array(z.any()).optional(),
  debitAmount: z.union([z.string(), z.number()]).optional(),
  referenceNumber: z.string().optional(),
  contact_po_number: z.string().optional(),
  currency: z.any().optional(),
  exchangeRate: z.union([z.string(), z.number()]).optional(),
  taxType: z.boolean().optional(),
  totalNet: z.number().optional(),
  invoiceVATAmount: z.number().optional(),
  totalVatAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  isReverseChargeEnabled: z.boolean().optional(),
  notes: z.string().optional(),
  email: z.string().optional(),
  totalDiscount: z.number().optional(),
  discountPercentage: z.string().optional(),
  discountType: z.string().optional(),
  total_excise: z.number().optional(),
  customer_currency_symbol: z.string().optional(),
  taxTreatmentId: z.any().optional(),
  receiptAttachmentDescription: z.string().optional(),
  remainingInvoiceAmount: z.any().optional(),
});

const CreateDebitNote = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    currency_list,
    invoice_list,
    tax_treatment_list,
    vat_list,
    customer_list,
    excise_list,
    product_list,
    company_details,
    currency_convert_list,
  } = useSelector(state => ({
    currency_list: state.debit_notes.currency_list,
    invoice_list: state.debit_notes.invoice_list,
    tax_treatment_list: state.common.tax_treatment_list,
    vat_list: state.common.vat_list,
    customer_list: state.common.customer_list,
    excise_list: state.common.excise_list,
    product_list: state.common.product_list,
    company_details: state.common.company_details,
    currency_convert_list: state.common.currency_convert_list,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [customer_currency_symbol, setCustomerCurrencySymbol] = useState('');
  const [data, setData] = useState([
    {
      id: 0,
      description: '',
      quantity: 1,
      unitPrice: '',
      vatCategoryId: '',
      exciseTaxId: '',
      exciseAmount: '',
      subTotal: 0,
      vatAmount: 0,
      productId: '',
      isExciseTaxExclusive: '',
      discountType: 'FIXED',
      discount: 0,
      unitType: '',
      unitTypeId: '',
    },
  ]);
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [remainingInvoiceAmount, setRemainingInvoiceAmount] = useState('');
  const [invoiceSelected, setInvoiceSelected] = useState(false);
  const [isDNWIWithoutProduct, setIsDNWIWithoutProduct] = useState(false);
  const [lockInvoiceDetail, setLockInvoiceDetail] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [taxType, setTaxType] = useState(false);
  const [isReverseChargeEnabled, setIsReverseChargeEnabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(createDebitNoteSchema),
    defaultValues: {
      invoiceNumber: '',
      receiptAttachmentDescription: '',
      referenceNumber: '',
      contact_po_number: '',
      currency: '',
      debitNoteDate: new Date(),
      contactId: '',
      exchangeRate: 1,
      lineItemsString: data,
      taxType: false,
      debitNoteNumber: '',
      totalNet: 0,
      invoiceVATAmount: 0,
      totalVatAmount: 0,
      totalAmount: 0,
      isReverseChargeEnabled: false,
      notes: '',
      email: '',
      totalDiscount: 0,
      discountPercentage: '',
      discountType: 'FIXED',
      debitAmount: '',
      total_excise: 0,
      customer_currency_symbol: '',
      taxTreatmentId: '',
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

  useEffect(() => {
    strings.setLanguage(language);
    getInitialData();
  }, [language]);

  const getInitialData = () => {
    dispatch(DebitNoteCreateActions.getInvoiceNo()).then(res => {
      if (res.status === 200) {
        setValue('debitNoteNumber', res.data);
      }
    });
    dispatch(CommonActions.getTaxTreatmentList());
    dispatch(DebitNoteActions.getInvoiceListForDropdown());
    dispatch(CommonActions.getCustomerList(1));
    dispatch(DebitNoteActions.getCountryList());
    dispatch(ProductActions.getProductCategoryList());

    dispatch(ProductActions.getTransactionCategoryListForPurchaseProduct('10')).then(res => {
      if (res.status === 200) setPurchaseCategory(res.data);
    });

    dispatch(CommonActions.getVatList());
    dispatch(CommonActions.getProductList());
    dispatch(CommonActions.getExciseList());
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
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'productId',
        header: strings.PRODUCT,
        size: 300,
        cell: ({ row }) => {
          const idx = data.findIndex(obj => obj.id === row.original.id);
          return (
            <>
              <Select
                options={
                  product_list
                    ? selectOptionsFactory.renderOptions('name', 'id', product_list, 'Product')
                    : []
                }
                isDisabled={true}
                value={
                  product_list &&
                  selectOptionsFactory
                    .renderOptions('name', 'id', product_list, 'Product')
                    .find(option => option.value === +row.original.productId)
                }
              />
              <div className="mt-1">
                <Textarea
                  disabled
                  value={row.original.description || ''}
                  placeholder={strings.Description}
                />
              </div>
            </>
          );
        },
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
                .find(option => option.value === +row.original.vatCategoryId)
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
    <div className="create-customer-invoice-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <div className="h4 mb-0 d-flex align-items-center">
              <CreditCard className="h-4 w-4" />
              <span className="ml-2">{strings.CreateDebitNote}</span>
            </div>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit(() => {})}>
              {/* Form Rows ... */}
              <hr />
              <DataTable data={data} columns={columns} manualPagination={false} />
              {/* Totals and Buttons ... */}
            </Form>
          </CardBody>
        </Card>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect()(CreateDebitNote);
