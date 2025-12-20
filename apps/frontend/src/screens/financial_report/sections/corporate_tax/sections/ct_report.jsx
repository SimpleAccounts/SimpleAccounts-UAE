import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
    Button,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    CardBody,
    ModalHeader,
} from "reactstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import dayjs from '@/utils/date';
import { bindActionCreators } from "redux";
import { CommonActions } from "services/global";
import { data } from "../../../../Language/index";
import LocalizedStrings from "react-localization";
import "../style.scss";
import { Loader, CommonList } from "components";
import * as PayrollEmployeeActions from "../../../../payrollemp/actions";
import * as CTReportActions from "../actions";

const mapStateToProps = (state) => {
    return {
        contact_list: state.request_for_quotation.contact_list,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        commonActions: bindActionCreators(CommonActions, dispatch),
        payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
        ctReportActions: bindActionCreators(CTReportActions, dispatch),
    };
};

let strings = new LocalizedStrings(data);

const CTReport = (props) => {
    const [language] = useState(window["localStorage"].getItem("language"));
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [reportPeriod, setReportPeriod] = useState({ label: 'Yearly', value: 1 });
    const [endDate, setEndDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [ctReprtFor, setCtReprtFor] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [reportingForYear, setReportingForYear] = useState('');

    const { openModal, closeModal, fiscalYearOptions } = props;

    useEffect(() => {
        if (fiscalYearOptions && fiscalYearOptions.length > 0) {
            if (!ctReprtFor || fiscalYearOptions[0]?.label !== ctReprtFor?.label) {
                setDates(fiscalYearOptions[0].value);
                setCtReprtFor(fiscalYearOptions[0]);
            }
        }
    }, [fiscalYearOptions]);

    const setDates = (value) => {
        const start = new Date(value);
        const end = new Date(dayjs(start).add(12, 'month').subtract(1, "days"));
        const due = new Date(dayjs(end).add(9, 'month'));
        setStartDate(start);
        setEndDate(end);
        setDueDate(due);
    };

    const generateCTReport = () => {
        setDisabled(true);
        const postData = {
            startDate: dayjs(startDate).format('DD/MM/YYYY'),
            endDate: dayjs(endDate).format('DD/MM/YYYY'),
            dueDate: dayjs(dueDate).format('DD/MM/YYYY'),
            reportingPeriod: 'Yearly',
            reportingForYear: ctReprtFor.label,
        };

        props.ctReportActions
            .generateCTReport(postData)
            .then((res) => {
                if (res.status === 200) {
                    props.commonActions.tostifyAlert(
                        "success",
                        "Report Created Successfully!"
                    );
                }
                setCtReprtFor(null);
                closeModal(false);
            })
            .catch((err) => {
                props.commonActions.tostifyAlert(
                    "error",
                    err && err.data ? err.data.message : "Something Went Wrong"
                );
                closeModal(false);
            });
    };

    strings.setLanguage(language);

    return (
        <div className="contact-modal-screen">
            <Modal isOpen={openModal} className="modal-success contact-modal">
                <ModalHeader>
                    <Row>
                        <Col lg={12}>
                            <div className="h4 mb-0 d-flex align-items-center">
                                <span className="ml-2">
                                    {strings.GenerateCorporateTaxReport}
                                </span>
                            </div>
                        </Col>
                    </Row>
                </ModalHeader>
                <ModalBody style={{ padding: "15px 0px 0px 0px" }}>
                    <div style={{ padding: " 0px 1px" }}>
                        <div>
                            <CardBody>
                                {loading ? (
                                    <Row>
                                        <Col lg={12}>
                                            <Loader />
                                        </Col>
                                    </Row>
                                ) : (
                                    <>
                                        <Form>
                                            <Row>
                                                <Col lg={4} className=" pull-right ">
                                                    <Label>
                                                        {strings.ReportingPeriod}
                                                    </Label>
                                                    <Select
                                                        isDisabled={true}
                                                        options={CommonList.reportPeriod}
                                                        id="reportPeriod"
                                                        name="reportPeriod"
                                                        value={reportPeriod}
                                                        placeholder="CT Reporting Period"
                                                        onChange={(option) => {
                                                            setReportPeriod(option);
                                                        }}
                                                    />
                                                </Col>
                                                <Col lg={4} className=" pull-right ">
                                                    <Label>
                                                        <span className="text-danger">* </span>
                                                        {strings.GenerateCTReportFor}
                                                    </Label>
                                                    <Select
                                                        options={fiscalYearOptions}
                                                        isDisabled={props.ctReport}
                                                        id="ctReprtFor"
                                                        name="ctReprtFor"
                                                        placeholder={strings.Select + strings.GenerateCTReportFor}
                                                        value={ctReprtFor}
                                                        onChange={(option) => {
                                                            const year = option.label.split('-')[1];
                                                            setReportingForYear(year);
                                                            setCtReprtFor(option);
                                                            setDates(option.value);
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row style={{ marginTop: 20 }}>
                                                <Col lg={4}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="startDate">
                                                            {strings.StartDate}
                                                        </Label>
                                                        <DatePicker
                                                            disabled
                                                            id='startDate'
                                                            name='startDate'
                                                            selected={startDate}
                                                            onChange={(date) => {
                                                                setStartDate(date);
                                                            }}
                                                            value={startDate}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            dateFormat="dd-MM-yyyy"
                                                            className="form-control"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg={4}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="endDate">
                                                            {strings.EndDate}
                                                        </Label>
                                                        <DatePicker
                                                            disabled
                                                            id='endDate'
                                                            name='endDate'
                                                            selected={endDate}
                                                            onChange={(date) => {
                                                                setEndDate(date);
                                                            }}
                                                            value={endDate}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            dateFormat="dd-MM-yyyy"
                                                            className="form-control"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg={4}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="dueDate">
                                                            {strings.DueDate}
                                                        </Label>
                                                        <DatePicker
                                                            disabled
                                                            id='dueDate'
                                                            name='dueDate'
                                                            selected={dueDate}
                                                            onChange={(date) => {
                                                                setDueDate(date);
                                                            }}
                                                            value={dueDate}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            dateFormat="dd-MM-yyyy"
                                                            className="form-control"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </>
                                )}
                            </CardBody>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Row className="mb-4 ">
                        <Col>
                            <Button
                                color="primary"
                                className="btn-square "
                                onClick={generateCTReport}
                                disabled={ctReprtFor === "" || !ctReprtFor}
                            >
                                <i className="fas fa-check-double mr-1"></i>
                                Generate
                            </Button>
                            <Button
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                    closeModal(false);
                                }}
                            >
                                <i className="fa fa-ban"></i> {strings.Cancel}
                            </Button>
                        </Col>
                    </Row>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CTReport);
