/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.model;

import com.simpleaccounts.entity.Country;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author admin
 */
@Getter
@Setter
public class BankAccountRestModel {

    private Integer bankAccountId;

    private String bankAccountName;

    private Currency bankAccountCurrency;

    private BankAccountStatus bankAccountStatus;

    private Character personalCorporateAccountInd = 'C';

    private Boolean isprimaryAccountFlag = true;

    private String bankName;

    private String accountNumber;

    private String ifscCode;

    private String swiftCode;

    private BigDecimal openingBalance;

    private BigDecimal currentBalance;

    private Integer bankFeedStatusCode;

    private Country bankCountry;

    private Integer createdBy = 0;

    private LocalDateTime createdDate = LocalDateTime.now();

    private Integer lastUpdatedBy;

    private LocalDateTime lastUpdateDate;

    private Boolean deleteFlag = Boolean.FALSE;

    private Integer versionNumber = 1;

}
