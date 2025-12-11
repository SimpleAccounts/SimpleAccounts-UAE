/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.transactioncontroller;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import com.simpleaccounts.model.ExplainedInvoiceListModel;
import com.simpleaccounts.rest.CorporateTax.CorporateTaxModel;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.ReconsileRequestLineItemModel;
import com.simpleaccounts.rest.vatcontroller.VatReportResponseListForBank;
import lombok.Data;
import org.json.JSONArray;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 *
 * @author sonu
 */
@Data
@SuppressWarnings("java:S1948")
public class TransactionPresistModel implements Serializable {
	@JsonIgnore
	private static final String DATE_FORMAT = "dd/MM/yyyy";

	private Integer bankId;
	private Integer transactionId;
	private Integer coaCategoryId;
	private Integer transactionCategoryId;
	private BigDecimal amount;
	private BigDecimal dueAmount;
	private Date date;
	private String description;
	private transient MultipartFile attachmentFile;
	private String reference;
	private String currencyName;
	private String curruncySymbol;
	//for CT
	private CorporateTaxModel corporateTaxModel;

	// EXPENSE
	private Integer vatId;
	private Integer vendorId;
	private Integer customerId;
	private String contactName;
	private Integer expenseCategory;
	private Integer userId;
	private Integer currencyCode;
	private Boolean expenseType;
	private Boolean isReverseChargeEnabled;
	private Boolean exclusiveVat;
	private BigDecimal transactionExpenseAmount;
	private BigDecimal transactionVatAmount;

	// MONEY PAID TO USER
	// MONEY RECEIVED FROM OTHER
	private Integer employeeId;

	// Transfer To
	private Integer reconsileBankId;

	private String explainParamListStr;

	// SALES
	private List<ReconsileRequestLineItemModel> explainParamList;

	private TransactionExplinationStatusEnum explinationStatusEnum;
	
	//for view 
	private String transactionCategoryLabel;

	private Boolean isValidForClosingBalance;

	private Boolean isValidForCurrentBalance;

	private BigDecimal oldTransactionAmount;

	private BigDecimal exchangeRate;

	private transient JSONArray payrollListIds;
	private transient List<DropdownModel>  payrollDropdownList= new ArrayList<>();
	private LocalDateTime date1;

	private Integer explanationLineItemId;
	private Integer explanationId;

	private String explainedInvoiceListString;

	private List<ExplainedInvoiceListModel> explainedInvoiceList;

	private List<VatReportResponseListForBank> vatReportResponseModelList;

	private String explainedVatPaymentListString;

	private String explainedCorporateTaxListString;

	private Integer exchangeGainOrLossId;

	private BigDecimal exchangeGainOrLoss;

	private Boolean isCTNCreated ;


}
