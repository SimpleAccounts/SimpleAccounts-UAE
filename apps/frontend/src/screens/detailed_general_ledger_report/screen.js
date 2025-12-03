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
import { ReportTables } from 'screens/financial_report/sections'
import * as XLSX from 'xlsx';
import FilterComponent from './sections/filterComponent';
import { Loader, Currency } from 'components';
import * as DetailGeneralLedgerActions from './actions';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import { CommonActions } from 'services/global';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';
import FilterComponent3 from './sections/FilterComponent3';



const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
		universal_currency_list: state.common.universal_currency_list,
		company_profile: state.common.company_profile,	
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		detailGeneralLedgerActions: bindActionCreators(
			DetailGeneralLedgerActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
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

class DetailedGeneralLedgerReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			dropdownOpen: false,
			customPeriod: 'currentMonth',
			detailedGeneralLedgerList: [],
			hideExportOptions: false,
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
			chart_of_account_list: [],
		};
		this.columnHeader = [
			{ label: strings1.Date, value: 'date', sort: true },
			{ label: strings1.TransactionType, value: 'transcation_type', sort: false },
			{ label: strings1.Account, value: 'name', sort: true },
			{ label: strings1.Transaction+" "+strings1.Details,value: 'postingReferenceTypeEnum',sort: true,},
			{ label: strings1.Transaction+"#", value: 'transactonRefNo', sort: true },
			{ label: strings1.Reference+"#", value: 'referenceNo', sort: false,align: 'right'  },
			{ label: strings1.Debit, value: 'debitAmount', sort: false, align: 'right' },
			{ label: strings1.Credit, value: 'creditAmount', sort: false, align: 'right' },
			{ label: strings1.Amount, value: 'amount', sort: false, align: 'right' },
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
			reportBasis: initValue.reportBasis,
			chartOfAccountId: initValue.chartOfAccountId,
		};
		this.props.detailGeneralLedgerActions
			.getDetailedGeneralLedgerList(postData)
			.then((res) => {
				if (res.status === 200) {
					const detailedGeneralLedgerList = this.getList(res.data)
					this.setState(
						{ detailedGeneralLedgerReportList: detailedGeneralLedgerList, loading: false},
					);
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
			});
			this.props.detailGeneralLedgerActions
			.getTransactionCategoryList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						chart_of_account_list: res.data,
					});
				}
			});
	};

	getList = (detailedGeneralLedgerList) => {
		const resultObject = [];
		let id = 0;
		detailedGeneralLedgerList && detailedGeneralLedgerList.length > 0 && detailedGeneralLedgerList.map((item) => {
			const detailedGeneralLedgerDetails = {
				date: item[0]['transactionTypeName'],
				id: id,
			}
			resultObject.push(detailedGeneralLedgerDetails);
			id++;

			item.map((row) => {
				const detailedGeneralLedgerDetails = {
					id: id,
					date: row.date ? row.date.replaceAll("/", "-") : '',
					postingReferenceTypeEnum: row.postingReferenceTypeEnum,
					transactionTypeName: row.postingReferenceTypeEnum !== 'Opening Balance' ? row.transactionTypeName : '',
					name: row.name,
					transactionRefNo: row.postingReferenceTypeEnum !== 'Opening Balance' && row.postingReferenceTypeEnum !== 'Closing Balance' ? row.transactonRefNo : '',
					referenceNo: row.postingReferenceTypeEnum !== 'Opening Balance' && row.postingReferenceTypeEnum !== 'Closing Balance' ? row.referenceNo : '',
					debitAmount: row.debitAmount,
					creditAmount: row.creditAmount,
					amount: row.amount,
					deleteFlag:row.deleteFlag,
					transactionType: row.invoiceType,
					transactionId: row.postingReferenceType === "EXPENSE" ? row.referenceId : row.invoiceId,
					referenceId: row.referenceId ,
					postingReferenceType: row.postingReferenceType,
				}
				resultObject.push(detailedGeneralLedgerDetails);
				id++;
			})
		},)
		return resultObject;
	}

	exportFile = () => {

	
		let dl =""
		let fn =""
		let type="csv"
		var elt = document.getElementById('tbl_exporttable_to_xls');												
		var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });		
		return dl ?
		  XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
		  XLSX.writeFile(wb, fn || ('Detailed General Ledger Report.'+ (type || 'csv')));

	   }

	   exportExcelFile  = () => 
	   {   let dl =""
		   let fn =""
		   let type="xlsx"
		   var elt = document.getElementById('tbl_exporttable_to_xls');												
		   var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });		
		   return dl ?
			 XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
			 XLSX.writeFile(wb, fn || ('Detailed General Ledger Report.'+ (type || 'xlsx')));
   
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

	generateReport = (value) => {
		this.setState(
			{
				initValue: {
					startDate: moment(value.startDate).format('DD/MM/YYYY'),
					endDate: moment(value.endDate).format('DD/MM/YYYY'),
					// reportBasis: value.reportBasis.value,
					// chartOfAccountId: value.chartOfAccountId.value,
				},
				loading: true,
				view: !this.state.view,
			},
			() => {
				this.initializeData();
			},
		);
	};

	onSort = (column) => {
		let checkedValue = [];
		let obj = {};
		const direction = this.state.sort.column
			? this.state.sort.direction === 'asc'
				? 'desc'
				: 'asc'
			: 'desc';
		const sortedData = this.state.detailedGeneralLedgerList.map((data) => {
			let nameA, nameB;
			data.sort((a, b) => {
				if (column !== 'date') {
					nameA = a[`${column}`] ? a[`${column}`].toUpperCase() : '';
					nameB = b[`${column}`] ? b[`${column}`].toUpperCase() : '';
				} else {
					nameA = a[`${column}`]
						? moment(a[`${column}`], 'DD/MM/YYYY').toDate()
						: '';
					nameB = b[`${column}`]
						? moment(b[`${column}`], 'DD/MM/YYYY').toDate()
						: '';
				}
				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0;
			});
			checkedValue = data[0][`${column}`];
			if (direction === 'desc') {
				data.reverse();
				checkedValue = data[0][`${column}`];
			}
			obj = {
				data,
				value: checkedValue,
			};
			return obj;
		});
		const temp = sortedData.sort((a, b) => {
			const nameA = a['value'] ? a['value'].toUpperCase() : '';
			const nameB = b['value'] ? b['value'].toUpperCase() : '';
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		});
		if (direction === 'desc') {
			temp.reverse();
		}

		const val = temp.map((item) => {
			return item.data;
		});
		this.setState({
			detailedGeneralLedgerList: val,
			sort: {
				column,
				direction,
			},
		});
	};

	setArrow = (column) => {
		let className = 'sort-direction';
		if (this.state.sort.column === column) {
			className += this.state.sort.direction === 'asc' ? ' desc' : ' asc';
		}
		return className;
	};

	getInvoice = (postingType, type, id,) => {
		if (postingType === "REVERSE_EXPENSE" || postingType === "EXPENSE") {
			this.props.history.push('/admin/expense/expense/view', {
				id: id,
				gotoDGLReport: true,
			});
			return '';
		} else if (postingType === "INVOICE") {
			if (type === 1) {
				this.props.history.push('/admin/expense/supplier-invoice/view', {
					id,
					gotoDGLReport: true,
				});

			} else {
				this.props.history.push('/admin/income/customer-invoice/view', {
					id,
					gotoDGLReport: true,
				});
			}
			return '';
		} else if (postingType === "DEBIT_NOTE") {
			this.props.history.push('/admin/expense/debit-notes/view', {
				id: id,
				gotoReports: '/admin/report/detailed-general-ledger',
			});
			return '';
		} else if (postingType === "CREDIT_NOTE") {
			this.props.history.push('/admin/income/credit-notes/view', {
				id: id,
				gotoReports: '/admin/report/detailed-general-ledger',
			});
			return '';
		} else if (postingType === "RECEIPT" || postingType === "BANK_RECEIPT") {
			this.props.history.push('/admin/income/receipt/view', {
				id: id,
				gotoReports: '/admin/report/detailed-general-ledger',
			});
			return '';
		} else if (postingType === "PAYMENT" || postingType === "BANK_PAYMENT") {
			this.props.history.push('/admin/expense/purchase-receipt/view', {
				id: id,
				gotoReports: '/admin/report/detailed-general-ledger',
			});
			return '';
		} else if (postingType === "MANUAL") {
			this.props.history.push('/admin/accountant/journal/detail', { id });
			return '';
		}
	};

	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			initValue,
			dropdownOpen,
			customPeriod,
			detailedGeneralLedgerReportList,
			view,
			chart_of_account_list,
		} = this.state;
		const { profile, universal_currency_list,company_profile } = this.props;
		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<Card>
						<div>
						{!this.state.hideExportOptions &&
									<Col lg={12}>
										<div
											className="h4 mb-0 d-flex align-items-center pull-right"
											style={{ justifyContent: 'space-between',marginRight:'10px', marginTop:'20px' }}
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
											<Dropdown isOpen={dropdownOpen} toggle={this.toggle} style={{marginTop:'0px'}}>
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
									chart_of_account_list={chart_of_account_list}
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
								    fileName="Detailed General Ledger.pdf"
								>

								<div style={{										
									display: 'flex',
									justifyContent: 'space-between',
									marginBottom: '1rem'}}>
									<div className="logo-container" style={{	
									width:'150px',}}>
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
									<div className="text-center" style={{justifyContent:'center'}} >
								
										<h2>
										{company_profile &&
											company_profile['companyName']
												? company_profile['companyName']
												: ''}
											</h2>	
											<div className="ml-4" >
												<b style ={{ fontSize: '18px'}}>{strings.DetailedGeneralLedger}</b>
												<br/>
												{customPeriod === 'asOn' ? `${strings.Ason} ${initValue.endDate.replaceAll("/", "-")}`
											 : `${strings.From} ${initValue.startDate.replaceAll("/", "-")} to ${initValue.endDate.replaceAll("/", "-")}`}
												
												{/* {strings.From} {(initValue.startDate).replaceAll("/","-")} {strings.To} {initValue.endDate.replaceAll("/","-")}  */}
											</div>	
									</div>
									<div className='mr-3'>
									</div>									
							</div>
															
									{loading ? (
										<Loader />
									) : (
										<>
											<ReportTables
												reportDataList={detailedGeneralLedgerReportList || []}
												reportName={'Detailed General Ledger'}
												id={7}
												rowHeight={80}
												history={this.props.history}
											/>
										
										</>
										
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
)(DetailedGeneralLedgerReport);
