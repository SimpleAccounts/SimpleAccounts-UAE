import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LocalizedStrings from 'react-localization';
import { data } from '../../../../Language/index';
import DatePicker from 'react-datepicker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import { UserCircle, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    contact_list: state.request_for_quotation.contact_list,
    payroll_employee_list: state.payrollEmployee.payroll_employee_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const regEx = /^[0-9]+$/;
const regExTelephone = /^[0-9-]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

const createValidationSchema = (isTANMandetory, isTAANMandetory) => {
  return z.object({
    taxablePersonNameInEnglish: z
      .string()
      .min(1, 'Taxable person name in english is required')
      .refine(val => !val || regExAlpha.test(val), {
        message: "A taxable person's name must contain only alphabets",
      }),
    taxablePersonNameInArabic: z
      .string()
      .optional()
      .refine(val => !val || regExAlpha.test(val), {
        message: "A taxable person's name must contain only alphabets",
      }),
    vatRegistrationNumber: z.string().min(1, 'Tax registration number is required'),
    taxAgencyName: z
      .string()
      .optional()
      .refine(val => !val || regExAlpha.test(val), {
        message: 'Tax agency name must contain only alphabets',
      }),
    taxAgencyNumber: isTANMandetory ? z.string().min(1, 'TAN is required') : z.string().optional(),
    taxAgentName: z
      .string()
      .min(1, 'Tax Agent Name is required')
      .refine(val => !val || regExAlpha.test(val), {
        message: 'Tax agent name must contain only alphabets',
      }),
    taxAgentApprovalNumber: z
      .string()
      .min(1, 'TAAN is required')
      .refine(val => !val || regExTelephone.test(val), {
        message: 'Tax agent approval number must contain only numbers',
      }),
    startDate: z.date({ required_error: 'Start date is required' }),
    endDate: z.date({ required_error: 'End date is required' }),
  });
};

let strings = new LocalizedStrings(data);

