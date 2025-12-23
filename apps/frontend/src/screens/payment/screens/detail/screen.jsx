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
} from 'components/migration';
import Select from 'react-select';
import { selectCurrencyFactory, selectOptionsFactory, selectStyles } from 'utils';
import DatePicker from 'react-datepicker';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import { SupplierModal } from '../../sections';
import dayjs from '@/utils/date';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import * as PaymentActions from '../../actions';
import * as DetailPaymentActions from './actions';
import { CommonActions } from 'services/global';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Wallet, CircleDot, Trash2, Ban } from 'lucide-react';

const strings = new LocalizedStrings(data);

// Zod validation schema
const detailPaymentSchema = z.object({
  supplier: z.string().min(1, 'Supplier is required'),
  invoiceId: z.string().min(1, 'Invoice number is required'),
  payment_date: z.date({ required_error: 'Payment date is required' }),
  currency: z.string().min(1, 'Currency is required'),
  invoiceAmount: z
    .string()
    .min(1, 'Invoice amount is required')
    .regex(/^[0-9]*$/, 'Enter a valid amount'),
  project: z.string().optional(),
  description: z.string().optional(),
  bank: z.string().optional(),
});

const mapStateToProps = state => {
  return {
    bank_list: state.payment.bank_list,
    currency_list: state.payment.currency_list,
    supplier_list: state.payment.supplier_list,
    project_list: state.payment.project_list,
    invoice_list: state.payment.invoice_list,
    country_list: state.payment.country_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailPaymentActions: bindActionCreators(DetailPaymentActions, dispatch),
    paymentActions: bindActionCreators(PaymentActions, dispatch),
  };
};

