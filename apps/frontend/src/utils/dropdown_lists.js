import moment from "moment";
import { data } from "screens/Language/index";
import LocalizedStrings from "react-localization";
import {
  selectOptionsFactory,
  selectCurrencyFactory,
  selectOptionsFactoryClickable,
} from "utils";

const language = window["localStorage"].getItem("language");
const strings = new LocalizedStrings(data);
strings.setLanguage(language ?? "en");

export const getCurrencyDropdown = (list) => {
  const newList = list
    ? selectCurrencyFactory.renderOptions(
        "currencyName",
        "currencyCode",
        list,
        strings.Currency
      )
    : [];
  return newList;
};

export const getCountryDropdown = (list) => {
  const newList = list
    ? selectOptionsFactory.renderOptions(
        "countryName",
        "countryCode",
        list,
        "Country"
      )
    : [];
  return newList;
};

export const getStateDropdown = (list, countryId) => {
  const newList = list
    ? selectOptionsFactory.renderOptions(
        "label",
        "value",
        list,
        countryId === 229 ? strings.Emirate : strings.StateRegion
      )
    : [];
  return newList;
};
export const getBankDropdown = (list) => {
  const newList = list
    ? selectOptionsFactoryClickable.renderOptions(
        "bankName",
        "bankId",
        list,
        "Bank",
        "fa fa-trash-o",
        (id) => {}
      )
    : [];
  return newList;
};

export const getContactDropDownList = (contact_list) => {
  const tmpContact_list = [];
  if (contact_list) {
    contact_list &&
      contact_list.map((item) => {
        if (item.label) {
          const obj = { label: item?.label?.contactName, value: item?.value };
          tmpContact_list.push(obj);
        }
      });
  }
  const newList = tmpContact_list
    ? selectOptionsFactory.renderOptions(
        "label",
        "value",
        tmpContact_list,
        strings.Customer
      )
    : [];
  return newList;
};
