import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader, ImageUploader, LeavePage } from 'components';
import ReactSelect from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { upperFirst } from 'lodash-es';
import dayjs from '@/utils/date';
import { toast } from 'sonner';

import { CommonActions } from 'services/global';
import * as DetailEmployeePersonalAction from './actions';
import * as CreatePayrollEmployeeActions from '../create/actions';
import * as DesignationActions from '../../../designation/actions';

import { DesignationModal } from 'screens/payrollemp/sections';
import { data } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';
import { selectOptionsFactory } from 'utils';
import { Plus, CircleDot, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

// --- Zod Schema ---

const getUpdatePersonalSchema = (sifEnabled, masterPhoneNumber) => {
  return z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    email: z.string().email('Invalid Email').min(1, 'Email is required'),
    mobileNumber: z.string().min(1, 'Mobile number is required'), // Validation length check done via phone input or manual refine if needed
    dob: z
      .any()
      .refine(val => val, 'DOB is required')
      .refine(val => {
        if (!val) return false;
        const birthday = new Date(val);
        const currentDate = new Date().toJSON().slice(0, 10) + ' 01:00:00';
        const myAge = ~~((Date.now(currentDate) - birthday) / 31557600000);
        return myAge >= 14;
      }, 'Age should be more than 14 years'),
    active: z.boolean().default(true),
    employeeDesignationId: z
      .object({
        label: z.string(),
        value: z.number(),
      })
      .refine(val => val.label !== 'Select Employee Designation', 'Designation is required'),

    // Conditional fields based on sifEnabled
    ...(sifEnabled
      ? {
          gender: z
            .object({ label: z.string(), value: z.string() })
            .refine(val => val.label !== 'Select Gender', 'Gender is required'),
          maritalStatus: z
            .object({ label: z.string(), value: z.string() })
            .refine(val => val.label !== 'Select Marital Status', 'Marital status is required'),
          presentAddress: z.string().min(1, 'Present address is required'),
          countryId: z
            .object({ label: z.string(), value: z.number() })
            .nullable()
            .refine(val => val !== null, 'Country is required'),
          stateId: z
            .object({ label: z.string(), value: z.number() })
            .nullable()
            .refine(val => val !== null, 'State/Emirate is required'),
          city: z.string().optional(),
          PostZipCode: z.string().optional(),
          poBoxNumber: z.string().optional(),
          university: z.string().optional(),
          qualification: z.string().optional(),
          qualificationYearOfCompletionDate: z.string().optional(),
          emergencyContactName1: z.string().min(1, 'Contact name is required'),
          emergencyContactNumber1: z
            .string()
            .min(1, 'Contact number is required')
            .refine(val => val && val.length === 12, 'Invalid mobile number')
            .refine(val => val !== masterPhoneNumber, 'Please Enter Another Mobile Number'),
          emergencyContactRelationship1: z.string().min(1, 'Relationship 1 is required'),
          emergencyContactName2: z.string().optional(),
          emergencyContactNumber2: z.string().optional(),
          emergencyContactRelationship2: z.string().optional(),
          parentId: z.object({ label: z.string(), value: z.number() }).optional().nullable(),
          salaryRoleId: z.object({ label: z.string(), value: z.number() }).optional().nullable(),
        }
      : {
          employeeCode: z.string().min(1, 'Employee unique id is required'),
          dateOfJoining: z.any().refine(val => val, 'Date of joining is required'),
          otherDetails: z.boolean().optional(),
          // Non-SIF optional fields handled loosely
          gender: z.any().optional(),
          maritalStatus: z.any().optional(),
          presentAddress: z.string().optional(),
          countryId: z.any().optional(),
          stateId: z.any().optional(),
          parentId: z.any().optional(),
        }),
  });
};

