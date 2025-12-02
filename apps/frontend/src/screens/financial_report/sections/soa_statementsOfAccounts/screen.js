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
import {
	Button,

	FormGroup,
	Label,
	Form,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';

import { Formik } from 'formik';


import './style.scss';
import moment from 'moment';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { CSVLink } from 'react-csv';
import { Loader, Currency } from 'components';
import * as FinancialReportActions from '../../actions';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import { CommonActions } from 'services/global';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import Select from 'react-select';
import { selectOptionsFactory } from 'utils';

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
		universal_currency_list: state.common.universal_currency_list,
		company_profile: state.reports.company_profile,
		payable_invoice: state.reports.payable_invoice,
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
class SOAReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			dropdownOpen: false,
			view: false,
			initValue: {
				startDate:"",
				endDate:"",
				// endDate:new Date(new Date().setMonth(new Date().getMonth() + 1))
			},
			csvData: [],
			activePage: 1,
			sizePerPage: 10,
			totalCount: 0,
			sort: {
				column: null,
				direction: 'desc',
			},
			soa_data: []
			// [
			// 	{ id: 1, date: "2021-08-02", typeName: "Invoice", invoiceNumber: "INV-2021/000189", amount: "23688", paymentAmount: "", balanceAmount: "11" },
			// 	{ id: 2, date: "2021-08-02", typeName: "Receipts", invoiceNumber: "INV-2021/000189", amount: "23688", paymentAmount: "", balanceAmount: "22" },
			// 	{ id: 3, date: "2021-08-02", typeName: "Invoice", invoiceNumber: "INV-2021/000189", amount: "23688", paymentAmount: "", balanceAmount: "33" },
			// 	{ id: 4, date: "2021-08-02", typeName: "Receipts", invoiceNumber: "INV-2021/000189", amount: "23688", paymentAmount: "", balanceAmount: "44" },
			// 	{ id: 5, date: "2021-08-02", typeName: "Receipts", invoiceNumber: "INV-2021/000189", amount: "23688", paymentAmount: "", balanceAmount: "66" },
			// 	{ id: 6, date: "", typeName: "", invoiceNumber: "Total Balance Due", amount: "", paymentAmount: "", balanceAmount: "176" },
			// ]
			,
			totalBalanceDueAmount:0,
			// date	typeName	invoiceNumber	amount	paymentAmount	 Balance 

				data: [],
				customer_list:[],
				openingBalance:0.00,
				totalAmountPaid:0.00,
				totalBalance: 0.00,
				totalInvoicedAmount: 0.00,
				transactionsModelList:[],
				customerName:''
		};

	}

	generateReport = (value) => {
		this.setState(
			{
				initValue: {
					startDate: moment(value.startDate).format('DD/MM/YYYY'),
					endDate: moment(value.endDate).format('DD/MM/YYYY'),
				},
				customerName:this.state.contactId && this.state.contactId.label ? this.state.contactId.label:'',
			},
			// () => {
			// 	this.initializeData();
			// },
		);
		const postData = {
			startDate: this.state.initValue.startDate,
			endDate: this.state.initValue.endDate,
			customerId:this.state.contactId && this.state.contactId.value ? this.state.contactId.value:''
		};

this.props.financialReportActions
	.getSOA(postData)
	.then((res) => {
		if (res.status === 200) {
			this.setState({
				data: res.data,
				openingBalance: res.data.openingBalance ?res.data.openingBalance:0.00,
				totalAmountPaid:  res.data.totalAmountPaid ?res.data.totalAmountPaid:0.00,
				totalBalance:  res.data.totalBalance?res.data.totalBalance:0.00,
				totalInvoicedAmount:  res.data.totalInvoicedAmount?res.data.totalInvoicedAmount:0.00,
				soa_data:  res.data.transactionsModelList?res.data.transactionsModelList:[],
				loading: false
			});
		}
	})
	.catch((err) => {
		this.setState({ loading: false });
	});
	};

	componentDidMount = () => {
		this.props.financialReportActions.getCompany()
		this.initializeData();


	};

	initializeData = () => {		
		this.props.financialReportActions
		.getCustomerList()
		.then((res) => {
							
				this.setState({
					customer_list: res,
				});
			
		})
		.catch((err) => {
			this.setState({ loading: false });
		});
	};

	exportFile = () => {


		let dl = ""
		let fn = ""
		let type = "csv"
		var elt = document.getElementById('tbl_exporttable_to_xls');
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
		return dl ?
			XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
			XLSX.writeFile(wb, fn || ('Statement Of Account( '+this.state.customerName+' ).' + (type || 'csv')));

	}

	exportExcelFile = () => {
		let dl = ""
		let fn = ""
		let type = "xlsx"
		var elt = document.getElementById('tbl_exporttable_to_xls');
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
		return dl ?
			XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
			XLSX.writeFile(wb, fn || ('Statement Of Account( '+this.state.customerName+' ).' + (type || 'xlsx')));

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
	renderinvoiceDate = (cell, rows) => {
		return moment(rows.invoiceDate).format('DD-MM-YYYY');
	};
	renderDate = (cell, rows) => {
		if(rows.invoiceNumber=="Total Balance Due")		
		return ("")
		else
		return moment(rows.date).format('DD-MM-YYYY');
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

	renderInvoiceNumber=(cell,row)=>{
				if(row.invoiceNumber=="Total Balance Due")		
					return (<b> {cell}</b>)
					else
					return (cell)
	
		
	}
	renderTotalBalanceDueAmount=(cell,row)=>{
		if(row.invoiceNumber=="Total Balance Due")		
			return (<b> <Currency
				value={cell}
				currencySymbol={
					this.props.universal_currency_list[0]
						? this.props.universal_currency_list[0].currencyIsoCode
						: 'USD'
				}
			/></b>)
			else
			return (
				<Currency
				value={cell}
				currencySymbol={
					this.props.universal_currency_list[0]
						? this.props.universal_currency_list[0].currencyIsoCode
						: 'USD'
				}
			/>
				)
		}

		renderAmount=(cell,row)=>{
			if(cell==null)		
				return ""
			else
				return (
					<Currency
					value={cell}
					currencySymbol={
						this.props.universal_currency_list[0]
							? this.props.universal_currency_list[0].currencyIsoCode
							: 'USD'
					}
				/>
					)
			}

	render() {
		strings.setLanguage(this.state.language);
		const { loading, initValue, dropdownOpen, csvData, view, soa_data ,customer_list} = this.state;
		const { profile, universal_currency_list, company_profile, payable_invoice } = this.props;
		let tmpCustomer_list = []
		if(customer_list)
		customer_list.map(item => {
			let obj = { label: item.label.contactName, value: item.value }
			tmpCustomer_list.push(obj)
		})
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

										{soa_data.length!=0 &&(	<div className="d-flex">
												<div>
													<Dropdown isOpen={dropdownOpen} toggle={this.toggle}>
														<DropdownToggle caret>Export As</DropdownToggle>
														<DropdownMenu>

															<DropdownItem>

																<span
																	style={{
																		border: 0,
																		padding: 0,
																		backgroundColor: "white !important"
																	}}
																	onClick={() => { this.exportFile() }}
																>CSV (Comma Separated Value)</span>
															</DropdownItem>
															<DropdownItem>

																<span
																	style={{
																		border: 0,
																		padding: 0,
																		backgroundColor: "white !important"
																	}}
																	onClick={() => { this.exportExcelFile() }}
																>Excel</span>
															</DropdownItem>
															<DropdownItem onClick={this.exportPDFWithComponent}>
																Pdf
															</DropdownItem>
														</DropdownMenu>
													</Dropdown></div> &nbsp;&nbsp;
												<div
													className="mr-2 print-btn-cont"
													onClick={() => window.print()}
													style={{
														cursor: 'pointer',
													}}
												>
													<i className="fa fa-print"></i>
												</div>
										
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

											</div>)}
										</div>
									</Col>
								</Row>
							</CardHeader>
							{/* <div className={`panel ${view ? 'view-panel' : ''}`}>
								<FilterComponent2
									viewFilter={this.viewFilter}
									generateReport={(value) => {
										this.generateReport(value);
									}}
								/>{' '}
							</div> */}
							<div>
			
					<CardBody>
						<Formik initialValues={initValue}>
							{(props) => (
								<Form>
									<Row>
									<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="contactId">
																		{/* <span className="text-danger">* </span> */}
																	{strings.CustomerName}
																	</Label>
																	<Select
																	    // styles={customStyles}
																		className="select-default-width"
																		id="contactId"
																		name="contactId"
																		placeholder={strings.Select+strings.CustomerName} 
																		options={
																			tmpCustomer_list
																				? tmpCustomer_list
																				: []
																		}
																		value={this.state.contactId}
																		onChange={(option) => {
																			if (option && option.value) {
																					this.setState({contactId:option})
																			} else {
																			this.setState({contactId:""})
																			}
																		}}																	
																	/>												
																</FormGroup>
															</Col>
                                        <Col lg={3}>
											<FormGroup className="mb-3">
												<Label htmlFor="startDate">{strings.StartDate}</Label>
												<DatePicker
													id="date"
													name="startDate"
													className={`form-control`}
													placeholderText="From"
													showMonthDropdown
													showYearDropdown
													autoComplete="off"
													// maxDate={new Date()}
													value={props.values.startDate!="" ?moment(props.values.startDate).format("DD-MM-YYYY"):""}
													dropdownMode="select"
													dateFormat="dd-MM-yyyy"
											
													onChange={(value) => {
														props.handleChange('startDate')(value);
													}}
												/>
											</FormGroup>
										</Col>
										<Col lg={3}>
											<FormGroup className="mb-3">
												<Label htmlFor="endDate">{strings.EndDate}</Label>
												<DatePicker
													id="date"
													name="endDate"
													className={`form-control`}
													autoComplete="off"
													// maxDate={new Date()}
													placeholderText="To"
													showMonthDropdown
													showYearDropdown
													value={props.values.endDate!="" ?moment(props.values.endDate).format("DD-MM-YYYY"):""}
													dropdownMode="select"
													dateFormat="dd-MM-yyyy"
						
													onChange={(value) => {
														props.handleChange('endDate')(value);
													}}
												/>
											</FormGroup>
										</Col>
										<Col lg={3}>
											<FormGroup className="mt-4">
												<Button
													type="button"
													color="primary"
													className="btn-square "
													onClick={() => {
														this.generateReport(props.values);
													}}
												>
													<i className="fa fa-dot-circle-o"></i> {strings.RunReport}
												</Button>

												
											</FormGroup>
										</Col>
									</Row>
									<Row>
										
									</Row>
								</Form>
							)}
						</Formik>
					</CardBody>
			
					</div>
			</div>
					</Card>

							{soa_data.length!=0 &&(
						
								
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A3"
									fileName={'Statement Of Account ( '+this.state.customerName+' ).pdf'}
								>
								<Card id="section-to-print"><CardBody>	
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
											<b style={{ fontSize: '18px' }}>Statement of Account ( {this.state.customerName} )</b>
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
											<div className="ml-2 mt-5 mb-5 " 
											style={{width:"35%"}}
											>
										<table className="table-bordered" width="100%">
										<tr>
											<td><b>Opening Balance</b></td>
											<td style={{textAlign:"right"}}>
												 {/* {this.state.openingBalance} */}
												 <Currency
																			value={this.state.openingBalance}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0].currencyIsoCode
																					: 'USD'
																			}
																		/>
											</td>
										</tr>
										<tr>
											<td><b>Invoiced amount</b></td>
											<td style={{textAlign:"right"}}> 
											{/* {this.state.totalInvoicedAmount} */}
														<Currency
																			value={this.state.totalInvoicedAmount}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0].currencyIsoCode
																					: 'USD'
																			}
																		/>
											</td>
										</tr>
										<tr>
											<td><b>Amount Received</b></td>
											<td style={{textAlign:"right"}}> 
											{/* {this.state.totalAmountPaid} */}
											<Currency
																			value={this.state.totalAmountPaid}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0].currencyIsoCode
																					: 'USD'
																			}
																		/>
											</td>
										</tr>
										<tr >
											<td><b>Balance Due</b></td>
											<td style={{textAlign:"right"}}> 

											<Currency
																			value={this.state.totalBalance}
																			currencySymbol={
																				universal_currency_list[0]
																					? universal_currency_list[0].currencyIsoCode
																					: 'USD'
																			}
																		/>
											</td>
										</tr>

										</table>
											</div>
											<Row>
										<Col></Col>
										<Col></Col>
									
											</Row>


											<BootstrapTable
												data={soa_data}
												key="id"

											>
												<TableHeaderColumn 
												dataField="date"
												className="table-header-bg"
												isKey
												dataFormat={this.renderDate}
												>
													Date
												</TableHeaderColumn>
												<TableHeaderColumn
												dataField="typeName"
												className="table-header-bg"
												>
													Transaction
												</TableHeaderColumn>
												<TableHeaderColumn
												className="table-header-bg"
												dataField="invoiceNumber"
												dataFormat={this.renderInvoiceNumber}
												>
													Details
												</TableHeaderColumn>
												<TableHeaderColumn
												dataField="amount"
												className="table-header-bg"
												dataAlign="right"
												dataFormat={this.renderAmount}
												>
													Amount
												</TableHeaderColumn >
												<TableHeaderColumn
													dataField="paymentAmount"
													className="table-header-bg"
													dataAlign="right"
													dataFormat={this.renderAmount}
												>
													Payments
												</TableHeaderColumn>
												<TableHeaderColumn
												dataField="balanceAmount"
												className="table-header-bg"
												dataAlign="right"
												dataFormat={this.renderTotalBalanceDueAmount}	
										
												>
													Balance
												</TableHeaderColumn>
											</BootstrapTable>
		
											<hr/>
										</div>
									)}
									<div style={{ textAlignLast: 'center' }}> {strings.PoweredBy} <b>SimpleAccounts</b></div>
									</CardBody>
									</Card>
								</PDFExport>
							)}
					
				</div>
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SOAReport);
