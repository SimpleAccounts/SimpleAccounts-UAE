import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Col, Row, Card, CardBody, CardGroup } from 'reactstrap';
import { Line, Bar } from 'react-chartjs-2';

import * as DashboardActions from './actions';

import './style.scss';

const mapStateToProps = state => {
  return {
    // Bank Account
    bank_account_type: state.dashboard.bank_account_type,
    bank_account_graph: state.dashboard.bank_account_graph,

    universal_currency_list: state.common.universal_currency_list,

    // Cash Flow
    cash_flow_graph: state.dashboard.cash_flow_graph,

    // Invoice
    invoice_graph: state.dashboard.invoice_graph,

    // Profit and Loss
    profit_loss: state.dashboard.proft_loss,
    taxes: state.dashboard.taxes,

    // Revenues and Expenses
    revenue_graph: state.dashboard.revenue_graph,
    expense_graph: state.dashboard.expense_graph,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    DashboardActions: bindActionCreators(DashboardActions, dispatch),
  };
};

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    // Chart.js configuration for mixed chart (Income column + Expenses line)
    const chart55Data = {
      labels: [
        '01 Jan 2001',
        '02 Jan 2001',
        '03 Jan 2001',
        '04 Jan 2001',
        '05 Jan 2001',
        '06 Jan 2001',
        '07 Jan 2001',
        '08 Jan 2001',
        '09 Jan 2001',
        '10 Jan 2001',
        '11 Jan 2001',
        '12 Jan 2001',
      ],
      datasets: [
        {
          type: 'bar',
          label: 'Income',
          backgroundColor: '#0abcce',
          borderColor: '#0abcce',
          data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160],
          order: 2,
        },
        {
          type: 'line',
          label: 'Expenses',
          backgroundColor: 'rgba(6, 9, 24, 0.1)',
          borderColor: '#060918',
          borderWidth: 4,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#060918',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          data: [231, 442, 335, 227, 433, 222, 117, 316, 242, 252, 162, 176],
          order: 1,
        },
      ],
    };

    const chart55Options = {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        tooltip: {
          enabled: true,
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          type: 'category',
          grid: {
            display: true,
            color: 'rgba(125, 138, 156, 0.3)',
            drawBorder: true,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(125, 138, 156, 0.3)',
            drawBorder: true,
          },
        },
      },
    };

    // Chart.js configuration for multi-line chart
    const data4MultipleData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderCapStyle: 'round',
          borderDash: [],
          borderWidth: 4,
          borderColor: '#7a7b97',
          borderDashOffset: 0.0,
          borderJoinStyle: 'round',
          pointBorderColor: '#7a7b97',
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 3,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 3,
          pointRadius: 4,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#7a7b97',
          data: [65, 59, 80, 81, 56, 55, 40],
          datalabels: {
            display: false,
          },
          label: "Today's Earnings",
        },
        {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderCapStyle: 'round',
          borderDash: [],
          borderWidth: 4,
          borderColor: '#4191ff',
          borderDashOffset: 0.0,
          borderJoinStyle: 'round',
          pointBorderColor: '#4191ff',
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 3,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 3,
          pointRadius: 4,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#4191ff',
          data: [65, 81, 56, 59, 80, 55, 40],
          datalabels: {
            display: false,
          },
          label: 'Current Week',
        },
        {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderCapStyle: 'round',
          borderDash: [],
          borderWidth: 4,
          borderColor: '#f4772e',
          borderDashOffset: 0.0,
          borderJoinStyle: 'round',
          pointBorderColor: '#f4772e',
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 3,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 3,
          pointRadius: 4,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#f4772e',
          data: [28, 48, 19, 86, 27, 40, 90],
          datalabels: {
            display: false,
          },
          label: 'Previous Week',
        },
      ],
    };

    const data4MultipleOptions = {
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

    // Simple area chart data
    const areaChartData = {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Series 1',
          data: [30, 40, 25, 50, 49, 21, 70, 51],
          fill: true,
          backgroundColor: 'rgba(32, 100, 216, 0.2)',
          borderColor: '#2064d8',
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'Series 2',
          data: [23, 12, 54, 61, 32, 56, 81, 19],
          fill: true,
          backgroundColor: 'rgba(244, 119, 46, 0.2)',
          borderColor: '#f4772e',
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    };

    const areaChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
          },
        },
      },
    };

    return (
      <div className="dashboard-screen">
        <div className="animated fadeIn">
          <Row className="justify-content-center">
            <Col md="6">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <h6 className="text-uppercase font-weight-bold mb-1 text-black">
                      Monthly Report
                    </h6>
                    <div className="d-block">
                      <Bar data={chart55Data} options={chart55Options} height={280} />
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
            <Col md="6" className="mb-4">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <h6 className="text-uppercase font-weight-bold mb-1 text-black">
                      Total Revenue
                    </h6>
                    <div className="d-block">
                      <Bar data={chart55Data} options={chart55Options} height={300} />
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
            <Col md="12" className="mb-4">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <h6 className="text-uppercase font-weight-bold mb-1 text-black">
                      Total Revenue
                    </h6>
                    <div className="d-block p-4">
                      <Line data={data4MultipleData} height={255} options={data4MultipleOptions} />
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
            <Col md="6">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Line data={areaChartData} options={areaChartOptions} />
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
