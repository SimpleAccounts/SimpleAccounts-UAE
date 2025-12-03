import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Col,
	FormGroup,
	Card,
	CardHeader,
	CardBody,
	Row,
	Form,
	Label,
} from 'reactstrap';
import { AuthActions, CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import { data } from '../Language/index'
import { Formik } from 'formik';
import LocalizedStrings from 'react-localization';
import { LeavePage, Loader } from 'components';
import * as PayrollActions from './actions';
import { toast } from 'react-toastify';
import config from 'constants/config';

const mapStateToProps = (state) => {
	return {
		version: state.common.version,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		payrollActions: bindActionCreators(PayrollActions, dispatch),
	};
};



let strings = new LocalizedStrings(data);
class PayrollSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			disabled: false,
			sifEnabled: true,
			loadingMsg: "Loading...",
			disableLeavePage: false
		};

	}


	componentWillMount = () => {

		this.props.payrollActions.getCompanyById().then((res) => {
			if (res.status === 200) {
				this.setState({
					sifEnabled: res.data.generateSif
				});
			}
		});
	};



	handleSubmit = (data) => {
		this.setState({ loading: false, disableLeavePage: true });
		this.props.payrollActions.getPayrollSettings(this.state.sifEnabled).then((res) => {
			if (res.status === 200) {
				toast.success("Payroll Settings Saved Successfully");
				this.props.commonActions.getCompanyDetails();
				this.props.history.push(config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice');
			}
		}).catch((err) => {
			toast.error("Save UnSuccessful")
		})
	}


	render() {
		strings.setLanguage(this.state.language);
		const { sifEnabled, loading, loadingMsg } = this.state;

		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div>
					<div className="create-contact-screen">
						<div className="animated fadeIn">
							<Row>
								<Col lg={12} className="mx-auto">
									<Card>


										<CardHeader>
											<Row>
												<Col lg={12}>
													<div className="h4 mb-0 d-flex align-items-center">
														<i className="fas fa-money-check-alt" />
														<span className="ml-2">{strings.PayrollSettings}</span>
													</div>
												</Col>
											</Row>
										</CardHeader>


										<CardBody>
											<Formik
												initialValues={this.state}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>

														<div>
															<Label htmlFor="sifEnabled">
																{strings.SifPayroll}
															</Label>
															<br />
															<br />

															<FormGroup check inline>
																<div className="custom-radio custom-control">
																	<input
																		className="custom-control-input"
																		type="radio"
																		id="inline-radio3"
																		name="sifEnabled"
																		value={this.state.sifEnabled}
																		checked={
																			this.state.sifEnabled
																		}
																		onChange={(e) => {
																			if (e.target.value) {
																				this.setState({
																					sifEnabled: true,
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
																		name="sifEnabled"
																		value={!this.state.sifEnabled}
																		checked={
																			!this.state.sifEnabled
																		}
																		onChange={(e) => {
																			if (e.target.value) {
																				this.setState({
																					sifEnabled: false,
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


														<Row>
															<Col lg={12} className="mt-5">
																<FormGroup className="text-right">
																	<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			this.setState(
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-dot-circle-o"></i>	{this.state.disabled
																			? 'Saving...'
																			: strings.Save}
																	</Button>

																	<Button
																		color="secondary"
																		className="btn-square"
																		onClick={() => {
																			this.props.history.push(config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice');
																		}}
																	>
																		<i className="fa fa-ban mr-1"></i>{strings.Cancel}
																	</Button>
																</FormGroup>
															</Col>
														</Row>
													</Form>
												)}
											</Formik>
										</CardBody>
									</Card>
								</Col>
							</Row>
						</div>
					</div>
					{this.state.disableLeavePage ? "" : <LeavePage />}
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PayrollSettings);
