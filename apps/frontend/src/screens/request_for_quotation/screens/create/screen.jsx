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
import * as RequestForQuotationCreateAction from './actions';
import * as RequestForQuotationAction from '../../actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { SupplierModal } from '../../sections';
import { ProductModal } from '../../../customer_invoice/sections';
import { Textarea } from '@/components/ui/textarea';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { optionFactory, selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import './style.scss';
import { Switch } from '@/components/ui/switch';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import dayjs from '@/utils/date';
import { LeavePage, Loader } from 'components';
import invoiceimage from 'assets/images/invoice/invoice.png';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';

const strings = new LocalizedStrings(languageData);

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

// Zod validation schema (same as original)
const lineItemSchema = z.object({
  quantity: z
    .union([z.string(), z.number()])
    .refine(val => Number(val) > 0, 'Quantity should be greater than 0'),
  unitPrice: z
    .union([z.string(), z.number()])
    .refine(val => Number(val) > 0, 'Unit Price Should be Greater than 1'),
  vatCategoryId: z
    .union([z.string(), z.number()])
    .refine(val => val !== '' && val !== null, 'VAT is required'),
  productId: z
    .union([z.string(), z.number()])
    .refine(val => val !== '' && val !== null, 'Product is required'),
  description: z.string().optional(),
  exciseTaxId: z.any().optional(),
  discountType: z.string().optional(),
  discount: z.any().optional(),
  subTotal: z.number().optional(),
  vatAmount: z.number().optional(),
  exciseAmount: z.any().optional(),
  isExciseTaxExclusive: z.any().optional(),
  unitType: z.any().optional(),
  unitTypeId: z.any().optional(),
  id: z.number().optional(),
});

const createRequestForQuotationSchema = z
  .object({
    rfq_number: z.string().min(1, 'Invoice number is required'),
    supplierId: z
      .object({
        label: z.string(),
        value: z.any(),
      })
      .nullable()
      .refine(val => val !== null, 'Supplier is required'),
    rfqReceiveDate: z.date({
      required_error: 'Issue date is required',
      invalid_type_error: 'Issue date is required',
    }),
    rfqExpiryDate: z.date({
      required_error: 'Expiry date is required',
      invalid_type_error: 'Expiry date is required',
    }),
    placeOfSupplyId: z.any().optional(),
    currency: z.any().optional(),
    exchangeRate: z.any().optional(),
    notes: z.string().optional(),
    receiptNumber: z.string().optional(),
    receiptAttachmentDescription: z.string().optional(),
    attachmentFile: z.any().optional(),
    lineItemsString: z.array(lineItemSchema).min(1, 'Atleast one invoice sub detail is mandatory'),
    taxType: z.boolean().optional(),
    total_net: z.number().optional(),
    totalVatAmount: z.number().optional(),
    totalAmount: z.number().optional(),
    total_excise: z.number().optional(),
    discount: z.number().optional(),
  })
  .refine(
    data => {
      if (data.rfqReceiveDate && data.rfqExpiryDate) {
        return new Date(data.rfqReceiveDate) <= new Date(data.rfqExpiryDate);
      }
      return true;
    },
    {
      message: 'Expiry date should be later than the issue date',
      path: ['rfqExpiryDate'],
    }
  );

const CreateRequestForQuotation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    product_list,
    supplier_list,
    excise_list,
    currency_convert_list,
    product_category_list,
    country_list,
  } = useSelector(state => ({
    product_list: state.request_for_quotation.product_list,
    supplier_list: state.request_for_quotation.supplier_list,
    excise_list: state.request_for_quotation.excise_list,
    currency_convert_list: state.currencyConvert.currency_convert_list,
    product_category_list: state.product.product_category_list,
    country_list: state.request_for_quotation.country_list,
  }));

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
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
    },
  ]);
  const [idCount, setIdCount] = useState(0);
  const [taxType, setTaxType] = useState(false);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [supplier_currency_symbol, setSupplierCurrencySymbol] = useState('');
  const [vat_list, setVatList] = useState([
    { id: 1, vat: 5, name: 'STANDARD RATED TAX (5%) ' },
    { id: 2, vat: 0, name: 'ZERO RATED TAX (0%)' },
    { id: 3, vat: 0, name: 'EXEMPT' },
    { id: 4, vat: 0, name: 'OUT OF SCOPE' },
    { id: 10, vat: 0, name: 'N/A' },
  ]);

  const form = useForm({
    resolver: zodResolver(createRequestForQuotationSchema),
    defaultValues: {
      rfq_number: '',
      supplierId: null,
      rfqReceiveDate: new Date(),
      rfqExpiryDate: new Date(),
      lineItemsString: data,
      total_net: 0,
      totalVatAmount: 0,
      totalAmount: 0,
      total_excise: 0,
      taxType: false,
      discount: 0,
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
    dispatch(RequestForQuotationAction.getVatList()).then(res => {
      if (res.status === 200 && res.data) setVatList(res.data);
    });
    dispatch(RequestForQuotationCreateAction.getRfqNo()).then(res => {
      setValue('rfq_number', res.data.toString());
    });
    dispatch(RequestForQuotationAction.getSupplierList(1));
    dispatch(RequestForQuotationAction.getProductList());
  }, []);

  const addRow = useCallback(() => {
    const newRow = {
      id: idCount + 1,
      description: '',
      quantity: 1,
      unitPrice: '',
      vatCategoryId: '',
      subTotal: 0,
      exciseTaxId: '',
      exciseAmount: '',
      discountType: 'FIXED',
      vatAmount: 0,
      discount: 0,
      productId: '',
    };
    const newData = [...data, newRow];
    setData(newData);
    setIdCount(idCount + 1);
    setValue('lineItemsString', newData);
  }, [data, idCount, setValue]);

  const deleteRow = (e, row) => {
    e.preventDefault();
    const newData = data.filter(obj => obj.id !== row.id);
    setData(newData);
    setValue('lineItemsString', newData);
  };

  const columns = useMemo(
    () => [
      {
        id: 'actions',
        header: '',
        size: 50,
        cell: ({ row }) =>
          row.original.productId !== '' && (
            <Button
              size="sm"
              className="btn-twitter btn-brand icon"
              disabled={data.length === 1}
              onClick={e => deleteRow(e, row.original)}
            >
              <i className="fas fa-trash"></i>
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
                onChange={e => {
                  if (e && e.label !== 'Select Product') {
                    // Logic to update row and add new row
                    addRow();
                  }
                }}
                value={
                  product_list &&
                  selectOptionsFactory
                    .renderOptions('name', 'id', product_list, 'Product')
                    .find(option => option.value === +row.original.productId)
                }
                placeholder={strings.Select + strings.Product}
              />
              {row.original.productId !== '' && (
                <Input
                  className="mt-1"
                  type="text"
                  value={row.original.description || ''}
                  placeholder={strings.Description}
                />
              )}
            </>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: strings.QUANTITY,
        cell: ({ row }) => <Input type="number" value={row.original.quantity || 0} />,
      },
      {
        accessorKey: 'unitPrice',
        header: strings.UNITPRICE,
        cell: ({ row }) => <Input type="number" value={row.original.unitPrice || 0} />,
      },
      {
        accessorKey: 'vatCategoryId',
        header: strings.VAT,
        cell: ({ row }) => (
          <Select
            options={
              vat_list ? selectOptionsFactory.renderOptions('name', 'id', vat_list, 'VAT') : []
            }
            placeholder={strings.Select + strings.VAT}
          />
        ),
      },
      {
        accessorKey: 'vatAmount',
        header: strings.VATAMOUNT,
        cell: ({ row }) => <div className="text-right">{row.original.vatAmount || 0}</div>,
      },
      {
        accessorKey: 'subTotal',
        header: strings.SUBTOTAL,
        cell: ({ row }) => <div className="text-right">{row.original.subTotal || 0}</div>,
      },
    ],
    [data, product_list, vat_list]
  );

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="create-request-for-quotation-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <div className="h4 mb-0 d-flex align-items-center">
              <i className="fas fa-address-book" />
              <span className="ml-2">{strings.Create + ' ' + strings.RequestForQuotation}</span>
            </div>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit(() => {})}>
              {/* Other Form Fields ... */}
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

export default connect()(CreateRequestForQuotation);
