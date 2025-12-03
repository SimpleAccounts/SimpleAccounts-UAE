import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Form,
    FormGroup,
    Label,
    Row,
    Col,
    UncontrolledTooltip
} from 'reactstrap'
import { Loader, LeavePage, ImageUploader } from 'components'
import Select from 'react-select'
import { CommonActions } from 'services/global'
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css'
import DatePicker from 'react-datepicker'
import * as DetailEmployeePersonalAction from './actions';
import * as CreatePayrollEmployeeActions from '../create/actions'
import { Formik } from 'formik';
import { data } from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'
import { selectOptionsFactory } from 'utils'
import moment from 'moment'
import { DesignationModal } from 'screens/payrollemp/sections';
import * as DesignationActions from '../../../designation/actions'
import { upperFirst } from 'lodash-es';

const mapStateToProps = (state) => {
    return ({
        designation_dropdown: state.payrollEmployee.designation_dropdown,
        employee_list_dropdown: state.payrollEmployee.employee_list_dropdown,
        state_list: state.payrollEmployee.state_list,
        country_list: state.payrollEmployee.country_list,
        salary_role_dropdown: state.payrollEmployee.salary_role_dropdown,
        designationType_list: state.employeeDesignation.designationType_list,
    })
}
const mapDispatchToProps = (dispatch) => {
    return ({
        commonActions: bindActionCreators(CommonActions, dispatch),
        detailEmployeePersonalAction: bindActionCreators(DetailEmployeePersonalAction, dispatch),
        createPayrollEmployeeActions: bindActionCreators(CreatePayrollEmployeeActions, dispatch),
        designationActions: bindActionCreators(DesignationActions, dispatch),
    })
}
let strings = new LocalizedStrings(data);


