import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
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
  Label
} from 'reactstrap'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import { Formik } from 'formik';
import * as Yup from "yup";
import moment from 'moment'
import { CommonActions } from 'services/global'
import { selectOptionsFactory } from 'utils'
import * as ReceiptActions from '../../actions';
import * as ReceiptDetailActions from './actions';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components'
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
  return ({
    contact_list: state.receipt.contact_list,
    invoice_list: state.receipt.invoice_list
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    receiptDetailActions: bindActionCreators(ReceiptDetailActions, dispatch),
    receiptActions: bindActionCreators(ReceiptActions, dispatch)
  })
}
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
class DetailReceipt extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      language: window['localStorage'].getItem('language'),
      loading: true,
      dialog: null,
      initValue: {},
      current_receipt_id: null,
      disableLeavePage:false,
    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
  }


  componentDidMount = () => {
    this.initializeData()
  }

  initializeData = () => {
    if (this.props.location.state && this.props.location.state.id) {
      this.props.receiptActions.getContactList();
      this.props.receiptActions.getInvoiceList();
      this.props.receiptDetailActions.getReceiptById(this.props.location.state.id).then((res) => {
        // this.props.receiptActions.getTitleList()
        if (res.status === 200) {
          this.setState({
            current_receipt_id: this.props.location.state.id,
            initValue: {
              receiptNo: res.data.receiptNo,
              contactId: res.data.contactId ? res.data.contactId : '',
              referenceCode: res.data.referenceCode,
              receiptDate: res.data.receiptDate ? res.data.receiptDate : '',
              unusedAmount: res.data.unusedAmount,
              amount: res.data.amount,
              invoiceId: res.data.invoiceId ? res.data.invoiceId : ''
            },
            loading: false,
          })
        }
      }).catch((err) => {
        this.props.commonActions.tostifyAlert('error', err ? err.data.message : 'Something Went Wrong' )
        this.setState({ loading: false })
      })
    } else {
      this.props.history.push('admin/revenue/receipt')
    }
  }

  handleSubmit = (data) => {
		this.setState({ disabled: true, disableLeavePage:true, });
    const { current_receipt_id } = this.state
    const {
      receiptDate,
      receiptNo,
      referenceCode,
      contactId,
      invoiceId,
      amount,
      unusedAmount
    } = data

    const postData = {
      receiptId: current_receipt_id,
      receiptNo: receiptNo ? receiptNo : '',
      referenceCode: referenceCode ? referenceCode : '',
      receiptDate: receiptDate ? receiptDate : '',
      contactId: contactId && contactId !== null ? contactId : '',
      amount: amount ? amount : '',
      unusedAmount: unusedAmount ? unusedAmount : '',
      invoiceId: invoiceId && invoiceId !== null ? invoiceId : ''
    }
    this.props.receiptDetailActions.updateReceipt(postData).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert('success', res.data.message)
        this.props.history.push('/admin/revenue/receipt')
      }
    }).catch((err) => {
      this.setState({ createDisabled: false, loading: false });
      this.props.commonActions.tostifyAlert('error',  err.data.message )
    })
  }

  deleteReceipt = () => {
    const message1 =
        <text>
        <b>Delete Income Receipt?</b>
        </text>
        const message = 'This Income Receipt will be deleted permanently and cannot be recovered. ';
        this.setState({
      dialog: <ConfirmDeleteModal
        isOpen={true}
        okHandler={this.removeReceipt}
        cancelHandler={this.removeDialog}
        message={message}
        message1={message1}
      />
    })
  }

  removeReceipt = () => {
    const {current_receipt_id} = this.state;
    this.props.receiptDetailActions.deleteReceipt(current_receipt_id).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert(
          'success', 
          res.data ? res.data.message : 'Deleted Successfully'
        );
        this.props.history.push('/admin/revenue/receipt')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert(
        'error', 
        err.data ? err.data.message : 'Deleted Unsuccessfully'
        )
    })
  }

  removeDialog = () => {
    this.setState({
      dialog: null
    })
  }

  render() {
    strings.setLanguage(this.state.language);
    const { contact_list, invoice_list } = this.props
    const { loading, dialog, initValue } = this.state

    return (
      loading ==true? <Loader/> :
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
                        <i className="fa fa-file-o" />
                        <span className="ml-2">{strings.UpdateReceipt}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {dialog}
                  {loading ?
                    (
                      <Loader />
                    )
                    :
                    (
                      <Row>
                        <Col lg={12}>
                          <Formik
                            initialValues={initValue}
                            onSubmit={(values, { resetForm }) => {

                              this.handleSubmit(values)
                            }}
                            validationSchema={
                              Yup.object().shape({
                                receiptDate: Yup.date()
                                  .required("Receipt date is required"),
                                referenceCode: Yup.string()
                                  .required("Reference number is required"),
                                contactId: Yup.string()
                                  .required('Customer is required'),
                                amount: Yup.string()
                                  .required('Amount is required')
                                  .matches(/^[0-9]+$/, { message: "Please enter valid amount.", excludeEmptyString: false })

                              })}
                          >
                            {(props) => (
                              <Form onSubmit={props.handleSubmit}>
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="receiptNo">{strings.ReceiptNumber} </Label>
                                      <Input
                                        type="text"
                                        id="receiptNo"
                                        name="receiptNo"
                                        placeholder={strings.ReceiptNumber}
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('receiptNo')(option)}
                                        }}
                                        value={props.values.receiptNo}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="receipt_date"><span className="text-danger">* </span>{strings.ReceiptDate} </Label>
                                      <DatePicker
                                        id="date"
                                        name="receiptDate"
                                        showMonthDropdown
                                        showYearDropdown
                                        dateFormat="dd-MM-yyyy"
                                        dropdownMode="select"
                                        placeholderText={strings.ReceiptDate}
                                        value={props.values.receiptDate ? moment(props.values.receiptDate).format('DD-MM-YYYY') : ''}
                                        onChange={(value) => {
                                          props.handleChange("receiptDate")(value)
                                        }}
                                        className={`form-control ${props.errors.receiptDate && props.touched.receiptDate ? "is-invalid" : ""}`}
                                        />
                                        {props.errors.receiptDate && props.touched.receiptDate && (
                                          <div className="invalid-feedback">{props.errors.receiptDate}</div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="referenceCode"><span className="text-danger">* </span>{strings.ReferenceNumber} </Label>
                                      <Input
                                        type="text"
                                        id="referenceCode"
                                        name="referenceCode"
                                        placeholder={strings.ReferenceNumber}
                                        value={props.values.referenceCode}
                                        onChange={(option) => {
                                          if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('referenceCode')(option)}
                                        }}
                                        className={`form-control ${props.errors.referenceCode && props.touched.referenceCode ? "is-invalid" : ""}`}
                                        />
                                        {props.errors.referenceCode && props.touched.referenceCode && (
                                          <div className="invalid-feedback">{props.errors.referenceCode}</div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="customer_name"><span className="text-danger">* </span>{strings.CustomerName} </Label>
                                      <Select
                                        options={contact_list ? selectOptionsFactory.renderOptions('label', 'value', contact_list, 'Customer Name') : []}
                                        placeholder={strings.CustomerName}
                                        value={contact_list && contact_list.find((option) => option.value === +props.values.contactId)}
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            props.handleChange('contactId')(option.value)
                                          } else {
                                            props.handleChange('contactId')('')
                                          }
                                        }}
                                        className={`${props.errors.contactId && props.touched.contactId ? "is-invalid" : ""}`}
                                        />
                                        {props.errors.contactId && props.touched.contactId && (
                                          <div className="invalid-feedback">{props.errors.contactId}</div>
                                        )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="invoice">{strings.Invoice}</Label>
                                      <Select
                                      styles={customStyles}
                                        options={invoice_list ? selectOptionsFactory.renderOptions('label', 'value', invoice_list, 'Invoice Number') : []}
                                        className="select-default-width"
                                        placeholder={strings.InvoiceNumber}
                                        value={invoice_list && invoice_list.find((option) => option.value === +props.values.invoiceId)}
                                        onChange={(option) => {
                                          if (option && option.value) {
                                            props.handleChange('invoiceId')(option.value)
                                          } else {
                                            props.handleChange('invoiceId')('')

                                          }
                                        }}
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
                                      styles={customStyles}
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
                                      <Label htmlFor="amount"><span className="text-danger">* </span>{strings.Amount} </Label>
                                      <Input
                                      type="number"
min="0"
                                        id="amount"
                                        name="amount"
                                        placeholder={strings.Amount}
                                        onChange={(option) => { if (option.target.value === '' || this.regEx.test(option.target.value)){ props.handleChange('amount')(option) }}}
                                        value={props.values.amount}
                                        className={`form-control ${props.errors.amount && props.touched.amount ? "is-invalid" : ""}`}
    
                                      />
                                      {props.errors.amount && props.touched.amount && (
                                        <div className="invalid-feedback">{props.errors.amount}</div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg={4}>
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="unusedAmount">{strings.UnusedAmount}</Label>
                                      <Input
                                       type="number"
min="0"
                                        id="unusedAmount"
                                        name="unusedAmount"
                                        placeholder={strings.UnusedAmount}
                                        onChange={(option) => { if (option.target.value === '' || this.regEx.test(option.target.value)){ props.handleChange('unusedAmount')(option) }}}
                                        value={props.values.unusedAmount}
    
                                      />
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col lg={12} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
                                    <FormGroup>
                                      <Button color="danger" className="btn-square" onClick={this.deleteReceipt}>
                                        <i className="fa fa-trash"></i>{strings.Delete} 
                                </Button>
                                    </FormGroup>
                                    <FormGroup className="text-right">
                                      <Button type="submit" color="primary" className="btn-square mr-3">
                                        <i className="fa fa-dot-circle-o"></i>{strings.Update}
                                </Button>
                                      <Button color="secondary" className="btn-square"
                                        onClick={() => { this.props.history.push('/admin/revenue/receipt') }}>
                                        <i className="fa fa-ban"></i>{strings.Cancel} 
                                </Button>
                                    </FormGroup>
                                  </Col>
                                </Row>
                              </Form>
                            )
                            }
                          </Formik>

                        </Col>
                      </Row>
                    )


                  }

                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailReceipt)

