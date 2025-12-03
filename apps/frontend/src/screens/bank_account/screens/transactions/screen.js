import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  ButtonGroup,
  Nav,
  NavItem,
  NavLink,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import Select from "react-select";
import { selectOptionsFactory } from "utils";
import BootstrapTable from "react-bootstrap-table-next";
import DatePicker from "react-datepicker";
import { Loader, ConfirmDeleteModal } from "components";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import paginationFactory from "react-bootstrap-table2-paginator";
import "bootstrap-daterangepicker/daterangepicker.css";
import * as TransactionsActions from "./actions";
import * as detailBankAccountActions from "./../detail/actions";
import { CommonActions } from "services/global";
import { ExplainTrasactionDetail } from "./sections";
import "./style.scss";
import { data } from "../../../Language/index";
import LocalizedStrings from "react-localization";
import * as transactionDetailActions from "../transactions/screens/detail/actions";
import { Suspense, lazy } from "react";
import Getbyid from "./sections/transactiondetails";

const mapStateToProps = (state) => {
  return {
    bank_transaction_list: state.bank_account.bank_transaction_list,
    transaction_type_list: state.bank_account.transaction_type_list,
    universal_currency_list: state.common.universal_currency_list,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    transactionsActions: bindActionCreators(TransactionsActions, dispatch),
    detailBankAccountActions: bindActionCreators(
      detailBankAccountActions,
      dispatch
    ),
    transactionDetailActions: bindActionCreators(
      transactionDetailActions,
      dispatch
    ),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const ZERO = 0.0;
let strings = new LocalizedStrings(data);
class BankTransactions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      loading: true,
      openDeleteModal: false,
      typeOptions: [
        { value: "Withdrawal", label: "Withdrawal" },
        { value: "Deposit", label: "Deposit" },
      ],
      statusOptions: [
        { value: "All", label: "All" },
        { value: "Matched", label: "Matched" },
        { value: "Manually Added", label: "Manually Added" },
        { value: "Categorized", label: "Categorized" },
        { value: "Reconciled", label: "Reconciled" },
        { value: "Unreconciled", label: "Unreconciled" },
      ],
      actionButtons: {},
      filterData: {
        transactionDate: "",
        chartOfAccountId: "",
      },
      selectedData: "",
      selectedreconcileRrefId: "",
      id: "",
      dialog: null,
      selectedRowData: {},
      sidebarOpen: false,
      csvData: [],
      view: false,
      selectedRow: null,
      transactionId: "",
      openExplainTransactionModal: false,
      rowId: null,
      show: false,
      bankId: "",
      openingBalance: "",
      closingBalance: "",
      currentBalance: "",
      bankAccountCurrencySymbol: "",
      bankAccountCurrencyIsoCode: "",
      accounName: "",
      expanded: false,
      page: 1,
      activeTab: new Array(3).fill("all"),
      transactionType: "all",
      nonexpand: [],
      selected_id_list: [],
      transation_data: "",
      res: [],
      showExpandedRow: true,
    };

    this.options = {
      page: 1,
      sizePerPage: 10,
      onSizePerPageList: this.onSizePerPageList,
      onPageChange: this.onPageChange,
    };

    this.selectRowProp = {
      mode: "checkbox",
      bgColor: "rgba(0,0,0, 0.05)",
      clickToSelect: true,
      onSelectAll: this.onSelectAll,
    };
    this.csvLink = React.createRef();
  }

  getnewbackdetils = () => {
    if (this.props.location.state && this.props.location.state.bankAccountId) {
      this.props.detailBankAccountActions
        .getBankAccountByID(
          this.props.location.state.bankAccountId ||
          localStorage.getItem("bankId")
        )
        .then((res) => {
          this.setState({
            bankAccountCurrencySymbol: res.bankAccountCurrencySymbol,
            bankAccountCurrencyIsoCode: res.bankAccountCurrencyIsoCode,
            currentBalance: res.currentBalance,
            closingBalance: res.closingBalance,
            openingBalance: res.openingBalance,
            accounName: res.bankAccountName,
            transactionCount: res.transactionCount,
          });
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert(
            "error",
            err && err.data ? err.data.message : "Something Went Wrong"
          );
          this.props.history.push("/admin/banking/bank-account");
        });
      this.toggle(0, "all");
      //.this.initializeData();
      if (this.props.location.state !== undefined) {
        localStorage.setItem(
          "bankId",
          localStorage.getItem("bankId") !==
            this.props.location.state.bankAccountId
            ? this.props.location.state.bankAccountId
            : localStorage.getItem("bankId")
        );
      } else {
        localStorage.setItem("bankId", localStorage.getItem("bankId"));
        this.props.location.state = {};
        this.props.location.state.bankAccountId =
          localStorage.getItem("bankId");
      }
      this.props.transactionsActions.getTransactionTypeList();
      this.initializeData();
    }
  };

  componentDidMount = () => {
    if (this.props.location.state && this.props.location.state.bankAccountId) {
      this.props.detailBankAccountActions
        .getBankAccountByID(
          this.props.location.state.bankAccountId ||
          localStorage.getItem("bankId")
        )
        .then((res) => {
          this.setState({
            bankAccountCurrencySymbol: res.bankAccountCurrencySymbol,
            bankAccountCurrencyIsoCode: res.bankAccountCurrencyIsoCode,
            currentBalance: res.currentBalance,
            closingBalance: res.closingBalance,
            openingBalance: res.openingBalance,
            accounName: res.bankAccountName,
            transactionCount: res.transactionCount,
          });
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert(
            "error",
            err && err.data ? err.data.message : "Something Went Wrong"
          );
          this.props.history.push("/admin/banking/bank-account");
        });
      this.toggle(0, "all");
      //.this.initializeData();
      if (this.props.location.state !== undefined) {
        localStorage.setItem(
          "bankId",
          localStorage.getItem("bankId") !==
            this.props.location.state.bankAccountId
            ? this.props.location.state.bankAccountId
            : localStorage.getItem("bankId")
        );
      } else {
        localStorage.setItem("bankId", localStorage.getItem("bankId"));
        this.props.location.state = {};
        this.props.location.state.bankAccountId =
          localStorage.getItem("bankId");
      }
      this.props.commonActions.getCompanyDetails().then((res) => {
        if (res.status === 200) {
          const isRegisteredVat = res.data.isRegisteredVat;

          this.props.history.replace({
            pathname: this.props.location.pathname,
            state: {
              ...this.props.location.state,
              isRegisteredVat: isRegisteredVat,
            },
          });

          this.setState({
            companyDetails: res.data,
            isRegisteredVat: isRegisteredVat,
          });
        }
      });
      this.props.transactionsActions.getTransactionTypeList();
      this.initializeData();
    }
  };

  initializeData = () => {
    let { filterData } = this.state;
    const data = {
      pageNo: this.options.page ? this.options.page - 1 : 0,
      pageSize: this.options.sizePerPage,
    };
    if (
      (this.props.location.state && this.props.location.state.bankAccountId) ||
      localStorage.getItem("bankId")
    ) {
      const postData = {
        ...filterData,
        ...data,
        id:
          (this.props.location.state &&
            this.props.location.state.bankAccountId) ||
          localStorage.getItem("bankId"),
        transactionType: this.state.transactionType,
      };
      this.props.transactionsActions
        .getTransactionList(postData)
        .then((res) => {
          const array = [];
          if (res.status === 200) {
            this.setState({
              loading: false,
              transation_data: res.data.data,
            });
            res.data.data.map((item) => {
              if (item.creationMode === "POTENTIAL_DUPLICATE") {
                array.push(item.id);
              }
              this.setState({ nonexpand: array });
            });
          }
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert(
            "error",
            err && err.data ? err.data.message : "Something Went Wrong"
          );
          this.setState({ loading: false });
        });
    } else {
      this.props.history.push("/admin/banking/bank-account");
    }
  };

  toggleActionButton = (row) => {
    let temp = Object.assign({}, this.state.actionButtons);
    if (temp[parseInt(row, 10)]) {
      temp[parseInt(row, 10)] = false;
    } else {
      temp[parseInt(row, 10)] = true;
    }
    this.setState({
      actionButtons: temp,
    });
  };

  renderAccountNumber = (cell, row) => {
    return (
      <label
        className="mb-0 my-link"
        onClick={() =>
          this.props.history.push(
            "/admin/banking/bank-account/transaction/detail"
          )
        }
      >
        {row.reference_number}
      </label>
    );
  };

  renderTransactionStatus = (cell, row) => {
    let classname = "";
    if (row.status === "Explained") {
      classname = "badge-success";
    } else if (row.status === "Unexplained") {
      classname = "badge-danger";
    } else {
      classname = "badge-primary";
    }
    return <span className={`badge ${classname} mb-0`}>{row.status}</span>;
  };

  renderreconcileRrefId = (cell, row) => {
    let classname = "";
    let value = "";
    if (row.status === "Explained") {
      classname = "badge-success";
      value = "Withdrawal";
    } else if (row.status === "Unexplained") {
      classname = "badge-danger";
      value = "Deposit";
    } else {
      classname = "badge-primary";
      value = "Tax Claim";
    }
    return <span className={`badge ${classname} mb-0`}>{value}</span>;
  };

  renderDepositAmount = (cell, row, rowIndex, extraData) => {
    return row.depositeAmount >= 0
      ? row.currencyIsoCode +
      " " +
      row.depositeAmount.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : "";
  };
  renderWithdrawalAmount = (cell, row, rowIndex, extraData) => {
    return row.withdrawalAmount >= 0
      ? row.currencyIsoCode +
      " " +
      row.withdrawalAmount.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : "";
  };
  renderRunningAmount = (cell, row) => {
    return row.runningAmount >= 0
      ? row.currencyIsoCode +
      " " +
      row.runningAmount.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : "";
  };

  renderDueAmount = (cell, row, rowIndex, extraData) => {
    return row.dueAmount >= 0
      ? row.currencyIsoCode +
      " " +
      row.dueAmount.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : "";
  };

  test(row) {
    this.setState({
      rowId: row.id,
      show: !this.state.show,
    });
  }
  // onSelectAll = (isSelected, rows) => {};

  toggle = (tabPane, tab) => {
    const newArray = this.state.activeTab.slice();
    newArray[parseInt(tabPane, 10)] = tab;
    this.setState(
      {
        activeTab: newArray,
        transactionType: tab,
      },
      () => {
        this.initializeData();
      }
    );
  };

  onSizePerPageList = (sizePerPage) => {
    if (this.options.sizePerPage !== sizePerPage) {
      this.options.sizePerPage = sizePerPage;
      this.initializeData();
    }
  };

  onPageChange = (page, sizePerPage) => {
    if (this.options.page !== page) {
      this.options.page = page;
      this.initializeData();
    }
    if (this.options.sizePerPage !== sizePerPage) {
      this.options.sizePerPage = sizePerPage;
      this.initializeData();
    }
  };

  handleChange = (val, name, reconcile, row, label) => {
    if (!reconcile) {
      this.setState({
        filterData: Object.assign(this.state.filterData, {
          [name]: val,
        }),
      });
    } else {
      if (row) {
        this.handleExplain(val, name, reconcile, row, label);
      }
    }
  };

  handleSearch = () => {
    this.initializeData();
  };

  closeTransaction = (id) => {
    const message1 = (
      <text>
        <b>Delete Transaction?</b>
      </text>
    );
    const message =
      "This Transaction will be deleted permanently and cannot be recovered.";
    this.setState({
      dialog: (
        <ConfirmDeleteModal
          isOpen={true}
          okHandler={() => this.removeTransaction(id)}
          cancelHandler={this.removeDialog}
          message1={message1}
          message={message}
        />
      ),
    });
  };

  removeTransaction = (id) => {
    this.removeDialog();
    this.props.transactionsActions
      .deleteTransactionById(id)
      .then((res) => {
        this.props.commonActions.tostifyAlert(
          "success",
          "Transaction Deleted Successfully"
        );
        this.initializeData();
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : null
        );
      });
  };

  removeDialog = () => {
    this.setState({
      dialog: null,
    });
  };

  getCsvData = () => {
    if (this.state.csvData.length === 0) {
      let obj = {
        paginationDisable: true,
        id: this.props.location.state
          ? this.props.location.state.bankAccountId
          : "",
        transactionType: this.state.transactionType,
      };
      this.props.transactionsActions.getTransactionList(obj).then((res) => {
        if (res.status === 200) {
          this.setState({ csvData: res.data.data, view: true }, () => {
            setTimeout(() => {
              this.csvLink.current.link.click();
            }, 0);
          });
        }
      });
    } else {
      this.csvLink.current.link.click();
    }
  };

  clearAll = () => {
    this.setState(
      {
        filterData: {
          transactionDate: "",
          chartOfAccountId: "",
        },
      },
      () => {
        this.initializeData();
      }
    );
  };

  openExplainTransactionModal = (row) => {
    this.setState(
      {
        selectedData: row,
      },
      () => {
        this.setState({
          openExplainTransactionModal: true,
        });
      }
    );
  };

  closeExplainTransactionModal = (res) => {
    this.initializeData();
    const array = [];
    this.setState(() => ({
      expanded: array,
    }));
  };

  isExpandableRow(row) {
    if (row.id) return true;
    else return false;
  }
  expandComponent(row) {
    return <div className="transition">{row.id}</div>;
  }

  handleTableChange = (type, { page, sizePerPage }) => {
    this.setState(
      {
        page,
        sizePerPage,
      },
      () => {
        this.onPageChange(page, sizePerPage);
      }
    );
  };

  onRowSelect = (row) => {
    let tempList = [];
    if (row) {
      tempList = Object.assign([], this.state.selected_id_list);
      tempList.push(row);
    } else {
      this.state.selected_id_list.map((item) => {
        if (item !== row) {
          tempList.push(item);
        }
        return item;
      });
    }
    this.setState(
      {
        selected_id_list: tempList,
      },
      () => {
        let obj = {
          ids: this.state.selected_id_list,
        };
        this.props.transactionsActions
          .changeTransaction(obj)
          .then(() => {
            this.props.commonActions.tostifyAlert(
              "success",
              "Transaction status changed successfully"
            );
            this.initializeData();
            this.setState({
              selected_id_list: [],
            });
          })
          .catch((err) => {
            this.props.commonActions.tostifyAlert(
              "error",
              err && err.data ? err.data.message : "Something Went Wrong"
            );
          });
      }
    );
  };

  statusFormatter = (cell, row, extraData) => {
    if (row.explinationStatusEnum === "FULL") {
      return <div className="label-info">Explained</div>;
    } else if (row.explinationStatusEnum === "RECONCILED") {
      return <div className="label-success">Reconciled</div>;
    } else if (row.explinationStatusEnum === "PARTIAL") {
      return <div className="label-PartiallyPaid">Partially Explained</div>;
    } else if (
      row.explinationStatusEnum === "NOT_EXPLAIN" &&
      row.creationMode !== "POTENTIAL_DUPLICATE"
    ) {
      return <div className="label-danger">Not Explained</div>;
    } else if (row.explinationStatusEnum === "RECONCILED") {
      return <div>Reconciled</div>;
    } else if (row.creationMode === "POTENTIAL_DUPLICATE") {
      return (
        <div>
          <ButtonDropdown
            isOpen={this.state.actionButtons[row.id]}
            toggle={(e) => {
              e.preventDefault();
              this.toggleActionButton(row.id);
            }}
          >
            <DropdownToggle
              size="sm"
              color="primary"
              className="btn-brand icon"
            >
              {this.state.actionButtons[row.id] === true ? (
                <i className="fas fa-chevron-up" />
              ) : (
                <i className="fas fa-chevron-down" />
              )}
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem
                onClick={() => {
                  this.onRowSelect(row.id);
                }}
                className="dropdown-button-margin"
              >
                <i className="fas fa-edit" /> Not a duplicate
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  this.closeTransaction(row.id);
                }}
                className="dropdown-button-margin"
              >
                <i className="fa fa-trash" /> Delete
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        </div>
      );
    }
  };

  getbyid = (row) => {
    return (
      <>
        <>
          {this.state.response?.data?.length > 0 &&
            this.state.response?.data?.map((i, inx) => {
              return (
                <ExplainTrasactionDetail
                  closeExplainTransactionModal={(e) => {
                    this.closeExplainTransactionModal(e);
                  }}
                  bankId={this.props.location.state.bankAccountId}
                  creationMode={row.creationMode}
                  selectedData={row}
                  data={i}
                />
              );
            })}
        </>
        <>
          {row.explanationIds.length > 0 ||
            (row.explinationStatusEnum === "PARTIAL" && (
              <ExplainTrasactionDetail
                closeExplainTransactionModal={(e) => {
                  this.closeExplainTransactionModal(e);
                }}
                bankId={this.props.location.state.bankAccountId}
                creationMode={row.creationMode}
                selectedData={row}
                data={{}}
              />
            ))}
        </>
      </>
    );
  };

  render() {
    strings.setLanguage(this.state.language);
    const {
      loading,
      statusOptions,
      filterData,
      dialog,
      csvData,
      view,
      nonexpand,
      expanded,
    } = this.state;
    const {
      bank_transaction_list,
      transaction_type_list,
      universal_currency_list,
    } = this.props;
    const columns = [
      {
        dataField: "transactionDate",
        text: "Date",
      },
      {
        dataField: "description",
        text: "Description",
      },
      {
        dataField: "depositeAmount",
        text: "Deposit Amount",
        formatter: this.renderDepositAmount,
        formatExtraData: universal_currency_list,
      },
      {
        dataField: "withdrawalAmount",
        text: "Withdrawal Amount",
        formatter: this.renderWithdrawalAmount,
        formatExtraData: universal_currency_list,
      },
      {
        dataField: "dueAmount",
        text: "Due Amount",
        formatter: this.renderDueAmount,
        formatExtraData: universal_currency_list,
      },
      {
        dataField: "explinationStatusEnum",
        text: "Status",
        formatter: this.statusFormatter,
        formatExtraData: this.state.actionButtons,
      },
    ];
    const expandRow = {
      onlyOneExpanding: true,
      renderer: (row) => (
        <Getbyid
          row={row}
          getbankdetails={this.getnewbackdetils}
          closeExplainTransactionModal={(e) => {
            this.closeExplainTransactionModal(e);
          }}
          bankAccountId={this.props.location.state.bankAccountId}
          transactionDetailActions={this.props.transactionDetailActions}
        />
      ),
      expanded: expanded,
      nonExpandable: nonexpand,
      showExpandColumn: this.state.showExpandedRow,
      showExpandRow: this.state.showExpandedRow,
    };

    return (
      <div className="bank-transaction-screen transaction">
        <div className="animated fadeIn">
          <Card className={this.state.sidebarOpen ? `main-table-panel` : ""}>
            <CardHeader>
              <Row>
                <Col>
                  <div className="h4 mb-0 d-flex align-items-center">
                  <i className="fas fa-university" />
                    <span className="ml-2">{strings.BankTransactions}</span>
                  </div>
                </Col>
                <Col>
                  <Button
                    title="Back"
                    onClick={() => {
                      this.props.history.push("/admin/banking/bank-account");
                    }}
                    className=" pull-right"
                  >
                    X
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {dialog}
              {loading ? (
                <Row>
                  <Col lg={12}>
                    <Loader />
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col lg={12}>
                    <div className="mb-4 status-panel p-3">
                      <Row>
                        <Col lg={3}>
                          <h5>{strings.AccountName}</h5>
                          <h3>{this.state.accounName}</h3>
                        </Col>
                        <Col lg={3}>
                          <h5>{strings.CurrentBankBalance}</h5>
                          <h3>
                            {this.state.bankAccountCurrencyIsoCode} &nbsp;
                            {this.state.currentBalance
                              ? this.state.currentBalance.toLocaleString(
                                navigator.language,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )
                              : " " +
                              ZERO.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                              })}
                          </h3>
                        </Col>
                        <Col lg={3}>
                          <h5>{strings.LedgerBalance}</h5>

                          <h3>
                            {this.state.bankAccountCurrencyIsoCode} &nbsp;
                            {this.state.closingBalance
                              ? this.state.closingBalance.toLocaleString(
                                navigator.language,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )
                              : " " +
                              ZERO.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                              })}
                          </h3>
                        </Col>
                        <Col lg={3}>
                          <h5>{strings.OpeningBalance}</h5>
                          <h3>
                            {this.state.bankAccountCurrencyIsoCode} &nbsp;
                            {this.state.openingBalance
                              ? this.state.openingBalance.toLocaleString(
                                navigator.language,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )
                              : " " +
                              ZERO.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                              })}
                          </h3>
                        </Col>
                      </Row>
                    </div>
                    <div className="d-flex justify-content-end">
                      {this.props.location.state &&
                        this.props.location.state.bankAccountId !== 1001 && (
                          <ButtonGroup size="sm">
                            {/* <Button
													color="success"
													className="btn-square mr-1"
													onClick={() => this.getCsvData()}
												>
													<i className="fa glyphicon glyphicon-export fa-download mr-1" />
													Export To CSV
												</Button>
												{view && (
													<CSVLink
														data={csvData}
														filename={'Transaction.csv'}
														className="hidden"
														ref={this.csvLink}
														target="_blank"
													/>
												)} */}
                            <Button
                              color="info"
                              className="btn-square mr-1"
                              onClick={() =>
                                this.props.history.push(
                                  "/admin/banking/upload-statement",
                                  {
                                    bankAccountId:
                                      this.props.location.state &&
                                        this.props.location.state.bankAccountId
                                        ? this.props.location.state
                                          .bankAccountId
                                        : "",
                                  }
                                )
                              }
                            >
                              <i className="fa glyphicon glyphicon-export fa-upload mr-1" />
                              {strings.ImportStatement}
                            </Button>
                            &nbsp; &nbsp; &nbsp;
                            {this.state.transactionCount > 0 ? (
                              ""
                            ) : (
                              <Button
                                color="success"
                                className="btn-square mr-1"
                                onClick={() =>
                                  this.props.history.push(
                                    "/admin/banking/bank-account/detail",
                                    {
                                      bankAccountId:
                                        this.props.location.state &&
                                          this.props.location.state.bankAccountId
                                          ? this.props.location.state
                                            .bankAccountId
                                          : "",
                                    }
                                  )
                                }
                              >
                                <i className="fas fa-edit mr-1" />
                                {strings.EditAccount}
                              </Button>
                            )}
                            &nbsp;&nbsp;&nbsp;
                            <Button
                              color="info"
                              className="btn-square mr-1"
                              onClick={() =>
                                this.props.history.push(
                                  "/admin/banking/bank-account/transaction/reconcile",
                                  {
                                    bankAccountId:
                                      this.props.location.state &&
                                        this.props.location.state.bankAccountId
                                        ? this.props.location.state
                                          .bankAccountId
                                        : "",
                                  }
                                )
                              }
                            >
                              <i className="fas fa-edit mr-1" />
                              {strings.reconcile}
                            </Button>
                          </ButtonGroup>
                        )}
                    </div>
                    <div className="py-3">
                      {/* <h6>{strings.Filter}: </h6> */}
                      <Row>
                        {/* <Col lg={3} className="mb-1">
													<Select
														className=""
														options={statusOptions}
														placeholder="Transaction Status(TBD)"
													/>
												</Col>
												<Col lg={3} className="mb-1">
													<Select
														options={
															transaction_type_list
																? selectOptionsFactory.renderOptions(
																		'chartOfAccountName',
																		'chartOfAccountId',
																		transaction_type_list,
																		'Transaction Type',
																  )
																: []
														}
														onChange={(val) => {
															if (val && val.value) {
																this.handleChange(
																	val.value,
																	'chartOfAccountId',
																);
																this.setState({
																	selectedreconcileRrefId: val.value,
																});
															} else {
																this.handleChange('', 'chartOfAccountId');
																this.setState({ selectedreconcileRrefId: '' });
															}
														}}
														className="select-default-width"
														placeholder="Transaction Type"
														value={filterData.chartOfAccountId}
													/>
												</Col> */}
                        <Col lg={3} className="mb-1">
                          {/* <DatePicker
														className="form-control"
														id="date"
														name="transactionDate"
														placeholderText={strings.TransactionDate}
														showMonthDropdown
														showYearDropdown
														dropdownMode="select"
														dateFormat="dd-MM-yyyy"
														selected={filterData.transactionDate}
														onChange={(value) => {
															this.handleChange(value, 'transactionDate');
														}}
														autoComplete="off"
													/> */}
                        </Col>
                        <Col lg={2} className="pl-0 pr-0">
                          {/* <Button
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
													</Button> */}
                        </Col>
                      </Row>
                    </div>
                    <div>
                      <Nav tabs className="pull-left">
                        <NavItem>
                          <NavLink
                            active={this.state.activeTab[0] === "all"}
                            onClick={() => {
                              this.toggle(0, "all");
                            }}
                          >
                            {strings.All}
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            active={this.state.activeTab[0] === "not_explain"}
                            onClick={() => {
                              this.toggle(0, "not_explain");
                            }}
                          >
                            {strings.NotExplained}
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            active={
                              this.state.activeTab[0] === "potential_duplicate"
                            }
                            onClick={() => {
                              this.toggle(0, "potential_duplicate");
                            }}
                          >
                            {strings.PotentialDuplicate}
                          </NavLink>
                        </NavItem>
                      </Nav>
                      <Button
                        color="primary"
                        className="btn-square pull-right"
                        onClick={() =>
                          this.props.history.push(
                            "/admin/banking/bank-account/transaction/create",
                            {
                              bankAccountId:
                                this.props.location.state &&
                                  this.props.location.state.bankAccountId
                                  ? this.props.location.state.bankAccountId
                                  : "",
                              currency: this.props.location.state.currency,
                              isRegisteredVat: this.props.location.state.isRegisteredVat
                            }
                          )
                        }
                      >
                        <i className="fas fa-plus mr-1" />
                        {strings.AddnewTransaction}
                      </Button>
                    </div>
                    <div>
                      <BootstrapTable
                        id="myTable"
                        keyField="id"
                        data={
                          bank_transaction_list.data
                            ? bank_transaction_list.data
                            : []
                        }
                        columns={columns}
                        expandRow={expandRow}
                        noDataIndication="There are no records to display."
                        remote
                        fetchInfo={{
                          dataTotalSize: bank_transaction_list.count
                            ? bank_transaction_list.count
                            : 0,
                        }}
                        onTableChange={this.handleTableChange}
                        pagination={paginationFactory({
                          page: this.options.page,
                          sizePerPage: this.options.sizePerPage,
                          totalSize: bank_transaction_list.count,
                        })}
                      />
                    </div>
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
          <div className="overlay"></div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BankTransactions);
