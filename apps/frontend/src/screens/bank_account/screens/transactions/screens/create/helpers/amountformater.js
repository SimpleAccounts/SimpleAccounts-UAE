export const amountFormat = (amount, currency) => {
  if (currency) {
    return `${currency} ${amount.toLocaleString(navigator.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return amount.toLocaleString(navigator.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
