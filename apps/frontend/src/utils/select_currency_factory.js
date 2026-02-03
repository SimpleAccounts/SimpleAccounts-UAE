export const renderOptions = (label_key, value_key, data, placeholder, valueArr) => {
  const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  let result = [{ value: '', label: `Select ${placeholder}` }];
  let a = {};
  if (valueArr && valueArr.length) {
    arr.map(item => {
      valueArr.map(x => (a[`${x}`] = item[`${x}`]));
      result.push({
        label: item[`${label_key}`],
        value: item[`${value_key}`],
        iso: item.currencyIsoCode,
        ...a,
      });
      return item;
    });
  } else {
    arr.map(item => {
      return result.push({
        label: item[`${label_key}`] + ' - ' + item.currencyIsoCode,
        value: item[`${value_key}`],
        iso: item.currencyIsoCode,
        ...a,
      });
    });
  }
  return result;
};
