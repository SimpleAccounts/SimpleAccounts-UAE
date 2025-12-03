import React, { Component } from "react";
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
} from "reactstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { connect } from "react-redux";
import { Formik } from "formik";
import moment from "moment";
import { DropdownLists } from "utils";
import "./style.scss";
import { data } from "../../Language/index";
import LocalizedStrings from "react-localization";
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';

const mapStateToProps = (state) => {
  const contact_list = state.common.customer_list;
  return {
    customer_list_dropdown: DropdownLists.getContactDropDownList(contact_list),
  };
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class FilterComponent2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      initValue: {
        startDate: moment().startOf("month").format("YYYY-MM-DD hh:mm"),
        endDate: moment().endOf("month").format("YYYY-MM-DD hh:mm"),
        contactId: "",
      },
    };
  }

  componentDidMount =()=>{
	this.props.commonActions.getCustomerList(2);

  }

  render() {
    strings.setLanguage(this.state.language);
    const { initValue } = this.state;
    const { enableContact, customer_list_dropdown } = this.props;
    return (
      <div>
        <Card style={{ zIndex: "1", backgroundColor: "white" }}>
          <CardHeader
            className="d-flex"
            style={{ justifyContent: "space-between" }}
          >
            <div style={{ fontSize: "1.3rem", paddingLeft: "15px" }}>
              {strings.CustomizeReport}
            </div>
            <div>
              <i
                className="fa fa-close"
                style={{ cursor: "pointer" }}
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
                          maxDate={
                            props.values.endDate
                              ? moment(props.values.endDate).toDate()
                              : null
                          }
                          //maxDate={new Date()}
                          value={moment(props.values.startDate).format(
                            "DD-MM-YYYY"
                          )}
                          dropdownMode="select"
                          dateFormat="dd-MM-yyyy"
                          onChange={(value) => {
                            props.setFieldValue(
                              "startDate",
                              moment(value).format("YYYY-MM-DD hh:mm")
                            );
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
                          minDate={
                            props.values.startDate
                              ? moment(props.values.startDate).toDate()
                              : null
                          }
                          placeholderText="From"
                          showMonthDropdown
                          showYearDropdown
                          value={moment(props.values.endDate).format(
                            "DD-MM-YYYY"
                          )}
                          dropdownMode="select"
                          dateFormat="dd-MM-yyyy"
                          onChange={(value) => {
                            props.setFieldValue(
                              "endDate",
                              moment(value).format("YYYY-MM-DD hh:mm")
                            );
                          }}
                        />
                      </FormGroup>
                    </Col>
                    {enableContact && (
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label htmlFor="contactId">
                            {strings.CustomerName}
                          </Label>
                          <Select
                            id="contactId"
                            name="contactId"
                            placeholder={strings.Select + strings.CustomerName}
                            options={customer_list_dropdown}
                            value={
                              props.values.contactId?.value
                                ? props.values.contactId
                                : customer_list_dropdown.find(
                                    (option) =>
                                      option.value == props.values.contactId
                                  )
                            }
                            onChange={(option) => {
                              props.setFieldValue("contactId", option.value);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    )}
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
                          <i className="fa fa-dot-circle-o"></i>{" "}
                          {strings.RunReport}
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
export default connect(mapStateToProps, mapDispatchToProps)(FilterComponent2);
