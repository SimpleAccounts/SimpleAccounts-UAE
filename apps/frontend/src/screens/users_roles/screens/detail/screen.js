import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Input,
	Form,
	FormGroup,
	Label,
	Row,
	Col,
} from 'reactstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { LeavePage, Loader } from 'components';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import {  ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import * as roleActions from '../../screens/create/actions';
import * as roleCommonActions from '../../actions';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { Formik } from 'formik';

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		RoleActions: bindActionCreators(roleActions, dispatch),
		RoleCommonActions: bindActionCreators(roleCommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class UpdateRole extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			disabled: false,
			language: window['localStorage'].getItem('language'),
			initValue: {},
			loading: true,
			createMore: false,
			checked: [],
			roleList: [],
			count:'',
			selectedStatus: false,
			isActive: false,
			isChecked: true,
			validationForSelect:0,
			current_role_id:null,
			dialog: null,
			expanded: ["SelectAll"],
			loadingMsg:"Loading...",
			disableLeavePage:false
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExDecimal = /^[0-9]*(\.[0-9]{0,2})?$/;
		this.regEx = /^[0-9\d]+$/;
		this.vatCode = /[a-zA-Z0-9 ]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		if (this.props.location.state && this.props.location.state.id) {
			//For inactive role
			let initcount=0
			this.props.RoleCommonActions.getUsersCountForRole(this.props.location.state.id).then((res) => {
				if (res.status === 200) {				
					// if (res.data === 0){
					// 	this.setState({count:0});
					// }
					initcount= res.data
				}
			});
			//getbyid
			this.setState({current_role_id:this.props.location.state.id});
			this.props.RoleCommonActions.getModuleList(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						let tempArray = [];
						res.data.map((value) => {
							tempArray.push(value.moduleId.toString());
						});
						this.setState(
							{
								checked: tempArray,
								initValue: {
									name: res.data ? res.data[0].roleName : '',
									description: res.data ? res.data[0].moduleDescription : '',
									isActive: res.data ? res.data[0].isActive : '',
									selectedStatus: res.data ? res.data[0].isActive : '',
								},
								isActive: res.data ? res.data[0].isActive : '',
								selectedStatus: res.data ? res.data[0].isActive : '',
								loading: false,
								count:initcount,
								validationForSelect:res.data.length
							},
							() => {},
						);
					}
				})
				.catch((err) => {
					this.props.history.push('/admin/settings/user-role');
				});

				
		} else {
			this.props.history.push('/admin/settings/user-role');
		}
		this.props.RoleActions.getRoleList().then((res) => {
			if (res.status === 200) {
				var result = res.data.map(function (el) {
					var o = Object.assign({}, el);
					o.value = el.moduleId;
					o.label = el.moduleName;
					if (el.moduleName === "Customer Receipts") {
						o.label = "Invoice Receipts";
					} else if(el.moduleName === "Supplier Receipts"){
						o.label = "Purchase Receipts";
					} else {
						o.label = el.moduleName;
					}
					return o;
				});
				this.list_to_tree(result);
			}
		});
		
	};

	list_to_tree = (arr) => {
		let arrMap = new Map(arr.map((item) => [item.moduleId, item]));
		let tree = [];

		for (let i = 0; i < arr.length; i++) {
			let item = arr[i];

			if (item.parentModuleId) {
				let parentItem = arrMap.get(item.parentModuleId);

				if (parentItem) {
					let { children } = parentItem;

					if (children) {
						parentItem.children.push(item);
					} else {
						parentItem.children = [item];
					}
				}
			} else {
				tree.push(item);
			}
		}
		this.setState({ roleList: tree });
	};

	// Save Updated Field's Value to State
	handleChange = (e, name) => {
		this.setState({
			vatData: _.set(
				{ ...this.state.vatData },
				e.target.name && e.target.name !== '' ? e.target.name : name,
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
			),
		});
	};

	// Show Success Toast
	success = () => {
		toast.success('VAT Code Updated successfully... ', {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	// Create or Edit VAT
	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		
		let index =this.state.checked ? this.state.checked.indexOf('SelectAll') :-1;
		if(index != -1) {
			this.state.checked.splice(index, 1); // remove 1 element from index 
		}
		
		const obj = {
			roleName: data.name,
			roleDescription: data.description,
			moduleListIds: this.state.checked,
			roleID: this.props.location.state.id,
			isActive:this.state.isActive
		};
		{this.setState({ loading:true, loadingMsg:"Updating Users Role"})} 
		this.props.RoleActions.updateRole(obj)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						'Role Updated Successfully!',
					);
					resetForm();
					if (this.state.createMore) {
						this.setState({
							createMore: false,
						});
					} else {
						this.props.history.push('/admin/settings/user-role');
						{this.setState({ loading:false,})}
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert('error', err.data.message);
			});
	};

	onCheck = (checked) => {
		this.setState({ checked }, () => {
			console.log(this.state.checked);
		});
		if(Array.isArray(checked) && checked.length !== 0 )
		this.setState({validationForSelect:checked[0]})
		else
		this.setState({validationForSelect:checked.length})
	};

	// toggleChange = () => {
	// 	// 	this.setState({
	// 	// 	  isChecked: !this.state.isChecked,
	// 	// 	});
			
	// 	//   }
	getvalidation=()=>{
	
		let msg = this.state && this.state.validationForSelect && this.state.validationForSelect!=0 ?
																		 "" :  "Please select atleast 1 module"
																		 return<div className="text-danger">{msg}</div> 
}

	onExpand = (expanded) => {
		this.setState({ expanded });
	};
	deleteRole = () => {
		
		const message1 = (
			<text>
				<b>Delete Role?</b>
			</text>
		);
		const message =
			'This Role will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeRole}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};

	removeRole = () => {
		this.setState({ disabled1: true });
		const { current_role_id } = this.state;
			this.props.RoleCommonActions
			.deleteRole(current_role_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Role Deleted Successfully',
					);
					this.props.history.push('/admin/settings/user-role');
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

	render() {
		strings.setLanguage(this.state.language);
		const { loading, initValue,dialog ,current_role_id,loadingMsg} = this.state;
		const { checked, expanded } = this.state;
		const nodes = [
			{
			  value: "SelectAll",
			  label: "Select All",
			  children: this.state.roleList
			//   [
			// 	{ value: "mercury", label: "Mercury" },
			// 	{
			// 	  value: "jupiter",
			// 	  label: "Jupiter",
			// 	  children: [
			// 		{ value: "io", label: "Io" },
			// 		{ value: "europa", label: "Europa" },
			// 	  ],
			// 	},
			//   ]
			  ,
			},
		  ];
		  
		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
<div>
			<div className="role-create-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
											<div className="h4 mb-0 d-flex align-items-center">
												<i className="nav-icon fas fa-users" />
												<span className="ml-2"> {strings.UpdateNewRole} </span>
											</div>
								</CardHeader>
								<CardBody>
									{dialog}
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col lg={6}>
												<Formik
													initialValues={initValue}
													onSubmit={(values, { resetForm }) => {
														
														if (this.state.count >0 && this.state.selectedStatus===false) {
															this.props.commonActions.tostifyAlert(
																'error',
																'This role is in use , you are not allowed to inactive this role',
															);
														}else{
															if(this.state.validationForSelect > 0){	this.handleSubmit(values, resetForm);}
														}
													}}
													validate={(values) => {
														// let status = false
														let errors = {};
														if (!values.name) {
															errors.name = 'Name is  required';
														}
														return errors;
													}}
												>
													{(props) => (
														<Form
															onSubmit={props.handleSubmit}
															name="simpleForm"
														>
															<Row>
																	<Col >
																		<FormGroup className="mb-3">
																			<Label htmlFor="active"><span className="text-danger">* </span>{strings.Status}</Label>
																			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
																				<FormGroup check inline>
																					<div className="custom-radio custom-control">
																						<input
																							className="custom-control-input"
																							type="radio"
																							id="inline-radio1"
																							name="active"
																							checked={
																								this.state.selectedStatus
																							}
																							value={true}
																							onChange={(e) => {
																								if (
																									e.target.value === 'true'
																								) {
																									this.setState({
																										selectedStatus: true,
																										isActive: true
																									});
																								}
																							}}
																						/>
																						<label
																							className="custom-control-label"
																							htmlFor="inline-radio1"
																						>
																							{strings.Active}
																							</label>
																					</div>
																				</FormGroup>
																				<FormGroup check inline>
																					<div className="custom-radio custom-control">
																						<input
																							className="custom-control-input"
																							type="radio"
																							id="inline-radio2"
																							name="active"
																							value={false}
																							checked={
																								!this.state.selectedStatus
																							}
																							onChange={(e) => {
																								if (
																									e.target.value === 'false'
																								) {
																									this.setState({
																										selectedStatus: false,
																										isActive: false
																									});
																								}
																							}}
																						/>
																						<label
																							className="custom-control-label"
																							htmlFor="inline-radio2"
																						>
																							{strings.Inactive}
																							</label>
																					</div>
																				</FormGroup>
																			
																		</FormGroup>
																	</Col></Row>
															<FormGroup>
																<Label htmlFor="name">
																	<span className="text-danger">* </span> {strings.Name}
																</Label>
																<Input
																	type="text"
																	maxLength="30"
																	id="name"
																	name="name"
																	placeholder={strings.Enter+strings.Name}
																	onBlur={props.handleBlur}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.vatCode.test(option.target.value)
																		) {
																			props.handleChange('name')(option);
																		}
																	}}
																	value={props.values.name}
																	className={
																		props.errors.name && props.touched.name
																			? 'is-invalid'
																			: ''
																	}
																/>
																{props.errors.name && props.touched.name && (
																	<div className="invalid-feedback">
																		{props.errors.name}
																	</div>
																)}
															</FormGroup>
															<FormGroup>
																<Label htmlFor="name"> {strings.Description} </Label>
																<Input
																	type="text"
																	id="description"
																	name="description"
																	placeholder={strings.Description}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.vatCode.test(option.target.value)
																		) {
																			props.handleChange('description')(option);
																		}
																	}}
																	value={props.values.description}
																	className={
																		props.errors.description &&
																		props.touched.description
																			? 'is-invalid'
																			: ''
																	}
																/>
															</FormGroup>
															<FormGroup>
																<Label><span className="text-danger">* </span>{strings.Modules}
																{
																	this.getvalidation()
																}
																</Label>
																<CheckboxTree
																	id="RoleList"
																	name="RoleList"
																    nodes={nodes}
																	checked={checked}
																	expanded={expanded}
																	iconsClass="fa5"
																	checkModel="all"
																	// nodes={this.state.roleList}
																	onCheck={this.onCheck}
																	onExpand={this.onExpand}
																	type="checkbox"
																defaultChecked={this.state.isChecked}
																onChange={this.toggleChange}
																/>
															</FormGroup>
															
															<FormGroup  className="mt-5">
																<Row>

																<Col>
																{this.state.count === 0 &&
																//default roles should not be deleted
																 current_role_id !=1   &&current_role_id !=2   &&current_role_id!=3 &&
																 current_role_id !=104 &&current_role_id !=105 &&
																	  (
																		
																		<Button
																			type="button"
																			color="danger"
																			className="btn-square mr-3"
																				disabled1={this.state.disabled1}
																			onClick={this.deleteRole}
																		>
																			<i className="fa fa-trash"></i> {this.state.disabled1
																			? 'Deleting...'
																			: strings.Delete }
																		</Button>
																
																	)}</Col>
															
																	<Button
																	type="button"
																	name="submit"
																	color="primary"
																	className="btn-square mr-3"
																	disabled={this.state.disabled}
																	onClick={() => {
																		
																	//	added validation popup	msg	
																	props.handleBlur();
																	if(props.errors &&  Object.keys(props.errors).length != 0)
																	this.props.commonActions.fillManDatoryDetails();
																		this.setState({ createMore: false }, () => {
																			props.handleSubmit();
																		});
																	}}
																>
																	<i className="fa fa-dot-circle-o"></i>	{this.state.disabled
																				? 'Updating...'
																				: strings.Update}
																</Button>

																<Button
																	type="submit"
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		this.props.history.push(
																			'/admin/settings/user-role',
																		);
																	}}
																>
																	<i className="fa fa-ban"></i> {strings.Cancel}
																</Button>
																	</Row>
																
															{/* <FormGroup className="text-right mt-5"> */}
																
															</FormGroup>
														</Form>
													)}
												</Formik>
											</Col>
										</Row>
									)}
								</CardBody>
							</Card>
						</Col>
					</Row>

				</div>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateRole);
