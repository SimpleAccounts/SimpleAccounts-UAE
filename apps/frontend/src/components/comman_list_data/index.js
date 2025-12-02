const reportPeriod = [
    { label: "Montly", value: 0 },
    { label: "Yearly", value: 1 },
    { label: "Quarterly", value: 2 },
];
const termList = [
    { label: "Net 7 Days", value: "NET_7" },
    { label: "Net 10 Days", value: "NET_10" },
    { label: "Net 30 Days", value: "NET_30" },
    { label: 'Net 45 Days', value: 'NET_45' },
    { label: 'Net 60 Days', value: 'NET_60' },
    { label: "Due on Receipt", value: "DUE_ON_RECEIPT" },
];
const reasonList = [
    { label: 'Cancellation of Sales', value: '1' },
    { label: 'Expiry or damage', value: '2' },
    { label: 'Customer’s dissatisfaction', value: '3' },
    { label: 'Product unsatisfactory', value: '4' },
    { label: 'Sales Return', value: '5' },
    { label: 'Service Unsatisfactory', value: '6' },
    { label: 'Post Sales Discount', value: '7' },
    { label: 'Change in the Quantity', value: '8' },
    { label: 'Correction in Invoice', value: '9' },
    { label: 'Refund', value: '10' },
    { label: 'Wrong products dispatched to the customer.', value: '11' },
    { label: 'Others', value: '12' },
];

export const CommonList = {
    termList: termList,
    reportPeriod: reportPeriod,
    reasonList:reasonList,
}