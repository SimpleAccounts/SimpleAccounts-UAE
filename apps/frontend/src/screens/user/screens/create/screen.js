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
import 'react-datepicker/dist/react-datepicker.css';
import { EmployeeModal } from '../../sections';
import { LeavePage, ImageUploader, Loader } from 'components';
import * as UserActions from '../../actions';
import * as UserCreateActions from './actions';
import * as SalaryTemplateActions from '../../../salaryTemplate/actions'
import { CommonActions, AuthActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import moment from 'moment';
import { Formik } from 'formik';
import * as Yup from 'yup';
import './style.scss';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { upperFirst } from 'lodash';

const eye = require('assets/images/settings/eye.png');
const mapStateToProps = (state) => {
	return {
		employee_list: state.user.employee_list,
		role_list: state.user.role_list,
		company_type_list: state.user.company_type_list,
		salary_role_dropdown: state.salarytemplate.salary_role_dropdown,
		designation_dropdown: state.user.designation_dropdown,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		userCreateActions: bindActionCreators(UserCreateActions, dispatch),
		userActions: bindActionCreators(UserActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		salaryTemplateActions: bindActionCreators(SalaryTemplateActions,dispatch),
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
class CreateUser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			isPasswordShown: false,
			loading: false,
			// passwordShown: false,
			createMore: false,
			initValue: {
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				dob: '',
				active: 'true',
				confirmPassword: '',
				roleId:'',
				timezone: '',
				designationId: '',
				employeeId: '',
				isAlreadyAvailableEmployee: false,
				isNewEmployee: false,
			},

			userPhoto: [],
			userPhotoChange:false,
			userPhotoFile: [],
			showIcon: false,
			exist: false,
			createDisabled: false,
			selectedStatus: true,
			useractive: true,
			openEmployeeModal: false,
			loadingMsg:"Loading...",
			disableLeavePage:false

		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
	}
	componentWillMount = () => {
		this.props.userActions.getRoleList();
	}

	componentDidMount = () => {
		this.props.salaryTemplateActions.getSalaryRolesForDropdown();
		this.props.userActions.getEmployeeDesignationForDropdown();
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

		this.props.userActions.getCompanyTypeList();


		this.setState({ showIcon: false });
	};

	uploadImage = (picture, file) => {
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
	handleSubmit = (data, resetForm) => {
		this.setState({ createDisabled: true, disableLeavePage:true	});
		const {
			firstName,
			lastName,
			email,
			dob,
			password,
			roleId,
			companyId,
			active,
			timezone,
			isAlreadyAvailableEmployee,
			isNewEmployee,
			designationId,
			salaryRoleId,
			employeeId
		} = data;
		let formData = new FormData();
		

		console.log(window.location.origin);
		formData.append('loginUrl', window.location.origin);
		formData.append('firstName', firstName ? firstName : '');
		formData.append('lastName', lastName ? lastName : '');
		formData.append('email', email ? email : '');
		formData.append('userPhotoChange', this.state.userPhotoChange);
		formData.append('dob', dob ? moment(dob).format('DD-MM-YYYY') : '');
		// formData.append(
		// 	'dob',
		// 	dob
		// 		? moment(
		// 				moment(dob).format('DD-MM-YYYY'),
		// 				'DD-MM-YYYY',
		// 		  ).toDate()
		// 		: null,
		// );
		//formData.append('dob', dob ? dob : '');
		formData.append('roleId', roleId ? roleId.value : "" );
		formData.append('active', this.state.useractive);
		// formData.append('password', password ? password : '');
		formData.append('timeZone', timezone ? timezone.value : '');
		formData.append('companyId', companyId ? companyId : '');
		if (this.state.userPhotoFile.length > 0) {
			formData.append('profilePic ', this.state.userPhotoFile[0]);
		}
		formData.append('isAlreadyAvailableEmployee' ,isAlreadyAvailableEmployee ? isAlreadyAvailableEmployee : '');
		formData.append('isNewEmployee',isNewEmployee ? isNewEmployee :'');
		formData.append('designationId',designationId ? designationId.value :'');
		formData.append('salaryRoleId',salaryRoleId ? salaryRoleId.value : '');
		formData.append('employeeId',employeeId ? employeeId.value : '');
		formData.append('url',window.location.origin);

		{this.setState({ loading:true, loadingMsg:"Creating User"})} 
		this.props.userCreateActions
			.createUser(formData)
			.then((res) => {
				this.setState({ loading:false});
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'New User Created Successfully',
					);
					if (this.state.createMore) {
						this.setState({
							disableLeavePage: false,
							createMore: false,
							createDisabled: false
						});
						resetForm();
					} else {
						this.props.history.push('/admin/settings/user');
						{this.setState({ loading:false,})}
					}
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({
					createDisabled: false,
				})
			});
	};
	validationCheck = (value) => {
		const data = {
			moduleType: 9,
			name: value,
		};
		this.props.userCreateActions.checkValidation(data).then((response) => {
			if (response.data === 'User Already Exists') {
				this.setState({
					exist: true,
					createDisabled: false,
				})
			} else {
				this.setState({
					exist: false,
				});
			}
		});
	};

	getCurrentUser = (data) => {

		let option;
		if (data.label || data.value) {
			option = data;
		} else {
			option = {
				label: `${data.fullName}`,
				value: data.id,
			};
		}

		this.formRef.current.setFieldValue('employeeId', option, true);
	};
	openEmployeeModal = (props) => {
		this.setState({ openEmployeeModal: true });
	};
	closeEmployeeModal = (res) => {
		this.setState({ openEmployeeModal: false });
	};
	render() {
		strings.setLanguage(this.state.language);
		const { role_list, employee_list,salary_role_dropdown,designation_dropdown } = this.props;
		const { timezone } = this.state;
		const { isPasswordShown,loading,loadingMsg } = this.state;

		let active_roles_list=[];
		role_list && role_list.length!==0 && role_list.map(row => {	
			if(row.isActive==true){			active_roles_list.push(row)}					
		})
		console.log(role_list,"role_list")
		console.log(active_roles_list,"temp_role_list")
		// emlpoyee_list.map(item => {
		// 	let obj = {label: item.label.fullName, value: item.value}
		// 	tmpEmployee_list.push(obj)
		// })

		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
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
												<span className="ml-2">{strings.CreateUser}</span>
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
											<Formik
												initialValues={this.state.initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
													// resetForm(this.state.initValue)

													// this.setState({
													//   selectedContactCurrency: null,
													//   selectedCurrency: null,
													//   selectedInvoiceLanguage: null
													// })
												}}
												validate={(values) => {
													// let status = false
													let errors = {};
													if (this.state.exist === true) {
														errors.email =
															'Email already exists';
													}

													if (errors.length) {
														this.setState({
															createDisabled: false,
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
													timezone: Yup.string().required(
														'Time zone is required',
													),
													// employeeId:Yup.string().required(
													// 	'Employee is required',
													// ),
													// password: Yup.string()
													// 	.required('Password is required')
													// .min(8, "Password too Short")
													// .matches(
													// 	/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
														
													// ),
													
													// confirmPassword: Yup.string()
													// 	.required('Confirm password is required')
													// 	.oneOf(
													// 		[Yup.ref('password'), null],
													// 		'Passwords must match',
													// 	),
														dob: Yup.date().required('DOB is required'),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>
														<Row>
															<Col xs="4" md="4" lg={2}>
																<FormGroup className="mb-3 text-center">

																	<ImageUploader
																		// withIcon={true}
																		buttonText="Choose images"
																		onChange={this.uploadImage}
																		imgExtension={['jpg', 'png', 'jpeg']}
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
																				maxLength="100"
																				id="firstName"
																				name="firstName"
																				autoComplete='off'
																				value={props.values.firstName}
																				placeholder={strings.FirstName}
																				onChange={(option) => {
																					if (
																						option.target.value === '' ||
																						this.regExAlpha.test(
																							option.target.value,
																						)
																					) {
																						let option1 = upperFirst(option.target.value)
																						props.handleChange('firstName')(
																							option1,
																						);
																					}
																				}}
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
																				maxLength="100"
																				id="lastName"
																				name="lastName"
																				autoComplete='off'
																				placeholder={strings.LastName}
																				value={props.values.lastName}
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
																				 {"Email"}
																			</Label>
																			<Input
																				type="email"
																				maxLength="80"
																				id="email"
																				name="email"
																				placeholder={strings.Enter+strings.EmailAddres}
																				value={props.values.email}
																				onChange={(option) => {
																					props.handleChange('email')(option);
																					this.validationCheck(
																						option.target.value,
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
																				id="dob"
																				name="dob"
																				showMonthDropdown
																				showYearDropdown
																				dateFormat="dd-MM-yyyy"
																				dropdownMode="select"
																				placeholderText={strings.Enter+strings.DateOfBirth}
																				maxDate={moment().subtract(18, "years").toDate()}
																				selected={props.values.dob}
																				//value={props.values.dob}
																				onChange={(value) => {
																					props.handleChange('dob')(value);

																				}}
																				className={`form-control ${props.errors.dob && props.touched.dob
																						? 'is-invalid'
																						: ''
																					}`}
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
																										selectedStatus: true,
																										useractive: true
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
																										useractive: false
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
																			</div>
																		</FormGroup>
																	</Col>
																	<Col lg={6}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="contactId">
																		{/* <span className="text-danger">* </span>*/}
																			{strings.Employee}
																			</Label>
																			<Select
																				// styles={customStyles}
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
																				// styles={customStyles}
																				options = {
																				active_roles_list
																					? selectOptionsFactory.renderOptions(
																						'roleName',
																						'roleCode',
																						active_roles_list.sort((a, b) => a.roleName.localeCompare(b.roleName)),
																						'Role',
																					)
																					: []
																			}
																				// value={props.values.roleId}
																				value={
																					active_roles_list &&
																					selectOptionsFactory
																						.renderOptions(
																							'roleName',
																							'roleCode',
																							active_roles_list,
																							'Role',
																						)
																						.find(
																							(option) =>
																								option.value ===
																								+props.values.roleId,
																						)
																				}
																				isDisabled={false}
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
																			<Label htmlFor="timezone">
																				<span className="text-danger">* </span>
																				 {strings.TimeZonePreference}
																			</Label>
																			<Select
																				id="timezone"
																				name="timezone"
																				placeholder={strings.Select + strings.TimeZonePreference}
																				options={timezone ? timezone : []}
																				value={props.values.timezone}
																				onChange={(option) => {
																					if (option && option.value) {
																						props.handleChange('timezone')(
																							option,
																						);
																					} else {
																						props.handleChange('timezone')('');
																					}
																				}}
																				className={
																					props.errors.timezone &&
																						props.touched.timezone
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.timezone &&
																				props.touched.timezone && (
																					<div className="invalid-feedback">
																						{props.errors.timezone}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	{/* <Col lg={6}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="active">Status</Label>
																			<div>
																				<FormGroup check inline>
																					<div className="custom-radio">
																						<Input
																							className="custom-control-input"
																							type="radio"
																							id="inline-radio1"
																							name="active"
																							checked={
																								props.values.active === 'true'
																							}
																							value="true"
																							onChange={(e) => {
																								props.handleChange('active')(
																									e.target.value,
																								);
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
																					<div className="custom-radio">
																						<Input
																							className="custom-control-input"
																							type="radio"
																							id="inline-radio2"
																							name="active"
																							checked={
																								props.values.active === 'false'
																							}
																							value="false"
																							onChange={(e) => {
																								props.handleChange('active')(
																									e.target.value,
																								);
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
																	</Col> */}
																	{/* <Col lg={6}>
                                    <FormGroup>
                                      <Label htmlFor="companyId">Company</Label>
                                      <Select
                                        className="select-default-width"
                                        options={company_type_list ? selectOptionsFactory.renderOptions('label', 'value', company_type_list , 'Company') : []}
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
																<Row></Row>
																
															{/* <Row>
																<Col>
																<Label>	<span className="text-danger">* </span>{strings.SelectLinkOrCreateEmployee} </Label>
																</Col>
															</Row> */}
																<Row>
																	{/* <Col lg={2} >
																	<FormGroup check inline className="mb-3">
																		<Label
																			className="form-check-label"
																			check
																			htmlFor="isAlreadyAvailableEmployee"
																		>
																			<Input
																				className="form-check-input"
																				type="checkbox"
																				id="is"
																				name="isAlreadyAvailableEmployee"
																				onChange={(value) => {
																					props.handleChange('isAlreadyAvailableEmployee')(value);
																				}}
																				checked={props.values.isAlreadyAvailableEmployee}


																				// className={
																				// 	props.errors.productPriceType &&
																				// 		props.touched.productPriceType
																				// 		? 'is-invalid'
																				// 		: ''
																				// }
																			/>
																		 {strings.LinkEmployee}
																			{props.errors.productPriceType &&
																				props.touched.productPriceType && (
																					<div className="invalid-feedback">
																						{props.errors.productPriceType}
																					</div>
																				)}
																		</Label>
																	</FormGroup>
																</Col> */}
																	{/* <Col style={{display: props.values.isAlreadyAvailableEmployee === true ? 'none' : ''}}>
																<FormGroup check inline className="mb-3">
																		<Label
																			className="form-check-label"
																			check
																			htmlFor="isNewEmployee"
																		>
																			<Input
																				className="form-check-input"
																				type="checkbox"
																				id="is"
																				name="isNewEmployee"
																				onChange={(value) => {
																					props.handleChange('isNewEmployee')(value);
																				}}
																				checked={props.values.isNewEmployee}


																				// className={
																				// 	props.errors.productPriceType &&
																				// 		props.touched.productPriceType
																				// 		? 'is-invalid'
																				// 		: ''
																				// }
																			/>
																		 {strings.CreateEmployee}

																		</Label>
																	</FormGroup>
																</Col> */}
																</Row>
																<Row >

																</Row>
																{/* <Row style={{display: props.values.isNewEmployee === false ? 'none' : ''}}>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="contactId">
																				<span className="text-danger">* </span>
																		{strings.SalaryRole}
																	</Label>
																			<Select
																				styles={customStyles}
																				id="salaryRoleId"
																				name="salaryRoleId"
																				placeholder="Select Role"
																				options={
																					salary_role_dropdown
																						? selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							salary_role_dropdown,
																							'SalaryRole',
																						)
																						: []
																				}
																				value={props.values.salaryRoleId}
																				onChange={(option) => {
																					if (option && option.value) {
																						props.handleChange('salaryRoleId')(option);
																					} else {
																						props.handleChange('salaryRoleId')('');
																					}
																				}}
																				className={
																					props.errors.salaryRoleId &&
																						props.touched.salaryRoleId
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.salaryRoleId &&
																				props.touched.salaryRoleId && (
																					<div className="invalid-feedback">
																						{props.errors.salaryRoleId}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	<Col lg={3}>
																		<FormGroup className="mb-3">
																			<Label htmlFor="contactId">
																				<span className="text-danger">* </span>
																		 {strings.Designation}
																	</Label>
																			<Select
																				styles={customStyles}
																				id="designationId"
																				name="designationId"
																				placeholder="Select Designation"
																				options={
																					designation_dropdown
																						? selectOptionsFactory.renderOptions(
																							'label',
																							'value',
																							designation_dropdown,
																							'Designation',
																						)
																						: []
																				}
																				value={props.values.designationId}
																				onChange={(option) => {
																					if (option && option.value) {
																						props.handleChange('designationId')(option);
																					} else {
																						props.handleChange('designationId')('');
																					}
																				}}
																				className={
																					props.errors.designationId &&
																						props.touched.designationId
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.designationId &&
																				props.touched.designationId && (
																					<div className="invalid-feedback">
																						{props.errors.designationId}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																</Row> */}
															</Col>

														</Row>
														<Row>
															<Col lg={12} className="mt-5">
																<FormGroup className="text-right">
																	<Button
																		ref="btn"
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.createDisabled}
																		onClick={() => {
																				//	added validation popup	msg	
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();
																			this.setState(
																				{
																					createMore: false,
																				},
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-dot-circle-o"></i>{' '}
																		{this.state.createDisabled
																			? 'Creating...'
																			: strings.Create }
																	</Button>
																	<Button
																		name="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.createDisabled}
																		onClick={() => {
																				//	added validation popup	msg	
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();
																			this.setState(
																				{ createMore: true },
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-refresh"></i> 	 {this.state.createDisabled
																			? 'Creating...'
																			: strings.CreateandMore }
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
																		<i className="fa fa-ban"></i> {strings.Cancel}
																	</Button>
																</FormGroup>
															</Col>
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

				<EmployeeModal
					openEmployeeModal={this.state.openEmployeeModal}
					closeEmployeeModal={(e) => {
						this.closeEmployeeModal(e);
					}}
					getCurrentUser={(e) => this.getCurrentUser(e)}
					createEmployee={this.props.userCreateActions.createEmployee}
				// currency_list={this.props.currency_convert_list}
				// currency={this.state.currency}
				// country_list={this.props.country_list}
				// getStateList={this.props.customerInvoiceActions.getStateList}
				/>
			</div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateUser);
