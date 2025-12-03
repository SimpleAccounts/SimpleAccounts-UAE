import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Row,
	Input,
	ButtonGroup,
	Col,
	Form,
	FormGroup,
	Label,
} from 'reactstrap';
import { ToastContainer } from 'react-toastify';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import config from '../../constants/config'
import Select from 'react-select';

import { Loader } from 'components';

import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';

import * as RolesActions from './actions';
import {data}  from '../Language/index'
import LocalizedStrings from 'react-localization';
import { CommonActions } from 'services/global';

const mapStateToProps = (state) => {
	return {
		role_list: state.user.role_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		rolesActions: bindActionCreators(RolesActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class UsersRoles extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			openInviteUserModal: false,
			loading: false,
			users: [
				{
					name: 'niklas',
					email: 'niklas@niklas.com',
					avatar: 'assets/images/avatars/6.jpg',
					role: 'Admin',
					status: 'active',
				},
				{
					name: 'admin',
					email: 'admin@admin.com',
					avatar: 'assets/images/avatars/6.jpg',
					role: 'Accountant',
					status: 'pending',
				},
				{
					name: 'user',
					email: 'user@user.com',
					avatar: 'assets/images/avatars/6.jpg',
					role: 'Employee',
					status: 'active',
				},
			],
		};
		this.options = {

			onRowClick: this.goToDetail,
			sortName: '',
			sortOrder: '',
			onSortChange: this.sortColumn,
		};

		
	}

	componentDidMount = () => {
		this.initializeData();
	};
	initializeData = () => {
		const sortingData = {
			order: this.options.sortOrder ? this.options.sortOrder : '',
			sortingCol: this.options.sortName ? this.options.sortName : '',
		};
		const postData = {...sortingData };
		this.props.rolesActions.getRoleList(postData);
		this.props.rolesActions.getRoleList();		
	};

	// Show Invite User Modal
	showInviteUserModal = () => {
		this.setState({ openInviteUserModal: true });
	};
	// Cloase Confirm Modal
	closeInviteUserModal = () => {
		this.setState({ openInviteUserModal: false });
	};
	sortColumn = (sortName, sortOrder) => {
		this.options.sortName = sortName;
		this.options.sortOrder = sortOrder;
		this.initializeData();
	};

	goToDetail = (row) => {
		{
			row.roleCode === 1 || row.roleCode === 2 ||row.roleCode === 3 ||row.roleCode === 104 ||row.roleCode === 105 ? 
			this.props.commonActions.tostifyAlert('error', 'You Cannot Edit '+row.roleName+' Role')
			 :
			this.props.history.push('/admin/settings/user-role/update', {
			id: row.roleCode,
		    });
		}	
	};
	getUserName = (cell, row) => {
		return (
			<div className="d-flex">
					<div className="ml-2">
					<div>{row.roleName}</div>
				</div>
			</div>
		);
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

	render() {
		strings.setLanguage(this.state.language);
		const { loading, openInviteUserModal } = this.state;
		const containerStyle = {
			zIndex: 1999, closeOnClick: true,
			draggable: true
		};
		const { role_list } = this.props;
		return (
			loading == true ? <Loader /> :
				<div>
					<div className="transaction-category-screen">
						<div className="animated fadeIn">
							<ToastContainer
								closeOnClick
								draggable
								position="top-right"
								autoClose={1700}
								style={containerStyle}
							/>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-users" />
										<span className="ml-2">{strings.Role}</span>
									</div>
								</CardHeader>
								<CardBody>
									{loading ? (
										<Loader></Loader>
									) : (
										<Row>
											<Col lg="12">
												<div className="d-flex justify-content-end"></div>
												{/* <div className="py-3">
											<h5>Filter : </h5>
											<Row>
												<Col lg={2} className="mb-1">
													<Input type="text" placeholder="User Name" />
												</Col>
												<Col lg={2} className="mb-1">
													<Select
														className=""
														options={role_list}
														placeholder="User Role"
													/>
												</Col>
											</Row>
										</div> */}

												{config.ADD_ROLES && <Button
													color="primary"
													style={{ marginBottom: '10px' }}
													className="btn-square pull-right"
													onClick={() =>
														this.props.history.push(
															`/admin/settings/user-role/create`,
														)
													}
												>
													<i className="fas fa-plus mr-1" />
													{strings.AddNewRole}
												</Button>}
												<BootstrapTable
													data={role_list}
													hover
													pagination
													version="4"
													search={false}
													selectRow={this.selectRowProp}
													options={this.options}
													trClassName="cursor-pointer"
												>
													<TableHeaderColumn
														isKey
														dataField="roleName"
														className="table-header-bg"
														dataFormat={this.getUserName}
														dataSort
													>
														{strings.UserDetail}
													</TableHeaderColumn>
													<TableHeaderColumn
														dataField="roleName"
														className="table-header-bg"
														dataSort
													>
														{strings.Role}
													</TableHeaderColumn>
													<TableHeaderColumn
														dataField="isActive"
														dataFormat={this.renderStatus}
														className="table-header-bg"
														dataSort
													>
														{strings.Status}
													</TableHeaderColumn>
												</BootstrapTable>
											</Col>
										</Row>
									)}
								</CardBody>
							</Card>
							<Modal
								isOpen={openInviteUserModal}
								className={'modal-success ' + this.props.className}
							>
								<ModalHeader toggle={this.toggleDanger}> {strings.InviteUser} </ModalHeader>
								<ModalBody>
									<Form onSubmit={this.handleSubmit} name="simpleForm">
										<FormGroup>
											<Label htmlFor="categoryName">*{strings.CompanyName}</Label>
											<Input
												type="text"
												id="categoryName"
												name="categoryName"
												placeholder={strings.Enter + strings.UserName}
												required
											/>
										</FormGroup>
										<FormGroup>
											<Label htmlFor="categoryCode">*{strings.Email}</Label>
											<Input
												type="text"
												id="categoryCode"
												name="categoryCode"
												placeholder={strings.Enter + strings.Email}
												required
											/>
										</FormGroup>
										<FormGroup>
											<Label htmlFor="categoryCode"> {strings.Position}</Label>
											<Select
												className="select-min-width"
												options={[]}
												placeholder={strings.Position}
											/>
										</FormGroup>
									</Form>
								</ModalBody>
								<ModalFooter>
									<Button
										color="success"
										className="btn-square"
										onClick={this.closeInviteUserModal}
									>
										{strings.Send}
									</Button>
									&nbsp;
									<Button
										color="secondary"
										className="btn-square"
										onClick={this.closeInviteUserModal}
									>
										{strings.No}
									</Button>
								</ModalFooter>
							</Modal>
						</div>
					</div>
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersRoles);
