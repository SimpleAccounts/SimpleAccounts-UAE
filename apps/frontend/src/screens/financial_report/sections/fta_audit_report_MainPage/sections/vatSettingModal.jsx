import React, { useState, useEffect } from 'react';
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
  ModalHeader,
} from 'reactstrap';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { CommonActions } from 'services/global';
import { toast } from 'sonner';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import '../style.scss';
import * as FTAAuditReportActions from '../actions';

let strings = new LocalizedStrings(data);

// Regex patterns
const regExAlpha = /^[a-zA-Z ]+$/;
const regExBoth = /^[a-zA-Z0-9]+$/;
const regEx = /^[0-9]+$/;

// Dynamic validation schema
const createValidationSchema = isTANMandatory => {
  return z.object({
    taxablePersonNameInEnglish: z
      .string()
      .optional()
      .refine(val => !val || regExAlpha.test(val), {
        message: "A taxable person's name must contain only alphabets",
      }),
    taxablePersonNameInArabic: z
      .string()
      .optional()
      .refine(val => !val || true, {
        // Arabic has different character set
        message: "A taxable person's name must contain only alphabets",
      }),
    vatRegistrationNumber: z.string().optional(),
    taxAgencyName: z
      .string()
      .optional()
      .refine(val => !val || regExAlpha.test(val), {
        message: 'Tax agency name must contain only alphabets',
      }),
    taxAgencyNumber: isTANMandatory
      ? z
          .string()
          .min(1, 'TAN is required when Tax Agency Name is provided')
          .refine(val => regExBoth.test(val), {
            message: 'TAN must contain only alphanumeric',
          })
          .refine(val => val.length === 10, {
            message: 'TAN must contain 10 digits alphanumeric',
          })
      : z
          .string()
          .optional()
          .refine(val => !val || regExBoth.test(val), {
            message: 'TAN must contain only alphanumeric',
          })
          .refine(val => !val || val.length === 10, {
            message: 'TAN must contain 10 digits alphanumeric',
          }),
    taxAgentName: z
      .string()
      .optional()
      .refine(val => !val || regExAlpha.test(val), {
        message: 'Tax agent name must contain only alphabets',
      }),
    taxAgentApprovalNumber: z
      .string()
      .optional()
      .refine(val => !val || regEx.test(val), {
        message: 'TAAN must contain 8 digits number',
      })
      .refine(val => !val || val.length === 8, {
        message: 'TAAN must contain 8 digits number',
      }),
  });
};

