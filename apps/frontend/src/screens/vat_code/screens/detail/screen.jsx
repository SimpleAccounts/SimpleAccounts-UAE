import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import * as VatActions from '../../actions';
import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

function NumberFormatCustom(props) {
	const { inputRef, onChange, ...other } = props;

	return (
		<NumberFormat
			{...other}
			getInputRef={inputRef}
			onValueChange={(values) => {
				onChange({
					target: {
						value: values.value,
					},
				});
			}}
			thousandSeparator
			suffix="%"
		/>
	);
}

NumberFormatCustom.propTypes = {
	inputRef: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
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

// Zod validation schema
const updateVatCodeSchema = z.object({
	name: z
		.string()
		.min(1, 'VAT category name is required')
		.max(30, 'Name is too long')
		.regex(/^[a-zA-Z0-9 ]+$/, 'Name must contain only letters, numbers, and spaces'),
	vat: z
		.string()
		.min(1, 'VAT percentage is required')
		.regex(/^(100(\.00?)?|[1-9]?\d(\.\d\d?)?)$/, 'Invalid percentage value'),
});

const DetailVatCode = ({
	vatDetailActions,
	vatActions,
	commonActions,
	history,
	location,
}) => {
	const [language] = useState(() => window.localStorage.getItem('language') || 'en');
	const [loading, setLoading] = useState(false);
	const [dialog, setDialog] = useState(null);
	const [currentVatId, setCurrentVatId] = useState(null);
	const [disabled, setDisabled] = useState(false);
	const [disabled1, setDisabled1] = useState(false);

	const form = useForm({
		resolver: zodResolver(updateVatCodeSchema),
		defaultValues: {
			name: '',
			vat: '',
		},
		mode: 'onChange',
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = form;

	useEffect(() => {
		strings.setLanguage(language);
		initializeData();
	}, []);

	const initializeData = () => {
		if (location.state && location.state.id) {
			setLoading(true);
			vatDetailActions
				.getVatByID(location.state.id)
				.then((res) => {
					if (res.status === 200) {
						setCurrentVatId(location.state.id);
						setLoading(false);
						reset(res.data);
					}
				})
				.catch((err) => {
					history.push('/admin/master/vat-category');
				});
		} else {
			history.push('/admin/master/vat-category');
		}
	};

	const onSubmit = (data) => {
		setDisabled(true);
		vatDetailActions
			.updateVat(data)
			.then((res) => {
				if (res.status === 200) {
					setDisabled(false);
					commonActions.tostifyAlert('success', res.data.message);
					history.push('/admin/master/vat-category');
				}
			})
			.catch((err) => {
				setDisabled(false);
				commonActions.tostifyAlert('error', err.data.message);
			});
	};

	const deleteVat = () => {
		vatActions.getVatCount(currentVatId).then((res) => {
			if (res.data > 0) {
				commonActions.tostifyAlert(
					'error',
					'This Tax catogery is in use ,Cannot delete this Tax Catogery'
				);
			} else {
				const message1 = (
					<text>
						<b>Delete Tax Category?</b>
					</text>
				);
				const message =
					'This Tax Category will be deleted permanently and cannot be recovered. ';
				setDialog(
					<ConfirmDeleteModal
						isOpen={true}
						okHandler={removeVat}
						cancelHandler={removeDialog}
						message={message}
						message1={message1}
					/>
				);
			}
		});
	};

	const removeVat = () => {
		setDisabled1(true);
		vatDetailActions
			.deleteVat(currentVatId)
			.then((res) => {
				if (res.status === 200) {
					commonActions.tostifyAlert('success', res.data.message);
					history.push('/admin/master/vat-category');
				}
			})
			.catch((err) => {
				setDisabled1(false);
				commonActions.tostifyAlert('error', err.data.message);
			});
	};

	const removeDialog = () => {
		setDialog(null);
	};

	const vatCode = /[a-zA-Z0-9 ]+$/;
	const regExPercentage = /^(100(\.00?)?|[1-9]?\d(\.\d\d?)?)$/;

	return loading === true ? (
		<Loader />
	) : (
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
												<Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
													<FormGroup>
														<Label htmlFor="name">
															<span className="text-danger">* </span>
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
														<Controller
															name="name"
															control={control}
															render={({ field }) => (
																<Input
																	type="text"
																	maxLength="30"
																	id="name"
																	placeholder="Enter Tax Category Name"
																	{...field}
																	onChange={(e) => {
																		if (
																			e.target.value === '' ||
																			vatCode.test(e.target.value)
																		) {
																			field.onChange(e);
																		}
																	}}
																	className={errors.name ? 'is-invalid' : ''}
																/>
															)}
														/>
														{errors.name && (
															<div className="invalid-feedback d-block">
																{errors.name.message}
															</div>
														)}
													</FormGroup>
													<FormGroup>
														<Label htmlFor="vat">
															<span className="text-danger">* </span>
															Percentage %
															<i
																id="VatPercentTooltip"
																className="fa fa-question-circle ml-1"
															></i>
															<UncontrolledTooltip
																placement="right"
																target="VatPercentTooltip"
															>
																Percentage – Tx percentage charged by your country
															</UncontrolledTooltip>
														</Label>
														<Controller
															name="vat"
															control={control}
															render={({ field }) => (
																<TextField
																	type="text"
																	size="small"
																	fullWidth
																	variant="outlined"
																	inputProps={{ maxLength: 5 }}
																	id="vat"
																	placeholder="Enter Tax Percentage"
																	{...field}
																	onChange={(e) => {
																		if (
																			e.target.value === '' ||
																			regExPercentage.test(e.target.value)
																		) {
																			field.onChange(e);
																		}
																	}}
																	className={errors.vat ? 'is-invalid' : ''}
																	InputProps={{
																		inputComponent: NumberFormatCustom,
																	}}
																/>
															)}
														/>
														{errors.vat && (
															<div className="invalid-feedback d-block">
																{errors.vat.message}
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
																	disabled={disabled1}
																	onClick={deleteVat}
																>
																	<i className="fa fa-trash"></i>{' '}
																	{disabled1 ? 'Deleting...' : strings.Delete}
																</Button>
															</FormGroup>
															<FormGroup className="text-right">
																<Button
																	type="submit"
																	name="submit"
																	color="primary"
																	className="btn-square mr-3"
																	disabled={disabled}
																>
																	<i className="fa fa-dot-circle-o"></i>{' '}
																	{disabled ? 'Updating...' : strings.Update}
																</Button>
																<Button
																	type="button"
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		history.push('/admin/master/vat-category');
																	}}
																>
																	<i className="fa fa-ban"></i> {strings.Cancel}
																</Button>
															</FormGroup>
														</Col>
													</Row>
												</Form>
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
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailVatCode);
