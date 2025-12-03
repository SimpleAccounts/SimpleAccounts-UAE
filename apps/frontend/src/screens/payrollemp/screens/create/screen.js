import React from "react";
import { connect } from "react-redux";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Input,
  Form,
  Label,
  Table,
  UncontrolledTooltip,
} from "reactstrap";
import Select from "react-select";
import { bindActionCreators } from "redux";
import "react-datepicker/dist/react-datepicker.css";
import "./style.scss";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import "react-toastify/dist/ReactToastify.css";
import { FormGroup, Button } from "reactstrap";
import DatePicker from "react-datepicker";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { LeavePage, ImageUploader, Loader } from "components";
import { CommonActions } from "services/global";
import { selectOptionsFactory } from "utils";
import "react-datepicker/dist/react-datepicker.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import moment from "moment";
import * as CreatePayrollEmployeeActions from "../create/actions";
import * as PayrollEmployeeActions from "../../actions";
import { DesignationModal, SalaryComponent } from "screens/payrollemp/sections";
import { data } from "screens/Language/index";
import LocalizedStrings from "react-localization";
import * as DetailEmployeePersonalAction from "../update_emp_personal/actions";
import * as DetailEmployeeEmployementAction from "../update_emp_employemet/actions";
import * as DetailEmployeeBankAction from "../update_emp_bank/actions";
import * as DesignationActions from "../../../designation/actions";
import { upperFirst } from "lodash-es";