const DetailPayment = ({
  bank_list,
  currency_list,
  supplier_list,
  project_list,
  invoice_list,
  country_list,
  commonActions,
  detailPaymentActions,
  paymentActions,
  history,
  location,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [contactType] = useState(1);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  const form = useForm({
    resolver: zodResolver(detailPaymentSchema),
    defaultValues: {
      supplier: '',
      invoiceId: '',
      invoiceAmount: '',
      currency: '',
      project: '',
      payment_date: new Date(),
      description: '',
      bank: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = form;

  const regEx = /^[0-9]+$/;

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    const id = location.state?.id;
    if (location.state && id) {
      detailPaymentActions
        .getPaymentById(id)
        .then(res => {
          if (res.status === 200) {
            paymentActions.getCurrencyList();
            paymentActions.getBankList();
            paymentActions.getSupplierContactList(contactType);
            paymentActions.getProjectList();
            paymentActions.getSupplierInvoiceList();
            paymentActions.getCountryList();

            setCurrentPaymentId(id);
            setPaymentId(res.data.paymentId);
            reset({
              supplier: res.data.contactId ? res.data.contactId.toString() : '',
              invoiceId: res.data.invoiceId ? res.data.invoiceId.toString() : '',
              invoiceAmount: res.data.invoiceAmount ? res.data.invoiceAmount.toString() : '',
              currency: res.data.currencyCode ? res.data.currencyCode.toString() : '',
              project: res.data.projectId ? res.data.projectId.toString() : '',
              payment_date: res.data.paymentDate ? new Date(res.data.paymentDate) : new Date(),
              description: res.data.description ? res.data.description : '',
              bank: res.data.bankAccountId ? res.data.bankAccountId.toString() : '',
            });
            setSelectedSupplier(res.data.contactId);
            setLoading(false);
          }
        })
        .catch(err => {
          history.push('/admin/expense/payment');
        });
    } else {
      history.push('/admin/expense/payment');
    }
  }, [location.state, detailPaymentActions, paymentActions, contactType, history, reset]);

  const onSubmit = data => {
    const {
      bank,
      supplier,
      invoiceId,
      invoiceAmount,
      payment_date,
      currency,
      project,
      description,
    } = data;

    const postData = {
      paymentId: paymentId,
      paymentDate: payment_date !== null ? payment_date : '',
      description,
      invoiceId: invoiceId ? invoiceId : '',
      invoiceAmount,
      bankAccountId: bank ? bank : '',
      contactId: supplier ? supplier : '',
      currencyCode: currency ? currency : '',
      projectId: project ? project : '',
    };

    detailPaymentActions
      .updatePayment(postData)
      .then(res => {
        commonActions.tostifyAlert('success', 'Payment Update Successfully.');
        history.push('/admin/expense/payment');
      })
      .catch(err => {
        setDisableLeavePage(true);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Payment Update Unsuccessfully'
        );
      });
  };

  const openSupplierModalHandler = e => {
    e.preventDefault();
    setOpenSupplierModal(true);
  };

  const getCurrentUser = data => {
    let option;
    if (data.label || data.value) {
      option = data;
    } else {
      option = {
        label: `${data.fullName}`,
        value: data.id,
      };
    }
    setValue('supplier', option.value.toString(), { shouldValidate: true });
  };

  const closeSupplierModal = res => {
    if (res) {
      paymentActions.getSupplierContactList(contactType);
    }
    setOpenSupplierModal(false);
  };

  const deletePayment = () => {
    const message1 = (
      <text>
        <b>Delete Payments?</b>
      </text>
    );
    const message = 'This payments will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removePayment}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removePayment = () => {
    detailPaymentActions
      .deletePayment(currentPaymentId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', 'Payment Deleted Successfully');
          history.push('/admin/expense/payment');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  useEffect(() => {
    if (supplier_list && selectedSupplier) {
      const item = supplier_list.find(item => item.value === selectedSupplier);
      if (item) {
        getCurrentUser(item);
      }
    }
  }, [supplier_list]);

  strings.setLanguage(language);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="detail-payment-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <Wallet className="h-4 w-4" />
                        <span className="ml-2">{strings.Update + ' ' + strings.Payment}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                      <Col lg={12}>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="supplier">
                                <span className="text-danger">* </span>
                                {strings.SupplierName}
                              </Label>
                              <Controller
                                name="supplier"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={selectStyles}
                                    id="supplier"
                                    options={
                                      supplier_list
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            supplier_list,
                                            'Supplier Name'
                                          )
                                        : []
                                    }
                                    value={
                                      supplier_list &&
                                      supplier_list.find(option => option.value === +field.value)
                                    }
                                    onChange={option => {
                                      field.onChange(option.value.toString());
                                    }}
                                    className={errors.supplier ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.supplier && (
                                <div className="invalid-feedback d-block">
                                  {errors.supplier.message}
                                </div>
                              )}
                            </FormGroup>
                            <Button
                              type="button"
                              color="primary"
                              className="btn-square mr-3 mb-3"
                              onClick={openSupplierModalHandler}
                            >
                              <CircleDot className="h-4 w-4" /> {strings.Supplier}
                            </Button>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="invoiceId">
                                <span className="text-danger">* </span>
                                {strings.Invoice}#
                              </Label>
                              <Controller
                                name="invoiceId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={selectStyles}
                                    id="invoiceId"
                                    options={
                                      invoice_list
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            invoice_list,
                                            'Invoice Number'
                                          )
                                        : []
                                    }
                                    value={
                                      invoice_list &&
                                      invoice_list.find(option => option.value === +field.value)
                                    }
                                    onChange={option => {
                                      field.onChange(option.value.toString());
                                    }}
                                    className={errors.invoiceId ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.invoiceId && (
                                <div className="invalid-feedback d-block">
                                  {errors.invoiceId.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="invoiceAmount">
                                <span className="text-danger">* </span>
                                {strings.InvoiceAmount}
                              </Label>
                              <Controller
                                name="invoiceAmount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    id="invoiceAmount"
                                    placeholder={strings.Enter + strings.Amount}
                                    onChange={e => {
                                      if (e.target.value === '' || regEx.test(e.target.value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={errors.invoiceAmount ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.invoiceAmount && (
                                <div className="invalid-feedback">
                                  {errors.invoiceAmount.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="currency">
                                <span className="text-danger">* </span>
                                {strings.Currency}
                              </Label>
                              <Controller
                                name="currency"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={selectStyles}
                                    id="currency"
                                    options={
                                      currency_list
                                        ? selectCurrencyFactory.renderOptions(
                                            'currencyName',
                                            'currencyCode',
                                            currency_list,
                                            'Currency'
                                          )
                                        : []
                                    }
                                    value={
                                      currency_list &&
                                      selectCurrencyFactory
                                        .renderOptions(
                                          'currencyName',
                                          'currencyCode',
                                          currency_list,
                                          'Currency'
                                        )
                                        .find(option => option.value === +field.value)
                                    }
                                    onChange={option => {
                                      field.onChange(option.value.toString());
                                    }}
                                    className={errors.currency ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.currency && (
                                <div className="invalid-feedback d-block">
                                  {errors.currency.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="project">Project</Label>
                              <Controller
                                name="project"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={selectStyles}
                                    id="project"
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
                                    value={
                                      project_list &&
                                      project_list.find(option => option.value === +field.value)
                                    }
                                    onChange={option => {
                                      field.onChange(option ? option.value.toString() : '');
                                    }}
                                    className={errors.project ? 'is-invalid' : ''}
                                    isClearable
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="payment_date">
                                <span className="text-danger">* </span>
                                {strings.PaymentDate}
                              </Label>
                              <Controller
                                name="payment_date"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    id="payment_date"
                                    placeholderText=""
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    selected={field.value}
                                    onChange={date => field.onChange(date)}
                                    className={`form-control ${
                                      errors.payment_date ? 'is-invalid' : ''
                                    }`}
                                  />
                                )}
                              />
                              {errors.payment_date && (
                                <div className="invalid-feedback">
                                  {errors.payment_date.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="bank">Bank</Label>
                              <Controller
                                name="bank"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={selectStyles}
                                    id="bank"
                                    options={
                                      bank_list && bank_list.data
                                        ? selectOptionsFactory.renderOptions(
                                            'name',
                                            'bankAccountId',
                                            bank_list.data,
                                            'Bank'
                                          )
                                        : []
                                    }
                                    value={
                                      bank_list &&
                                      bank_list.data &&
                                      selectOptionsFactory
                                        .renderOptions(
                                          'name',
                                          'bankAccountId',
                                          bank_list.data,
                                          'Bank'
                                        )
                                        .find(option => option.value === +field.value)
                                    }
                                    onChange={option => {
                                      field.onChange(option ? option.value.toString() : '');
                                    }}
                                    className={errors.bank ? 'is-invalid' : ''}
                                    isClearable
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={8}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="description">{strings.Description}</Label>
                              <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="textarea"
                                    id="description"
                                    rows="6"
                                    placeholder={strings.Description}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col
                        lg={12}
                        className="d-flex align-items-center justify-content-between flex-wrap mt-5"
                      >
                        <FormGroup>
                          <Button
                            type="button"
                            name="button"
                            color="danger"
                            className="btn-square"
                            onClick={deletePayment}
                          >
                            <Trash2 className="h-4 w-4" /> {strings.Delete}
                          </Button>
                        </FormGroup>
                        <FormGroup className="text-right">
                          <Button
                            type="submit"
                            name="submit"
                            color="primary"
                            className="btn-square mr-3"
                          >
                            <CircleDot className="h-4 w-4" /> {strings.Update}
                          </Button>
                          <Button
                            type="button"
                            name="button"
                            color="secondary"
                            className="btn-square"
                            onClick={() => {
                              history.push('/admin/expense/payment');
                            }}
                          >
                            <Ban className="h-4 w-4" /> {strings.Cancel}
                          </Button>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
        <SupplierModal
          openSupplierModal={openSupplierModal}
          closeSupplierModal={e => {
            closeSupplierModal(e);
          }}
          getCurrentUser={e => getCurrentUser(e)}
          createSupplier={paymentActions.createSupplier}
          getStateList={paymentActions.getStateList}
          currency_list={currency_list}
          country_list={country_list}
        />
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailPayment);
