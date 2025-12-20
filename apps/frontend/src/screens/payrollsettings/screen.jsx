import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Banknote, Save, X } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Loader, LeavePage } from 'components';
import { AuthActions, CommonActions } from 'services/global';
import * as PayrollActions from './actions';
import config from 'constants/config';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);

/**
 * Modern Payroll Settings Screen
 * Uses functional components, shadcn/ui, and React Hook Form
 */
function PayrollSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Actions
  const payrollActions = useMemo(() => bindActionCreators(PayrollActions, dispatch), [dispatch]);
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(false);
  const [sifEnabled, setSifEnabled] = useState(true);
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  const {
    formState: { isDirty },
  } = useForm();

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Load initial data
  useEffect(() => {
    payrollActions.getCompanyById().then(res => {
      if (res.status === 200) {
        setSifEnabled(res.data.generateSif);
      }
    });
  }, [payrollActions]);

  // Form submit
  const handleSubmit = () => {
    setLoading(true);
    setDisableLeavePage(true);

    payrollActions
      .getPayrollSettings(sifEnabled)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Payroll Settings Saved Successfully');
          commonActions.getCompanyDetails();
          navigate(config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice');
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', 'Save Unsuccessful');
      });
  };

  if (loading) {
    return <Loader loadingMsg="Loading..." />;
  }

  return (
    <div className="payroll-settings-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Banknote className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">{strings.PayrollSettings}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-6"
            >
              {/* SIF Payroll Setting */}
              <div className="space-y-4">
                <Label>{strings.SifPayroll}</Label>
                <RadioGroup
                  value={sifEnabled ? 'yes' : 'no'}
                  onValueChange={val => setSifEnabled(val === 'yes')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="sif-yes" />
                    <Label htmlFor="sif-yes" className="font-normal cursor-pointer">
                      {strings.Yes}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="sif-no" />
                    <Label htmlFor="sif-no" className="font-normal cursor-pointer">
                      {strings.No}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-6">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {strings.Save}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    navigate(
                      config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice'
                    )
                  }
                >
                  <X className="mr-2 h-4 w-4" />
                  {strings.Cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
}

export default PayrollSettings;
