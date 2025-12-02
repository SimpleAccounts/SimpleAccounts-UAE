package com.simplevat.rest.payroll.dto;

import java.math.BigDecimal;

public interface PayrollEmployeeResultSet {
	
	 Integer getId();
	 Integer getEmpId();
	 String  getEmpFirstName();
	 String  getEmpLastName();
	 String  getEmpCode();
	 BigDecimal getLopDays();
	 BigDecimal getNoOfDays();

}
