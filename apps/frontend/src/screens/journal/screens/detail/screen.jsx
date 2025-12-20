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
  Badge,
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import dayjs from '@/utils/date';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectStyles } from 'utils';
import * as JournalActions from '../../actions';
import * as JournalDetailActions from './actions';
import { Loader, LeavePage, ConfirmDeleteModal, Currency } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { JOURNAL } from 'constants/types';

const mapStateToProps = state => {
  return {
    transaction_category_list: state.journal.transaction_category_list,
    currency_list: state.journal.currency_list,
    contact_list: state.journal.contact_list,
    vat_list: state.journal.vat_list,
    universal_currency_list: state.common.universal_currency_list,
    cancel_flag: state.journal.cancel_flag,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    journalActions: bindActionCreators(JournalActions, dispatch),
    journalDetailActions: bindActionCreators(JournalDetailActions, dispatch),
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

const detailJournalSchema = z.object({
  journalDate: z.date({ required_error: 'Journal date is required' }),
  journalReferenceNo: z.string().optional(),
  description: z.string().optional(),
  currencyCode: z.union([z.string(), z.number()]).optional(),
  journalLineItems: z
    .array(journalLineItemSchema)
    .min(2, 'Atleast Two Journal Debit and Credit Details is mandatory'),
});

const DetailJournal = ({
  commonActions,
  journalActions,
  journalDetailActions,
  transaction_category_list,
  currency_list,
  contact_list,
  universal_currency_list,
  history,
  location,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [currentJournalId, setCurrentJournalId] = useState(null);
  const [data, setData] = useState([]);
  const [submitJournal, setSubmitJournal] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [disabled2, setDisabled2] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [dialog, setDialog] = useState(null);
  const [idCount, setIdCount] = useState(0);
  const [amounts, setAmounts] = useState({
    subTotalDebitAmount: 0,
    totalDebitAmount: 0,
    totalCreditAmount: 0,
    subTotalCreditAmount: 0,
  });
  const [postingReferenceType, setPostingReferenceType] = useState('');

  const regEx = /^[0-9\d]+$/;
  const regExBoth = /[a-zA-Z0-9]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  const form = useForm({
    resolver: zodResolver(detailJournalSchema),
    defaultValues: {
      journalId: '',
      journalDate: '',
      journalReferenceNo: '',
      description: '',
      currencyCode: '',
      journalLineItems: [],
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
    if (location.state && location.state.id) {
      journalDetailActions
        .getJournalById(location.state.id)
        .then(res => {
          if (res.status === 200) {
            journalActions.getCurrencyList();
            journalActions.getTransactionCategoryList();
            commonActions.getCompanyDetails().then(action => {
              if (action && action.type && action.type.includes('fulfilled')) {
                setCompanyName(action.payload.companyName);
              }
            });
            journalActions.getContactList();

            const journalData = res.data.journalLineItems || [];
            const calculatedIdCount =
              journalData.length > 0
                ? Math.max.apply(
                    Math,
                    journalData.map(item => {
                      return item.id;
                    })
                  )
                : 0;

            setCurrentJournalId(location.state.id);
            setData(journalData);
            setIdCount(calculatedIdCount);
            setPostingReferenceType(res.data.postingReferenceType || '');

            reset({
              journalId: res.data.journalId,
              journalDate: res.data.journalDate ? res.data.journalDate : '',
              journalReferenceNo: res.data.journalReferenceNo ? res.data.journalReferenceNo : '',
              description: res.data.description ? res.data.description : '',
              currencyCode: res.data.currencyCode ? res.data.currencyCode : '',
              journalLineItems: journalData,
            });

            setAmounts({
              subTotalDebitAmount: res.data.subTotalDebitAmount || 0,
              totalDebitAmount: res.data.totalDebitAmount || 0,
              totalCreditAmount: res.data.totalCreditAmount || 0,
              subTotalCreditAmount: res.data.subTotalCreditAmount || 0,
            });

            setLoading(false);
          }
        })
        .catch(err => {
          setLoading(false);
        });
    } else {
      history.push('/admin/accountant/journal');
    }
  };

  const renderActions = (cell, rows) => {
    const values = getValues();
    return (
      <Button
        size="sm"
        disabled={
          values.postingReferenceType === 'MANUAL' || data.length > 2 ? false : true
        }
        className="btn-twitter btn-brand icon"
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
      transaction_category_list && transaction_category_list && transaction_category_list.length
        ? [
            {
              transactionCategoryId: '',
              transactionCategoryName: 'Select Account',
            },
            ...transaction_category_list,
          ]
        : [];

    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    const values = getValues();

    if (row && row.journalTransactionCategoryLabel === 'Bank') {
      return (
        <Controller
          name={`journalLineItems.${idx}.transactionCategoryId`}
          control={control}
          render={({ field }) => (
            <Input
              id="transactionCategoryId"
              disabled={true}
              value={
                row.journalTransactionCategoryLabel
                  ? row.transactionCategoryName == JOURNAL.AMOUNT_IN_TRANSIT
                    ? row.journalTransactionCategoryLabel
                    : row.transactionCategoryName
                  : ''
              }
              placeholder={strings.Select + strings.Account}
            ></Input>
          )}
        />
      );
    } else if (row && row.transactionCategoryName === 'Petty Cash') {
      return (
        <Controller
          name={`journalLineItems.${idx}.transactionCategoryId`}
          control={control}
          render={({ field }) => (
            <Input
              id="transactionCategoryId"
              disabled={true}
              value={
                row.transactionCategoryName + (companyName ? ' - ' + companyName : '')
                  ? row.transactionCategoryName + (companyName ? ' - ' + companyName : '')
                  : ''
              }
              placeholder={strings.Select + strings.Account}
            ></Input>
          )}
        />
      );
    } else {
      return (
        <Controller
          name={`journalLineItems.${idx}.transactionCategoryId`}
          control={control}
          render={({ field }) => (
            <Select
              styles={{
                menu: provided => ({ ...provided, zIndex: 9999 }),
              }}
              options={transactionCategoryList ? transactionCategoryList : []}
              id="transactionCategoryId"
              onChange={e => {
                selectItem(e.value, row, 'transactionCategoryId', idx);
              }}
              isDisabled={values.postingReferenceType === 'MANUAL' ? false : true}
              value={
                transactionCategoryList &&
                transactionCategoryList.length > 0 &&
                row.transactionCategoryName
                  ? transactionCategoryList
                      .find(item => {
                        return item.label === row.journalTransactionCategoryLabel;
                      })
                      ?.options?.find(i => {
                        return i.value === row.transactionCategoryId;
                      })
                  : row.transactionCategoryName
              }
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
          )}
        />
      );
    }
  };

  const renderDescription = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    const values = getValues();

    return (
      <Controller
        name={`journalLineItems.${idx}.description`}
        control={control}
        render={({ field }) => (
          <Input
            type="text"
            value={row['description'] !== '' ? row['description'] : ''}
            disabled={values.postingReferenceType === 'MANUAL' ? false : true}
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

    if (data && data != undefined) {
      data.map((obj, index) => {
        if (obj.id === row.id) {
          idx = index;
        }
        return obj;
      });
    }

    const values = getValues();

    switch (row && row.postingReferenceType ? row.postingReferenceType : '') {
      case 'MANUAL':
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
                disabled={values.postingReferenceType === 'MANUAL' ? false : true}
                value={row.contactId}
                placeholder={strings.Select + strings.Contact}
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
                {contactList
                  ? contactList.map(obj => {
                      return (
                        <option value={obj.value} key={obj.value}>
                          {obj && obj.label && obj.label.contactName ? obj.label.contactName : ''}
                        </option>
                      );
                    })
                  : ''}
              </Input>
            )}
          />
        );

      case 'BANK_ACCOUNT':
        return (
          <Controller
            name={`journalLineItems.${idx}.contactId`}
            control={control}
            render={({ field }) => (
              <Input
                disabled={values.postingReferenceType === 'MANUAL' ? false : true}
                value={'-'}
                placeholder={strings.Select + strings.Contact}
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
              ></Input>
            )}
          />
        );

      default:
        return (
          <Controller
            name={`journalLineItems.${idx}.contactId`}
            control={control}
            render={({ field }) => (
              <Input
                disabled={values.postingReferenceType === 'MANUAL' ? false : true}
                value={row.contactId ? row.contactId : '-'}
                placeholder={strings.Select + strings.Contact}
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
                {contactList
                  ? contactList.map(obj => {
                      return (
                        <option value={obj.value} key={obj.value}>
                          {obj && obj.label && obj.label.contactName ? obj.label.contactName : ''}
                        </option>
                      );
                    })
                  : '-'}
              </Input>
            )}
          />
        );
    }
  };

  const renderDebits = (cell, row) => {
    let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index;
      }
      return obj;
    });

    const values = getValues();

    return (
      <Controller
        name={`journalLineItems.${idx}.debitAmount`}
        control={control}
        render={({ field }) => (
          <>
            <Input
              type="number"
              min="0"
              value={row['debitAmount'] !== 0 ? row['debitAmount'] : 0}
              disabled={values.postingReferenceType === 'MANUAL' ? false : true}
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

    const values = getValues();

    return (
      <Controller
        name={`journalLineItems.${idx}.creditAmount`}
        control={control}
        render={({ field }) => (
          <>
            <Input
              type="number"
              min="0"
              value={row['creditAmount'] !== 0 ? row['creditAmount'] : 0}
              disabled={values.postingReferenceType === 'MANUAL' ? false : true}
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

  const deleteJournal = () => {
    const message1 = (
      <text>
        <b>Delete Journal?</b>
      </text>
    );
    const message = 'This Journal will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeJournal}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeJournal = () => {
    setDisabled1(true);
    setDisableLeavePage(true);
    journalDetailActions
      .deleteJournal(currentJournalId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Journal Deleted Successfully'
          );
          history.push('/admin/accountant/journal');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Journal Deleted Unsuccessfully'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const onSubmit = values => {
    if (amounts.totalCreditAmount !== amounts.totalDebitAmount) {
      return;
    }

    const processedData = [...data];
    processedData.map(item => {
      delete item.id;
      item.transactionCategoryId = item.transactionCategoryId ? item.transactionCategoryId : '';
      item.contactId = item.contactId ? item.contactId : '';
      return item;
    });

    let currency = '';
    if (values.currencyCode && values.currencyCode.value) {
      currency = values.currencyCode.value;
    } else {
      if (values.currencyCode) {
        currency = values.currencyCode;
      }
    }

    const postData = {
      journalId: values.journalId,
      journalDate: values.journalDate ? values.journalDate : '',
      journalReferenceNo: values.journalReferenceNo ? values.journalReferenceNo : '',
      description: values.description ? values.description : '',
      currencyCode: currency,
      subTotalCreditAmount: amounts.subTotalCreditAmount,
      subTotalDebitAmount: amounts.subTotalDebitAmount,
      totalCreditAmount: amounts.totalCreditAmount,
      totalDebitAmount: amounts.totalDebitAmount,
      journalLineItems: processedData,
    };

    setDisabled2(true);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Journal...');

    journalDetailActions
      .updateJournal(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled2(false);
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Journal Updated Successfully'
          );
          history.push('/admin/accountant/journal');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Journal Updated Unsuccessfully'
        );
      });
  };

  const values = getValues();
  const { state } = location;

  return loading == true ? (
    <Loader loadingMsg={loadingMsg || 'Loading...'} />
  ) : (
    <div>
      <div className="detail-journal-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="fa fa-diamond" />
                        <span className="ml-2">
                          {postingReferenceType !== 'MANUAL'
                            ? strings.ViewJournal
                            : strings.UpdateJournal}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  {loading ? (
                    <Loader />
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
                                      className="form-control"
                                      id="journalDate"
                                      name="journalDate"
                                      placeholderText={strings.JournalDate}
                                      disabled={
                                        values.postingReferenceType === 'MANUAL' ? false : true
                                      }
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="dd-MM-yyyy"
                                      minDate={new Date()}
                                      dropdownMode="select"
                                      autoComplete="off"
                                      value={field.value ? dayjs(field.value).format('DD-MM-YYYY') : ''}
                                      onChange={date => field.onChange(date)}
                                    />
                                  )}
                                />
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
                                      id="journalReferenceNo"
                                      name="journalReferenceNo"
                                      disabled
                                      placeholder={strings.ReceiptNumber}
                                      {...field}
                                    />
                                  )}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col lg={8}>
                              <FormGroup className="mb-3">
                                <Label htmlFor="description">{strings.Notes}</Label>
                                <Controller
                                  name="description"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="textarea"
                                      name="description"
                                      id="description"
                                      rows="5"
                                      disabled={
                                        values.postingReferenceType === 'MANUAL' ? false : true
                                      }
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
                                      isDisabled={true}
                                      value={
                                        currency_list &&
                                        selectCurrencyFactory.renderOptions(
                                          'currencyName',
                                          'currencyCode',
                                          currency_list,
                                          'Currency'
                                        )?.[1]
                                      }
                                      onChange={option => {
                                        if (option && option.value) {
                                          field.onChange(option);
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
                          {values.postingReferenceType === 'MANUAL' && <hr />}
                          <Row>
                            <Col lg={12} className="mb-3">
                              {values.postingReferenceType === 'MANUAL' && (
                                <Button color="primary" className="btn-square mr-3" onClick={addRow}>
                                  <i className="fa fa-plus"></i> {strings.Addmore}
                                </Button>
                              )}
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
                            amounts.totalCreditAmount.toFixed(2) !==
                              amounts.totalDebitAmount.toFixed(2) && (
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
                                  dataField="transactionCategoryId"
                                  width="400"
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
                            <Col
                              lg={12}
                              className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                            >
                              <FormGroup>
                                {values.postingReferenceType === 'MANUAL' && (
                                  <Button
                                    type="button"
                                    color="danger"
                                    className="btn-square"
                                    disabled={disabled1}
                                    onClick={deleteJournal}
                                  >
                                    <i className="fa fa-trash"></i>{' '}
                                    {disabled1 ? 'Deleting...' : strings.Delete}
                                  </Button>
                                )}
                              </FormGroup>
                              <FormGroup className="text-right">
                                {values.postingReferenceType === 'MANUAL' && (
                                  <Button
                                    type="button"
                                    color="primary"
                                    disabled={disabled2}
                                    className="btn-square mr-3"
                                    onClick={() => {
                                      setSubmitJournal(true);
                                      handleSubmit(onSubmit)();
                                    }}
                                  >
                                    <i className="fa fa-dot-circle-o"></i>{' '}
                                    {disabled2 ? 'Updating...' : strings.Update}
                                  </Button>
                                )}
                                <Button
                                  color="secondary"
                                  className="btn-square"
                                  onClick={() => {
                                    journalActions.setCancelFlag(true);
                                    history.push('/admin/accountant/journal');
                                    if (state && state.renderURL) {
                                      history.push(state.renderURL, {
                                        id: state.renderId,
                                        isCNWithoutProduct: state.renderCN,
                                        expenseId: state.renderId,
                                      });
                                    }
                                  }}
                                >
                                  <i className="fa fa-ban"></i>{' '}
                                  {disabled1 ? 'Deleting...' : strings.Cancel}
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailJournal);
