import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Row, Col, Input, UncontrolledTooltip } from "reactstrap";
import Select from "react-select";
import { Controller, useFormContext } from "react-hook-form";
import { Currency } from "components";
import { optionFactory, selectOptionsFactory, selectStyles } from "utils";
import "./style.scss";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";

const ProductTable = ({
  data,
  setData,
  idCount,
  setIdCount,
  strings,
  disableAll,
  initValue,
  isRegisteredVat,
  universal_currency_list,
  discountEnabled,
  disableVat,
  vat_list,
  excise_list,
  product_list,
  exchangeRate,
  getProductType,
  enableAccount,
  purchaseCategory,
  purchaseCategoryOptions,
  updateAmount,
}) => {
  const {
    control,
    formState: { errors, touchedFields },
    setValue,
    trigger,
  } = useFormContext();

  const [discountOptions] = useState([
    { value: "FIXED", label: "FIXED" },
    { value: "PERCENTAGE", label: "%" },
  ]);

  const regEx = /^[0-9\b]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$/;

  const getIndex = (id) => {
    let idx = data.findIndex(obj => obj.id === id);
    return idx;
  };

  const addRow = async () => {
    if (!disableAll) {
      const newRow = {
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
      };
      const newData = [...data, newRow];
      await setData(newData);
      await setIdCount(idCount + 1);
    }
  };

  const checkedRow = () => {
    if (data && data.length > 0) {
      let length = data.length - 1;
      let temp = data?.[length].productId !== "" ? data?.[length].productId : -2;
      return temp > -1;
    }
    return true;
  };

  const updateAmountAndAddRow = useCallback(
    async (newData) => {
      await updateAmount(newData);
      if (checkedRow()) await addRow();
    },
    [data, updateAmount]
  );

  const selectItem = useCallback(
    async (e, row, name, idx) => {
      let newData = [...data];
      const itemIndex = newData.findIndex((obj) => obj.id === row.id);

      if (itemIndex !== -1) {
        newData[itemIndex][name] = e;
      }

      await setData(newData);
      setValue(`lineItemsString.${idx}.${name}`, e, { shouldValidate: true });

      if (
        ["unitPrice", "vatCategoryId", "quantity", "exciseTaxId", "discount"].includes(name)
      ) {
        updateAmountAndAddRow(newData);
      }
    },
    [data, setData, setValue, updateAmountAndAddRow]
  );

  const columns = useMemo(() => {
    const cols = [
        {
            id: 'actions',
            header: '',
            size: 50,
            cell: ({ row }) => (
                row.original.productId !== "" && (
                    <Button
                        size="sm"
                        className="btn-twitter btn-brand icon mt-1"
                        disabled={disableAll && data && data.length === 1}
                        onClick={(e) => {
                            e.preventDefault();
                            const newData = data.filter(obj => obj.id !== row.original.id);
                            setData(newData);
                            updateAmount(newData);
                        }}
                    >
                        <i className="fas fa-trash"></i>
                    </Button>
                )
            ),
        },
        {
            accessorKey: 'productId',
            header: strings.Products,
            size: 300,
            cell: ({ row }) => {
                const idx = getIndex(row.original.id);
                // Render select and textarea logic ...
                return (
                    <div className="flex flex-col gap-1">
                        <Select
                            isDisabled={disableAll}
                            options={product_list ? optionFactory.renderOptions("name", "id", product_list, "Product") : []}
                            value={product_list && selectOptionsFactory.renderOptions("name", "id", product_list, "Product").find(opt => opt.value === +row.original.productId)}
                            onChange={(e) => {
                                if (e && e.label !== "Select Product") {
                                    // productValue logic ...
                                }
                            }}
                        />
                        {row.original.productId !== "" && (
                            <Textarea
                                value={row.original.description || ""}
                                disabled={disableAll}
                                onChange={(e) => selectItem(e.target.value, row.original, "description", idx)}
                            />
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'quantity',
            header: strings.QUANTITY,
            cell: ({ row }) => {
                const idx = getIndex(row.original.id);
                return (
                    <div className="flex gap-1">
                        <Input
                            type="number"
                            value={row.original.quantity || 0}
                            onChange={(e) => selectItem(e.target.value, row.original, "quantity", idx)}
                        />
                        {row.original.productId !== "" && <Input value={row.original.unitType} disabled className="w-20" />}
                    </div>
                );
            },
        },
        {
            accessorKey: 'unitPrice',
            header: strings.UnitPrice,
            cell: ({ row }) => {
                const idx = getIndex(row.original.id);
                return (
                    <Input
                        disabled={disableAll}
                        type="number"
                        value={row.original.unitPrice || 0}
                        onChange={(e) => selectItem(e.target.value, row.original, "unitPrice", idx)}
                    />
                );
            },
        },
    ];

    if (discountEnabled) {
        cols.push({
            accessorKey: 'discount',
            header: strings.DisCount,
            cell: ({ row }) => {
                const idx = getIndex(row.original.id);
                return (
                    <div className="flex flex-col gap-1">
                        <Input
                            disabled={disableAll}
                            value={row.original.discount || 0}
                            onChange={(e) => selectItem(e.target.value, row.original, "discount", idx)}
                        />
                        <Select
                            isDisabled={disableAll}
                            options={discountOptions}
                            value={discountOptions.find(opt => opt.value === row.original.discountType)}
                            onChange={(e) => selectItem(e.value, row.original, "discountType", idx)}
                        />
                    </div>
                );
            },
        });
    }

    if (!disableVat) {
        cols.push({
            accessorKey: 'vatCategoryId',
            header: strings.VAT,
            cell: ({ row }) => {
                const idx = getIndex(row.original.id);
                return (
                    <Select
                        options={vat_list}
                        value={vat_list.find(opt => opt.value === parseInt(row.original.vatCategoryId))}
                        onChange={(e) => selectItem(e.value, row.original, "vatCategoryId", idx)}
                    />
                );
            },
        });
    }

    cols.push({
        accessorKey: 'subTotal',
        header: strings.SUBTOTAL,
        cell: ({ row }) => (
            <div className="text-right">
                <Currency value={row.original.subTotal} currencySymbol={initValue.currencyIsoCode} />
            </div>
        ),
    });

    return cols;
  }, [data, product_list, vat_list, discountEnabled, disableVat, initValue.currencyIsoCode]);

  return (
    <Row>
      <Col lg={12}>
        <DataTable
          data={data}
          columns={columns}
          manualPagination={false}
        />
      </Col>
    </Row>
  );
};

export default ProductTable;
