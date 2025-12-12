package com.simpleaccounts.rest.payroll.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
public class PayrolRequestModel {

    private String payrollSubject;
    private String payPeriod;
    private List<Integer> employeeListIds;
    private List<GeneratePayrollPersistModel> generatePayrollPersistModelList;
    private String generatePayrollString;
    private Date salaryDate;
    private Integer approverId;
    private Integer payrollId;
    // private LocalDateTime payrollDate;
    private BigDecimal totalAmountPayroll;
    private String startDate;
    private String endDate;
    private List<Integer> payrollEmployeesIdsListToSendMail;

}
