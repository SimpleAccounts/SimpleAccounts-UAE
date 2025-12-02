import React from "react";
import { connect } from "react-redux";
import { Card, CardHeader, CardBody, Row, Col } from "reactstrap";

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import "react-toastify/dist/ReactToastify.css";
// import 'react-select/dist/react-select.css'
import "./style.scss";
import { data } from "../Language/index";
import LocalizedStrings from "react-localization";
import config from "constants/config";

const mapStateToProps = (state) => {
  return {
    companyDetails: state.common.company_details,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {};
};
const Financial = require("assets/images/reports/Out line.png");
const Vat = require("assets/images/reports/vat.png");
const Journal = require("assets/images/reports/journal.png");
const Sales = require("assets/images/reports/sales.png");
const Purchase = require("assets/images/reports/pay.png");
const Receivables = require("assets/images/reports/inbox.png");
const Credit = require("assets/images/reports/credit.png");
const Debit = require("assets/images/reports/debit.png");
const Payables = require("assets/images/reports/Payables Icon.png");
const Expenses = require("assets/images/reports/Expense icon.png");

let strings = new LocalizedStrings(data);
class FinancialReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      activeTab: new Array(4).fill("3"),
    };
  }

  toggle = (tabPane, tab) => {
    const newArray = this.state.activeTab.slice();
    newArray[parseInt(tabPane, 10)] = tab;
    console.log(tab);
    this.setState({
      activeTab: newArray,
    });
  };

  render() {
    strings.setLanguage(this.state.language);
    const { isRegisteredVat } = this.props.companyDetails;

    return (
      <div className="financial-report-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon fas fa-file-contract" />
                    <span className="ml-2"> {strings.Reports}</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {/* <Nav tabs>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '1'}
										onClick={() => {
											this.toggle(0, '1');
										}}
									>
										Profit and Loss
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '2'}
										onClick={() => {
											this.toggle(0, '2');
										}}
									>
										Balance Sheet
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '3'}
										onClick={() => {
											this.toggle(0, '3');
										}}
									>
										Trial Balance
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '4'}
										onClick={() => {
											this.toggle(0, '4');
										}}
									>
										VAT Returns Report
									</NavLink>
								</NavItem>
							</Nav>
							<TabContent activeTab={this.state.activeTab[0]}>
								<TabPane tabId="1">
									<div className="table-wrapper">
										<ProfitAndLoss />
									</div>
								</TabPane>
								<TabPane tabId="2">
									<div className="table-wrapper">
										<BalanceSheet />
									</div>
								</TabPane>
								<TabPane tabId="3">
									<div className="table-wrapper">
										<TrailBalances />
									</div>
								</TabPane>
								<TabPane tabId="4">
									<div className="table-wrapper">
										<VatReturnsReport />
									</div>
								</TabPane>
							</TabContent> */}

              <Row>
                {config.REPORTS_HEAD_FI && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Financial}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.FinancialReports}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      {config.REPORTS_PAL && (
                        <h6>
                          <a
                            style={{ fontWeight: "400" }}
                            href="#"
                            onClick={() =>
                              this.props.history.push(
                                "/admin/report/profitandloss"
                              )
                            }
                          >
                            {" "}
                            {strings.ProfitandLoss}
                          </a>
                        </h6>
                      )}
                      {config.REPORTS_BS && (
                        <h6>
                          <a
                            style={{ fontWeight: "400" }}
                            href="#"
                            onClick={() =>
                              this.props.history.push(
                                "/admin/report/balancesheet"
                              )
                            }
                          >
                            {strings.BalanceSheet}
                          </a>
                        </h6>
                      )}
                      {config.REPORTS_HBS && (
                        <h6>
                          <a
                            style={{ fontWeight: "400" }}
                            href="#"
                            onClick={() =>
                              this.props.history.push(
                                "/admin/report/horizontalbalancesheet"
                              )
                            }
                          >
                            {strings.HorizontalBalanceSheet}
                          </a>
                        </h6>
                      )}
                      {config.REPORTS_TB && (
                        <h6>
                          <a
                            style={{ fontWeight: "400" }}
                            href="#"
                            onClick={() =>
                              this.props.history.push(
                                "/admin/report/trailbalances"
                              )
                            }
                          >
                            {strings.TrailBalances}
                          </a>
                        </h6>
                      )}
                      {config.REPORTS_CF && (
                        <h6>
                          <a
                            style={{ fontWeight: "400" }}
                            href="#"
                            onClick={() =>
                              this.props.history.push("/admin/report/cash-flow")
                            }
                          >
                            {strings.Cash_flow}
                          </a>
                        </h6>
                      )}
                    </div>
                  </Col>
                )}

                {config.REPORTS_HEAD_VAT && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Vat}
                        style={{ height: "25px" }}
                      ></img>
                      <h5 className="mb-3 mt-2">{strings.VatReports}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      {config.REPORTS_VAT_REPORTS && isRegisteredVat && (
                        <h6>
                          <a
                            style={{ fontWeight: "400" }}
                            href="#"
                            onClick={() =>
                              this.props.history.push(
                                "/admin/report/vatreports"
                              )
                            }
                          >
                            {strings.VatReports}
                          </a>
                        </h6>
                      )}
                      {config.REPORTS_FTA_AUDIT && isRegisteredVat && (
                        <h6>
                          <a
                            style={{ fontWeight: "400" }}
                            href="#"
                            onClick={() =>
                              this.props.history.push(
                                "/admin/report/ftaAuditReports"
                              )
                            }
                          >
                            {strings.FTA_Audit_Report}
                          </a>
                        </h6>
                      )}
                      {config.REPORTS_EXCISE_TAX && (
                        <h6>
                          <a
                            style={{ fontWeight: "400" }}
                            href="#"
                            onClick={() =>
                              this.props.history.push(
                                "/admin/report/exciseTaxAuditReports"
                              )
                            }
                          >
                            {strings.Excise_Tax_Report}
                          </a>
                        </h6>
                      )}
                    </div>
                  </Col>
                )}
                {config.REPORT_DGL && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Journal}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.Detailed}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/detailed-general-ledger"
                            )
                          }
                        >
                          {strings.DetailedGeneralLedger}
                        </a>
                      </h6>
                    </div>
                  </Col>
                )}
              </Row>

              <Row className="mt-4">
                {config.REPORTS_HEAD_SALES && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Sales}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.Sales}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/salesbycustomer"
                            )
                          }
                        >
                          {" "}
                          {strings.SalesByCustomer}
                        </a>
                      </h6>
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/salesbyproduct"
                            )
                          }
                        >
                          {strings.SalesByProduct}
                        </a>
                      </h6>
                    </div>
                  </Col>
                )}
                <Col className="report-section ml-4">
                  <div
                    className="d-flex"
                    style={{
                      backgroundColor: "#e8effb",
                      height: "37px",
                      width: "350px",
                    }}
                  >
                    <img
                      className="ml-2 mr-2 mt-2 mb-2 "
                      src={Vat}
                      style={{ height: "25px" }}
                    ></img>
                    <h5 className="mb-3 mt-2">{strings.CorporateTax}</h5>
                  </div>
                  <div className="mt-2 ml-4">
                    <h6>
                      <a
                        style={{ fontWeight: "400" }}
                        href="#"
                        onClick={() =>
                          this.props.history.push("/admin/report/corporate-tax")
                        }
                      >
                        {strings.CorporateTax}
                      </a>
                    </h6>
                  </div>
                </Col>

                {config.REPORTS_HEAD_EXPENSE && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Expenses}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.Expense}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/expense-details"
                            )
                          }
                        >
                          {strings.Expense + " " + strings.Details}
                        </a>
                      </h6>
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/expense-by-category"
                            )
                          }
                        >
                          {strings.Expense +
                            " " +
                            strings.By +
                            " " +
                            strings.Category}
                        </a>
                      </h6>
                    </div>
                  </Col>
                )}
              </Row>
              <Row xs="3" className="mt-4">
                {config.REPORTS_HEAD_RECEIVABLE && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Receivables}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.Receivables}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/receivable-invoice-summary"
                            )
                          }
                        >
                          {strings.ReceivableInvoiceSummary}
                        </a>
                      </h6>
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/receivable-invoice-details"
                            )
                          }
                        >
                          {strings.Receivable +
                            " " +
                            strings.Invoice +
                            " " +
                            strings.Details}
                        </a>
                      </h6>
                    </div>
                  </Col>
                )}
                {config.REPORTS_HEAD_PURCHASE && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Purchase}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.Purchase}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/purchasebyvendor"
                            )
                          }
                        >
                          {" "}
                          {strings.PurhaseByVendor}
                        </a>
                      </h6>
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/purchasebyitem"
                            )
                          }
                        >
                          {strings.PurhaseByProduct}
                        </a>
                      </h6>
                    </div>
                  </Col>
                )}
                {config.REPORTS_HEAD_PR && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Credit}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.CreditNote}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/credit-note-details"
                            )
                          }
                        >
                          {strings.CreditNoteDetails}
                        </a>
                      </h6>
                      {/* <h6><a  style={{fontWeight:'400'}} href ="#" onClick={() => 
											this.props.history.push('/admin/report/payable-invoice-details')}> Payables Invoice Detail</a></h6> */}
                    </div>
                  </Col>
                )}
              </Row>

              <Row xs="3" className="mt-4">
                {config.REPORTS_HEAD_INVOICES && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Receivables}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.Invoices}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/invoice-details"
                            )
                          }
                        >
                          {strings.InvoiceDetails}
                        </a>
                      </h6>
                      {/* <h6><a  style={{fontWeight:'400'}} href ="#" onClick={() => 
											this.props.history.push('/admin/report/receivable-invoice-details')}>{strings.Receivable+" "+strings.Invoice+" "+strings.Details}</a></h6> */}
                    </div>
                  </Col>
                )}
                {config.REPORTS_PAYABLE && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Payables}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.Payables}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/payable-invoice-summary"
                            )
                          }
                        >
                          {strings.PayablesInvoiceSummary}
                        </a>
                      </h6>
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/payable-invoice-details"
                            )
                          }
                        >
                          {" "}
                          {strings.PayableInvoiceDetails}
                        </a>
                      </h6>
                    </div>
                  </Col>
                )}
                {config.REPORTS_HEAD_DN && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Debit}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.DebitNotes}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/debit-note-details"
                            )
                          }
                        >
                          {strings.DebitNoteDetails}
                        </a>
                      </h6>
                      {/* <h6><a  style={{fontWeight:'400'}} href ="#" onClick={() => 
											this.props.history.push('/admin/report/payable-invoice-details')}> Payables Invoice Detail</a></h6> */}
                    </div>
                  </Col>
                )}

                {/* <Col  className="report-section ml-4"> */}
                {/* <div className="d-flex" style={{ backgroundColor: "#e8effb", height: "37px",width:"350px" }}>
											<img
											className="ml-2 mr-2 mt-2 mb-2 "
											src={Financial}
											style={{height:'25px'}}
											></img>	<h5 className="mb-3 mt-2">Statements</h5></div>
											<div className="mt-2 ml-4">
											<h6><a  style={{fontWeight:'400'}} href="#" onClick={() =>
											this.props.history.push('/admin/report/statementOfAccount')}>SOA (Statement of Account)</a></h6>	
									</div> */}
                {/* </Col> */}
                {/* <Col  className="report-section ml-4">
										<div className="d-flex" style={{ backgroundColor: "#e8effb", height: "37px",width:"350px" }}>
											<img
												className="ml-2 mr-2 mt-2 mb-2 "
											src={Payables}
											style={{height:'25px'}}
											></img>	<h5 className="mb-3 mt-2">{strings.Payables}</h5></div>
											<div className="mt-2 ml-4">
											<h6><a  style={{fontWeight:'400'}} href="#" onClick={() =>
											this.props.history.push('/admin/report/payable-invoice-summary')}>{strings.PayablesInvoiceSummary}</a></h6>
											<h6><a  style={{fontWeight:'400'}} href ="#" onClick={() => 
											this.props.history.push('/admin/report/payable-invoice-details')}> {strings.PayableInvoiceDetails}</a></h6>
										
									
									</div>
									</Col> */}
                {/* <Col  className="report-section ml-4">
										<div className="d-flex" style={{ backgroundColor: "#e8effb", height: "37px",width:"350px" }}>
											<img
												className="ml-2 mr-2 mt-2 mb-2 "
											src={Financial}
											style={{height:'25px'}}
											></img>	<h5 className="mb-3 mt-2">{strings.PaymentsRecevied}</h5></div>
											<div className="mt-2 ml-4">
											<h6><a  style={{fontWeight:'400'}} href="#" onClick={() =>
											this.props.history.push('/admin/report/credit-note-details')}>{strings.CreditNoteDetails}</a></h6>
											<h6><a  style={{fontWeight:'400'}} href ="#" onClick={() => 
											this.props.history.push('/admin/report/payable-invoice-details')}> Payables Invoice Detail</a></h6>
										
									
									</div>
									</Col> */}
              </Row>
              <Row xs="3" className="mt-4">
                {config.REPORTS_ARAGINGREPORT && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Sales}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.ARAgingReport}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/arAgingReport"
                            )
                          }
                        >
                          {strings.ARAgingReport}
                        </a>
                      </h6>
                    </div>
                  </Col>
                )}
                {config.REPORTS_PAYROLLSSUMMARY && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Vat}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">{strings.Payroll + "s"}</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/payroll-summary"
                            )
                          }
                        >
                          {strings.Payroll + "s  " + strings.Summary}
                        </a>
                      </h6>
                    </div>
                  </Col>
                )}
                {config.REPORTS_HEAD_DN && (
                  <Col className="report-section ml-4">
                    <div
                      className="d-flex"
                      style={{
                        backgroundColor: "#e8effb",
                        height: "37px",
                        width: "350px",
                      }}
                    >
                      <img
                        className="ml-2 mr-2 mt-2 mb-2 "
                        src={Debit}
                        style={{ height: "25px" }}
                      ></img>{" "}
                      <h5 className="mb-3 mt-2">Account Statement</h5>
                    </div>
                    <div className="mt-2 ml-4">
                      <h6>
                        <a
                          style={{ fontWeight: "400" }}
                          href="#"
                          onClick={() =>
                            this.props.history.push(
                              "/admin/report/customer-account-statement"
                            )
                          }
                        >
                          Customer Account Statement
                        </a>
                      </h6>
                      {/* <h6><a  style={{fontWeight:'400'}} href ="#" onClick={() => 
											this.props.history.push('/admin/report/payable-invoice-details')}> Payables Invoice Detail</a></h6> */}
                    </div>
                  </Col>
                )}
              </Row>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FinancialReport);
