import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody, Button, Row, Col, FormGroup, Label, Form } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm, Controller } from 'react-hook-form';
import dayjs from '@/utils/date';
import Select from 'react-select';
import './style.scss';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import { optionFactory, selectOptionsFactory } from 'utils';

const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    },
  }),
};

let strings = new LocalizedStrings(data);

const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days (Including Today)' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'currentWeek', label: 'Current Week' },
  { value: 'currentMonth', label: 'Current Month' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'lastQuarter', label: 'Last Quarter' },
  { value: 'yearToDate', label: 'Year to Date (YTD)' },
  { value: 'quarterToDate', label: 'Quarter to Date (QTD)' },
  { value: 'monthToDate', label: 'Month to Date (MTD)' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'customRange', label: 'Custom Range' },
  { value: 'asOn', label: 'As on' },
];

const reportBasisOptions = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Accrual', value: 'ACCRUAL' },
];

const selectStyles = {
  control: provided => ({
    ...provided,
    borderColor: 'black',
    height: '30px',
  }),
  singleValue: provided => ({
    ...provided,
    color: 'black',
  }),
  option: provided => ({
    ...provided,
    color: 'black',
  }),
};

const FilterComponent3 = props => {
  const {
    setCutomPeriod,
    chart_of_account_list,
    customPeriod,
    generateReport,
    hideExportOptionsFunctionality,
    handleCancel,
  } = props;

  const [language] = useState(window['localStorage'].getItem('language'));
  const [selectedPeriod, setSelectedPeriod] = useState(customPeriod ? customPeriod : 'asOn');
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showRunReport, setShowRunReport] = useState(false);

  strings.setLanguage(language);

  const { control, handleSubmit, watch, setValue, getValues } = useForm({
    defaultValues: {
      startDate: dayjs().startOf('month').toDate(),
      endDate: dayjs().endOf('month').toDate(),
      reportBasis: 'ACCRUAL',
      chartOfAccountId: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const getDateRange = useCallback(
    selectedOption => {
      const currentDate = dayjs().startOf('day');
      let newStartDate, newEndDate;
      let newShowStartDate = false;
      let newShowEndDate = false;
      let newShowRunReport = false;

      switch (selectedOption) {
        case 'today':
          newStartDate = currentDate.clone().toDate();
          newEndDate = currentDate.clone().toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'yesterday':
          newStartDate = currentDate.clone().subtract(1, 'day').toDate();
          newEndDate = currentDate.clone().subtract(1, 'day').toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'last7days':
          newStartDate = currentDate.clone().subtract(6, 'days').toDate();
          newEndDate = currentDate.clone().toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'last30days':
          newStartDate = currentDate.clone().subtract(29, 'days').toDate();
          newEndDate = currentDate.clone().toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'currentWeek':
          newStartDate = currentDate.clone().startOf('week').toDate();
          newEndDate = currentDate.clone().endOf('week').toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'currentMonth':
          newStartDate = currentDate.clone().startOf('month').toDate();
          newEndDate = currentDate.clone().endOf('month').toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'lastWeek':
          newStartDate = currentDate.clone().subtract(1, 'week').startOf('week').toDate();
          newEndDate = currentDate.clone().subtract(1, 'week').endOf('week').toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'lastMonth':
          newStartDate = currentDate.clone().subtract(1, 'month').startOf('month').toDate();
          newEndDate = currentDate.clone().subtract(1, 'month').endOf('month').toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'lastQuarter':
          newStartDate = currentDate.clone().subtract(3, 'month').startOf('quarter').toDate();
          newEndDate = currentDate.clone().subtract(1, 'month').endOf('quarter').toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'yearToDate':
          newStartDate = currentDate.clone().startOf('year').toDate();
          newEndDate = currentDate.clone().toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'quarterToDate':
          newStartDate = currentDate.clone().startOf('quarter').toDate();
          newEndDate = currentDate.clone().toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'monthToDate':
          newStartDate = currentDate.clone().startOf('month').toDate();
          newEndDate = currentDate.clone().toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'lastYear':
          newStartDate = currentDate.clone().subtract(1, 'year').startOf('year').toDate();
          newEndDate = currentDate.clone().subtract(1, 'year').endOf('year').toDate();
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(false);
          break;
        case 'customRange':
          newStartDate = dayjs().startOf('month').toDate();
          newEndDate = dayjs().endOf('month').toDate();
          newShowStartDate = true;
          newShowEndDate = true;
          newShowRunReport = true;
          generateReport({ startDate: newStartDate, endDate: newEndDate });
          hideExportOptionsFunctionality(true);
          break;
        case 'asOn':
          newStartDate = dayjs().startOf('year').toDate();
          newEndDate = currentDate.clone().toDate();
          newShowStartDate = false;
          newShowEndDate = true;
          newShowRunReport = true;
          generateReport({ endDate: newEndDate });
          hideExportOptionsFunctionality(true);
          break;
        default:
          break;
      }

      setValue('startDate', newStartDate);
      setValue('endDate', newEndDate);
      setShowStartDate(newShowStartDate);
      setShowEndDate(newShowEndDate);
      setShowRunReport(newShowRunReport);

      return { startDate: newStartDate, endDate: newEndDate };
    },
    [generateReport, hideExportOptionsFunctionality, setValue]
  );

  const handleRunReport = () => {
    const values = getValues();
    console.log(values);
    generateReport(values);
    setShowRunReport(false);
    setShowStartDate(false);
    setShowEndDate(false);
    hideExportOptionsFunctionality(false);
  };

  const handleCancelClick = () => {
    const currentDate = dayjs();
    setValue('endDate', currentDate.toDate());
    handleCancel();
    setSelectedPeriod('asOn');
    setShowEndDate(true);
    setShowRunReport(false);
    setShowStartDate(false);
    generateReport({ endDate: currentDate.toDate() });
    hideExportOptionsFunctionality(false);
  };

  return (
    <Form>
      <Row>
        <Col lg={3}>
          <div
            className={`align-items-center pull left ${selectedPeriod !== 'customRange' && selectedPeriod !== 'asOn'}`}
          >
            <FormGroup>
              <Label
                htmlFor="reportingPeriod"
                style={{ color: 'black', fontWeight: '600', marginTop: '15px' }}
              >
                {strings.ReportingPeriod}
              </Label>
              <Select
                options={periodOptions}
                value={periodOptions.find(option => option.value === selectedPeriod)}
                onChange={option => {
                  getDateRange(option.value);
                  setSelectedPeriod(option.value);
                  setCutomPeriod(option.value);
                }}
                placeholder="Select Period"
                id="reportingPeriod"
                name="reportingPeriod"
                styles={selectStyles}
              />
            </FormGroup>
          </div>
        </Col>
      </Row>
      <Row>
        {selectedPeriod !== 'asOn' && (
          <Col lg={3}>
            {showStartDate && (
              <FormGroup className="mb-3">
                <Label htmlFor="startDate" style={{ color: 'black', marginTop: '15px' }}>
                  {strings.StartDate}
                </Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      id="date"
                      name="startDate"
                      className="form-control"
                      placeholderText="From"
                      showMonthDropdown
                      showYearDropdown
                      autoComplete="off"
                      selected={value}
                      dropdownMode="select"
                      dateFormat="dd-MM-yyyy"
                      maxDate={endDate}
                      onChange={newValue => {
                        if (newValue <= endDate) {
                          onChange(newValue);
                        }
                      }}
                    />
                  )}
                />
              </FormGroup>
            )}
          </Col>
        )}
        <Col lg={3}>
          {showEndDate && (
            <FormGroup className="mb-3">
              <Label
                htmlFor="endDate"
                style={{ color: 'black', marginTop: '15px', borderColor: 'black' }}
              >
                {strings.EndDate}
              </Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    id="date"
                    name="endDate"
                    className="form-control"
                    autoComplete="off"
                    placeholderText="To"
                    showMonthDropdown
                    showYearDropdown
                    selected={value}
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                    minDate={startDate}
                    onClick={() => setShowEndDate(true)}
                    onChange={newValue => {
                      if (newValue >= startDate) {
                        onChange(newValue);
                      }
                    }}
                  />
                )}
              />
            </FormGroup>
          )}
        </Col>
      </Row>
      <Row>
        <Col lg={3}>
          <FormGroup className="mb-3">
            <Label
              htmlFor="reportBasis"
              style={{ color: 'black', fontWeight: '600', marginTop: '15px' }}
            >
              {strings.ReportBasis}
            </Label>
            <Controller
              name="reportBasis"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  styles={selectStyles}
                  className="select-default-width"
                  placeholder={strings.Select}
                  id="reportBasis"
                  name="reportBasis"
                  options={reportBasisOptions}
                  value={value}
                  onChange={option => onChange(option)}
                />
              )}
            />
          </FormGroup>
        </Col>
        <Col lg={3}>
          <FormGroup className="mb-3">
            <Label
              htmlFor="chart_of_account"
              style={{ color: 'black', fontWeight: '600', marginTop: '15px' }}
            >
              {strings.ChartofAccounts}
            </Label>
            <Controller
              name="chartOfAccountId"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  styles={selectStyles}
                  className="select-default-width"
                  placeholder={strings.Select}
                  id="chart_of_account"
                  name="chart_of_account_list"
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
                  value={value}
                  onChange={option => onChange(option)}
                />
              )}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row className="justify-content-end">
        {showRunReport && (
          <Col lg={3} className="mt-4">
            <FormGroup className="text-right">
              <Button
                type="button"
                color="primary"
                className="btn-square mr-3"
                style={{ marginTop: '15px' }}
                onClick={handleRunReport}
              >
                <i className="fa fa-dot-circle-o"></i> {strings.RunReport}
              </Button>
              <Button
                color="secondary"
                className="btn-square"
                style={{ marginTop: '15px' }}
                onClick={handleCancelClick}
              >
                <i className="fa fa-ban pull"></i> {strings.Cancel}
              </Button>
            </FormGroup>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default FilterComponent3;
