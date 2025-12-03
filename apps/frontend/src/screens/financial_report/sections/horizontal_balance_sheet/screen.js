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
	Button,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';

import { DateRangePicker2 } from 'components';
import moment from 'moment';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
// import 'react-select/dist/react-select.css'
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { CSVLink } from 'react-csv';
import { Loader, Currency } from 'components';
import * as FinancialReportActions from '../../actions';
import FilterComponent from '../filterComponent';
import logo from 'assets/images/brand/logo.png';
import { CommonActions } from 'services/global';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { StringStream } from 'codemirror';
import FilterComponent3 from '../filterComponent3';

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
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
let strings1 = new LocalizedStrings(data);
if (localStorage.getItem('language') == null) {
	strings1.setLanguage('en');
}
else {
	strings1.setLanguage(localStorage.getItem('language'));
}
class HorizontalBalanceSheet extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			customPeriod: 'asOn',
			dropdownOpen: false,
			hideExportOptions:false,
			view: false,
			initValue: {
				startDate: moment().startOf('month').format('DD/MM/YYYY'),
				endDate: moment().format('DD/MM/YYYY'),
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
				totalCurrentAssets: 24136.36,
				totalFixedAssets: 0,
				totalAssets: 24136.36,
				totalOtherCurrentAssets: 386.36,
				totalBank: 3750,
				totalOtherLiabilities: 0,
				totalAccountReceivable: 20000,
				totalAccountPayable: 22250,
				totalOtherCurrentLiabilities: 7750,
				totalLiabilities: 30000,
				totalEquities: 0,
				totalLiabilityEquities: 30000,
				stocks: 0,
				cash: {
					'cash': 100
				},
				currentAssets: {},
				otherCurrentAssets: {
					'Input VAT': 386.36,
				},
				bank: {
					'Axis Bank-Afzal Khan': 3750,
				},
				fixedAssets: {},
				otherLiabilities: {},
				otherCurrentLiabilities: {
					'Employee Reimbursements': 7750,
				},
				equities: {},
				totalCash: 0,
				totalBank: 0,
			},
		};
		this.columnHeader = [
			{ label: strings1.Account, value: 'Account', sort: true, class: '' },
			// { label: '', value: '', sort: false, class: '1'},
			{ label: strings1.Total, value: 'Total', sort: false, class: 'text-right' },
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
			.getBalanceReport(postData)
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
		//      ?

		// 	 Object.entries(this.state.data)     :[];

		//  const { Parser, transforms: { unwind, flatten } } = require('json2csv');
		//  const json2csvParser = new Parser({ transforms: [unwind({ blankOut: true }), flatten('__')] });
		//   exportData = json2csvParser.parse(singleResultArray);
		//   return (exportData);
		let dl = ""
		let fn = ""
		let type = "csv"
		var elt = document.getElementById('tbl_exporttable_to_xls');
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
		return dl ?
			XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
			XLSX.writeFile(wb, fn || ('Horizontal Balance Sheet Report.' + (type || 'csv')));

	}

	exportExcelFile = () => {
		let dl = ""
		let fn = ""
		let type = "xlsx"
		var elt = document.getElementById('tbl_exporttable_to_xls');
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
		return dl ?
			XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
			XLSX.writeFile(wb, fn || ('Horizontal Balance Sheet Report.' + (type || 'xlsx')));

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
	hideExportOptionsFunctionality = (val) => {
		this.setState({ hideExportOptions: val });
	}

	render() {
		strings.setLanguage(this.state.language);
		const { loading, initValue, dropdownOpen, csvData, view, customPeriod } = this.state;
		const { profile, universal_currency_list, company_profile } = this.props;
		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<Card>
						<div>
						{!this.state.hideExportOptions &&
								
									<Col lg={12}>
										<div
											className="h4 mb-0 d-flex align-items-center pull-right"
											style={{ justifyContent: 'space-between',marginRight: '10px', marginTop:'15px' }}
										>
											{/* <div>
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
											</div> */}
											<div className="d-flex">

												<Dropdown isOpen={dropdownOpen} toggle={this.toggle} style={{marginTop:'15px'}}>
													<DropdownToggle caret>Export As</DropdownToggle>
													<DropdownMenu>

														<DropdownItem onClick={() => { this.exportFile() }}>
															<span
																style={{
																	border: 0,
																	padding: 0,
																	backgroundColor: "white !important"
																}}
															>CSV (Comma Separated Value)</span>
														</DropdownItem>
														<DropdownItem onClick={() => { this.exportExcelFile() }}>
															<span
																style={{
																	border: 0,
																	padding: 0,
																	backgroundColor: "white !important"
																}}
															>Excel</span>
														</DropdownItem>
														<DropdownItem onClick={this.exportPDFWithComponent}>
															Pdf
														</DropdownItem>

														{/* <DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'balancesheet', 'xls');
															}}
														>
															XLS (Microsoft Excel 1997-2004 Compatible)
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(
																	csvData,
																	'balancesheet',
																	'xlsx',
																);
															}}
														>
															XLSX (Microsoft Excel)
														</DropdownItem> */}
													</DropdownMenu>
												</Dropdown>

												&nbsp;&nbsp;
												<div
													className="mr-2 print-btn-cont"
													onClick={() => window.print()}
													style={{
														cursor: 'pointer', marginTop : '15px'
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
														cursor: 'pointer', marginTop: '15px'
													}}
												>
													<span>X</span>
												</div>

											</div>
										</div>
									</Col>
								
							}
							<CardHeader>
							<FilterComponent3
									hideExportOptionsFunctionality={(val) => this.hideExportOptionsFunctionality(val)}
									customPeriod={customPeriod}
									viewFilter={this.viewFilter}
									generateReport={(value) => {
										this.generateReport(value);
									}}
									setCutomPeriod={(value) => {
										this.setState({ customPeriod: value })
									}}
									handleCancel={() => {
										if (customPeriod === 'asOn') {
										const currentDate = moment();
										this.setState(prevState => ({
										initValue: {
										...prevState.initValue,
										endDate: currentDate,            }
										 }));
										this.generateReport({ endDate: currentDate });
										}
										this.setState({ customPeriod: 'asOn' });
										}}
								/>
							</CardHeader>	
							{/* <div className={`panel ${view ? 'view-panel' : ''}`}>
								<FilterComponent
									viewFilter={this.viewFilter}
									generateReport={(value) => {
										this.generateReport(value);
									}}
								/>{' '}
							</div> */}
							<CardBody id="section-to-print">
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A3"
									fileName="Horizontal Balance Sheet.pdf"
									margin={{top:0 , bottom:0 , left: 30 , right: 31 }}
									
								>
									<div style={{

										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: '1rem',
										marginTop: '5rem'
									}}>
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
										<div style={{ textAlign: 'center' }} >

											<h2>
												{company_profile &&
													company_profile['companyName']
													? company_profile['companyName']
													: ''}
											</h2>
											<br style={{ marginBottom: '5px' }} />
											<b style={{ fontSize: '18px' }}>{strings.HorizontalBalanceSheet}</b>
											<br style={{ marginBottom: '5px' }} />
											{customPeriod === 'asOn' ? `${strings.Ason} ${initValue.endDate.replaceAll("/", "-")}`
											 : `${strings.From} ${initValue.startDate.replaceAll("/", "-")} to ${initValue.endDate.replaceAll("/", "-")}`}
											{/* {strings.From} {initValue.startDate.replaceAll("/", "-")} to {initValue.endDate.replaceAll("/", "-")} */}

										</div>
										<div>


										</div>
									</div>
									{loading ? (
										<Loader />
									) : (
										<div id="tbl_exporttable_to_xls" className="table-wrapper mt-4">
											<Row>
												<Col>
													<Table responsive className="hbs-table-bordered">
														<thead>
															<tr>
																{this.columnHeader.map((column, index) => {
																	return (
																		<th
																			key={index}
																			className={column.class ? 'text-right th' : 'th'}
																			colSpan={2}
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
																		<td className="pt-3 pb-3" colSpan={4}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#9CC2E5' }}>
																		<td className="pt-1 pb-1 bld" colSpan={4}>{strings.Assets}</td>
																	</tr>
																	<tr>
																		<td className='wid'
																			rowSpan={27
																				+ Object.keys(this.state.data['bank']).length
																				+ Object.keys(this.state.data['currentAssets']).length
																				+ Object.keys(this.state.data['otherCurrentAssets']).length
																				+ Object.keys(this.state.data['fixedAssets']).length}
																		// rowSpan={27}
																		></td>
																	</tr>
																	<tr>
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" colSpan={3}>{strings.Cash}</td>
																	</tr>
																	{Object.keys(this.state.data['currentAssets']).map(
																		(item) => (
																			item === 'Petty Cash' ? (
																				<tr>
																					<td className="pt-0 pb-0">{item}</td>

																					<td className="pt-0 pb-0 text-right"  colSpan={2}>
																						{this.state.data['currentAssets'] ? (
																							<Currency
																								value={this.state.data['currentAssets'][
																									`${item}`
																								]}
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
																			) : null
																		)
																	)}
																	<tr>
																		<td></td>
																		<td  colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld" >
																			{strings.Total + " " + strings.Cash}
																		</td>
																		<td className="text-right pt-1 pb-1 bld"  colSpan={2}>
																			{Object.keys(this.state.data['currentAssets']).map(
																				(item) => (
																					item === 'Petty Cash' ? (
																						this.state.data['currentAssets'] ? (
																							<Currency
																								value={this.state.data['currentAssets'][
																									`${item}`
																								]}
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
																						)
																					) : null
																				)
																			)}
																		</td>
																	</tr>
																	<tr>
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" >{strings.Bank}</td>
																		<td colSpan={2}></td>
																	</tr>
																	{Object.keys(this.state.data['bank']).map(
																		(item) => (
																			<tr>
																				<td className="pt-0 pb-0">{item}</td>
																				<td className="pt-0 pb-0 text-right" colSpan={2}>
																					{this.state.data['bank'] ? (
																						<Currency
																							value={this.state.data['bank'][
																								`${item}`
																							]}
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
																		),
																	)}
																	<tr>
																		<td></td>
																		<td colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld">
																			{strings.Total + " " + strings.Bank}
																		</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalBank'] !=
																				null ? (
																				<Currency
																					value={this.state.data[
																						'totalBank'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" colSpan={3}>
																			{strings.Accounts + " " + strings.Receivable}
																		</td>
																	</tr>
																	<tr>
																		<td className="pt-0 pb-0">
																			{strings.Account + " " + strings.Receivable}
																		</td>
																		<td className="pt-0 pb-0 text-right" colSpan={2}>
																			{this.state.data['totalAccountReceivable'] ? (
																				<Currency
																					value={this.state.data[
																						'totalAccountReceivable'
																					]}
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
																		<td></td>
																		<td colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld">
																			{strings.Total + " " + strings.Accounts + " " + strings.Receivable}
																		</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalAccountReceivable'] !=
																				null ? (
																				<Currency
																					value={this.state.data[
																						'totalAccountReceivable'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" colSpan={3}>{strings.CurrentAssets}</td>
																	</tr>
																	{Object.keys(this.state.data['currentAssets']).map(
																		(item) => (
																			item !== 'Petty Cash' ? (
																				<tr>
																					<td className="pt-0 pb-0">{item}</td>

																					<td className="pt-0 pb-0 text-right" colSpan={2}>
																						{this.state.data['currentAssets'] ? (
																							<Currency
																								value={this.state.data['currentAssets'][
																									`${item}`
																								]}
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
																			) : null
																		),
																	)}
																	<tr>
																		<td></td>
																		<td colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld">
																			{strings.Total + " " + strings.CurrentAssets}
																		</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalCurrentAssets'] ? (
																				<Currency
																					value={this.state.data[
																						'totalCurrentAssets'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" colSpan={3}>{strings.Other + " " + strings.CurrentAssets}</td>
																	</tr>
																	{Object.keys(this.state.data['otherCurrentAssets']).map(
																		(item) => (
																			<tr>
																				<td className="pt-0 pb-0">{item}</td>

																				<td className="pt-0 pb-0 text-right" colSpan={2} >
																					{this.state.data['otherCurrentAssets'] ? (
																						<Currency
																							value={this.state.data['otherCurrentAssets'][
																								`${item}`
																							]}
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
																		),
																	)}
																	<tr>
																		<td></td>
																		<td colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld">
																			{strings.Total + " " + strings.Other + " " + strings.CurrentAssets}
																		</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalOtherCurrentAssets'] ? (
																				<Currency
																					value={this.state.data[
																						'totalOtherCurrentAssets'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" colSpan={3}>{strings.FixedAssets}</td>
																	</tr>
																	{Object.keys(this.state.data['fixedAssets']).map(
																		(item) => (
																			<tr>
																				<td className="pt-0 pb-0">{item}</td>

																				<td className="pt-0 pb-0 text-right" colSpan={2}>
																					{this.state.data['fixedAssets'] ? (
																						<Currency
																							value={this.state.data['fixedAssets'][
																								`${item}`
																							]}
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
																		),
																	)}
																	<tr>
																		<td></td>
																		<td colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld">
																			{strings.Total + " " + strings.FixedAssets}
																		</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalfixedAssets'] ? (
																				<Currency
																					value={this.state.data[
																						'totalfixedAssets'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#9CC2E5' }}>
																		<td className="pt-1 pb-1 bld" colSpan={2}>{strings.Total + " " + strings.Assets}</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalAssets'] ? (
																				<Currency
																					value={this.state.data[
																						'totalAssets'
																					]}
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
												</Col>
												<Col>
													<Table responsive className="hbs-table-bordered">
														<thead>
															<tr>
																{this.columnHeader.map((column, index) => {
																	return (
																		<th
																			key={index}
																			className={column.class ? 'text-right th' : 'th'}
																			colSpan={2}
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
																		<td className="pt-3 pb-3" colSpan={4}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#9CC2E5' }}>
																		<td className="pt-1 pb-1 bld" colSpan={4}>{strings.Liabilities}</td>
																	</tr>
																	<tr>
																		<td className='wid'
																			//rowSpan={15}
																			rowSpan={15
																				+ Object.keys(this.state.data['otherLiability']).length
																				+ Object.keys(this.state.data['otherCurrentLiability']).length}
																		></td>
																	</tr>
																	<tr>
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" colSpan={3}>
																			{strings.Accounts + " " + strings.Payable}
																		</td>
																	</tr>
																	<tr>
																		<td className="pt-0 pb-0">
																			{strings.Account + " " + strings.Payable}
																		</td>
																		<td className="pt-0 pb-0 text-right" colSpan={2}>
																			{this.state.data['totalAccountPayable'] ? (
																				<Currency
																					value={this.state.data[
																						'totalAccountPayable'
																					]}
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
																		<td></td>
																		<td colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld">
																			{strings.Total + " " + strings.Accounts + " " + strings.Payable}
																		</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalAccountPayable'] !=
																				null ? (
																				<Currency
																					value={this.state.data[
																						'totalAccountPayable'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" colSpan={3}>{strings.Other + " " + strings.Liabilities}</td>
																	</tr>
																	{Object.keys(this.state.data['otherLiability']).map(
																		(item) => (
																			<tr>
																				<td className="pt-0 pb-0">{item}</td>

																				<td className="pt-0 pb-0 text-right">
																					{this.state.data['otherLiability'] ? (
																						<Currency
																							value={this.state.data['otherLiability'][
																								`${item}`
																							]}
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
																		),
																	)}
																	<tr>
																		<td></td>
																		<td colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld">
																			{strings.Total + " " + strings.Other + " " + strings.Liabilities}
																		</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalOtherLiability'] ? (
																				<Currency
																					value={this.state.data[
																						'totalOtherLiability'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" colSpan={3}>{strings.Other + " " + strings.CurrentLiabilities}</td>
																	</tr>
																	{Object.keys(this.state.data['otherCurrentLiability']).map(
																		(item) => (
																			<tr>
																				<td className="pt-0 pb-0">{item}</td>

																				<td className="pt-0 pb-0 text-right" colSpan={2}>
																					{this.state.data['otherCurrentLiability'] ? (
																						<Currency
																							value={this.state.data['otherCurrentLiability'][
																								`${item}`
																							]}
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
																		),
																	)}
																	<tr>
																		<td></td>
																		<td colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld">
																			{strings.Total + " " + strings.Other + " " + strings.CurrentLiabilities}</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalOtherCurrentLiability'] ? (
																				<Currency
																					value={this.state.data[
																						'totalOtherCurrentLiability'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#9CC2E5' }}>
																		<td className="pt-1 pb-1 bld" colSpan={2}>{strings.Total + " " + strings.Liabilities}</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalLiability'] ? (
																				<Currency
																					value={this.state.data[
																						'totalLiability'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={4}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#9CC2E5' }}>
																		<td className="pt-1 pb-1 bld" colSpan={4}>{strings.Equities}</td>
																	</tr>
																	<tr>
																		<td className='wid'
																			// rowSpan={7}
																			rowSpan={6
																				+ Object.keys(this.state.data['equities']).length}
																		></td>
																	</tr>
																	<tr>
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#4472C4' }}>
																		<td className="pt-1 pb-1 bld wh" colSpan={3}>{strings.Equities}</td>
																	</tr>
																	{Object.keys(
																		this.state.data['equities'],
																	).map((item) => (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right" colSpan={2}>
																				{this.state.data['equities'] ? (
																					<Currency
																						value={this.state.data['equities'][
																							`${item}`
																						]}
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
																	))}
																	<tr>
																		<td></td>
																		<td colSpan={2}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#B4C6E7' }}>
																		<td className="pt-1 pb-1 bld">
																			{strings.Total + " " + strings.Equities}
																		</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalEquities'] !=
																				null ? (
																				<Currency
																					value={this.state.data[
																						'totalEquities'
																					]}
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
																		<td className="pt-3 pb-3" colSpan={3}></td>
																	</tr>
																	<tr style={{ backgroundColor: '#9CC2E5' }}>
																		<td className="pt-1 pb-1 bld" colSpan={2}>{strings.Total + " " + strings.Liabilities + " & " + strings.Equities}</td>
																		<td className="text-right pt-1 pb-1 bld" colSpan={2}>
																			{this.state.data['totalLiabilityEquities'] ? (
																				<Currency
																					value={this.state.data[
																						'totalLiabilityEquities'
																					]}
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
												</Col>
											</Row>
										</div>
									)}
									<div style={{ textAlignLast: 'center' }}>{strings.PoweredBy} <b>SimpleAccounts</b></div>
								</PDFExport>
							</CardBody>
						</div>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(HorizontalBalanceSheet);
