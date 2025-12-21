import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { Currency } from 'components';
import { Card, CardBody, Row, Col } from 'reactstrap';
import { Landmark, Wallet, Building2, Calendar } from 'lucide-react';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

import './style.scss';

let strings = new LocalizedStrings(data);

const backOption = {
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  },
  scales: {
    y: {
      ticks: {
        display: true,
        color: '#98afc2',
        font: {
          size: 11,
        },
      },
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(200, 210, 220, 0.3)',
        drawBorder: false,
      },
      border: {
        display: false,
      },
    },
    x: {
      ticks: {
        display: true,
        color: '#98afc2',
        font: {
          size: 11,
        },
      },
      beginAtZero: true,
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1e3a5f',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#1e6eff',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: {
      tension: 0.4,
    },
  },
};

class BankAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language'),
      activeTab: new Array(4).fill('1'),
      totalBalance: 0,
    };
    this.bankAccountSelect = React.createRef();
    this.dateRangeSelect = React.createRef();
  }

  // toggle = (tabPane, tab) => {
  // 	const newArray = this.state.activeTab.slice();
  // 	newArray[parseInt(tabPane, 10)] = tab;
  // 	this.setState({
  // 		activeTab: newArray,
  // 	});
  // };

  componentDidMount = () => {
    // Run getTotalBalance in parallel - it doesn't depend on getBankAccountTypes
    this.props.DashboardActions.getTotalBalance().then(action => {
      // Redux Toolkit thunks return action objects
      if (action && action.type && action.type.includes('fulfilled')) {
        this.setState({ totalBalance: action.payload });
      }
    });

    this.props.DashboardActions.getBankAccountTypes().then(action => {
      // Redux Toolkit thunks return action objects
      if (action && action.type && action.type.includes('fulfilled')) {
        const data = action.payload;
        let val = data && data[0] ? data[0].bankAccountId : '';
        this.getBankAccountGraphData(val, 12);
      }
    });
  };

  getBankAccountGraphData = (account, dateRange) => {
    if (account && dateRange) {
      this.props.DashboardActions.getBankAccountGraphData({ account, daterange: dateRange });
    }
  };

  // componentWillReceiveProps(newProps) {
  //   if (this.props.bank_account_type !== newProps.bank_account_type) {

  //   }
  // }

  handleChange = e => {
    e.preventDefault();
    this.getBankAccountGraphData(
      this.bankAccountSelect.current.value,
      this.dateRangeSelect.current.value
    );
  };

  render() {
    strings.setLanguage(this.state.language);
    const graphData = this.props.bank_account_graph || {};
    const line = {
      labels: graphData.labels || [],
      datasets: [
        {
          label: 'Balance of ' + (graphData.account_name || '') + ' ',
          fill: true,
          lineTension: 0.4,
          backgroundColor: context => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(30, 110, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(30, 110, 255, 0.02)');
            return gradient;
          },
          borderColor: '#1e6eff',
          borderWidth: 3,
          pointBorderColor: '#1e6eff',
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#1e6eff',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          pointRadius: 4,
          pointHitRadius: 20,
          data: graphData.data || [],
        },
      ],
    };
    const { universal_currency_list } = this.props;
    return (
      <div className="animated fadeIn">
        <Card className="bank-card card-margin">
          <CardBody className="tab-card">
            <div className="flex-wrapper title-bottom-border">
              <h1
                className="card-h1"
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#1e6eff',
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                {strings.BANKING}
              </h1>
              <div className="mb-1 card-header-actions card-select-alignment">
                <select
                  className="form-control card-select"
                  ref={this.dateRangeSelect}
                  onChange={e => this.handleChange(e)}
                >
                  <option value="12">{strings.Last12Months}</option>
                  <option value="6">{strings.Last6Months}</option>
                  <option value="3">{strings.Last3Months}</option>
                </select>
              </div>
            </div>

            {/* Bank Selector with Icon */}
            <div className="bank-selector-wrapper">
              <div
                className="bank-icon-container"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
                  marginRight: '12px',
                  flexShrink: 0,
                }}
              >
                <Landmark size={22} style={{ color: 'var(--neu-primary, #1e6eff)' }} />
              </div>
              <select
                className="form-control bank-type-select card-select"
                ref={this.bankAccountSelect}
                onChange={e => this.handleChange(e)}
              >
                {(this.props.bank_account_type || []).map((account, index) => (
                  <option key={index} value={account.bankAccountId}>
                    {account.name + ' - ' + account.accounName}
                  </option>
                ))}
              </select>
            </div>

            {/* Last Updated */}
            <div className="last-updated">
              <Calendar
                size={14}
                style={{ color: 'var(--neu-text-muted, #98afc2)', marginRight: '6px' }}
              />
              <span>
                {strings.Lastupdatedon} {graphData.updatedDate || '--'}
              </span>
            </div>

            {/* Balance Cards */}
            <div className="balance-cards">
              <div
                className="balance-card"
                style={{
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                  borderRadius: '12px',
                  padding: '16px',
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                <div
                  className="balance-icon"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--neu-bg, #e8eef5)',
                    boxShadow:
                      '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                    margin: '0 auto 8px',
                  }}
                >
                  <Wallet size={18} style={{ color: 'var(--neu-primary, #1e6eff)' }} />
                </div>
                <p
                  style={{
                    marginBottom: '4px',
                    color: 'var(--neu-text-muted, #98afc2)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {strings.BALANCE}
                </p>
                <h5
                  style={{ margin: 0, color: 'var(--neu-text-primary, #1e3a5f)', fontWeight: 700 }}
                >
                  {universal_currency_list[0] && (
                    <Currency
                      value={this.props.bank_account_graph?.balance || 0}
                      currencySymbol={universal_currency_list[0]?.currencyIsoCode || 'USD'}
                    />
                  )}
                </h5>
              </div>

              <div
                className="balance-card"
                style={{
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                  borderRadius: '12px',
                  padding: '16px',
                  flex: 1,
                  textAlign: 'center',
                  marginLeft: '12px',
                }}
              >
                <div
                  className="balance-icon"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--neu-bg, #e8eef5)',
                    boxShadow:
                      '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                    margin: '0 auto 8px',
                  }}
                >
                  <Building2 size={18} style={{ color: 'var(--neu-secondary, #00c896)' }} />
                </div>
                <p
                  style={{
                    marginBottom: '4px',
                    color: 'var(--neu-text-muted, #98afc2)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {strings.ALLBANKACCOUNTS}
                </p>
                <h5
                  style={{ margin: 0, color: 'var(--neu-text-primary, #1e3a5f)', fontWeight: 700 }}
                >
                  {universal_currency_list[0] && (
                    <Currency
                      value={this.state.totalBalance}
                      currencySymbol={universal_currency_list[0]?.currencyIsoCode || 'USD'}
                    />
                  )}
                </h5>
              </div>
            </div>

            <div className="chart-wrapper card-visibility">
              <Line
                data={line}
                options={backOption}
                style={{ height: 200 }}
                datasetKeyProvider={() => Math.random()}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default BankAccount;
