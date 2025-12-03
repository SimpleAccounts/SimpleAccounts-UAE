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
import DatePicker from 'react-datepicker'
import { Formik } from 'formik';
import * as Yup from "yup";
import { ImageUploader } from 'components';
import {
  CommonActions
} from 'services/global'
import * as SalaryTemplateActions from '../../actions';
import * as EmployeeCreateActions from './actions';

import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'
  
import { selectOptionsFactory } from 'utils'

const mapStateToProps = (state) => {
  return ({
    salary_structure_dropdown: state.salarytemplate.salary_structure_dropdown,
    salary_role_dropdown: state.salarytemplate.salary_role_dropdown,
    country_list: state.contact.country_list,
    state_list: state.contact.state_list,
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
 salaryTemplateActions: bindActionCreators(SalaryTemplateActions, dispatch),
    employeeCreateActions: bindActionCreators(EmployeeCreateActions, dispatch)

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
class CreateSalaryTemplate extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      createMore: false,
      initValue: {
        salaryStructureId:'',
        description:'',
        formula:'',
        salaryRoleId:'',
   
      },

    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;


  }

  componentDidMount = () => {
    this.props.salaryTemplateActions.getSalaryStructureForDropdown();
    this.props.salaryTemplateActions.getSalaryRolesForDropdown();
    this.initializeData();
  };

  initializeData = () => {
   
  };

  handleSubmit = (data, resetForm) => {
    this.setState({ disabled: true });
		const {
      formula,
      salaryStructureId,
      description,
      salaryRoleId,
		} = data;

		const formData = new FormData();
  
    formData.append(
      'description',
      description != null ? description : '',
    )     
   
  	if (salaryRoleId && salaryRoleId.value) {
			formData.append('salaryRoleId', salaryRoleId.value);
		}
    formData.append(
      'formula',
      formula != null ? formula : '',
    )
    if (salaryStructureId && salaryStructureId.value) {
			formData.append('salaryStructureId', salaryStructureId.value);
		}
   
    this.props.employeeCreateActions
    .createSalaryTemplate(formData)
    .then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert(
          'success',
           'New Template Component Created Successfully')
        if (this.state.createMore) {
          this.setState({
            createMore: false
          })
          resetForm(this.state.initValue)
        } else {
          this.props.history.push('/admin/payroll/salaryTemplate')
        }
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }


  render() {

    const { salary_structure_dropdown,salary_role_dropdown,country_list,state_list } = this.props

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
                        <span className="ml-2">Create Salary Template</span>
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

                        }}
                        validationSchema={Yup.object().shape({
                          // salaryStructureId: Yup.string()
                          //   .required("salaryStructureId is Required"),
                          //   description: Yup.string()
                          //   .required("description is Required"),
                          //   formula: Yup.string()
                          //   .required("formula is Required"),
                          //   salaryRoleId: Yup.string().email("salaryRoleId Required"),
                       
                        })}
                      >
                        {(props) => (

                          <Form onSubmit={props.handleSubmit}>
                          
                       <Row>
                          
                           <Col lg={10}>
                            <Row  className="row-wrapper">
                              
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select"><span className="text-danger">* </span>Salary Description</Label>
                                  <Input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={props.values.description}
                                    placeholder="Enter description"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExBoth.test(option.target.value)) { props.handleChange('description')(option) }
                                    }}
                                    className={props.errors.description && props.touched.description ? "is-invalid" : ""}
                                  />
                                  {props.errors.description && props.touched.description && ( 
                                    <div className="invalid-feedback">{props.errors.description}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select"><span className="text-danger">* </span>Formula</Label>
                                  <Input
                                    type="text"
                                    id="formula"
                                    name="formula"
                                    value={props.values.formula}
                                    placeholder="Enter formula"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExBoth.test(option.target.value)) { props.handleChange('formula')(option) }
                                    }}
                                    className={props.errors.formula && props.touched.formula ? "is-invalid" : ""}
                                  />
                                  {props.errors.formula && props.touched.formula && ( 
                                    <div className="invalid-feedback">{props.errors.formula}</div>
                                  )}
                                </FormGroup>
                              </Col>                       
                            </Row>         
                            <Row  className="row-wrapper">
                              
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select"><span className="text-danger">* </span>Salary Role</Label>
                                  <Select
																		styles={customStyles}
																		options={
                                      salary_role_dropdown
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
                                            salary_role_dropdown,
																						'SalaryRole',
																				  )
																				: []
																		}
																		id="salaryRoleId"
																		name="salaryRoleId"
																		placeholder="Select salary Role "
																		value={this.state.salaryDesignation}
                                    onChange={(value) => {
																			props.handleChange('salaryRoleId')(value);
																	
																		}}
																		className={`${
																			props.errors.salaryRoleId && props.touched.salaryRoleId
																				? 'is-invalid'
																				: ''
																		}`}
																	/>
																	{props.errors.salaryRoleId && props.touched.salaryRoleId && (
																		<div className="invalid-feedback">
																			{props.errors.salaryRoleId}
																		</div>
																	)}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select"><span className="text-danger">* </span>Salary Structure</Label>
                                  <Select
																		styles={customStyles}
																		options={
                                      salary_structure_dropdown
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
                                            salary_structure_dropdown,
																						'SalaryStructure',
																				  )
																				: []
																		}
																		id="salaryStructureId"
																		name="salaryStructureId"
																		placeholder="Select Salary Structure "
																		value={this.state.SalaryStructureId}
                                    onChange={(value) => {
																			props.handleChange('salaryStructureId')(value);
																	
																		}}
																		className={`${
																			props.errors.salaryStructureId && props.touched.salaryStructureId
																				? 'is-invalid'
																				: ''
																		}`}
																	/>
																	{props.errors.salaryStructureId && props.touched.salaryStructureId && (
																		<div className="invalid-feedback">
																			{props.errors.salaryStructureId}
																		</div>
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
                                    this.setState({ createMore: false }, () => {
                                      props.handleSubmit()
                                    })
                                  }}>
                                    <i className="fa fa-dot-circle-o"></i> Create
                                      </Button>
                                  <Button name="button" color="primary" className="btn-square mr-3"
                                    onClick={() => {
                                      this.setState({ createMore: true }, () => {
                                        props.handleSubmit()
                                      })
                                    }}>
                                    <i className="fa fa-refresh"></i> Create and More
                                      </Button>
                                  <Button color="secondary" className="btn-square"
                                    onClick={() => { this.props.history.push('/admin/payroll/salaryTemplate') }}>
                                    <i className="fa fa-ban"></i> Cancel
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
      </div>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(CreateSalaryTemplate)

