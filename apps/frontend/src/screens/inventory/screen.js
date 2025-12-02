import React from 'react';
import { connect } from 'react-redux';
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
import { InventoryDashboard, InventorySummary } from './sections';
// import 'react-select/dist/react-select.css'
import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {};
};

let strings = new LocalizedStrings(data);
class Inventory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: new Array(2).fill('1'),
			language: window['localStorage'].getItem('language'),
		};
	}

	toggle = (tabPane, tab) => {
		const newArray = this.state.activeTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		console.log(tab);
		this.setState({
			activeTab: newArray,
		});
	};

	render() {
		strings.setLanguage(this.state.language);
		return (
			<div className="financial-report-screen">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fas fa-warehouse" />
										<span className="ml-2 " >{strings.Inventory}</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							<Nav tabs pills>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '1'}
										onClick={() => {
											this.toggle(0, '1');
										}}
									>
										{strings.Dashboard}
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={this.state.activeTab[0] === '2'}
										onClick={() => {
											this.toggle(0, '2');
										}}
									>
										{strings.Summary}
									</NavLink>
								</NavItem>
							</Nav>
							<TabContent activeTab={this.state.activeTab[0]}>
								<TabPane tabId="1">
									<div className="table-wrapper">
										<InventoryDashboard />
									</div>
								</TabPane>
								<TabPane tabId="2">
									<div className="table-wrapper">
										<InventorySummary />
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

export default connect(mapStateToProps, mapDispatchToProps)(Inventory);
