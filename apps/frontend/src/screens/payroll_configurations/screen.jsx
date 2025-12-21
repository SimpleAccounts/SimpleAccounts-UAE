import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleDot, Edit, Plus, Settings } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Loader } from 'components';
import { CommonActions } from 'services/global';
import * as DesignationActions from '../designation/actions';
import * as EmployeeActions from '../salaryRoles/actions';
import * as SalaryStructureAction from '../salaryStructure/actions';
import * as PayrollRun from '../payroll_run/actions';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';
import { DataTable } from '@/components/ui/data-table';

const strings = new LocalizedStrings(data);

// Zod validation schema for company details
const companyDetailsSchema = z.object({
  companyNumber: z
    .string()
    .min(13, 'Company number should be 13 digits numeric')
    .max(13, 'Company number should be 13 digits numeric')
    .regex(/^[0-9]+$/, 'Company number should be numeric'),
  companyBankCode: z
    .string()
    .min(9, 'Company bank code should be 9 digits numeric')
    .max(9, 'Company bank code should be 9 digits numeric')
    .regex(/^[0-9]+$/, 'Company bank code should be numeric'),
});

/**
 * Modern Payroll Configurations Screen
 * Uses functional components, shadcn/ui, and React Hook Form + Zod + TanStack Table
 */
