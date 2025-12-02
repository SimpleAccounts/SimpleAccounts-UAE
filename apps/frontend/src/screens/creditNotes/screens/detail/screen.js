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
  UncontrolledTooltip,
} from "reactstrap";
import { Checkbox } from "@material-ui/core";
import Select from "react-select";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import DatePicker from "react-datepicker";
import { Formik, Field } from "formik";
import Switch from "react-switch";
import * as Yup from "yup";
import * as CreditNotesDetailActions from "./actions";
import * as ProductActions from "../../../product/actions";
import * as CreditNotesActions from "../../actions";
import * as CurrencyConvertActions from "../../../currencyConvert/actions";
import { CustomerModal, ProductModal } from "../../sections";
import {
  LeavePage,
  Loader,
  ConfirmDeleteModal,
  ProductTableCalculation,
  TotalCalculation,
  ProductTable,
} from "components";
import "react-datepicker/dist/react-datepicker.css";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { CommonActions } from "services/global";
import { selectCurrencyFactory, selectOptionsFactory } from "utils";
import "./style.scss";
import moment from "moment";
import { data } from "../../../Language/index";
import LocalizedStrings from "react-localization";
import { TextareaAutosize, TextField } from "@material-ui/core";

const mapStateToProps = (state) => {
  return {
    project_list: state.customer_invoice.project_list,
    contact_list: state.customer_invoice.contact_list,
    currency_list: state.customer_invoice.currency_list,
    vat_list: state.customer_invoice.vat_list,
    product_list: state.customer_invoice.product_list,
    excise_list: state.customer_invoice.excise_list,
    customer_list: state.customer_invoice.customer_list,
    country_list: state.customer_invoice.country_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    currencyConvertActions: bindActionCreators(
      CurrencyConvertActions,
      dispatch
    ),
    creditNotesActions: bindActionCreators(CreditNotesActions, dispatch),
    creditNotesDetailActions: bindActionCreators(
      CreditNotesDetailActions,
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

let strings = new LocalizedStrings(data);
class DetailCreditNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      loading: true,
      dialog: false,
      disabled: false,
      disabled1: false,
      discountOptions: [
        { value: "FIXED", label: "Fixed" },
        { value: "PERCENTAGE", label: "Percentage" },
      ],
      exciseTypeOption: [
        { value: "Inclusive", label: "Inclusive" },
        { value: "Exclusive", label: "Exclusive" },
      ],
      discount_option: "",
      data: [],
      current_customer_id: null,
      initValue: {},
      contactType: 2,
      openCustomerModal: false,
      openProductModal: false,
      selectedContact: "",
      term: "",
      placeOfSupplyId: "",
      selectedType: "",
      discountPercentage: "",
      discountAmount: 0,
      fileName: "",
      basecurrency: [],
      customer_currency: "",
      loadingMsg: "Loading...",
      showInvoiceNumber: false,
      disableLeavePage: false,
      invoiceSelected: false,
      isupdateCN: true,
    };

    // this.options = {
    //   paginationPosition: 'top'
    // }
    this.formRef = React.createRef();
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
    this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

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
  }

  componentDidMount = () => {
    this.initializeData();
  };
  salesCategory = () => {
    try {
      this.props.productActions
        .getTransactionCategoryListForSalesProduct("2")
        .then((res) => {
          if (res.status === 200) {
            this.setState({ salesCategory: res.data });
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  initializeData = () => {
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

    if (this.props.location.state && this.props.location.state.id) {
      //INV number
      this.props.creditNotesActions
        .getInvoicesForCNById(this.props.location.state.id)
        .then((res) => {
          if (res.status === 200) {
            if (res.data.length && res.data.length != 0) {
              this.setState({
                invoiceNumber: res.data[0].invoiceNumber,
                showInvoiceNumber: true,
              });
            }
          }
        });
      //CN details
      this.props.creditNotesDetailActions
        .getCreditNoteById(
          this.props.location.state.id,
          this.props.location.state.isCNWithoutProduct
            ? this.props.location.state.isCNWithoutProduct
            : false
        )
        .then((res) => {
          if (res.status === 200) {
            this.getCompanyCurrency();
            this.props.creditNotesActions.getVatList();
            this.props.creditNotesActions
              .getCustomerList(this.state.contactType)
              .then((response) => {
                if (response.status === 200)
                  this.getCurrency(res.data.contactId);
              });
            this.props.creditNotesActions.getExciseList();
            this.props.creditNotesActions.getCountryList();
            this.props.creditNotesActions.getProductList();

            this.setState(
              {
                taxType: res.data.taxType ? res.data.taxType : false,
                isCreatedWithoutInvoice: res.data.invoiceId ? false : true,
                current_customer_id: this.props.location.state.id,
                initValue: {
                  receiptAttachmentDescription: res.data
                    .receiptAttachmentDescription
                    ? res.data.receiptAttachmentDescription
                    : "",
                  receiptNumber: res.data.referenceNo
                    ? res.data.referenceNo
                    : "",
                  contact_po_number: res.data.contactPoNumber
                    ? res.data.contactPoNumber
                    : "",
                  currency: res.data.currencyCode ? res.data.currencyCode : "",
                  currencyCode: res.data.currencyCode
                    ? res.data.currencyCode
                    : "",
                  exchangeRate: res.data.exchangeRate
                    ? res.data.exchangeRate
                    : "",
                  currencyName: res.data.currencyName
                    ? res.data.currencyName
                    : "",
                  // invoiceDueDate: res.data.invoiceDueDate
                  // 	? moment(res.data.invoiceDueDate).format('DD-MM-YYYY')
                  // 	: '',
                  invoiceDate: res.data.creditNoteDate
                    ? res.data.creditNoteDate
                    : "",
                  contactId: res.data.contactId ? res.data.contactId : "",
                  project: res.data.projectId ? res.data.projectId : "",
                  invoice_number: res.data.creditNoteNumber
                    ? res.data.creditNoteNumber
                    : "",
                  totalNet: 0,
                  invoiceVATAmount: res.data.totalVatAmount
                    ? res.data.totalVatAmount
                    : 0,
                  totalAmount: res.data.totalAmount ? res.data.totalAmount : 0,
                  creditAmount: res.data.totalAmount ? res.data.totalAmount : 0,
                  notes: res.data.notes ? res.data.notes : "",
                  lineItemsString: res.data.invoiceLineItems
                    ? res.data.invoiceLineItems
                    : [],
                  discount: res.data.discount ? res.data.discount : 0,
                  discountPercentage: res.data.discountPercentage
                    ? res.data.discountPercentage
                    : "",
                  discountType: res.data.discountType
                    ? res.data.discountType
                    : "",
                  term: res.data.term ? res.data.term : "",
                  placeOfSupplyId: res.data.placeOfSupplyId
                    ? res.data.placeOfSupplyId
                    : "",
                  fileName: res.data.fileName ? res.data.fileName : "",
                  // filePath: res.data.filePath ? res.data.filePath : '',
                  totalExciseAmount: res.data.totalExciseTaxAmount
                    ? res.data.totalExciseTaxAmount
                    : 0,
                },
                isCreatedWIWP:
                  res.data.invoiceLineItems &&
                  res.data.invoiceLineItems?.length > 0
                    ? false
                    : true,
                invoiceSelected: res.data.invoiceId ? true : false,
                customer_taxTreatment_des: res.data.taxTreatment
                  ? res.data.taxTreatment
                  : "",
                checked: res.data.exciseType
                  ? res.data.exciseType
                  : res.data.exciseType,
                discountAmount: res.data.discount ? res.data.discount : 0,
                totalExciseAmount: res.data.totalExciseTaxAmount
                  ? res.data.totalExciseTaxAmount
                  : 0,
                discountPercentage: res.data.discountPercentage
                  ? res.data.discountPercentage
                  : "",
                data: res.data.invoiceLineItems
                  ? res.data.invoiceLineItems
                  : [],
                selectedContact: res.data.contactId ? res.data.contactId : "",
                term: res.data.term ? res.data.term : "",
                placeOfSupplyId: res.data.placeOfSupplyId
                  ? res.data.placeOfSupplyId
                  : "",
                remainingInvoiceAmount: res.data.remainingInvoiceAmount,
                loading: false,
              },
              () => {
                if (this.state.data.length > 0) {
                  this.updateAmount(this.state.data);
                  const { data } = this.state;
                  const idCount =
                    data.length > 0
                      ? Math.max.apply(
                          Math,
                          data.map((item) => {
                            return item.id;
                          })
                        )
                      : 0;
                  this.setState({
                    idCount,
                  });
                } else {
                  this.setState({
                    idCount: 0,
                  });
                }
              }
            );

            if (res.data.invoiceId) {
              this.props.creditNotesDetailActions
                .getCreditNoteById(this.props.location.state.id, false)
                .then((response) => {
                  const customerdetails = {
                    label:
                      response.data.contactName === ""
                        ? response.data.organisationName
                        : response.data.contactName,
                    value: response.data.contactId,
                  };
                  this.setState(
                    {
                      creditnoteID: this.props.location?.state?.creditnoteID,
                      isupdateCN: false,
                      option: {
                        label:
                          response.data.contactName === ""
                            ? response.data.organisationName
                            : response.data.contactName,
                        value: response.data.contactId,
                      },
                      data: response.data.invoiceLineItems,
                      totalAmount: response.data.totalAmount,
                      customer_currency: response.data.currencyCode,
                      remainingInvoiceAmount:
                        response.data.remainingInvoiceAmount,

                      //	data1:response.data.supplierId,
                    },
                    () => {
                      if (this.state.data && this.state.data.length > 1) {
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
                      // this.formRef.current.setFieldValue(

                      // 	totalAmount,
                      // 	true,
                      // );
                    }
                    // () => {
                    // 	this.formRef.current.setFieldValue('supplierId',
                    // 	this.state.option.value,
                    // 	true,)
                    // },
                  );
                  this.formRef.current.setFieldValue(
                    "currency",
                    this.getCurrency(customerdetails.value),
                    true
                  );
                  this.formRef.current.setFieldValue(
                    "taxTreatmentid",
                    this.getTaxTreatment(customerdetails.value),
                    true
                  );
                  this.setExchange(this.getCurrency(customerdetails.value));
                  this.formRef.current.setFieldValue(
                    "contactId",
                    this.state.option,
                    true
                  );
                  this.formRef.current.setFieldValue(
                    "remainingInvoiceAmount",
                    this.state.remainingInvoiceAmount,
                    true
                  );
                  this.formRef.current.setFieldValue(
                    "currencyCode",
                    this.state.customer_currency,
                    true
                  );
                  this.getTaxTreatment(this.state.option.value);
                  this.formRef.current.setFieldValue(
                    "invoiceNumber",
                    {
                      value: res.data.invoiceId,
                      label: res.data.invoiceNumber,
                    },
                    true
                  );
                });
            }
          }
        });
    } else {
      this.props.history.push("/admin/income/credit-notes");
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
          subTotal: 0,
          productId: "",
          discountType: "FIXED",
          exciseTaxId: "",
          vatAmount: 0,
          discount: 0,
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
      }
    );
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
      data: list.data,
      initValue: {
        ...this.state.initValue,
        ...{
          totalNet: list.totalNet ? list.totalNet : 0,
          invoiceVATAmount: list.totalVatAmount ? list.totalVatAmount : 0,
          totalAmount: list.totalAmount ? list.totalAmount : 0,
          totalExciseAmount: list.totalExciseAmount
            ? list.totalExciseAmount
            : 0,
          discount: list.discount ? list.discount : 0,
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
  getInvoiceDetails = (value) => {
    if (value) {
      this.props.creditNotesActions.getInvoiceById(value).then((response) => {
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
            this.getCurrency(customerdetails.value),
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
          this.setExchange(this.getCurrency(customerdetails.value));
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
            this.state.customer_currency,
            true
          );
          this.getCurrency(this.state.option.value);
          this.getTaxTreatment(this.state.option.value);
        }
      });
    }
  };
  handleSubmit = (data) => {
    this.setState({ disabled: true, disableLeavePage: true });
    const { current_customer_id, isCreatedWIWP } = this.state;
    const {
      receiptAttachmentDescription,
      receiptNumber,
      contact_po_number,
      currency,
      invoiceDate,
      contactId,
      invoice_number,
      notes,
      creditAmount,
      email,
      exchangeRate,
      lineItemsString,
      invoiceNumber,
      placeOfSupplyId,
    } = data;
    let formData = new FormData();
    formData.append("email", email ? email : "");
    formData.append("type", 7);
    formData.append("creditNoteId", current_customer_id);
    formData.append(
      "creditNoteNumber",
      invoice_number !== null ? invoice_number : ""
    );
    formData.append(
      "creditNoteDate",
      invoiceDate ? moment(invoiceDate) : new Date()
    );
    formData.append("vatCategoryId", 2);
    formData.append("exchangeRate", exchangeRate);
    formData.append("referenceNo", receiptNumber !== null ? receiptNumber : "");
    formData.append(
      "contactPoNumber",
      contact_po_number !== null ? contact_po_number : ""
    );
    formData.append(
      "receiptAttachmentDescription",
      receiptAttachmentDescription !== null ? receiptAttachmentDescription : ""
    );
    formData.append("notes", notes !== null ? notes : "");
    formData.append(
      "isCreatedWithoutInvoice",
      this.state.isCreatedWithoutInvoice
    );
    formData.append("isCreatedWIWP", isCreatedWIWP);
    formData.append("taxType", this.state.taxType ? this.state.taxType : false);

    if (invoiceNumber) {
      formData.append(
        "invoiceId",
        invoiceNumber.value ? invoiceNumber.value : invoiceNumber
      );
      formData.append("cnCreatedOnPaidInvoice", "1");
    }
    if (isCreatedWIWP == true) formData.append("totalAmount", creditAmount);
    else {
      formData.append("lineItemsString", JSON.stringify(this.state.data));
      formData.append("totalVatAmount", this.state.initValue.invoiceVATAmount);
      formData.append("totalAmount", this.state.initValue.totalAmount);
      formData.append(
        "totalExciseAmount",
        this.state.initValue.totalExciseAmount
      );
      formData.append("discount", this.state.initValue.discount);
      formData.append(
        "totalExciseTaxAmount",
        this.state.initValue.totalExciseAmount
      );
    }
    if (contactId) {
      formData.append(
        "contactId",
        contactId ? (contactId.value ? contactId.value : contactId) : ""
      );
    }
    if (placeOfSupplyId) {
      formData.append(
        "placeOfSupplyId",
        placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId
      );
    }
    if (currency) {
      formData.append(
        "currencyCode",
        currency.value ? currency.value : currency
      );
    }
    this.setState({ loading: true, loadingMsg: "Updating Credit Note..." });
    this.props.creditNotesDetailActions
      .UpdateCreditNotes(formData)
      .then((res) => {
        this.setState({ disabled: false });
        this.props.commonActions.tostifyAlert(
          "success",
          res.data ? res.data.message : "Credit Note Updated Successfully"
        );
        this.props.history.push("/admin/income/credit-notes");
        this.setState({ loading: false });
      })
      .catch((err) => {
        this.setState({
          loading: false,
          disabled: false,
          disableLeavePage: false,
        });
        this.props.commonActions.tostifyAlert(
          "error",
          "Credit Note Updated Unsuccessfully"
        );
        this.initializeData();
      });
  };

  openCustomerModal = (e) => {
    e.preventDefault();
    this.setState({ openCustomerModal: true });
  };
  openProductModal = (props) => {
    this.setState({ openProductModal: true });
  };

  getCurrentUser = (data) => {
    let option;
    if (data.label || data.value) {
      option = data;
    } else {
      option = {
        label: `${data.fullName}`,
        value: data.id,
      };
    }
    // this.setState({
    //   selectedContact: option
    // })
    this.formRef.current.setFieldValue("contactId", option.value, true);
  };

  closeCustomerModal = (res) => {
    if (res) {
      this.props.creditNotesActions.getCustomerList(this.state.contactType);
    }
    this.setState({ openCustomerModal: false });
  };

  closeProductModal = (res) => {
    this.setState({ openProductModal: false });
  };

  getCurrentProduct = () => {
    this.props.creditNotesActions.getProductList().then((res) => {
      this.setState(
        {
          data: [
            {
              id: 0,
              description: res.data[0].description,
              quantity: 1,
              unitPrice: res.data[0].unitPrice,
              vatCategoryId: res.data[0].vatCategoryId,
              discountType: res.data[0].discountType,
              subTotal: res.data[0].unitPrice,
              productId: res.data[0].id,
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
        `lineItemsString.${0}.quantity`,
        1,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.unitType`,
        res.data[0].unitType,
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
        res.data[0].id,
        true
      );
    });
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
    let result = this.props.currency_convert_list.filter((obj) => {
      return obj.currencyCode === value;
    });
    this.formRef.current.setFieldValue(
      "exchangeRate",
      result && result.length > 0 ? result[0].exchangeRate : "",
      true
    );
  };

  deleteInvoice = () => {
    const message1 = (
      <text>
        <b>Delete Tax Credit Note?</b>
      </text>
    );
    const message =
      "This Tax Credit Note  will be deleted permanently and cannot be recovered. ";
    this.setState({
      dialog: (
        <ConfirmDeleteModal
          isOpen={true}
          okHandler={this.removeInvoice}
          cancelHandler={this.removeDialog}
          message={message}
          message1={message1}
        />
      ),
    });
  };

  removeInvoice = () => {
    this.setState({ disabled1: true, disableLeavePage: true });
    const { current_customer_id } = this.state;
    this.props.creditNotesDetailActions
      .deleteCN(current_customer_id)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            "success",
            (res.data = "Tax Credit Note Deleted Successfully")
          );
          this.props.history.push("/admin/income/credit-notes");
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          (err.data = "Tax Credit Note Deleted Unsuccessfully")
        );
      });
  };

  removeDialog = () => {
    this.setState({
      dialog: null,
    });
  };

  getCurrency = (opt) => {
    let customer_currencyCode = 0;
    let customer_item_currency = "";
    this.props.customer_list.map((item) => {
      if (item.label.contactId == opt) {
        this.setState({
          customer_currency: item.label.currency.currencyCode,
          customer_currency_des: item.label.currency.currencyName,
          customer_currency_symbol: item.label.currency.currencyIsoCode,
        });

        customer_currencyCode = item.label.currency.currencyCode;
        customer_item_currency = item.label.currency;
      }
    });

    return customer_currencyCode;
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
  showInvoiceNumber = (props) => {
    return (
      this.state.showInvoiceNumber && (
        <Col lg={3}>
          <FormGroup className="mb-3">
            <Label htmlFor="project">
              <span className="text-danger">* </span>
              {strings.InvoiceNumber}
            </Label>
            <Input
              disabled
              id="invoiceNumber"
              name="invoiceNumber"
              value={
                props.values.invoiceNumber?.label
                  ? props.values.invoiceNumber?.label
                  : props.values.invoiceNumber
              }
            />
          </FormGroup>
        </Col>
      )
    );
  };
  
  render() {
    strings.setLanguage(this.state.language);
    const {
      data,
      isCreatedWIWP,
      initValue,
      loading,
      dialog,
      isRegisteredVat,
      idCount,
    } = this.state;
    const {
      excise_list,
      product_list,
      currency_convert_list,
      customer_list,
      universal_currency_list,
      vat_list,
    } = this.props;
    const { loadingMsg, taxTreatmentList } = this.state;
    let tmpCustomer_list = [];

    customer_list.map((item) => {
      let obj = { label: item.label.contactName, value: item.value };
      tmpCustomer_list.push(obj);
    });

    return loading == true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div>
        <div className="detail-customer-invoice-screen">
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
                            {strings.UpdateCreditNote}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    {dialog}
                    {loading ? (
                      <Loader />
                    ) : (
                      <Row>
                        <Col lg={12}>
                          <Formik
                            initialValues={this.state.initValue}
                            ref={this.formRef}
                            onSubmit={(values, { resetForm }) => {
                              this.handleSubmit(values);
                            }}
                            validate={(values) => {
                              let errors = {};
                              if (
                                this.state.remainingInvoiceAmount &&
                                this.state.initValue.totalAmount >
                                  this.state.remainingInvoiceAmount
                              ) {
                                errors.remainingInvoiceAmount =
                                  "The amount of the credit note cannot exceed the amount of the invoice";
                              }
                              if (
                                this.state.remainingInvoiceAmount &&
                                values.creditAmount >
                                  this.state.remainingInvoiceAmount
                              ) {
                                errors.remainingInvoiceAmount =
                                  "The amount of the credit note cannot exceed the amount of the invoice";
                              }
                              return errors;
                            }}
                            validationSchema={Yup.object().shape({
                              // invoiceNumber: Yup.string().required(
                              // 	'Invoice Number is required',
                              // ),
                              invoice_number: Yup.string().required(
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
                              invoiceDate: Yup.string().required(
                                "Tax credit note date is required"
                              ),
                              creditAmount: Yup.string()
                                .required(strings.AmountIsRequired)
                                .test(
                                  "Credit Amount",
                                  "Credit amount should be greater than 0",
                                  (value) => {
                                    if (value > 0) {
                                      return true;
                                    } else {
                                      return false;
                                    }
                                  }
                                ),
                              lineItemsString: Yup.array().of(
                                Yup.object().shape({
                                  quantity: Yup.string()
                                    // .required('Quantity is required')
                                    .test(
                                      "quantity",
                                      "Quantity should be greater than 0",
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
                               
                                <Row>{this.showInvoiceNumber(props)} </Row>
                                <Row>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="invoice_number">
                                        <span className="text-danger">* </span>
                                        {strings.CreditNoteNumber}
                                      </Label>
                                      <Input
                                        type="text"
                                        id="invoice_number"
                                        name="invoice_number"
                                        placeholder=""
                                        disabled
                                        value={props.values.invoice_number}
                                        onChange={(value) => {
                                          props.handleChange("invoice_number")(
                                            value
                                          );
                                        }}
                                        className={
                                          props.errors.invoice_number &&
                                          props.touched.invoice_number
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.invoice_number &&
                                        props.touched.invoice_number && (
                                          <div className="invalid-feedback">
                                            {props.errors.invoice_number}
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
                                        styles={customStyles}
                                        id="contactId"
                                        name="contactId"
                                        isDisabled={
                                          this.state.showInvoiceNumber
                                        }
                                        options={
                                          tmpCustomer_list
                                            ? selectOptionsFactory.renderOptions(
                                                "label",
                                                "value",
                                                tmpCustomer_list,
                                                "Customer"
                                              )
                                            : []
                                        }
                                        value={
                                          props.values.contactId?.value
                                            ? props.values.contactId
                                            : tmpCustomer_list &&
                                              tmpCustomer_list.find(
                                                (option) =>
                                                  option.value ===
                                                  +props.values.contactId
                                              )
                                        }
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            this.formRef.current.setFieldValue(
                                              "currency",
                                              this.getCurrency(option.value),
                                              true
                                            );
                                            this.formRef.current.setFieldValue(
                                              "taxTreatmentid",
                                              this.getTaxTreatment(
                                                option.value
                                              ),
                                              true
                                            );
                                            this.setExchange(
                                              this.getCurrency(option.value)
                                            );
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
                                                          .placeOfSupplyId
                                                        ? this.state
                                                            .placeOfSupplyId
                                                        : this.state
                                                            .placeOfSupplyId
                                                      : props.values.placeOfSupplyId.toString())
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
                                        id="invoiceDate"
                                        name="invoiceDate"
                                        placeholderText={
                                          strings.Select +
                                          strings.CreditNoteDate
                                        }
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="dd-MM-yyyy"
                                        minDate={new Date()}
                                        dropdownMode="select"
                                        value={moment(
                                          props.values.invoiceDate
                                        ).format("DD-MM-YYYY")}
                                        onChange={(value) => {
                                          props.handleChange("invoiceDate")(
                                            value
                                          );
                                        }}
                                        className={`form-control ${
                                          props.errors.invoiceDate &&
                                          props.touched.invoiceDate
                                            ? "is-invalid"
                                            : ""
                                        }`}
                                      />
                                      {props.errors.invoiceDate &&
                                        props.touched.invoiceDate && (
                                          <div className="invalid-feedback">
                                            {props.errors.invoiceDate}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>

                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="currencyCode">
                                        <span className="text-danger">* </span>
                                        {strings.Currency}
                                      </Label>
                                      <Select
                                        isDisabled={true}
                                        styles={customStyles}
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
                                        id="currencyCode"
                                        name="currencyCode"
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
                                                +props.values.currencyCode
                                            )
                                        }
                                        onChange={(option) =>
                                          props.handleChange("currencyCode")(
                                            option.value
                                          )
                                        }
                                        className={`${
                                          props.errors.currencyCode &&
                                          props.touched.currency
                                            ? "is-invalid"
                                            : ""
                                        }`}
                                      />
                                      {props.errors.currencyCode &&
                                        props.touched.currencyCode && (
                                          <div className="invalid-feedback">
                                            {props.errors.currencyCode}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>

                                  {this.state.invoiceSelected && (
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

                                  {isCreatedWIWP && (
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
                                {!isCreatedWIWP &&
                                  props.values.lineItemsString?.length > 0 && (
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
                                        {props.errors.lineItemsString &&
                                          typeof props.errors
                                            .lineItemsString === "string" && (
                                            <div
                                              className={
                                                props.errors.lineItemsString
                                                  ? "is-invalid"
                                                  : ""
                                              }
                                            >
                                              <div className="invalid-feedback">
                                                {props.errors.lineItemsString}
                                              </div>
                                            </div>
                                          )}
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
                                              this.setState({
                                                idCount: idCount,
                                              });
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
                                {this.state.invoiceNumber ? (
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
                                          rows="1"
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
                                          //style={{ width: "700px" }}
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
                                    <FormGroup>
                                      <Button
                                        type="button"
                                        color="danger"
                                        className="btn-square"
                                        disabled1={this.state.disabled1}
                                        onClick={this.deleteInvoice}
                                      >
                                        <i className="fa fa-trash"></i>{" "}
                                        {this.state.disabled1
                                          ? "Deleting..."
                                          : strings.Delete}
                                      </Button>
                                    </FormGroup>
                                    <FormGroup className="text-right">
                                      <Button
                                        type="submit"
                                        color="primary"
                                        className="btn-square mr-3"
                                        disabled={this.state.disabled}
                                        onClick={() => {
                                          //	added validation popup	msg
                                          console.log(props.errors, "ERROR");
                                          props.handleBlur();
                                          if (
                                            props.errors &&
                                            Object.keys(props.errors).length !=
                                              0
                                          )
                                            this.props.commonActions.fillManDatoryDetails();
                                        }}
                                      >
                                        <i className="fa fa-dot-circle-o"></i>{" "}
                                        {this.state.disabled
                                          ? "Updating..."
                                          : strings.Update}
                                        {/* { {this.state.disabled }
																				? 'Updating...'
																				{ : 'Update'} } */}
                                      </Button>
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
                                                isCNWithoutProduct:
                                                  this.props.location.state
                                                    .isCNWithoutProduct,
                                              }
                                            );
                                          } else
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
          <CustomerModal
            openCustomerModal={this.state.openCustomerModal}
            closeCustomerModal={(e) => {
              this.closeCustomerModal(e);
            }}
            getCurrentUser={(e) => this.getCurrentUser(e)}
            createCustomer={this.props.creditNotesActions.createCustomer}
            currency_list={this.props.currency_list}
            country_list={this.props.country_list}
            getStateList={this.props.creditNotesActions.getStateList}
          />
          <ProductModal
            openProductModal={this.state.openProductModal}
            closeProductModal={(e) => {
              this.closeProductModal(e);
            }}
            getCurrentProduct={(e) => this.getCurrentProduct(e)}
            createProduct={this.props.productActions.createAndSaveProduct}
            vat_list={this.props.vat_list}
            product_category_list={this.props.product_category_list}
            salesCategory={this.state.salesCategory}
            purchaseCategory={this.state.purchaseCategory}
          />
        </div>
        {this.state.disableLeavePage ? "" : <LeavePage />}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailCreditNote);
