package com.simplevat.rest.payroll.service;

import lombok.Data;

import java.time.LocalDate;
@Data
public class SalarySlipListtModel {

    private LocalDate salaryDate;
    private String monthYear;
    private String payPeriod;

}
