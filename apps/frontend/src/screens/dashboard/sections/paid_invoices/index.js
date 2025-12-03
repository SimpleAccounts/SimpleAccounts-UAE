import React, { Component } from 'react';
import Chart from 'react-apexcharts';
import { Line } from 'react-chartjs-2';
import {

	Card,
	CardBody,
} from 'reactstrap';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

import './style.scss';

let strings = new LocalizedStrings(data);

class PaidInvoices extends Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			invoice_graph_data: {},
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
		this.props.DashboardActions.getInvoiceGraphData(12).then((res) => {
			if (res.status === 200) {
				this.getInvoiceGraph(res.data);
			}
		});
	};

	getInvoiceGraph = (data) => {
		const data4MultipleData = {
			labels: data.labels,
			datasets: [
				{
					backgroundColor: 'rgba(255, 255, 255, 0)',
					borderCapStyle: 'round',
					borderDash: [],
					borderWidth: 4,
					borderColor: '#4191ff',
					borderDashOffset: 0.0,
					borderJoinStyle: 'round',
					pointBorderColor: '#4191ff',
					pointBackgroundColor: '#ffffff',
					pointBorderWidth: 3,
					pointHoverRadius: 6,
					pointHoverBorderWidth: 3,
					pointRadius: 4,
					pointHoverBackgroundColor: '#ffffff',
					pointHoverBorderColor: '#4191ff',
					data: data.paidCustomerData.data,
					datalabels: {
						display: false,
					},
					label: data.paidCustomerData.label+" ",
				},
				{
					backgroundColor: 'rgba(255, 255, 255, 0)',
					borderCapStyle: 'round',
					borderDash: [],
					borderWidth: 4,
					borderColor: '#f4772e',
					borderDashOffset: 0.0,
					borderJoinStyle: 'round',
					pointBorderColor: '#f4772e',
					pointBackgroundColor: '#ffffff',
					pointBorderWidth: 3,
					pointHoverRadius: 6,
					pointHoverBorderWidth: 3,
					pointRadius: 4,
					pointHoverBackgroundColor: '#ffffff',
					pointHoverBorderColor: '#f4772e',
					data: data.paidSupplierData.data,
					datalabels: {
						display: false,
					},
					label: data.paidSupplierData.label+" ",
				},
			],
		};
		this.setState({ invoice_graph_data: data4MultipleData })
	}
	
	render() {
		strings.setLanguage(this.state.language);
		const data4MultipleOptions = {
			layout: {
				padding: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
				},
			},
			scales: {
				yAxes: [
					{
						ticks: {
							display: true,
							beginAtZero: true,
						},
						gridLines: {
							display: true,
							color: '#eeeff8',
							drawBorder: true,
						},
					},
				],
				xAxes: [
					{
						ticks: {
							display: true,
							beginAtZero: true,
						},
						gridLines: {
							display: true,
							color: '#eeeff8',
							drawBorder: true,
						},
					},
				],
			},
			legend: {
				display: true,
				position: 'bottom'
			},
			responsive: true,
			maintainAspectRatio: false,
		};
	
		return (
			<div className="animated fadeIn ">
				<Card className="cash-card ">
					<CardBody className="card-body-padding">
					<div className="flex-wrapper title-bottom-border">
						<h1 className="mb-2 card-h1">
						{strings.SupplierCustomerPaidInvoices} 
						</h1>
					</div>
							<div className="d-block p-4">
								<Line
									data={this.state.invoice_graph_data}
									height={300}
									options={data4MultipleOptions}
								/>
							</div>
					</CardBody>
				</Card>
			</div>
						
		);

	}
}

export default PaidInvoices;
