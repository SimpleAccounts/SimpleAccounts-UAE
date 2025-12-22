import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  ButtonGroup,
  Input,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'components/migration';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { Loader, ConfirmDeleteModal, SentInvoice } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import EmailModal from './sections/email_template';
import * as CustomerInvoiceDetailActions from './screens/detail/actions';
import * as CustomerInvoiceActions from './actions';
import * as CreditNotesActions from '../creditNotes/screens/create/actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';
import { CreateCreditNoteModal } from './sections';
import dayjs from '@/utils/date';
import { upperCase } from 'lodash-es';
import config from 'constants/config';
import { ToWords } from 'to-words';
import invoiceimage from 'assets/images/invoice/invoice.png';
import overWeekly from 'assets/images/invoice/week1.png';
import overduemonthly from 'assets/images/invoice/month.png';
import overdue from 'assets/images/invoice/due1.png';
import { ServerDataTable } from '@/components/ui/server-data-table';
import { DataTableRowActions } from '@/components/ui/data-table-actions';
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  ArrowRightCircle,
  Send,
  File,
  Landmark,
  Copy,
  Plus,
  Eye,
  FileText,
  Search,
  RefreshCw,
} from 'lucide-react';

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  },
});

const mapStateToProps = state => {
  return {
    customer_invoice_list: state.customer_invoice.customer_invoice_list,
    customer_list: state.customer_invoice.customer_list,
    status_list: state.customer_invoice.status_list,
    universal_currency_list: state.common.universal_currency_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    customerInvoiceActions: bindActionCreators(CustomerInvoiceActions, dispatch),
    customerInvoiceDetailActions: bindActionCreators(CustomerInvoiceDetailActions, dispatch),
    creditNotesActions: bindActionCreators(CreditNotesActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

class CustomerInvoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      loading: true,
      dialog: false,
      openEmailModal: false,
      prefixData: '',
      selectedData: {},
      actionButtons: {},
      filterData: {
        customerId: '',
        referenceNumber: '',
        invoiceDate: '',
        invoiceDueDate: '',
        amount: '',
        status: '',
        contactType: 2,
      },
      selectedRows: [],
      selectedId: '',
      openInvoicePreviewModal: false,
      csvData: [],
      view: false,
      overDueAmountDetails: {
        overDueAmount: '',
        overDueAmountWeekly: '',
        overDueAmountMonthly: '',
      },
      rowId: '',
      language: window['localStorage'].getItem('language'),
      loadingMsg: 'Loading...',
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
      sorting: [],
      rowSelection: {},
    };
  }

  componentDidMount = () => {
    let { filterData } = this.state;
    this.props.customerInvoiceActions.getStatusList();
    this.props.customerInvoiceActions.getCustomerList(filterData.contactType);
    this.initializeData();
    this.getOverdue();
  };

  getOverdue = () => {
    let { filterData } = this.state;
    this.props.customerInvoiceActions
      .getOverdueAmountDetails(filterData.contactType)
      .then(res => {
        if (res.status === 200) {
          this.setState({ overDueAmountDetails: res.data });
        }
      })
      .catch(err => {
        this.props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
        this.setState({ loading: false });
      });
  };

  closeModal = res => {
    this.setState({ openModal: false });
  };

  initializeData = () => {
    let { filterData, pagination, sorting } = this.state;
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };
    this.props.customerInvoiceActions
      .getCustomerInvoiceList(postData)
      .then(res => {
        if (res.status === 200) {
          this.setState({ loading: false }, () => {
            if (this.props.location.state && this.props.location.state.id) {
              this.openInvoicePreviewModal(this.props.location.state.id);
            }
          });
        }
      })
      .catch(err => {
        this.props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  componentWillUnmount = () => {
    this.setState({
      selectedRows: [],
    });
  };

  stockInHandTestForProduct = (row, markAsSent) => {
    this.postInvoice(row, markAsSent);
  };

  postInvoice = (row, markAsSent) => {
    const postingRequestModel = {
      amount: row.invoiceAmount,
      postingRefId: row.id,
      postingRefType: 'INVOICE',
      amountInWords: upperCase(
        row.currencyName + ' ' + toWords.convert(row.invoiceAmount) + ' ONLY'
      ).replace('POINT', 'AND'),
      vatInWords: row.vatAmount
        ? upperCase(row.currencyName + ' ' + toWords.convert(row.vatAmount) + ' ONLY').replace(
            'POINT',
            'AND'
          )
        : '-',
      markAsSent: markAsSent,
    };
    this.setState({ loading: true, loadingMsg: 'Customer Invoice Posting...' });
    this.props.customerInvoiceActions
      .postInvoice(postingRequestModel)
      .then(res => {
        if (res.status === 200) {
          if (markAsSent === true) {
            this.props.commonActions.tostifyAlert(
              'success',
              strings.InvoiceStatusChangedSuccessfully
            );
          } else {
            this.props.commonActions.tostifyAlert('success', strings.InvoiceSentSuccessfully);
          }
          this.setState({
            loading: false,
          });
          this.getOverdue();
          this.initializeData();
          this.setState({ loading: false });
        }
      })
      .catch(err => {
        this.props.commonActions.tostifyAlert('error', 'Customer Invoice Posted Unsuccessfully');
        this.setState({
          loading: false,
        });
      });
  };

  unPostInvoice = row => {
    this.setState({
      loading: true,
    });
    const postingRequestModel = {
      amount: row.invoiceAmount,
      postingRefId: row.id,
      postingRefType: 'INVOICE',
    };
    this.props.customerInvoiceActions
      .unPostInvoice(postingRequestModel)
      .then(res => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert('success', strings.InvoiceMovedToDraftSuccessfully);
          this.setState({
            loading: false,
          });
          this.getOverdue();
          this.initializeData();
        }
      })
      .catch(err => {
        this.props.commonActions.tostifyAlert('error', 'Invoice Moved To Draft Unsuccessfully!');
        this.setState({
          loading: false,
        });
      });
  };

  sendMail = (row, markAsSent, sendAgain) => {
    const { invoiceAmount, currencySymbol, vatAmount, id } = row;
    this.setState({
      dialog: (
        <SentInvoice
          invoiceAmount={invoiceAmount || 0}
          id={id}
          currencyName={currencySymbol || 'SAR'}
          vatAmount={vatAmount || 0}
          markAsSent={markAsSent}
          postingRefType={'INVOICE'}
          setState={value => {
            this.setState({ sentInvoice: value, unSent: false, sendAgain: false });
            this.removeDialog();
          }}
          initializeData={() => {
            this.initializeData();
          }}
          documentTitle={strings.CustomerInvoice}
          unSent={false}
          sendAgain={sendAgain}
          mailPopupCard={!markAsSent || sendAgain}
          zatcaConfirmation={false}
        />
      ),
    });
  };

  removeDialog = () => {
    this.setState({
      dialog: null,
    });
  };

  handleChange = (val, name) => {
    this.setState({
      filterData: Object.assign(this.state.filterData, {
        [name]: val,
      }),
    });
  };

  handleSearch = () => {
    this.setState({ pagination: { ...this.state.pagination, pageIndex: 0 } }, () => {
      this.initializeData();
    });
  };

  openInvoicePreviewModal = id => {
    this.setState(
      {
        selectedId: id,
      },
      () => {
        this.setState({
          openInvoicePreviewModal: true,
        });
      }
    );
  };

  closeInvoice = (id, status) => {
    if (status === 'Paid') {
      this.props.commonActions.tostifyAlert(
        'error',
        'Please delete the receipt first to delete the invoice'
      );
    } else {
      const message1 = (
        <text>
          <b>{strings.DeleteCustomerInvoice}</b>
        </text>
      );
      const message = 'This Customer Invoice will be deleted permanently and cannot be recovered. ';
      this.setState({
        dialog: (
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={() => this.removeInvoice(id)}
            cancelHandler={this.removeDialog}
            message={message}
            message1={message1}
          />
        ),
      });
    }
  };

  sendCustomEmail = id => {
    this.setState({ openEmailModal: true, rowId: id });
  };

  closeEmailModal = res => {
    this.setState({ openEmailModal: false });
  };

  removeInvoice = id => {
    this.removeDialog();
    this.props.customerInvoiceActions
      .deleteInvoice(id)
      .then(res => {
        this.props.commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'Customer Invoice Deleted Successfully'
        );
        this.initializeData();
      })
      .catch(err => {
        this.props.commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Customer Invoice Deleted Unsuccessfully'
        );
      });
  };

  closeInvoicePreviewModal = res => {
    this.setState({ openInvoicePreviewModal: false });
  };

  clearAll = () => {
    this.setState(
      {
        filterData: {
          customerId: '',
          referenceNumber: '',
          invoiceDate: '',
          invoiceDueDate: '',
          amount: '',
          status: '',
          contactType: 2,
        },
        pagination: { pageIndex: 0, pageSize: 10 },
      },
      () => {
        this.initializeData();
      }
    );
  };

  updateParentAmount = (totalAmount, totalVatAmount, totalexcise) => {
    this.setState({
      totalAmount: totalAmount,
      totalVatAmount: totalVatAmount,
      totalExciseAmount: totalexcise,
    });
  };

  updateParentSelelectedData = data => {
    this.setState({ selectedData: data });
  };

  // Define table columns using TanStack Table format
  getColumns = () => {
    return [
      {
        accessorKey: 'invoiceNumber',
        header: strings.INVOICENUMBER,
        cell: ({ row }) => row.original.invoiceNumber,
        enableSorting: true,
      },
      {
        accessorKey: 'customerName',
        header: strings.CUSTOMERNAME,
        cell: ({ row }) => <div style={{ whiteSpace: 'normal' }}>{row.original.customerName}</div>,
        enableSorting: true,
      },
      {
        accessorKey: 'invoiceDate',
        header: strings.INVOICEDATE,
        cell: ({ row }) => row.original.invoiceDate || '',
        enableSorting: true,
      },
      {
        accessorKey: 'invoiceDueDate',
        header: strings.DUEDATE,
        cell: ({ row }) => row.original.invoiceDueDate || '',
        enableSorting: true,
      },
      {
        accessorKey: 'status',
        header: strings.STATUS,
        cell: ({ row }) => {
          const { status, cnCreatedOnPaidInvoice } = row.original;
          let classname = '';
          if (status === 'Paid') {
            classname = 'label-success';
          } else if (status === 'Draft') {
            classname = 'label-currency';
          } else if (status === 'Partially Paid') {
            classname = 'label-PartiallyPaid';
          } else if (status === 'Due Today') {
            classname = 'label-due';
          } else {
            classname = 'label-overdue';
          }
          return (
            <>
              <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
                {status}
              </span>
              {cnCreatedOnPaidInvoice && (status === 'Paid' || status === 'Partially Paid') && (
                <>
                  <br />
                  {strings.Credit_Note_Created}
                </>
              )}
            </>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: 'totalAmount',
        header: strings.INVOICEAMOUNT,
        cell: ({ row }) => {
          const { invoiceAmount, vatAmount, dueAmount, currencySymbol } = row.original;
          return (
            <div style={{ textAlign: 'right' }}>
              <div>
                <label className="font-weight-bold mr-2">{strings.InvoiceAmount}: </label>
                <label>
                  {currencySymbol}{' '}
                  {invoiceAmount.toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </label>
              </div>
              {vatAmount !== 0 && (
                <div>
                  <label className="font-weight-bold mr-2">{strings.VatAmount}: </label>
                  <label>
                    {currencySymbol}{' '}
                    {vatAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </label>
                </div>
              )}
              {dueAmount !== 0 && (
                <div>
                  <label className="font-weight-bold mr-2">{strings.DueAmount}: </label>
                  <label>
                    {currencySymbol}{' '}
                    {dueAmount.toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </label>
                </div>
              )}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const rowData = row.original;
          const isOpen = this.state.actionButtons[rowData.id];

          return (
            <ButtonDropdown
              isOpen={isOpen}
              toggle={() => {
                let temp = Object.assign({}, this.state.actionButtons);
                temp[rowData.id] = !temp[rowData.id];
                this.setState({ actionButtons: temp });
              }}
            >
              <DropdownToggle size="sm" color="primary" className="btn-brand icon">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </DropdownToggle>
              <DropdownMenu right>
                {rowData.statusEnum !== 'Paid' &&
                  rowData.statusEnum !== 'Sent' &&
                  rowData.statusEnum !== 'Partially Paid' && (
                    <DropdownItem>
                      <div
                        onClick={() => {
                          if (rowData.editFlag)
                            this.props.history.push('/admin/income/customer-invoice/detail', {
                              id: rowData.id,
                            });
                          else
                            this.props.commonActions.tostifyAlert(
                              'error',
                              'You cannot edit transactions for which VAT is recorded'
                            );
                        }}
                      >
                        <Pencil className="h-4 w-4" /> {strings.Edit}
                      </div>
                    </DropdownItem>
                  )}
                {rowData.statusEnum !== 'Sent' &&
                  rowData.statusEnum !== 'Paid' &&
                  rowData.statusEnum !== 'Partially Paid' && (
                    <DropdownItem
                      onClick={() => {
                        this.stockInHandTestForProduct(rowData, true);
                      }}
                    >
                      <ArrowRightCircle className="h-4 w-4" />
                      {strings.Mark_As_Sent}
                    </DropdownItem>
                  )}
                {rowData.statusEnum !== 'Sent' &&
                  rowData.statusEnum !== 'Paid' &&
                  rowData.statusEnum !== 'Partially Paid' && (
                    <DropdownItem
                      onClick={() => {
                        this.sendMail(rowData, false, false);
                      }}
                    >
                      <Send className="h-4 w-4" /> {strings.Send}
                    </DropdownItem>
                  )}
                {rowData.statusEnum === 'Sent' && (
                  <DropdownItem
                    onClick={() => {
                      if (rowData.editFlag) this.unPostInvoice(rowData);
                      else
                        this.props.commonActions.tostifyAlert(
                          'error',
                          'You cannot edit transactions for which VAT is recorded'
                        );
                    }}
                  >
                    <File className="h-4 w-4" /> {strings.Draft}
                  </DropdownItem>
                )}
                {rowData.statusEnum !== 'Draft' &&
                  rowData.statusEnum !== 'Paid' &&
                  rowData.exchangeRate === 1 && (
                    <DropdownItem
                      onClick={() =>
                        this.props.history.push('/admin/income/customer-invoice/record-payment', {
                          id: rowData,
                        })
                      }
                    >
                      <Landmark className="h-4 w-4" /> {strings.RecordPayment}
                    </DropdownItem>
                  )}
                <DropdownItem
                  onClick={() =>
                    this.props.history.push('/admin/income/customer-invoice/create', {
                      parentInvoiceId: rowData.id,
                    })
                  }
                >
                  <Copy className="h-4 w-4" /> {strings.CreateADuplicate}
                </DropdownItem>
                {!rowData.cnCreatedOnPaidInvoice &&
                  rowData.statusEnum === 'Paid' &&
                  rowData.remainingInvoiceAmount !== true &&
                  config.INCOME_TCN && (
                    <DropdownItem
                      onClick={() => {
                        this.props.history.push('/admin/income/credit-notes/create', {
                          invoiceID: rowData.id,
                        });
                      }}
                    >
                      <Plus className="h-4 w-4" /> {strings.Create + ' ' + strings.CreditNote}
                    </DropdownItem>
                  )}
                <DropdownItem
                  onClick={() =>
                    this.props.history.push('/admin/income/customer-invoice/view', {
                      id: rowData.id,
                      status: rowData.status,
                      contactId: rowData.contactId,
                    })
                  }
                >
                  <Eye className="h-4 w-4" /> {strings.View}
                </DropdownItem>
              </DropdownMenu>
            </ButtonDropdown>
          );
        },
        enableSorting: false,
        size: 50,
      },
    ];
  };

  render() {
    strings.setLanguage(this.state.language);
    const { loading, loadingMsg, filterData, dialog, pagination, sorting, rowSelection } =
      this.state;
    const { customer_list, customer_invoice_list } = this.props;

    const customer_invoice_data =
      this.props.customer_invoice_list && this.props.customer_invoice_list.data
        ? this.props.customer_invoice_list.data.map(customer => ({
            id: customer.id,
            status: customer.status,
            statusEnum: customer.statusEnum,
            customerName: customer.name,
            dueAmount: customer.dueAmount,
            contactId: customer.contactId,
            invoiceNumber: customer.referenceNumber,
            invoiceDate: customer.invoiceDate ? customer.invoiceDate : '',
            invoiceDueDate: customer.invoiceDueDate ? customer.invoiceDueDate : '',
            currencyName: customer.currencyName ? customer.currencyName : '',
            currencySymbol: customer.currencySymbol ? customer.currencySymbol : '',
            invoiceAmount: customer.totalAmount,
            vatAmount: customer.totalVatAmount,
            cnCreatedOnPaidInvoice: customer.cnCreatedOnPaidInvoice,
            editFlag: customer.editFlag,
            exchangeRate: customer.exchangeRate,
          }))
        : [];

    let tmpCustomer_list = [];
    customer_list.map(item => {
      let obj = { label: item.label.contactName, value: item.value };
      tmpCustomer_list.push(obj);
    });

    const pageCount = customer_invoice_list.count
      ? Math.ceil(customer_invoice_list.count / pagination.pageSize)
      : 0;

    return loading === true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div>
        <div className="customer-invoice-screen">
          <div className="animated fadeIn">
            <Card>
              <CardHeader>
                <Row>
                  <Col lg={12}>
                    <div className="h4 mb-0 d-flex align-items-center">
                      <FileText className="h-4 w-4" />
                      <span className="ml-2">{strings.CustomerInvoices}</span>
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
                                this.handleChange(option, 'customerId');
                              } else {
                                this.handleChange('', 'customerId');
                              }
                            }}
                          />
                        </Col>
                        <Col lg={2} className="mb-1">
                          <DatePicker
                            className="form-control"
                            id="date"
                            name="invoiceDate"
                            placeholderText={strings.Select + strings.InvoiceDate}
                            selected={filterData.invoiceDate}
                            autoComplete="off"
                            showMonthDropdown
                            showYearDropdown
                            dateFormat="dd-MM-yyyy"
                            dropdownMode="select"
                            value={filterData.invoiceDate}
                            onChange={value => {
                              this.handleChange(value, 'invoiceDate');
                            }}
                          />
                        </Col>
                        <Col lg={2} className="mb-1">
                          <DatePicker
                            className="form-control"
                            id="date"
                            name="invoiceDueDate"
                            placeholderText={strings.Select + strings.InvoiceDueDate}
                            showMonthDropdown
                            minDate={this.state.filterData.invoiceDate}
                            maxDate={null}
                            showYearDropdown
                            dropdownMode="select"
                            dateFormat="dd-MM-yyyy"
                            autoComplete="off"
                            selected={filterData.invoiceDueDate}
                            onChange={value => {
                              this.handleChange(value, 'invoiceDueDate');
                            }}
                          />
                        </Col>
                        <Col lg={2} className="mb-1">
                          <Input
                            type="number"
                            maxLength="14,2"
                            min="0"
                            value={filterData.amount}
                            placeholder={strings.Enter + strings.Amount}
                            onChange={e => {
                              this.handleChange(e.target.value, 'amount');
                            }}
                          />
                        </Col>
                        <Col lg={2} className="pl-0 pr-0">
                          <Button
                            type="button"
                            color="primary"
                            className="btn-square mr-1"
                            onClick={this.handleSearch}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            color="primary"
                            className="btn-square"
                            onClick={this.clearAll}
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
                          className="btn-square pull-right"
                          style={{ marginBottom: '10px' }}
                          onClick={() =>
                            this.props.history.push(`/admin/income/customer-invoice/create`)
                          }
                        >
                          <Plus className="h-4 w-4" />
                          {strings.AddNewInvoice}
                        </Button>
                      </div>
                    </Row>

                    <ServerDataTable
                      columns={this.getColumns()}
                      data={customer_invoice_data}
                      pageCount={pageCount}
                      totalCount={customer_invoice_list.count || 0}
                      pagination={pagination}
                      onPaginationChange={updater => {
                        const newPagination =
                          typeof updater === 'function' ? updater(pagination) : updater;
                        this.setState({ pagination: newPagination }, () => {
                          this.initializeData();
                        });
                      }}
                      sorting={sorting}
                      onSortingChange={newSorting => {
                        this.setState({ sorting: newSorting }, () => {
                          this.initializeData();
                        });
                      }}
                      enableRowSelection={false}
                      rowSelection={rowSelection}
                      onRowSelectionChange={newSelection => {
                        this.setState({ rowSelection: newSelection });
                      }}
                      loading={false}
                      emptyMessage="No customer invoices found."
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
          <CreateCreditNoteModal
            openModal={this.state.openModal}
            closeModal={e => {
              this.closeModal(e);
              this.initializeData();
            }}
            updateParentAmount={(e, e1, e2) => {
              this.updateParentAmount(e, e1, e2);
            }}
            updateParentSelelectedData={e => {
              this.updateParentSelelectedData(e);
            }}
            invoiceNumber={this.state.invoiceNumber}
            id={this.state.rowId}
            selectedData={this.state.selectedData}
            prefixData={this.state.prefixData}
            createCreditNote={this.props.creditNotesActions.createCreditNote}
            totalAmount={this.state.totalAmount}
            totalVatAmount={this.state.totalVatAmount}
            totalExciseAmount={this.state.totalExciseAmount}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerInvoice);
