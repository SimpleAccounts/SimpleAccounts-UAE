package com.simpleaccounts.rest.payroll.model;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private BigDecimal totalAmountPayroll;
    private String startDate;
    private String endDate;
    private List<Integer> payrollEmployeesIdsListToSendMail;

}
