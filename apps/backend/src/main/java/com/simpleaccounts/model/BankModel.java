/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

/**
 *
 * @author Sonu
 */
@Data
public class BankModel implements Serializable {

    private Integer bankAccountId;

    private String bankAccountName;

    private Integer bankAccountCurrency;
    private String bankAccountCurrencySymbol;
    private String bankAccountCurrencyIsoCode;

    private Integer bankAccountStatus;

    private String personalCorporateAccountInd;

    private Boolean isprimaryAccountFlag = Boolean.TRUE;

    private String bankName;

    private String accountNumber;

    private String ifscCode;

    private String swiftCode;

    private BigDecimal openingBalance;

    private BigDecimal currentBalance;

    private Integer bankFeedStatusCode;

    private Integer bankCountry;

    private Integer createdBy = 0;

    private Integer bankAccountType;

    private BigDecimal closingBalance;

    private LocalDateTime openingDate;

    private LocalDateTime lastReconcileDate;
    private BigDecimal actualOpeningBalance;

    private  Integer transactionCount;

    private String newBankName;
}
