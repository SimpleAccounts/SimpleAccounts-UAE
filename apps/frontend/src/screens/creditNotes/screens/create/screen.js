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
import Switch from "react-switch";
import * as Yup from "yup";
import * as CreditNotesCreateActions from "./actions";
import * as CreditNotesActions from "../../actions";
import * as ProductActions from "../../../product/actions";
import * as CurrencyConvertActions from "../../../currencyConvert/actions";
import {
  LeavePage,
  Loader,
  ProductTableCalculation,
  ProductTable,
  TotalCalculation,
} from "components";
import "react-datepicker/dist/react-datepicker.css";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { CommonActions } from "services/global";
import {
  selectCurrencyFactory,
  selectOptionsFactory,
  DropdownLists,
} from "utils";
import "./style.scss";
import moment from "moment";
import { data } from "../../../Language/index";
import LocalizedStrings from "react-localization";
import { Checkbox } from "@material-ui/core";
import { TextareaAutosize, TextField } from "@material-ui/core";

const mapStateToProps = (state) => {
  const contact_list = state.customer_invoice.customer_list;
  return {
    currency_list: state.customer_invoice.currency_list,
    invoice_list: state.creditNote.invoice_list,
    vat_list: state.customer_invoice.vat_list,
    product_list: state.customer_invoice.product_list,
    customer_list: state.customer_invoice.customer_list,
    excise_list: state.customer_invoice.excise_list,
    country_list: state.customer_invoice.country_list,
    product_category_list: state.product.product_category_list,
    customer_list_dropdown: DropdownLists.getContactDropDownList(contact_list),
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
    companyDetails: state.common.company_details,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    creditNotesActions: bindActionCreators(CreditNotesActions, dispatch),
    currencyConvertActions: bindActionCreators(
      CurrencyConvertActions,
      dispatch
    ),
    creditNotesCreateActions: bindActionCreators(
      CreditNotesCreateActions,
      dispatch
    ),
    productActions: bindActionCreators(ProductActions, dispatch),
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

const invoiceimage = require("assets/images/invoice/invoice.png");
const ZERO = 0.0;
let strings = new LocalizedStrings(data);
class CreateCreditNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      customer_currency_symbol: "",
      loading: false,
      disabled: false,
      discountOptions: [
        { value: "FIXED", label: "Fixed" },
        { value: "PERCENTAGE", label: "Percentage" },
      ],
      exciseTypeOption: [
        { value: "Inclusive", label: "Inclusive" },
        { value: "Exclusive", label: "Exclusive" },
      ],
      disabledDate: true,
      data: [
        {
          id: 0,
          description: "",
          quantity: 1,
          unitPrice: "",
          vatCategoryId: "",
          exciseTaxId: "",
          exciseAmount: 0,
          subTotal: 0,
          vatAmount: 0,
          productId: "",
          isExciseTaxExclusive: "",
          discountType: "FIXED",
          discount: 0,
          unitType: "",
          unitTypeId: "",
        },
      ],
      idCount: 0,
      initValue: {
        invoiceNumber: "",
        receiptAttachmentDescription: "",
        receiptNumber: "",
        contact_po_number: "",
        currency: "",
        // invoiceDueDate: '',
        creditNoteDate: new Date(),
        contactId: "",
        placeOfSupplyId: "",
        project: "",
        term: "",
        // exchangeRate:'',
        lineItemsString: [
          {
            id: 0,
            description: "",
            quantity: 1,
            exciseAmount: 0,
            discount: 0,
            unitPrice: "",
            vatCategoryId: "",
            productId: "",
            subTotal: 0,
          },
        ],
        creditNoteNumber: "",
        totalNet: 0,
        invoiceVATAmount: 0,
        totalVatAmount: 0,
        totalAmount: 0,
        notes: "",
        email: "",
        discount: 0,
        discountPercentage: "",
        discountType: "FIXED",
        creditAmount: "",
        totalExciseAmount: 0,
      },
      currentData: {},
      contactType: 2,
      selectedContact: "",
      createMore: false,
      fileName: "",
      term: "",
      selectedType: { value: "FIXED", label: "Fixed" },
      discountPercentage: "",
      discountAmount: 0,
      exist: false,
      prefix: "",
      purchaseCategory: [],
      salesCategory: [],
      // exchangeRate:'',
      basecurrency: [],
      inventoryList: [],
      remainingInvoiceAmount: "",
      invoiceSelected: false,
      isCreatedWIWP: false,
      quantityExceeded: "",
      isCreatedWithoutInvoice: false,
      loadingMsg: "Loading",
      disableLeavePage: false,
      lockInvoiceDetail: false,
      receiptDate: "",
      isfreshCN: true,
    };

    this.formRef = React.createRef();

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

    this.termList = [
      { label: "Net 7 Days", value: "NET_7" },
      { label: "Net 10 Days", value: "NET_10" },
      { label: "Net 30 Days", value: "NET_30" },
      { label: "Due on Receipt", value: "DUE_ON_RECEIPT" },
    ];
    this.placelist = [
      { label: "Abu Dhabi", value: "1" },
      { label: "Dubai", value: "2" },
      { label: "Sharjah", value: "3" },
      { label: "Ajman", value: "4" },
      { label: "Umm Al Quwain", value: "5" },
      { label: "Ras al-Khaimah", value: "6" },
      { label: "Fujairah", value: "7" },
    ];
    this.regEx = /^[0-9\b]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExCNNum = /[a-zA-Z0-9-/]+$/;
    this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
    this.regDecimalP =
      /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/;
  }

  discountType = (row) => {
    return (
      this.state.discountOptions &&
      selectOptionsFactory
        .renderOptions("label", "value", this.state.discountOptions, "discount")
        .find((option) => option.value === +row.discountType)
    );
  };

  setDate = (props, value) => {
    const { term } = this.state;
    const val = term ? term.value.split("_") : "";
    const temp = val[val.length - 1] === "Receipt" ? 1 : val[val.length - 1];
    const values = value
      ? value
      : moment(props.values.creditNoteDate, "DD-MM-YYYY").toDate();
    // if (temp && values) {
    // 	const date = moment(values)
    // 		.add(temp - 1, 'days')
    // 		.format('DD-MM-YYYY');
    // 	props.setFieldValue('invoiceDueDate', date, true);
    // }
  };

  setExchange = (value) => {
    let result = this.props.currency_convert_list
      ? this.props.currency_convert_list.find((obj) => {
          return obj.currencyCode === value;
        })
      : "";

    this.formRef.current.setFieldValue(
      "exchangeRate",
      result?.exchangeRate,
      true
    );
  };

  setCurrency = (value) => {
    let result = this.props.currency_convert_list.filter((obj) => {
      return obj.currencyCode === value;
    });
    this.formRef.current.setFieldValue(
      "curreancyname",
      result[0].currencyName,
      true
    );
  };

  validationCheck = (value) => {
    const data = {
      moduleType: 28,
      name: value,
    };
    this.props.creditNotesCreateActions
      .checkValidation(data)
      .then((response) => {
        if (response.data === "Credit Note Number Already Exists") {
          this.setState(
            {
              exist: true,
            },
            () => {}
          );
        } else {
          this.setState({
            exist: false,
          });
        }
      });
  };

  componentDidMount = () => {
    this.getInitialData();
    this.getDefaultNotes();
  };

  getDefaultNotes = () => {
    this.props.commonActions.getNoteSettingsInfo().then((res) => {
      if (res.status === 200) {
        this.formRef.current.setFieldValue(
          "notes",
          res.data.defaultNotes,
          true
        );
        this.formRef.current.setFieldValue(
          "footNote",
          res.data.defaultFootNotes,
          true
        );
      }
    });
  };
  getInitialData = () => {
    const { companyDetails } = this.props;
    if (companyDetails) {
      const {
        currencyCode,
        isRegisteredVat,
        isDesignatedZone,
        vatRegistrationDate,
      } = companyDetails;
      this.setState({
        initValue: {
          ...this.state.initValue,
          ...{
            currencyCode: currencyCode,
          },
        },
        companyVATRegistrationDate: new Date(moment(vatRegistrationDate)),
        isDesignatedZone: isDesignatedZone,
        isRegisteredVat: isRegisteredVat,
        loading: false,
      });
      this.formRef?.current &&
        this.formRef.current.setFieldValue("currencyCode", currencyCode);
    }
    this.getInvoiceNo();
    this.props.creditNotesActions.getInvoiceListForDropdown();
    this.props.creditNotesActions.getCustomerList(this.state.contactType);
    this.props.creditNotesActions.getCountryList();
    this.props.creditNotesActions.getExciseList();
    this.props.creditNotesActions.getVatList();
    this.props.creditNotesActions.getProductList();
    this.props.productActions.getProductCategoryList();
    this.props.creditNotesActions
      .getTaxTreatment()
      .then((res) => {
        if (res.status === 200) {
          let array = [];
          res.data.map((row) => {
            if (row.id !== 8) array.push(row);
          });
          this.setState({ taxTreatmentList: array });
        }
      })
      .catch((err) => {
        this.setState({ disabled: false });
        this.props.commonActions.tostifyAlert(
          "error",
          err.data ? err.data.message : "ERROR"
        );
      });
    this.props.commonActions.getCurrencyConversionList().then((response) => {
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
    });
    this.getCompanyCurrency();
    this.salesCategory();
    this.purchaseCategory();
    if (this.props.location?.state?.invoiceID) {
      this.getInvoiceDetails(this.props.location?.state?.invoiceID);
      this.formRef.current.setFieldValue(
        "invoiceNumber",
        this.props.location?.state?.invoiceID,
        true
      );
      this.setState({ invoiceSelected: true, lockInvoiceDetail: true });
    }
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
  salesCategory = () => {
    try {
      this.props.productActions
        .getTransactionCategoryListForSalesProduct("2")
        .then((res) => {
          if (res.status === 200) {
            this.setState(
              {
                salesCategory: res.data,
              },
              () => {}
            );
          }
        });
    } catch (err) {
      console.log(err);
    }
  };
  purchaseCategory = () => {
    try {
      this.props.productActions
        .getTransactionCategoryListForPurchaseProduct("10")
        .then((res) => {
          if (res.status === 200) {
            this.setState(
              {
                purchaseCategory: res.data,
              },
              () => {}
            );
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  addRow = () => {
    const data = [...this.state.data];
    this.setState(
      {
        data: data.concat({
          id: this.state.idCount + 1,
          description: "",
          quantity: 1,
          unitPrice: "",
          vatCategoryId: "",
          productId: "",
          subTotal: 0,
          discountType: "FIXED",
          discount: 0,
          exciseTaxId: "",
          unitType: "",
          unitTypeId: "",
        }),
        idCount: this.state.idCount + 1,
      },
      () => {
        this.formRef.current.setFieldValue(
          "lineItemsString",
          this.state.data,
          true
        );
        this.formRef.current.setFieldTouched(
          `lineItemsString[${this.state.data.length - 1}]`,
          false,
          true
        );
      }
    );
  };

  selectItem = (e, row, name, form, field, props) => {
    //e.preventDefault();
    let data = this.state.data;
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        obj[`${name}`] = e;
        idx = index;
      }
      return obj;
    });
    if (
      name === "unitPrice" ||
      name === "vatCategoryId" ||
      name === "quantity"
    ) {
      form.setFieldValue(
        field.name,
        this.state.data[parseInt(idx, 10)][`${name}`],
        true
      );
      this.updateAmount(data, props);
    } else {
      this.setState({ data }, () => {
        form.setFieldValue(
          field.name,
          this.state.data[parseInt(idx, 10)][`${name}`],
          true
        );
      });
    }
  };

  prductValue = (e, row, name, form, field, props) => {
    const { product_list } = this.props;
    let data = this.state.data;
    const result = product_list.find((item) => item.id === parseInt(e));
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        obj["unitPrice"] = result.unitPrice;
        obj["vatCategoryId"] = result.vatCategoryId;
        obj["description"] = result.description;
        obj["exciseTaxId"] = result.exciseTaxId;
        obj["discountType"] = result.discountType;
        obj["isExciseTaxExclusive"] = result.isExciseTaxExclusive;
        obj["unitType"] = result.unitType;
        obj["unitTypeId"] = result.unitTypeId;
        idx = index;
      }
      return obj;
    });
    form.setFieldValue(
      `lineItemsString.${idx}.vatCategoryId`,
      result.vatCategoryId,
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.unitPrice`,
      result.unitPrice,
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.exciseTaxId`,
      result.exciseTaxId,
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.description`,
      result.description,
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.discountType`,
      result.discountType,
      true
    );
    this.updateAmount(data, props);
  };

  setValue = (value) => {
    this.setState((prevState) => ({
      ...prevState,
      initValue: [],
    }));
  };

  deleteRow = (e, row, props) => {
    const id = row["id"];
    let newData = [];
    e.preventDefault();
    const data = this.state.data;
    newData = data.filter((obj) => obj.id !== id);
    props.setFieldValue("lineItemsString", newData, true);
    this.updateAmount(newData, props);
  };

  checkedRow = () => {
    if (this.state.data.length > 0) {
      let length = this.state.data.length - 1;
      let temp = Object.values(this.state.data[`${length}`]).indexOf("");
      if (temp > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  updateAmount = (data, props) => {
    const { vat_list } = this.props;
    const { taxType } = this.state;
    const list = ProductTableCalculation.updateAmount(
      data ? data : [],
      vat_list,
      taxType
    );
    this.setState({
      data: list.data ? list.data : [],
      initValue: {
        ...this.state.initValue,
        ...{
          totalNet: list.totalNet ? list.totalNet : 0,
          totalVatAmount: list.totalVatAmount ? list.totalVatAmount : 0,
          discount: list.discount ? list.discount : 0,
          totalAmount: list.totalAmount ? list.totalAmount : 0,
          totalExciseAmount: list.totalExciseAmount
            ? list.totalExciseAmount
            : 0,
        },
      },
    });
  };

  handleFileChange = (e, props) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
      props.setFieldValue("attachmentFile", file, true);
    }
  };

  handleSubmit = (data, resetForm) => {
    this.setState({ disabled: true, disableLeavePage: true });
    const {
      receiptAttachmentDescription,
      receiptNumber,
      contact_po_number,
      currency,
      invoiceNumber,
      exchangeRate,
      // invoiceDueDate,
      creditNoteDate,
      contactId,
      creditNoteNumber,
      discount,
      discountType,
      discountPercentage,
      notes,
      email,
      creditAmount,
      vatCategoryId,
      placeOfSupplyId,
    } = data;
    const { isCreatedWIWP } = this.state;
    const formData = new FormData();

    formData.append(
      "isCreatedWithoutInvoice",
      this.state.isCreatedWithoutInvoice
    );
    formData.append("isCreatedWIWP", isCreatedWIWP);
    formData.append(
      "creditNoteNumber",
      creditNoteNumber ? this.state.prefix + creditNoteNumber : ""
    );
    formData.append("email", email ? email : "");
    formData.append(
      "creditNoteDate",
      creditNoteDate ? moment(creditNoteDate, "DD-MM-YYYY").toDate() : null
    );
    formData.append("referenceNo", receiptNumber !== null ? receiptNumber : "");
    formData.append("exchangeRate", exchangeRate ? exchangeRate : "");
    formData.append(
      "contactPoNumber",
      contact_po_number !== null ? contact_po_number : ""
    );
    formData.append(
      "receiptAttachmentDescription",
      receiptAttachmentDescription !== null ? receiptAttachmentDescription : ""
    );
    formData.append("notes", notes !== null ? notes : "");
    formData.append("type", 7);
    if (isCreatedWIWP === true)
      formData.append("totalAmount", creditAmount);

    formData.append("vatCategoryId", 2);
    formData.append("taxType", this.state.taxType ? this.state.taxType : false);

    if (invoiceNumber) {
      formData.append(
        "invoiceId",
        invoiceNumber.value ? invoiceNumber.value : invoiceNumber
      );
      formData.append("cnCreatedOnPaidInvoice", "1");
    }
    if (placeOfSupplyId) {
      formData.append(
        "placeOfSupplyId",
        placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId
      );
    }
    if (!isCreatedWIWP) {
      formData.append("lineItemsString", JSON.stringify(this.state.data));
      formData.append("totalVatAmount", this.state.initValue.totalVatAmount);
      formData.append("totalAmount", this.state.initValue.totalAmount);
      formData.append("discount", this.state.initValue.discount);
      formData.append(
        "totalExciseTaxAmount",
        this.state.initValue.totalExciseAmount
      );
    }
    if (contactId) {
      formData.append(
        "contactId",
        contactId.value ? contactId.value : contactId
      );
    }
    if (currency !== null && currency) {
      formData.append("currencyCode", this.state.customer_currency);
    }
    if (
      this.uploadFile &&
      this.uploadFile.files &&
      this.uploadFile?.files?.[0]
    ) {
      formData.append("attachmentFile", this.uploadFile?.files?.[0]);
    }

    this.setState({ loading: true, loadingMsg: "Creating Credit Note..." });
    this.props.creditNotesCreateActions
      .createCreditNote(formData)
      .then((res) => {
        this.setState({ disabled: false });
        this.setState({ loading: false });
        this.props.commonActions.tostifyAlert(
          "success",
          res.data
            ? res.data.message
            : "New Tax Credit Note Created Successfully."
        );
        if (this.state.createMore) {
          this.props.creditNotesActions.getInvoiceListForDropdown();
          this.setState(
            {
              disableLeavePage: false,
              remainingInvoiceAmount: "",
              createMore: false,
              selectedContact: "",
              term: "",
              exchangeRate: "",
              data: [
                {
                  id: 0,
                  description: "",
                  quantity: 1,
                  unitPrice: "",
                  vatCategoryId: "",
                  subTotal: 0,
                  productId: "",
                },
              ],
              initValue: {
                ...this.state.initValue,
                ...{
                  totalNet: 0,
                  totalVatAmount: 0,
                  totalAmount: 0,
                  discountType: "",
                  discount: 0,
                  discountPercentage: "",
                  totalExciseAmount: 0,
                },
              },
            },
            () => {
              resetForm(this.state.initValue);
              this.getInvoiceNo();
              this.formRef.current.setFieldValue(
                "lineItemsString",
                this.state.data,
                false
              );
            }
          );
        } else {
          this.props.history.push("/admin/income/credit-notes");
          this.setState({ loading: false });
        }
      })
      .catch((err) => {
        this.setState({
          disabled: false,
          loading: false,
          disableLeavePage: false,
        });
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data
            ? err.data.message
            : "New Tax Credit Note Created Unsuccessfully."
        );
      });
  };
  getCurrentNumber = (data) => {
    this.getInvoiceNo();
  };

  getCurrentProduct = () => {
    this.props.creditNotesActions.getProductList().then((res) => {
      this.setState(
        {
          data: [
            {
              id: 0,
              discount: 0,
              description: res.data[0].description,
              quantity: 1,
              unitPrice: res.data[0].unitPrice,
              vatCategoryId: res.data[0].vatCategoryId,
              subTotal: res.data[0].unitPrice,
              productId: res.data[0].id,
              discountType: res.data[0].discountType,
              exciseTaxId: res.data[0].exciseTaxId,
              unitType: res.data[0].unitType,
              unitTypeId: res.data[0].unitTypeId,
            },
          ],
        },
        () => {
          const values = {
            values: this.state.initValue,
          };
          this.updateAmount(this.state.data, values);
        }
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.unitPrice`,
        res.data[0].unitPrice,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.unitType`,
        res.data[0].unitType,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.quantity`,
        1,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.vatCategoryId`,
        res.data[0].vatCategoryId,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.productId`,
        res.data[0].id,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.discountType`,
        1,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.exciseTaxId`,
        1,
        true
      );
    });
  };
  getInvoiceNo = () => {
    this.props.creditNotesCreateActions.getInvoiceNo().then((res) => {
      if (res.status === 200) {
        this.setState({
          initValue: {
            ...this.state.initValue,
            ...{ creditNoteNumber: res.data },
          },
        });
        this.formRef.current.setFieldValue(
          "creditNoteNumber",
          res.data,
          true,
          this.validationCheck(res.data)
        );
      }
    });
  };

  getCurrency = (currencyCode, currencyName, currencyIsoCode) => {
    this.setState({
      customer_currency: currencyCode,
      customer_currency_des: currencyName,
      customer_currency_symbol: currencyIsoCode,
    });

    return currencyCode;
  };
  getTaxTreatment = (opt) => {
    let customer_taxTreatmentId = 0;
    let customer_item_taxTreatment = "";
    this.props.customer_list.map((item) => {
      if (item.label.contactId == opt) {
        this.setState({
          customer_taxTreatment: item.label.taxTreatment.id,
          customer_taxTreatment_des: item.label.taxTreatment.taxTreatment,
          // customer_currency_symbol: item.label.currency.currencyIsoCode,
        });

        customer_taxTreatmentId = item.label.taxTreatment.id;
        customer_item_taxTreatment = item.label.currency;
      }
    });

    return customer_taxTreatmentId;
  };

  getInvoiceDetails = (value) => {
    if (value) {
      this.props.creditNotesCreateActions
        .getInvoiceById(value)
        .then((response) => {
          if (response.status === 200) {
            const customerdetails = {
              label:
                response.data.organisationName === ""
                  ? response.data.name
                  : response.data.organisationName,
              value: response.data.contactId,
            };

            this.setState(
              {
                invoiceID: this.props.location?.state?.invoiceID,
                isfreshCN: false,
                receiptDate: response.data.receiptDate,
                taxType: response.data.taxType,
                placeOfSupplyId: response.data.placeOfSupplyId,
                option: {
                  label:
                    response.data.organisationName === ""
                      ? response.data.name
                      : response.data.organisationName,
                  value: response.data.contactId,
                },
                data: response.data.invoiceLineItems,
                totalAmount: response.data.totalAmount,
                customer_currency: response.data.currencyCode,
                remainingInvoiceAmount: response.data.remainingInvoiceAmount,
              },
              () => {
                this.formRef.current.setFieldValue(
                  "lineItemsString",
                  this.state.data,
                  true
                );
                this.formRef.current.setFieldTouched(
                  `lineItemsString[${this.state.data.length - 1}]`,
                  false,
                  true
                );
                this.updateAmount(this.state.data);
              }
            );
            this.formRef.current.setFieldValue(
              "currency",
              response.data.currencyCode,
              true
            );
            this.formRef.current.setFieldValue(
              "taxTreatmentid",
              this.getTaxTreatment(customerdetails.value),
              true
            );
            this.formRef.current.setFieldValue(
              "placeOfSupplyId",
              this.state.placeOfSupplyId,
              true
            );
            this.setExchange(
              this.getCurrency(
                response?.data?.currencyCode,
                response?.data?.currencyName,
                response?.data?.currencyIsoCode
              )
            );
            this.formRef.current.setFieldValue(
              "contactId",
              response.data.contactId,
              true
            );
            this.formRef.current.setFieldValue(
              "remainingInvoiceAmount",
              this.state.remainingInvoiceAmount,
              true
            );
            this.formRef.current.setFieldValue(
              "currencyCode",
              response.data.currencyCode,
              true
            );
            // this.getTaxTreatment(this.state.option.value)
          }
        });
    }
  };
  showDescription(row, form, field, props, idx) {
    return (
      <div className="mt-1">
        <TextField
          disabled
          type="textarea"
          inputProps={{ maxLength: 2000 }}
          multiline
          minRows={1}
          maxRows={4}
          value={row["description"] !== "" ? row["description"] : ""}
          onChange={(e) => {
            this.selectItem(e.target.value, row, "description", form, field);
          }}
          placeholder={strings.Description}
          className={`textarea ${
            props.errors.lineItemsString &&
            props.errors.lineItemsString[parseInt(idx, 10)] &&
            props.errors.lineItemsString[parseInt(idx, 10)].description &&
            Object.keys(props.touched).length > 0 &&
            props.touched.lineItemsString &&
            props.touched.lineItemsString[parseInt(idx, 10)] &&
            props.touched.lineItemsString[parseInt(idx, 10)].description
              ? "is-invalid"
              : ""
          }`}
        />
      </div>
    );
  }

  render() {
    strings.setLanguage(this.state.language);
    const { loading, loadingMsg } = this.state;
    const {
      data,
      idCount,
      initValue,
      exist,
      lockInvoiceDetail,
      taxTreatmentList,
      isRegisteredVat,
      isCreatedWIWP,
    } = this.state;
    const {
      customer_list_dropdown,
      invoice_list,
      universal_currency_list,
      currency_convert_list,
      vat_list,
      product_list,
      excise_list,
    } = this.props;

    return loading == true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div>
        <div className="create-customer-invoice-screen">
          <div className="animated fadeIn">
            <Row>
              <Col lg={12} className="mx-auto">
                <Card>
                  <CardHeader>
                    <Row>
                      <Col lg={12}>
                        <div className="h4 mb-0 d-flex align-items-center">
                          <i className="nav-icon fas fa-donate" />
                          <span className="ml-2">
                            {strings.CreateCreditNote}
                          </span>
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
                          <Formik
                            initialValues={initValue}
                            ref={this.formRef}
                            onSubmit={(values, { resetForm }) => {
                              this.handleSubmit(values, resetForm);
                            }}
                            validate={(values) => {
                              let errors = {};

                              if (exist === true) {
                                errors.creditNoteNumber =
                                  "Tax Credit Note already exists";
                              }

                              if (
                                isCreatedWIWP == false &&
                                !values.invoiceNumber
                              ) {
                                errors.invoiceNumber =
                                  "Invoice number is required";
                              }
                              if (
                                isCreatedWIWP &&
                                values.creditAmount == ""
                              ) {
                                errors.creditAmount =
                                  "Credit Amount is required";
                              }
                              if (
                                this.state.invoiceSelected &&
                                isCreatedWIWP &&
                                values.creditAmount >
                                  this.state.remainingInvoiceAmount
                              ) {
                                errors.creditAmount =
                                  "Credit Amount Cannot Be Greater Than Remaining Invoice Amount";
                              }
                              return errors;
                            }}
                            validationSchema={Yup.object().shape({
                              // invoiceNumber: Yup.string().required(
                              // 	'Invoice Number is required',
                              // ),
                              creditNoteNumber: Yup.string().required(
                                "Tax credit note number is required"
                              ),
                              contactId: Yup.string().required(
                                "Customer name is required"
                              ),
                              // contactId: Yup.string().required(
                              // 	'Customer is required',
                              // ),
                              // placeOfSupplyId: Yup.string().required('Place of supply is required'),
                              // term: Yup.string().required('Term is required'),
                              // currency: Yup.string().required(
                              // 	'Currency is required',
                              // ),
                              creditNoteDate: Yup.string().required(
                                "Tax credit note date is required"
                              ),
                              lineItemsString: Yup.array()
                                .required(
                                  "Atleast one Tax Credit Note sub detail is mandatory"
                                )
                                .of(
                                  Yup.object().shape({
                                    quantity: Yup.string()
                                      .test(
                                        "quantity",
                                        strings.QuantityGreaterThan0,
                                        (value) => {
                                          if (value > 0) {
                                            return true;
                                          } else {
                                            return false;
                                          }
                                        }
                                      )
                                      .required("Quantity is required"),
                                    // 			unitPrice: Yup.string()
                                    // 				.required('Value is required')
                                    // 				.test(
                                    // 					'Unit Price',
                                    // 					'Unit Price Should be Greater than 1',
                                    // 					(value) => {
                                    // 						if (value > 0) {
                                    // 							return true;
                                    // 						} else {
                                    // 							return false;
                                    // 						}
                                    // 					},
                                    // 				),
                                    // 			vatCategoryId: Yup.string().required(
                                    // 				'Value is required',
                                    // 			),
                                    // 			productId: Yup.string().required(
                                    // 				'Product is required',
                                    // 			),
                                  })
                                ),
                              attachmentFile: Yup.mixed()
                                .test(
                                  "fileType",
                                  "*Unsupported file format",
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
                                        ))
                                    ) {
                                      return true;
                                    } else {
                                      return false;
                                    }
                                  }
                                )
                                .test(
                                  "fileSize",
                                  "*File size is too large",
                                  (value) => {
                                    if (
                                      !value ||
                                      (value && value.size <= this.file_size)
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
                                  {!this.state.isCreatedWithoutInvoice && (
                                    <Col lg={3}>
                                      <FormGroup className="mb-3">
                                        <Label htmlFor="invoiceNumber">
                                          <span className="text-danger">
                                            *{" "}
                                          </span>
                                          {strings.InvoiceNumber}
                                        </Label>
                                        <Select
                                          isDisabled={lockInvoiceDetail}
                                          id="invoiceNumber"
                                          name="invoiceNumber"
                                          placeholder={
                                            strings.Select +
                                            strings.InvoiceNumber
                                          }
                                          options={
                                            invoice_list.data
                                              ? selectOptionsFactory.renderOptions(
                                                  "label",
                                                  "value",
                                                  invoice_list.data,
                                                  "Invoice Number"
                                                )
                                              : []
                                          }
                                          value={
                                            props.values.invoiceNumber?.value
                                              ? props.values.invoiceNumber
                                              : invoice_list.data &&
                                                selectOptionsFactory
                                                  .renderOptions(
                                                    "label",
                                                    "value",
                                                    invoice_list.data,
                                                    "Invoice Number"
                                                  )
                                                  .find(
                                                    (obj) =>
                                                      obj.value ===
                                                      props.values.invoiceNumber
                                                  )
                                          }
                                          onChange={(option) => {
                                            if (option && option.value) {
                                              this.getInvoiceDetails(
                                                option.value
                                              );
                                              props.handleChange(
                                                "invoiceNumber"
                                              )(option);
                                              this.setState({
                                                invoiceSelected: true,
                                              });
                                            } else {
                                              this.setState({
                                                invoiceSelected: false,
                                              });
                                              props.handleChange(
                                                "invoiceNumber"
                                              )("");
                                              this.setState({
                                                invoiceSelected: false,
                                              });
                                            }
                                            this.formRef.current.setFieldValue(
                                              "receiptNumber",
                                              option.label,
                                              true
                                            );
                                          }}
                                          className={
                                            props.errors.invoiceNumber &&
                                            props.touched.invoiceNumber
                                              ? "is-invalid"
                                              : ""
                                          }
                                        />
                                        {props.errors.invoiceNumber &&
                                          props.touched.invoiceNumber && (
                                            <div className="invalid-feedback">
                                              {props.errors.invoiceNumber}
                                            </div>
                                          )}
                                      </FormGroup>
                                    </Col>
                                  )}
                                </Row>
                                <Row>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="creditNoteNumber">
                                        <span className="text-danger">* </span>
                                        {strings.CreditNoteNumber}
                                      </Label>
                                      <Input
                                        maxLength="50"
                                        type="text"
                                        id="creditNoteNumber"
                                        name="creditNoteNumber"
                                        placeholder={
                                          strings.Enter +
                                          strings.CreditNoteNumber
                                        }
                                        value={props.values.creditNoteNumber}
                                        onBlur={props.handleBlur(
                                          "creditNoteNumber"
                                        )}
                                        onChange={(option) => {
                                          if (
                                            option.target.value === "" ||
                                            this.regExCNNum.test(
                                              option.target.value
                                            )
                                          ) {
                                            props.handleChange(
                                              "creditNoteNumber"
                                            )(option);
                                          }
                                          this.validationCheck(
                                            option.target.value
                                          );
                                        }}
                                        className={
                                          props.errors.creditNoteNumber &&
                                          props.touched.creditNoteNumber
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.creditNoteNumber &&
                                        props.touched.creditNoteNumber && (
                                          <div className="invalid-feedback">
                                            {props.errors.creditNoteNumber}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="contactId">
                                        <span className="text-danger">* </span>
                                        {strings.CustomerName}
                                      </Label>
                                      <Select
                                        id="contactId"
                                        name="contactId"
                                        // placeholder={strings.Select + strings.CustomerName}
                                        options={
                                          customer_list_dropdown
                                            ? selectOptionsFactory.renderOptions(
                                                "label",
                                                "value",
                                                customer_list_dropdown,
                                                "Customer Name"
                                              )
                                            : []
                                        }
                                        value={
                                          props.values.contactId?.value
                                            ? props.values.contactId
                                            : customer_list_dropdown &&
                                              selectOptionsFactory
                                                .renderOptions(
                                                  "label",
                                                  "value",
                                                  customer_list_dropdown,
                                                  "Customer Name"
                                                )
                                                .find(
                                                  (obj) =>
                                                    obj.value ===
                                                    props.values.contactId
                                                )
                                        }
                                        isDisabled={this.state.invoiceSelected}
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            props.handleChange("contactId")(
                                              option
                                            );
                                          } else {
                                            props.handleChange("contactId")("");
                                          }
                                        }}
                                        className={
                                          props.errors.contactId &&
                                          props.touched.contactId
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.contactId &&
                                        props.touched.contactId && (
                                          <div className="invalid-feedback">
                                            {props.errors.contactId}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>

                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="taxTreatmentid">
                                        {strings.TaxTreatment}
                                      </Label>
                                      <Select
                                        options={
                                          taxTreatmentList
                                            ? selectOptionsFactory.renderOptions(
                                                "name",
                                                "id",
                                                taxTreatmentList,
                                                "VAT"
                                              )
                                            : []
                                        }
                                        isDisabled={true}
                                        id="taxTreatmentid"
                                        name="taxTreatmentid"
                                        placeholder={
                                          strings.Select + strings.TaxTreatment
                                        }
                                        value={
                                          taxTreatmentList &&
                                          selectOptionsFactory
                                            .renderOptions(
                                              "name",
                                              "id",
                                              taxTreatmentList,
                                              "VAT"
                                            )
                                            .find(
                                              (option) =>
                                                option.label ===
                                                this.state
                                                  .customer_taxTreatment_des
                                            )
                                        }
                                        onChange={(option) => {
                                          props.handleChange("taxTreatmentid")(
                                            option
                                          );
                                        }}
                                        className={
                                          props.errors.taxTreatmentid &&
                                          props.touched.taxTreatmentid
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.taxTreatmentid &&
                                        props.touched.taxTreatmentid && (
                                          <div className="invalid-feedback">
                                            {props.errors.taxTreatmentid}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={3}>
                                    {this.state.customer_taxTreatment_des !==
                                      "NON GCC" &&
                                      this.state.customer_taxTreatment_des !==
                                        "GCC VAT REGISTERED" &&
                                      this.state.customer_taxTreatment_des !==
                                        "GCC NON-VAT REGISTERED" && (
                                        <FormGroup className="mb-3">
                                          <Label htmlFor="placeOfSupplyId">
                                            <span className="text-danger">
                                              *{" "}
                                            </span>
                                            {strings.PlaceofSupply}
                                          </Label>
                                          <Select
                                            id="placeOfSupplyId"
                                            name="placeOfSupplyId"
                                            placeholder={
                                              strings.Select +
                                              strings.PlaceofSupply
                                            }
                                            options={
                                              console.log(this.placelist) ||
                                              this.placelist
                                                ? selectOptionsFactory.renderOptions(
                                                    "label",
                                                    "value",
                                                    this.placelist,
                                                    "Place of Supply"
                                                  )
                                                : []
                                            }
                                            value={
                                              this.placelist &&
                                              selectOptionsFactory
                                                .renderOptions(
                                                  "label",
                                                  "value",
                                                  this.placelist,
                                                  "Place of Supply"
                                                )
                                                .find(
                                                  (option) =>
                                                    option.value ==
                                                    (this.state.invoiceId
                                                      ? this.state
                                                          .placeOfSupplyId &&
                                                        this.state
                                                          .placeOfSupplyId
                                                          .value !== null
                                                        ? this.state
                                                            .placeOfSupplyId
                                                            .value
                                                        : this.state
                                                            .placeOfSupplyId
                                                      : props.values
                                                          .placeOfSupplyId !==
                                                        null
                                                      ? props.values.placeOfSupplyId.toString()
                                                      : "")
                                                )
                                            }
                                            isDisabled={
                                              this.state.placeOfSupplyId !==
                                              null
                                            }
                                            className={
                                              props.errors.placeOfSupplyId &&
                                              props.touched.placeOfSupplyId
                                                ? "is-invalid"
                                                : ""
                                            }
                                            onChange={(option) => {
                                              props.handleChange(
                                                "placeOfSupplyId"
                                              )(option);
                                              this.setState({
                                                placeOfSupplyId: option,
                                              });
                                            }}
                                          />
                                          {props.errors.placeOfSupplyId &&
                                            props.touched.placeOfSupplyId && (
                                              <div className="invalid-feedback">
                                                {props.errors.placeOfSupplyId}
                                              </div>
                                            )}
                                        </FormGroup>
                                      )}
                                  </Col>
                                </Row>
                                <hr />
                                <Row>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="date">
                                        <span className="text-danger">* </span>
                                        {strings.CreditNoteDate}
                                      </Label>
                                      <DatePicker
                                        id="creditNoteDate"
                                        name="creditNoteDate"
                                        placeholderText={
                                          strings.Select +
                                          strings.CreditNoteDate
                                        }
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="dd-MM-yyyy"
                                        minDate={
                                          new Date(
                                            moment(
                                              this.state.receiptDate,
                                              "YYYY-MM-DD"
                                            ).format()
                                          )
                                        }
                                        dropdownMode="select"
                                        value={props.values.creditNoteDate}
                                        selected={props.values.creditNoteDate}
                                        onChange={(value) => {
                                          props.handleChange("creditNoteDate")(
                                            value
                                          );
                                          this.setDate(props, value);
                                        }}
                                        className={`form-control ${
                                          props.errors.creditNoteDate &&
                                          props.touched.creditNoteDate
                                            ? "is-invalid"
                                            : ""
                                        }`}
                                      />
                                      {props.errors.creditNoteDate &&
                                        props.touched.creditNoteDate && (
                                          <div className="invalid-feedback">
                                            {props.errors.creditNoteDate.includes(
                                              "nullable()"
                                            )
                                              ? "Tax credit note date is required"
                                              : props.errors.creditNoteDate}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="currency">
                                        <span className="text-danger">* </span>
                                        {strings.Currency}
                                      </Label>
                                      <Select
                                        isDisabled={true}
                                        styles={customStyles}
                                        placeholder={
                                          strings.Select + strings.Currency
                                        }
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
                                        id="currency"
                                        name="currency"
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
                                                +this.state.customer_currency
                                            )
                                        }
                                        className={
                                          props.errors.currency &&
                                          props.touched.currency
                                            ? "is-invalid"
                                            : ""
                                        }
                                        onChange={(option) => {
                                          props.handleChange("currency")(
                                            option
                                          );
                                          // this.setExchange(option.value);
                                          this.setCurrency(option.value);
                                        }}
                                      />
                                      {props.errors.currency &&
                                        props.touched.currency && (
                                          <div className="invalid-feedback">
                                            {props.errors.currency}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>

                                  {!this.state.isCreatedWithoutInvoice &&
                                    this.state.invoiceSelected == true && (
                                      <Col lg={3}>
                                        <FormGroup className="mb-3">
                                          <Label htmlFor="remainingInvoiceAmount">
                                            {strings.RemainingInvoiceAmount}
                                          </Label>
                                          <Input
                                            type="text"
                                            id="remainingInvoiceAmount"
                                            name="remainingInvoiceAmount"
                                            placeholder="Remaining invoice Amount"
                                            disabled={true}
                                            value={
                                              this.state.remainingInvoiceAmount
                                            }
                                          />
                                          {props.errors
                                            .remainingInvoiceAmount && (
                                            <div className="text-danger">
                                              {
                                                props.errors
                                                  .remainingInvoiceAmount
                                              }
                                            </div>
                                          )}
                                        </FormGroup>
                                      </Col>
                                    )}

                                  {isCreatedWIWP === true && (
                                    <Col lg={3}>
                                      <FormGroup className="mb-3">
                                        <Label htmlFor="creditAmount">
                                          <span className="text-danger">
                                            *{" "}
                                          </span>
                                          {strings.CreditAmount}
                                        </Label>
                                        <Input
                                          type="text"
                                          maxLength="14,2"
                                          id="creditAmount"
                                          name="creditAmount"
                                          placeholder={
                                            strings.Enter + strings.CreditAmount
                                          }
                                          value={props.values.creditAmount}
                                          // onBlur={props.handleBlur('currencyCode')}
                                          onChange={(value) => {
                                            if (
                                              (this.regDecimal.test(
                                                value.target.value
                                              ) &&
                                                parseFloat(
                                                  value.target.value
                                                ) >= 1) ||
                                              value.target.value === ""
                                            ) {
                                              props.handleChange(
                                                "creditAmount"
                                              )(value);
                                            }
                                          }}
                                          className={
                                            props.errors.creditAmount &&
                                            props.touched.creditAmount
                                              ? "is-invalid"
                                              : ""
                                          }
                                        />
                                        {props.errors.creditAmount && (
                                          <div className="invalid-feedback">
                                            {props.errors.creditAmount}
                                          </div>
                                        )}
                                      </FormGroup>
                                    </Col>
                                  )}
                                
                                </Row>
                                <hr />
                                {isCreatedWIWP === false && (
                                  <>
                                    <Row>
                                      <Col lg={8} className="mb-3"></Col>
                                      <Col>
                                        {this.state.taxType === false ? (
                                          <span
                                            style={{ color: "#0069d9" }}
                                            className="mr-4"
                                          >
                                            <b>{strings.Exclusive}</b>
                                          </span>
                                        ) : (
                                          <span className="mr-4">
                                            {strings.Exclusive}
                                          </span>
                                        )}
                                        <Switch
                                          value={props.values.taxType}
                                          checked={this.state.taxType}
                                          disabled
                                          onChange={(taxType) => {
                                            props.handleChange("taxType")(
                                              taxType
                                            );
                                            this.setState({ taxType }, () => {
                                              this.updateAmount(
                                                this.state.data,
                                                props
                                              );
                                            });
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
                                          className="react-switch "
                                        />
                                        {this.state.taxType === true ? (
                                          <span
                                            style={{ color: "#0069d9" }}
                                            className="ml-4"
                                          >
                                            <b>{strings.Inclusive}</b>
                                          </span>
                                        ) : (
                                          <span className="ml-4">
                                            {strings.Inclusive}
                                          </span>
                                        )}
                                      </Col>
                                    </Row>
                                    <Row>
                                      <Col lg={12}>
                                        <ProductTable
                                          data={data}
                                          initValue={initValue}
                                          isRegisteredVat={isRegisteredVat}
                                          universal_currency_list={
                                            universal_currency_list
                                          }
                                          setData={(data) => {
                                            this.setState({ data: data });
                                            this.formRef.current.setFieldValue(
                                              "lineItemsString",
                                              data,
                                              true
                                            );
                                            this.formRef.current.setFieldTouched(
                                              `lineItemsString[${
                                                data.length - 1
                                              }]`,
                                              false,
                                              true
                                            );
                                          }}
                                          setIdCount={(idCount) => {
                                            this.setState({ idCount: idCount });
                                          }}
                                          props={props}
                                          strings={strings}
                                          vat_list={vat_list}
                                          product_list={product_list}
                                          excise_list={excise_list}
                                          discountEnabled={
                                            initValue.discount != 0
                                              ? true
                                              : false
                                          }
                                          idCount={idCount}
                                          updateAmount={(data) => {
                                            this.updateAmount(data);
                                          }}
                                          enableAccount={false}
                                          exchangeRate={
                                            props.values.exchangeRate
                                          }
                                          disableVat={!isRegisteredVat}
                                          getProductType={(id) => {
                                            const vat_list =
                                              this.getProductType(id);
                                            return vat_list;
                                          }}
                                          disableAll={true}
                                        />
                                      </Col>
                                    </Row>

                                    {initValue.discount != 0 && (
                                      <Row className="ml-4 ">
                                        <Col className=" ml-4">
                                          <FormGroup className="pull-right">
                                            <Input
                                              type="checkbox"
                                              id="discountEnabled"
                                              checked={
                                                initValue.discount != 0
                                                  ? true
                                                  : false
                                              }
                                              value={
                                                initValue.discount != 0
                                                  ? true
                                                  : false
                                              }
                                            />
                                            <Label>
                                              {strings.ApplyLineItemDiscount}
                                            </Label>
                                          </FormGroup>
                                        </Col>
                                      </Row>
                                    )}
                                  </>
                                )}
                                {this.state.data[0].id != 0 ? (
                                  <Row>
                                    <Col lg={8}>
                                      <FormGroup className="py-2">
                                        <Label htmlFor="notes">
                                          {strings.RefundNotes}
                                        </Label>
                                        <br />
                                        <TextField
                                          type="textarea"
                                          multiline
                                          style={{ width: "500px" }}
                                          className="textarea"
                                          inputProps={{ maxLength: 255 }}
                                          name="notes"
                                          id="notes"
                                          maxRows={4}
                                          placeholder={strings.DeliveryNotes}
                                          onChange={(option) =>
                                            props.handleChange("notes")(option)
                                          }
                                          value={props.values.notes}
                                        />
                                      </FormGroup>

                                      <Row>
                                        <Col lg={6}>
                                          <FormGroup className="mb-3">
                                            <Label htmlFor="receiptNumber">
                                              {strings.ReferenceNumber}
                                            </Label>
                                            <Input
                                              type="text"
                                              maxLength="20"
                                              id="receiptNumber"
                                              name="receiptNumber"
                                              value={props.values.receiptNumber}
                                              placeholder={
                                                strings.ReceiptNumber
                                              }
                                              onChange={(value) => {
                                                props.handleChange(
                                                  "receiptNumber"
                                                )(value);
                                              }}
                                              className={
                                                props.errors.receiptNumber &&
                                                props.touched.receiptNumber
                                                  ? "is-invalid"
                                                  : " "
                                              }
                                            />
                                            {props.errors.receiptNumber &&
                                              props.touched.receiptNumber && (
                                                <div className="invalid-feedback">
                                                  {props.errors.receiptNumber}
                                                </div>
                                              )}
                                          </FormGroup>
                                        </Col>
                                        <Col lg={6}>
                                          <FormGroup className="mb-3 hideAttachment">
                                            <Field
                                              name="attachmentFile"
                                              render={({ field, form }) => (
                                                <div>
                                                  <Label>
                                                    {strings.ReceiptAttachment}
                                                  </Label>{" "}
                                                  <br />
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
                                                </div>
                                              )}
                                            />
                                            {props.errors.attachmentFile &&
                                              props.touched.attachmentFile && (
                                                <div className="invalid-file">
                                                  {props.errors.attachmentFile}
                                                </div>
                                              )}
                                          </FormGroup>
                                        </Col>
                                      </Row>
                                      <FormGroup className="mb-3 hideAttachment">
                                        <Label htmlFor="receiptAttachmentDescription">
                                          {strings.AttachmentDescription}
                                        </Label>
                                        <br />
                                        <TextareaAutosize
                                          type="textarea"
                                          className="textarea form-control"
                                          maxLength="250"
                                          style={{ width: "700px" }}
                                          name="receiptAttachmentDescription"
                                          id="receiptAttachmentDescription"
                                          rows="2"
                                          placeholder={
                                            strings.ReceiptAttachmentDescription
                                          }
                                          onChange={(option) =>
                                            props.handleChange(
                                              "receiptAttachmentDescription"
                                            )(option)
                                          }
                                          value={
                                            props.values
                                              .receiptAttachmentDescription
                                          }
                                        />
                                      </FormGroup>
                                    </Col>
                                    {!isCreatedWIWP && (
                                      <Col lg={4}>
                                        <TotalCalculation
                                          initValue={initValue}
                                          currency_symbol={
                                            initValue.currencyIsoCode
                                          }
                                          isRegisteredVat={isRegisteredVat}
                                          strings={strings}
                                          discountEnabled={
                                            initValue.discount != 0
                                              ? true
                                              : false
                                          }
                                        />
                                      </Col>
                                    )}
                                  </Row>
                                ) : (
                                  <Row>
                                    <Col lg={8}>
                                      <FormGroup className="py-2">
                                        <Label htmlFor="notes">
                                          {strings.RefundNotes}
                                        </Label>
                                        <br />
                                        <TextareaAutosize
                                          type="textarea"
                                          style={{ width: "700px" }}
                                          className="textarea form-control"
                                          maxLength="255"
                                          name="notes"
                                          id="notes"
                                          rows="2"
                                          placeholder={strings.DeliveryNotes}
                                          onChange={(option) =>
                                            props.handleChange("notes")(option)
                                          }
                                          value={props.values.notes}
                                        />
                                      </FormGroup>
                                    </Col>
                                  </Row>
                                )}
                                <Row>
                                  <Col
                                    lg={12}
                                    className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                                  >
                                    <FormGroup className="text-right w-100">
                                      <Button
                                        type="button"
                                        color="primary"
                                        className="btn-square mr-3"
                                        disabled={
                                          this.state.disabled ||
                                          (parseFloat(
                                            parseFloat(
                                              initValue.totalAmount
                                            ).toFixed(2)
                                          ) >
                                            this.state.remainingInvoiceAmount &&
                                            !isCreatedWIWP)
                                        }
                                        onClick={() => {
                                          console.log(props.errors, "Error");
                                          //	added validation popup	msg
                                          props.handleBlur();
                                          if (
                                            props.errors &&
                                            Object.keys(props.errors).length !=
                                              0
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

                                      {!this.props.location?.state
                                        ?.invoiceID && (
                                        <Button
                                          type="button"
                                          color="primary"
                                          className="btn-square mr-3"
                                          disabled={
                                            this.state.disabled ||
                                            (parseFloat(
                                              parseFloat(
                                                initValue.totalAmount
                                              ).toFixed(2)
                                            ) >
                                              this.state
                                                .remainingInvoiceAmount &&
                                              !isCreatedWIWP)
                                          }
                                          onClick={() => {
                                            //	added validation popup	msg
                                            props.handleBlur();
                                            if (
                                              props.errors &&
                                              Object.keys(props.errors)
                                                .length != 0
                                            )
                                              this.props.commonActions.fillManDatoryDetails();
                                            this.setState(
                                              {
                                                createMore: true,
                                              },
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
                                      )}
                                      <Button
                                        color="secondary"
                                        className="btn-square"
                                        onClick={() => {
                                          if (
                                            this.props?.location?.state
                                              ?.renderURL
                                          ) {
                                            this.props.history.push(
                                              `${this.props?.location?.state?.renderURL}`,
                                              {
                                                id: this.props?.location?.state
                                                  ?.renderID,
                                              }
                                            );
                                          } else if (
                                            this.props.location?.state
                                              ?.invoiceID
                                          )
                                            this.props.history.push(
                                              "/admin/income/customer-invoice"
                                            );
                                          else
                                            this.props.history.push(
                                              "/admin/income/credit-notes"
                                            );
                                        }}
                                      >
                                        <i className="fa fa-ban"></i>{" "}
                                        {strings.Cancel}
                                      </Button>
                                    </FormGroup>
                                  </Col>
                                </Row>

                                {parseFloat(
                                  parseFloat(initValue.totalAmount).toFixed(2)
                                ) > this.state.remainingInvoiceAmount &&
                                  !isCreatedWIWP && (
                                    <div style={{ color: "red" }}>
                                      Remaining Invoice Amount cananot less than
                                      Total Amount sdgsdg
                                      {this.state.isCreatedWithoutInvoice}
                                    </div>
                                  )}
                              </Form>
                            )}
                          </Formik>
                        </Col>
                      </Row>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
        {this.state.disableLeavePage ? "" : <LeavePage />}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCreditNote);
