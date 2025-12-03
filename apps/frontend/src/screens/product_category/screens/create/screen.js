import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Input,
	FormGroup,
	Label,
	Row,
	Col,
	UncontrolledTooltip,
} from 'reactstrap';
import _ from 'lodash';
import { LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import * as CreateProductCategoryActions from './actions';
import * as ProductCategoryActions from '../../actions';
import { Formik } from 'formik';

const mapStateToProps = (state) => {
	return {
		product_category_list: state.product_category.product_category_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		createProductCategoryActions: bindActionCreators(
			CreateProductCategoryActions,
			dispatch,
		),
		productCategoryActions: bindActionCreators(
			ProductCategoryActions,
			dispatch,
		),
	};
};

let strings = new LocalizedStrings(data);
class CreateProductCategory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			initValue: {
				productCategoryCode: '',
				productCategoryName: '',
			},

			loading: false,
			createMore: false,
			disabled: false,
			loadingMsg:"Loading",
			disableLeavePage:false
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExBoth = /^[a-zA-Z0-9\s,'-/()]+$/;
		//this.regExCode = /^[a-zA-Z0-9\s,'-]+$/;
	}

	componentDidMount = () => {
		this.props.productCategoryActions.getProductCategoryList().then((res) => {
			if (res.status === 200) {
				this.setState({
					product_category_list: res.data.data,
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
	// success() {
	//   toast.success('Product Category Created successfully... ', {
	//     position: toast.POSITION.TOP_RIGHT
	//   })
	// }

	// Create or Edit VAT
	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true });
		this.setState({ loading:true,disableLeavePage:true, loadingMsg:"Creating Product Category..."});
		this.props.createProductCategoryActions
			.createProductCategory(data)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.setState({ loading:false});
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Product Category Created Successfully'
					);

					if (this.state.createMore) {
						resetForm(this.state.initValue);
						this.componentDidMount()
						this.setState({
							createMore: false,
							disableLeavePage: false,
						});
					} else {
						this.props.history.push('/admin/master/product-category');
						this.setState({ loading:false,});
					}
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Product Category Created Unsuccessfully',
				);
			});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading, initValue, product_category_list } = this.state;
		const {  loadingMsg } = this.state
		if (product_category_list) {
			var ProductCategoryList = product_category_list.map((item) => {
				return item.productCategoryCode;
			});
		}
		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
			<div>
			<div className="vat-code-create-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-boxes" />
										<span className="ml-2">{strings.NewProductCategory}</span>
									</div>
								</CardHeader>
								<CardBody>
								{loading ? (
										<Row>
											<Col lg={12}>
												<Loader />
											</Col>
										</Row>
									) : (
									<Row>
										<Col lg={6}>
											<Formik
												initialValues={initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validate={(values) => {
													let errors = {};
													if (!values.productCategoryName) {
														errors.productCategoryName =
															strings.ProductCategoryNameRequired
													}

													if (
														product_category_list &&
														ProductCategoryList.includes(
															values.productCategoryCode,
														)
													) {
														errors.productCategoryCode =
															'Product category code already exists';
													}

													if (!values.productCategoryCode) {
														errors.productCategoryCode =
															strings.ProductCategoryCodeRequired
													}
													return errors;
												}}
											>
												{(props) => {
													const {
														values,
														touched,
														errors,
														handleChange,
														handleSubmit,
														handleBlur,
													} = props;
													return (
														<form onSubmit={handleSubmit}>
															<FormGroup>
																<Label htmlFor="productCategoryCode">
																	<span className="text-danger">* </span>
																	 {strings.ProductCategoryCode}
																	<i
																		id="ProductcatcodeTooltip"
																		className="fa fa-question-circle ml-1"
																	></i>
																	<UncontrolledTooltip
																		placement="right"
																		target="ProductcatcodeTooltip"
																	>
																		Product Category Code - Unique identifier code of the product 
																	</UncontrolledTooltip>
																</Label>
																<Input
																	type="text" 
																	maxLength='20'
																	id="productCategoryCode"
																	name="productCategoryCode"
																	placeholder={strings.Enter+strings.ProductCategoryCode}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regExBoth.test(option.target.value)
																		) {
																			handleChange('productCategoryCode')(
																				option,
																			);
																		}
																	}}
																	onBlur={handleBlur}
																	value={values.productCategoryCode}
																	className={
																		errors.productCategoryCode &&
																		touched.productCategoryCode
																			? 'is-invalid'
																			: ''
																	}
																/>
																{errors.productCategoryCode &&
																	touched.productCategoryCode && (
																		<div className="invalid-feedback">
																			{errors.productCategoryCode}
																		</div>
																	)}
															</FormGroup>
															<FormGroup>
																<Label htmlFor="name">
																	<span className="text-danger">* </span>
																	{strings.ProductCategoryName}
																</Label>
																<Input
																	type="text"
																	maxLength='50'
																	id="productCategoryName"
																	name="productCategoryName"
																	placeholder={strings.Enter+strings.ProductCategoryName}
																	onChange={(option) => {
																		if (
																			option.target.value === '' ||
																			this.regExBoth.test(option.target.value)
																		) {
																			handleChange('productCategoryName')(
																				option,
																			);
																		}
																	}}
																	onBlur={handleBlur}
																	value={values.productCategoryName}
																	className={
																		errors.productCategoryName &&
																		touched.productCategoryName
																			? 'is-invalid'
																			: ''
																	}
																/>
																{errors.productCategoryName &&
																	touched.productCategoryName && (
																		<div className="invalid-feedback">
																			{errors.productCategoryName}
																		</div>
																	)}
															</FormGroup>
															Note: If the product category is associated with the product, it cannot be deleted.
															<FormGroup className="text-right mt-5">
																<Button
																	type="submit"
																	name="submit"
																	color="primary"
																	className="btn-square mr-3"
																	disabled={this.state.disabled}
																	onClick={() => {
																		//  added validation popup  msg                                                                
																		props.handleBlur();
																		if(props.errors &&  Object.keys(props.errors).length != 0)
																		this.props.commonActions.fillManDatoryDetails();
																		}}
																>
																	<i className="fa fa-dot-circle-o"></i>{' '} 	
																	{this.state.disabled
																			? 'Creating...'
																			: strings.Create }
																</Button>

																<Button
																	name="button"
																	color="primary"
																	className="btn-square mr-3"
																	disabled={this.state.disabled}
																	onClick={() => {
																	//  added validation popup  msg                                                                
																	props.handleBlur();
																	if(props.errors &&  Object.keys(props.errors).length != 0)
																	this.props.commonActions.fillManDatoryDetails();

																		this.setState({ createMore: true }, () => {
																			props.handleSubmit();
																		});
																	}}
																>
																	<i className="fa fa-refresh"></i> {' '}
																	{this.state.disabled
																			? 'Creating...'
																			: strings.CreateandMore }
																</Button>

																<Button
																	type="button"
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		this.props.history.push(
																			'/admin/master/product-category',
																		);
																	}}
																>
																	<i className="fa fa-ban mr-1"></i>{strings.Cancel}
																</Button>
															</FormGroup>
														</form>
													);
												}}
											</Formik>
										</Col>
									</Row>
									)}
								</CardBody>
							</Card>
						</Col>
					</Row>
					{loading ? <Loader></Loader> : ''}
				</div>
			</div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CreateProductCategory);
