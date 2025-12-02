package com.simplevat.rest;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.simplevat.constant.TransactionExplinationStatusEnum;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReconsileRequestModel {

	private String DATE_FORMAT = "dd/MM/yyyy";

	private Integer transactionId;
	private Integer coaCategoryId;
	private Integer transactionCategoryId;
	private BigDecimal amount;
	private String date;
	private String description;
	private MultipartFile attachmentFile;
	private String reference;

	// EXPENSE
	private Integer vatId;
	private Integer vendorId;
	private Integer customerId;

	// MONEY PAID TO USER
	// MONEY RECEIVED FROM OTHER
	private Integer employeeId;

	// Transafer To
	private Integer bankId;

	// SALES
	private List<ReconsileRequestLineItemModel> invoiceIdList;

	TransactionExplinationStatusEnum explinationStatusEnum;
}
