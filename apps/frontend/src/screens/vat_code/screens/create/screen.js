import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Input,
	Form,
	FormGroup,
	Label,
	Row,
	Col,
	UncontrolledTooltip,
} from 'reactstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { Loader } from 'components';
import { CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import * as VatCreateActions from './actions';
import * as VatActions from '../../actions';
import { Formik } from 'formik';
import NumberFormat from "react-number-format";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

function NumberFormatCustom(props) {
	const { inputRef, onChange, ...other } = props;
  
	return (
	  <NumberFormat
		{...other}
		getInputRef={inputRef}
		onValueChange={values => {
		  onChange({
			target: {
			  value: values.value
			}
		  });
		}}
		thousandSeparator
		suffix="%"
	  />
	);
  }
  
  NumberFormatCustom.propTypes = {
	inputRef: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired
  };


const mapStateToProps = (state) => {
	return {
		vat_row: state.vat.vat_row,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		vatActions: bindActionCreators(VatActions, dispatch),
		vatCreateActions: bindActionCreators(VatCreateActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class CreateVatCode extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			initValue: { name: '', vat: '' },
			loading: false,
			createMore: false,
			vat_list: [],
			disabled: false,
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExDecimal = /^[0-9]*(\.[0-9]{0,2})?$/;
		this.regEx = /^[0-9\d]+$/;
		this.vatCode = /[a-zA-Z0-9 ]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
	}

	componentDidMount = () => {
		this.props.vatActions.getVatList().then((res) => {
			if (res.status === 200) {
				this.setState({
					vat_list: res.data.data,
				});
			}
		});
	};

	// Save Updated Field's Value to State
	handleChange = (e, name) => {
		this.setState({
			vatData: _.set(
				{ ...this.state.vatData },
				e.target.name && e.target.name !== '' ? e.target.name : name,
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
			),
		});
	};

	// Show Success Toast
	success = () => {
		toast.success('VAT category Updated successfully... ', {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	// Create or Edit Vat
	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		this.props.vatCreateActions
			.createVat(data)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						'New VAT category Created Successfully!',
					);
					resetForm();
					if (this.state.createMore) {
						this.setState({
							createMore: false,
						});
						this.componentDidMount()
					} else {
						this.props.history.push('/admin/master/vat-category');
					}
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert('error', err.data.message);
			});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading, vat_list } = this.state;

		if (vat_list) {
			var VatList = vat_list.map((item) => {
				return item.name;
			});
		}

		return (
			<div className="vat-code-create-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon icon-briefcase" />
										<span className="ml-2">New Tax Category</span>
									</div>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={6}>
											<Formik
												initialValues={this.state.initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
													// resetForm(this.state.initValue)
												}}
												// validateOnBlur={true}
												// validationSchema={Yup.object().shape({
												//   name: Yup.string()
												//     .required("Vat Code Name is Required"),
												//   vat: Yup.string()
												//     .required("Vat Percentage is Required")
												// })}
												validate={(values) => {
													// let status = false
													let errors = {};
													if (!values.name) {
														errors.name = 'Name is required';
													}

													if (VatList.includes(values.name)) {
														errors.name = 'VAT category already exists';
													}

													if (!values.vat) {
														errors.vat = 'Percentage is required';
													}
													return errors;
												}}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit} name="simpleForm">
														<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">* </span>
																 {strings.VatCategoryName}
																<i
																	id="VatCodeTooltip"
																	className="fa fa-question-circle ml-1"
																></i>
																<UncontrolledTooltip
																	placement="right"
																	target="VatCodeTooltip"
																>
																	VAT Category Name – Unique identifier VAT category
																	name
																</UncontrolledTooltip>
															</Label>
															<Input
																type="text"
																maxLength="30"
																id="name"
																name="name"
																placeholder="Enter Tax Category Name"
																onBlur={props.handleBlur}
																onChange={(option) => {
																	if (
																		option.target.value === '' ||
																		this.vatCode.test(option.target.value)
																	) {
																		props.handleChange('name')(option);
																	}
																}}
																// validate={this.validateCode}
																value={props.values.name}
																className={
																	props.errors.name && props.touched.name
																		? 'is-invalid'
																		: ''
																}
															/>
															{props.errors.name && props.touched.name && (
																<div className="invalid-feedback">
																	{props.errors.name}
																</div>
															)}
														</FormGroup>
														<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">* </span>
																{strings.Percentage}
																<i
																	id="VatPercentTooltip"
																	className="fa fa-question-circle ml-1"
																></i>
																<UncontrolledTooltip
																	placement="right"
																	target="VatPercentTooltip"
																>
																	Percentage – VAT percentage charged by your
																	country
																</UncontrolledTooltip>
															</Label>
															<TextField
																type="text"
																size="small"
																fullWidth
																variant="outlined"
																// maxLength="5"
																inputProps={{maxLength:5}}
																id="vat"
																name="vat"
																placeholder="Enter VAT Percentage"
																onChange={(option) => {
																	if (
																		option.target.value === '' ||
																		this.regExPercentage.test(option.target.value)
																	) {
																		props.handleChange('vat')(option);
																	}
																}}
																value={props.values.vat}
																className={
																	props.errors.vat && props.touched.vat
																		? 'is-invalid'
																		: ''
																}
																InputProps={{
																	inputComponent: NumberFormatCustom
																  }}
															/>
															{props.errors.vat && props.touched.vat && (
																<div className="invalid-feedback">
																	{props.errors.vat}
																</div>
															)}
														</FormGroup>
														<FormGroup className="text-right mt-5">
															<Button
																type="button"
																name="submit"
																color="primary"
																className="btn-square mr-3"
																disabled={this.state.disabled}
																onClick={() => {
																	this.setState({ createMore: false }, () => {
																		props.handleSubmit();
																	});
																}}
															>
																<i className="fa fa-dot-circle-o"></i> 	{this.state.disabled
																			? 'Creating...'
																			: strings.Create }
															</Button>
															<Button
																name="button"
																color="primary"
																className="btn-square mr-3"
																disabled={this.state.disabled}
																onClick={() => {
																	this.setState({ createMore: true }, () => {
																		props.handleSubmit();
																	});
																}}
															>
																<i className="fa fa-refresh"></i> 	{this.state.disabled
																			? 'Creating...'
																			: strings.CreateandMore }
															</Button>
															<Button
																type="submit"
																color="secondary"
																className="btn-square"
																onClick={() => {
																	this.props.history.push(
																		'/admin/master/vat-category',
																	);
																}}
															>
																<i className="fa fa-ban"></i> {strings.Cancel}
															</Button>
														</FormGroup>
													</Form>
												)}
											</Formik>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</Col>
					</Row>
					{loading ? <Loader></Loader> : ''}
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateVatCode);
