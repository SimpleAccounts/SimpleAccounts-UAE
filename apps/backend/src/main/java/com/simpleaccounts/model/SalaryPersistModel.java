package com.simpleaccounts.model;

import java.util.List;
import lombok.Data;

@Data
public class SalaryPersistModel {

    private List<Integer> employeeListIds;
    private String salaryDate;

}
