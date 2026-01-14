import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { UserCircle, CircleDot, RefreshCw, Ban, ChevronRight, Home } from 'lucide-react';
import DatePicker from 'react-datepicker';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global';
import * as EmployeeActions from '../../actions';
import * as EmployeeCreateActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';

const strings = {
  Create: 'Create',
  CreateandMore: 'Create and More',
  Cancel: 'Cancel',
};

// Corporate theme constants
const theme = {
  bg: '#f8f9fa',
  bgWhite: '#ffffff',
  primary: '#2064d8',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  danger: '#ef4444',
};

const regExBoth = /[a-zA-Z0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

// Zod validation schema
const createEmployeeSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
    middleName: z.string().min(1, 'Middle name is required').max(100, 'Middle name is too long'),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Valid email is required')
      .max(80, 'Email is too long')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(1, 'Password is required')
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        'Must contain 8 characters, one uppercase, one lowercase, one number and one special case character'
      ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    dob: z.date({
      required_error: 'DOB is required',
      invalid_type_error: 'DOB is required',
    }),
    referenceCode: z.string().max(100, 'Reference code is too long').optional(),
    title: z.string().max(100, 'Title is too long').optional(),
    billingEmail: z
      .string()
      .email('Valid email is required')
      .max(80, 'Billing email is too long')
      .optional()
      .or(z.literal('')),
    vatRegestationNo: z.string().max(15, 'Tax registration number is too long').optional(),
    currencyCode: z.string().optional(),
    poBoxNumber: z.string().max(8, 'Contract PO number is too long').optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

const mapStateToProps = state => ({
  currency_list: state.employee.currency_list,
});

const mapDispatchToProps = dispatch => ({
  commonActions: bindActionCreators(CommonActions, dispatch),
  employeeActions: bindActionCreators(EmployeeActions, dispatch),
  employeeCreateActions: bindActionCreators(EmployeeCreateActions, dispatch),
});

const CreateEmployee = ({
  commonActions,
  employeeActions,
  employeeCreateActions,
  currency_list,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [createMore, setCreateMore] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dob: null,
      referenceCode: '',
      title: '',
      billingEmail: '',
      vatRegestationNo: '',
      currencyCode: '',
      poBoxNumber: '',
    },
    mode: 'onChange',
  });

  const { reset } = form;

  useEffect(() => {
    employeeActions.getCurrencyList();
  }, [employeeActions]);

  const onSubmit = data => {
    let postData = { ...data };
    if (postData.currencyCode) {
      postData.currencyCode = parseInt(postData.currencyCode);
    } else {
      postData.currencyCode = '';
    }

    setDisabled(true);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating New Employee...');

    employeeCreateActions
      .createEmployee(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert(
            'success',
            res.data?.message || 'New Employee Created Successfully'
          );
          if (createMore) {
            setCreateMore(false);
            setDisableLeavePage(false);
            reset();
          } else {
            navigate('/admin/master/employee');
          }
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err?.data?.message || 'New Employee Created Unsuccessfully'
        );
        setLoading(false);
        setDisabled(false);
        setDisableLeavePage(false);
      });
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div style={{ background: theme.bg, minHeight: '100%' }}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
          Add Employee
        </h1>
        <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: theme.textMuted }}>
          <Home className="w-4 h-4" />
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => navigate('/admin/dashboard')}
          >
            Home
          </span>
          <ChevronRight className="w-4 h-4" />
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => navigate('/admin/master/employee')}
          >
            Employees
          </span>
          <ChevronRight className="w-4 h-4" />
          <span>Add Employee</span>
        </div>
      </div>

      {/* Form Card */}
      <Card
        className="rounded-xl"
        style={{
          background: theme.bgWhite,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardHeader className="border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#dbeafe' }}
            >
              <UserCircle className="w-5 h-5" style={{ color: theme.primary }} />
            </div>
            <CardTitle className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              Create Employee
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Name Section */}
              <div>
                <h4 className="text-md font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Contact Name
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Reference Code */}
                  <FormField
                    control={form.control}
                    name="referenceCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>Reference Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Reference Code"
                            value={field.value}
                            onChange={e => {
                              if (e.target.value === '' || regExBoth.test(e.target.value)) {
                                field.onChange(e.target.value);
                              }
                            }}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Title"
                            value={field.value}
                            onChange={e => {
                              if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                                field.onChange(e.target.value);
                              }
                            }}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>
                          <span className="text-red-500">*</span> Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter Email Address"
                            maxLength={80}
                            {...field}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* First Name */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>
                          <span className="text-red-500">*</span> First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter First Name"
                            maxLength={100}
                            value={field.value}
                            onChange={e => {
                              if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                                field.onChange(e.target.value);
                              }
                            }}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Middle Name */}
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>
                          <span className="text-red-500">*</span> Middle Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Middle Name"
                            maxLength={100}
                            value={field.value}
                            onChange={e => {
                              if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                                field.onChange(e.target.value);
                              }
                            }}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Last Name */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>
                          <span className="text-red-500">*</span> Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Last Name"
                            maxLength={100}
                            value={field.value}
                            onChange={e => {
                              if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                                field.onChange(e.target.value);
                              }
                            }}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>
                          <span className="text-red-500">*</span> Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="new-password"
                            {...field}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                        {!form.formState.errors.password && (
                          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                            Must contain 8 characters, one uppercase, one lowercase, one number and
                            one special character.
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>
                          <span className="text-red-500">*</span> Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter Confirm Password"
                            {...field}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date of Birth */}
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>
                          <span className="text-red-500">*</span> Date Of Birth
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            className="flex h-11 w-full rounded-md border px-3 py-2 text-sm"
                            style={{ borderColor: theme.border }}
                            placeholderText="Select Date of Birth"
                            showMonthDropdown
                            showYearDropdown
                            dateFormat="dd-MM-yyyy"
                            dropdownMode="select"
                            selected={field.value}
                            maxDate={new Date()}
                            onChange={date => field.onChange(date)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Divider */}
              <hr style={{ borderColor: theme.border }} />

              {/* Invoicing Details Section */}
              <div>
                <h4 className="text-md font-semibold mb-4" style={{ color: theme.textPrimary }}>
                  Invoicing Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Billing Email */}
                  <FormField
                    control={form.control}
                    name="billingEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>Billing Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter Billing Email Address"
                            maxLength={80}
                            {...field}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contract PO Number */}
                  <FormField
                    control={form.control}
                    name="poBoxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>
                          Contract PO Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Contract PO Number"
                            maxLength={8}
                            value={field.value}
                            onChange={e => {
                              if (e.target.value === '' || regExBoth.test(e.target.value)) {
                                field.onChange(e.target.value);
                              }
                            }}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Tax Registration Number */}
                  <FormField
                    control={form.control}
                    name="vatRegestationNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>
                          Tax Registration Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Tax Registration Number"
                            maxLength={15}
                            value={field.value}
                            onChange={e => {
                              if (e.target.value === '' || regExBoth.test(e.target.value)) {
                                field.onChange(e.target.value);
                              }
                            }}
                            className="h-11"
                            style={{ borderColor: theme.border }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Currency Code */}
                  <FormField
                    control={form.control}
                    name="currencyCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: theme.textPrimary }}>Currency Code</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-11" style={{ borderColor: theme.border }}>
                              <SelectValue placeholder="Select Currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currency_list?.map(currency => (
                              <SelectItem
                                key={currency.currencyCode}
                                value={currency.currencyCode.toString()}
                              >
                                {currency.currencyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex items-center justify-end gap-3 pt-4 border-t"
                style={{ borderColor: theme.border }}
              >
                <Button
                  type="submit"
                  disabled={disabled}
                  onClick={() => setCreateMore(false)}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <CircleDot className="w-4 h-4 mr-2" />
                  {disabled ? 'Creating...' : strings.Create}
                </Button>
                <Button
                  type="submit"
                  disabled={disabled}
                  onClick={() => setCreateMore(true)}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {disabled ? 'Creating...' : strings.CreateandMore}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/master/employee')}
                  className="h-10 px-4"
                  style={{ borderColor: theme.border, color: theme.textSecondary }}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  {strings.Cancel}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEmployee);
