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

import { Loader, ConfirmDeleteModal } from 'components'

import {
  CommonActions
} from 'services/global'
import {selectCurrencyFactory, selectOptionsFactory} from 'utils'
import * as EmployeeActions from '../../actions';
import * as SalarayTemplateDetailActions from './actions';
import * as SalaryTemplateActions from './../../actions';

import 'react-datepicker/dist/react-datepicker.css'
import './style.scss'

const mapStateToProps = (state) => {
  return ({
    currency_list: state.employee.currency_list,
    salary_structure_dropdown: state.salarytemplate.salary_structure_dropdown,
    salary_role_dropdown: state.salarytemplate.salary_role_dropdown,
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    employeeActions: bindActionCreators(EmployeeActions, dispatch),
    salarayTemplateDetailActions: bindActionCreators(SalarayTemplateDetailActions, dispatch),
    salaryTemplateActions: bindActionCreators(SalaryTemplateActions , dispatch),
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

class DetailSalaryTemplate extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      initValue: {},
      current_salary_Template_id: null,
      dialog: false,
    }

    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[a-zA-Z ]+$/;
  }

  componentDidMount = () => {
      this.props.salaryTemplateActions.getSalaryStructureForDropdown();
      this.props.salaryTemplateActions.getSalaryRolesForDropdown();
    this.initializeData();
  }

  initializeData = () => {
    if (this.props.location.state && this.props.location.state.id) {
      this.props.salarayTemplateDetailActions.getSalaryTemplateById
      (this.props.location.state.id).then((res) => {
        if (res.status === 200) {
          this.setState({
            current_salary_Template_id: this.props.location.state.id,
            initValue: {
              description: res.data.description ? res.data.description : '',
              formula: res.data.formula ? res.data.formula : '',
              salaryStructureId: res.data.salaryStructureId && res.data.salaryStructureId !== null ? res.data.salaryStructureId : '',
              salaryRoleId: res.data.salaryRoleId && res.data.salaryRoleId !== null ? res.data.salaryRoleId : '',
            },
            loading: false,
          })
        }
      }).catch((err) => {
        this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
      })
    } else {
      this.props.history.push('/admin/payroll/salaryTemplates')
    }
  }

  // handleSubmit = (data) => {
  //   const postData = Object.assign({},data)
  //   if(typeof postData.currencyCode === 'object') {
  //     postData.currencyCode = data.currencyCode.value
  //   }
  //   this.props.employeeDetailActions.updateSalaryStructure(postData).then((res) => {
  //     if (res.status === 200) {
  //       this.props.commonActions.tostifyAlert('success', 'Employee Updated Successfully')
  //       this.props.history.push('/admin/master/employee')
  //     }
  //   }).catch((err) => {
  //     this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
  //   })
  // }
  handleSubmit = (data) => {
		const { current_salary_Template_id} = this.state;
		const {
        salaryRoleId,
        salaryStructureId,
        description,
        formula
    
		} = data;

		let formData = new FormData();
		formData.append('id', current_salary_Template_id);
    formData.append('formula', formula ? formula : '');
    formData.append('description', description ? description : '');
		formData.append('salaryRoleId', salaryRoleId ? salaryRoleId : '');
    formData.append('salaryStructureId', salaryStructureId ? salaryStructureId : '');
		this.props.salarayTemplateDetailActions
			.updateSalaryTemplate(formData)
			.then((res) => {
				this.props.commonActions.tostifyAlert(
					'success',
					'salary Template Updated Successfully.',
				);
				this.props.history.push('/admin/payroll/salaryTemplate');
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

  deleteEmployee = () => {
    const message1 =
    <text>
    <b>Delete Employee?</b>
    </text>
    const message = 'This Employee will be deleted permanently and cannot be recovered. ';
    this.setState({
      dialog: <ConfirmDeleteModal
        isOpen={true}
        okHandler={this.removeEmployee}
        cancelHandler={this.removeDialog}
        message={message}
        message1={message1}
      />
    })
  }

  removeEmployee = () => {
    const { current_employee_id } = this.state;
    this.props.employeeDetailActions.deleteEmployee(current_employee_id).then((res) => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert('success', 'Employee Deleted Successfully !!')
        this.props.history.push('/admin/master/employee')
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : 'Something Went Wrong')
    })
  }

  removeDialog = () => {
    this.setState({
      dialog: null
    })
  }

  render() {

    const { currency_list,salary_structure_dropdown,salary_role_dropdown } = this.props
    const { dialog, loading, initValue } = this.state
    return (
      loading ==true? <Loader/> :
<div>
      <div className="detail-employee-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12} className="mx-auto">
              <Card>
                <CardHeader>
                  <Row>
                    <Col lg={12}>
                      <div className="h4 mb-0 d-flex align-items-center">
                        <i className="nav-icon fas fa-user-tie" />
                        <span className="ml-2">Update Salary Template</span>
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
                              // resetForm(this.state.initValue)
                            }}
                            // validationSchema={Yup.object().shape({
                            //   salaryTemplateName: Yup.string()
                            //     .required("salary Template Name is Required"),
                            
                            // })}
                          >
                                  {(props) => (

                                  <Form  onSubmit={(values, { resetForm }) => {
                                    this.handleSubmit(values, resetForm)
                                    // resetForm(this.state.initValue)

                                  }}>
                               
                                <Row>
                                <Col lg={10}>
                            <Row  className="row-wrapper">
                            
                            <Col lg={4}>
                                <FormGroup>
                                  <Label htmlFor="select"><span className="text-danger">* </span>Description</Label>
                                  <Input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={props.values.description}
                                    placeholder="Enter Salary description"
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
                                    placeholder="Enter Salary formula"
                                    onChange={(option) => {
                                      if (option.target.value === '' || this.regExBoth.test(option.target.value)) { props.handleChange('formula')(option) }
                                    }}
                                    className={props.errors.formula && props.touched.formula ? "is-invalid" : ""}
                                  />
                                  {props.errors.firstName && props.touched.firstName && (
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
                                    isDisabled={true}
																		id="salaryRoleId"
																		name="salaryRoleId"
																		placeholder="Select salary Role "
                                    value={
                                      salary_role_dropdown &&
                                     selectOptionsFactory.renderOptions(
                                        'label',
                                        'value',
                                        salary_role_dropdown,
                                        'SalaryRole',
                                      ).find(
                                        (option) =>
                                          option.value ===
                                          props.values
                                            .salaryRoleId,
                                      )}
                                            onChange={(options) => {
                                              if (options && options.value) {
                                                props.handleChange(
                                                  'salaryRoleId',
                                                )(options.value);
                                              } else {
                                                props.handleChange(
                                                  'salaryRoleId',
                                                )('');
                                              }
                                            }}
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
                                    isDisabled={true}
																		id="salaryStructureId"
																		name="salaryStructureId"
																		placeholder="Select Salary Structure "
																			value={
                                      salary_role_dropdown &&
                                     selectOptionsFactory.renderOptions(
                                        'label',
                                        'value',
                                        salary_role_dropdown,
                                        'SalaryRole',
                                      ).find(
                                        (option) =>
                                          option.value ===
                                          props.values
                                            .salaryStructureId,
                                      )}
                                     onChange={(options) => {
                                              if (options && options.value) {
                                                props.handleChange(
                                                  'salaryStructureId',
                                                )(options.value);
                                              } else {
                                                props.handleChange(
                                                  'salaryStructureId',
                                                )('');
                                              }
                                            }}
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
                                  <Col lg={12} className="d-flex align-items-center justify-content-between flex-wrap mt-5">
                                    <FormGroup>
                                      <Button type="button" name="button" color="danger" className="btn-square"
                                        onClick={this.deleteEmployee}
                                      >
                                        <i className="fa fa-trash"></i> Delete
                                    </Button>
                                    </FormGroup>
                                    <FormGroup className="text-right">
                                    <Button type="button" color="primary" className="btn-square mr-3" onClick={() => {
                                      	//added validation popup	msg
                                        props.handleBlur();
                                        if(props.errors &&  Object.keys(props.errors).length != 0)
                                        this.props.commonActions.fillManDatoryDetails();

                                    this.setState({ createMore: false }, () => {
                                      props.handleSubmit()
                                    })
                                  }}>
                                        <i className="fa fa-dot-circle-o"></i> Update
                                    </Button>
                                      <Button type="button" color="secondary" className="btn-square"
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
                    )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      </div>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(DetailSalaryTemplate)

