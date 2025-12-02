package com.simplevat.rest.projectcontroller;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectListModel {

	private Integer projectId;
	private String projectName;
	private String vatRegistrationNumber; 
	private BigDecimal expenseBudget;
	private BigDecimal revenueBudget;
	
}
