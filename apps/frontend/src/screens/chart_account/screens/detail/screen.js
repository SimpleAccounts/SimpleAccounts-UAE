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
import { toast } from 'react-toastify';
import _ from 'lodash';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import * as ChartOfAccontActions from '../../actions';
import * as DetailChartOfAccontActions from './actions';
import Select from 'react-select';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { CommonActions } from 'services/global';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		sub_transaction_type_list: state.chart_account.sub_transaction_type_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		chartOfAccontActions: bindActionCreators(ChartOfAccontActions, dispatch),
		detailChartOfAccontActions: bindActionCreators(
			DetailChartOfAccontActions,
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
class DetailChartAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			initValue: null,
			loading: true,
			createMore: false,
			dialog: false,
			currentData: {},
			chartOfAccountCategory: [],
			coaId: null,
			disabled: false,
			disabled1:false,
			loadingMsg:"Loading...",
			disableLeavePage:false,
			childRecordsPresent:false,
			exist: false
		};
		// this.regExAlpha = /^[a-zA-Z]+$/;
		this.regExAlpha = /^[A-Za-z0-9 !@#$%^&*)(+=._-]+$/;

	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		const id = this.props.location.state.id;
		if (this.props.location.state && id) {
			this.props.detailChartOfAccontActions
				.getTransactionCategoryById(id)
				.then((res) => {
					if (res.status === 200) {
						this.getSubTransactionTypes();
						this.setState({
							loading: false,
							coaId: res.data.transactionCategoryId,
							initValue: {
								// transactionCategoryCode: res.data.transactionCategoryCode,
								transactionCategoryName: res.data.transactionCategoryName,
								chartOfAccount: res.data.transactionTypeId
									? {
											label: res.data.transactionTypeName,
											value: res.data.transactionTypeId,
									  }
									: '',
							},
						});
					}
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						err && err.data ? err.data.message : 'Something Went Wrong',
					);
					this.setState({ loading: false });
					// this.props.history.push('/admin/master/chart-account')
				});
		} else {
			// this.props.history.push('/admin/master/chart-account')
		}
	};

	getSubTransactionTypes = () => {
		this.props.chartOfAccontActions.getSubTransactionTypes().then((res) => {
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

	handleChange = (e, name) => {
		this.setState({
			currentData: _.set(
				{ ...this.state.currentData },
				e.target.name && e.target.name !== '' ? e.target.name : name,
				e.target.type === 'checkbox' ? e.target.checked : e.target.value,
			),
		});
	};
	// Show Success Toast
	success = (msg) => {
		toast.success(msg, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};

	checkChildActivitiesForCoaId = (id) => {
		this.props.chartOfAccontActions
			.getExplainedTransactionCountForTransactionCategory(this.state.coaId)
			.then((res) => {
				if (res.data > 0) {
				this.setState({childRecordsPresent:true})
				} else {
            this.setState({childRecordsPresent:false})
				}
			});
	};

	deleteChartAccount = () => {
		const { coaId } = this.state;
		this.props.chartOfAccontActions
			.getExplainedTransactionCountForTransactionCategory(coaId)
			.then((res) => {
				if (res.data > 0) {
					this.props.commonActions.tostifyAlert(
						'error',
						'You need to delete invoices to delete the chart of account',
					);
				} else {
					const message1 =
		<text>
		<b>Delete Chart of Account?</b>
		</text>
		const message ='This Chart of Account will be deleted permanently and cannot be recovered.';
					this.setState({
						dialog: (
							<ConfirmDeleteModal
								isOpen={true}
								okHandler={this.removeChartAccount}
								cancelHandler={this.removeDialog}
								message={message}
								message1={message1}
							/>
						),
					});
				}
			});
	};

	removeChartAccount = () => {
		this.setState({ disabled1: true });
		const id = this.props.location.state.id;
		this.setState({ loading:true, loadingMsg:"Deleting Chart Of Account..."});
		this.props.detailChartOfAccontActions
			.deleteChartAccount(id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Chart Of Account Deleted Successfully'
					);
					this.props.history.push('/admin/master/chart-account');
					this.setState({ loading:false,});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Chart Of Account Deleted Unsuccessfully'
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 16,
			name: value,
		};
		this.props.detailChartOfAccontActions
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
		this.setState({ disabled: true, disableLeavePage:true });
		const id = this.props.location.state.id;
		const postData = {
			transactionCategoryName: data.transactionCategoryName,
			chartOfAccount: data.chartOfAccount.value,
			transactionCategoryId: id,
			transactionCategoryDescription:data.chartOfAccount.label,
		};
		this.setState({ loading:true, loadingMsg:"Updating Chart Of Account..."});
		this.props.detailChartOfAccontActions
			.updateTransactionCategory(postData)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					resetForm();
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Chart Of Account Updated Successfully'

					);
					this.props.history.push('/admin/master/chart-account');
					this.setState({ loading:false,});
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Chart Of Account Updated Unsuccessfully'
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
		const { loading, dialog ,loadingMsg} = this.state;
		// const { sub_transaction_type_list } = this.props

		return (
			loading ==true? <Loader loadingMsg={loadingMsg}/> :
			<div>
			<div className="chart-account-screen">
				<div className="animated fadeIn">
					{dialog}
					{loading ? (
						<Loader></Loader>
					) : (
						<Row>
							<Col lg={12}>
								<Card>
									<CardHeader>
										<div className="h4 mb-0 d-flex align-items-center">
											<i className="nav-icon fas fa-area-chart" />
											<span className="ml-2"> Update Chart Of Account  </span>
										</div>
									</CardHeader>
									<CardBody>
										<Row>
											<Col lg={6}>
												<Formik
													initialValues={this.state.initValue}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values, resetForm);
													}}
													validate={(values) => {
														let errors = {};
														if (!values.transactionCategoryName) {
															errors.transactionCategoryName = 'Name is required';
														}
														else if (this.state.exist === true) {
															errors.transactionCategoryName =
																'Name already exist';
														}
														return errors;
													}}
													validationSchema={Yup.object().shape({
														chartOfAccount: Yup.string()
															.required('Type is required')
															.nullable(),
													})}
												>
													{(props) => (
														<Form
															onSubmit={props.handleSubmit}
															name="simpleForm"
														>
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
																<Label htmlFor="transactionCategoryName">
																	<span className="text-danger">* </span> {strings.chartOfAccountName}
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
																<Label htmlFor="chartOfAccount">
																	<span className="text-danger">* </span>{strings.accountType}
																</Label>
																{/* <Select
                                    className="select-default-width"
                                    options={sub_transaction_type_list ? selectOptionsFactory.renderOptions('chartOfAccountName', 'chartOfAccountId', sub_transaction_type_list,'Type') : []}
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
                                  /> */}
																<Select
																	styles={customStyles}
																	id="chartOfAccount"
																	name="chartOfAccount"
																	value={props.values.chartOfAccount}
																	isDisabled={this.state.childRecordsPresent}
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
															<Row>
																<Col
																	lg={12}
																	className="d-flex align-items-center justify-content-between flex-wrap mt-5"
																>
																	<FormGroup>
																		<Button
																			type="button"
																			name="button"
																			color="danger"
																			className="btn-square"
																			disabled1={this.state.disabled1}
																			onClick={this.deleteChartAccount}
																		>
																			<i className="fa fa-trash"></i>   {this.state.disabled1
																			? 'Deleting...'
																			: strings.Delete }
																		</Button>
																	</FormGroup>
																	<FormGroup className="text-right">
																		<Button
																			type="submit"
																			name="submit"
																			color="primary"
																			className="btn-square mr-3"
																			disabled={this.state.disabled}
																		>
																			<i className="fa fa-dot-circle-o"></i>{' '}
																			{this.state.disabled
																			? 'Updating...'
																			: strings.Update }
																		</Button>
																		<Button
																			type="button"
																			name="button"
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				this.props.history.push(
																					'/admin/master/chart-account',
																				);
																			}}
																		>
																			<i className="fa fa-ban"></i>  {this.state.disabled1
																			? 'Deleting...'
																			: strings.Cancel }
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
			</div>
			{this.state.disableLeavePage ?"":<LeavePage/>}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailChartAccount);
