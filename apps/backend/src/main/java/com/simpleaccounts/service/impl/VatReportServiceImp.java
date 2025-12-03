package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ProductDao;
import com.simpleaccounts.dao.VatReportsDao;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.ProductService;
import com.simpleaccounts.service.VatReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;


@Service("VatReportService")
public class VatReportServiceImp extends VatReportService {

    @Autowired
    private VatReportsDao vatReportsDao;

    @Override
    protected Dao<Integer, VatReportFiling> getDao() {
        return vatReportsDao;
    }

    @Override
    public PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap, PaginationModel paginationModel) {
        return vatReportsDao.getVatReportList(filterMap,paginationModel);
    }

}
