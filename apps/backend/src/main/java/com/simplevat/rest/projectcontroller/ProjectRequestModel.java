package com.simplevat.rest.projectcontroller;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProjectRequestModel {
	private Integer projectId;
	private String projectName;
	private BigDecimal expenseBudget = BigDecimal.ZERO;
	private BigDecimal revenueBudget = BigDecimal.ZERO;
	private String contractPoNumber;
	private Integer contactId;
	private String vatRegistrationNumber;
	private Integer invoiceLanguageCode;
	private Integer currencyCode;
	private Integer createdBy = 0;
	private LocalDateTime createdDate;
	private Integer lastUpdateBy;
	private LocalDateTime lastUpdateDate;
	private Boolean deleteFlag = Boolean.FALSE;

}
