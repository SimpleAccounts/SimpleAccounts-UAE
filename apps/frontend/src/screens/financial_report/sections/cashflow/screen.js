import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	Card,
	CardHeader,
	CardBody,
	Row,
	Col,
	Table,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';

import moment from 'moment';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { CSVLink } from 'react-csv';
import { Loader, Currency } from 'components';
import * as FinancialReportActions from '../../actions';
import FilterComponent from '../filterComponent';
import FilterComponent2 from '../filterComponet2';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
		universal_currency_list: state.common.universal_currency_list,
		company_profile: state.reports.company_profile,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		financialReportActions: bindActionCreators(
			FinancialReportActions,
			dispatch,
		),
	};
};
let strings = new LocalizedStrings(data);
let strings1 = new LocalizedStrings(data);
if(localStorage.getItem('language')==null)
{
	strings1.setLanguage('en');
}
else{
strings1.setLanguage(localStorage.getItem('language'));
}

class Cashflow extends React.Component {
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
			},
			csvData: [],
			activePage: 1,
			sizePerPage: 10,
			totalCount: 0,
			sort: {
				column: null,
				direction: 'desc',
			},
			data: {
				operatingActivities: {},
				totalCashFlowFromOperatingActivities: 0.0,
				investingActivities: {},
				totalCashFlowFromInvestingActivities: 0.0,
				FinancingActivities: {},
				totalCashFlowFromFinancingActivities: 0.0,
				startingBalance: 0.0,
				grossCashInflow: 0.0,
				grossCashOutflow: 0.0,
				netCashChange: 0.0,
				endingBalance: 0.0,
			},
		};
		this.columnHeader = [
			{ label: strings1.Account, value: 'Account', sort: true, class: '' },
			// { label: '', value: 'Account Code', sort: false },
			{ label: strings1.Total, value: 'Total', sort: true, class: 'text-right'},
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

	componentDidMount = () => {
		this.props.financialReportActions.getCompany() 
		this.initializeData();
	};

	initializeData = () => {
		const { initValue } = this.state;
		const postData = {
			startDate: initValue.startDate,
			endDate: initValue.endDate,
		};
		this.props.financialReportActions
			.getCashFlowReport(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						data: res.data,
						loading: false,
					});
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
	};

	
	exportFile = () => {

		// let exportData
	 
		// 	 let singleResultArray=this.state && this.state.data 
	 
		// 	 ?
	 
		// 	 Object.entries(this.state.data)     :[];
	    //  const { Parser, transforms: { unwind, flatten } } = require('json2csv');
		//  const json2csvParser = new Parser({ transforms: [unwind({ blankOut: true }), flatten('__')] });
		//   exportData = json2csvParser.parse(singleResultArray);
	 
	 
		//    return (exportData);
		let dl =""
		let fn =""
		let type="csv"
		var elt = document.getElementById('tbl_exporttable_to_xls');												
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });		
		return dl ?
		  XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
		  XLSX.writeFile(wb, fn || ('Cash Flow Report.'+ (type || 'csv')));
	}

	exportExcelFile  = () => 
	{   let dl =""
		let fn =""
		let type="xlsx"
		var elt = document.getElementById('tbl_exporttable_to_xls');												
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });		
		return dl ?
		  XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
		  XLSX.writeFile(wb, fn || ('Cash Flow Report.'+ (type || 'xlsx')));

	}

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
		const { loading, initValue, dropdownOpen, csvData, view } = this.state;
		const { profile, universal_currency_list,company_profile } = this.props;
		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<Card>
						<div>
							<CardHeader>
								<Row>
									<Col lg={12}>
										<div
											className="h4 mb-0 d-flex align-items-center"
											style={{ justifyContent: 'space-between' }}
										>
											<div>
												<p
													className="mb-0"
													style={{
														cursor: 'pointer',
														fontSize: '1rem',
														paddingLeft: '15px',
													}}
													onClick={this.viewFilter}
												>
													<i className="fa fa-cog mr-2"></i>{strings.CustomizeReport}
												</p>
											</div>
											<div className="d-flex">
												<Dropdown isOpen={dropdownOpen} toggle={this.toggle}>
													<DropdownToggle caret>Export As</DropdownToggle>
													<DropdownMenu>
													
														<DropdownItem onClick={()=>{this.exportFile()}}>
															{/* <CSVLink
																data={this.exportFile()}
																className="csv-btn"
																filename={'Cash Flow Report.csv'}
															>
																CSV (Comma Separated Value)
															</CSVLink> */}
															<span
															style={{
																border: 0,
    															padding: 0,
																backgroundColor:"white !important"
															}}
														     	>CSV (Comma Separated Value)</span>
														</DropdownItem>
														<DropdownItem onClick={()=>{this.exportExcelFile()}}>
																<span
															style={{
																border: 0,
    															padding: 0,
																backgroundColor:"white !important"
															}}
														    >Excel</span>
														</DropdownItem>
															<DropdownItem onClick={this.exportPDFWithComponent}>
															Pdf
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'cashflow', 'xls');
															}}
														>
															XLS (Microsoft Excel 1997-2004 Compatible)
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'cashflow', 'xlsx');
															}}
														>
															XLSX (Microsoft Excel)
														</DropdownItem>
													</DropdownMenu>
												</Dropdown>
													&nbsp;&nbsp;
												<div
													className="mr-2 print-btn-cont"
													onClick={() => window.print()}
													style={{
														cursor: 'pointer',
														}}
												>
													<i className="fa fa-print"></i>
												</div>
												{/* <div
												className="mr-2 print-btn-cont"
												onClick={() => {
													this.exportPDFWithComponent();
												}}
												style={{
													cursor: 'pointer',
													}}
												>
												<i className="fa fa-file-pdf-o"></i>
											</div> */}
												<div
													className="mr-2 print-btn-cont"
                          onClick={() => {
                            this.props.history.push('/admin/report/reports-page');
                           }}
													style={{
														cursor: 'pointer',
														}}
												>
												<span>X</span>
												</div>
											</div>
										</div>
									</Col>
								</Row>
							</CardHeader>
							<div className={`panel ${view ? 'view-panel' : ''}`}>
								<FilterComponent2
									viewFilter={this.viewFilter}
									generateReport={(value) => {
										this.generateReport(value);
									}}
								/>{' '}
							</div>
									<CardBody id="section-to-print">
									<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A3"
									fileName="Cash Flow.pdf"
								>
							<div style={{	
									
									display: 'flex',
									justifyContent: 'space-between',
									marginBottom: '1rem'}}>
									<div>
									<img
										src={ 
											company_profile &&
											company_profile.companyLogoByteArray
												? 'data:image/jpg;base64,' +
											company_profile.companyLogoByteArray
												: logo
										}
										className=""
										alt=""
										style={{ width: ' 150px' }}></img>
								
									
									</div>			
									<div style={{textAlign:'center'}} >
								
										<h2>
										{company_profile &&
											company_profile['companyName']
												? company_profile['companyName']
												: ''}
											</h2>	
											<br style={{ marginBottom: '5px' }} />
											<b style ={{ fontSize: '18px'}}>{strings.Cash_flow + " " + strings.Report}</b>
											<br style={{ marginBottom: '5px' }} />
											{strings.From} {(initValue.startDate).replaceAll("/","-")} {strings.To} {initValue.endDate.replaceAll("/","-")} 
											
									</div>
									<div>
									</div>									
							</div>
									{loading ? (
										<Loader />
									) : (
										<div className="table-wrapper" style={{ width: "1000px", margin: "0 auto" }}>
											<Table id="tbl_exporttable_to_xls" responsive className="cashflow-table-bordered">
												<thead>
													<tr>
														{this.columnHeader.map((column, index) => {
															return (
																<th
																	key={index}
																	className={column.class ? 'text-right th' : 'th' }
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													{Object.keys(this.state.data).length > 0 ? (
														<>
															<tr>
																<td className="pt-3 pb-3" colSpan={2}></td>
															</tr>
															<tr style={{backgroundColor: '#4472C4'}}>
																<td className="wh pt-1 pb-1 bld" colSpan={2}>{strings.Operating+" "+strings.Activities}</td>
															</tr>
															{Object.keys(
																this.state.data['operatingIncome'],
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item}</td>
																	<td className="pt-0 pb-0 text-right">
																		<Currency
																			value={this.state.data['operatingIncome'][
																				`${item}`
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>
																</tr>
															))}
															
															<tr >
																<td className="pt-0 pb-0">
																	{strings.NetIncome}
																</td>
																<td className="pt-0 pb-0 text-right">
																	{this.state.data['netIncome'] !=
																	null ? (
																		<Currency
																			value={this.state.data[
																				'netIncome'
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'AED'
																			}
																		/>
																	) : (
																		<Currency
																			value={"0.00"}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	)}
																</td>
															</tr>
															<tr>
																<td></td>
																<td></td>
															</tr>
															<tr style={{backgroundColor: '#B4C6E7'}}>
																<td className="pt-1 pb-1 bld">
																	{strings.Total+" "+strings.Cash_flow+" "+strings.From+" "+strings.Operating+" "+strings.Activities}
																</td>
																<td className="text-right pt-1 pb-1 bld">
																	{this.state.data['totalOperatingIncome'] !=
																	null ? (
																		<Currency
																			value={this.state.data[
																				'totalOperatingIncome'
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		<Currency
																			value={"0.00"}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	)}
																</td>
															</tr>
															<tr>
																<td className="pt-3 pb-3" colSpan={2}></td>
															</tr>
															<tr style={{backgroundColor: '#4472C4'}}>
																<td className="wh pt-1 pb-1 bld" colSpan={2}>{strings.Investing+" "+strings.Activities}</td>
															</tr>
															{Object.keys(
																this.state.data['investingActivities'],
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item}</td>
																	<td className="pt-0 pb-0 text-right">
																		<Currency
																			value={this.state.data['investingActivities'][
																				`${item}`
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>
																</tr>
															))}
															<tr>
																<td></td>
																<td></td>
															</tr>
															<tr style={{backgroundColor: '#B4C6E7'}}>
																<td className="pt-1 pb-1 bld">
																	{strings.Total+" "+strings.Cash_flow+" "+strings.From+" "+strings.Investing+" "+strings.Activities}
																</td>
																<td className="text-right pt-1 pb-1 bld">
																	{this.state.data['totalInvestingActivities'] !=
																	null ? (
																		<Currency
																			value={this.state.data[
																				'totalInvestingActivities'
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		<Currency
																			value={"0.00"}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	)}
																</td>
															</tr>
															<tr>
																<td className="pt-3 pb-3" colSpan={2}></td>
															</tr>
															<tr style={{backgroundColor: '#4472C4'}}>
																<td className="wh pt-1 pb-1 bld" colSpan={2}>{strings.Financing+" "+strings.Activities}</td>
															</tr>
															{Object.keys(
																this.state.data['financingActivities'],
															).map((item) => (
																<tr>
																	<td className="pt-0 pb-0">{item}</td>
																	<td className="pt-0 pb-0 text-right">
																		<Currency
																			value={this.state.data['financingActivities'][
																				`${item}`
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>
																</tr>
															))}
															<tr>
																<td></td>
																<td></td>
															</tr>
															<tr style={{backgroundColor: '#B4C6E7'}}>
																<td className="pt-1 pb-1 bld">
																	{strings.Total+" "+strings.Cash_flow+" "+strings.From+" "+strings.Financing+" "+strings.Activities}
																</td>
																<td className="text-right pt-1 pb-1 bld">
																	{this.state.data['totalFinancingActivities'] !=
																	null ? (
																		<Currency
																			value={this.state.data[
																				'totalFinancingActivities'
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		<Currency
																			value={"0.00"}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	)}
																</td>
															</tr>
															<tr>
																<td className="pt-3 pb-3" colSpan={2}></td>
															</tr>
															<tr style={{backgroundColor: '#4472C4'}}>
																<td className="wh pt-1 pb-1 bld" colSpan={2}>
																	{strings.OverView}
																</td>
															</tr>
															<tr style={{backgroundColor: '#9CC2E5'}}>
																<td className="pt-1 pb-1 bld">{strings.Starting+" "+strings.Balance}</td>
																<td className="text-right pt-1 pb-1 bld">
																	{this.state.data['startingBalance'] != null ? (
																		<Currency
																			value={this.state.data[
																				'startingBalance'
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		<Currency
																			value={"0.00"}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	)}
																</td>
															</tr>
															<tr>
																<td className="pt-1 pb-1 bld">{strings.GrossCashInflow}</td>
																<td className="text-right pt-1 pb-1 bld">
																	{this.state.data['grossCashInflow'] != null ? (
																		<Currency
																			value={this.state.data[
																				'grossCashInflow'
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		<Currency
																			value={"0.00"}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	)}
																</td>
															</tr>
															<tr>
																<td className="pt-1 pb-1 bld">{strings.GrossCashOutflow}</td>
																<td className="text-right pt-1 pb-1 bld">
																	{this.state.data['grossCashOutflow'] != null ? (
																		<Currency
																			value={this.state.data[
																				'grossCashOutflow'
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		<Currency
																			value={"0.00"}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	)}
																</td>
															</tr>
															<tr>
																<td className="pt-1 pb-1 bld">{strings.NetCashChange}</td>
																<td className="text-right pt-1 pb-1 bld">
																	{this.state.data['netCashChange'] != null ? (
																		<Currency
																			value={this.state.data[
																				'netCashChange'
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		<Currency
																			value={"0.00"}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	)}
																</td>
															</tr>
															<tr style={{backgroundColor: '#9CC2E5'}}>
																<td className="pt-1 pb-1 bld">{strings.Ending+" "+strings.Balance}</td>
																<td className="text-right pt-1 pb-1 bld">
																	{this.state.data['endingBalance'] != null ? (
																		<Currency
																			value={this.state.data[
																				'endingBalance'
																			]  }
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	) : (
																		<Currency
																			value={"0.00"}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0]
																							.currencyIsoCode
																					: 'USD'
																			}
																		/>
																	)}
																</td>
															</tr>
														</>
													) : (
														<tr className="mainLable ">
															<td style={{ textAlign: 'center' }} colSpan="9">
																{strings.Thereisnodatatodisplay}
															</td>
														</tr>
													)}
												</tbody>
											</Table>
										</div>
									)}
									<div style={{ textAlignLast:'center'}}> {strings.PoweredBy} <b>SimpleAccounts</b></div> 
								</PDFExport>
							</CardBody>
						</div>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Cashflow);
