package com.simplevat.rest.transactionimportcontroller;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class TransactionImportModel {

	private List<Map<String, Object>> importDataMap;
	private Long templateId;
	private Integer bankId;
	private Integer dateFormatId;
	private Integer createdBy = 0;
}
