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
import { Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';
import * as VatDetailActions from './actions';
import * as VatActions from '../../actions'
import { Formik } from 'formik';
import * as Yup from 'yup';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import NumberFormat from "react-number-format";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";

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
		vatDetailActions: bindActionCreators(VatDetailActions, dispatch), 
		vatActions: bindActionCreators(VatActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class DetailVatCode extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			vatData: {},
			loading: false,
			dialog: false,
			current_vat_id: null,
			disabled: false,
			disabled1:false,
		};

		this.saveAndContinue = false;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regEx = /^[0-9\d]+$/;
		this.regExPercentage =/^(100(\.00?)?|[1-9]?\d(\.\d\d?)?)$/;
		this.vatCode = /[a-zA-Z0-9 ]+$/;
	}

	componentDidMount = () => {
		if (this.props.location.state && this.props.location.state.id) {
			this.setState({ loading: true });
			this.props.vatDetailActions
				.getVatByID(this.props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						this.setState({
							current_vat_id: this.props.location.state.id,
							loading: false,
							vatData: res.data,
						});
					}
				})
				.catch((err) => {
					this.props.history.push('/admin/master/vat-category');
				});
		} else {
			this.props.history.push('/admin/master/vat-category');
		}
	};

	// Create or Edit Vat
	handleSubmit = (data) => {
		this.setState({ disabled: true });
		this.props.vatDetailActions
			.updateVat(data)
			.then((res) => {
				if (res.status === 200) {
					this.setState({ disabled: false });
					this.props.commonActions.tostifyAlert(
						'success',
						res.data.message
					);
					this.props.history.push('/admin/master/vat-category');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert('error', err.data.message);
			});
	};

	deleteVat = () => {
		const { current_vat_id } = this.state;
		this.props.vatActions
		.getVatCount(current_vat_id)
		.then((res) => {
			if (res.data > 0) {
				this.props.commonActions.tostifyAlert(
					'error',
					'This Tax catogery is in use ,Cannot delete this Tax Catogery',
				);
			} else {
		const message1 =
        <text>
        <b>Delete Tax Category?</b>
        </text>
        const message = 'This Tax Category will be deleted permanently and cannot be recovered. ';
		this.setState({
			dialog: (
				<ConfirmDeleteModal
					isOpen={true}
					okHandler={this.removeVat}
					cancelHandler={this.removeDialog}
					message={message}
					message1={message1}
				/>
			),
		});
	}
});
	};

	removeVat = () => {
		this.setState({ disabled1: true });
		const { current_vat_id } = this.state;
		this.props.vatDetailActions
			.deleteVat(current_vat_id)
			.then((res) => {
				if (res.status === 200) {
					// this.success('Chart Account Deleted Successfully');
					this.props.commonActions.tostifyAlert(
						'success',
						res.data.message,
					);
					this.props.history.push('/admin/master/vat-category');
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data.message 
				);
			});
	};

	removeDialog = () => {
		this.setState({
			dialog: null,
		});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { loading, dialog } = this.state;

		return (
			loading ==true? <Loader/> :
<div>
			<div className="detail-vat-code-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<Card>
								<CardHeader>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon icon-briefcase" />
										<span className="ml-2">Update Tax Category</span>
									</div>
								</CardHeader>
								<CardBody>
									{dialog}
									{loading ? (
										<Loader></Loader>
									) : (
										<Row>
											<Col lg={6}>
												<Formik
													initialValues={this.state.vatData}
													onSubmit={(values) => {
														this.handleSubmit(values);
													}}
													validationSchema={Yup.object().shape({
														name: Yup.string().required(
															'VAT category name is required',
														),
														vat: Yup.string().required(
															'VAT percentage is required',
														),
													})}
												>
													{(props) => (
														<Form
															onSubmit={props.handleSubmit}
															name="simpleForm"
														>
															<FormGroup>
															<Label htmlFor="name">
																<span className="text-danger">* </span>
																 {/* {strings.VatCategoryName} */}
																	Tax Category Name
																<i
																	id="VatCodeTooltip"
																	className="fa fa-question-circle ml-1"
																></i>
																<UncontrolledTooltip
																	placement="right"
																	target="VatCodeTooltip"
																>
																	Tax Category Name – Unique identifier Tax category
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
																{/* {strings.Percentage} */}
																	Percentage %
																<i
																	id="VatPercentTooltip"
																	className="fa fa-question-circle ml-1"
																></i>
																<UncontrolledTooltip
																	placement="right"
																	target="VatPercentTooltip"
																>
																	Percentage – Tx percentage charged by your
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
																placeholder="Enter Tax Percentage"
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
															<Row>
																<Col
																	lg={12}
																	className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
																>
																	<FormGroup>
																		<Button
																			type="button"
																			color="danger"
																			className="btn-square"
																			disabled1={this.state.disabled1}
																			onClick={this.deleteVat}
																		>
																			<i className="fa fa-trash"></i>	 {this.state.disabled1
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
																			type="submit"
																			color="secondary"
																			className="btn-square"
																			onClick={() => {
																				this.props.history.push(
																					'/admin/master/vat-category',
																				);
																			}}
																		>
																			<i className="fa fa-ban"></i> {this.state.disabled1
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
									)}
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailVatCode);
