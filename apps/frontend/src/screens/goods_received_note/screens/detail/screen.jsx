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
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as GoodsReceivedNoteDetailsAction from './actions';
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
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2, BookUser } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

// Zod validation schema (same as original)
const detailGoodsReceivedNoteSchema = z.object({
  attachmentFile: z.any().optional(),
  lineItemsString: z
    .array(
      z.object({
        grnReceivedQuantity: z.union([z.string(), z.number()]).refine(val => Number(val) > 0, {
          message: 'Quantity should be greater than 0',
        }),
        unitPrice: z.union([z.string(), z.number()]).refine(val => Number(val) > 0, {
          message: 'Unit price should be greater than 1',
        }),
        vatCategoryId: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== null, {
          message: 'Value is required',
        }),
        productId: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== null, {
          message: 'Product is required',
        }),
        description: z.string().optional(),
        quantity: z.union([z.string(), z.number()]).optional(),
        subTotal: z.union([z.string(), z.number()]).optional(),
        vatAmount: z.union([z.string(), z.number()]).optional(),
        exciseAmount: z.union([z.string(), z.number()]).optional(),
        exciseTaxId: z.union([z.string(), z.number()]).optional(),
        unitType: z.string().optional(),
        unitTypeId: z.union([z.string(), z.number()]).optional(),
        isExciseTaxExclusive: z.boolean().optional(),
      })
    )
    .min(1, 'Atleast one invoice sub detail is mandatory'),
});

const DetailGoodsReceivedNote = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { product_list, supplier_list, vat_list, currency_convert_list } = useSelector(state => ({
    product_list: state.customer_invoice.product_list,
    supplier_list: state.request_for_quotation.supplier_list,
    vat_list: state.request_for_quotation.vat_list,
    currency_convert_list: state.currencyConvert.currency_convert_list,
  }));

  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [data, setData] = useState([]);
  const [idCount, setIdCount] = useState(0);
  const [currentGrnId, setCurrentGrnId] = useState(null);
  const [supplierCurrency, setSupplierCurrency] = useState('');
  const [grnReceiveDate, setGrnReceiveDate] = useState('');
  const [poNumber, setPoNumber] = useState('');

  const form = useForm({
    resolver: zodResolver(detailGoodsReceivedNoteSchema),
    defaultValues: {
      grnReceiveDate: '',
      grnReceiveDate1: '',
      supplierId: '',
      grnNumber: '',
      totalVatAmount: 0,
      total_excise: 0,
      totalAmount: 0,
      total_net: 0,
      grnRemarks: '',
      lineItemsString: [],
      fileName: '',
      supplierReferenceNumber: '',
      poNumber: '',
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
      dispatch(GoodsReceivedNoteDetailsAction.getGRNById(location.state.id)).then(res => {
        if (res.status === 200) {
          const r = res.data;
          const lineItems = r.poQuatationLineItemRequestModelList || [];
          setCurrentGrnId(location.state.id);
          setData(lineItems);
          setPoNumber(r.poNumber || '');
          setGrnReceiveDate(r.grnReceiveDate || '');
          reset({
            ...r,
            grnReceiveDate: r.grnReceiveDate ? new Date(r.grnReceiveDate) : '',
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
        accessorKey: 'grnReceivedQuantity',
        header: strings.RECEIVEDQUANTITY,
        cell: ({ row }) => {
          const idx = data.findIndex(obj => obj.id === row.original.id);
          return (
            <Input
              type="number"
              value={row.original.grnReceivedQuantity || 0}
              onChange={e => selectItem(e.target.value, row.original, 'grnReceivedQuantity', idx)}
            />
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: strings.POQUANTITY,
        cell: ({ row }) => <Input disabled value={row.original.quantity || 0} />,
      },
    ],
    [data, product_list]
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
              <span className="ml-2">{strings.UpdateGoodsReceivedNote}</span>
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

export default connect()(DetailGoodsReceivedNote);
