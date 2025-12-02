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
import Select from "react-select";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import DatePicker from "react-datepicker";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import * as SupplierInvoiceDetailActions from "./actions";
import * as SupplierInvoiceActions from "../../actions";
import * as QuotationDetailsAction from "./actions";
import * as RequestForQuotationAction from "../../actions";
import * as ProductActions from "../../../product/actions";
import { SupplierModal } from "../../sections";
import { ProductModal } from "../../../customer_invoice/sections";
import { LeavePage, Loader, ConfirmDeleteModal } from "components";
import * as CurrencyConvertActions from "../../../currencyConvert/actions";
import "react-datepicker/dist/react-datepicker.css";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { CommonActions } from "services/global";
import {
  optionFactory,
  selectCurrencyFactory,
  selectOptionsFactory,
} from "utils";
import "./style.scss";
import moment from "moment";
import Switch from "react-switch";
import { data } from "../../../Language/index";
import LocalizedStrings from "react-localization";
import { TextField } from "@material-ui/core";

const mapStateToProps = (state) => {
  return {
    project_list: state.request_for_quotation.project_list,
    contact_list: state.request_for_quotation.contact_list,
    currency_list: state.request_for_quotation.currency_list,
    product_list: state.customer_invoice.product_list,
    excise_list: state.request_for_quotation.excise_list,
    supplier_list: state.request_for_quotation.supplier_list,
    country_list: state.request_for_quotation.country_list,
    product_category_list: state.product.product_category_list,
    universal_currency_list: state.common.universal_currency_list,
    currency_convert_list: state.common.currency_convert_list,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    supplierInvoiceActions: bindActionCreators(
      SupplierInvoiceActions,
      dispatch
    ),
    ProductActions: bindActionCreators(ProductActions, dispatch),
    supplierInvoiceDetailActions: bindActionCreators(
      SupplierInvoiceDetailActions,
      dispatch
    ),

    quotationDetailsAction: bindActionCreators(
      QuotationDetailsAction,
      dispatch
    ),
    requestForQuotationAction: bindActionCreators(
      RequestForQuotationAction,
      dispatch
    ),
    commonActions: bindActionCreators(CommonActions, dispatch),
    currencyConvertActions: bindActionCreators(
      CurrencyConvertActions,
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
class DetailQuotation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dialog: false,
      supplier_currency_symbol: "",
      exchangeRate: 1,
      discountOptions: [
        { value: "FIXED", label: "Fixed" },
        { value: "PERCENTAGE", label: "%" },
      ],
      discount_option: "",
      data: [],
      initValue: {},
      contactType: 2,
      openSupplierModal: false,
      openProductModal: false,
      selectedContact: "",
      current_supplier_id: null,
      term: "",
      placeOfSupply: "",
      selectedType: "",
      discountPercentage: "",
      discountAmount: 0,
      fileName: "",
      purchaseCategory: [],
      basecurrency: [],
      income: true,
      supplier_currency: "",
      disabled: false,
      disabled1: false,
      dateChanged: "",
      dateChanged1: false,
      vat_list: [],
      isDesignatedZone: false,
      isRegisteredVat: false,
      quotationDateForVatValidation: new Date(),
      producttype: [],
      loadingMsg: "Loading",
      disableLeavePage: false,

      language: window["localStorage"].getItem("language"),
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
    this.regEx = /^[0-9\b]+$/;
    this.regExInvNum = /[a-zA-Z0-9,-/ ]+$/;
    this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
  }

  // renderActions  = (cell, row) => {
  //   return (
  //     <Button
  //       size="sm"
  //       color="primary"
  //       className="btn-brand icon"
  //     >
  //       <i className="fas fa-trash"></i>
  //     </Button>
  //   )
  // }

  componentDidMount = () => {
    this.props.requestForQuotationAction.getVatList().then((res) => {
      if (res.status === 200) this.setState({ vat_list: res.data });
    });
    if (this.props.location.state && this.props.location.state.contactData)
      this.getCurrentUser(this.props.location.state.contactData);
    this.initializeData();
    this.getCompanyType();
  };

  initializeData = () => {
    if (this.props.location.state && this.props.location.state.id) {
      this.props.quotationDetailsAction
        .getQuotationById(this.props.location.state.id)
        .then((res) => {
          if (res.status === 200) {
            this.getCompanyCurrency();

            this.props.requestForQuotationAction.getSupplierList(
              this.state.contactType
            );
            this.props.requestForQuotationAction.getExciseList();
            this.props.requestForQuotationAction.getCountryList();
            this.props.requestForQuotationAction.getProductList();
            this.purchaseCategory();
            this.setState(
              {
                current_po_id: this.props.location.state.id,
                initValue: {
                  quotaionExpiration: res.data.quotaionExpiration
                    ? moment(res.data.quotaionExpiration).format("DD-MM-YYYY")
                    : "",
                  quotaionExpiration1: res.data.quotaionExpiration
                    ? res.data.quotaionExpiration
                    : "",
                  quotationdate: res.data.quotationdate
                    ? moment(res.data.quotationdate).format("DD-MM-YYYY")
                    : "",
                  quotationdate1: res.data.quotationdate
                    ? res.data.quotationdate
                    : "",
                  attachmentDescription: res.data.attachmentDescription
                    ? res.data.attachmentDescription
                    : "",
                  customerId: res.data.customerId ? res.data.customerId : "",
                  quotationNumber: res.data.quotationNumber
                    ? res.data.quotationNumber
                    : "",
                  receiptNumber: res.data.receiptNumber
                    ? res.data.receiptNumber
                    : "",
                  totalVatAmount: res.data.totalVatAmount
                    ? res.data.totalVatAmount
                    : 0,
                  totalAmount: res.data.totalAmount ? res.data.totalAmount : 0,
                  total_net: 0,
                  notes: res.data.notes ? res.data.notes : "",
                  lineItemsString: res.data.poQuatationLineItemRequestModelList
                    ? res.data.poQuatationLineItemRequestModelList
                    : [],
                  placeOfSupplyId: res.data.placeOfSupplyId
                    ? res.data.placeOfSupplyId
                    : "",
                  total_excise: res.data.totalExciseAmount
                    ? res.data.totalExciseAmount
                    : "",
                  discount: res.data.discount ? res.data.discount : 0,
                  exchangeRate: res.data.exchangeRate
                    ? res.data.exchangeRate
                    : 1,
                  discountPercentage: res.data.discountPercentage
                    ? res.data.discountPercentage
                    : 0,
                  discountType: res.data.discountType
                    ? res.data.discountType
                    : "",
                  taxType: res.data.taxType ? true : false,
                  currency: res.data.currencyCode ? res.data.currencyCode : '',
                },
                quotaionExpirationNotChanged: res.data.quotaionExpiration
                  ? moment(res.data.quotaionExpiration)
                  : "",
                quotaionExpiration: res.data.quotaionExpiration
                  ? res.data.quotaionExpiration
                  : "",
                taxType: res.data.taxType ? true : false,
                customer_taxTreatment_des: res.data.taxtreatment
                  ? res.data.taxtreatment
                  : "",
                placeOfSupplyId: res.data.placeOfSupplyId
                  ? res.data.placeOfSupplyId
                  : "",
                total_excise: res.data.totalExciseAmount
                  ? res.data.totalExciseAmount
                  : "",
                data: res.data.poQuatationLineItemRequestModelList
                  ? res.data.poQuatationLineItemRequestModelList
                  : [],
                quotationDateForVatValidation: res.data.quotationdate
                  ? new Date(res.data.quotationdate)
                  : new Date(),
                selectedContact: res.data.customerId ? res.data.customerId : "",
                discountAmount: res.data.discount ? res.data.discount : 0,
                discountPercentage: res.data.discountPercentage
                  ? res.data.discountPercentage
                  : 0,
                loading: false,
                discountEnabled: res.data.discount > 0 ? true : false,
                supplier_currency_symbol: res.data.currencyIsoCode ? res.data.currencyIsoCode : "AED",
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
                          if (item['productId'])
                            this.getProductType(item['productId'])
                          return item.id;
                        })
                      )
                      : 0;
                  this.setState({
                    idCount: idCount,
                  });
                  this.addRow();
                } else {
                  this.setState({
                    idCount: 0,
                  });
                }
              }
            );
            this.formRef.current.setFieldValue("currency", res.data.currencyCode ? res.data.currencyCode : '', true);
            this.salesCategory();
          }
        });
    } else {
      this.props.history.push("/admin/income/quotation");
    }
  };

  exchangeRaterevalidate = (exc) => {
    let local = [...this.state.data];
    var { product_list } = this.props;

    let local2 = local.map((obj, index) => {
      const result = product_list.find((item) => item.id === obj.productId);
      return {
        ...obj,
        unitPrice: result
          ? (parseFloat(result.unitPrice) * (1 / exc)).toFixed(2)
          : 0,
      };
    });

    this.setState({ data: local2 }, () => {
      this.updateAmount(local2);
      if (this.checkedRow()) this.addRow();
    });
  };

  purchaseCategory = () => {
    try {
      this.props.ProductActions.getTransactionCategoryListForPurchaseProduct(
        "10"
      ).then((res) => {
        if (res.status === 200) {
          this.setState(
            {
              purchaseCategory: res.data,
            },
            () => { }
          );
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  calTotalNet = (data) => {
    let total_net = 0;
    data.map((obj) => {
      if (obj.isExciseTaxExclusive === false) {
        total_net = +(total_net + +obj.unitPrice * obj.quantity);
      } else {
        total_net = +(
          total_net +
          +(obj.unitPrice + obj.exciseAmount) * obj.quantity
        );
      }
      return obj;
    });
    this.setState({
      initValue: Object.assign(this.state.initValue, { total_net }),
    });
  };
  openProductModal = (props) => {
    this.setState({ openProductModal: true });
  };
  closeProductModal = (res) => {
    this.setState({ openProductModal: false });
  };

  getCurrentProduct = () => {
    this.props.requestForQuotationAction.getProductList().then((res) => {
      let newData = [];
      const data = this.state.data;
      newData = data.filter((obj) => obj.productId !== "");
      // props.setFieldValue('lineItemsString', newData, true);
      // this.updateAmount(newData, props);
      const idCount = this.state.idCount
        ? this.state.idCount
        : data.length > 0
          ? Math.max.apply(
            Math,
            data.map((item) => {
              return item.id;
            })
          )
          : 0;
      this.setState(
        {
          data: newData.concat({
            id: idCount + 1,
            description: res.data[0].description,
            quantity: 1,
            discount: 0,
            unitPrice: res.data[0].unitPrice,
            vatCategoryId: res.data[0].vatCategoryId,
            exciseTaxId: res.data[0].exciseTaxId,
            vatAmount: res.data[0].vatAmount ? res.data[0].vatAmount : 0,
            subTotal: res.data[0].unitPrice,
            productId: res.data[0].id,
            discountType: res.data[0].discountType,
            unitType: res.data[0].unitType,
            unitTypeId: res.data[0].unitTypeId,
          }),
          idCount: this.state.idCount + 1,
        },
        () => {
          const values = {
            values: this.state.initValue,
          };
          this.updateAmount(this.state.data, values);
          this.addRow();

          this.getProductType(res.data[0].id);
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
        `lineItemsString.${0}.discount`,
        1,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.discountType`,
        1,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.vatCategoryId`,
        res.data[0].vatCategoryId,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.exciseTaxId`,
        1,
        true
      );
      this.formRef.current.setFieldValue(
        `lineItemsString.${0}.productId`,
        res.data[0].id,
        true
      );
    });
  };

  renderDescription = (cell, row, props) => {
    let idx;
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Field
        name={`lineItemsString.${idx}.description`}
        render={({ field, form }) => (
          <Input
            type="text"
            maxLength="250"
            value={row["description"] !== "" ? row["description"] : ""}
            onChange={(e) => {
              this.selectItem(
                e.target.value,
                row,
                "description",
                form,
                field,
                props
              );
            }}
            placeholder={strings.Description}
            className={`form-control 
            ${props.errors.lineItemsString &&
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
        )}
      />
    );
  };
  salesCategory = () => {
    try {
      this.props.ProductActions.getTransactionCategoryListForSalesProduct(
        "2"
      ).then((res) => {
        if (res.status === 200) {
          this.setState(
            {
              salesCategory: res.data,
            },
            () => { }
          );
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
  renderExcise = (cell, row, props) => {
    const { excise_list } = this.props;
    let idx;
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });
    return (
      <Field
        name={`lineItemsString.${idx}.exciseTaxId`}
        render={({ field, form }) => (
          <Select
            style={customStyles}
            isDisabled={row.exciseTaxId === 0 || row.exciseTaxId === null}
            options={
              excise_list
                ? selectOptionsFactory.renderOptions(
                  "name",
                  "id",
                  excise_list,
                  "Excise"
                )
                : []
            }
            value={
              excise_list &&
              selectOptionsFactory
                .renderOptions("name", "id", excise_list, "Excise")
                .find((option) =>
                  row.exciseTaxId
                    ? option.value === +row.exciseTaxId
                    : "Select Exise"
                )
            }
            id="exciseTaxId"
            placeholder={"Select Excise"}
            onChange={(e) => {
              if (e.value === "") {
                props.setFieldValue("exciseTaxId", "");
              } else {
                this.selectItem(
                  e.value,
                  row,
                  "exciseTaxId",
                  form,
                  field,
                  props
                );
                this.updateAmount(this.state.data, props);
              }
            }}
            className={`${props.errors.lineItemsString &&
              props.errors.lineItemsString[parseInt(idx, 10)] &&
              props.errors.lineItemsString[parseInt(idx, 10)].exciseTaxId &&
              Object.keys(props.touched).length > 0 &&
              props.touched.lineItemsString &&
              props.touched.lineItemsString[parseInt(idx, 10)] &&
              props.touched.lineItemsString[parseInt(idx, 10)].exciseTaxId
              ? "is-invalid"
              : ""
              }`}
          />
        )}
      />
    );
  };
  renderQuantity = (cell, row, props) => {
    let idx;
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Field
        name={`lineItemsString.${idx}.quantity`}
        render={({ field, form }) => (
          <div>
            <div className="input-group">
              <Input
                type="text"
                min="0"
                maxLength="10"
                value={row["quantity"] !== 0 ? row["quantity"] : 0}
                onChange={(e) => {
                  if (
                    e.target.value === "" ||
                    this.regEx.test(e.target.value)
                  ) {
                    this.selectItem(
                      e.target.value,
                      row,
                      "quantity",
                      form,
                      field,
                      props
                    );
                  }
                }}
                placeholder={strings.Quantity}
                className={`form-control  w-50 
           						${props.errors.lineItemsString &&
                    props.errors.lineItemsString[parseInt(idx, 10)] &&
                    props.errors.lineItemsString[parseInt(idx, 10)]
                      .quantity &&
                    Object.keys(props.touched).length > 0 &&
                    props.touched.lineItemsString &&
                    props.touched.lineItemsString[parseInt(idx, 10)] &&
                    props.touched.lineItemsString[parseInt(idx, 10)]
                      .quantity
                    ? "is-invalid"
                    : ""
                  }`}
              />
              {row["productId"] != "" ? (
                <Input value={row["unitType"]} disabled />
              ) : (
                ""
              )}
            </div>
            {props.errors.lineItemsString &&
              props.errors.lineItemsString[parseInt(idx, 10)] &&
              props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
              Object.keys(props.touched).length > 0 &&
              props.touched.lineItemsString &&
              props.touched.lineItemsString[parseInt(idx, 10)] &&
              props.touched.lineItemsString[parseInt(idx, 10)].quantity && (
                <div className="invalid-feedback">
                  {props.errors.lineItemsString[parseInt(idx, 10)].quantity}
                </div>
              )}
          </div>
        )}
      />
    );
  };

  renderUnitPrice = (cell, row, props) => {
    let idx;
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Field
        name={`lineItemsString.${idx}.unitPrice`}
        render={({ field, form }) => (
          <>
            <Input
              type="text"
              //min="0"
              value={row["unitPrice"] !== 0 ? row["unitPrice"] : 0}
              onChange={(e) => {
                if (
                  e.target.value === "" ||
                  this.regDecimal.test(e.target.value)
                ) {
                  this.selectItem(
                    e.target.value,
                    row,
                    "unitPrice",
                    form,
                    field,
                    props
                  );
                }
              }}
              placeholder={strings.UnitPrice}
              className={`form-control 
                       ${props.errors.lineItemsString &&
                  props.errors.lineItemsString[parseInt(idx, 10)] &&
                  props.errors.lineItemsString[parseInt(idx, 10)]
                    .unitPrice &&
                  Object.keys(props.touched).length > 0 &&
                  props.touched.lineItemsString &&
                  props.touched.lineItemsString[parseInt(idx, 10)] &&
                  props.touched.lineItemsString[parseInt(idx, 10)]
                    .unitPrice
                  ? "is-invalid"
                  : ""
                }`}
            />
            {props.errors.lineItemsString &&
              props.errors.lineItemsString[parseInt(idx, 10)] &&
              props.errors.lineItemsString[parseInt(idx, 10)].unitPrice &&
              Object.keys(props.touched).length > 0 &&
              props.touched.lineItemsString &&
              props.touched.lineItemsString[parseInt(idx, 10)] &&
              props.touched.lineItemsString[parseInt(idx, 10)].unitPrice && (
                <div className="invalid-feedback">
                  {props.errors.lineItemsString[parseInt(idx, 10)].unitPrice}
                </div>
              )}
          </>
        )}
      />
    );
  };

  renderDiscount = (cell, row, props) => {
    const { discountOptions } = this.state;
    let idx;
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Field
        // name={`lineItemsString.${idx}.vatCategoryId`}
        render={({ field, form }) => (
          <div>
            <div className="input-group">
              <Input
                type="text"
                min="0"
                maxLength="14,2"
                value={row["discount"] !== 0 ? row["discount"] : 0}
                onChange={(e) => {
                  if (
                    e.target.value === "" ||
                    this.regDecimal.test(e.target.value)
                  ) {
                    this.selectItem(
                      e.target.value,
                      row,
                      "discount",
                      form,
                      field,
                      props
                    );
                  }

                  this.updateAmount(this.state.data, props);
                }}
                placeholder={strings.Discount}
                className={`form-control
           ${props.errors.lineItemsString &&
                    props.errors.lineItemsString[parseInt(idx, 10)] &&
                    props.errors.lineItemsString[parseInt(idx, 10)].discount &&
                    Object.keys(props.touched).length > 0 &&
                    props.touched.lineItemsString &&
                    props.touched.lineItemsString[parseInt(idx, 10)] &&
                    props.touched.lineItemsString[parseInt(idx, 10)].discount
                    ? "is-invalid"
                    : ""
                  }`}
              />
              <div className="dropdown open input-group-append">
                <div style={{ width: "100px" }}>
                  <Select
                    options={discountOptions}
                    id="discountType"
                    name="discountType"
                    value={
                      discountOptions &&
                      selectOptionsFactory
                        .renderOptions(
                          "label",
                          "value",
                          discountOptions,
                          "discount"
                        )
                        .find((option) => option.value == row.discountType)
                    }
                    // onChange={(item) => {
                    // 	props.handleChange(
                    // 		'discountType',
                    // 	)(item);
                    // 	props.handleChange(
                    // 		'discountPercentage',
                    // 	)('');
                    // 	props.setFieldValue(
                    // 		'discount',
                    // 		0,
                    // 	);
                    // 	this.setState(
                    // 		{
                    // 			discountPercentage: '',
                    // 			discountAmount: 0,
                    // 		},
                    // 		() => {
                    // 			this.updateAmount(
                    // 				this.state.data,
                    // 				props,
                    // 			);
                    // 		},
                    // 	);
                    // }}
                    onChange={(e) => {
                      this.selectItem(
                        e.value,
                        row,
                        "discountType",
                        form,
                        field,
                        props
                      );
                      this.updateAmount(this.state.data, props);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      />
    );
  };

  renderSubTotal = (cell, row, extraData) => {
    // return row.subTotal ? (
    // 	<Currency
    // 		value={row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
    // 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
    // 	/>
    // ) : (
    // 	''
    // );
    return row.subTotal === 0
      ? this.state.supplier_currency_symbol +
      " " +
      row.subTotal.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : this.state.supplier_currency_symbol +
      " " +
      row.subTotal.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  };

  renderVatAmount = (cell, row, extraData) => {
    // return row.subTotal === 0 ? (
    // 	<Currency
    // 		value={row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
    // 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
    // 	/>
    // ) : (
    // 	<Currency
    // 		value={row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
    // 		currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
    // 	/>
    // );
    return row.vatAmount === 0
      ? this.state.supplier_currency_symbol +
      " " +
      row.vatAmount.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      })
      : this.state.supplier_currency_symbol +
      " " +
      row.vatAmount.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      });
  };

  addRow = () => {
    const data = [...this.state.data];
    const idCount = this.state.idCount
      ? this.state.idCount
      : data.length > 0
        ? Math.max.apply(
          Math,
          data.map((item) => {
            return item.id;
          })
        )
        : 0;
    this.setState(
      {
        data: data.concat({
          id: idCount + 1,
          description: "",
          quantity: 1,
          unitPrice: "",
          vatCategoryId: "",
          subTotal: 0,
          exciseTaxId: "",
          discountType: "FIXED",
          vatAmount: 0,
          discount: 0,
          productId: "",
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
      name === "quantity" ||
      name === "exciseTaxId"
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
  getCustomerShippingAddress = (cutomerID, taxID, props) => {
    if (taxID !== 5 && taxID !== 6 && taxID !== 7) {
      this.props.quotationDetailsAction
        .getCustomerShippingAddressbyID(cutomerID)
        .then((res) => {
          if (res.status === 200) {
            var PlaceofSupply =
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
                    option.label.toUpperCase() ===
                    res.data.shippingStateName.toUpperCase()
                );
            if (PlaceofSupply) {
              props.handleChange("placeOfSupplyId")(PlaceofSupply);
              this.setState({ placeOfSupplyId: PlaceofSupply });
              this.formRef.current.setFieldValue(
                "placeOfSupplyId",
                PlaceofSupply.value,
                true
              );
            }
          }
        });
    }
  };
  getCompanyType = () => {
    this.props.quotationDetailsAction
      .getCompanyById()
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            isDesignatedZone: res.data.isDesignatedZone,
            companyVATRegistrationDate: new Date(
              moment(res.data.vatRegistrationDate).format("MM DD YYYY")
            ),
          });
          this.setState({
            isRegisteredVat: res.data.isRegisteredVat,
          });
        }
      })
      .catch((err) => {
        console.log(err, "Get Company Type Error");
      });
  };
  getProductType = (id) => {
    if (this.state.customer_taxTreatment_des) {
      const { product_list } = this.props;
      const product = product_list.find(obj => obj.id === id);
      if (product) {
        var { vat_list } = this.state;
        let pt = {};
        var vt = [];
        pt.id = product.id;
        pt.type = product.productType
        if (this.state.isRegisteredVat && (this.state.quotationDateForVatValidation > this.state.companyVATRegistrationDate)) {
          if (this.state.isDesignatedZone) {
            if (product.productType === "GOODS") {
              if (this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED FREEZONE' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED FREEZONE' || this.state.customer_taxTreatment_des === 'GCC VAT REGISTERED' || this.state.customer_taxTreatment_des === 'GCC NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'NON GCC') {
                vat_list.map(element => {
                  if (element.name == 'OUT OF SCOPE') {
                    vt.push(element);
                  }
                });
              }
              if (this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED') {
                vt = vat_list;
              }
            }
            else if (product.productType === "SERVICE") {
              if (this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED FREEZONE' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED FREEZONE') {
                vt = vat_list;
              }
              if (this.state.customer_taxTreatment_des === 'GCC VAT REGISTERED' || this.state.customer_taxTreatment_des === 'GCC NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'NON GCC') {
                vat_list.map(element => {
                  if (element.name == 'ZERO RATED TAX (0%)') {
                    vt.push(element);
                  }
                });

              }
            }
          } else {
            if (this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'UAE VAT REGISTERED FREEZONE' || this.state.customer_taxTreatment_des === 'UAE NON-VAT REGISTERED FREEZONE') {
              vt = vat_list;
            }
            if (this.state.customer_taxTreatment_des === 'GCC VAT REGISTERED' || this.state.customer_taxTreatment_des === 'GCC NON-VAT REGISTERED' || this.state.customer_taxTreatment_des === 'NON GCC') {
              vat_list.map(element => {
                if (element.name == 'ZERO RATED TAX (0%)') {
                  vt.push(element);
                }
              });

            }
          }
        } else {
          vt = [{
            "id": 10,
            "vat": 0,
            "name": "N/A"
          }];
        }
        pt.vat_list = vt;
        this.setState(prevState => ({
          producttype: [...prevState.producttype, pt]
        }));
        return pt;
      }
    }

  };
  resetVatId = (props) => {
    this.setState({
      producttype: [],
    }, () => {
      let newData = [];
      const { data, isRegisteredVat } = this.state;
      data.map((obj, index) => {
        if (isRegisteredVat)
          obj['vatCategoryId'] = '';
        else
          obj['vatCategoryId'] = 10;
        newData.push(obj);
        if (obj['productId'])
          this.getProductType(obj['productId'])
        return obj;
      })
      props.setFieldValue('lineItemsString', newData, true);
      this.updateAmount(newData, props);
    });
  };
  renderVat = (cell, row, props) => {
    //console.log(vat_list);
    // const { vat_list } = this.state;
    // let vatList = vat_list.length
    // 	? [{ id: '', vat: 'Select VAT' }, ...vat_list]
    // 	: vat_list;
    let vat_list = [];
    const product = this.state.producttype.find(
      (element) => element.id === row.productId
    );
    if (product) {
      vat_list = product.vat_list;
    }
    let idx;
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });
    if (row.productId && row.vatCategoryId) {
      row.vatCategoryId = typeof (row.vatCategoryId) === 'string' ? parseInt(row.vatCategoryId) : row.vatCategoryId;
    }
    return (
      <Field
        name={`lineItemsString.${idx}.vatCategoryId`}
        render={({ field, form }) => (
          <>
            <Select
              options={
                vat_list
                  ? selectOptionsFactory.renderOptions(
                    "name",
                    "id",
                    vat_list,
                    "VAT"
                  )
                  : []
              }
              value={
                vat_list ?
                  selectOptionsFactory
                    .renderOptions('name', 'id', vat_list, 'VAT')
                    .find((option) => option.value == row.vatCategoryId) : ""
              }
              id="vatCategoryId"
              placeholder={strings.Select + strings.VAT}
              // onChange={(e) => {
              // 	this.selectItem(
              // 		e.value,
              // 		row,
              // 		'vatCategoryId',
              // 		form,
              // 		field,
              // 		props,
              // 	);
              // }}
              onChange={(e) => {
                if (e.value === "") {
                  props.setFieldValue("vatCategoryId", "");
                } else {
                  this.selectItem(
                    e.value,
                    row,
                    "vatCategoryId",
                    form,
                    field,
                    props
                  );
                  this.updateAmount(this.state.data, props);
                }
              }}
              className={`${props.errors.lineItemsString &&
                props.errors.lineItemsString[parseInt(idx, 10)] &&
                props.errors.lineItemsString[parseInt(idx, 10)].vatCategoryId &&
                Object.keys(props.touched).length > 0 &&
                props.touched.lineItemsString &&
                props.touched.lineItemsString[parseInt(idx, 10)] &&
                props.touched.lineItemsString[parseInt(idx, 10)].vatCategoryId
                ? "is-invalid"
                : ""
                }`}
            />
            {props.errors.lineItemsString &&
              props.errors.lineItemsString[parseInt(idx, 10)] &&
              props.errors.lineItemsString[parseInt(idx, 10)].vatCategoryId &&
              Object.keys(props.touched).length > 0 &&
              props.touched.lineItemsString &&
              props.touched.lineItemsString[parseInt(idx, 10)] &&
              props.touched.lineItemsString[parseInt(idx, 10)]
                .vatCategoryId && (
                <div className="invalid-feedback">
                  {
                    props.errors.lineItemsString[parseInt(idx, 10)]
                      .vatCategoryId
                  }
                </div>
              )}
          </>
        )}
      />
    );
  };

  prductValue = (e, row, name, form, field, props) => {
    const { product_list } = this.props;
    const { vat_list } = this.state;
    let vatList = vat_list.length
      ? [{ id: "", vat: "Select VAT" }, ...vat_list]
      : vat_list;
    let data = this.state.data;
    const result = product_list.find((item) => item.id === parseInt(e));
    let idx;
    const producttype = this.getProductType(parseInt(e));
    let exchangeRate =
      this.formRef.current?.state?.values?.exchangeRate > 0 &&
        this.formRef.current?.state?.values?.exchangeRate !== ""
        ? this.formRef.current?.state?.values?.exchangeRate
        : 1;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        obj["unitPrice"] = (
          parseFloat(result.unitPrice) *
          (1 / exchangeRate)
        ).toFixed(2);
        obj["vatCategoryId"] = parseInt(result.vatCategoryId);
        obj["exciseTaxId"] = result.exciseTaxId;
        obj["description"] = result.description;
        obj["isExciseTaxExclusive"] = result.isExciseTaxExclusive;
        obj["unitType"] = result.unitType;
        obj["unitTypeId"] = result.unitTypeId;
        idx = index;
        if (this.state.isRegisteredVat) {
          if (producttype) {
            if (producttype.id === parseInt(e)) {
              obj['vatCategoryId'] = result.vatCategoryId;
            }
            else {
              obj['vatCategoryId'] = '';
            }
          }
        } else {
          obj['vatCategoryId'] = 10;
        }
      }
      return obj;
    });
    form.setFieldValue(
      `lineItemsString.${idx}.vatCategoryId`,
      parseInt(result.vatCategoryId),
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.unitPrice`,
      parseInt(result.unitPrice),
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.description`,
      result.description,
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.exciseTaxId`,
      result.exciseTaxId,
      true
    );
    this.getProductType(parseInt(e))
    this.updateAmount(data, props);
  };
  renderAddProduct = (cell, rows, props) => {
    return (
      <Button
        color="primary"
        className="btn-twitter btn-brand icon"
        onClick={(e, props) => {
          this.openProductModal(props);
        }}
      >
        <i className="fas fa-plus"></i>
      </Button>
    );
  };

  renderProduct = (cell, row, props) => {
    const { product_list } = this.props;
    let productList = product_list.length
      ? [{ id: "", name: "Select Product" }, ...product_list]
      : product_list;
    // if (product_list.length > 0) {
    //   if (product_list.length > this.state.producttype.length) {
    //     product_list.map((element) => {
    //       this.getProductType(element.id);
    //     });
    //   }
    // }
    let idx;
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Field
        name={`lineItemsString.${idx}.productId`}
        render={({ field, form }) => (
          <>
            <Select
              options={
                product_list
                  ? optionFactory.renderOptions(
                    "name",
                    "id",
                    product_list,
                    "Product"
                  )
                  : []
              }
              value={
                product_list &&
                selectOptionsFactory
                  .renderOptions("name", "id", product_list, "Product")
                  .find((option) => option.value === +row.productId)
              }
              id="productId"
              onChange={(e) => {
                if (e && e.label !== "Select Product") {
                  this.selectItem(
                    e.value,
                    row,
                    "productId",
                    form,
                    field,
                    props
                  );
                  this.prductValue(
                    e.value,
                    row,
                    "productId",
                    form,
                    field,
                    props
                  );
                  if (this.checkedRow()) this.addRow();
                }
              }}
              className={`${props.errors.lineItemsString &&
                props.errors.lineItemsString[parseInt(idx, 10)] &&
                props.errors.lineItemsString[parseInt(idx, 10)].productId &&
                Object.keys(props.touched).length > 0 &&
                props.touched.lineItemsString &&
                props.touched.lineItemsString[parseInt(idx, 10)] &&
                props.touched.lineItemsString[parseInt(idx, 10)].productId
                ? "is-invalid"
                : ""
                }`}
            />
            {row["productId"] != "" ? (
              <div className="mt-1">
                <TextField
                  type="textarea"
                  inputProps={{ maxLength: 2000 }}
                  multiline
                  minRows={1}
                  maxRows={4}
                  value={row["description"] !== "" ? row["description"] : ""}
                  onChange={(e) => {
                    this.selectItem(
                      e.target.value,
                      row,
                      "description",
                      form,
                      field
                    );
                  }}
                  placeholder={strings.Description}
                  className={`textarea ${props.errors.lineItemsString &&
                    props.errors.lineItemsString[parseInt(idx, 10)] &&
                    props.errors.lineItemsString[parseInt(idx, 10)]
                      .description &&
                    Object.keys(props.touched).length > 0 &&
                    props.touched.lineItemsString &&
                    props.touched.lineItemsString[parseInt(idx, 10)] &&
                    props.touched.lineItemsString[parseInt(idx, 10)].description
                    ? "is-invalid"
                    : ""
                    }`}
                />
              </div>
            ) : (
              ""
            )}
            {props.errors.lineItemsString &&
              props.errors.lineItemsString[parseInt(idx, 10)] &&
              props.errors.lineItemsString[parseInt(idx, 10)].productId &&
              Object.keys(props.touched).length > 0 &&
              props.touched.lineItemsString &&
              props.touched.lineItemsString[parseInt(idx, 10)] &&
              props.touched.lineItemsString[parseInt(idx, 10)].productId && (
                <div className="invalid-feedback">
                  {props.errors.lineItemsString[parseInt(idx, 10)].productId}
                </div>
              )}
          </>
        )}
      />
    );
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

  renderActions = (cell, rows, props) => {
    return rows["productId"] != "" ? (
      <Button
        size="sm"
        className="btn-twitter btn-brand icon mt-1"
        disabled={this.state.data.length === 1 ? true : false}
        onClick={(e) => {
          this.deleteRow(e, rows, props);
        }}
      >
        <i className="fas fa-trash"></i>
      </Button>
    ) : (
      ""
    );
  };

  checkedRow = () => {
    if (this.state.data.length > 0) {
      let length = this.state.data.length - 1;
      let temp =
        this.state.data?.[length].productId !== ""
          ? this.state.data?.[length].productId
          : -2;
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
    const { vat_list } = this.state;
    let total_net = 0;
    let total_excise = 0;
    let total = 0;
    let total_vat = 0;
    let net_value = 0;
    let discount_total = 0;
    data.map((obj) => {
      const index =
        obj.vatCategoryId !== ""
          ? vat_list.findIndex((item) => item.id === +obj.vatCategoryId)
          : "";
      const vat = index !== "" && index >= 0 ? vat_list[`${index}`].vat : 0;

      //Exclusive case
      if (this.state.taxType === false) {
        if (obj.discountType === "PERCENTAGE") {
          net_value =
            (+obj.unitPrice - +(obj.unitPrice * obj.discount) / 100) *
            obj.quantity;
          var discount = obj.unitPrice * obj.quantity - net_value;
          if (obj.exciseTaxId != 0) {
            if (obj.exciseTaxId === 1) {
              const value = +net_value / 2;
              net_value = parseFloat(net_value) + parseFloat(value);
              obj.exciseAmount = parseFloat(value);
            } else if (obj.exciseTaxId === 2) {
              const value = net_value;
              net_value = parseFloat(net_value) + parseFloat(value);
              obj.exciseAmount = parseFloat(value);
            }
          } else {
            obj.exciseAmount = 0;
          }
          var vat_amount = vat === 0 ? 0 : (+net_value * vat) / 100;
        } else {
          net_value = obj.unitPrice * obj.quantity - obj.discount;
          var discount = obj.unitPrice * obj.quantity - net_value;
          if (obj.exciseTaxId != 0) {
            if (obj.exciseTaxId === 1) {
              const value = +net_value / 2;
              net_value = parseFloat(net_value) + parseFloat(value);
              obj.exciseAmount = parseFloat(value);
            } else if (obj.exciseTaxId === 2) {
              const value = net_value;
              net_value = parseFloat(net_value) + parseFloat(value);
              obj.exciseAmount = parseFloat(value);
            }
          } else {
            obj.exciseAmount = 0;
          }
          var vat_amount = vat === 0 ? 0 : (+net_value * vat) / 100;
        }
      }
      //Inclusive case
      else {
        if (obj.discountType === "PERCENTAGE") {
          //net value after removing discount
          net_value =
            (+obj.unitPrice - +(obj.unitPrice * obj.discount) / 100) *
            obj.quantity;

          //discount amount
          var discount = obj.unitPrice * obj.quantity - net_value;

          //vat amount
          var vat_amount =
            vat === 0 ? 0 : (+net_value * ((vat / (100 + vat)) * 100)) / 100;

          //net value after removing vat for inclusive
          net_value = net_value - vat_amount;

          //excise calculation
          if (obj.exciseTaxId != 0) {
            if (obj.exciseTaxId === 1) {
              const value = net_value / 3;
              net_value = net_value;
              obj.exciseAmount = parseFloat(value);
            } else if (obj.exciseTaxId === 2) {
              const value = net_value / 2;
              obj.exciseAmount = parseFloat(value);
              net_value = net_value;
            }
          } else {
            obj.exciseAmount = 0;
          }
        } // fixed discount
        else {
          //net value after removing discount
          net_value = obj.unitPrice * obj.quantity - obj.discount;

          //discount amount
          var discount = obj.unitPrice * obj.quantity - net_value;

          //vat amount
          var vat_amount =
            vat === 0 ? 0 : (+net_value * ((vat / (100 + vat)) * 100)) / 100;

          //net value after removing vat for inclusive
          net_value = net_value - vat_amount;

          //excise calculation
          if (obj.exciseTaxId != 0) {
            if (obj.exciseTaxId === 1) {
              const value = net_value / 3;
              net_value = net_value;
              obj.exciseAmount = parseFloat(value);
            } else if (obj.exciseTaxId === 2) {
              const value = net_value / 2;
              obj.exciseAmount = parseFloat(value);
              net_value = net_value;
            }
          } else {
            obj.exciseAmount = 0;
          }
        }
      }

      obj.vatAmount = vat_amount;
      obj.subTotal = net_value
        ? parseFloat(net_value) + parseFloat(vat_amount)
        : 0;
      discount_total = +discount_total + discount;
      total_net = +(total_net + parseFloat(net_value));
      total_vat = +(total_vat + vat_amount);
      total_excise = +(total_excise + obj.exciseAmount);
      total = total_vat + total_net;
      return obj;
    });

    // const discount =
    // 	props.values.discountType.value === 'PERCENTAGE'
    // 		? +((total_net * discountPercentage) / 100)
    // 		: discountAmount;
    this.setState({
      data,
      initValue: {
        ...this.state.initValue,
        ...{
          total_net: total_net - total_excise,
          totalVatAmount: total_vat,
          discount: discount_total ? discount_total : 0,
          totalAmount: total,
          total_excise: total_excise,
        },
      },
    });
  };
  handleSubmit = (data) => {
    this.setState({ disabled: true, disableLeavePage: true });
    const { current_po_id, term } = this.state;
    const {
      quotaionExpiration,
      poReceiveDate,
      customerId,
      quotationNumber,
      notes,
      exchangeRate,
      discount,
      discountType,
      discountPercentage,
      totalVatAmount,
      totalAmount,
      currency,
      attachmentDescription,
      receiptNumber,
      placeOfSupplyId,
      quotationdate,
    } = data;

    let formData = new FormData();
    formData.append("exchangeRate", exchangeRate !== null ? exchangeRate : "");
    formData.append("taxType", this.state.taxType);
    formData.append("type", 6);
    formData.append("id", current_po_id);
    formData.append("quotationNumber", quotationNumber ? quotationNumber : "");
    if (this.state.dateChanged === true) {
      formData.append(
        "quotaionExpiration",
        typeof quotaionExpiration === "string"
          ? this.state.quotaionExpiration
          : quotaionExpiration
      );

    } else {
      formData.append(
        "quotaionExpiration",
        typeof quotaionExpiration === "string"
          ? this.state.quotaionExpirationNotChanged
          : " "
      );
    }
    if (typeof quotationdate === 'string') {
      const [day, month, year] = quotationdate.split("-");
      let dd = new Date(+year, +month - 1, +day);
      formData.append("quotationdate", dd);
    } else {
      formData.append("quotationdate", quotationdate);

    }
    formData.append("notes", notes ? notes : "");
    formData.append("lineItemsString", JSON.stringify(this.state.data));
    formData.append("totalVatAmount", this.state.initValue.totalVatAmount);
    formData.append("totalAmount", this.state.initValue.totalAmount);
    formData.append("totalExciseAmount", this.state.initValue.total_excise);
    formData.append("discount", this.state.initValue.discount);
    formData.append(
      "receiptNumber",
      receiptNumber !== null ? receiptNumber : ""
    );
    // formData.append('footNote',footNote? footNote : '');
    formData.append(
      "attachmentDescription",
      attachmentDescription !== null ? attachmentDescription : ""
    );
    if (placeOfSupplyId) {
      formData.append(
        "placeOfSupplyId",
        placeOfSupplyId.value ? placeOfSupplyId.value : placeOfSupplyId
      );
    }
    // formData.append('exciseType', this.state.checked);
    if (customerId) {
      formData.append(
        "customerId",
        customerId.value ? customerId.value : customerId
      );
    }

    if (currency !== null && currency) {
      formData.append("currencyCode", this.state.supplier_currency);
    }

    this.setState({ loading: true, loadingMsg: "Updating Quotation..." });
    this.props.quotationDetailsAction
      .updateQuatation(formData)
      .then((res) => {
        this.props.commonActions.tostifyAlert(
          "success",
          res.data ? res.data.message : "Quotation Updated Successfully"
        );
        this.props.history.push("/admin/income/quotation");
        this.setState({ loading: false });
      })
      .catch((err) => {
        this.setState({ createDisabled: false, loading: false });
        this.props.commonActions.tostifyAlert(
          "error",
          err.data ? err.data.message : "Quotation Updated Unsuccessfully"
        );
      });
  };

  deletepo = () => {
    const message1 = (
      <text>
        <b>Delete Quotation?</b>
      </text>
    );
    const message =
      "This Quotation will be deleted permanently and cannot be recovered. ";
    this.setState({
      dialog: (
        <ConfirmDeleteModal
          isOpen={true}
          okHandler={this.removePo}
          cancelHandler={this.removeDialog}
          message={message}
          message1={message1}
        />
      ),
    });
  };

  removePo = () => {
    this.setState({ disabled1: true });
    const { current_po_id } = this.state;
    this.setState({ loading: true, loadingMsg: "Deleting Quotation..." });
    this.props.quotationDetailsAction
      .deletePo(current_po_id)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            "success",
            res.data ? res.data.message : "Quotation Deleted Successfully"
          );
          this.props.history.push("/admin/income/quotation");
          this.setState({ loading: false });
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err.data ? err.data.message : "Quotation Deleted Unsuccessfully"
        );
      });
  };

  removeDialog = () => {
    this.setState({
      dialog: null,
    });
  };

  openSupplierModal = (e) => {
    e.preventDefault();
    this.setState({ openSupplierModal: true });
  };
  closeProductModal = (res) => {
    this.setState({ openProductModal: false });
  };
  setDate = (props, value) => {
    this.setState({
      dateChanged: true,
    });
    const values1 = value ? value : props.values.quotaionExpiration1;
    if (values1) {
      this.setState({
        quotaionExpiration: moment(values1),
      });
      props.setFieldValue("quotaionExpiration1", values1, true);
    }
  };
  setDate1 = (props, value) => {
    this.setState({
      dateChanged1: true,
    });
    const values1 = value ? value : props.values.quotationdate1;
    if (values1) {
      this.setState({
        quotationdate: moment(values1),
      });
      props.setFieldValue("quotationdate1", values1, true);
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

  setExchange = (value) => {
    let result = this.props.currency_convert_list.filter((obj) => {
      return obj.currencyCode === value;
    });
    this.formRef.current.setFieldValue(
      "exchangeRate",
      result[0].exchangeRate,
      true
    );
    this.exchangeRaterevalidate(result[0].exchangeRate);
  };

  getCurrentUser = (data) => {
    let option;
    if (data.label || data.value) {
      option = data;
    } else {
      option = {
        label: `${data.organization !== "" ? data.organization : data.fullName
          }`,
        value: data.id,
      };
    }

    let result = this.props.currency_convert_list.filter((obj) => {
      return obj.currencyCode === data.currencyCode;
    });

    this.setState({
      supplier_currency: data.currencyCode,
      customer_currency_des:
        result[0] && result[0].currencyName ? result[0].currencyName : "AED",
      supplier_currency_symbol: data.currencyIso ? data.currencyIso : "AED",
      customer_taxTreatment_des: data.taxTreatment ? data.taxTreatment : "",
    });

    this.formRef.current.setFieldValue("contactId", option, true);
    this.formRef.current.setFieldValue("customerId", option, true);
    if (result[0] && result[0].currencyCode)
      this.formRef.current.setFieldValue(
        "currency",
        result[0].currencyCode,
        true
      );

    this.formRef.current.setFieldValue(
      "taxTreatmentid",
      data.taxTreatmentId,
      true
    );

    if (result[0] && result[0].exchangeRate)
      this.formRef.current.setFieldValue(
        "exchangeRate",
        result[0].exchangeRate,
        true
      );
  };
  closeSupplierModal = (res) => {
    if (res) {
      this.props.requestForQuotationAction.getSupplierList(
        this.state.contactType
      );
    }
    this.setState({ openSupplierModal: false });
  };

  handleFileChange = (e, props) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => { };
      reader.readAsDataURL(file);
      props.setFieldValue("attachmentFile", file, true);
    }
  };

  getCurrency = (opt) => {
    let supplier_currencyCode = 0;

    this.props.supplier_list.map((item) => {
      if (item.label.contactId == opt) {
        this.setState({
          supplier_currency: item.label.currency.currencyCode,
          supplier_currency_des: item.label.currency.currencyName,
          supplier_currency_symbol: item.label.currency.currencyIsoCode,
        });

        supplier_currencyCode = item.label.currency.currencyCode;
      }
    });

    return supplier_currencyCode;
  };
  getTaxTreatment = (opt) => {
    let customer_taxTreatmentId = 0;
    let customer_item_taxTreatment = "";
    this.props.supplier_list.map((item) => {
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
  checkAmount = (discount) => {
    const { initValue } = this.state;
    if (discount >= initValue.totalAmount) {
      this.setState({
        param: true,
      });
    } else {
      this.setState({
        param: false,
      });
    }
  };
  render() {
    strings.setLanguage(this.state.language);
    const { data, isRegisteredVat, initValue, loading, loadingMsg, dialog } = this.state;
    const {
      project_list,
      currency_list,
      currency_convert_list,
      supplier_list,
      universal_currency_list,
    } = this.props;

    let tmpSupplier_list = [];

    supplier_list.map((item) => {
      let obj = { label: item.label.contactName, value: item.value };
      tmpSupplier_list.push(obj);
    });
    return loading == true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div>
        <div className="detail-supplier-invoice-screen">
          <div className="animated fadeIn">
            <Row>
              <Col lg={12} className="mx-auto">
                <Card>
                  <CardHeader>
                    <Row>
                      <Col lg={12}>
                        <div className="h4 mb-0 d-flex align-items-center">
                        <i className="fas fa-box-open" />
                          <span className="ml-2">
                            {strings.UpdateQuotation}
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
                                this.state.customer_taxTreatment_des !=
                                "NON GCC" &&
                                this.state.customer_taxTreatment_des !=
                                "GCC NON-VAT REGISTERED" &&
                                this.state.customer_taxTreatment_des !=
                                "GCC VAT REGISTERED"
                              ) {
                                if (!values.placeOfSupplyId)
                                  errors.placeOfSupplyId =
                                    "Place of supply is required";
                                if (
                                  values.placeOfSupplyId &&
                                  (values.placeOfSupplyId == "" ||
                                    (values.placeOfSupplyId.label &&
                                      values.placeOfSupplyId.label ===
                                      "Select Place of Supply"))
                                )
                                  errors.placeOfSupplyId =
                                    "Place of supply is required";
                              }
                              if (!values.customerId)
                                errors.customerId = "Customer name is required";
                              if (
                                values.customerId &&
                                (values.customerId == "" ||
                                  (values.customerId.label &&
                                    values.customerId.label ===
                                    "Customer Name"))
                              )
                                errors.customerId = "Customer name is required";
                              if (!values.quotationdate) {
                                errors.quotationdate =
                                  "Quotation date is required";
                              }
                              if (
                                values.quotationdate &&
                                values.quotaionExpiration &&
                                new Date(
                                  moment(values.quotationdate1).format(
                                    "MM DD YYYY"
                                  )
                                ) >
                                new Date(
                                  moment(values.quotaionExpiration1).format(
                                    "MM DD YYYY"
                                  )
                                )
                              ) {
                                errors.quotaionExpiration =
                                  "Expiry date should be later than the quotation date";
                                errors.quotationdate =
                                  "Quotation date should be earlier than the expiration date";
                              }
                              return errors;
                            }}
                            validationSchema={Yup.object().shape({
                              quotaionExpiration: Yup.string().required(
                                "Expiry date is required"
                              ),
                              lineItemsString: Yup.array()
                                .required(
                                  "Atleast one invoice sub detail is mandatory"
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
                                      ).required("Quantity is required"),
                                    unitPrice: Yup.string()
                                      .test(
                                        "Unit Price",
                                        strings.UnitPriceGreaterThan1,
                                        (value) => {
                                          if (value > 1) {
                                            return true;
                                          } else {
                                            return false;
                                          }
                                        }
                                      ).required("Unit price is required"),
                                    vatCategoryId:
                                      Yup.string().required("VAT is required"),
                                    productId: Yup.string().required(
                                      "Product is required"
                                    ),
                                  })
                                ),
                              // invoice_number: Yup.string().required(
                              // 	'Invoice Number is required',
                              // ),
                              // contactId: Yup.string().required(
                              // 	'Supplier is required',
                              // ),
                              // term: Yup.string().required('Term is required'),
                              // placeOfSupplyId: Yup.string().required('Place of supply is required'),
                              // invoiceDate: Yup.string().required(
                              // 	'Invoice date is required',
                              // ),
                              // invoiceDueDate: Yup.string().required(
                              // 	'Invoice due date is required',
                              // ),
                              // currency: Yup.string().required(
                              // 	'Currency is Requsired',
                              // ),
                              // lineItemsString: Yup.array()
                              // 	.required(
                              // 		'Atleast one invoice sub detail is mandatory',
                              // 	)
                              // 	.of(
                              // 		Yup.object().shape({
                              // 			// description: Yup.string().required(
                              // 			// 	'Value is required',
                              // 			// ),
                              // 			quantity: Yup.number()
                              // 				.required('Value is required')
                              // 				.test(
                              // 					'quantity',
                              // 					'Quantity Should be Greater than 1',
                              // 					(value) => value > 0,
                              // 				),
                              // 			unitPrice: Yup.number().required(
                              // 				'Value is required',
                              // 			),
                              // 			vatCategoryId: Yup.string().required(
                              // 				'Value is required',
                              // 			),
                              // 			productId: Yup.string().required(
                              // 				'Product is required',
                              // 			),
                              // 		}),
                              // 	),
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
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="quotationNumber">
                                        <span className="text-danger">* </span>
                                        {strings.QuotationNumber}
                                      </Label>
                                      <Input
                                        type="text"
                                        id="quotationNumber"
                                        name="quotationNumber"
                                        placeholder=""
                                        disabled
                                        value={props.values.quotationNumber}
                                        onChange={(value) => {
                                          props.handleChange("quotationNumber")(
                                            value
                                          );
                                        }}
                                        className={
                                          props.errors.quotationNumber &&
                                            props.touched.quotationNumber
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.quotationNumber &&
                                        props.touched.quotationNumber && (
                                          <div className="invalid-feedback">
                                            {props.errors.quotationNumber}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="customerId">
                                        <span className="text-danger">* </span>
                                        {strings.CustomerName}
                                      </Label>
                                      <Select
                                        id="customerId"
                                        name="customerId"
                                        onBlur={props.handlerBlur}
                                        options={
                                          tmpSupplier_list
                                            ? selectOptionsFactory.renderOptions(
                                              "label",
                                              "value",
                                              tmpSupplier_list,
                                              "Customer Name"
                                            )
                                            : []
                                        }
                                        // value={
                                        // 	currency_convert_list &&
                                        // 	selectCurrencyFactory
                                        // 		.renderOptions(
                                        // 			'currencyName',
                                        // 			'currencyCode',
                                        // 			currency_convert_list,
                                        // 			'Currency',
                                        // 		)
                                        // 		.find(
                                        // 			(option) =>
                                        // 				option.value ===
                                        // 				this.state.customerId,
                                        // 		)
                                        // }
                                        value={
                                          tmpSupplier_list &&
                                          tmpSupplier_list.find(
                                            (option) =>
                                              option.value ===
                                              +props.values.customerId
                                          )
                                        }
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            this.formRef.current.setFieldValue(
                                              "taxTreatmentid",
                                              this.getTaxTreatment(
                                                option.value
                                              ),
                                              true
                                            );
                                            this.formRef.current.setFieldValue(
                                              "currency",
                                              this.getCurrency(option.value),
                                              true
                                            );
                                            this.setExchange(
                                              this.getCurrency(option.value)
                                            );
                                            props.handleChange("customerId")(
                                              option
                                            );
                                          } else {
                                            props.handleChange("customerId")(
                                              ""
                                            );
                                          }
                                          this.resetVatId(props);
                                          this.getCustomerShippingAddress(
                                            option.value,
                                            this.getTaxTreatment(option.value),
                                            props
                                          );
                                        }}
                                        className={
                                          props.errors.customerId &&
                                            props.touched.customerId
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.customerId &&
                                        props.touched.customerId && (
                                          <div className="invalid-feedback">
                                            {props.errors.customerId}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                  {isRegisteredVat &&
                                    <Col lg={3}>
                                      <FormGroup className="mb-3">
                                        <Label htmlFor="taxTreatmentid">
                                          {strings.TaxTreatment}
                                        </Label>
                                        <Input
                                          disabled
                                          styles={customStyles}
                                          id="taxTreatmentid"
                                          name="taxTreatmentid"
                                          value={
                                            this.state.customer_taxTreatment_des
                                          }
                                          className={
                                            props.errors.taxTreatmentid &&
                                              props.touched.taxTreatmentid
                                              ? "is-invalid"
                                              : ""
                                          }
                                          onChange={(option) => {
                                            props.handleChange("taxTreatmentid")(
                                              option
                                            );
                                          }}
                                        />
                                        {props.errors.taxTreatmentid &&
                                          props.touched.taxTreatmentid && (
                                            <div className="invalid-feedback">
                                              {props.errors.taxTreatmentid}
                                            </div>
                                          )}
                                      </FormGroup>
                                    </Col>
                                  }
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
                                            {/* {this.state.customer_taxTreatment_des &&
																		(this.state.customer_taxTreatment_des=="VAT REGISTERED" 
																		||this.state.customer_taxTreatment_des=="VAT REGISTERED DESIGNATED ZONE" 
																		||this.state.customer_taxTreatment_des=="GCC VAT REGISTERED") && (
																			<span className="text-danger">* </span>
																		)} */}
                                            {strings.PlaceofSupply}
                                          </Label>
                                          <Select
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
                                            id="placeOfSupplyId"
                                            name="placeOfSupplyId"
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
                                                    option.value ===
                                                    props.values.placeOfSupplyId.toString()
                                                )
                                            }
                                            onChange={(options) => {
                                              if (options && options.value) {
                                                props.handleChange(
                                                  "placeOfSupplyId"
                                                )(options.value);
                                              } else {
                                                props.handleChange(
                                                  "placeOfSupplyId"
                                                )("");
                                              }
                                            }}
                                            className={`${props.errors.placeOfSupplyId &&
                                              props.touched.placeOfSupplyId
                                              ? "is-invalid"
                                              : ""
                                              }`}
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
                                        {strings.QuotationDate}
                                      </Label>
                                      <DatePicker
                                        id="quotationdate"
                                        name="quotationdate"
                                        placeholderText={strings.QuotationDate}
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="dd-MM-yyyy"
                                        dropdownMode="select"
                                        value={props.values.quotationdate}
                                        selected={
                                          props.values.quotationdate1
                                            ? new Date(
                                              props.values.quotationdate1
                                            )
                                            : new Date()
                                        }
                                        onChange={(value) => {
                                          if (
                                            (this.state
                                              .quotationDateForVatValidation <
                                              this.state
                                                .companyVATRegistrationDate &&
                                              value >
                                              this.state
                                                .companyVATRegistrationDate) ||
                                            (value <
                                              this.state
                                                .companyVATRegistrationDate &&
                                              this.state
                                                .quotationDateForVatValidation >
                                              this.state
                                                .companyVATRegistrationDate)
                                          ) {
                                            this.resetVatId(props);
                                          }
                                          this.setState({
                                            quotationDateForVatValidation:
                                              value,
                                          });
                                          props.handleChange("quotationdate")(
                                            value
                                          );
                                          this.setDate1(props, value);
                                        }}
                                        className={`form-control ${props.errors.quotationdate &&
                                          props.touched.quotationdate
                                          ? "is-invalid"
                                          : ""
                                          }`}
                                      />
                                      {props.errors.quotationdate &&
                                        props.touched.quotationdate && (
                                          <div className="invalid-feedback">
                                            {/* {props.errors.quotaionExpiration} */}
                                            {props.errors.quotationdate.includes(
                                              "nullable()"
                                            )
                                              ? "Quotation date is required"
                                              : props.errors.quotationdate}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={3}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="date">
                                        <span className="text-danger">* </span>
                                        {strings.ExpirationDate}
                                      </Label>
                                      <DatePicker
                                        id="quotaionExpiration"
                                        name="quotaionExpiration"
                                        placeholderText={strings.ExpirationDate}
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="dd-MM-yyyy"
                                        dropdownMode="select"
                                        value={props.values.quotaionExpiration}
                                        selected={
                                          new Date(
                                            props.values.quotaionExpiration1
                                          )
                                        }
                                        onChange={(value) => {
                                          props.handleChange(
                                            "quotaionExpiration"
                                          )(value);
                                          this.setDate(props, value);
                                        }}
                                        className={`form-control ${props.errors.quotaionExpiration &&
                                          props.touched.quotaionExpiration
                                          ? "is-invalid"
                                          : ""
                                          }`}
                                      />
                                      {props.errors.quotaionExpiration &&
                                        props.touched.quotaionExpiration && (
                                          <div className="invalid-feedback">
                                            {/* {props.errors.quotaionExpiration} */}
                                            {props.errors.quotaionExpiration.includes(
                                              "nullable()"
                                            )
                                              ? "Expiry date is required"
                                              : props.errors.quotaionExpiration}
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
                                        placeholder={
                                          strings.Select + strings.Currency
                                        }
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
                                                props.values.currency
                                            )
                                        }
                                        onChange={(option) => {
                                          props.handleChange("currency")(
                                            option
                                          );
                                          this.setExchange(option.value);
                                          this.setCurrency(option.value);
                                        }}
                                        className={`${props.errors.currency &&
                                          props.touched.currency
                                          ? "is-invalid"
                                          : ""
                                          }`}
                                      />
                                      {props.errors.currency &&
                                        props.touched.currency && (
                                          <div className="invalid-feedback">
                                            {props.errors.currency}
                                          </div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                </Row>

                                {/* <Row>
																<Col lg={8} className="mb-3">
																	 <Button
																		color="primary"
																		className={`btn-square mr-3 ${
																			this.checkedRow() ? `disabled-cursor` : ``
																		} `}
																		onClick={this.addRow}
																		title={
																			this.checkedRow()
																				? `Please add detail to add more`
																				: ''
																		}
																		disabled={this.checkedRow() ? true : false}
																	>
																		<i className="fa fa-plus"></i> {strings.Addmore}
																	</Button>
																</Col>
																
															</Row> */}

                                <hr
                                  style={{
                                    display:
                                      props.values.exchangeRate === 1
                                        ? "none"
                                        : "",
                                  }}
                                />

                                <Row
                                  style={{
                                    display:
                                      props.values.exchangeRate === 1
                                        ? "none"
                                        : "",
                                  }}
                                >
                                  <Col>
                                    <Label>
                                      {strings.CurrencyExchangeRate}
                                    </Label>
                                  </Col>
                                </Row>

                                <Row
                                  style={{
                                    display:
                                      props.values.exchangeRate === 1
                                        ? "none"
                                        : "",
                                  }}
                                >
                                  <Col md={1}>
                                    <Input disabled id="1" name="1" value={1} />
                                  </Col>
                                  <Col md={2}>
                                    <FormGroup className="mb-3">
                                      {/* <Label htmlFor="exchangeRate">
																		Exchange rate
																	</Label> */}
                                      <div>
                                        <Input
                                          disabled
                                          className="form-control"
                                          id="curreancyname"
                                          name="curreancyname"
                                          value={
                                            this.state?.supplier_currency_symbol
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
                                          className="form-control"
                                          id="exchangeRate"
                                          name="exchangeRate"
                                          value={props.values.exchangeRate}
                                          onChange={(value) => {
                                            props.handleChange("exchangeRate")(
                                              value
                                            );
                                            this.exchangeRaterevalidate(
                                              parseFloat(value.target.value)
                                            );
                                          }}
                                        />
                                      </div>
                                    </FormGroup>
                                  </Col>
                                  <Col lg={2}>
                                    <Input
                                      type="text"
                                      min="0"
                                      disabled
                                      id="currencyName"
                                      name="currencyName"
                                      value={
                                        this.state?.basecurrency?.currencyName
                                      }
                                    />
                                  </Col>
                                </Row>

                                <hr
                                  style={{
                                    display:
                                      props.values.exchangeRate === 1
                                        ? "none"
                                        : "",
                                  }}
                                />
                                <Row>
                                  <Col lg={8} className="mb-3">
                                    {/* <Button
																	color="primary"
																	className={`btn-square mr-3 ${
																		this.checkedRow() ? `disabled-cursor` : ``
																	} `}
																	onClick={this.addRow}
																	title={
																		this.checkedRow()
																			? `Please add detail to add more`
																			: ''
																	}
																	disabled={this.checkedRow() ? true : false}
																>
																	<i className="fa fa-plus"></i>{' '}{strings.Addmore} 
																</Button> */}
                                    <Button
                                      color="primary"
                                      className="btn-square mr-3"
                                      onClick={(e, props) => {
                                        this.openProductModal();
                                        // this.props.history.push(`/admin/master/product/create`,{gotoParentURL:"/admin/income/quotation/create"})
                                      }}
                                    >
                                      <i className="fa fa-plus"></i>{" "}
                                      {strings.Addproduct}
                                    </Button>
                                  </Col>
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
                                      onChange={(taxType) => {
                                        props.handleChange("taxType")(taxType);
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
                                  <Col lg={12}>
                                    {props.errors.lineItemsString &&
                                      props.touched.lineItemsString &&
                                      typeof props.errors.lineItemsString ===
                                      "string" && (
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
                                    <BootstrapTable
                                      options={this.options}
                                      data={data}
                                      version="4"
                                      hover
                                      keyField="id"
                                      className="invoice-create-table"
                                    >
                                      <TableHeaderColumn
                                        width="5%"
                                        dataAlign="center"
                                        dataFormat={(cell, rows) =>
                                          this.renderActions(cell, rows, props)
                                        }
                                      ></TableHeaderColumn>
                                      <TableHeaderColumn
                                        // width="17%"
                                        dataField="product"
                                        dataFormat={(cell, rows) =>
                                          this.renderProduct(cell, rows, props)
                                        }
                                      >
                                        {strings.PRODUCT}
                                      </TableHeaderColumn>
                                      {/* <TableHeaderColumn
																		width="55"
																		dataAlign="center"
																		dataFormat={(cell, rows) =>
																			this.renderAddProduct(cell, rows, props)
																		}
																		></TableHeaderColumn> */}
                                      {/* <TableHeaderColumn
																			dataField="account"
																			width="15%"
																			dataFormat={(cell, rows) =>
																				this.renderAccount(cell, rows, props)
																			}
																		>
																			Account
																		</TableHeaderColumn> */}
                                      {/* <TableHeaderColumn
																			dataField="description"
																			dataFormat={(cell, rows) =>
																				this.renderDescription(
																					cell,
																					rows,
																					props,
																				)
																			}
																		>
																			{strings.DESCRIPTION}
																		</TableHeaderColumn> */}
                                      <TableHeaderColumn
                                        dataField="quantity"
                                        // width="13%"
                                        dataFormat={(cell, rows) =>
                                          this.renderQuantity(cell, rows, props)
                                        }
                                      >
                                        {strings.QUANTITY}
                                      </TableHeaderColumn>
                                      {/* <TableHeaderColumn
																			width="5%"
																			dataField="unitType"
																     	>{strings.Unit}	<i
																		 id="unitTooltip"
																		 className="fa fa-question-circle ml-1"
																	 ></i>
																	 
																	 <UncontrolledTooltip
																		 placement="right"
																		 target="unitTooltip"
																	 >
																		Units / Measurements
																	 </UncontrolledTooltip>
																 </TableHeaderColumn>  */}
                                      <TableHeaderColumn
                                        dataField="unitPrice"
                                        dataFormat={(cell, rows) =>
                                          this.renderUnitPrice(
                                            cell,
                                            rows,
                                            props
                                          )
                                        }
                                      >
                                        {strings.UNITPRICE}
                                      </TableHeaderColumn>
                                      {this.state.discountEnabled == true && (
                                        <TableHeaderColumn
                                          // width="12%"
                                          dataField="discount"
                                          dataFormat={(cell, rows) =>
                                            this.renderDiscount(
                                              cell,
                                              rows,
                                              props
                                            )
                                          }
                                        >
                                          {strings.DISCOUNT_TYPE}
                                        </TableHeaderColumn>
                                      )}
                                      {initValue.total_excise != 0 && (
                                        <TableHeaderColumn
                                          // width="10%"
                                          dataField="exciseTaxId"
                                          dataFormat={(cell, rows) =>
                                            this.renderExcise(cell, rows, props)
                                          }
                                        >
                                          {strings.Excises}
                                          <i
                                            id="ExiseTooltip"
                                            className="fa fa-question-circle ml-1"
                                          ></i>
                                          <UncontrolledTooltip
                                            placement="right"
                                            target="ExiseTooltip"
                                          >
                                            Excise dropdown will be enabled only
                                            for the excise products
                                          </UncontrolledTooltip>
                                        </TableHeaderColumn>
                                      )}
                                      {isRegisteredVat &&
                                        <TableHeaderColumn
                                          width="250px"
                                          dataField="vat"
                                          dataFormat={(cell, rows) =>
                                            this.renderVat(cell, rows, props)
                                          }
                                        >
                                          {strings.VAT}
                                        </TableHeaderColumn>
                                      }
                                      {isRegisteredVat &&
                                        <TableHeaderColumn
                                          //  width="10%"
                                          dataField="sub_total"
                                          dataFormat={this.renderVatAmount}
                                          className="text-right"
                                          columnClassName="text-right"
                                          formatExtraData={
                                            universal_currency_list
                                          }
                                        >
                                          {strings.VATAMOUNT}
                                        </TableHeaderColumn>
                                      }
                                      <TableHeaderColumn
                                        dataField="sub_total"
                                        dataFormat={this.renderSubTotal}
                                        className="text-right"
                                        columnClassName="text-right"
                                        formatExtraData={
                                          universal_currency_list
                                        }
                                      >
                                        {strings.SubTotal}
                                      </TableHeaderColumn>
                                    </BootstrapTable>
                                  </Col>
                                </Row>
                                <Row className="ml-4 ">
                                  <Col className=" ml-4">
                                    <FormGroup className="pull-right">
                                      <Input
                                        type="checkbox"
                                        id="discountEnabled"
                                        checked={this.state.discountEnabled}
                                        onChange={(option) => {
                                          if (initValue.discount > 0) {
                                            this.setState({
                                              discountEnabled: true,
                                            });
                                          } else {
                                            this.setState({
                                              discountEnabled:
                                                !this.state.discountEnabled,
                                            });
                                          }
                                        }}
                                      />
                                      <Label>
                                        {strings.ApplyLineItemDiscount}
                                      </Label>
                                    </FormGroup>
                                  </Col>
                                </Row>
                                {data.length > 0 && (
                                  <Row>
                                    <Col lg={8}>
                                      <FormGroup className="py-2">
                                        <Label htmlFor="notes">
                                          {strings.TermsAndConditions}
                                        </Label>
                                        <br />
                                        <TextField
                                          type="textarea"
                                          style={{ width: "500px" }}
                                          className="textarea"
                                          inputProps={{ maxLength: 2000 }}
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
                                      <Row>
                                        <Col lg={6}>
                                          <FormGroup className="mb-3">
                                            <Label htmlFor="receiptNumber">
                                              {strings.ReferenceNumber}
                                            </Label>
                                            <Input
                                              type="text"
                                              maxLength="20"
                                              style={{ width: "500px" }}
                                              id="receiptNumber"
                                              name="receiptNumber"
                                              value={props.values.receiptNumber}
                                              placeholder={strings.ReceiptNumber}
                                              onChange={(value) => {
                                                props.handleChange(
                                                  "receiptNumber"
                                                )(value);
                                              }}
                                              className={
                                                props.errors.receiptNumber &&
                                                  props.touched.receiptNumber
                                                  ? "is-invalid"
                                                  : ""
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
                                        <Label htmlFor="attachmentDescription">
                                          {strings.AttachmentDescription}
                                        </Label>
                                        <br />
                                        <TextField
                                          type="textarea"
                                          className="textarea form-control"
                                          maxLength="250"
                                          style={{ width: "700px" }}
                                          name="attachmentDescription"
                                          id="attachmentDescription"
                                          rows="2"
                                          placeholder={
                                            strings.ReceiptAttachmentDescription
                                          }
                                          onChange={(option) =>
                                            props.handleChange(
                                              "attachmentDescription"
                                            )(option)
                                          }
                                          value={
                                            props.values.attachmentDescription
                                          }
                                        />
                                      </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                      <div className="">
                                        {initValue.total_excise > 0 ? (
                                          <div className="total-item p-2">
                                            {/* style={{display:this.state.checked === true ? '':'none'}} */}
                                            <Row>
                                              <Col lg={6}>
                                                <h5 className="mb-0 text-right">
                                                  {strings.Total_Excise}
                                                </h5>
                                              </Col>
                                              <Col
                                                lg={6}
                                                className="text-right"
                                              >
                                                <label className="mb-0">
                                                  {
                                                    this.state
                                                      .supplier_currency_symbol
                                                  }{" "}
                                                  &nbsp;
                                                  {initValue.total_excise.toLocaleString(
                                                    navigator.language,
                                                    { minimumFractionDigits: 2 }
                                                  )}
                                                </label>
                                              </Col>
                                            </Row>
                                          </div>
                                        ) : (
                                          ""
                                        )}
                                        {this.state.discountEnabled == true ? (
                                          <div className="total-item p-2">
                                            <Row>
                                              <Col lg={6}>
                                                <h5 className="mb-0 text-right">
                                                  {strings.Discount}
                                                </h5>
                                              </Col>
                                              <Col
                                                lg={6}
                                                className="text-right"
                                              >
                                                <label className="mb-0">
                                                  {
                                                    this.state
                                                      .supplier_currency_symbol
                                                  }{" "}
                                                  &nbsp;
                                                  {this.state.initValue.discount
                                                    ? initValue.discount.toLocaleString(
                                                      navigator.language,
                                                      {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                      }
                                                    )
                                                    : initValue.discount.toLocaleString(
                                                      navigator.language,
                                                      {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                      }
                                                    )}
                                                </label>
                                              </Col>
                                            </Row>
                                          </div>
                                        ) : (
                                          ""
                                        )}
                                        <div className="total-item p-2">
                                          <Row>
                                            <Col lg={6}>
                                              <h5 className="mb-0 text-right">
                                                {strings.TotalNet}
                                              </h5>
                                            </Col>
                                            <Col lg={6} className="text-right">
                                              <label className="mb-0">
                                                {/* {universal_currency_list[0] && (
																						<Currency
																						value=	{initValue.total_net.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)} */}
                                                {
                                                  this.state
                                                    .supplier_currency_symbol
                                                }{" "}
                                                &nbsp;
                                                {initValue.total_net.toLocaleString(
                                                  navigator.language,
                                                  {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                  }
                                                )}
                                              </label>
                                            </Col>
                                          </Row>
                                        </div>
                                        {isRegisteredVat && <div className="total-item p-2">
                                          <Row>
                                            <Col lg={6}>
                                              <h5 className="mb-0 text-right">
                                                {strings.TotalVat}
                                              </h5>
                                            </Col>
                                            <Col lg={6} className="text-right">
                                              <label className="mb-0">
                                                {/* {universal_currency_list[0] && (
																						<Currency
																						value=	{initValue.invoiceVATAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)} */}
                                                {
                                                  this.state
                                                    .supplier_currency_symbol
                                                }
                                                &nbsp;
                                                {initValue.totalVatAmount.toLocaleString(
                                                  navigator.language,
                                                  {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                  }
                                                )}
                                              </label>
                                            </Col>
                                          </Row>
                                        </div>}
                                        <div className="total-item p-2">
                                          <Row>
                                            <Col lg={6}>
                                              <h5 className="mb-0 text-right">
                                                {strings.Total}
                                              </h5>
                                            </Col>
                                            <Col lg={6} className="text-right">
                                              <label className="mb-0">
                                                {/* {universal_currency_list[0] && (
																						<Currency
																						value=	{initValue.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						currencySymbol={
																						universal_currency_list[0]
																						? universal_currency_list[0].currencyIsoCode
																						: 'USD'
																							}
																							/>
																							)} */}
                                                {
                                                  this.state
                                                    .supplier_currency_symbol
                                                }
                                                &nbsp;
                                                {initValue.totalAmount.toLocaleString(
                                                  navigator.language,
                                                  {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                  }
                                                )}
                                              </label>
                                            </Col>
                                          </Row>
                                        </div>
                                      </div>
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
                                        onClick={this.deletepo}
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
                                          if (this.state.data.length === 1) {
                                            console.log(props.errors, "ERRORs");
                                            //	added validation popup	msg
                                            props.handleBlur();
                                            if (
                                              props.errors &&
                                              Object.keys(props.errors)
                                                .length != 0
                                            )
                                              this.props.commonActions.fillManDatoryDetails();
                                          } else {
                                            let newData = [];
                                            const data = this.state.data;
                                            newData = data.filter(
                                              (obj) => obj.productId !== ""
                                            );
                                            props.setFieldValue(
                                              "lineItemsString",
                                              newData,
                                              true
                                            );
                                            this.updateAmount(newData, props);
                                          }
                                        }}
                                      >
                                        <i className="fa fa-dot-circle-o"></i>{" "}
                                        {this.state.disabled
                                          ? "Updating..."
                                          : strings.Update}
                                      </Button>
                                      <Button
                                        color="secondary"
                                        className="btn-square"
                                        onClick={() => {
																					if (this.props?.location?.state?.renderURL) {
																						this.props.history.push(
																							`${this.props?.location?.state?.renderURL}`,
																							{ id: this.props?.location?.state?.renderID },);
																					} else
																						this.props.history.push(
																							'/admin/income/quotation',
																						);
																				}}
                                      >
                                        <i className="fa fa-ban"></i>{" "}
                                        {this.state.disabled1
                                          ? "Deleting..."
                                          : strings.Cancel}
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
          <SupplierModal
            openSupplierModal={this.state.openSupplierModal}
            closeSupplierModal={(e) => {
              this.closeSupplierModal(e);
            }}
            getCurrentUser={(e) => this.getCurrentUser(e)}
            createSupplier={this.props.requestForQuotationAction.createSupplier}
            currency_list={this.props.currency_list}
            country_list={this.props.country_list}
            getStateList={this.props.requestForQuotationAction.getStateList}
          />
          <ProductModal
            openProductModal={this.state.openProductModal}
            closeProductModal={(e) => {
              this.closeProductModal(e);
            }}
            getCurrentProduct={(e) => {
              this.props.supplierInvoiceActions.getProductList();
              this.getCurrentProduct(e);
            }}
            income={this.state.income}
            createProduct={this.props.ProductActions.createAndSaveProduct}
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailQuotation);
