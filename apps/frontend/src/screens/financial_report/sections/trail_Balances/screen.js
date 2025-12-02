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
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as XLSX from 'xlsx';
import { Loader, Currency } from 'components';
import * as FinancialReportActions from '../../actions';
import FilterComponent from '../filterComponent';
import logo from 'assets/images/brand/logo.png';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
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
class TrailBalances extends React.Component {
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
				transactionCategoryMapper: {
					'Capital Asset Depreciation Brought Forward': 'Credit',
					Sales: 'Credit',
					'Capital Asset Brought Forward': 'Debit',
					'Accommodation and Meals': 'Debit',
					'Accountancy Fees': 'Debit',
					'Retained Earnings': 'Credit',
					'Input VAT': 'Debit',
					'SBI-Adil khan': 'Debit',
					'SBI-Imran khan': 'Debit',
					'Accounts Payable': 'Credit',
				},
				assets: {
					'Input VAT': 0.0,
				},
				fixedAsset: {
					'Capital Asset Depreciation Brought Forward': 1200.0,
					'Capital Asset Brought Forward': 1100.0,
				},
				liabilities: {},
				equities: {},
				income: {
					Sales: 1200.0,
				},
				expense: {
					'Accommodation and Meals': 5200.0,
					'Accountancy Fees': 3400.0,
				},
				accountReceivable: {},
				accountpayable: {
					'Accounts Payable': 2300.0,
				},
				bank: {
					'SBI-Adil khan': 2400.0,
					'SBI-Imran khan': 400.0,
				},
				totalCreditAmount: 5300.0,
				totalDebitAmount: 12500.0,
			},
		};
		this.columnHeader = [
			{ label: strings1.Account, value: 'Account', sort: true, class: '' },
			{ label: strings1.Debit, value: 'Net Debit', sort: false, class: 'text' },
			{ label: strings1.Credit, value: 'Net Credit', sort: false, class: 'text' },
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
		this.props.financialReportActions.getCompany();
		this.initializeData();
	};

	initializeData = () => {
		const { initValue } = this.state;
		const postData = {
			startDate: initValue.startDate,
			endDate: initValue.endDate,
		};
		this.props.financialReportActions
			.getTrialBalanceReport(postData)
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

	totalAssets = () => {
		let debitValueAR = 0;
		let creditValueAR = 0;
		let debitValueA = 0;
		let creditValueA = 0;
		let debitValueFA = 0;
		let creditValueFA = 0;
		let debitValueB = 0;
		let creditValueB = 0;

		Object.keys(this.state.data['accountReceivable']).map((item) => {
			const transactionCategory = this.state.data['transactionCategoryMapper'][`${item}`];
			const assetValue = this.state.data['accountReceivable'][`${item}`];

			if (transactionCategory === 'Debit') {
				debitValueAR += assetValue;
			} else if (transactionCategory === 'Credit') {
				creditValueAR += assetValue;
			}
		})

		Object.keys(this.state.data['assets']).map((item) => {
			const transactionCategory = this.state.data['transactionCategoryMapper'][`${item}`];
			const assetValue = this.state.data['assets'][`${item}`];

			if (transactionCategory === 'Debit') {
				debitValueA += assetValue;
			} else if (transactionCategory === 'Credit') {
				creditValueA += assetValue;
			}
		})

		Object.keys(this.state.data['fixedAsset']).map((item) => {
			const transactionCategory = this.state.data['transactionCategoryMapper'][`${item}`];
			const assetValue = this.state.data['fixedAsset'][`${item}`];

			if (transactionCategory === 'Debit') {
				debitValueA += assetValue;
			} else if (transactionCategory === 'Credit') {
				creditValueA += assetValue;
			}
		})

		Object.keys(this.state.data['bank']).map((item) => {
			const transactionCategory = this.state.data['transactionCategoryMapper'][`${item}`];
			const assetValue = this.state.data['bank'][`${item}`];

			if (transactionCategory === 'Debit') {
				debitValueB += assetValue;
			} else if (transactionCategory === 'Credit') {
				creditValueB += assetValue;
			}
		})
		
		const totalCredit = parseFloat(creditValueAR + creditValueA + creditValueFA + creditValueB)
		const totalDebit = parseFloat(debitValueAR + debitValueA + debitValueFA + debitValueB)
		console.log(typeof totalDebit);
		return (
			<tr style={{ backgroundColor: '#B4C6E7' }}>
				<td className="pt-1 pb-1 bld">
					{strings.Total + " " + strings.Assets}
				</td>
				<td className="text-right pt-1 pb-1 bld">
					<Currency
						value={ totalDebit ? (
							totalDebit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
				<td className="pt-1 pb-1 text-right bld">
					<Currency
						value={totalCredit ? (
							totalCredit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
			</tr>
		)
	}

	totalLiabilities = () => {
		
		let debitValueAP = 0;
		let creditValueAP = 0;
		let debitValueL = 0;
		let creditValueL = 0;

		Object.keys(this.state.data['accountpayable']).map((item) => {
			const transactionCategory = this.state.data['transactionCategoryMapper'][`${item}`];
			const assetValue = this.state.data['accountpayable'][`${item}`];

			if (transactionCategory === 'Debit') {
				debitValueAP += assetValue;
			} else if (transactionCategory === 'Credit') {
				creditValueAP += assetValue;
			}
		})
		
		Object.keys(this.state.data['liabilities']).map((item) => {
			const transactionCategory = this.state.data['transactionCategoryMapper'][`${item}`];
			const assetValue = this.state.data['liabilities'][`${item}`];

			if (transactionCategory === 'Debit') {
				debitValueL += assetValue;
			} else if (transactionCategory === 'Credit') {
				creditValueL += assetValue;
			}
		})

		const totalCredit = parseFloat(creditValueAP + creditValueL)
		const totalDebit = parseFloat(debitValueAP + debitValueL)
		
		return (
			<tr style={{ backgroundColor: '#B4C6E7' }}>
				<td className="pt-1 pb-1 bld">
					{strings.Total + " " + strings.Liabilities}
				</td>
				<td className="text-right pt-1 pb-1 bld">
					<Currency
						value={ totalDebit ? (
							totalDebit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
				<td className="pt-1 pb-1 text-right bld">
					<Currency
						value={totalCredit ? (
							totalCredit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
			</tr>
		)
	}

	totalEquities = () => {

		let totalDebit = 0
		let totalCredit = 0

		Object.keys(this.state.data['equities']).map((item) => {
			const transactionCategory = this.state.data['transactionCategoryMapper'][`${item}`];
			const assetValue = this.state.data['equities'][`${item}`];

			if (transactionCategory === 'Debit') {
				totalDebit += assetValue;
			} else if (transactionCategory === 'Credit') {
				totalCredit += assetValue;
			}
		})

		return (
			<tr style={{ backgroundColor: '#B4C6E7' }}>
				<td className="pt-1 pb-1 bld">
					{strings.Total + " " + strings.Equities}
				</td>
				<td className="text-right pt-1 pb-1 bld">
					<Currency
						value={ totalDebit ? (
							totalDebit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
				<td className="pt-1 pb-1 text-right bld">
					<Currency
						value={totalCredit ? (
							totalCredit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
			</tr>
		)
	}
	
	totalIncome = () => {

		let totalDebit = 0
		let totalCredit = 0

		Object.keys(this.state.data['income']).map((item) => {
			const transactionCategory = this.state.data['transactionCategoryMapper'][`${item}`];
			const assetValue = this.state.data['income'][`${item}`];

			if (transactionCategory === 'Debit') {
				totalDebit += assetValue;
			} else if (transactionCategory === 'Credit') {
				totalCredit += assetValue;
			}
		})

		return (
			<tr style={{ backgroundColor: '#B4C6E7' }}>
				<td className="pt-1 pb-1 bld">
					{strings.Total + " " + strings.Income}
				</td>
				<td className="text-right pt-1 pb-1 bld">
					<Currency
						value={ totalDebit ? (
							totalDebit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
				<td className="pt-1 pb-1 text-right bld">
					<Currency
						value={totalCredit ? (
							totalCredit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
			</tr>
		)
	}
	
	totalExpense = () => {

		let totalDebit = 0
		let totalCredit = 0

		Object.keys(this.state.data['expense']).map((item) => {
			const transactionCategory = this.state.data['transactionCategoryMapper'][`${item}`];
			const assetValue = this.state.data['expense'][`${item}`];

			if (transactionCategory === 'Debit') {
				totalDebit += assetValue;
			} else if (transactionCategory === 'Credit') {
				totalCredit += assetValue;
			}
		})

		return (
			<tr style={{ backgroundColor: '#B4C6E7' }}>
				<td className="pt-1 pb-1 bld">
					{strings.Total + " " + strings.Expense}
				</td>
				<td className="text-right pt-1 pb-1 bld">
					<Currency
						value={ totalDebit ? (
							totalDebit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
				<td className="pt-1 pb-1 text-right bld">
					<Currency
						value={totalCredit ? (
							totalCredit
						) : (
							0.00
						)}
						currencyCode={
							this.props.universal_currency_list[0]
								? this.props.universal_currency_list[0]
									.currencyIsoCode
								: 'AED'
						}
					/>
				</td>
			</tr>
		)
	}

	exportFile = () => {

		// let exportData

		// 	 let singleResultArray=this.state && this.state.data 
		// 		 ?	 
		// 	 Object.entries(this.state.data)     :[];	 
		//  const { Parser, transforms: { unwind, flatten } } = require('json2csv');
		//  const json2csvParser = new Parser({ transforms: [unwind({ blankOut: true }), flatten('__')] });
		//   exportData = json2csvParser.parse(singleResultArray);


		//    return (exportData);
		let dl = ""
		let fn = ""
		let type = "csv"
		var elt = document.getElementById('tbl_exporttable_to_xls');
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
		return dl ?
			XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
			XLSX.writeFile(wb, fn || ('Trial Balance Report.' + (type || 'csv')));

	}

	exportExcelFile = () => {
		let dl = ""
		let fn = ""
		let type = "xlsx"
		var elt = document.getElementById('tbl_exporttable_to_xls');
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
		return dl ?
			XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
			XLSX.writeFile(wb, fn || ('Trial Balance Report.' + (type || 'xlsx')));

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
		const { loading, initValue, dropdownOpen, csvData, view, customPeriod} = this.state;
		const { universal_currency_list, profile, company_profile } = this.props;
		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<Card>
						<div>
						{!this.state.hideExportOptions && 
							
								
									<Col lg={12}>
										<div
											className="h4 mb-0 d-flex align-items-center pull-right"
											style={{ justifyContent: 'space-between',marginRight:'10px', marginTop:'20px'}}
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

												<Dropdown isOpen={dropdownOpen} toggle={this.toggle} style={{marginTop:'5px'}}>
													<DropdownToggle caret>Export As</DropdownToggle>
													<DropdownMenu>

														<DropdownItem onClick={() => { this.exportFile() }}>
															{/* <CSVLink
																data={this.exportFile()}
																className="csv-btn"
																filename={'Trial Balance Report.csv'}
															>
																CSV (Comma Separated Value)
															</CSVLink> */}
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
																this.exportFile(csvData, 'trialBalance', 'xls');
															}}
														>
															XLS (Microsoft Excel 1997-2004 Compatible)
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(
																	csvData,
																	'trialBalance',
																	'xlsx',
																);
															}}
														>
															XLSX (Microsoft Excel)
														</DropdownItem> */}
													</DropdownMenu>
												</Dropdown>&nbsp;&nbsp;
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
									fileName="Trail Balances.pdf"
								>
									<div style={{

										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: '1rem'
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
											<b style={{ fontSize: '18px' }}>{strings.TrailBalances + " " + strings.Report}</b>
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
										<div className="table-wrapper" style={{ width: "1000px", margin: "0 auto" }}>
											<Table id="tbl_exporttable_to_xls" responsive className="tb-table-bordered table">
												<thead>
													<tr className="header-row">
														{this.columnHeader.map((column, index) => {
															return (
																<th
																	key={index}
																	style={(!column.class ? { width: '50%' } : { width: '25%' })}
																	className={column.class ? 'text-right th' : 'th'}
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
																<td className='pt-3 pb-3' colSpan={3}> </td >
															</tr>
															<tr style={{ backgroundColor: '#4472C4' }}>
																<td className="wh pt-1 pb-1 bld" colSpan={3}>{strings.Assets}</td>	
															</tr>
															{Object.keys(this.state.data['accountReceivable']).map(
																(item) => {
																	if (this.state.data['accountReceivable'][`${item}`] === 0 || this.state.data['accountReceivable'][`${item}`] === undefined) {
																		return null;
																	}
																	return (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data['transactionCategoryMapper'
																				][`${item}`] === 'Debit' ? (
																					this.state.data['accountReceivable'][`${item}`]
																					.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data['transactionCategoryMapper'
																				][`${item}`] === 'Credit' ? (
																					this.state.data['accountReceivable'][`${item}`]
																					.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																		</tr>
																	)
																},
															)}
															{Object.keys(this.state.data['bank']).map(
																(item) => {
																	if (this.state.data['bank'][`${item}`] === 0 || this.state.data['bank'][`${item}`] === undefined) {
																		return null;
																	}
																	return (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Debit' ? (
																					this.state.data['bank'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Credit' ? (
																					this.state.data['bank'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																		</tr>
																	)
																},
															)}
															{Object.keys(this.state.data['fixedAsset']).map(
																(item) => {
																	if (this.state.data['fixedAsset'][`${item}`] === 0 || this.state.data['fixedAsset'][`${item}`] === undefined) {
																		return null;
																	}
																	return (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Debit' ? (
																					this.state.data['fixedAsset'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Credit' ? (
																					this.state.data['fixedAsset'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																		</tr>
																	)
																},
															)}
															{Object.keys(this.state.data['assets']).map(
																(item) => {
																	if (this.state.data['assets'][`${item}`] === 0 || this.state.data['assets'][`${item}`] === undefined) {
																		return null;
																	}
																	return (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Debit' ? (
																					this.state.data['assets'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Credit' ? (
																					this.state.data['assets'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																		</tr>
																	)
																},
															)}
															<tr>
																<td></td>
																<td></td>
																<td></td>
															</tr>
															{this.totalAssets()}

															<tr>
																<td className='pt-3 pb-3' colSpan={3}> </td >
															</tr>
															<tr style={{ backgroundColor: '#4472C4' }}>
																<td className="wh pt-1 pb-1 bld" colSpan={3}>{strings.Liabilities}</td>
															</tr>
															{Object.keys(this.state.data['accountpayable']).map(
																(item) => {
																	if (this.state.data['accountpayable'][`${item}`] === 0 || this.state.data['accountpayable'][`${item}`] === undefined) {
																		return null;
																	}
																	return (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data['transactionCategoryMapper'
																				][`${item}`] === 'Debit' ? (
																					this.state.data['accountpayable'][`${item}`]
																					.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data['transactionCategoryMapper'
																				][`${item}`] === 'Credit' ? (
																					this.state.data['accountpayable'][`${item}`]
																					.toLocaleString(navigator.language, { minimumFractionDigits: 2 , maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																		</tr>
																	)
																},
															)}
															{Object.keys(this.state.data['liabilities']).map(
																(item) => {
																	if (this.state.data['liabilities'][`${item}`] === 0 || this.state.data['liabilities'][`${item}`] === undefined) {
																		return null;
																	}
																	return (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Debit' ? (
																					this.state.data['liabilities'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Credit' ? (
																					this.state.data['liabilities'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																		</tr>
																	)
																},
															)}
															<tr><td></td>
																<td></td>
																<td></td>
															</tr>
															{this.totalLiabilities()}

															<tr>
																<td className='pt-3 pb-3' colSpan={3}> </td >
															</tr>
															<tr style={{ backgroundColor: '#4472C4' }}>
																<td className="wh pt-1 pb-1 bld" colSpan={3}>{strings.Equities}</td>
															</tr>
															{Object.keys(this.state.data['equities']).map(
																(item) => {
																	if (this.state.data['equities'][`${item}`] === 0 || this.state.data['equities'][`${item}`] === undefined) {
																		return null;
																	}
																	return (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Debit' ? (
																					this.state.data['equities'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Credit' ? (
																					this.state.data['equities'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																		</tr>
																	)
																},
															)}
															<tr>
																<td></td>
																<td></td>
																<td></td>
															</tr>
															{this.totalEquities()}

															<tr>
																<td className='pt-3 pb-3' colSpan={3}> </td >
															</tr>
															<tr style={{ backgroundColor: '#4472C4' }}>
																<td className="wh pt-1 pb-1 bld" colSpan={3}>{strings.Income}</td>
															</tr>
															{Object.keys(this.state.data['income']).map(
																(item) => {
																	if (this.state.data['income'][`${item}`] === 0 || this.state.data['income'][`${item}`] === undefined) {
																		return null;
																	}
																	return (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Debit' ? (
																					this.state.data['income'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Credit' ? (
																					this.state.data['income'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																		</tr>
																	)
																},
															)}
															<tr>
																<td></td>
																<td></td>
																<td></td>
															</tr>
															{this.totalIncome()}

															<tr>
																<td className='pt-3 pb-3' colSpan={3}> </td >
															</tr>
															<tr style={{ backgroundColor: '#4472C4' }}>
																<td className="wh pt-1 pb-1 bld" colSpan={3}>{strings.Expense}</td>
															</tr>
															{Object.keys(this.state.data['expense']).map(
																(item) => {
																	if (this.state.data['expense'][`${item}`] === 0 || this.state.data['expense'][`${item}`] === undefined) {
																		return null;
																	}
																	return (
																		<tr>
																			<td className="pt-0 pb-0">{item}</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Debit' ? (
																					this.state.data['expense'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																			<td className="pt-0 pb-0 text-right">
																				{this.state.data[
																					'transactionCategoryMapper'
																				][`${item}`] === 'Credit' ? (
																					this.state.data['expense'][`${item}`]
																						.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
																				) : (
																					''
																				)}
																			</td>
																		</tr>
																	)
																},
															)}
															<tr> <td></td>
																<td></td>
																<td> </td>
															</tr>
															{this.totalExpense()}

															<tr>
																<td className='pt-3 pb-3' colSpan={3}> </td >
															</tr>
															<tr style={{ backgroundColor: '#9CC2E5' }}>
																<td className="pt-1 pb-1 bld">{strings.Total}</td>
																<td className="text-right pt-1 pb-1 bld">
																	<Currency
																		value={this.state.data['totalDebitAmount']}
																		currencyCode={
																			universal_currency_list[0]
																				? universal_currency_list[0]
																					.currencyIsoCode
																				: 'AED'
																		}
																	/>
																</td>
																<td className="text-right pt-1 pb-1 bld">
																	<Currency
																		value={this.state.data['totalCreditAmount']}
																		currencyCode={
																			universal_currency_list[0]
																				? universal_currency_list[0]
																					.currencyIsoCode
																				: 'AED'
																		}
																	/>
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
									<div style={{ textAlignLast: 'center' }}> {strings.PoweredBy} <b>SimpleAccounts</b></div>
								</PDFExport>
							</CardBody>
						</div>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TrailBalances);
