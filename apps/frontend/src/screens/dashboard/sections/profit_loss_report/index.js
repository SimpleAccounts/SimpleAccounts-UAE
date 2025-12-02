import React, { Component } from 'react';
import Chart from 'react-apexcharts';

import {

	Card,
	CardBody,
} from 'reactstrap';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import './style.scss';
let strings = new LocalizedStrings(data);

class ProfitAndLossReport extends Component {
	constructor(props) {
		super(props);
		this.state = {
			profit_loss_report_data: [],
			profit_loss_report_data_options: {},
			language: window['localStorage'].getItem('language'),

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
		this.props.DashboardActions.getProfitLossReport(12).then((res) => {
			if (res.status === 200) {
				this.getProfitLossGraph(res.data);
			}
		});
	};

	getBankAccountGraphData = (account, dateRange) => {
		this.props.DashboardActions.getBankAccountGraphData(account, dateRange);
	};

	getProfitLossGraph = (data) => {
		const options = {
			chart: {
				toolbar: {
					show: true,
				},
				sparkline: {
					enabled: false,
				},
			},
			labels: data.label.labels,
			stroke: {
				curve: 'smooth',
				width: [0, 4],
			},
			grid: {
				strokeDashArray: '10',
				borderColor: 'rgba(125, 138, 156, 0.3)',
			},
			colors: ['#2064d8', '#f4772e'],
			legend: {
				show: true,
			},
			xaxis: {
				type: 'datetime',
			},
			yaxis: {
				min: 0,
			},
			zoom: {
				enabled: false,
			},
			
		}
		const series = [
			{
				name: 'Income ',
				type: 'column',
				data: data.income.incomeData,
			},
			{
				name: 'Expenses ',
				type: 'line',
				data: data.expense.expenseData,
			},
		]
		this.setState({ profit_loss_report_data_options: options, profit_loss_report_data: series })
	}

	render() {
		strings.setLanguage(this.state.language);

		return (
			<div className="animated fadeIn ">
				<Card className="cash-card card-margin">
					<CardBody className="card-body-padding">
				<div className="flex-wrapper title-bottom-border">
					<h1 className="mb-2 card-h1">
									{strings.ProfitLoss}
								</h1>
				</div>
								<div className="d-block">
									<Chart
										options={this.state.profit_loss_report_data_options}
										series={this.state.profit_loss_report_data}
										height={320}
									/>
								</div>
					</CardBody>
				</Card>
			</div>
						
		);
	}
}

export default ProfitAndLossReport;
