import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Table,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'components/migration';
import dayjs from '@/utils/date';
import XLSX from 'utils/excelExport';
import { Loader, Currency } from 'components';
import * as FinancialReportActions from '../../actions';
import FilterComponent2 from '../filterComponet2';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Printer } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const InvoiceDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile, universal_currency_list, company_profile, creditnote_details } = useSelector(
    state => ({
      profile: state.auth.profile,
      universal_currency_list: state.common.universal_currency_list,
      company_profile: state.reports.company_profile,
      creditnote_details: state.reports.creditnote_details,
    })
  );

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [view, setView] = useState(false);
  const [initValue, setInitValue] = useState({
    startDate: dayjs().startOf('month').format('DD/MM/YYYY'),
    endDate: dayjs().endOf('month').format('DD/MM/YYYY'),
  });
  const [data, setData] = useState({
    invoiceSummaryModelList: [],
    totalAmount: 0,
    totalBalance: 0,
  });

  const pdfExportComponent = useRef(null);

  useEffect(() => {
    strings.setLanguage(language);
    dispatch(FinancialReportActions.getCompany());
    initializeData();
  }, [language]);

  const initializeData = (currentInitValue = initValue) => {
    const postData = {
      startDate: currentInitValue.startDate,
      endDate: currentInitValue.endDate,
    };
    dispatch(FinancialReportActions.getInvoiceDetails(postData))
      .then(res => {
        if (res.status === 200) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const generateReport = value => {
    const newInitValue = {
      startDate: dayjs(value.startDate).format('DD/MM/YYYY'),
      endDate: dayjs(value.endDate).format('DD/MM/YYYY'),
    };
    setInitValue(newInitValue);
    setLoading(true);
    setView(!view);
    initializeData(newInitValue);
  };

  const exportFile = () => {
    let dl = '';
    let fn = '';
    let type = 'csv';
    var elt = document.getElementById('tbl_exporttable_to_xls');
    var wb = XLSX.utils.table_to_book(elt, { sheet: 'sheet1' });
    return dl
      ? XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' })
      : XLSX.writeFile(wb, fn || 'Invoice Details Report.' + (type || 'csv'));
  };

  const exportExcelFile = () => {
    let dl = '';
    let fn = '';
    let type = 'xlsx';
    var elt = document.getElementById('tbl_exporttable_to_xls');
    var wb = XLSX.utils.table_to_book(elt, { sheet: 'sheet1' });
    return dl
      ? XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' })
      : XLSX.writeFile(wb, fn || 'Invoice Details Report.' + (type || 'xlsx'));
  };

  const toggle = () => setDropdownOpen(!dropdownOpen);
  const viewFilter = () => setView(!view);
  const exportPDFWithComponent = () => pdfExportComponent.current.save();

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
                    <div className="d-flex">
                      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                        <DropdownToggle caret>Export As</DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem onClick={exportFile}>
                            <span
                              style={{
                                border: 0,
                                padding: 0,
                                backgroundColor: 'white !important',
                              }}
                            >
                              CSV (Comma Separated Value)
                            </span>
                          </DropdownItem>
                          <DropdownItem onClick={exportExcelFile}>
                            <span
                              style={{
                                border: 0,
                                padding: 0,
                                backgroundColor: 'white !important',
                              }}
                            >
                              Excel
                            </span>
                          </DropdownItem>
                          <DropdownItem onClick={exportPDFWithComponent}>Pdf</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
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
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <div className={`panel ${view ? 'view-panel' : ''}`}>
              <FilterComponent2 viewFilter={viewFilter} generateReport={generateReport} />{' '}
            </div>
            <CardBody id="section-to-print">
              <PDFExport
                ref={pdfExportComponent}
                scale={0.8}
                paperSize="A3"
                fileName="Invoice Details.pdf"
              >
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
                    <b style={{ fontSize: '18px' }}>{strings.InvoiceDetails}</b>
                    <br style={{ marginBottom: '5px' }} />
                    {strings.From} {initValue.startDate.replaceAll('/', '-')} {strings.To}{' '}
                    {initValue.endDate.replaceAll('/', '-')}
                  </div>
                  <div></div>
                </div>
                {loading ? (
                  <Loader />
                ) : (
                  <div id="tbl_exporttable_to_xls" className="table-wrapper">
                    <Table className="table-bordered">
                      <thead className="table-header-bg">
                        <tr>
                          <th style={{ padding: '0.5rem', textAlign: 'center', color: 'black' }}>
                            {strings.Invoice + ' ' + strings.Number}
                          </th>
                          <th style={{ padding: '0.5rem', textAlign: 'center', color: 'black' }}>
                            {strings.CustomerName}
                          </th>
                          <th style={{ padding: '0.5rem', textAlign: 'center', color: 'black' }}>
                            {strings.Invoice + ' ' + strings.Date}
                          </th>
                          <th style={{ padding: '0.5rem', textAlign: 'center', color: 'black' }}>
                            {strings.Invoice + ' ' + strings.Due + ' ' + strings.Date}
                          </th>
                          <th style={{ padding: '0.5rem', textAlign: 'center', color: 'black' }}>
                            {strings.Status}
                          </th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', color: 'black' }}>
                            {strings.InvoiceAmount}
                          </th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', color: 'black' }}>
                            {' '}
                            {strings.RemainingBalance}
                          </th>
                        </tr>
                      </thead>
                      <tbody className=" table-bordered table-hover">
                        {data.invoiceSummaryModelList &&
                          data.invoiceSummaryModelList.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td style={{ textAlign: 'center pull-left' }}>
                                  <Link
                                    to={{
                                      pathname: '/admin/income/customer-invoice/view',
                                      state: {
                                        id: item.invoiceId,
                                        gotoReports: '/admin/report/invoice-details',
                                      },
                                    }}
                                    style={{
                                      textAlign: 'left',
                                      color: '#2046DB',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {item.invoiceNumber}
                                  </Link>
                                </td>
                                <td style={{ textAlign: 'center pull-left' }}>
                                  {item.customerName}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {item.invoiceDate
                                    ? dayjs(item.invoiceDate).format('DD-MM-YYYY')
                                    : ' '}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {item.invoiceDueDate
                                    ? dayjs(item.invoiceDueDate).format('DD-MM-YYYY')
                                    : ' '}
                                </td>
                                <td style={{ textAlign: 'center pull-left' }}>{item.status}</td>
                                <td style={{ textAlign: 'right' }}>
                                  <Currency
                                    value={item.invoiceTotalAmount}
                                    currencySymbol={
                                      universal_currency_list[0]
                                        ? universal_currency_list[0].currencyIsoCode
                                        : 'USD'
                                    }
                                  />
                                </td>

                                <td style={{ textAlign: 'right' }}>
                                  <Currency
                                    value={item.balance}
                                    currencySymbol={
                                      universal_currency_list[0]
                                        ? universal_currency_list[0].currencyIsoCode
                                        : 'USD'
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                      <tfoot>
                        <tr style={{ border: '3px solid #dfe9f7' }}>
                          <td style={{ textAlign: 'center', width: '20%' }}>
                            <b>{strings.Total}</b>
                          </td>
                          <td></td> <td></td> <td></td>
                          <td></td>
                          <td style={{ textAlign: 'right', width: '20%' }}>
                            <b>
                              <Currency
                                value={data.totalAmount}
                                currencySymbol={
                                  universal_currency_list[0]
                                    ? universal_currency_list[0].currencyIsoCode
                                    : 'USD'
                                }
                              />
                            </b>
                          </td>
                          <td style={{ textAlign: 'right', width: '20%' }}>
                            <b>
                              <Currency
                                value={data.totalBalance}
                                currencySymbol={
                                  universal_currency_list[0]
                                    ? universal_currency_list[0].currencyIsoCode
                                    : 'USD'
                                }
                              />
                            </b>
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                )}
                <div style={{ textAlignLast: 'center' }}>
                  {' '}
                  {strings.PoweredBy} <b>SimpleAccounts</b>
                </div>
              </div>
            </CardBody>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceDetails;
