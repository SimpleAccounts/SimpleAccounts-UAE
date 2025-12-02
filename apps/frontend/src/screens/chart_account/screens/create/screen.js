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
} from 'reactstrap';
import { LeavePage, Loader } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import { CommonActions } from 'services/global';
import * as ChartOfAccontActions from '../../actions';
import * as CreateChartOfAccontActions from './actions';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';

const mapStateToProps = (state) => {
	return {
		sub_transaction_type_list: state.chart_account.sub_transaction_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		ChartOfAccontActions: bindActionCreators(ChartOfAccontActions, dispatch),
		createChartOfAccontActions: bindActionCreators(
			CreateChartOfAccontActions,
			dispatch,
		),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};
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
class CreateChartAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			initValue: {
				// transactionCategoryCode: '',
				transactionCategoryName: '',
				chartOfAccount: '',
			},
			loading: false,
			createMore: false,
			exist: false,
			chartOfAccountCategory: [],
			disabled: false,
			loadingMsg:"Loading...",
			disableLeavePage:false
		};
        this.regExAlpha = /^[a-zA-Z ]+$/;
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		this.props.ChartOfAccontActions.getSubTransactionTypes().then((res) => {
			if (res.status === 200) {
				let val = Object.assign({}, res.data);
				let temp = [];
				Object.keys(val).map((item) => {
					temp.push({
						label: item,
						options: val[`${item}`],
					});
					return item;
				});
				this.setState({
					chartOfAccountCategory: temp,
				});
			}
		});
	};
	// Show Success Toast
	// success() {
	//   toast.success('Chart Of Account Created Successfully... ', {
	//     position: toast.POSITION.TOP_RIGHT
	//   })
	// }


	// Create or Edit VAT

	validationCheck = (value) => {
		const data = {
			moduleType: 16,
			name: value,
		};
		this.props.createChartOfAccontActions
			.checkValidation(data)
			.then((response) => {
				if (response.data === 'Transaction Category Name Already Exists') {
					this.setState({
						exist: true,
					});
				} else {
					this.setState({
						exist: false,
					});
				}
			});
	};
	handleSubmit = (data, resetForm) => {
		this.setState({ disabled: true, disableLeavePage:true, });
		const postData = {
			transactionCategoryName: data.transactionCategoryName,
			chartOfAccount: data.chartOfAccount.value,
			//transactionCategoryId:data.chartOfAccount.value,
			transactionCategoryDescription:data.chartOfAccount.label,
		};
		this.setState({ loading:true, loadingMsg:"Creating Chart Of Account ..."});
		this.props.createChartOfAccontActions
			.createTransactionCategory(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.setState({ loading:false});
					this.props.commonActions.tostifyAlert
						(
						'success', 
						res.data ? res.data.message :'New Chart Of Account Created Successfully',
						);
						
					if (this.state.createMore) {
						this.setState({
							createMore: false,
							disableLeavePage:false,
						});
						resetForm();
						
					} else {
						this.props.history.push('/admin/master/chart-account');
						this.setState({ loading:false,});

					}
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'New Chart Of Account Created Unsuccessfully',
					);
			});
	};

	renderOptions = (options) => {
		return options.map((option) => {
			return (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			);
		});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading ,loadingMsg} = this.state;
		// const { sub_transaction_type_list } = this.props
		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
			<div>
			<div className="chart-account-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-area-chart" />
										<span className="ml-2">Create Chart Of Account</span>
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
												initialValues={this.state.initValue}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validate={(values) => {
													let errors = {};
													// if (this.state.exist === true) {
													// 	errors.transactionCategoryName =
													// 		'Chart of account name is already exist';
													// }
													if (!values.transactionCategoryName) {
														errors.transactionCategoryName = 'Chart Of Account Name is required';
													}
													else if (this.state.exist === true) {
														errors.transactionCategoryName =
															'Name already exist';
													}
													return errors;
												}}
												validationSchema={
													Yup.object().shape({
													// transactionCategoryCode: Yup.string()
													//   .required("Name is required"),
													// transactionCategoryName: Yup.string()
													// 	.required('Name is required')
													// 	.min(2, 'Name is too Short!')
													// 	.max(50, 'Name is too Long!'),
													chartOfAccount: Yup.string().required(
														'Account Type is required',
													),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit} name="simpleForm">
							{/* <FormGroup>
                              <Label htmlFor="transactionCategoryCode">Code</Label>
                              <Input
                                type="text"
                                id="transactionCategoryCode"
                                name="transactionCategoryCode"
                                placeholder="Enter Code"
                                onChange={(val) => { props.handleChange('transactionCategoryCode')(val) }}
                                value={props.values.transactionCategoryCode}
                                className={
                                  props.errors.transactionCategoryCode && props.touched.transactionCategoryCode
                                    ? "is-invalid"
                                    : ""
                                }
                              />
                              {props.errors.transactionCategoryCode && props.touched.transactionCategoryCode && (
                                <div className="invalid-feedback">{props.errors.transactionCategoryCode}</div>
                              )}
                            </FormGroup> */}
														<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">* </span>{strings.chartOfAccountName}
															</Label>
															<Input
																type="text" 
																maxLength='50'
																id="transactionCategoryName"
																name="transactionCategoryName"
																placeholder={strings.Enter+strings.chartOfAccountName}
																onChange={(option) => {
																	if (
																		option.target.value === '' ||
																		this.regExAlpha.test(option.target.value)
																	) {
																		props.handleChange(
																			'transactionCategoryName',
																		)(option);
																	}
																	this.validationCheck(option.target.value);
																}}
																value={props.values.transactionCategoryName}
																className={
																	props.errors.transactionCategoryName &&
																	props.touched.transactionCategoryName
																		? 'is-invalid'
																		: ''
																}
															/>
															{props.errors.transactionCategoryName &&
																props.touched.transactionCategoryName && (
																	<div className="invalid-feedback">
																		{props.errors.transactionCategoryName}
																	</div>
																)}
														</FormGroup>
														<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">* </span>{strings.accountType}
															</Label>
							{/* <Select
                                className="select-default-width"
                                options={transaction_type_list ? selectOptionsFactory.renderOptions('chartOfAccountName', 'chartOfAccountId', transaction_type_list,'Type') : ''}
                                value={props.values.chartOfAccount}
                                onChange={(option) => {
                                  if(option && option.value) {
                                    props.handleChange('chartOfAccount')(option.value)
                                  } else {
                                    props.handleChange('chartOfAccount')('')
                                  }
                                }}
                                placeholder="Select Type"
                                id="chartOfAccount"
                                name="chartOfAccount"
                                className={
                                  props.errors.chartOfAccount && props.touched.chartOfAccount
                                    ? "is-invalid"
                                    : ""
                                }
                              />
                              {props.errors.chartOfAccount && props.touched.chartOfAccount && (
                                <div className="invalid-feedback">{props.errors.chartOfAccount}</div>
                              )} */}
															<Select
																id="chartOfAccount"
																name="chartOfAccount"
																placeholder={strings.Select+strings.accountType}
																value={props.values.chartOfAccount}
																// size="1"
																onChange={(val) => {
																	props.handleChange('chartOfAccount')(val);
																}}
																options={this.state.chartOfAccountCategory}
																className={`
                                 ${
																		props.errors.chartOfAccount &&
																		props.touched.chartOfAccount
																			? 'is-invalid'
																			: ''
																	}`}
															/>
															{props.errors.chartOfAccount &&
																props.touched.chartOfAccount && (
																	<div className="invalid-feedback">
																		{props.errors.chartOfAccount}
																	</div>
																)}
														</FormGroup>
											<span style={{fontWeight:'bold'}}>Note:</span><span> A Chart Of Account cannot be edited if they are associated with a product, document or transaction.</span>
														<FormGroup className="text-right mt-5">
															<Button
																type="button"
																name="submit"
																color="primary"
																className="btn-square mr-3"
																disabled={this.state.disabled}
																onClick={() => {
																	//  added validation popup  msg                                                                
																	props.handleBlur();
																	if(props.errors &&  Object.keys(props.errors).length != 0)
																	this.props.commonActions.fillManDatoryDetails();
																	this.setState({ createMore: false });
																	props.handleSubmit();
																}}
															>
																<i className="fa fa-dot-circle-o"></i> {this.state.disabled
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
																	this.setState({ createMore: true });
																	props.handleSubmit();
																}}
															>
																<i className="fa fa-refresh"></i> {this.state.disabled
																			? 'Creating...'
																			: strings.CreateandMore }
															</Button>
															<Button
																type="button"
																color="secondary"
																className="btn-square"
																onClick={() => {
																	this.props.history.push(
																		'/admin/master/chart-account',
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateChartAccount);
