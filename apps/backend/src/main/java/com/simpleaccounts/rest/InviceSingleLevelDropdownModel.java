package com.simpleaccounts.rest;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviceSingleLevelDropdownModel {
	private Integer value;
	private String label;
	private BigDecimal amount;
	private PostingReferenceTypeEnum type;
	private Integer currencyCode;
	private String invoiceDate;
	private BigDecimal dueAmount;
	private String invoiceNumber;

	public InviceSingleLevelDropdownModel(Integer value, String label, BigDecimal amount) {
		super();
		this.value = value;
		this.label = label;
		this.amount = amount;
	}

}
