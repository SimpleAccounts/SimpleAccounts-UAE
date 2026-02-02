import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import DatePicker from 'react-datepicker';
import { CommonActions } from 'services/global';
import { selectOptionsFactory, selectStyles } from 'utils';
import * as ReceiptActions from '../../actions';
import * as ReceiptDetailActions from './actions';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { File, Trash2, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    contact_list: state.receipt.contact_list,
    invoice_list: state.receipt.invoice_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    receiptDetailActions: bindActionCreators(ReceiptDetailActions, dispatch),
    receiptActions: bindActionCreators(ReceiptActions, dispatch),
  };
};

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const detailReceiptSchema = z.object({
  receiptDate: z.date({
    required_error: 'Receipt date is required',
    invalid_type_error: 'Receipt date is required',
  }),
  referenceCode: z.string().min(1, 'Reference number is required'),
  contactId: z.union([z.number(), z.string()]).refine(val => val !== '' && val !== null, {
    message: 'Customer is required',
  }),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^[0-9]+$/, 'Please enter valid amount.'),
  receiptNo: z.union([z.number(), z.string()]).optional(),
  invoiceId: z.union([z.number(), z.string()]).optional().nullable(),
  unusedAmount: z.string().optional(),
});

const regEx = /^[0-9]+$/;
const regExBoth = /[a-zA-Z0-9]+$/;

/**
 * Normalize a contact option so label is always a string (API may return label as object with contactId, contactName, etc.).
 * Prevents "Objects are not valid as a React child" when react-select renders the option.
 */
export function normalizeContactOption(option) {
  if (option == null) return null;
  const value = option.value;
  const label = option.label;
  const stringLabel =
    typeof label === 'string'
      ? label
      : label != null && typeof label === 'object' && 'contactName' in label
        ? label.contactName
        : String(value ?? '');
  return { value, label: stringLabel };
}

/**
 * Normalize contact list options so each has a string label (safe for react-select).
 */
export function normalizeContactOptions(list) {
  if (!list || !list.length) return [];
  return list.map(opt => normalizeContactOption(opt) ?? opt);
}

