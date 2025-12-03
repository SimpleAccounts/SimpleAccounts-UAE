import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
import * as XLSX from 'xlsx';
import { Loader } from 'components';
import * as FinancialReportActions from '../../actions';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import { CommonActions } from 'services/global';

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
		universal_currency_list: state.common.universal_currency_list,
		company_profile: state.common.company_profile,	
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		financialReportActions: bindActionCreators(
			FinancialReportActions,
			dispatch,
		),
		commonActions: bindActionCreators(
			CommonActions,
			dispatch,
		)
	};
};


class ViewFtaExciseAuditReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			dropdownOpen: false,
			FtaExciseAuditData: [],
			view: false,
			initValue: {
				startDate:this.props.location.state.startDate,
				endDate: this.props.location.state.endDate,
				companyId: this.props.profile.company.companyId ,
				userId: this.props.profile.userId ,
				taxAgencyId: this.props.location.state.taxAgencyId,
			},
			csvData: [],
			activePage: 1,
			sizePerPage: 10,
			totalCount: 0,
			sort: {
				column: null,
				direction: 'desc',
			},
			chart_of_account_list: [],
		};

		// Company Information Table
		this.columnHeaderCompany = [
			{ label: 'Taxable Person Name En', value: 'taxablePersonNameEn', sort: false },
			{ label: 'Taxable Person Name Ar', value: 'taxablePersonNameAr', sort: true },
			{ label: 'TRN',value: 'taxRegistrationNumber',sort: true,},
			{ label: 'Tax Agency Name', value: 'TaxAgencyName', sort: true },
			{ label: 'TAN', value: 'taxAgencyNumber', sort: false,align: 'right'  },
			{ label: 'Tax Agent Name', value: 'TaxAgentName', sort: false },
			{ label: 'TAAN', value: 'taxAgencyAgentNumber', sort: false },
			{ label: 'Period Start ', value: 'startDate', sort: false },
			{ label: 'Period End ', value: 'endDate', sort: false },
			{ label: 'FAF Creation Date ', value: 'creationDate', sort: false },
			{ label: 'Product Version ', value: 'productVersion', sort: false },
			{ label: 'FAF Version ', value: 'fafVersion', sort: false },
		];

		// Costumer Data Audit File
		this.columnHeaderCustomer = [
			{ label: 'Customer Name', value: 'customerName', sort: true },
			{ label: 'GL/ID', value: 'glId', sort: true },
			{ label: 'Location of Customer (Country or Emirate)', value: 'customerCountry', sort: false },
			{ label: 'Customer TRN', value: 'customerTRN', sort: true },
			// { label: 'Reverse Charge', value: 'reverseCharge', sort: true },
		];

		// Supplier Data Audit File
		this.columnHeaderSupplier = [
			{ label: 'Supplier Name', value: 'supplierName', sort: true },
			{ label: 'GL/ID', value: 'glId', sort: true },
			{ label: 'Location of Supplier (Country or Emirate)', value: 'supplierCountry', sort: false },
			{ label: 'Supplier TRN', value: 'supplierTRN', sort: true },
			// { label: 'Reverse Charge', value: 'reverseCharge', sort: true },
		];

		// Purchase Data Information
		this.columnHeaderPurchase = [
			{ label: 'Supplier Name', value: 'supplierName', sort: true },
			{ label: 'Supplier TRN', value: 'supplierTRN', sort: true },
			{ label: 'Invoice Date', value: 'invoiceDate', sort: true },
			{ label: 'Invoice No.', value: 'invoiceNo', sort: false },
			{ label: 'Permit No.', value: 'permitNo', sort: true },
			{ label: 'Transaction ID', value: 'transactionID', sort: true },
			{ label: 'Line No.', value: 'lineNo', sort: false },
			// { label: 'Product Name', value: 'productName', sort: true },
			// { label: 'Product Type', value: 'productType', sort: true },
			{ label: 'Product Description', value: 'productDescription', sort: false },
			{ label: 'Purchase Amount AED', value: 'purchaseAmount', sort: true },
			{ label: 'Excise Tax Amount AED', value: 'exciseTaxAmountAED', sort: true },
			{ label: 'Tax Code', value: 'taxCode', sort: false },
			{ label: 'FCY Code', value: 'fcycode', sort: false },
			{ label: 'Purchase Amount FCY', value: 'purchaseFCY', sort: true },
			{ label: 'Excise Tax Amount FCY', value: 'exciseTaxAmountFCY', sort: true },

		];
		
		// Purchase Listing Total
		this.columnHeaderCustomerTotal = [
			{ label: 'Supply Total AED', value: 'supplyTotal', sort: false },
			{ label: 'Excise Tax Total AED', value: 'exciseTaxTotal', sort: true },
			{ label: 'Transaction Count Total', value: 'customerTransactionCountTotal', sort: true },
		];
		
		// Supply Data Information
		this.columnHeaderSupply = [
			{ label: 'Customer Name', value: 'customerName', sort: true },
			{ label: 'Customer TRN', value: 'customerTRN', sort: true },
			{ label: 'Invoice Date', value: 'invoiceDate', sort: true },
			{ label: 'Invoice No.', value: 'invoiceNo', sort: false },
			// { label: 'Permit No.', value: 'permitNo', sort: true },
			{ label: 'Transaction ID', value: 'transactionID', sort: true },
			{ label: 'Line No.', value: 'lineNo', sort: false },
			// { label: 'Product Name', value: 'productName', sort: true },
			// { label: 'Product Type', value: 'productType', sort: true },
			{ label: 'Product Description', value: 'productDescription', sort: false },
			{ label: 'Supply Amount AED', value: 'SupplyValue', sort: true },
			{ label: 'Excise Tax Amount AED', value: 'exciseTaxvalue', sort: true },
			{ label: 'Tax Code', value: 'taxCode', sort: false },
			{ label: 'Country', value: 'fcycode', sort: false },
			{ label: 'FCY Code', value: 'fcycode', sort: false },
			{ label: 'Supply Amount FCY', value: 'supplyFCY', sort: true },
			{ label: 'Excise Tax Amount FCY', value: 'vatfcy', sort: true },
		];
		
		// Supply Listing Total
		this.columnHeaderSupplierTotal = [
			{ label: 'Purchase Total AED', value: 'purchaseTotal', sort: false },
			{ label: 'Excise Tax Total AED', value: 'supplierVATTotal', sort: true },
			{ label: 'Transaction Count Total', value: 'supplierTransactionCountTotal', sort: true },
		];
		
		// General Ledger Table
		this.columnHeaderGenral = [
			{ label: 'Transaction Date', value: 'transactionDate', sort: true },
			{ label: 'Account ID', value: 'accountID', sort: false },
			{ label: 'Account Name', value: 'accountName', sort: true },
			{ label: 'Transaction Description', value: 'transactionDescription', sort: true },
			{ label: 'Name', value: 'name', sort: false },
			{ label: 'Transaction ID', value: 'transactionID', sort: true },
			{ label: 'Source Document ID', value: 'sourceDocumentID', sort: true },
			{ label: 'Source Type', value: 'sourceType', sort: true },
			{ label: 'Debit', value: 'debit', sort: false },
			{ label: 'Credit', value: 'credit', sort: true },
			{ label: 'Balance', value: 'balance', sort: true },
		
		];
		
		// General Ledger Table Total
		this.columnHeaderGeneralTotal= [
			{ label: 'Total Debit', value: 'totalDebit', sort: true },
			{ label: 'Total Credit', value: 'totalCredit', sort: false },
			{ label: 'Transaction Count Total', value: 'transactionCountTotal', sort: true },
			{ label: 'GLT Currency', value: 'gltcurrency', sort: true }
		];
		
		// Stock File Table
		this.columnStockFileTable= [
			{ label: 'Ware House ID', value: 'wareHouseId', sort: true },
			{ label: 'Product Code', value: 'productCode', sort: false },
			{ label: 'Excise Rate', value: 'exciseRate', sort: true },
			{ label: 'Transaction Type', value: 'transactionType', sort: true },
			{ label: 'Moment Details', value: 'momentDetails', sort: true },
			{ label: 'Transfer ID', value: 'transferId', sort: false },
			{ label: 'Transaction Date', value: 'transactionDate', sort: true },
			{ label: 'Tax Payment Date', value: 'taxPaymentDate', sort: true },
			{ label: 'Stock Duty Status', value: 'stockDutyStatus', sort: true },
			{ label: 'Stock Adjustment', value: 'stockAdjustment', sort: false },
			{ label: 'Goods Location', value: 'goodsLocation', sort: true }
		];
	}
	

	componentDidMount = () => {
		this.initializeData();
		
			this.props.commonActions.getCompany() 
	};

	initializeData = () => {
		const { initValue } = this.state;
		const postData = {
			startDate: initValue.startDate,
			endDate: initValue.endDate,
			companyId: initValue.companyId,
			userId: initValue.userId,
			taxAgencyId: initValue.taxAgencyId
		};
		this.props.financialReportActions
			.getFtaExciseAuditReport(postData)
			.then((res) => {
				const tempData = [];
				if (res.status === 200) {
					// res.data?.map((item) => {
					// 	item?.map((val) => {
					// 		tempData.push(val);
					// 		return val;
					// 	});
					// 	return item;
					// });
					this.setState(
						{ FtaExciseAuditData: res.data, csvData: tempData },
						() => {
							this.setState({
								loading: false,
							});
						},
					);
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
	};
	renderDate = (cell, row) => {
		
		return cell ? moment(cell)
			.format('DD-MM-YYYY') 
			// .format('LL')
			: '-';
	};

	exportFile = () => {
		let dl =""
		let fn =""
		let type="csv"
		var elt = document.getElementById('tbl_exporttable_to_xls');												
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });		
		return dl ?
		  XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
		  XLSX.writeFile(wb, fn || ('FTA EXCISE AUDIT REPORT.'+ (type || 'csv')));

	   }

	   exportExcelFile  = () => 
	   {   let dl =""
		   let fn =""
		   let type="xlsx"
		   var elt = document.getElementById('tbl_exporttable_to_xls');												
		   var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });		
		   return dl ?
			 XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
			 XLSX.writeFile(wb, fn || ('FTA EXCISE AUDIT REPORT.'+ (type || 'xlsx')));
   
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

		const {
			loading,
			dropdownOpen,
		} = this.state;
	
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
													FTA Excise Tax Audit File From <b>{ this.state.initValue.startDate.replaceAll("/","-") +"  to  "+this.state.initValue.endDate.replaceAll("/","-") }</b>												</p>
											</div>
											<div className="d-flex">
											<Dropdown isOpen={dropdownOpen} toggle={this.toggle}>
													<DropdownToggle caret>Export As</DropdownToggle>
													<DropdownMenu>
														
													<DropdownItem>
															
															<span
															style={{
																border: 0,
    															padding: 0,
																backgroundColor:"white !important"
															}}
														     onClick={()=>{this.exportFile()}}
															>CSV (Comma Separated Value)</span>
														</DropdownItem>
														<DropdownItem>
															
															<span
															style={{
																border: 0,
    															padding: 0,
																backgroundColor:"white !important"
															}}
														     onClick={()=>{this.exportExcelFile()}}
															>Excel</span>
														</DropdownItem>
														<DropdownItem onClick={this.exportPDFWithComponent}>
															Pdf
														</DropdownItem>
														{/* <DropdownItem
															onClick={() => {
																this.exportFile(
																	csvData,
																	'detailGeneralLedger',
																	'xls',
																);
															}}
														>
															XLS (Microsoft Excel 1997-2004 Compatible)
														</DropdownItem>
														<DropdownItem
															onClick={() => {
																this.exportFile(
																	csvData,
																	'detailGeneralLedger',
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
							{/* <div className={`panel ${view ? 'view-panel' : ''}`}>
								<FilterComponent
									viewFilter={this.viewFilter}
									chart_of_account_list={chart_of_account_list}
									generateReport={(value) => {
										this.generateReport(value);
									}}
								/>
							</div> */}
							<CardBody id="section-to-print">
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A3"
								    fileName="FTA Excise Tax Audit File.pdf"
								>

									{/* <div className="logo-container">
													<img src={logo} alt="logo" />
												</div>
									<div style={{ textAlign: 'center'}}>
										<p><h2>
										{company_profile &&
											company_profile['companyName']
												? company_profile['companyName']
												: ''}
												</h2>
											<br style={{ marginBottom: '5px' }} />
											<b style ={{ fontSize: '18px'}}>Detailed General Ledger</b>
											<br style={{ marginBottom: '5px' }} />
											From {initValue.startDate} To {initValue.endDate}
										</p>
									</div> */}

									
									{loading ? (
										<Loader />
									) : (
										<div id="tbl_exporttable_to_xls" className="table-wrapper">
											<Table responsive>
											<tr></tr>
											<tr>
													<td>
													<b><h5>
													Company Information Table
													</h5></b>
													</td>
												</tr>
												<tr></tr>
												<tr>
													<td>
													<h6>
													CompInfoStart
													</h6>
													</td>
												</tr>
												<tr></tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnHeaderCompany?.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600', color:'black' }}
																	className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
												
																				<tr>
																					<td style={{ width: '18%', textAlign: 'Left'}}>
																						{this.state.FtaExciseAuditData?.taxablePersonNameEn}
																					</td>
																					<td style={{ width: '13%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.taxablePersonNameAr}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.taxRegistrationNumber}
																					</td>
																					<td style={{ width: '18%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.taxAgencyName}
																					</td>
																					<td style={{ width: '13%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.taxAgencyNumber}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.taxAgentName}
																					</td>
																					<td style={{ width: '18%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.taxAgencyAgentNumber}
																					</td>
																					<td style={{ width: '13%', textAlign: 'left'}}>
																						{this.renderDate(this.state.FtaExciseAuditData?.startDate,'').replaceAll("/","-")}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{this.renderDate(this.state.FtaExciseAuditData?.endDate,'')}
																					</td>
																					<td style={{ width: '18%', textAlign: 'left'}}>
																						{this.renderDate(this.state.FtaExciseAuditData?.creationDate,'')}
																					</td>
																					<td style={{ width: '13%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.productVersion}
																					</td>
																					<td style={{ width: '13%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.fafVersion}
																					</td>
																				
																				</tr>																		
														
												</tbody>
												</Table>
												<tr></tr>
												<tr>
													<td colSpan={13}>
													<h6>
													CompInfoEnd
													</h6>
													</td>
												</tr>
												<tr></tr>
												<tr></tr>
												<tr>
													<td><b><h5>
													Costumer Data Audit File
													</h5></b></td>
												</tr>
												<tr></tr>
												<tr>
													<td>
													<h6>
													CustomerDataStart
													</h6>
													</td>
												</tr>
												<tr></tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnHeaderCustomer?.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600', color:'black' }}
																	className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													{this.state.FtaExciseAuditData &&
														this.state.FtaExciseAuditData?.customerDataResponseModels?.map(
															(item, index) => {

																return (
																	<>
																		
																	
																				<tr key={index}>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['customerName']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['glId']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['customerCountry']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['customerTRN']}
																					</td>
																					{/* <td style={{ width: '12%', textAlign: 'left'}}>
																						{item['Reverse Charge']}
																					</td> */}
																					
																				</tr>
																		
																	</>
																);
															},
														)}
												</tbody>
												</Table>
												<tr></tr>
												<tr>
													<td colSpan={5}>
													<h6>
													CustomerDataEnd
													</h6>
													</td>
												</tr>
												<tr>
													<> </>
												</tr>
												<tr></tr>
												<tr>
												<td><b><h5>
												Supplier Data Audit File</h5></b>
												</td>
												</tr>
												<tr></tr>
												<tr>
													<td>
													<h6>
													SupplierDataStart
													</h6>
													</td>
												</tr>
												<tr></tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnHeaderSupplier?.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600', color:'black' }}
																	className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													{this.state?.FtaExciseAuditData &&
														this.state.FtaExciseAuditData?.supplierDataResponseModels?.map(
															(item, index) => {
																return (
																	<>
																		
																		
																				<tr key={index}>
																				<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['supplierName']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['glId']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['supplierCountry']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['supplierTRN']}
																					</td>
																					{/* <td style={{ width: '12%', textAlign: 'left'}}>
																						{item['reverseCharge']}
																					</td> */}

																				</tr>
																		
																	</>
																);
															},
														)}
												</tbody>
												</Table>
												<tr></tr>
												<tr>
													<td colSpan={12}>
													<h6>
													SupplierDataEnd
													</h6>
													</td>
												</tr>
												<tr>
													<> </>
												</tr>
												<tr></tr>
												<tr>
												<td><b><h5>
												Purchase Listing Table</h5></b>
												</td>
												</tr>
												<tr></tr>
												<tr>
													<td colSpan={12}>
													<h6>
													PurcDataStart
													</h6>
													</td>
												</tr>
												<tr></tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnHeaderPurchase?.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600', color:'black' }}
																	className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													{this.state.FtaExciseAuditData &&
														this.state.FtaExciseAuditData?.supplierSupplyListingResponseModels?.map(
															(item, index) => {
																return (
																	<>
																		
																		
																				<tr key={index}>
																				<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['supplierName']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['supplierTRN']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['invoiceDate']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['invoiceNo']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['permitNo']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['transactionID']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['lineNo']}
																					</td>
																					{/* <td style={{ width: '12%', textAlign: 'left'}}>
																						{item['productName']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['productType']}
																					</td> */}
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['productDescription']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['purchaseValue']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['exciseTaxValue']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['taxCode']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['fcycode']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['purchaseFCY']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['exciseTaxFCY']}
																					</td>
																					
																				</tr>
																		
																	</>
																);
															},
														)}
												</tbody>
												</Table>
												<tr></tr>
												<tr>
													<td colSpan={16}>
													<h6>
													PurcDataEnd
													</h6>
													</td>
												</tr>
												<tr>
													<> </>
												</tr>
												<tr>
													<td><b><h5>
													Purchase Listing Total
													</h5></b></td>
												</tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnHeaderSupplierTotal?.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600', color:'black' }}
																	className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													
																	<>
																		
																		
																				<tr >
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.purchaseTotal}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.supplierExciseTotal}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.supplierTransactionCountTotal}
																					</td>
																					
																					
																				
																				</tr>
																		
																	</>
															
												</tbody>
												</Table>
												<tr>
													<> </>
												</tr>
												<tr>
														<> </>
													</tr>
													<tr>
													<td><b><h5>
													Supply Listing Table
													</h5></b></td>
												</tr>
												<tr></tr>
												<tr>
													<td>
													<h6>
													SuppDataStart
													</h6>
													</td>
												</tr>
												<tr></tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnHeaderSupply?.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600', color:'black' }}
																	className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													{this.state.FtaExciseAuditData &&
														this.state.FtaExciseAuditData?.customerSupplyListingResponseModel?.map(
															(item, index) => {
																return (
																	<>
																		
																		
																				<tr key={index}>
																				<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['customerName']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['customerTRN']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['invoiceDate']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['invoiceNo']}
																					</td>
																					{/* <td style={{ width: '12%', textAlign: 'left'}}>
																						{item['permitNo']}
																					</td> */}
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['transactionID']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['lineNo']}
																					</td>
																					{/* <td style={{ width: '12%', textAlign: 'left'}}>
																						{item['productName']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['productType']}
																					</td> */}
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['productDescription']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['supplyValue']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['exciseTaxValue']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['excisetaxCode']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['country']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['fcycode']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['supplyFCY']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['exciseTaxFCY']}
																					</td>
																				
																				</tr>
																		
																	</>
																);
															},
														)}
												</tbody>
												</Table>
												<tr></tr>
												<tr>
													<td colSpan={16}>
													<h6>
													SuppDataEnd
													</h6>
													</td>
												</tr>
												<tr>
													<> </>
												</tr>
												<tr>
													<td><b><h5>
													Supply Listing Total
													</h5></b></td>
												</tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnHeaderCustomerTotal?.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600', color:'black' }}
																	className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													
																	<>
																		
																		
																				<tr >
																				
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.supplyTotal}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.customerExciseTotal}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.customerTransactionCountTotal}
																					</td>
																					
																				
																				</tr>
																		
																	</>
															
												</tbody>
												</Table>
												<tr></tr>
												<tr>
													<> </>
												</tr>
												<tr>
													<td><b><h5>
													General Ledger Table
													</h5></b></td>
												</tr>
												<tr></tr>
												<tr>
													<td>
													<h6>
													GLDataStart
													</h6>
													</td>
												</tr>
												<tr></tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnHeaderGenral?.map((column, index) => {
															return (
																<th
																key={index}
																style={{ fontWeight: '600', color:'black' }}
																className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
															>
																{column.label}
															</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													{this.state.FtaExciseAuditData &&
														this.state.FtaExciseAuditData?.generalLedgerListingResponseModels?.map(
															(item, index) => {
																return (
																	<>
																		
																		
																				<tr key={index}>
																				<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['transactionDate']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['accountID']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['accountName']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['transactionDescription']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['name']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['transactionID']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['sourceDocumentID']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['sourceType']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['credit']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['debit']}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{item['balance']}
																					</td>
																				
																				</tr>
																		
																	</>
																);
															},
														)}
												</tbody>
												</Table>
												<tr></tr>		
												<tr>
													<td colSpan={12}> 
													<h6>
													GLDataEnd
													</h6>
													</td>
												</tr>
												<tr>
													<> </>
												</tr>
												<tr>
													<td><b><h5>
													General Ledger Table Total
													</h5></b></td>
												</tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnHeaderGeneralTotal?.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600', color:'black' }}
																	className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
																>
																	{column.label}
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
													
																	<>
																		
																		
																				<tr >
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.totalDebit}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.totalCredit}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.transactionCountTotal}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																					{this.state.FtaExciseAuditData?.gltcurrency}
																					</td>
																				
																				</tr>
																		
																	</>
															
												</tbody>
												</Table>
												<tr></tr>
												<tr></tr>
												<tr>
													<td>
													<b><h5>
													Stock File Table
													</h5></b>
													</td>
												</tr>
												<tr></tr>
												<tr>
													<td>
													<h6>
													SFStart
													</h6>
													</td>
												</tr>
												<tr></tr>
												<Table>
												
												<thead>
													<tr className="header-row">
														{this.columnStockFileTable?.map((column, index) => {
															return (
																<th
																	key={index}
																	style={{ fontWeight: '600', color:'black' }}
																	className={column.align ? 'text-right table-header-bg' : 'table-header-bg' }
																>
																	<span>{column.label}</span>
																</th>
															);
														})}
													</tr>
												</thead>
												<tbody className="data-column">
												
																				<tr>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.warehouseID}
																					</td>
																					<td style={{ width: '18%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.productCode}
																					</td>
																					<td style={{ width: '13%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.exciseRate}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.trandsctionType}
																					</td>
																					<td style={{ width: '18%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.momentDetails}
																					</td>
																					<td style={{ width: '13%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.transferID}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.transactionDate}
																					</td>
																					<td style={{ width: '18%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.taxPaymentDate}
																					</td>
																					<td style={{ width: '13%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.stockDutyStatus}
																					</td>
																					<td style={{ width: '12%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.stockAdjustment}
																					</td>
																					<td style={{ width: '18%', textAlign: 'left'}}>
																						{this.state.FtaExciseAuditData?.goodsLocation}
																					</td>
																				</tr>
												</tbody>
												</Table>
												<tr></tr>
												<tr>
													<td>
													<h6>
													SFEnd
													</h6>
													</td>
												</tr>
											</Table>
										</div>
									)}
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
)(ViewFtaExciseAuditReport);
