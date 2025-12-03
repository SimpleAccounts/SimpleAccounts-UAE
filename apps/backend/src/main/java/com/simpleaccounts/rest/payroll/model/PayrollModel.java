package com.simpleaccounts.rest.payroll.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PayrollModel {
	
	private String payrollSubject;
	private String payPeriod;
	private Integer employeeCount;

}
