import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import Select from 'react-select';
import * as customerReportData from '../../actions';
import { DateRangePicker2 } from 'components';
import dayjs from '@/utils/date';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import 'bootstrap/dist/css/bootstrap.css';
import './style.scss';
import { selectOptionsFactory } from 'utils';

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

function CustomerReport() {
  const dispatch = useDispatch();

  // Redux state
  const customer_invoice_report = useSelector(
    (state) => state.transaction_data.customer_invoice_report
  );
  const contact_list = useSelector((state) => state.transaction_data.contact_list);

  // Actions
  const customerReportDataActions = useMemo(
    () => bindActionCreators(customerReportData, dispatch),
    [dispatch]
  );

  // Local state
  const [filterData, setFilterData] = useState({
    filter_refNumber: '',
    filter_contactName: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    getCustomerInvoice();
  }, []);

  const getCustomerInvoice = useCallback(() => {
    // customerReportDataActions.getCustomerInvoiceReport();
    // customerReportDataActions.getContactNameList();
  }, [customerReportDataActions]);

  const getSelectedData = useCallback(() => {
    const postObj = {
      startDate: filterData.startDate !== '' ? filterData.startDate : '',
      endDate: filterData.endDate !== '' ? filterData.endDate : '',
      contactName: filterData.filter_contactName !== '' ? filterData.filter_contactName : '',
      refNumber: filterData.filter_refNumber !== '' ? filterData.filter_refNumber : '',
    };
    customerReportDataActions.getCustomerInvoiceReport(postObj);
  }, [filterData, customerReportDataActions]);

  const inputHandler = useCallback((key, value) => {
    setFilterData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleChange = useCallback((e, picker) => {
    let startingDate = picker ? dayjs(picker.startDate._d).format('L') : '';
    let endingDate = picker ? dayjs(picker.endDate._d).format('L') : '';
    setFilterData((prev) => ({
      ...prev,
      startDate: startingDate,
      endDate: endingDate,
    }));
  }, []);

  // Transform data for table
  const tableData = useMemo(() => {
    return customer_invoice_report
      ? customer_invoice_report.map((customer) => ({
          status: customer.status,
          referenceNumber: customer.refNumber,
          date: dayjs(customer.invoiceDate).format('L'),
          dueDate: dayjs(customer.invoiceDueDate).format('L'),
          contactName: customer.contactName,
          numberOfItems: customer.noOfItem,
          totalCost: customer.totalCost,
        }))
      : [];
  }, [customer_invoice_report]);

  // Column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        size: 130,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={status === 'Paid' ? 'success' : 'destructive'}>{status}</Badge>
          );
        },
      },
      {
        accessorKey: 'referenceNumber',
        header: 'Ref. Number',
        enableSorting: true,
      },
      {
        accessorKey: 'date',
        header: 'Date',
        enableSorting: true,
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        enableSorting: true,
      },
      {
        accessorKey: 'contactName',
        header: 'Contact Name',
        enableSorting: true,
      },
      {
        accessorKey: 'numberOfItems',
        header: 'No. of Items',
        enableSorting: true,
      },
      {
        accessorKey: 'totalCost',
        header: 'Total Cost',
        enableSorting: true,
      },
    ],
    []
  );

  return (
    <div className="invoice-report-section">
      <div className="animated fadeIn">
        <div className="grid grid-cols-12 gap-4">
          <div lg={12}>
            <div className="flex-wrap d-flex align-items-start justify-content-between">
              <div className="info-block">
                <h4>
                  Company Name -{' '}
                  <small>
                    <i>Invoices</i>
                  </small>
                </h4>
              </div>
              <form onSubmit={(e) => e.preventDefault()} name="simpleForm">
                <div className="flex-wrap d-flex align-items-center">
                  <div>
                    <div className="inline-flex rounded-md mr-3" role="group">
                      <Button variant="default" className="btn-square" onClick={() => {}}>
                        <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                        Export to CSV
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="date-range">
                      <DateRangePicker2 ranges={ranges} opens={'left'} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="py-3">
              <h5>Filter : </h5>
              <div className="grid grid-cols-12 gap-4">
                <div lg={2} className="mb-1">
                  <Input
                    type="text"
                    placeholder="Ref. Number"
                    value={filterData.filter_refNumber}
                    onChange={(e) => inputHandler('filter_refNumber', e.target.value)}
                  />
                </div>
                <div lg={2} className="mb-1">
                  <DateRangePicker
                    id="payment_date"
                    name="payment_date"
                    onApply={handleChange}
                  >
                    <Input
                      type="text"
                      value={filterData.startDate}
                      selected={filterData.startDate}
                      placeholder="Start Date"
                    />
                  </DateRangePicker>
                </div>
                <div lg={2} className="mb-1">
                  <Input
                    type="number"
                    min="0"
                    value={filterData.endDate}
                    selected={filterData.endDate}
                    placeholder="End Date"
                  />
                </div>
                <div lg={2} className="mb-1">
                  <Select
                    className=""
                    options={
                      contact_list
                        ? selectOptionsFactory.renderOptions('firstName', 'contactId', contact_list)
                        : []
                    }
                    value={filterData.filter_contactName}
                    onChange={(option) => inputHandler('filter_contactName', option)}
                    placeholder="contact Name"
                  />
                </div>
                <div lg={2} className="mb-1">
                  <Button
                    variant="secondary"
                    className="btn-square"
                    type="submit"
                    name="submit"
                    onClick={getSelectedData}
                  >
                    <i className="fa glyphicon glyphicon-export fa-search mr-1" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
            <div className="table-wrapper">
              <DataTable
                columns={columns}
                data={tableData}
                enableExport={true}
                exportFileName="customerInvoice"
                emptyMessage="No invoices found"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerReport;
