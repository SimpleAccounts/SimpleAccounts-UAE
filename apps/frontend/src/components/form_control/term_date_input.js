import React from 'react';
import {
    FormGroup,
    UncontrolledTooltip,
    Label,
    Col,
} from 'reactstrap';
import { connect } from 'react-redux';
import Select from 'react-select';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';
import { selectOptionsFactory } from 'utils';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

const mapStateToProps = (state) => {
    return {
        companyDetails: state.common.company_details,
    };
};

function setDate(term, invoiceDate) {
    term = term ? term.value ?? term : '';
    const val = term ? term.split('_') : '';
    const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];
    const values = invoiceDate;
    if (temp && values) {
        const date1 = moment(values).add(temp, 'days').toDate();
        return date1;
    }
    return '';
};
const termList = [
    { label: 'Net 7 Days', value: 'NET_7' },
    { label: 'Net 10 Days', value: 'NET_10' },
    { label: 'Net 15 Days', value: 'NET_15' },
    { label: 'Net 30 Days', value: 'NET_30' },
    { label: 'Net 45 Days', value: 'NET_45' },
    { label: 'Net 60 Days', value: 'NET_60' },
    { label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
];

function TermDateInput(props) {
    let strings = new LocalizedStrings(data);
    strings.setLanguage(window['localStorage'].getItem('language'));
    const { onChange, fields } = props;
    const { term, invoiceDate, invoiceDueDate } = fields;
    
    return (
        <>
            <Col lg={3}>
                <FormGroup className="mb-3">
                    <Label htmlFor="term">
                        {term.required && <span className="text-danger">* </span>}{term.label}{' '}
                        <i
                            id="UncontrolledTooltipTerm"
                            className="fa fa-question-circle ml-1"
                        ></i>
                        <UncontrolledTooltip
                            placement="right"
                            target="UncontrolledTooltipTerm"
                        >
                            <p>
                                {' '}
                                Terms- The duration given to a buyer for
                                payment.
                            </p>

                            <p>
                                Net 7 – payment due in 7 days from
                                invoice date{' '}
                            </p>

                            <p>
                                {' '}
                                Net 10 – payment due in 10 days from
                                invoice date{' '}
                            </p>

                            <p>
                                {' '}
                                Net 30 – payment due in 30 days from
                                invoice date{' '}
                            </p>
                        </UncontrolledTooltip>
                    </Label>
                    <Select
                        options={
                            termList
                                ? selectOptionsFactory.renderOptions(
                                    'label',
                                    'value',
                                    termList,
                                    'Terms',
                                )
                                : []
                        }
                        isDisabled={term.disabled}
                        id="term"
                        name="term"
                        placeholder={strings.Select + strings.Terms}
                        value={term.values?.value ? term.values : termList.find((option) => option.value == term.values)}
                        onChange={(option) => {
                            if (option.value) {
                                const invoiceDueDate = setDate(option.value, invoiceDate.value ?? new Date())
                                onChange('term', option.value);
                                onChange('invoiceDueDate', invoiceDueDate);
                            } else
                                onChange('term', '');
                        }}
                        className={`${term.errors && term.touched
                            ? 'is-invalid'
                            : ''
                            }`}
                    />
                    {term.errors && term.touched && (
                        <div className="invalid-feedback">
                            {term.errors}
                        </div>
                    )}
                </FormGroup>
            </Col>
            <Col lg={3}>
                <FormGroup className="mb-3">
                    <Label htmlFor={invoiceDate.name}>
                        <span className="text-danger">* </span>
                        {invoiceDate.label}
                    </Label>
                    <DatePicker
                        id={invoiceDate.name}
                        name={invoiceDate.name}
                        placeholderText={invoiceDate.placeholder}
                        showMonthDropdown
                        showYearDropdown
                        dateFormat="dd-MM-yyyy"
                        dropdownMode="select"
                        value={invoiceDate.values}
                        selected={invoiceDate.values}
                        minDate={invoiceDate.minDate}
                        onChange={(value) => {
                            const invoiceDueDate = setDate(term.values, value)
                            onChange('invoiceDate', value);
                            onChange('invoiceDueDate', invoiceDueDate);
                        }}
                        className={`form-control ${invoiceDate.errors &&
                            invoiceDate.touched
                            ? 'is-invalid'
                            : ''
                            }`}
                    />
                    {invoiceDate.errors &&
                        invoiceDate.touched && (
                            <div className="invalid-feedback">
                                {invoiceDate.errors}
                            </div>
                        )}
                </FormGroup>
            </Col>
            <Col lg={3}>
                <FormGroup className="mb-3">
                    <Label htmlFor={invoiceDueDate.name}>
                        {invoiceDueDate.label}
                    </Label>
                    <div>
                        <DatePicker
                            className="form-control"
                            id={invoiceDueDate.name}
                            name={invoiceDueDate.name}
                            placeholderText={invoiceDueDate.placeholder}
                            showMonthDropdown
                            showYearDropdown
                            disabled={invoiceDueDate.disabled}
                            dateFormat="dd-MM-yyyy"
                            dropdownMode="select"
                            selected={invoiceDueDate.values}
                            value={invoiceDueDate.values}
                            onChange={(value) => {
                                onChange('invoiceDueDate', value);
                            }}
                        />
                    </div>
                </FormGroup>
            </Col>
        </>
    )
}

export default connect(mapStateToProps, null)(TermDateInput);
