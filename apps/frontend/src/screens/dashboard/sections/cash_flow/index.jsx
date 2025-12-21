import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Currency } from 'components';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

import incomeIcon from 'assets/images/dashboard/income.png';
import outcomeIcon from 'assets/images/dashboard/outcome.png';
import totalIcon from 'assets/images/dashboard/total.png';

const cashBarOption = {
  plugins: {
    tooltip: {
      enabled: true,
    },
    legend: {
      display: true,
      position: 'bottom',
    },
  },
  scales: {
    y: {
      ticks: {
        callback(value, index, values) {
          return value;
        },
      },
      beginAtZero: true,
    },
  },
  maintainAspectRatio: false,
};

let strings = new LocalizedStrings(data);

const CashFlow = props => {
  const { DashboardActions, cash_flow_graph, universal_currency_list } = props;
  const [language] = useState(window['localStorage'].getItem('language'));

  useEffect(() => {
    if (DashboardActions && DashboardActions.getCashFlowGraphData) {
      DashboardActions.getCashFlowGraphData(12);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleChange = e => {
    e.preventDefault();
    DashboardActions.getCashFlowGraphData(e.currentTarget.value);
  };

  // Set language before using strings
  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  const graphData = cash_flow_graph || {};
  const inflow = graphData.inflow || {};
  const outflow = graphData.outflow || {};
  const cashFlowBar = {
    labels: graphData.labels || [],
    datasets: [
      {
        label: inflow.label || 'Inflow',
        backgroundColor: 'rgba(65, 145, 255, 0.85)',
        hoverBackgroundColor: 'rgba(65, 145, 255, 0.85)',
        data: inflow.data || [],
      },
      {
        label: outflow.label || 'Outflow',
        backgroundColor: 'rgba(244, 119, 46, 0.85)',
        hoverBackgroundColor: 'rgba(244, 119, 46, 0.85)',
        data: outflow.data || [],
      },
    ],
  };

  return (
    <div className="animated fadeIn">
      <Card className="cash-card">
        <CardHeader>
          <div className="flex-wrapper title-bottom-border pb-3">
            <CardTitle className="text-xl font-bold" style={{ color: '#2064d8' }}>
              {strings.CASHFLOW}
            </CardTitle>
            <div className="mb-1 card-header-actions card-select-alignment">
              <select className="form-control card-select" onChange={handleChange}>
                <option value="12">{strings.Last12Months}</option>
                <option value="6">{strings.Last6Months}</option>
                <option value="3">{strings.Last3Months}</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="data-info">
            <div className="data-item">
              <img alt="income" src={incomeIcon} style={{ width: '50px', height: '55px' }} />
              <div>
                <h5>
                  {universal_currency_list?.[0] && inflow && (
                    <Currency
                      value={inflow.sum || 0}
                      currencySymbol={
                        universal_currency_list[0]
                          ? universal_currency_list[0].currencyIsoCode
                          : 'USD'
                      }
                    />
                  )}
                </h5>
                <p>{strings.INFLOW}</p>
              </div>
            </div>
            <div className="data-item ml-4">
              <img alt="outgoing" src={outcomeIcon} style={{ width: '40px', height: '40px' }} />
              <div>
                <h5>
                  {universal_currency_list?.[0] && outflow && (
                    <Currency
                      value={outflow.sum || 0}
                      currencySymbol={
                        universal_currency_list[0]
                          ? universal_currency_list[0].currencyIsoCode
                          : 'USD'
                      }
                    />
                  )}
                </h5>
                <p>{strings.OUTFLOW}</p>
              </div>
            </div>
          </div>
          <div
            className="row data-item total mt-2"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <div
              className="column"
              style={{
                width: '50%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <img
                className="mr-3"
                alt="total"
                src={totalIcon}
                style={{ width: '50px', height: '50px' }}
              />
            </div>
            <div className="column" style={{ width: '50%' }}>
              <h5>
                {universal_currency_list?.[0] && outflow && (
                  <Currency
                    value={(inflow.sum || 0) - (outflow.sum || 0)}
                    currencySymbol={
                      universal_currency_list[0]
                        ? universal_currency_list[0].currencyIsoCode
                        : 'USD'
                    }
                  />
                )}
              </h5>
              <p>{strings.NET}</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <Bar
              data={cashFlowBar}
              options={cashBarOption}
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

export default CashFlow;
