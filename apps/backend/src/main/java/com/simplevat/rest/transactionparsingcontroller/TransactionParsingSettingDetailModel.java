package com.simplevat.rest.transactionparsingcontroller;

import java.util.Map;

import com.simplevat.criteria.enums.TransactionEnum;
import com.simplevat.constant.ExcellDelimiterEnum;

import lombok.Data;

@Data
public class TransactionParsingSettingDetailModel {

	private Long id;
	private String name;
	private ExcellDelimiterEnum delimiter;
	private Integer skipRows;
	private Integer headerRowNo;
	private Integer textQualifier;
	private Integer dateFormatId;
	private Map<TransactionEnum, Integer> indexMap;
	private String otherDilimiterStr;
}
