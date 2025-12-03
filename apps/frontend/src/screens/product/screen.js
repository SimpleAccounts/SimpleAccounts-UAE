import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	ButtonGroup,
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Loader, ConfirmDeleteModal, Currency } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import * as ProductActions from './actions';
import { CommonActions } from 'services/global';
import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';
// import { AgGridReact,AgGridColumn } from 'ag-grid-react/lib/agGridReact';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const mapStateToProps = (state) => {
	return {
		product_list: state.product.product_list,
		vat_list: state.product.vat_list,
		universal_currency_list: state.common.universal_currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		productActions: bindActionCreators(ProductActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class Product extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			selectedRows: [],
			dialog: null,
			filterData: {
				name: '',
				productCode: '',
				vatPercentage: '',
			},
			selectedVat: '',
			csvData: [],
			view: false,
			actionButtons: {},
			paginationPageSize:10,
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

		this.selectRowProp = {
			//mode: 'checkbox',
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
		};
		this.csvLink = React.createRef();
	}

	componentDidMount = () => {

		this.props.productActions.getProductVatCategoryList();
		this.initializeData();
	};

	// componentWillUnmount = () => {
	// 	this.setState({
	// 		selectedRows: [],
	// 	});
	// };

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
		this.props.productActions
			.getProductList(postData)
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

	goToDetail = (row) => {
		this.props.history.push('/admin/master/product/detail', { id: row.id });
	};

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	onRowSelect = (row, isSelected, e) => {
		let tempList = [];
		if (isSelected) {
			tempList = Object.assign([], this.state.selectedRows);
			tempList.push(row.id);
		} else {
			this.state.selectedRows.map((item) => {
				if (item !== row.id) {
					tempList.push(item);
				}
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	onSelectAll = (isSelected, rows) => {
		let tempList = [];
		if (isSelected) {
			rows.map((item) => tempList.push(item.id));
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	bulkDelete = () => {
		const { selectedRows } = this.state;
		console.log(selectedRows);
		this.props.productActions
			.getInvoicesCountProduct(selectedRows)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to delete invoices to delete the product',
					);
				} else {
					const message1 =
			<text>
			<b>Delete Invoices?</b>
			</text>
			const message = 'This Invoices will be deleted permanently and cannot be recovered. ';
					if (selectedRows.length > 0) {
						this.setState({
							dialog: (
								<ConfirmDeleteModal
									isOpen={true}
									okHandler={this.removeBulk}
									cancelHandler={this.removeDialog}
									message={message}
									message1={message1}
								/>
							),
						});
					} else {
						this.props.commonActions.tostifyAlert(
							'info',
							'Please select the rows of the table and try again.',
						);
					}
				}
			});
	};

	removeBulk = () => {
		this.removeDialog();
		let { selectedRows } = this.state;
		const { product_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.props.productActions
			.removeBulk(obj)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Product Deleted Successfully',
					);
					this.initializeData();
					if (
						product_list &&
						product_list.data &&
						product_list.data.length > 0
					) {
						this.setState({
							selectedRows: [],
						});
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Product Deleted Unsuccessfully',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	vatCategoryFormatter = (cell, row) => {
		return row['vatCategory'] !== null ? row['vatCategory']['name'] : '';
	};

	handleChange = (val, name) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: val,
			}),
		});
	};

	handleSearch = () => {
		this.initializeData();
		// this.setState({})
	};

	onPageSizeChanged = (newPageSize) => {
		var value = document.getElementById('page-size').value;
		this.gridApi.paginationSetPageSize(Number(value));
	};
	onGridReady = (params) => {

		this.gridApi = params.api;
		this.gridColumnApi = params.columnApi;
	
	};
	onFirstDataRendered = (params) => {
		params.api.sizeColumnsToFit();
		this.autoSizeAll(true);
	  };

	onSizePerPageList = (sizePerPage) => {
		if (this.options.sizePerPage !== sizePerPage) {
			this.options.sizePerPage = sizePerPage;
			this.initializeData();
		}
	};

	onPageChange = (page, sizePerPage) => {
		if (this.options.page !== page) {
			this.options.page = page;
			this.initializeData();
		}
	};
	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.productActions.getProductList(obj).then((res) => {
				if (res.status === 200) {
					this.setState({ csvData: res.data.data, view: true }, () => {
						setTimeout(() => {
							this.csvLink.current.link.click();
						}, 0);
					});
				}
			});
		} else {
			this.csvLink.current.link.click();
		}
	};

	clearAll = () => {
		this.setState(
			{
				filterData: {
					name: '',
					productCode: '',
					vatPercentage: '',
				},
			},
			() => {
				this.initializeData();
			},
		);
	};

	unitPrice(cell, row, extraData) {
		return row.unitPrice === 0 ? (
			<Currency
				value={row.unitPrice}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		) : (
			<Currency
				value={row.unitPrice}
				currencySymbol={extraData[0] ? extraData[0].currencyIsoCode : 'USD'}
			/>
		);
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

	renderStatus = (cell, row) => {
        let classname = '';
        if (row.isActive === true) {
            classname = 'label-success';
        } else {
            classname = 'label-due';
        }
        return (
            <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
                {
                    row.isActive === true ?
                        "Active" :
                        "InActive"
                }
            </span>
        );
    };

	renderInventory = (cell, row) => {
        let classname = '';
        if (row.isInventoryEnabled === true) {
            classname = 'label-success';
        } else {
            classname = 'label-due';
        }
        return (
            <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
                {
                    row.isInventoryEnabled === true ?
                        "Enabled" :
                        "Disabled"
                }
            </span>
        );
    };
	exciseSlabFormatter  = (cell, row) => {
        let exciseTax='';
		if(row.exciseTaxId !=null){
			exciseTax=row.exciseTax
		}
		else{
			exciseTax="-"
		}
        return exciseTax;
    };

	goToProductDetail = (productId) => {
		
				this.props.history.push('/admin/master/product/detail', {
			id: productId,
		})
		
	}
	renderType  = (cell, row) => {
        let type='';
		if(row.exciseTaxId !=null  && row.exciseTaxId !=""){
			type="EXCISE "+row.productType
		}
		else{
			type=row.productType
		}
        return type;
    };
	productType = (cell, row) => {
		return row['producttype'] !== null ? row['producttype']['type'] : '';
	};

	renderActions = (cell, row) => {
		return (
			<div>
				<ButtonDropdown
					isOpen={this.state.actionButtons[row.id]}
					toggle={() => this.toggleActionButton(row.id)}
				>
					<DropdownToggle size="sm" color="primary" className="btn-brand icon">
						{this.state.actionButtons[row.id] === true ? (
							<i className="fas fa-chevron-up" />
						) : (
							<i className="fas fa-chevron-down" />
						)}
					</DropdownToggle>
					<DropdownMenu right>
							<DropdownItem>
								<div
									onClick={() => {
										this.props.history.push(
											'/admin/master/product/detail',
											{ id: row.id },
										);
									}}
								>
									<i className="fas fa-edit" /> {strings.Edit}
								</div>
							</DropdownItem>
					</DropdownMenu>
				</ButtonDropdown>
			</div>
		);
	};

	getActionButtons = (params) => {
		return (
	<>
	{/* BUTTON ACTIONS */}
			{/* View */}
			
			<Button
				className="Ag-gridActionButtons btn-sm"
				title='Edit'
				color="secondary"
					onClick={()=>
						this.goToProductDetail(params.data.id)  }
			
			>		<i className="fas fa-edit"/> </Button> 
	</>
		)
	}

	sizeToFit = () => {
		this.gridApi.sizeColumnsToFit();
	  };
	
	  autoSizeAll = (skipHeader) => {
		const allColumnIds = [];
		this.gridColumnApi.getAllColumns().forEach((column) => {
		  allColumnIds.push(column.getId());
		});
		this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
	  };

	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			dialog,
			filterData,
			selectedRows,
			csvData,
			view,
		} = this.state;
		const { product_list, vat_list, universal_currency_list } = this.props;

		return (
			loading ==true? <Loader/> :
<div>
			<div className="product-screen">
				<div className="animated fadeIn">
					 <div className="button-bar">
            {/* <button onClick={() => this.sizeToFit()}>Size to Fit</button>
            <button onClick={() => this.autoSizeAll(false)}>
              Auto-Size All
            </button>
            <button onClick={() => this.autoSizeAll(true)}>
              Auto-Size All (Skip Header)
            </button> */}
          </div>
					{dialog}
					{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fas fa-box" />
										<span className="ml-2">{strings.Products} </span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							{loading ? (
								<Row>
									<Col lg={12}>
										<Loader />
									</Col>
								</Row>
							) : (
								<Row>
									<Col lg={12}>
								
										<div className="d-flex justify-content-end">
											<ButtonGroup size="sm">
												{/* <Button
													color="primary"
													className="btn-square mr-1"
													onClick={() => this.getCsvData()}
												>
													<i className="fa glyphicon glyphicon-export fa-download mr-1" />
													Export To CSV
												</Button>
												{view && (
													<CSVLink
														data={csvData}
														filename={'Product.csv'}
														className="hidden"
														ref={this.csvLink}
														target="_blank"
													/>
												)} */}
												{/* <Button
													color="primary"
													className="btn-square mr-1"
													onClick={this.bulkDelete}
													disabled={selectedRows.length === 0}
												>
													<i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
													Bulk Delete
												</Button> */}
											</ButtonGroup>
											<Button
											color="primary"
											className="btn-square pull-right"
											style={{ marginBottom: '10px' }}
											onClick={() =>
												this.props.history.push(`/admin/master/product/create`)
											}
										>
											<i className="fas fa-plus mr-1" />
											{strings.AddnewProduct}
										</Button>
										
										</div>
										
										
										
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												data={
													product_list && product_list.data
														? product_list.data
														: []
												}
												version="4"
												hover
												pagination={
													product_list &&
													product_list.data &&
													product_list.data.length > 0
														? true
														: false
												}
												remote
												fetchInfo={{
													dataTotalSize: product_list.count
														? product_list.count
														: 0,
												}}
												className="product-table"
												trClassName="cursor-pointer"
												csvFileName="product_list.csv"
												ref={(node) => (this.table = node)}
											>
												<TableHeaderColumn 
													width="10%"
													dataField="productCode" 
													dataSort className="table-header-bg">
													{strings.PRODUCTCODE}
												</TableHeaderColumn>
												<TableHeaderColumn 
													tdStyle={{ whiteSpace: 'normal' }}
													width="15%"
													isKey dataField="name" 
													dataSort className="table-header-bg">
													{strings.PRODUCTNAME}
												</TableHeaderColumn >
												<TableHeaderColumn
													tdStyle={{ whiteSpace: 'normal' }}
													width="10%"
                                                    className="table-header-bg"
                                                    dataField="productType"
                                                    dataSort
                                                    dataFormat={this.renderType}
                                                    >
                                                    {strings.ProductType}

                          						</TableHeaderColumn>
												<TableHeaderColumn
													width="10%"
													dataAlign="center"
                                                    className="table-header-bg"
                                                    dataField="isInventoryEnabled"
                                                    dataSort
                                                    dataFormat={this.renderInventory}
                                                    >
                                                        {strings.Inventory}

                          						</TableHeaderColumn>
												  <TableHeaderColumn
													width="8%"
													dataAlign="right"
													dataField="unitPrice"
													dataSort
													dataFormat={this.unitPrice}
													formatExtraData={universal_currency_list}
													className="table-header-bg"
												>
													 {strings.UNITPRICE}
												</TableHeaderColumn>
												{/* <TableHeaderColumn dataField="description" dataSort> 
													Description
												</TableHeaderColumn>  */}
												<TableHeaderColumn
												tdStyle={{ whiteSpace: 'normal' }}
													width="18%"
													// dataAlign="right"
													dataField="vatPercentage"
													dataSort
													// dataFormat={this.vatCategoryFormatter}
													className="table-header-bg"
												>
													 {strings.VAT+" "+strings.Type}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataAlign="center"
													dataField="exciseTax"
													dataSort
												    dataFormat={this.exciseSlabFormatter}
													className="table-header-bg"
												>
													 Excise Slab
												</TableHeaderColumn>
												
												<TableHeaderColumn
													// width="10%"
													dataAlign="center"
                                                    className="table-header-bg"
                                                    dataField="isActive"
                                                    dataSort
                                                    dataFormat={this.renderStatus}
                                                    >
                                                        {strings.Status}

                          						</TableHeaderColumn>  
												<TableHeaderColumn
											className="text-right table-header-bg"
											columnClassName="text-right"
											width="5%"
											// dataFormat={this.renderActions}
										></TableHeaderColumn>
											</BootstrapTable>
										</div>

										{/* <div className="ag-theme-alpine mb-3 col-lg-12" style={{ height: 590 }}>
			<AgGridReact
				rowData={product_list && product_list.data
					? product_list.data
					: []}
					//  suppressDragLeaveHidesColumns={true}
				// pivotMode={true}
				// suppressPaginationPanel={false}
				pagination={true}
				rowSelection="multiple"
				// paginationPageSize={10}
				// paginationAutoPageSize={true}
				paginationPageSize={this.state.paginationPageSize}
					floatingFilter={true}
					defaultColDef={{ 
								resizable: true,
								flex: 1,
								sortable: true
							}}
				sideBar="columns"
				onGridReady={this.onGridReady}
				onFirstDataRendered={this.onFirstDataRendered.bind(this)}

					>

				<AgGridColumn field="productCode" 
				headerName= {strings.PRODUCTCODE}
				sortable={ true } 
				filter={ true } 
				enablePivot={true} 
// 				cellRendererFramework={(params) => <label
// 					className="mb-0 label-bank"
// 					style={{
// 						cursor: 'pointer',
// 						}}
// 					onClick={()=>this.goToCurrencyDetail(params.data.currencyConversionId) }                                                             
// 		>
// 		{params.value}
// 		</label>
// }
				></AgGridColumn>

				<AgGridColumn field="name" 
				headerName={strings.NAME}
				sortable={ true }
				filter={ true }
				enablePivot={true}
				cellRendererFramework={(params) => <label
					className="mb-0 label-bank"
					style={{
						cursor: 'pointer',
						}}                                 
		>
		{params.value}
		</label>
}
				></AgGridColumn>  


				<AgGridColumn field="productType" 
				headerName=  {strings.ProductType}
				sortable={ true }
				enablePivot={true} 
				filter={ true }
				cellRendererFramework={(params)=><>{this.renderType(params.value,params)}</>}
				></AgGridColumn>  

			
<AgGridColumn field="isInventoryEnabled" 
				headerName=  {strings.INVENTORY}
				sortable={ true }
				enablePivot={true} 
				filter={ true }
				cellRendererFramework={(params) => params.value==true ?
					<label className="badge label-success"> {strings.enabled}</label>
					:
					<label className="badge label-due"> {strings.disabled
					}</label>
		}
				></AgGridColumn>  
				
				<AgGridColumn field="vatPercentage" 
				headerName=  {strings.VATTYPE}
				sortable={ true }
				enablePivot={true} 
				filter={ true }
				
				></AgGridColumn>  

<AgGridColumn field="exciseTax" 
				headerName= {strings.excise_slab}
				sortable={ true }
				filter={ true }
				enablePivot={true}
				cellRendererFramework={(params) => params.value != null ?
					params.value
					:
					"-"
		}	
				></AgGridColumn>  
				<AgGridColumn field="unitPrice" 
				headerName=  {strings.UNITPRICE}
				sortable={ true }
				filter={ true }
				enablePivot={true}
				formatExtraData={universal_currency_list}
				
					
				></AgGridColumn>  

				<AgGridColumn
				headerName={strings.STATUS}
				field="isActive" 
				sortable={ true }
				filter={ true }
				enablePivot={true} 
				cellRendererFramework={(params) => params.value==true ?
													<label className="badge label-success"> {strings.active}</label>
													:
													<label className="badge label-due"> {strings.inactive}</label>
										}
				></AgGridColumn>  
				<AgGridColumn field="action"
										// className="Ag-gridActionButtons"
										headerName={strings.action}
										cellRendererFramework={(params) =>
											<div
											 className="Ag-gridActionButtons"
											 >
												{this.getActionButtons(params)}
											</div>

										}
									></AgGridColumn>
			</AgGridReact>   */}
			{/* <div className="example-header mt-1">
					{strings.page_size}
					<select onChange={() => this.onPageSizeChanged()} id="page-size">
					<option value="10" selected={true}>10</option>
					<option value="100">100</option>
					<option value="500">500</option>
					<option value="1000">1000</option>
					</select>
				</div>   																	 */}
		{/* </div>	 */}
									</Col>
								</Row>
							)}
						</CardBody>
					</Card>
				</div>
			</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Product);
