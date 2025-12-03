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
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import _ from 'lodash';
import { Loader ,LeavePage} from 'components';
import moment from 'moment';
import { AuthActions,CommonActions } from 'services/global';
import * as OpeningBalanceActions from '../../actions';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import * as CreateOpeningBalancesActions from './actions';
import { selectOptionsFactory } from 'utils';
import { Formik } from 'formik';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
	return {
		
		currency_list: state.common.currency_list,
		transaction_category_list: state.opening_balance.transaction_category_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		openingBalanceActions: bindActionCreators(OpeningBalanceActions, dispatch),
		createOpeningBalancesActions: bindActionCreators(CreateOpeningBalancesActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		authActions: bindActionCreators(AuthActions, dispatch),
	}
};
let strings = new LocalizedStrings(data);

class CreateOpeningBalance extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			initValue: {
				effectiveDate : new Date(),
				openingBalance : '',
				transactionCategoryId : '',
			},
			data: '',
			basecurrency:[],
			loading: false,
			createMore: false,
			disabled: false,
			loadingMsg:"Loading...",
			disableLeavePage:false, 
			openingbalancelist:"",
		};
		this.regEx = /^[0-9\d]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		this.formRef = React.createRef();

		
	}
	

	componentDidMount = () => {
		this.props.authActions.getCurrencylist() ;
		//this.getCompanyCurrency();
		this.getOpeningBalanceList();
		this.initializeData();
	};
	getOpeningBalanceList = () => {
		this.props.createOpeningBalancesActions.getOpeningBalanceList()
		.then((res) => {
			if (res.status === 200) {
				this.setState({openingbalancelist:res.data,});
			}
		})
		.catch((err) => {
			this.props.commonActions.tostifyAlert(
				'error',
				err && err.data ? err.data.message : 'Something Went Wrong',
			);
		});
	}; 
	checkIfOpeningBalanceAlreadyExist = (transactioncategorylist) =>{
		let openingbalancelist = this.state.openingbalancelist.data;
		if(openingbalancelist && openingbalancelist.length && openingbalancelist.length !== 0){
			let transactioncategorynewlist=[];
			transactioncategorylist.map((category)=> {
				let openingbalance = openingbalancelist.find((element) => category.transactionCategoryId === element.transactionCategoryId)
				if(!openingbalance){
					transactioncategorynewlist.push(category);
				}
			});
			return transactioncategorynewlist;
		}
		else{
			return transactioncategorylist;
		}
	}
	initializeData = () => {
		this.props.openingBalanceActions.getTransactionCategoryList();
		this.props.commonActions.getCompanyDetails().then((res) => {
			if (res.status === 200) {
			  const isRegisteredVat = res.data.isRegisteredVat;
	  
			  this.props.history.replace({
				pathname: this.props.location.pathname,
				state: {
				  ...this.props.location.state,
				  isRegisteredVat: isRegisteredVat,
				},
			  });
	  
			  this.setState({
				companyDetails: res.data,
				isRegisteredVat: isRegisteredVat,
			  });
			}
		  });
	}

	// Create  Currency conversion
	handleSubmit = (data,resetForm) =>{
		this.setState({ disabled: true });
		// const postData = {
		// 	openingBalance: data.openingBalance,
		// 	transactionCategoryId: data.transactionCategoryId.value,
		// 	effectiveDate:data.effectiveDate,
		// };
		let formData =new FormData()
			formData.append(`persistModelList[${0}].transactionCategoryId`, data.transactionCategoryId.value);
		    formData.append(`persistModelList[${0}].effectiveDate`, moment(data.effectiveDate));
			formData.append(`persistModelList[${0}].openingBalance`, data.openingBalance);
		
			this.setState({ loading:true, disableLeavePage:true,loadingMsg:"Creating New Opening Balance..."});
			this.props.createOpeningBalancesActions
				.addOpeningBalance(formData)
				.then((res) => {
					this.setState({ disabled: false });
					if (res.status === 200) {
						resetForm(this.state.initValue);
						this.props.commonActions.tostifyAlert(
							'success',
							res.data ? res.data.message : 'New Opening Balance Created Successfully.',
						);
						if (this.state.createMore) {
							this.setState({
								createMore: false,
							});
						} else {
							this.props.history.push('/admin/accountant/opening-balance');
							this.setState({ loading:false,});
						}
					}
				})
				.catch((err) => {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'error',
						err.data ? err.data.message : 'New Opening Balance Created Unsuccessfully',
					);
				});
		
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading, initValue,loadingMsg} = this.state;
		let{transaction_category_list} = this.props;
		if(transaction_category_list && transaction_category_list?.length !== 0){
			transaction_category_list = this.checkIfOpeningBalanceAlreadyExist(transaction_category_list);
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
									<i className="fas fa-balance-scale" />
										<span className="ml-2">{strings.NewOpeningBalance}</span>
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
										<Col lg={10}>
											<Formik
												initialValues={initValue}
												ref={this.formRef}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validate={(values) => {
													let errors = {};
													if (!values.transactionCategoryId) {
														errors.transactionCategoryId =
															'Transaction category is  required';
													}
													if (!values.effectiveDate) {
														errors.effectiveDate =
															'Date is  required';
													}
													if (!values.openingBalance) {
														errors.openingBalance =
															'Amount is  required';
													}
													if (values.transactionCategoryId && values.transactionCategoryId.label && values.transactionCategoryId.label === "Select Transaction Category") {
														errors.transactionCategoryId =
														'Transaction category is required';
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
																<Row>
																<Col lg={4}>
																<FormGroup className="mb-3">
																<Label htmlFor="transactionCategoryBalanceId">
																<span className="text-danger">* </span>
																{strings.TransactionCategory}
																<div className="tooltip-icon nav-icon fas fa-question-circle ml-1">
																	<span className="tooltiptext">This list will only include categories for which an opening balance has not been created.</span>
																</div>
																</Label>
																		<Select
																		id="transactionCategoryId"
																		name="transactionCategoryId"
																		placeholder={strings.Select+strings.TransactionCategory}
																		options={
																			transaction_category_list
																			  ? selectOptionsFactory.renderOptions(
																				  'transactionCategoryName',
																				  'transactionCategoryId',
																				  transaction_category_list.filter(category =>
																					  this.state.isRegisteredVat ||
																					  ![
																						'VAT Penalty',
																						'Output VAT Adjustment',
																						'Input VAT Adjustment',
																						'VAT Payable',
																						'GCC VAT Payable',
																						'Output VAT',
																						'Input VAT'
																						
																					  ].includes(category.transactionCategoryName.trim()) 
																					)
																					.sort((a, b) => a.transactionCategoryName.localeCompare(b.transactionCategoryName)), 
																				  'Transaction Category'
																				)
																			  : []
																		  }
																		value={props.values.transactionCategoryId}
																		className={
																			props.errors.transactionCategoryId &&
																			props.touched.transactionCategoryId
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) =>{
																			props.handleChange('transactionCategoryId')(
																				option,
																			)
																		}}
																	/>
																	{props.errors.transactionCategoryId &&
																		props.touched.transactionCategoryId && (
																			<div className="invalid-feedback">
																				{props.errors.transactionCategoryId}
																			</div>
																		)}
																			</FormGroup>
																				</Col>
															
																<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="effectiveDate">
																		<span className="text-danger">* </span>
																		{strings.OpeningDate}
																	</Label>
																	<DatePicker
																		id="date"
																		name="effectiveDate"
																		className={`form-control ${
																			props.errors.effectiveDate &&
																			props.touched.effectiveDate
																				? 'is-invalid'
																				: ''
																		}`}
																		placeholderText={strings.Enter+strings.EffectiveDate}
																		selected={props.values.effectiveDate}
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd-MM-yyyy"
																		// maxDate={new Date()}
																		// minDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('effectiveDate')(value);
																		}}
																	/>
																	{props.errors.effectiveDate &&
																		props.touched.effectiveDate && (
																			<div className="invalid-feedback">
																				{props.errors.effectiveDate.includes("nullable()") ? "Opening date is required" :props.errors.effectiveDate}

																			</div>
																		)}
																</FormGroup>
															</Col>

																
															</Row>
															<Row>
															<Col lg={4}>
																<FormGroup className="mb-3">
																	<Label htmlFor="openingBalance">
																		<span className="text-danger">* </span>{strings.Amount}
																	</Label>
																	<Input
																		type="text"
																		maxLength="14,2"
																		name="openingBalance"
																		id="openingBalance"
																		rows="5"
																		className={
																			props.errors.openingBalance &&
																			props.touched.openingBalance
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regEx.test(
																					option.target.value,
																				)
																			)
																			props.handleChange('openingBalance')(
																				option,
																			);
																		}}
																		value={props.values.openingBalance}
																		placeholder={strings.Enter+strings.Amount}
																	/>
																	{props.errors.openingBalance &&
																		props.touched.openingBalance && (
																			<div className="invalid-feedback">
																				{props.errors.openingBalance}
																			</div>
																		)}
																</FormGroup>
															</Col>
															</Row>
														<Row>
														{/* <Col lg={12} className="mt-5"> */}
																<FormGroup className="text-right ml-3 mt-5">
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
																	<i className="fa fa-dot-circle-o"></i> 	{this.state.disabled
																			? 'Creating...'
																			: strings.Create }
																</Button>

																<Button
																	type="button"
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		this.props.history.push(
																			'/admin/accountant/opening-balance',
																		);
																	}}
																>
																	<i className="fa fa-ban"></i>  {strings.Cancel}
																</Button>
																</FormGroup>
																{/* </Col> */}
																</Row></form>
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
)(CreateOpeningBalance);
