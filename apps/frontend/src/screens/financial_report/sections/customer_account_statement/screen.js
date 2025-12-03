import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
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
} from "reactstrap";
import moment from "moment";
import { PDFExport } from "@progress/kendo-react-pdf";
import * as XLSX from "xlsx";
import { Loader } from "components";
import * as FinancialReportActions from "../../actions";
import FilterComponent2 from "../filterComponet2";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { ReportTables } from "screens/financial_report/sections";
import "./style.scss";
import logo from "assets/images/brand/logo.png";
import { data } from "../../../Language/index";
import LocalizedStrings from "react-localization";
import FilterComponent3 from '../filterComponent3';

const mapStateToProps = (state) => {
  return {
    company_profile: state.reports.company_profile,
    sales_by_customer: state.reports.sales_by_customer,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    financialReportActions: bindActionCreators(
      FinancialReportActions,
      dispatch
    ),
  };
};
let strings = new LocalizedStrings(data);
class CustomerAccountStatement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      loading: true,
			customPeriod: 'asOn',
      hideCustomPeriod: true,
      dropdownOpen: false,
      view: false,
      initValue: {
        endDate: moment().format("DD/MM/YYYY"),
        contactId: "",
      },
      csvData: [],
      activePage: 1,
      sizePerPage: 10,
      totalCount: 0,
      sort: {
        column: null,
        direction: "desc",
      },
      data: [],
    };
  }

  generateReport = (value) => {
    this.setState(
      {
        initValue: {
          startDate: moment(value.startDate).format("DD/MM/YYYY"),
          endDate: moment(value.endDate).format("DD/MM/YYYY"),
          contactId: value.contactId,
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
    if (initValue.contactId) {
      postData.contactId = initValue.contactId;
    }
    this.props.financialReportActions
      .getCustomerAccountStatement(postData)
      .then(async (res) => {
        if (res.status === 200) {
          const message = `Balance Outstanding Amount As On ${initValue.endDate.replaceAll("/", "-")}`;
          let customerAccountStatement = res.data.statementOfAccountsModels;
          customerAccountStatement = await customerAccountStatement.map(
            (row, i) => {
              row.id = i + 2;
              return row;
            }
          );
          // customerAccountStatement.push({
          //   contactName: strings.Total,
					// 	isTotalRow: true,
          //   invoiceDate: null,
          //   invoiceNumber: null,
          //   balanceAmount: res.data.balanceAmountTotal,
          //   type: null,
          //   id: 1,
          // });
          customerAccountStatement.push({
            contactName: message,
            invoiceDate: null,
            invoiceNumber: null,
            totalAmount: res.data.balanceAmountTotal,
            balanceAmount: res.data.balanceAmountTotal,
						isTotalRow2: true,
            type: null,
            id: 0, // define a unique id for the last row to customize the css
          });
          this.setState({
            customerAccountStatement: customerAccountStatement,
            data: res.data,
            loading: false,
          });
        }
      })
      .catch((err) => {
        this.setState({ loading: false });
      });
  };

  exportFile = () => {
		const { customerAccountStatement } = this.state; 
		const worksheet = XLSX.utils.json_to_sheet(customerAccountStatement); 
		const workbook = XLSX.utils.book_new(); 
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Account Statement'); 
		XLSX.writeFile(workbook, 'Customer Account Statement.csv'); 
	};

  exportExcelFile = () => {
		const { customerAccountStatement } = this.state; 
		const worksheet = XLSX.utils.json_to_sheet(customerAccountStatement); 
		const workbook = XLSX.utils.book_new(); 
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Account Statement'); 
		XLSX.writeFile(workbook, 'Customer Account Statement.xlsx'); 
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
    const {
      loading,
      initValue,
      dropdownOpen,
      customerAccountStatement,
      data,
      view,
      customPeriod,
      hideCustomPeriod,
    } = this.state;
    const { company_profile } = this.props;
    return (
      <div className="transactions-report-screen">
        <div className="animated fadeIn">
          <Card>
            <div>
                {!this.state.hideExportOptions &&
                  <Col lg={12}>
                    <div
                      className="h4 mb-0 d-flex align-items-center pull-right"
                      style={{ justifyContent: 'space-between',marginRight: '10px', marginTop:'15px' }}
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
                                  backgroundColor: "white !important",
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
                                  backgroundColor: "white !important",
                                }}
                              >
                                Excel
                              </span>
                            </DropdownItem>
                            <DropdownItem onClick={this.exportPDFWithComponent}>
                              Pdf
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                        &nbsp;&nbsp;
                        <div
                          className="mr-2 print-btn-cont"
                          onClick={() => window.print()}
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa fa-print"></i>
                        </div>
                        <div
                          className="mr-2 print-btn-cont"
                          onClick={() => {
                            this.props.history.push(
                              "/admin/report/reports-page"
                            );
                          }}
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          <span>X</span>
                        </div>
                      </div>
                    </div>
                  </Col>}
              <CardHeader>
							<FilterComponent3
									hideExportOptionsFunctionality={(val) => this.hideExportOptionsFunctionality(val)}
									customPeriod={customPeriod}
                  hideCustomPeriod={hideCustomPeriod}
									viewFilter={this.viewFilter}
									generateReport={(value) => {
										this.generateReport(value);
									}}
                  enableContact={true}
									setCutomPeriod={(value) => {
										this.setState({ customPeriod: value })
									}}
									handleCancel={() => {
										if (customPeriod === 'asOn') {
										const currentDate = moment();
										this.setState(prevState => ({
										initValue: {
										...prevState.initValue,
										endDate: currentDate,            }
										 }));
										this.generateReport({ endDate: currentDate });
										}
										this.setState({ customPeriod: 'asOn' });
                  }}
								/>
							</CardHeader>
              <CardBody id="section-to-print">
                <PDFExport
                  ref={(component) => (this.pdfExportComponent = component)}
                  scale={0.8}
                  // paperSize="A3"
                  margin={{ top: 0, left: 80, right: 80, bottom: 0 }}
                  fileName="Statement Of Account.pdf"
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <img
                        src={
                          company_profile &&
                          company_profile.companyLogoByteArray
                            ? "data:image/jpg;base64," +
                              company_profile.companyLogoByteArray
                            : logo
                        }
                        className=""
                        alt=""
                        style={{ width: " 150px" }}
                      ></img>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <h2>
                        {company_profile && company_profile["companyName"]
                          ? company_profile["companyName"]
                          : ""}
                      </h2>
                      <br style={{ marginBottom: "5px" }} />
                      <b style={{ fontSize: "18px" }}>
                        Statement Of Account
                      </b>
                      <br style={{ marginBottom: "5px" }} />
                     {`${strings.Ason} ${initValue.endDate.replaceAll("/", "-")}`}
                    </div>
                    <div></div>
                  </div>
                  {loading ? (
                    <Loader />
                  ) : (
                    <>
                      <ReportTables
                        reportDataList={customerAccountStatement}
                        reportName={"Customer Account Statement"}
                        id={13}
                      />
                    </>
                  )}
                  <div style={{ textAlignLast: "center" }}>
                    {strings.PoweredBy} <b>SimpleAccounts</b>
                  </div>
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
  mapDispatchToProps
)(CustomerAccountStatement);
