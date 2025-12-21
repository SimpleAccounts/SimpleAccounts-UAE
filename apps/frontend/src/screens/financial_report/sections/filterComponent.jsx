import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Button, Row, Col, FormGroup, Label, Form } from 'reactstrap';
import DatePicker from 'react-datepicker';
import { useForm, Controller } from 'react-hook-form';
import dayjs from '@/utils/date';
import './style.scss';
import { data } from '../../Language/index';
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
      endDate: dayjs().endOf('month').format('YYYY-MM-DD hh:mm'),
    },
  });

  const onSubmit = values => {
    generateReport(values);
  };

  return (
    <Form>
      <Row>
        <Col lg={4}>
          <FormGroup className="mb-1">
            <Label htmlFor="endDate"> {strings.EndDate}</Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="date"
                  className={`form-control`}
                  placeholderText="From"
                  showMonthDropdown
                  autoComplete="off"
                  showYearDropdown
                  value={dayjs(field.value).format('DD-MM-YYYY')}
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  onChange={value => field.onChange(value)}
                />
              )}
            />
          </FormGroup>
        </Col>

        <Col lg={12}>
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
        <Card>
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
