import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col, FormGroup, Form, Input, ButtonGroup } from 'reactstrap';
import Select from 'react-select';
import { DateRangePicker2, Currency, Loader } from 'components';
import dayjs from '@/utils/date';
import { DataTable } from '@/components/ui/data-table';
import DatePicker from 'react-datepicker';
import * as accountBalanceData from '../../actions';
import { selectOptionsFactory, selectStyles } from 'utils';
import './style.scss';

const AccountBalances = () => {
  const dispatch = useDispatch();

  const { account_balance_report, account_type_list, universal_currency_list } = useSelector(
    state => ({
      account_balance_report: state.transaction_data.account_balance_report,
      account_type_list: state.transaction_data.account_type_list,
      universal_currency_list: state.common.universal_currency_list,
    })
  );

  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState({
    filter_account: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    getAccountBalanceData();
  }, []);

  const getAccountBalanceData = () => {
    const postData = {
      startDate: dayjs().startOf('month').format('DD-MM-YYYY'),
      endDate: dayjs().endOf('month').format('DD-MM-YYYY'),
    };
    dispatch(accountBalanceData.getAccountBalanceReport(postData));
    dispatch(accountBalanceData.getAccountTypeList());
  };

  const getSelectedData = () => {
    const postObj = {
      filter_account: filterData.filter_account?.value || '',
      startDate: filterData.startDate ? dayjs(filterData.startDate).format('DD-MM-YYYY') : '',
      endDate: filterData.endDate ? dayjs(filterData.endDate).format('DD-MM-YYYY') : '',
    };
    dispatch(accountBalanceData.getAccountBalanceReport(postObj));
  };

  const handleFilterChange = (val, name) => {
    setFilterData(prev => ({ ...prev, [name]: val }));
  };

  const clearAll = () => {
    setFilterData({ filter_account: '', startDate: '', endDate: '' });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionDate',
        header: 'Transaction Date',
      },
      {
        accessorKey: 'account',
        header: 'Account',
      },
      {
        accessorKey: 'transactionType',
        header: 'Transaction Type',
      },
      {
        accessorKey: 'transactionCategory',
        header: 'Transaction Category',
      },
      {
        accessorKey: 'transactionDescription',
        header: 'Transaction Description',
      },
      {
        accessorKey: 'transactionAmount',
        header: 'Transaction Amount',
        cell: ({ getValue }) => (
          <div className="text-right">
            <Currency
              value={getValue()}
              currencySymbol={universal_currency_list[0]?.currencyIsoCode || 'AED'}
            />
          </div>
        ),
      },
    ],
    [universal_currency_list]
  );

  const accountBalanceTable = useMemo(() => {
    if (!account_balance_report) return [];
    return account_balance_report.map(account => ({
      account: account.bankAccount,
      transactionType: account.transactionType,
      transactionDescription: account.transactionDescription,
      transactionCategory: account.transactionCategory,
      transactionAmount: account.transactionAmount,
      transactionDate: dayjs(account.transactionDate).format('DD-MM-YYYY'),
      transactionId: account.transactionId,
    }));
  }, [account_balance_report]);

  if (loading) return <Loader />;

  return (
    <div className="transaction-report-section">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12}>
            <div className="flex-wrap d-flex align-items-start justify-content-between">
              <div className="info-block">
                <h4>
                  <small></small>
                </h4>
              </div>
              <Form onSubmit={e => e.preventDefault()} name="simpleForm">
                <div className="flex-wrap d-flex align-items-center">
                  <FormGroup>
                    <ButtonGroup className="mr-3">
                      <Button color="primary" className="btn-square" onClick={() => {}}>
                        <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                        Export to CSV
                      </Button>
                    </ButtonGroup>
                  </FormGroup>
                </div>
              </Form>
            </div>
            <div className="py-3">
              <h5>Filter : </h5>
              <Row>
                <Col lg={2} className="mb-1">
                  <DatePicker
                    className="form-control"
                    placeholderText="Start Date"
                    selected={filterData.startDate}
                    onChange={value => handleFilterChange(value, 'startDate')}
                    dateFormat="dd-MM-yyyy"
                  />
                </Col>
                <Col lg={2} className="mb-1">
                  <DatePicker
                    className="form-control"
                    placeholderText="End Date"
                    selected={filterData.endDate}
                    onChange={value => handleFilterChange(value, 'endDate')}
                    dateFormat="dd-MM-yyyy"
                  />
                </Col>
                <Col lg={2} className="mb-1">
                  <Select
                    styles={selectStyles}
                    options={
                      account_type_list
                        ? selectOptionsFactory.renderOptions(
                            'name',
                            'id',
                            account_type_list,
                            'Account'
                          )
                        : []
                    }
                    placeholder="Account"
                    value={filterData.filter_account}
                    onChange={option => handleFilterChange(option, 'filter_account')}
                  />
                </Col>
                <Col lg={3} className="mb-1">
                  <Button
                    type="button"
                    color="primary"
                    className="btn-square mr-1"
                    onClick={getSelectedData}
                  >
                    <i className="fa fa-search"></i>
                  </Button>
                  <Button type="button" color="primary" className="btn-square" onClick={clearAll}>
                    <i className="fa fa-refresh"></i>
                  </Button>
                </Col>
              </Row>
            </div>
            <div className="table-wrapper">
              <DataTable
                data={accountBalanceTable}
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

export default connect()(AccountBalances);
