import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
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
} from 'reactstrap';
import moment from 'moment';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as XLSX from 'xlsx';
import { Loader } from 'components';
import * as FinancialReportActions from '../../actions';
import FilterComponent2 from '../filterComponet2';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import FilterComponent3 from '../filterComponent3';
import { ReportTables } from 'screens/financial_report/sections';


const mapStateToProps = (state) => {
    return {
        company_profile: state.reports.company_profile,
        payable_invoice: state.reports.payable_invoice,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        financialReportActions: bindActionCreators(
            FinancialReportActions,
            dispatch,
        ),
    };
};
let strings = new LocalizedStrings(data);
class PayrollSummaryReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window['localStorage'].getItem('language'),
            loading: false,
            dropdownOpen: false,
            customPeriod: 'customRange',
			hideAsOn: true,
            hideExportOptions: false,
            view: false,
            initValue: {
                startDate: moment().startOf('month').format('DD/MM/YYYY'),
                endDate: moment().format('DD/MM/YYYY'),

            },
            showTable: true,
            csvData: [],
            activePage: 1,
            sizePerPage: 10,
            totalCount: 0,
        };
    }

    generateReport = (value) => {
        this.setState(
            {
                initValue: {
                    startDate: moment(value.startDate).format('DD/MM/YYYY'),
                    endDate: moment(value.endDate).format('DD/MM/YYYY'),
                },
                loading: true,
                // view: !this.state.view,
            },
            () => {
                this.initializeData();
            },
        );
    };

    componentDidMount = () => {
        this.props.financialReportActions.getCompany()
        this.initializeData();
    };

    initializeData = () => {
        const { initValue } = this.state;
        const postData = {
            startDate: initValue.startDate,
            endDate: initValue.endDate,
        };
        this.props.financialReportActions
            .getPayrollSummaryReport(postData)
            .then((res) => {
                if (res.status === 200) {
                    let payrollSummaryModelList = res.data.payrollSummaryModelList
                    payrollSummaryModelList = payrollSummaryModelList.map((row, i) => {
                        row.id = i + 1;
                        return row
                    })
                    this.setState({
                        payrollSummaryModelList: payrollSummaryModelList,
                        loading: false,
                    });
                }
            })
            .catch((err) => {
                this.setState({ loading: false });
            });
    };

    exportFile = () => {
		const { payrollSummaryModelList } = this.state; 
		const worksheet = XLSX.utils.json_to_sheet(payrollSummaryModelList); 
		const workbook = XLSX.utils.book_new(); 
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll summary'); 
		XLSX.writeFile(workbook, 'Payroll_Summary_Report.csv'); 
	};

    exportExcelFile = () => {
		const { payrollSummaryModelList } = this.state; 
		const worksheet = XLSX.utils.json_to_sheet(payrollSummaryModelList); 
		const workbook = XLSX.utils.book_new(); 
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Summary'); 
		XLSX.writeFile(workbook, 'Payroll_Summary_Report.xlsx'); 
	};

    toggle = () =>
        this.setState((prevState) => {
            return { dropdownOpen: !prevState.dropdownOpen };
        });

    viewFilter = () =>
        this.setState((prevState) => {
            return { view: !prevState.view };
        });

    exportPDFWithComponent = () => {
        this.pdfExportComponent.save();
    };
    hideExportOptionsFunctionality = (val) => {
		this.setState({ hideExportOptions: val });
	}
    render() {
        strings.setLanguage(this.state.language);
        const { loading, initValue, dropdownOpen, payrollSummaryModelList, view, customPeriod,hideAsOn } = this.state;
        const { company_profile } = this.props;
        return (
            <div className="transactions-report-screen">
                <div className="animated fadeIn">
                    <Card>
                        <div>
                        {!this.state.hideExportOptions &&
                                        <div
                                            className="h4 mb-0 d-flex align-items-center pull-right"
                                            style={{ justifyContent: 'space-between',marginRight: '20px', marginTop: '55px' }}
                                        >
                                            <div className="d-flex">
                                                <div>
                                                    <Dropdown isOpen={dropdownOpen} toggle={this.toggle}>
                                                        <DropdownToggle caret>Export As</DropdownToggle>
                                                        <DropdownMenu>

                                                            <DropdownItem onClick={() => { this.exportFile() }}>
                                                                <span
                                                                    style={{
                                                                        border: 0,
                                                                        padding: 0,
                                                                        backgroundColor: "white !important"
                                                                    }}
                                                                >CSV (Comma Separated Value)</span>
                                                            </DropdownItem>
                                                            <DropdownItem onClick={() => { this.exportExcelFile() }}>
                                                                <span
                                                                    style={{
                                                                        border: 0,
                                                                        padding: 0,
                                                                        backgroundColor: "white !important"
                                                                    }}
                                                                >Excel</span>
                                                            </DropdownItem>
                                                            <DropdownItem onClick={this.exportPDFWithComponent}>
                                                                Pdf
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown></div> &nbsp;&nbsp;
                                                <div
                                                    className="mr-2 print-btn-cont"
                                                    onClick={() => window.print()}
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <i className="fa fa-print"></i>
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
                                        }
                            <CardHeader>
							<FilterComponent3
									hideExportOptionsFunctionality={(val) => this.hideExportOptionsFunctionality(val)}
									customPeriod={customPeriod}
									hideAsOn={hideAsOn}
									viewFilter={this.viewFilter}
									generateReport={(value) => {
										this.generateReport(value);
									}}
									setCutomPeriod={(value) => {
										this.setState({ customPeriod: value })
									}}
									handleCancel={() => {
										if (customPeriod === 'customRange') {
										const currentDate = moment();
										this.setState(prevState => ({
										initValue: {
										...prevState.initValue,
										endDate: currentDate,            }
										 }));
										this.generateReport({ endDate: currentDate });
										}
										this.setState({ customPeriod: 'customRange' });
										}}
										/>
									</CardHeader>
                            <CardBody id="section-to-print">
                                <PDFExport
                                    ref={(component) => (this.pdfExportComponent = component)}
                                    scale={0.8}
                                    // paperSize="A3"
                                    margin={{ top: 0, left: 80, right: 80, bottom: 0 }}
                                    fileName="Payrolls Summary Report.pdf"
                                >
                                    <div style={{

                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem'
                                    }}>
                                        <div>
                                            <img
                                                src={
                                                    company_profile &&
                                                        company_profile.companyLogoByteArray
                                                        ? 'data:image/jpg;base64,' +
                                                        company_profile.companyLogoByteArray
                                                        : logo
                                                }
                                                className=""
                                                alt=""
                                                style={{ width: ' 150px' }}></img>


                                        </div>
                                        <div style={{ textAlign: 'center' }} >

                                            <h2>
                                                {company_profile &&
                                                    company_profile['companyName']
                                                    ? company_profile['companyName']
                                                    : ''}
                                            </h2>
                                            <br style={{ marginBottom: '5px' }} />
                                            <b style={{ fontSize: '18px' }}>{strings.Payroll + "s  " + strings.Summary}</b>
                                            <br style={{ marginBottom: '5px' }} />
                                            {customPeriod === 'asOn' ? `${strings.Ason} ${initValue.endDate.replaceAll("/", "-")}`
											 : `${strings.From} ${initValue.startDate.replaceAll("/", "-")} to ${initValue.endDate.replaceAll("/", "-")}`}
										
                                        </div>
                                        <div>
                                        </div>
                                    </div>
                                    {loading ? (
                                        <Loader />
                                    ) : (
                                        <>
                                            <ReportTables
                                                reportDataList={payrollSummaryModelList}
                                                reportName={'PayrollSummaryReport'}
                                                id={1}
                                                rowHeight={100}
                                            />
                                        </>
                                    )}
                                    <div style={{ textAlignLast: 'center' }}> {strings.PoweredBy} <b>SimpleAccounts</b></div>
                                </PDFExport>
                            </CardBody>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PayrollSummaryReport);
