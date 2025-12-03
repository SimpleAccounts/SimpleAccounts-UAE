package com.simpleaccounts.rest.payroll;

import lombok.Data;

@Data
public class SalaryStructureListModel {

    private Integer salaryStructureId;
    private String salaryStructureType;
    private String salaryStructureName;
}
