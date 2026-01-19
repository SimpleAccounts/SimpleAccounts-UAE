import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  FormGroup,
  Label,
  Form,
} from 'components/migration';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import './style.scss';
import dayjs from '@/utils/date';
import XLSX from 'utils/excelExport';
import { Loader, Currency } from 'components';
import { DataTable } from '@/components/ui/data-table';
import * as FinancialReportActions from '../../actions';
import logo from 'assets/images/brand/logo.png';
import { CommonActions } from 'services/global';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { useNavigate } from 'react-router-dom';
import { Settings, Printer, CircleDot } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const SOAReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile, universal_currency_list, company_profile } = useSelector(state => ({
    profile: state.auth.profile,
    universal_currency_list: state.common.universal_currency_list,
    company_profile: state.reports.company_profile,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [view, setView] = useState(false);
  const [contactId, setContactId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customer_list, setCustomerList] = useState([]);
  const [soa_data, setSoaData] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0.0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0.0);
  const [totalBalance, setTotalBalance] = useState(0.0);
  const [totalInvoicedAmount, setTotalInvoicedAmount] = useState(0.0);
  const [displayDates, setDisplayDates] = useState({ startDate: '', endDate: '' });

  const pdfExportComponent = useRef(null);

  useEffect(() => {
    strings.setLanguage(language);
    dispatch(CommonActions.getCompany());
    initializeData();
  }, [language]);

  const { control, watch, getValues } = useForm({
    defaultValues: {
      startDate: null,
      endDate: null,
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const initializeData = () => {
    dispatch(FinancialReportActions.getCustomerList())
      .then(res => {
        setCustomerList(res);
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const generateReport = () => {
    const values = getValues();
    setDisplayDates({
      startDate: values.startDate ? dayjs(values.startDate).format('DD/MM/YYYY') : '',
      endDate: values.endDate ? dayjs(values.endDate).format('DD/MM/YYYY') : '',
    });
    setCustomerName(contactId && contactId.label ? contactId.label : '');

    const postData = {
      startDate: values.startDate ? dayjs(values.startDate).format('DD/MM/YYYY') : '',
      endDate: values.endDate ? dayjs(values.endDate).format('DD/MM/YYYY') : '',
      customerId: contactId && contactId.value ? contactId.value : '',
    };

    setLoading(true);
    dispatch(FinancialReportActions.getSOA(postData))
      .then(res => {
        if (res.status === 200) {
          setOpeningBalance(res.data.openingBalance ? res.data.openingBalance : 0.0);
          setTotalAmountPaid(res.data.totalAmountPaid ? res.data.totalAmountPaid : 0.0);
          setTotalBalance(res.data.totalBalance ? res.data.totalBalance : 0.0);
          setTotalInvoicedAmount(res.data.totalInvoicedAmount ? res.data.totalInvoicedAmount : 0.0);
          setSoaData(res.data.transactionsModelList ? res.data.transactionsModelList : []);
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const exportFile = () => {
    let dl = '';
    let fn = '';
    let type = 'csv';
    var elt = document.getElementById('tbl_exporttable_to_xls');
    var wb = XLSX.utils.table_to_book(elt, { sheet: 'sheet1' });
    return dl
      ? XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' })
      : XLSX.writeFile(wb, fn || 'Statement Of Account( ' + customerName + ' ).' + (type || 'csv'));
  };

  const exportExcelFile = () => {
    let dl = '';
    let fn = '';
    let type = 'xlsx';
    var elt = document.getElementById('tbl_exporttable_to_xls');
    var wb = XLSX.utils.table_to_book(elt, { sheet: 'sheet1' });
    return dl
      ? XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' })
      : XLSX.writeFile(
          wb,
          fn || 'Statement Of Account( ' + customerName + ' ).' + (type || 'xlsx')
        );
  };

  const toggle = () => setDropdownOpen(!dropdownOpen);
  const viewFilter = () => setView(!view);
  const exportPDFWithComponent = () => pdfExportComponent.current.save();

  const renderDate = cell => {
    if (cell.invoiceNumber === 'Total Balance Due') return '';
    else return dayjs(cell.date).format('DD-MM-YYYY');
  };

  const renderInvoiceNumber = cell => {
    if (cell.invoiceNumber === 'Total Balance Due') return <b> {cell.invoiceNumber}</b>;
    else return cell.invoiceNumber;
  };

  const renderTotalBalanceDueAmount = cell => {
    if (cell.invoiceNumber === 'Total Balance Due')
      return (
        <b>
          <Currency
            value={cell.balanceAmount}
            currencySymbol={
              universal_currency_list[0] ? universal_currency_list[0].currencyIsoCode : 'USD'
            }
          />
        </b>
      );
    else
      return (
        <Currency
          value={cell.balanceAmount}
          currencySymbol={
            universal_currency_list[0] ? universal_currency_list[0].currencyIsoCode : 'USD'
          }
        />
      );
  };

  const renderAmount = (cell, value) => {
    if (value == null) return '';
    else
      return (
        <Currency
          value={value}
          currencySymbol={
            universal_currency_list[0] ? universal_currency_list[0].currencyIsoCode : 'USD'
          }
        />
      );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => renderDate(row.original),
      },
      {
        accessorKey: 'typeName',
        header: 'Transaction',
      },
      {
        accessorKey: 'invoiceNumber',
        header: 'Details',
        cell: ({ row }) => renderInvoiceNumber(row.original),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <div className="text-right">{renderAmount(row.original, row.original.amount)}</div>
        ),
      },
      {
        accessorKey: 'paymentAmount',
        header: 'Payments',
        cell: ({ row }) => (
          <div className="text-right">{renderAmount(row.original, row.original.paymentAmount)}</div>
        ),
      },
      {
        accessorKey: 'balanceAmount',
        header: 'Balance',
        cell: ({ row }) => (
          <div className="text-right">{renderTotalBalanceDueAmount(row.original)}</div>
        ),
      },
    ],
    [universal_currency_list]
  );

  let tmpCustomer_list = [];
  if (customer_list)
    customer_list.map(item => {
      let obj = { label: item.label.contactName, value: item.value };
      tmpCustomer_list.push(obj);
    });

  return (
    <div className="transactions-report-screen">
      <div className="animated fadeIn">
        <Card>
          <div>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div
                    className="h4 mb-0 d-flex align-items-center"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <div>
                      <p
                        className="mb-0"
                        style={{
                          cursor: 'pointer',
                          fontSize: '1rem',
                          paddingLeft: '15px',
                        }}
                        onClick={viewFilter}
                      >
                        <Settings className="h-4 w-4" />
                        {strings.CustomizeReport}
                      </p>
                    </div>

                    {soa_data.length !== 0 && (
                      <div className="d-flex">
                        <div>
                          <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                            <DropdownToggle caret>Export As</DropdownToggle>
                            <DropdownMenu>
                              <DropdownItem>
                                <span
                                  style={{
                                    border: 0,
                                    padding: 0,
                                    backgroundColor: 'white !important',
                                  }}
                                  onClick={() => {
                                    exportFile();
                                  }}
                                >
                                  CSV (Comma Separated Value)
                                </span>
                              </DropdownItem>
                              <DropdownItem>
                                <span
                                  style={{
                                    border: 0,
                                    padding: 0,
                                    backgroundColor: 'white !important',
                                  }}
                                  onClick={() => {
                                    exportExcelFile();
                                  }}
                                >
                                  Excel
                                </span>
                              </DropdownItem>
                              <DropdownItem onClick={exportPDFWithComponent}>Pdf</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>{' '}
                        &nbsp;&nbsp;
                        <div
                          className="mr-2 print-btn-cont"
                          onClick={() => window.print()}
                          style={{
                            cursor: 'pointer',
                          }}
                        >
                          <Printer className="h-4 w-4" />
                        </div>
                        <div
                          className="mr-2 print-btn-cont"
                          onClick={() => {
                            navigate('/admin/report/reports-page');
                          }}
                          style={{
                            cursor: 'pointer',
                          }}
                        >
                          <span>X</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <div>
              <CardBody>
                <Form>
                  <Row>
                    <Col lg={3}>
                      <FormGroup className="mb-3">
                        <Label htmlFor="contactId">{strings.CustomerName}</Label>
                        <Select
                          className="select-default-width"
                          id="contactId"
                          name="contactId"
                          placeholder={strings.Select + strings.CustomerName}
                          options={tmpCustomer_list ? tmpCustomer_list : []}
                          value={contactId}
                          onChange={option => {
                            if (option && option.value) {
                              setContactId(option);
                            } else {
                              setContactId(null);
                            }
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col lg={3}>
                      <FormGroup className="mb-3">
                        <Label htmlFor="startDate">{strings.StartDate}</Label>
                        <Controller
                          name="startDate"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <DatePicker
                              id="startDate"
                              className="form-control"
                              placeholderText="From"
                              showMonthDropdown
                              showYearDropdown
                              autoComplete="off"
                              selected={value}
                              dropdownMode="select"
                              dateFormat="dd-MM-yyyy"
                              onChange={onChange}
                            />
                          )}
                        />
                      </FormGroup>
                    </Col>
                    <Col lg={3}>
                      <FormGroup className="mb-3">
                        <Label htmlFor="endDate">{strings.EndDate}</Label>
                        <Controller
                          name="endDate"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <DatePicker
                              id="endDate"
                              className="form-control"
                              autoComplete="off"
                              placeholderText="To"
                              showMonthDropdown
                              showYearDropdown
                              selected={value}
                              dropdownMode="select"
                              dateFormat="dd-MM-yyyy"
                              onChange={onChange}
                            />
                          )}
                        />
                      </FormGroup>
                    </Col>
                    <Col lg={3}>
                      <FormGroup className="mt-4">
                        <Button
                          type="button"
                          color="primary"
                          className="btn-square"
                          onClick={generateReport}
                        >
                          <CircleDot className="h-4 w-4" /> {strings.RunReport}
                        </Button>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </div>
          </div>
        </Card>

        {soa_data.length !== 0 && (
          <PDFExport
            ref={pdfExportComponent}
            scale={0.8}
            paperSize="A3"
            fileName={'Statement Of Account ( ' + customerName + ' ).pdf'}
          >
            <Card id="section-to-print">
              <CardBody>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <img
                      src={
                        company_profile && company_profile.companyLogoByteArray
                          ? 'data:image/jpg;base64,' + company_profile.companyLogoByteArray
                          : logo
                      }
                      className=""
                      alt=""
                      style={{ width: ' 150px' }}
                    ></img>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h2>
                      {company_profile && company_profile['companyName']
                        ? company_profile['companyName']
                        : ''}
                    </h2>
                    <br style={{ marginBottom: '5px' }} />
                    <b style={{ fontSize: '18px' }}>Statement of Account ( {customerName} )</b>
                    <br style={{ marginBottom: '5px' }} />
                    {strings.From} {displayDates.startDate.replaceAll('/', '-')} {strings.To}{' '}
                    {displayDates.endDate.replaceAll('/', '-')}
                  </div>
                  <div></div>
                </div>
                {loading ? (
                  <Loader />
                ) : (
                  <div id="tbl_exporttable_to_xls" className="table-wrapper">
                    <div className="ml-2 mt-5 mb-5 " style={{ width: '35%' }}>
                      <table className="table-bordered" width="100%">
                        <tbody>
                          <tr>
                            <td>
                              <b>Opening Balance</b>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Currency
                                value={openingBalance}
                                currencySymbol={
                                  universal_currency_list[0]
                                    ? universal_currency_list[0].currencyIsoCode
                                    : 'USD'
                                }
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <b>Invoiced amount</b>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Currency
                                value={totalInvoicedAmount}
                                currencySymbol={
                                  universal_currency_list[0]
                                    ? universal_currency_list[0].currencyIsoCode
                                    : 'USD'
                                }
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <b>Amount Received</b>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Currency
                                value={totalAmountPaid}
                                currencySymbol={
                                  universal_currency_list[0]
                                    ? universal_currency_list[0].currencyIsoCode
                                    : 'USD'
                                }
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <b>Balance Due</b>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Currency
                                value={totalBalance}
                                currencySymbol={
                                  universal_currency_list[0]
                                    ? universal_currency_list[0].currencyIsoCode
                                    : 'USD'
                                }
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <Row>
                      <Col></Col>
                      <Col></Col>
                    </Row>

                    <DataTable data={soa_data} columns={columns} manualPagination={false} />

                    <hr />
                  </div>
                )}
                <div style={{ textAlignLast: 'center' }}>
                  {strings.PoweredBy} <b>SimpleAccounts</b>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOAReport;
