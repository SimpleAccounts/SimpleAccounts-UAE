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
	Input,
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';

import { Loader, ConfirmDeleteModal } from 'components';

import * as UserActions from './actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import { CSVLink } from 'react-csv';

import moment from 'moment';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-datepicker/dist/react-datepicker.css';

import './style.scss';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		user_list: state.user.user_list,
		role_list: state.user.role_list,
		company_type_list: state.user.company_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		userActions: bindActionCreators(UserActions, dispatch),
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
class User extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: true,
			selectedRows: [],
			dialog: false,
			filterData: {
				name: '',
				dob: '',
				active: '',
				// companyId: '',
				roleId: '',
			},
			selectedStatus: '',
			csvData: [],
			view: false,
		};

		this.statusOption = [
			{ label: 'Select Status', value: '' },
			{ label: 'Active', value: '1' },
			{ label: 'InActive', value: '0' },
		];

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

		// this.selectRowProp = {
		// 	mode: 'checkbox',
		// 	bgColor: 'rgba(0,0,0, 0.05)',
		// 	clickToSelect: false,
		// 	onSelect: this.onRowSelect,
		// 	onSelectAll: this.onSelectAll,
		// };
		this.csvLink = React.createRef();
	}

	componentDidMount = () => {
		this.props.userActions.getRoleList();
		this.initializeData();
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

		this.props.userActions
			.getUserList(postData)
			.then((res) => {
				if (res.status === 200) {
					// this.props.userActions.getCompanyTypeList()
					this.setState({ loading: false });
				}
			})
			.catch((err) => {
				this.setState({
					loading: false,
				});
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};
	renderStatus = (cell, row) => {

        let classname = '';
        if (row.active === true) {
            classname = 'label-success';
        } else {
            classname = 'label-due';
        }
        return (
            <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
                {
                    row.active === true ?
                        "Active" :
                        "InActive"

                }
            </span>
        );

    };
	goToDetail = (row) => {
		this.props.history.push('/admin/settings/user/detail', { id: row.id });
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
			rows.map((item) => {
				tempList.push(item.id);
				return item;
			});
		}
		this.setState({
			selectedRows: tempList,
		});
	};

	bulkDelete = () => {
		const { selectedRows } = this.state;
		const message1 =
        <text>
        <b>Delete User?</b>
        </text>
        const message = 'This User will be deleted permanently and cannot be recovered. ';
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
	};

	removeBulk = () => {
		let { selectedRows } = this.state;
		const { user_list } = this.props;
		let obj = {
			ids: selectedRows,
		};
		this.removeDialog();
		this.props.userActions
			.removeBulk(obj)
			.then((res) => {
				this.initializeData();
				this.props.commonActions.tostifyAlert(
					'success',
					'User Deleted Successfully',
				);
				if (user_list && user_list.length > 0) {
					this.setState({
						selectedRows: [],
					});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	renderDate = (cell, row) => {
		return row['dob'] !== null
			? moment(row['dob'], 'DD-MM-YYYY').format('DD-MM-YYYY')
			: '';
	};

	renderRole = (cell, row) => {
		return row['role'] ? row['role']['roleName'] : '';
	};

	renderCompany = (cell, row) => {
		return row['company'] ? row['company']['companyName'] : '';
	};

	// renderStatus = (cell, row) => {
	// 	return row['active'] !== ''
	// 		? row['active'] === true
	// 			? 'Active'
	// 			: 'InActive'
	// 		: '';
	// };

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
			this.props.userActions.getUserList(obj).then((res) => {
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
					dob: '',
					active: '',
					roleId: '',
				},
			},
			() => {
				this.initializeData();
			},
		);
	};

	render() {
		strings.setLanguage(this.state.language);
		const {
			loading,
			dialog,
			selectedRows,
			filterData,
			csvData,
			view,
		} = this.state;
		const { user_list, role_list } = this.props;

		return (
			loading ==true? <Loader/> :
<div>
			<div className="user-screen">
				<div className="animated fadeIn">
					{/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-users" />
										<span className="ml-2"> {strings.User} </span>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							{dialog}
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
                            color="success"
                            className="btn-square"
                            onClick={() => this.getCsvData()}
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />Export To CSV
                          </Button>
                          {view && <CSVLink
                            data={csvData}
                            filename={'User.csv'}
                            className="hidden"
                            ref={this.csvLink}
                            target="_blank"
                          />} */}

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
										<div className="py-3">
											<h5>{strings.Filter}: </h5>
											<Row>
												<Col lg={2} className="mb-1">
													<Input
														type="text"
														value={filterData.name}
														placeholder={strings.Enter + strings.UserName}
														onChange={(e) => {
															this.handleChange(e.target.value, 'name');
														}}
													/>
												</Col>
												{/* <Col lg={2} className="mb-1">
													<DatePicker
														className="form-control"
														id="date"
														name="dob"
														placeholderText="Date of Birth"
														showMonthDropdown
														showYearDropdown
														autoComplete="off"
														dateFormat="dd-MM-yyyy"
														dropdownMode="select"
														selected={filterData.dob}
														value={filterData.dob}
														onChange={(value) => {
															this.handleChange(value, 'dob');
														}}
													/>
												</Col> */}
												{/* <Col lg={2} className="mb-1">
													<Select
														styles={customStyles}
														className="select-default-width"
														placeholder={strings.Select+strings.Role}
														id="roleId"
														name="roleId"
														options={
															role_list
																? selectOptionsFactory.renderOptions(
																		'roleName',
																		'roleCode',
																		role_list,
																		'Role',
																  )
																: []
														}
														value={filterData.roleId}
														onChange={(option) => {
															if (option && option.value) {
																this.handleChange(option, 'roleId');
															} else {
																this.handleChange('', 'roleId');
															}
														}}
													/>
												</Col> */}
												<Col lg={2} className="mb-1">
													<Select
														styles={customStyles}
														className="select-default-width"
														placeholder={strings.Select+strings.Status}
														id="active"
														name="active"
														options={this.statusOption ? this.statusOption : []}
														// value={filterData.supplierId}
														value={filterData.active}
														onChange={(option) => {
															if (option) {
																this.handleChange(option, 'active');
																this.setState({ selectedStatus: option });
															} else {
																this.handleChange('1', 'active');
																this.setState({ selectedStatus: '1' });
															}
														}}
													/>
												</Col>
												{/* <Col lg={2} className="mb-1">
                          <Select
                              className="select-default-width"
                              placeholder="Select Company"
                              id="companyId"
                              name="companyId"
                              options={company_type_list ? selectOptionsFactory.renderOptions('label', 'value', company_type_list , 'Company') : []}
                              value={filterData.companyId}
                              onChange={(option) => { this.handleChange(option.value, 'companyId') }}
                            />
                          </Col> */}
												<Col lg={3} className="pl-0 pr-0">
													<Button
														type="button"
														color="primary"
														className="btn-square mr-1"
														onClick={this.handleSearch}
													>
														<i className="fa fa-search"></i>
													</Button>
													<Button
														type="button"
														color="primary"
														className="btn-square"
														onClick={this.clearAll}
													>
														<i className="fa fa-refresh"></i>
													</Button>
												</Col>
											</Row>
										</div>
										<Button
											color="primary"
											style={{ marginBottom: '10px' }}
											className="btn-square pull-right mb-2"
											onClick={() =>
												this.props.history.push(`/admin/settings/user/create`)
											}
										>
											<i className="fas fa-plus mr-1" />
											 {strings.AddNewUsers}
										</Button>  
										<div>
											<BootstrapTable
												selectRow={this.selectRowProp}
												search={false}
												options={this.options}
												data={user_list && user_list.data ? user_list.data : []}
												version="4"
												hover
												keyField="id"
												pagination
												remote
												fetchInfo={{
													dataTotalSize: user_list.count ? user_list.count : 0,
												}}
												className="product-table"
												trClassName="cursor-pointer"
												ref={(node) => {
													this.table = node;
												}}
											>
												<TableHeaderColumn dataField="fullName"       className="table-header-bg" dataSort>
													  {strings.UserName}
												</TableHeaderColumn>
												<TableHeaderColumn
													dataField="dob"
													dataSort
													className="table-header-bg"
													dataFormat={this.renderDate}
												>
													{strings.DOB}
												</TableHeaderColumn>
												<TableHeaderColumn
												    className="table-header-bg"
													dataField="roleName"
													dataSort
													// dataFormat={this.renderRole}
												>
													 {strings.RoleName}
												</TableHeaderColumn>
												<TableHeaderColumn
												      className="table-header-bg"
													dataField="active"
													dataSort
													dataFormat={this.renderStatus}
												>
													 {strings.Status}
												</TableHeaderColumn>
												{/* <TableHeaderColumn
                            dataField="companyName"
                            dataSort
                            // dataFormat={this.renderCompany}
                          >
                            Company
                          </TableHeaderColumn> */}
											</BootstrapTable>
										</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(User);
