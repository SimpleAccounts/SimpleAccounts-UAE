import React from "react";
import { connect } from "react-redux";
import {
    Button,
    Row,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    CardBody,
    ModalHeader,
} from "reactstrap";
import { Formik } from "formik";
import Select from "react-select";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import moment from "moment";
import { bindActionCreators } from "redux";
import { CommonActions } from "services/global";
import { toast } from "react-toastify";
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
        payrollEmployeeActions: bindActionCreators(
            PayrollEmployeeActions,
            dispatch
        ),
        ctReportActions: bindActionCreators(CTReportActions, dispatch),
    };
};
const customStyles = {
    control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? "#2064d8" : "#c7c7c7",
        boxShadow: state.isFocused ? null : null,
        "&:hover": {
            borderColor: state.isFocused ? "#2064d8" : "#c7c7c7",
        },
    }),
};

let strings = new LocalizedStrings(data);
class CTReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window["localStorage"].getItem("language"),
            loading: false,
            selectedRows: [],
            actionButtons: {},
            startDate: '',
            reportPeriod: { label: 'Yearly', value: 1 },
            endDate: '',
            dueDate: '',
            ctReprtFor: '',
            dialog: null,
            view: false,
            reportingForYear: '',
        };
    }
    setDates = (value) => {
        //value = '01-1-2024'
        const startDate = new Date(value);
        const endDate = new Date(moment(startDate).add(12, 'month').subtract(1, "days"));
        const dueDate = new Date(moment(endDate).add(9, 'month'))
        this.setState({
            startDate: startDate,
            endDate: endDate,
            dueDate: dueDate,
        })
    }

    static getDerivedStateFromProps(nextProps, prevState) {

    }

    generateCTReport = () => {
        const { openModal, closeModal } = this.props;
        this.setState({ disabled: true });
        const data = this.state;
        const formData = new FormData();
        const postData = {
            startDate: moment(data.startDate).format('DD/MM/YYYY'),
            endDate: moment(data.endDate).format('DD/MM/YYYY'),
            dueDate: moment(data.dueDate).format('DD/MM/YYYY'),
            reportingPeriod: 'Yearly',
            reportingForYear: data.ctReprtFor.label,
        };
        formData.append('startDate', moment(data.startDate).format('DD/MM/YYYY'))
        formData.append('endDate', moment(data.endDate).format('DD/MM/YYYY'))
        formData.append('dueDate', moment(data.dueDate).format('DD/MM/YYYY'))
        formData.append('reportingPeriod', 'Yearly')
        formData.append('reportingForYear', data.ctReprtFor.label)

        this.props.ctReportActions
            .generateCTReport(postData)
            .then((res) => {
                if (res.status === 200) {
                    this.props.commonActions.tostifyAlert(
                        "success",
                        "Report Created Successfully!"
                    );
                }

                this.setState({ ctReprtFor: null }, () => {
                    console.log(this.state)
                    closeModal(false);
                })
            })
            .catch((err) => {
                this.props.commonActions.tostifyAlert(
                    "error",
                    err && err.data ? err.data.message : "Something Went Wrong"
                );
                closeModal(false);
            });
    };

    render() {
        strings.setLanguage(this.state.language);
        const { openModal, closeModal, fiscalYearOptions } = this.props;
        const { initValue, loading } = this.state;
        if (fiscalYearOptions && fiscalYearOptions.length > 1)
            if (!this.state.ctReprtFor || fiscalYearOptions[0]?.label !== this.state.ctReprtFor?.label) {
                this.setDates(fiscalYearOptions[0].value)
                this.setState({ ctReprtFor: fiscalYearOptions[0] })
            }
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
                    <Formik
                        ref={this.formikRef}
                        initialValues={initValue}
                        onSubmit={(values, { resetForm, setSubmitting }) => {
                            this.handleSubmit(values, resetForm);
                        }}
                        validate={(values) => {
                            let errors = {};
                            return errors;
                        }}
                        validationSchema={Yup.object().shape({
                            ctReprtFor: Yup.string().required(
                                'This field is required',
                            ),
                        })}
                    >
                    </Formik>
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
                                            {" "}
                                            <Formik initialValues={initValue}>
                                                {(props) => (
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
                                                                    value={this.state.reportPeriod}
                                                                    placeholder="CT Reporting Period"
                                                                    onChange={(option) => {
                                                                        this.setState({ reportPeriod: option });
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
                                                                    isDisabled={this.props.ctReport}
                                                                    id="ctReprtFor"
                                                                    name="ctReprtFor"
                                                                    placeholder={strings.Select + strings.GenerateCTReportFor}
                                                                    value={this.state.ctReprtFor}
                                                                    onChange={(option) => {
                                                                        const year = option.label.split('-')[1]
                                                                        this.setState({ reportingForYear: year, ctReprtFor: option }, () => {
                                                                            this.setDates(option.value);
                                                                        });
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
                                                                        selected={this.state.startDate}
                                                                        onChange={(date) => {
                                                                            this.setState({ startDate: date });
                                                                        }}
                                                                        value={this.state.startDate}
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        dateFormat="dd-MM-yyyy"
                                                                        className={`form-control ${props.errors.startDate &&
                                                                            props.touched.startDate
                                                                            ? 'is-invalid'
                                                                            : ''
                                                                            }`}
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
                                                                        selected={this.state.endDate}
                                                                        onChange={(date) => {
                                                                            this.setState({ endDate: date });
                                                                        }}
                                                                        value={this.state.endDate}
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        dateFormat="dd-MM-yyyy"
                                                                        className={`form-control ${props.errors.endDate &&
                                                                            props.touched.endDate
                                                                            ? 'is-invalid'
                                                                            : ''
                                                                            }`}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col lg={4}>
                                                                <FormGroup className="mb-3">
                                                                    <Label htmlFor="endDate">
                                                                        {strings.DueDate}
                                                                    </Label>
                                                                    <DatePicker
                                                                        disabled
                                                                        id='dueDate'
                                                                        name='dueDate'
                                                                        selected={this.state.dueDate}
                                                                        onChange={(date) => {
                                                                            this.setState({ dueDate: date });
                                                                        }}
                                                                        value={this.state.dueDate}
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        dateFormat="dd-MM-yyyy"
                                                                        className={`form-control ${props.errors.dueDate &&
                                                                            props.touched.dueDate
                                                                            ? 'is-invalid'
                                                                            : ''
                                                                            }`}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </Form>
                                                )}
                                            </Formik>{" "}
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
                                    title={this.state.monthlyDate ? "" : "Please Select Month"}
                                    onClick={this.generateCTReport}
                                    disabled={
                                        this.state.ctReprtFor === "" || !this.state.ctReprtFor
                                    }
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
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CTReport);
