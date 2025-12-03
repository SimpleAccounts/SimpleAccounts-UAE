import React from 'react';
import {
    FormGroup,
    Input,
    Label,
    Col,
} from 'reactstrap';
import { TextField } from '@material-ui/core';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';


const ZipCodeInputValitiona = {
    229: { maxLength: 6, minLength: 3 },
    191: { maxLength: 6, minLength: 6 },
    21: { maxLength: 4, minLength: 4 },
}

function ZipCodeInput(props) {
    let strings = new LocalizedStrings(data);
    const language = window['localStorage'].getItem('language');
    strings.setLanguage(language ?? 'en');
    const { onChange, zipCodeName, zipCodeValue, countryId, zipCodeError, zipCodeTouched, required } = props;
    const placeholder = countryId === 229 ? strings.POBoxNumber : strings.PostZipCode;
    return (
        <>
            <FormGroup className="mb-3">
                <Label htmlFor={zipCodeName}>
                    {required && <span className="text-danger">* </span>} {countryId == 229 ? strings.POBoxNumber : strings.PostZipCode}
                </Label>
                <Input
                    maxLength={ZipCodeInputValitiona[countryId]?.maxLength ?? '6'}
                    minLength={ZipCodeInputValitiona[countryId]?.minLength ?? '6'}
                    type="text"
                    id={zipCodeName}
                    name={zipCodeName}
                    placeholder={strings.Enter + placeholder}
                    value={zipCodeValue}
                    onChange={(option) => {
                        const regEx = /^[0-9-\d]+$/;
                        if (option.target.value === '' || regEx.test(option.target.value)) {
                            onChange(zipCodeName, option);
                        }
                    }}
                    className={
                        zipCodeError &&
                            zipCodeTouched
                            ? 'is-invalid'
                            : ''
                    }
                />
                {zipCodeError &&
                    zipCodeTouched && (
                        <div className="invalid-feedback">
                            {zipCodeError}
                        </div>
                    )}
            </FormGroup>
            
        </>
    )
}

export default ZipCodeInput;