const mapStateToProps = (state) => {
  return {
    designation_dropdown: state.payrollEmployee.designation_dropdown,
    employee_list_dropdown: state.payrollEmployee.employee_list_dropdown,
    state_list: state.payrollEmployee.state_list,
    country_list: state.payrollEmployee.country_list,
    salary_role_dropdown: state.payrollEmployee.salary_role_dropdown,
    designationType_list: state.employeeDesignation.designationType_list,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    detailEmployeePersonalAction: bindActionCreators(
      DetailEmployeePersonalAction,
      dispatch
    ),
    detailEmployeeEmployementAction: bindActionCreators(
      DetailEmployeeEmployementAction,
      dispatch
    ),
    detailEmployeeBankAction: bindActionCreators(
      DetailEmployeeBankAction,
      dispatch
    ),
    createPayrollEmployeeActions: bindActionCreators(
      CreatePayrollEmployeeActions,
      dispatch
    ),
    payrollEmployeeActions: bindActionCreators(
      PayrollEmployeeActions,
      dispatch
    ),
    commonActions: bindActionCreators(CommonActions, dispatch),
    designationActions: bindActionCreators(DesignationActions, dispatch),
  };
};
let strings = new LocalizedStrings(data);
class CreateEmployeePayroll extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      language: window["localStorage"].getItem("language"),
      loading: false,

      BankList: [],
      isDisabled: false,
      createMore: false,
      nameDesigExist: false,
      idDesigExist: false,
      sifEnabled: true,
      otherDetails: false,
      newDesig: false,
      varEarn: false,
      grossSalarys: 0,
      initValue: {
        designationName: "",
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        dob: "",
        referenceCode: "",
        title: "",
        billingEmail: "",
        countryId: { label: "United Arab Emirate", value: 229 },
        permanentAddress: "",
        presentAddress: "",
        // bloodGroup: '',
        mobileNumber: "",
        vatRegestationNo: "",
        currencyCode: "",
        poBoxNumber: "",
        employeeRole: "",
        stateId: "",
        gender: "",
        maritalStatus: "",
        pincode: "",
        city: "",
        employeeDesignationId: "",
        active: true,
        passportNumber: "",
        passportExpiryDate: "",
        // visaNumber: '',
        employeeCode: "",
        agentId: "",
        // visaExpiryDate: '',
        dateOfJoining: "",
        department: "",
        labourCard: "",
        grossSalary: "",
        salaryRoleId: "",
        parentId: "",
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        branch: "",
        iban: "",
        swiftCode: "",
        CTC: "",
        componentTotal: "",
        qualification: "",
        university: "",
        qualificationYearOfCompletionDate: "",
        emergencyContactName1: "",
        emergencyContactNumber2: "",
        emergencyContactRelationship1: "",
        emergencyContactNumber1: "",
        emergencyContactName2: "",
        bankId: "",
      },
      userPhoto: [],
      userPhotoFile: [],
      useractive: true,
      showIcon: false,
      basic: false,
      activeTab: new Array(4).fill("1"),
      openDesignationModal: false,
      openSalaryComponentFixed: false,
      openSalaryComponentVariable: false,
      openSalaryComponentDeduction: false,
      employeeId: "",
      selectedData: {},
      componentTotal: "",
      prefix: "",
      exist: false,
      laborCardIdexist: false,
      existForAccountNumber: false,
      selectedStatus: true,
      checkmobileNumberParam: false,
      checkmobileNumberParam1: false,
      checkmobileNumberParam2: false,
      emailExist: false,
      loadingMsg: "Loading...",
      disableLeavePage: false,

      disabledPersonalDetailNextButton: false,
      errorMsg: false,
      componentId: [],
      componentSelected: [],
    };
    this.formRef = React.createRef();
    this.formRefPersonal = React.createRef();
    this.regEx = /^[0-9\d]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regExAlpha = /^[A-Za-z\s]+$/;
    this.regExAddress = /^[a-zA-Z0-9\s\D,'-/ ]+$/;
    this.regExQualification = /^[a-zA-Z,-/ ]+$/;
    this.regExQualificationYear = /^[0-9,'-]+$/;
    this.regExEmpUniqueId = /[a-zA-Z0-9,-/ ]+$/;
    this.regDec1 = /^\d{1,2}\.\d{1,2}$|^\d{1,2}$/;
    this.type = [
      { label: "Flat Amount", value: 1 },
      { label: "% of CTC", value: 2 },
    ];

    this.gender = [
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
    ];

    this.maritalStatus = [
      { label: "Single", value: "Single" },
      { label: "Married", value: "Married" },
      { label: "Widowed", value: "Widowed" },
      { label: "Divorced", value: "Divorced" },
      { label: "Separated", value: "Separated" },
    ];

    this.columnHeader1 = [
      { label: "Component Name", value: "Component Name", sort: false },
      { label: "Calculation Type", value: "Calculation Type", sort: false },
      { label: "Monthly", value: "Monthly", sort: false },
      { label: "Annually", value: "Annualy", sort: false },
    ];
  }

  componentDidMount = () => {
    debugger;
    this.props.createPayrollEmployeeActions.getCountryList();
    this.props.createPayrollEmployeeActions.getStateList();
    this.props.createPayrollEmployeeActions.getEmployeeDesignationForDropdown();
    this.props.createPayrollEmployeeActions.getEmployeesForDropdown();
    this.props.createPayrollEmployeeActions.getSalaryRolesForDropdown();
    this.props.createPayrollEmployeeActions
      .getBankListForEmployees()
      .then((response) => {
        this.setState({
          bankList: response.data,
        });
      });
    // this.props.employeeActions.getEmployeesForDropdown();
    this.setState({ showIcon: false });
    this.initializeData();
  };

  initializeData = () => {
    this.props.designationActions.getParentDesignationList();
    this.getEmployeeCode();
    this.getStateList(
      this.state.initValue.countryId.value
        ? this.state.initValue.countryId.value
        : ""
    );
    this.props.createPayrollEmployeeActions.getCompanyById().then((res) => {
      this.setState({
        sifEnabled: res.data.generateSif,
      });
      if (res.data.generateSif == true) {
        this.setState({
          otherDetails: true,
        });
      }
    });
    // this.props.createPayrollEmployeeActions.getInvoicePrefix().then((response) => {
    // 	this.setState({prefixData:response.data
    // });
    // });
  };
  designationNamevalidationCheck = (value) => {
    const data = {
      moduleType: 26,
      name: value,
    };
    this.props.commonActions.checkValidation(data).then((response) => {
      if (response.data === "Designation name already exists") {
        this.setState({
          nameDesigExist: true,
        });
      } else {
        this.setState({
          nameDesigExist: false,
        });
      }
    });
  };
  designationIdvalidationCheck = (value) => {
    const data = {
      moduleType: 25,
      name: value,
    };
    this.props.commonActions.checkValidation(data).then((response) => {
      if (response.data === "Designation ID already exists") {
        this.setState({
          idDesigExist: true,
        });
      } else {
        this.setState({
          idDesigExist: false,
        });
      }
    });
  };

  uploadImage = (picture, file) => {
    this.setState({
      userPhoto: picture,
      userPhotoFile: file,
    });
  };

  getEmployeeCode = () => {
    this.props.createPayrollEmployeeActions.getEmployeeCode().then((res) => {
      if (res.status === 200) {
        this.setState({
          initValue: {
            ...this.state.initValue,
            ...{ employeeCode: res.data },
          },
        });
        this?.formRef?.current &&
          this.formRef.current.setFieldValue(
            "employeeCode",
            res.data,
            true,
            this.employeeValidationCheck(res.data)
          );
        this?.formRefPersonal?.current &&
          this.formRefPersonal.current.setFieldValue(
            "employeeCode",
            res.data,
            true,
            this.employeeValidationCheck(res.data)
          );
      }
    });
  };
  employeeValidationCheck = (value) => {
    const data = {
      moduleType: 15,
      name: value,
    };
    this.props.createPayrollEmployeeActions
      .checkValidation(data)
      .then((response) => {
        if (response.data === "Employee Code Already Exists") {
          this.setState({
            exist: true,
          });
        } else {
          this.setState({
            exist: false,
          });
        }
      });
  };
  laborCardIdValidationCheck = (value) => {
    const data = {
      moduleType: 23,
      name: value,
    };
    this.props.createPayrollEmployeeActions
      .checkValidation(data)
      .then((response) => {
        if (response.data === "Labour Card Id Already Exists") {
          this.setState(
            {
              laborCardIdexist: true,
            },

            () => {}
          );
        } else {
          this.setState({
            laborCardIdexist: false,
          });
        }
      });
  };
  existForAccountNumber = (value) => {
    const data = {
      moduleType: 19,
      name: value,
    };
    this.props.createPayrollEmployeeActions
      .checkValidation(data)
      .then((response) => {
        if (response.data === "Account Number Already Exists") {
          this.setState(
            {
              existForAccountNumber: true,
            },

            () => {}
          );
        } else {
          this.setState({
            existForAccountNumber: false,
          });
        }
      });
  };
  renderActionForState = () => {
    this.props.createPayrollEmployeeActions
      .getEmployeeById(this.state.employeeId)
      .then((res) => {
        this.setState({
          selectedData: res.data,
          loading: false,
        });
      });
  };

  handleSubmitForSalary = (data, resetForm) => {
    const closeModal = this.props.closeModal;
    this.setState({ disabled: true, disableLeavePage: true });
    const {
      totalMonthlyEarnings,
      totalNetPayMontly,
      totalNetPayYearly,
      list,
      totalYearlyEarnings,
      ctcType,
      ctcTypeOption,
    } = data;
    const { employeeId } = this.state;
    const salaryComponentStringList = list.filter((obj) => obj.id !== "");
    const formData = new FormData();
    formData.append("employee", employeeId);
    if (ctcType === "ANNUALLY") {
      formData.append("grossSalary", totalYearlyEarnings);
      formData.append("totalNetPay", totalNetPayYearly);
    } else {
      formData.append("grossSalary", totalMonthlyEarnings);
      formData.append("totalNetPay", totalNetPayMontly);
    }

    formData.append(
      "ctcType",
      ctcTypeOption.label ? ctcTypeOption.label : "ANNUALLY"
    );
    formData.append(
      "salaryComponentString",
      JSON.stringify(salaryComponentStringList)
    );

    this.setState({ loading: true, loadingMsg: "Creating New Employee..." });
    this.props.createPayrollEmployeeActions
      .saveSalaryComponent(formData)
      .then((res) => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            "success",
            " New Employee Created Successfully"
          );
          if (closeModal) closeModal();
          else this.props.history.push("/admin/master/employee");
          this.setState({ loading: false });
        }
      })
      .catch((err) => {
        this.props.commonActions.tostifyAlert(
          "error",
          err && err.data
            ? err.data.message
            : "New Employee Created Unsuccessfully"
        );
      });
  };

  handleSubmitForFinancial = (data, resetForm) => {
    this.setState({ disabled: true });
    const {
      accountNumber,
      bankName,
      branch,
      iban,
      swiftCode,
      bankId,
      agentId,
    } = data;
    const { accountHolderName } = this.state;
    const formData = new FormData();
    formData.append("employee", this.state.employeeId);
    formData.append(
      "accountHolderName",
      accountHolderName != null ? accountHolderName : ""
    );
    formData.append(
      "accountNumber",
      accountNumber != null ? accountNumber : ""
    );
    // formData.append(
    //     'bankName',
    //     bankName != null ? bankName : '',
    // )

    if (bankId && bankId.value) {
      formData.append("bankId", bankId.value);
    }
    if (bankId && bankId.label) {
      formData.append("bankName", bankId.label);
    }
    formData.append("branch", branch != null ? branch : "");
    formData.append("iban", iban != null ? "AE" + iban : "");
    formData.append("swiftCode", swiftCode != null ? swiftCode : "");
    formData.append(
      "employmentId",
      this.state.selectedData && this.state.selectedData.employmentId
        ? this.state.selectedData.employmentId
        : ""
    );
    formData.append("agentId", agentId != null ? agentId : "");
    if (
      this.state.selectedData.employeeBankDetailsId === null ||
      this.state.selectedData.employeeBankDetailsId === ""
    ) {
      // this.setState({ loading:true, loadingMsg:"Creating Finacial Details..."});
      this.props.createPayrollEmployeeActions
        .saveEmployeeBankDetails(formData)
        .then((res) => {
          if (res.status === 200) {
            this.props.commonActions.tostifyAlert(
              "success",
              res.data ? res.data.mesg : " Finacial Details Saved Successfully"
            );
            this.toggle(0, "4");
            this.renderActionForState(this.state.employeeId);
            // this.setState({ loading:false,});
          }
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert(
            "error",
            err && err.data
              ? err.data.message
              : "Finacial Details Saved Unuccessfully"
          );
        });
    } else {
      // this.setState({ loading:true, loadingMsg:"Updating Employee..."});
      this.props.detailEmployeeBankAction
        .updateEmployeeBank(formData)
        .then((res) => {
          if (res.status === 200) {
            this.props.commonActions.tostifyAlert(
              "success",
              res.data ? res.data.mesg : "Employee Updated Successfully"
            );
            this.toggle(0, "4");
            this.renderActionForState(this.state.employeeId);
            // this.setState({ loading:false,});
          }
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert(
            "error",
            err.data.message ? err.data.message : "Updated Unssccessfully"
          );
        });
    }
  };
  handleSubmitForEmployement = (data, resetForm) => {
    this.setState({ disabled: true });
    const {
      passportNumber,
      passportExpiryDate,
      // visaNumber,
      employeeCode,
      // visaExpiryDate,
      dateOfJoining,
      department,
      labourCard,
      grossSalary,
      salaryRoleId,
      agentId,
    } = data;

    const formData = new FormData();

    formData.append("employee", this.state.employeeId);
    formData.append("salaryRoleId", salaryRoleId);

    formData.append(
      "passportNumber",
      passportNumber != null ? passportNumber : ""
    );
    formData.append(
      "passportExpiryDate",
      passportExpiryDate ? moment(passportExpiryDate).format("DD-MM-YYYY") : ""
    );

    // formData.append(
    //     'visaNumber',
    //     visaNumber != null ? visaNumber : '',
    // )
    // formData.append('visaExpiryDate', visaExpiryDate ? moment(visaExpiryDate).format('DD-MM-YYYY') : '')

    formData.append("employeeCode", employeeCode != null ? employeeCode : "");
    // formData.append(
    //     'agentId',
    //     agentId != null ? agentId : '',
    // )
    formData.append(
      "dateOfJoining",
      dateOfJoining ? moment(dateOfJoining).format("DD-MM-YYYY") : ""
    );
    if (salaryRoleId && salaryRoleId.value) {
      formData.append("salaryRoleId", salaryRoleId.value);
    }
    formData.append("department", department != null ? department : "");
    formData.append("labourCard", labourCard != null ? labourCard : "");
    formData.append("grossSalary", grossSalary != null ? grossSalary : "");
    if (
      this.state.selectedData.employmentId === null ||
      this.state.selectedData.employmentId === ""
    ) {
      this.setState({
        loading: true,
        loadingMsg: "Creating Employee Details...",
      });
      this.props.createPayrollEmployeeActions
        .saveEmployment(formData)
        .then((res) => {
          if (res.status === 200) {
            this.props.commonActions.tostifyAlert(
              "success",
              res.data ? res.data.mesg : "Employment Details Saved Successfully"
            );
            this.toggle(0, "3");
            this.renderActionForState(this.state.employeeId);
            this.setState({ loading: false });
          }
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert(
            "error",
            err && err.data
              ? err.data.message
              : "Employment Details Saved Unsuccessfully"
          );
        });
    } else {
      // this.setState({ loading:true, loadingMsg:"Updating Employement Details..."});
      formData.append("id", this.state.selectedData.employmentId);
      this.props.detailEmployeeEmployementAction
        .updateEmployment(formData)
        .then((res) => {
          if (res.status === 200) {
            this.props.commonActions.tostifyAlert(
              "success",
              res.data
                ? res.data.mesg
                : "Employment Details Updated Successfully"
            );
            this.toggle(0, "3");
            this.renderActionForState(this.state.employeeId);
            // this.setState({ loading:false,});
          }
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert(
            "error",
            err.data.message
              ? err.data.message
              : "Employment Details Saved Unsuccessfully"
          );
        });
    }
  };

  handleSubmit = (data, resetForm) => {
    // this.setState({ loading:true, loadingMsg:"Creating Employee Basic Details..."});
    this.setState({
      disabledPersonalDetailNextButton: true,
      disableLeavePage: true,
    });
    const {
      firstName,
      middleName,
      lastName,
      mobileNumber,
      email,
      presentAddress,
      countryId,
      stateId,
      city,
      pincode,
      employeeDesignationId,
      dob,
      // bloodGroup,
      employeeCode,
      dateOfJoining,
      gender,
      maritalStatus,
      salaryRoleId,
      parentId,
      university,
      qualification,
      qualificationYearOfCompletionDate,
      emergencyContactName1,
      emergencyContactNumber2,
      emergencyContactRelationship1,
      emergencyContactNumber1,
      emergencyContactName2,
      emergencyContactRelationship2,
      PostZipCode,
    } = data;

    const formData = new FormData();
    if (typeof this.state.employeeId !== "string") {
      formData.append("id", this.state.employeeId);
    }

    formData.append("isActive", this.state.useractive);
    formData.append("salaryRoleId", salaryRoleId);
    formData.append("firstName", firstName !== null ? firstName : "");
    formData.append("middleName", middleName !== null ? middleName : "");
    formData.append("lastName", lastName !== null ? lastName : "");
    formData.append("dob", dob ? moment(dob).format("DD-MM-YYYY") : "");
    formData.append("mobileNumber", mobileNumber !== null ? mobileNumber : "");
    formData.append("email", email != null ? email : "");
    formData.append(
      "presentAddress",
      presentAddress != null ? presentAddress : ""
    );
    formData.append("city", city != null ? city : "");
    formData.append("pincode", PostZipCode != null ? PostZipCode : "");
    formData.append("university", university != null ? university : "");
    formData.append(
      "qualification",
      qualification != null ? qualification : ""
    );
    formData.append(
      "qualificationYearOfCompletionDate",
      qualificationYearOfCompletionDate != null
        ? qualificationYearOfCompletionDate
        : ""
    );
    formData.append(
      "emergencyContactName1",
      emergencyContactName1 != null ? emergencyContactName1 : ""
    );

    formData.append(
      "emergencyContactNumber2",
      emergencyContactNumber2 != null ? emergencyContactNumber2 : ""
    );
    formData.append(
      "emergencyContactRelationship1",
      emergencyContactRelationship1 != null ? emergencyContactRelationship1 : ""
    );
    formData.append(
      "emergencyContactNumber1",
      emergencyContactNumber1 != null ? emergencyContactNumber1 : ""
    );
    formData.append(
      "emergencyContactName2",
      emergencyContactName2 != null ? emergencyContactName2 : ""
    );
    formData.append(
      "emergencyContactRelationship2",
      emergencyContactRelationship2 != null ? emergencyContactRelationship2 : ""
    );

    formData.append("maritalStatus", maritalStatus.value);
    if (this.state.userPhotoFile.length > 0) {
      formData.append("profileImageBinary ", this.state.userPhotoFile[0]);
    }
    if (gender && gender.value) {
      formData.append("gender", gender.value);
    }

    // if (parentId && parentId.value) {
    //     formData.append('parentId', parentId.value);
    // }
    //     formData.append('bloodGroup', bloodGroup);

    if (countryId && countryId.value) {
      formData.append("countryId", countryId.value);
    }

    if (stateId && stateId.value) {
      formData.append("stateId", stateId.value);
    }
    if (employeeDesignationId && employeeDesignationId.value) {
      formData.append("employeeDesignationId", employeeDesignationId.value);
    }
    if (this.state.employeeId === null || this.state.employeeId === "") {
      this.props.createPayrollEmployeeActions
        .createEmployee(formData)
        .then((res) => {
          if (res.status === 200) {
            this.props.commonActions.tostifyAlert(
              "success",
              "Employee Basic Details Saved Successfully"
            );
            this.setState({
              employeeId: res.data,
            });
            if (
              this.props.location &&
              this.props.location.state &&
              this.props.location.state.goto &&
              this.props.location.state.goto === "Expense"
            ) {
              this.props.history.push(`/admin/expense/expense/create`);
              // this.setState({ loading:false,});
            }
            if (this.state.sifEnabled == false) {
              this.toggle(0, "4");
            } else {
              this.toggle(0, "2");
            }

            const formData1 = new FormData();
            formData1.append("employee", this.state.employeeId);
            formData1.append(
              "employeeCode",
              employeeCode != null ? employeeCode : ""
            );
            // formData1.append(
            //   "employeeCode",
            //   this.state.initValue.employeeCode != null
            //     ? this.state.initValue.employeeCode
            //     : ""
            // );
            formData1.append(
              "dateOfJoining",
              dateOfJoining ? moment(dateOfJoining).format("DD-MM-YYYY") : ""
            );
            this.props.createPayrollEmployeeActions
              .saveEmployment(formData1)
              .then((res) => {
                if (res.status == 200) {
                  this.setState({ disabledPersonalDetailNextButton: false });
                  this.renderActionForState(this.state.employeeId);
                }
              });
          }
        })
        .catch((err) => {
          let error =
            err && err.data
              ? err.data
              : "Employee Basic Details Saved Unsuccessfully";
          if (err.data && err.data.message !== undefined) {
            error = err.data.message ? err.data.message : err.data;
          }
          this.setState({
            disabledPersonalDetailNextButton: false,
            loading: false,
          });
          this.props.commonActions.tostifyAlert("error", error);
        });
    } else {
      // this.setState({ loading:true, loadingMsg:"Updating Employee Details..."});
      this.props.detailEmployeePersonalAction
        .updateEmployeePersonal(formData)
        .then((res) => {
          if (res.status === 200) {
            const formData1 = new FormData();
            formData1.append("id", this.state.employeeId);
            formData1.append("employee", this.state.employeeId);
            formData1.append(
              "employeeCode",
              employeeCode != null ? employeeCode : ""
            );
            formData1.append(
              "dateOfJoining",
              dateOfJoining ? moment(dateOfJoining).format("DD-MM-YYYY") : ""
            );
            this.props.detailEmployeeEmployementAction
              .updateEmployment(formData1)
              .then((res) => {
                // if (res.status == 200)
                this.renderActionForState(this.state.employeeId);
              });
            this.props.commonActions.tostifyAlert(
              "success",
              res.data ? res.data.message : "Employee Updated Successfully!"
            );
            if (this.state.sifEnabled == false) {
              this.toggle(0, "4");
            } else {
              this.toggle(0, "2");
            }
            this.renderActionForState(this.state.employeeId);
            this.setState({ disabledPersonalDetailNextButton: false });
          }
        })
        .catch((err) => {
          this.setState({
            disabledPersonalDetailNextButton: false,
            loading: false,
          });
          this.props.commonActions.tostifyAlert(
            "error",
            err.data ? err.data.mesg : "Employee Updated Unsuccessfully"
          );
        });
    }
  };

  toggle = (tabPane, tab) => {
    const newArray = this.state.activeTab.slice();
    newArray[parseInt(tabPane, 10)] = tab;
    this.setState({
      activeTab: newArray,
    });
  };
  emailvalidationCheck = (value) => {
    const data = {
      moduleType: 24,
      name: value,
    };
    this.props.commonActions.checkValidation(data).then((response) => {
      if (response.data === "Employee email already exists") {
        this.setState({
          emailExist: true,
        });
      } else {
        this.setState({
          emailExist: false,
        });
      }
    });
  };
  getStateList = (countryCode) => {
    this.props.createPayrollEmployeeActions.getStateList(countryCode);
  };
  openDesignationModal = (props) => {
    this.setState({ openDesignationModal: true });
  };
  closeDesignationModal = (res) => {
    this.setState({ openDesignationModal: false });
  };

  getCurrentUser = (data) => {
    this.props.createPayrollEmployeeActions
      .getEmployeeDesignationForDropdown()
      .then((res) => {
        if (res.status === 200) {
          const lastOption = res.data[res.data.length - 1];
          this.setState({
            initValue: {
              ...this.state.initValue,
              ...{ employeeDesignationId: lastOption },
            },
            newDesig: true,
          });
          this?.formRefPersonal?.current &&
            this.formRefPersonal.current.setFieldValue(
              "employeeDesignationId",
              this.state.initValue.employeeDesignationId
            );
        }
      });
  };
  underAge = (birthday) => {
    // set current day on 01:00:00 hours GMT+0100 (CET)
    var currentDate = new Date().toJSON().slice(0, 10) + " 01:00:00";
    // calculate age comparing current date and borthday
    var myAge = ~~((Date.now(currentDate) - birthday) / 31557600000);

    if (myAge < 14) return true;
    else return false;
  };

  render() {
    strings.setLanguage(this.state.language);
    const {
      exist,
      laborCardIdexist,
      employeeId,
      sifEnabled,
      activeTab,
      existForAccountNumber,
      bankList,
      loading,
      loadingMsg,
    } = this.state;
    const {
      salary_role_dropdown,
      designation_dropdown,
      country_list,
      state_list,
      employee_list_dropdown,
    } = this.props;
    return loading == true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div className="financial-report-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon fas fa-user-plus" />
                    <span className="ml-2">{strings.CreateEmployee}</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            {loading ? (
              <Row>
                <Col lg={12}>
                  <Loader />
                </Col>
              </Row>
            ) : (
              <CardBody>
                <Nav className="justify-content-center" tabs pills>
                  <NavItem>
                    <NavLink
                      active={activeTab[0] === "1"}
                      // onClick={() => {
                      //     this.toggle(0, '1');
                      // }}
                    >
                      {strings.BasicDetails}
                    </NavLink>
                  </NavItem>
                  {sifEnabled && (
                    <NavItem>
                      <NavLink
                        active={activeTab[0] === "2"}
                        // onClick={() => {
                        //     this.toggle(0, '2');
                        // }}
                      >
                        {strings.Employment}
                      </NavLink>
                    </NavItem>
                  )}
                  {sifEnabled && (
                    <NavItem>
                      <NavLink active={activeTab[0] === "3"}>
                        {strings.FinancialDetails}
                      </NavLink>
                    </NavItem>
                  )}
                  <NavItem>
                    <NavLink active={activeTab[0] === "4"}>
                      {strings.SalarySetup}
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab[0]}>
                  <TabPane tabId="1">
                    <div className="create-employee-screen">
                      <div className="animated fadeIn">
                        <Row>
                          <Col lg={12} className="mx-auto">
                            <div>
                              <Row>
                                <Col lg={12}>
                                  <Formik
                                    ref={this.formRefPersonal}
                                    initialValues={this.state.initValue}
                                    onSubmit={(values, { resetForm }) => {
                                      this.handleSubmit(values, resetForm);
                                    }}
                                    validate={(values) => {
                                      let errors = {};

                                      // if (checkmobileNumberParam === true) {
                                      // errors.mobileNumber =
                                      // 'Invalid mobile number';
                                      // }

                                      if (
                                        values.mobileNumber &&
                                        values.mobileNumber.length !== 12
                                      ) {
                                        errors.mobileNumber =
                                          "Invalid mobile number";
                                      }
                                      if (this.state.emailExist == true) {
                                        errors.email = "Email already exists";
                                      }
                                      if (
                                        values.employeeDesignationId &&
                                        values.employeeDesignationId.label &&
                                        values.employeeDesignationId.label ===
                                          "Select Employee Designation"
                                      ) {
                                        errors.employeeDesignationId =
                                          "Designation is required";
                                      }
                                      if (this.underAge(values.dob)) {
                                        errors.dob =
                                          "Age should be more than 14 years";
                                      }
                                      if (this.state.sifEnabled == true) {
                                        if (
                                          values.gender &&
                                          values.gender.label &&
                                          values.gender.label ===
                                            "Select Gender"
                                        ) {
                                          errors.gender = "Gender is required";
                                        }
                                        if (
                                          values.maritalStatus &&
                                          values.maritalStatus.label &&
                                          values.maritalStatus.label ===
                                            "Select Marital Status"
                                        ) {
                                          errors.maritalStatus =
                                            "Marital status is required";
                                        }
                                        if (
                                          values.salaryRoleId &&
                                          values.salaryRoleId.label &&
                                          values.salaryRoleId.label ===
                                            "Select Salary Role"
                                        ) {
                                          errors.salaryRoleId =
                                            "Salary role is required";
                                        }
                                        if (
                                          values.emergencyContactNumber1 &&
                                          values.emergencyContactNumber1
                                            .length !== 12
                                        ) {
                                          errors.emergencyContactNumber1 =
                                            "Invalid mobile number";
                                        }
                                        // if( values.stateId ===''){
                                        //     errors.stateId =
                                        //     'State is required';
                                        // }

                                        if (
                                          values.countryId == 229 ||
                                          values.countryId.value == 229
                                        ) {
                                          if (values.stateId == "")
                                            errors.stateId =
                                              "Emirate is required";
                                        } else {
                                          if (values.stateId == "")
                                            errors.stateId =
                                              "State is required";
                                        }
                                      } else {
                                        if (
                                          exist === true &&
                                          values.employeeCode != ""
                                        ) {
                                          errors.employeeCode =
                                            "Employee unique id already exists";
                                        }
                                      }
                                      // if (param === true) {
                                      // 	errors.discount =
                                      // 		'Discount amount Cannot be greater than Invoice Total Amount';
                                      // }
                                      return errors;
                                    }}
                                    validationSchema={
                                      this.state.sifEnabled == true
                                        ? Yup.object().shape({
                                            firstName: Yup.string().required(
                                              "First name is required"
                                            ),
                                            lastName: Yup.string().required(
                                              "Last name is required"
                                            ),
                                            email: Yup.string()
                                              .required("Email is required")
                                              .email("Invalid Email"),
                                            mobileNumber: Yup.string().required(
                                              "Mobile number is required"
                                            ),
                                            // salaryRoleId :  Yup.string()
                                            // .required(" Employee Role is required"),
                                            dob: Yup.date().required(
                                              "DOB is required"
                                            ),
                                            gender:
                                              Yup.string().required(
                                                "Gender is required"
                                              ),
                                            maritalStatus:
                                              Yup.string().required(
                                                "Marital status is required"
                                              ),
                                            presentAddress:
                                              Yup.string().required(
                                                "Present address is required"
                                              ),
                                            // pincode: Yup.string()
                                            // .required('Pin Code is required') ,
                                            countryId: Yup.string().required(
                                              "Country is required"
                                            ),
                                            stateId:
                                              Yup.string().required(
                                                "State is required"
                                              ),
                                            // city: Yup.string()
                                            // .required('City is required') ,

                                            active:
                                              Yup.string().required(
                                                "status is required"
                                              ),
                                            // salaryRoleId : Yup.string()
                                            // .required('Salary role is required'),
                                            employeeDesignationId:
                                              Yup.string().required(
                                                "Designation is required"
                                              ),
                                            emergencyContactName1:
                                              Yup.string().required(
                                                "Contact name 1 is required"
                                              ),
                                            emergencyContactNumber1:
                                              Yup.string()
                                                .required(
                                                  "Contact number 1 is required"
                                                )
                                                .test(
                                                  "not smame",
                                                  "please Enter Another Mobile Number",
                                                  (value) => {
                                                    return (
                                                      value !==
                                                      this.state
                                                        .masterPhoneNumber
                                                    );
                                                  }
                                                ),
                                            emergencyContactRelationship1:
                                              Yup.string().required(
                                                "Relationship 1 is required"
                                              ),
                                          })
                                        : Yup.object().shape({
                                            firstName: Yup.string().required(
                                              "First name is required"
                                            ),
                                            lastName: Yup.string().required(
                                              "Last name is required"
                                            ),
                                            email: Yup.string()
                                              .required("Email is required")
                                              .email("Invalid Email"),
                                            mobileNumber: Yup.string().required(
                                              "Mobile number is required"
                                            ),
                                            employeeCode: Yup.string().required(
                                              "Employee unique id is required"
                                            ),
                                            dateOfJoining: Yup.date().required(
                                              "Date of joining is required"
                                            ),
                                            dob: Yup.date().required(
                                              "DOB is required"
                                            ),
                                            employeeDesignationId:
                                              Yup.string().required(
                                                "Designation is required"
                                              ),
                                          })
                                    }
                                  >
                                    {(props) => (
                                      <Form onSubmit={props.handleSubmit}>
                                        <Row>
                                          <Col xs="4" md="4" lg={2}>
                                            <FormGroup className="mb-3 text-center">
                                              <ImageUploader
                                                // withIcon={true}
                                                buttonText={strings.chooseimage}
                                                onChange={this.uploadImage}
                                                imgExtension={[
                                                  "jpg",
                                                  "png",
                                                  "jpeg",
                                                ]}
                                                maxFileSize={40000}
                                                withPreview={true}
                                                singleImage={true}
                                                withIcon={this.state.showIcon}
                                                // buttonText="Choose Profile Image"
                                                flipHeight={
                                                  this.state.userPhoto.length >
                                                  0
                                                    ? { height: "inherit" }
                                                    : {}
                                                }
                                                label={strings.filesize}
                                                labelClass={
                                                  this.state.userPhoto.length >
                                                  0
                                                    ? "hideLabel"
                                                    : "showLabel"
                                                }
                                                buttonClassName={
                                                  this.state.userPhoto.length >
                                                  0
                                                    ? "hideButton"
                                                    : "showButton"
                                                }
                                                defaultImages={
                                                  this.state.userPhoto
                                                }
                                                imageState={
                                                  this.state.imageState
                                                }
                                              />
                                            </FormGroup>
                                          </Col>

                                          <Col xs="4" md="4" lg={10}>
                                            <Row>
                                              <Col md="4">
                                                <FormGroup className="mb-3">
                                                  <div>
                                                    <FormGroup check inline>
                                                      <span className="text-danger">
                                                        *{" "}
                                                      </span>
                                                      {strings.Status} &nbsp;
                                                      &nbsp;
                                                      <div className="custom-radio custom-control">
                                                        <input
                                                          className="custom-control-input"
                                                          type="radio"
                                                          id="inline-radio1"
                                                          name="active"
                                                          checked={
                                                            this.state
                                                              .selectedStatus
                                                          }
                                                          value={true}
                                                          onChange={(e) => {
                                                            if (
                                                              e.target.value ===
                                                              "true"
                                                            ) {
                                                              this.setState({
                                                                selectedStatus: true,
                                                                useractive: true,
                                                              });
                                                            }
                                                          }}
                                                        />
                                                        <label
                                                          className="custom-control-label"
                                                          htmlFor="inline-radio1"
                                                        >
                                                          {strings.Active}
                                                        </label>
                                                      </div>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                      <div className="custom-radio custom-control">
                                                        <input
                                                          className="custom-control-input"
                                                          type="radio"
                                                          id="inline-radio2"
                                                          name="active"
                                                          value={false}
                                                          checked={
                                                            !this.state
                                                              .selectedStatus
                                                          }
                                                          onChange={(e) => {
                                                            if (
                                                              e.target.value ===
                                                              "false"
                                                            ) {
                                                              this.setState({
                                                                selectedStatus: false,
                                                                useractive: false,
                                                              });
                                                            }
                                                          }}
                                                        />
                                                        <label
                                                          className="custom-control-label"
                                                          htmlFor="inline-radio2"
                                                        >
                                                          {strings.Inactive}
                                                        </label>
                                                      </div>
                                                    </FormGroup>
                                                  </div>
                                                </FormGroup>
                                              </Col>
                                            </Row>
                                            <Row className="row-wrapper">
                                              <Col lg={4}>
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>{" "}
                                                    {strings.FirstName}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="100"
                                                    id="firstName"
                                                    name="firstName"
                                                    value={
                                                      props.values.firstName
                                                    }
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.FirstName
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regExAlpha.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        let option1 =
                                                          upperFirst(
                                                            option.target.value
                                                          );
                                                        props.handleChange(
                                                          "firstName"
                                                        )(option1);
                                                      }
                                                    }}
                                                    className={
                                                      props.errors.firstName &&
                                                      props.touched.firstName
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.firstName &&
                                                    props.touched.firstName && (
                                                      <div className="invalid-feedback">
                                                        {props.errors.firstName}
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              <Col lg={4}>
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    {strings.MiddleName}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="100"
                                                    id="middleName"
                                                    name="middleName"
                                                    value={
                                                      props.values.middleName
                                                    }
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.MiddleName
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regExAlpha.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        let option1 =
                                                          upperFirst(
                                                            option.target.value
                                                          );
                                                        props.handleChange(
                                                          "middleName"
                                                        )(option1);
                                                      }
                                                    }}
                                                    className={
                                                      props.errors.middleName &&
                                                      props.touched.middleName
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.middleName &&
                                                    props.touched.firstName && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .middleName
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              <Col lg={4}>
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>
                                                    {strings.LastName}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="100"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={
                                                      props.values.lastName
                                                    }
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.LastName
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regExAlpha.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        let option1 =
                                                          upperFirst(
                                                            option.target.value
                                                          );
                                                        props.handleChange(
                                                          "lastName"
                                                        )(option1);
                                                        let name =
                                                          props.values
                                                            .firstName +
                                                          " " +
                                                          props.values
                                                            .middleName +
                                                          " " +
                                                          option1;
                                                        this.setState({
                                                          accountHolderName:
                                                            name,
                                                        });
                                                      }
                                                    }}
                                                    className={
                                                      props.errors.lastName &&
                                                      props.touched.lastName
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.lastName &&
                                                    props.touched.lastName && (
                                                      <div className="invalid-feedback">
                                                        {props.errors.lastName}
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                            </Row>
                                            <Row>
                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>{" "}
                                                    {strings.Email}
                                                  </Label>
                                                  <Input
                                                    type="email"
                                                    maxLength="80"
                                                    id="email"
                                                    name="email"
                                                    value={props.values.email}
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.EmailAddres
                                                    }
                                                    onChange={(option) => {
                                                      props.handleChange(
                                                        "email"
                                                      )(option);
                                                      this.emailvalidationCheck(
                                                        option.target.value
                                                      );
                                                    }}
                                                    className={
                                                      props.errors.email &&
                                                      props.touched.email
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.email &&
                                                    props.touched.email && (
                                                      <div className="invalid-feedback">
                                                        {props.errors.email}
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>

                                              <Col md="4">
                                                <FormGroup className="mb-3">
                                                  <Label htmlFor="date">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>
                                                    {strings.DateOfBirth}
                                                  </Label>
                                                  <DatePicker
                                                    className={`form-control ${
                                                      props.errors.dob &&
                                                      props.touched.dob
                                                        ? "is-invalid"
                                                        : ""
                                                    }`}
                                                    id="dob"
                                                    name="dob"
                                                    placeholderText={
                                                      strings.Select +
                                                      strings.DateOfBirth
                                                    }
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    maxDate={moment()
                                                      .subtract(18, "years")
                                                      .toDate()}
                                                    autoComplete={"off"}
                                                    dateFormat="dd-MM-yyyy"
                                                    dropdownMode="select"
                                                    selected={props.values.dob}
                                                    value={props.values.dob}
                                                    onChange={(value) => {
                                                      props.handleChange("dob")(
                                                        value
                                                      );
                                                    }}
                                                  />
                                                  {props.errors.dob &&
                                                    props.touched.dob && (
                                                      <div className="invalid-feedback">
                                                        {props.errors.dob.includes(
                                                          "nullable()"
                                                        )
                                                          ? "DOB is required"
                                                          : props.errors.dob}
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="mobileNumber">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>
                                                    {strings.MobileNumber}
                                                  </Label>
                                                  <div
                                                    className={
                                                      props.errors
                                                        .mobileNumber &&
                                                      props.touched.mobileNumber
                                                        ? " is-invalidMobile "
                                                        : ""
                                                    }
                                                  >
                                                    <PhoneInput
                                                      id="mobileNumber"
                                                      name="mobileNumber"
                                                      country={"ae"}
                                                      enableSearch={true}
                                                      international
                                                      value={
                                                        props.values
                                                          .mobileNumber
                                                      }
                                                      placeholder={
                                                        strings.Enter +
                                                        strings.MobileNumber
                                                      }
                                                      onBlur={props.handleBlur(
                                                        "mobileNumber"
                                                      )}
                                                      onChange={(option) => {
                                                        props.handleChange(
                                                          "mobileNumber"
                                                        )(option);

                                                        this.setState({
                                                          masterPhoneNumber:
                                                            option,
                                                        });
                                                        // option.length !==12 ? this.setState({checkmobileNumberParam: true }) : this.setState({ checkmobileNumberParam: false });
                                                      }}
                                                      isValid
                                                      // className={
                                                      //     props.errors.mobileNumber &&
                                                      //         props.touched.mobileNumber
                                                      //         ? 'text-danger'
                                                      //         : ''
                                                      // }
                                                    />
                                                  </div>
                                                  {props.errors.mobileNumber &&
                                                    props.touched
                                                      .mobileNumber && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .mobileNumber
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              {/* <Col md="4">
                                                                                                <FormGroup className="mb-3">
                                                                                                    <Label htmlFor="active"><span className="text-danger">* </span>{strings.Status}</Label>
                                                                                                    <div>
                                                                                                        <FormGroup check inline>
                                                                                                            <div className="custom-radio custom-control">
                                                                                                                <input
                                                                                                                    className="custom-control-input"
                                                                                                                    type="radio"
                                                                                                                    id="inline-radio1"
                                                                                                                    name="active"
                                                                                                                    checked={
                                                                                                                        this.state.selectedStatus
                                                                                                                    }
                                                                                                                    value={true}
                                                                                                                    onChange={(e) => {
                                                                                                                        if (
                                                                                                                            e.target.value === 'true'
                                                                                                                        ) {
                                                                                                                            this.setState({
                                                                                                                                selectedStatus: true,
                                                                                                                                useractive: true
                                                                                                                            });
                                                                                                                        }
                                                                                                                    }}
                                                                                                                />
                                                                                                                <label
                                                                                                                    className="custom-control-label"
                                                                                                                    htmlFor="inline-radio1"
                                                                                                                >
                                                                                                                     {strings.Active}
																							</label>
                                                                                                            </div>
                                                                                                        </FormGroup>
                                                                                                        <FormGroup check inline>
                                                                                                            <div className="custom-radio custom-control">
                                                                                                                <input
                                                                                                                    className="custom-control-input"
                                                                                                                    type="radio"
                                                                                                                    id="inline-radio2"
                                                                                                                    name="active"
                                                                                                                    value={false}
                                                                                                                    checked={
                                                                                                                        !this.state.selectedStatus
                                                                                                                    }
                                                                                                                    onChange={(e) => {
                                                                                                                        if (
                                                                                                                            e.target.value === 'false'
                                                                                                                        ) {
                                                                                                                            this.setState({
                                                                                                                                selectedStatus: false,
                                                                                                                                useractive: false
                                                                                                                            });
                                                                                                                        }
                                                                                                                    }}
                                                                                                                />
                                                                                                                <label
                                                                                                                    className="custom-control-label"
                                                                                                                    htmlFor="inline-radio2"
                                                                                                                >
                                                                                                                    {strings.Inactive}
																							</label>
                                                                                                            </div>
                                                                                                        </FormGroup>
                                                                                                    </div>
                                                                                                </FormGroup>
                                                                                            </Col> */}
                                            </Row>

                                            <Row>
                                              {this.state.sifEnabled == true ? (
                                                <Col md="4">
                                                  <FormGroup>
                                                    <Label htmlFor="gender">
                                                      <span className="text-danger">
                                                        *{" "}
                                                      </span>
                                                      {strings.Gender}
                                                    </Label>
                                                    <Select
                                                      options={
                                                        this.gender
                                                          ? selectOptionsFactory.renderOptions(
                                                              "label",
                                                              "value",
                                                              this.gender,
                                                              "Gender"
                                                            )
                                                          : []
                                                      }
                                                      id="gender"
                                                      name="gender"
                                                      placeholder={
                                                        strings.Select +
                                                        strings.Gender
                                                      }
                                                      value={this.state.gender}
                                                      onChange={(value) => {
                                                        props.handleChange(
                                                          "gender"
                                                        )(value);
                                                      }}
                                                      className={`${
                                                        props.errors.gender &&
                                                        props.touched.gender
                                                          ? "is-invalid"
                                                          : ""
                                                      }`}
                                                    />
                                                    {props.errors.gender &&
                                                      props.touched.gender && (
                                                        <div className="invalid-feedback">
                                                          {props.errors.gender}
                                                        </div>
                                                      )}
                                                  </FormGroup>
                                                </Col>
                                              ) : (
                                                <Col md="4">
                                                  <FormGroup>
                                                    <Label htmlFor="select">
                                                      <span className="text-danger">
                                                        *{" "}
                                                      </span>
                                                      {
                                                        strings.employee_unique_id
                                                      }
                                                      <i
                                                        id="employeeCodeTooltip"
                                                        className="fa fa-question-circle ml-1"
                                                      ></i>
                                                      <UncontrolledTooltip
                                                        placement="right"
                                                        target="employeeCodeTooltip"
                                                      >
                                                        Employee Unique Id
                                                        system is designed by
                                                        the organization to
                                                        identify the employee
                                                        from a group of
                                                        employees and his work
                                                        details. i.e. Its
                                                        Internal ID designed for
                                                        Identifying Employee.
                                                      </UncontrolledTooltip>
                                                    </Label>
                                                    <Input
                                                      type="text"
                                                      maxLength="14"
                                                      // minLength="14"
                                                      autoComplete="off"
                                                      id="employeeCode"
                                                      name="employeeCode"
                                                      value={
                                                        props.values
                                                          .employeeCode
                                                      }
                                                      placeholder={
                                                        strings.Enter +
                                                        strings.EmployeeCode
                                                      }
                                                      onChange={(option) => {
                                                        if (
                                                          option.target
                                                            .value === "" ||
                                                          this.regExEmpUniqueId.test(
                                                            option.target.value
                                                          )
                                                        ) {
                                                          props.handleChange(
                                                            "employeeCode"
                                                          )(option);
                                                          this.employeeValidationCheck(
                                                            option.target.value
                                                          );
                                                        }
                                                      }}
                                                      className={
                                                        props.errors
                                                          .employeeCode &&
                                                        props.touched
                                                          .employeeCode
                                                          ? "is-invalid"
                                                          : ""
                                                      }
                                                    />
                                                    {props.errors
                                                      .employeeCode &&
                                                      props.touched
                                                        .employeeCode && (
                                                        <div className="invalid-feedback">
                                                          {
                                                            props.errors
                                                              .employeeCode
                                                          }
                                                        </div>
                                                      )}
                                                  </FormGroup>
                                                </Col>
                                              )}

                                              <Col md="4">
                                                {this.state.sifEnabled ==
                                                true ? (
                                                  <FormGroup>
                                                    <Label htmlFor="maritalStatus">
                                                      <span className="text-danger">
                                                        *{" "}
                                                      </span>
                                                      {strings.maritalStatus}
                                                    </Label>
                                                    <Select
                                                      options={
                                                        this.maritalStatus
                                                          ? selectOptionsFactory.renderOptions(
                                                              "label",
                                                              "value",
                                                              this
                                                                .maritalStatus,
                                                              "Marital Status"
                                                            )
                                                          : []
                                                      }
                                                      id="maritalStatus"
                                                      name="maritalStatus"
                                                      placeholder={
                                                        strings.Select +
                                                        strings.maritalStatus
                                                      }
                                                      value={
                                                        props.values
                                                          .maritalStatus
                                                      }
                                                      onChange={(option) => {
                                                        props.handleChange(
                                                          "maritalStatus"
                                                        )(option);
                                                        this.setState({
                                                          maritalStatus:
                                                            option.value,
                                                        });
                                                      }}
                                                      className={`${
                                                        props.errors
                                                          .maritalStatus &&
                                                        props.touched
                                                          .maritalStatus
                                                          ? "is-invalid"
                                                          : ""
                                                      }`}
                                                    />
                                                    {props.errors
                                                      .maritalStatus &&
                                                      props.touched
                                                        .maritalStatus && (
                                                        <div className="invalid-feedback">
                                                          {
                                                            props.errors
                                                              .maritalStatus
                                                          }
                                                        </div>
                                                      )}
                                                  </FormGroup>
                                                ) : (
                                                  <FormGroup className="mb-3">
                                                    <Label htmlFor="dateOfJoining">
                                                      <span className="text-danger">
                                                        *{" "}
                                                      </span>
                                                      {strings.DateOfJoining}
                                                    </Label>
                                                    <DatePicker
                                                      className={`form-control ${
                                                        props.errors
                                                          .dateOfJoining &&
                                                        props.touched
                                                          .dateOfJoining
                                                          ? "is-invalid"
                                                          : ""
                                                      }`}
                                                      id="dateOfJoining"
                                                      name="dateOfJoining"
                                                      placeholderText={
                                                        strings.Select +
                                                        strings.DateOfJoining
                                                      }
                                                      showMonthDropdown
                                                      showYearDropdown
                                                      dateFormat="dd-MM-yyyy"
                                                      dropdownMode="select"
                                                      // maxDate={new Date()}
                                                      autoComplete={"off"}
                                                      selected={
                                                        props.values
                                                          .dateOfJoining
                                                      }
                                                      value={
                                                        props.values
                                                          .dateOfJoining
                                                      }
                                                      onChange={(value) => {
                                                        props.handleChange(
                                                          "dateOfJoining"
                                                        )(value);
                                                      }}
                                                    />
                                                    {props.errors
                                                      .dateOfJoining &&
                                                      props.touched
                                                        .dateOfJoining && (
                                                        <div className="invalid-feedback">
                                                          {
                                                            props.errors
                                                              .dateOfJoining
                                                          }
                                                        </div>
                                                      )}
                                                  </FormGroup>
                                                )}
                                              </Col>

                                              {/* <Col md="4">
                                                                                                <FormGroup>
                                                                                                    <Label htmlFor="bloodGroup">{strings.BloodGroup}</Label>
                                                                                                    <Select

                                                                                                        options={
                                                                                                            this.bloodGroup
                                                                                                                ? selectOptionsFactory.renderOptions(
                                                                                                                    'label',
                                                                                                                    'value',
                                                                                                                    this.bloodGroup,
                                                                                                                    'Blood Group',
                                                                                                                )
                                                                                                                : []
                                                                                                        }
                                                                                                        id="bloodGroup"
                                                                                                        name="bloodGroup"
                                                                                                        placeholder={strings.Select+strings.BloodGroup}
                                                                                                        value={this.state.bloodGroup}
                                                                                                        onChange={(option) => {
                                                                                                            props.handleChange('bloodGroup')(option.value);

                                                                                                        }}
                                                                                                        className={`${props.errors.bloodGroup && props.touched.bloodGroup
                                                                                                            ? 'is-invalid'
                                                                                                            : ''
                                                                                                            }`}
                                                                                                    />
                                                                                                    {props.errors.bloodGroup && props.touched.bloodGroup && (
                                                                                                        <div className="invalid-feedback">
                                                                                                            {props.errors.bloodGroup}
                                                                                                        </div>
                                                                                                    )}

                                                                                                </FormGroup>
                                                                                            </Col> */}
                                              <Col>
                                                <div
                                                  style={{ display: "flex" }}
                                                >
                                                  <div style={{ width: "55%" }}>
                                                    <FormGroup>
                                                      <Label
                                                        htmlFor="employeeDesignationId"
                                                        className="overflow-hidden text-truncate"
                                                      >
                                                        <span className="text-danger">
                                                          *{" "}
                                                        </span>
                                                        {strings.Designation}
                                                      </Label>
                                                      <Select
                                                        options={
                                                          designation_dropdown
                                                            ? selectOptionsFactory.renderOptions(
                                                                "label",
                                                                "value",
                                                                designation_dropdown,
                                                                "Employee Designation"
                                                              )
                                                            : []
                                                        }
                                                        id="employeeDesignationId"
                                                        name="employeeDesignationId"
                                                        placeholder={
                                                          strings.Select +
                                                          strings.Designation
                                                        }
                                                        value={
                                                          designation_dropdown &&
                                                          selectOptionsFactory
                                                            .renderOptions(
                                                              "label",
                                                              "value",
                                                              designation_dropdown,
                                                              "employeeDesignationId"
                                                            )
                                                            .find(
                                                              (option) =>
                                                                option.value ===
                                                                +props.values
                                                                  .employeeDesignationId
                                                                  .value
                                                            )
                                                        }
                                                        onChange={(value) => {
                                                          this.setState({
                                                            newDesig: false,
                                                          });
                                                          props.handleChange(
                                                            "employeeDesignationId"
                                                          )(value);
                                                          props.handleChange(
                                                            "salaryRoleId"
                                                          )(1);
                                                        }}
                                                        className={`${
                                                          props.errors
                                                            .employeeDesignationId &&
                                                          props.touched
                                                            .employeeDesignationId
                                                            ? "is-invalid"
                                                            : ""
                                                        }`}
                                                      />
                                                      {props.errors
                                                        .employeeDesignationId &&
                                                        props.touched
                                                          .employeeDesignationId && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .employeeDesignationId
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </div>
                                                  <div>
                                                    <Label
                                                      htmlFor="employeeDesignationId"
                                                      style={{
                                                        display: "block",
                                                      }}
                                                    ></Label>
                                                    <Button
                                                      type="button"
                                                      color="primary"
                                                      className="btn-square mt-4  pull-right overflow-hidden text-truncate"
                                                      onClick={(e, props) => {
                                                        this.openDesignationModal(
                                                          props
                                                        );
                                                      }}
                                                    >
                                                      <i className="fa fa-plus"></i>{" "}
                                                      {strings.AddDesignation}
                                                    </Button>
                                                  </div>
                                                </div>
                                              </Col>
                                            </Row>
                                            {this.state.sifEnabled == false && (
                                              <Row>
                                                <Col md="4">
                                                  <FormGroup>
                                                    <Input
                                                      className="ml-0"
                                                      type="checkbox"
                                                      id="inline-checkbox1"
                                                      name="otherDetails"
                                                      checked={
                                                        this.state.otherDetails
                                                      }
                                                      onChange={() => {
                                                        this.setState(
                                                          (prevState) => ({
                                                            otherDetails:
                                                              !prevState.otherDetails,
                                                          })
                                                        );
                                                      }}
                                                    />
                                                    <Label
                                                      className="ml-4"
                                                      htmlFor="otherDetails"
                                                    >
                                                      {strings.Other +
                                                        " " +
                                                        strings.Details}
                                                    </Label>
                                                  </FormGroup>
                                                </Col>
                                              </Row>
                                            )}
                                            {this.state.otherDetails ==
                                              true && (
                                              <>
                                                {this.state.sifEnabled ==
                                                  false && (
                                                  <Row>
                                                    <Col md="4">
                                                      <FormGroup>
                                                        <Label htmlFor="gender">
                                                          {strings.Gender}
                                                        </Label>
                                                        <Select
                                                          options={
                                                            this.gender
                                                              ? selectOptionsFactory.renderOptions(
                                                                  "label",
                                                                  "value",
                                                                  this.gender,
                                                                  "Gender"
                                                                )
                                                              : []
                                                          }
                                                          id="gender"
                                                          name="gender"
                                                          placeholder={
                                                            strings.Select +
                                                            strings.Gender
                                                          }
                                                          value={
                                                            this.state.gender
                                                          }
                                                          onChange={(value) => {
                                                            props.handleChange(
                                                              "gender"
                                                            )(value);
                                                          }}
                                                          className={`${
                                                            props.errors
                                                              .gender &&
                                                            props.touched.gender
                                                              ? "is-invalid"
                                                              : ""
                                                          }`}
                                                        />
                                                        {props.errors.gender &&
                                                          props.touched
                                                            .gender && (
                                                            <div className="invalid-feedback">
                                                              {
                                                                props.errors
                                                                  .gender
                                                              }
                                                            </div>
                                                          )}
                                                      </FormGroup>
                                                    </Col>

                                                    <Col md="4">
                                                      <FormGroup>
                                                        <Label htmlFor="maritalStatus">
                                                          {
                                                            strings.maritalStatus
                                                          }
                                                        </Label>
                                                        <Select
                                                          options={
                                                            this.maritalStatus
                                                              ? selectOptionsFactory.renderOptions(
                                                                  "label",
                                                                  "value",
                                                                  this
                                                                    .maritalStatus,
                                                                  "Marital Status"
                                                                )
                                                              : []
                                                          }
                                                          id="maritalStatus"
                                                          name="maritalStatus"
                                                          placeholder={
                                                            strings.Select +
                                                            strings.maritalStatus
                                                          }
                                                          value={
                                                            props.values
                                                              .maritalStatus
                                                          }
                                                          onChange={(
                                                            option
                                                          ) => {
                                                            props.handleChange(
                                                              "maritalStatus"
                                                            )(option);
                                                            this.setState({
                                                              maritalStatus:
                                                                option.value,
                                                            });
                                                          }}
                                                          className={`${
                                                            props.errors
                                                              .maritalStatus &&
                                                            props.touched
                                                              .maritalStatus
                                                              ? "is-invalid"
                                                              : ""
                                                          }`}
                                                        />
                                                        {props.errors
                                                          .maritalStatus &&
                                                          props.touched
                                                            .maritalStatus && (
                                                            <div className="invalid-feedback">
                                                              {
                                                                props.errors
                                                                  .maritalStatus
                                                              }
                                                            </div>
                                                          )}
                                                      </FormGroup>
                                                    </Col>
                                                  </Row>
                                                )}
                                                <Row>
                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="parentId">
                                                        {strings.ReportsTo}
                                                      </Label>
                                                      <Select
                                                        options={
                                                          employee_list_dropdown.data
                                                            ? selectOptionsFactory.renderOptions(
                                                                "label",
                                                                "value",
                                                                employee_list_dropdown.data,
                                                                "Employee"
                                                              )
                                                            : []
                                                        }
                                                        id="parentId"
                                                        name="parentId"
                                                        placeholder={
                                                          strings.Select +
                                                          strings.SuperiorEmployeeName
                                                        }
                                                        value={
                                                          this.state.parentId
                                                        }
                                                        onChange={(value) => {
                                                          props.handleChange(
                                                            "parentId"
                                                          )(value);
                                                        }}
                                                        className={`${
                                                          props.errors
                                                            .parentId &&
                                                          props.touched.parentId
                                                            ? "is-invalid"
                                                            : ""
                                                        }`}
                                                      />
                                                      {props.errors.parentId &&
                                                        props.touched
                                                          .parentId && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .parentId
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>

                                                  {/* <Col md="4">
                                                                                                <FormGroup>
                                                                                                    <Label htmlFor="salaryRoleId"><span className="text-danger">* </span> {strings.SalaryRole} </Label>
                                                                                                    <Select

                                                                                                        options={
                                                                                                            salary_role_dropdown.data
                                                                                                                ? selectOptionsFactory.renderOptions(
                                                                                                                    'label',
                                                                                                                    'value',
                                                                                                                    salary_role_dropdown.data,
                                                                                                                    'Salary Role',
                                                                                                                )
                                                                                                                : []
                                                                                                        }
                                                                                                        id="salaryRoleId"
                                                                                                        name="salaryRoleId"
                                                                                                        placeholder={strings.Select+strings.SalaryRole}
                                                                                                        value={
                                                                                                            salary_role_dropdown.data
                                                                                                            && selectOptionsFactory.renderOptions(
                                                                                                                'label',
                                                                                                                'value',
                                                                                                                salary_role_dropdown.data,
                                                                                                                'Salary Role',
                                                                                                            ).find(
                                                                                                                (option) =>
                                                                                                                    option.value ===
                                                                                                                    props.values
                                                                                                                        .salaryRoleId,
                                                                                                            )}
                                                                                                        onChange={(options) => {
                                                                                                            if (options && options.value) {
                                                                                                                props.handleChange(
                                                                                                                    'salaryRoleId',
                                                                                                                )(options.value);
                                                                                                            } else {
                                                                                                                props.handleChange(
                                                                                                                    'salaryRoleId',
                                                                                                                )('');
                                                                                                            }
                                                                                                        }}
                                                                                                        className={`${props.errors.salaryRoleId && props.touched.salaryRoleId
                                                                                                            ? 'is-invalid'
                                                                                                            : ''
                                                                                                            }`}
                                                                                                    />
                                                                                                    {props.errors.salaryRoleId && props.touched.salaryRoleId && (
                                                                                                        <div className="invalid-feedback">
                                                                                                            {props.errors.salaryRoleId}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </FormGroup>
                                                                                            </Col> */}
                                                </Row>

                                                <Row className="row-wrapper">
                                                  <Col md="8">
                                                    <FormGroup>
                                                      <Label htmlFor="gender">
                                                        {this.state
                                                          .sifEnabled ==
                                                          true && (
                                                          <span className="text-danger">
                                                            *{" "}
                                                          </span>
                                                        )}{" "}
                                                        {strings.PresentAddress}{" "}
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        maxLength="100"
                                                        id="presentAddress"
                                                        name="presentAddress"
                                                        value={
                                                          props.values
                                                            .presentAddress
                                                        }
                                                        placeholder={
                                                          strings.Enter +
                                                          strings.PresentAddress
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option.target
                                                              .value === "" ||
                                                            this.regExAddress.test(
                                                              option.target
                                                                .value
                                                            )
                                                          ) {
                                                            props.handleChange(
                                                              "presentAddress"
                                                            )(option);
                                                          }
                                                        }}
                                                        className={
                                                          props.errors
                                                            .presentAddress &&
                                                          props.touched
                                                            .presentAddress
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.errors
                                                        .presentAddress &&
                                                        props.touched
                                                          .presentAddress && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .presentAddress
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>
                                                  {props.values.countryId ==
                                                    229 ||
                                                  props.values.countryId
                                                    .value == 229 ? (
                                                    <Col md="4">
                                                      <FormGroup>
                                                        {/* <Label htmlFor="select">{strings.POBoxNumber}</Label> */}
                                                        <Label htmlFor="POBoxNumber">
                                                          <span className="text-danger"></span>
                                                          {strings.POBoxNumber}
                                                        </Label>
                                                        <Input
                                                          type="text"
                                                          minLength="3"
                                                          maxLength="6"
                                                          id="poBoxNumber"
                                                          name="poBoxNumber"
                                                          placeholder={
                                                            strings.Enter +
                                                            strings.POBoxNumber
                                                          }
                                                          onChange={(
                                                            option
                                                          ) => {
                                                            if (
                                                              option.target
                                                                .value === "" ||
                                                              this.regEx.test(
                                                                option.target
                                                                  .value
                                                              )
                                                            ) {
                                                              if (
                                                                option.target
                                                                  .value
                                                                  .length < 3
                                                              )
                                                                this.setState({
                                                                  showpoBoxNumberErrorMsg: true,
                                                                });
                                                              else
                                                                this.setState({
                                                                  showpoBoxNumberErrorMsg: false,
                                                                });
                                                              props.handleChange(
                                                                "poBoxNumber"
                                                              )(option);
                                                              props.handleChange(
                                                                "poBoxNumber"
                                                              )(option);
                                                            }
                                                          }}
                                                          value={
                                                            props.values
                                                              .poBoxNumber
                                                          }
                                                          className={
                                                            props.errors
                                                              .poBoxNumber &&
                                                            props.touched
                                                              .poBoxNumber
                                                              ? "is-invalid"
                                                              : ""
                                                          }
                                                        />
                                                        {props.errors
                                                          .poBoxNumber &&
                                                          props.touched
                                                            .poBoxNumber && (
                                                            <div className="invalid-feedback">
                                                              {
                                                                props.errors
                                                                  .poBoxNumber
                                                              }
                                                            </div>
                                                          )}
                                                      </FormGroup>
                                                    </Col>
                                                  ) : (
                                                    <Col md="4">
                                                      <FormGroup>
                                                        <Label htmlFor="postZipCode">
                                                          <span className="text-danger">
                                                            {" "}
                                                          </span>
                                                          {strings.PostZipCode}
                                                        </Label>
                                                        <Input
                                                          type="text"
                                                          maxLength="6"
                                                          id="PostZipCode"
                                                          name="PostZipCode"
                                                          autoComplete="Off"
                                                          placeholder={
                                                            strings.Enter +
                                                            strings.PostZipCode
                                                          }
                                                          onChange={(
                                                            option
                                                          ) => {
                                                            if (
                                                              option.target
                                                                .value === "" ||
                                                              this.regEx.test(
                                                                option.target
                                                                  .value
                                                              )
                                                            ) {
                                                              props.handleChange(
                                                                "PostZipCode"
                                                              )(option);
                                                            }
                                                          }}
                                                          value={
                                                            props.values
                                                              .PostZipCode
                                                          }
                                                          className={
                                                            props.errors
                                                              .PostZipCode &&
                                                            props.touched
                                                              .PostZipCode
                                                              ? "is-invalid"
                                                              : ""
                                                          }
                                                        />
                                                        {props.errors
                                                          .PostZipCode &&
                                                          props.touched
                                                            .PostZipCode && (
                                                            <div className="invalid-feedback">
                                                              {
                                                                props.errors
                                                                  .PostZipCode
                                                              }
                                                            </div>
                                                          )}
                                                      </FormGroup>
                                                    </Col>
                                                  )}
                                                </Row>
                                                <Row className="row-wrapper">
                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="countryId">
                                                        {this.state
                                                          .sifEnabled ==
                                                          true && (
                                                          <span className="text-danger">
                                                            *{" "}
                                                          </span>
                                                        )}
                                                        {strings.Country}
                                                      </Label>
                                                      <Select
                                                        //  isDisabled
                                                        options={
                                                          country_list
                                                            ? selectOptionsFactory.renderOptions(
                                                                "countryName",
                                                                "countryCode",
                                                                country_list,
                                                                "Country"
                                                              )
                                                            : []
                                                        }
                                                        value={
                                                          props.values.countryId
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option &&
                                                            option.value
                                                          ) {
                                                            props.handleChange(
                                                              "countryId"
                                                            )(option);
                                                            props.handleChange(
                                                              "PostZipCode"
                                                            )("");
                                                            this.getStateList(
                                                              option.value
                                                            );
                                                          } else {
                                                            props.handleChange(
                                                              "countryId"
                                                            )("");
                                                            this.getStateList(
                                                              ""
                                                            );
                                                          }
                                                          props.handleChange(
                                                            "stateId"
                                                          )("");
                                                        }}
                                                        placeholder={
                                                          strings.Select +
                                                          strings.Country
                                                        }
                                                        id="countryId"
                                                        name="countryId"
                                                        className={
                                                          props.errors
                                                            .countryId &&
                                                          props.touched
                                                            .countryId
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.errors.countryId &&
                                                        props.touched
                                                          .countryId && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .countryId
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="stateId">
                                                        {this.state
                                                          .sifEnabled ==
                                                          true && (
                                                          <span className="text-danger">
                                                            *{" "}
                                                          </span>
                                                        )}
                                                        {props.values.countryId
                                                          .value === 229
                                                          ? strings.Emirate
                                                          : strings.StateRegion}
                                                      </Label>
                                                      <Select
                                                        options={
                                                          state_list
                                                            ? selectOptionsFactory.renderOptions(
                                                                "label",
                                                                "value",
                                                                state_list,
                                                                props.values
                                                                  .countryId
                                                                  .value === 229
                                                                  ? strings.Emirate
                                                                  : strings.StateRegion
                                                              )
                                                            : []
                                                        }
                                                        value={
                                                          state_list &&
                                                          selectOptionsFactory
                                                            .renderOptions(
                                                              "label",
                                                              "value",
                                                              state_list,
                                                              props.values
                                                                .countryId
                                                                .value === 229
                                                                ? strings.Emirate
                                                                : strings.StateRegion
                                                            )
                                                            .find(
                                                              (option) =>
                                                                option.value ===
                                                                props.values
                                                                  .stateId
                                                            )
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option &&
                                                            option.value
                                                          ) {
                                                            props.handleChange(
                                                              "stateId"
                                                            )(option);
                                                          } else {
                                                            props.handleChange(
                                                              "stateId"
                                                            )("");
                                                          }
                                                        }}
                                                        placeholder={
                                                          props.values.countryId
                                                            .value === 229
                                                            ? strings.Emirate
                                                            : strings.StateRegion
                                                        }
                                                        id="stateId"
                                                        name="stateId"
                                                        className={
                                                          props.errors
                                                            .stateId &&
                                                          props.touched.stateId
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.errors.stateId &&
                                                        props.touched
                                                          .stateId && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .stateId
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="state">
                                                        <span className="text-danger"></span>
                                                        {strings.City}{" "}
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        maxLength="100"
                                                        id="city"
                                                        name="city"
                                                        value={
                                                          props.values.city
                                                        }
                                                        placeholder={
                                                          strings.Location
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option.target
                                                              .value === "" ||
                                                            this.regExAlpha.test(
                                                              option.target
                                                                .value
                                                            )
                                                          ) {
                                                            props.handleChange(
                                                              "city"
                                                            )(option);
                                                          }
                                                        }}
                                                        className={
                                                          props.errors.city &&
                                                          props.touched.city
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.errors.city &&
                                                        props.touched.city && (
                                                          <div className="invalid-feedback">
                                                            {props.errors.city}
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>
                                                </Row>
                                                <hr></hr>
                                                <h4 className="mb-3 mt-3">
                                                  {strings.EducationDetails}
                                                </h4>
                                                <Row>
                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="university">
                                                        {" "}
                                                        {
                                                          strings.University
                                                        }{" "}
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        maxLength="100"
                                                        id="university"
                                                        name="university"
                                                        value={
                                                          props.values
                                                            .university
                                                        }
                                                        placeholder={
                                                          strings.Enter +
                                                          strings.University
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option.target
                                                              .value === "" ||
                                                            this.regExAlpha.test(
                                                              option.target
                                                                .value
                                                            )
                                                          ) {
                                                            props.handleChange(
                                                              "university"
                                                            )(option);
                                                          }
                                                        }}
                                                        className={
                                                          props.errors
                                                            .university &&
                                                          props.touched
                                                            .university
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.university &&
                                                        props.touched
                                                          .university && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .university
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>

                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="qualification">
                                                        {" "}
                                                        {
                                                          strings.qualification
                                                        }{" "}
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        maxLength="100"
                                                        id="qualification"
                                                        name="qualification"
                                                        placeholder={
                                                          strings.Enter +
                                                          strings.qualification
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option.target
                                                              .value === "" ||
                                                            this.regExQualification.test(
                                                              option.target
                                                                .value
                                                            )
                                                          ) {
                                                            props.handleChange(
                                                              "qualification"
                                                            )(option);
                                                          }
                                                        }}
                                                        value={
                                                          props.values
                                                            .qualification
                                                        }
                                                        className={
                                                          props.errors
                                                            .qualification &&
                                                          props.touched
                                                            .qualification
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.qualification &&
                                                        props.touched
                                                          .qualification && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .qualification
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>

                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="Year Of Passing">
                                                        {" "}
                                                        {
                                                          strings.qualificationYearOfCompletionDate
                                                        }{" "}
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        maxLength="10"
                                                        id="Year Of Passing"
                                                        name="Year Of Passing"
                                                        placeholder={
                                                          strings.Enter +
                                                          strings.qualificationYearOfCompletionDate
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option.target
                                                              .value === "" ||
                                                            this.regExQualificationYear.test(
                                                              option.target
                                                                .value
                                                            )
                                                          ) {
                                                            props.handleChange(
                                                              "qualificationYearOfCompletionDate"
                                                            )(option);
                                                          }
                                                        }}
                                                        value={
                                                          props.values
                                                            .qualificationYearOfCompletionDate
                                                        }
                                                        className={
                                                          props.errors
                                                            .qualificationYearOfCompletionDate &&
                                                          props.touched
                                                            .qualificationYearOfCompletionDate
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.qualificationYearOfCompletionDate &&
                                                        props.touched
                                                          .qualificationYearOfCompletionDate && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .qualificationYearOfCompletionDate
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>
                                                </Row>

                                                <hr></hr>
                                                <h4 className="mb-3 mt-3">
                                                  {strings.EmergencyContact}
                                                </h4>
                                                <Row>
                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="emergencyContactName1">
                                                        {this.state
                                                          .sifEnabled ==
                                                          true && (
                                                          <span className="text-danger">
                                                            *{" "}
                                                          </span>
                                                        )}
                                                        {strings.ContactName1}
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        maxLength="100"
                                                        id="emergencyContactName1"
                                                        name="emergencyContactName1"
                                                        value={
                                                          props.values
                                                            .emergencyContactName1
                                                        }
                                                        placeholder={
                                                          strings.Enter +
                                                          strings.ContactName1
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option.target
                                                              .value === "" ||
                                                            this.regExAlpha.test(
                                                              option.target
                                                                .value
                                                            )
                                                          ) {
                                                            props.handleChange(
                                                              "emergencyContactName1"
                                                            )(option);
                                                          }
                                                        }}
                                                        className={
                                                          props.errors
                                                            .emergencyContactName1 &&
                                                          props.touched
                                                            .emergencyContactName1
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.errors
                                                        .emergencyContactName1 &&
                                                        props.touched
                                                          .emergencyContactName1 && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .emergencyContactName1
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>

                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="emergencyContactNumber1">
                                                        {this.state
                                                          .sifEnabled ==
                                                          true && (
                                                          <span className="text-danger">
                                                            *{" "}
                                                          </span>
                                                        )}{" "}
                                                        {strings.ContactNumber1}{" "}
                                                      </Label>
                                                      <div
                                                        className={
                                                          props.errors
                                                            .emergencyContactNumber1 &&
                                                          props.touched
                                                            .emergencyContactNumber1
                                                            ? " is-invalidMobile "
                                                            : ""
                                                        }
                                                      >
                                                        <PhoneInput
                                                          id="emergencyContactNumber1"
                                                          name="emergencyContactNumber1"
                                                          country={"ae"}
                                                          enableSearch={true}
                                                          international
                                                          value={
                                                            props.values
                                                              .emergencyContactNumber1
                                                          }
                                                          placeholder={
                                                            strings.Enter +
                                                            strings.ContactNumber1
                                                          }
                                                          onBlur={props.handleBlur(
                                                            "emergencyContactNumber1"
                                                          )}
                                                          onChange={(
                                                            option
                                                          ) => {
                                                            props.handleChange(
                                                              "emergencyContactNumber1"
                                                            )(option);
                                                            // option.length !==12 ? this.setState({checkmobileNumberParam: true }) : this.setState({ checkmobileNumberParam: false });
                                                          }}
                                                          className={
                                                            props.errors
                                                              .emergencyContactNumber1 &&
                                                            props.touched
                                                              .emergencyContactNumber1
                                                              ? "text-danger"
                                                              : ""
                                                          }
                                                        />
                                                      </div>
                                                      {props.errors
                                                        .emergencyContactNumber1 &&
                                                        props.touched
                                                          .emergencyContactNumber1 && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .emergencyContactNumber1
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>

                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="emergencyContactRelationship1">
                                                        {this.state
                                                          .sifEnabled ==
                                                          true && (
                                                          <span className="text-danger">
                                                            *{" "}
                                                          </span>
                                                        )}
                                                        {strings.Relationship1}{" "}
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        maxLength="100"
                                                        id="emergencyContactRelationship1"
                                                        name="emergencyContactRelationship1"
                                                        value={
                                                          props.values
                                                            .emergencyContactRelationship1
                                                        }
                                                        placeholder={
                                                          strings.Enter +
                                                          strings.Relationship1
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option.target
                                                              .value === "" ||
                                                            this.regExAlpha.test(
                                                              option.target
                                                                .value
                                                            )
                                                          ) {
                                                            props.handleChange(
                                                              "emergencyContactRelationship1"
                                                            )(option);
                                                          }
                                                        }}
                                                        className={
                                                          props.errors
                                                            .emergencyContactRelationship1 &&
                                                          props.touched
                                                            .emergencyContactRelationship1
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.errors
                                                        .emergencyContactRelationship1 &&
                                                        props.touched
                                                          .emergencyContactRelationship1 && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .emergencyContactRelationship1
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>

                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="emergencyContactName2">
                                                        {" "}
                                                        {strings.ContactName2}
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        maxLength="100"
                                                        id="emergencyContactName2"
                                                        name="emergencyContactName2"
                                                        placeholder={
                                                          strings.Enter +
                                                          strings.ContactName2
                                                        }
                                                        onChange={(option) => {
                                                          if (
                                                            option.target
                                                              .value === "" ||
                                                            this.regExAlpha.test(
                                                              option.target
                                                                .value
                                                            )
                                                          ) {
                                                            props.handleChange(
                                                              "emergencyContactName2"
                                                            )(option);
                                                          }
                                                        }}
                                                        value={
                                                          props.values
                                                            .emergencyContactName2
                                                        }
                                                        className={
                                                          props.errors
                                                            .emergencyContactName2 &&
                                                          props.touched
                                                            .emergencyContactName2
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.emergencyContactName2 &&
                                                        props.touched
                                                          .emergencyContactName2 && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .emergencyContactName2
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>

                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="emergencyContactNumber2">
                                                        {" "}
                                                        {
                                                          strings.ContactNumber2
                                                        }{" "}
                                                      </Label>
                                                      <PhoneInput
                                                        id="emergencyContactNumber2"
                                                        name="emergencyContactNumber2"
                                                        country={"ae"}
                                                        enableSearch={true}
                                                        international
                                                        value={
                                                          props.values
                                                            .emergencyContactNumber2
                                                        }
                                                        placeholder={
                                                          strings.Enter +
                                                          strings.ContactNumber2
                                                        }
                                                        onBlur={props.handleBlur(
                                                          "emergencyContactNumber2"
                                                        )}
                                                        onChange={(option) => {
                                                          props.handleChange(
                                                            "emergencyContactNumber2"
                                                          )(option);
                                                          // option.length!==12 ?  this.setState({checkmobileNumberParam2:true}) :this.setState({checkmobileNumberParam2:false});
                                                        }}
                                                        className={
                                                          props.errors
                                                            .emergencyContactNumber2 &&
                                                          props.touched
                                                            .emergencyContactNumber2
                                                            ? "text-danger"
                                                            : ""
                                                        }
                                                      />
                                                      {props.errors
                                                        .emergencyContactNumber2 &&
                                                        props.touched
                                                          .emergencyContactNumber2 && (
                                                          <div className="text-danger">
                                                            {
                                                              props.errors
                                                                .emergencyContactNumber2
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>

                                                  <Col md="4">
                                                    <FormGroup>
                                                      <Label htmlFor="emergencyContactRelationship2">
                                                        {" "}
                                                        {
                                                          strings.Relationship2
                                                        }{" "}
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        maxLength={"100"}
                                                        id="emergencyContactRelationship2"
                                                        name="emergencyContactRelationship2"
                                                        placeholder={
                                                          strings.Enter +
                                                          strings.Relationship2
                                                        }
                                                        onChange={(value) => {
                                                          props.handleChange(
                                                            "emergencyContactRelationship2"
                                                          )(value);
                                                        }}
                                                        value={
                                                          props.values
                                                            .emergencyContactRelationship2
                                                        }
                                                        className={
                                                          props.errors
                                                            .emergencyContactRelationship2 &&
                                                          props.touched
                                                            .emergencyContactRelationship2
                                                            ? "is-invalid"
                                                            : ""
                                                        }
                                                      />
                                                      {props.emergencyContactRelationship2 &&
                                                        props.touched
                                                          .emergencyContactRelationship2 && (
                                                          <div className="invalid-feedback">
                                                            {
                                                              props.errors
                                                                .qemergencyContactRelationship2
                                                            }
                                                          </div>
                                                        )}
                                                    </FormGroup>
                                                  </Col>
                                                </Row>
                                                <span
                                                  style={{ fontWeight: "bold" }}
                                                >
                                                  Note: Employees cannot be
                                                  deleted once a transaction has
                                                  been recorded for them.
                                                </span>
                                              </>
                                            )}
                                          </Col>
                                        </Row>
                                        <Row>
                                          <Col lg={12} className="mt-5">
                                            <Button
                                              color="secondary"
                                              className="btn-square"
                                              onClick={() => {
                                                if (this.props.closeModal) {
                                                  this.props.closeModal();
                                                } else
                                                  this.props.history.push(
                                                    "/admin/master/employee"
                                                  );
                                              }}
                                            >
                                              <i className="fa fa-ban"></i> Back
                                            </Button>
                                            <Button
                                              name="button"
                                              color="primary"
                                              className="btn-square pull-right"
                                              // onClick={() => {
                                              //     this.toggle(0, '2')
                                              // }}
                                              disabled={
                                                this.state
                                                  .disabledPersonalDetailNextButton
                                              }
                                              onClick={() => {
                                                //  added validation popup  msg
                                                props.handleBlur();
                                                if (
                                                  props.errors &&
                                                  Object.keys(props.errors)
                                                    .length != 0
                                                )
                                                  this.props.commonActions.fillManDatoryDetails();
                                                this.setState(
                                                  { createMore: false },
                                                  () => {
                                                    props.handleSubmit();
                                                  }
                                                );
                                              }}
                                            >
                                              {strings.Next}
                                              <i className="far fa-arrow-alt-circle-right ml-1"></i>
                                            </Button>
                                          </Col>
                                        </Row>
                                      </Form>
                                    )}
                                  </Formik>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </TabPane>
                  <TabPane tabId="2">
                    <div className="create-employee-screen">
                      <div className="animated fadeIn">
                        <Row>
                          <Col lg={12} className="mx-auto">
                            <div>
                              <Row>
                                <Col lg={12}>
                                  <Formik
                                    ref={this.formRef}
                                    initialValues={this.state.initValue}
                                    onSubmit={(values, { resetForm }) => {
                                      this.handleSubmitForEmployement(
                                        values,
                                        resetForm
                                      );
                                    }}
                                    validationSchema={Yup.object().shape({
                                      employeeCode: Yup.string().required(
                                        "Employee unique id is required"
                                      ),
                                      labourCard: Yup.string().required(
                                        "Labour card id is required"
                                      ),

                                      dateOfJoining: Yup.date().required(
                                        "Date of joining is required"
                                      ),
                                    })}
                                    validate={(values) => {
                                      let errors = {};
                                      // if(values.employeeCode &&
                                      //     values.employeeCode.length &&
                                      //     values.employeeCode.length!=14)
                                      // {
                                      //     errors.employeeCode =
                                      //     'Employee unique id must be 14 digit';
                                      // }else
                                      if (
                                        exist === true &&
                                        values.employeeCode != ""
                                      ) {
                                        errors.employeeCode =
                                          "Employee unique id already exists";
                                      }
                                      if (
                                        laborCardIdexist === true &&
                                        values.employeeCode != ""
                                      ) {
                                        errors.labourCard =
                                          "Labour card id already exists";
                                      }

                                      return errors;
                                    }}
                                  >
                                    {(props) => (
                                      <Form onSubmit={props.handleSubmit}>
                                        <Row>
                                          <Col xs="4" md="4" lg={10}>
                                            <Row>
                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>
                                                    {strings.employee_unique_id}
                                                    <i
                                                      id="employeeCodeTooltip"
                                                      className="fa fa-question-circle ml-1"
                                                    ></i>
                                                    <UncontrolledTooltip
                                                      placement="right"
                                                      target="employeeCodeTooltip"
                                                    >
                                                      Employee Unique Id system
                                                      is designed by the
                                                      organization to identify
                                                      the employee from a group
                                                      of employees and his work
                                                      details. i.e. Its Internal
                                                      ID designed for
                                                      Identifying Employee.
                                                    </UncontrolledTooltip>
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="14"
                                                    // minLength="14"
                                                    autoComplete="off"
                                                    id="employeeCode"
                                                    name="employeeCode"
                                                    value={
                                                      props.values.employeeCode
                                                    }
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.EmployeeCode
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regExEmpUniqueId.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        props.handleChange(
                                                          "employeeCode"
                                                        )(option);
                                                        this.employeeValidationCheck(
                                                          option.target.value
                                                        );
                                                      }
                                                    }}
                                                    className={
                                                      props.errors
                                                        .employeeCode &&
                                                      props.touched.employeeCode
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.employeeCode &&
                                                    props.touched
                                                      .employeeCode && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .employeeCode
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>

                                              {/* <Col md="4">
                                                                                                <FormGroup>
                                                                                                    <Label htmlFor="salaryRoleId"><span className="text-danger">* </span> {strings.SalaryRole} </Label>
                                                                                                    <Select

                                                                                                        options={
                                                                                                            salary_role_dropdown.data
                                                                                                                ? selectOptionsFactory.renderOptions(
                                                                                                                    'label',
                                                                                                                    'value',
                                                                                                                    salary_role_dropdown.data,
                                                                                                                    'SalaryRole',
                                                                                                                )
                                                                                                                : []
                                                                                                        }
                                                                                                        id="salaryRoleId"
                                                                                                        name="salaryRoleId"
                                                                                                        placeholder="Select salary Role "
                                                                                                        value={
                                                                                                            salary_role_dropdown.data
                                                                                                            && selectOptionsFactory.renderOptions(
                                                                                                                'label',
                                                                                                                'value',
                                                                                                                salary_role_dropdown.data,
                                                                                                                'EmploSalaryRoleyee',
                                                                                                            ).find(
                                                                                                                (option) =>
                                                                                                                    option.value ===
                                                                                                                    props.values
                                                                                                                        .salaryRoleId,
                                                                                                            )}
                                                                                                        onChange={(options) => {
                                                                                                            if (options && options.value) {
                                                                                                                props.handleChange(
                                                                                                                    'salaryRoleId',
                                                                                                                )(options.value);
                                                                                                            } else {
                                                                                                                props.handleChange(
                                                                                                                    'salaryRoleId',
                                                                                                                )('');
                                                                                                            }
                                                                                                        }}
                                                                                                        className={`${props.errors.salaryRoleId && props.touched.salaryRoleId
                                                                                                            ? 'is-invalid'
                                                                                                            : ''
                                                                                                            }`}
                                                                                                    />
                                                                                                    {props.errors.salaryRoleId && props.touched.salaryRoleId && (
                                                                                                        <div className="invalid-feedback">
                                                                                                            {props.errors.salaryRoleId}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </FormGroup>
                                                                                            </Col> */}
                                              {/* <Col md="4">
                                                                                                <FormGroup>
                                                                                                    <Label htmlFor="grossSalary">Gross Salary </Label>
                                                                                                    <Input
                                                                                                        type="text"
                                                                                                        id="grossSalary"
                                                                                                        name="grossSalary"
                                                                                                        placeholder="Enter  grossSalary "
                                                                                                        onChange={(value) => {
                                                                                                            props.handleChange('grossSalary')(value);

                                                                                                        }}
                                                                                                        value={props.values.grossSalary}
                                                                                                        className={
                                                                                                            props.errors.grossSalary && props.touched.grossSalary
                                                                                                                ? "is-invalid"
                                                                                                                : ""
                                                                                                        }
                                                                                                    />
                                                                                                    {props.grossSalary && props.touched.grossSalary && (
                                                                                                        <div className="invalid-feedback">{props.errors.visaNumber}</div>
                                                                                                    )}
                                                                                                </FormGroup>
                                                                                            </Col> */}

                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="labourCard">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>{" "}
                                                    {strings.LabourCardId}
                                                    <i
                                                      id="labourCardTooltip"
                                                      className="fa fa-question-circle ml-1"
                                                    ></i>
                                                    <UncontrolledTooltip
                                                      placement="right"
                                                      target="labourCardTooltip"
                                                    >
                                                      Labour Card Id (LIN) is a
                                                      unique identification
                                                      number issued to employers
                                                      to simplifying business
                                                      regulations and bringing
                                                      in transparency and
                                                      accountability in labor
                                                      inspections by various
                                                      agencies and bodies under
                                                      the administrative control
                                                      of Labour Ministry. It
                                                      will be available in
                                                      SIF-file.
                                                    </UncontrolledTooltip>
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="14"
                                                    id="labourCard"
                                                    name="labourCard"
                                                    value={
                                                      props.values.labourCard
                                                    }
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.LabourCard
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regExBoth.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        props.handleChange(
                                                          "labourCard"
                                                        )(option);
                                                        this.laborCardIdValidationCheck(
                                                          option.target.value
                                                        );
                                                      }
                                                    }}
                                                    className={
                                                      props.errors.labourCard &&
                                                      props.touched.labourCard
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />{" "}
                                                  {props.errors.labourCard &&
                                                    props.touched
                                                      .labourCard && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .labourCard
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                            </Row>
                                            <Row>
                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    {" "}
                                                    {strings.Department}{" "}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    id="department"
                                                    name="department"
                                                    value={
                                                      props.values.department
                                                    }
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.Department
                                                    }
                                                    onChange={(value) => {
                                                      props.handleChange(
                                                        "department"
                                                      )(value);
                                                    }}
                                                    className={
                                                      props.errors.department &&
                                                      props.touched.department
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.department &&
                                                    props.touched
                                                      .department && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .department
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              <Col md="4">
                                                <FormGroup className="mb-3">
                                                  <Label htmlFor="dateOfJoining">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>
                                                    {strings.DateOfJoining}
                                                  </Label>
                                                  <DatePicker
                                                    className={`form-control ${
                                                      props.errors
                                                        .dateOfJoining &&
                                                      props.touched
                                                        .dateOfJoining
                                                        ? "is-invalid"
                                                        : ""
                                                    }`}
                                                    id="dateOfJoining"
                                                    name="dateOfJoining"
                                                    placeholderText={
                                                      strings.Select +
                                                      strings.DateOfJoining
                                                    }
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dateFormat="dd-MM-yyyy"
                                                    dropdownMode="select"
                                                    // maxDate={new Date()}
                                                    autoComplete={"off"}
                                                    selected={
                                                      props.values.dateOfJoining
                                                    }
                                                    value={
                                                      props.values.dateOfJoining
                                                    }
                                                    onChange={(value) => {
                                                      props.handleChange(
                                                        "dateOfJoining"
                                                      )(value);
                                                    }}
                                                  />
                                                  {props.errors.dateOfJoining &&
                                                    props.touched
                                                      .dateOfJoining && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .dateOfJoining
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                            </Row>
                                            <Row>
                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="gender">
                                                    {strings.PassportNumber}{" "}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="9"
                                                    id="passportNumber"
                                                    name="passportNumber"
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.PassportNumber
                                                    }
                                                    value={
                                                      props.values
                                                        .passportNumber
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regExBoth.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        props.handleChange(
                                                          "passportNumber"
                                                        )(option);
                                                      }
                                                    }}
                                                    className={
                                                      props.errors
                                                        .passportNumber &&
                                                      props.touched
                                                        .passportNumber
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.passportNumber &&
                                                    props.touched
                                                      .passportNumber && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .passportNumber
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              <Col md="4">
                                                <FormGroup className="mb-3">
                                                  <Label htmlFor="passportExpiryDate">
                                                    {" "}
                                                    {strings.PassportExpiryDate}
                                                  </Label>
                                                  <DatePicker
                                                    className={`form-control ${
                                                      props.errors
                                                        .passportExpiryDate &&
                                                      props.touched
                                                        .passportExpiryDate
                                                        ? "is-invalid"
                                                        : ""
                                                    }`}
                                                    id="passportExpiryDate"
                                                    name="passportExpiryDate"
                                                    placeholderText={
                                                      strings.Select +
                                                      strings.PassportExpiryDate
                                                    }
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dateFormat="dd-MM-yyyy"
                                                    dropdownMode="select"
                                                    selected={
                                                      props.values
                                                        .passportExpiryDate
                                                    }
                                                    value={
                                                      props.values
                                                        .passportExpiryDate
                                                    }
                                                    onChange={(value) => {
                                                      props.handleChange(
                                                        "passportExpiryDate"
                                                      )(value);
                                                    }}
                                                  />
                                                  {props.errors.dob &&
                                                    props.touched
                                                      .passportExpiryDate && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .passportExpiryDate
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                            </Row>

                                            {/* <Row>
                                                                                            <Col md="4">
                                                                                                <FormGroup>
                                                                                                    <Label htmlFor="gender"> {strings.VisaNumber} </Label>
                                                                                                    <Input
                                                                                                        type="text"
                                                                                                        maxLength="8"
                                                                                                        id="visaNumber"
                                                                                                        name="visaNumber"
                                                                                                        placeholder={strings.Enter+strings.VisaNumber}
                                                                                                        value={props.values.visaNumber}
                                                                                                        onChange={(option) => {
                                                                                                            if (option.target.value === '' || this.regExBoth.test(option.target.value)) { props.handleChange('visaNumber')(option) }
                                                                                                        }}
                                                                                                        className={props.errors.visaNumber && props.touched.visaNumber ? "is-invalid" : ""}
                                                                                                    />
                                                                                                    {props.visaNumber && props.touched.visaNumber && (
                                                                                                        <div className="invalid-feedback">{props.errors.visaNumber}</div>
                                                                                                    )}
                                                                                                </FormGroup>
                                                                                            </Col>
                                                                                            <Col md="4">
                                                                                                <FormGroup className="mb-3">
                                                                                                    <Label htmlFor="visaExpiryDate">{strings.VisaExpiryDate} </Label>
                                                                                                    <DatePicker
                                                                                                        className={`form-control ${props.errors.visaExpiryDate && props.touched.visaExpiryDate ? "is-invalid" : ""}`}
                                                                                                        id="visaExpiryDate"
                                                                                                        name="visaExpiryDate"
                                                                                                        placeholderText={strings.Select+strings.VisaExpiryDate}
                                                                                                        showMonthDropdown
                                                                                                        showYearDropdown
                                                                                                        dateFormat="dd-MM-yyyy"
                                                                                                        dropdownMode="select"
                                                                                                        selected={props.values.visaExpiryDate}
                                                                                                        value={props.values.visaExpiryDate}
                                                                                                        onChange={(value) => {
                                                                                                            props.handleChange("visaExpiryDate")(value)
                                                                                                        }}
                                                                                                    />
                                                                                                    {props.errors.dob && props.touched.visaExpiryDate && (
                                                                                                        <div className="invalid-feedback">{props.errors.visaExpiryDate}</div>
                                                                                                    )}
                                                                                                </FormGroup>
                                                                                            </Col>
                                                                                        </Row> */}

                                            <Row></Row>
                                          </Col>
                                        </Row>
                                        <Row>
                                          <Col lg={12} className="mt-5">
                                            <Button
                                              name="button"
                                              color="primary"
                                              className="btn-square"
                                              onClick={() => {

                                                this.toggle(0, "1");
                                              }}
                                            >
                                              <i className="far fa-arrow-alt-circle-left mr-1"></i>{" "}
                                              {strings.back}
                                            </Button>
                                            <Button
                                              name="button"
                                              color="primary"
                                              className="btn-square pull-right"
                                              // onClick={() => {
                                              //     this.toggle(0, '3')
                                              // }}
                                              onClick={() => {
                                                //  added validation popup  msg
                                                props.handleBlur();
                                                if (
                                                  props.errors &&
                                                  Object.keys(props.errors)
                                                    .length != 0
                                                )
                                                  this.props.commonActions.fillManDatoryDetails();
                                                this.setState(
                                                  { createMore: false },
                                                  () => {
                                                    props.handleSubmit();
                                                  }
                                                );
                                              }}
                                            >
                                              {strings.Next}
                                              <i className="far fa-arrow-alt-circle-right ml-1"></i>
                                            </Button>
                                          </Col>
                                        </Row>
                                      </Form>
                                    )}
                                  </Formik>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </TabPane>
                  <TabPane tabId="3">
                    <div className="create-employee-screen">
                      <div className="animated fadeIn">
                        <Row>
                          <Col lg={12} className="mx-auto">
                            <div>
                              <Row>
                                <Col lg={12}>
                                  <Formik
                                    initialValues={this.state.initValue}
                                    onSubmit={(values, { resetForm }) => {
                                      this.handleSubmitForFinancial(
                                        values,
                                        resetForm
                                      );
                                    }}
                                    validate={(values) => {
                                      let errors = {};
                                      if (existForAccountNumber === true) {
                                        errors.accountNumber =
                                          "Account number already exists";
                                      }
                                      if (!values.accountNumber) {
                                        errors.accountNumber =
                                          "Account number is required";
                                      } else if (
                                        /^0+$/.test(values.accountNumber)
                                      ) {
                                        errors.accountNumber =
                                          "Please enter a valid Account number";
                                      }
                                      if (!values.iban) {
                                        errors.iban = "IBAN Number is required";
                                      } else if (/^0+$/.test(values.iban)) {
                                        errors.iban =
                                          "Please enter a valid IBAN Number";
                                      }
                                      if (!this.state.accountHolderName) {
                                        errors.accountHolderName =
                                          "Account holder name is required";
                                      }
                                      return errors;
                                    }}
                                    validationSchema={Yup.object().shape({
                                      // accountHolderName: Yup.string().required(
                                      //   "Account holder name is required"
                                      // ),
                                      accountNumber: Yup.string().required(
                                        "Account number is required"
                                      ),
                                      iban: Yup.string().required(
                                        "IBAN Number is required"
                                      ),
                                      // bankName: Yup.string()
                                      // .required("Bank Name is required"),
                                      bankId:
                                        Yup.string().required(
                                          "Bank is required"
                                        ),
                                      branch:
                                        Yup.string().required(
                                          "Branch is required"
                                        ),
                                      agentId: Yup.string().required(
                                        "Agent ID is required"
                                      ),
                                      //     salaryRoleId: Yup.string()
                                      // .required("salary Role is required"),
                                      // swiftCode: Yup.string()
                                      // .required("Swift Code is required"),
                                    })}
                                  >
                                    {(props) => (
                                      <Form onSubmit={props.handleSubmit}>
                                        <Row>
                                          <Col xs="4" md="4" lg={10}>
                                            <h4> {strings.BankDetails} </h4>

                                            <Row>
                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>
                                                    {strings.AccountHolderName}{" "}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="60"
                                                    id="accountHolderName"
                                                    name="accountHolderName"
                                                    value={
                                                      this.state
                                                        .accountHolderName
                                                    }
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.AccountHolderName
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regExAlpha.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        props.handleChange(
                                                          "accountHolderName"
                                                        )(option);
                                                        this.setState({
                                                          accountHolderName:
                                                            option.target.value,
                                                        });
                                                      }
                                                    }}
                                                    className={
                                                      props.errors
                                                        .accountHolderName &&
                                                      props.touched
                                                        .accountHolderName
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors
                                                    .accountHolderName &&
                                                    props.touched
                                                      .accountHolderName && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .accountHolderName
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>{" "}
                                                    {strings.AccountNumber}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="25"
                                                    id="accountNumber"
                                                    name="accountNumber"
                                                    value={
                                                      props.values.accountNumber
                                                    }
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.AccountNumber
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regEx.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        props.handleChange(
                                                          "accountNumber"
                                                        )(option);
                                                        this.existForAccountNumber(
                                                          option.target.value
                                                        );
                                                      }
                                                    }}
                                                    className={
                                                      props.errors
                                                        .accountNumber &&
                                                      props.touched
                                                        .accountNumber
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.accountNumber &&
                                                    props.touched
                                                      .accountNumber && (
                                                      <div className="invalid-feedback">
                                                        {
                                                          props.errors
                                                            .accountNumber
                                                        }
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>{" "}
                                                    {strings.BankName}{" "}
                                                  </Label>
                                                  <Select
                                                    options={
                                                      bankList
                                                        ? selectOptionsFactory.renderOptions(
                                                            "bankName",
                                                            "bankId",
                                                            bankList,
                                                            "Bank"
                                                          )
                                                        : []
                                                    }
                                                    value={props.values.bankId}
                                                    onChange={(option) => {
                                                      if (
                                                        option &&
                                                        option.value
                                                      ) {
                                                        props.handleChange(
                                                          "bankId"
                                                        )(option);
                                                      } else {
                                                        props.handleChange(
                                                          "bankId"
                                                        )("");
                                                      }
                                                    }}
                                                    placeholder={
                                                      strings.Select +
                                                      strings.BankName
                                                    }
                                                    id="bankId"
                                                    name="bankId"
                                                    className={
                                                      props.errors.bankId &&
                                                      props.touched.bankId
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.bankId &&
                                                    props.touched.bankId && (
                                                      <div className="invalid-feedback">
                                                        {props.errors.bankId}
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              {/* <Col md="4">
                                                                                                <FormGroup>
                                                                                                    <Label htmlFor="select"><span className="text-danger">* </span> {strings.BankName} </Label>
                                                                                                    <Input
                                                                                                        type="text"
                                                                                                        id="bankName"
                                                                                                        name="bankName"
                                                                                                        value={props.values.bankName}
                                                                                                        placeholder={strings.Enter+strings.BankName}
                                                                                                        onChange={(option) => {
                                                                                                          
                                                                                                            if (
                                                                                                                option.target.value === '' ||
                                                                                                                this.regExAlpha.test(option.target.value)
                                                                                                            ) {
                                                                                                                props.handleChange('bankName')(option);
                                                                                                            }

                                                                                                        }}
                                                                                                        className={props.errors.bankName && props.touched.bankName ? "is-invalid" : ""}
                                                                                                    />
                                                                                                    {props.errors.bankName && props.touched.bankName && (
                                                                                                        <div className="invalid-feedback">{props.errors.bankName}</div>
                                                                                                    )}
                                                                                                </FormGroup>
                                                                                            </Col> */}
                                            </Row>

                                            <Row className="row-wrapper">
                                              <Col lg={4}>
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>
                                                    {strings.Branch}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="30"
                                                    id="branch"
                                                    name="branch"
                                                    value={props.values.branch}
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.Branch
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regExAlpha.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        props.handleChange(
                                                          "branch"
                                                        )(option);
                                                      }
                                                    }}
                                                    className={
                                                      props.errors.branch &&
                                                      props.touched.branch
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.branch &&
                                                    props.touched.branch && (
                                                      <div className="invalid-feedback">
                                                        {props.errors.branch}
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>
                                                    {strings.IBANNumber}
                                                  </Label>
                                                  <div
                                                    style={{ display: "flex" }}
                                                  >
                                                    <Input
                                                      disabled
                                                      style={{ width: "25%" }}
                                                      value="AE"
                                                    />
                                                    <Input
                                                      type="text"
                                                      id="iban"
                                                      name="iban"
                                                      maxLength="21"
                                                      value={props.values.iban}
                                                      placeholder={
                                                        strings.Enter +
                                                        strings.IBANNumber
                                                      }
                                                      onChange={(option) => {
                                                        if (
                                                          option.target
                                                            .value === "" ||
                                                          this.regEx.test(
                                                            option.target.value
                                                          )
                                                        ) {
                                                          props.handleChange(
                                                            "iban"
                                                          )(option);
                                                        }
                                                      }}
                                                      className={
                                                        props.errors.iban &&
                                                        props.touched.iban
                                                          ? "is-invalid"
                                                          : ""
                                                      }
                                                    />
                                                  </div>
                                                  {props.errors.iban &&
                                                    props.touched.iban && (
                                                      <div className="invalid-feedback d-block">
                                                        {props.errors.iban}
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>

                                              <Col lg={4}>
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    {/* <span className="text-danger">* </span> */}
                                                    {strings.SwiftCode}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="11"
                                                    id="swiftCode"
                                                    name="swiftCode"
                                                    value={
                                                      props.values.swiftCode
                                                    }
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.SwiftCode
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regExBoth.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        props.handleChange(
                                                          "swiftCode"
                                                        )(option);
                                                      }
                                                    }}
                                                    className={
                                                      props.errors.swiftCode &&
                                                      props.touched.swiftCode
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.swiftCode &&
                                                    props.touched.swiftCode && (
                                                      <div className="invalid-feedback">
                                                        {props.errors.swiftCode}
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>

                                              <Col md="4">
                                                <FormGroup>
                                                  <Label htmlFor="select">
                                                    <span className="text-danger">
                                                      *{" "}
                                                    </span>
                                                    {strings.agent_id}{" "}
                                                  </Label>
                                                  <Input
                                                    type="text"
                                                    maxLength="9"
                                                    minLength="9"
                                                    id="agentId"
                                                    name="agentId"
                                                    value={props.values.agentId}
                                                    placeholder={
                                                      strings.Enter +
                                                      strings.agent_id
                                                    }
                                                    onChange={(option) => {
                                                      if (
                                                        option.target.value ===
                                                          "" ||
                                                        this.regEx.test(
                                                          option.target.value
                                                        )
                                                      ) {
                                                        props.handleChange(
                                                          "agentId"
                                                        )(option);
                                                      }
                                                      // this.validationCheck(option.target.value);
                                                    }}
                                                    className={
                                                      props.errors.agentId &&
                                                      props.touched.agentId
                                                        ? "is-invalid"
                                                        : ""
                                                    }
                                                  />
                                                  {props.errors.agentId &&
                                                    props.touched.agentId && (
                                                      <div className="invalid-feedback">
                                                        {props.errors.agentId}
                                                      </div>
                                                    )}
                                                </FormGroup>
                                              </Col>
                                            </Row>
                                          </Col>
                                        </Row>
                                        <Row>
                                          <Col lg={12} className="mt-5">
                                            <Button
                                              name="button"
                                              color="primary"
                                              className="btn-square "
                                              onClick={() => {
                                                this.toggle(0, "2");
                                              }}
                                            >
                                              <i className="far fa-arrow-alt-circle-left mr-1"></i>{" "}
                                              {strings.back}
                                            </Button>
                                            <Button
                                              name="button"
                                              color="primary"
                                              className="btn-square pull-right "
                                              onClick={() => {
                                                //  added validation popup  msg
                                                props.handleBlur();
                                                if (
                                                  props.errors &&
                                                  Object.keys(props.errors)
                                                    .length != 0
                                                )
                                                  this.props.commonActions.fillManDatoryDetails();
                                                this.setState(
                                                  { createMore: false },
                                                  () => {
                                                    props.handleSubmit();
                                                  }
                                                );
                                              }}
                                            >
                                              {strings.Next}{" "}
                                              <i className="far fa-arrow-alt-circle-right ml-1"></i>
                                            </Button>
                                          </Col>
                                        </Row>
                                      </Form>
                                    )}
                                  </Formik>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>

                    {/* <div className="table-wrapper">
                                        <FormGroup className="text-center">
                                            <Button color="secondary" className="btn-square"
                                                onClick={() => { this.toggle(0, '2') }}>
                                                <i className="fa fa-ban"></i> Back
                                      </Button>
                                            <Button type="button" color="primary" className="btn-square mr-3" onClick={() => {
                                                this.setState({ createMore: false }, () => {
                                                    //   props.handleSubmit()
                                                })
                                            }}>
                                                <i className="fa fa-dot-circle-o"></i> Save
                                      </Button>
                                            <Button name="button" color="primary" className="btn-square mr-3"
                                                onClick={() => {
                                                    this.toggle(0, '4')
                                                }}>
                                                <i className="far fa-arrow-alt-circle-left mr-1"></i> Next
                                      </Button>

                                        </FormGroup>
                                    </div> */}
                  </TabPane>
                  <TabPane tabId="4">
                    {activeTab[0] === "4" && employeeId && (
                      <SalaryComponent
                        employeeId={employeeId}
                        handleSubmit={(values) => {
                          this.handleSubmitForSalary(values);
                        }}
                        history={this.props.history}
                        updateComponent={false}
                        toggle={(tab) => {
                          this.toggle(0, tab);
                        }}
                        sifEnabled={sifEnabled}
                      />
                    )}
                  </TabPane>
                </TabContent>
              </CardBody>
            )}
          </Card>
        </div>
        <DesignationModal
          openDesignationModal={this.state.openDesignationModal}
          closeDesignationModal={(e) => {
            this.closeDesignationModal(e);
          }}
          nameDesigExist={this?.state?.nameDesigExist}
          idDesigExist={this?.state?.idDesigExist}
          validateid={this.designationIdvalidationCheck}
          validateinfo={this.designationNamevalidationCheck}
          getCurrentUser={(e) => this.getCurrentUser(e)}
          createDesignation={
            this.props.createPayrollEmployeeActions.createEmployeeDesignation
          }
          designationType_list={this.props.designationType_list}
        />

        {this.state.disableLeavePage ? "" : <LeavePage />}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateEmployeePayroll);
