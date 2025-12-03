package com.simpleaccounts.rest.transactionparsingcontroller;

import java.util.Map;

import com.simpleaccounts.criteria.enums.TransactionEnum;
import com.simpleaccounts.constant.ExcellDelimiterEnum;

import lombok.Data;

@Data 
public class TransactionParsingSettingListModel {

	private Long id;
	private String name;
	private ExcellDelimiterEnum delimiter;
	private Integer skipRows;
	private Integer headerRowNo;
	private Integer textQualifier;
	private Integer dateFormatId;
	private Map<TransactionEnum, Integer> IndexMap;
	private String otherDilimiterStr;
	private String skipColumns;
	private Integer endRows;
}
