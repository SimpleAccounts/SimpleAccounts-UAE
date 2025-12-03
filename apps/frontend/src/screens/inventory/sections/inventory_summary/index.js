import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	Button,
	FormGroup,
	Form,
	ButtonGroup,
} from 'reactstrap';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import * as ProductActions from '../../../product/actions';
import moment from 'moment';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
// import 'react-select/dist/react-select.css'
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Loader  } from 'components';
import * as InventoryActions from '../../actions';
import logo from 'assets/images/brand/logo.png';
import { CommonActions } from 'services/global';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { InventoryHistoryModal } from './sections';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const mapStateToProps = (state) => {
	return {
		summary_list: state.inventory.summary_list,
		vat_list: state.product.vat_list,
		universal_currency_list: state.common.universal_currency_list,
		company_profile: state.common.company_profile,

	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		productActions: bindActionCreators(ProductActions, dispatch),
		inventoryActions: bindActionCreators(InventoryActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class InventorySummary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			dropdownOpen: false,
			view: false,
			initValue: {
				startDate: moment().startOf('month').format('DD/MM/YYYY'),
				// endDate: moment().endOf('month').format('DD/MM/YYYY'),
				endDate: moment().local().format('DD-MM-YYYY'),
				
			},
			openModal:false,
			csvData: [],
			inventory_history_list:[],
			activePage: 1,
			sizePerPage: 10,
			totalCount: 0,
			paginationPageSize:10,
			sort: {
				column: null,
				direction: 'desc',
			},
			
		};
		this.options = {
			onRowClick: this.goToDetail,
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		}; 
		this.columnHeader = [
			{ label: 'Account', value: 'Account', sort: true },
			{ label: 'Account Code', value: 'Account Code', sort: false },
			{ label: 'Total', value: 'Total', sort: false },
		];
	}
	
		
	renderName=(cell,row)=>{
		return (<span>{cell ? cell : "-"}</span>);

	}
	generateReport = (value) => {
		this.setState(
			{
				initValue: {
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
	viewPaySlip = (data) => {
		//getSalarySlip
		// this.props.employeeViewActions
		// 	.getSalarySlip(data)
		// 	.then((res) => {
		//         if (res.status === 200) {
		// 		// this.initializeData();


		// 			this.setState({

		// 			});

		//     }})
		// 	.catch((err) => {
		// 		this.props.commonActions.tostifyAlert(
		// 			'error',
		// 			err && err.data ? err.data.message : 'Something Went Wrong',
		// 		);
		// 	});
		this.setState({
			openModal: true
		})

	}
	componentDidMount = () => {
		this.initializeData();
		this.props.commonActions.getCompany() 
	};
	closeModal = (res) => {
		this.setState({ openModal: false });
	};
	initializeData = (search) => {
		const { filterData } = this.state;
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage,
		};
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = { ...filterData, ...paginationData, ...sortingData };
		this.props.inventoryActions
			.getProductInventoryList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ loading: false });
				}
			})
			.catch((err) => {
				this.setState({ loading: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};
	
	exportFile = (csvData, fileName, type) => {
		const fileType =
			type === 'xls'
				? 'application/vnd.ms-excel'
				: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
		const fileExtension = `.${type}`;
		const ws = XLSX.utils.json_to_sheet(csvData);
		const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
		const excelBuffer = XLSX.write(wb, { bookType: type, type: 'array' });
		const data = new Blob([excelBuffer], { type: fileType });
		FileSaver.saveAs(data, fileName + fileExtension);
	};
	onSizePerPageList = (sizePerPage) => {
		if (this.options.sizePerPage !== sizePerPage) {
			this.options.sizePerPage = sizePerPage;
			this.initializeData();
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
	onPageChange = (page, sizePerPage) => {
		if (this.options.page !== page) {
			this.options.page = page;
			this.initializeData();
		}
	};
	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
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
	param = (row) => {
		const data = {
			p_id: row[0].p_id ,
			s_id: row[1].s_id,
		};
		this.props.productActions.getInventoryHistory(data).then((response) => {
			if (response.status ===200) {
				this.setState({
					exist: true,
				});
			} else {
				this.setState({
					exist: false,
				});
			}
		});
		this.props.history.push('/admin/master/product/detail/inventoryhistory');
	};
	// renderActions = (cell, row) => {
	// 	return (
	// 		<Row>
	// 		<div>
	// 			<Button
	// 			className="btn btn-sm pdf-btn"
	// 			// onClick={(e, ) => {
	// 			// 	this.props.history.push('/admin/master/product/detail/inventoryedit', { id: row.inventoryId });
	// 			// }}
	// 			>
	// 				<a href ="#"
	// 										onClick={() =>
	// 								this.props.history.push('/admin/master/product/detail/inventoryedit'),{ id: row.inventoryId }}
	// 							>
	// 								<i className="far fa-edit fa-lg"></i>
	// 							</a>
				
	// 			</Button>
	// 		</div>
	// 		<div>
	// 		<Button
	// 			className="btn btn-sm pdf-btn ml-3"
				
				
	// 			>
	// 					<a href ="#"
	// 										onClick={(e) => {		
	// 											this.param([{p_id:row.productId},{s_id:row.supplierId}]);
										
	// 									}}
	// 							>
	// 								<i className="fa fa-history fa-lg"></i>
	// 							</a>
			
	// 			</Button>
	// 		</div>
	// 		</Row>
			
			
	// 	);
	// };


	renderActions = (cell, row) => {
		return (
			<div>
				<Button
				className="btn btn-lg "
				style={{padding:"0px"}}
				 color="link"
					onClick={() => {
						if(row.supplierId !== null && row.productId !== null){
							this.props.productActions.getInventoryHistory({p_id:row.productId,s_id:row.supplierId}).then((res) => {
								if (res.status === 200) {
									this.setState({

										inventory_history_list:res.data,
											});

								}
							})
							.catch((err) => {
								this.props.commonActions.tostifyAlert(
									'error',

									err && err.data ? err.data.message : 'Something Went Wrong',
								);
							});

						
				
							
						this.viewPaySlip({ });
						}//if
						else {
							this.props.commonActions.tostifyAlert(
								'success',"Sorry , No supplier Available to View Inventory History List")
						}
					}

					}
				>
						<i className="fa fa-history fa-lg"></i> 
						</Button>

			</div>
		);
	};

	getActionButtons = (params) => {
		return (
	<>
	{/* BUTTON ACTIONS */}
			{/* View */}
			<div>
				<Button
				className="btn btn-lg "
				style={{padding:"0px"}}
				 color="link"
					onClick={() => {
						if(params.data.supplierId !== null && params.data.productId !== null){
							this.props.productActions.getInventoryHistory({p_id:params.data.productId,s_id:params.data.supplierId}).then((res) => {
								if (res.status === 200) {
									this.setState({

										inventory_history_list:res.data,
											});

								}
							})
							.catch((err) => {
								
							});

						
				
							
						this.viewPaySlip({ });
						}//if
						else {
							this.props.commonActions.tostifyAlert(
								'success',"Sorry , No supplier Available to View Inventory History List")
						}
					}

					}
				>
						<i className="fa fa-history fa-lg"></i> 
						</Button>

			</div>
	</>
		)
	}
	render() {
		strings.setLanguage(this.state.language);
		const { loading, initValue} = this.state;
		const { summary_list,company_profile} = this.props;

		return (
			<div className="transactions-report-screen">
				<div className="animated fadeIn">
					
						<div id="section-to-print">
			
							
						
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A4"
								><br/>
								<br/>
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
										
											<b style ={{ fontSize: '18px'}}>{strings.InventorySummary}</b>
											<br/>
											<br/>
										
											As on {initValue.endDate.replaceAll("/","-")}
											
									</div>
									
									<div>
									<Form onSubmit={this.handleSubmit} name="simpleForm">
								<div className="flex-wrap d-flex justify-content-end">
									<FormGroup>
										<ButtonGroup className="mr-3">
											<Button
												color="primary"
												className="btn-square"
												onClick={() => this.table.handleExportCSV()}
											>
												<i className="fa glyphicon glyphicon-export fa-download mr-1" />
												{strings.Export}
											</Button>
										</ButtonGroup>
									</FormGroup>
									</div>
									</Form>
										</div>
							</div>
									{loading ? (
										<Loader />
									) : (
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												data={
													summary_list && summary_list.data
														? summary_list.data
														: []
												}
												version="4"
												hover
												pagination={
													summary_list &&
													summary_list.data &&
													summary_list.data.length > 0
														? true
														: false
												}
												remote
												fetchInfo={{
													dataTotalSize: summary_list.count
														? summary_list.count
														: 0,
												}}
												className="product-table"
												trClassName="cursor-pointer"
												csvFileName="Inventory Summary List.csv"
												ref={(node) => (this.table = node)}
											>
										<TableHeaderColumn dataField="productCode" dataSort className="table-header-bg">
												{strings.PRODUCTCODE}
												</TableHeaderColumn>

												<TableHeaderColumn isKey dataField="productName" dataSort className="table-header-bg">
												{strings.PRODUCTNAME}
												</TableHeaderColumn >
										
												<TableHeaderColumn  dataField="purchaseOrder" dataSort className="text-center table-header-bg" columnClassName="text-center">
												{strings.ORDERQUANTITY}
												</TableHeaderColumn >

												<TableHeaderColumn  dataField="quantitySold" dataSort className="text-center table-header-bg" columnClassName="text-center">
												{strings.QUANTITYSOLD}
												</TableHeaderColumn >

												<TableHeaderColumn  dataField="stockInHand" dataSort className="text-center table-header-bg" columnClassName="text-center">
												{strings.STOCKINHAND}
												</TableHeaderColumn >

												<TableHeaderColumn  dataField="supplierName" dataFormat={this.renderName} dataSort className="text-center table-header-bg" columnClassName="text-center">
												{strings.SUPPLIERNAME}
												</TableHeaderColumn >

												<TableHeaderColumn
												className="text-right table-header-bg"
												columnClassName="text-right"
												dataFormat={this.renderActions}
												dataField="purchaseOrder"
											    >
												</TableHeaderColumn>
											</BootstrapTable>
										</div>)}
										
								
									<div style={{ textAlignLast:'right'}}> {strings.PoweredBy} <b>SimpleAccounts</b></div> 
								</PDFExport>
								</div>
						
						<InventoryHistoryModal
					openModal={this.state.openModal}
					closeModal={(e) => {
						this.closeModal(e);
					}}
					// id={this.state.rowId}
					 inventory_history_list={this.state.inventory_history_list}
				/>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InventorySummary);
