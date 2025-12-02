package com.simplevat.dao.impl;

import com.simplevat.constant.DatatableSortingFilterConstant;
import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.ProductFilterEnum;
import com.simplevat.constant.dbfilter.VatReportFilterEnum;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.ProductDao;
import com.simplevat.dao.VatReportsDao;
import com.simplevat.entity.Product;
import com.simplevat.entity.ProductLineItem;
import com.simplevat.entity.VatReportFiling;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.Query;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class VatReportDaoImpl extends AbstractDao<Integer, VatReportFiling> implements VatReportsDao {
    @Autowired
    private DatatableSortingFilterConstant dataTableUtil;

    @Override
    public PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap,
                                                    PaginationModel paginationModel) {
        List<DbFilter> dbFilters = new ArrayList<>();
        filterMap.forEach(
                (productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
                        .condition(productFilter.getCondition()).value(value).build()));
//        if (paginationModel != null)
//            paginationModel.setSortingCol(
//                    dataTableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.VAT_REPORT_FILLING));
        Integer count =this.getResultCount(dbFilters);
        //To solve pagination issue for search , reset the page No. to 0
        if(count<10 && paginationModel != null) paginationModel.setPageNo(0);
        return new PaginationResponseModel(count,
                this.executeQuery(dbFilters, paginationModel));
    }

}