const GenerateFTAExcisereport = ({ openModal, closeModal, commonActions }) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [disabled, setDisabled] = useState(false);
  const [isTANMandetory, setIsTANMandetory] = useState(false);
  const [isTAANMandetory, setIsTAANMandetory] = useState(false);

  strings.setLanguage(language);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(createValidationSchema(isTANMandetory, isTAANMandetory)),
    defaultValues: {
      taxablePersonNameInEnglish: '',
      taxablePersonNameInArabic: '',
      vatRegistrationNumber: '',
      taxAgencyName: '',
      taxAgencyNumber: '',
      taxAgentName: '',
      taxAgentApprovalNumber: '',
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const onSubmit = data => {
    setDisabled(true);
    // Handle form submission
    console.log('Form data:', data);
    setDisabled(false);
  };

  const handleClose = () => {
    setIsTANMandetory(false);
    setIsTAANMandetory(false);
    reset();
    closeModal(false);
  };

  return (
    <Modal isOpen={openModal} className="modal-success contact-modal">
      <ModalHeader>
        <Row>
          <Col lg={12}>
            <div className="h4 mb-0 d-flex align-items-center">
              <UserCircle className="h-4 w-4" />
              <span className="ml-2">Create FTA Excise Tax Audit File</span>
            </div>
          </Col>
        </Row>
      </ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
        <ModalBody>
          <Row className="mb-4">
            <Col>
              <h4>
                Once report is filed, you won't be able to edit any transactions for this tax
                period.
              </h4>
            </Col>
          </Row>
          <Row>
            <Col lg={4}>
              <FormGroup className="mb-3">
                <span className="text-danger">* </span>
                <Label htmlFor="taxablePersonNameInEnglish">Taxable Person Name (English)</Label>
                <Controller
                  name="taxablePersonNameInEnglish"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      type="text"
                      id="taxablePersonNameInEnglish"
                      maxLength="100"
                      placeholder="Enter Taxable Person Name (English)"
                      value={value || ''}
                      onChange={e => {
                        if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                          onChange(e.target.value);
                        }
                      }}
                    />
                  )}
                />
                {errors.taxablePersonNameInEnglish && (
                  <div className="text-danger">{errors.taxablePersonNameInEnglish.message}</div>
                )}
              </FormGroup>
            </Col>
            <Col lg={4}>
              <FormGroup className="mb-3">
                <Label htmlFor="taxablePersonNameInArabic">Taxable Person Name (Arabic)</Label>
                <Controller
                  name="taxablePersonNameInArabic"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      type="text"
                      id="taxablePersonNameInArabic"
                      maxLength="100"
                      placeholder="Enter Taxable Person Name (Arabic)"
                      value={value || ''}
                      onChange={e => onChange(e.target.value)}
                    />
                  )}
                />
                {errors.taxablePersonNameInArabic && (
                  <div className="text-danger">{errors.taxablePersonNameInArabic.message}</div>
                )}
              </FormGroup>
            </Col>
            <Col lg="4">
              <FormGroup>
                <Label htmlFor="vatRegistrationNumber">
                  <span className="text-danger">* </span>
                  {strings.TaxRegistrationNumber}
                </Label>
                <Controller
                  name="vatRegistrationNumber"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      disabled
                      type="text"
                      maxLength="15"
                      id="vatRegistrationNumber"
                      placeholder={strings.Enter + strings.TaxRegistrationNumber}
                      value={value || ''}
                      onChange={e => {
                        if (e.target.value === '' || regEx.test(e.target.value)) {
                          onChange(e.target.value);
                        }
                      }}
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
                {isTANMandetory && <span className="text-danger"> </span>}
                <Label htmlFor="taxAgencyName">Tax Agency Name </Label>
                <Controller
                  name="taxAgencyName"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      type="text"
                      id="taxAgencyName"
                      maxLength="100"
                      placeholder="Enter Tax Agency Name"
                      value={value || ''}
                      onChange={e => {
                        onChange(e.target.value);
                        if (e.target.value !== '') {
                          setIsTANMandetory(true);
                        } else {
                          setIsTANMandetory(false);
                        }
                      }}
                    />
                  )}
                />
                {errors.taxAgencyName && (
                  <div className="text-danger">{errors.taxAgencyName.message}</div>
                )}
              </FormGroup>
            </Col>

            <Col lg={4}>
              <FormGroup className="mb-3">
                {isTANMandetory && <span className="text-danger">* </span>}
                <Label htmlFor="taxAgencyNumber">Tax Agency Number (TAN)</Label>
                <Controller
                  name="taxAgencyNumber"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      type="text"
                      id="taxAgencyNumber"
                      maxLength="10"
                      autoComplete="off"
                      placeholder="Enter Tax Agency Number (TAN)"
                      value={value || ''}
                      onChange={e => {
                        if (e.target.value === '' || regExBoth.test(e.target.value)) {
                          onChange(e.target.value);
                        }
                      }}
                    />
                  )}
                />
                {errors.taxAgencyNumber && (
                  <div className="text-danger">{errors.taxAgencyNumber.message}</div>
                )}
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              <FormGroup className="mb-3">
                <span className="text-danger">* </span>
                <Label htmlFor="taxAgentName">Tax Agent Name</Label>
                <Controller
                  name="taxAgentName"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      type="text"
                      id="taxAgentName"
                      maxLength="100"
                      placeholder="Enter Agent Name"
                      value={value || ''}
                      onChange={e => {
                        onChange(e.target.value);
                        if (e.target.value !== '') {
                          setIsTAANMandetory(true);
                        } else {
                          setIsTAANMandetory(false);
                        }
                      }}
                    />
                  )}
                />
                {errors.taxAgentName && (
                  <div className="text-danger">{errors.taxAgentName.message}</div>
                )}
              </FormGroup>
            </Col>
            <Col lg={4}>
              <FormGroup className="mb-3">
                {(isTANMandetory || isTAANMandetory) && <span className="text-danger">* </span>}
                <Label htmlFor="taxAgentApprovalNumber">Tax Agent Approval Number (TAAN) </Label>
                <Controller
                  name="taxAgentApprovalNumber"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      type="text"
                      id="taxAgentApprovalNumber"
                      maxLength="8"
                      autoComplete="off"
                      placeholder="Enter Tax Agent Approval Number (TAAN)"
                      value={value || ''}
                      onChange={e => {
                        if (e.target.value === '' || regExTelephone.test(e.target.value)) {
                          onChange(e.target.value);
                        }
                      }}
                    />
                  )}
                />
                {errors.taxAgentApprovalNumber && (
                  <div className="text-danger">{errors.taxAgentApprovalNumber.message}</div>
                )}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col lg={4}>
              <FormGroup className="mb-3">
                <span className="text-danger">* </span>
                <Label htmlFor="startDate">Start Date</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      id="startDate"
                      placeholderText="Select Start Date"
                      showMonthDropdown
                      showYearDropdown
                      dateFormat="dd-MM-yyyy"
                      dropdownMode="select"
                      maxDate={new Date()}
                      selected={value}
                      onChange={onChange}
                      className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                    />
                  )}
                />
                {errors.startDate && <div className="text-danger">{errors.startDate.message}</div>}
              </FormGroup>
            </Col>

            <Col lg={4}>
              <FormGroup className="mb-3">
                <span className="text-danger">* </span>
                <Label htmlFor="endDate">End Date</Label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      id="endDate"
                      placeholderText="Select End Date"
                      showMonthDropdown
                      showYearDropdown
                      dateFormat="dd-MM-yyyy"
                      dropdownMode="select"
                      maxDate={new Date()}
                      selected={value}
                      onChange={onChange}
                      className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                    />
                  )}
                />
                {errors.endDate && <div className="text-danger">{errors.endDate.message}</div>}
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            type="submit"
            className="btn-square"
            disabled={disabled}
            onClick={() => {
              if (errors && Object.keys(errors).length !== 0) {
                commonActions.fillManDatoryDetails();
              }
            }}
          >
            <CircleDot className="h-4 w-4" /> {disabled ? 'Saving...' : strings.Save}
          </Button>
          &nbsp;
          <Button color="secondary" className="btn-square" onClick={handleClose}>
            <Ban className="h-4 w-4" /> {strings.Cancel}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GenerateFTAExcisereport);
