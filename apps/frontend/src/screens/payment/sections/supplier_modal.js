import React from 'react'
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap'

import { Formik } from 'formik';
import * as Yup from "yup";

import { toast } from 'react-toastify'

import PhoneInput  from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'
import Select from 'react-select'
import {
  selectCurrencyFactory,
  selectOptionsFactory
} from 'utils'
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);
class SupplierModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      language: window['localStorage'].getItem('language'),
      loading: false,
      initValue: {
        firstName: '',
        lastName: '',
        middleName: '',
        contactType: 1,
        mobileNumber: '',
        organization: '',
        poBoxNumber: '',
        postZipCode: '',
        stateId: '',
        telephone: '',
        vatRegistrationNumber: '',
        billingEmail: '',
        city: '',
        contractPoNumber: '',
        countryId: '',
        currencyCode: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
      },
    }
    this.formikRef = React.createRef()
    this.regExAlpha = /^[a-zA-Z]+$/
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regEx = /^[0-9\d]+$/;

  }

  getData = (data) => {
    let temp = {}
    for(let item in data) {
      if(typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`]
      } else {
        temp[`${item}`] = data[`${item}`].value
      }
    }
    return temp
  }

  // Create or Contact
  handleSubmit = (data,resetForm,setSubmitting) => {
    const postData = this.getData(data)
    this.props.createSupplier(postData).then((res) => {
      if (res.status === 200) {
        resetForm();
        this.props.closeSupplierModal(true)
        this.props.getCurrentUser(res.data)
      }
    }).catch((err) => {
      this.displayMsg();
      this.formikRef.current.setSubmitting(false);
    })
  }

  displayMsg = () => {
    toast.error('Something Went Wrong... ', {
      position: toast.POSITION.TOP_RIGHT
    })
  }

  getStateList = (countryCode) => {
    if(countryCode) {
    this.props.getStateList(countryCode).then((res) => {
      if(res.status === 200) {
        this.setState({
          state_list: res.data
        })
      }
    })
  } else {
    this.setState({
      state_list: []
    })
  }
}

  render() {
    strings.setLanguage(this.state.language);
    const { openSupplierModal, closeSupplierModal, currency_list, country_list  } = this.props
    const { initValue,state_list } = this.state
    return (
      <div className="contact-modal-screen">
        <Modal isOpen={openSupplierModal}
          className="modal-success contact-modal"
        >
          <Formik
            ref={this.formikRef}
            initialValues={initValue}
            onSubmit={(values, { resetForm , setSubmitting}) => {
              this.handleSubmit(values,resetForm)
            }}
            validationSchema={
              Yup.object().shape({
                firstName: Yup.string()
                  .required("First name is required"),
                lastName: Yup.string()
                  .required("Last name is required"),
                middleName: Yup.string()
                  .required("Middle name is required"),
                  email: Yup.string()
                  .required("Email is required")
                  .email("Invalid email"),
                telephone: Yup.number()
                  .required("Telephone number is required"),
                  mobileNumber: Yup.string()
                  .required("Mobile number is required"),
                 //     addressLine1: Yup.string()
                //       .required("Address is required"),
                countryId: Yup.string().required("Country is required")
                  .nullable(),
                  stateId: Yup.string()
                  .when('countryId', {
                    is: (val) => val ? true : false,
                    then: Yup.string()
                      .required('State is required')
                  }),
                //     city: Yup.string()
                //       .required("City is required"),
                postZipCode: Yup.string()
                  .required("Postal code is required"),
                //     billingEmail: Yup.string()
                //       .required("Billing Email is required")
                //       .email('Invalid Email'),
                //     contractPoNumber: Yup.number()
                //       .required("Contract PoNumber is required"),
                vatRegistrationNumber: Yup.string()
                  .required("Tax registration number is required"),
              })
            }
          >
            {(props) => {
                const { isSubmitting } = props;
              return (
              <Form name="simpleForm" onSubmit={props.handleSubmit}>
                <ModalHeader toggle={this.toggleDanger}>{strings.NewSupplier}</ModalHeader>
                <ModalBody>
                  <Row>
                    <Col lg="4">
                      <FormGroup>
                        <Label htmlFor="firstName"><span className="text-danger">* </span>{strings.FirstName}</Label>
                        <Input
                          type="text"
                          id="firstName"
                          name="firstName"
                          onChange={(option) => { 
                            if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('firstName')(option) } }}
                          placeholder={strings.Enter+strings.FirstName}
                          value={props.values.firstName}
                          className={
                            props.errors.firstName && props.touched.firstName
                              ? "is-invalid"
                              : ""
                          }
                        />
                        {props.errors.firstName && props.touched.firstName && (
                          <div className="invalid-feedback">{props.errors.firstName}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col lg="4">
                      <FormGroup>
                        <Label htmlFor="lastName"><span className="text-danger">* </span>{strings.MiddleName}</Label>
                        <Input
                          type="text"
                          id="middleName"
                          name="middleName"
                          onChange={(option) => { 
                            if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('middleName')(option) } }}
                          placeholder={strings.Enter+strings.MiddleName}
                          value={props.values.middleName}
                          className={
                            props.errors.middleName && props.touched.middleName
                              ? "is-invalid"
                              : ""
                          }
                        />
                        {props.errors.middleName && props.touched.middleName && (
                          <div className="invalid-feedback">{props.errors.middleName}</div>
                        )}
                      </FormGroup>
                    </Col>
                    <Col lg="4">
                      <FormGroup>
                        <Label htmlFor="lastName"><span className="text-danger">* </span>{strings.LastName}</Label>
                        <Input
                          type="text"
                          id="lastName"
                          name="lastName"
                          onChange={(option) => { 
                            if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('lastName')(option) } }}
                          placeholder={strings.Enter+strings.LastName}
                          value={props.values.lastName}
                          className={
                            props.errors.lastName && props.touched.lastName
                              ? "is-invalid"
                              : ""
                          }
                        />
                        {props.errors.lastName && props.touched.lastName && (
                          <div className="invalid-feedback">{props.errors.lastName}</div>
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                  <hr />
                    <h4 className="mb-3 mt-3">{strings.ContactDetails}</h4>
                    <Row className="row-wrapper">
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="organization ">
                           {strings.OrganizationName}
                          </Label>
                          <Input
                            type="text"
                            id="organization"
                            name="organization"
                            onChange={(value) => {
                              props.handleChange("organization")(value);
                            }}
                            value={props.values.organization}
                            className={
                              props.errors.organization &&
                                props.touched.organization
                                ? "is-invalid"
                                : ""
                            }
                            placeholder={strings.Enter+strings.OrganizationName}
                          />
                          {props.errors.organization &&
                            props.touched.organization && (
                              <div className="invalid-feedback">
                                {props.errors.organization}
                              </div>
                            )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="select">{strings.POBoxNumber}</Label>
                          <Input
                            type="text"
                            id="poBoxNumber"
                            name="poBoxNumber"
                            onChange={(option) => {
                              if (
                                option.target.value === '' ||
                                this.regExBoth.test(
                                  option.target.value,
                                )
                              ) {
                                props.handleChange('poBoxNumber')(
                                  option,
                                );
                              }
                            }}
                            value={props.values.poBoxNumber}
                            className={
                              props.errors.poBoxNumber &&
                                props.touched.poBoxNumber
                                ? "is-invalid"
                                : ""
                            }
                            placeholder={strings.Enter+strings.POBoxNumber}
                          />
                          {props.errors.poBoxNumber &&
                            props.touched.poBoxNumber && (
                              <div className="invalid-feedback">
                                {props.errors.poBoxNumber}
                              </div>
                            )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="row-wrapper">
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="email">
                            <span className="text-danger">* </span>{strings.Email}
                          </Label>
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            onChange={(value) => {
                              props.handleChange("email")(value);
                            }}
                            value={props.values.email}
                            className={
                              props.errors.email && props.touched.email
                                ? "is-invalid"
                                : ""
                            }
                            placeholder={strings.Enter+strings.Email}
                          />
                          {props.errors.email && props.touched.email && (
                            <div className="invalid-feedback">
                              {props.errors.email}
                            </div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="telephone"> <span className="text-danger">* </span>{strings.Telephone}</Label>
                          <Input
                          maxLength="15"
                            type="text"
                            id="telephone"
                            name="telephone"
                            onChange={(option) => { if (option.target.value === '' || this.regEx.test(option.target.value)){ props.handleChange('telephone')(option) }}}
                            value={props.values.telephone}
                            className={
                              props.errors.telephone && props.touched.telephone
                                ? "is-invalid"
                                : ""
                            }
                            placeholder={strings.Enter+strings.TelephoneNumber}
                          />
                          {props.errors.telephone &&
                            props.touched.telephone && (
                              <div className="invalid-feedback">
                                {props.errors.telephone}
                              </div>
                            )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="mobileNumber"> <span className="text-danger">* </span>{strings.MobileNumber}</Label>
                          <PhoneInput
                            country={"ae"}
                            enableSearch={true}
                            international
                            value={props.values.mobileNumber}
                            onChange={(option) => { props.handleChange('mobileNumber')(option) }}
                            className={
                              props.errors.mobileNumber &&
                                props.touched.mobileNumber
                                ? "is-invalid"
                                : ""
                            }
                          />
                          {props.errors.mobileNumber &&
                            props.touched.mobileNumber && (
                              <div className="invalid-feedback">
                                {props.errors.mobileNumber}
                              </div>
                            )}
                          {/* <Input
                            type="text"
                            id="mobileNumber"
                            name="mobileNumber"
                            onChange={(option) => { if (option.target.value === '' || this.regEx.test(option.target.value)) props.handleChange('mobileNumber')(option) }}

                            value={props.values.mobileNumber}
                            className={
                              props.errors.mobileNumber &&
                                props.touched.mobileNumber
                                ? "is-invalid"
                                : ""
                            }
                          />
                          {props.errors.mobileNumber &&
                            props.touched.mobileNumber && (
                              <div className="invalid-feedback">
                                {props.errors.mobileNumber}
                              </div>
                            )} */}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="row-wrapper">
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="addressLine1">{strings.AddressLine1}</Label>
                          <Input
                            type="text"
                            id="addressLine1"
                            name="addressLine1"
                            onChange={(value) => {
                              props.handleChange("addressLine1")(value);
                            }}
                            value={props.values.addressLine1}
                            className={
                              props.errors.addressLine1 &&
                                props.touched.addressLine1
                                ? "is-invalid"
                                : ""
                            }
                            placeholder={strings.Enter+strings.AddressLine1}
                          />
                          {props.errors.addressLine1 &&
                            props.touched.addressLine1 && (
                              <div className="invalid-feedback">
                                {props.errors.addressLine1}
                              </div>
                            )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="addressLine2">{strings.AddressLine2}</Label>
                          <Input
                            type="text"
                            id="addressLine2"
                            name="addressLine2"
                            onChange={(value) => {
                              props.handleChange("addressLine2")(value);
                            }}
                            placeholder={strings.Enter+strings.AddressLine2}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="addressLine3">{strings.AddressLine3}</Label>
                          <Input
                            type="text"
                            id="addressLine3"
                            name="addressLine3"
                            onChange={(value) => {
                              props.handleChange("addressLine3")(value);
                            }}
                            placeholder={strings.Enter+strings.AddressLine3}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="row-wrapper">
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="countryId">
                            <span className="text-danger">* </span>{strings.Country}
                          </Label>
                          <Select
                            options={
                              country_list
                                ? selectOptionsFactory.renderOptions(
                                  "countryName",
                                  "countryCode",
                                  country_list,
                                  "Country"
                                )
                                : []
                            }
                            value={props.values.countryId}
                            onChange={(option) => {
                              if (option && option.value) {
                                props.handleChange("countryId")(option);
                                this.getStateList(option.value)
                              } else {
                                props.handleChange("countryId")("");
                                this.getStateList(option.value)
                              }
                              props.handleChange("stateId")("");
                            }}
                            placeholder={strings.Select+strings.Country}
                            id="countryId"
                            name="countryId"
                            className={
                              props.errors.countryId && props.touched.countryId
                                ? "is-invalid"
                                : ""
                            }
                          />
                          {props.errors.countryId &&
                            props.touched.countryId && (
                              <div className="invalid-feedback">
                                {props.errors.countryId}
                              </div>
                            )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="stateId">{strings.StateRegion}</Label>
                          <Select
                            options={state_list ? selectOptionsFactory.renderOptions('label', 'value', state_list, 'State') : []}
                            value={props.values.stateId}
                            onChange={(option) => {
                              if (option && option.value) {
                                props.handleChange('stateId')(option)
                              } else {
                                props.handleChange('stateId')('')
                              }
                            }}
                            placeholder={strings.Select+strings.StateRegion}
                            id="stateId"
                            name="stateId"
                            className={
                              props.errors.stateId && props.touched.stateId
                                ? "is-invalid"
                                : ""
                            }
                          />
                          {props.errors.stateId && props.touched.stateId && (
                            <div className="invalid-feedback">{props.errors.stateId}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="city">{strings.City}</Label>
                          <Input
                            // options={city ? selectOptionsFactory.renderOptions('cityName', 'cityCode', cityRegion) : ''}
                            value={props.values.city}
                            onChange={(option) =>
                              props.handleChange("city")(option)
                            }
                            placeholder={strings.Location}
                            id="city"
                            name="city"
                            className={
                              props.errors.city && props.touched.city
                                ? "is-invalid"
                                : ""
                            }
                          />
                          {props.errors.city && props.touched.city && (
                            <div className="invalid-feedback">
                              {props.errors.city}
                            </div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="row-wrapper">
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="postZipCode"><span className="text-danger">* </span>{strings.PostZipCode}</Label>
                          <Input
                            type="text"
                            id="postZipCode"
                            name="postZipCode"
                            onChange={(option) => {
                              if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('postZipCode')(option)}
                            }}
                            value={props.values.postZipCode}
                            className={
                              props.errors.postZipCode &&
                                props.touched.postZipCode
                                ? "is-invalid"
                                : ""
                            }
                            placeholder={strings.Enter+strings.PostZipCode}
                          />
                          {props.errors.postZipCode &&
                            props.touched.postZipCode && (
                              <div className="invalid-feedback">
                                {props.errors.postZipCode}
                              </div>
                            )}
                        </FormGroup>
                      </Col>
                    </Row>

                    <hr />
                    <h4 className="mb-3 mt-3">{strings.InvoicingDetails}</h4>
                    <Row className="row-wrapper">
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="billingEmail">{strings.BillingEmail}</Label>
                          <Input
                            type="text"
                            id="billingEmail"
                            name="billingEmail"
                            onChange={(value) => {
                              props.handleChange("billingEmail")(value);
                            }}
                            value={props.values.billingEmail}
                            className={
                              props.errors.billingEmail &&
                                props.touched.billingEmail
                                ? "is-invalid"
                                : ""
                            }
                            placeholder={strings.Enter+strings.BillingEmail}
                          />
                          {props.billingEmail && props.touched.billingEmail && (
                            <div className="invalid-feedback">
                              {props.errors.billingEmail}
                            </div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="contractPoNumber">
                            {strings.ContractPONumber}
                          </Label>
                          <Input
                            type="text"
                            id="contractPoNumber"
                            name="contractPoNumber"
                            onChange={(value) => {
                              props.handleChange("contractPoNumber")(value);
                            }}
                            value={props.values.contractPoNumber}
                            className={
                              props.errors.contractPoNumber &&
                                props.touched.contractPoNumber
                                ? "is-invalid"
                                : ""
                            }
                            placeholder={strings.Enter+strings.ContractPONumber}
                          />
                          {props.errors.contractPoNumber &&
                            props.touched.contractPoNumber && (
                              <div className="invalid-feedback">
                                {props.errors.contractPoNumber}
                              </div>
                            )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="row-wrapper">
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="vatRegistrationNumber">
                            <span className="text-danger">* </span>{strings.TaxRegistrationNumber}
                          </Label>
                          <Input
                            type="text"
                            id="vatRegistrationNumber"
                            name="vatRegistrationNumber"
                            onChange={(option) => {
                              if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('vatRegistrationNumber')(option)}
                            }}
                            value={props.values.vatRegistrationNumber}
                            className={
                              props.errors.vatRegistrationNumber &&
                                props.touched.vatRegistrationNumber
                                ? "is-invalid"
                                : ""
                            }
                            placeholder={strings.Enter+strings.TaxRegistrationNumber}
                          />
                          {props.errors.vatRegistrationNumber &&
                            props.touched.vatRegistrationNumber && (
                              <div className="invalid-feedback">
                                {props.errors.vatRegistrationNumber}
                              </div>
                            )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="currencyCode">{strings.CurrencyCode}</Label>
                          <Select
                            options={
                              currency_list
                                ? selectCurrencyFactory.renderOptions(
                                  "currencyName",
                                  "currencyCode",
                                  currency_list,
                                  "Currency"
                                )
                                : []
                            }
                            value={props.values.currencyCode}
                            onChange={(option) => {
                              if (option && option.value) {
                                props.handleChange("currencyCode")(
                                  option
                                );
                              } else {
                                props.handleChange("currencyCode")("");
                              }
                            }}
                            placeholder={strings.Select+strings.Currency}
                            id="currencyCode"
                            name="currencyCode"
                            className={
                              props.errors.currencyCode &&
                                props.touched.currencyCode
                                ? "is-invalid"
                                : ""
                            }
                          />
                          {props.errors.currencyCode &&
                            props.touched.currencyCode && (
                              <div className="invalid-feedback">
                                {props.errors.currencyCode}
                              </div>
                            )}
                        </FormGroup>
                      </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                  <Button color="success" type="submit" className="btn-square" disabled={isSubmitting}>{strings.Save}</Button>&nbsp;
                    <Button color="secondary" className="btn-square" onClick={() => {closeSupplierModal(false)}}>{strings.Cancel}</Button>
                </ModalFooter>
              </Form>
            )}
            }
          </Formik>
        </Modal>
      </div >
    )
  }
}

export default SupplierModal