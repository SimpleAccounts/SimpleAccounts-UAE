import React, { Component } from 'react';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Bar } from 'react-chartjs-2';
import { Card, CardBody } from 'reactstrap';
import { Currency } from 'components';
import './style.scss';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const cashBarOption = {
	tooltips: {
		enabled: false,
		custom: CustomTooltips,
	},
	legend: {
		display: true,
		position: 'bottom',
	},
	scales: {
		yAxes: [
			{
				ticks: {
					// Include a dollar sign in the ticks
					callback(value, index, values) {
						return value;
					},
					beginAtZero: true,
				},
			},
		],
	},
	maintainAspectRatio: false,
};


let strings = new LocalizedStrings(data);
const incomeIcon = require('assets/images/dashboard/Inflow.png');
const outcomeIcon = require('assets/images/dashboard/Outflow.png');
const totalIcon = require('assets/images/dashboard/Net.png');

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

	handleChange = (e) => {
		e.preventDefault();
		this.props.DashboardActions.getCashFlowGraphData(e.currentTarget.value);
	};

	render() {
		strings.setLanguage(this.state.language);
		const cashFlowBar = {
			labels: this.props.cash_flow_graph.labels || [],
			datasets: [
				{
					label: (this.props.cash_flow_graph.inflow || {})['label'],
					backgroundColor: 'rgba(65, 145, 255, 0.85)',
					hoverBackgroundColor: 'rgba(65, 145, 255, 0.85',
					data: (this.props.cash_flow_graph.inflow || {})['data'],
				},
				{
					label: (this.props.cash_flow_graph.outflow || {})['label'],
					backgroundColor: 'rgba(244, 119, 46, 0.85)',
					hoverBackgroundColor: 'rgba(244, 119, 46, 0.85)',
					data: (this.props.cash_flow_graph.outflow || {})['data'],
				},
			],
		};
		const { universal_currency_list } = this.props;
		return (
			<div className="animated fadeIn ">
				<Card className="cash-card">
					<CardBody className="tab-card">
						<div className="flex-wrapper title-bottom-border" >
							<h1 className="mb -2 card-h1">{strings.CASHFLOW}</h1>
							
							<div className=" mb-1 card-header-actions card-select-alignment">
								<select
									className="form-control card-select"
									onChange={(e) => this.handleChange(e)}
								>
									<option value="12">{strings.Last12Months}</option>
									<option value="6"> {strings.Last6Months}</option>
									<option value="3">{strings.Last3Months}</option>
								</select>
							</div>
						</div>
						
						<div className="data-info">
							<div className="data-item">
								<img alt="income" src={incomeIcon} />
								<div>
									<h5>
										{universal_currency_list[0] &&
											this.props.cash_flow_graph.inflow && (
												<Currency
													value={
														(this.props.cash_flow_graph.inflow || {})['sum']
													}
													currencySymbol={
														universal_currency_list[0]
															? universal_currency_list[0].currencyIsoCode
															: 'USD'
													}
												/>
											)}
									</h5>
									<p>{strings.INFLOW}</p>
								</div>
							</div> 
							<div className="data-item ml-4">
								<img alt="outgoing" src={outcomeIcon} />
								<div>
									<h5>
										{universal_currency_list[0] &&
											this.props.cash_flow_graph.outflow && (
												<Currency
													value={
														(this.props.cash_flow_graph.outflow || {})['sum']
													}
													currencySymbol={
														universal_currency_list[0]
															? universal_currency_list[0].currencyIsoCode
															: 'USD'
													}
												/>
											)}
									</h5>
									<p>{strings.OUTFLOW}</p>
								</div>
							</div>
						
						</div>
						<div className="row data-item total mt-2" >
							<div className="column" style={{width:'50%' ,textAlign:'right'}}>	<img className=" mr-3" alt="total" src={totalIcon} /> </div>
							<div className="column" >
									<h5>
										{' '}
										{universal_currency_list[0] &&
											this.props.cash_flow_graph.outflow && (
												<Currency
													value={
														(this.props.cash_flow_graph.inflow || {})['sum'] -
														(this.props.cash_flow_graph.outflow || {})['sum']
													}
													currencySymbol={
														universal_currency_list[0]
															? universal_currency_list[0].currencyIsoCode
															: 'USD'
													}
												/>
											)}
									</h5>
									<p>{strings.NET}</p>
								</div>
							</div>
						<div className="chart-wrapper">
							<Bar
								data={cashFlowBar}
								options={cashBarOption}
								style={{ height: 200 }}
								datasetKeyProvider={() => {
									return Math.random();
								}}
							/>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}
}

export default CashFlow;
