export const calculateVAT = (
  transactionAmount,
  vatId,
  exclusiveVat,
) => {
  let list='';
  if (transactionAmount && vatId === 1 && exclusiveVat) {
    let transactionVatAmount = 0;
    let transactionExpenseAmount = 0;
    transactionVatAmount = transactionAmount * 0.05;
    transactionExpenseAmount = transactionVatAmount + transactionAmount;
    transactionAmount = transactionExpenseAmount;
    list = {
      transactionAmount: transactionAmount,
      transactionVatAmount: transactionVatAmount,
      transactionExpenseAmount: transactionExpenseAmount,
    }
  } else if (transactionAmount && vatId === 1 && !exclusiveVat) {
    let transactionVatAmount = 0;
    let transactionExpenseAmount = 0;
    transactionVatAmount = (transactionAmount * 5) / 105;
    transactionExpenseAmount = transactionAmount - transactionVatAmount;
    list = {
      transactionAmount: transactionAmount,
      transactionVatAmount: transactionVatAmount,
      transactionExpenseAmount: transactionExpenseAmount,
    }
  }
  else {
    list = {
      transactionAmount: transactionAmount,
      transactionVatAmount: 0,
      transactionExpenseAmount: 0,
    }
  }
  return list;
};
