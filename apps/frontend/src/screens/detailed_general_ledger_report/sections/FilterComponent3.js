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
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import { Formik } from 'formik';
import moment from 'moment';
import Select from 'react-select';
import './style.scss';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import { optionFactory, selectOptionsFactory } from 'utils';

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

class FilterComponent3 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window['localStorage'].getItem('language'),
            initValue: {
                startDate: moment().startOf('month').format('YYYY-MM-DD hh:mm'),
                endDate: moment().endOf('month').format('YYYY-MM-DD hh:mm'),
                reportBasis: 'ACCRUAL',
				chartOfAccountId: ''
            },
            selectedPeriod: this.props.customPeriod ? this.props.customPeriod : 'asOn',
            showStartDate: false,
            showEndDate: false,
            showRunReport: false,
            options: [
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'last7days', label: 'Last 7 days (Including Today)' },
                { value: 'last30days', label: 'Last 30 days' },
                { value: 'currentWeek', label: 'Current Week' },
                { value: 'currentMonth', label: 'Current Month' },
                { value: 'lastWeek', label: 'Last Week' },
                { value: 'lastMonth', label: 'Last Month' },
                { value: 'lastQuarter', label: 'Last Quarter' },
                { value: 'yearToDate', label: 'Year to Date (YTD)' },
                { value: 'quarterToDate', label: 'Quarter to Date (QTD)' },
                { value: 'monthToDate', label: 'Month to Date (MTD)' },
                { value: 'lastYear', label: 'Last Year' },
                { value: 'customRange', label: 'Custom Range' },
                { value: 'asOn', label: 'As on' },
            ],
        };
        this.reportBasis = [
            { label: 'Cash', value: 'CASH' },
            { label: 'Accrual', value: 'ACCRUAL' }
        ];
    }
    

    getDateRange = (selectedOption, props) => {
        const currentDate = moment().startOf('day');
        let startDate, endDate;
        let showStartDate = false;
        let showEndDate = false;
        let showRunReport = false;

        switch (selectedOption) {
            case 'today':
                startDate = currentDate.clone().toDate();
                endDate = currentDate.clone().toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'yesterday':
                startDate = currentDate.clone().subtract(1, 'day').toDate();
                endDate = currentDate.clone().subtract(1, 'day').toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'last7days':
                startDate = currentDate.clone().subtract(6, 'days').toDate();
                endDate = currentDate.clone().toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'last30days':
                startDate = currentDate.clone().subtract(29, 'days').toDate();
                endDate = currentDate.clone().toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'currentWeek':
                startDate = currentDate.clone().startOf('week').toDate();
                endDate = currentDate.clone().endOf('week').toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'currentMonth':
                startDate = currentDate.clone().startOf('month').toDate();
                endDate = currentDate.clone().endOf('month').toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'lastWeek':
                startDate = currentDate.clone().subtract(1, 'week').startOf('week').toDate();
                endDate = currentDate.clone().subtract(1, 'week').endOf('week').toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'lastMonth':
                startDate = currentDate.clone().subtract(1, 'month').startOf('month').toDate();
                endDate = currentDate.clone().subtract(1, 'month').endOf('month').toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'lastQuarter':
                startDate = currentDate.clone().subtract(3, 'month').startOf('quarter').toDate();
                endDate = currentDate.clone().subtract(1, 'month').endOf('quarter').toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'yearToDate':
                startDate = currentDate.clone().startOf('year').toDate();
                endDate = currentDate.clone().toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'quarterToDate':
                startDate = currentDate.clone().startOf('quarter').toDate();
                endDate = currentDate.clone().toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'monthToDate':
                startDate = currentDate.clone().startOf('month').toDate();
                endDate = currentDate.clone().toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'lastYear':
                startDate = currentDate.clone().subtract(1, 'year').startOf('year').toDate();
                endDate = currentDate.clone().subtract(1, 'year').endOf('year').toDate();
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(false);
                break;
            case 'customRange':
                startDate = moment().startOf('month').toDate();
                endDate = moment().endOf('month').toDate();
                showStartDate = true;
                showEndDate = true;
                showRunReport = true;
                this.props.generateReport({ startDate, endDate });
                this.props.hideExportOptionsFunctionality(true);
                break;
            case 'asOn':
                startDate = moment().startOf('year').toDate();
                endDate = currentDate.clone().toDate();
                showStartDate = false;
                showEndDate = true;
                showRunReport = true;
                this.props.generateReport({endDate});
                this.props.hideExportOptionsFunctionality(true);
                break;
            default:
                break;

        }
        props.handleChange('startDate')(startDate);
        props.handleChange('endDate')(endDate);

        this.setState({
            startDate,
            endDate,
            showStartDate,
            showEndDate,
            showRunReport,
            initValue: { startDate, endDate }
        });

        return { startDate, endDate };
    };



    render() {
        strings.setLanguage(this.state.language);

        const { setCutomPeriod, chart_of_account_list } = this.props;
        const { initValue, selectedPeriod, showStartDate, showEndDate, showRunReport} = this.state;

        return (
            <Formik initialValues={initValue}>
                {(props) => (
                    <Form>
                        <Row>
                            <Col lg={3}>
                                <div className={`align-items-center pull left ${selectedPeriod !== 'customRange' && selectedPeriod !== 'asOn'}`}>
                                    <FormGroup>
                                        <Label htmlFor="reportingPeriod" style={{ color: 'black', fontWeight: '600', marginTop: '15px' }}>{strings.ReportingPeriod}</Label>
                                        <Select
                                            options={this.state.options}
                                            value={this.state.options.find((option) => option.value === selectedPeriod)}
                                            onChange={(option) => {
                                                this.getDateRange(option.value, props);
                                                this.setState({ selectedPeriod: option.value });
                                                setCutomPeriod(option.value);
                                            }}
                                            placeholder="Select Period"
                                            // styles={customStyles}
                                            id="reportingPeriod"
                                            name="reportingPeriod"
                                            styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    borderColor: 'black',
                                                    height: '30px',
                                                }),
                                                singleValue: (provided) => ({
                                                    ...provided,
                                                    color: 'black',
                                                }),
                                                option: (provided) => ({
                                                    ...provided,
                                                    color: 'black',
                                                }),
                                            }}
                                        />
                                    </FormGroup>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            {selectedPeriod !== 'asOn' && 
                            <Col lg={3}>
                                {showStartDate && (
                                    <FormGroup className="mb-3">
                                        <Label htmlFor="startDate" style={{ color: 'black', marginTop: '15px' }}>{strings.StartDate}</Label>
                                        <DatePicker
                                            id="date"
                                            name="startDate"
                                            className={`form-control`}
                                            placeholderText="From"
                                            showMonthDropdown
                                            showYearDropdown
                                            autoComplete="off"
                                            value={moment(props.values.startDate).format('DD-MM-YYYY')}
                                            dropdownMode="select"
                                            dateFormat="dd-MM-yyyy"
                                            maxDate={props.values.endDate}
                                            onChange={(value) => {
                                                if (value <= props.values.endDate) {
                                                    props.handleChange('startDate')(value);
                                                }
                                            }}
                                        />
                                    </FormGroup>
                                )}
                            </Col>}
                            <Col lg={3}>
                                {showEndDate && (
                                    <FormGroup className="mb-3">
                                        <Label htmlFor="endDate" style={{ color: 'black', marginTop: '15px', borderColor: 'black' }}>{strings.EndDate}</Label>
                                        <DatePicker
                                            id="date"
                                            name="endDate"
                                            className={`form-control`}
                                            autoComplete="off"
                                            placeholderText="To"
                                            showMonthDropdown
                                            showYearDropdown
                                            value={moment(props.values.endDate).format('DD-MM-YYYY')}
                                            dropdownMode="select"
                                            dateFormat="dd-MM-yyyy"
                                            minDate={props.values.startDate}
                                            onClick={() => this.setState({ showEndDate: true })}
                                            onChange={(value) => {
                                                if (value >= props.values.startDate) {
                                                    props.handleChange('endDate')(value);
                                                }
                                            }}
                                        />
                                    </FormGroup>
                                )}
                            </Col>
                        </Row>
                        <Row>
										<Col lg={3}>
											<FormGroup className="mb-3">
												<Label htmlFor="reportBasis" style={{ color: 'black', fontWeight: '600', marginTop: '15px' }}> {strings.ReportBasis}</Label>
												<Select
													styles={{
                                                        control: (provided) => ({
                                                            ...provided,
                                                            borderColor: 'black',
                                                            height: '30px',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            color: 'black',
                                                        }),
                                                        option: (provided) => ({
                                                            ...provided,
                                                            color: 'black',
                                                        }),
                                                    }}
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
										<Col lg={3}>
											<FormGroup className="mb-3">
												<Label htmlFor="chart_of_account" style={{ color: 'black', fontWeight: '600', marginTop: '15px' }}> {strings.ChartofAccounts}</Label>
												<Select
													styles={{
                                                control: (provided) => ({
                                                    ...provided,
                                                    borderColor: 'black',
                                                    height: '30px',
                                                }),
                                                singleValue: (provided) => ({
                                                    ...provided,
                                                    color: 'black',
                                                }),
                                                option: (provided) => ({
                                                    ...provided,
                                                    color: 'black',
                                                }),
                                            }}
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
                        <Row className="justify-content-end">
                            {showRunReport && (
                                <Col lg={3} className="mt-4">
                                    <FormGroup className="text-right">
                                        <Button
                                            type="button"
                                            color="primary"
                                            className="btn-square mr-3"
                                            style={{ marginTop: '15px' }}
                                            onClick={() => {
                                                console.log(props.values);
                                                this.props.generateReport(props.values);
                                                this.setState({ showRunReport: false, showStartDate: false, showEndDate: false });
                                                this.props.hideExportOptionsFunctionality(false);
                                            }}
                                        >
                                            <i className="fa fa-dot-circle-o"></i> {strings.RunReport}
                                        </Button>
                                        <Button
                                            color="secondary"
                                            className="btn-square"
                                            style={{ marginTop: '15px' }}
                                            onClick={() => {
                                                const currentDate = moment();
                                                props.handleChange('endDate')(currentDate.toDate());
                                                this.props.handleCancel();
                                                this.setState({
                                                    selectedPeriod: 'asOn',
                                                    showEndDate: true,
                                                    showRunReport: false,
                                                    showStartDate: false,
                                                });
                                                this.props.generateReport({ endDate: currentDate.toDate() });
                                                this.props.hideExportOptionsFunctionality(false);
                                                console.log(props.values);
                                                console.log(props.values);
                                            }}
                                        >
                                            <i className="fa fa-ban pull"></i> {strings.Cancel}
                                        </Button>
                                    </FormGroup>
                                </Col>
                            )}</Row>
                    </Form>
                )}
            </Formik>
        );
    }
}

export default FilterComponent3;