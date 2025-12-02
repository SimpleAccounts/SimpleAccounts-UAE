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
} from "reactstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { CommonActions } from "services/global";
import moment from "moment";
import * as transactionCreateActions from "./actions";
import * as transactionActions from "../../actions";
import * as detailBankAccountActions from "../../../detail/actions";
import * as AllPayrollActions from "../../../../../payroll_run/actions";
import * as CurrencyConvertActions from "../../../../../currencyConvert/actions";
import "react-datepicker/dist/react-datepicker.css";
import "./style.scss";
import { data } from "../../../../../Language/index";
import LocalizedStrings from "react-localization";
import { selectOptionsFactory, selectCurrencyFactory } from "utils";
import Switch from "react-switch";
import { LeavePage, Loader } from "components";
import { Checkbox } from "@material-ui/core";
import { defaultState } from "./helpers/defaultstate";
import { calculateVAT } from "./helpers/calculateVat";
import { amountFormat } from "./helpers/amountformater";

const mapStateToProps = (state) => {
  return {
    transaction_category_list: state.bank_account.transaction_category_list,
    transaction_type_list: state.bank_account.transaction_type_list,
    customer_invoice_list: state.bank_account.customer_invoice_list,
    vendor_invoice_list: state.bank_account.vendor_invoice_list,
    expense_list: state.bank_account.expense_list,
    expense_categories_list: state.expense.expense_categories_list,
    user_list: state.bank_account.user_list,
    currency_list: state.bank_account.currency_list,
    vendor_list: state.bank_account.vendor_list,
    vat_list: state.bank_account.vat_list,
    currency_convert_list: state.common.currency_convert_list,
    UnPaidPayrolls_List: state.bank_account.UnPaidPayrolls_List,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    transactionActions: bindActionCreators(transactionActions, dispatch),
    allPayrollActions: bindActionCreators(AllPayrollActions, dispatch),
    transactionCreateActions: bindActionCreators(
      transactionCreateActions,
      dispatch
    ),
    currencyConvertActions: bindActionCreators(
      CurrencyConvertActions,
      dispatch
    ),
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailBankAccountActions: bindActionCreators(
      detailBankAccountActions,
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
class CreateBankTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = defaultState(this.props.location.state?.currency, this.props.location.state?.isRegisteredVat);

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
    this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
    this.formRef = React.createRef();
  }

  componentDidMount = () => {
    this.props.transactionActions.getUnPaidPayrollsList();
    this.initializeData();
    this.props.transactionActions
      .getCOACList()
      .then((response) => {
        this.setState({ COACList: response.data });
      });
    this.getCorporateTaxList();

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
  };

  initializeData = () => {
    this.getCompanyCurrency();
    this.props.commonActions
      .getCurrencyConversionList()
      .then((response) => {
        this.setState({
          initValue: {
            ...this.state.initValue,
            ...{
              currency: response.data
                ? parseInt(response.data[0].currencyCode)
                : "",
            },
          },
        });
        this.formRef.current.setFieldValue(
          "currency",
          response.data[0].currencyCode,
          true
        );
      });

    const paginationData = {
      pageNo: '',
      pageSize: '',
      paginationDisable: true,
    };
    const sortingData = {
      order: '',
      sortingCol: '',
    };
    const postData = { ...paginationData, ...sortingData };

    this.props.transactionCreateActions.getAllPayrollList(postData)
      .then((res) => {
        this.setState(
          {
            payrolldata: res.data
          },
          () => { }
        );
      })

    if (this.props.location.state && this.props.location.state.bankAccountId) {
      this.setState({ id: this.props.location.state.bankAccountId, });
      this.props.detailBankAccountActions
        .getBankAccountByID(this.props.location.state.bankAccountId)
        .then((res) => {
          this.setState(
            {
              date: res.openingDate
                ? moment(res.openingDate).format("MM/DD/YYYY")
                : "",
              reconciledDate: res.lastReconcileDate
                ? moment(res.lastReconcileDate).format("MM/DD/YYYY")
                : "",
              bankCurrency: res.bankAccountCurrency ? res : "",
            },
            () => { }
          );
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert(
            "error",
            err && err.data ? err.data.message : "Something Went Wrong"
          );
        });
    }
  };

  handleFileChange = (e, props) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => { };
      reader.readAsDataURL(file);
      props.setFieldValue("attachment", file, true);
    }
  };

  getVatReportListForBank = (id) => {
    this.props.transactionCreateActions
      .getVatReportListForBank(id)
      .then((res) => {
        this.setState({ VATlist: res.data });
      });
  };
  getCorporateTaxList = () => {
    this.props.transactionActions
      .getCorporateTaxList()
      .then((res) => {
        if (res.status === 200) {
          let list = [];
          res.data = res.data && res.data.data.length > 0 ? res.data.data.filter(obj => obj.status === 'Filed') : [];
          res.data && res.data.length > 0 && res.data.map((obj, index) => {
            var label = moment(obj.startDate).format('DD-MM-YYYY') + ' To ' + moment(obj.endDate).format('DD-MM-YYYY')
            var value = index;
            list.push({ 'label': label, 'value': value })
          })
          this.setState({ corporateTaxList: res.data, ct_taxPeriodList: list });
        }
      });
  };
  setCTValues = (value) => {
    const { corporateTaxList } = this.state
    const report = corporateTaxList ? corporateTaxList.find((obj, index) => index === value) : '';
    this.formRef.current.setFieldValue("transactionAmount", report.balanceDue, true);
    this.formRef.current.setFieldValue("balanceDue", report.balanceDue, true);
    this.formRef.current.setFieldValue("totalAmount", report.taxAmount, true);
    this.formRef.current.setFieldValue("transactionDate", new Date(report.taxFiledOn), true);
  }

  handleSubmit = (data, resetForm) => {
    this.setState({ disabled: true, loading: true, disableLeavePage: true });
    let bankAccountId =
      this.props.location.state && this.props.location.state.bankAccountId
        ? this.props.location.state.bankAccountId
        : "";
    let {
      transactionDate,
      description,
      transactionAmount,
      coaCategoryId,
      transactionCategoryId,
      invoiceIdList,
      payrollListIds,
      reference,
      exchangeRate,
      customerId,
      vatId,
      vendorId,
      employeeId,
      expenseCategory,
      currencyCode,
      isReverseChargeEnabled,
      exclusiveVat,
      VATReportId,
      currencyName,
      exchangeRateFromList,
    } = data;
    let formData = new FormData();
    if (coaCategoryId && (coaCategoryId.value === 10 || coaCategoryId.label === "Expense")) {
      const list = calculateVAT(transactionAmount, vatId.value, exclusiveVat);
      transactionAmount = list.transactionAmount
      this.setState({
        transactionVatAmount: list.transactionVatAmount,
        transactionExpenseAmount: list.transactionExpenseAmount,
      })
    }
    if (
      coaCategoryId.label === "Sales" ||
      coaCategoryId.label === "Supplier Invoice"
    ) {
      var result = invoiceIdList.map((o, index) => ({
        id: o.value,
        remainingInvoiceAmount: 0,
        type: o.type,
        exchangeRate: exchangeRate,
      }));

      formData.append(
        "explainParamListStr",
        invoiceIdList ? JSON.stringify(result) : ""
      );
      formData.append(
        "explainedInvoiceListString",
        invoiceIdList
          ? JSON.stringify(
            invoiceIdList.map((i) => {
              return {
                invoiceId: i.value,
                invoiceAmount: i.dueAmount,
                convertedInvoiceAmount: i.convertedInvoiceAmount,
                explainedAmount: i.explainedAmount,
                exchangeRate: i.exchangeRate,
                partiallyPaid: i.pp,
                nonConvertedInvoiceAmount: i.explainedAmount / i.exchangeRate,
                convertedToBaseCurrencyAmount:
                  i.convertedToBaseCurrencyAmount,
              };
            })
          )
          : []
      );
      formData.append(
        "exchangeGainOrLossId",
        this.setexcessorshortamount().data
          ? 103
          : this.setexcessorshortamount().data > 0
            ? 79
            : 0
      );
      formData.append("exchangeGainOrLoss", this.setexcessorshortamount().data);
    }
    if (
      payrollListIds &&
      expenseCategory.value &&
      expenseCategory.label === "Salaries and Employee Wages"
    ) {
      var result1 = payrollListIds.map((o) => ({
        payrollId: o.value,
      }));
    }

    formData.append("expenseType", this.state.expenseType);
    formData.append("bankId ", bankAccountId ? bankAccountId : "");
    formData.append("date", transactionDate ? transactionDate : "");
    formData.append("description", description ? description : "");
    formData.append("amount", transactionAmount ? transactionAmount : "");
    formData.append(
      "coaCategoryId",
      coaCategoryId
        ? coaCategoryId.value && coaCategoryId.value == 100
          ? 10
          : coaCategoryId.value
        : ""
    );

    formData.append("exchangeRate", exchangeRate);

    if (transactionCategoryId) {
      formData.append(
        "transactionCategoryId",
        transactionCategoryId ? transactionCategoryId.value : ""
      );
    }
    if (expenseCategory && coaCategoryId.label === "Expense") {
      formData.append(
        "expenseCategory",
        expenseCategory ? expenseCategory.value : ""
      );
    }
    if (
      (vatId && coaCategoryId.value === 10) ||
      (vatId && coaCategoryId.label === "Expense")
    ) {
      formData.append("vatId", vatId ? vatId.value : "");
      formData.append(
        "transactionVatAmount",
        this.state.transactionVatAmount ? this.state.transactionVatAmount : ""
      );
      formData.append(
        "transactionExpenseAmount",
        this.state.transactionExpenseAmount
          ? this.state.transactionExpenseAmount
          : ""
      );
      formData.append("currencyName", currencyName ? currencyName : "");
      formData.append("bankGenerated", true);
      formData.append("isReverseChargeEnabled", isReverseChargeEnabled);
      formData.append("exclusiveVat", exclusiveVat);
      formData.append(
        "convertedAmount",
        this.expenceconvert(transactionAmount)
      );
    }
    if (
      (currencyCode && coaCategoryId.label === "Expense") ||
      coaCategoryId.label === "Sales" ||
      coaCategoryId.label === "Supplier Invoice"
    ) {
      formData.append(
        "currencyCode",
        currencyCode.value ? currencyCode.value : currencyCode
      );
    }
    if (
      (customerId &&
        coaCategoryId.value &&
        coaCategoryId.label === "Expenses") ||
      (customerId && coaCategoryId.value && coaCategoryId.label === "Sales")
    ) {
      formData.append("customerId", customerId ? customerId.value : "");
    }
    if (vendorId && coaCategoryId.value && coaCategoryId.label === "Expenses") {
      formData.append("vendorId", vendorId ? vendorId.value : "");
    }

    if (vendorId && coaCategoryId.label === "Supplier Invoice") {
      formData.append("vendorId", vendorId.value ? vendorId.value : vendorId);
    }
    if (vendorId && coaCategoryId.value && coaCategoryId.label === "Expenses") {
      formData.append("vatId", vatId ? vatId.value : "");
    }
    if (employeeId) {
      formData.append("employeeId", employeeId ? employeeId.value : "");
    }

    formData.append("reference", reference ? reference : "");
    if (this.uploadFile?.files?.[0]) {
      formData.append("attachmentFile", this.uploadFile?.files?.[0]);
    }
    if (
      payrollListIds &&
      expenseCategory.value &&
      expenseCategory.label === "Salaries and Employee Wages"
    ) {
      formData.append(
        "payrollListIds",
        payrollListIds ? JSON.stringify(result1) : ""
      );
    }
    if (
      coaCategoryId.label === "VAT Payment" ||
      coaCategoryId.label === "VAT Claim"
    ) {
      const info = {
        ...this.state.VATlist.find((i) => i.id === VATReportId.value),
      };
      delete info.taxFiledOn;

      formData.append(
        "explainedVatPaymentListString",
        info ? JSON.stringify([info]) : ""
      );
    }
    if (coaCategoryId.label === "Corporate Tax Payment") {
      const report = {
        ...this.state.corporateTaxList.find((obj, index) => index === this.state.ct_taxPeriod.value),
      };
      formData.append(
        "explainedCorporateTaxListString",
        report ? JSON.stringify([report]) : ""
      );
    }
    this.props.transactionCreateActions
      .createTransaction(formData)
      .then((res) => {
        if (res.status === 200) {
          resetForm();
          this.props.commonActions.tostifyAlert(
            "success",
            "New Transaction Created Successfully."
          );
          if (this.state.createMore) {
            this.setState({
              createMore: false,
              disabled: false,
            });
          } else {
            this.props.history.push("/admin/banking/bank-account/transaction", {
              bankAccountId,
              currency: this.props.location.state?.currency,
            });
          }
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
        this.setState({
          disabled: false,
          loading: false,
          disableLeavePage: false,
        });
      });
  };

  setValue = (value) => {
    this.setState({
      transactionCategoryList: [],
    });
  };

  totalAmount(option) {
    let totalInvoiceAmount = 0;
    if (option && option != "") {
      option.map((row) => {
        let listData = row.amount;
        totalInvoiceAmount += listData;
      });

      const amount = option.reduce(
        (totalAmount, invoice) => totalAmount + invoice.amount,
        0
      );

      this.setState(
        { totalAmount: amount, totalInvoiceAmount: totalInvoiceAmount },
        () => { }
      );
    } else {
      this.setState(
        { totalAmount: 0, totalInvoiceAmount: totalInvoiceAmount },
        () => { }
      );
    }
  }

  getExpensesCategoriesList = () => {
    this.props.transactionActions.getExpensesCategoriesList();
    this.props.transactionActions.getCurrencyList().then((response) => {
      this.setState({
        initValue: {
          ...this.state.initValue,
          ...{
            currencyCode: response.data
              ? parseInt(response.data[0].currencyCode)
              : "",
          },
        },
      });
      this.formRef.current.setFieldValue(
        "currency",
        response.data[0].currencyCode,
        true
      );
    });
    this.props.transactionActions.getUserForDropdown();
    this.props.transactionActions.getVatList();
  };

  getVendorList = () => {
    this.props.transactionActions.getVendorList(
      this.props.location.state.bankAccountId
        ? this.props.location.state.bankAccountId
        : ""
    );
  };
  getSuggestionInvoicesFotCust = (option, amount) => {
    const data = {
      amount: amount,
      id: option,
      currency:
        this.state?.bankCurrency?.bankAccountCurrency
          ? this.state?.bankCurrency?.bankAccountCurrency
          : 0,
      bankId: this.props.location.state.bankAccountId,
    };
    this.props.transactionActions.getCustomerInvoiceList(data);
  };

  getSuggestionInvoicesFotVend = (option, amount, invoice_list) => {
    const data = {
      amount: amount,
      id: option,
      currency:
        this.state.bankCurrency?.bankAccountCurrency
          ? this.state.bankCurrency?.bankAccountCurrency
          : 0,
      bankId: this.props.location.state.bankAccountId,
    };
    this.props.transactionActions.getVendorInvoiceList(data);
    if (invoice_list === null) {
      this.formRef.current.setFieldValue("curreancyname", "", true);
      this.formRef.current.setFieldValue("exchangeRate", "", true);
      this.formRef.current.setFieldValue("currencyCode", "", true);
    }
  };

  invoiceIdList = (option) => {
    this.setState({
      initValue: {
        ...this.state.initValue,
        ...{
          invoiceIdList: option,
        },
      },
    });
    this.formRef.current.setFieldValue("invoiceIdList", option, true);
  };
  getInvoiceCurrency = (opt, props) => {
    const { customer_invoice_list } = this.props;

    const customerinvoice = customer_invoice_list.data.filter(
      (item) => item.value === opt.value
    );
    this.setState(
      {
        invoiceCurrency: customerinvoice?.[0].currencyCode,
        invCurrency: customerinvoice?.[0],
      },
      () => {
        this.formRef.current.setFieldValue(
          "currencyCode",
          customerinvoice?.[0].currencyCode,
          true
        );

        this.setCurrency(customerinvoice?.[0].currencyCode);
        // this.setExchange(this.state.bankCurrency.bankAccountCurrency);
      }
    );

  };

  getVendorInvoiceCurrency = (opt, props) => {
    const { vendor_invoice_list } = this.props;

    this.setState(
      {
        invoiceCurrency: opt?.[0].currencyCode,
        invCurrency: opt?.[0],
      },
      () => {
        // this.getInvoices(
        // 	props.values.customerId,
        // 	props.values.transactionAmount,
        // )
        this.formRef.current.setFieldValue(
          "currencyCode",
          opt?.[0].currencyCode,
          true
        );

        this.setCurrency(opt?.[0].currencyCode);
        //this.setExchange(this.state.bankCurrency.bankAccountCurrency);
      }
    );

  };
  payrollList = (option) => {
    this.setState({
      initValue: {
        ...this.state.initValue,
        ...{
          payrollListIds: option,
        },
      },
    });
    this.formRef.current.setFieldValue("payrollListIds", option, true);
  };

  getPayrollAmount = (option) => {
    const amounts = option && option.map((i) => {
      const startIndex = i.label.indexOf("(");
      const endIndex = i.label.indexOf(")");
      const amountString = i.label.slice(startIndex + 1, endIndex);
      const amount = parseFloat(amountString);
      return amount;
    });
    const totalAmount = amounts && amounts.reduce((sum, amount) => sum + amount, 0);
    this.formRef.current.setFieldValue("transactionAmount", totalAmount)
  }

  getPayrollList = (UnPaidPayrolls_List, props) => {
    return (
      <Col lg={3}>
        <FormGroup className="mb-3">
          <Label htmlFor="payrollListIds"><span className="text-danger">* </span>{strings.Payroll}</Label>
          <Select
            style={customStyles}
            isMulti
            options={
              UnPaidPayrolls_List && UnPaidPayrolls_List
                ? UnPaidPayrolls_List
                : []
            }
            placeholder={strings.Select + strings.Payroll}
            id="payrollListIds"
            onChange={(option) => {

              this.state.selectedPayrollListBank = []
              props.handleChange("payrollListIds")(option);
              this.payrollList(option);
              this.getPayrollAmount(option);
              (!option && this.formRef.current.setFieldValue("transactionAmount", ""))
              // let selectedPayroll1 = []
              if (option) {
                option.map((i) => {

                  const selectedPayroll = this.state.payrolldata.find((el) => el.id === i.value)
                  this.state.selectedPayrollListBank.push(selectedPayroll)
                  const uniqueArray = [];
                  const seenIds = new Set();
                  for (const obj of this.state.selectedPayrollListBank) {
                    if (!seenIds.has(obj.id)) {
                      uniqueArray.push(obj);
                      seenIds.add(obj.id);
                    }
                  }
                })
              }
            }}
            className={
              props.errors.vatId &&
                props.touched.vatId
                ? "is-invalid"
                : ""
            }
          />
          {props.errors.vatId &&
            props.touched.vatId && (
              <div className="invalid-feedback">
                {props.errors.vatId}
              </div>
            )}
        </FormGroup>
      </Col>
    );
  };

  getCompanyCurrency = (basecurrency) => {
    this.props.currencyConvertActions
      .getCompanyCurrency()
      .then((res) => {
        if (res.status === 200) {
          this.setState({ basecurrency: res.data });
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data ? err.data.message : "Something Went Wrong"
        );
        this.setState({ loading: false });
      });
  };

  setExchange = (value) => {
    let exchange;
    let result = this.props.currency_convert_list.filter((obj) => {
      return obj.currencyCode === value;
    });
    if (
      this.state.invoiceCurrency === this.state.bankCurrency.bankAccountCurrency
    ) {
      exchange = 1;
    } else if (
      this.state.invoiceCurrency !== this.state.bankCurrency.bankAccountCurrency
    ) {
      if (this.state.invoiceCurrency !== this.state.basecurrency.currencyCode) {
        exchange = result[0].exchangeRate;
      } else {
        exchange = 1 / result[0].exchangeRate;
      }
    }
    this.formRef.current.setFieldValue("exchangeRate", exchange, true);
  };
  getExchangeRate = () => {
    let result = this.props.currency_convert_list.filter((obj) => {
      return obj.currencyCode === this.state?.bankCurrency?.bankAccountCurrency;
    });
    if (result[0]) {
      this.formRef.current.setFieldValue(
        "exchangeRate",
        result[0].exchangeRate,
        true
      );
      this.formRef.current.setFieldValue(
        "currencyName",
        result[0].currencyName,
        true
      );
    }
  };
  getVatListByIds = (vatIds) => {
    const { vat_list } = this.props;
    const finalarr = vat_list.filter((i) => vatIds.includes(i.id));
    return finalarr;
  };

  getVatListByIds = (vatIds) => {
    const { vat_list } = this.props;
    const finalarr = vat_list.filter((i) => vatIds.includes(i.id));

    return finalarr;
  };

  setCurrency = (value) => {
    let result = this.props.currency_convert_list.find((obj) => {
      return obj.currencyCode === value;
    });
    this.formRef.current.setFieldValue(
      "curreancyname",
      result.currencyIsoCode,
      true
    );
  };

  setcustomexchnage = (customerinvoice, exrate) => {
    let exchange;
    let convertor =
      this.state.bankCurrency.bankAccountCurrency ===
        this.state.basecurrency.currencyCode
        ? customerinvoice
        : this.state.bankCurrency.bankAccountCurrency;
    let result = this.props.currency_convert_list.filter((obj) => {
      return obj.currencyCode === convertor;
    });
    const ex = exrate || result[0].exchangeRate;
    this.formRef.current.setFieldValue("exchangeRate", ex, true);
    if (customerinvoice === this.state.bankCurrency.bankAccountCurrency) {
      exchange = 1;
    } else {
      if (this.state.basecurrency.currencyCode === customerinvoice)
        exchange = 1 / ex;
      else exchange = ex;
    }
    this.formRef.current.setFieldValue("exchangeRateFromList", ex, true);

    return exchange;
  };

  expenceconvert = (amount) => {
    let result = this.props.currency_convert_list.filter((obj) => {
      return obj.currencyCode === this.state.bankCurrency.bankAccountCurrency;
    });
    const exchange = result[0].exchangeRate;

    return (amount = amount * exchange);
  };

  basecurrencyconvertor = (customerinvoice) => {
    let exchange;
    if (customerinvoice !== this.state.basecurrency.currencyCode) {
      let result = this.props.currency_convert_list.filter((obj) => {
        return obj.currencyCode === customerinvoice;
      });
      exchange = result[0].exchangeRate;
    } else {
      exchange = 1;
    }

    return exchange;
  };

  setexchnagedamount = (option, amount, exrate) => {
    if (option?.length > 0) {
      const transactionAmount =
        amount || this.formRef.current.state.values.transactionAmount;
      const invoicelist = [...option];
      let remainingcredit = transactionAmount;
      const finaldata = invoicelist?.map((i, ind) => {
        let localexe = 0;

        localexe = this.setcustomexchnage(i.currencyCode, exrate);
        let finalcredit = 0;
        let localremainamount = remainingcredit;
        if (remainingcredit > 0) {
          localremainamount = remainingcredit - i.dueAmount * localexe;

          if (localremainamount >= 0) {
            finalcredit = i.dueAmount * localexe;
          }
          if (localremainamount < 0) {
            finalcredit = i.dueAmount * localexe + localremainamount;
          }
          remainingcredit = localremainamount;
        }
        const basecurrency = this.basecurrencyconvertor(i.currencyCode);
        return {
          ...i,

          invoiceId: i.value,
          invoiceAmount: i.dueAmount,
          convertedInvoiceAmount: i.dueAmount * localexe,
          explainedAmount: i.dueAmount * localexe,
          exchangeRate: localexe,
          pp: false,
          convertedToBaseCurrencyAmount: i.dueAmount * basecurrency,
        };
      });

      this.formRef.current.setFieldValue("invoiceIdList", finaldata);
      return finaldata;
    } else {
      this.formRef.current.setFieldValue("invoiceIdList", []);
      return [];
    }
  };

  onppclick = (value, indexofinvoce) => {
    const local2 = [...this.formRef.current.state.values.invoiceIdList];
    local2[indexofinvoce].pp = value;
    let finaldata = [...local2];
    //how many are clicked
    const howManyAreClicked = finaldata.reduce(
      (a, c, i) => a + (c.pp ? 1 : 0),
      0
    );
    const transactionAmount =
      this.formRef.current.state.values.transactionAmount;
    const total = finaldata.reduce(
      (accu, curr, index) => accu + curr.convertedInvoiceAmount,
      0
    );
    const shortAmount = transactionAmount - total;
    let remainingcredit = transactionAmount;
    let updatedfinaldata = [];
    let temp = finaldata.reduce(
      (a, c, i) =>
        c.convertedInvoiceAmount >= transactionAmount ? a + 1 : a + 0,
      0
    );
    let amountislessthanallinvoice = temp === finaldata.length;
    let tempdata;
    if (amountislessthanallinvoice) {
      if (value) {
        tempdata = finaldata.map((i) => {
          const basecurrency = this.basecurrencyconvertor(i.currencyCode);
          return {
            ...i,
            pp: value,
            explainedAmount: (transactionAmount / finaldata.length)?.toFixed(2),
            convertedToBaseCurrencyAmount: (
              (transactionAmount / finaldata.length) *
              basecurrency
            )?.toFixed(2),
          };
        });
      } else {
        const temp = finaldata.map((i) => {
          return { ...i, pp: value };
        });
        tempdata = this.setexchnagedamount(temp);
      }
      finaldata = [...tempdata];
      if (transactionAmount > 0 && transactionAmount !== "")
        this.formRef.current.setFieldValue("invoiceIdList", finaldata);
    } else {
      let currentshort = shortAmount;
      finaldata.map((i, inx) => {
        const local = { ...i };

        if (i.pp) {
          let iio =
            local.convertedInvoiceAmount + currentshort / howManyAreClicked;
          if (iio < 0) {
            local.explainedAmount = 0;
          } else {
            local.explainedAmount = iio;
          }
        } else {
          local.explainedAmount = local.convertedInvoiceAmount;
        }
        updatedfinaldata.push(local);
      });
      let updatedfinaldata2 = updatedfinaldata.map((i) => {
        const basecurrency = this.basecurrencyconvertor(i.currencyCode);
        return {
          ...i,
          convertedToBaseCurrencyAmount: (
            i.explainedAmount * basecurrency
          )?.toFixed(2),
        };
      });
      this.formRef.current.setFieldValue("invoiceIdList", updatedfinaldata2);
    }
  };

  getCurrency = (opt) => {
    let supplier_currencyCode = 0;

    this.props.vendor_list.map((item) => {
      if (item.label.contactId == opt) {
        this.setState({
          supplier_currency: item.label.currency.currencyCode,
          supplier_currency_des: item.label.currency.currencyName,
        });

        supplier_currencyCode = item.label.currency.currencyCode;
      }
    });

    if (supplier_currencyCode != 0) {
      return supplier_currencyCode;
    } else {
      return this.state.unexplainValue && this.state.unexplainValue.currencyCode
        ? this.state.unexplainValue.currencyCode
        : 0;
    }
  };

  getTransactionCategoryList = (type) => {
    function getParentLabel(array, id, parentId) {
      return array.some(
        (o) =>
          o.label === id ||
          (o.options &&
            (parentId = getParentLabel(o.options, id, o.label)) !== null)
      )
        ? parentId
        : null;
    }
    this.setState({
      cat_label: getParentLabel(this.state.categoriesList, type.label),
    });
    this.setValue(null);
    try {
      this.props.transactionCreateActions
        .getTransactionCategoryListForExplain(
          type.value,
          this.props.location.state.bankAccountId
        )
        .then((res) => {
          if (res.status === 200) {
            let categoryList = res.data.categoriesList && res.data.categoriesList.map((category) => {
              let newcategory = category.label;
              let newOption = category.options;
              if (category.label === 'Other Current Liability') {
                newOption = category.options.filter(obj => obj.label !== 'Payroll Liability')
              }
              return { label: newcategory, options: newOption }
            })
            this.setState(
              {
                transactionCategoryList: { categoriesList: categoryList, dataList: res.data.dataList },
              },
              () => { }
            );
          }
        });
    } catch (err) {
      console.log(err);
    }
  };
  getMoneyPaidToUserlist = (option) => {
    try {
      this.props.transactionActions
        .getMoneyCategoryList(option.value)
        .then((res) => {
          if (res.status === 200) {
            this.setState(
              {
                moneyCategoryList: res.data,
              },
              () => { }
            );
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  getInvoices = (option, amount, invoice_list) => {
    const data = {
      amount: amount,
      id: option.value,
      currency:
        this.state?.bankCurrency?.bankAccountCurrency
          ? this.state?.bankCurrency?.bankAccountCurrency
          : 0,
      bankId: this.props.location.state.bankAccountId,
    };
    this.props.transactionActions.getCustomerInvoiceList(data);
    if (invoice_list === null) {
      this.formRef.current.setFieldValue("curreancyname", "", true);
      this.formRef.current.setFieldValue("exchangeRate", "", true);
      this.formRef.current.setFieldValue("currencyCode", "", true);
    }
  };

  setexcessorshortamount = () => {
    const totalexpainedamount =
      this.formRef.current.state.values?.invoiceIdList?.reduce(
        (accu, curr, index) => accu + curr.explainedAmount,
        0
      );

    const totalconvetedamount =
      this.formRef.current.state.values?.invoiceIdList?.reduce(
        (accu, curr, index) => accu + curr.convertedInvoiceAmount,
        0
      );

    const transactionAmount =
      this.formRef.current.state.values.transactionAmount;
    const isppselected =
      this.formRef.current.state.values?.invoiceIdList?.reduce(
        (a, c, i) => a + (c.pp ? 1 : 0),
        0
      );

    let final = 0;
    const totalshort = totalexpainedamount - totalconvetedamount;
    if (isppselected > 0) {
      final = 0;
    } else if (totalshort < 0) {
      final = totalshort;
    } else if (totalshort >= 0) {
      final = transactionAmount - totalconvetedamount;
    }
    return {
      value: ` ${this.state.bankCurrency.bankAccountCurrencyIsoCode
        } ${final.toLocaleString(navigator.language, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} `,
      data: final?.toFixed(2),
    };
  };
  expense_categories_list_generate = () => {
    const categoriesList = [...this.props.expense_categories_list];
    const grouped = [];
    categoriesList.map((i) => {
      const category = grouped.findIndex(
        (g) => g.label === i.transactionCategoryDescription
      );
      if (category > -1) {
        grouped[category].options = [
          ...grouped[category].options,
          { label: i.transactionCategoryName, value: i.transactionCategoryId },
        ];
      } else {
        grouped.push({
          label: i.transactionCategoryDescription,
          options: [
            {
              label: i.transactionCategoryName,
              value: i.transactionCategoryId,
            },
          ],
        });
      }
    });
    return grouped;
  };
  render() {
    strings.setLanguage(this.state.language);
    const {
      initValue,
      id,
      transactionCategoryList,
      categoriesList,
      moneyCategoryList,
      ct_taxPeriodList,
    } = this.state;
    const {
      customer_invoice_list,
      vendor_invoice_list,
      expense_categories_list,
      currency_list,
      vendor_list,
      vat_list,
      currency_convert_list,
      UnPaidPayrolls_List,
    } = this.props;
    let tmpSupplier_list = [];

    vendor_list.map((item) => {
      let obj = { label: item.label.contactName, value: item.value };

      tmpSupplier_list.push(obj);
    });

    return (
      <div className="create-bank-transaction-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="icon-doc" />
                        <span className="ml-2">
                          {strings.CreateBankTransaction}
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
                        validate={(values) => {
                          let errors = {};
                          const totalexpaled = values?.invoiceIdList.reduce(
                            (a, c) => a + c.explainedAmount,
                            0
                          );

                          if (
                            values.coaCategoryId === "VAT Payment" ||
                            values.coaCategoryId === "VAT Claim"
                          ) {
                            if (
                              values?.transactionAmount > values?.vatDueAmount
                            )
                              errors.transactionAmount = `Amount cannot be greater than Due amount`;

                            const info = this.state.VATlist.find(
                              (i) => i.id === values.VATReportId.value
                            );

                            if (
                              moment(values.transactionDate).diff(
                                new Date(info.taxFiledOn),
                                "seconds"
                              ) < 0
                            ) {
                              errors.transactionDate =
                                "The transaction date cannot be before the Date of Filing.";
                            }
                          }

                          const date = moment(values.transactionDate).format(
                            "MM/DD/YYYY"
                          );
                          const date1 = new Date(date);
                          const date2 = new Date(this.state.date);

                          if (
                            values.coaCategoryId &&
                            this.props.location.state?.currency === "AED" &&
                            (values.coaCategoryId.label === "VAT Payment" ||
                              values.coaCategoryId.label === "VAT Claim")
                          ) {
                            if (
                              !values.VATReportId ||
                              values.VATReportId === ""
                            ) {
                              errors.VATReportId = "Please Select Vat Report Number";
                            }
                          }

                          if (
                            values.coaCategoryId.label !== "Expense" &&
                            values.coaCategoryId.label !== "Supplier Invoice" &&
                            values.coaCategoryId.label !== "Sales" &&
                            values.coaCategoryId.label !== "VAT Payment" &&
                            values.coaCategoryId.label !== "VAT Claim" &&
                            values.coaCategoryId.label !== "Corporate Tax Payment"
                          ) {
                            if (
                              !values.transactionCategoryId ||
                              values.transactionCategoryId === ""
                            ) {
                              errors.transactionCategoryId =
                                "Category is required";
                            }
                            if (
                              (values.coaCategoryId.value === 12 ||
                                values.coaCategoryId.value === 6) &&
                              !values.employeeId
                            ) {
                              errors.employeeId = "User is Required";
                            }
                          }
                          if (
                            values.coaCategoryId.label === "Expense" &&
                            !values.expenseCategory
                          ) {
                            errors.expenseCategory =
                              "Expense Category is Required";
                          }
                          if (
                            values.vatId === "" &&
                            values.coaCategoryId.label === "Expense" &&
                            values.expenseCategory.value !== 34
                          ) {
                            errors.vatId = "Please select vat";
                          }
                          if (
                            (values.payrollListIds === "" || !values.payrollListIds || values.payrollListIds?.length === 0) &&
                            values.coaCategoryId.label === "Expense" &&
                            values.expenseCategory.value == 34
                          ) {
                            errors.vatId = "Payroll is Required";
                          }
                          if (
                            values.coaCategoryId.value === 2 ||
                            values.coaCategoryId.value === 100
                          ) {
                            if (
                              !values.vendorId.value &&
                              values.coaCategoryId.value === 100
                            ) {
                              errors.vendorId = "Please select the Vendor";
                            }
                            if (
                              !values.customerId.value &&
                              values.coaCategoryId.value === 2
                            ) {
                              errors.customerId = "Please select the Customer";
                            }
                            if (values.invoiceIdList.length === 0) {
                              errors.invoiceIdList = "Please Select Invoice";
                            } else {
                              let isExplainAmountZero = false;
                              values.invoiceIdList.map((i) => {
                                if (i.explainedAmount === 0) {
                                  isExplainAmountZero = true;
                                }
                              });

                              if (isExplainAmountZero) {
                                errors.invoiceIdList =
                                  "Expain Amount Cannot Be Zero";
                              }

                              values.invoiceIdList.map((ii) => {
                                if (
                                  this.state.bankCurrency
                                    .bankAccountCurrency !==
                                  this.state.basecurrency.currencyCode &&
                                  this.state.basecurrency.currencyCode !==
                                  ii.currencyCode &&
                                  this.state.bankCurrency
                                    .bankAccountCurrency !== ii.currencyCode
                                )
                                  errors.invoiceIdList =
                                    "Invoices created in another FCY cannot be processed by this foreign currency bank account.";
                              });

                              if (
                                values.transactionAmount > totalexpaled &&
                                this.state?.bankCurrency
                                  ?.bankAccountCurrency ===
                                values?.invoiceIdList?.[0]?.currencyCode
                              ) {
                                errors.transactionAmount = `The transaction amount cannot be greater than the invoice amount.`;
                              }
                              const isppselected = values?.invoiceIdList.reduce(
                                (a, c) => (c.pp ? a + 1 : a + 0),
                                0
                              );
                              if (
                                values.transactionAmount < totalexpaled &&
                                this.state?.bankCurrency
                                  ?.bankAccountCurrency ===
                                values?.invoiceIdList?.[0]?.currencyCode &&
                                isppselected === 0
                              ) {
                                errors.transactionAmount = `The transaction amount is less than the invoice amount. To partially pay the invoice, please select the checkbox `;
                              }
                            }

                            if (
                              date1 < date2 ||
                              date1 < new Date(this.state.reconciledDate)
                            ) {
                              errors.transactionDate =
                                "Transaction Date cannot be before Bank Account Opening Date or after Current Date.";
                            }

                            if (
                              values.coaCategoryId.label === "Expense" &&
                              !values.currencyCode
                            ) {
                              errors.currencyCode = " Currency is Required";
                            }

                            if (
                              this.state.totalInvoiceAmount === "" &&
                              this.state.totalInvoiceAmount === 0
                            ) {
                              errors.transactionAmount = `Enter Amount`;
                            }
                            values.invoiceIdList.map((i1) => {
                              const transactionDate = moment(values.transactionDate);
                              const invoiceDate = moment(i1.invoiceDate);

                              console.log(transactionDate.format("MM/DD/YYYY") + '-' + invoiceDate.format("MM/DD/YYYY"));
                              
                              if (transactionDate.diff(invoiceDate) < 0) {
                                  errors.transactionDate = 'Transaction date cannot be before Invoice date';
                              }
                            });
                          }
                          if (values.coaCategoryId?.label === "Corporate Tax Payment") {
                            if (!values.transactionAmount)
                              errors.transactionAmount = strings.AmountIsRequired;
                            if (!values.ct_taxPeriod)
                              errors.ct_taxPeriod = strings.TaxPeriodIsRequired
                            if (values.balanceDue && values.transactionAmount && parseFloat(values.balanceDue) < parseFloat(values.transactionAmount))
                              errors.transactionAmount = strings.AmountShouldBeLessThanOrEqualToTheBalanceDue;
                          }
                          if (values.coaCategoryId && values.coaCategoryId?.label === "Expense") {
                            if (values.expenseCategory && values.expenseCategory.value === 34 && values.payrollListIds && values.payrollListIds?.length > 0) {
                              const sumOfPayrollAmounts = values.payrollListIds.reduce((sum, item) => {
                                let num = parseFloat(item.label.match(/\d+\.\d+/)[0]);
                                return sum + num;
                              }, 0);
                              if (values.transactionAmount > sumOfPayrollAmounts) {
                                errors.transactionAmount = 'Transaction amount cannot be greater than payroll amount.';
                              }
                            }
                          }
                          if (!values.transactionDate) {
                            errors.transactionDate = "Transaction Date is Required";
                          }
                          if (values.transactionDate) {
                            this.state.selectedPayrollListBank.forEach((payrollItem) => {
                              const payrollDate = moment(payrollItem.runDate).startOf('day');
                              const transactionDate = moment(values.transactionDate).startOf('day');

                              if (transactionDate.isBefore(payrollDate)) {
                                errors.transactionDate = "Transaction Date cannot be earlier than the payroll approval date.";
                              }
                            });
                          }
                          return errors;
                        }}
                        validationSchema={Yup.object().shape({
                          transactionDate: Yup.date().required(
                            "Transaction Date is Required"
                          ),
                          reference: Yup.string().max(20),
                          transactionAmount: Yup.string()
                            .required("Amount is Required")
                            .test(
                              "transactionAmount",
                              "Transaction Amount Must Be Greater Than 0",
                              (value) => value > 0
                            ),
                          coaCategoryId: Yup.string().required(
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
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="coaCategoryId">
                                    <span className="text-danger">* </span>
                                    {strings.TransactionType}
                                  </Label>
                                  <Select
                                    options={categoriesList}
                                    value={props.values.coaCategoryId}
                                    onChange={(option) => {
                                      if (option && option.value) {
                                        this.getExchangeRate();
                                        props.handleChange("coaCategoryId")(
                                          option
                                        );
                                      } else {
                                        props.handleChange("coaCategoryId")("");
                                      }

                                      if (
                                        option.label !== "Expense" &&
                                        option.label !== "Supplier Invoice" &&
                                        option.label !== "VAT Payment" &&
                                        option.label !== "VAT Claim" &&
                                        option.label !== "Corporate Tax Payment"
                                      ) {
                                        this.getTransactionCategoryList(option);
                                      }
                                      else if (option.label === "Expense") {
                                        props.handleChange("currencyCode")(
                                          this.state.bankCurrency
                                            .bankAccountCurrency
                                        );
                                        this.getExpensesCategoriesList();
                                      }
                                      else if (option.label === "Supplier Invoice") {
                                        this.getVendorList();
                                      }
                                      else if (option.label === "VAT Payment") {
                                        this.getVatReportListForBank(1);
                                        props.handleChange("VATReportId")("");
                                        props.handleChange("vatDueAmount")("");
                                        props.handleChange("vatAmountpc")("");
                                      }
                                      else if (option.label === "VAT Claim") {
                                        this.getVatReportListForBank(2);
                                        props.handleChange("VATReportId")("");
                                        props.handleChange("vatDueAmount")("");

                                        props.handleChange("vatAmountpc")("");
                                      }
                                      else if (option.label === "Corporate Tax Payment") {
                                        this.getCorporateTaxList();
                                      }

                                      this.totalAmount("");
                                    }}
                                    placeholder={
                                      strings.Select +
                                      " " +
                                      strings.TransactionType
                                    }
                                    id="coaCategoryId"
                                    name="coaCategoryId"
                                    className={
                                      props.errors.coaCategoryId &&
                                        props.touched.coaCategoryId
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.coaCategoryId &&
                                    props.touched.coaCategoryId && (
                                      <div className="invalid-feedback">
                                        {props.errors.coaCategoryId}
                                      </div>
                                    )}
                                </FormGroup>
                              </Col>
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="date">
                                    <span className="text-danger">* </span>
                                    {strings.TransactionDate}
                                  </Label>
                                  <DatePicker
                                    autoComplete="off"
                                    id="transactionDate"
                                    name="transactionDate"
                                    placeholderText={strings.TransactionDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    value={props.values.transactionDate}
                                    selected={props.values.transactionDate}
                                    onBlur={props.handleBlur("transactionDate")}
                                    onChange={(value) => {
                                      props.handleChange("transactionDate")(value);
                                    }}
                                    className={`form-control ${props.errors.transactionDate &&
                                      props.touched.transactionDate
                                      ? "is-invalid"
                                      : ""}`}
                                  />
                                  {props.errors.transactionDate &&
                                    props.touched.transactionDate && (
                                      <div className="invalid-feedback">
                                        {props.errors.transactionDate}
                                      </div>
                                    )}
                                </FormGroup>
                              </Col>
                              <Col lg={3}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="transactionAmount">
                                    <span className="text-danger">* </span>
                                    {strings.Amount}
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    maxLength="100"
                                    disabled={
                                      props.values.coaCategoryId?.label ===
                                      "VAT Claim"
                                    }
                                    id="transactionAmount"
                                    name="transactionAmount"
                                    placeholder={props.values.coaCategoryId?.label === "Corporate Tax Payment" ? strings.Enter + strings.Amount : strings.Amount}
                                    onChange={(option) => {
                                      if (
                                        option.target.value === "" ||
                                        this.regDecimal.test(
                                          option.target.value
                                        )
                                      ) {
                                        props.handleChange("transactionAmount")(
                                          option
                                        );
                                        this.setexchnagedamount(
                                          props.values.invoiceIdList,
                                          option.target.value,
                                          props.values.exchangeRate
                                        );
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

                              {props.values.coaCategoryId?.label ===
                                "VAT Payment" && (
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="dueAmount">
                                        <span className="text-danger">* </span>
                                        Balance Due
                                      </Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        disabled
                                        maxLength="100"
                                        id="vatDueAmount"
                                        name="vatDueAmount"
                                        placeholder="Balance Due"
                                        onChange={(option) => {
                                          if (
                                            option.target.value === "" ||
                                            this.regDecimal.test(
                                              option.target.value
                                            )
                                          ) {
                                            props.handleChange("vatDueAmount")(
                                              option
                                            );
                                          }
                                        }}
                                        value={props.values.vatDueAmount}
                                        className={
                                          props.errors.vatDueAmount &&
                                            props.touched.vatDueAmount
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.vatDueAmount &&
                                        props.touched.vatDueAmount && (
                                          <div className="invalid-feedback">
                                            {props.errors.vatDueAmount}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                )}
                              {(props.values.coaCategoryId?.label ===
                                "VAT Claim" ||
                                props.values.coaCategoryId?.label ===
                                "VAT Payment") && (
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="vatAmountpc">
                                        <span className="text-danger">* </span>
                                        {props.values.coaCategoryId?.label ===
                                          "VAT Claim"
                                          ? "Total VAT Reclaimable"
                                          : "Total VAT Payable"}
                                      </Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        disabled
                                        maxLength="100"
                                        id="vatAmountpc"
                                        name="vatAmountpc"
                                        placeholder={
                                          props.values.coaCategoryId?.label ===
                                            "VAT Claim"
                                            ? "Total VAT Reclaimable"
                                            : "Total VAT Payable"
                                        }
                                        onChange={(option) => {
                                          if (
                                            option.target.value === "" ||
                                            this.regDecimal.test(
                                              option.target.value
                                            )
                                          ) {
                                            props.handleChange("vatAmountpc")(
                                              option
                                            );
                                          }
                                        }}
                                        value={props.values.vatAmountpc}
                                        className={
                                          props.errors.vatAmountpc &&
                                            props.touched.vatAmountpc
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.vatAmountpc &&
                                        props.touched.vatAmountpc && (
                                          <div className="invalid-feedback">
                                            {props.errors.vatAmountpc}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                )}
                            </Row>
                            <hr />
                            {props.values.coaCategoryId?.label === "Corporate Tax Payment" && (
                              <Row className="mb-3">
                                <Col lg={3} className=" pull-right ">
                                  <Label>
                                    <span className="text-danger">* </span>{' '}
                                    {strings.TaxPeriod}
                                  </Label>
                                  <Select
                                    options={ct_taxPeriodList}
                                    id="ct_taxPeriod"
                                    name="ct_taxPeriod"
                                    value={this.state.ct_taxPeriod}
                                    placeholder={strings.Select + strings.TaxPeriod}
                                    onChange={(option) => {
                                      this.setState({ ct_taxPeriod: option });
                                      props.handleChange('ct_taxPeriod')(option);
                                      this.setCTValues(option.value)
                                    }}
                                    className={
                                      props.errors.ct_taxPeriod &&
                                        props.touched.ct_taxPeriod
                                        ? 'is-invalid'
                                        : ''
                                    }
                                  />
                                  {props.errors.ct_taxPeriod &&
                                    props.touched.ct_taxPeriod && (
                                      <div className="invalid-feedback">
                                        {props.errors.ct_taxPeriod}
                                      </div>
                                    )}
                                </Col>
                                <Col lg={3}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="totalAmount">
                                      <span className="text-danger">* </span> {strings.TotalCorporateTaxAmount}
                                    </Label>
                                    <Input
                                      type="number"
                                      disabled
                                      id="totalAmount"
                                      name="totalAmount"
                                      placeholder={strings.Enter + strings.TotalCorporateTaxAmount}
                                      value={props.values.totalAmount}
                                      onChange={(option) => {
                                        if (
                                          option.target.value === '' ||
                                          this.regDecimal.test(option.target.value),
                                          props.handleChange('totalAmount')(option)
                                        ) {
                                          props.handleChange('totalAmount')(option);
                                        }
                                      }}
                                      className={
                                        props.errors.totalAmount &&
                                          props.touched.totalAmount
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                    {props.errors.totalAmount &&
                                      props.touched.totalAmount && (
                                        <div className="invalid-feedback">
                                          {props.errors.totalAmount}
                                        </div>
                                      )}
                                  </FormGroup>
                                </Col>
                                <Col lg={3}>
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="project">
                                      <span className="text-danger">* </span>{' '}
                                      Balance Due
                                    </Label>
                                    <Input
                                      disabled
                                      type="number"
                                      placeholder='Enter Balance Amount'
                                      id="balanceDue"
                                      name="balanceDue"
                                      value={props.values.balanceDue}
                                      onChange={(option) => {
                                        if (
                                          option.target.value === '' ||
                                          this.regDecimal.test(option.target.value),
                                          props.handleChange('balanceDue')(option)
                                        ) {
                                          props.handleChange('balanceDue')(option);
                                        }
                                      }}
                                      className={
                                        props.errors.balanceDue &&
                                          props.touched.balanceDue
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                    {props.errors.balanceDue &&
                                      props.touched.balanceDue && (
                                        <div className="invalid-feedback">
                                          {props.errors.balanceDue}
                                        </div>
                                      )}
                                  </FormGroup>
                                </Col>
                              </Row>
                            )}
                            {props.values.coaCategoryId &&
                              props.values.coaCategoryId?.label === "Expense" && (
                                <Row>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="expenseCategory">
                                        <span className="text-danger">* </span>
                                        {strings.ExpenseCategory}
                                      </Label>
                                      <Select
                                        style={customStyles}
                                        placeholder={strings.Select + strings.ExpenseCategory}
                                        options={
                                          expense_categories_list
                                            ? this.expense_categories_list_generate()
                                            : []
                                        }
                                        onChange={(option) => {
                                          props.handleChange("expenseCategory")(option,);
                                        }}
                                        id="expenseCategory"
                                        name="expenseCategory"
                                        className={
                                          props.errors.expenseCategory &&
                                            props.touched.expenseCategory
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.expenseCategory &&
                                        props.touched.expenseCategory && (
                                          <div className="invalid-feedback">
                                            {props.errors.expenseCategory}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                  {props.values.expenseCategory &&
                                    props.values.expenseCategory.value &&
                                    props.values.expenseCategory.value == 34 &&
                                    this.getPayrollList(
                                      UnPaidPayrolls_List,
                                      props
                                    )}
                                  {props.values.coaCategoryId &&
                                    props.values.coaCategoryId?.label ===
                                    "Expense" &&
                                    props.values.expenseCategory &&
                                    props.values.expenseCategory.value !==
                                    34 && this.state.isRegisteredVat && (
                                      <Col lg={3}>
                                        <FormGroup className="mb-3">
                                          <span className="text-danger">
                                            *{" "}
                                          </span>
                                          <Label htmlFor="vatId">VAT</Label>
                                          <Select
                                            style={customStyles}
                                            value={props.values.vatId}
                                            options={
                                              vat_list
                                                ? selectOptionsFactory.renderOptions(
                                                  "name",
                                                  "id",
                                                  this.getVatListByIds(
                                                    this.state
                                                      .isReverseChargeEnabled
                                                      ? [1, 2]
                                                      : [1, 2, 3, 4]
                                                  ),
                                                  "Tax"
                                                )
                                                : []
                                            }
                                            onChange={(option) => {
                                              if (option && option.value) {
                                                props.handleChange("vatId")(
                                                  option
                                                );
                                              } else {
                                                props.handleChange("vatId")("");
                                              }
                                            }}
                                            placeholder={strings.Select + " VAT"}
                                            id="vatId"
                                            name="vatId"
                                            className={
                                              props.errors.vatId &&
                                                props.touched.vatId
                                                ? "is-invalid"
                                                : ""
                                            }
                                          />
                                          {props.errors.vatId &&
                                            props.touched.vatId && (
                                              <div className="invalid-feedback">
                                                {props.errors.vatId}
                                              </div>
                                            )}
                                        </FormGroup>
                                      </Col>
                                    )}
                                  {props.values.coaCategoryId &&
                                    props.values.coaCategoryId?.label ===
                                    "Expense" &&
                                    props.values.expenseCategory &&
                                    props.values.expenseCategory.value !==
                                    34 && (
                                      <Col className="mb-6" lg={6}>
                                        <Label htmlFor="inline-radio3">
                                          <span className="text-danger">* </span>
                                          {strings.ExpenseType}
                                        </Label>
                                        <div style={{ display: "flex" }}>
                                          {this.state.expenseType === false ? (
                                            <span
                                              style={{ color: "#0069d9" }}
                                              className="mr-4"
                                            >
                                              <b>{strings.NonClaimable}</b>
                                            </span>
                                          ) : (
                                            <span className="mr-4">
                                              {strings.NonClaimable}
                                            </span>
                                          )}

                                          <Switch
                                            checked={this.state.expenseType}
                                            onChange={(expenseType) => {
                                              props.handleChange("expenseType")(
                                                expenseType
                                              );
                                              this.setState(
                                                { expenseType },
                                                () => { }
                                              );
                                            }}
                                            onColor="#2064d8"
                                            onHandleColor="#2693e6"
                                            handleDiameter={25}
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                            height={20}
                                            width={48}
                                            className="react-switch"
                                          />

                                          {this.state.expenseType === true ? (
                                            <span
                                              style={{ color: "#0069d9" }}
                                              className="ml-4"
                                            >
                                              <b>{strings.Claimable}</b>
                                            </span>
                                          ) : (
                                            <span className="ml-4">
                                              {strings.Claimable}
                                            </span>
                                          )}
                                        </div>
                                      </Col>
                                    )}
                                </Row>
                              )}
                            {props.values.coaCategoryId &&
                              props.values.coaCategoryId?.label === "Expense" &&
                              props.values?.vatId?.value === 1 && (
                                <Row>
                                  <Col lg={3}></Col>
                                  {props.values.expenseCategory &&
                                    props.values.expenseCategory.value &&
                                    props.values.expenseCategory.value == 34 &&
                                    this.getPayrollList(
                                      UnPaidPayrolls_List,
                                      props
                                    )}
                                  {props.values.coaCategoryId &&
                                    props.values.coaCategoryId?.label ===
                                    "Expense" &&
                                    props.values.expenseCategory &&
                                    props.values.expenseCategory.value !==
                                    34 && (
                                      <Col lg={3}>
                                        <div style={{ display: "flex" }}>
                                          {!this.state.exclusiveVat ? (
                                            <span
                                              style={{ color: "#0069d9" }}
                                              className="mr-4"
                                            >
                                              <b>{strings.InclusiveVAT}</b>
                                            </span>
                                          ) : (
                                            <span className="mr-4">
                                              {strings.InclusiveVAT}
                                            </span>
                                          )}

                                          <Switch
                                            checked={this.state.exclusiveVat}
                                            onChange={(exclusiveVat) => {
                                              props.handleChange(
                                                "exclusiveVat"
                                              )(exclusiveVat);
                                              this.setState(
                                                { exclusiveVat },
                                                () => { }
                                              );
                                            }}
                                            onColor="#2064d8"
                                            onHandleColor="#2693e6"
                                            handleDiameter={25}
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                            height={20}
                                            width={48}
                                            className="react-switch"
                                          />

                                          {this.state.exclusiveVat ? (
                                            <span
                                              style={{ color: "#0069d9" }}
                                              className="ml-4"
                                            >
                                              <b>{strings.ExclusiveVAT}</b>
                                            </span>
                                          ) : (
                                            <span className="ml-4">
                                              {strings.ExclusiveVAT}
                                            </span>
                                          )}
                                        </div>
                                      </Col>
                                    )}
                                  <Col className="mb-6" lg={6}></Col>
                                </Row>
                              )}
                            <Row>
                              {props.values.coaCategoryId &&
                                props.values.coaCategoryId?.label ===
                                "Expense" &&
                                props.values.expenseCategory &&
                                props.values.expenseCategory.value !==
                                34 && (
                                  <Col>
                                    <Checkbox
                                      id="isReverseChargeEnabled"
                                      checked={this.state.isReverseChargeEnabled}
                                      onChange={(option) => {
                                        this.setState({
                                          isReverseChargeEnabled:
                                            !this.state.isReverseChargeEnabled,
                                          exclusiveVat: false,
                                        });

                                        props.handleChange("vatId")("");
                                        props.handleChange(
                                          "isReverseChargeEnabled"
                                        )(!props.values.isReverseChargeEnabled);
                                      }}
                                    />
                                    <Label>{strings.IsReverseCharge}</Label>
                                  </Col>
                                )}
                            </Row>
                            {props.values.coaCategoryId &&
                              props.values.coaCategoryId?.label ===
                              "Supplier Invoice" && (
                                <Row>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="vendorId">
                                        <span className="text-danger">* </span>
                                        Vendor
                                      </Label>
                                      <Select
                                        options={
                                          tmpSupplier_list
                                            ? selectOptionsFactory.renderOptions(
                                              "label",
                                              "value",
                                              tmpSupplier_list,
                                              "Supplier Name"
                                            )
                                            : []
                                        }
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            props.handleChange("vendorId")(
                                              option
                                            );
                                            props.handleChange("invoiceIdList")(
                                              []
                                            );
                                          } else {
                                            props.handleChange("vendorId")("");
                                          }

                                          this.getSuggestionInvoicesFotVend(
                                            option.value,
                                            props.values.transactionAmount
                                          );
                                        }}
                                        placeholder={strings.Select + " Vendor"}
                                        id="vendorId"
                                        name="vendorId"
                                        className={
                                          props.errors.vendorId &&
                                            props.touched.vendorId
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />

                                      {props.errors.vendorId &&
                                        props.touched.vendorId && (
                                          <div className="invalid-feedback">
                                            {props.errors.vendorId}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                  {props.values.coaCategoryId &&
                                    props.values.coaCategoryId?.label ===
                                    "Supplier Invoice" && (
                                      <Col lg={3}>
                                        <FormGroup className="mb-3">
                                          <Label htmlFor="invoiceIdList">
                                            <span className="text-danger">
                                              *{" "}
                                            </span>
                                            Invoice
                                          </Label>
                                          <Select
                                            style={customStyles}
                                            isMulti
                                            options={
                                              vendor_invoice_list
                                                ? vendor_invoice_list.data
                                                : []
                                            }
                                            onChange={(selectedOptions) => {
                                              if (!selectedOptions || selectedOptions.length === 0) {

                                                props.setFieldValue("transactionAmount", 0);
                                                props.setFieldValue("invoiceIdList", []);
                                                return;
                                              }

                                              const totalDueAmount = selectedOptions.reduce(
                                                (acc, selectedOption) => acc + (selectedOption.dueAmount || 0),
                                                0
                                              );

                                              props.setFieldValue("transactionAmount", totalDueAmount);

                                              this.setexchnagedamount(selectedOptions);
                                              this.totalAmount(selectedOptions);
                                              if (selectedOptions) {
                                                this.getVendorInvoiceCurrency(
                                                  selectedOptions,
                                                  props
                                                );
                                              }
                                            }}
                                            value={props.values.invoiceIdList}
                                            placeholder={
                                              strings.Select + " Invoice"
                                            }
                                            id="invoiceIdList"
                                            name="invoiceIdList"
                                            className={
                                              props.errors.invoiceIdList &&
                                                props.touched.invoiceIdList
                                                ? "is-invalid"
                                                : ""
                                            }
                                          />
                                          {props.errors.invoiceIdList &&
                                            props.touched.invoiceIdList && (
                                              <div className="invalid-feedback">
                                                {props.errors.invoiceIdList}
                                              </div>
                                            )}
                                          {this.state.initValue.invoiceIdList &&
                                            this.state.initValue.invoiceIdList.reduce(
                                              (totalAmount, invoice) =>
                                                totalAmount + invoice.amount,
                                              0
                                            ) > this.state.initValue.amount && (
                                              <div
                                                className={
                                                  this.state.initValue.invoiceIdList.reduce(
                                                    (totalAmount, invoice) =>
                                                      totalAmount +
                                                      invoice.amount,
                                                    0
                                                  ) >
                                                    this.state.initValue.amount
                                                    ? "is-invalid"
                                                    : ""
                                                }
                                              >
                                                <div className="invalid-feedback">
                                                  Total Invoice Amount Is More
                                                  Than The Transaction Amount
                                                </div>
                                              </div>
                                            )}
                                        </FormGroup>
                                      </Col>
                                    )}
                                </Row>
                              )}
                            {transactionCategoryList.categoriesList &&
                              props.values.coaCategoryId?.label !== "VAT Payment" &&
                              props.values.coaCategoryId?.label !== "VAT Claim" &&
                              props.values.coaCategoryId?.label !== "Expense" &&
                              props.values.coaCategoryId?.label !== "Supplier Invoice" &&
                              props.values.coaCategoryId?.label !== "Sales" && (
                                <Row>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="transactionCategoryId">
                                        <span className="text-danger">* </span>
                                        Category
                                      </Label>
                                      <Select
                                        style={customStyles}
                                        // className="select-default-width"
                                        placeholder={
                                          strings.Select + " Category"
                                        }
                                        options={
                                          transactionCategoryList
                                            ? transactionCategoryList.categoriesList
                                            : []
                                        }
                                        value={
                                          transactionCategoryList
                                            ? props.values.transactionCategoryId
                                            : ""
                                        }
                                        id="transactionCategoryId"
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
                                          if (
                                            option.label !== "Salaries and Employee Wages" &&
                                            option.label !== "Owners Drawing" &&
                                            option.label !== "Dividend" &&
                                            option.label !== "Owners Current Account" &&
                                            option.label !== "Share Premium" &&
                                            option.label !== "Employee Advance" &&
                                            option.label !== "Employee Reimbursements" &&
                                            option.label !== "Director Loan Account" &&
                                            option.label !== "Owners Equity"
                                          ) {
                                          }
                                          if (
                                            option.label ===
                                            "Salaries and Employee Wages"
                                          ) {
                                            this.getMoneyPaidToUserlist(option);
                                          }
                                          if (
                                            option.label === "Owners Drawing"
                                          ) {
                                            this.getMoneyPaidToUserlist(option);
                                          }
                                          if (option.label === "Dividend") {
                                            this.getMoneyPaidToUserlist(option);
                                          }
                                          if (
                                            option.label ===
                                            "Owners Current Account"
                                          ) {
                                            this.getMoneyPaidToUserlist(option);
                                          }
                                          if (
                                            option.label === "Share Premium"
                                          ) {
                                            this.getMoneyPaidToUserlist(option);
                                          }
                                          if (
                                            option.label === "Employee Advance"
                                          ) {
                                            this.getMoneyPaidToUserlist(option);
                                          }
                                          if (
                                            option.label ===
                                            "Employee Reimbursements"
                                          ) {
                                            this.getMoneyPaidToUserlist(option);
                                          }
                                          if (
                                            option.label ===
                                            "Director Loan Account"
                                          ) {
                                            this.getMoneyPaidToUserlist(option);
                                          }
                                          if (
                                            option.label === "Owners Equity"
                                          ) {
                                            this.getMoneyPaidToUserlist(option);
                                          }
                                        }}
                                        className={`${props.errors.transactionCategoryId &&
                                          props.touched.transactionCategoryId
                                          ? "is-invalid"
                                          : ""
                                          }`}
                                      />
                                      {props.errors.transactionCategoryId &&
                                        props.touched.transactionCategoryId && (
                                          <div className="invalid-feedback">
                                            {props.errors.transactionCategoryId}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                              )}
                            {transactionCategoryList.dataList && (
                              <Row>
                                {props.values.coaCategoryId.value === 6 && (
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="employeeId">
                                        <span className="text-danger">* </span>
                                        User
                                      </Label>
                                      <Select
                                        style={customStyles}
                                        //className="select-default-width"
                                        options={
                                          moneyCategoryList
                                            ? moneyCategoryList
                                            : []
                                        }
                                        id="employeeId"
                                        value={props.values.employeeId}
                                        onChange={(option) => {
                                          props.handleChange("employeeId")(
                                            option
                                          );
                                        }}
                                        className={`${props.errors.employeeId &&
                                          props.touched.employeeId
                                          ? "is-invalid"
                                          : ""
                                          }`}
                                      />
                                      {props.errors.employeeId &&
                                        props.touched.employeeId && (
                                          <div className="invalid-feedback">
                                            {props.errors.employeeId}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                )}
                                {props.values.coaCategoryId.value === 12 && (
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="employeeId">
                                        <span className="text-danger">* </span>
                                        User
                                      </Label>
                                      <Select
                                        style={customStyles}
                                        options={
                                          moneyCategoryList
                                            ? moneyCategoryList
                                            : []
                                        }
                                        id="employeeId"
                                        value={props.values.employeeId}
                                        onChange={(option) => {
                                          props.handleChange("employeeId")(
                                            option
                                          );
                                        }}
                                        className={`${props.errors.employeeId &&
                                          props.touched.employeeId
                                          ? "is-invalid"
                                          : ""
                                          }`}
                                      />
                                      {props.errors.employeeId &&
                                        props.touched.employeeId && (
                                          <div className="invalid-feedback">
                                            {props.errors.employeeId}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                )}

                                {props.values.coaCategoryId?.label ===
                                  "Sales" && (
                                    <Col lg={3}>
                                      <FormGroup className="mb-3">
                                        <Label htmlFor="customerId">
                                          {" "}
                                          <span className="text-danger">* </span>
                                          Customer
                                        </Label>
                                        <Select
                                          style={customStyles}
                                          placeholder={
                                            strings.Select + " Customer"
                                          }
                                          className={`select-default-width , ${props.errors.customerId &&
                                            props.touched.customerId
                                            ? "is-invalid"
                                            : ""
                                            }`}
                                          options={
                                            transactionCategoryList &&
                                              transactionCategoryList.dataList[1]
                                              ? transactionCategoryList
                                                .dataList[0].options
                                              : []
                                          }
                                          id="customerId"
                                          value={props.values.customerId}
                                          onChange={(option) => {
                                            props.handleChange("customerId")(
                                              option
                                            );

                                            props.handleChange("invoiceIdList")(
                                              []
                                            );
                                            this.getInvoices(
                                              option,
                                              props.values.transactionAmount
                                            );

                                            this.getSuggestionInvoicesFotCust(
                                              option.value,
                                              props.values.transactionAmount
                                            );

                                          }}
                                        />
                                        {props.errors.customerId &&
                                          props.touched.customerId && (
                                            <div className="invalid-feedback">
                                              {props.errors.customerId}
                                            </div>
                                          )}
                                      </FormGroup>
                                    </Col>
                                  )}
                                {props.values.coaCategoryId.value === 2 && (
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="invoiceIdList">
                                        <span className="text-danger">* </span>
                                        Invoice
                                      </Label>
                                      <Select
                                        style={customStyles}
                                        placeholder={strings.Select + " Invoice"}
                                        isMulti
                                        className={`select-default-width, ${props.errors.invoiceIdList &&
                                          props.touched.invoiceIdList
                                          ? "is-invalid"
                                          : ""}`}
                                        options={
                                          customer_invoice_list && customer_invoice_list.data
                                            ? customer_invoice_list.data
                                            : []
                                        }
                                        value={props.values.invoiceIdList}
                                        id="invoiceIdList"
                                        onChange={(selectedOptions) => {
                                          if (!selectedOptions || selectedOptions.length === 0) {

                                            props.setFieldValue("transactionAmount", 0);
                                            props.setFieldValue("invoiceIdList", []);
                                            return;
                                          }

                                          const totalDueAmount = selectedOptions.reduce(
                                            (acc, selectedOption) => acc + (selectedOption.dueAmount || 0),
                                            0
                                          );

                                          props.setFieldValue("transactionAmount", totalDueAmount);

                                          this.setexchnagedamount(selectedOptions);
                                          this.totalAmount(selectedOptions);

                                          if (selectedOptions.length > 0) {
                                            this.getInvoiceCurrency(selectedOptions[0], props);
                                          }
                                        }}
                                      />
                                      {props.errors.invoiceIdList &&
                                        props.touched.invoiceIdList && (
                                          <div className="invalid-feedback">
                                            {props.errors.invoiceIdList}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                )}
                              </Row>
                            )}

                            {props.values.coaCategoryId &&
                              (props.values.coaCategoryId?.label === "Sales" ||
                                props.values.coaCategoryId?.label ===
                                "Supplier Invoice") && (
                                <>
                                  {props.values?.invoiceIdList.length > 0 && (
                                    <Row
                                      className="border-bottom mb-3"
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <Col lg={1}>
                                        <span className="font-weight-bold">
                                          {" "}
                                          Invoice
                                        </span>
                                      </Col>
                                      <Col lg={2}>
                                        <span className="font-weight-bold">
                                          {" "}
                                          Invoice Date
                                        </span>
                                      </Col>
                                      <Col lg={2}>
                                        <span className="font-weight-bold">
                                          Invoice Amount
                                        </span>
                                      </Col>
                                      {this.state.bankCurrency
                                        .bankAccountCurrencyIsoCode !==
                                        props.values.curreancyname && (
                                          <Col lg={2}>
                                            <FormGroup className="mb-3">
                                              <div>
                                                <span className="font-weight-bold">
                                                  Currency Rate
                                                </span>
                                              </div>
                                            </FormGroup>
                                          </Col>
                                        )}
                                      {this.state.bankCurrency
                                        .bankAccountCurrencyIsoCode !==
                                        props.values.curreancyname && (
                                          <Col lg={2}>
                                            <FormGroup className="mb-3">
                                              <div>
                                                <span className="font-weight-bold">
                                                  Amount
                                                </span>
                                              </div>
                                            </FormGroup>
                                          </Col>
                                        )}
                                      <Col lg={1}>
                                        <FormGroup
                                          className="font-weight-bold "
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                          }}
                                        >
                                          <div>Partially Paid</div>
                                        </FormGroup>
                                      </Col>

                                      <Col lg={2}>
                                        <FormGroup className="font-weight-bold">
                                          <div>
                                            <span>Explained Amount</span>
                                          </div>
                                        </FormGroup>
                                      </Col>
                                    </Row>
                                  )}
                                  {props.values?.invoiceIdList?.map(
                                    (i, invindex) => {
                                      return (
                                        <Row
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <Col lg={1}>
                                            <span>{i.invoiceNumber}</span>
                                          </Col>
                                          <Col lg={2}>
                                            <Input
                                              disabled
                                              id="1"
                                              name="1"
                                              value={moment(
                                                i.invoiceDate
                                              ).format("DD-MM-YYYY")}
                                            />
                                          </Col>
                                          <Col lg={2}>
                                            <Input
                                              style={{ textAlign: "right" }}
                                              disabled
                                              id="1"
                                              name="1"
                                              value={` ${props.values.curreancyname} ${i.dueAmount}`}
                                            />
                                          </Col>

                                          {this.state.bankCurrency
                                            .bankAccountCurrencyIsoCode !==
                                            props.values.curreancyname && (
                                              <Col lg={2}>
                                                <FormGroup className="mb-3">
                                                  <div>
                                                    <Input
                                                      className="form-control"
                                                      id="exchangeamount"
                                                      name="exchangeamount"
                                                      type="number"
                                                      style={{
                                                        textAlign: "right",
                                                      }}
                                                      disabled
                                                      value={i.exchangeRate}
                                                      onChange={(value) => {
                                                        let local2 = [
                                                          ...props.values
                                                            ?.invoiceIdList,
                                                        ].map((i) => {
                                                          return {
                                                            ...i,
                                                            exchangeRate:
                                                              value.target.value,
                                                          };
                                                        });

                                                        this.setexchnagedamount(
                                                          local2
                                                        );
                                                      }}
                                                    />
                                                  </div>
                                                </FormGroup>
                                              </Col>
                                            )}

                                          {this.state.bankCurrency
                                            .bankAccountCurrencyIsoCode !==
                                            props.values.curreancyname && (
                                              <Col lg={2}>
                                                <FormGroup className="mb-3">
                                                  <div>
                                                    <Input
                                                      className="form-control"
                                                      id="exchangeRate"
                                                      style={{
                                                        textAlign: "right",
                                                      }}
                                                      name="exchangeRate"
                                                      disabled
                                                      value={`${this.state.bankCurrency
                                                        .bankAccountCurrencyIsoCode
                                                        } ${i.convertedInvoiceAmount?.toLocaleString(
                                                          navigator.language,
                                                          {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        )} `}
                                                      onChange={(value) => { }}
                                                    />
                                                  </div>
                                                </FormGroup>
                                              </Col>
                                            )}
                                          <Col lg={1}>
                                            <FormGroup
                                              className="mb-3"
                                              style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                              }}
                                            >
                                              <div>
                                                <Input
                                                  disabled={
                                                    props.values
                                                      ?.transactionAmount -
                                                    props.values?.invoiceIdList?.reduce(
                                                      (accu, curr, index) =>
                                                        accu +
                                                        curr.dueAmount *
                                                        curr.exchangeRate,
                                                      0
                                                    ) >=
                                                    0
                                                  }
                                                  type="checkbox"
                                                  checked={
                                                    i.pp !== undefined
                                                      ? i.pp
                                                      : false
                                                  }
                                                  onChange={(e) => {
                                                    this.onppclick(
                                                      e.target.checked,
                                                      invindex
                                                    );
                                                  }}
                                                />
                                              </div>
                                            </FormGroup>
                                          </Col>

                                          <Col lg={2}>
                                            <FormGroup className="mb-3">
                                              <div>
                                                <Input
                                                  className="form-control"
                                                  id="exchangeRate"
                                                  name="exchangeRate"
                                                  disabled
                                                  style={{ textAlign: "right" }}
                                                  value={`${this.state.bankCurrency
                                                    .bankAccountCurrencyIsoCode
                                                    } ${i.explainedAmount?.toLocaleString(
                                                      navigator.language,
                                                      {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                      }
                                                    )} `}
                                                  onChange={(value) => { }}
                                                />
                                                {i.explainedAmount === 0 && (
                                                  <div
                                                    style={{
                                                      color: "red",
                                                      fontSize: "9px",
                                                    }}
                                                  >
                                                    Expain Amount Cannot be Zero
                                                  </div>
                                                )}
                                              </div>
                                            </FormGroup>
                                          </Col>
                                        </Row>
                                      );
                                    }
                                  )}
                                  {props.values?.invoiceIdList?.length > 0 && (
                                    <>
                                      <Row
                                        style={{
                                          display: "flex",
                                          flexDirection: "row-reverse",
                                          justifyContent: "flex-start",
                                        }}
                                      >
                                        <Col lg={2} style={{ float: "right" }}>
                                          <Input
                                            disabled
                                            style={{ textAlign: "right" }}
                                            id="total"
                                            name="total"
                                            value={amountFormat(
                                              props.values?.invoiceIdList?.reduce(
                                                (accu, curr) =>
                                                 curr.explainedAmount,
                                                0
                                              ),
                                              this.state.bankCurrency
                                                .bankAccountCurrencyIsoCode
                                            )}
                                          />
                                        </Col>
                                        <Col lg={3}>
                                          <Input
                                            style={{ textAlign: "right" }}
                                            disabled
                                            id="total"
                                            name="total"
                                            value={"Total Explained Amount ="}
                                          />
                                        </Col>
                                      </Row>
                                      {this.setexcessorshortamount().data !==
                                        0 &&
                                        this.state.bankCurrency
                                          .bankAccountCurrencyIsoCode !==
                                        props.values.curreancyname && (
                                          <Row
                                            style={{
                                              display: "flex",
                                              justifyContent: "flex-end",

                                              marginTop: 10,
                                            }}
                                          >
                                            {
                                              <Col lg={5}>
                                                <Select
                                                  options={[
                                                    {
                                                      label: "Currency Gain ",
                                                      value: 79,
                                                    },
                                                    {
                                                      label: "Currency Loss",
                                                      value: 103,
                                                    },
                                                  ]}
                                                  isDisabled={true}
                                                  value={
                                                    this.setexcessorshortamount()
                                                      .data < 0
                                                      ? {
                                                        label:
                                                          "Currency Loss",
                                                        value: 103,
                                                      }
                                                      : {
                                                        label:
                                                          "Currency Gain ",
                                                        value: 103,
                                                      }
                                                  }
                                                />
                                              </Col>
                                            }

                                            <Col lg={3}>
                                              <Input
                                                style={{ textAlign: "right" }}
                                                disabled
                                                id="total"
                                                name="total"
                                                value={
                                                  "Total Excess/Short Amount = "
                                                }
                                              />
                                            </Col>

                                            <Col lg={2}>
                                              <Input
                                                style={{ textAlign: "right" }}
                                                disabled
                                                id="total"
                                                name="total"
                                                value={
                                                  this.setexcessorshortamount()
                                                    .value
                                                }
                                              />
                                            </Col>
                                          </Row>
                                        )}
                                    </>
                                  )}
                                </>
                              )}

                            {props.values.coaCategoryId &&
                              props.values.coaCategoryId?.label ===
                              "Supplier Invoice" &&
                              (this.state.invoiceCurrency &&
                                this.state.invoiceCurrency !==
                                this.state.bankCurrency.bankAccountCurrency ? (
                                <Row>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="currencyCode">
                                        {strings.Currency}
                                      </Label>
                                      <Select
                                        style={customStyles}
                                        id="currencyCode"
                                        name="currencyCode"
                                        options={
                                          currency_convert_list
                                            ? selectCurrencyFactory.renderOptions(
                                              "currencyName",
                                              "currencyCode",
                                              currency_convert_list,
                                              "Currency"
                                            )
                                            : []
                                        }
                                        value={
                                          currency_convert_list &&
                                          selectCurrencyFactory
                                            .renderOptions(
                                              "currencyName",
                                              "currencyCode",
                                              currency_convert_list,
                                              "Currency"
                                            )
                                            .find(
                                              (option) =>
                                                option.value ===
                                                +this.state.invoiceCurrency
                                            )
                                        }
                                        isDisabled={true}
                                        onChange={(option) => {
                                          props.handleChange("currencyCode")(
                                            option
                                          );
                                          this.setExchange(option.value);
                                          this.setCurrency(option.value);
                                        }}
                                      />
                                      {props.errors.currencyCode &&
                                        props.touched.currencyCode && (
                                          <div className="invalid-feedback">
                                            {props.errors.currencyCode}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                              ) : (
                                ""
                              ))}

                            {props.values.coaCategoryId &&
                              (props.values.coaCategoryId?.label ===
                                "VAT Payment" ||
                                props.values.coaCategoryId?.label ===
                                "VAT Claim") && (
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="currencyCode">
                                        VAT Report Number
                                      </Label>
                                      <Select
                                        style={customStyles}
                                        id="VATReport"
                                        name="VATReportId"
                                        options={this.state.VATlist.map((i) => {
                                          return {
                                            label: i.vatNumber,
                                            value: i.id,
                                          };
                                        })}
                                        value={props.values.VATReportId || ""}
                                        onChange={(option) => {
                                          props.handleChange("VATReportId")(
                                            option
                                          );
                                          const info = this.state.VATlist.find(
                                            (i) => i.id === option.value
                                          );
                                          props.handleChange("vatAmountpc")(
                                            info.totalAmount
                                          );
                                          if (
                                            props.values.coaCategoryId
                                              ?.label === "VAT Claim"
                                          )
                                            props.handleChange(
                                              "transactionAmount"
                                            )(info.totalAmount);

                                          props.handleChange("vatDueAmount")(
                                            info.dueAmount
                                          );
                                        }}
                                      />
                                      {props.errors.VATReportId &&
                                        props.touched.VATReportId && (
                                          <div className="invalid-feedback">
                                            {props.errors.VATReportId}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                              )}
                            {props.values.coaCategoryId &&
                              this.state?.bankCurrency?.bankAccountCurrency !==
                              150 && <hr />}
                            {props.values.coaCategoryId &&
                              this.state?.bankCurrency?.bankAccountCurrency !==
                              150 && (
                                <Row>
                                  <Col>
                                    <Label htmlFor="currency">
                                      {strings.CurrencyExchangeRate}
                                    </Label>
                                  </Col>
                                </Row>
                              )}
                            {props.values.coaCategoryId &&
                              props.values?.coaCategoryId?.label !== "Sales" &&
                              props.values?.coaCategoryId?.label !==
                              "Supplier Invoice" &&
                              this.state?.bankCurrency?.bankAccountCurrency !==
                              150 && (
                                <Row>
                                  <Col lg={1}>
                                    <Input disabled id="1" name="1" value={1} />
                                  </Col>
                                  <Col lg={2}>
                                    <FormGroup className="mb-3">
                                      {/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
                                      <div>
                                        <Input
                                          disabled
                                          className="form-control"
                                          id="currencyName"
                                          name="currencyName"
                                          value={props.values.currencyName}
                                          onChange={(value) => {
                                            props.handleChange("curreancyname")(
                                              value
                                            );
                                          }}
                                        />
                                      </div>
                                    </FormGroup>
                                  </Col>
                                  <FormGroup className="mt-2">
                                    <label>
                                      <b>=</b>
                                    </label>{" "}
                                  </FormGroup>
                                  <Col lg={2}>
                                    <FormGroup className="mb-3">
                                      {/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
                                      <div>
                                        <Input
                                          type="number"
                                          min="0"
                                          className="form-control"
                                          id="exchangeRate"
                                          name="exchangeRate"
                                          maxLength="20"
                                          value={props.values.exchangeRate}
                                          onChange={(option) => {
                                            props.handleChange("exchangeRate")(
                                              option
                                            );
                                            //props.values.exchangeRate =
                                          }}
                                        />
                                      </div>
                                    </FormGroup>
                                  </Col>

                                  <Col lg={2}>
                                    <Input
                                      disabled
                                      id="currencyName"
                                      name="currencyName"
                                      value={
                                        this.state?.basecurrency?.currencyName
                                      }
                                    />
                                  </Col>
                                </Row>
                              )}

                            {(props.values?.coaCategoryId?.label === "Sales" ||
                              props.values?.coaCategoryId?.label ===
                              "Supplier Invoice") &&
                              props.values.curreancyname !==
                              this.state?.bankCurrency
                                ?.bankAccountCurrencyIsoCode &&
                              props.values.curreancyname &&
                              this.state?.bankCurrency
                                ?.bankAccountCurrencyIsoCode &&
                              this.state?.bankCurrency?.bankAccountCurrency && (
                                <Row className="mt-2">
                                  <Col lg={1}>
                                    <Input disabled id="1" name="1" value={1} />
                                  </Col>
                                  <Col lg={2}>
                                    <FormGroup className="mb-3">
                                      {/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
                                      <div>
                                        <Input
                                          disabled
                                          className="form-control"
                                          id="currencyName"
                                          name="currencyName"
                                          value={
                                            props.values.curreancyname === "AED"
                                              ? this.state?.bankCurrency
                                                ?.bankAccountCurrencyIsoCode
                                              : props.values.curreancyname
                                          }
                                          onChange={(value) => {
                                            props.handleChange("curreancyname")(
                                              value
                                            );
                                          }}
                                        />
                                      </div>
                                    </FormGroup>
                                  </Col>
                                  <FormGroup className="mt-2">
                                    <label>
                                      <b>=</b>
                                    </label>{" "}
                                  </FormGroup>
                                  <Col lg={2}>
                                    <FormGroup className="mb-3">
                                      {/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
                                      <div>
                                        <Input
                                          type="number"
                                          min="0"
                                          className="form-control"
                                          id="exchangeRate"
                                          name="exchangeRate"
                                          maxLength="20"
                                          value={props.values.exchangeRate}
                                          onChange={(option) => {
                                            props.handleChange("exchangeRate")(
                                              option
                                            );
                                            this.setexchnagedamount(
                                              props.values.invoiceIdList,
                                              null,
                                              option.target.value
                                                ? option.target.value
                                                : 0
                                            );
                                          }}
                                        />
                                      </div>
                                    </FormGroup>
                                  </Col>
                                  <Col lg={2}>
                                    <Input
                                      disabled
                                      id="currencyName"
                                      name="currencyName"
                                      value={
                                        props.values.curreancyname !== "AED"
                                          ? this.state?.bankCurrency
                                            ?.bankAccountCurrencyIsoCode
                                          : props.values.curreancyname
                                      }
                                    />
                                  </Col>
                                </Row>
                              )}

                            {props.values.coaCategoryId?.label !== "Corporate Tax Payment" && (<Row>
                              <Col lg={8}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="description">
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
                                        props.handleChange("description")(
                                          option
                                        );
                                    }}
                                    value={props.values.description}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>)}
                            <Row>
                              <Col lg={8}>
                                <Row>
                                  <Col lg={6}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="reference">
                                        {strings.ReferenceNumber}
                                      </Label>
                                      <Input
                                        type="text"
                                        maxLength="20"
                                        id="reference"
                                        name="reference"
                                        placeholder={strings.ReceiptNumber}
                                        onChange={(option) => {
                                          // if (
                                          //   option.target.value === "" ||
                                          //   this.regExBoth.test(
                                          //     option.target.value
                                          //   )
                                          // ) {
                                          props.handleChange("reference")(
                                            option
                                          );
                                          // }
                                        }}
                                        value={props.values.reference}
                                      />
                                      {props.errors.reference &&
                                        props.touched.reference && (
                                          <div
                                            className="invalid-file"
                                            style={{ color: "red" }}
                                          >
                                            {props.errors.reference}
                                          </div>
                                        )}
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
                                            <Label>{strings.Attachment}</Label>{" "}
                                            <br />
                                            <Button
                                              color="primary"
                                              onClick={() => {
                                                document
                                                  .getElementById("fileInput")
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
                                                this.handleFileChange(e, props);
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
                                          </div>
                                        )}
                                      />
                                      {props.errors.attachment &&
                                        props.touched.attachment && (
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
                                    disabled={this.state.disabled}
                                    onClick={() => {
                                      //	added validation popup	msg
                                      console.log(props.errors, "EERRROR");
                                      props.handleBlur();
                                      if (
                                        props.errors &&
                                        Object.keys(props.errors).length != 0
                                      )
                                        this.props.commonActions.fillManDatoryDetails();
                                      this.setState(
                                        { createMore: false },
                                        () => {
                                          props.handleSubmit();
                                        }
                                      );
                                    }}
                                  >
                                    <i className="fa fa-dot-circle-o"></i>{" "}
                                    {this.state.disabled
                                      ? "Creating..."
                                      : strings.Create}
                                  </Button>
                                  <Button
                                    type="button"
                                    color="primary"
                                    className="btn-square mr-3"
                                    disabled={this.state.disabled}
                                    onClick={() => {
                                      //	added validation popup	msg
                                      props.handleBlur();
                                      if (
                                        props.errors &&
                                        Object.keys(props.errors).length != 0
                                      )
                                        this.props.commonActions.fillManDatoryDetails();
                                      this.setState(
                                        { createMore: true },
                                        () => {
                                          props.handleSubmit();
                                        }
                                      );
                                    }}
                                  >
                                    <i className="fa fa-refresh"></i>{" "}
                                    {this.state.disabled
                                      ? "Creating..."
                                      : strings.CreateandMore}
                                  </Button>
                                  <Button
                                    color="secondary"
                                    className="btn-square"
                                    onClick={() => {
                                      this.props.history.push(
                                        "/admin/banking/bank-account/transaction",
                                        {
                                          bankAccountId: id,
                                          currency:
                                            this.props.location.state?.currency,
                                        }
                                      );
                                    }}
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
)(CreateBankTransaction);