const DetailReceipt = ({
  contact_list,
  invoice_list,
  commonActions,
  receiptDetailActions,
  receiptActions,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [currentReceiptId, setCurrentReceiptId] = useState(null);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(detailReceiptSchema),
    defaultValues: {
      receiptNo: '',
      contactId: '',
      referenceCode: '',
      receiptDate: new Date(),
      unusedAmount: '',
      amount: '',
      invoiceId: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const initializeData = useCallback(() => {
    const id = location?.state?.id;
    if (id) {
      receiptActions.getContactList(2);
      receiptActions.getInvoiceList();
      receiptDetailActions
        .getReceiptById(id)
        .then(res => {
          if (res.status === 200) {
            setCurrentReceiptId(id);
            const contactIdRaw = res.data.contactId;
            const contactIdPrimitive =
              contactIdRaw != null && typeof contactIdRaw === 'object' && 'contactId' in contactIdRaw
                ? contactIdRaw.contactId
                : contactIdRaw;
            reset({
              receiptNo: res.data.receiptNo || '',
              contactId: contactIdPrimitive ?? '',
              referenceCode: res.data.referenceCode || '',
              receiptDate: res.data.receiptDate ? new Date(res.data.receiptDate) : new Date(),
              unusedAmount: res.data.unusedAmount?.toString() || '',
              amount: res.data.amount?.toString() || '',
              invoiceId: res.data.invoiceId ? res.data.invoiceId : '',
            });
            setLoading(false);
          }
        })
        .catch(err => {
          commonActions.tostifyAlert('error', err ? err.data.message : 'Something Went Wrong');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [location?.state?.id, receiptActions, receiptDetailActions, commonActions, reset]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const onSubmit = data => {
    setDisabled(true);
    setDisableLeavePage(true);

    const { receiptDate, receiptNo, referenceCode, contactId, invoiceId, amount, unusedAmount } =
      data;

    const postData = {
      receiptId: currentReceiptId,
      receiptNo: receiptNo ? receiptNo : '',
      referenceCode: referenceCode ? referenceCode : '',
      receiptDate: receiptDate ? receiptDate : '',
      contactId: contactId && contactId !== null ? contactId : '',
      amount: amount ? amount : '',
      unusedAmount: unusedAmount ? unusedAmount : '',
      invoiceId: invoiceId && invoiceId !== null ? invoiceId : '',
    };

    receiptDetailActions
      .updateReceipt(postData)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert('success', res.data.message);
          navigate('/admin/income/receipt');
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert('error', err.data.message);
      });
  };

  const deleteReceipt = () => {
    const message1 = (
      <text>
        <b>Delete Income Receipt?</b>
      </text>
    );
    const message = 'This Income Receipt will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeReceipt}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeReceipt = () => {
    receiptDetailActions
      .deleteReceipt(currentReceiptId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Deleted Successfully'
          );
          navigate('/admin/income/receipt');
        }
      })
      .catch(err => {
        commonActions.tostifyAlert('error', err.data ? err.data.message : 'Deleted Unsuccessfully');
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  if (loading) {
    return <Loader />;
  }

  if (currentReceiptId == null) {
    return (
      <div className="detail-receipt-screen p-4">
        <p className="text-corp-text-secondary mb-3">No receipt selected.</p>
        <Button color="primary" onClick={() => navigate('/admin/income/receipt')}>
          Back to Customer Receipts
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="detail-receipt-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <File className="h-4 w-4" />
                        <span className="ml-2">{strings.UpdateReceipt}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="receiptNo">{strings.ReceiptNumber} </Label>
                              <Controller
                                name="receiptNo"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    id="receiptNo"
                                    placeholder={strings.ReceiptNumber}
                                    onChange={e => {
                                      if (e.target.value === '' || regExBoth.test(e.target.value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="receipt_date">
                                <span className="text-danger">* </span>
                                {strings.ReceiptDate}{' '}
                              </Label>
                              <Controller
                                name="receiptDate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    {...field}
                                    id="date"
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    placeholderText={strings.ReceiptDate}
                                    selected={field.value}
                                    onChange={date => field.onChange(date)}
                                    className={`form-control ${
                                      errors.receiptDate ? 'is-invalid' : ''
                                    }`}
                                  />
                                )}
                              />
                              {errors.receiptDate && (
                                <div className="invalid-feedback d-block">
                                  {errors.receiptDate.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="referenceCode">
                                <span className="text-danger">* </span>
                                {strings.ReferenceNumber}{' '}
                              </Label>
                              <Controller
                                name="referenceCode"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    id="referenceCode"
                                    placeholder={strings.ReferenceNumber}
                                    onChange={e => {
                                      if (e.target.value === '' || regExBoth.test(e.target.value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={`form-control ${
                                      errors.referenceCode ? 'is-invalid' : ''
                                    }`}
                                  />
                                )}
                              />
                              {errors.referenceCode && (
                                <div className="invalid-feedback">
                                  {errors.referenceCode.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="customer_name">
                                <span className="text-danger">* </span>
                                {strings.CustomerName}{' '}
                              </Label>
                              <Controller
                                name="contactId"
                                control={control}
                                render={({ field }) => {
                                  const id =
                                    field.value != null && typeof field.value === 'object' && 'contactId' in field.value
                                      ? field.value.contactId
                                      : field.value;
                                  const option =
                                    contact_list && contact_list.length
                                      ? (contact_list.find(
                                          opt => opt.value === +id || opt.value === id
                                        ) ?? null)
                                      : null;
                                  const safeOptions = contact_list?.length
                                    ? [{ value: '', label: `Select ${strings.CustomerName || 'Customer Name'}` }, ...normalizeContactOptions(contact_list)]
                                    : [];
                                  const safeValue = option ? normalizeContactOption(option) : null;
                                  return (
                                    <Select
                                      options={safeOptions}
                                      placeholder={strings.CustomerName}
                                      value={safeValue}
                                      onChange={option => {
                                        if (option && option.value != null) {
                                          field.onChange(option.value);
                                        } else {
                                          field.onChange('');
                                        }
                                      }}
                                      styles={selectStyles}
                                      className={errors.contactId ? 'is-invalid' : ''}
                                    />
                                  );
                                }}
                              />
                              {errors.contactId && (
                                <div className="invalid-feedback d-block">
                                  {errors.contactId.message}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="invoice">{strings.Invoice}</Label>
                              <Controller
                                name="invoiceId"
                                control={control}
                                render={({ field }) => (
                                  <Select
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
                                    className="select-default-width"
                                    placeholder={strings.InvoiceNumber}
                                    value={
                                      invoice_list &&
                                      invoice_list.find(option => option.value === +field.value)
                                    }
                                    onChange={option => {
                                      if (option && option.value) {
                                        field.onChange(option.value);
                                      } else {
                                        field.onChange('');
                                      }
                                    }}
                                    styles={selectStyles}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="mode">{strings.ModeTBD}</Label>
                              <Select
                                styles={selectStyles}
                                className="select-default-width"
                                options={[]}
                                id="mode"
                                name="mode"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="amount">
                                <span className="text-danger">* </span>
                                {strings.Amount}{' '}
                              </Label>
                              <Controller
                                name="amount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    id="amount"
                                    placeholder={strings.Amount}
                                    onChange={e => {
                                      if (e.target.value === '' || regEx.test(e.target.value)) {
                                        field.onChange(e);
                                      }
                                    }}
                                    className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                                  />
                                )}
                              />
                              {errors.amount && (
                                <div className="invalid-feedback">{errors.amount.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="unusedAmount">{strings.UnusedAmount}</Label>
                              <Controller
                                name="unusedAmount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    id="unusedAmount"
                                    placeholder={strings.UnusedAmount}
                                    onChange={e => {
                                      if (e.target.value === '' || regEx.test(e.target.value)) {
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
                          <Col
                            lg={12}
                            className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                          >
                            <FormGroup>
                              <Button color="danger" className="btn-square" onClick={deleteReceipt}>
                                <Trash2 className="h-4 w-4" />
                                {strings.Delete}
                              </Button>
                            </FormGroup>
                            <FormGroup className="text-right">
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                              >
                                <CircleDot className="h-4 w-4" />
                                {strings.Update}
                              </Button>
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => navigate('/admin/income/receipt')}
                              >
                                <Ban className="h-4 w-4" />
                                {strings.Cancel}
                              </Button>
                            </FormGroup>
                          </Col>
                        </Row>
                      </Form>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailReceipt);
