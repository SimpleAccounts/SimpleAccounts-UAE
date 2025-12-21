import React, { Component } from 'react';
import { Button, Row, Col, FormGroup, Label, Form } from 'reactstrap';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm, Controller } from 'react-hook-form';
import dayjs from '@/utils/date';
import Select from 'react-select';
import './style.scss';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import { DropdownLists } from 'utils';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import { CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  const contact_list = state.common.customer_list;
  return {
    customer_list_dropdown: DropdownLists.getContactDropDownList(contact_list),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

function FilterComponentForm({
  generateReport,
  setCutomPeriod,
  enableContact,
  customer_list_dropdown,
  hideExportOptionsFunctionality,
  handleCancel,
  customPeriod,
  hideCustomPeriod,
  hideAsOn,
}) {
  const [selectedPeriod, setSelectedPeriod] = React.useState(customPeriod || 'asOn');
  const [showStartDate, setShowStartDate] = React.useState(false);
  const [showEndDate, setShowEndDate] = React.useState(false);
  const [showRunReport, setShowRunReport] = React.useState(false);

  const options = [
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

  const optionsToShow = options.filter(option => {
    if (hideCustomPeriod) {
      return option.value === 'asOn';
    }
    if (hideAsOn) {
      return option.value !== 'asOn';
    }
    return true;
  });

  const { control, handleSubmit, setValue, watch, getValues } = useForm({
    defaultValues: {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD hh:mm'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD hh:mm'),
      contactId: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const contactId = watch('contactId');

  const getDateRange = selectedOption => {
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
        newStartDate = currentDate.clone().subtract(1, 'quarter').startOf('quarter').toDate();
        newEndDate = currentDate.clone().subtract(1, 'quarter').endOf('quarter').toDate();
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
  };

  const onSubmit = values => {
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
    setShowEndDate(false);
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
            className={`align-items-center pull left ${
              selectedPeriod !== 'customRange' && selectedPeriod !== 'asOn'
            }`}
          >
            <FormGroup>
              <Label
                htmlFor="reportingPeriod"
                style={{
                  color: 'black',
                  fontWeight: '600',
                  marginTop: '15px',
                }}
              >
                {strings.ReportingPeriod}
              </Label>
              <Select
                options={optionsToShow}
                value={optionsToShow.find(option => option.value === selectedPeriod)}
                onChange={option => {
                  getDateRange(option.value);
                  setSelectedPeriod(option.value);
                  setCutomPeriod(option.value);
                }}
                placeholder="Select Period"
                id="reportingPeriod"
                name="reportingPeriod"
                styles={{
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
                }}
              />
            </FormGroup>
          </div>
        </Col>
        {enableContact && (
          <Col lg={3}>
            <div
              className={`align-items-center pull left ${
                selectedPeriod !== 'customRange' && selectedPeriod !== 'asOn'
              }`}
            >
              <FormGroup className="mb-3">
                <Label
                  htmlFor="contactId"
                  style={{
                    color: 'black',
                    fontWeight: '600',
                    marginTop: '15px',
                  }}
                >
                  {strings.CustomerName}
                </Label>
                <Controller
                  name="contactId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="contactId"
                      placeholder={strings.Select + strings.CustomerName}
                      options={customer_list_dropdown}
                      value={
                        field.value?.value
                          ? field.value
                          : customer_list_dropdown.find(option => option.value == field.value)
                      }
                      onChange={option => {
                        setValue('contactId', option.value);
                        generateReport({
                          ...getValues(),
                          contactId: option.value,
                        });
                      }}
                      styles={{
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
                      }}
                    />
                  )}
                />
              </FormGroup>
            </div>
          </Col>
        )}
      </Row>
      <Row>
        {selectedPeriod !== 'asOn' && (
          <Col lg={3}>
            {showStartDate && (
              <FormGroup className="mb-3">
                <Label
                  htmlFor="startDate"
                  style={{
                    color: 'black',
                    fontWeight: '600',
                    marginTop: '15px',
                    borderColor: 'black',
                  }}
                >
                  {strings.StartDate}
                </Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="date"
                      className={`form-control`}
                      placeholderText="From"
                      showMonthDropdown
                      showYearDropdown
                      autoComplete="off"
                      value={dayjs(field.value).format('DD-MM-YYYY')}
                      dropdownMode="select"
                      dateFormat="dd-MM-yyyy"
                      maxDate={endDate}
                      onChange={value => {
                        if (value <= endDate) {
                          field.onChange(value);
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
                style={{
                  color: 'black',
                  fontWeight: '600',
                  marginTop: '15px',
                  borderColor: 'black',
                }}
              >
                {strings.EndDate}
              </Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="date"
                    className={`form-control`}
                    autoComplete="off"
                    placeholderText="To"
                    showMonthDropdown
                    showYearDropdown
                    value={dayjs(field.value).format('DD-MM-YYYY')}
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                    minDate={startDate}
                    onChange={value => {
                      if (value >= startDate) {
                        field.onChange(value);
                      }
                    }}
                  />
                )}
              />
            </FormGroup>
          )}
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
                onClick={handleSubmit(onSubmit)}
              >
                <CircleDot className="h-4 w-4" /> {strings.RunReport}
              </Button>
              <Button
                color="secondary"
                className="btn-square"
                style={{ marginTop: '15px' }}
                onClick={handleCancelClick}
              >
                <Ban className="h-4 w-4" /> {strings.Cancel}
              </Button>
            </FormGroup>
          </Col>
        )}
      </Row>
    </Form>
  );
}

class FilterComponent3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language'),
    };
  }

  componentDidMount = () => {
    this.props.commonActions.getCustomerList(2);
  };

  render() {
    strings.setLanguage(this.state.language);
    const { setCutomPeriod, enableContact, customer_list_dropdown } = this.props;

    return (
      <FilterComponentForm
        generateReport={this.props.generateReport}
        setCutomPeriod={setCutomPeriod}
        enableContact={enableContact}
        customer_list_dropdown={customer_list_dropdown}
        hideExportOptionsFunctionality={this.props.hideExportOptionsFunctionality}
        handleCancel={this.props.handleCancel}
        customPeriod={this.props.customPeriod}
        hideCustomPeriod={this.props.hideCustomPeriod}
        hideAsOn={this.props.hideAsOn}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterComponent3);
