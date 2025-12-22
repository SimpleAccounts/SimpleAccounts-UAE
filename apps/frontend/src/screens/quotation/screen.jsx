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
} from 'components/migration';
import Select from 'react-select';
import { DataTable } from '@/components/ui/data-table';
import EmailModal from '../customer_invoice/sections/email_template';
import { Loader, ConfirmDeleteModal, SentInvoice, ActionDropdownButtons } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import * as QuotationAction from './actions';
import * as CustomerInvoiceActions from './../customer_invoice/actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory, StatusActionList } from 'utils';
import './style.scss';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, RefreshCw, Plus, PackageOpen } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const Quatation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [filterData, setFilterData] = useState({
    customerId: '',
    referenceNumber: '',
    invoiceDate: '',
    invoiceDueDate: '',
    amount: '',
    status: '',
    contactType: 2,
  });
  const [selectedRows, setSelectedRows] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  const { customer_list, status_list, universal_currency_list, quotation_list } = useSelector(
    state => ({
      customer_list: state.customer_invoice.customer_list,
      status_list: state.supplier_invoice.status_list,
      universal_currency_list: state.common.universal_currency_list,
      quotation_list: state.quotation.quotation_list,
    })
  );

  useEffect(() => {
    strings.setLanguage(language);
    dispatch(QuotationAction.getStatusList());
    dispatch(CustomerInvoiceActions.getCustomerList(filterData.contactType));
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
    dispatch(QuotationAction.getQuotationList(postData))
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        toast.error(err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  };

  const sendMail = (row, markAsSent, sendAgain) => {
    const { totalAmount, currencyIsoCode, totalVatAmount, id } = row;
    setDialog(
      <SentInvoice
        invoiceAmount={totalAmount || 0}
        id={id}
        currencyName={currencyIsoCode || 'SAR'}
        vatAmount={totalVatAmount || 0}
        markAsSent={markAsSent}
        postingRefType={'QUOTATION'}
        setState={value => {
          removeDialog();
        }}
        initializeData={() => {
          initializeData();
        }}
        documentTitle={strings.Quotation}
        unSent={false}
        sendAgain={sendAgain}
        mailPopupCard={!markAsSent || sendAgain}
        zatcaConfirmation={false}
      />
    );
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const renderRFQStatus = status => {
    let classname = '';
    if (status === 'Draft') {
      classname = 'label-draft';
    } else if (status === 'Closed') {
      classname = 'label-closed';
    } else if (status === 'Sent') {
      classname = 'label-sent';
    } else if (status === 'Posted') {
      classname = 'label-posted';
    } else if (status === 'Approved') {
      classname = 'label-success';
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

  const handleChange = (val, name) => {
    setFilterData(prev => ({ ...prev, [name]: val }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    // initializeData will be called by useEffect
  };

  const clearAll = () => {
    setFilterData({
      customerId: '',
      referenceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      amount: '',
      status: '',
      contactType: 2,
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'quatationNumber',
        header: strings.QUOTATIONNUMBER,
        width: '15%',
      },
      {
        accessorKey: 'customerName',
        header: strings.CUSTOMERNAME,
        width: '20%',
      },
      {
        accessorKey: 'quotationCreatedDate',
        header: strings.CREATED_DATE,
        width: '13%',
        cell: ({ getValue }) => getValue() || '',
      },
      {
        accessorKey: 'quotaionExpiration', // Mapped from poApproveDate in old code? No, in old code dataField="poApproveDate" but dataFormat={this.pODate} which returned row.quotaionExpiration.
        // Wait, let's check old code mapping.
        // dataField="poApproveDate"
        // dataFormat={this.pODate} -> returns row.quotaionExpiration
        // So accessorKey should be quotaionExpiration
        header: strings.EXPIRATIONDATE,
        width: '13%',
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
          <div>
            <div>
              <label className="font-weight-bold mr-2">{strings.QuotationAmount}: </label>
              <label>
                {row.original.totalAmount === 0
                  ? row.original.currencyIsoCode +
                    ' ' +
                    row.original.totalAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : row.original.currencyIsoCode +
                    ' ' +
                    row.original.totalAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </label>
            </div>

            <div style={{ display: row.original.totalVatAmount === 0 ? 'none' : '' }}>
              <label className="font-weight-bold mr-2">{strings.VatAmount}: </label>
              <label>
                {row.original.totalVatAmount === 0
                  ? row.original.currencyIsoCode +
                    ' ' +
                    row.original.totalVatAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : row.original.currencyIsoCode +
                    ' ' +
                    row.original.totalVatAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </label>
            </div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const statuslist = StatusActionList.QuotationStatusActionList.find(
            obj => obj.status === row.original.status
          );
          const actionList = statuslist ? statuslist.list : [];
          return (
            <div className="text-right">
              <ActionDropdownButtons
                history={{ push: navigate }} // Adapter for history
                URL={'/admin/income/quotation'}
                invoiceData={row.original}
                postingRefType={'QUOTATION'}
                initializeData={() => {
                  initializeData();
                }}
                actionList={actionList}
                invoiceStatus={row.original.status}
                documentTitle={strings.Quotation}
              />
            </div>
          );
        },
      },
    ],
    [navigate]
  );

  let tmpCustomer_list = [];
  if (customer_list) {
    customer_list.map(item => {
      let obj = { label: item.label.contactName, value: item.value };
      tmpCustomer_list.push(obj);
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
                    <PackageOpen className="h-5 w-5" />
                    <span className="ml-2">{strings.Quotation}</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {dialog}
              <Row>
                <Col lg={12}>
                  <div className="d-flex justify-content-end">
                    <ButtonGroup size="sm"></ButtonGroup>
                  </div>
                  <div className="py-3">
                    <h5>{strings.Filter}: </h5>
                    <Row>
                      <Col lg={2} className="mb-1">
                        <Select
                          className="select-default-width"
                          placeholder={strings.Select + strings.Customer}
                          id="customer"
                          name="customer"
                          options={
                            tmpCustomer_list
                              ? selectOptionsFactory.renderOptions(
                                  'label',
                                  'value',
                                  tmpCustomer_list,
                                  'Customer'
                                )
                              : []
                          }
                          value={filterData.customerId}
                          onChange={option => {
                            if (option && option.value) {
                              handleChange(option, 'customerId');
                            } else {
                              handleChange('', 'customerId');
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
                    <div style={{ width: '1560px' }}>
                      <Button
                        color="primary"
                        style={{ marginBottom: '10px' }}
                        className="btn-square pull-right"
                        onClick={() => navigate(`/admin/income/quotation/create`)}
                      >
                        <Plus className="h-4 w-4" />
                        {strings.AddNewRequest}
                      </Button>
                    </div>
                  </Row>

                  <DataTable
                    data={quotation_list?.data?.data || []}
                    columns={columns}
                    manualPagination={true}
                    manualSorting={true}
                    pageCount={quotation_list?.data?.totalPages || 0}
                    onPaginationChange={setPagination}
                    onSortingChange={setSorting}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </div>
        <EmailModal
          openEmailModal={openEmailModal}
          closeEmailModal={e => {
            setOpenEmailModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default Quatation;
