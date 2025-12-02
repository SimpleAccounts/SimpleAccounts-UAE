package com.simplevat.utils;

import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.rest.DropdownModel;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This is a cache service class implemented to support the chart of account cache.
 */


public class ChartOfAccountCacheService {


    private static Map<String, List<DropdownModel>> chartOfAccountCacheMap = new HashMap<>();
    private static ChartOfAccountCacheService CHART_OF_ACCOUNT_CONFIG_CACHE = new ChartOfAccountCacheService();

    private ChartOfAccountCacheService() {

    }

    public static ChartOfAccountCacheService getInstance() {
       return CHART_OF_ACCOUNT_CONFIG_CACHE;
    }



    /**
     * This method will get list of all the chart of accounts process them as desired result and store it to the cache.
     * @param list Chart of account list
     * @return chartOfAccountCacheMap
     */
    public Map<String, List<DropdownModel>> loadChartOfAccountCacheMap(List<ChartOfAccount> list)
    {
        if (list != null && !list.isEmpty()) {
            Map<Integer, List<ChartOfAccount>> chartOfAccountIdCategoryListMap = getChartOfAccountIdToListMap(list);

            for (Map.Entry<Integer,List<ChartOfAccount>> entry : chartOfAccountIdCategoryListMap.entrySet())
            {
                String parentCategory = "";
                List<ChartOfAccount> categoryList = entry.getValue();
                List<DropdownModel> dropDownModelList = new ArrayList<>();
                for (ChartOfAccount chartOfAccount : categoryList) {
                    parentCategory = chartOfAccount.getParentChartOfAccount().getChartOfAccountName();
                    dropDownModelList
                            .add(new DropdownModel(chartOfAccount.getChartOfAccountId(), chartOfAccount.getChartOfAccountName()));
                }
                chartOfAccountCacheMap.put(parentCategory, dropDownModelList);
            }
            return chartOfAccountCacheMap;
        }
        else {
            return chartOfAccountCacheMap;
        }
    }

    /**
     * This method will get the chart of account list, process them and return the Map.  Map<Integer, List<ChartOfAccount>>
     *     i.e. Map<parentChartAccountId, List of chartOfAccount></>
     * @param chartOfAccountList
     * @return chartOfAccountIdCategoryListMap
     */
    private Map<Integer, List<ChartOfAccount>> getChartOfAccountIdToListMap(List<ChartOfAccount> chartOfAccountList) {
        Map<Integer, List<ChartOfAccount>> chartOfAccountIdCategoryListMap = new HashMap<>();
        for (ChartOfAccount chartOfAccount : chartOfAccountList) {

            if (chartOfAccount.getParentChartOfAccount() != null) {
                int parentChartOfAccountId =  chartOfAccount.getParentChartOfAccount().getChartOfAccountId();
                List<ChartOfAccount> categoryList = chartOfAccountIdCategoryListMap.get(parentChartOfAccountId);
                if(categoryList == null)
                {
                    categoryList = new ArrayList<>();
                    categoryList.add(chartOfAccount);
                    chartOfAccountIdCategoryListMap.put(parentChartOfAccountId, categoryList);
                }
                else
                {
                    categoryList.add(chartOfAccount);
                }
            }
        }
        return chartOfAccountIdCategoryListMap;
    }

    /**
     * This method returns the chartOfAccount Cache map
     * @return chartOfAccountCacheMap
     */
    public Map<String, List<DropdownModel>> getChartOfAccountCacheMap() {
        return chartOfAccountCacheMap;
    }
}
