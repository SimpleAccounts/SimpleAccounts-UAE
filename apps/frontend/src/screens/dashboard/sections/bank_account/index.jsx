import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Currency } from 'components';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

import bankIcon from 'assets/images/dashboard/bank.png';

import './style.scss';

let strings = new LocalizedStrings(data);

const backOption = {
  layout: {
    padding: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  },
  scales: {
    y: {
      ticks: {
        display: true,
      },
      beginAtZero: true,
      grid: {
        display: true,
        color: '#eeeff8',
        drawBorder: true,
      },
    },
    x: {
      ticks: {
        display: true,
      },
      beginAtZero: true,
      grid: {
        display: true,
        color: '#eeeff8',
        drawBorder: true,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
};

const BankAccount = props => {
  const { DashboardActions, bank_account_type, bank_account_graph, universal_currency_list } =
    props;
  const [language] = useState(window['localStorage'].getItem('language'));
  const [totalBalance, setTotalBalance] = useState(0);
  const bankAccountSelect = useRef(null);
  const dateRangeSelect = useRef(null);

  useEffect(() => {
    if (DashboardActions && DashboardActions.getTotalBalance) {
      // Run getTotalBalance in parallel - it doesn't depend on getBankAccountTypes
      DashboardActions.getTotalBalance().then(action => {
        // Redux Toolkit thunks return action objects
        if (action && action.type && action.type.includes('fulfilled')) {
          setTotalBalance(action.payload);
        }
      });
    }

    if (DashboardActions && DashboardActions.getBankAccountTypes) {
      DashboardActions.getBankAccountTypes().then(action => {
        // Redux Toolkit thunks return action objects
        if (action && action.type && action.type.includes('fulfilled')) {
          const data = action.payload;
          let val = data && data[0] ? data[0].bankAccountId : '';
          getBankAccountGraphData(val, 12);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const getBankAccountGraphData = (account, dateRange) => {
    if (account && dateRange) {
      DashboardActions.getBankAccountGraphData({ account, daterange: dateRange });
    }
  };

  const handleChange = e => {
    e.preventDefault();
    getBankAccountGraphData(bankAccountSelect.current?.value, dateRangeSelect.current?.value);
  };

  // Set language before using strings
  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  const graphData = bank_account_graph || {};
  const line = {
    labels: graphData.labels || [],
    datasets: [
      {
        label: 'Delta of ' + (graphData.account_name || '') + ' ',
        fill: true,
        lineTension: 0.1,
        backgroundColor: 'rgba(32, 100, 216, 0.4)',
        borderColor: 'rgba(32, 100, 216, 1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(32, 100, 216, 1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(32, 100, 216, 1)',
        pointHoverBorderColor: 'rgba(32, 100, 216, 1)',
        pointHoverBorderWidth: 2,
        pointRadius: 4,
        pointHitRadius: 20,
        data: graphData.data || [],
      },
    ],
  };

  return (
    <div className="animated fadeIn">
      <Card className="bank-card card-margin">
        <CardHeader>
          <div className="flex-wrapper title-bottom-border pb-3">
            <CardTitle className="text-xl font-bold" style={{ color: '#2064d8' }}>
              {strings.BANKING}
            </CardTitle>
            <div className="mb-1 card-header-actions card-select-alignment">
              <select
                className="form-control card-select"
                ref={dateRangeSelect}
                onChange={handleChange}
              >
                <option value="12">{strings.Last12Months}</option>
                <option value="6">{strings.Last6Months}</option>
                <option value="3">{strings.Last3Months}</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="data-info">
            <div style={{ display: 'contents' }}>
              <img
                alt="bankIcon"
                className="d-none d-lg-block"
                src={bankIcon}
                style={{ width: 40, marginRight: 10 }}
              />
              <select
                style={{ width: '45%', borderRadius: '0.25rem' }}
                className="form-control1 bank-type-select card-select mt-2"
                ref={bankAccountSelect}
                onChange={handleChange}
              >
                {(bank_account_type || []).map((account, index) => (
                  <option key={index} value={account.bankAccountId}>
                    {account.name + '-' + account.accounName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-center mt-2" style={{ display: 'block' }}>
            <p style={{ fontWeight: 500, textIndent: 5, marginTop: '-4px' }}>
              {strings.Lastupdatedon} {graphData.updatedDate || ''}
            </p>
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div
              className="data-item"
              style={{
                width: '50%',
                textAlign: 'right',
                borderRight: '1px solid rgb(238 238 238)',
              }}
            >
              <div>
                <p style={{ marginBottom: '6px' }} className="mr-1 data-item">
                  {strings.BALANCE}
                </p>
                <h5>
                  {universal_currency_list?.[0] && (
                    <Currency
                      value={bank_account_graph?.balance ? bank_account_graph.balance : 0}
                      currencySymbol={
                        universal_currency_list[0]
                          ? universal_currency_list[0].currencyIsoCode
                          : 'USD'
                      }
                    />
                  )}
                </h5>
              </div>
            </div>
            <div className="data-item">
              <div>
                <p style={{ marginBottom: '6px' }}>{strings.ALLBANKACCOUNTS}</p>
                <h5>
                  {universal_currency_list?.[0] && (
                    <Currency
                      value={totalBalance}
                      currencySymbol={
                        universal_currency_list[0]
                          ? universal_currency_list[0].currencyIsoCode
                          : 'USD'
                      }
                    />
                  )}
                </h5>
              </div>
            </div>
          </div>

          <div className="chart-wrapper card-visibility">
            <Line
              data={line}
              options={backOption}
              style={{ height: 200 }}
              datasetKeyProvider={() => {
                return Math.random();
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAccount;
