import { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Banknote, HelpCircle, CircleDot, RefreshCw, Ban, ChevronRight, Home } from 'lucide-react';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import { LeavePage, Loader } from 'components';
import { AuthActions, CommonActions } from 'services/global';
import * as CreateCurrencyConvertActions from './actions';
import * as CurrencyConvertActions from '../../actions';
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
const createCurrencyConvertSchema = z.object({
  currencyCode: z.string().min(1, 'Exchange currency is required'),
  currencyIsoCode: z.string().optional(),
  exchangeRate: z
    .string()
    .min(1, 'Exchange rate is required')
    .refine(val => parseFloat(val) > 0, {
      message: 'Exchange rate should be greater than 0',
    }),
  isActive: z.boolean().default(true),
});

const mapStateToProps = state => ({
  currency_list: state.common.currency_list,
});

const mapDispatchToProps = dispatch => ({
  currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
  createCurrencyConvertActions: bindActionCreators(CreateCurrencyConvertActions, dispatch),
  commonActions: bindActionCreators(CommonActions, dispatch),
  authActions: bindActionCreators(AuthActions, dispatch),
});

const CreateCurrencyConvert = ({
  currencyConvertActions,
  createCurrencyConvertActions,
  commonActions,
  authActions,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [createDisabled, setCreateDisabled] = useState(false);
  const [basecurrency, setBasecurrency] = useState({});
  const [createMore, setCreateMore] = useState(false);
  const [currency_list, setCurrencyList] = useState([]);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [exist, setExist] = useState(false);

  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,6}$/;

  const form = useForm({
    resolver: zodResolver(createCurrencyConvertSchema),
    defaultValues: {
      currencyCode: '',
      currencyIsoCode: '',
      exchangeRate: '',
      isActive: true,
    },
    mode: 'onChange',
  });

  const { setError, clearErrors, watch, reset } = form;
  const selectedCurrencyCode = watch('currencyCode');
  const currencyIsoCode = watch('currencyIsoCode');

  useEffect(() => {
    authActions
      .getCurrencylist()
      .then(res => {
        if (res.status === 200) {
          setCurrencyList(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [authActions, commonActions]);

  const getCompanyCurrency = useCallback(() => {
    currencyConvertActions
      .getCompanyCurrency()
      .then(res => {
        if (res.status === 200) {
          setBasecurrency(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err?.data?.message || 'Something Went Wrong');
        setLoading(false);
      });
  }, [currencyConvertActions, commonActions]);

  useEffect(() => {
    getCompanyCurrency();
  }, [getCompanyCurrency]);

  const validationCheck = useCallback(
    value => {
      const data = {
        moduleType: 10,
        currencyCode: value,
      };
      createCurrencyConvertActions.checkValidation(data).then(response => {
        if (response.data === 'Currency Conversions Already Exists') {
          setExist(true);
          setError('currencyCode', {
            type: 'manual',
            message: 'Currency already exists',
          });
          setCreateDisabled(false);
        } else {
          setExist(false);
          clearErrors('currencyCode');
        }
      });
    },
    [createCurrencyConvertActions, setError, clearErrors]
  );

  const onSubmit = data => {
    if (exist) {
      setError('currencyCode', {
        type: 'manual',
        message: 'Currency already exists',
      });
      return;
    }

    setCreateDisabled(true);

    const obj = {
      currencyCode: parseInt(data.currencyCode),
      exchangeRate: data.exchangeRate,
      isActive: data.isActive,
    };

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating Currency Conversion...');

    createCurrencyConvertActions
      .createCurrencyConvert(obj)
      .then(res => {
        if (res.status === 200) {
          setCreateDisabled(false);
          setLoading(false);
          commonActions.tostifyAlert(
            'success',
            res.data?.message || 'Currency Convert Created Successfully'
          );

          if (createMore) {
            reset();
            setCreateMore(false);
            setDisableLeavePage(false);
          } else {
            navigate('/admin/master/CurrencyConvert');
          }
        }
      })
      .catch(err => {
        setCreateDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err?.data?.message || 'Currency Convert Created Unsuccessfully'
        );
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
          Add Currency Conversion
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
            onClick={() => navigate('/admin/master/CurrencyConvert')}
          >
            Currency Rate
          </span>
          <ChevronRight className="w-4 h-4" />
          <span>Add Currency Conversion</span>
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
              <Banknote className="w-5 h-5" style={{ color: theme.primary }} />
            </div>
            <CardTitle className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              {strings.NewCurrencyConversion || 'New Currency Conversion'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
              {/* Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="flex items-center gap-1"
                      style={{ color: theme.textPrimary }}
                    >
                      <span className="text-red-500">*</span>
                      {strings.Status || 'Status'}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value ? 'active' : 'inactive'}
                        onValueChange={value => field.onChange(value === 'active')}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="active" id="active" />
                          <Label htmlFor="active" className="cursor-pointer">
                            {strings.Active || 'Active'}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="inactive" id="inactive" />
                          <Label htmlFor="inactive" className="cursor-pointer">
                            {strings.Inactive || 'Inactive'}
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency Conversion Row */}
              <div className="flex items-end gap-4 flex-wrap">
                {/* Value Display */}
                <div className="w-20">
                  <FormLabel style={{ color: theme.textPrimary }}>
                    {strings.Value || 'Value'}
                  </FormLabel>
                  <Input
                    disabled
                    value={`1 ${currencyIsoCode || ''}`}
                    className="h-11 mt-2"
                    style={{ borderColor: theme.border, background: '#f9fafb' }}
                  />
                </div>

                {/* Exchange Currency */}
                <FormField
                  control={form.control}
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[200px]">
                      <FormLabel
                        className="flex items-center gap-1"
                        style={{ color: theme.textPrimary }}
                      >
                        <span className="text-red-500">*</span>
                        {strings.ExchangeCurrency || 'Exchange Currency'}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle
                                className="w-4 h-4 cursor-help"
                                style={{ color: theme.textMuted }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Select the currency to convert from</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={value => {
                          field.onChange(value);
                          const selectedCurrency = currency_list.find(
                            c => c.currencyCode.toString() === value
                          );
                          if (selectedCurrency) {
                            form.setValue(
                              'currencyIsoCode',
                              selectedCurrency.currencyIsoCode || ''
                            );
                            validationCheck(parseInt(value));
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11" style={{ borderColor: theme.border }}>
                            <SelectValue
                              placeholder={`${strings.Select || 'Select'} ${strings.Currency || 'Currency'}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currency_list.map(currency => (
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

                {/* Equals Sign */}
                <div className="flex items-center h-11 mb-1">
                  <span className="text-xl font-bold" style={{ color: theme.textSecondary }}>
                    =
                  </span>
                </div>

                {/* Exchange Rate */}
                <FormField
                  control={form.control}
                  name="exchangeRate"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[150px]">
                      <FormLabel
                        className="flex items-center gap-1"
                        style={{ color: theme.textPrimary }}
                      >
                        <span className="text-red-500">*</span>
                        {strings.Exchangerate || 'Exchange Rate'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`${strings.Enter || 'Enter'} ${strings.Exchangerate || 'Exchange Rate'}`}
                          maxLength={20}
                          value={field.value}
                          onChange={e => {
                            if (e.target.value === '' || regDecimal.test(e.target.value)) {
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

                {/* Base Currency */}
                <div className="flex-1 min-w-[150px]">
                  <FormLabel style={{ color: theme.textPrimary }}>
                    {strings.BaseCurrency || 'Base Currency'}
                  </FormLabel>
                  <Input
                    disabled
                    value={basecurrency.currencyName || ''}
                    className="h-11 mt-2"
                    style={{ borderColor: theme.border, background: '#f9fafb' }}
                  />
                </div>
              </div>

              <p className="text-sm" style={{ color: theme.textMuted }}>
                Note: If a currency is associated with any bank, contact or document, it cannot be
                deleted.
              </p>

              {/* Action Buttons */}
              <div
                className="flex items-center justify-end gap-3 pt-4 border-t"
                style={{ borderColor: theme.border }}
              >
                <Button
                  type="submit"
                  disabled={createDisabled}
                  onClick={() => setCreateMore(false)}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <CircleDot className="w-4 h-4 mr-2" />
                  {createDisabled ? 'Creating...' : strings.Create || 'Create'}
                </Button>
                <Button
                  type="submit"
                  disabled={createDisabled}
                  onClick={() => setCreateMore(true)}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {createDisabled ? 'Creating...' : strings.CreateandMore || 'Create and More'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/master/CurrencyConvert')}
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
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateCurrencyConvert);
