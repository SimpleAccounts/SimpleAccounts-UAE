package com.simplevat.rest.transactionparsingcontroller;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.simplevat.criteria.enums.TransactionEnum;

import lombok.Data;

@Data
public class TransactionParsingSettingPersistModel {

	private Long id;
	private String name;
	private String delimiter;
	private Integer skipRows;
	private Integer headerRowNo;
	private Integer endRows;
	private String skipColumns;
	private String textQualifier;
	private Integer dateFormatId;
	private Map<TransactionEnum, Integer> indexMap;
	private String otherDilimiterStr;
	private MultipartFile file;
}
