import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Input,
  Col,
  Form,
  FormGroup,
  Label
} from 'reactstrap'
import { ToastContainer } from 'react-toastify'
import ImageUploader from 'react-images-upload'

import Select from 'react-select'

import { Loader } from 'components'
import {
  CommonActions
} from 'services/global'

import * as OrganizationActions from './actions'

import 'react-toastify/dist/ReactToastify.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'
// import 'react-images-uploader/styles.css'
// import 'react-images-uploader/font.css'

import { selectOptionsFactory } from 'utils'
import { Formik } from 'formik';
import './style.scss'
import config from 'constants/config'


// const industryOptions = [
//   { value: 'input', label: 'Option1' },
//   { value: 'output', label: 'Option2' },
//   { value: 'all', label: 'Option3' },
// ]

const mapStateToProps = (state) => {
  return ({
    country_list: state.organization.country_list,
    industry_type_list: state.organization.industry_type_list

  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    organizationActions: bindActionCreators(OrganizationActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch)
  })
}

class Organization extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      initValue: {
        companyLogo: '',
        name: '',
        industryTypeCode: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        countryCode: '',
        postZipCode: '',
        contactPersonName: '',
        contactEmailAddress: '',
        contactPhoneNumber: '',
        phoneNumber: '',
        companyRegistrationId: '',
        vatNumber: '',
      },
      pictures: []
    }
  }

  componentDidMount = () => {
    this.initializeData()
  }

  initializeData = () => {
    this.props.organizationActions.getCountryList()
    this.props.organizationActions.getIndustryTypeList()
  }

  uploadImage = (picture) =>  {
    this.setState({
      pictures: picture,
    });
  }

  handleSubmit = (data) => {
    const {
      name,
      industryTypeCode,
      addressLine1,
      addressLine2,
      city,
      state,
      countryCode,
      postZipCode,
      contactPersonName,
      contactEmailAddress,
      contactPhoneNumber,
      phoneNumber,
      companyRegistrationId,
      vatNumber,
    } = data;
    const { pictures } = this.state;
    let formData = new FormData();
    formData.append("name", name ? name : '');
    formData.append("industryTypeCode", industryTypeCode ? industryTypeCode : '');
    formData.append("addressLine1", addressLine1 ? addressLine1 : '');
    formData.append("addressLine2", addressLine2 ? addressLine2 : '');
    formData.append("city", city ? city : '');
    formData.append("state", state ? state : '');
    formData.append("countryCode", countryCode ? countryCode : '');
    formData.append("postZipCode", postZipCode ? postZipCode : '');
    formData.append("contactPersonName", contactPersonName ? contactPersonName : '');
    formData.append("contactEmailAddress", contactEmailAddress ? contactEmailAddress : '');
    formData.append("contactPhoneNumber", contactPhoneNumber ? contactPhoneNumber : '');
    formData.append("phoneNumber", phoneNumber ? phoneNumber : '');
    formData.append("companyRegistrationId", companyRegistrationId ? companyRegistrationId : '');
    formData.append("vatNumber", vatNumber ? vatNumber : '');
    if (pictures.length > 0) {
      formData.append("companyLogo ", pictures[0]);
    }


    this.props.organizationActions.createOrganization(formData).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert('success', 'New Company Created Successfully')
        this.props.history.push(config.DASHBOARD?'/admin/dashboard':'/admin/income/customer-invoice')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }
  
  render() {
    const { loading } = this.state;
    const { country_list, industry_type_list } = this.props
    const containerStyle = {
      zIndex: 1999,closeOnClick: true,
      draggable: true
      
    };

    return (
      loading ==true? <Loader/> :
<div>
      <div className="organization-screen">
        <div className="animated fadeIn">
          <ToastContainer
            position="top-right"
            autoClose={1700}
            style={containerStyle}
            closeOnClick
            draggable
          />

          <Card>
            <CardHeader>
              <div className="h4 mb-0 d-flex align-items-center">
                <i className="nav-icon fas fa-sitemap" />
                <span className="ml-2">Organization</span>
              </div>
            </CardHeader>
            <CardBody>
              {
                loading ?
                  <Loader></Loader> :
                  <Row>
                    <Col lg='12'>
                      <Formik
                        initialValues={this.state.initValue}
                        onSubmit={(values, { resetForm }) => {
                          this.handleSubmit(values)
                          // resetForm(this.state.initValue)

                          // this.setState({
                          //   selectedContactCurrency: null,
                          //   selectedCurrency: null,
                          //   selectedInvoiceLanguage: null
                          // })
                        }}
                        // validationSchema={Yup.object().shape({
                        //   firstName: Yup.string()
                        //     .required("First Name is Required"),
                        //   lastName: Yup.string()
                        //     .required("Last Name is Required"),
                        // })}
                      >
                        {(props) => (

                          <Form name="simpleForm" className="mt-3" onSubmit={props.handleSubmit}>
                            <FormGroup row>
                              <Col md="2" className="text-right">
                                <Label htmlFor="categoryName" className="mt-3">Company Logo</Label>
                              </Col>
                              <Col xs="12" md="8" lg="2">
                                {/* <ImagesUploader
                            url="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                            optimisticPreviews
                            multiple={false}
                            onLoadEnd={(err) => {
                              if (err) {
                                console.error(err);
                              }
                            }}
                          /> */}
                                <ImageUploader
                                  withIcon={true}
                                  buttonText='Choose images'
                                  onChange={this.uploadImage}
                                  imgExtension={['jpg', 'gif', 'png' , 'jpeg']}
                                  maxFileSize={1048576}
                                  withPreview={true}
                                  singleImage={true}
                                  // withIcon={false}
                                  label="'Max file size: 1mb"
                                // fileContainerStyle = {{
                                //   display: 'none'
                                // }}
                                />
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col md="2" className="text-right">
                                <Label htmlFor="companyName">
                                  <span className="text-danger">* </span>Company Name
                          </Label>
                              </Col>
                              <Col xs="12" md="5">
                                <Input
                                  type="text"
                                  id="name"
                                  name="name"
                                  placeholder="Enter Company Name"
                                  onChange={(option) => { props.handleChange('name')( option) }}
                                />
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col md="2" className="text-right">
                                <Label htmlFor="categoryName">
                                  <span className="text-danger">* </span>Industry
                          </Label>
                              </Col>
                              <Col xs="12" md="5">
                                <Select
                                  options={industry_type_list ? selectOptionsFactory.renderOptions('label', 'value', industry_type_list) : []}
                                  value={props.values.industryTypeCode}
                                  onChange={(option) => {
                                    if(option && option.value) {
                                      props.handleChange('industryTypeCode')(option.value)
                                    }else {
                                      props.handleChange('industryTypeCode')('')
                                    }
                                  }
                                    }
                                  placeholder="Select Role"
                                  id="industryTypeCode"
                                  name="industryTypeCode"
                                  className={
                                    props.errors.industryTypeCode && props.touched.industryTypeCode
                                      ? "is-invalid"
                                      : ""
                                  }
                                />
                                {props.errors.industryTypeCode && props.touched.industryTypeCode && (
                                  <div className="invalid-feedback">{props.errors.industryTypeCode}</div>
                                )}
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col md="2" className="text-right">
                                <Label htmlFor="categoryName">
                                  <span className="text-danger">* </span>Company Address
                          </Label>
                              </Col>
                              <Col xs="12" md="8">
                                <FormGroup>
                                  <Input
                                    type="text"
                                    id="addressLine1"
                                    name="addressLine1"
                                    placeholder="Street1"
                                    onChange={(option) => props.handleChange('addressLine1')(option)}
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <Input
                                    type="text"
                                    id="addressLine2"
                                    name="addressLine2"
                                    placeholder="Street2"
                                    onChange={(option) => props.handleChange('addressLine2')(option)}
                                  />
                                </FormGroup>
                                <Row>
                                  <Col xs="12" md="3">
                                    <Select
                                      options={country_list ? selectOptionsFactory.renderOptions('countryName', 'countryCode', country_list, 'Country') : []}
                                      value={props.values.countryCode}
                                      onChange={(option) => {
                                        if(option.value) {
                                          props.handleChange('countryCode')(option.value)
                                        } else {
                                          props.handleChange('countryCode')('')
                                        }
                                      }}
                                      placeholder="Select Role"
                                      id="countryCode"
                                      name="countryCode"
                                      className={
                                        props.errors.countryCode && props.touched.countryCode
                                          ? "is-invalid"
                                          : ""
                                      }
                                    />
                                    {props.errors.countryCode && props.touched.countryCode && (
                                      <div className="invalid-feedback">{props.errors.countryCode}</div>
                                    )}
                                  </Col>
                                  <Col xs="12" md="3">
                                    <Input
                                      type="text"
                                      id="city"
                                      name="city"
                                      placeholder="City"
                                      onChange={(option) => props.handleChange('city')(option)}
                                    />
                                  </Col>
                                  <Col xs="12" md="3">
                                    <Input
                                      type="text"
                                      id="state"
                                      name="state"
                                      placeholder="State/Province"
                                      onChange={(option) => props.handleChange('state')(option)}
                                    />
                                  </Col>
                                  <Col xs="12" md="3">
                                    <Input
                                      type="text"
                                      id="postZipCode"
                                      name="postZipCode"
                                      placeholder="Zip/Postal Code"
                                      onChange={(option) => props.handleChange('postZipCode')(option)}
                                    />
                                  </Col>
                                </Row>
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col md="2" className="text-right">
                                <Label htmlFor="categoryName">
                                  <span className="text-danger">* </span>Phone
                          </Label>
                              </Col>
                              <Col xs="12" md="8">
                                <Input
                                  type="text"
                                  id="phoneNumber"
                                  name="phoneNumber"
                                  placeholder="Enter Phone Number"
                                  onChange={(option) => props.handleChange('phoneNumber')(option)}
                                />
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col md="2" className="text-right">
                                <Label htmlFor="categoryName"><span className="text-danger">* </span>Contact Detail</Label>
                              </Col>
                              <Col xs="12" md="8">
                                <Row>
                                  <Col xs="12" md="4">
                                    <Input
                                      type="text"
                                      id="contactPersonName"
                                      name="contactPersonName"
                                      placeholder="Name"
                                      onChange={(option) => props.handleChange('contactPersonName')(option)}
                                    />
                                  </Col>
                                  <Col xs="12" md="4">
                                    <Input
                                      type="text"
                                      id="contactEmailAddress"
                                      name="contactEmailAddress"
                                      placeholder="Email"
                                      onChange={(option) => props.handleChange('contactEmailAddress')(option)}
                                    />
                                  </Col>
                                  <Col xs="12" md="4">
                                    <Input
                                      type="text"
                                      id="contactPhoneNumber"
                                      name="contactPhoneNumber"
                                      placeholder="Phone"
                                      onChange={(option) => props.handleChange('contactPhoneNumber')(option)}
                                    />
                                  </Col>
                                </Row>
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col md="2" className="text-right">
                                <Label htmlFor="categoryName"><span className="text-danger">* </span>Company ID</Label>
                              </Col>
                              <Col xs="12" md="8">
                                <Input
                                  type="text"
                                  id="companyRegistrationId"
                                  name="companyRegistrationId"
                                  placeholder="Enter Company Id"
                                  onChange={(option) => props.handleChange('companyRegistrationId')(option)}
                                />
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col md="2" className="text-right">
                                <Label htmlFor="categoryName"><span className="text-danger">* </span>VAT Number</Label>
                              </Col>
                              <Col xs="12" md="8">
                                <Input
                                  type="text"
                                  id="vatNumber"
                                  name="vatNumber"
                                  placeholder="Enter VAT Number"
                                  onChange={(option) => props.handleChange('vatNumber')(option)}
                                />
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col md="2"></Col>
                              <Col xs="12" md="8">
                                <Button
                                  type="submit"
                                  color="primary"
                                  className="btn-square mt-5"
                                >
                                  <i className="fas fa-save mr-2"></i>Save
                          </Button>
                              </Col>
                            </FormGroup>
                          </Form>
                        )
                        }
                      </Formik>
                    </Col>
                  </Row>
              }
            </CardBody>
          </Card>
        </div>
      </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Organization)
