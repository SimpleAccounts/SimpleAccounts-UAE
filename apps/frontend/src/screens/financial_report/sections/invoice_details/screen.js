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
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

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
import { Link } from "react-router-dom";

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
		universal_currency_list: state.common.universal_currency_list,
		company_profile: state.reports.company_profile,
		creditnote_details: state.reports.creditnote_details,
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

class InvoiceDetails extends React.Component {
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
			
			},
			csvData: [],
			activePage: 1,
			sizePerPage: 10,
			totalCount: 0,
			sort: {
				column: null,
				direction: 'desc',
			},
		
		};
	
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
			.getInvoiceDetails(postData)
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

	
		let dl =""
		let fn =""
		let type="csv"
		var elt = document.getElementById('tbl_exporttable_to_xls');												
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });		
		return dl ?
		  XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
		  XLSX.writeFile(wb, fn || ('Invoice Details Report.'+ (type || 'csv')));

	   }

	   exportExcelFile  = () => 
	   {   let dl =""
		   let fn =""
		   let type="xlsx"
		   var elt = document.getElementById('tbl_exporttable_to_xls');												
		   var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });		
		   return dl ?
			 XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
			 XLSX.writeFile(wb, fn || ('Invoice Details Report.'+ (type || 'xlsx')));
   
	   }


	// exportFile = (csvData, fileName, type) => {
	// 	const fileType =
	// 		type === 'xls'
	// 			? 'application/vnd.ms-excel'
	// 			: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
	// 	const fileExtension = `.${type}`;
	// 	const ws = XLSX.utils.json_to_sheet(csvData);
	// 	const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
	// 	const excelBuffer = XLSX.write(wb, { bookType: type, type: 'array' });
	// 	const data = new Blob([excelBuffer], { type: fileType });
	// 	FileSaver.saveAs(data, fileName + fileExtension);
	// };

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
	renderinvoiceDate = (cell, rows) => {
		return moment(rows.creditNoteDate).format('DD-MM-YYYY');
	};
	renderinvoiceDueDate = (cell, rows) => {
		return moment(rows.invoiceDueDate).format('DD-MM-YYYY');
	};
	renderbalance = (cell, row, extraData) => {
		return row.balance === 0 ? (
			<Currency
				value={row.balance}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		) : (
			<Currency
				value={row.balance}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		);
		
	};
	creditNoteTotalAmount = (cell, row, extraData) => {
		return row.creditNoteTotalAmount === 0 ? (
			<Currency
				value={row.creditNoteTotalAmount}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		) : (
			<Currency
				value={row.creditNoteTotalAmount}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		);
		
	};
	render() {
		strings.setLanguage(this.state.language);
		const { loading, initValue, dropdownOpen, csvData, view } = this.state;
		const { profile, universal_currency_list,company_profile,creditnote_details } = this.props;
	
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
														{/* <DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'profitloss', 'xls');
															}}
														>
															XLS (Microsoft Excel 1997-2004 Compatible)
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(csvData, 'profitloss', 'xlsx');
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
									fileName="Invoice Details.pdf"
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
											<b style ={{ fontSize: '18px'}}>{strings.InvoiceDetails}</b>
											<br style={{ marginBottom: '5px' }} />
											{strings.From} {(initValue.startDate).replaceAll("/","-")} {strings.To} {initValue.endDate.replaceAll("/","-")} 

											
									</div>
									<div>
									</div>									
							</div>
									{loading ? (
										<Loader />
									) : (
										<div id="tbl_exporttable_to_xls" className="table-wrapper">
												<Table className="table-bordered">
												<thead className="table-header-bg">
													<tr>
														<th style={{ padding: '0.5rem', textAlign: 'center', color:'black' }}>{strings.Invoice+" "+strings.Number}</th>
														<th style={{ padding: '0.5rem', textAlign: 'center', color:'black' }}>{strings.CustomerName}</th>
														<th style={{ padding: '0.5rem', textAlign: 'center', color:'black' }}>{strings.Invoice+" "+strings.Date}</th>
														<th style={{ padding: '0.5rem', textAlign: 'center', color:'black' }}>{strings.Invoice+" "+strings.Due+" "+strings.Date}</th>
														<th style={{ padding: '0.5rem', textAlign: 'center', color:'black' }}>{strings.Status}</th>
														<th style={{ padding: '0.5rem', textAlign: 'right', color:'black' }}>{strings.InvoiceAmount}</th>
														<th style={{ padding: '0.5rem', textAlign: 'right', color:'black' }}> {strings.RemainingBalance}</th>
													</tr>
												</thead>
												<tbody className=" table-bordered table-hover">
													{this.state.data.invoiceSummaryModelList &&
														this.state.data.invoiceSummaryModelList.map((item, index) => {
															return (
																<tr key={index}>


																	<td style={{ textAlign: 'center pull-left'}}>
																	<Link
																		to={{
																			pathname: "/admin/income/customer-invoice/view",
																			state: {
																			id: item.invoiceId,
																			gotoReports: "/admin/report/invoice-details",
																			},
																		}}
																		style={{ textAlign: "left", color: "#2046DB", cursor: "pointer" }}
																		>
																		{item.invoiceNumber}
																	</Link>
																	</td>
																	<td style={{ textAlign: 'center pull-left'}}>{item.customerName}</td>
																	<td style={{ textAlign: 'center'}}>{item.invoiceDate ? (
																		moment(item.invoiceDate).format('DD-MM-YYYY')
																	) : (" ")}</td>
																		<td style={{ textAlign: 'center'}}>{item.invoiceDueDate ? (
																		moment(item.invoiceDueDate).format('DD-MM-YYYY')
																	) : (" ")}</td>
																	<td style={{ textAlign: 'center pull-left' }}>{item.status}</td>
																	<td style={{ textAlign: 'right' }}>
																		<Currency
																			value={item.invoiceTotalAmount}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0].currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>

																	<td style={{ textAlign: 'right' }}>
																		<Currency
																			value={item.balance}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0].currencyIsoCode
																					: 'USD'
																			}
																		/>
																	</td>
																</tr>
															);
														})}

												</tbody>
												<tfoot>
													<tr style={{ border: "3px solid #dfe9f7" }}>
													<td style={{ textAlign: 'center', width: '20%' }}><b>{strings.Total}</b></td>
													<td></td>	<td></td>	<td></td><td></td>	
													<td style={{ textAlign: 'right', width: '20%' }}>
												
														<b><Currency
															value={this.state.data.totalAmount}
															currencySymbol={
																universal_currency_list[0]
																	? universal_currency_list[0].currencyIsoCode
																	: 'USD'
															}
														/></b>
														
													</td>

													
													<td style={{ textAlign: 'right', width: '20%' }}>
														
													<b>
													<Currency
															value={this.state.data.totalBalance}
															currencySymbol={
																universal_currency_list[0]
																	? universal_currency_list[0].currencyIsoCode
																	: 'USD'
															}
														/></b>
														
													</td>
												</tr>
												</tfoot>
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
)(InvoiceDetails);