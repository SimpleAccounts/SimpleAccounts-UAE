import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  UncontrolledTooltip,
  ModalHeader,
} from 'components/migration';

import { CommonActions } from 'services/global';
import * as PayrollRun from '../actions';

import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';

import '../style.scss';
import { Ban, CircleDot, HelpCircle, UserCircle } from 'lucide-react';

const strings = new LocalizedStrings(data);

// Validation schema
const companyDetailsSchema = z.object({
  companyBankCode: z
    .string()
    .min(1, 'Company bank code is required')
    .length(9, 'Company bank code should be 9 digits numeric')
    .regex(/^[0-9]+$/, 'Company bank code should be numeric'),
  companyNumber: z
    .string()
    .min(1, 'Company number is required')
    .length(13, 'Company number should be 13 digits numeric')
    .regex(/^[0-9]+$/, 'Company number should be numeric'),
});

function CreateCompanyDetails({ openModal, closeModal }) {
  const dispatch = useDispatch();

  // Actions
  const commonActions = bindActionCreators(CommonActions, dispatch);
  const payrollRun = bindActionCreators(PayrollRun, dispatch);

  // State
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(false);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: {
      companyBankCode: '',
      companyNumber: '',
    },
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    // Load company details on mount
    payrollRun.getCompanyDetails().then(res => {
      if (res.status === 200) {
        setValue('companyNumber', res.data.companyNumber || '');
        setValue('companyBankCode', res.data.companyBankCode || '');
      }
    });
  }, [payrollRun, setValue]);

  const onSubmit = data => {
    const formdata = new FormData();
    formdata.append('companyBankCode', data.companyBankCode);
    formdata.append('companyNumber', data.companyNumber);

    payrollRun
      .updateCompany(formdata)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Company Details Saved Successfully');
          closeModal(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openModal} className="modal-success contact-modal">
        <ModalHeader>
          <Row>
            <Col lg={12}>
              <div className="h4 mb-0 d-flex align-items-center">
                <UserCircle className="h-4 w-4" />
                <span className="ml-2">{strings.company_details}</span>
              </div>
            </Col>
          </Row>
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
          <ModalBody>
            <Row>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="companyNumber">
                    <span className="text-danger">* </span>
                    {strings.company_num}
                    <HelpCircle id="cnoTooltip" className="h-4 w-4 inline" />
                    <UncontrolledTooltip placement="right" target="cnoTooltip">
                      Company Number is 13 digit Numeric
                    </UncontrolledTooltip>
                  </Label>
                  <Controller
                    name="companyNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="companyNumber"
                        maxLength="13"
                        minLength="13"
                        placeholder="Enter Company Number"
                        className={errors.companyNumber ? 'is-invalid' : ''}
                        onChange={e => {
                          const value = e.target.value;
                          if (value === '' || /^[0-9]+$/.test(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    )}
                  />
                  {errors.companyNumber && (
                    <div className="text-danger">{errors.companyNumber.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="companyBankCode">
                    <span className="text-danger">* </span>
                    {strings.com_code}
                    <HelpCircle id="cbcodeTooltip" className="h-4 w-4 inline" />
                    <UncontrolledTooltip placement="right" target="cbcodeTooltip">
                      Company Bank Code is 9 digit Numeric
                    </UncontrolledTooltip>
                  </Label>
                  <Controller
                    name="companyBankCode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="companyBankCode"
                        maxLength="9"
                        minLength="9"
                        placeholder="Enter Company Bank Code"
                        className={errors.companyBankCode ? 'is-invalid' : ''}
                        onChange={e => {
                          const value = e.target.value;
                          if (value === '' || /^[0-9]+$/.test(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    )}
                  />
                  {errors.companyBankCode && (
                    <div className="text-danger">{errors.companyBankCode.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              type="submit"
              className="btn-square"
              disabled={isSubmitting}
              onClick={e => {
                // Trigger form validation
                handleSubmit(onSubmit)(e);
                if (Object.keys(errors).length !== 0) {
                  commonActions.fillManDatoryDetails();
                }
              }}
            >
              <CircleDot className="h-4 w-4" /> {isSubmitting ? 'Saving...' : strings.Save}
            </Button>
            &nbsp;
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => {
                closeModal(false);
              }}
            >
              <Ban className="h-4 w-4" /> {strings.Cancel}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}

export default CreateCompanyDetails;
