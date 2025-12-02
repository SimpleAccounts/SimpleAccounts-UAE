package com.simplevat.rest;

import java.math.BigDecimal;

import com.simplevat.constant.PostingReferenceTypeEnum;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReconsileRequestLineItemModel {

	private Integer id;
	private BigDecimal remainingInvoiceAmount;
	private PostingReferenceTypeEnum type;
	private String label;
	private BigDecimal exchangeRate;
	private BigDecimal dueAmount;
	private String invoiceNumber;

}
