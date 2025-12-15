import React, { Component } from 'react'
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	FormGroup,
	Label,
	Form,
} from 'reactstrap'
import DatePicker from "react-datepicker"

import { Formik } from "formik"
import Select from "react-select"
import dayjs from '@/utils/date'
import { selectOptionsFactory } from "utils";
import './style.scss'
import {data}  from '../../../../Language/index'
import LocalizedStrings from 'react-localization';

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
class FilterComponent extends Component {
	constructor(props) {
		super(props)
		this.state = {
			language: window['localStorage'].getItem('language'),
			initValue: {
				startDate: dayjs().startOf('month').format('YYYY-MM-DD hh:mm'),
				endDate: dayjs().endOf('month').format('YYYY-MM-DD hh:mm'),
			}
		}

		this.reportBasis = [
			{ label: 'Cash', value: 'CASH' },
			{ label: 'Accrual', value: 'ACCRUAL' }
		]

	}

	render() {
		strings.setLanguage(this.state.language);
		const { initValue } = this.state;
		return (
			<div>
				<Card>
					<CardHeader
						className="d-flex"
						style={{ justifyContent: 'space-between' }}
					>
						<div style={{ fontSize: '1.3rem', paddingLeft: '15px' }}>
						{strings.CustomizeReport }
						</div>
						<div>
							<i
								className="fa fa-close"
								style={{ cursor: 'pointer' }}
								onClick={this.props.viewFilter}
							></i>
						</div>
					</CardHeader>
					<CardBody>
						<Formik initialValues={initValue}>
							{(props) => (
								<Form>
									<Row>
                                        <Col lg={4}>
											<FormGroup className="mb-3">
												<Label htmlFor="startDate">{strings.StartDate}</Label>
												<DatePicker
													id="date"
													name="startDate"
													className={`form-control`}
													placeholderText="From"
													showMonthDropdown
													showYearDropdown
													autoComplete="off"
													maxDate={props.values.endDate ? dayjs(props.values.endDate).toDate() : null}
													value={dayjs(props.values.startDate).format(
														'DD-MM-YYYY',
													)}
													dropdownMode="select"
													dateFormat="dd-MM-yyyy"
													// onChange={(value) => {
													// 	props.handleChange('startDate')(value);
													// 	if (dayjs(value).isBefore(props.values.startDate)) {
													// 		props.setFieldValue(
													// 			'startDate',
													// 			dayjs(value).add(1, 'M'),
													// 		);
													// 	}
													// }}
													onChange={(value) => {
                                                        props.setFieldValue('startDate', dayjs(value).format('YYYY-MM-DD hh:mm'));
                                                    }}
												/>
											</FormGroup>
										</Col>
										<Col lg={4}>
											<FormGroup className="mb-3">
												<Label htmlFor="endDate">{strings.EndDate}</Label>
												<DatePicker
													id="date"
													name="endDate"
													className={`form-control`}
													autoComplete="off"
													minDate={props.values.startDate ? dayjs(props.values.startDate).toDate() : null}
													placeholderText="From"
													showMonthDropdown
													showYearDropdown
													value={dayjs(props.values.endDate).format(
														'DD-MM-YYYY',
													)}
													dropdownMode="select"
													dateFormat="dd-MM-yyyy"
													// onChange={(value) => {
													// 	props.handleChange('endDate')(value);
													// 	if (dayjs(value).isBefore(props.values.endDate)) {
													// 		props.setFieldValue(
													// 			'endDate',
													// 			dayjs(value).subtract(1, 'M'),
													// 		);
													// 	}
													// }}
													onChange={(value) => {
                                                        props.setFieldValue('endDate', dayjs(value).format('YYYY-MM-DD hh:mm'));
                                                    }}
												/>
											</FormGroup>
										</Col>
									</Row>
									<Row>
										<Col lg={12} className="mt-5">
											<FormGroup className="text-right">
												<Button
													type="button"
													color="primary"
													className="btn-square mr-3"
													onClick={() => {
														this.props.generateReport(props.values);
													}}
												>
													<i className="fa fa-dot-circle-o"></i> {strings.RunReport}
												</Button>

												<Button
													color="secondary"
													className="btn-square"
													onClick={this.props.viewFilter}
												>
													<i className="fa fa-ban"></i> {strings.Cancel}
												</Button>
											</FormGroup>
										</Col>
									</Row>
								</Form>
							)}
						</Formik>
					</CardBody>
				</Card>
			</div>
		);
	}
}



export default FilterComponent