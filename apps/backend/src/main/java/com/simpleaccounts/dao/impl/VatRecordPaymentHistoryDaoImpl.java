package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.dao.*;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Repository;

@Repository

@RequiredArgsConstructor
public class VatRecordPaymentHistoryDaoImpl extends AbstractDao<Integer, VatRecordPaymentHistory> implements VatRecordPaymentHistoryDao {
    private final DatatableSortingFilterConstant dataTableUtil;

    @Override
    public PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap,
                                                    PaginationModel paginationModel) {
        List<DbFilter> dbFilters = new ArrayList<>();
        filterMap.forEach(
                (productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
                        .condition(productFilter.getCondition()).value(value).build()));

        Integer count =this.getResultCount(dbFilters);
        //To solve pagination issue for search , reset the page No. to 0
        if(count<10 && paginationModel != null) paginationModel.setPageNo(0);
        return new PaginationResponseModel(count,
                this.executeQuery(dbFilters, paginationModel));
    }

}
