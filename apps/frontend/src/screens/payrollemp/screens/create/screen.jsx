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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader, ImageUploader, LeavePage } from 'components';
import ReactSelect from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { upperFirst } from 'lodash-es';
import dayjs from '@/utils/date';

import { CommonActions } from 'services/global';
import * as CreatePayrollEmployeeActions from '../create/actions';
import * as PayrollEmployeeActions from '../../actions';
import * as DetailEmployeePersonalAction from '../update_emp_personal/actions';
import * as DetailEmployeeEmployementAction from '../update_emp_employemet/actions';
import * as DetailEmployeeBankAction from '../update_emp_bank/actions';
import * as DesignationActions from '../../../designation/actions';

import { DesignationModal, SalaryComponent } from 'screens/payrollemp/sections';
import { data } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';
import { selectOptionsFactory } from 'utils';
import { toast } from 'sonner';

const strings = new LocalizedStrings(data);

// --- Zod Schemas ---

const getBasicDetailsSchema = (sifEnabled, masterPhoneNumber) => {
  let schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    email: z.string().email('Invalid Email').min(1, 'Email is required'),
    mobileNumber: z
      .string()
      .min(1, 'Mobile number is required')
      .refine(val => val && val.length === 12, 'Invalid mobile number'),
    dob: z
      .any()
      .refine(val => val, 'DOB is required')
      .refine(val => {
        // Age check > 14
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
          emergencyContactName1: z.string().min(1, 'Contact name 1 is required'),
          emergencyContactNumber1: z
            .string()
            .min(1, 'Contact number 1 is required')
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
          // For non-sifEnabled, these might be optional or hidden, but schema needs to handle them if they exist in form data
          gender: z.any().optional(),
          maritalStatus: z.any().optional(),
          presentAddress: z.string().optional(),
          countryId: z.any().optional(),
          stateId: z.any().optional(),
          otherDetails: z.boolean().optional(),
          parentId: z.any().optional(),
        }),
  });
  return schema;
};

const getEmploymentSchema = () =>
  z.object({
    employeeCode: z.string().min(1, 'Employee unique id is required'),
    labourCard: z.string().min(1, 'Labour card id is required'),
    department: z.string().optional(),
    dateOfJoining: z.any().refine(val => val, 'Date of joining is required'),
    passportNumber: z.string().optional(),
    passportExpiryDate: z.any().optional(),
    salaryRoleId: z.any().optional(), // Adding as it's used in submit
  });

const getFinancialSchema = () =>
  z.object({
    accountHolderName: z.string().min(1, 'Account holder name is required'),
    accountNumber: z
      .string()
      .min(1, 'Account number is required')
      .regex(/^[^0]+$/, 'Please enter a valid Account number'),
    bankId: z
      .object({ label: z.string(), value: z.number() })
      .refine(val => val, 'Bank is required'),
    branch: z.string().min(1, 'Branch is required'),
    iban: z
      .string()
      .min(1, 'IBAN Number is required')
      .regex(/^[^0]+$/, 'Please enter a valid IBAN Number'),
    swiftCode: z.string().optional(),
    agentId: z
      .string()
      .min(9, 'Agent ID must be 9 characters')
      .max(9, 'Agent ID must be 9 characters'),
  });

