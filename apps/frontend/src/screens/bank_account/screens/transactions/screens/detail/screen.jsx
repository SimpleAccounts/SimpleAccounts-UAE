import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  NavLink,
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import dayjs from '@/utils/date';
import { LeavePage, Loader } from 'components';
import * as transactionDetailActions from './actions';
import * as transactionActions from '../../actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import API_ROOT_URL from '../../../../../../constants/config';
import { ViewBankAccount } from './sections';
import { data } from '../../../../../Language/index';
import LocalizedStrings from 'react-localization';

const mapStateToProps = state => {
  return {
    transaction_category_list: state.bank_account.transaction_category_list,
    transaction_type_list: state.bank_account.transaction_type_list,
    project_list: state.bank_account.project_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    transactionActions: bindActionCreators(transactionActions, dispatch),
    transactionDetailActions: bindActionCreators(transactionDetailActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    },
  }),
};

let strings = new LocalizedStrings(data);

// Zod validation schema
const detailTransactionSchema = z.object({
  transactionDate: z.date({
    required_error: 'Transaction Date is Required',
    invalid_type_error: 'Transaction Date is Required',
  }),
  transactionAmount: z.string().min(1, 'Transaction Amount is Required'),
  chartOfAccountId: z.union([z.number(), z.string().min(1, 'Transaction Type is Required')]),
  transactionDescription: z.string().optional(),
  transactionCategoryId: z.union([z.number(), z.string()]).optional(),
  projectId: z.union([z.number(), z.string()]).optional(),
  receiptNumber: z.string().optional(),
  attachementDescription: z.string().optional(),
  attachment: z
    .any()
    .optional()
    .refine(
      file => {
        const supported_format = [
          'image/png',
          'image/jpeg',
          'text/plain',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!file || (file && supported_format.includes(file.type))) {
          return true;
        }
        return false;
      },
      { message: 'Unsupported File Format' }
    )
    .refine(
      file => {
        const file_size = 1024000;
        if (!file || (file && file.size <= file_size)) {
          return true;
        }
        return false;
      },
      { message: 'File Size is too large' }
    ),
  bankAccountId: z.union([z.number(), z.string()]).optional(),
  fileName: z.string().optional(),
  filePath: z.string().optional(),
});

