import moment from "moment";
import { data } from "screens/Language/index";
import LocalizedStrings from "react-localization";


const language = window["localStorage"].getItem("language");
const strings = new LocalizedStrings(data);
strings.setLanguage(language ?? 'en');


export const postZipCodeError = (value, countryID) => {
    const ZipCodeInputValitiona = {
        229: { maxLength: 6, minLength: 3, regEx: /^[0-9\d]+$/ },
        191: { maxLength: 6, minLength: 4, regEx: /^\d{5}(?:-\d{4})?$/ },
        21: { maxLength: 4, minLength: 4, regEx: /^[1-9]\d{3}$/ },
    }
    countryID = countryID ? countryID.value ? countryID.value : countryID : '';
    const maxLength = ZipCodeInputValitiona[countryID]?.maxLength ?? '6';
    const minLength = ZipCodeInputValitiona[countryID]?.minLength ?? '6';
    const regEx = ZipCodeInputValitiona[countryID]?.regEx ?? /^[0-9-\d]+$/;

    if (countryID) {
        if (countryID === 229) {
            if (!value)
                return strings.POBoxNumberIsRequired;
            else if (value.length < minLength || value.length > maxLength || !regEx.test(value))
                return strings.PleaseEnter3To6DigitPOBoxNumber;
            else
                return '';
        } else {
            if (!value) {
                return strings.PostalZipCodeRequired;
            } else {
                if (value.length < minLength || value.length > maxLength || !regEx.test(value))
                    return strings.InvalidPostalZipCode;
                else
                    return '';
            }
        }

    }
    return '';
};

export const addressValidation = (values) => {
    const error = {};
    if (values.fax && values.fax?.length !== 15) {
        error.fax = strings.PleaseEnter15DigitFax;
    }
    if (!values.address) {
        error.address = strings.AddressRequired;
    }
    if (!values.countryId) {
        error.countryId = strings.CountryIsRequired;
    }
    if(!values.postZipCode){
        error.postZipCode = strings.PostalZipCodeRequired;
    }
    const postZipCode = postZipCodeError(values.postZipCode, values.countryId)
    if (postZipCode) {
        error.postZipCode = postZipCode;
    }
    if (values.countryId == 229) {
        if (values.stateId == "")
            error.stateId = 'Emirate is required';
    } else {
        if (values.stateId == "")
            error.stateId = "State / Provinces is required";
    }
    return error;
}
