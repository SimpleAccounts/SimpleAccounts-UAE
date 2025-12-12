package com.simpleaccounts.rest.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class PayrollEmployeeDto {	
	 public PayrollEmployeeDto() {
		// TODO Auto-generated constructor stub
	}
	Integer id;
	Integer empId;
	String  empName;
	String  empCode;
	BigDecimal lopDay;
	BigDecimal noOfDays;

	BigDecimal grossPay;
	BigDecimal deduction;
	BigDecimal netPay;
//	LocalDateTime joiningDate;
	 
}
