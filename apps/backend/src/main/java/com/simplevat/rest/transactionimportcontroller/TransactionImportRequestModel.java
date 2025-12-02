package com.simplevat.rest.transactionimportcontroller;

import com.simplevat.constant.ExcellDelimiterEnum;
import com.simplevat.criteria.enums.TransactionEnum;
import lombok.Data;

import java.util.Map;

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
