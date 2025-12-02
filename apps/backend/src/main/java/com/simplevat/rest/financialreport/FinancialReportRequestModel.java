package com.simplevat.rest.financialreport;

import java.io.Serializable;

import com.simplevat.rest.PaginationModel;

import lombok.Data;

@Data
public class FinancialReportRequestModel extends PaginationModel implements Serializable {

	private String startDate;
	private String endDate;

}