function PayrollConfigurations() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const designation_list = useSelector(state => state.employeeDesignation.designation_list);
  const company_details = useSelector(state => state.common.company_details);
  const salaryStructure_list = useSelector(state => state.salaryStructure.salaryStructure_list);
  const salaryRole_list = useSelector(state => state.salaryRoles.salaryRole_list);

  // Actions
  const designationActions = useMemo(
    () => bindActionCreators(DesignationActions, dispatch),
    [dispatch]
  );
  const salaryStructureActions = useMemo(
    () => bindActionCreators(SalaryStructureAction, dispatch),
    [dispatch]
  );
  const employeeActions = useMemo(() => bindActionCreators(EmployeeActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);
  const payrollRun = useMemo(() => bindActionCreators(PayrollRun, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('3'); // Default to Employee Designation tab
  const [salaryList, setSalaryList] = useState({ data: [], count: 0 });

  // Pagination for designations
  const [designationPagination, setDesignationPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [designationSorting, setDesignationSorting] = useState([]);

  // Pagination for salary components
  const [salaryPagination, setSalaryPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [salarySorting, setSalarySorting] = useState([]);

  // Form for company details
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: {
      companyNumber: '',
      companyBankCode: '',
    },
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Initialize data
  useEffect(() => {
    if (location.state?.tabNo) {
      setActiveTab(location.state.tabNo);
    }
    getCompanyDataForPayroll();
  }, []);

  useEffect(() => {
    initializeDataForDesignations();
  }, [designationPagination, designationSorting]);

  useEffect(() => {
    initializeDataForSalaryComponents();
  }, [salaryPagination, salarySorting]);

  // Get company data for payroll
  const getCompanyDataForPayroll = () => {
    payrollRun.getCompanyDetails().then(res => {
      if (res.status === 200) {
        setValue('companyNumber', res.data.companyNumber || '');
        setValue('companyBankCode', res.data.companyBankCode || '');
      }
    });
  };

  // Initialize designations data
  const initializeDataForDesignations = () => {
    const paginationData = {
      pageNo: designationPagination.pageIndex,
      pageSize: designationPagination.pageSize,
    };
    const sortingData = {
      order: designationSorting.length > 0 ? (designationSorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: designationSorting.length > 0 ? designationSorting[0].id : '',
    };
    const postData = { ...paginationData, ...sortingData };

    designationActions
      .getEmployeeDesignationList(postData)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  const initializeDataForSalaryComponents = () => {
    const paginationData = {
      pageNo: salaryPagination.pageIndex,
      pageSize: salaryPagination.pageSize,
    };
    const sortingData = {
      order: salarySorting.length > 0 ? (salarySorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: salarySorting.length > 0 ? salarySorting[0].id : '',
    };
    const postData = { ...paginationData, ...sortingData };

    salaryStructureActions.getSalaryList(postData).then(res => {
      if (res.status === 200) {
        setSalaryList(res.data);
      }
    });
  };

  // Handle company details submit
  const onSubmit = data => {
    const formData = new FormData();
    formData.append('companyBankCode', data.companyBankCode);
    formData.append('companyNumber', data.companyNumber);

    payrollRun
      .updateCompany(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Company Details Saved Successfully');
          navigate('/admin/payroll/payroll-run');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
      });
  };

  // Columns for Designations
  const designationColumns = useMemo(
    () => [
      {
        accessorKey: 'designationId',
        header: strings.DESIGNATIONID,
        cell: ({ row }) => row.original.designationId || row.original.id,
      },
      {
        accessorKey: 'designationName',
        header: strings.DESIGNATIONNAME,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          if (
            row.original.id === 1 ||
            row.original.id === 2 ||
            row.original.id === 3 ||
            row.original.id === 4
          )
            return null;
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate('/admin/payroll/config/detailEmployeeDesignation', {
                    state: { id: row.original.id },
                  })
                }
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate]
  );

  // Columns for Salary Components
  const salaryColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: strings.ComponentId,
        cell: ({ row }) => row.original.componentCode || row.original.id,
      },
      {
        accessorKey: 'description',
        header: strings.ComponentName,
      },
      {
        accessorKey: 'componentType',
        header: strings.ComponentType,
        cell: ({ row }) =>
          row.original.description === 'Basic SALARY' ? 'Earning' : row.original.componentType,
      },
      {
        accessorKey: 'calculationType',
        header: strings.calculation_type,
        cell: ({ row }) => {
          const item = row.original;
          return item.calculationType
            ? parseInt(item.calculationType) === 2
              ? 'CTC Percent'
              : 'Flat Amount'
            : item.formula
              ? 'CTC Percent'
              : 'Flat Amount';
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          if (row.original.id === 1 || row.original.id === 3) return null;
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate('/admin/payroll/config/detailSalaryComponent', {
                    state: { id: row.original.id },
                  })
                }
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate]
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="financial-report-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">{strings.PayrollConfigurations}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="3">{strings.EmployeeDesignation}</TabsTrigger>
                {company_details?.generateSif && (
                  <TabsTrigger value="4">{strings.CompanyDetails}</TabsTrigger>
                )}
                <TabsTrigger value="5">{strings.SalaryComponent}</TabsTrigger>
              </TabsList>

              {/* Employee Designation Tab */}
              <TabsContent value="3">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      onClick={() => navigate('/admin/payroll/config/createEmployeeDesignation')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {strings.NewDesignation}
                    </Button>
                  </div>

                  <DataTable
                    columns={designationColumns}
                    data={designation_list?.data || []}
                    manualPagination={true}
                    pageCount={
                      designation_list?.count
                        ? Math.ceil(designation_list.count / designationPagination.pageSize)
                        : 0
                    }
                    pagination={designationPagination}
                    onPaginationChange={setDesignationPagination}
                    manualSorting={true}
                    sorting={designationSorting}
                    onSortingChange={setDesignationSorting}
                  />
                </div>
              </TabsContent>

              {/* Company Details Tab */}
              <TabsContent value="4">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-lg font-semibold">Company Details</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <span className="text-muted-foreground">?</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            These Company Details Will be Populated On Payroll - SIF (Salary
                            Information File).
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Company Number */}
                      <div className="space-y-2">
                        <Label htmlFor="companyNumber">
                          <span className="text-destructive">* </span>
                          {strings.company_num}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                  <span className="text-muted-foreground text-xs">?</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Company Number is 13 digit Numeric</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="companyNumber"
                          placeholder="Enter Company Number"
                          maxLength={13}
                          {...register('companyNumber')}
                        />
                        {errors.companyNumber && (
                          <p className="text-sm text-destructive">{errors.companyNumber.message}</p>
                        )}
                      </div>

                      {/* Company Bank Code */}
                      <div className="space-y-2">
                        <Label htmlFor="companyBankCode">
                          <span className="text-destructive">* </span>
                          {strings.com_code}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                  <span className="text-muted-foreground text-xs">?</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Company Bank Code is 9 digit Numeric</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="companyBankCode"
                          placeholder="Enter Company Bank Code"
                          maxLength={9}
                          {...register('companyBankCode')}
                        />
                        {errors.companyBankCode && (
                          <p className="text-sm text-destructive">
                            {errors.companyBankCode.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center pt-6">
                      <Button type="submit" disabled={isSubmitting}>
                        <CircleDot className="h-4 w-4" />
                        {isSubmitting ? 'Saving...' : strings.Save}
                      </Button>
                    </div>
                  </form>
                </div>
              </TabsContent>

              {/* Salary Component Tab */}
              <TabsContent value="5">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={() => navigate('/admin/payroll/config/createSalaryComponent')}>
                      <Plus className="mr-2 h-4 w-4" />
                      {strings.NewSalaryComponent}
                    </Button>
                  </div>

                  <DataTable
                    columns={salaryColumns}
                    data={salaryList?.data || []}
                    manualPagination={true}
                    pageCount={
                      salaryList?.count
                        ? Math.ceil(salaryList.count / salaryPagination.pageSize)
                        : 0
                    }
                    pagination={salaryPagination}
                    onPaginationChange={setSalaryPagination}
                    manualSorting={true}
                    sorting={salarySorting}
                    onSortingChange={setSalarySorting}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PayrollConfigurations;
