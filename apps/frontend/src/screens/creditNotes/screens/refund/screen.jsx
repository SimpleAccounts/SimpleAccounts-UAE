import React from 'react';
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
import * as CustomerRecordPaymentActions from './actions';
import * as CnActions from '../../actions';
import { CustomerModal } from '../../sections';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import { selectOptionsFactory } from 'utils';
import './style.scss';
import dayjs from '@/utils/date';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Textarea } from '@/components/ui/textarea';
import { BookUser, Upload, X, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    contact_list: state.customer_invoice.contact_list,
    customer_list: state.customer_invoice.customer_list,
    deposit_list: state.customer_invoice.deposit_list,
    pay_mode: state.customer_invoice.pay_mode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    cnActions: bindActionCreators(CnActions, dispatch),
    CustomerRecordPaymentActions: bindActionCreators(CustomerRecordPaymentActions, dispatch),
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
const refundSchema = maxAmount =>
  z.object({
    receiptNo: z.string().optional(),
    receiptDate: z.any().refine(val => val !== null && val !== '', {
      message: 'Payment date is required',
    }),
    contactId: z.any(),
    amount: z
      .string()
      .min(1, 'Amount cannot be empty or 0')
      .refine(val => parseFloat(val) > 0, {
        message: 'Amount cannot be empty or 0',
      })
      .refine(val => parseFloat(val) <= maxAmount, {
        message: 'Amount cannot More than the Credit Amount',
      }),
    payMode: z
      .object({
        label: z.string(),
        value: z.string(),
      })
      .refine(val => val && val.value, {
        message: 'Payment mode is required',
      }),
    notes: z.string().optional(),
    depositeTo: z
      .object({
        label: z.string(),
        value: z.any(),
      })
      .refine(val => val && val.value, {
        message: 'Deposit to is required',
      }),
    referenceCode: z.string().optional(),
    attachmentFile: z
      .any()
      .optional()
      .refine(
        value => {
          if (!value || !value.name) return true;
          const supportedFormats = [
            'image/png',
            'image/jpeg',
            'text/plain',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ];
          return supportedFormats.includes(value.type);
        },
        {
          message: '*Unsupported File Format',
        }
      )
      .refine(
        value => {
          if (!value || !value.size) return true;
          return value.size <= 1024000;
        },
        {
          message: '*File Size is too large',
        }
      ),
    paidInvoiceListStr: z.array(z.any()).optional(),
    receiptAttachmentDescription: z.string().optional(),
    receiptNumber: z.string().optional(),
  });

class RefundClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language'),
      loading: false,
      dialog: false,
      amount: this.props.location.state.id.dueAmount,
      invoiceId: this.props.location.state.id.id,
      isCNWithoutProduct: this.props.location.state.id.isCNWithoutProduct,
      contactType: 2,
      openCustomerModal: false,
      disabled: false,
      invoiceNumber: '-',
      showInvoiceNumber: false,
      receiptNumber: '',
      loadingMsg: 'Loading...',
      creditNoteDate: this.props.location.state.id.invoiceDate,
    };

    this.uploadFile = null;
    this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
  }

  componentDidMount = () => {
    this.initializeData();
  };

  initializeData = () => {
    Promise.all([
      this.props.cnActions.getDepositList(),
      this.props.cnActions.getPaymentMode(),
      this.props.cnActions.getCustomerList(this.state.contactType),
    ]);
    this.getReceiptNo();

    // Get invoice number & credit note number
    this.props.cnActions.getInvoicesForCNById(this.props.location.state.id.id).then(res => {
      if (res.status === 200) {
        if (res.data.length && res.data.length !== 0) {
          this.setState({
            invoiceNumber: res.data[0].invoiceNumber,
            receiptNumber: res.data[0].creditNoteNumber,
            showInvoiceNumber: true,
          });
        }
      }
    });
  };

  getReceiptNo = () => {
    this.props.CustomerRecordPaymentActions.getReceiptNo(this.props.location.state.id.id).then(
      res => {
        if (res.status === 200) {
          if (this.props.setValue) {
            this.props.setValue('receiptNo', res.data, { shouldValidate: true });
          }
        }
      }
    );
  };

  handleSubmit = data => {
    this.setState({ disabled: true });
    const { invoiceId } = this.state;
    const { receiptNo, receiptDate, contactId, amount, depositeTo, payMode, notes, referenceCode } =
      data;

    let formData = new FormData();
    if (this.state.isCNWithoutProduct === true) {
      formData.append('creditNoteId', this.props.location.state.id.id);
      formData.append('amountReceived', amount !== null ? amount : '');
      formData.append('notes', notes !== null ? notes : '');
      formData.append('depositeTo', depositeTo !== null ? depositeTo.value : '');
      formData.append('payMode', payMode !== null ? payMode.value : '');
      if (contactId) {
        formData.append('contactId', contactId);
      }
      formData.append('type', '7');
      formData.append(
        'paymentDate',
        typeof receiptDate === 'string' ? dayjs(receiptDate, 'DD/MM/YYYY').toDate() : receiptDate
      );
      this.setState({ loading: true, loadingMsg: 'Credit Refunding...' });
      this.props.CustomerRecordPaymentActions.recordPaymentCNWithoutInvoice(formData)
        .then(res => {
          this.props.commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Refund Recorded successfully'
          );
          this.props.history.push('/admin/income/credit-notes');
          this.setState({ loading: false });
        })
        .catch(err => {
          this.setState({ disabled: false, loading: false });
          this.props.commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Credit Refund Unsuccessfully.'
          );
        });
    } else {
      formData.append('isCNWithoutProduct', false);
      formData.append('creditNoteId', this.props.location.state.id.id);
      formData.append('amountReceived', amount !== null ? amount : '');
      formData.append('notes', notes !== null ? notes : '');
      formData.append('type', '7');
      formData.append('invoiceId', this.state.invoiceId);
      formData.append('depositTo', depositeTo !== null ? depositeTo.value : '');
      formData.append('payMode', payMode !== null ? payMode.value : '');
      if (contactId) {
        formData.append('contactId', contactId);
      }
      formData.append(
        'paymentDate',
        typeof receiptDate === 'string' ? dayjs(receiptDate, 'DD/MM/YYYY').toDate() : receiptDate
      );
      if (this.uploadFile?.files?.[0]) {
        formData.append('attachmentFile', this.uploadFile?.files?.[0]);
      }
      this.setState({ loading: true, loadingMsg: ' Payment Refunding...' });
      this.props.CustomerRecordPaymentActions.recordPayment(formData)
        .then(res => {
          this.props.commonActions.tostifyAlert(
            'success',
            res.data ? 'Refund Recorded Successfully!' : res.data.message
          );
          this.props.history.push('/admin/income/credit-notes');
          this.setState({ loading: false });
        })
        .catch(err => {
          this.setState({ disabled: false, loading: false });
          this.props.commonActions.tostifyAlert(
            'error',
            err && err.data ? err.data.message : 'Credit Refund Unsuccessfully.'
          );
        });
    }
  };

  openCustomerModal = e => {
    e.preventDefault();
    this.setState({ openCustomerModal: true });
  };

  getCurrentUser = data => {
    let option;
    if (data.label || data.value) {
      option = data;
    } else {
      option = {
        label: `${data.fullName}`,
        value: data.id,
      };
    }
    if (this.props.setValue) {
      this.props.setValue('contactId', option.value, { shouldValidate: true });
    }
  };

  closeCustomerModal = res => {
    if (res) {
      this.props.cnActions.getCustomerList(this.state.contactType);
    }
    this.setState({ openCustomerModal: false });
  };

  showInvoiceNumber = () => {
    return (
      this.state.showInvoiceNumber && (
        <Col lg={4}>
          <FormGroup className="mb-3">
            <Label htmlFor="project">{strings.InvoiceNumber}</Label>
            <Input
              disabled
              id="invoiceNumber"
              name="invoiceNumber"
              value={this.state.invoiceNumber}
            />
          </FormGroup>
        </Col>
      )
    );
  };

  render() {
    strings.setLanguage(this.state.language);
    const { loading, dialog, loadingMsg } = this.state;
    const {
      pay_mode,
      customer_list,
      deposit_list,
      control,
      errors,
      handleSubmit,
      setValue,
      watch,
    } = this.props;

    let tmpcustomer_list = [];

    customer_list.map(item => {
      let obj = { label: item.label.contactName, value: item.value };
      tmpcustomer_list.push(obj);
    });

    const fileName = watch('attachmentFile')?.name;

    return loading === true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div className="detail-customer-invoice-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <BookUser className="h-4 w-4" />
                        <span className="ml-2">{strings.RefundForCreditNote}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  <Row>
                    <Col lg={12}>
                      <Form onSubmit={handleSubmit(this.handleSubmit)}>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="contactId">
                                <span className="text-danger">* </span>
                                {strings.CustomerName}
                              </Label>
                              <Controller
                                name="contactId"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    styles={customStyles}
                                    id="contactId"
                                    isDisabled
                                    value={
                                      tmpcustomer_list &&
                                      tmpcustomer_list.find(
                                        option =>
                                          option.value === +this.props.location.state.id.contactId
                                      )
                                    }
                                    className={errors.contactId ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.contactId && (
                                <div className="invalid-feedback">{errors.contactId.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                          {this.state.isCNWithoutProduct !== true && this.showInvoiceNumber()}
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="amount">
                                <span className="text-danger">* </span> {strings.AmountRefund}
                              </Label>
                              <Controller
                                name="amount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    min={0}
                                    maxLength="14,2"
                                    max={this.state.amount}
                                    id="amount"
                                    onChange={e => {
                                      if (
                                        e.target.value === '' ||
                                        this.regDecimal.test(e.target.value)
                                      ) {
                                        field.onChange(e.target.value);
                                      }
                                    }}
                                    placeholder={strings.AmounttoRefund}
                                    className={errors.amount ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.amount && (
                                <div className="invalid-feedback">{errors.amount.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <hr />
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="receiptDate">
                                <span className="text-danger">* </span>
                                {strings.RefundDate}
                              </Label>
                              <Controller
                                name="receiptDate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    {...field}
                                    id="receiptDate"
                                    placeholderText={strings.RefundDate}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="dd-MM-yyyy"
                                    dropdownMode="select"
                                    minDate={
                                      new Date(
                                        dayjs(this.state.creditNoteDate, 'YYYY-MM-DD').format()
                                      )
                                    }
                                    selected={field.value}
                                    onChange={date => field.onChange(date)}
                                    className={`form-control ${
                                      errors.receiptDate ? 'is-invalid' : ''
                                    }`}
                                  />
                                )}
                              />
                              {errors.receiptDate && (
                                <div className="invalid-feedback">{errors.receiptDate.message}</div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="payMode">
                                <span className="text-danger">* </span> {strings.RefundMode}
                              </Label>
                              <Controller
                                name="payMode"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={
                                      pay_mode
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            pay_mode,
                                            'Mode'
                                          )
                                        : []
                                    }
                                    placeholder={strings.Select + strings.RefundMode}
                                    id="payMode"
                                    className={errors.payMode ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.payMode && (
                                <div className="invalid-feedback">{errors.payMode.message}</div>
                              )}
                            </FormGroup>
                          </Col>{' '}
                          <Col lg={4}>
                            <FormGroup className="mb-3">
                              <Label htmlFor="depositeTo">
                                <span className="text-danger">* </span> {strings.RefundFrom}
                              </Label>
                              <Controller
                                name="depositeTo"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={deposit_list}
                                    placeholder={strings.Select + strings.RefundFrom}
                                    id="depositeTo"
                                    className={errors.depositeTo ? 'is-invalid' : ''}
                                  />
                                )}
                              />
                              {errors.depositeTo && (
                                <div className="invalid-feedback">{errors.depositeTo.message}</div>
                              )}
                            </FormGroup>
                          </Col>{' '}
                        </Row>
                        <hr />

                        <Row>
                          <Col lg={8}>
                            <FormGroup className="py-2">
                              <Label htmlFor="notes">{strings.RefundNotes}</Label>
                              <br />
                              <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                  <Textarea
                                    {...field}
                                    style={{ width: '870px' }}
                                    className="textarea"
                                    maxLength={255}
                                    id="notes"
                                    rows={2}
                                    placeholder={strings.RefundNotes}
                                  />
                                )}
                              />
                            </FormGroup>
                            <Row>
                              <Col lg={6}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="receiptNumber">{strings.ReferenceNumber}</Label>
                                  <Input
                                    type="text"
                                    maxLength="20"
                                    id="receiptNumber"
                                    name="receiptNumber"
                                    value={this.state.receiptNumber}
                                    placeholder={strings.ReceiptNumber}
                                    readOnly
                                  />
                                </FormGroup>
                              </Col>
                              <Col lg={6}>
                                <FormGroup className="mb-3">
                                  <Controller
                                    name="attachmentFile"
                                    control={control}
                                    render={({ field }) => (
                                      <div>
                                        <Label>{strings.ReceiptAttachment}</Label> <br />
                                        <Button
                                          color="primary"
                                          onClick={() => {
                                            document.getElementById('fileInput').click();
                                          }}
                                          className="btn-square mr-3"
                                        >
                                          <Upload className="h-4 w-4" /> {strings.upload}
                                        </Button>
                                        <input
                                          id="fileInput"
                                          ref={ref => {
                                            this.uploadFile = ref;
                                          }}
                                          type="file"
                                          style={{ display: 'none' }}
                                          onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              field.onChange(file);
                                            }
                                          }}
                                        />
                                        {fileName && (
                                          <div>
                                            <X
                                              className="h-4 w-4 cursor-pointer"
                                              onClick={() => {
                                                field.onChange(null);
                                                if (this.uploadFile) {
                                                  this.uploadFile.value = '';
                                                }
                                              }}
                                            />{' '}
                                            {fileName}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  />
                                  {errors.attachmentFile && (
                                    <div className="invalid-file">
                                      {errors.attachmentFile.message}
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                            <FormGroup className="mb-3">
                              <Label htmlFor="receiptAttachmentDescription">
                                {strings.AttachmentDescription}
                              </Label>
                              <br />
                              <Controller
                                name="receiptAttachmentDescription"
                                control={control}
                                render={({ field }) => (
                                  <Textarea
                                    {...field}
                                    className="textarea"
                                    maxLength={250}
                                    style={{ width: '870px' }}
                                    id="receiptAttachmentDescription"
                                    rows={2}
                                    placeholder={strings.ReceiptAttachmentDescription}
                                  />
                                )}
                              />
                            </FormGroup>
                          </Col>

                          <Col
                            lg={12}
                            className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                          >
                            <FormGroup className="text-right w-100">
                              <Button
                                type="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={this.state.disabled}
                                onClick={() => {
                                  if (errors && Object.keys(errors).length !== 0) {
                                    this.props.commonActions.fillManDatoryDetails();
                                  }
                                }}
                              >
                                <CircleDot className="h-4 w-4" />{' '}
                                {this.state.disabled ? 'Refunding...' : strings.RefundPayment}
                              </Button>
                              <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  if (this.props?.location?.state?.id?.renderURL) {
                                    this.props.history.push(
                                      `${this.props?.location?.state?.id?.renderURL}`,
                                      {
                                        id: this.props?.location?.state?.id?.renderID,
                                        isCNWithoutProduct:
                                          this.props?.location?.state?.id?.isCNWithoutProduct,
                                      }
                                    );
                                  } else this.props.history.push('/admin/income/credit-notes');
                                }}
                              >
                                <Ban className="h-4 w-4" /> {strings.Cancel}
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
        <CustomerModal
          openCustomerModal={this.state.openCustomerModal}
          closeCustomerModal={e => {
            this.closeCustomerModal(e);
          }}
          getCurrentUser={e => this.getCurrentUser(e)}
          createCustomer={this.props.cnActions.createCustomer}
          currency_list={this.props.currency_list}
          country_list={this.props.country_list}
          getStateList={this.props.cnActions.getStateList}
        />
        {this.state.disableLeavePage ? '' : <LeavePage />}
      </div>
    );
  }
}

// Wrapper component to use React Hook Form
const Refund = props => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(refundSchema(props.location?.state?.id?.dueAmount || 0)),
    defaultValues: {
      receiptNo: '',
      receiptDate: new Date(),
      contactId: props.location?.state?.id?.contactId,
      amount: props.location?.state?.id?.dueAmount?.toString() || '',
      payMode: { label: 'CASH', value: 'CASH' },
      notes: '',
      depositeTo: { label: 'Petty Cash', value: 47 },
      referenceCode: '',
      attachmentFile: null,
      paidInvoiceListStr: [],
      receiptAttachmentDescription: '',
      receiptNumber: '',
    },
  });

  return (
    <RefundClass
      {...props}
      control={control}
      handleSubmit={handleSubmit}
      setValue={setValue}
      watch={watch}
      errors={errors}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Refund);
