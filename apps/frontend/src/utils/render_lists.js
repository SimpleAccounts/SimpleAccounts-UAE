export const getTransactionCategoryList = (list) => {
    let categoryList = [];
    if (list) {
        list.map(obj => {
            categoryList = [...categoryList, ...obj.options];
        })
    }
    return categoryList;
}

export const addRow = (data, idCount) => {
    debugger
    data = data.filter(obj => obj.productId !== '');
    data = data.concat({
        id: idCount + 1,
        description: '',
        quantity: 1,
        unitPrice: '',
        vatCategoryId: '',
        subTotal: 0,
        exciseTaxId: '',
        discountType: 'FIXED',
        vatAmount: 0,
        discount: 0,
        productId: '',
        unitType: '',
        unitTypeId: '',

    })
    return data;
}

function getMaxID(lineItems) {
    const maxID = lineItems && lineItems.length > 0 ? lineItems.reduce((max, item) => (item.id > max ? item.id : max), lineItems[0]?.id || 0) : 0;
    return maxID;
}

export const mapInvoiceListFromQuotation = (data) => {
    const state = {};
    const initValue = {};
    const lineItems = data.poQuatationLineItemRequestModelList;
    initValue.contactId = data.customerId;
    initValue.notes = data.notes;
    initValue.lineItemsString = lineItems;
    initValue.receiptNumber = data.quotationNumber;
    initValue.currencyCode = data.currencyCode;
    initValue.currencyIsoCode = data.currencyIsoCode;
    initValue.currencyName = data.currencyName;
    initValue.exchangeRate = data.exchangeRate;
    initValue.taxTreatmentId = data.taxtreatment;
    initValue.placeOfSupplyId = data.placeOfSupplyId;
    state.taxTreatmentId = data.taxtreatment;
    state.isQuotationSelected = true;
    state.taxType = data.taxType;
    state.quotationId = data.id;
    state.discountEnabled = data.discount > 0 ? true : false;
    state.data = lineItems;
    state.quotationDate= new Date(data.quotationdate);
    state.idCount = getMaxID(lineItems) + 1;

    return { initValue, state }
}

export const mapInvoiceList = (data) => {
    const state = {};
    const initValue = {};
    const lineItems = data.invoiceLineItems;
    initValue.contactId = data.contactId;
    initValue.notes = data.notes;
    initValue.footNote = data.footNote;
    initValue.lineItemsString = lineItems;
    initValue.receiptNumber = data.receiptNumber;
    initValue.taxTreatmentId = data.taxTreatment;
    initValue.currencyCode = data.currencyCode;
    initValue.currencyIsoCode = data.currencyIsoCode;
    initValue.currencyName = data.currencyName;
    initValue.exchangeRate = data.exchangeRate;
    initValue.invoiceDueDate = new Date(data.invoiceDueDate);
    initValue.invoiceDate = new Date(data.invoiceDate);
    initValue.invoiceNumber = data.referenceNumber;
    initValue.term = data.term;
    initValue.shippingAddress = {
        city: data.shippingCity ?? '',
        countryId: data.shippingCountry ?? '',
        address: data.shippingAddress ?? '',
        postZipCode: data.shippingPostZipCode || data.shippingPoBoxNumber,
        stateId: data.shippingState ?? '',
        telephone: data.shippingTelephone ?? '',
        fax: data.shippingFax ?? '',
    };
    initValue.placeOfSupplyId = data.placeOfSupplyId;
    state.taxTreatmentId = data.taxTreatment
    state.status = data.status;
    state.term = data.term;
    state.taxType = data.taxType;
    state.parentInvoiceId = data.invoiceId;
    state.discountEnabled = data.discount > 0 ? true : false;
    state.data = lineItems;
    state.idCount = getMaxID(lineItems) + 1;

    return { initValue, state }
}
