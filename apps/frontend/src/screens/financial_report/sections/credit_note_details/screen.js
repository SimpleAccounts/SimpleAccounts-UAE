import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FilterComponent3 from '../filterComponent3';
import {
	Card,
	CardHeader,
	CardBody,
	Row,
	Col,
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
import FilterComponent2 from '../filterComponet2';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { ReportTables } from 'screens/financial_report/sections'


const mapStateToProps = (state) => {
	return {
		company_profile: state.reports.company_profile,
		creditnote_details: state.reports.creditnote_details,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		financialReportActions: bindActionCreators(FinancialReportActions, dispatch),
	};
};
let strings = new LocalizedStrings(data);

class CreditNoteDetailsReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			customPeriod: 'customRange',
			hideAsOn: true,
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
			totalSR: 0,
			totalBal: 0,
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
			.getCreditNoteDetails(postData)
			.then((res) => {
				if (res.status === 200) {
					let creditNoteSummaryModelList = [];
					let creditNoteTotalAmount = 0;
					let totalBalance = 0;
					let id = 0;
					res.data.creditNoteSummaryModelList.map((row, i) => {
						if (row.type === 7) {
							row.id = i + 1;
							creditNoteTotalAmount = creditNoteTotalAmount + row.creditNoteTotalAmount;
							totalBalance = totalBalance + row.balance;
							row.creditNoteDate = row.creditNoteDate ? moment(row.creditNoteDate).format('DD-MM-YYYY') : '';
							row.status= row.status === 'Partially Paid' ?  'Partially Credited': row.status;
							id = i;
							creditNoteSummaryModelList.push(row);
							return row
						}

					})
					creditNoteSummaryModelList.push({
						creditNoteNumber: strings.Total,
						creditNoteTotalAmount: creditNoteTotalAmount,
						balance: totalBalance,
						isTotalRow: true,
						id: id + 2,
					})
					this.setState({
						creditNoteSummaryModelList: creditNoteSummaryModelList,
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
		const { creditNoteSummaryModelList } = this.state;
		const worksheet = XLSX.utils.json_to_sheet(creditNoteSummaryModelList);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Tax Credit Note Details');
		XLSX.writeFile(workbook, 'Tax Credit Note Details.csv');
	};

	exportExcelFile = () => {
		const { creditNoteSummaryModelList } = this.state;
		const worksheet = XLSX.utils.json_to_sheet(creditNoteSummaryModelList);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Tax Credit Note Details');
		XLSX.writeFile(workbook, 'Tax Credit Note Details.xlsx');
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
	hideExportOptionsFunctionality = (val) => {
		this.setState({ hideExportOptions: val });
	}

	render() {
		strings.setLanguage(this.state.language);
		const { loading, initValue, dropdownOpen, creditNoteSummaryModelList, view, customPeriod, hideAsOn } = this.state;
		const { company_profile } = this.props;

		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<Card>
						<div>
							{!this.state.hideExportOptions && 
										<div
											className="h4 mb-0 d-flex align-items-center pull-right"
											style={{ justifyContent: 'space-between', 
												marginRight:'10px', marginTop: '30px'}}
										>
											<div className="d-flex">
												<Dropdown isOpen={dropdownOpen} toggle={this.toggle} 
													style={{marginTop:'5px'}}>
													<DropdownToggle caret>Export As</DropdownToggle>
													<DropdownMenu> 
														<DropdownItem onClick={()=>{this.exportFile()}}>
															<span
																style={{
																	border: 0,
																	padding: 0,
																	backgroundColor:"white !important"
																}}
															>CSV (Comma Separated Value)
															</span>
														</DropdownItem>
														<DropdownItem onClick={()=>{this.exportExcelFile()}}>
								                        	<span
																style={{
																	border: 0,
																	padding: 0,
																	backgroundColor:"white !important"
																}}
															>Excel
															</span>
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
													style={{cursor: 'pointer'}}
												>
													<i className="fa fa-print"></i>
												</div>
												<div
													className="mr-2 print-btn-cont"
                                                    onClick={() => {
                                                        this.props.history.push('/admin/report/reports-page');
                                                    }}
													style={{cursor: 'pointer'}}
												>
													<span>X</span>
												</div>				
											</div>
										</div>
							}
							<CardHeader>
							<FilterComponent3
									hideExportOptionsFunctionality={(val) => this.hideExportOptionsFunctionality(val)}
									customPeriod={customPeriod}
									hideAsOn={hideAsOn}
									viewFilter={this.viewFilter}
									generateReport={(value) => {
										this.generateReport(value);
									}}
									setCutomPeriod={(value) => {
										this.setState({ customPeriod: value })
									}}
									handleCancel={() => {
										if (customPeriod === 'customRange') {
										const currentDate = moment();
										this.setState(prevState => ({
										initValue: {
										...prevState.initValue,
										endDate: currentDate,            }
										 }));
										this.generateReport({ endDate: currentDate });
										}
										this.setState({ customPeriod: 'customRange' });
										}}
										/>
							</CardHeader>
							<CardBody id="section-to-print">
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={1}
									paperSize="auto"
									margin={{ top: 50, left: 80, right: 80, bottom: 0 }}
									fileName="Credit Note Details.pdf"
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
												style={{ width: ' 150px' }}>
											</img>
										</div>
										<div style={{ textAlign: 'center' }} >

											<h2>
												{company_profile &&
													company_profile['companyName']
													? company_profile['companyName']
													: ''}
											</h2>
											<br style={{ marginBottom: '5px' }} />
											<b style={{ fontSize: '18px' }}>{strings.CreditNoteDetails}</b>
											<br style={{ marginBottom: '5px' }} />
											{strings.From} {(initValue.startDate).replaceAll("/", "-")} {strings.To} {initValue.endDate.replaceAll("/", "-")}

										</div>
										<div>
										</div>
									</div>
									{loading ? (
										<Loader />
									) : (

										<>
											<ReportTables
												reportDataList={creditNoteSummaryModelList}
												reportName={'Tax Credit Note Details'}
												id={9}
												rowHeight={50}
												history={this.props.history}
											/>
										</>

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

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CreditNoteDetailsReport);