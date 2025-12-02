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
import { Formik } from 'formik';
import * as Yup from "yup";
import { LeavePage } from 'components';
import {CommonActions} from 'services/global'
import * as EmployeeActions from '../../actions';
import * as SalaryStructureCreateActions from './actions';
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
  return ({
    currency_list: state.employee.currency_list,
    country_list: state.contact.country_list,
    state_list: state.contact.state_list,
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    salaryStructureCreateActions: bindActionCreators(SalaryStructureCreateActions, dispatch)

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
class CreateSalaryStructure extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      language: window['localStorage'].getItem('language'),
      loading: false,
      createMore: false,
			disableLeavePage:false,
      initValue: {
        type:'',
        name:'',
      },
    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;


  }

  componentDidMount = () => {
    this.initializeData();
  };

  initializeData = () => {

  };

  handleSubmit = (data, resetForm) => {
    this.setState({ disabled: true, disableLeavePage:true });
		const {
      type,
      name
		} = data;


		const formData = new FormData();
    formData.append(
      'type',
      type != null ? type : '',
    )
    formData.append(
      'name',
      name != null ? name : '',
    )
    this.props.salaryStructureCreateActions
    .createSalaryStructure(formData)
    .then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert(
          'success',
           'New Salary Structure Created Successfully')
        if (this.state.createMore) {
          this.setState({
            createMore: false
          })
          resetForm(this.state.initValue)
        } else {
          this.props.history.push('/admin/payroll/config',{tabNo:'2'})
        }
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }


  render() {
    strings.setLanguage(this.state.language);
    const { state_list } = this.props

    return (
      <div className="create-employee-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="nav-icon fas fa-user-tie" />
                        <span className="ml-2">{strings.CreateSalaryStructure}</span>
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={12}>
                      <Formik
                        initialValues={this.state.initValue}
                        onSubmit={(values, { resetForm }) => {
                          this.handleSubmit(values, resetForm)
                          resetForm(this.state.initValue)

                          // this.setState({
                          //   selectedContactCurrency: null,
                          //   selectedCurrency: null,
                          //   selectedInvoiceLanguage: null
                          // })
                        }}
                        validationSchema={Yup.object().shape({
                          type: Yup.string()
                            .required("Salary structure type is required"),
                            name: Yup.string()
                            .required("Salary structure name is required"),
                        
                        })}
                      >
                        {(props) => (

                          <Form onSubmit={props.handleSubmit}>
                          
                       <Row>
                          
                           <Col lg={10}>
                            <Row  className="row-wrapper">
                              
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select"><span className="text-danger">* </span> {strings.SalaryStructureType}</Label>
                                  <Input
                                    type="text"
                                    maxLength="30"
                                    id="type"
                                    name="type"
                                    value={props.values.type}
                                    placeholder={strings.Enter+strings.SalaryStructureType}
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regEx.test(option.target.value)) { props.handleChange('type')(option) }
                                    }}
                                    className={props.errors.type && props.touched.type ? "is-invalid" : ""}
                                  />
                                  {props.errors.type && props.touched.type && (
                                    <div className="invalid-feedback">{props.errors.type}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select"><span className="text-danger">* </span>{strings.SalaryStructureName}</Label>
                                  <Input
                                    type="text"
                                    maxLength="30"
                                    id="name"
                                    name="name"
                                    value={props.values.name}
                                    placeholder={strings.Enter+strings.SalaryStructureName}
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('name')(option) }
                                    }}
                                    className={props.errors.name && props.touched.name ? "is-invalid" : ""}
                                  />
                                  {props.errors.name && props.touched.name && (
                                    <div className="invalid-feedback">{props.errors.name}</div>
                                  )}
                                </FormGroup>
                              </Col>
                          
                            </Row>         
                           
                            <hr />
                           
                            </Col>
                            </Row>
                            <Row>
                              <Col lg={12} className="mt-5">
                                <FormGroup className="text-right">
                                  <Button type="button" color="primary" className="btn-square mr-3" onClick={() => {
                                    	//  added validation popup  msg                                                                
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();
                                    this.setState({ createMore: false }, () => {
                                      props.handleSubmit()
                                    })
                                  }}>
                                    <i className="fa fa-dot-circle-o"></i>  {strings.Create}
                                      </Button>
                                  <Button name="button" color="primary" className="btn-square mr-3"
                                    onClick={() => {
                                      	//  added validation popup  msg                                                                
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();
                                      this.setState({ createMore: true }, () => {
                                        props.handleSubmit()
                                      })
                                    }}>
                                    <i className="fa fa-refresh"></i> {strings.CreateandMore}
                                      </Button>
                                  <Button color="secondary" className="btn-square"
                                    onClick={() => { this.props.history.push('/admin/payroll/config',{tabNo:'2'}) }}>
                                    <i className="fa fa-ban"></i>  {strings.Cancel}
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
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
      </div>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CreateSalaryStructure)

