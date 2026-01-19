import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Card,
  CardHeader,
  CardBody,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'components/migration';
import dayjs from '@/utils/date';
import XLSX from 'utils/excelExport';
import { Loader } from 'components';
import * as FinancialReportActions from '../../actions';
import { ReportTables } from 'screens/financial_report/sections';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import FilterComponent3 from '../filterComponent3';
import { Printer } from 'lucide-react';

const mapStateToProps = state => {
  return {
    company_profile: state.reports.company_profile,
    sales_by_customer: state.reports.sales_by_customer,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    financialReportActions: bindActionCreators(FinancialReportActions, dispatch),
  };
};
let strings = new LocalizedStrings(data);
class SalesByCustomer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language'),
      loading: true,
      customPeriod: 'customRange',
      hideAsOn: true,
      dropdownOpen: false,
      view: false,
      initValue: {
        startDate: dayjs().startOf('month').format('DD/MM/YYYY'),
        endDate: dayjs().endOf('month').format('DD/MM/YYYY'),
      },
      csvData: [],
      activePage: 1,
      sizePerPage: 10,
      totalCount: 0,
      sort: {
        column: null,
        direction: 'desc',
      },
      data: [],
    };
  }

  generateReport = value => {
    this.setState(
      {
        initValue: {
          startDate: dayjs(value.startDate).format('DD/MM/YYYY'),
          endDate: dayjs(value.endDate).format('DD/MM/YYYY'),
        },
        loading: true,
        view: !this.state.view,
      },
      () => {
        this.initializeData();
      }
    );
  };

  componentDidMount = () => {
    this.props.financialReportActions.getCompany();
    this.initializeData();
  };

  initializeData = () => {
    const { initValue } = this.state;
    const postData = {
      startDate: initValue.startDate,
      endDate: initValue.endDate,
    };
    this.props.financialReportActions
      .getSalesByCustomer(postData)
      .then(res => {
        if (res.status === 200) {
          let sbcustomerList = res.data.sbcustomerList;
          sbcustomerList.push({
            currentAmount: null,
            customerName: strings.Total,
            getSalesWithvat: res.data.totalAmount,
            invoiceCount: null,
            invoiceId: null,
            salesExcludingvat: res.data.totalExcludingVat,
            isTotalRow: true,
          });
          sbcustomerList = sbcustomerList.map((row, i) => {
            row.id = i + 1;
            return row;
          });
          this.setState({
            salesByCustomerList: sbcustomerList,
            data: res.data,
            loading: false,
          });
        }
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  };

  exportFile = () => {
    const { salesByCustomerList } = this.state;
    const worksheet = XLSX.utils.json_to_sheet(salesByCustomerList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales By Customer');
    XLSX.writeFile(workbook, 'Sales By Customer.csv');
  };

  exportExcelFile = () => {
    const { salesByCustomerList } = this.state;
    const worksheet = XLSX.utils.json_to_sheet(salesByCustomerList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales By Customer');
    XLSX.writeFile(workbook, 'Sales By Customer.xlsx');
  };

  toggle = () =>
    this.setState(prevState => {
      return { dropdownOpen: !prevState.dropdownOpen };
    });

  viewFilter = () =>
    this.setState(prevState => {
      return { view: !prevState.view };
    });

  exportPDFWithComponent = () => {
    this.pdfExportComponent.save();
  };

  hideExportOptionsFunctionality = val => {
    this.setState({ hideExportOptions: val });
  };

  render() {
    strings.setLanguage(this.state.language);
    const { loading, initValue, dropdownOpen, salesByCustomerList, view, customPeriod, hideAsOn } =
      this.state;
    const { company_profile } = this.props;
    return (
      <div className="transactions-report-screen">
        <div className="animated fadeIn">
          <Card>
            <div>
              {!this.state.hideExportOptions && (
                <div
                  className="h4 mb-0 d-flex align-items-center pull-right"
                  style={{
                    justifyContent: 'space-between',
                    marginRight: '20px',
                    marginTop: '55px',
                  }}
                >
                  <div className="d-flex">
                    <Dropdown isOpen={dropdownOpen} toggle={this.toggle}>
                      <DropdownToggle caret>Export As</DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem
                          onClick={() => {
                            this.exportFile();
                          }}
                        >
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
                        <DropdownItem
                          onClick={() => {
                            this.exportExcelFile();
                          }}
                        >
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
                        <DropdownItem onClick={this.exportPDFWithComponent}>Pdf</DropdownItem>
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
                        this.props.history.push('/admin/report/reports-page');
                      }}
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      <span>X</span>
                    </div>
                  </div>
                </div>
              )}
              <CardHeader>
                <FilterComponent3
                  hideExportOptionsFunctionality={val => this.hideExportOptionsFunctionality(val)}
                  customPeriod={customPeriod}
                  hideAsOn={hideAsOn}
                  viewFilter={this.viewFilter}
                  generateReport={value => {
                    this.generateReport(value);
                  }}
                  setCutomPeriod={value => {
                    this.setState({ customPeriod: value });
                  }}
                  handleCancel={() => {
                    if (customPeriod === 'customRange') {
                      const currentDate = dayjs();
                      this.setState(prevState => ({
                        initValue: {
                          ...prevState.initValue,
                          endDate: currentDate,
                        },
                      }));
                      this.generateReport({ endDate: currentDate });
                    }
                    this.setState({ customPeriod: 'customRange' });
                  }}
                />
              </CardHeader>
              <CardBody id="section-to-print">
                <PDFExport
                  ref={component => (this.pdfExportComponent = component)}
                  scale={1}
                  paperSize="auto"
                  fileName="Sales By Customer.pdf"
                  margin={{ top: 50, left: 80, right: 80, bottom: 0 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      marginTop: '5rem',
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
                      <b style={{ fontSize: '18px' }}>{strings.SalesByCustomer}</b>
                      <br style={{ marginBottom: '5px' }} />
                      {customPeriod === 'asOn'
                        ? `${strings.Ason} ${initValue.endDate.replaceAll('/', '-')}`
                        : `${strings.From} ${initValue.startDate.replaceAll('/', '-')} to ${initValue.endDate.replaceAll('/', '-')}`}
                    </div>
                    <div></div>
                  </div>
                  {loading ? (
                    <Loader />
                  ) : (
                    <>
                      <ReportTables
                        reportDataList={salesByCustomerList}
                        reportName={'Sales By Customer'}
                        id={2}
                        rowHeight={50}
                      />
                    </>
                  )}
                  <div style={{ textAlignLast: 'center' }}>
                    {strings.PoweredBy} <b>SimpleAccounts</b>
                  </div>
                </div>
              </CardBody>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SalesByCustomer);
