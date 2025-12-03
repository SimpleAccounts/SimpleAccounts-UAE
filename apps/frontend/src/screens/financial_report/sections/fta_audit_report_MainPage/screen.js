import React from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import {
	Button,
	Col,
	FormGroup,
	Card,
	CardHeader,
	CardBody,
	Row,
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';
import { AuthActions, CommonActions } from 'services/global';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss';
import * as FTAreport from './actions';
import { isDate, upperFirst } from 'lodash-es';
import GenerateFTAreport from './sections/generateFTAauditFile'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import moment from 'moment';
import download from 'downloadjs';
import { AgGridReact, AgGridColumn } from 'ag-grid-react/lib/agGridReact';
import { ConfirmDeleteModal, Currency } from 'components';
import {data}  from '../../../Language/index';
import VatSettingModal from './sections/vatSettingModal';


import LocalizedStrings from 'react-localization';
const mapStateToProps = (state) => {
	return {
		version: state.common.version,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		ftaReport: bindActionCreators(FTAreport, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class FtaAuditReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			initValue: {},
			loading: false,
			fileName: '',
			actionButtons:{},
			disabled: false,
			file_data_list: [],
			openModal: false,
			openVatSettingModal: false,
			openGenerateModal:false,
			openFileTaxRetrunModal: false,
			coaName: '',
			ftaAuditReporttDataList: [ ],
			paginationPageSize: 10,
			dialog: false,
			current_report_id: '',
			deleteModal:false,
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

	onBtnExport = () => {
		this.gridApi.exportDataAsCsv();
	};

	onBtnExportexcel = () => {
		this.gridApi.exportDataAsExcel();
	};
	componentDidMount = () => {
		this.getInitialData();
	};

	markItUnfiled=(row)=>{
		const postingRequestModel = {
			postingRefId: row.id,
			postingRefType: 'PUBLISH',
		};
		this.props.ftaReport
			.markItUnfiled(postingRequestModel)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data && res.data.message?res.data.message: 
						' VAT UnFiled Successfully'
					);
					this.getInitialData()
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	}

	getInitialData = () => {
		let { filterData } = this.state;
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };
		this.props.ftaReport
			.getVatReportList(postData)
			.then((res) => {
				if (res.status === 200) {
					let arrayList={};
					arrayList.count=res.data.count;
					if(res.data?.data && res.data?.data.length && res.data?.data.length !=0)
						arrayList.data=res.data?.data.filter((row)=>row.status!="UnFiled")
					
					 this.setState({ ftaAuditReporttDataList: arrayList }) // comment for dummy
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	export = (filename) => {
		this.props.ftaReport
			.downloadcsv(filename)
			.then((res) => {
				if (res.status === 200) {
					const blob = new Blob([res.data], { type: 'application/csv' });
					download(blob, filename)
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	}
	handleChange = (key, val) => {
		this.setState({
			[key]: val,
		});
	};



	closeModal = (res) => {
		this.setState({ openModal: false });
	};
	closeVatSettingModal = (res) => {
		this.setState({ openVatSettingModal: false });
	};

	closeFileTaxRetrunModal = (res) => {
		this.setState({ openFileTaxRetrunModal: false });
	};
	closeDeleteModal = (res) => {
		this.setState({ deleteModal: false });
	};


	showHeader = (s) => {
		return upperFirst(s.replace(/([a-z])([A-Z])/g, '$1 $2'));
	}
	toggleActionButton = (index) => {
		let temp = Object.assign({}, this.state.actionButtons);
		if (temp[parseInt(index, 10)]) {
			temp[parseInt(index, 10)] = false;
		} else {
			temp[parseInt(index, 10)] = true;
		}
		this.setState({
			actionButtons: temp,
		});
	};

	getActionButtons = (cell,params) => {
		return (
// DROPDOWN ACTIONS

		<ButtonDropdown
			isOpen={this.state.actionButtons[params.id]}
			toggle={() => this.toggleActionButton(params.id)}
		>
			<DropdownToggle size="sm" color="primary" className="btn-brand icon">
				{this.state.actionButtons[params.id] === true ? (
					<i className="fas fa-chevron-up" />
				) : (
					<i className="fas fa-chevron-down" />
				)}
			</DropdownToggle>
			
	{/* Menu start */}
		<DropdownMenu right >
			
		{/* View */}
			
			<DropdownItem
		
			onClick={() => {
				this.setState({current_report_id:params.id})
				let dateArr = params.taxReturns ? params.taxReturns.split("-") : [];
				this.props.history.push('/admin/report/ftaAuditReports/view', {startDate:dateArr[0],endDate:dateArr[1],userId:params.userId,	companyId:1, taxAgencyId:params.taxAgencyId})
			}}
				
				>
				<i className="fas fa-eye" /> View
			</DropdownItem>	
			
			<DropdownItem
				onClick={() => {	
					this.delete(params.id)
				}}
				>
				<i className="fas fa-trash" /> Delete
			</DropdownItem>
			
			
		
		</DropdownMenu>
	</ButtonDropdown>
	// <>

	
	
		)

	}


// 	getActionButtons = (params) => {

// 		return (
// 	<>	
// 	{/* BUTTON ACTIONS */}
// 			<Button
// 				className="Ag-gridActionButtons"
// 				title='download'
// 				color="secondary"
// 				className="btn-sm"
// 				onClick={() => {
					
// 					this.setState({current_report_id:params.data.id})
// 					let dateArr = params.data.taxReturns ? params.data.taxReturns.split("-") : [];
// 					this.props.history.push('/admin/report/ftaAuditReports/view', {startDate:dateArr[0],endDate:dateArr[1],userId:params.data.userId,	companyId:1, taxAgencyId:params.data.taxAgencyId})

// 					// const postData = {
// 					// 	startDate:dateArr[0],
// 					// 	endDate:dateArr[0],
// 					// 	userId:params.data.userId,
// 					// 	companyId:1
// 					// };
// 					// this.props.ftaReport
// 					// .getFtaAuditReport(postData)
// 					// .then((res) => {
// 					// 	 
// 					// 	if (res.status === 200) {
// 					// 		const blob = new Blob([res.data], { type: 'application/csv' });
// 					// 		download(blob,params.data.taxReturns+".csv" )
// 					// 		this.props.commonActions.tostifyAlert(
// 					// 			'success',
// 					// 			'Downloaded Successfully',
// 					// 		);
// 					// 	}
// 					// })
// 					// .catch((err) => {
// 					// 	this.props.commonActions.tostifyAlert(
// 					// 		'error',
// 					// 		err && err.data ? err.data.message : 'Something Went Wrong',
// 					// 	);
// 					// });
// 				}}
// 			>	<i className="fas fa-eye"></i>  </Button>

// <Button
// 				className="Ag-gridActionButtons btn-sm ml-2"
// 				title='download'
// 				color="secondary"
// 				onClick={() => {	
// 				this.delete(params.data.id)
// 				}}
// 			>	<i className="fas fa-trash"></i>  </Button>

// 	</>
// 		)

// 	}

	renderStatus = (params) => {
		return (
			<>
				{params.value === "UnFiled" ? (<label className="badge label-draft"> {params.value}</label>) : ""}
				{params.value === "Filed" ? (<label className="badge label-due"> {params.value}</label>) : ""}
				{params.value === "Partially Paid" ? (<label className="badge label-PartiallyPaid"> {params.value}</label>) : ""}
				{params.value === "Paid" ? (<label className="badge label-paid"> {params.value}</label>) : ""}
				{params.value === "Reclaimed" ? (<label className="badge label-sent"> {params.value}</label>) : ""}
			</>
		)
	}

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
	renderBalanceAmount = (amount, params) => {
		if (amount != null)
		{
			return (
				<label className="badge label-due">
					<Currency
						value={amount}
						currencySymbol={params.currency}
					/>
				</label>

			)
		}
			
		else
			return ("---")
	}


	delete = (id) => {
		const message1 =
			<text>
				<b>Delete VAT Report File ?</b>
			</text>
		const message = 'This vat report file will be deleted permanently and cannot be recovered. ';
		
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={()=>this.remove(id)}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};

	remove = (current_report_id) => {
		this.props.ftaReport
			.deleteReportById(current_report_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data && res.data.message?res.data.message: 
						'VAT Report File Deleted Successfully'
					);
					this.setState({
						dialog: null,
					});
					this.getInitialData()
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err?.data ? err?.data?.message : 'VAT Report File Deleted Unsuccessfully'
				);
				this.setState({
					dialog: null,
				});
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	renderDate = (cell, row) => {
		
		return cell ? moment(cell)
			.format('DD-MM-YYYY') 
			// .format('LL')
			: '-';
	};

	renderEnd = (cell, row) => {
		let dateArr = cell ? cell.split("-") : [];


		return (<>{dateArr[1].replaceAll("/","-")}</>);
	};
	renderStartDate = (cell, row) => {
		let dateArr = cell ? cell.split("-") : [];

		return (<>{dateArr[0].replaceAll("/","-")}</>);
	};
	render() {
		strings.setLanguage(this.state.language);
		var { ftaAuditReporttDataList, csvFileNamesData, dialog, options } = this.state;


		return (
			<div className="import-bank-statement-screen">
				<GenerateFTAreport openModal={this.state.openGenerateModal} closeModal={()=>{this.setState({openGenerateModal:false})}}/>
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
													fontSize: '1.3rem',
													paddingLeft: '15px',
												}}
												
											>
												{strings.FTA_Audit_Report}
											</p>
										</div>
										<div>

											<Button
												className="mr-2 btn btn-danger"
												onClick={() => {
													this.props.history.push('/admin/report/reports-page');
												}}
												style={{
													cursor: 'pointer',
												}}
											>
												<span>X</span>
											</Button>

										</div>
									</div>
								</Col>
							</Row>
						</CardHeader>
						{dialog}


						<CardBody>
							{/* <div
							style={{width:'100%',display:'flex',justifyContent: 'flex-end'}}
							>
								<Button color="primary"
								onClick={()=>{this.setState({openGenerateModal:true})}}
								>Create a FTA VAT Audit File</Button></div>  */}
						
							<Row>
								<Col lg={12} className="mb-5">
									<div className="table-wrapper">
										<FormGroup className="text-center">
											 <Button color="primary" className="btn-square  pull-right"
												onClick={() => {
													this.setState({openGenerateModal:true})
												}}>
												<i className="fas fa-plus"></i> Create FTA Audit Report
											</Button>
											<Button color="primary" className="btn-square  pull-right"
												onClick={() => {
													this.setState({ openVatSettingModal: true })
												}}>
												<i className="fa"></i>Company Details
											</Button> 
										</FormGroup>
									</div>
								</Col>
							</Row>

							{/* <div className="ag-theme-alpine mb-3" style={{ height: 550, width: "100%" }}>

								<AgGridReact

									rowData={
										ftaAuditReporttDataList
											? ftaAuditReporttDataList
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
										headerName={strings.Audit_Start_Date}
										sortable={true}
										filter={true}
										// checkboxSelection={true}
										enablePivot={true}

										cellRendererFramework={(params) =>
											<>
												{this.renderStartDate(params.value, params)}
											</>
										}
									></AgGridColumn>
									<AgGridColumn field="taxReturns"
										headerName={strings.Audit_End_Date}
										sortable={true}
										filter={true}
										// checkboxSelection={true}
										enablePivot={true}

										cellRendererFramework={(params) =>
											<>
												{this.renderEnd(params.value, params)}
											</>
										}
									></AgGridColumn>
									<AgGridColumn field="createdDate"
										headerName={strings.Created_Date}
										sortable={true}
										enablePivot={true}
										filter={true}
										cellRendererFramework={(params) =>
											<>
												{this.renderDate(params.value, params)}
											</>
										}
									></AgGridColumn>

									<AgGridColumn
										headerName={strings.Created_By}
										field="createdBy"
										sortable={true}
										enablePivot={true}
										filter={true}			
									></AgGridColumn>

									<AgGridColumn field="action"
										// className="Ag-gridActionButtons"
										headerName={strings.action}
										cellRendererFramework={(params) =>
											
												this.getActionButtons(params)
											

										}
									></AgGridColumn>
								</AgGridReact>
								<div className="example-header mt-1">
									{strings.page_size}
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
												data={ftaAuditReporttDataList && ftaAuditReporttDataList.data ? ftaAuditReporttDataList.data : []}
												// data={vatReportDataList.data ? vatReportDataList.data : []}										
												// rowData={vatReportDataList.data ? vatReportDataList.data : []}
												pagination={
													ftaAuditReporttDataList &&
													ftaAuditReporttDataList.data &&
													ftaAuditReporttDataList.data.length
														? true
														: false
												}											
												fetchInfo={{
													dataTotalSize: ftaAuditReporttDataList.count
														? ftaAuditReporttDataList.count
														: 0,
												}}											
												>
												<TableHeaderColumn
													tdStyle={{ whiteSpace: 'normal' }}
													width='23%'
													isKey
													dataField="taxReturns"
													dataSort
													dataFormat={this.renderStartDate}
													className="table-header-bg"
												>
													{strings.Audit_Start_Date}
												</TableHeaderColumn>							
												<TableHeaderColumn
													width='23%'
													dataField="taxReturns"
													dataSort
													dataFormat={this.renderEnd}
													className="table-header-bg"
												>
													{strings.Audit_End_Date}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="createdDate"
													width='23%'
													dataSort
													dataFormat={this.renderDate}
													className="table-header-bg"
												>
													{strings.Created_Date}
												</TableHeaderColumn>
												<TableHeaderColumn
													width='26%'
													dataField="createdBy"
													dataSort
													className="table-header-bg"
												>
													{strings.Created_By}
												</TableHeaderColumn>
												<TableHeaderColumn
													className="text-right table-header-bg"
													columnClassName="text-right"
													width="5%"
													dataFormat={this.getActionButtons}
												></TableHeaderColumn>
											</BootstrapTable>
										</div>

						</CardBody>
					</Card>
				</div>
				<VatSettingModal
					openModal={this.state.openVatSettingModal}
					closeModal={(e) => {
						this.closeVatSettingModal(e);
						this.getInitialData();
					}}
				/>

			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(FtaAuditReport);
