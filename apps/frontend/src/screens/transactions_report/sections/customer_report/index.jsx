import { useState, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { FormGroup, Form, Badge, Row, Col, Input, Button, ButtonGroup } from 'components/migration';
import Select from 'react-select';
import * as customerReportData from '../../actions';
// DISABLED: DateRangePicker2 removed due to jQuery dependency
// import { DateRangePicker2 } from 'components';
import dayjs from '@/utils/date';
import { DataTable } from '@/components/ui/data-table';
// DISABLED: jQuery dependency causes performance issues
// import DateRangePicker from 'react-bootstrap-daterangepicker';
// import 'bootstrap-daterangepicker/daterangepicker.css';
import './style.scss';
import { selectOptionsFactory } from 'utils';
import { Download, Search } from 'lucide-react';

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

const CustomerReport = () => {
  const dispatch = useDispatch();

  const { customer_invoice_report, contact_list } = useSelector(state => ({
    customer_invoice_report: state.transaction_data.customer_invoice_report,
    contact_list: state.transaction_data.contact_list,
  }));

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filter_refNumber, setFilterRefNumber] = useState('');
  const [filter_contactName, setFilterContactName] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const getInvoiceStatus = cell => {
    return <Badge color={cell === 'Paid' ? 'success' : 'danger'}>{cell}</Badge>;
  };

  const getSelectedData = () => {
    const postObj = {
      startDate: startDate || '',
      endDate: endDate || '',
      contactName: filter_contactName?.value || '',
      refNumber: filter_refNumber || '',
    };
    dispatch(customerReportData.getCustomerInvoiceReport(postObj));
  };

  const handleDateChange = (e, picker) => {
    let startingDate = picker ? dayjs(picker.startDate._d).format('L') : '';
    let endingDate = picker ? dayjs(picker.endDate._d).format('L') : '';
    setStartDate(startingDate);
    setEndDate(endingDate);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => getInvoiceStatus(getValue()),
      },
      {
        accessorKey: 'referenceNumber',
        header: 'Ref. Number',
      },
      {
        accessorKey: 'date',
        header: 'Date',
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
      },
      {
        accessorKey: 'contactName',
        header: 'Contact Name',
      },
      {
        accessorKey: 'numberOfItems',
        header: 'No. of Items',
      },
      {
        accessorKey: 'totalCost',
        header: 'Total Cost',
      },
    ],
    []
  );

  const customerInvoice = useMemo(() => {
    if (!customer_invoice_report) return [];
    return customer_invoice_report.map(customer => ({
      status: customer.status,
      referenceNumber: customer.refNumber,
      date: dayjs(customer.invoiceDate).format('L'),
      dueDate: dayjs(customer.invoiceDueDate).format('L'),
      contactName: customer.contactName,
      numberOfItems: customer.noOfItem,
      totalCost: customer.totalCost,
    }));
  }, [customer_invoice_report]);

  return (
    <div className="invoice-report-section">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12}>
            <div className="flex-wrap d-flex align-items-start justify-content-between">
              <div className="info-block">
                <h4>
                  Company Name -{' '}
                  <small>
                    <i>Invoices</i>
                  </small>
                </h4>
              </div>
              <Form onSubmit={e => e.preventDefault()} name="simpleForm">
                <div className="flex-wrap d-flex align-items-center">
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
                      {/* DISABLED: DateRangePicker2 removed due to jQuery dependency */}
                      {/* <DateRangePicker2 ranges={ranges} opens={'left'} /> */}
                    </div>
                  </FormGroup>
                </div>
              </Form>
            </div>
            <div className="py-3">
              <h5>Filter : </h5>
              <Row>
                <Col lg={2} className="mb-1">
                  <Input
                    type="text"
                    placeholder="Ref. Number"
                    value={filter_refNumber}
                    onChange={e => setFilterRefNumber(e.target.value)}
                  />
                </Col>
                <Col lg={2} className="mb-1">
                  {/* DISABLED: DateRangePicker removed due to jQuery dependency */}
                  {/* <DateRangePicker onApply={handleDateChange}>
                    <Input type="text" value={startDate} placeholder="Start Date" readOnly />
                  </DateRangePicker> */}
                  <Input type="text" value={startDate} placeholder="Start Date" readOnly />
                </Col>
                <Col lg={2} className="mb-1">
                  <Input type="text" value={endDate} placeholder="End Date" readOnly />
                </Col>
                <Col lg={2} className="mb-1">
                  <Select
                    options={
                      contact_list
                        ? selectOptionsFactory.renderOptions('firstName', 'contactId', contact_list)
                        : []
                    }
                    value={filter_contactName}
                    onChange={setFilterContactName}
                    placeholder="contact Name"
                  />
                </Col>
                <Col lg={2} className="mb-1">
                  <Button
                    color="secondary"
                    className="btn-square"
                    type="button"
                    onClick={getSelectedData}
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </Col>
              </Row>
            </div>
            <div className="table-wrapper">
              <DataTable
                data={customerInvoice}
                columns={columns}
                manualPagination={false}
                pagination={pagination}
                onPaginationChange={setPagination}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default connect()(CustomerReport);
