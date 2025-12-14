package com.simpleaccounts.rest.payroll.model;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PayrollListModel {
	
	public PayrollListModel() {
		// TODO Auto-generated constructor stub
	}
	private Integer id;
	private String payrollDate;
	private String payrollSubject;
	private String payPeriod;
	private Integer employeeCount;
	private String generatedBy;
	private String approvedBy;
	private String status;
	private String runDate;
	private String comment;
	private Boolean deleteFlag = Boolean.FALSE;
	private Boolean isActive;
	private Integer payrollApprover;
	private String  generatedByName;
	private String payrollApproverName;
	private List<Integer> existEmpList;
	private BigDecimal totalAmountPayroll;
	private BigDecimal dueAmountPayroll;

}
