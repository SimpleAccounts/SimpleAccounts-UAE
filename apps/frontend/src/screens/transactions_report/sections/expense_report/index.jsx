import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, FormGroup, ButtonGroup, Form, Input } from 'reactstrap';
import { DateRangePicker2 } from 'components';
import dayjs from '@/utils/date';
import { DataTable } from '@/components/ui/data-table';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import './style.scss';

const tempdata = [
  {
    id: 1,
    transactionCategoryId: 2,
    transactionCategoryCode: 2,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
  {
    id: 2,
    transactionCategoryId: 1,
    transactionCategoryCode: 4,
    transactionCategoryName: 'temp',
    transactionCategoryDescription: 'temp',
    parentTransactionCategory: 'Loream Ipsume',
    transactionType: 'TEMP',
  },
];

const ranges = {
  'This Week': [dayjs().startOf('week'), dayjs().endOf('week')],
  'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
  'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
  'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
  'Last Month': [
    dayjs().subtract(1, 'month').startOf('month'),
    dayjs().subtract(1, 'month').endOf('month'),
  ],
};

const ExpenseReport = () => {
  const [selectedOption, setSelectedOption] = useState('');

  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionCategoryCode',
        header: 'Receipt Number',
      },
      {
        accessorKey: 'transactionCategoryName',
        header: 'Expense Date',
      },
      {
        accessorKey: 'transactionCategoryDescription',
        header: 'Description',
      },
      {
        accessorKey: 'parentTransactionCategory',
        header: 'Amount',
      },
    ],
    []
  );

  return (
    <div className="expense-report-section">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12}>
            <div className="flex-wrap d-flex align-items-start justify-content-between">
              <div className="info-block">
                <h4>
                  Company Name -{' '}
                  <small>
                    <i>Expenses</i>
                  </small>
                </h4>
              </div>
              <Form onSubmit={e => e.preventDefault()} name="simpleForm">
                <div className="flex-wrap d-flex align-items-center">
                  <FormGroup>
                    <ButtonGroup className="mr-3">
                      <Button color="success" className="btn-square" onClick={() => {}}>
                        <i className="fa glyphicon glyphicon-export fa-download mr-1" />
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
            </div>
            <div className="py-3">
              <h5>Filter : </h5>
              <Row>
                <Col lg={2} className="mb-1">
                  <Input type="text" placeholder="Receipt Number" />
                </Col>
                <Col lg={2} className="mb-1">
                  <DateRangePicker>
                    <Input type="text" placeholder="Expense Date" readOnly />
                  </DateRangePicker>
                </Col>
                <Col lg={2} className="mb-1">
                  <Button color="secondary" className="btn-square" type="button" onClick={() => {}}>
                    <i className="fa glyphicon glyphicon-export fa-search mr-1" />
                    Search
                  </Button>
                </Col>
              </Row>
            </div>
            <div className="table-wrapper">
              <DataTable data={tempdata} columns={columns} manualPagination={false} />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default connect()(ExpenseReport);
