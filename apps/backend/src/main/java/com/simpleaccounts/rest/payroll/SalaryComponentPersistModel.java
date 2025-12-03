package com.simpleaccounts.rest.payroll;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SalaryComponentPersistModel implements Serializable {

    private static final long serialVersionUID = 1L;
    private  Integer id;
    private Integer employeeId;
    private Integer salaryComponentId;
    private String salaryComponentString;
    private List<SalaryComponentPersistModel> salaryComponentPersistModelList;
    private String salaryStructure;
    private String description;
    private String formula;
    private String flatAmount;
    private Boolean deleteFlag = Boolean.FALSE;
    private BigDecimal monthlySalary;
    private BigDecimal yearlySalary;
    private BigDecimal grossSalary;
    private String ctcType;
    private BigDecimal monthlyAmount;
    private BigDecimal yearlyAmount;
    private Integer type;
    private Integer calculationType;
    private String componentType;
    private String componentCode;
    private Boolean isComponentDeletable;
    private String invoiceType;


}
