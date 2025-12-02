import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CardColumns } from 'reactstrap';


import {

	BankAccount,
	CashFlow,

	ProfitAndLossReport,
	PaidInvoices,
} from './sections';

import * as DashboardActions from './actions';

import './style.scss';

const mapStateToProps = (state) => {
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
const mapDispatchToProps = (dispatch) => {
	return {
		DashboardActions: bindActionCreators(DashboardActions, dispatch),
	};
};
class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			
		};
	}
	

	render() {
		return (
			<div className="dashboard-screen">
				<div className="animated fadeIn">
				<PaidInvoices {...this.props} />
					<CardColumns className="cols-2">
						<BankAccount {...this.props} />
						{/* <RevenueAndExpense {...this.props} /> */}
						<CashFlow {...this.props} />
					</CardColumns>
				 <ProfitAndLossReport {...this.props} />		
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
