package com.simpleaccounts.rest.transactionparsingcontroller;

import com.simpleaccounts.criteria.enums.TransactionEnum;
import java.util.Map;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

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
