import React from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { data } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);

const ZipCodeInputValidation = {
  229: { maxLength: 6, minLength: 3 },
  191: { maxLength: 6, minLength: 6 },
  21: { maxLength: 4, minLength: 4 },
};

/**
 * Modern Zip Code Input Component
 * Uses shadcn/ui Input
 */
function ZipCodeInput(props) {
  const language = window.localStorage.getItem('language') || 'en';
  strings.setLanguage(language);

  const {
    onChange,
    zipCodeName,
    zipCodeValue,
    countryId,
    zipCodeError,
    zipCodeTouched,
    required,
  } = props;

  const placeholder = countryId === 229 ? strings.POBoxNumber : strings.PostZipCode;
  const label = countryId === 229 ? strings.POBoxNumber : strings.PostZipCode;

  return (
    <div className="mb-3">
      <Label htmlFor={zipCodeName} className="mb-2 block">
        {required && <span className="text-destructive">* </span>}
        {label}
      </Label>
      <Input
        maxLength={ZipCodeInputValidation[countryId]?.maxLength ?? 6}
        minLength={ZipCodeInputValidation[countryId]?.minLength ?? 6}
        type="text"
        id={zipCodeName}
        name={zipCodeName}
        placeholder={`${strings.Enter} ${placeholder}`}
        value={zipCodeValue || ''}
        onChange={(e) => {
          const regEx = /^[0-9-\d]+$/;
          if (e.target.value === '' || regEx.test(e.target.value)) {
            onChange(zipCodeName, e);
          }
        }}
        className={`input-transition ${zipCodeError && zipCodeTouched ? 'border-destructive' : ''}`}
      />
      {zipCodeError && zipCodeTouched && (
        <div className="text-sm text-destructive mt-1">{zipCodeError}</div>
      )}
    </div>
  );
}

export default ZipCodeInput;