const UpdateEmployeePersonal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const empIdFromState = location.state?.id;

  // Redux State
  const {
    designation_dropdown,
    employee_list_dropdown,
    state_list,
    country_list,
    salary_role_dropdown,
    designationType_list,
  } = useSelector(state => ({
    designation_dropdown: state.payrollEmployee.designation_dropdown,
    employee_list_dropdown: state.payrollEmployee.employee_list_dropdown,
    state_list: state.payrollEmployee.state_list,
    country_list: state.payrollEmployee.country_list,
    salary_role_dropdown: state.payrollEmployee.salary_role_dropdown,
    designationType_list: state.employeeDesignation.designationType_list,
  }));

  // Local State
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [sifEnabled, setSifEnabled] = useState(true);
  const [openDesignationModal, setOpenDesignationModal] = useState(false);
  const [userPhoto, setUserPhoto] = useState([]);
  const [userPhotoFile, setUserPhotoFile] = useState([]);

  const [nameDesigExist, setNameDesigExist] = useState(false);
  const [idDesigExist, setIdDesigExist] = useState(false);
  const [emailExist, setEmailExist] = useState(false);
  const [employeeCodeExist, setEmployeeCodeExist] = useState(false);

  // Initial language setup
  const language = window['localStorage'].getItem('language');
  strings.setLanguage(language);

  // Form
  const form = useForm({
    resolver: (values, context, options) => {
      const schema = getUpdatePersonalSchema(sifEnabled, values.mobileNumber);
      return zodResolver(schema)(values, context, options);
    },
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      dob: null,
      active: true,
      employeeDesignationId: '',
      gender: '',
      maritalStatus: '',
      presentAddress: '',
      countryId: '',
      stateId: '',
      city: '',
      PostZipCode: '',
      poBoxNumber: '',
      university: '',
      qualification: '',
      qualificationYearOfCompletionDate: '',
      emergencyContactName1: '',
      emergencyContactNumber1: '',
      emergencyContactRelationship1: '',
      emergencyContactName2: '',
      emergencyContactNumber2: '',
      emergencyContactRelationship2: '',
      parentId: '',
      salaryRoleId: '',
      employeeCode: '',
      dateOfJoining: null,
      otherDetails: false, // Default
    },
  });

  // --- Effects ---

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!empIdFromState) {
        navigate('/admin/master/employee');
        return;
      }

      setLoading(true);
      try {
        // Get Company SIF
        const companyRes = await dispatch(CreatePayrollEmployeeActions.getCompanyById());
        let isSif = true;
        if (companyRes.data) {
          setSifEnabled(companyRes.data.generateSif);
          isSif = companyRes.data.generateSif;
        }

        // Get Employee Data
        const empRes = await dispatch(DetailEmployeePersonalAction.getEmployeeById(empIdFromState));

        // Fetch Dropdowns
        await Promise.all([
          dispatch(CreatePayrollEmployeeActions.getCountryList()),
          dispatch(CreatePayrollEmployeeActions.getStateList()),
          dispatch(CreatePayrollEmployeeActions.getEmployeeDesignationForDropdown()),
          dispatch(CreatePayrollEmployeeActions.getEmployeesForDropdown()),
          dispatch(CreatePayrollEmployeeActions.getSalaryRolesForDropdown()),
          dispatch(DesignationActions.getParentDesignationList()),
        ]);

        if (empRes.status === 200) {
          const data = empRes.data;

          // If country exists, fetch states for it
          if (data.countryId && data.countryId.value) {
            dispatch(CreatePayrollEmployeeActions.getStateList(data.countryId.value));
          }

          // Populate Form
          form.reset({
            firstName: data.firstName || '',
            middleName: data.middleName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            mobileNumber: data.mobileNumber || '',
            dob: data.dob ? new Date(data.dob) : null,
            active: data.isActive,
            employeeDesignationId: data.employeeDesignationId
              ? { label: data.employeeDesignationId.label, value: data.employeeDesignationId.value }
              : '',
            salaryRoleId: data.salaryRoleId
              ? { label: data.salaryRoleId.label, value: data.salaryRoleId.value }
              : '',

            // SIF / Additional
            gender: data.gender
              ? typeof data.gender === 'string'
                ? { label: data.gender, value: data.gender }
                : data.gender
              : '',
            maritalStatus: data.maritalStatus
              ? typeof data.maritalStatus === 'string'
                ? { label: data.maritalStatus, value: data.maritalStatus }
                : data.maritalStatus
              : '',
            presentAddress: data.presentAddress || '',
            city: data.city || '',
            countryId: data.countryId
              ? { label: data.countryId.label, value: data.countryId.value }
              : '',
            stateId: data.stateId ? { label: data.stateId.label, value: data.stateId.value } : '',
            PostZipCode: data.pincode || '',
            poBoxNumber: data.pincode || '', // Mapped to same field in original?

            university: data.university || '',
            qualification: data.qualification || '',
            qualificationYearOfCompletionDate: data.qualificationYearOfCompletionDate || '',

            emergencyContactName1: data.emergencyContactName1 || '',
            emergencyContactNumber1: data.emergencyContactNumber1 || '',
            emergencyContactRelationship1: data.emergencyContactRelationship1 || '',
            emergencyContactName2: data.emergencyContactName2 || '',
            emergencyContactNumber2: data.emergencyContactNumber2 || '',
            emergencyContactRelationship2: data.emergencyContactRelationship2 || '',

            parentId: data.parentId
              ? { label: data.parentId.label, value: data.parentId.value }
              : '',

            // Non-SIF
            employeeCode: data.employeeCode || '',
            dateOfJoining: data.dateOfJoining
              ? dayjs(data.dateOfJoining, 'DD-MM-YYYY').toDate()
              : null,
            otherDetails: true, // Defaulted to true in original
          });

          if (data.profileImageBinary) {
            setUserPhoto([data.profileImageBinary]);
          }
        }
      } catch (err) {
        toast.error('Error fetching employee details');
        navigate('/admin/master/employee');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [dispatch, empIdFromState, navigate, form]);

  // --- Validation Checks ---

  const checkDesignationName = async val => {
    if (!val) return;
    const res = await dispatch(CommonActions.checkValidation({ moduleType: 26, name: val }));
    setNameDesigExist(res.data === 'Designation name already exists');
  };

  const checkDesignationId = async val => {
    if (!val) return;
    const res = await dispatch(CommonActions.checkValidation({ moduleType: 25, name: val }));
    setIdDesigExist(res.data === 'Designation ID already exists');
  };

  const checkEmail = async val => {
    if (!val) return;
    const res = await dispatch(CommonActions.checkValidation({ moduleType: 24, name: val }));
    setEmailExist(res.data === 'Employee email already exists');
    if (res.data === 'Employee email already exists') {
      form.setError('email', { type: 'manual', message: 'Email already exists' });
    } else {
      form.clearErrors('email');
    }
  };

  const checkEmployeeCode = async val => {
    if (!val) return;
    const res = await dispatch(
      CreatePayrollEmployeeActions.checkValidation({ moduleType: 15, name: val })
    );
    setEmployeeCodeExist(res.data === 'Employee Code Already Exists');
    if (res.data === 'Employee Code Already Exists') {
      form.setError('employeeCode', {
        type: 'manual',
        message: 'Employee unique id already exists',
      });
    } else {
      form.clearErrors('employeeCode');
    }
  };

  const handleImageUpload = (picture, file) => {
    setUserPhoto(picture);
    setUserPhotoFile(file);
  };

  // --- Submit Handler ---

  const onSubmit = async data => {
    if (emailExist || (employeeCodeExist && !sifEnabled)) return;

    setLoading(true);
    setLoadingMsg('Updating Employee...');

    const formData = new FormData();
    formData.append('id', empIdFromState);
    formData.append('isActive', data.active);
    formData.append('firstName', data.firstName);
    formData.append('middleName', data.middleName || '');
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('mobileNumber', data.mobileNumber);
    formData.append('dob', data.dob ? dayjs(data.dob).format('DD-MM-YYYY') : '');

    if (data.countryId) formData.append('countryId', data.countryId.value);
    if (data.stateId) formData.append('stateId', data.stateId.value);
    if (data.employeeDesignationId)
      formData.append('employeeDesignationId', data.employeeDesignationId.value);

    // SIF Fields always appended if present in data/schema? Original code appends most regardless but some conditionally?
    // Original code: formData.append('gender', gender); -> It uses destructuring from state/values.

    formData.append(
      'gender',
      data.gender?.value || (typeof data.gender === 'string' ? data.gender : '')
    );
    formData.append(
      'maritalStatus',
      data.maritalStatus?.value ||
        (typeof data.maritalStatus === 'string' ? data.maritalStatus : '')
    );

    formData.append('presentAddress', data.presentAddress || '');
    // formData.append('city', data.city || ''); // Original commented out city?

    formData.append('pincode', data.PostZipCode || ''); // Original maps PostZipCode to pincode

    formData.append('university', data.university || '');
    formData.append('qualification', data.qualification || '');
    formData.append(
      'qualificationYearOfCompletionDate',
      data.qualificationYearOfCompletionDate || ''
    );

    formData.append('emergencyContactName1', data.emergencyContactName1 || '');
    formData.append('emergencyContactNumber1', data.emergencyContactNumber1 || '');
    formData.append('emergencyContactRelationship1', data.emergencyContactRelationship1 || '');
    formData.append('emergencyContactName2', data.emergencyContactName2 || '');
    formData.append('emergencyContactNumber2', data.emergencyContactNumber2 || '');
    formData.append('emergencyContactRelationship2', data.emergencyContactRelationship2 || '');

    if (data.salaryRoleId) formData.append('salaryRoleId', data.salaryRoleId.value);
    if (data.parentId) formData.append('parentId', data.parentId.value);

    if (userPhotoFile.length > 0) {
      formData.append('profileImageBinary ', userPhotoFile[0]);
    }

    try {
      const res = await dispatch(DetailEmployeePersonalAction.updateEmployeePersonal(formData));

      if (res.status === 200) {
        toast.success(res.data?.message || 'Employee Updated Successfully');

        if (!sifEnabled) {
          const formData1 = new FormData();
          formData1.append('id', empIdFromState);
          formData1.append('employee', empIdFromState);
          formData1.append('employeeCode', data.employeeCode);
          formData1.append(
            'dateOfJoining',
            data.dateOfJoining ? dayjs(data.dateOfJoining).format('DD-MM-YYYY') : ''
          );
          await dispatch(DetailEmployeePersonalAction.updateEmployment(formData1));
        }

        navigate('/admin/master/employee/viewEmployee', { state: { id: empIdFromState } });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Updated Unsuccessfully');
    } finally {
      setLoading(false);
    }
  };

  // Options for Selects
  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ];

  const maritalStatusOptions = [
    { label: 'Single', value: 'Single' },
    { label: 'Married', value: 'Married' },
    { label: 'Widowed', value: 'Widowed' },
    { label: 'Divorced', value: 'Divorced' },
    { label: 'Separated', value: 'Separated' },
  ];

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="detail-vat-code-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <div className="h4 mb-0 d-flex align-items-center">
              <i className="nav-icon icon-briefcase" />
              <span className="ml-2"> {strings.UpdateEmployeePersonalDetails}</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="row">
                  {/* Image Uploader */}
                  <div className="col-lg-2 text-center">
                    <ImageUploader
                      buttonText="Choose images"
                      onChange={handleImageUpload}
                      imgExtension={['.jpg', '.png', '.jpeg']}
                      maxFileSize={40000}
                      withPreview={true}
                      singleImage={true}
                      defaultImages={userPhoto}
                    />
                  </div>
                  <div className="col-lg-10">
                    {/* Status Radio */}
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <FormField
                          control={form.control}
                          name="active"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>
                                {strings.Status} <span className="text-danger">*</span>
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={val => field.onChange(val === 'true')}
                                  defaultValue={field.value ? 'true' : 'false'}
                                  className="flex flex-row space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value="true" />
                                    <FormLabel className="font-normal">{strings.Active}</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value="false" />
                                    <FormLabel className="font-normal">
                                      {strings.Inactive}
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Names */}
                    <div className="row">
                      <div className="col-lg-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.FirstName} <span className="text-danger">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onChange={e => field.onChange(upperFirst(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-lg-4">
                        <FormField
                          control={form.control}
                          name="middleName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{strings.MiddleName}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onChange={e => field.onChange(upperFirst(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-lg-4">
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.LastName} <span className="text-danger">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onChange={e => field.onChange(upperFirst(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Email, Mobile, DOB */}
                    <div className="row mt-3">
                      <div className="col-md-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.Email} <span className="text-danger">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onBlur={e => {
                                    field.onBlur();
                                    checkEmail(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-md-4">
                        <FormField
                          control={form.control}
                          name="mobileNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.MobileNumber} <span className="text-danger">*</span>
                              </FormLabel>
                              <PhoneInput
                                country={'ae'}
                                value={field.value}
                                onChange={field.onChange}
                                enableSearch={true}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-md-4">
                        <FormField
                          control={form.control}
                          name="dob"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.DateOfBirth} <span className="text-danger">*</span>
                              </FormLabel>
                              <div className="custom-datepicker-wrapper">
                                <DatePicker
                                  className="form-control"
                                  selected={field.value}
                                  onChange={field.onChange}
                                  showMonthDropdown
                                  showYearDropdown
                                  maxDate={dayjs().subtract(14, 'years').toDate()}
                                  dateFormat="dd-MM-yyyy"
                                  placeholderText={strings.Select + strings.DateOfBirth}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* SIF Disabled Extra Fields */}
                    {!sifEnabled && (
                      <div className="row mt-3">
                        <div className="col-md-4">
                          <FormField
                            control={form.control}
                            name="employeeCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {strings.employee_unique_id}{' '}
                                  <span className="text-danger">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled
                                    onBlur={e => {
                                      field.onBlur();
                                      checkEmployeeCode(e.target.value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-md-4">
                          <FormField
                            control={form.control}
                            name="dateOfJoining"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {strings.DateOfJoining} <span className="text-danger">*</span>
                                </FormLabel>
                                <div className="custom-datepicker-wrapper">
                                  <DatePicker
                                    className="form-control"
                                    selected={field.value}
                                    onChange={field.onChange}
                                    dateFormat="dd-MM-yyyy"
                                    showMonthDropdown
                                    showYearDropdown
                                    placeholderText={strings.Select + strings.DateOfJoining}
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-md-4">
                          <FormField
                            control={form.control}
                            name="employeeDesignationId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {strings.Designation} <span className="text-danger">*</span>
                                </FormLabel>
                                <ReactSelect
                                  options={
                                    designation_dropdown
                                      ? selectOptionsFactory.renderOptions(
                                          'label',
                                          'value',
                                          designation_dropdown,
                                          'Employee Designation'
                                        )
                                      : []
                                  }
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* SIF Disabled: Other Details Checkbox */}
                    {!sifEnabled && (
                      <div className="row mt-3">
                        <div className="col-md-4">
                          <FormField
                            control={form.control}
                            name="otherDetails"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="w-4 h-4"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>{strings.Other + ' ' + strings.Details}</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Other Details / SIF Enabled Section */}
                    {(sifEnabled || form.watch('otherDetails')) && (
                      <>
                        <div className="row mt-3">
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {strings.Gender}{' '}
                                    {sifEnabled && <span className="text-danger">*</span>}
                                  </FormLabel>
                                  <ReactSelect
                                    options={genderOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="maritalStatus"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {strings.maritalStatus}{' '}
                                    {sifEnabled && <span className="text-danger">*</span>}
                                  </FormLabel>
                                  <ReactSelect
                                    options={maritalStatusOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {sifEnabled && (
                            <div className="col-md-4">
                              <FormField
                                control={form.control}
                                name="parentId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{strings.ReportsTo}</FormLabel>
                                    <ReactSelect
                                      options={
                                        employee_list_dropdown.data
                                          ? selectOptionsFactory.renderOptions(
                                              'label',
                                              'value',
                                              employee_list_dropdown.data,
                                              'Employee'
                                            )
                                          : []
                                      }
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder={strings.Select + strings.SuperiorEmployeeName}
                                    />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          {/* Designation for SIF Enabled (as it was in row above for !SIF) */}
                          {sifEnabled && (
                            <div className="col-md-4 mt-3">
                              <div className="flex items-end gap-2">
                                <div className="w-full">
                                  <FormField
                                    control={form.control}
                                    name="employeeDesignationId"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          {strings.Designation}{' '}
                                          <span className="text-danger">*</span>
                                        </FormLabel>
                                        <ReactSelect
                                          options={
                                            designation_dropdown
                                              ? selectOptionsFactory.renderOptions(
                                                  'label',
                                                  'value',
                                                  designation_dropdown,
                                                  'Employee Designation'
                                                )
                                              : []
                                          }
                                          value={field.value}
                                          onChange={field.onChange}
                                        />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <Button type="button" onClick={() => setOpenDesignationModal(true)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {!sifEnabled && (
                          <div className="row mt-3">
                            <div className="col-md-4">
                              <FormField
                                control={form.control}
                                name="parentId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{strings.ReportsTo}</FormLabel>
                                    <ReactSelect
                                      options={
                                        employee_list_dropdown.data
                                          ? selectOptionsFactory.renderOptions(
                                              'label',
                                              'value',
                                              employee_list_dropdown.data,
                                              'Employee'
                                            )
                                          : []
                                      }
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder={strings.Select + strings.SuperiorEmployeeName}
                                    />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}

                        <div className="row mt-3">
                          <div className="col-md-8">
                            <FormField
                              control={form.control}
                              name="presentAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {strings.PresentAddress}{' '}
                                    {sifEnabled && <span className="text-danger">*</span>}
                                  </FormLabel>
                                  <Input {...field} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            {/* Logic for POBox vs PostZipCode based on country. Assuming standard handling here */}
                            <FormField
                              control={form.control}
                              name="PostZipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{strings.PostZipCode}</FormLabel>
                                  <Input {...field} maxLength={6} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="row mt-3">
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="countryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {strings.Country}{' '}
                                    {sifEnabled && <span className="text-danger">*</span>}
                                  </FormLabel>
                                  <ReactSelect
                                    options={
                                      country_list
                                        ? selectOptionsFactory.renderOptions(
                                            'countryName',
                                            'countryCode',
                                            country_list,
                                            'Country'
                                          )
                                        : []
                                    }
                                    value={field.value}
                                    onChange={val => {
                                      field.onChange(val);
                                      dispatch(
                                        CreatePayrollEmployeeActions.getStateList(val.value)
                                      );
                                      form.setValue('stateId', null);
                                    }}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="stateId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {strings.StateRegion}{' '}
                                    {sifEnabled && <span className="text-danger">*</span>}
                                  </FormLabel>
                                  <ReactSelect
                                    options={
                                      state_list
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            state_list,
                                            'State'
                                          )
                                        : []
                                    }
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{strings.City}</FormLabel>
                                  <Input {...field} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <hr className="my-4" />
                        <h4 className="mb-3">{strings.EducationDetails}</h4>
                        <div className="row">
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="university"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{strings.University}</FormLabel>
                                  <Input {...field} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="qualification"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{strings.qualification}</FormLabel>
                                  <Input {...field} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="qualificationYearOfCompletionDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{strings.qualificationYearOfCompletionDate}</FormLabel>
                                  <Input {...field} maxLength={10} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <hr className="my-4" />
                        <h4 className="mb-3">{strings.EmergencyContact}</h4>

                        <div className="row">
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="emergencyContactName1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {strings.ContactName1}{' '}
                                    {sifEnabled && <span className="text-danger">*</span>}
                                  </FormLabel>
                                  <Input {...field} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="emergencyContactNumber1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {strings.ContactNumber1}{' '}
                                    {sifEnabled && <span className="text-danger">*</span>}
                                  </FormLabel>
                                  <PhoneInput
                                    country={'ae'}
                                    value={field.value}
                                    onChange={field.onChange}
                                    enableSearch={true}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="emergencyContactRelationship1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {strings.Relationship1}{' '}
                                    {sifEnabled && <span className="text-danger">*</span>}
                                  </FormLabel>
                                  <Input {...field} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="row mt-3">
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="emergencyContactName2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{strings.ContactName2}</FormLabel>
                                  <Input {...field} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="emergencyContactNumber2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{strings.ContactNumber2}</FormLabel>
                                  <PhoneInput
                                    country={'ae'}
                                    value={field.value}
                                    onChange={field.onChange}
                                    enableSearch={true}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-4">
                            <FormField
                              control={form.control}
                              name="emergencyContactRelationship2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{strings.Relationship2}</FormLabel>
                                  <Input {...field} />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="row mt-5">
                  <div className="col-lg-12 text-right">
                    <Button type="submit" className="mr-2">
                      <CircleDot className="h-4 w-4" /> {strings.Update}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        navigate('/admin/master/employee/viewEmployee', {
                          state: { id: empIdFromState },
                        })
                      }
                    >
                      <Ban className="h-4 w-4" /> {strings.Cancel}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <DesignationModal
        openDesignationModal={openDesignationModal}
        closeDesignationModal={() => setOpenDesignationModal(false)}
        nameDesigExist={nameDesigExist}
        idDesigExist={idDesigExist}
        validateid={checkDesignationId}
        validateinfo={checkDesignationName}
        getCurrentUser={() => {
          dispatch(CreatePayrollEmployeeActions.getEmployeeDesignationForDropdown()).then(res => {
            if (res.status === 200 && res.data.length > 0) {
              const last = res.data[res.data.length - 1];
              form.setValue('employeeDesignationId', last);
            }
          });
        }}
        createDesignation={data =>
          dispatch(CreatePayrollEmployeeActions.createEmployeeDesignation(data))
        }
        designationType_list={designationType_list}
      />

      <LeavePage />
    </div>
  );
};

export default UpdateEmployeePersonal;