const DetailBankTransaction = ({
  transaction_category_list,
  transaction_type_list,
  project_list,
  transactionActions,
  transactionDetailActions,
  commonActions,
  history,
  location,
}) => {
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [fileName, setFileName] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [view, setView] = useState(false);
  const [uploadFileRef, setUploadFileRef] = useState(null);

  const form = useForm({
    resolver: zodResolver(detailTransactionSchema),
    defaultValues: {
      bankAccountId: '',
      transactionDate: new Date(),
      transactionDescription: '',
      transactionAmount: '',
      chartOfAccountId: '',
      transactionCategoryId: '',
      projectId: '',
      receiptNumber: '',
      attachementDescription: '',
      attachment: '',
      fileName: '',
      filePath: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;

  const regEx = /^\d+$/;
  const regExBoth = /[a-zA-Z0-9]+$/;

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    transactionActions.getTransactionCategoryList();
    transactionActions.getTransactionTypeList();
    transactionActions.getProjectList();

    if (location.state && location.state.id) {
      transactionDetailActions
        .getTransactionDetail(location.state.id)
        .then(res => {
          setTransactionId(location.state.id);
          reset({
            bankAccountId: res.data.bankAccountId ? res.data.bankAccountId : '',
            transactionDate: res.data.transactionDate ? res.data.transactionDate : new Date(),
            transactionDescription: res.data.transactionDescription
              ? res.data.transactionDescription
              : '',
            transactionAmount: res.data.transactionAmount ? res.data.transactionAmount : '',
            chartOfAccountId: res.data.chartOfAccountId !== null ? res.data.chartOfAccountId : '',
            transactionCategoryId:
              res.data.transactionCategoryId !== null ? res.data.transactionCategoryId : '',
            projectId: res.data.projectId ? res.data.projectId : '',
            receiptNumber: res.data.receiptNumber ? res.data.receiptNumber : '',
            attachementDescription: res.data.attachementDescription
              ? res.data.attachementDescription
              : '',
            attachment: res.data.attachment ? res.data.attachment : '',
            fileName: res.data.receiptAttachmentFileName ? res.data.receiptAttachmentFileName : '',
            filePath: res.data.receiptAttachmentPath ? res.data.receiptAttachmentPath : '',
          });

          setView(location.state && location.state.view ? true : false);
          setLoading(false);
        })
        .catch(err => {
          history.push('/admin/banking/bank-account');
        });
    } else {
      history.push('/admin/banking/bank-account');
    }
  }, [location.state, history, transactionActions, transactionDetailActions, reset]);

  const handleFileChange = e => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {};
      reader.readAsDataURL(file);
      setValue('attachment', file, { shouldValidate: true });
      setFileName(file.name);
    }
  };

  const onSubmit = data => {
    setDisableLeavePage(true);
    setLoading(true);

    const {
      bankAccountId,
      transactionDate,
      transactionDescription,
      transactionAmount,
      chartOfAccountId,
      transactionCategoryId,
      projectId,
      receiptNumber,
      attachementDescription,
    } = data;

    let formData = new FormData();
    formData.append('bankAccountId ', bankAccountId ? bankAccountId : '');
    formData.append('id', transactionId ? transactionId : '');
    formData.append(
      'transactionDate',
      typeof transactionDate === 'string' ? dayjs(transactionDate).toDate() : transactionDate
    );
    formData.append('transactionDescription', transactionDescription ? transactionDescription : '');
    formData.append('transactionAmount', transactionAmount ? transactionAmount : '');
    formData.append(
      'chartOfAccountId',
      typeof chartOfAccountId === 'object' ? chartOfAccountId['value'] : chartOfAccountId
    );
    formData.append(
      'transactionCategoryId',
      typeof transactionCategoryId === 'object'
        ? transactionCategoryId['value']
        : transactionCategoryId
    );
    formData.append('projectId', typeof projectId === 'object' ? projectId['value'] : projectId);
    formData.append('receiptNumber', receiptNumber ? receiptNumber : '');
    formData.append('attachementDescription', attachementDescription ? attachementDescription : '');

    if (uploadFileRef?.files?.[0]) {
      formData.append('attachment', uploadFileRef.files[0]);
    }

    transactionDetailActions
      .updateTransaction(formData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Transaction Detail Updated Successfully.');
          history.push('/admin/banking/bank-account/transaction', {
            bankAccountId,
          });
        }
      })
      .catch(err => {
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const editDetails = () => {
    setView(false);
  };

  const formValues = watch();

  return (
    <div className="detail-bank-transaction-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            {loading ? (
              <Loader />
            ) : view ? (
              <ViewBankAccount
                initialVals={formValues}
                editDetails={() => {
                  editDetails();
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="icon-doc" />
                        <span className="ml-2">
                          {strings.Update +
                            ' ' +
                            strings.Bank +
                            ' ' +
                            strings.Transaction +
                            ' ' +
                            strings.Details}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="chartOfAccountId">
                                <span className="text-danger">* </span>
                                {strings.TransactionType}
                              </Label>
                              <Controller
                                name="chartOfAccountId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    styles={customStyles}
                                    options={
                                      transaction_type_list
                                        ? selectOptionsFactory.renderOptions(
                                            'chartOfAccountName',
                                            'chartOfAccountId',
                                            transaction_type_list,
                                            'Type'
                                          )
                                        : []
                                    }
                                    value={
                                      transaction_type_list &&
                                      selectOptionsFactory
                                        .renderOptions(
                                          'chartOfAccountName',
                                          'chartOfAccountId',
                                          transaction_type_list,
                                          'Type'
                                        )
                                        .find(option => option.value === field.value)
                                    }
                                    onChange={option => {
                                      field.onChange(option ? option.value : '');
                                    }}
                                    placeholder={strings.Select + ' ' + strings.TransactionType}
                                    id="chartOfAccountId"
                                    className={errors.chartOfAccountId ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.chartOfAccountId && (
                                <div className="invalid-feedback">
                                  {errors.chartOfAccountId.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="transactionDate">
                                <span className="text-danger">* </span>
                                {strings.TransactionDate}
                              </Label>
                              <Controller
                                name="transactionDate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    id="transactionDate"
                                    placeholderText={strings.TransactionDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={
                                      field.value
                                        ? typeof field.value === 'string'
                                          ? dayjs(field.value).toDate()
                                          : field.value
                                        : null
                                    }
                                    onChange={value => field.onChange(value)}
                                    className={`form-control ${
                                      errors.transactionDate ? 'is-invalid' : ''
                                    }`}
                                  />
                                )}
                              />
                              {errors.transactionDate && (
                                <div className="invalid-feedback">
                                  {errors.transactionDate.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="transactionAmount">
                                <span className="text-danger">* </span>
                                {strings.Total + ' ' + strings.Amount}
                              </Label>
                              <Controller
                                name="transactionAmount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    min="0"
                                    id="transactionAmount"
                                    placeholder={strings.Amount}
                                    {...field}
                                    onChange={e => {
                                      if (e.target.value === '' || regEx.test(e.target.value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.transactionAmount ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.transactionAmount && (
                                <div className="invalid-feedback">
                                  {errors.transactionAmount.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="transactionCategoryId">{strings.Category}</Label>
                              <Controller
                                name="transactionCategoryId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    styles={customStyles}
                                    className="select-default-width"
                                    options={
                                      transaction_category_list && transaction_category_list.data
                                        ? selectOptionsFactory.renderOptions(
                                            'transactionCategoryName',
                                            'transactionCategoryId',
                                            transaction_category_list.data,
                                            'Category'
                                          )
                                        : []
                                    }
                                    id="transactionCategoryId"
                                    value={
                                      transaction_category_list &&
                                      transaction_category_list.data &&
                                      selectOptionsFactory
                                        .renderOptions(
                                          'transactionCategoryName',
                                          'transactionCategoryId',
                                          transaction_category_list.data,
                                          'Category'
                                        )
                                        .find(option => option.value === field.value)
                                    }
                                    onChange={option => {
                                      field.onChange(option ? option.value : '');
                                    }}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={8}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="transactionDescription">{strings.Description}</Label>
                              <Controller
                                name="transactionDescription"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="textarea"
                                    id="description"
                                    rows="6"
                                    placeholder={strings.Description}
                                    {...field}
                                    onChange={e => {
                                      if (!e.target.value.includes('=')) field.onChange(e);
                                    }}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="projectId">{strings.Project}</Label>
                              <Controller
                                name="projectId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    styles={customStyles}
                                    className="select-default-width"
                                    options={
                                      project_list
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            project_list,
                                            'Project'
                                          )
                                        : []
                                    }
                                    id="projectId"
                                    value={
                                      project_list &&
                                      project_list.find(option => option.value === +field.value)
                                    }
                                    onChange={option => {
                                      field.onChange(option ? option.value : '');
                                    }}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={8}>
                            <Row>
                              <Col lg={6}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="receiptNumber">{strings.ReceiptNumber}</Label>
                                  <Controller
                                    name="receiptNumber"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        type="text"
                                        maxLength="20"
                                        id="receiptNumber"
                                        placeholder={strings.ReceiptNumber}
                                        {...field}
                                        onChange={e => {
                                          if (
                                            e.target.value === '' ||
                                            regExBoth.test(e.target.value)
                                          ) {
                                            field.onChange(e);
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col lg={12}>
                                <FormGroup className="mb-3 hideAttachment">
                                  <Label htmlFor="attachementDescription">
                                    {strings.AttachmentDescription}
                                  </Label>
                                  <Controller
                                    name="attachementDescription"
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        type="textarea"
                                        id="attachementDescription"
                                        rows="5"
                                        placeholder={strings.Description}
                                        {...field}
                                      />
                                    )}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                          </Col>
                          <Col lg={4}>
                            <Row>
                              <Col lg={12}>
                                <FormGroup className="mb-3 hideAttachment">
                                  <Label>{strings.ReceiptAttachment}</Label>
                                  <br />
                                  <div className="file-upload-cont">
                                    <Button
                                      color="primary"
                                      onClick={() => {
                                        document.getElementById('fileInput').click();
                                      }}
                                      className="btn-square mr-3"
                                    >
                                      <i className="fa fa-upload"></i> {strings.upload}
                                    </Button>
                                    <input
                                      id="fileInput"
                                      ref={ref => {
                                        setUploadFileRef(ref);
                                      }}
                                      type="file"
                                      style={{ display: 'none' }}
                                      onChange={e => {
                                        handleFileChange(e);
                                      }}
                                    />
                                    {fileName && (
                                      <div>
                                        <i
                                          className="fa fa-close"
                                          onClick={() => setFileName('')}
                                        ></i>{' '}
                                        {fileName}
                                      </div>
                                    )}
                                    {!fileName && formValues.fileName && (
                                      <NavLink
                                        download={formValues.fileName}
                                        href={`${API_ROOT_URL.API_ROOT_URL}${formValues.filePath}`}
                                        style={{
                                          fontSize: '0.875rem',
                                        }}
                                        target="_blank"
                                      >
                                        {formValues.fileName}
                                      </NavLink>
                                    )}
                                  </div>
                                  {errors.attachment && (
                                    <div className="invalid-file">{errors.attachment.message}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={12} className="mt-5">
                            <FormGroup className="text-right">
                              <Button type="submit" color="primary" className="btn-square mr-3">
                                <i className="fa fa-dot-circle-o"></i> {strings.Update}
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() =>
                                  history.push('/admin/banking/bank-account/transaction', {
                                    bankAccountId: formValues.bankAccountId,
                                    currency: location.state?.currency,
                                  })
                                }
                              >
                                <i className="fa fa-ban"></i> {strings.Cancel}
                              </Button>
                            </FormGroup>
                          </Col>
                        </Row>
                      </Form>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailBankTransaction);
