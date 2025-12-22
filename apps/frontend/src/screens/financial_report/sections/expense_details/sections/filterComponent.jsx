import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button, Row, Col, FormGroup, Label, Form } from 'components/migration';
import DatePicker from 'react-datepicker';
import { useForm, Controller } from 'react-hook-form';
import dayjs from '@/utils/date';
import './style.scss';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import { CircleDot, Ban, X } from 'lucide-react';

let strings = new LocalizedStrings(data);

function FilterComponentForm({ generateReport, viewFilter }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      startDate: new Date(dayjs().startOf('month').format('YYYY-MM-DD hh:mm')),
      endDate: new Date(dayjs().endOf('month').format('YYYY-MM-DD hh:mm')),
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
                  maxDate={endDate}
                  selected={field.value}
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  onChange={value => field.onChange(value)}
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
                  minDate={startDate}
                  placeholderText="From"
                  showMonthDropdown
                  showYearDropdown
                  selected={field.value}
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  onChange={value => field.onChange(value)}
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
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default FilterComponent;
