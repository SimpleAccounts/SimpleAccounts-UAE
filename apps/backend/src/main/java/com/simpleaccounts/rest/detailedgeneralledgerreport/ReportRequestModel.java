package com.simpleaccounts.rest.detailedgeneralledgerreport;

import com.simpleaccounts.rest.PaginationModel;
import java.io.Serializable;
import lombok.Data;

@Data
public class ReportRequestModel extends PaginationModel implements Serializable {

	private String startDate;
	private String endDate;
	private Integer chartOfAccountId;
	private String reportBasis;
	private String chartOfAccountCodes;
	private String placeOfSupply;

}
