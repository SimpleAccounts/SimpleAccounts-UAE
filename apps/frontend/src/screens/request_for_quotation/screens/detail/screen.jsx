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
} from 'components/migration';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as RequestForQuotationDetailsAction from './actions';
import * as RequestForQuotationAction from '../../actions';
import * as ProductActions from '../../../product/actions';
import { SupplierModal } from '../../sections';
import { ProductModal } from '../../../customer_invoice/sections';
import { Loader, ConfirmDeleteModal, LeavePage } from 'components';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory, selectCurrencyFactory, selectStyles } from 'utils';
import { Textarea } from '@/components/ui/textarea';
import './style.scss';
import dayjs from '@/utils/date';
import { Switch } from '@/components/ui/switch';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trash2, BookUser } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

// Zod validation schema (same as original)
const lineItemSchema = z.object({
  quantity: z
    .union([z.string(), z.number()])
    .refine(val => Number(val) > 0, 'Quantity should be greater than 0'),
  unitPrice: z
    .union([z.string(), z.number()])
    .refine(val => Number(val) > 0, 'Unit price should be greater than 1'),
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

const updateRequestForQuotationSchema = z.object({
  supplierId: z
    .union([
      z.object({
        label: z.string(),
        value: z.any(),
      }),
      z.string(),
      z.number(),
    ])
    .refine(val => val !== null && val !== '', 'Supplier is required'),
  rfqReceiveDate: z
    .union([z.date(), z.string()])
    .refine(val => val !== null && val !== '', 'Issue date is required'),
  rfqExpiryDate: z
    .union([z.date(), z.string()])
    .refine(val => val !== null && val !== '', 'Expiry due date is required'),
  placeOfSupplyId: z.any().optional(),
  currency: z.any().optional(),
  rfqNumber: z.string().optional(),
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
});

const DetailRequestForQuotation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { product_list, supplier_list, currency_convert_list } = useSelector(state => ({
    product_list: state.customer_invoice.product_list,
    supplier_list: state.request_for_quotation.supplier_list,
    currency_convert_list: state.currencyConvert.currency_convert_list,
  }));

  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [data, setData] = useState([]);
  const [idCount, setIdCount] = useState(0);
  const [taxType, setTaxType] = useState(false);
  const [supplier_currency_symbol, setSupplierCurrencySymbol] = useState('');
  const [vat_list, setVatList] = useState([]);
  const [current_rfq_id, setCurrentRfqId] = useState(null);

  const form = useForm({
    resolver: zodResolver(updateRequestForQuotationSchema),
    defaultValues: {
      rfqNumber: '',
      supplierId: '',
      rfqReceiveDate: '',
      rfqExpiryDate: '',
      lineItemsString: [],
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
    reset,
  } = form;

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    if (location.state && location.state.id) {
      dispatch(RequestForQuotationDetailsAction.getRFQeById(location.state.id)).then(res => {
        if (res.status === 200) {
          const r = res.data;
          const lineItems = r.poQuatationLineItemRequestModelList || [];
          setCurrentRfqId(location.state.id);
          setData(lineItems);
          setTaxType(r.taxType || false);
          setSupplierCurrencySymbol(r.currencyCode || '');
          reset({
            ...r,
            rfqReceiveDate: r.rfqReceiveDate ? new Date(r.rfqReceiveDate) : '',
            rfqExpiryDate: r.rfqExpiryDate ? new Date(r.rfqExpiryDate) : '',
            lineItemsString: lineItems,
          });
          setLoading(false);
        }
      });
    }
  };

  const selectItem = (value, row, fieldName, idx) => {
    const newData = data.map(obj => {
      if (obj.id === row.id) {
        return { ...obj, [fieldName]: value };
      }
      return obj;
    });
    setData(newData);
    setValue(`lineItemsString.${idx}.${fieldName}`, value);
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
              onClick={e => {
                const newData = data.filter(obj => obj.id !== row.original.id);
                setData(newData);
                setValue('lineItemsString', newData);
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
                <Input
                  type="text"
                  value={row.original.description || ''}
                  onChange={e => selectItem(e.target.value, row.original, 'description', idx)}
                  placeholder={strings.Description}
                />
              </div>
            </>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: strings.QUANTITY,
        cell: ({ row }) => {
          const idx = data.findIndex(obj => obj.id === row.original.id);
          return (
            <Input
              type="number"
              value={row.original.quantity || 0}
              onChange={e => selectItem(e.target.value, row.original, 'quantity', idx)}
            />
          );
        },
      },
      {
        accessorKey: 'unitPrice',
        header: strings.UNITPRICE,
        cell: ({ row }) => {
          const idx = data.findIndex(obj => obj.id === row.original.id);
          return (
            <Input
              type="number"
              value={row.original.unitPrice || 0}
              onChange={e => selectItem(e.target.value, row.original, 'unitPrice', idx)}
            />
          );
        },
      },
      {
        accessorKey: 'subTotal',
        header: strings.SUBTOTAL,
        cell: ({ row }) => (
          <div className="text-right">
            {supplier_currency_symbol} {row.original.subTotal?.toFixed(2)}
          </div>
        ),
      },
    ],
    [data, product_list, supplier_currency_symbol]
  );

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="detail-supplier-invoice-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <div className="h4 mb-0 d-flex align-items-center">
              <BookUser className="h-4 w-4" />
              <span className="ml-2">{strings.Update + ' ' + strings.RequestForQuotation}</span>
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

export default connect()(DetailRequestForQuotation);
