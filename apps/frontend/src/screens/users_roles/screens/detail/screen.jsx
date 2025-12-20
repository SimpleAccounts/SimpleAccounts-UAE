import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import * as roleActions from '../create/actions';
import * as roleCommonActions from '../../actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
	strings.setLanguage('en');
} else {
	strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const updateRoleSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(30, 'Name is too long'),
	description: z.string().optional(),
});

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

const vatCode = /[a-zA-Z0-9 ]+$/;

const UpdateRole = ({
	commonActions,
	RoleActions,
	RoleCommonActions,
	history,
	location,
}) => {
	const [loading, setLoading] = useState(true);
	const [loadingMsg, setLoadingMsg] = useState('Loading...');
	const [disabled, setDisabled] = useState(false);
	const [disabled1, setDisabled1] = useState(false);
	const [checked, setChecked] = useState([]);
	const [roleList, setRoleList] = useState([]);
	const [count, setCount] = useState('');
	const [selectedStatus, setSelectedStatus] = useState(false);
	const [isActive, setIsActive] = useState(false);
	const [validationForSelect, setValidationForSelect] = useState(0);
	const [currentRoleId, setCurrentRoleId] = useState(null);
	const [dialog, setDialog] = useState(null);
	const [expanded, setExpanded] = useState(['SelectAll']);
	const [disableLeavePage, setDisableLeavePage] = useState(false);

	const form = useForm({
		resolver: zodResolver(updateRoleSchema),
		defaultValues: {
			name: '',
			description: '',
		},
		mode: 'onChange',
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		trigger,
	} = form;

	useEffect(() => {
		initializeData();
	}, []);

	const initializeData = useCallback(() => {
		if (location.state && location.state.id) {
			let initcount = 0;
			RoleCommonActions.getUsersCountForRole(location.state.id).then((res) => {
				if (res.status === 200) {
					initcount = res.data;
					setCount(initcount);
				}
			});

			setCurrentRoleId(location.state.id);
			RoleCommonActions.getModuleList(location.state.id)
				.then((res) => {
					if (res.status === 200) {
						let tempArray = [];
						res.data.map((value) => {
							tempArray.push(value.moduleId.toString());
						});
						setChecked(tempArray);
						reset({
							name: res.data ? res.data[0].roleName : '',
							description: res.data ? res.data[0].moduleDescription : '',
						});
						setIsActive(res.data ? res.data[0].isActive : false);
						setSelectedStatus(res.data ? res.data[0].isActive : false);
						setValidationForSelect(res.data.length);
						setLoading(false);
					}
				})
				.catch((err) => {
					history.push('/admin/settings/user-role');
				});
		} else {
			history.push('/admin/settings/user-role');
		}

		RoleActions.getRoleList().then((res) => {
			if (res.status === 200) {
				var result = res.data.map(function (el) {
					var o = Object.assign({}, el);
					o.value = el.moduleId;
					o.label = el.moduleName;
					if (el.moduleName === 'Customer Receipts') {
						o.label = 'Invoice Receipts';
					} else if (el.moduleName === 'Supplier Receipts') {
						o.label = 'Purchase Receipts';
					} else {
						o.label = el.moduleName;
					}
					return o;
				});
				list_to_tree(result);
			}
		});
	}, [location.state, RoleActions, RoleCommonActions, reset, history]);

	const list_to_tree = (arr) => {
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
		setRoleList(tree);
	};

	const onCheck = (checked) => {
		setChecked(checked);
		if (Array.isArray(checked) && checked.length !== 0) {
			setValidationForSelect(checked[0]);
		} else {
			setValidationForSelect(checked.length);
		}
	};

	const onExpand = (expanded) => {
		setExpanded(expanded);
	};

	const getvalidation = () => {
		let msg =
			validationForSelect !== 0 ? '' : 'Please select atleast 1 module';
		return <div className="text-danger">{msg}</div>;
	};

	const deleteRole = () => {
		const message1 = (
			<text>
				<b>Delete Role?</b>
			</text>
		);
		const message =
			'This Role will be deleted permanently and cannot be recovered. ';
		setDialog(
			<ConfirmDeleteModal
				isOpen={true}
				okHandler={removeRole}
				cancelHandler={removeDialog}
				message={message}
				message1={message1}
			/>
		);
	};

	const removeRole = () => {
		setDisabled1(true);
		RoleCommonActions.deleteRole(currentRoleId)
			.then((res) => {
				if (res.status === 200) {
					commonActions.tostifyAlert('success', 'Role Deleted Successfully');
					history.push('/admin/settings/user-role');
				}
			})
			.catch((err) => {
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong'
				);
				setDisabled1(false);
			});
	};

	const removeDialog = () => {
		setDialog(null);
	};

	const onSubmit = (data) => {
		if (count > 0 && selectedStatus === false) {
			commonActions.tostifyAlert(
				'error',
				'This role is in use , you are not allowed to inactive this role'
			);
			return;
		}

		if (validationForSelect === 0) {
			return;
		}

		setDisabled(true);

		let checkedModules = [...checked];
		let index = checkedModules.indexOf('SelectAll');
		if (index !== -1) {
			checkedModules.splice(index, 1);
		}

		const obj = {
			roleName: data.name,
			roleDescription: data.description,
			moduleListIds: checkedModules,
			roleID: location.state.id,
			isActive: isActive,
		};

		setLoading(true);
		setLoadingMsg('Updating Users Role');

		RoleActions.updateRole(obj)
			.then((res) => {
				if (res.status === 200) {
					setDisabled(false);
					commonActions.tostifyAlert('success', 'Role Updated Successfully!');
					history.push('/admin/settings/user-role');
					setLoading(false);
				}
			})
			.catch((err) => {
				setDisabled(false);
				setLoading(false);
				commonActions.tostifyAlert('error', err.data.message);
			});
	};

	const handleNameChange = (e, onChange) => {
		const value = e.target.value;
		if (value === '' || vatCode.test(value)) {
			onChange(e);
		}
	};

	const handleDescriptionChange = (e, onChange) => {
		const value = e.target.value;
		if (value === '' || vatCode.test(value)) {
			onChange(e);
		}
	};

	const handleFormSubmit = async () => {
		await trigger();
		const hasErrors = Object.keys(errors).length !== 0;
		if (hasErrors) {
			commonActions.fillManDatoryDetails();
		}
		handleSubmit(onSubmit)();
	};

	const nodes = [
		{
			value: 'SelectAll',
			label: 'Select All',
			children: roleList,
		},
	];

	if (loading === true) {
		return <Loader loadingMsg={loadingMsg} />;
	}

	return (
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
									<Row>
										<Col lg={6}>
											<Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
												<Row>
													<Col>
														<FormGroup className="mb-3">
															<Label htmlFor="active">
																<span className="text-danger">* </span>
																{strings.Status}
															</Label>
															&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
															<FormGroup check inline>
																<div className="custom-radio custom-control">
																	<input
																		className="custom-control-input"
																		type="radio"
																		id="inline-radio1"
																		name="active"
																		checked={selectedStatus}
																		value={true}
																		onChange={(e) => {
																			if (e.target.value === 'true') {
																				setSelectedStatus(true);
																				setIsActive(true);
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
																		checked={!selectedStatus}
																		onChange={(e) => {
																			if (e.target.value === 'false') {
																				setSelectedStatus(false);
																				setIsActive(false);
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
													</Col>
												</Row>
												<FormGroup>
													<Label htmlFor="name">
														<span className="text-danger">* </span> {strings.Name}
													</Label>
													<Controller
														name="name"
														control={control}
														render={({ field }) => (
															<Input
																type="text"
																maxLength="30"
																id="name"
																placeholder={strings.Enter + strings.Name}
																{...field}
																onChange={(e) => handleNameChange(e, field.onChange)}
																className={errors.name ? 'is-invalid' : ''}
															/>
														)}
													/>
													{errors.name && (
														<div className="invalid-feedback">{errors.name.message}</div>
													)}
												</FormGroup>
												<FormGroup>
													<Label htmlFor="description">
														{' '}
														{strings.Description}{' '}
													</Label>
													<Controller
														name="description"
														control={control}
														render={({ field }) => (
															<Input
																type="text"
																id="description"
																placeholder={strings.Description}
																{...field}
																onChange={(e) =>
																	handleDescriptionChange(e, field.onChange)
																}
																className={
																	errors.description ? 'is-invalid' : ''
																}
															/>
														)}
													/>
												</FormGroup>
												<FormGroup>
													<Label>
														<span className="text-danger">* </span>
														{strings.Modules}
														{getvalidation()}
													</Label>
													<CheckboxTree
														id="RoleList"
														name="RoleList"
														nodes={nodes}
														checked={checked}
														expanded={expanded}
														iconsClass="fa5"
														checkModel="all"
														onCheck={onCheck}
														onExpand={onExpand}
													/>
												</FormGroup>

												<FormGroup className="mt-5">
													<Row>
														<Col>
															{count === 0 &&
																currentRoleId != 1 &&
																currentRoleId != 2 &&
																currentRoleId != 3 &&
																currentRoleId != 104 &&
																currentRoleId != 105 && (
																	<Button
																		type="button"
																		color="danger"
																		className="btn-square mr-3"
																		disabled={disabled1}
																		onClick={deleteRole}
																	>
																		<i className="fa fa-trash"></i>{' '}
																		{disabled1 ? 'Deleting...' : strings.Delete}
																	</Button>
																)}
														</Col>

														<Button
															type="button"
															name="submit"
															color="primary"
															className="btn-square mr-3"
															disabled={disabled}
															onClick={handleFormSubmit}
														>
															<i className="fa fa-dot-circle-o"></i>
															{disabled ? 'Updating...' : strings.Update}
														</Button>

														<Button
															type="button"
															color="secondary"
															className="btn-square"
															onClick={() => {
																history.push('/admin/settings/user-role');
															}}
														>
															<i className="fa fa-ban"></i> {strings.Cancel}
														</Button>
													</Row>
												</FormGroup>
											</Form>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateRole);
