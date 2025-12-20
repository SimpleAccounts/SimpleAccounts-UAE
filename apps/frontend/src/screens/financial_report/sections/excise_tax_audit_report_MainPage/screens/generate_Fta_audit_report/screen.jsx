import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  CardHeader,
  ModalBody,
  ModalFooter,
  CardBody,
  Card,
} from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthActions, CommonActions } from 'services/global';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import * as VatreportAction from './actions';
import * as FinancialReportActions from '../../../../actions';
import DatePicker from 'react-datepicker';
import dayjs from '@/utils/date';
import { data } from '../../../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Currency } from 'components';

const mapStateToProps = state => {
  return {
    version: state.common.version,
    company_profile: state.reports.company_profile,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
    vatreport: bindActionCreators(VatreportAction, dispatch),
    financialReportActions: bindActionCreators(FinancialReportActions, dispatch),
  };
};

const regEx = /^[0-9]+$/;
const regExTelephone = /^[0-9-]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;

const createValidationSchema = (isTANMandetory) => {
  return z.object({
    taxablePersonNameInEnglish: z.string().min(1, 'Taxable person name in english is required'),
    taxablePersonNameInArabic: z.string().min(1, 'Taxable person name in arabic is required'),
    taxAgentName: z.string().min(1, 'Tax agent name is required'),
    taxAgencyName: z.string().optional(),
    taxAgencyNumber: isTANMandetory
      ? z.string().min(1, 'TAN is required')
      : z.string().optional(),
    taxAgentApprovalNumber: z.string().min(1, 'Tax agent approval number is required'),
    vatRegistrationNumber: z.string().min(1, 'Tax registration number is required'),
    taxFiledOn: z.date({ required_error: 'Date of filling is required' }),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
  });
};

let strings = new LocalizedStrings(data);

