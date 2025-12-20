import React from 'react';
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
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import EmailModal from '../customer_invoice/sections/email_template';
import { Loader, ConfirmDeleteModal, Currency } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import * as SupplierInvoiceActions from './actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { upperCase } from 'lodash-es';
import config from 'constants/config';
import { ToWords } from 'to-words';
import invoiceimage from 'assets/images/invoice/invoice.png';
import overWeekly from 'assets/images/invoice/week1.png';
import overduemonthly from 'assets/images/invoice/month.png';
import overdue from 'assets/images/invoice/due1.png';
import { ServerDataTable } from '@/components/ui/server-data-table';

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
    supplier_invoice_list: state.supplier_invoice.supplier_invoice_list,
    supplier_list: state.supplier_invoice.supplier_list,
    status_list: state.supplier_invoice.status_list,
    universal_currency_list: state.common.universal_currency_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

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

let strings = new LocalizedStrings(data);

class SupplierInvoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dialog: false,
      openEmailModal: false,
      actionButtons: {},
      filterData: {
        supplierId: '',
        referenceNumber: '',
        invoiceDate: '',
        invoiceDueDate: '',
        amount: '',
        status: '',
        contactType: 1,
      },
      selectedRows: [],
      contactType: 1,
      openInvoicePreviewModal: false,
      selectedId: '',
      csvData: [],
      view: false,
      overDueAmountDetails: {
        overDueAmount: '',
        overDueAmountWeekly: '',
        overDueAmountMonthly: '',
      },
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
    this.props.supplierInvoiceActions.getStatusList();
    this.props.supplierInvoiceActions.getSupplierList(filterData.contactType);
    this.initializeData();
    this.getOverdue();
  };

  getOverdue = () => {
    let { filterData } = this.state;
    this.props.supplierInvoiceActions
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
      });
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
    this.props.supplierInvoiceActions
      .getSupplierInvoiceList(postData)
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
        this.setState({ loading: false });
      });
  };

  componentWillUnmount = () => {
    this.setState({
      selectedRows: [],
    });
  };

  sendCustomEmail = id => {
    this.setState({ openEmailModal: true });
  };

  closeEmailModal = res => {
    this.setState({ openEmailModal: false });
  };

  sendMail = id => {
    this.props.supplierInvoiceActions
      .sendMail(id)
      .then(res => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Invoice Posted Successfully'
          );
        }
      })
      .catch(err => {
        this.props.commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Please First fill The Mail Configuration Detail'
        );
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

  postInvoice = (row, markAsSent) => {
    this.setState({
      loading: true,
    });
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
    this.setState({ loading: true, loadingMsg: 'Supplier Invoice Posting...' });
    this.props.supplierInvoiceActions
      .postInvoice(postingRequestModel)
      .then(res => {
        if (res.status === 200) {
          if (markAsSent === true) {
            this.props.commonActions.tostifyAlert('success', strings.InvoicePostedSuccessfully);
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
        this.props.commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Supplier Invoice Posted Unsuccessfully'
        );
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
    this.props.supplierInvoiceActions
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
        this.props.commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Invoice Moved To Draft Unsuccessfully!'
        );
        this.setState({
          loading: false,
        });
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

  closeInvoicePreviewModal = res => {
    this.setState({ openInvoicePreviewModal: false });
  };

  closeInvoice = (id, status) => {
    if (status === 'Paid') {
      this.props.commonActions.tostifyAlert(
        'error',
        'Please Delete The Receipt First To Delete The Invoice'
      );
    } else {
      const message1 = (
        <text>
          <b>Delete Supplier Invoice?</b>
        </text>
      );
      const message = 'This Supplier Invoice will be deleted permanently and cannot be recovered. ';
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

  removeInvoice = id => {
    this.removeDialog();
    this.props.supplierInvoiceActions
      .deleteInvoice(id)
      .then(res => {
        this.props.commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'Invoice Deleted Successfully'
        );
        this.initializeData();
      })
      .catch(err => {
        this.props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Invoice deleted Unsuccessfully'
        );
      });
  };

  clearAll = () => {
    this.setState(
      {
        filterData: {
          supplierId: '',
          referenceNumber: '',
          invoiceDate: '',
          invoiceDueDate: '',
          amount: '',
          status: '',
          statusEnum: '',
          contactType: 1,
          contactId: '',
        },
        pagination: { pageIndex: 0, pageSize: 10 },
      },
      () => {
        this.initializeData();
      }
    );
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
        header: strings.SUPPLIERNAME,
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
            classname = 'label-paid';
          } else if (status === 'Draft') {
            classname = 'label-draft';
          } else if (status === 'Partially Paid') {
            classname = 'label-PartiallyPaid';
          } else if (status === 'Due Today') {
            classname = 'label-overdue';
          } else {
            classname = 'label-overdue';
          }
          return (
            <>
              <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
                {status}
              </span>
              {cnCreatedOnPaidInvoice && status === 'Paid' && config.EXPENSE_DN && (
                <>
                  <br />
                  {strings.DebitNoteCreated}
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
          const { invoiceAmount, vatAmount, dueAmount, currencySymbol, statusEnum } = row.original;
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
              {statusEnum !== 'Paid' && dueAmount !== 0 && (
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
                {isOpen ? (
                  <i className="fas fa-chevron-up" />
                ) : (
                  <i className="fas fa-chevron-down" />
                )}
              </DropdownToggle>
              <DropdownMenu right>
                {rowData.statusEnum !== 'Paid' &&
                  rowData.statusEnum !== 'Sent' &&
                  rowData.statusEnum !== 'Partially Paid' && (
                    <DropdownItem
                      onClick={() => {
                        if (rowData.editFlag)
                          this.props.history.push('/admin/expense/supplier-invoice/detail', {
                            id: rowData.id,
                          });
                        else
                          this.props.commonActions.tostifyAlert(
                            'error',
                            'You cannot edit transactions for which VAT is recorded'
                          );
                      }}
                    >
                      <i className="fas fa-edit" /> {strings.Edit}
                    </DropdownItem>
                  )}
                {rowData.statusEnum !== 'Sent' &&
                  rowData.statusEnum !== 'Paid' &&
                  rowData.statusEnum !== 'Partially Paid' && (
                    <DropdownItem
                      onClick={() => {
                        this.postInvoice(rowData, true);
                      }}
                    >
                      <i className="far fa-arrow-alt-circle-right"></i>
                      {strings.Post}
                    </DropdownItem>
                  )}
                <DropdownItem
                  onClick={() =>
                    this.props.history.push('/admin/expense/supplier-invoice/create', {
                      parentInvoiceId: rowData.id,
                    })
                  }
                >
                  <i className="fas fa-copy" /> {strings.CreateADuplicate}
                </DropdownItem>
                {!rowData.cnCreatedOnPaidInvoice &&
                  rowData.statusEnum === 'Paid' &&
                  config.EXPENSE_DN && (
                    <DropdownItem
                      onClick={() => {
                        this.props.history.push('/admin/expense/debit-notes/create', {
                          invoiceID: rowData.id,
                          invoiceNumber: rowData.invoiceNumber,
                        });
                      }}
                    >
                      <i className="fas fa-plus" /> {strings.Create + ' ' + strings.DebitNote}
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
                    <i className="fas fa-file" /> {strings.Draft}
                  </DropdownItem>
                )}
                {rowData.statusEnum !== 'Draft' &&
                  rowData.statusEnum !== 'Paid' &&
                  rowData.exchangeRate === 1 && (
                    <DropdownItem
                      onClick={() => {
                        this.props.history.push('/admin/expense/supplier-invoice/record-payment', {
                          id: rowData,
                        });
                      }}
                    >
                      <i className="fas fa-university" /> {strings.RecordPayment}
                    </DropdownItem>
                  )}
                <DropdownItem
                  onClick={() =>
                    this.props.history.push('/admin/expense/supplier-invoice/view', {
                      id: rowData.id,
                      status: rowData.status,
                    })
                  }
                >
                  <i className="fas fa-eye" /> {strings.View}
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
    const { supplier_list, supplier_invoice_list } = this.props;

    const supplier_invoice_data =
      supplier_invoice_list && supplier_invoice_list.data
        ? this.props.supplier_invoice_list.data.map(supplier => ({
            id: supplier.id,
            status: supplier.status,
            statusEnum: supplier.statusEnum,
            customerName: supplier.name,
            dueAmount: supplier.dueAmount,
            invoiceNumber: supplier.referenceNumber,
            invoiceDate: supplier.invoiceDate ? supplier.invoiceDate : '',
            invoiceDueDate: supplier.invoiceDueDate ? supplier.invoiceDueDate : '',
            invoiceAmount: supplier.totalAmount,
            vatAmount: supplier.totalVatAmount,
            currencyName: supplier.currencyName ? supplier.currencyName : '',
            currencySymbol: supplier.currencySymbol ? supplier.currencySymbol : '',
            contactId: supplier.contactId,
            editFlag: supplier.editFlag,
            exchangeRate: supplier.exchangeRate,
            cnCreatedOnPaidInvoice: supplier.cnCreatedOnPaidInvoice,
          }))
        : [];

    let tmpSupplier_list = [];
    supplier_list.map(item => {
      let obj = { label: item.label.contactName, value: item.value };
      tmpSupplier_list.push(obj);
    });

    const pageCount = supplier_invoice_list.count
      ? Math.ceil(supplier_invoice_list.count / pagination.pageSize)
      : 0;

    return loading === true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div>
        <div className="supplier-invoice-screen">
          <div className="animated fadeIn">
            <Card>
              <CardHeader>
                <Row>
                  <Col lg={12}>
                    <div className="h4 mb-0 d-flex align-items-center">
                      <i className="fas fa-file-invoice" />
                      <span className="ml-2">{strings.SupplierInvoices}</span>
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
                            styles={customStyles}
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
                                this.handleChange(option, 'supplierId');
                              } else {
                                this.handleChange('', 'supplierId');
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
                            showMonthDropdown
                            showYearDropdown
                            autoComplete="off"
                            dropdownMode="select"
                            dateFormat="dd-MM-yyyy"
                            selected={filterData.invoiceDate}
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
                            showYearDropdown
                            minDate={this.state.filterData.invoiceDate}
                            maxDate={null}
                            autoComplete="off"
                            dropdownMode="select"
                            dateFormat="dd-MM-yyyy"
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
                            <i className="fa fa-search"></i>
                          </Button>
                          <Button
                            type="button"
                            color="primary"
                            className="btn-square"
                            onClick={this.clearAll}
                          >
                            <i className="fa fa-refresh"></i>
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
                          onClick={() =>
                            this.props.history.push(`/admin/expense/supplier-invoice/create`)
                          }
                        >
                          <i className="fas fa-plus mr-1" />
                          {strings.AddNewInvoice}
                        </Button>
                      </div>
                    </Row>
                    <ServerDataTable
                      columns={this.getColumns()}
                      data={supplier_invoice_data}
                      pageCount={pageCount}
                      totalCount={supplier_invoice_list.count || 0}
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
                      emptyMessage="No supplier invoices found."
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
          <EmailModal
            openEmailModal={this.state.openEmailModal}
            closeEmailModal={e => {
              this.closeEmailModal(e);
            }}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SupplierInvoice);
