package com.simpleaccounts.model;

import lombok.Data;

import java.util.List;

@Data
public class SalaryPersistModel {

    private List<Integer> employeeListIds;
    private String salaryDate;

}
