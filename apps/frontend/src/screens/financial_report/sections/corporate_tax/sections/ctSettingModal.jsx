import React, { useState } from "react";
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
import Select from "react-select";
import { bindActionCreators } from "redux";
import { CommonActions } from "services/global";
import { data } from "../../../../Language/index";
import LocalizedStrings from "react-localization";
import "../style.scss";
import { Loader } from "components";
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

const CTSettingModal = (props) => {
    const [language] = useState(window["localStorage"].getItem("language"));
    const [loading, setLoading] = useState(false);
    const [fiscalYearOptions] = useState([
        { value: 1, label: 'January - December' },
        { value: 2, label: 'June - May' },
    ]);
    const [isEligibleForCP, setIsEligibleForCP] = useState('');
    const [fiscalYear, setFiscalYear] = useState('');
    const [selectedFlag] = useState(true);
    const [disabled, setDisabled] = useState(false);

    const { openModal, closeModal, previousSettings } = props;

    const saveCTSettings = () => {
        setDisabled(true);
        const { fiscalYearOptions: propsFiscalYearOptions } = props;
        const corporateTaxSettingId = fiscalYear
            ? fiscalYear.value
            : previousSettings?.corporateTaxSettingId
                ? previousSettings?.corporateTaxSettingId
                : propsFiscalYearOptions[0].value;

        const dataNew = {
            isEligibleForCP: isEligibleForCP
                ? isEligibleForCP === 'true' ? true : false
                : previousSettings?.isEligibleForCP,
            corporateTaxSettingId: corporateTaxSettingId,
            selectedFlag: selectedFlag,
        };

        props.ctReportActions
            .saveCTSettings(dataNew)
            .then((res) => {
                if (res.status === 200) {
                    props.commonActions.tostifyAlert(
                        'success',
                        'Settings Saved Successfully!',
                    );
                    props.closeModal(false);
                }
            })
            .catch((err) => {
                setDisabled(false);
                props.commonActions.tostifyAlert(
                    'error',
                    err && err.data ? err.data.message : 'Something Went Wrong',
                );
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
                                    {strings.CorporateTaxSetting}
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
                                            <Col lg={12} className="pl-0">
                                                <FormGroup check className="mb-3 pl-0">
                                                    <Label className="isEligibleForCP">
                                                        <span className="text-danger">* </span>
                                                        Does your company have to pay corporate taxes?
                                                    </Label>
                                                    <br></br>
                                                    <div className="wrapper">
                                                        <Label className="form-check-label ml-4 mr-5 " check>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="inline-radio1"
                                                                name="isEligibleForCP"
                                                                value={true}
                                                                checked={isEligibleForCP === 'true' || previousSettings?.isEligibleForCP}
                                                                onChange={(e) => {
                                                                    if (e.target.value === 'true') {
                                                                        setIsEligibleForCP('true');
                                                                    }
                                                                }}
                                                            />
                                                            {strings.Yes}
                                                        </Label>
                                                        <Label className="form-check-label" check>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="inline-radio2"
                                                                name="isEligibleForCP"
                                                                value={false}
                                                                checked={isEligibleForCP === 'false' || !previousSettings?.isEligibleForCP}
                                                                onChange={(e) => {
                                                                    if (e.target.value === 'false') {
                                                                        setIsEligibleForCP('false');
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
                                                        value={fiscalYear
                                                            ? fiscalYear
                                                            : previousSettings
                                                                ? { 'value': previousSettings?.corporateTaxSettingId, 'label': previousSettings?.fiscalYear }
                                                                : fiscalYearOptions[0]
                                                        }
                                                        onChange={(e) => {
                                                            setFiscalYear(e);
                                                        }}
                                                    />
                                                </Col>
                                            </div>
                                            <br></br>
                                            <b>Note:</b> Once the corporate tax report has been created, the settings cannot be changed
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
                            {!props.ctReport && (
                                <Button
                                    color="primary"
                                    className="btn-square "
                                    onClick={saveCTSettings}
                                >
                                    <i className="fas fa-check-double mr-1"></i>
                                    {strings.Save}
                                </Button>
                            )}
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
)(CTSettingModal);
