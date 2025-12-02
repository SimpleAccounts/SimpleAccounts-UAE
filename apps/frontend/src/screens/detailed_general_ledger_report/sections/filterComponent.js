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
import moment from 'moment'

import { selectOptionsFactory } from "utils";
import './style.scss'
import {data}  from '../../Language/index'
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
				startDate: moment().startOf('month').format('YYYY-MM-DD hh:mm'),
				endDate: moment().endOf('month').format('YYYY-MM-DD hh:mm'),
				reportBasis: 'ACCRUAL',
				chartOfAccountId: ''
			}
		}

		this.reportBasis = [
			{ label: 'Cash', value: 'CASH' },
			{ label: 'Accrual', value: 'ACCRUAL' }
		]

	}

	render() {
		strings.setLanguage(this.state.language);
		const { initValue } = this.state
		const { chart_of_account_list } = this.props
		return (
			<div>
				<Card>
					<CardHeader className="d-flex" style={{ justifyContent: 'space-between' }}>
						<div style={{ fontSize: '1.3rem', paddingLeft: '15px' }}>{strings.CustomizeReport}</div>
						<div><i className="fa fa-close" style={{ cursor: 'pointer' }} onClick={this.props.viewFilter}></i></div>
					</CardHeader>
					<CardBody>
						<Formik
							initialValues={initValue}
						>
							{(props) => (
								<Form>
									<Row>
										<Col lg={4}>
											<FormGroup className="mb-3">
												<Label htmlFor="startDate">
													{strings.StartDate}
                                  </Label>
												<DatePicker
													id="date"
													name="startDate"
													className={`form-control`}
													placeholderText="From"
													showMonthDropdown
													showYearDropdown
													value={moment(props.values.startDate).format('DD-MM-YYYY')}
													dropdownMode="select"
													dateFormat="dd-MM-yyyy"
													onChange={(value) => {
														props.handleChange("startDate")(value);
														if (moment(value).isAfter(props.values.endDate)) {
															props.setFieldValue('endDate', moment(value).add(1, 'M'))
														}
													}}
												/>
											</FormGroup>
										</Col>

										<Col lg={4}>
											<FormGroup className="mb-3">
												<Label htmlFor="endDate">
													{strings.EndDate}
                                  </Label>
												<DatePicker
													id="date"
													name="endDate"
													className={`form-control`}
													placeholderText={strings.Select}
													showMonthDropdown
													showYearDropdown
													value={moment(props.values.endDate).format('DD-MM-YYYY')}
													dropdownMode="select"
													dateFormat="dd-MM-yyyy"
													onChange={(value) => {
														props.handleChange("endDate")(value);
														if (moment(value).isBefore(props.values.startDate)) {
															props.setFieldValue('startDate', moment(value).subtract(1, 'M'))
														}
													}}
												/>
											</FormGroup>
										</Col>
									</Row>
									<Row>
										<Col lg={4}>
											<FormGroup className="mb-3">
												<Label htmlFor="reportBasis"> {strings.ReportBasis}</Label>
												<Select
												styles={customStyles}
													className="select-default-width"
													placeholder={strings.Select}
													id="reportBasis"
													name="reportBasis"
													options={this.reportBasis}
													value={props.values.reportBasis}
													onChange={(option) =>
														props.handleChange("reportBasis")(option)
													}
												/>
											</FormGroup>
										</Col>
										<Col lg={4}>
											<FormGroup className="mb-3">
												<Label htmlFor="chart_of_account">{strings.ChartofAccounts}</Label>
												<Select
												// styles={customStyles}
													className="select-default-width"
													placeholder={strings.Select}
													id="chart_of_account"
													name="chart_of_account_list"
													options={chart_of_account_list ? selectOptionsFactory.renderOptions('label', 'value', chart_of_account_list, 'Chart of Account') : []}
													value={props.values.chartOfAccountId}
													onChange={(option) =>
														props.handleChange("chartOfAccountId")(option)
													}
												/>
											</FormGroup>
										</Col>
									</Row>
									<Row>
										<Col lg={12} className="mt-5">
											<FormGroup className="text-right">
												<Button type="button" color="primary" className="btn-square mr-3" onClick={() => { this.props.generateReport(props.values) }
												}>
													<i className="fa fa-dot-circle-o"></i> {strings.RunReport}
                        </Button>

												<Button color="secondary" className="btn-square"
													onClick={this.props.viewFilter}>
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
		)
	}
}



export default FilterComponent