package com.simpleaccounts.rest.transactionimportcontroller;

import com.simpleaccounts.constant.ExcellDelimiterEnum;
import com.simpleaccounts.criteria.enums.TransactionEnum;
import java.util.Map;
import lombok.Data;

@Data
public class TransactionImportRequestModel {
    String data;
    Integer id;
    private String name;
    private ExcellDelimiterEnum delimiter;
    private Integer skipRows;
    private Integer headerRowNo;
    private Integer textQualifier;
    private Integer dateFormatId;
    private Map<TransactionEnum, Integer> indexMap;
    private String otherDilimiterStr;

}
