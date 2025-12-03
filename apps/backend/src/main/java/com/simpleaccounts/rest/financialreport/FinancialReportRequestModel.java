package com.simpleaccounts.rest.financialreport;

import java.io.Serializable;

import com.simpleaccounts.rest.PaginationModel;

import lombok.Data;

@Data
public class FinancialReportRequestModel extends PaginationModel implements Serializable {

	private String startDate;
	private String endDate;

}
