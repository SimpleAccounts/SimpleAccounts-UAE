import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardBody, Button, Form, Input } from 'components/migration';
import Select from 'react-select';
import { LeavePage, Loader } from 'components';
import * as GoodsReceivedNoteCreateAction from './actions';
import * as GoodsReceivedNoteAction from '../../actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import invoiceimage from 'assets/images/invoice/invoice.png';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

// Zod validation schema
const createGoodsReceivedNoteSchema = z.object({
  grn_Number: z.string().min(1, 'GRN number is required'),
  supplierId: z
    .object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    })
    .nullable()
    .refine(val => val !== null && val !== undefined, 'Supplier is required'),
  grnReceiveDate: z
    .union([z.string(), z.date()])
    .refine(val => val !== null && val !== '', 'Order date is required'),
  rfqExpiryDate: z
    .union([z.string(), z.date()])
    .refine(val => val !== null && val !== '', 'Order due date is required'),
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
  poNumber: z
    .object({
      value: z.union([z.string(), z.number()]),
      label: z.string(),
    })
    .nullable()
    .optional(),
  grnRemarks: z.string().optional(),
  supplierReferenceNumber: z.string().optional(),
  currency: z.union([z.string(), z.number()]).optional(),
  receiptAttachmentDescription: z.string().optional(),
});

const CreateGoodsReceivedNote = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    contact_list,
    currency_list,
    vat_list,
    product_list,
    supplier_list,
    currency_convert_list,
    universal_currency_list,
    po_list,
    country_list,
    product_category_list,
  } = useSelector(state => ({
    contact_list: state.goods_received_note.contact_list,
    currency_list: state.goods_received_note.currency_list,
    vat_list: state.goods_received_note.vat_list,
    product_list: state.goods_received_note.product_list,
    supplier_list: state.goods_received_note.supplier_list,
    country_list: state.goods_received_note.country_list,
    product_category_list: state.product.product_category_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.currencyConvert.currency_convert_list,
    po_list: state.goods_received_note.po_list,
  }));

  const [supplierCurrencySymbol, setSupplierCurrencySymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [data, setData] = useState([
    {
      id: 0,
      description: '',
      quantity: 1,
      unitPrice: '',
      grnReceivedQuantity: '',
      vatCategoryId: '',
      exciseTaxId: '',
      exciseAmount: '',
      subTotal: 0,
      vatAmount: 0,
      productId: '',
      isExciseTaxExclusive: '',
      unitType: '',
      unitTypeId: '',
    },
  ]);
  const [idCount, setIdCount] = useState(0);
  const [contactType] = useState(1);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [fileName, setFileName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [salesCategory, setSalesCategory] = useState([]);
  const [exist, setExist] = useState(false);
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [supplierCurrency, setSupplierCurrency] = useState('');
  const [supplierCurrencyDes, setSupplierCurrencyDes] = useState('');
  const [basecurrency, setBasecurrency] = useState([]);

  const uploadFileRef = useRef(null);
  const regEx = /^[0-9\b]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
  const regExInvNum = /[a-zA-Z0-9-/]+$/;

  const form = useForm({
    resolver: zodResolver(createGoodsReceivedNoteSchema),
    defaultValues: {
      contact_po_number: '',
      currencyCode: '',
      grnReceiveDate: new Date(),
      rfqExpiryDate: new Date(),
      supplierId: null,
      placeOfSupplyId: '',
      project: '',
      exchangeRate: '',
      poNumber: null,
      lineItemsString: data,
      grn_Number: '',
      total_net: 0,
      totalAmount: 0,
      invoiceVATAmount: 0,
      term: '',
      grnRemarks: '',
      discount: 0,
      discountPercentage: 0,
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
  } = form;

  useEffect(() => {
    strings.setLanguage(language);
    getInitialData();
  }, [language]);

  // ... (Keep initializeData, addRow, selectItem, updateAmount, prductValue, deleteRow logic)

  const getInitialData = useCallback(() => {
    // dispatch ...
    dispatch(GoodsReceivedNoteCreateAction.getInvoiceNo()).then(res => {
      if (res.status === 200) {
        setValue('grn_Number', res.data);
      }
    });
    dispatch(GoodsReceivedNoteAction.getSupplierList(contactType));
    dispatch(GoodsReceivedNoteAction.getPurchaseOrderListForDropdown());
    dispatch(CurrencyConvertActions.getCurrencyConversionList());
    dispatch(GoodsReceivedNoteAction.getVatList());
    dispatch(GoodsReceivedNoteAction.getCountryList());
    dispatch(GoodsReceivedNoteAction.getProductList());
    dispatch(ProductActions.getProductCategoryList());
    dispatch(CommonActions.getCompanyCurrency());
  }, []);

  const addRow = () => {
    const newData = [...data];
    const newRow = {
      id: idCount + 1,
      description: '',
      quantity: 1,
      grnReceivedQuantity: '',
      poQuantity: 1,
      unitPrice: '',
      vatCategoryId: '',
      subTotal: 0,
      productId: '',
      unitType: '',
      unitTypeId: '',
    };
    newData.push(newRow);
    setData(newData);
    setIdCount(idCount + 1);
    setValue('lineItemsString', newData);
  };

  const selectItem = (value, row, name, idx) => {
    const newData = [...data];
    const itemIndex = newData.findIndex(obj => obj.id === row.id);
    if (itemIndex !== -1) {
      newData[itemIndex][name] = value;
      setData(newData);
      setValue(`lineItemsString.${idx}.${name}`, value);
      // ... (updateAmount calls if needed)
    }
  };

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
              onClick={e => deleteRow(e, row.original)}
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
                onChange={e => {
                  if (e && e.label !== 'Select Product') {
                    selectItem(e.value, row.original, 'productId', idx);
                    // prductValue logic ...
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
                  onChange={e => selectItem(e.target.value, row.original, 'description', idx)}
                  placeholder={strings.Description}
                />
              )}
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
        cell: ({ row }) => <Input type="number" disabled value={row.original.quantity || 0} />,
      },
    ],
    [data, product_list]
  );

  // ... (onSubmit, etc.)

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="create-supplier-invoice-screen">
      <div className="fadeIn">
        <Card>
          <CardHeader>
            <div className="h4 mb-0 d-flex align-items-center">
              <img alt="invoiceimage" src={invoiceimage} style={{ width: '40px' }} />
              <span className="ml-2">{strings.CreateGoodsReceivedNote}</span>
            </div>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit(() => {})}>
              {/* Form Rows ... */}
              <hr />

              <DataTable data={data} columns={columns} manualPagination={false} />

              {/* Action Buttons ... */}
            </Form>
          </CardBody>
        </Card>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect()(CreateGoodsReceivedNote);
