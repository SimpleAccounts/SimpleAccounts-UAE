import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { selectCurrencyFactory } from 'utils';
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
import _ from 'lodash';
import { LeavePage, Loader } from 'components';
import { AuthActions,CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import * as CreateCurrencyConvertActions from './actions';
import * as CurrencyConvertActions from '../../actions';
import { Formik } from 'formik';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import * as Yup from 'yup';

const mapStateToProps = (state) => {
	return {
		
		currency_list: state.common.currency_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
		createCurrencyConvertActions: bindActionCreators(CreateCurrencyConvertActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		authActions: bindActionCreators(AuthActions, dispatch),
	}
};

let strings = new LocalizedStrings(data);
class CreateCurrencyConvert extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading:false,
			initValue: {
				currencyCode: '',
				exchangeRate:'',
			},
			exist: false,
			createDisabled: false,
			data: '',
			basecurrency:[],
			createMore: false,
			currency_list : [],
			selectedStatus: true,
			isActive: true,
			loadingMsg:"Loading...",
			disableLeavePage:false
			
		};
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,6}$$/;
		this.formRef = React.createRef();
	}
	componentWillMount = () => {
		this.props.authActions.getCurrencylist() 
		.then((res) => {
			if (res.status === 200) {
				this.setState({ currency_list: res.data });
			}
		})
		.catch((err) => {
			this.props.commonActions.tostifyAlert(
				'error',
				err && err.data ? err.data.message : 'Something Went Wrong',
			);
			this.setState({ loading: false });
		});;
	}
	componentDidMount = () => {
	
		this.getCompanyCurrency();
	};

	getCompanyCurrency = (basecurrency) => {
		this.props.currencyConvertActions
			.getCompanyCurrency()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ basecurrency: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ loading: false });
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

	// Create or Edit Currency conversion
	handleSubmit = (data, resetForm) => {
		this.setState({
			createDisabled: true,
		})
		const obj = {
			currencyCode: data.currencyCode,
			exchangeRate: data.exchangeRate,
			isActive:this.state.isActive
		};
		this.setState({ loading:true, disableLeavePage:true, loadingMsg:"Creating Currency Conversion..."});
		this.props.createCurrencyConvertActions
			.createCurrencyConvert(obj)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ createDisabled: false });
					this.setState({ loading:false});
					this.props.commonActions.tostifyAlert(
						'success',
						res.data ? res.data.message : 'Currency Convert Created Successfully'
					);

					if (this.state.createMore) {
						resetForm(this.state.initValue);
						this.setState({
							createMore: false,
							disableLeavePage: false,
						});
					} else {
						this.props.history.push('/admin/master/CurrencyConvert');
						this.setState({ loading:false,});
					}
				}
			})
			.catch((err) => {
				this.setState({ createDisabled: false, loading: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Currency Convert Created Unsuccessfully'
				);
			});
			
	};

	validationCheck = (value) => {
		console.log(value)
		const data = {
			moduleType: 10,
			currencyCode: value,
		};
		this.props.createCurrencyConvertActions.checkValidation(data).then((response) => {
			if (response.data === 'Currency Conversions Already Exists') {
				this.setState({
					exist: true,
					createDisabled: false,
				})
				// this.props.commonActions.tostifyAlert(
				// 	'error',
				//  	'Currency Already exists',
				// );
			} else {
				this.setState({
					exist: false,
				});
			}
		});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading, loadingMsg,initValue,currency_list} = this.state;
		
		const{currencyList} =this.props;
		return (
			loading === true ? <Loader loadingMsg={loadingMsg}/> :
			<div>
				<div className="vat-code-create-screen">
					<div className="animated fadeIn">
						<Row>
							<Col lg={12}>
								<Card>
									<CardHeader>
										<div className="h4 mb-0 d-flex align-items-center">
											<i className="nav-icon nav-icon fas fa-money" />
											<span className="ml-2"> {strings.NewCurrencyConversion}</span>
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
														if (this.state.exist === true) {
															errors.currencyCode =
																'Currency already exists';
														}
														return errors;
													}}
													validationSchema={Yup.object().shape({
														currencyCode: Yup.string().required(
															strings.ExchangeCurrencyRequired
														),
														exchangeRate: Yup.string().required(
																strings.ExchangeRateRequired
															).test('exchangeRate', 'Exchange rate should be greater than 0',
																(value) => {
																	if (value > 0) {
																		return true;
																	} else {
																		return false;
																	}},),
													})}
												>
												{(props) => {
													const {values, touched, errors, handleSubmit,} = props;
													return (
														<form onSubmit={handleSubmit}>
															<Row>
																<Col >
																	<FormGroup className="mb-3">
																		<Label htmlFor="active">
																			<span className="text-danger">* </span>{strings.Status}
																		</Label>
																		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
																		<FormGroup check inline>
																			<div className="custom-radio custom-control">
																				<input
																					className="custom-control-input"
																					type="radio"
																					id="inline-radio1"
																					name="active"
																					checked={
																						this.state.selectedStatus
																					}
																					value={true}
																					onChange={(e) => {
																						if (e.target.value === 'true') {
																							this.setState({
																								selectedStatus: true,
																								isActive: true
																							});
																						}
																					}}
																				/>
																				<label
																					className="custom-control-label"
																					htmlFor="inline-radio1"
																				>
																					{strings.Active}
																				</label>
																			</div>
																			</FormGroup>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="inline-radio2"
																						name="active"
																						value={false}
																						checked={
																							!this.state.selectedStatus
																						}
																						onChange={(e) => {
																							if (e.target.value === 'false') {
																								this.setState({
																									selectedStatus: false,
																									isActive: false
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="inline-radio2"
																					>
																						{strings.Inactive}
																					</label>
																				</div>
																			</FormGroup>
																		</FormGroup>
																	</Col>
																</Row>
																<Row>
																	<Col lg={1}>
																		<FormGroup className="mt-2">
																			<Label>
																				{strings.Value}
																			</Label>
																			<Input
																				disabled
																				id="1"
																				name="1"
																				value={1 +" "+ (props.values.currencyIsoCode 
																						? props.values.currencyIsoCode : "")}
																			/>
																		</FormGroup>
																	</Col>
																	<Col lg={4}>
																		<FormGroup className="mt-2">
																			<Label htmlFor="currencyCode">
																				{strings.ExchangeCurrency}
																			</Label>
																			<Select
																				options={
																					currency_list
																						? selectCurrencyFactory.renderOptions(
																								'currencyName',
																								'currencyCode',
																								currency_list,
																								'Currency',
																							)
																						: []
																				}
																				value={
																					currency_list &&
																					selectCurrencyFactory
																						.renderOptions(
																							'currencyName',
																							'currencyCode',
																							currency_list,
																							'Currency',
																						)
																						.find(
																							(option) =>
																								option.value ===
																								+props.values
																									.currencyCode,
																						)
																				}
																				onChange={(options) => {
																					if (options && options.value) {
																						props.handleChange(
																							'currencyCode',
																						)(options.value);
																						props.handleChange('currencyIsoCode',)(options.iso);
																					} else {
																						props.handleChange(
																							'currencyCode',
																						)('');
																					}
																					this.validationCheck(
																						options.value,
																					);
																				}}
																				placeholder={strings.Select+strings.Currency}
																				id="currencyCode"
																				name="currencyCode"
																				className={
																					props.errors.currencyCode &&
																					props.touched.currencyCode
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.currencyCode &&
																				props.touched.currencyCode && (
																					<div className="invalid-feedback">
																						{props.errors.currencyCode}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																	<FormGroup className="mt-5"><label><b>=</b></label>	</FormGroup>
																	<Col lg={3}>
																		<FormGroup className="mt-2">
																			<Label htmlFor="exchangeRate">
																				{strings.Exchangerate}
																			</Label>
																			<Input
																				type="text"
																				maxLength="20"
																				id="exchangeRate"
																				name="exchangeRate"
																				placeholder={strings.Enter+strings.Exchangerate}
																				onChange={(option) => {
																					if (
																						option.target.value === '' ||
																						this.regDecimal.test(
																							option.target.value,
																						)
																					) {
																						props.handleChange('exchangeRate')(
																							option,
																						);
																					}
																				}}
																				value={values.exchangeRate}
																				className={
																					errors.exchangeRate &&
																					touched.exchangeRate
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{errors.exchangeRate &&
																			touched.exchangeRate && (
																				<div className="invalid-feedback">
																					{errors.exchangeRate}
																				</div>
																			)}
																		</FormGroup>
																	</Col>	
																	<Col lg={3}>
																		<FormGroup className="mt-2">
																			<Label htmlFor="currencyName">
																				{strings.BaseCurrency}
																			</Label>
																			<Input
																				disabled
																				type="text"
																				id="currencyName"
																				name="currencyName"
																				value=	{
																					this.state.basecurrency.currencyName }
																			/>
																		</FormGroup>
																	</Col>
																</Row>
																<span style={{fontWeight:'bold'}}>
																	Note: If a currency is associated with any bank, contact or document, it cannot be deleted.
																</span>
																<FormGroup className="text-right mt-5">
																<Button
																	type="submit"
																	name="submit"
																	color="primary"
																	className="btn-square mr-3"
																	disabled={this.state.createDisabled}
																	onClick={() => {                                                              
																		props.handleBlur();
																		if(props.errors &&  Object.keys(props.errors).length !== 0)
																		this.props.commonActions.fillManDatoryDetails();
																		}}
																>
																	<i className="fa fa-dot-circle-o"></i> {this.state.createDisabled
																			? 'Creating...'
																			: strings.Create }
																</Button>

																<Button
																	name="button"
																	color="primary"
																	className="btn-square mr-3"
																	createDisabled={this.state.createDisabled}
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
																	<i className="fa fa-refresh"></i> {this.state.createDisabled
																			? 'Creating...'
																			: strings.CreateandMore }
																</Button>

																<Button
																	type="button"
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		this.props.history.push(
																			'/admin/master/CurrencyConvert',
																		);
																	}}
																>
																	<i className="fa fa-ban"></i> {strings.Cancel}
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
)(CreateCurrencyConvert);
