import { Label } from '@/components/ui/label';

import { data } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);

// Corporate theme constants
const theme = {
  bgWhite: '#ffffff',
  border: '#e5e7eb',
  textPrimary: '#111827',
};

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

  const { onChange, zipCodeName, zipCodeValue, countryId, zipCodeError, zipCodeTouched, required } =
    props;

  const placeholder = countryId === 229 ? strings.POBoxNumber : strings.PostZipCode;
  const label = countryId === 229 ? strings.POBoxNumber : strings.PostZipCode;

  return (
    <div className="mb-3">
      <Label htmlFor={zipCodeName} className="mb-2 block">
        {required && <span className="text-destructive">* </span>}
        {label}
      </Label>
      <input
        maxLength={ZipCodeInputValidation[countryId]?.maxLength ?? 6}
        minLength={ZipCodeInputValidation[countryId]?.minLength ?? 6}
        type="text"
        id={zipCodeName}
        name={zipCodeName}
        placeholder={`${strings.Enter} ${placeholder}`}
        value={zipCodeValue || ''}
        onChange={e => {
          const regEx = /^[0-9-]+$/;
          if (e.target.value === '' || regEx.test(e.target.value)) {
            onChange(zipCodeName, e);
          }
        }}
        className={`flex h-10 w-full rounded-lg px-3 py-2 text-base md:text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 ${
          zipCodeError && zipCodeTouched ? 'border-red-500' : ''
        }`}
        style={{
          backgroundColor: theme.bgWhite,
          border: `1px solid ${zipCodeError && zipCodeTouched ? '#ef4444' : theme.border}`,
          color: theme.textPrimary,
        }}
        data-testid="zip-code-input"
      />
      {zipCodeError && zipCodeTouched && (
        <div className="text-sm text-destructive mt-1">{zipCodeError}</div>
      )}
    </div>
  );
}

export default ZipCodeInput;