class UpdateEmployeePersonal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window['localStorage'].getItem('language'),
            initValue: {},
            loading: true,
            dialog: null,
            gender: '',
            bloodGroup: '',
            userPhoto: [],
            imageState: true,
            showIcon: false,
            sifEnabled: true,
            otherDetails: true,
            userPhotoFile: {},
            current_employee_id: null,
            checkmobileNumberParam: false,
            checkmobileNumberParam1: false,
            checkmobileNumberParam2: false,
            loadingMsg: "Loading....",
            disableLeavePage: false,
            emailExist: false,
            openDesignationModal: false,
            newDesig: false
        }

        this.regExAlpha = /^[a-zA-Z ]+$/;
        this.regEx = /^[0-9\d]+$/;
        this.regExBoth = /[a-zA-Z0-9]+$/;
        this.regExSpaceBoth = /[a-zA-Z0-9 ]+$/;
        this.regExAddress = /^[a-zA-Z0-9\s\D,'-/ ]+$/;
        this.regExEmpUniqueId = /[a-zA-Z0-9,-/ ]+$/;
        this.formRef = React.createRef();

        this.gender = [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' }
        ];

        this.maritalStatus = [
            { label: 'Single', value: 'Single' },
            { label: 'Married', value: 'Married' },
            { label: 'Widowed', value: 'Widowed' },
            { label: 'Divorced', value: 'Divorced' },
            { label: 'Separated', value: 'Separated' },
        ];

        // this.bloodGroup = [
        //     { label: 'O+', value: 'O+' },
        //     { label: 'O-', value: 'O-' },
        //     { label: 'A+', value: 'A+' },
        //     { label: 'A-', value: 'A-' },
        //     { label: 'B+', value: 'B+' },
        //     { label: 'B-', value: 'B-' },
        //     { label: 'AB+', value: 'AB+' },
        //     { label: 'AB-', value: 'AB-' },

        // ];
    }

    uploadImage = (picture, file) => {
        if (
            this.state.userPhoto[0] &&
            this.state.userPhoto[0].indexOf('data') < 0
        ) {
            this.setState({ imageState: true });
        } else {
            this.setState({ imageState: false });
        }
        this.setState({
            userPhoto: picture,
            userPhotoFile: file,
        });
    };
    componentDidMount = () => {
        this.props.createPayrollEmployeeActions.getCompanyById().then((res) => {
            this.setState({
              sifEnabled: res.data.generateSif,
            });
          });
        if (this.props.location.state && this.props.location.state.id) {
            this.props.detailEmployeePersonalAction.getEmployeeById(this.props.location.state.id).then((res) => {
                this.props.createPayrollEmployeeActions.getCountryList();
                this.props.createPayrollEmployeeActions.getStateList();
                this.props.createPayrollEmployeeActions.getEmployeeDesignationForDropdown();
                this.props.createPayrollEmployeeActions.getEmployeesForDropdown();
                this.props.createPayrollEmployeeActions.getSalaryRolesForDropdown();
                this.props.designationActions.getParentDesignationList();
                if (res.status === 200) {

                    this.setState({
                        loading: false,
                        current_employee_id: this.props.location.state.id,
                        initValue: {
                            id: res.data.id ? res.data.id : '',
                            firstName:
                                res.data.firstName && res.data.firstName !== null
                                    ? res.data.firstName
                                    : '',
                            middleName:
                                res.data.middleName && res.data.middleName !== null
                                    ? res.data.middleName
                                    : '',
                            lastName:
                                res.data.lastName && res.data.lastName !== null
                                    ? res.data.lastName
                                    : '',
                            email:
                                res.data.email && res.data.email !== null
                                    ? res.data.email
                                    : '',
                            maritalStatus:
                                res.data.maritalStatus ? res.data.maritalStatus : '',
                            mobileNumber:
                                res.data.mobileNumber && res.data.mobileNumber !== null
                                    ? res.data.mobileNumber
                                    : '',
                            salaryRoleId:
                                res.data.salaryRoleId && res.data.salaryRoleId !== null
                                    ? res.data.salaryRoleId
                                    : '',
                            dob: res.data.dob
                                ? res.data.dob
                                : '',
                            dateOfJoining: res.data.dateOfJoining
                                ? moment(res.data.dateOfJoining, 'DD-MM-YYYY').toDate()
                                : '',
                            gender: res.data.gender ? res.data.gender : '',
                            employeeCode:
                                res.data.employeeCode && res.data.employeeCode !== null
                                    ? res.data.employeeCode
                                    : '',
                            presentAddress:
                                res.data.presentAddress && res.data.presentAddress !== null
                                    ? res.data.presentAddress
                                    : '',
                            city:
                                res.data.city && res.data.city !== null
                                    ? res.data.city
                                    : '',
                            countryId:
                                res.data.countryId && res.data.countryId !== null
                                    ? res.data.countryId
                                    : '',
                            stateId:
                                res.data.stateId && res.data.stateId !== null
                                    ? res.data.stateId
                                    : '',
                            pincode:
                                res.data.pincode && res.data.pincode !== null
                                    ? res.data.pincode
                                    : '',
                            // bloodGroup:
                            //     res.data.bloodGroup && res.data.bloodGroup !== null
                            //         ? res.data.bloodGroup
                            //         : '',
                            employeeDesignationId:{
                              value : res.data.employeeDesignationId && res.data.employeeDesignationId !== null
                                    ? res.data.employeeDesignationId
                                    : ''    },
                            parentId:
                                res.data.parentId && res.data.parentId !== null
                                    ? res.data.parentId
                                    : '',
                            emergencyContactName1:
                                res.data.emergencyContactName1 && res.data.emergencyContactName1 !== null ?
                                    res.data.emergencyContactName1 : '',
                            emergencyContactName2:
                                res.data.emergencyContactName2 && res.data.emergencyContactName2 !== null ?
                                    res.data.emergencyContactName2 : '',
                            emergencyContactNumber1:
                                res.data.emergencyContactNumber1 && res.data.emergencyContactNumber1 !== null ?
                                    res.data.emergencyContactNumber1 : '',
                            emergencyContactNumber2:
                                res.data.emergencyContactNumber2 && res.data.emergencyContactNumber2 !== null ?
                                    res.data.emergencyContactNumber2 : '',
                            emergencyContactRelationship1:
                                res.data.emergencyContactRelationship1 && res.data.emergencyContactRelationship1 !== null ?
                                    res.data.emergencyContactRelationship1 : '',
                            emergencyContactRelationship2:
                                res.data.emergencyContactRelationship2 && res.data.emergencyContactRelationship2 !== null ?
                                    res.data.emergencyContactRelationship2 : '',
                            university:
                                res.data.university && res.data.university !== null
                                    ? res.data.university
                                    : '',
                            qualification:
                                res.data.qualification && res.data.qualification !== null
                                    ? res.data.qualification
                                    : '',
                            qualificationYearOfCompletionDate:
                                res.data.qualificationYearOfCompletionDate && res.data.qualificationYearOfCompletionDate !== null
                                    ? res.data.qualificationYearOfCompletionDate
                                    : '',

                            isActive:
                                res.data.isActive && res.data.isActive !== null
                                    ? res.data.isActive
                                    : '',
                            userPhoto: res.data.profilePicByteArray
                                ? this.state.userPhoto.concat(res.data.profilePicByteArray)
                                : [],

                            PostZipCode:
                                res.data.pincode && res.data.pincode !== null
                                    ? res.data.pincode
                                    : '',

                            poBoxNumber:
                                res.data.pincode && res.data.pincode !== null
                                    ? res.data.pincode
                                    : '',

                        },
                        userPhoto: res.data.profileImageBinary
                            ? this.state.userPhoto.concat(res.data.profileImageBinary)
                            : [],
                        selectedStatus: res.data.isActive ? true : false,
                    },
                        () => {
                            this.props.createPayrollEmployeeActions.getStateList(
                                this.state.initValue.countryId,
                            );
                        }

                    )

                }

            }

            ).catch((err) => {
                this.setState({ loading: false })
                // this.props.history.push('/admin/payroll/employee')
                this.props.history.push('/admin/master/employee/viewEmployee',
                { id: this.props.location.state.id })
            })
        } else {
            // this.props.history.push('/admin/payroll/employee')
            this.props.history.push('/admin/master/employee/viewEmployee',
                { id: this.props.location.state.id })
        }
    }

    employeeValidationCheck = (value) => {
        const data = {
            moduleType: 15,
            name: value,
        };
        this.props.createPayrollEmployeeActions
            .checkValidation(data)
            .then((response) => {
                if (response.data === 'Employee Code Already Exists') {
                    this.setState(
                        {
                            exist: true,
                        },
                        
                        () => {},
                    );
                
                } else {
                    this.setState({
                        exist: false,
                    });
                }
            });
    };

    designationNamevalidationCheck = (value) => {
        const data = {
            moduleType: 26,
            name: value,
        };
        this.props.commonActions.checkValidation(data).then((response) => {
            if (response.data === 'Designation name already exists') {
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
            if (response.data === 'Designation ID already exists') {
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
        this.props.createPayrollEmployeeActions.getEmployeeDesignationForDropdown().then((res) => {
            if (res.status === 200) {
                const lastOption = res.data[res.data.length - 1]
                this.setState({
                    initValue: {
                        ...this.state.initValue,
                        ...{ employeeDesignationId: lastOption },
                    },
                    newDesig: true,
                });
                this.formRef.current.setFieldValue('employeeDesignationId', this.state.initValue.employeeDesignationId)
            }
        });
    };

    // Create or Edit 
    handleSubmit = (data) => {

        this.setState({ disabled: true, disableLeavePage: true, });
        const { current_employee_id } = this.state;
        const {
            firstName,
            middleName,
            lastName,
            email,
            dob,
            parentId,
            mobileNumber,
            stateId,
            countryId,
            city,
            gender,
            pincode,
            // bloodGroup,            
            maritalStatus,
            presentAddress,
            employeeDesignationId,
            salaryRoleId,
            university,
            qualification,
            qualificationYearOfCompletionDate,
            emergencyContactName1,
            emergencyContactNumber2,
            emergencyContactRelationship1,
            emergencyContactNumber1,
            emergencyContactName2,
            emergencyContactRelationship2,
            poBoxNumber,
            PostZipCode,
            dateOfJoining,
            employeeCode,
        } = data;

        let formData = new FormData();
        let formData1 = new FormData();
        formData.append('id', current_employee_id);
        formData.append('salaryRoleId', salaryRoleId);
        formData.append(
            'firstName',
            firstName !== null ? firstName : '',
        );
        formData.append(
            'middleName',
            middleName !== null ? middleName : '',
        );
        formData.append(
            'lastName',
            lastName !== null ? lastName : '',
        );
        formData.append(
            'email',
            email !== null ? email : '',
        );
        formData.append('dob', dob ? moment(dob).format('DD-MM-YYYY') : '');
        formData.append('gender', gender);

        // formData.append('bloodGroup', bloodGroup);
        formData.append(
            'mobileNumber',
            mobileNumber !== null ? mobileNumber : '',
        );
        formData.append(
            'pincode',
            PostZipCode !== null ? PostZipCode : '',
        );

        formData.append('isActive', this.state.selectedStatus);
        formData.append(
            'presentAddress',
            presentAddress !== null ? presentAddress : '',
        );
        // formData.append(
        // 	'city',
        // 	city !== null ? city : '',
        // );
        formData.append(
            'university',
            university != null ? university : '',
        );
        formData.append(
            'qualification',
            qualification != null ? qualification : '',
        );
        formData.append(
            'qualificationYearOfCompletionDate',
            qualificationYearOfCompletionDate != null ? qualificationYearOfCompletionDate : '',
        );
        formData.append(
            'emergencyContactName1',
            emergencyContactName1 != null ? emergencyContactName1 : '',
        );

        formData.append(
            'emergencyContactNumber2',
            emergencyContactNumber2 != null ?
                emergencyContactNumber2 : '',
        );
        formData.append(
            'emergencyContactRelationship1',
            emergencyContactRelationship1 != null ? emergencyContactRelationship1 : '',
        );
        formData.append(
            'emergencyContactNumber1',
            emergencyContactNumber1 != null ? emergencyContactNumber1 : '',
        );
        formData.append(
            'emergencyContactName2',
            emergencyContactName2 != null ? emergencyContactName2 : '',
        );
        formData.append(
            'emergencyContactRelationship2',
            emergencyContactRelationship2 != null ? emergencyContactRelationship2 : '',
        );
        formData.append(
            'maritalStatus', maritalStatus.value,
        );
        if (employeeDesignationId && employeeDesignationId.value) {
            formData.append('employeeDesignationId', employeeDesignationId.value);
        }
        if (stateId && stateId.value) {
            formData.append('stateId', stateId.value);
        }
        if (countryId && countryId.value) {
            formData.append('countryId', countryId.value);
        }
        if (parentId && parentId.value) {
            formData.append('parentId', parentId.value);
        }
        if (this.state.userPhotoFile.length > 0) {
            formData.append('profileImageBinary ', this.state.userPhotoFile[0]);
        }
        this.setState({ loading: true, loadingMsg: "Updating Employee ..." });
        this.props.detailEmployeePersonalAction.updateEmployeePersonal(formData).then((res) => {
            if (res.status === 200) {
                this.props.commonActions.tostifyAlert(
                    'success',
                    res.data ? res.data.message : 'Employee Updated Successfully'
                )
                if (this.state.sifEnabled == false) {
                    formData1.append('id', current_employee_id);
                    formData1.append('employee', current_employee_id);
                    formData1.append("employeeCode", employeeCode != null ? employeeCode : "");
                    formData1.append('dateOfJoining', dateOfJoining ? moment(dateOfJoining).format('DD-MM-YYYY') : '');
                    this.props.detailEmployeePersonalAction
                    .updateEmployment(formData1).then(() => {
                        this.props.history.push('/admin/master/employee/viewEmployee',
                        { id: this.props.location.state.id })
                        this.setState({ loading: false, });
                    })
                } else {
                    // this.props.history.push('/admin/payroll/employee')
                    this.props.history.push('/admin/master/employee/viewEmployee',
                    { id: this.props.location.state.id })
                    this.setState({ loading: false, });
                }
            }
        }).catch((err) => {
            this.props.commonActions.tostifyAlert(
                'error',
                err.data.message ? err.data.message : 'updated Unsuccessfully'
            )
        })
    }
    underAge = (birthday) => {
        birthday=moment(birthday).format('DD-MM-YYYY')
        let dateArray = birthday.split("-")
        let birthdate = dateArray[1] + "/" + dateArray[0] + "/" + dateArray[2]
        // set current day on 01:00:00 hours GMT+0100 (CET)
        var currentDate = new Date().toJSON().slice(0, 10) + ' 01:00:00';
        // calculate age comparing current date and borthday
        var myAge = ~~((Date.now(currentDate) - new Date(birthdate)) / (31557600000));

        if (myAge < 14)
            return true;
        else
            return false;
    }
    selectedDate = (dob) => {

        if (dob && dob != "") {
            let date = dob.split("-")
            let d = date[1] + "/" + date[0] + "/" + date[2]
            // console.log(new Date(moment(props.values.dob,'DD-MM-YYYY').format('MM-DD-YYYY')));
            return new Date(d);
            // return new Date(moment(props.values.dob,'DD-MM-YYYY').format('MM-DD-YYYY'));
        }
        else
            return new Date()
    }
    emailvalidationCheck = (value) => {
        const data = {
            moduleType: 24,
            name: value,
        };
        this.props.commonActions.checkValidation(data).then((response) => {
            if (response.data === 'Employee email already exists') {
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

    render() {
        strings.setLanguage(this.state.language);
        const { loading, loadingMsg, initValue, dialog, checkmobileNumberParam, checkmobileNumberParam1, checkmobileNumberParam2,exist } = this.state
        const { designation_dropdown, country_list, state_list, employee_list_dropdown, salary_role_dropdown } = this.props

        return (
            loading == true ? <Loader loadingMsg={loadingMsg} /> :
                <div>
                    <div className="detail-vat-code-screen">
                        <div className="animated fadeIn">
                            {dialog}
                            <Row>
                                <Col lg={12}>
                                    <Card>
                                        <CardHeader>
                                            <div className="h4 mb-0 d-flex align-items-center">
                                                <i className="nav-icon icon-briefcase" />
                                                <span className="ml-2"> {strings.UpdateEmployeePersonalDetails}</span>
                                            </div>
                                        </CardHeader>
                                        <CardBody>
                                            {loading ? (
                                                <Loader></Loader>
                                            ) : (

                                                <Row>
                                                    <Col lg={12}>
                                                        <Formik
                                                            initialValues={initValue}
                                                            ref={this.formRef}
                                                            onSubmit={(values) => {
                                                                this.handleSubmit(values)
                                                            }}
                                                            validate={(values) => {
                                                                console.log(values)
                                                                let errors = {};
                                                                if (this.state.emailExist === true && values.email !== '') {
                                                                    errors.email = 'Email already exists';
                                                                }
                                                                if (exist === true  && values.employeeCode!="") {
                                                                    errors.employeeCode =
                                                                    'Employee unique id already exists';
                                                                }

                                                                if (values.employeeDesignationId && values.employeeDesignationId.label && values.employeeDesignationId.label === "Select Employee Designation") {
                                                                    errors.employeeDesignationId =
                                                                        'Designation is required';
                                                                }

                                                                if (this.underAge(values.dob))
                                                                    errors.dob = 'Age should be more than 14 years';
                                                                if (values.dob === '') {
                                                                    errors.dob = 'Date of birth is required';

                                                                }
                                                                if (this.state.sifEnabled == true) {

                                                                    if (values.maritalStatus.value === '') {
                                                                        errors.maritalStatus = 'Marital status is required';
                                                                    }
                                                                    if (values.mobileNumber && values.mobileNumber.length !== 12) {
                                                                        errors.mobileNumber = 'Invalid mobile number'
                                                                    }
                                                                    if (values.emergencyContactNumber1 && values.emergencyContactNumber1.length !== 12) {
                                                                        errors.emergencyContactNumber1 = 'Invalid mobile number'
                                                                    }
                                                                    if (values.countryId == 229 || values.countryId.value == 229) {
                                                                        if (values.stateId == "")
                                                                        errors.stateId = 'Emirate is required';
                                                                    } else {
                                                                        if (values.stateId == "")
                                                                        errors.stateId = 'State is required';
                                                                    }
                                                                }
                                                                return errors;
                                                            }}
                                                            validationSchema={
                                                                this.state.sifEnabled == true
                                                                  ? Yup.object().shape({
                                                                firstName: Yup.string()
                                                                    .required("first name is required"),
                                                                lastName: Yup.string()
                                                                    .required("Last name is required"),
                                                                email: Yup.string()
                                                                    .required("Email is Required").email('Invalid Email'),
                                                                dob: Yup.string()
                                                                    .required('DOB is required'),
                                                                presentAddress: Yup.string()
                                                                    .required("Present address is required"),
                                                                countryId: Yup.string()
                                                                    .required("Country is required"),
                                                                stateId: Yup.string()
                                                                    .required("State is required"),
                                                                gender: Yup.string()
                                                                    .required("Gender is required"),
                                                                maritalStatus: Yup.string()
                                                                    .required('Marital status is required'),
                                                                employeeDesignationId: Yup.string()
                                                                    .required('Designation is required'),
                                                                mobileNumber: Yup.string()
                                                                    .required('Mobile number is required'),
                                                                emergencyContactName1: Yup.string()
                                                                    .required('Contact name is required')
                                                                ,
                                                                emergencyContactNumber1: Yup.string()
                                                                    .required("Contact number is required").test('not smame', 'Please Enter Another Mobile Number', (value) => {
                                                                        return value !== this.state.masterPhoneNumber
                                                                    }),
                                                                emergencyContactRelationship1: Yup.string()
                                                                    .required('Relationship 1 is required'),
                                                            }) : Yup.object().shape({
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
                                                                <Form onSubmit={props.handleSubmit} name="simpleForm">

                                                                    <Row>
                                                                        <Col xs="4" md="4" lg={2}>
                                                                            <FormGroup className="mb-3 text-center">
                                                                                <ImageUploader
                                                                                    // withIcon={true}
                                                                                    buttonText="Choose images"
                                                                                    onChange={(picture, file) => {
                                                                                        this.uploadImage(picture, file);
                                                                                        props.handleChange("photo")(picture);
                                                                                    }}
                                                                                    imgExtension={[
                                                                                        'jpg',
                                                                                        'png',
                                                                                        'jpeg',
                                                                                    ]}
                                                                                    maxFileSize={40000}
                                                                                    withPreview={true}
                                                                                    singleImage={true}
                                                                                    withIcon={this.state.showIcon}
                                                                                    // buttonText="Choose Profile Image"
                                                                                    flipHeight={
                                                                                        this.state.userPhoto.length > 0
                                                                                            ? { height: 'inherit' }
                                                                                            : {}
                                                                                    }
                                                                                    label="'Max file size: 40kb"
                                                                                    labelClass={
                                                                                        this.state.userPhoto.length > 0
                                                                                            ? 'hideLabel'
                                                                                            : 'showLabel'
                                                                                    }
                                                                                    buttonClassName={
                                                                                        this.state.userPhoto.length > 0
                                                                                            ? 'hideButton'
                                                                                            : 'showButton'
                                                                                    }
                                                                                    defaultImages={this.state.userPhoto}
                                                                                    imageState={this.state.imageState}
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>

                                                                        <Col xs="4" md="4" lg={10}>
                                                                            <Row>  <Col md="4">
                                                                                <FormGroup className="mb-3">

                                                                                    <div>
                                                                                        <FormGroup check inline>  <span className="text-danger">* </span> {strings.Status}  &nbsp;  &nbsp;
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
                                                                            </Col></Row>
                                                                            <Row className="row-wrapper">

                                                                                <Col lg={4}>
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="select"><span className="text-danger">* </span> {strings.FirstName}</Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            id="firstName"
                                                                                            name="firstName"
                                                                                            value={props.values.firstName}
                                                                                            placeholder={strings.Enter + strings.FirstName}
                                                                                                onChange={(option) => {
                                                                                                    if (
                                                                                                        option.target.value === '' ||
                                                                                                        this.regExAlpha.test(
                                                                                                            option.target.value,
                                                                                                        )
                                                                                                    ) {

                                                                                                        let option1 = upperFirst(option.target.value)
                                                                                                        props.handleChange('firstName')(option1);
                                                                                                    }
                                                                                            }}
                                                                                            className={props.errors.firstName && props.touched.firstName ? "is-invalid" : ""}
                                                                                        />
                                                                                        {props.errors.firstName && props.touched.firstName && (
                                                                                            <div className="invalid-feedback">{props.errors.firstName}</div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>
                                                                                <Col lg={4}>
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="select"> {strings.MiddleName}</Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            id="middleName"
                                                                                            name="middleName"
                                                                                            value={props.values.middleName}
                                                                                            placeholder={strings.Enter + strings.MiddleName}
                                                                                                onChange={(option) => {
                                                                                                    if (
                                                                                                        option.target.value === '' ||
                                                                                                        this.regExAlpha.test(
                                                                                                            option.target.value,
                                                                                                        )
                                                                                                    ) {

                                                                                                        let option1 = upperFirst(option.target.value)
                                                                                                        props.handleChange('middleName')(option1);
                                                                                                    }
                                                                                                }}
                                                                                            className={props.errors.middleName && props.touched.middleName ? "is-invalid" : ""}
                                                                                        />
                                                                                        {props.errors.middleName && props.touched.firstName && (
                                                                                            <div className="invalid-feedback">{props.errors.middleName}</div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>
                                                                                <Col lg={4}>
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="select"><span className="text-danger">* </span>{strings.LastName}</Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            id="lastName"
                                                                                            name="lastName"
                                                                                            value={props.values.lastName}
                                                                                            placeholder={strings.Enter + strings.LastName}
                                                                                                onChange={(option) => {
                                                                                                    if (
                                                                                                        option.target.value === '' ||
                                                                                                        this.regExAlpha.test(
                                                                                                            option.target.value,
                                                                                                        )
                                                                                                    ) {

                                                                                                        let option1 = upperFirst(option.target.value)
                                                                                                        props.handleChange('lastName')(option1);
                                                                                                    }
                                                                                                }}
                                                                                            className={props.errors.lastName && props.touched.lastName ? "is-invalid" : ""}
                                                                                        />
                                                                                        {props.errors.lastName && props.touched.lastName && (
                                                                                            <div className="invalid-feedback">{props.errors.lastName}</div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>

                                                                            </Row>
                                                                            <Row>
                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="select"><span className="text-danger">* </span>{strings.Email}</Label>
                                                                                        <Input
                                                                                            type="email"
                                                                                            id="email"
                                                                                            name="email"
                                                                                            value={props.values.email}
                                                                                            placeholder={strings.Enter + strings.EmailAddres}
                                                                                            onChange={(option) => {
                                                                                                props.handleChange('email')(option);
                                                                                                this.emailvalidationCheck(option.target.value);
                                                                                            }}
                                                                                            className={props.errors.email && props.touched.email ? "is-invalid" : ""}
                                                                                        />
                                                                                        {props.errors.email && props.touched.email && (
                                                                                            <div className="invalid-feedback">{props.errors.email}</div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>
                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="mobileNumber">
                                                                                            <span className="text-danger">* </span>  {strings.MobileNumber}
                                                                                        </Label>
                                                                                        <div className={
                                                                                            props.errors.mobileNumber &&
                                                                                                props.touched.mobileNumber
                                                                                                ? ' is-invalidMobile '
                                                                                                : ''
                                                                                        }>
                                                                                            <PhoneInput
                                                                                                id="mobileNumber"
                                                                                                name="mobileNumber"
                                                                                                country={"ae"}
                                                                                                enableSearch={true}
                                                                                                international
                                                                                                value={props.values.mobileNumber}
                                                                                                placeholder={strings.Enter + strings.MobileNumber}
                                                                                                onBlur={props.handleBlur('mobileNumber')}
                                                                                                onChange={(option) => {
                                                                                                    props.handleChange('mobileNumber')(
                                                                                                        option,
                                                                                                    );
                                                                                                    this.setState({ masterPhoneNumber: option })
                                                                                                    // option.length!==12 ?  this.setState({checkmobileNumberParam:true}) :this.setState({checkmobileNumberParam:false});
                                                                                                }}
                                                                                            // className={
                                                                                            //     props.errors.mobileNumber &&
                                                                                            //         props.touched.mobileNumber
                                                                                            //         ? 'is-invalid'
                                                                                            //         : ''
                                                                                            // }
                                                                                            /></div>
                                                                                        {props.errors.mobileNumber &&
                                                                                            props.touched.mobileNumber && (
                                                                                                    <div style={{ color: "#f86c6b", fontSize: '0.71rem', marginTop: '0.25rem'}}>
                                                                                                    {props.errors.mobileNumber}
                                                                                                </div>
                                                                                            )}

                                                                                    </FormGroup>
                                                                                </Col>
                                                                                <Col md="4">
                                                                                    <FormGroup className="mb-3">
                                                                                        <Label htmlFor="date"><span className="text-danger">* </span>{strings.DateOfBirth}</Label>
                                                                                        <DatePicker
                                                                                            className={`form-control ${props.errors.dob && props.touched.dob ? "is-invalid" : ""}`}
                                                                                            id="dob"
                                                                                            name="dob"
                                                                                            placeholderText={strings.Select + strings.DateOfBirth}
                                                                                            showMonthDropdown
                                                                                            showYearDropdown
                                                                                            maxDate={moment().subtract(18, "years").toDate()}
                                                                                            autoComplete={"off"}
                                                                                            dateFormat="dd-MM-yyyy"
                                                                                            dropdownMode="select"
                                                                                            selected={this.selectedDate(moment(props.values.dob).format('DD-MM-YYYY'))}
                                                                                            value={moment(props.values.dob,'DD-MM-YYYY').toDate()}
                                                                                            onChange={(value) => {
                                                                                                if (value) {
                                                                                                    props.handleChange("dob")(value)
                                                                                                } else {
                                                                                                    props.handleChange("dob")('')

                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                        {props.errors.dob &&
                                                                                            props.touched.dob && (
                                                                                                <div className="invalid-feedback">
                                                                                                    {props.errors.dob.includes("nullable()") ? "DOB is required" : props.errors.dob}
                                                                                                </div>
                                                                                            )}
                                                                                    </FormGroup>
                                                                                </Col>

                                                                            </Row>

                                                                            {this.state.sifEnabled == false && 
                                                                                <Row>
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
                                                                                            disabled
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
                                                                                                {props.errors.dateOfJoining &&
                                                                                                props.touched.dateOfJoining && (
                                                                                                    <div className="invalid-feedback">
                                                                                                    {
                                                                                                        props.errors
                                                                                                        .dateOfJoining
                                                                                                    }
                                                                                                    </div>
                                                                                                )}
                                                                                            </FormGroup>
                                                                                        </Col>

                                                                                        <Col md="4">
                                                                                            <div style={{ display: "flex" }}>
                                                                                                <div style={{ width: "55%" }}>
                                                                                                    <FormGroup>
                                                                                                        <Label htmlFor="employeeDesignationId" className='overflow-hidden text-truncate'><span className="text-danger">* </span>{strings.Designation}</Label>
                                                                                                        <Select
                                                                                                            options={
                                                                                                                designation_dropdown
                                                                                                                    ? selectOptionsFactory.renderOptions(
                                                                                                                        'label',
                                                                                                                        'value',
                                                                                                                        designation_dropdown,
                                                                                                                        'Employee Designation',
                                                                                                                    )
                                                                                                                    : []
                                                                                                            }
                                                                                                            id="employeeDesignationId"
                                                                                                            name="employeeDesignationId"
                                                                                                            placeholder={strings.Designation}
                                                                                                            value={ designation_dropdown
                                                                                                                && selectOptionsFactory.renderOptions(
                                                                                                                    'label',
                                                                                                                    'value',
                                                                                                                    designation_dropdown,
                                                                                                                    'employeeDesignationId',
                                                                                                                ).find(
                                                                                                                    (option) =>
                                                                                                                        option.value ===
                                                                                                                        +props.values.employeeDesignationId.value,
                                                                                                                )}
                                                                                                            // onChange={(value) => {
                                                                                                            //     props.handleChange('employeeDesignationId')(value);
                                                                                                            // }}
                                                                                                            // value={this.state.salaryDesignation}
                                                                                                            onChange={(value) => {
                                                                                                                this.setState({newDesig: false})
                                                                                                                props.handleChange('employeeDesignationId')(value);
                                                                                                                props.handleChange('salaryRoleId')(1);
                                                                                                            }}
                                                                                                            className={`${props.errors.employeeDesignationId && props.touched.employeeDesignationId
                                                                                                                ? 'is-invalid'
                                                                                                                : ''
                                                                                                                }`}
                                                                                                        />
                                                                                                        {props.errors.employeeDesignationId && props.touched.employeeDesignationId && (
                                                                                                            <div className="invalid-feedback">
                                                                                                                {props.errors.employeeDesignationId}
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </FormGroup>
                                                                                                </div>
                                                                                                <div>
                                                                                                    <Label
                                                                                                        htmlFor="employeeDesignationId"
                                                                                                        style={{ display: 'block' }}
                                                                                                    >
                                                                                                    </Label>
                                                                                                    <Button
                                                                                                        type="button"
                                                                                                        color="primary"
                                                                                                        className="btn-square mt-4 pull-right overflow-hidden text-truncate"
                                                                                                        onClick={(e, props) => {
                                                                                                            this.openDesignationModal(props);
                                                                                                        }}
                                                                                                    >
                                                                                                        <i className="fa fa-plus"></i> {strings.AddDesignation}
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </Col>
                                                                                </Row>
                                                                            }

                                                                            {this.state.sifEnabled == false &&
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
                                                                            }

                                                                            {this.state.otherDetails == true && <>
                                                                            <Row>
                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="gender">
                                                                                            {this.state.sifEnabled == true && (<span className="text-danger">*{" "}</span>)}
                                                                                        {strings.Gender}</Label>
                                                                                        <Select

                                                                                            options={
                                                                                                this.gender
                                                                                                    ? selectOptionsFactory.renderOptions(
                                                                                                        'label',
                                                                                                        'value',
                                                                                                        this.gender,
                                                                                                        'Gender',
                                                                                                    )
                                                                                                    : []
                                                                                            }
                                                                                            id="gender"
                                                                                            name="gender"
                                                                                            placeholder={strings.Select + strings.Gender}
                                                                                            value={this.gender &&
                                                                                                this.gender.find(
                                                                                                    (option) =>
                                                                                                        option.value === props.values.gender,
                                                                                                )
                                                                                            }
                                                                                            onChange={(option) => {
                                                                                                props.handleChange('gender')(option.value);

                                                                                            }}
                                                                                            className={`${props.errors.gender && props.touched.gender
                                                                                                ? 'is-invalid'
                                                                                                : ''
                                                                                                }`}
                                                                                        />
                                                                                        {props.errors.gender && props.touched.gender && (
                                                                                            <div className="invalid-feedback">
                                                                                                {props.errors.gender}
                                                                                            </div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="maritalStatus">{this.state.sifEnabled == true && (<span className="text-danger">*{" "}</span>)}{strings.maritalStatus}</Label>
                                                                                        <Select

                                                                                            options={
                                                                                                this.maritalStatus
                                                                                                    ? selectOptionsFactory.renderOptions(
                                                                                                        'label',
                                                                                                        'value',
                                                                                                        this.maritalStatus,
                                                                                                        'Marital Status',
                                                                                                    )
                                                                                                    : []
                                                                                            }
                                                                                            id="maritalStatus"
                                                                                            name="maritalStatus"
                                                                                            placeholder={strings.Select + strings.maritalStatus}
                                                                                            value={this.maritalStatus &&
                                                                                                this.maritalStatus.find(
                                                                                                    (option) =>
                                                                                                        option.value === props.values.maritalStatus,
                                                                                                )
                                                                                            }
                                                                                            onChange={(option) => {
                                                                                                props.handleChange('maritalStatus')(option);
                                                                                                this.setState({ maritalStatus: option.value })
                                                                                            }}
                                                                                            className={`${props.errors.maritalStatus && props.touched.maritalStatus
                                                                                                ? 'is-invalid'
                                                                                                : ''
                                                                                                }`}
                                                                                        />
                                                                                        {props.errors.maritalStatus && props.touched.maritalStatus && (
                                                                                            <div className="invalid-feedback">
                                                                                                {props.errors.maritalStatus}
                                                                                            </div>
                                                                                        )}
                                                                                    </FormGroup>
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
                                                                                    placeholder={strings.Select + strings.BloodGroup}
                                                                                    value={this.bloodGroup &&
                                                                                        this.bloodGroup.find(
                                                                                            (option) =>
                                                                                                option.value === props.values.bloodGroup,
                                                                                        )
                                                                                    }
                                                                                    onChange={(option) => {
                                                                                         
                                                                                        props.handleChange('bloodGroup')(
                                                                                            option.value,
                                                                                        );

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
                                                                            {this.state.sifEnabled == true &&
                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="parentId"> {strings.ReportsTo}</Label>
                                                                                        <Select

                                                                                            options={
                                                                                                employee_list_dropdown.data
                                                                                                    ? selectOptionsFactory.renderOptions(
                                                                                                        'label',
                                                                                                        'value',
                                                                                                        employee_list_dropdown.data,
                                                                                                        'Employee',
                                                                                                    )
                                                                                                    : []
                                                                                            }
                                                                                            id="parentId"
                                                                                            name="parentId"
                                                                                            placeholder={strings.Select + strings.SuperiorEmployeeName}
                                                                                            value={employee_list_dropdown.data
                                                                                                && selectOptionsFactory.renderOptions(
                                                                                                    'label',
                                                                                                    'value',
                                                                                                    employee_list_dropdown.data,
                                                                                                    'Employee',
                                                                                                )
                                                                                                    .find(
                                                                                                        (option) =>
                                                                                                            option.value ===
                                                                                                            +props.values.parentId,
                                                                                                    )}
                                                                                            onChange={(value) => {
                                                                                                props.handleChange('parentId')(value);

                                                                                            }}
                                                                                            className={`${props.errors.parentId && props.touched.parentId
                                                                                                ? 'is-invalid'
                                                                                                : ''
                                                                                                }`}
                                                                                        />
                                                                                        {props.errors.parentId && props.touched.parentId && (
                                                                                            <div className="invalid-feedback">
                                                                                                {props.errors.parentId}
                                                                                            </div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>
                                                                            }

                                                                            {this.state.sifEnabled == true && <>
                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="employeeDesignationId"><span className="text-danger">* </span>{strings.Designation}</Label>
                                                                                        <Select

                                                                                            options={
                                                                                                designation_dropdown
                                                                                                    ? selectOptionsFactory.renderOptions(
                                                                                                        'label',
                                                                                                        'value',
                                                                                                        designation_dropdown,
                                                                                                        'Employee Designation',
                                                                                                    )
                                                                                                    : []
                                                                                            }
                                                                                            id="employeeDesignationId"
                                                                                            name="employeeDesignationId"
                                                                                            placeholder={strings.Designation}
                                                                                            value={ this.state.newDesig === true ? (designation_dropdown
                                                                                                && selectOptionsFactory.renderOptions(
                                                                                                    'label',
                                                                                                    'value',
                                                                                                    designation_dropdown,
                                                                                                    'employeeDesignationId',
                                                                                                ).find(
                                                                                                    (option) =>
                                                                                                        parseFloat(option.value) ===
                                                                                                        this.state.initValue.employeeDesignationId,
                                                                                                )) : designation_dropdown
                                                                                                && selectOptionsFactory.renderOptions(
                                                                                                    'label',
                                                                                                    'value',
                                                                                                    designation_dropdown,
                                                                                                    'employeeDesignationId',
                                                                                                ).find(
                                                                                                    (option) =>
                                                                                                        option.value ===
                                                                                                        +props.values.employeeDesignationId,
                                                                                                )}
                                                                                            // onChange={(value) => {
                                                                                            //     props.handleChange('employeeDesignationId')(value);
                                                                                            // }}
                                                                                            // value={this.state.salaryDesignation}
                                                                                            onChange={(value) => {
                                                                                                this.setState({newDesig: false})
                                                                                                props.handleChange('employeeDesignationId')(value);
                                                                                                props.handleChange('salaryRoleId')(1);
                                                                                            }}
                                                                                            className={`${props.errors.employeeDesignationId && props.touched.employeeDesignationId
                                                                                                ? 'is-invalid'
                                                                                                : ''
                                                                                                }`}
                                                                                        />
                                                                                        {props.errors.employeeDesignationId && props.touched.employeeDesignationId && (
                                                                                            <div className="invalid-feedback">
                                                                                                {props.errors.employeeDesignationId}
                                                                                            </div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>
                                                                                <Col>
                                                                            <Label
                                                                                htmlFor="employeeDesignationId"
                                                                                style={{ display: 'block' }}
                                                                            >

                                                                            </Label>
                                                                            <Button
                                                                                type="button"
                                                                                color="primary"
                                                                                className="btn-square mr-3 mb-3 mt-4"
                                                                                onClick={(e, props) => {
                                                                                    this.openDesignationModal(props);
                                                                                }}
                                                                            >
                                                                                <i className="fa fa-plus"></i> {strings.AddDesignation}
															                </Button>
                                                                            </Col>
                                                                            </>}
                                                                            </Row>

                                                                            {this.state.sifEnabled == false &&
                                                                                <Row>
                                                                                    <Col md="4">
                                                                                        <FormGroup>
                                                                                            <Label htmlFor="parentId"> {strings.ReportsTo}</Label>
                                                                                            <Select

                                                                                                options={
                                                                                                    employee_list_dropdown.data
                                                                                                        ? selectOptionsFactory.renderOptions(
                                                                                                            'label',
                                                                                                            'value',
                                                                                                            employee_list_dropdown.data,
                                                                                                            'Employee',
                                                                                                        )
                                                                                                        : []
                                                                                                }
                                                                                                id="parentId"
                                                                                                name="parentId"
                                                                                                placeholder={strings.Select + strings.SuperiorEmployeeName}
                                                                                                value={employee_list_dropdown.data
                                                                                                    && selectOptionsFactory.renderOptions(
                                                                                                        'label',
                                                                                                        'value',
                                                                                                        employee_list_dropdown.data,
                                                                                                        'Employee',
                                                                                                    )
                                                                                                        .find(
                                                                                                            (option) =>
                                                                                                                option.value ===
                                                                                                                +props.values.parentId,
                                                                                                        )}
                                                                                                onChange={(value) => {
                                                                                                    props.handleChange('parentId')(value);

                                                                                                }}
                                                                                                className={`${props.errors.parentId && props.touched.parentId
                                                                                                    ? 'is-invalid'
                                                                                                    : ''
                                                                                                    }`}
                                                                                            />
                                                                                            {props.errors.parentId && props.touched.parentId && (
                                                                                                <div className="invalid-feedback">
                                                                                                    {props.errors.parentId}
                                                                                                </div>
                                                                                            )}
                                                                                        </FormGroup>
                                                                                    </Col>
                                                                                </Row>
                                                                            }
                                                                            <Row>
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
                                                                                    placeholder={strings.Select + strings.SalaryRole}
                                                                                    value={
                                                                                        salary_role_dropdown.data
                                                                                        && selectOptionsFactory.renderOptions(
                                                                                            'label',
                                                                                            'value',
                                                                                            salary_role_dropdown.data,
                                                                                            'Employee Salary Role',
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
                                                                        </Col>
                                                                        */}
                                                                        </Row>
                                                                            <Row className="row-wrapper">
                                                                                <Col md="8">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="gender">{this.state.sifEnabled == true && (<span className="text-danger">*{" "}</span>)}{strings.PresentAddress} </Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            maxLength="100"
                                                                                            id="presentAddress"
                                                                                            name="presentAddress"
                                                                                            value={props.values.presentAddress}
                                                                                            placeholder={strings.Enter + strings.PresentAddress}
                                                                                            onChange={(option) => {
                                                                                                if (
                                                                                                    option.target.value === '' ||
                                                                                                    this.regExAddress.test(
                                                                                                        option.target.value,
                                                                                                    )
                                                                                                ) {
                                                                                                    props.handleChange('presentAddress')(option.target.value);
                                                                                                }
                                                                                            }}
                                                                                            className={props.errors.presentAddress && props.touched.presentAddress ? "is-invalid" : ""}
                                                                                        />
                                                                                        {props.errors.presentAddress && props.touched.presentAddress && (
                                                                                            <div className="invalid-feedback">{props.errors.presentAddress}</div>
                                                                                        )}
                                                                                    </FormGroup>

                                                                                </Col>

                                                                                {props.values.countryId === 229 || props.values.countryId.value === 229 ?
                                                                                    <Col md="4" >
                                                                                        <FormGroup>
                                                                                            {/* <Label htmlFor="select">{strings.POBoxNumber}</Label> */}
                                                                                            <Label htmlFor="POBoxNumber">
                                                                                                <span className="text-danger"></span>{strings.POBoxNumber}
                                                                                            </Label>
                                                                                            <Input
                                                                                                type="text"
                                                                                                minLength="3"
                                                                                                maxLength="6"
                                                                                                id="poBoxNumber"
                                                                                                name="poBoxNumber"
                                                                                                autoComplete="Off"
                                                                                                placeholder={strings.Enter + strings.POBoxNumber}
                                                                                                onChange={(option) => {
                                                                                                    if (
                                                                                                        option.target.value === '' ||
                                                                                                        this.regEx.test(option.target.value)
                                                                                                    ) {
                                                                                                        if (option.target.value.length < 3)
                                                                                                            this.setState({ showpoBoxNumberErrorMsg: true })
                                                                                                        else
                                                                                                            this.setState({ showpoBoxNumberErrorMsg: false })

                                                                                                        props.handleChange('poBoxNumber')(option);
                                                                                                        props.handleChange('PostZipCode')(option);
                                                                                                    }
                                                                                                }}
                                                                                                value={props.values.PostZipCode}
                                                                                                className={
                                                                                                    props.errors.poBoxNumber &&
                                                                                                        props.touched.poBoxNumber
                                                                                                        ? 'is-invalid'
                                                                                                        : ''
                                                                                                }
                                                                                            />
                                                                                            {props.errors.poBoxNumber &&
                                                                                                props.touched.poBoxNumber && (
                                                                                                    <div className="invalid-feedback">
                                                                                                        {props.errors.poBoxNumber}
                                                                                                    </div>
                                                                                                )}
                                                                                        </FormGroup>
                                                                                    </Col>

                                                                                    :
                                                                                    <Col md="4" ><FormGroup>
                                                                                        <Label htmlFor="postZipCode"><span className="text-danger"> </span>
                                                                                            {strings.PostZipCode}
                                                                                        </Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            maxLength="6"
                                                                                            id="PostZipCode"
                                                                                            name="PostZipCode"
                                                                                            autoComplete="Off"
                                                                                            placeholder={strings.Enter + strings.PostZipCode}
                                                                                            onChange={(option) => {
                                                                                                if (
                                                                                                    option.target.value === '' ||
                                                                                                    this.regEx.test(option.target.value)
                                                                                                ) {
                                                                                                    props.handleChange('PostZipCode')(
                                                                                                        option,
                                                                                                    );
                                                                                                }

                                                                                            }}
                                                                                            value={props.values.PostZipCode}
                                                                                            className={
                                                                                                props.errors.PostZipCode &&
                                                                                                    props.touched.PostZipCode
                                                                                                    ? 'is-invalid'
                                                                                                    : ''
                                                                                            }
                                                                                        />
                                                                                        {props.errors.PostZipCode &&
                                                                                            props.touched.PostZipCode && (
                                                                                                <div className="invalid-feedback">
                                                                                                    {props.errors.PostZipCode}
                                                                                                </div>
                                                                                            )}
                                                                                    </FormGroup>
                                                                                    </Col>}

                                                                            </Row>

                                                                            <Row className="row-wrapper">
                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="countryId">{this.state.sifEnabled == true && (<span className="text-danger">*{" "}</span>)}{strings.Country}</Label>
                                                                                        <Select
                                                                                            //  isDisabled
                                                                                            options={
                                                                                                country_list
                                                                                                    ? selectOptionsFactory.renderOptions(
                                                                                                        'countryName',
                                                                                                        'countryCode',
                                                                                                        country_list,
                                                                                                        'Country',
                                                                                                    )
                                                                                                    : []
                                                                                            }
                                                                                            value={country_list &&
                                                                                                selectOptionsFactory
                                                                                                    .renderOptions(
                                                                                                        'countryName',
                                                                                                        'countryCode',
                                                                                                        country_list,
                                                                                                        'Country',
                                                                                                    )
                                                                                                    .find(
                                                                                                        (option) =>
                                                                                                            option.value ===
                                                                                                            +props.values.countryId,
                                                                                                    )}
                                                                                            onChange={(option) => {
                                                                                                if (option && option.value) {
                                                                                                    props.handleChange('countryId')(option);
                                                                                                    props.handleChange('PostZipCode')("");
                                                                                                    this.getStateList(option.value);
                                                                                                } else {
                                                                                                    props.handleChange('countryId')('');
                                                                                                    this.getStateList(option.value);
                                                                                                }
                                                                                                props.handleChange('stateId')('');

                                                                                            }}
                                                                                            placeholder={strings.Select + strings.Country}
                                                                                            id="countryId"
                                                                                            name="countryId"
                                                                                            className={
                                                                                                props.errors.countryId &&
                                                                                                    props.touched.countryId
                                                                                                    ? 'is-invalid'
                                                                                                    : ''
                                                                                            }
                                                                                        />
                                                                                        {props.errors.countryId &&
                                                                                            props.touched.countryId && (
                                                                                                <div className="invalid-feedback">
                                                                                                    {props.errors.countryId}
                                                                                                </div>
                                                                                            )}
                                                                                    </FormGroup>
                                                                                </Col>
                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="stateId">{this.state.sifEnabled == true && (<span className="text-danger">*{" "}</span>)}
                                                                                            {props.values.countryId == 229 || props.values.countryId.value === 229 ? strings.Emirate : strings.StateRegion}</Label>
                                                                                        <Select

                                                                                            options={
                                                                                                state_list
                                                                                                    ? selectOptionsFactory.renderOptions(
                                                                                                        'label',
                                                                                                        'value',
                                                                                                        state_list,
                                                                                                        props.values.countryId.value === 229 ? strings.Emirate : strings.StateRegion,
                                                                                                    )
                                                                                                    : []
                                                                                            }
                                                                                            value={state_list &&
                                                                                                selectOptionsFactory
                                                                                                    .renderOptions(
                                                                                                        'label',
                                                                                                        'value',
                                                                                                        state_list,
                                                                                                        props.values.countryId.value === 229 ? strings.Emirate : strings.StateRegion,
                                                                                                    )
                                                                                                    .find(
                                                                                                        (option) =>
                                                                                                            option.value ===
                                                                                                            props.values.stateId,
                                                                                                    )}
                                                                                            onChange={(option) => {
                                                                                                if (option && option.value) {
                                                                                                    props.handleChange('stateId')(option);
                                                                                                } else {
                                                                                                    props.handleChange('stateId')('');
                                                                                                }
                                                                                            }}
                                                                                            placeholder={strings.Select + props.values.countryId === 229 || props.values.countryId.value === 229 ? strings.Emirate : strings.StateRegion}
                                                                                            id="stateId"
                                                                                            name="stateId"
                                                                                            className={
                                                                                                props.errors.stateId &&
                                                                                                    props.touched.stateId
                                                                                                    ? 'is-invalid'
                                                                                                    : ''
                                                                                            }
                                                                                        />
                                                                                        {props.errors.stateId &&
                                                                                            props.touched.stateId && (
                                                                                                <div className="invalid-feedback">
                                                                                                    {props.errors.stateId}
                                                                                                </div>
                                                                                            )}
                                                                                    </FormGroup>
                                                                                </Col>




                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="state"><span className="text-danger"></span>{strings.City} </Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            maxLength="100"
                                                                                            id="city"
                                                                                            name="city"
                                                                                            value={props.values.city}
                                                                                            placeholder={strings.Location}

                                                                                            onChange={(option) => {
                                                                                                if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('city')(option) }
                                                                                            }}
                                                                                            className={props.errors.city && props.touched.city ? "is-invalid" : ""}
                                                                                        />
                                                                                        {props.errors.city && props.touched.city && (
                                                                                            <div className="invalid-feedback">{props.errors.city}</div>
                                                                                        )}
                                                                                    </FormGroup>


                                                                                </Col>
                                                                            </Row>

                                                                            <hr></hr>
                                                                            <h4 className="mb-3 mt-3">{strings.EducationDetails}</h4>
                                                                            <Row>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="university"> {strings.University} </Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            maxLength="100"
                                                                                            id="university"
                                                                                            name="university"
                                                                                            placeholder={strings.Enter + strings.University}
                                                                                            onChange={(value) => { props.handleChange("university")(value) }}
                                                                                            value={props.values.university}
                                                                                            className={
                                                                                                props.errors.university && props.touched.university
                                                                                                    ? "is-invalid"
                                                                                                    : ""
                                                                                            }
                                                                                        />
                                                                                        {props.university && props.touched.university && (
                                                                                            <div className="invalid-feedback">{props.errors.university}</div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="qualification"> {strings.qualification} </Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            maxLength="50"
                                                                                            id="qualification"
                                                                                            name="qualification"
                                                                                            placeholder={strings.Enter + strings.qualification}
                                                                                            onChange={(value) => { props.handleChange("qualification")(value) }}
                                                                                            value={props.values.qualification}
                                                                                            className={
                                                                                                props.errors.qualification && props.touched.qualification
                                                                                                    ? "is-invalid"
                                                                                                    : ""
                                                                                            }
                                                                                        />
                                                                                        {props.qualification && props.touched.qualification && (
                                                                                            <div className="invalid-feedback">{props.errors.qualification}</div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="qualificationYearOfCompletionDate"> {strings.qualificationYearOfCompletionDate} </Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            maxLength="10"
                                                                                            id="qualificationYearOfCompletionDate"
                                                                                            name="qualificationYearOfCompletionDate"
                                                                                            placeholder={strings.Enter + strings.qualificationYearOfCompletionDate}
                                                                                            onChange={(value) => { props.handleChange("qualificationYearOfCompletionDate")(value) }}
                                                                                            value={props.values.qualificationYearOfCompletionDate}
                                                                                            className={
                                                                                                props.errors.qualificationYearOfCompletionDate && props.touched.qualificationYearOfCompletionDate
                                                                                                    ? "is-invalid"
                                                                                                    : ""
                                                                                            }
                                                                                        />
                                                                                        {props.qualificationYearOfCompletionDate && props.touched.qualificationYearOfCompletionDate && (
                                                                                            <div className="invalid-feedback">{props.errors.qualificationYearOfCompletionDate}</div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>
                                                                            </Row>


                                                                            <hr></hr>
                                                                            <h4 className="mb-3 mt-3">{strings.EmergencyContact}</h4>
                                                                            <Row>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="emergencyContactName1">{this.state.sifEnabled == true && (<span className="text-danger">*{" "}</span>)}{strings.ContactName1}</Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            maxLength="26"
                                                                                            id="emergencyContactName1"
                                                                                            name="emergencyContactName1"
                                                                                            value={props.values.emergencyContactName1}
                                                                                            placeholder={strings.Enter + strings.ContactName1}

                                                                                            onChange={(option) => {
                                                                                                if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('emergencyContactName1')(option) }
                                                                                            }}
                                                                                            className={props.errors.emergencyContactName1 && props.touched.emergencyContactName1 ? "is-invalid" : ""}
                                                                                        />
                                                                                        {props.errors.emergencyContactName1 && props.touched.emergencyContactName1 && (
                                                                                            <div className="invalid-feedback">{props.errors.emergencyContactName1}</div>
                                                                                        )}
                                                                                    </FormGroup>

                                                                                </Col>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="emergencyContactNumber1">{this.state.sifEnabled == true && (<span className="text-danger">*{" "}</span>)}{strings.ContactNumber1} </Label>
                                                                                        <div className={
                                                                                            props.errors.emergencyContactNumber1 &&
                                                                                                props.touched.emergencyContactNumber1
                                                                                                ? ' is-invalidMobile '
                                                                                                : ''
                                                                                        }>
                                                                                            <PhoneInput
                                                                                                id="emergencyContactNumber1"
                                                                                                name="emergencyContactNumber1"
                                                                                                country={"ae"}
                                                                                                enableSearch={true}
                                                                                                international
                                                                                                value={props.values.emergencyContactNumber1}
                                                                                                placeholder={strings.Enter + strings.ContactNumber1}
                                                                                                onBlur={props.handleBlur('emergencyContactNumber1')}
                                                                                                onChange={(option) => {
                                                                                                    props.handleChange('emergencyContactNumber1')(
                                                                                                        option,
                                                                                                    );
                                                                                                    // option.length!==12 ?  this.setState({checkmobileNumberParam1:true}) :this.setState({checkmobileNumberParam1:false});
                                                                                                }}
                                                                                                className={
                                                                                                    props.errors.emergencyContactNumber1 &&
                                                                                                        props.touched.emergencyContactNumber1
                                                                                                        ? 'text-danger'
                                                                                                        : ''
                                                                                                }
                                                                                            /></div>
                                                                                        {props.errors.emergencyContactNumber1 && props.touched.emergencyContactNumber1 && (
                                                                                            <div className="text-danger">{props.errors.emergencyContactNumber1}</div>
                                                                                        )}

                                                                                    </FormGroup>
                                                                                </Col>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="emergencyContactRelationship1">{this.state.sifEnabled == true && (<span className="text-danger">*{" "}</span>)}{strings.Relationship1} </Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            maxLength="26"
                                                                                            id="emergencyContactRelationship1"
                                                                                            name="emergencyContactRelationship1"
                                                                                            value={props.values.emergencyContactRelationship1}
                                                                                            placeholder={strings.Enter + strings.Relationship1}

                                                                                            onChange={(option) => {
                                                                                                if (option.target.value === '' || this.regExAlpha.test(option.target.value)) { props.handleChange('emergencyContactRelationship1')(option) }
                                                                                            }}
                                                                                            className={props.errors.emergencyContactRelationship1 && props.touched.emergencyContactRelationship1 ? "is-invalid" : ""}
                                                                                        />
                                                                                        {props.errors.emergencyContactRelationship1 && props.touched.emergencyContactRelationship1 && (
                                                                                            <div className="invalid-feedback">{props.errors.emergencyContactRelationship1}</div>
                                                                                        )}
                                                                                    </FormGroup>

                                                                                </Col>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="emergencyContactName2"> {strings.ContactName2} </Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            id="emergencyContactName2"
                                                                                            name="emergencyContactName2"
                                                                                            placeholder={strings.Enter + strings.ContactName2}
                                                                                            onChange={(value) => { props.handleChange("emergencyContactName2")(value) }}
                                                                                            value={props.values.emergencyContactName2}
                                                                                            className={
                                                                                                props.errors.emergencyContactName2 && props.touched.emergencyContactName2
                                                                                                    ? "is-invalid"
                                                                                                    : ""
                                                                                            }
                                                                                        />
                                                                                        {props.emergencyContactName2 && props.touched.emergencyContactName2 && (
                                                                                            <div className="invalid-feedback">{props.errors.emergencyContactName2}</div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="emergencyContactNumber2"> {strings.ContactNumber2} </Label>
                                                                                        <PhoneInput
                                                                                            id="emergencyContactNumber2"
                                                                                            name="emergencyContactNumber2"
                                                                                            country={"ae"}
                                                                                            enableSearch={true}
                                                                                            international
                                                                                            value={props.values.emergencyContactNumber2}
                                                                                            placeholder={strings.Enter + strings.ContactNumber2}
                                                                                            onBlur={props.handleBlur('emergencyContactNumber2')}
                                                                                            onChange={(option) => {
                                                                                                props.handleChange('emergencyContactNumber2')(
                                                                                                    option,
                                                                                                );
                                                                                                // option.length!==12 ?  this.setState({checkmobileNumberParam2:true}) :this.setState({checkmobileNumberParam2:false});
                                                                                            }}
                                                                                            className={
                                                                                                props.errors.emergencyContactNumber2 &&
                                                                                                    props.touched.emergencyContactNumber2
                                                                                                    ? 'text-danger'
                                                                                                    : ''
                                                                                            }
                                                                                        />
                                                                                        {props.errors.emergencyContactNumber2 && props.touched.emergencyContactNumber2 && (
                                                                                            <div className="text-danger">{props.errors.emergencyContactNumber2}</div>
                                                                                        )}

                                                                                    </FormGroup>
                                                                                    {/* <PhoneInput
                                                                                                        id="emergencyContactNumber2"
                                                                                                        name="emergencyContactNumber2"
                                                                                                        country={"ae"}
                                                                                                        enableSearch={true}
                                                                                                        international
                                                                                                        value={props.values.emergencyContactNumber2}
                                                                                                        placeholder={strings.Enter+strings.ContactNumber2}
                                                                                                        onBlur={props.handleBlur('emergencyContactNumber2')}
                                                                                                        onChange={(option) => {
                                                                                                            props.handleChange('emergencyContactNumber2')(
                                                                                                                option,
                                                                                                            );
                                                                                                        }}
                                                                                                        className={
                                                                                                            props.errors.emergencyContactNumber2 &&
                                                                                                                props.touched.emergencyContactNumber2
                                                                                                                ? 'is-invalid'
                                                                                                                : ''
                                                                                                        }
                                                                                                    />
                                                                                                     {props.errors.emergencyContactNumber2 && props.touched.memergencyContactNumber2 && (
                                                                                                        <div className="invalid-feedback">{props.errors.emergencyContactNumber2}</div>
                                                                                                    )}
                                                                                                   
                                                                                                </FormGroup> */}
                                                                                </Col>

                                                                                <Col md="4">
                                                                                    <FormGroup>
                                                                                        <Label htmlFor="emergencyContactRelationship2"> {strings.Relationship2} </Label>
                                                                                        <Input
                                                                                            type="text"
                                                                                            id="emergencyContactRelationship2"
                                                                                            name="emergencyContactRelationship2"
                                                                                            placeholder={strings.Enter + strings.Relationship2}
                                                                                            // placeholder={strings.Enter+strings.PinCode}
                                                                                            onChange={(value) => { props.handleChange("emergencyContactRelationship2")(value) }}
                                                                                            value={props.values.emergencyContactRelationship2}
                                                                                            className={
                                                                                                props.errors.emergencyContactRelationship2 && props.touched.emergencyContactRelationship2
                                                                                                    ? "is-invalid"
                                                                                                    : ""
                                                                                            }
                                                                                        />
                                                                                        {props.emergencyContactRelationship2 && props.touched.emergencyContactRelationship2 && (
                                                                                            <div className="invalid-feedback">{props.errors.qemergencyContactRelationship2}</div>
                                                                                        )}
                                                                                    </FormGroup>
                                                                                </Col>

                                                                            </Row>
                                                                            </>}
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className='pull-right'>
                                                                        <FormGroup className="text-right">
                                                                            <Button
                                                                                type="submit"
                                                                                color="primary"
                                                                                className="btn-square mr-3"
                                                                                disabled={this.state.disabled}
                                                                                onClick={() => {
                                                                                    //	added validation popup	msg
                                                                                    props.handleBlur();
                                                                                    if (props.errors && Object.keys(props.errors).length != 0) {
                                                                                        this.props.commonActions.fillManDatoryDetails();
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <i className="fa fa-dot-circle-o"></i>{' '}
                                                                                {this.state.disabled
                                                                                    ? 'Updating...'
                                                                                    : strings.Update}
                                                                            </Button>
                                                                            <Button
                                                                                color="secondary"
                                                                                className="btn-square"
                                                                                onClick={() => {
                                                                                    this.props.history.push('/admin/master/employee/viewEmployee',
                                                                                    { id: this.props.location.state.id })
                                                                                    // this.props.history.push(
                                                                                    //     '/admin/master/employee/viewEmployee',
                                                                                    // );
                                                                                }}
                                                                            >
                                                                                <i className="fa fa-ban"></i> {strings.Cancel}
                                                                            </Button>
                                                                        </FormGroup>
                                                                    </Row>
                                                                </Form>
                                                            )}
                                                        </Formik>
                                                    </Col>
                                                </Row>
                                            )}
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
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
                        createDesignation={this.props.createPayrollEmployeeActions.createEmployeeDesignation}
                        designationType_list={this.props.designationType_list}
                    // currency_list={this.props.currency_convert_list}
                    // currency={this.state.currency}
                    // country_list={this.props.country_list}
                    // getStateList={this.props.customerInvoiceActions.getStateList}
                    />
                    {this.state.disableLeavePage ? "" : <LeavePage />}
                </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateEmployeePersonal)
