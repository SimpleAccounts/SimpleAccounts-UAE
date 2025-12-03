import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
import { ReportTables } from 'screens/financial_report/sections'
import moment from 'moment';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as XLSX from 'xlsx';
import FilterComponent from './sections/filterComponent';
import { Loader } from 'components';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import * as ExpenseDetailsActions from './actions';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import FilterComponent3 from '../filterComponent3';


const mapStateToProps = (state) => {
	return {
		company_profile: state.reports.company_profile,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		expenseDetailsActions: bindActionCreators(
			ExpenseDetailsActions,
			dispatch,
		),
	};
};
let strings = new LocalizedStrings(data);
class ExpenseDetailsReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			dropdownOpen: false,
			customPeriod: 'customRange',
			hideAsOn: true,
			expenseDetailsList: {},
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
			chart_of_account_list: [],
		};
	}

	componentDidMount = () => {
		this.props.expenseDetailsActions.getCompany()
		this.initializeData();

	};

	initializeData = () => {
		const { initValue } = this.state;
		const postData = {
			startDate: initValue.startDate,
			endDate: initValue.endDate,
		};
		this.props.expenseDetailsActions
			.getExpenseDetails(postData)
			.then((res) => {
				if (res.status === 200) {
					let expenseSummaryModelModelList = res.data.expenseSummaryModelModelList
					expenseSummaryModelModelList.push({
						amountWithoutTax: res.data.totalAmountWithoutTax,
						expenseAmount: res.data.totalAmount,
						expenseVatAmount: res.data.totalVatAmount,
						transactionCategoryName: strings.Total,
						isTotalRow: true,
					})
					expenseSummaryModelModelList = expenseSummaryModelModelList.map((row, i) => {
						row.id = i + 1;
						return row
					})
					this.setState({
						expenseSummaryModelModelList: expenseSummaryModelModelList,
						loading: false,
					});
				}
			}).catch((err) => {
				this.setState({ loading: false });
			});
	};

	exportFile = () => {
		const { expenseSummaryModelModelList } = this.state;
		const worksheet = XLSX.utils.json_to_sheet(expenseSummaryModelModelList);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Expense Details');
		XLSX.writeFile(workbook, 'Expense Details.csv');
	};

	exportExcelFile = () => {
		const { expenseSummaryModelModelList } = this.state;
		const worksheet = XLSX.utils.json_to_sheet(expenseSummaryModelModelList);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Expense Details');
		XLSX.writeFile(workbook, 'Expense Details.xlsx');
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
	hideExportOptionsFunctionality = (val) => {
		this.setState({ hideExportOptions: val });
	}
	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			initValue,
			dropdownOpen,
			expenseSummaryModelModelList,
			view,
			hideAsOn,
			customPeriod,
			chart_of_account_list,
		} = this.state;
		const { company_profile } = this.props;

		console.log(this.state.expenseDetailsList)
		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					<Card>
						<div>
						{!this.state.hideExportOptions &&
										<div
											className="h4 mb-0 d-flex align-items-center pull-right"
											style={{ justifyContent: 'space-between',marginRight: '20px', marginTop: '55px' }}
										>
											<div className="d-flex">

												<Dropdown isOpen={dropdownOpen} toggle={this.toggle}>
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
									scale={0.8}
									paperSize="A3"
									fileName="Expense Details.pdf"
								>

									<div style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: '1rem'
									}}>
										<div className="logo-container" style={{
											width: '150px',
										}}>
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
										<div className="text-center" style={{ justifyContent: 'center' }} >

											<h2>
												{company_profile &&
													company_profile['companyName']
													? company_profile['companyName']
													: ''}
											</h2>
											<div className="ml-4" >
												<br style={{ marginBottom: '5px' }} />
												<b style={{ fontSize: '18px' }}>{strings.Expense + " " + strings.Details}</b>
												<br style={{ marginBottom: '5px' }} />

												{customPeriod === 'asOn' ? `${strings.Ason} ${initValue.endDate.replaceAll("/", "-")}`
											 : `${strings.From} ${initValue.startDate.replaceAll("/", "-")} to ${initValue.endDate.replaceAll("/", "-")}`}
										
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
											reportDataList={expenseSummaryModelModelList}
											reportName={'Expense Details'}
											id={3}
											rowHeight={50}

										/>
									</>
									)}
									<div style={{ textAlignLast: 'center' }}> {strings.PoweredBy}<b>SimpleAccounts</b></div>
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
)(ExpenseDetailsReport);
