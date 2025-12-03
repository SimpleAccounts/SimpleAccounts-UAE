export const defaultState = (currency, isRegisteredVat) => {
  return {
    language: window["localStorage"].getItem("language"),
    createMore: false,
    disabled: false,
    fileName: "",
    initValue: {
      transactionId: "",
      bankAccountId: "",
      transactionDate: new Date(),
      description: "",
      transactionAmount: "",
      coaCategoryId: "",
      transactionCategoryId: "",
      projectId: "",
      reference: "",
      attachementDescription: "",
      attachment: "",
      customerId: "",
      invoiceIdList: [],
      payrollListIds: [],
      vatId: "",
      expenseCategory: "",
      vendorId: "",
      employeeId: "",
      currencyCode: "",
      currencyName: "",
      exchangeRate: null,
      exclusiveVat: false,
      isReverseChargeEnabled: false,
      ct_taxPeriod:'',
      ct_taxPeriodList:'',
      corporateTaxList:[],
    },
    transactionVatAmount: "",
    transactionExpenseAmount: "",
    expenseType: true,
    loadingMsg: "Loading...",
    disableLeavePage: false,
    transactionCategoryList: [],
    moneyCategoryList: [],
    VATlist: [],
    totalAmount: "",
    categoriesList: [
      {
        label: "Money Spent",
        options: [
          {
            value: 11,
            label: "Transfered To",
          },
          {
            value: 12,
            label: "Money Paid To Employee",
          },
          {
            value: 13,
            label: "Purchase Of Capital Asset",
          },
          {
            value: 14,
            label: "Money Spent Others",
          },
          {
            value: 10,
            label: "Expense",
          },
          {
            value: 100,
            label: "Supplier Invoice",
          },
          {
            ...((currency === "AED" && isRegisteredVat == true)
              ? {
                  value: 16,
                  label: "VAT Payment",
                }
              : {}),
          },
          {
            ...(currency === "AED"
              ? {
                  value: 18,
                  label: "Corporate Tax Payment",
                }
              : {}),
          },
        ].filter((i) => i.label),
      },
      {
        label: "Money Received",
        options: [
          {
            value: 2,
            label: "Sales",
          },
          {
            value: 3,
            label: "Transfered From",
          },
          {
            value: 4,
            label: "Refund Received",
          },
          {
            value: 5,
            label: "Interest Received",
          },
          {
            value: 6,
            label: "Money Received From Employee",
          },
          {
            value: 7,
            label: "Disposal Of Capital Asset",
          },
          {
            value: 8,
            label: "Money Received Others",
          },
          {
            ...((currency === "AED" && isRegisteredVat == true)
              ? {
                  value: 17,
                  label: "VAT Claim",
                }
              : {}),
          },
        ].filter((i) => i.value),
      },
    ],
    cat_label: "",
    cat1_label: "",
    id: "",
    conversionDetails: [],
    selectedPayrollListBank: [],
    companyDetails : [],   
  };
};
