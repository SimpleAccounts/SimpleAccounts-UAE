/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest;

import java.io.Serializable;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author uday
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostingRequestModel implements Serializable {

	private Integer postingRefId;
	private String postingRefType;
	private Integer postingChartOfAccountId;
	private BigDecimal amount;
	private String comment;
	private String amountInWords;
	private String vatInWords;
	private Boolean isCNWithoutProduct = Boolean.FALSE;
	private Boolean markAsSent = Boolean.FALSE;
	private Boolean sendAgain = Boolean.FALSE;

	public PostingRequestModel(Integer postingRefId) {
		super();
		this.postingRefId = postingRefId;
	}

	public PostingRequestModel(Integer postingRefId,BigDecimal amount) {
		super();
		this.postingRefId = postingRefId;
		this.amount=amount;
	}

}
