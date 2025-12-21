import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Row, Col } from 'reactstrap';

import { BankAccount, CashFlow, ProfitAndLossReport, PaidInvoices } from './sections';
import * as DashboardActions from './actions';
import './style.scss';

// Import dashboard icons
import bankIcon from 'assets/images/dashboard/bank.png';
import incomeIcon from 'assets/images/dashboard/income.png';
import outcomeIcon from 'assets/images/dashboard/outcome.png';
import totalIcon from 'assets/images/dashboard/total.png';

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
              <span>📊 Dashboard Overview</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <Row className="stats-row">
          <Col lg={3} md={6}>
            <div className="stat-card stat-primary">
              <div className="stat-icon">
                <img src={bankIcon} alt="Invoices" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Invoices</span>
                <span className="stat-value">--</span>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className="stat-card stat-success">
              <div className="stat-icon">
                <img src={incomeIcon} alt="Income" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Income</span>
                <span className="stat-value">--</span>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className="stat-card stat-warning">
              <div className="stat-icon">
                <img src={outcomeIcon} alt="Expenses" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Expenses</span>
                <span className="stat-value">--</span>
              </div>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className="stat-card stat-info">
              <div className="stat-icon">
                <img src={totalIcon} alt="Balance" />
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
          <h2 className="section-title">📈 Key Performance Indicators</h2>
        </div>

        <div className="chart-card full-width">
          <PaidInvoices {...this.props} />
        </div>

        {/* Financial Overview Section */}
        <div className="section-header">
          <h2 className="section-title">🏦 Financial Overview</h2>
        </div>

        <Row className="charts-row">
          <Col lg={6}>
            <div className="chart-card">
              <BankAccount {...this.props} />
            </div>
          </Col>
          <Col lg={6}>
            <div className="chart-card">
              <CashFlow {...this.props} />
            </div>
          </Col>
        </Row>

        {/* Profit & Loss Section */}
        <div className="section-header">
          <h2 className="section-title">⚖️ Profit & Loss Report</h2>
        </div>

        <div className="chart-card full-width">
          <ProfitAndLossReport {...this.props} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
