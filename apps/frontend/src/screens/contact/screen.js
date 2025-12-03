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
import { Loader, ConfirmDeleteModal } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import * as ContactActions from './actions';
import { CommonActions } from 'services/global';
import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';
// import { AgGridReact,AgGridColumn } from 'ag-grid-react/lib/agGridReact';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const mapStateToProps = (state) => {
	return {
		contact_list: state.contact.contact_list,
		contact_type_list: state.contact.contact_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		contactActions: bindActionCreators(ContactActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
const customStyles = {
	control: (base, state) => ({
		...base,
		borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		boxShadow: state.isFocused ? null : null,
		'&:hover': {
			borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		},
	}),
};

let strings = new LocalizedStrings(data);
class Contact extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			selectedRows: [],
			dialog: null,
			filterData: {
				name: '',
				email: '',
				contactType: '',
			},
			selectedContactType: '',
			paginationPageSize:10,
			csvData: [],
			view: false,
			actionButtons:{}
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
		this.props.contactActions.getContactTypeList();
		this.initializeData();
	};

	componentWillUnmount = () => {
		this.setState({
			selectedRows: [],
		});
	};
    

	initializeData = (search) => {
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
		this.props.contactActions
			.getContactList(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						loading: false,
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ loading: false });
			});
	};
      
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
			this.initializeData();
		}
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

	goToDetail = (row) => {
		 
		this.props.history.push('/admin/master/contact/detail', { id: row.id });
	};

	renderMobileNumber = (cell, rows) => {
		return rows.mobileNumber ? "+" +rows.mobileNumber : '';
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
											'/admin/master/contact/detail',
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
						
						this.goToDetail(params.data.id)  }
			
			>		<i className="fas fa-edit"/> </Button>
	</>
		)
	}

	bulkDelete = () => {
		const { selectedRows } = this.state;
		this.props.contactActions
			.getInvoicesCountContact(selectedRows)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to delete invoices to delete the contact',
					);
				} else {
					const message1 =
		<text>
		<b>Delete Contact?</b>
		</text>
		const message ='This Contact will be deleted permanently and cannot be recovered.';
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
		const { contact_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.props.contactActions
			.removeBulk(obj)
			.then((res) => {
				this.initializeData();
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message : 'Contact Deleted Successfully',
				);
				if (contact_list && contact_list.data && contact_list.data.length > 0) {
					this.setState({
						selectedRows: [],
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Contact Deleted Unsuccessfully',
				);
				this.setState({ isLoading: false });
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
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
	};

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true,
			};
			this.props.contactActions.getContactList(obj).then((res) => {
				if (res.status === 200) {
					var result = res.data.data.map((o) => ({
						'First Name': o.firstName,
						'Last Name': o.lastName,
						Email: o.email,
						'Mobile Number': o.mobileNumber,
						Currency: o.currencySymbol,
						Type: o.contactTypeString,
					}));

					this.setState({ csvData: result, view: true }, () => {
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
					email: '',
					contactType: '',
				},
			},
			() => {
				this.initializeData();
			},
		);
	};

	customEmail(cell, row) {
		if (row.email && row.email.length > 15) {
			return `${cell}`;
		}
	}

	customName(cell, row) {
		if (row.fullName.length > 15) {
			return `${cell}`;
		}
	}

	contactName = (cell,row) => {
		if(row.organization === null || row.organization === "")
		{return row.fullName ? row.fullName : '-'}
		else{return row.organization ? row.fullName+" ("+row.organization+")" : '-'}
		
	}
	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			dialog,
			selectedRows,
			csvData,
			view,
			filterData,
		} = this.state;
		const { contact_list, contact_type_list } = this.props;

		return (
			loading ==true? <Loader/> :
<div>
			<div className="contact-screen">
				<div className="animated fadeIn">
					{dialog}
					{/* // <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-id-card-alt" />
										<span className="ml-2">{strings.Contact}</span>
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
														filename={'Contact.csv'}
														className="hidden"
														ref={this.csvLink}
														enclosingCharacter={`'`}
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
												this.props.history.push(`/admin/master/contact/create`)
											}
										>
											<i className="fas fa-plus mr-1" />
											{strings.Addnewcontact}
										</Button>
										</div>
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}										
												options={this.options}
												version="4"
												hover
												responsive												
												remote
											data={contact_list && contact_list.data
												? contact_list.data
												: []}										
											pagination={
												contact_list &&
												contact_list.data &&
												contact_list.data.length
													? true
													: false
											}											
											fetchInfo={{
												dataTotalSize: contact_list.count
													? contact_list.count
													: 0,
											}}											
												>
														<TableHeaderColumn
															tdStyle={{ whiteSpace: 'normal' }}
															isKey
															dataField="fullName"
															dataSort
														    dataFormat={this.contactName}
															className="table-header-bg"
														>
															{strings.CONTACTORGANIZATIONTNAME}
														</TableHeaderColumn>							
														<TableHeaderColumn
														width='10%'
															dataField="contactTypeString"
															dataSort
															// dataFormat={this.typeFormatter}
															className="table-header-bg"
														>
														    {strings.CONTACTTYPE}
														</TableHeaderColumn>
														{/* <TableHeaderColumn
															dataField="vatType"
															dataSort
															// dataFormat={this.typeFormatter}
															className="table-header-bg"
														>
														    {strings.VATTYPE}
														</TableHeaderColumn>

														<TableHeaderColumn
															dataField="TRN"
															dataSort
															// dataFormat={this.typeFormatter}
															className="table-header-bg"
														>
														    {strings.TRN}
														</TableHeaderColumn> */}
														<TableHeaderColumn
															dataField="email"
															columnTitle={this.customEmail}
															dataSort
															className="table-header-bg"
														>
															{strings.Email}
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="mobileNumber"
															// columnTitle={this.customEmail}
															dataSort
															dataFormat={this.renderMobileNumber}
															className="table-header-bg"
														>
															{strings.MOBILENUMBER}
														</TableHeaderColumn>
														<TableHeaderColumn
															dataField="isActive"
															dataSort
															dataFormat={this.renderStatus}
															className="table-header-bg"
														>
														    {strings.STATUS}
														</TableHeaderColumn>
														{/* <TableHeaderColumn
															dataField="openingBalance"
															dataSort
															// dataFormat={this.typeFormatter}
															className="table-header-bg"
														>
														    {strings.OPENINGBALANCE}
														</TableHeaderColumn> */}
														<TableHeaderColumn
															columnClassName="text-right"
															width="5%"
															// dataFormat={this.renderActions}
															className="table-header-bg text-right"
														></TableHeaderColumn>
														
														
											</BootstrapTable>
										</div>
										
											

													{/* <div className="ag-theme-alpine mb-3" style={{ height: 590,width:"100%" }}>
			<AgGridReact
				rowData={contact_list && contact_list.data
					? contact_list.data
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
					>

				<AgGridColumn field="fullName" 
				headerName=	{strings.NAME}
				sortable={ true } 
				filter={ true } 
				enablePivot={true} 
				cellRendererFramework={(params) => params.data.organization === "" || params.data.organization === null ?
					params.data.fullName
					:
					params.data.organization
					}
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

				<AgGridColumn field="email" 
				headerName=	{strings.EMAIL}
				sortable={ true }
				filter={ true }
				enablePivot={true}
				></AgGridColumn>  

<AgGridColumn field="contactTypeString" 
				headerName=	 {strings.TYPE}
				sortable={ true }
				filter={ true }
				enablePivot={true}
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
												{/* <Col xs="12" lg="4">
                            <div className="contact-info p-4">
                              <h4>Mr. Admin Admin</h4>
                              <hr />
                              <div className="d-flex">
                                <div className="contact-name mr-4">AA</div>
                                <div className="info">
                                  <p><strong>Company: </strong> admin </p>
                                  <p><strong>Email: </strong> admin@admin.com </p>
                                  <p><strong>Tel No: </strong> 1231 </p>
                                  <p><strong>Next Due Date: </strong> 11/01/2019 </p>
                                  <p><strong>Due Amount: </strong> Lek 400 </p>
                                  <p><strong>Contact Type: </strong>Customer </p>
                                </div>

                              </div>
                              <div className="text-right mt-3">
                                <Button
                                  color="primary"
                                  className="btn-square "
                                  onClick={() => this.props.history.push(`/admin/invoice/create`)}
                                >
                                  <i className="fas fa-plus mr-1" />
                                  New Invoice
                                </Button>
                              </div>
                            </div>
                          </Col> */}
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

export default connect(mapStateToProps, mapDispatchToProps)(Contact);
