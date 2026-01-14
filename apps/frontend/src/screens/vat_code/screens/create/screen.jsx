import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Receipt, HelpCircle, CircleDot, RefreshCw, Ban, ChevronRight, Home } from 'lucide-react';
import { NumericFormat } from 'react-number-format';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Loader } from 'components';
import { CommonActions } from 'services/global';
import * as VatCreateActions from './actions';
import * as VatActions from '../../actions';

import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);
strings.setLanguage(localStorage.getItem('language') || 'en');

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

// Zod validation schema
const createVatCodeSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(30, 'Name is too long')
    .regex(/^[a-zA-Z0-9 ]+$/, 'Name must contain only letters, numbers, and spaces'),
  vat: z
    .string()
    .min(1, 'Percentage is required')
    .regex(/^(100(\.00?)?|[1-9]?\d(\.\d\d?)?)$/, 'Invalid percentage value'),
});

const mapStateToProps = state => ({
  vat_row: state.vat.vat_row,
});

const mapDispatchToProps = dispatch => ({
  commonActions: bindActionCreators(CommonActions, dispatch),
  vatActions: bindActionCreators(VatActions, dispatch),
  vatCreateActions: bindActionCreators(VatCreateActions, dispatch),
});

const CreateVatCode = ({ vatActions, vatCreateActions, commonActions }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [vatList, setVatList] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(createVatCodeSchema),
    defaultValues: {
      name: '',
      vat: '',
    },
    mode: 'onChange',
  });

  const { setError, watch } = form;
  const nameValue = watch('name');

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (nameValue && vatList.includes(nameValue)) {
      setError('name', {
        type: 'manual',
        message: 'VAT category already exists',
      });
    }
  }, [nameValue, vatList, setError]);

  const initializeData = () => {
    vatActions.getVatList().then(res => {
      if (res.status === 200) {
        const list = res.data.data.map(item => item.name);
        setVatList(list);
      }
    });
  };

  const onSubmit = data => {
    if (vatList.includes(data.name)) {
      setError('name', {
        type: 'manual',
        message: 'VAT category already exists',
      });
      return;
    }

    setDisabled(true);
    vatCreateActions
      .createVat(data)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert('success', 'New VAT category Created Successfully!');
          form.reset();
          if (createMore) {
            setCreateMore(false);
            initializeData();
          } else {
            navigate('/admin/master/vat-category');
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Creation failed');
      });
  };

  const vatCode = /[a-zA-Z0-9 ]+$/;

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ background: theme.bg, minHeight: '100%' }}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
          Add VAT Category
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
            onClick={() => navigate('/admin/master/vat-category')}
          >
            VAT Category
          </span>
          <ChevronRight className="w-4 h-4" />
          <span>Add VAT Category</span>
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
              style={{ background: '#eff6ff' }}
            >
              <Receipt className="w-5 h-5" style={{ color: theme.primary }} />
            </div>
            <CardTitle className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              New Tax Category
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
              {/* VAT Category Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="flex items-center gap-1"
                      style={{ color: theme.textPrimary }}
                    >
                      <span className="text-red-500">*</span>
                      {strings.VatCategoryName || 'VAT Category Name'}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle
                              className="w-4 h-4 cursor-help"
                              style={{ color: theme.textMuted }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Unique identifier VAT category name</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Tax Category Name"
                        maxLength={30}
                        value={field.value}
                        onChange={e => {
                          if (e.target.value === '' || vatCode.test(e.target.value)) {
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

              {/* VAT Percentage */}
              <FormField
                control={form.control}
                name="vat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="flex items-center gap-1"
                      style={{ color: theme.textPrimary }}
                    >
                      <span className="text-red-500">*</span>
                      {strings.Percentage || 'Percentage'}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle
                              className="w-4 h-4 cursor-help"
                              style={{ color: theme.textMuted }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>VAT percentage charged by your country</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        placeholder="Enter VAT Percentage"
                        value={field.value}
                        onValueChange={values => {
                          field.onChange(values.value);
                        }}
                        thousandSeparator
                        suffix="%"
                        maxLength={6}
                        className="h-11"
                        style={{ borderColor: theme.border }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div
                className="flex items-center justify-end gap-3 pt-4 border-t"
                style={{ borderColor: theme.border }}
              >
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setCreateMore(false);
                    form.handleSubmit(onSubmit)();
                  }}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <CircleDot className="w-4 h-4 mr-2" />
                  {disabled ? 'Creating...' : strings.Create || 'Create'}
                </Button>
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setCreateMore(true);
                    form.handleSubmit(onSubmit)();
                  }}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {disabled ? 'Creating...' : strings.CreateandMore || 'Create and More'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/master/vat-category')}
                  className="h-10 px-4"
                  style={{ borderColor: theme.border, color: theme.textSecondary }}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  {strings.Cancel || 'Cancel'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateVatCode);
