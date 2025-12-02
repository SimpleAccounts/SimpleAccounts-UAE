import React from 'react';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux'
import {
	Card,
	CardHeader,
	CardBody,
	Row,
	Col,
	TabContent,
	TabPane,
	Nav,
	NavItem,
	NavLink,
} from 'reactstrap';

import { ExpenseReport, CustomerReport, AccountBalances } from './sections';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
// import 'react-select/dist/react-select.css'
import './style.scss';

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {};
};

class TransactionsReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: new Array(3).fill('1'),
		};
	}

	toggle = (tabPane, tab) => {
		const newArray = this.state.activeTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		this.setState({
			activeTab: newArray,
		});
	};

	render() {
		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-exchange-alt" />
										<span className="ml-2">Transactions Report</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							<Nav tabs>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '1'}
										onClick={() => {
											this.toggle(0, '1');
										}}
									>
										Account Balances
									</NavLink>
								</NavItem>
								{/* <NavItem>
                  <NavLink
                    active={this.state.activeTab[0] === '2'}
                    onClick={() => { this.toggle(0, '2') }}
                  >
                    Customer Invoice Report
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    active={this.state.activeTab[0] === '3'}
                    onClick={() => { this.toggle(0, '3') }}
                  >
                    Expenses
                  </NavLink>
                </NavItem> */}
							</Nav>
							<TabContent activeTab={this.state.activeTab[0]}>
								<TabPane tabId="1">
									<div className="table-wrapper">
										<AccountBalances />
									</div>
								</TabPane>
								<TabPane tabId="2">
									<div className="table-wrapper">
										<CustomerReport />
									</div>
								</TabPane>
								<TabPane tabId="3">
									<div className="table-wrapper">
										<ExpenseReport />
									</div>
								</TabPane>
							</TabContent>
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionsReport);
