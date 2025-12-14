package com.simpleaccounts.rest;

import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

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

	private Integer employeeId;

	// Transafer To
	private Integer bankId;

	// SALES
	private List<ReconsileRequestLineItemModel> invoiceIdList;

	TransactionExplinationStatusEnum explinationStatusEnum;
}
