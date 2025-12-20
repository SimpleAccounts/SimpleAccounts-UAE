import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    Button,
    Input,
    Form,
    FormGroup,
    Label,
    Row,
    Col,
    Table,
} from 'reactstrap';
import { Loader, Currency } from 'components';
import Select from 'react-select';
import { CommonActions } from 'services/global';
import * as DetailSalaryComponentAction from 'screens/payrollemp/screens/update_salary_component/actions';
import * as CreatePayrollEmployeeActions from 'screens/payrollemp/screens/create/actions';
import { SalaryComponentDeduction, SalaryComponentFixed } from 'screens/payrollemp/sections';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { selectOptionsFactory } from 'utils';
import { data } from 'screens/Language/index';
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
    });
};

const mapDispatchToProps = (dispatch) => {
    return ({
        commonActions: bindActionCreators(CommonActions, dispatch),
        detailSalaryComponentAction: bindActionCreators(DetailSalaryComponentAction, dispatch),
        createPayrollEmployeeActions: bindActionCreators(CreatePayrollEmployeeActions, dispatch),
    });
};

let strings = new LocalizedStrings(data);

const SalaryComponent = ({
    employeeId,
    ctcTypeOption: initialCtcTypeOption,
    salary_component_fixed_dropdown,
    salary_component_deduction_dropdown,
    commonActions,
    detailSalaryComponentAction,
    createPayrollEmployeeActions,
    handleSubmit: handleFormSubmit,
    toggle,
    updateComponent,
    sifEnabled,
    history,
}) => {
    const [language] = useState(window['localStorage'].getItem('language'));
    const [loading, setLoading] = useState(true);
    const [openSalaryComponentFixed, setOpenSalaryComponentFixed] = useState(false);
    const [openSalaryComponentDeduction, setOpenSalaryComponentDeduction] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);
    const [componentSelected, setComponentSelected] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [formData, setFormData] = useState({
        totalYearlyDeductions: 0,
        totalNetPayMontly: 0,
        totalNetPayYearly: 0,
        totalMonthlyEarnings: 0,
        totalYearlyEarnings: 0,
        totalMonthlyDeductions: 0,
        CTC: '',
        current_employee_id: employeeId,
        ctcTypeOption: initialCtcTypeOption ? initialCtcTypeOption : { label: "MONTHLY", value: 2 },
        ctcType: initialCtcTypeOption ? initialCtcTypeOption.label : "MONTHLY",
        monthltCTC: 0,
        yearlyCTC: 0,
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
    });

    const regEx = /^[0-9\d]+$/;
    const regDec1 = /^\d{1,2}\.\d{1,2}$|^\d{1,2}$/;
    const componentTypeOptions = [
        { label: 'Flat Amount', value: 1 },
        { label: '% of CTC', value: 2 }
    ];

    const ctcTypeList = [
        { label: "MONTHLY", value: 2 },
        { label: "ANNUALLY", value: 1 },
    ];

    const columnHeader1 = [
        { label: 'Component Name', value: 'Component Name', sort: false },
        { label: 'Calculation Type', value: 'Calculation Type', sort: false },
        { label: 'Monthly', value: 'Monthly', sort: false },
        { label: 'Annually', value: 'Annualy', sort: false },
    ];

    strings.setLanguage(language);

    // Zod schema
    const schema = z.object({
        CTC: z.string()
            .min(1, strings.CTCIsRequired || 'CTC is required')
            .refine((val) => parseFloat(val) > 0, {
                message: strings.CTCShouldBeGreaterThenZero || 'CTC should be greater than zero',
            }),
        Fixed: z.array(z.any()).optional(),
        Deduction: z.array(z.any()).optional(),
        totalMonthlyEarnings: z.number().optional(),
        totalYearlyEarnings: z.number().optional(),
        totalMonthlyDeductions: z.number().optional(),
        totalYearlyDeductions: z.number().optional(),
        totalNetPayMontly: z.number().optional(),
        totalNetPayYearly: z.number().optional(),
        list: z.array(z.any()).optional(),
        ctcTypeOption: z.any().optional(),
        ctcType: z.string().optional(),
        monthltCTC: z.number().optional(),
        yearlyCTC: z.number().optional(),
    }).refine((data) => {
        if (data.CTC && data.yearlyCTC) {
            return parseFloat(data.yearlyCTC) === parseFloat(data.totalYearlyEarnings || 0);
        }
        return true;
    }, {
        message: strings.GrossEarningsShouldBeEqualToCTC || 'Gross earnings should be equal to CTC',
        path: ['totalEarning'],
    }).refine((data) => {
        if (data.CTC) {
            return parseFloat(data.totalYearlyEarnings || 0) > parseFloat(data.totalYearlyDeductions || 0);
        }
        return true;
    }, {
        message: strings.TotalDeductionsShouldBeLessThanTotalEarnings || 'Total deductions should be less than total earnings',
        path: ['totalDeductions'],
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        trigger,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: formData,
    });

    useEffect(() => {
        initializeData();
    }, []);

    const initializeData = () => {
        getSalaryComponentByEmployeeId_First_Time(employeeId);
        createPayrollEmployeeActions.getSalaryComponentForDropdownFixed();
        createPayrollEmployeeActions.getSalaryComponentForDropdownDeduction();
        createPayrollEmployeeActions.getSalaryComponentForDropdownVariable();
    };

    const getSalaryComponentByEmployeeId_First_Time = (current_employee_id) => {
        if (current_employee_id) {
            detailSalaryComponentAction.getSalaryComponentByEmployeeId(current_employee_id).then((res) => {
                if (res.status === 200) {
                    const { ctcType } = formData;
                    const ctc = res.data.ctc ?? 0;
                    const monthltCTC = ctcType === 'Monthly' ? ctc : parseFloat(parseFloat(ctc / 12).toFixed(2));
                    const yearlyCTC = ctcType === "ANNUALLY" ? ctc : parseFloat(ctc) * 12;

                    const newFormData = {
                        ...formData,
                        current_employee_id: current_employee_id,
                        id: res.data.id ? current_employee_id : '',
                        CTC: ctc,
                        monthltCTC: monthltCTC,
                        yearlyCTC: yearlyCTC,
                        Fixed: res.data.salaryComponentResult.Fixed ? res.data.salaryComponentResult.Fixed : [],
                        Variable: res.data.salaryComponentResult.Variable,
                        Deduction: res.data.salaryComponentResult.Deduction ? res.data.salaryComponentResult.Deduction : [],
                        Fixed_Allowance: res.data.salaryComponentResult.Fixed_Allowance,
                    };

                    setFormData(newFormData);
                    setValue('CTC', ctc);
                    setValue('monthltCTC', monthltCTC);
                    setValue('yearlyCTC', yearlyCTC);
                    setValue('Fixed', newFormData.Fixed);
                    setValue('Deduction', newFormData.Deduction);

                    const { Fixed, Deduction } = newFormData;
                    let componentSelectedList = [];
                    Fixed && Fixed.length > 0 && Fixed.forEach(obj => {
                        componentSelectedList.push(obj.salaryComponentId);
                    });
                    Deduction && Deduction.length > 0 && Deduction.forEach(obj => {
                        componentSelectedList.push(obj.salaryComponentId);
                    });
                    setComponentSelected(componentSelectedList);

                    setTimeout(() => updateSalary(newFormData), 100);
                }
            }).catch((err) => {
                history.push('/admin/master/employee');
            });
        }
        setLoading(false);
    };

    const totalEarning = (data) => {
        const filteredData = data.filter(obj => obj.id !== '');
        let monthly = 0;
        let yearly = 0;
        filteredData.forEach((item) => {
            if (item.monthlyAmount) {
                monthly += parseFloat(item.monthlyAmount);
            }
            if (item.yearlyAmount) {
                yearly += parseFloat(item.yearlyAmount);
            }
        });
        return { yearly: yearly, monthly: monthly };
    };

    const getCurrentSalaryComponent = (newComponent, componentType) => {
        getSalaryComponentById(newComponent.value, componentType);
    };

    const updateComponentSalary = (component, yearlyCTC, ctcType) => {
        if (component.id) {
            if (component.formula && component.formula.length > 0) {
                const salaryAnnulay = yearlyCTC * (component.formula / 100);
                const salaryMonthy = salaryAnnulay / 12;
                component.monthlyAmount = parseFloat(salaryMonthy);
                component.yearlyAmount = salaryAnnulay;
            } else {
                const salary = component.flatAmount;
                const salaryMonthy = ctcType === "ANNUALLY" ? salary / 12 : salary;
                component.monthlyAmount = parseFloat(salaryMonthy);
                component.yearlyAmount = ctcType === "ANNUALLY" ? salary : salaryMonthy * 12;
            }
        }
        return component;
    };

    const updateSalary = (currentFormData = formData) => {
        setErrorMsg(false);
        let { Deduction, Fixed, yearlyCTC, monthltCTC, CTC, ctcType } = currentFormData;

        const locallist = [];
        Fixed.forEach((obj) => {
            locallist.push(obj);
            updateComponentSalary(obj, yearlyCTC, ctcType);
        });

        if (Deduction && Deduction?.length > 0) {
            Deduction.forEach((obj) => {
                locallist.push(obj);
                updateComponentSalary(obj, yearlyCTC, ctcType);
            });
        }

        const totalEarnings = totalEarning(Fixed);
        const totalDeductions = totalEarning(Deduction);

        Fixed = addRow(Fixed);
        Deduction = addRow(Deduction);

        const totalMonthlyEarnings = totalEarnings.monthly;
        const totalYearlyEarnings = totalEarnings.yearly;
        const totalMonthlyDeductions = totalDeductions.monthly;
        const totalYearlyDeductions = totalDeductions.yearly;
        const totalNetPayMontly = parseFloat(totalMonthlyEarnings) - parseFloat(totalMonthlyDeductions);
        const totalNetPayYearly = parseFloat(totalYearlyEarnings) - parseFloat(totalYearlyDeductions);

        const updatedFormData = {
            ...currentFormData,
            CTC: CTC,
            totalMonthlyEarnings: totalMonthlyEarnings,
            totalYearlyEarnings: totalYearlyEarnings,
            totalMonthlyDeductions: totalMonthlyDeductions,
            totalYearlyDeductions: totalYearlyDeductions,
            totalNetPayMontly: totalNetPayMontly,
            totalNetPayYearly: totalNetPayYearly,
            Fixed: Fixed,
            Deduction: Deduction,
        };

        setFormData(updatedFormData);

        setValue('totalMonthlyEarnings', totalMonthlyEarnings);
        setValue('list', locallist);
        setValue('totalYearlyEarnings', totalYearlyEarnings);
        setValue('totalMonthlyDeductions', totalMonthlyDeductions);
        setValue('totalYearlyDeductions', totalYearlyDeductions);
        setValue('totalNetPayYearly', totalNetPayYearly);
        setValue('totalNetPayMontly', totalNetPayMontly);
        setValue('Fixed', Fixed);
        setValue('Deduction', Deduction);
        setValue('CTC', CTC);
        setValue('monthltCTC', monthltCTC);
        setValue('yearlyCTC', yearlyCTC);
    };

    const removeComponent = (ComponentId) => {
        const { Deduction, Fixed } = formData;
        const fixed = Fixed.filter(obj => obj.salaryComponentId !== ComponentId);
        const deduction = Deduction ? Deduction.filter(obj => obj.salaryComponentId !== ComponentId) : '';
        const componentsSelected = componentSelected ? componentSelected.filter(obj => obj !== ComponentId) : [];

        setComponentSelected(componentsSelected);
        const updatedFormData = {
            ...formData,
            Fixed: fixed,
            Deduction: deduction,
        };
        setFormData(updatedFormData);
        setTimeout(() => updateSalary(updatedFormData), 100);
    };

    const addComponentValue = (componentType, value, calculationType, row) => {
        const { Fixed, Deduction } = formData;
        const data = componentType === 'Fixed' ? Fixed : Deduction;
        const index = data.findIndex(obj => parseInt(obj.id) === parseInt(row.id));

        if (parseInt(index) !== -1) {
            if (calculationType === 'Formula') {
                data[index].flatAmount = '';
                data[index].formula = value;
            } else {
                data[index].formula = '';
                data[index].flatAmount = value;
            }
        }

        const updatedFormData = {
            ...formData,
            Fixed: componentType === 'Fixed' ? data : Fixed,
            Deduction: componentType === 'Deduction' ? data : Deduction,
        };
        setFormData(updatedFormData);
        setTimeout(() => updateSalary(updatedFormData), 100);
    };

    const addRow = (component) => {
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
                return component.concat(newComponent);
            }
        } else {
            return [newComponent];
        }
    };

    const getSalaryComponentById = (componentId, componentType, index) => {
        const { Deduction, Fixed, current_employee_id } = formData;
        const updatedComponentSelected = [...componentSelected, componentId];
        setComponentSelected(updatedComponentSelected);

        createPayrollEmployeeActions.getSalaryComponentById(componentId).then((res) => {
            if (res.status === 200) {
                const data = componentType === 'Fixed' ? Fixed : Deduction;
                const idx = index ?? (data && data.length > 0 ? data.length - 1 : 0);

                data.forEach((obj, i) => {
                    if (i === idx) {
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
                });

                const updatedFormData = {
                    ...formData,
                    Fixed: componentType === 'Fixed' ? data : Fixed,
                    Deduction: componentType === 'Deduction' ? data : Deduction,
                };
                setFormData(updatedFormData);
                setTimeout(() => updateSalary(updatedFormData), 100);
            }
        }).catch((err) => {
            setLoading(false);
        });
    };

    const renderComponentName = (row, index, componentType) => {
        const component_list = componentType === 'Fixed' ? salary_component_fixed_dropdown : salary_component_deduction_dropdown;
        const description = component_list && component_list.length > 0 ? component_list.find(obj => obj.value === row.salaryComponentId) : '';

        const unusedComponentList = [];
        component_list && component_list.length > 0 && component_list.forEach(obj => {
            if (!componentSelected.includes(obj.value))
                unusedComponentList.push(obj);
        });

        return (
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
                    setComponentSelected(componentUsed);
                    setTimeout(() => getSalaryComponentById(e.value, componentType, index), 50);
                }}
                value={row.description === 'Basic SALARY' ? { label: row.description, value: '' } : description ? description : ''}
            />
        );
    };

    const renderComponentValue = (item, componentType) => {
        return (
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
                                    addComponentValue(componentType, null, 'Formula', item);
                                } else if (regDec1.test(option.target.value)) {
                                    addComponentValue(componentType, option.target.value, 'Formula', item);
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
                                    addComponentValue(componentType, null, 'Formula', item);
                                } else if (/^\d*\.?\d*$/.test(inputValue) && inputValue.length <= 8) {
                                    addComponentValue(componentType, option.target.value, 'FlatAmount', item);
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
                                    componentTypeOptions
                                        ? selectOptionsFactory.renderOptions(
                                            'label',
                                            'value',
                                            componentTypeOptions,
                                            'Type',
                                        )
                                        : []
                                }
                                id="type"
                                name="type"
                                placeholder={strings.Select + strings.Type}
                                value={
                                    componentTypeOptions
                                    && selectOptionsFactory.renderOptions(
                                        'label',
                                        'value',
                                        componentTypeOptions,
                                        'Type',
                                    ).find((option) => (item.formula || item.formula === null ?
                                        option.value == 2 : option.value == 1))
                                }
                                onChange={(option) => {
                                    if (option.value == 1) {
                                        addComponentValue(componentType, null, 'FlatAmount', item);
                                    } else {
                                        addComponentValue(componentType, null, 'Formula', item);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderComponentList = (componentType, data, totalMonthly, totalYearly) => {
        return (
            <Table className="text-center">
                <thead>
                    <tr style={{ background: '#dfe9f7', color: "Black" }}>
                        {columnHeader1.map((column, index) => {
                            return (
                                <th key={index} style={{ border: "3px solid #c8ced3" }}>
                                    {column.label}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data && Object.values(data).map((item, index) => {
                        return (
                            <tr key={index}>
                                <td style={{ border: "3px solid #c8ced3", textAlign: 'left' }}>
                                    {renderComponentName(item, index, componentType)}
                                </td>
                                <td style={{ border: "3px solid #c8ced3" }}>
                                    {renderComponentValue(item, componentType)}
                                </td>
                                <td style={{ border: "3px solid #c8ced3" }}>
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
                                <td style={{ border: "3px solid  #c8ced3" }}>
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
                                                removeComponent(item.salaryComponentId);
                                            }}
                                        >
                                            <i className="far fa-times-circle"></i>
                                        </Button>)
                                        : ''}
                                </td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td colSpan={4} style={{ border: "3px solid  #c8ced3" }}>
                            <Button
                                color="link"
                                className="pull-left"
                                onClick={() => {
                                    if (componentType === 'Fixed')
                                        setOpenSalaryComponentFixed(true);
                                    else
                                        setOpenSalaryComponentDeduction(true);
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
                        <td style={{ border: "3px solid  #c8ced3" }}>
                            <b>
                                <Currency value={totalMonthly} />
                            </b>
                        </td>
                        <td style={{ border: "3px solid  #c8ced3" }}>
                            <b>
                                <Currency value={totalYearly} />
                            </b>
                        </td>
                    </tr>
                </tbody>
            </Table>
        );
    };

    const updateCTC = (ctcType, ctcValue, ctcTypeOption) => {
        let monthlyCTC = 0;
        let yearlyCTC = 0;
        if (ctcValue === '' || regEx.test(ctcValue)) {
            if (ctcType === "ANNUALLY") {
                yearlyCTC = ctcValue;
                monthlyCTC = parseFloat(parseFloat(ctcValue / 12).toFixed(2));
            } else {
                yearlyCTC = parseFloat(parseFloat(ctcValue * 12).toFixed(2));
                monthlyCTC = ctcValue;
            }

            setValue('yearlyCTC', yearlyCTC);
            setValue('monthlyCTC', monthlyCTC);
            setValue('CTC', ctcValue);
            setValue('ctcTypeOption', ctcTypeOption);
            setValue('ctcType', ctcType);

            const updatedFormData = {
                ...formData,
                CTC: ctcValue,
                yearlyCTC: yearlyCTC,
                monthlyCTC: monthlyCTC,
                ctcTypeOption: ctcTypeOption,
                ctcType: ctcType,
            };
            setFormData(updatedFormData);
            setTimeout(() => updateSalary(updatedFormData), 100);
        }
    };

    const onSubmit = (values) => {
        handleFormSubmit(values);
    };

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
    } = formData;

    return (
        <div>
            {loading ? (<Loader></Loader>) : (
                <Row>
                    <Col>
                        <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                            <div style={{ width: "100%" }}>
                                <div style={{ textAlign: "center" }}>
                                    <FormGroup className="mt-3" style={{ textAlign: "center", display: "grid" }}>
                                        <div style={{ display: "flex", textAlign: "center", justifyContent: 'center' }}>
                                            <h4 style={{ width: "fit-content", display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignContent: 'center' }} className="mb-0">
                                                <span className="text-danger">*</span>  {strings.CosttoCompany}  ( CTC ) :
                                            </h4>
                                            <div style={{ width: "20%", paddingRight: "2%" }}>
                                                <Controller
                                                    name="CTC"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            type="text"
                                                            id="CTC"
                                                            size="30"
                                                            maxLength='14,2'
                                                            style={{ textAlign: "center" }}
                                                            placeholder={ctcType == "MONTHLY" ? "Enter Monthly Wages" : (strings.Enter + strings.ctc)}
                                                            onChange={(option) => {
                                                                updateCTC(ctcType, parseFloat(option.target.value), ctcTypeOption);
                                                            }}
                                                            className={errors.CTC ? "is-invalid" : ""}
                                                        />
                                                    )}
                                                />
                                                {errors.CTC && (
                                                    <div className="invalid-feedback">{errors.CTC.message}</div>
                                                )}
                                            </div>
                                            <div style={{ width: "20%" }}>
                                                <Controller
                                                    name="ctcTypeOption"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            options={ctcTypeList}
                                                            id="ctcTypeOption"
                                                            className="mr-2"
                                                            onChange={(option) => {
                                                                updateCTC(option.label, formData.CTC, option);
                                                            }}
                                                        />
                                                    )}
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
                                        {renderComponentList('Fixed', Fixed, totalMonthlyEarnings, totalYearlyEarnings)}
                                        {errorMsg && errors.totalEarning && (
                                            <div className='w-100 mr-5'>
                                                <div className='invalid-feedback d-block text-right' style={{ fontSize: 'medium', marginRight: '60px' }}>
                                                    {errors.totalEarning.message}
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
                                        {renderComponentList('Deduction', Deduction, totalMonthlyDeductions, totalYearlyDeductions)}
                                        {errorMsg && errors.totalDeductions && (
                                            <div className='w-100 mr-5'>
                                                <div className='invalid-feedback d-block text-right' style={{ fontSize: 'medium', marginRight: '60px' }}>
                                                    {errors.totalDeductions.message}
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
                                                <td style={{ border: "3px solid  #c8ced3" }}>
                                                    <b>
                                                        <Currency value={totalMonthlyEarnings} />
                                                    </b>
                                                </td>
                                                <td style={{ border: "3px solid  #c8ced3" }}>
                                                    <b>
                                                        <Currency value={totalYearlyEarnings} />
                                                    </b>
                                                </td>
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
                                                <td style={{ border: "3px solid  #c8ced3" }}>
                                                    <b>
                                                        <Currency value={totalNetPayMontly} />
                                                    </b>
                                                </td>
                                                <td style={{ border: "3px solid  #c8ced3" }}>
                                                    <b>
                                                        <Currency value={totalNetPayYearly} />
                                                    </b>
                                                </td>
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
                                            disabled={disabled}
                                            onClick={() => {
                                                setErrorMsg(true);
                                                trigger();
                                                if (Object.keys(errors).length > 0 && !errors.grossEarning) {
                                                    commonActions.fillManDatoryDetails();
                                                }
                                            }}
                                        >
                                            <i className="fa fa-dot-circle-o"></i>{' '}
                                            {disabled ? 'Updating...' : strings.Update}
                                        </Button>
                                        <Button
                                            color="secondary"
                                            className="btn-square"
                                            onClick={() => {
                                                history.push('/admin/master/employee/viewEmployee',
                                                    { id: current_employee_id, tabNo: '2' });
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
                                                setErrorMsg(true);
                                                trigger();
                                                if (Object.keys(errors).length > 0 && !errors.grossEarning) {
                                                    commonActions.fillManDatoryDetails();
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
                    </Col>
                </Row>
            )}
            {openSalaryComponentFixed &&
                <SalaryComponentFixed
                    openSalaryComponentFixed={openSalaryComponentFixed}
                    closeSalaryComponentFixed={() => {
                        setOpenSalaryComponentFixed(false);
                    }}
                    getCurrentSalaryComponent={() => {
                        createPayrollEmployeeActions.getSalaryComponentForDropdownFixed().then(res => {
                            if (res.status === 200) {
                                getCurrentSalaryComponent(res.data[res.data.length - 1], "Fixed");
                            }
                        });
                    }}
                />
            }

            {openSalaryComponentDeduction &&
                <SalaryComponentDeduction
                    openSalaryComponentDeduction={openSalaryComponentDeduction}
                    closeSalaryComponentDeduction={() => {
                        setOpenSalaryComponentDeduction(false);
                    }}
                    getCurrentSalaryComponent={() => {
                        createPayrollEmployeeActions.getSalaryComponentForDropdownDeduction().then(res => {
                            if (res.status === 200)
                                getCurrentSalaryComponent(res.data[res.data.length - 1], "Deduction");
                        });
                    }}
                />
            }
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(SalaryComponent);
