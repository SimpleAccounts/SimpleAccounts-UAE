import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { X, Play } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import dayjs from '@/utils/date';
import { selectOptionsFactory } from 'utils';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

// Custom select styles for dark mode
const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--input))',
    backgroundColor: 'hsl(var(--background))',
    '&:hover': {
      borderColor: 'hsl(var(--primary))',
    },
  }),
  menu: base => ({
    ...base,
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
    color: 'hsl(var(--foreground))',
  }),
  singleValue: base => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
  input: base => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
};

// Zod validation schema
const filterSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  reportBasis: z.object({
    label: z.string(),
    value: z.string(),
  }),
  chartOfAccountId: z
    .object({
      label: z.string(),
      value: z.any(),
    })
    .nullable()
    .optional(),
});

/**
 * Modern Filter Component
 * Uses functional components, shadcn/ui, and React Hook Form + Zod
 */
function FilterComponent({ chart_of_account_list, viewFilter, generateReport }) {
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');

  const reportBasisOptions = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Accrual', value: 'ACCRUAL' },
  ];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      startDate: dayjs().startOf('month').toDate(),
      endDate: dayjs().endOf('month').toDate(),
      reportBasis: { label: 'Accrual', value: 'ACCRUAL' },
      chartOfAccountId: null,
    },
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const onSubmit = data => {
    const formattedData = {
      startDate: dayjs(data.startDate).format('YYYY-MM-DD HH:mm'),
      endDate: dayjs(data.endDate).format('YYYY-MM-DD HH:mm'),
      reportBasis: data.reportBasis.value,
      chartOfAccountId: data.chartOfAccountId?.value || '',
    };
    generateReport(formattedData);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{strings.CustomizeReport}</CardTitle>
          <button
            type="button"
            onClick={viewFilter}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>{strings.StartDate}</Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholderText="From"
                    showMonthDropdown
                    showYearDropdown
                    selected={field.value}
                    onChange={date => {
                      field.onChange(date);
                      if (dayjs(date).isAfter(endDate)) {
                        setValue('endDate', dayjs(date).add(1, 'M').toDate());
                      }
                    }}
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                  />
                )}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>{strings.EndDate}</Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholderText={strings.Select}
                    showMonthDropdown
                    showYearDropdown
                    selected={field.value}
                    onChange={date => {
                      field.onChange(date);
                      if (dayjs(date).isBefore(startDate)) {
                        setValue('startDate', dayjs(date).subtract(1, 'M').toDate());
                      }
                    }}
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                  />
                )}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>

            {/* Report Basis */}
            <div className="space-y-2">
              <Label>{strings.ReportBasis}</Label>
              <Controller
                name="reportBasis"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    styles={customStyles}
                    placeholder={strings.Select}
                    options={reportBasisOptions}
                  />
                )}
              />
              {errors.reportBasis && (
                <p className="text-sm text-destructive">{errors.reportBasis.message}</p>
              )}
            </div>

            {/* Chart of Accounts */}
            <div className="space-y-2">
              <Label>{strings.ChartofAccounts}</Label>
              <Controller
                name="chartOfAccountId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    styles={customStyles}
                    placeholder={strings.Select}
                    options={
                      chart_of_account_list
                        ? selectOptionsFactory.renderOptions(
                            'label',
                            'value',
                            chart_of_account_list,
                            'Chart of Account'
                          )
                        : []
                    }
                    isClearable
                  />
                )}
              />
              {errors.chartOfAccountId && (
                <p className="text-sm text-destructive">{errors.chartOfAccountId.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button type="submit">
              <Play className="mr-2 h-4 w-4" />
              {strings.RunReport}
            </Button>
            <Button type="button" variant="secondary" onClick={viewFilter}>
              <X className="mr-2 h-4 w-4" />
              {strings.Cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default FilterComponent;
