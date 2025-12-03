import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { EditorState } from 'draft-js';
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Row,
	Button,
	UncontrolledTooltip,
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { LeavePage, Loader } from 'components';
import { CommonActions, AuthActions } from 'services/global';
import './style.scss';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import * as GeneralSettingActions from './actions';
import { data } from '../Language/index'
import LocalizedStrings from 'react-localization';
import config from 'constants/config';

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {
		generalSettingActions: bindActionCreators(GeneralSettingActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		authActions: bindActionCreators(AuthActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class GeneralSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			editorState: EditorState.createEmpty(),
			initValue: {
				id: '',
				invoiceMailingBody: '',
				invoiceMailingSubject: '',
				invoicingReferencePattern: '',
				mailingHost: '',
				mailingPassword: '',
				mailingAPIKey: '',
				mailingPort: '',
				fromEmailAddress: '',
				mailingUserName: '',
			},
			isPasswordShown: false,
			loading: true,
			disableLeavePage: false,
			message: '',
			emailUsed: '',
			contentState: {},
			selected_smtp_auth: false,
			selected_smtp_enable: false,
			viewEditor: false,
		};
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.content = {};
		this.formRef = React.createRef();
	}

	// onEditorStateChange = (editorState) => {
	//   this.setState({
	//     editorState
	//   },() => {
	//     console.log(editorState.getCurrentContent())
	//   })
	// }
	componentDidMount = () => {
		this.initializeData();
		this.props.authActions
			.checkAuthStatus().then((res) => {
				if (res.status === 200) {
					this.setState({ userId: res.data.userId });
				}
			})
			.catch((err) => {
				this.setState({
					loading: false,
				});
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.props.history.push(config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE);
			});
	}


	testMail = () => {
		this.props.generalSettingActions.getTestUserMailById(this.state.userId ? this.state.userId : 1).then((res) => {
			if (res.status === 200) {
				this.props.commonActions.tostifyAlert(
					'success',
					'Test Mail Sent Successfully',
				);
			}
		})

	}
	initializeData = () => {
		this.props.generalSettingActions
			.getGeneralSettingDetail()
			.then((res) => {
				if (res.status === 200) {
					this.setState(
						{
							loading: false,
							initValue: {
								id: res.data.id,
								invoiceMailingSubject: res.data.invoiceMailingSubject
									? res.data.invoiceMailingSubject
									: '',
								invoicingReferencePattern: res.data.invoicingReferencePattern
									? res.data.invoicingReferencePattern
									: '',
								fromEmailAddress: res.data.fromEmailAddress ?? '',
								mailingHost: res.data.mailingHost ? res.data.mailingHost : '',
								mailingPort: res.data.mailingPort ? res.data.mailingPort : '',
								mailingUserName: res.data.mailingUserName
									? res.data.mailingUserName
									: '',
								mailingPassword: res.data.mailingPassword
									? res.data.mailingPassword
									: '',
								mailingAPIKey: res.data.mailingAPIKey
									? res.data.mailingAPIKey
									: '',
							},
							message: res.data.invoiceMailingBody
								? res.data.invoiceMailingBody
								: '',
							selected_smtp_auth: res.data.mailingSmtpAuthorization === 'true',
							selected_smtp_enable: res.data.mailingSmtpStarttlsEnable === 'true',
							emailUsed: res.data.loggedInUserEmailFlag ? 'loginUser' :
								!res.data.fromEmailAddress || res.data.fromEmailAddress === "" ? 'defaultEmail' :
									res.data.fromEmailAddress ? 'anotherEmail' : '',
						},
						() => {
							this.formRef.current.setFieldValue('fromEmailAddress', res.data.fromEmailAddress ?? '');
							this.content = {
								entityMap: {},
								blocks: [
									{
										key: '637gr',
										text: this.state.message,
										type: 'unstyled',
										depth: 0,
										inlineStyleRanges: [],
										entityRanges: [],
										data: {},
									},
								],
							};
							this.setState({
								viewEditor: true,
							});
						},
					);
				}
			})
			.catch((err) => {
				this.setState({
					loading: false,
				});
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.props.history.push(config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE);
			});
	};

	handleSubmit = (data) => {
		this.setState({ loading: true, disableLeavePage: true });
		const { selected_smtp_auth, selected_smtp_enable, message, emailUsed } = this.state;
		const setLoggedInUserEmail = emailUsed === 'DefaultEmailId' ? false : emailUsed === 'anotherEmail' ? false : emailUsed === 'loginUser' ? true : false;
		const postData = {
			id: data.id,
			invoiceMailingBody: message,
			invoiceMailingSubject: data.invoiceMailingSubject,
			invoicingReferencePattern: data.invoicingReferencePattern,
			mailingHost: data.mailingHost,
			mailingPassword: data.mailingPassword,
			mailingPort: data.mailingPort,
			mailingSmtpAuthorization: selected_smtp_auth,
			mailingAPIKey: data.mailingAPIKey,
			mailingSmtpStarttlsEnable: selected_smtp_enable,
			mailingUserName: data.mailingUserName,
			setLoggedInUserEmail: setLoggedInUserEmail,
			fromEmailAddress: data.fromEmailAddress ? data.fromEmailAddress : null,
		};
		this.props.generalSettingActions
			.updateGeneralSettings(postData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'General Setting Updated Successfully',
					);
					this.props.history.push(config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE);
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};

	onContentStateChange = (contentState) => {
		this.setState(
			{
				contentState,
			},
			() => {
				this.setState({
					message: this.state.contentState.blocks[0].text,
				});
			},
		);
	};
	togglePasswordVisiblity = () => {
		const { isPasswordShown } = this.state;
		this.setState({ isPasswordShown: !isPasswordShown });
	};
	render() {
		strings.setLanguage(this.state.language);
		const { initValue, loading ,emailUsed, isPasswordShown} = this.state;

		return (
			<div className="general-settings-screen">
				<div className="animated fadeIn">
					<Row>
						<Col xs="12">
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="fas fa-envelope"></i>
										<span className="ml-2"> {strings.GeneralSettings}</span>
									</div>
								</CardHeader>
								<CardBody>
									{loading ? (
										<Loader />
									) : (
										<Row>
											<Col>
												<Formik
													initialValues={initValue}
													onSubmit={(values, { resetForm }) => {
														this.handleSubmit(values, resetForm);
													}}
													ref={this.formRef}
													validate={(values) => {
														let errors = {};
														if (emailUsed === 'anotherEmail' && !values.fromEmailAddress) {
															errors.fromEmailAddress = strings.EmailIsRequired;
														}
														return errors
													}}
													validationSchema={Yup.object().shape({
														fromEmailAddress: Yup.string()
															.email(strings.InvalidEmail),
													})}
												>
													{(props) => (
														<Form onSubmit={props.handleSubmit}>
															{/* <h4>{strings.GeneralDetails}</h4>
															<Row>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="invoicingReferencePattern">
																			{' '}
																			{strings.InvoicingReferencePattern}
																		</Label>
																		<Input
																			type="text"
																			id="invoicingReferencePattern"
																			name="invoicingReferencePattern"
																			placeholder={strings.Enter + strings.InvoicingReferencePattern}
																			value={
																				props.values.invoicingReferencePattern
																			}
																			onChange={(option) => {
																				if (
																					option.target.value === '' ||
																					this.regExBoth.test(
																						option.target.value,
																					)
																				) {
																					props.handleChange(
																						'invoicingReferencePattern',
																					)(option);
																				}
																			}}
																			className={
																				props.errors
																					.invoicingReferencePattern &&
																					props.touched.invoicingReferencePattern
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.invoicingReferencePattern &&
																			props.touched
																				.invoicingReferencePattern && (
																				<div className="invalid-feedback">
																					{
																						props.errors
																							.invoicingReferencePattern
																					}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															
												// 				 <Col sm="6">
                                                //     <FormGroup >
                                                //       <Label htmlFor="select">Invoicing Templates</Label>
                                                //       <Select
                                                //         options={[]}
                                                //       />
                                                //     </FormGroup>
                                                //   </Col> 
															</Row> */}
															<h4> {strings.MailConfigurationDetail}</h4>
															<Row className='mt-3'>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingHost">
																			{strings.MailingHost}
																		</Label>
																		<Input
																			type="text"
																			id="mailingHost"
																			name="mailingHost"
																			placeholder={strings.Enter + strings.MailingHost}
																			value={props.values.mailingHost}
																			onChange={(option) => {
																				props.handleChange('mailingHost')(
																					option,
																				);
																			}}
																			className={
																				props.errors.mailingHost &&
																					props.touched.mailingHost
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.mailingHost &&
																			props.touched.mailingHost && (
																				<div className="invalid-feedback">
																					{props.errors.mailingHost}
																				</div>
																			)}
																	</FormGroup>
																</Col>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingPort">
																			{strings.MailingPort}
																		</Label>
																		<Input
																			type="text"
																			id="mailingPort"
																			name="mailingPort"
																			placeholder={strings.Enter + strings.MailingPort}
																			value={props.values.mailingPort}
																			onChange={(option) => {
																				props.handleChange('mailingPort')(
																					option,
																				);
																			}}
																			className={
																				props.errors.mailingPort &&
																					props.touched.mailingPort
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.mailingPort &&
																			props.touched.mailingPort && (
																				<div className="invalid-feedback">
																					{props.errors.mailingPort}
																				</div>
																			)}
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingUserName">
																			{strings.MailingUserName}
																		</Label>
																		<Input
																			type="text"
																			id="mailingUserName"
																			name="mailingUserName"
																			placeholder={strings.Enter + "Mailing" + " " + strings.UserName}
																			value={props.values.mailingUserName}
																			autoComplete="off"
																			onChange={(option) => {
																				props.handleChange('mailingUserName')(
																					option,
																				);
																			}}
																			className={
																				props.errors.mailingUserName &&
																					props.touched.mailingUserName
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.mailingUserName &&
																			props.touched.mailingUserName && (
																				<div className="invalid-feedback">
																					{props.errors.mailingUserName}
																				</div>
																			)}
																	</FormGroup>
																</Col>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingPassword">
																			{strings.MailingPassword}
																		</Label>
																		<Input
																			type= {this.state.isPasswordShown ? "text" : "password"}
																			id="mailingPassword"
																			name="mailingPassword"
																			placeholder={strings.Enter + "Mailing" + " " + strings.Password}
																			autoComplete="new-password"
																			value={props.values.mailingPassword}
																			onChange={(option) => {
																				props.handleChange('mailingPassword')(
																					option,
																				);
																			}}
																			className={
																				props.errors.mailingPassword &&
																					props.touched.mailingPassword
																					? 'is-invalid'
																					: ''
																			}
																		/>
																		{props.errors.mailingPassword &&
																			props.touched.mailingPassword && (
																				<div className="invalid-feedback">
																					{props.errors.mailingPassword}
																				</div>
																			)}
																					<i className={`fa ${isPasswordShown ? "fa-eye" : "fa-eye-slash"} password-icon fa-lg`}
																					onClick={this.togglePasswordVisiblity}
																				></i>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingSmtpAuthorization">
																			{strings.MailingSMTPAuthorization}
																		</Label>
																		<div>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="inline-radio1"
																						name="mailingSmtpAuthorization"
																						checked={
																							this.state.selected_smtp_auth
																						}
																						value={this.state.selected_smtp_auth}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									selected_smtp_auth: true,
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="inline-radio1"
																					>
																						{strings.Yes}
																					</label>
																				</div>
																			</FormGroup>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="inline-radio2"
																						name="mailingSmtpAuthorization"
																						value={false}
																						checked={
																							!this.state.selected_smtp_auth
																						}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									selected_smtp_auth: false,
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="inline-radio2"
																					>
																						{strings.No}
																					</label>
																				</div>
																			</FormGroup>
																		</div>
																	</FormGroup>
																</Col>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="mailingSmtpStarttlsEnable">
																			{strings.MailingSMTPStartTLSEnable}
																		</Label>
																		<div>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="inline-radio3"
																						name="mailingSmtpStarttlsEnable"
																						value={true}
																						checked={
																							this.state.selected_smtp_enable
																						}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									selected_smtp_enable: true,
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="inline-radio3"
																					>
																						{strings.Yes}
																					</label>
																				</div>
																			</FormGroup>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="inline-radio4"
																						name="mailingSmtpStarttlsEnable"
																						value={false}
																						checked={
																							!this.state.selected_smtp_enable
																						}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									selected_smtp_enable: false,
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="inline-radio4"
																					>
																						{strings.No}
																					</label>
																				</div>
																			</FormGroup>
																		</div>
																	</FormGroup>
																</Col>
															</Row>
															<Row>
																{this.state.selected_smtp_auth === true && (
																	<Col sm="6">
																		<FormGroup>
																			<Label htmlFor="Api key"> {strings.APIKey} </Label>
																			<Input
																				type="text"
																				id="mailingAPIKey"
																				name="mailingAPIKey"
																				placeholder={strings.Enter + strings.APIKey}
																				value={props.values.mailingAPIKey}
																				onChange={(option) => {
																					props.handleChange('mailingAPIKey')(
																						option,
																					);
																				}}
																				className={
																					props.errors.mailingAPIKey &&
																						props.touched.mailingAPIKey
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.mailingAPIKey &&
																				props.touched.mailingAPIKey && (
																					<div className="invalid-feedback">
																						{props.errors.mailingAPIKey}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																)}
															</Row>

															<Row>
																<Col sm="6">
																	<FormGroup>
																		<Label htmlFor="emailUsed">
																			{strings.SenderEmail}
																		</Label>
																		<div>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="emailUsed-radio1"
																						name="emailUsed"
																						checked={emailUsed === 'loginUser'}
																						value={true}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									emailUsed: 'loginUser',
																								});
																								props.handleChange('fromEmailAddress')('',);
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="emailUsed-radio1"
																					>
																						{strings.loginUserEmailId}
																					</label>
																				</div>
																			</FormGroup>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="emailUsed-radio2"
																						name="emailUsed"
																						value={false}
																						checked={emailUsed === 'anotherEmail'}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									emailUsed: 'anotherEmail',
																								});
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="emailUsed-radio2"
																					>
																						{strings.AnotherEmailId}
																					</label>
																				</div>
																			</FormGroup>
																			<FormGroup check inline>
																				<div className="custom-radio custom-control">
																					<input
																						className="custom-control-input"
																						type="radio"
																						id="emailUsed-radio3"
																						name="emailUsed"
																						value={false}
																						checked={emailUsed === 'defaultEmail'}
																						onChange={(e) => {
																							if (e.target.value) {
																								this.setState({
																									emailUsed: 'defaultEmail',
																								});
																								props.handleChange('fromEmailAddress')('',);
																							}
																						}}
																					/>
																					<label
																						className="custom-control-label"
																						htmlFor="emailUsed-radio3"
																					>
																						{strings.DefaultEmailId}
																						<i
																							id="emailUsed-radio3-tooltip"
																							className="fa fa-question-circle ml-1"
																						></i>
																						<UncontrolledTooltip
																							placement="right"
																							target="emailUsed-radio3-tooltip"
																						>
																							{strings.CompanyRegistrationEmailAddress}
																						</UncontrolledTooltip>
																					</label>
																				</div>
																			</FormGroup>
																		</div>
																	</FormGroup>
																</Col>
																<Col sm="6"></Col>
																{emailUsed === 'anotherEmail' && (
																	<Col sm="6">
																		<FormGroup>
																			<Label htmlFor="mailingPassword">
																				<span className="text-danger ">* </span>{strings.EmailID}
																			</Label>
																			<Input
																				type="email"
																				maxLength="80"
																				id="fromEmailAddress"
																				name="fromEmailAddress"
																				placeholder={strings.Enter + strings.EmailID}
																				value={props.values.fromEmailAddress}
																				onChange={(option) => {
																					props.handleChange('fromEmailAddress')(
																						option,
																					);
																				}}
																				className={
																					props.errors.fromEmailAddress &&
																						props.touched.fromEmailAddress
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.fromEmailAddress &&
																				props.touched.fromEmailAddress && (
																					<div className="invalid-feedback">
																						{props.errors.fromEmailAddress}
																					</div>
																				)}
																		</FormGroup>
																	</Col>
																)}

															</Row>
															<Row>

																<Col lg={12} className="mt-5">

																	<Button
																		type="button"
																		color="primary"
																		className="btn-square pull-left  mt-5"
																		onClick={() => {
																			this.testMail();
																		}}
																	>
																		<i className="fas fa-envelope"></i> {strings.TestMail}
																	</Button>


																	<FormGroup className="text-right mt-5 ">
																		<Button
																			type="button"
																			name="submit"
																			color="primary"
																			className="btn-square"
																			onClick={() => {
																				this.handleSubmit(props.values)
																				this.props.history.push(
																					config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice'
																				);
																			}}


																		>
																			<i className="fa fa-dot-circle-o"></i> {strings.Save}
																		</Button>
																		<Button
																			type="button"
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				this.props.history.push(
																					config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice'
																				);
																			}}

																		>
																			<i className="fa fa-ban"></i>  {strings.Cancel}
																		</Button>
																	</FormGroup>
																</Col>
															</Row>
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
				</div>
				{this.state.disableLeavePage ? "" : <LeavePage />}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettings);
