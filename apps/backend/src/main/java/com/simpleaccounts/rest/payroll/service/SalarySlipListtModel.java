package com.simpleaccounts.rest.payroll.service;

import java.time.LocalDate;
import lombok.Data;

@Data
public class SalarySlipListtModel {

    private LocalDate salaryDate;
    private String monthYear;
    private String payPeriod;

}