const GenerateAuditFile = ({
  history,
  commonActions,
  vatreport,
  financialReportActions,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [disabled, setDisabled] = useState(false);
  const [isTANMandetory, setIsTANMandetory] = useState(false);
  const [vatReportDataList, setVatReportDataList] = useState([]);

  strings.setLanguage(language);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createValidationSchema(isTANMandetory)),
    defaultValues: {
      taxablePersonNameInEnglish: '',
      taxablePersonNameInArabic: '',
      taxAgentName: '',
      taxAgencyName: '',
      taxAgencyNumber: '',
      taxAgentApprovalNumber: '',
      vatRegistrationNumber: '',
      taxFiledOn: null,
      startDate: null,
      endDate: null,
    },
  });

  useEffect(() => {
    getInitialData();
    financialReportActions.getCompany();
  }, []);

  const getInitialData = () => {
    vatreport
      .getVatPaymentHistoryList()
      .then(res => {
        if (res.status === 200) {
          setVatReportDataList(res.data);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const onSubmit = (formData) => {
    setDisabled(true);
    console.log('Form data:', formData);
    setDisabled(false);
  };

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  return (
    <div className="import-bank-statement-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <Row>
              <Col lg={12}>
                <div
                  className="h4 mb-0 d-flex align-items-center"
                  style={{ justifyContent: 'space-between' }}
                >
                  <div>
                    <h5>
                      <i className="fa fa-history mr-2"></i>FTA EXCISE TAX AUDIT REPORT
                    </h5>
                  </div>
                  <div className="d-flex">
                    <Button
                      className="mr-2 print-btn-cont"
                      onClick={() => {
                        history.push('/admin/report/exciseTaxAuditReports');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>X</span>
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
              <ModalBody>
                <Row>
                  <Col lg={4}>
                    <FormGroup className="mb-3">
                      <span className="text-danger">* </span>
                      <Label htmlFor="taxablePersonNameInEnglish">
                        Taxable Person Name (English)
                      </Label>
                      <Controller
                        name="taxablePersonNameInEnglish"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            type="text"
                            id="taxablePersonNameInEnglish"
                            placeholder="Enter Taxable Person Name (English)"
                            value={value || ''}
                            onChange={onChange}
                          />
                        )}
                      />
                      {errors.taxablePersonNameInEnglish && (
                        <div className="text-danger">
                          {errors.taxablePersonNameInEnglish.message}
                        </div>
                      )}
                    </FormGroup>
                  </Col>
                  <Col lg={4}>
                    <FormGroup className="mb-3">
                      <span className="text-danger">* </span>
                      <Label htmlFor="taxablePersonNameInArabic">
                        Taxable Person Name (Arabic)
                      </Label>
                      <Controller
                        name="taxablePersonNameInArabic"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            type="text"
                            id="taxablePersonNameInArabic"
                            placeholder="Enter Taxable Person Name (Arabic)"
                            value={value || ''}
                            onChange={onChange}
                          />
                        )}
                      />
                      {errors.taxablePersonNameInArabic && (
                        <div className="text-danger">
                          {errors.taxablePersonNameInArabic.message}
                        </div>
                      )}
                    </FormGroup>
                  </Col>
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
                            placeholder="Enter Agent Name"
                            value={value || ''}
                            onChange={onChange}
                          />
                        )}
                      />
                      {errors.taxAgentName && (
                        <div className="text-danger">{errors.taxAgentName.message}</div>
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col lg={4}>
                    <FormGroup className="mb-3">
                      <Label htmlFor="taxAgencyName">Tax Agency Name </Label>
                      <Controller
                        name="taxAgencyName"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            type="text"
                            id="taxAgencyName"
                            placeholder="Enter Tax Agency Name"
                            value={value || ''}
                            onChange={(e) => {
                              onChange(e);
                              if (e.target.value !== '') {
                                setIsTANMandetory(true);
                              } else {
                                setIsTANMandetory(false);
                              }
                            }}
                          />
                        )}
                      />
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
                            maxLength={10}
                            autoComplete="off"
                            placeholder="Enter Tax Agency Number (TAN)"
                            value={value || ''}
                            onChange={(e) => {
                              if (e.target.value === '' || regExBoth.test(e.target.value)) {
                                onChange(e);
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
                  <Col lg={4}>
                    <FormGroup className="mb-3">
                      <span className="text-danger">* </span>
                      <Label htmlFor="taxAgentApprovalNumber">
                        Tax Agent Approval Number (TAAN){' '}
                      </Label>
                      <Controller
                        name="taxAgentApprovalNumber"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            type="text"
                            id="taxAgentApprovalNumber"
                            maxLength={8}
                            placeholder="Enter Agent Approval Number"
                            value={value || ''}
                            onChange={(e) => {
                              if (e.target.value === '' || regExTelephone.test(e.target.value)) {
                                onChange(e);
                              }
                            }}
                          />
                        )}
                      />
                      {errors.taxAgentApprovalNumber && (
                        <div className="text-danger">
                          {errors.taxAgentApprovalNumber.message}
                        </div>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
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
                            onChange={(e) => {
                              if (e.target.value === '' || regEx.test(e.target.value)) {
                                onChange(e);
                              }
                            }}
                            className={errors.vatRegistrationNumber ? 'is-invalid' : ''}
                          />
                        )}
                      />
                      {errors.vatRegistrationNumber && (
                        <div className="invalid-feedback">
                          {errors.vatRegistrationNumber.message}
                        </div>
                      )}
                      <div className="VerifyTRN">
                        <br />
                        <b>
                          {' '}
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://tax.gov.ae/en/default.aspx"
                            style={{ color: '#2266d8' }}
                          >
                            {strings.VerifyTRN}
                          </a>
                        </b>
                      </div>
                    </FormGroup>
                  </Col>
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
                            autoComplete="off"
                            dateFormat="dd-MM-yyyy"
                            dropdownMode="select"
                            selected={value}
                            onChange={onChange}
                            className={`form-control ${errors.taxFiledOn ? 'is-invalid' : ''}`}
                          />
                        )}
                      />
                      {errors.taxFiledOn && (
                        <div className="text-danger">{errors.taxFiledOn.message}</div>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col lg={4}>
                    <FormGroup className="mb-3">
                      <Label htmlFor="startDate">{strings.StartDate}</Label>
                      <Controller
                        name="startDate"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            id="startDate"
                            className="form-control"
                            placeholderText="From"
                            showMonthDropdown
                            showYearDropdown
                            autoComplete="off"
                            minDate={new Date('01-01-2018')}
                            selected={value}
                            dropdownMode="select"
                            dateFormat="dd-MM-yyyy"
                            onChange={onChange}
                          />
                        )}
                      />
                    </FormGroup>
                  </Col>
                  <Col lg={4}>
                    <FormGroup className="mb-3">
                      <Label htmlFor="endDate">{strings.EndDate}</Label>
                      <Controller
                        name="endDate"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            id="endDate"
                            className="form-control"
                            autoComplete="off"
                            placeholderText="To"
                            showMonthDropdown
                            showYearDropdown
                            selected={value}
                            dropdownMode="select"
                            dateFormat="dd-MM-yyyy"
                            onChange={onChange}
                          />
                        )}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  className="btn-square"
                  disabled={isSubmitting || disabled}
                >
                  <i className="fa fa-dot-circle-o"></i>{' '}
                  {disabled ? 'Saving...' : strings.Save}
                </Button>
                &nbsp;
                <Button
                  color="secondary"
                  className="btn-square"
                  onClick={() => {
                    setIsTANMandetory(false);
                    history.push('/admin/report/exciseTaxAuditReports');
                  }}
                >
                  <i className="fa fa-ban"></i> {strings.Cancel}
                </Button>
              </ModalFooter>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GenerateAuditFile);
