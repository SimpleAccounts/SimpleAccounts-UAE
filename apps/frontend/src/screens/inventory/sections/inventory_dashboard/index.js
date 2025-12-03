import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {  Row, Card, CardBody, CardGroup } from 'reactstrap';


import moment from 'moment';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Currency } from 'components';
import * as InventoryActions from '../../actions';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import { Bar, HorizontalBar  } from 'react-chartjs-2';
import { selectOptionsFactory } from 'utils';
import Select from 'react-select';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
		universal_currency_list: state.common.universal_currency_list,
		company_profile: state.common.company_profile,
		low_stock_list: state.inventory.low_stock_list,
		high_stock_list: state.inventory.high_stock_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		inventoryActions: bindActionCreators(
			InventoryActions,
			dispatch,
		),
	};
};

let strings = new LocalizedStrings(data);
class InventoryDashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			dropdownOpen: false,
			view: false,
			initValue: {
				startDate: moment().startOf('month').format('DD/MM/YYYY'),
				endDate: moment().endOf('month').format('DD/MM/YYYY'),
				reportBasis: 'ACCRUAL',
				chartOfAccountId: '',
				term: 'Yearly'
			},
			dataHorBar: {
				labels: [],
				datasets: [
					{
						backgroundColor: '#a1b86d',
						borderColor: 'rgba(161,184,109,1)',
						borderWidth: 1,
						hoverBackgroundColor: 'rgba(161,184,109,0.3)',
						hoverBorderColor: 'rgba(161,184,109,0.5)',
						data: []
					}

				]
			},
			dataHorBarOption:{	
				legend:{
				display:false
				},
				scales:{
					yAxes:[{
						barPercentage: 0.4,
					}]
				}
				
		},
			dataHorBarLeft: {
				labels: [],
				datasets: [
					{
						backgroundColor: '#f86c6b',
						borderColor: 'rgba(248,108,107,1)',
						borderWidth: 1,
						hoverBackgroundColor: 'rgba(227,168,168,0.7)',
						hoverBorderColor: 'rgba(227,168,168,0.5)',
						data: []
					}

				]
			},
			dataHorBarLeftOption:{
				legend:{
					display:false
				},
				scales:{
					yAxes:[{
						barPercentage: 0.4
					}]
				}
			},
			dataLine:{
				labels: [],
				datasets: [
					{
						data: [],
						fill: true,
						backgroundColor: "rgba(225,250,300,0.5)",
						borderColor: "rgba(0,120,212,1)"
					}
				]
			},
			dataLineOption:{
				legend:{
					display:false
				}
			},
			databar:{
				labels: [],
				datasets: [
					{
						backgroundColor: '#3483eb',
						data: []
					}

				]
			},
			databarOption:{
				legend:{
					display:false
				},
				scales:{
					xAxes:[{
						barPercentage: 0.3
					}]
				}
			},
			csvData: [],
			activePage: 1,
			sizePerPage: 10,
			totalCount: 0,
			sort: {
				column: null,
				direction: 'desc',
			},
			allProducts: '',
			inventoryValue:'',
			outOfStock:'',
			topSellingProducts: {},
			lowSellingProducts: {},
			topProfitGeneratingProducts: {},
			totalRevenue:{},
			quantityAvailable: '',
			//	lowStockCount:[],
			options: {},


		};


		this.dropdown = [
			{ label: 'Monthly', value: 'Monthly' },
			{ label: 'Quaterly', value: 'Quaterly' },
			{ label: 'Biannually', value: 'Biannually' },
			{ label: 'Yearly', value: 'Yearly' },
		];
	}

	generateReport = (value) => {
		this.setState(
			{
				initValue: {
					startDate: moment(value.startDate).format('DD/MM/YYYY'),
					endDate: moment(value.endDate).format('DD/MM/YYYY'),
				},
				loading: true,
				view: !this.state.view,
			},
			() => {
				this.initializeData();
			},
		);
	};

	handleChange = (val, val1, name, reconcile, row, label) => {
		const tempTopSelling = {
			labels: [],
			datasets: [
				{
					backgroundColor: '#a1b86d',
					borderColor: 'rgba(161,184,109,1)',
					borderWidth: 1,
					hoverBackgroundColor: 'rgba(161,184,109,0.3)',
					hoverBorderColor: 'rgba(161,184,109,0.5)',
					data: [],
				},

			]
		}

		switch (val.value) {
			case 'Monthly':
				tempTopSelling.labels = Object.keys(this.state.topSellingProducts.topSellingProductsMonthly)
				tempTopSelling.datasets[0].data = Object.values(this.state.topSellingProducts.topSellingProductsMonthly)
				this.setState({ dataHorBar: tempTopSelling });
				break;
			case 'Quaterly':
				tempTopSelling.labels = Object.keys(this.state.topSellingProducts.topSellingProductsQuarterly)
				tempTopSelling.datasets[0].data = Object.values(this.state.topSellingProducts.topSellingProductsQuarterly)
				this.setState({ dataHorBar: tempTopSelling });
				break;
			case 'Biannually':
				tempTopSelling.labels = Object.keys(this.state.topSellingProducts.topSellingProductsSixMonthly)
				tempTopSelling.datasets[0].data = Object.values(this.state.topSellingProducts.topSellingProductsSixMonthly)
				this.setState({ dataHorBar: tempTopSelling });
				break;
			case 'Yearly':
				tempTopSelling.labels = Object.keys(this.state.topSellingProducts.topSellingProductsYearly)
				tempTopSelling.datasets[0].data = Object.values(this.state.topSellingProducts.topSellingProductsYearly)
				this.setState({ dataHorBar: tempTopSelling });
				break;
		};

	};
	handleChange1 = (val, val1, name, reconcile, row, label) => {
		const tempLowSelling = {
			labels: [],
			datasets: [
				{
					backgroundColor: '#f86c6b',
					borderColor: 'rgba(248,108,107,1)',
					borderWidth: 1,
					hoverBackgroundColor: 'rgba(227,168,168,0.7)',
					hoverBorderColor: 'rgba(227,168,168,0.5)',
					data: [],
				},
			]

		}
		switch (val.value) {
			case 'Monthly':
				tempLowSelling.labels = Object.keys(this.state.lowSellingProducts.lowSellingProductsMonthly)
				tempLowSelling.datasets[0].data = Object.values(this.state.lowSellingProducts.lowSellingProductsMonthly)
				this.setState({ dataHorBarLeft: tempLowSelling });
				break;
			case 'Quaterly':
				tempLowSelling.labels = Object.keys(this.state.lowSellingProducts.lowSellingProductsQuarterly)
				tempLowSelling.datasets[0].data = Object.values(this.state.lowSellingProducts.lowSellingProductsQuarterly)
				this.setState({ dataHorBarLeft: tempLowSelling });
				break;
			case 'Biannually':
				tempLowSelling.labels = Object.keys(this.state.lowSellingProducts.lowSellingProductsSixMonthly)
				tempLowSelling.datasets[0].data = Object.values(this.state.lowSellingProducts.lowSellingProductsSixMonthly)
				this.setState({ dataHorBarLeft: tempLowSelling });
				break;
			case 'Yearly':
				tempLowSelling.labels = Object.keys(this.state.lowSellingProducts.lowSellingProductsYearly)
				tempLowSelling.datasets[0].data = Object.values(this.state.lowSellingProducts.lowSellingProductsYearly)
				this.setState({ dataHorBarLeft: tempLowSelling });
				break;
		}
	};
	handleChange2 = (val, val1, name, reconcile, row, label) => {
		const tempRevenue = {
			labels: [],
			datasets: [
				{
					data: [],
					fill: true,
					backgroundColor: "rgba(225,250,300,0.5)",
					borderColor: "rgba(0,120,212,1)"
				}
			]

		}
		switch (val.value) {
			case 'Monthly':
				tempRevenue.labels = Object.keys(this.state.totalRevenue.totalRevenueMonthly)
				tempRevenue.datasets[0].data = Object.values(this.state.totalRevenue.totalRevenueMonthly)
				this.setState({ dataLine: tempRevenue });
				console.log(tempRevenue.labels)
				break;
			case 'Quaterly':
				tempRevenue.labels = Object.keys(this.state.totalRevenue.totalRevenueQuarterly)
				tempRevenue.datasets[0].data = Object.values(this.state.totalRevenue.totalRevenueQuarterly)
				this.setState({ dataLine: tempRevenue });
				break;
			case 'Biannually':
				tempRevenue.labels = Object.keys(this.state.totalRevenue.totalRevenueSixMonthly)
				tempRevenue.datasets[0].data = Object.values(this.state.totalRevenue.totalRevenueSixMonthly)
				this.setState({ dataLine: tempRevenue });
				break;
			case 'Yearly':
				tempRevenue.labels = Object.keys(this.state.totalRevenue.totalRevenueYearly)
				tempRevenue.datasets[0].data = Object.values(this.state.totalRevenue.totalRevenueYearly)
				this.setState({ dataLine: tempRevenue });
				break;
		}
	}
	handleChange3 = (val, val1, name, reconcile, row, label) => {
		const tempProfit = {
			labels: [],
			datasets: [
				{
					backgroundColor: '#3483eb',
					data: [],
					hoverBackgroundColor: 'rgba(122,163,216,1)',
					hoverBorderColor: 'rgba(161,184,109,0.5)',
				}
			]

		}
		switch (val.value) {
			case 'Monthly':
				tempProfit.labels = Object.keys(this.state.topProfitGeneratingProducts.totalProfitMonthly)
				tempProfit.datasets[0].data = Object.values(this.state.topProfitGeneratingProducts.totalProfitMonthly)
				this.setState({ databar: tempProfit });
				console.log(tempProfit.labels)
				break;
			case 'Quaterly':
				tempProfit.labels = Object.keys(this.state.topProfitGeneratingProducts.totalProfitQuarterly)
				tempProfit.datasets[0].data = Object.values(this.state.topProfitGeneratingProducts.totalProfitQuarterly)
				this.setState({ databar: tempProfit });
				break;
			case 'Biannually':
				tempProfit.labels = Object.keys(this.state.topProfitGeneratingProducts.totalProfitSixMonthly)
				tempProfit.datasets[0].data = Object.values(this.state.topProfitGeneratingProducts.totalProfitSixMonthly)
				this.setState({ databar: tempProfit });
				break;
			case 'Yearly':
				tempProfit.labels = Object.keys(this.state.topProfitGeneratingProducts.totalProfitYearly)
				tempProfit.datasets[0].data = Object.values(this.state.topProfitGeneratingProducts.totalProfitYearly)
				this.setState({ databar: tempProfit });
				break;
		}
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.inventoryActions
			.getTopSellingProductsForInventory()
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						topSellingProducts: res.data
					});
					this.handleChange({ 'value': "Yearly" })
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
		this.props.inventoryActions
			.getLowSellingProductsForInventory()
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						lowSellingProducts: res.data
					});

					this.handleChange1({ 'value': "Yearly" })
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
			this.props.inventoryActions
			.getTotalRevenueOfInventory()
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						totalRevenue: res.data
					});

					this.handleChange2({ 'value': "Yearly" })
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
			this.props.inventoryActions
			.getTopProfitGeneratingProductsForInventory()
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						topProfitGeneratingProducts: res.data
					});

					this.handleChange3({ 'value': "Yearly" })
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
		this.props.inventoryActions
			.getAllProductCount()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ allProducts: res.data });
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
			this.props.inventoryActions
			.getTotalInventoryValue()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ inventoryValue: res.data });
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
		this.props.inventoryActions
			.getQuantityAvailable()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ quantityAvailable: res.data });
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
			this.props.inventoryActions
			.getOutOfStockCountOfInventory()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ outOfStock: res.data });
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
	};

	exportFile = (csvData, fileName, type) => {
		const fileType =
			type === 'xls'
				? 'application/vnd.ms-excel'
				: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
		const fileExtension = `.${type}`;
		const ws = XLSX.utils.json_to_sheet(csvData);
		const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
		const excelBuffer = XLSX.write(wb, { bookType: type, type: 'array' });
		const data = new Blob([excelBuffer], { type: fileType });
		FileSaver.saveAs(data, fileName + fileExtension);
	};

	toggle = () =>
		this.setState((prevState) => {
			return { dropdownOpen: !prevState.dropdownOpen };
		});

	viewFilter = () =>
		this.setState((prevState) => {
			return { view: !prevState.view };
		});

	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading, 
			initValue, 
			dropdownOpen,
			 dataHorBar, 
			 dataHorBarLeft,
			 dataLine,
			 dataHorBarLeftOption,
			 dataHorBarOption,
			 dataLineOption,
			 databarOption,
			 databar } = this.state;
		const { profile, high_stock_list, low_stock_list,universal_currency_list } = this.props;
		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<div style={{ marginLeft: "auto", marginRight: "auto" }}>
						<Row>
							<CardBody className="mr-3  mb-3 " style={{ boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)" }}>
								<h6 className="text-center font-weight-bold mb-1 text-black mt-3">
								{strings.NumberofSKUs}
										</h6>
								<h3 className="d-block mt-4 text-center" >
									{this.state.allProducts}
								</h3>

							</CardBody>
							<CardBody className="mr-3  mb-3" style={{ boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)" }}>
								<h6 className="text-center font-weight-bold mb-1 text-black mt-3">
								{strings.TotalValueofSKUs}
										</h6>
								<h3 className="d-block mt-4 text-center" >
										{this.state.inventoryValue ? (
																				<Currency
																					value={this.state.inventoryValue}
																					currencySymbol={
																						universal_currency_list[0]
																							? universal_currency_list[0]
																									.currencyIsoCode
																							: 'USD'
																					}
																				/>
																			) : (
																				0
																			)}
								</h3>

							</CardBody>
							<CardBody className="mr-3  mb-3 " style={{ boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)" }}>
								<h6 className="text-center font-weight-bold mb-1 text-black mt-3">
								{strings.TotalStockonHand}
										</h6>
								<h3 className="d-block mt-4 text-center" >
									{this.state.quantityAvailable}
								</h3>

							</CardBody>
							<CardBody className=" mb-3 " style={{ boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)" }}>
								<h6 className="text-center font-weight-bold mb-1 text-black mt-3">
								{strings.OutofStock}
										</h6>
								<h3 className="d-block mt-4 text-center" >
									{this.state.outOfStock}
								</h3>

							</CardBody>

						</Row>
					</div>

					<Row>
						<CardGroup style={{
							width: "110%",

						}}>
							<Card className="mr-2" style={{
								width: "50%",

							}}>
								<div className="d-flex justify-content-between" style={{ color: "#2064d8", backgroundColor: "#edf2f9", height: "13.8%" }}>
									<h6 className="text-uppercase font-weight-bold pt-3 text-black ml-4">
									{strings.TopsellingProduct}
								</h6>
									<div className="w-25 mb-1 card-header-actions card-select-alignment">
										<Select
										//className="form-control card-select"
											options={
												this.dropdown
													? selectOptionsFactory.renderOptions(
														'label',
														'value',
														this.dropdown,
														'Terms',
													)
													: []
											}
											defaultValue={{ label: "Yearly", value: "Yearly" }}
											onChange={(val) => {
												this.handleChange(val, 'term');
											}}

											id="term"
											name="term"
											placeholder="Select Terms ">
										</Select>
											
									</div>
								</div>
								<CardBody>
									<div>
										<HorizontalBar
											data={dataHorBar}
											options={dataHorBarOption}
										/>
									</div>
								</CardBody>
							</Card>

							<Card className="ml-2" style={{
								width: "50%",
							}}>
								<div className="d-flex justify-content-between" style={{ color: "#2064d8", backgroundColor: "#edf2f9", height: "13.8%" }}>
									<h6 className="text-uppercase font-weight-bold pt-3 text-black ml-4">
									{strings.lowsellingProduct}
									</h6>
									<div className="w-25 mb-1 card-header-actions card-select-alignment">
										<Select
											options={
												this.dropdown
													? selectOptionsFactory.renderOptions(
														'label',
														'value',
														this.dropdown,
														'Terms',
													)
													: []
											}
											defaultValue={{ label: "Yearly", value: "Yearly" }}
											onChange={(val) => {
												this.handleChange1(val, 'term');
											}}

											id="term"
											name="term"
											placeholder="Select Terms ">
										</Select>

									</div>
								</div>
								<CardBody>
									<div>
										<HorizontalBar
											data={dataHorBarLeft}
											options={dataHorBarLeftOption}
										/>
									</div>

								</CardBody>

							</Card>
						</CardGroup>
					</Row>

				<Row className={'mt-2'}> 
				<CardGroup style={{
							width: "100%",

						}}>
							{/* <Card className="mr-2" style={{
								width: "50%",

							}}>
									<div className="d-flex justify-content-between" style={{ color: "#2064d8", backgroundColor: "#edf2f9", height: "13.8%" }}>
									<h6 className="text-uppercase font-weight-bold pt-3 text-black ml-4">
									{strings.TotalRevenuegenerated}
									</h6>
									<div className="w-25 mb-1 card-header-actions card-select-alignment">
										<Select
											options={
												this.dropdown
													? selectOptionsFactory.renderOptions(
														'label',
														'value',
														this.dropdown,
														'Terms',
													)
													: []
											}
											defaultValue={{ label: "Yearly", value: "Yearly" }}
											onChange={(val) => {
												this.handleChange2(val, 'term');
											}}

											id="term"
											name="term"
											placeholder="Select Terms ">
										</Select>
									</div>
									</div>
									<CardBody>
										<div>
											<Line
											data={dataLine}
											options={dataLineOption}
											/>
											
										</div>
									</CardBody>
							</Card>
							<Card className="ml-2" style={{
								width: "50%",
							}}>
									<div className="d-flex justify-content-between" style={{ color: "#2064d8", backgroundColor: "#edf2f9", height: "13.8%" }}>
									<h6 className="text-uppercase font-weight-bold pt-3 text-black ml-4">
									{strings.Totalprofitgenerated}
								</h6>
								<div className="w-25 mb-1 card-header-actions card-select-alignment">
										<Select
											options={
												this.dropdown
													? selectOptionsFactory.renderOptions(
														'label',
														'value',
														this.dropdown,
														'Terms',
													)
													: []
											}
											defaultValue={{ label: "Yearly", value: "Yearly" }}
											onChange={(val) => {
												this.handleChange3(val, 'term');
											}}

											id="term"
											name="term"
											placeholder="Select Terms ">
										</Select>
									</div>
									</div>
									<CardBody>
										<div>
											<Bar
											data={databar}
											options={databarOption}
											/>
											
										</div>
									</CardBody>
							</Card> */}
	<Card style={{
								
							}}>
									<div className="d-flex justify-content-between" style={{ color: "#2064d8", backgroundColor: "#edf2f9"}}>
									<h6 className="text-uppercase font-weight-bold pt-3 text-black ml-4">
									{strings.Totalprofitgenerated}
								</h6>
								<div className="w-25 mb-1 card-header-actions card-select-alignment">
										<Select
											options={
												this.dropdown
													? selectOptionsFactory.renderOptions(
														'label',
														'value',
														this.dropdown,
														'Terms',
													)
													: []                                         
											}
											defaultValue={{ label: "Yearly", value: "Yearly" }}
											onChange={(val) => {
												this.handleChange3(val, 'term');
											}}

											id="term"
											name="term"
											placeholder="Select Terms ">
										</Select>
									</div>
									</div>

									<CardBody >
										<div >
											<Bar
											data={databar}
											options={databarOption}
											style={{height: "200px"}}
											
											/>
											
										</div>
									</CardBody>
							</Card>
					</CardGroup>
				</Row>
				</div>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(InventoryDashboard);