const VatSettingModal = ({ openModal, closeModal }) => {
  const dispatch = useDispatch();
  const ftaAuditReportActions = bindActionCreators(FTAAuditReportActions, dispatch);
  const commonActions = bindActionCreators(CommonActions, dispatch);

  const [language] = useState(window.localStorage.getItem('language'));
  const [disabled, setDisabled] = useState(false);
  const [isTANMandatory, setIsTANMandatory] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(createValidationSchema(isTANMandatory)),
    defaultValues: {
      taxablePersonNameInEnglish: '',
      vatRegistrationNumber: '',
      taxAgentApprovalNumber: '',
      taxAgencyNumber: '',
      taxAgencyName: '',
      taxAgentName: '',
      taxablePersonNameInArabic: '',
    },
  });

  // Watch taxAgencyName to update validation
  const taxAgencyName = watch('taxAgencyName');

  useEffect(() => {
    const newIsTANMandatory = taxAgencyName && taxAgencyName.length > 0;
    if (newIsTANMandatory !== isTANMandatory) {
      setIsTANMandatory(newIsTANMandatory);
    }
  }, [taxAgencyName, isTANMandatory]);

  // Re-validate when schema changes
  useEffect(() => {
    if (isTANMandatory) {
      trigger('taxAgencyNumber');
    }
  }, [isTANMandatory, trigger]);

  useEffect(() => {
    ftaAuditReportActions.getCompanyDetails().then(res => {
      if (res.status === 200) {
        reset({
          vatRegistrationNumber: res.data.vatRegistrationNumber || '',
          taxablePersonNameInEnglish: '',
          taxablePersonNameInArabic: '',
          taxAgencyName: '',
          taxAgencyNumber: '',
          taxAgentName: '',
          taxAgentApprovalNumber: '',
        });
      }
    });
  }, []);

  const onSubmit = data => {
    setDisabled(true);
    let formData = new FormData();
    for (var key in data) {
      formData.append(key, data[key]);
    }
    ftaAuditReportActions
      .VATSetting(formData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert(
            'success',
            res.data.message ? res.data.message : 'VAT Report Filed Successfully'
          );
          reset();
          setIsTANMandatory(false);
          closeModal(true);
        }
      })
      .catch(err => {
        setDisabled(false);
        toast.error(`${err.data?.message || 'An error occurred'}`, {
          position: 'top-right',
        });
      });
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
    if (Object.keys(errors).length !== 0) {
      commonActions.fillManDatoryDetails();
    }
  };

  strings.setLanguage(language);

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openModal} className="modal-success contact-modal">
        <ModalHeader>
          <Row>
            <Col lg={12}>
              <div className="h4 mb-0 d-flex align-items-center">
                <i className="nav-icon fa" />
                <span className="ml-2">Company Details</span>
              </div>
            </Col>
          </Row>
        </ModalHeader>

        <Form name="simpleForm" onSubmit={handleFormSubmit} className="create-contact-screen">
          <ModalBody>
            <Row>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="taxablePersonNameInEnglish">Taxable Person Name (English)</Label>
                  <Controller
                    name="taxablePersonNameInEnglish"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="taxablePersonNameInEnglish"
                        maxLength="100"
                        placeholder="Enter Taxable Person Name (English)"
                        {...field}
                        onChange={e => {
                          const value = e.target.value;
                          if (value === '' || regExAlpha.test(value)) {
                            field.onChange(value);
                          }
                        }}
                        className={errors.taxablePersonNameInEnglish ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.taxablePersonNameInEnglish && (
                    <div className="invalid-feedback">
                      {errors.taxablePersonNameInEnglish.message}
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="taxablePersonNameInArabic">Taxable Person Name (Arabic)</Label>
                  <Controller
                    name="taxablePersonNameInArabic"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="taxablePersonNameInArabic"
                        maxLength="100"
                        placeholder="Enter Taxable Person Name (Arabic)"
                        {...field}
                        className={errors.taxablePersonNameInArabic ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.taxablePersonNameInArabic && (
                    <div className="invalid-feedback">
                      {errors.taxablePersonNameInArabic.message}
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col lg="4">
                <FormGroup>
                  <Label htmlFor="vatRegistrationNumber">{strings.TaxRegistrationNumber}</Label>
                  <Controller
                    name="vatRegistrationNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        disabled
                        type="text"
                        maxLength="15"
                        id="vatRegistrationNumber"
                        placeholder={strings.Enter + strings.TaxRegistrationNumber}
                        {...field}
                        className={errors.vatRegistrationNumber ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.vatRegistrationNumber && (
                    <div className="invalid-feedback">{errors.vatRegistrationNumber.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="taxAgencyName">Tax Agency Name</Label>
                  <Controller
                    name="taxAgencyName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="taxAgencyName"
                        maxLength="100"
                        placeholder="Enter Tax Agency Name"
                        {...field}
                        className={errors.taxAgencyName ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.taxAgencyName && (
                    <div className="invalid-feedback">{errors.taxAgencyName.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  {isTANMandatory && <span className="text-danger">*</span>}
                  <Label htmlFor="taxAgencyNumber">Tax Agency Number (TAN)</Label>
                  <Controller
                    name="taxAgencyNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="taxAgencyNumber"
                        maxLength="10"
                        autoComplete="off"
                        placeholder="Enter Tax Agency Number (TAN)"
                        {...field}
                        onChange={e => {
                          const value = e.target.value;
                          if (value === '' || regExBoth.test(value)) {
                            field.onChange(value);
                          }
                        }}
                        className={errors.taxAgencyNumber ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.taxAgencyNumber && (
                    <div className="invalid-feedback">{errors.taxAgencyNumber.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="taxAgentName">Tax Agent Name</Label>
                  <Controller
                    name="taxAgentName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="taxAgentName"
                        maxLength="100"
                        placeholder="Enter Agent Name"
                        {...field}
                        className={errors.taxAgentName ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.taxAgentName && (
                    <div className="invalid-feedback">{errors.taxAgentName.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="taxAgentApprovalNumber">Tax Agent Approval Number (TAAN)</Label>
                  <Controller
                    name="taxAgentApprovalNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        id="taxAgentApprovalNumber"
                        maxLength="8"
                        autoComplete="off"
                        placeholder="Enter Tax Agent Approval Number (TAAN)"
                        {...field}
                        onChange={e => {
                          const value = e.target.value;
                          if (value === '' || regEx.test(value)) {
                            field.onChange(value);
                          }
                        }}
                        className={errors.taxAgentApprovalNumber ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.taxAgentApprovalNumber && (
                    <div className="invalid-feedback">{errors.taxAgentApprovalNumber.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" className="btn-square" disabled={disabled}>
              <i className="fa fa-dot-circle-o"></i> {disabled ? 'Saving...' : strings.Save}
            </Button>
            &nbsp;
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => {
                setIsTANMandatory(false);
                closeModal(false);
              }}
            >
              <i className="fa fa-ban"></i> {strings.Cancel}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default VatSettingModal;
