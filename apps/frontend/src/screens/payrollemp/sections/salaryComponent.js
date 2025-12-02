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
    Table,
} from 'reactstrap'
import { Loader, Currency } from 'components'
import Select from 'react-select'
import { CommonActions } from 'services/global'
import 'react-toastify/dist/ReactToastify.css'
import * as DetailSalaryComponentAction from 'screens/payrollemp/screens/update_salary_component/actions'
import * as CreatePayrollEmployeeActions from 'screens/payrollemp/screens/create/actions'
import { SalaryComponentDeduction, SalaryComponentFixed, SalaryComponentVariable } from 'screens/payrollemp/sections';
import { Formik, Field } from 'formik';
import * as Yup from "yup";
import { selectOptionsFactory } from 'utils';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
    return ({
        designation_dropdown: state.payrollEmployee.designation_dropdown,
        employee_list_dropdown: state.payrollEmployee.employee_list_dropdown,
        state_list: state.payrollEmployee.state_list,
        country_list: state.payrollEmployee.country_list,
        salary_component_fixed_dropdown: state.payrollEmployee.salary_component_fixed_dropdown.data,
        salary_component_varaible_dropdown: state.payrollEmployee.salary_component_varaible_dropdown,
        salary_component_deduction_dropdown: state.payrollEmployee.salary_component_deduction_dropdown.data,
    })
}
const mapDispatchToProps = (dispatch) => {
    return ({
        commonActions: bindActionCreators(CommonActions, dispatch),
        detailSalaryComponentAction: bindActionCreators(DetailSalaryComponentAction, dispatch),
        createPayrollEmployeeActions: bindActionCreators(CreatePayrollEmployeeActions, dispatch),
    })
}

let strings = new LocalizedStrings(data);

class SalaryComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window['localStorage'].getItem('language'),
            initValue: {
                totalYearlyDeductions: 0,
                totalNetPayMontly: 0,
                totalNetPayYearly: 0,
                totalMonthlyEarnings: 0,
                totalYearlyEarnings: 0,
                totalMonthlyDeductions: 0,
                CTC: '',
                current_employee_id: this.props.employeeId,
                ctcTypeOption: this.props.ctcTypeOption ? this.props.ctcTypeOption : { label: "MONTHLY", value: 2 },
                ctcType: this.props.ctcTypeOption ? this.props.ctcTypeOption.label : "MONTHLY",

                Deduction: [
                    {
                        description: "",
                        flatAmount: "",
                        formula: "",
                        id: "",
                        monthlyAmount: "",
                        yearlyAmount: "",
                    },
                ],
                Fixed: [
                    {
                        description: "",
                        flatAmount: "",
                        formula: "",
                        id: "",
                        monthlyAmount: "",
                        yearlyAmount: "",
                    },
                ],
            },
            loading: true,
            dialog: null,
            openSalaryComponentFixed: false,
            openSalaryComponentDeduction: false,
            loadingMsg: "Loading....",
            disableLeavePage: false,
            errorMsg: false,
            ctcTypeList: [
                { label: "MONTHLY", value: 2 },
                { label: "ANNUALLY", value: 1 },
            ],
            componentSelected: [],
        }
        this.componentJustLoaded = true;

        this.regEx = /^[0-9\d]+$/;
        this.regExBoth = /[a-zA-Z0-9]+$/;
        this.regExAlpha = /^[a-zA-Z ]+$/;
        this.regDec1 = /^\d{1,2}\.\d{1,2}$|^\d{1,2}$/;
        this.componentTypeOptions = [
            { label: 'Flat Amount', value: 1 },
            { label: '% of CTC', value: 2 }
        ];

        this.formRef = React.createRef();
        this.columnHeader1 = [
            { label: 'Component Name', value: 'Component Name', sort: false },
            { label: 'Calculation Type', value: 'Calculation Type', sort: false },
            { label: 'Monthly', value: 'Monthly', sort: false },
            { label: 'Annually', value: 'Annualy', sort: false },
        ];
    }

    //added by mudassar
    handleChange = (evt) => {
        const value = evt.target.value;
        this.setState({
            [this.state.initValue.Fixed.formula]: value
        });
    }

    componentDidMount = () => {
        this.initializeData();
    }
    initializeData = () => {
        const { current_employee_id } = this.state.initValue;
        this.getSalaryComponentByEmployeeId_First_Time(current_employee_id);
        this.props.createPayrollEmployeeActions.getSalaryComponentForDropdownFixed();
        this.props.createPayrollEmployeeActions.getSalaryComponentForDropdownDeduction();
        this.props.createPayrollEmployeeActions.getSalaryComponentForDropdownVariable();
    }
    getSalaryComponentByEmployeeId_First_Time = (current_employee_id) => {
        if (current_employee_id) {
            this.props.detailSalaryComponentAction.getSalaryComponentByEmployeeId(current_employee_id).then((res) => {
                if (res.status === 200) {
                    const { ctcType } = this.state.initValue;
                    const ctc = res.data.ctc ?? 0;
                    const monthltCTC = ctcType === 'Monthly' ? ctc : parseFloat(parseFloat(ctc / 12).toFixed(2));
                    const yearlyCTC = ctcType === "ANNUALLY" ? ctc : parseFloat(ctc) * 12
                    this.setState({
                        initValue: {
                            ...this.state.initValue,
                            current_employee_id: current_employee_id,
                            id: res.data.id ? current_employee_id : '',
                            CTC: ctc,
                            monthltCTC: monthltCTC,
                            yearlyCTC: yearlyCTC,
                            Fixed: res.data.salaryComponentResult.Fixed ? res.data.salaryComponentResult.Fixed : [],
                            Variable: res.data.salaryComponentResult.Variable,
                            Deduction: res.data.salaryComponentResult.Deduction ? res.data.salaryComponentResult.Deduction : [],
                            Fixed_Allowance: res.data.salaryComponentResult.Fixed_Allowance,
                        }
                    }, () => {
                        const { Fixed, Deduction } = this.state.initValue;
                        this.updateSalary()
                        let componentSelected = [];
                        Fixed && Fixed.length > 0 && Fixed.map(obj => {
                            componentSelected.push(obj.salaryComponentId);
                        })
                        Deduction && Deduction.length > 0 && Deduction.map(obj => {
                            componentSelected.push(obj.salaryComponentId);
                        })
                        this.setState({
                            componentSelected: componentSelected,
                        })

                    })
                }
            }).catch((err) => {
                this.props.history.push('/admin/master/employee')
            })
        }
        this.setState({ loading: false })
    }
    openSalaryComponentFixed = () => {
        this.setState({ openSalaryComponentFixed: true });
    };
    closeSalaryComponentFixed = () => {
        this.setState({ openSalaryComponentFixed: false });
    };
    openSalaryComponentDeduction = () => {
        this.setState({ openSalaryComponentDeduction: true });
    };
    closeSalaryComponentDeduction = () => {
        this.setState({ openSalaryComponentDeduction: false });
    };

    totalEarning = (data) => {
        data = data.filter(obj => obj.id !== '')
        let monthly = 0;
        let yearly = 0;
        data.map((item) => {
            if (item.monthlyAmount) {
                monthly += parseFloat(item.monthlyAmount);
            } if (item.yearlyAmount) {
                yearly += parseFloat(item.yearlyAmount);
            }
        });
        return { yearly: yearly, monthly: monthly };
    }

    getCurrentSalaryComponent = (newComponent, componentType) => {
        this.getSalaryComponentById(newComponent.value, componentType)

    };
    updateComponentSalary = (component, yearlyCTC, ctcType) => {
        if (component.id) {
            if (component.formula && component.formula.length > 0) {
                var salaryAnnulay = yearlyCTC * (component.formula / 100);
                var salaryMonthy = salaryAnnulay / 12;
                salaryMonthy = parseFloat(salaryMonthy)
                component.monthlyAmount = salaryMonthy;
                component.yearlyAmount = salaryAnnulay;
            }
            else {
                var salary = component.flatAmount;
                var salaryMonthy = ctcType === "ANNUALLY" ? salary / 12 : salary;
                salaryMonthy = parseFloat(salaryMonthy)
                component.monthlyAmount = salaryMonthy;
                component.yearlyAmount = ctcType === "ANNUALLY" ? salary : salaryMonthy * 12;
            }
        }
        return component
    }
    updateSalary = async () => {
        let { Deduction, Fixed, yearlyCTC, monthltCTC, CTC, ctcType } = this.state.initValue;
        this.setState({ errorMsg: false })
        var locallist = []
        Fixed.map((obj) => {
            locallist.push(obj);
            const component = this.updateComponentSalary(obj, yearlyCTC, ctcType);
            return component;
        });

        if (Deduction && Deduction?.length > 0) {
            Deduction.map((obj) => {
                locallist.push(obj);
                const component = this.updateComponentSalary(obj, yearlyCTC, ctcType);
                return component;
            });
        }
        const totalEarnings = this.totalEarning(Fixed);
        const totalDeductions = this.totalEarning(Deduction);

        Fixed = this.addRow(Fixed);
        Deduction = this.addRow(Deduction);

        const totalMonthlyEarnings = totalEarnings.monthly;
        const totalYearlyEarnings = totalEarnings.yearly;
        const totalMonthlyDeductions = totalDeductions.monthly;
        const totalYearlyDeductions = totalDeductions.yearly;
        const totalNetPayMontly = parseFloat(totalMonthlyEarnings) - parseFloat(totalMonthlyDeductions);
        const totalNetPayYearly = parseFloat(totalYearlyEarnings) - parseFloat(totalYearlyDeductions);
        this.setState({
            CTC: CTC,
            list: locallist,
            initValue: {
                ...this.state.initValue,
                ...{
                    CTC: CTC,
                    totalMonthlyEarnings: totalMonthlyEarnings,
                    totalYearlyEarnings: totalEarnings.yearly,
                    totalMonthlyDeductions: totalDeductions.monthly,
                    totalYearlyDeductions: totalDeductions.yearly,
                    totalNetPayMontly: totalNetPayMontly,
                    totalNetPayYearly: totalNetPayYearly,
                    Fixed: Fixed,
                    Deduction: Deduction,
                }
            }
        }, () => {
            this.formRef?.current && this.formRef.current.setFieldValue('totalMonthlyEarnings', totalMonthlyEarnings, true);
            this.formRef?.current && this.formRef.current.setFieldValue('list', locallist, true);
            this.formRef?.current && this.formRef.current.setFieldValue('totalYearlyEarnings', totalYearlyEarnings, true);
            this.formRef?.current && this.formRef.current.setFieldValue('totalMonthlyDeductions', totalMonthlyDeductions, true);
            this.formRef?.current && this.formRef.current.setFieldValue('totalYearlyDeductions', totalYearlyDeductions, true);
            this.formRef?.current && this.formRef.current.setFieldValue('totalNetPayYearly', totalNetPayYearly, true);
            this.formRef?.current && this.formRef.current.setFieldValue('totalNetPayMontly', totalNetPayMontly, true);
            this.formRef?.current && this.formRef.current.setFieldValue('Fixed', Fixed, true);
            this.formRef?.current && this.formRef.current.setFieldValue('Deduction', Deduction, true);
            this.formRef?.current && this.formRef.current.setFieldValue('CTC', CTC, true);
            this.formRef?.current && this.formRef.current.setFieldValue('monthltCTC', monthltCTC, true);
            this.formRef?.current && this.formRef.current.setFieldValue('yearlyCTC', yearlyCTC, true);
        })
    }

    removeComponent = (ComponentId) => {
        const { initValue, componentSelected } = this.state;
        const { Deduction, Fixed } = initValue;
        const fixed = Fixed.filter(obj => obj.salaryComponentId !== ComponentId);
        const deduction = Deduction ? Deduction.filter(obj => obj.salaryComponentId !== ComponentId) : '';
        const componentsSelected = componentSelected ? componentSelected.filter(obj => obj !== ComponentId) : [];
        this.setState({
            componentSelected: componentsSelected,
            initValue: {
                ...this.state.initValue,
                ...{
                    Fixed: fixed,
                    Deduction: deduction,
                }
            }
        }, () => {
            this.updateSalary();
        })
    }

    addComponentValue = (componentType, value, calculationType, row) => {
        const { initValue } = this.state;
        const { Fixed, Deduction } = initValue;
        const data = componentType === 'Fixed' ? Fixed : Deduction;
        const index = data.findIndex(obj => parseInt(obj.id) === parseInt(row.id));
        if (parseInt(index) !== -1) {
            if (calculationType === 'Formula') {
                data[index].flatAmount = '';
                data[index].formula = value;
            }
            else {
                data[index].formula = '';
                data[index].flatAmount = value;
            }
        }

        this.setState({
            initValue: {
                ...initValue,
                Fixed: componentType === 'Fixed' ? data : Fixed,
                Deduction: componentType === 'Deduction' ? data : Deduction,
            }
        }, () => {
            this.updateSalary();
        })

    }

    addRow = (component) => {
        const newComponent = {
            description: "",
            flatAmount: '',
            formula: '',
            id: "",
            monthlyAmount: 0,
            yearlyAmount: 0,
        };

        if (component && component.length > 0) {
            const containEmptyComponent = component.find(obj => obj.id === '');
            if (containEmptyComponent) {
                return component;
            } else {
                return component.concat(newComponent)
            }

        } else {
            return [newComponent];
        }
    };
    getSalaryComponentById = (componentId, componentType, index) => {
        const { initValue, componentSelected } = this.state;
        const { Deduction, Fixed, current_employee_id } = initValue;
        componentSelected.push(componentId)
        this.props.createPayrollEmployeeActions.getSalaryComponentById(componentId).then((res) => {
            if (res.status === 200) {
                const data = componentType === 'Fixed' ? Fixed : Deduction;
                index = index ?? (data && data.length > 0 ? data.length - 1 : 0);
                data.map((obj, idx) => {
                    if (idx === index) {
                        obj.id = res.data.id;
                        obj.description = res.data.description;
                        obj.formula = res.data.formula;
                        obj.flatAmount = res.data.flatAmount;
                        obj.employeeId = current_employee_id;
                        obj.salaryComponentId = res.data.id;
                        obj.salaryStructure = componentType === 'Fixed' ? 1 : 3;
                        obj.monthlyAmount = "";
                        obj.yearlyAmount = "";
                    }
                    return obj;
                })
                this.setState({
                    componentSelected: componentSelected,
                    initValue: {
                        ...initValue,
                        Fixed: componentType === 'Fixed' ? data : Fixed,
                        Deduction: componentType === 'Deduction' ? data : Deduction,
                    }
                }, () => {
                    this.updateSalary()
                })
            }
        }).catch((err) => {
            this.setState({ loading: false })
        })

    }
    renderComponentName = (row, index, componentType) => {
        const { salary_component_fixed_dropdown, salary_component_deduction_dropdown } = this.props;
        const component_list = componentType === 'Fixed' ? salary_component_fixed_dropdown : salary_component_deduction_dropdown;
        const description = component_list && component_list.length > 0 ? component_list.find(obj => obj.value === row.salaryComponentId) : '';
        const { componentSelected } = this.state;
        const unusedComponentList = []
        component_list && component_list.length > 0 && component_list.map(obj => {
            if (!componentSelected.includes(obj.value))
                unusedComponentList.push(obj);
        });
        return (
            <Field
                name={componentType === 'Fixed' ? `Fixed.${index}.description` : `Deduction.${index}.description`}
                render={({ field, form }) => (
                    <>
                        <Select
                            isDisabled={row.description === 'Basic SALARY'}
                            options={unusedComponentList ? selectOptionsFactory.renderOptions(
                                'label',
                                'value',
                                unusedComponentList,
                                strings.SalaryComponent
                            ) : []}
                            id="description"
                            placeholder={strings.Select + strings.SalaryComponent}
                            onChange={(e) => {
                                let componentUsed = componentSelected;
                                if (row.salaryComponentId) {
                                    componentUsed = componentUsed ? componentUsed.filter(obj => obj !== row.salaryComponentId) : [];
                                }
                                this.setState({ componentSelected: componentUsed }, () => {
                                    this.getSalaryComponentById(e.value, componentType, index)
                                })
                            }}
                            value={row.description === 'Basic SALARY' ? { label: row.description, value: '' } : description ? description : ''}

                        />

                    </>

                )}
            />
        );

    }
    renderComponentValue = (item, componentType) => {
        return (
            <Field
                render={({ field, form }) => (
                    <div>
                        <div className="input-group">
                            {(item.formula || item.formula === null) ?
                                <Input
                                    type="number"
                                    min="0"
                                    max="99"
                                    step="0.01"
                                    size="30"
                                    maxLength={2}
                                    style={{ textAlign: "center" }}
                                    id="formula"
                                    name="formula"
                                    value={item.formula ?? ''}
                                    onChange={(option) => {
                                        if (option.target.value === '') {
                                            this.addComponentValue(componentType, null, 'Formula', item);
                                        } else if (this.regDec1.test(option.target.value)) {
                                            this.addComponentValue(componentType, option.target.value, 'Formula', item);
                                        }
                                    }}
                                /> :
                                <Input
                                    maxLength={8}
                                    type="text"
                                    size={30}
                                    style={{ textAlign: "center" }}
                                    onChange={(option) => {
                                        const inputValue = option.target.value;
                                        if (inputValue === '') {
                                            this.addComponentValue(componentType, null, 'Formula', item);
                                        } else if (/^\d*\.?\d*$/.test(inputValue) && inputValue.length <= 8) {
                                            this.addComponentValue(componentType, option.target.value, 'FlatAmount', item);
                                        }
                                    }}
                                    value={item.flatAmount ?? ''}
                                    id=''
                                />
                            }
                            <div className="dropdown open input-group-append">
                                <div style={{ width: '130px' }}>
                                    <Select
                                        options={
                                            this.componentTypeOptions
                                                ? selectOptionsFactory.renderOptions(
                                                    'label',
                                                    'value',
                                                    this.componentTypeOptions,
                                                    'Type',
                                                )
                                                : []
                                        }
                                        id="type"
                                        name="type"
                                        placeholder={strings.Select + strings.Type}
                                        value={
                                            this.componentTypeOptions
                                            && selectOptionsFactory.renderOptions(
                                                'label',
                                                'value',
                                                this.componentTypeOptions,
                                                'Type',
                                            ).find((option) => (item.formula || item.formula === null ?
                                                option.value == 2 : option.value == 1))
                                        }
                                        onChange={(option) => {
                                            if (option.value == 1) {
                                                this.addComponentValue(componentType, null, 'FlatAmount', item);
                                            } else {
                                                this.addComponentValue(componentType, null, 'Formula', item);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
        )
    }

    renderComponentList = (props, componentType, data, totalMonthly, totalYearly) => {
        return (
            <Table className="text-center" >
                <thead>
                    <tr style={{ background: '#dfe9f7', color: "Black" }}>
                        {this.columnHeader1.map((column, index) => {
                            return (
                                <th style={{ border: "3px solid #c8ced3" }}>
                                    {column.label}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data && Object.values(data).map((item, index) => {
                        return (
                            <tr>
                                <td style={{ border: "3px solid #c8ced3", textAlign: 'left' }} >{this.renderComponentName(item, index, componentType)}</td>
                                <td style={{ border: "3px solid #c8ced3" }}>{this.renderComponentValue(item, componentType)}</td>
                                <td style={{ border: "3px solid #c8ced3" }}                                    >
                                    <Input
                                        disabled={true}
                                        type="text"
                                        size="30"
                                        style={{ textAlign: "center" }}
                                        value={item.monthlyAmount ? item.monthlyAmount.toLocaleString(
                                            navigator.language, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }) : '0.00'}
                                        id=''
                                    />
                                </td>

                                <td style={{ border: "3px solid  #c8ced3" }} >
                                    {item.yearlyAmount ? item.yearlyAmount.toLocaleString(
                                        navigator.language, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }) : '0.00'}

                                </td>

                                <td style={{ border: 'none' }}>
                                    {item.description !== "Basic SALARY" && item.id ? (
                                        <Button
                                            color='link'
                                            onClick={() => {
                                                this.removeComponent(item.salaryComponentId)
                                            }}
                                        >
                                            <i className="far fa-times-circle"></i>
                                        </Button>)
                                        : ''}
                                </td>
                            </tr>
                        )
                    })}
                    <tr>
                        <td colSpan={4} style={{ border: "3px solid  #c8ced3" }}>
                            <Button
                                color="link"
                                className="pull-left"
                                onClick={() => {
                                    if (componentType === 'Fixed')
                                        this.openSalaryComponentFixed();
                                    else
                                        this.openSalaryComponentDeduction();
                                }}
                            >
                                <i className="fa fa-plus"></i>  {componentType === 'Fixed' ? strings.AddEarnings : strings.AddDeduction}
                            </Button>
                        </td>
                    </tr>
                    <tr style={{ background: "#dfe9f7", color: "Black" }}>
                        <td colSpan={2} style={{ border: "3px solid #c8ced3" }}>
                            <b className="pull-left">{componentType === 'Fixed' ? strings.TotalEarnings + ' (A):' : strings.TotalDeductions + ' (B):'}</b>
                        </td>
                        <td style={{ border: "3px solid  #c8ced3" }}><b>
                            <Currency
                                value={totalMonthly}
                            />

                        </b></td>
                        <td style={{ border: "3px solid  #c8ced3" }}><b>
                            <Currency
                                value={totalYearly}
                            />
                        </b></td>
                    </tr>
                </tbody>
            </Table>
        )

    }
    updateCTC = (props, ctcType, ctcValue, ctcTypeOption) => {
        let monthlyCTC = 0;
        let yearlyCTC = 0;
        if (ctcValue === '' || this.regEx.test(ctcValue)) {
            if (ctcType === "ANNUALLY") {
                yearlyCTC = ctcValue;
                monthlyCTC = parseFloat(parseFloat(ctcValue / 12).toFixed(2));
            } else {
                yearlyCTC = parseFloat(parseFloat(ctcValue * 12).toFixed(2));
                monthlyCTC = ctcValue;
            }
            props.handleChange('yearlyCTC')(yearlyCTC)
            props.handleChange('monthlyCTC')(monthlyCTC)
            props.handleChange('CTC')(ctcValue);
            props.handleChange('ctcTypeOption')(ctcTypeOption);
            props.handleChange('ctcType')(ctcType);
            this.setState({
                ctcValue: ctcValue,
                initValue: {
                    ...this.state.initValue,
                    ...{
                        CTC: ctcValue,
                        yearlyCTC: yearlyCTC,
                        monthlyCTC: monthlyCTC,
                        ctcTypeOption: ctcTypeOption,
                        ctcType: ctcType,
                    }
                }
            }, () => {
                this.updateSalary();
            })
        }
    }

    render() {
        strings.setLanguage(this.state.language);
        const { loading, initValue, errorMsg, ctcTypeList, openSalaryComponentFixed,
            openSalaryComponentDeduction,
            disabled,
        } = this.state
        const {
            totalYearlyDeductions,
            totalNetPayMontly,
            totalNetPayYearly,
            totalMonthlyEarnings,
            totalYearlyEarnings,
            totalMonthlyDeductions,
            current_employee_id,
            ctcTypeOption,
            ctcType,
            Fixed,
            Deduction,
        } = initValue
        const { handleSubmit, toggle, updateComponent, sifEnabled } = this.props;
        return (
            <div>
                {loading ? (<Loader></Loader>) : (
                    <Row>
                        <Col>
                            <Formik
                                initialValues={initValue}
                                ref={this.formRef}
                                onSubmit={(values) => {
                                    handleSubmit(values)
                                }}
                                validate={(values) => {
                                    let errors = {}
                                    if (values.CTC && (parseFloat(values.yearlyCTC) !== parseFloat(totalYearlyEarnings))) {
                                        errors.totalEarning = strings.GrossEarningsShouldBeEqualToCTC;
                                    }
                                    if (values.CTC && (parseFloat(totalYearlyEarnings) <= parseFloat(totalYearlyDeductions))) {
                                        errors.totalDeductions = strings.TotalDeductionsShouldBeLessThanTotalEarnings
                                    }
                                    return errors;
                                }}
                                validationSchema={Yup.object().shape({
                                    CTC: Yup.string()
                                        .required(strings.CTCIsRequired)
                                        .test("non Zero", strings.CTCShouldBeGreaterThenZero, (value) => {
                                            return parseFloat(value) > 0
                                        }),
                                })}
                            >
                                {(props) => (
                                    <Form onSubmit={props.handleSubmit} name="simpleForm">
                                        <div style={{ width: "100%" }}>
                                            <div style={{ textAlign: "center" }}>
                                                <FormGroup className="mt-3" style={{ textAlign: "center", display: "grid" }} >
                                                    <div style={{ display: "flex", textAlign: "center", justifyContent: 'center' }}>
                                                        <h4 style={{ width: "fit-content", display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignContent: 'center' }} className="mb-0">
                                                            <span className="text-danger">*</span>  {strings.CosttoCompany}  ( CTC ) :
                                                        </h4>
                                                        <div style={{ width: "20%", paddingRight: "2%" }}>
                                                            <Input
                                                                type="text"
                                                                id="CTC"
                                                                size="30"
                                                                name="CTC"
                                                                maxLength='14,2'
                                                                style={{ textAlign: "center" }}
                                                                value={props.values.CTC}
                                                                placeholder={ctcType == "MONTHLY" ? "Enter Monthly Wages" : (strings.Enter + strings.ctc)}
                                                                onChange={(option) => {
                                                                    this.updateCTC(props, ctcType, parseFloat(option.target.value), ctcTypeOption);
                                                                }}
                                                                className={props.errors.CTC && props.touched.CTC ? "is-invalid" : ""}
                                                            />
                                                            {props.errors.CTC && props.touched.CTC && (
                                                                <div className="invalid-feedback">{props.errors.CTC}</div>
                                                            )}
                                                        </div>
                                                        <div style={{ width: "20%" }}>
                                                            <Select
                                                                options={ctcTypeList}
                                                                id="ctcTypeOption"
                                                                name="ctcTypeOption"
                                                                className="mr-2"
                                                                value={ctcTypeOption}
                                                                onChange={(option) => {
                                                                    this.updateCTC(props, option.label, props.values.CTC, option);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </FormGroup>
                                            </div>
                                        </div>
                                        <Row>
                                            <Col lg={12}>
                                                <Row className="ml-2">
                                                    <h4>{strings.Earnings + ":"}</h4>
                                                </Row>
                                                <Row style={{ margin: '0px' }}>
                                                    {this.renderComponentList(props, 'Fixed', Fixed, totalMonthlyEarnings, totalYearlyEarnings)}
                                                    {errorMsg && props.errors.totalEarning && (
                                                        <div className='w-100 mr-5'>
                                                            <div className='invalid-feedback d-block text-right' style={{ fontSize: 'medium', marginRight: '60px' }}>
                                                                {props.errors.totalEarning}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Row>
                                            </Col>

                                            <Col lg={12}>
                                                <Row className="ml-2 mt-4">
                                                    <h4>{strings.Deductions + ":"}</h4>
                                                </Row>
                                                <Row style={{ margin: '0px' }}>
                                                    {this.renderComponentList(props, 'Deduction', Deduction, totalMonthlyDeductions, totalYearlyDeductions)}
                                                    {errorMsg && props.errors.totalDeductions && (
                                                        <div className='w-100 mr-5'>
                                                            <div className='invalid-feedback d-block text-right' style={{ fontSize: 'medium', marginRight: '60px' }}>
                                                                {props.errors.totalDeductions}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Row>
                                            </Col>
                                            <Col lg={9}>
                                                <Row className="ml-2 mt-4">
                                                    <h4>{strings.Gross + ' ' + strings.Earnings + ':'}</h4>
                                                </Row>
                                                <Table
                                                    className="text-center"
                                                    style={{
                                                        width: "133%",
                                                        marginBottom: "0px"
                                                    }}
                                                >
                                                    <tbody>
                                                        <tr style={{ background: "#dfe9f7", color: "Black" }}>
                                                            <td colSpan={2} style={{ border: "3px solid #c8ced3", width: "50%" }}>
                                                                <b className="pull-left">{strings.Gross + ' ' + strings.Earnings + ' (C):'}</b>
                                                                <b className="pull-right">{'(A)'}</b>
                                                            </td>
                                                            <td style={{ border: "3px solid  #c8ced3" }}><b>
                                                                <Currency
                                                                    value={totalMonthlyEarnings}
                                                                />
                                                            </b></td>
                                                            <td style={{ border: "3px solid  #c8ced3" }}><b>
                                                                <Currency
                                                                    value={totalYearlyEarnings}
                                                                />
                                                            </b></td>
                                                        </tr>
                                                    </tbody>
                                                </Table>

                                            </Col>
                                            <Col lg={9}>
                                                <Row className="ml-2 mt-4">
                                                    <h4>{strings.TotalNetPay + ':'}</h4>
                                                </Row>
                                                <Table
                                                    className="text-center"
                                                    style={{
                                                        width: "133%",
                                                    }}
                                                >
                                                    <tbody>
                                                        <tr style={{ background: "#dfe9f7", color: "Black" }}>
                                                            <td colSpan={2} style={{ border: "3px solid #c8ced3", width: "50%" }}>
                                                                <b className="pull-left">{strings.TotalNetPay + '(D):'}</b>
                                                                <b className="pull-right">{'(C - B)'}</b>
                                                            </td>
                                                            <td style={{ border: "3px solid  #c8ced3" }}><b>
                                                                <Currency
                                                                    value={totalNetPayMontly}
                                                                />
                                                            </b></td>
                                                            <td style={{ border: "3px solid  #c8ced3" }}><b>
                                                                <Currency
                                                                    value={totalNetPayYearly}
                                                                />
                                                            </b></td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </Col>
                                        </Row>
                                        {updateComponent &&
                                            <Row className='pull-right'>
                                                <FormGroup className="text-right">
                                                    <Button
                                                        type="submit"
                                                        color="primary"
                                                        className="btn-square mr-3"
                                                        disabled={this.state.disabled}
                                                        onClick={() => {
                                                            this.setState({ errorMsg: true })
                                                            //	added validation popup	msg
                                                            props.handleBlur();
                                                            if (
                                                                props.errors == {} && Object.keys(props.errors) == [] && Object.keys(props.errors) != 'grossEarning'
                                                            ) {
                                                                this.props.commonActions.fillManDatoryDetails();
                                                            }
                                                        }}
                                                    >
                                                        <i className="fa fa-dot-circle-o"></i>{' '}
                                                        {disabled
                                                            ? 'Updating...'
                                                            : strings.Update}
                                                    </Button>
                                                    <Button
                                                        color="secondary"
                                                        className="btn-square"
                                                        onClick={() => {
                                                            this.props.history.push('/admin/master/employee/viewEmployee',
                                                                { id: current_employee_id, tabNo: '2' })
                                                        }}
                                                    >
                                                        <i className="fa fa-ban"></i> {strings.Cancel}
                                                    </Button>
                                                </FormGroup>
                                            </Row>
                                        }
                                        {!updateComponent &&
                                            <Row>
                                                <div
                                                    className="table-wrapper mb-4"
                                                    style={{ width: "100%" }}
                                                >
                                                    <Button
                                                        name="button"
                                                        color="primary"
                                                        className="btn-square"
                                                        onClick={() => {
                                                            if (sifEnabled == false) {
                                                                toggle("1");
                                                            } else {
                                                                toggle("3");
                                                            }
                                                        }}
                                                    >
                                                        <i className="far fa-arrow-alt-circle-left mr-1"></i>{" "}
                                                        {strings.back}
                                                    </Button>

                                                    <Button
                                                        type="submit"
                                                        color="primary"
                                                        className="btn-square mr-5 pull-right"
                                                        onClick={() => {
                                                            this.setState({ errorMsg: true })
                                                            //  added validation popup  msg
                                                            props.handleBlur();
                                                            if (
                                                                props.errors == {} && Object.keys(props.errors) == [] && Object.keys(props.errors) != 'grossEarning'
                                                            ) {
                                                                this.props.commonActions.fillManDatoryDetails();
                                                            }
                                                        }}
                                                    >
                                                        <i className="fa fa-dot-circle-o"></i>{" "}
                                                        {strings.Save}
                                                    </Button>
                                                </div>
                                            </Row>
                                        }
                                    </Form>
                                )}
                            </Formik>
                        </Col>
                    </Row>
                )}
                {openSalaryComponentFixed &&
                    <SalaryComponentFixed
                        openSalaryComponentFixed={openSalaryComponentFixed}
                        closeSalaryComponentFixed={() => {
                            this.closeSalaryComponentFixed();
                        }}
                        getCurrentSalaryComponent={() => {
                            this.props.createPayrollEmployeeActions.getSalaryComponentForDropdownFixed().then(res => {
                                if (res.status === 200) {
                                    this.getCurrentSalaryComponent(res.data[res.data.length - 1], "Fixed")
                                }
                            })
                        }}
                    />
                }

                {openSalaryComponentDeduction &&
                    <SalaryComponentDeduction
                        openSalaryComponentDeduction={openSalaryComponentDeduction}
                        closeSalaryComponentDeduction={() => {
                            this.closeSalaryComponentDeduction();
                        }}
                        getCurrentSalaryComponent={() => {
                            this.props.createPayrollEmployeeActions.getSalaryComponentForDropdownDeduction().then(res => {
                                if (res.status === 200)
                                    this.getCurrentSalaryComponent(res.data[res.data.length - 1], "Deduction")
                            })
                        }}
                    />
                }
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SalaryComponent)
