import React, { Component } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardBody } from 'reactstrap';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

let strings = new LocalizedStrings(data);

class ProfitAndLossReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profit_loss_report_data: {
        labels: [],
        datasets: [],
      },
      language: window['localStorage'].getItem('language'),
      selectedMonths: '6',
    };
    this.bankAccountSelect = React.createRef();
    this.dateRangeSelect = React.createRef();
  }

  toggle = (tabPane, tab) => {
    const newArray = this.state.activeTab.slice();
    newArray[parseInt(tabPane, 10)] = tab;
    this.setState({
      activeTab: newArray,
    });
  };

  componentDidMount = () => {
    this.loadProfitLossReport(this.state.selectedMonths);
  };

  getBankAccountGraphData = (account, dateRange) => {
    if (account && dateRange) {
      this.props.DashboardActions.getBankAccountGraphData({ account, daterange: dateRange });
    }
  };

  loadProfitLossReport = range => {
    this.props.DashboardActions.getProfitLossReport(range)
      .then(action => {
        // Redux Toolkit thunks return action objects
        if (action && action.type && action.type.includes('fulfilled')) {
          this.getProfitLossGraph(action.payload);
        }
      })
      .catch(err => {
        // Surface error for debugging but avoid crashing the dashboard.
        // eslint-disable-next-line no-console
        console.error('Failed to load profit/loss chart', err);
      });
  };

  handleRangeChange = event => {
    const { value } = event.currentTarget;
    this.setState({ selectedMonths: value });
    this.loadProfitLossReport(value);
  };

  getProfitLossGraph = data => {
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

    this.setState({ profit_loss_report_data: chartData });
  };

  render() {
    strings.setLanguage(this.state.language);

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
      <div className="animated fadeIn ">
        <Card className="cash-card card-margin">
          <CardBody className="card-body-padding">
            <div className="flex-wrapper title-bottom-border">
              <h1 className="mb-2 card-h1">{strings.ProfitLoss}</h1>
              <div className="card-header-actions ml-auto">
                <select
                  className="form-control"
                  value={this.state.selectedMonths}
                  onChange={this.handleRangeChange}
                >
                  <option value="3">Last 3 Months</option>
                  <option value="6">Last 6 Months</option>
                  <option value="12">Last 12 Months</option>
                </select>
              </div>
            </div>
            <div className="chart-wrapper" style={{ height: '320px' }}>
              <Bar data={this.state.profit_loss_report_data} options={chartOptions} />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default ProfitAndLossReport;
