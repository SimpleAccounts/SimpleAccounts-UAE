import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
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
} from 'components/migration';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import { toast } from 'sonner';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import '../style.scss';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions';
import * as VatreportActions from '../actions';
import { CircleDot, Ban, UserCircle } from 'lucide-react';

const mapStateToProps = state => {
  return {
    contact_list: state.request_for_quotation.contact_list,
    payroll_employee_list: state.payrollEmployee.payroll_employee_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
    vatreportActions: bindActionCreators(VatreportActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

const regEx = /^[0-9]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;
const regExAlpha = /^[a-zA-Z ]+$/;

// Create validation schema based on FTA flags
const createValidationSchema = (FTAExciseTaxAuditFile, FTAVatAuditFile, isTANMandetory) => {
  const baseSchema = {
    taxFiledOn: z.date({ required_error: 'Date of filling is required' }),
    taxablePersonNameInEnglish: z.string().optional(),
    taxablePersonNameInArabic: z.string().optional(),
    vatRegistrationNumber: z.string().optional(),
    taxAgencyName: z.string().optional(),
    taxAgencyNumber: z.string().optional(),
    taxAgentName: z.string().optional(),
    taxAgentApprovalNumber: z.string().optional(),
  };

  if (FTAExciseTaxAuditFile || FTAVatAuditFile) {
    return z.object({
      ...baseSchema,
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
      taxAgentName: z
        .string()
        .min(1, 'Tax agent name is required')
        .refine(val => !val || regExAlpha.test(val), {
          message: 'Tax agent name must contain only alphabets',
        }),
      taxAgencyName: z
        .string()
        .optional()
        .refine(val => !val || regExAlpha.test(val), {
          message: 'Tax agency name must contain only alphabets',
        }),
      taxAgentApprovalNumber: z
        .string()
        .min(1, 'TAAN is required')
        .refine(val => !val || regEx.test(val), {
          message: 'The TAAN must consist of an 8-digit number',
        }),
      taxAgencyNumber: isTANMandetory
        ? z.string().min(1, 'TAN is required')
        : z.string().optional(),
    });
  }

  return z.object(baseSchema);
};

const FileTaxReturnModalForm = ({
  onSubmit,
  closeModal,
  commonActions,
  initValue,
  taxReturns,
  dateLimit,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [disabled, setDisabled] = useState(false);
  const [isTANMandetory, setIsTANMandetory] = useState(false);
  const [isTAANMandetory, setIsTAANMandetory] = useState(false);
  const [FTAExciseTaxAuditFile, setFTAExciseTaxAuditFile] = useState(false);
  const [FTAVatAuditFile, setFTAVatAuditFile] = useState(false);

  strings.setLanguage(language);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(
      createValidationSchema(FTAExciseTaxAuditFile, FTAVatAuditFile, isTANMandetory)
    ),
    defaultValues: {
      ...initValue,
      taxFiledOn: new Date(),
    },
  });

  const taxAgencyName = watch('taxAgencyName');

  useEffect(() => {
    if (taxAgencyName && taxAgencyName !== '') {
      setIsTANMandetory(true);
    } else {
      setIsTANMandetory(false);
    }
  }, [taxAgencyName]);

  const handleFormSubmit = async data => {
    setDisabled(true);
    try {
      await onSubmit(data);
      setDisabled(false);
      setIsTANMandetory(false);
      setIsTAANMandetory(false);
    } catch (err) {
      setDisabled(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)}>
      <ModalBody>
        <Row className="mb-4">
          <Col>
            <h4>
              Once report is filed, you won't be able to edit any transactions for this tax period.
            </h4>
          </Col>
        </Row>
        <Row>
          <Col lg={4}>
            <FormGroup className="mb-3">
              <span className="text-danger">* </span>
              <Label htmlFor="taxFiledOn">Date Of Filling</Label>
              <Controller
                name="taxFiledOn"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    id="taxFiledOn"
                    placeholderText="Tax Filed On"
                    showMonthDropdown
                    showYearDropdown
                    dateFormat="dd-MM-yyyy"
                    dropdownMode="select"
                    minDate={dateLimit()}
                    selected={value}
                    onChange={onChange}
                    className={`form-control ${errors.taxFiledOn ? 'is-invalid' : ''}`}
                  />
                )}
              />
              {errors.taxFiledOn && (
                <div className="invalid-feedback" style={{ display: 'block' }}>
                  {errors.taxFiledOn.message}
                </div>
              )}
            </FormGroup>
          </Col>
        </Row>

        {(FTAExciseTaxAuditFile || FTAVatAuditFile) && (
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
                <Input
                  type="text"
                  id="taxablePersonNameInArabic"
                  maxLength="100"
                  placeholder="Enter Taxable Person Name (Arabic)"
                  {...register('taxablePersonNameInArabic')}
                  className={errors.taxablePersonNameInArabic ? 'is-invalid' : ''}
                />
                {errors.taxablePersonNameInArabic && (
                  <div className="invalid-feedback">{errors.taxablePersonNameInArabic.message}</div>
                )}
              </FormGroup>
            </Col>
            <Col lg="4">
              <FormGroup>
                <Label htmlFor="vatRegistrationNumber">
                  <span className="text-danger">* </span>
                  {strings.TaxRegistrationNumber}
                </Label>
                <Input
                  disabled
                  type="text"
                  maxLength="15"
                  id="vatRegistrationNumber"
                  placeholder={strings.Enter + strings.TaxRegistrationNumber}
                  {...register('vatRegistrationNumber')}
                  className={errors.vatRegistrationNumber ? 'is-invalid' : ''}
                />
                {errors.vatRegistrationNumber && (
                  <div className="invalid-feedback">{errors.vatRegistrationNumber.message}</div>
                )}
              </FormGroup>
            </Col>
            <Col lg={4}>
              <FormGroup className="mb-3">
                {isTANMandetory && <span className="text-danger"> </span>}
                <Label htmlFor="taxAgencyName">Tax Agency Name</Label>
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
                      }}
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
                      className={errors.taxAgencyNumber ? 'is-invalid' : ''}
                    />
                  )}
                />
                {errors.taxAgencyNumber && (
                  <div className="invalid-feedback">{errors.taxAgencyNumber.message}</div>
                )}
              </FormGroup>
            </Col>
            <Col lg={4}></Col>
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
                <span className="text-danger">* </span>
                <Label htmlFor="taxAgentApprovalNumber">Tax Agent Approval Number (TAAN)</Label>
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
                        if (e.target.value === '' || regEx.test(e.target.value)) {
                          onChange(e.target.value);
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
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          type="submit"
          className="btn-square"
          disabled={disabled}
          onClick={async () => {
            await trigger();
            if (Object.keys(errors).length !== 0) {
              commonActions.fillManDatoryDetails();
            }
          }}
        >
          <CircleDot className="h-4 w-4" /> {disabled ? 'Saving...' : 'File'}
        </Button>
        &nbsp;
        <Button
          color="secondary"
          className="btn-square"
          onClick={() => {
            setIsTANMandetory(false);
            setIsTAANMandetory(false);
            closeModal(false);
          }}
        >
          <Ban className="h-4 w-4" /> {strings.Cancel}
        </Button>
      </ModalFooter>
    </Form>
  );
};

