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
import moment from 'moment';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as XLSX from 'xlsx';
import FilterComponent from './sections/filterComponent';
import { Loader, Currency } from 'components';
import { ReportTables } from 'screens/financial_report/sections'
import * as ReceivbaleInvoiceDetailsActions from './actions';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import {data}  from '../../../Language/index'
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
		receivbaleInvoiceDetailsActions: bindActionCreators(
			ReceivbaleInvoiceDetailsActions,
			dispatch,
		),
	};
};
let strings = new LocalizedStrings(data);

class ReceivableInvoiceDetailsReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			dropdownOpen: false,
			customPeriod: 'customRange',
			hideAsOn: true,
			receivbaleInvoiceDetailsList: {},
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
		this.props.receivbaleInvoiceDetailsActions.getCompany() 
		this.initializeData();
	};

	initializeData = () => {
		const { initValue } = this.state;
		const postData = {
			startDate: initValue.startDate,
			endDate: initValue.endDate,
		};
		this.props.receivbaleInvoiceDetailsActions
			.getReceivableInvoiceDetail(postData)
			.then((res) => {
			 if (res.status === 200) {
				const receivbaleInvoiceDetailsList = this.getList(res.data.resultObject)
				this.setState({
					receivbaleInvoiceDetailsList: receivbaleInvoiceDetailsList,
					loading: false,
				});
			 }
			})		.catch((err) => {
				this.setState({ loading: false });
			});
	};

	getList = (receivbaleInvoiceDetailsList) => {
		const resultObject = [];
		let id = 0;
		receivbaleInvoiceDetailsList && receivbaleInvoiceDetailsList.length > 0 && receivbaleInvoiceDetailsList.map((item) => {
			const receivbaleInvoiceDetails = {
				invoiceDate: item[0]['invoiceNumber'],
				id: id,
				vatAmount: null,
				totalAmount: null,
			}
			resultObject.push(receivbaleInvoiceDetails);
			id++;

			item.map((row) => {
				const receivbaleInvoiceDetails = {
					id: id,
					invoiceDate: row.invoiceDate ? moment(row.invoiceDate).format('DD-MM-YYYY') : '',
					invoiceNumber: row.invoiceNumber,
					invoiceId: row.invoiceId,
					productName: row.productName,
					description: row.description,
					quantity: row.quantity,
					unitPrice: row.unitPrice,
					vatAmount: row.vatAmount,
					totalAmount: row.totalAmount,
				}
				resultObject.push(receivbaleInvoiceDetails);
				id++;
			})
		},)
		return resultObject;
	}
	
	
	exportFile = () => {
        const { receivbaleInvoiceDetailsList } = this.state;
        const worksheet = XLSX.utils.json_to_sheet(receivbaleInvoiceDetailsList);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Receivable Invoice Details');
        XLSX.writeFile(workbook, 'Receivable Invoice Details.csv');
    };

	exportExcelFile = () => {
        const { receivbaleInvoiceDetailsList } = this.state;
        const worksheet = XLSX.utils.json_to_sheet(receivbaleInvoiceDetailsList);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Receivable Invoice Details');
        XLSX.writeFile(workbook, 'Receivable Invoice Details.xlsx');
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
			receivbaleInvoiceDetailsList,
			view,
			chart_of_account_list,
			hideAsOn,
			 customPeriod,
		} = this.state;
		const { company_profile } = this.props;

		console.log(this.state.receivbaleInvoiceDetailsList.resultObject);
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
											scale={1}
											paperSize="auto"
											fileName="Receivable Invoice Details.pdf"
											margin={{top:0 , bottom:0 , left: 30 , right: 31 }}
										>

                                <div style={{										
									display: 'flex',
									justifyContent: 'space-between',
									marginBottom: '1rem',
									marginTop: "5rem",
									}}>
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
											<div  className="ml-4" >
												<br style={{ marginBottom: '5px' }} />
												<b style ={{ fontSize: '18px'}}>{strings.Receivable+" "+strings.Invoice+" "+strings.Details}</b>
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
												reportDataList={receivbaleInvoiceDetailsList}
												reportName={'Receivable Invoice Details'}
												id={6}
												rowHeight={50}
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
)(ReceivableInvoiceDetailsReport);
