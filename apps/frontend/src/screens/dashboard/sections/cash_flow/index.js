import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, CardBody } from 'components/migration';
import { Currency } from 'components';
import { ArrowUpCircle, ArrowDownCircle, Scale, Calendar } from 'lucide-react';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const cashBarOption = {
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  },
  plugins: {
    tooltip: {
      enabled: true,
      backgroundColor: '#1e3a5f',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#2064d8',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#98afc2',
        font: {
          size: 12,
          weight: 500,
        },
        padding: 16,
        usePointStyle: true,
        pointStyle: 'rectRounded',
      },
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
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
  maintainAspectRatio: false,
  responsive: true,
  barPercentage: 0.7,
  categoryPercentage: 0.8,
};

let strings = new LocalizedStrings(data);

class CashFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language'),
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
    this.props.DashboardActions.getCashFlowGraphData(12);
  };

  handleChange = e => {
    e.preventDefault();
    this.props.DashboardActions.getCashFlowGraphData(e.currentTarget.value);
  };

  render() {
    strings.setLanguage(this.state.language);
    const graphData = this.props.cash_flow_graph || {};
    const inflow = graphData.inflow || {};
    const outflow = graphData.outflow || {};
    const cashFlowBar = {
      labels: graphData.labels || [],
      datasets: [
        {
          label: inflow.label || 'Inflow',
          backgroundColor: 'rgba(0, 200, 150, 0.85)',
          hoverBackgroundColor: 'rgba(0, 200, 150, 1)',
          borderRadius: 6,
          borderSkipped: false,
          data: inflow.data || [],
        },
        {
          label: outflow.label || 'Outflow',
          backgroundColor: 'rgba(255, 77, 106, 0.85)',
          hoverBackgroundColor: 'rgba(255, 77, 106, 1)',
          borderRadius: 6,
          borderSkipped: false,
          data: outflow.data || [],
        },
      ],
    };
    const { universal_currency_list } = this.props;
    const netFlow = (inflow.sum || 0) - (outflow.sum || 0);
    const isPositive = netFlow >= 0;

    return (
      <div className="animated fadeIn">
        <Card className="cash-card card-margin">
          <CardBody className="tab-card">
            <div className="flex-wrapper title-bottom-border">
              <h1
                className="card-h1"
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#2064d8',
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                {strings.CASHFLOW}
              </h1>
              <div className="mb-1 card-header-actions card-select-alignment">
                <select className="form-control card-select" onChange={e => this.handleChange(e)}>
                  <option value="12">{strings.Last12Months}</option>
                  <option value="6">{strings.Last6Months}</option>
                  <option value="3">{strings.Last3Months}</option>
                </select>
              </div>
            </div>

            {/* Cash Flow Cards */}
            <div className="cashflow-cards">
              {/* Inflow Card */}
              <div
                className="cashflow-card"
                style={{
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  className="cashflow-icon"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--neu-bg, #e8eef5)',
                    boxShadow:
                      '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                    margin: '0 auto 10px',
                  }}
                >
                  <ArrowUpCircle size={20} style={{ color: 'var(--neu-secondary, #21d8aa)' }} />
                </div>
                <p
                  style={{
                    marginBottom: '4px',
                    color: 'var(--neu-text-muted, #98afc2)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {strings.INFLOW}
                </p>
                <h5
                  style={{
                    margin: 0,
                    color: 'var(--neu-secondary, #21d8aa)',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {universal_currency_list[0] && (
                    <Currency
                      value={inflow.sum || 0}
                      currencySymbol={universal_currency_list[0]?.currencyIsoCode || 'USD'}
                    />
                  )}
                </h5>
              </div>

              {/* Outflow Card */}
              <div
                className="cashflow-card"
                style={{
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  className="cashflow-icon"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--neu-bg, #e8eef5)',
                    boxShadow:
                      '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                    margin: '0 auto 10px',
                  }}
                >
                  <ArrowDownCircle size={20} style={{ color: 'var(--neu-danger, #ff4d6a)' }} />
                </div>
                <p
                  style={{
                    marginBottom: '4px',
                    color: 'var(--neu-text-muted, #98afc2)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {strings.OUTFLOW}
                </p>
                <h5
                  style={{
                    margin: 0,
                    color: 'var(--neu-danger, #ff4d6a)',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {universal_currency_list[0] && (
                    <Currency
                      value={outflow.sum || 0}
                      currencySymbol={universal_currency_list[0]?.currencyIsoCode || 'USD'}
                    />
                  )}
                </h5>
              </div>

              {/* Net Flow Card */}
              <div
                className="cashflow-card"
                style={{
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  className="cashflow-icon"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--neu-bg, #e8eef5)',
                    boxShadow:
                      '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                    margin: '0 auto 10px',
                  }}
                >
                  <Scale size={20} style={{ color: 'var(--neu-primary, #2064d8)' }} />
                </div>
                <p
                  style={{
                    marginBottom: '4px',
                    color: 'var(--neu-text-muted, #98afc2)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {strings.NET}
                </p>
                <h5
                  style={{
                    margin: 0,
                    color: isPositive
                      ? 'var(--neu-secondary, #21d8aa)'
                      : 'var(--neu-danger, #ff4d6a)',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {universal_currency_list[0] && (
                    <Currency
                      value={netFlow}
                      currencySymbol={universal_currency_list[0]?.currencyIsoCode || 'USD'}
                    />
                  )}
                </h5>
              </div>
            </div>

            <div className="chart-wrapper card-visibility">
              <Bar
                data={cashFlowBar}
                options={cashBarOption}
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

export default CashFlow;