const FileTaxReturnModal = props => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [initValue, setInitValue] = useState({
    taxablePersonNameInEnglish: '',
    taxFiledOn: new Date(),
    vatReportFiling: '',
    vatRegistrationNumber: '',
    taxAgentApprovalNumber: '',
    taxAgencyNumber: '',
    taxAgencyName: '',
    taxAgentName: '',
    taxablePersonNameInArabic: '',
  });

  strings.setLanguage(language);

  useEffect(() => {
    props.vatreportActions.getCompanyDetails().then(res => {
      if (res.status === 200) {
        setInitValue(prev => ({
          ...prev,
          vatRegistrationNumber: res.data.vatRegistrationNumber || '',
        }));
      }
    });
  }, [props.vatreportActions]);

  const handleSubmit = async data => {
    const { current_report_id, vatreportActions, commonActions, closeModal } = props;
    data.vatReportFiling = current_report_id;
    let formData = new FormData();
    for (var key in data) {
      formData.append(key, data[key]);
    }
    return vatreportActions
      .fileVatReport(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data.message ? res.data.message : 'VAT Report Filed Successfully'
          );
          closeModal(true);
        }
      })
      .catch(err => {
        throw err;
      });
  };

  const dateLimit = () => {
    const { taxReturns } = props;
    if (taxReturns) {
      var datearray = taxReturns.split('-')[0].split('/');
      const day = parseInt(datearray[0]);
      const month = parseInt(datearray[1]) - 1;
      const year = parseInt(datearray[2]);
      const nextMonth = new Date(year, month + 1, 1);
      return nextMonth;
    }
    return undefined;
  };

  const { openModal, closeModal, taxReturns } = props;

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openModal} className="modal-success contact-modal">
        <ModalHeader>
          <Row>
            <Col lg={12}>
              <div className="h4 mb-0 d-flex align-items-center">
                <UserCircle className="h-4 w-4" />
                <span className="ml-2">File The Report For VAT Return ( {taxReturns} )</span>
              </div>
            </Col>
          </Row>
        </ModalHeader>

        <FileTaxReturnModalForm
          onSubmit={handleSubmit}
          closeModal={closeModal}
          commonActions={props.commonActions}
          initValue={initValue}
          taxReturns={taxReturns}
          dateLimit={dateLimit}
        />
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FileTaxReturnModal);
