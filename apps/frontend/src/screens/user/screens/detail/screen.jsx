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
import { selectOptionsFactory, selectStyles } from 'utils';
import dayjs from '@/utils/date';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { toast } from 'sonner';
import { upperFirst } from 'lodash-es';
import eye from 'assets/images/settings/eye.png';
import { Users, CircleDot, Mail, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

// Zod validation schema
const detailUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid Email'),
  roleId: z
    .union([
      z.number(),
      z.object({
        value: z.number(),
        label: z.string(),
      }),
    ])
    .refine(val => val !== null && val !== undefined && val !== '', 'Role name is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
  dob: z.union([z.string(), z.date()]).refine(val => val !== null && val !== '', 'DOB is required'),
  employeeId: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .optional(),
});

const mapStateToProps = state => {
  return {
    role_list: state.user.role_list,
    employee_list: state.user.employee_list,
    profile: state.auth.profile,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    userDetailActions: bindActionCreators(UserDetailActions, dispatch),
    userActions: bindActionCreators(UserActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const regExAlpha = /^[a-zA-Z ]+$/;

const DetailUser = ({
  role_list,
  employee_list,
  profile,
  authActions,
  userDetailActions,
  userActions,
  commonActions,
  history,
  location,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [userPhoto, setUserPhoto] = useState([]);
  const [showIcon, setShowIcon] = useState(false);
  const [userPhotoFile, setUserPhotoFile] = useState({});
  const [imageState, setImageState] = useState(true);
  const [current_user_id, setCurrentUserId] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [userPhotoChange, setUserPhotoChange] = useState(false);
  const [timezone, setTimezone] = useState([]);
  const [exist, setExist] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [enableDelete, setEnableDelete] = useState(true);
  const [isEmployeeIdDisabled, setIsEmployeeIdDisabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(detailUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dob: '',
      roleId: '',
      timeZone: '',
      employeeId: null,
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    setValue,
    trigger,
  } = form;

  strings.setLanguage(language);

  useEffect(() => {
    userActions.getEmployeesNotInUserForDropdown();
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    authActions.getTimeZoneList().then(response => {
      let output = response.data.map(function (value) {
        return { label: value, value: value };
      });
      setTimezone(output);
    });

    if (location.state && location.state.id) {
      userActions.getPayrollCount(location.state.id).then(res => {
        if (res.status === 200) {
          setEnableDelete(res.data && res.data > 0 ? false : true);
        }
      });

      userDetailActions
        .getUserById(location.state.id)
        .then(res => {
          userActions.getRoleList();
          if (res.status === 200) {
            const employeeId = res.data.employeeId
              ? {
                  value: res.data.employeeId,
                  label: `${res.data.empFirstName} ${res.data.empLastName}`,
                }
              : null;

            reset({
              firstName: res.data.firstName ? res.data.firstName : '',
              lastName: res.data.lastName ? res.data.lastName : '',
              email: res.data.email ? res.data.email : '',
              dob: res.data.dob ? dayjs(res.data.dob, 'DD-MM-YYYY').toDate() : '',
              roleId: res.data.roleId ? res.data.roleId : '',
              timeZone: res.data.timeZone ? res.data.timeZone : '',
              employeeId: employeeId,
            });

            setLoading(false);
            setSelectedStatus(res.data.active ? true : false);
            setUserPhoto(res.data.profilePicByteArray ? [res.data.profilePicByteArray] : []);
            setCurrentUserId(location.state.id);
            setIsEmployeeIdDisabled(!!employeeId);
          }
        })
        .catch(err => {
          commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Something Went Wrong'
          );
          history.push('/admin/settings/user');
        });
    } else {
      history.push('/admin/settings/user');
    }
  }, [authActions, userActions, userDetailActions, commonActions, location, history, reset]);

  const uploadImage = (picture, file) => {
    if (userPhoto[0] && userPhoto[0].indexOf('data') < 0) {
      setImageState(true);
    } else {
      setImageState(false);
    }
    setUserPhoto(picture);
    setUserPhotoFile(file);
    setUserPhotoChange(true);
  };

  const togglePasswordVisiblity = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const deleteUser = () => {
    const message1 = (
      <text>
        <b>Delete User?</b>
      </text>
    );
    const message = 'This User will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeUser}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeUser = () => {
    setDisabled1(true);
    userDetailActions
      .deleteUser(current_user_id)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'User Deleted Successfully');
          history.push('/admin/settings/user');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const updateRoles = id => {
    authActions
      .checkAuthStatus()
      .then(response => {
        commonActions.getRoleList(id);
      })
      .catch(err => {
        authActions.logOut();
        history.push('/login');
      });
  };

  const onSubmit = data => {
    if (exist) {
      return;
    }

    setDisabled(true);
    setDisableLeavePage(true);

    const { firstName, lastName, email, dob, roleId, timeZone, employeeId } = data;

    let formData = new FormData();
    formData.append('id', +current_user_id);
    formData.append('firstName', firstName ? firstName : '');
    formData.append('lastName', lastName ? lastName : '');
    formData.append('email', email ? email : '');
    formData.append('timeZone', timeZone ? timeZone : '');
    formData.append('userPhotoChange', userPhotoChange);
    formData.append('dob', dob ? dayjs(dob).format('DD-MM-YYYY') : '');
    formData.append('roleId', typeof roleId !== 'object' ? roleId : roleId.value);
    formData.append('active', selectedStatus);
    formData.append('companyId', '');
    formData.append('employeeId', employeeId ? employeeId.value : '');
    if (userPhotoFile.length > 0) {
      formData.append('profilePic', userPhotoFile[0]);
    }

    setLoading(true);
    setLoadingMsg('Updating User');

    userDetailActions
      .updateUser(formData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          setLoading(false);
          commonActions.tostifyAlert('success', 'User Updated Successfully');
          history.push('/admin/settings/user');
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const validationCheck = value => {
    const data = {
      moduleType: 9,
      name: value,
    };
    userDetailActions.checkValidation(data).then(response => {
      if (response.data === 'User Already Exists') {
        setExist(true);
        setDisabled(false);
        setError('email', {
          type: 'manual',
          message: 'User already exists',
        });
      } else {
        setExist(false);
        clearErrors('email');
      }
    });
  };

  const sendInviteMail = event => {
    event.preventDefault();
    userDetailActions
      .getUserInviteEmail(current_user_id, window.location.origin)
      .then(response => {
        if (response.status === 200) {
          toast.success('Mail Sent Successfully !');
        } else {
          toast.success('Mail Sent UnSuccessfully !');
        }
      })
      .catch(e => {
        toast.success('Mail Sent UnSuccessfully !');
      });
  };

  const current_loggin_user_roleId = profile?.role.roleCode;

  let active_roles_list = [];
  role_list &&
    role_list.length !== 0 &&
    role_list.map(row => {
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
                        <Users className="h-4 w-4" />
                        <span className="ml-2">{strings.UpdateUser}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col xs="4" md="4" lg={2}>
                            <FormGroup className="mb-3 text-center">
                              <ImageUploader
                                buttonText="Choose images"
                                onChange={(picture, file) => {
                                  uploadImage(picture, file);
                                }}
                                imgExtension={['jpg', 'png', 'jpeg']}
                                maxFileSize={40000}
                                withPreview={true}
                                singleImage={true}
                                withIcon={showIcon}
                                flipHeight={userPhoto.length > 0 ? { height: 'inherit' } : {}}
                                label="'Max file size: 40kb"
                                labelClass={userPhoto.length > 0 ? 'hideLabel' : 'showLabel'}
                                buttonClassName={userPhoto.length > 0 ? 'hideButton' : 'showButton'}
                                defaultImages={userPhoto}
                                imageState={imageState}
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
                                        id="firstName"
                                        autoComplete="off"
                                        placeholder={strings.Enter + strings.FirstName}
                                        {...field}
                                        onChange={e => {
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
                                        id="lastName"
                                        autoComplete="off"
                                        placeholder={strings.Enter + strings.LastName}
                                        {...field}
                                        onChange={e => {
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
                                    {strings.EmailID}
                                  </Label>
                                  <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        type="email"
                                        id="email"
                                        disabled={current_loggin_user_roleId !== 1}
                                        placeholder={strings.Enter + strings.EmailID}
                                        {...field}
                                        onChange={e => {
                                          field.onChange(e);
                                          validationCheck(e.target.value);
                                        }}
                                        className={errors.email ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.email && (
                                    <div className="invalid-feedback">{errors.email.message}</div>
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
                                        maxDate={dayjs().subtract(18, 'years').toDate()}
                                        autoComplete="off"
                                        placeholderText={strings.Enter + strings.DateOfBirth}
                                        value={
                                          field.value ? dayjs(field.value).format('DD-MM-YYYY') : ''
                                        }
                                        onChange={date => field.onChange(date)}
                                        className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                                      />
                                    )}
                                  />
                                  {errors.dob && (
                                    <div className="invalid-feedback">{errors.dob.message}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>

                            <Row>
                              {current_user_id !== 10000 && (
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
                                            onChange={e => {
                                              if (e.target.value === 'true') {
                                                setSelectedStatus(true);
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
                                            checked={!selectedStatus}
                                            onChange={e => {
                                              if (e.target.value === 'false') {
                                                setSelectedStatus(false);
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
                                </Col>
                              )}
                              <Col lg={6}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="employeeId">{strings.Employee}</Label>
                                  <Controller
                                    name="employeeId"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        isDisabled={isEmployeeIdDisabled}
                                        styles={selectStyles}
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
                                        isDisabled={!enableDelete}
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
                                        value={
                                          role_list &&
                                          selectOptionsFactory
                                            .renderOptions(
                                              'roleName',
                                              'roleCode',
                                              role_list,
                                              'Role'
                                            )
                                            .find(option => option.value === +field.value)
                                        }
                                        onChange={option => {
                                          if (option && option.value) {
                                            field.onChange(option);
                                          } else {
                                            field.onChange('');
                                          }
                                        }}
                                        placeholder={strings.Select + strings.Role}
                                        id="roleId"
                                        styles={selectStyles}
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
                                  <Label htmlFor="timeZone">
                                    <span className="text-danger">* </span>
                                    {strings.TimeZonePreference}
                                  </Label>
                                  <Controller
                                    name="timeZone"
                                    control={control}
                                    render={({ field }) => (
                                      <Select
                                        styles={selectStyles}
                                        id="timeZone"
                                        options={timezone ? timezone : []}
                                        value={
                                          timezone &&
                                          timezone.find(option => option.value === field.value)
                                        }
                                        isDisabled={current_user_id === 10000}
                                        onChange={option => {
                                          if (option && option.value) {
                                            field.onChange(option.value);
                                          } else {
                                            field.onChange('');
                                          }
                                        }}
                                        className={errors.timeZone ? 'is-invalid' : ''}
                                      />
                                    )}
                                  />
                                  {errors.timeZone && (
                                    <div className="invalid-feedback d-block">
                                      {errors.timeZone.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                          </Col>
                        </Row>

                        <Row>
                          <FormGroup className="text-right w-100">
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              disabled={disabled}
                              onClick={async () => {
                                const isValid = await trigger();
                                if (!isValid) {
                                  commonActions.fillManDatoryDetails();
                                }
                              }}
                            >
                              <CircleDot className="h-4 w-4" />{' '}
                              {disabled ? 'Updating...' : strings.Update}
                            </Button>
                            <Button
                              type="button"
                              color="primary"
                              className="btn-square mr-3"
                              disabled={disabled}
                              onClick={sendInviteMail}
                            >
                              <Mail className="h-4 w-4" /> Resend Invite
                            </Button>
                            <Button
                              type="button"
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                history.push('/admin/settings/user');
                              }}
                            >
                              <Ban className="h-4 w-4" />{' '}
                              {disabled1 ? 'Deleting...' : strings.Cancel}
                            </Button>
                          </FormGroup>
                        </Row>
                      </Form>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailUser);
