import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import * as SalaryTemplateActions from '../../../salaryTemplate/actions';
import { CommonActions, AuthActions } from 'services/global';
import { selectOptionsFactory, selectStyles } from 'utils';
import dayjs from '@/utils/date';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { upperFirst } from 'lodash';
import eye from 'assets/images/settings/eye.png';

const strings = new LocalizedStrings(data);

// Zod validation schema
const createUserSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.string().min(1, 'Email is required').email('Invalid Email'),
	roleId: z
		.object({
			value: z.number(),
			label: z.string(),
		})
		.nullable()
		.refine((val) => val !== null, 'Role name is required'),
	timezone: z
		.object({
			value: z.string(),
			label: z.string(),
		})
		.nullable()
		.refine((val) => val !== null, 'Time zone is required'),
	dob: z.date({ required_error: 'DOB is required' }),
	employeeId: z
		.object({
			value: z.number(),
			label: z.string(),
		})
		.nullable()
		.optional(),
	designationId: z
		.object({
			value: z.number(),
			label: z.string(),
		})
		.nullable()
		.optional(),
	salaryRoleId: z
		.object({
			value: z.number(),
			label: z.string(),
		})
		.nullable()
		.optional(),
	isAlreadyAvailableEmployee: z.boolean().optional(),
	isNewEmployee: z.boolean().optional(),
});

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
		salaryTemplateActions: bindActionCreators(SalaryTemplateActions, dispatch),
	};
};

const regExAlpha = /^[a-zA-Z ]+$/;

