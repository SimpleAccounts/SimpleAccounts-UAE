import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
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
} from "reactstrap";
import moment from "moment";
import { PDFExport } from "@progress/kendo-react-pdf";
import * as XLSX from "xlsx";
import { Loader, Currency } from "components";
import * as FinancialReportActions from "../../actions";
import FilterComponent2 from "../filterComponet2";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import "./style.scss";
import logo from "assets/images/brand/logo.png";
import { data } from "../../../Language/index";
import { ReportTables } from "screens/financial_report/sections";
import LocalizedStrings from "react-localization";
import FilterComponent3 from '../filterComponent3';

const mapStateToProps = (state) => {
  return {
    profile: state.auth.profile,
    universal_currency_list: state.common.universal_currency_list,
    company_profile: state.reports.company_profile,
    purchase_by_item: state.reports.purchase_by_item,
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
class PurchaseByitem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      loading: true,
      customPeriod: 'customRange',
			hideAsOn: true,
      dropdownOpen: false,
      view: false,
      initValue: {
        startDate: moment().startOf("month").format("DD/MM/YYYY"),
        endDate: moment().endOf("month").format("DD/MM/YYYY"),
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
      .getpurchasebyproduct(postData)
      .then((res) => {
        if (res.status === 200) {
          const sbproductList = res.data.purchaseByProductModelList;
          const purchaseByProductList = sbproductList.map((row, i) => {
            row.id = i + 1;
            return row;
          });
          this.setState({
            purchaseByProductList: purchaseByProductList,
            data: res.data,
            loading: false,
          });
          this.setState({
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
    const { purchaseByProductList } = this.state;
    const worksheet = XLSX.utils.json_to_sheet(purchaseByProductList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase By Product');
    XLSX.writeFile(workbook, 'Purchase By Product.csv');
};

exportExcelFile = () => {
    const { purchaseByProductList } = this.state;
    const worksheet = XLSX.utils.json_to_sheet(purchaseByProductList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase By Product');
    XLSX.writeFile(workbook, 'Purchase By Product.xlsx');
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

  renderAverageAmount = (cell, row, extraData) => {
    return row.averageAmount === 0 ? (
      <Currency
        value={row.averageAmount}
        currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : "USD"}
      />
    ) : (
      <Currency
        value={row.averageAmount}
        currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : "USD"}
      />
    );
  };
  rendertotalAmountForAProduct = (cell, row, extraData) => {
    return row.totalAmountForAProduct === 0 ? (
      <Currency
        value={row.totalAmountForAProduct}
        currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : "USD"}
      />
    ) : (
      <Currency
        value={row.totalAmountForAProduct}
        currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : "USD"}
      />
    );
  };
  hideExportOptionsFunctionality = (val) => {
		this.setState({ hideExportOptions: val });
	}
  render() {
    strings.setLanguage(this.state.language);
    const { loading, initValue, dropdownOpen, purchaseByProductList, view,hideAsOn,customPeriod, } =
      this.state;
    const {
      profile,
      universal_currency_list,
      company_profile,
      purchase_by_item,
    } = this.props;
    console.log(this.state.data);
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
                            {/* <DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'profitloss', 'xls');
															}}
														>
															XLS (Microsoft Excel 1997-2004 Compatible)
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'profitloss', 'xlsx');
															}}
														>
															XLSX (Microsoft Excel)
														</DropdownItem> */}
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
                        {/* <div
												className="mr-2 print-btn-cont"
												onClick={() => {
													this.exportPDFWithComponent();
												}}
												style={{
													cursor: 'pointer',
													}}
												>
												<i className="fa fa-file-pdf-o"></i>
											</div> */}
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
                  scale={1}
                  paperSize="auto"
                  fileName="Purchase By Product.pdf"
                  margin={{ top: 50, left: 80, right: 80, bottom: 0 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                      marginTop:'5rem',
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
                        {strings.PurhaseByProduct}
                      </b>
                      <br style={{ marginBottom: "5px" }} />
                      {customPeriod === 'asOn' ? `${strings.Ason} ${initValue.endDate.replaceAll("/", "-")}`
											 : `${strings.From} ${initValue.startDate.replaceAll("/", "-")} to ${initValue.endDate.replaceAll("/", "-")}`}
                    </div>
                    <div></div>
                  </div>
                  {loading ? (
                    <Loader />
                  ) : (
                    <>
                      <ReportTables
                        reportDataList={purchaseByProductList}
                        reportName={"Purchase By Product"}
                        id={16}
                        rowHeight={50}
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

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseByitem);
