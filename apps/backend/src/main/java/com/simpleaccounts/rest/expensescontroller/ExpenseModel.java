/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.expensescontroller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import com.simpleaccounts.constant.PayMode;

/**
 *
 * @author daynil
 */
@Data
public class ExpenseModel {

	private Integer expenseId;
	private String expenseNumber;
	private BigDecimal expenseAmount;
	private BigDecimal expenseVatAmount;
	private BigDecimal amount;
	private Date expenseDate;
	private String expenseDescription;
	private String receiptNumber;
	private Integer expenseCategory;
	private Integer currencyCode;
	private String currencyName;
	private String currencySymbol;
	private BigDecimal exchangeRate;
	private Integer employeeId;
	private Integer projectId;
	private String receiptAttachmentDescription;
	private MultipartFile attachmentFile;
	private String fileName;
	private Integer fileAttachmentId;
	private String payee;
	private Integer userId;
	private Integer createdBy = 0;
	private LocalDateTime createdDate;
	private Integer lastUpdatedBy;
	private LocalDateTime lastUpdateDate;
	private boolean deleteFlag = false;
	private Boolean exclusiveVat = Boolean.FALSE;
	private Integer versionNumber = 1;
	private String receiptAttachmentPath;
	private Integer vatCategoryId;
	private PayMode payMode;
	private Integer bankAccountId;
	private String transactionCategoryName;
	private String vatCategoryName;
//	private String expenseType;
	private String expenseStatus;
	private Integer taxTreatmentId;
	private Integer placeOfSupplyId;
	private Boolean isReverseChargeEnabled  = Boolean.FALSE;
	private Boolean expenseType = Boolean.FALSE;
	private String delivaryNotes;
	private Boolean isVatClaimable = Boolean.FALSE;
	private String placeOfSupplyName;
}
