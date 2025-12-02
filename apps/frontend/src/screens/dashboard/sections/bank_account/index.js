import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { Currency } from 'components';
import {

	Card,
	CardBody,
	Row,
	Col,
} from 'reactstrap';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';



import './style.scss';


let strings = new LocalizedStrings(data);

const backOption = {
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
	visibility: true ,
};

const bankIcon = require('assets/images/dashboard/bank1.png');

class BankAccount extends Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			activeTab: new Array(4).fill('1'),
			totalBalance: 0,
		};
		this.bankAccountSelect = React.createRef();
		this.dateRangeSelect = React.createRef();
	}

	// toggle = (tabPane, tab) => {
	// 	const newArray = this.state.activeTab.slice();
	// 	newArray[parseInt(tabPane, 10)] = tab;
	// 	this.setState({
	// 		activeTab: newArray,
	// 	});
	// };

	componentDidMount = () => {
		this.props.DashboardActions.getBankAccountTypes().then((res) => {
			if (res.status === 200) {
				let val =
					res.data && res.data.data && res.data.data[0]
						? res.data.data[0].bankAccountId
						: '';
				this.getBankAccountGraphData(val, 12);
				this.props.DashboardActions.getTotalBalance().then((res) => {
					if (res.status === 200) {
						this.setState({ totalBalance: res.data }, () => {});
					}
				});
			}
		});
	};

	getBankAccountGraphData = (account, dateRange) => {
		this.props.DashboardActions.getBankAccountGraphData(account, dateRange);
	};

	// componentWillReceiveProps(newProps) {
	//   if (this.props.bank_account_type !== newProps.bank_account_type) {

	//   }
	// }

	handleChange = (e) => {
		e.preventDefault();
		this.getBankAccountGraphData(
			this.bankAccountSelect.current.value,
			this.dateRangeSelect.current.value,
		);
	};

	render() {
		strings.setLanguage(this.state.language);
		const line = {
			labels: this.props.bank_account_graph.labels,
			datasets: [
				{
					label: "Delta of " + this.props.bank_account_graph.account_name+" ",
					fill: true,
					lineTension: 0.1,
					backgroundColor: 'rgba(32, 100, 216, 0.4)',
					borderColor: 'rgba(32, 100, 216, 1)',
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: 'rgba(32, 100, 216, 1)',
					pointBackgroundColor: '#fff',
					pointBorderWidth: 2,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: 'rgba(32, 100, 216, 1)',
					pointHoverBorderColor: 'rgba(32, 100, 216, 1)',
					pointHoverBorderWidth: 2,
					pointRadius: 4,
					pointHitRadius: 20,
					data: this.props.bank_account_graph.data,
				},
			],
		};
		const { universal_currency_list } = this.props;
		return (
			<div className="animated fadeIn  ">
				<Card className="bank-card card-margin ">
					<CardBody className="tab-card">
						<div className="flex-wrapper title-bottom-border">
						<h1 className="card-h1">{strings.BANKING}</h1>
						
							<div className="mb-1 card-header-actions card-select-alignment">
								<select
									className="form-control  card-select"
									ref={this.dateRangeSelect}
									onChange={(e) => this.handleChange(e)}
								>
									<option value="12">{strings.Last12Months}</option>
									<option value="6">{strings.Last6Months}</option>
									<option value="3">{strings.Last3Months}</option>
								</select>
							</div>
						</div>
						{/* main Start */}
								
									<Row className="data-info">
										<div style={{display:"contents"}}>
											<img
												alt="bankIcon ml-2"
												className="d-none d-lg-block"
												src={bankIcon}
												style={{ width: 40, marginRight: 10 }}
											/>
												<select
												style={{width:"45%",borderRadius:'0.25rem'}}
													className="form-control1 bank-type-select card-select mt-2"
													ref={this.bankAccountSelect}
													onChange={(e) => this.handleChange(e)}
												>
													{this.props.bank_account_type.map(
														(account, index) => (
															<option key={index} value={account.bankAccountId}>
																{account.name + '-' + account.accounName}
															</option>
														),
													)}
												</select>
												</div>
												</Row>
												<Row className="text-center mt-2" style={{    display: "block"}}>
												<p style={{ fontWeight: 500, textIndent: 5 ,marginTop:"-4px" }}>
												{strings.Lastupdatedon}{' '}
													{this.props.bank_account_graph.updatedDate}
												</p>
									
									
									</Row>
									<Row style={{marginBottom:"10px"}}>
										
									<Col className="data-item" style={{width:"50%",textAlign:'right',borderRight: "1px solid rgb(238 238 238)"}}>
											<div>
											<p  style={{marginBottom:"6px"}} className="mr-1 data-item">{strings.BALANCE}</p>
												<h5>
													{universal_currency_list[0] && (
														<Currency
															value={
																this.props.bank_account_graph.balance
																	? this.props.bank_account_graph.balance
																	: 0
															}
															currencySymbol={
																universal_currency_list[0]
																	? universal_currency_list[0].currencyIsoCode
																	: 'USD'
															}
														/>
													)}
												</h5>
												
											</div>
										</Col>
										<Col className="data-item">
											<div>
											<p  style={{marginBottom:"6px"}}>{strings.ALLBANKACCOUNTS}</p>
												<h5>
													{universal_currency_list[0] && (
														<Currency
															value={this.state.totalBalance}
															currencySymbol={
																universal_currency_list[0]
																	? universal_currency_list[0].currencyIsoCode
																	: 'USD'
															}
														/>
													)}
												</h5>
												
											</div>
										</Col>
									</Row>
								
								<div className="chart-wrapper card-visibility">
									<Line
										data={line}
										options={backOption}
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

export default BankAccount;
