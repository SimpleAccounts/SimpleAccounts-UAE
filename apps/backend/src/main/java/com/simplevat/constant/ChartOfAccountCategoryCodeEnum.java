package com.simplevat.constant;

import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

public enum ChartOfAccountCategoryCodeEnum {
    ACCOUNTS_RECEIVABLE("01-01"),
    BANK("01-02"),
    CASH("01-03"),
    CURRENT_ASSET("01-04"),
    FIXED_ASSET("01-05"),
    OTHER_CURRENT_ASSET("01-06"),
    STOCK("01-07"),
    ACCOUNTS_PAYABLE("02-01"),
    OTHER_CURRENT_LIABILITIES("02-02"),
    OTHER_LIABILITY("02-03"),
    INCOME("03-01"),
    ADMIN_EXPENSE("04-01"),
    COST_OF_GOODS_SOLD("04-02"),
    OTHER_EXPENSE("04-03"),
    EQUITY("05-01");

    @Getter
    private final String code;
    private static Map<String, ChartOfAccountCategoryCodeEnum> chartOfAccountCategoryCodeEnumMap = null;
    static {
       initChartOfAccountCategoryCodeEnumMap();
    }
    private ChartOfAccountCategoryCodeEnum(String  code) {
        this.code = code;
    }

    public static ChartOfAccountCategoryCodeEnum getChartOfAccountCategoryCodeEnum(String code) {
        if ( code == null || code.isEmpty() ) {
            return null;
        }
        if (chartOfAccountCategoryCodeEnumMap == null) {
            initChartOfAccountCategoryCodeEnumMap();
        }
          return chartOfAccountCategoryCodeEnumMap.get(code);
      }

    public static Map <String,ChartOfAccountCategoryCodeEnum> getChartOfAccountCategoryCodeEnumMap() {
        if (chartOfAccountCategoryCodeEnumMap == null) {
            initChartOfAccountCategoryCodeEnumMap();
        }
        return chartOfAccountCategoryCodeEnumMap;
    }
    private  static synchronized  void initChartOfAccountCategoryCodeEnumMap() {
        Map <String,ChartOfAccountCategoryCodeEnum> tempChartOfAccountCategoryCodeEnumMap = new HashMap<>();
        for (ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum : values()) {
            tempChartOfAccountCategoryCodeEnumMap.put(chartOfAccountCategoryCodeEnum.code, chartOfAccountCategoryCodeEnum);
        }
        chartOfAccountCategoryCodeEnumMap = tempChartOfAccountCategoryCodeEnumMap;
    }


}
