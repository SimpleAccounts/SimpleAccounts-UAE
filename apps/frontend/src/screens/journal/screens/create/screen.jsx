import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Badge,
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { Currency, LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectStyles } from 'utils';
import * as JournalActions from '../../actions';
import * as JournalCreateActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const mapStateToProps = state => {
  return {
    transaction_category_list: state.journal.transaction_category_list,
    currency_list: state.journal.currency_list,
    contact_list: state.journal.contact_list,
    vat_list: state.journal.vat_list,
    universal_currency_list: state.common.universal_currency_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    journalActions: bindActionCreators(JournalActions, dispatch),
    journalCreateActions: bindActionCreators(JournalCreateActions, dispatch),
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
const journalLineItemSchema = z.object({
  transactionCategoryId: z.string().min(1, 'Account is required'),
  debitAmount: z.string().min(1, 'Debit is required'),
  creditAmount: z.string().min(1, 'Credit is required'),
  description: z.string().optional(),
  contactId: z.string().optional(),
});

const createJournalSchema = z.object({
  journalDate: z.date({ required_error: 'Date is required' }),
  journalReferenceNo: z.string().optional(),
  description: z.string().optional(),
  currencyCode: z.union([z.string(), z.number()]).optional(),
  journalLineItems: z
    .array(journalLineItemSchema)
    .min(2, 'Atleast two journal debit and credit details is mandatory'),
});

const CreateJournal = ({
  commonActions,
  journalActions,
  journalCreateActions,
  transaction_category_list,
  currency_list,
  contact_list,
  universal_currency_list,
  history,
  location,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [exist, setExist] = useState(false);
  const [data, setData] = useState([
    {
      id: 0,
      description: '',
      transactionCategoryId: '',
      contactId: '',
      debitAmount: 0,
      creditAmount: 0,
    },
    {
      id: 1,
      description: '',
      transactionCategoryId: '',
      contactId: '',
      debitAmount: 0,
      creditAmount: 0,
    },
  ]);
  const [idCount, setIdCount] = useState(1);
  const [submitJournal, setSubmitJournal] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [isRegisteredVat, setIsRegisteredVat] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [amounts, setAmounts] = useState({
    subTotalDebitAmount: 0,
    totalDebitAmount: 0,
    totalCreditAmount: 0,
    subTotalCreditAmount: 0,
  });

  const regEx = /^[0-9\d]+$/;
  const regExBoth = /[a-zA-Z0-9]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  const form = useForm({
    resolver: zodResolver(createJournalSchema),
    defaultValues: {
      journalDate: new Date(),
      journalReferenceNo: '',
      description: '',
      currencyCode: '',
      journalLineItems: [
        {
          id: 0,
          description: '',
          transactionCategoryId: '',
          contactId: '',
          debitAmount: 0,
          creditAmount: 0,
        },
        {
          id: 1,
          description: '',
          transactionCategoryId: '',
          contactId: '',
          debitAmount: 0,
          creditAmount: 0,
        },
      ],
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
    getValues,
    trigger,
    reset,
  } = form;

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    journalActions.getContactList();
    journalActions.getCurrencyList().then(response => {
      if (response.data && response.data[0]) {
        setValue('currencyCode', response.data[0].currencyCode);
      }
    });
    journalActions.getTransactionCategoryList();
    commonActions.getCompanyDetails().then(action => {
      if (action && action.type && action.type.includes('fulfilled')) {
        const isRegisteredVat = action.payload.isRegisteredVat;

        history.replace({
          pathname: location.pathname,
          state: {
            ...location.state,
            isRegisteredVat: isRegisteredVat,
          },
        });

        setCompanyDetails(action.payload);
        setIsRegisteredVat(isRegisteredVat);
      }
    });
  };

  const validationCheck = value => {
    const data = {
      moduleType: 20,
      name: value,
    };
    journalCreateActions.checkValidation(data).then(response => {
      if (response.data === 'Journal Reference Number Already Exists') {
        setExist(true);
      } else {
        setExist(false);
      }
    });
  };

  const renderActions = (cell, rows) => {
    return (
      <Button
        size="sm"
        className="btn-twitter btn-brand icon"
        disabled={data.length <= 2 ? true : false}
        onClick={e => {
          deleteRow(e, rows);
        }}
      >
        <i className="fas fa-trash"></i>
      </Button>
    );
  };

  const renderAccount = (cell, row) => {
    let transactionCategoryList =
      transaction_category_list && transaction_category_list.length
        ? [
            {
              label: 'Select Account',
              options: [
                {
                  transactionCategoryId: '',
                  transactionCategoryName: 'Select Account',
                },
              ],
            },
            ...transaction_category_list,
          ]
        : transaction_category_list;

    if (!isRegisteredVat) {
      const vatCategories = [
        'VAT Penalty',
        'Output VAT Adjustment',
        'Input VAT Adjustment',
        'VAT Payable',
        'Input VAT',
        'GCC VAT Payable',
        'Output VAT',
      ];

      if (Array.isArray(transactionCategoryList)) {
        const hasVatCategories = transactionCategoryList.some(
          group =>
            group.options && group.options.some(option => vatCategories.includes(option.label))
        );

        if (hasVatCategories) {
          transactionCategoryList = transactionCategoryList.map(group => {
            return {
              ...group,
              options: group.options
                ? group.options.filter(option => !vatCategories.includes(option.label))
                : [],
            };
          });
        }
      }
    }

    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Controller
        name={`journalLineItems.${idx}.transactionCategoryId`}
        control={control}
        render={({ field }) => (
          <>
            <Select
              styles={{
                menu: provided => ({ ...provided, zIndex: 9999 }),
              }}
              options={transactionCategoryList || []}
              id="transactionCategoryId"
              onChange={e => {
                selectItem(e.value, row, 'transactionCategoryId', idx);
              }}
              placeholder={strings.Select + strings.Account}
              className={`${
                errors.journalLineItems &&
                errors.journalLineItems[parseInt(idx, 10)] &&
                errors.journalLineItems[parseInt(idx, 10)].transactionCategoryId &&
                Object.keys(touchedFields).length > 0 &&
                touchedFields.journalLineItems &&
                touchedFields.journalLineItems[parseInt(idx, 10)] &&
                touchedFields.journalLineItems[parseInt(idx, 10)].transactionCategoryId
                  ? 'is-invalid'
                  : ''
              }`}
            />
            {errors.journalLineItems &&
              errors.journalLineItems[parseInt(idx, 10)] &&
              errors.journalLineItems[parseInt(idx, 10)].transactionCategoryId &&
              Object.keys(touchedFields).length > 0 &&
              touchedFields.journalLineItems &&
              touchedFields.journalLineItems[parseInt(idx, 10)] &&
              touchedFields.journalLineItems[parseInt(idx, 10)].transactionCategoryId && (
                <div className="invalid-feedback">
                  {errors.journalLineItems[parseInt(idx, 10)].transactionCategoryId.message}
                </div>
              )}
          </>
        )}
      />
    );
  };

  const renderDescription = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Controller
        name={`journalLineItems.${idx}.description`}
        control={control}
        render={({ field }) => (
          <Input
            type="text"
            maxLength="250"
            value={row['description'] !== '' ? row['description'] : ''}
            onChange={e => {
              selectItem(e.target.value, row, 'description', idx);
            }}
            placeholder={strings.Description}
            className={`form-control
             ${
               errors.journalLineItems &&
               errors.journalLineItems[parseInt(idx, 10)] &&
               errors.journalLineItems[parseInt(idx, 10)].description &&
               Object.keys(touchedFields).length > 0 &&
               touchedFields.journalLineItems &&
               touchedFields.journalLineItems[parseInt(idx, 10)] &&
               touchedFields.journalLineItems[parseInt(idx, 10)].description
                 ? 'is-invalid'
                 : ''
             }`}
          />
        )}
      />
    );
  };

  const renderContact = (cell, row) => {
    let contactList = contact_list.length
      ? [{ value: '', label: 'Select Contact' }, ...contact_list]
      : contact_list;
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Controller
        name={`journalLineItems.${idx}.contactId`}
        control={control}
        render={({ field }) => (
          <Input
            type="select"
            onChange={e => {
              selectItem(e.target.value, row, 'contactId', idx);
            }}
            value={row.contactId}
            className={`form-control
             ${
               errors.journalLineItems &&
               errors.journalLineItems[parseInt(idx, 10)] &&
               errors.journalLineItems[parseInt(idx, 10)].contactId &&
               Object.keys(touchedFields).length > 0 &&
               touchedFields.journalLineItems &&
               touchedFields.journalLineItems[parseInt(idx, 10)] &&
               touchedFields.journalLineItems[parseInt(idx, 10)].contactId
                 ? 'is-invalid'
                 : ''
             }`}
          >
            <option value="">Select Customer Name</option>

            {contactList
              ? contactList
                  .filter(obj => obj.value)
                  .map(obj => (
                    <option value={obj.value} key={obj.value}>
                      {obj.label.contactName}
                    </option>
                  ))
              : ''}
          </Input>
        )}
      />
    );
  };

  const renderDebits = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Controller
        name={`journalLineItems.${idx}.debitAmount`}
        control={control}
        render={({ field }) => (
          <>
            <Input
              type="number"
              min="0"
              maxLength="14,2"
              value={row['debitAmount'] !== 0 ? row['debitAmount'] : 0}
              onChange={e => {
                if (e.target.value === '' || regDecimal.test(e.target.value)) {
                  selectItem(e.target.value, row, 'debitAmount', idx);
                }
              }}
              placeholder={strings.Debit + ' ' + strings.Amount}
              className={`form-control
            			${
                    errors.journalLineItems &&
                    errors.journalLineItems[parseInt(idx, 10)] &&
                    errors.journalLineItems[parseInt(idx, 10)].debitAmount &&
                    Object.keys(touchedFields).length > 0 &&
                    touchedFields.journalLineItems &&
                    touchedFields.journalLineItems[parseInt(idx, 10)] &&
                    touchedFields.journalLineItems[parseInt(idx, 10)].debitAmount
                      ? 'is-invalid'
                      : ''
                  }`}
            />
            {errors.journalLineItems &&
              errors.journalLineItems[parseInt(idx, 10)] &&
              errors.journalLineItems[parseInt(idx, 10)].debitAmount &&
              Object.keys(touchedFields).length > 0 &&
              touchedFields.journalLineItems &&
              touchedFields.journalLineItems[parseInt(idx, 10)] &&
              touchedFields.journalLineItems[parseInt(idx, 10)].debitAmount && (
                <div className="invalid-feedback">
                  {errors.journalLineItems[parseInt(idx, 10)].debitAmount.message}
                </div>
              )}
          </>
        )}
      />
    );
  };

  const renderCredits = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    return (
      <Controller
        name={`journalLineItems.${idx}.creditAmount`}
        control={control}
        render={({ field }) => (
          <>
            <Input
              type="number"
              min="0"
              maxLength="14,2"
              value={row['creditAmount'] !== 0 ? row['creditAmount'] : 0}
              onChange={e => {
                if (e.target.value === '' || regDecimal.test(e.target.value)) {
                  selectItem(e.target.value, row, 'creditAmount', idx);
                }
              }}
              placeholder={strings.Credit + ' ' + strings.Amount}
              className={`form-control
            ${
              errors.journalLineItems &&
              errors.journalLineItems[parseInt(idx, 10)] &&
              errors.journalLineItems[parseInt(idx, 10)].creditAmount &&
              Object.keys(touchedFields).length > 0 &&
              touchedFields.journalLineItems &&
              touchedFields.journalLineItems[parseInt(idx, 10)] &&
              touchedFields.journalLineItems[parseInt(idx, 10)].creditAmount
                ? 'is-invalid'
                : ''
            }`}
            />
            {errors.journalLineItems &&
              errors.journalLineItems[parseInt(idx, 10)] &&
              errors.journalLineItems[parseInt(idx, 10)].creditAmount &&
              Object.keys(touchedFields).length > 0 &&
              touchedFields.journalLineItems &&
              touchedFields.journalLineItems[parseInt(idx, 10)] &&
              touchedFields.journalLineItems[parseInt(idx, 10)].creditAmount && (
                <div className="invalid-feedback">
                  {errors.journalLineItems[parseInt(idx, 10)].creditAmount.message}
                </div>
              )}
          </>
        )}
      />
    );
  };

  const addRow = () => {
    const newData = [...data];
    const newRow = {
      id: idCount + 1,
      description: '',
      transactionCategoryId: '',
      contactId: '',
      debitAmount: 0,
      creditAmount: 0,
    };
    newData.push(newRow);
    setData(newData);
    setIdCount(idCount + 1);
    setValue('journalLineItems', newData);
  };

  const selectItem = (value, row, name, idx) => {
    const newData = [...data];
    const itemIndex = newData.findIndex(obj => obj.id === row.id);

    if (itemIndex !== -1) {
      if (name === 'debitAmount') {
        newData[itemIndex][name] = value;
        newData[itemIndex]['creditAmount'] = 0;
        setValue(`journalLineItems.${idx}.creditAmount`, 0);
        setValue(`journalLineItems.${idx}.debitAmount`, value);
        updateAmount(newData);
      } else if (name === 'creditAmount') {
        newData[itemIndex][name] = value;
        newData[itemIndex]['debitAmount'] = 0;
        setValue(`journalLineItems.${idx}.debitAmount`, 0);
        setValue(`journalLineItems.${idx}.creditAmount`, value);
        updateAmount(newData);
      } else {
        newData[itemIndex][name] = value;
        setValue(`journalLineItems.${idx}.${name}`, value);
      }
      setData(newData);
    }
  };

  const deleteRow = (e, row) => {
    e.preventDefault();
    const id = row['id'];
    const newData = data.filter(obj => obj.id !== id);
    setData(newData);
    setValue('journalLineItems', newData);
    updateAmount(newData);
  };

  const updateAmount = data => {
    let subTotalDebitAmount = 0;
    let subTotalCreditAmount = 0;

    data.map(obj => {
      if (obj.debitAmount || obj.creditAmount) {
        subTotalDebitAmount = subTotalDebitAmount + +obj.debitAmount;
        subTotalCreditAmount = subTotalCreditAmount + +obj.creditAmount;
      }
      return obj;
    });

    setAmounts({
      subTotalDebitAmount,
      totalDebitAmount: subTotalDebitAmount,
      totalCreditAmount: subTotalCreditAmount,
      subTotalCreditAmount,
    });
  };

  const onSubmit = values => {
    if (
      submitJournal &&
      amounts.totalCreditAmount.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      }) !==
        amounts.totalDebitAmount.toLocaleString(navigator.language, {
          minimumFractionDigits: 2,
        })
    ) {
      setDisabled(false);
      return;
    } else {
      setDisabled(true);
    }

    if (amounts.totalCreditAmount !== amounts.totalDebitAmount) {
      setDisabled(false);
      return;
    }

    const processedData = [...data];
    processedData.map(item => {
      delete item.id;
      item.transactionCategoryId = item.transactionCategoryId ? item.transactionCategoryId : '';
      item.contactId = item.contactId ? item.contactId : '';
      return item;
    });

    const postData = {
      journalDate: values.journalDate ? values.journalDate : '',
      journalReferenceNo: values.journalReferenceNo ? values.journalReferenceNo : '',
      description: values.description ? values.description : '',
      currencyCode: values.currencyCode ? values.currencyCode : '',
      subTotalCreditAmount: amounts.subTotalCreditAmount,
      subTotalDebitAmount: amounts.subTotalDebitAmount,
      totalCreditAmount: amounts.totalCreditAmount,
      totalDebitAmount: amounts.totalDebitAmount,
      journalLineItems: processedData,
    };

    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating New Journal...');

    journalCreateActions
      .createJournal(postData)
      .then(res => {
        setDisabled(false);
        setLoading(false);
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'New Journal Created Successfully'
          );
          if (createMore) {
            setCreateMore(false);
            setDisableLeavePage(false);
            setSubmitJournal(false);
            const newData = [
              {
                id: 0,
                description: '',
                transactionCategoryId: '',
                contactId: '',
                debitAmount: 0,
                creditAmount: 0,
              },
              {
                id: 1,
                description: '',
                transactionCategoryId: '',
                contactId: '',
                debitAmount: 0,
                creditAmount: 0,
              },
            ];
            setData(newData);
            setAmounts({
              subTotalDebitAmount: 0,
              totalDebitAmount: 0,
              totalCreditAmount: 0,
              subTotalCreditAmount: 0,
            });
            reset({
              journalDate: new Date(),
              journalReferenceNo: '',
              description: '',
              currencyCode: getValues('currencyCode'),
              journalLineItems: newData,
            });
          } else {
            history.push('/admin/accountant/journal');
            setLoading(false);
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Journal Created Unsuccessfully'
        );
      });
  };

  return loading === true ? (
    <Loader loadingMsg={loadingMsg} />
  ) : (
    <div>
      <div className="create-journal-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="fa fa-diamond" />
                        <span className="ml-2">{strings.CreateJournal}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Row>
                      <Col lg={12}>
                        <Loader />
                      </Col>
                    </Row>
                  ) : (
                    <Row>
                      <Col lg={12}>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="date">
                                  <span className="text-danger">* </span>
                                  {strings.JournalDate}
                                </Label>
                                <Controller
                                  name="journalDate"
                                  control={control}
                                  render={({ field }) => (
                                    <DatePicker
                                      id="journalDate"
                                      name="journalDate"
                                      className={`form-control ${
                                        errors.journalDate && touchedFields.journalDate
                                          ? 'is-invalid'
                                          : ''
                                      }`}
                                      placeholderText={strings.JournalDate}
                                      selected={field.value}
                                      showMonthDropdown
                                      showYearDropdown
                                      dropdownMode="select"
                                      dateFormat="dd-MM-yyyy"
                                      maxDate={new Date()}
                                      onChange={date => field.onChange(date)}
                                    />
                                  )}
                                />
                                {errors.journalDate && touchedFields.journalDate && (
                                  <div className="invalid-feedback">
                                    {errors.journalDate.message?.includes('nullable()')
                                      ? 'Journal date is required'
                                      : errors.journalDate.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="journalReferenceNo">
                                  {strings.JournalReference}
                                </Label>
                                <Controller
                                  name="journalReferenceNo"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      maxLength="50"
                                      id="journalReferenceNo"
                                      placeholder={strings.Enter + strings.JournalReferenceNo}
                                      {...field}
                                      className={
                                        errors.journalReferenceNo && touchedFields.journalReferenceNo
                                          ? 'is-invalid'
                                          : ''
                                      }
                                    />
                                  )}
                                />
                                {errors.journalReferenceNo && touchedFields.journalReferenceNo && (
                                  <div className="invalid-feedback">
                                    {errors.journalReferenceNo.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="description">{strings.Notes}</Label>
                                <Controller
                                  name="description"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="textarea"
                                      maxLength="250"
                                      name="description"
                                      id="description"
                                      rows="5"
                                      placeholder={strings.DeliveryNotes}
                                      {...field}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={4}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="currencyCode">{strings.Currency}</Label>
                                <Controller
                                  name="currencyCode"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      styles={customStyles}
                                      className="select-default-width"
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
                                      id="currencyCode"
                                      name="currencyCode"
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
                                        if (option && option.value) {
                                          field.onChange(option.value);
                                        } else {
                                          field.onChange('');
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <hr />
                          <Row>
                            <Col lg={12} className="mb-3">
                              <Button color="primary" className="btn-square mr-3" onClick={addRow}>
                                <i className="fa fa-plus"></i> {strings.Addmore}
                              </Button>
                            </Col>
                          </Row>
                          {errors.journalLineItems &&
                            typeof errors.journalLineItems.message === 'string' && (
                              <div className={errors.journalLineItems ? 'is-invalid' : ''}>
                                <div className="invalid-feedback">
                                  <Badge
                                    color="danger"
                                    style={{
                                      padding: '10px',
                                      marginBottom: '5px',
                                    }}
                                  >
                                    {errors.journalLineItems.message}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          {submitJournal &&
                            !errors.journalLineItems &&
                            amounts.totalCreditAmount.toLocaleString(navigator.language, {
                              minimumFractionDigits: 2,
                            }) !==
                              amounts.totalDebitAmount.toLocaleString(navigator.language, {
                                minimumFractionDigits: 2,
                              }) && (
                              <div
                                className={
                                  amounts.totalDebitAmount !== amounts.totalCreditAmount
                                    ? 'is-invalid'
                                    : ''
                                }
                              >
                                <div className="invalid-feedback">
                                  <Badge
                                    color="danger"
                                    style={{
                                      padding: '10px',
                                      marginBottom: '5px',
                                    }}
                                  >
                                    *Total Credit Amount and Total Debit Amount Should be Equal
                                  </Badge>
                                </div>
                              </div>
                            )}
                          {submitJournal &&
                            amounts.totalCreditAmount === 0 &&
                            amounts.totalDebitAmount === 0 && (
                              <div className="is-invalid">
                                <div className="invalid-feedback">
                                  <Badge
                                    color="danger"
                                    style={{
                                      padding: '10px',
                                      marginBottom: '5px',
                                    }}
                                  >
                                    *Total Amount Must Be Greater Than Zero
                                  </Badge>
                                </div>
                              </div>
                            )}
                          <Row>
                            <Col lg={12}>
                              <BootstrapTable
                                data={data}
                                version="4"
                                hover
                                keyField="id"
                                className="journal-create-table"
                              >
                                <TableHeaderColumn
                                  width="55"
                                  dataAlign="center"
                                  dataFormat={(cell, rows) => renderActions(cell, rows)}
                                ></TableHeaderColumn>
                                <TableHeaderColumn
                                  width={'400px'}
                                  dataField="transactionCategoryId"
                                  dataFormat={(cell, rows) => renderAccount(cell, rows)}
                                >
                                  {strings.ACCOUNT}
                                </TableHeaderColumn>
                                <TableHeaderColumn
                                  dataField="description"
                                  dataFormat={(cell, rows) => renderDescription(cell, rows)}
                                >
                                  {strings.DESCRIPTION}
                                </TableHeaderColumn>
                                <TableHeaderColumn
                                  dataField="contactId"
                                  dataFormat={(cell, rows) => renderContact(cell, rows)}
                                >
                                  {strings.CONTACT}
                                </TableHeaderColumn>
                                <TableHeaderColumn
                                  dataField="debitAmount"
                                  dataFormat={(cell, rows) => renderDebits(cell, rows)}
                                >
                                  {strings.DEBIT}
                                </TableHeaderColumn>
                                <TableHeaderColumn
                                  dataField="creditAmount"
                                  dataFormat={(cell, rows) => renderCredits(cell, rows)}
                                >
                                  {strings.CREDIT}
                                </TableHeaderColumn>
                              </BootstrapTable>
                            </Col>
                          </Row>

                          {data.length > 0 ? (
                            <Row>
                              <Col lg={4} className="ml-auto">
                                <div className="total-item p-2">
                                  <Row>
                                    <Col xs={4}></Col>
                                    <Col xs={4}>
                                      <h5 className="mb-0 text-right">{strings.Debit}</h5>
                                    </Col>
                                    <Col xs={4}>
                                      <h5 className="mb-0 text-right">{strings.Credit}</h5>
                                    </Col>
                                  </Row>
                                </div>
                                <div className="total-item p-2">
                                  <Row>
                                    <Col xs={4}>
                                      <h5 className="mb-0 text-right">{strings.SubTotal}</h5>
                                    </Col>
                                    <Col xs={4} className="text-right">
                                      <label className="mb-0">
                                        {universal_currency_list[0] && (
                                          <Currency
                                            value={amounts.subTotalDebitAmount}
                                            currencySymbol={
                                              universal_currency_list[0]
                                                ? universal_currency_list[0].currencyIsoCode
                                                : 'USD'
                                            }
                                          />
                                        )}
                                      </label>
                                    </Col>
                                    <Col xs={4} className="text-right">
                                      <label className="mb-0">
                                        {universal_currency_list[0] && (
                                          <Currency
                                            value={amounts.subTotalCreditAmount}
                                            currencySymbol={
                                              universal_currency_list[0]
                                                ? universal_currency_list[0].currencyIsoCode
                                                : 'USD'
                                            }
                                          />
                                        )}
                                      </label>
                                    </Col>
                                  </Row>
                                </div>
                                <div className="total-item p-2">
                                  <Row>
                                    <Col xs={4}>
                                      <h5 className="mb-0 text-right">{strings.Total}</h5>
                                    </Col>
                                    <Col xs={4} className="text-right">
                                      <label className="mb-0">
                                        {universal_currency_list[0] && (
                                          <Currency
                                            value={amounts.subTotalDebitAmount}
                                            currencySymbol={
                                              universal_currency_list[0]
                                                ? universal_currency_list[0].currencyIsoCode
                                                : 'USD'
                                            }
                                          />
                                        )}
                                      </label>
                                    </Col>
                                    <Col xs={4} className="text-right">
                                      <label className="mb-0">
                                        {universal_currency_list[0] && (
                                          <Currency
                                            value={amounts.subTotalCreditAmount}
                                            currencySymbol={
                                              universal_currency_list[0]
                                                ? universal_currency_list[0].currencyIsoCode
                                                : 'USD'
                                            }
                                          />
                                        )}
                                      </label>
                                    </Col>
                                  </Row>
                                </div>
                              </Col>
                            </Row>
                          ) : null}

                          <Row>
                            <Col lg={12} className="mt-5">
                              <FormGroup className="text-right form-action-btn">
                                <Button
                                  type="button"
                                  color="primary"
                                  className="btn-square mr-3"
                                  disabled={disabled}
                                  onClick={() => {
                                    trigger();
                                    if (errors && Object.keys(errors).length != 0)
                                      commonActions.fillManDatoryDetails();
                                    setCreateMore(false);
                                    setSubmitJournal(true);
                                    handleSubmit(onSubmit)();
                                  }}
                                >
                                  <i className="fa fa-dot-circle-o"></i>{' '}
                                  {disabled ? 'Creating...' : strings.Create}
                                </Button>
                                <Button
                                  type="button"
                                  color="primary"
                                  className="btn-square mr-3"
                                  onClick={() => {
                                    trigger();
                                    if (errors && Object.keys(errors).length != 0)
                                      commonActions.fillManDatoryDetails();
                                    setCreateMore(true);
                                    setSubmitJournal(true);
                                    handleSubmit(onSubmit)();
                                  }}
                                >
                                  <i className="fa fa-refresh"></i>{' '}
                                  {disabled ? 'Creating...' : strings.CreateandMore}
                                </Button>
                                <Button
                                  color="secondary"
                                  className="btn-square"
                                  onClick={() => {
                                    history.push('/admin/accountant/journal');
                                  }}
                                >
                                  <i className="fa fa-ban"></i> {strings.Cancel}
                                </Button>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Form>
                      </Col>
                    </Row>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateJournal);