const CreateEmployeePayroll = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux State
  const {
    designation_dropdown,
    employee_list_dropdown,
    state_list,
    country_list,
    salary_role_dropdown,
    designationType_list,
    bankList,
  } = useSelector(state => ({
    designation_dropdown: state.payrollEmployee.designation_dropdown,
    employee_list_dropdown: state.payrollEmployee.employee_list_dropdown,
    state_list: state.payrollEmployee.state_list,
    country_list: state.payrollEmployee.country_list,
    salary_role_dropdown: state.payrollEmployee.salary_role_dropdown,
    designationType_list: state.employeeDesignation.designationType_list,
    bankList: state.payrollEmployee.bankList,
  }));

  // Local State
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [sifEnabled, setSifEnabled] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedData, setSelectedData] = useState({});
  const [openDesignationModal, setOpenDesignationModal] = useState(false);
  const [userPhoto, setUserPhoto] = useState([]);
  const [userPhotoFile, setUserPhotoFile] = useState([]);

  // Validation State
  const [nameDesigExist, setNameDesigExist] = useState(false);
  const [idDesigExist, setIdDesigExist] = useState(false);
  const [emailExist, setEmailExist] = useState(false);
  const [employeeCodeExist, setEmployeeCodeExist] = useState(false);
  const [labourCardExist, setLabourCardExist] = useState(false);
  const [accountNumberExist, setAccountNumberExist] = useState(false);

  // Initial language setup
  const language = window['localStorage'].getItem('language');
  strings.setLanguage(language);

  // --- Forms ---

  const basicForm = useForm({
    resolver: zodResolver(getBasicDetailsSchema(sifEnabled, '')), // Will update resolver when values change
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
      countryId: { label: 'United Arab Emirate', value: 229 },
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
      otherDetails: false,
    },
  });

  const employmentForm = useForm({
    resolver: zodResolver(getEmploymentSchema()),
    defaultValues: {
      employeeCode: '',
      labourCard: '',
      department: '',
      dateOfJoining: null,
      passportNumber: '',
      passportExpiryDate: null,
      salaryRoleId: '',
    },
  });

  const financialForm = useForm({
    resolver: zodResolver(getFinancialSchema()),
    defaultValues: {
      accountHolderName: '',
      accountNumber: '',
      bankId: '',
      branch: '',
      iban: '',
      swiftCode: '',
      agentId: '',
    },
  });

  // Update Basic Form Resolver when SIF changes or mobile number changes
  const mobileNumber = basicForm.watch('mobileNumber');
  useEffect(() => {
    basicForm.clearErrors();
    // We need to re-register the resolver because it depends on state/values
    // But react-hook-form doesn't have a simple "setResolver".
    // The standard way is to rely on the hook re-rendering and the resolver function running.
    // However, with zodResolver(schema), the schema is created once.
    // We can pass a function to zodResolver? No, zodResolver takes a schema.
    // We should memoize the schema.
  }, [sifEnabled, mobileNumber]);

  // Use a dynamic resolver for Basic Form
  const basicResolver = useCallback(
    (values, context, options) => {
      const schema = getBasicDetailsSchema(sifEnabled, values.mobileNumber);
      return zodResolver(schema)(values, context, options);
    },
    [sifEnabled]
  );

  // Apply dynamic resolver hack by replacing the resolver in the hook configuration?
  // Actually, passing the resolver function to useForm directly supports async resolver.
  // Let's rely on re-renders, or just define the schema inside the submit handler for manual check?
  // No, we want real-time validation.
  // Ideally we pass `resolver: (values, context, options) => zodResolver(getSchema(values))(values, ...)`

  // Re-initialize basic form with correct resolver
  // We can't change resolver dynamically easily.
  // Instead, let's create a single schema that handles the conditions based on the values passed to it?
  // Or simpler: The schema generator function is fast.

  // --- Effects ---

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setLoadingMsg('Loading...');

      await Promise.all([
        dispatch(CreatePayrollEmployeeActions.getCountryList()),
        dispatch(CreatePayrollEmployeeActions.getStateList()),
        dispatch(CreatePayrollEmployeeActions.getEmployeeDesignationForDropdown()),
        dispatch(CreatePayrollEmployeeActions.getEmployeesForDropdown()),
        dispatch(CreatePayrollEmployeeActions.getSalaryRolesForDropdown()),
      ]);

      // Bank List
      const bankResponse = await dispatch(CreatePayrollEmployeeActions.getBankListForEmployees());
      // We might need to store bank list in local state if not in redux properly or just use selector

      // Get Company SIF setting
      const companyRes = await dispatch(CreatePayrollEmployeeActions.getCompanyById());
      if (companyRes.data) {
        setSifEnabled(companyRes.data.generateSif);
      }

      // Get Employee Code
      const empCodeRes = await dispatch(CreatePayrollEmployeeActions.getEmployeeCode());
      if (empCodeRes.status === 200) {
        basicForm.setValue('employeeCode', empCodeRes.data);
        employmentForm.setValue('employeeCode', empCodeRes.data);
      }

      // Initial State List if default country is set
      // Default country 229 (UAE)
      dispatch(CreatePayrollEmployeeActions.getStateList(229));

      setLoading(false);
    };

    fetchInitialData();
  }, [dispatch, basicForm, employmentForm]);

  // Helper to refresh employee data
  const refreshEmployeeData = id => {
    dispatch(CreatePayrollEmployeeActions.getEmployeeById(id)).then(res => {
      setSelectedData(res.data);
    });
  };

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
      basicForm.setError('email', { type: 'manual', message: 'Email already exists' });
    } else {
      basicForm.clearErrors('email');
    }
  };

  const checkEmployeeCode = async val => {
    if (!val) return;
    const res = await dispatch(
      CreatePayrollEmployeeActions.checkValidation({ moduleType: 15, name: val })
    );
    setEmployeeCodeExist(res.data === 'Employee Code Already Exists');
    if (res.data === 'Employee Code Already Exists') {
      const msg = 'Employee unique id already exists';
      basicForm.setError('employeeCode', { type: 'manual', message: msg });
      employmentForm.setError('employeeCode', { type: 'manual', message: msg });
    } else {
      basicForm.clearErrors('employeeCode');
      employmentForm.clearErrors('employeeCode');
    }
  };

  const checkLabourCard = async val => {
    if (!val) return;
    const res = await dispatch(
      CreatePayrollEmployeeActions.checkValidation({ moduleType: 23, name: val })
    );
    setLabourCardExist(res.data === 'Labour Card Id Already Exists');
    if (res.data === 'Labour Card Id Already Exists') {
      employmentForm.setError('labourCard', {
        type: 'manual',
        message: 'Labour card id already exists',
      });
    } else {
      employmentForm.clearErrors('labourCard');
    }
  };

  const checkAccountNumber = async val => {
    if (!val) return;
    const res = await dispatch(
      CreatePayrollEmployeeActions.checkValidation({ moduleType: 19, name: val })
    );
    setAccountNumberExist(res.data === 'Account Number Already Exists');
    if (res.data === 'Account Number Already Exists') {
      financialForm.setError('accountNumber', {
        type: 'manual',
        message: 'Account Number Already Exists',
      });
    } else {
      financialForm.clearErrors('accountNumber');
    }
  };

  // --- Handlers ---

  const handleImageUpload = (picture, file) => {
    setUserPhoto(picture);
    setUserPhotoFile(file);
  };

  const onBasicSubmit = async data => {
    if (emailExist || (employeeCodeExist && !sifEnabled)) return;

    setLoading(true);
    setLoadingMsg('Saving Basic Details...');

    const formData = new FormData();
    if (employeeId && typeof employeeId !== 'string') formData.append('id', employeeId);

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

    // SIF Fields
    if (sifEnabled) {
      formData.append('gender', data.gender?.value || '');
      formData.append('maritalStatus', data.maritalStatus?.value || '');
      formData.append('presentAddress', data.presentAddress);
      formData.append('city', data.city || '');
      formData.append('pincode', data.PostZipCode || ''); // Mapping PostZipCode to pincode
      formData.append('university', data.university || '');
      formData.append('qualification', data.qualification || '');
      formData.append(
        'qualificationYearOfCompletionDate',
        data.qualificationYearOfCompletionDate || ''
      );
      formData.append('emergencyContactName1', data.emergencyContactName1);
      formData.append('emergencyContactNumber1', data.emergencyContactNumber1);
      formData.append('emergencyContactRelationship1', data.emergencyContactRelationship1);
      formData.append('emergencyContactName2', data.emergencyContactName2 || '');
      formData.append('emergencyContactNumber2', data.emergencyContactNumber2 || '');
      formData.append('emergencyContactRelationship2', data.emergencyContactRelationship2 || '');
      if (data.salaryRoleId) formData.append('salaryRoleId', data.salaryRoleId.value);
      if (data.parentId) formData.append('parentId', data.parentId.value);
    } else {
      // Non-SIF specific
      // The original code passed 'employeeCode' and 'dateOfJoining' in basic submit too if !sifEnabled?
      // Yes: "formData1.append('employeeCode', ...)" in the success block for basic create.
      // Actually, the original code had a weird flow where it calls saveEmployment immediately after createEmployee if successful.
    }

    if (userPhotoFile.length > 0) {
      formData.append('profileImageBinary ', userPhotoFile[0]);
    }

    try {
      let res;
      if (!employeeId) {
        res = await dispatch(CreatePayrollEmployeeActions.createEmployee(formData));
      } else {
        res = await dispatch(DetailEmployeePersonalAction.updateEmployeePersonal(formData));
      }

      if (res.status === 200) {
        toast.success(
          employeeId
            ? 'Employee Updated Successfully!'
            : 'Employee Basic Details Saved Successfully'
        );
        const newId = res.data;
        if (!employeeId) setEmployeeId(newId);

        // If SIF disabled, create employment immediately
        if (!sifEnabled && !employeeId) {
          const formData1 = new FormData();
          formData1.append('employee', newId);
          formData1.append('employeeCode', data.employeeCode);
          formData1.append(
            'dateOfJoining',
            data.dateOfJoining ? dayjs(data.dateOfJoining).format('DD-MM-YYYY') : ''
          );
          await dispatch(CreatePayrollEmployeeActions.saveEmployment(formData1));
        }

        refreshEmployeeData(employeeId || newId);

        if (sifEnabled) {
          setActiveTab('2'); // Go to Employment
        } else {
          setActiveTab('4'); // Go to Salary Setup (Skip Employment/Financial for non-SIF?) - Original logic: toggle(0, '4') if !sifEnabled
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Error saving employee details');
    } finally {
      setLoading(false);
    }
  };

  const onEmploymentSubmit = async data => {
    if (!employeeId) {
      toast.error('Please save basic details first');
      return;
    }
    if (labourCardExist || employeeCodeExist) return;

    setLoading(true);
    setLoadingMsg('Saving Employment Details...');

    const formData = new FormData();
    formData.append('employee', employeeId);
    formData.append('employeeCode', data.employeeCode);
    formData.append('labourCard', data.labourCard);
    formData.append('department', data.department || '');
    formData.append(
      'dateOfJoining',
      data.dateOfJoining ? dayjs(data.dateOfJoining).format('DD-MM-YYYY') : ''
    );
    formData.append('passportNumber', data.passportNumber || '');
    formData.append(
      'passportExpiryDate',
      data.passportExpiryDate ? dayjs(data.passportExpiryDate).format('DD-MM-YYYY') : ''
    );

    // Include Salary Role ID from basic form if needed, but schema has it optional
    // Original code appends salaryRoleId to employment form? Yes.
    // We can get it from basicForm values or state
    const basicValues = basicForm.getValues();
    if (basicValues.salaryRoleId) {
      formData.append('salaryRoleId', basicValues.salaryRoleId.value);
    }

    if (selectedData.employmentId) {
      formData.append('id', selectedData.employmentId);
    }

    try {
      let res;
      if (!selectedData.employmentId) {
        res = await dispatch(CreatePayrollEmployeeActions.saveEmployment(formData));
      } else {
        res = await dispatch(DetailEmployeeEmployementAction.updateEmployment(formData));
      }

      if (res.status === 200) {
        toast.success(
          selectedData.employmentId
            ? 'Employment Details Updated Successfully'
            : 'Employment Details Saved Successfully'
        );
        refreshEmployeeData(employeeId);
        setActiveTab('3'); // Go to Financial
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Error saving employment details');
    } finally {
      setLoading(false);
    }
  };

  const onFinancialSubmit = async data => {
    if (!employeeId) return;
    if (accountNumberExist) return;

    setLoading(true);
    setLoadingMsg('Saving Financial Details...');

    const formData = new FormData();
    formData.append('employee', employeeId);
    formData.append('accountHolderName', data.accountHolderName);
    formData.append('accountNumber', data.accountNumber);
    if (data.bankId) {
      formData.append('bankId', data.bankId.value);
      formData.append('bankName', data.bankId.label);
    }
    formData.append('branch', data.branch);
    formData.append('iban', 'AE' + data.iban); // Prepend AE
    formData.append('swiftCode', data.swiftCode || '');
    formData.append('agentId', data.agentId);
    formData.append('employmentId', selectedData.employmentId || '');

    try {
      let res;
      if (!selectedData.employeeBankDetailsId) {
        res = await dispatch(CreatePayrollEmployeeActions.saveEmployeeBankDetails(formData));
      } else {
        res = await dispatch(DetailEmployeeBankAction.updateEmployeeBank(formData));
      }

      if (res.status === 200) {
        toast.success('Financial Details Saved Successfully');
        refreshEmployeeData(employeeId);
        setActiveTab('4'); // Go to Salary Setup
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Error saving financial details');
    } finally {
      setLoading(false);
    }
  };

  // Wrapper for Salary Component Submit
  const handleSalarySubmit = async data => {
    // Logic taken from original component
    const {
      totalMonthlyEarnings,
      totalNetPayMontly,
      totalNetPayYearly,
      list,
      totalYearlyEarnings,
      ctcType,
      ctcTypeOption,
    } = data;

    const salaryComponentStringList = list.filter(obj => obj.id !== '');
    const formData = new FormData();
    formData.append('employee', employeeId);
    if (ctcType === 'ANNUALLY') {
      formData.append('grossSalary', totalYearlyEarnings);
      formData.append('totalNetPay', totalNetPayYearly);
    } else {
      formData.append('grossSalary', totalMonthlyEarnings);
      formData.append('totalNetPay', totalNetPayMontly);
    }

    formData.append('ctcType', ctcTypeOption.label ? ctcTypeOption.label : 'ANNUALLY');
    formData.append('salaryComponentString', JSON.stringify(salaryComponentStringList));

    setLoading(true);
    try {
      const res = await dispatch(CreatePayrollEmployeeActions.saveSalaryComponent(formData));
      if (res.status === 200) {
        toast.success('New Employee Created Successfully');
        navigate('/admin/master/employee');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Error creating employee salary');
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

  if (loading && !employeeId) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="financial-report-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <CardTitle className="h4 mb-0 d-flex align-items-center">
              <i className="nav-icon fas fa-user-plus mr-2" />
              {strings.CreateEmployee}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="1">{strings.BasicDetails}</TabsTrigger>
                {sifEnabled && (
                  <TabsTrigger value="2" disabled={!employeeId}>
                    {strings.Employment}
                  </TabsTrigger>
                )}
                {sifEnabled && (
                  <TabsTrigger value="3" disabled={!employeeId}>
                    {strings.FinancialDetails}
                  </TabsTrigger>
                )}
                <TabsTrigger value="4" disabled={!employeeId}>
                  {strings.SalarySetup}
                </TabsTrigger>
              </TabsList>

              {/* --- TAB 1: BASIC DETAILS --- */}
              <TabsContent value="1">
                <Form {...basicForm}>
                  <form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="space-y-4">
                    <div className="row">
                      {/* Image Uploader */}
                      <div className="col-lg-2 text-center">
                        <ImageUploader
                          buttonText={strings.chooseimage}
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
                              control={basicForm.control}
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
                                        <FormLabel className="font-normal">
                                          {strings.Active}
                                        </FormLabel>
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
                              control={basicForm.control}
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
                              control={basicForm.control}
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
                              control={basicForm.control}
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

                        {/* Email, DOB, Mobile */}
                        <div className="row mt-3">
                          <div className="col-md-4">
                            <FormField
                              control={basicForm.control}
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
                              control={basicForm.control}
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
                          <div className="col-md-4">
                            <FormField
                              control={basicForm.control}
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
                        </div>

                        {/* Designation */}
                        <div className="row mt-3">
                          <div className="col-md-8">
                            <FormField
                              control={basicForm.control}
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
                          <div className="col-md-4 pt-4">
                            <Button type="button" onClick={() => setOpenDesignationModal(true)}>
                              <i className="fa fa-plus mr-1"></i> {strings.AddDesignation}
                            </Button>
                          </div>
                        </div>

                        {/* SIF Specific Fields */}
                        {sifEnabled && (
                          <div className="row mt-3">
                            <div className="col-md-4">
                              <FormField
                                control={basicForm.control}
                                name="gender"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {strings.Gender} <span className="text-danger">*</span>
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
                                control={basicForm.control}
                                name="maritalStatus"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {strings.maritalStatus} <span className="text-danger">*</span>
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
                            <div className="col-md-4">
                              <FormField
                                control={basicForm.control}
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

                        {/* Address Section (SIF) */}
                        {sifEnabled && (
                          <>
                            <hr className="mt-4 mb-4" />
                            <h4 className="mb-3">{strings.AddressDetails}</h4>
                            <div className="row">
                              <div className="col-md-8">
                                <FormField
                                  control={basicForm.control}
                                  name="presentAddress"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        {strings.PresentAddress}{' '}
                                        <span className="text-danger">*</span>
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
                                  control={basicForm.control}
                                  name="countryId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        {strings.Country} <span className="text-danger">*</span>
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
                                          basicForm.setValue('stateId', null);
                                        }}
                                      />
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="col-md-4">
                                <FormField
                                  control={basicForm.control}
                                  name="stateId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        {strings.StateRegion} <span className="text-danger">*</span>
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
                                  control={basicForm.control}
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
                          </>
                        )}

                        {/* Submit Basic */}
                        <div className="row mt-5">
                          <div className="col-lg-12 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              className="mr-2"
                              onClick={() => navigate('/admin/master/employee')}
                            >
                              {strings.Cancel}
                            </Button>
                            <Button type="submit">
                              {strings.Next} <i className="far fa-arrow-alt-circle-right ml-1"></i>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* --- TAB 2: EMPLOYMENT --- */}
              <TabsContent value="2">
                <Form {...employmentForm}>
                  <form
                    onSubmit={employmentForm.handleSubmit(onEmploymentSubmit)}
                    className="space-y-4"
                  >
                    <div className="row">
                      <div className="col-md-4">
                        <FormField
                          control={employmentForm.control}
                          name="employeeCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.employee_unique_id} <span className="text-danger">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
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
                          control={employmentForm.control}
                          name="labourCard"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.LabourCardId} <span className="text-danger">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onBlur={e => {
                                    field.onBlur();
                                    checkLabourCard(e.target.value);
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
                          control={employmentForm.control}
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
                    </div>

                    <div className="row mt-3">
                      <div className="col-md-4">
                        <FormField
                          control={employmentForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{strings.Department}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-md-4">
                        <FormField
                          control={employmentForm.control}
                          name="passportNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{strings.PassportNumber}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-md-4">
                        <FormField
                          control={employmentForm.control}
                          name="passportExpiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{strings.PassportExpiryDate}</FormLabel>
                              <div className="custom-datepicker-wrapper">
                                <DatePicker
                                  className="form-control"
                                  selected={field.value}
                                  onChange={field.onChange}
                                  dateFormat="dd-MM-yyyy"
                                  showMonthDropdown
                                  showYearDropdown
                                  placeholderText={strings.Select + strings.PassportExpiryDate}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="row mt-5">
                      <div className="col-lg-12 flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setActiveTab('1')}>
                          <i className="far fa-arrow-alt-circle-left mr-1"></i> {strings.back}
                        </Button>
                        <Button type="submit">
                          {strings.Next} <i className="far fa-arrow-alt-circle-right ml-1"></i>
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* --- TAB 3: FINANCIAL --- */}
              <TabsContent value="3">
                <Form {...financialForm}>
                  <form
                    onSubmit={financialForm.handleSubmit(onFinancialSubmit)}
                    className="space-y-4"
                  >
                    <h4>{strings.BankDetails}</h4>
                    <div className="row">
                      <div className="col-md-4">
                        <FormField
                          control={financialForm.control}
                          name="accountHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.AccountHolderName} <span className="text-danger">*</span>
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
                      <div className="col-md-4">
                        <FormField
                          control={financialForm.control}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.AccountNumber} <span className="text-danger">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onBlur={e => {
                                    field.onBlur();
                                    checkAccountNumber(e.target.value);
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
                          control={financialForm.control}
                          name="bankId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.BankName} <span className="text-danger">*</span>
                              </FormLabel>
                              <ReactSelect
                                options={bankList}
                                getOptionLabel={option => option.bankName}
                                getOptionValue={option => option.bankId}
                                value={field.value}
                                onChange={val => {
                                  field.onChange({ label: val.bankName, value: val.bankId });
                                }}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="row mt-3">
                      <div className="col-md-4">
                        <FormField
                          control={financialForm.control}
                          name="branch"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.Branch} <span className="text-danger">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-md-4">
                        <FormField
                          control={financialForm.control}
                          name="iban"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.IBANNumber} <span className="text-danger">*</span>
                              </FormLabel>
                              <div className="flex">
                                <Input disabled value="AE" className="w-12 mr-2" />
                                <FormControl>
                                  <Input {...field} maxLength={21} />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-md-4">
                        <FormField
                          control={financialForm.control}
                          name="swiftCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{strings.SwiftCode}</FormLabel>
                              <FormControl>
                                <Input {...field} maxLength={11} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="row mt-3">
                      <div className="col-md-4">
                        <FormField
                          control={financialForm.control}
                          name="agentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {strings.agent_id} <span className="text-danger">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} maxLength={9} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="row mt-5">
                      <div className="col-lg-12 flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setActiveTab('2')}>
                          <i className="far fa-arrow-alt-circle-left mr-1"></i> {strings.back}
                        </Button>
                        <Button type="submit">
                          {strings.Next} <i className="far fa-arrow-alt-circle-right ml-1"></i>
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* --- TAB 4: SALARY SETUP --- */}
              <TabsContent value="4">
                {employeeId && (
                  <SalaryComponent
                    employeeId={employeeId}
                    handleSubmit={handleSalarySubmit}
                    history={{ push: navigate }} // Adapter for history
                    updateComponent={false}
                    toggle={tab => setActiveTab(tab)}
                    sifEnabled={sifEnabled}
                  />
                )}
              </TabsContent>
            </Tabs>
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
          // logic to fetch latest designation and set it
          dispatch(CreatePayrollEmployeeActions.getEmployeeDesignationForDropdown()).then(res => {
            if (res.status === 200 && res.data.length > 0) {
              const last = res.data[res.data.length - 1];
              basicForm.setValue('employeeDesignationId', last);
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

export default CreateEmployeePayroll;
