package com.simpleaccounts.rest.financialreport;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

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
