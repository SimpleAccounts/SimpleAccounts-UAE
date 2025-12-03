package com.simpleaccounts.rest.invoice.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VatAmountDto {

 public VatAmountDto() {
		// TODO Auto-generated constructor stub
	}
 private Integer id;
 private String date;
 private String Entry;
 private String transactionType;
 private BigDecimal amount;
 private BigDecimal vatAmount;
 private String currency;
	
}
