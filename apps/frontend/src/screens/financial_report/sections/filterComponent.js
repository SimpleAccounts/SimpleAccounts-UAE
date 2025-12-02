import React, { Component } from 'react';
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
} from 'reactstrap';
import DatePicker from 'react-datepicker';

import { Formik } from 'formik';
import moment from 'moment';

import './style.scss';
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);
class FilterComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			initValue: {
				endDate: moment().endOf('month').format('YYYY-MM-DD hh:mm'),
			},
		};
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
							{strings.CustomizeReport}
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
											<FormGroup className="mb-1">
												<Label htmlFor="endDate"> {strings.EndDate}</Label>
												<DatePicker
													id="date"
													name="endDate"
													className={`form-control`}
													placeholderText="From"
													showMonthDropdown
													autoComplete="off"
												//	maxDate={new Date()}
													showYearDropdown
													value={moment(props.values.endDate).format(
														'DD-MM-YYYY',
													)}
													dropdownMode="select"
													dateFormat="dd-MM-yyyy"
													onChange={(value) => {
														props.handleChange('endDate')(value);
														if (moment(value).isBefore(props.values.endDate)) {
															props.setFieldValue(
																'startDate',
																moment(value).subtract(1, 'M'),
															);
														}
													}}
												/>
											</FormGroup>
										</Col>
													
										<Col lg={12} >
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
export default FilterComponent;
