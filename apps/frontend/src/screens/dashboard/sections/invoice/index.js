import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import { Currency } from 'components';
import { Nav, NavItem, NavLink, TabContent, TabPane, Card, CardBody, Button } from 'reactstrap';
// import { DateRangePicker2 } from 'components'

import './style.scss';

const invoiceOption = {
  indexAxis: 'y', // Makes it a horizontal bar chart
  plugins: {
    tooltip: {
      enabled: true,
    },
    legend: {
      display: true,
      position: 'right',
      labels: {
        boxWidth: 15,
      },
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
};

// const ranges =  {
//   // 'Today': [dayjs(), dayjs()],
//   // 'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
//   'This Week': [dayjs().startOf('week'), dayjs().endOf('week')],
//   'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
//   'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
//   'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
//   'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
// }

class Invoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: new Array(4).fill('1'),
    };
  }

  toggle = (tabPane, tab) => {
    const newArray = this.state.activeTab.slice();
    newArray[parseInt(tabPane, 10)] = tab;
    this.setState({
      activeTab: newArray,
    });
  };

  componentDidMount = () => {
    this.props.DashboardActions.getInvoiceGraphData(12);
  };

  handleChange = e => {
    e.preventDefault();
    this.props.DashboardActions.getInvoiceGraphData(e.currentTarget.value);
  };

  render() {
    const graphData = this.props.invoice_graph || {};
    const invoiceBar = {
      labels: graphData.labels || [],
      datasets: [
        {
          label: (graphData.paid || {})['label'] || 'Paid',
          backgroundColor: '#36A2EB89',
          data: (graphData.paid || {})['data'] || [],
        },
        {
          label: (graphData.due || {})['label'] || 'Due',
          backgroundColor: '#FF638489',
          data: (graphData.due || {})['data'] || [],
        },
        {
          label: (graphData.overdue || {})['label'] || 'Overdue',
          backgroundColor: '#FFCE5689',
          data: (graphData.overdue || {})['data'] || [],
        },
      ],
    };
    let sum = 0;
    if (graphData.overdue && graphData.overdue['data']) {
      sum = graphData.overdue['data'].reduce(function (prev, current) {
        return prev + +current;
      }, 0);
    }
    const { universal_currency_list } = this.props;
    return (
      <div className="animated fadeIn">
        <Card className="invoice-card card-margin">
          <CardBody className="tab-card">
            <div className="flex-wrapper title-bottom-border">
              <Nav tabs>
                <NavItem>
                  <NavLink
                    active={this.state.activeTab[0] === '1'}
                    onClick={() => {
                      this.toggle(0, '1');
                    }}
                  >
                    Invoices Timeline
                  </NavLink>
                </NavItem>
              </Nav>
              <div className="card-header-actions">
                <select
                  className="form-control"
                  ref={this.dateRangeSelect}
                  onChange={e => this.handleChange(e)}
                >
                  <option value="12">Last 12 Months</option>
                  <option value="6">Last 6 Months</option>
                  <option value="3">Last 3 Months</option>
                </select>
              </div>
            </div>
            <TabContent activeTab={this.state.activeTab[0]}>
              <TabPane tabId="1">
                <div className="flex-wrapper" style={{ paddingLeft: 20 }}>
                  <div className="data-info">
                    <Button
                      color="primary"
                      style={{ marginBottom: '10px' }}
                      className="btn-square"
                      onClick={() =>
                        this.props.history.push(`/admin/income/customer-invoice/create`)
                      }
                    >
                      <i className="nav-icon icon-speech mr-1" />
                      New Invoice
                    </Button>
                  </div>
                  <div className="data-info">
                    <div className="data-item">
                      <div>
                        <h3>
                          {universal_currency_list[0] && (
                            <Currency
                              value={sum}
                              currencySymbol={
                                universal_currency_list[0]
                                  ? universal_currency_list[0].currencyIsoCode
                                  : 'USD'
                              }
                            />
                          )}
                        </h3>

                        <p>OUTSTANDING</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="chart-wrapper invoices">
                  <Bar
                    data={invoiceBar}
                    options={invoiceOption}
                    datasetKeyProvider={() => {
                      return Math.random();
                    }}
                  />
                </div>
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default Invoice;
