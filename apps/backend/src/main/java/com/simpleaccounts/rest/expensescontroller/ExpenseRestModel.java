/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.expensescontroller;

import com.simpleaccounts.model.ExpenseItemModel;
import com.simpleaccounts.entity.Contact;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.Data;
import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author daynil
 */
@Data
public class ExpenseRestModel {

    private Integer expenseId;
    private BigDecimal expenseAmount;
    private Date expenseDate;
    private String expenseDescription;
    private String receiptNumber;
    private Integer transactionType;
    private Integer transactionCategory;
    private Integer currency;
    private Integer projectId;
    private String receiptAttachmentPath;
    private String receiptAttachmentDescription;
    private Integer createdBy = 0;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Integer lastUpdatedBy;
    private LocalDateTime lastUpdateDate;
    private boolean deleteFlag = false;
    private MultipartFile attachmentFile;
    private String receiptAttachmentName;
    private String receiptAttachmentContentType;
    private Integer versionNumber = 1;
    private Integer paymentMode;
    private byte[] receiptAttachmentBinary;
    private List<ExpenseItemModel> expenseItems;
    private Contact expenseContact;
    private BigDecimal expenseVATAmount;
    private BigDecimal expenseAmountCompanyCurrency;
    private Integer flagView;
    private Integer userId;
    private Integer companyId;
    private Integer currencyCode;
    private Integer bankAccountId;
    private Integer expenseContactId;
    private Integer paymentId;
    private BigDecimal vat;
    private String payee;
    private String expenseItemsString;

    public void addExpenseItem(@NonNull final ExpenseItemModel expenseItemModel) {
        if (null == this.expenseItems) {
            expenseItems = new ArrayList<>();
        }
        expenseItems.add(expenseItemModel);
    }
}
