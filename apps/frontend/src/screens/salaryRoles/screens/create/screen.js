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
import { CommonActions } from 'services/global'
import * as SalaryRoleActions from '../../actions';
import * as SalaryRoleCreateActions from './actions';
import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'  
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
  return ({
    currency_list: state.employee.currency_list,

  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    salaryRoleActions: bindActionCreators(SalaryRoleActions, dispatch),
    salaryRoleCreateActions: bindActionCreators(SalaryRoleCreateActions, dispatch)

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
class CreateSalaryRoles extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      language: window['localStorage'].getItem('language'),
      loading: false,
      createMore: false,
      disableLeavePage:false,
      disabled: false,
      initValue: {
        salaryRoleName:''
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
    this.setState({ disabled: true , disableLeavePage: true });
    this.setState({ disabled: true });
		const {
      salaryRoleName
		} = data;


		const formData = new FormData();

  
    formData.append(
      'salaryRoleName',
      salaryRoleName != null ? salaryRoleName : '',
    )
   
    this.props.salaryRoleCreateActions
    .createSalaryRole(formData)
    .then((res) => {
      if (res.status === 200) {
        this.setState({ disabled: false });
        this.props.commonActions.tostifyAlert(
          'success',
           'New Salary Role Created Successfully')
        if (this.state.createMore) {
          this.setState({
            createMore: false
          })
          resetForm(this.state.initValue)
        } else {
          this.props.history.push('/admin/payroll/config');
        }
      }
    }).catch((err) => {
      this.setState({ disabled: false });
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }

  render() {
    strings.setLanguage(this.state.language);
    const { currency_list,state_list } = this.props


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
                        <span className="ml-2">{strings.CreateSalaryRole}</span>
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
                        // resetForm(this.state.initValue)

                        //   // this.setState({
                        //   //   selectedContactCurrency: null,
                        //   //   selectedCurrency: null,
                        //   //   selectedInvoiceLanguage: null
                        //   // })
                         }}
                        validationSchema={Yup.object().shape({
                          salaryRoleName: Yup.string()
                            .required("Salary role name is required"),  
                                           
                        })}
                      >
                        {(props) => (

                          <Form onSubmit={props.handleSubmit}>
                          
                       <Row>
                          
                           <Col lg={10}>
                            <Row  className="row-wrapper">
                              
                              <Col lg={4}>
                                 <FormGroup>
                                  <Label htmlFor="select"><span className="text-danger">* </span>{strings.SalaryRoleName}</Label>
                                  <Input
                                    type="text"
                                    id="salaryRoleName"
                                    name="salaryRoleName"
                                    maxLength="30"
                                    value={props.values.salaryRoleName}
                                    placeholder={strings.Enter+strings.SalaryRoleName}
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('salaryRoleName')(option) }
                                    }}
                                    className={props.errors.salaryRoleName && props.touched.salaryRoleName ? "is-invalid" : ""}
                                  />
                                  {props.errors.salaryRoleName && props.touched.salaryRoleName && (
                                    <div className="invalid-feedback">{props.errors.salaryRoleName}</div>
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
                                  <Button type="button" color="primary" className="btn-square mr-3" 		disabled={this.state.disabled} onClick={() => {
                                    	//  added validation popup  msg                                                                
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();
                                    this.setState({ createMore: false }, () => {
                                      props.handleSubmit()
                                    })
                                  }}>
                                    <i className="fa fa-dot-circle-o"></i>  	{this.state.disabled
																			? 'Creating...'
																			: strings.Create }
                                      </Button>
                                  <Button name="button" color="primary" className="btn-square mr-3" 		disabled={this.state.disabled}
                                    onClick={() => {
                                        	//  added validation popup  msg                                                                
																				props.handleBlur();
																				if(props.errors &&  Object.keys(props.errors).length != 0)
																				this.props.commonActions.fillManDatoryDetails();
                                      this.setState({ createMore: true }, () => {
                                        props.handleSubmit()
                                      })
                                    }}>
                                    <i className="fa fa-refresh"></i>  {this.state.disabled
																			? 'Creating...'
																			: strings.CreateandMore }
                                      </Button>
                                  <Button color="secondary" className="btn-square"
                                    onClick={() => { 	this.props.history.push('/admin/payroll/config',{tabNo:'1'}); }}>
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


export default connect(mapStateToProps, mapDispatchToProps)(CreateSalaryRoles)

