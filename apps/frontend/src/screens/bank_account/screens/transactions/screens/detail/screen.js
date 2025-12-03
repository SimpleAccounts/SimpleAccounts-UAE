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
  Form,
  FormGroup,
  Input,
  Label,
  NavLink,
} from "reactstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { CommonActions } from "services/global";
import { selectOptionsFactory } from "utils";
import moment from "moment";
import { LeavePage, Loader } from "components";
import * as transactionDetailActions from "./actions";
import * as transactionActions from "../../actions";
import "react-datepicker/dist/react-datepicker.css";
import "./style.scss";
import API_ROOT_URL from "../../../../../../constants/config";
import { ViewBankAccount } from "./sections";
import { data } from "../../../../../Language/index";
import LocalizedStrings from "react-localization";

const mapStateToProps = (state) => {
  return {
    transaction_category_list: state.bank_account.transaction_category_list,
    transaction_type_list: state.bank_account.transaction_type_list,
    project_list: state.bank_account.project_list,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    transactionActions: bindActionCreators(transactionActions, dispatch),
    transactionDetailActions: bindActionCreators(
      transactionDetailActions,
      dispatch
    ),
    commonActions: bindActionCreators(CommonActions, dispatch),
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
class DetailBankTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      createMore: false,
      loading: true,
      disableLeavePage: false,
      fileName: "",
      initValue: {},
      transaction_id: null,
      view: false,
    };

    this.file_size = 1024000;
    this.supported_format = [
      "image/png",
      "image/jpeg",
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;

    this.formRef = React.createRef();
  }

  componentDidMount = () => {
    this.initializeData();
  };

  initializeData = () => {
    this.props.transactionActions.getTransactionCategoryList();
    this.props.transactionActions.getTransactionTypeList();
    this.props.transactionActions.getProjectList();
    if (this.props.location.state && this.props.location.state.id) {
      this.props.transactionDetailActions
        .getTransactionDetail(this.props.location.state.id)
        .then((res) => {
          this.setState(
            {
              transaction_id: this.props.location.state.id,
              initValue: {
                bankAccountId: res.data.bankAccountId
                  ? res.data.bankAccountId
                  : "",
                transactionDate: res.data.transactionDate
                  ? res.data.transactionDate
                  : "",
                transactionDescription: res.data.transactionDescription
                  ? res.data.transactionDescription
                  : "",
                transactionAmount: res.data.transactionAmount
                  ? res.data.transactionAmount
                  : "",
                chartOfAccountId:
                  res.data.chartOfAccountId !== null
                    ? res.data.chartOfAccountId
                    : "",
                transactionCategoryId:
                  res.data.transactionCategoryId !== null
                    ? res.data.transactionCategoryId
                    : "",
                projectId: res.data.projectId ? res.data.projectId : "",
                receiptNumber: res.data.receiptNumber
                  ? res.data.receiptNumber
                  : "",
                attachementDescription: res.data.attachementDescription
                  ? res.data.attachementDescription
                  : "",
                attachment: res.data.attachment ? res.data.attachment : "",
                fileName: res.data.receiptAttachmentFileName
                  ? res.data.receiptAttachmentFileName
                  : "",
                filePath: res.data.receiptAttachmentPath
                  ? res.data.receiptAttachmentPath
                  : "",
              },
              view:
                this.props.location.state && this.props.location.state.view
                  ? true
                  : false,
            },
            () => {
              if (this.props.location.state && this.props.location.state.view) {
                this.setState({ loading: false });
              } else {
                this.setState({ loading: false });
              }
            }
          );
        })
        .catch((err) => {
          // this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
          this.props.history.push("/admin/banking/bank-account");
        });
    } else {
      this.props.history.push("/admin/banking/bank-account");
    }
  };

  handleFileChange = (e, props) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
      props.setFieldValue("attachment", file, true);
    }
  };

  handleSubmit = (data, resetForm) => {
    this.setState({ disabled: true, loading: true, disableLeavePage: true });
    const {
      bankAccountId,
      transactionDate,
      transactionDescription,
      transactionAmount,
      chartOfAccountId,
      transactionCategoryId,
      projectId,
      receiptNumber,
      attachementDescription,
    } = data;
    const { transaction_id } = this.state;
    let formData = new FormData();
    formData.append("bankAccountId ", bankAccountId ? bankAccountId : "");
    formData.append("id", transaction_id ? transaction_id : "");
    formData.append(
      "transactionDate",
      typeof transactionDate === "string"
        ? moment(transactionDate).toDate()
        : transactionDate
    );
    formData.append(
      "transactionDescription",
      transactionDescription ? transactionDescription : ""
    );
    formData.append(
      "transactionAmount",
      transactionAmount ? transactionAmount : ""
    );
    formData.append(
      "chartOfAccountId",
      typeof chartOfAccountId === "object"
        ? chartOfAccountId["value"]
        : chartOfAccountId
    );
    formData.append(
      "transactionCategoryId",
      typeof transactionCategoryId === "object"
        ? transactionCategoryId["value"]
        : transactionCategoryId
    );
    formData.append(
      "projectId",
      typeof projectId === "object" ? projectId["value"] : projectId
    );
    formData.append("receiptNumber", receiptNumber ? receiptNumber : "");
    formData.append(
      "attachementDescription",
      attachementDescription ? attachementDescription : ""
    );
    if (this.uploadFile?.files?.[0]) {
      formData.append("attachment", this.uploadFile?.files?.[0]);
    }
    this.props.transactionDetailActions
      .updateTransaction(formData)
      .then((res) => {
        if (res.status === 200) {
          resetForm();
          this.props.commonActions.tostifyAlert(
            "success",
            "Transaction Detail Updated Successfully."
          );
          this.props.history.push("/admin/banking/bank-account/transaction", {
            bankAccountId,
          });
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
      });
  };

  editDetails = () => {
    this.setState({
      view: false,
    });
  };

  render() {
    strings.setLanguage(this.state.language);
    const { project_list, transaction_category_list, transaction_type_list } =
      this.props;
    console.log(project_list);
    const { initValue, loading } = this.state;
    return (
      <div className="detail-bank-transaction-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              {loading ? (
                <Loader />
              ) : this.state.view ? (
                <ViewBankAccount
                  initialVals={initValue}
                  editDetails={() => {
                    this.editDetails();
                  }}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <Row>
                      <Col lg={12}>
                        <div className="h4 mb-0 d-flex align-items-center">
                          <i className="icon-doc" />
                          <span className="ml-2">
                            {strings.Update +
                              " " +
                              strings.Bank +
                              " " +
                              strings.Transaction +
                              " " +
                              strings.Details}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col lg={12}>
                        <Formik
                          initialValues={initValue}
                          ref={this.formRef}
                          onSubmit={(values, { resetForm }) => {
                            this.handleSubmit(values, resetForm);
                          }}
                          validationSchema={Yup.object().shape({
                            transactionDate: Yup.date().required(
                              "Transaction Date is Required"
                            ),
                            transactionAmount: Yup.string().required(
                              "Transaction Amount is Required"
                            ),
                            chartOfAccountId: Yup.string().required(
                              "Transaction Type is Required"
                            ),
                            attachment: Yup.mixed()
                              .test(
                                "fileType",
                                "*Unsupported File Format",
                                (value) => {
                                  value &&
                                    this.setState({
                                      fileName: value.name,
                                    });
                                  if (
                                    !value ||
                                    (value &&
                                      this.supported_format.includes(
                                        value.type
                                      )) ||
                                    !value
                                  ) {
                                    return true;
                                  } else {
                                    return false;
                                  }
                                }
                              )
                              .test(
                                "fileSize",
                                "*File Size is too large",
                                (value) => {
                                  if (
                                    !value ||
                                    (value && value.size <= this.file_size) ||
                                    !value
                                  ) {
                                    return true;
                                  } else {
                                    return false;
                                  }
                                }
                              ),
                          })}
                        >
                          {(props) => (
                            <Form onSubmit={props.handleSubmit}>
                              <Row>
                                <Col lg={4}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="chartOfAccountId">
                                      <span className="text-danger">* </span>
                                      {strings.TransactionType}
                                    </Label>
                                    <Select
                                      styles={customStyles}
                                      options={
                                        transaction_type_list
                                          ? selectOptionsFactory.renderOptions(
                                              "chartOfAccountName",
                                              "chartOfAccountId",
                                              transaction_type_list,
                                              "Type"
                                            )
                                          : ""
                                      }
                                      value={
                                        transaction_type_list &&
                                        selectOptionsFactory
                                          .renderOptions(
                                            "chartOfAccountName",
                                            "chartOfAccountId",
                                            transaction_type_list,
                                            "Type"
                                          )
                                          .find(
                                            (option) =>
                                              option.value ===
                                              props.values.chartOfAccountId
                                          )
                                      }
                                      onChange={(option) => {
                                        if (option && option.value) {
                                          props.handleChange(
                                            "chartOfAccountId"
                                          )(option);
                                        } else {
                                          props.handleChange(
                                            "chartOfAccountId"
                                          )("");
                                        }
                                      }}
                                      placeholder={
                                        strings.Select +
                                        " " +
                                        strings.TransactionType
                                      }
                                      id="chartOfAccountId"
                                      name="chartOfAccountId"
                                      className={
                                        props.errors.chartOfAccountId &&
                                        props.touched.chartOfAccountId
                                          ? "is-invalid"
                                          : ""
                                      }
                                    />
                                    {props.errors.chartOfAccountId &&
                                      props.touched.chartOfAccountId && (
                                        <div className="invalid-feedback">
                                          {props.errors.chartOfAccountId}
                                        </div>
                                      )}
                                  </FormGroup>
                                </Col>
                                <Col lg={4}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="date">
                                      <span className="text-danger">* </span>
                                      {strings.TransactionDate}
                                    </Label>
                                    <DatePicker
                                      id="transactionDate"
                                      name="transactionDate"
                                      placeholderText={strings.TransactionDate}
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd-MM-yyyy"
                                      dropdownMode="select"
                                      value={
                                        props.values.transactionDate
                                          ? moment(
                                              props.values.transactionDate
                                            ).format("DD-MM-YYYY")
                                          : ""
                                      }
                                      // selected={props.values.transactionDate}
                                      onChange={(value) =>
                                        props.handleChange("transactionDate")(
                                          value
                                        )
                                      }
                                      className={`form-control ${
                                        props.errors.transactionDate &&
                                        props.touched.transactionDate
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                    />
                                    {props.errors.transactionDate &&
                                      props.touched.transactionDate && (
                                        <div className="invalid-feedback">
                                          {props.errors.transactionDate}
                                        </div>
                                      )}
                                  </FormGroup>
                                </Col>
                                <Col lg={4}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="transactionAmount">
                                      <span className="text-danger">* </span>
                                      {strings.Total + " " + strings.Amount}
                                    </Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      id="transactionAmount"
                                      name="transactionAmount"
                                      placeholder={strings.Amount}
                                      onChange={(option) => {
                                        if (
                                          option.target.value === "" ||
                                          this.regEx.test(option.target.value)
                                        ) {
                                          props.handleChange(
                                            "transactionAmount"
                                          )(option);
                                        }
                                      }}
                                      value={props.values.transactionAmount}
                                      className={
                                        props.errors.transactionAmount &&
                                        props.touched.transactionAmount
                                          ? "is-invalid"
                                          : ""
                                      }
                                    />
                                    {props.errors.transactionAmount &&
                                      props.touched.transactionAmount && (
                                        <div className="invalid-feedback">
                                          {props.errors.transactionAmount}
                                        </div>
                                      )}
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={4}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="transactionCategoryId">
                                      {strings.Category}
                                    </Label>
                                    <Select
                                      styles={customStyles}
                                      className="select-default-width"
                                      options={
                                        transaction_category_list &&
                                        transaction_category_list.data
                                          ? selectOptionsFactory.renderOptions(
                                              "transactionCategoryName",
                                              "transactionCategoryId",
                                              transaction_category_list.data,
                                              "Category"
                                            )
                                          : []
                                      }
                                      id="transactionCategoryId"
                                      value={
                                        transaction_category_list &&
                                        transaction_category_list.data &&
                                        selectOptionsFactory
                                          .renderOptions(
                                            "transactionCategoryName",
                                            "transactionCategoryId",
                                            transaction_category_list.data,
                                            "Category"
                                          )
                                          .find(
                                            (option) =>
                                              option.value ===
                                              props.values.transactionCategoryId
                                          )
                                      }
                                      onChange={(option) => {
                                        if (option && option.value) {
                                          props.handleChange(
                                            "transactionCategoryId"
                                          )(option);
                                        } else {
                                          props.handleChange(
                                            "transactionCategoryId"
                                          )("");
                                        }
                                      }}
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={8}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="transactionDescription">
                                      {strings.Description}
                                    </Label>
                                    <Input
                                      type="textarea"
                                      name="description"
                                      id="description"
                                      rows="6"
                                      placeholder={strings.Description}
                                      onChange={(option) => {
                                        if (!option.target.value.includes("="))
                                          props.handleChange(
                                            "transactionDescription"
                                          )(option);
                                      }}
                                      value={
                                        props.values.transactionDescription
                                      }
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={4}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="projectId">
                                      {strings.Project}
                                    </Label>
                                    <Select
                                      styles={customStyles}
                                      className="select-default-width"
                                      options={
                                        project_list
                                          ? selectOptionsFactory.renderOptions(
                                              "label",
                                              "value",
                                              project_list,
                                              "Project"
                                            )
                                          : []
                                      }
                                      id="projectId"
                                      name="projectId"
                                      value={
                                        project_list &&
                                        project_list.find(
                                          (option) =>
                                            option.value ===
                                            +props.values.projectId
                                        )
                                      }
                                      onChange={(option) => {
                                        if (option && option.value) {
                                          props.handleChange("projectId")(
                                            option
                                          );
                                        } else {
                                          props.handleChange("projectId")("");
                                        }
                                      }}
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={8}>
                                  <Row>
                                    <Col lg={6}>
                                      <FormGroup className="mb-3">
                                        <Label htmlFor="receiptNumber">
                                          {strings.ReceiptNumber}
                                        </Label>
                                        <Input
                                          type="text"
                                          maxLength="20"
                                          id="receiptNumber"
                                          name="receiptNumber"
                                          placeholder={strings.ReceiptNumber}
                                          onChange={(option) => {
                                            if (
                                              option.target.value === "" ||
                                              this.regExBoth.test(
                                                option.target.value
                                              )
                                            ) {
                                              props.handleChange(
                                                "receiptNumber"
                                              )(option);
                                            }
                                          }}
                                          value={props.values.receiptNumber}
                                        />
                                      </FormGroup>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col lg={12}>
                                      <FormGroup className="mb-3 hideAttachment">
                                        <Label htmlFor="attachementDescription">
                                          {strings.AttachmentDescription}
                                        </Label>
                                        <Input
                                          type="textarea"
                                          name="attachementDescription"
                                          id="attachementDescription"
                                          rows="5"
                                          placeholder={strings.Description}
                                          onChange={(option) =>
                                            props.handleChange(
                                              "attachementDescription"
                                            )(option)
                                          }
                                          value={
                                            props.values.attachementDescription
                                          }
                                        />
                                      </FormGroup>
                                    </Col>
                                  </Row>
                                </Col>
                                <Col lg={4}>
                                  <Row>
                                    <Col lg={12}>
                                      <FormGroup className="mb-3 hideAttachment">
                                        <Field
                                          name="attachment"
                                          render={({ field, form }) => (
                                            <div>
                                              <Label>
                                                {strings.ReceiptAttachment}
                                              </Label>{" "}
                                              <br />
                                              <div className="file-upload-cont">
                                                <Button
                                                  color="primary"
                                                  onClick={() => {
                                                    document
                                                      .getElementById(
                                                        "fileInput"
                                                      )
                                                      .click();
                                                  }}
                                                  className="btn-square mr-3"
                                                >
                                                  <i className="fa fa-upload"></i>{" "}
                                                  {strings.upload}
                                                </Button>
                                                <input
                                                  id="fileInput"
                                                  ref={(ref) => {
                                                    this.uploadFile = ref;
                                                  }}
                                                  type="file"
                                                  style={{ display: "none" }}
                                                  onChange={(e) => {
                                                    this.handleFileChange(
                                                      e,
                                                      props
                                                    );
                                                  }}
                                                />
                                                {this.state.fileName && (
                                                  <div>
                                                    <i
                                                      className="fa fa-close"
                                                      onClick={() =>
                                                        this.setState({
                                                          fileName: "",
                                                        })
                                                      }
                                                    ></i>{" "}
                                                    {this.state.fileName}
                                                  </div>
                                                )}
                                                {this.state.fileName ? (
                                                  this.state.fileName
                                                ) : (
                                                  <NavLink
                                                    download={
                                                      this.state.initValue
                                                        .fileName
                                                    }
                                                    href={`${API_ROOT_URL.API_ROOT_URL}${initValue.filePath}`}
                                                    style={{
                                                      fontSize: "0.875rem",
                                                    }}
                                                    target="_blank"
                                                  >
                                                    {
                                                      this.state.initValue
                                                        .fileName
                                                    }
                                                  </NavLink>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        />
                                        {props.errors.attachment && (
                                          <div className="invalid-file">
                                            {props.errors.attachment}
                                          </div>
                                        )}
                                      </FormGroup>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={12} className="mt-5">
                                  <FormGroup className="text-right">
                                    <Button
                                      type="button"
                                      color="primary"
                                      className="btn-square mr-3"
                                      onClick={props.handleSubmit}
                                    >
                                      <i className="fa fa-dot-circle-o"></i>{" "}
                                      {strings.Update}
                                    </Button>
                                    <Button
                                      color="secondary"
                                      className="btn-square"
                                      onClick={() =>
                                        this.props.history.push(
                                          "/admin/banking/bank-account/transaction",
                                          {
                                            bankAccountId:
                                              initValue.bankAccountId,
                                            currency:
                                              this.props.location.state
                                                ?.currency,
                                          }
                                        )
                                      }
                                    >
                                      <i className="fa fa-ban"></i>{" "}
                                      {strings.Cancel}
                                    </Button>
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Form>
                          )}
                        </Formik>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              )}
            </Col>
          </Row>
        </div>
        {this.state.disableLeavePage ? "" : <LeavePage />}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailBankTransaction);
