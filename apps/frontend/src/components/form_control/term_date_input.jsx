import React from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HelpCircle } from 'lucide-react';

import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { data } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';
import { selectOptionsFactory, selectStyles } from 'utils';
import dayjs from '@/utils/date';

const strings = new LocalizedStrings(data);

function setDate(term, invoiceDate) {
  term = term ? term.value ?? term : '';
  const val = term ? term.split('_') : '';
  const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];
  const values = invoiceDate;
  if (temp && values) {
    const date1 = dayjs(values).add(temp, 'days').toDate();
    return date1;
  }
  return '';
}

const termList = [
  { label: 'Net 7 Days', value: 'NET_7' },
  { label: 'Net 10 Days', value: 'NET_10' },
  { label: 'Net 15 Days', value: 'NET_15' },
  { label: 'Net 30 Days', value: 'NET_30' },
  { label: 'Net 45 Days', value: 'NET_45' },
  { label: 'Net 60 Days', value: 'NET_60' },
  { label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
];

/**
 * Modern Term Date Input Component
 * Uses shadcn/ui components with react-datepicker
 */
function TermDateInput(props) {
  const language = window.localStorage.getItem('language') || 'en';
  strings.setLanguage(language);

  const { onChange, fields } = props;
  const { term, invoiceDate, invoiceDueDate } = fields;

  return (
    <TooltipProvider>
      <>
        {/* Term Select */}
        <div className="lg:col-span-3">
          <div className="mb-3">
            <Label htmlFor="term" className="mb-2 block">
              {term.required && <span className="text-destructive">* </span>}
              {term.label}{' '}
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="inline h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="mb-1">
                    Terms- The duration given to a buyer for payment.
                  </p>
                  <p className="mb-1">Net 7 – payment due in 7 days from invoice date</p>
                  <p className="mb-1">Net 10 – payment due in 10 days from invoice date</p>
                  <p>Net 30 – payment due in 30 days from invoice date</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select
              styles={selectStyles}
              options={selectOptionsFactory.renderOptions('label', 'value', termList, 'Terms')}
              isDisabled={term.disabled}
              id="term"
              name="term"
              placeholder={`${strings.Select} ${strings.Terms}`}
              value={
                term.values?.value
                  ? term.values
                  : termList.find((option) => option.value === term.values)
              }
              onChange={(option) => {
                if (option?.value) {
                  const dueDateValue = setDate(option.value, invoiceDate.value ?? new Date());
                  onChange('term', option.value);
                  onChange('invoiceDueDate', dueDateValue);
                } else {
                  onChange('term', '');
                }
              }}
              className={term.errors && term.touched ? 'border-destructive' : ''}
            />
            {term.errors && term.touched && (
              <div className="text-sm text-destructive mt-1">{term.errors}</div>
            )}
          </div>
        </div>

        {/* Invoice Date */}
        <div className="lg:col-span-3">
          <div className="mb-3">
            <Label htmlFor={invoiceDate.name} className="mb-2 block">
              <span className="text-destructive">* </span>
              {invoiceDate.label}
            </Label>
            <DatePicker
              id={invoiceDate.name}
              name={invoiceDate.name}
              placeholderText={invoiceDate.placeholder}
              showMonthDropdown
              showYearDropdown
              dateFormat="dd-MM-yyyy"
              dropdownMode="select"
              value={invoiceDate.values}
              selected={invoiceDate.values}
              minDate={invoiceDate.minDate}
              onChange={(value) => {
                const dueDateValue = setDate(term.values, value);
                onChange('invoiceDate', value);
                onChange('invoiceDueDate', dueDateValue);
              }}
              className={`input-transition w-full border rounded px-3 py-2 ${
                invoiceDate.errors && invoiceDate.touched ? 'border-destructive' : ''
              }`}
            />
            {invoiceDate.errors && invoiceDate.touched && (
              <div className="text-sm text-destructive mt-1">{invoiceDate.errors}</div>
            )}
          </div>
        </div>

        {/* Invoice Due Date */}
        <div className="lg:col-span-3">
          <div className="mb-3">
            <Label htmlFor={invoiceDueDate.name} className="mb-2 block">
              {invoiceDueDate.label}
            </Label>
            <DatePicker
              id={invoiceDueDate.name}
              name={invoiceDueDate.name}
              placeholderText={invoiceDueDate.placeholder}
              showMonthDropdown
              showYearDropdown
              disabled={invoiceDueDate.disabled}
              dateFormat="dd-MM-yyyy"
              dropdownMode="select"
              selected={invoiceDueDate.values}
              value={invoiceDueDate.values}
              onChange={(value) => {
                onChange('invoiceDueDate', value);
              }}
              className="input-transition w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </>
    </TooltipProvider>
  );
}

export default TermDateInput;
