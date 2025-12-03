package com.simpleaccounts.rest.CorporateTax.Model;

import lombok.Data;

@Data
public class CorporateTaxDateModel {
    private Boolean isEligibleForCP;
    private String fiscalYear;
    private Integer corporateTaxSettingId;
    private Boolean deleteFlag;
    private Boolean selectedFlag;
}
