package com.simplevat.service.impl;

import com.simplevat.constant.dbfilter.ProductFilterEnum;
import com.simplevat.constant.dbfilter.VatReportFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.ProductDao;
import com.simplevat.dao.VatReportsDao;
import com.simplevat.entity.Product;
import com.simplevat.entity.VatReportFiling;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.ProductService;
import com.simplevat.service.VatReportService;
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
