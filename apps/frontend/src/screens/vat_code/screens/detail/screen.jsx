import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Receipt, HelpCircle, CircleDot, Ban, Trash2, ChevronRight, Home } from 'lucide-react';
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

import { Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import * as VatDetailActions from './actions';
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
const updateVatCodeSchema = z.object({
  name: z
    .string()
    .min(1, 'VAT category name is required')
    .max(30, 'Name is too long')
    .regex(/^[a-zA-Z0-9 ]+$/, 'Name must contain only letters, numbers, and spaces'),
  vat: z
    .string()
    .min(1, 'VAT percentage is required')
    .regex(/^(100(\.00?)?|[1-9]?\d(\.\d\d?)?)$/, 'Invalid percentage value'),
});

const mapStateToProps = state => ({
  vat_row: state.vat.vat_row,
});

const mapDispatchToProps = dispatch => ({
  commonActions: bindActionCreators(CommonActions, dispatch),
  vatDetailActions: bindActionCreators(VatDetailActions, dispatch),
  vatActions: bindActionCreators(VatActions, dispatch),
});

const DetailVatCode = ({ vatDetailActions, vatActions, commonActions }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [currentVatId, setCurrentVatId] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateVatCodeSchema),
    defaultValues: {
      name: '',
      vat: '',
    },
    mode: 'onChange',
  });

  const { reset } = form;

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    if (location.state?.id) {
      vatDetailActions
        .getVatByID(location.state.id)
        .then(res => {
          if (res.status === 200) {
            setCurrentVatId(location.state.id);
            setLoading(false);
            reset(res.data);
          }
        })
        .catch(() => {
          navigate('/admin/master/vat-category');
        });
    } else {
      navigate('/admin/master/vat-category');
    }
  };

  const onSubmit = data => {
    setDisabled(true);
    vatDetailActions
      .updateVat(data)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert(
            'success',
            res.data?.message || 'VAT Category Updated Successfully'
          );
          navigate('/admin/master/vat-category');
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Update failed');
      });
  };

  const deleteVat = () => {
    vatActions.getVatCount(currentVatId).then(res => {
      if (res.data > 0) {
        commonActions.tostifyAlert('error', 'This Tax category is in use, cannot delete');
      } else {
        setDialog(
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={removeVat}
            cancelHandler={() => setDialog(null)}
            message="This Tax Category will be deleted permanently and cannot be recovered."
            message1={<b>Delete Tax Category?</b>}
          />
        );
      }
    });
  };

  const removeVat = () => {
    setDisabled1(true);
    vatDetailActions
      .deleteVat(currentVatId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data?.message || 'VAT Category Deleted Successfully'
          );
          navigate('/admin/master/vat-category');
        }
      })
      .catch(err => {
        setDisabled1(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Delete failed');
      });
  };

  const vatCode = /[a-zA-Z0-9 ]+$/;
  const regExPercentage = /^(100(\.00?)?|[1-9]?\d(\.\d\d?)?)$/;

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ background: theme.bg, minHeight: '100%' }}>
      {dialog}

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
              Edit VAT Category
            </h1>
            <div
              className="flex items-center gap-2 mt-1 text-sm"
              style={{ color: theme.textMuted }}
            >
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
              <span>Edit</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={deleteVat}
            disabled={disabled1}
            className="h-10 px-4"
            style={{ borderColor: theme.danger, color: theme.danger }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {disabled1 ? 'Deleting...' : strings.Delete || 'Delete'}
          </Button>
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
              Update Tax Category
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
                      Tax Category Name
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle
                              className="w-4 h-4 cursor-help"
                              style={{ color: theme.textMuted }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Unique identifier Tax category name</p>
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
                      Percentage %
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle
                              className="w-4 h-4 cursor-help"
                              style={{ color: theme.textMuted }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tax percentage charged by your country</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        placeholder="Enter Tax Percentage"
                        value={field.value}
                        onValueChange={values => {
                          if (values.value === '' || regExPercentage.test(values.value)) {
                            field.onChange(values.value);
                          }
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
                  type="submit"
                  disabled={disabled}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <CircleDot className="w-4 h-4 mr-2" />
                  {disabled ? 'Updating...' : strings.Update || 'Update'}
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailVatCode);
