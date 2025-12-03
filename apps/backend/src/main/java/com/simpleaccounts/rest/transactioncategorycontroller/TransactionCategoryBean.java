/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.transactioncategorycontroller;

import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Data;

/**
 *
 * @author Sonu
 */
@Data
public class TransactionCategoryBean implements Serializable{

    private Integer transactionCategoryId;
    private String transactionCategoryName;
    private String transactionCategoryDescription;
    private String transactionCategoryCode;
    private Integer chartOfAccount;
    private Integer parentTransactionCategory;
    private Integer vatCategory;
    private String defaltFlag;
    private Integer orderSequence;
    private Integer createdBy = 0;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Integer lastUpdatedBy;
    private LocalDateTime lastUpdateDate;
    private Boolean deleteFlag = Boolean.FALSE;
    private Integer versionNumber = 1;
}
