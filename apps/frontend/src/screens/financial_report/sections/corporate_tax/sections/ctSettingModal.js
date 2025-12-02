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
        payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
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
class CTSettingModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window["localStorage"].getItem("language"),
            loading: false,
            selectedRows: [],
            actionButtons: {},
            fiscalYearOptions: [
                { value: 1, label: 'January - December' },
                { value: 2, label: 'June - May' },
            ],
            isEligibleForCP: '',
            fiscalYear: '',
            dialog: null,
            view: false,
            selectedFlag: true,
        };
        this.formikRef = React.createRef();
    }
    saveCTSettings = (data, resetForm) => {
        this.setState({ disabled: true });
        const{fiscalYearOptions} = this.props;
        const corporateTaxSettingId = this.state.fiscalYear ? this.state.fiscalYear.value : this.props.previousSettings?.corporateTaxSettingId ? this.props.previousSettings?.corporateTaxSettingId : fiscalYearOptions[0].value;
        const dataNew = {
            isEligibleForCP: this.state.isEligibleForCP ? this.state.isEligibleForCP === 'true' ? true : false : this.props.previousSettings?.isEligibleForCP,
            corporateTaxSettingId: corporateTaxSettingId,
            selectedFlag: this.state.selectedFlag,
        };
        // const postData = this.getData(dataNew);
        this.props.ctReportActions
            .saveCTSettings(dataNew)
            .then((res) => {
                if (res.status === 200) {
                    this.props.commonActions.tostifyAlert(
                        'success',
                        'Settings Saved Successfully!',
                    );
                    this.props.closeModal(false);
                }
            })
            .catch((err) => {
                this.setState({ disabled: false });
                this.props.commonActions.tostifyAlert(
                    'error',
                    err && err.data ? err.data.message : 'Something Went Wrong',
                );
            });
    };

    displayMsg = (err) => {
        toast.error(`${err.data.message}`, {
            position: toast.POSITION.TOP_RIGHT,
        });
    };

    render() {
        strings.setLanguage(this.state.language);
        const { openModal, closeModal, previousSettings } = this.props;
        const { initValue, loading, fiscalYearOptions } = this.state;
        return (
            <div className="contact-modal-screen">
                <Modal isOpen={openModal} className="modal-success contact-modal">
                    <ModalHeader>
                        <Row>
                            <Col lg={12}>
                                <div className="h4 mb-0 d-flex align-items-center">
                                    <span className="ml-2">
                                        {strings.CorporateTaxSetting}
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
                            fiscalYear: Yup.string().required(
                                'This field is required',
                            ),
                        })}
                    >
                    </Formik>
                    <ModalBody style={{ padding: "15px 0px 0px 0px" }}>
                        <div style={{ padding: " 0px 1px" }}>
                            <div>
                                <CardBody>
                                    {loading ? (<Row>
                                        <Col lg={12}>
                                            <Loader />
                                        </Col>
                                    </Row>) : (<>{" "}
                                        <Formik initialValues={initValue}>
                                            {(props) => (
                                                <Form>
                                                    <Col lg={12} className="pl-0">
                                                        <FormGroup check className="mb-3 pl-0">
                                                            <Label className="isEligibleForCP"><span className="text-danger">* </span>
                                                                Does your company have to pay corporate taxes?
                                                            </Label>
                                                            <br></br>
                                                            <div className="wrapper">
                                                                <Label className="form-check-label ml-4 mr-5 " check
                                                                >
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="inline-radio1"
                                                                        name="isEligibleForCP"
                                                                        value={true}
                                                                        checked={this.state.isEligibleForCP === 'true' || previousSettings?.isEligibleForCP}
                                                                        onChange={(e) => {
                                                                            if (e.target.value === 'true') {
                                                                                this.setState({ isEligibleForCP: 'true' });
                                                                            }
                                                                        }}
                                                                    />
                                                                    {strings.Yes}
                                                                </Label>
                                                                <Label
                                                                    className="form-check-label"
                                                                    check
                                                                >
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="inline-radio2"
                                                                        name="isEligibleForCP"
                                                                        value={false}
                                                                        checked={this.state.isEligibleForCP === 'false' || !previousSettings?.isEligibleForCP}
                                                                        onChange={(e) => {
                                                                            console.log(e.target.value, "ghjghjgjh")
                                                                            if (e.target.value === 'false') {
                                                                                this.setState({ isEligibleForCP: 'false' });
                                                                            }
                                                                        }}
                                                                    />
                                                                    {strings.No}
                                                                </Label>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <div className="mt-3">
                                                        <Col lg={4} className="pl-0">
                                                            <Label>
                                                                <span className="text-danger">* </span>
                                                                Fiscal Year
                                                            </Label>
                                                            <Select
                                                                options={fiscalYearOptions}
                                                                id="fiscalYear"
                                                                name="fiscalYear"
                                                                value={this.state.fiscalYear ? this.state.fiscalYear : previousSettings ? { 'value': previousSettings?.corporateTaxSettingId, 'label': previousSettings?.fiscalYear } : fiscalYearOptions[0] }
                                                                onChange={(e) => {
                                                                    props.setFieldValue('fiscalYear', '',);
                                                                    this.setState({ fiscalYear: e });
                                                                }}
                                                            />
                                                        </Col>
                                                    </div>
                                                    <br></br>
                                                    <b>Note:</b> Once the corporate tax report has been created, the settings cannot be changed
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
                                {!this.props.ctReport && (<Button
                                    color="primary"
                                    className="btn-square "
                                    title={this.state.monthlyDate ? "" : "Please Select Month"}
                                    onClick={this.saveCTSettings}
                                >
                                    <i className="fas fa-check-double mr-1"></i>
                                    {strings.Save}
                                </Button>)}
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
)(CTSettingModal);