import React from "react";
import { Button, Row, Col, Input, UncontrolledTooltip } from "reactstrap";
import Select from "react-select";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Field } from "formik";
import { Currency } from "components";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { optionFactory, selectOptionsFactory } from "utils";
import "./style.scss";
import { TextField } from "@material-ui/core";

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

class ProductTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      discountOptions: [
        { value: "FIXED", label: "FIXED" },
        { value: "PERCENTAGE", label: "%" },
      ],
      selectedType: { value: "FIXED", label: "Fixed" },
    };
    this.regEx = /^[0-9\b]+$/;
    this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
  }
  getIndex = (id) => {
    let idx;
    this.props.data.map((obj, index) => {
      if (obj.id === id) {
        idx = index;
      }
      return obj;
    });
    return idx;
  };
  updateAmount = async (data, disableAll) => {
    await this.props.updateAmount(data);
    if (this.checkedRow()) await this.addRow();
  };
  selectItem = async (e, row, name, form, field, props) => {
    //e.preventDefault();
    let { data, setData } = this.props;
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        obj[`${name}`] = e;
        idx = index;
      }
      return obj;
    });
    await setData(data);
    form.setFieldValue(field.name, data[parseInt(idx, 10)][`${name}`], true);
    if (
      name === "unitPrice" ||
      name === "vatCategoryId" ||
      name === "quantity" ||
      name === "exciseTaxId" ||
      name === "discount"
    ) {
      form.setFieldValue(field.name, data[parseInt(idx, 10)][`${name}`], true);
      this.updateAmount(data);
    }
  };
  renderQuantity = (cell, row, props) => {
    var { strings } = this.props;
    const idx = this.getIndex(row.id);
    return (
      <Field
        name={`lineItemsString.${idx}.quantity`}
        render={({ field, form }) => (
          <div
            style={{ display: "flex", width: "fit-content", flexWrap: "wrap" }}
          >
            <div style={{ minWidth: "55px", width: "65%" }}>
              <Input
                type="text"
                min="0"
                maxLength="10"
                value={row["quantity"] !== 0 ? row["quantity"] : 0}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (
                    value === "" ||
                    (value !== "0" && this.regEx.test(value))
                  ) {
                    this.selectItem(value, row, "quantity", form, field, props);
                  } else {
                    form.setFieldTouched(field.name, true);
                  }
                }}
                placeholder={strings.Enter + strings.Quantity}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value === "") {
                    form.setFieldTouched(field.name, true);
                  }
                }}
                className={`form-control
                                        ${
                                          props.errors.lineItemsString &&
                                          props.errors.lineItemsString[
                                            parseInt(idx, 10)
                                          ] &&
                                          props.errors.lineItemsString[
                                            parseInt(idx, 10)
                                          ].quantity &&
                                          Object.keys(props.touched).length >
                                            0 &&
                                          props.touched.lineItemsString &&
                                          props.touched.lineItemsString[
                                            parseInt(idx, 10)
                                          ] &&
                                          props.touched.lineItemsString[
                                            parseInt(idx, 10)
                                          ].quantity
                                            ? "is-invalid"
                                            : ""
                                        }`}
              />
            </div>

            <div style={{ minWidth: "55px", width: "35%" }}>
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
                <div
                  className="invalid-feedback"
                  style={{ display: "block", whiteSpace: "normal" }}
                >
                  {props.errors.lineItemsString[parseInt(idx, 10)].quantity}
                </div>
              )}

            {/* {totalquantityleft<0 && <div style={{color:'red',fontSize:'0.8rem'}} >
                                                    Out of Stock
                            </div>}  */}
          </div>
        )}
      />
    );
  };

  renderUnitPrice = (cell, row, props) => {
    const { strings, disableAll } = this.props;
    const idx = this.getIndex(row.id);
    return (
      <Field
        name={`lineItemsString.${idx}.unitPrice`}
        render={({ field, form }) => (
          <>
            <Input
              disabled={disableAll}
              type="text"
              min="0"
              maxLength="14,2"
              value={row["unitPrice"] !== 0 ? row["unitPrice"] : 0}
              onChange={(e) => {
                const value = e.target.value.trim(); // Remove leading/trailing spaces
                if (
                  value === "" ||
                  (value !== "0" && this.regDecimal.test(value))
                ) {
                  this.selectItem(value, row, "unitPrice", form, field, props);
                } else {
                  form.setFieldTouched(field.name, true); // Mark field as touched
                }
              }}
              placeholder={strings.Enter + strings.UnitPrice}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value === "") {
                  form.setFieldTouched(field.name, true);
                }
              }}
              className={`form-control
                                    ${
                                      props.errors.lineItemsString &&
                                      props.errors.lineItemsString[
                                        parseInt(idx, 10)
                                      ] &&
                                      props.errors.lineItemsString[
                                        parseInt(idx, 10)
                                      ].unitPrice &&
                                      Object.keys(props.touched).length > 0 &&
                                      props.touched.lineItemsString &&
                                      props.touched.lineItemsString[
                                        parseInt(idx, 10)
                                      ] &&
                                      props.touched.lineItemsString[
                                        parseInt(idx, 10)
                                      ].unitPrice
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

  renderSubTotal = (cell, row, extraData) => {
    const { initValue } = this.props;
    return (
      <Currency
        value={row.subTotal}
        currencySymbol={initValue.currencyIsoCode}
      />
    );
  };
  renderVatAmount = (cell, row, extraData) => {
    const { initValue } = this.props;
    return (
      <Currency
        value={row.vatAmount}
        currencySymbol={initValue.currencyIsoCode}
      />
    );
  };

  renderSubTotal = (cell, row, extraData) => {
    const { initValue } = this.props;
    return (
      <Currency
        value={row.subTotal}
        currencySymbol={initValue.currencyIsoCode}
      />
    );
  };
  renderVatAmount = (cell, row, extraData) => {
    const { initValue } = this.props;
    return (
      <Currency
        value={row.vatAmount}
        currencySymbol={initValue.currencyIsoCode}
      />
    );
  };
  addRow = async () => {
    let { data, idCount, setData, setIdCount, disableAll } = this.props;
    if (!disableAll) {
      data = await data.concat({
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
        unitType: "",
        unitTypeId: "",
      });
      await setData(data);
      await setIdCount(idCount + 1);
    }
  };

  renderDiscount = (cell, row, props) => {
    const { strings, data, disableAll } = this.props;
    const { discountOptions } = this.state;
    const idx = this.getIndex(row.id);
    return (
      <Field
        name={`lineItemsString.${idx}.discountType`}
        render={({ field, form }) => (
          <div>
            <Input
              disabled={disableAll}
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
              }}
              placeholder={strings.Enter + strings.Discount}
              className={`form-control 
                                    ${
                                      props.errors.lineItemsString &&
                                      props.errors.lineItemsString[
                                        parseInt(idx, 10)
                                      ] &&
                                      props.errors.lineItemsString[
                                        parseInt(idx, 10)
                                      ].discount &&
                                      Object.keys(props.touched).length > 0 &&
                                      props.touched.lineItemsString &&
                                      props.touched.lineItemsString[
                                        parseInt(idx, 10)
                                      ] &&
                                      props.touched.lineItemsString[
                                        parseInt(idx, 10)
                                      ].discount
                                        ? "is-invalid"
                                        : ""
                                    }`}
            />
            <div className="mt-1">
              <Select
                isDisabled={disableAll}
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
                onChange={(e) => {
                  this.selectItem(
                    e.value,
                    row,
                    "discountType",
                    form,
                    field,
                    props
                  );
                }}
              />
            </div>
          </div>
        )}
      />
    );
  };

  renderVat = (cell, row, props) => {
    const { strings, disableAll, vat_list } = this.props;
    const idx = this.getIndex(row.id);
    const vat_list_dropdown =
      row?.vat_list && row?.vat_list?.length ? row.vat_list : vat_list;
    return (
      <Field
        name={`lineItemsString.${idx}.vatCategoryId`}
        render={({ field, form }) => (
          <>
            <Select
              options={
                vat_list_dropdown
                  ? selectOptionsFactory.renderOptions(
                      "name",
                      "id",
                      vat_list_dropdown,
                      "VAT"
                    )
                  : []
              }
              value={
                parseInt(row.vatCategoryId) === 10
                  ? { label: "N/A", value: 10 }
                  : vat_list_dropdown &&
                    selectOptionsFactory
                      .renderOptions("name", "id", vat_list_dropdown, "VAT")
                      .find(
                        (option) => option.value === parseInt(row.vatCategoryId)
                      )
              }
              id="vatCategoryId"
              placeholder={strings.Select + strings.VAT}
              isDisabled={disableAll || parseInt(row.vatCategoryId) === 10}
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
                }
              }}
              className={`${
                props.errors.lineItemsString &&
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
  renderExcise = (cell, row, props) => {
    const { excise_list, strings, data, disableAll } = this.props;
    const idx = this.getIndex(row.id);
    return (
      <Field
        name={`lineItemsString.${idx}.exciseTaxId`}
        render={({ field, form }) => (
          <Select
            styles={customStyles}
            isDisabled={
              row.exciseTaxId === 0 || row.exciseTaxId === null || disableAll
            }
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
            placeholder={strings.Select_Excise}
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
              }
            }}
            className={`${
              props.errors.lineItemsString &&
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
  prductValue = (e, row, name, form, field, props) => {
    const { product_list, exchangeRate, getProductType } = this.props;
    let { data, disableVat } = this.props;
    const result = product_list.find((item) => item.id === parseInt(e));
    let idx;
    const vat_list = getProductType(parseInt(e));
    data.map((obj, index) => {
      if (obj.id === row.id) {
        obj["unitPrice"] = (
          parseFloat(result.unitPrice) *
          (1 / exchangeRate)
        ).toFixed(2);
        obj["exciseTaxId"] = result.exciseTaxId;
        obj["description"] = result.description;
        obj["discountType"] = result.discountType;
        obj["transactionCategoryId"] = result.transactionCategoryId;
        obj["transactionCategoryLabel"] = result.transactionCategoryLabel;
        obj["isExciseTaxExclusive"] = result.isExciseTaxExclusive;
        obj["unitType"] = result.unitType;
        obj["unitTypeId"] = result.unitTypeId;
        obj["productId"] = result.id;
        obj["quantity"] = "1";
        obj.vat_list = vat_list;
        idx = index;
        if (disableVat) {
          obj["vatCategoryId"] = 10;
        } else {
          const vatCategory =
            vat_list && vat_list.find((obj) => obj.id === result.vatCategoryId);
          if (vatCategory) obj["vatCategoryId"] = vatCategory.id;
          else
            obj["vatCategoryId"] =
              vat_list && vat_list.length > 0 ? vat_list[0]?.id : "";
        }
      }
      return obj;
    });
    form.setFieldValue(
      `lineItemsString.${idx}.vatCategoryId`,
      result.vatCategoryId,
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.exciseTaxId`,
      result.exciseTaxId,
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.unitPrice`,
      result.unitPrice,
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.description`,
      result.description,
      true
    );
    // if (enableAccount) {
    form.setFieldValue(
      `lineItemsString.${idx}.transactionCategoryId`,
      result.transactionCategoryId,
      true
    );
    form.setFieldValue(
      `lineItemsString.${idx}.transactionCategoryLabel`,
      result.transactionCategoryLabel,
      true
    );
    // }
    form.setFieldValue(`lineItemsString.${idx}.productId`, result.id, true);
    form.setFieldValue(
      `lineItemsString.${idx}.discountType`,
      result.discountType,
      true
    );
    this.updateAmount(data);
  };

  renderProductName = (cell, row, props) => {
    const { product_list, strings, disableAll } = this.props;
    const idx = this.getIndex(row.id);
    return (
      <Field
        name={`lineItemsString.${idx}.productId`}
        render={({ field, form }) => (
          <>
            <Select
              isDisabled={disableAll}
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
              id="productId"
              placeholder={strings.Select + strings.Product}
              onChange={(e) => {
                if (e && e.label !== "Select Product") {
                  this.prductValue(
                    e.value,
                    row,
                    "productId",
                    form,
                    field,
                    props
                  );
                } else {
                  form.setFieldValue(
                    `lineItemsString.${idx}.productId`,
                    e.value,
                    true
                  );
                  this.setState({
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
                  });
                }
              }}
              value={
                product_list && row.productId
                  ? selectOptionsFactory
                      .renderOptions("name", "id", product_list, "Product")
                      .find((option) => option.value === +row.productId)
                  : []
              }
              className={`${
                props.errors.lineItemsString &&
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
            {row["productId"] != "" && (!disableAll || row["description"]) ? (
              <div className="mt-1">
                <TextField
                  type="textarea"
                  inputProps={{ maxLength: 2000 }}
                  multiline
                  minRows={1}
                  maxRows={4}
                  disabled={disableAll}
                  value={
                    row["description"] !== "" && row["description"] !== null
                      ? row["description"]
                      : ""
                  }
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
                  className={`textarea ${
                    props.errors.lineItemsString &&
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
          </>
        )}
      />
    );
  };

  renderProduct = (cell, row, props) => {
    const { strings, enableAccount } = this.props;
    return (
      <Row className="m-0 p-0">
        <Col lg={12} className="p-0 mb-1">
          {this.renderProductName(cell, row, props)}
        </Col>
        {row["productId"] && enableAccount && (
          <Col lg={12} className="p-0">
            <label style={{ fontWeight: 600 }}>{strings.Account}</label>
            {this.renderAccount(cell, row, props)}
          </Col>
        )}
      </Row>
    );
  };
  renderAccount = (cell, row, props) => {
    const { strings, purchaseCategory, purchaseCategoryOptions, disableAll } =
      this.props;
    const idx = this.getIndex(row.id);
    return (
      <Field
        name={`lineItemsString.${idx}.transactionCategoryId`}
        render={({ field, form }) => (
          <Select
            styles={{
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
            options={purchaseCategory ? purchaseCategory : []}
            id="transactionCategoryId"
            onChange={(e) => {
              this.selectItem(
                e.value,
                row,
                "transactionCategoryId",
                form,
                field,
                props
              );
            }}
            value={
              purchaseCategoryOptions
                ? purchaseCategoryOptions.find(
                    (obj) => obj.value === row.transactionCategoryId
                  )
                : ""
            }
            isDisabled={row.transactionCategoryId === 150 || disableAll}
            placeholder={strings.Select + strings.Account}
            className={`${
              props.errors.lineItemsString &&
              props.errors.lineItemsString[parseInt(idx, 10)] &&
              props.errors.lineItemsString[parseInt(idx, 10)]
                .transactionCategoryId &&
              Object.keys(props.touched).length > 0 &&
              props.touched.lineItemsString &&
              props.touched.lineItemsString[parseInt(idx, 10)] &&
              props.touched.lineItemsString[parseInt(idx, 10)]
                .transactionCategoryId
                ? "is-invalid"
                : ""
            }`}
          />
        )}
      />
    );
  };

  deleteRow = (e, row, props) => {
    const { data, setData } = this.props;
    const id = row["id"];
    let newData = [];
    e.preventDefault();
    newData = data.filter((obj) => obj.id !== id);
    setData(newData);
    this.updateAmount(newData);
  };

  renderActions = (cell, rows, props) => {
    const { disableAll, data } = this.props;
    return rows["productId"] != "" ? (
      <Button
        size="sm"
        className="btn-twitter btn-brand icon mt-1"
        disabled={disableAll && data && data.length === 1 ? true : false}
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
    const { data } = this.props;
    if (data && data.length > 0) {
      let length = data.length - 1;
      let temp =
        data?.[length].productId !== "" ? data?.[length].productId : -2;
      if (temp > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };
  render() {
    const {
      data,
      initValue,
      isRegisteredVat,
      universal_currency_list,
      props,
      strings,
      discountEnabled,
      disableVat,
    } = this.props;
    let hasExciseTax = false;

    if (initValue) {
      hasExciseTax = data.some(
        (row) =>
          row.exciseTaxId !== null &&
          row.exciseTaxId !== "" &&
          row.exciseTaxId !== 0
      );
    }
    return (
      <Row>
        <Col lg={12} className="product-table">
          {props.errors.lineItemsString &&
            props.errors.lineItemsString === "string" && (
              <div className={props.errors.lineItemsString ? "is-invalid" : ""}>
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
              width="2.5%"
              dataFormat={(cell, rows) => this.renderActions(cell, rows, props)}
            ></TableHeaderColumn>
            <TableHeaderColumn
              dataField="product"
              width="19%"
              style={{ minWidth: "150px" }}
              dataFormat={(cell, rows) => this.renderProduct(cell, rows, props)}
            >
              {strings.Products}
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="quantity"
              style={{ maxWidth: "5%" }}
              dataFormat={(cell, rows) =>
                this.renderQuantity(cell, rows, props)
              }
            >
              {strings.QUANTITY}
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="unitPrice"
              style={{ maxWidth: "5%" }}
              dataFormat={(cell, rows) =>
                this.renderUnitPrice(cell, rows, props)
              }
            >
              {strings.UnitPrice}
            </TableHeaderColumn>
            {discountEnabled == true && (
              <TableHeaderColumn
                dataField="discount"
                style={{ maxWidth: "8%" }}
                dataFormat={(cell, rows) =>
                  this.renderDiscount(cell, rows, props)
                }
              >
                {strings.DisCount}
              </TableHeaderColumn>
            )}
            {hasExciseTax && (
              <TableHeaderColumn
                dataField="exciseTaxId"
                width="12%"
                dataFormat={(cell, rows) =>
                  this.renderExcise(cell, rows, props)
                }
              >
                {strings.Excises}
                <i id="ExiseTooltip" className="fa fa-question-circle ml-1"></i>
                <UncontrolledTooltip placement="right" target="ExiseTooltip">
                  Excise dropdown will be enabled only for the excise products
                </UncontrolledTooltip>
              </TableHeaderColumn>
            )}
            {!disableVat && (
              <TableHeaderColumn
                width={"245px"}
                dataField="vat"
                dataFormat={(cell, rows) => this.renderVat(cell, rows, props)}
              >
                {strings.VAT}
              </TableHeaderColumn>
            )}
            {isRegisteredVat && (
              <TableHeaderColumn
                dataField="sub_total"
                style={{ maxWidth: "10%" }}
                dataFormat={this.renderVatAmount}
                className="text-right"
                columnClassName="text-right"
                formatExtraData={universal_currency_list}
              >
                {strings.VATAMOUNT}
              </TableHeaderColumn>
            )}
            <TableHeaderColumn
              dataField="sub_total"
              dataFormat={this.renderSubTotal}
              className="text-right"
              style={{ maxWidth: "10%" }}
              columnClassName="text-right"
              formatExtraData={universal_currency_list}
            >
              {strings.SUBTOTAL}
            </TableHeaderColumn>
          </BootstrapTable>
        </Col>
      </Row>
    );
  }
}
export default ProductTable;
