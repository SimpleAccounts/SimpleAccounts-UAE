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
  Form,
  FormGroup,
  Input,
  Label,
  UncontrolledTooltip,
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { Formik } from "formik";
import * as Yup from "yup";
import { LeavePage, Loader, EmployeeModal } from "components";
import { CommonActions } from "services/global";
import { selectOptionsFactory } from "utils";
import * as EmployeeActions from "../../actions";
import * as CreatePayrollActions from "./actions";
import * as CreatePayrollEmployeeActions from "../../../payrollemp/screens/create/actions";
import * as PayrollEmployeeActions from "../../../payrollemp/actions";
import "react-datepicker/dist/react-datepicker.css";
import "./style.scss";
import { data } from "../../../Language/index";
import LocalizedStrings from "react-localization";
import moment from "moment";
import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";
import { toast } from "react-toastify";

const mapStateToProps = (state) => {
  return {
    currency_list: state.employee.currency_list,
    country_list: state.contact.country_list,
    state_list: state.contact.state_list,
    employees_for_dropdown: state.payrollRun.employees_for_dropdown,
    approver_dropdown_list: state.payrollRun.approver_dropdown_list,
    employee_list: state.payrollEmployee.employee_list_dropdown,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    createPayrollActions: bindActionCreators(CreatePayrollActions, dispatch),
    createPayrollEmployeeActions: bindActionCreators(
      CreatePayrollEmployeeActions,
      dispatch
    ),
    payrollEmployeeActions: bindActionCreators(
      PayrollEmployeeActions,
      dispatch
    ),
  };
};
const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#2064d8" : "#c7c7c7",
    boxShadow: state.isFocused ? null : null,
    "&:hover": {
      borderColor: state.isFocused ? "#2064d8" : "#c7c7c7",
    },
  }),
};
let strings = new LocalizedStrings(data);
class CreatePayrollList extends React.Component {
  constructor(props) {
    super(props);
    var date = new Date();
    this.state = {
      language: window["localStorage"].getItem("language"),
      loading: false,
      createMore: false,
      initValue: {},
      employeeListIds: [],
      openModal: false,
      selectedRows: [],
      selectedRows1: [],
      selectRowProp: {
        mode: "checkbox",
        bgColor: "rgba(0,0,0, 0.05)",
        clickToSelect: false,
        onSelect: this.onRowSelect,
        onSelectAll: this.onSelectAll,
      },
      payrollSubject: "",
      payrollApprover: "",
      payrollDate: new Date(),
      startDate: moment(new Date(date.getFullYear(), date.getMonth(), 1)),
      endDate: moment(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
      // startDate: '',
      // endDate: '',
      payPeriod: "",
      apiSelector: "",
      submitButton: true,
      paidDays: 30,
      countForTableApiCall: 0,
      focusedInput: null,
      currencyIsoCode: "AED",
      loadingMsg: "Loading...",
      disableLeavePage: false,
      isPayrollSubjectNameExist: false,
      payrollApproverRequired: false,
      payrollSubjectRequired: false,
      openEmployeeModal: false,
    };

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;
    this.regExAlphaNumeric = /^[a-zA-Z0-9\s]+$/;

    this.options = {
      // onRowClick: this.goToDetail,
      paginationPosition: "bottom",
      page: 1,
      sizePerPage: 10,
      onSizePerPageList: this.onSizePerPageList,
      onPageChange: this.onPageChange,
      sortName: "",
      sortOrder: "",
      onSortChange: this.sortColumn,
    };
  }

  componentDidMount = () => {
    this.initializeData();
    // let search = window.location.search;
    // let params = new URLSearchParams(search);
    // let payroll_id = params.get('payroll_id');
  };
  calculatePayperioad = (startDate, endDate) => {
    let month = moment(startDate).format("MMMM");
    // let diffDays=	Math.abs(parseInt((this.state.startDate - this.state.endDate) / (1000 * 60 * 60 * 24), 10))+1
    const diffTime = Math.abs(startDate - endDate);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    diffDays = diffDays > 30 ? 30 : month == "February" ? 30 : diffDays;
    this.setState({ paidDays: diffDays });
    this.getAllPayrollEmployee(startDate, endDate);
  };

  tableApiCallsOnStatus = () => {
    this.getAllPayrollEmployee();
  };
  closeModal = (res) => {
    this.setState({ openModal: false });
  };
  initializeData = () => {
    this.props.createPayrollActions.getEmployeesForDropdown();
    this.props.createPayrollActions.getApproversForDropdown();
    this.tableApiCallsOnStatus();
    this.calculatePayperioad(this.state.startDate, this.state.endDate);
  };

  employeeListIds = (option) => {
    this.setState(
      {
        initValue: {
          ...this.state.initValue,
          ...{
            employeeListIds: option,
          },
        },
      },
      () => {}
    );
  };

  addEmployee = (data, resetForm) => {
    this.setState({ disabled: true });
    const { employeeIds } = data;

    let employeeList = [];
    Object.keys(employeeIds).forEach((key) => {
      employeeList.push(employeeIds[key].value);
    });

    this.props.createPayrollActions
      .addMultipleEmployees(this.state.payroll_id, employeeList)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            "success",
            "Employees added Successfully"
          );
          this.tableApiCallsOnStatus();
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
      });
  };

  handleSubmit = (data, resetForm) => {
    this.setState({ disabled: true, disableLeavePage: true });
    const { payrollSubject, payrollDate, payrollApprover, startDate, endDate } =
      data;
    let employeeListIds = this.state.selectedRows
      ? this.state.selectedRows
      : "";

    let diff =
      Math.abs(parseInt((startDate - endDate) / (1000 * 60 * 60 * 24), 10)) + 1;

    let string =
      moment(this.state.startDate).format("DD/MM/YYYY") +
      "-" +
      moment(this.state.endDate).format("DD/MM/YYYY");
    this.setState({ payPeriod: string });
    const formData = new FormData();
    if (payrollSubject === undefined) {
      formData.append(
        "payrollSubject",
        this.state.payrollSubject ? this.state.payrollSubject : null
      );
    } else {
      formData.append("payrollSubject", payrollSubject);
    }

    formData.append("payPeriod", this.state.payPeriod);
    formData.append("employeeListIds", employeeListIds);

    if (payrollApprover === undefined) {
      formData.append(
        "approverId",
        this.state.payrollApprover?.value
          ? this.state.payrollApprover.value
          : null
      );
    } else if (payrollApprover !== "") {
      formData.append("approverId", parseInt(payrollApprover?.value));
    }

    this.state.selectedRows1.forEach((i) => {
      delete i.joiningDate;
    });
    formData.append(
      "generatePayrollString",
      JSON.stringify(this.state.selectedRows1)
    );
    formData.append("salaryDate", payrollDate);
    //Payroll total  amount
    let totalAmountPayroll = 0;
    this.state.selectedRows1.map((row) => {
      totalAmountPayroll += parseFloat(row.netPay);
    });
    formData.append("totalAmountPayroll", totalAmountPayroll);

    if (this.state.apiSelector === "createPayroll") {
      this.setState({ loading: true, loadingMsg: "Creating Payroll..." });
      this.props.createPayrollActions
        .createPayroll(formData)
        .then((res) => {
          if (res.status === 200) {
            this.props.commonActions.tostifyAlert(
              "success",
              "Payroll created Successfully"
            );
            this.tableApiCallsOnStatus();
            this.props.history.push(`/admin/payroll/payrollrun`);
            this.setState({ loading: false });
          }
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert(
            "error",
            err && err.data ? err.data.message : "Something Went Wrong"
          );
        });
    } else {
      if (this.state.apiSelector === "createAndSubmitPayroll") {
        this.setState({ loading: true, loadingMsg: "Submitting Payroll..." });
        this.props.createPayrollActions
          .createAndSubmitPayroll(formData)
          .then((res) => {
            if (res.status === 200) {
              this.props.commonActions.tostifyAlert(
                "success",
                "Payroll created And Submitted Successfully"
              );
              this.tableApiCallsOnStatus();
              this.props.history.push(`/admin/payroll/payrollrun`);
              this.setState({ loading: false });
            }
          })
          .catch((err) => {
            this.props.commonActions.tostifyAlert(
              "error",
              err && err.data ? err.data.message : "Something Went Wrong"
            );
          });
      }
    }
  };

  setDate = (props, value) => {
    const { term } = this.state;
    const val = term ? term.value.split("_") : "";
    const temp = val[val.length - 1] === "Receipt" ? 1 : val[val.length - 1];
    const values = value
      ? value
      : moment(props.values.payrollDate, "DD-MM-YYYY").toDate();
  };

  getAllPayrollEmployee2 = () => {
    this.props.createPayrollActions
      .getAllPayrollEmployee2(this.state.payroll_id)
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            allPayrollEmployee: res.data,
          });
        }
      });
  };

  validatePayrollSubjectName = (value) => {
    const data = {
      moduleType: 27,
      name: value,
    };
    this.props.commonActions.checkValidation(data).then((response) => {
      if (response.data === "Payroll Subject already exists") {
        this.setState({
          isPayrollSubjectNameExist: true,
        });
      } else {
        this.setState({
          isPayrollSubjectNameExist: false,
        });
      }
    });
  };
  getAllPayrollEmployee = (startDate, endDate) => {
    var employeePayPeriodlList = [];
    var activeEmployee = [];
    this.props.employeeActions.getEmployeeListWithDetails().then((response) => {
      if (response.status === 200) {
        employeePayPeriodlList = response.data;
        //maintaining new state
        let date = startDate ? startDate : this.state.startDate;
        endDate = endDate ? endDate : this.state.endDate;
        let month = moment(date).format("MMMM");
        this.props.createPayrollActions
          .getAllPayrollEmployee(moment(date).format("DD/MM/YYYY"))
          .then((res) => {
            if (res.status === 200) {
              this.setState(
                {
                  allPayrollEmployee: res.data,
                },
                () => {
                  let newData = [...this.state.allPayrollEmployee];
                  newData = newData.map((data) => {
                    /** if month is of 31 days and 28days so its will be treated as 30 days only ,
                     * need to handle this in future release */
                    //for  month wise case handling ,need to add switch in future
                    let tmpPaidDay =
                      this.state.paidDays > 30
                        ? 30
                        : month == "February"
                        ? 30
                        : this.state.paidDays;
                    data.noOfDays = tmpPaidDay;
                    data.originalNoOfDays = tmpPaidDay;
                    data.originalGrossPay = data.grossPay;
                    data.originalDeduction = data.deduction;
                    data.deduction = (
                      (data.originalDeduction / 30) *
                      data.noOfDays
                    ).toFixed(2);
                    data.perDaySal = data.originalGrossPay / 30;

                    data.lopDay = 0;
                    data.grossPay = Number(
                      data.perDaySal * data.noOfDays
                    ).toFixed(2);
                    data.netPay =
                      Number(data.perDaySal * data.noOfDays).toFixed(2) -
                      (data.deduction || 0);

                    const empList = employeePayPeriodlList.filter(
                      (obj) => obj.employeeId === data.id
                    );
                    if (empList && empList?.length > 0) {
                      let flag = true;
                      empList.map((obj) => {
                        let payStartDate = moment(
                          moment(
                            obj.payPeriod.split("-")[0].replaceAll("/", "-"),
                            "DD-MM-YYYY"
                          ).toDate()
                        );
                        let payEndDate = moment(
                          moment(
                            obj.payPeriod.split("-")[1].replaceAll("/", "-"),
                            "DD-MM-YYYY"
                          ).toDate()
                        );
                        let startDate = moment(date);
                        endDate = moment(endDate);
                        if (
                          (startDate.isBefore(payEndDate) &&
                            startDate.isAfter(payStartDate)) ||
                          startDate.isSame(payStartDate) ||
                          startDate.isSame(payEndDate)
                        ) {
                          flag = false;
                        } else if (
                          (endDate.isBefore(payEndDate) &&
                            endDate.isAfter(payStartDate)) ||
                          endDate.isSame(payStartDate) ||
                          endDate.isSame(payEndDate)
                        ) {
                          flag = false;
                        } else if (
                          (payStartDate.isBefore(endDate) &&
                            payStartDate.isAfter(startDate)) ||
                          payStartDate.isSame(startDate) ||
                          payStartDate.isSame(endDate)
                        ) {
                          flag = false;
                        } else if (
                          (payEndDate.isBefore(endDate) &&
                            payEndDate.isAfter(startDate)) ||
                          payEndDate.isSame(startDate) ||
                          payEndDate.isSame(endDate)
                        ) {
                          flag = false;
                        }
                      });
                      if (flag) {
                        activeEmployee.push(data);
                      }
                    } else {
                      activeEmployee.push(data);
                    }
                    return data;
                  });
                  this.setState({
                    allPayrollEmployee: activeEmployee,
                  });
                }
              );
            }
          });
      }
    });
  };

  getPayrollEmployeeList = () => {
    const cols = [
      {
        label: "Employee No",
        // dataSort: true,
        width: "",
        key: "empCode",
      },
      {
        label: "Employee Name",
        // dataSort: true,
        width: "",
        key: "empName",
      },
      {
        label: "LOP",
        // dataSort: true,
        width: "8%",
        key: "lopDay",
      },
      {
        label: "Paid Days",
        // dataSort: true,
        width: "12%",
        key: "noOfDays",
      },
      {
        label: "Gross Pay",
        // dataSort: true,
        width: "",
        key: "grossPay",
      },
      {
        label: "Deductions",
        // dataSort: true,
        width: "",
        key: "deduction",
      },
      {
        label: "Net Pay",
        // dataSort: true,
        width: "12%",
        key: "netPay",
      },
    ];

    return (
      <React.Fragment>
        <Row >
          <Button
            color="primary"
            className="btn-square mr-3 mb-3"
            onClick={(e, props) => {
              this.setState({ openEmployeeModal: true });
            }}
          >
            <i className="fa fa-plus"></i> {strings.AddEmployee}
          </Button>
        </Row>
        <div>
          <BootstrapTable
            selectRow={this.state.selectRowProp}
            search={false}
            options={this.options}
            data={this.state.allPayrollEmployee || []}
            version="4"
            hover
            keyField="id"
            remote
            trClassName="cursor-pointer"
            csvFileName="payroll_employee_list.csv"
            ref={(node) => (this.table = node)}
          >
            {cols.map((col, index) => {
              const format = (cell, row) => {
                if (col.key === "lopDay") {
                  return (
                    <Input
                      className="spinboxDisable"
                      type="number"
                      min={0}
                      step="0.5"
                      max={this.state.paidDays - 1}
                      id="lopDay"
                      name="lopDay"
                      value={cell || 0}
                      onChange={(evt) => {
                        let value = parseFloat(
                          evt.target.value === "" ? "0" : evt.target.value
                        );

                        if (
                          value > this.state.paidDays ||
                          value < 0 ||
                          value === this.state.paidDays
                        ) {
                          return;
                        }
                        this.updateAmounts(row, value);
                      }}
                    />
                  );
                } else if (col.key === "grossPay") {
                  let grossPay = parseFloat(cell);
                  return (
                    <div>
                      {this.state.currencyIsoCode
                        ? this.state.currencyIsoCode
                        : "AED"}
                      {" " +
                        grossPay.toLocaleString(navigator.language, {
                          minimumFractionDigits: 2,
                        })}
                    </div>
                  );
                } else if (col.key === "netPay") {
                  return (
                    <div>
                      {this.state.currencyIsoCode
                        ? this.state.currencyIsoCode
                        : "AED"}
                      {" " +
                        cell.toLocaleString(navigator.language, {
                          minimumFractionDigits: 2,
                        })}
                    </div>
                  );
                } else if (col.key === "deduction") {
                  return (
                    <div>
                      {this.state.currencyIsoCode
                        ? this.state.currencyIsoCode
                        : "AED"}
                      {" " +
                        cell.toLocaleString(navigator.language, {
                          minimumFractionDigits: 2,
                        })}
                    </div>
                  );
                } else {
                  return <div>{cell}</div>;
                }
              };

              if (
                col.key === "netPay" ||
                col.key === "deduction" ||
                col.key === "grossPay"
              ) {
                return (
                  <TableHeaderColumn
                    key={index}
                    dataFormat={format}
                    dataField={col.key}
                    dataAlign="right"
                    className="table-header-bg"
                    dataSort={col.dataSort}
                    width={col.width}
                  >
                    {col.label}
                  </TableHeaderColumn>
                );
              } else {
                return (
                  <TableHeaderColumn
                    key={index}
                    dataFormat={format}
                    dataField={col.key}
                    dataAlign="center"
                    className="table-header-bg"
                    dataSort={col.dataSort}
                    width={col.width}
                  >
                    {col.label}
                  </TableHeaderColumn>
                );
              }
            })}
          </BootstrapTable>
        </div>
      </React.Fragment>
    );
  };
  updateAmounts = (row, value) => {
    if (value > 30) {
      value = 30;
    }
    let tmpPaidDay = this.state.paidDays;
    let newData = [...this.state.allPayrollEmployee];
    newData = newData.map((data) => {
      if (row.id === data.id) {
        data.lopDay = value;
        data.noOfDays = parseFloat(tmpPaidDay) - value;
        data.deduction = (
          (data.originalDeduction / 30) *
          data.noOfDays
        ).toFixed(2);
        let deduction = data.noOfDays == 0 ? 0 : data.deduction;

        data.grossPay = Number(data.perDaySal * data.noOfDays).toFixed(2);
        data.netPay =
          Number(data.perDaySal * data.noOfDays).toFixed(2) - (deduction || 0);
      }
      data.payrollId = this.state.payroll_id;
      data.salaryDate = this.state.payrollDate;
      return data;
    });
    this.setState({ allPayrollEmployee: newData });
  };
  generate = () => {
    const formData = new FormData();
    formData.append("payrollId", this.state.payroll_id);
    formData.append("salaryDate", this.state.payrollDate);
    formData.append(
      "generatePayrollString",
      JSON.stringify(this.state.allPayrollEmployee)
    );

    this.props.createPayrollActions
      .generatePayroll(formData)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            "success",
            "genrated payroll Successfully"
          );
          this.proceed1();
          this.tableApiCallsOnStatus();
          // resetForm(this.state.initValue)
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
      });
  };

  submitPayroll = (data) => {
    const { userId } = data;
    this.props.createPayrollActions
      .submitPayroll(this.state.payroll_id, this.state.userId)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            "success",
            "Payroll Submitted Successfully"
          );
          this.proceed();
          this.tableApiCallsOnStatus();
          // resetForm(this.state.initValue)
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
      });
  };
  removeEmployee = () => {
    let ids = this.state.selectedRows;
    if (ids && ids.length) {
      let employeeList = [];
      Object.keys(this.state.selectedRows).forEach((key) => {
        employeeList.push(this.state.selectedRows[key]);
      });

      this.props.createPayrollActions
        .removeEmployee(employeeList)
        .then((res) => {
          let newselectRowProp = { ...this.state.selectedRowprop };
          newselectRowProp.selected = [];

          this.setState({
            selectRow: [],
            selectedRowprop: newselectRowProp,
          });

          if (res.status == 200) {
            this.props.commonActions.tostifyAlert(
              "success",
              "Employee(s) deleted Successfully"
            );
            this.tableApiCallsOnStatus();
          }

          if (res.status == 204) {
            this.props.commonActions.tostifyAlert(
              "success",
              "Employee(s) deleted Successfully"
            );
            this.tableApiCallsOnStatus();
          }
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert("error", "Error...");
        });
    }
    this.tableApiCallsOnStatus();
  };

  onSubmiitedStatus = () => {
    if (this.state.status === "Submmited") {
      return true;
    } else {
      return false;
    }
  };

  onRowSelect = (row, isSelected, e) => {
    let tempList = [];
    let tempList1 = [];
    if (isSelected) {
      tempList = Object.assign([], this.state.selectedRows);
      tempList1 = Object.assign([], this.state.selectedRows1);
      tempList.push(row.empId);
      tempList1.push(row);
    } else {
      this.state.selectedRows1.map((item) => {
        if (item.empId !== row.empId) {
          tempList.push(item.empId);
          tempList1.push(item);
        }
        return item;
      });
    }
    this.setState({
      selectedRows: tempList,
      selectedRows1: tempList1,
    });
  };
  onSelectAll = (isSelected, rows) => {
    let tempList = [];
    let tempList1 = [];
    if (isSelected) {
      rows.map((item) => {
        tempList.push(item.empId);
        tempList1.push(item);
        return item;
      });
    }
    this.setState({
      selectedRows: tempList,
      selectedRows1: tempList1,
    });
  };

  handleDatesChange = ({ startDate, endDate }) => {
    this.setState({ startDate: startDate, endDate: endDate });
  };
  handleDateChange = ({ startDate, endDate }) => {
    this.setState({ startDate, endDate });
    this.calculatePayperioad(startDate, endDate);
  };
  handleFocusChange = (focusedInput) => this.setState({ focusedInput });
  showTotal = () => {
    let totalAmountPayroll = 0;
    this.state.selectedRows1.map((row) => {
      totalAmountPayroll += parseFloat(row.grossPay);
    });
    return (
      <div
        className="p-2"
        style={{ borderBottom: "1px solid #c8ced3", width: "25%" }}
      >
        <Row>
          <Col>
            <h5 className="mb-0">{strings.Total + " " + strings.Amount}</h5>
          </Col>
          <Col className="text-right">
            <label className="mb-0">
              AED &nbsp;
              {totalAmountPayroll.toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
              })}
            </label>
          </Col>
        </Row>
      </div>
    );
  };
  render() {
    strings.setLanguage(this.state.language);

    const { employee_list, approver_dropdown_list } = this.props;
    const { loading, initValue, loadingMsg, openEmployeeModal } = this.state;
    var today = new Date();
    return loading == true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div>
        <div className="create-employee-screen">
          <div className="animated fadeIn">
            <Row>
              <Col lg={12} className="mx-auto">
                <Card>
                  <CardHeader>
                    <Row>
                      <Col lg={12}>
                        <div className="h4 mb-0 d-flex align-items-center">
                          <i className="nav-icon fas fa-money-check-alt" />
                          <span className="ml-2">{strings.create_payroll}</span>
                        </div>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    {loading ? (
                      <Row>
                        <Col lg={12}>
                          <Loader />
                        </Col>
                      </Row>
                    ) : (
                      <Row>
                        <Col lg={12}>
                          <div className="d-flex justify-content-end">
                            <ButtonGroup size="sm"></ButtonGroup>
                          </div>

                          <div>
                            <Formik
                              initialValues={this.state}
                              onSubmit={(values, { resetForm }) => {
                                if (this.state.selectedRows) {
                                  this.handleSubmit(values);
                                }
                              }}
                              validationSchema={Yup.object().shape({
                                // payrollSubject: Yup.string()
                                // 	.required("Payroll subject is required"),
                                payrollDate: Yup.string().required(
                                  "Payroll date is required"
                                ),
                                // payrollApprover: Yup.string()
                                // 	.required("Payroll Approver is required"),
                              })}
                              validate={(values) => {
                                // let status = false
                                let errors = {};
                                // if (this.state.payrollApproverRequired && !values.payrollApprover) {
                                // 	errors.payrollApprover = 'Payroll Approver is required';
                                // }
                                // if (!values.payrollApprover){
                                // 	errors.payrollApprover="Payroll approver is required"
                                // }
                                if (
                                  this.state.payrollApproverRequired &&
                                  !values.payrollApprover
                                ) {
                                  errors.payrollApprover =
                                    "Payroll approver is required";
                                }
                                if (!values.payrollDate) {
                                  errors.payrollDate =
                                    "Payroll date is required";
                                }
                                if (
                                  this.state.payrollSubjectRequired &&
                                  !values.payrollSubject
                                ) {
                                  errors.payrollSubject =
                                    "Payroll subject is required";
                                }

                                if (
                                  this.state.isPayrollSubjectNameExist === true
                                ) {
                                  errors.payrollSubject =
                                    "Payroll Subject Already Exists";
                                }
                                // if(this.state.selectedRows && this.state.selectedRows.length===0)
                                // {
                                // 	errors.selectedRows = 'At least selection of one employee  is required for create payroll';
                                // }
                                // let DOJ = this.state.selectedRows1.map((i) => moment(i.joiningDate).format('DD-MM-YYYY'))
                                // DOJ.forEach((dateString) => {
                                // 	let mStart = moment(this.state.startDate).format('DD-MM-YYYY')
                                // 	if (mStart < dateString) {
                                // 		errors.startDate = 'Pay-Period should start after the date of joining';
                                // 	}
                                // });
                                if (
                                  !this.state.startDate &&
                                  !this.state.endDate
                                ) {
                                  errors.startDate =
                                    "Start date and end date is required";
                                } else if (!this.state.startDate) {
                                  errors.startDate = "Start date is required";
                                } else if (!this.state.endDate) {
                                  errors.startDate = "End date is required";
                                }

                                return errors;
                              }}
                            >
                              {(props) => (
                                <Form onSubmit={props.handleSubmit}>
                                  <Row>
                                    <Col>
                                      <FormGroup>
                                        <Label htmlFor="payrollSubject">
                                          <span className="text-danger">
                                            *{" "}
                                          </span>
                                          {strings.payroll_subject}
                                        </Label>
                                        <Input
                                          type="text"
                                          id="payrollSubject"
                                          name="payrollSubject"
                                          value={props.values.payrollSubject}
                                          maxLength="100"
                                          placeholder={
                                            strings.Enter + strings.pay_subject
                                          }
                                          onChange={(option) => {
                                            if (
                                              option.target.value === "" ||
                                              this.regExAlphaNumeric.test(
                                                option.target.value
                                              )
                                            )
                                              props.handleChange(
                                                "payrollSubject"
                                              )(option.target.value);
                                            this.validatePayrollSubjectName(
                                              option.target.value
                                            );
                                          }}
                                          className={
                                            props.errors.payrollSubject
                                              ? "is-invalid"
                                              : ""
                                          }
                                        />
                                        {props.errors.payrollSubject && (
                                          <div className="invalid-feedback">
                                            {props.errors.payrollSubject}
                                          </div>
                                        )}
                                      </FormGroup>
                                    </Col>
                                    <Col>
                                      <FormGroup className="mb-3">
                                        <Label htmlFor="date">
                                          <span className="text-danger">
                                            *{" "}
                                          </span>
                                          {strings.payroll_date}
                                        </Label>
                                        <DatePicker
                                          id="payrollDate"
                                          name="payrollDate"
                                          placeholderText="Select Payroll Date"
                                          showMonthDropdown
                                          showYearDropdown
                                          dateFormat="dd-MM-yyyy"
                                          dropdownMode="select"
                                          selected={props.values.payrollDate}
                                          onChange={(value) => {
                                            props.handleChange("payrollDate")(
                                              value
                                            );
                                          }}
                                          className={`form-control ${
                                            props.errors.payrollDate
                                              ? "is-invalid"
                                              : ""
                                          }`}
                                        />
                                        {props.errors.payrollDate && (
                                          <div className="invalid-feedback">
                                            {props.errors.payrollDate}
                                          </div>
                                        )}
                                      </FormGroup>
                                    </Col>

                                    <Col>
                                      <FormGroup className="mb-3">
                                        <Label htmlFor="startDate">
                                          <span className="text-danger">
                                            *{" "}
                                          </span>
                                          {strings.pay_period}
                                        </Label>
                                        <div
                                          className={
                                            props.errors.startDate
                                              ? "startError"
                                              : ""
                                          }
                                        >
                                          <DateRangePicker
                                            displayFormat="DD-MM-YYYY"
                                            endDate={this.state.endDate}
                                            endDateId="endDate"
                                            focusedInput={
                                              this.state.focusedInput
                                            }
                                            isOutsideRange={
                                              () => null
                                              // day => isInclusivelyBeforeDay(day, moment(new Date(today.getFullYear(), today.getMonth(),0)))
                                            }
                                            onDatesChange={
                                              this.handleDateChange
                                            }
                                            onFocusChange={
                                              this.handleFocusChange
                                            }
                                            startDate={this.state.startDate}
                                            startDateId="startDate"
                                            // className={`form-control ${props.errors.startDate
                                            // 	? 'is-invalid'
                                            // 	: ''
                                            // 	}`}
                                          />
                                        </div>
                                        {props.errors.startDate && (
                                          <div className="invalid-feedback">
                                            {props.errors.startDate}
                                          </div>
                                        )}
                                      </FormGroup>
                                    </Col>

                                    <Col>
                                      <FormGroup>
                                        <Label htmlFor="payrollApprover">
                                          <span className="text-danger">
                                            *{" "}
                                          </span>
                                          {strings.payroll_approver}
                                          <i
                                            id="payrollApprovertip"
                                            className="fa fa-question-circle ml-1"
                                          ></i>
                                          <UncontrolledTooltip
                                            placement="right"
                                            target="payrollApprovertip"
                                          >
                                            It is mandatory to have an approver
                                            for payroll submission. Otherwise,
                                            it is not mandatory.
                                          </UncontrolledTooltip>
                                        </Label>
                                        <Select
                                          id="payrollApprover"
                                          name="payrollApprover"
                                          placeholder={strings.select_approver}
                                          value={props.values.payrollApprover}
                                          options={
                                            approver_dropdown_list.data
                                              ? selectOptionsFactory.renderOptions(
                                                  "name",
                                                  "userId",
                                                  approver_dropdown_list.data,
                                                  "Approver"
                                                )
                                              : []
                                          }
                                          onChange={(option) => {
                                            this.setState(
                                              {
                                                payrollApproverRequired: false,
                                              },
                                              () => {
                                                if (option && option.value) {
                                                  props.handleChange(
                                                    "payrollApprover"
                                                  )(option);
                                                  this.setState({
                                                    userId: option.value,
                                                    submitButton: false,
                                                  });
                                                } else {
                                                  props.handleChange(
                                                    "payrollApprover"
                                                  )("");
                                                  this.setState({
                                                    userId: "",
                                                    submitButton: true,
                                                  });
                                                }
                                              }
                                            );
                                          }}
                                          className={
                                            props.errors.payrollApprover
                                              ? "is-invalid"
                                              : ""
                                          }
                                        />
                                        {props.errors.payrollApprover && (
                                          <div className="invalid-feedback">
                                            {props.errors.payrollApprover}
                                          </div>
                                        )}
                                      </FormGroup>
                                    </Col>
                                  </Row>
                                  <hr />
                                  <Row></Row>
                                  <Row>
                                    <FormGroup className="pull-left mt-3">
                                      {/* add and remove */}

                                      {/* <Button type="button" color="primary" className="btn-square ml-3 mr-1 "
																			
																			onClick={() => {
																				// this.setState(() => {
																				// 	props.handleSubmit()
																				// })
																				this.setState({
																					openModal: true
																				})
																			}}>
																			<i className="fa fa-dot-circle-o"></i> Add Employees
																		</Button>
																		<Button
																			color="primary"
																			className="btn-square ml-3 "
																			onClick={() => {
																				this.removeEmployee()
																			}}

																			
																		>
																			<i className="far fa-trash-alt mr-1"></i>
																			Remove Employees
																		</Button> */}
                                    </FormGroup>

                                    <Col></Col>
                                    <Col></Col>
                                    <Col
                                      lg={3}
                                      className="pull-right mt-3"
                                    ></Col>
                                  </Row>

                                  {this.getPayrollEmployeeList()}
                                  <Row>
                                    <Col>
                                      {this.state.selectedRows && (
                                        <div className="text-danger">
                                          {props.errors.selectedRows}
                                        </div>
                                      )}
                                    </Col>
                                  </Row>

                                  <Row>
                                    <Col></Col>
                                    <Col></Col>
                                    {
                                      // this.showTotal()
                                    }
                                  </Row>

                                  <Row className="mt-4 ">
                                    <Col>
                                      <Button
                                        color="secondary"
                                        className="btn-square pull-right"
                                        onClick={() => {
                                          this.props.history.push(
                                            "/admin/payroll/payrollrun"
                                          );
                                        }}
                                      >
                                        <i className="fa fa-ban"></i>{" "}
                                        {strings.Cancel}
                                      </Button>
                                      <Button
                                        color="primary"
                                        className="btn-square pull-right"
                                        onClick={() => {
                                          this.setState(
                                            {
                                              payrollApproverRequired: true,
                                              payrollSubjectRequired: true,
                                            },
                                            () => {
                                              //  added validation popup  msg
                                              props.handleBlur();
                                              if (
                                                props.errors &&
                                                Object.keys(props.errors)
                                                  .length != 0
                                              )
                                                this.props.commonActions.fillManDatoryDetails();

                                              if (!this.state.submitButton)
                                                if (
                                                  this.state.selectedRows &&
                                                  this.state.selectedRows
                                                    .length != 0
                                                ) {
                                                  this.setState({
                                                    apiSelector:
                                                      "createAndSubmitPayroll",
                                                  });
                                                  props.handleSubmit();
                                                } else
                                                  toast.error(
                                                    ` Please select at least one employee for payroll creation !`
                                                  );
                                            }
                                          );
                                        }}
                                        // disabled={!this.state.submitButton && this.state.selectedRows && this.state.selectedRows.length !=0 ? false :true}
                                        title={
                                          this.state.submitButton
                                            ? ` Please select approver for payroll submission !`
                                            : ""
                                        }
                                      >
                                        <i className="fas fa-check-double  mr-1"></i>{" "}
                                        {strings.create_submit}
                                      </Button>
                                      <Button
                                        type="button"
                                        color="primary"
                                        className="btn-square pull-right "
                                        onClick={() => {
                                          this.setState(
                                            {
                                              payrollApproverRequired: false,
                                              payrollSubjectRequired: true,
                                            },
                                            () => {
                                              //  added validation popup  msg
                                              props.handleBlur();
                                              // if (props.errors && Object.keys(props.errors).length != 0)
                                              // 	this.props.commonActions.fillManDatoryDetails();
                                              if (
                                                this.state.selectedRows &&
                                                this.state.selectedRows
                                                  .length != 0
                                              ) {
                                                this.setState({
                                                  apiSelector: "createPayroll",
                                                });
                                                props.handleSubmit();
                                              } else
                                                toast.error(
                                                  ` Please select at least one employee for payroll creation !`
                                                );
                                            }
                                          );
                                        }}
                                        // disabled={this.state.selectedRows && this.state.selectedRows.length !=0 ? false :true}
                                        title={
                                          this.state.selectedRows &&
                                          this.state.selectedRows.length != 0
                                            ? ""
                                            : `Please select at least one employee for payroll creation !`
                                        }
                                      >
                                        <i className="fa fa-dot-circle-o  mr-1"></i>{" "}
                                        {strings.create}
                                      </Button>
                                    </Col>
                                  </Row>
                                </Form>
                              )}
                            </Formik>
                          </div>
                        </Col>
                      </Row>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
          {openEmployeeModal && (
            <EmployeeModal
              openModal={openEmployeeModal}
              closeModal={(e) => {
                this.setState({ openEmployeeModal: !openEmployeeModal });
                this.initializeData();
              }}
            />
          )}
        </div>
        {this.state.disableLeavePage ? "" : <LeavePage />}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePayrollList);
