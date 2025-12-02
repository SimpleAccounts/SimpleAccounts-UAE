import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Col, Row, Card, CardBody, CardGroup } from 'reactstrap';
import Chart from 'react-apexcharts';
// import {
// 	Invoice,
// 	BankAccount,
// 	CashFlow,
// 	RevenueAndExpense,
// 	ProfitAndLoss,
// } from './sections';

import * as DashboardActions from './actions';
import { Line } from 'react-chartjs-2';

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
		this.state = {};
	}

	render() {
		const options = {
			xaxis: {
				categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			},
		};
		const series = [
			{
				name: 'series-1',
				data: [30, 40, 25, 50, 49, 21, 70, 51],
			},
			{
				name: 'series-2',
				data: [23, 12, 54, 61, 32, 56, 81, 19],
			},
		];
		const chart55Options = {
			chart: {
				toolbar: {
					show: false,
				},
				sparkline: {
					enabled: true,
				},
			},
			labels: [
				'01 Jan 2001',
				'02 Jan 2001',
				'03 Jan 2001',
				'04 Jan 2001',
				'05 Jan 2001',
				'06 Jan 2001',
				'07 Jan 2001',
				'08 Jan 2001',
				'09 Jan 2001',
				'10 Jan 2001',
				'11 Jan 2001',
				'12 Jan 2001',
			],
			stroke: {
				curve: 'smooth',
				width: [0, 4],
			},
			grid: {
				strokeDashArray: '5',
				borderColor: 'rgba(125, 138, 156, 0.3)',
			},
			colors: ['#0abcce', '#060918'],
			legend: {
				show: false,
			},
			xaxis: {
				type: 'datetime',
			},
			yaxis: {
				min: 0,
			},
		};
		const chart55Data = [
			{
				name: 'Income',
				type: 'column',
				data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160],
			},
			{
				name: 'Expenses',
				type: 'line',
				data: [231, 442, 335, 227, 433, 222, 117, 316, 242, 252, 162, 176],
			},
		];
		const data4MultipleData = {
			labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
			datasets: [
				{
					backgroundColor: 'rgba(255, 255, 255, 0)',
					borderCapStyle: 'round',
					borderDash: [],
					borderWidth: 4,
					borderColor: '#7a7b97',
					borderDashOffset: 0.0,
					borderJoinStyle: 'round',
					pointBorderColor: '#7a7b97',
					pointBackgroundColor: '#ffffff',
					pointBorderWidth: 3,
					pointHoverRadius: 6,
					pointHoverBorderWidth: 3,
					pointRadius: 4,
					pointHoverBackgroundColor: '#ffffff',
					pointHoverBorderColor: '#7a7b97',
					data: [65, 59, 80, 81, 56, 55, 40],
					datalabels: {
						display: false,
					},
					label: "Today's Earnings",
				},
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
					data: [65, 81, 56, 59, 80, 55, 40],
					datalabels: {
						display: false,
					},
					label: 'Current Week',
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
					data: [28, 48, 19, 86, 27, 40, 90],
					datalabels: {
						display: false,
					},
					label: 'Previous Week',
				},
			],
		};
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
				display: false,
			},
			responsive: true,
			maintainAspectRatio: false,
		};
		return (
			<div className="dashboard-screen">
				<div className="animated fadeIn">
					<Row className="justify-content-center">
						<Col md="6">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<h6 className="text-uppercase font-weight-bold mb-1 text-black">
											Monthly Report
										</h6>
										<span
											dangerouslySetInnerHTML={{
												__html:
													'<svg id="SvgjsSvg1322" width="658" height="280" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" class="apexcharts-svg" xmlns:data="ApexChartsNS" transform="translate(0, 0)" style="background: transparent;"><g id="SvgjsG1324" class="apexcharts-inner apexcharts-graphical" transform="translate(42.59375, 30)"><defs id="SvgjsDefs1323"><linearGradient id="SvgjsLinearGradient1327" x1="0" y1="0" x2="0" y2="1"><stop id="SvgjsStop1328" stop-opacity="0.4" stop-color="rgba(216,227,240,0.4)" offset="0"></stop><stop id="SvgjsStop1329" stop-opacity="0.5" stop-color="rgba(190,209,230,0.5)" offset="1"></stop><stop id="SvgjsStop1330" stop-opacity="0.5" stop-color="rgba(190,209,230,0.5)" offset="1"></stop></linearGradient><clipPath id="gridRectMask4b96e5"><rect id="SvgjsRect1333" width="611.40625" height="214.348" x="-3" y="-1" rx="0" ry="0" fill="#ffffff" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0"></rect></clipPath><clipPath id="gridRectMarkerMask4b96e5"><rect id="SvgjsRect1334" width="607.40625" height="214.348" x="-1" y="-1" rx="0" ry="0" fill="#ffffff" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0"></rect></clipPath></defs><line id="SvgjsLine1332" x1="228.64849417550224" y1="0" x2="228.64849417550224" y2="212.348" stroke-dasharray="3" class="apexcharts-xcrosshairs" x="228.64849417550224" y="0" width="1" height="212.348" fill="url(#SvgjsLinearGradient1327)" filter="none" fill-opacity="0.9" stroke-width="0"></line><g id="SvgjsG1355" class="apexcharts-xaxis" transform="translate(0, 0)"><g id="SvgjsG1356" class="apexcharts-xaxis-texts-g" transform="translate(0, -4)"><text id="SvgjsText1358" font-family="Helvetica, Arial, sans-serif" x="43.24330357142857" y="241.348" text-anchor="middle" dominant-baseline="auto" font-size="12px" font-weight="400" fill="#373d3f" class="apexcharts-text apexcharts-xaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1359">January</tspan><title>January</title></text><text id="SvgjsText1361" font-family="Helvetica, Arial, sans-serif" x="129.72991071428572" y="241.348" text-anchor="middle" dominant-baseline="auto" font-size="12px" font-weight="400" fill="#373d3f" class="apexcharts-text apexcharts-xaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1362">February</tspan><title>February</title></text><text id="SvgjsText1364" font-family="Helvetica, Arial, sans-serif" x="216.2165178571429" y="241.348" text-anchor="middle" dominant-baseline="auto" font-size="12px" font-weight="400" fill="#373d3f" class="apexcharts-text apexcharts-xaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1365">March</tspan><title>March</title></text><text id="SvgjsText1367" font-family="Helvetica, Arial, sans-serif" x="302.703125" y="241.348" text-anchor="middle" dominant-baseline="auto" font-size="12px" font-weight="400" fill="#373d3f" class="apexcharts-text apexcharts-xaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1368">April</tspan><title>April</title></text><text id="SvgjsText1370" font-family="Helvetica, Arial, sans-serif" x="389.1897321428571" y="241.348" text-anchor="middle" dominant-baseline="auto" font-size="12px" font-weight="400" fill="#373d3f" class="apexcharts-text apexcharts-xaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1371">May</tspan><title>May</title></text><text id="SvgjsText1373" font-family="Helvetica, Arial, sans-serif" x="475.6763392857142" y="241.348" text-anchor="middle" dominant-baseline="auto" font-size="12px" font-weight="400" fill="#373d3f" class="apexcharts-text apexcharts-xaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1374">June</tspan><title>June</title></text><text id="SvgjsText1376" font-family="Helvetica, Arial, sans-serif" x="562.1629464285713" y="241.348" text-anchor="middle" dominant-baseline="auto" font-size="12px" font-weight="400" fill="#373d3f" class="apexcharts-text apexcharts-xaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1377">July</tspan><title>July</title></text></g><line id="SvgjsLine1378" x1="0" y1="213.348" x2="605.40625" y2="213.348" stroke="#e0e0e0" stroke-dasharray="0" stroke-width="1"></line></g><g id="SvgjsG1403" class="apexcharts-grid"><g id="SvgjsG1404" class="apexcharts-gridlines-horizontal"><line id="SvgjsLine1414" x1="0" y1="0" x2="605.40625" y2="0" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1415" x1="0" y1="21.2348" x2="605.40625" y2="21.2348" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1416" x1="0" y1="42.4696" x2="605.40625" y2="42.4696" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1417" x1="0" y1="63.7044" x2="605.40625" y2="63.7044" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1418" x1="0" y1="84.9392" x2="605.40625" y2="84.9392" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1419" x1="0" y1="106.174" x2="605.40625" y2="106.174" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1420" x1="0" y1="127.40880000000001" x2="605.40625" y2="127.40880000000001" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1421" x1="0" y1="148.64360000000002" x2="605.40625" y2="148.64360000000002" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1422" x1="0" y1="169.87840000000003" x2="605.40625" y2="169.87840000000003" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1423" x1="0" y1="191.11320000000003" x2="605.40625" y2="191.11320000000003" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line><line id="SvgjsLine1424" x1="0" y1="212.34800000000004" x2="605.40625" y2="212.34800000000004" stroke="rgba(125, 138, 156, 0.3)" stroke-dasharray="5" class="apexcharts-gridline"></line></g><g id="SvgjsG1405" class="apexcharts-gridlines-vertical"></g><line id="SvgjsLine1406" x1="0" y1="213.348" x2="0" y2="219.348" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-xaxis-tick"></line><line id="SvgjsLine1407" x1="86.48660714285714" y1="213.348" x2="86.48660714285714" y2="219.348" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-xaxis-tick"></line><line id="SvgjsLine1408" x1="172.97321428571428" y1="213.348" x2="172.97321428571428" y2="219.348" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-xaxis-tick"></line><line id="SvgjsLine1409" x1="259.45982142857144" y1="213.348" x2="259.45982142857144" y2="219.348" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-xaxis-tick"></line><line id="SvgjsLine1410" x1="345.94642857142856" y1="213.348" x2="345.94642857142856" y2="219.348" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-xaxis-tick"></line><line id="SvgjsLine1411" x1="432.43303571428567" y1="213.348" x2="432.43303571428567" y2="219.348" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-xaxis-tick"></line><line id="SvgjsLine1412" x1="518.9196428571428" y1="213.348" x2="518.9196428571428" y2="219.348" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-xaxis-tick"></line><line id="SvgjsLine1413" x1="605.4062499999999" y1="213.348" x2="605.4062499999999" y2="219.348" stroke="#e0e0e0" stroke-dasharray="0" class="apexcharts-xaxis-tick"></line><line id="SvgjsLine1426" x1="0" y1="212.348" x2="605.40625" y2="212.348" stroke="transparent" stroke-dasharray="0"></line><line id="SvgjsLine1425" x1="0" y1="1" x2="0" y2="212.348" stroke="transparent" stroke-dasharray="0"></line></g><g id="SvgjsG1336" class="apexcharts-bar-series apexcharts-plot-series"><g id="SvgjsG1337" class="apexcharts-series" rel="1" seriesName="NetxProfit" data:realIndex="0"><path id="SvgjsPath1339" d="M 12.97299107142857 212.348L 12.97299107142857 91.52931034482759L 41.24330357142857 91.52931034482759L 41.24330357142857 212.348L 11.97299107142857 212.348" fill="rgba(244,119,46,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="0" clip-path="url(#gridRectMask4b96e5)" pathTo="M 12.97299107142857 212.348L 12.97299107142857 91.52931034482759L 41.24330357142857 91.52931034482759L 41.24330357142857 212.348L 11.97299107142857 212.348" pathFrom="M 12.97299107142857 212.348L 12.97299107142857 212.348L 41.24330357142857 212.348L 41.24330357142857 212.348L 11.97299107142857 212.348" cy="91.52931034482759" cx="98.4595982142857" j="0" val="3.3" barHeight="120.81868965517242" barWidth="30.2703125"></path><path id="SvgjsPath1340" d="M 99.4595982142857 212.348L 99.4595982142857 98.8516551724138L 127.7299107142857 98.8516551724138L 127.7299107142857 212.348L 98.4595982142857 212.348" fill="rgba(244,119,46,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="0" clip-path="url(#gridRectMask4b96e5)" pathTo="M 99.4595982142857 212.348L 99.4595982142857 98.8516551724138L 127.7299107142857 98.8516551724138L 127.7299107142857 212.348L 98.4595982142857 212.348" pathFrom="M 99.4595982142857 212.348L 99.4595982142857 212.348L 127.7299107142857 212.348L 127.7299107142857 212.348L 98.4595982142857 212.348" cy="98.8516551724138" cx="184.94620535714284" j="1" val="3.1" barHeight="113.49634482758621" barWidth="30.2703125"></path><path id="SvgjsPath1341" d="M 185.94620535714284 212.348L 185.94620535714284 65.90110344827588L 214.21651785714283 65.90110344827588L 214.21651785714283 212.348L 184.94620535714284 212.348" fill="rgba(244,119,46,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="0" clip-path="url(#gridRectMask4b96e5)" pathTo="M 185.94620535714284 212.348L 185.94620535714284 65.90110344827588L 214.21651785714283 65.90110344827588L 214.21651785714283 212.348L 184.94620535714284 212.348" pathFrom="M 185.94620535714284 212.348L 185.94620535714284 212.348L 214.21651785714283 212.348L 214.21651785714283 212.348L 184.94620535714284 212.348" cy="65.90110344827588" cx="271.43281249999995" j="2" val="4" barHeight="146.44689655172414" barWidth="30.2703125"></path><path id="SvgjsPath1342" d="M 272.43281249999995 212.348L 272.43281249999995 0L 300.70312499999994 0L 300.70312499999994 212.348L 271.43281249999995 212.348" fill="rgba(244,119,46,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="0" clip-path="url(#gridRectMask4b96e5)" pathTo="M 272.43281249999995 212.348L 272.43281249999995 0L 300.70312499999994 0L 300.70312499999994 212.348L 271.43281249999995 212.348" pathFrom="M 272.43281249999995 212.348L 272.43281249999995 212.348L 300.70312499999994 212.348L 300.70312499999994 212.348L 271.43281249999995 212.348" cy="0" cx="357.91941964285706" j="3" val="5.8" barHeight="212.348" barWidth="30.2703125"></path><path id="SvgjsPath1343" d="M 358.91941964285706 212.348L 358.91941964285706 135.46337931034483L 387.18973214285705 135.46337931034483L 387.18973214285705 212.348L 357.91941964285706 212.348" fill="rgba(244,119,46,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="0" clip-path="url(#gridRectMask4b96e5)" pathTo="M 358.91941964285706 212.348L 358.91941964285706 135.46337931034483L 387.18973214285705 135.46337931034483L 387.18973214285705 212.348L 357.91941964285706 212.348" pathFrom="M 358.91941964285706 212.348L 358.91941964285706 212.348L 387.18973214285705 212.348L 387.18973214285705 212.348L 357.91941964285706 212.348" cy="135.46337931034483" cx="444.4060267857142" j="4" val="2.1" barHeight="76.88462068965518" barWidth="30.2703125"></path><path id="SvgjsPath1344" d="M 445.4060267857142 212.348L 445.4060267857142 80.54579310344829L 473.67633928571416 80.54579310344829L 473.67633928571416 212.348L 444.4060267857142 212.348" fill="rgba(244,119,46,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="0" clip-path="url(#gridRectMask4b96e5)" pathTo="M 445.4060267857142 212.348L 445.4060267857142 80.54579310344829L 473.67633928571416 80.54579310344829L 473.67633928571416 212.348L 444.4060267857142 212.348" pathFrom="M 445.4060267857142 212.348L 445.4060267857142 212.348L 473.67633928571416 212.348L 473.67633928571416 212.348L 444.4060267857142 212.348" cy="80.54579310344829" cx="530.8926339285713" j="5" val="3.6" barHeight="131.80220689655172" barWidth="30.2703125"></path><path id="SvgjsPath1345" d="M 531.8926339285713 212.348L 531.8926339285713 95.19048275862069L 560.1629464285713 95.19048275862069L 560.1629464285713 212.348L 530.8926339285713 212.348" fill="rgba(244,119,46,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="0" clip-path="url(#gridRectMask4b96e5)" pathTo="M 531.8926339285713 212.348L 531.8926339285713 95.19048275862069L 560.1629464285713 95.19048275862069L 560.1629464285713 212.348L 530.8926339285713 212.348" pathFrom="M 531.8926339285713 212.348L 531.8926339285713 212.348L 560.1629464285713 212.348L 560.1629464285713 212.348L 530.8926339285713 212.348" cy="95.19048275862069" cx="617.3792410714284" j="6" val="3.2" barHeight="117.15751724137932" barWidth="30.2703125"></path></g><g id="SvgjsG1346" class="apexcharts-series" rel="2" seriesName="NetxLoss" data:realIndex="1"><path id="SvgjsPath1348" d="M 43.24330357142857 212.348L 43.24330357142857 135.46337931034483L 71.51361607142857 135.46337931034483L 71.51361607142857 212.348L 42.24330357142857 212.348" fill="rgba(65,145,255,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="1" clip-path="url(#gridRectMask4b96e5)" pathTo="M 43.24330357142857 212.348L 43.24330357142857 135.46337931034483L 71.51361607142857 135.46337931034483L 71.51361607142857 212.348L 42.24330357142857 212.348" pathFrom="M 43.24330357142857 212.348L 43.24330357142857 212.348L 71.51361607142857 212.348L 71.51361607142857 212.348L 42.24330357142857 212.348" cy="135.46337931034483" cx="128.7299107142857" j="0" val="2.1" barHeight="76.88462068965518" barWidth="30.2703125"></path><path id="SvgjsPath1349" d="M 129.7299107142857 212.348L 129.7299107142857 135.46337931034483L 158.00022321428568 135.46337931034483L 158.00022321428568 212.348L 128.7299107142857 212.348" fill="rgba(65,145,255,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="1" clip-path="url(#gridRectMask4b96e5)" pathTo="M 129.7299107142857 212.348L 129.7299107142857 135.46337931034483L 158.00022321428568 135.46337931034483L 158.00022321428568 212.348L 128.7299107142857 212.348" pathFrom="M 129.7299107142857 212.348L 129.7299107142857 212.348L 158.00022321428568 212.348L 158.00022321428568 212.348L 128.7299107142857 212.348" cy="135.46337931034483" cx="215.21651785714283" j="1" val="2.1" barHeight="76.88462068965518" barWidth="30.2703125"></path><path id="SvgjsPath1350" d="M 216.21651785714283 212.348L 216.21651785714283 109.83517241379312L 244.48683035714282 109.83517241379312L 244.48683035714282 212.348L 215.21651785714283 212.348" fill="rgba(65,145,255,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="1" clip-path="url(#gridRectMask4b96e5)" pathTo="M 216.21651785714283 212.348L 216.21651785714283 109.83517241379312L 244.48683035714282 109.83517241379312L 244.48683035714282 212.348L 215.21651785714283 212.348" pathFrom="M 216.21651785714283 212.348L 216.21651785714283 212.348L 244.48683035714282 212.348L 244.48683035714282 212.348L 215.21651785714283 212.348" cy="109.83517241379312" cx="301.70312499999994" j="2" val="2.8" barHeight="102.5128275862069" barWidth="30.2703125"></path><path id="SvgjsPath1351" d="M 302.70312499999994 212.348L 302.70312499999994 109.83517241379312L 330.97343749999993 109.83517241379312L 330.97343749999993 212.348L 301.70312499999994 212.348" fill="rgba(65,145,255,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="1" clip-path="url(#gridRectMask4b96e5)" pathTo="M 302.70312499999994 212.348L 302.70312499999994 109.83517241379312L 330.97343749999993 109.83517241379312L 330.97343749999993 212.348L 301.70312499999994 212.348" pathFrom="M 302.70312499999994 212.348L 302.70312499999994 212.348L 330.97343749999993 212.348L 330.97343749999993 212.348L 301.70312499999994 212.348" cy="109.83517241379312" cx="388.18973214285705" j="3" val="2.8" barHeight="102.5128275862069" barWidth="30.2703125"></path><path id="SvgjsPath1352" d="M 389.18973214285705 212.348L 389.18973214285705 54.91758620689657L 417.46004464285704 54.91758620689657L 417.46004464285704 212.348L 388.18973214285705 212.348" fill="rgba(65,145,255,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="1" clip-path="url(#gridRectMask4b96e5)" pathTo="M 389.18973214285705 212.348L 389.18973214285705 54.91758620689657L 417.46004464285704 54.91758620689657L 417.46004464285704 212.348L 388.18973214285705 212.348" pathFrom="M 389.18973214285705 212.348L 389.18973214285705 212.348L 417.46004464285704 212.348L 417.46004464285704 212.348L 388.18973214285705 212.348" cy="54.91758620689657" cx="474.67633928571416" j="4" val="4.3" barHeight="157.43041379310344" barWidth="30.2703125"></path><path id="SvgjsPath1353" d="M 475.67633928571416 212.348L 475.67633928571416 113.49634482758621L 503.94665178571415 113.49634482758621L 503.94665178571415 212.348L 474.67633928571416 212.348" fill="rgba(65,145,255,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="1" clip-path="url(#gridRectMask4b96e5)" pathTo="M 475.67633928571416 212.348L 475.67633928571416 113.49634482758621L 503.94665178571415 113.49634482758621L 503.94665178571415 212.348L 474.67633928571416 212.348" pathFrom="M 475.67633928571416 212.348L 475.67633928571416 212.348L 503.94665178571415 212.348L 503.94665178571415 212.348L 474.67633928571416 212.348" cy="113.49634482758621" cx="561.1629464285713" j="5" val="2.7" barHeight="98.8516551724138" barWidth="30.2703125"></path><path id="SvgjsPath1354" d="M 562.1629464285713 212.348L 562.1629464285713 161.09158620689658L 590.4332589285714 161.09158620689658L 590.4332589285714 212.348L 561.1629464285713 212.348" fill="rgba(65,145,255,0.85)" fill-opacity="1" stroke="transparent" stroke-opacity="1" stroke-linecap="butt" stroke-width="2" stroke-dasharray="0" class="apexcharts-bar-area" index="1" clip-path="url(#gridRectMask4b96e5)" pathTo="M 562.1629464285713 212.348L 562.1629464285713 161.09158620689658L 590.4332589285714 161.09158620689658L 590.4332589285714 212.348L 561.1629464285713 212.348" pathFrom="M 562.1629464285713 212.348L 562.1629464285713 212.348L 590.4332589285714 212.348L 590.4332589285714 212.348L 561.1629464285713 212.348" cy="161.09158620689658" cx="647.6495535714284" j="6" val="1.4" barHeight="51.25641379310345" barWidth="30.2703125"></path></g><g id="SvgjsG1338" class="apexcharts-datalabels" data:realIndex="0"></g><g id="SvgjsG1347" class="apexcharts-datalabels" data:realIndex="1"></g></g><line id="SvgjsLine1427" x1="0" y1="0" x2="605.40625" y2="0" stroke="#b6b6b6" stroke-dasharray="0" stroke-width="1" class="apexcharts-ycrosshairs"></line><line id="SvgjsLine1428" x1="0" y1="0" x2="605.40625" y2="0" stroke-dasharray="0" stroke-width="0" class="apexcharts-ycrosshairs-hidden"></line><g id="SvgjsG1429" class="apexcharts-yaxis-annotations"></g><g id="SvgjsG1430" class="apexcharts-xaxis-annotations"></g><g id="SvgjsG1431" class="apexcharts-point-annotations"></g></g><rect id="SvgjsRect1331" width="0" height="0" x="0" y="0" rx="0" ry="0" fill="#fefefe" opacity="1" stroke-width="0" stroke="none" stroke-dasharray="0"></rect><g id="SvgjsG1379" class="apexcharts-yaxis" rel="0" transform="translate(12.59375, 0)"><g id="SvgjsG1380" class="apexcharts-yaxis-texts-g"><text id="SvgjsText1381" font-family="Helvetica, Arial, sans-serif" x="20" y="32" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1382">5.8</tspan></text><text id="SvgjsText1383" font-family="Helvetica, Arial, sans-serif" x="20" y="53.2348" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1384">5.2</tspan></text><text id="SvgjsText1385" font-family="Helvetica, Arial, sans-serif" x="20" y="74.4696" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1386">4.6</tspan></text><text id="SvgjsText1387" font-family="Helvetica, Arial, sans-serif" x="20" y="95.70439999999999" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1388">4.1</tspan></text><text id="SvgjsText1389" font-family="Helvetica, Arial, sans-serif" x="20" y="116.9392" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1390">3.5</tspan></text><text id="SvgjsText1391" font-family="Helvetica, Arial, sans-serif" x="20" y="138.174" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1392">2.9</tspan></text><text id="SvgjsText1393" font-family="Helvetica, Arial, sans-serif" x="20" y="159.4088" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1394">2.3</tspan></text><text id="SvgjsText1395" font-family="Helvetica, Arial, sans-serif" x="20" y="180.64360000000002" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1396">1.7</tspan></text><text id="SvgjsText1397" font-family="Helvetica, Arial, sans-serif" x="20" y="201.87840000000003" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1398">1.2</tspan></text><text id="SvgjsText1399" font-family="Helvetica, Arial, sans-serif" x="20" y="223.11320000000003" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1400">0.6</tspan></text><text id="SvgjsText1401" font-family="Helvetica, Arial, sans-serif" x="20" y="244.34800000000004" text-anchor="end" dominant-baseline="auto" font-size="11px" font-weight="regular" fill="#373d3f" class="apexcharts-text apexcharts-yaxis-label " style="font-family: Helvetica, Arial, sans-serif;"><tspan id="SvgjsTspan1402">0.0</tspan></text></g></g></svg>',
											}}
										/>
									</CardBody>
								</Card>
							</CardGroup>
						</Col>
						<Col md="6" className="mb-4">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<h6 className="text-uppercase font-weight-bold mb-1 text-black">
											Total Revenue
										</h6>
										<div className="d-block">
											<Chart
												options={chart55Options}
												series={chart55Data}
												type="line"
												height={300}
											/>
										</div>
									</CardBody>
								</Card>
							</CardGroup>
						</Col>
						<Col md="12" className="mb-4">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<h6 className="text-uppercase font-weight-bold mb-1 text-black">
											Total Revenue
										</h6>
										<div className="d-block p-4">
											<Line
												data={data4MultipleData}
												height={255}
												options={data4MultipleOptions}
											/>
										</div>
									</CardBody>
								</Card>
							</CardGroup>
						</Col>
						<Col md="6">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<Chart options={options} series={series} type="area" />
									</CardBody>
								</Card>
							</CardGroup>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
