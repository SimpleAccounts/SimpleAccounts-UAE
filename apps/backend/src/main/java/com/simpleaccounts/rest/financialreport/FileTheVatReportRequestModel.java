package com.simpleaccounts.rest.financialreport;

import java.util.Date;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class FileTheVatReportRequestModel {
    private Date taxFiledOn;
    private String taxablePersonNameInEnglish;
    private String taxablePersonNameInArabic;
    private String taxAgentName;
    private String taxAgencyName;
    private String taxAgencyNumber;
    private String taxAgentApprovalNumber;
    private String vatRegistrationNumber;
    private Integer vatReportFiling;
}
