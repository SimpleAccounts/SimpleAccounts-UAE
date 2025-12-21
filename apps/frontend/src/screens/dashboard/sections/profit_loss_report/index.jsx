import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

let strings = new LocalizedStrings(data);

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
          backgroundColor: '#2064d8',
          borderColor: '#2064d8',
          data: data.income.incomeData || [],
          order: 2,
        },
        {
          type: 'line',
          label: 'Expenses',
          backgroundColor: 'rgba(244, 119, 46, 0.1)',
          borderColor: '#f4772e',
          borderWidth: 4,
          fill: false,
          tension: 0.4, // smooth curve
          pointRadius: 4,
          pointBackgroundColor: '#f4772e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(125, 138, 156, 0.3)',
          drawBorder: true,
        },
        ticks: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(125, 138, 156, 0.3)',
          drawBorder: true,
        },
        ticks: {
          display: true,
        },
      },
    },
  };

  return (
    <div className="animated fadeIn">
      <Card className="cash-card card-margin">
        <CardHeader>
          <div className="flex-wrapper title-bottom-border pb-3">
            <CardTitle className="text-xl font-bold" style={{ color: '#2064d8' }}>
              {strings.ProfitLoss}
            </CardTitle>
            <div className="card-header-actions ml-auto">
              <select
                className="form-control"
                value={selectedMonths}
                onChange={handleRangeChange}
              >
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="d-block" style={{ height: '320px' }}>
            <Bar data={profit_loss_report_data} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitAndLossReport;
