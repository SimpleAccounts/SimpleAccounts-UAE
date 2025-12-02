import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Col,
	Card,
	CardHeader,
	CardBody,
	Row,
} from 'reactstrap';
import { AuthActions, CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss';
import * as VatreportAction from './actions';
import logo from 'assets/images/brand/logo.png';
import moment from 'moment';
import * as FinancialReportActions from '../../../../actions';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { AgGridReact, AgGridColumn } from 'ag-grid-react/lib/agGridReact';
import { Currency } from 'components';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const mapStateToProps = (state) => {
	return {
		version: state.common.version,
		company_profile: state.reports.company_profile,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		vatreport: bindActionCreators(VatreportAction, dispatch),
		financialReportActions: bindActionCreators(
			FinancialReportActions,
			dispatch,
		),
	};
};


class VatPaymentRecord extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {},
			loading: false,
			fileName: '',
			disabled: false,
			productName: '',
			version: '',
			type: '',
			upload: false,
			file_data_list: [],
			openModal: false,
			vatReportDataList: 
				[
					{
					taxReturns:"Sept 2021",dateOfFiling:"1st Jan 2022",amountPaid:3600,amountReclaimed:"---"
					},
					{
					taxReturns:"Oct 2021",dateOfFiling:"1st Jan 2022",amountPaid:"---",amountReclaimed:7300},
					{
					taxReturns:"Nov 2021",dateOfFiling:"1st Jan 2022",amountPaid:"---",amountReclaimed:3500},
					{
					taxReturns:"Dec 2021",dateOfFiling:"1st Jan 2022",amountPaid:5000,amountReclaimed:"---"
					}
				],
				paginationPageSize:10,
			
		};

		this.options = {
			// onRowClick: this.goToDetail,
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		};
	}
	onPageSizeChanged = (newPageSize) => {
		var value = document.getElementById('page-size').value;
		this.gridApi.paginationSetPageSize(Number(value));
	};

	onGridReady = (params) => {
		this.gridApi = params.api;
		this.gridColumnApi = params.columnApi;
	};

	onSizePerPageList = (sizePerPage) => {
		if (this.options.sizePerPage !== sizePerPage) {
			this.options.sizePerPage = sizePerPage;
			this.getInitialData();
		}
	};

	onPageChange = (page, sizePerPage) => {
		if (this.options.page !== page) {
			this.options.page = page;
			this.getInitialData();
		}
	};
    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.gridApi.paginationSetPageSize(Number(value));
      };

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
      };
      
    onBtnExport = () => {
        this.gridApi.exportDataAsCsv();
      };

    onBtnExportexcel= () => {
        this.gridApi.exportDataAsExcel();
      };

	componentDidMount = () => {
		this.getInitialData();
		this.props.financialReportActions.getCompany();
	};

	getInitialData = () => {
		let { filterData } = this.state;
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options?.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };
		this.props.vatreport
			.getVatPaymentHistoryList(postData)
			.then((res) => {
				if (res.status === 200) {
					
					this.setState({ vatReportDataList: res.data}) // comment for dummy
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	renderDate = (cell, row) => {
		return cell ? moment(cell)
			.format('DD-MM-YYYY') 
			// .format('LL')
			: '-';
	};

	renderAmount = (amount, params) => {
		if (amount != null && amount != 0)
			return (
				<>
					<Currency
						value={amount}
						currencySymbol={params.currency}
					/>
				</>
			)
		else
			return ("---")
	}

	renderVATNumber = (cell, row) => {
    return <>{row.vatNumber}</>;
  };
	
	renderTaxReturns = (cell, row) => {
		let dateArr = cell ? cell.split(" ") : [];
		let startDate = moment(dateArr[0]).format('DD-MM-YYYY')
		let endDate = moment(dateArr[1]).format('DD-MM-YYYY')
		return (<>{dateArr[0].replaceAll("/","-")}</>);
	};

	render() {
		const { vatReportDataList } = this.state;
		const { company_profile} = this.props;
		return (
			<div className="import-bank-statement-screen">
				<div className="animated fadeIn">
					<Card>
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
												<i className="fa fa-history mr-2"></i>VAT Payment Record
											</p>
										</div>
										<div className="d-flex">

											<Button
												className="mr-2 print-btn-cont"
												onClick={() => {
													this.props.history.push('/admin/report/vatreports');
												}}
												style={{cursor: 'pointer'}}
											>
												<span>X</span>
											</Button>

										</div>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							
							<div style={{										
									// display: 'flex',
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
												: 'ABC GROUP'}
											</h2>	
											<br style={{ marginBottom: '5px' }} />
											<b style ={{ fontSize: '18px'}}>VAT Payment Record</b>
											<br style={{ marginBottom: '5px' }} />
											<br/>
										
										
											
									</div>
									
								
							</div>
							{/* <div className="ag-theme-alpine mb-3" style={{ height: 600, width: "100%" }}>
								
								<AgGridReact
									rowData={
										vatReportDataList
											? vatReportDataList
											: []}
									pagination={true}
									rowSelection="multiple"
									paginationPageSize={this.state.paginationPageSize}
									floatingFilter={true}
									defaultColDef={{
										resizable: true,
										flex: 1,
										sortable: true
									}}
									sideBar="columns"
									onGridReady={this.onGridReady}
								>

									<AgGridColumn field="taxReturns"
										headerName="VAT Return"
										sortable={true}
										filter={true}
										// checkboxSelection={true}
										enablePivot={true}
										cellRendererFramework={(params) =>
											<>
												{this.renderTaxReturns(params.value, params)}
											</>
										}
									></AgGridColumn>

									<AgGridColumn field="dateOfFiling"
										headerName="Date Of Filing"
										sortable={true}
										filter={true}
										enablePivot={true}	
										cellRendererFramework={(params) =>
											<>
												{this.renderDate(params.value, params)}
											</>
										}							
									></AgGridColumn>

									<AgGridColumn field="amountPaid"
										headerName="Amount Paid"
										sortable={true}
										filter={true}
										enablePivot={true}
										cellRendererFramework={(params) =>
											<>
												{this.renderAmount(params.value, params)}
											</>
										}	
									></AgGridColumn>

									<AgGridColumn field="amountReclaimed"
										headerName="Amount Reclaimed"
										sortable={true}
										enablePivot={true}
										filter={true}
										cellRendererFramework={(params) =>
											<>
												{this.renderAmount(params.value, params)}
											</>
										}
						
									></AgGridColumn>

								</AgGridReact>
								<div className="example-header mt-1">
									Page Size:
									<select onChange={() => this.onPageSizeChanged()} id="page-size">
										<option value="10" selected={true}>
											10
										</option>
										<option value="100">100</option>
										<option value="500">500</option>
										<option value="1000">1000</option>
									</select>
								</div>
							</div> */}
							
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}										
												options={this.options}
												version="4"
												hover
												responsive												
												remote
												// data={vatReportDataList && vatReportDataList.data ? vatReportDataList.data : []}
												// data={vatReportDataList ? vatReportDataList : []}										
												data={vatReportDataList.data ? vatReportDataList.data : []}
												pagination={
													vatReportDataList &&
													vatReportDataList.data &&
													vatReportDataList.data.length
														? true
														: false
												}											
												fetchInfo={{
													dataTotalSize: vatReportDataList.count
														? vatReportDataList.count
														: 0,
												}}											
												>
														<TableHeaderColumn
															tdStyle={{ whiteSpace: "normal" }}
															isKey
															dataField="vatNumber"
															dataSort
															className="table-header-bg"
														>
															VAT Report No.
														</TableHeaderColumn>
														<TableHeaderColumn
															tdStyle={{ whiteSpace: 'normal' }}
															// isKey
															dataField="taxReturns"
															dataSort
														    dataFormat={this.renderTaxReturns}
															className="table-header-bg"
														>
															VAT Return
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="dateOfFiling"
															// columnTitle={this.customEmail}
															dataSort
															dataFormat={this.renderDate}
															className="table-header-bg"
														>
															Date of Filing
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="amountPaid"
															// columnTitle={this.customEmail}
															dataSort
															dataFormat={this.renderAmount}
															className="table-header-bg"
														>
															Amount Paid
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="amountReclaimed"
															// columnTitle={this.customEmail}
															dataSort
															dataFormat={this.renderAmount}
															className="table-header-bg"
														>
															Amount Reclaimed
														</TableHeaderColumn>
																			
											</BootstrapTable>
										</div>

						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(VatPaymentRecord);
