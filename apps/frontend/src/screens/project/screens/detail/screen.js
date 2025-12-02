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
  Label,
} from 'reactstrap'
import Select from 'react-select'

import { Formik } from 'formik';
import * as Yup from "yup";

import { ContactModal } from '../../sections'
import { Loader ,ConfirmDeleteModal } from 'components'

import * as ProjectActions from '../../actions'
import { toast } from 'react-toastify'

import {
  CommonActions
} from 'services/global'
import * as DetailProjectActions from './actions'
import { selectOptionsFactory } from 'utils'



import './style.scss'

const mapStateToProps = (state) => {
  return ({
    currency_list: state.project.currency_list,
    country_list: state.project.country_list,
    contact_list: state.project.contact_list,
    title_list: state.project.title_list
  })
}

const mapDispatchToProps = (dispatch) => {
  return ({
    projectActions: bindActionCreators(ProjectActions, dispatch),
    detailProjectActions: bindActionCreators(DetailProjectActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),

  })
}


const INVOICE_LANGUAGE_OPTIONS = [
  { value: 1, label: 'English' },
  // { value: 2, label: 'Arabic' }
]

class DetailProject extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      openContactModal: false,
      loading: true,
      dialog: null,
      selectedcontactId: null,
      selectedCurrency: null,
      selectedInvoiceLanguage: null,

      selectedcontactIdCountry: null,
      selectedcontactIdCurrency: null,
      selectedcontactIdTitle: null,
      current_project_id: null,
      initValue: {},
    }
    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;
  }

  // Show Invite User Modal
  showContactModal = () => {
    this.setState({ openContactModal: true })
  }
  // Cloase Confirm Modal
  closeContactModal = (res,data) => {
    if (res) {
      let val = {label: data.fullName,value: data.id}
      this.props.projectActions.getContactList();
      this.formRef.current.setFieldValue('contactId', val, true)
    }
    this.setState({ openContactModal: false })
  }

  componentDidMount = () => {
    if (this.props.location.state && this.props.location.state.id) {
      this.props.detailProjectActions.getProjectById(this.props.location.state.id).then((res) => {
        this.props.projectActions.getContactList()
        this.props.projectActions.getCountryList()
        this.props.projectActions.getCurrencyList()
        if (res.status === 200) {
          this.setState({
            current_project_id: this.props.location.state.id,
            initValue: {
              projectName: res.data.projectName,
              // invoiceLanguageCode: res.data.invoiceLanguageCode !== null ? {
              //   label: res.data.invoiceLanguageCode.id,
              //   value: res.data.invoiceLanguageCode.value
              // } : '',
              contactId:  res.data.contactId ? res.data.contactId : '',
              // contractPoNumber: res.data.contractPoNumber,
              // vatRegistrationNumber: res.data.vatRegistrationNumber,
              expenseBudget: res.data.expenseBudget,
              revenueBudget: res.data.revenueBudget,
              // currencyCode: res.data.currencyCode ? res.data.currencyCode : ''
            },
            loading: false,
          })
        }
      }).catch((err) => {
        this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
        this.setState({loading: false})
      })
    } else {
      this.props.history.push('/admin/master/project')
    }
  }


  
  // Show Success Toast
  success = (msg) => {
    toast.success(msg, {
      position: toast.POSITION.TOP_RIGHT
    })
  }

  // Create or Edit VAT
  projectHandleSubmit = (data) => {

    const {current_project_id} = this.state;
    const {
      projectName,
      // invoiceLanguageCode,
      contactId,
      // contractPoNumber,
      // vatRegistrationNumber,
      expenseBudget,
      revenueBudget,
      // currencyCode,
    } = data

    const postData = {
      projectId: current_project_id,
      projectName: projectName ? projectName: '',
      // invoiceLanguageCode: invoiceLanguageCode ? invoiceLanguageCode : '',
      contactId: contactId && contactId !== null ? contactId : '',
      // contractPoNumber: contractPoNumber ? contractPoNumber : '',
      // vatRegistrationNumber: vatRegistrationNumber ? vatRegistrationNumber : '',
      expenseBudget: expenseBudget ? expenseBudget : '',
      revenueBudget: revenueBudget ? revenueBudget : '',
      // currencyCode: currencyCode && currencyCode!== null ? currencyCode : ''
      // contractPoNumber: contractPoNumber ? contractPoNumber : ''
    }
    this.props.detailProjectActions.updateProject(postData).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert('success', 'Project Updated successfully!')
         this.props.history.push('/admin/master/project')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
    })
  }

  deleteProject = () => {
    const message1 =
    <text>
    <b>Delete Project?</b>
    </text>
    const message = 'This Project will be deleted permanently and cannot be recovered. ';
    this.setState({
      dialog: <ConfirmDeleteModal
        isOpen={true}
        okHandler={this.removeProject}
        cancelHandler={this.removeDialog}
        message={message}
        message1={message1}
      />
    })
  }

  removeProject = () => {
    const { current_project_id }= this.state;
    this.props.detailProjectActions.deleteProject(current_project_id).then((res) => {
      if(res.status === 200) {
        this.success('Project Deleted Successfully');
        this.props.history.push('/admin/master/project')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong' )
    })
  }

  removeDialog = () => {
    this.setState({
      dialog: null
    })
  }


  render() {
    const { currency_list, country_list,contact_list} = this.props
    const { initValue , loading , dialog} = this.state;
    return (
      loading ==true? <Loader/> :
<div>
      <div className="create-product-screen">
        <div className="animated fadeIn">
      {dialog}
          {loading ? 
          <Loader /> 
          :
         ( <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="nav-icon fas fa-project-diagram" />
                        <span className="ml-2">Update Project</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Formik
                        // enableReinitialize={true}
                        initialValues={initValue}
                        onSubmit={(values, { resetForm }) => {
                          this.projectHandleSubmit(values)
                          // resetForm(initValue)
                        }}
                        validationSchema={Yup.object().shape({
                          projectName: Yup.string()
                            .required("Project name is required"),
                          contactId: Yup.string()
                            .required("Contact name is required"),
                          // currencyCode: Yup.string()
                          //   .required("Currency is required"),
                          // invoiceLanguageCode: Yup.string()
                          //   .required("Invoice Language is required")
                        })}>
                        {(props) => (
                          <Form onSubmit={props.handleSubmit}>
                            <Row>
                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="projectName"><span className="text-danger">* </span>Project Name</Label>
                                  <Input
                                    type="text"
                                    id="name"
                                    name="projectName"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)){ props.handleChange('projectName')(option)}
                                    }}
                                    placeholder="Enter Project Name"
                                    value={props.values.projectName || ''}
                                    className={
                                      props.errors.projectName && props.touched.projectName
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.projectName && props.touched.projectName && (
                                    <div className="invalid-feedback">{props.errors.projectName}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="contactId"><span className="text-danger">* </span>Contact</Label>
                                  <Select
                                    options={contact_list ? selectOptionsFactory.renderOptions('label', 'value', contact_list,'Contact Name') : []}
                                    onChange={(option) => {
                                      this.setState({
                                        selectedContact: option.value
                                      })
                                        if (option && option.value) {
                                          props.handleChange('contactId')(option.value)
                                        } else {
                                          props.handleChange('contactId')('')
                                        }
                                      }}
                                    id="contactId"
                                    name="contactId"
                                    placeholder="Select Contact"
                                    value={contact_list && contact_list.find((option) => option.value === +props.values.contactId)}
                                    className={
                                      props.errors.contactId && props.touched.contactId
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.contactId && props.touched.contactId && (
                                    <div className="invalid-feedback">{props.errors.contactId}</div>
                                  )}
                                </FormGroup>
                                <FormGroup className="mb-1 text-right">
                                  <Button color="primary" type="button" className="btn-square " onClick={()=> {this.showContactModal()}}>
                                    <i className="fa fa-plus"></i> Add a Contact
                                      </Button>
                                </FormGroup>
                              </Col>

                            </Row>
                            {/* <Row>
                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="contractPoNumber">Contract PO Number</Label>
                                  <Input
                                    type="text"
                                    id="contractPoNumber"
                                    name="contractPoNumber"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('contractPoNumber')(option)}
                                    }}
                                    placeholder="Enter Contract PO Number"
                                    value={props.values.contractPoNumber}
                                    className={
                                      props.errors.contractPoNumber && props.touched.contractPoNumber
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.contractPoNumber && props.touched.contractPoNumber && (
                                    <div className="invalid-feedback">{props.errors.contractPoNumber}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="vatRegistrationNumber">VAT Registration Number</Label>
                                  <Input
                                    type="text"
                                    id="vatRegistrationNumber"
                                    name="vatRegistrationNumber"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('vatRegistrationNumber')(option)}
                                    }}
                                    placeholder="Enter VAT Registration Number"
                                    value={props.values.vatRegistrationNumber}
                                    className={
                                      props.errors.vatRegistrationNumber && props.touched.vatRegistrationNumber
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.vatRegistrationNumber && props.touched.vatRegistrationNumber && (
                                    <div className="invalid-feedback">{props.errors.vatRegistrationNumber}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="currencyCode">
                                    <span className="text-danger">* </span>Currency
                                      </Label>
                                  <Select
                                    options={currency_list ? selectCurrencyFactory.renderOptions('currencyName', 'currencyCode', currency_list, 'Currency') : []}
                                    onChange={(option) => {
                                      this.setState({
                                        selectedCurrency: option.value ? option.value : ''
                                      })
                                      if(option && option.value) {
                                        props.handleChange('currencyCode')(option.value)
                                      } else {
                                        props.handleChange('currencyCode')('')
                                      }
                                    }}
                                    placeholder="Select currencyCode"
                                    value={currency_list && selectCurrencyFactory.renderOptions('currencyName', 'currencyCode', currency_list, 'Currency').find((option) => option.value === +props.values.currencyCode)}
                                    id="currencyCode"
                                    name="currencyCode"
                                    className={
                                      props.errors.currencyCode && props.touched.currencyCode
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.currencyCode && props.touched.currencyCode && (
                                    <div className="invalid-feedback">{props.errors.currencyCode}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row> */}
                            <Row>
                              <Col lg={4}>
                                <FormGroup className="">
                                  <Label htmlFor="expenseBudget">Expense Budget</Label>
                                  <Input
                                    type="text"
                                    id="expenseBudget"
                                    name="expenseBudget"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regEx.test(option.target.value)){ props.handleChange('expenseBudget')(option)}
                                    }}
                                    placeholder="Enter Expense Budgets"
                                    value={props.values.expenseBudget}
                                    className={
                                      props.errors.expenseBudget && props.touched.expenseBudget
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.expenseBudget && props.touched.expenseBudget && (
                                    <div className="invalid-feedback">{props.errors.expenseBudget}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup className="">
                                  <Label htmlFor="revenueBudget">Revenue Budget</Label>
                                  <Input
                                    type="text"
                                    id="revenueBudget"
                                    name="revenueBudget"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regEx.test(option.target.value)){ props.handleChange('revenueBudget')(option)}
                                    }}
                                    placeholder="Enter VAT Revenue Budget"
                                    value={props.values.revenueBudget}
                                    className={
                                      props.errors.revenueBudget && props.touched.revenueBudget
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.revenueBudget && props.touched.revenueBudget && (
                                    <div className="invalid-feedback">{props.errors.revenueBudget}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup className="">
                                  <Label htmlFor="invoiceLanguageCode">
                                    <span className="text-danger"></span>Invoice Language(TBD)
                                      </Label>
                                  <Select
                                    options={INVOICE_LANGUAGE_OPTIONS}
                                    id="invoiceLanguageCode"
                                    onChange={(option) => {
                                      this.setState({
                                        selectedInvoiceLanguage: option.value
                                      })
                                      props.handleChange("invoiceLanguageCode")(option.value);
                                    }}
                                    placeholder="Select invoiceLanguageCode"
                                    value={this.state.selectedInvoiceLanguage}
                                    name="invoiceLanguageCode"
                                    className={
                                      props.errors.invoiceLanguageCode && props.touched.invoiceLanguageCode
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.invoiceLanguageCode && props.touched.invoiceLanguageCode && (
                                    <div className="invalid-feedback">{props.errors.invoiceLanguageCode}</div>
                                  )}
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col lg={12} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
                                <FormGroup>
                                  <Button color="danger" className="btn-square" onClick={this.deleteProject}>
                                    <i className="fa fa-trash"></i> Delete
                                      </Button>
                                </FormGroup>
                                <FormGroup className="text-right">
                                  <Button type="submit" color="primary" className="btn-square mr-3">
                                    <i className="fa fa-dot-circle-o"></i> Update
                                      </Button>
                                  <Button color="secondary" className="btn-square"
                                    onClick={() => { this.props.history.push('/admin/master/project') }}>
                                    <i className="fa fa-ban"></i> Cancel
                                      </Button>
                                </FormGroup>
                              </Col>
                            </Row>
                          </Form>
                        )}
                      </Formik>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
         )}
        </div>
        <ContactModal
          openContactModal={this.state.openContactModal}
          closeContactModal={(val,data) => { this.closeContactModal(val,data) }}
          createContact={this.props.projectActions.createProjectContact}
          // titleList={title_list}
          currencyList={currency_list}
					countryList={country_list}
					getStateList={this.props.projectActions.getStateList}
        />
      </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailProject)