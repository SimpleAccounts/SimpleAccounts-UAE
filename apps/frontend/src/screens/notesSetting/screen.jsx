import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Save, X } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Loader, LeavePage } from 'components';
import { AuthActions, CommonActions } from 'services/global';
import * as NotesSettingsAction from './actions';
import config from 'constants/config';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

// Zod validation schema
const notesSchema = z.object({
  defaultNotes: z.string().max(255, 'Maximum 255 characters allowed').optional(),
  defaultTermsAndConditions: z.string().max(255, 'Maximum 255 characters allowed').optional(),
  defaultFootNotes: z.string().max(255, 'Maximum 255 characters allowed').optional(),
});

/**
 * Modern Notes Settings Screen
 * Uses functional components, shadcn/ui, and React Hook Form + Zod
 */
function NotesSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Actions
  const notesSettingsAction = useMemo(
    () => bindActionCreators(NotesSettingsAction, dispatch),
    [dispatch]
  );
  const commonActions = useMemo(() => bindActionCreators(CommonActions, dispatch), [dispatch]);

  // Local state
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      defaultNotes: '',
      defaultTermsAndConditions: '',
      defaultFootNotes: '',
    },
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Load initial data
  useEffect(() => {
    notesSettingsAction
      .getNoteSettingsInfo()
      .then(res => {
        if (res.status === 200) {
          setValue('defaultNotes', res.data.defaultNotes || '');
          setValue('defaultTermsAndConditions', res.data.defaultTermsAndConditions || '');
          setValue('defaultFootNotes', res.data.defaultFootNotes || '');
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert('error', err?.data?.message || 'Failed to load settings');
      });
  }, [notesSettingsAction, commonActions, setValue]);

  // Form submit
  const onSubmit = data => {
    setLoading(true);
    setDisableLeavePage(true);

    const formData = new FormData();
    formData.append('defaultNote', data.defaultNotes || '');
    formData.append('defaultFootNote', data.defaultFootNotes || '');
    formData.append('defaultTermsAndConditions', data.defaultTermsAndConditions || '');

    notesSettingsAction
      .saveNoteSettingsInfo(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Default Notes Saved Successfully');
          navigate(config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice');
        }
      })
      .catch(err => {
        setLoading(false);
        setDisableLeavePage(false);
        commonActions.tostifyAlert('error', 'Save Unsuccessful');
      });
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div className="create-contact-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">{strings.Notes_Settings}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Default Delivery Notes */}
              <div className="space-y-2">
                <Label htmlFor="defaultNotes">{strings.DefaultDeliveryNotes}</Label>
                <Textarea
                  id="defaultNotes"
                  placeholder={strings.DeliveryNotes}
                  className="min-h-[100px] resize-y"
                  maxLength={255}
                  {...register('defaultNotes')}
                />
                {errors.defaultNotes && (
                  <p className="text-sm text-destructive">{errors.defaultNotes.message}</p>
                )}
              </div>

              {/* Default Terms and Conditions */}
              <div className="space-y-2">
                <Label htmlFor="defaultTermsAndConditions">
                  {'Default ' + strings.TermsAndConditions}
                </Label>
                <Textarea
                  id="defaultTermsAndConditions"
                  placeholder={strings.TermsAndConditions}
                  className="min-h-[100px] resize-y"
                  maxLength={255}
                  {...register('defaultTermsAndConditions')}
                />
                {errors.defaultTermsAndConditions && (
                  <p className="text-sm text-destructive">
                    {errors.defaultTermsAndConditions.message}
                  </p>
                )}
              </div>

              {/* Default Footnotes */}
              <div className="space-y-2">
                <Label htmlFor="defaultFootNotes">{strings.DefaultFootnotes}</Label>
                <Textarea
                  id="defaultFootNotes"
                  placeholder={strings.PaymentDetails}
                  className="min-h-[100px] resize-y"
                  maxLength={255}
                  {...register('defaultFootNotes')}
                />
                {errors.defaultFootNotes && (
                  <p className="text-sm text-destructive">{errors.defaultFootNotes.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-6 border-t">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : strings.Save}
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
      {!disableLeavePage && isDirty && <LeavePage />}
    </div>
  );
}

export default NotesSettings;
