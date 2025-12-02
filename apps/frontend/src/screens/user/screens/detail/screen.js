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
	Form,
	FormGroup,
	Input,
	Label,
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { LeavePage, Loader, ConfirmDeleteModal, ImageUploader } from 'components';
import * as UserActions from '../../actions';
import * as UserDetailActions from './actions';
import { CommonActions, AuthActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import moment from 'moment';
import { Formik } from 'formik';
import * as Yup from 'yup';
// import 'react-images-uploader/styles.css'
// import 'react-images-uploader/font.css'
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { toast } from 'react-toastify';
import { upperCase, upperFirst } from 'lodash';

const eye = require('assets/images/settings/eye.png');
const mapStateToProps = (state) => {
	return {
		role_list: state.user.role_list,
		employee_list: state.user.employee_list,
		profile: state.auth.profile,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		userDetailActions: bindActionCreators(UserDetailActions, dispatch),
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
class DetailUser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			isPasswordShown: false,
			loading: true,
			dialog: null,
			initValue: {},
			// passwordShown: false,
			selectedStatus: '',
			userPhoto: [],
			showIcon: false,
			userPhotoFile: {},
			imageState: true,
			current_user_id: null,
			disabled: false,
			disabled1: false,
			userPhotoChange:false,
			timezone: [],
			exist: false,
			loadingMsg: "Loading...",
			disableLeavePage: false,
			enableDelete: true,
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
	}

	componentDidMount = () => {
		this.props.userActions.getEmployeesNotInUserForDropdown();
		this.initializeData();
	};

	initializeData = () => {
		this.props.authActions.getTimeZoneList().then((response) => {
			let output = response.data.map(function (value) {
				return { label: value, value: value };
			});
			this.setState({ timezone: output });
		});
		if (this.props.location.state && this.props.location.state.id) {
			this.props.userActions.getPayrollCount(this.props.location.state.id).then((res) => {
				if (res.status === 200) {
					this.setState({ enableDelete: res.data && res.data > 0 ? false : true })
				}
			});
			this.props.userDetailActions.getUserById(this.props.location.state.id).then((res) => {
				this.props.userActions.getRoleList();
				if (res.status === 200) {
					const employeeId = res.data.employeeId ? { value: res.data.employeeId, label: `${res.data.empFirstName} ${res.data.empLastName}` } : null;
					this.setState({
						initValue: {
							firstName: res.data.firstName ? res.data.firstName : '',
							lastName: res.data.lastName ? res.data.lastName : '',
							email: res.data.email ? res.data.email : '',
							password: '',
							dob: res.data.dob ? moment(res.data.dob, 'DD-MM-YYYY').toDate() : '',
							active: res.data.active ? res.data.active : '',
							confirmPassword: '',
							roleId: res.data.roleId ? res.data.roleId : '',
							companyId: res.data.companyId ? res.data.companyId : '',
							timeZone: res.data.timeZone ? res.data.timeZone : '',
							roleName: res.data.roleName ? res.data.roleName : '',
							employeeId: employeeId,
						},
						loading: false,
						selectedStatus: res.data.active ? true : false,
						userPhoto: res.data.profilePicByteArray ? this.state.userPhoto.concat(res.data.profilePicByteArray) : [],
						current_user_id: this.props.location.state.id,
						isEmployeeIdDisabled: !!employeeId,
						});
					}
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
					this.props.history.push('/admin/settings/user');
				});
		} else {
			this.props.history.push('/admin/settings/user');
		}
	};

	uploadImage = (picture, file) => {
		if (
			this.state.userPhoto[0] &&
			this.state.userPhoto[0].indexOf('data') < 0
		) {
			this.setState({ imageState: true });
		} else {
			this.setState({ imageState: false });
		}
		this.setState({
			userPhoto: picture,
			userPhotoFile: file,
			userPhotoChange:true,
		});
	};
	// togglePasswordVisiblity = () => {
	// 	this.setState({
	// 		passwordShown: !this.state.passwordShown,
	// 	});
	// };

	togglePasswordVisiblity = () => {
		const { isPasswordShown } = this.state;
		this.setState({ isPasswordShown: !isPasswordShown });
	};
	deleteUser = () => {
		const message1 = (
			<text>
				<b>Delete User?</b>
			</text>
		);
		const message =
			'This User will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeUser}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	};

	removeUser = () => {
		this.setState({ disabled1: true });
		const { current_user_id } = this.state;
		this.props.userDetailActions
			.deleteUser(current_user_id)
			.then((res) => {
				if (res.status === 200) {
					// this.success('Chart Account Deleted Successfully');
					this.props.commonActions.tostifyAlert(
						'success',
						'User Deleted Successfully',
					);
					this.props.history.push('/admin/settings/user');
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

	updateRoles = (id) => {
		this.props.authActions
			.checkAuthStatus()
			.then((response) => {
				this.props.commonActions.getRoleList(id);
			})
			.catch((err) => {
				this.props.authActions.logOut();
				this.props.history.push('/login');
			});
	};

	handleSubmit = (data) => {
		this.setState({ createDisabled: true, disableLeavePage: true });
		const {
			firstName,
			lastName,
			email,
			dob,
			password,
			roleId,
			companyId,
			timeZone,
			employeeId
		} = data;
		const { current_user_id } = this.state;
		const { userPhotoFile } = this.state;
		let formData = new FormData();
		formData.append('id', +current_user_id);

		formData.append('firstName', firstName ? firstName : '');
		formData.append('lastName', lastName ? lastName : '');
		formData.append('email', email ? email : '');
		formData.append('timeZone', timeZone ? timeZone : '');
		formData.append('userPhotoChange', this.state.userPhotoChange);
		formData.append('dob', dob ? moment(dob).format('DD-MM-YYYY') : '');
		formData.append(
			'roleId',
			typeof roleId !== 'object' ? roleId : roleId.value,
		);
		formData.append('active', this.state.selectedStatus);
		// formData.append('password', password ? password : '');
		formData.append('companyId', companyId ? companyId : '');
		formData.append('employeeId', employeeId ? employeeId.value : '');
		if (this.state.userPhotoFile.length > 0) {
			formData.append('profilePic', userPhotoFile[0]);
		}
		//if (this.state.initValue !== data)
		{
			this.setState({ disabled: true });
			{ this.setState({ loading: true, loadingMsg: "Updating User" }) }
			this.props.userDetailActions
				.updateUser(formData)
				.then((res) => {
					if (res.status === 200) {
						this.setState({ disabled: false });
						this.props.commonActions.tostifyAlert(
							'success',
							'User Updated Successfully',
						);
						//	this.updateRoles(+current_user_id);
						this.props.history.push('/admin/settings/user');
						{ this.setState({ loading: false, }) }
					}
				})
				.catch((err) => {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
				});
		}
	};
	validationCheck = (value) => {
		const data = {
			moduleType: 9,
			name: value,
		};
		this.props.userDetailActions.checkValidation(data).then((response) => {
			if (response.data === 'User Already Exists') {
				this.setState({
					exist: true,
					disabled: false,
				})
			} else {
				this.setState({
					exist: false,
				});
			}
		});
	};
	sendInviteMail = (event) => {
		const { current_user_id } = this.state;
		this.props.userDetailActions.getUserInviteEmail(current_user_id, window.location.origin).then((response) => {
			if (response.status === 200) {
				toast.success("Mail Sent Successfully !")
			} else {
				toast.success("Mail Sent UnSuccessfully !")
			}
		}).catch(
			(e) => {
				toast.success("Mail Sent UnSuccessfully !")
			}
		);
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading, dialog, timezone, current_user_id, loadingMsg } = this.state;
		const { role_list, employee_list, profile } = this.props;
		const { isPasswordShown, enableDelete } = this.state;
		const current_loggin_user_roleId = profile?.role.roleCode;
		console.log(current_loggin_user_roleId);
		let active_roles_list = [];
		role_list && role_list.length !== 0 && role_list.map(row => {
			if (row.isActive == true) { active_roles_list.push(row) }
		})
		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div>
					<div className="create-user-screen">
						<div className="animated fadeIn">
							<Row>
								<Col lg={12} className="mx-auto">
									<Card>
										<CardHeader>
											<Row>
												<Col lg={12}>
													<div className="h4 mb-0 d-flex align-items-center">
														<i className="nav-icon fas fa-users" />
														<span className="ml-2">{strings.UpdateUser}
														</span>
													</div>
												</Col>
											</Row>
										</CardHeader>
										<CardBody>
											{dialog}
											{loading ? (
												<Loader />
											) : (
												<Row>
													<Col lg={12}>
														<Formik
															initialValues={this.state.initValue}
															onSubmit={(values, { resetForm }) => {
																this.handleSubmit(values);
																// resetForm(this.state.initValue)

																// this.setState({
																//   selectedContactCurrency: null,
																//   selectedCurrency: null,
																//   selectedInvoiceLanguage: null
																// })
															}}
															validate={(values) => {
																let errors = {};

																if (this.state.exist === true) {
																	errors.email =
																		'User already exists';
																}

																if (errors.length) {
																	this.setState({
																		disabled: false,
																	})
																}

																return errors;
															}}
															validationSchema={Yup.object().shape({
																firstName: Yup.string().required(
																	'First name is required',
																),
																lastName: Yup.string().required(
																	'Last name is required',
																),
																email: Yup.string()
																	.required('Email is required')
																	.email('Invalid Email'),
																roleId: Yup.string().required(
																	'Role name is required',
																),
																timeZone: Yup.string().required(
																	'Time zone is required',
																),
																// 	password: Yup.string()
																// 	.required('Password is required')
																// .min(8, "Password too Short")
																// .matches(
																// 	/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,

																// ),
																// confirmPassword: Yup.string()
																// .required('Confirm password is required')
																// .oneOf(
																// 	[Yup.ref('password'), null],
																// 	'Passwords must match',
																// ),
																dob: Yup.string().required('DOB is required'),
															})}
														>
															{(props) => (
																<Form onSubmit={props.handleSubmit}>
																	<Row>
																		<Col xs="4" md="4" lg={2}>
																			<FormGroup className="mb-3 text-center">
																				{/* <ImagesUploader
                                    // url="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                    optimisticPreviews
                                    multiple={false}
                                    onLoadEnd={(err) => {
                                      if (err) {
                                        console.error(err);
                                      }
                                    }}
                                    onChange={(e) => {}}
                                  /> */}
																				<ImageUploader
																					// withIcon={true}
																					buttonText="Choose images"
																					onChange={(picture, file) => {
																						this.uploadImage(picture, file);
																						props.handleChange("photo")(picture);
																					}}
																					imgExtension={[
																						'jpg',
																						'png',
																						'jpeg',
																					]}
																					maxFileSize={40000}
																					withPreview={true}
																					singleImage={true}
																					withIcon={this.state.showIcon}
																					// buttonText="Choose Profile Image"
																					flipHeight={
																						this.state.userPhoto.length > 0
																							? { height: 'inherit' }
																							: {}
																					}
																					label="'Max file size: 40kb"
																					labelClass={
																						this.state.userPhoto.length > 0
																							? 'hideLabel'
																							: 'showLabel'
																					}
																					buttonClassName={
																						this.state.userPhoto.length > 0
																							? 'hideButton'
																							: 'showButton'
																					}
																					defaultImages={this.state.userPhoto}
																					imageState={this.state.imageState}
																				/>
																			</FormGroup>
																		</Col>
																		<Col lg={10}>
																			<Row>
																				<Col lg={6}>
																					<FormGroup>
																						<Label htmlFor="select">
																							<span className="text-danger">* </span>
																							{strings.FirstName}
																						</Label>
																						<Input
																							type="text"
																							id="firstName"
																							name="firstName"
																							autoComplete='off'
																							placeholder={strings.Enter + strings.FirstName}
																							onChange={(option) => {
																								if (
																									option.target.value === '' ||
																									this.regExAlpha.test(
																										option.target.value,
																									)
																								) {
																									option = upperFirst(option.target.value)
																									props.handleChange('firstName')(
																										option,
																									);
																								}
																							}}
																							value={props.values.firstName}
																							className={
																								props.errors.firstName &&
																									props.touched.firstName
																									? 'is-invalid'
																									: ''
																							}
																						/>
																						{props.errors.firstName &&
																							props.touched.firstName && (
																								<div className="invalid-feedback">
																									{props.errors.firstName}
																								</div>
																							)}
																					</FormGroup>
																				</Col>
																				<Col lg={6}>
																					<FormGroup>
																						<Label htmlFor="select">
																							<span className="text-danger">* </span>
																							{strings.LastName}
																						</Label>
																						<Input
																							type="text"
																							id="lastName"
																							name="lastName"
																							autoComplete='off'
																							placeholder={strings.Enter + strings.LastName}
																							onChange={(option) => {
																								if (
																									option.target.value === '' ||
																									this.regExAlpha.test(
																										option.target.value,
																									)
																								) {
																									option = upperFirst(option.target.value)
																									props.handleChange('lastName')(
																										option,
																									);
																								}
																							}}
																							value={props.values.lastName}
																							className={
																								props.errors.lastName &&
																									props.touched.lastName
																									? 'is-invalid'
																									: ''
																							}
																						/>
																						{props.errors.lastName &&
																							props.touched.lastName && (
																								<div className="invalid-feedback">
																									{props.errors.lastName}
																								</div>
																							)}
																					</FormGroup>
																				</Col>
																			</Row>
																			<Row>
																				<Col lg={6}>
																					<FormGroup className="mb-3">
																						<Label htmlFor="email">
																							<span className="text-danger">* </span>
																							{strings.EmailID}
																						</Label>
																						<Input
																							type="email"
																							id="email"
																							name="email"
																							disabled={current_loggin_user_roleId !== 1}
																							placeholder={strings.Enter + strings.EmailID}
																							value={props.values.email}
																							onChange={(value) => {
																								props.handleChange('email')(value);
																								this.validationCheck(
																									value.target.value,
																								);
																							}}
																							className={
																								props.errors.email &&
																									props.touched.email
																									? 'is-invalid'
																									: ''
																							}
																						/>
																						{props.errors.email &&
																							props.touched.email && (
																								<div className="invalid-feedback">
																									{props.errors.email}
																								</div>
																							)}
																					</FormGroup>
																				</Col>
																				<Col lg={6}>
																					<FormGroup className="mb-3">
																						<Label htmlFor="date">
																							<span className="text-danger">* </span>
																							{strings.DateOfBirth}
																						</Label>
																						<DatePicker
																							className={`form-control ${props.errors.dob &&
																								props.touched.dob
																								? 'is-invalid'
																								: ''
																								}`}
																							id="dob "
																							name="dob "
																							showMonthDropdown
																							showYearDropdown
																							dateFormat="dd-MM-yyyy"
																							dropdownMode="select"
																							maxDate={moment().subtract(18, "years").toDate()}
																							autoComplete="off"
																							placeholderText={strings.Enter + strings.DateOfBirth}
																							// selected={props.values.dob}
																							value={
																								props.values.dob
																									? moment(props.values.dob).format(
																										'DD-MM-YYYY',
																									)
																									: ''
																							}
																							onChange={(value) => {
																								props.handleChange('dob')(value);
																							}}
																						/>
																						{props.errors.dob &&
																							props.touched.dob && (
																								<div className="invalid-feedback">
																									{props.errors.dob}
																								</div>
																							)}
																					</FormGroup>
																				</Col>
																			</Row>

																			<Row>
																				{this.state.current_user_id !== 10000 &&
																					(
																						<Col lg={6}>
																							<FormGroup className="mb-3">
																								<Label htmlFor="active">{strings.Status}</Label>
																								<div>
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
																															initValue: {
																																active: true
																															},
																															selectedStatus: true,
																														});
																													}
																												}}
																											/>
																											<label
																												className="custom-control-label"
																												htmlFor="inline-radio1"
																											>
																												Active
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
																															initValue: {
																																active: false
																															},
																															selectedStatus: false,
																														});
																													}
																												}}
																											/>
																											<label
																												className="custom-control-label"
																												htmlFor="inline-radio2"
																											>
																												Inactive
																											</label>
																										</div>
																									</FormGroup>
																								</div>
																							</FormGroup>
																						</Col>)}
																				<Col lg={6}>
																					<FormGroup className="mb-3">
																						<Label htmlFor="contactId">

																							{strings.Employee}
																						</Label>
																						<Select
																						isDisabled={this.state.isEmployeeIdDisabled}
																							styles={customStyles}
																							id="employeeId"
																							name="employeeId"
																							placeholder={strings.Select + strings.Employee}
																							options={
																								employee_list
																									? selectOptionsFactory.renderOptions(
																										'label',
																										'value',
																										employee_list,
																										'Employee',
																									)
																									: []
																							}
																							value={props.values.employeeId}
																							onChange={(option) => {
																								if (option && option.value) {
																									props.handleChange('employeeId')(option);
																								} else {
																									props.handleChange('employeeId')('');
																								}
																							}}
																							className={
																								props.errors.employeeId &&
																									props.touched.employeeId
																									? 'is-invalid'
																									: ''
																							}
																						/>
																						{props.errors.employeeId &&
																							props.touched.employeeId && (
																								<div className="invalid-feedback">
																									{props.errors.employeeId}
																								</div>
																							)}
																					</FormGroup>
																				</Col>
																			</Row>
																			<Row>
																				<Col lg={6}>
																					<FormGroup>
																						<Label htmlFor="roleId">
																							<span className="text-danger">* </span>
																							{strings.Role}
																						</Label>
																						<Select
																							isDisabled={!enableDelete}
																							//	styles={customStyles}
																							options = {
																						active_roles_list
																							? selectOptionsFactory.renderOptions(
																								'roleName',
																								'roleCode',
																								active_roles_list.sort((a, b) => a.roleName.localeCompare(b.roleName)),
																								'Role'
																							)
																							: []
																						}
																							value={
																								role_list &&
																								selectOptionsFactory.renderOptions(
																									'roleName',
																									'roleCode',
																									role_list,
																									'Role',
																								)
																									.find(
																										(option) =>
																											option.value ===
																											+props.values.roleId,
																									)
																							}
																							onChange={(option) => {
																								if (option && option.value) {
																									props.handleChange('roleId')(
																										option,
																									);
																								} else {
																									props.handleChange('roleId')('');
																								}
																							}}
																							placeholder={strings.Select + strings.Role}
																							id="roleId"
																							name="roleId"
																							className={
																								props.errors.roleId &&
																									props.touched.roleId
																									? 'is-invalid'
																									: ''
																							}
																						/>
																						{props.errors.roleId &&
																							props.touched.roleId && (
																								<div className="invalid-feedback">
																									{props.errors.roleId}
																								</div>
																							)}
																					</FormGroup>
																				</Col>
																				<Col lg={6}>
																					<FormGroup className="mb-3">
																						<Label htmlFor="timeZone">
																							<span className="text-danger">* </span>
																							{strings.TimeZonePreference}
																						</Label>
																						<Select
																							styles={customStyles}
																							id="timeZone"
																							name="timeZone"
																							options={timezone ? timezone : []}
																							value={
																								timezone &&
																								timezone.find(
																									(option) =>
																										option.value ===
																										props.values.timeZone,
																								)
																							}
																							isDisabled={this.state.current_user_id === 10000}
																							onChange={(option) => {
																								if (option && option.value) {
																									props.handleChange('timeZone')(
																										option.value,
																									);
																								} else {
																									props.handleChange('timeZone')(
																										'',
																									);
																								}
																							}}
																							className={
																								props.errors.timeZone &&
																									props.touched.timeZone
																									? 'is-invalid'
																									: ''
																							}
																						/>
																						{props.errors.timeZone &&
																							props.touched.timeZone && (
																								<div className="invalid-feedback">
																									{props.errors.timeZone}
																								</div>
																							)}
																					</FormGroup>
																				</Col>
																				{/* <Col lg={6}>
                                  <FormGroup>
                                    <Label htmlFor="companyId">Company</Label>
                                    <Select
                                      className="select-default-width"
                                      options={role_list ? selectOptionsFactory.renderOptions('roleName', 'roleCode', role_list , 'Role') : []}
                                      value={props.values.companyId}
                                      onChange={(option) => props.handleChange('companyId')(option.value)}
                                      placeholder="Select Company"
                                      id="companyId"
                                      name="companyId"
                                      className={
                                        props.errors.companyId && props.touched.companyId
                                          ? "is-invalid"
                                          : ""
                                      }
                                    />
                                    {props.errors.companyId && props.touched.companyId && (
                                      <div className="invalid-feedback">{props.errors.companyId}</div>
                                    )}

                                  </FormGroup>
                                </Col> */}


																			</Row>


																		</Col>
																	</Row>

																	<Row>
																		{/* <Col
																	lg={12}
																	className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
															>
																
																	{this.state.current_user_id !== 1 &&
																	  (
																		<FormGroup>
																		<Button
																			type="button"
																			color="danger"
																			className="btn-square"
																				disabled1={this.state.disabled1}
																			onClick={this.deleteUser}
																		>
																			<i className="fa fa-trash"></i> {this.state.disabled1
																			? 'Deleting...'
																			: strings.Delete }
																		</Button>
																	</FormGroup>
																	)}
													 */}
																		<FormGroup className="text-right w-100" >
																			{/* <Button
																			type="submit"
																			color="primary"
																			className="btn-square mr-3"
																			disabled={this.state.disabled}
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			{this.state.disabled
																				? 'Updating...'
																				: 'Update'}
																		</Button> */}
																			<Button
																				type="submit"
																				color="primary"
																				className="btn-square mr-3"
																				disabled={this.state.disabled}
																				onClick={() => {
																					//	added validation popup	msg	
																					props.handleBlur();
																					if (props.errors && Object.keys(props.errors).length != 0)
																						this.props.commonActions.fillManDatoryDetails();
																				}}
																			>
																				<i className="fa fa-dot-circle-o"></i>{' '}
																				{this.state.disabled
																					? 'Updating...'
																					: strings.Update}
																			</Button>
																			<Button
																				type="submit"
																				color="primary"
																				className="btn-square mr-3"
																				disabled={this.state.disabled}
																				onClick={(event) => {
																					this.sendInviteMail(event);
																				}}
																			>
																				<i className="fas fa-envelope"></i>{' '}
																				Resend Invite
																			</Button>
																			<Button
																				color="secondary"
																				className="btn-square"
																				onClick={() => {
																					this.props.history.push(
																						'/admin/settings/user',
																					);
																				}}
																			>
																				<i className="fa fa-ban"></i> {this.state.disabled1
																					? 'Deleting...'
																					: strings.Cancel}
																			</Button>
																		</FormGroup>

																	</Row>
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
					{this.state.disableLeavePage ? "" : <LeavePage />}
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailUser);
