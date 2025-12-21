import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  ButtonGroup,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import Select from 'react-select';
import { DataTable } from '@/components/ui/data-table';
import { Loader, ConfirmDeleteModal } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import * as PurchaseOrderAction from '../purchase_order/actions';
import * as PurchaseOrderDetailsAction from './screens/detail/actions';
import * as GoodsReceivedNoteCreateAction from '../goods_received_note/screens/create/actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import CreateGoodsReceivedNote from './sections/createGRN';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { upperCase } from 'lodash-es';
import { ToWords } from 'to-words';
import invoiceimage from 'assets/images/invoice/invoice.png';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Plus,
  Send,
  ArrowRightCircle,
  CheckCircle,
  Ban,
  Copy,
  Eye,
  XCircle,
  Search,
  RefreshCw,
} from 'lucide-react';

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    //   currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  },
});

const strings = new LocalizedStrings(languageData);

const PurchaseOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [openGoodsReceivedNotes, setOpenGoodsReceivedNotes] = useState(false);
  const [selectedData, setSelectedData] = useState({});
  const [filterData, setFilterData] = useState({
    supplierId: '',
    referenceNumber: '',
    invoiceDate: '',
    invoiceDueDate: '',
    amount: '',
    status: '',
    contactType: 1,
  });
  const [selectedRows, setSelectedRows] = useState({});
  const [actionButtons, setActionButtons] = useState({});
  const [prefixData, setPrefixData] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [rowId, setRowId] = useState(null);

  const { supplier_list, status_list, universal_currency_list, purchase_order_list } = useSelector(
    state => ({
      supplier_list: state.purchase_order.supplier_list,
      status_list: state.supplier_invoice.status_list,
      universal_currency_list: state.common.universal_currency_list,
      purchase_order_list: state.purchase_order.purchase_order_list,
    })
  );

  useEffect(() => {
    strings.setLanguage(language);
    dispatch(PurchaseOrderAction.getStatusList());
    dispatch(GoodsReceivedNoteCreateAction.getInvoiceNo()).then(response => {
      setPrefixData(response.data);
    });
    initializeData();
  }, [language]);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting, filterData]);

  const initializeData = () => {
    setLoading(true);
    const postData = {
      ...filterData,
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    dispatch(PurchaseOrderAction.getpoList(postData))
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
          // if (location.state && location.state.id) {
          // 		openInvoicePreviewModal(location.state.id);
          // }
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  };

  const closeGoodsReceivedNotes = () => {
    setOpenGoodsReceivedNotes(false);
  };

  const close = (id, status) => {
    dispatch(PurchaseOrderAction.changeStatus(id, status))
      .then(res => {
        if (res.status === 200) {
          toast.success(res.data?.message || 'Status Changed Successfully');
          initializeData();
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'Status Changed Unsuccessfully');
      });
  };

  const renderRFQStatus = status => {
    let classname = '';
    if (status === 'Approved') {
      classname = 'label-success';
    } else if (status === 'Draft') {
      classname = 'label-draft';
    } else if (status === 'Closed') {
      classname = 'label-closed';
    } else if (status === 'Sent') {
      classname = 'label-sent';
    } else if (status === 'Rejected') {
      classname = 'label-due';
    } else if (status === 'Invoiced') {
      classname = 'label-primary';
    } else {
      classname = 'label-overdue';
    }
    return (
      <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
        {status}
      </span>
    );
  };

  const sendMail = row => {
    setLoading(true);
    const postingRequestModel = {
      postingRefId: row.id,
      amountInWords: upperCase(row.currencyName + ' ' + toWords.convert(row.totalAmount)).replace(
        'POINT',
        'AND'
      ),
      vatInWords: row.totalVatAmount
        ? upperCase(row.currencyName + ' ' + toWords.convert(row.totalVatAmount)).replace(
            'POINT',
            'AND'
          )
        : '-',
    };
    dispatch(PurchaseOrderAction.sendMail(postingRequestModel))
      .then(res => {
        if (res.status === 200) {
          toast.success(res.data ? res.data.message : 'Purchase Order Posted Successfully');
          initializeData();
        }
      })
      .catch(err => {
        toast.error(err.data ? err.data.message : 'Purchase Order Posted Unsuccessfully');
        setLoading(false);
        initializeData();
      });
  };

  const changeStatus = (id, status) => {
    dispatch(PurchaseOrderAction.changeStatus(id, status))
      .then(res => {
        if (res.status === 200) {
          toast.success(res.data?.message || 'Status Changed Successfully');
          initializeData();
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'Status Changed Unsuccessfully');
      });
  };

  const removeBulk = ids => {
    setDialog(null);
    let obj = {
      ids: ids,
    };
    dispatch(PurchaseOrderAction.removeBulk(obj))
      .then(res => {
        initializeData();
        toast.success(res.data ? res.data.message : 'Purchase Order Deleted Successfully');
        setSelectedRows({});
      })
      .catch(err => {
        toast.error(err.data ? err.data.message : 'Purchase Order Deleted Unsuccessfully');
      });
  };

  const deletePurchaseOrder = () => {
    const selectedIds = Object.keys(selectedRows).filter(k => selectedRows[k]);
    if (selectedIds.length > 0) {
      const message1 = (
        <text>
          <b>Delete Supplier Invoice?</b>
        </text>
      );
      const message = 'This Supplier Invoice will be deleted permanently and cannot be recovered. ';
      setDialog(
        <ConfirmDeleteModal
          isOpen={true}
          okHandler={() => removeBulk(selectedIds)}
          cancelHandler={() => setDialog(null)}
          message={message}
          message1={message1}
        />
      );
    } else {
      toast.info('Please select the rows of the table and try again.');
    }
  };

  const handleChange = (val, name) => {
    setFilterData(prev => ({ ...prev, [name]: val }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const clearAll = () => {
    setFilterData({
      supplierId: '',
      referenceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      amount: '',
      status: '',
      contactType: 1,
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const toggleActionButton = index => {
    setActionButtons(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderActionForState = id => {
    dispatch(PurchaseOrderDetailsAction.getPOById(id)).then(res => {
      setOpenGoodsReceivedNotes(true);
      setRowId(id);
      setSelectedData({
        ...res.data,
        supplierId: res.data.supplierId || '',
        rfqNumber: res.data.rfqNumber || '',
        totalVatAmount: res.data.totalVatAmount || 0,
        totalAmount: res.data.totalAmount || 0,
        total_net: 0,
        notes: res.data.notes || '',
        lineItemsString: res.data.poQuatationLineItemRequestModelList || [],
        data: res.data.poQuatationLineItemRequestModelList || [],
        selectedContact: res.data.supplierId || '',
      });
      setLoading(false);
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'poNumber',
        header: strings.PONUMBER,
        width: '10%',
      },
      {
        accessorKey: 'supplierName',
        header: strings.SUPPLIERNAME,
        width: '15%',
        cell: ({ getValue }) => <span style={{ whiteSpace: 'normal' }}>{getValue()}</span>,
      },
      {
        accessorKey: 'poApproveDate',
        header: strings.PODATE,
        width: '10%',
        cell: ({ getValue }) => getValue() || '',
      },
      {
        accessorKey: 'poReceiveDate',
        header: strings.POEXPIRYDATE,
        width: '10%',
        cell: ({ getValue }) => getValue() || '',
      },
      {
        accessorKey: 'status',
        header: strings.STATUS,
        width: '10%',
        cell: ({ getValue }) => renderRFQStatus(getValue()),
      },
      {
        accessorKey: 'totalAmount',
        header: strings.AMOUNT,
        width: '25%',
        cell: ({ row }) => (
          <div className="text-right">
            <div>
              <label className="font-weight-bold mr-2">
                {strings.PurchaseOrder + ' ' + strings.Amount}:{' '}
              </label>
              <label>
                {row.original.totalAmount === 0
                  ? `${row.original.currencyCode} ${row.original.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${row.original.currencyCode} ${row.original.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </label>
            </div>
            {row.original.totalVatAmount !== 0 && (
              <div>
                <label className="font-weight-bold mr-2">{strings.VatAmount}: </label>
                <label>
                  {`${row.original.currencyCode} ${row.original.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </label>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        width: '5%',
        cell: ({ row }) => (
          <div className="text-right">
            <ButtonDropdown
              isOpen={actionButtons[row.original.id]}
              toggle={() => toggleActionButton(row.original.id)}
            >
              <DropdownToggle size="sm" color="primary" className="btn-brand icon">
                {actionButtons[row.original.id] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </DropdownToggle>
              <DropdownMenu right>
                {row.original.status === 'Draft' && (
                  <DropdownItem
                    onClick={() =>
                      navigate('/admin/expense/purchase-order/detail', {
                        state: { id: row.original.id },
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" /> {strings.Edit}
                  </DropdownItem>
                )}
                {row.original.status === 'Approved' && (
                  <DropdownItem
                    onClick={() =>
                      navigate('/admin/expense/goods-received-note/create', {
                        state: { poId: row.original.id, poNumber: row.original.poNumber },
                      })
                    }
                  >
                    <Plus className="h-4 w-4" /> {strings.CreateGRN}
                  </DropdownItem>
                )}
                {row.original.status === 'Approved' && (
                  <DropdownItem
                    onClick={() =>
                      navigate('/admin/expense/supplier-invoice/create', {
                        state: { poId: row.original.id },
                      })
                    }
                  >
                    <Plus className="h-4 w-4" /> {strings.CreateSupplierInvoice}
                  </DropdownItem>
                )}
                {row.original.status === 'Draft' && (
                  <DropdownItem onClick={() => sendMail(row.original)}>
                    <Send className="h-4 w-4" /> {strings.Send}
                  </DropdownItem>
                )}
                {row.original.status === 'Draft' && (
                  <DropdownItem onClick={() => changeStatus(row.original.id, 'Sent')}>
                    <ArrowRightCircle className="h-4 w-4" />
                    Mark As Sent
                  </DropdownItem>
                )}
                {row.original.status === 'Sent' && (
                  <DropdownItem onClick={() => sendMail(row.original)}>
                    <Send className="h-4 w-4" /> {strings.SendAgain}
                  </DropdownItem>
                )}
                {row.original.status !== 'Draft' &&
                  row.original.status !== 'Approved' &&
                  row.original.status !== 'Closed' &&
                  row.original.status !== 'Invoiced' && (
                    <DropdownItem onClick={() => changeStatus(row.original.id, 'Approved')}>
                      <CheckCircle className="h-4 w-4" /> {strings.MarkAsApproved}
                    </DropdownItem>
                  )}
                {row.original.status !== 'Draft' &&
                  row.original.status !== 'Rejected' &&
                  row.original.status !== 'Closed' &&
                  row.original.status !== 'Invoiced' && (
                    <DropdownItem onClick={() => changeStatus(row.original.id, 'Rejected')}>
                      <Ban className="h-4 w-4" /> {strings.MarkAsRejected}
                    </DropdownItem>
                  )}
                <DropdownItem
                  onClick={() =>
                    navigate(`/admin/expense/purchase-order/create`, {
                      state: { parentId: row.original.id },
                    })
                  }
                >
                  <Copy className="h-4 w-4" /> {strings.CreateADuplicate}
                </DropdownItem>
                <DropdownItem
                  onClick={() =>
                    navigate('/admin/expense/purchase-order/view', {
                      state: { id: row.original.id, status: row.original.status },
                    })
                  }
                >
                  <Eye className="h-4 w-4" /> {strings.View}
                </DropdownItem>
                {(row.original.status === 'Approved' ||
                  row.original.status === 'Sent' ||
                  row.original.status === 'Rejected' ||
                  row.original.status === 'Invoiced') && (
                  <DropdownItem onClick={() => close(row.original.id, 'Closed')}>
                    <XCircle className="h-4 w-4" /> {strings.Close}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </ButtonDropdown>
          </div>
        ),
      },
    ],
    [navigate, actionButtons]
  );

  let tmpSupplier_list = [];
  if (supplier_list) {
    supplier_list.map(item => {
      let obj = { label: item.label.contactName, value: item.value };
      tmpSupplier_list.push(obj);
    });
  }

  return loading ? (
    <Loader />
  ) : (
    <div>
      <div className="supplier-invoice-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <img alt="invoiceimage" src={invoiceimage} style={{ width: '40px' }} />
                    <span className="ml-2">{strings.PurchaseOrder}</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {dialog}
              <Row>
                <Col lg={12}>
                  <div className="d-flex justify-content-end">
                    <ButtonGroup size="sm">{/* Buttons can go here */}</ButtonGroup>
                  </div>
                  <div className="py-3">
                    <h5>{strings.Filter}: </h5>
                    <Row>
                      <Col lg={2} className="mb-1">
                        <Select
                          className="select-default-width"
                          placeholder={strings.Select + strings.Supplier}
                          id="supplier"
                          name="supplier"
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
                          value={filterData.supplierId}
                          onChange={option => {
                            if (option && option.value) {
                              handleChange(option, 'supplierId');
                            } else {
                              handleChange('', 'supplierId');
                            }
                          }}
                        />
                      </Col>
                      <Col lg={2} className="pl-0 pr-0">
                        <Button
                          type="button"
                          color="primary"
                          className="btn-square mr-1"
                          onClick={handleSearch}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          color="primary"
                          className="btn-square"
                          onClick={clearAll}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </Col>
                    </Row>
                  </div>
                  <Row>
                    <div style={{ width: '1650px' }}>
                      <Button
                        color="primary"
                        style={{ marginBottom: '10px' }}
                        className="btn-square pull-right"
                        onClick={() => navigate(`/admin/expense/purchase-order/create`)}
                      >
                        <Plus className="h-4 w-4" />
                        {strings.AddNewPurchaseOrder}
                      </Button>
                    </div>
                  </Row>

                  <DataTable
                    data={purchase_order_list?.data?.data || []}
                    columns={columns}
                    manualPagination={true}
                    manualSorting={true}
                    pageCount={
                      purchase_order_list?.data?.count
                        ? Math.ceil(purchase_order_list.data.count / pagination.pageSize)
                        : 0
                    }
                    onPaginationChange={setPagination}
                    onSortingChange={setSorting}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </div>
        <CreateGoodsReceivedNote
          openGoodsReceivedNotes={openGoodsReceivedNotes}
          closeGoodsReceivedNotes={closeGoodsReceivedNotes}
          id={rowId}
          selectedData={selectedData}
          prefixData={prefixData}
          getVat={dispatch(PurchaseOrderAction.getVatList())} // Correct way to call? Original was prop
          getProductList={dispatch(PurchaseOrderAction.getProductList())}
          getNextGrnNo={() => {
            dispatch(GoodsReceivedNoteCreateAction.getInvoiceNo()).then(response => {
              setPrefixData(response.data);
            });
          }}
          createGRN={data => dispatch(GoodsReceivedNoteCreateAction.createGNR(data))}
        />
      </div>
    </div>
  );
};

export default PurchaseOrder;