const CreateUser = ({
	employee_list,
	role_list,
	company_type_list,
	salary_role_dropdown,
	designation_dropdown,
	authActions,
	userCreateActions,
	userActions,
	commonActions,
	salaryTemplateActions,
	history,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const [loading, setLoading] = useState(false);
	const [createMore, setCreateMore] = useState(false);
	const [userPhoto, setUserPhoto] = useState([]);
	const [userPhotoChange, setUserPhotoChange] = useState(false);
	const [userPhotoFile, setUserPhotoFile] = useState([]);
	const [showIcon, setShowIcon] = useState(false);
	const [exist, setExist] = useState(false);
	const [createDisabled, setCreateDisabled] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState(true);
	const [useractive, setUseractive] = useState(true);
	const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
	const [loadingMsg, setLoadingMsg] = useState('Loading...');
	const [disableLeavePage, setDisableLeavePage] = useState(false);
	const [timezone, setTimezone] = useState([]);

	const form = useForm({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			dob: '',
			roleId: null,
			timezone: null,
			designationId: null,
			employeeId: null,
			isAlreadyAvailableEmployee: false,
			isNewEmployee: false,
		},
		mode: 'onChange',
	});

	const { control, handleSubmit, formState: { errors }, reset, setError, clearErrors, setValue, trigger } = form;

	strings.setLanguage(language);

	useEffect(() => {
		userActions.getRoleList();
		salaryTemplateActions.getSalaryRolesForDropdown();
		userActions.getEmployeeDesignationForDropdown();
		userActions.getEmployeesNotInUserForDropdown();
		initializeData();
	}, []);

	const initializeData = useCallback(() => {
		authActions.getTimeZoneList().then((response) => {
			let output = response.data.map(function (value) {
				return { label: value, value: value };
			});
			setTimezone(output);
		});

		userActions.getCompanyTypeList();
		setShowIcon(false);
	}, [authActions, userActions]);

	const uploadImage = (picture, file) => {
		setUserPhoto(picture);
		setUserPhotoFile(file);
		setUserPhotoChange(true);
	};

	const togglePasswordVisiblity = () => {
		setIsPasswordShown(!isPasswordShown);
	};

	const onSubmit = (data) => {
		if (exist) {
			return;
		}

		setCreateDisabled(true);
		setDisableLeavePage(true);

		const {
			firstName,
			lastName,
			email,
			dob,
			roleId,
			timezone,
			isAlreadyAvailableEmployee,
			isNewEmployee,
			designationId,
			salaryRoleId,
			employeeId,
		} = data;

		let formData = new FormData();

		formData.append('loginUrl', window.location.origin);
		formData.append('firstName', firstName ? firstName : '');
		formData.append('lastName', lastName ? lastName : '');
		formData.append('email', email ? email : '');
		formData.append('userPhotoChange', userPhotoChange);
		formData.append('dob', dob ? dayjs(dob).format('DD-MM-YYYY') : '');
		formData.append('roleId', roleId ? roleId.value : '');
		formData.append('active', useractive);
		formData.append('timeZone', timezone ? timezone.value : '');
		formData.append('companyId', '');
		if (userPhotoFile.length > 0) {
			formData.append('profilePic ', userPhotoFile[0]);
		}
		formData.append('isAlreadyAvailableEmployee', isAlreadyAvailableEmployee ? isAlreadyAvailableEmployee : '');
		formData.append('isNewEmployee', isNewEmployee ? isNewEmployee : '');
		formData.append('designationId', designationId ? designationId.value : '');
		formData.append('salaryRoleId', salaryRoleId ? salaryRoleId.value : '');
		formData.append('employeeId', employeeId ? employeeId.value : '');
		formData.append('url', window.location.origin);

		setLoading(true);
		setLoadingMsg('Creating User');

		userCreateActions
			.createUser(formData)
			.then((res) => {
				setLoading(false);
				if (res.status === 200) {
					commonActions.tostifyAlert('success', 'New User Created Successfully');
					if (createMore) {
						setDisableLeavePage(false);
						setCreateMore(false);
						setCreateDisabled(false);
						reset();
						setUserPhoto([]);
						setUserPhotoFile([]);
						setUserPhotoChange(false);
					} else {
						history.push('/admin/settings/user');
					}
				}
			})
			.catch((err) => {
				setLoading(false);
				commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong'
				);
				setCreateDisabled(false);
			});
	};

	const validationCheck = (value) => {
		const data = {
			moduleType: 9,
			name: value,
		};
		userCreateActions.checkValidation(data).then((response) => {
			if (response.data === 'User Already Exists') {
				setExist(true);
				setCreateDisabled(false);
				setError('email', {
					type: 'manual',
					message: 'Email already exists',
				});
			} else {
				setExist(false);
				clearErrors('email');
			}
		});
	};

	const getCurrentUser = (data) => {
		let option;
		if (data.label || data.value) {
			option = data;
		} else {
			option = {
				label: `${data.fullName}`,
				value: data.id,
			};
		}
		setValue('employeeId', option, { shouldValidate: true });
	};

	const openEmployeeModalHandler = () => {
		setOpenEmployeeModal(true);
	};

	const closeEmployeeModalHandler = () => {
		setOpenEmployeeModal(false);
	};

	let active_roles_list = [];
	role_list &&
		role_list.length !== 0 &&
		role_list.map((row) => {
			if (row.isActive == true) {
				active_roles_list.push(row);
			}
		});

	if (loading) {
		return <Loader loadingMsg={loadingMsg} />;
	}

	return (
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
									<Row>
										<Col lg={12}>
											<Form onSubmit={handleSubmit(onSubmit)}>
												<Row>
													<Col xs="4" md="4" lg={2}>
														<FormGroup className="mb-3 text-center">
															<ImageUploader
																buttonText="Choose images"
																onChange={uploadImage}
																imgExtension={['jpg', 'png', 'jpeg']}
																maxFileSize={40000}
																withPreview={true}
																singleImage={true}
																withIcon={showIcon}
																flipHeight={
																	userPhoto.length > 0 ? { height: 'inherit' } : {}
																}
																label="'Max file size: 40kb"
																labelClass={userPhoto.length > 0 ? 'hideLabel' : 'showLabel'}
																buttonClassName={
																	userPhoto.length > 0 ? 'hideButton' : 'showButton'
																}
															/>
														</FormGroup>
													</Col>
													<Col lg={10}>
														<Row>
															<Col lg={6}>
																<FormGroup>
																	<Label htmlFor="firstName">
																		<span className="text-danger">* </span>
																		{strings.FirstName}
																	</Label>
																	<Controller
																		name="firstName"
																		control={control}
																		render={({ field }) => (
																			<Input
																				type="text"
																				maxLength="100"
																				id="firstName"
																				autoComplete="off"
																				placeholder={strings.FirstName}
																				{...field}
																				onChange={(e) => {
																					const value = e.target.value;
																					if (value === '' || regExAlpha.test(value)) {
																						const formattedValue = upperFirst(value);
																						field.onChange(formattedValue);
																					}
																				}}
																				className={errors.firstName ? 'is-invalid' : ''}
																			/>
																		)}
																	/>
																	{errors.firstName && (
																		<div className="invalid-feedback">
																			{errors.firstName.message}
																		</div>
																	)}
																</FormGroup>
															</Col>
															<Col lg={6}>
																<FormGroup>
																	<Label htmlFor="lastName">
																		<span className="text-danger">* </span>
																		{strings.LastName}
																	</Label>
																	<Controller
																		name="lastName"
																		control={control}
																		render={({ field }) => (
																			<Input
																				type="text"
																				maxLength="100"
																				id="lastName"
																				autoComplete="off"
																				placeholder={strings.LastName}
																				{...field}
																				onChange={(e) => {
																					const value = e.target.value;
																					if (value === '' || regExAlpha.test(value)) {
																						const formattedValue = upperFirst(value);
																						field.onChange(formattedValue);
																					}
																				}}
																				className={errors.lastName ? 'is-invalid' : ''}
																			/>
																		)}
																	/>
																	{errors.lastName && (
																		<div className="invalid-feedback">
																			{errors.lastName.message}
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
																		Email
																	</Label>
																	<Controller
																		name="email"
																		control={control}
																		render={({ field }) => (
																			<Input
																				type="email"
																				maxLength="80"
																				id="email"
																				placeholder={strings.Enter + strings.EmailAddres}
																				{...field}
																				onChange={(e) => {
																					field.onChange(e);
																					validationCheck(e.target.value);
																				}}
																				className={errors.email ? 'is-invalid' : ''}
																			/>
																		)}
																	/>
																	{errors.email && (
																		<div className="invalid-feedback">
																			{errors.email.message}
																		</div>
																	)}
																</FormGroup>
															</Col>
															<Col lg={6}>
																<FormGroup className="mb-3">
																	<Label htmlFor="dob">
																		<span className="text-danger">* </span>
																		{strings.DateOfBirth}
																	</Label>
																	<Controller
																		name="dob"
																		control={control}
																		render={({ field }) => (
																			<DatePicker
																				id="dob"
																				showMonthDropdown
																				showYearDropdown
																				dateFormat="dd-MM-yyyy"
																				dropdownMode="select"
																				placeholderText={strings.Enter + strings.DateOfBirth}
																				maxDate={dayjs().subtract(18, 'years').toDate()}
																				selected={field.value}
																				onChange={(date) => field.onChange(date)}
																				className={`form-control ${
																					errors.dob ? 'is-invalid' : ''
																				}`}
																			/>
																		)}
																	/>
																	{errors.dob && (
																		<div className="invalid-feedback">
																			{errors.dob.message}
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
																					checked={selectedStatus}
																					value={true}
																					onChange={(e) => {
																						if (e.target.value === 'true') {
																							setSelectedStatus(true);
																							setUseractive(true);
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
																							setUseractive(false);
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
																	<Label htmlFor="employeeId">{strings.Employee}</Label>
																	<Controller
																		name="employeeId"
																		control={control}
																		render={({ field }) => (
																			<Select
																				{...field}
																				id="employeeId"
																				placeholder={strings.Select + strings.Employee}
																				options={
																					employee_list
																						? selectOptionsFactory.renderOptions(
																								'label',
																								'value',
																								employee_list,
																								'Employee'
																						  )
																						: []
																				}
																				styles={selectStyles}
																				isClearable
																				className={errors.employeeId ? 'is-invalid' : ''}
																			/>
																		)}
																	/>
																	{errors.employeeId && (
																		<div className="invalid-feedback d-block">
																			{errors.employeeId.message}
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
																	<Controller
																		name="roleId"
																		control={control}
																		render={({ field }) => (
																			<Select
																				{...field}
																				id="roleId"
																				placeholder={strings.Select + strings.Role}
																				options={
																					active_roles_list
																						? selectOptionsFactory.renderOptions(
																								'roleName',
																								'roleCode',
																								active_roles_list.sort((a, b) =>
																									a.roleName.localeCompare(b.roleName)
																								),
																								'Role'
																						  )
																						: []
																				}
																				styles={selectStyles}
																				isClearable
																				className={errors.roleId ? 'is-invalid' : ''}
																			/>
																		)}
																	/>
																	{errors.roleId && (
																		<div className="invalid-feedback d-block">
																			{errors.roleId.message}
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
																	<Controller
																		name="timezone"
																		control={control}
																		render={({ field }) => (
																			<Select
																				{...field}
																				id="timezone"
																				placeholder={
																					strings.Select + strings.TimeZonePreference
																				}
																				options={timezone ? timezone : []}
																				styles={selectStyles}
																				isClearable
																				className={errors.timezone ? 'is-invalid' : ''}
																			/>
																		)}
																	/>
																	{errors.timezone && (
																		<div className="invalid-feedback d-block">
																			{errors.timezone.message}
																		</div>
																	)}
																</FormGroup>
															</Col>
														</Row>
													</Col>
												</Row>
												<Row>
													<Col lg={12} className="mt-5">
														<FormGroup className="text-right">
															<Button
																type="submit"
																color="primary"
																className="btn-square mr-3"
																disabled={createDisabled}
																onClick={async () => {
																	const isValid = await trigger();
																	if (!isValid) {
																		commonActions.fillManDatoryDetails();
																	}
																	setCreateMore(false);
																}}
															>
																<i className="fa fa-dot-circle-o"></i>{' '}
																{createDisabled ? 'Creating...' : strings.Create}
															</Button>
															<Button
																type="submit"
																color="primary"
																className="btn-square mr-3"
																disabled={createDisabled}
																onClick={async () => {
																	const isValid = await trigger();
																	if (!isValid) {
																		commonActions.fillManDatoryDetails();
																	}
																	setCreateMore(true);
																}}
															>
																<i className="fa fa-refresh"></i>{' '}
																{createDisabled ? 'Creating...' : strings.CreateandMore}
															</Button>
															<Button
																type="button"
																color="secondary"
																className="btn-square"
																onClick={() => {
																	history.push('/admin/settings/user');
																}}
															>
																<i className="fa fa-ban"></i> {strings.Cancel}
															</Button>
														</FormGroup>
													</Col>
												</Row>
											</Form>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>

				<EmployeeModal
					openEmployeeModal={openEmployeeModal}
					closeEmployeeModal={closeEmployeeModalHandler}
					getCurrentUser={getCurrentUser}
					createEmployee={userCreateActions.createEmployee}
				/>
			</div>
			{!disableLeavePage && <LeavePage />}
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateUser);
