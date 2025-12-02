import React from 'react';
import { connect } from 'react-redux';
import {
	Card,
	CardBody,
	Row,
	Col,
	NavItem,
	Nav,
	TabContent,
	NavLink,
	TabPane,
	Button,
	CardHeader,
	ButtonGroup,
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Input,
	Label,
	UncontrolledTooltip,
	FormGroup,
	Form,
} from 'reactstrap';
import { ConfirmDeleteModal } from 'components'
import * as DesignationActions from '../designation/actions'
import * as EmployeeActions from "../salaryRoles/actions"
import * as SalaryStructureAction from "../salaryStructure/actions"
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import { bindActionCreators } from 'redux';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { CommonActions } from 'services/global'
import { data } from '../Language/index'
import LocalizedStrings from 'react-localization';
import { Loader } from 'components';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as PayrollRun from '../payroll_run/actions';

const mapStateToProps = (state) => {
	return {
		designation_list: state.employeeDesignation.designation_list,
		company_details: state.common.company_details,
		salaryStructure_list: state.salaryStructure.salaryStructure_list,
		salaryRole_list: state.salaryRoles.salaryRole_list,
		profile: state.auth.profile,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		designationActions: bindActionCreators(DesignationActions, dispatch),
		salaryStructureActions: bindActionCreators(SalaryStructureAction, dispatch),
		employeeActions: bindActionCreators(EmployeeActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		payrollRun: bindActionCreators(PayrollRun, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class PayrollConfigurations extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			dialog: null,
			language: window['localStorage'].getItem('language'),
			openModal: false,
			selectedData: {},
			activeTab: new Array(5).fill('3'),
			filterData: {
				salaryRoleId: '',
				salaryRoleName: ''
			},
			initValue: {
				companyBankCode: '',
				companyNumber: '',
				generateSif: true,
			},
			current_employee_id: '',
			salaryList: [],
		};
		this.formRef = React.createRef();
		this.regEx = /^[0-9\d]+$/;
		this.designationoptions = {
			paginationPosition: 'bottom',
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.designationonSizePerPageList,
			onPageChange: this.designationonPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn
		}

		this.options = {
			paginationPosition: 'bottom',
			page: 1,
			sizePerPage: 10,
			onSizePerPageList: this.onSizePerPageList,
			onPageChange: this.onPageChange,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn
		}
		this.selectRowProp = {
			bgColor: 'rgba(0,0,0, 0.05)',
			clickToSelect: false,
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll
		}
		this.csvLink = React.createRef()
	}
	// handleLanguageChange(e) {
	//   e.preventDefault();
	//   let lang = e.target.value;
	//   this.setState(prevState => ({
	//     language: lang
	//   }))
	// }
	componentDidMount = () => {
		window['localStorage'].getItem('accessToken')
		this.getCompanyDataForPayroll()
		this.initializeData()
		this.initializeDataForDesignations()
		//this.initializeDataForStructure()

	}
	getCompanyDataForPayroll = () => {
		this.props.payrollRun.getCompanyDetails().then((res) => {
			if (res.status == 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{
							companyNumber: res.data.companyNumber ? res.data.companyNumber : "",
							companyBankCode: res.data.companyBankCode ? res.data.companyBankCode : "",
						}
					}
				});
				this.formRef.current.setFieldValue('companyNumber', res.data.companyNumber ? res.data.companyNumber : "", true);
				this.formRef.current.setFieldValue('companyBankCode', res.data.companyBankCode ? res.data.companyBankCode : "", true);
			}
		});

	}
	componentWillUnmount = () => {
		this.setState({
			selectedRows: []
		})
	}
	renderActions = (cell, row) => {

	};
	initializeData = (search) => {
		if (this.props.location.state !== undefined && this.props.location.state !== null && this.props.location.state.tabNo !== undefined && this.props.location.state.tabNo !== null) {
			this.toggle(0, this.props.location.state.tabNo)
		} else
			this.toggle(0, this.state.activeTab[0])
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage
		}
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : ''
		}
		const postData = { ...paginationData, ...sortingData }
		// this.props.employeeActions.getSalaryRoleList(postData).then((res) => {
		// 	if (res.status === 200) {
		// 		this.setState({ loading: false })
		// 	}
		// }).catch((err) => {
		// 	this.setState({ loading: false })
		// 	this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
		// })
		this.props.salaryStructureActions.getSalaryList(postData).then((res) => {
			if (res.status === 200) {
				this.setState({ salaryList: res.data })
			}
		}).catch((err) => {
			this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
		})
	}
	initializeDataForDesignations = (search) => {
		const { filterData } = this.state
		const paginationData = {
			pageNo: this.designationoptions.page ? this.designationoptions.page - 1 : 0,
			pageSize: this.designationoptions.sizePerPage
		}
		const sortingData = {
			order: this.designationoptions.sortOrder ? this.designationoptions.sortOrder : '',
			sortingCol: this.designationoptions.sortName ? this.designationoptions.sortName : ''
		}
		const postData = { ...filterData, ...paginationData, ...sortingData }
		this.props.designationActions.getEmployeeDesignationList(postData).then((res) => {
			if (res.status === 200) {
				this.setState({ loading: false })
			}
		}).catch((err) => {
			this.setState({ loading: false })
			this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
		})
	}

	initializeDataForStructure = (search) => {
		const { filterData } = this.state
		const paginationData = {
			pageNo: this.options.page ? this.options.page - 1 : 0,
			pageSize: this.options.sizePerPage
		}
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : ''
		}
		const postData = { ...filterData, ...paginationData, ...sortingData }
		this.props.salaryStructureActions.getSalaryStructureList(postData).then((res) => {
			if (res.status === 200) {
				this.setState({ loading: false })
			}
		}).catch((err) => {
			this.setState({ loading: false })
			this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
		})
	}

	goToDetailForRoles = (cell, row) => {


		return (
			<Row>
				<div>
					{
						row.salaryRoleId == 1 ? "" : (
							<Button
								className="btn btn-sm pdf-btn"
								onClick={(e,) => {
									this.props.history.push('/admin/payroll/config/detailSalaryRoles', { id: row.salaryRoleId })
								}}
							>
								<i className="far fa-edit fa-lg"></i>
							</Button>
						)
					}
				</div>

			</Row>


		);
	}
	goToDetailForStructure = (cell, row) => {
		return (
			<Row>
				<div>{
					row.salaryStructureId == 1 || row.salaryStructureId == 2 || row.salaryStructureId == 3 || row.salaryStructureId == 4 ?
						""
						:
						(
							<Button
								className="btn btn-sm pdf-btn"
								onClick={(e,) => {

									this.props.history.push('/admin/payroll/config/detailSalaryStructure', { id: row.salaryStructureId })
								}}
							>
								<i className="far fa-edit fa-lg"></i>
							</Button>
						)
				}
				</div>
			</Row>
		);
	}

	goToDetailForDesignations = (cell, row) => {
		return (
			<Row>
				<div>
					{row.id == 1 || row.id == 2 || row.id == 3 || row.id == 4 ? ""
						:
						(<Button
							className="btn btn-sm pdf-btn"
							onClick={(e,) => {
								this.props.history.push('/admin/payroll/config/detailEmployeeDesignation', { id: row.id })
							}}
						>
							<i className="far fa-edit fa-lg"></i>
						</Button>)
					}
				</div>

			</Row>


		);
	}

	goToDetailForSalaryComponent = (cell, row) => {
		return (
			<Row>
				<div>
					{row.id == 1 || row.id == 3 ? "" :
						(<Button
							className="btn btn-sm pdf-btn"
							onClick={(e,) => {
								this.props.history.push('/admin/payroll/config/detailSalaryComponent', { id: row.id })
							}}
						>
							<i className="far fa-edit fa-lg"></i>
						</Button>)
					}
				</div>

			</Row>


		);
	}

	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData()
	}

	bulkDelete = () => {
		const {
			selectedRows
		} = this.state
		if (selectedRows.length > 0) {
			const message1 =
				<text>
					<b>Delete Employee?</b>
				</text>
			const message = 'This Employee will be deleted permanently and cannot be recovered. ';
			this.setState({
				dialog: <ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeBulk}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			})
		} else {
			this.props.commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.')
		}
	}

	removeBulk = () => {
		this.removeDialog()
		let { selectedRows } = this.state;
		const { salaryRole_list } = this.props
		let obj = {
			ids: selectedRows
		}
		this.props.employeeActions.removeBulkEmployee(obj).then((res) => {
			if (res.status === 200) {
				this.props.commonActions.tostifyAlert('success', 'Employees Deleted Successfully')
				this.initializeData();
				if (salaryRole_list && salaryRole_list.data && salaryRole_list.data.length > 0) {
					this.setState({
						selectedRows: []
					})
				}
			}
		}).catch((err) => {
			this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
		})
	}

	removeDialog = () => {
		this.setState({
			dialog: null
		})
	}

	handleChange = (val, name) => {
		this.setState({
			filterData: Object.assign(this.state.filterData, {
				[name]: val
			})
		})
	}

	handleSearch = () => {
		this.initializeData();
		// this.setState({})
	}

	onSizePerPageList = (sizePerPage) => {
		if (this.options.sizePerPage !== sizePerPage) {
			this.options.sizePerPage = sizePerPage
			this.initializeData()
		}
	}

	onPageChange = (page, sizePerPage) => {
		if (this.options.page !== page) {
			this.options.page = page
			this.initializeData()
		}
	}

	designationonSizePerPageList = (sizePerPage) => {
		if (this.designationoptions.sizePerPage !== sizePerPage) {
			this.designationoptions.sizePerPage = sizePerPage
			this.initializeDataForDesignations()
		}
	}

	designationonPageChange = (page, sizePerPage) => {
		if (this.designationoptions.page !== page) {
			this.designationoptions.page = page
			this.initializeDataForDesignations()
		}
	}

	getCsvData = () => {
		if (this.state.csvData.length === 0) {
			let obj = {
				paginationDisable: true
			}
			this.props.employeeActions.getEmployeeList(obj).then((res) => {
				if (res.status === 200) {
					this.setState({ csvData: res.data.data, view: true }, () => {
						setTimeout(() => {
							this.csvLink.current.link.click()
						}, 0)
					});
				}
			})
		} else {
			this.csvLink.current.link.click()
		}
	}

	clearAll = () => {
		this.setState({
			filterData: {
				id: '',
				salaryRoleName: ''
			},
		}, () => { this.initializeData() })
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

	renderForId = (cell, row) => {
		for (let i = 121; i <= 10000; i++) {
			return (
				<div>{row.designationId ? row.designationId : row.id}</div>
			);
		}
	}
	renderSalaryComponentId = (cell, row) => {
		return (row.componentCode ? row.componentCode : row.id);
	}
	renderSalaryCalculationType = (cell, row) => {
		console.log(row);
		return (row.calculationType ? parseInt(row.calculationType) === 2 ? 'CTC Percent' : 'Flat Amount' : (row.formula ? "CTC Percent" : "Flat Amount"));
	}
	renderSalaryComponentType = (cell, row) => {
		console.log(row);
		return (row.description === 'Basic SALARY' ? 'Earning' : row.componentType);
	}
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

						<DropdownItem
							onClick={() =>
								this.props.history.push(
									'/admin/payroll/employee/detail',
									{ salaryRoleId: row.id },
								)
							}
						>
							<i className="fas fa-edit" /> {strings.Edit}
						</DropdownItem>

						{/* <DropdownItem
								  onClick={() =>
									  this.props.history.push(
										  '/admin/payroll/employee/salarySlip',
										  { id: row.id },
									  )
								  }
							  >
								  <i className="fas fa-eye" /> Salary Slip
							  </DropdownItem> */}

					</DropdownMenu>
				</ButtonDropdown>
			</div>
		);
	};
	toggle = (tabPane, tab) => {
		const newArray = this.state.activeTab.slice();
		newArray[parseInt(tabPane, 10)] = tab;
		this.setState({
			activeTab: newArray,
		});
	};

	handleSubmit = (data, resetForm, setSubmitting) => {
		let formdata = new FormData()
		formdata.append("companyBankCode", data.companyBankCode)
		formdata.append("companyNumber", data.companyNumber)
		this.props.payrollRun
			.updateCompany(formdata)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Company Details Saved Successfully',
					);
					// this.props.closeModal(false);	
					this.props.history.push(
						'/admin/payroll/payroll-run',
					);
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading, dialog, initValue, salaryList } = this.state;
		const { salaryRole_list, salaryStructure_list, designation_list } = this.props;
		const { generateSif } = this.props.company_details;
		return (
			loading == true ? <Loader /> :
				<div>
					<div className="financial-report-screen">
						<div className="animated fadeIn">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="nav-icon fas fa-cogs" />
												<span className="ml-2">{strings.PayrollConfigurations}</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>

									<Nav tabs pills>
										{/* <NavItem>
											<NavLink
												active={this.state.activeTab[0] === '1'}
												onClick={() => {
													this.toggle(0, '1');
												}}
											>
												{strings.SalaryRole}
											</NavLink>
										</NavItem> */}
										{/* <NavItem>
									<NavLink
										active={this.state.activeTab[0] === '2'}
										onClick={() => {
											this.toggle(0, '2');
										}}
									>
									{strings.SalaryStructure}
									</NavLink>
								</NavItem> */}
										<NavItem>
											<NavLink
												active={this.state.activeTab[0] === '3'}
												onClick={() => {
													this.toggle(0, '3');
												}}
											>
												{strings.EmployeeDesignation}
											</NavLink>
										</NavItem>
										<NavItem>
											{generateSif && <NavLink
												active={this.state.activeTab[0] === '4'}
												onClick={() => {
													this.toggle(0, '4');
												}}
											>{strings.CompanyDetails}
											</NavLink>}
										</NavItem>
										<NavItem>
											<NavLink
												active={this.state.activeTab[0] === '5'}
												onClick={() => {
													this.toggle(0, '5');
												}}
											>
												{strings.SalaryComponent}
											</NavLink>
										</NavItem>
									</Nav>
									<TabContent activeTab={this.state.activeTab[0]}>
										<TabPane tabId="1" >
											<div className="employee-screen">
												<div className="animated fadeIn">
													{dialog}

													<CardHeader>
														<Row>
															<Col lg={12}>
																<div className="h4 mb-0 mt-0 d-flex align-items-center">
																	<i className="fas fa-object-group" />
																	<span className="ml-2 "> {strings.SalaryRole}</span>
																</div>
															</Col>
														</Row>
													</CardHeader>
													<CardBody>
														{
															loading ?
																<Row>
																	<Col lg={12}>
																		<Loader />
																	</Col>
																</Row>
																:
																<Row>

																	<Col lg={12}>
																		<div className="d-flex justify-content-end">
																			<ButtonGroup size="sm">
																				{/* <Button
                            color="success"
                            className="btn-square"
                            onClick={() => this.getCsvData()}
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />Export To CSV
                          </Button>
                          {view && <CSVLink
                            data={csvData}
                            filename={'Employee.csv'}
                            className="hidden"
                            ref={this.csvLink}
                            target="_blank"
                          />} */}
																				{/* <Button

                            color="primary"
                            className="btn-square mb-2"
                            onClick={() => this.props.history.push(`/admin/payroll/salaryRoles/create`)}
                          >
                            <i className="fas fa-plus mr-1 " />
                            {strings.NewSalaryRoles}
                          </Button> */}

																				<div style={{ width: "1650px" }}>
																					<Button
																						color="primary"
																						className="btn-square pull-right mb-2 mr-2"
																						style={{ marginBottom: '10px' }}
																						onClick={() => this.props.history.push(`/admin/payroll/config/createSalaryRoles`)}

																					>
																						<i className="fas fa-plus mr-1" />
																						{strings.NewSalaryRoles}
																					</Button>
																				</div>
																				{/* <Button
                            color="warning"
                            className="btn-square"
                            onClick={this.bulkDelete}
                            disabled={selectedRows.length === 0}
                          >
                            <i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
                            Bulk Delete
                          </Button> */}
																			</ButtonGroup>
																		</div>

																		<div>
																			<BootstrapTable
																				selectRow={this.selectRowProp}
																				search={false}
																				//options={this.options}
																				data={salaryRole_list && salaryRole_list.data ? salaryRole_list.data : []}
																				version="4"
																				hover
																				// pagination={salaryRole_list && salaryRole_list.data && salaryRole_list.data.length > 0 ? true : false}
																				keyField="id"
																				remote
																				fetchInfo={{ dataTotalSize: salaryRole_list.count ? salaryRole_list.count : 0 }}
																				//  className="employee-table"
																				trClassName="cursor-pointer"
																				csvFileName="salaryRole_list.csv"
																				ref={(node) => this.table = node}
																			>
																				<TableHeaderColumn
																					dataField="salaryRoleId"
																					className="table-header-bg"
																				>
																					{strings.SALARYROLEID}
																				</TableHeaderColumn>
																				<TableHeaderColumn
																					dataField="salaryRoleName"
																					className="table-header-bg"
																				>
																					{strings.SALARYROLENAME}
																				</TableHeaderColumn>
																				<TableHeaderColumn
																					dataField="salaryRoleName"
																					className="table-header-bg"
																					dataFormat={this.goToDetailForRoles}
																				>

																				</TableHeaderColumn>

																			</BootstrapTable>
																		</div>
																	</Col>

																</Row>


														}
													</CardBody>
													{/* </Card> */}
												</div>
											</div>
										</TabPane>



										<TabPane tabId="2">
											<div className="employee-screen">
												<div className="animated fadeIn">
													{dialog}
													{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
													{/* <Card> */}
													<CardHeader>
														<Row>
															<Col lg={12}>
																<div className="h4 mb-0 d-flex align-items-center">
																	<i className="fas fa-object-group" />
																	<span className="ml-2">{strings.SalaryStructure}</span>
																</div>
															</Col>
														</Row>
													</CardHeader>
													<CardBody>
														{
															loading ?
																<Row>
																	<Col lg={12}>
																		<Loader />
																	</Col>
																</Row>
																:
																<Row>
																	<Col lg={12}>
																		<div className="d-flex justify-content-end">
																			<ButtonGroup size="sm">
																				{/* <Button
                            color="success"
                            className="btn-square"
                            onClick={() => this.getCsvData()}
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />Export To CSV
                          </Button>
                          {view && <CSVLink
                            data={csvData}
                            filename={'Employee.csv'}
                            className="hidden"
                            ref={this.csvLink}
                            target="_blank"
                          />} */}
																				{/* <Button
                            color="primary"
                            className="btn-square"
                            onClick={() => this.props.history.push(`/admin/payroll/salaryStructure/create`)}
                          >
                            <i className="fas fa-plus" />
                            {strings.NewSalaryStructure}
                          </Button> */}

																				{/* <div style={{ width: "1650px" }}>
																				<Button
																					color="primary"
																					className="btn-square pull-right mb-2 mr-2"
																					style={{ marginBottom: '10px' }}
																					onClick={() => this.props.history.push(`/admin/payroll/config/createSalaryStructure`)}

																				>
																					<i className="fas fa-plus mr-1" />
																					{strings.NewSalaryStructure}
																				</Button>
																			</div> */}
																				{/* <Button
                            color="warning"
                            className="btn-square"
                            onClick={this.bulkDelete}
                            disabled={selectedRows.length === 0}
                          >
                            <i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
                            Bulk Delete
                          </Button> */}
																			</ButtonGroup>
																		</div>
																		{/* <div className="py-3">
                        <h5>Filter : </h5>
                        <form >
                          <Row>
                            <Col lg={3} className="mb-1">
                              <Input type="text" placeholder="Name" value={filterData.name} onChange={(e) => { this.handleChange(e.target.value, 'name') }} />
                            </Col>
                            <Col lg={3} className="mb-2">
                              <Input type="text" placeholder="Email" value={filterData.email} onChange={(e) => { this.handleChange(e.target.value, 'email') }} />
                            </Col>
                            <Col lg={1} className="pl-0 pr-0" style={{display: "contents"}}>
                              <Button type="button" color="primary" className="btn-square mr-1" onClick={this.handleSearch}>
                                <i className="fa fa-search"></i>
                              </Button>
                              <Button type="button" color="primary" className="btn-square" onClick={this.clearAll}>
                                <i className="fa fa-refresh"></i>
                              </Button>
                            </Col>
                          </Row>
                        </form>
                         </div> */}
																		<div>
																			<BootstrapTable
																				selectRow={this.selectRowProp}
																				search={false}
																				//options={this.options}
																				data={salaryStructure_list && salaryStructure_list.data ? salaryStructure_list.data : []}
																				version="4"
																				hover
																				// pagination={salaryStructure_list && salaryStructure_list.data && salaryStructure_list.data.length > 0 ? true : false}
																				keyField="id"
																				remote
																				fetchInfo={{ dataTotalSize: salaryStructure_list.count ? salaryStructure_list.count : 0 }}
																				className="employee-table"
																				trClassName="cursor-pointer"
																				// csvFileName="salaryStructure_list.csv"
																				ref={(node) => this.table = node}
																			>
																				<TableHeaderColumn
																					className="table-header-bg"
																					dataField="salaryStructureType"

																				>
																					{strings.SalaryStructureType}
																				</TableHeaderColumn>
																				<TableHeaderColumn
																					className="table-header-bg"
																					dataField="salaryStructureName"

																				// dataFormat={this.vatCategoryFormatter}
																				>
																					{strings.SalaryStructureName}
																				</TableHeaderColumn>
																				<TableHeaderColumn
																					className="table-header-bg"
																					dataField="salaryStructureName"

																					dataFormat={this.goToDetailForStructure}
																				>

																				</TableHeaderColumn>

																			</BootstrapTable>
																		</div>
																	</Col>
																</Row>
														}
													</CardBody>
													{/* </Card> */}
												</div>
											</div>
										</TabPane>


										<TabPane tabId="3">
											<div className="employee-screen">
												<div className="animated fadeIn">
													{dialog}
													{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
													{/* <Card> */}
													<CardHeader>
														<Row>
															<Col lg={12}>
																<div className="h4 mb-0 d-flex align-items-center">
																	<i className="nav-icon fas fa-user-plus" />
																	<span className="ml-2">{strings.EmployeeDesignation}</span>
																</div>
															</Col>
														</Row>
													</CardHeader>
													<CardBody>
														{
															loading ?
																<Row>
																	<Col lg={12}>
																		<Loader />
																	</Col>
																</Row>
																:
																<Row>
																	<Col lg={12}>
																		<div className="d-flex justify-content-end">
																			<ButtonGroup size="sm">
																				{/* <Button
                            color="success"
                            className="btn-square"
                            onClick={() => this.getCsvData()}
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />Export To CSV
                          </Button>
                          {view && <CSVLink
                            data={csvData}
                            filename={'Employee.csv'}
                            className="hidden"
                            ref={this.csvLink}
                            target="_blank"
                          />} */}

																				<div style={{ width: "1650px" }}>
																					<Button
																						color="primary"
																						className="btn-square pull-right mb-2 mr-2"
																						style={{ marginBottom: '10px' }}
																						onClick={() => this.props.history.push(`/admin/payroll/config/createEmployeeDesignation`)}

																					>
																						<i className="fas fa-plus mr-1" />
																						{strings.NewDesignation}
																					</Button>
																				</div>
																				{/* <Button
                            color="warning"
                            className="btn-square"
                            onClick={this.bulkDelete}
                            disabled={selectedRows.length === 0}
                          >
                            <i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
                            Bulk Delete
                          </Button> */}
																			</ButtonGroup>
																		</div>

																		<BootstrapTable
																			selectRow={this.selectRowProp}
																			search={false}
																			options={this.designationoptions}
																			data={designation_list && designation_list.data ? designation_list.data : []}
																			version="4"
																			hover
																			pagination={designation_list && designation_list.count > 0 ? true : false}
																			keyField="id"
																			remote

																			fetchInfo={{ dataTotalSize: designation_list.count ? designation_list.count : 0 }}
																			className="designation-list-table"
																			trClassName="cursor-pointer"
																			csvFileName="designation_list.csv"
																			ref={(node) => this.table = node}
																		// pagination={
																		// 	designation_list &&
																		// 	designation_list.count > 0
																		// 		? true
																		// 		: false
																		// }
																		>
																			<TableHeaderColumn
																				className="table-header-bg"
																				dataField="designationId"
																				dataFormat={this.renderForId}
																			>
																				{strings.DESIGNATIONID}
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				className="table-header-bg"
																				dataField="designationName"

																			// dataFormat={this.vatCategoryFormatter}
																			>
																				{strings.DESIGNATIONNAME}
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				className="table-header-bg"
																				dataField="designationName"

																				dataFormat={this.goToDetailForDesignations}
																			>

																			</TableHeaderColumn>

																		</BootstrapTable>
																	</Col>
																</Row>
														}
													</CardBody>
													{/* </Card> */}
												</div>
											</div>
										</TabPane>
										<TabPane tabId="4">
											<div className="employee-screen">
												<div className="animated fadeIn">
													{dialog}
													{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
													{/* <Card> */}
													<CardHeader>
														<Row>
															<Col lg={12}>
																<div className="h4 mb-0 d-flex align-items-center">
																	<i className="fas fa-object-group" />
																	<span className="ml-2">Company Details </span>
																	<i
																		id="Tooltip"
																		className="fa fa-question-circle ml-3"
																	></i>
																	<UncontrolledTooltip
																		placement="right"
																		target="Tooltip"
																	>
																		These Company Details Will be Populated On Payroll - SIF (Salary Information File).
																	</UncontrolledTooltip>
																</div>
															</Col>
														</Row>
													</CardHeader>
													<CardBody>
														{
															loading ?
																<Row>
																	<Col lg={12}>
																		<Loader />
																	</Col>
																</Row>
																:

																<Formik
																	ref={this.formRef}
																	initialValues={this.state.initValue}
																	onSubmit={(values, { resetForm, setSubmitting }) => {
																		this.handleSubmit(values, resetForm);
																	}}
																	validate={(values) => {
																		let errors = {};
																		if (values.companyBankCode.length < 9 && values.companyBankCode.length != 0)
																			errors.companyBankCode = "Company bank code should be 9 digits numeric ";

																		if (values.companyNumber.length < 13 && values.companyNumber.length != 0)
																			errors.companyNumber = "Company number should be 13 digits numeric ";

																		if (this.state.invalidCompanyBankCode && this.state.invalidCompanyBankCode == true)
																			errors.companyBankCode = "Company bank code should be numeric ";

																		if (this.state.invalidCompanyNumber && this.state.invalidCompanyNumber == true)
																			errors.companyNumber = "Company number should be numeric ";

																		return errors;
																	}}
																	validationSchema={Yup.object().shape({
																		companyBankCode: Yup.string().required('Company bank code is required'),
																		companyNumber: Yup.string().required('Company number is required'),
																	})}
																>
																	{(props) => {
																		const { isSubmitting } = props;
																		return (
																			<Form
																				name="simpleForm"
																				onSubmit={props.handleSubmit}
																				className="create-contact-screen"
																			>


																				<Row>
																					<Col lg={4}>
																						<FormGroup className="mb-3"><span className="text-danger">* </span>
																							<Label htmlFor="companyNumber">{strings.company_num}
																								<i
																									id="cnoTooltip"
																									className="fa fa-question-circle ml-1"
																								></i>
																								<UncontrolledTooltip
																									placement="right"
																									target="cnoTooltip"
																								>
																									Company Number is 13 digit Numeric
																								</UncontrolledTooltip>
																							</Label>
																							<Input
																								type="text"
																								name="companyNumber"
																								id="companyNumber"
																								maxLength="13"
																								minLength="13"

																								placeholder={"Enter Company Number"}
																								onChange={(option) => {
																									if (option.target.value === '' || this.regEx.test(option.target.value,)) {
																										props.handleChange('companyNumber',)(option.target.value);
																										this.setState({ invalidCompanyNumber: false })
																									} else {
																										props.handleChange('companyNumber',)("");
																										this.setState({ invalidCompanyNumber: true })
																									}

																								}
																								}
																								className={
																									props.errors.companyNumber &&
																										props.touched.companyNumber
																										? 'is-invalid'
																										: ''
																								}
																								value={props.values.companyNumber}
																							/>
																							{props.errors.companyNumber &&
																								props.touched.companyNumber &&
																								(
																									<div className='text-danger' >
																										{props.errors.companyNumber}
																									</div>
																								)}
																						</FormGroup>
																					</Col>
																					<Col lg={4}>
																						<FormGroup className="mb-3"><span className="text-danger">* </span>
																							<Label htmlFor="companyBankCode">{strings.com_code}
																								<i
																									id="cbcodeTooltip"
																									className="fa fa-question-circle ml-1"
																								></i>
																								<UncontrolledTooltip
																									placement="right"
																									target="cbcodeTooltip"
																								>
																									Company Bank Code is 9 digit Numeric
																								</UncontrolledTooltip>
																							</Label>
																							<Input
																								type="text"
																								name="companyBankCode"
																								id="companyBankCode"
																								maxLength="9"
																								minLength="9"
																								placeholder={"Enter Company Bank Code"}
																								onChange={(option) => {
																									if (option.target.value === '' || this.regEx.test(option.target.value)) {
																										props.handleChange('companyBankCode')(option.target.value);
																										this.setState({ invalidCompanyBankCode: false })
																									}
																									else {
																										props.handleChange('companyBankCode')("");
																										this.setState({ invalidCompanyBankCode: true })
																									}
																								}
																								}
																								className={
																									props.errors.companyBankCode &&
																										props.touched.companyBankCode
																										? 'is-invalid'
																										: ''
																								}
																								value={props.values.companyBankCode}
																							/>
																							{props.errors.companyBankCode &&
																								props.touched.companyBankCode &&
																								(
																									<div className='text-danger' >
																										{props.errors.companyBankCode}
																									</div>
																								)}
																						</FormGroup>
																					</Col>


																				</Row>


																				<Row>
																					<Col></Col>
																					<Col>
																						<Button
																							color="primary"
																							type="submit"
																							className="btn-square pull-right"
																							// disabled={this.state.disabled}
																							disabled={isSubmitting}
																							onClick={() => {
																								//  added validation popup  msg                                                                
																								props.handleBlur();
																								if (props.errors && Object.keys(props.errors).length != 0)
																									this.props.commonActions.fillManDatoryDetails();
																							}}

																						>
																							<i className="fa fa-dot-circle-o"></i> 	{this.state.disabled
																								? 'Saving...'
																								: strings.Save}
																						</Button>
																					</Col>
																					<Col></Col>


																				</Row>

																				{/* <Button
																				color="secondary"
																				className="btn-square"
																				// onClick={() => {					
																				// 	closeModal(false);
																				// }}
																			>
																				<i className="fa fa-ban"></i> {strings.Cancel}
																			</Button> */}

																			</Form>
																		);
																	}}
																</Formik>

														}
													</CardBody>
													{/* </Card> */}
												</div>
											</div>
										</TabPane>
										<TabPane tabId="5">
											<div className="employee-screen">
												<div className="animated fadeIn">
													<CardHeader>
														<Row>
															<Col lg={12}>
																<div className="h4 mb-0 d-flex align-items-center">
																	<i className="nav-icon fas fa-money-check-alt" />
																	<span className="ml-2">{strings.SalaryComponent}</span>
																</div>
															</Col>
														</Row>
													</CardHeader>
													<CardBody>
														{
															loading ?
																<Row>
																	<Col lg={12}>
																		<Loader />
																	</Col>
																</Row>
																:
																<Row>
																	<Col lg={12}>
																		<div className="d-flex justify-content-end">
																			<ButtonGroup size="sm">


																				<div style={{ width: "1650px" }}>
																					<Button
																						color="primary"
																						className="btn-square pull-right mb-2 mr-2"
																						style={{ marginBottom: '10px' }}
																						onClick={() => this.props.history.push(`/admin/payroll/config/createSalaryComponent`)}

																					>
																						<i className="fas fa-plus mr-1" />
																						{strings.NewSalaryComponent}
																					</Button>
																				</div>
																			</ButtonGroup>
																		</div>

																		<BootstrapTable
																			selectRow={this.selectRowProp}
																			search={false}
																			options={{
																				paginationPosition: 'bottom',
																				page: this.options.page,
																				sizePerPage: this.options.pageSize,
																				onSizePerPageList: this.onSizePerPageList,
																				onPageChange: this.onPageChange,
																				sortName: this.options.sortName,
																				sortOrder: this.options.sortOrder,
																				onSortChange: this.sortColumn
																			}}
																			data={this.state.salaryList && this.state.salaryList.data ? this.state.salaryList.data : []}
																			version="4"
																			hover
																			pagination={this.state.salaryList && this.state.salaryList.count > 0 ? true : false}
																			keyField="id"
																			remote

																			fetchInfo={{ dataTotalSize: this.state.salaryList.count ? this.state.salaryList.count : 0 }}
																			className="SalaryComponent-list-table"
																			trClassName="cursor-pointer"
																			ref={(node) => this.table = node}
																		>
																			<TableHeaderColumn
																				className="table-header-bg"
																				dataField="id"
																				dataFormat={this.renderSalaryComponentId}
																			>
																				{strings.ComponentId}
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				className="table-header-bg"
																				dataField="description"

																			>
																				{strings.ComponentName}
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				className="table-header-bg"
																				dataField="componentType"
																				dataFormat={this.renderSalaryComponentType}
																			>
																				{strings.ComponentType}
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				className="table-header-bg"
																				dataField="calculationType"
																				dataFormat={this.renderSalaryCalculationType}
																			>
																				{strings.calculation_type}
																			</TableHeaderColumn>
																			<TableHeaderColumn
																				className="table-header-bg"
																				dataField="componentName"

																				dataFormat={this.goToDetailForSalaryComponent}
																			>

																			</TableHeaderColumn>

																		</BootstrapTable>
																	</Col>
																</Row>
														}
													</CardBody>
												</div>
											</div>
										</TabPane>
									</TabContent>

								</CardBody>
							</Card>
						</div>
						{/* <ViewPaySlip
					openModal={this.state.openModal}
					closeModal={(e) => {
						this.closeModal(e);
					}}
					bankDetails={this.state.EmployeeDetails}
					employeename={this.state.employeename}
				// id={this.state.rowId}
				Fixed={this.state.Fixed}
				 FixedAllowance={this.state.FixedAllowance}
				 selectedData={this.state.selectedData}
				 Deduction={this.state.Deduction}
				 Variable={this.state.Variable}
				 companyData={profile}
				/> */}
					</div>
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PayrollConfigurations);
