package com.simplevat.rest.transactioncategorybalancecontroller;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

import lombok.Data;

@Data
public class TransactioncategoryBalancePersistModel implements Serializable{

	private Integer transactionCategoryBalanceId;
	private Integer transactionCategoryId;
	private Date effectiveDate; // dd/MM/yyyy
	private BigDecimal openingBalance;
}
