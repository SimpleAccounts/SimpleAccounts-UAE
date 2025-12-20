import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button, Row, Col, FormGroup, Label, Form } from 'reactstrap';
import DatePicker from 'react-datepicker';
import { useForm, Controller } from 'react-hook-form';
import dayjs from '@/utils/date';
import './style.scss';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

function FilterComponentForm({ generateReport, viewFilter }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD hh:mm'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD hh:mm'),
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
                    field.onChange(dayjs(value).format('YYYY-MM-DD hh:mm'));
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
                    field.onChange(dayjs(value).format('YYYY-MM-DD hh:mm'));
                  }}
                />
              )}
            />
          </FormGroup>
        </Col>
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
              <i className="fa fa-dot-circle-o"></i> {strings.RunReport}
            </Button>

            <Button color="secondary" className="btn-square" onClick={viewFilter}>
              <i className="fa fa-ban"></i> {strings.Cancel}
            </Button>
          </FormGroup>
        </Col>
      </Row>
    </Form>
  );
}

class FilterComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language'),
    };
  }

  render() {
    strings.setLanguage(this.state.language);
    return (
      <div>
        <Card>
          <CardHeader className="d-flex" style={{ justifyContent: 'space-between' }}>
            <div style={{ fontSize: '1.3rem', paddingLeft: '15px' }}>{strings.CustomizeReport}</div>
            <div>
              <i
                className="fa fa-close"
                style={{ cursor: 'pointer' }}
                onClick={this.props.viewFilter}
              ></i>
            </div>
          </CardHeader>
          <CardBody>
            <FilterComponentForm
              generateReport={this.props.generateReport}
              viewFilter={this.props.viewFilter}
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default FilterComponent;
