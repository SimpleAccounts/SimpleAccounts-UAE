import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button, Row, Col, FormGroup, Label, Form } from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { connect } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import dayjs from '@/utils/date';
import { DropdownLists } from 'utils';
import './style.scss';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import { CircleDot, Ban, X } from 'lucide-react';

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
  viewFilter,
  enableContact,
  customer_list_dropdown,
}) {
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD hh:mm'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD hh:mm'),
      contactId: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const onSubmit = values => {
    generateReport(values);
  };

  return (
    <Form>
      <Row>
        <Col lg={4}>
          <FormGroup className="mb-3">
            <Label htmlFor="startDate">{strings.StartDate}</Label>
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
                  maxDate={endDate ? dayjs(endDate).toDate() : null}
                  value={dayjs(field.value).format('DD-MM-YYYY')}
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  onChange={value => {
                    setValue('startDate', dayjs(value).format('YYYY-MM-DD hh:mm'));
                  }}
                />
              )}
            />
          </FormGroup>
        </Col>
        <Col lg={4}>
          <FormGroup className="mb-3">
            <Label htmlFor="endDate">{strings.EndDate}</Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="date"
                  className={`form-control`}
                  autoComplete="off"
                  minDate={startDate ? dayjs(startDate).toDate() : null}
                  placeholderText="From"
                  showMonthDropdown
                  showYearDropdown
                  value={dayjs(field.value).format('DD-MM-YYYY')}
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  onChange={value => {
                    setValue('endDate', dayjs(value).format('YYYY-MM-DD hh:mm'));
                  }}
                />
              )}
            />
          </FormGroup>
        </Col>
        {enableContact && (
          <Col lg={4}>
            <FormGroup className="mb-3">
              <Label htmlFor="contactId">{strings.CustomerName}</Label>
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
                    }}
                  />
                )}
              />
            </FormGroup>
          </Col>
        )}
      </Row>
      <Row>
        <Col lg={12} className="mt-5">
          <FormGroup className="text-right">
            <Button
              type="button"
              color="primary"
              className="btn-square mr-3"
              onClick={handleSubmit(onSubmit)}
            >
              <CircleDot className="h-4 w-4" /> {strings.RunReport}
            </Button>

            <Button color="secondary" className="btn-square" onClick={viewFilter}>
              <Ban className="h-4 w-4" /> {strings.Cancel}
            </Button>
          </FormGroup>
        </Col>
      </Row>
    </Form>
  );
}

class FilterComponent2 extends Component {
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
    const { enableContact, customer_list_dropdown } = this.props;
    return (
      <div>
        <Card style={{ zIndex: '1', backgroundColor: 'white' }}>
          <CardHeader className="d-flex" style={{ justifyContent: 'space-between' }}>
            <div style={{ fontSize: '1.3rem', paddingLeft: '15px' }}>{strings.CustomizeReport}</div>
            <div>
              <X
                className="h-4 w-4"
                style={{ cursor: 'pointer' }}
                onClick={this.props.viewFilter}
              />
            </div>
          </CardHeader>
          <CardBody>
            <FilterComponentForm
              generateReport={this.props.generateReport}
              viewFilter={this.props.viewFilter}
              enableContact={enableContact}
              customer_list_dropdown={customer_list_dropdown}
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterComponent2);
