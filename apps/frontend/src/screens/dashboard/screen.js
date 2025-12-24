import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col } from 'components/migration';
import {
  LayoutDashboard,
  TrendingUp,
  Landmark,
  Scale,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
} from 'lucide-react';

import { BankAccount, CashFlow, ProfitAndLossReport, PaidInvoices } from './sections';
import * as DashboardActions from './actions';
import './style.scss';

const mapStateToProps = state => {
  return {
    profile: state.auth.profile,
    bank_account_type: state.dashboard.bank_account_type,
    bank_account_graph: state.dashboard.bank_account_graph,
    universal_currency_list: state.common.universal_currency_list,
    cash_flow_graph: state.dashboard.cash_flow_graph,
    invoice_graph: state.dashboard.invoice_graph,
    profit_loss: state.dashboard.proft_loss,
    taxes: state.dashboard.taxes,
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
    this.state = {
      currentTime: new Date(),
    };
  }

  componentDidMount() {
    this.timeInterval = setInterval(() => {
      this.setState({ currentTime: new Date() });
    }, 60000);
  }

  componentWillUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  render() {
    const { profile } = this.props;
    const { currentTime } = this.state;

    const formattedDate = currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const firstName = profile?.firstName || 'User';

    return (
      <div className="dashboard-page">
        {/* Welcome Section */}
        <div className="welcome-card">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1 className="greeting">
                {this.getGreeting()}, {firstName}!
              </h1>
              <p className="date-display">{formattedDate}</p>
            </div>
            <div className="welcome-badge">
              <div
                className="icon-container"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
                }}
              >
                <LayoutDashboard size={18} style={{ color: 'var(--neu-primary, #2064d8)' }} />
              </div>
              <span>Dashboard Overview</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <Row className="stats-row">
          <Col lg={3} md={6}>
            <div className="stat-card stat-primary">
              <div
                className="stat-icon"
                style={{
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
                }}
              >
                <FileText size={24} style={{ color: 'var(--neu-primary, #2064d8)' }} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Invoices</span>
                <span className="stat-value">--</span>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className="stat-card stat-success">
              <div
                className="stat-icon"
                style={{
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
                }}
              >
                <ArrowUpCircle size={24} style={{ color: 'var(--neu-secondary, #21d8aa)' }} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Income</span>
                <span className="stat-value">--</span>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className="stat-card stat-warning">
              <div
                className="stat-icon"
                style={{
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
                }}
              >
                <ArrowDownCircle size={24} style={{ color: 'var(--neu-warning, #f59e0b)' }} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Expenses</span>
                <span className="stat-value">--</span>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className="stat-card stat-info">
              <div
                className="stat-icon"
                style={{
                  background: 'var(--neu-bg, #e8eef5)',
                  boxShadow:
                    '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
                }}
              >
                <Wallet size={24} style={{ color: '#06b6d4' }} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Balance</span>
                <span className="stat-value">--</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Invoice Chart Section */}
        <div className="section-header">
          <div
            className="section-icon"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--neu-bg, #e8eef5)',
              boxShadow:
                '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
              marginRight: '12px',
            }}
          >
            <TrendingUp size={20} style={{ color: 'var(--neu-secondary, #21d8aa)' }} />
          </div>
          <h2 className="section-title">Key Performance Indicators</h2>
        </div>

        <div className="chart-card full-width">
          <PaidInvoices {...this.props} />
        </div>

        {/* Financial Overview Section */}
        <div className="section-header">
          <div
            className="section-icon"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--neu-bg, #e8eef5)',
              boxShadow:
                '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
              marginRight: '12px',
            }}
          >
            <Landmark size={20} style={{ color: 'var(--neu-primary, #2064d8)' }} />
          </div>
          <h2 className="section-title">Financial Overview</h2>
        </div>

        <Row
          className="charts-row"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}
        >
          <Col xs={12} lg={6} className="mb-4 d-flex" style={{ minWidth: 0, display: 'flex' }}>
            <div
              className="chart-card flex-grow-1"
              style={{
                width: '100%',
                minWidth: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <BankAccount {...this.props} />
            </div>
          </Col>
          <Col xs={12} lg={6} className="mb-4 d-flex" style={{ minWidth: 0, display: 'flex' }}>
            <div
              className="chart-card flex-grow-1"
              style={{
                width: '100%',
                minWidth: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CashFlow {...this.props} />
            </div>
          </Col>
        </Row>

        {/* Profit & Loss Section */}
        <div className="section-header">
          <div
            className="section-icon"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--neu-bg, #e8eef5)',
              boxShadow:
                '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
              marginRight: '12px',
            }}
          >
            <Scale size={20} style={{ color: 'var(--neu-warning, #f59e0b)' }} />
          </div>
          <h2 className="section-title">Profit & Loss Report</h2>
        </div>

        <div className="chart-card full-width">
          <ProfitAndLossReport {...this.props} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
