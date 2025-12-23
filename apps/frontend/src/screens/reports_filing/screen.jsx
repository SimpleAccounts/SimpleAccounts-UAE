import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  FormGroup,
  Form,
  ButtonGroup,
} from 'components/migration';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { DateRangePicker2 } from 'components';
import dayjs from '@/utils/date';
import { DataTable } from '@/components/ui/data-table';
import './style.scss';
import { Search, Download } from 'lucide-react';

const vatOptions = [
  { value: 'input', label: 'Input' },
  { value: 'output', label: 'Output' },
  { value: 'all', label: 'All' },
];

const tempdata = [
  {
    id: 1,
    transactionDate: '10/15/2019',
    transactionCategoryId: 2,
    transactionCategoryCode: 2,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
  {
    id: 2,
    transactionDate: '10/15/2019',
    transactionCategoryId: 1,
    transactionCategoryCode: 4,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
];

const ranges = {
  'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
  'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
  'This Week': [dayjs().startOf('week'), dayjs().endOf('week')],
  'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
  'Last Month': [
    dayjs().subtract(1, 'month').startOf('month'),
    dayjs().subtract(1, 'month').endOf('month'),
  ],
};

const ReportsFiling = () => {
  const [selectedVat, setSelectedVat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [birthday, setBirthday] = useState(null);

  const getAction = () => {
    return <button className="btn">Detail</button>;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionDate',
        header: 'Report No.',
      },
      {
        accessorKey: 'transactionCategoryDescription',
        header: 'Status',
      },
      {
        accessorKey: 'transactionType',
        header: 'Status Date',
      },
      {
        accessorKey: 'parentTransactionCategory',
        header: 'TRN',
      },
      {
        id: 'actions',
        header: 'Action',
        cell: () => getAction(),
      },
    ],
    []
  );

  return (
    <div className="report-filing-screen ">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <Row>
              <Col lg={12}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <i className="icon-briefcase" />
                  <span className="ml-2">VAT Report</span>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <Form onSubmit={e => e.preventDefault()} name="simpleForm">
              <div className="flex-wrap d-flex justify-content-end">
                <FormGroup>
                  <ButtonGroup className="mr-3">
                    <Button color="success" className="btn-square" onClick={() => {}}>
                      <Download className="h-4 w-4 mr-1" />
                      Export to CSV
                    </Button>
                  </ButtonGroup>
                </FormGroup>
                <FormGroup>
                  <div className="date-range">
                    <DateRangePicker2 ranges={ranges} opens={'left'} />
                  </div>
                </FormGroup>
              </div>
            </Form>
            <div className="py-3">
              <h5>Filter : </h5>
              <Row>
                <Col lg={2} className="mb-1">
                  <Select
                    options={vatOptions}
                    value={selectedStatus}
                    placeholder="Status"
                    onChange={setSelectedStatus}
                  />
                </Col>
                <Col lg={2} className="mb-1">
                  <DatePicker
                    className="form-control"
                    id="date"
                    name="date"
                    selected={birthday}
                    onChange={setBirthday}
                    placeholderText="Date"
                    showMonthDropdown
                    showYearDropdown
                    dateFormat="dd-MM-yyyy"
                    dropdownMode="select"
                  />
                </Col>
                <Col lg={1} className="mb-1">
                  <Button type="button" color="primary" className="btn-square" onClick={() => {}}>
                    <Search className="h-4 w-4" />
                  </Button>
                </Col>
              </Row>
            </div>
            <div className="table-wrapper">
              <DataTable data={tempdata} columns={columns} manualPagination={false} />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default connect()(ReportsFiling);
