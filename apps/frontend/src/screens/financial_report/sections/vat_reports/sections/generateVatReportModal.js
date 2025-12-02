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
import { Loader } from "components";
import * as PayrollEmployeeActions from "../../../../payrollemp/actions";
import * as VatReportActions from "../actions";

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
    vatReportActions: bindActionCreators(VatReportActions, dispatch),
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
class GenerateVatReportModal extends React.Component {
  constructor(props) {
    var date = new Date();
    var lastdayoflastmonth = new Date();

    var firstdayoflastmonth = new Date();
    firstdayoflastmonth.setDate(1);

    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      loading: false,
      selectedRows: [],
      actionButtons: {},
      initValue: {
        // startDate: firstdayoflastmonth.setMonth(firstdayoflastmonth.getMonth()-1),
        // endDate: lastdayoflastmonth.setMonth(lastdayoflastmonth.getMonth(), 0),
        startDate: new Date(),
        endDate: new Date(
          new Date().setMonth(
            new Date().getMonth() + this.props.monthOption.value
          )
        ),
      },
      VRN: "",
      dialog: null,
      filterData: {
        name: "",
        email: "",
      },
      csvData: [],
      view: false,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.employee_list !== nextProps.employee_list) {
      console.log("getDerivedStateFromProps state changed", nextProps);
      console.log(nextProps.getVRNPrefix);
      return {
        getVRNPrefix: nextProps.getVRNPrefix,
        employee_list: nextProps.employee_list,
      };
    }
  }

  displayMsg = (err) => {
    toast.error(`${err.data}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };
  _showDetails = (bool) => {
    this.setState({
      showDetails: bool,
    });
  };

  exportPDFWithComponent = () => {
    this.pdfExportComponent.save();
  };
  componentDidMount = () => {
    this.setState({
      ...this.state.initValue,
      initValue: {
        startDate: new Date(),
        endDate: new Date(
          new Date().setMonth(
            new Date().getMonth() + this.props.monthOption.value
          )
        ),
      },
    });
  };

  handleChange = (val, name) => {
    this.setState({
      filterData: Object.assign(this.state.filterData, {
        [name]: val,
      }),
    });
  };

  generateReport = () => {
    const { openModal, closeModal } = this.props;
    let notgererated = true;
    this.props.vatReportDataList.data.map(({ taxReturns }) => {
      let dateArr = taxReturns ? taxReturns.split("-") : [];
      let currenttartdate = moment(this.getStartDate());
      let currentenddate = moment(this.getEndDate(), "DD-MM-YYYY");
      let startDate = moment(dateArr[0]);
      let endDate = moment(dateArr[1], "DD/MM/YYYY");

      console.log(
        currenttartdate.diff(startDate, "days"),
        currentenddate.diff(endDate, "days"),
        currenttartdate.diff(startDate, "days") >= 0 &&
          currentenddate.diff(endDate) <= 0
      );
      if (
        currenttartdate.diff(startDate, "days") === 0 ||
        currentenddate.diff(endDate, "days") === 0 ||
        (currenttartdate.diff(startDate, "days") >= 0 &&
          currentenddate.diff(endDate, "days") <= 0)
      )
        notgererated = false;
    });
    if (!notgererated) {
      return this.props.commonActions.tostifyAlert(
        "error",
        "VAT Report is Already generated"
      );
    }
    this.setState({ disabled: true });
    const { initValue } = this.state;
    const postData = {
      // startDate: moment(this.state.initValue.startDate).format('DD/MM/YYYY'),
      // endDate: moment(this.state.initValue.endDate).format('DD/MM/YYYY'),
      vrn: this.state.VRN,
      startDate: this.getStartDate().replaceAll("-", "/"),
      endDate: this.getEndDate().replaceAll("-", "/"),
    };

    this.props.vatReportActions
      .generateReport(postData)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            "success",
            res.data && res.data.message
              ? res.data.message
              : "VAT Report Generated Successfully"
          );
        }
        closeModal(false);
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
    const { openModal, closeModal, monthOption, setState, state } = this.props;
    const { initValue, loading } = this.state;
    console.log(this.state.prefix);
    var lastdayoflastmonth = new Date();

    var firstdayoflastmonth = new Date();
    firstdayoflastmonth.setDate(1);

    return (
      <div className="contact-modal-screen">
        <Modal isOpen={openModal} className="modal-success contact-modal">
          <ModalHeader>
            <Row>
              <Col lg={12}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <i className="nav-icon fas fa-user-tie" />
                  <span className="ml-2">
                  {strings.GenerateVATReport}
                    {/* ( <b>{this.props.monthOption==0?"Monthly":"Quarterly"}</b> ) */}
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

						})}
					></Formik>
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
                                  <span className="text-danger">* </span>
                                  {strings.ReportingPeriod}
                                </Label>
                                <Select
                                  options={state.options}
                                  id="option"
                                  name="option"
                                  value={state.monthOption}
                                  placeholder="VAT Reporting Period"
                                  onChange={(e) => {
                                    setState({
                                      enbaleReportGeneration: true,
                                      monthOption: e,
                                    });
                                  }}
                                />
                              </Col>

                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="startDate">
                                    <span className="text-danger">* </span>
                                    {strings.GenerateVATReportFor}
                                  </Label>
                                  <b>
                                    <DatePicker
                                      selected={this.state.monthlyDate}
                                      onChange={(date) => {
                                        this.setState({ monthlyDate: date });
                                      }}
                                      selectsStart
                                      dateFormat="MMMM - yyyy"
                                      //  format='yyyy-MM'
                                      minDate={new Date("01/01/2018")}
                                      showMonthYearPicker
                                      withPortal
                                      placeholderText={"Select Month"}
                                      portalId="root-portal"
                                      className={`text-center`}
                                      Style={{ textAlign: "center !important" }}
                                    />
                                  </b>
                                </FormGroup>
                              </Col>
                              {/* <Col lg={4}>
													{this.props.monthOption==0	?	(<FormGroup className="mb-3">
																<Label htmlFor="startDate">Select Month</Label>
																<DatePicker
																		selected={this.state.monthlyDate}
																		onChange={(date) =>{
																			 
																			this.setState({monthlyDate:date})
																		}}
																		selectsStart
																		dateFormat="MM/yyyy"
																		showMonthYearPicker
																	/>

															</FormGroup>
															)
															 :
															(<FormGroup className="mb-3">
																<Label htmlFor="startDate">Select Quarter</Label>
																<DatePicker
																selected={this.state.monthlyDate}
																onChange={(date) =>{
																	 
																	this.setState({monthlyDate:date})
																}}
																	dateFormat="yyyy, QQQ"
																	showQuarterYearPicker
																	/>

															</FormGroup>)
															}
														</Col> */}

                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  {/* <span className="text-danger">* </span> */}
                                  <Label htmlFor="startDate">
                                  {strings.VATReportNumber}
                                  </Label>
                                  <Input
                                    value={this.state.VRN}
                                    name="VRN"
                                    id="VRN"
                                    onChange={(options) => {
                                      this.setState({
                                        VRN: options.target.value,
                                      });
                                    }}
                                    placeholder={strings.Enter + strings.VATReportNumber}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row style={{ marginTop: 20 }}>
                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="startDate">
                                    {strings.StartDate}
                                  </Label>
                                  <Input
                                    value={this.getStartDate()}
                                    placeholder="Select Month For Start Date"
                                    disabled
                                  />
                                  {/* <DatePicker
																	id="date"
																	name="startDate"
																	className={`form-control`}
																	placeholderText="From"
																	showMonthDropdown
																	showYearDropdown																	
																	autoComplete="off"
																	minDate={new Date("01/01/2018")}
																	// maxDate={firstdayoflastmonth.setMonth(firstdayoflastmonth.getMonth()-1)}
																	maxDate={new Date(Date.now() - 86400000)}
																	value={moment(props.values.startDate).format(
																		'DD-MM-YYYY',
																	)}   
																	dropdownMode="select"
																	dateFormat="DD-MM-YYYY"
																	withPortal
    																  portalId="root-portal"
																	// disabledDate={disabledDate}
																	// onChange={(value) => {
																	// 	props.handleChange('startDate')(value);
																	// 	if (moment(value).isBefore(props.values.startDate)) {
																	// 		props.setFieldValue(
																	// 			'startDate',
																	// 			moment(value).add(1, 'M'),
																	// 		);
																	// 	}
																	// }}

																	onChange={(value) => {
																		props.handleChange('startDate')(value);
																		this.setState({...this.state.initValue,initValue: {startDate: value,endDate:this.state.initValue.endDate} })
																	}}
																/> */}
                                </FormGroup>
                              </Col>
                              <Col lg={4}>
                                <FormGroup className="mb-3">
                                  <Label htmlFor="endDate">
                                    {strings.EndDate}
                                  </Label>
                                  <Input
                                    value={this.getEndDate()}
                                    placeholder="Select Month For End Date"
                                    disabled
                                  />{" "}
                                  {/* <DatePicker
																	id="date"
																	disabled
																	name="endDate"
																	className={`form-control`}
																	autoComplete="off"
																	minDate={new Date("01/01/2018")}
																	// maxDate={lastdayoflastmonth.setMonth(lastdayoflastmonth.getMonth(), 0)}
																	// maxDate={new Date(Date.now() - 86400000)}
																	placeholderText="From"
																	showMonthDropdown
																	showYearDropdown
																
																		value={moment(this.state.initValue.startDate).endOf(
																		'quarter'
																	).format("DD-MM-YYYY")}
																	// value={moment(props.values.endDate).format(
																	// 	'DD-MM-YYYY',
																	// )}
																	dropdownMode="select"
																	dateFormat="dd-MM-yyyy"
																	onChange={(value) => {
																		props.handleChange('endDate')(value);
																		this.setState({...this.state.initValue,initValue: {endDate: value,startDate:this.state.initValue.startDate} })
																	}}
																/> */}
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
                  onClick={this.generateReport}
                  disabled={
                    this.props.monthOption === "" || !this.state.monthlyDate
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

  //

  getStartDate = () => {
    const { monthOption } = this.props;

    if (this.state.monthlyDate) {
      let date = moment(this.state.monthlyDate).format("DD-MM-YYYY");

      return date;
    }
  };

  //
  getEndDate = () => {
    const { monthOption } = this.props;
    let date = "";
    if (this.state.monthlyDate) {
      if (monthOption.value === 0) {
        date = moment(this.state.monthlyDate)
          .add(1, "month")
          .subtract(1, "day")
          .format("DD-MM-YYYY");
      } else if (monthOption.value === 2) {
        date = moment(this.state.monthlyDate)
          .add(3, "month")
          .subtract(1, "day")
          .format("DD-MM-YYYY");
      }

      return date;
    }
  };

  //
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GenerateVatReportModal);
