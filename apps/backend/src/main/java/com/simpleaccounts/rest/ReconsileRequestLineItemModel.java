package com.simpleaccounts.rest;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReconsileRequestLineItemModel implements Serializable {
	private static final long serialVersionUID = 1L;

	private Integer id;
	private BigDecimal remainingInvoiceAmount;
	private PostingReferenceTypeEnum type;
	private String label;
	private BigDecimal exchangeRate;
	private BigDecimal dueAmount;
	private String invoiceNumber;

}
