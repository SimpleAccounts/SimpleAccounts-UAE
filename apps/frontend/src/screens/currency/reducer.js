import { CURRENCY } from 'constants/types';

const initState = {
  currency_list: [],
};

const CurrencyReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    case CURRENCY.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Array.isArray(payload.data) ? payload.data : payload || [],
      };

    default:
      return state;
  }
};

export default CurrencyReducer;
