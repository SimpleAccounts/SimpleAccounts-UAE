package com.simpleaccounts.rest.financialreport;

import com.simpleaccounts.rest.PaginationModel;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class FinancialReportRequestModel extends PaginationModel implements Serializable {

	private String startDate;
	private String endDate;

}
