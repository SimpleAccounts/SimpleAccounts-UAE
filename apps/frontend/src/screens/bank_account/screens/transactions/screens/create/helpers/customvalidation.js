import moment from "moment";
import * as Yup from "yup";
export const createTransValidation = (values) => {
  let errors = {};
  const totalexpaled = values?.invoiceIdList.reduce(
    (a, c) => a + c.explainedAmount,
    0
  );

  if (
    values.coaCategoryId.label === "VAT Payment" ||
    values.coaCategoryId.label === "VAT Claim"
  ) {
    if (values?.transactionAmount > values?.vatDueAmount)
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

  const date = moment(values.transactionDate).format("MM/DD/YYYY");
  const date1 = new Date(date);
  const date2 = new Date(this.state.date);

  if (
    values.coaCategoryId &&
    this.props.location.state?.currency === "AED" &&
    (values.coaCategoryId.label === "VAT Payment" ||
      values.coaCategoryId.label === "VAT Claim")
  ) {
    if (!values.VATReportId || values.VATReportId === "") {
      errors.VATReportId = "Please Select Vat Report";
    }
  }

  if (
    values.coaCategoryId.label !== "Expense" &&
    values.coaCategoryId.label !== "Supplier Invoice" &&
    values.coaCategoryId.label !== "Sales" &&
    values.coaCategoryId.label !== "VAT Payment" &&
    values.coaCategoryId.label !== "VAT Claim"
  ) {
    if (!values.transactionCategoryId || values.transactionCategoryId === "") {
      errors.transactionCategoryId = "Category is required";
    }
    if (
      (values.coaCategoryId.value === 12 || values.coaCategoryId.value === 6) &&
      !values.employeeId
    ) {
      errors.employeeId = "User is Required";
    }
  }
  if (values.coaCategoryId.label === "Expense" && !values.expenseCategory) {
    errors.expenseCategory = "Expense Category is Required";
  }
  if (values.vatId === "" && values.coaCategoryId.label === "Expense") {
    errors.vatId = "Please select Vat";
  }

  if (values.coaCategoryId.value === 2 || values.coaCategoryId.value === 100) {
    if (!values.vendorId.value && values.coaCategoryId.value === 100) {
      errors.vendorId = "Please select the Vendor";
    }
    if (!values.customerId.value && values.coaCategoryId.value === 2) {
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
        errors.invoiceIdList = "Expain Amount Cannot Be Zero";
      }

      values.invoiceIdList.map((ii) => {
        if (
          this.state.bankCurrency.bankAccountCurrency !==
            this.state.basecurrency.currencyCode &&
          this.state.basecurrency.currencyCode !== ii.currencyCode &&
          this.state.bankCurrency.bankAccountCurrency !== ii.currencyCode
        )
          errors.invoiceIdList =
            "Invoices created in another FCY cannot be processed by this foreign currency bank account.";
      });

      if (
        values.transactionAmount > totalexpaled &&
        this.state?.bankCurrency?.bankAccountCurrency ===
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
        this.state?.bankCurrency?.bankAccountCurrency ===
          values?.invoiceIdList?.[0]?.currencyCode &&
        isppselected === 0
      ) {
        errors.transactionAmount = `The transaction amount is less than the invoice amount. To partially pay the invoice, please select the checkbox `;
      }
    }

    if (date1 < date2 || date1 < new Date(this.state.reconciledDate)) {
      errors.transactionDate =
        "Transaction Date cannot be before Bank Account Opening Date or after Current Date.";
    }

    if (values.coaCategoryId.label === "Expense" && !values.currencyCode) {
      errors.currencyCode = " Currency is Required";
    }

    if (
      this.state.totalInvoiceAmount === "" &&
      this.state.totalInvoiceAmount === 0
    ) {
      errors.transactionAmount = `Enter Amount`;
    }
  }

  return errors;
};

export const createTranYupSchema = () => {
  return Yup.object().shape({
    transactionDate: Yup.date().required("Transaction Date is Required"),
    reference: Yup.string().max(20),
    transactionAmount: Yup.string()
      .required("Transaction Amount is Required")
      .test(
        "transactionAmount",
        "Transaction Amount Must Be Greater Than 0",
        (value) => value > 0
      ),
    coaCategoryId: Yup.string().required("Transaction Type is Required"),
    attachment: Yup.mixed()
      .test("fileType", "*Unsupported File Format", (value) => {
        value &&
          this.setState({
            fileName: value.name,
          });
        if (
          !value ||
          (value && this.supported_format.includes(value.type)) ||
          !value
        ) {
          return true;
        } else {
          return false;
        }
      })
      .test("fileSize", "*File Size is too large", (value) => {
        if (!value || (value && value.size <= this.file_size) || !value) {
          return true;
        } else {
          return false;
        }
      }),
  });
};
