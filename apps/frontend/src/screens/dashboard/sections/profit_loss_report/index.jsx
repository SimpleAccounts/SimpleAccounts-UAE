import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, CardBody } from 'reactstrap';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

let strings = new LocalizedStrings(data);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    tooltip: {
      backgroundColor: '#1e3a5f',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#1e6eff',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#3d5a80',
        font: {
          size: 12,
        },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(200, 210, 220, 0.3)',
        drawBorder: false,
      },
      border: {
        display: false,
      },
      ticks: {
        display: true,
        color: '#98afc2',
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(200, 210, 220, 0.3)',
        drawBorder: false,
      },
      border: {
        display: false,
      },
      ticks: {
        display: true,
        color: '#98afc2',
        font: {
          size: 11,
        },
      },
    },
  },
};

const ProfitAndLossReport = props => {
  const { DashboardActions } = props;
  const [language] = useState(window['localStorage'].getItem('language'));
  const [profit_loss_report_data, setProfitLossReportData] = useState({
    labels: [],
    datasets: [],
  });
  const [selectedMonths, setSelectedMonths] = useState('6');

  useEffect(() => {
    if (DashboardActions) {
      loadProfitLossReport(selectedMonths);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const loadProfitLossReport = range => {
    DashboardActions.getProfitLossReport(range)
      .then(action => {
        // Redux Toolkit thunks return action objects
        if (action && action.type && action.type.includes('fulfilled')) {
          getProfitLossGraph(action.payload);
        }
      })
      .catch(err => {
        // Surface error for debugging but avoid crashing the dashboard.
        // eslint-disable-next-line no-console
        console.error('Failed to load profit/loss chart', err);
      });
  };

  const handleRangeChange = event => {
    const { value } = event.currentTarget;
    setSelectedMonths(value);
    loadProfitLossReport(value);
  };

  const getProfitLossGraph = data => {
    // Convert ApexCharts format to Chart.js format
    const chartData = {
      labels: data.label.labels || [],
      datasets: [
        {
          type: 'bar',
          label: 'Income',
          backgroundColor: '#1e6eff',
          borderColor: '#1e6eff',
          borderRadius: 4,
          data: data.income.incomeData || [],
          order: 2,
        },
        {
          type: 'line',
          label: 'Expenses',
          backgroundColor: 'rgba(244, 119, 46, 0.1)',
          borderColor: '#f4772e',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#f4772e',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#f4772e',
          pointHoverBorderColor: '#ffffff',
          data: data.expense.expenseData || [],
          order: 1,
        },
      ],
    };

    setProfitLossReportData(chartData);
  };

  // Set language before using strings
  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  return (
    <Card className="profit-loss-card card-margin">
      <CardBody className="tab-card">
        <div className="flex-wrapper title-bottom-border">
          <h1 className="card-h1">{strings.ProfitLoss || 'PROFIT & LOSS'}</h1>
          <div className="card-header-actions">
            <select
              className="form-control card-select"
              value={selectedMonths}
              onChange={handleRangeChange}
            >
              <option value="3">Last 3 Months</option>
              <option value="6">Last 6 Months</option>
              <option value="12">Last 12 Months</option>
            </select>
          </div>
        </div>
        <div className="chart-wrapper" style={{ height: '300px', marginTop: '20px' }}>
          <Bar data={profit_loss_report_data} options={chartOptions} />
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfitAndLossReport;
