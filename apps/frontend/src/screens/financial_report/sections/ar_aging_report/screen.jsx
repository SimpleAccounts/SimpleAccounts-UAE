import { useState, useEffect, useRef } from 'react';
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
} from 'components/migration';
import dayjs from '@/utils/date';
import { PDFExport } from '@progress/kendo-react-pdf';
import XLSX from 'utils/excelExport';
import { Loader } from 'components';
import * as FinancialReportActions from '../../actions';
import FilterComponent from '../filterComponent';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { ReportTables } from 'screens/financial_report/sections';
import { useNavigate } from 'react-router-dom';
import { Settings, Printer } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const ArAgingReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile, universal_currency_list, company_profile, ar_aging_report } = useSelector(
    state => ({
      profile: state.auth.profile,
      universal_currency_list: state.common.universal_currency_list,
      company_profile: state.reports.company_profile,
      ar_aging_report: state.reports.ar_aging_report,
    })
  );

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [view, setView] = useState(false);
  const [initValue, setInitValue] = useState({
    startDate: dayjs().startOf('month').format('DD/MM/YYYY'),
    endDate: dayjs().endOf('month').format('DD/MM/YYYY'),
  });
  const [agingResponseModelList, setAgingResponseModelList] = useState([]);

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
    dispatch(FinancialReportActions.getAgingReport(postData))
      .then(res => {
        if (res.status === 200) {
          let list = res.data.agingResponseModelList;
          list = list.map((row, i) => {
            row.id = i + 1;
            return row;
          });
          setAgingResponseModelList(list);
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const generateReport = value => {
    const newInitValue = {
      startDate: dayjs(value.startDate).format('DD/MM/YYYY'), // Not used in postData? Original used initValue.startDate which was defaulted. But generateReport sets startDate.
      endDate: dayjs(value.endDate).format('DD/MM/YYYY'),
    };
    // Note: Original code commented out startDate in generateReport setState
    // But initializeData uses initValue.startDate.
    // If we want to filter by date range, we should update both.
    // Assuming endDate is the primary filter for "As of" date in Aging reports usually.

    setInitValue(newInitValue);
    setLoading(true);
    setView(!view);
    initializeData(newInitValue);
  };

  const exportFile = () => {
    const worksheet = XLSX.utils.json_to_sheet(agingResponseModelList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AR Aging Report');
    XLSX.writeFile(workbook, 'AR Aging Report.csv');
  };

  const exportExcelFile = () => {
    const worksheet = XLSX.utils.json_to_sheet(agingResponseModelList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AR Aging Report');
    XLSX.writeFile(workbook, 'AR Aging Report.xlsx');
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
              <FilterComponent viewFilter={viewFilter} generateReport={generateReport} />{' '}
            </div>
            <CardBody id="section-to-print">
              <PDFExport
                ref={pdfExportComponent}
                scale={0.8}
                paperSize="A3"
                fileName="AR Aging Report.pdf"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginUp: '1rem',
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
                    <br style={{ marginUp: '5px' }} />
                    <b style={{ fontSize: '18px' }}>{strings.ARAgingReport}</b>
                    <br style={{ marginUp: '5px' }} />
                    {strings.Ason} {initValue.endDate.replaceAll('/', '-')}
                  </div>
                  <div></div>
                </div>
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    <ReportTables
                      reportDataList={agingResponseModelList}
                      reportName={'AR Aging Report'}
                      id={17}
                    />
                  </>
                )}
                <div style={{ textAlignLast: 'center' }}>
                  {strings.PoweredBy} <b>SimpleAccounts</b>
                </div>
              </PDFExport>
            </CardBody>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ArAgingReport;
