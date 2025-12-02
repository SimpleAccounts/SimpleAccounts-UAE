/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.transactioncontroller;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import com.simplevat.constant.TransactionCreationMode;
import com.simplevat.constant.TransactionExplinationStatusEnum;

import lombok.Data;

/**
 * @author Saurabh
 * 
 */
@Data
public class TransactionViewModel implements Serializable {

	private Integer id;
	private List<Integer> explanationIds;
	private String transactionDate;
	private String referenceNo;
	private String transactionTypeName;
	private Double depositeAmount;
	private BigDecimal dueAmount;
	private Double withdrawalAmount;
	private Double runningAmount;
	private Character debitCreditFlag;
	private String description;
	private TransactionExplinationStatusEnum explinationStatusEnum;
	private TransactionCreationMode creationMode;
	private String currencySymbol;
	private String currencyIsoCode;
}
